export interface CnblogsNewsItem {
  id: string
  title: string
  link: string
  summary: string
  author: string
  publishTime: string
  diggCount: number
  commentCount: number
  viewCount: number
  tags: string[]
  topicImg?: string
}

export const fallbackCnblogsNews: CnblogsNewsItem[] = [
  {
    id: '831971',
    title: '小红书大模型IMO满分夺金，第三题解法让冠军选手直呼优雅',
    link: 'https://news.cnblogs.com/n/831971/',
    summary: '经 IMO 官方评定，小红书大模型 dots-note-3.0，六道题全部答对，以满分成绩斩获金牌。第三题解法严密且逻辑极度优雅，展现了 AI 在数学推理方面的最新突破。',
    author: 'itwriter',
    publishTime: '2026-07-22 15:55',
    diggCount: 42,
    commentCount: 18,
    viewCount: 1840,
    tags: ['小红书', 'IMO 2026', '大模型', 'AI数学']
  },
  {
    id: '831970',
    title: '物理AI的闭环，终于有人跑通了：日冕+远图万台级部署计划官宣',
    link: 'https://news.cnblogs.com/n/831970/',
    summary: 'WAIC 2026 具身智能展位激增。日冕开物与远图未来联合官宣万台级物理 AI 机器人部署计划，实现了从虚拟仿真到物理世界交互的闭环落地。',
    author: 'itwriter',
    publishTime: '2026-07-22 15:47',
    diggCount: 35,
    commentCount: 9,
    viewCount: 1250,
    tags: ['WAIC 2026', '具身智能', '物理AI', '机器人']
  },
  {
    id: '831968',
    title: 'Vue 3.6 正式发布：Vapor Mode 蒸汽模式进入 stable 阶段！',
    link: 'https://news.cnblogs.com/n/831968/',
    summary: 'Vue 团队今日官宣 Vue 3.6 版本发布，备受瞩目的无虚拟 DOM (Vapor Mode) 蒸汽模式正式进入稳定可用阶段，带来极小的打包体积与数倍的渲染性能提升。',
    author: '前端前线',
    publishTime: '2026-07-22 14:20',
    diggCount: 88,
    commentCount: 54,
    viewCount: 3620,
    tags: ['Vue.js', 'Vapor Mode', '前端开发', 'JavaScript']
  },
  {
    id: '831965',
    title: 'TypeScript 5.8 带来了更强的类型推导与零开销 Type-Strip',
    link: 'https://news.cnblogs.com/n/831965/',
    summary: 'TypeScript 5.8 正式版发布，支持原生 Node.js / Deno 运行无擦除 TypeScript 类型语法，并大幅优化了复杂泛型与条件类型的类型推导效率。',
    author: '微软技术社区',
    publishTime: '2026-07-22 12:10',
    diggCount: 64,
    commentCount: 23,
    viewCount: 2980,
    tags: ['TypeScript', 'Node.js', '编程语言']
  },
  {
    id: '831960',
    title: 'DeepSeek-V3 开源一周年回顾：改变开源 LLM 格局的 365 天',
    link: 'https://news.cnblogs.com/n/831960/',
    summary: '回顾 DeepSeek 架构开源一周年，全球开发者基于 MLA 机制与 MoE 架构衍生出上百个中轻量模型落地应用，推动了开源人工智能生态的蓬勃繁荣。',
    author: 'AI前沿研习',
    publishTime: '2026-07-22 10:30',
    diggCount: 126,
    commentCount: 78,
    viewCount: 5400,
    tags: ['DeepSeek', 'LLM', '开源社区', '人工智能']
  },
  {
    id: '831955',
    title: 'Rust 1.88 引入 Async Closure 异步闭包稳定版支持',
    link: 'https://news.cnblogs.com/n/831955/',
    summary: 'Rust 官方宣布 1.88 稳定版上线，Async Closure 终于正式稳定，解决长期以来异步高阶函数与迭代器回调编写繁琐的难题。',
    author: 'Rust中国',
    publishTime: '2026-07-21 18:40',
    diggCount: 92,
    commentCount: 31,
    viewCount: 3100,
    tags: ['Rust', '异步编程', '系统编程']
  }
]
