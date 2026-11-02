import { toneOf } from "../../lib/status";

// Status is always written out; the dot only reinforces it.
export default function StatusMark({ status, label }) {
  return (
    <span className="status" data-tone={toneOf(status)}>
      <span className="status__dot" aria-hidden="true" />
      <span>{label ?? String(status ?? "unknown")}</span>
    </span>
  );
}
