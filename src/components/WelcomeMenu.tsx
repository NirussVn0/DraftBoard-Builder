import React from 'react';
import { Play, PenTool, FolderOpen, History } from 'lucide-react';
import { t } from '../locales';

interface WelcomeMenuProps {
  onSelectMode: (mode: 'PLAYING' | 'BUILDER' | 'PLAY_SAVED' | 'RESUME') => void;
}

export const WelcomeMenu: React.FC<WelcomeMenuProps> = ({ onSelectMode }) => {
  const hasSavedMap = !!localStorage.getItem('draftboard_saved_map');
  const hasSavedGame = !!localStorage.getItem('draftboard_saved_game');
  const s = t().welcome;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white game-card p-10 text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600 mb-2">
          {s.title}
        </h1>
        <p className="text-slate-500 font-medium mb-12">{s.subtitle}</p>

        <div className="space-y-4">
          {/* Nút 1: Tạo Map Mới (luôn hiện) */}
          <button
            id="btn-create-map"
            onClick={() => onSelectMode('BUILDER')}
            className="w-full flex items-center justify-center gap-3 py-5 game-card font-bold bg-indigo-600 hover:bg-indigo-500 text-white hover:-translate-y-1 transition-all"
          >
            <PenTool size={24} /> {s.createBuilder}
          </button>

          {/* Nút 2: Chơi Map Đã Lưu (chỉ hiện khi có draftboard_saved_map) */}
          {hasSavedMap && (
            <button
              id="btn-play-saved"
              onClick={() => onSelectMode('PLAY_SAVED')}
              className="w-full flex items-center justify-center gap-3 py-5 game-card font-bold bg-amber-500 hover:bg-amber-400 text-white hover:-translate-y-1 transition-all"
            >
              <FolderOpen size={24} /> {s.playSaved}
            </button>
          )}

          {/* Nút 3: Chơi Tiếp Ván Cũ (chỉ hiện khi có draftboard_saved_game) */}
          {hasSavedGame && (
            <button
              id="btn-resume-game"
              onClick={() => onSelectMode('RESUME')}
              className="w-full flex items-center justify-center gap-3 py-5 game-card font-bold bg-emerald-600 hover:bg-emerald-500 text-white hover:-translate-y-1 transition-all"
            >
              <History size={24} /> {s.resumeGame}
            </button>
          )}

          {/* Nút Chơi Map Mặc Định (fallback) */}
          <button
            id="btn-play-default"
            onClick={() => onSelectMode('PLAYING')}
            className="w-full flex items-center justify-center gap-3 py-4 game-card font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:-translate-y-1 transition-all"
          >
            <Play size={22} /> {s.playDefault}
          </button>
        </div>
      </div>
    </div>
  );
};
