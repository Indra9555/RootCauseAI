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
        dt = dt.replace(
            tzinfo=timezone.utc
        )

    return dt


# =========================================================
# LOG ACCESS HELPERS
# =========================================================

def get_log_service(log):
    if isinstance(log, dict):
        return log.get("service")

    return getattr(
        log,
        "service",
        None
    )


def get_log_level(log):
    if isinstance(log, dict):
        return log.get("level")

    return getattr(
        log,
        "level",
        None
    )


def get_log_message(log):
    if isinstance(log, dict):
        return log.get("message")

    return getattr(
        log,
        "message",
        None
    )


def get_log_timestamp(log):
    if isinstance(log, dict):
        return log.get("timestamp")

    return getattr(
        log,
        "timestamp",
        None
    )


# =========================================================
# INCIDENT CORRELATION
# =========================================================

def services_are_related(
    service_a,
    service_b
):
    """
    Determine whether two services can belong
    to the same incident.
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
    Check whether incoming services are related
    to services already affected by an incident.
    """

    existing_services = (
        incident.affected_services
        or []
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
# CANONICAL RCA
# =========================================================

def build_incident_data(logs):
    """
    Build incident data using the canonical RootCauseAI
    RCA engine.

    analyze_logs() is the single source of truth for:

    - root cause
    - confidence
    - RCA score
    - reasoning
    - evidence
    - recommendations
    """

    if not logs:
        return None

    analysis = analyze_logs(
        logs
    )

    candidates = analysis.get(
        "candidates",
        []
    )

    if not candidates:
        return None

    rca = analysis.get(
        "root_cause_explanation",
        {}
    )

    root_cause = rca.get(
        "root_cause"
    )

    if not root_cause:
        root_cause = candidates[0].get(
            "service",
            "unknown"
        )

    confidence = rca.get(
        "confidence",
        "low"
    )

    rca_score = rca.get(
        "rca_score",
        candidates[0].get(
            "score",
            0
        )
    )

    evidence = rca.get(
        "evidence",
        []
    )

    recommendations = rca.get(
        "recommendations",
        []
    )

    reason = rca.get(
        "reason",
        ""
    )

    failure_count = len(
        [
            log
            for log in logs
            if str(
                get_log_level(log) or ""
            ).upper().strip()
            in ("ERROR", "CRITICAL")
        ]
    )

    affected_services = sorted(
        list(
            set(
                get_log_service(log)
                for log in logs
                if get_log_service(log)
            )
        )
    )

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

    if not evidence:

        evidence = [
            f"{root_cause} is the top-ranked "
            "root-cause candidate."
        ]

    if not recommendations:

        recommendations = [
            f"Investigate {root_cause}.",
            (
                f"Check the health and availability "
                f"of {root_cause}."
            )
        ]

    explanation = reason

    if not explanation:

        explanation = (
            f"{root_cause} is the strongest "
            "root-cause candidate."
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
        ).upper().strip()
        in ("ERROR", "CRITICAL")
    ]


def get_latest_failure_time(logs):

    failure_logs = get_failure_logs(
        logs
    )

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
# INCIDENT WINDOW
# =========================================================

def get_incident_window_logs(
    logs,
    trigger_time,
    affected_services=None
):
    """
    Return failure logs that belong to the incident
    window ending at the trigger time.

    IMPORTANT:

    Logs after the trigger time are NEVER included.

    This prevents a later telemetry event from
    influencing the current incident.
    """

    trigger_time = parse_timestamp(
        trigger_time
    )

    window_start = (
        trigger_time
        - timedelta(
            minutes=INCIDENT_WINDOW_MINUTES
        )
    )

    affected_services = set(
        affected_services or []
    )

    selected_logs = []

    for log in logs:

        timestamp = get_log_timestamp(
            log
        )

        if not timestamp:
            continue

        log_time = parse_timestamp(
            timestamp
        )

        if log_time < window_start:
            continue

        if log_time > trigger_time:
            continue

        level = str(
            get_log_level(log) or ""
        ).upper().strip()

        if level not in (
            "ERROR",
            "CRITICAL"
        ):
            continue

        service = get_log_service(
            log
        )

        if not service:
            continue

        if affected_services:

            related = False

            for existing_service in affected_services:

                if services_are_related(
                    service,
                    existing_service
                ):
                    related = True
                    break

            if not related:
                continue

        selected_logs.append(
            log
        )

    selected_logs.sort(
        key=lambda log: parse_timestamp(
            get_log_timestamp(log)
        )
    )

    return selected_logs


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
        timestamp=parse_timestamp(
            timestamp
        )
    )

    db.add(
        event
    )

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

        timestamp = get_log_timestamp(
            log
        )

        if not timestamp:
            continue

        service = get_log_service(
            log
        )

        message = get_log_message(
            log
        )

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
            reference_time
            - latest_failure
        )

        if inactivity_duration > timedelta(
            minutes=INCIDENT_WINDOW_MINUTES
        ):

            incident.status = "RESOLVED"

            incident.ended_at = (
                latest_failure
            )

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
    trigger_time
):
    """
    Search active incidents and return the most recent
    incident related to the incoming failure.

    The comparison is based on the NEW trigger time.
    """

    trigger_time = parse_timestamp(
        trigger_time
    )

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

        existing_latest_failure = (
            parse_timestamp(
                latest_failure_event.timestamp
            )
        )

        time_since_failure = (
            trigger_time
            - existing_latest_failure
        )

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
    logs,
    trigger_log
):
    """
    Get or create an incident using the newly ingested
    telemetry log as the trigger.

    IMPORTANT:

    The trigger_log determines:

    - which failure started processing
    - incident time
    - stale incident resolution
    - related active incident lookup

    Historical logs are used only as supporting context.
    """

    if not logs:
        return None

    if not trigger_log:
        return None

    trigger_timestamp = get_log_timestamp(
        trigger_log
    )

    trigger_service = get_log_service(
        trigger_log
    )

    trigger_level = str(
        get_log_level(trigger_log) or ""
    ).upper().strip()

    if not trigger_timestamp:
        return None

    if not trigger_service:
        return None

    if trigger_level not in (
        "ERROR",
        "CRITICAL"
    ):
        return None

    trigger_time = parse_timestamp(
        trigger_timestamp
    )

    # =====================================================
    # RESOLVE OLD INCIDENTS
    # =====================================================

    resolve_stale_incidents(
        db=db,
        reference_time=trigger_time
    )

    db.expire_all()

    # =====================================================
    # FIND RELATED ACTIVE INCIDENT
    # =====================================================

    incoming_services = [
        trigger_service
    ]

    active_incident = (
        find_related_active_incident(
            db=db,
            incoming_services=incoming_services,
            trigger_time=trigger_time
        )
    )

    # =====================================================
    # UPDATE EXISTING INCIDENT
    # =====================================================

    if active_incident:

        existing_services = set(
            active_incident.affected_services
            or []
        )

        existing_services.add(
            trigger_service
        )

        incident_logs = (
            get_incident_window_logs(
                logs=logs,
                trigger_time=trigger_time,
                affected_services=existing_services
            )
        )

        # Always include the trigger log.
        if trigger_log not in incident_logs:
            incident_logs.append(
                trigger_log
            )

        incident_logs.sort(
            key=lambda log: parse_timestamp(
                get_log_timestamp(log)
            )
        )

        incident_data = build_incident_data(
            incident_logs
        )

        if not incident_data:
            return None

        latest_failure_event = (
            get_latest_failure_event(
                db=db,
                incident_id=(
                    active_incident.incident_id
                )
            )
        )

        existing_latest_failure = None

        if latest_failure_event:

            existing_latest_failure = (
                parse_timestamp(
                    latest_failure_event.timestamp
                )
            )

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

        active_incident.title = (
            f"{incident_data['root_cause']} "
            f"Failure Detected"
        )

        # Only create failure events that are newer
        # than the previous incident failure.
        new_failure_logs = []

        for log in incident_logs:

            log_time = parse_timestamp(
                get_log_timestamp(log)
            )

            if existing_latest_failure is not None:

                if log_time <= existing_latest_failure:
                    continue

            new_failure_logs.append(
                log
            )

        create_failure_events(
            db=db,
            incident_id=(
                active_incident.incident_id
            ),
            logs=new_failure_logs
        )

        create_rca_event(
            db=db,
            incident_id=(
                active_incident.incident_id
            ),
            incident_data=incident_data,
            timestamp=trigger_time
        )

        db.commit()

        db.refresh(
            active_incident
        )

        return active_incident

    # =====================================================
    # CREATE NEW INCIDENT
    # =====================================================

    new_incident_logs = (
        get_incident_window_logs(
            logs=logs,
            trigger_time=trigger_time,
            affected_services={
                trigger_service
            }
        )
    )

    # Always include the trigger.
    if trigger_log not in new_incident_logs:

        new_incident_logs.append(
            trigger_log
        )

    new_incident_logs.sort(
        key=lambda log: parse_timestamp(
            get_log_timestamp(log)
        )
    )

    incident_data = build_incident_data(
        new_incident_logs
    )

    if not incident_data:
        return None

    existing_count = (
        db.query(Incident).count()
    )

    incident_id = (
        f"INC-{existing_count + 1:03d}"
    )

    new_incident = Incident(
        incident_id=incident_id,

        title=(
            f"{incident_data['root_cause']} "
            f"Failure Detected"
        ),

        status="ACTIVE",

        severity="HIGH",

        started_at=(
            incident_data["started_at"]
        ),

        ended_at=None,

        root_cause=(
            incident_data["root_cause"]
        ),

        confidence=(
            incident_data["confidence"]
        ),

        rca_score=(
            incident_data["rca_score"]
        ),

        failure_count=(
            incident_data["failure_count"]
        ),

        affected_services=(
            incident_data["affected_services"]
        ),

        evidence=(
            incident_data["evidence"]
        ),

        recommendations=(
            incident_data["recommendations"]
        ),

        explanation=(
            incident_data["explanation"]
        )
    )

    db.add(
        new_incident
    )

    db.flush()

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

    create_failure_events(
        db=db,
        incident_id=incident_id,
        logs=new_incident_logs
    )

    create_rca_event(
        db=db,
        incident_id=incident_id,
        incident_data=incident_data,
        timestamp=trigger_time
    )

    db.commit()

    db.refresh(
        new_incident
    )

    return new_incident