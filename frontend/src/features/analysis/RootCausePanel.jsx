import Panel from "../../components/ui/Panel";
import Tag from "../../components/ui/Tag";
import EmptyState from "../../components/ui/EmptyState";
import BulletList from "../../components/ui/BulletList";
import { hrefTo } from "../../hooks/useRoute";
import { rootCauseOf } from "../../lib/status";

export default function RootCausePanel({ analysis, detailed = false }) {
  const rootCause = rootCauseOf(analysis);

  return (
    <Panel
      title="Primary suspect"
      meta={rootCause ? `${rootCause.confidence} confidence` : null}
    >
      {!rootCause ? (
        <EmptyState
          title="No failures recorded"
          text="A root cause appears here once ERROR or CRITICAL logs arrive."
        />
      ) : (
        <div className="stack">
          <div>
            <p className="label">Most likely root cause</p>
            <p className="display">{rootCause.root_cause}</p>

            <p className="subhead">
              <Tag strong>RCA score {rootCause.rca_score}</Tag>{" "}
              <Tag>{rootCause.confidence} confidence</Tag>
            </p>
          </div>

          {rootCause.reason ? <p>{rootCause.reason}</p> : null}

          <div>
            <h3 className="label subhead">Evidence</h3>
            <BulletList items={rootCause.evidence} />
          </div>

          <div>
            <h3 className="label subhead">Recommended actions</h3>
            <BulletList items={rootCause.recommendations} ordered />
          </div>

          {!detailed ? (
            <a className="cell-link" href={hrefTo("analysis")}>
              Open full analysis
            </a>
          ) : null}
        </div>
      )}
    </Panel>
  );
}
