import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import axios from "axios";
import "./App.css";
import "./ServiceDrilldown.css";
import "./IncidentCorrelation.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logIntelligence, setLogIntelligence] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [serviceHealth, setServiceHealth] = useState(null);

  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [incidentAnalysisLoading, setIncidentAnalysisLoading] =
    useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");

  const [logSearch, setLogSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [selectedService, setSelectedService] = useState(null);

  const [incidentSelected, setIncidentSelected] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentEvents, setIncidentEvents] = useState([]);
  const [incidentAnalysis, setIncidentAnalysis] = useState(null);

  const selectedIncidentIdRef = useRef(null);

  useEffect(() => {
    selectedIncidentIdRef.current =
      selectedIncident?.incident_id || null;
  }, [selectedIncident]);

  // =========================================================
  // FETCH ANALYSIS
  // =========================================================

  const fetchAnalysis = useCallback(async (options = {}) => {
    const silent = options.silent === true;

    try {
      if (!silent) {
        setLoading(true);
        setError("");
      }

      const response = await axios.get(
        `${API_URL}/api/telemetry/analysis`
      );

      setAnalysis(response.data);
    } catch (err) {
      console.error(err);

      if (!silent) {
        setError(
          "Unable to connect to RootCauseAI backend."
        );
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  // =========================================================
  // FETCH LOGS
  // =========================================================

  const fetchLogs = useCallback(async (options = {}) => {
    const silent = options.silent === true;

    try {
      if (!silent) {
        setLogsLoading(true);
      }

      const response = await axios.get(
        `${API_URL}/api/telemetry/logs`
      );

      setLogs(response.data);
    } catch (err) {
      console.error(
        "Failed to fetch logs:",
        err
      );
    } finally {
      if (!silent) {
        setLogsLoading(false);
      }
    }
  }, []);

  // =========================================================
  // FETCH LOG INTELLIGENCE
  // =========================================================

  const fetchLogIntelligence = useCallback(
    async (options = {}) => {
      try {
        const response = await axios.get(
          `${API_URL}/api/telemetry/intelligence`
        );

        setLogIntelligence(response.data);
      } catch (err) {
        console.error(
          "Failed to fetch log intelligence:",
          err
        );
      }
    },
    []
  );

  // =========================================================
  // FETCH INCIDENTS
  // =========================================================

  const fetchIncidents = useCallback(async (options = {}) => {
    const silent = options.silent === true;

    try {
      if (!silent) {
        setIncidentsLoading(true);
      }

      const response = await axios.get(
        `${API_URL}/api/incidents`
      );

      setIncidents(response.data);
    } catch (err) {
      console.error(
        "Failed to fetch incidents:",
        err
      );
    } finally {
      if (!silent) {
        setIncidentsLoading(false);
      }
    }
  }, []);

  // =========================================================
  // FETCH SERVICES
  // =========================================================

  const fetchServices = useCallback(async (options = {}) => {
    const silent = options.silent === true;

    try {
      if (!silent) {
        setServicesLoading(true);
      }

      const response = await axios.get(
        `${API_URL}/api/services`
      );

      setServiceHealth(response.data);
    } catch (err) {
      console.error(
        "Failed to fetch service health:",
        err
      );
    } finally {
      if (!silent) {
        setServicesLoading(false);
      }
    }
  }, []);

  // =========================================================
  // FETCH SINGLE INCIDENT
  // =========================================================

  const fetchIncidentDetails = useCallback(
    async (incidentId, options = {}) => {
      const silent = options.silent === true;

      try {
        if (!silent) {
          setEventsLoading(true);
          setIncidentAnalysisLoading(true);
        }

        const [
          incidentResponse,
          eventsResponse,
          analysisResponse
        ] = await Promise.all([
          axios.get(
            `${API_URL}/api/incidents/${incidentId}`
          ),
          axios.get(
            `${API_URL}/api/incidents/${incidentId}/events`
          ),
          axios.get(
            `${API_URL}/api/incidents/${incidentId}/analysis`
          )
        ]);

        setSelectedIncident(
          incidentResponse.data
        );

        setIncidentEvents(
          [...eventsResponse.data].sort(
            (a, b) =>
              new Date(a.timestamp) -
              new Date(b.timestamp)
          )
        );

        setIncidentAnalysis(
          analysisResponse.data
        );

        setIncidentSelected(true);
      } catch (err) {
        console.error(
          "Failed to fetch incident details:",
          err
        );
      } finally {
        if (!silent) {
          setEventsLoading(false);
          setIncidentAnalysisLoading(false);
        }
      }
    },
    []
  );

  // =========================================================
  // INITIAL DATA
  // =========================================================

  useEffect(() => {
    fetchAnalysis();
    fetchLogs();
    fetchLogIntelligence();
    fetchIncidents();
    fetchServices();
  }, [
    fetchAnalysis,
    fetchLogs,
    fetchLogIntelligence,
    fetchIncidents,
    fetchServices
  ]);

  // =========================================================
  // REAL-TIME POLLING
  // =========================================================

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await Promise.all([
          fetchAnalysis({ silent: true }),
          fetchLogs({ silent: true }),
          fetchLogIntelligence({ silent: true }),
          fetchIncidents({ silent: true }),
          fetchServices({ silent: true })
        ]);

        const incidentId =
          selectedIncidentIdRef.current;

        if (incidentId) {
          await fetchIncidentDetails(
            incidentId,
            { silent: true }
          );
        }
      } catch (err) {
        console.error(
          "Real-time refresh failed:",
          err
        );
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [
    fetchAnalysis,
    fetchLogs,
    fetchLogIntelligence,
    fetchIncidents,
    fetchServices,
    fetchIncidentDetails
  ]);

  // =========================================================
  // REFRESH
  // =========================================================

  const refreshDashboard = async () => {
    await Promise.all([
      fetchAnalysis(),
      fetchLogs(),
      fetchLogIntelligence(),
      fetchIncidents(),
      fetchServices()
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
      setIncidentEvents([]);
      setIncidentAnalysis(null);
    }

    if (page !== "Services") {
      setSelectedService(null);
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
          evidence: analysis?.evidence || [],
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

  const backendServices =
    serviceHealth?.services || [];

  const serviceSummary =
    serviceHealth?.summary || {
      total: 0,
      healthy: 0,
      degraded: 0,
      critical: 0
    };

  const services =
    backendServices.length > 0
      ? backendServices.map(
          (service) => service.service
        )
      : Object.keys(patterns);

  const totalFailures =
    Object.values(patterns).reduce(
      (total, service) => {
        if (typeof service === "number") {
          return total + service;
        }

        return (
          total +
          (service?.total_failures || 0)
        );
      },
      0
    );

  const criticalEvents =
    Object.values(patterns).reduce(
      (total, service) => {
        if (typeof service === "number") {
          return total;
        }

        return (
          total +
          (service?.critical_count || 0)
        );
      },
      0
    );

  const failingServices =
    backendServices.length > 0
      ? backendServices
          .filter(
            (service) =>
              service.health !== "HEALTHY"
          )
          .map(
            (service) =>
              service.service
          )
      : services.filter(
          (service) =>
            typeof patterns[service] === "number"
              ? patterns[service] > 0
              : (patterns[service]?.total_failures || 0) >
                0
        );

  const activeIncidents =
    incidents.filter(
      (incident) =>
        String(incident.status).toUpperCase() ===
        "ACTIVE"
    );

  const resolvedIncidents =
    incidents.filter(
      (incident) =>
        String(incident.status).toUpperCase() ===
        "RESOLVED"
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

  const intelligenceServiceCounts =
    logIntelligence?.service_failure_counts || {};

  const intelligenceMessageCounts =
    logIntelligence?.message_frequency || {};

  const topFailingService = useMemo(() => {
    const entries = Object.entries(
      intelligenceServiceCounts
    );

    if (entries.length === 0) {
      return {
        service: "None",
        count: 0
      };
    }

    entries.sort(
      (a, b) => Number(b[1]) - Number(a[1])
    );

    return {
      service: entries[0][0],
      count: Number(entries[0][1]) || 0
    };
  }, [intelligenceServiceCounts]);

  const topFailureMessage = useMemo(() => {
    const entries = Object.entries(
      intelligenceMessageCounts
    );

    if (entries.length === 0) {
      return {
        message: "None",
        count: 0
      };
    }

    entries.sort(
      (a, b) => Number(b[1]) - Number(a[1])
    );

    return {
      message: entries[0][0],
      count: Number(entries[0][1]) || 0
    };
  }, [intelligenceMessageCounts]);

  const topServiceEntries = useMemo(() => {
    return Object.entries(
      intelligenceServiceCounts
    )
      .map(([service, count]) => ({
        service,
        count: Number(count) || 0
      }))
      .sort(
        (a, b) => b.count - a.count
      );
  }, [intelligenceServiceCounts]);

  const topMessageEntries = useMemo(() => {
    return Object.entries(
      intelligenceMessageCounts
    )
      .map(([message, count]) => ({
        message,
        count: Number(count) || 0
      }))
      .sort(
        (a, b) => b.count - a.count
      )
      .slice(0, 5);
  }, [intelligenceMessageCounts]);

  const investigationSignals = useMemo(() => {
    const message = String(
      topFailureMessage.message || ""
    ).toLowerCase();

    let action =
      "Inspect recent failures and correlate them with service dependencies.";

    if (
      message.includes("database") ||
      message.includes("connection") ||
      message.includes("query")
    ) {
      action =
        "Investigate database availability, connection pools, timeouts, and dependent services.";
    } else if (
      message.includes("timeout") ||
      message.includes("latency")
    ) {
      action =
        "Check service latency, upstream dependencies, and request timeout thresholds.";
    } else if (
      message.includes("auth") ||
      message.includes("permission")
    ) {
      action =
        "Check authentication, authorization, credentials, and recent access-policy changes.";
    } else if (
      message.includes("memory") ||
      message.includes("cpu") ||
      message.includes("resource")
    ) {
      action =
        "Inspect resource utilization, saturation, and recent workload changes.";
    }

    return [
      {
        label: "Primary hotspot",
        value: topFailingService.service,
        detail: `${topFailingService.count} recorded failures`,
        icon: "!"
      },
      {
        label: "Recurring signal",
        value: topFailureMessage.message,
        detail: `${topFailureMessage.count} occurrences`,
        icon: "↻"
      },
      {
        label: "Recommended investigation",
        value: action,
        detail: "Derived from the dominant failure pattern",
        icon: "→"
      }
    ];
  }, [
    topFailingService,
    topFailureMessage
  ]);

  // =========================================================
  // HELPERS
  // =========================================================

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

  const getEventClass = (eventType) => {
    switch (eventType) {
      case "INCIDENT_CREATED":
        return "event-created";

      case "FAILURE_DETECTED":
        return "event-failure";

      case "RCA_UPDATED":
        return "event-rca";

      case "INCIDENT_RESOLVED":
        return "event-resolved";

      default:
        return "event-default";
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case "INCIDENT_CREATED":
        return "+";

      case "FAILURE_DETECTED":
        return "!";

      case "RCA_UPDATED":
        return "R";

      case "INCIDENT_RESOLVED":
        return "✓";

      default:
        return "•";
    }
  };

  const formatEventType = (eventType) => {
    return String(eventType || "")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
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

  const getConfidenceClass = (confidence) => {
    const value =
      String(confidence || "").toLowerCase();

    if (value === "high") {
      return "confidence-high";
    }

    if (value === "medium") {
      return "confidence-medium";
    }

    if (value === "low") {
      return "confidence-low";
    }

    return "";
  };

  const getIncidentStatusClass = (status) => {
    const value =
      String(status || "").toLowerCase();

    if (value === "active") {
      return "incident-active";
    }

    if (value === "resolved") {
      return "incident-resolved";
    }

    return "incident-default";
  };

  const getSeverityClass = (severity) => {
    const value =
      String(severity || "").toLowerCase();

    if (value === "critical") {
      return "severity-critical";
    }

    if (value === "high") {
      return "severity-high";
    }

    if (value === "medium") {
      return "severity-medium";
    }

    return "severity-low";
  };

  const getServiceInitial = (service) => {
    if (!service) {
      return "?";
    }

    return service.charAt(0).toUpperCase();
  };

  const getServiceHealthClass = (health) => {
    const value =
      String(health || "").toUpperCase();

    if (value === "CRITICAL") {
      return "health-danger";
    }

    if (value === "DEGRADED") {
      return "health-warning";
    }

    return "health-good";
  };

  const getServiceStatusClass = (health) => {
    const value =
      String(health || "").toUpperCase();

    if (value === "CRITICAL") {
      return "status-danger";
    }

    if (value === "DEGRADED") {
      return "status-warning";
    }

    return "status-success";
  };

  // =========================================================
  // DASHBOARD
  // =========================================================

  const renderDashboard = () => (
    <>
      <div className="topbar dashboard-topbar">
        <div>
          <span className="eyebrow">
            SYSTEM OVERVIEW
          </span>

          <div className="title-row">
            <div>
              <h1>
                Root Cause Dashboard
              </h1>

              <p>
                Real-time software failure
                intelligence and system health
                monitoring
              </p>
            </div>

            <span className="system-live-badge">
              <span className="live-dot" />
              SYSTEM OPERATIONAL
            </span>
          </div>
        </div>

        <button
          className="refresh-button"
          onClick={refreshDashboard}
          disabled={loading}
        >
          <span>↻</span>

          {loading
            ? "Refreshing..."
            : "Refresh Analysis"}
        </button>
      </div>

      <section className="stats-grid">
        <div className="stat-card stat-services">
          <div className="stat-card-top">
            <span>
              MONITORED SERVICES
            </span>

            <div className="stat-icon">
              ◈
            </div>
          </div>

          <strong>
            {serviceSummary.total || services.length}
          </strong>

          <div className="stat-footer">
            <span className="stat-indicator positive">
              ●
            </span>

            <small>
              Active monitoring
            </small>
          </div>
        </div>

        <div className="stat-card stat-failures">
          <div className="stat-card-top">
            <span>
              FAILURES DETECTED
            </span>

            <div className="stat-icon">
              !
            </div>
          </div>

          <strong>
            {totalFailures}
          </strong>

          <div className="stat-footer">
            <span className="stat-indicator danger">
              ●
            </span>

            <small>
              Across monitored services
            </small>
          </div>
        </div>

        <div className="stat-card stat-critical">
          <div className="stat-card-top">
            <span>
              CRITICAL EVENTS
            </span>

            <div className="stat-icon">
              ⚠
            </div>
          </div>

          <strong>
            {criticalEvents}
          </strong>

          <div className="stat-footer">
            <span
              className={
                criticalEvents > 0
                  ? "stat-indicator danger"
                  : "stat-indicator positive"
              }
            >
              ●
            </span>

            <small>
              {criticalEvents > 0
                ? "Requires attention"
                : "No critical events"}
            </small>
          </div>
        </div>

        <div className="stat-card stat-incidents">
          <div className="stat-card-top">
            <span>
              ACTIVE INCIDENTS
            </span>

            <div className="stat-icon">
              ◉
            </div>
          </div>

          <strong>
            {activeIncidents.length}
          </strong>

          <div className="stat-footer">
            <span
              className={
                activeIncidents.length > 0
                  ? "stat-indicator danger"
                  : "stat-indicator positive"
              }
            >
              ●
            </span>

            <small>
              {resolvedIncidents.length} resolved
            </small>
          </div>
        </div>
      </section>

      <div className="dashboard-grid dashboard-main-grid">
        <section className="panel service-health-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                SERVICE HEALTH
              </span>

              <h2>
                Infrastructure Overview
              </h2>

              <p className="panel-description">
                Current health signals across
                monitored services
              </p>
            </div>

            <span className="panel-count">
              {services.length} services
            </span>
          </div>

          <div className="services-grid">
            {services.length === 0 ? (
              <div className="empty-inline">
                No service telemetry available.
              </div>
            ) : (
              services.map((service) => {
                const backendData =
                  backendServices.find(
                    (item) =>
                      item.service === service
                  );

                const serviceData =
                  backendData ||
                  patterns[service];

                const failures =
                  backendData
                    ? backendData.total_failures
                    : typeof serviceData === "number"
                    ? serviceData
                    : serviceData?.total_failures || 0;

                const health =
                  backendData?.health ||
                  (failures >= 3
                    ? "CRITICAL"
                    : failures > 0
                    ? "DEGRADED"
                    : "HEALTHY");

                const isRoot =
                  service === rootCause.root_cause;

                return (
                  <div
                    className={`service-card ${
                      isRoot
                        ? "service-root"
                        : ""
                    } ${
                      health === "CRITICAL"
                        ? "service-critical"
                        : ""
                    }`}
                    key={service}
                  >
                    <div className="service-top">
                      <div className="service-icon">
                        {getServiceInitial(
                          service
                        )}
                      </div>

                      <div className="service-title">
                        <strong>
                          {service}
                        </strong>

                        <span>
                          {isRoot
                            ? "Root cause candidate"
                            : failures > 0
                            ? `${failures} failures detected`
                            : "No failures detected"}
                        </span>
                      </div>

                      <div
                        className={`service-health-dot ${getServiceHealthClass(
                          health
                        )}`}
                      />
                    </div>

                    <div className="service-card-divider" />

                    <div className="service-status-row">
                      <span
                        className={getServiceStatusClass(
                          health
                        )}
                      >
                        {health}
                      </span>

                      {isRoot && (
                        <span className="root-label">
                          RCA CANDIDATE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="panel root-cause-card">
          <div className="root-cause-header">
            <div>
              <span className="eyebrow">
                AI INTELLIGENCE
              </span>

              <h2>
                Most Likely Root Cause
              </h2>
            </div>

            <div className="ai-badge">
              AI
            </div>
          </div>

          <div className="root-cause-main">
            <span className="root-cause-label">
              PRIMARY SUSPECT
            </span>

            <div className="root-cause-name">
              {rootCause.root_cause ||
                "Unknown"}
            </div>

            <div className="root-cause-confidence-row">
              <span
                className={`confidence-badge ${getConfidenceClass(
                  rootCause.confidence
                )}`}
              >
                {rootCause.confidence ||
                  "Unknown"}{" "}
                confidence
              </span>

              {candidates.length > 0 && (
                <span className="candidate-rank-badge">
                  Rank #1
                </span>
              )}
            </div>
          </div>

          <div className="root-cause-reason-box">
            <span className="reason-label">
              ANALYSIS
            </span>

            <p className="root-cause-reason">
              {rootCause.reason ||
                "No root-cause explanation is currently available."}
            </p>
          </div>

          {rootCause.evidence?.length > 0 && (
            <div className="evidence">
              <div className="section-mini-header">
                <strong>
                  Evidence supporting diagnosis
                </strong>

                <span>
                  {rootCause.evidence.length}
                </span>
              </div>

              {rootCause.evidence
                .slice(0, 4)
                .map((item, index) => (
                  <div
                    className="evidence-item"
                    key={index}
                  >
                    <span className="evidence-check">
                      ✓
                    </span>

                    <span>
                      {item}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-grid dashboard-secondary-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                FAILURE CORRELATION
              </span>

              <h2>
                Common Failure Patterns
              </h2>
            </div>
          </div>

          <div className="correlation-list">
            {Object.entries(correlations).length ===
            0 ? (
              <div className="empty-inline">
                No correlated failure patterns
                detected.
              </div>
            ) : (
              Object.entries(correlations).map(
                ([keyword, data]) => (
                  <div
                    className="correlation-item"
                    key={keyword}
                  >
                    <div className="correlation-left">
                      <div className="correlation-icon">
                        #
                      </div>

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
                    </div>

                    <div className="correlation-count">
                      {data.count}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </section>

        <section className="panel dependency-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                DEPENDENCY IMPACT
              </span>

              <h2>
                Failure Propagation
              </h2>
            </div>
          </div>

          <div className="dependency-flow">
            <div className="dependency-root">
              <div className="dependency-node-icon">
                !
              </div>

              <div>
                <strong>
                  {rootCause.root_cause ||
                    "Unknown"}
                </strong>

                <span>
                  Probable root cause
                </span>
              </div>
            </div>

            <div className="dependency-arrow">
              <span />
              <small>
                impacts
              </small>
              <span />
            </div>

            <div className="dependency-services">
              {failingServices.length === 0 ? (
                <div className="empty-inline">
                  No affected services.
                </div>
              ) : (
                failingServices
                  .filter(
                    (service) =>
                      service !==
                      rootCause.root_cause
                  )
                  .map((service) => (
                    <div
                      className="dependency-service"
                      key={service}
                    >
                      <div className="dependency-service-icon">
                        {getServiceInitial(
                          service
                        )}
                      </div>

                      <div>
                        <strong>
                          {service}
                        </strong>

                        <span>
                          {patterns[service]
                            ?.total_failures || 0}{" "}
                          failures
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="panel timeline-card">
        <div className="panel-header">
          <div>
            <span className="eyebrow">
              INCIDENT TIMELINE
            </span>

            <h2>
              Failure Sequence
            </h2>

            <p className="panel-description">
              Temporal ordering of detected
              failures
            </p>
          </div>

          <span className="panel-count">
            {temporalAnalysis.length} signals
          </span>
        </div>

        <div className="timeline">
          {temporalAnalysis.length === 0 ? (
            <div className="empty-inline">
              No temporal failure signals
              available.
            </div>
          ) : (
            temporalAnalysis.map(
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

      {rootCause.recommendations?.length > 0 && (
        <section className="recommendation recommendation-large">
          <div className="recommendation-icon">
            !
          </div>

          <div className="recommendation-content">
            <span className="eyebrow">
              AI RECOMMENDATION
            </span>

            <h3>
              Investigate{" "}
              {rootCause.root_cause ||
                "the suspected root cause"}
            </h3>

            <p>
              {rootCause.recommendations[0]}
            </p>
          </div>

          <button
            className="recommendation-action"
            onClick={() =>
              handleNavigation("Analysis")
            }
          >
            View Analysis →
          </button>
        </section>
      )}
    </>
  );

  // =========================================================
  // SERVICE DRILL-DOWN
  // =========================================================

  const renderServiceInspector = () => {
    const service = backendServices.find(
      (item) => item.service === selectedService
    );

    if (!service) {
      return (
        <section className="panel service-inspector-panel">
          <div className="logs-empty">
            <div className="empty-icon">◈</div>
            <h3>Service no longer available</h3>
            <p>
              The selected service is no longer present in the
              latest service health snapshot.
            </p>
            <button
              className="refresh-button"
              onClick={() => setSelectedService(null)}
            >
              Back to services
            </button>
          </div>
        </section>
      );
    }

    const candidate = candidates.find(
      (item) => item.service === selectedService
    );

    const serviceLogs = logs
      .filter(
        (log) => log.service === selectedService
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp) -
          new Date(a.timestamp)
      );

    const recentLogs = serviceLogs.slice(0, 8);

    const serviceFailures = serviceLogs.filter(
      (log) =>
        ["ERROR", "CRITICAL"].includes(
          String(log.level || "")
            .toUpperCase()
            .trim()
        )
    );

    const servicePatterns =
      logIntelligence?.service_message_frequency?.[
        selectedService
      ] || {};

    const topPatterns = Object.entries(
      servicePatterns
    ).slice(0, 5);

    const serviceCorrelations = Object.entries(
      correlations
    ).filter(([, data]) =>
      data?.services?.includes(selectedService)
    );

    const relatedIncidents = incidents
      .filter((incident) => {
        const affected = incident.affected_services || [];
        return (
          affected.includes(selectedService) ||
          incident.root_cause === selectedService
        );
      })
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );

    const health =
      service.health ||
      (service.total_failures >= 3
        ? "CRITICAL"
        : service.total_failures > 0
        ? "DEGRADED"
        : "HEALTHY");

    const isRoot =
      selectedService === rootCause.root_cause;

    const recommendation =
      isRoot
        ? rootCause.recommendations?.[0]
        : topPatterns.length > 0
        ? `Investigate the recurring failure pattern: ${topPatterns[0][0]}.`
        : service.total_failures > 0
        ? `Review the recent failure events for ${selectedService}.`
        : `No immediate failure investigation is required for ${selectedService}.`;

    return (
      <>
        <div className="service-inspector-back-row">
          <button
            className="back-button"
            onClick={() => setSelectedService(null)}
          >
            ← Back to all services
          </button>
        </div>

        <section
          className={`service-inspector-hero ${
            isRoot ? "service-inspector-root" : ""
          }`}
        >
          <div className="service-inspector-identity">
            <div className="service-icon large">
              {getServiceInitial(selectedService)}
            </div>

            <div>
              <span className="eyebrow">
                SERVICE INSPECTOR
              </span>

              <h1>{selectedService}</h1>

              <p>
                Detailed telemetry, failure signals,
                dependency impact and RCA context
              </p>
            </div>
          </div>

          <div className="service-inspector-status">
            <div
              className={`service-health-dot ${getServiceHealthClass(
                health
              )}`}
            />

            <span
              className={getServiceStatusClass(health)}
            >
              {health}
            </span>

            {isRoot && (
              <span className="root-label">
                PRIMARY SUSPECT
              </span>
            )}
          </div>
        </section>

        <section className="service-inspector-metrics">
          <div>
            <span>FAILURES</span>
            <strong>{service.total_failures || 0}</strong>
          </div>

          <div>
            <span>ERRORS</span>
            <strong>{service.error_count || 0}</strong>
          </div>

          <div>
            <span>CRITICAL</span>
            <strong>{service.critical_count || 0}</strong>
          </div>

          <div>
            <span>RCA SCORE</span>
            <strong>{candidate?.score || 0}</strong>
          </div>

          <div>
            <span>RELATED INCIDENTS</span>
            <strong>{relatedIncidents.length}</strong>
          </div>
        </section>

        <div className="service-inspector-grid">
          <section className="panel service-inspector-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">
                  DEPENDENCY CONTEXT
                </span>
                <h2>Service Dependencies</h2>
                <p className="panel-description">
                  Upstream and downstream relationships
                  detected by RootCauseAI
                </p>
              </div>
            </div>

            <div className="service-network-columns">
              <div>
                <span>DEPENDS ON</span>
                {service.depends_on?.length ? (
                  service.depends_on.map((dependency) => (
                    <div
                      className="service-network-item"
                      key={dependency}
                    >
                      <span className="service-network-icon">
                        {getServiceInitial(dependency)}
                      </span>
                      <strong>{dependency}</strong>
                    </div>
                  ))
                ) : (
                  <p className="empty-inline">
                    No upstream dependencies
                  </p>
                )}
              </div>

              <div>
                <span>DEPENDENTS</span>
                {service.dependents?.length ? (
                  service.dependents.map((dependent) => (
                    <div
                      className="service-network-item"
                      key={dependent}
                    >
                      <span className="service-network-icon">
                        {getServiceInitial(dependent)}
                      </span>
                      <strong>{dependent}</strong>
                    </div>
                  ))
                ) : (
                  <p className="empty-inline">
                    No downstream dependents
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="panel service-inspector-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">
                  FAILURE PATTERNS
                </span>
                <h2>Most Frequent Errors</h2>
                <p className="panel-description">
                  Repeated failure messages observed for
                  this service
                </p>
              </div>

              <span className="panel-count">
                {topPatterns.length} patterns
              </span>
            </div>

            {topPatterns.length === 0 ? (
              <div className="empty-inline">
                No repeated failure patterns detected.
              </div>
            ) : (
              <div className="service-pattern-list">
                {topPatterns.map(([message, count], index) => (
                  <div
                    className="service-pattern-item"
                    key={message}
                  >
                    <span className="service-pattern-rank">
                      #{index + 1}
                    </span>
                    <div>
                      <strong>{message}</strong>
                      <span>Repeated failure pattern</span>
                    </div>
                    <b>{count}</b>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="panel service-inspector-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                RECENT TELEMETRY
              </span>
              <h2>Recent Service Logs</h2>
              <p className="panel-description">
                Latest events collected for {selectedService}
              </p>
            </div>

            <span className="panel-count">
              {serviceLogs.length} logs
            </span>
          </div>

          {recentLogs.length === 0 ? (
            <div className="empty-inline">
              No logs available for this service.
            </div>
          ) : (
            <div className="service-log-list">
              {recentLogs.map((log) => (
                <div
                  className="service-log-row"
                  key={log.id}
                >
                  <span className="timeline-time">
                    {formatTimestamp(log.timestamp)}
                  </span>

                  <span
                    className={`level-badge ${getLevelClass(
                      log.level
                    )}`}
                  >
                    {log.level}
                  </span>

                  <span className="service-log-message">
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="service-inspector-grid">
          <section className="panel service-inspector-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">
                  RCA SIGNALS
                </span>
                <h2>Root Cause Context</h2>
              </div>

              <span className="panel-count">
                Score {candidate?.score || 0}
              </span>
            </div>

            <div className="service-rca-summary">
              <div className="service-rca-main">
                <span>
                  {isRoot
                    ? "CURRENT PRIMARY SUSPECT"
                    : "CURRENT RCA POSITION"}
                </span>
                <strong>
                  {isRoot
                    ? "Most likely root cause"
                    : candidate
                    ? `Rank #${
                        candidates.findIndex(
                          (item) =>
                            item.service === selectedService
                        ) + 1
                      } candidate`
                    : "No candidate ranking"}
                </strong>
              </div>

              <div className="service-rca-breakdown">
                <div>
                  <span>Failure</span>
                  <strong>
                    {candidate?.failure_score || 0}
                  </strong>
                </div>
                <div>
                  <span>Temporal</span>
                  <strong>
                    {candidate?.temporal_score || 0}
                  </strong>
                </div>
                <div>
                  <span>Correlation</span>
                  <strong>
                    {candidate?.correlation_score || 0}
                  </strong>
                </div>
                <div>
                  <span>Dependency</span>
                  <strong>
                    {candidate?.dependency_score || 0}
                  </strong>
                </div>
              </div>
            </div>

            {serviceCorrelations.length > 0 && (
              <div className="service-correlation-summary">
                <span>RELATED SIGNALS</span>
                <div>
                  {serviceCorrelations.slice(0, 5).map(
                    ([keyword, data]) => (
                      <span key={keyword}>
                        {keyword} · {data.count}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="panel service-inspector-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">
                  INVESTIGATION GUIDANCE
                </span>
                <h2>What to Investigate Next</h2>
              </div>
            </div>

            <div className="service-investigation-card">
              <div className="service-investigation-icon">
                !
              </div>
              <div>
                <strong>
                  {isRoot
                    ? `Investigate ${selectedService}`
                    : service.total_failures > 0
                    ? `Review ${selectedService}`
                    : `${selectedService} is operating normally`}
                </strong>
                <p>{recommendation}</p>
              </div>
            </div>

            {relatedIncidents.length > 0 && (
              <button
                className="service-inspector-action"
                onClick={() => {
                  const incident = relatedIncidents[0];
                  if (incident?.incident_id) {
                    setSelectedIncident(incident);
                    setIncidentSelected(true);
                    setActivePage("Incidents");
                    fetchIncidentDetails(
                      incident.incident_id
                    );
                  }
                }}
              >
                Open latest related incident →
              </button>
            )}
          </section>
        </div>

        {relatedIncidents.length > 0 && (
          <section className="panel service-inspector-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">
                  INCIDENT HISTORY
                </span>
                <h2>Related Incidents</h2>
              </div>

              <span className="panel-count">
                {relatedIncidents.length} incidents
              </span>
            </div>

            <div className="service-incident-list">
              {relatedIncidents.slice(0, 6).map((incident) => (
                <button
                  className="service-incident-row"
                  key={incident.incident_id}
                  onClick={() => {
                    setSelectedIncident(incident);
                    setIncidentSelected(true);
                    setActivePage("Incidents");
                    fetchIncidentDetails(
                      incident.incident_id
                    );
                  }}
                >
                  <span
                    className={`incident-status-dot ${
                      String(incident.status || "")
                        .toLowerCase() === "active"
                        ? "active"
                        : ""
                    }`}
                  />
                  <span>
                    <strong>{incident.incident_id}</strong>
                    <small>{incident.title}</small>
                  </span>
                  <span
                    className={getSeverityClass(
                      incident.severity
                    )}
                  >
                    {incident.severity}
                  </span>
                  <span className="service-incident-arrow">
                    →
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </>
    );
  };

  // =========================================================
  // SERVICES
  // =========================================================

  const renderServices = () => (
    <>
      {selectedService ? (
        renderServiceInspector()
      ) : (
        <>
          <div className="topbar">
            <div>
              <span className="eyebrow">
                SERVICES
              </span>

              <h1>
                Service Health
              </h1>

              <p>
                Monitor service health, failures,
                dependencies and RCA signals
              </p>
            </div>

            <div className="page-summary">
              <span className="summary-status">
                <span className="live-dot" />
                Monitoring active
              </span>
            </div>
          </div>

          <section className="service-overview-strip">
            <div>
              <span>MONITORED</span>

              <strong>
                {serviceSummary.total ||
                  backendServices.length}
              </strong>
            </div>

            <div>
              <span>CRITICAL</span>

              <strong className="text-danger">
                {serviceSummary.critical}
              </strong>
            </div>

            <div>
              <span>DEGRADED</span>

              <strong>
                {serviceSummary.degraded}
              </strong>
            </div>

            <div>
              <span>HEALTHY</span>

              <strong className="text-success">
                {serviceSummary.healthy}
              </strong>
            </div>
          </section>

          <div className="service-inspector-hint">
            <span>↗</span>
            <div>
              <strong>Inspect a service</strong>
              <p>
                Select any service below to view its
                telemetry, failure patterns, dependencies,
                RCA signals and related incidents.
              </p>
            </div>
          </div>

          <section className="service-detail-grid">
            {servicesLoading &&
            backendServices.length === 0 ? (
              <section className="panel">
                <div className="logs-empty">
                  <div className="mini-spinner" />

                  <p>
                    Loading service health...
                  </p>
                </div>
              </section>
            ) : backendServices.length === 0 ? (
              <section className="panel">
                <div className="logs-empty">
                  <div className="empty-icon">
                    ◈
                  </div>

                  <h3>
                    No service data
                  </h3>

                  <p>
                    RootCauseAI has not received
                    service telemetry yet.
                  </p>
                </div>
              </section>
            ) : (
              backendServices.map((service) => {
                const isRoot =
                  service.service ===
                  rootCause.root_cause;

                return (
                  <div
                    className={`service-detail-card service-clickable ${
                      isRoot
                        ? "highlight-root"
                        : ""
                    }`}
                    key={service.service}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setSelectedService(
                        service.service
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        setSelectedService(
                          service.service
                        );
                      }
                    }}
                  >
                    <div className="service-detail-header">
                      <div className="service-icon large">
                        {getServiceInitial(
                          service.service
                        )}
                      </div>

                      <div>
                        <h2>
                          {service.service}
                        </h2>

                        <span>
                          {isRoot
                            ? "Most likely root cause"
                            : service.health ===
                              "CRITICAL"
                            ? "Critical service health"
                            : service.health ===
                              "DEGRADED"
                            ? "Degraded service health"
                            : "Operating normally"}
                        </span>
                      </div>

                      <div
                        className={`service-health-dot ${getServiceHealthClass(
                          service.health
                        )}`}
                      />
                    </div>

                    <div className="service-detail-divider" />

                    <div className="service-metrics">
                      <div>
                        <span>
                          Failures
                        </span>

                        <strong>
                          {service.total_failures}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Errors
                        </span>

                        <strong>
                          {service.error_count}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Critical
                        </span>

                        <strong>
                          {service.critical_count}
                        </strong>
                      </div>

                      <div>
                        <span>
                          RCA Score
                        </span>

                        <strong>
                          {candidates.find(
                            (item) =>
                              item.service ===
                              service.service
                          )?.score || 0}
                        </strong>
                      </div>
                    </div>

                    <div className="service-card-bottom">
                      <span
                        className={getServiceStatusClass(
                          service.health
                        )}
                      >
                        {service.health}
                      </span>

                      {isRoot && (
                        <span className="root-label">
                          PRIMARY SUSPECT
                        </span>
                      )}

                      <span className="service-open-hint">
                        Inspect →
                      </span>
                    </div>

                    <div className="service-dependency-info">
                      <div>
                        <span>
                          DEPENDS ON
                        </span>

                        <strong>
                          {service.depends_on?.length
                            ? service.depends_on.join(
                                ", "
                              )
                            : "None"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          DEPENDENTS
                        </span>

                        <strong>
                          {service.dependents?.length
                            ? service.dependents.join(
                                ", "
                              )
                            : "None"}
                        </strong>
                      </div>
                    </div>

                    <div className="service-last-failure">
                      <span>
                        LAST FAILURE
                      </span>

                      <strong>
                        {formatTimestamp(
                          service.last_failure
                        )}
                      </strong>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </>
      )}
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
            INCIDENT MANAGEMENT
          </span>

          <h1>
            Incident Overview
          </h1>

          <p>
            Investigate failures detected by
            RootCauseAI
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchIncidents}
          disabled={incidentsLoading}
        >
          <span>↻</span>

          {incidentsLoading
            ? "Refreshing..."
            : "Refresh Incidents"}
        </button>
      </div>

      <section className="incident-summary-grid">
        <div className="incident-summary-card">
          <span>
            ACTIVE INCIDENTS
          </span>

          <strong>
            {activeIncidents.length}
          </strong>

          <small>
            Currently under investigation
          </small>
        </div>

        <div className="incident-summary-card">
          <span>RESOLVED</span>

          <strong>
            {resolvedIncidents.length}
          </strong>

          <small>
            Previously resolved incidents
          </small>
        </div>

        <div className="incident-summary-card">
          <span>TOTAL INCIDENTS</span>

          <strong>
            {incidents.length}
          </strong>

          <small>
            Persisted incident history
          </small>
        </div>
      </section>

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
        <div className="incident-list">
          {incidents.map((incident) => (
            <section
              className={`incident-list-card ${
                incident.status === "ACTIVE"
                  ? "incident-card-active"
                  : ""
              }`}
              key={incident.incident_id}
            >
              <div className="incident-list-header">
                <div className="incident-main-icon">
                  {incident.status === "ACTIVE"
                    ? "!"
                    : "✓"}
                </div>

                <div className="incident-title-area">
                  <div className="incident-title-meta">
                    <span className="eyebrow">
                      {incident.status === "ACTIVE"
                        ? "ACTIVE INCIDENT"
                        : "RESOLVED INCIDENT"}
                    </span>

                    <span className="incident-id">
                      {incident.incident_id}
                    </span>
                  </div>

                  <h2>
                    {incident.title}
                  </h2>

                  <p>
                    {incident.explanation ||
                      "RootCauseAI detected a software failure incident."}
                  </p>
                </div>

                <span
                  className={`incident-badge ${getIncidentStatusClass(
                    incident.status
                  )}`}
                >
                  {incident.status}
                </span>
              </div>

              <div className="incident-list-divider" />

              <div className="incident-list-metrics">
                <div>
                  <span>
                    ROOT CAUSE
                  </span>

                  <strong>
                    {incident.root_cause ||
                      "Unknown"}
                  </strong>
                </div>

                <div>
                  <span>
                    AFFECTED SERVICES
                  </span>

                  <strong>
                    {incident.affected_services
                      ?.length || 0}
                  </strong>
                </div>

                <div>
                  <span>
                    FAILURES
                  </span>

                  <strong>
                    {incident.failure_count}
                  </strong>
                </div>

                <div>
                  <span>
                    CONFIDENCE
                  </span>

                  <strong
                    className={getConfidenceClass(
                      incident.confidence
                    )}
                  >
                    {incident.confidence ||
                      "Unknown"}
                  </strong>
                </div>

                <div>
                  <span>
                    RCA SCORE
                  </span>

                  <strong>
                    {incident.rca_score ?? 0}
                  </strong>
                </div>
              </div>

              <div className="incident-card-footer">
                <span>
                  Started{" "}
                  {formatTimestamp(
                    incident.started_at
                  )}
                </span>

                <button
                  className="incident-open-button"
                  onClick={() =>
                    fetchIncidentDetails(
                      incident.incident_id
                    )
                  }
                >
                  View Investigation →
                </button>
              </div>
            </section>
          ))}
        </div>
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
          <div className="logs-empty">
            <div className="mini-spinner" />

            <p>
              Loading incident details...
            </p>
          </div>
        </section>
      );
    }

    const incidentServices =
      incident.affected_services || [];

    const incidentEvidence =
      incidentAnalysis
        ?.root_cause_explanation
        ?.evidence?.length
        ? incidentAnalysis
            .root_cause_explanation
            .evidence
        : incident.evidence || [];

    const incidentRecommendations =
      incidentAnalysis
        ?.root_cause_explanation
        ?.recommendations?.length
        ? incidentAnalysis
            .root_cause_explanation
            .recommendations
        : incident.recommendations || [];

    const incidentCandidates =
      incidentAnalysis?.candidates || [];

    const incidentCorrelations =
      incidentAnalysis?.correlations || {};

    const incidentRootCause =
      incidentAnalysis
        ?.root_cause_explanation || {};

    const incidentAnalysisEvidence =
      incidentAnalysis?.evidence || [];

    const incidentRcaScore =
      incidentCandidates[0]?.score ??
      incident.rca_score ??
      0;

    const liveRootCause =
      incidentRootCause.root_cause ||
      incident.root_cause ||
      "Unknown";

    const liveConfidence =
      incidentRootCause.confidence ||
      incident.confidence ||
      "Unknown";

    const liveReason =
      incidentRootCause.reason ||
      incident.explanation ||
      "No root cause explanation available.";

    const incidentServiceSet =
      new Set(incidentServices);

    const incidentStart =
      incidentAnalysis
        ?.incident?.started_at ||
      incident.started_at;

    const incidentEnd =
      incidentAnalysis
        ?.incident?.analysis_end_time ||
      incident.ended_at;

    const incidentStartTime =
      incidentStart
        ? new Date(
            incidentStart
          ).getTime()
        : null;

    const incidentEndTime =
      incidentEnd
        ? new Date(
            incidentEnd
          ).getTime()
        : Infinity;

    const incidentLogs =
      logs.filter((log) => {
        const logTime =
          new Date(
            log.timestamp
          ).getTime();

        return (
          incidentServiceSet.has(
            log.service
          ) &&
          incidentStartTime !== null &&
          logTime >=
            incidentStartTime &&
          logTime <=
            incidentEndTime
        );
      });

    return (
      <>
        <div className="topbar incident-detail-topbar">
          <div>
            <button
              className="back-button"
              onClick={() => {
                setIncidentSelected(false);
                setSelectedIncident(null);
                setIncidentEvents([]);
                setIncidentAnalysis(null);
              }}
            >
              ← Back to Incidents
            </button>

            <span className="eyebrow incident-eyebrow">
              INCIDENT INVESTIGATION
            </span>

            <div className="incident-detail-title-row">
              <div>
                <h1>
                  {incident.title}
                </h1>

                <p>
                  RootCauseAI incident
                  investigation and
                  evidence analysis
                </p>
              </div>

              <span
                className={`incident-badge large-badge ${getIncidentStatusClass(
                  incident.status
                )}`}
              >
                {incident.status}
              </span>
            </div>
          </div>
        </div>

        <section className="incident-hero">
          <div className="incident-hero-main">
            <div className="incident-hero-icon">
              !
            </div>

            <div>
              <span className="eyebrow">
                INCIDENT
              </span>

              <h2>
                {incident.incident_id}
              </h2>

              <p>
                Started{" "}
                {formatTimestamp(
                  incident.started_at
                )}
              </p>
            </div>
          </div>

          <div className="incident-hero-score">
            <span>
              RCA SCORE
            </span>

            <strong>
              {incidentRcaScore}
            </strong>

            <small>
              Confidence:{" "}
              {liveConfidence}
            </small>
          </div>
        </section>

        <section className="incident-identity">
          <div>
            <span className="eyebrow">
              SEVERITY
            </span>

            <strong
              className={getSeverityClass(
                incident.severity
              )}
            >
              {incident.severity ||
                "Unknown"}
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
              {liveRootCause}
            </strong>
          </div>
        </section>

        <div className="incident-detail-grid">
          <section className="panel incident-root-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">
                  ROOT CAUSE ANALYSIS
                </span>

                <h2>
                  {liveRootCause}
                </h2>
              </div>

              <span
                className={`confidence-badge ${getConfidenceClass(
                  liveConfidence
                )}`}
              >
                {liveConfidence} confidence
              </span>
            </div>

            <div className="incident-explanation-box">
              <span>
                AI EXPLANATION
              </span>

              <p>
                {liveReason}
              </p>
            </div>

            <div className="incident-evidence">
              <div className="section-mini-header">
                <h3>
                  Evidence
                </h3>

                <span>
                  {incidentEvidence.length}
                </span>
              </div>

              {incidentEvidence.length > 0 ? (
                incidentEvidence.map(
                  (item, index) => (
                    <div
                      className="evidence-item"
                      key={index}
                    >
                      <span className="evidence-check">
                        ✓
                      </span>

                      <span>
                        {item}
                      </span>
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
                  IMPACT ANALYSIS
                </span>

                <h2>
                  Affected Services
                </h2>
              </div>
            </div>

            <div className="impact-list">
              {incidentServices.length === 0 ? (
                <div className="empty-inline">
                  No affected services
                  recorded.
                </div>
              ) : (
                incidentServices.map(
                  (service) => {
                    const serviceData =
                      incidentAnalysis
                        ?.patterns?.[
                        service
                      ] ||
                      patterns[service];

                    return (
                      <div
                        className="impact-row"
                        key={service}
                      >
                        <div className="impact-service">
                          <div className="service-icon">
                            {getServiceInitial(
                              service
                            )}
                          </div>

                          <div>
                            <strong>
                              {service}
                            </strong>

                            <span>
                              Service dependency
                            </span>
                          </div>
                        </div>

                        <span
                          className={
                            service ===
                            liveRootCause
                              ? "root-label"
                              : ""
                          }
                        >
                          {serviceData
                            ?.total_failures ||
                            0}{" "}
                          failures
                        </span>
                      </div>
                    );
                  }
                )
              )}
            </div>
          </section>
        </div>

        {/* INCIDENT ↔ SERVICE CORRELATION */}
        <section className="panel incident-correlation-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                INCIDENT ↔ SERVICE CORRELATION
              </span>

              <h2>
                Failure Propagation Map
              </h2>

              <p className="panel-description">
                Connects affected services, dependency relationships,
                failure signals and the current root-cause candidate.
              </p>
            </div>

            <span className="panel-count">
              {incidentServices.length} services
            </span>
          </div>

          <div className="incident-correlation-flow">
            <div className="correlation-flow-step correlation-flow-incident">
              <span className="correlation-flow-label">
                INCIDENT
              </span>
              <strong>
                {incident.incident_id}
              </strong>
              <small>
                {incident.failure_count || 0} detected failures
              </small>
            </div>

            <span className="correlation-flow-arrow">→</span>

            <div className="correlation-flow-step">
              <span className="correlation-flow-label">
                AFFECTED SERVICES
              </span>
              <strong>
                {incidentServices.length}
              </strong>
              <small>
                Services participating in the incident
              </small>
            </div>

            <span className="correlation-flow-arrow">→</span>

            <div className="correlation-flow-step correlation-flow-root">
              <span className="correlation-flow-label">
                PRIMARY SUSPECT
              </span>
              <strong>
                {liveRootCause}
              </strong>
              <small>
                RCA score {incidentRcaScore} · {liveConfidence} confidence
              </small>
            </div>
          </div>

          <div className="incident-correlation-grid">
            <div className="incident-correlation-services">
              <div className="correlation-subheader">
                <div>
                  <span className="eyebrow">
                    SERVICE IMPACT
                  </span>
                  <h3>
                    Incident service map
                  </h3>
                </div>
                <span className="correlation-subcount">
                  {incidentServices.length}
                </span>
              </div>

              {incidentServices.length === 0 ? (
                <div className="empty-inline">
                  No affected services recorded.
                </div>
              ) : (
                <div className="incident-correlation-service-list">
                  {incidentServices.map((serviceName) => {
                    const serviceData = backendServices.find(
                      (item) => item.service === serviceName
                    );

                    const servicePattern =
                      incidentAnalysis?.patterns?.[serviceName] ||
                      patterns[serviceName] ||
                      {};

                    const failureCount =
                      servicePattern.total_failures ||
                      serviceData?.total_failures ||
                      0;

                    const dependencyScore =
                      incidentAnalysis?.dependency_scores?.[serviceName] ||
                      0;

                    const isRoot =
                      serviceName === liveRootCause;

                    return (
                      <div
                        className={`incident-correlation-service ${
                          isRoot
                            ? "correlation-service-root"
                            : ""
                        }`}
                        key={serviceName}
                      >
                        <div className="incident-correlation-service-main">
                          <div className="service-icon">
                            {getServiceInitial(serviceName)}
                          </div>

                          <div>
                            <div className="incident-correlation-service-title">
                              <strong>
                                {serviceName}
                              </strong>

                              {isRoot && (
                                <span className="top-candidate-badge">
                                  ROOT CAUSE
                                </span>
                              )}
                            </div>

                            <span>
                              {failureCount} failure(s) recorded
                            </span>
                          </div>
                        </div>

                        <div className="incident-correlation-service-meta">
                          <span>
                            Dependency score
                            <strong>
                              {dependencyScore}
                            </strong>
                          </span>

                          <span>
                            Health
                            <strong
                              className={getServiceStatusClass(
                                serviceData?.health
                              )}
                            >
                              {serviceData?.health || "UNKNOWN"}
                            </strong>
                          </span>

                          <button
                            type="button"
                            className="incident-service-inspect-button"
                            onClick={() => {
                              setSelectedService(serviceName);
                              setActivePage("Services");
                            }}
                          >
                            Inspect service →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="incident-correlation-network">
              <div className="correlation-subheader">
                <div>
                  <span className="eyebrow">
                    DEPENDENCY CONTEXT
                  </span>
                  <h3>
                    Upstream / downstream relationships
                  </h3>
                </div>
              </div>

              <div className="incident-dependency-list">
                {incidentServices.length === 0 ? (
                  <div className="empty-inline">
                    No dependency context available.
                  </div>
                ) : (
                  incidentServices.map((serviceName) => {
                    const serviceData = backendServices.find(
                      (item) => item.service === serviceName
                    );

                    const dependsOn = serviceData?.depends_on || [];
                    const dependents = serviceData?.dependents || [];

                    return (
                      <div
                        className="incident-dependency-row"
                        key={serviceName}
                      >
                        <div className="incident-dependency-service">
                          <span className="service-network-icon">
                            ◈
                          </span>
                          <strong>
                            {serviceName}
                          </strong>
                        </div>

                        <div className="incident-dependency-direction">
                          <span>
                            DEPENDS ON
                          </span>
                          <strong>
                            {dependsOn.length
                              ? dependsOn.join(", ")
                              : "None"}
                          </strong>
                        </div>

                        <div className="incident-dependency-direction">
                          <span>
                            DEPENDENTS
                          </span>
                          <strong>
                            {dependents.length
                              ? dependents.join(", ")
                              : "None"}
                          </strong>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="incident-correlation-conclusion">
                <span className="correlation-conclusion-icon">
                  →
                </span>
                <div>
                  <span className="eyebrow">
                    CORRELATION RESULT
                  </span>
                  <strong>
                    {liveRootCause} is the current primary suspect
                  </strong>
                  <p>
                    RootCauseAI combines incident failures, timing,
                    correlated messages and dependency evidence before
                    selecting the highest-ranked candidate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel incident-events-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                INCIDENT TIMELINE
              </span>

              <h2>
                Incident Event History
              </h2>

              <p className="panel-description">
                Persisted lifecycle events
                recorded by RootCauseAI
              </p>
            </div>

            <span className="panel-count">
              {incidentEvents.length} events
            </span>
          </div>

          {eventsLoading ? (
            <div className="logs-empty">
              <div className="mini-spinner" />

              <p>
                Loading incident events...
              </p>
            </div>
          ) : incidentEvents.length === 0 ? (
            <div className="logs-empty">
              <div className="empty-icon">
                ⌁
              </div>

              <h3>
                No incident events
              </h3>

              <p>
                No persisted events were
                recorded for this incident.
              </p>
            </div>
          ) : (
            <div className="incident-event-timeline">
              {incidentEvents.map(
                (event, index) => (
                  <div
                    className="incident-event-row"
                    key={event.id}
                  >
                    <div
                      className={`incident-event-marker ${getEventClass(
                        event.event_type
                      )}`}
                    >
                      {getEventIcon(
                        event.event_type
                      )}
                    </div>

                    {index <
                      incidentEvents.length -
                        1 && (
                      <div className="incident-event-line" />
                    )}

                    <div className="incident-event-content">
                      <div className="incident-event-header">
                        <div className="event-heading">
                          <span
                            className={`event-type-badge ${getEventClass(
                              event.event_type
                            )}`}
                          >
                            {formatEventType(
                              event.event_type
                            )}
                          </span>

                          {event.service && (
                            <span className="service-badge">
                              {event.service}
                            </span>
                          )}
                        </div>

                        <span className="timeline-time">
                          {formatTimestamp(
                            event.timestamp
                          )}
                        </span>
                      </div>

                      {event.message && (
                        <p>
                          {event.message}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                INCIDENT RCA ENGINE
              </span>

              <h2>
                Root Cause Candidates
              </h2>

              <p className="panel-description">
                Candidate ranking generated
                specifically from this
                incident's telemetry
              </p>
            </div>

            <span className="panel-count">
              {incidentCandidates.length} candidates
            </span>
          </div>

          {incidentAnalysisLoading ? (
            <div className="logs-empty">
              <div className="mini-spinner" />

              <p>
                Running incident-specific
                RCA...
              </p>
            </div>
          ) : incidentCandidates.length ===
            0 ? (
            <div className="logs-empty">
              <p>
                No RCA candidates available
                for this incident.
              </p>
            </div>
          ) : (
            <div className="candidate-list">
              {incidentCandidates.map(
                (candidate, index) => {
                  const isTop =
                    index === 0;

                  return (
                    <div
                      className={`candidate-card ${
                        isTop
                          ? "candidate-top"
                          : ""
                      }`}
                      key={candidate.service}
                    >
                      <div className="candidate-rank">
                        #{index + 1}
                      </div>

                      <div className="candidate-info">
                        <div className="candidate-title">
                          <strong>
                            {candidate.service}
                          </strong>

                          {isTop && (
                            <span className="top-candidate-badge">
                              TOP CANDIDATE
                            </span>
                          )}
                        </div>

                        <span>
                          Incident RCA score:{" "}
                          <strong>
                            {candidate.score}
                          </strong>
                        </span>
                      </div>

                      <div className="candidate-score-bar">
                        <div
                          className="candidate-score-fill"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                Number(
                                  candidate.score ||
                                    0
                                ) * 10,
                                4
                              ),
                              100
                            )}%`
                          }}
                        />
                      </div>

                      <div className="candidate-scores">
                        <span>
                          Failure
                          <strong>
                            {candidate.failure_score}
                          </strong>
                        </span>

                        <span>
                          Temporal
                          <strong>
                            {candidate.temporal_score}
                          </strong>
                        </span>

                        <span>
                          Correlation
                          <strong>
                            {candidate.correlation_score}
                          </strong>
                        </span>

                        <span>
                          Dependency
                          <strong>
                            {candidate.dependency_score}
                          </strong>
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        <section className="panel incident-ai-diagnosis">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                AI DIAGNOSIS
              </span>

              <h2>
                Incident Root Cause
              </h2>

              <p className="panel-description">
                Evidence and reasoning generated
                from incident-specific telemetry
              </p>
            </div>

            <span
              className={`confidence-badge ${getConfidenceClass(
                liveConfidence
              )}`}
            >
              {liveConfidence} confidence
            </span>
          </div>

          <div className="incident-ai-diagnosis-main">
            <div className="incident-ai-root">
              <span className="eyebrow">
                PRIMARY SUSPECT
              </span>

              <h2>
                {liveRootCause}
              </h2>

              <span className="candidate-rank-badge">
                RCA Score: {incidentRcaScore}
              </span>
            </div>

            <div className="incident-explanation-box">
              <span>
                ANALYSIS REASONING
              </span>

              <p>
                {liveReason}
              </p>
            </div>
          </div>

          {incidentAnalysisEvidence.length >
            0 && (
            <div className="incident-evidence">
              <div className="section-mini-header">
                <h3>
                  RCA Evidence
                </h3>

                <span>
                  {incidentAnalysisEvidence.length}
                </span>
              </div>

              {incidentAnalysisEvidence.map(
                (item, index) => (
                  <div
                    className="evidence-item"
                    key={index}
                  >
                    <span className="evidence-check">
                      ✓
                    </span>

                    <span>
                      {item.service}
                      {" — "}
                      {item.total_failures}{" "}
                      failure(s)

                      {item.first_failure && (
                        <>
                          {" · First failure: "}
                          {formatTimestamp(
                            item.first_failure
                          )}
                        </>
                      )}

                      {item.correlated && (
                        <>
                          {" · Correlated signal"}
                        </>
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                CORRELATED SIGNALS
              </span>

              <h2>
                Failure Patterns
              </h2>
            </div>
          </div>

          <div className="correlation-list">
            {Object.entries(
              incidentCorrelations
            ).length === 0 ? (
              <div className="empty-inline">
                No correlated signals found.
              </div>
            ) : (
              Object.entries(
                incidentCorrelations
              ).map(
                ([keyword, data]) => (
                  <div
                    className="correlation-item"
                    key={keyword}
                  >
                    <div className="correlation-left">
                      <div className="correlation-icon">
                        #
                      </div>

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
                    </div>

                    <div className="correlation-count">
                      {data.count}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                INCIDENT TELEMETRY
              </span>

              <h2>
                Related Logs
              </h2>

              <p className="panel-description">
                Raw telemetry from affected
                services
              </p>
            </div>

            <span className="panel-count">
              {incidentLogs.length} logs
            </span>
          </div>

          {incidentLogs.length === 0 ? (
            <div className="logs-empty">
              <p>
                No telemetry found for the
                affected services.
              </p>
            </div>
          ) : (
            <div className="incident-log-list">
              {incidentLogs.map(
                (log) => (
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
                )
              )}
            </div>
          )}
        </section>

        {incidentRecommendations.length >
          0 && (
          <section className="recommendation recommendation-large">
            <div className="recommendation-icon">
              !
            </div>

            <div className="recommendation-content">
              <span className="eyebrow">
                RECOMMENDED ACTION
              </span>

              <h3>
                Investigate{" "}
                {liveRootCause}
              </h3>

              <p>
                {incidentRecommendations[0]}
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

          <h1>
            System Logs
          </h1>

          <p>
            Search and inspect raw telemetry
            collected by RootCauseAI
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={async () => {
            await Promise.all([
              fetchLogs(),
              fetchLogIntelligence()
            ]);
          }}
          disabled={logsLoading}
        >
          <span>↻</span>

          {logsLoading
            ? "Refreshing..."
            : "Refresh Logs"}
        </button>
      </div>

      <section className="log-overview-strip">
        <div>
          <span>
            TOTAL LOGS
          </span>

          <strong>
            {logs.length}
          </strong>
        </div>

        <div>
          <span>
            VISIBLE
          </span>

          <strong>
            {filteredLogs.length}
          </strong>
        </div>

        <div>
          <span>
            ERRORS
          </span>

          <strong className="text-danger">
            {
              logs.filter(
                (log) =>
                  String(
                    log.level
                  ).toLowerCase() ===
                  "error"
              ).length
            }
          </strong>
        </div>

        <div>
          <span>
            SERVICES
          </span>

          <strong>
            {uniqueServices.length}
          </strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">
              LOG INTELLIGENCE
            </span>

            <h2>
              Failure Insights
            </h2>

            <p className="panel-description">
              Automatically detected patterns across
              the latest telemetry stream
            </p>
          </div>

          <span className="panel-count">
            Live · 5s
          </span>
        </div>

        <div className="log-overview-strip">
          <div>
            <span>
              TOTAL FAILURES
            </span>

            <strong className="text-danger">
              {logIntelligence?.total_failures ??
                logs.filter(
                  (log) =>
                    ["ERROR", "CRITICAL"].includes(
                      String(log.level || "").toUpperCase()
                    )
                ).length}
            </strong>
          </div>

          <div>
            <span>
              TOP FAILING SERVICE
            </span>

            <strong>
              {topFailingService.service}
            </strong>

            <small>
              {topFailingService.count} failures
            </small>
          </div>

          <div>
            <span>
              TOP ERROR PATTERN
            </span>

            <strong>
              {topFailureMessage.count}
            </strong>

            <small>
              occurrences
            </small>
          </div>

          <div>
            <span>
              LOG LEVELS
            </span>

            <strong>
              {Object.keys(
                logIntelligence?.level_counts || {}
              ).length || uniqueLevels.length}
            </strong>

            <small>
              observed levels
            </small>
          </div>
        </div>

        <div className="dashboard-grid dashboard-secondary-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">
                  SERVICE FAILURES
                </span>

                <h2>
                  Failure Distribution
                </h2>
              </div>

              <span className="panel-count">
                {topServiceEntries.length} services
              </span>
            </div>

            <div className="correlation-list">
              {topServiceEntries.length === 0 ? (
                <div className="empty-inline">
                  No failure intelligence available.
                </div>
              ) : (
                topServiceEntries.map(
                  ({ service, count }) => (
                    <div
                      className="correlation-item"
                      key={service}
                    >
                      <div className="correlation-left">
                        <div className="correlation-icon">
                          {getServiceInitial(service)}
                        </div>

                        <div>
                          <strong>
                            {service}
                          </strong>

                          <span>
                            {count} failure
                            {count === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      <div className="correlation-count">
                        {count}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">
                  REPEATED PATTERNS
                </span>

                <h2>
                  Most Frequent Errors
                </h2>
              </div>

              <span className="panel-count">
                Top 5
              </span>
            </div>

            <div className="correlation-list">
              {topMessageEntries.length === 0 ? (
                <div className="empty-inline">
                  No repeated failure messages found.
                </div>
              ) : (
                topMessageEntries.map(
                  ({ message, count }) => (
                    <div
                      className="correlation-item"
                      key={message}
                    >
                      <div className="correlation-left">
                        <div className="correlation-icon">
                          #
                        </div>

                        <div>
                          <strong>
                            {message}
                          </strong>

                          <span>
                            Repeated failure pattern
                          </span>
                        </div>
                      </div>

                      <div className="correlation-count">
                        {count}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                INVESTIGATION SIGNALS
              </span>

              <h2>
                What to investigate next
              </h2>

              <p className="panel-description">
                Actionable signals derived from recurring telemetry patterns
              </p>
            </div>

            <span className="panel-count">
              AI-guided
            </span>
          </div>

          <div className="correlation-list">
            {investigationSignals.map((signal) => (
              <div
                className="correlation-item"
                key={signal.label}
              >
                <div className="correlation-left">
                  <div className="correlation-icon">
                    {signal.icon}
                  </div>

                  <div>
                    <span>
                      {signal.label}
                    </span>

                    <strong>
                      {signal.value}
                    </strong>

                    <span>
                      {signal.detail}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel logs-panel">
        <div className="logs-toolbar">
          <div className="log-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search message, service or level..."
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
              Try changing your search or
              filter settings.
            </p>
          </div>
        ) : (
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>SERVICE</th>
                  <th>LEVEL</th>
                  <th>MESSAGE</th>
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
            Evidence-based failure candidate
            ranking and system reasoning
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchAnalysis}
          disabled={loading}
        >
          <span>↻</span>

          {loading
            ? "Analyzing..."
            : "Run Analysis"}
        </button>
      </div>

      <section className="analysis-hero">
        <div className="analysis-hero-content">
          <span className="eyebrow">
            MOST LIKELY ROOT CAUSE
          </span>

          <h2>
            {rootCause.root_cause ||
              "Unknown"}
          </h2>

          <div className="analysis-confidence-row">
            <span
              className={`confidence-badge ${getConfidenceClass(
                rootCause.confidence
              )}`}
            >
              {rootCause.confidence ||
                "Unknown"}{" "}
              confidence
            </span>

            {candidates.length > 0 && (
              <span className="candidate-rank-badge">
                Highest ranked candidate
              </span>
            )}
          </div>

          <p>
            {rootCause.reason ||
              "No explanation is currently available."}
          </p>
        </div>

        <div className="analysis-score-visual">
          <span>RCA</span>

          <strong>
            {candidates[0]?.score || 0}
          </strong>

          <small>
            confidence score
          </small>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">
              EVIDENCE
            </span>

            <h2>
              Why RootCauseAI suspects this
              service
            </h2>
          </div>
        </div>

        <div className="analysis-evidence">
          {rootCause.evidence?.length ? (
            rootCause.evidence.map(
              (item, index) => (
                <div
                  className="evidence-item"
                  key={index}
                >
                  <span className="evidence-check">
                    ✓
                  </span>

                  <span>
                    {item}
                  </span>
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

            <p className="panel-description">
              Services ranked using failure,
              temporal, correlation and
              dependency signals
            </p>
          </div>

          <span className="panel-count">
            {candidates.length} candidates
          </span>
        </div>

        <div className="candidate-list">
          {candidates.length === 0 ? (
            <div className="logs-empty">
              <p>
                No root-cause candidates
                available.
              </p>
            </div>
          ) : (
            candidates.map(
              (candidate, index) => {
                const isTop =
                  index === 0;

                return (
                  <div
                    className={`candidate-card ${
                      isTop
                        ? "candidate-top"
                        : ""
                    }`}
                    key={candidate.service}
                  >
                    <div className="candidate-rank">
                      #{index + 1}
                    </div>

                    <div className="candidate-info">
                      <div className="candidate-title">
                        <strong>
                          {candidate.service}
                        </strong>

                        {isTop && (
                          <span className="top-candidate-badge">
                            TOP CANDIDATE
                          </span>
                        )}
                      </div>

                      <span>
                        Overall RCA score:{" "}
                        <strong>
                          {candidate.score}
                        </strong>
                      </span>
                    </div>

                    <div className="candidate-score-bar">
                      <div
                        className="candidate-score-fill"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              Number(
                                candidate.score ||
                                  0
                              ) * 10,
                              4
                            ),
                            100
                          )}%`
                        }}
                      />
                    </div>

                    <div className="candidate-scores">
                      <span>
                        Failure
                        <strong>
                          {candidate.failure_score}
                        </strong>
                      </span>

                      <span>
                        Temporal
                        <strong>
                          {candidate.temporal_score}
                        </strong>
                      </span>

                      <span>
                        Correlation
                        <strong>
                          {candidate.correlation_score}
                        </strong>
                      </span>

                      <span>
                        Dependency
                        <strong>
                          {candidate.dependency_score}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </section>

      {rootCause.recommendations?.length >
        0 && (
        <section className="recommendation recommendation-large">
          <div className="recommendation-icon">
            !
          </div>

          <div className="recommendation-content">
            <span className="eyebrow">
              AI RECOMMENDATION
            </span>

            <h3>
              Recommended investigation
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

        <h2>
          RootCauseAI
        </h2>

        <p>
          Initializing system intelligence...
        </p>

        <div className="loading-bar">
          <span />
        </div>
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

        <span className="eyebrow">
          CONNECTION ERROR
        </span>

        <h2>
          Backend unavailable
        </h2>

        <p>
          {error}
        </p>

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

  const navigationItems = [
    {
      name: "Dashboard",
      icon: "⌂"
    },
    {
      name: "Services",
      icon: "◈"
    },
    {
      name: "Incidents",
      icon: "!"
    },
    {
      name: "Logs",
      icon: "≡"
    },
    {
      name: "Analysis",
      icon: "◉"
    }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            R
          </div>

          <div className="brand-text">
            <strong>
              RootCauseAI
            </strong>

            <span>
              System Intelligence
            </span>
          </div>
        </div>

        <div className="sidebar-section-label">
          MONITORING
        </div>

        <nav className="main-navigation">
          {navigationItems.map(
            (item) => (
              <a
                key={item.name}
                className={
                  activePage ===
                  item.name
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleNavigation(
                    item.name
                  )
                }
              >
                <span className="nav-icon">
                  {item.icon}
                </span>

                <span className="nav-label">
                  {item.name}
                </span>

                {item.name ===
                  "Incidents" &&
                  activeIncidents.length >
                    0 && (
                    <span className="nav-count">
                      {
                        activeIncidents.length
                      }
                    </span>
                  )}
              </a>
            )
          )}
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-section-label">
          SYSTEM
        </div>

        <div className="sidebar-system-card">
          <div className="system-status-header">
            <span className="live-dot" />

            <strong>
              Backend Connected
            </strong>
          </div>

          <span>
            Live analysis enabled
          </span>

          <small>
            API · 127.0.0.1:8000
          </small>
        </div>

        <div className="sidebar-footer">
          <span>
            RootCauseAI
          </span>

          <span>
            v0.1.0
          </span>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;