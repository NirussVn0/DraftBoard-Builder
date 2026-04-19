import React from 'react';
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { Dices, Swords, Crown } from 'lucide-react';
import type { MapSettings } from '../../core/SettingsState';
import { t } from '../../locales';

interface TabBoardRulesProps {
  numPlayers: number;
  players: { name: string; color: string; emoji: string }[];
  handleNumChange: (num: number) => void;
  updatePlayer: (index: number, field: 'name' | 'color' | 'emoji', value: string) => void;
  pickerOpenIndex: number | null;
  setPickerOpenIndex: (idx: number | null) => void;
  pickerRef: React.RefObject<HTMLDivElement | null>;
  handleEmojiSelect: (index: number, data: EmojiClickData) => void;
  mapSettings: MapSettings;
  patchSettings: (patch: Partial<MapSettings>) => void;
}

export const TabBoardRules: React.FC<TabBoardRulesProps> = ({
  numPlayers,
  players,
  handleNumChange,
  updatePlayer,
  pickerOpenIndex,
  setPickerOpenIndex,
  pickerRef,
  handleEmojiSelect,
  mapSettings,
  patchSettings,
}) => {
  const s = t().home;
  const ms = t().mapSettings;

  return (
    <div className="space-y-6">
      {/* Player count selector */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{s.numPlayers}</label>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6, 7, 8].map((num) => (
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
            <button
              onClick={() => setPickerOpenIndex(pickerOpenIndex === index ? null : index)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 hover:scale-110 active:scale-95 transition-all shadow-sm shrink-0"
              style={{ borderColor: player.color, backgroundColor: player.color + '20' }}
              title="Chọn avatar"
            >
              {player.emoji}
            </button>

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

            <input
              type="color"
              value={player.color}
              onChange={(e) => updatePlayer(index, 'color', e.target.value)}
              className="w-8 h-8 cursor-pointer border-0 p-0 bg-transparent shrink-0"
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

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{ms.title}</p>

        {/* Dice Count */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Dices size={16} className="text-indigo-500" />
            <span>{ms.diceCount}</span>
            <span className="ml-auto text-indigo-600 font-black text-base">{mapSettings.diceCount}</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => patchSettings({ diceCount: n })}
                className={`flex-1 py-2 game-card font-bold text-sm transition-all ${
                  mapSettings.diceCount === n
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Kick Settings */}
        <div className="flex items-center justify-between gap-4 bg-slate-50 p-3 game-card">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Swords size={16} className="text-rose-500" />
            <span>{ms.enableKick}</span>
          </div>
          <button
            onClick={() => patchSettings({ kickDistance: mapSettings.kickDistance > 0 ? 0 : 3 })}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${
              mapSettings.kickDistance > 0 ? 'bg-rose-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                mapSettings.kickDistance > 0 ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-bold w-8 ${mapSettings.kickDistance > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
            {mapSettings.kickDistance > 0 ? ms.on : ms.off}
          </span>
        </div>

        {/* Host Mode */}
        <div className="flex items-center justify-between gap-4 bg-slate-50 p-3 game-card border-purple-200 border-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
            <Crown size={16} />
            <span>Host Mode (Duel / Quiz)</span>
          </div>
          <button
            onClick={() => {
              const newHostMode = !mapSettings.deckConfig.hostMode;
              patchSettings({
                deckConfig: {
                  ...mapSettings.deckConfig,
                  hostMode: newHostMode,
                  enablePopQuiz: newHostMode, // Quiz is automatically toggled with Host Mode
                }
              });
            }}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${
              mapSettings.deckConfig.hostMode ? 'bg-purple-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                mapSettings.deckConfig.hostMode ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
