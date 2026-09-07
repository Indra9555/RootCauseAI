def extract_keywords(message):
    """
    Extract important technical keywords from a log message.
    """

    keywords = [
        "database",
        "postgres",
        "connection",
        "timeout",
        "refused",
        "authentication",
        "network",
        "api",
        "payment",
        "redis",
        "cache",
        "server"
    ]

    message = message.lower()

    return [
        keyword
        for keyword in keywords
        if keyword in message
    ]


def correlate_messages(logs):
    """
    Find common technical keywords across failed logs.
    """

    correlations = {}

    for log in logs:

        if log.level.upper() not in ["ERROR", "CRITICAL"]:
            continue

        keywords = extract_keywords(log.message)

        for keyword in keywords:

            if keyword not in correlations:
                correlations[keyword] = {
                    "count": 0,
                    "services": []
                }

            correlations[keyword]["count"] += 1

            if log.service not in correlations[keyword]["services"]:
                correlations[keyword]["services"].append(
                    log.service
                )

    return correlations


if __name__ == "__main__":
    class TestLog:
        def __init__(self, service, level, message):
            self.service = service
            self.level = level
            self.message = message


    test_logs = [
        TestLog(
            "user-service",
            "ERROR",
            "Database connection timeout"
        ),
        TestLog(
            "payment-service",
            "ERROR",
            "Payment database connection timeout"
        ),
        TestLog(
            "database",
            "CRITICAL",
            "Postgres connection refused"
        )
    ]

    result = correlate_messages(test_logs)

    for keyword, data in result.items():
        print(keyword, "->", data)