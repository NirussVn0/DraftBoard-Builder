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
| Audio | howler.js (Singleton, lazy-loaded) |
| Emoji Picker | emoji-picker-react v4.18 |

---

## Directory Structure

src/
├── App.tsx                         # Root controller — AppMode routing & game event orchestration
├── main.tsx                        # React DOM entry point
├── index.css                       # Tailwind import, cardboard design tokens, custom animations
├── locales/                        # i18n dictionary system
│   ├── types.ts                    # LocaleStrings interface — all UI text keys
│   ├── vi.ts                       # Vietnamese dictionary (default)
│   └── index.ts                    # t() accessor, setLocale(), getLocale()
├── components/
│   ├── WelcomeMenu.tsx             # Mode selection entry screen (MENU)
│   ├── Board/
│   │   ├── BoardGrid.tsx           # Pixel-based tiles & emoji tokens at absolute positions
│   │   ├── CameraWrapper.tsx       # Viewport container for CSS transform pan/translate
│   │   └── PlayerStatsPanel.tsx    # Fixed HUD panel showing player positions & active turn
│   ├── HomeMenu/
│   │   └── HomeMenu.tsx            # Player count + name + emoji avatar + color setup
│   ├── MapBuilder/
│   │   └── MapBuilderUI.tsx        # Editor grid, tool palette, undo/redo controls
│   ├── PlayMenu/
│   │   ├── DiceOverlay.tsx         # Sky-drop dice animation overlay
│   │   ├── PhysicalDice.tsx        # Animated dice with per-frame number scrambling
│   │   ├── DiceResultBanner.tsx    # Final dice value display
│   │   ├── MysteryCardOverlay.tsx  # 3D card flip animation for mystery tiles
│   │   └── KickOverlay.tsx         # Kick collision impact animation
│   └── Settings/
│       └── SettingsPanel.tsx       # Slide-in drawer for global settings
├── core/
│   ├── GameEngine.ts               # Singleton state machine; Memento undo (20-snapshot cap)
│   ├── GameState.ts                # Types: Player (with emoji), GamePhase, KickEvent, GameState
│   ├── MapBuilderState.ts          # Tile types, useMapBuilder() hook, generateZigzagMap()
│   ├── Pathfinding.ts             # Coordinate formulas, path calculator, player offset
│   └── SettingsState.ts           # GlobalSettings, MapSettings types, localStorage helpers
└── services/
    ├── AnimationService.ts         # anime.js bridge; token movement + sky-drop dice
    ├── AudioService.ts             # Howler.js Singleton; lazy-load with onloaderror guard
    └── CameraService.ts            # Smooth 2D pan tracking via anime.js translateX/Y
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
| `MENU` | `WelcomeMenu` — 4 buttons: Create Map, Play Saved, Resume Game, Play Default | User selects mode |
| `BUILDER` | `MapBuilderUI` — draw & save a custom path | Save → PLAYING (auto-saves to localStorage), Cancel → MENU |
| `PLAYING` | `HomeMenu` (SETUP with Map Settings) → `BoardGrid` + `PlayerStatsPanel` + game loop | Home → saves game state → MENU |

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
            │          │ rollDice() [pushSnapshot()]         │
            │     ┌────▼──────────┐                        │
            │     │ ROLLING_DICE  │  (Sky-drop overlay)    │
            │     └────┬──────────┘                        │
            │          │ concludeDiceRoll()                  │
            │     ┌────▼──────────┐                        │
            │     │ MOVING_TOKEN  │  (Camera tracks)       │
            │     └────┬──────────┘                        │
            │          │ finishTokenMove()                   │
            │     ┌────▼──────────┐                        │
            │     │ EVALUATE_CELL │                        │
            │     └────┬──────────┘                        │
            │          │                                    │
            │    ┌─────┴──────────────┐                   │
            │    │                    │                    │
            │  [MYSTERY]           [KICK/NORMAL/END]       │
            │    │                    │                    │
            │  ┌─▼───────────────┐  [END] ──► VICTORY     │
            │  │EVENT_MYSTERY_ROLL│  [KICK]──► EVENT_KICK  │
            │  └─────────────────┘  [NORMAL]───────────────┘
            │          │ concludeDiceRoll() → finishTokenMove()
            └──────────┘ (same player, isFast=true)
```

### Memento Undo System

- `GameEngine` maintains a private `history: GameState[]` stack (max 20).
- `pushSnapshot()` called before each `rollDice()` via `structuredClone`.
- `undo()` pops the last snapshot, restoring full game state.
- `canUndo` flag in `GameState` controls the HUD button visibility.

---

## Data Flow — Standard Turn (Sky-Drop Dice)

```
User clicks "ROLL DICE" (bottom-center button)
  → App.handleRollDice()
  → GameEngine.rollDice()         [Phase: IDLE_TURN → ROLLING_DICE]
  → App shows DiceOverlay (backdrop-blur overlay)
  → DiceOverlay triggers AnimationService.animateSkyDropDice()
      → anime.js: translateY[-800→0, easeOutBounce] + rotate[2turn]
      → update(): scramble dice number on every frame
      → complete(): lock final value, play SFX
  → DiceOverlay.onComplete() → App.handleDiceAnimationComplete()
  → GameEngine.concludeDiceRoll()  [Phase: ROLLING_DICE → MOVING_TOKEN]
  → AnimationService.animateTokenMove(...)
      → Token hops cell-by-cell (300ms/step, easeInOutQuad)
      → CameraService.panTo() called per step (smooth tracking)
  → onComplete(finalCell)
  → GameEngine.finishTokenMove(finalCell) [Phase: MOVING_TOKEN → EVALUATE_CELL]
  → setTimeout(50ms) → GameEngine.evaluateCell()
```

---

## Board Layout — Pixel-Based Coordinate System

- **TILE_PX = 64**: Shared constant between `BoardGrid` and `AnimationService`.
- **Fullscreen**: Board container is `w-screen h-screen`. No `overflow-hidden` on board/camera containers (tokens must be free to overflow cell boundaries).
- **Sharp Edges**: All tiles use strict 0 border-radius (rectangular cardboard aesthetic).
- **Transparent BG**: Board background is transparent; page bg (`bg-slate-50`) shows through.
- **Token Z-index**: Tokens at `z-30`, tiles at `z-10` — tokens always render on top.

---

## HUD (Heads-Up Display) Architecture

All UI controls are `fixed` positioned overlays on top of the fullscreen board:

| Element | Position | Z-index |
|---------|----------|---------|
| Board + CameraWrapper | `absolute inset-0` | `z-0` |
| PlayerStatsPanel | `fixed right-4 top-20` | `z-40` |
| Action Buttons (Roll/Skip/Undo) | `fixed bottom-8 left-1/2` | `z-40` |
| AppHeader (Settings/Home) | `fixed top-0 right-0` | `z-50` |
| Dice/Mystery/Kick Overlays | `fixed inset-0` | `z-40` |
| SettingsPanel Drawer | `fixed right-0 top-0` | `z-50` |

---

## Token Positioning (Single Source of Truth)

Both `BoardGrid.tsx` and `AnimationService.ts` use shared functions from `Pathfinding.ts`:

```
getPlayerOffset(playerIndex, cellSizePct) → { offsetX, offsetY }

Final position (pixel-based):
  tokenPx = TILE_PX * 0.7
  tokenCenter = (TILE_PX - tokenPx) / 2
  left = x * TILE_PX + tokenCenter + pxOffsetX
  top  = y * TILE_PX + tokenCenter + pxOffsetY
```

---

## AudioService — Lazy Singleton Pattern

- **No eager loading**: Howl instances are created only on first `play()` call.
- **Error guard**: `onloaderror` marks failed sounds — never retried.
- **Mute sync**: `Howler.mute()` controlled by SettingsPanel toggle.

---

## Completed Architecture Changes

### ✅ Mystery Card Flip (Phase 3)
- `MysteryCardOverlay.tsx`: 3D card flip via `rotateY[-180→0]` + `scale[0.5→1.2→1]`.

### ✅ Local Storage Integration (Phase 5)
- Save/Load maps via `localStorage` key `draftboard_saved_map`.

### ✅ Cardboard Design System (Ticket 3.1a)
- CSS Tokens: `--card-radius: 2px`, `--card-shadow`, `.game-card`, `.game-tile`.

### ✅ i18n Dictionary System (Ticket 3.1b)
- `LocaleStrings` interface with 10+ domains. `t()` accessor. Vietnamese default.

### ✅ Settings Panel & State (Ticket 3.3a)
- Slide-in drawer. Language switcher, sound/animation/camera toggles.

### ✅ Kick Collision (Ticket 3.3b-d)
- `EVENT_KICK` phase, `resolveKick()`, KickOverlay animation.

### ✅ Audio Engine (Ticket 3.4)
- Howler.js lazy singleton. 5 SFX channels. Settings sync.

### ✅ HUD & Camera Hotfix (Ticket 3.5)
- Fullscreen pixel-based board (TILE_PX=64). Fixed HUD overlays. 2D pan camera.
- Memento Undo: 20-snapshot history stack in GameEngine.

### ✅ Audio Leak & UX Hotfix (Ticket 3.6)
- Lazy Howl init with `onloaderror` guard. Emoji avatars via `emoji-picker-react`.
- Dice scrambling via anime.js `update` callback.

### ✅ Forgotten Features & Menu Flow (Ticket 3.7)
- **Z-Index Fix**: Removed `overflow-hidden` from `BoardGrid` and `CameraWrapper` to prevent token clipping.
- **Mystery Card Rename**: All "Thẻ Bí Ẩn" / "BÍ ẨN" → "Mystery Card" / "MYSTERY" (kept English in Vietnamese locale).
- **Map Settings UI**: HomeMenu now includes pre-game settings: Dice Count (1-5), Mystery Range (±3/±6), Kick toggle.
- **Save/Load Flow**: Map auto-saved on "Lưu & Chơi". Game state saved to `draftboard_saved_game` on Home exit.
- **WelcomeMenu 4-button layout**: Create Map, Play Saved Map (conditional), Resume Game (conditional), Play Default.
- **GameEngine.loadState()**: Restores full GameState from localStorage for resume functionality.

---

## Epic 4 — "Cuộc Đua Đường Đời" (PLANNED)

> Full architecture: `docs/brainstorm/epic_4_architecture.md`

Key additions:
- **Event Deck**: 13 cards across 3 tiers (Green/Red/Purple) with Strategy Pattern registry.
- **Event Queue**: Async queue system replacing direct evaluateCell() mutations.
- **Player Buffs**: Shield, Reflect, Tribute, Dungeon, Frozen status effects.
- **Host Mode**: Duel card + Quiz tiles for classroom use.
- **Biome Decor**: Seeded random environment layer with emoji decorations.
- **Map Share**: LZ-String URL compression for serverless map sharing.
