def detect_error_patterns(logs):
    """
    Analyze logs and count ERROR and CRITICAL events per service.

    Returns:
        A dictionary containing:
        - error_count
        - critical_count
        - total_failures
    """

    service_stats = {}

    for log in logs:
        level = log.level.upper().strip()

        if level not in ("ERROR", "CRITICAL"):
            continue

        service = log.service

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
if __name__ == "__main__":
    class TestLog:
        def __init__(self, service, level):
            self.service = service
            self.level = level

    test_logs = [
        TestLog("postgres", "ERROR"),
        TestLog("postgres", "ERROR"),
        TestLog("user-service", "ERROR"),
        TestLog("api-service", "INFO"),
        TestLog("postgres", "CRITICAL"),
        TestLog("user-service", "WARNING"),
    ]

    result = detect_error_patterns(test_logs)

    print(result)