export default function Meter({ value, max = 100, label, tone }) {
  const number = Number(value) || 0;
  const percent =
    max > 0 ? Math.min(100, Math.max(0, (number / max) * 100)) : 0;

  return (
    <span
      className="meter"
      role="meter"
      aria-label={label}
      aria-valuenow={number}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <span
        className="meter__fill"
        data-tone={tone}
        style={{ "--value": percent }}
      />
    </span>
  );
}
