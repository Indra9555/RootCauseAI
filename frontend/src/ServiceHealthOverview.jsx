import React, { useMemo } from "react";
import "./ServiceHealthOverview.css";

function getHealth(service, backendData, failures) {
  return (
    backendData?.health ||
    service.health ||
    (failures >= 3
      ? "CRITICAL"
      : failures > 0
      ? "DEGRADED"
      : "HEALTHY")
  );
}

function getInitial(service) {
  return service
    .split("-")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ServiceHealthOverview({
  services = [],
  backendServices = [],
  patterns = {},
  rootCause = {},
  serviceSummary = {},
  onOpenService
}) {
  const serviceRows = useMemo(() => {
    return services.map((service) => {
      const backendData =
        backendServices.find(
          (item) =>
            item.service === service
        );

      const patternData =
        patterns[service];

      const failures =
        backendData
          ? backendData.total_failures || 0
          : typeof patternData === "number"
          ? patternData
          : patternData?.total_failures || 0;

      const health = getHealth(
        backendData || {},
        backendData,
        failures
      );

      const rcaScore =
        backendData?.rca_score ||
        0;

      const incidentActive =
        backendData?.incident_active ||
        false;

      const isRoot =
        service === rootCause.root_cause;

      return {
        service,
        failures,
        health,
        rcaScore,
        incidentActive,
        isRoot
      };
    });
  }, [
    services,
    backendServices,
    patterns,
    rootCause
  ]);

  const counts = useMemo(() => {
    const healthy = serviceRows.filter(
      (service) =>
        service.health === "HEALTHY"
    ).length;

    const degraded = serviceRows.filter(
      (service) =>
        service.health === "DEGRADED"
    ).length;

    const critical = serviceRows.filter(
      (service) =>
        service.health === "CRITICAL"
    ).length;

    return {
      healthy,
      degraded,
      critical,
      total: serviceRows.length
    };
  }, [serviceRows]);

  const healthPercentage =
    counts.total > 0
      ? Math.round(
          (counts.healthy /
            counts.total) *
            100
        )
      : 0;

  const highestRiskServices =
    [...serviceRows]
      .sort((a, b) => {
        if (
          a.isRoot !== b.isRoot
        ) {
          return a.isRoot ? -1 : 1;
        }

        if (
          a.health !== b.health
        ) {
          const priority = {
            CRITICAL: 3,
            DEGRADED: 2,
            HEALTHY: 1
          };

          return (
            priority[b.health] -
            priority[a.health]
          );
        }

        return (
          b.failures - a.failures
        );
      })
      .slice(0, 5);

  const summaryTotal =
    serviceSummary.total ||
    counts.total;

  return (
    <section className="service-health-overview">
      <div className="service-health-overview-header">
        <div>
          <span className="service-health-eyebrow">
            SYSTEM HEALTH
          </span>

          <h2>
            Service Health Overview
          </h2>

          <p>
            Current operational state across
            monitored services.
          </p>
        </div>

        <button
          className="service-health-view-all"
          onClick={() =>
            onOpenService?.()
          }
        >
          Open service monitor →
        </button>
      </div>

      <div className="service-health-layout">
        {/* HEALTH SUMMARY */}

        <div className="service-health-summary">
          <div className="health-score">
            <div className="health-score-ring">
              <strong>
                {healthPercentage}%
              </strong>

              <span>
                healthy
              </span>
            </div>

            <div className="health-score-copy">
              <span>
                MONITORING STATUS
              </span>

              <strong>
                {summaryTotal} services
              </strong>

              <small>
                {counts.critical > 0
                  ? `${counts.critical} critical services require attention`
                  : counts.degraded > 0
                  ? `${counts.degraded} degraded services need investigation`
                  : "All monitored services are healthy"}
              </small>
            </div>
          </div>

          <div className="health-distribution">
            <div className="health-distribution-row">
              <span>
                <i className="health-dot healthy" />
                Healthy
              </span>

              <strong>
                {counts.healthy}
              </strong>
            </div>

            <div className="health-distribution-row">
              <span>
                <i className="health-dot degraded" />
                Degraded
              </span>

              <strong>
                {counts.degraded}
              </strong>
            </div>

            <div className="health-distribution-row">
              <span>
                <i className="health-dot critical" />
                Critical
              </span>

              <strong>
                {counts.critical}
              </strong>
            </div>
          </div>

          <div className="health-distribution-bar">
            {counts.healthy > 0 && (
              <span
                className="distribution-segment healthy"
                style={{
                  width: `${
                    (counts.healthy /
                      counts.total) *
                    100
                  }%`
                }}
              />
            )}

            {counts.degraded > 0 && (
              <span
                className="distribution-segment degraded"
                style={{
                  width: `${
                    (counts.degraded /
                      counts.total) *
                    100
                  }%`
                }}
              />
            )}

            {counts.critical > 0 && (
              <span
                className="distribution-segment critical"
                style={{
                  width: `${
                    (counts.critical /
                      counts.total) *
                    100
                  }%`
                }}
              />
            )}
          </div>
        </div>

        {/* RISK SERVICES */}

        <div className="service-risk-panel">
          <div className="service-risk-header">
            <div>
              <span>
                ATTENTION REQUIRED
              </span>

              <h3>
                Highest-risk services
              </h3>
            </div>

            <span className="service-risk-count">
              {highestRiskServices.length}
            </span>
          </div>

          <div className="service-risk-list">
            {highestRiskServices.length ===
            0 ? (
              <div className="service-health-empty">
                No service telemetry available.
              </div>
            ) : (
              highestRiskServices.map(
                (service) => (
                  <button
                    key={service.service}
                    className={`service-risk-row ${
                      service.isRoot
                        ? "service-risk-root"
                        : ""
                    }`}
                    onClick={() =>
                      onOpenService?.(
                        service.service
                      )
                    }
                  >
                    <div className="service-risk-icon">
                      {getInitial(
                        service.service
                      )}
                    </div>

                    <div className="service-risk-info">
                      <div>
                        <strong>
                          {service.service}
                        </strong>

                        {service.isRoot && (
                          <span className="service-root-badge">
                            RCA
                          </span>
                        )}

                        {service.incidentActive && (
                          <span className="service-incident-badge">
                            INCIDENT
                          </span>
                        )}
                      </div>

                      <small>
                        {service.failures} failures
                        {service.rcaScore > 0
                          ? ` · RCA ${service.rcaScore}`
                          : ""}
                      </small>
                    </div>

                    <div
                      className={`service-risk-health ${service.health.toLowerCase()}`}
                    >
                      <i />

                      {service.health}
                    </div>

                    <span className="service-risk-arrow">
                      →
                    </span>
                  </button>
                )
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServiceHealthOverview;