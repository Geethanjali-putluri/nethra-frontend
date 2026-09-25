import { NextResponse } from 'next/server';
import { getServerState } from '@/lib/server-state';

export async function GET() {
  const state = getServerState();
  return NextResponse.json({
    state: state.missionState,
    rover_position: [state.roverPos.x, state.roverPos.y],
    goal: [state.goalPos.x, state.goalPos.y],
    path_length: state.pathLength,
    obstacles: state.obstacles.length,
    replans: state.replans,
    distance: state.distanceTravelled,
    camera: state.cameraStatus || 'CONNECTED',
    vision: state.visionStatus || 'LIVE / WORKING',
    yolo: state.yoloStatus || 'LIVE / WORKING',
    navigation: state.navigationStatus || 'LIVE / WORKING',
    rover: state.roverStatus || 'SIMULATION',
    detections: state.detections || [],
  });
}
