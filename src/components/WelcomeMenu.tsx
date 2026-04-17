import React from 'react';
import { Play, PenTool } from 'lucide-react';

interface WelcomeMenuProps {
  onSelectMode: (mode: 'PLAYING' | 'BUILDER') => void;
}

export const WelcomeMenu: React.FC<WelcomeMenuProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-[2rem] shadow-2xl p-10 border border-slate-700 text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400 mb-2">
          DraftBoard
        </h1>
        <p className="text-slate-400 font-medium mb-12">Select your game mode</p>

        <div className="space-y-4">
          <button
            onClick={() => onSelectMode('PLAYING')}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:-translate-y-1 transition-all"
          >
            <Play size={24} /> Play Default Map
          </button>

          <button
            onClick={() => onSelectMode('BUILDER')}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold bg-slate-700 hover:bg-slate-600 text-white shadow-lg hover:-translate-y-1 transition-all"
          >
            <PenTool size={24} /> Create Map Builder
          </button>
        </div>
      </div>
    </div>
  );
};
