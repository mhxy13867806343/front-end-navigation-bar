export interface GithubRepoItem {
  id: string
  name: string
  owner: string
  ownerAvatar?: string
  description: string
  stars: number
  forks: number
  issues: number
  valueScore: number
  language: string
  languageColor: string
  size: string
  updatedAt: string
  topics: string[]
  sparkline: number[]
  isActive?: boolean
  license?: string
}

export interface WeeklyIssueItem {
  vol: string
  title: string
  author: string
  date: string
  summary: string
  coverUrl?: string
  link: string
}

export interface ResourceItem {
  id: string
  title: string
  desc: string
  icon: string
  count: number
  tags: string[]
  link?: string
}

export const mockRepoList: GithubRepoItem[] = [
  {
    id: 'hugo',
    name: 'hugo',
    owner: 'gohugoio',
    description: '世界上最快的网站构建框架，极速生成静态网页。',
    stars: 89000,
    forks: 8200,
    issues: 211,
    valueScore: 55858,
    language: 'Go',
    languageColor: '#00ADD8',
    size: '139.5 MB',
    updatedAt: '2026-07-22',
    topics: ['go', 'hugo', 'static-site-generator'],
    sparkline: [12, 18, 25, 30, 42, 55, 48, 62, 70, 85, 90, 88, 95, 110, 105, 120, 115, 130, 125, 140],
    isActive: true,
    license: 'Apache-2.0'
  },
  {
    id: 'odysseus',
    name: 'odysseus',
    owner: 'odysseus-dev',
    description: '自托管的 AI 工作空间，集成了多模型智能体协同与自动化流程。',
    stars: 83500,
    forks: 11000,
    issues: 1800,
    valueScore: 53309,
    language: 'Python',
    languageColor: '#3572A5',
    size: '38.9 MB',
    updatedAt: '2026-07-22',
    topics: ['python', 'ai-agent', 'workspace'],
    sparkline: [30, 45, 60, 50, 80, 95, 110, 125, 140, 130, 155, 170, 185, 200, 190, 215, 230, 250, 240, 270],
    isActive: true,
    license: 'MIT'
  },
  {
    id: 'vscode',
    name: 'vscode',
    owner: 'microsoft',
    description: 'Visual Studio Code 官方开源仓库，跨平台现代代码编辑器。',
    stars: 187800,
    forks: 39900,
    issues: 17100,
    valueScore: 123796,
    language: 'TypeScript',
    languageColor: '#3178C6',
    size: '1.3 GB',
    updatedAt: '2026-07-22',
    topics: ['editor', 'electron', 'visual-studio-code'],
    sparkline: [80, 90, 110, 100, 125, 140, 135, 160, 175, 190, 185, 210, 230, 220, 250, 265, 280, 295, 310, 330],
    isActive: true,
    license: 'MIT'
  },
  {
    id: 'lazygit',
    name: 'lazygit',
    owner: 'jesseduffield',
    description: 'Git 命令的简易终端界面，极速管理分支与 Commit。',
    stars: 80400,
    forks: 2900,
    issues: 841,
    valueScore: 49040,
    language: 'Go',
    languageColor: '#00ADD8',
    size: '151.8 MB',
    updatedAt: '2026-07-22',
    topics: ['cli', 'git', 'terminal'],
    sparkline: [20, 35, 45, 40, 55, 70, 65, 80, 90, 105, 100, 115, 125, 135, 130, 145, 160, 175, 170, 190],
    isActive: true,
    license: 'MIT'
  },
  {
    id: 'app-ideas',
    name: 'app-ideas',
    owner: 'florinpop17',
    description: '可用于提高您的编码技能的应用程序想法的集合。',
    stars: 96000,
    forks: 10500,
    issues: 606,
    valueScore: 60737,
    language: 'Markdown',
    languageColor: '#083fa1',
    size: '648 KB',
    updatedAt: '2026-07-21',
    topics: ['applications', 'coding', 'challenges'],
    sparkline: [15, 25, 30, 28, 40, 50, 48, 60, 72, 80, 78, 90, 102, 110, 108, 120, 130, 142, 138, 150],
    isActive: false,
    license: 'MIT'
  },
  {
    id: 'react-native',
    name: 'react-native',
    owner: 'facebook',
    description: '一个用 React 构建原生应用的跨平台框架。',
    stars: 126200,
    forks: 25200,
    issues: 1000,
    valueScore: 83251,
    language: 'C++',
    languageColor: '#f34b7d',
    size: '952.1 MB',
    updatedAt: '2026-07-22',
    topics: ['android', 'app-framework', 'cross-platform'],
    sparkline: [60, 75, 90, 85, 105, 120, 115, 130, 145, 160, 155, 175, 190, 205, 200, 220, 235, 250, 245, 270],
    isActive: true,
    license: 'MIT'
  },
  {
    id: 'hoppscotch',
    name: 'hoppscotch',
    owner: 'hoppscotch',
    description: '开源 API 开发生态系统，支持离线、本地与云端调试。',
    stars: 79800,
    forks: 6000,
    issues: 753,
    valueScore: 49659,
    language: 'TypeScript',
    languageColor: '#3178C6',
    size: '96.5 MB',
    updatedAt: '2026-07-21',
    topics: ['api', 'api-client', 'api-rest'],
    sparkline: [25, 40, 50, 45, 60, 75, 70, 85, 95, 110, 105, 120, 130, 140, 135, 150, 165, 180, 175, 195],
    isActive: true,
    license: 'MIT'
  },
  {
    id: 'yt-dlp',
    name: 'yt-dlp',
    owner: 'yt-dlp',
    description: '功能丰富的命令行音频/视频下载器，支持数千站点。',
    stars: 178800,
    forks: 15200,
    issues: 2500,
    valueScore: 111715,
    language: 'Python',
    languageColor: '#3572A5',
    size: '60.0 MB',
    updatedAt: '2026-07-21',
    topics: ['cli', 'downloader', 'python'],
    sparkline: [90, 105, 120, 115, 135, 150, 145, 165, 180, 195, 190, 210, 225, 240, 235, 255, 270, 285, 280, 300],
    isActive: true,
    license: 'Unlicense'
  },
  {
    id: 'openclaw',
    name: 'openclaw',
    owner: 'openclaw',
    description: '开源 Agentic RL 强化学习训练与推理平台。',
    stars: 34200,
    forks: 4800,
    issues: 120,
    valueScore: 28400,
    language: 'Python',
    languageColor: '#3572A5',
    size: '128.4 MB',
    updatedAt: '2026-07-22',
    topics: ['agentic-rl', 'python', 'deep-learning'],
    sparkline: [5, 15, 28, 42, 60, 85, 110, 135, 160, 190, 220, 250, 280, 310, 340, 370, 400, 430, 460, 500],
    isActive: true,
    license: 'Apache-2.0'
  },
  {
    id: 'freeCodeCamp',
    name: 'freeCodeCamp',
    owner: 'freeCodeCamp',
    description: '免费学习编程的开源社区课程与项目实践库。',
    stars: 410000,
    forks: 36800,
    issues: 310,
    valueScore: 248400,
    language: 'TypeScript',
    languageColor: '#3178C6',
    size: '420.0 MB',
    updatedAt: '2026-07-22',
    topics: ['education', 'learn-to-code', 'curriculum'],
    sparkline: [100, 120, 140, 130, 160, 180, 170, 200, 220, 240, 230, 260, 280, 300, 290, 320, 340, 360, 350, 380],
    isActive: true,
    license: 'BSD-3-Clause'
  }
]

export const mockWeeklyList: WeeklyIssueItem[] = [
  {
    vol: 'Vol. 2026-W30',
    title: 'GitHub 严选周刊 2026-W30 期：bookget',
    author: 'deweizhu/bookget',
    date: '2026-07-21',
    summary: 'bookget 数字古籍图书下载工具，支持多平台古籍与高精文献自动归档。',
    link: 'https://github-cn.com/weekly'
  },
  {
    vol: 'Vol. 2026-W29',
    title: 'GitHub 严选周刊 2026-W29 期：WeChatPlugin-MacOS',
    author: 'TKkk-iOSer/WeChatPlugin-MacOS',
    date: '2026-07-14',
    summary: '微信 macOS 客户端功能拓展利器，支持防撤回、自动回复与多开模式。',
    link: 'https://github-cn.com/weekly'
  },
  {
    vol: 'Vol. 2026-W28',
    title: 'GitHub 严选周刊 2026-W28 期：agentation',
    author: 'benjitaylor/agentation',
    date: '2026-07-07',
    summary: '为 Agent 经纪人设计的视觉反馈与渲染控制组件库。',
    link: 'https://github-cn.com/weekly'
  }
]

// 精选专题 (collections)
export const mockCollections: ResourceItem[] = [
  { id: 'ai-tools', title: '大模型与 AI 工具链', desc: '包含 LLM 框架、Agentic RL 与具身智能精选库。', icon: '🤖', count: 128, tags: ['AI', 'LLM', 'Agent'] },
  { id: 'frontend-dev', title: '现代前端工程化', desc: '涵盖 Vue 3, React, Vite, Webpack 与 CSS 渐进渲染库。', icon: '⚡', count: 240, tags: ['Vue', 'React', 'TypeScript'] },
  { id: 'backend-go', title: 'Go & Rust 高性能后端', desc: '微服务、高并发中间件、分布式数据库。', icon: '🦀', count: 185, tags: ['Go', 'Rust', 'Backend'] },
  { id: 'devtools', title: '开发者效率神器', desc: '终端 CLI、格式化工具、Git 增强工具合集。', icon: '🛠️', count: 310, tags: ['CLI', 'Git', 'Tools'] }
]

// 热门话题 (topics)
export const mockTopics: ResourceItem[] = [
  { id: 'topic-agent', title: '#AI-Agent 智能体框架', desc: '当前 GitHub 最火热的自主智能体与多模型协同框架讨论。', icon: '🏷️', count: 950, tags: ['Agent', 'AutoGPT', 'LangChain'] },
  { id: 'topic-vue3', title: '#Vue3-Vapor 蒸汽模式', desc: 'Vue 3.6+ 无虚拟 DOM 渲染技术与性能讨论。', icon: '🏷️', count: 620, tags: ['Vue3', 'Vapor', 'Performance'] },
  { id: 'topic-rust', title: '#Rust-Async 异步系统', desc: 'Rust 1.88 异步闭包与系统级高并发架构交流。', icon: '🏷️', count: 810, tags: ['Rust', 'Tokio', 'Async'] },
  { id: 'topic-webgl', title: '#ThreeJS-3D 网页渲染', desc: 'Three.js, WebGL 与 3D 互动体验热烈探索。', icon: '🏷️', count: 430, tags: ['ThreeJS', '3D', 'WebGL'] }
]

// 资源精选 (awesome)
export const mockAwesome: ResourceItem[] = [
  { id: 'awesome-python', title: 'Awesome Python 精选榜', desc: '最好的 Python 库、框架、工具和学习资源列表。', icon: '⭐', count: 1520, tags: ['Python', 'Awesome', 'Curated'] },
  { id: 'awesome-vue', title: 'Awesome Vue 极客指南', desc: 'Vue 生态最全面的官方/第三方优质插件与资源索引。', icon: '⭐', count: 1140, tags: ['Vue', 'Plugins', 'Awesome'] },
  { id: 'awesome-chatgpt', title: 'Awesome ChatGPT Prompts', desc: '全球开发者精选的高效 Prompt 提示词与系统指令库。', icon: '⭐', count: 2300, tags: ['ChatGPT', 'Prompts', 'AI'] },
  { id: 'awesome-go', title: 'Awesome Go 开源精选', desc: 'Go 语言生态中经过生产环境检验的顶级框架与工具包。', icon: '⭐', count: 1890, tags: ['Go', 'Golang', 'Awesome'] }
]

// 实战指南 (real-world)
export const mockRealworld: ResourceItem[] = [
  { id: 'real-nextjs', title: 'RealWorld Next.js 15 全栈架构', desc: '包含 Auth、Prisma、Tailwind 与 Server Action 的企业级范例。', icon: '🎯', count: 86, tags: ['Next.js', 'React', 'Fullstack'] },
  { id: 'real-fastapi', title: 'RealWorld FastAPI 异步后端', desc: '生产级 API 接口设计、SQLAlchemy 2.0 与 JWT 认证实践。', icon: '🎯', count: 72, tags: ['FastAPI', 'Python', 'API'] },
  { id: 'real-tauri', title: 'RealWorld Tauri 跨平台桌面端', desc: 'Vue 3 + Rust 构建安全极轻量的桌面应用程序。', icon: '🎯', count: 64, tags: ['Tauri', 'Rust', 'Desktop'] },
  { id: 'real-flutter', title: 'RealWorld Flutter 跨平台移动端', desc: 'Clean Architecture 架构下的 iOS & Android 实战模版。', icon: '🎯', count: 90, tags: ['Flutter', 'Dart', 'Mobile'] }
]
