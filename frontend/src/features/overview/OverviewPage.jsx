import PageHead from "../../components/ui/PageHead";
import StatStrip from "../../components/ui/StatStrip";
import RootCausePanel from "../analysis/RootCausePanel";
import AnomalyPanel from "../anomalies/AnomalyPanel";
import ActiveIncidents from "./ActiveIncidents";
import ServiceHealthPanel from "./ServiceHealthPanel";
import TopMessagesPanel from "./TopMessagesPanel";
import { formatNumber } from "../../lib/format";

export default function OverviewPage({ data }) {
  const { services, incidents, intelligence, analysis, anomalies } = data;
  const summary = services.summary;

  const activeCount = incidents.filter(
    (incident) => incident.status === "ACTIVE"
  ).length;

  const anomalyCount =
    anomalies?.status === "ok" ? anomalies.anomaly_count ?? 0 : "—";

  return (
    <>
      <PageHead
        title="Overview"
        subtitle="Current state of every service, incident and failure signal."
      />

      <StatStrip
        items={[
          {
            label: "Services",
            value: formatNumber(summary.total),
            hint: `${summary.critical} critical · ${summary.degraded} degraded`
          },
          {
            label: "Active incidents",
            value: formatNumber(activeCount),
            hint: `${incidents.length} total`
          },
          {
            label: "Failures",
            value: formatNumber(intelligence?.total_failures ?? 0),
            hint: "ERROR and CRITICAL"
          },
          {
            label: "Log events",
            value: formatNumber(intelligence?.total_logs ?? 0)
          },
          {
            label: "Anomalies",
            value: anomalyCount,
            hint: anomalies?.status === "ok" ? "current window" : "baseline pending"
          }
        ]}
      />

      <div className="grid grid--main-side">
        <div className="stack">
          <RootCausePanel analysis={analysis} />
          <ActiveIncidents incidents={incidents} />
        </div>

        <div className="stack">
          <ServiceHealthPanel services={services.services} />
          <AnomalyPanel anomalies={anomalies} />
          <TopMessagesPanel intelligence={intelligence} />
        </div>
      </div>
    </>
  );
}
