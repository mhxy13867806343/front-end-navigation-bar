<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { requestText } from '@/utils/request'

type JandanSectionType = 'home' | 'comments' | 'commentList' | 'forum'

interface JandanSection {
  id: string
  name: string
  icon: string
  sourceUrl: string
  proxyPath: string
  type: JandanSectionType
  pageId?: number
  intro: string
}

interface JandanFeedItem {
  id: string
  title: string
  desc: string
  author: string
  date: string
  link: string
  score?: string
  image?: string
}

interface JandanPagination {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
}

interface JandanApiEnvelope<T> {
  code: number
  msg: string
  data: T | null
}

interface JandanForumResponse {
  total: number
  list: JandanForumItem[]
}

interface JandanForumItem {
  post_id: number
  title: string
  author_name: string
  create_time: string
  update_time: string
  oo: number
  xx: number
  reply_count: number
  last_replier_name: string
}

interface JandanCommentResponse {
  total_pages: number
  current_page: number
  list?: JandanCommentItem[]
}

interface JandanCommentItem {
  id: number
  author: string
  content: string
  date_gmt: string
  vote_positive: number
  vote_negative: number
  sub_comment_count: number
  hot_comments?: JandanTucaoItem[]
}

interface JandanTucaoItem {
  comment_author: string
  comment_content: string
  vote_positive: number
  vote_negative: number
}

const sections: JandanSection[] = [
  {
    id: 'home',
    name: '首页',
    icon: '🥚',
    sourceUrl: 'https://jandan.net/',
    proxyPath: '/api-jandan/',
    type: 'home',
    intro: '煎蛋首页新鲜文章与简短摘要。'
  },
  {
    id: 'treehole',
    name: '树洞',
    icon: '🌳',
    sourceUrl: 'https://jandan.net/treehole',
    proxyPath: '/api-jandan/api/comment/post/102312?order=desc&page=0',
    type: 'comments',
    pageId: 102312,
    intro: '匿名心事、情绪与日常碎片。源站限制部分评论接口时，会保留内部入口和源站跳转。'
  },
  {
    id: 'beauty',
    name: '女装',
    icon: '🧥',
    sourceUrl: 'https://jandan.net/beauty',
    proxyPath: '/api-jandan/api/comment/post/108629?order=desc&page=0',
    type: 'comments',
    pageId: 108629,
    intro: '煎蛋女装分区投稿流。'
  },
  {
    id: 'ooxx',
    name: '随手拍',
    icon: '📷',
    sourceUrl: 'https://jandan.net/ooxx',
    proxyPath: '/api-jandan/api/comment/post/21183?order=desc&page=0',
    type: 'comments',
    pageId: 21183,
    intro: '随手拍图片与生活瞬间。'
  },
  {
    id: 'pic',
    name: '无聊图',
    icon: '🖼️',
    sourceUrl: 'https://jandan.net/pic',
    proxyPath: '/api-jandan/api/comment/post/26402?order=desc&page=0',
    type: 'comments',
    pageId: 26402,
    intro: '无聊图分区图片与评论流。'
  },
  {
    id: 'forum',
    name: '鱼塘',
    icon: '💬',
    sourceUrl: 'https://jandan.net/new/forum',
    proxyPath: '/api-jandan/api/forum/posts/112928?page=1',
    type: 'forum',
    intro: '鱼塘主题帖列表，展示作者、回复数和最后互动。'
  },
  {
    id: 'top',
    name: '热榜',
    icon: '🔥',
    sourceUrl: 'https://jandan.net/top#tab=4hr',
    proxyPath: '/api-jandan/api/top/4hr',
    type: 'commentList',
    intro: '煎蛋 4 小时热榜，展示当前热度较高的评论与图片。'
  },
  {
    id: 'tucao',
    name: '大吐槽',
    icon: '🗯️',
    sourceUrl: 'https://jandan.net/tucao',
    proxyPath: '/api-jandan/api/top/tucao',
    type: 'commentList',
    intro: '煎蛋大吐槽热评流，展示无聊图下的热门吐槽。'
  }
]

const activeSectionId = ref<string>('home')
const items = ref<JandanFeedItem[]>([])
const isLoading = ref<boolean>(false)
const isLiveMode = ref<boolean>(false)
const errorText = ref<string>('')
const currentPage = ref<number>(1)
const totalPages = ref<number>(1)
const hasNextPage = ref<boolean>(false)

const activeSection = computed<JandanSection>(() => {
  return sections.find((section: JandanSection): boolean => section.id === activeSectionId.value) || sections[0]
})

const shouldShowPagination = computed<boolean>(() => {
  return ['home', 'comments', 'forum'].includes(activeSection.value.type) && (totalPages.value > 1 || hasNextPage.value || currentPage.value > 1)
})

const pageButtons = computed<Array<number | string>>(() => {
  const sectionType = activeSection.value.type
  const total = totalPages.value
  const current = currentPage.value

  if (sectionType === 'comments') {
    const pages: Array<number | string> = [current, current - 1, current - 2].filter((page: number): boolean => page >= 1)
    if (current > 1) pages.push('next')
    if (current > 3) pages.push('gap')
    if (current < total) pages.unshift('prev')
    return pages
  }

  const knownTotal = Math.max(total, current)
  const pages = new Set<number>([1, knownTotal, current])
  for (let page = Math.max(1, current - 1); page <= Math.min(knownTotal, current + 2); page += 1) {
    pages.add(page)
  }
  if (hasNextPage.value) {
    pages.add(current + 1)
  }

  const sorted = Array.from(pages).sort((a: number, b: number): number => a - b)
  return sorted.flatMap((page: number, index: number): Array<number | string> => {
    const previous = sorted[index - 1]
    if (index > 0 && page - previous > 1) {
      return [`gap-${previous}-${page}`, page]
    }
    return [page]
  })
})

function normalizeUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `https://jandan.net${url}`
  return url
}

function textFromHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() || ''
}

function firstImageFromHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const image = doc.querySelector('img')
  return normalizeUrl(image?.getAttribute('src') || image?.getAttribute('data-original') || '')
}

function fallbackProxyUrls(url: string): string[] {
  return [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  ]
}

function buildSourceUrl(section: JandanSection = activeSection.value, page: number = currentPage.value): string {
  if (section.type === 'home') {
    return page > 1 ? `https://jandan.net/page/${page}` : section.sourceUrl
  }
  if (section.type === 'comments') {
    const latestPage = totalPages.value || page
    return page > 0 && page < latestPage ? `${section.sourceUrl}/page-${page}` : section.sourceUrl
  }
  return section.sourceUrl
}

function buildProxyPath(section: JandanSection = activeSection.value, page: number = currentPage.value): string {
  if (section.type === 'home') {
    return page > 1 ? `/api-jandan/page/${page}` : section.proxyPath
  }
  if (section.type === 'forum') {
    return `/api-jandan/api/forum/posts/112928?page=${Math.max(1, page)}`
  }
  if (section.type === 'comments') {
    const requestPage = page > 1 ? page : 0
    return `/api-jandan/api/comment/post/${section.pageId}?order=desc&page=${requestPage}`
  }
  return section.proxyPath
}

async function requestTextWithFallback(proxyPath: string, sourceUrl: string): Promise<string> {
  const targets = [proxyPath, ...fallbackProxyUrls(sourceUrl)]
  let lastError: unknown = null

  for (const target of targets) {
    try {
      return await requestText(target)
    } catch (error: unknown) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError || '请求失败'))
}

function parseHomePagination(html: string, fallbackPage: number): JandanPagination {
  const pageNumbers = Array.from(html.matchAll(/\/page\/(\d+)/g)).map((match: RegExpMatchArray): number => Number(match[1]))
  const nextPage = pageNumbers.find((page: number): boolean => page > fallbackPage)
  return {
    currentPage: fallbackPage,
    totalPages: Math.max(fallbackPage, ...pageNumbers, 1),
    hasNextPage: Boolean(nextPage)
  }
}

function applyPagination(pagination: JandanPagination): void {
  currentPage.value = pagination.currentPage
  totalPages.value = pagination.totalPages
  hasNextPage.value = pagination.hasNextPage
}

async function requestJsonWithFallback<T>(proxyPath: string, sourceUrl: string): Promise<T> {
  const text = await requestTextWithFallback(proxyPath, sourceUrl)
  return JSON.parse(text) as T
}

function parseHomeHtml(html: string): JandanFeedItem[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(doc.querySelectorAll('.post-item'))
    .slice(0, 24)
    .map((card: Element): JandanFeedItem | null => {
      const titleLink = card.querySelector<HTMLAnchorElement>('.post-title a')
      if (!titleLink) return null
      const desc = card.querySelector('.post-excerpt')?.textContent?.replace(/\s+/g, ' ').trim() || ''
      const commentCount = card.querySelector('.post-comment-count')?.textContent?.replace(/\s+/g, ' ').trim() || ''
      const image = card.querySelector<HTMLImageElement>('.post-thumb img')?.getAttribute('src') || ''
      return {
        id: titleLink.getAttribute('href') || titleLink.textContent || '',
        title: titleLink.textContent?.trim() || '未命名文章',
        desc,
        author: '煎蛋',
        date: '',
        link: normalizeUrl(titleLink.getAttribute('href') || ''),
        score: commentCount,
        image: normalizeUrl(image)
      }
    })
    .filter((item: JandanFeedItem | null): item is JandanFeedItem => Boolean(item))
}

function mapForumItems(payload: JandanForumResponse): JandanFeedItem[] {
  return payload.list.map((item: JandanForumItem): JandanFeedItem => ({
    id: String(item.post_id),
    title: item.title,
    desc: `最后回复：${item.last_replier_name || '暂无'} · OO ${item.oo} / XX ${item.xx}`,
    author: item.author_name,
    date: formatDateLabel(item.update_time || item.create_time),
    link: `https://jandan.net/new/forum/topic/${item.post_id}`,
    score: `${item.reply_count} 回复`
  }))
}

function formatDateLabel(value: string): string {
  if (!value) return ''
  return value
    .replace('T', ' ')
    .replace(/\+\d{2}:\d{2}$/, '')
    .replace(/:\d{2}$/, '')
}

function mapCommentItems(payload: JandanCommentResponse, section: JandanSection): JandanFeedItem[] {
  return (payload.list || []).map((item: JandanCommentItem): JandanFeedItem => ({
    id: String(item.id),
    title: textFromHtml(item.content).slice(0, 56) || `${section.name} #${item.id}`,
    desc: textFromHtml(item.content).slice(0, 180),
    author: item.author,
    date: formatDateLabel(item.date_gmt),
    link: `https://jandan.net/t/${item.id}`,
    score: `OO ${item.vote_positive} / XX ${item.vote_negative} · ${item.sub_comment_count} 吐槽`,
    image: firstImageFromHtml(item.content)
  }))
}

function mapCommentListItems(list: JandanCommentItem[], section: JandanSection): JandanFeedItem[] {
  return list.map((item: JandanCommentItem): JandanFeedItem => {
    const commentText = textFromHtml(item.content)
    const hotComment = item.hot_comments?.[0]
    const hotCommentText = hotComment ? textFromHtml(hotComment.comment_content) : ''

    return {
      id: String(item.id),
      title: commentText.slice(0, 56) || hotCommentText.slice(0, 56) || `${section.name} #${item.id}`,
      desc: hotCommentText ? `热评：${hotCommentText}` : commentText.slice(0, 180),
      author: item.author,
      date: formatDateLabel(item.date_gmt),
      link: `https://jandan.net/t/${item.id}`,
      score: `OO ${item.vote_positive} / XX ${item.vote_negative} · ${item.sub_comment_count} 吐槽`,
      image: firstImageFromHtml(item.content)
    }
  })
}

async function loadJandan(): Promise<void> {
  const section = activeSection.value
  const requestedPage = currentPage.value
  isLoading.value = true
  isLiveMode.value = false
  errorText.value = ''
  items.value = []

  try {
    if (section.type === 'home') {
      const html = await requestTextWithFallback(buildProxyPath(section, requestedPage), buildSourceUrl(section, requestedPage))
      items.value = parseHomeHtml(html)
      applyPagination(parseHomePagination(html, requestedPage))
    } else if (section.type === 'forum') {
      const page = Math.max(1, requestedPage)
      const payload = await requestJsonWithFallback<JandanApiEnvelope<JandanForumResponse>>(buildProxyPath(section, page), `https://jandan.net/api/forum/posts/112928?page=${page}`)
      items.value = payload.data ? mapForumItems(payload.data) : []
      const pageSize = Math.max(items.value.length, 1)
      applyPagination({
        currentPage: page,
        totalPages: payload.data ? Math.max(1, Math.ceil(payload.data.total / pageSize)) : page,
        hasNextPage: payload.data ? page * pageSize < payload.data.total : false
      })
    } else if (section.type === 'comments') {
      const payload = await requestJsonWithFallback<JandanApiEnvelope<JandanCommentResponse>>(
        buildProxyPath(section, requestedPage),
        `https://jandan.net/api/comment/post/${section.pageId}?order=desc&page=${requestedPage > 1 ? requestedPage : 0}`
      )
      items.value = payload.data ? mapCommentItems(payload.data, section) : []
      if (payload.data) {
        applyPagination({
          currentPage: payload.data.current_page,
          totalPages: payload.data.total_pages,
          hasNextPage: payload.data.current_page > 1
        })
      }
      if (!payload.data && payload.msg) {
        errorText.value = payload.msg
      }
    } else if (section.type === 'commentList') {
      const payload = await requestJsonWithFallback<JandanApiEnvelope<JandanCommentItem[]>>(section.proxyPath, section.sourceUrl)
      items.value = Array.isArray(payload.data) ? mapCommentListItems(payload.data, section) : []
      if (!payload.data && payload.msg) {
        errorText.value = payload.msg
      }
    }

    isLiveMode.value = items.value.length > 0
    if (!items.value.length && !errorText.value) {
      errorText.value = '源站当前没有返回可展示的数据，已保留内部入口与原站打开。'
    }
  } catch (error: unknown) {
    errorText.value = error instanceof Error ? error.message : String(error)
  } finally {
    isLoading.value = false
  }
}

function selectSection(sectionId: string): void {
  if (isLoading.value || activeSectionId.value === sectionId) return
  activeSectionId.value = sectionId
  const section = sections.find((item: JandanSection): boolean => item.id === sectionId)
  currentPage.value = section?.type === 'comments' ? 0 : 1
  totalPages.value = 1
  hasNextPage.value = false
  void loadJandan()
}

function goToPage(page: number): void {
  if (isLoading.value || page < 1) return
  const sectionType = activeSection.value.type
  if (!['home', 'comments', 'forum'].includes(sectionType)) return
  const upperLimit = totalPages.value > 1 ? totalPages.value : Math.max(page, currentPage.value)
  const normalizedPage = Math.max(1, Math.min(page, upperLimit))
  if (normalizedPage === currentPage.value) return
  currentPage.value = normalizedPage
  void loadJandan()
}

function handlePageButton(page: number | string): void {
  if (typeof page === 'number') {
    goToPage(page)
  } else if (page === 'next') {
    goToPage(currentPage.value - 1)
  } else if (page === 'prev') {
    goToPage(currentPage.value + 1)
  }
}

function pageButtonLabel(page: number | string): string {
  if (page === 'next') return 'NEXT'
  if (page === 'prev') return 'PREV'
  if (typeof page === 'string') return '...'
  return String(page)
}

function openSource(url: string): void {
  if (isLoading.value) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  currentPage.value = activeSection.value.type === 'comments' ? 0 : 1
  void loadJandan()
})
</script>

<template>
  <section class="jandan-page">
    <div class="jandan-shell">
      <header class="jandan-header">
        <div>
          <p class="eyebrow">Jandan</p>
          <h1>煎蛋页面</h1>
          <p>树洞、女装、随手拍、无聊图、鱼塘、热榜、大吐槽与首页统一收进内部页面。</p>
        </div>
        <div class="source-state" :class="{ live: isLiveMode }">
          <span>{{ isLiveMode ? '实时数据' : '内部入口' }}</span>
          <button type="button" :disabled="isLoading" @click="openSource(buildSourceUrl())">打开原站</button>
        </div>
      </header>

      <nav class="section-tabs" aria-label="煎蛋栏目">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          :class="{ active: activeSectionId === section.id }"
          :disabled="isLoading"
          @click="selectSection(section.id)"
        >
          <span>{{ section.icon }}</span>
          <span>{{ section.name }}</span>
        </button>
      </nav>

      <div class="section-summary">
        <strong>{{ activeSection.icon }} {{ activeSection.name }}</strong>
        <span>{{ activeSection.intro }}</span>
      </div>

      <div v-if="isLoading" class="content-state">正在加载 {{ activeSection.name }} 数据...</div>

      <template v-else>
        <div v-if="items.length" class="feed-grid">
          <article v-for="item in items" :key="item.id" class="feed-card" :class="{ 'has-image': item.image }">
            <img v-if="item.image" :src="item.image" alt="" loading="lazy">
            <div class="feed-card-body">
              <h2>{{ item.title }}</h2>
              <p>{{ item.desc }}</p>
              <div class="feed-meta">
                <span v-if="item.author">{{ item.author }}</span>
                <span v-if="item.date">{{ item.date }}</span>
                <span v-if="item.score">{{ item.score }}</span>
              </div>
              <button type="button" :disabled="isLoading" @click="openSource(item.link)">阅读全文</button>
            </div>
          </article>
        </div>

        <nav v-if="items.length && shouldShowPagination" class="page-controls" aria-label="煎蛋分页">
          <button
            v-for="page in pageButtons"
            :key="page"
            type="button"
            :disabled="typeof page === 'string' && !['next', 'prev'].includes(page)"
            :class="{ active: page === currentPage, gap: typeof page === 'string' && !['next', 'prev'].includes(page) }"
            @click="handlePageButton(page)"
          >
            {{ pageButtonLabel(page) }}
          </button>
        </nav>

        <div v-if="!items.length" class="content-state empty">
          <strong>{{ activeSection.name }} 暂无可展示列表</strong>
          <span>{{ errorText }}</span>
          <button type="button" :disabled="isLoading" @click="openSource(buildSourceUrl())">打开 {{ activeSection.name }}</button>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped lang="scss">
.jandan-page {
  min-height: 100%;
  padding: 20px;
  background: var(--bg-primary);
}

.jandan-shell {
  display: grid;
  gap: 18px;
  width: min(1180px, 100%);
  margin: 0 auto;
}

.jandan-header,
.section-summary,
.content-state,
.feed-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
}

.jandan-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.jandan-header h1 {
  margin: 0;
  font-size: 26px;
}

.jandan-header p {
  margin: 8px 0 0;
  color: var(--text-secondary);
}

.source-state {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  color: #f59e0b;
  font-size: 13px;
  font-weight: 800;
}

.source-state.live {
  color: #16a34a;
}

button {
  min-height: 34px;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  padding: 0 12px;
  color: var(--text-color);
  background: var(--bg-primary);
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

button:hover:not(:disabled),
.section-tabs button.active {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.section-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.section-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
}

.section-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 12px 14px;
}

.section-summary span {
  color: var(--text-secondary);
}

.page-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px 16px;
  background: var(--card-bg);
}

.page-controls button {
  min-width: 42px;
  border-radius: 2px;
  font-weight: 800;
}

.page-controls button.active {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 12%, var(--bg-primary));
}

.page-controls button.gap {
  min-width: 30px;
  border-color: transparent;
  color: var(--text-secondary);
  background: transparent;
}

.content-state {
  display: grid;
  gap: 10px;
  min-height: 160px;
  place-items: center;
  padding: 24px;
  color: var(--text-secondary);
  text-align: center;
}

.content-state.empty strong {
  color: var(--text-color);
}

.feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.feed-card {
  display: block;
  min-height: 0;
  overflow: hidden;
}

.feed-card.has-image {
  display: grid;
  grid-template-columns: 142px minmax(0, 1fr);
  min-height: 150px;
}

.feed-card img {
  width: 142px;
  height: 100%;
  object-fit: cover;
  background: var(--hover-bg);
}

.feed-card-body {
  display: grid;
  align-content: start;
  gap: 9px;
  min-width: 0;
  padding: 12px;
}

.feed-card h2 {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--text-color);
  font-size: 15px;
  line-height: 1.45;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.feed-card p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.55;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.feed-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 12px;
}

.feed-meta span {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 2px 6px;
  background: var(--hover-bg);
}

.feed-card button {
  justify-self: start;
}

@media (max-width: 720px) {
  .jandan-page {
    padding: 12px;
  }

  .jandan-header {
    display: grid;
  }

  .feed-card.has-image {
    grid-template-columns: 1fr;
  }

  .feed-card img {
    width: 100%;
    height: 180px;
  }
}
</style>
