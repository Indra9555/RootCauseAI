import React, { useMemo } from "react";
import "./IncidentTimeline.css";

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "—";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatRelativeTime(startTimestamp, timestamp) {
  if (!startTimestamp || !timestamp) {
    return "—";
  }

  const start = new Date(startTimestamp).getTime();
  const current = new Date(timestamp).getTime();

  if (
    Number.isNaN(start) ||
    Number.isNaN(current)
  ) {
    return "—";
  }

  const difference = Math.max(
    0,
    Math.floor((current - start) / 1000)
  );

  if (difference < 60) {
    return `+${difference}s`;
  }

  const minutes = Math.floor(difference / 60);
  const seconds = difference % 60;

  if (minutes < 60) {
    return `+${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `+${hours}h ${remainingMinutes}m`;
}

function formatDuration(startTimestamp, endTimestamp) {
  if (!startTimestamp || !endTimestamp) {
    return "—";
  }

  const start = new Date(startTimestamp).getTime();
  const end = new Date(endTimestamp).getTime();

  if (
    Number.isNaN(start) ||
    Number.isNaN(end)
  ) {
    return "—";
  }

  const difference = Math.max(
    0,
    Math.floor((end - start) / 1000)
  );

  if (difference < 60) {
    return `${difference}s`;
  }

  const minutes = Math.floor(difference / 60);
  const seconds = difference % 60;

  if (minutes < 60) {
    return `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

function classifyEvent(eventType = "") {
  const type = eventType.toLowerCase();

  if (
    type.includes("resolved") ||
    type.includes("recovery") ||
    type.includes("recovered") ||
    type.includes("closed")
  ) {
    return {
      className: "timeline-event-recovery",
      label: "RECOVERY",
      icon: "✓"
    };
  }

  if (
    type.includes("root") ||
    type.includes("cause") ||
    type.includes("rca")
  ) {
    return {
      className: "timeline-event-rca",
      label: "RCA SIGNAL",
      icon: "◆"
    };
  }

  if (
    type.includes("critical") ||
    type.includes("failure") ||
    type.includes("error") ||
    type.includes("failed")
  ) {
    return {
      className: "timeline-event-failure",
      label: "FAILURE",
      icon: "!"
    };
  }

  if (
    type.includes("affected") ||
    type.includes("dependency") ||
    type.includes("impact") ||
    type.includes("propagation")
  ) {
    return {
      className: "timeline-event-impact",
      label: "IMPACT",
      icon: "↳"
    };
  }

  if (
    type.includes("incident") ||
    type.includes("started") ||
    type.includes("trigger")
  ) {
    return {
      className: "timeline-event-start",
      label: "INCIDENT",
      icon: "●"
    };
  }

  return {
    className: "timeline-event-neutral",
    label: eventType
      ? eventType.replaceAll("_", " ").toUpperCase()
      : "EVENT",
    icon: "•"
  };
}

function isFailureEvent(event) {
  const type = (
    event?.event_type || ""
  ).toLowerCase();

  return (
    type.includes("failure") ||
    type.includes("failed") ||
    type.includes("error") ||
    type.includes("critical")
  );
}

function IncidentTimeline({
  incident,
  events = [],
  loading = false
}) {
  const timelineEvents = useMemo(() => {
    return [...events].sort(
      (a, b) =>
        new Date(a.timestamp) -
        new Date(b.timestamp)
    );
  }, [events]);

  const incidentStart = useMemo(() => {
    if (incident?.started_at) {
      return incident.started_at;
    }

    return timelineEvents[0]?.timestamp || null;
  }, [incident, timelineEvents]);

  const latestEvent = useMemo(() => {
    return (
      timelineEvents[
        timelineEvents.length - 1
      ] || null
    );
  }, [timelineEvents]);

  const firstFailure = useMemo(() => {
    return (
      timelineEvents.find((event) =>
        isFailureEvent(event)
      ) || null
    );
  }, [timelineEvents]);

  const rootCauseService =
    incident?.root_cause || null;

  const duration = formatDuration(
    incidentStart,
    latestEvent?.timestamp
  );

  return (
    <section className="incident-timeline-panel">
      <div className="incident-timeline-header">
        <div>
          <span className="incident-timeline-eyebrow">
            FAILURE PROPAGATION TIMELINE
          </span>

          <h2>
            Incident Sequence
          </h2>

          <p>
            Observed lifecycle and failure
            signals recorded by RootCauseAI.
          </p>
        </div>

        <div className="incident-timeline-header-meta">
          <div className="timeline-event-count">
            <strong>
              {timelineEvents.length}
            </strong>

            <span>events</span>
          </div>

          <div className="timeline-duration">
            <span>DURATION</span>

            <strong>
              {duration}
            </strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="incident-timeline-empty">
          <div className="timeline-spinner" />

          <h3>
            Loading incident sequence
          </h3>

          <p>
            Fetching persisted incident events...
          </p>
        </div>
      ) : timelineEvents.length === 0 ? (
        <div className="incident-timeline-empty">
          <div className="timeline-empty-icon">
            ⌁
          </div>

          <h3>
            No incident events
          </h3>

          <p>
            No persisted lifecycle events were
            recorded for this incident.
          </p>
        </div>
      ) : (
        <>
          <div className="timeline-overview">
            <div className="timeline-overview-card">
              <span>
                INCIDENT START
              </span>

              <strong>
                {incidentStart
                  ? formatTimestamp(
                      incidentStart
                    )
                  : "—"}
              </strong>
            </div>

            <div className="timeline-overview-card">
              <span>
                FIRST FAILURE
              </span>

              <strong>
                {firstFailure?.timestamp
                  ? formatTimestamp(
                      firstFailure.timestamp
                    )
                  : "Not observed"}
              </strong>
            </div>

            <div className="timeline-overview-card timeline-overview-root">
              <span>
                RCA RESULT
              </span>

              <strong>
                {rootCauseService ||
                  "Not identified"}
              </strong>
            </div>

            <div className="timeline-overview-card">
              <span>
                LATEST EVENT
              </span>

              <strong>
                {latestEvent?.timestamp
                  ? formatTimestamp(
                      latestEvent.timestamp
                    )
                  : "—"}
              </strong>
            </div>
          </div>

          <div className="timeline-sequence-note">
            <span className="timeline-note-icon">
              i
            </span>

            <p>
              The timeline shows the observed event
              sequence. The RCA result is displayed
              separately and does not imply causality
              unless supported by the dependency and
              analysis engines.
            </p>
          </div>

          <div className="incident-timeline-list">
            {timelineEvents.map(
              (event, index) => {
                const classification =
                  classifyEvent(
                    event.event_type
                  );

                const isRootCauseEvent =
                  Boolean(
                    rootCauseService &&
                      event.service ===
                        rootCauseService
                  );

                const isFirstFailure =
                  firstFailure?.id === event.id;

                const isLatest =
                  latestEvent?.id === event.id;

                return (
                  <div
                    className={`timeline-event-row ${classification.className}`}
                    key={
                      event.id ??
                      `${event.timestamp}-${index}`
                    }
                  >
                    <div className="timeline-track">
                      <div
                        className={`timeline-marker ${classification.className}`}
                      >
                        <span>
                          {classification.icon}
                        </span>
                      </div>

                      {index <
                        timelineEvents.length -
                          1 && (
                        <div className="timeline-connector" />
                      )}
                    </div>

                    <div className="timeline-event-card">
                      <div className="timeline-event-top">
                        <div className="timeline-event-heading">
                          <span
                            className={`timeline-type-badge ${classification.className}`}
                          >
                            {classification.label}
                          </span>

                          {event.service && (
                            <span className="timeline-service">
                              {event.service}
                            </span>
                          )}

                          {isRootCauseEvent && (
                            <span className="timeline-rca-badge">
                              RCA SIGNAL
                            </span>
                          )}

                          {isFirstFailure && (
                            <span className="timeline-first-badge">
                              FIRST FAILURE
                            </span>
                          )}

                          {isLatest && (
                            <span className="timeline-latest-badge">
                              LATEST
                            </span>
                          )}
                        </div>

                        <div className="timeline-event-time">
                          <strong>
                            {formatRelativeTime(
                              incidentStart,
                              event.timestamp
                            )}
                          </strong>

                          <span>
                            {formatTimestamp(
                              event.timestamp
                            )}
                          </span>
                        </div>
                      </div>

                      {event.message && (
                        <p className="timeline-event-message">
                          {event.message}
                        </p>
                      )}

                      <div className="timeline-event-footer">
                        <span>
                          EVENT ID
                        </span>

                        <code>
                          #{event.id ?? "—"}
                        </code>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default IncidentTimeline;