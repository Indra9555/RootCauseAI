def detect_first_failures(logs):
    """
    Find the first failure timestamp for each service.
    """

    first_failures = {}

    for log in logs:
        if log.level.upper() not in ["ERROR", "CRITICAL"]:
            continue

        service = log.service

        if service not in first_failures:
            first_failures[service] = log.timestamp

    return first_failures


def rank_by_first_failure(first_failures):
    """
    Rank services from earliest failure to latest failure.
    """

    ranked = sorted(
        first_failures.items(),
        key=lambda item: item[1]
    )

    return [
        {
            "service": service,
            "first_failure": timestamp
        }
        for service, timestamp in ranked
    ]
if __name__ == "__main__":
    from datetime import datetime, timezone

    class TestLog:
        def __init__(self, service, level, timestamp):
            self.service = service
            self.level = level
            self.timestamp = timestamp

    test_logs = [
        TestLog(
            "user-service",
            "ERROR",
            datetime(2026, 9, 4, 10, 0, 7, tzinfo=timezone.utc)
        ),
        TestLog(
            "database",
            "CRITICAL",
            datetime(2026, 9, 4, 10, 0, 1, tzinfo=timezone.utc)
        ),
        TestLog(
            "payment-service",
            "ERROR",
            datetime(2026, 9, 4, 10, 0, 4, tzinfo=timezone.utc)
        )
    ]

    first_failures = detect_first_failures(test_logs)

    result = rank_by_first_failure(first_failures)

    for item in result:
        print(item)