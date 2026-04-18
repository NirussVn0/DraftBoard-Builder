import type { GameState, Player, KickEvent } from './GameState';
import { calculatePath, TOTAL_CELLS } from './Pathfinding';
import type { Tile } from './MapBuilderState';
import type { MapSettings } from './SettingsState';
import { DEFAULT_MAP } from './SettingsState';

export type GameStateObserver = (state: GameState) => void;

class GameEngine {
  private state: GameState;
  private observers: GameStateObserver[] = [];
  private history: Omit<GameState, 'canUndo'>[] = [];
  private static MAX_HISTORY = 20;

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
      mapSettings: { ...DEFAULT_MAP },
      kickEvent: null,
      canUndo: false,
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

  public startGame(players: Omit<Player, 'position' | 'id'>[], customMap?: Tile[], mapSettings?: MapSettings) {
    this.state = {
      ...this.getInitialState(),
      phase: 'IDLE_TURN',
      map: customMap || null,
      mapSettings: mapSettings || { ...DEFAULT_MAP },
      players: players.map((p, index) => ({
        ...p,
        id: `player-${index + 1}`,
        position: 0,
      })),
    };
    this.notify();
  }

  private pushSnapshot(): void {
    const snapshot = structuredClone({
      ...this.state,
    }) as any;
    delete snapshot.canUndo;

    this.history.push(snapshot);
    if (this.history.length > GameEngine.MAX_HISTORY) {
      this.history.shift();
    }
    
    // Update current state to reflect it can be undone
    this.state = {
      ...this.state,
      canUndo: true
    };
  }

  public rollDice(): void {
    if (this.state.phase !== 'IDLE_TURN') return;

    this.pushSnapshot();

    const diceRoll = Math.floor(Math.random() * 6) + 1;

    this.state = {
      ...this.state,
      diceValue: diceRoll,
      phase: 'ROLLING_DICE',
    };

    this.notify();
  }

  public skipTurn(): void {
    if (this.state.phase !== 'IDLE_TURN') return;

    this.state = {
      ...this.state,
      activePlayerIndex: (this.state.activePlayerIndex + 1) % this.state.players.length,
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
    const activePlayer = this.state.players[this.state.activePlayerIndex];

    // ── Priority 1: Victory ──
    if (finalPosition >= maxLevel) {
      this.state = {
        ...this.state,
        phase: 'VICTORY',
        winner: activePlayer,
      };
      this.notify();
      return;
    }

    // ── Priority 2: Collision / Kick ──
    if (this.state.mapSettings.kickDistance > 0) {
      const collidedPlayer = this.state.players.find(
        (p, idx) => idx !== this.state.activePlayerIndex
                  && p.position === finalPosition
                  && finalPosition > 0 // Don't kick at START
      );

      if (collidedPlayer) {
        const kickedTo = Math.max(0, collidedPlayer.position - this.state.mapSettings.kickDistance);

        const newPlayers = this.state.players.map(p =>
          p.id === collidedPlayer.id ? { ...p, position: kickedTo } : p
        );

        const kickEvent: KickEvent = {
          kickerPlayerId: activePlayer.id,
          kickedPlayerId: collidedPlayer.id,
          kickedFromPosition: collidedPlayer.position,
          kickedToPosition: kickedTo,
        };

        this.state = {
          ...this.state,
          players: newPlayers,
          phase: 'EVENT_KICK',
          kickEvent,
        };
        this.notify();
        return;
        // App calls resolveKick() after kick animation completes
      }
    }

    // ── Priority 3: Mystery Card ──
    if (this.state.map) {
      const currentTile = this.state.map[finalPosition];
      if (currentTile && currentTile.type === 'MYSTERY') {
        const randomMystery = Math.floor(Math.random() * 13) - 6;
        this.state = {
          ...this.state,
          diceValue: randomMystery === 0 ? 3 : randomMystery,
          phase: 'EVENT_MYSTERY_ROLL',
        };
        this.notify();
        return;
      }
    }

    // ── Priority 4: Normal — next turn ──
    this.state = {
      ...this.state,
      phase: 'IDLE_TURN',
      activePlayerIndex: (this.state.activePlayerIndex + 1) % this.state.players.length,
    };
    this.notify();
  }

  /**
   * Called by App after KickOverlay animation completes.
   * Checks if active player's tile is MYSTERY, then advances turn.
   */
  public resolveKick(): void {
    if (this.state.phase !== 'EVENT_KICK') return;

    const activePlayer = this.state.players[this.state.activePlayerIndex];

    // After kick, check if active player landed on MYSTERY
    if (this.state.map) {
      const tile = this.state.map[activePlayer.position];
      if (tile && tile.type === 'MYSTERY') {
        const randomMystery = Math.floor(Math.random() * 13) - 6;
        this.state = {
          ...this.state,
          phase: 'EVENT_MYSTERY_ROLL',
          diceValue: randomMystery === 0 ? 3 : randomMystery,
          kickEvent: null,
        };
        this.notify();
        return;
      }
    }

    // No mystery — advance turn
    this.state = {
      ...this.state,
      phase: 'IDLE_TURN',
      activePlayerIndex: (this.state.activePlayerIndex + 1) % this.state.players.length,
      kickEvent: null,
    };
    this.notify();
  }

  public undo(): void {
    if (this.history.length === 0) return;

    const snapshot = this.history.pop()!;
    this.state = {
      ...snapshot,
      canUndo: this.history.length > 0,
    };
    this.notify();
  }

  public resetGame() {
    this.history = [];
    this.state = this.getInitialState();
    this.notify();
  }

  public getState() {
    return this.state;
  }
}

export const gameEngine = new GameEngine();
