'use client';

import React, { useState, useEffect } from 'react';
import { useRobotics } from '@/lib/robotics-context';
import {
  Bug,
  RefreshCw,
  Terminal,
  Activity,
  MapPin,
  Route,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RawEndpointState {
  url: string;
  status: number | null;
  timestamp: string;
  data: any;
  error?: string | null;
}

export function DebugPanel() {
  const {
    roverPos,
    missionState,
    obstacles,
    currentPath,
    pathLength,
    heading,
    backendUrl,
    backendConnected,
    lastSuccessfulPoll,
    apiStatus,
    lastObstaclePost,
    lastBackendError,
    refreshAll,
  } = useRobotics();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showRawEndpoints, setShowRawEndpoints] = useState<boolean>(true);
  const [rawStatus, setRawStatus] = useState<RawEndpointState | null>(null);
  const [rawNav, setRawNav] = useState<RawEndpointState | null>(null);

  const fetchDebugEndpoints = async () => {
    setIsRefreshing(true);
    const cleanUrl = (backendUrl || '').replace(/\/+$/, '');

    // 1. Fetch GET /api/status
    try {
      const statusTarget = cleanUrl ? `${cleanUrl}/api/status` : '/api/status';
      const res = await fetch(statusTarget, {
        headers: { Accept: 'application/json' },
      });
      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = await res.text();
      }
      setRawStatus({
        url: statusTarget,
        status: res.status,
        timestamp: new Date().toLocaleTimeString(),
        data: json,
        error: res.ok ? null : `HTTP ${res.status}: ${res.statusText}`,
      });
    } catch (err: any) {
      // Fallback try local Next.js route if remote failed
      try {
        const localRes = await fetch('/api/status', {
          headers: { Accept: 'application/json' },
        });
        const localJson = await localRes.json();
        setRawStatus({
          url: '/api/status (Local Fallback)',
          status: localRes.status,
          timestamp: new Date().toLocaleTimeString(),
          data: localJson,
          error: null,
        });
      } catch (locErr: any) {
        setRawStatus({
          url: cleanUrl ? `${cleanUrl}/api/status` : '/api/status',
          status: null,
          timestamp: new Date().toLocaleTimeString(),
          data: null,
          error: err?.message || String(err),
        });
      }
    }

    // 2. Fetch GET /api/navigation
    try {
      const navTarget = cleanUrl ? `${cleanUrl}/api/navigation` : '/api/navigation';
      const res = await fetch(navTarget, {
        headers: { Accept: 'application/json' },
      });
      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = await res.text();
      }
      setRawNav({
        url: navTarget,
        status: res.status,
        timestamp: new Date().toLocaleTimeString(),
        data: json,
        error: res.ok ? null : `HTTP ${res.status}: ${res.statusText}`,
      });
    } catch (err: any) {
      try {
        const localRes = await fetch('/api/navigation', {
          headers: { Accept: 'application/json' },
        });
        const localJson = await localRes.json();
        setRawNav({
          url: '/api/navigation (Local Fallback)',
          status: localRes.status,
          timestamp: new Date().toLocaleTimeString(),
          data: localJson,
          error: null,
        });
      } catch (locErr: any) {
        setRawNav({
          url: cleanUrl ? `${cleanUrl}/api/navigation` : '/api/navigation',
          status: null,
          timestamp: new Date().toLocaleTimeString(),
          data: null,
          error: err?.message || String(err),
        });
      }
    }

    // Trigger context refresh
    try {
      await refreshAll();
    } catch {
      // Ignore background poll errors
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-fetch raw endpoints on mount
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) {
        fetchDebugEndpoints();
      }
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyAllDiagnostics = () => {
    const diagnosticPayload = {
      timestamp: new Date().toISOString(),
      backendUrl,
      backendConnected,
      lastSuccessfulPoll: lastSuccessfulPoll ? new Date(lastSuccessfulPoll).toISOString() : null,
      lastBackendError,
      values: {
        roverPosition: [roverPos.x, roverPos.y],
        roverPositionObj: roverPos,
        missionState,
        heading,
        obstaclesCount: obstacles.size,
        obstacles: Array.from(obstacles),
        activePathLength: pathLength,
        activePathPoints: currentPath.map((p) => [p.x, p.y]),
      },
      lastObstaclePost,
      rawEndpoints: {
        status: rawStatus,
        navigation: rawNav,
      },
    };

    navigator.clipboard.writeText(JSON.stringify(diagnosticPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 border-2 border-amber-500/50 bg-[#060913] rounded-xl overflow-hidden shadow-2xl font-mono text-slate-200">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/40 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-500/20 border border-amber-500/60 rounded text-amber-400">
            <Bug className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-amber-300 tracking-wider">
                TEMPORARY DEBUG PANEL (LIVE AUDIT)
              </span>
              <span className="px-1.5 py-0.2 bg-amber-500/20 border border-amber-400/40 rounded text-[10px] text-amber-300 font-semibold">
                DIAGNOSTIC ONLY
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live inspection of rover coordinates, obstacle POST payloads, backend state, and raw API responses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDebugEndpoints}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs transition-colors shadow disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            REFRESH DEBUG
          </button>

          <button
            onClick={copyAllDiagnostics}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs transition-colors"
            title="Copy full JSON diagnostics to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            {copied ? 'COPIED!' : 'COPY JSON'}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Core Live Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Rover Position */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                1. ROVER POSITION
              </span>
              <span className="text-[10px] text-slate-400">[x, y]</span>
            </div>
            <div className="text-xl font-bold text-cyan-200">
              [{roverPos.x}, {roverPos.y}]
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5 border-t border-slate-800/80 pt-1.5">
              <div>Internal: <code className="text-slate-300 font-semibold">{`{ x: ${roverPos.x}, y: ${roverPos.y} }`}</code></div>
              <div>From /api/status: <code className="text-slate-300">{apiStatus?.rover_position ? JSON.stringify(apiStatus.rover_position) : '--'}</code></div>
              <div>Heading: <code className="text-slate-300">{heading}°</code></div>
            </div>
          </div>

          {/* 2. Mission State */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                2. MISSION STATE
              </span>
              <span className="text-[10px] text-slate-400">STATUS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${
                missionState === 'NAVIGATING'
                  ? 'text-emerald-400'
                  : missionState === 'NO_SAFE_PATH'
                  ? 'text-rose-400'
                  : missionState === 'REPLANNING'
                  ? 'text-amber-400'
                  : 'text-cyan-300'
              }`}>
                {missionState || 'IDLE'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5 border-t border-slate-800/80 pt-1.5">
              <div>Emergency Stopped: <code className="text-slate-300 font-semibold">{missionState === 'EMERGENCY_STOP' ? 'YES' : 'NO'}</code></div>
              <div>Backend Status state: <code className="text-slate-300">{apiStatus?.state || '--'}</code></div>
            </div>
          </div>

          {/* 3. Current Obstacles */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-rose-300">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                3. CURRENT OBSTACLES
              </span>
              <span className="text-[10px] text-slate-400">COUNT</span>
            </div>
            <div className="text-xl font-bold text-rose-400">
              {obstacles.size} <span className="text-xs font-normal text-slate-400">blocked cells</span>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5">
              <div className="truncate max-h-12 overflow-y-auto">
                Keys: <code className="text-rose-200/90">{Array.from(obstacles).join(', ') || 'None'}</code>
              </div>
            </div>
          </div>

          {/* 4. Active Path */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2 md:col-span-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-purple-300">
                <Route className="w-3.5 h-3.5 text-purple-400" />
                4. CURRENT ACTIVE PATH
              </span>
              <span className="text-[10px] text-slate-400">{currentPath.length} waypoints</span>
            </div>
            <div className="text-xs text-purple-200 font-mono bg-black/40 p-2 rounded border border-slate-800/80 overflow-x-auto whitespace-nowrap">
              {currentPath.length > 0
                ? currentPath.map((p) => `[${p.x},${p.y}]`).join(' → ')
                : 'No active path'}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
              <span>Next waypoint: <code className="text-purple-300 font-semibold">{currentPath.length > 1 ? `[${currentPath[1].x}, ${currentPath[1].y}]` : 'Goal or None'}</code></span>
              <span>Target: <code className="text-purple-300">[0, 11]</code></span>
            </div>
          </div>

          {/* 5. Path Length */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                <Route className="w-3.5 h-3.5 text-amber-400" />
                5. CURRENT PATH LENGTH
              </span>
              <span className="text-[10px] text-slate-400">STEPS</span>
            </div>
            <div className="text-xl font-bold text-amber-300">
              {pathLength} <span className="text-xs font-normal text-slate-400">steps</span>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5 space-y-0.5">
              <div>Path Array Length: <code className="text-slate-300">{currentPath.length}</code></div>
              <div>From /api/status: <code className="text-slate-300">{typeof apiStatus?.path_length === 'number' ? apiStatus.path_length : '--'}</code></div>
            </div>
          </div>
        </div>

        {/* 6. Last Obstacle POST Response */}
        <div className="p-4 bg-slate-900/95 border border-slate-800 rounded-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-xs text-cyan-300">
                6. LAST OBSTACLE POST EXECUTION (/api/obstacles)
              </span>
            </div>
            {lastObstaclePost ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px]">Time: {lastObstaclePost.timestamp}</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                  lastObstaclePost.httpStatus && lastObstaclePost.httpStatus >= 200 && lastObstaclePost.httpStatus < 300
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-rose-950 text-rose-300 border border-rose-700'
                }`}>
                  HTTP {lastObstaclePost.httpStatus ?? 'ERR'}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">No obstacle placed or POST sent yet in this session</span>
            )}
          </div>

          {lastObstaclePost ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px]">
                  <span>REQUEST PAYLOAD SENT:</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{lastObstaclePost.url}</span>
                </div>
                <pre className="p-2.5 bg-black/60 border border-slate-800 rounded text-[11px] text-cyan-200 overflow-x-auto max-h-40">
                  {JSON.stringify(lastObstaclePost.requestPayload, null, 2)}
                </pre>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px]">
                  <span>RESPONSE JSON RECEIVED:</span>
                  {lastObstaclePost.error && (
                    <span className="text-rose-400 text-[10px] font-semibold">{lastObstaclePost.error}</span>
                  )}
                </div>
                <pre className="p-2.5 bg-black/60 border border-slate-800 rounded text-[11px] text-emerald-200 overflow-x-auto max-h-40">
                  {lastObstaclePost.responseJson !== null && lastObstaclePost.responseJson !== undefined
                    ? JSON.stringify(lastObstaclePost.responseJson, null, 2)
                    : lastObstaclePost.error || 'No response body'}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-black/30 border border-dashed border-slate-800 rounded text-center text-xs text-slate-400">
              Click any cell on the Navigation Arena grid or click &ldquo;ADD OBSTACLE IN PATH&rdquo; to test POST /api/obstacles.
            </div>
          )}
        </div>

        {/* 7. Last Backend Response / Error */}
        <div className="p-4 bg-slate-900/95 border border-slate-800 rounded-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-xs text-amber-300">
                7. LAST BACKEND RESPONSE / ERROR STATUS
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400 text-[11px]">Target: <code className="text-slate-300">{backendUrl || 'Local Next.js'}</code></span>
              <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                backendConnected ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'
              }`}>
                {backendConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold text-[11px]">LAST ERROR:</span>
              <div className="p-2.5 bg-black/60 border border-slate-800 rounded text-[11px] min-h-[40px] flex items-center">
                {lastBackendError ? (
                  <span className="text-rose-400 flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {lastBackendError}
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    No active errors. Polling is healthy.
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold text-[11px]">POLL SUMMARY:</span>
              <div className="p-2.5 bg-black/60 border border-slate-800 rounded text-[11px] text-slate-300 space-y-0.5">
                <div>Last Successful Poll: <code className="text-cyan-300">{lastSuccessfulPoll ? new Date(lastSuccessfulPoll).toLocaleTimeString() : '--'}</code></div>
                <div>Backend Detections: <code className="text-cyan-300">{apiStatus?.detections?.length || 0}</code></div>
                <div>Replans Count: <code className="text-cyan-300">{apiStatus?.replans || 0}</code></div>
              </div>
            </div>
          </div>
        </div>

        {/* Raw Endpoint Inspection Section */}
        <div className="border border-slate-800 bg-slate-950/70 rounded-lg overflow-hidden">
          <div
            className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between cursor-pointer select-none"
            onClick={() => setShowRawEndpoints(!showRawEndpoints)}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>RAW JSON RESPONSES (GET /api/status &amp; GET /api/navigation)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">
                {showRawEndpoints ? 'Click to collapse' : 'Click to expand'}
              </span>
              {showRawEndpoints ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>

          {showRawEndpoints && (
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* GET /api/status */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-cyan-300">GET /api/status</span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span>{rawStatus?.timestamp || '--'}</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      rawStatus?.status && rawStatus.status >= 200 && rawStatus.status < 300
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-rose-950 text-rose-300'
                    }`}>
                      {rawStatus?.status ? `HTTP ${rawStatus.status}` : 'PENDING'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 truncate">{rawStatus?.url || '/api/status'}</div>
                <pre className="p-3 bg-black/80 border border-slate-800 rounded text-[11px] text-cyan-200/90 overflow-x-auto max-h-60 leading-relaxed font-mono">
                  {rawStatus?.data ? JSON.stringify(rawStatus.data, null, 2) : rawStatus?.error || 'Loading or empty response...'}
                </pre>
              </div>

              {/* GET /api/navigation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-purple-300">GET /api/navigation</span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span>{rawNav?.timestamp || '--'}</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      rawNav?.status && rawNav.status >= 200 && rawNav.status < 300
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-rose-950 text-rose-300'
                    }`}>
                      {rawNav?.status ? `HTTP ${rawNav.status}` : 'PENDING'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 truncate">{rawNav?.url || '/api/navigation'}</div>
                <pre className="p-3 bg-black/80 border border-slate-800 rounded text-[11px] text-purple-200/90 overflow-x-auto max-h-60 leading-relaxed font-mono">
                  {rawNav?.data ? JSON.stringify(rawNav.data, null, 2) : rawNav?.error || 'Loading or empty response...'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
