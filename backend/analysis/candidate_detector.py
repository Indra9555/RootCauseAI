def calculate_candidate_score(stats):
    """
    Calculate a root-cause candidate score.

    ERROR     = 1 point
    CRITICAL  = 3 points
    """

    error_score = stats["error_count"] * 1
    critical_score = stats["critical_count"] * 3

    return error_score + critical_score


def rank_candidates(patterns):
    """
    Rank services based on their failure severity score.
    """

    candidates = []

    for service, stats in patterns.items():
        score = calculate_candidate_score(stats)

        candidates.append({
            "service": service,
            "score": score,
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
    test_patterns = {
        "user-service": {
            "error_count": 2,
            "critical_count": 0,
            "total_failures": 2
        },
        "payment-service": {
            "error_count": 1,
            "critical_count": 1,
            "total_failures": 2
        },
        "database": {
            "error_count": 3,
            "critical_count": 2,
            "total_failures": 5
        }
    }

    result = rank_candidates(test_patterns)

    for candidate in result:
        print(candidate)