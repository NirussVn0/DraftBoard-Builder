import React, { useMemo } from 'react';
import type { Tile } from '../../core/MapBuilderState';
import { hashString, seededRandom } from '../../core/SeededRandom';

type BiomeTheme = 'FOREST' | 'ICE' | 'DESERT' | 'TEMPTATION' | 'FORGE' | 'SUMMIT' | 'OFF';

const BIOME_EMOJIS: Record<Exclude<BiomeTheme, 'OFF'>, string[]> = {
  TEMPTATION: ['📱', '🎮', '🛏️', '🕸️'],
  FORGE:      ['📚', '☕', '⏰', '🕯️'],
  SUMMIT:     ['🎓', '🏆', '✨'],
  FOREST:     ['🌲', '🌳', '🍄', '🌿', '🏕️'],
  ICE:        ['❄️', '⛄', '🏔️', '🧊'],
  DESERT:     ['🌵', '🐪', '🏜️'],
};

interface EnvironmentLayerProps {
  tiles: Tile[];
  gridSize: number;
  tilePx: number;
  biome: BiomeTheme;
  mapKey: string; // seed key — hash of map to keep placement deterministic
  envMap?: Record<string, string>;
}

export const EnvironmentLayer: React.FC<EnvironmentLayerProps> = ({
  tiles,
  gridSize,
  tilePx,
  biome,
  mapKey,
  envMap,
}) => {
  const emojis = useMemo(() => {
    const results: { x: number; y: number; emoji: string; opacity: number; rotate: number }[] = [];
    const pathSet = new Set(tiles.map(t => `${t.x},${t.y}`));

    // 1. First add custom painted environments from MapBuilder
    if (envMap) {
      Object.entries(envMap).forEach(([key, emoji]) => {
        if (!emoji) return;
        const [xStr, yStr] = key.split(',');
        const x = parseInt(xStr, 10);
        const y = parseInt(yStr, 10);
        if (isNaN(x) || isNaN(y)) return;
        
        results.push({
          x,
          y,
          emoji,
          opacity: 1.0,
          rotate: 0,
        });
      });
    }

    // 2. Then add procedurally generated biome environments
    if (biome !== 'OFF') {
      const list = BIOME_EMOJIS[biome as Exclude<BiomeTheme, 'OFF'>];
      const rand = seededRandom(hashString(mapKey));

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const key = `${col},${row}`;
          // Don't place random biome if there's a path or a custom painted environment there
          if (pathSet.has(key) || (envMap && envMap[key])) continue;
          
          // ~35% fill density
          if (rand() > 0.35) continue;
          results.push({
            x: col,
            y: row,
            emoji: list[Math.floor(rand() * list.length)],
            opacity: 0.4 + rand() * 0.4,
            rotate: Math.floor(rand() * 40) - 20,
          });
        }
      }
    }
    return results;
  }, [tiles, gridSize, biome, mapKey, envMap]);

  if (emojis.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {emojis.map((item, i) => (
        <span
          key={i}
          className="absolute select-none"
          style={{
            left: item.x * tilePx + tilePx * 0.1,
            top: item.y * tilePx + tilePx * 0.1,
            width: tilePx * 0.8,
            height: tilePx * 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: tilePx * 0.5,
            opacity: item.opacity,
            transform: `rotate(${item.rotate}deg)`,
          }}
          aria-hidden="true"
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
};

export type { BiomeTheme };
