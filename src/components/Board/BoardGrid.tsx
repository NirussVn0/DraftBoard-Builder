import React, { useMemo } from 'react';
import { BOARD_SIZE, TOTAL_CELLS, getCoordinatesFromCell, getPlayerOffset } from '../../core/Pathfinding';
import type { Player } from '../../core/GameState';

interface BoardGridProps {
  players: Player[];
}

export const BoardGrid: React.FC<BoardGridProps> = ({ players }) => {
  const cells = useMemo(() => {
    const list = [];
    for (let i = 1; i <= TOTAL_CELLS; i++) {
        list.push(i);
    }
    return list;
  }, []);

  return (
    <div className="relative w-full max-w-[600px] aspect-square bg-white dark:bg-[#121212] border-2 border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden glass shadow-2xl mx-auto">
      {cells.map((cell) => {
        const { x, y } = getCoordinatesFromCell(cell);
        
        // Checkerboard effect
        const isAlternate = (x + y) % 2 === 0;
        const bgClass = isAlternate 
          ? "bg-emerald-50/80 dark:bg-emerald-900/20" 
          : "bg-white/80 dark:bg-gray-900/40";

        return (
          <div 
            key={cell}
            className={`absolute flex flex-col items-center justify-center border border-gray-300 dark:border-gray-600 transition-colors ${bgClass}`}
            style={{
              width: `${100 / BOARD_SIZE}%`,
              height: `${100 / BOARD_SIZE}%`,
              left: `${x * (100 / BOARD_SIZE)}%`,
              top: `${y * (100 / BOARD_SIZE)}%`,
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)'
            }}
          >
            <span className="text-gray-400 dark:text-gray-500 font-bold text-xs pointer-events-none opacity-50">
              {cell}
            </span>
          </div>
        );
      })}

      {players.map((p, index) => {
        const { x, y } = getCoordinatesFromCell(p.position);
        
        const { offsetX, offsetY } = getPlayerOffset(index);

        return (
          <div
            key={p.id}
            id={p.id}
            className="absolute z-10 rounded-full shadow-lg flex items-center justify-center font-bold text-xs ring-2 ring-white/50"
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
