from database.models import Incident


def build_anomaly_incident_context(
    db,
    anomalies
):
    """
    Connect detected behavioral anomalies with
    currently active incidents.

    This does NOT create incidents and does NOT
    determine root cause.

    It only provides contextual information about
    whether an anomalous service is already involved
    in an active incident.
    """

    active_incidents = (
        db.query(Incident)
        .filter(
            Incident.status == "ACTIVE"
        )
        .order_by(
            Incident.created_at.desc()
        )
        .all()
    )

    contextual_anomalies = []

    for anomaly in anomalies:
        service = anomaly.get(
            "service"
        )

        related_incidents = []

        for incident in active_incidents:
            affected_services = (
                incident.affected_services
                or []
            )

            if (
                service in affected_services
                or incident.root_cause == service
            ):
                related_incidents.append({
                    "incident_id": (
                        incident.incident_id
                    ),
                    "title": incident.title,
                    "severity": incident.severity,
                    "status": incident.status,
                    "root_cause": incident.root_cause,
                    "confidence": incident.confidence,
                    "rca_score": incident.rca_score
                })

        if not related_incidents:
            relationship = "STANDALONE_ANOMALY"

        elif any(
            incident.get("root_cause")
            == service
            for incident
            in related_incidents
        ):
            relationship = "ROOT_CAUSE_ANOMALY"

        else:
            relationship = "AFFECTED_SERVICE_ANOMALY"

        contextual_anomalies.append({
            **anomaly,
            "incident_context": {
                "relationship": relationship,
                "active_incident_count": (
                    len(related_incidents)
                ),
                "incidents": related_incidents
            }
        })

    return contextual_anomalies