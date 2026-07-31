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

<style scoped lang="scss">
.juejin-clubs-page {
  min-height: 100vh;
  padding: 0;
  color: #d8d8d8;
  background: #181818;
}

.clubs-shell {
  width: 100%;
  min-height: 100vh;
  padding: 32px 28px 56px;
  background: #181818;
}

.clubs-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 28px;
  width: min(100%, 1500px);
  margin-bottom: 28px;
  margin-right: auto;
  margin-left: auto;
}

.back-button,
.club-tab,
.join-button,
.club-search button,
.more-menu button,
.error-state button {
  border: 0;
  font: inherit;
  cursor: pointer;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0;
  color: #9499a0;
  font-size: 18px;
  font-weight: 700;
  background: transparent;
}

.back-button:hover {
  color: #1e80ff;
}

.clubs-header h1 {
  margin: 0;
  color: #e8e8e8;
  font-size: 36px;
  line-height: 1.16;
  letter-spacing: 0;
}

.club-search {
  display: grid;
  grid-template-columns: minmax(260px, 360px) 52px;
  overflow: hidden;
  height: 48px;
  border-radius: 4px;
  background: #333333;
}

.club-search input {
  min-width: 0;
  border: 0;
  padding: 0 18px;
  color: #eeeeee;
  font-size: 17px;
  font-weight: 700;
  background: transparent;
  outline: none;
}

.club-search input::placeholder {
  color: #747474;
}

.club-search button {
  display: inline-grid;
  place-items: center;
  color: #a7adb5;
  background: transparent;
  font-size: 24px;
}

.club-search button:hover {
  color: #1e80ff;
}

.club-tabs {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 30px;
  width: min(100%, 1500px);
  margin-bottom: 28px;
  margin-right: auto;
  margin-left: auto;
}

.club-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 42px;
  padding: 0;
  color: #b8b8b8;
  font-size: 22px;
  font-weight: 800;
  white-space: nowrap;
  background: transparent;
}

.club-tab:hover,
.club-tab.active {
  color: #1e80ff;
}

.more-tabs {
  position: relative;
}

.more-tab {
  padding: 0 18px;
  border-radius: 6px;
  background: #333333;
}

.more-menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 14px);
  right: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(118px, 1fr));
  min-width: 430px;
  padding: 18px 22px;
  border-radius: 6px;
  background: #333333;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.38);
}

.more-menu button {
  min-height: 42px;
  color: #c9c9c9;
  font-size: 18px;
  font-weight: 800;
  background: transparent;
}

.more-menu button:hover,
.more-menu button.active {
  color: #1e80ff;
}

.clubs-content {
  display: grid;
  grid-template-columns: minmax(0, 1160px) 420px;
  justify-content: center;
  align-items: start;
  gap: 56px;
  width: min(100%, 1680px);
  margin-right: auto;
  margin-left: auto;
}

.clubs-main {
  min-width: 0;
}

.club-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(420px, 520px));
  justify-content: center;
  gap: 52px 120px;
  width: 100%;
}

.club-item {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: start;
  gap: 30px;
  width: min(100%, 520px);
  min-width: 0;
  cursor: pointer;
  outline: none;
}

.club-item:hover h2,
.club-item:focus-visible h2 {
  color: #1e80ff;
}

.club-icon {
  width: 112px;
  height: 112px;
  border-radius: 7px;
  object-fit: cover;
  background: #222222;
}

.fallback-icon {
  display: grid;
  place-items: center;
  color: #ffffff;
  font-size: 36px;
  font-weight: 900;
  background: #2b6fe8;
}

.club-copy {
  min-width: 0;
  padding-top: 4px;
}

.club-copy h2 {
  margin: 0;
  overflow: hidden;
  color: #dedede;
  font-size: 20px;
  line-height: 1.35;
  font-weight: 800;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.16s ease;
}

.club-copy p {
  margin: 12px 0 10px;
  color: #8f8f8f;
  font-size: 18px;
  line-height: 1.3;
  font-weight: 700;
  white-space: nowrap;
}

.join-button {
  padding: 0;
  color: #1e80ff;
  font-size: 18px;
  font-weight: 700;
  background: transparent;
}

.join-button:hover {
  color: #62a8ff;
}

.popular-clubs {
  overflow: hidden;
  border-radius: 4px;
  background: #1d1d1d;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.popular-clubs h2 {
  margin: 0;
  padding: 30px 34px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  color: #e4e4e4;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 900;
  letter-spacing: 0;
}

.popular-club-item {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  gap: 18px;
  padding: 22px 28px;
  cursor: pointer;
  outline: none;
}

.popular-club-item:hover h3,
.popular-club-item:focus-visible h3 {
  color: #1e80ff;
}

.popular-club-icon {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
  background: #222222;
}

.popular-club-copy {
  min-width: 0;
}

.popular-club-copy h3 {
  margin: 0 0 10px;
  overflow: hidden;
  color: #dedede;
  font-size: 18px;
  line-height: 1.25;
  font-weight: 900;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.16s ease;
}

.popular-club-copy p {
  margin: 0;
  overflow: hidden;
  color: #8f8f8f;
  font-size: 15px;
  line-height: 1.5;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popular-club-copy .popular-desc {
  margin-bottom: 4px;
}

.club-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: min(100%, 1500px);
  min-height: 320px;
  margin-right: auto;
  margin-left: auto;
  color: #9499a0;
  font-size: 17px;
  font-weight: 700;
}

.error-state {
  flex-direction: column;
}

.error-state button {
  min-height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  color: #ffffff;
  font-weight: 800;
  background: #1e80ff;
}

@media (max-width: 1180px) {
  .clubs-shell {
    width: 100%;
  }

  .club-tabs {
    gap: 18px;
    overflow-x: auto;
    padding-bottom: 6px;
  }

  .club-tab {
    font-size: 19px;
  }

  .clubs-content {
    grid-template-columns: 1fr;
    gap: 38px;
  }

  .popular-clubs {
    width: min(100%, 600px);
    margin-right: auto;
    margin-left: auto;
  }
}

@media (max-width: 820px) {
  .clubs-shell {
    padding: 22px 18px 42px;
  }

  .clubs-header {
    display: grid;
    gap: 18px;
  }

  .clubs-header h1 {
    font-size: 32px;
  }

  .club-search {
    grid-template-columns: minmax(0, 1fr) 48px;
  }

  .club-grid {
    grid-template-columns: 1fr;
    gap: 34px;
  }

  .more-menu {
    left: 0;
    right: auto;
    grid-template-columns: 1fr;
    min-width: 180px;
  }
}

@media (max-width: 520px) {
  .club-item {
    grid-template-columns: 84px minmax(0, 1fr);
    gap: 18px;
  }

  .club-icon {
    width: 84px;
    height: 84px;
  }

  .club-copy h2 {
    font-size: 18px;
  }

  .club-copy p,
  .join-button {
    font-size: 15px;
  }
}
</style>
