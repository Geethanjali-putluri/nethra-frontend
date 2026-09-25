import { NextResponse } from 'next/server';
import { updateServerState } from '@/lib/server-state';

export async function POST() {
  const updated = updateServerState({
    missionState: 'NAVIGATING',
    isEmergencyStopped: false,
  });
  return NextResponse.json({
    success: true,
    message: 'Mission resumed from emergency stop',
    currentState: updated.missionState,
    isEmergencyStopped: false,
  });
}
