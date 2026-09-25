'use client';

import React from 'react';
import { useRobotics } from '@/lib/robotics-context';
import {
  Play,
  Square,
  OctagonAlert,
  CheckCircle2,
  Timer,
  Crosshair,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Compass,
  Radio,
  MapPin,
  Route,
} from 'lucide-react';

export function MissionView() {
  const {
    missionState,
    missionTime,
    isEmergencyStopped,
    targetDetected,
    startMission,
    stopMission,
    emergencyStop,
    resumeMission,
    resetRover,
    targetPos,
    roverPos,
    distanceTravelled,
    replans,
    heading,
    setActiveTab,
  } = useRobotics();

  // Format mission elapsed time T+MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `T+${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const missionStatesList = [
    { id: 'IDLE', label: 'IDLE', desc: 'Rover stationary, waiting for mission start command.' },
    { id: 'NAVIGATING', label: 'NAVIGATING', desc: 'Traversing calculated A* path toward search coordinates.' },
    { id: 'OBSTACLE_DETECTED', label: 'OBSTACLE_DETECTED', desc: 'Optical vision or rangefinder detected obstacle blocking trajectory.' },
    { id: 'REPLANNING', label: 'REPLANNING', desc: 'A* graph recalculation in progress to derive safe alternate path.' },
    { id: 'TARGET_DETECTED', label: 'TARGET_DETECTED', desc: 'Person detected in optical zone, rescue protocol initiated.' },
    { id: 'MISSION_COMPLETE', label: 'MISSION_COMPLETE', desc: 'Search and rescue objective successfully achieved.' },
    { id: 'EMERGENCY_STOP', label: 'EMERGENCY_STOP', desc: 'Hardware safety interlock engaged. All motion halted.' },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Mission Timer Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-tight">
              Search & Rescue Mission Control
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
              SAR COMMAND
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous mission state arbitration, target rescue protocol, and emergency safety interlocks
          </p>
        </div>

        {/* Mission Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0D121F] border border-slate-800 rounded font-mono text-xs">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">MISSION TIMER:</span>
            <span className="text-cyan-300 font-bold text-sm tabular-nums">
              {formatTime(missionTime)}
            </span>
          </div>

          <button
            onClick={resetRover}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors"
            title="Reset Mission Clock & State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Detection Banner (Required: Prototype Target Detection) */}
      <div className="p-4 bg-[#0A131B] border border-emerald-800/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-emerald-950 border border-emerald-700 text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                PROTOTYPE TARGET DETECTION
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              For the current prototype, a detected <strong className="text-emerald-300">&quot;person&quot;</strong> is treated as the rescue target. When located in the search sector, target acquisition flags the mission as complete.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <div
            className={`px-3 py-2 rounded border text-xs font-mono font-bold flex items-center gap-2 ${
              targetDetected
                ? 'bg-emerald-950 border-emerald-600 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${targetDetected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            {targetDetected ? 'TARGET ACQUIRED' : 'SEARCHING FOR TARGET'}
          </div>
        </div>
      </div>

      {/* Mission Key Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#0D121F] border border-slate-800 rounded-lg">
          <div className="text-slate-400 text-[10px] font-mono">MISSION STATUS</div>
          <div className="mt-1 text-base font-mono font-bold text-cyan-300 truncate">
            {missionState}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">Active State</div>
        </div>

        <div className="p-3.5 bg-[#0D121F] border border-slate-800 rounded-lg">
          <div className="text-slate-400 text-[10px] font-mono">TARGET COORDS</div>
          <div className="mt-1 text-base font-mono font-bold text-amber-300">
            [{targetPos.x}, {targetPos.y}]
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">Rescue Target Sector</div>
        </div>

        <div className="p-3.5 bg-[#0D121F] border border-slate-800 rounded-lg">
          <div className="text-slate-400 text-[10px] font-mono">ROVER POSITION</div>
          <div className="mt-1 text-base font-mono font-bold text-slate-200">
            [{roverPos.x}, {roverPos.y}]
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">Heading: {heading}°</div>
        </div>

        <div className="p-3.5 bg-[#0D121F] border border-slate-800 rounded-lg">
          <div className="text-slate-400 text-[10px] font-mono">DISTANCE / REPLANS</div>
          <div className="mt-1 text-base font-mono font-bold text-slate-200">
            {distanceTravelled.toFixed(1)}m <span className="text-xs text-slate-400">/ {replans} replans</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">Simulated displacement</div>
        </div>
      </div>

      {/* Main Dual Section: Mission Operational Controls + Mission State Hierarchy (NO DUPLICATE GRID!) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mission Command Execution Console */}
        <div className="lg:col-span-5 p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-4">
          <div className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>Mission Controls</span>
            <span className="text-[10px] text-slate-400 font-normal">Command Subsystem</span>
          </div>

          <div className="space-y-3">
            {/* Start / Stop Toggle */}
            {missionState === 'NAVIGATING' ? (
              <button
                onClick={stopMission}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-bold text-amber-200 bg-amber-950/70 border border-amber-600 rounded hover:bg-amber-900/80 transition-colors"
              >
                <Square className="w-4 h-4 fill-current" />
                STOP MISSION
              </button>
            ) : (
              <button
                onClick={startMission}
                disabled={isEmergencyStopped}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded disabled:opacity-40 transition-colors shadow"
              >
                <Play className="w-4 h-4 fill-current" />
                START MISSION
              </button>
            )}

            {/* Emergency Stop Button (Immediately puts rover into EMERGENCY_STOP, locks until resume) */}
            {isEmergencyStopped ? (
              <button
                onClick={resumeMission}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-bold text-amber-200 bg-amber-950 border border-amber-500 rounded hover:bg-amber-900 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                RESUME FROM EMERGENCY STOP
              </button>
            ) : (
              <button
                onClick={emergencyStop}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-bold text-rose-100 bg-rose-950 border border-rose-600 rounded hover:bg-rose-900 transition-colors"
              >
                <OctagonAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                EMERGENCY STOP
              </button>
            )}
          </div>

          {/* Safety Interlock Notice */}
          {isEmergencyStopped && (
            <div className="p-3 bg-rose-950/70 border border-rose-700 rounded text-xs font-mono text-rose-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                EMERGENCY_STOP ACTIVE
              </div>
              <div className="text-[11px] text-rose-300/80 leading-relaxed">
                Emergency stop immediately halted the rover simulation. Movement remains frozen until explicitly resumed by the operator.
              </div>
            </div>
          )}

          {/* Navigation Linkout */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('navigation')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono text-cyan-300 bg-cyan-950/50 hover:bg-cyan-950/80 border border-cyan-800/80 rounded transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Open 12×12 Occupancy Grid View</span>
            </button>
          </div>
        </div>

        {/* Right: Mission States Architecture Breakdown */}
        <div className="lg:col-span-7 p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-3">
          <div className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2">
            Mission State Hierarchy
          </div>

          <div className="space-y-2">
            {missionStatesList.map((stateItem) => {
              const isActive = missionState === stateItem.id;
              return (
                <div
                  key={stateItem.id}
                  className={`p-2.5 rounded border text-xs font-mono transition-colors ${
                    isActive
                      ? 'bg-cyan-950/60 border-cyan-600 text-cyan-200 shadow-sm'
                      : 'bg-[#0E131F] border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className={isActive ? 'text-cyan-300' : 'text-slate-300'}>
                      {stateItem.label}
                    </span>
                    <span className="text-[10px]">
                      {isActive ? '● CURRENT' : '○ READY'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">
                    {stateItem.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
