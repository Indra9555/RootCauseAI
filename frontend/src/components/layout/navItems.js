import { hrefTo } from "../../hooks/useRoute";

export const NAV_ITEMS = [
  { key: "overview", label: "Overview", href: "#/" },
  { key: "services", label: "Services", href: hrefTo("services") },
  { key: "incidents", label: "Incidents", href: hrefTo("incidents") },
  { key: "logs", label: "Logs", href: hrefTo("logs") },
  { key: "analysis", label: "Analysis", href: hrefTo("analysis") }
];
