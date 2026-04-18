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
| Light Theme Enforcement | Purge all `bg-gray-900 / text-white` classes. Force consistent Light Tone (bg-slate-50, bg-white). | ✅ |
| Header Navigation | Add [Settings] and [Home] icons (lucide-react) at top-right. | ✅ |
| Home Confirm Popup | "Bạn có chắc muốn thoát? Dữ liệu chưa lưu sẽ bị mất" on Home click. | ✅ |

---

## Phase 3 — Dice Engine Revamp & Turn Logic 🔲 PLANNED

**Goal**: Dramatic dice roll overlay and skip turn capability.

| Feature | Details | Status |
|---------|---------|--------|
| Multi-Dice Support | Choose 1–5 dice in global settings. Sum drives movement. | 🔲 |
| Overlay Roll UX | Backdrop-blur overlay + 1s anime.js dice animation. | 🔲 |
| Bottom-Center Buttons | Large "ĐỔ XÚC XẮC" button at bottom center. | 🔲 |
| Skip Turn Button | "BỎ LƯỢT" button next to Roll button. | 🔲 |

---

## Phase 4 — Map Builder UX & Bug Fixes 🔲 PLANNED

**Goal**: Fix editor artifacts and improve usability.

| Feature | Details | Status |
|---------|---------|--------|
| Grid Size Fix | Prevent cells from being too small in Editor. | 🔲 |
| Ghost Cell Cleanup | Ensure background cells don't show through path tiles. | 🔲 |
| Step Index Display | Render step numbers or pattern inside path tiles in Editor. | 🔲 |

---

## Phase 5 — Local Storage Integration (Save/Load) 🔲 PLANNED

**Goal**: Persist maps between sessions.

| Feature | Details | Status |
|---------|---------|--------|
| Save Map | "LƯU MAP" button serializes `Tile[]` to localStorage. | 🔲 |
| Load Saved Map | "CHƠI MAP ĐÃ LƯU" button on Home Menu if data exists. | 🔲 |

---

## Phase 6 — Polish & Extras (Stretch) 🔲 BACKLOG

| Feature | Details | Status |
|---------|---------|--------|
| Sound Effects | Dice roll, token hop, victory fanfare. | 🔲 |
| Responsive Layout | Mobile-friendly board scaling. | 🔲 |
| Map Export / Import | Base64-encode map → shareable URL. | 🔲 |
