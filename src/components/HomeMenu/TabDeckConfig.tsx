import React from 'react';
import type { MapSettings } from '../../core/SettingsState';
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

  const ToggleItem = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 game-card hover:bg-slate-100 transition-colors">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-700">{label}</span>
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
          <label className="text-sm font-bold text-purple-600 uppercase tracking-wider">{dt.rarityBias}</label>
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
        />
        <ToggleItem
          label={cards.mindBlank.name}
          desc={cards.mindBlank.desc}
          checked={deck.enableMindBlank}
          onChange={(v) => patchDeck({ enableMindBlank: v })}
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
        />
        <ToggleItem
          label={cards.counter.name}
          desc={cards.counter.desc}
          checked={deck.enableCounter}
          onChange={(v) => patchDeck({ enableCounter: v })}
        />
        <ToggleItem
          label={cards.parasite.name}
          desc={cards.parasite.desc}
          checked={deck.enableParasite}
          onChange={(v) => patchDeck({ enableParasite: v })}
        />
        <ToggleItem
          label={cards.deadlineBomb.name}
          desc={cards.deadlineBomb.desc}
          checked={deck.enableDeadlineBomb}
          onChange={(v) => patchDeck({ enableDeadlineBomb: v })}
        />
        <ToggleItem
          label={cards.blackout.name}
          desc={cards.blackout.desc}
          checked={deck.enableBlackout}
          onChange={(v) => patchDeck({ enableBlackout: v })}
        />
        <ToggleItem
          label={cards.detention.name}
          desc={cards.detention.desc}
          checked={deck.enableDetention}
          onChange={(v) => patchDeck({ enableDetention: v })}
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
        />
        <ToggleItem
          label={cards.ninjaCopy.name}
          desc={cards.ninjaCopy.desc}
          checked={deck.enableNinjaCopy}
          onChange={(v) => patchDeck({ enableNinjaCopy: v })}
        />
        <ToggleItem
          label={cards.amenotejikara.name}
          desc={cards.amenotejikara.desc}
          checked={deck.enableAmenotejikara}
          onChange={(v) => patchDeck({ enableAmenotejikara: v })}
        />
        <ToggleItem
          label={cards.zaWarudo.name}
          desc={cards.zaWarudo.desc}
          checked={deck.enableZaWarudo}
          onChange={(v) => patchDeck({ enableZaWarudo: v })}
        />
        {deck.hostMode && (
          <ToggleItem
            label={cards.popQuiz.name}
            desc={cards.popQuiz.desc}
            checked={deck.enablePopQuiz}
            onChange={(v) => patchDeck({ enablePopQuiz: v })}
          />
        )}
      </div>
    </div>
  );
};
