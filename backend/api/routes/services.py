from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Log

from analysis.service_health import build_service_health
from analysis.dependency_graph import (
    get_dependencies,
    get_dependents
)


router = APIRouter(
    prefix="/api/services",
    tags=["Services"]
)


@router.get("")
def get_services(
    db: Session = Depends(get_db)
):
    logs = (
        db.query(Log)
        .order_by(
            Log.timestamp.asc()
        )
        .all()
    )

    health_data = build_service_health(
        logs
    )

    services = []

    for service_data in health_data["services"]:
        service = service_data["service"]

        services.append({
            **service_data,
            "depends_on": get_dependencies(
                service
            ),
            "dependents": get_dependents(
                service
            )
        })

    return {
        "services": services,
        "summary": health_data["summary"]
    }