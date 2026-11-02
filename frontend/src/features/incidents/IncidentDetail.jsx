import PageHead from "../../components/ui/PageHead";
import Panel from "../../components/ui/Panel";
import StatStrip from "../../components/ui/StatStrip";
import StatusMark from "../../components/ui/StatusMark";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import BulletList from "../../components/ui/BulletList";
import Skeleton from "../../components/ui/Skeleton";
import Tag from "../../components/ui/Tag";
import CandidateTable from "../analysis/CandidateTable";
import Timeline from "./Timeline";
import { hrefTo } from "../../hooks/useRoute";
import { formatDateTime, formatDuration, formatNumber, parseDate } from "../../lib/format";

export default function IncidentDetail({ id, state, services }) {
  const back = (
    <a className="cell-link back-link" href={hrefTo("incidents")}>
      ← All incidents
    </a>
  );

  if (state.loading) {
    return (
      <>
        {back}
        <Skeleton rows={8} />
      </>
    );
  }

  if (state.notFound || !state.detail) {
    return (
      <>
        {back}
        <EmptyState
          title={state.notFound ? "Incident not found" : "Could not load incident"}
          text={
            state.notFound
              ? `There is no incident with ID ${id}.`
              : "The backend did not respond. The page retries automatically."
          }
        />
      </>
    );
  }

  const { incident, events, analysis } = state.detail;
  const candidates = analysis?.candidates || [];
  const correlations = Object.entries(analysis?.correlations || {})
    .map(([keyword, value]) => ({
      keyword,
      count: value.count,
      services: value.services || []
    }))
    .sort((a, b) => b.count - a.count);

  const lastFailure = events
    .filter((event) => event.event_type === "FAILURE_DETECTED")
    .map((event) => parseDate(event.timestamp))
    .filter(Boolean)
    .reduce((latest, date) => (!latest || date > latest ? date : latest), null);

  const affected = (incident.affected_services || []).map((name) => ({
    name,
    health:
      services.find((service) => service.service === name)?.health ||
      "UNKNOWN"
  }));

  const affectedColumns = [
    { key: "service", header: "Service", mono: true, render: (row) => row.name },
    { key: "health", header: "Current health", render: (row) => <StatusMark status={row.health} /> },
    { key: "role", header: "Role", render: (row) => row.name === incident.root_cause ? "Root cause" : "Affected" }
  ];

  const correlationColumns = [
    { key: "keyword", header: "Keyword", mono: true, render: (row) => row.keyword },
    { key: "count", header: "Count", align: "right", render: (row) => row.count },
    { key: "services", header: "Services", mono: true, render: (row) => row.services.join(", ") }
  ];

  return (
    <>
      {back}

      <PageHead title={`${incident.incident_id}`} subtitle={incident.title}>
        <div className="link-list">
          <StatusMark status={incident.status} />
          <StatusMark status={incident.severity} />
        </div>
      </PageHead>

      <StatStrip
        items={[
          { label: "Started", value: formatDateTime(incident.started_at) },
          {
            label: incident.status === "ACTIVE" ? "Open for" : "Duration",
            value: formatDuration(incident.started_at, incident.ended_at)
          },
          { label: "Failures", value: formatNumber(incident.failure_count) },
          {
            label: "Last failure",
            value: lastFailure ? formatDateTime(lastFailure) : "—"
          },
          { label: "Root cause", value: incident.root_cause || "—" },
          {
            label: "RCA score",
            value: incident.rca_score,
            hint: `${incident.confidence} confidence`
          }
        ]}
      />

      <div className="grid grid--main-side">
        <div className="stack">
          <Panel title="Explanation">
            <div className="stack">
              <p>{incident.explanation || "No explanation recorded."}</p>

              <div>
                <h3 className="label subhead">Evidence</h3>
                <BulletList items={incident.evidence} />
              </div>

              <div>
                <h3 className="label subhead">Recommended actions</h3>
                <BulletList items={incident.recommendations} ordered />
              </div>
            </div>
          </Panel>

          <Panel
            title="Root cause candidates"
            meta={`${candidates.length} ranked`}
            flush={candidates.length > 0}
          >
            <CandidateTable candidates={candidates} />
          </Panel>

          <Panel title="Message correlations" flush={correlations.length > 0}>
            <DataTable
              caption="Keywords shared across failure messages"
              columns={correlationColumns}
              rows={correlations}
              rowKey={(row) => row.keyword}
              empty={<EmptyState title="No correlations" text="No shared keywords found in the failure messages." />}
            />
          </Panel>
        </div>

        <div className="stack">
          <Panel
            title="Affected services"
            meta={<Tag>{affected.length}</Tag>}
            flush={affected.length > 0}
          >
            <DataTable
              caption="Services affected by this incident"
              columns={affectedColumns}
              rows={affected}
              rowKey={(row) => row.name}
              rowHref={(row) => hrefTo("services", row.name)}
              empty={<EmptyState title="None" text="No affected services recorded." />}
            />
          </Panel>

          <Timeline events={events} />
        </div>
      </div>
    </>
  );
}
