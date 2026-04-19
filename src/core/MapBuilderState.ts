import { useState, useCallback } from 'react';

import type { CardId } from './CardTypes';

export type BuilderTool = 'DRAW_PATH' | 'ERASE_PATH' | 'PLACE_CARD' | 'ERASE_CARD' | 'PAINT_ENV';

export type TileType = 'START' | 'NORMAL' | 'MYSTERY' | 'END';

export interface Tile {
  stepIndex: number;
  x: number;
  y: number;
  type: TileType;
  cardId?: CardId;
}

export interface EnvItem {
  id: string;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  emoji: string;
}

export type EnvironmentMap = EnvItem[];

export interface MapState {
  path: Tile[];
  env: EnvironmentMap;
}

export const MAP_SIZE = 15;

export function generateZigzagMap(): MapState {
  const tiles: Tile[] = [];
  let step = 0;

  tiles.push({ stepIndex: step++, x: 0, y: 0, type: 'START' });

  for (let x = 1; x <= 5; x++) tiles.push({ stepIndex: step++, x, y: 0, type: 'NORMAL' });
  for (let y = 1; y <= 5; y++) tiles.push({ stepIndex: step++, x: 5, y, type: 'NORMAL' });
  for (let x = 4; x >= 0; x--) tiles.push({ stepIndex: step++, x, y: 5, type: 'NORMAL' });
  for (let y = 6; y <= 10; y++) tiles.push({ stepIndex: step++, x: 0, y, type: 'NORMAL' });
  for (let x = 1; x <= 4; x++) tiles.push({ stepIndex: step++, x, y: 10, type: 'NORMAL' });

  tiles.push({ stepIndex: step++, x: 5, y: 10, type: 'END' });
  return { path: tiles, env: {} };
}

export function useMapBuilder() {
  const [history, setHistory] = useState<MapState[]>([{ path: [], env: [] }]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const currentState = history[historyIndex] || { path: [], env: [] };
  const { path, env } = currentState;

  const pushState = useCallback((newState: MapState) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const addNode = useCallback((x: number, y: number) => {
    const currentPath = path;

    if (currentPath.length === 0) {
      pushState({ path: [{ stepIndex: 0, x, y, type: 'START' }], env });
      return;
    }

    const lastNode = currentPath[currentPath.length - 1];

    if (lastNode.x !== x && lastNode.y !== y) return;
    if (lastNode.x === x && lastNode.y === y) return;

    const newNodes: Tile[] = [];
    let step = currentPath.length;

    if (lastNode.y === y) {
      const dx = x > lastNode.x ? 1 : -1;
      let cx = lastNode.x + dx;
      while (cx !== x + dx) {
        newNodes.push({ stepIndex: step++, x: cx, y, type: 'NORMAL' });
        cx += dx;
      }
    } else if (lastNode.x === x) {
      const dy = y > lastNode.y ? 1 : -1;
      let cy = lastNode.y + dy;
      while (cy !== y + dy) {
        newNodes.push({ stepIndex: step++, x, y: cy, type: 'NORMAL' });
        cy += dy;
      }
    }

    pushState({ path: [...currentPath, ...newNodes], env });
  }, [path, env, pushState]);

  const eraseFrom = useCallback((stepIndex: number) => {
    if (stepIndex === 0) {
      pushState({ path: [], env });
      return;
    }
    const newPath = path.slice(0, stepIndex + 1);
    newPath[newPath.length - 1] = { ...newPath[newPath.length - 1], type: 'END' };
    pushState({ path: newPath, env });
  }, [path, env, pushState]);

  const setCard = useCallback((stepIndex: number, cardId: CardId | undefined) => {
    const newPath = path.map(t => {
      if (t.stepIndex === stepIndex && t.type === 'NORMAL') {
        return { ...t, cardId };
      }
      return t;
    });
    pushState({ path: newPath, env });
  }, [path, env, pushState]);

  const addEnvItem = useCallback((x: number, y: number, emoji: string) => {
    const newEnv = [...env, { id: crypto.randomUUID(), x, y, emoji }];
    pushState({ path, env: newEnv });
  }, [path, env, pushState]);

  const removeEnvItem = useCallback((id: string) => {
    const newEnv = env.filter(item => item.id !== id);
    pushState({ path, env: newEnv });
  }, [path, env, pushState]);

  const randomFill = useCallback((cardId: CardId, count: number) => {
    const emptyTiles = path.filter(t => t.type === 'NORMAL' && !t.cardId);
    if (emptyTiles.length === 0) return;

    const fillCount = Math.min(count, emptyTiles.length);
    const shuffled = [...emptyTiles].sort(() => Math.random() - 0.5);
    const selected = new Set(shuffled.slice(0, fillCount).map(t => t.stepIndex));

    const newPath = path.map(t => {
      if (selected.has(t.stepIndex)) {
        return { ...t, cardId };
      }
      return t;
    });
    pushState({ path: newPath, env });
  }, [path, env, pushState]);

  const clearMap = useCallback(() => {
    pushState({ path: [], env: [] });
  }, [pushState]);

  const undo = useCallback(() => {
    setHistoryIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const loadMap = useCallback((newState: any) => {
    if (newState.env && !Array.isArray(newState.env)) {
      // Migrate from Record<string, string> to EnvItem[]
      const migratedEnv: EnvItem[] = [];
      Object.entries(newState.env).forEach(([key, emoji]) => {
        if (!emoji) return;
        const [xStr, yStr] = key.split(',');
        const gridX = parseInt(xStr, 10);
        const gridY = parseInt(yStr, 10);
        if (isNaN(gridX) || isNaN(gridY)) return;
        migratedEnv.push({
          id: crypto.randomUUID(),
          x: (gridX / MAP_SIZE) * 100 + (100 / MAP_SIZE) / 2, // roughly center of cell
          y: (gridY / MAP_SIZE) * 100 + (100 / MAP_SIZE) / 2,
          emoji: emoji as string
        });
      });
      pushState({ path: newState.path || [], env: migratedEnv });
    } else {
      pushState({ path: newState.path || [], env: newState.env || [] });
    }
  }, [pushState]);

  return {
    path, env, addNode, eraseFrom, setCard, randomFill, clearMap, loadMap, addEnvItem, removeEnvItem,
    undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1
  };
}
