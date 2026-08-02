<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ContentFavoriteButton from '@/components/ContentFavoriteButton.vue'
import ShareButton from '@/components/ShareButton.vue'
import { useContentItemFavorites } from '@/composables/useContentItemFavorites'
import type { SharePayload } from '@/composables/useShareRecords'
import { requestText } from '@/utils/request'
import { resolveApiUrl } from '@/utils/resolveApiUrl'

type GithubSourceId = 'gitcn-daily' | 'gitcn-monthly' | 'githot-archive' | 'hellogithub'
type ArchiveType = 'daily' | 'weekly' | 'monthly'
type HelloGithubMode = 'periodical' | 'issue' | 'category'

interface GithubSource {
  id: GithubSourceId
  label: string
  desc: string
  sourceUrl: string
}

interface GitcnProject {
  fullName: string
  link: string
  summary: string
  language: string
  stars: string
  todayStars: string
  tags: string[]
}

interface ArchiveEntry {
  type: ArchiveType
  label: string
  date: string
  link: string
}

interface HelloGithubItem {
  title: string
  summary: string
  image: string
  link: string
}

const sources: GithubSource[] = [
  {
    id: 'gitcn-daily',
    label: 'GitCN 今日趋势',
    desc: '浏览当前 GitHub 上热门开源项目，可按编程语言筛选。',
    sourceUrl: 'https://gitcn.org/trending'
  },
  {
    id: 'gitcn-monthly',
    label: 'GitCN 月度趋势',
    desc: '浏览本月 GitHub 热门开源项目。',
    sourceUrl: 'https://gitcn.org/trends/monthly'
  },
  {
    id: 'githot-archive',
    label: 'Githot 历史归档',
    desc: '今日、本周、本月、历史日期快照和语言筛选入口。',
    sourceUrl: 'https://githot.dev/archive'
  },
  {
    id: 'hellogithub',
    label: 'HelloGitHub 月刊',
    desc: '往期期数、分类入口和月刊项目卡片。',
    sourceUrl: 'https://hellogithub.com/periodical'
  }
]

const helloCategories: string[] = ['C', 'C#', 'C++', 'CSS', 'Go', 'Java', 'JavaScript', 'Kotlin', 'Objective-C', 'PHP', 'Python', 'Ruby', 'Rust', 'Swift', '人工智能', '其它', '开源书籍']
const helloIssues: number[] = Array.from({ length: 29 }, (_: unknown, index: number): number => 124 - index)
const archiveTypes: Array<{ id: ArchiveType; label: string }> = [
  { id: 'daily', label: '日榜快照' },
  { id: 'weekly', label: '周榜快照' },
  { id: 'monthly', label: '月榜快照' }
]

const activeSourceId = ref<GithubSourceId>('gitcn-daily')
const activeArchiveType = ref<ArchiveType>('daily')
const activeLanguage = ref('全部语言')
const activeHelloMode = ref<HelloGithubMode>('periodical')
const activeIssue = ref(124)
const activeCategory = ref('C')
const showOlderIssues = ref(false)
const gitcnProjects = ref<GitcnProject[]>([])
const archiveEntries = ref<ArchiveEntry[]>([])
const helloItems = ref<HelloGithubItem[]>([])
const helloImageErrors = ref<Record<string, boolean>>({})
const isLoading = ref(false)
const errorMessage = ref('')
const { isContentItemFavorite, toggleContentItemFavorite } = useContentItemFavorites()

const activeSource = computed<GithubSource>(() => {
  return sources.find((source: GithubSource): boolean => source.id === activeSourceId.value) ?? sources[0]
})

const gitcnLanguages = computed<string[]>(() => {
  const values: string[] = Array.from(new Set(gitcnProjects.value.map((item: GitcnProject): string => item.language).filter(Boolean)))
  return ['全部语言', ...values]
})

const visibleGitcnProjects = computed<GitcnProject[]>(() => {
  if (activeLanguage.value === '全部语言') return gitcnProjects.value
  return gitcnProjects.value.filter((item: GitcnProject): boolean => item.language === activeLanguage.value)
})

const visibleArchiveEntries = computed<ArchiveEntry[]>(() => {
  return archiveEntries.value.filter((entry: ArchiveEntry): boolean => entry.type === activeArchiveType.value)
})

const displayedHelloIssues = computed<number[]>(() => {
  if (!showOlderIssues.value) return helloIssues
  return [
    ...helloIssues,
    ...Array.from({ length: 95 }, (_: unknown, index: number): number => 95 - index)
  ]
})

const isGitcnSource = computed<boolean>(() => activeSourceId.value === 'gitcn-daily' || activeSourceId.value === 'gitcn-monthly')

const isContentReady = computed<boolean>(() => !isLoading.value && !errorMessage.value)

function decodeJsonText(value: string): string {
  const withUnicode: string = value.replace(/\\u([0-9a-fA-F]{4})/g, (_: string, code: string): string => {
    return String.fromCharCode(Number.parseInt(code, 16))
  })
  return withUnicode
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeNumber(value: string): string {
  const numberValue: number = Number(value)
  if (!Number.isFinite(numberValue) || numberValue <= 0) return ''
  if (numberValue >= 10000) return `${(numberValue / 1000).toFixed(numberValue >= 100000 ? 0 : 1)} k`
  return String(numberValue)
}

function extractField(block: string, field: string): string {
  const match: RegExpMatchArray | null = block.match(new RegExp(`"${field}":"([^"]*)"`, 'm'))
  return match ? decodeJsonText(match[1]) : ''
}

function extractNumberField(block: string, field: string): string {
  const match: RegExpMatchArray | null = block.match(new RegExp(`"${field}":([0-9]+)`, 'm'))
  return match ? match[1] : ''
}

function parseTags(block: string): string[] {
  const tagsMatch: RegExpMatchArray | null = block.match(/"tags":\[([\s\S]*?)]/)
  if (!tagsMatch) return []
  return Array.from(tagsMatch[1].matchAll(/"([^"]+)"/g))
    .map((match: RegExpMatchArray): string => decodeJsonText(match[1]))
    .filter(Boolean)
    .slice(0, 8)
}

function toHelloGithubImageUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname !== 'img.hellogithub.com') return url
    return resolveApiUrl(`/api-hellogithub-img${parsedUrl.pathname}${parsedUrl.search}`)
  } catch {
    return url
  }
}

function parseGitcnProjects(html: string): GitcnProject[] {
  const normalizedHtml: string = decodeJsonText(html)
  const blocks: string[] = normalizedHtml.split('"fullName":"').slice(1)
  const seen: Set<string> = new Set()

  return blocks
    .map((chunk: string): GitcnProject => {
      const block: string = `"fullName":"${chunk.slice(0, 4500)}`
      const fullName: string = decodeJsonText(chunk.split('"')[0] ?? '')
      const link: string = extractField(block, 'sourceUrl') || `https://github.com/${fullName}`
      const summary: string = extractField(block, 'summary') || extractField(block, 'description')
      const language: string = extractField(block, 'lang')
      const stars: string = normalizeNumber(extractNumberField(block, 'starCount'))
      const todayStars: string = normalizeNumber(extractNumberField(block, 'starsInc'))

      return {
        fullName,
        link,
        summary,
        language,
        stars,
        todayStars,
        tags: parseTags(block)
      }
    })
    .filter((item: GitcnProject): boolean => {
      if (!item.fullName || seen.has(item.fullName)) return false
      seen.add(item.fullName)
      return true
    })
    .slice(0, 30)
}

function formatDateLabel(date: string, type: ArchiveType): string {
  if (type === 'daily') return date
  const current: Date = new Date(`${date}T00:00:00+08:00`)
  const start: Date = new Date(current)
  start.setDate(current.getDate() - 6)
  const left: string = `${start.getMonth() + 1}月${start.getDate()}日`
  const right: string = `${current.getMonth() + 1}月${current.getDate()}日`
  return `${left} - ${right}`
}

function parseArchive(html: string): ArchiveEntry[] {
  const entries: ArchiveEntry[] = []
  const seen: Set<string> = new Set()

  for (const match of html.matchAll(/href="\/(daily|weekly|monthly)\/(\d{4}-\d{2}-\d{2})"/g)) {
    const type: ArchiveType = match[1] as ArchiveType
    const date: string = match[2]
    const key: string = `${type}-${date}`
    if (seen.has(key)) continue
    seen.add(key)
    entries.push({
      type,
      date,
      label: formatDateLabel(date, type),
      link: `https://githot.dev/${type}/${date}`
    })
  }

  if (!entries.some((entry: ArchiveEntry): boolean => entry.type === 'daily')) {
    const dailyDates: string[] = Array.from(new Set(Array.from(html.matchAll(/\d{4}-\d{2}-\d{2}/g)).map((match: RegExpMatchArray): string => match[0])))
    for (const date of dailyDates.slice(0, 60)) {
      entries.push({
        type: 'daily',
        date,
        label: date,
        link: `https://githot.dev/daily/${date}`
      })
    }
  }

  return entries.slice(0, 120)
}

function parseHelloGithub(markdown: string): HelloGithubItem[] {
  const seen: Set<string> = new Set()
  const items: HelloGithubItem[] = []
  const sourceUrl: string = buildHelloGithubSourceUrl()

  for (const match of markdown.matchAll(/!\[Image \d+(?:: [^\]]+)?]\((https:\/\/img\.hellogithub\.com\/[^)]+)\)([^\n]+)/g)) {
    const title: string = decodeJsonText(match[2])
    if (!title || seen.has(title)) continue
    seen.add(title)
    items.push({
      title,
      summary: '',
      image: toHelloGithubImageUrl(match[1]),
      link: sourceUrl
    })
  }

  if (items.length) return items.slice(0, 24)

  let previousEnd = 0
  for (const match of markdown.matchAll(/!\[Image \d+: ([^\]]+)]\((https:\/\/img\.hellogithub\.com\/[^)]+)\)/g)) {
    const imageIndex: number = match.index ?? 0
    const beforeImage: string = markdown.slice(previousEnd, imageIndex)
    previousEnd = imageIndex + match[0].length
    const paragraphs: string[] = beforeImage
      .split(/\n{2,}/)
      .map((part: string): string => decodeJsonText(part))
      .filter((part: string): boolean => {
        return Boolean(part) && !/^Title:|^URL Source:|^Markdown Content:|^Published on|^HelloGitHub shares|^Star |^C$|^C#$|^C\+\+$|^Go$|^Java$|^JavaScript$|^Python$/i.test(part)
      })
    const title: string = decodeJsonText(match[1])
    if (!title || seen.has(title)) continue
    seen.add(title)
    items.push({
      title,
      summary: paragraphs.slice(-1)[0] ?? '',
      image: toHelloGithubImageUrl(match[2]),
      link: sourceUrl
    })
  }

  return items.slice(0, 24)
}

function buildGitcnProxyPath(source: GithubSource): string {
  return source.id === 'gitcn-monthly' ? '/api-gitcn/trends/monthly' : '/api-gitcn/trending'
}

async function fetchGitcn(source: GithubSource): Promise<void> {
  const html: string = await requestText(buildGitcnProxyPath(source))
  gitcnProjects.value = parseGitcnProjects(html)
  activeLanguage.value = '全部语言'
}

async function fetchArchive(): Promise<void> {
  const html: string = await requestText('/api-githot/archive')
  archiveEntries.value = parseArchive(html)
}

async function fetchHelloGithub(): Promise<void> {
  const markdown: string = await requestText(`https://r.jina.ai/http://${buildHelloGithubSourceUrl()}`)
  helloItems.value = parseHelloGithub(markdown)
  helloImageErrors.value = {}
}

async function fetchActiveSource(): Promise<void> {
  if (isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''
  if (activeSource.value.id === 'githot-archive') {
    archiveEntries.value = []
  } else if (activeSource.value.id === 'hellogithub') {
    helloItems.value = []
    helloImageErrors.value = {}
  } else {
    gitcnProjects.value = []
  }

  try {
    if (activeSource.value.id === 'githot-archive') {
      await fetchArchive()
    } else if (activeSource.value.id === 'hellogithub') {
      await fetchHelloGithub()
    } else {
      await fetchGitcn(activeSource.value)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'GitHub 数据加载失败'
  } finally {
    isLoading.value = false
  }
}

function selectSource(source: GithubSource): void {
  if (isLoading.value || activeSourceId.value === source.id) return
  activeSourceId.value = source.id
  void fetchActiveSource()
}

function openSource(url: string = activeSource.value.sourceUrl): void {
  if (isLoading.value) return
  const targetUrl: string = activeSourceId.value === 'hellogithub' && url === activeSource.value.sourceUrl ? buildHelloGithubSourceUrl() : url
  window.open(targetUrl, '_blank', 'noopener,noreferrer')
}

function buildHelloGithubSourceUrl(): string {
  if (activeHelloMode.value === 'issue') return `https://hellogithub.com/periodical/volume/${activeIssue.value}`
  if (activeHelloMode.value === 'category') return `https://hellogithub.com/periodical/category/${encodeURIComponent(`${activeCategory.value} 项目`)}`
  return 'https://hellogithub.com/periodical'
}

function selectHelloIssue(issue: number): void {
  if (isLoading.value || (activeHelloMode.value === 'issue' && activeIssue.value === issue)) return
  activeIssue.value = issue
  activeHelloMode.value = 'issue'
  void fetchActiveSource()
}

function selectHelloCategory(category: string): void {
  if (isLoading.value || (activeHelloMode.value === 'category' && activeCategory.value === category)) return
  activeCategory.value = category
  activeHelloMode.value = 'category'
  void fetchActiveSource()
}

function showOlderHelloIssues(): void {
  if (isLoading.value) return
  showOlderIssues.value = true
}

function markHelloImageFailed(title: string): void {
  helloImageErrors.value = {
    ...helloImageErrors.value,
    [title]: true
  }
}

function gitcnFavoriteKey(project: GitcnProject): string {
  return `github:gitcn:${activeSourceId.value}:${project.link || project.fullName}`
}

function toggleGitcnFavorite(project: GitcnProject): void {
  toggleContentItemFavorite({
    id: gitcnFavoriteKey(project),
    title: project.fullName,
    source: `GitHub聚合 · ${activeSource.value.label}`,
    url: project.link,
    summary: project.summary || '源站没有返回项目摘要。',
    tags: ['GitHub', activeSource.value.label, project.language, ...project.tags].filter(Boolean)
  })
}

function gitcnSharePayload(project: GitcnProject): SharePayload {
  return {
    id: gitcnFavoriteKey(project),
    title: project.fullName,
    url: project.link,
    description: project.summary || '源站没有返回项目摘要。',
    source: `GitHub聚合 · ${activeSource.value.label}`,
    tags: ['GitHub', activeSource.value.label, project.language, ...project.tags].filter(Boolean),
    type: 'item'
  }
}

function archiveSharePayload(entry: ArchiveEntry): SharePayload {
  return {
    id: `github:githot:${entry.type}:${entry.date}`,
    title: `Githot ${entry.label}`,
    url: entry.link,
    description: `${entry.label} GitHub ${archiveTypes.find((type) => type.id === entry.type)?.label || '趋势快照'}`,
    source: 'Githot 历史归档',
    tags: ['GitHub', 'Githot', entry.type, entry.date],
    type: 'item'
  }
}

function helloGithubFavoriteKey(item: HelloGithubItem): string {
  return `github:hellogithub:${activeHelloMode.value}:${activeIssue.value}:${activeCategory.value}:${item.link || item.title}`
}

function toggleHelloGithubFavorite(item: HelloGithubItem): void {
  toggleContentItemFavorite({
    id: helloGithubFavoriteKey(item),
    title: item.title,
    source: 'HelloGitHub 月刊',
    url: item.link || buildHelloGithubSourceUrl(),
    summary: item.summary || 'HelloGitHub 月刊项目卡片',
    image: item.image || undefined,
    tags: ['GitHub', 'HelloGitHub', activeHelloMode.value === 'category' ? activeCategory.value : `第${activeIssue.value}期`]
  })
}

function helloGithubSharePayload(item: HelloGithubItem): SharePayload {
  return {
    id: helloGithubFavoriteKey(item),
    title: item.title,
    url: item.link || buildHelloGithubSourceUrl(),
    description: item.summary || 'HelloGitHub 月刊项目卡片',
    image: item.image || undefined,
    source: 'HelloGitHub 月刊',
    tags: ['GitHub', 'HelloGitHub', activeHelloMode.value === 'category' ? activeCategory.value : `第${activeIssue.value}期`],
    type: 'item'
  }
}

onMounted((): void => {
  void fetchActiveSource()
})
</script>

<template>
  <main class="github-page">
    <section class="github-hero">
      <div>
        <span>GITHUB</span>
        <h1>GitHub 开源聚合</h1>
        <p>GitCN 趋势、Githot 历史归档、HelloGitHub 月刊放进同一个内部页面。</p>
      </div>
      <div class="hero-actions">
        <button type="button" :disabled="isLoading" @click="fetchActiveSource">刷新</button>
        <button type="button" :disabled="isLoading" @click="openSource()">打开原站</button>
      </div>
    </section>

    <nav class="source-tabs" aria-label="GitHub 来源">
      <button
        v-for="source in sources"
        :key="source.id"
        type="button"
        :class="{ active: activeSourceId === source.id }"
        :disabled="isLoading"
        @click="selectSource(source)"
      >
        {{ source.label }}
      </button>
    </nav>

    <div class="status-panel">
      <div>
        <strong>{{ activeSource.label }}</strong>
        <span>{{ activeSource.desc }}</span>
      </div>
      <b>{{ isLoading ? '加载中...' : '已就绪' }}</b>
    </div>

    <div v-if="isLoading" class="content-state">
      <span class="loading-spinner"></span>
      <strong>正在加载 {{ activeSource.label }}...</strong>
    </div>

    <p v-else-if="errorMessage" class="empty-message">{{ errorMessage }}</p>

    <section v-if="isContentReady && isGitcnSource" class="gitcn-section">
      <div class="filter-row">
        <button
          v-for="language in gitcnLanguages"
          :key="language"
          type="button"
          :class="{ active: activeLanguage === language }"
          :disabled="isLoading"
          @click="activeLanguage = language"
        >
          {{ language }}
        </button>
      </div>

      <article v-for="project in visibleGitcnProjects" :key="project.fullName" class="project-card">
        <div class="project-main">
          <a :href="project.link" target="_blank" rel="noopener noreferrer">{{ project.fullName }}</a>
          <p>{{ project.summary || '源站没有返回项目摘要。' }}</p>
          <div class="tag-row">
            <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
        <div class="project-meta">
          <span>{{ project.language || 'Unknown' }}</span>
          <b>Star {{ project.stars || '-' }}</b>
          <em>+{{ project.todayStars || '-' }}</em>
        </div>
        <ContentFavoriteButton
          class="github-card-favorite"
          size="compact"
          :active="isContentItemFavorite(gitcnFavoriteKey(project))"
          :title="isContentItemFavorite(gitcnFavoriteKey(project)) ? '取消收藏项目' : '收藏项目'"
          @toggle="toggleGitcnFavorite(project)"
        />
        <ShareButton
          class="github-card-share"
          size="compact"
          :payload="gitcnSharePayload(project)"
        />
      </article>
    </section>

    <section v-else-if="isContentReady && activeSourceId === 'githot-archive'" class="archive-section">
      <div class="archive-toolbar">
        <button
          v-for="type in archiveTypes"
          :key="type.id"
          type="button"
          :class="{ active: activeArchiveType === type.id }"
          :disabled="isLoading"
          @click="activeArchiveType = type.id"
        >
          {{ type.label }}
        </button>
      </div>
      <div class="archive-grid">
        <div
          v-for="entry in visibleArchiveEntries"
          :key="`${entry.type}-${entry.date}`"
          class="archive-entry"
        >
          <button
            type="button"
            :disabled="isLoading"
            @click="openSource(entry.link)"
          >
            {{ entry.label }}
          </button>
          <ShareButton
            size="compact"
            :payload="archiveSharePayload(entry)"
          />
        </div>
      </div>
    </section>

    <section v-else-if="isContentReady && activeSourceId === 'hellogithub'" class="hello-section">
      <div class="hello-controls">
        <strong>往期目录</strong>
        <div class="issue-grid">
          <button
            v-for="issue in displayedHelloIssues"
            :key="issue"
            type="button"
            :class="{ active: activeHelloMode === 'issue' && activeIssue === issue }"
            :disabled="isLoading"
            @click="selectHelloIssue(issue)"
          >
            {{ issue }}
          </button>
          <button
            v-if="!showOlderIssues"
            type="button"
            class="older-issue-button"
            :disabled="isLoading"
            @click="showOlderHelloIssues"
          >
            更早
          </button>
        </div>
        <strong>按分类</strong>
        <div class="category-grid">
          <button
            v-for="category in helloCategories"
            :key="category"
            type="button"
            :class="{ active: activeHelloMode === 'category' && activeCategory === category }"
            :disabled="isLoading"
            @click="selectHelloCategory(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <div class="hello-grid">
        <article v-for="item in helloItems" :key="item.title" class="hello-card">
          <ContentFavoriteButton
            class="hello-card-favorite"
            size="compact"
            :active="isContentItemFavorite(helloGithubFavoriteKey(item))"
            :title="isContentItemFavorite(helloGithubFavoriteKey(item)) ? '取消收藏项目' : '收藏项目'"
            @toggle="toggleHelloGithubFavorite(item)"
          />
          <ShareButton
            class="hello-card-share"
            size="compact"
            :payload="helloGithubSharePayload(item)"
          />
          <div class="hello-image-frame">
            <img
              v-if="item.image && !helloImageErrors[item.title]"
              :src="item.image"
              :alt="item.title"
              loading="lazy"
              referrerpolicy="no-referrer"
              @error="markHelloImageFailed(item.title)"
            >
            <div v-else class="hello-image-fallback">
              <span>HG</span>
              <small>{{ item.title }}</small>
            </div>
          </div>
          <a :href="item.link" target="_blank" rel="noopener noreferrer">{{ item.title }}</a>
          <p v-if="item.summary">{{ item.summary }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
