'use client';

import React, { useState, useMemo } from 'react';
import { useRobotics } from '@/lib/robotics-context';
import { AlgorithmType, AlgorithmMetricResult } from '@/lib/types';
import { runPathfinding } from '@/lib/pathfinding';
import { OccupancyGrid } from './OccupancyGrid';
import {
  GitCompare,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export function ExperimentsView() {
  const {
    startPos,
    goalPos,
    obstacles,
    selectedAlgorithm,
    setSelectedAlgorithm,
  } = useRobotics();

  // Run dynamic calculation for all 3 algorithms on the EXACT same grid state
  const benchmarkResults = useMemo(() => {
    const algorithms: AlgorithmType[] = ['A*', 'Dijkstra', 'Greedy Best First Search'];
    const results: Record<AlgorithmType, AlgorithmMetricResult> = {
      'A*': runPathfinding('A*', startPos, goalPos, obstacles),
      'Dijkstra': runPathfinding('Dijkstra', startPos, goalPos, obstacles),
      'Greedy Best First Search': runPathfinding('Greedy Best First Search', startPos, goalPos, obstacles),
    };
    return results;
  }, [startPos, goalPos, obstacles]);

  const activeResult = benchmarkResults[selectedAlgorithm];

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-tight">
              Algorithm Benchmark & Comparative Experiments
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold">
              REAL-TIME BENCHMARK
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical runtime comparison between A*, Dijkstra, and Greedy BFS on the identical 12×12 occupancy grid
          </p>
        </div>

        {/* Algorithm Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0D121F] border border-slate-800 rounded-lg">
          {(['A*', 'Dijkstra', 'Greedy Best First Search'] as AlgorithmType[]).map((alg) => (
            <button
              key={alg}
              onClick={() => setSelectedAlgorithm(alg)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap ${
                selectedAlgorithm === alg
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {alg}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Comparison Table (Calculated dynamically, never hardcoded) */}
      <div className="p-5 bg-[#0A0D15] border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="uppercase tracking-wider font-semibold">
            Comparative Benchmark Matrix (Current Arena Map)
          </span>
          <span className="text-[11px] text-cyan-400">Calculated in Real-Time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2 font-medium">ALGORITHM</th>
                <th className="pb-2 font-medium">HEURISTIC FORMULATION</th>
                <th className="pb-2 font-medium">PATH LENGTH</th>
                <th className="pb-2 font-medium">NODES EXPLORED</th>
                <th className="pb-2 font-medium">PLANNING TIME</th>
                <th className="pb-2 font-medium">OPTIMALITY</th>
                <th className="pb-2 font-medium">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(['A*', 'Dijkstra', 'Greedy Best First Search'] as AlgorithmType[]).map((alg) => {
                const res = benchmarkResults[alg];
                const isSelected = selectedAlgorithm === alg;
                return (
                  <tr
                    key={alg}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-cyan-950/30 text-slate-100' : 'text-slate-300 hover:bg-slate-900/40'
                    }`}
                    onClick={() => setSelectedAlgorithm(alg)}
                  >
                    <td className="py-3 font-bold flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                      {alg}
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          SELECTED
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-400">
                      {alg === 'A*'
                        ? 'f(n) = g(n) + h(n)'
                        : alg === 'Dijkstra'
                        ? 'f(n) = g(n) [h = 0]'
                        : 'f(n) = h(n) [Greedy heuristic]'}
                    </td>
                    <td className="py-3 font-semibold text-cyan-400 tabular-nums">
                      {res.success ? `${res.pathLength} steps` : 'NO PATH'}
                    </td>
                    <td className="py-3 font-semibold text-slate-200 tabular-nums">
                      {res.nodesExplored} nodes
                    </td>
                    <td className="py-3 text-emerald-400 tabular-nums">
                      {res.planningTimeMs} ms
                    </td>
                    <td className="py-3 text-slate-400">
                      {alg === 'A*' || alg === 'Dijkstra' ? 'Guaranteed Optimal' : 'Sub-optimal'}
                    </td>
                    <td className="py-3">
                      {res.success ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                        </span>
                      ) : (
                        <span className="text-rose-400">Blocked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid Visualizer with Explored Node Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 bg-[#0A0D16] border border-slate-800 rounded-xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              ARENA MAP WITH {selectedAlgorithm.toUpperCase()} PATH & EXPLORED CELLS
            </span>
            <span className="text-[11px] text-slate-400">
              Grey cells = Searched nodes | Cyan = Optimal solution
            </span>
          </div>

          <OccupancyGrid
            interactive={true}
            size="standard"
            customPath={activeResult.path}
            highlightVisited={activeResult.visitedNodes}
            showLegend={true}
          />
        </div>

        {/* Algorithm Insights Card */}
        <div className="lg:col-span-4 p-5 bg-[#0D121F] border border-slate-800 rounded-xl space-y-4 text-xs font-mono text-slate-300">
          <div className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 pb-2">
            Theoretical vs Empirical Analysis
          </div>

          <div className="space-y-3">
            <div>
              <div className="font-bold text-cyan-300 mb-1">A* Pathfinding:</div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Balances past cost g(n) with estimated Manhattan distance to goal h(n). Produces strictly optimal paths while exploring significantly fewer nodes than Dijkstra.
              </p>
            </div>

            <div>
              <div className="font-bold text-amber-300 mb-1">Dijkstra Algorithm:</div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Uniform-cost search with zero heuristic foresight. Evaluates nodes radially outwards in all directions, causing higher node expansions ({benchmarkResults['Dijkstra'].nodesExplored} nodes) to discover the identical path.
              </p>
            </div>

            <div>
              <div className="font-bold text-purple-300 mb-1">Greedy Best First Search:</div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Prioritizes nodes solely on estimated distance h(n) to the goal. Extremely rapid but vulnerable to local minima around concavities and obstacles, occasionally resulting in longer paths ({benchmarkResults['Greedy Best First Search'].success ? `${benchmarkResults['Greedy Best First Search'].pathLength} steps` : 'no solution'}).
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#06080E] border border-slate-800 rounded text-[11px] text-slate-400">
            Click any cell on the arena map to add/remove obstacles and watch the benchmark update live.
          </div>
        </div>
      </div>
    </div>
  );
}
