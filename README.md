# HooksVue AI 导航工具箱

简体中文 | [English](./README.en.md) | [日本語](./README.jp.md)

一个基于 Vue 3 + Vite 构建的前端 AI 工具导航站，聚合 AI 聊天助手、AI 绘画、AI 编程、AI 开发平台等各类工具入口，并内置多款小游戏与实用小工具。

## 📌 维护状态

本项目持续积极维护更新中，已重构支持 SCSS 样式架构、工具函数/Hooks 抽离、可视化天气与 API 接口数据看板。

## 🌐 在线预览

- 🏠 **主页入口**：[https://mhxy13867806343.github.io/front-end-navigation-bar/](https://mhxy13867806343.github.io/front-end-navigation-bar/)
- 🧡 **小米官方商城**：[https://mhxy13867806343.github.io/front-end-navigation-bar/xiaomi-shop](https://mhxy13867806343.github.io/front-end-navigation-bar/xiaomi-shop)
- 🛒 **小米商城购物车**：[https://mhxy13867806343.github.io/front-end-navigation-bar/xiaomi-shop/cart](https://mhxy13867806343.github.io/front-end-navigation-bar/xiaomi-shop/cart)
- 🔐 **权限管理控制中心**：[https://mhxy13867806343.github.io/front-end-navigation-bar/permission](https://mhxy13867806343.github.io/front-end-navigation-bar/permission)
- 📜 **系统安全与操作日志中心**：[https://mhxy13867806343.github.io/front-end-navigation-bar/logs](https://mhxy13867806343.github.io/front-end-navigation-bar/logs)
- 🚫 **500 / 404 / 401 等状态页**：[https://mhxy13867806343.github.io/front-end-navigation-bar/500](https://mhxy13867806343.github.io/front-end-navigation-bar/500)
- 🌦️ **天气预报可视化**：[https://mhxy13867806343.github.io/front-end-navigation-bar/weather](https://mhxy13867806343.github.io/front-end-navigation-bar/weather)

## ✨ 功能特性

- **🧡 小米官方商城 & 购物车结算** (`/xiaomi-shop`, `/xiaomi-shop/cart`)：基于 27万+ 行本地 JSON (`src/shop-json/xiaomi-shop.json`) 渲染，内置持久化 `cartStore`、侧边抽屉购物车 (`CartDrawer.vue`) 与全屏购物车页面 (`/xiaomi-shop/cart`)，包含地址选择、优惠券兑换（`MI888` 减 50）、全选删除与**微信支付、支付宝、云闪付、信用卡 24 期免息**的在线模拟支付与订单流转。
- **🔐 权限管理与控制中心** (`/permission`)：内置 4 大 RBAC 角色（超级管理员、运维、运营、访客）实时切换、按钮级指令鉴权（`v-permission`）、路由访问矩阵、JWT Token 报文解析，以及**HTTP 状态码（200 / 401 / 402 / 403 / 404 / 405 / 500）一键直接跳过去展示**。
- **📜 实时系统安全与操作日志中心** (`/logs`)：实时捕获全局 API 响应 HTTP 状态码、RBAC 拦截事件与异常 Stack Trace，支持状态码点击联动跳转、多级别筛选、关键字搜寻与离线 CSV 导出。
- **🚫 完整 HTTP 状态码与异常页面集** (`/200`, `/401`, `/402`, `/403`, `/404`, `/405`, `/500`)：覆盖 200 OK 正常鉴权、401 未授权、402 付费订阅、403 禁止访问防火墙、404 迷失寻路、405 谓词受限、500 服务崩溃与一键自动修复。
- **AI 工具导航**：侧边栏分类 + 子分类导航，覆盖 AI 聊天、写作、绘画、编程、开发平台等数十个分类
- **📜 名人名言与智慧语录**：联动 ALAPI 分类与语录接口，提供主题类型筛选、换一句刷新、一键复制及金句收藏库
- **🌦️ 实时天气可视化**：集成 ALAPI 天气数据，支持实况、7 天柱状图、40 天折线图 (ECharts) 及天气指数
- **💰 统一接口可视化看板**：自动拉取接口数据，提供贵金属实时行情、品牌黄金价格、图片与表格可视化呈现

## 🆕 近期更新

- 🧡 **新增小米官方商城 & 多通道收银台** (`/xiaomi-shop`)：本地由 `src/shop-json/xiaomi-shop.json`（276,530 行数据）驱动，商品详情页支持规格选购、微信/支付宝/云闪付在线支付与订单推送。
- 🔐 **新增权限控制中心** (`/permission`)：支持超级管理员/运维/运营/访客角色一键切换，按钮指令鉴权演示，以及输入任意 HTTP 状态码（如 200, 401, 500）直接跳过去展示。
- 📜 **新增系统审计日志中心** (`/logs`)：提供实时 HTTP 状态码追踪、安全鉴权拦截日志、异常 Stack Trace 追溯、状态码点击联动跳转及 CSV 导出。
- 🚫 **新增全套系统状态与异常页面** (`/200`, `/401`, `/402`, `/403`, `/404`, `/405`, `/500`)：内置交互式 Token 刷新、收银台充值、防火墙提权、REST 谓词测试与服务器一键自我修复。**📍 全国省市区级联组件**：内置 `ChinaRegionCascader` 高性能全国省/市/区县级联选择器
- **🎨 全站 SCSS 样式架构**：全面转换为 SCSS，内置玻璃拟态、自定义滚动条等 SCSS Mixins
- **🛠️ 复用 Hooks 与工具**：封装 `useECharts`、`usePagination` 自定义 Hooks 及格式化工具库 `src/utils/format.ts`
- **全局搜索**：支持按名称/描述跨分类搜索，带搜索历史记录（最多保留 8 条）
- **浏览器兼容提示**：入口顶部检测浏览器能力，通过 Element Plus Dialog 提供浏览器下载入口与天气链接
- **收藏点赞**：工具卡片点赞收藏，收藏记录本地持久化，可查看收藏历史
- **AI 资讯与应用**：每日 AI 资讯时间线、IT之家 API 标签分页资讯、AI 应用集、AI 教程/百科文章列表
- **实时热榜与影视数据**：支持微博、B 站热搜、掘金、OSChina 等热榜，以及院线票房、影视收视/评分榜
- **主题切换**：明暗主题一键切换，偏好本地记忆
- **自定义布局**：网格列数可调（本地记忆），侧边栏可折叠
- **右键菜单**：工具卡片支持"新标签页打开 / 复制链接"

## 🆕 近期更新

- 🔴 **新增 Bilibili 直播数据页** (`/bilibili-live`)：进入“直播”后再拉取线上直播数据，分区与子分类动态同步，支持推荐、人气、最新开播切换。
- ⚔️ **修复 LOLM 国服数据跨域与展示数量**：开发环境走 Vite 本地代理，线上环境走只读数据包装解析；工具箱表格改为内部滚动，完整展示接口返回的英雄榜单。
- 📺 **增强 Bilibili 热搜/热门榜线上兼容** (`/bilibili-trending`)：刷新只作用于搜索热搜榜，热门/必看/音乐榜等列表独立展示线上接口状态。
- 📺 **优化 Bilibili 热搜榜列表细节** (`/bilibili-trending`)：右侧箭头仅在存在有效热搜 icon 时显示，避免无图标条目出现孤立箭头占位。
- 🌦️ **新增天气预报独立视图** (`/weather`)：内置实况天气、ECharts 双温 7 天柱状图 / 40 天平滑折线图及天气指数卡片。
- 💰 **升级接口中心纯可视化看板** (`/api-center`)：自动直接呈现黄金/白银/铂金/钯金行情卡片、品牌金价列表、数据表格及大图预览。
- 🎨 **样式全面 SCSS 化**：全站样式重构转换为 `.scss` 文件，新增 `src/style/mixins.scss` 混入库。
- 🛠️ **抽离公共逻辑**：新增 `useECharts` 和 `usePagination` 自定义 Composables，以及 `src/utils/format.ts` 通用格式化工具。
- 📍 **封装全国省市区选择器**：创建 `ChinaRegionCascader.vue` 并使用 `markRaw` 极致优化万级节点展开性能。
- 👤 **掘金主题板块优化**：点击用户头像弹出 Popover 展示用户资料，支持点击跳转至掘金主页新页面。

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
