<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ContentFavoriteButton from '@/components/ContentFavoriteButton.vue'
import ShareButton from '@/components/ShareButton.vue'
import { useContentItemFavorites } from '@/composables/useContentItemFavorites'
import type { SharePayload } from '@/composables/useShareRecords'
import { requestText } from '@/utils/request'

interface IthomeSection {
  id: string
  label: string
  path: string
}

interface IthomeItem {
  title: string
  summary: string
  link: string
  image: string
  date: string
  tags: string[]
}

interface IthomeRank {
  title: string
  link: string
}

const sections: IthomeSection[] = [
  { id: 'latest', label: 'IT资讯最新', path: '/' },
  { id: 'industry', label: '业界', path: '/yejie' },
  { id: 'internet', label: '网络', path: '/internet' },
  { id: 'comment', label: '评论', path: '/pinglun' },
  { id: 'people', label: '人物', path: '/renwu' },
  { id: 'hudong', label: '活动互动', path: '/hudong' },
  { id: 'yangtai', label: '阳台', path: '/yangtai' },
  { id: 'jiong', label: '囧科技', path: '/jiong' },
  { id: 'startup', label: '创业', path: '/chuangye' },
  { id: 'telecom', label: '通信', path: '/it' },
  { id: 'commerce', label: '电商', path: '/ec' },
  { id: 'microsoft', label: '微软', path: '/microsoft' },
  { id: 'apple', label: '苹果', path: '/apple' },
  { id: 'activity', label: '动态', path: '/dongtai' }
]

const activeSectionId = ref('hudong')
const currentPage = ref(1)
const pageSize = 8
const items = ref<IthomeItem[]>([])
const ranks = ref<IthomeRank[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const { isContentItemFavorite, toggleContentItemFavorite } = useContentItemFavorites()

const activeSection = computed<IthomeSection>(() => {
  return sections.find((section: IthomeSection): boolean => section.id === activeSectionId.value) ?? sections[0]
})

const totalPages = computed<number>(() => Math.max(1, Math.ceil(items.value.length / pageSize)))

const visibleItems = computed<IthomeItem[]>(() => {
  const start: number = (currentPage.value - 1) * pageSize
  return items.value.slice(start, start + pageSize)
})

const shouldShowContent = computed<boolean>(() => !isLoading.value && items.value.length > 0)

function toSourceUrl(path: string): string {
  return path === '/' ? 'https://it.ithome.com/' : `https://it.ithome.com${path}`
}

function toProxyPath(path: string): string {
  return path === '/' ? '/api-ithome-web/' : `/api-ithome-web${path}`
}

function normalizeUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `https://it.ithome.com${url}`
  return url
}

function cleanText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function parseItems(html: string): IthomeItem[] {
  const document: Document = new DOMParser().parseFromString(html, 'text/html')

  return Array.from(document.querySelectorAll('#list li'))
    .map((node: Element): IthomeItem => {
      const titleNode: HTMLAnchorElement | null = node.querySelector('a.title')
      const imageNode: HTMLImageElement | null = node.querySelector('a.img img')
      const summaryNode: Element | null = node.querySelector('.m')
      const dateNode: Element | null = node.querySelector('.d .state')
      const tagNodes: Element[] = Array.from(node.querySelectorAll('.tags a'))

      return {
        title: cleanText(titleNode?.textContent || titleNode?.getAttribute('title')),
        summary: cleanText(summaryNode?.textContent),
        link: normalizeUrl(titleNode?.getAttribute('href') ?? ''),
        image: normalizeUrl(imageNode?.getAttribute('data-original') || imageNode?.getAttribute('src') || ''),
        date: cleanText(dateNode?.textContent),
        tags: tagNodes.map((tag: Element): string => cleanText(tag.textContent)).filter(Boolean)
      }
    })
    .filter((item: IthomeItem): boolean => Boolean(item.title))
}

function parseRanks(html: string): IthomeRank[] {
  const document: Document = new DOMParser().parseFromString(html, 'text/html')
  const candidates: Element[] = Array.from(document.querySelectorAll('.rank a, .lst a, .hotnews a, .hot a'))
  const seen: Set<string> = new Set()

  return candidates
    .map((node: Element): IthomeRank => ({
      title: cleanText(node.textContent),
      link: normalizeUrl((node as HTMLAnchorElement).getAttribute('href') ?? '')
    }))
    .filter((rank: IthomeRank): boolean => {
      if (!rank.title || seen.has(rank.title)) return false
      seen.add(rank.title)
      return true
    })
    .slice(0, 8)
}

function parseMarkdownItems(markdown: string): IthomeItem[] {
  const chunks: string[] = markdown.split('*   [![Image').slice(1)

  return chunks
    .map((chunk: string): IthomeItem => {
      const imageMatch: RegExpMatchArray | null = chunk.match(/]\((https?:\/\/[^)]+)\)]/)
      const titleMatch: RegExpMatchArray | null = chunk.match(/## \[([^\]]+)]\((https:\/\/www\.ithome\.com\/[^)]+)/)
      const tagsMatch: RegExpMatchArray | null = chunk.match(/\*\*Tags：\*\*([\s\S]*?)(?:\n|$)/)
      const dateMatch: RegExpMatchArray | null = chunk.match(/(?:\n| )((?:\d{4}年)?\d{2}月\d{2}日)\s*(?:\n|$)/)
      const bodyParts: string[] = chunk.split(/\n\n/)
      const summary: string = cleanText(
        bodyParts.find((part: string): boolean => !part.includes('## [') && !part.includes('**Tags：**') && !part.startsWith('](')) ?? ''
      )
      const tags: string[] = tagsMatch
        ? Array.from(tagsMatch[1].matchAll(/\[([^\]]+)]/g)).map((match: RegExpMatchArray): string => cleanText(match[1]))
        : []

      return {
        title: cleanText(titleMatch?.[1]),
        summary,
        link: normalizeUrl(titleMatch?.[2] ?? ''),
        image: normalizeUrl(imageMatch?.[1] ?? ''),
        date: cleanText(dateMatch?.[1]),
        tags
      }
    })
    .filter((item: IthomeItem): boolean => Boolean(item.title))
}

async function requestIthomeText(): Promise<{ text: string; type: 'html' | 'markdown' }> {
  const markdown: string = await requestText(`https://r.jina.ai/http://${toSourceUrl(activeSection.value.path)}`)
  if (parseMarkdownItems(markdown).length) {
    return { text: markdown, type: 'markdown' }
  }

  try {
    const html: string = await requestText(toProxyPath(activeSection.value.path))
    if (parseItems(html).length) {
      return { text: html, type: 'html' }
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('IT之家数据加载失败')
  }

  return { text: markdown, type: 'markdown' }
}

async function fetchSection(): Promise<void> {
  if (isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''
  items.value = []
  ranks.value = []

  try {
    const response = await requestIthomeText()
    items.value = response.type === 'html' ? parseItems(response.text) : parseMarkdownItems(response.text)
    ranks.value = response.type === 'html' ? parseRanks(response.text) : []
    currentPage.value = Math.min(currentPage.value, totalPages.value)
    if (items.value.length) errorMessage.value = ''
    if (!items.value.length) {
      errorMessage.value = '源站当前没有返回可解析的列表，内部入口仍然保留。'
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'IT之家数据加载失败'
  } finally {
    isLoading.value = false
  }
}

function selectSection(section: IthomeSection): void {
  if (isLoading.value || activeSectionId.value === section.id) return
  activeSectionId.value = section.id
  currentPage.value = 1
  void fetchSection()
}

function goPage(page: number): void {
  if (isLoading.value) return
  currentPage.value = Math.min(totalPages.value, Math.max(1, page))
}

function openSource(path: string = activeSection.value.path): void {
  window.open(toSourceUrl(path), '_blank', 'noopener,noreferrer')
}

function ithomeItemFavoriteKey(item: IthomeItem): string {
  return `ithome:item:${activeSectionId.value}:${item.link || item.title}`
}

function toggleIthomeItemFavorite(item: IthomeItem): void {
  toggleContentItemFavorite({
    id: ithomeItemFavoriteKey(item),
    title: item.title,
    source: `IT之家 · ${activeSection.value.label}`,
    url: item.link || toSourceUrl(activeSection.value.path),
    summary: item.summary || item.date || '暂无摘要',
    image: item.image || undefined,
    tags: ['IT之家', activeSection.value.label, ...item.tags].filter(Boolean)
  })
}

function ithomeItemSharePayload(item: IthomeItem): SharePayload {
  return {
    id: ithomeItemFavoriteKey(item),
    title: item.title,
    url: item.link || toSourceUrl(activeSection.value.path),
    description: item.summary || item.date || '暂无摘要',
    image: item.image || undefined,
    source: `IT之家 · ${activeSection.value.label}`,
    tags: ['IT之家', activeSection.value.label, ...item.tags].filter(Boolean),
    type: 'item'
  }
}

function ithomeRankFavoriteKey(rank: IthomeRank): string {
  return `ithome:rank:${rank.link || rank.title}`
}

function toggleIthomeRankFavorite(rank: IthomeRank): void {
  toggleContentItemFavorite({
    id: ithomeRankFavoriteKey(rank),
    title: rank.title,
    source: 'IT之家 · IT资讯热榜',
    url: rank.link || toSourceUrl('/'),
    summary: 'IT资讯热榜日榜内容',
    tags: ['IT之家', '热榜']
  })
}

function ithomeRankSharePayload(rank: IthomeRank): SharePayload {
  return {
    id: ithomeRankFavoriteKey(rank),
    title: rank.title,
    url: rank.link || toSourceUrl('/'),
    description: 'IT资讯热榜日榜内容',
    source: 'IT之家 · IT资讯热榜',
    tags: ['IT之家', '热榜'],
    type: 'item'
  }
}

onMounted((): void => {
  void fetchSection()
})
</script>

<template>
  <main class="ithome-page">
    <section class="ithome-hero">
      <div>
        <span class="eyebrow">ITHOME</span>
        <h1>IT之家</h1>
        <p>把 IT之家栏目收进内部页面，活动互动、业界、网络、评论等栏目可直接切换查看。</p>
      </div>
      <div class="hero-actions">
        <button type="button" :disabled="isLoading" @click="fetchSection">刷新</button>
        <button type="button" :disabled="isLoading" @click="openSource()">打开原站</button>
      </div>
    </section>

    <nav class="section-tabs" aria-label="IT之家栏目">
      <button
        v-for="section in sections"
        :key="section.id"
        type="button"
        :class="{ active: activeSectionId === section.id }"
        :disabled="isLoading"
        @click="selectSection(section)"
      >
        {{ section.label }}
      </button>
    </nav>

    <div class="status-row">
      <strong>{{ activeSection.label }}</strong>
      <span>{{ isLoading ? '正在加载栏目数据...' : `第 ${currentPage} / ${totalPages} 页 · 已解析 ${items.length} 条内容` }}</span>
    </div>

    <div v-if="isLoading" class="loading-panel">
      <span class="loading-spinner"></span>
      <strong>正在加载 {{ activeSection.label }} 数据...</strong>
    </div>

    <p v-else-if="errorMessage && !items.length" class="empty-message">{{ errorMessage }}</p>

    <div v-if="shouldShowContent" class="page-controls">
      <button type="button" :disabled="currentPage <= 1 || isLoading" @click="goPage(currentPage - 1)">上一页</button>
      <button
        v-for="page in totalPages"
        :key="page"
        type="button"
        :class="{ active: currentPage === page }"
        :disabled="isLoading"
        @click="goPage(page)"
      >
        {{ page }}
      </button>
      <button type="button" :disabled="currentPage >= totalPages || isLoading" @click="goPage(currentPage + 1)">下一页</button>
    </div>

    <section v-if="shouldShowContent" class="content-grid">
      <div class="news-list">
        <article v-for="item in visibleItems" :key="item.link || item.title" class="news-card">
          <img v-if="item.image" :src="item.image" :alt="item.title" loading="lazy">
          <div class="news-body">
            <a :href="item.link" target="_blank" rel="noopener noreferrer">{{ item.title }}</a>
            <p>{{ item.summary }}</p>
            <div class="meta-row">
              <span>{{ item.date || '时间待同步' }}</span>
              <span v-if="item.tags.length">Tags：{{ item.tags.slice(0, 4).join('、') }}</span>
            </div>
          </div>
          <ContentFavoriteButton
            class="news-card-favorite"
            size="compact"
            :active="isContentItemFavorite(ithomeItemFavoriteKey(item))"
            :title="isContentItemFavorite(ithomeItemFavoriteKey(item)) ? '取消收藏新闻' : '收藏新闻'"
            @toggle="toggleIthomeItemFavorite(item)"
          />
          <ShareButton
            class="news-card-share"
            size="compact"
            :payload="ithomeItemSharePayload(item)"
          />
        </article>
      </div>

      <aside class="rank-panel">
        <div class="rank-head">
          <strong>IT资讯热榜</strong>
          <span>日榜</span>
        </div>
        <ol>
          <li v-for="(rank, index) in ranks" :key="rank.link || rank.title">
            <span>{{ index + 1 }}</span>
            <a :href="rank.link" target="_blank" rel="noopener noreferrer">{{ rank.title }}</a>
            <ContentFavoriteButton
              class="rank-item-favorite"
              size="compact"
              :active="isContentItemFavorite(ithomeRankFavoriteKey(rank))"
              :title="isContentItemFavorite(ithomeRankFavoriteKey(rank)) ? '取消收藏热榜' : '收藏热榜'"
              @toggle="toggleIthomeRankFavorite(rank)"
            />
            <ShareButton
              class="rank-item-share"
              size="compact"
              :payload="ithomeRankSharePayload(rank)"
            />
          </li>
        </ol>
      </aside>
    </section>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
