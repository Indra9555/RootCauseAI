export default function Button({
  variant = "default",
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const variantClass = variant === "primary" ? "btn--primary" : "";

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
