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

<style scoped lang="scss" src="./css/AiArticlesList.scss"></style>
