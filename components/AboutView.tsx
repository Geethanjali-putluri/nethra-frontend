'use client';

import React from 'react';
import {
  Shield,
  Target,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export function AboutView() {
  const technologies = [
    { name: 'Python', role: 'Backend vision capture, OpenCV pipeline, and YOLO neural network execution.' },
    { name: 'OpenCV', role: 'Real-time video frame acquisition from IP Webcam, frame decoding, and spatial zoning.' },
    { name: 'YOLO11', role: 'Real-time multi-class object detection for obstacle avoidance and survivor detection.' },
    { name: 'A* Pathfinding', role: 'Deterministic heuristic graph search algorithm generating optimal collision-free trajectories.' },
    { name: 'Computer Vision', role: 'Spatial horizontal field segmentation (LEFT / CENTER / RIGHT positioning).' },
    { name: 'Path Planning', role: 'Dynamic obstacle recalculation and kinematic waypoint guidance across 12×12 occupancy grid.' },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-tight">
            About NETHRA
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
            AUTONOMOUS SEARCH & RESCUE UGV
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Autonomous Search & Rescue Unmanned Ground Vehicle Prototype
        </p>
      </div>

      {/* 3 Core Sections: Problem, Solution, Technology */}
      <div className="space-y-4">
        {/* Section 1: The Problem */}
        <div className="p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>01. The Problem</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            In collapsed structures, earthquake debris, or hazardous industrial disasters, human search and rescue teams face extreme structural instability, toxic atmospheres, and restricted access. Deploying human responders into uncharted voids presents severe life-safety risks, while manual teleoperated rovers suffer from communication latency and operator fatigue.
          </p>
        </div>

        {/* Section 2: The Solution */}
        <div className="p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>02. The Solution</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            NETHRA is an autonomous search-and-rescue unmanned ground vehicle prototype designed to navigate unknown obstacle-cluttered arenas. By coupling real-time computer vision with a 12×12 occupancy grid and deterministic A* heuristic path planning, NETHRA detects survivors, maps dynamic hazards, and autonomously recalculates safe paths without requiring human teleoperation.
          </p>
        </div>

        {/* Section 3: Technology */}
        <div className="p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>03. Core Technologies</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {technologies.map((tech, idx) => (
              <div key={idx} className="p-3 bg-[#0D121F] border border-slate-800 rounded-lg space-y-1">
                <div className="text-xs font-mono font-bold text-cyan-300">{tech.name}</div>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">{tech.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic & Hardware Status Statement */}
      <div className="p-4 bg-[#070A11] border border-slate-800 rounded-lg text-xs font-mono text-slate-400 space-y-1">
        <div className="text-slate-300 font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Academic Evaluation Note</span>
        </div>
        <div className="leading-relaxed text-[11px]">
          Current prototype operational scope: Phone camera + laptop computer vision + rover kinematics simulation. Physical motors, ESP32, and ultrasonic sensors are part of the future hardware roadmap.
        </div>
      </div>
    </div>
  );
}
