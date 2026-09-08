DEPENDENCIES = {
    "user-service": ["postgres"],
    "payment-service": ["postgres"]
}


def get_dependencies(service):
    """
    Return the services that this service depends on.
    """

    return DEPENDENCIES.get(service, [])


def get_dependents(service):
    """
    Return services that depend on the given service.
    """

    dependents = []

    for current_service, dependencies in DEPENDENCIES.items():

        if service in dependencies:
            dependents.append(current_service)

    return dependents


def build_dependency_evidence(services):
    """
    Build dependency evidence for the given services.
    """

    evidence = []

    for service in services:

        dependencies = get_dependencies(service)
        dependents = get_dependents(service)

        evidence.append({
            "service": service,
            "depends_on": dependencies,
            "dependents": dependents
        })

    return evidence


def calculate_dependency_scores(failing_services):
    """
    Calculate dependency scores.

    A service receives points when other failing services
    depend on it.
    """

    dependency_scores = {}

    for service in failing_services:

        dependents = get_dependents(service)

        failing_dependents = [
            dependent
            for dependent in dependents
            if dependent in failing_services
        ]

        dependency_scores[service] = len(
            failing_dependents
        )

    return dependency_scores


if __name__ == "__main__":

    services = [
        "postgres",
        "user-service",
        "payment-service"
    ]

    dependency_scores = calculate_dependency_scores(
        services
    )

    for service, score in dependency_scores.items():

        print({
            "service": service,
            "dependency_score": score
        })