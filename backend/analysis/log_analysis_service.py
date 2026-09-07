from sqlalchemy.orm import Session

from database.models import Log
from analysis.pattern_detector import detect_error_patterns
from analysis.temporal_detector import detect_first_failures
from analysis.temporal_detector import rank_by_first_failure
from analysis.candidate_detector import rank_candidates


def analyze_logs(db: Session):
    """
    Fetch logs from PostgreSQL and perform complete
    root-cause analysis.
    """

    # 1. Fetch all logs in chronological order
    logs = db.query(Log).order_by(Log.timestamp.asc()).all()

    # 2. Detect failure patterns
    patterns = detect_error_patterns(logs)

    # 3. Detect the first failure of each service
    first_failures = detect_first_failures(logs)

    # 4. Rank services based on when they first failed
    temporal_ranking = rank_by_first_failure(first_failures)

    # 5. Combine severity and temporal evidence
    candidates = rank_candidates(
        patterns,
        first_failures
    )

    return {
        "patterns": patterns,
        "temporal_analysis": temporal_ranking,
        "candidates": candidates
    }


if __name__ == "__main__":
    from database.connection import SessionLocal

    db = SessionLocal()

    try:
        result = analyze_logs(db)
        print(result)
    finally:
        db.close()