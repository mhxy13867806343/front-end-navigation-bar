# HooksVue AI Navigation Toolbox

[简体中文](./README.md) | English | [日本語](./README.jp.md)

A front-end AI tools navigation site built with Vue 3 + Vite, aggregating entries for AI chat assistants, AI painting, AI coding, AI development platforms and more, with built-in mini games and handy utilities.

## 🌐 Live Demo

👉 [https://mhxy13867806343.github.io/front-end-navigation-bar/](https://mhxy13867806343.github.io/front-end-navigation-bar/)

## ✨ Features

- **AI Tools Navigation**: Sidebar with categories + subcategories, covering dozens of categories such as AI chat, writing, painting, coding, and dev platforms
- **Live Data Sync**: Fetches remote data in real time and merges it with local static data, automatically falling back to local data on failure
- **Global Search**: Search across categories by name/description, with search history (up to 8 entries)
- **Browser Compatibility Notice**: Checks browser capabilities at the top of the app, with 5 official browser download links, QR codes, current time, author GitHub, yearly greetings, and tech stack details
- **Favorites**: Like/favorite tool cards, persisted locally, with a favorites history view
- **AI News & Apps**: Daily AI news timeline, paged IT Home API-tag news, AI app store, AI tutorials/encyclopedia article lists
- **Hotboards & Movie Data**: Supports Weibo, Bilibili hot search, Juejin, OSChina and more, plus box office and movie/TV ranking data
- **API Toolbox**: Built-in collection of commonly used APIs
- **Theme Switching**: One-click dark/light theme toggle with local persistence
- **Custom Layout**: Adjustable grid columns (persisted locally), collapsible sidebar
- **Context Menu**: Tool cards support "Open in new tab / Copy link"

## 🆕 Recent Updates

- Juejin hot rankings now use a build-time same-origin cache in production, avoiding direct cross-origin requests on GitHub Pages.
- Added a browser compatibility notice to the home page and standalone route views, with QR assets stored under `src/assets/qc/`.
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
