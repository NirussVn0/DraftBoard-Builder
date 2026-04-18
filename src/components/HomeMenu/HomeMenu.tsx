import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData, Theme, EmojiStyle } from 'emoji-picker-react';
import type { Player } from '../../core/GameState';
import { t } from '../../locales';

interface HomeMenuProps {
  onStart: (players: Omit<Player, 'id' | 'position'>[]) => void;
}

const DEFAULT_EMOJIS = ['🦊', '🐸', '🦁', '🐙'];
const DEFAULT_COLORS = ['#aa3bff', '#10b981', '#f59e0b', '#ef4444'];

export const HomeMenu: React.FC<HomeMenuProps> = ({ onStart }) => {
  const s = t().home;
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [players, setPlayers] = useState<{ name: string; color: string; emoji: string }[]>([
    { name: s.playerDefault(1), color: DEFAULT_COLORS[0], emoji: DEFAULT_EMOJIS[0] },
    { name: s.playerDefault(2), color: DEFAULT_COLORS[1], emoji: DEFAULT_EMOJIS[1] },
  ]);
  const [pickerOpenIndex, setPickerOpenIndex] = useState<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on click-outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpenIndex(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNumChange = (num: number) => {
    setNumPlayers(num);
    const newPlayers = [...players];
    while (newPlayers.length < num) {
      const idx = newPlayers.length;
      newPlayers.push({
        name: s.playerDefault(idx + 1),
        color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        emoji: DEFAULT_EMOJIS[idx % DEFAULT_EMOJIS.length],
      });
    }
    setPlayers(newPlayers.slice(0, num));
  };

  const updatePlayer = (index: number, field: 'name' | 'color' | 'emoji', value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const handleEmojiSelect = (index: number, data: EmojiClickData) => {
    updatePlayer(index, 'emoji', data.emoji);
    setPickerOpenIndex(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white game-card p-8">
        <h1 className="text-4xl font-black text-center mb-8 bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 to-purple-600">
          {s.title}
        </h1>

        <div className="space-y-6">
          {/* Player count selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{s.numPlayers}</label>
            <div className="flex gap-2">
              {[2, 3, 4].map((num) => (
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

          {/* Player setup rows */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{s.playerSetup}</label>
            {players.map((player, index) => (
              <div key={index} className="flex gap-3 items-center bg-slate-50 p-3 game-card relative">
                {/* Emoji avatar selector */}
                <button
                  onClick={() => setPickerOpenIndex(pickerOpenIndex === index ? null : index)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 hover:scale-110 active:scale-95 transition-all shadow-sm shrink-0"
                  style={{ borderColor: player.color, backgroundColor: player.color + '20' }}
                  title="Chọn avatar"
                >
                  {player.emoji}
                </button>

                {/* Emoji picker dropdown */}
                {pickerOpenIndex === index && (
                  <div ref={pickerRef} className="absolute top-16 left-0 z-50 shadow-2xl">
                    <EmojiPicker
                      onEmojiClick={(data) => handleEmojiSelect(index, data)}
                      theme={Theme.LIGHT}
                      emojiStyle={EmojiStyle.NATIVE}
                      width={320}
                      height={350}
                      searchPlaceHolder="Tìm emoji..."
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}

                {/* Color picker */}
                <input
                  type="color"
                  value={player.color}
                  onChange={(e) => updatePlayer(index, 'color', e.target.value)}
                  className="w-8 h-8 cursor-pointer border-0 p-0 bg-transparent shrink-0"
                />

                {/* Name input */}
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

          {/* Start button */}
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
