from collections import defaultdict
from datetime import timedelta


# =========================================================
# Configuration
# =========================================================

BASELINE_WINDOWS = 5
MIN_BASELINE_WINDOWS = 3

ANOMALY_RATIO_THRESHOLD = 2.0
HIGH_ANOMALY_RATIO = 4.0
CRITICAL_ANOMALY_RATIO = 6.0


# =========================================================
# Window helpers
# =========================================================

def build_time_windows(logs, window_minutes=5):
    """
    Group logs into fixed time windows.

    Each window contains the number of ERROR and CRITICAL
    events observed for each service.
    """

    if not logs:
        return []

    valid_logs = [
        log
        for log in logs
        if log.timestamp is not None
    ]

    if not valid_logs:
        return []

    start_time = min(
        log.timestamp
        for log in valid_logs
    )

    end_time = max(
        log.timestamp
        for log in valid_logs
    )

    windows = []

    current_start = start_time

    while current_start <= end_time:
        current_end = (
            current_start
            + timedelta(
                minutes=window_minutes
            )
        )

        service_counts = defaultdict(int)

        for log in valid_logs:
            if (
                log.timestamp >= current_start
                and log.timestamp < current_end
                and log.level.upper()
                in {"ERROR", "CRITICAL"}
            ):
                service_counts[
                    log.service
                ] += 1

        windows.append({
            "start": current_start,
            "end": current_end,
            "service_counts": dict(
                service_counts
            )
        })

        current_start = current_end

    return windows


# =========================================================
# Baseline
# =========================================================

def calculate_service_baseline(
    service,
    historical_windows
):
    """
    Calculate the average failure count per
    historical window for a service.
    """

    if not historical_windows:
        return 0.0

    counts = [
        window["service_counts"].get(
            service,
            0
        )
        for window in historical_windows
    ]

    if not counts:
        return 0.0

    return sum(counts) / len(counts)


# =========================================================
# Anomaly classification
# =========================================================

def classify_anomaly_ratio(ratio):
    if ratio >= CRITICAL_ANOMALY_RATIO:
        return "CRITICAL"

    if ratio >= HIGH_ANOMALY_RATIO:
        return "HIGH"

    if ratio >= ANOMALY_RATIO_THRESHOLD:
        return "MEDIUM"

    return "NORMAL"


def calculate_anomaly_score(
    baseline,
    current
):
    """
    Convert deviation from baseline into
    an anomaly score from 0 to 100.
    """

    if baseline <= 0:
        if current <= 0:
            return 0

        return 100

    ratio = current / baseline

    if ratio <= 1:
        return 0

    score = (
        (ratio - 1)
        / CRITICAL_ANOMALY_RATIO
    ) * 100

    return min(
        100,
        round(score)
    )


# =========================================================
# Service anomaly detection
# =========================================================

def detect_service_anomaly(
    service,
    historical_windows,
    current_window
):
    baseline = calculate_service_baseline(
        service,
        historical_windows
    )

    current_count = (
        current_window[
            "service_counts"
        ].get(
            service,
            0
        )
    )

    if baseline <= 0:
        ratio = (
            float(current_count)
            if current_count > 0
            else 0.0
        )
    else:
        ratio = (
            current_count
            / baseline
        )

    severity = classify_anomaly_ratio(
        ratio
    )

    score = calculate_anomaly_score(
        baseline,
        current_count
    )

    return {
        "service": service,
        "baseline_failures": round(
            baseline,
            2
        ),
        "current_failures": current_count,
        "deviation_ratio": round(
            ratio,
            2
        ),
        "anomaly_score": score,
        "severity": severity,
        "is_anomaly": (
            severity != "NORMAL"
        ),
        "window_start": (
            current_window["start"]
        ),
        "window_end": (
            current_window["end"]
        )
    }


# =========================================================
# Main anomaly detector
# =========================================================

def detect_anomalies(
    logs,
    window_minutes=5
):
    """
    Detect unusual failure-rate behavior
    across services.

    The latest telemetry window is treated
    as the current observation.

    The preceding windows form the baseline.

    This function detects unusual behavior only.
    It does NOT determine root cause.
    """

    windows = build_time_windows(
        logs,
        window_minutes
    )

    if len(windows) < (
        MIN_BASELINE_WINDOWS + 1
    ):
        return {
            "status": "insufficient_data",
            "message": (
                "Not enough historical "
                "windows to establish "
                "anomaly baselines."
            ),
            "anomalies": []
        }

    # -----------------------------------------------------
    # Latest telemetry window = current window
    # -----------------------------------------------------

    current_window = windows[-1]

    # -----------------------------------------------------
    # Previous windows = baseline
    # -----------------------------------------------------

    historical_windows = windows[
        max(
            0,
            len(windows)
            - BASELINE_WINDOWS
            - 1
        ):
        -1
    ]

    if len(historical_windows) < (
        MIN_BASELINE_WINDOWS
    ):
        return {
            "status": "insufficient_data",
            "message": (
                "Not enough historical "
                "windows to establish "
                "anomaly baselines."
            ),
            "anomalies": []
        }

    # -----------------------------------------------------
    # Collect monitored services
    # -----------------------------------------------------

    services = set()

    for window in windows:
        services.update(
            window[
                "service_counts"
            ].keys()
        )

    # -----------------------------------------------------
    # Analyze each service
    # -----------------------------------------------------

    anomalies = []

    for service in sorted(services):
        result = detect_service_anomaly(
            service,
            historical_windows,
            current_window
        )

        anomalies.append(result)

    # -----------------------------------------------------
    # Highest-risk anomalies first
    # -----------------------------------------------------

    anomalies.sort(
        key=lambda item: (
            item["is_anomaly"],
            item["anomaly_score"],
            item["current_failures"]
        ),
        reverse=True
    )

    detected = [
        item
        for item in anomalies
        if item["is_anomaly"]
    ]

    return {
        "status": "ok",
        "window_minutes": window_minutes,
        "baseline_windows": len(
            historical_windows
        ),
        "current_window": {
            "start": current_window["start"],
            "end": current_window["end"]
        },
        "anomaly_count": len(
            detected
        ),
        "anomalies": detected
    }