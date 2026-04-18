# Feature Roadmap — DraftBoard-Builder

## Phase 1 — MVP Core ✅ COMPLETE

**Goal**: Fully playable local board game from menu to victory screen.

| Feature | Details | Status |
|---------|---------|--------|
| Welcome Screen | Mode selector: "Play Default Map" vs "Create Map Builder". | ✅ |
| Home Menu | Player count (2–4), name input, color picker per player. | ✅ |
| Board Grid | 36-cell outer perimeter ring on 10×10 grid. | ✅ |
| Dice System | Click-to-roll center dice, random 1–6. | ✅ |
| Turn System | Visual active-player indicator. | ✅ |
| Token Movement | anime.js timeline — step-by-step cell traversal. | ✅ |
| Bounce-Back Logic | Reverse direction if overshooting END. | ✅ |
| Win Detection | Must land exactly on or bounce-back-to END. | ✅ |
| Victory Screen | Overlay with winner name/color. | ✅ |

---

## Phase 2 — UI/UX Consistency & Layout ✅ COMPLETE

**Goal**: Clean, minimalist light theme and improved navigation.

| Feature | Details | Status |
|---------|---------|--------|
| Light Theme Enforcement | Purge all dark classes. Force consistent Light Tone. | ✅ |
| Header Navigation | [Settings] and [Home] icons at top-right. | ✅ |
| Home Confirm Popup | "Bạn có chắc muốn thoát?" on Home click. | ✅ |

---

## Ticket 2.6 Phase 1 — Board & Stats ✅ COMPLETE

**Goal**: Sharp board game aesthetic and player tracking.

| Feature | Details | Status |
|---------|---------|--------|
| Sharp Edges | Remove ALL rounded classes from tiles/grid. 100% rectangular. | ✅ |
| Pure Background | No checkerboard. White background, only render Tile[] elements. | ✅ |
| Token Containment | Tokens 70% of cell size, centered via `getTokenMetrics()`. Never overflow. | ✅ |
| Player Stats Panel | Right-side panel: "Card X / End" per player, active turn indicator. | ✅ |

---

## Ticket 2.6 Phase 2 — Sky-Drop Dice ✅ COMPLETE

**Goal**: Physics-based dice drop animation with overlay.

| Feature | Details | Status |
|---------|---------|--------|
| Bottom Roll Button | "ROLL DICE" button fixed at bottom-center during IDLE_TURN. | ✅ |
| Backdrop-Blur Overlay | Full-screen overlay appears during dice roll. | ✅ |
| Sky-Drop Animation | Dice drops from -800px with `easeOutBounce` + `2turn` rotation. | ✅ |
| Result Display | Final dice value shown for 1s, then overlay closes. | ✅ |

---

## Ticket 2.6 Phase 3 — Mystery Card Flip ✅ COMPLETE

**Goal**: 3D card flip animation for mystery tile events.

| Feature | Details | Status |
|---------|---------|--------|
| Rename to Mystery Card | Replace all "Mystery Box" references. | ✅ |
| 3D Card Flip | `rotateY[-180→0]` + `scale[0.5→1.2→1]` via anime.js. | ✅ |
| Overlay + Pause | Backdrop-blur, 1.5s display, then resolve at 1.5× speed. | ✅ |

---

## Ticket 2.6 Phase 4 — Builder UX ✅ COMPLETE

**Goal**: Explicit start/end markers in editor.

| Feature | Details | Status |
|---------|---------|--------|
| IN / OUT Labels | First tile shows "IN", last tile shows "OUT" in editor. | ✅ |
| Grid Sizing Fix | Prevent tiles from being too small. | ✅ |

---

## Phase 5 — Local Storage Integration (Save/Load) ✅ COMPLETE

**Goal**: Persist maps between sessions.

| Feature | Details | Status |
|---------|---------|--------|
| Save Map | "LƯU MAP" button in MapBuilder serializes `Tile[]` to localStorage (`draftboard_saved_map`). | ✅ |
| Load Saved Map | "CHƠI MAP ĐÃ LƯU" amber button on Welcome Menu if localStorage data exists. | ✅ |

---

## Epic 3 — Ticket 3.1: Design System & i18n ✅ COMPLETE

**Goal**: Cardboard game aesthetic and localized UI text.

| Feature | Details | Status |
|---------|---------|--------|
| Cardboard CSS Tokens | `--card-radius: 2px`, `--card-shadow`, `--card-inset`, `--tile-shadow` in `:root`. | ✅ |
| `.game-card` / `.game-tile` | Utility classes applied to all panels, buttons, overlays, and tiles. | ✅ |
| Purge Web-App Rounded | Removed `rounded-xl/2xl/3xl/[2rem]/[2.5rem]` from all 7 components. | ✅ |
| i18n Types | `LocaleStrings` interface with 10 domains, `LocaleKey` type. | ✅ |
| Vietnamese Dictionary | `vi.ts` with 45+ strings covering all UI text. | ✅ |
| `t()` Accessor | Module-level function returning active locale dictionary. | ✅ |
| Component Integration | All components use `t()` — zero hardcoded strings remaining. | ✅ |

---

## Epic 3 — Ticket 3.3a + 3.1c: Settings State & Panel ✅ COMPLETE

**Goal**: Persistent settings and functional Settings UI.

| Feature | Details | Status |
|---------|---------|--------|
| `GlobalSettings` Type | locale, enableSoundEffects, enableAnimations, cameraAutoTrack. | ✅ |
| `MapSettings` Type | diceCount, kickDistance, exactLanding (per-game session). | ✅ |
| localStorage Persistence | `loadGlobalSettings()` / `saveGlobalSettings()` helpers. | ✅ |
| Settings Panel Drawer | Slide-in from right with anime.js. Language switcher + toggle rows. | ✅ |
| Settings Button Wired | `handleSettings()` in App.tsx opens drawer (no longer a no-op). | ✅ |

---

## Epic 3 — Ticket 3.3b-d: Kick Collision 🔲 PENDING CEO APPROVAL

| Feature | Details | Status |
|---------|---------|--------|
| `EVENT_KICK` Phase | New GamePhase for collision events. | 🔲 |
| Collision Detection | `evaluateCell()` checks if another player occupies same tile. | 🔲 |
| `resolveKick()` | Kicks player back by `kickDistance`, chains to mystery check. | 🔲 |
| KickOverlay | Impact animation + text banner. | 🔲 |

---

## Epic 3 — Ticket 3.2: Camera Engine & Dice UX 🔲 PENDING CEO APPROVAL

| Feature | Details | Status |
|---------|---------|--------|
| CameraService | Parabolic tracking: zoom-out → pan → zoom-in via anime.js timeline. | 🔲 |
| CameraWrapper | Viewport container with CSS transform for scale/translate. | 🔲 |
| Skip Turn | `skipTurn()` method + secondary button in UI. | 🔲 |
| Dice Separation | PhysicalDice (animation) + DiceResultBanner (number) as separate entities. | 🔲 |

---

## Phase 6 — Polish & Extras (Stretch) 🔲 BACKLOG

| Feature | Details | Status |
|---------|---------|--------|
| Sound Effects | Dice roll, token hop, victory fanfare. | 🔲 |
| Responsive Layout | Mobile-friendly board scaling. | 🔲 |
| Map Export / Import | Base64-encode map → shareable URL. | 🔲 |

