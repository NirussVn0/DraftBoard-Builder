import type { GameState, Player, GamePhase } from './GameState';
import { calculatePath, TOTAL_CELLS } from './Pathfinding';
import type { Tile } from './MapBuilderState';

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
      map: null,
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

  public startGame(players: Omit<Player, 'position' | 'id'>[], customMap?: Tile[]) {
    this.state = {
      ...this.getInitialState(),
      phase: 'IDLE_TURN',
      map: customMap || null,
      players: players.map((p, index) => ({
        ...p,
        id: `player-${index + 1}`,
        position: 0,
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
    if (this.state.phase !== 'ROLLING_DICE' && this.state.phase !== 'EVENT_MYSTERY_ROLL') return null;

    const activePlayer = this.state.players[this.state.activePlayerIndex];
    const maxLevel = this.state.map ? this.state.map.length - 1 : TOTAL_CELLS - 1;

    let path: number[];

    if (this.state.diceValue < 0) {
      path = [];
      let curr = activePlayer.position;
      for (let i = 0; i < Math.abs(this.state.diceValue); i++) {
        curr = Math.max(0, curr - 1);
        path.push(curr);
      }
    } else {
      path = calculatePath(activePlayer.position, this.state.diceValue, maxLevel);
    }

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
    const maxLevel = this.state.map ? this.state.map.length - 1 : TOTAL_CELLS - 1;

    newPlayers[activeIndex] = {
      ...newPlayers[activeIndex],
      position: finalPosition
    };

    this.state = { ...this.state, players: newPlayers, phase: 'EVALUATE_CELL' };
    this.notify();

    setTimeout(() => {
      this.evaluateCell(finalPosition, maxLevel);
    }, 50);
  }

  private evaluateCell(finalPosition: number, maxLevel: number) {
    let nextPhase: GamePhase = 'IDLE_TURN';
    let nextActiveIndex = this.state.activePlayerIndex;
    let nextWinner = this.state.winner;
    let nextDiceValue = this.state.diceValue;

    if (finalPosition >= maxLevel) {
      nextPhase = 'VICTORY';
      nextWinner = this.state.players[this.state.activePlayerIndex];
    } else if (this.state.map) {
      const currentTile = this.state.map[finalPosition];
      if (currentTile && currentTile.type === 'MYSTERY') {
        const randomMystery = Math.floor(Math.random() * 13) - 6;
        nextDiceValue = randomMystery === 0 ? 3 : randomMystery;
        nextPhase = 'EVENT_MYSTERY_ROLL';
      } else {
        nextActiveIndex = (this.state.activePlayerIndex + 1) % this.state.players.length;
      }
    } else {
      nextActiveIndex = (this.state.activePlayerIndex + 1) % this.state.players.length;
    }

    this.state = {
      ...this.state,
      phase: nextPhase,
      winner: nextWinner,
      activePlayerIndex: nextActiveIndex,
      diceValue: nextDiceValue,
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
