import { useState } from "react";
import Panel from "../../components/ui/Panel";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { formatDateTime, titleCase } from "../../lib/format";

// Event type -> dot tone, so the rail reads at a glance.
const EVENT_TONE = {
  FAILURE_DETECTED: "alert",
  INCIDENT_CREATED: "warn",
  RCA_UPDATED: "muted",
  INCIDENT_RESOLVED: "ok"
};

export default function Timeline({ events }) {
  const [hideRca, setHideRca] = useState(false);

  const visible = hideRca
    ? events.filter((event) => event.event_type !== "RCA_UPDATED")
    : events;

  return (
    <Panel
      title="Timeline"
      meta={`${visible.length} of ${events.length} events`}
      actions={
        <Button
          aria-pressed={hideRca}
          onClick={() => setHideRca((value) => !value)}
        >
          Hide RCA updates
        </Button>
      }
    >
      {!visible.length ? (
        <EmptyState title="No events" text="Events are recorded as the incident develops." />
      ) : (
        <ol className="timeline">
          {visible.map((event) => (
            <li
              key={event.id}
              className="timeline__item"
              data-tone={EVENT_TONE[event.event_type] || "muted"}
            >
              <span className="timeline__dot" aria-hidden="true" />

              <div>
                <p className="label">
                  <time dateTime={event.timestamp}>
                    {formatDateTime(event.timestamp)}
                  </time>
                  {" · "}
                  {titleCase(event.event_type)}
                  {event.service ? ` · ${event.service}` : ""}
                </p>

                <p>{event.message}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
