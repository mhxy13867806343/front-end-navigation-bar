# HooksVue AI Navigation Toolbox

[简体中文](./README.md) | English | [日本語](./README.jp.md)

A front-end AI tools navigation site built with Vue 3 + Vite, aggregating entries for AI chat assistants, AI painting, AI coding, AI development platforms and more, with built-in mini games and handy utilities.

## 📌 Maintenance Status

This project is no longer actively updated. The current live demo and existing features are kept as-is, with no planned new features, API sync work, or maintenance for third-party data-source availability.

## 🌐 Live Demo

- 🌾 **Oat UI Studio Demo**: [https://mhxy13867806343.github.io/front-end-navigation-bar/oat-studio](https://mhxy13867806343.github.io/front-end-navigation-bar/oat-studio)
- 🏠 **Home**: [https://mhxy13867806343.github.io/front-end-navigation-bar/](https://mhxy13867806343.github.io/front-end-navigation-bar/)
- 🧡 **Xiaomi Official Shop**: [https://mhxy13867806343.github.io/front-end-navigation-bar/xiaomi-shop](https://mhxy13867806343.github.io/front-end-navigation-bar/xiaomi-shop)
- 🛒 **Xiaomi Shopping Cart**: [https://mhxy13867806343.github.io/front-end-navigation-bar/xiaomi-shop/cart](https://mhxy13867806343.github.io/front-end-navigation-bar/xiaomi-shop/cart)
- 🔐 **Permission Control Center**: [https://mhxy13867806343.github.io/front-end-navigation-bar/permission](https://mhxy13867806343.github.io/front-end-navigation-bar/permission)
- 📜 **Security Audit Logs**: [https://mhxy13867806343.github.io/front-end-navigation-bar/logs](https://mhxy13867806343.github.io/front-end-navigation-bar/logs)
- 🚫 **500 / 404 / 401 Error Pages**: [https://mhxy13867806343.github.io/front-end-navigation-bar/500](https://mhxy13867806343.github.io/front-end-navigation-bar/500)
- 🌦️ **Weather Forecast**: [https://mhxy13867806343.github.io/front-end-navigation-bar/weather](https://mhxy13867806343.github.io/front-end-navigation-bar/weather)

## ✨ Features

- **🌾 Oat UI Studio (`/oat-studio`)**: Integrates [Oat.ink 26 official WebComponents / CSS components](https://oat.ink/components/) (Dropdown, TagInput, Upload, Tabs WC) with Element Plus 64-item Component Sidebar directory. Features Oat Dialog / Modal design inspired by **Element Plus Dialog** layout and **Naive UI OS-Theme Dialog** backdrop filter backdrop. Includes 400 examples dataset with double-click inline cell editing.
- **API Toolbox**: Built-in collection of commonly used APIs
- **Theme Switching**: One-click dark/light theme toggle with local persistence
- **Custom Layout**: Adjustable grid columns (persisted locally), collapsible sidebar
- **Context Menu**: Tool cards support "Open in new tab / Copy link"

## 🆕 Recent Updates

- 🌾 **Added Oat UI Studio (`/oat-studio`)**: Integrates Oat.ink 26 official WebComponent library (Dropdown, TagInput, Upload, Tabs) and Element Plus 64-item sidebar directory, Element Plus & Naive UI OS-Theme Dialog reference banner, 400 examples dataset with double-click inline editing, Cascader, Checkbox, Transfer, Slider, and custom interactive UI cards.

- Added the `/bilibili-live` page with on-demand live data loading, dynamic Bilibili live areas, sub-area filters, and recommend / popular / latest tabs.
- Fixed LOLM China server data in local and online environments: local development uses the Vite proxy, production uses a read-only wrapped JSON request, and the toolbox table now scrolls through the full returned hero list.
- Improved `/bilibili-trending` so the refresh countdown only targets the search hot-list while other Bilibili ranking sections keep their own loading and error states.
- Juejin hot rankings now use a build-time same-origin cache in production, avoiding direct cross-origin requests on GitHub Pages.
- Added a browser compatibility bar to the home page and standalone route views, with details shown in an Element Plus Dialog and QR assets stored under `src/assets/qc/`.
- Added cloud-drive document links, Codex / TRAE / Devin / Antigravity entries, and a dynamic-year blessing to the control center.
- Added `/api-uapis`, `/api-aa1`, and `/api-ithome` local proxies to avoid browser CORS issues.
- Bilibili hot search now prefers the aa1 Bilibili endpoint and falls back to the existing hotboard source if needed.
- The daily AI news source from `ai-bot.cn/daily-ai-news` is preserved, with an additional paged IT Home `NewsTag=API` source.
- Movie/TV rankings now support the newer uapis `groups` response shape and display real API errors instead of misleading mock data.

## 🎮 Built-in Mini Games

Sokoban, Snake, Tetris, 2048, Minesweeper, Tic-Tac-Toe, Brick Breaker, Battle City, Flappy Bird, Space Shooter, Fruit Catcher, and more.

## 🧰 Other Built-in Components

- Music player (with mini player)
- Image editor (based on cropperjs / vue-advanced-cropper)
- Analog clock
- Dynamic form

## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Vue 3 (`<script setup>` SFC) |
| Build | Vite 8 |
| UI | Element Plus |
| Router | Vue Router 4 |
| Others | axios, vuedraggable, cropperjs |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview the build
npm run preview
```

## ✅ Tests & Validation

```bash
# Validate MCP navigation data
npm run validate:mcp

# Run tests
npm run test:mcp
npm run test:navigation
npm run test:games
```

## 📁 Project Structure

```
├── src/
│   ├── App.vue              # Main UI (navigation, search, theme, etc.)
│   ├── components/          # Components
│   │   ├── games/           # Mini game components
│   │   ├── image/           # Image editor
│   │   ├── ApiToolbox.vue   # API toolbox
│   │   ├── AiNewsTimeline.vue  # AI news timeline
│   │   └── ...
│   ├── utlis/               # Tool data and JSON data sources
│   ├── router/              # Router
│   └── style/               # Global styles
├── scripts/                 # Validation and test scripts
└── vite.config.ts
```

## 📄 License

MIT
