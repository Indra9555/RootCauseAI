from datetime import datetime, timezone


def normalize_level(level):
    return str(level or "").upper().strip()


def calculate_service_health(logs):
    """
    Calculate health information for every service.

    Health rules:
    - CRITICAL: any CRITICAL failure
    - CRITICAL: 3 or more ERROR failures
    - DEGRADED: 1 or 2 ERROR failures
    - HEALTHY: no ERROR/CRITICAL failures
    """

    services = {}

    for log in logs:
        service = getattr(log, "service", None)

        if not service:
            continue

        level = normalize_level(
            getattr(log, "level", None)
        )

        timestamp = getattr(
            log,
            "timestamp",
            None
        )

        if service not in services:
            services[service] = {
                "service": service,
                "error_count": 0,
                "critical_count": 0,
                "total_failures": 0,
                "last_failure": None,
                "health": "HEALTHY"
            }

        service_data = services[service]

        if level == "ERROR":
            service_data["error_count"] += 1
            service_data["total_failures"] += 1

        elif level == "CRITICAL":
            service_data["critical_count"] += 1
            service_data["total_failures"] += 1

        if level in ("ERROR", "CRITICAL") and timestamp:
            if (
                service_data["last_failure"] is None
                or timestamp > service_data["last_failure"]
            ):
                service_data["last_failure"] = timestamp

    for service_data in services.values():
        if service_data["critical_count"] > 0:
            service_data["health"] = "CRITICAL"

        elif service_data["error_count"] >= 3:
            service_data["health"] = "CRITICAL"

        elif service_data["error_count"] > 0:
            service_data["health"] = "DEGRADED"

        else:
            service_data["health"] = "HEALTHY"

    return list(services.values())


def get_health_summary(services):
    summary = {
        "total": len(services),
        "healthy": 0,
        "degraded": 0,
        "critical": 0
    }

    for service in services:
        health = service.get("health")

        if health == "HEALTHY":
            summary["healthy"] += 1

        elif health == "DEGRADED":
            summary["degraded"] += 1

        elif health == "CRITICAL":
            summary["critical"] += 1

    return summary


def build_service_health(logs):
    services = calculate_service_health(logs)

    services.sort(
        key=lambda service: (
            {
                "CRITICAL": 0,
                "DEGRADED": 1,
                "HEALTHY": 2
            }.get(
                service["health"],
                3
            ),
            service["service"]
        )
    )

    return {
        "services": services,
        "summary": get_health_summary(
            services
        )
    }