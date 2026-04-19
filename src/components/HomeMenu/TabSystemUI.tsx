import React, { useState } from 'react';
import type { MapSettings } from '../../core/SettingsState';
import { loadGlobalSettings, saveGlobalSettings } from '../../core/SettingsState';
import type { GlobalSettings } from '../../core/SettingsState';
import { t, setLocale } from '../../locales';
import { audioService } from '../../services/AudioService';

interface TabSystemUIProps {
  mapSettings: MapSettings;
  patchSettings: (patch: Partial<MapSettings>) => void;
}

export const TabSystemUI: React.FC<TabSystemUIProps> = ({ mapSettings, patchSettings }) => {
  const [global, setGlobal] = useState<GlobalSettings>(loadGlobalSettings());
  const s = t().systemUI;
  const commonS = t().settings;

  const updateGlobal = <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => {
    const next = { ...global, [key]: value };
    setGlobal(next);
    saveGlobalSettings(next);

    if (key === 'locale') {
      setLocale(value as 'vi' | 'en');
    }

    if (key === 'enableSoundEffects') {
      audioService.setMuted(!(value as boolean));
    }
  };

  const ToggleRow = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 game-card">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{s.title}</label>
        
        {/* Language */}
        <div className="space-y-2 p-3 bg-slate-50 game-card">
          <label className="text-sm font-bold text-slate-700 block mb-2">{commonS.language}</label>
          <div className="flex gap-2">
            {(['vi', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => updateGlobal('locale', lang)}
                className={`flex-1 py-2 game-card font-bold text-sm transition-all ${
                  global.locale === lang
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lang === 'vi' ? 'Tiếng Việt' : 'English'}
              </button>
            ))}
          </div>
        </div>

        <ToggleRow
          label={s.camera}
          checked={global.cameraAutoTrack}
          onChange={(v) => updateGlobal('cameraAutoTrack', v)}
        />
        <ToggleRow
          label={s.sfx}
          checked={global.enableSoundEffects}
          onChange={(v) => updateGlobal('enableSoundEffects', v)}
        />
        <ToggleRow
          label={commonS.animations}
          checked={global.enableAnimations}
          onChange={(v) => updateGlobal('enableAnimations', v)}
        />
      </div>

      {/* Map Settings - Biome */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{s.biome}</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'OFF', label: s.biomeOptions.off, icon: '❌' },
            { id: 'FOREST', label: s.biomeOptions.forest, icon: '🌲' },
            { id: 'ICE', label: s.biomeOptions.ice, icon: '❄️' },
            { id: 'DESERT', label: s.biomeOptions.desert, icon: '🌵' },
            { id: 'TEMPTATION', label: s.biomeOptions.temptation, icon: '📱' },
            { id: 'FORGE', label: s.biomeOptions.forge, icon: '☕' },
            { id: 'SUMMIT', label: s.biomeOptions.summit, icon: '🏆' },
          ].map((biome) => (
            <button
              key={biome.id}
              onClick={() => patchSettings({ biome: biome.id as any })}
              className={`flex items-center gap-2 p-3 game-card font-bold text-sm transition-all text-left ${
                mapSettings.biome === biome.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="text-lg">{biome.icon}</span>
              <span className="truncate">{biome.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
