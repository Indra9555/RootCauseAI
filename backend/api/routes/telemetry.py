from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Log
from schemas.telemetry import LogEntry

from analysis.log_classifier import classify_log_level
from analysis.log_analysis_service import analyze_logs
from analysis.pattern_detector import (
    build_log_intelligence_summary
)
from incidents.incident_service import get_or_create_incident
from analysis.anomaly_detector import detect_anomalies
from analysis.anomaly_incident_context import (
    build_anomaly_incident_context
)


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

    The newly ingested log is explicitly used as the
    incident trigger.
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
# LOG INTELLIGENCE
# =========================================================

@router.get("/intelligence")
def get_log_intelligence(
    db: Session = Depends(get_db)
):
    """
    Analyze stored telemetry for log-intelligence insights.

    Provides:
    - total log count
    - total failure count
    - failure count per service
    - severity-level counts
    - repeated failure messages
    - repeated failure messages per service
    """

    logs = (
        db.query(Log)
        .order_by(
            Log.timestamp.asc()
        )
        .all()
    )

    return build_log_intelligence_summary(
        logs
    )


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
@router.get("/anomalies")
def get_anomalies(
    db: Session = Depends(get_db)
):
    logs = (
        db.query(Log)
        .order_by(Log.timestamp.asc())
        .all()
    )

    result = detect_anomalies(logs)

    if result.get("status") != "ok":
        return result

    anomalies = result.get(
        "anomalies",
        []
    )

    contextual_anomalies = (
        build_anomaly_incident_context(
            db,
            anomalies
        )
    )

    return {
        **result,
        "anomalies": contextual_anomalies
    }