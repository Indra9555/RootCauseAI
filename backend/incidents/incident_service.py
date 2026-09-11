from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from database.models import Incident, IncidentEvent
from analysis.log_analysis_service import analyze_logs
from analysis.dependency_graph import (
    get_dependencies,
    get_dependents
)


INCIDENT_WINDOW_MINUTES = 30


# =========================================================
# TIMESTAMP HELPERS
# =========================================================

def parse_timestamp(timestamp):
    """
    Convert timestamp into a timezone-aware datetime.
    """

    if isinstance(timestamp, datetime):
        dt = timestamp
    else:
        dt = datetime.fromisoformat(
            str(timestamp).replace("Z", "+00:00")
        )

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    return dt


# =========================================================
# LOG ACCESS HELPERS
# =========================================================

def get_log_service(log):
    if isinstance(log, dict):
        return log.get("service")

    return getattr(log, "service", None)


def get_log_level(log):
    if isinstance(log, dict):
        return log.get("level")

    return getattr(log, "level", None)


def get_log_message(log):
    if isinstance(log, dict):
        return log.get("message")

    return getattr(log, "message", None)


def get_log_timestamp(log):
    if isinstance(log, dict):
        return log.get("timestamp")

    return getattr(log, "timestamp", None)


# =========================================================
# INCIDENT CORRELATION
# =========================================================

def services_are_related(
    service_a,
    service_b
):
    """
    Determine whether two services can belong to
    the same incident.

    Services are related when:

    1. They are the same service.
    2. service_a depends on service_b.
    3. service_b depends on service_a.
    4. One service is a dependent of the other.
    """

    if not service_a or not service_b:
        return False

    if service_a == service_b:
        return True

    dependencies_a = get_dependencies(
        service_a
    )

    dependencies_b = get_dependencies(
        service_b
    )

    dependents_a = get_dependents(
        service_a
    )

    dependents_b = get_dependents(
        service_b
    )

    if service_b in dependencies_a:
        return True

    if service_a in dependencies_b:
        return True

    if service_b in dependents_a:
        return True

    if service_a in dependents_b:
        return True

    return False


def incident_services_are_related(
    incident,
    incoming_services
):
    """
    Check whether incoming services are related to
    services already belonging to the incident.
    """

    existing_services = (
        incident.affected_services or []
    )

    if not existing_services:
        return False

    for incoming_service in incoming_services:

        for existing_service in existing_services:

            if services_are_related(
                incoming_service,
                existing_service
            ):
                return True

    return False


# =========================================================
# RCA HELPERS
# =========================================================

def calculate_confidence(candidates):

    if not candidates:
        return "low"

    if len(candidates) == 1:
        return "high"

    first_score = candidates[0].get(
        "score",
        0
    )

    second_score = candidates[1].get(
        "score",
        0
    )

    if first_score >= second_score + 3:
        return "high"

    if first_score > second_score:
        return "medium"

    return "low"


def build_incident_data(logs):
    """
    Analyze only logs belonging to one incident.
    """

    analysis = analyze_logs(logs)

    candidates = analysis.get(
        "candidates",
        []
    )

    if not candidates:
        return None

    root_cause_candidate = candidates[0]

    root_cause = root_cause_candidate.get(
        "service",
        "unknown"
    )

    rca_score = root_cause_candidate.get(
        "score",
        0
    )

    confidence = calculate_confidence(
        candidates
    )

    # -----------------------------------------------------
    # FAILURE COUNT
    # -----------------------------------------------------

    failure_count = len(
        [
            log
            for log in logs
            if str(
                get_log_level(log) or ""
            ).upper()
            in ["ERROR", "CRITICAL"]
        ]
    )

    # -----------------------------------------------------
    # AFFECTED SERVICES
    # -----------------------------------------------------

    affected_services = sorted(
        list(
            set(
                get_log_service(log)
                for log in logs
                if get_log_service(log)
            )
        )
    )

    # -----------------------------------------------------
    # TIMESTAMPS
    # -----------------------------------------------------

    timestamps = [
        parse_timestamp(
            get_log_timestamp(log)
        )
        for log in logs
        if get_log_timestamp(log)
    ]

    started_at = (
        min(timestamps)
        if timestamps
        else datetime.now(timezone.utc)
    )

    # -----------------------------------------------------
    # EVIDENCE
    # -----------------------------------------------------

    evidence = []

    evidence.append(
        f"{root_cause} has "
        f"{failure_count} detected failure(s)."
    )

    if len(logs) >= 2:

        evidence.append(
            f"{root_cause} is associated with multiple "
            f"failure events in the incident window."
        )

    # -----------------------------------------------------
    # RECOMMENDATIONS
    # -----------------------------------------------------

    recommendations = [
        f"Investigate {root_cause}",
        (
            f"Check the health and availability of "
            f"{root_cause} because it is a potential "
            f"upstream dependency."
        )
    ]

    # -----------------------------------------------------
    # EXPLANATION
    # -----------------------------------------------------

    explanation = (
        f"{root_cause} is the strongest root-cause "
        f"candidate after combining failure, temporal, "
        f"correlation, and dependency evidence. "
        f"The final RCA score is {rca_score}."
    )

    return {
        "root_cause": root_cause,
        "confidence": confidence,
        "rca_score": rca_score,
        "failure_count": failure_count,
        "affected_services": affected_services,
        "evidence": evidence,
        "recommendations": recommendations,
        "explanation": explanation,
        "started_at": started_at
    }


# =========================================================
# FAILURE LOG HELPERS
# =========================================================

def get_failure_logs(logs):

    return [
        log
        for log in logs
        if str(
            get_log_level(log) or ""
        ).upper()
        in ["ERROR", "CRITICAL"]
    ]


def get_latest_failure_time(logs):

    failure_logs = get_failure_logs(logs)

    timestamps = [
        parse_timestamp(
            get_log_timestamp(log)
        )
        for log in failure_logs
        if get_log_timestamp(log)
    ]

    if not timestamps:
        return None

    return max(timestamps)


# =========================================================
# INCIDENT EVENT HELPERS
# =========================================================

def create_incident_event(
    db: Session,
    incident_id: str,
    event_type: str,
    timestamp,
    service: str | None = None,
    message: str | None = None
):

    event = IncidentEvent(
        incident_id=incident_id,
        event_type=event_type,
        service=service,
        message=message,
        timestamp=parse_timestamp(timestamp)
    )

    db.add(event)

    return event


# =========================================================
# FAILURE EVENT DUPLICATE CHECK
# =========================================================

def failure_event_exists(
    db: Session,
    incident_id: str,
    timestamp,
    service,
    message
):

    event_timestamp = parse_timestamp(
        timestamp
    )

    existing_event = (
        db.query(IncidentEvent)
        .filter(
            IncidentEvent.incident_id == incident_id,
            IncidentEvent.event_type == "FAILURE_DETECTED",
            IncidentEvent.timestamp == event_timestamp,
            IncidentEvent.service == service,
            IncidentEvent.message == message
        )
        .first()
    )

    return existing_event is not None


# =========================================================
# CREATE FAILURE EVENTS
# =========================================================

def create_failure_events(
    db: Session,
    incident_id: str,
    logs
):

    for log in logs:

        timestamp = get_log_timestamp(log)

        if not timestamp:
            continue

        service = get_log_service(log)
        message = get_log_message(log)

        if failure_event_exists(
            db=db,
            incident_id=incident_id,
            timestamp=timestamp,
            service=service,
            message=message
        ):
            continue

        create_incident_event(
            db=db,
            incident_id=incident_id,
            event_type="FAILURE_DETECTED",
            timestamp=timestamp,
            service=service,
            message=message
        )


# =========================================================
# LATEST FAILURE EVENT
# =========================================================

def get_latest_failure_event(
    db: Session,
    incident_id: str
):

    return (
        db.query(IncidentEvent)
        .filter(
            IncidentEvent.incident_id == incident_id,
            IncidentEvent.event_type == "FAILURE_DETECTED"
        )
        .order_by(
            IncidentEvent.timestamp.desc(),
            IncidentEvent.id.desc()
        )
        .first()
    )


# =========================================================
# RCA EVENT DUPLICATE CHECK
# =========================================================

def rca_event_exists(
    db: Session,
    incident_id: str,
    timestamp,
    service,
    message
):

    event_timestamp = parse_timestamp(
        timestamp
    )

    existing_event = (
        db.query(IncidentEvent)
        .filter(
            IncidentEvent.incident_id == incident_id,
            IncidentEvent.event_type == "RCA_UPDATED",
            IncidentEvent.timestamp == event_timestamp,
            IncidentEvent.service == service,
            IncidentEvent.message == message
        )
        .first()
    )

    return existing_event is not None


# =========================================================
# CREATE RCA EVENT
# =========================================================

def create_rca_event(
    db: Session,
    incident_id: str,
    incident_data: dict,
    timestamp
):

    message = (
        f"Root cause: "
        f"{incident_data['root_cause']} | "
        f"Confidence: "
        f"{incident_data['confidence']} | "
        f"RCA Score: "
        f"{incident_data['rca_score']}"
    )

    service = incident_data[
        "root_cause"
    ]

    if rca_event_exists(
        db=db,
        incident_id=incident_id,
        timestamp=timestamp,
        service=service,
        message=message
    ):
        return

    create_incident_event(
        db=db,
        incident_id=incident_id,
        event_type="RCA_UPDATED",
        timestamp=timestamp,
        service=service,
        message=message
    )


# =========================================================
# RESOLVE STALE INCIDENTS
# =========================================================

def resolve_stale_incidents(
    db: Session,
    reference_time
):

    reference_time = parse_timestamp(
        reference_time
    )

    active_incidents = (
        db.query(Incident)
        .filter(
            Incident.status == "ACTIVE"
        )
        .all()
    )

    resolved_incidents = []

    for incident in active_incidents:

        latest_failure_event = (
            get_latest_failure_event(
                db=db,
                incident_id=incident.incident_id
            )
        )

        if not latest_failure_event:
            continue

        latest_failure = parse_timestamp(
            latest_failure_event.timestamp
        )

        inactivity_duration = (
            reference_time - latest_failure
        )

        if inactivity_duration > timedelta(
            minutes=INCIDENT_WINDOW_MINUTES
        ):

            incident.status = "RESOLVED"

            incident.ended_at = latest_failure

            create_incident_event(
                db=db,
                incident_id=incident.incident_id,
                event_type="INCIDENT_RESOLVED",
                timestamp=reference_time,
                service=incident.root_cause,
                message=(
                    f"Incident resolved after more than "
                    f"{INCIDENT_WINDOW_MINUTES} minutes "
                    f"without a new failure. "
                    f"Last failure occurred at "
                    f"{latest_failure.isoformat()}."
                )
            )

            resolved_incidents.append(
                incident.incident_id
            )

    db.commit()

    return resolved_incidents


# =========================================================
# FIND RELATED ACTIVE INCIDENT
# =========================================================

def find_related_active_incident(
    db: Session,
    incoming_services,
    latest_failure_time
):
    """
    Search ALL active incidents and return the most recent
    incident that is actually related to the incoming failure.
    """

    active_incidents = (
        db.query(Incident)
        .filter(
            Incident.status == "ACTIVE"
        )
        .all()
    )

    matching_incidents = []

    for incident in active_incidents:

        latest_failure_event = (
            get_latest_failure_event(
                db=db,
                incident_id=incident.incident_id
            )
        )

        if not latest_failure_event:
            continue

        existing_latest_failure = parse_timestamp(
            latest_failure_event.timestamp
        )

        time_since_failure = (
            latest_failure_time
            - existing_latest_failure
        )

        # Ignore future/out-of-order failures.
        if time_since_failure < timedelta(0):
            continue

        if time_since_failure > timedelta(
            minutes=INCIDENT_WINDOW_MINUTES
        ):
            continue

        if not incident_services_are_related(
            incident,
            incoming_services
        ):
            continue

        matching_incidents.append(
            (
                existing_latest_failure,
                incident
            )
        )

    if not matching_incidents:
        return None

    # Most recently active related incident wins.
    matching_incidents.sort(
        key=lambda item: item[0],
        reverse=True
    )

    return matching_incidents[0][1]


# =========================================================
# GET OR CREATE INCIDENT
# =========================================================

def get_or_create_incident(
    db: Session,
    logs
):

    if not logs:
        return None

    # -----------------------------------------------------
    # SORT LOGS
    # -----------------------------------------------------

    sorted_logs = sorted(
        logs,
        key=lambda log: parse_timestamp(
            get_log_timestamp(log)
        )
    )

    # -----------------------------------------------------
    # FAILURE LOGS
    # -----------------------------------------------------

    failure_logs = get_failure_logs(
        sorted_logs
    )

    if not failure_logs:
        return None

    # -----------------------------------------------------
    # IMPORTANT:
    # THE INCOMING LOG IS THE LATEST FAILURE
    # -----------------------------------------------------

    latest_failure_time = get_latest_failure_time(
        failure_logs
    )

    if latest_failure_time is None:
        return None

    # -----------------------------------------------------
    # RESOLVE STALE INCIDENTS
    # -----------------------------------------------------

    resolve_stale_incidents(
        db=db,
        reference_time=latest_failure_time
    )

    # -----------------------------------------------------
    # REFRESH SESSION
    # -----------------------------------------------------

    db.expire_all()

    # -----------------------------------------------------
    # IDENTIFY INCOMING SERVICES
    #
    # IMPORTANT:
    # We use the newest failure logs to determine what
    # service(s) actually triggered this processing.
    # -----------------------------------------------------

    latest_failure_logs = [
        log
        for log in failure_logs
        if parse_timestamp(
            get_log_timestamp(log)
        ) == latest_failure_time
    ]

    incoming_services = sorted(
        list(
            set(
                get_log_service(log)
                for log in latest_failure_logs
                if get_log_service(log)
            )
        )
    )

    if not incoming_services:
        return None

    # =====================================================
    # FIND RELATED EXISTING INCIDENT
    # =====================================================

    active_incident = find_related_active_incident(
        db=db,
        incoming_services=incoming_services,
        latest_failure_time=latest_failure_time
    )

    # =====================================================
    # UPDATE EXISTING RELATED INCIDENT
    # =====================================================

    if active_incident:

        latest_failure_event = (
            get_latest_failure_event(
                db=db,
                incident_id=active_incident.incident_id
            )
        )

        if latest_failure_event:

            existing_latest_failure = parse_timestamp(
                latest_failure_event.timestamp
            )

            # -------------------------------------------------
            # ONLY TAKE LOGS THAT BELONG TO THIS INCIDENT
            #
            # We do NOT use the global 30-minute window.
            # We walk backwards from the incoming failure and
            # keep only services related to the incident.
            # -------------------------------------------------

            incident_start_time = (
                existing_latest_failure
            )

            incident_logs = []

            existing_services = set(
                active_incident.affected_services or []
            )

            for log in sorted(
                failure_logs,
                key=lambda item: parse_timestamp(
                    get_log_timestamp(item)
                )
            ):

                log_time = parse_timestamp(
                    get_log_timestamp(log)
                )

                if log_time > latest_failure_time:
                    continue

                if log_time < (
                    latest_failure_time
                    - timedelta(
                        minutes=INCIDENT_WINDOW_MINUTES
                    )
                ):
                    continue

                service = get_log_service(log)

                if not service:
                    continue

                related_to_incident = False

                for existing_service in existing_services:

                    if services_are_related(
                        service,
                        existing_service
                    ):
                        related_to_incident = True
                        break

                # Incoming service itself is always allowed.
                if service in incoming_services:
                    related_to_incident = True

                if related_to_incident:
                    incident_logs.append(log)

            # Always include the incoming failure.
            for log in latest_failure_logs:

                if log not in incident_logs:
                    incident_logs.append(log)

            # Sort again after filtering.
            incident_logs.sort(
                key=lambda item: parse_timestamp(
                    get_log_timestamp(item)
                )
            )

            # -------------------------------------------------
            # RCA ONLY FOR THIS INCIDENT
            # -------------------------------------------------

            incident_data = build_incident_data(
                incident_logs
            )

            if not incident_data:
                return None

            # -------------------------------------------------
            # UPDATE INCIDENT
            # -------------------------------------------------

            active_incident.root_cause = (
                incident_data["root_cause"]
            )

            active_incident.confidence = (
                incident_data["confidence"]
            )

            active_incident.rca_score = (
                incident_data["rca_score"]
            )

            active_incident.failure_count = (
                incident_data["failure_count"]
            )

            active_incident.affected_services = (
                incident_data["affected_services"]
            )

            active_incident.evidence = (
                incident_data["evidence"]
            )

            active_incident.recommendations = (
                incident_data["recommendations"]
            )

            active_incident.explanation = (
                incident_data["explanation"]
            )

            # -------------------------------------------------
            # NEW FAILURE EVENTS
            # -------------------------------------------------

            new_failure_logs = [
                log
                for log in latest_failure_logs
                if parse_timestamp(
                    get_log_timestamp(log)
                ) > existing_latest_failure
            ]

            create_failure_events(
                db=db,
                incident_id=(
                    active_incident.incident_id
                ),
                logs=new_failure_logs
            )

            # -------------------------------------------------
            # RCA EVENT
            # -------------------------------------------------

            create_rca_event(
                db=db,
                incident_id=(
                    active_incident.incident_id
                ),
                incident_data=incident_data,
                timestamp=latest_failure_time
            )

            db.commit()

            db.refresh(
                active_incident
            )

            return active_incident

    # =====================================================
    # CREATE NEW INCIDENT
    #
    # IMPORTANT:
    # A NEW incident contains ONLY the incoming failure
    # cluster, not unrelated services from the global window.
    # =====================================================

    new_incident_logs = list(
        latest_failure_logs
    )

    # -----------------------------------------------------
    # BUILD RCA FOR NEW INCIDENT
    # -----------------------------------------------------

    incident_data = build_incident_data(
        new_incident_logs
    )

    if not incident_data:
        return None

    # -----------------------------------------------------
    # GENERATE INCIDENT ID
    # -----------------------------------------------------

    existing_count = (
        db.query(Incident).count()
    )

    incident_id = (
        f"INC-{existing_count + 1:03d}"
    )

    # -----------------------------------------------------
    # CREATE INCIDENT
    # -----------------------------------------------------

    new_incident = Incident(
        incident_id=incident_id,
        title=(
            f"{incident_data['root_cause']} "
            f"Failure Detected"
        ),
        status="ACTIVE",
        severity="HIGH",
        started_at=incident_data["started_at"],
        ended_at=None,
        root_cause=incident_data["root_cause"],
        confidence=incident_data["confidence"],
        rca_score=incident_data["rca_score"],
        failure_count=incident_data["failure_count"],
        affected_services=(
            incident_data["affected_services"]
        ),
        evidence=incident_data["evidence"],
        recommendations=(
            incident_data["recommendations"]
        ),
        explanation=incident_data["explanation"]
    )

    db.add(new_incident)

    db.flush()

    # -----------------------------------------------------
    # INCIDENT CREATED EVENT
    # -----------------------------------------------------

    create_incident_event(
        db=db,
        incident_id=incident_id,
        event_type="INCIDENT_CREATED",
        timestamp=incident_data["started_at"],
        service=incident_data["root_cause"],
        message=(
            f"New incident detected for "
            f"{incident_data['root_cause']}."
        )
    )

    # -----------------------------------------------------
    # FAILURE EVENTS
    # -----------------------------------------------------

    create_failure_events(
        db=db,
        incident_id=incident_id,
        logs=new_incident_logs
    )

    # -----------------------------------------------------
    # RCA EVENT
    # -----------------------------------------------------

    create_rca_event(
        db=db,
        incident_id=incident_id,
        incident_data=incident_data,
        timestamp=latest_failure_time
    )

    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    db.commit()

    db.refresh(
        new_incident
    )

    return new_incident