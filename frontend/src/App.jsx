import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://127.0.0.1:8000/api/telemetry/analysis"
      );

      setAnalysis(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to RootCauseAI backend.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>Analyzing system...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>RootCauseAI</h2>
        <p>{error}</p>
        <button onClick={fetchAnalysis}>
          Retry Connection
        </button>
      </div>
    );
  }

  const patterns = analysis.patterns || {};
  const correlations = analysis.correlations || {};
  const candidates = analysis.candidates || {};
  const rootCause = analysis.root_cause_explanation || {};

  const services = Object.entries(patterns);

  const totalFailures = services.reduce(
    (total, [, service]) =>
      total + (service.total_failures || 0),
    0
  );

  const criticalEvents = services.reduce(
    (total, [, service]) =>
      total + (service.critical_count || 0),
    0
  );

  /*
   * Find services affected by the root cause.
   *
   * These are candidates other than the root cause
   * that currently have failures.
   */
  const affectedServices = Array.isArray(candidates)
    ? candidates.filter(
        (candidate) =>
          candidate.service !== rootCause.root_cause &&
          candidate.total_failures > 0
      )
    : [];

  return (
    <div className="app">

      {/* ================================
          SIDEBAR
      ================================= */}

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-icon">
            R
          </div>

          <div>
            <h2>
              RootCause<span>AI</span>
            </h2>

            <p>
              System Intelligence
            </p>
          </div>

        </div>

        <nav>

          <a className="active">
            Dashboard
          </a>

          <a>
            Services
          </a>

          <a>
            Incidents
          </a>

          <a>
            Logs
          </a>

          <a>
            Analysis
          </a>

        </nav>

        <div className="sidebar-bottom">

          <div className="status-dot"></div>

          <div>

            <strong>
              Backend Connected
            </strong>

            <small>
              Live analysis enabled
            </small>

          </div>

        </div>

      </aside>


      {/* ================================
          MAIN CONTENT
      ================================= */}

      <main className="main-content">


        {/* ================================
            HEADER
        ================================= */}

        <header className="topbar">

          <div>

            <p className="eyebrow">
              SYSTEM OVERVIEW
            </p>

            <h1>
              Root Cause Dashboard
            </h1>

            <p className="subtitle">
              Real-time software failure intelligence
            </p>

          </div>


          <button
            className="refresh-btn"
            onClick={fetchAnalysis}
          >
            ↻ Refresh Analysis
          </button>

        </header>


        {/* ================================
            STATS
        ================================= */}

        <section className="stats-grid">


          {/* Services */}

          <div className="stat-card">

            <div className="stat-header">

              <span>
                Services
              </span>

              <div className="stat-icon">
                ◉
              </div>

            </div>

            <strong>
              {services.length}
            </strong>

            <p>
              Monitored services
            </p>

          </div>


          {/* Failures */}

          <div className="stat-card">

            <div className="stat-header">

              <span>
                Total Failures
              </span>

              <div className="stat-icon">
                ⚠
              </div>

            </div>

            <strong>
              {totalFailures}
            </strong>

            <p>
              Detected events
            </p>

          </div>


          {/* Critical */}

          <div className="stat-card">

            <div className="stat-header">

              <span>
                Critical Events
              </span>

              <div className="stat-icon">
                !
              </div>

            </div>

            <strong>
              {criticalEvents}
            </strong>

            <p>

              {criticalEvents === 0
                ? "No critical events"
                : "Critical events detected"}

            </p>

          </div>


          {/* Root Cause */}

          <div className="stat-card root-stat">

            <div className="stat-header">

              <span>
                Root Cause
              </span>

              <div className="stat-icon">
                ⌁
              </div>

            </div>

            <strong>
              {rootCause.root_cause || "Unknown"}
            </strong>

            <p>
              {rootCause.confidence || "Unknown"} confidence
            </p>

          </div>

        </section>


        {/* ================================
            SERVICE HEALTH
        ================================= */}

        <section className="section">

          <div className="section-heading">

            <div>

              <p className="eyebrow">
                SERVICE HEALTH
              </p>

              <h2>
                Monitored Services
              </h2>

            </div>

            <span className="service-count">
              {services.length} services
            </span>

          </div>


          <div className="services-grid">

            {services.map(
              ([service, data]) => (

                <div
                  className="service-card"
                  key={service}
                >

                  <div className="service-top">

                    <div className="service-status"></div>

                    <span className="service-name">
                      {service}
                    </span>

                  </div>


                  <div className="service-number">
                    {data.total_failures}
                  </div>


                  <p>

                    {data.total_failures > 0
                      ? `${data.total_failures} failure${
                          data.total_failures !== 1
                            ? "s"
                            : ""
                        } detected`
                      : "Upstream dependency"}

                  </p>

                </div>

              )
            )}

          </div>

        </section>


        {/* ================================
            ROOT CAUSE + CORRELATION
        ================================= */}

        <section className="analysis-grid">


          {/* ================================
              ROOT CAUSE ANALYSIS
          ================================= */}

          <div className="analysis-card root-cause-card">

            <div className="card-label">

              <span className="warning-symbol">
                !
              </span>

              ROOT CAUSE ANALYSIS

            </div>


            <p className="small-label">
              Most likely root cause
            </p>


            <h2>
              {rootCause.root_cause || "Unknown"}
            </h2>


            <div className="confidence">

              Confidence

              <span>
                {rootCause.confidence?.toUpperCase() ||
                  "UNKNOWN"}
              </span>

            </div>


            <p className="reason">
              {rootCause.reason}
            </p>


            {/* Evidence */}

            <div className="evidence">

              <h4>
                Evidence
              </h4>


              {(rootCause.evidence || []).map(
                (item, index) => (

                  <div
                    className="evidence-item"
                    key={index}
                  >

                    <span>
                      ✓
                    </span>

                    {item}

                  </div>

                )
              )}

            </div>

          </div>


          {/* ================================
              ERROR CORRELATION
          ================================= */}

          <div className="analysis-card">

            <div className="card-label">
              ERROR CORRELATION
            </div>


            <p className="small-label">
              Shared Error Patterns
            </p>


            <div className="correlation-list">

              {Object.entries(correlations).map(
                ([pattern, data]) => (

                  <div
                    className="correlation-item"
                    key={pattern}
                  >

                    <span>
                      {pattern}
                    </span>

                    <strong>
                      {data.count}
                    </strong>

                  </div>

                )
              )}

            </div>

          </div>

        </section>


        {/* ================================
            DEPENDENCY IMPACT
        ================================= */}

        <section className="analysis-card dependency-card">

          <div className="card-label">
            DEPENDENCY IMPACT
          </div>


          <p className="small-label">
            Services affected by{" "}
            <strong>
              {rootCause.root_cause}
            </strong>
          </p>


          {/* Root dependency */}

          <div className="dependency-root">

            <div className="dependency-node root-node">

              <span className="node-status"></span>

              <div>

                <strong>
                  {rootCause.root_cause}
                </strong>

                <small>
                  Root Cause
                </small>

              </div>

            </div>

          </div>


          {/* Arrow */}

          {affectedServices.length > 0 && (

            <div className="dependency-arrow">
              ↓ affects
            </div>

          )}


          {/* Affected services */}

          <div className="affected-services">

            {affectedServices.map(
              (candidate) => (

                <div
                  className="dependency-node"
                  key={candidate.service}
                >

                  <span className="node-status"></span>

                  <div>

                    <strong>
                      {candidate.service}
                    </strong>

                    <small>

                      {candidate.total_failures} failure
                      {candidate.total_failures !== 1
                        ? "s"
                        : ""}

                    </small>

                  </div>

                </div>

              )
            )}

          </div>


          {/* No affected services */}

          {affectedServices.length === 0 && (

            <p className="no-impact">
              No affected services detected.
            </p>

          )}

        </section>


        {/* ================================
            RECOMMENDATION
        ================================= */}

        <section className="recommendation">

          <div className="recommendation-icon">
            →
          </div>


          <div>

            <p className="eyebrow">
              RECOMMENDATION
            </p>


            <h2>
              Investigate{" "}
              {rootCause.root_cause}
            </h2>


            <p>

              {rootCause.recommendations?.[0] ||
                `Investigate ${rootCause.root_cause} and its dependencies.`}

            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;