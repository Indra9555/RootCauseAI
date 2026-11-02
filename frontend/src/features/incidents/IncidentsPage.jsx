import { useState } from "react";
import PageHead from "../../components/ui/PageHead";
import Panel from "../../components/ui/Panel";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import FilterGroup from "../../components/ui/FilterGroup";
import StatusMark from "../../components/ui/StatusMark";
import { hrefTo } from "../../hooks/useRoute";
import { formatDateTime, formatDuration } from "../../lib/format";

const FILTERS = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "RESOLVED", label: "Resolved" }
];

export default function IncidentsPage({ incidents }) {
  const [filter, setFilter] = useState("ALL");

  const rows =
    filter === "ALL"
      ? incidents
      : incidents.filter((incident) => incident.status === filter);

  const columns = [
    { key: "id", header: "ID", mono: true, render: (i) => i.incident_id },
    { key: "title", header: "Title", wrap: true, render: (i) => i.title },
    { key: "status", header: "Status", render: (i) => <StatusMark status={i.status} /> },
    { key: "severity", header: "Severity", render: (i) => <StatusMark status={i.severity} /> },
    { key: "started", header: "Started", mono: true, render: (i) => formatDateTime(i.started_at) },
    { key: "duration", header: "Duration", align: "right", render: (i) => formatDuration(i.started_at, i.ended_at) },
    { key: "failures", header: "Failures", align: "right", render: (i) => i.failure_count },
    { key: "confidence", header: "Confidence", render: (i) => i.confidence },
    { key: "score", header: "RCA score", align: "right", render: (i) => i.rca_score }
  ];

  return (
    <>
      <PageHead
        title="Incidents"
        subtitle="Failures grouped by related services within a 30-minute window."
      >
        <FilterGroup
          label="Filter incidents by status"
          options={FILTERS}
          value={filter}
          onChange={setFilter}
        />
      </PageHead>

      <Panel
        title="Incident log"
        meta={`${rows.length} shown`}
        flush={rows.length > 0}
      >
        <DataTable
          caption="Incidents, newest first"
          columns={columns}
          rows={rows}
          rowKey={(incident) => incident.incident_id}
          rowHref={(incident) => hrefTo("incidents", incident.incident_id)}
          empty={
            <EmptyState
              title={filter === "ALL" ? "No incidents" : `No ${filter.toLowerCase()} incidents`}
              text="An incident opens automatically when a service logs an ERROR or CRITICAL event."
            />
          }
        />
      </Panel>
    </>
  );
}
