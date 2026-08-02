# HooksVue AI Navigation Toolbox

[简体中文](./README.md) | English | [日本語](./README.jp.md)

A front-end AI tools navigation site built with Vue 3 + Vite, aggregating entries for AI chat assistants, AI painting, AI coding, AI development platforms and more, with built-in mini games and handy utilities.

## 📌 Maintenance Status

> **📢 【Project Archive & Notice】**
> All planned features, UI Showcases (WebComponents, Oat UI, 1.0M Auth UI, 100 Shopping Carts, 63k Animations, Motion for Vue, Schedule-X Calendar, Three.js 3D Map, Docker Dual Deployment, Source Code Inspector) are **fully implemented**.
> Development is now paused. Feel free to **Fork** this repository for custom modifications, or open an Issue / Discussion!
> The production homepage now opens an archive notice dialog every time, with a live clock, clickable mail contact, ALAPI jokes, upward jQuery scrolling, and copy actions inspired by Naive UI Dialog.

## 🌐 Live Demo

- 🐳 **Docker CLI & GUI Deployment**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/docker-showcase](https://mhxy13867806343.github.io/front-end-navigation-bar/#/docker-showcase)
- 💻 **Source Code Inspector & Copy Center**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/source-code](https://mhxy13867806343.github.io/front-end-navigation-bar/#/source-code)
- 📅 **Schedule-X Drag & Drop Calendar**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/schedule-x](https://mhxy13867806343.github.io/front-end-navigation-bar/#/schedule-x)
- ⚡ **Motion for Vue 50+ Showcase**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/motion-showcase](https://mhxy13867806343.github.io/front-end-navigation-bar/#/motion-showcase)
- 🗺️ **Three.js 3D Map Designer**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/three-showcase/china-map](https://mhxy13867806343.github.io/front-end-navigation-bar/#/three-showcase/china-map)
- 🌾 **Oat UI Studio Demo**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/oat-studio](https://mhxy13867806343.github.io/front-end-navigation-bar/#/oat-studio)
- 📘 **Juejin Course Booklets**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/juejin-course](https://mhxy13867806343.github.io/front-end-navigation-bar/#/juejin-course)
- 🧭 **Internal News Hubs**: [AI Resources](https://mhxy13867806343.github.io/front-end-navigation-bar/#/ai-xxx/ai-column) / [Jandan](https://mhxy13867806343.github.io/front-end-navigation-bar/#/jandan) / [TopHub](https://mhxy13867806343.github.io/front-end-navigation-bar/#/tophub) / [ITHome](https://mhxy13867806343.github.io/front-end-navigation-bar/#/ithome) / [Huxiu](https://mhxy13867806343.github.io/front-end-navigation-bar/#/huxiu) / [GitHub Open Source Hub](https://mhxy13867806343.github.io/front-end-navigation-bar/#/github) / [Records Cache](https://mhxy13867806343.github.io/front-end-navigation-bar/#/records-cache) / [Share Records](https://mhxy13867806343.github.io/front-end-navigation-bar/#/share-records)
- 🏠 **Home**: [https://mhxy13867806343.github.io/front-end-navigation-bar/](https://mhxy13867806343.github.io/front-end-navigation-bar/)

## ✨ Features

- **🔐 1,000,000 Auth UI Showcase (`/auth-showcase`)**: Features 1,000,000 interactive Auth UI designs (500k Login + 500k Register) across 50 categories with 10-item-per-page pagination and ID jumping.
- **🛒 100 Cart UI Showcase (`/cart-showcase`)**: 100 distinct shopping cart UI themes across 10 container layouts (Glassmorphism, 3D Neumorphism, Cyberpunk Neon, B2B Grid, Mobile H5 Sheet, macOS Window).
- **✨ 63,353 Animation Effects Showcase (`/animation-showcase`)**: 63,353 unique CSS/JS animation effect demos across 20 categories with live keyframe animation preview, speed controls, and code snippet copying.
- **🌾 Oat UI Studio (`/oat-studio`)**: Integrates [Oat.ink 26 official WebComponents / CSS components](https://oat.ink/components/) (Dropdown, TagInput, Upload, Tabs WC) with Element Plus 64-item Component Sidebar directory. Features Oat Dialog / Modal design inspired by **Element Plus Dialog** layout and **Naive UI OS-Theme Dialog** backdrop filter backdrop. Includes 400 examples dataset with double-click inline cell editing.
- **📘 Juejin Course Booklets (`/juejin-course`)**: Syncs Juejin booklet courses with category filters, latest / hot / price sorting, VIP-only filtering, keyword search, author profile links, detail-page links, activity discount prices, countdowns, and booklet-level VIP badges.
- **🧭 Internal News Hubs**: Adds `/ai-xxx/:section`, `/jandan`, `/tophub`, `/ithome`, `/huxiu`, and `/github` for AI resources, Jandan, TopHub, ITHome, Huxiu 24h, GitCN/Githot/HelloGitHub. Loading states are visible, controls are disabled while data is pending, pagination is guarded, and HelloGitHub images use a local proxy with fallback cards.
- **⚡ Cnblogs Flash (`/flash`)**: Now requests real Cnblogs status data, prefers an OpenAPI token, falls back to the legacy flash endpoint, and shows an authorization state instead of mock data when the source requires login.
- **♡ Records Cache Page** (`/records-cache`): Shows only favorited pages, favorited list items, and favorited record cards as cloud tags and two-column cards with transit links; unfavoriting asks for confirmation first.
- **↗ Share Records Page** (`/share-records`): Page-level and item-level sharing now use `social-share.js` through the shared `useShareRecords` hook, with cloud tags, two-column share cards, copy links, and transit links; `/records-cache` no longer shows a page favorite entry.
- **API Toolbox**: Built-in collection of commonly used APIs
- **Theme Switching**: One-click dark/light theme toggle with local persistence
- **Custom Layout**: Adjustable grid columns (persisted locally), collapsible sidebar
- **Context Menu**: Tool cards support "Open in new tab / Copy link"

## 🆕 Recent Updates

- 🛑 **Production homepage archive dialog**: Production builds and `npm run preview` open the archive dialog on every homepage visit, showing live time, a clickable email contact, ALAPI jokes, jQuery `animate(scrollTop)` upward scrolling, and copy actions.
- 🧭 **Added internal news hub pages**: `/ai-xxx/:section`, `/jandan`, `/tophub`, `/ithome`, `/huxiu`, and `/github` are now route-backed internal pages with explicit loading states and disabled refresh/category/pagination controls while requests are pending.
- ⚡ **Cnblogs Flash now uses real data**: `/flash` prefers a Cnblogs OpenAPI token and falls back to the legacy flash endpoint; login or authorization failures render a real-source status panel instead of mock feeds.
- ♡ **Added item-level favorites**: New hub list cards, AI news/apps/tutorial lists, Juejin topic cards, and HelloWorld lists now include heart controls that feed into `/records-cache`; unfavorited items stay out of the records page, and removal uses a confirmation dialog.
- ↗ **Added shared sharing records**: `/share-records` collects page and list-item share clicks, list pages reuse `ShareButton` and `useShareRecords`, and repeated line-clamp styles are centralized in `src/style/mixins.scss`.
- 🧷 **Improved pagination and images**: Huxiu pagination now keeps the current page visible, ITHome/Jandan/TopHub/GitHub hub controls are locked during loading, HelloGitHub images use a same-dev-server proxy with fallback cards, and the issue catalog can expand older issues 1-95.
- 📘 **Added Juejin Course Booklets (`/juejin-course`)**: Shows live Juejin course data with category filters, price sorting, VIP filtering, discount countdowns, activity discount prices, author profile links, and course-detail navigation.
- 🧩 **Grouped the top Web Components & Libraries menu**: New pages, Component & UI, Animation & Scheduling, Maps & Charts, Engineering Tools, and Documentation are now separated into a two-column grouped panel.
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

`npm run preview` serves the production build, so the homepage archive dialog follows the same production-only rule.

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

This project is open-sourced under the [MIT License](./LICENSE). Feel free to fork, study, or modify!
