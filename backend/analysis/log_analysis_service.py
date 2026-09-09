from sqlalchemy.orm import Session

from database.models import Log
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


def get_logs(db: Session):
    """
    Fetch all logs ordered by timestamp.
    """

    return (
        db.query(Log)
        .order_by(Log.timestamp.asc())
        .all()
    )


def analyze_logs(logs):
    """
    Run the complete RootCauseAI analysis pipeline.
    """

    # --------------------------------
    # 1. Pattern analysis
    # --------------------------------

    patterns = detect_error_patterns(logs)

    # --------------------------------
    # 2. Temporal analysis
    # --------------------------------

    first_failures = {}

    for log in logs:

        level = log.level.upper().strip()

        if level not in ("ERROR", "CRITICAL"):
            continue

        if log.service not in first_failures:

            first_failures[log.service] = log.timestamp

    temporal_analysis = []

    for service, timestamp in first_failures.items():

        temporal_analysis.append({
            "service": service,
            "first_failure": timestamp
        })

    # --------------------------------
    # 3. Message correlation
    # --------------------------------

    correlations = correlate_messages(logs)

    # --------------------------------
    # 4. Find dependency services
    # --------------------------------

    failing_services = set(patterns.keys())

    dependency_services = set()

    for service in failing_services:

        dependencies = get_dependencies(service)

        for dependency in dependencies:

            dependency_services.add(dependency)

    # --------------------------------
    # 5. Build complete candidate set
    # --------------------------------

    all_candidate_services = (
        failing_services
        | dependency_services
    )

    # --------------------------------
    # 6. Dependency scoring
    # --------------------------------

    dependency_scores = calculate_dependency_scores(
        list(all_candidate_services)
    )

    # --------------------------------
    # 7. Add dependency-only services
    # --------------------------------

    for service in dependency_services:

        if service not in patterns:

            patterns[service] = {
                "error_count": 0,
                "critical_count": 0,
                "total_failures": 0
            }

    # --------------------------------
    # 8. Candidate ranking
    # --------------------------------

    candidates = rank_candidates(
        patterns,
        first_failures,
        correlations,
        dependency_scores
    )

    # --------------------------------
    # 9. Root-cause explanation
    # --------------------------------

    root_cause_explanation = (
        generate_root_cause_explanation(
            candidates,
            correlations
        )
    )

    # --------------------------------
    # 10. Complete analysis result
    # --------------------------------

    return {
        "patterns": patterns,
        "temporal_analysis": temporal_analysis,
        "correlations": correlations,
        "candidates": candidates,
        "root_cause_explanation": root_cause_explanation
    }


def run_analysis():
    """
    Run analysis against the real PostgreSQL logs.
    """

    db = SessionLocal()

    try:

        logs = get_logs(db)

        return analyze_logs(logs)

    finally:

        db.close()


if __name__ == "__main__":

    result = run_analysis()

    print(result)