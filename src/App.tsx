import { useEffect, useState, useCallback } from 'react'
import { gameEngine } from './core/GameEngine'
import type { GameState } from './core/GameState'
import { AnimationService } from './services/AnimationService'
import { TOTAL_CELLS, getCoordinatesFromCell, getPlayerOffset } from './core/Pathfinding'
import { cameraService } from './services/CameraService'
import { audioService } from './services/AudioService'

import { HomeMenu } from './components/HomeMenu/HomeMenu'
import { BoardGrid } from './components/Board/BoardGrid'
import { CameraWrapper } from './components/Board/CameraWrapper'
import { PlayerStatsPanel } from './components/Board/PlayerStatsPanel'
import { DiceOverlay } from './components/PlayMenu/DiceOverlay'
import { CardPrecastOverlay } from './components/PlayMenu/CardPrecastOverlay'
import { CardEffectOverlay } from './components/PlayMenu/CardEffectOverlay'
import { PopQuizOverlay } from './components/PlayMenu/PopQuizOverlay'
import { DetentionOverlay } from './components/PlayMenu/DetentionOverlay'
import { FreezeOverlay } from './components/PlayMenu/FreezeOverlay'
import { LifebuoyBreakOverlay } from './components/PlayMenu/LifebuoyBreakOverlay'
import { CounterOverlay } from './components/PlayMenu/CounterOverlay'
import { WelcomeMenu } from './components/WelcomeMenu'
import { MapBuilderUI } from './components/MapBuilder/MapBuilderUI'
import { SettingsPanel } from './components/Settings/SettingsPanel'
import { KickOverlay } from './components/PlayMenu/KickOverlay'
import { FrozenSkipOverlay } from './components/PlayMenu/FrozenSkipOverlay'
import { MapShareService } from './services/MapShareService'
import { SaveManager } from './services/SaveManager'

import { Trophy, RefreshCcw, Home, Settings, Dices, SkipForward, Undo2 } from 'lucide-react'

import { t } from './locales'

import type { Tile } from './core/MapBuilderState'
import { generateZigzagMap, MAP_SIZE } from './core/MapBuilderState'
import { BOARD_SIZE } from './core/Pathfinding'
import type { MapSettings } from './core/SettingsState'

type AppMode = 'MENU' | 'BUILDER' | 'PLAYING';

function AppHeader({ onHome, onSettings }: { onHome: () => void; onSettings: () => void }) {
  return (
    <div className="fixed top-0 right-0 z-50 flex items-center gap-2 p-3">
      <button
        onClick={onSettings}
        title="Settings"
        className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-white hover:border-indigo-200 shadow-sm transition-all"
      >
        <Settings size={18} />
      </button>
      <button
        onClick={onHome}
        title="Home"
        className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-white hover:border-rose-200 shadow-sm transition-all"
      >
        <Home size={18} />
      </button>
    </div>
  );
}

function App() {
  const [appMode, setAppMode] = useState<AppMode>('MENU')
  const [pendingMapPath, setPendingMapPath] = useState<Tile[] | null>(null)
  const [pendingMapEnv, setPendingMapEnv] = useState<{ id: string; x: number; y: number; emoji: string; }[]>([])
  const [editingMap, setEditingMap] = useState<{ path: Tile[]; env?: any[] } | null>(null)
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState())
  const [showDiceOverlay, setShowDiceOverlay] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showKickOverlay, setShowKickOverlay] = useState(false)

  useEffect(() => {
    const unsubscribe = gameEngine.subscribe((state) => {
      setGameState(state)

      if (state.phase === 'EVENT_KICK') {
        setShowKickOverlay(true);
      }

      if (state.phase === 'VICTORY') {
        audioService.playVictory();
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    // Check for shared map via LZ-String in URL
    const sharedMap = MapShareService.readFromURL();
    if (sharedMap) {
      if (window.confirm(t().common.sharedMapPrompt || 'You received a shared map! Do you want to play it now?')) {
        if (Array.isArray(sharedMap)) {
          setPendingMapPath(sharedMap);
          setPendingMapEnv([]);
        } else if (sharedMap && sharedMap.path) {
          setPendingMapPath(sharedMap.path);
          setPendingMapEnv(sharedMap.env || []);
        }
        setAppMode('PLAYING');
      }
      MapShareService.clearURLParam(); // Cleanup URL
    }
  }, []);

  useEffect(() => {
    if (appMode !== 'PLAYING' || gameState.phase === 'SETUP') {
      cameraService.resetCamera('camera-viewport');
      return;
    }

    // CEO OVERRIDE: Camera should only snap/pan to the active player during IDLE_TURN.
    // During MOVING_TOKEN, AnimationService handles the tracking.
    if (gameState.phase !== 'IDLE_TURN') return;

    // Delay camera focus slightly to let UI render
    const timeout = setTimeout(() => {
      const activePlayer = gameState.players[gameState.activePlayerIndex];
      if (!activePlayer) return;

      const TILE_PX = 64; // Same as BoardGrid
      const tokenPx = TILE_PX * 0.7;

      let gridX = 0, gridY = 0;
      if (gameState.map && gameState.map.length > 0) {
        const tile = gameState.map[activePlayer.position];
        if (tile) { gridX = tile.x; gridY = tile.y; }
      } else {
        const coords = getCoordinatesFromCell(activePlayer.position);
        gridX = coords.x; gridY = coords.y;
      }

      const cellSizePct = gameState.map ? (100 / MAP_SIZE) : (100 / BOARD_SIZE);
      const { offsetX, offsetY } = getPlayerOffset(gameState.activePlayerIndex, cellSizePct);
      const boardPx = (gameState.map ? MAP_SIZE : BOARD_SIZE) * TILE_PX;
      
      const pxOffsetX = (offsetX / 100) * boardPx;
      const pxOffsetY = (offsetY / 100) * boardPx;
      const tokenCenter = (TILE_PX - tokenPx) / 2;

      const targetX = gridX * TILE_PX + tokenCenter + pxOffsetX + (tokenPx / 2);
      const targetY = gridY * TILE_PX + tokenCenter + pxOffsetY + (tokenPx / 2);

      cameraService.panTo('camera-viewport', 'board-container', targetX, targetY);
    }, 100);

    return () => clearTimeout(timeout);
  }, [appMode, gameState.phase, gameState.activePlayerIndex, gameState.map]);

  useEffect(() => {
     if (gameState.phase === 'EVENT_MOVE_ANIMATION' && gameState.moveAnimation) {
        const { playerId, path } = gameState.moveAnimation;
        const playerIndex = gameState.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
           AnimationService.animateTokenMove(
              playerId, playerIndex, path, 
              (finalCell) => gameEngine.finishEventMove(playerId, finalCell),
              true, gameState.map || undefined
           );
        }
     } else if (gameState.phase === 'EVENT_TELEPORT_ANIMATION' && gameState.teleportAnimation) {
        const { playerId, position } = gameState.teleportAnimation;
        const playerIndex = gameState.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
           AnimationService.animateTeleport(
              playerId, playerIndex, position,
              () => gameEngine.finishEventTeleport(playerId, position),
              gameState.map || undefined
           );
        }
     } else if (gameState.phase === 'EVENT_SWAP_ANIMATION' && gameState.swapAnimation) {
        const { player1Id, player2Id } = gameState.swapAnimation;
        const player1Index = gameState.players.findIndex(p => p.id === player1Id);
        const player2Index = gameState.players.findIndex(p => p.id === player2Id);
        if (player1Index !== -1 && player2Index !== -1) {
           AnimationService.animateSwap(
              player1Id, player1Index, gameState.players[player1Index].position,
              player2Id, player2Index, gameState.players[player2Index].position,
              () => gameEngine.finishEventSwap(player1Id, player2Id),
              gameState.map || undefined
           );
        }
     }
  }, [gameState.phase, gameState.moveAnimation, gameState.teleportAnimation, gameState.swapAnimation, gameState.map, gameState.players]);

  const handleStartGame = (players: { name: string; color: string; emoji: string }[], mapSettings: MapSettings) => {
    gameEngine.startGame(players, pendingMapPath || undefined, pendingMapEnv, mapSettings)
  }

  const handleRollDice = () => {
    gameEngine.rollDice();
    setShowDiceOverlay(true);
  };

  const handleDiceAnimationComplete = useCallback(() => {
    setShowDiceOverlay(false);

    // After overlay closes, conclude dice roll and move token
    const pathData = gameEngine.concludeDiceRoll();
    if (!pathData) return;

    const state = gameEngine.getState();
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer) return;

    AnimationService.animateTokenMove(
      activePlayer.id,
      state.activePlayerIndex,
      pathData,
      (finalCell) => {
        gameEngine.finishTokenMove(finalCell);
      },
      false,
      state.map || undefined
    );
  }, []);

  const handleKickComplete = useCallback(() => {
    setShowKickOverlay(false);
    gameEngine.resolveKick();
  }, []);

  const handleRestart = () => {
    gameEngine.resetGame();
    setAppMode('MENU');
  };

  const handleGoHome = () => {
    const confirmed = window.confirm(t().common.confirmExit);
    if (confirmed) {
      if (appMode === 'PLAYING' && gameState.phase !== 'SETUP') {
        const name = prompt('Đặt tên cho ván lưu:', `Ván ${new Date().toLocaleString('vi')}`);
        if (name !== null) {
          SaveManager.addGame(name || '', gameEngine.getState());
        }
      }
      gameEngine.resetGame();
      setAppMode('MENU');
    }
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  // ── MENU ──
  if (appMode === 'MENU') {
    return <WelcomeMenu
      onSelectMode={async (mode) => {
        if (mode === 'PLAYING') {
          // Load bundled default map
          try {
            const res = await fetch('/assets/default_map.json');
            const data = await res.json();
            setPendingMapPath(data.path || generateZigzagMap());
            setPendingMapEnv(data.env || []);
            if (data.mapSettings) {
              localStorage.setItem('draftboard_map_settings', JSON.stringify(data.mapSettings));
            }
          } catch {
            setPendingMapPath(generateZigzagMap());
            setPendingMapEnv([]);
          }
          setAppMode('PLAYING');
        } else {
          setAppMode(mode as AppMode);
        }
      }}
      onLoadMap={(slot) => {
        setPendingMapPath(slot.path);
        setPendingMapEnv(slot.env || []);
        // Pre-apply map settings so HomeMenu picks them up
        if (slot.mapSettings) {
          localStorage.setItem('draftboard_map_settings', JSON.stringify(slot.mapSettings));
        }
        setAppMode('PLAYING');
      }}
      onLoadGame={(slot) => {
        try {
          gameEngine.loadState(slot.state);
          setPendingMapPath(slot.state.map);
          setPendingMapEnv(slot.state.envMap || []);
          setAppMode('PLAYING');
        } catch {
          alert(t().common.savedMapError);
        }
      }}
      onEditMap={(slot) => {
        if (slot.mapSettings) {
          localStorage.setItem('draftboard_map_settings', JSON.stringify(slot.mapSettings));
        }
        setEditingMap({ path: slot.path, env: slot.env || [] });
        setAppMode('BUILDER');
      }}
    />;
  }

  if (appMode === 'BUILDER') {
    return (
      <>
        <AppHeader onHome={handleGoHome} onSettings={handleSettings} />
        <MapBuilderUI
          initialMap={editingMap || undefined}
          onSave={(path) => {
            setPendingMapPath(path);
            setPendingMapEnv([]);
            setEditingMap(null);
            gameEngine.resetGame();
            setAppMode('PLAYING');
          }}
          onCancel={() => { setEditingMap(null); setAppMode('MENU'); }}
        />
      </>
    );
  }

  // ── PLAYING: SETUP ──
  if (appMode === 'PLAYING' && gameState.phase === 'SETUP') {
    return (
      <div className="min-h-screen bg-white p-4">
        <AppHeader onHome={handleGoHome} onSettings={handleSettings} />
        <HomeMenu onStart={handleStartGame} />
      </div>
    );
  }

  // ── PLAYING: GAME ──
  const activePlayer = gameState.players[gameState.activePlayerIndex] || gameState.winner;
  const maxPosition = gameState.map ? gameState.map.length - 1 : TOTAL_CELLS - 1;

  return (
    <>
    <div 
      className="w-screen h-screen bg-emerald-400 overflow-hidden relative font-sans text-slate-800"
    >
      <AppHeader onHome={handleGoHome} onSettings={handleSettings} />

      {/* Layer 0: Fullscreen Board */}
      <div className="absolute inset-0 z-0" id="board-container">
        <CameraWrapper>
          <BoardGrid players={gameState.players} map={gameState.map} envMap={gameState.envMap} biome={gameState.mapSettings.biome} />
        </CameraWrapper>
      </div>

      {/* Layer 1: Fixed HUD */}
      <PlayerStatsPanel
        players={gameState.players}
        activePlayerIndex={gameState.activePlayerIndex}
        maxPosition={maxPosition}
      />

      {/* Bottom-center action buttons */}
      {gameState.phase === 'IDLE_TURN' && (() => {
        const isFrozen = activePlayer?.buffs.some(b => b.id === 'FROZEN');
        return (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
            {gameState.canUndo && (
              <button
                onClick={() => gameEngine.undo()}
                className="flex items-center gap-2 px-6 py-5 bg-amber-100 text-amber-700 font-bold text-sm game-card hover:bg-amber-200 hover:scale-105 active:scale-95 transition-all uppercase tracking-wider border border-amber-200"
              >
                <Undo2 size={18} /> {t().dice.undoButton}
              </button>
            )}
            <button
              onClick={() => gameEngine.skipTurn()}
              className={`flex items-center gap-2 px-6 py-5 font-bold text-sm game-card transition-all uppercase tracking-wider ${
                isFrozen 
                  ? 'bg-cyan-400 text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.6)] animate-pulse'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:scale-105 active:scale-95'
              }`}
            >
              <SkipForward size={18} /> {isFrozen ? 'Bỏ lượt' : t().dice.skipButton}
            </button>
            <button
              onClick={handleRollDice}
              disabled={isFrozen}
              className={`flex items-center gap-3 px-10 py-5 font-black text-xl game-card uppercase tracking-wider transition-all ${
                isFrozen 
                  ? 'bg-slate-300 text-slate-500 opacity-70 grayscale cursor-not-allowed border-slate-400' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95'
              }`}
              style={{ borderColor: !isFrozen && activePlayer ? activePlayer.color : undefined }}
            >
              <Dices size={28} /> {isFrozen ? '❄️ BỊ ĐÓNG BĂNG' : t().dice.rollButton}
            </button>
          </div>
        );
      })()}

      {/* Sky-drop Dice Overlay */}
      {showDiceOverlay && (
        <DiceOverlay
          diceValue={gameState.diceValue}
          diceRolls={gameState.diceRolls || [gameState.diceValue]}
          diceCount={gameState.mapSettings.diceCount || 1}
          activeColor={activePlayer?.color || '#6366f1'}
          onComplete={handleDiceAnimationComplete}
        />
      )}

      {/* Card Precast Overlay */}
      {gameState.phase === 'EVENT_DRAW_CARD' && gameState.currentCard && (
        <CardPrecastOverlay
          card={gameState.currentCard}
          onComplete={() => gameEngine.continueQueue()}
        />
      )}

      {/* Card Effect Overlay */}
      {gameState.phase === 'EVENT_CARD_ANIMATE' && gameState.currentCard && gameState.currentResolution && (
        <CardEffectOverlay
          card={gameState.currentCard}
          resolution={gameState.currentResolution}
          onComplete={() => gameEngine.continueQueue()}
        />
      )}

      {/* Pop Quiz Overlay */}
      {gameState.phase === 'EVENT_QUIZ' && gameState.quizState && (
        <PopQuizOverlay
          quizState={gameState.quizState}
          players={gameState.players}
        />
      )}

      {/* Detention Roll Overlay */}
      {gameState.phase === 'EVENT_DETENTION_ROLL' && (() => {
        const prisoner = gameState.players[gameState.activePlayerIndex];
        return prisoner ? (
          <DetentionOverlay
            prisoner={prisoner}
            onComplete={() => {}}
          />
        ) : null;
      })()}

      {/* Freeze Overlay */}
      {gameState.phase === 'EVENT_FREEZE' && (() => {
        const frozenIds = gameState.currentResolution?.targetPlayerIds ?? [];
        return (
          <FreezeOverlay
            frozenPlayerIds={frozenIds}
            players={gameState.players}
            onComplete={() => gameEngine.continueQueue()}
          />
        );
      })()}

      {/* Frozen Skip Overlay */}
      {gameState.phase === 'EVENT_FROZEN_SKIP' && (
        <FrozenSkipOverlay
          key={`frozen-skip-${gameState.activePlayerIndex}`}
          player={gameState.players[gameState.activePlayerIndex]}
          onComplete={() => gameEngine.concludeFrozenSkip()}
        />
      )}

      {/* Lifebuoy Break Overlay */}
      {gameState.phase === 'EVENT_LIFEBUOY_BREAK' && (
        <LifebuoyBreakOverlay onComplete={() => gameEngine.continueQueue()} />
      )}

      {/* Counter Overlay */}
      {gameState.phase === 'EVENT_COUNTER' && (
        <CounterOverlay onComplete={() => gameEngine.continueQueue()} />
      )}

      {/* Kick Overlay */}
      {showKickOverlay && gameState.kickEvent && (
        <KickOverlay
          kickEvent={gameState.kickEvent}
          players={gameState.players}
          onComplete={handleKickComplete}
        />
      )}

      {/* Victory Overlay */}
      {gameState.phase === 'VICTORY' && gameState.winner && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-12 game-card flex flex-col items-center gap-6 text-center">
            <Trophy size={80} className="text-yellow-400 drop-shadow-xl" />
            <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-yellow-400 to-orange-600">
              {t().victory.title}
            </h2>
            <div className="text-2xl font-bold px-6 py-2 border border-slate-100" style={{ color: gameState.winner.color }}>
              {t().victory.winMessage(gameState.winner.name)}
            </div>
            <button
              onClick={handleRestart}
              className="mt-2 flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform font-bold text-lg"
            >
              <RefreshCcw size={20} /> {t().victory.playAgain}
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Settings Drawer */}
    <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}

export default App
