import { AlgorithmMetricResult, AlgorithmType, GridPoint } from './types';

export const GRID_SIZE = 12;

export function isValid(point: GridPoint): boolean {
  return point.x >= 0 && point.x < GRID_SIZE && point.y >= 0 && point.y < GRID_SIZE;
}

export function pointToKey(p: GridPoint): string {
  return `${p.x},${p.y}`;
}

export function keyToPoint(key: string): GridPoint {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

// Manhattan distance heuristic
export function heuristic(a: GridPoint, b: GridPoint): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Euclidean distance heuristic
export function euclidean(a: GridPoint, b: GridPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// 4-directional cardinal neighbors: Up, Right, Down, Left
const DIRECTIONS: GridPoint[] = [
  { x: 0, y: -1 }, // Up (North)
  { x: 1, y: 0 },  // Right (East)
  { x: 0, y: 1 },  // Down (South)
  { x: -1, y: 0 }, // Left (West)
];

export function runPathfinding(
  algorithm: AlgorithmType,
  start: GridPoint,
  goal: GridPoint,
  obstacles: Set<string>
): AlgorithmMetricResult {
  const startTime = performance.now();

  const startKey = pointToKey(start);
  const goalKey = pointToKey(goal);

  if (startKey === goalKey) {
    return {
      algorithm,
      path: [start],
      pathLength: 0,
      nodesExplored: 1,
      planningTimeMs: Number((performance.now() - startTime).toFixed(3)),
      visitedNodes: [start],
      success: true,
    };
  }

  // Priority queue / frontier
  interface NodeItem {
    point: GridPoint;
    priority: number;
    gScore: number;
  }

  const frontier: NodeItem[] = [];
  frontier.push({
    point: start,
    priority: 0,
    gScore: 0,
  });

  const cameFrom = new Map<string, GridPoint>();
  const gScores = new Map<string, number>();
  gScores.set(startKey, 0);

  const visitedSet = new Set<string>();
  const visitedNodes: GridPoint[] = [];

  let found = false;

  while (frontier.length > 0) {
    // Sort to extract minimum priority (for priority queue behavior)
    frontier.sort((a, b) => a.priority - b.priority);
    const current = frontier.shift()!;
    const currentKey = pointToKey(current.point);

    if (visitedSet.has(currentKey)) {
      continue;
    }
    visitedSet.add(currentKey);
    visitedNodes.push(current.point);

    if (currentKey === goalKey) {
      found = true;
      break;
    }

    const currentG = gScores.get(currentKey) ?? Infinity;

    for (const dir of DIRECTIONS) {
      const neighbor: GridPoint = {
        x: current.point.x + dir.x,
        y: current.point.y + dir.y,
      };
      const neighborKey = pointToKey(neighbor);

      if (!isValid(neighbor)) continue;
      if (obstacles.has(neighborKey)) continue;
      if (visitedSet.has(neighborKey)) continue;

      const tentativeG = currentG + 1; // unit step cost

      if (tentativeG < (gScores.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, current.point);
        gScores.set(neighborKey, tentativeG);

        let priority = 0;
        const h = heuristic(neighbor, goal);

        if (algorithm === 'A*') {
          // f(n) = g(n) + h(n)
          priority = tentativeG + h;
        } else if (algorithm === 'Dijkstra') {
          // f(n) = g(n)
          priority = tentativeG;
        } else if (algorithm === 'Greedy Best First Search') {
          // f(n) = h(n)
          priority = h;
        }

        frontier.push({
          point: neighbor,
          priority,
          gScore: tentativeG,
        });
      }
    }
  }

  const endTime = performance.now();
  const planningTimeMs = Number((endTime - startTime).toFixed(3));

  if (!found) {
    return {
      algorithm,
      path: [],
      pathLength: 0,
      nodesExplored: visitedNodes.length,
      planningTimeMs,
      visitedNodes,
      success: false,
    };
  }

  // Reconstruct path
  const path: GridPoint[] = [];
  let curr: GridPoint | undefined = goal;
  while (curr) {
    path.unshift(curr);
    const currKey = pointToKey(curr);
    if (currKey === startKey) break;
    curr = cameFrom.get(currKey);
  }

  return {
    algorithm,
    path,
    pathLength: path.length > 0 ? path.length - 1 : 0,
    nodesExplored: visitedNodes.length,
    planningTimeMs,
    visitedNodes,
    success: true,
  };
}

export function computeHeading(from: GridPoint, to: GridPoint): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 1 && dy === 0) return 90;  // East
  if (dx === -1 && dy === 0) return 270; // West
  if (dx === 0 && dy === 1) return 180; // South
  if (dx === 0 && dy === -1) return 0;   // North
  return 0;
}
