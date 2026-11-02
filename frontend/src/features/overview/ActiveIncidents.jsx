import Panel from "../../components/ui/Panel";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import StatusMark from "../../components/ui/StatusMark";
import { hrefTo } from "../../hooks/useRoute";
import { formatDuration, formatTime } from "../../lib/format";

export default function ActiveIncidents({ incidents }) {
  const active = incidents.filter(
    (incident) => incident.status === "ACTIVE"
  );

  const columns = [
    {
      key: "id",
      header: "ID",
      mono: true,
      render: (incident) => incident.incident_id
    },
    {
      key: "severity",
      header: "Severity",
      render: (incident) => <StatusMark status={incident.severity} />
    },
    {
      key: "root",
      header: "Root cause",
      mono: true,
      render: (incident) => incident.root_cause
    },
    {
      key: "started",
      header: "Started",
      mono: true,
      render: (incident) => formatTime(incident.started_at)
    },
    {
      key: "duration",
      header: "Open for",
      align: "right",
      render: (incident) =>
        formatDuration(incident.started_at, incident.ended_at)
    }
  ];

  return (
    <Panel
      title="Active incidents"
      meta={`${active.length} open`}
      flush={active.length > 0}
    >
      <DataTable
        caption="Incidents that are still active"
        columns={columns}
        rows={active}
        rowKey={(incident) => incident.incident_id}
        rowHref={(incident) =>
          hrefTo("incidents", incident.incident_id)
        }
        empty={
          <EmptyState
            title="No active incidents"
            text="Incidents open automatically when a service logs an ERROR or CRITICAL event."
          />
        }
      />
    </Panel>
  );
}
