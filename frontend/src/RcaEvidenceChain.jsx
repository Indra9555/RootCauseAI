import React, { useMemo } from "react";
import "./RcaEvidenceChain.css";

function formatLabel(value) {
  if (!value) {
    return "Unavailable";
  }

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getEvidenceState(value) {
  return value > 0 ? "detected" : "none";
}

function EvidenceCard({
  number,
  title,
  description,
  value,
  suffix = "",
  state = "detected"
}) {
  return (
    <div className={`rca-evidence-card ${state}`}>
      <div className="rca-evidence-number">
        {number}
      </div>

      <div className="rca-evidence-content">
        <div className="rca-evidence-card-header">
          <span>{title}</span>

          <span className={`rca-evidence-status ${state}`}>
            {state === "detected"
              ? "DETECTED"
              : "NONE"}
          </span>
        </div>

        <p>{description}</p>

        <div className="rca-evidence-value">
          <strong>{value}</strong>

          {suffix && <span>{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

function RcaEvidenceChain({
  candidates = [],
  rootCause = {},
  serviceHealth = null,
  onOpenService
}) {
  const primaryCandidate = useMemo(() => {
    if (!candidates.length) {
      return null;
    }

    if (rootCause?.root_cause) {
      return (
        candidates.find(
          (candidate) =>
            candidate.service ===
            rootCause.root_cause
        ) || candidates[0]
      );
    }

    return candidates[0];
  }, [candidates, rootCause]);

  const rootCauseService =
    primaryCandidate?.service ||
    rootCause?.root_cause ||
    null;

  const failureScore =
    primaryCandidate?.failure_score || 0;

  const temporalScore =
    primaryCandidate?.temporal_score || 0;

  const correlationScore =
    primaryCandidate?.correlation_score || 0;

  const dependencyScore =
    primaryCandidate?.dependency_score || 0;

  const dependencyBonus =
    primaryCandidate?.dependency_bonus || 0;

  const rcaScore =
    primaryCandidate?.score ||
    rootCause?.rca_score ||
    0;

  const confidence =
    rootCause?.confidence ||
    (rcaScore >= 50
      ? "HIGH"
      : rcaScore >= 25
      ? "MEDIUM"
      : "LOW");

  const totalFailures =
    primaryCandidate?.total_failures ||
    0;

  const errorCount =
    primaryCandidate?.error_count ||
    0;

  const criticalCount =
    primaryCandidate?.critical_count ||
    0;

  const serviceData =
    serviceHealth?.services?.find(
      (service) =>
        service.service ===
        rootCauseService
    );

  const incidentActive =
    serviceData?.incident_active ||
    false;

  if (!rootCauseService) {
    return (
      <section className="rca-evidence-chain">
        <div className="rca-evidence-empty">
          <span className="rca-evidence-eyebrow">
            RCA EVIDENCE
          </span>

          <h2>
            Root-Cause Evidence Chain
          </h2>

          <p>
            No root-cause candidate is currently
            available for evidence analysis.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rca-evidence-chain">
      <div className="rca-evidence-header">
        <div>
          <span className="rca-evidence-eyebrow">
            RCA EVIDENCE
          </span>

          <h2>
            Root-Cause Evidence Chain
          </h2>

          <p>
            The evidence contributing to the
            current root-cause decision.
          </p>
        </div>

        <button
          className="rca-evidence-service-button"
          onClick={() =>
            onOpenService?.(
              rootCauseService
            )
          }
        >
          Inspect {rootCauseService} →
        </button>
      </div>

      <div className="rca-evidence-hero">
        <div className="rca-evidence-hero-service">
          <div className="rca-evidence-service-icon">
            {formatLabel(
              rootCauseService
            )
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <span>
              CURRENT PRIMARY SUSPECT
            </span>

            <strong>
              {rootCauseService}
            </strong>

            <small>
              {incidentActive
                ? "Active incident impact detected"
                : "Current RCA candidate"}
            </small>
          </div>
        </div>

        <div className="rca-evidence-score">
          <span>RCA SCORE</span>

          <strong>{rcaScore}</strong>

          <small>
            {confidence.toUpperCase()} CONFIDENCE
          </small>
        </div>
      </div>

      <div className="rca-evidence-flow">
        <EvidenceCard
          number="01"
          title="Failure Evidence"
          description="Observed failures and severity contribute to the candidate score."
          value={totalFailures}
          suffix="total failures"
          state={getEvidenceState(
            totalFailures
          )}
        />

        <div className="rca-evidence-arrow">
          →
        </div>

        <EvidenceCard
          number="02"
          title="Temporal Evidence"
          description="Earlier failure activity increases the likelihood of being upstream."
          value={temporalScore}
          suffix="temporal points"
          state={getEvidenceState(
            temporalScore
          )}
        />

        <div className="rca-evidence-arrow">
          →
        </div>

        <EvidenceCard
          number="03"
          title="Correlation Evidence"
          description="Related failures across services strengthen the correlation signal."
          value={correlationScore}
          suffix="correlation points"
          state={getEvidenceState(
            correlationScore
          )}
        />

        <div className="rca-evidence-arrow">
          →
        </div>

        <EvidenceCard
          number="04"
          title="Dependency Evidence"
          description="Dependency relationships provide additional RCA confidence."
          value={dependencyScore}
          suffix="dependency points"
          state={getEvidenceState(
            dependencyScore
          )}
        />
      </div>

      <div className="rca-evidence-breakdown">
        <div className="rca-breakdown-header">
          <div>
            <span>
              SCORE CONTRIBUTION
            </span>

            <h3>
              RCA Decision Breakdown
            </h3>
          </div>

          <span className="rca-breakdown-total">
            {rcaScore} TOTAL
          </span>
        </div>

        <div className="rca-breakdown-grid">
          <div className="rca-breakdown-item">
            <span>Failure score</span>
            <strong>{failureScore}</strong>
          </div>

          <div className="rca-breakdown-item">
            <span>Temporal score</span>
            <strong>{temporalScore}</strong>
          </div>

          <div className="rca-breakdown-item">
            <span>Correlation score</span>
            <strong>{correlationScore}</strong>
          </div>

          <div className="rca-breakdown-item">
            <span>Dependency score</span>
            <strong>{dependencyScore}</strong>
          </div>

          <div className="rca-breakdown-item">
            <span>Dependency bonus</span>
            <strong>
              +{dependencyBonus}
            </strong>
          </div>
        </div>
      </div>

      <div className="rca-evidence-observation">
        <div className="rca-observation-icon">
          AI
        </div>

        <div>
          <span>
            ANALYSIS OBSERVATION
          </span>

          <p>
            <strong>
              {rootCauseService}
            </strong>{" "}
            currently has {errorCount} errors
            and {criticalCount} critical failures.
            The RCA engine combines failure,
            temporal, correlation, and dependency
            signals to rank this service as the
            primary suspect.
          </p>
        </div>
      </div>
    </section>
  );
}

export default RcaEvidenceChain;