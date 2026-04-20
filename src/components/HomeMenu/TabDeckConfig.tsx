import React from 'react';
import type { MapSettings, DeckConfig } from '../../core/SettingsState';
import { DEFAULT_DECK } from '../../core/SettingsState';
import { t } from '../../locales';

interface TabDeckConfigProps {
  mapSettings: MapSettings;
  patchSettings: (patch: Partial<MapSettings>) => void;
}

export const TabDeckConfig: React.FC<TabDeckConfigProps> = ({ mapSettings, patchSettings }) => {
  const dt = t().deckConfig;
  const cards = t().cards;
  const deck = mapSettings.deckConfig;

  const patchDeck = (patch: Partial<typeof deck>) => {
    patchSettings({ deckConfig: { ...deck, ...patch } });
  };

  /** Check if a specific deck key has been modified from default */
  const isModified = (key: keyof DeckConfig): boolean => {
    const current = deck[key];
    const def = DEFAULT_DECK[key];
    if (Array.isArray(current) && Array.isArray(def)) {
      return current[0] !== def[0] || current[1] !== def[1];
    }
    return current !== def;
  };

  const ToggleItem = ({ label, desc, checked, onChange, modified }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; modified?: boolean }) => (
    <div className={`flex items-center justify-between p-3 game-card hover:bg-slate-100 transition-colors ${modified ? 'bg-amber-50 border-l-2 border-l-amber-400' : 'bg-slate-50'}`}>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          {label}
          {modified && <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0" title="Đã chỉnh sửa" />}
        </span>
        <span className="text-xs font-medium text-slate-500">{desc}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
          checked ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1 pb-4">
      {/* Rarity Bias */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
            {dt.rarityBias}
            {isModified('rarityBias') && <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />}
          </label>
          <span className="text-sm font-black text-purple-600">{deck.rarityBias}%</span>
        </div>
        <p className="text-xs font-medium text-slate-500 mb-2">{dt.rarityHelp}</p>
        <input
          type="range"
          min="0"
          max="100"
          value={deck.rarityBias}
          onChange={(e) => patchDeck({ rarityBias: parseInt(e.target.value) })}
          className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Basic Cards */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{dt.basic}</label>
        <ToggleItem
          label={cards.eureka.name}
          desc={cards.eureka.desc}
          checked={deck.enableEureka}
          onChange={(v) => patchDeck({ enableEureka: v })}
          modified={isModified('enableEureka')}
        />
        <ToggleItem
          label={cards.mindBlank.name}
          desc={cards.mindBlank.desc}
          checked={deck.enableMindBlank}
          onChange={(v) => patchDeck({ enableMindBlank: v })}
          modified={isModified('enableMindBlank')}
        />
      </div>

      {/* Skill Cards */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{dt.skill}</label>
        <ToggleItem
          label={cards.lifebuoy.name}
          desc={cards.lifebuoy.desc}
          checked={deck.enableLifebuoy}
          onChange={(v) => patchDeck({ enableLifebuoy: v })}
          modified={isModified('enableLifebuoy')}
        />
        <ToggleItem
          label={cards.counter.name}
          desc={cards.counter.desc}
          checked={deck.enableCounter}
          onChange={(v) => patchDeck({ enableCounter: v })}
          modified={isModified('enableCounter')}
        />
        <ToggleItem
          label={cards.parasite.name}
          desc={cards.parasite.desc}
          checked={deck.enableParasite}
          onChange={(v) => patchDeck({ enableParasite: v })}
          modified={isModified('enableParasite')}
        />
        <ToggleItem
          label={cards.deadlineBomb.name}
          desc={cards.deadlineBomb.desc}
          checked={deck.enableDeadlineBomb}
          onChange={(v) => patchDeck({ enableDeadlineBomb: v })}
          modified={isModified('enableDeadlineBomb')}
        />
        <ToggleItem
          label={cards.blackout.name}
          desc={cards.blackout.desc}
          checked={deck.enableBlackout}
          onChange={(v) => patchDeck({ enableBlackout: v })}
          modified={isModified('enableBlackout')}
        />
        <ToggleItem
          label={cards.detention.name}
          desc={cards.detention.desc}
          checked={deck.enableDetention}
          onChange={(v) => patchDeck({ enableDetention: v })}
          modified={isModified('enableDetention')}
        />
      </div>

      {/* Chaos Cards */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-purple-500 uppercase tracking-wider">{dt.chaos}</label>
        <ToggleItem
          label={cards.supervisorHand.name}
          desc={cards.supervisorHand.desc}
          checked={deck.enableSupervisorHand}
          onChange={(v) => patchDeck({ enableSupervisorHand: v })}
          modified={isModified('enableSupervisorHand')}
        />
        <ToggleItem
          label={cards.ninjaCopy.name}
          desc={cards.ninjaCopy.desc}
          checked={deck.enableNinjaCopy}
          onChange={(v) => patchDeck({ enableNinjaCopy: v })}
          modified={isModified('enableNinjaCopy')}
        />
        <ToggleItem
          label={cards.amenotejikara.name}
          desc={cards.amenotejikara.desc}
          checked={deck.enableAmenotejikara}
          onChange={(v) => patchDeck({ enableAmenotejikara: v })}
          modified={isModified('enableAmenotejikara')}
        />
        <ToggleItem
          label={cards.zaWarudo.name}
          desc={cards.zaWarudo.desc}
          checked={deck.enableZaWarudo}
          onChange={(v) => patchDeck({ enableZaWarudo: v })}
          modified={isModified('enableZaWarudo')}
        />
        {deck.hostMode && (
          <ToggleItem
            label={cards.popQuiz.name}
            desc={cards.popQuiz.desc}
            checked={deck.enablePopQuiz}
            onChange={(v) => patchDeck({ enablePopQuiz: v })}
            modified={isModified('enablePopQuiz')}
          />
        )}
      </div>
    </div>
  );
};
