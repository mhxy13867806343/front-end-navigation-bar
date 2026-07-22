<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resolveApiUrl } from '../../utils/resolveApiUrl'
import { fallbackCnblogsNews, type CnblogsNewsItem } from './mock/newsMock'

type PrimaryTab = 'latest' | 'recommend' | 'digg'
type DiggType = 'today' | 'yesterday' | 'week' | 'month'

const router = useRouter()
const activeTab = ref<PrimaryTab>('latest')
const activeDiggType = ref<DiggType>('today')
const newsList = ref<CnblogsNewsItem[]>([])
const loading = ref<boolean>(false)
const searchQuery = ref<string>('')
const selectedTag = ref<string | null>(null)
const activeNewsDetail = ref<CnblogsNewsItem | null>(null)
const detailModalVisible = ref<boolean>(false)

const parseCnblogsHtml = (htmlText: string): CnblogsNewsItem[] => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlText, 'text/html')
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

  return items
}

const fetchNewsData = async (): Promise<void> => {
  loading.value = true
  try {
    let targetPath = '/api-cnblogs/'
    if (activeTab.value === 'recommend') {
      targetPath = '/api-cnblogs/n/recommend'
    } else if (activeTab.value === 'digg') {
      targetPath = `/api-cnblogs/n/digg?type=${activeDiggType.value}`
    }

    const apiUrl = resolveApiUrl(targetPath)
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    const htmlText = await res.text()
    const parsed = parseCnblogsHtml(htmlText)

    if (parsed.length > 0) {
      newsList.value = parsed
    } else {
      newsList.value = fallbackCnblogsNews
    }
  } catch (err) {
    console.warn('Fetch cnblogs news via proxy failed, using fallback news data:', err)
    newsList.value = fallbackCnblogsNews
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab: PrimaryTab): void => {
  activeTab.value = tab
  selectedTag.value = null
  void fetchNewsData()
}

const handleDiggTypeChange = (type: DiggType): void => {
  activeDiggType.value = type
  selectedTag.value = null
  void fetchNewsData()
}

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
  void fetchNewsData()
})
</script>

<template>
  <main class="cnblogs-news-page">
    <!-- Header Hero -->
    <header class="cnblogs-hero">
      <div class="hero-left">
        <div class="brand-badge">
          <span class="brand-logo">📰</span>
          <span class="brand-name">博客园新闻</span>
        </div>
        <h1>实时 IT 科技资讯与开发者热门精选</h1>
        <p class="hero-desc">聚合博客园最新发布、编辑推荐与今日/昨日/本周/本月热门科技大事件。</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="refresh-btn" :disabled="loading" @click="handleRefresh">
          <span :class="{ spinning: loading }">🔄</span> 刷新新闻
        </button>
        <button type="button" class="back-btn" @click="router.push('/toolbox')">
          ← 工具箱
        </button>
      </div>
    </header>

    <!-- Navigation Tabs matching Cnblogs Retro/Modern Header -->
    <nav class="cnblogs-nav-card">
      <div class="primary-tabs">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'latest' }"
          @click="handleTabChange('latest')"
        >
          <span>🆕 最新发布</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'recommend' }"
          @click="handleTabChange('recommend')"
        >
          <span>👍 推荐新闻</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'digg' }"
          @click="handleTabChange('digg')"
        >
          <span>🔥 热门新闻</span>
        </button>
      </div>

      <!-- Sub-Tabs for Digg / 热门新闻 (matching screenshot) -->
      <transition name="fade">
        <div v-if="activeTab === 'digg'" class="digg-subtabs">
          <span class="subtabs-label">热门时间跨度：</span>
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
            placeholder="搜索科技新闻标题、关键字、作者..."
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
    </nav>

    <!-- News Article List -->
    <section class="news-list-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在拉取博客园实时科技新闻...</p>
      </div>

      <div v-else-if="filteredNewsList.length === 0" class="empty-state">
        <p>📭 暂无匹配的科技新闻条目</p>
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
      </div>
    </section>

    <!-- Detail Drawer Modal -->
    <el-dialog
      v-model="detailModalVisible"
      title="📰 新闻明细"
      width="640px"
      append-to-body
      custom-class="cnblogs-detail-dialog"
    >
      <div v-if="activeNewsDetail" class="detail-body">
        <h2>{{ activeNewsDetail.title }}</h2>
        <div class="detail-meta">
          <span>投递人：{{ activeNewsDetail.author }}</span>
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
