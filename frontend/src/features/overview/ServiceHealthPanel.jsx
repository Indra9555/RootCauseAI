import Panel from "../../components/ui/Panel";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import Meter from "../../components/ui/Meter";
import StatusMark from "../../components/ui/StatusMark";
import { hrefTo } from "../../hooks/useRoute";

export default function ServiceHealthPanel({ services }) {
  const mostFailures = Math.max(
    1,
    ...services.map((service) => service.total_failures || 0)
  );

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
      key: "failures",
      header: "Failures",
      render: (service) => (
        <span className="cell-stack">
          <span>{service.total_failures}</span>
          <Meter
            value={service.total_failures}
            max={mostFailures}
            label={`${service.service} failures`}
          />
        </span>
      )
    }
  ];

  return (
    <Panel
      title="Service health"
      meta={`${services.length} services`}
      flush={services.length > 0}
    >
      <DataTable
        caption="Health of every service"
        columns={columns}
        rows={services}
        rowKey={(service) => service.service}
        rowHref={(service) => hrefTo("services", service.service)}
        empty={
          <EmptyState
            title="No services yet"
            text="Services are listed as soon as they send telemetry."
          />
        }
      />
    </Panel>
  );
}
