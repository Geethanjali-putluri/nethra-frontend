import { NextResponse } from 'next/server';
import { getServerState } from '@/lib/server-state';

export async function GET() {
  const state = getServerState();
  return NextResponse.json({
    currentState: state.missionState,
    missionTime: state.missionTime,
    targetDetected: state.targetDetected,
    isEmergencyStopped: state.isEmergencyStopped,
    roverPos: state.roverPos,
    goalPos: state.goalPos,
    targetPos: state.targetPos,
    flow: [
      'MISSION START',
      'NAVIGATING',
      'OBSTACLE DETECTED',
      'REPLANNING',
      'CONTINUE NAVIGATION',
      'TARGET DETECTED',
      'MISSION COMPLETE',
    ],
  });
}
