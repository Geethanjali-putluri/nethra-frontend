import { NextResponse } from 'next/server';
import { updateServerState } from '@/lib/server-state';

export async function POST() {
  const updated = updateServerState({
    missionState: 'IDLE',
  });
  return NextResponse.json({
    success: true,
    message: 'Mission stopped',
    currentState: updated.missionState,
  });
}
