<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ContentFavoriteButton from '@/components/ContentFavoriteButton.vue'
import ShareButton from '@/components/ShareButton.vue'
import { useContentItemFavorites } from '@/composables/useContentItemFavorites'
import type { SharePayload } from '@/composables/useShareRecords'
import { requestText } from '@/utils/request'
import './css/index.scss'

interface ReadingItem {
  rank: number
  title: string
  link: string
  author: string
  views: string
  likes: string
  comments: string
  hot: string
}

type TabKey = 'week' | 'month'

interface Tab {
  key: TabKey
  label: string
  param: string
}

const TABS: Tab[] = [
  { key: 'week', label: '周榜', param: 'week' },
  { key: 'month', label: '月榜', param: 'month' }
]

const activeTab = ref<TabKey>('week')
const items = ref<ReadingItem[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const { isContentItemFavorite, toggleContentItemFavorite } = useContentItemFavorites()

const activeTabObj = computed<Tab>(() => TABS.find((t: Tab): boolean => t.key === activeTab.value) ?? TABS[0])
const sourceUrl = computed<string>(() => `https://www.oschina.net/reading-list?type=${activeTabObj.value.param}`)

function buildJinaUrl(tab: Tab = activeTabObj.value): string {
  return `https://r.jina.ai/https://www.oschina.net/reading-list?type=${tab.param}`
}

function cleanText(raw: string): string {
  return raw.replace(/\s+/g, ' ').replace(/[*_`]/g, '').trim()
}

function parseItems(markdown: string): ReadingItem[] {
  const results: ReadingItem[] = []

  // Parse numbered list items: "1. [Title](url)"
  // OSChina reading list structure from Jina reader:
  // Lines like: 1. [Title](https://...) or text around it
  const lines = markdown.split('\n')

  let rank = 0
  let i = 0

  while (i < lines.length && results.length < 50) {
    const line = lines[i].trim()

    // Match patterns like:  "### 1" or ranked article title blocks
    // Jina renders OSChina reading list as: title links + metadata below
    // Pattern: "[N. Title](url)" or "N. [Title](url)"
    const rankLinkMatch = line.match(/^(\d+)\.\s+\[(.+?)\]\((https?:\/\/my\.oschina\.net\/[^\s)]+|https?:\/\/[^\s)]+)\)/)
    const plainRankMatch = line.match(/^(\d+)\.\s+(.+)/)

    if (rankLinkMatch) {
      rank++
      const titleRaw = cleanText(rankLinkMatch[2])
      const link = rankLinkMatch[3]

      // Scan ahead for metadata
      let author = ''
      let views = '0'
      let likes = '0'
      let comments = '0'
      let hot = '0'

      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const meta = lines[j].trim()
        if (!meta) continue

        // Author pattern
        const authorMatch = meta.match(/by\s+([^\s|，,]+)|作者[:：]\s*([^\s|，,]+)/i)
        if (authorMatch) author = cleanText(authorMatch[1] || authorMatch[2] || '')

        // Views
        const viewsMatch = meta.match(/浏览[数量]?\s*([0-9,，]+)/i) || meta.match(/(\d[\d,]+)\s*(?:次|浏览)/i)
        if (viewsMatch) views = viewsMatch[1].replace(/,/g, '')

        // Likes
        const likesMatch = meta.match(/点赞\s*([0-9]+)/i) || meta.match(/(\d+)\s*(?:人)?点赞/i)
        if (likesMatch) likes = likesMatch[1]

        // Comments
        const commentsMatch = meta.match(/评论\s*([0-9]+)/i) || meta.match(/(\d+)\s*(?:个)?评论/i)
        if (commentsMatch) comments = commentsMatch[1]

        // Hot score
        const hotMatch = meta.match(/热度\s*([0-9,，]+)/i) || meta.match(/([0-9]{3,})\s*热度/i)
        if (hotMatch) hot = hotMatch[1].replace(/,/g, '')

        // Stop on next numbered item
        if (/^\d+\.\s/.test(meta) && meta !== line) break
      }

      results.push({ rank, title: titleRaw, link, author, views, likes, comments, hot })
    } else if (!rankLinkMatch && plainRankMatch) {
      // Try alternate pattern: title without link on this line
      const potentialTitle = cleanText(plainRankMatch[2])
      const nextLine = (lines[i + 1] || '').trim()
      const linkMatch = nextLine.match(/\((https?:\/\/[^\s)]+)\)/) || nextLine.match(/^(https?:\/\/[^\s]+)/)
      if (linkMatch && potentialTitle.length > 5) {
        rank++
        results.push({
          rank,
          title: potentialTitle,
          link: linkMatch[1],
          author: '',
          views: '0',
          likes: '0',
          comments: '0',
          hot: '0'
        })
      }
    }

    i++
  }

  return results
}

// Secondary parse: Try to find articles via heading pattern (common Jina output)
function parseItemsAlt(markdown: string): ReadingItem[] {
  const results: ReadingItem[] = []

  // Pattern: "## Article Title\n\nAuthor | views | likes\n\n[Read more](url)"
  // OR pattern used by oschina: listed items with metadata inline
  const blockPattern = /###?\s+(\d+)\.\s+(.+?)[\r\n]+[\s\S]*?\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g

  let match: RegExpExecArray | null
  while ((match = blockPattern.exec(markdown)) !== null && results.length < 50) {
    const rank = parseInt(match[1], 10)
    const title = cleanText(match[2])
    const linkText = match[3]
    const link = match[4]

    if (title && link && link.includes('oschina')) {
      results.push({ rank, title, link, author: linkText || '', views: '0', likes: '0', comments: '0', hot: '0' })
    }
  }

  return results
}

// Third pattern: parse from raw text blocks with hot scores visible
function parseRawOschinaBlocks(markdown: string): ReadingItem[] {
  // OSChina reading list page structure often rendered as:
  // "手敲代码被学生当\"非遗\" ... [大东](author url) 浏览数 7358 2人点赞 6评论 32722 热度"
  const results: ReadingItem[] = []

  // Split by empty lines for blocks
  const blocks = markdown.split(/\n{2,}/)
  let rank = 0

  for (const block of blocks) {
    if (results.length >= 50) break

    const lines = block.split('\n').map((l: string) => l.trim()).filter(Boolean)
    if (lines.length < 2) continue

    // Title line with link
    const titleLine = lines[0]
    const titleMatch = titleLine.match(/\[([^\]]{5,})\]\((https?:\/\/[^)]+)\)/)
    if (!titleMatch) continue

    const title = cleanText(titleMatch[1])
    const link = titleMatch[2]

    // Don't process non-article links
    if (!title || title.length < 5) continue
    if (link.includes('reading-list') || link.includes('/u/') || link.includes('oschina.net/u/')) {
      // skip author/nav links
      if (!link.includes('blog') && !link.includes('post') && !link.includes('my.oschina') && !link.includes('www.oschina.net/blog')) {
        // check if it looks like a real article
      }
    }

    const restText = lines.slice(1).join(' ')

    const viewsMatch = restText.match(/浏览[数量]?\s*([0-9]+)/)
    const likesMatch = restText.match(/([0-9]+)\s*人点赞/)
    const commentsMatch = restText.match(/([0-9]+)\s*(?:个)?评论/)
    const hotMatch = restText.match(/([0-9]{3,})\s*热度/)
    const authorMatch = restText.match(/\[([^\]]+)\]\(https?:\/\/my\.oschina/)

    const views = viewsMatch ? viewsMatch[1] : '0'
    const likes = likesMatch ? likesMatch[1] : '0'
    const comments = commentsMatch ? commentsMatch[1] : '0'
    const hot = hotMatch ? hotMatch[1] : '0'
    const author = authorMatch ? cleanText(authorMatch[1]) : ''

    if (hot !== '0' || views !== '0') {
      rank++
      results.push({ rank, title, link, author, views, likes, comments, hot })
    }
  }

  return results
}

function formatNumber(num: string): string {
  const n = parseInt(num, 10)
  if (isNaN(n)) return '0'
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

async function fetchReadingList(): Promise<void> {
  if (isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''
  items.value = []

  try {
    const markdown: string = await requestText(buildJinaUrl())
    let parsed = parseItems(markdown)
    if (!parsed.length) parsed = parseItemsAlt(markdown)
    if (!parsed.length) parsed = parseRawOschinaBlocks(markdown)
    items.value = parsed

    if (!items.value.length) {
      errorMessage.value = '开源中国阅读榜暂时未能解析，可点击上方按钮前往原站查看。'
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '开源中国阅读榜加载失败，请稍后重试。'
  } finally {
    isLoading.value = false
  }
}

function selectTab(tab: Tab): void {
  if (isLoading.value || activeTab.value === tab.key) return
  activeTab.value = tab.key
  void fetchReadingList()
}

watch(activeTab, () => {
  void fetchReadingList()
})

onMounted((): void => {
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
        <p class="oschina-subtitle">聚合开源中国社区最受关注的周/月热门博客文章，按热度排行实时更新</p>
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

    <!-- Tab switch: 周榜 / 月榜 -->
    <div class="oschina-tabs-bar">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        type="button"
        class="oschina-tab-btn"
        :class="{ active: activeTab === tab.key }"
        :disabled="isLoading"
        @click="selectTab(tab)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="oschina-loading">
      <div class="loading-spinner"></div>
      <span>正在加载{{ activeTabObj.label }}热榜数据...</span>
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage && !items.length" class="oschina-error">
      <div class="error-icon">⚠️</div>
      <p>{{ errorMessage }}</p>
      <a :href="sourceUrl" target="_blank" rel="noopener noreferrer" class="error-link">
        点击前往开源中国原站 ↗
      </a>
    </div>

    <!-- Article List -->
    <main v-else-if="items.length" class="oschina-list">
      <div class="list-header-row">
        <span class="list-header-label">{{ activeTabObj.label }}排行 · 共 {{ items.length }} 篇文章</span>
      </div>

      <div
        v-for="item in items"
        :key="item.link"
        class="oschina-article-card"
        :class="{ 'top-three': item.rank <= 3 }"
      >
        <!-- Rank badge -->
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

        <!-- Article content -->
        <div class="article-col">
          <a
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            class="article-title"
          >{{ item.title }}</a>

          <div class="article-meta">
            <span v-if="item.author" class="meta-author">
              <span class="meta-icon">👤</span>{{ item.author }}
            </span>
            <span v-if="item.views !== '0'" class="meta-stat">
              <span class="meta-icon">👁️</span>浏览 {{ formatNumber(item.views) }}
            </span>
            <span v-if="item.likes !== '0'" class="meta-stat">
              <span class="meta-icon">👍</span>{{ item.likes }} 人点赞
            </span>
            <span v-if="item.comments !== '0'" class="meta-stat">
              <span class="meta-icon">💬</span>{{ item.comments }} 评论
            </span>
          </div>
        </div>

        <!-- Hot score -->
        <div v-if="item.hot !== '0'" class="hot-col">
          <span class="hot-flame">🔥</span>
          <span class="hot-score">{{ formatNumber(item.hot) }}</span>
          <span class="hot-label">热度</span>
        </div>

        <!-- Actions -->
        <div class="actions-col">
          <ContentFavoriteButton
            :is-favorited="isContentItemFavorite(item.link)"
            :title="item.title"
            @toggle="toggleContentItemFavorite({ title: item.title, url: item.link, source: '开源中国' })"
          />
          <ShareButton
            :payload="{
              title: `[开源中国阅读榜] ${item.title}`,
              description: `热度: ${item.hot}｜浏览: ${item.views}`,
              url: item.link
            }"
            size="compact"
          />
        </div>
      </div>
    </main>

    <!-- Empty state -->
    <div v-else class="oschina-empty">
      <p>暂无榜单数据</p>
    </div>
  </div>
</template>
