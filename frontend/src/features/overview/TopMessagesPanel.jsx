import Panel from "../../components/ui/Panel";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";

const LIMIT = 5;

export default function TopMessagesPanel({ intelligence }) {
  const rows = Object.entries(intelligence?.message_frequency || {})
    .map(([message, count]) => ({ message, count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, LIMIT);

  const columns = [
    {
      key: "message",
      header: "Message",
      wrap: true,
      render: (row) => row.message
    },
    {
      key: "count",
      header: "Count",
      align: "right",
      render: (row) => row.count
    }
  ];

  return (
    <Panel title="Most frequent failures" flush={rows.length > 0}>
      <DataTable
        caption="Most frequent failure messages"
        columns={columns}
        rows={rows}
        rowKey={(row) => row.message}
        empty={
          <EmptyState
            title="No failures"
            text="Repeated failure messages are counted here."
          />
        }
      />
    </Panel>
  );
}
