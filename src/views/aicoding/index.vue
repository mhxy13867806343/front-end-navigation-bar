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
          :class="{ active: activeNavKey === item.key, disabled: !item.supported }"
          @click="switchNav(item)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-title">{{ item.title }}</span>
          <span v-if="item.children?.length" class="nav-arrow">⌄</span>
        </button>

        <div class="nav-tip">当前接入文章榜接口，收藏按钮与收藏动作已移除。</div>
      </aside>

      <main class="hot-content">
        <header class="content-header">
          <div>
            <h2>{{ activeTitle }} · {{ activeCategoryLabel }}</h2>
            <p>{{ headerDescription }}</p>
          </div>
          <RefreshCountdownButton :on-refresh="handleRefresh" />
        </header>

        <nav class="category-tabs" aria-label="文章分类">
          <button
            v-for="category in categoryOptions"
            :key="category.value"
            type="button"
            :class="{ active: activeCategoryId === category.value }"
            @click="switchCategory(category.value)"
          >
            {{ category.label }}
          </button>
        </nav>

        <div v-if="loading && !articles.length" class="state-block">加载中...</div>
        <div v-else-if="error" class="state-block error">
          <span>{{ error }}</span>
          <button type="button" @click="reload">重试</button>
        </div>
        <ol v-else-if="articles.length" class="rank-list">
          <li v-for="article in articles" :key="article.id" class="rank-item">
            <span class="rank-num" :class="{ hot: article.rank <= 3 }">{{ article.rank }}</span>
            <div class="rank-main">
              <a class="rank-title" :href="article.url" target="_blank" rel="noopener">
                {{ article.title }}
              </a>
              <div class="rank-meta">
                <img
                  v-if="article.authorAvatar"
                  class="author-avatar"
                  :src="article.authorAvatar"
                  :alt="article.authorName"
                  loading="lazy"
                />
                <span>{{ article.authorName }}</span>
                <span>·</span>
                <span>{{ formatCount(article.viewCount) }} 浏览</span>
                <span>·</span>
                <span>{{ formatCount(article.interactCount) }} 互动</span>
                <span>·</span>
                <span>{{ formatCount(article.collectCount) }} 收藏</span>
              </div>
            </div>
            <strong class="hot-rank">
              <span v-if="article.rank <= 3">🔥</span>
              {{ formatCount(article.hotRank) }}
              <em>热度</em>
            </strong>
          </li>
        </ol>
        <div v-else class="state-block">暂无热榜数据</div>
      </main>
    </div>

    <el-backtop target=".route-view-layer" :right="40" :bottom="40" :visibility-height="200" />
  </section>
</template>

<script setup lang="ts">
import type { ComputedRef, Ref } from 'vue'
import RefreshCountdownButton from '../../components/RefreshCountdownButton.vue'
import { requestJson } from '@/utils/request'
import {
  JUEJIN_HOT_CATEGORY_OPTIONS,
  JUEJIN_HOT_SIDE_NAV,
  buildJuejinArticleRankUrl
} from '@/vue-pages-text-fn-abc/juejinHot'
import type {
  JuejinArticleRankType,
  JuejinHotCategory,
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

interface JuejinHotResponse {
  err_no: number
  err_msg?: string
  data?: JuejinHotArticleRaw[]
}

interface JuejinHotArticle {
  id: string
  title: string
  url: string
  rank: number
  authorName: string
  authorAvatar: string
  viewCount: number
  interactCount: number
  collectCount: number
  hotRank: number
}

const sideNavItems: JuejinHotNavItem[] = JUEJIN_HOT_SIDE_NAV
const categoryOptions: JuejinHotCategory[] = JUEJIN_HOT_CATEGORY_OPTIONS
const activeNavKey: Ref<string> = ref<string>('articles')
const activeRankType: Ref<JuejinArticleRankType> = ref<JuejinArticleRankType>('hot')
const activeCategoryId: Ref<string> = ref<string>('1')
const articles: Ref<JuejinHotArticle[]> = ref<JuejinHotArticle[]>([])
const loading: Ref<boolean> = ref<boolean>(false)
const error: Ref<string> = ref<string>('')

let requestSeq: number = 0

const activeNav: ComputedRef<JuejinHotNavItem> = computed<JuejinHotNavItem>(() => {
  return sideNavItems.find((item: JuejinHotNavItem): boolean => item.key === activeNavKey.value) || sideNavItems[0]
})

const activeTitle: ComputedRef<string> = computed<string>((): string => activeNav.value.title)

const activeCategoryLabel: ComputedRef<string> = computed<string>((): string => {
  const category: JuejinHotCategory | undefined = categoryOptions.find((item: JuejinHotCategory): boolean => {
    return item.value === activeCategoryId.value
  })

  return category?.label || '综合'
})

const headerDescription: ComputedRef<string> = computed<string>((): string => {
  return activeRankType.value === 'collect'
    ? '最近 3 日内发布文章，按收藏、阅读、互动等数据计算热度。'
    : '最近 3 日内发布文章，基于阅读、点赞、评论、收藏数据计算热度。'
})

onMounted((): void => {
  fetchArticleRank()
})

async function fetchArticleRank(): Promise<void> {
  const seq: number = ++requestSeq
  loading.value = true
  error.value = ''

  try {
    const url: string = buildJuejinArticleRankUrl(activeCategoryId.value, activeRankType.value)
    const json: JuejinHotResponse = await requestJson<JuejinHotResponse>(url)

    if (seq !== requestSeq) return
    if (json.err_no !== 0) throw new Error(json.err_msg || '获取掘金热榜失败')

    articles.value = (json.data || [])
      .map((item: JuejinHotArticleRaw, index: number): JuejinHotArticle | null => mapArticle(item, index))
      .filter((item: JuejinHotArticle | null): item is JuejinHotArticle => Boolean(item))
  } catch (e: unknown) {
    if (seq !== requestSeq) return
    const message: string = e instanceof Error ? e.message : String(e)
    error.value = `加载失败：${message}`
    articles.value = []
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}

function mapArticle(item: JuejinHotArticleRaw, index: number): JuejinHotArticle | null {
  const content: JuejinHotContentRaw | undefined = item.content
  const counter: JuejinHotCounterRaw | undefined = item.content_counter
  const author: JuejinHotAuthorRaw | undefined = item.author

  if (!content?.content_id) return null

  return {
    id: content.content_id,
    title: content.title || '未命名文章',
    url: `https://juejin.cn/post/${content.content_id}`,
    rank: index + 1,
    authorName: author?.name || '匿名作者',
    authorAvatar: author?.avatar || '',
    viewCount: counter?.view || 0,
    interactCount: counter?.interact_count || 0,
    collectCount: counter?.collect || 0,
    hotRank: counter?.hot_rank || 0
  }
}

function switchNav(item: JuejinHotNavItem): void {
  if (!item.supported || !item.rankType || activeNavKey.value === item.key) return
  activeNavKey.value = item.key
  activeRankType.value = item.rankType
  activeCategoryId.value = '1'
  fetchArticleRank()
}

function switchCategory(categoryId: string): void {
  if (activeCategoryId.value === categoryId) return
  activeCategoryId.value = categoryId
  fetchArticleRank()
}

function reload(): void {
  fetchArticleRank()
}

async function handleRefresh(): Promise<void> {
  await fetchArticleRank()
}

function formatCount(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}
</script>

<style scoped>
.juejin-hot-page {
  min-height: 100%;
  background:
    linear-gradient(180deg, #102035 0, #121416 230px),
    #121416;
  color: #d8dde7;
}

.hot-hero {
  min-height: 150px;
  background:
    linear-gradient(120deg, rgba(26, 58, 94, 0.95), rgba(18, 28, 44, 0.7)),
    radial-gradient(circle at 82% 25%, rgba(64, 139, 255, 0.28), transparent 32%);
}

.hero-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 44px 24px 26px;
}

.hero-inner h1 {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  color: #f5f8ff;
  font-size: 40px;
  line-height: 1;
  letter-spacing: 0;
}

.hero-inner span {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(118, 172, 255, 0.8);
  border-radius: 18px;
  background: linear-gradient(180deg, #8bb7ff, #295d9c);
  color: #fff;
  font-size: 16px;
  font-weight: 800;
}

.hot-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 32px;
  max-width: 1180px;
  margin: -20px auto 0;
  padding: 0 24px 48px;
}

.hot-sidebar,
.hot-content {
  border-radius: 6px;
  background: #181818;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28);
}

.hot-sidebar {
  align-self: start;
  padding: 8px;
}

.nav-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 20px;
  align-items: center;
  width: 100%;
  min-height: 54px;
  padding: 0 16px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #9fa5ad;
  cursor: pointer;
  text-align: left;
  font-size: 16px;
  font-weight: 700;
}

.nav-item:hover:not(.disabled),
.nav-item.active {
  background: #223450;
  color: #4a9cff;
}

.nav-item.disabled {
  cursor: default;
  opacity: 0.68;
}

.nav-icon {
  color: currentColor;
  font-size: 17px;
}

.nav-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-arrow {
  color: #77808d;
  text-align: right;
}

.nav-tip {
  margin: 12px 12px 4px;
  padding-top: 12px;
  border-top: 1px solid #2a2f35;
  color: #6f7782;
  font-size: 12px;
  line-height: 1.7;
}

.hot-content {
  min-width: 0;
  padding: 28px 30px 18px;
}

.content-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.content-header h2 {
  margin: 0 0 8px;
  color: #d8dde7;
  font-size: 22px;
  line-height: 1.3;
}

.content-header p {
  margin: 0;
  color: #818891;
  font-size: 13px;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #2a2f35;
}

.category-tabs button {
  min-height: 30px;
  padding: 0 12px;
  border: 1px solid #2f3845;
  border-radius: 4px;
  background: #151b23;
  color: #9ba3ad;
  cursor: pointer;
  font-size: 13px;
}

.category-tabs button:hover,
.category-tabs button.active {
  border-color: #2c79ff;
  background: #1d3351;
  color: #58a0ff;
}

.rank-list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
}

.rank-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 140px;
  align-items: center;
  gap: 18px;
  min-height: 92px;
  border-bottom: 1px solid #24282e;
}

.rank-item:last-child {
  border-bottom: 0;
}

.rank-num {
  color: #b7bec8;
  font-size: 20px;
  font-weight: 800;
  text-align: center;
}

.rank-num.hot {
  color: #ff4d4f;
}

.rank-main {
  min-width: 0;
}

.rank-title {
  display: block;
  overflow: hidden;
  color: #d8dde7;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.5;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-title:hover {
  color: #5aa2ff;
}

.rank-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  color: #818891;
  font-size: 13px;
}

.author-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.hot-rank {
  justify-self: end;
  color: #d8dde7;
  font-size: 24px;
  white-space: nowrap;
}

.hot-rank em {
  margin-left: 4px;
  color: #818891;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
}

.state-block {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 280px;
  color: #818891;
}

.state-block.error {
  color: #ff7a7a;
}

.state-block button {
  border: 1px solid #2c79ff;
  border-radius: 4px;
  background: #1d3351;
  color: #58a0ff;
  cursor: pointer;
  padding: 6px 14px;
}

@media (max-width: 900px) {
  .hot-layout {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: -12px;
  }

  .hot-sidebar {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .nav-tip {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .hero-inner {
    padding: 34px 16px 22px;
  }

  .hero-inner h1 {
    font-size: 32px;
  }

  .hot-layout {
    padding: 0 12px 32px;
  }

  .hot-sidebar {
    grid-template-columns: 1fr;
  }

  .hot-content {
    padding: 20px 14px 10px;
  }

  .content-header {
    display: block;
  }

  .rank-item {
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 10px;
    padding: 14px 0;
  }

  .hot-rank {
    grid-column: 2;
    justify-self: start;
    font-size: 17px;
  }

  .rank-title {
    white-space: normal;
  }
}
</style>
