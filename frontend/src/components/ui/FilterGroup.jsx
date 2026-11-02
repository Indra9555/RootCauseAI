import Button from "./Button";

// Single-choice filter rendered as a group of toggle buttons.
export default function FilterGroup({
  label,
  options,
  value,
  onChange
}) {
  return (
    <div className="btn-group" role="group" aria-label={label}>
      {options.map((option) => (
        <Button
          key={option.value}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
