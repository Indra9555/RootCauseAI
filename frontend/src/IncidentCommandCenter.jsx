import React, { useMemo } from "react";
import "./IncidentCommandCenter.css";

function formatTime(timestamp) {
  if (!timestamp) {
    return "—";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getServiceFailures(patterns, service) {
  const data = patterns?.[service];

  if (typeof data === "number") {
    return data;
  }

  return data?.total_failures || 0;
}

function getImpactLevel(incident) {
  if (!incident) {
    return "LOW";
  }

  const severity = (
    incident.severity || ""
  ).toUpperCase();

  if (severity === "CRITICAL") {
    return "CRITICAL";
  }

  if (severity === "HIGH") {
    return "HIGH";
  }

  if (
    (incident.failure_count || 0) >= 5
  ) {
    return "HIGH";
  }

  if (
    (incident.failure_count || 0) > 0
  ) {
    return "MODERATE";
  }

  return "LOW";
}

function IncidentCommandCenter({
  activeIncidents = [],
  patterns = {},
  rootCause = {},
  serviceHealth = null,
  onOpenIncident,
  onOpenServices
}) {
  const activeIncident = useMemo(() => {
    if (!activeIncidents.length) {
      return null;
    }

    return [...activeIncidents].sort(
      (a, b) =>
        new Date(b.created_at || b.started_at) -
        new Date(a.created_at || a.started_at)
    )[0];
  }, [activeIncidents]);

  const affectedServices = useMemo(() => {
    if (!activeIncident) {
      return [];
    }

    return Array.isArray(
      activeIncident.affected_services
    )
      ? activeIncident.affected_services
      : [];
  }, [activeIncident]);

  const primaryRootCause =
    activeIncident?.root_cause ||
    rootCause?.root_cause ||
    null;

  const incidentRecommendation =
    activeIncident?.recommendations?.[0] ||
    rootCause?.recommendations?.[0] ||
    "No automated recommendation is currently available.";

  const impactLevel =
    getImpactLevel(activeIncident);

  const incidentFailureCount =
    activeIncident?.failure_count || 0;

  const rcaScore =
    activeIncident?.rca_score ||
    rootCause?.score ||
    0;

  const confidence =
    activeIncident?.confidence ||
    rootCause?.confidence ||
    "Unknown";

  const serviceHealthMap = useMemo(() => {
    const map = {};

    const backendServices =
      serviceHealth?.services || [];

    backendServices.forEach((service) => {
      map[service.service] = service;
    });

    return map;
  }, [serviceHealth]);

  if (!activeIncident) {
    return (
      <section className="incident-command-center incident-command-empty">
        <div className="command-center-empty-icon">
          ✓
        </div>

        <div className="command-center-empty-content">
          <span className="command-center-eyebrow">
            INCIDENT COMMAND CENTER
          </span>

          <h2>
            No active incidents
          </h2>

          <p>
            RootCauseAI is not currently tracking
            an active software failure incident.
          </p>
        </div>

        <div className="command-center-operational">
          <span className="command-live-dot" />
          SYSTEM STABLE
        </div>
      </section>
    );
  }

  return (
    <section className="incident-command-center">
      <div className="command-center-header">
        <div>
          <span className="command-center-eyebrow">
            INCIDENT COMMAND CENTER
          </span>

          <h2>
            Active Failure Investigation
          </h2>

          <p>
            Live operational view of the highest-priority
            active incident.
          </p>
        </div>

        <div className="command-center-status">
          <span className="command-live-dot" />

          <strong>
            ACTIVE
          </strong>

          <span>
            {activeIncident.incident_id}
          </span>
        </div>
      </div>

      <div className="command-center-grid">
        {/* PRIMARY INCIDENT */}

        <div className="command-incident-main">
          <div className="command-incident-heading">
            <div>
              <span className="command-label">
                CURRENT INCIDENT
              </span>

              <h3>
                {activeIncident.title ||
                  "Software failure detected"}
              </h3>
            </div>

            <span
              className={`command-severity command-severity-${(
                activeIncident.severity ||
                "HIGH"
              ).toLowerCase()}`}
            >
              {activeIncident.severity ||
                "HIGH"}
            </span>
          </div>

          <div className="command-incident-meta">
            <div>
              <span>
                STARTED
              </span>

              <strong>
                {formatTime(
                  activeIncident.started_at
                )}
              </strong>
            </div>

            <div>
              <span>
                FAILURES
              </span>

              <strong>
                {incidentFailureCount}
              </strong>
            </div>

            <div>
              <span>
                RCA SCORE
              </span>

              <strong>
                {rcaScore}
              </strong>
            </div>

            <div>
              <span>
                CONFIDENCE
              </span>

              <strong>
                {confidence}
              </strong>
            </div>
          </div>

          <button
            className="command-investigate-button"
            onClick={() =>
              onOpenIncident?.(
                activeIncident
              )
            }
          >
            Open incident investigation
            <span>→</span>
          </button>
        </div>

        {/* ROOT CAUSE */}

        <div className="command-root-cause">
          <div className="command-card-top">
            <div>
              <span className="command-label">
                RCA ENGINE
              </span>

              <h3>
                Primary Suspect
              </h3>
            </div>

            <span className="command-ai-badge">
              AI
            </span>
          </div>

          <div className="command-root-service">
            <div className="command-service-icon">
              !
            </div>

            <div>
              <strong>
                {primaryRootCause ||
                  "Unknown"}
              </strong>

              <span>
                Most likely root cause
              </span>
            </div>
          </div>

          <div className="command-confidence">
            <span>
              {confidence} confidence
            </span>

            <div className="command-confidence-bar">
              <div
                style={{
                  width:
                    confidence
                      .toLowerCase()
                      .includes("high")
                      ? "88%"
                      : confidence
                          .toLowerCase()
                          .includes("medium")
                      ? "62%"
                      : "35%"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* IMPACT ROW */}

      <div className="command-impact-grid">
        <div className="command-impact-card">
          <div className="command-impact-heading">
            <span className="command-label">
              CURRENT IMPACT
            </span>

            <span
              className={`command-impact-level command-impact-${impactLevel.toLowerCase()}`}
            >
              {impactLevel}
            </span>
          </div>

          <div className="command-impact-value">
            <strong>
              {affectedServices.length}
            </strong>

            <span>
              affected services
            </span>
          </div>

          <div className="command-service-list">
            {affectedServices.length === 0 ? (
              <span className="command-muted">
                No affected services reported.
              </span>
            ) : (
              affectedServices
                .slice(0, 6)
                .map((service) => {
                  const health =
                    serviceHealthMap[
                      service
                    ];

                  const failures =
                    getServiceFailures(
                      patterns,
                      service
                    );

                  const isRoot =
                    service ===
                    primaryRootCause;

                  return (
                    <button
                      key={service}
                      className={`command-service-row ${
                        isRoot
                          ? "command-service-root"
                          : ""
                      }`}
                      onClick={() =>
                        onOpenServices?.(
                          service
                        )
                      }
                    >
                      <span className="command-service-dot" />

                      <span className="command-service-name">
                        {service}
                      </span>

                      {isRoot && (
                        <span className="command-root-tag">
                          RCA
                        </span>
                      )}

                      <span className="command-service-failures">
                        {health?.total_failures ??
                          failures}{" "}
                        failures
                      </span>

                      <span className="command-service-arrow">
                        →
                      </span>
                    </button>
                  );
                })
            )}
          </div>

          {affectedServices.length > 6 && (
            <button
              className="command-view-services"
              onClick={() =>
                onOpenServices?.()
              }
            >
              View all affected services →
            </button>
          )}
        </div>

        {/* PROPAGATION */}

        <div className="command-propagation-card">
          <div className="command-card-top">
            <div>
              <span className="command-label">
                FAILURE PROPAGATION
              </span>

              <h3>
                Investigation Flow
              </h3>
            </div>
          </div>

          <div className="command-flow">
            <div className="command-flow-node">
              <span className="command-flow-icon incident">
                !
              </span>

              <div>
                <strong>
                  Incident
                </strong>

                <span>
                  {activeIncident.incident_id}
                </span>
              </div>
            </div>

            <div className="command-flow-arrow">
              →
            </div>

            <div className="command-flow-node">
              <span className="command-flow-icon impact">
                ◈
              </span>

              <div>
                <strong>
                  Impact
                </strong>

                <span>
                  {affectedServices.length} services
                </span>
              </div>
            </div>

            <div className="command-flow-arrow">
              →
            </div>

            <div className="command-flow-node">
              <span className="command-flow-icon root">
                ◆
              </span>

              <div>
                <strong>
                  RCA
                </strong>

                <span>
                  {primaryRootCause ||
                    "Unknown"}
                </span>
              </div>
            </div>
          </div>

          <div className="command-flow-note">
            Dependency relationships and RCA
            scoring are used to connect observed
            failures with the current suspect.
          </div>
        </div>
      </div>

      {/* RECOMMENDATION */}

      <div className="command-recommendation">
        <div className="command-recommendation-icon">
          !
        </div>

        <div className="command-recommendation-content">
          <span className="command-label">
            AI RECOMMENDATION
          </span>

          <h3>
            Recommended next action
          </h3>

          <p>
            {incidentRecommendation}
          </p>
        </div>

        <button
          className="command-recommendation-button"
          onClick={() =>
            onOpenIncident?.(
              activeIncident
            )
          }
        >
          Investigate →
        </button>
      </div>
    </section>
  );
}

export default IncidentCommandCenter;