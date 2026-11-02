export default function Skeleton({ rows = 6 }) {
  return (
    <div className="skeleton" role="status" aria-busy="true">
      <span className="sr-only">Loading</span>

      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton__row" key={index} />
      ))}
    </div>
  );
}
