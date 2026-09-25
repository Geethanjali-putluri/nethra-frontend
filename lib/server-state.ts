import { GridPoint, MissionState, Detection } from './types';

export interface ServerState {
  missionState: MissionState;
  roverPos: GridPoint;
  startPos: GridPoint;
  goalPos: GridPoint;
  targetPos: GridPoint;
  obstacles: string[];
  heading: number;
  distanceTravelled: number;
  replans: number;
  pathLength: number;
  missionTime: number;
  targetDetected: boolean;
  detections: Detection[];
  lastVisionTimestamp: number;
  backendConnected: boolean;
  isEmergencyStopped: boolean;
  cameraStatus?: string;
  visionStatus?: string;
  yoloStatus?: string;
  navigationStatus?: string;
  roverStatus?: string;
}

// Global server memory store (fallback for API routes)
declare global {
  var __NETHRA_STATE__: ServerState | undefined;
}

export function getServerState(): ServerState {
  if (!global.__NETHRA_STATE__) {
    global.__NETHRA_STATE__ = {
      missionState: 'IDLE',
      roverPos: { x: 0, y: 0 },
      startPos: { x: 0, y: 0 },
      goalPos: { x: 11, y: 11 },
      targetPos: { x: 9, y: 10 },
      obstacles: [
        '3,1', '3,2', '3,3', '3,4',
        '7,6', '7,7', '7,8', '8,8',
        '2,8', '3,8', '4,8',
        '9,2', '9,3', '9,4'
      ],
      heading: 90,
      distanceTravelled: 0,
      replans: 0,
      pathLength: 22,
      missionTime: 0,
      targetDetected: false,
      detections: [
        {
          id: 'det-1',
          class: 'person',
          confidence: 0.92,
          position: 'CENTER',
          bbox: [0.38, 0.22, 0.28, 0.65],
          isTarget: true,
          timestamp: Date.now(),
        },
        {
          id: 'det-2',
          class: 'chair',
          confidence: 0.84,
          position: 'LEFT',
          bbox: [0.08, 0.52, 0.24, 0.42],
          timestamp: Date.now(),
        },
      ],
      lastVisionTimestamp: Date.now(),
      backendConnected: false,
      isEmergencyStopped: false,
    };
  }
  return global.__NETHRA_STATE__;
}

export function updateServerState(patch: Partial<ServerState>): ServerState {
  const current = getServerState();
  Object.assign(current, patch);
  return current;
}
