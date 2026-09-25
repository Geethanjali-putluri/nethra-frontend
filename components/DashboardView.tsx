'use client';

import React from 'react';
import { useRobotics } from '@/lib/robotics-context';
import { DebugPanel } from './DebugPanel';
import {
  Play,
  Square,
  OctagonAlert,
  ArrowRight,
  Eye,
  Compass,
  Radio,
  MapPin,
  Route,
  ShieldAlert,
  Milestone,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Layers,
  Cpu,
  Camera,
  Activity,
  AlertCircle,
  WifiOff,
  Wifi,
} from 'lucide-react';

export function DashboardView() {
  const {
    missionState,
    roverPos,
    heading,
    distanceTravelled,
    obstacles,
    replans,
    pathLength,
    isEmergencyStopped,
    startMission,
    stopMission,
    emergencyStop,
    resumeMission,
    resetRover,
    setActiveTab,
    backendConnected,
    setBackendConnected,
    backendUrl,
    setBackendUrl,
    refreshAll,
    apiStatus,
    visionStatus,
    yoloStatus,
    navigationStatus,
    roverStatus,
    currentPath,
  } = useRobotics();

  const [showUrlConfig, setShowUrlConfig] = React.useState<boolean>(false);
  const [urlInput, setUrlInput] = React.useState<string>(backendUrl);

  const pipelineStages = [
    { name: 'VISION', sub: 'Phone Camera Feed', icon: Camera },
    { name: 'PERCEPTION', sub: 'YOLO11 Detection', icon: Eye },
    { name: 'OBSTACLE MAPPING', sub: 'Occupancy Grid', icon: Layers },
    { name: 'A* PLANNING', sub: 'Heuristic Solver', icon: Compass },
    { name: 'ROVER NAVIGATION', sub: 'Simulated Kinematics', icon: Cpu },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Hero / Header Section */}
      <div className="p-6 bg-gradient-to-b from-[#0D1322] to-[#0A0E1A] border border-slate-800 rounded-xl relative overflow-hidden">
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-slate-100 tracking-wider uppercase">
                NETHRA
              </h1>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-semibold">
                Autonomous Search & Rescue UGV
              </span>
            </div>

            <p className="text-sm font-medium text-cyan-200/90 font-mono">
              Autonomous perception, path planning and search & rescue navigation system.
            </p>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              NETHRA combines real-time computer vision using YOLO, grid-based obstacle mapping and A* path planning to simulate autonomous search-and-rescue navigation.
            </p>
          </div>

          {/* Backend Connection Indicator & URL Configuration */}
          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">PYTHON BACKEND:</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${
                  backendConnected
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-800 text-rose-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendConnected ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'
                  }`}
                />
                {backendConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                {backendUrl}
              </span>
              <button
                onClick={() => {
                  setShowUrlConfig(!showUrlConfig);
                  setUrlInput(backendUrl);
                }}
                className="text-[11px] font-mono px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded transition-colors"
              >
                {showUrlConfig ? 'Close' : 'Config URL'}
              </button>
              <button
                onClick={() => refreshAll()}
                className="text-[11px] font-mono px-2 py-0.5 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700 rounded transition-colors"
                title="Poll backend immediately"
              >
                Refresh
              </button>
            </div>

            {showUrlConfig && (
              <div className="mt-1 p-2.5 bg-[#090D18] border border-slate-700 rounded text-xs font-mono space-y-2">
                <div className="text-[10px] text-slate-400">Flask Backend Base URL:</div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://nethra-api-aemt.onrender.com"
                    className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-200 w-48 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => {
                      setBackendUrl(urlInput);
                      setShowUrlConfig(false);
                      refreshAll();
                    }}
                    className="px-2.5 py-1 bg-cyan-500 text-slate-950 font-bold rounded hover:bg-cyan-400"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Prominent Mission Pipeline Flow Visualization */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">
            Mission Dataflow Pipeline
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.name}
                  className="p-3 bg-[#070A12]/90 border border-slate-800/90 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-200">{stage.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{stage.sub}</div>
                    </div>
                  </div>
                  {idx < pipelineStages.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden lg:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Three Main Action Buttons (Required by Prompt) */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (missionState === 'IDLE' && !isEmergencyStopped) {
                startMission();
              }
              setActiveTab('mission');
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded shadow-md transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            START MISSION
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium text-slate-200 bg-[#0E1424] hover:bg-slate-800 border border-slate-700 rounded transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            VIEW LIVE VISION
          </button>

          <button
            onClick={() => setActiveTab('navigation')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium text-slate-200 bg-[#0E1424] hover:bg-slate-800 border border-slate-700 rounded transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            VIEW NAVIGATION
          </button>
        </div>
      </div>

      {/* Real Prototype System Status Indicators - Values mapped directly from /api/status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Vision Status */}
        <div className="p-3 bg-[#0D121F] border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-400">VISION STATUS</div>
            <div className={`font-bold mt-0.5 ${backendConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
              {backendConnected ? (apiStatus?.vision || visionStatus || 'LIVE / WORKING') : '--'}
            </div>
          </div>
          <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400' : 'bg-slate-700'}`} />
        </div>

        {/* YOLO Status */}
        <div className="p-3 bg-[#0D121F] border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-400">YOLO STATUS</div>
            <div className={`font-bold mt-0.5 ${backendConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
              {backendConnected ? (apiStatus?.yolo || yoloStatus || 'LIVE / WORKING') : '--'}
            </div>
          </div>
          <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400' : 'bg-slate-700'}`} />
        </div>

        {/* Navigation Status */}
        <div className="p-3 bg-[#0D121F] border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-400">NAVIGATION STATUS</div>
            <div className={`font-bold mt-0.5 ${backendConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
              {backendConnected ? (apiStatus?.navigation || navigationStatus || 'LIVE / WORKING') : '--'}
            </div>
          </div>
          <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400' : 'bg-slate-700'}`} />
        </div>

        {/* Rover Status */}
        <div className="p-3 bg-[#0D121F] border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-400">ROVER STATUS</div>
            <div className={`font-bold mt-0.5 ${backendConnected ? 'text-amber-400' : 'text-slate-500'}`}>
              {backendConnected ? (apiStatus?.rover || roverStatus || 'SIMULATION') : '--'}
            </div>
          </div>
          <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-amber-400' : 'bg-slate-700'}`} />
        </div>
      </div>

      {/* Telemetry Cards - Strict Data Rule: If backend disconnected, live values show "--" */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>REAL-TIME TELEMETRY MATRIX</span>
          <span className="text-[10px] text-slate-500">
            {backendConnected ? 'Backend Source: Connected' : 'Backend Source: DISCONNECTED (Simulated preview available in Navigation)'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Rover Position -> rover_position */}
          <div className="p-3.5 bg-[#0A0D15] border border-slate-800 rounded-lg">
            <div className="text-slate-400 text-[10px] font-mono">ROVER POSITION</div>
            <div className="mt-1 text-xl font-mono font-bold text-slate-100 tabular-nums">
              {backendConnected
                ? apiStatus?.rover_position
                  ? Array.isArray(apiStatus.rover_position)
                    ? `[${apiStatus.rover_position[0]}, ${apiStatus.rover_position[1]}]`
                    : typeof apiStatus.rover_position === 'object'
                    ? `[${(apiStatus.rover_position as any).x}, ${(apiStatus.rover_position as any).y}]`
                    : String(apiStatus.rover_position)
                  : `[${roverPos.x}, ${roverPos.y}]`
                : '--'}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              {backendConnected ? `Heading: ${heading}°` : 'Hardware N/A'}
            </div>
          </div>

          {/* Current State -> state */}
          <div className="p-3.5 bg-[#0A0D15] border border-slate-800 rounded-lg">
            <div className="text-slate-400 text-[10px] font-mono">CURRENT STATE</div>
            <div className="mt-1 text-sm font-mono font-bold text-cyan-300 truncate">
              {backendConnected ? (apiStatus?.state || missionState) : '--'}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">SAR Controller</div>
          </div>

          {/* Obstacles -> obstacles */}
          <div className="p-3.5 bg-[#0A0D15] border border-slate-800 rounded-lg">
            <div className="text-slate-400 text-[10px] font-mono">OBSTACLES</div>
            <div className="mt-1 text-xl font-mono font-bold text-slate-100 tabular-nums">
              {backendConnected
                ? apiStatus?.obstacles !== undefined
                  ? Array.isArray(apiStatus.obstacles)
                    ? apiStatus.obstacles.length
                    : apiStatus.obstacles
                  : obstacles.size
                : '--'}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Grid Obstacles</div>
          </div>

          {/* Replans -> replans */}
          <div className="p-3.5 bg-[#0A0D15] border border-slate-800 rounded-lg">
            <div className="text-slate-400 text-[10px] font-mono">REPLANS</div>
            <div className="mt-1 text-xl font-mono font-bold text-amber-400 tabular-nums">
              {backendConnected
                ? apiStatus?.replans !== undefined
                  ? apiStatus.replans
                  : replans
                : '--'}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Trajectory Updates</div>
          </div>

          {/* Distance Travelled -> distance */}
          <div className="p-3.5 bg-[#0A0D15] border border-slate-800 rounded-lg">
            <div className="text-slate-400 text-[10px] font-mono">DISTANCE TRAVELLED</div>
            <div className="mt-1 text-xl font-mono font-bold text-slate-100 tabular-nums">
              {backendConnected
                ? apiStatus?.distance !== undefined
                  ? `${Number(apiStatus.distance).toFixed(1)} m`
                  : `${distanceTravelled.toFixed(1)} m`
                : '--'}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Wheel Odometry N/A</div>
          </div>

          {/* Path Length -> path_length */}
          <div className="p-3.5 bg-[#0A0D15] border border-slate-800 rounded-lg">
            <div className="text-slate-400 text-[10px] font-mono">PATH LENGTH</div>
            <div className="mt-1 text-xl font-mono font-bold text-cyan-400 tabular-nums">
              {backendConnected
                ? apiStatus?.path_length !== undefined
                  ? `${apiStatus.path_length} nodes`
                  : pathLength > 0
                  ? `${pathLength} nodes`
                  : '--'
                : '--'}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Active Path</div>
          </div>
        </div>
      </div>

      {/* Main Dual View: Compact Navigation Preview + Mission Operations Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simplified Navigation Preview (NOT A FULL DUPLICATE LARGE GRID!) */}
        <div className="lg:col-span-7 p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                Simplified Navigation Preview
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('navigation')}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>Full 12×12 Grid</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Compact Mini Grid Representation (6x6 Abstracted Waypoint Map) */}
          <div className="p-4 bg-[#070A11] border border-slate-800 rounded-lg flex flex-col items-center justify-center">
            <div className="grid grid-cols-6 gap-1.5 p-2 bg-[#0A0E18] border border-slate-800/80 rounded">
              {Array.from({ length: 36 }).map((_, i) => {
                const x = i % 6;
                const y = Math.floor(i / 6);
                const isStart = x === 0 && y === 0;
                const isGoal = x === 5 && y === 5;
                const isRover = Math.floor(roverPos.x / 2) === x && Math.floor(roverPos.y / 2) === y;
                const isPath = (x === y || (x === y + 1 && x < 5)) && !isRover && !isStart && !isGoal;

                return (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-[2px] flex items-center justify-center text-[10px] font-mono font-bold border transition-colors ${
                      isRover
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400/40 shadow-sm'
                        : isGoal
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : isStart
                        ? 'bg-blue-600 text-white border-blue-400'
                        : isPath
                        ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60'
                        : 'bg-[#0E131F] text-slate-700 border-slate-800/60'
                    }`}
                  >
                    {isRover ? 'R' : isGoal ? 'G' : isStart ? 'S' : isPath ? '·' : ''}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-blue-600" /> Start
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-cyan-500" /> Rover
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600" /> Goal
              </span>
              <span className="text-slate-500">| Full 12×12 matrix available on Navigation page</span>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 leading-relaxed">
            The rover advances along the calculated A* trajectory. If a dynamic obstacle is detected by the vision stream, the path planning core executes an instantaneous re-route.
          </div>
        </div>

        {/* Mission Control Substation */}
        <div className="lg:col-span-5 p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
              Autonomous Mission Control
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Command Suite
            </span>
          </div>

          {/* Action Button Set */}
          <div className="space-y-2.5">
            {missionState === 'NAVIGATING' ? (
              <button
                onClick={stopMission}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-bold text-amber-200 bg-amber-950/70 border border-amber-600 rounded hover:bg-amber-900/80 transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                PAUSE SIMULATION
              </button>
            ) : (
              <button
                onClick={startMission}
                disabled={isEmergencyStopped}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded disabled:opacity-40 transition-colors shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                START AUTONOMOUS MISSION
              </button>
            )}

            {isEmergencyStopped ? (
              <button
                onClick={resumeMission}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono font-bold text-amber-200 bg-amber-950 border border-amber-500 rounded hover:bg-amber-900 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                RESUME ROVER
              </button>
            ) : (
              <button
                onClick={emergencyStop}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono font-bold text-rose-100 bg-rose-950/90 border border-rose-600 rounded hover:bg-rose-900 transition-colors"
              >
                <OctagonAlert className="w-4 h-4 text-rose-400" />
                EMERGENCY STOP (E-STOP)
              </button>
            )}

            <button
              onClick={resetRover}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Rover & Environment
            </button>
          </div>

          {/* Reality Audit Summary */}
          <div className="p-3 bg-[#070A11] border border-slate-800 rounded text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              System Architecture Notice
            </div>
            <div className="leading-relaxed">
              Phone camera + laptop computer vision + rover kinematics simulation. Physical motors, ESP32, and ultrasonic hardware are unpopulated in the current prototype.
            </div>
          </div>
        </div>
      </div>

      {/* Temporary Debug Audit Panel placed at the bottom of the dashboard */}
      <DebugPanel />
    </div>
  );
}
