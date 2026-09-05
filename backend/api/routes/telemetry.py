from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Log
from schemas.telemetry import LogEntry, LogResponse

router = APIRouter(
    prefix="/api/telemetry",
    tags=["Telemetry"]
)


@router.post("/logs")
def ingest_log(
    log: LogEntry,
    db: Session = Depends(get_db)
):
    db_log = Log(
        service=log.service,
        level=log.level,
        message=log.message,
        timestamp=log.timestamp
    )

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
            "message": db_log.message,
            "timestamp": db_log.timestamp
        }
    }
@router.get("/logs", response_model=list[LogResponse])
def get_logs(
    db: Session = Depends(get_db)
):
    logs = db.query(Log).order_by(Log.timestamp.desc()).all()

    return logs