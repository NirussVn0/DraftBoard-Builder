import type { GameState, Player, KickEvent } from './GameState';
import { calculatePath, TOTAL_CELLS } from './Pathfinding';
import type { Tile } from './MapBuilderState';
import type { MapSettings } from './SettingsState';
import { DEFAULT_MAP } from './SettingsState';
import type { GameEvent } from './GameEvent';
import { drawCard } from './CardRegistry';
import type { CardContext } from './CardTypes';

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
      currentCard: null,
      currentResolution: null,
      duelState: null,
      eventQueue: [],
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

  public startGame(players: Omit<Player, 'position' | 'id' | 'buffs'>[], customMap?: Tile[], mapSettings?: MapSettings) {
    this.state = {
      ...this.getInitialState(),
      phase: 'IDLE_TURN',
      map: customMap || null,
      mapSettings: mapSettings || { ...DEFAULT_MAP },
      players: players.map((p, index) => ({
        ...p,
        id: `player-${index + 1}`,
        position: 0,
        buffs: [],
      })),
    };
    // processBuffs for player 1 immediately
    this.notify();
    this.processBuffs();
  }

  public loadState(savedState: GameState) {
    this.state = {
      ...savedState,
      currentCard: savedState.currentCard || null,
      currentResolution: savedState.currentResolution || null,
      duelState: savedState.duelState || null,
      eventQueue: savedState.eventQueue || [],
      players: savedState.players.map(p => ({
        ...p,
        buffs: p.buffs || []
      }))
    };
    this.history = [];
    this.state.canUndo = false;
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
    
    this.state = {
      ...this.state,
      canUndo: true
    };
  }

  // --- Turn Management & Buffs ---

  public processBuffs(): void {
    if (this.state.phase !== 'IDLE_TURN') return;
    const player = this.state.players[this.state.activePlayerIndex];
    if (!player) return;

    let skipTurn = false;
    let dungeonRoll = false;

    // Check FROZEN
    const frozen = player.buffs.find(b => b.id === 'FROZEN');
    if (frozen) {
      this.removeBuff(player.id, 'FROZEN');
      skipTurn = true;
    }

    // Check DUNGEON
    const dungeon = player.buffs.find(b => b.id === 'DUNGEON');
    if (dungeon && !skipTurn) {
      dungeonRoll = true;
    }

    // Tick buffs
    const newPlayers = [...this.state.players];
    newPlayers[this.state.activePlayerIndex] = {
      ...player,
      buffs: player.buffs
        .map(b => ({ ...b, turnsRemaining: b.turnsRemaining > 0 ? b.turnsRemaining - 1 : b.turnsRemaining }))
        .filter(b => b.turnsRemaining !== 0) // -1 is infinite
    };

    this.state = { ...this.state, players: newPlayers };

    if (skipTurn) {
      this.advanceTurn();
      return;
    }

    if (dungeonRoll) {
      this.state = { ...this.state, phase: 'EVENT_DUNGEON_ROLL' };
      this.notify();
      return;
    }

    this.notify();
  }

  private advanceTurn(): void {
    this.state = {
      ...this.state,
      phase: 'IDLE_TURN',
      activePlayerIndex: (this.state.activePlayerIndex + 1) % this.state.players.length,
      currentCard: null,
      currentResolution: null,
      duelState: null,
      kickEvent: null,
    };
    this.notify();
    this.processBuffs();
  }

  public removeBuff(playerId: string, buffId: string) {
    this.state.players = this.state.players.map(p => 
      p.id === playerId ? { ...p, buffs: p.buffs.filter(b => b.id !== buffId) } : p
    );
  }

  // --- Dice & Movement ---

  public rollDice(): void {
    if (this.state.phase !== 'IDLE_TURN' && this.state.phase !== 'EVENT_DUNGEON_ROLL') return;
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
    this.advanceTurn();
  }

  public concludeDiceRoll(): number[] | null {
    if (this.state.phase !== 'ROLLING_DICE') return null;

    const player = this.state.players[this.state.activePlayerIndex];
    const isDungeon = player.buffs.some(b => b.id === 'DUNGEON');
    if (isDungeon) {
      if (this.state.diceValue >= this.state.mapSettings.deckConfig.dungeonEscapeValue) {
        this.removeBuff(player.id, 'DUNGEON');
      } else {
        this.advanceTurn();
        return null;
      }
    }

    const maxLevel = this.state.map ? this.state.map.length - 1 : TOTAL_CELLS - 1;
    let path: number[];

    if (this.state.diceValue < 0) {
      path = [];
      let curr = player.position;
      for (let i = 0; i < Math.abs(this.state.diceValue); i++) {
        curr = Math.max(0, curr - 1);
        path.push(curr);
      }
    } else {
      path = calculatePath(player.position, this.state.diceValue, maxLevel);
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

    if (finalPosition >= maxLevel) {
      this.state = { ...this.state, phase: 'VICTORY', winner: activePlayer };
      this.notify();
      return;
    }

    let willAdvanceTurn = true;

    // Check Kick
    if (this.state.mapSettings.kickDistance > 0) {
      const collidedPlayer = this.state.players.find(
        (p, idx) => idx !== this.state.activePlayerIndex
                  && p.position === finalPosition
                  && finalPosition > 0
      );

      if (collidedPlayer) {
        this.state.eventQueue.push({
           type: 'KICK_COLLISION',
           kickerId: activePlayer.id,
           kickedId: collidedPlayer.id
        });
        willAdvanceTurn = false;
      }
    }

    // Check Mystery
    if (this.state.map) {
      const currentTile = this.state.map[finalPosition];
      if (currentTile && currentTile.type === 'MYSTERY') {
        this.state.eventQueue.push({ type: 'DRAW_CARD' });
        willAdvanceTurn = false;
      }
    }

    if (willAdvanceTurn) {
      this.state.eventQueue.push({ type: 'ADVANCE_TURN' });
    }

    this.processQueue();
  }

  // --- Event Queue Processor ---

  public processQueue(): void {
    if (this.state.eventQueue.length === 0) return;

    const event = this.state.eventQueue[0];

    switch (event.type) {
      case 'DRAW_CARD': {
        this.state.eventQueue.shift();
        const card = drawCard(this.state.mapSettings.deckConfig);
        const ctx: CardContext = {
           activePlayer: this.state.players[this.state.activePlayerIndex],
           allPlayers: this.state.players,
           activePlayerIndex: this.state.activePlayerIndex,
           mapLength: this.state.map ? this.state.map.length : TOTAL_CELLS,
           deckConfig: this.state.mapSettings.deckConfig,
        };
        const res = card.resolve(ctx);
        
        this.state.eventQueue.unshift(
           { type: 'ANIMATE_PRECAST', card },
           { type: 'RESOLVE_CARD', card, resolution: res },
           { type: 'ANIMATE_CARD', card, resolution: res }
           // Card resolution might push MORE events like MOVE or TELEPORT. We shouldn't automatically advance turn unless queue is truly empty. Wait, evaluateCell already enqueued ADVANCE_TURN if no kick/mystery. Oh wait, if mystery, evaluateCell doesn't push ADVANCE_TURN. So we must push it here.
        );
        this.state.eventQueue.push({ type: 'ADVANCE_TURN' }); // Ensure turn ends eventually
        this.processQueue();
        break;
      }

      case 'ANIMATE_PRECAST': {
        this.state = { ...this.state, phase: 'EVENT_DRAW_CARD', currentCard: event.card };
        this.notify();
        // UI must call continueQueue()
        break;
      }

      case 'RESOLVE_CARD': {
        this.state.eventQueue.shift();
        this.state = { ...this.state, phase: 'EVENT_CARD_RESOLVE', currentCard: event.card, currentResolution: event.resolution };
        
        const res = event.resolution;
        const eventsToInsert: GameEvent[] = [];
        
        if (res.type === 'MOVE') {
           res.targetPlayerIds.forEach(id => eventsToInsert.push({ type: 'MOVE_PLAYER', playerId: id, steps: res.steps! }));
        } else if (res.type === 'TELEPORT') {
           res.targetPlayerIds.forEach(id => eventsToInsert.push({ type: 'TELEPORT_PLAYER', playerId: id, position: res.newPosition! }));
        } else if (res.type === 'BUFF') {
           res.targetPlayerIds.forEach(id => eventsToInsert.push({ type: 'APPLY_BUFF', targetId: id, buff: res.buff! }));
        } else if (res.type === 'FREEZE') {
           res.targetPlayerIds.forEach(id => eventsToInsert.push({ type: 'FREEZE_PLAYER', playerId: id, turns: res.freezeTurns! }));
        } else if (res.type === 'DUEL') {
           eventsToInsert.push({ type: 'DUEL_START', challengerId: res.targetPlayerIds[0], opponentId: res.duelOpponentId! });
        } else if (res.type === 'SWAP') {
           const p1 = this.state.players.find(p => p.id === res.targetPlayerIds[0]);
           const p2 = this.state.players.find(p => p.id === res.swapTargetId);
           if (p1 && p2) {
              eventsToInsert.push(
                 { type: 'TELEPORT_PLAYER', playerId: p1.id, position: p2.position },
                 { type: 'TELEPORT_PLAYER', playerId: p2.id, position: p1.position }
              );
           }
        }

        this.state.eventQueue.unshift(...eventsToInsert);
        this.processQueue();
        break;
      }

      case 'ANIMATE_CARD': {
        this.state = { ...this.state, phase: 'EVENT_CARD_ANIMATE', currentCard: event.card, currentResolution: event.resolution };
        this.notify();
        // UI must call continueQueue()
        break;
      }

      case 'APPLY_BUFF': {
        this.state.eventQueue.shift();
        const player = this.state.players.find(p => p.id === event.targetId);
        if (player) {
           const newBuffs = player.buffs.filter(b => b.id !== event.buff.id);
           newBuffs.push(event.buff);
           this.state.players = this.state.players.map(p => p.id === event.targetId ? { ...p, buffs: newBuffs } : p);
        }
        this.processQueue();
        break;
      }

      case 'REMOVE_BUFF': {
        this.state.eventQueue.shift();
        this.removeBuff(event.targetId, event.buffId);
        this.processQueue();
        break;
      }

      case 'MOVE_PLAYER': {
        this.state.eventQueue.shift();
        const p = this.state.players.find(pl => pl.id === event.playerId);
        if (p) {
           const newPos = Math.max(0, p.position + event.steps);
           this.state.players = this.state.players.map(pl => pl.id === event.playerId ? { ...pl, position: newPos } : pl);
           // After a card moves someone, it might land on mystery again. 
           // In advanced games, we evaluate. Here we just move instantly for chaos effect.
        }
        this.processQueue();
        break;
      }

      case 'TELEPORT_PLAYER': {
        this.state.eventQueue.shift();
        const p = this.state.players.find(pl => pl.id === event.playerId);
        if (p) {
           this.state.players = this.state.players.map(pl => pl.id === event.playerId ? { ...pl, position: event.position } : pl);
        }
        this.processQueue();
        break;
      }

      case 'KICK_COLLISION': {
        this.state.eventQueue.shift();
        const kicker = this.state.players.find(p => p.id === event.kickerId);
        const kicked = this.state.players.find(p => p.id === event.kickedId);
        
        if (kicker && kicked) {
           const hasShield = kicked.buffs.some(b => b.id === 'SHIELD');
           const hasReflect = kicked.buffs.some(b => b.id === 'REFLECT');

           if (hasReflect) {
              this.state.eventQueue.unshift({ type: 'CHECK_REFLECT', targetId: kicked.id, attackerId: kicker.id, damage: this.state.mapSettings.kickDistance });
              this.processQueue();
           } else if (hasShield) {
              this.state.eventQueue.unshift({ type: 'CHECK_SHIELD', targetId: kicked.id, attackerId: kicker.id, damage: this.state.mapSettings.kickDistance });
              this.processQueue();
           } else {
              const kickedTo = Math.max(0, kicked.position - this.state.mapSettings.kickDistance);
              this.state.players = this.state.players.map(p => p.id === kicked.id ? { ...p, position: kickedTo } : p);
              
              const kickEvent: KickEvent = {
                 kickerPlayerId: kicker.id,
                 kickedPlayerId: kicked.id,
                 kickedFromPosition: kicked.position,
                 kickedToPosition: kickedTo,
              };
              this.state = { ...this.state, phase: 'EVENT_KICK', kickEvent };
              
              // After kick, evaluate mystery if needed
              if (this.state.map) {
                 const tile = this.state.map[kicker.position];
                 if (tile && tile.type === 'MYSTERY') {
                    this.state.eventQueue.unshift({ type: 'DRAW_CARD' });
                 } else {
                    this.state.eventQueue.unshift({ type: 'ADVANCE_TURN' });
                 }
              } else {
                 this.state.eventQueue.unshift({ type: 'ADVANCE_TURN' });
              }

              this.notify();
              // UI calls resolveKick() which will now just be continueQueue()
           }
        } else {
           this.processQueue();
        }
        break;
      }

      case 'CHECK_SHIELD': {
        this.state.eventQueue.shift();
        this.removeBuff(event.targetId, 'SHIELD');
        this.state = { ...this.state, phase: 'EVENT_SHIELD_BREAK' };
        this.notify();
        // UI calls continueQueue()
        break;
      }

      case 'CHECK_REFLECT': {
        this.state.eventQueue.shift();
        const attacker = this.state.players.find(p => p.id === event.attackerId);
        if (attacker) {
           this.state.eventQueue.unshift({ type: 'TELEPORT_PLAYER', playerId: attacker.id, position: Math.max(0, attacker.position - event.damage) });
        }
        this.state = { ...this.state, phase: 'EVENT_REFLECT' };
        this.notify();
        // UI calls continueQueue()
        break;
      }

      case 'DUEL_START': {
        this.state.eventQueue.shift();
        this.state = { 
           ...this.state, 
           phase: 'EVENT_DUEL',
           duelState: {
              challengerId: event.challengerId,
              opponentId: event.opponentId,
              phase: 'VS_SCREEN'
           }
        };
        this.notify();
        // UI will handle duel logic, then push DUEL_RESOLVE
        break;
      }

      case 'DUEL_RESOLVE': {
        this.state.eventQueue.shift();
        const winner = this.state.players.find(p => p.id === event.winnerId);
        const loser = this.state.players.find(p => p.id === event.loserId);
        
        if (winner && loser) {
           const reward = this.state.mapSettings.deckConfig.duelReward;
           const penalty = this.state.mapSettings.deckConfig.duelPenalty;
           this.state.eventQueue.unshift(
              { type: 'MOVE_PLAYER', playerId: winner.id, steps: reward },
              { type: 'MOVE_PLAYER', playerId: loser.id, steps: -penalty }
           );
        }
        this.processQueue();
        break;
      }

      case 'FREEZE_PLAYER': {
        this.state.eventQueue.shift();
        this.state.eventQueue.unshift({ type: 'APPLY_BUFF', targetId: event.playerId, buff: { id: 'FROZEN', turnsRemaining: event.turns, sourcePlayerId: this.state.players[this.state.activePlayerIndex].id }});
        this.state = { ...this.state, phase: 'EVENT_FREEZE' };
        this.notify();
        // UI calls continueQueue()
        break;
      }

      case 'ADVANCE_TURN': {
        this.state.eventQueue.shift();
        this.advanceTurn();
        break;
      }

      case 'DUNGEON_CHECK': {
        this.state.eventQueue.shift();
        this.processQueue();
        break;
      }
    }
  }

  public continueQueue() {
    this.state.eventQueue.shift();
    this.processQueue();
  }

  public resolveKick(): void {
    // Legacy support, maps to continueQueue in Epic 4.
    this.state.kickEvent = null;
    this.continueQueue();
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
