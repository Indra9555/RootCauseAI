from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base


class Log(Base):
    __tablename__ = "logs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    service: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True
    )

    level: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    incident_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="ACTIVE",
        index=True
    )

    severity: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="HIGH"
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )

    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    root_cause: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    confidence: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    rca_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    failure_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    affected_services: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True
    )

    evidence: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True
    )

    recommendations: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True
    )

    explanation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )


class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    incident_id: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )

    service: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )