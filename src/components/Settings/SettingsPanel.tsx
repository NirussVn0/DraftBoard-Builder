import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import { X } from 'lucide-react';
import { t } from '../../locales';
import { setLocale } from '../../locales';
import type { GlobalSettings } from '../../core/SettingsState';
import { loadGlobalSettings, saveGlobalSettings } from '../../core/SettingsState';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<GlobalSettings>(loadGlobalSettings);

  // Animate slide-in / slide-out
  useEffect(() => {
    if (!panelRef.current) return;

    if (isOpen) {
      anime({
        targets: panelRef.current,
        translateX: ['100%', '0%'],
        duration: 300,
        easing: 'easeOutCubic',
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!panelRef.current) { onClose(); return; }

    anime({
      targets: panelRef.current,
      translateX: ['0%', '100%'],
      duration: 200,
      easing: 'easeInCubic',
      complete: () => onClose(),
    });
  };

  const update = <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveGlobalSettings(next);

    if (key === 'locale') {
      setLocale(value as 'vi' | 'en');
    }
  };

  const s = t().settings;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 z-50 w-80 h-full bg-white game-card border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto"
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800">{s.title}</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <hr className="border-slate-100" />

        {/* Language */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{s.language}</label>
          <div className="flex gap-2">
            {(['vi', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => update('locale', lang)}
                className={`flex-1 py-2 game-card font-bold text-sm transition-all ${
                  settings.locale === lang
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lang === 'vi' ? 'Tiếng Việt' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle: Sound Effects */}
        <ToggleRow
          label={s.sound}
          checked={settings.enableSoundEffects}
          onChange={(v) => update('enableSoundEffects', v)}
        />

        {/* Toggle: Animations */}
        <ToggleRow
          label={s.animations}
          checked={settings.enableAnimations}
          onChange={(v) => update('enableAnimations', v)}
        />

        {/* Toggle: Camera Auto-Track */}
        <ToggleRow
          label={s.cameraTrack}
          checked={settings.cameraAutoTrack}
          onChange={(v) => update('cameraAutoTrack', v)}
        />
      </div>
    </>
  );
};

/** Reusable toggle row */
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold text-slate-600">{label}</span>
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
}
