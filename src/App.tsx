import { useEffect, useState, useCallback } from 'react'
import { gameEngine } from './core/GameEngine'
import type { GameState } from './core/GameState'
import { AnimationService } from './services/AnimationService'
import { TOTAL_CELLS } from './core/Pathfinding'

import { HomeMenu } from './components/HomeMenu/HomeMenu'
import { BoardGrid } from './components/Board/BoardGrid'
import { PlayerStatsPanel } from './components/Board/PlayerStatsPanel'
import { DiceOverlay } from './components/PlayMenu/DiceOverlay'
import { WelcomeMenu } from './components/WelcomeMenu'
import { MapBuilderUI } from './components/MapBuilder/MapBuilderUI'

import { Trophy, RefreshCcw, Home, Settings, Dices } from 'lucide-react'

import type { Tile } from './core/MapBuilderState'
import { generateZigzagMap } from './core/MapBuilderState'

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

  useEffect(() => {
    const unsubscribe = gameEngine.subscribe((state) => {
      setGameState(state)

      if (state.phase === 'EVENT_MYSTERY_ROLL') {
        const activePlayer = state.players[state.activePlayerIndex];

        AnimationService.animateTokenMove(
          activePlayer.id,
          state.activePlayerIndex,
          [activePlayer.position],
          () => {
            setTimeout(() => {
              const pathData = gameEngine.concludeDiceRoll();
              if (!pathData) return;
              AnimationService.animateTokenMove(
                activePlayer.id,
                state.activePlayerIndex,
                pathData,
                (finalCell) => {
                  gameEngine.finishTokenMove(finalCell);
                },
                true,
                state.map || undefined
              );
            }, 500);
          },
          false,
          state.map || undefined
        );
      }
    })
    return unsubscribe
  }, [])

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

  const handleRestart = () => {
    gameEngine.resetGame();
    setAppMode('MENU');
  };

  const handleGoHome = () => {
    const confirmed = window.confirm('Bạn có chắc muốn thoát? Dữ liệu chưa lưu sẽ bị mất.');
    if (confirmed) {
      gameEngine.resetGame();
      setAppMode('MENU');
    }
  };

  const handleSettings = () => {
    // Placeholder — future settings panel
  };

  // ── MENU ──
  if (appMode === 'MENU') {
    return <WelcomeMenu onSelectMode={(mode) => {
      setAppMode(mode);
      if (mode === 'PLAYING') {
        setPendingMap(generateZigzagMap());
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
    <div className="min-h-screen bg-white p-4 sm:p-8 flex flex-col items-center justify-center font-sans text-slate-800">
      <AppHeader onHome={handleGoHome} onSettings={handleSettings} />

      {/* Board + Stats Panel layout */}
      <div className="flex gap-6 items-start w-full max-w-5xl">
        {/* Board */}
        <div className="flex-1 max-w-3xl">
          <BoardGrid players={gameState.players} map={gameState.map} />
        </div>

        {/* Stats Panel */}
        <PlayerStatsPanel
          players={gameState.players}
          activePlayerIndex={gameState.activePlayerIndex}
          maxPosition={maxPosition}
        />
      </div>

      {/* Bottom-center ROLL DICE button */}
      {gameState.phase === 'IDLE_TURN' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={handleRollDice}
            className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white font-black text-xl shadow-2xl hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
            style={{ borderColor: activePlayer?.color }}
          >
            <Dices size={28} /> Roll Dice
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

      {/* Victory Overlay */}
      {gameState.phase === 'VICTORY' && gameState.winner && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-12 shadow-2xl border border-slate-200 flex flex-col items-center gap-6 text-center">
            <Trophy size={80} className="text-yellow-400 drop-shadow-xl" />
            <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-yellow-400 to-orange-600">
              VICTORY!
            </h2>
            <div className="text-2xl font-bold px-6 py-2 border border-slate-100" style={{ color: gameState.winner.color }}>
              {gameState.winner.name} won!
            </div>
            <button
              onClick={handleRestart}
              className="mt-2 flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform font-bold text-lg"
            >
              <RefreshCcw size={20} /> Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
