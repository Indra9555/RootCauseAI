import { API_URL } from "../../api/client";
import { NAV_ITEMS } from "./navItems";

export default function Sidebar({ page, activeIncidents }) {
  return (
    <aside className="sidebar">
      <a className="sidebar__brand" href="#/">
        RootCauseAI
      </a>

      <nav className="sidebar__nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.key}
            className="nav-link"
            href={item.href}
            aria-current={page === item.key ? "page" : undefined}
          >
            <span>{item.label}</span>

            {item.key === "incidents" && activeIncidents > 0 ? (
              <span
                className="nav-link__count"
                aria-label={`${activeIncidents} active`}
              >
                {activeIncidents}
              </span>
            ) : null}
          </a>
        ))}
      </nav>

      <div className="sidebar__foot">
        <p className="label">API</p>
        <p className="mono muted">{API_URL}</p>
      </div>
    </aside>
  );
}
