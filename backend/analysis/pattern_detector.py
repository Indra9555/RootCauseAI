def detect_error_patterns(logs):
    """
    Analyze logs and count ERROR and CRITICAL events per service.

    Returns:
        Dictionary containing per-service failure statistics:
        - error_count
        - critical_count
        - total_failures
    """

    service_stats = {}

    for log in logs:
        level = str(
            getattr(log, "level", "") or ""
        ).upper().strip()

        if level not in ("ERROR", "CRITICAL"):
            continue

        service = getattr(
            log,
            "service",
            None
        )

        if not service:
            continue

        if service not in service_stats:
            service_stats[service] = {
                "error_count": 0,
                "critical_count": 0,
                "total_failures": 0
            }

        if level == "ERROR":
            service_stats[service]["error_count"] += 1

        elif level == "CRITICAL":
            service_stats[service]["critical_count"] += 1

        service_stats[service]["total_failures"] += 1

    return service_stats


def get_failure_logs(logs):
    """
    Return only ERROR and CRITICAL logs.
    """

    failure_logs = []

    for log in logs:
        level = str(
            getattr(log, "level", "") or ""
        ).upper().strip()

        if level in ("ERROR", "CRITICAL"):
            failure_logs.append(log)

    return failure_logs


def get_service_failure_counts(logs):
    """
    Return total failure count per service.

    Example:
        {
            "postgres": 5,
            "payment-service": 3
        }
    """

    counts = {}

    for log in get_failure_logs(logs):
        service = getattr(
            log,
            "service",
            None
        )

        if not service:
            continue

        counts[service] = (
            counts.get(service, 0) + 1
        )

    return counts


def get_level_counts(logs):
    """
    Count logs by severity level.

    Example:
        {
            "INFO": 10,
            "WARNING": 3,
            "ERROR": 5,
            "CRITICAL": 1
        }
    """

    level_counts = {}

    for log in logs:
        level = str(
            getattr(log, "level", "") or ""
        ).upper().strip()

        if not level:
            continue

        level_counts[level] = (
            level_counts.get(level, 0) + 1
        )

    return level_counts


def get_message_frequency(logs):
    """
    Count repeated failure messages.

    This helps identify recurring failure patterns.
    """

    message_counts = {}

    for log in get_failure_logs(logs):
        message = getattr(
            log,
            "message",
            None
        )

        if not message:
            continue

        message = str(
            message
        ).strip()

        if not message:
            continue

        message_counts[message] = (
            message_counts.get(message, 0) + 1
        )

    return dict(
        sorted(
            message_counts.items(),
            key=lambda item: item[1],
            reverse=True
        )
    )


def get_service_message_frequency(logs):
    """
    Count repeated failure messages for each service.

    Returns:
        {
            "postgres": {
                "Database connection timeout": 4
            }
        }
    """

    service_messages = {}

    for log in get_failure_logs(logs):
        service = getattr(
            log,
            "service",
            None
        )

        message = getattr(
            log,
            "message",
            None
        )

        if not service or not message:
            continue

        message = str(
            message
        ).strip()

        if not message:
            continue

        if service not in service_messages:
            service_messages[service] = {}

        service_messages[service][message] = (
            service_messages[service].get(
                message,
                0
            ) + 1
        )

    for service in service_messages:
        service_messages[service] = dict(
            sorted(
                service_messages[service].items(),
                key=lambda item: item[1],
                reverse=True
            )
        )

    return service_messages


def build_log_intelligence_summary(logs):
    """
    Build a general log-intelligence summary.

    This is intentionally separate from the RCA scoring
    system so existing RCA behavior remains unchanged.
    """

    failure_logs = get_failure_logs(logs)

    service_failure_counts = (
        get_service_failure_counts(logs)
    )

    level_counts = get_level_counts(logs)

    message_frequency = (
        get_message_frequency(logs)
    )

    service_message_frequency = (
        get_service_message_frequency(logs)
    )

    return {
        "total_logs": len(logs),
        "total_failures": len(failure_logs),
        "service_failure_counts": service_failure_counts,
        "level_counts": level_counts,
        "message_frequency": message_frequency,
        "service_message_frequency": service_message_frequency
    }


if __name__ == "__main__":

    class TestLog:
        def __init__(
            self,
            service,
            level,
            message=""
        ):
            self.service = service
            self.level = level
            self.message = message

    test_logs = [
        TestLog(
            "postgres",
            "ERROR",
            "Database connection timeout"
        ),
        TestLog(
            "postgres",
            "ERROR",
            "Database connection timeout"
        ),
        TestLog(
            "user-service",
            "ERROR",
            "User request failed"
        ),
        TestLog(
            "api-service",
            "INFO",
            "Request received"
        ),
        TestLog(
            "postgres",
            "CRITICAL",
            "Database connection refused"
        ),
        TestLog(
            "user-service",
            "WARNING",
            "Slow response"
        ),
        TestLog(
            "postgres",
            "ERROR",
            "Database connection timeout"
        )
    ]

    print(
        "=== Error Patterns ==="
    )

    print(
        detect_error_patterns(
            test_logs
        )
    )

    print(
        "\n=== Failure Counts ==="
    )

    print(
        get_service_failure_counts(
            test_logs
        )
    )

    print(
        "\n=== Level Counts ==="
    )

    print(
        get_level_counts(
            test_logs
        )
    )

    print(
        "\n=== Message Frequency ==="
    )

    print(
        get_message_frequency(
            test_logs
        )
    )

    print(
        "\n=== Log Intelligence Summary ==="
    )

    print(
        build_log_intelligence_summary(
            test_logs
        )
    )