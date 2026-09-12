import React, { useMemo } from "react";
import "./IncidentImpactMap.css";

function getInitials(service) {
  return String(service || "")
    .split("-")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(timestamp) {
  if (!timestamp) {
    return "Unknown";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getHealth(service) {
  if (!service) {
    return "UNKNOWN";
  }

  if (service.health) {
    return String(service.health).toUpperCase();
  }

  const failures =
    service.total_failures || 0;

  if (failures >= 3) {
    return "CRITICAL";
  }

  if (failures > 0) {
    return "DEGRADED";
  }

  return "HEALTHY";
}

function IncidentImpactMap({
  activeIncidents = [],
  rootCause = {},
  serviceHealth = null,
  onOpenIncident,
  onOpenService
}) {
  const activeIncident = useMemo(() => {
    if (!activeIncidents.length) {
      return null;
    }

    return (
      activeIncidents.find(
        (incident) =>
          incident.status === "ACTIVE"
      ) || activeIncidents[0]
    );
  }, [activeIncidents]);

  const backendServices =
    serviceHealth?.services || [];

  const rootCauseService =
    activeIncident?.root_cause ||
    rootCause?.root_cause ||
    null;

  const affectedServiceNames =
    activeIncident?.affected_services || [];

  const affectedServices = useMemo(() => {
    return affectedServiceNames.map(
      (serviceName) => {
        const service =
          backendServices.find(
            (item) =>
              item.service === serviceName
          );

        return {
          service: serviceName,
          health: getHealth(service),
          failures:
            service?.total_failures || 0,
          rcaScore:
            service?.rca_score || 0,
          dependencyScore:
            service?.dependency_score || 0,
          incidentActive:
            service?.incident_active || false,
          dependsOn:
            service?.depends_on || [],
          dependents:
            service?.dependents || [],
          isRootCause:
            serviceName ===
            rootCauseService
        };
      }
    );
  }, [
    affectedServiceNames,
    backendServices,
    rootCauseService
  ]);

  const rootService = useMemo(() => {
    if (!rootCauseService) {
      return null;
    }

    const service =
      backendServices.find(
        (item) =>
          item.service ===
          rootCauseService
      );

    return {
      service: rootCauseService,
      health: getHealth(service),
      failures:
        service?.total_failures || 0,
      rcaScore:
        service?.rca_score ||
        rootCause?.rca_score ||
        0,
      dependencyScore:
        service?.dependency_score || 0,
      dependsOn:
        service?.depends_on || [],
      dependents:
        service?.dependents || []
    };
  }, [
    backendServices,
    rootCauseService,
    rootCause
  ]);

  const propagationCount =
    affectedServices.filter(
      (service) =>
        service.service !==
        rootCauseService
    ).length;

  if (!activeIncident) {
    return (
      <section className="incident-impact-map">
        <div className="impact-map-empty">
          <div>
            <span className="impact-map-eyebrow">
              INCIDENT IMPACT
            </span>

            <h2>
              Incident Impact Map
            </h2>

            <p>
              No active incident is currently
              affecting the monitored system.
            </p>
          </div>

          <span className="impact-map-clear-status">
            SYSTEM STABLE
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="incident-impact-map">
      <div className="impact-map-header">
        <div>
          <span className="impact-map-eyebrow">
            INCIDENT IMPACT
          </span>

          <h2>
            Incident Impact Map
          </h2>

          <p>
            Current incident propagation across
            monitored services.
          </p>
        </div>

        <div className="impact-map-header-actions">
          <span
            className={`impact-map-severity ${
              String(
                activeIncident.severity ||
                  "HIGH"
              ).toLowerCase()
            }`}
          >
            {activeIncident.severity ||
              "HIGH"}
          </span>

          <button
            className="impact-map-open-button"
            onClick={() =>
              onOpenIncident?.(
                activeIncident
              )
            }
          >
            Open incident →
          </button>
        </div>
      </div>

      <div className="impact-map-summary">
        <div className="impact-summary-item">
          <span>INCIDENT</span>

          <strong>
            {activeIncident.incident_id}
          </strong>

          <small>
            Started{" "}
            {formatTime(
              activeIncident.started_at
            )}
          </small>
        </div>

        <div className="impact-summary-divider" />

        <div className="impact-summary-item">
          <span>AFFECTED SERVICES</span>

          <strong>
            {affectedServices.length}
          </strong>

          <small>
            monitored services
          </small>
        </div>

        <div className="impact-summary-divider" />

        <div className="impact-summary-item">
          <span>PROPAGATION</span>

          <strong>
            {propagationCount}
          </strong>

          <small>
            downstream services
          </small>
        </div>

        <div className="impact-summary-divider" />

        <div className="impact-summary-item">
          <span>RCA CONFIDENCE</span>

          <strong>
            {(
              activeIncident.confidence ||
              rootCause?.confidence ||
              "LOW"
            ).toUpperCase()}
          </strong>

          <small>
            current analysis
          </small>
        </div>
      </div>

      <div className="impact-map-flow">
        <div className="impact-map-column incident-column">
          <span className="impact-column-label">
            INCIDENT
          </span>

          <button
            className="impact-incident-card"
            onClick={() =>
              onOpenIncident?.(
                activeIncident
              )
            }
          >
            <div className="impact-incident-top">
              <span className="impact-incident-id">
                {activeIncident.incident_id}
              </span>

              <span className="impact-active-badge">
                ACTIVE
              </span>
            </div>

            <strong>
              {activeIncident.title}
            </strong>

            <small>
              {activeIncident.failure_count ||
                0}{" "}
              recorded failures
            </small>

            <span className="impact-card-arrow">
              →
            </span>
          </button>
        </div>

        <div className="impact-flow-arrow">
          <span />
          ↓
        </div>

        <div className="impact-map-column root-column">
          <span className="impact-column-label">
            PRIMARY ROOT CAUSE
          </span>

          {rootService ? (
            <button
              className="impact-root-card"
              onClick={() =>
                onOpenService?.(
                  rootService.service
                )
              }
            >
              <div className="impact-service-icon root">
                {getInitials(
                  rootService.service
                )}
              </div>

              <div className="impact-root-info">
                <span>
                  RCA SUSPECT
                </span>

                <strong>
                  {rootService.service}
                </strong>

                <small>
                  RCA score{" "}
                  {rootService.rcaScore}
                  {" · "}
                  {rootService.failures}{" "}
                  failures
                </small>
              </div>

              <div className="impact-root-score">
                <strong>
                  {rootService.rcaScore}
                </strong>

                <span>
                  RCA
                </span>
              </div>
            </button>
          ) : (
            <div className="impact-root-unavailable">
              <strong>
                RCA unavailable
              </strong>

              <span>
                No primary root cause has been
                identified.
              </span>
            </div>
          )}
        </div>

        <div className="impact-flow-arrow">
          <span />
          ↓
        </div>

        <div className="impact-map-column services-column">
          <div className="impact-column-heading">
            <span className="impact-column-label">
              AFFECTED SERVICES
            </span>

            <span className="impact-service-count">
              {affectedServices.length}
            </span>
          </div>

          {affectedServices.length ===
          0 ? (
            <div className="impact-services-empty">
              No affected services recorded.
            </div>
          ) : (
            <div className="impact-service-list">
              {affectedServices.map(
                (service) => (
                  <button
                    key={service.service}
                    className={`impact-service-card ${
                      service.isRootCause
                        ? "root"
                        : ""
                    }`}
                    onClick={() =>
                      onOpenService?.(
                        service.service
                      )
                    }
                  >
                    <div
                      className={`impact-service-icon ${service.health.toLowerCase()}`}
                    >
                      {getInitials(
                        service.service
                      )}
                    </div>

                    <div className="impact-service-info">
                      <div className="impact-service-name">
                        <strong>
                          {service.service}
                        </strong>

                        {service.isRootCause && (
                          <span className="impact-root-badge">
                            ROOT
                          </span>
                        )}
                      </div>

                      <small>
                        {service.failures}{" "}
                        failures
                        {" · "}
                        RCA{" "}
                        {service.rcaScore}
                      </small>
                    </div>

                    <span
                      className={`impact-health ${service.health.toLowerCase()}`}
                    >
                      <i />

                      {service.health}
                    </span>

                    <span className="impact-service-arrow">
                      →
                    </span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="impact-map-footer">
        <div className="impact-footer-context">
          <span>
            IMPACT INTERPRETATION
          </span>

          <p>
            The map shows the current incident,
            the RCA engine's primary suspect, and
            the services recorded as affected by
            that incident.
          </p>
        </div>

        <div className="impact-footer-warning">
          <span>ANALYSIS BOUNDARY</span>

          <p>
            Service impact does not by itself prove
            causality. Dependency relationships and
            RCA evidence are evaluated separately.
          </p>
        </div>
      </div>
    </section>
  );
}

export default IncidentImpactMap;