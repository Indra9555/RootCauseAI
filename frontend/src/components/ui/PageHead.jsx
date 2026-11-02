export default function PageHead({ title, subtitle, children }) {
  return (
    <header className="page-head">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-sub">{subtitle}</p> : null}
      </div>

      {children}
    </header>
  );
}
