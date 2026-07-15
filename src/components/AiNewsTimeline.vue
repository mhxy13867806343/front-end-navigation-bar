<script setup lang="ts">

import dailyNewsData from '../utlis/daily_ai_news.json'
import wechatFeaturedArticles from '../ajson/wechat-featured-articles.json'
import { requestJson, requestText } from '@/utils/request'

type NewsSource = 'aiBot' | 'ithome' | 'wechat'

interface NewsItem {
  title: string
  link: string
  desc: string
  source: string
  image?: string
  commentCount?: number
  tags?: string[]
}

interface NewsDay {
  date: string
  items: NewsItem[]
}

interface IthomeNewsRaw {
  newsid?: number
  title?: string
  orderdate?: string
  postdate?: string
  description?: string
  image?: string
  commentcount?: number
  url?: string | null
}

interface IthomeNewsResponse {
  Success: number
  Result?: IthomeNewsRaw[]
}

const newsTimeline = ref<NewsDay[]>(dailyNewsData as NewsDay[])
const activeSource = ref<NewsSource>('aiBot')
const isLiveMode = ref<boolean>(false) // true if fetched successfully in real-time
const isLoading = ref<boolean>(false)
const errorMessage = ref<string>('')
const currentPage = ref<number>(1)
const hasNextPage = ref<boolean>(true)

const ITHOME_NEWS_TAG: string = 'API'

const pageTitle = computed<string>((): string => {
  if (activeSource.value === 'wechat') return '📰 公众号精选文章'
  return activeSource.value === 'aiBot' ? '📈 每日 AI 行业快讯热闻' : '📈 IT之家 API 标签资讯'
})

const pageSubtitle = computed<string>((): string => {
  if (activeSource.value === 'wechat') {
    return '收录指定公众号文章的结构化摘要，点击卡片可打开微信原文继续阅读。'
  }

  return activeSource.value === 'aiBot'
    ? '跟踪全球人工智能最新技术突破、重大动态、企业融资及产品发布（自动刷新最新快讯）。'
    : '调用 IT之家标签新闻接口，当前标签：API；可通过上一页/下一页按钮按 PageNo 分页获取。'
})

const loadingText = computed<string>((): string => {
  if (activeSource.value === 'wechat') return '正在读取本地公众号精选文章...'

  return activeSource.value === 'aiBot'
    ? '正在从 AI 社区抓取最新快讯，请稍候...'
    : '正在从 IT之家 API 标签接口获取资讯，请稍候...'
})

const statusText = computed<string>((): string => {
  if (activeSource.value === 'wechat') return '本地精选模式'
  if (!isLiveMode.value) return '本地历史模式'
  return activeSource.value === 'ithome' ? `实时在线模式 · 第 ${currentPage.value} 页` : '实时在线模式'
})

const openLink = (link: string): void => {
  if (link) {
    window.open(link, '_blank')
  }
}

const parseAiBotNewsHtml = (htmlText: string): NewsDay[] => {
  const parser: DOMParser = new DOMParser()
  const doc: Document = parser.parseFromString(htmlText, 'text/html')
  const dateElements: NodeListOf<Element> = doc.querySelectorAll('.news-date')

  if (dateElements.length === 0) {
    throw new Error('未找到资讯时间节点，可能是页面结构发生变化或被拦截。')
  }

  const parsedData: NewsDay[] = []

  dateElements.forEach((dateEl: Element): void => {
    const dateText: string = dateEl.textContent?.trim() || ''
    const items: NewsItem[] = []
    let nextSibling: Element | null = dateEl.nextElementSibling

    while (nextSibling && !nextSibling.classList.contains('news-date')) {
      if (nextSibling.classList.contains('news-item')) {
        const h2: Element | null = nextSibling.querySelector('h2')
        const p: Element | null = nextSibling.querySelector('p')

        if (h2 && p) {
          const a: Element | null = h2.querySelector('a')
          const title: string = h2.textContent?.trim() || ''
          const link: string = a ? a.getAttribute('href') || '' : ''
          const sourceSpan: Element | null = p.querySelector('.news-time')
          const sourceText: string = sourceSpan?.textContent || ''
          const source: string = sourceText ? sourceText.replace('来源：', '').trim() : ''
          let desc: string = p.textContent?.trim() || ''

          if (sourceSpan) {
            desc = desc.replace(sourceText, '').trim()
          }

          items.push({
            title,
            link,
            desc,
            source
          })
        }
      }
      nextSibling = nextSibling.nextElementSibling
    }

    if (items.length > 0) {
      parsedData.push({
        date: dateText,
        items
      })
    }
  })

  return parsedData
}

const buildIthomeApiUrl = (pageNo: number): string => {
  const params: URLSearchParams = new URLSearchParams({
    NewsTag: ITHOME_NEWS_TAG,
    PageNo: String(pageNo)
  })

  return `/api-ithome/api/news/newstaglistpageget?${params.toString()}`
}

const buildIthomeArticleLink = (newsId: number | undefined, url: string | null | undefined): string => {
  if (url) return url
  if (!newsId) return 'https://www.ithome.com/'

  const idText: string = String(newsId).padStart(6, '0')
  const prefix: string = idText.slice(0, 3)
  const suffix: string = idText.slice(3)
  return `https://www.ithome.com/0/${prefix}/${suffix}.htm`
}

const formatIthomeDate = (dateText: string | undefined): string => {
  if (!dateText) return '未知日期'
  const date: Date = new Date(dateText)
  if (Number.isNaN(date.getTime())) return dateText
  const year: number = date.getFullYear()
  const month: string = String(date.getMonth() + 1).padStart(2, '0')
  const day: string = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const mapIthomeNews = (items: IthomeNewsRaw[]): NewsDay[] => {
  const grouped: Map<string, NewsItem[]> = new Map<string, NewsItem[]>()

  items.forEach((item: IthomeNewsRaw): void => {
    const dateKey: string = formatIthomeDate(item.postdate || item.orderdate)
    const nextItems: NewsItem[] = grouped.get(dateKey) || []

    nextItems.push({
      title: item.title || '未命名资讯',
      link: buildIthomeArticleLink(item.newsid, item.url),
      desc: item.description || '',
      source: 'IT之家 · API 标签',
      image: item.image || '',
      commentCount: item.commentcount || 0
    })

    grouped.set(dateKey, nextItems)
  })

  return Array.from(grouped.entries()).map(([date, items]: [string, NewsItem[]]): NewsDay => ({
    date: `IT之家 API 标签资讯 · ${date}`,
    items
  }))
}

const fetchAiBotNews = async (): Promise<boolean> => {
  const targetUrls: string[] = [
    '/api-news',
    'https://api.codetabs.com/v1/proxy?quest=https://ai-bot.cn/daily-ai-news/',
    'https://api.allorigins.win/raw?url=https://ai-bot.cn/daily-ai-news/'
  ]

  for (const url of targetUrls) {
    try {
      const htmlText: string = await requestText(url, {
        headers: {
          Accept: 'text/html'
        }
      })
      const parsed: NewsDay[] = parseAiBotNewsHtml(htmlText)

      if (parsed.length > 0) {
        newsTimeline.value = parsed
        isLiveMode.value = true
        hasNextPage.value = false
        return true
      }
    } catch (err: unknown) {
      const message: string = err instanceof Error ? err.message : String(err)
      console.warn(`Failed to fetch ai-bot daily news from ${url}:`, message)
    }
  }

  newsTimeline.value = dailyNewsData as NewsDay[]
  isLiveMode.value = false
  hasNextPage.value = false
  errorMessage.value = 'ai-bot 每日 AI 资讯暂不可用，已展示本地历史资讯。'
  return false
}

const fetchIthomeNews = async (pageNo: number = currentPage.value): Promise<boolean> => {
  const json: IthomeNewsResponse = await requestJson<IthomeNewsResponse>(buildIthomeApiUrl(pageNo))
  const result: IthomeNewsRaw[] = json.Result || []

  if (json.Success !== 1 || result.length === 0) {
    currentPage.value = pageNo
    newsTimeline.value = []
    hasNextPage.value = false
    errorMessage.value = pageNo > 1 ? '没有更多 IT之家 API 标签资讯了。' : 'IT之家 API 标签资讯暂无数据。'
    return false
  }

  newsTimeline.value = mapIthomeNews(result)
  currentPage.value = pageNo
  isLiveMode.value = true
  hasNextPage.value = true
  return true
}

const fetchWechatFeaturedArticles = (): boolean => {
  newsTimeline.value = wechatFeaturedArticles as NewsDay[]
  isLiveMode.value = false
  hasNextPage.value = false
  errorMessage.value = ''
  return true
}

const fetchLatestNews = async (pageNo: number = currentPage.value): Promise<boolean> => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    if (activeSource.value === 'wechat') return fetchWechatFeaturedArticles()
    return activeSource.value === 'aiBot' ? await fetchAiBotNews() : await fetchIthomeNews(pageNo)
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : String(err)
    console.warn(`Failed to fetch ${activeSource.value} news:`, message)

    if (activeSource.value === 'aiBot' || pageNo === 1) {
      newsTimeline.value = dailyNewsData as NewsDay[]
      isLiveMode.value = false
      errorMessage.value = activeSource.value === 'aiBot'
        ? 'ai-bot 每日 AI 资讯暂不可用，已展示本地历史资讯。'
        : 'IT之家接口暂不可用，已展示本地历史资讯。'
    } else {
      errorMessage.value = '下一页加载失败，请稍后重试。'
    }
    return false
  } finally {
    isLoading.value = false
  }
}

const countdown = ref<number>(60)
const triggerManualRefresh = (): void => {
  fetchLatestNews(currentPage.value)
  countdown.value = 60
}

const loadNextPage = async (): Promise<void> => {
  if (activeSource.value !== 'ithome') return
  const nextPage: number = currentPage.value + 1
  await fetchLatestNews(nextPage)
}

const loadPrevPage = async (): Promise<void> => {
  if (activeSource.value !== 'ithome' || currentPage.value <= 1) return
  const prevPage: number = currentPage.value - 1
  hasNextPage.value = true
  await fetchLatestNews(prevPage)
}

const switchNewsSource = (source: NewsSource): void => {
  if (activeSource.value === source) return
  activeSource.value = source
  currentPage.value = 1
  hasNextPage.value = source === 'ithome'
  newsTimeline.value = source === 'aiBot'
    ? dailyNewsData as NewsDay[]
    : source === 'wechat'
      ? wechatFeaturedArticles as NewsDay[]
      : []
  fetchLatestNews(1)
  countdown.value = 60
}

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  fetchLatestNews(1)
  timer = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--
    } else {
      fetchLatestNews(currentPage.value)
      countdown.value = 60
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="news-timeline-container">
    <!-- Header Controls -->
    <div class="news-timeline-header">
      <div class="title-wrap">
        <h2 class="title">{{ pageTitle }}</h2>
        <p class="subtitle">{{ pageSubtitle }}</p>
      </div>
      
      <div class="header-badges">
        <el-button-group>
          <el-button
            size="small"
            :type="activeSource === 'aiBot' ? 'primary' : 'default'"
            @click="switchNewsSource('aiBot')"
          >
            每日 AI 资讯
          </el-button>
          <el-button
            size="small"
            :type="activeSource === 'ithome' ? 'primary' : 'default'"
            @click="switchNewsSource('ithome')"
          >
            IT之家 API
          </el-button>
          <el-button
            size="small"
            :type="activeSource === 'wechat' ? 'primary' : 'default'"
            @click="switchNewsSource('wechat')"
          >
            公众号精选
          </el-button>
        </el-button-group>

        <!-- Status indicator badge -->
        <div class="status-badge" :class="isLiveMode ? 'live' : 'cached'">
          <span class="dot">●</span>
          <span>{{ statusText }}</span>
        </div>
        
        <el-button 
          size="small" 
          type="primary" 
          :loading="isLoading" 
          @click="triggerManualRefresh"
        >
          🔄 刷新数据 ({{ countdown }}s)
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="warning"
      show-icon
      :closable="false"
    />

    <!-- Timeline Wrapper -->
    <div class="timeline-wrapper">
      <div class="timeline-axis-line"></div>

      <!-- Loading skeleton screen -->
      <div v-if="isLoading" class="timeline-loading-box">
        <span class="loading-spinner"></span>
        <span>{{ loadingText }}</span>
      </div>

      <!-- Main timeline list -->
      <template v-else>
        <div 
          v-for="day in newsTimeline" 
          :key="day.date" 
          class="timeline-node-group"
        >
          <!-- Date Marker Node -->
          <div class="timeline-date-marker">
            <div class="node-dot"></div>
            <span class="date-txt">{{ day.date }}</span>
          </div>

          <!-- News Card List under this date -->
          <div class="timeline-news-list">
            <div 
              v-for="(item, idx) in day.items" 
              :key="idx" 
              class="news-item-card"
              @click="openLink(item.link)"
              :title="'点击阅读来源文章: ' + item.link"
            >
              <div class="card-inner-header">
                <h3 class="news-title-link">
                  {{ item.title }}
                </h3>
                <span class="external-link-arrow">↗</span>
              </div>
              
              <p class="news-desc">{{ item.desc }}</p>
              <img v-if="item.image" class="news-thumb" :src="item.image" :alt="item.title" loading="lazy" />
              
              <div class="news-card-footer">
                <div class="news-meta-tags">
                  <span class="source-tag" v-if="item.source">
                    🏷️ 来源：{{ item.source }}
                  </span>
                  <span class="source-tag" v-if="item.commentCount">
                    💬 {{ item.commentCount }} 评论
                  </span>
                  <span
                    v-for="tag in item.tags"
                    :key="tag"
                    class="source-tag topic-tag"
                  >
                    # {{ tag }}
                  </span>
                </div>
                <span class="action-hint">查看详情</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-if="activeSource === 'ithome'" class="pagination-actions">
      <el-button round
        :loading="isLoading"
        :disabled="currentPage <= 1"
        @click="loadPrevPage"
      >
        上一页
      </el-button>
      <el-button round
        type="primary"
        :loading="isLoading"
        :disabled="!hasNextPage"
        @click="loadNextPage"
      >
        下一页
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.news-timeline-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  animation: fadeIn 0.4s ease;
}

.news-timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.news-timeline-header .title {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 6px 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.news-timeline-header .subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.header-badges {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.status-badge {
  font-size: 12.5px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-badge.live {
  background: rgba(29, 209, 161, 0.12);
  color: #1dd1a1;
  border: 1px solid rgba(29, 209, 161, 0.25);
}

.status-badge.cached {
  background: rgba(255, 159, 67, 0.12);
  color: #ff9f43;
  border: 1px solid rgba(255, 159, 67, 0.25);
}

.status-badge .dot {
  font-size: 10px;
}

/* Timeline vertical axis design */
.timeline-wrapper {
  position: relative;
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.timeline-axis-line {
  position: absolute;
  top: 10px;
  left: 6px;
  bottom: 10px;
  width: 2px;
  background: linear-gradient(180deg, var(--primary-color), var(--border-color) 40%, rgba(255,255,255,0.05));
  z-index: 1;
}

.timeline-node-group {
  position: relative;
  z-index: 2;
}

/* Date marker node */
.timeline-date-marker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.node-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--primary-color);
  border: 3px solid var(--card-bg);
  box-shadow: 0 0 10px var(--primary-color);
  margin-left: -7px;
  z-index: 3;
}

.date-txt {
  font-size: 16px;
  font-weight: 800;
  color: var(--primary-color);
  background: var(--hover-bg);
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
}

/* News cards layout */
.timeline-news-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 12px;
}

.news-item-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.news-item-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px rgba(var(--primary-color-rgb, 99, 102, 241), 0.12);
}

.card-inner-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.news-title-link {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-color);
  line-height: 1.45;
  margin: 0;
  transition: color 0.2s;
}

.news-item-card:hover .news-title-link {
  color: var(--primary-color);
}

.external-link-arrow {
  font-size: 14px;
  color: var(--text-secondary);
  transition: transform 0.2s;
}

.news-item-card:hover .external-link-arrow {
  transform: translate(2px, -2px);
  color: var(--primary-color);
}

.news-desc {
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.news-thumb {
  display: block;
  width: 160px;
  max-width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin: 0 0 12px 0;
}

.news-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  gap: 10px;
  flex-wrap: wrap;
}

.news-meta-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
}

.source-tag {
  color: var(--text-secondary);
  background: var(--hover-bg);
  padding: 2px 8px;
  border-radius: 4px;
}

.topic-tag {
  color: var(--primary-color);
  border: 1px solid rgba(var(--primary-color-rgb, 99, 102, 241), 0.18);
}

.action-hint {
  color: var(--primary-color);
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.2s;
}

.news-item-card:hover .action-hint {
  opacity: 1;
}

.pagination-actions {
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

/* Loading skeleton styles */
.timeline-loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 0;
  color: var(--primary-color);
  font-size: 13px;
  font-weight: bold;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(var(--primary-color-rgb, 99, 102, 241), 0.2);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
