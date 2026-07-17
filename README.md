# HooksVue AI 导航工具箱

简体中文 | [English](./README.en.md) | [日本語](./README.jp.md)

一个基于 Vue 3 + Vite 构建的前端 AI 工具导航站，聚合 AI 聊天助手、AI 绘画、AI 编程、AI 开发平台等各类工具入口，并内置多款小游戏与实用小工具。

## 📌 维护状态

本项目已停止持续更新，仅保留当前线上预览与现有功能。后续不再计划新增功能、同步接口变更或维护第三方数据源可用性。

## 🌐 在线预览

👉 [https://mhxy13867806343.github.io/front-end-navigation-bar/](https://mhxy13867806343.github.io/front-end-navigation-bar/)

## ✨ 功能特性

- **AI 工具导航**：侧边栏分类 + 子分类导航，覆盖 AI 聊天、写作、绘画、编程、开发平台等数十个分类
- **实时数据同步**：支持从远端数据源实时抓取并与本地静态数据合并，失败时自动回退本地数据
- **全局搜索**：支持按名称/描述跨分类搜索，带搜索历史记录（最多保留 8 条）
- **浏览器兼容提示**：入口顶部检测浏览器能力，通过 Element Plus Dialog 提供 5 个浏览器官网下载入口、二维码、当前时间、作者 GitHub、年度祝福与从 `package.json` 读取的软件版本链接
- **收藏点赞**：工具卡片点赞收藏，收藏记录本地持久化，可查看收藏历史
- **控制中心资源**：右侧菜单集中展示网盘资料、AI 开发工具官网与简介，支持新页面打开
- **AI 资讯与应用**：每日 AI 资讯时间线、IT之家 API 标签分页资讯、AI 应用集、AI 教程/百科文章列表
- **实时热榜与影视数据**：支持微博、B 站热搜、掘金、OSChina 等热榜，以及院线票房、影视收视/评分榜
- **API 工具箱**：内置常用 API 接口集合
- **组件示例**：基于 Element Plus 的组件在线演示，按基础 / 中级 / 高级三个 Tab 分级，含表单校验、搜索分页计算表格、穿梭框、Tour 引导、水印等高级用法
- **主题切换**：明暗主题一键切换，偏好本地记忆
- **自定义布局**：网格列数可调（本地记忆），侧边栏可折叠
- **右键菜单**：工具卡片支持"新标签页打开 / 复制链接"

## 🆕 近期更新

- 掘金热榜在生产环境改为构建时生成同源缓存，GitHub Pages 上不再直接跨域请求掘金接口。
- 首页与独立路由顶部新增浏览器兼容检测条，详情使用 Element Plus Dialog 展示，二维码资源统一放在 `src/assets/qc/`。
- 控制中心新增文档数据网盘入口、Codex / TRAE / Devin / Antigravity 官网入口和动态年份祝福。
- 新增 `/api-uapis`、`/api-aa1`、`/api-ithome` 本地代理，统一绕开浏览器 CORS 限制。
- 今日热榜的哔哩哔哩来源改为优先调用 aa1 B 站热搜接口，失败时回退原热榜源。
- 每日 AI 资讯保留 `ai-bot.cn/daily-ai-news`，并新增 IT之家 `NewsTag=API` 分页入口，支持上一页 / 下一页。
- 影视收视评分榜兼容 uapis 新的 `groups` 返回结构，接口不可用时显示真实错误，不再展示误导性假数据。

## 🎮 内置小游戏

推箱子、贪吃蛇、俄罗斯方块、2048、扫雷、井字棋、打砖块、坦克大战、Flappy Bird、太空射击、接水果等。

## 🧰 其他内置组件

- 音乐播放器（含迷你播放器）
- 图片编辑器（基于 cropperjs / vue-advanced-cropper）
- 模拟时钟
- 动态表单

## 🛠️ 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3（`<script setup>` SFC） |
| 构建 | Vite 8 |
| UI | Element Plus |
| 路由 | Vue Router 4 |
| 其他 | axios、vuedraggable、cropperjs |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## ✅ 测试与校验

```bash
# 校验 MCP 导航数据
npm run validate:mcp

# 运行测试
npm run test:mcp
npm run test:navigation
npm run test:games
```

## 📁 目录结构

```
├── src/
│   ├── App.vue              # 主界面（导航、搜索、主题等）
│   ├── components/          # 组件
│   │   ├── games/           # 小游戏组件
│   │   ├── image/           # 图片编辑器
│   │   ├── showcase/        # Element Plus 组件示例（基础/中级/高级）
│   │   ├── ApiToolbox.vue   # API 工具箱
│   │   ├── AiNewsTimeline.vue  # AI 资讯时间线
│   │   └── ...
│   ├── utlis/               # 工具数据与 JSON 数据源
│   ├── router/              # 路由
│   └── style/               # 全局样式
├── scripts/                 # 校验与测试脚本
└── vite.config.ts
```

## 📄 License

MIT
