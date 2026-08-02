import type { WebLibraryGroup } from './pagesAndGames'

export const mediaToolsGroup: WebLibraryGroup = {
  id: 'media-tools',
  title: '媒体与工具',
  icon: '🧰',
  items: [
    { label: '🎬 哔哩哔哩热门视频', command: '/bilibili-trending' },
    {
      label: '📺 哔哩哔哩直播',
      command: '/bilibili-live',
      children: [
        { label: '🧬 哔哩哔哩虚拟主播直播', command: '/bilibili-live-virtual' },
        { label: '🎤 哔哩哔哩娱乐直播', command: '/bilibili-live-entertainment' },
        { label: '📻 哔哩哔哩电台直播', command: '/bilibili-live-radio' },
        { label: '💬 哔哩哔哩聊天室直播', command: '/bilibili-live-chat' },
        { label: '📚 哔哩哔哩知识直播', command: '/bilibili-live-knowledge' },
        { label: '🎮 哔哩哔哩游戏帮玩直播', command: '/bilibili-live-play-together' }
      ]
    },
    { label: '🐾 百度风云榜/热榜', command: '/baidu-trending' },
    { label: '🎬 百度电影热榜', command: '/baidu-trending-movie' },
    { label: '📚 百度小说热榜', command: '/baidu-trending-novel' },
    { label: '📺 百度电视剧热榜', command: '/baidu-trending-teleplay' },
    { label: '🌦️ 实时天气预报', command: '/weather' },
    { label: '📊 极简可视化大屏', command: '/big-screen' },
    { label: '🌅 Bing 每日壁纸', command: '/star' },
    { label: '🧰 开发者智能工具箱', command: '/toolbox' },
    { label: '💰 统一 API 行情中心', command: '/api-center' },
    { label: '♡ 记录缓存', command: '/records-cache' },
    { label: '↗ 分享记录', command: '/share-records' }
  ]
}

export const componentsGroup: WebLibraryGroup = {
  id: 'components',
  title: '组件与 UI',
  icon: '🧩',
  items: [
    { label: '🧩 Web Components 核心与进阶', command: '/web-components' },
    { label: '🌾 Oat UI 全套 26 个组件实例', command: '/oat-ui' },
    { label: '🚀 Oat UI 实战展厅与更新弹窗', command: '/oat-studio' },
    { label: '🔐 100 万款登录注册 UI 展厅', command: '/auth-showcase' },
    { label: '🛒 100 款购物车 UI 展厅', command: '/cart-showcase' }
  ]
}

export const effectsGroup: WebLibraryGroup = {
  id: 'effects',
  title: '动画与调度',
  icon: '✨',
  items: [
    { label: '✨ 63,353 款 CSS/JS 动画特效展厅', command: '/animation-showcase' },
    { label: '⚡ Motion for Vue 50+ 款经典特效展厅', command: '/motion-showcase' },
    { label: '📅 Schedule-X v4.6 现代日历调度组件', command: '/schedule-x' }
  ]
}
