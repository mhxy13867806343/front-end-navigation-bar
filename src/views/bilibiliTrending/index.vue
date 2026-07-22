<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resolveApiUrl } from '../../utils/resolveApiUrl'

type BilibiliTabId = 'popular' | 'weekly' | 'precious' | 'ranking' | 'music' | 'hot-search'

export interface BilibiliTrendingItem {
  position: number
  keyword: string
  show_name: string
  word_type: number
  call_reason?: number | string
  icon?: string
  hot_id?: number
  is_commercial?: string
  iconError?: boolean
}

type BilibiliTrendingApiItem = Partial<Omit<BilibiliTrendingItem, 'position' | 'word_type'>> & {
  position?: number | string
  word_type?: number | string
}

interface BilibiliApiResponse<T> {
  code: number
  message?: string
  data?: T
}

interface BilibiliVideoApiItem {
  aid?: number
  bvid?: string
  title?: string
  pic?: string
  cover?: string
  cover43?: string
  desc?: string
  duration?: number
  pubdate?: number
  tname?: string
  tnamev2?: string
  pid_name_v2?: string
  rcmd_reason?: string | { content?: string }
  achievement?: string
  owner?: {
    name?: string
    mid?: number
  }
  stat?: {
    view?: number
    vv?: number
    danmaku?: number
    reply?: number
    like?: number
  }
}

interface BilibiliPopularVideo {
  id: string
  position: number
  title: string
  cover: string
  ownerName: string
  category: string
  badge: string
  desc: string
  viewText: string
  danmakuText: string
  likeText: string
  durationText: string
  pubdateText: string
  url: string
}

interface WeeklySeriesItem {
  number: number
  subject: string
  name: string
  status: number
}

interface WeeklyDetailData {
  config?: {
    number?: number
    subject?: string
    name?: string
    label?: string
  }
  reminder?: string
  list?: BilibiliVideoApiItem[]
}

interface PopularListData {
  list?: BilibiliVideoApiItem[]
  no_more?: boolean
  note?: string
  explain?: string
}

const router = useRouter()
const activeTab = ref<BilibiliTabId>('popular')
const topList = ref<BilibiliTrendingItem[]>([])
const list = ref<BilibiliTrendingItem[]>([])
const popularItems = ref<BilibiliPopularVideo[]>([])
const weeklySeries = ref<WeeklySeriesItem[]>([])
const selectedWeeklyNumber = ref<number | null>(null)
const loading = ref<boolean>(false)
const searchQuery = ref<string>('')
const updateTime = ref<string>('')
const contentNote = ref<string>('')
const refreshCountdown = ref<number>(0)
const loadedTabs = new Set<BilibiliTabId>()
const tabNotes = new Map<BilibiliTabId, string>()
let refreshTimer: ReturnType<typeof setInterval> | null = null
const MANUAL_REFRESH_COOLDOWN_SECONDS = 60
const MIN_MANUAL_REFRESH_LOADING_MS = 600

const popularTabs: Array<{ id: BilibiliTabId; label: string; icon: string; description: string }> = [
  { id: 'popular', label: '综合热门', icon: '🔥', description: '各个领域中新奇好玩的优质内容都在这里' },
  { id: 'weekly', label: '每周必看', icon: '🗓️', description: 'B 站每周精选视频合集，支持切换期数' },
  { id: 'precious', label: '入站必刷', icon: '🏅', description: '经典高质量视频合集，新老用户都值得补一遍' },
  { id: 'ranking', label: '排行榜', icon: '📊', description: '全站综合排行榜，按内容质量与近期数据动态更新' },
  { id: 'music', label: '全站音乐榜', icon: '🎧', description: '音乐分区全站榜单，包含翻唱、原创、现场与歌单内容' },
  { id: 'hot-search', label: '搜索热搜榜', icon: '📺', description: '实时追踪 Bilibili 全站搜索热度焦点 Top 100' }
]

const currentTab = computed(() => popularTabs.find(tab => tab.id === activeTab.value) || popularTabs[0])
const isHotSearchTab = computed<boolean>(() => activeTab.value === 'hot-search')
const isRefreshDisabled = computed<boolean>(() => !isHotSearchTab.value || loading.value || refreshCountdown.value > 0)
const hasVideoContent = computed<boolean>(() => popularItems.value.length > 0)

const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

const formatNowTime = (): string => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}

const formatNumber = (value?: number): string => {
  const numberValue = Number(value || 0)
  if (numberValue >= 100000000) return `${(numberValue / 100000000).toFixed(1).replace(/\.0$/, '')}亿`
  if (numberValue >= 10000) return `${(numberValue / 10000).toFixed(1).replace(/\.0$/, '')}万`
  return String(numberValue)
}

const formatDuration = (seconds?: number): string => {
  const totalSeconds = Number(seconds || 0)
  const minutes = Math.floor(totalSeconds / 60)
  const restSeconds = totalSeconds % 60
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const restMinutes = minutes % 60
    return `${hours}:${restMinutes.toString().padStart(2, '0')}:${restSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${restSeconds.toString().padStart(2, '0')}`
}

const formatDate = (timestamp?: number): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  return `${date.getMonth() + 1}.${date.getDate().toString().padStart(2, '0')}`
}

const normalizeImageUrl = (url?: string): string => {
  if (!url) return ''
  if (url.startsWith('//')) return `https:${url}`
  return url.replace(/^http:/, 'https:')
}

const getVideoReason = (reason?: BilibiliVideoApiItem['rcmd_reason']): string => {
  if (!reason) return ''
  if (typeof reason === 'string') return reason
  return reason.content || ''
}

const normalizeVideoItems = (items: BilibiliVideoApiItem[], badgeFallback = ''): BilibiliPopularVideo[] =>
  items
    .filter(item => item.title && (item.bvid || item.aid))
    .map((item, index) => {
      const bvidOrAid = item.bvid || `av${item.aid}`
      const category = item.tnamev2 || item.tname || item.pid_name_v2 || 'Bilibili'
      const badge = getVideoReason(item.rcmd_reason) || item.achievement || badgeFallback || category

      return {
        id: `${bvidOrAid}-${index}`,
        position: index + 1,
        title: item.title || '未命名视频',
        cover: normalizeImageUrl(item.cover43 || item.pic || item.cover),
        ownerName: item.owner?.name || 'UP 主',
        category,
        badge,
        desc: item.desc || '',
        viewText: formatNumber(item.stat?.view ?? item.stat?.vv),
        danmakuText: formatNumber(item.stat?.danmaku),
        likeText: formatNumber(item.stat?.like),
        durationText: formatDuration(item.duration),
        pubdateText: formatDate(item.pubdate),
        url: `https://www.bilibili.com/video/${bvidOrAid}`
      }
    })

const getTrendingKey = (item: Pick<BilibiliTrendingItem, 'keyword' | 'hot_id'>): string =>
  item.hot_id ? `hot:${item.hot_id}` : `keyword:${item.keyword}`

const normalizeTrendingItems = (items: BilibiliTrendingApiItem[]): BilibiliTrendingItem[] =>
  items.map((item, index) => {
    const keyword = String(item.keyword || item.show_name || '').trim()
    const showName = String(item.show_name || item.keyword || keyword).trim()

    return {
      ...item,
      position: index + 1,
      keyword,
      show_name: showName,
      word_type: Number(item.word_type ?? item.call_reason ?? 8),
      iconError: false
    }
  })

const dedupeTrendingItems = (items: BilibiliTrendingItem[], excludedKeys = new Set<string>()): BilibiliTrendingItem[] => {
  const seen = new Set(excludedKeys)

  return items
    .filter(item => {
      if (!item.keyword) return false
      const key = getTrendingKey(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((item, index) => ({
      ...item,
      position: index + 1
    }))
}

const parseTrendingData = (data: { list?: BilibiliTrendingApiItem[]; top_list?: BilibiliTrendingApiItem[] }) => {
  const featured = dedupeTrendingItems(normalizeTrendingItems(Array.isArray(data.top_list) ? data.top_list : []))
  const featuredKeys = new Set(featured.map(item => getTrendingKey(item)))
  const ranking = dedupeTrendingItems(normalizeTrendingItems(Array.isArray(data.list) ? data.list : []), featuredKeys)

  return { featured, ranking }
}

const formatBilibiliIcon = (url?: string): string => {
  if (!url) return ''
  if (url.startsWith('data:')) return url
  let formatted = url.replace(/^http:/, 'https:')
  if (formatted.includes('@')) {
    formatted = formatted.split('@')[0]
  }
  return `${formatted}@48w_48h_1c.webp`
}

const handleImgError = (item: BilibiliTrendingItem): void => {
  item.iconError = true
}

const hasValidIcon = (item: BilibiliTrendingItem): boolean => Boolean(item.icon && !item.iconError)

const getWordTypeBadge = (item: BilibiliTrendingItem) => {
  const badgeType = Number(item.call_reason || item.word_type)
  if (badgeType === 4) return { text: '新', class: 'badge-new' }
  if (badgeType === 5) return { text: '热', class: 'badge-hot' }
  if (badgeType === 7) return { text: '直播', class: 'badge-live' }
  if (badgeType === 9) return { text: '梗', class: 'badge-geng' }
  if (badgeType === 12) return { text: '独家', class: 'badge-exclusive' }
  return null
}

const requestBilibiliJson = async <T>(path: string): Promise<T> => {
  const targetUrl = resolveApiUrl(`/api-bilibili-web${path}`)
  const res = await fetch(targetUrl)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json() as BilibiliApiResponse<T>
  if (json.code !== 0 || !json.data) throw new Error(json.message || `Bilibili API ${json.code}`)
  return json.data
}

const fetchBilibiliTrending = async (minimumLoadingMs = 0): Promise<void> => {
  const startedAt = Date.now()
  loading.value = true
  contentNote.value = ''
  try {
    const targetUrl = resolveApiUrl('/api-bilibili-trending/x/v2/search/trending/ranking?limit=100')
    const res = await fetch(targetUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    if (json.code === 0 && json.data) {
      const { featured, ranking } = parseTrendingData(json.data)
      if (featured.length === 0 && ranking.length === 0) throw new Error('热搜列表为空')

      topList.value = featured
      list.value = ranking
      updateTime.value = formatNowTime()
      loadedTabs.add('hot-search')
      tabNotes.set('hot-search', '')
      ElMessage.success(`已更新 Bilibili 搜索热搜榜 (${featured.length + ranking.length} 条)`)
    } else {
      throw new Error(json.message || '数据结构异常')
    }
  } catch (err) {
    console.warn('Fetch bilibili trending failed, using fallback mock dataset:', err)
    topList.value = [
      {
        position: 1,
        keyword: '人民对美好生活的向往就是我们的奋斗目标',
        show_name: '人民对美好生活的向往就是我们的奋斗目标',
        word_type: 8,
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHjSURBVHgB7ZnRbcIwFEUvadVvRmADlP+C0knaDaATABMUNmgnadT+9C9ig4yQ76oNfRZRhSDYz4kNMbwjIaLkKcmNr+1cBxAEQRAEoXP0uIXr5H4GRFPa7OM8FMDmdZh+PnOKWcLWyeiFSqfoACWwiNOPuakuAoveEzoC3fCEWXeZcIWt0BHIim+cOovBY7ykv0ecdfDAasjoX4LQIdh9rClZkvQj/EyqyR1qki1xQ3NRWsAjXoWRqEGE8p02B3uH8hLfD3H6lcMT3uaxLBlNSVSGQ1EKEnyXqRp4wnmLba33O+O/gm2WPqzpVJjGeiacW9OZFQ3WM+Hcmq1bzN56JtxYs5WwFtYz0dqaja3Y0nomWluzkTAVPCP0KHxqX4hV4j2adsvtMZ3d+uoa25Brj7UwZppWVoopxi+PFcR0rEQUq1rtmehaWTKew5IGLaZP05SXVuqGOf2DBoi8EqfNe9zUvMst3KGst4g1rVRHNfpRq4xysh6Nrm7yXpM+Vvd0jdYzobMmNzXvYi2sSrBKXFH9Flzrmdiz5v/5aVXKenT0HltoSWFTt58ekNdrX/0qVXCIsNAQYaEhwkJDhIWGCAsNERYapxBWMPc55RTCDhJ3k0Rsi/egqdj5fq2Q78jCNfEHMma377blSZ4AAAAASUVORK5CYII=',
        hot_id: 262402
      }
    ]
    list.value = [
      { position: 1, keyword: '北京WB 广州TTG', show_name: '广州TTG战胜北京WB', word_type: 8, call_reason: 4, hot_id: 262864 },
      { position: 2, keyword: '足协辟谣米利西奇辞职', show_name: '足协辟谣米利西奇辞职', word_type: 4, hot_id: 262875 },
      { position: 3, keyword: '妙脆角猫最危险的一天', show_name: '妙脆角猫最危险的一天', word_type: 9, hot_id: 262865 },
      { position: 4, keyword: 'TES WE', show_name: 'TES战胜WE LPL第三赛段', word_type: 5, hot_id: 262858 },
      { position: 5, keyword: 'AG DRG', show_name: 'AG vs DRG VCT第二赛段', word_type: 7, hot_id: 262871 },
      { position: 6, keyword: '你们宿舍全进世界杯', show_name: '你们宿舍全进世界杯', word_type: 9, hot_id: 262881 },
      { position: 7, keyword: 'TES战胜WE赛后数据', show_name: 'TES战胜WE赛后数据', word_type: 4, hot_id: 262878 },
      { position: 8, keyword: '美加墨世界杯回顾复盘', show_name: '美加墨世界杯回顾复盘', word_type: 8, hot_id: 262874 },
      { position: 9, keyword: '在村里举办一场世界杯', show_name: '在村里举办一场世界杯', word_type: 12, hot_id: 262870 },
      { position: 10, keyword: 'Mrbeast结婚啦', show_name: 'Mrbeast结婚啦', word_type: 8, hot_id: 262815 }
    ]
    contentNote.value = '热搜接口暂时不可用，已展示本地兜底数据。'
    tabNotes.set('hot-search', contentNote.value)
    updateTime.value = formatNowTime()
  } finally {
    const remainingLoadingMs = minimumLoadingMs - (Date.now() - startedAt)
    if (remainingLoadingMs > 0) await wait(remainingLoadingMs)
    loading.value = false
  }
}

const fetchWeeklySeries = async (): Promise<WeeklySeriesItem[]> => {
  const data = await requestBilibiliJson<{ list?: WeeklySeriesItem[] }>('/x/web-interface/popular/series/list')
  const series = Array.isArray(data.list) ? data.list : []
  weeklySeries.value = series
  if (!selectedWeeklyNumber.value && series[0]) selectedWeeklyNumber.value = series[0].number
  return series
}

const fetchWeeklyDetail = async (number: number): Promise<void> => {
  const data = await requestBilibiliJson<WeeklyDetailData>(`/x/web-interface/popular/series/one?number=${number}`)
  const videos = Array.isArray(data.list) ? data.list : []
  popularItems.value = normalizeVideoItems(videos, data.config?.label || '每周必看')
  contentNote.value = data.config?.name || data.config?.subject || data.reminder || currentTab.value.description
  tabNotes.set('weekly', contentNote.value)
}

const fetchPopularTab = async (tab: Exclude<BilibiliTabId, 'hot-search'>, minimumLoadingMs = 0): Promise<void> => {
  const startedAt = Date.now()
  loading.value = true
  contentNote.value = ''
  popularItems.value = []

  try {
    if (tab === 'weekly') {
      const series = await fetchWeeklySeries()
      const issueNumber = selectedWeeklyNumber.value || series[0]?.number
      if (!issueNumber) throw new Error('每周必看期数为空')
      selectedWeeklyNumber.value = issueNumber
      await fetchWeeklyDetail(issueNumber)
    } else {
      const endpointMap: Record<Exclude<BilibiliTabId, 'hot-search' | 'weekly'>, string> = {
        popular: '/x/web-interface/popular?ps=30&pn=1',
        precious: '/x/web-interface/popular/precious?page_size=30&page=1',
        ranking: '/x/web-interface/ranking/v2?rid=0&type=all',
        music: '/x/web-interface/ranking/v2?rid=3&type=all'
      }
      const data = await requestBilibiliJson<PopularListData>(endpointMap[tab])
      const videos = Array.isArray(data.list) ? data.list : []
      popularItems.value = normalizeVideoItems(videos, currentTab.value.label)
      contentNote.value = data.note || data.explain || currentTab.value.description
      tabNotes.set(tab, contentNote.value)
    }

    if (popularItems.value.length === 0) throw new Error('接口没有返回视频列表')
    updateTime.value = formatNowTime()
    loadedTabs.add(tab)
    ElMessage.success(`已更新 ${currentTab.value.label} (${popularItems.value.length} 条)`)
  } catch (err) {
    console.warn(`Fetch bilibili ${tab} failed:`, err)
    contentNote.value = `${currentTab.value.label} 接口暂时不可用：${err instanceof Error ? err.message : '未知错误'}`
    tabNotes.set(tab, contentNote.value)
    ElMessage.error(contentNote.value)
  } finally {
    const remainingLoadingMs = minimumLoadingMs - (Date.now() - startedAt)
    if (remainingLoadingMs > 0) await wait(remainingLoadingMs)
    loading.value = false
  }
}

const fetchActiveTab = (minimumLoadingMs = 0): Promise<void> => {
  if (activeTab.value === 'hot-search') return fetchBilibiliTrending(minimumLoadingMs)
  return fetchPopularTab(activeTab.value, minimumLoadingMs)
}

const startRefreshCountdown = (): void => {
  refreshCountdown.value = MANUAL_REFRESH_COOLDOWN_SECONDS
  if (refreshTimer !== null) clearInterval(refreshTimer)
  refreshTimer = setInterval(() => {
    refreshCountdown.value--
    if (refreshCountdown.value <= 0) {
      refreshCountdown.value = 0
      if (refreshTimer !== null) clearInterval(refreshTimer)
      refreshTimer = null
    }
  }, 1000)
}

const handleManualRefresh = async (): Promise<void> => {
  if (!isHotSearchTab.value) return
  if (isRefreshDisabled.value) return
  await fetchBilibiliTrending(MIN_MANUAL_REFRESH_LOADING_MS)
  startRefreshCountdown()
}

const handleTabSelect = async (tab: BilibiliTabId): Promise<void> => {
  activeTab.value = tab
  searchQuery.value = ''
  contentNote.value = tabNotes.get(tab) || ''
  await fetchActiveTab()
}

const handleWeeklyIssueSelect = async (number: number): Promise<void> => {
  if (selectedWeeklyNumber.value === number && hasVideoContent.value) return
  selectedWeeklyNumber.value = number
  await fetchPopularTab('weekly')
}

const filteredList = computed(() => {
  if (!searchQuery.value) return list.value
  const q = searchQuery.value.toLowerCase()
  return list.value.filter(item =>
    item.show_name.toLowerCase().includes(q) || item.keyword.toLowerCase().includes(q)
  )
})

const filteredTopList = computed(() => {
  if (!searchQuery.value) return topList.value
  const q = searchQuery.value.toLowerCase()
  return topList.value.filter(item =>
    item.show_name.toLowerCase().includes(q) || item.keyword.toLowerCase().includes(q)
  )
})

const filteredPopularItems = computed(() => {
  if (!searchQuery.value) return popularItems.value
  const q = searchQuery.value.toLowerCase()
  return popularItems.value.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.ownerName.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.badge.toLowerCase().includes(q)
  )
})

const getBilibiliSearchUrl = (keyword: string): string =>
  `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`

const copyTextFallback = (text: string): void => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', 'readonly')
  textArea.style.position = 'fixed'
  textArea.style.left = '-9999px'
  textArea.style.top = '0'
  document.body.appendChild(textArea)
  textArea.select()
  const success = document.execCommand('copy')
  document.body.removeChild(textArea)
  if (!success) throw new Error('copy command failed')
}

const copyTextToClipboard = async (text: string): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  copyTextFallback(text)
}

const copyBilibiliLink = async (url: string, title: string): Promise<void> => {
  try {
    await copyTextToClipboard(url)
    ElMessage.success(`已复制链接：${title}`)
  } catch (error) {
    console.warn('复制 Bilibili 链接失败:', error)
    ElMessage.error('复制失败，请手动复制链接')
  }
}

const copyBilibiliSearchLink = (item: BilibiliTrendingItem): Promise<void> =>
  copyBilibiliLink(getBilibiliSearchUrl(item.keyword), item.show_name || item.keyword)

const copyBilibiliVideoLink = (item: BilibiliPopularVideo): Promise<void> =>
  copyBilibiliLink(item.url, item.title)

const openBilibiliSearch = (keyword: string): void => {
  window.open(getBilibiliSearchUrl(keyword), '_blank')
}

const openBilibiliVideo = (item: BilibiliPopularVideo): void => {
  window.open(item.url, '_blank')
}

onMounted(() => {
  void fetchActiveTab()
})

onBeforeUnmount(() => {
  if (refreshTimer !== null) clearInterval(refreshTimer)
})
</script>

<template>
  <main class="bilibili-trending-page">
    <header class="page-header">
      <div class="header-left">
        <span class="bili-logo">📺</span>
        <div>
          <h1 class="header-title">Bilibili 热门与热搜</h1>
          <p class="header-subtitle">
            {{ currentTab.description }}
            <span v-if="updateTime" class="update-tag">（更新于 {{ updateTime }}）</span>
          </p>
        </div>
      </div>

      <div class="header-right">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="搜索当前列表..." />
        </div>
        <button v-if="activeTab === 'hot-search'" type="button" class="refresh-btn" :disabled="isRefreshDisabled" @click="handleManualRefresh">
          <span :class="{ spinning: loading }">🔄</span>
          <template v-if="loading">刷新中...</template>
          <template v-else-if="refreshCountdown > 0">{{ refreshCountdown }}s 后可刷新</template>
          <template v-else>刷新</template>
        </button>
        <button type="button" class="back-btn" @click="router.push('/toolbox')">
          ← 工具箱
        </button>
      </div>
    </header>

    <section class="popular-tab-bar" aria-label="Bilibili 热门分类">
      <button
        v-for="tab in popularTabs"
        :key="tab.id"
        type="button"
        class="popular-tab"
        :class="{ active: activeTab === tab.id }"
        @click="handleTabSelect(tab.id)"
      >
        <span class="popular-tab-icon">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </section>

    <p v-if="contentNote" class="content-note">{{ contentNote }}</p>

    <template v-if="activeTab === 'hot-search'">
      <section v-if="filteredTopList.length > 0" class="top-trending-card">
        <div class="top-trending-hero">
          <div class="hero-search-symbol">⌕</div>
          <h2>bilibili 热搜</h2>
        </div>
        <button
          v-for="item in filteredTopList"
          :key="getTrendingKey(item)"
          type="button"
          class="top-trending-row"
          @click="openBilibiliSearch(item.keyword)"
        >
          <img
            v-if="hasValidIcon(item)"
            :src="formatBilibiliIcon(item.icon)"
            alt=""
            class="top-trending-icon"
            referrerpolicy="no-referrer"
            @error="handleImgError(item)"
          />
          <span v-else class="top-trending-fallback">↑</span>
          <span :title="item.show_name || item.keyword" class="top-trending-title">
            {{ item.show_name || item.keyword }}
          </span>
          <span
            class="copy-link-action"
            role="button"
            tabindex="0"
            title="复制链接"
            @click.stop="copyBilibiliSearchLink(item)"
            @keydown.enter.stop.prevent="copyBilibiliSearchLink(item)"
            @keydown.space.stop.prevent="copyBilibiliSearchLink(item)"
          >
            📋 复制链接
          </span>
          <span class="top-trending-arrow">&gt;</span>
        </button>
      </section>

      <div class="trending-list-card" :class="{ 'is-refreshing': loading && list.length > 0 }">
        <div v-if="loading && list.length > 0" class="list-loading-mask" aria-live="polite">
          <div class="spinner"></div>
          <span>正在刷新热搜榜...</span>
        </div>

        <div v-if="loading && list.length === 0" class="loading-state">
          <div class="spinner"></div>
          <p>正在拉取 Bilibili 热搜榜 Top 100...</p>
        </div>

        <div v-else-if="filteredList.length === 0" class="empty-state">
          <p>📭 没有找到包含 "{{ searchQuery }}" 的热搜关键词</p>
        </div>

        <div v-else class="ranking-list">
          <div
            v-for="item in filteredList"
            :key="item.position"
            class="ranking-item"
            @click="openBilibiliSearch(item.keyword)"
          >
            <div class="rank-number" :class="`rank-${item.position}`">
              {{ item.position }}
            </div>
            <div :title="item.show_name || item.keyword" class="keyword-title">
              {{ item.show_name || item.keyword }}
            </div>
            <div class="badge-container">
              <img
                v-if="hasValidIcon(item)"
                :src="formatBilibiliIcon(item.icon)"
                alt="icon"
                class="badge-icon-img"
                referrerpolicy="no-referrer"
                @error="handleImgError(item)"
              />
              <span
                v-else-if="getWordTypeBadge(item)"
                class="type-badge"
                :class="getWordTypeBadge(item)?.class"
              >
                {{ getWordTypeBadge(item)?.text }}
              </span>
            </div>
            <span
              class="copy-link-action"
              role="button"
              tabindex="0"
              title="复制链接"
              @click.stop="copyBilibiliSearchLink(item)"
              @keydown.enter.stop.prevent="copyBilibiliSearchLink(item)"
              @keydown.space.stop.prevent="copyBilibiliSearchLink(item)"
            >
              📋 复制链接
            </span>
            <div class="arrow-icon">&gt;</div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <section v-if="activeTab === 'weekly' && weeklySeries.length > 0" class="weekly-series-bar" aria-label="每周必看期数">
        <button
          v-for="series in weeklySeries.slice(0, 18)"
          :key="series.number"
          type="button"
          class="weekly-series-chip"
          :class="{ active: selectedWeeklyNumber === series.number }"
          @click="handleWeeklyIssueSelect(series.number)"
        >
          <strong>第 {{ series.number }} 期</strong>
          <span>{{ series.subject }}</span>
        </button>
      </section>

      <section class="popular-video-panel" :class="{ 'is-refreshing': loading && popularItems.length > 0 }">
        <div v-if="loading && popularItems.length > 0" class="list-loading-mask" aria-live="polite">
          <div class="spinner"></div>
          <span>正在刷新 {{ currentTab.label }}...</span>
        </div>

        <div v-if="loading && popularItems.length === 0" class="loading-state">
          <div class="spinner"></div>
          <p>正在从 Bilibili Network 接口拉取 {{ currentTab.label }}...</p>
        </div>

        <div v-else-if="filteredPopularItems.length === 0" class="empty-state">
          <p>📭 没有找到包含 "{{ searchQuery }}" 的视频</p>
        </div>

        <div v-else class="popular-video-grid">
          <button
            v-for="item in filteredPopularItems"
            :key="item.id"
            type="button"
            class="popular-video-card"
            @click="openBilibiliVideo(item)"
          >
            <span class="video-rank" :class="`rank-${item.position}`">{{ item.position }}</span>
            <span class="video-cover-wrap">
              <img :src="item.cover" alt="" class="video-cover" referrerpolicy="no-referrer" />
              <span v-if="item.durationText !== '0:00'" class="video-duration">{{ item.durationText }}</span>
            </span>
            <span class="video-info">
              <strong :title="item.title">{{ item.title }}</strong>
              <span class="video-meta">
                <span>UP {{ item.ownerName }}</span>
                <span>{{ item.category }}</span>
                <span v-if="item.pubdateText">{{ item.pubdateText }}</span>
              </span>
              <span class="video-stats">
                <span>▶ {{ item.viewText }}</span>
                <span>💬 {{ item.danmakuText }}</span>
                <span>👍 {{ item.likeText }}</span>
              </span>
              <span v-if="item.badge" class="video-badge">{{ item.badge }}</span>
            </span>
            <span
              class="copy-link-action video-copy-action"
              role="button"
              tabindex="0"
              title="复制链接"
              @click.stop="copyBilibiliVideoLink(item)"
              @keydown.enter.stop.prevent="copyBilibiliVideoLink(item)"
              @keydown.space.stop.prevent="copyBilibiliVideoLink(item)"
            >
              📋 复制链接
            </span>
            <span class="video-arrow">&gt;</span>
          </button>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
