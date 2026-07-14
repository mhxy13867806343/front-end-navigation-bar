<script setup lang="ts">

// Import fallback datasets
import fallbackTutorials from '../utlis/daily_ai_tutorials.json'
import fallbackQa from '../utlis/daily_ai_qa.json'
import fallbackEncyclopedia from '../utlis/daily_ai_encyclopedia.json'
import fallbackHallOfFame from '../utlis/daily_ai_hall_of_fame.json'
import { requestText } from '@/utils/request'

type ArticleType = 'tutorials' | 'qa' | 'encyclopedia' | 'hall_of_fame'

interface ArticleItem {
  title: string
  link: string
  desc: string
  thumbnail: string
  category: string
  date: string
}

interface PageMeta {
  title: string
  subtitle: string
  proxyPath: string
  fallbackData: ArticleItem[]
  url: string
}

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value: unknown): boolean => ['tutorials', 'qa', 'encyclopedia', 'hall_of_fame'].includes(String(value))
  }
}) as { type: ArticleType }

const articlesList = ref<ArticleItem[]>([])
const isLiveMode = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const countdown = ref<number>(60)

// Category details
const pageMeta: Record<ArticleType, PageMeta> = {
  tutorials: {
    title: '📚 AI 教程专栏',
    subtitle: '提供各种热门AI工具与学习资源，快速学习有趣又有用的玩法技巧。',
    proxyPath: '/api-tutorials',
    fallbackData: fallbackTutorials,
    url: 'https://ai-bot.cn/ai-tutorials/'
  },
  qa: {
    title: '💬 AI 百问百答',
    subtitle: '人工智能常见问题解答，帮助解决您在安装与配置过程中的种种难题。',
    proxyPath: '/api-qa',
    fallbackData: fallbackQa,
    url: 'https://ai-bot.cn/ai-question-and-answer/'
  },
  encyclopedia: {
    title: '📕 AI 百科大全',
    subtitle: '为您提供最权威的 AI 专业学术词条释义与基础知识概念介绍。',
    proxyPath: '/api-encyclopedia',
    fallbackData: fallbackEncyclopedia,
    url: 'https://ai-bot.cn/ai-encyclopedia/'
  },
  hall_of_fame: {
    title: '🎖️ AI 名人堂',
    subtitle: '收录全球人工智能领域的杰出奠基人、科学家以及行业领袖成长生平。',
    proxyPath: '/api-hall-of-fame',
    fallbackData: fallbackHallOfFame,
    url: 'https://ai-bot.cn/ai-hall-of-fame/'
  }
}

const openLink = (link: string): void => {
  if (link) {
    window.open(link, '_blank')
  }
}

// Browser DOM parser for dynamic list compilation
const parseArticlesHtml = (htmlText: string): ArticleItem[] => {
  const parser: DOMParser = new DOMParser()
  const doc: Document = parser.parseFromString(htmlText, 'text/html')
  
  const cards = doc.querySelectorAll('.list-item')
  if (cards.length === 0) {
    throw new Error('未找到内容列表结构')
  }
  
  const items: ArticleItem[] = []
  
  cards.forEach((card) => {
    // Thumbnail image
    const mediaA: Element | null = card.querySelector('.media-content')
    let thumbnail: string = ''
    if (mediaA) {
      thumbnail = mediaA.getAttribute('data-src') || mediaA.getAttribute('src') || ''
      if (!thumbnail) {
        const styleBg = mediaA.getAttribute('style') || ''
        const bgMatch = styleBg.match(/url\(([^)]+)\)/)
        if (bgMatch) {
          thumbnail = bgMatch[1] || ''
        }
      }
    }
    
    // Title & Link
    const titleA: Element | null = card.querySelector('.list-title')
    if (!titleA) return
    const title: string = titleA.textContent?.trim() || ''
    const link: string = titleA.getAttribute('href') || ''
    
    // Description
    const descEl: Element | null = card.querySelector('.list-desc, .list-desc div, p')
    const desc: string = descEl ? descEl.textContent?.trim() || '' : ''
    
    // Category Tag
    const catEl: Element | null = card.querySelector('.list-footer a, .category-tag')
    const category: string = catEl ? catEl.textContent?.trim() || '' : ''
    
    // Time
    const timeEl: Element | null = card.querySelector('time')
    const dateText: string = timeEl ? timeEl.textContent?.trim() || '' : ''
    
    items.push({
      title,
      link,
      desc,
      thumbnail,
      category,
      date: dateText
    })
  })
  
  return items
}

const fetchArticles = async (): Promise<void> => {
  isLoading.value = true
  const meta: PageMeta = pageMeta[props.type]
  
  const targetUrls: string[] = [
    meta.proxyPath, // Local dev proxy
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(meta.url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(meta.url)}`
  ]
  
  let success: boolean = false
  for (const url of targetUrls) {
    try {
      const htmlText: string = await requestText(url, {
        headers: { 'Accept': 'text/html' }
      })
      const parsed = parseArticlesHtml(htmlText)
      if (parsed && parsed.length > 0) {
        articlesList.value = parsed
        isLiveMode.value = true
        success = true
        break
      }
    } catch (err: unknown) {
      const message: string = err instanceof Error ? err.message : String(err)
      console.warn(`Failed to fetch ${props.type} from ${url}:`, message)
    }
  }
  
  if (!success) {
    console.log(`Using offline cache database for ${props.type}`)
    articlesList.value = meta.fallbackData
    isLiveMode.value = false
  }
  isLoading.value = false
}

const triggerManualRefresh = (): void => {
  fetchArticles()
  countdown.value = 60
}

let timer: ReturnType<typeof setInterval> | null = null
const startTimer = (): void => {
  if (timer) clearInterval(timer)
  countdown.value = 60
  timer = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--
    } else {
      fetchArticles()
      countdown.value = 60
    }
  }, 1000)
}

watch((): ArticleType => props.type, (): void => {
  fetchArticles()
  startTimer()
}, { immediate: true })

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="articles-view-container">
    <!-- Header Block -->
    <div class="articles-view-header">
      <div class="title-wrap">
        <h2 class="title">{{ pageMeta[props.type].title }}</h2>
        <p class="subtitle">{{ pageMeta[props.type].subtitle }}</p>
      </div>
      
      <div class="header-badges">
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
          🔄 刷新内容 ({{ countdown }}s)
        </el-button>
      </div>
    </div>

    <!-- Articles Feed Layout -->
    <div class="articles-feed-wrapper">
      <div v-if="isLoading" class="center-loader">
        <span class="loading-spinner"></span>
        <span>正在从官网拉取最新数据，请稍候...</span>
      </div>

      <template v-else-if="articlesList.length > 0">
        <div class="articles-flow">
          <div 
            v-for="(item, idx) in articlesList" 
            :key="idx" 
            class="article-flow-card"
            @click="openLink(item.link)"
            :title="'点击前往阅读全文: ' + item.title"
          >
            <!-- Poster left -->
            <div class="article-poster-wrap">
              <img v-if="item.thumbnail" :src="item.thumbnail" class="poster-img" alt="cover">
              <div v-else class="poster-placeholder-icon">📖</div>
            </div>
            
            <!-- Details right -->
            <div class="article-info-col">
              <h3 class="article-title">{{ item.title }}</h3>
              <p class="article-desc">{{ item.desc || '点击前往主站查看详细的阅读内容与代码实现...' }}</p>
              
              <div class="article-card-footer">
                <span class="category-badge" v-if="item.category">🏷️ {{ item.category }}</span>
                <span class="time-badge" v-if="item.date">⏱️ {{ item.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="center-empty">
        <span>暂无内容数据。</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.articles-view-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  animation: fadeIn 0.4s ease;
}

.articles-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.articles-view-header .title {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 6px 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.articles-view-header .subtitle {
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

/* Feed Wrapper */
.articles-feed-wrapper {
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  min-height: 480px;
  max-height: 520px;
  overflow-y: auto;
}

.articles-feed-wrapper::-webkit-scrollbar {
  width: 4px;
}

.articles-feed-wrapper::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.articles-flow {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Article Card */
.article-flow-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  gap: 16px;
  cursor: pointer;
  transition: all 0.22s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.article-flow-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px rgba(var(--primary-color-rgb, 99, 102, 241), 0.12);
}

.article-poster-wrap {
  width: 140px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--hover-bg);
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.article-flow-card:hover .poster-img {
  transform: scale(1.05);
}

.poster-placeholder-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.article-info-col {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.article-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-color);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-desc {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card-footer {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: auto;
  padding-top: 4px;
}

.category-badge {
  color: var(--primary-color);
  font-weight: bold;
}

/* Loaders */
.center-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
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

.center-empty {
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
  padding: 60px 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 576px) {
  .article-flow-card {
    flex-direction: column;
    gap: 8px;
  }
  .article-poster-wrap {
    width: 100%;
    height: 120px;
  }
}
</style>
