import React, { useState } from 'react';
import type { Player } from '../../core/GameState';

interface HomeMenuProps {
  onStart: (players: Omit<Player, 'id' | 'position'>[]) => void;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({ onStart }) => {
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [players, setPlayers] = useState<{name: string, color: string}[]>([
    { name: 'Player 1', color: '#aa3bff' },
    { name: 'Player 2', color: '#10b981' }
  ]);

  const handleNumChange = (num: number) => {
    setNumPlayers(num);
    const newPlayers = [...players];
    while (newPlayers.length < num) {
      newPlayers.push({ name: `Player ${newPlayers.length + 1}`, color: '#888888' });
    }
    setPlayers(newPlayers.slice(0, num));
  };

  const updatePlayer = (index: number, field: 'name' | 'color', value: string) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  return (
    <div className="flex flex-col items-center h-full space-y-8 glass p-10 rounded-2xl max-w-md w-full mx-auto mt-[10vh] shadow-2xl">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">DraftBoard</h1>
      
      <div className="w-full space-y-4 text-left">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Number of Players</label>
        <div className="flex gap-2">
          {[2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => handleNumChange(n)}
              className={`flex-1 py-2 rounded-md font-semibold transition-colors ${numPlayers === n ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full space-y-4">
        {players.map((p, i) => (
          <div key={i} className="flex gap-4 items-center bg-white/50 dark:bg-black/20 p-2 rounded-lg">
            <input 
              type="color" 
              value={p.color} 
              onChange={(e) => updatePlayer(i, 'color', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
            <input 
              type="text" 
              value={p.name}
              onChange={(e) => updatePlayer(i, 'name', e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none px-3 py-2 font-medium"
              placeholder={`Player ${i + 1}`}
            />
          </div>
        ))}
      </div>

      <button 
        onClick={() => onStart(players)}
        className="w-full py-4 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-bold text-lg shadow-lg transform transition hover:shadow-xl active:scale-95"
      >
        START GAME
      </button>
    </div>
  );
};
