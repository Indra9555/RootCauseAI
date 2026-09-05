from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LogEntry(BaseModel):
    service: str
    level: str
    message: str
    timestamp: datetime


class LogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service: str
    level: str
    message: str
    timestamp: datetime