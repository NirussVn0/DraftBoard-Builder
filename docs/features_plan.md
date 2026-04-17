# Feature Roadmap — DraftBoard-Builder

## Phase 1 — MVP Core ✅ COMPLETE

**Goal**: Fully playable local board game from menu to victory screen.

| Feature | Details | Status |
|---------|---------|--------|
| Welcome Screen | Mode selector: "Play Default Map" vs "Create Map Builder". Dark-themed entry point. | ✅ |
| Home Menu | Player count (2–4), name input, color picker per player. Light-themed setup screen. | ✅ |
| Board Grid | 36-cell outer perimeter ring on 10×10 grid. Absolute-positioned cells with corner radius on corner cells (1, 10, 19, 28). | ✅ |
| Dice System | Click-to-roll center dice, random 1–6, rapid number cycling animation (~700ms via setInterval 100ms), border/icon color synced to active player color. Uses lucide Dice1–Dice6 icons. | ✅ |
| Turn System | Visual active-player indicator (name + color dot). Auto-advances `activePlayerIndex` after animation completes. | ✅ |
| Token Movement | anime.js timeline — step-by-step cell traversal, bounce (translateY -20px) + scale (1.2×) per cell, 300ms per step | ✅ |
| Bounce-Back Logic | If dice roll overshoots END, token travels to END then reverses for remaining steps via `calculatePath()` | ✅ |
| Win Detection | Player must land exactly on or bounce-back-to END cell (position >= maxLevel) to trigger VICTORY | ✅ |
| Victory Screen | Overlay with winner name/color, Trophy icon (lucide), gradient text, "Play Again" restart button | ✅ |
| State Machine | `SETUP → IDLE_TURN → ROLLING_DICE → MOVING_TOKEN → EVALUATE_CELL → VICTORY` with `EVENT_MYSTERY_ROLL` sub-loop | ✅ |

---

## Phase 2 — Map Builder ✅ COMPLETE

**Goal**: Let users design custom board layouts with a visual path editor.

| Feature | Details | Status |
|---------|---------|--------|
| Dual Board Mode | Engine accepts `Tile[] \| null`. When `null` → legacy 36-cell ring. When `Tile[]` → custom map. | ✅ |
| Map Builder UI | Dark-themed editor with 15×15 grid, tool sidebar, arrow path preview. Uses dark bg-slate-900/800 palette. | ✅ |
| Draw Path Tool | Click START point, click endpoint (same row/col) → auto-fills orthogonal segment via `addNode()` | ✅ |
| Eraser Tool | Click any path tile → `eraseFrom(stepIndex)` trims path back to that point, promotes new tail to END | ✅ |
| Mystery Box Tool | Toggle any NORMAL tile to MYSTERY (purple + sparkle icon). Landing → random ±1–6 steps at 1.5× speed | ✅ |
| Undo / Redo | Snapshot-based history stack (`Tile[][]`). Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z keyboard shortcuts supported | ✅ |
| Save & Play Flow | Validates path length > 5 → forces final tile to END → transitions to HomeMenu with custom map via `pendingMap` state | ✅ |
| Custom Map Rendering | `BoardGrid` renders custom `Tile[]` on 15×15 CSS grid with START(emerald)/END(rose)/MYSTERY(purple)/NORMAL(slate) colors | ✅ |
| Token on Custom Map | `getTokenPosition()` branches on map presence: lookup `map[stepIndex].{x,y}` vs Pathfinding formula | ✅ |
| Mystery Tile Engine | `EVALUATE_CELL → EVENT_MYSTERY_ROLL → MOVING_TOKEN → EVALUATE_CELL` sub-loop with 0.5s pause via App.tsx useEffect | ✅ |
| Zigzag Default Map | `generateZigzagMap()` produces a 28-tile S-curve path (right→down→left→down→right) used for "Play Default Map" | ✅ |
| Direction Arrows | Yellow directional arrow icons (lucide ArrowRight/Down/Left/Up) rendered between consecutive path tiles in editor | ✅ |

---

## Phase 3 — Dice Engine Revamp & Turn UX 🔲 PLANNED

**Goal**: Replace the center-mounted dice with a dramatic, theatrical roll experience and add skip-turn capability.

| Feature | Details | Status |
|---------|---------|--------|
| Multi-Dice Support | Global setting: choose 1–5 dice per roll. Sum of all dice drives movement distance. | 🔲 |
| Dice Count Settings | Settings panel accessed via gear icon (`Settings` from lucide-react) in header. Dropdown or slider for dice quantity (1–5). | 🔲 |
| Bottom-Center Roll Button | Large "ĐỔ XÚC XẮC" CTA button fixed at bottom-center of game screen. Replaces the current center-mounted DiceUI. Active player color accent. | 🔲 |
| Overlay Dice Roll UX | Button press → full-screen `backdrop-blur` overlay (semi-dark) → 1–5 dice animate with anime.js rotation/shake for **1 second** → dice freeze and display individual results → show total sum → **0.5s pause** → overlay fades out → token auto-moves | 🔲 |
| Skip Turn Button | "BỎ LƯỢT" button positioned beside the Roll button (smaller, secondary style). Instantly advances `activePlayerIndex` to next player without rolling. | 🔲 |
| Remove Old DiceUI | Delete existing `DiceUI.tsx` component and its center-board placement. All dice logic moves to new overlay system. | 🔲 |

---

## Phase 4 — UI/UX Consistency, Navigation & Map Builder Fixes 🔲 PLANNED

**Goal**: Polish the application into a cohesive, professional product with consistent theming and navigation.

| Feature | Details | Status |
|---------|---------|--------|
| Light Theme Enforcement | Purge all `bg-slate-900 / bg-slate-800 / bg-slate-700 / text-white` dark classes from **all screens** (WelcomeMenu, MapBuilderUI, etc). Enforce consistent minimalist light palette (`bg-slate-50`, `bg-white`, light borders) throughout entire app. | 🔲 |
| Header Navigation Icons | Persistent `[Home]` and `[Settings]` icon buttons (lucide-react `Home`, `Settings`) at **top-right** of screen. Visible on all screens except WelcomeMenu. | 🔲 |
| Home Confirm Popup | Home button shows `window.confirm("Bạn có chắc muốn thoát? Dữ liệu chưa lưu sẽ bị mất")` before navigating back to MENU mode. | 🔲 |
| Map Builder Cell Size Fix | Fix CSS Grid cell sizing in MapBuilderUI — cells must not be too small. Ensure minimum visible size for comfortable clicking. | 🔲 |
| Ghost Cell Cleanup | Remove "background cells showing through" artifact. Ensure render logic: draw empty grid background first, then overlay path tiles without duplication. Path tiles should fully cover their grid position. | 🔲 |
| Step Index Display (Editor) | In Map Builder editor mode: render `stepIndex` number (or a sequential pattern/connecting line) inside all drawn tiles so user can see the walking direction from START to END. NORMAL tiles show their step number, not just empty slate. | 🔲 |

---

## Phase 5 — Local Storage Integration (Save/Load) 🔲 PLANNED

**Goal**: Persist user-created maps between browser sessions.

| Feature | Details | Status |
|---------|---------|--------|
| Save Map to localStorage | "LƯU MAP" button in MapBuilderUI serializes `Tile[]` → `JSON.stringify()` → `localStorage.setItem('draftboard_saved_map', ...)` | 🔲 |
| Load Saved Map | On WelcomeMenu mount, check `localStorage.getItem('draftboard_saved_map')`. If data exists → show additional "CHƠI MAP ĐÃ LƯU" button that loads the saved map as `pendingMap` and transitions to PLAYING. | 🔲 |
| Clear Saved Map | Option to delete saved map from storage (either explicit button or overwrite on next save). | 🔲 |

---

## Phase 6 — Polish & Extras (Stretch) 🔲 BACKLOG

| Feature | Details | Status |
|---------|---------|--------|
| Sound Effects | Dice roll, token hop, victory fanfare | 🔲 |
| Responsive Layout | Mobile-friendly board scaling | 🔲 |
| Map Export / Import | Base64-encode map → shareable URL parameter | 🔲 |
| Move History Log | Running log of all moves in current session | 🔲 |
| AI Opponent | Single-player mode vs simple heuristic bot | 🔲 |
