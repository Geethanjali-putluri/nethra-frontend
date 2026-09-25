import { NextRequest, NextResponse } from 'next/server';
import { getServerState } from '@/lib/server-state';
import { runPathfinding } from '@/lib/pathfinding';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawObstacles = body.obstacles;

    console.log('[DEBUG 2: POST /api/obstacles] Received request body:', JSON.stringify(body));
    console.log('[DEBUG 2: POST /api/obstacles] received obstacle coordinates (raw):', rawObstacles);

    if (!Array.isArray(rawObstacles)) {
      console.warn('[DEBUG 2: POST /api/obstacles] Expected "obstacles" to be an array, got:', typeof rawObstacles);
      return NextResponse.json(
        { success: false, error: 'Expected "obstacles" to be an array of [x, y] coordinates' },
        { status: 400 }
      );
    }

    const state = getServerState();
    const obstacleKeys: string[] = [];

    // Parse [[x, y], ...] into internal coordinate keys "x,y"
    for (const item of rawObstacles) {
      if (Array.isArray(item) && item.length >= 2) {
        const x = Number(item[0]);
        const y = Number(item[1]);
        if (!isNaN(x) && !isNaN(y)) {
          obstacleKeys.push(`${x},${y}`);
        }
      } else if (item && typeof item === 'object') {
        const x = 'x' in item ? Number(item.x) : 'col' in item ? Number(item.col) : NaN;
        const y = 'y' in item ? Number(item.y) : 'row' in item ? Number(item.row) : NaN;
        if (!isNaN(x) && !isNaN(y)) {
          obstacleKeys.push(`${x},${y}`);
        }
      }
    }

    console.log('[DEBUG 2: POST /api/obstacles] Parsed obstacle keys:', obstacleKeys);
    console.log('[DEBUG 3: POST /api/obstacles] current rover_position:', [state.roverPos.x, state.roverPos.y], `(x=${state.roverPos.x}, y=${state.roverPos.y})`);
    console.log('[DEBUG 3: POST /api/obstacles] old activePath:', JSON.stringify(state.activePath));

    // 1. Store these obstacle cells in the backend navigation grid
    state.obstacles = obstacleKeys;
    const obsSet = new Set(obstacleKeys);

    // 2. Keep the existing START and GOAL
    // 3. Recalculate A* from the rover's CURRENT position to GOAL using the updated grid
    const result = runPathfinding('A*', state.roverPos, state.goalPos, obsSet);

    console.log('[DEBUG 3: POST /api/obstacles] new activePath after A*:', JSON.stringify(result.path), 'Success:', result.success);

    if (result.success && result.path.length > 0) {
      // 4. Replace the rover's active path with this newly calculated path
      state.activePath = result.path;
      state.pathLength = result.pathLength;
      state.replans = (state.replans || 0) + 1;
      if (state.missionState === 'NO_SAFE_PATH') {
        state.missionState = 'NAVIGATING';
      }
      console.log('[DEBUG 3: POST /api/obstacles] Updated backend state.activePath successfully. Length:', state.activePath.length);
    } else {
      // 5. If no path exists, set state to "NO_SAFE_PATH"
      state.activePath = [];
      state.pathLength = 0;
      state.missionState = 'NO_SAFE_PATH';
      state.replans = (state.replans || 0) + 1;
      console.log('[DEBUG 3: POST /api/obstacles] No safe path found. state.activePath set to empty, missionState: NO_SAFE_PATH');
    }

    // 12x12 occupancy grid matrix: 0 = free, 1 = obstacle
    const grid: number[][] = Array.from({ length: 12 }, (_, y) =>
      Array.from({ length: 12 }, (_, x) => (obsSet.has(`${x},${y}`) ? 1 : 0))
    );

    return NextResponse.json({
      success: true,
      state: state.missionState,
      rover_position: [state.roverPos.x, state.roverPos.y],
      path: state.activePath.map((pt) => [pt.x, pt.y]),
      path_length: state.pathLength,
      replans: state.replans,
      grid,
      obstacles: state.obstacles.length,
    });
  } catch (err) {
    console.error('[DEBUG 2/3: POST /api/obstacles] Error caught in POST handler:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to process obstacles payload' },
      { status: 500 }
    );
  }
}
