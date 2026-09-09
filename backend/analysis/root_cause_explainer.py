def select_root_cause(candidates):
    """
    Select the most likely root cause.

    Dependency evidence receives additional weight because
    an upstream service affecting multiple failing services
    is more likely to be the actual root cause.
    """

    if not candidates:
        return None

    ranked = []

    for candidate in candidates:

        base_score = candidate.get("score", 0)
        dependency_score = candidate.get(
            "dependency_score",
            0
        )

        root_cause_score = (
            base_score
            + dependency_score * 5
        )

        ranked.append({
            "service": candidate["service"],
            "root_cause_score": root_cause_score,
            "original_score": base_score,
            "dependency_score": dependency_score
        })

    ranked.sort(
        key=lambda item: item["root_cause_score"],
        reverse=True
    )

    return ranked[0]


def generate_recommendation(service, dependency_score, related_patterns):
    """
    Generate a deterministic recommended action
    based on the available evidence.
    """

    recommendations = []

    if dependency_score > 0:

        recommendations.append(
            f"Check the health and availability of {service} "
            f"because it is an upstream dependency."
        )

    if "connection" in related_patterns:

        recommendations.append(
            "Check database connection failures, connection "
            "pool limits, and network connectivity."
        )

    if "timeout" in related_patterns:

        recommendations.append(
            "Check database response time, query latency, "
            "and timeout configuration."
        )

    if "database" in related_patterns:

        recommendations.append(
            "Inspect database availability, active connections, "
            "and recent database errors."
        )

    if not recommendations:

        recommendations.append(
            f"Inspect recent logs and health metrics for {service}."
        )

    return recommendations


def generate_root_cause_explanation(
    candidates,
    correlations
):
    """
    Generate a deterministic root-cause explanation.
    """

    if not candidates:

        return {
            "root_cause": None,
            "confidence": "low",
            "reason": "No root-cause candidates were identified.",
            "evidence": [],
            "recommendations": []
        }

    selected = select_root_cause(candidates)

    service = selected["service"]

    candidate = next(
        candidate
        for candidate in candidates
        if candidate["service"] == service
    )

    dependency_score = candidate.get(
        "dependency_score",
        0
    )

    correlation_score = candidate.get(
        "correlation_score",
        0
    )

    failure_score = candidate.get(
        "failure_score",
        0
    )

    temporal_score = candidate.get(
        "temporal_score",
        0
    )

    evidence = []

    # --------------------------------
    # Failure evidence
    # --------------------------------

    if failure_score > 0:

        evidence.append(
            f"{service} has a failure score of "
            f"{failure_score}."
        )

    # --------------------------------
    # Temporal evidence
    # --------------------------------

    if temporal_score > 0:

        evidence.append(
            f"{service} has temporal evidence "
            f"indicating an early failure."
        )

    # --------------------------------
    # Correlation evidence
    # --------------------------------

    related_patterns = []

    for pattern, data in correlations.items():

        if service in data.get("services", []):

            related_patterns.append(pattern)

    if related_patterns:

        evidence.append(
            f"Related error patterns include: "
            f"{', '.join(related_patterns)}."
        )

    # --------------------------------
    # Dependency evidence
    # --------------------------------

    if dependency_score > 0:

        evidence.append(
            f"{dependency_score} failing service(s) "
            f"depend on {service}."
        )

    # --------------------------------
    # Confidence calculation
    # --------------------------------

    evidence_points = 0

    if failure_score > 0:
        evidence_points += 1

    if temporal_score > 0:
        evidence_points += 1

    if correlation_score > 0:
        evidence_points += 1

    if dependency_score > 0:
        evidence_points += 1

    if evidence_points >= 3:

        confidence = "high"

    elif evidence_points == 2:

        confidence = "medium"

    else:

        confidence = "low"

    # --------------------------------
    # Explanation
    # --------------------------------

    reason_parts = [
        f"{service} is the strongest root-cause "
        f"candidate after combining failure, temporal, "
        f"correlation, and dependency evidence."
    ]

    if dependency_score > 0:

        reason_parts.append(
            f"{dependency_score} failing service(s) "
            f"depend on {service}, indicating that "
            f"the service may be an upstream cause."
        )

    if related_patterns:

        reason_parts.append(
            "Shared technical error patterns were "
            "detected across affected services."
        )

    if temporal_score > 0:

        reason_parts.append(
            "Failure timing provides additional "
            "supporting evidence."
        )

    reason = " ".join(reason_parts)

    # --------------------------------
    # Recommendations
    # --------------------------------

    recommendations = generate_recommendation(
        service,
        dependency_score,
        related_patterns
    )

    # --------------------------------
    # Final result
    # --------------------------------

    return {
        "root_cause": service,
        "confidence": confidence,
        "reason": reason,
        "evidence": evidence,
        "recommendations": recommendations
    }


if __name__ == "__main__":

    test_candidates = [
        {
            "service": "user-service",
            "score": 10,
            "failure_score": 2,
            "temporal_score": 2,
            "correlation_score": 6,
            "dependency_score": 0
        },
        {
            "service": "payment-service",
            "score": 8,
            "failure_score": 1,
            "temporal_score": 1,
            "correlation_score": 6,
            "dependency_score": 0
        },
        {
            "service": "postgres",
            "score": 2,
            "failure_score": 0,
            "temporal_score": 0,
            "correlation_score": 0,
            "dependency_score": 2
        }
    ]

    test_correlations = {
        "database": {
            "count": 3,
            "services": [
                "user-service",
                "payment-service"
            ]
        },
        "connection": {
            "count": 3,
            "services": [
                "user-service",
                "payment-service"
            ]
        },
        "timeout": {
            "count": 3,
            "services": [
                "user-service",
                "payment-service"
            ]
        }
    }

    result = generate_root_cause_explanation(
        test_candidates,
        test_correlations
    )

    print(result)