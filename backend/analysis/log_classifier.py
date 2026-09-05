def classify_log_level(level: str) -> str:
    """
    Classify a log level into a standardized severity category.
    """

    level = level.upper().strip()

    if level == "INFO":
        return "NORMAL"

    if level == "WARNING":
        return "WARNING"

    if level == "ERROR":
        return "ERROR"

    if level == "CRITICAL":
        return "CRITICAL"

    return "UNKNOWN"