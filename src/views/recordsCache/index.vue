<script setup lang="ts">
import versionHistoryData from '@/ajson/version-history.json'
import {
  BOSS_CITY_CACHE_FILE,
  JUEJIN_CLUBS_CACHE_FILE,
  JUEJIN_COURSE_CACHE_FILE,
  JUEJIN_RANK_CACHE_FILE,
  buildLiveDataUrl
} from '@/constants/liveData'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

type RecordKind = 'page' | 'live-cache' | 'local-cache' | 'history' | 'content-favorite'

interface RecordEntry {
  id: string
  kind: RecordKind
  title: string
  subtitle: string
  desc: string
  route?: string
  url?: string
  storageKey?: string
  count: number
  tags: string[]
  updatedAt?: string
}

interface PageFavoriteEntry {
  title: string
  path: string
  timestamp: number
}

interface RecordFavoriteEntry {
  title: string
  kind: RecordKind
  timestamp: number
}

interface ContentItemFavoriteEntry {
  title: string
  source: string
  url: string
  summary: string
  image?: string
  timestamp: number
  tags: string[]
}

interface VersionHistoryData {
  generatedAt: string
  groups: Array<{
    date: string
    items: unknown[]
  }>
}

const router = useRouter()
const isRefreshing = ref<boolean>(true)
const localCacheEntries = ref<RecordEntry[]>([])
const pageFavorites = ref<Record<string, PageFavoriteEntry>>({})
const recordFavorites = ref<Record<string, RecordFavoriteEntry>>({})
const contentItemFavorites = ref<Record<string, ContentItemFavoriteEntry>>({})
let refreshTimer: number | null = null

const pageEntries: RecordEntry[] = [
  { id: 'page-ai-xxx', kind: 'page', title: 'AI教程资源', subtitle: 'ai-xxx', desc: 'AI项目研究、教程专栏、百问百答、百科和名人堂统一入口。', route: '/ai-xxx/ai-column', count: 5, tags: ['AI', '教程', '百科', '研究'] },
  { id: 'page-jandan', kind: 'page', title: '煎蛋页面', subtitle: 'jandan', desc: '首页、树洞、女装、随手拍、无聊图、鱼塘、热榜、大吐槽内部聚合。', route: '/jandan', count: 8, tags: ['煎蛋', '分页', '图片', '社区'] },
  { id: 'page-tophub', kind: 'page', title: '今日热榜 TopHub', subtitle: 'tophub', desc: '综合、科技、娱乐、社区、购物、财经、开发、简报、AI等榜单。', route: '/tophub', count: 10, tags: ['热榜', '二级分类', '分页', '榜单'] },
  { id: 'page-ithome', kind: 'page', title: 'IT之家', subtitle: 'ithome', desc: 'IT资讯、业界、网络、评论、人物、活动互动等栏目内部展示。', route: '/ithome', count: 13, tags: ['IT之家', '资讯', '栏目', '分页'] },
  { id: 'page-huxiu', kind: 'page', title: '虎嗅 24小时', subtitle: 'huxiu', desc: '关注、最新、看重点、大公司、财经动态、看世界、硅谷动态。', route: '/huxiu', count: 7, tags: ['虎嗅', '动态', '分页', '24小时'] },
  { id: 'page-github', kind: 'page', title: 'GitHub开源聚合', subtitle: 'github', desc: 'GitCN、Githot、HelloGitHub 月刊和归档分类统一入口。', route: '/github', count: 5, tags: ['GitHub', 'GitCN', 'Githot', 'HelloGitHub'] },
  { id: 'page-juejin-course', kind: 'page', title: '掘金小册课程', subtitle: 'juejin-course', desc: '小册分类、价格排序、VIP筛选和课程缓存展示入口。', route: '/juejin-course', count: 4, tags: ['掘金', '小册', '缓存', '课程'] },
  { id: 'page-juejin-clubs', kind: 'page', title: '掘金圈子广场', subtitle: 'juejin-clubs', desc: '推荐、全部、分类和搜索缓存入口。', route: '/juejin-clubs', count: 4, tags: ['掘金', '圈子', '缓存', '社区'] },
  { id: 'page-boss', kind: 'page', title: 'BOSS直聘杭州', subtitle: 'boss-zhipin', desc: '城市、职位、行业缓存与招聘入口。', route: '/boss-zhipin-hangzhou', count: 4, tags: ['BOSS', '城市', '职位', '缓存'] },
  { id: 'page-mingyan', kind: 'page', title: '名人名言收藏库', subtitle: 'mingyan', desc: '金句、诗词、情话、谜语、表情包等本地收藏记录入口。', route: '/mingyan', count: 6, tags: ['收藏', '金句', '诗词', '记录'] },
  { id: 'page-toolbox', kind: 'page', title: '工具集合', subtitle: 'toolbox', desc: '运行代码、终端、API中心等开发类页面中转入口。', route: '/toolbox', count: 3, tags: ['工具', '中转', '页面'] },
  { id: 'page-records-cache', kind: 'page', title: '记录缓存展示页', subtitle: 'records-cache', desc: '云标签和双列卡片统一展示收藏、历史记录与缓存入口。', route: '/records-cache', count: 2, tags: ['记录', '缓存', '云标签', '收藏'] }
]

const liveCacheEntries: RecordEntry[] = [
  { id: 'live-juejin-rank', kind: 'live-cache', title: '掘金榜单缓存', subtitle: JUEJIN_RANK_CACHE_FILE, desc: '文章榜、作者榜、专栏榜和收藏集榜单缓存文件。', route: '/juejin-theme', url: buildLiveDataUrl(JUEJIN_RANK_CACHE_FILE), count: 4, tags: ['live-data', '掘金', '榜单', '缓存'] },
  { id: 'live-juejin-course', kind: 'live-cache', title: '掘金小册缓存', subtitle: JUEJIN_COURSE_CACHE_FILE, desc: '小册分类和各筛选组合课程列表缓存。', route: '/juejin-course', url: buildLiveDataUrl(JUEJIN_COURSE_CACHE_FILE), count: 2, tags: ['live-data', '掘金', '小册', '缓存'] },
  { id: 'live-juejin-clubs', kind: 'live-cache', title: '掘金圈子缓存', subtitle: JUEJIN_CLUBS_CACHE_FILE, desc: '推荐、全部、分类、搜索四类圈子数据缓存。', route: '/juejin-clubs', url: buildLiveDataUrl(JUEJIN_CLUBS_CACHE_FILE), count: 4, tags: ['live-data', '掘金', '圈子', '缓存'] },
  { id: 'live-boss-city', kind: 'live-cache', title: 'BOSS城市职位缓存', subtitle: BOSS_CITY_CACHE_FILE, desc: '热门城市、城市字母组、职位分类和行业分类缓存。', route: '/boss-zhipin-hangzhou', url: buildLiveDataUrl(BOSS_CITY_CACHE_FILE), count: 4, tags: ['live-data', 'BOSS', '城市', '职位'] }
]

const versionData = versionHistoryData as VersionHistoryData

const storageKeyLabels: Record<string, string> = {
  likedItemsInfo: '历史爱心工具记录',
  searchHistory: '站内搜索历史',
  activeItem: '最近导航分类',
  gridCols: '工具卡片列数',
  customBackgroundUrl: '自定义背景图',
  favorite_mingyan_quotes: '金句收藏库',
  favorite_qinghua_list: '情话收藏库',
  favorite_riddle_list: '谜语收藏库',
  favorite_shici_list: '古诗词收藏库',
  favorite_doutu_list: '表情包收藏库',
  pinyin_convert_history: '拼音转换历史',
  doutu_search_history: '表情包搜索历史',
  [STORAGE_KEYS.PAGE_FAVORITES]: '独立页面收藏',
  [STORAGE_KEYS.RECORD_CACHE_FAVORITES]: '记录缓存卡片收藏',
  [STORAGE_KEYS.CONTENT_ITEM_FAVORITES]: '列表内容收藏'
}

const keyRouteHints: Array<[RegExp, string]> = [
  [/mingyan|quote|qinghua|riddle|shici|doutu|pinyin/i, '/mingyan'],
  [/searchHistory|likedItemsInfo/i, '/records-cache'],
  [/BOSS_SELECTED_CITY|boss/i, '/boss-zhipin-hangzhou'],
  [/SCHEDULE_X/i, '/schedule-x'],
  [/WEB_COMPONENTS/i, '/web-components'],
  [/OAT_STUDIO/i, '/oat-studio']
]

function parseStorageValue(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function countStorageValue(value: unknown): number {
  if (Array.isArray(value)) return value.length
  if (value && typeof value === 'object') return Object.keys(value).length
  if (typeof value === 'string') return value ? 1 : 0
  return value === null || value === undefined ? 0 : 1
}

function describeStorageValue(value: unknown): string {
  if (Array.isArray(value)) return `数组记录 ${value.length} 条`
  if (value && typeof value === 'object') return `对象字段 ${Object.keys(value).length} 个`
  if (typeof value === 'string') return value.length > 60 ? `${value.slice(0, 60)}...` : value || '空字符串'
  return value === null || value === undefined ? '暂无值' : String(value)
}

function shouldIncludeStorageKey(key: string): boolean {
  return /history|cache|favorite|liked|HOOKSVUE|activeItem|gridCols|customBackgroundUrl/i.test(key)
}

function resolveStorageRoute(key: string): string {
  return keyRouteHints.find(([pattern]: [RegExp, string]): boolean => pattern.test(key))?.[1] || '/records-cache'
}

function loadLocalCaches(): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  const nextEntries: RecordEntry[] = []

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (!key || !shouldIncludeStorageKey(key)) continue
    const raw = window.localStorage.getItem(key)
    if (raw === null) continue
    const parsed = parseStorageValue(raw)
    nextEntries.push({
      id: `local-${key}`,
      kind: 'local-cache',
      title: storageKeyLabels[key] || key,
      subtitle: key,
      desc: describeStorageValue(parsed),
      route: resolveStorageRoute(key),
      storageKey: key,
      count: countStorageValue(parsed),
      tags: ['localStorage', key.includes('favorite') || key.includes('liked') ? '收藏' : '记录', countStorageValue(parsed) > 0 ? '有数据' : '空记录']
    })
  }

  localCacheEntries.value = nextEntries.sort((left: RecordEntry, right: RecordEntry): number => right.count - left.count || left.title.localeCompare(right.title))
}

function readJsonObject<T>(key: string): Record<string, T> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(key) || '{}') as Record<string, T>
  } catch {
    return {}
  }
}

function saveJsonObject<T>(key: string, value: Record<string, T>): void {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function loadFavorites(): void {
  pageFavorites.value = readJsonObject<PageFavoriteEntry>(STORAGE_KEYS.PAGE_FAVORITES)
  recordFavorites.value = readJsonObject<RecordFavoriteEntry>(STORAGE_KEYS.RECORD_CACHE_FAVORITES)
  contentItemFavorites.value = readJsonObject<ContentItemFavoriteEntry>(STORAGE_KEYS.CONTENT_ITEM_FAVORITES)
}

function isPageFavorite(entry: RecordEntry): boolean {
  return Boolean(entry.route && pageFavorites.value[entry.route])
}

function isRecordFavorite(entry: RecordEntry): boolean {
  return Boolean(recordFavorites.value[entry.id])
}

function togglePageFavorite(entry: RecordEntry): void {
  if (!entry.route) return
  const next = { ...pageFavorites.value }
  if (next[entry.route]) {
    delete next[entry.route]
    ElMessage({ message: `已取消收藏页面：${entry.title}`, type: 'info', duration: 1200 })
  } else {
    next[entry.route] = {
      title: entry.title,
      path: entry.route,
      timestamp: Date.now()
    }
    ElMessage({ message: `已收藏页面：${entry.title}`, type: 'success', duration: 1200 })
  }
  pageFavorites.value = next
  saveJsonObject(STORAGE_KEYS.PAGE_FAVORITES, next)
  window.dispatchEvent(new CustomEvent('hooksvue-page-favorites-change'))
  loadLocalCaches()
}

function toggleRecordFavorite(entry: RecordEntry): void {
  const next = { ...recordFavorites.value }
  if (next[entry.id]) {
    delete next[entry.id]
    ElMessage({ message: `已取消收藏记录：${entry.title}`, type: 'info', duration: 1200 })
  } else {
    next[entry.id] = {
      title: entry.title,
      kind: entry.kind,
      timestamp: Date.now()
    }
    ElMessage({ message: `已收藏记录：${entry.title}`, type: 'success', duration: 1200 })
  }
  recordFavorites.value = next
  saveJsonObject(STORAGE_KEYS.RECORD_CACHE_FAVORITES, next)
  loadLocalCaches()
}

const versionEntry = computed<RecordEntry>(() => {
  const commitsCount = versionData.groups.reduce((sum: number, group): number => sum + group.items.length, 0)
  return {
    id: 'history-version',
    kind: 'history',
    title: '版本更新历史',
    subtitle: versionData.generatedAt,
    desc: `按日期整理 Git 提交历史，共 ${commitsCount} 条记录。`,
    route: '/records-cache',
    count: commitsCount,
    updatedAt: versionData.generatedAt,
    tags: ['版本', '历史', 'Git', '记录']
  }
})

const pageFavoriteEntries = computed<RecordEntry[]>(() => {
  return Object.values(pageFavorites.value)
    .sort((left: PageFavoriteEntry, right: PageFavoriteEntry): number => right.timestamp - left.timestamp)
    .map((favorite: PageFavoriteEntry): RecordEntry => ({
      id: `favorite-page-${favorite.path}`,
      kind: 'history',
      title: favorite.title,
      subtitle: favorite.path,
      desc: '已收藏的独立页面入口，可直接中转访问。',
      route: favorite.path,
      count: 1,
      updatedAt: new Date(favorite.timestamp).toLocaleString(),
      tags: ['页面收藏', '中转', '记录']
    }))
})

const contentFavoriteEntries = computed<RecordEntry[]>(() => {
  return Object.entries(contentItemFavorites.value)
    .sort(([, left]: [string, ContentItemFavoriteEntry], [, right]: [string, ContentItemFavoriteEntry]): number => right.timestamp - left.timestamp)
    .map(([id, favorite]: [string, ContentItemFavoriteEntry]): RecordEntry => ({
      id: `content-${id}`,
      kind: 'content-favorite',
      title: favorite.title,
      subtitle: favorite.source,
      desc: favorite.summary || '已收藏的列表内容，可直接中转访问。',
      url: favorite.url,
      count: 1,
      updatedAt: new Date(favorite.timestamp).toLocaleString(),
      tags: ['内容收藏', ...favorite.tags]
    }))
})

const allEntries = computed<RecordEntry[]>(() => [
  ...pageFavoriteEntries.value,
  ...contentFavoriteEntries.value,
  ...pageEntries,
  ...liveCacheEntries,
  ...localCacheEntries.value,
  versionEntry.value
])

const cloudTags = computed<Array<RecordEntry & { size: number; tone: number }>>(() => {
  const maxCount = Math.max(...allEntries.value.map((entry: RecordEntry): number => entry.count), 1)
  return allEntries.value.map((entry: RecordEntry, index: number) => ({
    ...entry,
    size: 13 + Math.min(15, Math.round((entry.count / maxCount) * 15)),
    tone: index % 6
  }))
})

const stats = computed(() => ({
  pages: pageEntries.length,
  liveCaches: liveCacheEntries.length,
  localCaches: localCacheEntries.value.length,
  favorites: Object.keys(pageFavorites.value).length + Object.keys(recordFavorites.value).length + Object.keys(contentItemFavorites.value).length
}))

function openEntry(entry: RecordEntry): void {
  if (isRefreshing.value) return
  if (entry.route) {
    void router.push(entry.route)
    return
  }
  if (entry.url) {
    window.open(entry.url, '_blank', 'noopener,noreferrer')
  }
}

function openRawCache(entry: RecordEntry): void {
  if (isRefreshing.value) return
  if (!entry.url) return
  window.open(entry.url, '_blank', 'noopener,noreferrer')
}

function runRecordRefresh(showToast: boolean): void {
  if (typeof window === 'undefined') return
  isRefreshing.value = true
  if (refreshTimer !== null) {
    window.clearTimeout(refreshTimer)
  }
  refreshTimer = window.setTimeout((): void => {
    loadFavorites()
    loadLocalCaches()
    isRefreshing.value = false
    refreshTimer = null
    if (showToast) {
      ElMessage({ message: '记录缓存已刷新', type: 'success', duration: 1200 })
    }
  }, 120)
}

function refreshRecords(): void {
  runRecordRefresh(true)
}

function handleExternalRecordChange(): void {
  runRecordRefresh(false)
}

onMounted(() => {
  runRecordRefresh(false)
  window.addEventListener('storage', handleExternalRecordChange)
  window.addEventListener('hooksvue-page-favorites-change', handleExternalRecordChange)
  window.addEventListener('hooksvue-content-favorites-change', handleExternalRecordChange)
})

onUnmounted(() => {
  if (refreshTimer !== null) {
    window.clearTimeout(refreshTimer)
  }
  window.removeEventListener('storage', handleExternalRecordChange)
  window.removeEventListener('hooksvue-page-favorites-change', handleExternalRecordChange)
  window.removeEventListener('hooksvue-content-favorites-change', handleExternalRecordChange)
})
</script>

<template>
  <main class="records-cache-page">
    <section class="records-hero">
      <div>
        <p class="eyebrow">RECORDS CACHE</p>
        <h1>记录缓存展示</h1>
        <p class="subtitle">把页面入口、本地记录、收藏数据和 live-data 缓存统一收进一个可收藏、可中转的展示页。</p>
      </div>
      <button class="refresh-btn" type="button" :disabled="isRefreshing" @click="refreshRecords">
        <el-icon><Refresh /></el-icon>
        {{ isRefreshing ? '加载中...' : '刷新记录' }}
      </button>
    </section>

    <section class="stats-strip" aria-label="记录缓存统计">
      <div><strong>{{ stats.pages }}</strong><span>页面入口</span></div>
      <div><strong>{{ stats.liveCaches }}</strong><span>构建缓存</span></div>
      <div><strong>{{ stats.localCaches }}</strong><span>本地记录</span></div>
      <div><strong>{{ stats.favorites }}</strong><span>已收藏</span></div>
    </section>

    <section class="cloud-panel" aria-label="云标签展示">
      <div v-if="isRefreshing" class="record-loading">正在加载记录缓存...</div>
      <template v-else>
        <button
          v-for="tag in cloudTags"
          :key="`tag-${tag.id}`"
          type="button"
          class="cloud-tag"
          :class="`tone-${tag.tone}`"
          :style="{ fontSize: `${tag.size}px` }"
          :disabled="isRefreshing"
          @click="openEntry(tag)"
        >
          <span>{{ tag.title }}</span>
          <small>{{ tag.count }}</small>
        </button>
      </template>
    </section>

    <section v-if="isRefreshing" class="record-loading large" aria-label="记录缓存加载状态">
      正在整理页面入口、收藏记录和缓存索引...
    </section>

    <section v-else class="records-grid" aria-label="双列记录卡片">
      <article v-for="entry in allEntries" :key="entry.id" class="record-card" @click="openEntry(entry)">
        <button
          type="button"
          class="record-heart"
          :class="{ active: entry.kind === 'page' ? isPageFavorite(entry) : isRecordFavorite(entry) }"
          :title="entry.kind === 'page' ? '收藏或取消收藏页面' : '收藏或取消收藏记录'"
          :disabled="isRefreshing"
          @click.stop="entry.kind === 'page' ? togglePageFavorite(entry) : toggleRecordFavorite(entry)"
        >
          <span>{{ (entry.kind === 'page' ? isPageFavorite(entry) : isRecordFavorite(entry)) ? '♥' : '♡' }}</span>
        </button>

        <div class="record-topline">
          <span class="record-kind">{{ entry.kind }}</span>
          <span class="record-count">{{ entry.count }} 条</span>
        </div>
        <h2>{{ entry.title }}</h2>
        <p class="record-subtitle">{{ entry.subtitle }}</p>
        <p class="record-desc">{{ entry.desc }}</p>
        <div class="record-tags">
          <span v-for="tag in entry.tags" :key="`${entry.id}-${tag}`">{{ tag }}</span>
        </div>
        <div class="record-actions">
          <button type="button" :disabled="isRefreshing" @click.stop="openEntry(entry)">中转进入</button>
          <button v-if="entry.url" type="button" class="ghost-action" :disabled="isRefreshing" @click.stop="openRawCache(entry)">查看缓存</button>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped lang="scss">
.records-cache-page {
  min-height: 100%;
  padding: 24px;
  color: var(--text-primary);
  background:
    linear-gradient(180deg, rgba(99, 102, 241, 0.08), transparent 280px),
    var(--bg-color);
}

.records-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  padding: 28px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--card-bg);
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
}

h1 {
  margin: 0;
  font-size: clamp(32px, 5vw, 58px);
  line-height: 1.05;
  letter-spacing: 0;
}

.subtitle {
  max-width: 760px;
  margin: 16px 0 0;
  color: var(--text-secondary);
  font-size: 17px;
  line-height: 1.7;
}

.refresh-btn,
.record-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  background: var(--hover-bg);
  font-weight: 800;
  cursor: pointer;
}

.refresh-btn:disabled,
.cloud-tag:disabled,
.record-heart:disabled,
.record-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.52;
  transform: none;
}

.refresh-btn:hover,
.record-actions button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.record-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 112px;
  width: 100%;
  color: var(--text-secondary);
  font-size: 18px;
  font-weight: 800;
}

.record-loading.large {
  min-height: 280px;
  margin-top: 18px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--card-bg);
}

.stats-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0;
}

.stats-strip div {
  min-height: 82px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--card-bg);
}

.stats-strip strong {
  display: block;
  font-size: 28px;
  line-height: 1;
}

.stats-strip span {
  display: block;
  margin-top: 10px;
  color: var(--text-secondary);
  font-weight: 700;
}

.cloud-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  min-height: 180px;
  padding: 24px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--card-bg);
}

.cloud-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0.42em 0.82em;
  border: 1px solid currentColor;
  border-radius: 999px;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
  font-weight: 900;
  letter-spacing: 0;
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease;
}

.cloud-tag:hover {
  transform: translateY(-2px);
  background: rgba(99, 102, 241, 0.16);
}

.cloud-tag small {
  font-size: 0.72em;
  opacity: 0.72;
}

.cloud-tag.tone-1 { color: #0ea5e9; background: rgba(14, 165, 233, 0.08); }
.cloud-tag.tone-2 { color: #10b981; background: rgba(16, 185, 129, 0.08); }
.cloud-tag.tone-3 { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
.cloud-tag.tone-4 { color: #ef4444; background: rgba(239, 68, 68, 0.08); }
.cloud-tag.tone-5 { color: #8b5cf6; background: rgba(139, 92, 246, 0.08); }

.records-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.record-card {
  position: relative;
  min-height: 260px;
  padding: 22px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--card-bg);
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.record-card:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.75);
}

.record-heart {
  position: absolute;
  top: 16px;
  right: 16px;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(244, 63, 94, 0.5);
  border-radius: 999px;
  color: #f43f5e;
  background: rgba(244, 63, 94, 0.08);
  font-size: 25px;
  line-height: 1;
  cursor: pointer;
}

.record-heart.active {
  color: #ffffff;
  background: #f43f5e;
  box-shadow: 0 0 0 6px rgba(244, 63, 94, 0.16);
}

.record-topline {
  display: flex;
  gap: 10px;
  padding-right: 52px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.record-count {
  color: var(--primary-color);
}

.record-card h2 {
  margin: 18px 56px 6px 0;
  font-size: 25px;
  line-height: 1.22;
  letter-spacing: 0;
}

.record-subtitle,
.record-desc {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.7;
}

.record-subtitle {
  font-size: 13px;
  font-weight: 800;
  word-break: break-all;
}

.record-desc {
  margin-top: 12px;
  min-height: 54px;
}

.record-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.record-tags span {
  padding: 4px 9px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  color: var(--text-secondary);
  background: var(--hover-bg);
  font-size: 12px;
  font-weight: 700;
}

.record-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.record-actions .ghost-action {
  background: transparent;
}

@media (max-width: 900px) {
  .records-cache-page {
    padding: 14px;
  }

  .records-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .stats-strip,
  .records-grid {
    grid-template-columns: 1fr;
  }
}
</style>
