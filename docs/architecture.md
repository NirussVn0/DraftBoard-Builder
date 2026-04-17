# Architecture — DraftBoard-Builder

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build Tool | Vite 8 |
| UI Framework | React 19 |
| Language | TypeScript (strict mode, zero `any`) |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Animation | animejs v3.2.2 |

---

## Directory Structure

```
src/
├── App.tsx                         # Root controller — AppMode routing & game event orchestration
├── main.tsx                        # React DOM entry point
├── index.css                       # Tailwind import, base styles, custom animations
├── components/
│   ├── WelcomeMenu.tsx             # Mode selection entry screen (MENU)
│   ├── Board/
│   │   └── BoardGrid.tsx           # Renders tiles (legacy or custom), tokens at computed positions
│   ├── HomeMenu/
│   │   └── HomeMenu.tsx            # Player count + name + color configuration (SETUP phase)
│   ├── MapBuilder/
│   │   └── MapBuilderUI.tsx        # Editor grid, tool palette, undo/redo controls
│   └── PlayMenu/
│       └── DiceUI.tsx              # Visual dice cycling; bound to GamePhase
├── core/
│   ├── GameEngine.ts               # Singleton state machine; all business logic
│   ├── GameState.ts                # Type definitions: Player, GamePhase, GameState
│   ├── MapBuilderState.ts          # Tile types, useMapBuilder() hook, generateZigzagMap()
│   └── Pathfinding.ts             # Legacy coordinate formulas; bounce-back path calculator
└── services/
    └── AnimationService.ts         # anime.js bridge; token movement + dice shake
```

---

## Application Mode State Machine

The root `App.tsx` controls three application-level modes via `AppMode`:

```
MENU ──► BUILDER ──► PLAYING
  └──────────────────►┘
```

| AppMode | Screen | Transition |
|---------|--------|-----------|
| `MENU` | `WelcomeMenu` — choose "Play Default Map" or "Create Map Builder" | User selects mode |
| `BUILDER` | `MapBuilderUI` — draw & save a custom path | Save → PLAYING, Cancel → MENU |
| `PLAYING` | `HomeMenu` (SETUP phase) → `BoardGrid` + game loop | Game completes → restart → MENU |

### Transitions Detail

- **MENU → PLAYING**: `setPendingMap(generateZigzagMap())` pre-loads a 28-tile S-curve default path
- **MENU → BUILDER**: Opens the MapBuilderUI editor
- **BUILDER → PLAYING**: `onSave(path)` validates path length > 5, forces final tile to END, calls `gameEngine.resetGame()`, sets `pendingMap`
- **BUILDER → MENU**: Cancel button returns to WelcomeMenu
- **PLAYING → MENU**: Victory "Play Again" button calls `gameEngine.resetGame()` + `setAppMode('MENU')`

---

## Game Engine — Phase State Machine

`GameEngine.ts` is a singleton pure-OOP class using the Observer pattern. Phase transitions are the only way state changes.

```
                  ┌─────────┐
           start  │  SETUP  │
   ──────────────►│         │
                  └────┬────┘
                       │ startGame()
                  ┌────▼────────┐
            ┌────►│  IDLE_TURN  │◄──────────────────────────┐
            │     └────┬────────┘                           │
            │          │ rollDice()                         │
            │     ┌────▼──────────┐                        │
            │     │ ROLLING_DICE  │                        │
            │     └────┬──────────┘                        │
            │          │ concludeDiceRoll()                 │
            │     ┌────▼──────────┐                        │
            │     │ MOVING_TOKEN  │                        │
            │     └────┬──────────┘                        │
            │          │ finishTokenMove()                  │
            │     ┌────▼──────────┐                        │
            │     │ EVALUATE_CELL │                        │
            │     └────┬──────────┘                        │
            │          │                                    │
            │    ┌─────┴──────────────┐                   │
            │    │                    │                    │
            │  [MYSTERY]           [NORMAL/END]            │
            │    │                    │                    │
            │  ┌─▼───────────────┐  [END] ──► VICTORY     │
            │  │EVENT_MYSTERY_ROLL│  [NORMAL]──────────────┘
            │  └─────────────────┘
            │          │ concludeDiceRoll() → finishTokenMove()
            └──────────┘ (same player, isFast=true)
```

| Phase | Trigger | Responsibility |
|-------|---------|---------------|
| `SETUP` | Initial / `resetGame()` | HomeMenu player configuration screen |
| `IDLE_TURN` | After turn resolves | Awaiting active player to roll |
| `ROLLING_DICE` | `rollDice()` | Dice value generated (1–6); UI cycling animation runs |
| `MOVING_TOKEN` | `concludeDiceRoll()` | AnimationService traverses path array cell-by-cell |
| `EVALUATE_CELL` | `finishTokenMove()` | Check if landed cell is END, MYSTERY, or NORMAL |
| `EVENT_MYSTERY_ROLL` | MYSTERY tile detected | Random ±1–6 bonus movement applied at 1.5× speed |
| `VICTORY` | `finalPosition >= maxLevel` | Winner resolved; game ends |

### evaluateCell Logic

1. If `finalPosition >= maxLevel` → `VICTORY`, set `winner`
2. Else if custom map and tile type is `MYSTERY` → generate random ±1–6 (rerolls 0 → 3), set `EVENT_MYSTERY_ROLL`
3. Else → advance `activePlayerIndex`, set `IDLE_TURN`

---

## Map Data Model

Two board modes share the same engine via a polymorphic path system.

### Legacy Mode — 36-Cell Perimeter Ring

Defined by `Pathfinding.ts`. No `MapData` required.

- `TOTAL_CELLS = 36`, `BOARD_SIZE = 10`
- `getCoordinatesFromCell(cell)` computes `{x, y}` from a formula (top row → right col → bottom row → left col)
- Bounce-back logic: `calculatePath(start, dice, maxCell)` iterates forward, reverses direction on hitting `maxCell`
- `getPlayerOffset(playerIndex)` returns `{offsetX, offsetY}` for token stacking (±1.5% per quadrant)

### Custom Map Mode — `Tile[]` Path Array

Defined by `MapBuilderState.ts`. Passed as `GameState.map: Tile[] | null`.

```typescript
type TileType = 'START' | 'NORMAL' | 'MYSTERY' | 'END';

interface Tile {
  stepIndex: number;  // 0-based sequential index (0 = START)
  x: number;          // Grid column (0–14 for MAP_SIZE=15)
  y: number;          // Grid row (0–14 for MAP_SIZE=15)
  type: TileType;
}
```

- `stepIndex` is the canonical cell number for engine logic
- `path.length - 1` is the `maxLevel` (END tile index)
- `getTokenPosition()` in `BoardGrid.tsx` branches: lookup `map[stepIndex]` for custom maps, formula for legacy
- `generateZigzagMap()` produces a 28-tile S-curve path used when "Play Default Map" is selected

---

## Map Builder — Editor State Hook

`useMapBuilder()` in `MapBuilderState.ts` is a pure React hook (no engine dependency).

```
History Stack: Tile[][]
Index pointer: number

addNode(x, y)     → fills orthogonal segment from last node to (x,y), pushes snapshot
eraseFrom(step)   → trims path back to stepIndex, promotes new tail to END, pushes snapshot
toggleMystery(step) → toggles NORMAL ↔ MYSTERY at step, pushes snapshot
clearMap()        → pushes empty snapshot
undo()            → decrements index
redo()            → increments index
```

Constraints enforced at `addNode`:
- Diagonal moves rejected (must share same `x` OR same `y`)
- Same-cell clicks rejected

### Editor Tools (MapBuilderUI)

| Tool | Behavior |
|------|----------|
| `DRAW` | Click empty cell → `addNode(x, y)` extends path |
| `ERASE` | Click path tile → `eraseFrom(stepIndex)` trims from that point |
| `MYSTERY` | Click path tile → `toggleMystery(stepIndex)` toggles NORMAL ↔ MYSTERY |

Keyboard shortcuts: `Ctrl+Z` (undo), `Ctrl+Y` / `Ctrl+Shift+Z` (redo)

---

## Data Flow — Standard Turn

```
User clicks "Roll Dice"
  → App.handleRollDice()
  → GameEngine.rollDice()         [Phase: IDLE_TURN → ROLLING_DICE]
  → DiceUI shuffles display for 700ms (cycling random 1–6 at 100ms intervals)
  → App.setTimeout(700ms) → GameEngine.concludeDiceRoll()
      [Phase: ROLLING_DICE → MOVING_TOKEN]
      → calculatePath(position, dice, maxLevel) with bounce-back
  → AnimationService.animateTokenMove(tokenId, playerIndex, path[], onComplete, isFast=false, map?)
      → anime.timeline() steps through each cell in path[]
      → Each step: resolves (x,y) via map lookup or Pathfinding formula
      → 300ms per cell: 150ms up+scale, 150ms down+restore
      → On completion: onComplete(finalCell)
  → GameEngine.finishTokenMove(finalCell) [Phase: MOVING_TOKEN → EVALUATE_CELL]
  → setTimeout(50ms) → GameEngine.evaluateCell()
      [Phase: EVALUATE_CELL → VICTORY | IDLE_TURN | EVENT_MYSTERY_ROLL]
```

## Data Flow — Mystery Tile Resolution

```
Phase becomes EVENT_MYSTERY_ROLL
  → App.useEffect subscription triggers
  → AnimationService.animateTokenMove(currentPosition) — bounce on current cell
  → onComplete → setTimeout(500ms pause)
  → GameEngine.concludeDiceRoll()  [uses stored diceValue which is ±1–6]
  → AnimationService.animateTokenMove(..., isFast=true) — 200ms per cell (300/1.5)
  → GameEngine.finishTokenMove() → evaluateCell() → IDLE_TURN (next player)
```

---

## Component Map

| File | Directory | Type | Responsibility |
|------|-----------|------|---------------|
| `App.tsx` | `src/` | Controller | AppMode routing; game event orchestration; setTimeout coordination |
| `WelcomeMenu.tsx` | `src/components/` | Presentational | Mode selection: "Play Default Map" / "Create Map Builder" |
| `HomeMenu.tsx` | `src/components/HomeMenu/` | Stateful UI | Player count (2–4), name input, color picker per player |
| `BoardGrid.tsx` | `src/components/Board/` | Presentational | Renders tiles (legacy ring or custom Tile[]), tokens at computed positions |
| `DiceUI.tsx` | `src/components/PlayMenu/` | Stateful UI | Visual dice cycling (lucide Dice1–Dice6 icons); bound to GamePhase |
| `MapBuilderUI.tsx` | `src/components/MapBuilder/` | Stateful UI | Editor grid (15×15), tool palette (DRAW/ERASE/MYSTERY), undo/redo, save/cancel |

---

## Service Map

| File | Responsibility |
|------|---------------|
| `GameEngine.ts` | Singleton state machine; all business logic; Observer pattern notification |
| `GameState.ts` | Type definitions: `Player`, `GamePhase`, `GameState` |
| `MapBuilderState.ts` | `Tile` / `TileType` types, `useMapBuilder()` hook, `generateZigzagMap()`, `MAP_SIZE = 15` |
| `Pathfinding.ts` | `BOARD_SIZE = 10`, `TOTAL_CELLS = 36`, coordinate formulas, bounce-back path calculator, player offset |
| `AnimationService.ts` | anime.js bridge; `animateTokenMove()` (timeline per cell), `animateDiceShake()` |

---

## Key Invariants

1. **Zero `any`** — All data structures have explicit interfaces. `AnimationService` accepts `Tile[]` not `any[]`.
2. **No inline comments** — Self-documenting naming is the only documentation at code level.
3. **No `console.*` calls** — All debug output must be removed before commit.
4. **Phase-gated actions** — Every engine method guards on `this.state.phase` as its first line.
5. **Animation owns timing** — `App.tsx` owns `setTimeout` delays between phases. Services are pure executors.
6. **Token position branches** — `getTokenPosition()` in `BoardGrid` is the single source of truth for DOM coordinates, handling both board modes.
7. **Immutable state updates** — GameEngine spreads state on every mutation; observers receive shallow copies.

---

## Planned Architecture Changes

### 🔲 Dice Engine Revamp (Phase 3)

**New State: `diceCount`** — Global setting (1–5) stored in `GameState` or a new `SettingsState`. Determines how many dice are rolled per turn.

**New Component: `DiceOverlay`** — Replaces current center-mounted `DiceUI`.

```
IDLE_TURN:
  → Bottom-center "ĐỔ XÚC XẮC" button visible
  → Optional "BỎ LƯỢT" (Skip Turn) button beside it

User presses "ĐỔ XÚC XẮC":
  → Phase → ROLLING_DICE
  → Full-screen overlay appears (backdrop-blur, semi-transparent dark)
  → 1–5 dice render at center, each with anime.js rotation/shake (1s duration)
  → Dice freeze → show individual results → display total sum
  → 0.5s pause → overlay fades out
  → concludeDiceRoll() → MOVING_TOKEN → token auto-moves

User presses "BỎ LƯỢT":
  → Skip directly to next player's IDLE_TURN (no roll, no animation)
```

**AnimationService additions:**
- `animateDiceOverlay(diceCount, results[], onComplete)` — orchestrates multi-dice animation
- Each die: random rotation via anime.js keyframes, staggered stop timing

### 🔲 UI/UX Consistency (Phase 4)

**Light Theme Migration:**
- Remove all `bg-slate-900`, `bg-slate-800`, `bg-slate-700`, `text-white` dark classes from `WelcomeMenu.tsx` and `MapBuilderUI.tsx`
- Enforce consistent `bg-slate-50` / `bg-white` light palette across all screens
- MapBuilderUI sidebar: light background with subtle borders

**Header Navigation:**
- Persistent header bar with `[Home]` and `[Settings]` icons (lucide-react) at top-right
- Home button: `window.confirm("Bạn có chắc muốn thoát? Dữ liệu chưa lưu sẽ bị mất")` → navigate to MENU
- Settings button: opens settings panel (dice count selector)

**Map Builder Fixes:**
- Fix CSS Grid cell sizing (ensure minimum visible size)
- Remove ghost background cells (no duplicate rendering under path tiles)
- Display `stepIndex` numbers on all drawn tiles in editor mode

### 🔲 Local Storage Integration (Phase 5)

**New persistence layer:**

```typescript
const STORAGE_KEY = 'draftboard_saved_map';

function saveMap(tiles: Tile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
}

function loadMap(): Tile[] | null {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

function clearSavedMap(): void {
  localStorage.removeItem(STORAGE_KEY);
}
```

**UI changes:**
- MapBuilderUI: "LƯU MAP" button serializes `Tile[]` to localStorage
- WelcomeMenu: if `localStorage` has saved map data → show "CHƠI MAP ĐÃ LƯU" button
- Optional: "Clear Saved Map" action
