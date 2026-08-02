export interface WebLibraryItem {
  label: string
  command?: string
  children?: WebLibraryItem[]
}

export interface WebLibraryGroup {
  id: string
  title: string
  icon: string
  items: WebLibraryItem[]
}

export const newPagesGroup: WebLibraryGroup = {
  id: 'new-pages',
  title: '新建页面',
  icon: '🆕',
  items: [
    { label: '🐙 个人开源项目库', command: '/my-github-projects' },
    { label: '🐾 百度风云榜/热榜', command: '/baidu-trending' },
    { label: '🎬 百度电影热榜', command: '/baidu-trending-movie' },
    { label: '📚 百度小说热榜', command: '/baidu-trending-novel' },
    { label: '📺 百度电视剧热榜', command: '/baidu-trending-teleplay' },
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
    { label: '📘 掘金小册课程', command: '/juejin-course' },
    { label: '💬 掘金圈子广场', command: '/juejin-clubs' },
    { label: '📅 掘金每日签到', command: '/juejin-signin' },
    { label: '🥚 煎蛋页面', command: '/jandan' },
    { label: '🔥 今日热榜 TopHub', command: '/tophub' },
    { label: '📰 IT之家', command: '/ithome' },
    { label: '🐯 虎嗅24小时', command: '/huxiu' },
    { label: '🐙 GitHub开源聚合', command: '/github' },
    { label: '♡ 记录缓存展示', command: '/records-cache' },
    { label: '↗ 分享记录展示', command: '/share-records' },
    { label: '💼 BOSS直聘杭州首页', command: '/boss-zhipin-hangzhou' },
    { label: '🗺️ BOSS直聘地图找工作', command: '/boss-zhipin-hangzhou-map' }
  ]
}

export const gamesGroup: WebLibraryGroup = {
  id: 'games',
  title: '游戏合集',
  icon: '🎮',
  items: [
    { label: '🎮 游戏全量大展厅', command: '/feature' },
    { label: '✈️ 1942 飞行射击', command: '1942.html' },
    { label: '🐱 哆啦A梦·大雄救援', command: 'doraemon.html' },
    { label: '☀️ 黄金太阳·封印篇', command: 'goldsun.html' },
    { label: '⛄ 雪人兄弟 Snow Bros', command: 'snowbros.html' },
    { label: '🎯 75 宾果 75 Bingo', command: 'bingo75.html' },
    { label: '🐢 激光快打 TMNT', command: 'tmnt.html' },
    { label: '🥕 偷菜农场 Steal Farm', command: 'steal-farm.html' },
    { label: '🎲 经典推箱子游戏', command: '/sokoban' },
    { label: '🧺 接水果游戏', command: '/feature' },
    { label: '🐍 贪吃蛇大作战', command: '/feature' },
    { label: '🧱 俄罗斯方块', command: '/feature' },
    { label: '🔢 2048 经典合并', command: '/feature' },
    { label: '💣 扫雷小游戏', command: '/feature' },
    { label: '❌ 井字棋对战', command: '/feature' },
    { label: '🛡️ 90坦克大战', command: '/feature' },
    { label: '🧱 经典打砖块', command: '/feature' },
    { label: '🐦 飞翔小鸟', command: '/feature' },
    { label: '🚀 太空战机', command: '/feature' }
  ]
}

export const aiNewsGroup: WebLibraryGroup = {
  id: 'ai-news',
  title: 'AI与资讯',
  icon: '🤖',
  items: [
    { label: '🤖 AI编程资讯', command: '/aicoding' },
    { label: '⚡ 闪存社区', command: '/flash' },
    { label: '🌍 HelloWorld 社区', command: '/helloworld' },
    { label: '🔥 掘金热门主题', command: '/juejin-theme' },
    { label: '📜 经典名人名言语录', command: '/mingyan' },
    { label: '🌌 CocoLoop 社区', command: '/cocoloop' },
    { label: '📰 博客园新闻', command: '/cnblogs' },
    { label: '🐙 GitHub 中文社区', command: '/github-cn' }
  ]
}
