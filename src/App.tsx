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
    const rollResult = gameEngine.rollDice()
    if (!rollResult) return

    const { path } = rollResult
    const activePlayer = gameState.players[gameState.activePlayerIndex]

    // Simulate dice rolling for 500ms before starting token movement
    setTimeout(() => {
      AnimationService.animateTokenMove(
        activePlayer.id, 
        gameState.activePlayerIndex,
        path, 
        (finalCell) => {
          gameEngine.finishTurn(finalCell)
        }
      )
    }, 500)
  }

  const handleRestart = () => {
    gameEngine.resetGame()
  }

  if (gameState.phase === 'SETUP') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-4">
        <HomeMenu onStart={handleStartGame} />
      </div>
    )
  }

  const activePlayer = gameState.players[gameState.activePlayerIndex] || gameState.winner;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black p-4 sm:p-8 flex flex-col md:flex-row gap-8 items-center justify-center">
      
      {/* Left side: Board */}
      <div className="flex-1 w-full flex justify-center max-w-[800px]">
        <BoardGrid players={gameState.players} />
      </div>

      {/* Right side: Menu & Logic */}
      <div className="w-full md:w-80 flex flex-col gap-8 shrink-0">
        
        {/* Active Player Info */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border border-gray-200 dark:border-gray-800 p-6 rounded-3xl text-center space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-400">Current Turn</h2>
          
          <div className="flex items-center justify-center gap-3">
            <div 
              className="w-6 h-6 rounded-full shadow-md border border-white/50"
              style={{ backgroundColor: activePlayer?.color }}
            />
            <span className="text-2xl font-black truncate" style={{ color: activePlayer?.color }}>
              {activePlayer?.name}
            </span>
          </div>
        </div>

        {/* Dice Area */}
        {gameState.phase !== 'VICTORY' && (
          <div className="flex justify-center my-4">
            <DiceUI 
              disabled={gameState.isAnimating} 
              onRoll={handleRollDice} 
              currentValue={gameState.diceValue} 
            />
          </div>
        )}

        {/* Victory Area */}
        {gameState.phase === 'VICTORY' && gameState.winner && (
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur p-8 rounded-3xl flex flex-col items-center shadow-2xl space-y-4 border border-yellow-500/50">
            <Trophy size={64} className="text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
              VICTORY!
            </h2>
            <p className="text-2xl font-bold" style={{ color: gameState.winner.color }}>
              {gameState.winner.name} won!
            </p>
            <button 
              onClick={handleRestart}
              className="mt-6 flex items-center justify-center gap-2 w-full py-4 bg-gray-900 dark:bg-white dark:text-black text-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition active:scale-95 font-bold text-lg"
            >
              <RefreshCcw size={20} /> Play Again
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default App
