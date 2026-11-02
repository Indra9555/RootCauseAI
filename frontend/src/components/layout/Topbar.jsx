import { POLL_INTERVAL_MS } from "../../hooks/useDashboardData";
import { formatTime } from "../../lib/format";
import Button from "../ui/Button";

const THEME_LABEL = {
  auto: "Theme: auto",
  light: "Theme: light",
  dark: "Theme: dark"
};

export default function Topbar({
  section,
  status,
  refreshing,
  onRefresh,
  theme,
  onTheme
}) {
  const seconds = POLL_INTERVAL_MS / 1000;

  return (
    <header className="topbar">
      <p className="label label--ink">{section}</p>

      <div className="topbar__group">
        <p
          className="live label"
          data-online={status.online ? "true" : "false"}
        >
          <span className="live__dot" aria-hidden="true" />
          <span>
            {status.online ? `Live · ${seconds}s` : "Offline"}
          </span>

          {status.updatedAt ? (
            <span>· Updated {formatTime(status.updatedAt)}</span>
          ) : null}
        </p>

        <Button onClick={onTheme}>{THEME_LABEL[theme]}</Button>

        <Button onClick={onRefresh} disabled={refreshing}>
          {refreshing ? "Refreshing" : "Refresh"}
        </Button>
      </div>
    </header>
  );
}
