from datetime import datetime, timezone

from sqlalchemy.orm import Session

from database.models import Incident, IncidentEvent


def generate_incident_id(db: Session) -> str:
    """
    Generate the next incident ID in the format INC-001, INC-002, etc.
    """

    last_incident = (
        db.query(Incident)
        .order_by(Incident.id.desc())
        .first()
    )

    if last_incident is None:
        next_number = 1
    else:
        try:
            last_number = int(last_incident.incident_id.split("-")[1])
            next_number = last_number + 1
        except (IndexError, ValueError):
            next_number = last_incident.id + 1

    return f"INC-{next_number:03d}"


def detect_incident(
    db: Session,
    service: str,
    level: str,
    message: str,
    timestamp: datetime
):
    """
    Detect whether a telemetry event should create a new incident.

    For the first version:
    - ERROR and CRITICAL logs are considered failures.
    - If an ACTIVE incident already exists for the service,
      no duplicate incident is created.
    - Otherwise, a new incident is created.
    """

    if level.upper() not in {"ERROR", "CRITICAL"}:
        return None

    existing_incident = (
        db.query(Incident)
        .filter(
            Incident.status == "ACTIVE"
        )
        .filter(
            Incident.affected_services.contains([service])
        )
        .first()
    )

    if existing_incident:
        return existing_incident

    incident_id = generate_incident_id(db)

    incident = Incident(
        incident_id=incident_id,
        title=f"{service} Failure Detected",
        status="ACTIVE",
        severity="CRITICAL" if level.upper() == "CRITICAL" else "HIGH",
        started_at=timestamp,
        ended_at=None,
        root_cause=None,
        confidence=None,
        rca_score=0,
        failure_count=1,
        affected_services=[service],
        evidence=[],
        recommendations=[],
        explanation=None,
        created_at=datetime.now(timezone.utc)
    )

    db.add(incident)
    db.flush()

    event = IncidentEvent(
        incident_id=incident.incident_id,
        event_type="INCIDENT_CREATED",
        service=service,
        message=f"New incident detected for {service}.",
        timestamp=timestamp,
        created_at=datetime.now(timezone.utc)
    )

    db.add(event)
    db.commit()
    db.refresh(incident)

    return incident