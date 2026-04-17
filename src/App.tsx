import { useEffect, useState } from 'react'
import { gameEngine } from './core/GameEngine'
import type { GameState } from './core/GameState'
import { AnimationService } from './services/AnimationService'

import { HomeMenu } from './components/HomeMenu/HomeMenu'
import { BoardGrid } from './components/Board/BoardGrid'
import { DiceUI } from './components/PlayMenu/DiceUI'

import { Trophy, RefreshCcw } from 'lucide-react'

function App() {
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState())

  // Ensure initial render triggers a re-render if state changes immediately
  useEffect(() => {
    const unsubscribe = gameEngine.subscribe((state) => {
      setGameState(state)
    })
    return unsubscribe
  }, [])

  const handleStartGame = (players: {name: string, color: string}[]) => {
    gameEngine.startGame(players)
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
        }
      );
    }, 700);
  };

  const handleRestart = () => {
    gameEngine.resetGame();
  };

  if (gameState.phase === 'SETUP') {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <HomeMenu onStart={handleStartGame} />
      </div>
    );
  }

  const activePlayer = gameState.players[gameState.activePlayerIndex] || gameState.winner;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex items-center justify-center font-sans text-slate-800">
      <div className="w-full max-w-3xl">
        <BoardGrid players={gameState.players}>
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
                  className="mt-4 flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-transform font-bold text-lg"
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
