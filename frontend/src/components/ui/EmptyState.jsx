export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty">
      <p className="empty__title">{title}</p>
      {text ? <p className="empty__text">{text}</p> : null}
      {action || null}
    </div>
  );
}
