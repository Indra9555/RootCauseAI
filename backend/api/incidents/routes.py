from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from database.models import Incident, IncidentEvent


router = APIRouter(
    prefix="/api/incidents",
    tags=["Incidents"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# GET ALL INCIDENTS
# =========================================================

@router.get("")
def get_incidents(
    db: Session = Depends(get_db)
):

    incidents = (
        db.query(Incident)
        .order_by(
            Incident.created_at.desc()
        )
        .all()
    )

    return [
        {
            "incident_id": incident.incident_id,
            "title": incident.title,
            "status": incident.status,
            "severity": incident.severity,
            "started_at": incident.started_at,
            "ended_at": incident.ended_at,
            "root_cause": incident.root_cause,
            "confidence": incident.confidence,
            "rca_score": incident.rca_score,
            "failure_count": incident.failure_count,
            "affected_services": incident.affected_services,
            "evidence": incident.evidence,
            "recommendations": incident.recommendations,
            "explanation": incident.explanation,
            "created_at": incident.created_at
        }
        for incident in incidents
    ]


# =========================================================
# GET SINGLE INCIDENT
# =========================================================

@router.get("/{incident_id}")
def get_incident(
    incident_id: str,
    db: Session = Depends(get_db)
):

    incident = (
        db.query(Incident)
        .filter(
            Incident.incident_id == incident_id
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return {
        "incident_id": incident.incident_id,
        "title": incident.title,
        "status": incident.status,
        "severity": incident.severity,
        "started_at": incident.started_at,
        "ended_at": incident.ended_at,
        "root_cause": incident.root_cause,
        "confidence": incident.confidence,
        "rca_score": incident.rca_score,
        "failure_count": incident.failure_count,
        "affected_services": incident.affected_services,
        "evidence": incident.evidence,
        "recommendations": incident.recommendations,
        "explanation": incident.explanation,
        "created_at": incident.created_at
    }


# =========================================================
# GET INCIDENT TIMELINE / EVENTS
# =========================================================

@router.get("/{incident_id}/events")
def get_incident_events(
    incident_id: str,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------
    # CHECK INCIDENT EXISTS
    # -----------------------------------------------

    incident = (
        db.query(Incident)
        .filter(
            Incident.incident_id == incident_id
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    # -----------------------------------------------
    # GET EVENTS
    # -----------------------------------------------

    events = (
        db.query(IncidentEvent)
        .filter(
            IncidentEvent.incident_id == incident_id
        )
        .order_by(
            IncidentEvent.timestamp.asc(),
            IncidentEvent.id.asc()
        )
        .all()
    )

    # -----------------------------------------------
    # RESPONSE
    # -----------------------------------------------

    return [
        {
            "id": event.id,
            "incident_id": event.incident_id,
            "event_type": event.event_type,
            "service": event.service,
            "message": event.message,
            "timestamp": event.timestamp,
            "created_at": event.created_at
        }
        for event in events
    ]