import { useEffect, useState } from 'react'
import { gameEngine } from './core/GameEngine'
import type { GameState } from './core/GameState'
import { AnimationService } from './services/AnimationService'

import { HomeMenu } from './components/HomeMenu/HomeMenu'
import { BoardGrid } from './components/Board/BoardGrid'
import { DiceUI } from './components/PlayMenu/DiceUI'
import { WelcomeMenu } from './components/WelcomeMenu'
import { MapBuilderUI } from './components/MapBuilder/MapBuilderUI'

import { Trophy, RefreshCcw, Home, Settings } from 'lucide-react'

import type { Tile } from './core/MapBuilderState'
import { generateZigzagMap } from './core/MapBuilderState'

type AppMode = 'MENU' | 'BUILDER' | 'PLAYING';

function AppHeader({ onHome, onSettings }: { onHome: () => void; onSettings: () => void }) {
  return (
    <div className="fixed top-0 right-0 z-50 flex items-center gap-2 p-3">
      <button
        onClick={onSettings}
        title="Settings"
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-white hover:border-indigo-200 shadow-sm transition-all"
      >
        <Settings size={18} />
      </button>
      <button
        onClick={onHome}
        title="Home"
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-white hover:border-rose-200 shadow-sm transition-all"
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

    setTimeout(() => {
      const pathData = gameEngine.concludeDiceRoll();
      if (!pathData) return;

      const activePlayer = gameState.players[gameState.activePlayerIndex];
      AnimationService.animateTokenMove(
        activePlayer.id,
        gameState.activePlayerIndex,
        pathData,
        (finalCell) => {
          gameEngine.finishTokenMove(finalCell);
        },
        false,
        gameState.map || undefined
      );
    }, 700);
  };

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
    // Placeholder — Phase 3 will open the dice-count settings panel
  };

  if (appMode === 'MENU') {
    return <WelcomeMenu onSelectMode={(mode) => {
      setAppMode(mode);
      if (mode === 'PLAYING') {
        setPendingMap(generateZigzagMap());
      }
    }} />;
  }

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

  if (appMode === 'PLAYING' && gameState.phase === 'SETUP') {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <AppHeader onHome={handleGoHome} onSettings={handleSettings} />
        <HomeMenu onStart={handleStartGame} />
      </div>
    );
  }

  const activePlayer = gameState.players[gameState.activePlayerIndex] || gameState.winner;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex items-center justify-center font-sans text-slate-800">
      <AppHeader onHome={handleGoHome} onSettings={handleSettings} />
      <div className="w-full max-w-3xl">
        <BoardGrid players={gameState.players} map={gameState.map}>
          <div className="flex flex-col items-center justify-center p-8 space-y-8 w-full text-center">
            {gameState.phase === 'VICTORY' && gameState.winner ? (
              <div className="flex flex-col items-center space-y-4 animate-in zoom-in spin-in-12 duration-700">
                <Trophy size={80} className="text-yellow-400 drop-shadow-xl" />
                <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-yellow-400 to-orange-600 drop-shadow-sm">
                  VICTORY!
                </h2>
                <div className="text-2xl font-bold rounded-xl px-6 py-2 bg-white shadow-sm border border-slate-100" style={{ color: gameState.winner.color }}>
                  {gameState.winner.name} won!
                </div>
                <button
                  onClick={handleRestart}
                  className="mt-4 flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-transform font-bold text-lg"
                >
                  <RefreshCcw size={20} /> Play Again
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Player</p>
                  <div className="flex items-center justify-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                    <div
                      className="w-5 h-5 rounded-full shadow-inner border border-slate-200"
                      style={{ backgroundColor: activePlayer?.color }}
                    />
                    <span className="text-2xl font-black truncate" style={{ color: activePlayer?.color }}>
                      {activePlayer?.name}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <DiceUI
                    phase={gameState.phase}
                    onRoll={handleRollDice}
                    currentValue={gameState.diceValue}
                    activeColor={activePlayer?.color}
                  />
                </div>
              </>
            )}
          </div>
        </BoardGrid>
      </div>
    </div>
  );
}

export default App
