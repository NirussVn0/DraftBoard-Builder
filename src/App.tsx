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
import { MysteryCardOverlay } from './components/PlayMenu/MysteryCardOverlay'
import { WelcomeMenu } from './components/WelcomeMenu'
import { MapBuilderUI } from './components/MapBuilder/MapBuilderUI'
import { SettingsPanel } from './components/Settings/SettingsPanel'
import { KickOverlay } from './components/PlayMenu/KickOverlay'

import { Trophy, RefreshCcw, Home, Settings, Dices, SkipForward, Undo2 } from 'lucide-react'

import { t } from './locales'

import type { Tile } from './core/MapBuilderState'
import { generateZigzagMap, MAP_SIZE } from './core/MapBuilderState'
import { BOARD_SIZE } from './core/Pathfinding'

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
  const [pendingMap, setPendingMap] = useState<Tile[] | null>(null)
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState())
  const [showDiceOverlay, setShowDiceOverlay] = useState(false)
  const [showMysteryOverlay, setShowMysteryOverlay] = useState(false)
  const [mysteryValue, setMysteryValue] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showKickOverlay, setShowKickOverlay] = useState(false)

  useEffect(() => {
    const unsubscribe = gameEngine.subscribe((state) => {
      setGameState(state)

      if (state.phase === 'EVENT_MYSTERY_ROLL') {
        // Show Mystery Card flip overlay instead of auto-moving
        setMysteryValue(state.diceValue);
        setShowMysteryOverlay(true);
      }

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

  const handleStartGame = (players: { name: string, color: string }[]) => {
    gameEngine.startGame(players, pendingMap || undefined)
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

  const handleMysteryComplete = useCallback(() => {
    setShowMysteryOverlay(false);

    // Conclude mystery roll and move token at 1.5x speed
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
      true, // isFast = true (1.5x speed)
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
      gameEngine.resetGame();
      setAppMode('MENU');
    }
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  // ── MENU ──
  if (appMode === 'MENU') {
    return <WelcomeMenu onSelectMode={(mode) => {
      if (mode === 'PLAY_SAVED') {
        const savedData = localStorage.getItem('draftboard_saved_map');
        if (savedData) {
          try {
            const savedMap: Tile[] = JSON.parse(savedData);
            setPendingMap(savedMap);
            setAppMode('PLAYING');
          } catch {
            alert(t().common.savedMapError);
            setPendingMap(generateZigzagMap());
            setAppMode('PLAYING');
          }
        } else {
          setPendingMap(generateZigzagMap());
          setAppMode('PLAYING');
        }
      } else {
        setAppMode(mode);
        if (mode === 'PLAYING') {
          setPendingMap(generateZigzagMap());
        }
      }
    }} />;
  }

  // ── BUILDER ──
  if (appMode === 'BUILDER') {
    return (
      <>
        <AppHeader onHome={handleGoHome} onSettings={handleSettings} />
        <MapBuilderUI
          onSave={(path) => {
            setPendingMap(path);
            gameEngine.resetGame();
            setAppMode('PLAYING');
          }}
          onCancel={() => setAppMode('MENU')}
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
    <div className="w-screen h-screen bg-slate-50 overflow-hidden relative font-sans text-slate-800">
      <AppHeader onHome={handleGoHome} onSettings={handleSettings} />

      {/* Layer 0: Fullscreen Board */}
      <div className="absolute inset-0 z-0" id="board-container">
        <CameraWrapper>
          <BoardGrid players={gameState.players} map={gameState.map} />
        </CameraWrapper>
      </div>

      {/* Layer 1: Fixed HUD */}
      <PlayerStatsPanel
        players={gameState.players}
        activePlayerIndex={gameState.activePlayerIndex}
        maxPosition={maxPosition}
      />

      {/* Bottom-center action buttons */}
      {gameState.phase === 'IDLE_TURN' && (
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
            className="flex items-center gap-2 px-6 py-5 bg-slate-200 text-slate-600 font-bold text-sm game-card hover:bg-slate-300 hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
          >
            <SkipForward size={18} /> {t().dice.skipButton}
          </button>
          <button
            onClick={handleRollDice}
            className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white font-black text-xl game-card hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
            style={{ borderColor: activePlayer?.color }}
          >
            <Dices size={28} /> {t().dice.rollButton}
          </button>
        </div>
      )}

      {/* Sky-drop Dice Overlay */}
      {showDiceOverlay && (
        <DiceOverlay
          diceValue={gameState.diceValue}
          activeColor={activePlayer?.color || '#6366f1'}
          onComplete={handleDiceAnimationComplete}
        />
      )}

      {/* Mystery Card Flip Overlay */}
      {showMysteryOverlay && (
        <MysteryCardOverlay
          mysteryValue={mysteryValue}
          onComplete={handleMysteryComplete}
        />
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
