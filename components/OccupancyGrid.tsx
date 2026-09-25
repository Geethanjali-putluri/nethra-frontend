'use client';

import React from 'react';
import { useRobotics } from '@/lib/robotics-context';
import { GridPoint } from '@/lib/types';
import { pointToKey } from '@/lib/pathfinding';
import { Navigation } from 'lucide-react';

interface OccupancyGridProps {
  interactive?: boolean;
  highlightVisited?: GridPoint[];
  customPath?: GridPoint[];
  size?: 'compact' | 'standard' | 'large';
  showLegend?: boolean;
  gridMatrix?: number[][];
  customRoverPos?: GridPoint;
  customStartPos?: GridPoint;
  customGoalPos?: GridPoint;
}

export function OccupancyGrid({
  interactive = true,
  highlightVisited,
  customPath,
  size = 'standard',
  showLegend = true,
  gridMatrix,
  customRoverPos,
  customStartPos,
  customGoalPos,
}: OccupancyGridProps) {
  const {
    gridSize,
    startPos: ctxStartPos,
    goalPos: ctxGoalPos,
    targetPos,
    roverPos: ctxRoverPos,
    obstacles: ctxObstacles,
    currentPath: ctxCurrentPath,
    heading,
    toggleObstacle,
    gridMatrix: ctxGridMatrix,
  } = useRobotics();

  const activeGridMatrix = gridMatrix || ctxGridMatrix;
  const startPos = customStartPos || ctxStartPos;
  const goalPos = customGoalPos || ctxGoalPos;
  const roverPos = customRoverPos || ctxRoverPos;

  const activePath = customPath || ctxCurrentPath;
  const pathSet = new Set(activePath.map((p) => pointToKey(p)));
  const visitedSet = new Set((highlightVisited || []).map((p) => pointToKey(p)));

  const startKey = pointToKey(startPos);
  const goalKey = pointToKey(goalPos);
  const targetKey = pointToKey(targetPos);
  const roverKey = pointToKey(roverPos);

  const cellSizeClass =
    size === 'compact'
      ? 'w-6 h-6 text-[9px]'
      : size === 'large'
      ? 'w-10 h-10 text-xs'
      : 'w-7 sm:w-8 md:w-9 h-7 sm:h-8 md:h-9 text-[10px] sm:text-xs';

  return (
    <div className="flex flex-col items-center">
      {/* 12x12 Grid Container */}
      <div className="inline-block p-3 sm:p-4 bg-[#0A0D15] border border-slate-800 rounded-lg shadow-2xl">
        {/* Top X Coordinates Header */}
        <div className="flex items-center pl-7 sm:pl-8 mb-1.5 font-mono text-[10px] text-slate-400 select-none">
          {Array.from({ length: gridSize }).map((_, x) => (
            <div
              key={x}
              className={`text-center font-medium ${
                size === 'compact'
                  ? 'w-6'
                  : size === 'large'
                  ? 'w-10'
                  : 'w-7 sm:w-8 md:w-9'
              }`}
            >
              {x}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-1">
          {Array.from({ length: gridSize }).map((_, y) => (
            <div key={y} className="flex items-center gap-1">
              {/* Y Axis Label */}
              <div className="w-6 sm:w-7 font-mono text-[10px] text-slate-400 text-right pr-1.5 select-none font-medium">
                {y}
              </div>

              {/* Cells */}
              {Array.from({ length: gridSize }).map((_, x) => {
                const cellPoint: GridPoint = { x, y };
                const cellKey = pointToKey(cellPoint);

                const isRover = cellKey === roverKey;
                const isStart = cellKey === startKey;
                const isGoal = cellKey === goalKey;
                const isTarget = cellKey === targetKey;
                const isObstacle = activeGridMatrix && activeGridMatrix[y]
                  ? activeGridMatrix[y][x] === 1
                  : ctxObstacles.has(cellKey);
                const isPath = pathSet.has(cellKey) && !isRover && !isStart && !isGoal;
                const isVisited = visitedSet.has(cellKey) && !isObstacle && !isRover && !isStart && !isGoal;

                let symbol: string = '';
                let cellClasses =
                  'relative flex items-center justify-center font-mono font-bold transition-all duration-150 select-none rounded-[2px] border ';

                if (isRover) {
                  symbol = 'R';
                  cellClasses +=
                    'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400/40 z-20 shadow-[0_0_12px_rgba(6,182,212,0.6)]';
                } else if (isGoal) {
                  symbol = 'G';
                  cellClasses += 'bg-emerald-600 text-white border-emerald-400 z-10';
                } else if (isTarget) {
                  symbol = 'T';
                  cellClasses +=
                    'bg-amber-600/80 text-amber-100 border-amber-400/80 animate-pulse';
                } else if (isStart) {
                  symbol = 'S';
                  cellClasses += 'bg-blue-600 text-white border-blue-400';
                } else if (isObstacle) {
                  symbol = 'X';
                  cellClasses +=
                    'bg-rose-950 text-rose-300 border-rose-800/80 shadow-inner hover:bg-rose-900';
                } else if (isPath) {
                  symbol = '*';
                  cellClasses +=
                    'bg-cyan-950/70 text-cyan-300 border-cyan-700/60 shadow-[0_0_6px_rgba(6,182,212,0.2)]';
                } else if (isVisited) {
                  cellClasses += 'bg-slate-800/50 text-slate-400 border-slate-700/30';
                } else {
                  cellClasses +=
                    'bg-[#0E131F] text-slate-600 border-slate-800/70 hover:bg-slate-800/60 hover:border-slate-700';
                }

                if (interactive && !isRover && !isStart && !isGoal) {
                  cellClasses += ' cursor-pointer active:scale-95';
                }

                return (
                  <button
                    key={cellKey}
                    type="button"
                    onClick={() => interactive && toggleObstacle(cellPoint)}
                    title={`Cell (${x}, ${y})${isObstacle ? ' [Obstacle]' : isRover ? ' [Rover]' : isGoal ? ' [Goal]' : isStart ? ' [Start]' : isTarget ? ' [Target]' : ' [Click to toggle obstacle]'}`}
                    className={`${cellSizeClass} ${cellClasses}`}
                  >
                    {isRover ? (
                      <div className="flex flex-col items-center justify-center">
                        <Navigation
                          className="w-3.5 h-3.5 transform"
                          style={{ transform: `rotate(${heading}deg)` }}
                        />
                      </div>
                    ) : (
                      <span>{symbol}</span>
                    )}

                    {/* Subtle dot on planned path */}
                    {isPath && (
                      <span className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Grid Legend Required by Prompt */}
      {showLegend && (
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-mono text-slate-300 bg-[#0A0D15]/80 px-4 py-2 border border-slate-800 rounded">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-[2px] bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              S
            </span>
            <span className="text-slate-400">Start ({startPos.x},{startPos.y})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-[2px] bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
              G
            </span>
            <span className="text-slate-400">Goal ({goalPos.x},{goalPos.y})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-[2px] bg-rose-950 text-rose-300 border border-rose-800 flex items-center justify-center text-[10px] font-bold">
              X
            </span>
            <span className="text-slate-400">Obstacle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-[2px] bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
              R
            </span>
            <span className="text-slate-400">Rover</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-[2px] bg-cyan-950 text-cyan-300 border border-cyan-700 flex items-center justify-center text-[10px] font-bold">
              *
            </span>
            <span className="text-slate-400">Planned Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-[2px] bg-amber-600/80 text-amber-100 flex items-center justify-center text-[10px] font-bold">
              T
            </span>
            <span className="text-slate-400">Target (Person)</span>
          </div>
        </div>
      )}
    </div>
  );
}
