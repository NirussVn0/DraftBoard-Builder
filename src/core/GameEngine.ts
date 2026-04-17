import type { GameState, Player } from './GameState';
import { calculatePath, TOTAL_CELLS } from './Pathfinding';

export type GameStateObserver = (state: GameState) => void;

class GameEngine {
  private state: GameState;
  private observers: GameStateObserver[] = [];

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): GameState {
    return {
      phase: 'SETUP',
      players: [],
      activePlayerIndex: 0,
      winner: null,
      diceValue: 1,
      isAnimating: false,
    };
  }

  public subscribe(observer: GameStateObserver): () => void {
    this.observers.push(observer);
    observer(this.state);
    return () => {
      this.observers = this.observers.filter((o) => o !== observer);
    };
  }

  private notify() {
    // Return a new object reference to ensure React triggers re-render
    this.observers.forEach((observer) => observer({...this.state}));
  }

  public startGame(players: Omit<Player, 'position' | 'id'>[]) {
    this.state = {
      ...this.getInitialState(),
      phase: 'PLAYING',
      players: players.map((p, index) => ({
        ...p,
        id: `player-${index + 1}`,
        position: 1,
      })),
    };
    this.notify();
  }

  public rollDice(): { diceRoll: number, path: number[] } | null {
    if (this.state.phase !== 'PLAYING' || this.state.isAnimating) return null;

    const diceRoll = Math.floor(Math.random() * 6) + 1;
    const activePlayer = this.state.players[this.state.activePlayerIndex];
    
    this.state.diceValue = diceRoll;
    this.state.isAnimating = true;
    this.notify();

    const path = calculatePath(activePlayer.position, diceRoll);
    return { diceRoll, path };
  }

  public finishTurn(finalPosition: number) {
    if (this.state.phase !== 'PLAYING') return;

    const activeIndex = this.state.activePlayerIndex;
    
    // Immutable update logic
    const newPlayers = [...this.state.players];
    newPlayers[activeIndex] = { ...newPlayers[activeIndex], position: finalPosition };
    
    let nextPhase = this.state.phase;
    let nextWinner = this.state.winner;
    let nextActiveIndex = activeIndex;

    if (finalPosition >= TOTAL_CELLS) {
      nextPhase = 'VICTORY';
      nextWinner = newPlayers[activeIndex];
    } else {
      nextActiveIndex = (activeIndex + 1) % newPlayers.length;
    }
    
    this.state = {
      ...this.state,
      players: newPlayers,
      phase: nextPhase,
      winner: nextWinner,
      activePlayerIndex: nextActiveIndex,
      isAnimating: false,
    };
    
    this.notify();
  }
  
  public resetGame() {
    this.state = this.getInitialState();
    this.notify();
  }

  public getState() {
    return this.state;
  }
}

export const gameEngine = new GameEngine();
