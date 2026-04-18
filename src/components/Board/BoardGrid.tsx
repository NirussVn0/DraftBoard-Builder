import React, { useMemo } from 'react';
import { BOARD_SIZE, TOTAL_CELLS, getCoordinatesFromCell, getPlayerOffset } from '../../core/Pathfinding';
import type { Player } from '../../core/GameState';
import type { Tile } from '../../core/MapBuilderState';
import { MAP_SIZE } from '../../core/MapBuilderState';
import { Sparkles } from 'lucide-react';
import { t } from '../../locales';

/** Tile size in pixels — upscaled for fullscreen board */
const TILE_PX = 64;

interface BoardGridProps {
  players: Player[];
  map?: Tile[] | null;
}

export const BoardGrid: React.FC<BoardGridProps> = ({ players, map }) => {
  const gridSize = map ? MAP_SIZE : BOARD_SIZE;
  const boardPx = gridSize * TILE_PX;

  // Cell size in % — used only for getPlayerOffset backward compat
  const cellSizePct = 100 / gridSize;

  const legacyCells = useMemo(() => {
    const list = [];
    for (let i = 1; i <= TOTAL_CELLS; i++) {
      list.push(i);
    }
    return list;
  }, []);

  return (
    <div
      className="relative bg-transparent mx-auto overflow-hidden"
      style={{ width: boardPx, height: boardPx, minWidth: boardPx, minHeight: boardPx }}
    >

      {map ? (
        /* Custom map — ONLY render Tile[] path elements, NO background grid */
        <div className="w-full h-full relative">
          {map.map((tile) => {
            const { x, y, type, stepIndex } = tile;
            let bgColor = 'bg-slate-200';
            let content: React.ReactNode = <span className="text-slate-500 font-bold text-[11px]">{stepIndex}</span>;

            if (type === 'START') {
              bgColor = 'bg-emerald-400';
              content = <span className="font-black text-emerald-900 text-xs">{t().board.tileIn}</span>;
            } else if (type === 'END') {
              bgColor = 'bg-rose-500';
              content = <span className="font-black text-white text-xs">{t().board.tileOut}</span>;
            } else if (type === 'MYSTERY') {
              bgColor = 'bg-purple-500';
              content = <Sparkles size={16} className="text-white" />;
            }

            return (
              <div
                key={`tile-${stepIndex}`}
                className={`absolute shadow-sm flex items-center justify-center z-10 ${bgColor} border border-slate-300`}
                style={{
                  width: TILE_PX,
                  height: TILE_PX,
                  left: x * TILE_PX,
                  top: y * TILE_PX,
                }}
              >
                {content}
              </div>
            );
          })}
        </div>
      ) : (
        /* Legacy 36-cell perimeter board */
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
                width: TILE_PX,
                height: TILE_PX,
                left: x * TILE_PX,
                top: y * TILE_PX,
              }}
            >
              <span className={`${textClass} text-sm pointer-events-none`}>{cell}</span>
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
        const tokenPx = TILE_PX * 0.7;
        const tokenCenter = (TILE_PX - tokenPx) / 2;
        // Convert offset percentage back to px offset
        const pxOffsetX = (offsetX / 100) * boardPx;
        const pxOffsetY = (offsetY / 100) * boardPx;

        return (
          <div
            key={p.id}
            id={p.id}
            className="absolute z-30 rounded-full shadow-lg flex items-center justify-center ring-2 ring-white"
            style={{
              width: tokenPx,
              height: tokenPx,
              left: x * TILE_PX + tokenCenter + pxOffsetX,
              top: y * TILE_PX + tokenCenter + pxOffsetY,
              backgroundColor: p.color,
              fontSize: tokenPx * 0.55,
              lineHeight: 1,
            }}
          >
            {p.emoji || p.name.charAt(0).toUpperCase()}
          </div>
        );
      })}
    </div>
  );
};
