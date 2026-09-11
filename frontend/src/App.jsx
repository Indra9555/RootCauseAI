import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [logs, setLogs] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [incidentsLoading, setIncidentsLoading] = useState(false);

  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");

  const [logSearch, setLogSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");

  const [incidentSelected, setIncidentSelected] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // =========================================================
  // INITIAL DATA
  // =========================================================

  useEffect(() => {
    fetchAnalysis();
    fetchLogs();
    fetchIncidents();
  }, []);

  // =========================================================
  // FETCH ANALYSIS
  // =========================================================

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/telemetry/analysis`
      );

      setAnalysis(response.data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to RootCauseAI backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH LOGS
  // =========================================================

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);

      const response = await axios.get(
        `${API_URL}/api/telemetry/logs`
      );

      setLogs(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  // =========================================================
  // FETCH INCIDENTS
  // =========================================================

  const fetchIncidents = async () => {
    try {
      setIncidentsLoading(true);

      const response = await axios.get(
        `${API_URL}/api/incidents`
      );

      setIncidents(response.data);
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
    } finally {
      setIncidentsLoading(false);
    }
  };

  // =========================================================
  // FETCH SINGLE INCIDENT
  // =========================================================

  const fetchIncidentDetails = async (incidentId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/incidents/${incidentId}`
      );

      setSelectedIncident(response.data);
      setIncidentSelected(true);
    } catch (err) {
      console.error(
        "Failed to fetch incident details:",
        err
      );
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const refreshDashboard = async () => {
    await Promise.all([
      fetchAnalysis(),
      fetchLogs(),
      fetchIncidents()
    ]);
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleNavigation = (page) => {
    setActivePage(page);

    if (page !== "Incidents") {
      setIncidentSelected(false);
      setSelectedIncident(null);
    }
  };

  // =========================================================
  // DERIVED DATA
  // =========================================================

  const patterns = analysis?.patterns || {};

  const rawRootCause = analysis?.root_cause;

  const rootCause =
    typeof rawRootCause === "string"
      ? {
          root_cause: rawRootCause,
          confidence:
            analysis?.confidence || "Unknown",
          reason:
            analysis?.reason ||
            "No root-cause explanation is currently available.",
          evidence:
            analysis?.evidence || [],
          recommendations:
            analysis?.recommendations || []
        }
      : rawRootCause || {};

  const correlations =
    analysis?.correlations || {};

  const candidates =
    analysis?.candidates || [];

  const temporalAnalysis =
    analysis?.temporal_analysis || [];

  const services = Object.keys(patterns);

  const totalFailures = Object.values(
    patterns
  ).reduce((total, service) => {
    if (typeof service === "number") {
      return total + service;
    }

    return (
      total +
      (service?.total_failures || 0)
    );
  }, 0);

  const criticalEvents = Object.values(
    patterns
  ).reduce((total, service) => {
    if (typeof service === "number") {
      return total;
    }

    return (
      total +
      (service?.critical_count || 0)
    );
  }, 0);

  const failingServices = services.filter(
    (service) =>
      typeof patterns[service] === "number"
        ? patterns[service] > 0
        : (
            patterns[service]
              ?.total_failures || 0
          ) > 0
  );

  const uniqueServices = useMemo(() => {
    return [
      ...new Set(
        logs.map((log) => log.service)
      )
    ];
  }, [logs]);

  const uniqueLevels = useMemo(() => {
    return [
      ...new Set(
        logs.map((log) => log.level)
      )
    ];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const search =
        logSearch.toLowerCase();

      const matchesSearch =
        !search ||
        log.message
          ?.toLowerCase()
          .includes(search) ||
        log.service
          ?.toLowerCase()
          .includes(search) ||
        log.level
          ?.toLowerCase()
          .includes(search);

      const matchesService =
        serviceFilter === "All" ||
        log.service === serviceFilter;

      const matchesLevel =
        levelFilter === "All" ||
        log.level === levelFilter;

      return (
        matchesSearch &&
        matchesService &&
        matchesLevel
      );
    });
  }, [
    logs,
    logSearch,
    serviceFilter,
    levelFilter
  ]);

  const getLevelClass = (level) => {
    const normalized =
      String(level || "").toLowerCase();

    if (normalized === "critical") {
      return "level-critical";
    }

    if (normalized === "error") {
      return "level-error";
    }

    if (
      normalized === "warning" ||
      normalized === "warn"
    ) {
      return "level-warning";
    }

    return "level-info";
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return "Unknown";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleString();
  };

  // =========================================================
  // DASHBOARD
  // =========================================================

  const renderDashboard = () => (
    <>
      <div className="topbar">
        <div>
          <span className="eyebrow">
            SYSTEM OVERVIEW
          </span>

          <h1>Root Cause Dashboard</h1>

          <p>
            Real-time software failure intelligence
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={refreshDashboard}
          disabled={loading}
        >
          ↻ Refresh Analysis
        </button>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Services</span>
          <strong>{services.length}</strong>
          <small>Monitored services</small>
        </div>

        <div className="stat-card">
          <span>Total Failures</span>
          <strong>{totalFailures}</strong>
          <small>Detected failures</small>
        </div>

        <div className="stat-card">
          <span>Critical Events</span>
          <strong>{criticalEvents}</strong>
          <small>Critical severity</small>
        </div>

        <div className="stat-card root-stat">
          <span>Root Cause</span>

          <strong>
            {rootCause.root_cause ||
              "Unknown"}
          </strong>

          <small>
            {rootCause.confidence ||
              "Unknown"}{" "}
            confidence
          </small>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                SERVICE HEALTH
              </span>

              <h2>Monitored Services</h2>
            </div>

            <span className="panel-count">
              {services.length} services
            </span>
          </div>

          <div className="services-grid">
            {services.map((service) => {
              const serviceData =
                patterns[service];

              const failures =
                serviceData?.total_failures ||
                0;

              const isRoot =
                service ===
                rootCause.root_cause;

              return (
                <div
                  className={`service-card ${
                    isRoot
                      ? "service-root"
                      : ""
                  }`}
                  key={service}
                >
                  <div className="service-top">
                    <div className="service-icon">
                      {service
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {service}
                      </strong>

                      <span>
                        {failures > 0
                          ? `${failures} failures detected`
                          : "Upstream dependency"}
                      </span>
                    </div>
                  </div>

                  <div className="service-status">
                    <span
                      className={
                        failures > 0
                          ? "status-danger"
                          : "status-warning"
                      }
                    >
                      {failures > 0
                        ? "Attention"
                        : "Dependency"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel root-cause-card">
          <span className="eyebrow">
            ROOT CAUSE ANALYSIS
          </span>

          <h2>Most likely root cause</h2>

          <div className="root-cause-name">
            {rootCause.root_cause ||
              "Unknown"}
          </div>

          <div className="confidence-badge">
            Confidence:{" "}
            {rootCause.confidence ||
              "Unknown"}
          </div>

          <p className="root-cause-reason">
            {rootCause.reason ||
              "No root-cause explanation is currently available."}
          </p>

          {rootCause.evidence?.length >
            0 && (
            <div className="evidence">
              <strong>Evidence</strong>

              {rootCause.evidence.map(
                (item, index) => (
                  <div
                    className="evidence-item"
                    key={index}
                  >
                    <span>✓</span>
                    {item}
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">
              ERROR CORRELATION
            </span>

            <h2>
              Common Failure Patterns
            </h2>
          </div>
        </div>

        <div className="correlation-list">
          {Object.entries(
            correlations
          ).map(
            ([keyword, data]) => (
              <div
                className="correlation-item"
                key={keyword}
              >
                <div>
                  <strong>
                    {keyword}
                  </strong>

                  <span>
                    {data.services?.join(
                      ", "
                    ) ||
                      "Unknown services"}
                  </span>
                </div>

                <div className="correlation-count">
                  {data.count}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">
              DEPENDENCY IMPACT
            </span>

            <h2>
              Services affected by{" "}
              {rootCause.root_cause}
            </h2>
          </div>
        </div>

        <div className="dependency-flow">
          <div className="dependency-root">
            <strong>
              {rootCause.root_cause ||
                "Unknown"}
            </strong>

            <span>Root Cause</span>
          </div>

          <div className="dependency-arrow">
            ↓ affects
          </div>

          <div className="dependency-services">
            {failingServices.map(
              (service) => (
                <div
                  className="dependency-service"
                  key={service}
                >
                  <strong>
                    {service}
                  </strong>

                  <span>
                    {patterns[service]
                      ?.total_failures ||
                      0}{" "}
                    failures
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="panel timeline-card">
        <div className="panel-header">
          <div>
            <span className="eyebrow">
              INCIDENT TIMELINE
            </span>

            <h2>Failure sequence</h2>
          </div>
        </div>

        <div className="timeline">
          {temporalAnalysis.map(
            (item, index) => (
              <div
                className="timeline-item"
                key={index}
              >
                <div className="timeline-marker" />

                <div className="timeline-content">
                  <span className="timeline-time">
                    {formatTimestamp(
                      item.first_failure
                    )}
                  </span>

                  <strong>
                    {item.service}
                  </strong>

                  <p>
                    First detected failure
                  </p>
                </div>
              </div>
            )
          )}

          {rootCause.root_cause && (
            <div className="timeline-item root-timeline">
              <div className="timeline-marker root-marker">
                !
              </div>

              <div className="timeline-content">
                <span className="timeline-time">
                  Analysis result
                </span>

                <strong>
                  {rootCause.root_cause}
                </strong>

                <p>
                  Identified as the most likely
                  root cause
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {rootCause.recommendations?.length >
        0 && (
        <section className="recommendation">
          <div className="recommendation-icon">
            !
          </div>

          <div>
            <span className="eyebrow">
              RECOMMENDATION
            </span>

            <h3>
              Investigate{" "}
              {rootCause.root_cause}
            </h3>

            <p>
              {rootCause.recommendations[0]}
            </p>
          </div>
        </section>
      )}
    </>
  );

  // =========================================================
  // SERVICES
  // =========================================================

  const renderServices = () => (
    <>
      <div className="topbar">
        <div>
          <span className="eyebrow">
            SERVICES
          </span>

          <h1>Service Health</h1>

          <p>
            Monitor service failures and RCA
            scores
          </p>
        </div>
      </div>

      <section className="service-detail-grid">
        {services.map((service) => {
          const data =
            patterns[service] || {};

          const candidate =
            candidates.find(
              (item) =>
                item.service === service
            );

          const isRoot =
            service ===
            rootCause.root_cause;

          return (
            <div
              className={`service-detail-card ${
                isRoot
                  ? "highlight-root"
                  : ""
              }`}
              key={service}
            >
              <div className="service-detail-header">
                <div className="service-icon large">
                  {service
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2>{service}</h2>

                  <span>
                    {isRoot
                      ? "Most likely root cause"
                      : data.total_failures >
                        0
                      ? "Failure detected"
                      : "Upstream dependency"}
                  </span>
                </div>
              </div>

              <div className="service-metrics">
                <div>
                  <span>Failures</span>
                  <strong>
                    {data.total_failures ||
                      0}
                  </strong>
                </div>

                <div>
                  <span>Errors</span>
                  <strong>
                    {data.error_count ||
                      0}
                  </strong>
                </div>

                <div>
                  <span>Critical</span>
                  <strong>
                    {data.critical_count ||
                      0}
                  </strong>
                </div>

                <div>
                  <span>RCA Score</span>
                  <strong>
                    {candidate?.score ||
                      0}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );

  // =========================================================
  // INCIDENT LIST
  // =========================================================

  const renderIncidentList = () => (
    <>
      <div className="topbar">
        <div>
          <span className="eyebrow">
            INCIDENTS
          </span>

          <h1>Incident Overview</h1>

          <p>
            Failure events detected by
            RootCauseAI
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchIncidents}
          disabled={incidentsLoading}
        >
          {incidentsLoading
            ? "Refreshing..."
            : "↻ Refresh Incidents"}
        </button>
      </div>

      {incidentsLoading &&
      incidents.length === 0 ? (
        <section className="incident-list-card">
          <div className="logs-empty">
            <div className="mini-spinner" />
            <p>
              Loading incidents...
            </p>
          </div>
        </section>
      ) : incidents.length === 0 ? (
        <section className="incident-list-card">
          <div className="logs-empty">
            <div className="empty-icon">
              !
            </div>

            <h3>
              No incidents found
            </h3>

            <p>
              RootCauseAI has not detected any
              persisted incidents yet.
            </p>
          </div>
        </section>
      ) : (
        incidents.map((incident) => (
          <section
            className="incident-list-card"
            key={incident.incident_id}
          >
            <div className="incident-list-header">
              <div className="incident-status-dot" />

              <div>
                <span className="eyebrow">
                  {incident.status ===
                  "ACTIVE"
                    ? "ACTIVE INCIDENT"
                    : "INCIDENT"}
                </span>

                <h2>
                  {incident.title}
                </h2>

                <p>
                  {incident.explanation ||
                    "RootCauseAI detected a software failure incident."}
                </p>
              </div>

              <span className="incident-badge">
                {incident.status}
              </span>
            </div>

            <div className="incident-list-metrics">
              <div>
                <span>Incident ID</span>
                <strong>
                  {incident.incident_id}
                </strong>
              </div>

              <div>
                <span>Root Cause</span>
                <strong>
                  {incident.root_cause ||
                    "Unknown"}
                </strong>
              </div>

              <div>
                <span>Affected Services</span>
                <strong>
                  {incident.affected_services
                    ?.length || 0}
                </strong>
              </div>

              <div>
                <span>Failures</span>
                <strong>
                  {incident.failure_count}
                </strong>
              </div>

              <div>
                <span>Confidence</span>
                <strong>
                  {incident.confidence ||
                    "Unknown"}
                </strong>
              </div>
            </div>

            <button
              className="incident-open-button"
              onClick={() =>
                fetchIncidentDetails(
                  incident.incident_id
                )
              }
            >
              View Incident Details →
            </button>
          </section>
        ))
      )}
    </>
  );

  // =========================================================
  // INCIDENT DETAILS
  // =========================================================

  const renderIncidentDetails = () => {
    const incident =
      selectedIncident;

    if (!incident) {
      return (
        <section className="panel">
          <p>
            Loading incident details...
          </p>
        </section>
      );
    }

    const incidentServices =
      incident.affected_services ||
      [];

    const incidentEvidence =
      incident.evidence || [];

    const incidentRecommendations =
      incident.recommendations || [];

    return (
      <>
        <div className="topbar">
          <div>
            <button
              className="back-button"
              onClick={() => {
                setIncidentSelected(
                  false
                );
                setSelectedIncident(
                  null
                );
              }}
            >
              ← Back to Incidents
            </button>

            <span className="eyebrow incident-eyebrow">
              INCIDENT DETAILS
            </span>

            <h1>
              {incident.title}
            </h1>

            <p>
              RootCauseAI incident
              investigation
            </p>
          </div>

          <div className="incident-detail-status">
            <span className="incident-status-dot" />

            {incident.status}
          </div>
        </div>

        {/* Incident identity */}
        <section className="incident-identity">
          <div>
            <span className="eyebrow">
              INCIDENT ID
            </span>

            <strong>
              {incident.incident_id}
            </strong>
          </div>

          <div>
            <span className="eyebrow">
              DETECTED FAILURES
            </span>

            <strong>
              {incident.failure_count}
            </strong>
          </div>

          <div>
            <span className="eyebrow">
              AFFECTED SERVICES
            </span>

            <strong>
              {incidentServices.length}
            </strong>
          </div>

          <div>
            <span className="eyebrow">
              ROOT CAUSE
            </span>

            <strong>
              {incident.root_cause ||
                "Unknown"}
            </strong>
          </div>
        </section>

        {/* Additional incident metadata */}
        <section className="incident-identity">
          <div>
            <span className="eyebrow">
              SEVERITY
            </span>

            <strong>
              {incident.severity ||
                "Unknown"}
            </strong>
          </div>

          <div>
            <span className="eyebrow">
              CONFIDENCE
            </span>

            <strong>
              {incident.confidence ||
                "Unknown"}
            </strong>
          </div>

          <div>
            <span className="eyebrow">
              STARTED
            </span>

            <strong>
              {formatTimestamp(
                incident.started_at
              )}
            </strong>
          </div>

          <div>
            <span className="eyebrow">
              CREATED
            </span>

            <strong>
              {formatTimestamp(
                incident.created_at
              )}
            </strong>
          </div>
        </section>

        <div className="incident-detail-grid">
          {/* Root cause */}
          <section className="panel incident-root-panel">
            <span className="eyebrow">
              ROOT CAUSE
            </span>

            <h2>
              {incident.root_cause ||
                "Unknown"}
            </h2>

            <span className="confidence-badge">
              {incident.confidence ||
                "Unknown"}{" "}
              confidence
            </span>

            <p>
              {incident.explanation ||
                "No root cause explanation available."}
            </p>

            <div className="incident-evidence">
              <h3>Evidence</h3>

              {incidentEvidence.length >
              0 ? (
                incidentEvidence.map(
                  (item, index) => (
                    <div
                      className="evidence-item"
                      key={index}
                    >
                      <span>✓</span>
                      {item}
                    </div>
                  )
                )
              ) : (
                <p>
                  No evidence available.
                </p>
              )}
            </div>
          </section>

          {/* Impact */}
          <section className="panel">
            <span className="eyebrow">
              IMPACT
            </span>

            <h2>
              Affected Services
            </h2>

            <div className="impact-list">
              {incidentServices.map(
                (service) => {
                  const serviceData =
                    patterns[service];

                  return (
                    <div
                      className="impact-row"
                      key={service}
                    >
                      <div className="impact-service">
                        <div className="service-icon">
                          {service
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <strong>
                          {service}
                        </strong>
                      </div>

                      <span>
                        {serviceData
                          ?.total_failures ||
                          0}{" "}
                        failures
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        </div>

        {/* Timeline */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                TIMELINE
              </span>

              <h2>
                Failure sequence
              </h2>
            </div>
          </div>

          <div className="timeline incident-timeline">
            {temporalAnalysis.map(
              (item, index) => (
                <div
                  className="timeline-item"
                  key={index}
                >
                  <div className="timeline-marker" />

                  <div className="timeline-content">
                    <span className="timeline-time">
                      {formatTimestamp(
                        item.first_failure
                      )}
                    </span>

                    <strong>
                      {item.service}
                    </strong>

                    <p>
                      First detected failure
                    </p>
                  </div>
                </div>
              )
            )}

            <div className="timeline-item root-timeline">
              <div className="timeline-marker root-marker">
                !
              </div>

              <div className="timeline-content">
                <span className="timeline-time">
                  RCA completed
                </span>

                <strong>
                  {incident.root_cause ||
                    "Unknown"}
                </strong>

                <p>
                  Identified as the most
                  likely upstream cause
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Correlations */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                CORRELATED SIGNALS
              </span>

              <h2>
                Failure patterns
              </h2>
            </div>
          </div>

          <div className="correlation-list">
            {Object.entries(
              correlations
            ).map(
              ([keyword, data]) => (
                <div
                  className="correlation-item"
                  key={keyword}
                >
                  <div>
                    <strong>
                      {keyword}
                    </strong>

                    <span>
                      {data.services?.join(
                        ", "
                      ) ||
                        "Unknown services"}
                    </span>
                  </div>

                  <div className="correlation-count">
                    {data.count}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Raw logs */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                INCIDENT LOGS
              </span>

              <h2>
                Related telemetry
              </h2>
            </div>

            <span className="panel-count">
              {logs.length} logs
            </span>
          </div>

          <div className="incident-log-list">
            {logs.map((log) => (
              <div
                className="incident-log-row"
                key={log.id}
              >
                <span className="incident-log-time">
                  {formatTimestamp(
                    log.timestamp
                  )}
                </span>

                <span className="service-badge">
                  {log.service}
                </span>

                <span
                  className={`level-badge ${getLevelClass(
                    log.level
                  )}`}
                >
                  {log.level}
                </span>

                <span className="incident-log-message">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recommendation */}
        {incidentRecommendations.length >
          0 && (
          <section className="recommendation">
            <div className="recommendation-icon">
              !
            </div>

            <div>
              <span className="eyebrow">
                RECOMMENDED ACTION
              </span>

              <h3>
                Investigate{" "}
                {incident.root_cause ||
                  "root cause"}
              </h3>

              <p>
                {
                  incidentRecommendations[0]
                }
              </p>
            </div>
          </section>
        )}
      </>
    );
  };

  // =========================================================
  // LOGS
  // =========================================================

  const renderLogs = () => (
    <>
      <div className="topbar">
        <div>
          <span className="eyebrow">
            TELEMETRY
          </span>

          <h1>System Logs</h1>

          <p>
            Raw telemetry collected by
            RootCauseAI
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchLogs}
          disabled={logsLoading}
        >
          {logsLoading
            ? "Refreshing..."
            : "↻ Refresh Logs"}
        </button>
      </div>

      <section className="panel logs-panel">
        <div className="logs-toolbar">
          <div className="log-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search logs..."
              value={logSearch}
              onChange={(e) =>
                setLogSearch(
                  e.target.value
                )
              }
            />
          </div>

          <select
            value={serviceFilter}
            onChange={(e) =>
              setServiceFilter(
                e.target.value
              )
            }
          >
            <option value="All">
              All Services
            </option>

            {uniqueServices.map(
              (service) => (
                <option
                  value={service}
                  key={service}
                >
                  {service}
                </option>
              )
            )}
          </select>

          <select
            value={levelFilter}
            onChange={(e) =>
              setLevelFilter(
                e.target.value
              )
            }
          >
            <option value="All">
              All Levels
            </option>

            {uniqueLevels.map(
              (level) => (
                <option
                  value={level}
                  key={level}
                >
                  {level}
                </option>
              )
            )}
          </select>
        </div>

        <div className="logs-summary">
          <span>
            Showing{" "}
            <strong>
              {filteredLogs.length}
            </strong>{" "}
            of{" "}
            <strong>
              {logs.length}
            </strong>{" "}
            logs
          </span>

          {(logSearch ||
            serviceFilter !== "All" ||
            levelFilter !== "All") && (
            <button
              className="clear-filters"
              onClick={() => {
                setLogSearch("");
                setServiceFilter(
                  "All"
                );
                setLevelFilter(
                  "All"
                );
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {logsLoading ? (
          <div className="logs-empty">
            <div className="mini-spinner" />

            <p>
              Loading telemetry...
            </p>
          </div>
        ) : filteredLogs.length ===
          0 ? (
          <div className="logs-empty">
            <div className="empty-icon">
              ⌁
            </div>

            <h3>
              No logs found
            </h3>

            <p>
              Try changing your search
              or filter settings.
            </p>
          </div>
        ) : (
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Service</th>
                  <th>Level</th>
                  <th>Message</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map(
                  (log) => (
                    <tr key={log.id}>
                      <td className="log-time">
                        {formatTimestamp(
                          log.timestamp
                        )}
                      </td>

                      <td>
                        <span className="service-badge">
                          {log.service}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`level-badge ${getLevelClass(
                            log.level
                          )}`}
                        >
                          {log.level}
                        </span>
                      </td>

                      <td className="log-message">
                        {log.message}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );

  // =========================================================
  // ANALYSIS
  // =========================================================

  const renderAnalysis = () => (
    <>
      <div className="topbar">
        <div>
          <span className="eyebrow">
            ANALYSIS ENGINE
          </span>

          <h1>
            Root Cause Analysis
          </h1>

          <p>
            Evidence-based failure
            candidate ranking
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchAnalysis}
          disabled={loading}
        >
          ↻ Run Analysis
        </button>
      </div>

      <section className="panel analysis-main">
        <div className="analysis-result">
          <span className="eyebrow">
            MOST LIKELY ROOT CAUSE
          </span>

          <h2>
            {rootCause.root_cause ||
              "Unknown"}
          </h2>

          <span className="confidence-badge">
            {rootCause.confidence ||
              "Unknown"}{" "}
            confidence
          </span>

          <p>
            {rootCause.reason ||
              "No explanation is currently available."}
          </p>
        </div>

        <div className="analysis-evidence">
          <h3>Evidence</h3>

          {rootCause.evidence?.length ? (
            rootCause.evidence.map(
              (item, index) => (
                <div
                  className="evidence-item"
                  key={index}
                >
                  <span>✓</span>
                  {item}
                </div>
              )
            )
          ) : (
            <p>
              No evidence available.
            </p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">
              CANDIDATE RANKING
            </span>

            <h2>
              Root Cause Candidates
            </h2>
          </div>
        </div>

        <div className="candidate-list">
          {candidates.map(
            (candidate, index) => (
              <div
                className="candidate-card"
                key={candidate.service}
              >
                <div className="candidate-rank">
                  #{index + 1}
                </div>

                <div className="candidate-info">
                  <strong>
                    {candidate.service}
                  </strong>

                  <span>
                    Overall RCA score:{" "}
                    {candidate.score}
                  </span>
                </div>

                <div className="candidate-scores">
                  <span>
                    Failure{" "}
                    <strong>
                      {
                        candidate.failure_score
                      }
                    </strong>
                  </span>

                  <span>
                    Temporal{" "}
                    <strong>
                      {
                        candidate.temporal_score
                      }
                    </strong>
                  </span>

                  <span>
                    Correlation{" "}
                    <strong>
                      {
                        candidate.correlation_score
                      }
                    </strong>
                  </span>

                  <span>
                    Dependency{" "}
                    <strong>
                      {
                        candidate.dependency_score
                      }
                    </strong>
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </>
  );

  // =========================================================
  // PAGE ROUTING
  // =========================================================

  const renderPage = () => {
    if (
      activePage === "Incidents" &&
      incidentSelected
    ) {
      return renderIncidentDetails();
    }

    switch (activePage) {
      case "Services":
        return renderServices();

      case "Incidents":
        return renderIncidentList();

      case "Logs":
        return renderLogs();

      case "Analysis":
        return renderAnalysis();

      default:
        return renderDashboard();
    }
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading && !analysis) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          R
        </div>

        <h2>RootCauseAI</h2>

        <p>
          Loading system intelligence...
        </p>
      </div>
    );
  }

  // =========================================================
  // ERROR SCREEN
  // =========================================================

  if (error && !analysis) {
    return (
      <div className="error-screen">
        <div className="error-icon">
          !
        </div>

        <h2>
          Backend unavailable
        </h2>

        <p>{error}</p>

        <button
          className="refresh-button"
          onClick={fetchAnalysis}
        >
          Try Again
        </button>
      </div>
    );
  }

  // =========================================================
  // APP
  // =========================================================

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            R
          </div>

          <div>
            <strong>
              RootCauseAI
            </strong>

            <span>
              System Intelligence
            </span>
          </div>
        </div>

        <nav>
          {[
            "Dashboard",
            "Services",
            "Incidents",
            "Logs",
            "Analysis"
          ].map((page) => (
            <a
              key={page}
              className={
                activePage === page
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleNavigation(
                  page
                )
              }
            >
              <span className="nav-dot" />

              {page}
            </a>
          ))}
        </nav>

        <div className="sidebar-status">
          <span className="live-dot" />

          <div>
            <strong>
              Backend Connected
            </strong>

            <span>
              Live analysis enabled
            </span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;