import React, { useMemo } from 'react';
import { BOARD_SIZE, TOTAL_CELLS, getCoordinatesFromCell, getPlayerOffset } from '../../core/Pathfinding';
import type { Player } from '../../core/GameState';

interface BoardGridProps {
  players: Player[];
  children?: React.ReactNode;
}

export const BoardGrid: React.FC<BoardGridProps> = ({ players, children }) => {
  const cells = useMemo(() => {
    const list = [];
    for (let i = 1; i <= TOTAL_CELLS; i++) {
        list.push(i);
    }
    return list;
  }, []);

  return (
    <div className="relative w-full aspect-square bg-slate-50 border-4 border-slate-200 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] mx-auto">
      {cells.map((cell) => {
        const { x, y } = getCoordinatesFromCell(cell);
        
        const isAlternate = (x + y) % 2 === 0;
        
        let bgClass = isAlternate ? "bg-indigo-50/50" : "bg-white";
        let textClass = "text-slate-300";
        let borderClass = "border-slate-200/60";
        let roundedClass = "";

        if (cell === 1) {
          bgClass = "bg-indigo-100/80"; textClass = "text-indigo-400 font-black text-base"; borderClass = "border-indigo-200"; roundedClass = "rounded-tl-[1.8rem]";
        } else if (cell === 10) {
          bgClass = "bg-indigo-100/80"; textClass = "text-indigo-400 font-black text-base"; borderClass = "border-indigo-200"; roundedClass = "rounded-tr-[1.8rem]";
        } else if (cell === 19) {
          bgClass = "bg-indigo-100/80"; textClass = "text-indigo-400 font-black text-base"; borderClass = "border-indigo-200"; roundedClass = "rounded-br-[1.8rem]";
        } else if (cell === 28) {
          bgClass = "bg-indigo-100/80"; textClass = "text-indigo-400 font-black text-base"; borderClass = "border-indigo-200"; roundedClass = "rounded-bl-[1.8rem]";
        }

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
            <span className={`${textClass} text-xs pointer-events-none opacity-80`}>
              {cell}
            </span>
          </div>
        );
      })}

      <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] p-6 flex flex-col items-center justify-center">
        <div className="w-full h-full bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl flex items-center justify-center overflow-hidden">
          {children}
        </div>
      </div>

      {/* Players */}
      {players.map((p, index) => {
        const { x, y } = getCoordinatesFromCell(p.position);
        
        const { offsetX, offsetY } = getPlayerOffset(index);

        return (
          <div
            key={p.id}
            id={p.id}
            className="absolute z-20 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.2)] flex items-center justify-center font-bold text-xs ring-4 ring-white"
            style={{
              width: '6%',
              height: '6%',
              left: `${x * 10 + 2 + offsetX}%`,
              top: `${y * 10 + 2 + offsetY}%`,
              backgroundColor: p.color,
              color: '#fff',
              transformOrigin: 'bottom center',
            }}
          >
            {p.name.charAt(0).toUpperCase()}
          </div>
        )
      })}
    </div>
  );
};
