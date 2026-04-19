import React, { useState, useRef, useEffect } from 'react';
import type { EmojiClickData } from 'emoji-picker-react';
import type { Player } from '../../core/GameState';
import type { MapSettings } from '../../core/SettingsState';
import { DEFAULT_MAP } from '../../core/SettingsState';
import { t } from '../../locales';

import { TabBoardRules } from './TabBoardRules';
import { TabSystemUI } from './TabSystemUI';

interface HomeMenuProps {
  onStart: (players: Omit<Player, 'id' | 'position' | 'buffs'>[], mapSettings: MapSettings) => void;
}

const DEFAULT_EMOJIS = ['🦊', '🐸', '🦁', '🐙', '🐶', '🐱', '🐰', '🐼'];
const DEFAULT_COLORS = ['#aa3bff', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];

export const HomeMenu: React.FC<HomeMenuProps> = ({ onStart }) => {
  const s = t().home;
  const tabs = t().tabs;

  const [activeTab, setActiveTab] = useState<'BOARD' | 'SYSTEM'>('BOARD');

  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [players, setPlayers] = useState<{ name: string; color: string; emoji: string }[]>([
    { name: s.playerDefault(1), color: DEFAULT_COLORS[0], emoji: DEFAULT_EMOJIS[0] },
    { name: s.playerDefault(2), color: DEFAULT_COLORS[1], emoji: DEFAULT_EMOJIS[1] },
  ]);
  const [pickerOpenIndex, setPickerOpenIndex] = useState<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Map Settings state
  const [mapSettings, setMapSettings] = useState<MapSettings>({ ...DEFAULT_MAP });

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

  const patchSettings = (patch: Partial<MapSettings>) =>
    setMapSettings((prev) => ({ ...prev, ...patch }));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white game-card p-6 flex flex-col gap-6">
        <h1 className="text-4xl font-black text-center bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 to-purple-600">
          {s.title}
        </h1>

        {/* Custom Tab Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-lg game-card">
          {[
            { id: 'BOARD', label: tabs.board },
            { id: 'SYSTEM', label: tabs.system },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 text-sm font-bold transition-all rounded-md ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-[50vh]">
          {activeTab === 'BOARD' && (
            <TabBoardRules
              numPlayers={numPlayers}
              players={players}
              handleNumChange={handleNumChange}
              updatePlayer={updatePlayer}
              pickerOpenIndex={pickerOpenIndex}
              setPickerOpenIndex={setPickerOpenIndex}
              pickerRef={pickerRef}
              handleEmojiSelect={handleEmojiSelect}
              mapSettings={mapSettings}
              patchSettings={patchSettings}
            />
          )}
          {activeTab === 'SYSTEM' && (
            <TabSystemUI mapSettings={mapSettings} patchSettings={patchSettings} />
          )}
        </div>

        {/* Start button always visible at bottom */}
        <button
          onClick={() => onStart(players, mapSettings)}
          className="w-full py-4 bg-indigo-600 text-white game-card hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-lg mt-auto"
        >
          {s.startGame}
        </button>
      </div>
    </div>
  );
};
