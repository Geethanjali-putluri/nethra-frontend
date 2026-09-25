'use client';

import React from 'react';
import { useRobotics } from '@/lib/robotics-context';
import { OctagonAlert, RotateCcw, Play, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

export function Header({ activeTab }: HeaderProps) {
  const {
    missionState,
    isEmergencyStopped,
    emergencyStop,
    resumeMission,
    startMission,
    resetRover,
    backendConnected,
    backendUrl,
    visionStatus,
    yoloStatus,
    navigationStatus,
    roverStatus,
  } = useRobotics();

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0B0F19]/95 backdrop-blur px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark + Backend Indicator */}
      <div className="flex items-center gap-3">
        <a href="#dashboard" className="text-lg font-bold tracking-wider text-slate-100 uppercase font-mono">
          NETHRA
        </a>
        <span className="hidden sm:inline text-xs text-slate-500 font-mono">
          / Search & Rescue UGV
        </span>

        {/* Small Backend Indicator (Required by prompt) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded font-mono text-xs">
          <span className="text-slate-400 text-[10px]">PYTHON BACKEND:</span>
          {backendConnected ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              CONNECTED
            </span>
          ) : (
            <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              DISCONNECTED
            </span>
          )}
        </div>
      </div>

      {/* Zone 2: System Status & Live State from /api/status */}
      <div className="hidden xl:flex items-center gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
          <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
          <span className="text-slate-400">VISION:</span>
          <span className={backendConnected ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
            {backendConnected ? visionStatus : '--'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
          <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
          <span className="text-slate-400">YOLO:</span>
          <span className={backendConnected ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
            {backendConnected ? yoloStatus : '--'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
          <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
          <span className="text-slate-400">A*:</span>
          <span className={backendConnected ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
            {backendConnected ? navigationStatus : '--'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
          <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-amber-400' : 'bg-slate-600'}`}></span>
          <span className="text-slate-400">ROVER:</span>
          <span className={backendConnected ? 'text-amber-300 font-medium' : 'text-slate-400'}>
            {backendConnected ? roverStatus : '--'}
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        {missionState === 'EMERGENCY_STOP' || isEmergencyStopped ? (
          <button
            onClick={resumeMission}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-200 bg-amber-900/40 border border-amber-600 rounded hover:bg-amber-900/60 transition-colors whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            RESUME ROVER
          </button>
        ) : (
          <button
            onClick={emergencyStop}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-100 bg-rose-950 border border-rose-600 rounded hover:bg-rose-900 transition-colors whitespace-nowrap"
            title="Immediate emergency kill switch"
          >
            <OctagonAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            EMERGENCY STOP
          </button>
        )}

        {missionState === 'IDLE' && (
          <button
            onClick={startMission}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-200 bg-cyan-950/80 border border-cyan-700/80 rounded hover:bg-cyan-900/80 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            START MISSION
          </button>
        )}

        <button
          onClick={resetRover}
          className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900/80 border border-slate-800 rounded hover:bg-slate-800 transition-colors"
          title="Reset Rover & Telemetry"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
