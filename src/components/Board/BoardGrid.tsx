import React, { useMemo } from 'react';
import { BOARD_SIZE, TOTAL_CELLS, getCoordinatesFromCell, getPlayerOffset } from '../../core/Pathfinding';
import type { Player } from '../../core/GameState';
import type { Tile } from '../../core/MapBuilderState';
import { MAP_SIZE } from '../../core/MapBuilderState';
import { Sparkles } from 'lucide-react';

interface BoardGridProps {
  players: Player[];
  map?: Tile[] | null;
  children?: React.ReactNode;
}

function getTokenPosition(
  playerIndex: number,
  position: number,
  customMap?: Tile[] | null
): { leftPct: number; topPct: number } {
  const { offsetX, offsetY } = getPlayerOffset(playerIndex);

  if (customMap && customMap.length > 0) {
    const tile = customMap[position];
    if (!tile) return { leftPct: 0 + offsetX, topPct: 0 + offsetY };
    const cellSizePct = 100 / MAP_SIZE;
    return {
      leftPct: tile.x * cellSizePct + 2 + offsetX,
      topPct: tile.y * cellSizePct + 2 + offsetY,
    };
  }

  const { x, y } = getCoordinatesFromCell(position);
  return {
    leftPct: x * 10 + 2 + offsetX,
    topPct: y * 10 + 2 + offsetY,
  };
}

export const BoardGrid: React.FC<BoardGridProps> = ({ players, map, children }) => {
  const legacyCells = useMemo(() => {
    const list = [];
    for (let i = 1; i <= TOTAL_CELLS; i++) {
      list.push(i);
    }
    return list;
  }, []);

  return (
    <div className="relative w-full aspect-square bg-slate-50 border-4 border-slate-200 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] mx-auto overflow-hidden">

      {map ? (
        <div
          className="w-full h-full relative"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${MAP_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${MAP_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: MAP_SIZE * MAP_SIZE }).map((_, i) => {
            const x = i % MAP_SIZE;
            const y = Math.floor(i / MAP_SIZE);
            const isAlternate = (x + y) % 2 === 0;
            return (
              <div
                key={`bg-${x}-${y}`}
                className={`${isAlternate ? 'bg-indigo-50/50' : 'bg-white'} border border-slate-200/50`}
              />
            );
          })}

          {map.map((tile) => {
            const { x, y, type, stepIndex } = tile;
            let bgColor = 'bg-slate-200';
            let content: React.ReactNode = <span className="text-slate-400 font-bold opacity-50">{stepIndex}</span>;

            if (type === 'START') {
              bgColor = 'bg-emerald-400';
              content = <span className="font-black text-emerald-900 text-[10px]">IN</span>;
            } else if (type === 'END') {
              bgColor = 'bg-rose-500';
              content = <span className="font-black text-rose-100 text-[10px]">OUT</span>;
            } else if (type === 'MYSTERY') {
              bgColor = 'bg-purple-500';
              content = <Sparkles size={16} className="text-white" />;
            }

            return (
              <div
                key={`tile-${stepIndex}`}
                className={`absolute shadow-lg flex items-center justify-center z-10 ${bgColor} border-2 border-slate-800 rounded-lg`}
                style={{
                  width: `calc(${100 / MAP_SIZE}% - 4px)`,
                  height: `calc(${100 / MAP_SIZE}% - 4px)`,
                  left: `calc(${x * (100 / MAP_SIZE)}% + 2px)`,
                  top: `calc(${y * (100 / MAP_SIZE)}% + 2px)`,
                }}
              >
                {content}
              </div>
            );
          })}
        </div>
      ) : (
        legacyCells.map((cell) => {
          const { x, y } = getCoordinatesFromCell(cell);
          const isAlternate = (x + y) % 2 === 0;
          let bgClass = isAlternate ? 'bg-indigo-50/50' : 'bg-white';
          let textClass = 'text-slate-300';
          let borderClass = 'border-slate-200/60';
          let roundedClass = '';

          if (cell === 1) { bgClass = 'bg-indigo-100/80'; textClass = 'text-indigo-400 font-black text-base'; borderClass = 'border-indigo-200'; roundedClass = 'rounded-tl-[1.8rem]'; }
          else if (cell === 10) { bgClass = 'bg-indigo-100/80'; textClass = 'text-indigo-400 font-black text-base'; borderClass = 'border-indigo-200'; roundedClass = 'rounded-tr-[1.8rem]'; }
          else if (cell === 19) { bgClass = 'bg-indigo-100/80'; textClass = 'text-indigo-400 font-black text-base'; borderClass = 'border-indigo-200'; roundedClass = 'rounded-br-[1.8rem]'; }
          else if (cell === 28) { bgClass = 'bg-indigo-100/80'; textClass = 'text-indigo-400 font-black text-base'; borderClass = 'border-indigo-200'; roundedClass = 'rounded-bl-[1.8rem]'; }

          const isCorner = cell === 1 || cell === 10 || cell === 19 || cell === 28;

          return (
            <div
              key={cell}
              className={`absolute flex flex-col items-center justify-center border transition-colors ${bgClass} ${borderClass} ${roundedClass}`}
              style={{
                width: `${100 / BOARD_SIZE}%`,
                height: `${100 / BOARD_SIZE}%`,
                left: `${x * (100 / BOARD_SIZE)}%`,
                top: `${y * (100 / BOARD_SIZE)}%`,
                boxShadow: isCorner ? 'inset 0 0 15px rgba(99,102,241,0.1)' : 'inset 0 0 5px rgba(0,0,0,0.01)'
              }}
            >
              <span className={`${textClass} text-xs pointer-events-none opacity-80`}>{cell}</span>
            </div>
          );
        })
      )}

      <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] p-6 flex flex-col items-center justify-center">
        <div className="w-full h-full bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl flex items-center justify-center">
          {children}
        </div>
      </div>

      {players.map((p, index) => {
        const { leftPct, topPct } = getTokenPosition(index, p.position, map);

        return (
          <div
            key={p.id}
            id={p.id}
            className="absolute z-20 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.2)] flex items-center justify-center font-bold text-xs ring-4 ring-white"
            style={{
              width: '6%',
              height: '6%',
              left: `${leftPct}%`,
              top: `${topPct}%`,
              backgroundColor: p.color,
              color: '#fff',
              transformOrigin: 'bottom center',
            }}
          >
            {p.name.charAt(0).toUpperCase()}
          </div>
        );
      })}
    </div>
  );
};
