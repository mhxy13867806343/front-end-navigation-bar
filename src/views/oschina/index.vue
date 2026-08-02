<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ContentFavoriteButton from '@/components/ContentFavoriteButton.vue'
import ShareButton from '@/components/ShareButton.vue'
import { useContentItemFavorites } from '@/composables/useContentItemFavorites'
import { requestJson } from '@/utils/request'
import { resolveApiUrl } from '@/utils/resolveApiUrl'
import './css/index.scss'

/* ── 类型定义 ── */
interface OschinaUserVo {
  id: number
  ident: string
  spaceName: string
  spaceUrl: string
  portraitUrl: string
  name: string
}

interface OschinaRawItem {
  id: number
  title: string
  viewCount: number
  voteCount: number
  commentCount: number
  heatScore: number
  contentType: 'news' | 'blog' | string
  userVo: OschinaUserVo
}

interface OschinaApiResponse {
  success: boolean
  code: number
  result: OschinaRawItem[]
}

interface ReadingItem {
  rank: number
  id: number
  title: string
  link: string
  author: string
  authorAvatar: string
  authorUrl: string
  viewCount: number
  voteCount: number
  commentCount: number
  heatScore: number
  contentType: string
}

type PeriodKey = 'weekly' | 'monthly'
type TypeKey = 'all' | 'news' | 'blog'

interface PeriodTab {
  key: PeriodKey
  label: string
}

interface TypeTab {
  key: TypeKey
  label: string
  icon: string
}

const PERIOD_TABS: PeriodTab[] = [
  { key: 'weekly', label: '周榜' },
  { key: 'monthly', label: '月榜' }
]

const TYPE_TABS: TypeTab[] = [
  { key: 'all', label: '综合', icon: '⭐' },
  { key: 'news', label: '资讯', icon: '📰' },
  { key: 'blog', label: '博客', icon: '📝' }
]

/* ── 响应式状态 ── */
const activePeriod = ref<PeriodKey>('weekly')
const activeType = ref<TypeKey>('all')
const items = ref<ReadingItem[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const { isContentItemFavorite, toggleContentItemFavorite } = useContentItemFavorites()

/* ── 计算属性 ── */
const sourceUrl = computed<string>(() => `https://www.oschina.net/reading-list`)

function buildArticleUrl(item: OschinaRawItem): string {
  if (item.contentType === 'news') {
    return `https://www.oschina.net/news/${item.id}`
  }
  if (item.contentType === 'blog' && item.userVo?.ident) {
    return `https://my.oschina.net/${item.userVo.ident}/blog/${item.id}`
  }
  return `https://my.oschina.net/blog/${item.id}`
}

function buildApiUrl(type: TypeKey = activeType.value, period: PeriodKey = activePeriod.value): string {
  return resolveApiUrl(
    `/api-apiv1-oschina/oschinapi/readRanking/list?type=${type}&period=${period}`
  )
}

function formatNumber(num: number): string {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}w`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(num)
}

/* ── 数据获取 ── */
async function fetchReadingList(): Promise<void> {
  if (isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''
  items.value = []

  try {
    const url = buildApiUrl()
    const data = await requestJson<OschinaApiResponse>(url)

    if (!data.success || !Array.isArray(data.result)) {
      errorMessage.value = '开源中国接口返回异常，请稍后重试。'
      return
    }

    items.value = data.result.map((raw: OschinaRawItem, index: number): ReadingItem => ({
      rank: index + 1,
      id: raw.id,
      title: raw.title,
      link: buildArticleUrl(raw),
      author: raw.userVo?.spaceName || raw.userVo?.name || '匿名',
      authorAvatar: raw.userVo?.portraitUrl || '',
      authorUrl: raw.userVo?.spaceUrl || '',
      viewCount: raw.viewCount,
      voteCount: raw.voteCount,
      commentCount: raw.commentCount,
      heatScore: raw.heatScore,
      contentType: raw.contentType
    }))

    if (!items.value.length) {
      errorMessage.value = '当前榜单暂无数据，请切换其他分类查看。'
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '开源中国阅读榜加载失败，请稍后重试。'
  } finally {
    isLoading.value = false
  }
}

function selectPeriod(key: PeriodKey): void {
  if (isLoading.value || activePeriod.value === key) return
  activePeriod.value = key
}

function selectType(key: TypeKey): void {
  if (isLoading.value || activeType.value === key) return
  activeType.value = key
}

watch([activePeriod, activeType], () => {
  void fetchReadingList()
})

onMounted(() => {
  void fetchReadingList()
})
</script>

<template>
  <div class="oschina-page">
    <!-- Header -->
    <header class="oschina-header">
      <div class="oschina-header-left">
        <div class="oschina-logo-row">
          <span class="oschina-logo-icon">🔴</span>
          <h1 class="oschina-title">开源中国 · 阅读榜单</h1>
          <span class="hot-badge">HOT</span>
        </div>
        <p class="oschina-subtitle">
          聚合开源中国社区最受关注的周/月热门资讯与博客，按热度实时排行更新
        </p>
      </div>
      <div class="oschina-header-right">
        <a
          :href="sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="visit-source-btn"
        >
          🔗 访问原站 ↗
        </a>
        <button
          type="button"
          class="refresh-btn"
          :disabled="isLoading"
          @click="fetchReadingList"
        >
          {{ isLoading ? '加载中...' : '🔄 刷新' }}
        </button>
      </div>
    </header>

    <!-- 控制栏：类型 + 周期 -->
    <div class="oschina-controls">
      <!-- 类型 tabs: 综合 / 资讯 / 博客 -->
      <div class="oschina-type-tabs">
        <button
          v-for="tab in TYPE_TABS"
          :key="tab.key"
          type="button"
          class="type-tab-btn"
          :class="{ active: activeType === tab.key }"
          :disabled="isLoading"
          @click="selectType(tab.key)"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- 周期 tabs: 周榜 / 月榜 -->
      <div class="oschina-period-tabs">
        <button
          v-for="tab in PERIOD_TABS"
          :key="tab.key"
          type="button"
          class="period-tab-btn"
          :class="{ active: activePeriod === tab.key }"
          :disabled="isLoading"
          @click="selectPeriod(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="oschina-loading">
      <div class="loading-spinner"></div>
      <span>正在加载榜单数据...</span>
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage && !items.length" class="oschina-error">
      <div class="error-icon">⚠️</div>
      <p>{{ errorMessage }}</p>
      <a :href="sourceUrl" target="_blank" rel="noopener noreferrer" class="error-link">
        点击前往开源中国原站 ↗
      </a>
    </div>

    <!-- 榜单列表 -->
    <main v-else-if="items.length" class="oschina-list">
      <div class="list-summary-bar">
        <span class="list-summary-label">
          共 <strong>{{ items.length }}</strong> 篇文章
        </span>
        <span class="list-summary-type">
          {{ TYPE_TABS.find(t => t.key === activeType)?.icon }}
          {{ TYPE_TABS.find(t => t.key === activeType)?.label }}
          ·
          {{ PERIOD_TABS.find(t => t.key === activePeriod)?.label }}
        </span>
      </div>

      <div
        v-for="item in items"
        :key="item.id"
        class="oschina-article-card"
        :class="{ 'top-three': item.rank <= 3 }"
      >
        <!-- 排名 -->
        <div class="rank-col">
          <span
            class="rank-badge"
            :class="{
              'rank-1': item.rank === 1,
              'rank-2': item.rank === 2,
              'rank-3': item.rank === 3
            }"
          >{{ item.rank }}</span>
        </div>

        <!-- 文章内容 -->
        <div class="article-col">
          <a
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            class="article-title"
          >{{ item.title }}</a>

          <div class="article-meta">
            <a
              v-if="item.author"
              :href="item.authorUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="meta-author"
            >
              <img
                v-if="item.authorAvatar"
                :src="item.authorAvatar"
                :alt="item.author"
                class="author-avatar"
              />
              <span>{{ item.author }}</span>
            </a>
            <span class="content-type-badge" :class="`type-${item.contentType}`">
              {{ item.contentType === 'news' ? '📰 资讯' : '📝 博客' }}
            </span>
            <span class="meta-stat">
              <span class="meta-icon">👁️</span>{{ formatNumber(item.viewCount) }}
            </span>
            <span v-if="item.voteCount > 0" class="meta-stat">
              <span class="meta-icon">👍</span>{{ item.voteCount }}
            </span>
            <span v-if="item.commentCount > 0" class="meta-stat">
              <span class="meta-icon">💬</span>{{ item.commentCount }}
            </span>
          </div>
        </div>

        <!-- 热度分 -->
        <div class="hot-col">
          <div class="hot-pill">
            <span class="hot-flame">🔥</span>
            <span class="hot-score">{{ formatNumber(item.heatScore) }}</span>
            <span class="hot-label">热度</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions-col">
          <ContentFavoriteButton
            :active="isContentItemFavorite(item.link)"
            :title="item.title"
            @toggle="toggleContentItemFavorite({ id: item.link, title: item.title, url: item.link, source: '开源中国' })"
          />
          <ShareButton
            :payload="{
              title: `[OSChina] ${item.title}`,
              description: `热度: ${item.heatScore} | 浏览: ${item.viewCount}`,
              url: item.link
            }"
            size="compact"
          />
        </div>
      </div>
    </main>

    <!-- 空状态 -->
    <div v-else class="oschina-empty">
      <p>暂无榜单数据</p>
    </div>
  </div>
</template>
