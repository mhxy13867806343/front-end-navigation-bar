<script setup lang="ts">
import { computed, watch, ref, type ComputedRef, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import {
  BROWSER_DOWNLOAD_LINKS,
  CLOSE_TIP_STORAGE_KEY,
  AUTHOR_GITHUB_URL,
  type BrowserDownloadLink,
  type BrowserFeatureCheck
} from '@/constants/browserSupport'
import {
  buildTechStack,
  type TechStackItem
} from '@/constants/techStack'
import {
  webLibraryGroups,
  buildWebLibraryTreeData,
  type WebLibraryGroup,
  type WebLibraryItem,
  type WebLibraryTreeNode
} from '@/constants/webLibrary'
import { triggerVersionNotice } from '../utils/versionPolling'
import packageJson from '../../package.json'
import WebLibraryItemBlock from './WebLibraryItemBlock.vue'

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

interface QrImage {
  src: string
  alt: string
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

const savedActiveGroup = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.WEB_LIBRARY_ACTIVE_GROUP) : null
const activeWebLibraryGroupId: Ref<string> = ref<string>(savedActiveGroup || 'new-pages')

watch(activeWebLibraryGroupId, (val: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WEB_LIBRARY_ACTIVE_GROUP, val)
  } catch {
    // localStorage unavailable
  }
})

const qrImageModules: Record<string, string> = import.meta.glob('../assets/qc/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url'
}) as Record<string, string>

const browserLinks: BrowserDownloadLink[] = BROWSER_DOWNLOAD_LINKS

const packageMetadata: PackageMetadata = packageJson as PackageMetadata
const packageVersions: Record<string, string> = {
  ...packageMetadata.dependencies,
  ...packageMetadata.devDependencies
}

const activeWebLibraryGroup: ComputedRef<WebLibraryGroup> = computed<WebLibraryGroup>(() => {
  return webLibraryGroups.find((group: WebLibraryGroup): boolean => group.id === activeWebLibraryGroupId.value) || webLibraryGroups[0]
})

type ViewMode = 'tree' | 'split' | 'transfer' | 'carousel' | 'collapse' | 'tabs'

const savedViewMode = (typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.WEB_LIBRARY_VIEW_MODE) : null) as ViewMode | null
const initialViewMode: ViewMode = (savedViewMode && ['tree', 'split', 'transfer', 'carousel', 'collapse', 'tabs'].includes(savedViewMode)) ? savedViewMode : 'tabs'
const viewMode: Ref<ViewMode> = ref<ViewMode>(initialViewMode)

watch(viewMode, (val: ViewMode) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WEB_LIBRARY_VIEW_MODE, val)
  } catch {
    // localStorage unavailable
  }
})

const webLibrarySearchQuery: Ref<string> = ref<string>('')

function loadInitialSearchHistory(): string[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEB_LIBRARY_SEARCH_HISTORY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const searchHistoryList: Ref<string[]> = ref<string[]>(loadInitialSearchHistory())

function saveSearchHistory(query: string): void {
  const trimmed = query.trim()
  if (!trimmed) return
  searchHistoryList.value = [trimmed, ...searchHistoryList.value.filter((item: string): boolean => item !== trimmed)].slice(0, 10)
  try {
    localStorage.setItem(STORAGE_KEYS.WEB_LIBRARY_SEARCH_HISTORY, JSON.stringify(searchHistoryList.value))
  } catch {
    // localStorage unavailable
  }
}

function removeHistoryItem(term: string): void {
  searchHistoryList.value = searchHistoryList.value.filter((item: string): boolean => item !== term)
  try {
    localStorage.setItem(STORAGE_KEYS.WEB_LIBRARY_SEARCH_HISTORY, JSON.stringify(searchHistoryList.value))
  } catch {
    // localStorage unavailable
  }
}

function clearSearchHistory(): void {
  searchHistoryList.value = []
  try {
    localStorage.removeItem(STORAGE_KEYS.WEB_LIBRARY_SEARCH_HISTORY)
  } catch {
    // localStorage unavailable
  }
}

function confirmClearSearchHistory(): void {
  if (!searchHistoryList.value.length) {
    ElMessage.info('暂无搜索历史记录')
    return
  }

  ElMessageBox.confirm('确定要清空全部 Web 组件与导航搜索历史记录吗？', '清空历史提示', {
    confirmButtonText: '确定清空',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then((): void => {
      clearSearchHistory()
      ElMessage.success('已成功清空全部搜索历史记录')
    })
    .catch((): void => {
      // 用户取消
    })
}

function onSearchSelectChange(val: string): void {
  if (val && val.trim()) {
    saveSearchHistory(val)
  }
}

const hotSearchRecommendations: string[] = [
  '哔哩哔哩直播',
  '掘金小册课程',
  'BOSS直聘',
  'Three.js 3D 地图',
  'CSS 动画特效',
  'AntV 图表',
  'Oat UI',
  'Web Components',
  'Docker 部署'
]

function applyHistoryQuery(term: string): void {
  webLibrarySearchQuery.value = term
}

function filterItemRecursive(item: WebLibraryItem, q: string): WebLibraryItem | null {
  const labelMatches = item.label.toLowerCase().includes(q)
  const matchedChildren = item.children
    ? item.children.map((sub: WebLibraryItem): WebLibraryItem | null => filterItemRecursive(sub, q)).filter((sub: WebLibraryItem | null): sub is WebLibraryItem => sub !== null)
    : undefined

  if (labelMatches || (matchedChildren && matchedChildren.length > 0)) {
    return {
      ...item,
      children: matchedChildren && matchedChildren.length > 0 ? matchedChildren : item.children
    }
  }
  return null
}

const filteredWebLibraryGroups: ComputedRef<WebLibraryGroup[]> = computed<WebLibraryGroup[]>(() => {
  const q: string = webLibrarySearchQuery.value.trim().toLowerCase()
  if (!q) return webLibraryGroups

  return webLibraryGroups
    .map((group: WebLibraryGroup): WebLibraryGroup | null => {
      const groupMatches: boolean = group.title.toLowerCase().includes(q)
      const matchedItems: WebLibraryItem[] = group.items
        .map((item: WebLibraryItem): WebLibraryItem | null => filterItemRecursive(item, q))
        .filter((item: WebLibraryItem | null): item is WebLibraryItem => item !== null)

      if (groupMatches || matchedItems.length > 0) {
        return {
          ...group,
          items: matchedItems.length > 0 ? matchedItems : group.items
        }
      }
      return null
    })
    .filter((g: WebLibraryGroup | null): g is WebLibraryGroup => g !== null)
})

const transferSearchQuery: Ref<string> = ref<string>('')
const activeCollapseNames: Ref<string[]> = ref<string[]>(webLibraryGroups.map((g: WebLibraryGroup): string => g.id))

const tabsPosition: Ref<'top' | 'left' | 'right' | 'bottom'> = ref<'top' | 'left' | 'right' | 'bottom'>('top')
const tabsType: Ref<'border-card' | 'card' | ''> = ref<'border-card' | 'card' | ''>('border-card')

const filteredTransferGroups: ComputedRef<WebLibraryGroup[]> = computed<WebLibraryGroup[]>(() => {
  const subQ = transferSearchQuery.value.trim().toLowerCase()
  if (!subQ) return filteredWebLibraryGroups.value

  return filteredWebLibraryGroups.value.filter(
    (g: WebLibraryGroup): boolean =>
      g.title.toLowerCase().includes(subQ) ||
      g.items.some((i: WebLibraryItem): boolean => i.label.toLowerCase().includes(subQ))
  )
})

const filteredTransferItems: ComputedRef<WebLibraryItem[]> = computed<WebLibraryItem[]>(() => {
  const group = filteredWebLibraryGroups.value.find((g: WebLibraryGroup): boolean => g.id === activeWebLibraryGroupId.value) || filteredWebLibraryGroups.value[0]
  if (!group) return []
  const items: WebLibraryItem[] = group.items
  const subQ: string = transferSearchQuery.value.trim().toLowerCase()
  if (!subQ) return items
  return items.filter((i: WebLibraryItem): boolean => i.label.toLowerCase().includes(subQ))
})

const treeData: ComputedRef<WebLibraryTreeNode[]> = computed<WebLibraryTreeNode[]>(() => {
  const rawTree = buildWebLibraryTreeData()
  const q = webLibrarySearchQuery.value.trim().toLowerCase()
  if (!q) return rawTree

  function filterTreeNode(node: WebLibraryTreeNode): WebLibraryTreeNode | null {
    const labelMatches = node.label.toLowerCase().includes(q)
    const filteredChildren = node.children
      ? node.children.map(filterTreeNode).filter((c: WebLibraryTreeNode | null): c is WebLibraryTreeNode => c !== null)
      : undefined

    if (labelMatches || (filteredChildren && filteredChildren.length > 0)) {
      return {
        ...node,
        children: filteredChildren
      }
    }
    return null
  }

  return rawTree.map(filterTreeNode).filter((n: WebLibraryTreeNode | null): n is WebLibraryTreeNode => n !== null)
})

const handleTreeNodeClick = (node: WebLibraryTreeNode): void => {
  if (node.command) {
    handleCommand(node.command)
  }
}

const techStack: TechStackItem[] = buildTechStack(packageVersions)

const qrImages: QrImage[] = Object.entries(qrImageModules)
  .sort(([leftPath]: [string, string], [rightPath]: [string, string]): number => leftPath.localeCompare(rightPath))
  .map(([filePath, src]: [string, string], index: number): QrImage => {
    const fileName: string = filePath.split('/').pop() || `qr-${index + 1}`
    return {
      src,
      alt: `二维码 ${index + 1}：${fileName}`
    }
  })

const authorGithubUrl: string = AUTHOR_GITHUB_URL
const closeTipStorageKey: string = CLOSE_TIP_STORAGE_KEY
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
    <div class="bar-copy" @click="dialogVisible = true" title="点击查看环境检测与项目运行说明">
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

          <!-- 全局 ElSelect 搜索框 (支持可清空、可过滤、下拉历史与模态确认清空) -->
          <div class="web-library-global-search">
            <div class="search-input-row">
              <el-select
                v-model="webLibrarySearchQuery"
                filterable
                clearable
                allow-create
                default-first-option
                placeholder="🔍 搜索 Web 组件/微应用/子页面 (支持关键词下拉推荐与历史记录)..."
                size="small"
                class="global-search-select"
                @change="onSearchSelectChange"
                @clear="webLibrarySearchQuery = ''"
              >
                <!-- 下拉顶部：历史记录统计与清空操作按钮 -->
                <template #header>
                  <div class="select-dropdown-header">
                    <span class="header-text">
                      {{ searchHistoryList.length ? `🕒 历史搜索记录 (${searchHistoryList.length})` : '💡 暂无历史记录，搜索后自动累积' }}
                    </span>
                    <el-button
                      v-if="searchHistoryList.length > 0"
                      type="danger"
                      link
                      size="small"
                      class="clear-link-btn"
                      @click.stop="confirmClearSearchHistory"
                    >
                      🗑️ 清空历史
                    </el-button>
                  </div>
                </template>

                <!-- 历史搜索记录 -->
                <el-option-group v-if="searchHistoryList.length > 0" label="历史搜索">
                  <el-option
                    v-for="term in searchHistoryList"
                    :key="`history-${term}`"
                    :label="term"
                    :value="term"
                  >
                    <div class="history-option-row">
                      <span>🕒 {{ term }}</span>
                      <span class="remove-history-icon" title="删除此条" @click.stop="removeHistoryItem(term)">✕</span>
                    </div>
                  </el-option>
                </el-option-group>

                <!-- 热门搜索推荐 -->
                <el-option-group label="全站热搜推荐">
                  <el-option
                    v-for="rec in hotSearchRecommendations"
                    :key="`rec-${rec}`"
                    :label="rec"
                    :value="rec"
                  >
                    🔥 {{ rec }}
                  </el-option>
                </el-option-group>
              </el-select>

              <el-button
                v-if="webLibrarySearchQuery.trim()"
                type="primary"
                size="small"
                plain
                class="save-search-btn"
                @click="saveSearchHistory(webLibrarySearchQuery)"
              >
                保存历史
              </el-button>
            </div>

            <div v-if="searchHistoryList.length > 0" class="search-history-bar">
              <span class="history-label">🕒 历史搜索：</span>
              <div class="history-tags">
                <el-tag
                  v-for="item in searchHistoryList"
                  :key="item"
                  size="small"
                  effect="plain"
                  round
                  closable
                  class="history-tag"
                  @click="applyHistoryQuery(item)"
                  @close="removeHistoryItem(item)"
                >
                  {{ item }}
                </el-tag>
              </div>
              <button type="button" class="clear-history-btn" @click="confirmClearSearchHistory" title="清空全部搜索历史">
                🗑️ 清空历史
              </button>
            </div>
          </div>

          <div v-if="!filteredWebLibraryGroups.length" class="web-library-empty-tip">
            🔍 未检索到匹配的 Web 组件或导航页面，请尝试调整关键词。
          </div>

          <!-- 模式 1：树形结构 -->
          <div v-else-if="viewMode === 'tree'" class="web-library-tree-wrapper">
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
                  >边框卡片</button>
                  <button
                    type="button"
                    class="mini-btn"
                    :class="{ active: tabsType === 'card' }"
                    @click="tabsType = 'card'"
                  >选项卡片</button>
                  <button
                    type="button"
                    class="mini-btn"
                    :class="{ active: tabsType === '' }"
                    @click="tabsType = ''"
                  >基础下划线</button>
                </div>
              </div>
            </div>

            <el-tabs
              v-model="activeWebLibraryGroupId"
              :tab-position="tabsPosition"
              :type="tabsType"
              class="web-library-el-tabs"
            >
              <el-tab-pane
                v-for="group in filteredWebLibraryGroups"
                :key="group.id"
                :name="group.id"
              >
                <template #label>
                  <span class="tab-label-custom">
                    {{ group.icon }} {{ group.title }}
                  </span>
                </template>

                <div class="web-library-items-grid">
                  <WebLibraryItemBlock
                    v-for="(item, idx) in group.items"
                    :key="`${group.id}-${idx}`"
                    :item="item"
                    @command="handleCommand"
                  />
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 模式 2：悬停分栏 (Split View) -->
          <div v-else-if="viewMode === 'split'" class="web-library-split-wrapper">
            <div class="web-library-sidebar">
              <button
                v-for="group in filteredWebLibraryGroups"
                :key="group.id"
                type="button"
                class="group-tab-btn"
                :class="{ active: activeWebLibraryGroupId === group.id }"
                @click="activeWebLibraryGroupId = group.id"
              >
                <span class="group-icon">{{ group.icon }}</span>
                <span class="group-title">{{ group.title }}</span>
                <span class="group-count">{{ group.items.length }}</span>
              </button>
            </div>
            <div class="web-library-content">
              <div class="group-header">
                <span class="header-icon">{{ activeWebLibraryGroup.icon }}</span>
                <h3 class="header-title">{{ activeWebLibraryGroup.title }}</h3>
                <span class="header-badge">{{ activeWebLibraryGroup.items.length }} 个项目</span>
              </div>
              <div class="web-library-items-grid">
                <WebLibraryItemBlock
                  v-for="(item, idx) in activeWebLibraryGroup.items"
                  :key="`${activeWebLibraryGroup.id}-${idx}`"
                  :item="item"
                  @command="handleCommand"
                />
              </div>
            </div>
          </div>

          <!-- 模式 3：双列表穿梭过滤 (Transfer View) -->
          <div v-else-if="viewMode === 'transfer'" class="web-library-transfer-wrapper">
            <div class="transfer-filter-bar">
              <el-input
                v-model="transferSearchQuery"
                placeholder="🔍 在当前选中的分类面板内进行二次精细筛选..."
                clearable
                size="small"
                class="transfer-search-input"
              />
            </div>
            <div class="transfer-panels">
              <div class="transfer-panel left-panel">
                <div class="panel-header">📌 选择分类模块</div>
                <div class="panel-list">
                  <button
                    v-for="group in filteredTransferGroups"
                    :key="group.id"
                    type="button"
                    class="transfer-item"
                    :class="{ active: activeWebLibraryGroupId === group.id }"
                    @click="activeWebLibraryGroupId = group.id"
                  >
                    <span>{{ group.icon }} {{ group.title }}</span>
                    <span class="item-badge">{{ group.items.length }}</span>
                  </button>
                </div>
              </div>
              <div class="transfer-arrow">➔</div>
              <div class="transfer-panel right-panel">
                <div class="panel-header">🚀 包含子导航与应用 ({{ activeWebLibraryGroup.title }})</div>
                <div class="panel-list">
                  <div v-if="!filteredTransferItems.length" class="empty-tip">未搜索到匹配项</div>
                  <WebLibraryItemBlock
                    v-for="(item, idx) in filteredTransferItems"
                    :key="`${activeWebLibraryGroup.id}-${idx}`"
                    :item="item"
                    @command="handleCommand"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 模式 4：走马灯轮播 (Carousel View) -->
          <div v-else-if="viewMode === 'carousel'" class="web-library-carousel-wrapper">
            <el-carousel :interval="6000" type="card" height="320px" indicator-position="outside">
              <el-carousel-item v-for="group in filteredWebLibraryGroups" :key="group.id">
                <div class="carousel-card-inner">
                  <div class="carousel-card-header">
                    <span class="card-icon">{{ group.icon }}</span>
                    <h3 class="card-title">{{ group.title }}</h3>
                  </div>
                  <div class="carousel-items-scroll">
                    <WebLibraryItemBlock
                      v-for="(item, idx) in group.items"
                      :key="`${group.id}-${idx}`"
                      :item="item"
                      @command="handleCommand"
                    />
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>

          <!-- 模式 5：折叠面板 (Collapse View) -->
          <div v-else-if="viewMode === 'collapse'" class="web-library-collapse-wrapper">
            <el-collapse v-model="activeCollapseNames">
              <el-collapse-item
                v-for="group in filteredWebLibraryGroups"
                :key="group.id"
                :name="group.id"
              >
                <template #title>
                  <div class="collapse-title-custom">
                    <span>{{ group.icon }} {{ group.title }}</span>
                    <el-tag size="small" type="info" round class="ml-2">{{ group.items.length }} 项</el-tag>
                  </div>
                </template>
                <div class="web-library-items-grid">
                  <WebLibraryItemBlock
                    v-for="(item, idx) in group.items"
                    :key="`${group.id}-${idx}`"
                    :item="item"
                    @command="handleCommand"
                  />
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-popover>

    </div>
  </section>

  <el-dialog
    v-model="dialogVisible"
    title="💡 现代浏览器能力检测与项目运行说明"
    width="680px"
    destroy-on-close
    align-center
    append-to-body
    class="browser-support-dialog"
    :before-close="handleDialogBeforeClose"
  >
    <div class="dialog-body">
      <el-alert
        :type="browserTagType"
        :closable="false"
        show-icon
        class="dialog-alert"
      >
        <template #title>
          <strong>{{ browserStatusText }}</strong>
        </template>
        <template #default>
          <p class="alert-sub">检测时间：{{ formattedTime }}</p>
        </template>
      </el-alert>

      <p v-if="yearlyGreeting" class="yearly-greeting">{{ yearlyGreeting }}</p>

      <div class="dialog-section">
        <h3>关键技术栈依赖</h3>
        <ul class="tech-stack-list">
          <li v-for="item in techStack" :key="item.name" class="tech-stack-item">
            <div class="tech-name">
              <strong>{{ item.name }}</strong>
              <el-tag size="small" type="info" effect="plain">{{ item.group }}</el-tag>
            </div>
            <div class="tech-meta">
              <span class="tech-version">v{{ item.version }}</span>
              <a :href="item.url" target="_blank" rel="noopener noreferrer" class="tech-link">官方文档 ↗</a>
            </div>
          </li>
        </ul>
      </div>

      <div class="dialog-section">
        <h3>推荐使用的现代浏览器</h3>
        <p class="section-tip">若发现页面渲染异常、图表缺失或交互失效，请下载安装以下最新版浏览器：</p>
        <ul class="browser-links">
          <li v-for="item in browserLinks" :key="item.name">
            <a :href="item.url" target="_blank" rel="noopener noreferrer">
              <span>{{ item.name }}</span>
              <small>({{ item.vendor }})</small>
            </a>
          </li>
        </ul>
      </div>

      <div v-if="qrImages.length > 0" class="dialog-section">
        <h3>项目说明与扫码入口</h3>
        <div class="qr-grid">
          <figure v-for="(qr, idx) in qrImages" :key="idx" class="qr-item">
            <img :src="qr.src" :alt="qr.alt" loading="lazy" />
            <figcaption>{{ qr.alt }}</figcaption>
          </figure>
        </div>
      </div>

      <div class="dialog-section footer-meta">
        <p>作者 GitHub 地址：<a :href="authorGithubUrl" target="_blank" rel="noopener noreferrer">{{ authorGithubUrl }}</a></p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="closeDialog">我已了解</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss" src="./css/BrowserSupportNotice.scss"></style>
