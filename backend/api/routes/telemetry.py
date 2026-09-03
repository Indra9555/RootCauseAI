from fastapi import APIRouter
from schemas.telemetry import LogEntry


router = APIRouter(
    prefix="/api/telemetry",
    tags=["Telemetry"]
)


@router.post("/logs")
def ingest_log(log: LogEntry):
    return {
        "status": "received",
        "message": "Log successfully ingested",
        "log": log
    }