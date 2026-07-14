<script setup lang="ts">

import dailyNewsData from '../utlis/daily_ai_news.json'
import { requestText } from '@/utils/request'

interface NewsItem {
  title: string
  link: string
  desc: string
  source: string
}

interface NewsDay {
  date: string
  items: NewsItem[]
}

const newsTimeline = ref<NewsDay[]>(dailyNewsData as NewsDay[])
const isLiveMode = ref<boolean>(false) // true if fetched successfully in real-time
const isLoading = ref<boolean>(false)
const errorMessage = ref<string>('')

const openLink = (link: string): void => {
  if (link) {
    window.open(link, '_blank')
  }
}

// Client-side HTML parser using DOMParser
const parseNewsHtml = (htmlText: string): NewsDay[] => {
  const parser: DOMParser = new DOMParser()
  const doc: Document = parser.parseFromString(htmlText, 'text/html')
  
  const dateElements = doc.querySelectorAll('.news-date')
  if (dateElements.length === 0) {
    throw new Error('未找到资讯时间节点，可能是页面结构发生变化或被拦截。')
  }
  
  const parsedData: NewsDay[] = []
  
  dateElements.forEach((dateEl) => {
    const dateText: string = dateEl.textContent?.trim() || ''
    const items: NewsItem[] = []
    
    // Scan all next siblings until encountering the next .news-date
    let nextSibling = dateEl.nextElementSibling
    while (nextSibling && !nextSibling.classList.contains('news-date')) {
      if (nextSibling.classList.contains('news-item')) {
        const h2: Element | null = nextSibling.querySelector('h2')
        const p: Element | null = nextSibling.querySelector('p')
        
        if (h2 && p) {
          const a: Element | null = h2.querySelector('a')
          const title: string = h2.textContent?.trim() || ''
          const link: string = a ? a.getAttribute('href') || '' : ''
          
          // Extract source from .news-time span
          const sourceSpan: Element | null = p.querySelector('.news-time')
          const sourceText: string = sourceSpan?.textContent || ''
          const source: string = sourceText ? sourceText.replace('来源：', '').trim() : ''
          
          // Clean the description text (remove the source tag text inside it)
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

const fetchLatestNews = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = ''
  
  // We try local dev server proxy first, and fallback to direct/CORS proxies if needed
  const targetUrls: string[] = [
    '/api-news', // Local Vite proxy (works locally in development)
    'https://api.codetabs.com/v1/proxy?quest=https://ai-bot.cn/daily-ai-news/', // Public CORS Proxy 1
    'https://api.allorigins.win/raw?url=https://ai-bot.cn/daily-ai-news/' // Public CORS Proxy 2
  ]
  
  let success: boolean = false
  
  for (const url of targetUrls) {
    try {
      const htmlText: string = await requestText(url, {
        headers: {
          'Accept': 'text/html'
        }
      })
      const parsed = parseNewsHtml(htmlText)
      if (parsed && parsed.length > 0) {
        newsTimeline.value = parsed
        isLiveMode.value = true
        success = true
        break // Success! Stop checking other endpoints.
      }
    } catch (err: unknown) {
      const message: string = err instanceof Error ? err.message : String(err)
      console.warn(`Failed to fetch news from ${url}:`, message)
    }
  }
  
  if (!success) {
    console.log('Unable to reach live news feeds via proxy. Falling back to pre-packaged historical news dataset.')
    newsTimeline.value = dailyNewsData // fall back to pre-loaded list
    isLiveMode.value = false
  }
  isLoading.value = false
}

const countdown = ref<number>(60)
const triggerManualRefresh = (): void => {
  fetchLatestNews()
  countdown.value = 60
}

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  fetchLatestNews()
  timer = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--
    } else {
      fetchLatestNews()
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
        <h2 class="title">📈 每日 AI 行业快讯热闻</h2>
        <p class="subtitle">跟踪全球人工智能最新技术突破、重大动态、企业融资及产品发布（自动刷新最新快讯）。</p>
      </div>
      
      <div class="header-badges">
        <!-- Status indicator badge -->
        <div class="status-badge" :class="isLiveMode ? 'live' : 'cached'">
          <span class="dot">●</span>
          <span>{{ isLiveMode ? '实时在线模式' : '本地历史模式' }}</span>
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

    <!-- Timeline Wrapper -->
    <div class="timeline-wrapper">
      <div class="timeline-axis-line"></div>

      <!-- Loading skeleton screen -->
      <div v-if="isLoading" class="timeline-loading-box">
        <span class="loading-spinner"></span>
        <span>正在从 AI 社区抓取最新快讯，请稍候...</span>
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
              
              <div class="news-card-footer">
                <span class="source-tag" v-if="item.source">
                  🏷️ 来源：{{ item.source }}
                </span>
                <span class="action-hint">查看详情</span>
              </div>
            </div>
          </div>
        </div>
      </template>
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

.news-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
}

.source-tag {
  color: var(--text-secondary);
  background: var(--hover-bg);
  padding: 2px 8px;
  border-radius: 4px;
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
