<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ContentFavoriteButton from '@/components/ContentFavoriteButton.vue'
import { useContentItemFavorites } from '@/composables/useContentItemFavorites'
import { requestText } from '@/utils/request'

type TopHubSectionType = 'home' | 'category' | 'calendar'

interface TopHubSection {
  id: string
  name: string
  icon: string
  path: string
  type: TopHubSectionType
  intro: string
}

interface TopHubItem {
  rank: string
  title: string
  extra: string
  link: string
}

interface TopHubBoard {
  id: string
  title: string
  subtitle: string
  icon: string
  iconLabel: string
  items: TopHubItem[]
}

interface TopHubCalendarEvent {
  id: string
  title: string
}

interface TopHubPagination {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
}

interface TopHubTarget {
  url: string
  kind: 'html' | 'markdown'
  timeoutMs: number
}

interface TopHubTextResult {
  text: string
  kind: TopHubTarget['kind']
}

const primarySections: TopHubSection[] = [
  { id: 'home', name: '首页', icon: '热', path: '/', type: 'home', intro: 'TopHub 首页热门榜单聚合。' },
  { id: 'calendar', name: '日历', icon: '历', path: '/calendar', type: 'calendar', intro: '热点日历事件、节日、纪念日与营销节点。' },
  { id: 'news', name: '综合', icon: '综', path: '/c/news', type: 'category', intro: '综合新闻、搜索热榜与全网热点。' },
  { id: 'tech', name: '科技', icon: '科', path: '/c/tech', type: 'category', intro: '科技媒体、产品、硬件和技术趋势榜单。' },
  { id: 'ent', name: '娱乐', icon: '娱', path: '/c/ent', type: 'category', intro: '影视、音乐、综艺和娱乐社区热点。' },
  { id: 'community', name: '社区', icon: '社', path: '/c/community', type: 'category', intro: '社区讨论、论坛和兴趣内容榜单。' },
  { id: 'shopping', name: '购物', icon: '购', path: '/c/shopping', type: 'category', intro: '电商热销、优惠线报和购物榜单。' },
  { id: 'finance', name: '财经', icon: '财', path: '/c/finance', type: 'category', intro: '财经资讯、市场、股票和商业内容。' },
  { id: 'developer', name: '开发', icon: '开', path: '/c/developer', type: 'category', intro: '开发者社区、开源项目和技术文章榜单。' },
  { id: 'brief', name: '简报', icon: '简', path: '/c/brief', type: 'category', intro: '简报类资讯和高密度阅读榜单。' },
  { id: 'ai', name: 'AI', icon: 'AI', path: '/c/ai', type: 'category', intro: '人工智能工具、文章和资讯榜单。' }
]

const secondarySections: TopHubSection[] = [
  { id: 'epaper', name: '报刊', icon: '报', path: '/c/epaper', type: 'category', intro: '报刊、杂志和媒体期刊榜单。' },
  { id: 'design', name: '设计', icon: '设', path: '/c/design', type: 'category', intro: '设计资讯、灵感和创意资源榜单。' },
  { id: 'university', name: '校务', icon: '校', path: '/c/university', type: 'category', intro: '高校通知、校务动态和校园内容。' },
  { id: 'organization', name: '政务', icon: '政', path: '/c/organization', type: 'category', intro: '政务、机构公告和公共信息榜单。' },
  { id: 'blog', name: '专栏', icon: '专', path: '/c/blog', type: 'category', intro: '博客、专栏和作者内容榜单。' },
  { id: 'apple', name: '苹果', icon: '苹', path: '/apple', type: 'category', intro: '苹果生态、应用和设备相关内容。' },
  { id: 'wxmp', name: '公众号', icon: '号', path: '/c/wxmp', type: 'category', intro: '微信公众号节点与订阅入口。' },
  { id: 'widget', name: '小部件', icon: '件', path: '/c/widget', type: 'category', intro: 'TopHub 小部件和聚合组件入口。' },
  { id: 'manage', name: '自定义分组', icon: '组', path: '/manage', type: 'category', intro: '源站自定义分组管理入口。' }
]

const sections: TopHubSection[] = [...primarySections, ...secondarySections]

const boards = ref<TopHubBoard[]>([])
const calendarEvents = ref<TopHubCalendarEvent[]>([])
const isLoading = ref<boolean>(false)
const isLiveMode = ref<boolean>(false)
const errorText = ref<string>('')
const selectedBoardId = ref<string>('')
const activeSectionId = ref<string>('home')
const currentPage = ref<number>(1)
const totalPages = ref<number>(1)
const hasNextPage = ref<boolean>(false)
const { isContentItemFavorite, toggleContentItemFavorite } = useContentItemFavorites()

const activeSection = computed<TopHubSection>(() => {
  return sections.find((section: TopHubSection): boolean => section.id === activeSectionId.value) || sections[0]
})

const selectedBoard = computed<TopHubBoard | undefined>(() => {
  return boards.value.find((board: TopHubBoard): boolean => board.id === selectedBoardId.value) || boards.value[0]
})

const shouldShowPagination = computed<boolean>(() => {
  return activeSection.value.type === 'category' && (totalPages.value > 1 || hasNextPage.value || currentPage.value > 1)
})

const pageButtons = computed<Array<number | string>>(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 1) return [current]

  const pages = new Set<number>([1, total, current])
  for (let page = Math.max(1, current - 2); page <= Math.min(total, current + 2); page += 1) {
    pages.add(page)
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

function normalizeTopHubUrl(url: string): string {
  if (!url) return 'https://tophub.today/'
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `https://tophub.today${url}`
  return url
}

function buildSectionSourceUrl(section: TopHubSection = activeSection.value, page: number = currentPage.value): string {
  const path = section.path === '/' ? '/' : section.path
  const pageQuery = section.type === 'category' && page > 1 ? `?&p=${page}` : ''
  return `https://tophub.today${path}${pageQuery}`
}

function buildProxyPath(section: TopHubSection, page: number): string {
  const pageQuery = section.type === 'category' && page > 1 ? `?&p=${page}` : ''
  return `/api-tophub${section.path}${pageQuery}`
}

function boardIconLabel(title: string): string {
  const normalizedTitle = title.replace(/\s+/g, '')
  const knownLabels: Array<[string, string]> = [
    ['淘宝', '淘'],
    ['天猫', '猫'],
    ['京东', '京'],
    ['微博', '微'],
    ['知乎', '知'],
    ['微信', '信'],
    ['百度', '百'],
    ['36氪', '氪'],
    ['少数派', '少'],
    ['虎嗅', '虎'],
    ['IT之家', 'IT'],
    ['掘金', '掘'],
    ['机器之心', '机'],
    ['量子位', '量'],
    ['Readhub', 'R'],
    ['哔哩哔哩', 'B'],
    ['抖音', '抖']
  ]
  return knownLabels.find(([keyword]: [string, string]): boolean => normalizedTitle.includes(keyword))?.[1] || normalizedTitle.slice(0, 2) || '榜'
}

function parseTopHubHtml(html: string): TopHubBoard[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(doc.querySelectorAll('.cc-cd, .cc-bo, .cc-mp'))
    .slice(0, 18)
    .map((card: Element, index: number): TopHubBoard | null => {
      const isCompactBoard = card.classList.contains('cc-bo')
      const isMediaBoard = card.classList.contains('cc-mp')
      const title = (
        card.querySelector('.cc-cd-lb')?.textContent ||
        card.querySelector('.cc-bo-card .dt')?.textContent ||
        card.querySelector('.cc-mp-card .tt')?.textContent ||
        ''
      ).replace(/\s+/g, ' ').trim()
      const subtitle = (
        card.querySelector('.cc-cd-sb-st')?.textContent ||
        card.querySelector('.cc-bo-card .di')?.textContent ||
        card.querySelector('.cc-mp-card .dd')?.textContent ||
        ''
      ).replace(/\s+/g, ' ').trim()
      const icon = (
        card.querySelector<HTMLImageElement>('.cc-cd-lb img')?.getAttribute('src') ||
        card.querySelector<HTMLImageElement>('.cc-bo-pic img')?.getAttribute('src') ||
        card.querySelector<HTMLImageElement>('.cc-mp-card .dc img')?.getAttribute('src') ||
        ''
      )
      const headlineItems = Array.from(card.querySelectorAll<HTMLAnchorElement>('.cc-cd-cb-l > a'))
        .map((link: HTMLAnchorElement): TopHubItem | null => {
          const itemTitle = link.querySelector('.t')?.textContent?.replace(/\s+/g, ' ').trim() || ''
          if (!itemTitle) return null
          return {
            rank: link.querySelector('.s')?.textContent?.replace(/\s+/g, ' ').trim() || '',
            title: itemTitle,
            extra: link.querySelector('.e')?.textContent?.replace(/\s+/g, ' ').trim() || '',
            link: normalizeTopHubUrl(link.getAttribute('href') || '')
          }
        })
        .filter((item: TopHubItem | null): item is TopHubItem => Boolean(item))
      const compactItems = Array.from(card.querySelectorAll<HTMLAnchorElement>('.cc-bo-card .da'))
        .map((link: HTMLAnchorElement, itemIndex: number): TopHubItem | null => {
          const itemTitle = link.textContent?.replace(/\s+/g, ' ').trim() || ''
          if (!itemTitle) return null
          return {
            rank: String(itemIndex + 1),
            title: itemTitle,
            extra: '',
            link: normalizeTopHubUrl(link.getAttribute('href') || '')
          }
        })
        .filter((item: TopHubItem | null): item is TopHubItem => Boolean(item))
      const nodeLink = (
        card.querySelector<HTMLAnchorElement>('.cc-bo-card .dt')?.getAttribute('href') ||
        card.querySelector<HTMLAnchorElement>('.cc-mp-card .tt')?.getAttribute('href') ||
        card.querySelector<HTMLAnchorElement>('.cc-mp-card .dc')?.getAttribute('href') ||
        ''
      )
      const fallbackItems: TopHubItem[] = title && (isCompactBoard || isMediaBoard)
        ? [{
            rank: '',
            title: subtitle || '查看榜单',
            extra: '',
            link: normalizeTopHubUrl(nodeLink)
          }]
        : []
      const items = (headlineItems.length ? headlineItems : compactItems.length ? compactItems : fallbackItems).slice(0, 10)

      if (!title || !items.length) return null
      return {
        id: card.getAttribute('id') || `board-${index}`,
        title,
        subtitle,
        icon: normalizeTopHubUrl(icon),
        iconLabel: boardIconLabel(title),
        items
      }
    })
    .filter((board: TopHubBoard | null): board is TopHubBoard => Boolean(board))
}

function parseTopHubMarkdown(markdown: string): TopHubBoard[] {
  const boardPattern = /\[!\[Image\s+\d+\]\(([^)]+)\)\s*([^\]]+?)\]\(([^)]+)\)\s*\n+\s*([^\n[\]]{2,42}?)\s*\n+([\s\S]*?)(?=\n\s*\[!\[Image\s+\d+\]|\n\s*\*\s+\[\d+\]|\n\s*$)/g
  const itemPattern = /\[(\d+)\s*(?:!\[Image\s+\d+\]\([^)]+\)\s*)?([^\]]+?)\]\((https?:\/\/[^)]+)\)/g
  return Array.from(markdown.matchAll(boardPattern))
    .slice(0, 18)
    .map((match: RegExpMatchArray, index: number): TopHubBoard | null => {
      const title = match[2].replace(/\s+/g, ' ').trim()
      const subtitle = match[4].replace(/\s+/g, ' ').trim()
      const itemSource = match[5]
      const items = Array.from(itemSource.matchAll(itemPattern))
        .slice(0, 10)
        .map((itemMatch: RegExpMatchArray): TopHubItem => ({
          rank: itemMatch[1],
          title: itemMatch[2].replace(/\s+/g, ' ').trim(),
          extra: '',
          link: normalizeTopHubUrl(itemMatch[3])
        }))

      if (!title || !items.length) return null
      return {
        id: `markdown-board-${index}`,
        title,
        subtitle,
        icon: normalizeTopHubUrl(match[1] || ''),
        iconLabel: boardIconLabel(title),
        items
      }
    })
    .filter((board: TopHubBoard | null): board is TopHubBoard => Boolean(board))
}

function parsePaginationHtml(html: string, fallbackPage: number): TopHubPagination {
  const currentPageMatch = html.match(/currentPage\s*=\s*(\d+)/)
  const totalPagesMatch = html.match(/totalPages\s*=\s*(\d+)/)
  const pageNumbers = Array.from(html.matchAll(/[?&]p=(\d+)/g)).map((match: RegExpMatchArray): number => Number(match[1]))
  const activePageMatch = html.match(/<li class="pager active"><a[^>]*>(\d+)<\/a>/)
  const current = Number(currentPageMatch?.[1] || activePageMatch?.[1] || fallbackPage)
  const total = Number(totalPagesMatch?.[1] || Math.max(current, ...pageNumbers, 1))
  return {
    currentPage: current,
    totalPages: total,
    hasNextPage: /下一页/.test(html) && current < total
  }
}

function parsePaginationMarkdown(markdown: string, fallbackPage: number): TopHubPagination {
  const pageNumbers = Array.from(markdown.matchAll(/[?&]p=(\d+)/g)).map((match: RegExpMatchArray): number => Number(match[1]))
  const sourcePage = Number(markdown.match(/URL Source:[^\n]*[?&]p=(\d+)/)?.[1] || fallbackPage)
  const total = Math.max(sourcePage, ...pageNumbers, 1)
  return {
    currentPage: sourcePage,
    totalPages: total,
    hasNextPage: /\[下一页\]/.test(markdown) || pageNumbers.some((page: number): boolean => page > sourcePage)
  }
}

function parseCalendarMarkdown(markdown: string): TopHubCalendarEvent[] {
  const monthContent = markdown.match(/##\s*\d{4}年\d+月([\s\S]*)/)?.[1] || markdown
  const seen = new Set<string>()
  return Array.from(monthContent.matchAll(/\[([^\]]+)\]\(https:\/\/tophub\.today\/calendar\)/g))
    .map((match: RegExpMatchArray): string => match[1].replace(/\s+/g, ' ').trim())
    .filter((title: string): boolean => {
      if (!title || seen.has(title)) return false
      seen.add(title)
      return !['分享', '热点日历'].includes(title)
    })
    .slice(0, 120)
    .map((title: string, index: number): TopHubCalendarEvent => ({
      id: `${index}-${title}`,
      title
    }))
}

function buildRequestTargets(section: TopHubSection, page: number): TopHubTarget[] {
  const sourceUrl = buildSectionSourceUrl(section, page)
  const markdownTarget: TopHubTarget = {
    url: `https://r.jina.ai/http://${sourceUrl}`,
    kind: 'markdown',
    timeoutMs: 12000
  }
  const localHtmlTarget: TopHubTarget = {
    url: buildProxyPath(section, page),
    kind: 'html',
    timeoutMs: section.type === 'category' ? 18000 : 10000
  }
  const remoteHtmlTargets: TopHubTarget[] = [
    {
      url: `https://api.allorigins.win/raw?url=${encodeURIComponent(sourceUrl)}`,
      kind: 'html',
      timeoutMs: 10000
    },
    {
      url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(sourceUrl)}`,
      kind: 'html',
      timeoutMs: 10000
    }
  ]

  if (section.type === 'category') return [localHtmlTarget, markdownTarget, ...remoteHtmlTargets]
  return [markdownTarget, localHtmlTarget, ...remoteHtmlTargets]
}

async function requestTextWithTimeout(target: TopHubTarget): Promise<TopHubTextResult> {
  const controller = new AbortController()
  const timeout = window.setTimeout((): void => controller.abort(), target.timeoutMs)

  try {
    return {
      text: await requestText(target.url, { signal: controller.signal }),
      kind: target.kind
    }
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`${target.kind === 'html' ? 'TopHub 原站' : 'TopHub 文本代理'}加载超时`)
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

async function requestTopHubText(section: TopHubSection, page: number): Promise<TopHubTextResult> {
  let lastError: unknown = null

  for (const target of buildRequestTargets(section, page)) {
    try {
      return await requestTextWithTimeout(target)
    } catch (error: unknown) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError || '请求失败'))
}

function applyPagination(result: TopHubTextResult, page: number): void {
  const pagination = result.kind === 'markdown' ? parsePaginationMarkdown(result.text, page) : parsePaginationHtml(result.text, page)
  currentPage.value = pagination.currentPage
  totalPages.value = pagination.totalPages
  hasNextPage.value = pagination.hasNextPage
}

async function loadTopHub(): Promise<void> {
  const section = activeSection.value
  const page = section.type === 'category' ? currentPage.value : 1
  isLoading.value = true
  errorText.value = ''
  boards.value = []
  calendarEvents.value = []

  try {
    const result = await requestTopHubText(section, page)
    if (section.type === 'calendar') {
      calendarEvents.value = result.kind === 'markdown' ? parseCalendarMarkdown(result.text) : []
      totalPages.value = 1
      hasNextPage.value = false
    } else {
      boards.value = result.kind === 'markdown' ? parseTopHubMarkdown(result.text) : parseTopHubHtml(result.text)
      if (section.type === 'category') {
        applyPagination(result, page)
      } else {
        totalPages.value = 1
        hasNextPage.value = false
      }
      selectedBoardId.value = boards.value[0]?.id || ''
    }

    isLiveMode.value = boards.value.length > 0 || calendarEvents.value.length > 0
    if (!isLiveMode.value) {
      errorText.value = section.type === 'calendar'
        ? '热点日历页面已返回，但没有解析到事件列表。'
        : '今日热榜页面已返回，但没有解析到榜单卡片。'
    }
  } catch (error: unknown) {
    errorText.value = error instanceof Error ? error.message : String(error)
    isLiveMode.value = false
  } finally {
    isLoading.value = false
  }
}

function selectSection(sectionId: string): void {
  if (isLoading.value || activeSectionId.value === sectionId) return
  activeSectionId.value = sectionId
  currentPage.value = 1
  totalPages.value = 1
  hasNextPage.value = false
  void loadTopHub()
}

function goToPage(page: number): void {
  if (activeSection.value.type !== 'category' || isLoading.value) return
  const normalizedPage = Math.max(1, Math.min(page, Math.max(totalPages.value, page)))
  if (normalizedPage === currentPage.value) return
  currentPage.value = normalizedPage
  void loadTopHub()
}

function handlePaginationKey(event: KeyboardEvent): void {
  if (activeSection.value.type !== 'category' || isLoading.value) return
  if (event.key === 'ArrowLeft' && currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  } else if (event.key === 'ArrowRight' && (hasNextPage.value || currentPage.value < totalPages.value)) {
    goToPage(currentPage.value + 1)
  }
}

function openLink(url: string): void {
  if (isLoading.value) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

function tophubItemFavoriteKey(board: TopHubBoard, item: TopHubItem): string {
  return `tophub:item:${activeSectionId.value}:${board.id}:${item.link || item.title}`
}

function toggleTopHubItemFavorite(board: TopHubBoard, item: TopHubItem): void {
  toggleContentItemFavorite({
    id: tophubItemFavoriteKey(board, item),
    title: item.title,
    source: `TopHub · ${board.title}`,
    url: item.link || buildSectionSourceUrl(),
    summary: [board.subtitle, item.extra].filter(Boolean).join(' · ') || activeSection.value.intro,
    image: board.icon || undefined,
    tags: ['TopHub', activeSection.value.name, board.title].filter(Boolean)
  })
}

function tophubCalendarFavoriteKey(event: TopHubCalendarEvent): string {
  return `tophub:calendar:${event.id}`
}

function toggleTopHubCalendarFavorite(event: TopHubCalendarEvent): void {
  toggleContentItemFavorite({
    id: tophubCalendarFavoriteKey(event),
    title: event.title,
    source: 'TopHub · 热点日历',
    url: 'https://tophub.today/calendar',
    summary: activeSection.value.intro,
    tags: ['TopHub', '热点日历']
  })
}

onMounted(() => {
  window.addEventListener('keydown', handlePaginationKey)
  void loadTopHub()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handlePaginationKey)
})
</script>

<template>
  <section class="tophub-page">
    <div class="tophub-shell">
      <header class="tophub-header">
        <div>
          <p class="eyebrow">TopHub</p>
          <h1>{{ activeSection.name === '首页' ? '今日热榜' : activeSection.name }}</h1>
          <p>{{ activeSection.intro }}</p>
        </div>
        <div class="header-actions">
          <span :class="{ live: isLiveMode }">{{ isLiveMode ? '实时数据' : '等待数据' }}</span>
          <button type="button" :disabled="isLoading" @click="loadTopHub">刷新</button>
          <button type="button" :disabled="isLoading" @click="openLink(buildSectionSourceUrl())">打开原站</button>
        </div>
      </header>

      <nav class="section-tabs" aria-label="TopHub 分类">
        <button
          v-for="section in primarySections"
          :key="section.id"
          type="button"
          :class="{ active: activeSection.id === section.id }"
          :disabled="isLoading"
          @click="selectSection(section.id)"
        >
          <span class="section-icon">{{ section.icon }}</span>
          <span>{{ section.name }}</span>
        </button>
      </nav>

      <nav class="subsection-tabs" aria-label="TopHub 二级分类">
        <span>更多分类</span>
        <button
          v-for="section in secondarySections"
          :key="section.id"
          type="button"
          :class="{ active: activeSection.id === section.id }"
          :disabled="isLoading"
          @click="selectSection(section.id)"
        >
          {{ section.name }}
        </button>
      </nav>

      <div v-if="isLoading" class="content-state">正在加载 {{ activeSection.name }} 数据...</div>

      <template v-else-if="calendarEvents.length">
        <section class="calendar-panel">
          <div class="board-title">
            <span class="board-icon board-icon-large">历</span>
            <div>
              <h2>热点日历</h2>
              <p>已解析当前月份事件 {{ calendarEvents.length }} 条</p>
            </div>
          </div>
          <div class="calendar-grid">
            <div
              v-for="event in calendarEvents"
              :key="event.id"
              class="calendar-event"
              :class="{ disabled: isLoading }"
              role="button"
              tabindex="0"
              @click="openLink('https://tophub.today/calendar')"
              @keydown.enter="openLink('https://tophub.today/calendar')"
            >
              <ContentFavoriteButton
                class="calendar-favorite"
                size="compact"
                :active="isContentItemFavorite(tophubCalendarFavoriteKey(event))"
                :title="isContentItemFavorite(tophubCalendarFavoriteKey(event)) ? '取消收藏事件' : '收藏事件'"
                @toggle="toggleTopHubCalendarFavorite(event)"
              />
              {{ event.title }}
            </div>
          </div>
        </section>
      </template>

      <template v-else-if="boards.length">
        <section class="board-grid" aria-label="TopHub 榜单卡片">
          <article v-for="board in boards" :key="board.id" class="board-card">
            <header class="board-card-header">
              <div class="board-name">
                <span class="board-icon">{{ board.iconLabel }}</span>
                <h2>{{ board.title }}</h2>
              </div>
              <strong>{{ board.subtitle || '热门内容' }}</strong>
            </header>

            <div class="board-card-list">
              <div
                v-for="item in board.items.slice(0, 10)"
                :key="item.rank + item.title"
                class="board-card-item"
                :class="{ disabled: isLoading }"
                role="button"
                tabindex="0"
                @click="openLink(item.link)"
                @keydown.enter="openLink(item.link)"
              >
                <span class="rank">{{ item.rank }}</span>
                <span class="title">{{ item.title }}</span>
                <span v-if="item.extra" class="extra">{{ item.extra }}</span>
                <ContentFavoriteButton
                  class="board-item-favorite"
                  size="compact"
                  :active="isContentItemFavorite(tophubItemFavoriteKey(board, item))"
                  :title="isContentItemFavorite(tophubItemFavoriteKey(board, item)) ? '取消收藏热榜项' : '收藏热榜项'"
                  @toggle="toggleTopHubItemFavorite(board, item)"
                />
              </div>
            </div>

            <footer class="board-card-footer">
              <span>{{ activeSection.type === 'home' ? '实时更新' : `第 ${currentPage} 页` }}</span>
              <button type="button" :disabled="isLoading" aria-label="打开榜单" @click="openLink(board.items[0]?.link || buildSectionSourceUrl())">•••</button>
            </footer>
          </article>
        </section>

        <nav v-if="shouldShowPagination" class="page-controls" aria-label="TopHub 分页">
          <button type="button" :disabled="currentPage <= 1 || isLoading" @click="goToPage(currentPage - 1)">上一页</button>
          <button
            v-for="page in pageButtons"
            :key="page"
            type="button"
            :disabled="typeof page === 'string'"
            :class="{ active: page === currentPage, gap: typeof page === 'string' }"
            @click="typeof page === 'number' && goToPage(page)"
          >
            {{ typeof page === 'number' ? page : '...' }}
          </button>
          <button type="button" :disabled="(!hasNextPage && currentPage >= totalPages) || isLoading" @click="goToPage(currentPage + 1)">下一页</button>
          <span>提示：可使用键盘 ← → 快速翻页</span>
          <button type="button" class="subscribe-link" :disabled="isLoading" @click="openLink(buildSectionSourceUrl())">☆ 批量订阅本页全部节点</button>
        </nav>
      </template>

      <div v-else class="content-state empty">
        <strong>{{ activeSection.name }} 暂无可展示数据</strong>
        <span>{{ errorText }}</span>
        <button type="button" :disabled="isLoading" @click="openLink(buildSectionSourceUrl())">打开 {{ activeSection.name }}</button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.tophub-page {
  min-height: 100%;
  padding: 20px;
  background: var(--bg-primary);
}

.tophub-shell {
  display: grid;
  gap: 18px;
  width: min(1180px, 100%);
  margin: 0 auto;
}

.tophub-header,
.board-card,
.calendar-panel,
.content-state {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
}

.tophub-header {
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

.tophub-header h1 {
  margin: 0;
  font-size: 26px;
}

.tophub-header p {
  margin: 8px 0 0;
  color: var(--text-secondary);
}

.header-actions,
.section-tabs,
.subsection-tabs,
.page-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.header-actions {
  justify-content: flex-end;
}

.header-actions span {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  color: #f59e0b;
  font-size: 13px;
  font-weight: 800;
}

.header-actions span.live {
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
  opacity: 0.6;
}

button:hover:not(:disabled),
.section-tabs button.active,
.page-controls button.active {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.section-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 800;
}

.subsection-tabs {
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--card-bg);
}

.subsection-tabs span {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
}

.subsection-tabs button {
  min-height: 30px;
  border-radius: 999px;
  padding: 0 11px;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--text-secondary) 7%, var(--bg-primary));
  font-weight: 800;
}

.subsection-tabs button.active {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 12%, var(--bg-primary));
}

.section-icon,
.board-icon {
  display: inline-grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--primary-color) 42%, var(--border-color));
  border-radius: 6px;
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 10%, var(--bg-primary));
  font-size: 12px;
  font-weight: 900;
}

.page-controls {
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px;
  background: var(--card-bg);
}

.page-controls .gap {
  border-style: dashed;
}

.page-controls span {
  color: var(--text-secondary);
  font-size: 12px;
}

.page-controls .subscribe-link {
  border-color: transparent;
  color: var(--primary-color);
  background: transparent;
  font-weight: 800;
}

.calendar-panel {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 14px;
  align-items: stretch;
}

.board-card {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 360px;
  overflow: hidden;
}

.board-card-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 12px;
  min-height: 58px;
  border-bottom: 1px solid var(--border-color);
  padding: 12px 14px 0;
}

.board-name {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  padding-bottom: 11px;
}

.board-name h2 {
  margin: 0;
  overflow: hidden;
  font-size: 17px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.board-card-header strong {
  display: block;
  max-width: 120px;
  overflow: hidden;
  border-bottom: 2px solid var(--text-secondary);
  padding-bottom: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 900;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.board-card-list {
  display: grid;
  align-content: start;
  gap: 2px;
  padding: 12px 14px;
}

.board-card-item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto 34px;
  align-items: start;
  gap: 10px;
  min-height: 29px;
  border: 0;
  padding: 1px 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.board-item-favorite {
  justify-self: end;
}

.board-card-item:hover {
  color: var(--primary-color);
}

.board-card-item.disabled,
.calendar-event.disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.board-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 46px;
  border-top: 1px solid var(--border-color);
  padding: 0 14px;
  color: var(--text-secondary);
  font-size: 12px;
}

.board-card-footer button {
  min-height: 28px;
  border: 0;
  padding: 0;
  color: var(--text-secondary);
  background: transparent;
  font-size: 18px;
  letter-spacing: 3px;
}

.board-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.board-icon-large {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  font-size: 16px;
}

.board-title h2 {
  margin: 0;
  font-size: 20px;
}

.board-title p {
  margin: 2px 0 0;
  color: var(--text-secondary);
}

.rank {
  display: inline-flex;
  justify-content: flex-start;
  color: var(--primary-color);
  font-weight: 900;
}

.board-card-item:nth-child(1) .rank {
  color: #ef4444;
}

.board-card-item:nth-child(2) .rank {
  color: #f59e0b;
}

.board-card-item:nth-child(3) .rank {
  color: #eab308;
}

.title {
  overflow: hidden;
  font-weight: 700;
  line-height: 1.45;
  text-overflow: ellipsis;
  word-break: break-word;
}

.extra {
  max-width: 76px;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 12px;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.calendar-event {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  text-align: left;
  line-height: 1.45;
  cursor: pointer;
}

.calendar-favorite {
  flex: 0 0 auto;
}

.content-state {
  display: grid;
  gap: 10px;
  min-height: 180px;
  place-items: center;
  padding: 24px;
  color: var(--text-secondary);
  text-align: center;
}

.content-state.empty strong {
  color: var(--text-color);
}

@media (max-width: 720px) {
  .tophub-page {
    padding: 12px;
  }

  .tophub-header {
    display: grid;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .board-card-item {
    grid-template-columns: 26px minmax(0, 1fr);
  }

  .board-item-favorite {
    grid-column: 2;
    justify-self: start;
  }

  .extra {
    grid-column: 2;
    max-width: none;
    text-align: left;
  }
}
</style>
