import { NextResponse } from 'next/server';
import { getServerState, updateServerState } from '@/lib/server-state';
import { runPathfinding } from '@/lib/pathfinding';

export async function POST() {
  const state = getServerState();
  const obsSet = new Set(state.obstacles);
  const result = runPathfinding('A*', state.startPos, state.goalPos, obsSet);

  const updated = updateServerState({
    roverPos: { ...state.startPos },
    missionState: 'IDLE',
    distanceTravelled: 0,
    replans: 0,
    missionTime: 0,
    isEmergencyStopped: false,
    targetDetected: false,
    heading: 90,
    activePath: result.success ? result.path : [],
    pathLength: result.success ? result.pathLength : 0,
  });

  return NextResponse.json({
    success: true,
    state: updated.missionState,
    rover_position: [updated.roverPos.x, updated.roverPos.y],
  });
}
