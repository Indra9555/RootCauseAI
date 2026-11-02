import EmptyState from "./EmptyState";

/**
 * columns: [{ key, header, render(row), align?: "right", mono?, wrap? }]
 * rowHref(row) turns the first cell into a real link (keyboard friendly).
 */
export default function DataTable({
  caption,
  columns,
  rows,
  rowKey,
  rowHref,
  empty
}) {
  if (!rows.length) {
    return (
      empty || (
        <EmptyState title="No data" text="Nothing to show yet." />
      )
    );
  }

  const cellClass = (column) =>
    [
      column.align === "right" ? "is-num" : "",
      column.mono ? "is-mono" : "",
      column.wrap ? "is-wrap" : ""
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div
      className="table-wrap"
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className="table">
        <caption className="sr-only">{caption}</caption>

        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={column.align === "right" ? "is-num" : ""}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column, index) => {
                const content = column.render(row);

                return (
                  <td key={column.key} className={cellClass(column)}>
                    {index === 0 && rowHref ? (
                      <a className="cell-link" href={rowHref(row)}>
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
