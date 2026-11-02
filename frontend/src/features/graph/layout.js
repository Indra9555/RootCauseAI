// Layered left-to-right layout. A service that depends on another sits to
// the left of it, so callers are on the left and shared infrastructure
// (databases, queues) is on the right.

export const NODE_WIDTH = 232;
export const NODE_HEIGHT = 52;
export const GAP_X = 96;
export const GAP_Y = 20;
export const PADDING = 16;

export function layoutGraph(services, dependencies) {
  const names = services.map((service) => service.service);
  const level = new Map(names.map((name) => [name, 0]));

  // Longest-path layering. Bounded by the node count so a dependency
  // cycle can never loop forever.
  for (let pass = 0; pass < names.length; pass += 1) {
    let changed = false;

    for (const edge of dependencies) {
      if (!level.has(edge.source) || !level.has(edge.target)) {
        continue;
      }

      const wanted = level.get(edge.source) + 1;

      if (wanted > level.get(edge.target) && wanted < names.length) {
        level.set(edge.target, wanted);
        changed = true;
      }
    }

    if (!changed) {
      break;
    }
  }

  const columns = [];

  for (const name of [...names].sort()) {
    const index = level.get(name);

    columns[index] = columns[index] || [];
    columns[index].push(name);
  }

  const filled = columns.filter(Boolean);
  const tallest = Math.max(1, ...filled.map((column) => column.length));
  const columnHeight = tallest * (NODE_HEIGHT + GAP_Y) - GAP_Y;

  const positions = new Map();

  columns.forEach((column, columnIndex) => {
    if (!column) {
      return;
    }

    const height = column.length * (NODE_HEIGHT + GAP_Y) - GAP_Y;
    const offset = (columnHeight - height) / 2;

    column.forEach((name, rowIndex) => {
      positions.set(name, {
        x: PADDING + columnIndex * (NODE_WIDTH + GAP_X),
        y: PADDING + offset + rowIndex * (NODE_HEIGHT + GAP_Y)
      });
    });
  });

  return {
    positions,
    width:
      PADDING * 2 +
      columns.length * NODE_WIDTH +
      Math.max(0, columns.length - 1) * GAP_X,
    height: PADDING * 2 + columnHeight
  };
}

export function edgePath(from, to) {
  const startX = from.x + NODE_WIDTH;
  const startY = from.y + NODE_HEIGHT / 2;
  const endX = to.x;
  const endY = to.y + NODE_HEIGHT / 2;
  const midX = startX + (endX - startX) / 2;

  return `M${startX} ${startY} H${midX} V${endY} H${endX}`;
}
