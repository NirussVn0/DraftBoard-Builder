# Architecture — DraftBoard-Builder

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build Tool | Vite 8 |
| UI Framework | React 19 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Animation | animejs v3.2.2 |

## State Machine Architecture

```
┌─────────────────────────────────────────────────┐
│                  UI Components                  │
│   (Pure presentational, bound to GameState)     │
├─────────────────────────────────────────────────┤
│              Core State Machine                 │
│   (GameEngine.ts)                               │
│   Manages transition: IDLE_TURN ->              │
│   ROLLING_DICE -> MOVING_TOKEN                  │
├─────────────────────────────────────────────────┤
│              Animation Bridge                   │
│   (AnimationService.ts)                         │
│   Executes DOM scale/translate for tokens.      │
│   Invokes engine callbacks on completion.       │
└─────────────────────────────────────────────────┘
```

## Layer Responsibilities

### Layer 1 — Core Logic Engine
Pure TypeScript OOP Class `GameEngine`. Managed via singleton `gameEngine`.

| Phase | Responsibility |
|---------|---------------|
| `SETUP` | Home screen for setting up players. |
| `IDLE_TURN` | Awaiting current player to roll the dice. |
| `ROLLING_DICE` | Dice is generating number. UI shakes. |
| `MOVING_TOKEN` | Token is moving via AnimeJS across the board. |
| `VICTORY` | Player has reached the final cell. |

### Layer 2 — UI Components
React elements bound to single `useSyncExternalStore` or `subscribe` mechanism from the Engine.

| Component | Renders |
|-----------|---------|
| `App.tsx` | Root coordinator. Mounts UI depending on Phase. |
| `BoardGrid.tsx` | The 36-cell perimeter track layout container. |
| `DiceUI.tsx` | Encapsulates dice rolling visuals and triggers standard intervals. |

### Layer 3 — Core Utils & Services

| Service/Module | Responsibility |
|---------|---------------|
| `AnimationService.ts` | animejs bridging for Shake, Token movement paths. |
| `Pathfinding.ts` | Translates cell integers 1-36 into (x, y) coordinates on a 10x10 outer perimeter. |

## Data Flow

```
User clicks "Roll Dice"
  → GameEngine.rollDice()
  → Phase becomes ROLLING_DICE
  → DiceUI visual spin runs for 700ms
  → GameEngine.concludeDiceRoll() returns generated path array
  → Phase becomes MOVING_TOKEN
  → AnimationService applies XY transformations matching the path array
  → On Finish: GameEngine.finishTokenMove(finalPosition)
  → Phase logic computes Win or switches to next player / IDLE_TURN.
```

## Key Constraints
- Services MUST NOT define internal timings using `setTimeout` loosely, they must respond to concrete Phase shifts.
- The React layer defines the delays between Engine Phase shifts if it involves visual feedback (like Waiting to see the exact number before movement).
- The board coordinates are strictly a 36-cell Ring.
