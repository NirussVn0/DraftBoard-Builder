import type { GameState, Player, KickEvent } from './GameState';
import { calculatePath, TOTAL_CELLS } from './Pathfinding';
import type { Tile } from './MapBuilderState';
import type { MapSettings } from './SettingsState';
import { DEFAULT_MAP } from './SettingsState';
import type { GameEvent } from './GameEvent';
import { CARD_DEFINITIONS } from './CardRegistry';
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
      quizState: null,
      eventQueue: [],
      envMap: [],
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

  public startGame(players: Omit<Player, 'position' | 'id' | 'buffs'>[], customMap?: Tile[], envMap?: { id: string; x: number; y: number; emoji: string; }[], mapSettings?: MapSettings) {
    this.state = {
      ...this.getInitialState(),
      phase: 'IDLE_TURN',
      map: customMap || null,
      envMap: envMap || [],
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
    this.state = savedState;
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

    const wasFrozen = player.buffs.some(b => b.id === 'FROZEN');

    // Tick buffs
    const newPlayers = [...this.state.players];
    newPlayers[this.state.activePlayerIndex] = {
      ...player,
      buffs: player.buffs
        .map(b => {
           if (wasFrozen && b.id === 'FROZEN') return b;
           return { ...b, turnsRemaining: b.turnsRemaining > 0 ? b.turnsRemaining - 1 : b.turnsRemaining };
        })
        .filter(b => b.turnsRemaining !== 0) // -1 is infinite
    };

    this.state = { ...this.state, players: newPlayers };

    // If frozen, player stays in IDLE_TURN but cannot roll dice. They must manually use the Skip button.
    // (UI will disable the Roll button based on the FROZEN buff)

    const hasDetention = newPlayers[this.state.activePlayerIndex].buffs.some(b => b.id === 'DETENTION');
    if (hasDetention) {
      this.state = { ...this.state, phase: 'EVENT_DETENTION_ROLL' };
      this.notify();
      return;
    }

    this.notify();
  }

  public concludeFrozenSkip(): void {
    if (this.state.phase !== 'EVENT_FROZEN_SKIP') return;
    
    // Decrement FROZEN now
    const player = this.state.players[this.state.activePlayerIndex];
    if (player) {
      const newBuffs = player.buffs
        .map(b => b.id === 'FROZEN' ? { ...b, turnsRemaining: b.turnsRemaining - 1 } : b)
        .filter(b => b.turnsRemaining !== 0);
      this.state.players = this.state.players.map(p => p.id === player.id ? { ...p, buffs: newBuffs } : p);
    }
    
    this.advanceTurn();
    this.notify();
  }

  private advanceTurn(): void {
    this.state = {
      ...this.state,
      phase: 'IDLE_TURN',
      activePlayerIndex: (this.state.activePlayerIndex + 1) % this.state.players.length,
      currentCard: null,
      currentResolution: null,
      quizState: null,
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

  public forceTurn(playerIndex: number): void {
    if (playerIndex < 0 || playerIndex >= this.state.players.length) return;
    this.state = {
      ...this.state,
      phase: 'IDLE_TURN',
      activePlayerIndex: playerIndex,
      currentCard: null,
      currentResolution: null,
      quizState: null,
      kickEvent: null,
      eventQueue: [], // clear queue just in case
    };
    this.notify();
  }

  // --- Dice & Movement ---

  public rollDice(): void {
    if (this.state.phase !== 'IDLE_TURN' && this.state.phase !== 'EVENT_DETENTION_ROLL') return;
    const player = this.state.players[this.state.activePlayerIndex];
    if (player && player.buffs.some(b => b.id === 'FROZEN')) return; // Block rolling if frozen
    this.pushSnapshot();
    const count = this.state.mapSettings.diceCount || 1;
    let total = 0;
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * 6) + 1;
      rolls.push(roll);
      total += roll;
    }
    this.state = {
      ...this.state,
      diceValue: total,
      diceRolls: rolls,
      phase: 'ROLLING_DICE',
    };
    this.notify();
  }

  public skipTurn(): void {
    if (this.state.phase !== 'IDLE_TURN') return;
    
    const player = this.state.players[this.state.activePlayerIndex];
    if (player && player.buffs.some(b => b.id === 'FROZEN')) {
      this.state = { ...this.state, phase: 'EVENT_FROZEN_SKIP' };
      this.notify();
      return;
    }
    
    this.advanceTurn();
  }

  public concludeDiceRoll(): number[] | null {
    if (this.state.phase !== 'ROLLING_DICE') return null;

    const player = this.state.players[this.state.activePlayerIndex];
    const isDungeon = player.buffs.some(b => b.id === 'DETENTION');
    if (isDungeon) {
      if (this.state.diceValue >= this.state.mapSettings.deckConfig.detentionEscapeValue) {
        this.removeBuff(player.id, 'DETENTION');
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
    let hasKick = false;

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
        hasKick = true;
      }
    }

    // Check Card
    if (!hasKick && this.state.map) {
      const currentTile = this.state.map[finalPosition];
      if (currentTile) {
        // Backward compatibility for type === 'MYSTERY'
        const actualCardId = currentTile.cardId || (currentTile.type === 'MYSTERY' ? 'MYSTERY' : undefined);
        if (actualCardId) {
          this.state.eventQueue.push({ type: 'TRIGGER_TILE_CARD', cardId: actualCardId });
          willAdvanceTurn = false;
        }
      }
    }

    if (willAdvanceTurn) {
      this.state.eventQueue.push({ type: 'ADVANCE_TURN' });
    }

    this.processQueue();
  }

  // --- Event Queue Processor ---

  public continueQueue(): void {
    if (this.state.eventQueue.length > 0) {
      this.state.eventQueue.shift();
    }
    this.processQueue();
  }

  public processQueue(): void {
    if (this.state.eventQueue.length === 0) return;

    const event = this.state.eventQueue[0];

    switch (event.type) {
      case 'TRIGGER_TILE_CARD': {
        this.state.eventQueue.shift();
        const card = CARD_DEFINITIONS.get(event.cardId);
        if (!card) {
           this.state.eventQueue.push({ type: 'ADVANCE_TURN' });
           this.processQueue();
           break;
        }
        
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
            { type: 'ANIMATE_CARD', card, resolution: res },
            { type: 'RESOLVE_CARD', card, resolution: res }
         );
        this.state.eventQueue.push({ type: 'ADVANCE_TURN' });
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
           eventsToInsert.push({ type: 'FREEZE_PLAYERS', playerIds: res.targetPlayerIds, turns: res.freezeTurns! });
        } else if (res.type === 'DETENTION') {
           res.targetPlayerIds.forEach(id => eventsToInsert.push({ type: 'APPLY_BUFF', targetId: id, buff: { id: 'DETENTION', turnsRemaining: -1, sourcePlayerId: this.state.players[this.state.activePlayerIndex].id } }));
        } else if (res.type === 'QUIZ') {
           eventsToInsert.push({ type: 'QUIZ_START', challengerId: res.targetPlayerIds[0], opponentId: res.quizOpponentId! });
        } else if (res.type === 'SWAP') {
           const p1 = this.state.players.find(p => p.id === res.targetPlayerIds[0]);
           const p2 = this.state.players.find(p => p.id === res.swapTargetId);
           if (p1 && p2) {
              eventsToInsert.push(
                 { type: 'SWAP_PLAYERS', player1Id: p1.id, player2Id: p2.id }
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
           if (event.steps < 0 && p.buffs.some(b => b.id === 'LIFEBUOY')) {
              this.removeBuff(p.id, 'LIFEBUOY');
              // Negate the negative points (make them not move backward)
              // Go to LIFEBUOY_BREAK phase which shows the shield breaking, then UI calls continueQueue
              this.state = { ...this.state, phase: 'EVENT_LIFEBUOY_BREAK' };
              this.notify();
              break;
           }

           const maxLevel = this.state.map ? this.state.map.length - 1 : TOTAL_CELLS - 1;
           let path: number[] = [];
           let curr = p.position;
           if (event.steps > 0) {
              for (let i = 0; i < event.steps && curr < maxLevel; i++) {
                 curr++;
                 path.push(curr);
              }
           } else {
              for (let i = 0; i < Math.abs(event.steps) && curr > 0; i++) {
                 curr--;
                 path.push(curr);
              }
           }
           if (path.length > 0) {
              this.state = { 
                  ...this.state, 
                  phase: 'EVENT_MOVE_ANIMATION', 
                  moveAnimation: { playerId: event.playerId, path }
              };
              this.notify();
           } else {
              this.processQueue();
           }
        } else {
           this.processQueue();
        }
        break;
      }

      case 'TELEPORT_PLAYER': {
        this.state.eventQueue.shift();
        const p = this.state.players.find(pl => pl.id === event.playerId);
        if (p) {
           this.state = { 
               ...this.state, 
               phase: 'EVENT_TELEPORT_ANIMATION', 
               teleportAnimation: { playerId: event.playerId, position: event.position }
           };
           this.notify();
        } else {
           this.processQueue();
        }
        break;
      }

      case 'SWAP_PLAYERS': {
        this.state.eventQueue.shift();
        const p1 = this.state.players.find(pl => pl.id === event.player1Id);
        const p2 = this.state.players.find(pl => pl.id === event.player2Id);
        if (p1 && p2) {
           this.state = { 
               ...this.state, 
               phase: 'EVENT_SWAP_ANIMATION', 
               swapAnimation: { player1Id: p1.id, player2Id: p2.id }
           };
           this.notify();
        } else {
           this.processQueue();
        }
        break;
      }

      case 'KICK_COLLISION': {
        this.state.eventQueue.shift();
        const kicker = this.state.players.find(p => p.id === event.kickerId);
        const kicked = this.state.players.find(p => p.id === event.kickedId);
        
        if (kicker && kicked && kicker.position === kicked.position) {
           const hasShield = kicked.buffs.some(b => b.id === 'LIFEBUOY');
           const hasReflect = kicked.buffs.some(b => b.id === 'COUNTER_ARGUMENT');

           if (hasReflect) {
              this.state.eventQueue.unshift({ type: 'CHECK_COUNTER_ARGUMENT', targetId: kicked.id, attackerId: kicker.id, damage: this.state.mapSettings.kickDistance });
              this.processQueue();
           } else if (hasShield) {
              this.state.eventQueue.unshift({ type: 'CHECK_LIFEBUOY', targetId: kicked.id, attackerId: kicker.id, damage: this.state.mapSettings.kickDistance });
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
              
              // After kick, evaluate mystery only if this is the LAST kick for this position
              const hasMoreKicks = this.state.eventQueue.some(e => e.type === 'KICK_COLLISION');
              if (!hasMoreKicks) {
                 if (this.state.map) {
                    const tile = this.state.map[kicker.position];
                    const actualCardId = tile?.cardId || (tile?.type === 'MYSTERY' ? 'MYSTERY' : undefined);
                    if (actualCardId) {
                       this.state.eventQueue.unshift({ type: 'TRIGGER_TILE_CARD', cardId: actualCardId });
                    } else {
                       this.state.eventQueue.unshift({ type: 'ADVANCE_TURN' });
                    }
                 } else {
                    this.state.eventQueue.unshift({ type: 'ADVANCE_TURN' });
                 }
              }

              this.notify();
              // UI calls resolveKick() which will now just be continueQueue()
           }
        } else {
           // Skip if positions mismatch (e.g. got reflected away)
           const hasMoreKicks = this.state.eventQueue.some(e => e.type === 'KICK_COLLISION');
           if (!hasMoreKicks) {
              this.state.eventQueue.unshift({ type: 'ADVANCE_TURN' });
           }
           this.processQueue();
        }
        break;
      }

      case 'CHECK_LIFEBUOY': {
        this.state.eventQueue.shift();
        this.removeBuff(event.targetId, 'LIFEBUOY');
        this.state = { ...this.state, phase: 'EVENT_LIFEBUOY_BREAK' };
        
        const kicker = this.state.players.find(p => p.id === event.attackerId);
        const hasMoreKicks = this.state.eventQueue.some(e => e.type === 'KICK_COLLISION');
        if (!hasMoreKicks) {
           if (kicker && this.state.map) {
              const tile = this.state.map[kicker.position];
              const actualCardId = tile?.cardId || (tile?.type === 'MYSTERY' ? 'MYSTERY' : undefined);
              if (actualCardId) {
                 this.state.eventQueue.unshift({ type: 'TRIGGER_TILE_CARD', cardId: actualCardId });
              } else {
                 this.state.eventQueue.unshift({ type: 'ADVANCE_TURN' });
              }
           } else {
              this.state.eventQueue.unshift({ type: 'ADVANCE_TURN' });
           }
        }

        this.notify();
        break;
      }

      case 'CHECK_COUNTER_ARGUMENT': {
        this.state.eventQueue.shift();
        const attacker = this.state.players.find(p => p.id === event.attackerId);
        
        // Reflected: attacker leaves the tile, so cancel any remaining kicks they had
        this.state.eventQueue = this.state.eventQueue.filter(e => e.type !== 'KICK_COLLISION');

        if (attacker) {
           this.state.eventQueue.unshift(
              { type: 'TELEPORT_PLAYER', playerId: attacker.id, position: Math.max(0, attacker.position - event.damage) },
              { type: 'ADVANCE_TURN' }
           );
        } else {
           this.state.eventQueue.unshift({ type: 'ADVANCE_TURN' });
        }
        this.state = { ...this.state, phase: 'EVENT_COUNTER' };
        this.notify();
        break;
      }

      case 'QUIZ_START': {
        this.state.eventQueue.shift();
        this.state = { 
           ...this.state, 
           phase: 'EVENT_QUIZ',
           quizState: {
              challengerId: event.challengerId,
              opponentId: event.opponentId,
              phase: 'VS_SCREEN'
           }
        };
        this.notify();
        // UI will handle quiz logic, then push QUIZ_RESOLVE
        break;
      }

      case 'QUIZ_RESOLVE': {
        this.state.eventQueue.shift();
        const winner = this.state.players.find(p => p.id === event.winnerId);
        const loser = this.state.players.find(p => p.id === event.loserId);
        
        if (winner && loser) {
           const reward = this.state.mapSettings.deckConfig.quizReward;
           const penalty = this.state.mapSettings.deckConfig.quizPenalty;
           this.state.eventQueue.unshift(
              { type: 'MOVE_PLAYER', playerId: winner.id, steps: reward },
              { type: 'MOVE_PLAYER', playerId: loser.id, steps: -penalty }
           );
        }
        this.processQueue();
        break;
      }

      case 'FREEZE_PLAYERS': {
        // Apply FROZEN buff directly — do NOT use queue, because continueQueue()
        // will shift the next item when the UI animation ends, which would eat the APPLY_BUFF.
        event.playerIds.forEach(id => {
          const freezeTarget = this.state.players.find(p => p.id === id);
          if (freezeTarget) {
            const newBuffs = freezeTarget.buffs.filter(b => b.id !== 'FROZEN');
            newBuffs.push({ id: 'FROZEN', turnsRemaining: event.turns, sourcePlayerId: this.state.players[this.state.activePlayerIndex].id });
            this.state.players = this.state.players.map(p => p.id === id ? { ...p, buffs: newBuffs } : p);
          }
        });
        // Don't shift — let continueQueue() handle it when UI calls back
        this.state = { ...this.state, phase: 'EVENT_FREEZE' };
        this.notify();
        break;
      }

      case 'ADVANCE_TURN': {
        this.state.eventQueue.shift();
        this.advanceTurn();
        break;
      }

      case 'DETENTION_CHECK': {
        this.state.eventQueue.shift();
        this.processQueue();
        break;
      }
    }
  }


  public resolveKick(): void {
    // Legacy — maps to processQueue in Epic 4.
    this.state.kickEvent = null;
    this.processQueue();
  }

  public advanceQuizPhase(): void {
    if (this.state.phase !== 'EVENT_QUIZ' || !this.state.quizState) return;
    const next = this.state.quizState.phase === 'VS_SCREEN' ? 'QUESTION' : 'WAITING_HOST';
    this.state = {
      ...this.state,
      quizState: { ...this.state.quizState, phase: next },
    };
    this.notify();
  }

  public finishEventMove(playerId: string, finalPosition: number): void {
    this.state.players = this.state.players.map(p => p.id === playerId ? { ...p, position: finalPosition } : p);
    this.state.moveAnimation = undefined;
    const maxLevel = this.state.map ? this.state.map.length - 1 : TOTAL_CELLS - 1;
    if (finalPosition >= maxLevel) {
      this.state = { ...this.state, phase: 'VICTORY', winner: this.state.players.find(p => p.id === playerId)! };
      this.notify();
      return;
    }
    this.processQueue();
  }

  public finishEventTeleport(playerId: string, finalPosition: number): void {
    this.state.players = this.state.players.map(p => p.id === playerId ? { ...p, position: finalPosition } : p);
    this.state.teleportAnimation = undefined;
    const maxLevel = this.state.map ? this.state.map.length - 1 : TOTAL_CELLS - 1;
    if (finalPosition >= maxLevel) {
      this.state = { ...this.state, phase: 'VICTORY', winner: this.state.players.find(p => p.id === playerId)! };
      this.notify();
      return;
    }
    this.processQueue();
  }

  public finishEventSwap(player1Id: string, player2Id: string): void {
    const p1 = this.state.players.find(p => p.id === player1Id);
    const p2 = this.state.players.find(p => p.id === player2Id);
    if (p1 && p2) {
       const pos1 = p1.position;
       const pos2 = p2.position;
       this.state.players = this.state.players.map(p => {
          if (p.id === player1Id) return { ...p, position: pos2 };
          if (p.id === player2Id) return { ...p, position: pos1 };
          return p;
       });
       
       const maxLevel = this.state.map ? this.state.map.length - 1 : TOTAL_CELLS - 1;
       if (pos1 >= maxLevel || pos2 >= maxLevel) {
          const winnerId = pos1 >= maxLevel ? player2Id : player1Id; // Because positions are swapped
          this.state = { ...this.state, phase: 'VICTORY', winner: this.state.players.find(p => p.id === winnerId)! };
          this.notify();
          return;
       }
    }
    this.state.swapAnimation = undefined;
    this.processQueue();
  }

  public pushQuizResult(winnerId: string, loserId: string): void {
    if (this.state.phase !== 'EVENT_QUIZ') return;
    this.state.eventQueue.unshift({ type: 'QUIZ_RESOLVE', winnerId, loserId });
    this.state = {
      ...this.state,
      quizState: this.state.quizState ? { ...this.state.quizState, phase: 'RESOLVED', winnerId } : null,
    };
    this.notify();
    setTimeout(() => this.processQueue(), 1200); // allow winner VFX
  }

  /** Neither player answered → no reward, no penalty, just continue */
  public pushQuizDraw(): void {
    if (this.state.phase !== 'EVENT_QUIZ') return;
    this.state = {
      ...this.state,
      quizState: this.state.quizState ? { ...this.state.quizState, phase: 'RESOLVED' } : null,
    };
    this.notify();
    setTimeout(() => this.processQueue(), 1200);
  }

  public resolveDetentionRoll(value: number): void {
    const player = this.state.players[this.state.activePlayerIndex];
    if (!player) return;
    if (value >= this.state.mapSettings.deckConfig.detentionEscapeValue) {
      this.removeBuff(player.id, 'DETENTION');
    }
    this.advanceTurn();
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
