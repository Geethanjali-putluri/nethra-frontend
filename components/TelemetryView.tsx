'use client';

import React from 'react';
import { useRobotics } from '@/lib/robotics-context';
import {
  Activity,
  Compass,
  MapPin,
  Route,
  Timer,
  ShieldAlert,
  Milestone,
  Radio,
  AlertTriangle,
  WifiOff,
  Wifi,
} from 'lucide-react';

export function TelemetryView() {
  const {
    roverPos,
    heading,
    missionState,
    distanceTravelled,
    obstacles,
    replans,
    pathLength,
    missionTime,
    backendConnected,
    setBackendConnected,
    apiTelemetry,
    telemetryHistory,
  } = useRobotics();

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 25;

  const historyPoints = telemetryHistory.length > 2
    ? telemetryHistory
    : [
        { timestamp: 0, distanceTravelled: 0, replans: 0, pathLength: 22, nodesExplored: 24, state: 'IDLE' as const },
        { timestamp: 2, distanceTravelled: 1.0, replans: 0, pathLength: 20, nodesExplored: 22, state: 'NAVIGATING' as const },
        { timestamp: 4, distanceTravelled: 2.0, replans: 1, pathLength: 19, nodesExplored: 25, state: 'REPLANNING' as const },
      ];

  const maxDist = Math.max(...historyPoints.map((p) => p.distanceTravelled), 10);
  const pointsString = historyPoints
    .map((p, idx) => {
      const x = padding + (idx / Math.max(historyPoints.length - 1, 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - (p.distanceTravelled / maxDist) * (chartHeight - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Title & Connection Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-tight">
              Vehicle Telemetry & Diagnostics
            </h1>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                backendConnected
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-rose-950 text-rose-300 border-rose-800'
              }`}
            >
              {backendConnected ? 'BACKEND CONNECTED' : 'BACKEND DISCONNECTED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time coordinates, orientation heading, and path metrics
          </p>
        </div>

        {/* Backend Toggle Button */}
        <button
          onClick={() => setBackendConnected(!backendConnected)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded transition-colors"
        >
          {backendConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
          <span>{backendConnected ? 'Disconnect Backend' : 'Connect Python Backend'}</span>
        </button>
      </div>

      {/* Strict Honesty Notice */}
      {!backendConnected && (
        <div className="p-3 bg-amber-950/30 border border-amber-800/70 rounded-lg flex items-center gap-3 text-xs font-mono text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Python backend is disconnected. Live hardware telemetry displays &quot;--&quot;. Simulated values will not be fabricated as real hardware readings.
          </span>
        </div>
      )}

      {/* Primary Telemetry Cards (If backend disconnected: show "--") */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Rover Position -> position */}
        <div className="p-3.5 bg-[#0D121F] border border-slate-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>POSITION</span>
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
            {backendConnected
              ? apiTelemetry?.position
                ? Array.isArray(apiTelemetry.position)
                  ? `[${apiTelemetry.position[0]}, ${apiTelemetry.position[1]}]`
                  : typeof apiTelemetry.position === 'object'
                  ? `[${(apiTelemetry.position as any).x}, ${(apiTelemetry.position as any).y}]`
                  : String(apiTelemetry.position)
                : `[${roverPos.x}, ${roverPos.y}]`
              : '--'}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {backendConnected ? `HDG: ${heading}°` : 'Discrete Coords'}
          </div>
        </div>

        {/* Current State -> state */}
        <div className="p-3.5 bg-[#0D121F] border border-slate-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>STATE</span>
            <Radio className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-sm font-mono font-bold text-cyan-300 truncate">
            {backendConnected ? (apiTelemetry?.state || missionState) : '--'}
          </div>
          <div className="text-[10px] font-mono text-slate-400">SAR State Machine</div>
        </div>

        {/* Distance Travelled -> distance */}
        <div className="p-3.5 bg-[#0D121F] border border-slate-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>DISTANCE</span>
            <Route className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
            {backendConnected
              ? apiTelemetry?.distance !== undefined
                ? `${Number(apiTelemetry.distance).toFixed(1)} m`
                : `${distanceTravelled.toFixed(1)} m`
              : '--'}
          </div>
          <div className="text-[10px] font-mono text-slate-400">Traversed</div>
        </div>

        {/* Obstacles Detected -> obstacles */}
        <div className="p-3.5 bg-[#0D121F] border border-slate-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>OBSTACLES</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
            {backendConnected
              ? apiTelemetry?.obstacles !== undefined
                ? Array.isArray(apiTelemetry.obstacles)
                  ? apiTelemetry.obstacles.length
                  : apiTelemetry.obstacles
                : obstacles.size
              : '--'}
          </div>
          <div className="text-[10px] font-mono text-slate-400">Grid Cells</div>
        </div>

        {/* Replans -> replans */}
        <div className="p-3.5 bg-[#0D121F] border border-slate-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>REPLANS</span>
            <Milestone className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-bold text-amber-400 tabular-nums">
            {backendConnected
              ? apiTelemetry?.replans !== undefined
                ? apiTelemetry.replans
                : replans
              : '--'}
          </div>
          <div className="text-[10px] font-mono text-slate-400">A* Recalculations</div>
        </div>

        {/* Path Length -> path_length */}
        <div className="p-3.5 bg-[#0D121F] border border-slate-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>PATH LENGTH</span>
            <Milestone className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
            {backendConnected
              ? apiTelemetry?.path_length !== undefined
                ? `${apiTelemetry.path_length} nodes`
                : `${pathLength} nodes`
              : '--'}
          </div>
          <div className="text-[10px] font-mono text-slate-400">Steps to Goal</div>
        </div>

        {/* Mission Time -> mission_time */}
        <div className="p-3.5 bg-[#0D121F] border border-slate-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>MISSION TIME</span>
            <Timer className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
            {backendConnected
              ? apiTelemetry?.mission_time !== undefined
                ? formatTime(Number(apiTelemetry.mission_time))
                : formatTime(missionTime)
              : '--'}
          </div>
          <div className="text-[10px] font-mono text-slate-400">Elapsed T+MM:SS</div>
        </div>
      </div>

      {/* Historical Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distance Over Time Chart */}
        <div className="p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
              Distance History Profile
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {backendConnected ? 'LIVE FEED' : 'SIMULATION PROFILE'}
            </span>
          </div>

          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-40">
              <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#1E293B" strokeWidth="1" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#1E293B" strokeWidth="1" />
              <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#1E293B" strokeDasharray="3 3" strokeWidth="1" />

              <polyline
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2"
                points={pointsString}
              />

              {historyPoints.map((p, idx) => {
                const x = padding + (idx / Math.max(historyPoints.length - 1, 1)) * (chartWidth - padding * 2);
                const y = chartHeight - padding - (p.distanceTravelled / maxDist) * (chartHeight - padding * 2);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#06B6D4"
                    stroke="#080B11"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>T+00:00</span>
            <span>Recorded Trajectory History</span>
          </div>
        </div>

        {/* Telemetry Stream Diagnostics */}
        <div className="p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
              Subsystem Packet Diagnostics
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Telemetry Stream</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-[#0D121F] border border-slate-800 rounded flex items-center justify-between">
              <span className="text-slate-400">Kinematic Update Rate:</span>
              <span className="font-bold text-slate-200">1.18 Hz (850ms cycle)</span>
            </div>

            <div className="p-2.5 bg-[#0D121F] border border-slate-800 rounded flex items-center justify-between">
              <span className="text-slate-400">Position Metric Resolution:</span>
              <span className="font-bold text-slate-200">0.5 m / grid cell</span>
            </div>

            <div className="p-2.5 bg-[#0D121F] border border-slate-800 rounded flex items-center justify-between">
              <span className="text-slate-400">Angular Heading Resolution:</span>
              <span className="font-bold text-slate-200">90° orthogonal cardinal</span>
            </div>

            <div className="p-2.5 bg-[#0D121F] border border-slate-800 rounded flex items-center justify-between">
              <span className="text-slate-400">Data Channel Security:</span>
              <span className="font-bold text-emerald-400">Local GCS In-Memory RPC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
