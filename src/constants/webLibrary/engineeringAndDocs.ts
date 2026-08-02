import type { WebLibraryGroup } from './pagesAndGames'

export const mapsChartsGroup: WebLibraryGroup = {
  id: 'maps-charts',
  title: '地图与图表',
  icon: '📊',
  items: [
    { label: '🗺️ Three.js 3D 中国地图设计器', command: '/three-showcase/china-map' },
    { label: '🗺️ mapcn MapLibre 地图 UI 组件库', command: '/mapcn-showcase' },
    { label: '📊 AntV S2 多维表格示例库', command: '/antv-s2-examples' },
    { label: '🕸️ AntV G6 图可视化示例库', command: '/antv-g6-examples' },
    { label: '📱 AntV F2 移动端图表示例库', command: '/antv-f2-examples' },
    { label: '🌏 AntV L7 地理空间示例库', command: '/antv-l7-examples' }
  ]
}

export const engineeringGroup: WebLibraryGroup = {
  id: 'engineering',
  title: '工程工具',
  icon: '💻',
  items: [
    { label: '📡 HTML5 Broadcast Channel 跨页同步展厅', command: '/broadcast-channel' },
    { label: '⚙️ 浏览器兼容性检测', command: 'openDialog' },
    { label: '🧡 小米商城 (27万行数据)', command: '/xiaomi-shop' },
    { label: '💻 页面与功能全量源码查看/复制', command: '/source-code' },
    { label: '🐳 Docker 命令行与可视化双方案部署', command: '/docker-showcase' },
    { label: '🚀 模拟测试版本更新检测 (Element Plus UI)', command: '/triggerVersionCheck' }
  ]
}

export const systemStatusGroup: WebLibraryGroup = {
  id: 'system-status',
  title: '权限与状态页',
  icon: '🛡️',
  items: [
    { label: '🔐 权限控制中心', command: '/permission' },
    { label: '📜 实时系统日志', command: '/logs' },
    { label: '✅ 200 访问正常', command: '/200' },
    { label: '🔑 401 未授权访问', command: '/401' },
    { label: '💎 402 需要付费订阅', command: '/402' },
    { label: '🛡️ 403 禁止/无权访问', command: '/403' },
    { label: '🚀 404 页面未找到', command: '/404' },
    { label: '⚡ 405 方法不受允许', command: '/405' },
    { label: '🔥 500 服务器错误', command: '/500' }
  ]
}

export const docsGroup: WebLibraryGroup = {
  id: 'docs',
  title: '文档资源',
  icon: '📖',
  items: [
    { label: '📖 MDN Web Components 文档', command: 'https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components' },
    { label: '📰 阮一峰 Web Components 教程', command: 'https://www.ruanyifeng.com/blog/2019/08/web_components.html' },
    { label: '🌾 Oat UI 官方 Usage 文档', command: 'https://oat.ink/usage/' },
    { label: '🧪 Oat UI Kitchensink Live Demo', command: 'https://oat.ink/demo/' }
  ]
}
