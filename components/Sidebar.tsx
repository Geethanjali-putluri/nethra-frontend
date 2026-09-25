'use client';

import React from 'react';
import {
  LayoutDashboard,
  Eye,
  Compass,
  Crosshair,
  Cpu,
  Activity,
  GitCompare,
  Layers,
  Info,
} from 'lucide-react';
import { useRobotics } from '@/lib/robotics-context';

export type TabKey =
  | 'dashboard'
  | 'vision'
  | 'navigation'
  | 'mission'
  | 'sensors'
  | 'telemetry'
  | 'experiments'
  | 'architecture'
  | 'about';

interface SidebarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { missionState, isEmergencyStopped, targetDetected } = useRobotics();

  const navItems: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'vision', label: 'Vision', icon: Eye },
    { key: 'navigation', label: 'Navigation', icon: Compass },
    { key: 'mission', label: 'Mission', icon: Crosshair },
    { key: 'sensors', label: 'Sensors', icon: Cpu },
    { key: 'telemetry', label: 'Telemetry', icon: Activity },
    { key: 'experiments', label: 'Experiments', icon: GitCompare },
    { key: 'architecture', label: 'Architecture', icon: Layers },
    { key: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#090D16] flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-semibold tracking-wider text-slate-200">
            NETHRA GCS
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
            v1.0-RC
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 leading-tight">
          Autonomous Search & Rescue UGV Ground Control Station
        </p>
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors ${
                isActive
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.key === 'mission' && targetDetected && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Hardware Status Taxonomy Matrix */}
      <div className="p-3.5 border-t border-slate-800/80 bg-[#070A11] space-y-2.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Hardware Status Separation
        </div>

        <div className="space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-400">Computer Vision</span>
            <span className="text-emerald-400 text-[10px] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> LIVE / WORKING
            </span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-400">Rover & Path</span>
            <span className="text-amber-400 text-[10px] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> SIMULATED
            </span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-400">Motors / Sensors</span>
            <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> FUTURE HARDWARE
            </span>
          </div>
        </div>

        {/* State Banner */}
        <div className={`p-2 rounded border text-[11px] font-mono flex items-center justify-between ${
          isEmergencyStopped
            ? 'bg-rose-950/60 border-rose-800 text-rose-300'
            : missionState === 'NAVIGATING'
            ? 'bg-cyan-950/50 border-cyan-800 text-cyan-300'
            : missionState === 'TARGET_DETECTED'
            ? 'bg-amber-950/50 border-amber-800 text-amber-300'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <span>STATE:</span>
          <span className="font-bold">{missionState}</span>
        </div>
      </div>
    </aside>
  );
}
