from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Log, Incident

from analysis.dependency_graph import (
    get_dependencies,
    get_dependents
)
from analysis.pattern_detector import detect_error_patterns
from analysis.candidate_detector import rank_candidates
from analysis.log_analysis_service import analyze_logs


router = APIRouter(
    prefix="/api/dependencies",
    tags=["Dependencies"]
)


@router.get("")
def get_dependency_map(
    db: Session = Depends(get_db)
):
    logs = (
        db.query(Log)
        .order_by(Log.timestamp.asc())
        .all()
    )

    patterns = detect_error_patterns(logs)

    analysis = analyze_logs(logs)

    candidates = analysis.get(
        "candidates",
        []
    )

    candidate_map = {
        candidate["service"]: candidate
        for candidate in candidates
    }

    incidents = (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .all()
    )

    active_incident_services = set()

    for incident in incidents:
        if incident.status != "ACTIVE":
            continue

        for service in (
            incident.affected_services
            or []
        ):
            active_incident_services.add(
                service
            )

    services = set(patterns.keys())

    for candidate in candidates:
        services.add(
            candidate["service"]
        )

    dependencies = []

    for service in sorted(services):
        service_dependencies = get_dependencies(
            service
        )

        service_dependents = get_dependents(
            service
        )

        for dependency in service_dependencies:
            dependencies.append({
                "source": service,
                "target": dependency,
                "relationship": "depends_on"
            })

        for dependent in service_dependents:
            if dependent not in services:
                services.add(dependent)

    service_data = []

    for service in sorted(services):
        stats = patterns.get(
            service,
            {
                "error_count": 0,
                "critical_count": 0,
                "total_failures": 0
            }
        )

        candidate = candidate_map.get(
            service,
            {}
        )

        service_data.append({
            "service": service,
            "error_count": stats.get(
                "error_count",
                0
            ),
            "critical_count": stats.get(
                "critical_count",
                0
            ),
            "total_failures": stats.get(
                "total_failures",
                0
            ),
            "rca_score": candidate.get(
                "score",
                0
            ),
            "dependency_score": candidate.get(
                "dependency_score",
                0
            ),
            "root_cause": (
                candidate.get("score", 0)
                == candidates[0].get("score", -1)
                if candidates
                else False
            ),
            "incident_active": (
                service
                in active_incident_services
            ),
            "depends_on": get_dependencies(
                service
            ),
            "dependents": get_dependents(
                service
            )
        })

    root_cause = (
        candidates[0]["service"]
        if candidates
        else None
    )

    return {
        "root_cause": root_cause,
        "services": service_data,
        "dependencies": dependencies
    }