'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  GridPoint,
  MissionState,
  Detection,
  TelemetryHistoryPoint,
  SensorDeviceStatus,
  AlgorithmType,
  AlgorithmMetricResult,
  BackendDetectionItem,
  ApiStatusResponse,
  ApiNavigationResponse,
  ApiTelemetryResponse,
  parseGridPoint,
  parsePathPoints,
} from './types';
import { GRID_SIZE, pointToKey, keyToPoint, runPathfinding, computeHeading } from './pathfinding';
import { DEFAULT_BACKEND_URL, API_ENDPOINTS, POLLING_INTERVAL_MS, ACTIVE_POLLING_INTERVAL_MS, REQUEST_TIMEOUT_MS, FAILED_REQUESTS_THRESHOLD } from './config';

interface RoboticsContextType {
  // Navigation tabs
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Python Backend Connection Status & Config
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  backendConnected: boolean;
  setBackendConnected: (c: boolean) => void;
  lastSuccessfulPoll: number | null;

  // Real Backend Data
  apiStatus: ApiStatusResponse | null;
  apiNavigation: ApiNavigationResponse | null;
  apiTelemetry: ApiTelemetryResponse | null;
  gridMatrix: number[][] | null;
  backendDetections: BackendDetectionItem[];

  // Normalized Grid & Navigation
  gridSize: number;
  startPos: GridPoint;
  goalPos: GridPoint;
  targetPos: GridPoint;
  roverPos: GridPoint;
  obstacles: Set<string>;
  currentPath: GridPoint[];
  pathLength: number;
  nodesExplored: number;
  replans: number;
  planningTimeMs: number;
  heading: number;
  distanceTravelled: number;
  toggleObstacle: (p: GridPoint) => void;
  addObstacleInPath: () => void;
  clearObstacles: () => void;
  resetRover: () => void;
  setStartPos: (p: GridPoint) => void;
  setGoalPos: (p: GridPoint) => void;

  // Dynamic Pipeline event step tracking
  pipelineStep: 'IDLE' | 'OBSTACLE_ADDED' | 'OBSTACLE_DETECTED' | 'GRID_UPDATED' | 'A_STAR_REPLANNING' | 'NEW_PATH' | null;

  // Mission State & Subsystems
  missionState: string;
  missionTime: number; // in seconds
  isEmergencyStopped: boolean;
  targetDetected: boolean;
  visionStatus: string;
  yoloStatus: string;
  navigationStatus: string;
  roverStatus: string;
  cameraStatus: string;

  // Mission Controls connected to Flask API
  startMission: () => Promise<void>;
  stopMission: () => Promise<void>;
  emergencyStop: () => Promise<void>;
  resumeMission: () => Promise<void>;
  stepRoverOnce: () => void;
  refreshAll: () => Promise<void>;

  // Vision
  visionConnected: boolean;
  setVisionConnected: (c: boolean) => void;
  detections: Detection[];
  addDetection: (d: Detection) => void;
  activeTargetInView: boolean;

  // Sensors & Future Hardware
  sensors: SensorDeviceStatus[];

  // Telemetry History
  telemetryHistory: TelemetryHistoryPoint[];

  // Algorithm Benchmark
  selectedAlgorithm: AlgorithmType;
  setSelectedAlgorithm: (alg: AlgorithmType) => void;
  runBenchmark: (alg: AlgorithmType) => AlgorithmMetricResult;
}

const RoboticsContext = createContext<RoboticsContextType | null>(null);

const DEFAULT_SENSORS: SensorDeviceStatus[] = [
  {
    name: 'Front Rangefinder',
    id: 'SR-01',
    type: 'Ultrasonic / ToF Sensor',
    connected: false,
    badge: 'FUTURE HARDWARE',
    interfaceProtocol: 'I2C / GPIO (Echo/Trig)',
    pinoutSpec: 'VCC 5V, GND, TRIG: GPIO 23, ECHO: GPIO 24',
    expectedUnits: 'cm (0 - 400 cm range)',
    currentReading: 'NOT CONNECTED',
    description: 'Forward proximity detection and obstacle distance measurement for emergency stopping envelope.',
  },
  {
    name: 'Left Rangefinder',
    id: 'SR-02',
    type: 'Ultrasonic Sensor',
    connected: false,
    badge: 'FUTURE HARDWARE',
    interfaceProtocol: 'GPIO (Echo/Trig)',
    pinoutSpec: 'VCC 5V, GND, TRIG: GPIO 17, ECHO: GPIO 27',
    expectedUnits: 'cm',
    currentReading: 'NOT CONNECTED',
    description: 'Lateral flank clearance monitoring for narrow passage navigation.',
  },
  {
    name: 'Right Rangefinder',
    id: 'SR-03',
    type: 'Ultrasonic Sensor',
    connected: false,
    badge: 'FUTURE HARDWARE',
    interfaceProtocol: 'GPIO (Echo/Trig)',
    pinoutSpec: 'VCC 5V, GND, TRIG: GPIO 22, ECHO: GPIO 10',
    expectedUnits: 'cm',
    currentReading: 'NOT CONNECTED',
    description: 'Lateral right obstacle clearance and corridor wall-following support.',
  },
  {
    name: 'Inertial Measurement Unit (IMU)',
    id: 'IMU-6050',
    type: '6-DOF Gyroscope & Accelerometer',
    connected: false,
    badge: 'FUTURE HARDWARE',
    interfaceProtocol: 'I2C (Address 0x68)',
    pinoutSpec: 'VCC 3.3V, GND, SDA: GPIO 2, SCL: GPIO 3',
    expectedUnits: 'degrees (Roll, Pitch, Yaw), m/s²',
    currentReading: 'NOT CONNECTED',
    description: 'Heading dead reckoning, tilt stability, and slip detection for rough terrain.',
  },
  {
    name: 'Power Management & Battery Telemetry',
    id: 'PWR-ADC',
    type: 'Voltage Divider / INA219 Current Sensor',
    connected: false,
    badge: 'FUTURE HARDWARE',
    interfaceProtocol: 'I2C (Address 0x40) / ADC Channel 0',
    pinoutSpec: 'VCC 3.3V, GND, SDA, SCL, Vin+ / Vin-',
    expectedUnits: 'Volts (11.1V - 12.6V 3S LiPo) / Amperes',
    currentReading: 'NOT CONNECTED',
    description: 'Bus voltage, discharge rate, and remaining runtime estimation for UGV motor drive.',
  },
];

export function RoboticsProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Backend URL default: DEFAULT_BACKEND_URL (https://nethra-api-aemt.onrender.com)
  const defaultBackendUrl = DEFAULT_BACKEND_URL;
  const [backendUrl, setBackendUrl] = useState<string>(defaultBackendUrl);

  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [lastSuccessfulPoll, setLastSuccessfulPoll] = useState<number | null>(null);

  // Raw responses from Flask API
  const [apiStatus, setApiStatus] = useState<ApiStatusResponse | null>(null);
  const [apiNavigation, setApiNavigation] = useState<ApiNavigationResponse | null>(null);
  const [apiTelemetry, setApiTelemetry] = useState<ApiTelemetryResponse | null>(null);

  // Initial default path from (11,0) to (0,11)
  const initialPathRes = runPathfinding('A*', { x: 11, y: 0 }, { x: 0, y: 11 }, new Set());

  // Grid & Coordinates (Default match the Python backend's arena: rover start [11,0] -> goal [0,11])
  const [gridMatrix, setGridMatrix] = useState<number[][] | null>(null);
  const [startPos, setStartPos] = useState<GridPoint>({ x: 11, y: 0 });
  const [goalPos, setGoalPos] = useState<GridPoint>({ x: 0, y: 11 });
  const [targetPos] = useState<GridPoint>({ x: 0, y: 11 });
  const [roverPos, setRoverPos] = useState<GridPoint>({ x: 11, y: 0 });
  const [obstacles, setObstacles] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<GridPoint[]>(initialPathRes.path);

  // Navigation metrics
  const [pathLength, setPathLength] = useState<number>(initialPathRes.pathLength);
  const [nodesExplored, setNodesExplored] = useState<number>(initialPathRes.nodesExplored);
  const [replans, setReplans] = useState<number>(0);
  const [planningTimeMs, setPlanningTimeMs] = useState<number>(0);
  const [heading, setHeading] = useState<number>(90);
  const [distanceTravelled, setDistanceTravelled] = useState<number>(0);

  // Mission and state flags
  const [missionState, setMissionState] = useState<string>('IDLE');
  const [missionTime, setMissionTime] = useState<number>(0);
  const [isEmergencyStopped, setIsEmergencyStopped] = useState<boolean>(false);
  const [targetDetected, setTargetDetected] = useState<boolean>(false);

  // Subsystem statuses - strict rule: if backend disconnected, unavailable values display '--'
  const [visionStatus, setVisionStatus] = useState<string>('--');
  const [yoloStatus, setYoloStatus] = useState<string>('--');
  const [navigationStatus, setNavigationStatus] = useState<string>('--');
  const [roverStatus, setRoverStatus] = useState<string>('--');
  const [cameraStatus, setCameraStatus] = useState<string>('--');

  const [backendDetections, setBackendDetections] = useState<BackendDetectionItem[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);

  // Pipeline step for UI animation
  const [pipelineStep, setPipelineStep] = useState<
    'IDLE' | 'OBSTACLE_ADDED' | 'OBSTACLE_DETECTED' | 'GRID_UPDATED' | 'A_STAR_REPLANNING' | 'NEW_PATH' | null
  >(null);

  // Telemetry History
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryHistoryPoint[]>([]);

  // Algorithm comparison
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('A*');

  // Keep latest mutable values in refs to avoid recreating fetchBackendData on state changes
  const prevRoverPosRef = useRef<GridPoint>(roverPos);
  const currentRoverPosRef = useRef<GridPoint>(roverPos);
  const currentGoalPosRef = useRef<GridPoint>(goalPos);
  const currentStartPosRef = useRef<GridPoint>(startPos);
  const currentPathLengthRef = useRef<number>(pathLength);
  const currentDistanceRef = useRef<number>(distanceTravelled);
  const currentReplansRef = useRef<number>(replans);
  const currentNodesRef = useRef<number>(nodesExplored);
  const currentMissionStateRef = useRef<string>(missionState);

  // Synchronize refs after render
  useEffect(() => {
    currentRoverPosRef.current = roverPos;
    currentGoalPosRef.current = goalPos;
    currentStartPosRef.current = startPos;
    currentPathLengthRef.current = pathLength;
    currentDistanceRef.current = distanceTravelled;
    currentReplansRef.current = replans;
    currentNodesRef.current = nodesExplored;
    currentMissionStateRef.current = missionState;
  }, [roverPos, goalPos, startPos, pathLength, distanceTravelled, replans, nodesExplored, missionState]);

  // Track consecutive failed requests to prevent rapid toggling
  const consecutiveFailuresRef = useRef<number>(0);
  // Guard to prevent concurrent / overlapping in-flight polling requests
  const isPollingRef = useRef<boolean>(false);

  // Helper to update rover position and calculate heading
  const updateRoverPos = useCallback((newPos: GridPoint) => {
    const prev = prevRoverPosRef.current;
    if (newPos.x !== prev.x || newPos.y !== prev.y) {
      const newHdg = computeHeading(prev, newPos);
      setHeading(newHdg);
      prevRoverPosRef.current = newPos;
    }
    setRoverPos(newPos);
  }, []);

  // Core polling function
  const fetchBackendData = useCallback(async () => {
    // Avoid overlapping in-flight requests if a previous cycle is still resolving
    if (isPollingRef.current) {
      return;
    }
    isPollingRef.current = true;

    const cleanUrl = backendUrl.replace(/\/+$/, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      // 1. Fetch /api/status (Primary health & status endpoint)
      const statusRes = await fetch(`${cleanUrl}/api/status`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!statusRes.ok) {
        throw new Error(`Status HTTP ${statusRes.status}`);
      }

      const statusData: ApiStatusResponse = await statusRes.json();
      setApiStatus(statusData);

      // On a successful response, reset consecutive failure counter immediately
      consecutiveFailuresRef.current = 0;
      // Requirement 4: Show CONNECTED after one successful API request
      setBackendConnected(true);
      setLastSuccessfulPoll(Date.now());

      // Map /api/status values
      if (statusData.state) {
        setMissionState(statusData.state.toUpperCase());
        if (statusData.state.toUpperCase() === 'EMERGENCY_STOP') {
          setIsEmergencyStopped(true);
        } else if (statusData.state.toUpperCase() === 'TARGET_DETECTED') {
          setTargetDetected(true);
        }
      }

      // Backend is the source of truth for rover_position
      if (statusData.rover_position) {
        const parsedRover = parseGridPoint(statusData.rover_position, currentRoverPosRef.current);
        updateRoverPos(parsedRover);
      }

      if (statusData.goal) {
        setGoalPos(parseGridPoint(statusData.goal, currentGoalPosRef.current));
      }

      if (typeof statusData.path_length === 'number') {
        setPathLength(statusData.path_length);
      }

      if (typeof statusData.replans === 'number') {
        setReplans(statusData.replans);
      }

      if (typeof statusData.distance === 'number') {
        setDistanceTravelled(statusData.distance);
      }

      if (statusData.vision) setVisionStatus(statusData.vision);
      if (statusData.yolo) setYoloStatus(statusData.yolo);
      if (statusData.navigation) setNavigationStatus(statusData.navigation);
      if (statusData.rover) setRoverStatus(statusData.rover);
      if (statusData.camera) setCameraStatus(statusData.camera);

      if (Array.isArray(statusData.detections)) {
        setBackendDetections(statusData.detections);
        // Normalize detections for camera panel
        const normDets: Detection[] = statusData.detections.map((d, i) => {
          const cls = d.object || d.class || 'unknown';
          const pos = (d.position || 'CENTER').toUpperCase() as any;
          return {
            id: `det-${i}-${cls}`,
            class: cls,
            confidence: typeof d.confidence === 'number' ? d.confidence : 0.85,
            position: pos === 'LEFT' || pos === 'RIGHT' ? pos : 'CENTER',
            bbox: pos === 'LEFT' ? [0.08, 0.35, 0.25, 0.45] : pos === 'RIGHT' ? [0.68, 0.35, 0.25, 0.45] : [0.38, 0.22, 0.28, 0.65],
            isTarget: cls.toLowerCase() === 'person',
            timestamp: Date.now(),
          };
        });
        setDetections(normDets);
        if (normDets.some((d) => d.isTarget)) {
          setTargetDetected(true);
        }
      }

      // 2. Fetch /api/navigation
      try {
        const navRes = await fetch(`${cleanUrl}/api/navigation`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (navRes.ok) {
          const navData: ApiNavigationResponse = await navRes.json();
          setApiNavigation(navData);

          if (Array.isArray(navData.grid) && navData.grid.length > 0) {
            setGridMatrix(navData.grid);
            // Extract obstacle set from 2D matrix
            const obsSet = new Set<string>();
            navData.grid.forEach((row, y) => {
              if (Array.isArray(row)) {
                row.forEach((cell, x) => {
                  if (cell === 1) {
                    obsSet.add(`${x},${y}`);
                  }
                });
              }
            });
            setObstacles(obsSet);
          }

          if (navData.start) setStartPos(parseGridPoint(navData.start, currentStartPosRef.current));
          if (navData.goal) setGoalPos(parseGridPoint(navData.goal, currentGoalPosRef.current));
          if (navData.rover) {
            const parsedNavRover = parseGridPoint(navData.rover, currentRoverPosRef.current);
            updateRoverPos(parsedNavRover);
          }
          if (Array.isArray(navData.path)) {
            const parsedPath = parsePathPoints(navData.path);
            setCurrentPath(parsedPath);
            if (parsedPath.length > 0 && typeof statusData.path_length !== 'number') {
              setPathLength(parsedPath.length - 1);
            }
          }
        }
      } catch {
        // Navigation route optional if status has primary fields
      }

      // 3. Fetch /api/telemetry
      try {
        const telRes = await fetch(`${cleanUrl}/api/telemetry`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (telRes.ok) {
          const telData: ApiTelemetryResponse = await telRes.json();
          setApiTelemetry(telData);

          if (typeof telData.distance === 'number') {
            setDistanceTravelled(telData.distance);
          }
          if (typeof telData.replans === 'number') {
            setReplans(telData.replans);
          }
          if (typeof telData.path_length === 'number') {
            setPathLength(telData.path_length);
          }
          if (telData.mission_time !== undefined) {
            setMissionTime(Number(telData.mission_time) || 0);
          }
          if (telData.position) {
            const parsedTelRover = parseGridPoint(telData.position, currentRoverPosRef.current);
            updateRoverPos(parsedTelRover);
          }

          setTelemetryHistory((prev) => [
            ...prev.slice(-30),
            {
              timestamp: Number(telData.mission_time) || Date.now(),
              distanceTravelled: typeof telData.distance === 'number' ? telData.distance : currentDistanceRef.current,
              replans: typeof telData.replans === 'number' ? telData.replans : currentReplansRef.current,
              pathLength: typeof telData.path_length === 'number' ? telData.path_length : currentPathLengthRef.current,
              nodesExplored: currentNodesRef.current,
              state: telData.state || currentMissionStateRef.current,
            },
          ]);
        }
      } catch {
        // Telemetry optional if status provided
      }

      setLastSuccessfulPoll(Date.now());
    } catch {
      // Requirement 2 & 3: Do NOT mark backend disconnected because of a single failed request.
      // Only show DISCONNECTED after 3 consecutive failed API requests.
      consecutiveFailuresRef.current += 1;

      if (consecutiveFailuresRef.current >= FAILED_REQUESTS_THRESHOLD) {
        setBackendConnected(false);
        setApiStatus(null);
        setApiNavigation(null);
        setApiTelemetry(null);
        setBackendDetections([]);
        setVisionStatus('--');
        setYoloStatus('--');
        setNavigationStatus('--');
        setRoverStatus('--');
        setCameraStatus('--');
      }
    } finally {
      clearTimeout(timeoutId);
      isPollingRef.current = false;
    }
  }, [backendUrl, updateRoverPos]);

  // Dynamic Polling loop:
  // - Polls every 1 second (ACTIVE_POLLING_INTERVAL_MS) when mission is active ('NAVIGATING' or 'REPLANNING')
  //   so backend rover_position movements, status updates, and telemetry update rapidly and smoothly.
  // - Polls every 3 seconds (POLLING_INTERVAL_MS) when IDLE/STOPPED to conserve bandwidth.
  // - Single interval scoped in Root provider, cleaned up on unmount or state transition.
  // - Backend is the sole source of truth: no fake or frontend JS simulated rover position steps.
  useEffect(() => {
    let mounted = true;
    const intervalDuration =
      missionState === 'NAVIGATING' || missionState === 'REPLANNING'
        ? ACTIVE_POLLING_INTERVAL_MS
        : POLLING_INTERVAL_MS;

    const interval = setInterval(() => {
      if (mounted) {
        fetchBackendData();
      }
    }, intervalDuration);

    // Initial check scheduled asynchronously to avoid synchronous setState warning
    const initialTimer = setTimeout(() => {
      if (mounted) {
        fetchBackendData();
      }
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [fetchBackendData, missionState]);

  // Mission control POST functions
  const sendMissionCommand = async (endpoint: string) => {
    const cleanUrl = backendUrl.replace(/\/+$/, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      await fetch(`${cleanUrl}/api/mission/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
    } catch (err) {
      console.warn(`Failed to POST /api/mission/${endpoint}:`, err);
    } finally {
      clearTimeout(timeoutId);
      // Immediately refresh status after command as required
      await fetchBackendData();
    }
  };

  const startMission = async () => {
    setIsEmergencyStopped(false);
    setMissionState('NAVIGATING');
    await sendMissionCommand('start');
  };

  const stopMission = async () => {
    setMissionState('STOPPED');
    await sendMissionCommand('stop');
  };

  const emergencyStop = async () => {
    setIsEmergencyStopped(true);
    setMissionState('EMERGENCY_STOP');
    await sendMissionCommand('emergency-stop');
  };

  const resumeMission = async () => {
    setIsEmergencyStopped(false);
    setMissionState('NAVIGATING');
    await sendMissionCommand('resume');
  };

  const refreshAll = async () => {
    await fetchBackendData();
  };

  // Offline / Simulation fallback helpers for interactive manipulation
  const toggleObstacle = (point: GridPoint) => {
    const key = pointToKey(point);
    if (pointToKey(startPos) === key || pointToKey(goalPos) === key || pointToKey(roverPos) === key) {
      return;
    }

    const nextObstacles = new Set(obstacles);
    const wasObstacle = nextObstacles.has(key);

    if (wasObstacle) {
      nextObstacles.delete(key);
      setObstacles(nextObstacles);
      setGridMatrix((prev) => {
        if (!prev) return prev;
        return prev.map((row, y) =>
          row.map((cell, x) => (x === point.x && y === point.y ? 0 : cell))
        );
      });
      const res = runPathfinding('A*', roverPos, goalPos, nextObstacles);
      setCurrentPath(res.path);
      setPathLength(res.pathLength);
    } else {
      nextObstacles.add(key);
      setObstacles(nextObstacles);
      setGridMatrix((prev) => {
        if (!prev) {
          const matrix = Array.from({ length: 12 }, () => Array.from({ length: 12 }, () => 0));
          matrix[point.y][point.x] = 1;
          return matrix;
        }
        return prev.map((row, y) =>
          row.map((cell, x) => (x === point.x && y === point.y ? 1 : cell))
        );
      });

      const wasNavigating = missionState === 'NAVIGATING';
      setMissionState('REPLANNING');
      setPipelineStep('OBSTACLE_ADDED');

      setTimeout(() => {
        setPipelineStep('GRID_UPDATED');
        setTimeout(() => {
          setPipelineStep('A_STAR_REPLANNING');
          const res = runPathfinding('A*', roverPos, goalPos, nextObstacles);
          setCurrentPath(res.path);
          setPathLength(res.pathLength);
          setReplans((r) => r + 1);

          setTimeout(() => {
            setPipelineStep('NEW_PATH');
            if (res.success && res.path.length > 0) {
              setMissionState(wasNavigating ? 'NAVIGATING' : 'READY');
            } else {
              setMissionState('NO_SAFE_PATH');
            }
          }, 350);
        }, 350);
      }, 350);
    }
  };

  const addObstacleInPath = () => {
    if (currentPath.length > 2) {
      toggleObstacle(currentPath[2]);
    } else if (currentPath.length > 1) {
      toggleObstacle(currentPath[1]);
    }
  };

  const clearObstacles = () => {
    const emptySet = new Set<string>();
    setObstacles(emptySet);
    setGridMatrix(Array.from({ length: 12 }, () => Array.from({ length: 12 }, () => 0)));
    const res = runPathfinding('A*', roverPos, goalPos, emptySet);
    setCurrentPath(res.path);
    setPathLength(res.pathLength);
  };

  const resetRover = () => {
    setRoverPos(startPos);
    setMissionState('IDLE');
    setDistanceTravelled(0);
    setReplans(0);
    setMissionTime(0);
    setIsEmergencyStopped(false);
    setTargetDetected(false);
    setPipelineStep('IDLE');
    setHeading(90);
    const res = runPathfinding('A*', startPos, goalPos, obstacles);
    setCurrentPath(res.path);
    setPathLength(res.pathLength);
  };

  const stepRoverOnce = () => {
    if (isEmergencyStopped || currentPath.length <= 1) return;
    const nextPoint = currentPath[1];
    setRoverPos(nextPoint);
    setDistanceTravelled((prev) => Number((prev + 0.5).toFixed(1)));
    const res = runPathfinding('A*', nextPoint, goalPos, obstacles);
    setCurrentPath(res.path);
    setPathLength(res.pathLength);
  };

  const addDetection = (newDet: Detection) => {
    setDetections((prev) => [newDet, ...prev.slice(0, 8)]);
  };

  const runBenchmark = (alg: AlgorithmType) => {
    return runPathfinding(alg, roverPos, goalPos, obstacles);
  };

  const activeTargetInView = backendDetections.some(
    (d) => (d.object || d.class || '').toLowerCase() === 'person'
  );

  return (
    <RoboticsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        backendUrl,
        setBackendUrl,
        backendConnected,
        setBackendConnected,
        lastSuccessfulPoll,
        apiStatus,
        apiNavigation,
        apiTelemetry,
        gridMatrix,
        backendDetections,
        gridSize: GRID_SIZE,
        startPos,
        goalPos,
        targetPos,
        roverPos,
        obstacles,
        currentPath,
        pathLength,
        nodesExplored,
        replans,
        planningTimeMs,
        heading,
        distanceTravelled,
        toggleObstacle,
        addObstacleInPath,
        clearObstacles,
        resetRover,
        setStartPos,
        setGoalPos,
        pipelineStep,
        missionState,
        missionTime,
        isEmergencyStopped,
        targetDetected,
        visionStatus,
        yoloStatus,
        navigationStatus,
        roverStatus,
        cameraStatus,
        startMission,
        stopMission,
        emergencyStop,
        resumeMission,
        stepRoverOnce,
        refreshAll,
        visionConnected: backendConnected,
        setVisionConnected: setBackendConnected,
        detections,
        addDetection,
        activeTargetInView,
        sensors: DEFAULT_SENSORS,
        telemetryHistory,
        selectedAlgorithm,
        setSelectedAlgorithm,
        runBenchmark,
      }}
    >
      {children}
    </RoboticsContext.Provider>
  );
}

export function useRobotics() {
  const context = useContext(RoboticsContext);
  if (!context) {
    throw new Error('useRobotics must be used within a RoboticsProvider');
  }
  return context;
}
