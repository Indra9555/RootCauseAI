import { useEffect, useRef } from "react";
import { API_URL } from "./api/client";
import useDashboardData from "./hooks/useDashboardData";
import useIncidentDetail from "./hooks/useIncidentDetail";
import useRoute from "./hooks/useRoute";
import useTheme from "./hooks/useTheme";
import Sidebar from "./components/layout/Sidebar";
import { NAV_ITEMS } from "./components/layout/navItems";
import Topbar from "./components/layout/Topbar";
import Button from "./components/ui/Button";
import EmptyState from "./components/ui/EmptyState";
import Skeleton from "./components/ui/Skeleton";
import OverviewPage from "./features/overview/OverviewPage";
import ServicesPage from "./features/services/ServicesPage";
import ServiceDetail from "./features/services/ServiceDetail";
import IncidentsPage from "./features/incidents/IncidentsPage";
import IncidentDetail from "./features/incidents/IncidentDetail";
import LogsPage from "./features/logs/LogsPage";
import AnalysisPage from "./features/analysis/AnalysisPage";

const SECTION_LABEL = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.key, item.label])
);

export default function App() {
  const route = useRoute();
  const { data, status, refreshing, refresh } = useDashboardData();
  const { theme, cycle } = useTheme();

  const incident = useIncidentDetail(
    route.page === "incidents" ? route.id : null,
    status.updatedAt
  );

  const mainRef = useRef(null);
  const firstRender = useRef(true);

  const section = SECTION_LABEL[route.page];

  // On navigation: update the tab title, reset scroll, and move focus to
  // the content so keyboard and screen-reader users start at the new page.
  useEffect(() => {
    const parts = [section || "Not found", route.id, "RootCauseAI"];
    document.title = parts.filter(Boolean).join(" · ");

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [section, route.id]);

  const neverConnected = status.loaded && !status.updatedAt;
  const staleConnection =
    status.loaded && !status.online && Boolean(status.updatedAt);

  function renderPage() {
    switch (route.page) {
      case "overview":
        return <OverviewPage data={data} />;

      case "services":
        return route.id ? (
          <ServiceDetail name={route.id} data={data} />
        ) : (
          <ServicesPage data={data} />
        );

      case "incidents":
        return route.id ? (
          <IncidentDetail
            id={route.id}
            state={incident}
            services={data.services.services}
          />
        ) : (
          <IncidentsPage incidents={data.incidents} />
        );

      case "logs":
        return <LogsPage logs={data.logs} />;

      case "analysis":
        return <AnalysisPage data={data} />;

      default:
        return (
          <EmptyState
            title="Page not found"
            text="That address does not exist."
            action={
              <a className="btn" href="#/">
                Back to overview
              </a>
            }
          />
        );
    }
  }

  let body;

  if (!status.loaded) {
    body = <Skeleton rows={10} />;
  } else if (neverConnected) {
    body = (
      <EmptyState
        title="Cannot reach the backend"
        text={`Expected at ${API_URL}. Start it with "uvicorn main:app --reload" in the backend folder.`}
        action={
          <Button onClick={refresh} disabled={refreshing}>
            {refreshing ? "Retrying" : "Retry"}
          </Button>
        }
      />
    );
  } else {
    body = renderPage();
  }

  return (
    <div className="app">
      <a
        className="skip-link"
        href="#/"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>

      <Sidebar
        page={route.page}
        activeIncidents={
          data.incidents.filter((item) => item.status === "ACTIVE").length
        }
      />

      <div className="main-col">
        <Topbar
          section={section || "Not found"}
          status={status}
          refreshing={refreshing}
          onRefresh={refresh}
          theme={theme}
          onTheme={cycle}
        />

        <main className="content" ref={mainRef} tabIndex={-1}>
          {staleConnection ? (
            <p className="banner" role="alert">
              <span>
                Connection lost. Showing data from the last successful update.
              </span>
            </p>
          ) : null}

          {body}
        </main>
      </div>
    </div>
  );
}
