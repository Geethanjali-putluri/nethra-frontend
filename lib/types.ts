export type MissionState =
  | 'IDLE'
  | 'NAVIGATING'
  | 'OBSTACLE_DETECTED'
  | 'REPLANNING'
  | 'TARGET_DETECTED'
  | 'MISSION_COMPLETE'
  | 'NO_SAFE_PATH'
  | 'EMERGENCY_STOP'
  | 'STOPPED';

export type ObstaclePosition = 'LEFT' | 'CENTER' | 'RIGHT';

export type DetectedClass =
  | 'person'
  | 'bicycle'
  | 'car'
  | 'motorcycle'
  | 'bus'
  | 'truck'
  | 'chair'
  | 'bench'
  | 'suitcase';

export interface Detection {
  id: string;
  class: DetectedClass | string;
  confidence: number;
  position: ObstaclePosition;
  bbox?: [number, number, number, number]; // [x, y, w, h] normalized 0..1
  isTarget?: boolean;
  timestamp?: number;
}

export interface GridPoint {
  x: number;
  y: number;
}

export type GridCellType = 'S' | 'G' | 'X' | 'R' | '*' | 'EMPTY';

export interface TelemetryData {
  roverPos: GridPoint;
  startPos: GridPoint;
  goalPos: GridPoint;
  targetPos?: GridPoint;
  heading: number;
  currentState: string;
  distanceTravelled: number;
  obstaclesDetected: number;
  replans: number;
  pathLength: number;
  missionTime: number;
  isEmergencyStopped: boolean;
  targetDetected: boolean;
  dataSource: 'SIMULATION' | 'LIVE_BACKEND';
}

export type AlgorithmType = 'A*' | 'Dijkstra' | 'Greedy Best First Search';

export interface AlgorithmMetricResult {
  algorithm: AlgorithmType;
  path: GridPoint[];
  pathLength: number;
  nodesExplored: number;
  planningTimeMs: number;
  visitedNodes: GridPoint[];
  success: boolean;
}

export interface TelemetryHistoryPoint {
  timestamp: number;
  distanceTravelled: number;
  replans: number;
  pathLength: number;
  nodesExplored: number;
  state: string;
}

export interface SensorDeviceStatus {
  name: string;
  id: string;
  type: string;
  connected: boolean;
  badge: 'FUTURE HARDWARE' | 'SIMULATION' | 'WORKING';
  interfaceProtocol: string;
  pinoutSpec: string;
  expectedUnits: string;
  currentReading: string;
  description: string;
}

// Flask Backend API Contracts
export interface BackendDetectionItem {
  object?: string;
  class?: string;
  confidence?: number;
  position?: string;
}

export interface ApiStatusResponse {
  state?: string;
  rover_position?: [number, number] | { x: number; y: number };
  goal?: [number, number] | { x: number; y: number };
  path_length?: number;
  obstacles?: number | any[];
  replans?: number;
  distance?: number;
  camera?: string;
  vision?: string;
  yolo?: string;
  navigation?: string;
  rover?: string;
  detections?: BackendDetectionItem[];
}

export interface ApiNavigationResponse {
  grid?: number[][]; // 12x12 array: 0 = free cell, 1 = obstacle
  start?: [number, number] | { x: number; y: number };
  goal?: [number, number] | { x: number; y: number };
  rover?: [number, number] | { x: number; y: number };
  path?: Array<[number, number] | { x: number; y: number }>;
}

export interface ApiTelemetryResponse {
  position?: [number, number] | { x: number; y: number };
  state?: string;
  distance?: number;
  obstacles?: number | any[];
  replans?: number;
  path_length?: number;
  mission_time?: number | string;
}

export function parseGridPoint(val: unknown, fallback: GridPoint = { x: 0, y: 0 }): GridPoint {
  if (!val) return fallback;
  if (Array.isArray(val) && val.length >= 2) {
    const x = Number(val[0]);
    const y = Number(val[1]);
    return { x: isNaN(x) ? fallback.x : x, y: isNaN(y) ? fallback.y : y };
  }
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if ('x' in obj && 'y' in obj) {
      const x = Number(obj.x);
      const y = Number(obj.y);
      return { x: isNaN(x) ? fallback.x : x, y: isNaN(y) ? fallback.y : y };
    }
    if ('col' in obj && 'row' in obj) {
      const x = Number(obj.col);
      const y = Number(obj.row);
      return { x: isNaN(x) ? fallback.x : x, y: isNaN(y) ? fallback.y : y };
    }
  }
  if (typeof val === 'string') {
    const parts = val.replace(/[()[\]\s]/g, '').split(',');
    if (parts.length >= 2) {
      const x = Number(parts[0]);
      const y = Number(parts[1]);
      if (!isNaN(x) && !isNaN(y)) {
        return { x, y };
      }
    }
  }
  return fallback;
}

export function parsePathPoints(arr: unknown): GridPoint[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => parseGridPoint(item));
}
