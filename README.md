# DraftBoard Builder

<div align="center">

![DraftBoard Builder](https://img.shields.io/badge/DraftBoard-Builder-v0.2--beta-6366f1?style=for-the-badge&logo=react&logoColor=white)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

</div>

---

> 🎯 **Build your own adventures.** DraftBoard Builder is a dynamic, customizable mini board game engine and map builder, allowing you to design tracks, set rules, and play right in the browser.

---

## ✨ What It Does

DraftBoard is organized around a dual experience: **Building** and **Playing**.

```
DESIGN MAP  →  SET RULES  →  PLAY GAME  →  SHARE
```

| Zone | Features |
|---|---|
| 🗺️ **Map Builder** | Draw paths, place special tiles, configure "Exact Landing" rules, full Undo/Redo state management. |
| 🎲 **Play Mode** | Roll dice, move tokens with Anime.js smooth animations, trigger tile events (Duel, Dungeon, etc.). |
| 🛠️ **System** | Built strictly on Clean Code, SOLID, and OOP principles for robust, scalable architecture. |

---

## 🛠️ Tech Stack

### Frontend Showcase
- ![React](https://img.shields.io/badge/React-18-000?style=flat&logo=react) **Core UI** — React components, Tailwind CSS styling
- ![TypeScript](https://img.shields.io/badge/TypeScript-Strict-000?style=flat&logo=typescript) **Language** — Strict TypeScript for absolute type safety
- ![Anime.js](https://img.shields.io/badge/Anime.js-Animations-FF4B4B?style=flat) **Animations** — Robust token movement and dice rolling animations
- ![Zustand](https://img.shields.io/badge/Zustand-State-764ABC?style=flat) **State Management** — Global state for Map Builder Undo/Redo and Game Engine

### Tooling & Environment
- **Vite** — Lightning fast build tool and dev server
- **ESLint & Prettier** — Strict code formatting and linting rules

---

## 🏗️ Architecture

```mermaid
graph TD
    subgraph Frontend["🎨 DraftBoard Application"]
        subgraph Core
            UI["User Interface\nReact Components"]
            ENGINE["Game Engine\nOOP & SOLID"]
        end
        subgraph Systems
            BUILDER["Map Builder\nUndo/Redo State"]
            ANIMATION["Animation Engine\nAnime.js"]
            AUDIO["Audio Engine\nSound effects"]
        end
    end

    UI --> BUILDER
    UI --> ENGINE
    BUILDER --> ENGINE
    ENGINE --> ANIMATION
    ENGINE --> AUDIO

    style UI fill:#1a1a2e,stroke:#61DAFB,color:#fff
    style ENGINE fill:#1a1a2e,stroke:#6366f1,color:#fff
    style BUILDER fill:#1a1a2e,stroke:#f59e0b,color:#fff
    style ANIMATION fill:#1a1a2e,stroke:#FF4B4B,color:#fff
    style AUDIO fill:#1a1a2e,stroke:#22c55e,color:#fff
```

---

## 📖 Documentation

All architecture docs, feature plans, and agent protocols live in [`docs/`](docs/).

**→ Start with [`docs/architecture.md`](docs/architecture.md)**

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** or **pnpm** or **yarn**

### Installation

```bash
# Clone the repo
git clone https://github.com/your-org/draftboard-builder.git
cd draftboard-builder

# Install all dependencies
npm install

# Start in dev mode
npm run dev
```

Open `http://localhost:5173` to see the app.

### Useful Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 📄 License

See [LICENSE](LICENSE) for details.

---

<div align="center">

Built by NirussVn0. ✦ 2026

</div>
