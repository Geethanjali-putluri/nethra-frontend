import { NextResponse } from 'next/server';
import { updateServerState } from '@/lib/server-state';

export async function POST() {
  const updated = updateServerState({
    missionState: 'EMERGENCY_STOP',
    isEmergencyStopped: true,
  });
  return NextResponse.json({
    success: true,
    message: 'Emergency stop activated immediately',
    currentState: updated.missionState,
    isEmergencyStopped: true,
  });
}
