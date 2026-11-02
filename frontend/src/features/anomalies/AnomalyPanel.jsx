import Panel from "../../components/ui/Panel";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import StatusMark from "../../components/ui/StatusMark";
import { hrefTo } from "../../hooks/useRoute";
import { formatTime, titleCase } from "../../lib/format";

export default function AnomalyPanel({ anomalies }) {
  const list = (anomalies?.anomalies || []).filter(
    (item) => item.is_anomaly
  );

  const columns = [
    {
      key: "service",
      header: "Service",
      mono: true,
      render: (item) => item.service
    },
    {
      key: "severity",
      header: "Severity",
      render: (item) => <StatusMark status={item.severity} />
    },
    {
      key: "baseline",
      header: "Baseline",
      align: "right",
      render: (item) => item.baseline_failures
    },
    {
      key: "current",
      header: "Current",
      align: "right",
      render: (item) => item.current_failures
    },
    {
      key: "ratio",
      header: "Ratio",
      align: "right",
      render: (item) => `${item.deviation_ratio}×`
    },
    {
      key: "incident",
      header: "Incident link",
      render: (item) =>
        titleCase(item.incident_context?.relationship || "none")
    }
  ];

  let body;

  if (!anomalies) {
    body = (
      <EmptyState
        title="No anomaly data"
        text="Waiting for the first response from the backend."
      />
    );
  } else if (anomalies.status !== "ok") {
    body = (
      <EmptyState
        title="Baseline not ready"
        text={
          anomalies.message ||
          "More history is needed before anomalies can be detected."
        }
      />
    );
  } else if (!list.length) {
    body = (
      <EmptyState
        title="No anomalies"
        text="Failure rates match the baseline in the current window."
      />
    );
  } else {
    body = (
      <DataTable
        caption="Services failing faster than their baseline"
        columns={columns}
        rows={list}
        rowKey={(item) => item.service}
        rowHref={(item) => hrefTo("services", item.service)}
      />
    );
  }

  return (
    <Panel
      title="Anomalies"
      meta={
        anomalies?.status === "ok" && anomalies.current_window
          ? `Window from ${formatTime(anomalies.current_window.start)}`
          : null
      }
      flush={Boolean(list.length)}
    >
      {body}
    </Panel>
  );
}
