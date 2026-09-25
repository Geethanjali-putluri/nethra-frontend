'use client';

import React from 'react';
import {
  Cpu,
  AlertCircle,
  Battery,
  Compass,
  Radio,
  Share2,
  Camera,
  Layers,
} from 'lucide-react';

export function SensorsView() {
  const hardwareStatuses = [
    {
      name: 'Phone Camera Feed',
      type: 'Optical Sensing (IP Webcam)',
      status: 'LIVE / WORKING',
      statusType: 'WORKING',
      role: 'Video stream input for YOLO11 object and rescue target detection.',
    },
    {
      name: 'Rover Motors & Drive',
      type: 'Differential Skid-Steer',
      status: 'SIMULATION',
      statusType: 'SIMULATION',
      role: 'Kinematic simulation moves along calculated A* path; no physical motor driver attached.',
    },
    {
      name: 'Ultrasonic Sensors',
      type: 'Proximity Ranging (HC-SR04)',
      status: 'NOT CONNECTED',
      statusType: 'FUTURE_HARDWARE',
      role: 'Forward and lateral obstacle clearance detection for physical chassis.',
    },
    {
      name: 'Time-of-Flight (ToF)',
      type: 'Laser Rangefinder (VL53L0X)',
      status: 'NOT CONNECTED',
      statusType: 'FUTURE_HARDWARE',
      role: 'Millimeter-accuracy obstacle distance sensing in low-visibility environments.',
    },
    {
      name: 'Inertial Measurement Unit (IMU)',
      type: '6-DOF Gyro / Accel (MPU6050)',
      status: 'NOT CONNECTED',
      statusType: 'FUTURE_HARDWARE',
      role: 'Attitude heading reference and pitch/roll tilt stability detection.',
    },
    {
      name: 'Battery Telemetry',
      type: 'Voltage Divider / INA219',
      status: 'NOT CONNECTED',
      statusType: 'FUTURE_HARDWARE',
      role: 'Bus voltage, current draw, and power reserve monitoring for onboard electronics.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Hardware Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-tight">
              Sensors & Physical Hardware Integration
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              HARDWARE AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Component verification status and future hardware interfacing roadmap
          </p>
        </div>

        {/* Clear Hardware Audit Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/40 border border-amber-800/80 rounded text-xs font-mono text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>CURRENT HARDWARE STATUS: PROTOTYPE WITHOUT PHYSICAL MOTORS/SENSORS</span>
        </div>
      </div>

      {/* Hardware Component Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hardwareStatuses.map((item, idx) => {
          const isWorking = item.statusType === 'WORKING';
          const isSim = item.statusType === 'SIMULATION';
          const isFuture = item.statusType === 'FUTURE_HARDWARE';

          return (
            <div
              key={idx}
              className="p-4 bg-[#0D121F] border border-slate-800 rounded-xl space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-100 uppercase">
                    {item.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">{item.type}</div>
                </div>

                {/* Badge */}
                {isFuture && (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                    FUTURE HARDWARE
                  </span>
                )}
                {isWorking && (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 uppercase tracking-wider">
                    LIVE / WORKING
                  </span>
                )}
                {isSim && (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 uppercase tracking-wider">
                    SIMULATION
                  </span>
                )}
              </div>

              {/* Status display */}
              <div className="p-2.5 bg-[#070A11] border border-slate-800/80 rounded flex items-center justify-between font-mono text-xs">
                <span className="text-slate-500 text-[10px]">CURRENT STATUS:</span>
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    isWorking
                      ? 'text-emerald-400'
                      : isSim
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isWorking ? 'bg-emerald-400' : isSim ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                  />
                  {item.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {item.role}
              </p>
            </div>
          );
        })}
      </div>

      {/* Integration Plan Architecture */}
      <div className="p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Share2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
            Future Hardware Integration Specification
          </h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The physical rover platform is planned to feature an onboard ESP32 or Arduino microcontroller handling low-level hardware timers, motor PWM control, and sensor buses (I2C / GPIO). Sensor readings will stream to the high-level perception unit (Raspberry Pi / Jetson or host computer) to replace the current simulation layer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-slate-300">
          <div className="p-3 bg-[#0D121F] border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400 mb-1">RANGING BUS:</div>
            <div>GPIO Trigger / Echo & I2C Address 0x29</div>
          </div>
          <div className="p-3 bg-[#0D121F] border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400 mb-1">IMU PROTOCOL:</div>
            <div>I2C Address 0x68 (100 kHz standard)</div>
          </div>
          <div className="p-3 bg-[#0D121F] border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400 mb-1">MOTOR INTERFACE:</div>
            <div>Dual H-Bridge Motor Driver (PWM 20 kHz)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
