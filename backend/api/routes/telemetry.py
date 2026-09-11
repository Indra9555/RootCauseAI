from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Log
from schemas.telemetry import LogEntry

from analysis.log_classifier import classify_log_level
from analysis.log_analysis_service import analyze_logs
from incidents.incident_service import get_or_create_incident


router = APIRouter(
    prefix="/api/telemetry",
    tags=["Telemetry"]
)


# =========================================================
# INGEST LOG + AUTOMATIC INCIDENT GENERATION
# =========================================================

@router.post("/logs")
def ingest_log(
    log: LogEntry,
    db: Session = Depends(get_db)
):
    """
    Store incoming telemetry and automatically process
    incident detection and RCA.

    IMPORTANT:

    The newly ingested log is passed explicitly as the
    incident trigger.

    Historical logs remain available as RCA context,
    but they cannot replace the current trigger event.
    """

    severity = classify_log_level(
        log.level
    )

    db_log = Log(
        service=log.service,
        level=log.level,
        message=log.message,
        timestamp=log.timestamp
    )

    db.add(
        db_log
    )

    db.commit()

    db.refresh(
        db_log
    )

    # =====================================================
    # LOAD HISTORICAL TELEMETRY
    # =====================================================

    logs = (
        db.query(Log)
        .order_by(
            Log.timestamp.asc()
        )
        .all()
    )

    # =====================================================
    # AUTOMATIC INCIDENT PROCESSING
    # =====================================================

    incident = get_or_create_incident(
        db=db,
        logs=logs,
        trigger_log=db_log
    )

    if incident:

        analysis_summary = {
            "root_cause": incident.root_cause,
            "confidence": incident.confidence,
            "rca_score": incident.rca_score
        }

        incident_summary = {
            "incident_id": incident.incident_id,
            "status": incident.status,
            "root_cause": incident.root_cause,
            "confidence": incident.confidence,
            "rca_score": incident.rca_score,
            "failure_count": incident.failure_count
        }

    else:

        analysis_summary = {
            "root_cause": None,
            "confidence": "low",
            "rca_score": 0
        }

        incident_summary = None

    return {
        "status": "stored",
        "message": "Log successfully stored",

        "log": {
            "id": db_log.id,
            "service": db_log.service,
            "level": db_log.level,
            "severity": severity,
            "message": db_log.message,
            "timestamp": db_log.timestamp
        },

        "analysis": analysis_summary,

        "incident": incident_summary
    }


# =========================================================
# GET ALL LOGS
# =========================================================

@router.get("/logs")
def get_telemetry_logs(
    db: Session = Depends(get_db)
):
    """
    Return all stored telemetry logs.
    """

    logs = (
        db.query(Log)
        .order_by(
            Log.timestamp.asc()
        )
        .all()
    )

    return [
        {
            "id": log.id,
            "service": log.service,
            "level": log.level,
            "message": log.message,
            "timestamp": log.timestamp
        }
        for log in logs
    ]


# =========================================================
# RUN COMPLETE CANONICAL ANALYSIS
# =========================================================

@router.get("/analysis")
def get_log_analysis(
    db: Session = Depends(get_db)
):
    """
    Run the canonical RCA engine against all telemetry.

    All RCA scoring and explanation comes from
    analyze_logs().
    """

    logs = (
        db.query(Log)
        .order_by(
            Log.timestamp.asc()
        )
        .all()
    )

    result = analyze_logs(
        logs
    )

    return {
        "patterns": result.get(
            "patterns",
            {}
        ),

        "temporal_analysis": result.get(
            "temporal_analysis",
            []
        ),

        "correlations": result.get(
            "correlations",
            {}
        ),

        "dependency_scores": result.get(
            "dependency_scores",
            {}
        ),

        "candidates": result.get(
            "candidates",
            []
        ),

        "evidence": result.get(
            "evidence",
            []
        ),

        "root_cause_explanation": result.get(
            "root_cause_explanation",
            {}
        ),

        # Compatibility alias for the frontend.
        "root_cause": result.get(
            "root_cause_explanation",
            {}
        )
    }