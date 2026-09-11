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
# ROOT CAUSE EXPLANATION
# =========================================================

def build_root_cause_explanation(candidates):

    if not candidates:
        return {
            "root_cause": None,
            "confidence": "low",
            "reason": "No root-cause candidates were identified.",
            "evidence": [],
            "recommendations": [],
            "rca_score": 0
        }

    ranked_candidates = []

    for candidate in candidates:

        base_score = candidate.get(
            "score",
            0
        )

        dependency_score = candidate.get(
            "dependency_score",
            0
        )

        rca_score = (
            base_score +
            dependency_score * 5
        )

        ranked_candidates.append(
            {
                **candidate,
                "rca_score": rca_score
            }
        )

    ranked_candidates.sort(
        key=lambda candidate: candidate["rca_score"],
        reverse=True
    )

    best = ranked_candidates[0]

    root_cause = best.get("service")

    base_score = best.get(
        "score",
        0
    )

    rca_score = best.get(
        "rca_score",
        0
    )

    failure_score = best.get(
        "failure_score",
        0
    )

    temporal_score = best.get(
        "temporal_score",
        0
    )

    correlation_score = best.get(
        "correlation_score",
        0
    )

    dependency_score = best.get(
        "dependency_score",
        0
    )

    evidence_count = sum(
        [
            failure_score > 0,
            temporal_score > 0,
            correlation_score > 0,
            dependency_score > 0
        ]
    )

    if evidence_count >= 3 and rca_score >= 10:

        confidence = "high"

    elif evidence_count >= 2 or rca_score >= 8:

        confidence = "medium"

    else:

        confidence = "low"

    if dependency_score > 0:

        reason = (
            f"{root_cause} is the strongest root-cause "
            "candidate after combining failure, temporal, "
            "correlation, and dependency evidence. "
            f"Its dependency evidence increased its RCA score "
            f"from {base_score} to {rca_score}, indicating "
            "that it may be an upstream cause."
        )

    else:

        reason = (
            f"{root_cause} is the strongest root-cause "
            "candidate after combining failure, temporal, "
            "correlation, and dependency evidence."
        )

    evidence = []

    if failure_score > 0:

        evidence.append(
            f"{root_cause} has "
            f"{best.get('total_failures', 0)} "
            "detected failure(s), including "
            f"{best.get('error_count', 0)} error(s) and "
            f"{best.get('critical_count', 0)} critical event(s)."
        )

    if temporal_score > 0:

        evidence.append(
            f"{root_cause} has temporal evidence "
            "indicating that its failure occurred "
            "early in the incident."
        )

    if correlation_score > 0:

        evidence.append(
            f"{root_cause} is associated with "
            "correlated failure messages across "
            "affected services."
        )

    if dependency_score > 0:

        evidence.append(
            f"{dependency_score} failing service(s) "
            f"depend on {root_cause}, indicating "
            "that the service may be an upstream cause."
        )

    recommendations = [
        f"Investigate {root_cause}",
        (
            f"Check the health and availability of "
            f"{root_cause} because it is a potential "
            "upstream dependency."
        )
    ]

    return {
        "root_cause": root_cause,
        "confidence": confidence,
        "reason": reason,
        "evidence": evidence,
        "recommendations": recommendations,
        "rca_score": rca_score
    }


# =========================================================
# INGEST LOG + AUTOMATIC INCIDENT GENERATION
# =========================================================

@router.post("/logs")
def ingest_log(
    log: LogEntry,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # 1. Classify incoming log
    # -----------------------------------------------------

    severity = classify_log_level(
        log.level
    )

    # -----------------------------------------------------
    # 2. Store telemetry
    # -----------------------------------------------------

    db_log = Log(
        service=log.service,
        level=log.level,
        message=log.message,
        timestamp=log.timestamp
    )

    db.add(db_log)
    db.commit()
    db.refresh(db_log)

    # -----------------------------------------------------
    # 3. Fetch all logs
    # -----------------------------------------------------

    logs = (
        db.query(Log)
        .order_by(Log.timestamp.asc())
        .all()
    )

    # -----------------------------------------------------
    # 4. Incident Service performs the official RCA
    # -----------------------------------------------------

    incident = get_or_create_incident(
        db,
        logs
    )

    # -----------------------------------------------------
    # 5. Use incident RCA as the single source of truth
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # 6. Return result
    # -----------------------------------------------------

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

    logs = (
        db.query(Log)
        .order_by(Log.timestamp.asc())
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
# RUN COMPLETE ANALYSIS
# =========================================================

@router.get("/analysis")
def get_log_analysis(
    db: Session = Depends(get_db)
):

    logs = (
        db.query(Log)
        .order_by(Log.timestamp.asc())
        .all()
    )

    result = analyze_logs(
        logs
    )

    explanation = build_root_cause_explanation(
        result.get(
            "candidates",
            []
        )
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

        "candidates": result.get(
            "candidates",
            []
        ),

        "root_cause_explanation": explanation,

        "root_cause": explanation
    }