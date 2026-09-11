from datetime import timezone

from sqlalchemy.orm import Session

from database.models import Log, Incident
from database.connection import SessionLocal

from analysis.pattern_detector import detect_error_patterns
from analysis.candidate_detector import rank_candidates
from analysis.message_correlator import correlate_messages
from analysis.root_cause_explainer import (
    generate_root_cause_explanation
)
from analysis.dependency_graph import (
    calculate_dependency_scores,
    get_dependencies
)


# =========================================================
# GENERAL HELPERS
# =========================================================

def get_logs(db: Session):
    """
    Fetch all logs ordered by timestamp.
    """

    return (
        db.query(Log)
        .order_by(Log.timestamp.asc())
        .all()
    )


def build_temporal_analysis(logs):
    """
    Identify the first failure time for every failing service.
    """

    first_failures = {}

    for log in logs:

        level = str(
            log.level or ""
        ).upper().strip()

        if level not in ("ERROR", "CRITICAL"):
            continue

        service = log.service

        if service not in first_failures:
            first_failures[service] = log.timestamp

    temporal_analysis = []

    for service, timestamp in first_failures.items():

        temporal_analysis.append({
            "service": service,
            "first_failure": timestamp
        })

    temporal_analysis.sort(
        key=lambda item: item["first_failure"]
    )

    return first_failures, temporal_analysis


def build_dependency_services(failing_services):
    """
    Find services that the failing services depend on.
    """

    dependency_services = set()

    for service in failing_services:

        dependencies = get_dependencies(
            service
        )

        for dependency in dependencies:
            dependency_services.add(
                dependency
            )

    return dependency_services


def add_dependency_patterns(
    patterns,
    dependency_services
):
    """
    Add dependency-only services to the candidate set.

    Dependency-only services have no direct failures,
    but can still become root-cause candidates because
    other failing services depend on them.
    """

    for service in dependency_services:

        if service not in patterns:

            patterns[service] = {
                "error_count": 0,
                "critical_count": 0,
                "total_failures": 0
            }


def build_analysis_evidence(
    patterns,
    first_failures,
    correlations,
    dependency_scores
):
    """
    Build evidence for each RCA candidate.
    """

    correlated_services = {
        correlated_service
        for correlation in correlations.values()
        for correlated_service in correlation.get(
            "services",
            []
        )
    }

    evidence = []

    for service, stats in patterns.items():

        evidence.append({
            "service": service,

            "error_count": stats.get(
                "error_count",
                0
            ),

            "critical_count": stats.get(
                "critical_count",
                0
            ),

            "total_failures": stats.get(
                "total_failures",
                0
            ),

            "first_failure": first_failures.get(
                service
            ),

            "dependency_score": dependency_scores.get(
                service,
                0
            ),

            "correlated": (
                service in correlated_services
            )
        })

    return evidence


# =========================================================
# CANONICAL RCA NORMALIZATION
# =========================================================

def normalize_root_cause_explanation(
    explanation,
    candidates
):
    """
    Normalize the RCA explanation so that the complete
    analysis pipeline has one consistent root-cause result.

    The candidate ranking is the authoritative source for
    the RCA score.

    The explanation engine provides the reasoning,
    confidence, evidence, and recommendations.
    """

    explanation = explanation or {}

    if not candidates:

        return {
            "root_cause": None,
            "confidence": "low",
            "reason": (
                "No root-cause candidates were identified."
            ),
            "evidence": [],
            "recommendations": [],
            "rca_score": 0
        }

    best_candidate = candidates[0]

    root_cause = explanation.get(
        "root_cause"
    )

    if not root_cause:
        root_cause = best_candidate.get(
            "service"
        )

    confidence = explanation.get(
        "confidence"
    )

    if not confidence:
        confidence = "low"

    reason = explanation.get(
        "reason"
    )

    if not reason:
        reason = (
            f"{root_cause} is the strongest "
            "root-cause candidate after combining "
            "failure, temporal, correlation, and "
            "dependency evidence."
        )

    evidence = explanation.get(
        "evidence",
        []
    )

    recommendations = explanation.get(
        "recommendations",
        []
    )

    # -----------------------------------------------------
    # IMPORTANT:
    # RCA score ALWAYS comes from the ranked candidate.
    # -----------------------------------------------------

    rca_score = best_candidate.get(
        "score",
        0
    )

    return {
        "root_cause": root_cause,
        "confidence": confidence,
        "reason": reason,
        "evidence": evidence,
        "recommendations": recommendations,
        "rca_score": rca_score
    }


# =========================================================
# CORE RCA ANALYSIS
# =========================================================

def analyze_logs(logs):
    """
    Run the complete RootCauseAI analysis pipeline
    against the supplied logs.

    This is the SINGLE SOURCE OF TRUTH for RCA.

    Used by:

    1. Global analysis
    2. Incident-specific analysis
    3. Incident creation/update
    4. Frontend analysis
    """

    # -----------------------------------------------------
    # Ensure deterministic ordering
    # -----------------------------------------------------

    logs = sorted(
        logs,
        key=lambda log: log.timestamp
    )

    # -----------------------------------------------------
    # 1. Pattern analysis
    # -----------------------------------------------------

    patterns = detect_error_patterns(
        logs
    )

    # -----------------------------------------------------
    # 2. Temporal analysis
    # -----------------------------------------------------

    (
        first_failures,
        temporal_analysis
    ) = build_temporal_analysis(
        logs
    )

    # -----------------------------------------------------
    # 3. Message correlation
    # -----------------------------------------------------

    correlations = correlate_messages(
        logs
    )

    # -----------------------------------------------------
    # 4. Find failing services
    # -----------------------------------------------------

    failing_services = set(
        patterns.keys()
    )

    # -----------------------------------------------------
    # 5. Find dependency services
    # -----------------------------------------------------

    dependency_services = (
        build_dependency_services(
            failing_services
        )
    )

    # -----------------------------------------------------
    # 6. Complete candidate set
    # -----------------------------------------------------

    all_candidate_services = (
        failing_services
        | dependency_services
    )

    # -----------------------------------------------------
    # 7. Dependency scoring
    # -----------------------------------------------------

    dependency_scores = (
        calculate_dependency_scores(
            list(all_candidate_services)
        )
    )

    # -----------------------------------------------------
    # 8. Add dependency-only services
    # -----------------------------------------------------

    add_dependency_patterns(
        patterns,
        dependency_services
    )

    # -----------------------------------------------------
    # 9. Candidate ranking
    # -----------------------------------------------------

    candidates = rank_candidates(
        patterns,
        first_failures,
        correlations,
        dependency_scores
    )

    # -----------------------------------------------------
    # 10. Root-cause explanation
    # -----------------------------------------------------

    raw_explanation = (
        generate_root_cause_explanation(
            candidates,
            correlations
        )
    )

    # -----------------------------------------------------
    # 11. Normalize RCA
    #
    # Candidate score is authoritative.
    # -----------------------------------------------------

    root_cause_explanation = (
        normalize_root_cause_explanation(
            raw_explanation,
            candidates
        )
    )

    # -----------------------------------------------------
    # 12. Evidence
    # -----------------------------------------------------

    evidence = build_analysis_evidence(
        patterns,
        first_failures,
        correlations,
        dependency_scores
    )

    # -----------------------------------------------------
    # 13. Result
    # -----------------------------------------------------

    return {
        "patterns": patterns,

        "temporal_analysis": (
            temporal_analysis
        ),

        "correlations": correlations,

        "dependency_scores": (
            dependency_scores
        ),

        "candidates": candidates,

        "root_cause_explanation": (
            root_cause_explanation
        ),

        "evidence": evidence
    }


# =========================================================
# INCIDENT-SPECIFIC ANALYSIS
# =========================================================

def analyze_incident(
    db: Session,
    incident_id: str
):
    """
    Analyze logs belonging to one specific incident.

    For an ACTIVE incident, the latest available telemetry
    timestamp is used as the analysis end time.

    This keeps incident RCA deterministic when telemetry
    timestamps are simulated or ahead of the machine clock.
    """

    # -----------------------------------------------------
    # Find incident
    # -----------------------------------------------------

    incident = (
        db.query(Incident)
        .filter(
            Incident.incident_id == incident_id
        )
        .first()
    )

    if not incident:
        return None

    # -----------------------------------------------------
    # Normalize incident start time
    # -----------------------------------------------------

    start_time = incident.started_at

    if start_time.tzinfo is None:

        start_time = start_time.replace(
            tzinfo=timezone.utc
        )

    # -----------------------------------------------------
    # Determine affected services
    # -----------------------------------------------------

    affected_services = (
        incident.affected_services
        or []
    )

    affected_services = set(
        affected_services
    )

    # -----------------------------------------------------
    # Determine analysis end time
    # -----------------------------------------------------

    if incident.ended_at is not None:

        end_time = incident.ended_at

        if end_time.tzinfo is None:

            end_time = end_time.replace(
                tzinfo=timezone.utc
            )

    else:

        latest_query = (
            db.query(Log)
            .filter(
                Log.timestamp >= start_time
            )
        )

        if affected_services:

            latest_query = latest_query.filter(
                Log.service.in_(
                    affected_services
                )
            )

        latest_log = (
            latest_query
            .order_by(
                Log.timestamp.desc()
            )
            .first()
        )

        if latest_log is None:

            end_time = start_time

        else:

            end_time = latest_log.timestamp

            if end_time.tzinfo is None:

                end_time = end_time.replace(
                    tzinfo=timezone.utc
                )

    # -----------------------------------------------------
    # Query incident logs
    # -----------------------------------------------------

    query = (
        db.query(Log)
        .filter(
            Log.timestamp >= start_time,
            Log.timestamp <= end_time
        )
    )

    # -----------------------------------------------------
    # Filter by affected services
    # -----------------------------------------------------

    if affected_services:

        query = query.filter(
            Log.service.in_(
                affected_services
            )
        )

    incident_logs = (
        query
        .order_by(
            Log.timestamp.asc()
        )
        .all()
    )

    # -----------------------------------------------------
    # Run canonical RCA
    # -----------------------------------------------------

    analysis = analyze_logs(
        incident_logs
    )

    # -----------------------------------------------------
    # Add incident metadata
    # -----------------------------------------------------

    analysis["incident"] = {
        "incident_id": incident.incident_id,
        "title": incident.title,
        "status": incident.status,
        "severity": incident.severity,
        "started_at": incident.started_at,
        "ended_at": incident.ended_at,
        "affected_services": (
            incident.affected_services
        ),
        "log_count": len(
            incident_logs
        ),
        "analysis_end_time": end_time
    }

    return analysis


# =========================================================
# GLOBAL ANALYSIS
# =========================================================

def run_analysis():
    """
    Run analysis against all PostgreSQL logs.
    """

    db = SessionLocal()

    try:

        logs = get_logs(db)

        return analyze_logs(
            logs
        )

    finally:

        db.close()


# =========================================================
# STANDALONE EXECUTION
# =========================================================

if __name__ == "__main__":

    result = run_analysis()

    print(result)