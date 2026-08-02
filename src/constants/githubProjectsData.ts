/**
 * 21 个 GitHub 开源项目元数据定义
 */
export interface GithubProjectItem {
  id: string
  name: string
  githubUrl: string
  previewUrl?: string
  category: 'ai' | 'admin' | 'datav' | 'uniapp' | 'backend' | 'tools' | 'blog'
  icon: string
  techStack: string[]
  description: string
  stars?: number
  forks?: number
}

export interface GithubProjectCategory {
  key: string
  label: string
  icon: string
}

export const GITHUB_PROJECT_CATEGORIES: GithubProjectCategory[] = [
  { key: 'all', label: '全部项目', icon: '🌟' },
  { key: 'ai', label: 'AI 与大模型', icon: '🤖' },
  { key: 'admin', label: '后台管理系统', icon: '🖥️' },
  { key: 'datav', label: '响应式大屏', icon: '📊' },
  { key: 'uniapp', label: 'UniApp 移动端', icon: '📱' },
  { key: 'backend', label: 'Rust/Python/后端', icon: '🦀' },
  { key: 'tools', label: '闪念与极客工具', icon: '🧰' },
  { key: 'blog', label: '博客与静态文档', icon: '📖' }
]

export const GITHUB_PROJECTS: GithubProjectItem[] = [
  {
    id: 'ai-credit-limit',
    name: 'AI 额度管理与限制系统',
    githubUrl: 'https://github.com/mhxy13867806343/ai-credit-limit',
    category: 'ai',
    icon: '🤖',
    techStack: ['Vue3', 'TypeScript', 'Node.js', 'AI API'],
    description: '针对 OpenAI / Claude 等 AI 模型的额度限额管理、API Key 配额分派与限流中间件服务。',
    stars: 128,
    forks: 34
  },
  {
    id: 'huggingface-zh',
    name: 'HuggingFace 中文镜像助手',
    githubUrl: 'https://github.com/mhxy13867806343/huggingface-zh',
    category: 'ai',
    icon: '🤗',
    techStack: ['Python', 'HuggingFace', 'PyTorch', 'CLI'],
    description: '提供 HuggingFace 中文模型国内高速下载镜像、大模型权重快速拉取与环境配置指南。',
    stars: 256,
    forks: 68
  },
  {
    id: 'start-run-ai-end-fd',
    name: 'Start Run AI 前后端一体脚手架',
    githubUrl: 'https://github.com/mhxy13867806343/start-run-ai-end-fd',
    category: 'ai',
    icon: '🚀',
    techStack: ['Vue3', 'FastAPI', 'Python', 'Tailwind'],
    description: '前后端一体化 AI 智能应用快速启动脚手架，预置 Agent 对话、大模型调用流与鉴权。',
    stars: 195,
    forks: 42
  },
  {
    id: 'jiShan-Backstage-Management-System',
    name: 'JiShan 极山通用后台管理系统',
    githubUrl: 'https://github.com/mhxy13867806343/jiShan-Backstage-Management-System',
    category: 'admin',
    icon: '🖥️',
    techStack: ['Vue3', 'Element Plus', 'TypeScript', 'Pinia'],
    description: '功能完善的极山企业级中后台管理系统，具备动态路由、权限菜单、图表展示与主题切换。',
    stars: 312,
    forks: 85
  },
  {
    id: 'layui-vue3-admin-ts',
    name: 'Layui Vue3 TS 经典后台框架',
    githubUrl: 'https://github.com/mhxy13867806343/layui-vue3-admin-ts',
    category: 'admin',
    icon: '🌾',
    techStack: ['Vue3', 'Layui Vue', 'TypeScript', 'Vite'],
    description: '基于 Layui-Vue 与 TypeScript 打造的极简复古经典风后台管理系统预设框架。',
    stars: 164,
    forks: 39
  },
  {
    id: 'vue3-naiveui-admin-ts',
    name: 'Vue3 Naive UI Admin TS',
    githubUrl: 'https://github.com/mhxy13867806343/vue3-naiveui-admin-ts',
    category: 'admin',
    icon: '⚡',
    techStack: ['Vue3', 'Naive UI', 'TypeScript', 'Pinia'],
    description: '现代全能 Vue3 + Naive UI 中后台工程，包含丰富可复用组件、深色模式与权限控制。',
    stars: 420,
    forks: 110
  },
  {
    id: 'vue3-naiveui-admin-ts--blog',
    name: 'Naive UI 博客后台管理中台',
    githubUrl: 'https://github.com/mhxy13867806343/vue3-naiveui-admin-ts--blog',
    category: 'admin',
    icon: '📑',
    techStack: ['Vue3', 'Naive UI', 'Markdown', 'TypeScript'],
    description: '结合 Naive UI 与博客内容管理的专业后台面板，支持文章管理、数据统计与分类标签。',
    stars: 215,
    forks: 56
  },
  {
    id: 'vue3-Adaptive-Large-Screen-ts',
    name: 'Vue3 响应式自适应可视化大屏',
    githubUrl: 'https://github.com/mhxy13867806343/vue3-Adaptive-Large-Screen-ts',
    category: 'datav',
    icon: '📊',
    techStack: ['Vue3', 'ECharts', 'TypeScript', 'Autofit'],
    description: '大厂级别 Vue3 + TypeScript 自适应大屏可视化开箱即用模板，支持多尺寸全屏无缝适配。',
    stars: 580,
    forks: 145
  },
  {
    id: 'vue3-Adaptive-Large-Screen-ts-blog',
    name: 'Vue3 大屏与技术博客集成面板',
    githubUrl: 'https://github.com/mhxy13867806343/vue3-Adaptive-Large-Screen-ts-blog',
    category: 'datav',
    icon: '📈',
    techStack: ['Vue3', 'ECharts', 'Vite', 'TypeScript'],
    description: '集成数据可视化大屏展示与技术文章流的自适应综合展示系统。',
    stars: 289,
    forks: 73
  },
  {
    id: 'uniapp-video-next',
    name: 'UniApp 沉浸式短视频模板 Next',
    githubUrl: 'https://github.com/mhxy13867806343/uniapp-video-next',
    category: 'uniapp',
    icon: '📱',
    techStack: ['UniApp', 'Vue3', 'TypeScript', 'H5/App'],
    description: '基于 UniApp + Vue3 打造的高性能沉浸式短视频/视频流上下滑动切集开箱即用模板。',
    stars: 360,
    forks: 92
  },
  {
    id: 'uniapp-template-ts-vue3',
    name: 'UniApp Vue3 TS 通用开发预设',
    githubUrl: 'https://github.com/mhxy13867806343/uniapp-template-ts-vue3',
    category: 'uniapp',
    icon: '⚙️',
    techStack: ['UniApp', 'Vue3', 'TypeScript', 'Vite'],
    description: '标准化跨端小程序/App 开发脚手架，预置网络请求、Pinia 状态管理与通用 UI 库。',
    stars: 480,
    forks: 125
  },
  {
    id: 'uniapp-template-ts-vue3-blog',
    name: 'UniApp Vue3 移动端博客系统',
    githubUrl: 'https://github.com/mhxy13867806343/uniapp-template-ts-vue3-blog',
    category: 'uniapp',
    icon: '📝',
    techStack: ['UniApp', 'Vue3', 'TypeScript', 'MiniProgram'],
    description: '专为移动端与小程序打造的高颜值多终端技术博客阅读客户端。',
    stars: 230,
    forks: 61
  },
  {
    id: 'rustchatService',
    name: 'RustChat 高性能 IM 即时通讯',
    githubUrl: 'https://github.com/mhxy13867806343/rustchatService',
    category: 'backend',
    icon: '🦀',
    techStack: ['Rust', 'Tokio', 'WebSocket', 'Serde'],
    description: '采用 Rust 语言与 Tokio 异步运行时打造的高吞吐量、低延迟 WebSocket 即时通讯 IM 服务。',
    stars: 510,
    forks: 138
  },
  {
    id: 'rust-tiobe-deploy',
    name: 'Rust TIOBE 排行榜部署套件',
    githubUrl: 'https://github.com/mhxy13867806343/rust-tiobe-deploy',
    category: 'backend',
    icon: '📊',
    techStack: ['Rust', 'Axum', 'Reqwest', 'Docker'],
    description: '实时爬取并解析 TIOBE 编程语言排行榜数据的 Rust 高性能微服务部署套件。',
    stars: 175,
    forks: 44
  },
  {
    id: 'python-flet-wifi-demo',
    name: 'Python Flet 跨平台 WiFi 工具',
    githubUrl: 'https://github.com/mhxy13867806343/python-flet-wifi-demo',
    category: 'backend',
    icon: '📶',
    techStack: ['Python', 'Flet', 'Flutter', 'PyWifi'],
    description: '基于 Python Flet (Flutter 引擎) 的跨平台桌面与移动端 WiFi 扫描、信号测试与自动连接工具。',
    stars: 290,
    forks: 78
  },
  {
    id: 'pysshcmd',
    name: 'PySSHCmd 批量运维小工具',
    githubUrl: 'https://github.com/mhxy13867806343/pysshcmd',
    category: 'backend',
    icon: '🛠️',
    techStack: ['Python', 'Paramiko', 'CLI', 'SSH'],
    description: 'Python 开发的轻量级并发 SSH 批量命令执行与远程服务器节点运维小工具。',
    stars: 142,
    forks: 35
  },
  {
    id: 'instant-flash-front-end',
    name: '闪念/快讯资讯全端展示前端',
    githubUrl: 'https://github.com/mhxy13867806343/instant-flash-front-end',
    category: 'tools',
    icon: '⚡',
    techStack: ['Vue3', 'TypeScript', 'Vite', 'Pinia'],
    description: '闪念快讯全端展示前端，提供卡片瀑布流、分类快讯、实时聚合与高能新闻追踪。',
    stars: 340,
    forks: 88
  },
  {
    id: 'instant-flash-backend',
    name: '闪念/快讯抓取与推送后端',
    githubUrl: 'https://github.com/mhxy13867806343/instant-flash-backend',
    category: 'tools',
    icon: '📡',
    techStack: ['Node.js', 'Express', 'Crawler', 'Redis'],
    description: '负责多源科技快讯与博客抓取、数据清洗、实时推送与缓存的后端引擎。',
    stars: 210,
    forks: 52
  },
  {
    id: 'down-wx-video',
    name: '微信视频号解析下载工具',
    githubUrl: 'https://github.com/mhxy13867806343/down-wx-video',
    category: 'tools',
    icon: '🎬',
    techStack: ['JavaScript', 'Node.js', 'Electron', 'HTTP'],
    description: '微信视频号与短视频地址抓取、解析与高清无水印视频一键下载小工具。',
    stars: 490,
    forks: 140
  },
  {
    id: 'Dev-Toolbox-',
    name: 'Dev Toolbox 极客开发工具箱',
    githubUrl: 'https://github.com/mhxy13867806343/Dev-Toolbox-',
    category: 'tools',
    icon: '🧰',
    techStack: ['Vue3', 'TypeScript', 'Toolbox', 'Vite'],
    description: '集成了编码转换、JSON 格式化、正则表达式测试、加密解密等实用能力的开发者全能工具箱。',
    stars: 380,
    forks: 96
  },
  {
    id: 'myvitepressblog',
    name: 'VitePress 个人极简技术博客',
    githubUrl: 'https://github.com/mhxy13867806343/myvitepressblog',
    category: 'blog',
    icon: '📖',
    techStack: ['VitePress', 'Vue3', 'Markdown', 'SSG'],
    description: '基于 VitePress 搭建的极速静态技术文档与个人学习心得博客网站。',
    stars: 270,
    forks: 65
  }
]
