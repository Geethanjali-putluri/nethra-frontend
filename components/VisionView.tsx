'use client';

import React from 'react';
import { useRobotics } from '@/lib/robotics-context';
import {
  Camera,
  Eye,
  Radio,
  WifiOff,
  Wifi,
  AlertCircle,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';

export function VisionView() {
  const {
    backendConnected,
    setBackendConnected,
    detections,
  } = useRobotics();

  // Known target & obstacle classes supported by YOLO11n prototype
  const standardClasses = [
    { name: 'Person', target: true },
    { name: 'Car', target: false },
    { name: 'Suitcase', target: false },
    { name: 'Bicycle', target: false },
    { name: 'Chair', target: false },
    { name: 'Motorcycle', target: false },
    { name: 'Bus', target: false },
    { name: 'Truck', target: false },
    { name: 'Bench', target: false },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Connection Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-tight">
              Vision & Optical Perception
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              PHONE CAMERA / IP WEBCAM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time optical frame intake, YOLO11n inference, and horizontal spatial position classification
          </p>
        </div>

        {/* Backend Connect Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBackendConnected(!backendConnected)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded border transition-colors flex items-center gap-2 ${
              backendConnected
                ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {backendConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-slate-400" />}
            {backendConnected ? 'Python Backend: CONNECTED' : 'Connect Python Stream'}
          </button>
        </div>
      </div>

      {/* Main Viewport: Live Camera Screen + Detection Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Camera Feed Viewport */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video w-full bg-[#070A11] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between p-4">
            {/* Camera Viewport Header */}
            <div className="flex items-center justify-between z-10 text-[11px] font-mono text-slate-300 bg-black/70 backdrop-blur px-3 py-1.5 rounded border border-white/10">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="font-bold text-slate-200">LIVE CAMERA FEED</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">PHONE CAMERA (IP WEBCAM)</span>
              </div>
              <div className="text-slate-400">
                {backendConnected ? '1920×1080 @ 30 FPS' : 'NO CARRIER'}
              </div>
            </div>

            {/* Screen Content: Connected Bounding Boxes or Waiting Screen (Prompt: Do NOT create fake video) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0">
              {backendConnected ? (
                /* Real or Simulated Connected Stream Overlays */
                <div className="w-full h-full relative flex items-center justify-center">
                  {/* Visual 3-zone guide lines */}
                  <div className="absolute inset-0 grid grid-cols-3 divide-x divide-cyan-500/15 pointer-events-none">
                    <div className="flex items-start justify-center pt-12 text-[10px] font-mono text-cyan-500/40">
                      ZONE: LEFT
                    </div>
                    <div className="flex items-start justify-center pt-12 text-[10px] font-mono text-cyan-500/40">
                      ZONE: CENTER
                    </div>
                    <div className="flex items-start justify-center pt-12 text-[10px] font-mono text-cyan-500/40">
                      ZONE: RIGHT
                    </div>
                  </div>

                  {/* Render detected boxes received from backend */}
                  {detections.map((det) => {
                    const [x, y, w, h] = det.bbox || [0.35, 0.25, 0.3, 0.5];
                    const isPerson = det.class === 'person';
                    return (
                      <div
                        key={det.id}
                        className={`absolute border-2 transition-all ${
                          isPerson
                            ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                            : 'border-cyan-400 bg-cyan-500/10'
                        }`}
                        style={{
                          left: `${x * 100}%`,
                          top: `${y * 100}%`,
                          width: `${w * 100}%`,
                          height: `${h * 100}%`,
                        }}
                      >
                        <div
                          className={`absolute -top-6 left-0 px-1.5 py-0.5 text-[10px] font-mono font-bold whitespace-nowrap rounded ${
                            isPerson ? 'bg-emerald-500 text-slate-950' : 'bg-cyan-500 text-slate-950'
                          }`}
                        >
                          {det.class.toUpperCase()} {(det.confidence * 100).toFixed(0)}% [{det.position}]
                          {isPerson && ' ★ TARGET'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Disconnected / Waiting State Required by Prompt */
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-mono font-bold text-slate-200 tracking-wider">
                      LIVE CAMERA
                    </div>
                    <div className="text-xs font-mono text-cyan-400 mt-1">
                      WAITING FOR PYTHON VISION STREAM
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Start the Python OpenCV & YOLO11 pipeline with IP Webcam stream. Frames and detections will automatically project here.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom HUD Bar */}
            <div className="flex items-center justify-between z-10 text-[10px] font-mono text-slate-300 bg-black/70 backdrop-blur px-3 py-1.5 rounded border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">YOLO11n:</span>
                <span className={backendConnected ? 'text-emerald-400 font-bold' : 'text-slate-400 font-bold'}>
                  {backendConnected ? 'ONLINE' : 'DISCONNECTED'}
                </span>
              </div>
              <div className="text-slate-400">
                {backendConnected ? `${detections.length} OBJECTS IN SCENE` : 'STREAM INACTIVE'}
              </div>
            </div>
          </div>

          {/* Prototype Target Detection Note */}
          <div className="p-3 bg-[#0A131B] border border-emerald-800/60 rounded-lg flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PROTOTYPE TARGET DETECTION: Class &quot;Person&quot; is mapped as the search & rescue objective.</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
              SAR RULE
            </span>
          </div>
        </div>

        {/* Right: Detections Table (Prompt: Object | Confidence | Position) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
              <span className="text-slate-300 font-bold uppercase tracking-wider">
                DETECTIONS MATRIX
              </span>
              <span className="text-[10px] text-slate-400">
                {backendConnected ? 'Live Inference' : 'Backend Disconnected'}
              </span>
            </div>

            {/* Detections List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2 font-medium">OBJECT</th>
                    <th className="pb-2 font-medium">CONFIDENCE</th>
                    <th className="pb-2 font-medium">POSITION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {standardClasses.map((item) => {
                    const matchedDetection = backendConnected
                      ? detections.find((d) => d.class.toLowerCase() === item.name.toLowerCase())
                      : undefined;

                    return (
                      <tr key={item.name} className="py-2 text-slate-300">
                        <td className="py-2 font-medium flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.target && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                              TARGET
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-slate-400 tabular-nums">
                          {matchedDetection ? `${(matchedDetection.confidence * 100).toFixed(0)}%` : '--'}
                        </td>
                        <td className="py-2 tabular-nums">
                          {matchedDetection ? (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                matchedDetection.position === 'CENTER'
                                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                                  : matchedDetection.position === 'LEFT'
                                  ? 'bg-blue-950 text-blue-300 border-blue-700'
                                  : 'bg-purple-950 text-purple-300 border-purple-700'
                              }`}
                            >
                              {matchedDetection.position}
                            </span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Integration Status Panel (Replaces old source code block!) */}
      <div className="p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
              PYTHON VISION BACKEND STATUS
            </h2>
          </div>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
              backendConnected
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-rose-950 text-rose-300 border-rose-800'
            }`}
          >
            {backendConnected ? 'STATUS: CONNECTED' : 'BACKEND DISCONNECTED'}
          </span>
        </div>

        {/* Integration Specs Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-[#0D121F] border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400">CAMERA INGESTION</div>
            <div className="text-slate-200 font-bold mt-1">IP WEBCAM</div>
            <div className="text-[10px] text-slate-400 mt-0.5">RTSP / HTTP MJPEG</div>
          </div>

          <div className="p-3 bg-[#0D121F] border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400">COMPUTER VISION</div>
            <div className="text-slate-200 font-bold mt-1">OpenCV</div>
            <div className="text-[10px] text-slate-400 mt-0.5">cv2.VideoCapture</div>
          </div>

          <div className="p-3 bg-[#0D121F] border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400">OBJECT DETECTION</div>
            <div className="text-slate-200 font-bold mt-1">YOLO11n</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Ultralytics Neural Net</div>
          </div>

          <div className="p-3 bg-[#0D121F] border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400">NAVIGATION INTEGRATION</div>
            <div className="text-slate-200 font-bold mt-1">A* Solver</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Dynamic Grid Projection</div>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 leading-relaxed pt-1">
          When the Python script executes on the host workstation, detection bounding boxes and classified zone positions (LEFT, CENTER, RIGHT) stream to this dashboard via the REST API endpoint (<code className="text-cyan-300">POST /api/vision</code>).
        </div>
      </div>
    </div>
  );
}
