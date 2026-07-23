# HooksVue AI Navigation Toolbox

[简体中文](./README.md) | English | [日本語](./README.jp.md)

A front-end AI tools navigation site built with Vue 3 + Vite, aggregating entries for AI chat assistants, AI painting, AI coding, AI development platforms and more, with built-in mini games and handy utilities.

## 📌 Maintenance Status

This project is no longer actively updated. The current live demo and existing features are kept as-is, with no planned new features, API sync work, or maintenance for third-party data-source availability.

## 🌐 Live Demo

👉 [https://mhxy13867806343.github.io/front-end-navigation-bar/](https://mhxy13867806343.github.io/front-end-navigation-bar/)

- Bilibili Trending: [https://mhxy13867806343.github.io/front-end-navigation-bar/bilibili-trending](https://mhxy13867806343.github.io/front-end-navigation-bar/bilibili-trending)
- Bilibili Live: [https://mhxy13867806343.github.io/front-end-navigation-bar/bilibili-live](https://mhxy13867806343.github.io/front-end-navigation-bar/bilibili-live)

## ✨ Features

- **AI Tools Navigation**: Sidebar with categories + subcategories, covering dozens of categories such as AI chat, writing, painting, coding, and dev platforms
- **Live Data Sync**: Fetches remote data in real time and merges it with local static data, automatically falling back to local data on failure
- **Global Search**: Search across categories by name/description, with search history (up to 8 entries)
- **Browser Compatibility Notice**: Checks browser capabilities at the top of the app and opens an Element Plus Dialog with 5 official browser download links, QR codes, current time, author GitHub, yearly greetings, and package-version links read from `package.json`
- **Favorites**: Like/favorite tool cards, persisted locally, with a favorites history view
- **Control Center Resources**: The right-side menu lists cloud-drive resources, AI development tool websites, and tool descriptions, opening links in new tabs
- **AI News & Apps**: Daily AI news timeline, paged IT Home API-tag news, AI app store, AI tutorials/encyclopedia article lists
- **Hotboards & Movie Data**: Supports Weibo, Bilibili hot search, Juejin, OSChina and more, plus box office and movie/TV ranking data
- **API Toolbox**: Built-in collection of commonly used APIs
- **Theme Switching**: One-click dark/light theme toggle with local persistence
- **Custom Layout**: Adjustable grid columns (persisted locally), collapsible sidebar
- **Context Menu**: Tool cards support "Open in new tab / Copy link"

## 🆕 Recent Updates

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
