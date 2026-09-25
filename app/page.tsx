'use client';

import React, { useState } from 'react';
import { RoboticsProvider, useRobotics } from '@/lib/robotics-context';
import { Header } from '@/components/Header';
import { Sidebar, TabKey } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { VisionView } from '@/components/VisionView';
import { NavigationView } from '@/components/NavigationView';
import { MissionView } from '@/components/MissionView';
import { SensorsView } from '@/components/SensorsView';
import { TelemetryView } from '@/components/TelemetryView';
import { ExperimentsView } from '@/components/ExperimentsView';
import { ArchitectureView } from '@/components/ArchitectureView';
import { AboutView } from '@/components/AboutView';
import { Menu, X } from 'lucide-react';

function GroundControlStation() {
  const { activeTab, setActiveTab } = useRobotics();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen w-full bg-[#080B11] text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar activeTab={activeTab as TabKey} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-[#090D16] h-full shadow-2xl z-10 flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <span className="font-mono text-sm font-bold text-slate-100">NETHRA GCS</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                activeTab={activeTab as TabKey}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header activeTab={activeTab} />

        {/* Mobile Top Sub-bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 bg-[#090D16] border-b border-slate-800 text-xs font-mono">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 text-cyan-300 font-medium"
          >
            <Menu className="w-4 h-4" />
            <span>MENU ({activeTab.toUpperCase()})</span>
          </button>
          <span className="text-amber-400 text-[10px]">SIMULATION MODE</span>
        </div>

        {/* Dynamic Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'vision' && <VisionView />}
            {activeTab === 'navigation' && <NavigationView />}
            {activeTab === 'mission' && <MissionView />}
            {activeTab === 'sensors' && <SensorsView />}
            {activeTab === 'telemetry' && <TelemetryView />}
            {activeTab === 'experiments' && <ExperimentsView />}
            {activeTab === 'architecture' && <ArchitectureView />}
            {activeTab === 'about' && <AboutView />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <RoboticsProvider>
      <GroundControlStation />
    </RoboticsProvider>
  );
}
