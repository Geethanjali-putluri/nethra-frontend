'use client';

import React from 'react';
import {
  Camera,
  Radio,
  Sliders,
  Cpu,
  CheckCircle2,
  Compass,
  Layers,
  ArrowDown,
  AlertTriangle,
  HardDrive,
  Activity,
  Zap,
} from 'lucide-react';

export function ArchitectureView() {
  const currentPipeline = [
    { title: 'PHONE CAMERA', desc: 'Smartphone camera optical stream', icon: Camera },
    { title: 'IP WEBCAM', desc: 'Local Wi-Fi video streaming server', icon: Radio },
    { title: 'OPENCV', desc: 'Frame acquisition & preprocessing', icon: Sliders },
    { title: 'YOLO11n', desc: 'Real-time object detection inference', icon: Cpu },
    { title: 'OBSTACLE DETECTION', desc: 'Horizontal zone classification (L/C/R)', icon: CheckCircle2 },
    { title: 'OCCUPANCY GRID', desc: '12×12 discrete obstacle mapping', icon: Layers },
    { title: 'A*', desc: 'Heuristic shortest path finding', icon: Compass },
    { title: 'ROVER SIMULATION', desc: 'Simulated search & rescue kinematic motion', icon: Cpu },
  ];

  const futureHardware = [
    { name: 'Onboard Camera', desc: 'Wide-angle CSI/USB camera mounted on chassis', icon: Camera },
    { name: 'Raspberry Pi / Jetson', desc: 'Embedded Linux onboard computer running OpenCV & YOLO', icon: HardDrive },
    { name: 'ESP32 / Arduino', desc: 'Real-time microcontroller for motor PWM and sensor buses', icon: Cpu },
    { name: 'Motor Driver', desc: 'Dual H-Bridge motor driver (L298N / TB6612FNG)', icon: Zap },
    { name: 'Motors', desc: 'DC geared motors with optical quadrature encoders', icon: Activity },
    { name: 'Ultrasonic / ToF', desc: 'Proximity rangefinders for physical obstacle detection', icon: Radio },
    { name: 'IMU', desc: '6-DOF accelerometer and gyroscope for attitude reference', icon: Compass },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Architecture Introduction */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-tight">
            System Architecture
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
            SYSTEM DESIGN
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Detailed structural dataflow of the NETHRA prototype and future hardware layers
        </p>
      </div>

      {/* 1. CURRENT PROTOTYPE SYSTEM ARCHITECTURE */}
      <div className="p-6 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              CURRENT PROTOTYPE SYSTEM
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified functional pipeline: Phone Camera → OpenCV → YOLO11n → Occupancy Grid → A* → Simulation
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
            WORKING PIPELINE
          </span>
        </div>

        {/* Visual Pipeline Grid / Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currentPipeline.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === currentPipeline.length - 1;
            return (
              <div
                key={idx}
                className="p-3.5 bg-[#0E131F] border border-slate-800 rounded-lg flex flex-col justify-between relative group hover:border-cyan-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-500 font-medium">STEP 0{idx + 1}</span>
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-100 uppercase">
                    {step.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">
                    {step.desc}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Subsystem:</span>
                  <span className={isLast ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {isLast ? 'SIMULATED' : 'LIVE'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Concise Linear Diagram Bar */}
        <div className="p-3 bg-[#070A11] border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2 min-w-[750px]">
            <span className="text-emerald-400 font-bold">PHONE CAMERA</span>
            <span className="text-slate-600">→</span>
            <span>IP WEBCAM</span>
            <span className="text-slate-600">→</span>
            <span className="text-cyan-400 font-bold">OPENCV</span>
            <span className="text-slate-600">→</span>
            <span className="text-cyan-400 font-bold">YOLO11n</span>
            <span className="text-slate-600">→</span>
            <span>OBSTACLE DETECTION</span>
            <span className="text-slate-600">→</span>
            <span className="text-amber-400 font-bold">OCCUPANCY GRID</span>
            <span className="text-slate-600">→</span>
            <span className="text-amber-400 font-bold">A*</span>
            <span className="text-slate-600">→</span>
            <span className="text-purple-400 font-bold">ROVER SIMULATION</span>
          </div>
        </div>
      </div>

      {/* 2. FUTURE HARDWARE INTEGRATION LAYER */}
      <div className="p-6 bg-[#0E1017] border border-amber-900/60 rounded-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold font-mono text-amber-200 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              FUTURE HARDWARE INTEGRATION
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Physical UGV chassis components to replace the simulation layer when assembled
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
            FUTURE HARDWARE
          </span>
        </div>

        {/* Clear Notice */}
        <div className="p-3 bg-amber-950/30 border border-amber-800/80 rounded-lg flex items-center gap-3 text-xs font-mono text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Physical rover, motors, ESP32, Arduino, Raspberry Pi, motor driver, ultrasonic sensor, and IMU are not currently connected.
          </span>
        </div>

        {/* Future Hardware Components List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {futureHardware.map((hw, idx) => {
            const Icon = hw.icon;
            return (
              <div key={idx} className="p-3.5 bg-[#090C14] border border-slate-800 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {hw.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    PLANNED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  {hw.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
