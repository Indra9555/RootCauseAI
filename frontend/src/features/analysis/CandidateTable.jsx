import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import Meter from "../../components/ui/Meter";
import { hrefTo } from "../../hooks/useRoute";

// Candidates arrive with the selected root cause first.
export default function CandidateTable({ candidates }) {
  const topScore = Math.max(1, ...candidates.map((c) => c.score || 0));

  const columns = [
    {
      key: "service",
      header: "Service",
      mono: true,
      render: (candidate) => candidate.service
    },
    {
      key: "rank",
      header: "Rank",
      render: (candidate) =>
        `#${candidates.indexOf(candidate) + 1}`
    },
    {
      key: "score",
      header: "RCA score",
      render: (candidate) => (
        <span className="cell-stack">
          <strong>{candidate.score}</strong>
          <Meter
            value={candidate.score}
            max={topScore}
            label={`${candidate.service} RCA score`}
            tone={candidates[0] === candidate ? "alert" : undefined}
          />
        </span>
      )
    },
    {
      key: "failure",
      header: "Failure",
      align: "right",
      render: (candidate) => candidate.failure_score ?? 0
    },
    {
      key: "temporal",
      header: "Timing",
      align: "right",
      render: (candidate) => candidate.temporal_score ?? 0
    },
    {
      key: "correlation",
      header: "Correlation",
      align: "right",
      render: (candidate) => candidate.correlation_score ?? 0
    },
    {
      key: "dependency",
      header: "Dependency",
      align: "right",
      render: (candidate) => candidate.dependency_score ?? 0
    }
  ];

  return (
    <DataTable
      caption="Root cause candidates ranked by RCA score"
      columns={columns}
      rows={candidates}
      rowKey={(candidate) => candidate.service}
      rowHref={(candidate) => hrefTo("services", candidate.service)}
      empty={
        <EmptyState
          title="No candidates"
          text="Candidates are ranked once failures are recorded."
        />
      }
    />
  );
}
