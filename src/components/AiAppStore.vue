<script setup lang="ts">

import fallbackAppsData from '../utlis/daily_ai_apps.json'
import { requestText } from '@/utils/request'

interface AiAppItem {
  title: string
  link: string
  desc: string
  icon: string
  tag: string
  downloads: number
  likes: number
  android: boolean
  ios: boolean
}

interface AiAppCategory {
  id: string
  name: string
  apps: AiAppItem[]
}

const appCategories = ref<AiAppCategory[]>(fallbackAppsData as AiAppCategory[])
const selectedCategory = ref<string>(fallbackAppsData[0]?.id || '')
const isLiveMode = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const countdown = ref<number>(60)

const selectCategory = (id: string): void => {
  selectedCategory.value = id
}

const currentCategoryApps = computed<AiAppItem[]>(() => {
  const cat: AiAppCategory | undefined = appCategories.value.find((c: AiAppCategory): boolean => c.id === selectedCategory.value)
  return cat ? cat.apps : []
})

const openLink = (link: string): void => {
  if (link) {
    window.open(link, '_blank')
  }
}

// Browser DOM parser for real-time live content
const parseAppsHtml = (htmlText: string): AiAppCategory[] => {
  const parser: DOMParser = new DOMParser()
  const doc: Document = parser.parseFromString(htmlText, 'text/html')
  
  const headers = doc.querySelectorAll('h4.text-gray')
  if (headers.length === 0) {
    throw new Error('未找到应用分类结构')
  }
  
  const parsedData: AiAppCategory[] = []
  
  headers.forEach((headerEl) => {
    const tagIcon: Element | null = headerEl.querySelector('.site-tag')
    const catId: string = tagIcon ? tagIcon.getAttribute('id') || '' : ''
    if (!catId) return
    
    const catName: string = headerEl.textContent?.trim() || ''
    
    // Find the row containing cards
    let rowEl: Element | null = null
    let nextSibling: Element | null | undefined = headerEl.nextElementSibling || headerEl.parentElement?.nextElementSibling
    for (let k: number = 0; k < 5; k++) {
      if (nextSibling) {
        if (nextSibling.classList.contains('row')) {
          rowEl = nextSibling
          break
        }
        const subRow = nextSibling.querySelector('.row')
        if (subRow) {
          rowEl = subRow
          break
        }
        nextSibling = nextSibling.nextElementSibling
      }
    }
    
    if (!rowEl) return
    
    const cards = rowEl.querySelectorAll('.card-app')
    const apps: AiAppItem[] = []
    
    cards.forEach((card) => {
      // Icon URL
      const mediaContent: Element | null = card.querySelector('.media-content')
      let icon: string = ''
      if (mediaContent) {
        const bgVal = mediaContent.getAttribute('data-bg') || mediaContent.getAttribute('style') || ''
        const match = bgVal.match(/url\(([^)]+)\)/)
        if (match) {
          icon = (match[1] || '').replace(/&amp;/g, '&')
        }
      }
      
      // Title & Link
      const titleLink: Element | null = card.querySelector('a.text-md')
      if (!titleLink) return
      const title: string = titleLink.textContent?.trim() || ''
      const link: string = titleLink.getAttribute('href') || ''
      
      // Description
      const descEl: Element | null = card.querySelector('.app-content .text-muted')
      const desc: string = descEl ? descEl.textContent?.trim() || '' : ''
      
      // Category Tag
      const tagEl: Element | null = card.querySelector('.tga a')
      const tag: string = tagEl ? tagEl.textContent?.trim() || '' : ''
      
      // Downloads
      const downEl: Element | null = card.querySelector('.down')
      const downloadsText: string = downEl ? downEl.textContent?.trim() || '0' : '0'
      const downloads: number = parseInt(downloadsText.replace(/[^\d]/g, ''), 10) || 0
      
      // Likes
      const likeEl: Element | null = card.querySelector('[class^="home-like-"], .like-count')
      const likesText: string = likeEl ? likeEl.textContent?.trim() || '0' : '0'
      const likes: number = parseInt(likesText.replace(/[^\d]/g, ''), 10) || 0
      
      // Platforms
      const platformEl: Element | null = card.querySelector('.app-platform')
      const hasAndroid: boolean = platformEl ? (platformEl.querySelector('.icon-android') !== null || platformEl.innerHTML.includes('android')) : false
      const hasIos: boolean = platformEl ? (platformEl.querySelector('.icon-app-store-fill') !== null || platformEl.querySelector('.icon-apple') !== null || platformEl.innerHTML.includes('apple')) : false
      
      apps.push({
        title,
        link,
        desc,
        icon,
        tag,
        downloads,
        likes,
        android: hasAndroid,
        ios: hasIos
      })
    })
    
    if (apps.length > 0) {
      parsedData.push({
        id: catId,
        name: catName,
        apps
      })
    }
  })
  
  return parsedData
}

const fetchLatestApps = async (): Promise<void> => {
  isLoading.value = true
  
  const targetUrls: string[] = [
    '/api-app-store', // Dev proxy config
    'https://api.codetabs.com/v1/proxy?quest=https://ai-bot.cn/ai-app-store/',
    'https://api.allorigins.win/raw?url=https://ai-bot.cn/ai-app-store/'
  ]
  
  let success: boolean = false
  for (const url of targetUrls) {
    try {
      const htmlText: string = await requestText(url, {
        headers: { 'Accept': 'text/html' }
      })
      const parsed = parseAppsHtml(htmlText)
      if (parsed && parsed.length > 0) {
        appCategories.value = parsed
        isLiveMode.value = true
        success = true
        
        // Keep category selected if it still exists
        if (!parsed.some((c: AiAppCategory): boolean => c.id === selectedCategory.value)) {
          selectedCategory.value = parsed[0]?.id || ''
        }
        break
      }
    } catch (err: unknown) {
      const message: string = err instanceof Error ? err.message : String(err)
      console.warn(`Failed to fetch app store from ${url}:`, message)
    }
  }
  
  if (!success) {
    console.log('Using pre-packaged app store database.')
    appCategories.value = fallbackAppsData
    isLiveMode.value = false
  }
  isLoading.value = false
}

const triggerManualRefresh = (): void => {
  fetchLatestApps()
  countdown.value = 60
}

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  fetchLatestApps()
  timer = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--
    } else {
      fetchLatestApps()
      countdown.value = 60
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="app-store-container">
    <!-- Header Area -->
    <div class="app-store-header">
      <div class="title-wrap">
        <h2 class="title">🍎 AI应用集 - 人工智能应用商店</h2>
        <p class="subtitle">汇集全球各类人工智能精选APP，包含移动端安卓与iOS客户端一键直达下载。</p>
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
          🔄 刷新应用 ({{ countdown }}s)
        </el-button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="app-store-layout">
      <!-- Left sidebar categories inside view -->
      <div class="store-sidebar">
        <button 
          v-for="cat in appCategories" 
          :key="cat.id"
          class="store-cat-item"
          :class="{ active: selectedCategory === cat.id }"
          @click="selectCategory(cat.id)"
        >
          📱 {{ cat.name }}
          <span class="count-badge">{{ cat.apps.length }}</span>
        </button>
      </div>

      <!-- Right App Cards grid -->
      <div class="store-grid-workspace">
        <div v-if="isLoading" class="center-loader">
          <span class="loading-spinner"></span>
          <span>正在拉取应用商店库，请稍候...</span>
        </div>
        
        <template v-else-if="currentCategoryApps.length > 0">
          <div class="apps-grid">
            <div 
              v-for="(app, idx) in currentCategoryApps" 
              :key="idx"
              class="app-store-card"
              @click="openLink(app.link)"
              :title="'点击前往下载安装: ' + app.title"
            >
              <!-- Left side icon -->
              <div class="app-icon-wrapper">
                <img v-if="app.icon" :src="app.icon" class="app-img" alt="app icon">
                <div v-else class="app-avatar-placeholder">📱</div>
              </div>
              
              <!-- Right side content -->
              <div class="app-details-col">
                <div class="app-title-row">
                  <h3 class="app-title">{{ app.title }}</h3>
                  <div class="platform-icons">
                    <span v-if="app.android" class="platform-icon android" title="支持 Android">🤖</span>
                    <span v-if="app.ios" class="platform-icon apple" title="支持 iOS / App Store">🍏</span>
                  </div>
                </div>
                
                <p class="app-desc">{{ app.desc || '暂无详细描述...' }}</p>
                
                <div class="app-card-footer">
                  <span class="app-tag" v-if="app.tag">#{{ app.tag }}</span>
                  <div class="app-stats">
                    <span class="stat-item">📥 {{ app.downloads || '热门' }}次下载</span>
                    <span class="stat-item" v-if="app.likes">💝 {{ app.likes }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        
        <div v-else class="center-empty">
          <span>暂无应用数据。</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./css/AiAppStore.scss"></style>
