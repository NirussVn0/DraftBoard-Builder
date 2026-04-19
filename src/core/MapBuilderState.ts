import { useState, useCallback } from 'react';

import type { CardId } from './CardTypes';

export type TileType = 'START' | 'NORMAL' | 'MYSTERY' | 'END';

export interface Tile {
  stepIndex: number;
  x: number;
  y: number;
  type: TileType;
  cardId?: CardId;
}

export const MAP_SIZE = 15;

export function generateZigzagMap(): Tile[] {
  const tiles: Tile[] = [];
  let step = 0;

  tiles.push({ stepIndex: step++, x: 0, y: 0, type: 'START' });

  for (let x = 1; x <= 5; x++) tiles.push({ stepIndex: step++, x, y: 0, type: 'NORMAL' });
  for (let y = 1; y <= 5; y++) tiles.push({ stepIndex: step++, x: 5, y, type: 'NORMAL' });
  for (let x = 4; x >= 0; x--) tiles.push({ stepIndex: step++, x, y: 5, type: 'NORMAL' });
  for (let y = 6; y <= 10; y++) tiles.push({ stepIndex: step++, x: 0, y, type: 'NORMAL' });
  for (let x = 1; x <= 4; x++) tiles.push({ stepIndex: step++, x, y: 10, type: 'NORMAL' });

  tiles.push({ stepIndex: step++, x: 5, y: 10, type: 'END' });
  return tiles;
}

export function useMapBuilder() {
  const [history, setHistory] = useState<Tile[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const path = history[historyIndex] || [];

  const pushState = useCallback((newPath: Tile[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newPath);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const addNode = useCallback((x: number, y: number) => {
    const currentPath = path;

    if (currentPath.length === 0) {
      pushState([{ stepIndex: 0, x, y, type: 'START' }]);
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

    pushState([...currentPath, ...newNodes]);
  }, [path, pushState]);

  const eraseFrom = useCallback((stepIndex: number) => {
    if (stepIndex === 0) {
      pushState([]);
      return;
    }
    const newPath = path.slice(0, stepIndex + 1);
    newPath[newPath.length - 1] = { ...newPath[newPath.length - 1], type: 'END' };
    pushState(newPath);
  }, [path, pushState]);

  const setCard = useCallback((stepIndex: number, cardId: CardId | undefined) => {
    const newPath = path.map(t => {
      if (t.stepIndex === stepIndex && t.type === 'NORMAL') {
        return { ...t, cardId };
      }
      return t;
    });
    pushState(newPath);
  }, [path, pushState]);

  const randomFill = useCallback((cardId: CardId, count: number) => {
    const emptyTiles = path.filter(t => t.type === 'NORMAL' && !t.cardId);
    if (emptyTiles.length === 0) return;

    const fillCount = Math.min(count, emptyTiles.length);
    // Shuffle empty tiles
    const shuffled = [...emptyTiles].sort(() => Math.random() - 0.5);
    const selected = new Set(shuffled.slice(0, fillCount).map(t => t.stepIndex));

    const newPath = path.map(t => {
      if (selected.has(t.stepIndex)) {
        return { ...t, cardId };
      }
      return t;
    });
    pushState(newPath);
  }, [path, pushState]);

  const clearMap = useCallback(() => {
    pushState([]);
  }, [pushState]);

  const undo = useCallback(() => {
    setHistoryIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const loadMap = useCallback((newPath: Tile[]) => {
    pushState(newPath);
  }, [pushState]);

  return {
    path, addNode, eraseFrom, setCard, randomFill, clearMap, loadMap,
    undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1
  };
}
