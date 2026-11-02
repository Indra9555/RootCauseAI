export default function BulletList({ items, ordered = false }) {
  if (!items?.length) {
    return <p className="muted">None recorded.</p>;
  }

  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag className={ordered ? "steps" : "bullets"}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>
          <span>{item}</span>
        </li>
      ))}
    </ListTag>
  );
}
