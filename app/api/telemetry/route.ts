import { NextResponse } from 'next/server';
import { getServerState } from '@/lib/server-state';

export async function GET() {
  const state = getServerState();
  return NextResponse.json({
    // Standard Flask API telemetry contract
    position: [state.roverPos.x, state.roverPos.y],
    state: state.missionState,
    distance: state.distanceTravelled,
    obstacles: state.obstacles.length,
    replans: state.replans,
    path_length: state.pathLength,
    mission_time: state.missionTime,
    // Complementary fields
    roverPos: state.roverPos,
    heading: state.heading,
    currentState: state.missionState,
    distanceTravelled: state.distanceTravelled,
    obstaclesDetected: state.obstacles.length,
    pathLength: state.pathLength,
    missionTime: state.missionTime,
    isEmergencyStopped: state.isEmergencyStopped,
    targetDetected: state.targetDetected,
    dataSource: state.backendConnected ? 'LIVE_BACKEND' : 'SIMULATION',
    timestamp: Date.now(),
  });
}
