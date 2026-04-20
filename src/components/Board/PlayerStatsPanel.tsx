import React from 'react';
import { Play } from 'lucide-react';
import type { Player } from '../../core/GameState';
import { t } from '../../locales';
import { gameEngine } from '../../core/GameEngine';

interface PlayerStatsPanelProps {
  players: Player[];
  activePlayerIndex: number;
  maxPosition: number;
}

/** Map buff IDs to their visual icons for the HUD */
const BUFF_ICONS: Record<string, { icon: string; label: string }> = {
  LIFEBUOY:         { icon: '🛟', label: 'Phao Cứu Sinh' },
  COUNTER_ARGUMENT: { icon: '💬', label: 'Phản Biện' },
  PARASITE:         { icon: '🦠', label: 'Ăn Bám' },
  DETENTION:        { icon: '⛓️', label: 'Cấm Túc' },
  FROZEN:           { icon: '⏳', label: 'Đóng Băng Thời Gian' },
};

export const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({
  players, activePlayerIndex, maxPosition
}) => {
  const s = t().stats;

  return (
    <div className="fixed right-4 top-20 z-40 w-64 bg-white/95 backdrop-blur-sm shadow-xl border border-slate-200 p-5 flex flex-col gap-3">
      <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">{s.heading}</h2>
      {players.map((player, index) => {
        const isActive = index === activePlayerIndex;
        return (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-3 border transition-all relative group ${
              isActive ? 'bg-slate-50 border-l-4' : 'border-slate-100 border-l-4 border-l-transparent'
            } ${player.buffs.some(b => b.id === 'FROZEN') ? 'grayscale opacity-50' : ''}`}
            style={{
              borderLeftColor: isActive ? player.color : undefined,
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-base"
              style={{ backgroundColor: player.color }}
            >
              {player.emoji || player.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <p className="font-bold text-sm text-slate-800 truncate">{player.name}</p>
              <p className="text-xs text-slate-400 font-medium">
                {s.cardPosition(player.position, maxPosition)}
              </p>
              {/* Active buff icons */}
              {player.buffs.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {player.buffs.map((buff, bIdx) => {
                    const info = BUFF_ICONS[buff.id];
                    if (!info) return null;
                    return (
                      <span
                        key={bIdx}
                        title={`${info.label}${buff.turnsRemaining > 0 ? ` (${buff.turnsRemaining} lượt)` : ''}`}
                        className="text-sm leading-none cursor-default hover:scale-125 transition-transform"
                      >
                        {info.icon}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            {isActive ? (
              <span
                className="text-[9px] font-black uppercase text-white px-1.5 py-0.5 shrink-0 absolute right-2 top-2"
                style={{ backgroundColor: player.color }}
              >
                {s.turnBadge}
              </span>
            ) : (
              <button
                onClick={() => gameEngine.forceTurn(index)}
                title="Ép đến lượt người này"
                className="absolute right-2 top-2 p-1 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded opacity-0 group-hover:opacity-100 transition-all"
              >
                <Play size={14} fill="currentColor" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
