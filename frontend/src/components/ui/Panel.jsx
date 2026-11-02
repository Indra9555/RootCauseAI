import { useId } from "react";

export default function Panel({
  title,
  meta,
  actions,
  flush = false,
  className = "",
  children
}) {
  const headingId = useId();

  return (
    <section
      className={`panel ${className}`.trim()}
      aria-labelledby={headingId}
    >
      <header className="panel__head">
        <h2 id={headingId} className="label">
          {title}
        </h2>

        {meta ? <span className="label">{meta}</span> : null}

        {actions ? (
          <div className="panel__actions">{actions}</div>
        ) : null}
      </header>

      <div
        className={
          flush ? "panel__body panel__body--flush" : "panel__body"
        }
      >
        {children}
      </div>
    </section>
  );
}
