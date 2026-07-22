<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Top, CopyDocument, Link, ArrowLeft } from '@element-plus/icons-vue'
import { resolveApiUrl } from '../../utils/resolveApiUrl'

const router = useRouter()

// TypeScript Interfaces for CocoLoop API
interface CocoUser {
  id: number
  username: string
  name?: string | null
  avatar_template: string
  trust_level: number
}

interface CocoTag {
  id: number
  name: string
  slug: string
}

interface CocoPoster {
  description: string
  user_id: number
  extras?: string | null
}

interface CocoTopic {
  id: number
  title: string
  fancy_title?: string
  slug: string
  posts_count: number
  reply_count: number
  highest_post_number?: number
  views: number
  like_count: number
  op_like_count?: number
  created_at: string
  last_posted_at: string
  bumped_at?: string
  tags: CocoTag[]
  posters: CocoPoster[]
  category_id?: number
  image_url?: string | null
}

interface CocoTopicListResponse {
  users: CocoUser[]
  topic_list: {
    topics: CocoTopic[]
    top_tags: CocoTag[]
    more_topics_url?: string
    per_page?: number
  }
}

// State
const currentPage = ref<number>(1)
const topics = ref<CocoTopic[]>([])
const usersMap = ref<Map<number, CocoUser>>(new Map())
const topTags = ref<CocoTag[]>([])
const loading = ref<boolean>(false)
const hasMore = ref<boolean>(true)
const searchKeyword = ref<string>('')
const selectedTag = ref<string>('')

// Detail Modal State
const showDetailModal = ref<boolean>(false)
const activeTopic = ref<CocoTopic | null>(null)

// Back to Top State
const showBackToTop = ref<boolean>(false)
const sentinelRef = ref<HTMLDivElement | null>(null)
let observer: IntersectionObserver | null = null

// Helper to format avatar URL
function getAvatarUrl(template?: string): string {
  if (!template) return 'https://www.cocoloop.cn/letter_avatar_proxy/v4/letter/c/cc9497/64.png'
  const path = template.replace('{size}', '64')
  if (path.startsWith('http')) return path
  return `https://www.cocoloop.cn${path}`
}

// Helper to format date
function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 5) return '刚刚'
  if (diffMins < 60) return `${diffMins} 分钟前`
  if (diffHours < 24) return `${diffHours} 小时前`
  if (diffDays < 7) return `${diffDays} 天前`
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Get original OP poster for a topic
function getTopicOPUser(topic: CocoTopic): CocoUser | null {
  if (!topic.posters || topic.posters.length === 0) return null
  const opPoster = topic.posters.find(p => p.description.includes('原始发帖') || p.description.includes('OP')) || topic.posters[0]
  return usersMap.value.get(opPoster.user_id) || null
}

// Filtered topics computed property
const filteredTopics = computed<CocoTopic[]>(() => {
  let list = topics.value

  if (selectedTag.value) {
    list = list.filter(t => t.tags && t.tags.some(tag => tag.name === selectedTag.value || tag.slug === selectedTag.value))
  }

  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase()
    list = list.filter(t => (t.title && t.title.toLowerCase().includes(kw)) || (t.fancy_title && t.fancy_title.toLowerCase().includes(kw)))
  }

  return list
})

// Fetch page data from Cocoloop API
const fetchPageData = async (page: number): Promise<void> => {
  if (loading.value) return
  loading.value = true

  try {
    const apiUrl = resolveApiUrl(`/api-cocoloop/latest.json?no_definitions=true&page=${page}`)
    const res = await axios.get<CocoTopicListResponse>(apiUrl)

    if (res.data && res.data.topic_list && Array.isArray(res.data.topic_list.topics)) {
      const newTopics = res.data.topic_list.topics
      const newUsers = res.data.users || []
      const newTags = res.data.topic_list.top_tags || []

      // Merge users into map
      newUsers.forEach(u => usersMap.value.set(u.id, u))

      // Merge top tags
      if (topTags.value.length === 0 && newTags.length > 0) {
        topTags.value = newTags
      }

      // Deduplicate topics
      const existingIds = new Set(topics.value.map(t => t.id))
      const uniqueNewTopics = newTopics.filter(t => !existingIds.has(t.id))

      if (uniqueNewTopics.length === 0) {
        hasMore.value = false
      } else {
        topics.value.push(...uniqueNewTopics)
        currentPage.value = page
      }
    } else {
      hasMore.value = false
    }
  } catch (e) {
    console.error('Fetch cocoloop data error:', e)
    ElMessage({ message: '网络请求失败，请稍后刷新', type: 'error' })
  } finally {
    loading.value = false
  }
}

// Reset and refresh data from page 1
const refreshData = async (): Promise<void> => {
  topics.value = []
  currentPage.value = 1
  hasMore.value = true
  await fetchPageData(1)
  ElMessage({ message: '已成功刷新社区最新动态！', type: 'success', grouping: true })
}

// Open Topic Detail Modal
const openDetail = (topic: CocoTopic): void => {
  activeTopic.value = topic
  showDetailModal.value = true
}

// Copy Text Helper
const copyText = (text: string, msg: string = '文本已成功复制到剪贴板！'): void => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage({ message: msg, type: 'success', grouping: true })
    })
  }
}

const openExternalUrl = (url: string): void => {
  window.open(url, '_blank')
}

// Scroll Handler & Intersection Observer setup for Infinite Scroll
const handleScroll = (): void => {
  if (typeof window === 'undefined') return
  showBackToTop.value = window.scrollY > 400
}

const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const setupIntersectionObserver = (): void => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

  observer = new IntersectionObserver(entries => {
    const target = entries[0]
    if (target.isIntersecting && !loading.value && hasMore.value) {
      void fetchPageData(currentPage.value + 1)
    }
  }, {
    rootMargin: '200px'
  })

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value)
  }
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  await fetchPageData(1)
  setupIntersectionObserver()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div class="cocoloop-page">
    <!-- Header Banner -->
    <header class="header-banner">
      <div class="header-content">
        <div class="header-top-row">
          <h1 class="page-title">
            <el-button
              type="info"
              circle
              :icon="ArrowLeft"
              style="margin-right: 6px; font-weight: 700;"
              @click="router.push('/dyform')"
            />
            🌌 CocoLoop 极客社区动态
          </h1>
          <div class="header-actions">
            <el-tag type="primary" effect="dark" round style="font-size: 13px; font-weight: 700;">
              已加载 {{ topics.length }} 篇帖子 (第 {{ currentPage }} 页)
            </el-tag>
            <el-button type="primary" :icon="Refresh" style="font-weight: 700;" @click="refreshData()">
              🔄 刷新
            </el-button>
          </div>
        </div>
        <p class="page-subtitle">探索 AI 前沿技术、编程开发心得、工具分享与社区讨论（支持无限上拉滚动加载）。</p>
      </div>
    </header>

    <main class="main-container">
      <!-- Search & Tag Filter Bar -->
      <section class="filter-bar-card">
        <div class="search-row">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索社区帖子标题关键词..."
            size="large"
            clearable
            style="flex: 1; min-width: 260px;"
            :prefix-icon="Search"
          />
          <el-button type="success" size="large" style="font-weight: 700;" @click="selectedTag = ''">
            🌐 全部分类 ({{ topics.length }})
          </el-button>
        </div>

        <!-- Hot Tags -->
        <div v-if="topTags.length > 0" class="tag-list">
          <span
            class="tag-chip"
            :class="{ active: selectedTag === '' }"
            @click="selectedTag = ''"
          >
            🔥 全部
          </span>
          <span
            v-for="tag in topTags.slice(0, 16)"
            :key="tag.id"
            class="tag-chip"
            :class="{ active: selectedTag === tag.name || selectedTag === tag.slug }"
            @click="selectedTag = selectedTag === tag.name ? '' : tag.name"
          >
            # {{ tag.name }}
          </span>
        </div>
      </section>

      <!-- Topics Feed List -->
      <div v-if="filteredTopics.length > 0" class="topics-grid">
        <div
          v-for="topic in filteredTopics"
          :key="topic.id"
          class="topic-card"
          @click="openDetail(topic)"
        >
          <div>
            <!-- Author Header -->
            <div class="topic-header">
              <div class="author-info">
                <img
                  :src="getAvatarUrl(getTopicOPUser(topic)?.avatar_template)"
                  :alt="getTopicOPUser(topic)?.username || 'User'"
                  class="author-avatar"
                />
                <div class="author-meta">
                  <span class="author-name">
                    {{ getTopicOPUser(topic)?.name || getTopicOPUser(topic)?.username || '匿名极客' }}
                  </span>
                  <span class="author-trust">
                    Trust Lv.{{ getTopicOPUser(topic)?.trust_level ?? 1 }}
                  </span>
                </div>
              </div>
              <span style="font-size: 12px; color: #64748b;">
                {{ formatDate(topic.last_posted_at || topic.created_at) }}
              </span>
            </div>

            <!-- Title -->
            <h2 class="topic-title" :title="topic.title">
              {{ topic.title }}
            </h2>

            <!-- Tags -->
            <div v-if="topic.tags && topic.tags.length > 0" class="topic-tags">
              <span
                v-for="t in topic.tags"
                :key="t.id"
                class="topic-tag-badge"
              >
                # {{ t.name }}
              </span>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="topic-footer">
            <div class="topic-stats">
              <span class="stat-item">👁️ {{ topic.views || 0 }}</span>
              <span class="stat-item">💬 {{ topic.posts_count || topic.reply_count || 0 }}</span>
              <span class="stat-item">❤️ {{ topic.like_count || topic.op_like_count || 0 }}</span>
            </div>
            <span style="color: #818cf8; font-weight: 700;">查看详情 →</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <el-empty v-else-if="!loading" description="未查找到符合条件的社区帖子" />

      <!-- Scroll Loading Sentinel -->
      <div ref="sentinelRef" class="loading-sentinel">
        <div v-if="loading" style="display: flex; align-items: center; justify-content: center; gap: 10px; color: #818cf8; font-weight: 700;">
          <el-icon class="is-loading" size="20"><Refresh /></el-icon>
          <span>🔄 正在上拉加载第 {{ currentPage + 1 }} 页社区动态...</span>
        </div>
        <div v-else-if="!hasMore" class="end-notice">
          🎉 已加载全部社区动态（共 {{ topics.length }} 篇）
        </div>
      </div>
    </main>

    <!-- Scroll to Top Button -->
    <el-button
      v-if="showBackToTop"
      type="primary"
      circle
      size="large"
      :icon="Top"
      class="back-to-top-btn"
      @click="scrollToTop()"
    />

    <!-- Topic Detail Modal -->
    <el-dialog v-model="showDetailModal" title="🌐 CocoLoop 社区动态详情" width="650px" center append-to-body destroy-on-close>
      <div v-if="activeTopic" style="padding: 10px 20px;">
        <!-- OP Poster -->
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px; background: rgba(99, 102, 241, 0.1); padding: 16px; border-radius: 14px; border: 1px solid rgba(99, 102, 241, 0.25);">
          <img
            :src="getAvatarUrl(getTopicOPUser(activeTopic)?.avatar_template)"
            :alt="getTopicOPUser(activeTopic)?.username"
            style="width: 52px; height: 52px; border-radius: 50%; border: 2px solid rgba(99, 102, 241, 0.5);"
          />
          <div>
            <div style="font-size: 18px; font-weight: 800; color: #f8fafc;">
              {{ getTopicOPUser(activeTopic)?.name || getTopicOPUser(activeTopic)?.username || '匿名极客' }}
            </div>
            <div style="font-size: 13px; color: #a5b4fc; margin-top: 2px;">
              @{{ getTopicOPUser(activeTopic)?.username }} · Trust Level {{ getTopicOPUser(activeTopic)?.trust_level }}
            </div>
          </div>
        </div>

        <!-- Topic Title -->
        <div style="font-size: 22px; font-weight: 900; color: #f8fafc; line-height: 1.5; margin-bottom: 16px;">
          {{ activeTopic.title }}
        </div>

        <!-- Tags -->
        <div v-if="activeTopic.tags && activeTopic.tags.length > 0" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
          <span
            v-for="t in activeTopic.tags"
            :key="t.id"
            style="background: rgba(99, 102, 241, 0.2); color: #c7d2fe; border: 1px solid rgba(99, 102, 241, 0.35); padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 700;"
          >
            # {{ t.name }}
          </span>
        </div>

        <!-- Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
          <div>
            <div style="font-size: 12px; color: #94a3b8;">👁️ 浏览量</div>
            <div style="font-size: 18px; font-weight: 800; color: #38bdf8;">{{ activeTopic.views || 0 }}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #94a3b8;">💬 回复数</div>
            <div style="font-size: 18px; font-weight: 800; color: #34d399;">{{ activeTopic.posts_count || activeTopic.reply_count || 0 }}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #94a3b8;">❤️ 点赞数</div>
            <div style="font-size: 18px; font-weight: 800; color: #f43f5e;">{{ activeTopic.like_count || 0 }}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #94a3b8;">🕒 发布时间</div>
            <div style="font-size: 14px; font-weight: 700; color: #e2e8f0; margin-top: 2px;">{{ formatDate(activeTopic.created_at) }}</div>
          </div>
        </div>

        <!-- Action Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; gap: 10px; flex-wrap: wrap;">
          <span style="font-size: 13px; color: #94a3b8;">Topic ID: #{{ activeTopic.id }}</span>
          <div style="display: flex; gap: 10px;">
            <el-button
              type="primary"
              :icon="CopyDocument"
              style="font-weight: 700;"
              @click="copyText(`【${activeTopic.title}】\n链接：https://www.cocoloop.cn/t/${activeTopic.slug}/${activeTopic.id}`, '帖子标题与链接已复制！')"
            >
              📋 复制标题与链接
            </el-button>
            <el-button
              type="success"
              :icon="Link"
              style="font-weight: 700;"
              @click="openExternalUrl(`https://www.cocoloop.cn/t/${activeTopic.slug}/${activeTopic.id}`)"
            >
              🔗 访问社区原文
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
