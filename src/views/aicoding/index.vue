<template>
  <section class="juejin-hot-page">
    <div class="hot-hero">
      <div class="hero-inner">
        <h1>掘金热榜 <span>HOT</span></h1>
      </div>
    </div>

    <div class="hot-layout">
      <aside class="hot-sidebar" aria-label="掘金热榜菜单">
        <button
          v-for="item in sideNavItems"
          :key="item.key"
          type="button"
          class="nav-item"
          :class="{ active: activeNavKey === item.key }"
          @click="switchNav(item)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-title">{{ item.title }}</span>
          <span v-if="item.children?.length" class="nav-arrow">⌄</span>
        </button>
      </aside>

      <main class="hot-content">
        <header class="content-header">
          <div>
            <h2>{{ activeHeading }}</h2>
            <p>{{ headerDescription }}</p>
          </div>
          <RefreshCountdownButton :on-refresh="handleRefresh" />
        </header>

        <div v-if="activeNav.categoryMode !== 'none' || activeNavKey === 'authors'" class="rank-controls">
          <nav v-if="activeNav.categoryMode !== 'none'" class="category-tabs" aria-label="榜单分类">
            <button
              v-for="category in activeCategoryOptions"
              :key="category.value"
              type="button"
              :class="{ active: activeCategoryId === category.value }"
              @click="switchCategory(category.value)"
            >
              {{ category.label }}
            </button>
          </nav>

          <nav v-if="activeNavKey === 'authors'" class="type-tabs" aria-label="作者榜类型">
            <button
              v-for="option in authorRankOptions"
              :key="option.value"
              type="button"
              :class="{ active: activeAuthorRankType === option.value }"
              @click="switchAuthorRankType(option.value)"
            >
              {{ option.label }}
            </button>
          </nav>
        </div>

        <div v-if="loading && !rankItems.length" class="state-block">加载中...</div>
        <div v-else-if="error" class="state-block error">
          <span>{{ error }}</span>
          <button type="button" @click="reload">重试</button>
        </div>
        <ol v-else-if="rankItems.length" class="rank-list">
          <li v-for="item in rankItems" :key="item.id" class="rank-item">
            <span class="rank-num" :class="{ hot: item.rank <= 3 }">{{ item.rank }}</span>
            <div class="rank-main">
              <a class="rank-title" :href="item.url" target="_blank" rel="noopener">
                {{ item.title }}
              </a>
              <p v-if="item.description" class="rank-desc">{{ item.description }}</p>
              <div class="rank-meta">
                <img
                  v-if="item.avatar"
                  class="author-avatar"
                  :src="item.avatar"
                  :alt="item.owner"
                  loading="lazy"
                />
                <span>{{ item.owner }}</span>
                <template v-for="stat in item.stats" :key="`${item.id}-${stat.label}`">
                  <span>·</span>
                  <span>{{ stat.value }} {{ stat.label }}</span>
                </template>
              </div>
            </div>
            <strong v-if="item.metricValue" class="hot-rank">
              <span v-if="item.metricIcon">{{ item.metricIcon }}</span>
              {{ item.metricValue }}
              <em>{{ item.metricLabel }}</em>
            </strong>
          </li>
        </ol>
        <div v-else class="state-block">暂无热榜数据</div>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ComputedRef, Ref } from 'vue'
import RefreshCountdownButton from '../../components/RefreshCountdownButton.vue'
import { requestJson } from '@/utils/request'
import {
  JUEJIN_AUTHOR_RANK_OPTIONS,
  JUEJIN_HOT_AUTHOR_CATEGORY_OPTIONS,
  JUEJIN_HOT_CATEGORY_OPTIONS,
  JUEJIN_HOT_SIDE_NAV,
  buildJuejinArticleRankUrl,
  buildJuejinAuthorRankBody,
  buildJuejinAuthorRankUrl,
  buildJuejinCollectionRankBody,
  buildJuejinCollectionRankUrl,
  buildJuejinColumnRankBody,
  buildJuejinColumnRankUrl
} from '@/vue-pages-text-fn-abc/juejinHot'
import type {
  JuejinArticleRankType,
  JuejinAuthorRankOption,
  JuejinAuthorRankType,
  JuejinHotCategory,
  JuejinHotListType,
  JuejinHotNavItem
} from '@/vue-pages-text-fn-abc/juejinHot'

interface JuejinHotContentRaw {
  content_id?: string
  title?: string
}

interface JuejinHotCounterRaw {
  view?: number
  like?: number
  collect?: number
  hot_rank?: number
  comment_count?: number
  interact_count?: number
}

interface JuejinHotAuthorRaw {
  name?: string
  avatar?: string
}

interface JuejinHotArticleRaw {
  content?: JuejinHotContentRaw
  content_counter?: JuejinHotCounterRaw
  author?: JuejinHotAuthorRaw
}

interface JuejinArticleRankResponse {
  err_no: number
  err_msg?: string
  data?: JuejinHotArticleRaw[]
}

interface JuejinUserInfoRaw {
  user_id?: string
  user_name?: string
  company?: string
  job_title?: string
  avatar_large?: string
  description?: string
  follower_count?: number
  post_article_count?: number
  got_view_count?: number
  got_digg_count?: number
  collection_set_article_count?: number
  article_collect_count_daily?: number
}

interface JuejinColumnInfoRaw {
  column_id?: string
  follow_cnt?: number
  article_cnt?: number
}

interface JuejinColumnVersionRaw {
  title?: string
  content?: string
}

interface JuejinColumnRaw {
  column?: {
    column?: JuejinColumnInfoRaw
    column_version?: JuejinColumnVersionRaw
    author?: JuejinUserInfoRaw
    column_id?: string
  }
}

interface JuejinColumnRankResponse {
  err_no: number
  err_msg?: string
  data?: JuejinColumnRaw[]
}

interface JuejinCollectionSetRaw {
  collection_id?: string
  collection_name?: string
  description?: string
  post_article_count?: number
  concern_user_count?: number
}

interface JuejinCollectionRaw {
  collection_set?: JuejinCollectionSetRaw
  creator?: JuejinUserInfoRaw
}

interface JuejinCollectionRankResponse {
  err_no: number
  err_msg?: string
  data?: JuejinCollectionRaw[]
}

interface JuejinAuthorRankRaw {
  user_info?: JuejinUserInfoRaw
  rank?: number
  hot_value?: number
}

interface JuejinAuthorRankPeriodRaw {
  year?: number
  period?: number
}

interface JuejinAuthorRankResponse {
  err_no: number
  err_msg?: string
  data?: {
    rank_period?: JuejinAuthorRankPeriodRaw
    user_rank_list?: JuejinAuthorRankRaw[]
  }
}

interface JuejinRankCacheEntry<TData> {
  updatedAt: string
  ok: boolean
  data: TData | null
  error?: string
}

interface JuejinRankCache {
  generatedAt: string
  articleRanks: Record<string, JuejinRankCacheEntry<JuejinArticleRankResponse>>
  columnRank: JuejinRankCacheEntry<JuejinColumnRankResponse>
  collectionRank: JuejinRankCacheEntry<JuejinCollectionRankResponse>
  authorRanks: Record<string, JuejinRankCacheEntry<JuejinAuthorRankResponse>>
}

interface RankStat {
  label: string
  value: string
}

interface RankItem {
  id: string
  title: string
  url: string
  rank: number
  owner: string
  avatar: string
  description: string
  stats: RankStat[]
  metricValue: string
  metricLabel: string
  metricIcon: string
}

const sideNavItems: JuejinHotNavItem[] = JUEJIN_HOT_SIDE_NAV
const authorRankOptions: JuejinAuthorRankOption[] = JUEJIN_AUTHOR_RANK_OPTIONS
const activeNavKey: Ref<JuejinHotListType> = ref<JuejinHotListType>('articles')
const activeCategoryId: Ref<string> = ref<string>('1')
const activeAuthorRankType: Ref<JuejinAuthorRankType> = ref<JuejinAuthorRankType>(1)
const rankItems: Ref<RankItem[]> = ref<RankItem[]>([])
const loading: Ref<boolean> = ref<boolean>(false)
const error: Ref<string> = ref<string>('')
const rankPeriodText: Ref<string> = ref<string>('')
const shouldUseJuejinRankCache: boolean = import.meta.env.PROD
const juejinRankCacheUrl: string = `${import.meta.env.BASE_URL}live-data/juejin-rank-cache.json`

let requestSeq: number = 0
let juejinRankCachePromise: Promise<JuejinRankCache> | null = null
let seedJuejinRankCachePromise: Promise<JuejinRankCache> | null = null

const activeNav: ComputedRef<JuejinHotNavItem> = computed<JuejinHotNavItem>(() => {
  return sideNavItems.find((item: JuejinHotNavItem): boolean => item.key === activeNavKey.value) || sideNavItems[0]
})

const activeCategoryOptions: ComputedRef<JuejinHotCategory[]> = computed<JuejinHotCategory[]>((): JuejinHotCategory[] => {
  return activeNav.value.categoryMode === 'author' ? JUEJIN_HOT_AUTHOR_CATEGORY_OPTIONS : JUEJIN_HOT_CATEGORY_OPTIONS
})

const activeCategoryLabel: ComputedRef<string> = computed<string>((): string => {
  const category: JuejinHotCategory | undefined = activeCategoryOptions.value.find((item: JuejinHotCategory): boolean => {
    return item.value === activeCategoryId.value
  })

  return category?.label || '综合'
})

const activeHeading: ComputedRef<string> = computed<string>((): string => {
  if (activeNav.value.categoryMode === 'none') return activeNav.value.title
  return `${activeNav.value.title} · ${activeCategoryLabel.value}`
})

const headerDescription: ComputedRef<string> = computed<string>((): string => {
  const descriptions: Record<JuejinHotListType, string> = {
    articles: '最近 3 日内发布文章，基于阅读、点赞、评论、收藏数据计算热度。',
    columns: '精选专栏按订阅、更新、内容质量等数据排序。',
    collections: '推荐收藏集按关注、文章内容等数据排序。',
    authors: rankPeriodText.value || '优质作者榜按周期内创作与互动数据计算排名。',
    'collected-articles': '最近 3 个月内发布文章，基于收藏数据计算热度。'
  }

  return descriptions[activeNavKey.value]
})

onMounted((): void => {
  fetchRankData()
})

async function fetchRankData(): Promise<void> {
  const seq: number = ++requestSeq
  loading.value = true
  error.value = ''
  rankPeriodText.value = ''

  try {
    const items: RankItem[] = await fetchActiveRankItems()
    if (seq !== requestSeq) return
    rankItems.value = items
  } catch (e: unknown) {
    if (seq !== requestSeq) return
    const message: string = e instanceof Error ? e.message : String(e)
    error.value = `加载失败：${message}`
    rankItems.value = []
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}

async function fetchActiveRankItems(): Promise<RankItem[]> {
  if (activeNavKey.value === 'columns') return fetchColumnRankItems()
  if (activeNavKey.value === 'collections') return fetchCollectionRankItems()
  if (activeNavKey.value === 'authors') return fetchAuthorRankItems()
  return fetchArticleRankItems()
}

function articleRankCacheKey(categoryId: string, rankType: JuejinArticleRankType): string {
  return `${rankType}:${categoryId}`
}

function authorRankCacheKey(categoryId: string, rankType: JuejinAuthorRankType): string {
  return `${rankType}:${categoryId}`
}

async function loadJuejinRankCache(): Promise<JuejinRankCache> {
  if (!shouldUseJuejinRankCache) return loadSeedJuejinRankCache()

  if (!juejinRankCachePromise) {
    juejinRankCachePromise = requestJson<JuejinRankCache>(juejinRankCacheUrl, {
      cache: 'no-cache'
    }).catch((cacheError: unknown): Promise<JuejinRankCache> => {
      const message: string = cacheError instanceof Error ? cacheError.message : String(cacheError)
      console.warn(`加载掘金静态缓存失败，使用内置缓存：${message}`)
      return loadSeedJuejinRankCache()
    })
  }

  return juejinRankCachePromise
}

async function loadSeedJuejinRankCache(): Promise<JuejinRankCache> {
  if (!seedJuejinRankCachePromise) {
    seedJuejinRankCachePromise = import('@/ajson/juejin-rank-cache.json').then(
      (cacheModule: { default: JuejinRankCache }): JuejinRankCache => cacheModule.default
    )
  }

  return seedJuejinRankCachePromise
}

function readJuejinCacheEntry<TData>(entry: JuejinRankCacheEntry<TData> | undefined, fallbackMessage: string): TData {
  if (entry?.ok && entry.data) return entry.data
  throw new Error(entry?.error || fallbackMessage)
}

async function fetchArticleRankResponse(
  categoryId: string,
  rankType: JuejinArticleRankType
): Promise<JuejinArticleRankResponse> {
  if (shouldUseJuejinRankCache) {
    const cache: JuejinRankCache = await loadJuejinRankCache()
    return readJuejinCacheEntry(cache.articleRanks[articleRankCacheKey(categoryId, rankType)], '缓存暂无文章榜数据')
  }

  return requestJson<JuejinArticleRankResponse>(buildJuejinArticleRankUrl(categoryId, rankType))
}

async function fetchColumnRankResponse(): Promise<JuejinColumnRankResponse> {
  if (shouldUseJuejinRankCache) {
    const cache: JuejinRankCache = await loadJuejinRankCache()
    return readJuejinCacheEntry(cache.columnRank, '缓存暂无专栏榜数据')
  }

  return requestJson<JuejinColumnRankResponse>(buildJuejinColumnRankUrl(), {
    method: 'POST',
    body: JSON.stringify(buildJuejinColumnRankBody())
  })
}

async function fetchCollectionRankResponse(): Promise<JuejinCollectionRankResponse> {
  if (shouldUseJuejinRankCache) {
    const cache: JuejinRankCache = await loadJuejinRankCache()
    return readJuejinCacheEntry(cache.collectionRank, '缓存暂无收藏集榜数据')
  }

  return requestJson<JuejinCollectionRankResponse>(buildJuejinCollectionRankUrl(), {
    method: 'POST',
    body: JSON.stringify(buildJuejinCollectionRankBody())
  })
}

async function fetchAuthorRankResponse(
  categoryId: string,
  rankType: JuejinAuthorRankType
): Promise<JuejinAuthorRankResponse> {
  if (shouldUseJuejinRankCache) {
    const cache: JuejinRankCache = await loadJuejinRankCache()
    return readJuejinCacheEntry(cache.authorRanks[authorRankCacheKey(categoryId, rankType)], '缓存暂无作者榜数据')
  }

  return requestJson<JuejinAuthorRankResponse>(buildJuejinAuthorRankUrl(), {
    method: 'POST',
    body: JSON.stringify(buildJuejinAuthorRankBody(categoryId, rankType))
  })
}

async function fetchArticleRankItems(): Promise<RankItem[]> {
  const rankType: JuejinArticleRankType = activeNav.value.rankType || 'hot'
  const json: JuejinArticleRankResponse = await fetchArticleRankResponse(activeCategoryId.value, rankType)

  if (json.err_no !== 0) throw new Error(json.err_msg || '获取文章榜失败')

  return (json.data || [])
    .map((item: JuejinHotArticleRaw, index: number): RankItem | null => mapArticleRankItem(item, index))
    .filter((item: RankItem | null): item is RankItem => Boolean(item))
}

async function fetchColumnRankItems(): Promise<RankItem[]> {
  const json: JuejinColumnRankResponse = await fetchColumnRankResponse()

  if (json.err_no !== 0) throw new Error(json.err_msg || '获取专栏榜失败')

  return (json.data || [])
    .map((item: JuejinColumnRaw, index: number): RankItem | null => mapColumnRankItem(item, index))
    .filter((item: RankItem | null): item is RankItem => Boolean(item))
}

async function fetchCollectionRankItems(): Promise<RankItem[]> {
  const json: JuejinCollectionRankResponse = await fetchCollectionRankResponse()

  if (json.err_no !== 0) throw new Error(json.err_msg || '获取收藏集榜失败')

  return (json.data || [])
    .map((item: JuejinCollectionRaw, index: number): RankItem | null => mapCollectionRankItem(item, index))
    .filter((item: RankItem | null): item is RankItem => Boolean(item))
}

async function fetchAuthorRankItems(): Promise<RankItem[]> {
  const categoryId: string = activeCategoryId.value || JUEJIN_HOT_AUTHOR_CATEGORY_OPTIONS[0].value
  const json: JuejinAuthorRankResponse = await fetchAuthorRankResponse(categoryId, activeAuthorRankType.value)

  if (json.err_no !== 0) throw new Error(json.err_msg || '获取作者榜失败')

  const rankPeriod: JuejinAuthorRankPeriodRaw | undefined = json.data?.rank_period
  rankPeriodText.value = rankPeriod?.year && rankPeriod.period
    ? `${rankPeriod.year} 年第 ${rankPeriod.period} 期，按作者周期内创作与互动数据计算排名。`
    : '优质作者榜按周期内创作与互动数据计算排名。'

  return (json.data?.user_rank_list || [])
    .map((item: JuejinAuthorRankRaw, index: number): RankItem | null => mapAuthorRankItem(item, index))
    .filter((item: RankItem | null): item is RankItem => Boolean(item))
}

function mapArticleRankItem(item: JuejinHotArticleRaw, index: number): RankItem | null {
  const content: JuejinHotContentRaw | undefined = item.content
  const counter: JuejinHotCounterRaw | undefined = item.content_counter
  const author: JuejinHotAuthorRaw | undefined = item.author

  if (!content?.content_id) return null

  return {
    id: content.content_id,
    title: content.title || '未命名文章',
    url: `https://juejin.cn/post/${content.content_id}`,
    rank: index + 1,
    owner: author?.name || '匿名作者',
    avatar: author?.avatar || '',
    description: '',
    stats: [
      { label: '浏览', value: formatCount(counter?.view || 0) },
      { label: '互动', value: formatCount(counter?.interact_count || 0) },
      { label: '收藏', value: formatCount(counter?.collect || 0) }
    ],
    metricValue: formatCount(counter?.hot_rank || 0),
    metricLabel: '热度',
    metricIcon: index < 3 ? '🔥' : ''
  }
}

function mapColumnRankItem(item: JuejinColumnRaw, index: number): RankItem | null {
  const columnId: string | undefined = item.column?.column_id || item.column?.column?.column_id
  const columnInfo: JuejinColumnInfoRaw | undefined = item.column?.column
  const version: JuejinColumnVersionRaw | undefined = item.column?.column_version
  const author: JuejinUserInfoRaw | undefined = item.column?.author

  if (!columnId) return null

  return {
    id: columnId,
    title: version?.title || '未命名专栏',
    url: `https://juejin.cn/column/${columnId}`,
    rank: index + 1,
    owner: author?.user_name || '匿名作者',
    avatar: author?.avatar_large || '',
    description: version?.content || '',
    stats: [
      { label: '文章', value: formatCount(columnInfo?.article_cnt || 0) },
      { label: '订阅', value: formatCount(columnInfo?.follow_cnt || 0) }
    ],
    metricValue: formatCount(columnInfo?.follow_cnt || 0),
    metricLabel: '订阅',
    metricIcon: ''
  }
}

function mapCollectionRankItem(item: JuejinCollectionRaw, index: number): RankItem | null {
  const collection: JuejinCollectionSetRaw | undefined = item.collection_set

  if (!collection?.collection_id) return null

  return {
    id: collection.collection_id,
    title: collection.collection_name || '未命名收藏集',
    url: `https://juejin.cn/collection/${collection.collection_id}`,
    rank: index + 1,
    owner: item.creator?.user_name || '匿名作者',
    avatar: item.creator?.avatar_large || '',
    description: collection.description || '',
    stats: [
      { label: '文章', value: formatCount(collection.post_article_count || 0) },
      { label: '关注', value: formatCount(collection.concern_user_count || 0) }
    ],
    metricValue: formatCount(collection.concern_user_count || 0),
    metricLabel: '关注',
    metricIcon: ''
  }
}

function mapAuthorRankItem(item: JuejinAuthorRankRaw, index: number): RankItem | null {
  const user: JuejinUserInfoRaw | undefined = item.user_info

  if (!user?.user_id) return null

  return {
    id: user.user_id,
    title: user.user_name || '匿名作者',
    url: `https://juejin.cn/user/${user.user_id}`,
    rank: item.rank || index + 1,
    owner: [user.company, user.job_title].filter(Boolean).join(' · ') || '掘金作者',
    avatar: user.avatar_large || '',
    description: user.description || '',
    stats: [
      { label: '粉丝', value: formatCount(user.follower_count || 0) },
      { label: '文章', value: formatCount(user.post_article_count || 0) },
      { label: '阅读', value: formatCount(user.got_view_count || 0) }
    ],
    metricValue: formatCount(item.hot_value || 0),
    metricLabel: '热度',
    metricIcon: index < 3 ? '🔥' : ''
  }
}

function switchNav(item: JuejinHotNavItem): void {
  if (activeNavKey.value === item.key) return
  activeNavKey.value = item.key
  activeCategoryId.value = item.categoryMode === 'author' ? JUEJIN_HOT_AUTHOR_CATEGORY_OPTIONS[0].value : '1'
  fetchRankData()
}

function switchCategory(categoryId: string): void {
  if (activeCategoryId.value === categoryId) return
  activeCategoryId.value = categoryId
  fetchRankData()
}

function switchAuthorRankType(rankType: JuejinAuthorRankType): void {
  if (activeAuthorRankType.value === rankType) return
  activeAuthorRankType.value = rankType
  fetchRankData()
}

function reload(): void {
  fetchRankData()
}

async function handleRefresh(): Promise<void> {
  await fetchRankData()
}

function formatCount(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
