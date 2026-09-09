from analysis.dependency_graph import calculate_dependency_scores


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

    Earliest failure gets the highest score.
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


def calculate_correlation_scores(correlations):
    """
    Calculate correlation scores based on how many
    services share the same technical error pattern.

    A pattern affecting multiple services provides
    stronger root-cause evidence.
    """

    correlation_scores = {}

    for _, data in correlations.items():

        services = data["services"]

        service_count = len(services)

        if service_count < 2:
            continue

        for service in services:

            correlation_scores[service] = (
                correlation_scores.get(service, 0)
                + service_count
            )

    return correlation_scores


def rank_candidates(
    patterns,
    first_failures,
    correlations,
    dependency_scores
):
    """
    Combine failure, temporal, correlation, and
    dependency evidence to rank root-cause candidates.
    """

    temporal_scores = calculate_temporal_scores(
        first_failures
    )

    correlation_scores = calculate_correlation_scores(
        correlations
    )

    candidates = []

    for service, stats in patterns.items():

        failure_score = calculate_candidate_score(
            stats
        )

        temporal_score = temporal_scores.get(
            service,
            0
        )

        correlation_score = correlation_scores.get(
            service,
            0
        )

        dependency_score = dependency_scores.get(
            service,
            0
        )

        combined_score = (
            failure_score
            + temporal_score
            + correlation_score
            + dependency_score
        )

        candidates.append({
            "service": service,
            "score": combined_score,
            "failure_score": failure_score,
            "temporal_score": temporal_score,
            "correlation_score": correlation_score,
            "dependency_score": dependency_score,
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
    "postgres": {
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
            2026, 9, 4, 10, 0, 1,
            tzinfo=timezone.utc
        ),
        "payment-service": datetime(
            2026, 9, 4, 10, 0, 4,
            tzinfo=timezone.utc
        ),
        "user-service": datetime(
            2026, 9, 4, 10, 0, 7,
            tzinfo=timezone.utc
        )
    }

    test_correlations = {
        "database": {
            "count": 2,
            "services": [
                "user-service",
                "payment-service"
            ]
        },
        "connection": {
            "count": 3,
            "services": [
                "user-service",
                "payment-service",
                "database"
            ]
        },
        "timeout": {
            "count": 2,
            "services": [
                "user-service",
                "payment-service"
            ]
        }
    }

    # Dependency evidence:
    # database is depended on by both failing services.
    test_dependency_scores = calculate_dependency_scores(
    [
        "postgres",
        "payment-service",
        "user-service"
    ]
)

    result = rank_candidates(
        test_patterns,
        test_first_failures,
        test_correlations,
        test_dependency_scores
    )

    for candidate in result:
        print(candidate)