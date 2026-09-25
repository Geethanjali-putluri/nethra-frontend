import { GridPoint, MissionState, Detection } from './types';
import { runPathfinding, computeHeading } from './pathfinding';

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
  activePath?: GridPoint[];
}

// Global server memory store (fallback for API routes)
declare global {
  var __NETHRA_STATE__: ServerState | undefined;
  var __NETHRA_TIMER__: NodeJS.Timeout | undefined;
}

export function stepSimulation() {
  const state = getServerState();
  if (state.missionState !== 'NAVIGATING' || state.isEmergencyStopped) {
    return;
  }

  // Increment mission elapsed time
  state.missionTime = (state.missionTime || 0) + 1;

  const obsSet = new Set(state.obstacles);
  const oldActivePath = state.activePath ? [...state.activePath] : [];

  console.log('--- [DEBUG 4: stepSimulation STEP START] ---');
  console.log('[DEBUG 4] received obstacle coordinates:', JSON.stringify(state.obstacles));
  console.log('[DEBUG 4] current rover_position:', [state.roverPos.x, state.roverPos.y], `(x=${state.roverPos.x}, y=${state.roverPos.y})`);
  console.log('[DEBUG 4] old activePath:', JSON.stringify(oldActivePath));

  // If path is not set or exhausted, attempt to recompute
  if (!state.activePath || state.activePath.length <= 1) {
    if (state.roverPos.x === state.goalPos.x && state.roverPos.y === state.goalPos.y) {
      console.log('[DEBUG 4] Goal reached: MISSION_COMPLETE');
      state.missionState = 'MISSION_COMPLETE';
      return;
    }
    const res = runPathfinding('A*', state.roverPos, state.goalPos, obsSet);
    console.log('[DEBUG 4] (Path exhausted) new activePath after A*:', JSON.stringify(res.path));
    if (!res.success || res.path.length <= 1) {
      state.missionState = 'NO_SAFE_PATH';
      console.log('[DEBUG 4] NO_SAFE_PATH found');
      return;
    }
    state.activePath = res.path;
  }

  // Check if any planned waypoint on active path is blocked by an obstacle
  const nextPoint = state.activePath[1];
  const isPathBlocked = state.activePath.slice(1).some((p) => obsSet.has(`${p.x},${p.y}`));

  if (isPathBlocked) {
    // Dynamic obstacle encountered: recalculate A* from CURRENT rover position to GOAL
    console.log(`[DEBUG 4] Active path is blocked by obstacle! Recalculating A* from [${state.roverPos.x}, ${state.roverPos.y}]...`);
    const res = runPathfinding('A*', state.roverPos, state.goalPos, obsSet);
    state.replans = (state.replans || 0) + 1;
    console.log('[DEBUG 4] new activePath after A*:', JSON.stringify(res.path));

    if (res.success && res.path.length > 1) {
      state.activePath = res.path;
      state.pathLength = res.pathLength;
      // Step to the new safe next waypoint
      const newNext = res.path[1];
      console.log('[DEBUG 4] next waypoint selected by stepSimulation():', [newNext.x, newNext.y], `(x=${newNext.x}, y=${newNext.y})`);
      state.heading = computeHeading(state.roverPos, newNext);
      state.roverPos = newNext;
      state.activePath = res.path.slice(1);
      state.distanceTravelled = Number(((state.distanceTravelled || 0) + 0.5).toFixed(1));
      state.pathLength = state.activePath.length;
    } else {
      state.activePath = [];
      state.pathLength = 0;
      state.missionState = 'NO_SAFE_PATH';
      console.log('[DEBUG 4] next waypoint selected by stepSimulation(): NONE (NO_SAFE_PATH)');
    }
    console.log('--- [DEBUG 4: stepSimulation STEP END (obstacle avoidance)] ---');
    return;
  }

  // Normal advancement along active A* path
  console.log('[DEBUG 4] new activePath after A* (no replan needed):', JSON.stringify(state.activePath));
  console.log('[DEBUG 4] next waypoint selected by stepSimulation():', [nextPoint.x, nextPoint.y], `(x=${nextPoint.x}, y=${nextPoint.y})`);
  state.heading = computeHeading(state.roverPos, nextPoint);
  state.roverPos = nextPoint;
  state.activePath = state.activePath.slice(1);
  state.distanceTravelled = Number(((state.distanceTravelled || 0) + 0.5).toFixed(1));
  state.pathLength = state.activePath.length;

  console.log('[DEBUG 4] Rover moved to:', [state.roverPos.x, state.roverPos.y], 'Remaining activePath length:', state.activePath.length);
  console.log('--- [DEBUG 4: stepSimulation STEP END] ---');

  if (state.roverPos.x === state.goalPos.x && state.roverPos.y === state.goalPos.y) {
    state.missionState = 'MISSION_COMPLETE';
  }
}

export function startSimulationLoop() {
  if (!global.__NETHRA_TIMER__) {
    global.__NETHRA_TIMER__ = setInterval(() => {
      try {
        stepSimulation();
      } catch (e) {
        console.error('Simulation step error:', e);
      }
    }, 1000);
  }
}

export function getServerState(): ServerState {
  if (!global.__NETHRA_STATE__) {
    const defaultObstacles = [
      '4,4', '4,5', '4,6', '5,6', '6,6'
    ];
    const start = { x: 11, y: 0 };
    const goal = { x: 0, y: 11 };
    const initialAStar = runPathfinding('A*', start, goal, new Set(defaultObstacles));

    global.__NETHRA_STATE__ = {
      missionState: 'IDLE',
      roverPos: { ...start },
      startPos: { ...start },
      goalPos: { ...goal },
      targetPos: { ...goal },
      obstacles: defaultObstacles,
      heading: 90,
      distanceTravelled: 0,
      replans: 0,
      pathLength: initialAStar.pathLength,
      activePath: initialAStar.path,
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
      ],
      lastVisionTimestamp: Date.now(),
      backendConnected: true,
      isEmergencyStopped: false,
    };
  }

  // Ensure simulation timer is active
  startSimulationLoop();

  return global.__NETHRA_STATE__;
}

export function updateServerState(patch: Partial<ServerState>): ServerState {
  const current = getServerState();
  Object.assign(current, patch);
  return current;
}
