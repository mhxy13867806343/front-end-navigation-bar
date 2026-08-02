<template>
  <main class="juejin-clubs-page">
    <section class="clubs-shell">
      <header class="clubs-header">
        <div>
          <button type="button" class="back-button" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回导航站</span>
          </button>
          <h1>圈子广场</h1>
        </div>
        <label class="club-search">
          <input
            v-model="keyword"
            type="search"
            placeholder="搜索圈子名称"
            @keyup.enter="searchTopics"
          />
          <button type="button" title="搜索圈子" @click="searchTopics">
            <el-icon><Search /></el-icon>
          </button>
        </label>
      </header>

      <nav class="club-tabs" aria-label="圈子分类">
        <button
          v-for="category in primaryCategories"
          :key="category.value"
          type="button"
          class="club-tab"
          :class="{ active: activeCategoryValue === category.value }"
          @click="selectCategory(category)"
        >
          {{ category.label }}
        </button>
        <div class="more-tabs">
          <button
            type="button"
            class="club-tab more-tab"
            :class="{ active: isMoreActive }"
            @click="isMoreOpen = !isMoreOpen"
          >
            更多
            <el-icon><ArrowDown /></el-icon>
          </button>
          <div v-if="isMoreOpen" class="more-menu">
            <button
              v-for="category in moreCategories"
              :key="category.value"
              type="button"
              :class="{ active: activeCategoryValue === category.value }"
              @click="selectCategory(category)"
            >
              {{ category.label }}
            </button>
          </div>
        </div>
      </nav>

      <div class="clubs-content">
        <div class="clubs-main">
          <section v-if="loading && !topics.length" class="club-state">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在加载掘金圈子...</span>
          </section>

          <section v-else-if="error" class="club-state error-state">
            <span>{{ error }}</span>
            <button type="button" @click="reloadTopics">重试</button>
          </section>

          <template v-else>
            <section v-if="visibleTopics.length" class="club-grid" aria-label="圈子列表">
              <article
                v-for="item in visibleTopics"
                :key="item.topic.topic_id"
                class="club-item"
                tabindex="0"
                @click="openClub(item.topic.topic_id)"
                @keyup.enter="openClub(item.topic.topic_id)"
              >
                <img
                  v-if="item.topic.icon"
                  :src="item.topic.icon"
                  :alt="item.topic.title"
                  class="club-icon"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />
                <div v-else class="club-icon fallback-icon">{{ item.topic.title.slice(0, 1) }}</div>
                <div class="club-copy">
                  <h2>{{ item.topic.title.trim() }}</h2>
                  <p>{{ formatCount(item.topic.follower_count) }} 掘友 · {{ formatCount(item.topic.msg_count) }} 沸点</p>
                  <button type="button" class="join-button" @click.stop="openClub(item.topic.topic_id)">＋ 加入</button>
                </div>
              </article>
            </section>

            <section v-else class="club-state">
              <span>没有匹配到圈子，换个分类或关键词试试。</span>
            </section>
          </template>
        </div>

        <aside v-if="popularTopics.length" class="popular-clubs" aria-label="人气圈子">
          <h2>人气圈子</h2>
          <article
            v-for="item in popularTopics"
            :key="item.topic.topic_id"
            class="popular-club-item"
            tabindex="0"
            @click="openClub(item.topic.topic_id)"
            @keyup.enter="openClub(item.topic.topic_id)"
          >
            <img
              v-if="item.topic.icon"
              :src="item.topic.icon"
              :alt="item.topic.title"
              class="popular-club-icon"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
            <div v-else class="popular-club-icon fallback-icon">{{ item.topic.title.slice(0, 1) }}</div>
            <div class="popular-club-copy">
              <h3>{{ item.topic.title.trim() }}</h3>
              <p class="popular-desc">{{ item.topic.description }}</p>
              <p>{{ formatCount(item.topic.follower_count) }}掘友 · {{ formatCount(item.topic.msg_count) }}沸点</p>
            </div>
          </article>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, ArrowLeft, Loading, Search } from '@element-plus/icons-vue'
import {
  JUEJIN_CLUB_CATEGORIES,
  JUEJIN_CLUB_TOPIC_ALL_API,
  JUEJIN_CLUB_TOPIC_CATEGORY_API,
  JUEJIN_CLUB_TOPIC_REC_API,
  JUEJIN_CLUB_TOPIC_SEARCH_API,
  buildJuejinClubUrl
} from '@/constants/juejin'
import { JUEJIN_CLUBS_CACHE_FILE, buildLiveDataUrl } from '@/constants/liveData'
import { readJsonCache } from '@/utils/liveDataCache'
import { postJson } from '@/utils/request'

interface JuejinClubTopic {
  topic_id: string
  title: string
  description: string
  icon: string
  msg_count: number
  follower_count: number
  attender_count: number
  cate_id: string
  is_rec?: boolean
  rec_rank?: number
  notice?: string
}

interface JuejinClubItem {
  topic_id: string
  topic: JuejinClubTopic
  user_interact?: {
    is_follow?: boolean
  }
  new_short_msg_count?: number
}

interface JuejinClubsResponse {
  err_no: number
  err_msg: string
  data: JuejinClubItem[]
  cursor: string
  has_more: boolean
}

interface JuejinClubsCacheEntry<TData> {
  updatedAt: string
  ok: boolean
  data: TData | null
  error?: string
}

interface JuejinClubsCache {
  generatedAt: string
  recommended: JuejinClubsCacheEntry<JuejinClubsResponse>
  all: JuejinClubsCacheEntry<JuejinClubsResponse>
  categories: Record<string, JuejinClubsCacheEntry<JuejinClubsResponse>>
  searches: Record<string, JuejinClubsCacheEntry<JuejinClubsResponse>>
}

interface ClubCategory {
  label: string
  value: string
  type: 'recommend' | 'category'
}

const isProd = import.meta.env.PROD
const clubsCacheUrl = buildLiveDataUrl(JUEJIN_CLUBS_CACHE_FILE)
let juejinClubsCachePromise: Promise<JuejinClubsCache> | null = null

const router = useRouter()
const clubCategoryTabs: ClubCategory[] = JUEJIN_CLUB_CATEGORIES.map((category): ClubCategory => ({
  ...category,
  type: 'category'
}))
const primaryCategories: ClubCategory[] = [
  { label: '推荐圈子', value: 'recommend', type: 'recommend' },
  ...clubCategoryTabs.slice(0, 9)
]
const moreCategories: ClubCategory[] = clubCategoryTabs.slice(9)

const activeCategory = ref<ClubCategory>(primaryCategories[0])
const keyword = ref<string>('')
const topics = ref<JuejinClubItem[]>([])
const allTopics = ref<JuejinClubItem[]>([])
const loading = ref<boolean>(false)
const error = ref<string>('')
const isMoreOpen = ref<boolean>(false)
const popularTopicTitles: string[] = ['上班摸鱼', '青训营-快乐出发', '树洞一下', '技术交流圈', '内推招聘广场']

const activeCategoryValue = computed<string>(() => activeCategory.value.value)
const isMoreActive = computed<boolean>(() => {
  return moreCategories.some((category: ClubCategory): boolean => category.value === activeCategoryValue.value)
})
const normalizedKeyword = computed<string>(() => keyword.value.trim().toLowerCase())
const visibleTopics = computed<JuejinClubItem[]>(() => {
  if (!normalizedKeyword.value || !isProd) return topics.value
  return topics.value.filter((item: JuejinClubItem): boolean => {
    const topic = item.topic
    return [topic.title, topic.description, topic.notice].join(' ').toLowerCase().includes(normalizedKeyword.value)
  })
})
const popularTopics = computed<JuejinClubItem[]>(() => {
  const pool = allTopics.value.length ? allTopics.value : topics.value
  const preferred = popularTopicTitles
    .map((title: string): JuejinClubItem | undefined => {
      return pool.find((item: JuejinClubItem): boolean => item.topic.title.trim() === title)
    })
    .filter((item: JuejinClubItem | undefined): item is JuejinClubItem => Boolean(item))

  if (preferred.length >= 5) return preferred

  const preferredIds = new Set(preferred.map((item: JuejinClubItem): string => item.topic.topic_id))
  const fallback = [...pool]
    .filter((item: JuejinClubItem): boolean => !preferredIds.has(item.topic.topic_id))
    .sort((left: JuejinClubItem, right: JuejinClubItem): number => {
      return right.topic.msg_count + right.topic.follower_count - left.topic.msg_count - left.topic.follower_count
    })
    .slice(0, 5 - preferred.length)

  return preferred.concat(fallback)
})

async function fetchTopics(category: ClubCategory = activeCategory.value): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = isProd ? await fetchCachedTopics(category) : await fetchRemoteTopics(category)
    if (response.err_no !== 0) {
      throw new Error(response.err_msg || '掘金圈子加载失败')
    }
    topics.value = normalizeTopics(response.data || [])
  } catch (err) {
    error.value = err instanceof Error ? err.message : '掘金圈子加载失败'
  } finally {
    loading.value = false
  }
}

async function fetchRemoteTopics(category: ClubCategory): Promise<JuejinClubsResponse> {
  if (category.type === 'recommend') {
    return postJson<JuejinClubsResponse>(JUEJIN_CLUB_TOPIC_REC_API, {
      cursor: '0',
      limit: 20
    })
  }

  return postJson<JuejinClubsResponse>(JUEJIN_CLUB_TOPIC_CATEGORY_API, {
    cate_id: category.value,
    cursor: '0',
    limit: 40
  })
}

async function fetchCachedTopics(category: ClubCategory): Promise<JuejinClubsResponse> {
  const cache = await loadJuejinClubsCache()
  if (category.type === 'recommend') {
    if (cache.recommended.ok && cache.recommended.data) return cache.recommended.data
    throw new Error(cache.recommended.error || '线上圈子快照暂无推荐数据')
  }

  const categoryEntry = cache.categories[category.value]
  if (categoryEntry?.ok && categoryEntry.data?.data?.length) return categoryEntry.data

  const allEntry = cache.all
  if (allEntry.ok && allEntry.data) {
    return {
      ...allEntry.data,
      data: allEntry.data.data.filter((item: JuejinClubItem): boolean => item.topic.cate_id === category.value),
      has_more: false
    }
  }

  throw new Error(categoryEntry?.error || allEntry.error || '线上圈子快照暂无分类数据')
}

async function loadJuejinClubsCache(): Promise<JuejinClubsCache> {
  if (!juejinClubsCachePromise) {
    juejinClubsCachePromise = readJsonCache<JuejinClubsCache>({
      primaryUrl: clubsCacheUrl,
      label: '掘金圈子快照',
      validate: (cache: JuejinClubsCache): boolean => Boolean(cache.recommended || cache.all || cache.categories)
    }).catch((cacheError: unknown): never => {
      const message = cacheError instanceof Error ? cacheError.message : String(cacheError)
      throw new Error(`加载掘金圈子快照失败：${message}`)
    })
  }

  return juejinClubsCachePromise
}

async function fetchAllTopics(): Promise<void> {
  try {
    const response = isProd ? await fetchCachedAllTopics() : await fetchRemoteAllTopics()
    if (response.err_no === 0) {
      allTopics.value = normalizeTopics(response.data || [])
    }
  } catch {
    allTopics.value = []
  }
}

async function fetchRemoteAllTopics(): Promise<JuejinClubsResponse> {
  return postJson<JuejinClubsResponse>(JUEJIN_CLUB_TOPIC_ALL_API, {
    cursor: '0',
    limit: 120
  })
}

async function fetchCachedAllTopics(): Promise<JuejinClubsResponse> {
  const cache = await loadJuejinClubsCache()
  if (cache.all.ok && cache.all.data) return cache.all.data
  throw new Error(cache.all.error || '线上圈子快照暂无全部数据')
}

async function searchTopics(): Promise<void> {
  const searchText = keyword.value.trim()
  if (!searchText) {
    await fetchTopics()
    return
  }

  loading.value = true
  error.value = ''
  try {
    const response = isProd ? await fetchCachedSearch(searchText) : await fetchRemoteSearch(searchText)
    if (response.err_no !== 0) {
      throw new Error(response.err_msg || '搜索圈子失败')
    }
    topics.value = normalizeTopics(response.data || [])
  } catch (err) {
    error.value = err instanceof Error ? err.message : '搜索圈子失败'
  } finally {
    loading.value = false
  }
}

async function fetchRemoteSearch(searchText: string): Promise<JuejinClubsResponse> {
  return postJson<JuejinClubsResponse>(JUEJIN_CLUB_TOPIC_SEARCH_API, {
    keyword: searchText,
    cursor: '0',
    limit: 40
  })
}

async function fetchCachedSearch(searchText: string): Promise<JuejinClubsResponse> {
  const cache = await loadJuejinClubsCache()
  const exactEntry = cache.searches[searchText]
  if (exactEntry?.ok && exactEntry.data) return exactEntry.data
  if (cache.all.ok && cache.all.data) {
    const normalizedSearch = searchText.toLowerCase()
    return {
      ...cache.all.data,
      data: cache.all.data.data.filter((item: JuejinClubItem): boolean => {
        const topic = item.topic
        return [topic.title, topic.description, topic.notice].join(' ').toLowerCase().includes(normalizedSearch)
      }),
      has_more: false
    }
  }
  throw new Error(exactEntry?.error || '线上圈子快照暂无搜索数据')
}

function normalizeTopics(incoming: JuejinClubItem[]): JuejinClubItem[] {
  const seen = new Set<string>()
  return incoming.filter((item: JuejinClubItem): boolean => {
    const topicId = item.topic?.topic_id || item.topic_id
    if (!topicId || seen.has(topicId)) return false
    seen.add(topicId)
    if (!item.topic.topic_id) item.topic.topic_id = topicId
    return true
  })
}

function reloadTopics(): void {
  void fetchTopics()
}

function selectCategory(category: ClubCategory): void {
  activeCategory.value = category
  isMoreOpen.value = false
  keyword.value = ''
  void fetchTopics(category)
}

function goBack(): void {
  void router.push('/')
}

function openClub(topicId: string): void {
  window.open(buildJuejinClubUrl(topicId), '_blank', 'noopener,noreferrer')
}

function formatCount(value: number): string {
  if (value >= 1000) {
    const precision = value >= 10000 ? 0 : 1
    return `${(value / 1000).toFixed(precision)}k`
  }
  return String(value || 0)
}

onMounted(() => {
  void fetchTopics()
  void fetchAllTopics()
})
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
