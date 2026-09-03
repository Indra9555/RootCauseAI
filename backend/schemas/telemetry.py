from datetime import datetime
from pydantic import BaseModel


class LogEntry(BaseModel):
    service: str
    level: str
    message: str
    timestamp: datetimes