import { useState, useCallback } from 'react';

export type TileType = 'START' | 'NORMAL' | 'MYSTERY' | 'END';

export interface Tile {
  stepIndex: number;
  x: number;
  y: number;
  type: TileType;
}

export const MAP_SIZE = 15;

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
    // First node
    if (currentPath.length === 0) {
      pushState([{ stepIndex: 0, x, y, type: 'START' }]);
      return;
    }

    const lastNode = currentPath[currentPath.length - 1];
    
    // Prevent diagonal building or same cell building
    if (lastNode.x !== x && lastNode.y !== y) return;
    if (lastNode.x === x && lastNode.y === y) return;

    const newNodes: Tile[] = [];
    let step = currentPath.length;

    // Fill horizontally
    if (lastNode.y === y) {
      const dx = x > lastNode.x ? 1 : -1;
      let cx = lastNode.x + dx;
      while (cx !== x + dx) {
        newNodes.push({ stepIndex: step++, x: cx, y, type: 'NORMAL' });
        cx += dx;
      }
    } 
    // Fill vertically
    else if (lastNode.x === x) {
      const dy = y > lastNode.y ? 1 : -1;
      let cy = lastNode.y + dy;
      while (cy !== y + dy) {
        newNodes.push({ stepIndex: step++, x, y: cy, type: 'NORMAL' });
        cy += dy;
      }
    }

    const newPath = [...currentPath, ...newNodes];
    pushState(newPath);
  }, [path, pushState]);

  const eraseFrom = useCallback((stepIndex: number) => {
    if (stepIndex === 0) {
      pushState([]);
      return;
    }
    const current = path;
    const newPath = current.slice(0, stepIndex + 1);
    newPath[newPath.length - 1] = { ...newPath[newPath.length - 1], type: 'END' };
    pushState(newPath);
  }, [path, pushState]);

  const toggleMystery = useCallback((stepIndex: number) => {
    const newPath = path.map(t => {
      if (t.stepIndex === stepIndex && t.type !== 'START' && t.type !== 'END') {
        return { ...t, type: (t.type === 'MYSTERY' ? 'NORMAL' : 'MYSTERY') as TileType };
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

  return { 
    path, addNode, eraseFrom, toggleMystery, clearMap,
    undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1
  };
}
