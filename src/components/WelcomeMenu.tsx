import React from 'react';
import { Play, PenTool, FolderOpen } from 'lucide-react';

interface WelcomeMenuProps {
  onSelectMode: (mode: 'PLAYING' | 'BUILDER' | 'PLAY_SAVED') => void;
}

export const WelcomeMenu: React.FC<WelcomeMenuProps> = ({ onSelectMode }) => {
  const hasSavedMap = !!localStorage.getItem('draftboard_saved_map');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-10 border border-slate-200 text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600 mb-2">
          DraftBoard
        </h1>
        <p className="text-slate-500 font-medium mb-12">Select your game mode</p>

        <div className="space-y-4">
          <button
            onClick={() => onSelectMode('PLAYING')}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:-translate-y-1 transition-all"
          >
            <Play size={24} /> Play Default Map
          </button>

          {hasSavedMap && (
            <button
              onClick={() => onSelectMode('PLAY_SAVED')}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold bg-amber-500 hover:bg-amber-400 text-white shadow-lg hover:-translate-y-1 transition-all"
            >
              <FolderOpen size={24} /> Chơi Map Đã Lưu
            </button>
          )}

          <button
            onClick={() => onSelectMode('BUILDER')}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-lg hover:-translate-y-1 transition-all"
          >
            <PenTool size={24} /> Create Map Builder
          </button>
        </div>
      </div>
    </div>
  );
};
