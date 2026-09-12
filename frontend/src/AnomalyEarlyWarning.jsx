import React from "react";
import "./AnomalyEarlyWarning.css";

function formatRatio(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${Number(value).toFixed(1)}×`;
}

function formatBaseline(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return Number(value).toFixed(1);
}

function getSeverityClass(severity) {
  switch (severity) {
    case "CRITICAL":
      return "anomaly-critical";

    case "HIGH":
      return "anomaly-high";

    case "MEDIUM":
      return "anomaly-medium";

    default:
      return "anomaly-normal";
  }
}

function getRelationshipLabel(relationship) {
  switch (relationship) {
    case "ROOT_CAUSE_ANOMALY":
      return "ROOT-CAUSE ANOMALY";

    case "AFFECTED_SERVICE_ANOMALY":
      return "AFFECTED SERVICE";

    case "STANDALONE_ANOMALY":
      return "STANDALONE ANOMALY";

    default:
      return "INCIDENT CONTEXT";
  }
}

function AnomalyEarlyWarning({
  anomalyData,
  loading = false,
  onOpenService
}) {
  const anomalies =
    anomalyData?.anomalies || [];

  const anomalyCount =
    anomalyData?.anomaly_count || 0;

  const status =
    anomalyData?.status || "unknown";

  return (
    <section className="anomaly-warning-panel">
      <div className="anomaly-warning-header">
        <div>
          <div className="anomaly-eyebrow">
            BEHAVIORAL MONITORING
          </div>

          <h2>
            Anomaly & Early Warning
          </h2>

          <p>
            Detects services behaving unusually
            compared with their recent failure baseline.
          </p>
        </div>

        <div className="anomaly-header-status">
          <span
            className={
              anomalyCount > 0
                ? "anomaly-status-dot active"
                : "anomaly-status-dot"
            }
          />

          <span>
            {loading
              ? "Analyzing"
              : anomalyCount > 0
              ? `${anomalyCount} anomaly${
                  anomalyCount > 1 ? "ies" : ""
                } detected`
              : "No anomalies detected"}
          </span>
        </div>
      </div>

      {status === "insufficient_data" ? (
        <div className="anomaly-empty-state">
          <div className="anomaly-empty-icon">
            ◌
          </div>

          <div>
            <strong>
              Not enough historical data
            </strong>

            <p>
              More telemetry windows are required
              before reliable behavioral baselines
              can be established.
            </p>
          </div>
        </div>
      ) : anomalies.length === 0 ? (
        <div className="anomaly-clear-state">
          <div className="anomaly-clear-icon">
            ✓
          </div>

          <div>
            <strong>
              System behavior looks normal
            </strong>

            <p>
              No service currently exceeds the
              configured anomaly threshold.
            </p>
          </div>
        </div>
      ) : (
        <div className="anomaly-list">
          {anomalies.map((anomaly) => {
            const severityClass =
              getSeverityClass(
                anomaly.severity
              );

            const incidentContext =
              anomaly.incident_context || {};

            const relationship =
              incidentContext.relationship ||
              "STANDALONE_ANOMALY";

            const relatedIncidents =
              incidentContext.incidents || [];

            const primaryIncident =
              relatedIncidents[0] || null;

            return (
              <article
                key={anomaly.service}
                className={`anomaly-card ${severityClass}`}
              >
                <div className="anomaly-card-top">
                  <div className="anomaly-service-info">
                    <div className="anomaly-warning-icon">
                      !
                    </div>

                    <div>
                      <h3>
                        {anomaly.service}
                      </h3>

                      <span className="anomaly-subtitle">
                        Unusual failure behavior
                      </span>
                    </div>
                  </div>

                  <div
                    className={`anomaly-severity ${severityClass}`}
                  >
                    {anomaly.severity}
                  </div>
                </div>

                <div className="anomaly-metrics">
                  <div className="anomaly-metric">
                    <span>
                      CURRENT
                    </span>

                    <strong>
                      {anomaly.current_failures}
                    </strong>

                    <small>
                      failures / window
                    </small>
                  </div>

                  <div className="anomaly-metric">
                    <span>
                      BASELINE
                    </span>

                    <strong>
                      {formatBaseline(
                        anomaly.baseline_failures
                      )}
                    </strong>

                    <small>
                      failures / window
                    </small>
                  </div>

                  <div className="anomaly-metric">
                    <span>
                      DEVIATION
                    </span>

                    <strong>
                      {formatRatio(
                        anomaly.deviation_ratio
                      )}
                    </strong>

                    <small>
                      vs baseline
                    </small>
                  </div>

                  <div className="anomaly-metric">
                    <span>
                      SCORE
                    </span>

                    <strong>
                      {anomaly.anomaly_score}
                    </strong>

                    <small>
                      / 100
                    </small>
                  </div>
                </div>

                <div className="anomaly-score-section">
                  <div className="anomaly-score-label">
                    <span>
                      Behavioral deviation
                    </span>

                    <strong>
                      {anomaly.anomaly_score}/100
                    </strong>
                  </div>

                  <div className="anomaly-score-track">
                    <div
                      className="anomaly-score-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          anomaly.anomaly_score
                        )}%`
                      }}
                    />
                  </div>
                </div>

                {/* =====================================================
                    INCIDENT CONTEXT
                   ===================================================== */}

                <div className="anomaly-incident-context">
                  <div className="anomaly-context-header">
                    <span className="anomaly-context-eyebrow">
                      INCIDENT CONTEXT
                    </span>

                    <span
                      className={`anomaly-context-badge ${relationship.toLowerCase()}`}
                    >
                      {getRelationshipLabel(
                        relationship
                      )}
                    </span>
                  </div>

                  {primaryIncident ? (
                    <div className="anomaly-incident-content">
                      <div className="anomaly-incident-main">
                        <div className="anomaly-incident-icon">
                          ↗
                        </div>

                        <div className="anomaly-incident-details">
                          <strong>
                            {primaryIncident.incident_id}
                          </strong>

                          <span>
                            {primaryIncident.title}
                          </span>
                        </div>
                      </div>

                      <div className="anomaly-incident-meta">
                        <span>
                          Current RCA
                        </span>

                        <strong>
                          {primaryIncident.root_cause ||
                            "Unavailable"}
                        </strong>

                        <small>
                          {primaryIncident.confidence
                            ? `${primaryIncident.confidence} confidence`
                            : "RCA confidence unavailable"}
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div className="anomaly-standalone-content">
                      <span className="anomaly-standalone-icon">
                        ○
                      </span>

                      <div>
                        <strong>
                          No active incident associated
                        </strong>

                        <p>
                          This anomaly is currently
                          being observed independently
                          of the active incident set.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="anomaly-card-footer">
                  <div className="anomaly-explanation">
                    <span className="anomaly-footer-icon">
                      ⚠
                    </span>

                    <span>
                      Failure activity is{" "}
                      <strong>
                        {formatRatio(
                          anomaly.deviation_ratio
                        )}
                      </strong>{" "}
                      the historical baseline.
                    </span>
                  </div>

                  {onOpenService && (
                    <button
                      type="button"
                      className="anomaly-inspect-button"
                      onClick={() =>
                        onOpenService(
                          anomaly.service
                        )
                      }
                    >
                      Inspect service →
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="anomaly-warning-footer">
        <span>
          <strong>
            {anomalyData?.window_minutes || 5} min
          </strong>{" "}
          observation window
        </span>

        <span>
          Baseline:{" "}
          <strong>
            {anomalyData?.baseline_windows || 0}
          </strong>{" "}
          historical windows
        </span>

        <span>
          Behavioral anomaly ≠ root cause
        </span>
      </div>
    </section>
  );
}

export default AnomalyEarlyWarning;