from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Log
from schemas.telemetry import LogEntry
from analysis.log_classifier import classify_log_level


router = APIRouter(
    prefix="/api/telemetry",
    tags=["Telemetry"]
)


@router.post("/logs")
def ingest_log(
    log: LogEntry,
    db: Session = Depends(get_db)
):
    # Analyze the log level
    severity = classify_log_level(log.level)

    # Create database record
    db_log = Log(
        service=log.service,
        level=log.level,
        message=log.message,
        timestamp=log.timestamp
    )

    # Store log
    db.add(db_log)
    db.commit()
    db.refresh(db_log)

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
        }
    }