from sqlalchemy.orm import Session

from database.models import Log
from analysis.pattern_detector import detect_error_patterns


def analyze_logs(db: Session):
    """
    Fetch logs from PostgreSQL and analyze their failure patterns.
    """

    logs = db.query(Log).order_by(Log.timestamp.asc()).all()

    return detect_error_patterns(logs)
if __name__ == "__main__":
    from database.connection import SessionLocal

    db = SessionLocal()

    try:
        result = analyze_logs(db)
        print(result)
    finally:
        db.close()