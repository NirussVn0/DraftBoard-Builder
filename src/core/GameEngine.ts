import type { GameState, Player, GamePhase } from './GameState';
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
    this.observers.forEach((observer) => observer({ ...this.state }));
  }

  public startGame(players: Omit<Player, 'position' | 'id'>[]) {
    this.state = {
      ...this.getInitialState(),
      phase: 'IDLE_TURN',
      players: players.map((p, index) => ({
        ...p,
        id: `player-${index + 1}`,
        position: 1,
      })),
    };
    this.notify();
  }

  public rollDice(): void {
    if (this.state.phase !== 'IDLE_TURN') return;

    const diceRoll = Math.floor(Math.random() * 6) + 1;
    
    this.state = {
      ...this.state,
      diceValue: diceRoll,
      phase: 'ROLLING_DICE',
    };
    
    this.notify();
  }

  public concludeDiceRoll(): number[] | null {
    if (this.state.phase !== 'ROLLING_DICE') return null;
    
    const activePlayer = this.state.players[this.state.activePlayerIndex];
    const path = calculatePath(activePlayer.position, this.state.diceValue);

    this.state = {
      ...this.state,
      phase: 'MOVING_TOKEN',
    };
    this.notify();

    return path;
  }

  public finishTokenMove(finalPosition: number) {
    if (this.state.phase !== 'MOVING_TOKEN') return;

    const activeIndex = this.state.activePlayerIndex;
    const newPlayers = [...this.state.players];
    
    newPlayers[activeIndex] = { 
      ...newPlayers[activeIndex], 
      position: finalPosition 
    };
    
    let nextPhase: GamePhase = 'IDLE_TURN';
    let nextWinner = this.state.winner;
    let nextActiveIndex = activeIndex;

    if (finalPosition >= TOTAL_CELLS) {
      newPlayers[activeIndex].position = TOTAL_CELLS;
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
