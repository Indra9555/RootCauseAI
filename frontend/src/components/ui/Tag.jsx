export default function Tag({ children, strong = false }) {
  return (
    <span className={strong ? "tag tag--ink" : "tag"}>
      {children}
    </span>
  );
}
