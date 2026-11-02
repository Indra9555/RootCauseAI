import { useEffect, useMemo, useState } from "react";

export function parseHash(hash) {
  const parts = String(hash || "")
    .replace(/^#\/?/, "")
    .split("/")
    .filter(Boolean)
    .map(decodeURIComponent);

  return {
    page: parts[0] || "overview",
    id: parts[1] || null
  };
}

export function hrefTo(page, id) {
  const path = [page, id]
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return `#/${path}`;
}

export default function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);

    window.addEventListener("hashchange", onChange);

    return () => {
      window.removeEventListener("hashchange", onChange);
    };
  }, []);

  return useMemo(() => parseHash(hash), [hash]);
}
