'use client';

import React, { useState } from 'react';
import { useRobotics } from '@/lib/robotics-context';
import { OccupancyGrid } from './OccupancyGrid';
import {
  Compass,
  Play,
  Square,
  PlusCircle,
  OctagonAlert,
  RotateCcw,
  Trash2,
  ArrowDown,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Milestone,
  MapPin,
  Route,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

export function NavigationView() {
  const {
    pathLength,
    nodesExplored,
    replans,
    missionState,
    planningTimeMs,
    pipelineStep,
    addObstacleInPath,
    clearObstacles,
    resetRover,
    roverPos,
    goalPos,
    startPos,
    currentPath,
    startMission,
    stopMission,
    emergencyStop,
    resumeMission,
    isEmergencyStopped,
    distanceTravelled,
    backendConnected,
  } = useRobotics();

  // Mode state for clicking to add obstacles
  const [placementMode, setPlacementMode] = useState<boolean>(true);

  // Derive human-readable display status matching specification
  const getDisplayStatus = () => {
    if (isEmergencyStopped || missionState === 'EMERGENCY_STOP') return 'EMERGENCY_STOP';
    if (missionState === 'NAVIGATING') return 'NAVIGATING';
    if (missionState === 'STOPPED') return 'STOPPED';
    if (missionState === 'REPLANNING') return 'REPLANNING';
    if (missionState === 'OBSTACLE_DETECTED') return 'OBSTACLE_DETECTED';
    if (missionState === 'TARGET_DETECTED') return 'TARGET_DETECTED';
    if (missionState === 'MISSION_COMPLETE') return 'MISSION_COMPLETE';
    if (missionState === 'NO_SAFE_PATH') return 'NO_SAFE_PATH';
    return 'READY';
  };

  const currentStatus = getDisplayStatus();

  const pipelineSteps = [
    { id: 'OBSTACLE_ADDED', label: 'OBSTACLE ADDED' },
    { id: 'GRID_UPDATED', label: 'GRID UPDATED' },
    { id: 'A_STAR_REPLANNING', label: 'A* REPLANNING' },
    { id: 'NEW_PATH', label: 'NEW PATH' },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Simulation Mode Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-tight">
              Autonomous Navigation & Occupancy Grid
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">
              SIMULATION MODE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Full 12×12 discrete spatial representation with real-time heuristic A* path planning
          </p>
        </div>

        {/* Quick Utility Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearObstacles}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors"
            title="Remove all obstacles from the arena"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            CLEAR OBSTACLES
          </button>

          <button
            onClick={resetRover}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800 rounded hover:bg-cyan-900/60 transition-colors"
            title="Reset rover coordinates to start"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            RESET POSITION
          </button>
        </div>
      </div>

      {/* Main Side-by-Side Arena Layout: 12x12 Grid on Left, Simulation Control on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 12x12 Occupancy Grid */}
        <div className="lg:col-span-7 xl:col-span-7 p-5 bg-[#0A0D16] border border-slate-800 rounded-xl flex flex-col items-center shadow-lg">
          <div className="w-full flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">12×12 OCCUPANCY GRID</span>
            </div>
            <span className={`text-[11px] font-medium transition-colors ${placementMode ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
              {placementMode ? '● Click any empty cell to place obstacle' : 'Click cell to toggle'}
            </span>
          </div>

          {/* The 12x12 Grid */}
          <OccupancyGrid interactive={true} size="standard" showLegend={true} />

          {/* Active Path Waypoints Summary */}
          <div className="w-full mt-4 pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Active Waypoints ({currentPath.length} steps):</span>
              <span className="text-cyan-400">Planner: A* 4-Connected</span>
            </div>
            <div className="p-2.5 bg-[#070A11] border border-slate-800/80 rounded max-h-20 overflow-y-auto text-xs font-mono text-cyan-300 flex flex-wrap gap-1.5">
              {currentPath.map((pt, idx) => (
                <span key={idx} className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded text-slate-300 text-[10px]">
                  {idx}:[{pt.x},{pt.y}]
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: ROVER SIMULATION CONTROL Panel (Directly Beside Grid) */}
        <div className="lg:col-span-5 xl:col-span-5 p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-5 shadow-lg">
          {/* Panel Header */}
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              ROVER SIMULATION CONTROL
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Interactive
            </span>
          </div>

          {/* Action Button Set: [ ▶ START ] [ ■ STOP ] */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Kinematic Motion Controls
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (isEmergencyStopped) {
                    resumeMission();
                  } else {
                    startMission();
                  }
                }}
                disabled={missionState === 'NAVIGATING'}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-bold rounded transition-all shadow-sm ${
                  missionState === 'NAVIGATING'
                    ? 'bg-emerald-950 text-emerald-500 border border-emerald-800 opacity-60 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-[0.98]'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                ▶ START
              </button>

              <button
                onClick={stopMission}
                disabled={missionState === 'STOPPED' || missionState === 'IDLE'}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-bold rounded border transition-all ${
                  missionState === 'STOPPED'
                    ? 'bg-slate-900 border-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-950 hover:bg-amber-900/80 text-amber-200 border-amber-600 active:scale-[0.98]'
                }`}
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                ■ STOP
              </button>
            </div>
          </div>

          {/* Obstacle Controls: [ + ADD OBSTACLE ] */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Dynamic Obstacle Insertion
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => setPlacementMode(!placementMode)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-mono font-bold rounded border transition-all ${
                  placementMode
                    ? 'bg-amber-950/70 border-amber-500 text-amber-200 ring-1 ring-amber-400/50 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                + ADD OBSTACLE {placementMode ? '(ACTIVE)' : ''}
              </button>

              <button
                onClick={addObstacleInPath}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-mono font-medium rounded border bg-rose-950/50 hover:bg-rose-900/60 border-rose-800 text-rose-200 transition-colors"
                title="Inject dynamic obstacle directly on current path"
              >
                <Milestone className="w-3.5 h-3.5 text-rose-400" />
                INJECT ON PATH
              </button>
            </div>

            <p className="text-[11px] font-mono text-slate-400 leading-tight">
              {placementMode
                ? 'Placement mode enabled. Click any empty grid cell to add an obstacle; A* will automatically re-route.'
                : 'Click + ADD OBSTACLE to toggle obstacle placement mode.'}
            </p>
          </div>

          {/* Replanning Progression Event Pipeline (Required: OBSTACLE ADDED -> GRID UPDATED -> A* REPLANNING -> NEW PATH) */}
          <div className="p-3 bg-[#070A11] border border-slate-800 rounded-lg space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Dynamic Re-Routing Flow</span>
              <span className="text-[10px] text-cyan-400">Autonomous</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {pipelineSteps.map((step, idx) => {
                const isCurrent =
                  pipelineStep === step.id ||
                  (step.id === 'OBSTACLE_ADDED' && pipelineStep === 'OBSTACLE_DETECTED');

                return (
                  <div
                    key={step.id}
                    className={`p-2 rounded border text-center font-mono text-[10px] transition-all flex items-center justify-center gap-1 ${
                      isCurrent
                        ? 'bg-amber-950 border-amber-400 text-amber-200 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                        : 'bg-[#0E131F] border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Structured Telemetry Status Readout Block (Matching requested diagram format) */}
          <div className="p-4 bg-[#070A11] border border-slate-800 rounded-lg space-y-2 font-mono text-xs">
            <div className="text-[10px] uppercase text-slate-400 font-semibold border-b border-slate-800 pb-1.5">
              Rover Telemetry Readout
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">STATUS:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                  currentStatus === 'NAVIGATING'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700 animate-pulse'
                    : currentStatus === 'STOPPED'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : currentStatus === 'REPLANNING' || currentStatus === 'OBSTACLE_DETECTED'
                    ? 'bg-amber-950 text-amber-200 border-amber-500 animate-bounce'
                    : currentStatus === 'EMERGENCY_STOP'
                    ? 'bg-rose-950 text-rose-200 border-rose-600'
                    : 'bg-slate-900 text-slate-300 border-slate-700'
                }`}
              >
                {currentStatus}
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">ROVER:</span>
              <span className="font-bold text-slate-100 tabular-nums">
                ({roverPos.x},{roverPos.y})
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">GOAL:</span>
              <span className="font-bold text-emerald-400 tabular-nums">
                ({goalPos.x},{goalPos.y})
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">PATH LENGTH:</span>
              <span className="font-bold text-cyan-400 tabular-nums">
                {pathLength > 0 ? `${pathLength} nodes` : '--'}
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">REPLANS:</span>
              <span className="font-bold text-amber-400 tabular-nums">
                {replans !== undefined ? replans : '--'}
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-400">DISTANCE:</span>
              <span className="font-bold text-emerald-400 tabular-nums">
                {backendConnected ? `${distanceTravelled.toFixed(1)} m` : `${distanceTravelled.toFixed(1)} m`}
              </span>
            </div>
          </div>

          {/* Emergency Safety Action Button (Required by prompt) */}
          <div className="pt-1">
            {isEmergencyStopped ? (
              <button
                onClick={resumeMission}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono font-bold text-amber-200 bg-amber-950 border border-amber-500 rounded hover:bg-amber-900 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                RESUME FROM EMERGENCY STOP
              </button>
            ) : (
              <button
                onClick={emergencyStop}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono font-bold text-rose-100 bg-rose-950 hover:bg-rose-900 border border-rose-600 rounded transition-colors"
              >
                <OctagonAlert className="w-3.5 h-3.5 text-rose-400" />
                EMERGENCY STOP (HALT ROVER)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
