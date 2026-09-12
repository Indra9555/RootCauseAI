import React, { useMemo, useState } from "react";
import "./DependencyGraph.css";

const NODE_WIDTH = 210;
const NODE_HEIGHT = 116;
const COLUMN_GAP = 250;
const ROW_GAP = 28;
const PADDING = 55;

function getHealthClass(service) {
  if (service.root_cause) return "root";
  if (service.incident_active) return "affected";
  if (service.critical_count > 0) return "critical";
  if (service.error_count > 0) return "degraded";
  return "healthy";
}

function getHealthLabel(service) {
  if (service.root_cause) return "ROOT CAUSE";
  if (service.incident_active) return "AFFECTED";
  if (service.critical_count > 0) return "CRITICAL";
  if (service.error_count > 0) return "DEGRADED";
  return "HEALTHY";
}

function createFallbackService(name) {
  return {
    service: name,
    error_count: 0,
    critical_count: 0,
    total_failures: 0,
    rca_score: 0,
    dependency_score: 0,
    root_cause: false,
    incident_active: false,
    depends_on: [],
    dependents: []
  };
}

function buildGraphLayout(
  services,
  dependencies
) {
  const serviceMap = new Map(
    services.map((service) => [
      service.service,
      service
    ])
  );

  dependencies.forEach((edge) => {
    if (!serviceMap.has(edge.source)) {
      serviceMap.set(
        edge.source,
        createFallbackService(edge.source)
      );
    }

    if (!serviceMap.has(edge.target)) {
      serviceMap.set(
        edge.target,
        createFallbackService(edge.target)
      );
    }
  });

  const allServices =
    Array.from(serviceMap.values());

  const dependencyTargets =
    new Set(
      dependencies.map(
        (edge) => edge.target
      )
    );

  const dependencySources =
    new Set(
      dependencies.map(
        (edge) => edge.source
      )
    );

  const rightColumn =
    allServices
      .filter(
        (service) =>
          dependencyTargets.has(
            service.service
          ) &&
          !dependencySources.has(
            service.service
          )
      )
      .sort((a, b) =>
        a.service.localeCompare(
          b.service
        )
      );

  const leftConnected =
    allServices
      .filter((service) =>
        dependencySources.has(
          service.service
        )
      )
      .sort((a, b) => {
        const aPriority =
          a.root_cause
            ? 0
            : a.incident_active
              ? 1
              : 2;

        const bPriority =
          b.root_cause
            ? 0
            : b.incident_active
              ? 1
              : 2;

        if (
          aPriority !==
          bPriority
        ) {
          return (
            aPriority -
            bPriority
          );
        }

        return a.service.localeCompare(
          b.service
        );
      });

  const isolated =
    allServices
      .filter(
        (service) =>
          !dependencySources.has(
            service.service
          ) &&
          !dependencyTargets.has(
            service.service
          )
      )
      .sort((a, b) => {
        const aPriority =
          a.root_cause
            ? 0
            : a.incident_active
              ? 1
              : a.error_count > 0
                ? 2
                : 3;

        const bPriority =
          b.root_cause
            ? 0
            : b.incident_active
              ? 1
              : b.error_count > 0
                ? 2
                : 3;

        if (
          aPriority !==
          bPriority
        ) {
          return (
            aPriority -
            bPriority
          );
        }

        return a.service.localeCompare(
          b.service
        );
      });

  const positions =
    new Map();

  const connectedRows =
    Math.max(
      leftConnected.length,
      rightColumn.length,
      1
    );

  leftConnected.forEach(
    (service, index) => {
      positions.set(
        service.service,
        {
          x: PADDING,
          y:
            PADDING +
            index *
              (NODE_HEIGHT +
                ROW_GAP)
        }
      );
    }
  );

  const rightHeight =
    rightColumn.length *
      NODE_HEIGHT +
    Math.max(
      rightColumn.length - 1,
      0
    ) *
      ROW_GAP;

  const leftHeight =
    connectedRows *
      NODE_HEIGHT +
    Math.max(
      connectedRows - 1,
      0
    ) *
      ROW_GAP;

  const rightStart =
    PADDING +
    Math.max(
      (leftHeight -
        rightHeight) /
        2,
      0
    );

  rightColumn.forEach(
    (service, index) => {
      positions.set(
        service.service,
        {
          x:
            PADDING +
            NODE_WIDTH +
            COLUMN_GAP,
          y:
            rightStart +
            index *
              (NODE_HEIGHT +
                ROW_GAP)
        }
      );
    }
  );

  const isolatedStart =
    PADDING +
    Math.max(
      leftHeight,
      rightHeight
    ) +
    85;

  isolated.forEach(
    (service, index) => {
      const columns = 3;

      const column =
        index % columns;

      const row =
        Math.floor(
          index / columns
        );

      positions.set(
        service.service,
        {
          x:
            PADDING +
            column *
              (NODE_WIDTH +
                35),
          y:
            isolatedStart +
            row *
              (NODE_HEIGHT +
                ROW_GAP)
        }
      );
    }
  );

  const isolatedRows =
    Math.ceil(
      isolated.length / 3
    );

  const graphHeight =
    isolated.length > 0
      ? isolatedStart +
        isolatedRows *
          NODE_HEIGHT +
        Math.max(
          isolatedRows - 1,
          0
        ) *
          ROW_GAP +
        PADDING
      : PADDING +
        Math.max(
          leftHeight,
          rightHeight
        ) +
        PADDING;

  const graphWidth =
    PADDING * 2 +
    NODE_WIDTH * 2 +
    COLUMN_GAP;

  return {
    services: allServices,
    positions,
    width: graphWidth,
    height: graphHeight,
    connectedServices:
      leftConnected,
    dependencyTargets:
      rightColumn,
    isolatedServices:
      isolated
  };
}

function DependencyEdge({
  edge,
  positions,
  highlighted,
  dimmed
}) {
  const source =
    positions.get(
      edge.source
    );

  const target =
    positions.get(
      edge.target
    );

  if (!source || !target) {
    return null;
  }

  const startX =
    source.x + NODE_WIDTH;

  const startY =
    source.y +
    NODE_HEIGHT / 2;

  const endX =
    target.x;

  const endY =
    target.y +
    NODE_HEIGHT / 2;

  const distance =
    Math.max(
      (endX - startX) * 0.42,
      60
    );

  const controlX1 =
    startX + distance;

  const controlX2 =
    endX - distance;

  const path = `
    M ${startX} ${startY}
    C ${controlX1} ${startY},
      ${controlX2} ${endY},
      ${endX} ${endY}
  `;

  return (
    <g
      className={[
        "dependency-edge",
        highlighted
          ? "edge-highlighted"
          : "",
        dimmed
          ? "edge-dimmed"
          : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <path
        d={path}
        className="dependency-edge-hitbox"
      />

      <path
        d={path}
        className="dependency-edge-line"
      />

      <polygon
        points={`
          ${endX},${endY}
          ${endX - 10},${endY - 6}
          ${endX - 10},${endY + 6}
        `}
        className="dependency-edge-arrow"
      />
    </g>
  );
}

function DependencyNode({
  service,
  position,
  onClick,
  onHover,
  dimmed,
  highlighted,
  selected
}) {
  const healthClass =
    getHealthClass(service);

  const healthLabel =
    getHealthLabel(service);

  return (
    <foreignObject
      x={position.x}
      y={position.y}
      width={NODE_WIDTH}
      height={NODE_HEIGHT}
      className="dependency-node-wrapper"
    >
      <button
        type="button"
        className={[
          "dependency-node",
          `dependency-node-${healthClass}`,
          dimmed
            ? "dependency-node-dimmed"
            : "",
          highlighted
            ? "dependency-node-highlighted"
            : "",
          selected
            ? "dependency-node-selected"
            : ""
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() =>
          onClick?.(
            service.service
          )
        }
        onMouseEnter={() =>
          onHover?.(
            service.service
          )
        }
        onMouseLeave={() =>
          onHover?.(null)
        }
        onFocus={() =>
          onHover?.(
            service.service
          )
        }
        onBlur={() =>
          onHover?.(null)
        }
        title={`Investigate ${service.service}`}
      >
        <div className="dependency-node-top">
          <span className="dependency-node-status">
            <span className="dependency-status-dot" />
            {healthLabel}
          </span>

          {service.root_cause && (
            <span className="dependency-node-crown">
              ★
            </span>
          )}
        </div>

        <div className="dependency-node-name">
          {service.service}
        </div>

        <div className="dependency-node-metrics">
          <span>
            <strong>
              {service.total_failures ||
                0}
            </strong>
            failures
          </span>

          <span>
            <strong>
              {service.rca_score ||
                0}
            </strong>
            RCA
          </span>
        </div>

        {service.depends_on?.length >
          0 && (
          <div className="dependency-node-dependency">
            depends on{" "}
            {service.depends_on.length}
          </div>
        )}

        {selected && (
          <div className="dependency-node-selected-label">
            SELECTED
          </div>
        )}
      </button>
    </foreignObject>
  );
}

function analyzeRcaRelationship(
  serviceName,
  rootCause,
  dependencies
) {
  if (!serviceName) {
    return null;
  }

  if (!rootCause) {
    return {
      type: "unknown",
      label: "RCA unavailable",
      description:
        "No primary root cause has been identified by the current analysis.",
      path: []
    };
  }

  if (serviceName === rootCause) {
    return {
      type: "root",
      label: "PRIMARY ROOT CAUSE",
      description:
        "This service is currently ranked as the primary root cause by the RCA engine.",
      path: [rootCause]
    };
  }

  /*
   * Dependency direction:
   *
   * source -> target
   *
   * means:
   * source depends on target.
   *
   * To determine whether the investigated
   * service is connected to the RCA root,
   * walk from the root through its
   * dependency relationships.
   */

  const queue = [
    {
      service: rootCause,
      path: [rootCause]
    }
  ];

  const visited =
    new Set([rootCause]);

  while (queue.length > 0) {
    const current =
      queue.shift();

    const nextEdges =
      dependencies.filter(
        (edge) =>
          edge.source ===
          current.service
      );

    for (const edge of nextEdges) {
      const next =
        edge.target;

      if (
        visited.has(next)
      ) {
        continue;
      }

      const nextPath = [
        ...current.path,
        next
      ];

      if (
        next === serviceName
      ) {
        return {
          type: "connected",
          label: "RCA PATH CONNECTED",
          description:
            "This service is connected to the current root cause through the monitored dependency graph.",
          path: nextPath
        };
      }

      visited.add(next);

      queue.push({
        service: next,
        path: nextPath
      });
    }
  }

  return {
    type: "unconnected",
    label: "NO DEPENDENCY PATH",
    description:
      "No direct or indirect dependency path connects this service to the current primary root cause.",
    path: []
  };
}

function calculateImpact(
  serviceName,
  services,
  dependencies
) {
  if (!serviceName) {
    return null;
  }

  const normalize = (value) =>
    String(value || "").trim();

  const selectedName =
    normalize(serviceName);

  const serviceMap = new Map(
    services.map((service) => [
      normalize(service.service),
      service
    ])
  );

  const dependentMap = new Map();

  dependencies.forEach((edge) => {
    const source =
      normalize(edge.source);

    const target =
      normalize(edge.target);

    if (!source || !target) {
      return;
    }

    if (
      !dependentMap.has(target)
    ) {
      dependentMap.set(
        target,
        new Set()
      );
    }

    dependentMap
      .get(target)
      .add(source);
  });

  services.forEach((service) => {
    const serviceNameNormalized =
      normalize(service.service);

    const backendDependents =
      Array.isArray(
        service.dependents
      )
        ? service.dependents
        : [];

    if (
      !dependentMap.has(
        serviceNameNormalized
      )
    ) {
      dependentMap.set(
        serviceNameNormalized,
        new Set()
      );
    }

    backendDependents.forEach(
      (dependent) => {
        const normalized =
          normalize(dependent);

        if (normalized) {
          dependentMap
            .get(
              serviceNameNormalized
            )
            .add(normalized);
        }
      }
    );
  });

  const directDependents =
    Array.from(
      dependentMap.get(
        selectedName
      ) || []
    );

  const affected =
    new Set();

  const queue = [
    ...directDependents
  ];

  while (queue.length > 0) {
    const current =
      normalize(queue.shift());

    if (
      !current ||
      affected.has(current)
    ) {
      continue;
    }

    affected.add(current);

    const nextDependents =
      dependentMap.get(
        current
      ) || new Set();

    nextDependents.forEach(
      (dependent) => {
        if (
          !affected.has(
            dependent
          )
        ) {
          queue.push(
            dependent
          );
        }
      }
    );
  }

  const affectedServices =
    Array.from(affected)
      .map(
        (name) =>
          serviceMap.get(name) ||
          createFallbackService(
            name
          )
      )
      .sort((a, b) => {
        if (
          a.root_cause !==
          b.root_cause
        ) {
          return a.root_cause
            ? -1
            : 1;
        }

        if (
          a.incident_active !==
          b.incident_active
        ) {
          return a.incident_active
            ? -1
            : 1;
        }

        if (
          (a.critical_count || 0) !==
          (b.critical_count || 0)
        ) {
          return (
            (b.critical_count || 0) -
            (a.critical_count || 0)
          );
        }

        return (
          (b.rca_score || 0) -
          (a.rca_score || 0)
        );
      });

  const selectedService =
    serviceMap.get(
      selectedName
    ) ||
    createFallbackService(
      selectedName
    );

  const hasRootCause =
    affectedServices.some(
      (service) =>
        service.root_cause
    );

  const hasActiveIncident =
    affectedServices.some(
      (service) =>
        service.incident_active
    );

  const hasCritical =
    affectedServices.some(
      (service) =>
        (service.critical_count || 0) >
        0
    );

  let impactLevel = "LOW";

  if (hasRootCause) {
    impactLevel = "CRITICAL";
  } else if (
    hasActiveIncident
  ) {
    impactLevel = "HIGH";
  } else if (
    hasCritical
  ) {
    impactLevel = "HIGH";
  } else if (
    affectedServices.length > 0
  ) {
    impactLevel = "MODERATE";
  }

  return {
    selectedService,
    directDependents,
    affectedServices,
    impactRadius:
      affectedServices.length,
    impactLevel
  };
}

export default function DependencyGraph({
  data,
  onServiceClick
}) {
  const [hoveredService, setHoveredService] =
    useState(null);

  const [selectedService, setSelectedService] =
    useState(null);

  const services =
    data?.services || [];

  const dependencies =
    data?.dependencies || [];

  const rootCause =
    data?.root_cause || null;

  const layout = useMemo(
    () =>
      buildGraphLayout(
        services,
        dependencies
      ),
    [
      services,
      dependencies
    ]
  );

  /*
   * Hover is temporary.
   *
   * Selection is persistent.
   *
   * When the mouse is over a service,
   * highlight that service temporarily.
   *
   * When the mouse leaves, the selected
   * service remains highlighted.
   */
  const focusService =
    hoveredService ||
    selectedService;

  const connectedServices =
    useMemo(() => {
      if (!focusService) {
        return new Set();
      }

      const connected =
        new Set([
          focusService
        ]);

      dependencies.forEach(
        (edge) => {
          if (
            edge.source ===
            focusService
          ) {
            connected.add(
              edge.target
            );
          }

          if (
            edge.target ===
            focusService
          ) {
            connected.add(
              edge.source
            );
          }
        }
      );

      return connected;
    }, [
      focusService,
      dependencies
    ]);

  const highlightedEdges =
    useMemo(() => {
      const highlighted =
        new Set();

      if (!rootCause) {
        return highlighted;
      }

      const visited =
        new Set();

      function walk(
        serviceName
      ) {
        if (
          visited.has(
            serviceName
          )
        ) {
          return;
        }

        visited.add(
          serviceName
        );

        dependencies.forEach(
          (edge) => {
            if (
              edge.source ===
              serviceName
            ) {
              const key =
                `${edge.source}->${edge.target}`;

              highlighted.add(
                key
              );

              walk(
                edge.target
              );
            }
          }
        );
      }

      walk(rootCause);

      return highlighted;
    }, [
      dependencies,
      rootCause
    ]);

  /*
   * IMPORTANT:
   *
   * Impact analysis uses SELECTED service,
   * not hovered service.
   *
   * Therefore hovering another node
   * never changes the investigation panel.
   */
  const impactTarget =
  selectedService ||
  hoveredService;

  const rcaRelationship =
  useMemo(
    () =>
      analyzeRcaRelationship(
        impactTarget,
        rootCause,
        dependencies
      ),
    [
      impactTarget,
      rootCause,
      dependencies
    ]
  );

const impactAnalysis =
  useMemo(
    () =>
      calculateImpact(
        impactTarget,
        services,
        dependencies
      ),
    [
      impactTarget,
      services,
      dependencies
    ]
  );

  const handleNodeClick =
  (serviceName) => {
    setSelectedService(
      serviceName
    );
  };

  const clearSelection =
    () => {
      setSelectedService(null);
      setHoveredService(null);
    };

  if (!services.length) {
    return (
      <div className="dependency-graph-empty">
        <div className="dependency-empty-icon">
          ⌁
        </div>

        <h3>
          No dependency data yet
        </h3>

        <p>
          Dependency relationships will
          appear here once services and
          telemetry are available.
        </p>
      </div>
    );
  }

  const isInteractive =
    focusService !== null;

  return (
    <div className="dependency-graph">
      <div className="dependency-graph-header">
        <div>
          <span className="dependency-graph-eyebrow">
            SYSTEM TOPOLOGY
          </span>

          <h2>
            Service Dependency Map
          </h2>

          <p>
            Explore how monitored services
            depend on one another and follow
            the current RCA path.
          </p>
        </div>

        <div className="dependency-graph-summary">
          <div className="dependency-summary-item">
            <strong>
              {layout.services.length}
            </strong>

            <span>
              services
            </span>
          </div>

          <div className="dependency-summary-item">
            <strong>
              {dependencies.length}
            </strong>

            <span>
              dependencies
            </span>
          </div>

          {rootCause && (
            <div className="dependency-summary-root">
              <span>
                PRIMARY SUSPECT
              </span>

              <strong>
                {rootCause}
              </strong>
            </div>
          )}
        </div>
      </div>

      <div className="dependency-graph-legend">
        <span>
          <i className="legend-dot legend-healthy" />
          Healthy
        </span>

        <span>
          <i className="legend-dot legend-degraded" />
          Degraded
        </span>

        <span>
          <i className="legend-dot legend-affected" />
          Affected
        </span>

        <span>
          <i className="legend-dot legend-root" />
          Root cause
        </span>

        <span className="legend-direction">
          → Depends on
        </span>
      </div>

      {selectedService && (
        <div className="dependency-selection-bar">
          <div>
            <span>
              INVESTIGATING
            </span>

            <strong>
              {selectedService}
            </strong>
          </div>

          <button
            type="button"
            onClick={
              clearSelection
            }
          >
            Clear selection
          </button>
        </div>
      )}

      <div
        className={[
          "dependency-graph-canvas",
          isInteractive
            ? "dependency-graph-interacting"
            : ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <svg
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          role="img"
          aria-label="System service dependency graph"
        >
          <defs>
            <pattern
              id="dependency-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                className="dependency-grid-line"
                fill="none"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#dependency-grid)"
            className="dependency-grid-background"
          />

          {layout.connectedServices
            .length > 0 && (
            <>
              <text
                x={PADDING}
                y={27}
                className="dependency-column-label"
              >
                SERVICES
              </text>

              {layout.dependencyTargets
                .length > 0 && (
                <text
                  x={
                    PADDING +
                    NODE_WIDTH +
                    COLUMN_GAP
                  }
                  y={27}
                  className="dependency-column-label"
                >
                  DEPENDENCIES
                </text>
              )}
            </>
          )}

          <g className="dependency-edges">
            {dependencies.map(
              (edge) => {
                const key =
                  `${edge.source}->${edge.target}`;

                const edgeConnected =
                  focusService &&
                  (
                    edge.source ===
                      focusService ||
                    edge.target ===
                      focusService
                  );

                const edgeDimmed =
                  isInteractive &&
                  !edgeConnected;

                return (
                  <DependencyEdge
                    key={key}
                    edge={edge}
                    positions={
                      layout.positions
                    }
                    highlighted={
                      edgeConnected ||
                      highlightedEdges.has(
                        key
                      )
                    }
                    dimmed={
                      edgeDimmed
                    }
                  />
                );
              }
            )}
          </g>

          <g className="dependency-nodes">
            {layout.services.map(
              (service) => {
                const position =
                  layout.positions.get(
                    service.service
                  );

                if (!position) {
                  return null;
                }

                const nodeHighlighted =
                  focusService &&
                  connectedServices.has(
                    service.service
                  );

                const nodeDimmed =
                  isInteractive &&
                  !connectedServices.has(
                    service.service
                  );

                const nodeSelected =
                  selectedService ===
                  service.service;

                return (
                  <DependencyNode
                    key={
                      service.service
                    }
                    service={
                      service
                    }
                    position={
                      position
                    }
                    onClick={
                      handleNodeClick
                    }
                    onHover={
                      setHoveredService
                    }
                    dimmed={
                      nodeDimmed
                    }
                    highlighted={
                      nodeHighlighted
                    }
                    selected={
                      nodeSelected
                    }
                  />
                );
              }
            )}
          </g>

          {layout.isolatedServices
            .length > 0 && (
            <text
              x={PADDING}
              y={
                Math.min(
                  ...layout.isolatedServices.map(
                    (service) =>
                      layout.positions.get(
                        service.service
                      )?.y || 0
                  )
                ) - 22
              }
              className="dependency-column-label"
            >
              OTHER MONITORED SERVICES
            </text>
          )}
        </svg>
      </div>

      {impactAnalysis && (
        <div className="dependency-impact-panel">
          <div className="dependency-impact-header">
            <div>
              <span className="dependency-impact-eyebrow">
                DEPENDENCY IMPACT ANALYSIS
              </span>

              <h3>
                Potential impact of{" "}
                <strong>
                  {
                    impactAnalysis
                      .selectedService
                      .service
                  }
                </strong>
              </h3>

              <p>
                Services that depend directly
                or indirectly on this service.
              </p>
            </div>

            <div className="dependency-impact-actions">
              <div
                className={[
                  "dependency-impact-level",
                  `impact-${impactAnalysis.impactLevel.toLowerCase()}`
                ].join(" ")}
              >
                {impactAnalysis.impactLevel}
              </div>

              <button
                type="button"
                className="dependency-impact-clear"
                onClick={
                  clearSelection
                }
              >
                Clear
              </button>
            </div>
          </div>

          <div className="dependency-impact-metrics">
            <div className="dependency-impact-metric">
              <span>
                IMPACT RADIUS
              </span>

              <strong>
                {
                  impactAnalysis
                    .impactRadius
                }
              </strong>

              <small>
                potentially affected
              </small>
            </div>

            <div className="dependency-impact-metric">
              <span>
                DIRECT DEPENDENTS
              </span>

              <strong>
                {
                  impactAnalysis
                    .directDependents
                    .length
                }
              </strong>

              <small>
                immediate relationships
              </small>
            </div>

            <div className="dependency-impact-metric">
              <span>
                ACTIVE IMPACT
              </span>

              <strong>
                {
                  impactAnalysis
                    .affectedServices
                    .filter(
                      (service) =>
                        service.incident_active
                    )
                    .length
                }
              </strong>

              <small>
                affected services
              </small>
            </div>
          </div>

          {impactAnalysis
            .affectedServices
            .length > 0 ? (
            <div className="dependency-impact-services">
              <div className="dependency-impact-subheader">
                POTENTIALLY AFFECTED SERVICES
              </div>

              <div className="dependency-impact-service-list">
                {
                  impactAnalysis
                    .affectedServices
                    .map(
                      (service) => {
                        const healthClass =
                          getHealthClass(
                            service
                          );

                        return (
                          <button
                            type="button"
                            key={
                              service.service
                            }
                            className={[
                              "dependency-impact-service",
                              `impact-service-${healthClass}`
                            ].join(" ")}
                            onClick={() =>
                              handleNodeClick(
                                service.service
                              )
                            }
                          >
                            <div className="dependency-impact-service-main">
                              <span className="dependency-impact-status-dot" />

                              <span className="dependency-impact-service-name">
                                {
                                  service.service
                                }
                              </span>

                              {service.root_cause && (
                                <span className="dependency-impact-root-badge">
                                  ROOT CAUSE
                                </span>
                              )}

                              {service.incident_active && (
                                <span className="dependency-impact-active-badge">
                                  ACTIVE
                                </span>
                              )}
                            </div>

                            <div className="dependency-impact-service-stats">
                              <span>
                                <strong>
                                  {
                                    service.total_failures ||
                                    0
                                  }
                                </strong>
                                failures
                              </span>

                              <span>
                                <strong>
                                  {
                                    service.rca_score ||
                                    0
                                  }
                                </strong>
                                RCA
                              </span>
                            </div>
                          </button>
                        );
                      }
                    )
                }
              </div>
            </div>
          ) : (
            <div className="dependency-impact-empty">
              <span>
                No downstream impact detected
              </span>

              <small>
                This service currently has no
                monitored services that depend
                on it.
              </small>
            </div>
          )}

          <div className="dependency-impact-note">
            <span>
              ⓘ
            </span>

            <p>
              Impact radius represents monitored
              dependency relationships. It indicates
              potential propagation, not confirmed
              failure causality.
            </p>
          </div>
        </div>
      )}

      {impactAnalysis &&
  rcaRelationship && (
    <div className="dependency-rca-inspector">
      <div className="dependency-rca-header">
        <div>
          <span className="dependency-rca-eyebrow">
            RCA PATH INSPECTOR
          </span>

          <h3>
            Root-cause relationship
          </h3>

          <p>
            How the investigated service
            relates to the current RCA result.
          </p>
        </div>

        <div
          className={[
            "dependency-rca-status",
            `rca-status-${rcaRelationship.type}`
          ].join(" ")}
        >
          {rcaRelationship.label}
        </div>
      </div>

      <div className="dependency-rca-grid">
        <div className="dependency-rca-card">
          <span>
            CURRENT PRIMARY SUSPECT
          </span>

          <strong>
            {rootCause || "Not identified"}
          </strong>
        </div>

        <div className="dependency-rca-card">
          <span>
            INVESTIGATED SERVICE
          </span>

          <strong>
            {impactAnalysis.selectedService.service}
          </strong>
        </div>

        <div className="dependency-rca-card">
          <span>
            RCA SCORE
          </span>

          <strong>
            {impactAnalysis.selectedService.rca_score || 0}
          </strong>
        </div>

        <div className="dependency-rca-card">
          <span>
            DEPENDENCY SCORE
          </span>

          <strong>
            {
              impactAnalysis
                .selectedService
                .dependency_score || 0
            }
          </strong>
        </div>
      </div>

      {rcaRelationship.path.length > 0 && (
        <div className="dependency-rca-path">
          <div className="dependency-rca-path-label">
            DETECTED RCA PATH
          </div>

          <div className="dependency-rca-path-flow">
            {rcaRelationship.path.map(
              (serviceName, index) => (
                <React.Fragment
                  key={`${serviceName}-${index}`}
                >
                  <span
                    className={[
                      "dependency-rca-path-node",
                      serviceName === rootCause
                        ? "path-root"
                        : "",
                      serviceName ===
                      impactAnalysis
                        .selectedService
                        .service
                        ? "path-selected"
                        : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {serviceName}
                  </span>

                  {index <
                    rcaRelationship.path.length -
                      1 && (
                    <span className="dependency-rca-path-arrow">
                      →
                    </span>
                  )}
                </React.Fragment>
              )
            )}
          </div>
        </div>
      )}

      <div className="dependency-rca-description">
        <span>ⓘ</span>

        <p>
          {rcaRelationship.description}
        </p>
      </div>
    </div>
  )}

      {!selectedService && (
        <div className="dependency-graph-footer">
          <span>
            Hover a service to trace its
            relationships. Click a service to
            lock an investigation.
          </span>

          {rootCause && (
            <span className="dependency-root-path">
              ★ RCA path starts at{" "}
              <strong>
                {rootCause}
              </strong>
            </span>
          )}
        </div>
      )}

      {selectedService && (
        <div className="dependency-graph-footer">
          <span>
            Investigation locked on{" "}
            <strong>
              {selectedService}
            </strong>
            .
          </span>

          {rootCause && (
            <span className="dependency-root-path">
              ★ RCA path starts at{" "}
              <strong>
                {rootCause}
              </strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}