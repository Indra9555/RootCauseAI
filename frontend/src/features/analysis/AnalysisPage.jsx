import PageHead from "../../components/ui/PageHead";
import Panel from "../../components/ui/Panel";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import Meter from "../../components/ui/Meter";
import RootCausePanel from "./RootCausePanel";
import CandidateTable from "./CandidateTable";
import { hrefTo } from "../../hooks/useRoute";
import { formatDateTime, formatOffset } from "../../lib/format";

export default function AnalysisPage({ data }) {
  const { analysis, intelligence } = data;

  const candidates = analysis?.candidates || [];
  const sequence = analysis?.temporal_analysis || [];

  const correlations = Object.entries(analysis?.correlations || {})
    .map(([keyword, value]) => ({
      keyword,
      count: value.count,
      services: value.services || []
    }))
    .sort((a, b) => b.count - a.count);

  const patterns = Object.entries(analysis?.patterns || {})
    .map(([service, value]) => ({ service, ...value }))
    .sort((a, b) => b.total_failures - a.total_failures);

  const levels = Object.entries(intelligence?.level_counts || {})
    .map(([level, count]) => ({ level, count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count);
  const mostLevel = Math.max(1, ...levels.map((row) => row.count));

  const sequenceColumns = [
    { key: "order", header: "Order", render: (row) => `#${sequence.indexOf(row) + 1}` },
    { key: "service", header: "Service", mono: true, render: (row) => row.service },
    { key: "first", header: "First failure", mono: true, render: (row) => formatDateTime(row.first_failure) },
    {
      key: "offset",
      header: "After first",
      align: "right",
      render: (row) => formatOffset(sequence[0].first_failure, row.first_failure)
    }
  ];

  const correlationColumns = [
    { key: "keyword", header: "Keyword", mono: true, render: (row) => row.keyword },
    { key: "count", header: "Count", align: "right", render: (row) => row.count },
    { key: "services", header: "Services", mono: true, render: (row) => row.services.join(", ") }
  ];

  const patternColumns = [
    { key: "service", header: "Service", mono: true, render: (row) => row.service },
    { key: "errors", header: "Errors", align: "right", render: (row) => row.error_count },
    { key: "critical", header: "Critical", align: "right", render: (row) => row.critical_count },
    { key: "total", header: "Total", align: "right", render: (row) => row.total_failures }
  ];

  const levelColumns = [
    { key: "level", header: "Level", mono: true, render: (row) => row.level },
    { key: "count", header: "Events", align: "right", render: (row) => row.count },
    {
      key: "share",
      header: "Share",
      render: (row) => (
        <Meter value={row.count} max={mostLevel} label={`${row.level} events`} />
      )
    }
  ];

  return (
    <>
      <PageHead
        title="Analysis"
        subtitle="How the root cause was chosen: ranking, timing, shared messages and dependencies."
      />

      <div className="grid grid--main-side">
        <div className="stack">
          <RootCausePanel analysis={analysis} detailed />

          <Panel
            title="Candidate ranking"
            meta={`${candidates.length} services`}
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
              empty={<EmptyState title="No correlations" text="Shared keywords appear when several services fail with similar messages." />}
            />
          </Panel>
        </div>

        <div className="stack">
          <Panel title="Failure sequence" flush={sequence.length > 0}>
            <DataTable
              caption="Order in which services first failed"
              columns={sequenceColumns}
              rows={sequence}
              rowKey={(row) => row.service}
              rowHref={(row) => hrefTo("services", row.service)}
              empty={<EmptyState title="No failures" text="The order of first failures is shown here." />}
            />
          </Panel>

          <Panel title="Failure patterns" flush={patterns.length > 0}>
            <DataTable
              caption="Failure counts per service"
              columns={patternColumns}
              rows={patterns}
              rowKey={(row) => row.service}
              rowHref={(row) => hrefTo("services", row.service)}
              empty={<EmptyState title="No failures" text="Failure counts appear after the first ERROR or CRITICAL log." />}
            />
          </Panel>

          <Panel title="Events by level" flush={levels.length > 0}>
            <DataTable
              caption="Number of log events per level"
              columns={levelColumns}
              rows={levels}
              rowKey={(row) => row.level}
              empty={<EmptyState title="No logs" text="Level counts appear once logs arrive." />}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
