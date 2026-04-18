import React, { useMemo } from 'react';
import { BOARD_SIZE, TOTAL_CELLS, getCoordinatesFromCell, getPlayerOffset, getTokenMetrics } from '../../core/Pathfinding';
import type { Player } from '../../core/GameState';
import type { Tile } from '../../core/MapBuilderState';
import { MAP_SIZE } from '../../core/MapBuilderState';
import { Sparkles } from 'lucide-react';

interface BoardGridProps {
  players: Player[];
  map?: Tile[] | null;
}

export const BoardGrid: React.FC<BoardGridProps> = ({ players, map }) => {
  const cellSizePct = map ? (100 / MAP_SIZE) : (100 / BOARD_SIZE);
  const { tokenSizePct, centerOffset } = getTokenMetrics(cellSizePct);

  const legacyCells = useMemo(() => {
    const list = [];
    for (let i = 1; i <= TOTAL_CELLS; i++) {
      list.push(i);
    }
    return list;
  }, []);

  return (
    <div className="relative w-full aspect-square bg-white border-2 border-slate-300 mx-auto overflow-hidden">

      {map ? (
        /* Custom map — ONLY render Tile[] path elements, NO background grid */
        <div className="w-full h-full relative">
          {map.map((tile) => {
            const { x, y, type, stepIndex } = tile;
            let bgColor = 'bg-slate-200';
            let content: React.ReactNode = <span className="text-slate-500 font-bold text-[10px]">{stepIndex}</span>;

            if (type === 'START') {
              bgColor = 'bg-emerald-400';
              content = <span className="font-black text-emerald-900 text-xs">IN</span>;
            } else if (type === 'END') {
              bgColor = 'bg-rose-500';
              content = <span className="font-black text-white text-xs">OUT</span>;
            } else if (type === 'MYSTERY') {
              bgColor = 'bg-purple-500';
              content = <Sparkles size={14} className="text-white" />;
            }

            return (
              <div
                key={`tile-${stepIndex}`}
                className={`absolute shadow-sm flex items-center justify-center z-10 ${bgColor} border border-slate-300`}
                style={{
                  width: `${cellSizePct}%`,
                  height: `${cellSizePct}%`,
                  left: `${x * cellSizePct}%`,
                  top: `${y * cellSizePct}%`,
                }}
              >
                {content}
              </div>
            );
          })}
        </div>
      ) : (
        /* Legacy 36-cell perimeter board — clean, no alternating patterns */
        legacyCells.map((cell) => {
          const { x, y } = getCoordinatesFromCell(cell);
          let bgClass = 'bg-slate-50';
          let textClass = 'text-slate-400';

          if (cell === 1) { bgClass = 'bg-emerald-100'; textClass = 'text-emerald-600 font-black'; }
          else if (cell === TOTAL_CELLS) { bgClass = 'bg-rose-100'; textClass = 'text-rose-600 font-black'; }

          return (
            <div
              key={cell}
              className={`absolute flex items-center justify-center border border-slate-200 ${bgClass}`}
              style={{
                width: `${cellSizePct}%`,
                height: `${cellSizePct}%`,
                left: `${x * cellSizePct}%`,
                top: `${y * cellSizePct}%`,
              }}
            >
              <span className={`${textClass} text-xs pointer-events-none`}>{cell}</span>
            </div>
          );
        })
      )}

      {/* Player tokens — scaled to 70% of cell, centered */}
      {players.map((p, index) => {
        let x = 0, y = 0;

        if (map && map.length > 0) {
          const tile = map[p.position];
          if (tile) { x = tile.x; y = tile.y; }
        } else {
          const coords = getCoordinatesFromCell(p.position);
          x = coords.x; y = coords.y;
        }

        const { offsetX, offsetY } = getPlayerOffset(index, cellSizePct);

        return (
          <div
            key={p.id}
            id={p.id}
            className="absolute z-20 rounded-full shadow-lg flex items-center justify-center font-bold text-[10px] ring-2 ring-white"
            style={{
              width: `${tokenSizePct}%`,
              height: `${tokenSizePct}%`,
              left: `${x * cellSizePct + centerOffset + offsetX}%`,
              top: `${y * cellSizePct + centerOffset + offsetY}%`,
              backgroundColor: p.color,
              color: '#fff',
            }}
          >
            {p.name.charAt(0).toUpperCase()}
          </div>
        );
      })}
    </div>
  );
};
