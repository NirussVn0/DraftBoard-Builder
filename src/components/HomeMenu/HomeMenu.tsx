import React, { useState } from 'react';
import type { Player } from '../../core/GameState';
import { t } from '../../locales';

interface HomeMenuProps {
  onStart: (players: Omit<Player, 'id' | 'position'>[]) => void;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({ onStart }) => {
  const s = t().home;
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [players, setPlayers] = useState<{name: string, color: string}[]>([
    { name: s.playerDefault(1), color: '#aa3bff' },
    { name: s.playerDefault(2), color: '#10b981' }
  ]);

  const handleNumChange = (num: number) => {
    setNumPlayers(num);
    const newPlayers = [...players];
    while (newPlayers.length < num) {
      newPlayers.push({ name: s.playerDefault(newPlayers.length + 1), color: '#888888' });
    }
    setPlayers(newPlayers.slice(0, num));
  };

  const updatePlayer = (index: number, field: 'name' | 'color', value: string) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white game-card p-8">
        <h1 className="text-4xl font-black text-center mb-8 bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 to-purple-600">
          {s.title}
        </h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{s.numPlayers}</label>
            <div className="flex gap-2">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumChange(num)}
                  className={`flex-1 py-3 game-card font-bold transition-all ${
                    numPlayers === num 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{s.playerSetup}</label>
            {players.map((player, index) => (
              <div key={index} className="flex gap-3 items-center bg-slate-50 p-3 game-card">
                <input
                  type="color"
                  value={player.color}
                  onChange={(e) => updatePlayer(index, 'color', e.target.value)}
                  className="w-10 h-10 cursor-pointer border-0 p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                  className="flex-1 bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                  style={{ borderRadius: 'var(--card-radius)' }}
                  placeholder={s.playerDefault(index + 1)}
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => onStart(players)}
            className="w-full py-4 mt-4 bg-indigo-600 text-white game-card hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-lg"
          >
            {s.startGame}
          </button>
        </div>
      </div>
    </div>
  );
};
