# Epic 3 — Architecture & System Design

> **Status**: 🔒 AWAITING CEO APPROVAL — No code shall be written until this document is approved.

---

## Table of Contents

1. [Codebase Audit — Current Violations](#1-codebase-audit)
2. [Ticket 3.1 — i18n & Design System](#2-ticket-31)
3. [Ticket 3.2 — Camera Engine & Dice UX](#3-ticket-32)
4. [Ticket 3.3 — Settings & Collision Logic](#4-ticket-33)
5. [Updated Directory Structure](#5-directory-structure)
6. [Updated State Machine Diagram](#6-state-machine)
7. [Implementation Order & Risk Assessment](#7-implementation-order)

---

## 1. Codebase Audit

### Hardcoded Strings (i18n Violations)

| File | Hardcoded Strings |
|------|-------------------|
| `WelcomeMenu.tsx` | "DraftBoard", "Select your game mode", "Play Default Map", "Chơi Map Đã Lưu", "Create Map Builder" |
| `HomeMenu.tsx` | "DraftBoard", "Number of Players", "Player Setup", "Start Game", "Player X" |
| `PlayerStatsPanel.tsx` | "Players", "Card X / Y", "Turn" |
| `MysteryCardOverlay.tsx` | "+X STEPS", "Mystery Card", "MYSTERY" |
| `BoardGrid.tsx` | "IN", "OUT" |
| `App.tsx` | "Roll Dice", "VICTORY!", "X won!", "Play Again", confirm dialogs |
| `MapBuilderUI.tsx` | "Map Builder", "Tools", "Draw Path", "Eraser", "Mystery Card", "Clear Map", "Save & Play", "Lưu Map", "Cancel", alert strings |

### Design System Violations (Web-App Aesthetics)

| File | Violation |
|------|-----------|
| `HomeMenu.tsx` | `rounded-[2rem]`, `rounded-xl` on container and buttons |
| `WelcomeMenu.tsx` | `rounded-[2rem]`, `rounded-2xl` on container and buttons |
| `MapBuilderUI.tsx` | `rounded-xl` on tool palette buttons, `rounded-3xl` on sidebar |
| `index.css` | `.glass` utility uses web-app glassmorphism |

### Broken Features

| Issue | Root Cause |
|-------|-----------|
| Settings button does nothing | `handleSettings()` is empty placeholder |
| No Skip Turn | Not implemented |
| No collision detection | `evaluateCell()` only checks tile type, never checks other players |

---

## 2. Ticket 3.1 — i18n & Design System

### 2.1 i18n Dictionary Pattern

**File: `src/locales/types.ts`**

```typescript
export interface LocaleStrings {
  welcome: {
    title: string;
    subtitle: string;
    playDefault: string;
    playSaved: string;
    createBuilder: string;
  };
  home: {
    title: string;
    numPlayers: string;
    playerSetup: string;
    startGame: string;
    playerDefault: (n: number) => string;
  };
  board: {
    tileIn: string;
    tileOut: string;
  };
  stats: {
    heading: string;
    cardPosition: (current: number, max: number) => string;
    turnBadge: string;
  };
  dice: {
    rollButton: string;
    skipButton: string;
  };
  mystery: {
    title: string;
    backLabel: string;
    stepsLabel: (n: number) => string;
  };
  victory: {
    title: string;
    winMessage: (name: string) => string;
    playAgain: string;
  };
  kick: {
    message: (kicker: string, kicked: string, steps: number) => string;
  };
  builder: {
    title: string;
    tools: string;
    drawPath: string;
    eraser: string;
    mysteryCard: string;
    clearMap: string;
    savePlay: string;
    saveLocal: string;
    cancel: string;
    savedSuccess: string;
    tooShort: string;
  };
  settings: {
    title: string;
    language: string;
    sound: string;
    animations: string;
    cameraTrack: string;
    diceCount: string;
    kickDistance: string;
    exactLanding: string;
  };
  common: {
    confirmExit: string;
    savedMapError: string;
  };
}

export type LocaleKey = 'vi' | 'en';
```

**File: `src/locales/vi.ts`** (default)

```typescript
import type { LocaleStrings } from './types';

export const vi: LocaleStrings = {
  welcome: {
    title: 'DraftBoard',
    subtitle: 'Chọn chế độ chơi',
    playDefault: 'Chơi Map Mặc Định',
    playSaved: 'Chơi Map Đã Lưu',
    createBuilder: 'Tạo Map Mới',
  },
  home: {
    title: 'DraftBoard',
    numPlayers: 'Số người chơi',
    playerSetup: 'Cài đặt người chơi',
    startGame: 'Bắt Đầu',
    playerDefault: (n) => `Người chơi ${n}`,
  },
  // ... (all other domains)
};
```

**Consumption Pattern — `src/locales/index.ts`:**

```typescript
import { vi } from './vi';
import { en } from './en';
import type { LocaleStrings, LocaleKey } from './types';

const LOCALES: Record<LocaleKey, LocaleStrings> = { vi, en };
let currentLocale: LocaleKey = 'vi';

export function setLocale(key: LocaleKey) { currentLocale = key; }
export function t(): LocaleStrings { return LOCALES[currentLocale]; }
```

> **Design Decision**: No React Context overhead. `t()` is a pure module-level function. Components call `t().dice.rollButton`. Language switch triggers a full re-render via `forceUpdate` or state change in App.

### 2.2 Design System — "Cardboard" CSS Tokens

**File: `src/index.css` additions:**

```css
:root {
  /* Cardboard Design Tokens */
  --card-radius: 2px;
  --card-border: 1px solid rgba(0, 0, 0, 0.12);
  --card-shadow:
    0 2px 0 rgba(0, 0, 0, 0.12),     /* bottom edge — physical thickness */
    0 4px 8px rgba(0, 0, 0, 0.06);    /* soft ambient shadow */
  --card-inset: inset 0 1px 0 rgba(255, 255, 255, 0.4);  /* top highlight */

  /* Tile-specific */
  --tile-shadow:
    0 1px 0 rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Utility class for all game cards */
.game-card {
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow), var(--card-inset);
}

.game-tile {
  border-radius: var(--card-radius);
  box-shadow: var(--tile-shadow);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
```

**Purge List** — classes to remove:

| Class | Replace With |
|-------|-------------|
| `rounded-[2rem]` | `game-card` |
| `rounded-2xl` | `game-card` |
| `rounded-xl` | `game-card` or `rounded-sm` |
| `rounded-lg` | `rounded-sm` |
| `shadow-2xl` (on cards) | `game-card` shadow tokens |

### 2.3 Settings Panel Routing

**Current**: `handleSettings = () => {}` (no-op).

**New**: `handleSettings` toggles a `showSettings` boolean state. A `<SettingsPanel>` drawer slides in from the right edge using anime.js `translateX`.

```
AppHeader [Settings click]
  → setShowSettings(true)
  → <SettingsPanel> slides in (translateX: 100% → 0, 300ms, easeOutCubic)
  → User changes settings
  → Close → slides out (translateX: 0 → 100%, 200ms, easeInCubic)
```

---

## 3. Ticket 3.2 — Camera Engine & Dice UX

### 3.1 Camera System Architecture

**New File: `src/services/CameraService.ts`**

```typescript
export interface CameraState {
  scale: number;
  translateX: number;  // in pixels
  translateY: number;  // in pixels
}

export class CameraService {
  private containerEl: HTMLElement | null = null;
  private state: CameraState = { scale: 1, translateX: 0, translateY: 0 };

  public attach(el: HTMLElement) { this.containerEl = el; }

  public panTo(
    targetTileX: number,
    targetTileY: number,
    containerWidth: number,
    cellSizePx: number
  ): void {
    // Calculate target translation to center the tile
    const targetPxX = targetTileX * cellSizePx + cellSizePx / 2;
    const targetPxY = targetTileY * cellSizePx + cellSizePx / 2;
    const tx = -(targetPxX - containerWidth / 2);
    const ty = -(targetPxY - containerWidth / 2);

    this.animateParabolic(tx, ty);
  }

  private animateParabolic(tx: number, ty: number): void {
    if (!this.containerEl) return;

    const tl = anime.timeline({ easing: 'easeInOutCubic' });

    // Phase 1: Zoom OUT (see whole board)
    tl.add({
      targets: this.containerEl,
      scale: 0.5,
      duration: 400,
      easing: 'easeOutQuad',
    });

    // Phase 2: PAN to target (parabolic middle)
    tl.add({
      targets: this.containerEl,
      translateX: tx,
      translateY: ty,
      duration: 600,
      easing: 'easeInOutCubic',
    });

    // Phase 3: Zoom IN (focus on player)
    tl.add({
      targets: this.containerEl,
      scale: 1.2,
      duration: 400,
      easing: 'easeOutQuad',
    });
  }
}
```

**New Component: `src/components/Board/CameraWrapper.tsx`**

```
<div className="relative overflow-hidden w-full aspect-square">  <!-- viewport -->
  <div ref={cameraRef} style={{ transformOrigin: 'center center' }}>  <!-- camera -->
    <BoardGrid ... />
  </div>
</div>
```

**Parabolic Tracking — Visual Timeline:**

```
Time:   0ms      400ms      1000ms     1400ms
Scale:  1.0  ──►  0.5   ──►  0.5  ──►   1.2
Pan:    (A)  ──►  (A)   ──►  (B)  ──►   (B)
        ╰── zoom out ──╯╰── pan ──╯╰── zoom in ──╯

Bezier path (top-view):
  Start(A) ──── arc up ──── End(B)
                 ↑
            camera pulls back,
            sweeps across, dives in
```

### 3.2 Dice Separation

**Current** (single entity):
```
DiceOverlay = [DiceIcon + Number] in same <div>
```

**New** (two separate entities):

```
DiceOverlay (orchestrator)
  ├── PhysicalDice (id="sky-drop-dice")
  │     • Sky-drop animation: translateY[-800→0], rotate[2turn]
  │     • Shows cycling Dice1-Dice6 icons during fall
  │     • Lands → bounces → freezes on final face
  │
  └── DiceResultBanner (id="dice-result-banner")
        • Hidden during dice fall
        • After dice lands + 200ms pause:
        •   slideIn from bottom (translateY[100→0], 300ms)
        •   Shows: large number + player color accent
        • Hold for 800ms → both elements fade out
```

**Timing Diagram:**
```
0ms          1000ms  1200ms      1500ms    2300ms
|── dice drops ──|    |── banner ──|── hold ──|── close
                 land  slide-in     display    onComplete()
```

### 3.3 Skip Turn

**GameEngine addition:**

```typescript
public skipTurn(): void {
  if (this.state.phase !== 'IDLE_TURN') return;
  this.state = {
    ...this.state,
    activePlayerIndex: (this.state.activePlayerIndex + 1) % this.state.players.length,
  };
  this.notify();
}
```

**UI**: Two buttons at bottom-center during `IDLE_TURN`:

```
┌──────────┐  ┌──────────────────┐
│   SKIP   │  │   🎲 ROLL DICE   │
│  (muted) │  │   (primary)      │
└──────────┘  └──────────────────┘
```

---

## 4. Ticket 3.3 — Settings & Collision Logic

### 4.1 Settings Data Schemas

**File: `src/core/SettingsState.ts`**

```typescript
// ── Persisted to localStorage ──
export interface GlobalSettings {
  locale: 'vi' | 'en';
  enableSoundEffects: boolean;
  enableAnimations: boolean;
  cameraAutoTrack: boolean;
}

export const DEFAULT_GLOBAL: GlobalSettings = {
  locale: 'vi',
  enableSoundEffects: false,
  enableAnimations: true,
  cameraAutoTrack: true,
};

// ── Per-game session (configured in HomeMenu SETUP) ──
export interface MapSettings {
  diceCount: number;       // 1-3, sum of N dice
  kickDistance: number;     // 0=off, 1-6
  exactLanding: boolean;   // true=bounce-back, false=overshoot wins
}

export const DEFAULT_MAP: MapSettings = {
  diceCount: 1,
  kickDistance: 3,
  exactLanding: true,
};

// ── localStorage helpers ──
const GLOBAL_KEY = 'draftboard_global_settings';

export function loadGlobal(): GlobalSettings {
  try {
    const raw = localStorage.getItem(GLOBAL_KEY);
    return raw ? { ...DEFAULT_GLOBAL, ...JSON.parse(raw) } : DEFAULT_GLOBAL;
  } catch { return DEFAULT_GLOBAL; }
}

export function saveGlobal(settings: GlobalSettings): void {
  localStorage.setItem(GLOBAL_KEY, JSON.stringify(settings));
}
```

### 4.2 GameState Extension

```typescript
// ── Updated GameState.ts ──

export type GamePhase =
  | 'SETUP'
  | 'IDLE_TURN'
  | 'ROLLING_DICE'
  | 'MOVING_TOKEN'
  | 'EVALUATE_CELL'
  | 'EVENT_MYSTERY_ROLL'
  | 'EVENT_KICK'          // NEW
  | 'VICTORY';

export interface KickEvent {
  kickerPlayerId: string;
  kickedPlayerId: string;
  kickedFromPosition: number;
  kickedToPosition: number;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  activePlayerIndex: number;
  winner: Player | null;
  diceValue: number;
  map: Tile[] | null;
  mapSettings: MapSettings;       // NEW
  kickEvent: KickEvent | null;    // NEW
}
```

### 4.3 "Kick" Collision — evaluateCell Update

```typescript
private evaluateCell(finalPosition: number, maxLevel: number) {
  const activePlayer = this.state.players[this.state.activePlayerIndex];
  const mapSettings = this.state.mapSettings;

  // ── Priority 1: Victory ──
  if (finalPosition >= maxLevel) {
    this.setPhase('VICTORY', { winner: activePlayer });
    return;
  }

  // ── Priority 2: Collision / Kick ──
  if (mapSettings.kickDistance > 0) {
    const collidedPlayer = this.state.players.find(
      (p, idx) => idx !== this.state.activePlayerIndex
                && p.position === finalPosition
    );

    if (collidedPlayer) {
      const kickedTo = Math.max(0, collidedPlayer.position - mapSettings.kickDistance);

      // Update kicked player's position
      const newPlayers = this.state.players.map(p =>
        p.id === collidedPlayer.id ? { ...p, position: kickedTo } : p
      );

      this.state = {
        ...this.state,
        players: newPlayers,
        phase: 'EVENT_KICK',
        kickEvent: {
          kickerPlayerId: activePlayer.id,
          kickedPlayerId: collidedPlayer.id,
          kickedFromPosition: collidedPlayer.position,
          kickedToPosition: kickedTo,
        },
      };
      this.notify();
      return;
      // After kick animation completes → App calls resolveKick()
      // resolveKick() checks for MYSTERY on active player's tile, then advances turn
    }
  }

  // ── Priority 3: Mystery Card ──
  if (this.state.map) {
    const tile = this.state.map[finalPosition];
    if (tile?.type === 'MYSTERY') {
      const randomMystery = Math.floor(Math.random() * 13) - 6;
      this.setPhase('EVENT_MYSTERY_ROLL', {
        diceValue: randomMystery === 0 ? 3 : randomMystery,
      });
      return;
    }
  }

  // ── Priority 4: Normal — next turn ──
  this.advanceTurn();
}

public resolveKick(): void {
  if (this.state.phase !== 'EVENT_KICK') return;

  // After kick animation, check if active player's tile is MYSTERY
  const activePlayer = this.state.players[this.state.activePlayerIndex];
  if (this.state.map) {
    const tile = this.state.map[activePlayer.position];
    if (tile?.type === 'MYSTERY') {
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
```

### 4.4 Updated State Machine with Kick

```
                  ┌─────────┐
           start  │  SETUP  │
   ──────────────►│         │
                  └────┬────┘
                       │ startGame()
                  ┌────▼────────┐
            ┌────►│  IDLE_TURN  │◄─────────────────────────────────┐
            │     └──┬──────┬───┘                                  │
            │        │      │ skipTurn()                            │
            │        │      └──────────────────────────────────────►┘
            │        │ rollDice()
            │     ┌──▼──────────┐
            │     │ ROLLING_DICE│  (DiceOverlay: PhysicalDice + Banner)
            │     └──┬──────────┘
            │        │ concludeDiceRoll()
            │     ┌──▼──────────┐
            │     │ MOVING_TOKEN│  (anime.js hop animation)
            │     └──┬──────────┘
            │        │ finishTokenMove()
            │     ┌──▼──────────┐
            │     │EVALUATE_CELL│
            │     └──┬──────────┘
            │        │
            │   ┌────┴────────────────────────┐
            │   │          │         │         │
            │ [KICK]    [MYSTERY]  [END]    [NORMAL]
            │   │          │         │         │
            │ ┌─▼────────┐ │    VICTORY        │
            │ │EVENT_KICK │ │                   │
            │ └─┬────────┘ │                   │
            │   │resolveKick()                  │
            │   ├──[MYSTERY]──►EVENT_MYSTERY    │
            │   └──[NORMAL]────────────────────►┘
            │                  │
            │   ┌──────────────▼──┐
            │   │EVENT_MYSTERY_ROLL│
            │   └──┬──────────────┘
            │      │ concludeDiceRoll() → finishTokenMove()
            └──────┘
```

---

## 5. Updated Directory Structure

```
src/
├── App.tsx
├── main.tsx
├── index.css                          # + cardboard CSS tokens
├── locales/                           # NEW — i18n
│   ├── types.ts                       # LocaleStrings interface
│   ├── vi.ts                          # Vietnamese dictionary
│   ├── en.ts                          # English dictionary
│   └── index.ts                       # t() accessor, setLocale()
├── components/
│   ├── WelcomeMenu.tsx
│   ├── Board/
│   │   ├── BoardGrid.tsx
│   │   ├── CameraWrapper.tsx          # NEW — viewport + transform wrapper
│   │   └── PlayerStatsPanel.tsx
│   ├── HomeMenu/
│   │   └── HomeMenu.tsx               # + MapSettings config UI
│   ├── MapBuilder/
│   │   └── MapBuilderUI.tsx
│   ├── PlayMenu/
│   │   ├── DiceOverlay.tsx            # REFACTORED — orchestrates two sub-entities
│   │   ├── PhysicalDice.tsx           # NEW — sky-drop animation only
│   │   ├── DiceResultBanner.tsx       # NEW — number display only
│   │   ├── MysteryCardOverlay.tsx
│   │   └── KickOverlay.tsx            # NEW — collision event overlay
│   └── Settings/
│       └── SettingsPanel.tsx           # NEW — slide-in drawer
├── core/
│   ├── GameEngine.ts                  # + skipTurn(), resolveKick(), collision logic
│   ├── GameState.ts                   # + MapSettings, KickEvent, EVENT_KICK phase
│   ├── MapBuilderState.ts
│   ├── Pathfinding.ts
│   └── SettingsState.ts               # NEW — GlobalSettings, MapSettings, defaults
└── services/
    ├── AnimationService.ts
    └── CameraService.ts               # NEW — parabolic pan/zoom
```

---

## 6. Dice Count Implementation

When `mapSettings.diceCount > 1`:

```typescript
public rollDice(): void {
  if (this.state.phase !== 'IDLE_TURN') return;

  let total = 0;
  for (let i = 0; i < this.state.mapSettings.diceCount; i++) {
    total += Math.floor(Math.random() * 6) + 1;
  }

  this.state = { ...this.state, diceValue: total, phase: 'ROLLING_DICE' };
  this.notify();
}
```

DiceOverlay shows N `PhysicalDice` instances dropping simultaneously, then `DiceResultBanner` shows the sum.

---

## 7. Implementation Order & Risk Assessment

| Priority | Ticket | Risk | Rationale |
|----------|--------|------|-----------|
| 1 | 3.1a: Design System CSS tokens | Low | Pure CSS, no logic changes |
| 2 | 3.1b: i18n dictionary + integration | Medium | Touches ALL components, high surface area |
| 3 | 3.3a: SettingsState types + defaults | Low | New file, no existing code modified |
| 4 | 3.1c: Settings panel UI + routing fix | Low | New component + wire handleSettings |
| 5 | 3.3b: MapSettings in HomeMenu | Medium | UI changes to HomeMenu |
| 6 | 3.3c: Kick collision in GameEngine | High | State machine modification, new phase |
| 7 | 3.3d: KickOverlay component | Medium | New overlay + animation |
| 8 | 3.2a: Skip Turn | Low | Simple method + button |
| 9 | 3.2b: Dice separation | Medium | Refactor existing DiceOverlay |
| 10 | 3.2c: Camera system | High | New service + wrapper, affects all board rendering |

> **Risk Mitigation**: Each ticket should be committed independently with `tsc --noEmit` validation. Camera system (highest risk) is last to avoid breaking board rendering mid-implementation.

---

## Appendix: Hardcoded String Count

**Total hardcoded strings to extract**: ~45 unique strings across 10 files.

**Estimated LOC for i18n integration**: ~120 lines (types) + ~90 lines per locale + ~30 lines (accessor) + ~200 lines (component updates) = **~530 LOC total**.
