import React, { useMemo } from 'react';
import { BOARD_SIZE, TOTAL_CELLS, getCoordinatesFromCell, getPlayerOffset } from '../../core/Pathfinding';
import type { Player } from '../../core/GameState';
import type { Tile } from '../../core/MapBuilderState';
import { MAP_SIZE } from '../../core/MapBuilderState';

import { CARD_DEFINITIONS } from '../../core/CardRegistry';
import { t } from '../../locales';
import { EnvironmentLayer } from './EnvironmentLayer';import type { BiomeTheme } from './EnvironmentLayer';

/** Tile size in pixels — upscaled for fullscreen board */
const TILE_PX = 64;

interface BoardGridProps {
  players: Player[];
  map?: Tile[] | null;
  envMap?: { id: string; x: number; y: number; emoji: string; }[];
  biome?: BiomeTheme;
}

export const BoardGrid: React.FC<BoardGridProps> = ({ players, map, envMap, biome = 'OFF' }) => {
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

  // Compute mapKey for EnvironmentLayer
  const mapKey = useMemo(() => {
    if (!map) return 'default-board';
    return map.map(t => `${t.x},${t.y}`).join('|');
  }, [map]);

  return (
    <div
      className="relative mx-auto"
      style={{ 
        width: boardPx, height: boardPx, minWidth: boardPx, minHeight: boardPx,
      }}
    >
      <EnvironmentLayer 
        tiles={map || []} 
        gridSize={gridSize} 
        tilePx={TILE_PX} 
        biome={biome} 
        mapKey={mapKey}
        envMap={envMap}
      />

      {map ? (
        /* Custom map — ONLY render Tile[] path elements, NO background grid */
        <div className="w-full h-full relative">
          {map.map((tile) => {
            const { x, y, type, stepIndex } = tile;
            // Running track color (golden yellow)
            let bgColor = 'bg-amber-400 text-amber-900';
            let bgStyle: React.CSSProperties = {};
            let content: React.ReactNode = <span className="font-bold text-[11px] drop-shadow-sm opacity-60">{stepIndex}</span>;

            const actualCardId = tile.cardId || (type === 'MYSTERY' ? 'MYSTERY' : undefined);

            if (type === 'START') {
              bgColor = 'text-white';
              bgStyle = { backgroundImage: 'repeating-conic-gradient(#1e293b 0% 25%, #f8fafc 0% 50%)', backgroundSize: '16px 16px' };
              content = <span className="font-black bg-black/70 px-1 py-0.5 rounded text-[10px] uppercase shadow-sm">{t().board.tileIn}</span>;
            } else if (type === 'END') {
              bgColor = 'text-white';
              bgStyle = { backgroundImage: 'repeating-conic-gradient(#1e293b 0% 25%, #f8fafc 0% 50%)', backgroundSize: '16px 16px' };
              content = <span className="font-black bg-rose-600/90 px-1 py-0.5 rounded text-[10px] uppercase shadow-sm">{t().board.tileOut}</span>;
            } else if (actualCardId) {
              const def = CARD_DEFINITIONS.get(actualCardId);
              if (def) {
                // Keep the running track background, but add a mini card on top
                const cardColor = def.tier === 'PURPLE' ? 'bg-purple-600' : def.tier === 'RED' ? 'bg-rose-600' : 'bg-emerald-600';
                content = (
                  <div className={`flex flex-col items-center justify-center w-3/4 h-3/4 ${cardColor} rounded border border-white/40 shadow-sm shadow-black/30 group cursor-pointer`} title={def.name}>
                    <span className="text-xl drop-shadow-md group-hover:scale-125 transition-transform leading-none">{def.icon}</span>
                  </div>
                );
              }
            }

            return (
              <div
                key={`tile-${stepIndex}`}
                className={`absolute shadow-md flex items-center justify-center z-10 ${bgColor} border-[1.5px] border-white/60`}
                style={{
                  width: TILE_PX,
                  height: TILE_PX,
                  left: x * TILE_PX,
                  top: y * TILE_PX,
                  ...bgStyle
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
            className={`absolute z-30 rounded-full shadow-lg flex items-center justify-center ring-2 ring-white ${p.buffs.some(b => b.id === 'FROZEN') ? 'grayscale opacity-80' : ''}`}
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
