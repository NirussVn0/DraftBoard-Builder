import React from 'react';
import type { Player } from '../../core/GameState';

interface PlayerStatsPanelProps {
  players: Player[];
  activePlayerIndex: number;
  maxPosition: number;
}

export const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({
  players, activePlayerIndex, maxPosition
}) => {
  return (
    <div className="w-56 bg-white border border-slate-200 p-5 flex flex-col gap-3 shrink-0">
      <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Players</h2>
      {players.map((player, index) => {
        const isActive = index === activePlayerIndex;
        return (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-3 border transition-colors ${
              isActive ? 'bg-slate-50 border-l-4' : 'border-slate-100 border-l-4 border-l-transparent'
            }`}
            style={{
              borderLeftColor: isActive ? player.color : undefined,
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
              style={{ backgroundColor: player.color }}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-800 truncate">{player.name}</p>
              <p className="text-xs text-slate-400 font-medium">
                Card {player.position} / {maxPosition}
              </p>
            </div>
            {isActive && (
              <span
                className="text-[9px] font-black uppercase text-white px-1.5 py-0.5 shrink-0"
                style={{ backgroundColor: player.color }}
              >
                Turn
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
