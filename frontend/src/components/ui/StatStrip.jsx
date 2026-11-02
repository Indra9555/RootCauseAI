export default function StatStrip({ items }) {
  return (
    <dl
      className="stats"
      style={{ "--cols": Math.min(items.length, 6) }}
    >
      {items.map((item) => (
        <div className="stats__cell" key={item.label}>
          <dt className="label">{item.label}</dt>
          <dd className="stats__value">{item.value}</dd>
          {item.hint ? (
            <dd className="stats__hint">{item.hint}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
