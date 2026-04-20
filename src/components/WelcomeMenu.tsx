import React, { useState, useRef } from 'react';
import { Play, PenTool, FolderOpen, History, Trash2, Download, Upload, X, Plus, Pencil } from 'lucide-react';
import { t } from '../locales';
import { SaveManager, type SavedMapSlot, type SavedGameSlot } from '../services/SaveManager';

interface WelcomeMenuProps {
  onSelectMode: (mode: 'PLAYING' | 'BUILDER' | 'PLAY_SAVED' | 'RESUME') => void;
  onLoadMap?: (map: SavedMapSlot) => void;
  onLoadGame?: (game: SavedGameSlot) => void;
  onEditMap?: (map: SavedMapSlot) => void;
}

type DrawerMode = null | 'maps' | 'games';

export const WelcomeMenu: React.FC<WelcomeMenuProps> = ({ onSelectMode, onLoadMap, onLoadGame, onEditMap }) => {
  const s = t().welcome;
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const [maps, setMaps] = useState<SavedMapSlot[]>(() => SaveManager.getMaps());
  const [games, setGames] = useState<SavedGameSlot[]>(() => SaveManager.getGames());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshMaps = () => setMaps(SaveManager.getMaps());
  const refreshGames = () => setGames(SaveManager.getGames());

  const handleDeleteMap = (id: string) => {
    if (!confirm('Xoá map này?')) return;
    SaveManager.deleteMap(id);
    refreshMaps();
  };

  const handleDeleteGame = (id: string) => {
    if (!confirm('Xoá ván này?')) return;
    SaveManager.deleteGame(id);
    refreshGames();
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = SaveManager.importFromJSON(reader.result as string);
      if (!result) {
        alert('File không hợp lệ!');
        return;
      }
      if (result.type === 'map') {
        const slot = SaveManager.addMap(result.data.name, result.data.path, result.data.env);
        refreshMaps();
        setDrawer('maps');
        alert(`Đã import map "${slot.name}"!`);
      } else {
        SaveManager.saveGames([...SaveManager.getGames(), result.data]);
        refreshGames();
        setDrawer('games');
        alert(`Đã import ván "${result.data.name}"!`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString('vi')} ${d.toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white game-card p-10 text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600 mb-2">
          {s.title}
        </h1>
        <p className="text-slate-500 font-medium mb-12">{s.subtitle}</p>

        <div className="space-y-4">
          {/* Tạo Map Mới */}
          <button
            id="btn-create-map"
            onClick={() => onSelectMode('BUILDER')}
            className="w-full flex items-center justify-center gap-3 py-5 game-card font-bold bg-indigo-600 hover:bg-indigo-500 text-white hover:-translate-y-1 transition-all"
          >
            <PenTool size={24} /> {s.createBuilder}
          </button>

          {/* Chọn Map để Chơi */}
          <button
            id="btn-browse-maps"
            onClick={() => { refreshMaps(); setDrawer('maps'); }}
            className="w-full flex items-center justify-center gap-3 py-5 game-card font-bold bg-amber-500 hover:bg-amber-400 text-white hover:-translate-y-1 transition-all"
          >
            <FolderOpen size={24} /> Kho Map ({maps.length})
          </button>

          {/* Danh sách Ván đã lưu */}
          <button
            id="btn-browse-games"
            onClick={() => { refreshGames(); setDrawer('games'); }}
            className="w-full flex items-center justify-center gap-3 py-5 game-card font-bold bg-emerald-600 hover:bg-emerald-500 text-white hover:-translate-y-1 transition-all"
          >
            <History size={24} /> Ván Đã Lưu ({games.length})
          </button>

          {/* Chơi Map Mặc Định */}
          <button
            id="btn-play-default"
            onClick={() => onSelectMode('PLAYING')}
            className="w-full flex items-center justify-center gap-3 py-4 game-card font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:-translate-y-1 transition-all"
          >
            <Play size={22} /> {s.playDefault}
          </button>

          {/* Import */}
          <button
            onClick={handleImport}
            className="w-full flex items-center justify-center gap-3 py-3 game-card font-medium bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all text-sm"
          >
            <Upload size={16} /> Nhập file JSON (Map / Ván)
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {/* ─── Drawer: Maps ─── */}
      {drawer === 'maps' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800">🗺️ Kho Map</h2>
              <button onClick={() => setDrawer(null)} className="p-1 hover:bg-slate-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {maps.length === 0 && (
                <p className="text-center text-slate-400 py-8">Chưa có map nào. Hãy tạo map mới!</p>
              )}
              {maps.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-300 transition group">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.path.length} ô • {formatDate(m.savedAt)}{m.mapSettings ? ' • ⚙️' : ''}</p>
                  </div>
                  <button
                    onClick={() => { onEditMap?.(m); setDrawer(null); }}
                    className="p-2 text-slate-400 hover:text-amber-600 transition"
                    title="Chỉnh sửa map"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => { SaveManager.exportMapAsJSON(m); }}
                    className="p-2 text-slate-400 hover:text-indigo-500 transition"
                    title="Xuất JSON"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteMap(m.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition"
                    title="Xoá"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => { onLoadMap?.(m); setDrawer(null); }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold rounded-lg transition"
                  >
                    Chơi
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Drawer: Games ─── */}
      {drawer === 'games' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800">🎮 Ván Đã Lưu</h2>
              <button onClick={() => setDrawer(null)} className="p-1 hover:bg-slate-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {games.length === 0 && (
                <p className="text-center text-slate-400 py-8">Chưa có ván nào được lưu.</p>
              )}
              {games.map(g => (
                <div key={g.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-300 transition group">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{g.name}</p>
                    <p className="text-xs text-slate-400">{g.playerSummary} • {formatDate(g.savedAt)}</p>
                    <div className="flex gap-1 mt-1">
                      {g.state.players.map(p => (
                        <span key={p.id} className="text-sm" title={p.name}>{p.emoji || '👤'}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => { SaveManager.exportGameAsJSON(g); }}
                    className="p-2 text-slate-400 hover:text-indigo-500 transition"
                    title="Xuất JSON"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteGame(g.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition"
                    title="Xoá"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => { onLoadGame?.(g); setDrawer(null); }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-lg transition"
                  >
                    Tiếp tục
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
