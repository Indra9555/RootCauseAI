def calculate_candidate_score(stats):
    """
    Calculate the failure/severity score.

    ERROR = 1 point
    CRITICAL = 3 points
    """

    error_score = stats["error_count"] * 1
    critical_score = stats["critical_count"] * 3

    return error_score + critical_score


def calculate_temporal_scores(first_failures):
    """
    Give higher scores to services that failed earlier.

    1st  = 3 points
    2nd  = 2 points
    3rd  = 1 point
    """

    ranked = sorted(
        first_failures.items(),
        key=lambda item: item[1]
    )

    temporal_scores = {}

    total_services = len(ranked)

    for index, (service, _) in enumerate(ranked):
        score = total_services - index

        temporal_scores[service] = score

    return temporal_scores


def rank_candidates(patterns, first_failures):
    """
    Combine failure severity and temporal evidence
    to rank root-cause candidates.
    """

    temporal_scores = calculate_temporal_scores(first_failures)

    candidates = []

    for service, stats in patterns.items():

        failure_score = calculate_candidate_score(stats)

        temporal_score = temporal_scores.get(service, 0)

        combined_score = failure_score + temporal_score

        candidates.append({
            "service": service,
            "score": combined_score,
            "failure_score": failure_score,
            "temporal_score": temporal_score,
            "error_count": stats["error_count"],
            "critical_count": stats["critical_count"],
            "total_failures": stats["total_failures"]
        })

    candidates.sort(
        key=lambda candidate: candidate["score"],
        reverse=True
    )

    return candidates
if __name__ == "__main__":
    from datetime import datetime, timezone

    test_patterns = {
        "database": {
            "error_count": 3,
            "critical_count": 2,
            "total_failures": 5
        },
        "payment-service": {
            "error_count": 1,
            "critical_count": 1,
            "total_failures": 2
        },
        "user-service": {
            "error_count": 2,
            "critical_count": 0,
            "total_failures": 2
        }
    }

    test_first_failures = {
        "database": datetime(
            2026, 9, 4, 10, 0, 1, tzinfo=timezone.utc
        ),
        "payment-service": datetime(
            2026, 9, 4, 10, 0, 4, tzinfo=timezone.utc
        ),
        "user-service": datetime(
            2026, 9, 4, 10, 0, 7, tzinfo=timezone.utc
        )
    }

    result = rank_candidates(
        test_patterns,
        test_first_failures
    )

    for candidate in result:
        print(candidate)