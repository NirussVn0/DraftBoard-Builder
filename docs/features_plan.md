# Feature Roadmap — DraftBoard-Builder

## Phase 1 — MVP Core (Current)

**Goal**: A fully playable local board game from menu to victory screen.

| Feature | Details | Status |
|---------|---------|--------|
| Home Menu | Player count selector (2–4), name input, color picker per player | 🔲 |
| Board Grid | - Bàn cờ là một mạch vòng (Outer Ring) chạy trên viền lưới 10x10.
- Tổng số ô chơi là 36 ô, đi từ điểm góc chạy theo chiều kim đồng hồ.
- Hệ thống Xúc Xắc và Điều khiển được đặt ngay khoảng không gian trống ở chính giữa lõi bàn cờ.
- Logic đi cờ theo kiến trúc State Machine trong `GameEngine` và Render Tọa độ tuyệt đối `BoardGrid`. | 🔲 |
| Dice System | Click-to-roll, random 1–6, rolling animation (rapid number cycling ~500ms) | 🔲 |
| Turn System | Visual current-player indicator, auto-advance after move completes | 🔲 |
| Token Movement | anime.js step-by-step traversal (cell-to-cell, not teleport) | 🔲 |
| Win Detection | First player to reach cell 100 triggers Victory overlay | 🔲 |
| Victory Screen | Full-screen overlay with winner name/color, play-again option | 🔲 |

### Acceptance Criteria (Phase 1)

- [ ] Clean directory structure following architecture.md
- [ ] Full game loop: Menu → Setup → Play → Victory → Restart
- [ ] Token animates through each intermediate cell (no teleportation)
- [ ] Coordinate calculation correct across zigzag row transitions
- [ ] Turn indicator clearly shows whose turn it is
- [ ] Dice shows rolling animation before landing on final value
- [ ] Strict TypeScript — zero `any`, zero type assertions

---

## Phase 2 — Map Builder

**Goal**: Let users design custom board layouts with interactive cell actions.

| Feature | Details | Status |
|---------|---------|--------|
| Map Editor UI | Drag-and-drop or click-to-assign grid editor | 🔲 |
| Cell Actions | Assign per-cell effects: advance N, retreat N, skip turn, bonus roll | 🔲 |
| Action Rendering | Visual indicators on cells with assigned actions (icons, colors) | 🔲 |
| Map Validation | Ensure map is solvable (no infinite loops, reachable goal) | 🔲 |
| Map Selection | Choose between default map and custom maps at game start | 🔲 |

---

## Phase 3 — Local Storage & Export

**Goal**: Persist game state and enable map sharing.

| Feature | Details | Status |
|---------|---------|--------|
| Save Game State | Serialize current game to LocalStorage, resume on reload | 🔲 |
| Auto-Save | Periodic save after each turn completion | 🔲 |
| Map Export | Encode custom map as Base64 string | 🔲 |
| Map Import | Decode Base64 URL parameter to load shared map | 🔲 |
| Share URL | Generate shareable link containing encoded map data | 🔲 |

---

## Phase 4 — Polish & Extras (Stretch)

| Feature | Details | Status |
|---------|---------|--------|
| Sound Effects | Dice roll, token hop, victory fanfare | 🔲 |
| Responsive Layout | Mobile-friendly board scaling | 🔲 |
| Theme System | Dark/Light mode, custom board color themes | 🔲 |
| Move History | Log of all moves in current game | 🔲 |
| Undo System | Revert last move (single undo) | 🔲 |
