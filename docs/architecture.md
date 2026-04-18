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
│   │   ├── BoardGrid.tsx           # Renders tiles (legacy or custom), tokens at computed positions
│   │   └── PlayerStatsPanel.tsx    # Right-side panel showing player positions & active turn
│   ├── HomeMenu/
│   │   └── HomeMenu.tsx            # Player count + name + color configuration (SETUP phase)
│   ├── MapBuilder/
│   │   └── MapBuilderUI.tsx        # Editor grid, tool palette, undo/redo controls
│   └── PlayMenu/
│       ├── DiceOverlay.tsx         # Sky-drop dice animation overlay (replaces old DiceUI)
│       └── DiceUI.tsx              # [DEPRECATED] Old static center dice
├── core/
│   ├── GameEngine.ts               # Singleton state machine; all business logic
│   ├── GameState.ts                # Type definitions: Player, GamePhase, GameState
│   ├── MapBuilderState.ts          # Tile types, useMapBuilder() hook, generateZigzagMap()
│   └── Pathfinding.ts             # Coordinate formulas, path calculator, token metrics
└── services/
    └── AnimationService.ts         # anime.js bridge; token movement + sky-drop dice
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
| `MENU` | `WelcomeMenu` — choose "Play Default Map" or "Create Map Builder" | User selects mode |
| `BUILDER` | `MapBuilderUI` — draw & save a custom path | Save → PLAYING, Cancel → MENU |
| `PLAYING` | `HomeMenu` (SETUP) → `BoardGrid` + `PlayerStatsPanel` + game loop | Game completes → restart → MENU |

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
            │     └────┬────────┘                           │
            │          │ rollDice()                          │
            │     ┌────▼──────────┐                        │
            │     │ ROLLING_DICE  │  (Sky-drop overlay)    │
            │     └────┬──────────┘                        │
            │          │ concludeDiceRoll()                  │
            │     ┌────▼──────────┐                        │
            │     │ MOVING_TOKEN  │                        │
            │     └────┬──────────┘                        │
            │          │ finishTokenMove()                   │
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

---

## Data Flow — Standard Turn (Sky-Drop Dice)

```
User clicks "ROLL DICE" (bottom-center button)
  → App.handleRollDice()
  → GameEngine.rollDice()         [Phase: IDLE_TURN → ROLLING_DICE]
  → App shows DiceOverlay (backdrop-blur overlay)
  → DiceOverlay triggers AnimationService.animateSkyDropDice():
      anime.js: translateY[-800→0, easeOutBounce] + rotate[2turn, easeInOutSine]
      Duration: 1000ms
  → Animation complete → show final dice value → wait 1000ms
  → DiceOverlay.onComplete() → App.handleDiceAnimationComplete()
  → GameEngine.concludeDiceRoll()  [Phase: ROLLING_DICE → MOVING_TOKEN]
  → AnimationService.animateTokenMove(...)
      → Token hops cell-by-cell (300ms/step, easeInOutQuad)
  → onComplete(finalCell)
  → GameEngine.finishTokenMove(finalCell) [Phase: MOVING_TOKEN → EVALUATE_CELL]
  → setTimeout(50ms) → GameEngine.evaluateCell()
```

---

## Board Layout

- **Sharp Edges**: All tiles and grid elements use strict 0 border-radius (rectangular).
- **Pure Background**: No checkerboard/alternating patterns. Pure white board background.
- **Token Containment**: Tokens sized at 70% of cell (`TOKEN_SCALE = 0.7`), centered with `getTokenMetrics()`.
- **Side Panel**: `PlayerStatsPanel` shows each player's name, color, current card position, and active turn indicator.

---

## Token Positioning (Single Source of Truth)

Both `BoardGrid.tsx` and `AnimationService.ts` use shared functions from `Pathfinding.ts`:

```
getTokenMetrics(cellSizePct) → { tokenSizePct, centerOffset }
getPlayerOffset(playerIndex, cellSizePct) → { offsetX, offsetY }

Final position:
  left = x * cellSizePct + centerOffset + offsetX
  top  = y * cellSizePct + centerOffset + offsetY
```

---

## Planned Architecture Changes

### 🔲 Mystery Card Flip (Phase 3)

- Rename "Mystery Box" → "Mystery Card".
- 3D card flip animation using `rotateY[-180→0]` + `scale[0.5→1.2→1]`.
- Backdrop-blur overlay, 1.5s display, then resolve movement at 1.5× speed.

### 🔲 Builder UX (Phase 4)

- First tile renders "IN", last tile renders "OUT" explicitly.
- Fix CSS Grid sizing issues.

### 🔲 Local Storage Integration (Phase 5)

- "LƯU MAP" in Map Builder: Serialize `Tile[]` to `localStorage` (key: `draftboard_saved_map`).
- WelcomeMenu: Show "CHƠI MAP ĐÃ LƯU" if data exists.
