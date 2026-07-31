<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ContentFavoriteButton from '@/components/ContentFavoriteButton.vue'
import { useContentItemFavorites } from '@/composables/useContentItemFavorites'
import { requestText } from '@/utils/request'

interface MomentTab {
  id: string
  label: string
}

interface MomentItem {
  author: string
  avatar: string
  profile: string
  content: string
  time: string
  link: string
}

type PageButton = number | string

const tabs: MomentTab[] = [
  { id: 'follow', label: '关注' },
  { id: 'latest', label: '最新' },
  { id: 'important', label: '看重点' },
  { id: 'company', label: '大公司' },
  { id: 'finance', label: '财经动态' },
  { id: 'world', label: '看世界' },
  { id: 'silicon', label: '硅谷动态' }
]

const activeTabId = ref('latest')
const currentPage = ref(1)
const items = ref<MomentItem[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const { isContentItemFavorite, toggleContentItemFavorite } = useContentItemFavorites()

const activeTab = computed<MomentTab>(() => {
  return tabs.find((tab: MomentTab): boolean => tab.id === activeTabId.value) ?? tabs[1]
})

const shouldShowContent = computed<boolean>(() => !isLoading.value && items.value.length > 0)

const pageButtons = computed<PageButton[]>(() => {
  const current: number = currentPage.value
  const pages: Set<number> = new Set([1, current])

  if (current <= 8) {
    for (let page = 1; page <= 8; page += 1) pages.add(page)
  } else {
    for (let page = current - 2; page <= current + 2; page += 1) {
      if (page > 0) pages.add(page)
    }
  }

  const sorted: number[] = Array.from(pages).sort((left: number, right: number): number => left - right)
  return sorted.flatMap((page: number, index: number): PageButton[] => {
    const previous: number | undefined = sorted[index - 1]
    if (previous && page - previous > 1) return [`gap-${previous}-${page}`, page]
    return [page]
  })
})

function buildSourceUrl(tab: MomentTab = activeTab.value): string {
  const params: URLSearchParams = new URLSearchParams()
  if (tab.id !== 'latest') params.set('tab', tab.id)
  if (currentPage.value > 1) params.set('page', String(currentPage.value))
  const query: string = params.toString()
  return `https://www.huxiu.com/moment/${query ? `?${query}` : ''}`
}

function buildReaderUrl(tab: MomentTab = activeTab.value): string {
  return `https://r.jina.ai/http://${buildSourceUrl(tab)}`
}

function cleanText(value: string): string {
  return value
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[[^\]]*]\(javascript:;?\)/g, '')
    .replace(/_+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseMoments(markdown: string): MomentItem[] {
  const itemPattern: RegExp = /\[!\[Image \d+: ([^\]]+)\]\(([^)]+)\)\]\((https:\/\/www\.huxiu\.com\/member\/[^)]+)\)\[_([^_\]]+)_([\s\S]*?)\]\(https:\/\/www\.huxiu\.com\/member\/[^)]+\)\s*\n\n关注\s*\n\n([\s\S]*?)\n\n\[([^\]]+)\]\((https:\/\/www\.huxiu\.com\/moment\/\d+\.html)\)/g
  const parsed: MomentItem[] = []
  const seen: Set<string> = new Set()

  for (const match of markdown.matchAll(itemPattern)) {
    const link: string = match[8]
    if (seen.has(link)) continue
    seen.add(link)
    parsed.push({
      author: cleanText(match[4] || match[1]),
      avatar: match[2],
      profile: match[3],
      content: cleanText(match[6]).slice(0, 520),
      time: cleanText(match[7]),
      link
    })
  }

  return parsed.slice(0, 12)
}

async function fetchMoments(): Promise<void> {
  if (isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''
  items.value = []

  try {
    const markdown: string = await requestText(buildReaderUrl())
    items.value = parseMoments(markdown)
    if (!items.value.length) {
      errorMessage.value = '虎嗅当前返回内容没有解析到 24 小时动态，可点击打开原站查看。'
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '虎嗅动态加载失败'
  } finally {
    isLoading.value = false
  }
}

function selectTab(tab: MomentTab): void {
  if (isLoading.value || activeTabId.value === tab.id) return
  activeTabId.value = tab.id
  currentPage.value = 1
  void fetchMoments()
}

function goPage(page: number): void {
  if (isLoading.value) return
  const targetPage: number = Math.max(1, page)
  if (currentPage.value === targetPage) return
  currentPage.value = targetPage
  void fetchMoments()
}

function openSource(): void {
  window.open(buildSourceUrl(), '_blank', 'noopener,noreferrer')
}

function huxiuFavoriteKey(item: MomentItem): string {
  return `huxiu:moment:${activeTabId.value}:${item.link || item.author + item.time}`
}

function toggleHuxiuFavorite(item: MomentItem): void {
  toggleContentItemFavorite({
    id: huxiuFavoriteKey(item),
    title: item.content.slice(0, 36) || item.author,
    source: `虎嗅24小时 · ${activeTab.value.label}`,
    url: item.link || buildSourceUrl(),
    summary: item.content,
    image: item.avatar || undefined,
    tags: ['虎嗅24小时', activeTab.value.label, item.author].filter(Boolean)
  })
}

onMounted((): void => {
  void fetchMoments()
})
</script>

<template>
  <main class="huxiu-page">
    <section class="huxiu-header">
      <div>
        <span>HUXIU</span>
        <h1>虎嗅 24小时</h1>
        <p>关注、最新、看重点、大公司、财经动态等 24 小时动态统一收进内部页面。</p>
      </div>
      <div class="header-actions">
        <button type="button" :disabled="isLoading" @click="fetchMoments">刷新</button>
        <button type="button" :disabled="isLoading" @click="openSource">打开原站</button>
      </div>
    </section>

    <nav class="moment-tabs" aria-label="虎嗅 24 小时分类">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeTabId === tab.id }"
        :disabled="isLoading"
        @click="selectTab(tab)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div class="status-line">
      <strong>{{ activeTab.label }}</strong>
      <span>{{ isLoading ? '正在加载虎嗅动态...' : `第 ${currentPage} 页 · 已解析 ${items.length} 条动态` }}</span>
    </div>

    <div v-if="isLoading" class="loading-panel">
      <span class="loading-spinner"></span>
      <strong>正在加载 {{ activeTab.label }} 第 {{ currentPage }} 页...</strong>
    </div>

    <p v-else-if="errorMessage" class="empty-message">{{ errorMessage }}</p>

    <div v-if="shouldShowContent" class="page-controls">
      <button type="button" :disabled="currentPage <= 1 || isLoading" @click="goPage(currentPage - 1)">上一页</button>
      <button
        v-for="page in pageButtons"
        :key="page"
        type="button"
        :class="{ active: currentPage === page, gap: typeof page === 'string' }"
        :disabled="isLoading || typeof page === 'string'"
        @click="typeof page === 'number' && goPage(page)"
      >
        {{ typeof page === 'number' ? page : '...' }}
      </button>
      <button type="button" :disabled="isLoading" @click="goPage(currentPage + 1)">下一页</button>
    </div>

    <section v-if="shouldShowContent" class="moment-list">
      <article v-for="item in items" :key="item.link" class="moment-card">
        <ContentFavoriteButton
          class="moment-favorite"
          size="compact"
          :active="isContentItemFavorite(huxiuFavoriteKey(item))"
          :title="isContentItemFavorite(huxiuFavoriteKey(item)) ? '取消收藏动态' : '收藏动态'"
          @toggle="toggleHuxiuFavorite(item)"
        />
        <a class="avatar" :href="item.profile" target="_blank" rel="noopener noreferrer">
          <img :src="item.avatar" :alt="item.author" loading="lazy">
        </a>
        <div class="moment-body">
          <div class="moment-top">
            <a :href="item.profile" target="_blank" rel="noopener noreferrer">{{ item.author }}</a>
            <button type="button" :disabled="isLoading">关注</button>
          </div>
          <p>{{ item.content }}</p>
          <div class="moment-footer">
            <a :href="item.link" target="_blank" rel="noopener noreferrer">{{ item.time }}</a>
            <span>赞 · 评论 · 分享</span>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.huxiu-page {
  min-height: 100vh;
  padding: 28px;
  color: #2b3038;
  background: #f6f7f9;
}

.huxiu-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 26px 28px;
  background: #fff;
  border: 1px solid #edf0f4;
}

.huxiu-header span {
  color: #8d949f;
  font-weight: 800;
}

.huxiu-header h1 {
  margin: 8px 0 10px;
  font-size: 36px;
}

.huxiu-header p,
.status-line span,
.moment-footer,
.empty-message {
  color: #8a919c;
}

.header-actions,
.moment-tabs,
.page-controls,
.moment-top,
.moment-footer {
  display: flex;
  align-items: center;
}

.header-actions,
.moment-tabs {
  flex-wrap: wrap;
  gap: 12px;
}

button {
  height: 38px;
  padding: 0 16px;
  border: 1px solid #e1e5ea;
  border-radius: 6px;
  color: #2b3038;
  background: #fff;
  font-weight: 700;
  cursor: pointer;
}

.moment-tabs {
  margin: 22px 0;
  border-bottom: 1px solid #e6e9ee;
}

.moment-tabs button {
  border-color: transparent;
  color: #7c838d;
}

.moment-tabs button.active {
  color: #252a32;
  box-shadow: inset 0 -3px 0 #252a32;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.status-line {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #edf0f4;
}

.loading-panel {
  display: grid;
  gap: 10px;
  min-height: 180px;
  place-items: center;
  margin-bottom: 16px;
  color: #8a919c;
  background: #fff;
  border: 1px solid #edf0f4;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #dfe4ea;
  border-top-color: #252a32;
  border-radius: 50%;
  animation: huxiu-spin 0.8s linear infinite;
}

.page-controls {
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.page-controls button.active {
  color: #fff;
  background: #252a32;
}

.moment-list {
  display: grid;
  gap: 18px;
}

.moment-card {
  position: relative;
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  gap: 18px;
  padding: 26px;
  background: #fff;
  border: 1px solid #edf0f4;
}

.moment-favorite {
  position: absolute;
  top: 20px;
  right: 20px;
}

.avatar img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.moment-top {
  justify-content: space-between;
  padding-right: 46px;
}

.moment-top a,
.moment-footer a {
  color: #2b3038;
  font-weight: 800;
  text-decoration: none;
}

.moment-top button {
  min-width: 88px;
  color: #ff3b3b;
  border-color: #ff3b3b;
}

.moment-body p {
  margin: 20px 0 28px;
  font-size: 18px;
  line-height: 1.9;
}

.moment-footer {
  justify-content: space-between;
}

.empty-message {
  padding: 20px;
  background: #fff;
  border: 1px dashed #d8dde5;
}

@keyframes huxiu-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .huxiu-page {
    padding: 16px;
  }

  .huxiu-header,
  .moment-card {
    display: block;
  }

  .header-actions {
    margin-top: 16px;
  }

  .avatar img {
    margin-bottom: 14px;
  }
}
</style>
