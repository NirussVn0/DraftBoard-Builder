import React, { useState, useRef } from 'react';
import { MAP_SIZE, useMapBuilder } from '../../core/MapBuilderState';
import type { Tile } from '../../core/MapBuilderState';
import { ArrowRight, ArrowDown, ArrowLeft, ArrowUp, Eraser, RefreshCcw, Save, Undo2, Redo2, Download, MousePointerSquareDashed, Dices, Settings2, X, Upload, Eraser as EraserIcon } from 'lucide-react';
import { t } from '../../locales';
import { CARD_DEFINITIONS } from '../../core/CardRegistry';
import type { CardId } from '../../core/CardTypes';
import EmojiPicker from 'emoji-picker-react';
import { CardSettingsModal } from './CardSettingsModal';
import { DEFAULT_DECK, DEFAULT_MAP, type MapSettings } from '../../core/SettingsState';

interface MapBuilderUIProps {
  onSave: (path: Tile[]) => void;
  onCancel: () => void;
  initialMap?: { path: Tile[]; env?: any[] };
}

export const MapBuilderUI: React.FC<MapBuilderUIProps> = ({ onSave, onCancel, initialMap }) => {
  const { path, env, addNode, eraseFrom, setCard, randomFill, clearMap, loadMap, addEnvItem, removeEnvItem, undo, redo, canUndo, canRedo } = useMapBuilder();
  const hasLoadedInitial = React.useRef(false);
  const [tool, setTool] = React.useState<'DRAW' | 'ERASE' | 'CARD_PAINT' | 'ERASE_CARD' | 'RANDOM_FILL' | 'PAINT_ENV' | 'ERASE_ENV'>('DRAW');
  const [selectedCard, setSelectedCard] = React.useState<CardId>('MYSTERY');
  const [selectedEmoji, setSelectedEmoji] = React.useState<string>('🌲');
  const [showCardSettings, setShowCardSettings] = useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [randomCount, setRandomCount] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPaintTime = useRef<number>(0);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (canRedo) redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // Load initial map for editing
  React.useEffect(() => {
    if (initialMap && !hasLoadedInitial.current) {
      hasLoadedInitial.current = true;
      loadMap({ path: initialMap.path, env: initialMap.env || [] });
    }
  }, [initialMap, loadMap]);

  /** Read the map settings from localStorage (includes deckConfig set via CardSettingsModal) */
  const getCurrentMapSettings = (): MapSettings => {
    try {
      const saved = localStorage.getItem('draftboard_map_settings');
      if (saved) return { ...DEFAULT_MAP, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_MAP;
  };

  const isCardModified = (cardId: CardId): boolean => {
    const deckConfig = getCurrentMapSettings().deckConfig || DEFAULT_DECK;
    switch (cardId) {
      case 'LIFEBUOY':
        return deckConfig.lifebuoyTurns !== DEFAULT_DECK.lifebuoyTurns;
      case 'COUNTER_ARGUMENT':
        return deckConfig.counterTurns !== DEFAULT_DECK.counterTurns;
      case 'POP_QUIZ':
        return deckConfig.quizReward !== DEFAULT_DECK.quizReward || deckConfig.quizPenalty !== DEFAULT_DECK.quizPenalty;
      case 'ZA_WARUDO':
        return deckConfig.zaWarudoMode !== DEFAULT_DECK.zaWarudoMode;
      case 'DEADLINE_BOMB':
        return deckConfig.deadlineBombMode !== DEFAULT_DECK.deadlineBombMode;
      case 'NINJA_COPY':
        return deckConfig.ninjaCopyTarget !== DEFAULT_DECK.ninjaCopyTarget;
      case 'SUPERVISOR_HAND':
        return deckConfig.supervisorHandMode !== DEFAULT_DECK.supervisorHandMode;
      case 'MYSTERY':
        return deckConfig.mysteryRange[0] !== DEFAULT_DECK.mysteryRange[0] || deckConfig.mysteryRange[1] !== DEFAULT_DECK.mysteryRange[1];
      default:
        return false;
    }
  };

  const handleCellClick = (x: number, y: number) => {
    const tilesAtCell = path.filter(t => t.x === x && t.y === y);
    const hasTile = tilesAtCell.length > 0;

    if (tool === 'DRAW') {
      addNode(x, y);
    } else if (tool === 'ERASE' && hasTile) {
      const maxStep = Math.max(...tilesAtCell.map(t => t.stepIndex));
      eraseFrom(maxStep);
    } else if (tool === 'CARD_PAINT' && hasTile) {
      const maxStep = Math.max(...tilesAtCell.map(t => t.stepIndex));
      setCard(maxStep, selectedCard);
    } else if (tool === 'ERASE_CARD' && hasTile) {
      const maxStep = Math.max(...tilesAtCell.map(t => t.stepIndex));
      setCard(maxStep, undefined);
    } else if (tool === 'RANDOM_FILL' && hasTile) {
      randomFill(selectedCard, randomCount);
      setTool('DRAW');
    }
  };

  const paintEnvironment = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool !== 'PAINT_ENV') return;
    const now = Date.now();
    if (now - lastPaintTime.current < 100) return;
    lastPaintTime.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    addEnvItem(x, y, selectedEmoji);
  };

  const handleBoardMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (tool === 'PAINT_ENV') paintEnvironment(e);
  };

  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (tool === 'PAINT_ENV') paintEnvironment(e);
  };

  const handleRandomToolClick = () => {
    setTool('RANDOM_FILL');
    setShowRandomModal(true);
  };

  const renderArrows = () => {
    const arrows = [];
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      
      const dx = next.x - current.x;
      const dy = next.y - current.y;

      let ArrowIcon = null;
      let offset = {};

      if (dx === 1) { ArrowIcon = ArrowRight; offset = { right: '-12px', top: '50%', transform: 'translateY(-50%)' }; }
      if (dx === -1) { ArrowIcon = ArrowLeft; offset = { left: '-12px', top: '50%', transform: 'translateY(-50%)' }; }
      if (dy === 1) { ArrowIcon = ArrowDown; offset = { bottom: '-12px', left: '50%', transform: 'translateX(-50%)' }; }
      if (dy === -1) { ArrowIcon = ArrowUp; offset = { top: '-12px', left: '50%', transform: 'translateX(-50%)' }; }

      if (ArrowIcon) {
        arrows.push(
          <div 
            key={`arrow-${i}`} 
            className="absolute z-20 text-slate-800"
            style={{
              position: 'absolute',
              width: `${100 / MAP_SIZE}%`,
              height: `${100 / MAP_SIZE}%`,
              left: `${current.x * (100 / MAP_SIZE)}%`,
              top: `${current.y * (100 / MAP_SIZE)}%`,
              pointerEvents: 'none'
            }}
          >
            <div style={{ position: 'absolute', ...offset }} className="bg-yellow-400 rounded-full border-2 border-white shadow-sm p-0.5 z-30">
              <ArrowIcon size={12} strokeWidth={4} />
            </div>
          </div>
        );
      }
    }
    return arrows;
  };

  const cardsList = Array.from(CARD_DEFINITIONS.values());

  return (
    <div className="min-h-screen bg-slate-50 flex p-4 sm:p-8 gap-8 font-sans items-center justify-center relative">
      <div className="w-80 bg-white text-slate-800 game-card p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          {t().builder.title}
        </h2>

        {/* Tools Section */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t().builder.tools}</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setTool('DRAW')}
              className={`flex flex-col items-center justify-center gap-1 p-3 game-card font-bold transition-colors ${tool === 'DRAW' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <ArrowRight size={20} /> <span className="text-[10px]">Vẽ Đường</span>
            </button>
            <button 
              onClick={() => setTool('ERASE')}
              className={`flex flex-col items-center justify-center gap-1 p-3 game-card font-bold transition-colors ${tool === 'ERASE' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <Eraser size={20} /> <span className="text-[10px]">Xóa (Đường)</span>
            </button>
            <button 
              onClick={() => setTool('CARD_PAINT')}
              className={`flex flex-col items-center justify-center gap-1 p-3 game-card font-bold transition-colors ${tool === 'CARD_PAINT' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <MousePointerSquareDashed size={20} /> <span className="text-[10px]">Gắn Thẻ</span>
            </button>
            <button 
              onClick={() => setTool('ERASE_CARD')}
              className={`flex flex-col items-center justify-center gap-1 p-3 game-card font-bold transition-colors ${tool === 'ERASE_CARD' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <EraserIcon size={20} /> <span className="text-[10px]">Xóa Thẻ</span>
            </button>
            <button 
              onClick={() => setTool('PAINT_ENV')}
              className={`flex flex-col items-center justify-center gap-1 p-3 game-card font-bold transition-colors ${tool === 'PAINT_ENV' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <span className="text-xl leading-none">🌲</span> <span className="text-[10px]">Trang Trí</span>
            </button>
            <button 
              onClick={() => setTool('ERASE_ENV')}
              className={`flex flex-col items-center justify-center gap-1 p-3 game-card font-bold transition-colors ${tool === 'ERASE_ENV' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <Eraser size={20} /> <span className="text-[10px]">Xóa Cảnh</span>
            </button>
            <button 
              onClick={handleRandomToolClick}
              className={`flex flex-col items-center justify-center gap-1 p-3 game-card font-bold transition-colors col-span-2 ${tool === 'RANDOM_FILL' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <Dices size={20} /> <span className="text-[10px]">Điền Thẻ Ngẫu Nhiên</span>
            </button>
          </div>
        </div>

        {/* Card Palette (shows when CARD_PAINT is active) */}
        {tool === 'CARD_PAINT' && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chọn Thẻ</p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {cardsList.map(card => (
                <div key={card.id} className="flex gap-2">
                  <button 
                    onClick={() => setSelectedCard(card.id)}
                    className={`flex-1 flex items-center gap-2 p-2 game-card font-bold transition-colors text-left text-sm ${selectedCard === card.id ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {card.icon.includes('.') ? (
                      <img src={card.icon} alt={card.name} className="w-5 h-5 object-contain" />
                    ) : (
                      <span className="text-xl relative">
                        {card.icon}
                      </span>
                    )}
                    <span className="truncate flex items-center gap-2">
                      {card.name}
                      {isCardModified(card.id) && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Đã chỉnh sửa" />}
                    </span>
                  </button>
                  <button 
                    onClick={() => setShowCardSettings(card.id)}
                    className="p-2 game-card bg-slate-50 hover:bg-slate-200 text-slate-500" title="Cài đặt thẻ">
                    <Settings2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tool === 'PAINT_ENV' && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chọn Cảnh Vật</p>
            <div className="rounded-lg overflow-hidden border-2 border-slate-200">
              <EmojiPicker 
                width="100%" 
                height={350} 
                onEmojiClick={(data) => setSelectedEmoji(data.emoji)} 
                lazyLoadEmojis={true}
              />
            </div>
            <div className="mt-2 p-3 bg-emerald-50 rounded-lg border-2 border-emerald-200 flex items-center justify-between">
              <span className="text-emerald-800 font-bold text-sm">Đang chọn:</span>
              <span className="text-3xl bg-white p-2 rounded shadow-sm">{selectedEmoji}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button 
            onClick={undo} disabled={!canUndo}
            className={`flex-1 flex items-center justify-center gap-2 p-2 game-card font-bold transition-colors ${canUndo ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}
          >
            <Undo2 size={16} />
          </button>
          <button 
            onClick={redo} disabled={!canRedo}
            className={`flex-1 flex items-center justify-center gap-2 p-2 game-card font-bold transition-colors ${canRedo ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}
          >
            <Redo2 size={16} />
          </button>
        </div>

        <div className="space-y-3 mt-auto">
          <button 
            onClick={clearMap}
            className="w-full flex items-center justify-center gap-2 p-3 game-card font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RefreshCcw size={18} /> {t().builder.clearMap}
          </button>
          <button 
            onClick={async () => {
               if (path.length > 5 && path[path.length - 1].type !== 'START') {
                 const finalPath = [...path];
                 finalPath[finalPath.length - 1] = { ...finalPath[finalPath.length - 1], type: 'END' };
                 const name = prompt('Đặt tên map:', `Map ${new Date().toLocaleString('vi')}`);
                 if (name !== null) {
                   const { SaveManager } = await import('../../services/SaveManager');
                   SaveManager.addMap(name || '', finalPath, env, getCurrentMapSettings());
                 }
                 onSave(finalPath); 
               } else {
                 alert(t().builder.invalidMap);
               }
            }}
            className="w-full flex items-center justify-center gap-2 p-4 game-card font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Save size={20} /> {t().builder.savePlay}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={async () => {
                 if (path.length > 5) {
                   const finalPath = [...path];
                   finalPath[finalPath.length - 1] = { ...finalPath[finalPath.length - 1], type: 'END' as const };
                   const { SaveManager } = await import('../../services/SaveManager');
                   const slot = SaveManager.addMap(`Map ${new Date().toLocaleString('vi')}`, finalPath, env, getCurrentMapSettings());
                   SaveManager.exportMapAsJSON(slot);
                 } else {
                   alert(t().builder.tooShort);
                 }
              }}
              className="flex items-center justify-center gap-2 p-3 font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs"
            >
              <Download size={16} /> Xuất Map
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 p-3 font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs"
            >
              <Upload size={16} /> Nhập Map
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                  try {
                    const json = JSON.parse(evt.target?.result as string);
                    if (json.path && Array.isArray(json.path)) {
                      loadMap(json);
                      if (json.mapSettings) {
                        localStorage.setItem('draftboard_map_settings', JSON.stringify(json.mapSettings));
                      }
                      alert("Nhập map thành công!");
                    } else if (Array.isArray(json)) {
                      loadMap({ path: json, env: {} });
                      alert("Nhập map thành công (Legacy format)!");
                    } else {
                      alert("File JSON không hợp lệ.");
                    }
                  } catch (err) {
                    alert("Lỗi đọc file JSON.");
                  }
                };
                reader.readAsText(file);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            />
          </div>
          <button onClick={onCancel} className="w-full text-slate-400 hover:text-slate-700 text-sm font-bold pt-2">
            {t().builder.cancel}
          </button>
        </div>
      </div>

      {/* Main Board Area */}
      <div 
        className="flex-1 max-w-3xl aspect-square game-card border-4 border-slate-200 relative overflow-hidden flex items-center justify-center bg-emerald-400"
      >
        {/* RANDOM_FILL instructions overlay */}
        {tool === 'RANDOM_FILL' && !showRandomModal && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-bounce pointer-events-none">
            Click vào đường đi để điền ngẫu nhiên thẻ {CARD_DEFINITIONS.get(selectedCard)?.name}!
          </div>
        )}

        <div 
          className="w-full h-full relative select-none"
          onMouseDown={handleBoardMouseDown}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleBoardMouseMove}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${MAP_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${MAP_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: MAP_SIZE * MAP_SIZE }).map((_, i) => {
            const x = i % MAP_SIZE;
            const y = Math.floor(i / MAP_SIZE);

            return (
              <div
                key={`bg-${x}-${y}`}
                onMouseDown={() => handleCellClick(x, y)}
                onMouseEnter={() => {
                  if (isDragging) handleCellClick(x, y);
                }}
                className="border-[0.5px] border-slate-800/10 cursor-pointer hover:bg-white/40 transition-colors bg-transparent"
              >
              </div>
            );
          })}

          {/* Render EnvItems freely */}
          {env.map((item) => (
            <div
              key={item.id}
              className={`absolute flex items-center justify-center text-3xl transition-transform hover:scale-110 select-none ${tool === 'ERASE_ENV' ? 'cursor-crosshair hover:opacity-50 hover:bg-rose-100 rounded-full' : 'pointer-events-none'}`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
              }}
              onMouseDown={(e) => {
                if (tool === 'ERASE_ENV') {
                  e.stopPropagation();
                  removeEnvItem(item.id);
                }
              }}
              onMouseEnter={(e) => {
                if (tool === 'ERASE_ENV' && isDragging) {
                  e.stopPropagation();
                  removeEnvItem(item.id);
                }
              }}
            >
              {item.emoji}
            </div>
          ))}

          {path.map((tile, idx) => {
            const { x, y, type, stepIndex, cardId } = tile;
            let bgColor = 'bg-amber-400 text-amber-900';
            let bgStyle: React.CSSProperties = {};
            let content: React.ReactNode = <span className="text-amber-700/60 font-bold text-[10px]">{stepIndex}</span>;

            const isLastTile = idx === path.length - 1 && path.length > 1;

            if (type === 'START') {
              bgColor = 'text-white';
              bgStyle = { backgroundImage: 'repeating-conic-gradient(#1e293b 0% 25%, #f8fafc 0% 50%)', backgroundSize: '16px 16px' };
              content = <span className="font-black bg-black/70 px-1 py-0.5 rounded text-[10px] shadow-sm">{t().board.tileIn}</span>;
            } else if (type === 'END' || isLastTile) {
              bgColor = 'text-white';
              bgStyle = { backgroundImage: 'repeating-conic-gradient(#1e293b 0% 25%, #f8fafc 0% 50%)', backgroundSize: '16px 16px' };
              content = <span className="font-black bg-rose-600/90 px-1 py-0.5 rounded text-[10px] shadow-sm">{t().board.tileOut}</span>;
            } else if (cardId || type === 'MYSTERY') {
              const actualCardId = cardId || (type === 'MYSTERY' ? 'MYSTERY' : undefined);
              if (actualCardId) {
                const def = CARD_DEFINITIONS.get(actualCardId);
                if (def) {
                   const cardColor = def.tier === 'PURPLE' ? 'bg-purple-600' : def.tier === 'RED' ? 'bg-rose-600' : 'bg-emerald-600';
                   content = (
                     <div className={`flex flex-col items-center justify-center w-3/4 h-3/4 ${cardColor} rounded border border-white/40 shadow-sm`} title={def.name}>
                       <span className="text-xl drop-shadow-md leading-none">{def.icon}</span>
                     </div>
                   );
                }
              }
            }

            return (
               <div 
                 key={`tile-${stepIndex}`}
                 onClick={() => handleCellClick(x, y)}
                 className={`absolute shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110 z-10 
                   ${bgColor} ${tile.stepIndex === path.length - 1 ? 'ring-4 ring-indigo-400 animate-pulse' : 'border-2 border-white/60'} game-tile`}
                 style={{
                    width: `calc(${100 / MAP_SIZE}% - 4px)`,
                    height: `calc(${100 / MAP_SIZE}% - 4px)`,
                    left: `calc(${x * (100 / MAP_SIZE)}% + 2px)`,
                    top: `calc(${y * (100 / MAP_SIZE)}% + 2px)`,
                    ...bgStyle
                 }}
               >
                 {content}
               </div>
            )
          })}

          {renderArrows()}
        </div>
      </div>

      {/* Random Fill Modal */}
      {showRandomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white game-card p-6 w-[400px] flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-indigo-600">Cấu Hình Random Fill</h3>
              <button onClick={() => { setShowRandomModal(false); setTool('DRAW'); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-500 mb-2 block">Chọn Thẻ Cần Điền</label>
                <select 
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value as CardId)}
                  className="w-full p-3 game-card bg-slate-50 text-slate-800 font-bold outline-none border-2 border-slate-200 focus:border-indigo-500"
                >
                  {cardsList.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-500 mb-2 block">Số lượng thẻ</label>
                <input 
                  type="number"
                  min="1"
                  max="50"
                  value={randomCount}
                  onChange={(e) => setRandomCount(parseInt(e.target.value) || 1)}
                  className="w-full p-3 game-card bg-slate-50 text-slate-800 font-bold outline-none border-2 border-slate-200 focus:border-indigo-500"
                />
              </div>
            </div>

            <button 
              onClick={() => setShowRandomModal(false)}
              className="w-full py-3 bg-indigo-600 text-white font-bold game-card hover:bg-indigo-500"
            >
              Lưu & Bắt đầu điền
            </button>
          </div>
        </div>
      )}

      {showCardSettings && (
        <CardSettingsModal
          cardId={showCardSettings as any}
          initialConfig={(() => {
            try {
              const saved = localStorage.getItem('draftboard_map_settings');
              if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.deckConfig) return { ...DEFAULT_DECK, ...parsed.deckConfig };
              }
            } catch(e) {}
            return DEFAULT_DECK;
          })()}
          onSave={() => setShowCardSettings(null)}
          onClose={() => setShowCardSettings(null)}
        />
      )}
    </div>
  );
};
