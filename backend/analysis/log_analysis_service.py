from sqlalchemy.orm import Session

from database.models import Log
from analysis.pattern_detector import detect_error_patterns
from analysis.candidate_detector import rank_candidates


def analyze_logs(db: Session):
    """
    Fetch logs from PostgreSQL and perform failure analysis.
    """

    logs = db.query(Log).order_by(Log.timestamp.asc()).all()

    patterns = detect_error_patterns(logs)

    candidates = rank_candidates(patterns)

    return {
        "patterns": patterns,
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