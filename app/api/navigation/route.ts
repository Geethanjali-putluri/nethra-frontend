import { NextRequest, NextResponse } from 'next/server';
import { getServerState, updateServerState } from '@/lib/server-state';
import { runPathfinding } from '@/lib/pathfinding';

export async function GET() {
  const state = getServerState();
  const obstaclesSet = new Set(state.obstacles);
  const result = runPathfinding('A*', state.roverPos, state.goalPos, obstaclesSet);

  // Construct 12x12 occupancy grid matrix: 0 = free cell, 1 = obstacle
  const grid: number[][] = Array.from({ length: 12 }, (_, y) =>
    Array.from({ length: 12 }, (_, x) => (obstaclesSet.has(`${x},${y}`) ? 1 : 0))
  );

  const activePath = state.missionState === 'NO_SAFE_PATH'
    ? []
    : state.activePath && state.activePath.length > 0
    ? state.activePath
    : result.path;

  return NextResponse.json({
    grid,
    start: [state.startPos.x, state.startPos.y],
    goal: [state.goalPos.x, state.goalPos.y],
    rover: [state.roverPos.x, state.roverPos.y],
    path: activePath.map((pt) => [pt.x, pt.y]),
    // Extra telemetry metrics
    gridSize: 12,
    roverPos: state.roverPos,
    startPos: state.startPos,
    goalPos: state.goalPos,
    obstacles: state.obstacles,
    pathLength: result.pathLength,
    nodesExplored: result.nodesExplored,
    planningTimeMs: result.planningTimeMs,
    replans: state.replans,
    navigationState: state.missionState,
    success: result.success,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const patch: Record<string, unknown> = {};

    if (Array.isArray(body.obstacles)) {
      patch.obstacles = body.obstacles;
      patch.replans = (getServerState().replans || 0) + 1;
      patch.missionState = 'REPLANNING';
    }
    if (body.goalPos) patch.goalPos = body.goalPos;
    if (body.roverPos) patch.roverPos = body.roverPos;

    const updated = updateServerState(patch);
    return NextResponse.json({ success: true, updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
