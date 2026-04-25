# Features Reference — DraftBoard-Builder

> **Mục đích**: Tài liệu tham chiếu toàn diện về tất cả tính năng hiện có trong game.
> Cập nhật lần cuối: 2026-04-23
> **Source of truth**: `src/core/CardRegistry.ts`, `src/core/SettingsState.ts`, `src/core/GameState.ts`

---

## Table of Contents

1. [Skill Cards (14 cards)](#1-skill-cards)
   - [🟢 Green Tier — Buff (4 cards)](#-green-tier--buff)
   - [🔴 Red Tier — Nerf (4 cards)](#-red-tier--nerf)
   - [🟣 Purple Tier — Chaos (5+1 cards)](#-purple-tier--chaos)
2. [Player Status Effects (Buffs)](#2-player-status-effects-buffs)
3. [Tile Types (Map)](#3-tile-types-map)
4. [Map Builder Features](#4-map-builder-features)
5. [Save & Load System](#5-save--load-system)
6. [Game Rules & Settings](#6-game-rules--settings)
7. [HUD & UI Components](#7-hud--ui-components)

---

## 1. Skill Cards

Hệ thống thẻ sự kiện kích hoạt khi người chơi đáp vào ô MYSTERY.
- **Draw**: Thẻ được rút ngẫu nhiên từ pool dựa theo `rarityBias` (0–100, càng cao càng nhiều thẻ Tím/Kỹ năng).
- **Resolution**: Mỗi thẻ có hàm `resolve(ctx: CardContext)` trả về `CardResolution` để GameEngine thực thi.
- **Card Context** truyền vào: `activePlayer`, `allPlayers`, `deckConfig`, `diceValue`, `mapLength`.

---

### 🟢 Green Tier — Buff

> Các thẻ có lợi cho người rút.

#### `EUREKA` — 💡 Eureka! Sáng Kiến

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | GREEN |
| **Resolution type** | `MOVE` |
| **Target** | `activePlayer` |
| **Cơ chế** | Di chuyển người chơi **tiến lên** một số bước ngẫu nhiên trong khoảng `eurekaRange` (mặc định `[1, 6]`). |
| **Title** | *"Bộ óc bùng cháy! Tiến lên ngẫu nhiên từ 1 đến 6 bước!"* |
| **Config** | `enableEureka: bool`, `eurekaRange: [min, max]` |

---

#### `LIFEBUOY` — 🛟 Phao Cứu Sinh

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | GREEN |
| **Resolution type** | `BUFF` |
| **Target** | `activePlayer` |
| **Cơ chế** | Trao buff **LIFEBUOY** cho người chơi. Khi bị phạt lùi (MOVE âm, TELEPORT bởi thẻ địch), buff hấp thụ đòn rồi **vỡ**. Thời hạn: `lifebuoyTurns` lượt (mặc định 3). |
| **Title** | *"Miễn nhiễm 1 lần bị tấn công hoặc phạt lùi. Phao vỡ sau 1 lần kích hoạt!"* |
| **Buff ID** | `LIFEBUOY` |
| **Config** | `enableLifebuoy: bool`, `lifebuoyTurns: number` |

---

#### `COUNTER_ARGUMENT` — 💬 Phản Biện (Counter)

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | GREEN |
| **Resolution type** | `BUFF` |
| **Target** | `activePlayer` |
| **Cơ chế** | Trao buff **COUNTER_ARGUMENT**. Kẻ tấn công người này nhận lại **toàn bộ sát thương** (phản lại). Thời hạn: `counterTurns` lượt (mặc định 3). |
| **Title** | *"Bật thầy bật bạn! Kẻ tấn công nhận lại TOÀN BỘ sát thương trong 3 lượt."* |
| **Buff ID** | `COUNTER_ARGUMENT` |
| **Config** | `enableCounter: bool`, `counterTurns: number` |

---

#### `PARASITE` — 🐔 Ăn Trực (Khô Gà)

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | GREEN |
| **Resolution type** | `BUFF` |
| **Target** | `activePlayer` |
| **Cơ chế** | Trao buff **PARASITE** (1 lượt). Lượt kế tiếp, người chơi tiếp theo bị chia đôi số bước; phần bị cắt đó cộng cho người có buff. |
| **Title** | *"Lượt sau, người kế tiếp bị chia đôi số bước, phần đó cộng cho bạn."* |
| **Buff ID** | `PARASITE` |
| **Config** | `enableParasite: bool` |

---

### 🔴 Red Tier — Nerf 

> Các thẻ gây bất lợi — chủ yếu ảnh hưởng bản thân hoặc người khác.

#### `MIND_BLANK` — 📱 Cám Dỗ

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | RED |
| **Resolution type** | `MOVE` (âm) |
| **Target** | `activePlayer` |
| **Cơ chế** | Người chơi **lùi lại** một số bước ngẫu nhiên trong khoảng `mindBlankRange` (mặc định `[1, 6]`). Bước luôn là số âm (`-steps`). |
| **Title** | *"Tất cả là do cái điện thoại 😡! Lùi xuống ngẫu nhiên!"* |
| **Config** | `enableMindBlank: bool`, `mindBlankRange: [min, max]` |

---

#### `DEADLINE_BOMB` — 💣 Bom Deadline

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | RED |
| **Resolution type** | `TELEPORT` |
| **Target** | `activePlayer` + tất cả người chơi đang đứng **trước mặt** |
| **Cơ chế (MATCH_STEPS)** | Tất cả bị teleport về `activePlayer.position - abs(diceValue)`. Nếu không có ai đứng trước → chỉ active player bị lùi. |
| **Cơ chế (RESET_ZERO)** | Tất cả bị teleport về ô 0 (START). |
| **Title** | *"Kéo đứa đầu bảng chết chung! Cả hai lùi về cùng điểm thấp hơn!"* |
| **Config** | `enableDeadlineBomb: bool`, `deadlineBombMode: 'MATCH_STEPS' | 'RESET_ZERO'` |

---

#### `BLACKOUT` — 🔌 Cúp Điện (Blackout)

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | RED |
| **Resolution type** | `MOVE` (âm) |
| **Target** | **Tất cả người chơi khác** (active player an toàn) |
| **Cơ chế** | Mọi người trừ active player bị lùi `blackoutSteps` bước (mặc định 3). |
| **Title** | *"Bạn an toàn! Tất cả những đứa khác bị lùi 3 bước!"* |
| **Config** | `enableBlackout: bool`, `blackoutSteps: number` |

---

#### `DETENTION` — ⛓️ Cấm Túc (Detention)

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | RED |
| **Resolution type** | `DETENTION` |
| **Target** | `activePlayer` |
| **Cơ chế** | Người chơi bị giam, **không được đi** cho đến khi lắc ra đúng `detentionEscapeValue` (mặc định 6). Mỗi lượt của họ chuyển sang pha `EVENT_DETENTION_ROLL`. |
| **Title** | *"Bị giám thị bắt! Phải lắc ra đúng số 6 mới được thả."* |
| **Buff ID** | `DETENTION` |
| **Config** | `enableDetention: bool`, `detentionEscapeValue: number` |

---

### 🟣 Purple Tier — Chaos

> Các thẻ hỗn loạn — hiệu ứng mạnh, thường ảnh hưởng toàn bộ bàn chơi.

#### `POP_QUIZ` — 📝 Kiểm Tra Miệng

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | PURPLE |
| **Resolution type** | `QUIZ` |
| **Target** | `activePlayer` vs 1 người random |
| **Cơ chế** | Chọn ngẫu nhiên 1 đối thủ. Quản trò phán quyết ai thắng. Người thắng tiến `quizReward` bước, người thua lùi `quizPenalty` bước (mặc định cả hai = 3). Kích hoạt pha `EVENT_QUIZ` + `QuizState`. |
| **Title** | *"Solo 1v1 với một đứa random! Quản trò phân xử."* |
| **Default** | Tắt mặc định (`enablePopQuiz: false`), cần bật **hostMode**. |
| **Config** | `enablePopQuiz: bool`, `quizReward: number`, `quizPenalty: number` |

---

#### `SUPERVISOR_HAND` — 🖐️ Bàn Tay Giám Thị

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | PURPLE |
| **Resolution type** | `TELEPORT` |
| **Cơ chế (PULL_TOP_TO_ME)** | Người đứng đầu bảng bị kéo về **vị trí của active player**. |
| **Cơ chế (PULL_ALL_TO_LAST)** | **Tất cả** người chơi bị kéo về vị trí của người đứng **chót bảng**. (Mặc định) |
| **Title** | *"Bàn tay tàn nhẫn của giám thị, kéo người chơi về đúng vị trí!"* |
| **Config** | `enableSupervisorHand: bool`, `supervisorHandMode: 'PULL_TOP_TO_ME' | 'PULL_ALL_TO_LAST'` |

---

#### `NINJA_COPY` — 🥷 Ninja Copy

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | PURPLE |
| **Resolution type** | `TELEPORT` |
| **Target** | `activePlayer` |
| **Cơ chế (TOP1)** | Teleport người chơi đến vị trí `top1.position - 1` (ngay sau đứng đầu). |
| **Cơ chế (RANDOM)** | Teleport đến ngay sau một người chơi random. |
| **Title** | *"Copy bài đứa đứng đầu, bay lên ngay sau nó!"* |
| **Config** | `enableNinjaCopy: bool`, `ninjaCopyTarget: 'TOP1' | 'RANDOM'` |

---

#### `AMENOTEJIKARA` — 🌀 Isekai

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | PURPLE |
| **Resolution type** | `SWAP` |
| **Target** | `activePlayer` ↔ 1 người random |
| **Cơ chế** | **Tráo đổi hoàn toàn** vị trí giữa active player và một người chơi được chọn ngẫu nhiên. Kích hoạt animation `EVENT_SWAP_ANIMATION`. |
| **Title** | *"Bị hút vào cổng không gian! Tráo đổi hoàn toàn vị trí với một người chơi random!"* |
| **Config** | `enableAmenotejikara: bool` |

---

#### `ZA_WARUDO` — ⏱️ The World — Za Warudo!

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | PURPLE |
| **Resolution type** | `FREEZE` |
| **Cơ chế (FREEZE_ONE)** | 1 người random bị đóng băng, mất 1 lượt. (Mặc định) |
| **Cơ chế (FREEZE_ALL)** | **Tất cả** người chơi trừ active player bị đóng băng, mất 1 lượt. |
| **Title** | *"Đóng băng thời gian. Kẻ bị nhắm mục tiêu mất lượt!"* |
| **Buff ID** | `FROZEN` |
| **Config** | `enableZaWarudo: bool`, `zaWarudoMode: 'FREEZE_ALL' | 'FREEZE_ONE'` |

---

#### `MYSTERY` — ❓ Ôn Tủ

| Thuộc tính | Giá trị |
|-----------|--------|
| **Tier** | PURPLE |
| **Resolution type** | `MOVE` |
| **Target** | `activePlayer` |
| **Cơ chế** | Tiến hoặc lùi ngẫu nhiên trong khoảng `mysteryRange` (mặc định `[-6, 6]`). Thẻ "wildcard" cơ bản. |
| **Title** | *"Hộp bí ẩn. Hên xui lùi hoặc tiến!"* |
| **Config** | `enableMystery: bool`, `mysteryRange: [min, max]` |

---

## 2. Player Status Effects (Buffs)

Mỗi buff lưu trong `Player.buffs: Buff[]`. Xử lý đầu mỗi lượt.

| Buff ID | Nguồn gốc | Hết hạn khi | Cơ chế |
|---------|----------|------------|--------|
| `LIFEBUOY` | Thẻ LIFEBUOY | Hấp thụ 1 đòn hoặc hết `turnsRemaining` | Chặn 1 lần nhận sát thương (MOVE âm / TELEPORT địch). Kích hoạt pha `EVENT_LIFEBUOY_BREAK`. |
| `COUNTER_ARGUMENT` | Thẻ COUNTER_ARGUMENT | Hết `turnsRemaining` lượt | Kẻ tấn công nhận lại toàn bộ sát thương. Kích hoạt pha `EVENT_COUNTER`. |
| `PARASITE` | Thẻ PARASITE | Sau 1 lượt | Người chơi tiếp theo mất ½ số bước; phần đó cộng vào active player. |
| `DETENTION` | Thẻ DETENTION | Lắc ra đúng `detentionEscapeValue` | Mỗi lượt chuyển sang `EVENT_DETENTION_ROLL`. Thoát nếu dice = escape value. |
| `FROZEN` | Thẻ ZA_WARUDO | Tự hết sau 1 lượt | Người chơi bỏ lượt hoàn toàn (`EVENT_FROZEN_SKIP`). |

### Buff Processing Order (đầu mỗi lượt)

```
processBuffs()
  1. FROZEN?     → EVENT_FROZEN_SKIP → advanceTurn()
  2. DETENTION?  → EVENT_DETENTION_ROLL → UI hiện dice escape
  3. Tick xuống turnsRemaining của tất cả buff còn lại
  4. Xoá buff có turnsRemaining === 0
```

---

## 3. Tile Types (Map)

| TileType | Ký hiệu | Cơ chế |
|---------|---------|--------|
| `START` | Ô đầu tiên | Điểm xuất phát. `stepIndex = 0`. |
| `NORMAL` | Ô thường | Không có sự kiện đặc biệt. Có thể gắn `cardId` để biến thành ô thẻ cố định. |
| `MYSTERY` | Ô bí ẩn | Khi đáp vào → kích hoạt `EVENT_DRAW_CARD` → rút thẻ ngẫu nhiên từ deck. |
| `END` | Ô cuối | Khi đáp vào (hoặc vượt qua nếu `exactLanding=false`) → `VICTORY`. |

### Ô Gắn Thẻ Cố Định (`cardId`)

Ô `NORMAL` có thể được gắn `cardId` trong Map Builder. Khi người chơi đáp vào → thẻ đó luôn được kích hoạt (không rút ngẫu nhiên).

---

## 4. Map Builder Features

**File**: `src/core/MapBuilderState.ts` + `src/components/MapBuilder/MapBuilderUI.tsx`

### Công cụ vẽ (BuilderTool)

| Tool | Cơ chế |
|------|--------|
| `DRAW_PATH` | Click-drag trên grid → thêm các ô vào path (chỉ horizontal/vertical, không chéo). Ô đầu tự động là `START`, ô cuối là `END`. |
| `ERASE_PATH` | Click ô → xoá từ ô đó trở về sau. Ô trước nó tự chuyển thành `END`. |
| `PLACE_CARD` | Chọn loại thẻ từ palette → click ô `NORMAL` → gắn `cardId` vào ô đó. |
| `ERASE_CARD` | Click ô có thẻ → xoá `cardId` (giữ nguyên ô NORMAL). |
| `PAINT_ENV` | Chọn emoji → click vị trí tự do trên canvas → thêm `EnvItem` (trang trí nền). |

### Undo/Redo

- Lịch sử vô hạn lưu dưới dạng `MapState[]` stack trong `useMapBuilder()`.
- `undo()`: `historyIndex - 1`, `redo()`: `historyIndex + 1`.

### Random Fill

- `randomFill(cardId, count)`: Tự động gắn `count` ô NORMAL trống ngẫu nhiên với cùng một loại thẻ.

### Default Map (Zigzag)

- `generateZigzagMap()`: Tạo 28 ô hình zigzag trên grid 6×11 làm map mặc định.

---

## 5. Save & Load System

**File**: `src/services/SaveManager.ts`

### Cơ chế lưu Map

| Key localStorage | Nội dung |
|-----------------|---------|
| `draftboard_maps_v2` | `SavedMapSlot[]` — danh sách map đã lưu |

**Cấu trúc `SavedMapSlot`**:
```typescript
{
  id: string;           // UUID
  name: string;         // Tên map do người dùng đặt
  savedAt: number;      // timestamp
  path: Tile[];         // Mảng ô game (TileType, cardId, x, y, stepIndex)
  env: EnvItem[];       // Trang trí nền (emoji, tọa độ %)
  mapSettings?: MapSettings; // Cài đặt game kèm theo map
}
```

**Các method**:
- `getMaps()` → đọc + migrate dữ liệu cũ từ key `draftboard_saved_map`.
- `addMap(name, path, env, settings)` → thêm slot mới.
- `deleteMap(id)` → xoá theo UUID.
- `exportMapAsJSON(map)` → tải file `.json`.
- `importFromJSON(str)` → nhận diện map/game theo key.

### Cơ chế lưu Game

| Key localStorage | Nội dung |
|-----------------|---------|
| `draftboard_games_v2` | `SavedGameSlot[]` — danh sách ván đã lưu |

**Cấu trúc `SavedGameSlot`**:
```typescript
{
  id: string;
  name: string;
  savedAt: number;
  state: GameState;        // Full snapshot của GameState
  playerSummary: string;   // Ví dụ: "3 người chơi • Lượt 5"
}
```

**Các method**:
- `addGame(name, state)` → lưu snapshot GameState mới.
- `updateGame(id, state)` → cập nhật slot hiện tại (auto-save khi thoát).
- `deleteGame(id)`, `exportGameAsJSON(game)`.

### GameState snapshot (lưu nội dung gì)

```
GameState {
  phase, players (name/color/emoji/position/buffs),
  activePlayerIndex, winner, diceValue, diceRolls,
  map (Tile[]), envMap (EnvItem[]),
  mapSettings (DeckConfig, biome, diceCount, kickDistance...),
  kickEvent, canUndo,
  currentCard, currentResolution, quizState,
  eventQueue (GameEvent[])
}
```

### Trigger lưu tự động

| Hành động | Trigger |
|-----------|--------|
| Lưu Map Builder | Nút "Lưu & Chơi" trong `MapBuilderUI` → `SaveManager.addMap()` |
| Lưu Game khi thoát | Nút Home trong game → `SaveManager.addGame()` / `updateGame()` |
| Resume Game | WelcomeMenu → "Resume Game" → `SaveManager.getGames()` → `GameEngine.loadState()` |

---

## 6. Game Rules & Settings

### Map Settings (cấu hình trước ván chơi)

| Setting | Type | Default | Mô tả |
|---------|------|---------|-------|
| `diceCount` | 1–5 | 1 | Số lượng xúc xắc (tổng các mặt cộng lại) |
| `kickDistance` | 0–6 | 3 | Khoảng cách tối đa để kick collision. 0 = tắt kick. |
| `exactLanding` | bool | true | `true` = phải dừng đúng ô END mới thắng (bounce-back); `false` = vượt qua cũng thắng |
| `biome` | BiomeTheme | `'OFF'` | Chủ đề trang trí nền (`FOREST`, `ICE`, `DESERT`, `TEMPTATION`, `FORGE`, `SUMMIT`, `OFF`) |
| `deckConfig` | DeckConfig | DEFAULT_DECK | Toàn bộ cấu hình thẻ |

### Deck Config — Mặc định

| Card | Default bật? | Config chính |
|------|-------------|-------------|
| EUREKA | ✅ | `eurekaRange: [1,6]` |
| LIFEBUOY | ✅ | `lifebuoyTurns: 3` |
| COUNTER_ARGUMENT | ✅ | `counterTurns: 3` |
| PARASITE | ✅ | — |
| MIND_BLANK | ✅ | `mindBlankRange: [1,6]` |
| DEADLINE_BOMB | ✅ | `deadlineBombMode: 'MATCH_STEPS'` |
| BLACKOUT | ✅ | `blackoutSteps: 3` |
| DETENTION | ✅ | `detentionEscapeValue: 6` |
| POP_QUIZ | ❌ | `quizReward: 3`, `quizPenalty: 3` |
| SUPERVISOR_HAND | ✅ | `supervisorHandMode: 'PULL_ALL_TO_LAST'` |
| NINJA_COPY | ✅ | `ninjaCopyTarget: 'TOP1'` |
| AMENOTEJIKARA | ✅ | — |
| ZA_WARUDO | ✅ | `zaWarudoMode: 'FREEZE_ONE'` |
| MYSTERY | ✅ | `mysteryRange: [-6,6]` |
| `rarityBias` | — | 30 (0=chỉ green/red, 100=chỉ purple) |
| `hostMode` | ❌ | Bật POP_QUIZ + Quiz tiles |

### Kick Collision

- Khi người chơi đáp vào ô có người khác đang đứng và khoảng cách `|pos_A - pos_B| <= kickDistance` → người sau bị kick về vị trí trước đó.
- Kích hoạt pha `EVENT_KICK` + animation `KickOverlay`.

### Exact Landing (Bounce-back)

- `exactLanding = true`: Nếu dice value khiến token vượt quá ô END, token **nảy lại** ngược chiều.
  - Ví dụ: Còn 2 bước đến END nhưng dice = 5 → đi 2 đến END rồi lùi 3.
- `exactLanding = false`: Vượt qua ô END là thắng ngay.

---

## 7. HUD & UI Components

### Overlays kích hoạt theo pha

| GamePhase | Overlay/Component | Mô tả |
|-----------|-------------------|-------|
| `ROLLING_DICE` | `DiceOverlay` + `PhysicalDice` | Sky-drop animation + scramble dice |
| `EVENT_DRAW_CARD` | `MysteryCardOverlay` | 3D card flip, hiện thẻ được rút |
| `EVENT_CARD_RESOLVE` / `EVENT_CARD_ANIMATE` | Card-specific overlays | Animation hiệu ứng thẻ |
| `EVENT_KICK` | `KickOverlay` | Impact animation kick collision |
| `EVENT_LIFEBUOY_BREAK` | (lifebuoy break FX) | Phao vỡ animation |
| `EVENT_COUNTER` | (counter FX) | Phản lại animation |
| `EVENT_QUIZ` | (quiz overlay) | VS screen + host controls |
| `EVENT_DETENTION_ROLL` | (detention roll UI) | Dice escape UI |
| `EVENT_FREEZE` / `EVENT_FROZEN_SKIP` | (freeze FX) | Za Warudo effect |
| `VICTORY` | (victory screen) | Màn hình thắng |

### Fixed HUD Layout

| Element | Position | z-index |
|---------|----------|---------|
| Board + CameraWrapper | `absolute inset-0` | z-0 |
| EnvironmentLayer | `absolute inset-0` | z-5 (below tiles) |
| PlayerStatsPanel | `fixed right-4 top-20` | z-40 |
| Roll/Skip/Undo buttons | `fixed bottom-8 center` | z-40 |
| AppHeader (Settings/Home) | `fixed top-0 right-0` | z-50 |
| All Overlays | `fixed inset-0` | z-40 |
| SettingsPanel Drawer | `fixed right-0 top-0` | z-50 |

### Global Settings (SettingsPanel)

| Setting | Mô tả |
|---------|-------|
| `locale` | Ngôn ngữ: `vi` / `en` |
| `enableSoundEffects` | Bật/tắt SFX (Howler.js) |
| `enableVideoAudio` | Bật/tắt âm thanh video nền |
| `enableAnimations` | Bật/tắt animation anime.js |
| `cameraAutoTrack` | Camera tự động theo token khi di chuyển |
