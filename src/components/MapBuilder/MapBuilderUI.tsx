import React from 'react';
import { MAP_SIZE, useMapBuilder } from '../../core/MapBuilderState';
import type { Tile } from '../../core/MapBuilderState';
import { ArrowRight, ArrowDown, ArrowLeft, ArrowUp, Eraser, Sparkles, RefreshCcw, Save, Undo2, Redo2 } from 'lucide-react';

interface MapBuilderUIProps {
  onSave: (path: Tile[]) => void;
  onCancel: () => void;
}

export const MapBuilderUI: React.FC<MapBuilderUIProps> = ({ onSave, onCancel }) => {
  const { path, addNode, eraseFrom, toggleMystery, clearMap, undo, redo, canUndo, canRedo } = useMapBuilder();
  const [tool, setTool] = React.useState<'DRAW' | 'ERASE' | 'MYSTERY'>('DRAW');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (canRedo) redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  const handleCellClick = (x: number, y: number) => {
    // Check if cell is part of path
    const tilesAtCell = path.filter(t => t.x === x && t.y === y);
    const hasTile = tilesAtCell.length > 0;

    if (tool === 'DRAW') {
      addNode(x, y);
    } else if (tool === 'ERASE' && hasTile) {
      // Find the specific step index to cut from (highest/latest is safest)
      const maxStep = Math.max(...tilesAtCell.map(t => t.stepIndex));
      eraseFrom(maxStep);
    } else if (tool === 'MYSTERY' && hasTile) {
      const maxStep = Math.max(...tilesAtCell.map(t => t.stepIndex));
      toggleMystery(maxStep);
    }
  };

  const renderArrows = () => {
    const arrows = [];
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      
      const dx = next.x - current.x;
      const dy = next.y - current.y;

      let ArrowIcon = null;
      let offset = {};

      if (dx === 1) { ArrowIcon = ArrowRight; offset = { right: '-12px', top: '50%', transform: 'translateY(-50%)' }; }
      if (dx === -1) { ArrowIcon = ArrowLeft; offset = { left: '-12px', top: '50%', transform: 'translateY(-50%)' }; }
      if (dy === 1) { ArrowIcon = ArrowDown; offset = { bottom: '-12px', left: '50%', transform: 'translateX(-50%)' }; }
      if (dy === -1) { ArrowIcon = ArrowUp; offset = { top: '-12px', left: '50%', transform: 'translateX(-50%)' }; }

      if (ArrowIcon) {
        arrows.push(
          <div 
            key={`arrow-${i}`} 
            className="absolute z-20 text-slate-800"
            style={{
              position: 'absolute',
              width: `${100 / MAP_SIZE}%`,
              height: `${100 / MAP_SIZE}%`,
              left: `${current.x * (100 / MAP_SIZE)}%`,
              top: `${current.y * (100 / MAP_SIZE)}%`,
              pointerEvents: 'none'
            }}
          >
            <div style={{ position: 'absolute', ...offset }} className="bg-yellow-400 rounded-full border-2 border-white shadow-sm p-0.5 z-30">
              <ArrowIcon size={12} strokeWidth={4} />
            </div>
          </div>
        );
      }
    }
    return arrows;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex p-4 sm:p-8 gap-8 font-sans items-center justify-center">
      <div className="w-64 bg-slate-800 text-white rounded-3xl p-6 shadow-2xl flex flex-col gap-6 border border-slate-700">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          Map Builder
        </h2>

        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tools</p>
          <button 
            onClick={() => setTool('DRAW')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-colors ${tool === 'DRAW' ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            <ArrowRight size={20} /> Draw Path
          </button>
          <button 
            onClick={() => setTool('ERASE')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-colors ${tool === 'ERASE' ? 'bg-rose-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            <Eraser size={20} /> Eraser
          </button>
          <button 
            onClick={() => setTool('MYSTERY')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-colors ${tool === 'MYSTERY' ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            <Sparkles size={20} /> Mystery Box
          </button>
        </div>

        <div className="flex gap-2 mt-2">
          <button 
            onClick={undo} disabled={!canUndo}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl font-bold transition-colors ${canUndo ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'}`}
          >
            <Undo2 size={16} />
          </button>
          <button 
            onClick={redo} disabled={!canRedo}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl font-bold transition-colors ${canRedo ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'}`}
          >
            <Redo2 size={16} />
          </button>
        </div>

        <div className="space-y-3 mt-auto">
          <button 
            onClick={clearMap}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <RefreshCcw size={18} /> Clear Map
          </button>
          <button 
            onClick={() => {
               // Must have at least a path
               if (path.length > 5 && path[path.length - 1].type !== 'START') {
                 // Force last tile to be END if it isn't already (though eraser handles it, direct drawing doesn't)
                 const finalPath = [...path];
                 finalPath[finalPath.length - 1] = { ...finalPath[finalPath.length - 1], type: 'END' };
                 onSave(finalPath);
               } else {
                 alert("Map is too short or invalid.");
               }
            }}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Save size={20} /> Save & Play
          </button>
          <button onClick={onCancel} className="w-full text-slate-400 hover:text-white text-sm font-bold pt-2">
            Cancel
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-3xl aspect-square bg-slate-800 rounded-[2.5rem] border-8 border-slate-700 shadow-2xl relative overflow-hidden flex items-center justify-center">
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
                onClick={() => handleCellClick(x, y)}
                className={`border-[0.5px] border-slate-700/50 cursor-pointer hover:bg-indigo-500/20 transition-colors ${isAlternate ? 'bg-slate-800/80' : 'bg-slate-800'}`}
              />
            );
          })}

          {path.map((tile) => {
            const { x, y, type, stepIndex } = tile;
            let bgColor = 'bg-slate-200';
            let content = null;

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
                 onClick={() => handleCellClick(x, y)}
                 className={`absolute shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110 z-10 
                   ${bgColor} ${tile.stepIndex === path.length - 1 ? 'ring-4 ring-white animate-pulse' : 'border-2 border-slate-800'} rounded-lg`}
                 style={{
                    width: `calc(${100 / MAP_SIZE}% - 4px)`,
                    height: `calc(${100 / MAP_SIZE}% - 4px)`,
                    left: `calc(${x * (100 / MAP_SIZE)}% + 2px)`,
                    top: `calc(${y * (100 / MAP_SIZE)}% + 2px)`,
                 }}
               >
                 {content}
               </div>
            )
          })}

          {renderArrows()}
        </div>
      </div>
    </div>
  );
};
