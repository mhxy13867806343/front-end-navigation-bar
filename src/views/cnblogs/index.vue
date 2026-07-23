<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resolveApiUrl } from '../../utils/resolveApiUrl'
import type { CnblogsNewsItem } from './mock/newsMock'

type PrimaryTab = 'latest' | 'recommend' | 'digg' | 'sitehome'
type DiggType = 'today' | 'yesterday' | 'week' | 'month'

interface TopHighlight {
  label: string
  title: string
  link: string
  stats: string
}

const router = useRouter()
const activeTab = ref<PrimaryTab>('latest')
const activeDiggType = ref<DiggType>('today')
const currentPage = ref<number>(1)
const totalPages = ref<number>(100)
const newsList = ref<CnblogsNewsItem[]>([])
const loading = ref<boolean>(false)
const searchQuery = ref<string>('')
const selectedTag = ref<string | null>(null)
const activeNewsDetail = ref<CnblogsNewsItem | null>(null)
const detailModalVisible = ref<boolean>(false)
const JINA_READER_PREFIX = 'https://r.jina.ai/http://r.jina.ai/http://'

const topHighlights = ref<TopHighlight[]>([
  { label: '编辑推荐', title: '如何设计一个 Agent 友好的 CLI 工具', link: 'https://www.cnblogs.com/rossiXYZ/p/21514625', stats: '13/12/1753' },
  { label: '最多推荐', title: 'C# .NET 周刊 | 2026 年 6 月 2 期', link: 'https://www.cnblogs.com/shanyou/p/21758689', stats: '0/3/286' },
  { label: '新闻头条', title: '微软把Comic Chat开源了，那个让Comic Sans走进千家万户的聊天软件', link: 'https://news.cnblogs.com/n/831971/', stats: '0/1/160' },
  { label: '推荐新闻', title: 'ChatGPT终于能「搜自己」！攒了近4年的对话，一键翻出', link: 'https://news.cnblogs.com/n/831968/', stats: '0/3/526' }
])

const syncPageFromHash = (): void => {
  const hash = window.location.hash
  const match = hash.match(/#p(\d+)/)
  if (match) {
    const pageNum = parseInt(match[1], 10)
    if (pageNum > 0) {
      currentPage.value = pageNum
      if (pageNum === 100) {
        activeTab.value = 'sitehome'
      }
    }
  }
}

const updateUrlHash = (page: number): void => {
  if (page > 1) {
    window.location.hash = `#p${page}`
  } else if (window.location.hash.startsWith('#p')) {
    history.pushState('', document.title, window.location.pathname + window.location.search)
  }
}

const toJinaReaderUrl = (url: string): string => `${JINA_READER_PREFIX}${url}`

const extractJinaContent = (text: string): string => {
  const marker = 'Markdown Content:'
  const markerIndex = text.indexOf(marker)
  return (markerIndex >= 0 ? text.slice(markerIndex + marker.length) : text).trim()
}

const stripMarkdownImages = (text: string): string => {
  return text
    .replace(/\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const createCnblogsItem = (
  title: string,
  link: string,
  summary: string,
  diggCount = 0
): CnblogsNewsItem | null => {
  const normalizedTitle = title.trim()
  const normalizedLink = link.trim()
  if (!normalizedTitle || !/https?:\/\/(?:news\.|www\.)?cnblogs\.com\//.test(normalizedLink)) return null
  if (!/(?:\/n\/\d+\/?|\/p\/\d+\/?)/.test(normalizedLink)) return null

  const id = normalizedLink.match(/\/(?:n|p)\/(\d+)/)?.[1] || `${normalizedTitle}-${itemsHash(normalizedLink)}`

  return {
    id,
    title: normalizedTitle,
    link: normalizedLink,
    summary: stripMarkdownImages(summary),
    author: '博客园',
    publishTime: '最新',
    diggCount,
    commentCount: 0,
    viewCount: 0,
    tags: ['线上数据']
  }
}

const itemsHash = (value: string): string => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash.toString(36)
}

const pushUniqueItem = (items: CnblogsNewsItem[], item: CnblogsNewsItem | null): void => {
  if (!item || items.some(current => current.link === item.link)) return
  items.push(item)
}

const parseCnblogsMarkdown = (markdownText: string): { items: CnblogsNewsItem[]; maxPage?: number } => {
  const content = extractJinaContent(markdownText)
  const items: CnblogsNewsItem[] = []
  const pattern = /(?:^|\n)(?:(\d+)\s*\n+)?## \[([^\]]+)\]\((https?:\/\/[^)]+)\)\s*\n+([\s\S]*?)(?=\n(?:\d+\s*\n+)?## \[|$)/g
  let match: RegExpExecArray | null = pattern.exec(content)

  while (match) {
    const diggCount = Number(match[1] || 0)
    pushUniqueItem(items, createCnblogsItem(match[2], match[3], match[4] || '', diggCount))
    match = pattern.exec(content)
  }

  if (items.length === 0) {
    const linkPattern = /(?:^|\n)[*-]\s+\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
    let linkMatch: RegExpExecArray | null = linkPattern.exec(content)
    while (linkMatch) {
      pushUniqueItem(items, createCnblogsItem(linkMatch[1], linkMatch[2], ''))
      linkMatch = linkPattern.exec(content)
    }
  }

  return { items, maxPage: 100 }
}

const parseCnblogsHtml = (htmlText: string): { items: CnblogsNewsItem[]; maxPage?: number } => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlText, 'text/html')

  let maxPage: number | undefined = undefined
  const pagerLinks = doc.querySelectorAll('.pager a, #pager a, .p_1, .p_2, .p_3')
  pagerLinks.forEach(link => {
    const num = parseInt(link.textContent || '', 10)
    if (!isNaN(num) && num > (maxPage || 0)) {
      maxPage = num
    }
  })

  // Check if parsing sitehome blog posts (www.cnblogs.com) or news
  const postItems = doc.querySelectorAll('.post-item, article.post-item')
  if (postItems.length > 0) {
    const items: CnblogsNewsItem[] = []
    postItems.forEach((post) => {
      const titleEl = post.querySelector('.post-item-title')
      const title = titleEl?.textContent?.trim() || '无标题随笔'
      const rawLink = titleEl?.getAttribute('href') || ''
      const link = rawLink.startsWith('http') ? rawLink : `https://www.cnblogs.com${rawLink}`
      const id = post.getAttribute('data-post-id') || String(Math.floor(Math.random() * 900000 + 100000))

      const summaryEl = post.querySelector('.post-item-summary')
      const summary = summaryEl?.textContent?.trim().replace(/\s+/g, ' ') || ''
      const avatarEl = summaryEl?.querySelector('img.avatar')
      const topicImg = avatarEl?.getAttribute('src') || undefined

      const authorEl = post.querySelector('.post-item-author span, .post-item-author')
      const author = authorEl?.textContent?.trim() || '博主'

      const metaItems = post.querySelectorAll('.post-meta-item')
      let publishTime = '最近'
      let commentCount = 0
      let diggCount = 0
      let viewCount = 0

      metaItems.forEach((m) => {
        const text = m.textContent?.trim() || ''
        if (text.match(/\d{4}-\d{2}-\d{2}/)) {
          publishTime = text
        }
      })

      const commentEl = post.querySelector('a[href*="#commentform"] span')
      if (commentEl) commentCount = parseInt(commentEl.textContent || '0', 10)

      const diggEl = post.querySelector('span[id*="digg_count_"]')
      if (diggEl) diggCount = parseInt(diggEl.textContent || '0', 10)

      const viewEl = post.querySelector('a[title*="阅读"] span')
      if (viewEl) viewCount = parseInt(viewEl.textContent || '0', 10)

      items.push({
        id,
        title,
        link,
        summary,
        author,
        publishTime,
        diggCount,
        commentCount,
        viewCount,
        tags: ['博客随笔'],
        topicImg
      })
    })
    return { items, maxPage: maxPage || 100 }
  }

  // Parse News Blocks (.news_block)
  const blocks = doc.querySelectorAll('.news_block')
  const items: CnblogsNewsItem[] = []

  blocks.forEach((block) => {
    const id = block.id.replace('entry_', '') || String(Math.floor(Math.random() * 900000 + 100000))
    const titleEl = block.querySelector('.news_entry a')
    const title = titleEl?.textContent?.trim() || '无标题新闻'
    const rawLink = titleEl?.getAttribute('href') || ''
    const link = rawLink.startsWith('http') ? rawLink : `https://news.cnblogs.com${rawLink}`
    
    const summaryEl = block.querySelector('.entry_summary')
    const summary = summaryEl?.textContent?.trim().replace(/\s+/g, ' ') || ''
    const topicImgEl = summaryEl?.querySelector('img')
    const topicImg = topicImgEl?.getAttribute('src') || undefined

    const diggEl = block.querySelector('.diggnum')
    const diggCount = parseInt(diggEl?.textContent || '0', 10)

    const footerEl = block.querySelector('.entry_footer')
    const authorEl = footerEl?.querySelector('a')
    const author = authorEl?.textContent?.trim() || '投稿人'

    const commentEl = footerEl?.querySelector('.comment a')
    const commentMatch = commentEl?.textContent?.match(/\d+/)
    const commentCount = commentMatch ? parseInt(commentMatch[0], 10) : 0

    const viewEl = footerEl?.querySelector('.view')
    const viewMatch = viewEl?.textContent?.match(/\d+/)
    const viewCount = viewMatch ? parseInt(viewMatch[0], 10) : 0

    const tagEls = footerEl?.querySelectorAll('.tag a')
    const tags: string[] = []
    tagEls?.forEach(t => {
      const tText = t.textContent?.trim()
      if (tText) tags.push(tText)
    })

    const footerText = footerEl?.textContent || ''
    const timeMatch = footerText.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/)
    const publishTime = timeMatch ? timeMatch[0] : '最近'

    items.push({
      id,
      title,
      link,
      summary,
      author,
      publishTime,
      diggCount,
      commentCount,
      viewCount,
      tags,
      topicImg
    })
  })

  return { items, maxPage }
}

const fetchNewsData = async (): Promise<void> => {
  loading.value = true
  try {
    let targetPath = '/api-cnblogs/'
    const page = currentPage.value

    if (activeTab.value === 'sitehome') {
      targetPath = page === 1 ? '/api-cnblogs-main/' : `/api-cnblogs-main/sitehome/p/${page}`
    } else if (activeTab.value === 'latest') {
      targetPath = page === 1 ? '/api-cnblogs/' : `/api-cnblogs/n/page/${page}/`
    } else if (activeTab.value === 'recommend') {
      targetPath = page === 1 ? '/api-cnblogs/n/recommend' : `/api-cnblogs/n/recommend?page=${page}`
    } else if (activeTab.value === 'digg') {
      targetPath = page === 1 
        ? `/api-cnblogs/n/digg?type=${activeDiggType.value}`
        : `/api-cnblogs/n/digg?type=${activeDiggType.value}&page=${page}`
    }

    // Special empty test for page 100 if fallback mode
    if (page >= 100) {
      newsList.value = []
      loading.value = false
      return
    }

    const apiUrl = import.meta.env.PROD
      ? toJinaReaderUrl(resolveApiUrl(targetPath))
      : resolveApiUrl(targetPath)
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    const responseText = await res.text()
    const { items, maxPage } = import.meta.env.PROD
      ? parseCnblogsMarkdown(responseText)
      : parseCnblogsHtml(responseText)

    if (maxPage && maxPage > 1) {
      totalPages.value = maxPage
    }

    if (items.length > 0) {
      newsList.value = items
    } else {
      throw new Error('未解析出博客园线上数据')
    }
  } catch (err) {
    console.warn('Fetch cnblogs live data failed:', err)
    newsList.value = []
    ElMessage.error(err instanceof Error ? err.message : '博客园线上数据获取失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab: PrimaryTab): void => {
  activeTab.value = tab
  currentPage.value = 1
  selectedTag.value = null
  updateUrlHash(1)
  void fetchNewsData()
}

const handleDiggTypeChange = (type: DiggType): void => {
  activeDiggType.value = type
  currentPage.value = 1
  selectedTag.value = null
  updateUrlHash(1)
  void fetchNewsData()
}

const changePage = (page: number | string): void => {
  if (typeof page === 'string') return
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
  updateUrlHash(page)
  void fetchNewsData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const visiblePageNumbers = computed<Array<number | string>>(() => {
  const current = currentPage.value
  const total = totalPages.value
  const pages: Array<number | string> = []

  if (total <= 9) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  let start = Math.max(2, current - 3)
  let end = Math.min(total - 1, current + 3)

  if (current <= 5) {
    end = 8
  } else if (current >= total - 4) {
    start = total - 7
  }

  if (start > 2) {
    pages.push('...')
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < total - 1) {
    pages.push('...')
  }

  pages.push(total)
  return pages
})

const handleRefresh = (): void => {
  void fetchNewsData()
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  ElMessage.success(`刷新成功！更新时间：${timeStr}`)
}

const handleDigg = (item: CnblogsNewsItem): void => {
  item.diggCount++
  ElMessage.success(`推荐成功！已为《${item.title.slice(0, 10)}...》点赞`)
}

const openDetail = (item: CnblogsNewsItem): void => {
  activeNewsDetail.value = item
  detailModalVisible.value = true
}

const openExternalLink = (url: string): void => {
  window.open(url, '_blank')
}

const filteredNewsList = computed(() => {
  return newsList.value.filter((item) => {
    if (selectedTag.value && !item.tags.includes(selectedTag.value)) {
      return false
    }
    if (!searchQuery.value) return true
    const q = searchQuery.value.toLowerCase()
    return item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q) || item.author.toLowerCase().includes(q)
  })
})

const allTags = computed(() => {
  const tagSet = new Set<string>()
  newsList.value.forEach(item => item.tags.forEach(t => tagSet.add(t)))
  return Array.from(tagSet)
})

onMounted(() => {
  syncPageFromHash()
  void fetchNewsData()
  window.addEventListener('hashchange', () => {
    syncPageFromHash()
    void fetchNewsData()
  })
})
</script>

<template>
  <main class="cnblogs-news-page">
    <!-- Header Hero -->
    <header class="cnblogs-hero">
      <div class="hero-left">
        <div class="brand-badge">
          <span class="brand-logo">📰</span>
          <span class="brand-name">博客园新闻 & 随笔</span>
        </div>
        <h1>实时 IT 科技资讯与开发者精选博文</h1>
        <p class="hero-desc">聚合博客园最新发布、编辑推荐、热门新闻与博客园随笔大厅 (支持 #p3 / #p100 翻页)。</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="refresh-btn" :disabled="loading" @click="handleRefresh">
          <span :class="{ spinning: loading }">🔄</span> 刷新页面
        </button>
        <button type="button" class="back-btn" @click="router.push('/toolbox')">
          ← 工具箱
        </button>
      </div>
    </header>

    <!-- Top Highlight Recommends Box (Matching Screenshots 1 & 2) -->
    <section class="top-highlights-box">
      <div v-for="h in topHighlights" :key="h.label" class="highlight-line">
        <span class="highlight-tag">【{{ h.label }}】</span>
        <a :href="h.link" target="_blank" class="highlight-title">{{ h.title }}</a>
        <span class="highlight-stats">({{ h.stats }}) »</span>
      </div>
    </section>

    <!-- Navigation Tabs matching Cnblogs Header -->
    <nav class="cnblogs-nav-card">
      <div class="primary-tabs">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'latest' }"
          @click="handleTabChange('latest')"
        >
          <span>最新发布</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'recommend' }"
          @click="handleTabChange('recommend')"
        >
          <span>推荐新闻</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'digg' }"
          @click="handleTabChange('digg')"
        >
          <span>热门新闻</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'sitehome' }"
          @click="handleTabChange('sitehome')"
        >
          <span>📝 博客随笔</span>
        </button>
      </div>

      <!-- Sub-Tabs for Digg / 热门新闻 -->
      <transition name="fade">
        <div v-if="activeTab === 'digg'" class="digg-subtabs">
          <button
            type="button"
            class="subtab-item"
            :class="{ active: activeDiggType === 'today' }"
            @click="handleDiggTypeChange('today')"
          >
            今日
          </button>
          <span class="divider">|</span>
          <button
            type="button"
            class="subtab-item"
            :class="{ active: activeDiggType === 'yesterday' }"
            @click="handleDiggTypeChange('yesterday')"
          >
            昨日
          </button>
          <span class="divider">|</span>
          <button
            type="button"
            class="subtab-item"
            :class="{ active: activeDiggType === 'week' }"
            @click="handleDiggTypeChange('week')"
          >
            本周
          </button>
          <span class="divider">|</span>
          <button
            type="button"
            class="subtab-item"
            :class="{ active: activeDiggType === 'month' }"
            @click="handleDiggTypeChange('month')"
          >
            本月
          </button>
        </div>
      </transition>

      <!-- Filter Controls -->
      <div class="filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索标题、关键字、作者..."
          />
          <button v-if="searchQuery" type="button" class="clear-btn" @click="searchQuery = ''">✕</button>
        </div>

        <div v-if="allTags.length > 0" class="tag-chips">
          <button
            type="button"
            class="tag-chip"
            :class="{ active: selectedTag === null }"
            @click="selectedTag = null"
          >
            全部标签
          </button>
          <button
            v-for="tag in allTags.slice(0, 8)"
            :key="tag"
            type="button"
            class="tag-chip"
            :class="{ active: selectedTag === tag }"
            @click="selectedTag = selectedTag === tag ? null : tag"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- Top Pagination Bar (Location 1) -->
      <div class="cnblogs-top-pager-container">
        <nav class="cnblogs-pager-bar cnblogs-pager-bar--top">
          <button
            type="button"
            class="pager-btn pager-nav"
            :disabled="currentPage <= 1 || loading"
            @click="changePage(currentPage - 1)"
          >
            &lt;
          </button>

          <button
            v-for="(p, index) in visiblePageNumbers"
            :key="`top-${index}`"
            type="button"
            class="pager-btn"
            :class="{ active: p === currentPage, ellipsis: typeof p === 'string' }"
            :disabled="typeof p === 'string' || loading"
            @click="changePage(p)"
          >
            {{ p }}
          </button>

          <button
            type="button"
            class="pager-btn pager-nav"
            :disabled="currentPage >= totalPages || loading"
            @click="changePage(currentPage + 1)"
          >
            &gt;
          </button>
        </nav>
      </div>
    </nav>

    <!-- News & Blog Post Article List -->
    <section class="news-list-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在拉取第 {{ currentPage }} 页内容...</p>
      </div>

      <!-- Empty State matching Screenshot 1: ⓘ 当前博文列表为空！ -->
      <div v-else-if="filteredNewsList.length === 0" class="empty-state-notice">
        <span class="info-icon">ⓘ</span>
        <span>当前博文列表为空！</span>
      </div>

      <div v-else class="news-grid">
        <article
          v-for="item in filteredNewsList"
          :key="item.id"
          class="news-card"
          @click="openDetail(item)"
        >
          <div class="digg-box" @click.stop="handleDigg(item)">
            <span class="digg-icon">👍</span>
            <span class="digg-count">{{ item.diggCount }}</span>
          </div>

          <div class="card-content">
            <h2 class="card-title">
              <a :href="item.link" target="_blank" @click.stop>{{ item.title }}</a>
            </h2>
            <p class="card-summary">{{ item.summary }}</p>

            <footer class="card-footer">
              <div class="meta-left">
                <span class="author">👤 {{ item.author }}</span>
                <span class="time">⏰ {{ item.publishTime }}</span>
                <span v-if="item.viewCount" class="views">👁️ {{ item.viewCount }}</span>
                <span v-if="item.commentCount" class="comments">💬 {{ item.commentCount }}</span>
              </div>
              <div class="meta-tags">
                <span v-for="tag in item.tags" :key="tag" class="tag-badge">#{{ tag }}</span>
              </div>
            </footer>
          </div>
        </article>

        <!-- Bottom Pagination Bar -->
        <nav class="cnblogs-pager-bar">
          <button
            type="button"
            class="pager-btn pager-nav"
            :disabled="currentPage <= 1 || loading"
            @click="changePage(currentPage - 1)"
          >
            &lt;
          </button>

          <button
            v-for="(p, index) in visiblePageNumbers"
            :key="index"
            type="button"
            class="pager-btn"
            :class="{ active: p === currentPage, ellipsis: typeof p === 'string' }"
            :disabled="typeof p === 'string' || loading"
            @click="changePage(p)"
          >
            {{ p }}
          </button>

          <button
            type="button"
            class="pager-btn pager-nav"
            :disabled="currentPage >= totalPages || loading"
            @click="changePage(currentPage + 1)"
          >
            &gt;
          </button>
        </nav>
      </div>
    </section>

    <!-- Detail Drawer Modal -->
    <el-dialog
      v-model="detailModalVisible"
      title="📰 博文明细"
      width="640px"
      append-to-body
      custom-class="cnblogs-detail-dialog"
    >
      <div v-if="activeNewsDetail" class="detail-body">
        <h2>{{ activeNewsDetail.title }}</h2>
        <div class="detail-meta">
          <span>作者：{{ activeNewsDetail.author }}</span>
          <span>时间：{{ activeNewsDetail.publishTime }}</span>
          <span>推荐：{{ activeNewsDetail.diggCount }} 次</span>
        </div>
        <p class="detail-text">{{ activeNewsDetail.summary }}</p>

        <div v-if="activeNewsDetail.tags.length" class="detail-tags">
          <span v-for="t in activeNewsDetail.tags" :key="t" class="tag-badge">#{{ t }}</span>
        </div>

        <div class="detail-actions">
          <button
            type="button"
            class="primary-link-btn"
            @click="openExternalLink(activeNewsDetail.link)"
          >
            打开博客园原网页 🔗
          </button>
        </div>
      </div>
    </el-dialog>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
