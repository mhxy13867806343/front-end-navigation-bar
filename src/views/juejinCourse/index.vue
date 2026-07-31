<template>
  <main class="juejin-course-page">
    <section class="course-hero">
      <div class="hero-copy">
        <span class="hero-kicker">Juejin Course</span>
        <h1>掘金小册课程</h1>
        <p>同步掘金课程中心的小册列表，按最新、热销或价格查看，点击课程卡片即可跳转到掘金详情页。</p>
      </div>
      <div class="hero-actions">
        <button
          type="button"
          class="hero-action-button ghost"
          :class="{ loading }"
          :disabled="loading"
          title="刷新课程列表"
          @click="reloadCourses"
        >
          <el-icon><Refresh /></el-icon>
          <span>{{ loading ? '刷新中' : '刷新' }}</span>
        </button>
        <button type="button" class="hero-action-button primary" @click="openCourseHome">
          <el-icon><Link /></el-icon>
          <span>打开课程中心</span>
        </button>
      </div>
    </section>

    <div class="course-controls">
      <section class="category-filter" aria-label="课程分类">
        <span class="filter-label">分类</span>
        <button
          type="button"
          class="filter-chip"
          :class="{ active: selectedCategoryId === '0' }"
          @click="selectCategory('0')"
        >
          全部
        </button>
        <button
          v-for="category in courseCategories"
          :key="category.category_id"
          type="button"
          class="filter-chip"
          :class="{ active: selectedCategoryId === category.category_id }"
          @click="selectCategory(category.category_id)"
        >
          {{ category.category_name }}
        </button>
      </section>

      <section class="course-toolbar" aria-label="课程筛选">
        <div class="sort-control" aria-label="课程排序">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            type="button"
            class="sort-button"
            :class="{ active: sortValue === option.value }"
            @click="setSort(option.value)"
          >
            {{ option.label }}
          </button>
          <button
            type="button"
            class="sort-button price-sort-button"
            :class="{ active: isPriceSortActive }"
            @click="togglePriceSort"
          >
            价格
            <span class="price-sort-arrows" aria-hidden="true">
              <span :class="{ active: sortValue === JUEJIN_COURSE_SORT_PRICE_ASC }">▲</span>
              <span :class="{ active: sortValue === JUEJIN_COURSE_SORT_PRICE_DESC }">▼</span>
            </span>
          </button>
        </div>
        <label class="vip-toggle" :class="{ active: vipOnly }">
          <input v-model="vipOnly" type="checkbox" />
          <span class="vip-check" aria-hidden="true"></span>
          <span>只看 VIP 课程</span>
        </label>
        <el-input
          v-model="keyword"
          clearable
          :prefix-icon="Search"
          placeholder="搜索课程、作者或简介"
          class="course-search"
        />
      </section>
    </div>

    <section class="course-stats" aria-label="课程统计">
      <div class="stat-item">
        <strong>{{ filteredCourses.length }}</strong>
        <span>当前展示</span>
      </div>
      <div class="stat-item">
        <strong>{{ totalBuyCount }}</strong>
        <span>累计购买</span>
      </div>
      <div class="stat-item">
        <strong>{{ discountedCount }}</strong>
        <span>优惠课程</span>
      </div>
      <div class="stat-item">
        <strong>{{ hasMore ? '可继续' : '已到底' }}</strong>
        <span>加载状态</span>
      </div>
    </section>

    <section v-if="loading && !courses.length" class="course-state">
      <el-icon class="is-loading" :size="26"><Loading /></el-icon>
      <span>正在加载掘金课程...</span>
    </section>

    <section v-else-if="error" class="course-state error-state">
      <span>{{ error }}</span>
      <el-button type="primary" plain @click="reloadCourses">重试</el-button>
    </section>

    <template v-else>
      <section v-if="filteredCourses.length" class="course-grid" aria-label="课程列表">
        <article
          v-for="course in filteredCourses"
          :key="course.booklet_id"
          class="course-card"
          tabindex="0"
          @click="openBook(course.booklet_id)"
          @keyup.enter="openBook(course.booklet_id)"
        >
          <div class="cover-wrap">
            <img
              v-if="course.base_info.cover_img"
              :src="course.base_info.cover_img"
              :alt="course.base_info.title"
              class="course-cover"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
            <div v-else class="cover-fallback">{{ course.base_info.title.slice(0, 1) }}</div>
            <span v-if="course.is_new" class="corner-badge">NEW</span>
          </div>
          <div class="course-body">
            <div class="course-title-row">
              <h2>{{ course.base_info.title }}</h2>
              <span class="course-title-badges">
                <span v-if="isVipBook(course)" class="book-vip-badge">VIP</span>
                <span v-if="eventDiscountLabel(course)" class="discount-badge">
                  {{ eventDiscountLabel(course) }}
                </span>
              </span>
            </div>
            <p class="course-summary">{{ course.base_info.summary || '暂无课程简介' }}</p>
            <div
              class="author-line"
              role="button"
              tabindex="0"
              title="打开作者掘金主页"
              @click.stop="openUser(course.user_info.user_id)"
              @keyup.enter.stop="openUser(course.user_info.user_id)"
            >
              <img
                v-if="course.user_info.avatar_large"
                :src="course.user_info.avatar_large"
                :alt="course.user_info.user_name"
                class="author-avatar"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
              <span>{{ course.user_info.user_name || '掘金作者' }}</span>
              <small v-if="course.user_info.level">Lv.{{ course.user_info.level }}</small>
            </div>
            <div class="course-meta">
              <span>{{ course.base_info.section_count }} 节</span>
              <span>{{ formatCount(course.base_info.buy_count) }} 人购买</span>
              <span>{{ course.base_info.is_finished ? '已完结' : '更新中' }}</span>
            </div>
            <div v-if="discountCountdownText(course)" class="offer-countdown">
              {{ discountCountdownText(course) }}
            </div>
          </div>
          <footer class="course-footer">
            <div class="price-box">
              <strong>{{ formatPrice(displayPrice(course)) }}</strong>
              <span v-if="hasDiscount(course)" class="origin-price">{{ formatPrice(course.base_info.price) }}</span>
            </div>
            <el-button type="primary" plain :icon="Link" @click.stop="openBook(course.booklet_id)">
              查看详情
            </el-button>
          </footer>
        </article>
      </section>

      <section v-else class="course-state">
        <span>没有匹配到课程，换个关键词试试。</span>
      </section>

      <div class="load-more-row">
        <el-button
          type="primary"
          :disabled="!hasMore || Boolean(keyword)"
          :loading="loadingMore"
          @click="loadMoreCourses"
        >
          {{ hasMore ? (keyword ? '清空搜索后加载更多' : '加载更多') : '没有更多了' }}
        </el-button>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Link, Loading, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  JUEJIN_COURSE_API,
  JUEJIN_COURSE_CATEGORY_API,
  JUEJIN_COURSE_FALLBACK_CATEGORIES,
  JUEJIN_COURSE_HOME_URL,
  JUEJIN_COURSE_SORT_DEFAULT,
  JUEJIN_COURSE_SORT_HOT,
  JUEJIN_COURSE_SORT_LATEST,
  JUEJIN_COURSE_SORT_PRICE_ASC,
  JUEJIN_COURSE_SORT_PRICE_DESC,
  buildJuejinBookUrl,
  buildJuejinUserUrl
} from '@/constants/juejin'
import {
  JUEJIN_COURSE_CACHE_FILE,
  buildLiveDataFallbackPath,
  buildLiveDataUrl
} from '@/constants/liveData'
import { readJsonCache } from '@/utils/liveDataCache'
import { postJson, requestJson } from '@/utils/request'

interface JuejinCourseBaseInfo {
  booklet_id: string
  title: string
  price: number
  summary: string
  cover_img: string
  section_count: number
  buy_count: number
  is_finished: number
  can_vip_borrow?: boolean
}

interface JuejinCourseAuthor {
  user_id: string
  user_name: string
  avatar_large: string
  level: number
}

interface JuejinCourseDiscount {
  discount_rate?: number
  start_time?: number
  show_label?: string
  end_time?: number
  status?: number
}

interface JuejinMaxDiscount {
  pay_money?: number
}

interface JuejinCourseItem {
  booklet_id: string
  base_info: JuejinCourseBaseInfo
  user_info: JuejinCourseAuthor
  event_discount?: JuejinCourseDiscount
  max_discount?: JuejinMaxDiscount
  is_new?: boolean
}

interface JuejinCourseResponse {
  err_no: number
  err_msg: string
  data: JuejinCourseItem[]
  cursor: string
  has_more: boolean
}

interface JuejinCourseCategory {
  category_id: string
  category_name: string
}

interface JuejinCourseCategoryResponse {
  err_no: number
  err_msg: string
  data: JuejinCourseCategory[]
}

interface JuejinCourseCacheEntry<TData> {
  updatedAt: string
  ok: boolean
  data: TData | null
  error?: string
}

interface JuejinCourseCache {
  generatedAt: string
  categories: JuejinCourseCacheEntry<JuejinCourseCategoryResponse>
  courseLists: Record<string, JuejinCourseCacheEntry<JuejinCourseResponse>>
}

const isProd = import.meta.env.PROD
const courseCacheUrl = buildLiveDataUrl(JUEJIN_COURSE_CACHE_FILE)
let juejinCourseCachePromise: Promise<JuejinCourseCache> | null = null

const sortOptions = [
  { label: '全部', value: JUEJIN_COURSE_SORT_DEFAULT },
  { label: '最新', value: JUEJIN_COURSE_SORT_LATEST },
  { label: '热销', value: JUEJIN_COURSE_SORT_HOT }
]

const sortValue = ref<number>(JUEJIN_COURSE_SORT_DEFAULT)
const selectedCategoryId = ref<string>('0')
const courseCategories = ref<JuejinCourseCategory[]>([...JUEJIN_COURSE_FALLBACK_CATEGORIES])
const vipOnly = ref<boolean>(false)
const keyword = ref<string>('')
const courses = ref<JuejinCourseItem[]>([])
const cursor = ref<string>('0')
const hasMore = ref<boolean>(false)
const loading = ref<boolean>(false)
const loadingMore = ref<boolean>(false)
const error = ref<string>('')
const currentTimestamp = ref<number>(Date.now())
const serverClockOffsetMs = ref<number>(0)
let countdownTimer: number | null = null
const isPriceSortActive = computed<boolean>(() => sortValue.value === JUEJIN_COURSE_SORT_PRICE_ASC || sortValue.value === JUEJIN_COURSE_SORT_PRICE_DESC)

const normalizedKeyword = computed<string>(() => keyword.value.trim().toLowerCase())
const filteredCourses = computed<JuejinCourseItem[]>(() => {
  if (!normalizedKeyword.value) return courses.value
  return courses.value.filter((course: JuejinCourseItem): boolean => {
    const text = [
      course.base_info.title,
      course.base_info.summary,
      course.user_info.user_name
    ].join(' ').toLowerCase()
    return text.includes(normalizedKeyword.value)
  })
})

const totalBuyCount = computed<string>(() => {
  const total = filteredCourses.value.reduce((sum: number, course: JuejinCourseItem): number => {
    return sum + Number(course.base_info.buy_count || 0)
  }, 0)
  return formatCount(total)
})
const discountedCount = computed<number>(() => filteredCourses.value.filter(hasDiscount).length)

async function fetchCourses(append: boolean = false): Promise<void> {
  const isLoadMore = append
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
    error.value = ''
  }

  try {
    if (isProd) {
      const response = await fetchCachedCourses()
      courses.value = append ? mergeCourses(courses.value, response.data || []) : response.data || []
      cursor.value = response.cursor || '0'
      hasMore.value = false
      return
    }

    const response = await postJson<JuejinCourseResponse>(JUEJIN_COURSE_API, {
      category_id: selectedCategoryId.value,
      cursor: append ? cursor.value : '0',
      sort: sortValue.value,
      is_vip: vipOnly.value ? 1 : 0,
      limit: 20
    })

    if (response.err_no !== 0) {
      throw new Error(response.err_msg || '掘金课程加载失败')
    }

    courses.value = append ? mergeCourses(courses.value, response.data || []) : response.data || []
    cursor.value = response.cursor || '0'
    hasMore.value = Boolean(response.has_more)
  } catch (err) {
    const message = err instanceof Error ? err.message : '掘金课程加载失败'
    error.value = message
    if (append) {
      ElMessage.error(message)
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function fetchCategories(): Promise<void> {
  try {
    if (isProd) {
      const cache = await loadJuejinCourseCache()
      if (cache.categories.ok && cache.categories.data?.data?.length) {
        courseCategories.value = cache.categories.data.data
      }
      return
    }

    const response = await requestJson<JuejinCourseCategoryResponse>(JUEJIN_COURSE_CATEGORY_API)
    if (response.err_no === 0 && response.data?.length) {
      courseCategories.value = response.data
    }
  } catch {
    courseCategories.value = [...JUEJIN_COURSE_FALLBACK_CATEGORIES]
  }
}

async function fetchCachedCourses(): Promise<JuejinCourseResponse> {
  const cache = await loadJuejinCourseCache()
  const key = courseCacheKey(selectedCategoryId.value, sortValue.value, vipOnly.value ? 1 : 0)
  const entry = cache.courseLists[key]
  if (entry?.ok && entry.data) return entry.data
  throw new Error(entry?.error || '线上课程快照暂无数据')
}

async function loadJuejinCourseCache(): Promise<JuejinCourseCache> {
  if (!juejinCourseCachePromise) {
    juejinCourseCachePromise = readJuejinCourseCache().catch((cacheError: unknown): never => {
      const message = cacheError instanceof Error ? cacheError.message : String(cacheError)
      throw new Error(`加载掘金课程快照失败：${message}`)
    })
  }

  return juejinCourseCachePromise
}

async function readJuejinCourseCache(): Promise<JuejinCourseCache> {
  const candidates = Array.from(new Set([
    courseCacheUrl,
    buildLiveDataFallbackPath(JUEJIN_COURSE_CACHE_FILE)
  ]))
  const errors: string[] = []

  for (const url of candidates) {
    try {
      const cache = await readJsonCache<JuejinCourseCache>({
        primaryUrl: url,
        label: '课程快照',
        validate: (value: JuejinCourseCache): boolean => Boolean(value.courseLists && typeof value.courseLists === 'object')
      })
      return cache
    } catch (error: unknown) {
      errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  throw new Error(errors.join('；'))
}

function courseCacheKey(categoryId: string, sort: number, isVip: number): string {
  return `${categoryId}:${sort}:${isVip}`
}

function mergeCourses(current: JuejinCourseItem[], incoming: JuejinCourseItem[]): JuejinCourseItem[] {
  const seen = new Set(current.map((course: JuejinCourseItem): string => course.booklet_id))
  const next = incoming.filter((course: JuejinCourseItem): boolean => !seen.has(course.booklet_id))
  return current.concat(next)
}

function reloadCourses(): void {
  void fetchCourses(false)
}

function selectCategory(categoryId: string): void {
  if (selectedCategoryId.value === categoryId) return
  selectedCategoryId.value = categoryId
  reloadCourses()
}

function setSort(value: number): void {
  if (sortValue.value === value) return
  sortValue.value = value
}

function togglePriceSort(): void {
  sortValue.value = sortValue.value === JUEJIN_COURSE_SORT_PRICE_DESC ? JUEJIN_COURSE_SORT_PRICE_ASC : JUEJIN_COURSE_SORT_PRICE_DESC
}

function loadMoreCourses(): void {
  if (!hasMore.value || loadingMore.value || keyword.value) return
  void fetchCourses(true)
}

function openBook(bookletId: string): void {
  window.open(buildJuejinBookUrl(bookletId), '_blank', 'noopener,noreferrer')
}

function openUser(userId: string): void {
  if (!userId) return
  window.open(buildJuejinUserUrl(userId), '_blank', 'noopener,noreferrer')
}

function openCourseHome(): void {
  window.open(JUEJIN_COURSE_HOME_URL, '_blank', 'noopener,noreferrer')
}

function displayPrice(course: JuejinCourseItem): number {
  return eventDiscountPrice(course) ?? course.max_discount?.pay_money ?? course.base_info.price
}

function hasDiscount(course: JuejinCourseItem): boolean {
  return displayPrice(course) < course.base_info.price
}

function isVipBook(course: JuejinCourseItem): boolean {
  return Boolean(course.base_info.can_vip_borrow)
}

function eventDiscountPrice(course: JuejinCourseItem): number | null {
  const rate = course.event_discount?.discount_rate
  if (!hasActiveEventDiscount(course) || !rate || rate <= 0) return null
  return Math.round(course.base_info.price * rate / 10)
}

function hasActiveEventDiscount(course: JuejinCourseItem): boolean {
  const discount = course.event_discount
  if (!discount?.end_time) return false

  const now = currentTimestamp.value
  const startTimestamp = discount.start_time ? normalizeTimestamp(discount.start_time) : 0
  const endTimestamp = normalizeTimestamp(discount.end_time)
  return discount.status !== 1 && startTimestamp <= now && endTimestamp > now
}

function eventDiscountLabel(course: JuejinCourseItem): string {
  if (!hasActiveEventDiscount(course)) return ''
  return course.event_discount?.show_label?.trim() || '限时优惠价'
}

function discountCountdownText(course: JuejinCourseItem): string {
  const label = eventDiscountLabel(course)
  const endTime = course.event_discount?.end_time
  if (!label || !endTime) return ''
  return `${label} · ${formatCountdown(endTime)}`
}

function formatCountdown(endTime: number): string {
  const endTimestamp = normalizeTimestamp(endTime)
  const remaining = Math.max(0, endTimestamp - currentTimestamp.value)
  if (remaining <= 0) return '已结束'

  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const time = [hours, minutes, seconds].map((value: number): string => String(value).padStart(2, '0')).join(':')
  return `剩余 ${days} 天 ${time}`
}

function normalizeTimestamp(timestamp: number): number {
  return timestamp > 10_000_000_000 ? timestamp : timestamp * 1000
}

function syncServerClock(response: Response): void {
  const ttTimestamp = Number.parseFloat(response.headers.get('x-tt-timestamp') || '')
  const headerDate = Date.parse(response.headers.get('date') || '')
  const serverTimestamp = Number.isFinite(ttTimestamp) && ttTimestamp > 0
    ? ttTimestamp * 1000
    : headerDate

  if (Number.isFinite(serverTimestamp) && serverTimestamp > 0) {
    serverClockOffsetMs.value = serverTimestamp - Date.now()
    currentTimestamp.value = serverTimestamp
  }
}

function formatPrice(value: number): string {
  return `¥${(Number(value || 0) / 100).toFixed(2)}`
}

function formatCount(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`
  return String(value)
}

watch([sortValue, vipOnly], () => {
  reloadCourses()
})

onMounted(() => {
  void fetchCategories()
  reloadCourses()
  countdownTimer = window.setInterval(() => {
    currentTimestamp.value = Date.now() + serverClockOffsetMs.value
  }, 1000)
})

onUnmounted(() => {
  if (countdownTimer !== null) {
    window.clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<style scoped lang="scss">
@import '../../style/mixins.scss';

.juejin-course-page {
  min-height: 100vh;
  padding: 26px;
  color: #172033;
  background:
    linear-gradient(135deg, rgba(241, 247, 255, 0.88), rgba(255, 255, 255, 0.95) 44%, rgba(255, 249, 238, 0.72)),
    #f6f8fb;
}

.course-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1180px;
  margin: 0 auto 16px;
  padding: 28px 30px;
  border: 1px solid rgba(84, 112, 150, 0.16);
  border-radius: 8px;
  background:
    linear-gradient(110deg, rgba(255, 255, 255, 0.96), rgba(247, 251, 255, 0.92)),
    #ffffff;
  box-shadow: 0 18px 50px rgba(22, 36, 62, 0.1);
}

.hero-copy {
  max-width: 720px;
}

.hero-kicker {
  display: inline-flex;
  margin-bottom: 9px;
  color: #1e63c7;
  font-size: 13px;
  font-weight: 700;
}

.hero-copy h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.18;
  letter-spacing: 0;
}

.hero-copy p {
  margin: 10px 0 0;
  color: #5f6f87;
  font-size: 15px;
  line-height: 1.72;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  justify-content: flex-end;
}

.hero-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease, color 0.16s ease;
}

.hero-action-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.hero-action-button.ghost {
  color: #1e63c7;
  background: rgba(30, 99, 199, 0.08);
  box-shadow: inset 0 0 0 1px rgba(30, 99, 199, 0.15);
}

.hero-action-button.ghost:hover:not(:disabled) {
  background: rgba(30, 99, 199, 0.13);
}

.hero-action-button.ghost:disabled {
  color: #5f6f87;
  cursor: wait;
  background: rgba(95, 111, 135, 0.08);
  box-shadow: inset 0 0 0 1px rgba(95, 111, 135, 0.12);
}

.hero-action-button.loading .el-icon {
  animation: course-spin 0.9s linear infinite;
}

.hero-action-button.primary {
  color: #ffffff;
  background: #1e80ff;
  box-shadow: 0 10px 20px rgba(30, 128, 255, 0.22);
}

.hero-action-button.primary:hover {
  background: #1167d8;
  box-shadow: 0 12px 24px rgba(30, 128, 255, 0.28);
}

.course-controls,
.category-filter,
.course-toolbar,
.course-stats,
.course-grid,
.load-more-row,
.course-state {
  max-width: 1180px;
  margin-right: auto;
  margin-left: auto;
}

.course-controls {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid rgba(84, 112, 150, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 12px 36px rgba(22, 36, 62, 0.07);
}

.category-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  overflow-x: auto;
}

.filter-label {
  flex: 0 0 auto;
  color: #5f6f87;
  font-size: 14px;
  font-weight: 700;
}

.filter-chip,
.sort-button {
  border: 0;
  font: inherit;
  cursor: pointer;
  transition: color 0.18s ease, background 0.18s ease;
}

.filter-chip {
  flex: 0 0 auto;
  min-height: 34px;
  padding: 6px 13px;
  border-radius: 8px;
  color: #4b5e78;
  font-size: 14px;
  font-weight: 700;
  background: transparent;
}

.filter-chip:hover,
.filter-chip.active {
  color: #ffffff;
  background: #1e80ff;
}

.course-toolbar {
  display: grid;
  grid-template-columns: max-content max-content minmax(260px, 1fr);
  align-items: center;
  gap: 12px;
  padding: 8px 0 0;
  border-top: 1px solid rgba(84, 112, 150, 0.11);
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 8px;
  color: #5f6f87;
  font-size: 14px;
  font-weight: 800;
  background: transparent;
}

.sort-button:hover,
.sort-button.active {
  color: #1e80ff;
  background: rgba(30, 128, 255, 0.1);
}

.price-sort-arrows {
  display: inline-grid;
  gap: 0;
  color: #94a3b8;
  font-size: 9px;
  line-height: 0.9;
}

.price-sort-arrows span.active {
  color: #1e80ff;
}

.vip-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  color: #5f6f87;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  user-select: none;
}

.vip-toggle input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.vip-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1px solid rgba(95, 111, 135, 0.48);
  border-radius: 4px;
  background: #ffffff;
}

.vip-toggle.active {
  color: #1e80ff;
}

.vip-toggle.active .vip-check {
  border-color: #1e80ff;
  background: #1e80ff;
}

.vip-toggle.active .vip-check::after {
  width: 8px;
  height: 4px;
  border-bottom: 2px solid #ffffff;
  border-left: 2px solid #ffffff;
  content: '';
  transform: translateY(-1px) rotate(-45deg);
}

.course-search {
  min-width: 0;
}

.course-search :deep(.el-input__wrapper) {
  min-height: 38px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 0 0 1px rgba(84, 112, 150, 0.18);
}

.course-search :deep(.el-input__wrapper.is-focus) {
  box-shadow: inset 0 0 0 1px rgba(30, 128, 255, 0.55), 0 0 0 3px rgba(30, 128, 255, 0.1);
}

.course-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.stat-item {
  padding: 16px;
  border: 1px solid rgba(121, 141, 168, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
}

.stat-item strong {
  display: block;
  color: #13294b;
  font-size: 24px;
  line-height: 1.1;
}

.stat-item span {
  display: block;
  margin-top: 6px;
  color: #66758d;
  font-size: 13px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}

.course-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 486px;
  border: 1px solid rgba(121, 141, 168, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 34px rgba(37, 56, 88, 0.1);
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.course-card:hover,
.course-card:focus-visible {
  transform: translateY(-3px);
  border-color: rgba(30, 128, 255, 0.44);
  box-shadow: 0 18px 42px rgba(37, 56, 88, 0.16);
  outline: none;
}

.cover-wrap {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: #e9eef6;
}

.course-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #1e63c7;
  font-size: 48px;
  font-weight: 800;
}

.corner-badge,
.discount-badge,
.book-vip-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.corner-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 5px 9px;
  color: #ffffff;
  background: #e65d3f;
}

.course-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
}

.course-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.course-title-row h2 {
  min-height: 52px;
  margin: 0;
  font-size: 19px;
  line-height: 1.38;
  letter-spacing: 0;
}

.course-title-badges {
  display: inline-flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  max-width: 120px;
}

.book-vip-badge {
  padding: 4px 8px;
  color: #6f4811;
  background: linear-gradient(135deg, #fff4cf, #f2d291);
  box-shadow: inset 0 0 0 1px rgba(111, 72, 17, 0.12);
}

.discount-badge {
  max-width: 90px;
  padding: 4px 8px;
  color: #9a3412;
  background: #ffedd5;
}

.course-summary {
  min-height: 72px;
  margin: 0;
  color: #5f6f87;
  font-size: 14px;
  line-height: 1.7;
  @include line-clamp(3);
}

.author-line {
  display: flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  gap: 8px;
  color: #24364f;
  font-size: 14px;
  cursor: pointer;
  border-radius: 999px;
}

.author-line:hover,
.author-line:focus-visible {
  color: #1e80ff;
  outline: none;
}

.author-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
}

.author-line small {
  color: #1e63c7;
  font-weight: 700;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
}

.course-meta span {
  padding: 5px 8px;
  border-radius: 999px;
  color: #4b5e78;
  font-size: 12px;
  background: #eef4fb;
}

.offer-countdown {
  width: fit-content;
  max-width: 100%;
  min-height: 30px;
  padding: 6px 12px;
  overflow: hidden;
  border-radius: 999px;
  color: #e65d3f;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgba(230, 93, 63, 0.12);
}

.course-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px 18px;
  border-top: 1px solid rgba(121, 141, 168, 0.14);
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.price-box strong {
  color: #e65d3f;
  font-size: 22px;
}

.origin-price {
  color: #94a3b8;
  font-size: 13px;
  text-decoration: line-through;
}

.course-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 220px;
  border: 1px solid rgba(121, 141, 168, 0.2);
  border-radius: 8px;
  color: #5f6f87;
  background: rgba(255, 255, 255, 0.78);
}

.error-state {
  color: #b42318;
}

.load-more-row {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 860px) {
  .juejin-course-page {
    padding: 16px;
  }

  .course-hero {
    align-items: flex-start;
    flex-direction: column;
    padding: 22px;
  }

  .hero-actions {
    justify-content: flex-start;
  }

  .course-toolbar {
    grid-template-columns: 1fr;
  }

  .course-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@keyframes course-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 520px) {
  .hero-copy h1 {
    font-size: 27px;
  }

  .course-stats,
  .course-grid {
    grid-template-columns: 1fr;
  }

  .course-card {
    min-height: auto;
  }

  .course-footer {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
