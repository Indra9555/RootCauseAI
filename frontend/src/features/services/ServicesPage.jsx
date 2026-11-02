import PageHead from "../../components/ui/PageHead";
import Panel from "../../components/ui/Panel";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import StatusMark from "../../components/ui/StatusMark";
import DependencyGraph from "../graph/DependencyGraph";
import { hrefTo } from "../../hooks/useRoute";
import { formatDateTime } from "../../lib/format";

export default function ServicesPage({ data }) {
  const { services, graph } = data;

  const columns = [
    {
      key: "service",
      header: "Service",
      mono: true,
      render: (service) => service.service
    },
    {
      key: "health",
      header: "Health",
      render: (service) => <StatusMark status={service.health} />
    },
    {
      key: "errors",
      header: "Errors",
      align: "right",
      render: (service) => service.error_count
    },
    {
      key: "critical",
      header: "Critical",
      align: "right",
      render: (service) => service.critical_count
    },
    {
      key: "last",
      header: "Last failure",
      mono: true,
      render: (service) => formatDateTime(service.last_failure)
    },
    {
      key: "depends",
      header: "Depends on",
      mono: true,
      render: (service) =>
        service.depends_on?.length ? service.depends_on.join(", ") : "—"
    },
    {
      key: "dependents",
      header: "Dependents",
      mono: true,
      render: (service) =>
        service.dependents?.length ? service.dependents.join(", ") : "—"
    }
  ];

  return (
    <>
      <PageHead
        title="Services"
        subtitle="Health, failures and dependencies for every reporting service."
      />

      <div className="stack">
        <Panel
          title="Dependency graph"
          meta="Arrows point to what a service depends on"
          flush
        >
          <DependencyGraph graph={graph} />
        </Panel>

        <Panel
          title="All services"
          meta={`${services.services.length} total`}
          flush={services.services.length > 0}
        >
          <DataTable
            caption="All services with health and dependencies"
            columns={columns}
            rows={services.services}
            rowKey={(service) => service.service}
            rowHref={(service) => hrefTo("services", service.service)}
            empty={
              <EmptyState
                title="No services yet"
                text="Send telemetry to POST /api/telemetry/logs and services will be listed here."
              />
            }
          />
        </Panel>
      </div>
    </>
  );
}
