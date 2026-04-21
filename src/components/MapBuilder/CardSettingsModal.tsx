import React, { useState, useEffect } from 'react';
import type { CardId } from '../../core/CardTypes';
import { DEFAULT_DECK, type DeckConfig } from '../../core/SettingsState';
import { Save, X } from 'lucide-react';
import { CARD_DEFINITIONS } from '../../core/CardRegistry';

interface CardSettingsModalProps {
  cardId: CardId;
  initialConfig: DeckConfig;
  onSave: (newConfig: DeckConfig) => void;
  onClose: () => void;
}

export const CardSettingsModal: React.FC<CardSettingsModalProps> = ({ cardId, initialConfig, onSave, onClose }) => {
  const [config, setConfig] = useState<DeckConfig>(initialConfig);
  const card = CARD_DEFINITIONS.get(cardId);

  // Read current saved map settings if any
  useEffect(() => {
    try {
      const saved = localStorage.getItem('draftboard_map_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.deckConfig) {
          setConfig({ ...DEFAULT_DECK, ...parsed.deckConfig });
        }
      }
    } catch (e) {}
  }, []);

  if (!card) return null;

  const handleSave = () => {
    try {
      const saved = localStorage.getItem('draftboard_map_settings') || '{}';
      const parsed = JSON.parse(saved);
      const newSettings = { ...parsed, deckConfig: config };
      localStorage.setItem('draftboard_map_settings', JSON.stringify(newSettings));
      onSave(config);
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  const renderConfigEditor = () => {
    switch (cardId) {
      case 'EUREKA':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Tùy chỉnh: Bước tiến</h4>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Tối thiểu</label>
                <input type="number" min="1" max={config.eurekaRange[1]} value={config.eurekaRange[0]} onChange={(e) => setConfig({ ...config, eurekaRange: [parseInt(e.target.value) || 1, config.eurekaRange[1]] })} className="w-24 p-2 border-2 border-slate-200 rounded" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Tối đa</label>
                <input type="number" min={config.eurekaRange[0]} value={config.eurekaRange[1]} onChange={(e) => setConfig({ ...config, eurekaRange: [config.eurekaRange[0], parseInt(e.target.value) || 6] })} className="w-24 p-2 border-2 border-slate-200 rounded" />
              </div>
            </div>
          </div>
        );
      case 'MIND_BLANK':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Tùy chỉnh: Bước lùi</h4>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Tối thiểu</label>
                <input type="number" min="1" max={config.mindBlankRange[1]} value={config.mindBlankRange[0]} onChange={(e) => setConfig({ ...config, mindBlankRange: [parseInt(e.target.value) || 1, config.mindBlankRange[1]] })} className="w-24 p-2 border-2 border-slate-200 rounded" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Tối đa</label>
                <input type="number" min={config.mindBlankRange[0]} value={config.mindBlankRange[1]} onChange={(e) => setConfig({ ...config, mindBlankRange: [config.mindBlankRange[0], parseInt(e.target.value) || 6] })} className="w-24 p-2 border-2 border-slate-200 rounded" />
              </div>
            </div>
          </div>
        );
      case 'BLACKOUT':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Tùy chỉnh: Số bước tiến mộng du</h4>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Số bước</label>
              <input type="number" min="1" max="10" value={config.blackoutSteps} onChange={(e) => setConfig({ ...config, blackoutSteps: parseInt(e.target.value) || 3 })} className="w-24 p-2 border-2 border-slate-200 rounded" />
            </div>
          </div>
        );
      case 'DETENTION':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Tùy chỉnh: Giá trị đổ xúc xắc để thoát</h4>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Điểm cần đạt</label>
              <input type="number" min="1" max="12" value={config.detentionEscapeValue} onChange={(e) => setConfig({ ...config, detentionEscapeValue: parseInt(e.target.value) || 6 })} className="w-24 p-2 border-2 border-slate-200 rounded" />
            </div>
          </div>
        );
      case 'COUNTER_ARGUMENT':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Tùy chỉnh: Số lượt hiệu lực</h4>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Lượt</label>
              <input type="number" min="1" max="10" value={config.counterTurns} onChange={(e) => setConfig({ ...config, counterTurns: parseInt(e.target.value) || 3 })} className="w-24 p-2 border-2 border-slate-200 rounded" />
            </div>
          </div>
        );
      case 'POP_QUIZ':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Tùy chỉnh: Thưởng / Phạt</h4>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Thưởng (tiến)</label>
                <input type="number" min="1" value={config.quizReward} onChange={(e) => setConfig({ ...config, quizReward: parseInt(e.target.value) || 3 })} className="w-24 p-2 border-2 border-slate-200 rounded" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Phạt (lùi)</label>
                <input type="number" min="1" value={config.quizPenalty} onChange={(e) => setConfig({ ...config, quizPenalty: parseInt(e.target.value) || 3 })} className="w-24 p-2 border-2 border-slate-200 rounded" />
              </div>
            </div>
          </div>
        );
      case 'ZA_WARUDO':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Tùy chỉnh: Đối tượng bị đóng băng</h4>
            <div>
              <select value={config.zaWarudoMode} onChange={(e) => setConfig({ ...config, zaWarudoMode: e.target.value as any })} className="w-full p-2 border-2 border-slate-200 rounded font-bold text-slate-700">
                <option value="FREEZE_ALL">Tất cả người chơi khác (FREEZE_ALL)</option>
                <option value="FREEZE_ONE">Chỉ người cao điểm nhất (FREEZE_ONE)</option>
              </select>
            </div>
          </div>
        );
      case 'DEADLINE_BOMB':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Tùy chỉnh: Hình phạt</h4>
            <div>
              <select value={config.deadlineBombMode} onChange={(e) => setConfig({ ...config, deadlineBombMode: e.target.value as any })} className="w-full p-2 border-2 border-slate-200 rounded font-bold text-slate-700">
                <option value="MATCH_STEPS">Lùi bằng số bước đã đi (MATCH_STEPS)</option>
                <option value="RESET_ZERO">Quay về ô xuất phát (RESET_ZERO)</option>
              </select>
            </div>
          </div>
        );
      case 'NINJA_COPY':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Tùy chỉnh: Đối tượng copy</h4>
            <div>
              <select value={config.ninjaCopyTarget} onChange={(e) => setConfig({ ...config, ninjaCopyTarget: e.target.value as any })} className="w-full p-2 border-2 border-slate-200 rounded font-bold text-slate-700">
                <option value="TOP1">Người dẫn đầu (TOP1)</option>
                <option value="RANDOM">Ngẫu nhiên (RANDOM)</option>
              </select>
            </div>
          </div>
        );
      case 'SUPERVISOR_HAND':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Tùy chỉnh: Chế độ tóm cổ</h4>
            <div>
              <select value={config.supervisorHandMode} onChange={(e) => setConfig({ ...config, supervisorHandMode: e.target.value as any })} className="w-full p-2 border-2 border-slate-200 rounded font-bold text-slate-700">
                <option value="PULL_ALL_TO_LAST">Kéo mọi người về kẻ bét bảng (PULL_ALL_TO_LAST)</option>
                <option value="PULL_TOP_TO_ME">Kéo kẻ top 1 về vị trí của mình (PULL_TOP_TO_ME)</option>
              </select>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-slate-100 rounded text-slate-500 font-bold italic text-center">
            Thẻ này không có cài đặt đặc biệt.
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border-4 border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-slate-100 p-4 border-b-2 border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {card.icon.includes('.') ? (
              <img src={card.icon} alt={card.name} className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-3xl">{card.icon}</span>
            )}
            <h2 className="text-xl font-black text-slate-800">Cài đặt: {card.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {renderConfigEditor()}
        </div>

        <div className="p-4 bg-slate-50 border-t-2 border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};
