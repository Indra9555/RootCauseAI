import { useMemo } from "react";
import { hrefTo } from "../../hooks/useRoute";
import { toneOf } from "../../lib/status";
import EmptyState from "../../components/ui/EmptyState";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  edgePath,
  layoutGraph
} from "./layout";

const MAX_LABEL = 24;

function truncate(text) {
  return text.length > MAX_LABEL
    ? `${text.slice(0, MAX_LABEL - 1)}…`
    : text;
}

function healthOf(service) {
  if (service.critical_count > 0) {
    return "CRITICAL";
  }

  return service.total_failures > 0 ? "DEGRADED" : "HEALTHY";
}

export default function DependencyGraph({ graph }) {
  const services = graph.services;
  const dependencies = graph.dependencies;

  const layout = useMemo(
    () => layoutGraph(services, dependencies),
    [services, dependencies]
  );

  if (!services.length) {
    return (
      <EmptyState
        title="No dependency data yet"
        text="Services and their dependencies appear here once telemetry arrives."
      />
    );
  }

  return (
    <div className="graph" role="region" aria-label="Dependency graph" tabIndex={0}>
      <svg
        className="graph__svg"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width={layout.width}
        height={layout.height}
        role="group"
        aria-label={`${services.length} services, ${dependencies.length} dependencies. Arrows point from a service to what it depends on.`}
      >
        <defs>
          <marker
            id="graph-arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path className="graph__arrow" d="M0 0 L8 4 L0 8 Z" />
          </marker>
        </defs>

        {dependencies.map((edge) => {
          const from = layout.positions.get(edge.source);
          const to = layout.positions.get(edge.target);

          if (!from || !to) {
            return null;
          }

          return (
            <path
              key={`${edge.source}>${edge.target}`}
              className="graph__edge"
              d={edgePath(from, to)}
              markerEnd="url(#graph-arrow)"
            />
          );
        })}

        {services.map((service) => {
          const position = layout.positions.get(service.service);

          if (!position) {
            return null;
          }

          const health = healthOf(service);

          return (
            <a
              key={service.service}
              className="graph__node"
              href={hrefTo("services", service.service)}
              data-root={service.root_cause ? "true" : "false"}
              data-tone={toneOf(health)}
              transform={`translate(${position.x} ${position.y})`}
            >
              <title>
                {`${service.service}: ${health.toLowerCase()}, ${service.total_failures} failures`}
              </title>

              <rect
                className="graph__box"
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx="2"
              />

              <circle className="graph__dot" cx="14" cy="18" r="4" />

              <text className="graph__name" x="28" y="22">
                {truncate(service.service)}
              </text>

              <text className="graph__meta" x="14" y="40">
                {service.root_cause
                  ? `ROOT CAUSE · ${service.total_failures} FAILURES`
                  : `${health} · ${service.total_failures} FAILURES`}
              </text>
            </a>
          );
        })}
      </svg>
    </div>
  );
}
