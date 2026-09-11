from analysis.dependency_graph import calculate_dependency_scores


def calculate_candidate_score(stats):
    """
    Calculate the failure and severity score.

    ERROR = 1 point
    CRITICAL = 3 points

    This score represents the direct failure evidence
    for a service.
    """

    error_score = stats.get("error_count", 0) * 1
    critical_score = stats.get("critical_count", 0) * 3

    return error_score + critical_score


def calculate_temporal_scores(first_failures):
    """
    Give higher scores to services that failed earlier.

    The earliest failing service receives the highest score.
    """

    if not first_failures:
        return {}

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
    Calculate correlation scores based on how many services
    share the same technical error pattern.

    A pattern affecting multiple services provides stronger
    evidence that the services may belong to the same failure
    chain.
    """

    correlation_scores = {}

    for _, data in correlations.items():

        services = data.get("services", [])

        service_count = len(services)

        if service_count < 2:
            continue

        for service in services:

            correlation_scores[service] = (
                correlation_scores.get(service, 0)
                + service_count
            )

    return correlation_scores


def calculate_dependency_root_cause_bonus(
    service,
    dependency_scores,
    failure_score
):
    """
    Give an additional bonus when a service is identified
    as a dependency of multiple failing services.

    This helps distinguish a possible infrastructure/database
    root cause from downstream application failures.

    The bonus is intentionally moderate so dependency evidence
    strengthens the ranking without completely dominating it.
    """

    dependency_score = dependency_scores.get(
        service,
        0
    )

    if dependency_score <= 0:
        return 0

    # A dependency that affects multiple failing services
    # receives a progressively stronger bonus.
    bonus = dependency_score * 2

    # If the dependency itself has direct failures,
    # increase confidence that it is a genuine root cause.
    if failure_score > 0:
        bonus += 1

    return bonus


def calculate_root_cause_score(
    failure_score,
    temporal_score,
    correlation_score,
    dependency_score,
    dependency_bonus
):
    """
    Combine all available evidence into a final RCA score.

    Weighting philosophy:

    Failure:
        Direct evidence that the service is failing.

    Temporal:
        Earlier failures are more likely to be upstream.

    Correlation:
        Shared failure patterns strengthen the relationship.

    Dependency:
        A service affecting multiple dependent services is
        stronger root-cause evidence.

    Dependency bonus:
        Additional evidence for infrastructure/database
        services that sit upstream of failing services.
    """

    weighted_failure = failure_score * 2
    weighted_temporal = temporal_score * 2
    weighted_correlation = correlation_score
    weighted_dependency = dependency_score * 3

    return (
        weighted_failure
        + weighted_temporal
        + weighted_correlation
        + weighted_dependency
        + dependency_bonus
    )


def rank_candidates(
    patterns,
    first_failures,
    correlations,
    dependency_scores
):
    """
    Rank possible root-cause services.

    The ranking combines:

    1. Failure evidence
    2. Failure severity
    3. Temporal ordering
    4. Cross-service correlation
    5. Dependency relationships
    6. Root-cause dependency bonus
    """

    temporal_scores = calculate_temporal_scores(
        first_failures
    )

    correlation_scores = calculate_correlation_scores(
        correlations
    )

    candidates = []

    for service, stats in patterns.items():

        # --------------------------------
        # Direct failure evidence
        # --------------------------------

        failure_score = calculate_candidate_score(
            stats
        )

        # --------------------------------
        # Temporal evidence
        # --------------------------------

        temporal_score = temporal_scores.get(
            service,
            0
        )

        # --------------------------------
        # Correlation evidence
        # --------------------------------

        correlation_score = correlation_scores.get(
            service,
            0
        )

        # --------------------------------
        # Dependency evidence
        # --------------------------------

        dependency_score = dependency_scores.get(
            service,
            0
        )

        # --------------------------------
        # Root-cause dependency bonus
        # --------------------------------

        dependency_bonus = (
            calculate_dependency_root_cause_bonus(
                service,
                dependency_scores,
                failure_score
            )
        )

        # --------------------------------
        # Final RCA score
        # --------------------------------

        combined_score = calculate_root_cause_score(
            failure_score,
            temporal_score,
            correlation_score,
            dependency_score,
            dependency_bonus
        )

        candidates.append({
            "service": service,

            "score": combined_score,

            "failure_score": failure_score,
            "temporal_score": temporal_score,
            "correlation_score": correlation_score,
            "dependency_score": dependency_score,
            "dependency_bonus": dependency_bonus,

            "error_count": stats.get(
                "error_count",
                0
            ),

            "critical_count": stats.get(
                "critical_count",
                0
            ),

            "total_failures": stats.get(
                "total_failures",
                0
            )
        })

    # --------------------------------
    # Sort highest RCA score first
    # --------------------------------

    candidates.sort(
        key=lambda candidate: (
            candidate["score"],
            candidate["dependency_score"],
            candidate["failure_score"]
        ),
        reverse=True
    )

    return candidates


if __name__ == "__main__":

    from datetime import datetime, timezone

    # --------------------------------
    # Test failure patterns
    # --------------------------------

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

    # --------------------------------
    # Test temporal information
    # --------------------------------

    test_first_failures = {
        "postgres": datetime(
            2026,
            9,
            4,
            10,
            0,
            1,
            tzinfo=timezone.utc
        ),

        "payment-service": datetime(
            2026,
            9,
            4,
            10,
            0,
            4,
            tzinfo=timezone.utc
        ),

        "user-service": datetime(
            2026,
            9,
            4,
            10,
            0,
            7,
            tzinfo=timezone.utc
        )
    }

    # --------------------------------
    # Test correlations
    # --------------------------------

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
                "postgres"
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

    # --------------------------------
    # Dependency evidence
    # --------------------------------

    test_dependency_scores = (
        calculate_dependency_scores(
            [
                "postgres",
                "payment-service",
                "user-service"
            ]
        )
    )

    # --------------------------------
    # Rank candidates
    # --------------------------------

    result = rank_candidates(
        test_patterns,
        test_first_failures,
        test_correlations,
        test_dependency_scores
    )

    # --------------------------------
    # Display results
    # --------------------------------

    print("\nRootCauseAI Candidate Ranking")
    print("=" * 60)

    for rank, candidate in enumerate(
        result,
        start=1
    ):

        print(
            f"\n#{rank} "
            f"{candidate['service']}"
        )

        print(
            f"  RCA Score: "
            f"{candidate['score']}"
        )

        print(
            f"  Failure Score: "
            f"{candidate['failure_score']}"
        )

        print(
            f"  Temporal Score: "
            f"{candidate['temporal_score']}"
        )

        print(
            f"  Correlation Score: "
            f"{candidate['correlation_score']}"
        )

        print(
            f"  Dependency Score: "
            f"{candidate['dependency_score']}"
        )

        print(
            f"  Dependency Bonus: "
            f"{candidate['dependency_bonus']}"
        )