import { NextResponse } from 'next/server';
import { getServerState, updateServerState, startSimulationLoop } from '@/lib/server-state';
import { runPathfinding } from '@/lib/pathfinding';

export async function POST() {
  const state = getServerState();
  startSimulationLoop();

  let activePath = state.activePath;
  let pathLength = state.pathLength;

  if (!activePath || activePath.length <= 1) {
    const obsSet = new Set(state.obstacles);
    const res = runPathfinding('A*', state.roverPos, state.goalPos, obsSet);
    if (res.success) {
      activePath = res.path;
      pathLength = res.pathLength;
    }
  }

  const updated = updateServerState({
    missionState: 'NAVIGATING',
    isEmergencyStopped: false,
    activePath,
    pathLength,
  });

  return NextResponse.json({
    success: true,
    message: 'Mission started',
    currentState: updated.missionState,
    state: updated.missionState,
  });
}

