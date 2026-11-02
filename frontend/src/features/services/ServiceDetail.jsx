import PageHead from "../../components/ui/PageHead";
import Panel from "../../components/ui/Panel";
import StatStrip from "../../components/ui/StatStrip";
import StatusMark from "../../components/ui/StatusMark";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import BulletList from "../../components/ui/BulletList";
import Tag from "../../components/ui/Tag";
import { hrefTo } from "../../hooks/useRoute";
import { formatDateTime, formatTime, formatNumber } from "../../lib/format";
import { nextSteps } from "./nextSteps";

const RECENT_LOG_LIMIT = 8;

function LinkList({ names, empty }) {
  if (!names?.length) {
    return <p className="muted">{empty}</p>;
  }

  return (
    <ul className="link-list">
      {names.map((name) => (
        <li key={name}>
          <a className="tag" href={hrefTo("services", name)}>
            {name}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function ServiceDetail({ name, data }) {
  const { services, analysis, incidents, logs, intelligence } = data;

  const service = services.services.find(
    (item) => item.service === name
  );

  const back = (
    <a className="cell-link back-link" href={hrefTo("services")}>
      ← All services
    </a>
  );

  if (!service) {
    return (
      <>
        {back}
        <EmptyState
          title="Service not found"
          text={`No telemetry has been received from "${name}".`}
        />
      </>
    );
  }

  const candidates = analysis?.candidates || [];
  const candidateIndex = candidates.findIndex(
    (item) => item.service === name
  );
  const candidate = candidateIndex >= 0 ? candidates[candidateIndex] : null;
  const isRootCause = candidateIndex === 0;

  const messageCounts = Object.entries(
    intelligence?.service_message_frequency?.[name] || {}
  )
    .map(([message, count]) => ({ message, count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count);

  const recentLogs = logs
    .filter((log) => log.service === name)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, RECENT_LOG_LIMIT);

  const related = incidents.filter(
    (incident) =>
      incident.root_cause === name ||
      (incident.affected_services || []).includes(name)
  );

  const steps = nextSteps({
    service,
    isRootCause,
    analysis,
    services: services.services,
    topMessage: messageCounts[0]?.message
  });

  const logColumns = [
    { key: "time", header: "Time", mono: true, render: (log) => formatTime(log.timestamp) },
    { key: "level", header: "Level", render: (log) => <StatusMark status={log.level} /> },
    { key: "message", header: "Message", wrap: true, render: (log) => log.message }
  ];

  const messageColumns = [
    { key: "message", header: "Message", wrap: true, render: (row) => row.message },
    { key: "count", header: "Count", align: "right", render: (row) => row.count }
  ];

  const incidentColumns = [
    { key: "id", header: "ID", mono: true, render: (incident) => incident.incident_id },
    { key: "status", header: "Status", render: (incident) => <StatusMark status={incident.status} /> },
    { key: "role", header: "Role", render: (incident) => incident.root_cause === name ? "Root cause" : "Affected" },
    { key: "started", header: "Started", mono: true, render: (incident) => formatDateTime(incident.started_at) }
  ];

  return (
    <>
      {back}

      <PageHead title={service.service}>
        <StatusMark status={service.health} />
      </PageHead>

      <StatStrip
        items={[
          { label: "Errors", value: formatNumber(service.error_count) },
          { label: "Critical", value: formatNumber(service.critical_count) },
          { label: "Total failures", value: formatNumber(service.total_failures) },
          { label: "Last failure", value: formatTime(service.last_failure), hint: formatDateTime(service.last_failure) },
          {
            label: "RCA rank",
            value: candidate ? `#${candidateIndex + 1}` : "—",
            hint: candidate ? `of ${candidates.length} candidates` : "not a candidate"
          }
        ]}
      />

      <div className="grid grid--main-side">
        <div className="stack">
          <Panel title="Root cause context">
            {candidate ? (
              <div className="stack">
                <p>
                  {isRootCause ? (
                    <Tag strong>Most likely root cause</Tag>
                  ) : (
                    <Tag>Candidate #{candidateIndex + 1}</Tag>
                  )}
                </p>

                <dl className="kv">
                  <dt className="label">RCA score</dt>
                  <dd>{candidate.score}</dd>
                  <dt className="label">Failure score</dt>
                  <dd>{candidate.failure_score ?? 0}</dd>
                  <dt className="label">Timing score</dt>
                  <dd>{candidate.temporal_score ?? 0}</dd>
                  <dt className="label">Correlation score</dt>
                  <dd>{candidate.correlation_score ?? 0}</dd>
                  <dt className="label">Dependency score</dt>
                  <dd>{candidate.dependency_score ?? 0}</dd>
                </dl>
              </div>
            ) : (
              <p className="muted">
                This service is not a root-cause candidate. It has no recorded failures.
              </p>
            )}
          </Panel>

          <Panel title="Recent logs" meta={`Last ${recentLogs.length}`} flush={recentLogs.length > 0}>
            <DataTable
              caption={`Recent logs from ${name}`}
              columns={logColumns}
              rows={recentLogs}
              rowKey={(log) => log.id}
              empty={<EmptyState title="No logs" text="This service has not sent any logs." />}
            />
          </Panel>

          <Panel title="Related incidents" meta={`${related.length}`} flush={related.length > 0}>
            <DataTable
              caption={`Incidents involving ${name}`}
              columns={incidentColumns}
              rows={related}
              rowKey={(incident) => incident.incident_id}
              rowHref={(incident) => hrefTo("incidents", incident.incident_id)}
              empty={<EmptyState title="No incidents" text="This service has not been part of an incident." />}
            />
          </Panel>
        </div>

        <div className="stack">
          <Panel title="Next steps">
            <BulletList items={steps} ordered />
          </Panel>

          <Panel title="Dependencies">
            <h3 className="label subhead">Depends on</h3>
            <LinkList names={service.depends_on} empty="No upstream dependencies." />

            <h3 className="label subhead">Depended on by</h3>
            <LinkList names={service.dependents} empty="No dependents." />
          </Panel>

          <Panel title="Frequent errors" flush={messageCounts.length > 0}>
            <DataTable
              caption={`Most frequent errors from ${name}`}
              columns={messageColumns}
              rows={messageCounts}
              rowKey={(row) => row.message}
              empty={<EmptyState title="No errors" text="No failure messages recorded." />}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
