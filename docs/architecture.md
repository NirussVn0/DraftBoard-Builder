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

The root `App.tsx` controls application-level modes via `AppMode`:

```
MENU ──► BUILDER ──► PLAYING (SETUP) ──► PLAYING (GAME)
  └──────────────────►┘
```

| AppMode | Screen | Transition |
|---------|--------|-----------|
| `MENU` | `WelcomeMenu` — choose "Play Default Map", "Create Map Builder", or "Play Saved Map" | User selects mode |
| `BUILDER` | `MapBuilderUI` — draw & save a custom path | Save → PLAYING, Cancel → MENU |
| `PLAYING` | `HomeMenu` (SETUP phase) → `BoardGrid` + game loop | Game completes → restart → MENU |

---

## Game Engine — Phase State Machine

`GameEngine.ts` is a singleton pure-OOP class using the Observer pattern.

```
                  ┌─────────┐
           start  │  SETUP  │
   ──────────────►│         │
                  └────┬────┘
                       │ startGame()
                  ┌────▼────────┐
            ┌────►│  IDLE_TURN  │◄──────────────────────────┐
            │     └────┬───┬────┘                           │
            │          │   │                                │
            │          │   └─ skipTurn() ───────────────────┤
            │          │                                    │
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
| `IDLE_TURN` | After turn resolves | Awaiting active player to roll or skip |
| `ROLLING_DICE` | `rollDice()` | Dice values generated (1–5 dice); Full-screen overlay animation |
| `MOVING_TOKEN` | `concludeDiceRoll()` | AnimationService traverses path array cell-by-cell |
| `EVALUATE_CELL` | `finishTokenMove()` | Check if landed cell is END, MYSTERY, or NORMAL |
| `EVENT_MYSTERY_ROLL` | MYSTERY tile detected | Random ±1–6 bonus movement applied at 1.5× speed |
| `VICTORY` | `finalPosition >= maxLevel` | Winner resolved; game ends |

---

## Data Flow — Standard Turn (Dice Revamp)

```
User clicks "ĐỔ XÚC XẮC"
  → App.handleRollDice()
  → GameEngine.rollDice()         [Phase: IDLE_TURN → ROLLING_DICE]
  → UI: Show Full-screen Overlay (backdrop-blur)
  → DiceOverlay renders 1–5 dice, animate rotation/shake via anime.js for 1s
  → App.setTimeout(1000ms) → GameEngine.concludeDiceRoll()
      [Phase: ROLLING_DICE → MOVING_TOKEN]
      → Sum of dice used for movement distance
  → AnimationService.animateTokenMove(...)
      → On completion: onComplete(finalCell)
  → GameEngine.finishTokenMove(finalCell) [Phase: MOVING_TOKEN → EVALUATE_CELL]
  → setTimeout(50ms) → GameEngine.evaluateCell()
```

---

## Planned Architecture Changes

### 🔲 Dice Engine Revamp (Phase 3)

**New State: `diceCount`** — Global setting (1–5). Determines how many dice are rolled per turn.

**New Component: `DiceOverlay`** — Replaces current `DiceUI`.

```
IDLE_TURN:
  → Bottom-center "ĐỔ XÚC XẮC" button (Primary)
  → "BỎ LƯỢT" button (Secondary)

User presses "ĐỔ XÚC XẮC":
  → Phase → ROLLING_DICE
  → Full-screen overlay (backdrop-blur, light theme semi-transparent)
  → 1–5 dice animate at center (1s duration)
  → Dice freeze → show individual results → display total sum
  → 0.5s pause → overlay fades out
  → concludeDiceRoll() → MOVING_TOKEN

User presses "BỎ LƯỢT":
  → gameEngine.skipTurn() → advances to next player's IDLE_TURN
```

### ✅ UI/UX Consistency (Phase 2 - Complete)

**Light Theme Migration:**
- Purged all `bg-gray-900`, `text-white` classes.
- Consistent Tone: Minimalist Light Theme (`bg-slate-50`, `bg-white`).
- Clean UI: High contrast but soft edges.

**Header Navigation:**
- [Settings] and [Home] icons at top-right in `App.tsx`.
- Home button: Confirm popup "Bạn có chắc muốn thoát? Dữ liệu chưa lưu sẽ bị mất".

### 🔲 Map Builder UX & Bug Fixes (Phase 4)

- Fix CSS Grid: Prevent cells from being too small.
- Ghost Cells: Ensure background cells don't show through path tiles.
- Step Index: Render `stepIndex` or a directional pattern inside drawn tiles in Editor.

### 🔲 Local Storage Integration (Phase 5)

- "LƯU MAP" in Map Builder: Serialize `Tile[]` to `localStorage` (key: `draftboard_saved_map`).
- WelcomeMenu: Show "CHƠI MAP ĐÃ LƯU" if data exists.
