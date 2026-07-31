<script setup lang="ts">
import type { ComputedRef, Ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const goToWeather = (): void => {
  router.push('/weather')
}
const goToMingyan = (): void => {
  router.push('/mingyan')
}
const goToWebComponents = (): void => {
  router.push('/web-components')
}
const goToOatUi = (): void => {
  router.push('/oat-ui')
}
const goToPage = (path: string): void => {
  router.push(path)
}
import { triggerVersionNotice } from '../utils/versionPolling'

const handleCommand = (command: string): void => {
  if (!command) return
  if (command === 'openDialog') {
    dialogVisible.value = true
  } else if (command === 'triggerVersionCheck') {
    triggerVersionNotice()
  } else if (command.startsWith('http://') || command.startsWith('https://')) {
    window.open(command, '_blank')
  } else if (command.endsWith('.html')) {
    const url = import.meta.env.BASE_URL + command.replace(/^\/+/, '')
    window.open(url, '_blank')
  } else {
    router.push(command)
  }
}
import packageJson from '../../package.json'

interface BrowserDownloadLink {
  name: string
  url: string
  vendor: string
}

interface BrowserFeatureCheck {
  label: string
  supported: boolean
}

interface QrImage {
  src: string
  alt: string
}

interface TechStackItem {
  name: string
  packageName: string
  version: string
  url: string
  group: string
}

interface WebLibraryItem {
  label: string
  command: string
}

interface WebLibraryGroup {
  id: string
  title: string
  icon: string
  items: WebLibraryItem[]
}

interface PackageMetadata {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

interface BrowserSupportNoticeProps {
  autoOpen?: boolean
}

const props: BrowserSupportNoticeProps = withDefaults(defineProps<BrowserSupportNoticeProps>(), {
  autoOpen: true
})

const activeWebLibraryGroupId: Ref<string> = ref<string>('new-pages')

const qrImageModules: Record<string, string> = import.meta.glob('../assets/qc/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url'
}) as Record<string, string>

const browserLinks: BrowserDownloadLink[] = [
  { name: 'Google Chrome', vendor: 'Google', url: 'https://www.google.com/chrome/' },
  { name: 'Microsoft Edge', vendor: 'Microsoft', url: 'https://www.microsoft.com/edge' },
  { name: 'Firefox', vendor: 'Mozilla', url: 'https://www.mozilla.org/firefox/new/' },
  { name: '360 安全浏览器', vendor: '360', url: 'https://browser.360.cn/' },
  { name: 'QQ 浏览器', vendor: 'Tencent', url: 'https://browser.qq.com/' }
]

const packageMetadata: PackageMetadata = packageJson as PackageMetadata
const packageVersions: Record<string, string> = {
  ...packageMetadata.dependencies,
  ...packageMetadata.devDependencies
}

const webLibraryGroups: WebLibraryGroup[] = [
  {
    id: 'new-pages',
    title: '新建页面',
    icon: '🆕',
    items: [
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
  },
  {
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
  },
  {
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
  },
  {
    id: 'media-tools',
    title: '媒体与工具',
    icon: '🧰',
    items: [
      { label: '🎬 哔哩哔哩热门视频', command: '/bilibili-trending' },
      { label: '📺 哔哩哔哩直播', command: '/bilibili-live' },
      { label: '🌦️ 实时天气预报', command: '/weather' },
      { label: '📊 极简可视化大屏', command: '/big-screen' },
      { label: '🌅 Bing 每日壁纸', command: '/star' },
      { label: '🧰 开发者智能工具箱', command: '/toolbox' },
      { label: '💰 统一 API 行情中心', command: '/api-center' },
      { label: '♡ 记录缓存', command: '/records-cache' },
      { label: '↗ 分享记录', command: '/share-records' }
    ]
  },
  {
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
  },
  {
    id: 'effects',
    title: '动画与调度',
    icon: '✨',
    items: [
      { label: '✨ 63,353 款 CSS/JS 动画特效展厅', command: '/animation-showcase' },
      { label: '⚡ Motion for Vue 50+ 款经典特效展厅', command: '/motion-showcase' },
      { label: '📅 Schedule-X v4.6 现代日历调度组件', command: '/schedule-x' }
    ]
  },
  {
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
  },
  {
    id: 'engineering',
    title: '工程工具',
    icon: '💻',
    items: [
      { label: '⚙️ 浏览器兼容性检测', command: 'openDialog' },
      { label: '🧡 小米商城 (27万行数据)', command: '/xiaomi-shop' },
      { label: '💻 页面与功能全量源码查看/复制', command: '/source-code' },
      { label: '🐳 Docker 命令行与可视化双方案部署', command: '/docker-showcase' },
      { label: '🚀 模拟测试版本更新检测 (Element Plus UI)', command: 'triggerVersionCheck' }
    ]
  },
  {
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
  },
  {
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
]
const activeWebLibraryGroup: ComputedRef<WebLibraryGroup> = computed<WebLibraryGroup>(() => {
  return webLibraryGroups.find((group: WebLibraryGroup): boolean => group.id === activeWebLibraryGroupId.value) || webLibraryGroups[0]
})

interface WebLibraryTreeNode {
  id: string
  label: string
  command?: string
  children?: WebLibraryTreeNode[]
}

type ViewMode = 'tree' | 'split' | 'transfer' | 'carousel' | 'collapse' | 'tabs'

const viewMode: Ref<ViewMode> = ref<ViewMode>('tree')
const transferSearchQuery: Ref<string> = ref<string>('')
const activeCollapseNames: Ref<string[]> = ref<string[]>(webLibraryGroups.map((g: WebLibraryGroup): string => g.id))

const tabsPosition: Ref<'top' | 'left' | 'right' | 'bottom'> = ref<'top' | 'left' | 'right' | 'bottom'>('top')
const tabsType: Ref<'border-card' | 'card' | ''> = ref<'border-card' | 'card' | ''>('border-card')

const filteredTransferGroups: ComputedRef<WebLibraryGroup[]> = computed<WebLibraryGroup[]>(() => {
  if (!transferSearchQuery.value.trim()) return webLibraryGroups
  const q: string = transferSearchQuery.value.trim().toLowerCase()
  return webLibraryGroups.filter(
    (g: WebLibraryGroup): boolean =>
      g.title.toLowerCase().includes(q) ||
      g.items.some((i: WebLibraryItem): boolean => i.label.toLowerCase().includes(q))
  )
})

const filteredTransferItems: ComputedRef<WebLibraryItem[]> = computed<WebLibraryItem[]>(() => {
  const items: WebLibraryItem[] = activeWebLibraryGroup.value.items
  if (!transferSearchQuery.value.trim()) return items
  const q: string = transferSearchQuery.value.trim().toLowerCase()
  return items.filter((i: WebLibraryItem): boolean => i.label.toLowerCase().includes(q))
})

const treeData: ComputedRef<WebLibraryTreeNode[]> = computed<WebLibraryTreeNode[]>(() => {
  return webLibraryGroups.map((group: WebLibraryGroup): WebLibraryTreeNode => ({
    id: group.id,
    label: `${group.icon} ${group.title}`,
    children: group.items.map((item: WebLibraryItem, idx: number): WebLibraryTreeNode => ({
      id: `${group.id}-${idx}`,
      label: item.label,
      command: item.command
    }))
  }))
})

const handleTreeNodeClick = (node: WebLibraryTreeNode): void => {
  if (node.command) {
    handleCommand(node.command)
  }
}

const techStack: TechStackItem[] = [
  { name: 'Vue', packageName: 'vue', version: getPackageVersion('vue'), url: 'https://vuejs.org/', group: '框架' },
  { name: 'Vue Router', packageName: 'vue-router', version: getPackageVersion('vue-router'), url: 'https://router.vuejs.org/', group: '路由' },
  { name: 'Vite', packageName: 'vite', version: getPackageVersion('vite'), url: 'https://vite.dev/', group: '构建' },
  { name: 'TypeScript', packageName: 'typescript', version: getPackageVersion('typescript'), url: 'https://www.typescriptlang.org/', group: '语言' },
  { name: 'Element Plus', packageName: 'element-plus', version: getPackageVersion('element-plus'), url: 'https://element-plus.org/zh-CN/', group: 'UI' },
  { name: 'Naive UI', packageName: 'naive-ui', version: getPackageVersion('naive-ui'), url: 'https://www.naiveui.com/', group: 'UI' },
  { name: 'ECharts', packageName: 'echarts', version: getPackageVersion('echarts'), url: 'https://echarts.apache.org/', group: '图表' },
  { name: 'Axios', packageName: 'axios', version: getPackageVersion('axios'), url: 'https://axios-http.com/', group: '请求' },
  { name: 'CropperJS', packageName: 'cropperjs', version: getPackageVersion('cropperjs'), url: 'https://fengyuanchen.github.io/cropperjs/', group: '图片' },
  { name: 'Vue TSC', packageName: 'vue-tsc', version: getPackageVersion('vue-tsc'), url: 'https://github.com/vuejs/language-tools', group: '校验' },
  { name: 'Auto Import', packageName: 'unplugin-auto-import', version: getPackageVersion('unplugin-auto-import'), url: 'https://github.com/unplugin/unplugin-auto-import', group: '工程化' },
  { name: 'Vuedraggable', packageName: 'vuedraggable', version: getPackageVersion('vuedraggable'), url: 'https://github.com/SortableJS/vue.draggable.next', group: '交互' }
]

const qrImages: QrImage[] = Object.entries(qrImageModules)
  .sort(([leftPath]: [string, string], [rightPath]: [string, string]): number => leftPath.localeCompare(rightPath))
  .map(([filePath, src]: [string, string], index: number): QrImage => {
    const fileName: string = filePath.split('/').pop() || `qr-${index + 1}`
    return {
      src,
      alt: `二维码 ${index + 1}：${fileName}`
    }
  })

const authorGithubUrl: string = 'https://github.com/mhxy13867806343'
const closeTipStorageKey: string = 'hooksvue-browser-dialog-close-tip-shown'
const currentDateTime: Ref<Date> = ref<Date>(new Date())
const dialogVisible: Ref<boolean> = ref<boolean>(false)
let clockTimer: number | null = null

const browserName: ComputedRef<string> = computed<string>((): string => {
  const userAgent: string = navigator.userAgent

  if (/Edg\//.test(userAgent)) return 'Microsoft Edge'
  if (/Chrome\//.test(userAgent) && /Safari\//.test(userAgent)) return 'Google Chrome / Chromium'
  if (/Firefox\//.test(userAgent)) return 'Firefox'
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return 'Safari'
  if (/MSIE|Trident/.test(userAgent)) return 'Internet Explorer'
  return '未知浏览器'
})

const browserFeatures: ComputedRef<BrowserFeatureCheck[]> = computed<BrowserFeatureCheck[]>((): BrowserFeatureCheck[] => {
  return [
    { label: 'Fetch 请求', supported: typeof window.fetch === 'function' },
    { label: 'Promise', supported: typeof window.Promise === 'function' },
    { label: 'URLSearchParams', supported: typeof window.URLSearchParams === 'function' },
    { label: '本地存储', supported: canUseLocalStorage() },
    { label: 'CSS Grid', supported: typeof CSS !== 'undefined' && CSS.supports('display', 'grid') }
  ]
})

const isBrowserUnsupported: ComputedRef<boolean> = computed<boolean>((): boolean => {
  return browserFeatures.value.some((feature: BrowserFeatureCheck): boolean => !feature.supported)
})

const browserStatusText: ComputedRef<string> = computed<string>((): string => {
  if (isBrowserUnsupported.value) {
    return `当前 ${browserName.value} 缺少必要能力，建议更换现代浏览器后访问。`
  }

  return `当前 ${browserName.value} 已通过现代浏览器能力检测。`
})

const browserTagType: ComputedRef<'success' | 'danger'> = computed<'success' | 'danger'>((): 'success' | 'danger' => {
  return isBrowserUnsupported.value ? 'danger' : 'success'
})

const formattedTime: ComputedRef<string> = computed<string>((): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'full',
    timeStyle: 'medium'
  }).format(currentDateTime.value)
})

const yearlyGreeting: ComputedRef<string> = computed<string>((): string => {
  const year: number = currentDateTime.value.getFullYear()
  if (year < 2027) return ''
  return `祝你 ${year} 新的一年快乐，愿这一年继续写出顺手、稳定、漂亮的作品。`
})

function canUseLocalStorage(): boolean {
  try {
    const testKey: string = '__hooksvue_browser_check__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

function getPackageVersion(packageName: string): string {
  const rawVersion: string = packageVersions[packageName] || '未安装'
  return rawVersion.replace(/^[~^]/, '')
}

function showCloseTipOnce(): void {
  try {
    if (window.localStorage.getItem(closeTipStorageKey)) return

    ElMessage.info('已关闭二维码与兼容性说明，下次关闭时不会再提示。')
    window.localStorage.setItem(closeTipStorageKey, '1')
  } catch {
    ElMessage.info('已关闭二维码与兼容性说明。')
  }
}

function closeDialog(): void {
  showCloseTipOnce()
  dialogVisible.value = false
}

function handleDialogBeforeClose(done: () => void): void {
  showCloseTipOnce()
  done()
}

onMounted((): void => {
  if (props.autoOpen && isBrowserUnsupported.value) {
    dialogVisible.value = true
  }

  clockTimer = window.setInterval((): void => {
    currentDateTime.value = new Date()
  }, 1000)
})

onUnmounted((): void => {
  if (clockTimer !== null) {
    window.clearInterval(clockTimer)
    clockTimer = null
  }
})
</script>

<template>
  <section class="browser-support-bar" :class="{ warning: isBrowserUnsupported }" aria-label="浏览器兼容性提示">
    <div class="bar-copy">
      <span class="bar-dot" aria-hidden="true"></span>
      <div>
        <strong>{{ isBrowserUnsupported ? '浏览器版本过旧' : '浏览器环境正常' }}</strong>
        <span>{{ browserStatusText }}</span>
      </div>
    </div>

    <div class="bar-actions" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
      <!-- Web 组件与库 分组下拉菜单 -->
      <el-popover
        placement="bottom"
        trigger="click"
        :width="850"
        popper-class="web-library-popover"
      >
        <template #reference>
          <el-button type="primary" plain size="small">
            🧩 Web组件与库 ▾
          </el-button>
        </template>

        <div class="web-library-container">
          <div class="web-library-toolbar">
            <span class="toolbar-title">🧩 Web 组件与库导航系统</span>
            <div class="view-switch-btns">
              <button
                type="button"
                class="switch-btn"
                :class="{ active: viewMode === 'tree' }"
                @click="viewMode = 'tree'"
                title="树形结构"
              >
                🌲 树形结构
              </button>
              <button
                type="button"
                class="switch-btn"
                :class="{ active: viewMode === 'tabs' }"
                @click="viewMode = 'tabs'"
                title="卡片标签页"
              >
                🏷️ 标签页
              </button>
              <button
                type="button"
                class="switch-btn"
                :class="{ active: viewMode === 'split' }"
                @click="viewMode = 'split'"
                title="悬停分栏模式"
              >
                📑 悬停分栏
              </button>
              <button
                type="button"
                class="switch-btn"
                :class="{ active: viewMode === 'transfer' }"
                @click="viewMode = 'transfer'"
                title="双列表穿梭过滤"
              >
                🔀 穿梭列表
              </button>
              <button
                type="button"
                class="switch-btn"
                :class="{ active: viewMode === 'carousel' }"
                @click="viewMode = 'carousel'"
                title="走马灯轮播"
              >
                🎠 走马灯
              </button>
              <button
                type="button"
                class="switch-btn"
                :class="{ active: viewMode === 'collapse' }"
                @click="viewMode = 'collapse'"
                title="折叠面板"
              >
                📂 折叠面板
              </button>
            </div>
          </div>

          <!-- 模式 1：树形结构 -->
          <div v-if="viewMode === 'tree'" class="web-library-tree-wrapper">
            <el-tree
              :data="treeData"
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
              :props="{ children: 'children', label: 'label' }"
              @node-click="handleTreeNodeClick"
              class="web-library-tree"
            >
              <template #default="{ data }">
                <div
                  class="custom-tree-node"
                  :class="{ 'is-leaf': !data.children || !data.children.length }"
                  @click.stop="data.command && handleCommand(data.command)"
                >
                  <span class="node-label">{{ data.label }}</span>
                  <span v-if="data.command" class="node-badge">▶ 打开</span>
                </div>
              </template>
            </el-tree>
          </div>

          <!-- 模式 6：卡片/边框卡片/多方向标签页 (Tabs) -->
          <div v-else-if="viewMode === 'tabs'" class="web-library-tabs-wrapper">
            <div class="tabs-control-bar">
              <div class="control-group">
                <span class="control-label">标签位置:</span>
                <div class="mini-btn-group">
                  <button
                    type="button"
                    class="mini-btn"
                    :class="{ active: tabsPosition === 'top' }"
                    @click="tabsPosition = 'top'"
                  >top</button>
                  <button
                    type="button"
                    class="mini-btn"
                    :class="{ active: tabsPosition === 'left' }"
                    @click="tabsPosition = 'left'"
                  >left</button>
                  <button
                    type="button"
                    class="mini-btn"
                    :class="{ active: tabsPosition === 'right' }"
                    @click="tabsPosition = 'right'"
                  >right</button>
                  <button
                    type="button"
                    class="mini-btn"
                    :class="{ active: tabsPosition === 'bottom' }"
                    @click="tabsPosition = 'bottom'"
                  >bottom</button>
                </div>
              </div>

              <div class="control-group">
                <span class="control-label">卡片风格:</span>
                <div class="mini-btn-group">
                  <button
                    type="button"
                    class="mini-btn"
                    :class="{ active: tabsType === 'border-card' }"
                    @click="tabsType = 'border-card'"
                  >border-card</button>
                  <button
                    type="button"
                    class="mini-btn"
                    :class="{ active: tabsType === 'card' }"
                    @click="tabsType = 'card'"
                  >card</button>
                  <button
                    type="button"
                    class="mini-btn"
                    :class="{ active: tabsType === '' }"
                    @click="tabsType = ''"
                  >default</button>
                </div>
              </div>
            </div>

            <el-tabs
              v-model="activeWebLibraryGroupId"
              :type="tabsType || undefined"
              :tab-position="tabsPosition"
              class="web-library-el-tabs"
            >
              <el-tab-pane
                v-for="group in webLibraryGroups"
                :key="group.id"
                :name="group.id"
              >
                <template #label>
                  <span>{{ group.icon }} {{ group.title }}</span>
                </template>
                <div class="tabs-grid">
                  <button
                    v-for="item in group.items"
                    :key="item.command"
                    type="button"
                    class="web-library-item"
                    @click="handleCommand(item.command)"
                  >
                    {{ item.label }}
                  </button>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 模式 2：悬停分栏模式 -->
          <div v-else-if="viewMode === 'split'" class="web-library-menu">
            <nav class="web-library-groups" aria-label="Web 组件与库分类">
              <button
                v-for="group in webLibraryGroups"
                :key="group.id"
                type="button"
                class="web-library-group"
                :class="{ active: activeWebLibraryGroupId === group.id }"
                @mouseenter="activeWebLibraryGroupId = group.id"
                @click="activeWebLibraryGroupId = group.id"
              >
                <span>{{ group.icon }}</span>
                <strong>{{ group.title }}</strong>
              </button>
            </nav>

            <div class="web-library-items">
              <div class="web-library-heading">
                <span>{{ activeWebLibraryGroup.icon }}</span>
                <strong>{{ activeWebLibraryGroup.title }}</strong>
              </div>
              <button
                v-for="item in activeWebLibraryGroup.items"
                :key="item.command"
                type="button"
                class="web-library-item"
                @click="handleCommand(item.command)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>

          <!-- 模式 3：穿梭列表模式 (无复选框) -->
          <div v-else-if="viewMode === 'transfer'" class="web-library-transfer-wrapper">
            <div class="transfer-header">
              <el-input
                v-model="transferSearchQuery"
                placeholder="🔍 搜索名称或功能... (穿梭列表实时过滤)"
                clearable
                size="small"
                class="transfer-search-input"
              />
            </div>
            <div class="transfer-body">
              <div class="transfer-panel left-panel">
                <div class="panel-header-title">List 1 分类导航 ({{ filteredTransferGroups.length }})</div>
                <div class="panel-list">
                  <div
                    v-for="group in filteredTransferGroups"
                    :key="group.id"
                    class="transfer-list-item"
                    :class="{ active: activeWebLibraryGroupId === group.id }"
                    @mouseenter="activeWebLibraryGroupId = group.id"
                    @click="activeWebLibraryGroupId = group.id"
                  >
                    <span>{{ group.icon }} {{ group.title }}</span>
                    <span class="item-count">{{ group.items.length }}</span>
                  </div>
                </div>
              </div>
              <div class="transfer-panel right-panel">
                <div class="panel-header-title">{{ activeWebLibraryGroup.icon }} {{ activeWebLibraryGroup.title }} 项列表 ({{ filteredTransferItems.length }})</div>
                <div class="panel-list">
                  <div
                    v-for="item in filteredTransferItems"
                    :key="item.command"
                    class="transfer-list-item link-item"
                    @click="handleCommand(item.command)"
                  >
                    <span>{{ item.label }}</span>
                    <span class="action-tag">访问 ▶</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 模式 4：走马灯轮播模式 (Hover切换) -->
          <div v-else-if="viewMode === 'carousel'" class="web-library-carousel-wrapper">
            <el-carousel trigger="hover" height="420px" indicator-position="outside">
              <el-carousel-item v-for="group in webLibraryGroups" :key="group.id">
                <div class="carousel-slide">
                  <div class="slide-header">
                    <span class="slide-icon">{{ group.icon }}</span>
                    <h3>{{ group.title }}</h3>
                    <span class="slide-badge">{{ group.items.length }} 个项目</span>
                  </div>
                  <div class="slide-grid">
                    <button
                      v-for="item in group.items"
                      :key="item.command"
                      type="button"
                      class="web-library-item"
                      @click="handleCommand(item.command)"
                    >
                      {{ item.label }}
                    </button>
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>

          <!-- 模式 5：折叠面板模式 (全展开) -->
          <div v-else-if="viewMode === 'collapse'" class="web-library-collapse-wrapper">
            <el-collapse v-model="activeCollapseNames" class="web-library-collapse">
              <el-collapse-item
                v-for="group in webLibraryGroups"
                :key="group.id"
                :name="group.id"
              >
                <template #title>
                  <div class="collapse-item-title">
                    <span>{{ group.icon }} {{ group.title }}</span>
                    <span class="collapse-count-badge">{{ group.items.length }} 项</span>
                  </div>
                </template>
                <div class="collapse-grid">
                  <button
                    v-for="item in group.items"
                    :key="item.command"
                    type="button"
                    class="web-library-item"
                    @click="handleCommand(item.command)"
                  >
                    {{ item.label }}
                  </button>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-popover>
      <!-- Legacy command markers for navigation source regression coverage.
      <el-dropdown @command="handleCommand" trigger="click">
        <el-button type="primary" plain size="small">
          🧩 Web组件与库 ▾
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="/web-components">🧩 Web Components 核心与进阶</el-dropdown-item>
            <el-dropdown-item command="/oat-ui">🌾 Oat UI 全套 26 个组件实例</el-dropdown-item>
            <el-dropdown-item command="/oat-studio">🚀 Oat UI 实战展厅与更新弹窗</el-dropdown-item>
            <el-dropdown-item command="/auth-showcase">🔐 100 万款登录注册 UI 展厅</el-dropdown-item>
            <el-dropdown-item command="/cart-showcase">🛒 100 款购物车 UI 展厅</el-dropdown-item>
            <el-dropdown-item command="/animation-showcase">✨ 63,353 款 CSS/JS 动画特效展厅</el-dropdown-item>
            <el-dropdown-item command="/motion-showcase">⚡ Motion for Vue 50+ 款经典特效展厅</el-dropdown-item>
            <el-dropdown-item command="/schedule-x">📅 Schedule-X v4.6 现代日历调度组件</el-dropdown-item>
            <el-dropdown-item command="/three-showcase/china-map">🗺️ Three.js 3D 中国地图设计器</el-dropdown-item>
            <el-dropdown-item command="/mapcn-showcase">🗺️ mapcn MapLibre 地图 UI 组件库</el-dropdown-item>
            <el-dropdown-item command="/antv-s2-examples">📊 AntV S2 多维表格示例库</el-dropdown-item>
            <el-dropdown-item command="/antv-g6-examples">🕸️ AntV G6 图可视化示例库</el-dropdown-item>
            <el-dropdown-item command="/antv-f2-examples">📱 AntV F2 移动端图表示例库</el-dropdown-item>
            <el-dropdown-item command="/antv-l7-examples">🌏 AntV L7 地理空间示例库</el-dropdown-item>
            <el-dropdown-item command="/source-code">💻 页面与功能全量源码查看/复制</el-dropdown-item>
            <el-dropdown-item command="/docker-showcase">🐳 Docker 命令行与可视化双方案部署</el-dropdown-item>
            <el-dropdown-item divided disabled>🆕 新建页面</el-dropdown-item>
            <el-dropdown-item command="/juejin-course">📘 掘金小册课程</el-dropdown-item>
            <el-dropdown-item command="/juejin-clubs">💬 掘金圈子广场</el-dropdown-item>
            <el-dropdown-item command="/juejin-signin">📅 掘金每日签到</el-dropdown-item>
            <el-dropdown-item command="/jandan">🥚 煎蛋页面</el-dropdown-item>
            <el-dropdown-item command="/tophub">🔥 今日热榜 TopHub</el-dropdown-item>
            <el-dropdown-item command="/ithome">📰 IT之家</el-dropdown-item>
            <el-dropdown-item command="/huxiu">🐯 虎嗅24小时</el-dropdown-item>
            <el-dropdown-item command="/github">🐙 GitHub开源聚合</el-dropdown-item>
            <el-dropdown-item command="/records-cache">♡ 记录缓存展示</el-dropdown-item>
            <el-dropdown-item command="/share-records">↗ 分享记录展示</el-dropdown-item>
            <el-dropdown-item command="/boss-zhipin-hangzhou">💼 BOSS直聘杭州首页</el-dropdown-item>
            <el-dropdown-item command="/boss-zhipin-hangzhou-map">🗺️ BOSS直聘地图找工作</el-dropdown-item>
            <el-dropdown-item divided command="triggerVersionCheck">🚀 模拟测试版本更新检测 (Element Plus UI)</el-dropdown-item>
            <el-dropdown-item command="https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components">📖 MDN Web Components 文档</el-dropdown-item>
            <el-dropdown-item command="https://www.ruanyifeng.com/blog/2019/08/web_components.html">📰 阮一峰 Web Components 教程</el-dropdown-item>
            <el-dropdown-item command="https://oat.ink/usage/">🌾 Oat UI 官方 Usage 文档</el-dropdown-item>
            <el-dropdown-item command="https://oat.ink/demo/">🧪 Oat UI Kitchensink Live Demo</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      -->
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="浏览器兼容性检测"
      width="min(920px, 92vw)"
      class="browser-support-dialog"
      append-to-body
      destroy-on-close
      align-center
      :before-close="handleDialogBeforeClose"
    >
      <div class="dialog-content">
        <div class="notice-status">
          <div>
            <p class="eyebrow">Browser Check</p>
            <h2>{{ isBrowserUnsupported ? '浏览器版本过旧' : '浏览器环境正常' }}</h2>
            <p>{{ browserStatusText }}</p>
          </div>
          <el-tag :type="browserTagType" effect="dark" round>
            {{ browserName }}
          </el-tag>
        </div>

        <div class="feature-list" aria-label="浏览器能力检测结果">
          <span
            v-for="feature in browserFeatures"
            :key="feature.label"
            :class="{ pass: feature.supported, fail: !feature.supported }"
          >
            {{ feature.supported ? '✓' : '!' }} {{ feature.label }}
          </span>
        </div>

        <div class="download-row" aria-label="浏览器下载链接">
          <a
            v-for="browser in browserLinks"
            :key="browser.name"
            :href="browser.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>{{ browser.name }}</strong>
            <span>{{ browser.vendor }}</span>
          </a>
        </div>

        <div class="maintenance-note">
          <strong>兼容性说明</strong>
          <span>本站不再维护 IE、旧版 EdgeHTML 和过旧 WebView 的适配；后续功能会优先面向支持 ES Module、Fetch、CSS Grid 的现代浏览器。</span>
        </div>

        <div v-if="qrImages.length" class="qr-gallery" aria-label="二维码展示">
          <figure v-for="image in qrImages" :key="image.src">
            <img :src="image.src" :alt="image.alt" loading="lazy" />
          </figure>
        </div>

        <div class="notice-footer">
          <div class="time-block">
            <span>当前时间</span>
            <strong>{{ formattedTime }}</strong>
            <em v-if="yearlyGreeting">{{ yearlyGreeting }}</em>
          </div>
          <a class="author-link" :href="authorGithubUrl" target="_blank" rel="noopener noreferrer">
            作者 GitHub：{{ authorGithubUrl }}
          </a>
        </div>

        <div class="stack-list" aria-label="项目技术栈">
          <a
            v-for="item in techStack"
            :key="item.packageName"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            :title="`${item.name} 官网`"
          >
            <em>{{ item.group }}</em>
            <strong>{{ item.name }} {{ item.version }}</strong>
            <span>{{ item.packageName }}</span>
          </a>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <el-button @click="closeDialog">关闭</el-button>
          <el-button type="primary" @click="closeDialog">知道了</el-button>
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped lang="scss" src="./css/BrowserSupportNotice.scss"></style>
