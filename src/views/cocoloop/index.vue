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
  pinned?: boolean
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

// Sidebar Categories List (Matching CocoLoop Website)
const sidebarCategories = [
  { name: '技术交流', icon: '🌚', slug: 'tech' },
  { name: 'OpenClaw交流', icon: '🐙', slug: 'openclaw' },
  { name: 'Molili社区', icon: '🔻', slug: 'molili' },
  { name: 'Skill技能', icon: '💜', slug: 'skill' },
  { name: '龙虾赚钱副业', icon: '🐥', slug: 'money' },
  { name: 'Github精品资源', icon: '😼', slug: 'github' },
  { name: 'AI大百科', icon: '🧸', slug: 'wiki' },
  { name: '翻车事件', icon: '🦈', slug: 'crash' },
  { name: '综合交流大区', icon: '🐳', slug: 'general' },
  { name: 'AI机器人讨论', icon: '🅰️', slug: 'bot' },
  { name: 'Hermes Agent', icon: '🦀', slug: 'hermes' }
]

// State
const currentPage = ref<number>(1)
const topics = ref<CocoTopic[]>([])
const usersMap = ref<Map<number, CocoUser>>(new Map())
const topTags = ref<CocoTag[]>([])
const loading = ref<boolean>(false)
const hasMore = ref<boolean>(true)
const searchKeyword = ref<string>('')
const selectedTab = ref<'latest' | 'hot' | 'category'>('latest')
const selectedTag = ref<string>('')
const activeCategory = ref<string>('')
const isSidebarCollapsed = ref<boolean>(false)

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

// Helper to format view count (e.g. 4.8k, 1.2k, 960)
function formatViews(views: number): string {
  if (!views) return '0'
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`
  return `${views}`
}

// Helper to format relative date
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
  if (diffDays < 30) return `${diffDays}天`
  return `${d.getMonth() + 1}月 ${d.getDate()} 日`
}

// Get original OP poster for a topic
function getTopicOPUser(topic: CocoTopic): CocoUser | null {
  if (!topic.posters || topic.posters.length === 0) return null
  const opPoster = topic.posters.find(p => p.description.includes('原始发帖') || p.description.includes('OP')) || topic.posters[0]
  return usersMap.value.get(opPoster.user_id) || null
}

// Get list of poster users (up to 5 for avatar stack)
function getTopicPosters(topic: CocoTopic): CocoUser[] {
  if (!topic.posters || topic.posters.length === 0) return []
  const list: CocoUser[] = []
  topic.posters.forEach(p => {
    const user = usersMap.value.get(p.user_id)
    if (user && !list.some(u => u.id === user.id)) {
      list.push(user)
    }
  })
  return list.slice(0, 5)
}

// Filtered and sorted topics computed property
const filteredTopics = computed<CocoTopic[]>(() => {
  let list = [...topics.value]

  if (selectedTag.value) {
    list = list.filter(t => t.tags && t.tags.some(tag => tag.name === selectedTag.value || tag.slug === selectedTag.value))
  }

  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase()
    list = list.filter(t => (t.title && t.title.toLowerCase().includes(kw)) || (t.fancy_title && t.fancy_title.toLowerCase().includes(kw)))
  }

  if (selectedTab.value === 'hot') {
    list.sort((a, b) => (b.views || 0) - (a.views || 0))
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
  ElMessage({ message: '已成功刷新 CocoLoop 社区动态！', type: 'success', grouping: true })
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
  showBackToTop.value = window.scrollY > 300
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
    <!-- Top Navigation Bar -->
    <header class="cocoloop-topbar">
      <div class="topbar-left">
        <button
          type="button"
          class="sidebar-toggle-btn"
          title="切换侧边栏"
          @click="isSidebarCollapsed = !isSidebarCollapsed"
        >
          ☰
        </button>
        <a href="javascript:;" class="brand-logo" @click="router.push('/dyform')">
          <span class="brand-icon">🔄</span>
          <span>CocoLoop</span>
        </a>
      </div>

      <!-- Search Input -->
      <div class="topbar-search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索 CocoLoop 帖子..."
          clearable
          size="medium"
          :prefix-icon="Search"
        />
      </div>

      <div class="topbar-right">
        <el-button type="info" plain size="small" style="font-weight: 600;" @click="router.push('/dyform')">
          <el-icon style="margin-right: 4px;"><ArrowLeft /></el-icon> 返回首页
        </el-button>
        <el-button type="primary" size="small" style="font-weight: 700;" @click="openExternalUrl('https://www.cocoloop.cn/u/signup')">
          注册
        </el-button>
        <el-button type="success" size="small" style="font-weight: 700;" @click="openExternalUrl('https://www.cocoloop.cn/u/login')">
          👤 登录
        </el-button>
      </div>
    </header>

    <!-- Main Container Layout: Left Sidebar + Right Feed -->
    <div class="cocoloop-body">
      <!-- Left Sidebar Menu -->
      <aside class="cocoloop-sidebar" :class="{ collapsed: isSidebarCollapsed }">
        <div class="sidebar-group">
          <div class="sidebar-item active">
            <span class="item-icon">💬</span>
            <span>话题</span>
          </div>
          <div class="sidebar-item">
            <span class="item-icon">⋮</span>
            <span>更多</span>
          </div>
        </div>

        <!-- Category Menu -->
        <div class="sidebar-group">
          <div class="sidebar-title">类别</div>
          <div
            v-for="cat in sidebarCategories"
            :key="cat.slug"
            class="sidebar-item"
            :class="{ active: activeCategory === cat.slug }"
            @click="activeCategory = activeCategory === cat.slug ? '' : cat.slug"
          >
            <span class="item-icon">{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
          </div>
        </div>
      </aside>

      <!-- Right Content Area -->
      <main class="cocoloop-content">
        <!-- Welcome Banner Card -->
        <section class="welcome-banner-card">
          <div class="banner-text">
            <h2>欢迎来到CocoLoop AI社区！</h2>
            <p>一起讨论分享养OpenClaw龙虾的乐趣，讨论赚钱、部署、玩法、Skill技能等..</p>
          </div>
          <div class="banner-actions">
            <div class="banner-action-item" @click="openExternalUrl('https://www.cocoloop.cn/')">
              <span class="action-icon">📥</span>
              <span class="action-label">Skill商店</span>
            </div>
            <div class="banner-action-item" @click="openExternalUrl('https://www.cocoloop.cn/')">
              <span class="action-icon">🎨</span>
              <span class="action-label">AI生图</span>
            </div>
            <div class="banner-action-item" @click="openExternalUrl('https://www.cocoloop.cn/')">
              <span class="action-icon">🤖</span>
              <span class="action-label">Molili龙虾</span>
            </div>
            <div class="banner-action-item" @click="openExternalUrl('https://www.cocoloop.cn/')">
              <span class="action-icon">🚀</span>
              <span class="action-label">提示词反推</span>
            </div>
          </div>
        </section>

        <!-- Feed Control Subbar -->
        <section class="feed-control-bar">
          <div class="feed-tabs">
            <button type="button" class="filter-dropdown-btn" @click="selectedTag = ''">
              类别 ❯
            </button>
            <button type="button" class="filter-dropdown-btn" @click="selectedTag = ''">
              标签 ❯
            </button>

            <span
              class="tab-link"
              :class="{ active: selectedTab === 'latest' }"
              @click="selectedTab = 'latest'"
            >
              最新
            </span>
            <span
              class="tab-link"
              :class="{ active: selectedTab === 'hot' }"
              @click="selectedTab = 'hot'"
            >
              热门
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <el-tag type="info" effect="dark" size="small" style="font-weight: 600;">
              已加载 {{ topics.length }} 篇帖子 (第 {{ currentPage }} 页)
            </el-tag>
            <el-button type="primary" size="small" :icon="Refresh" style="font-weight: 700;" @click="refreshData()">
              刷新
            </el-button>
          </div>
        </section>

        <!-- Topic Table Header -->
        <div class="topic-table-header">
          <span class="col-title">话题</span>
          <span class="col-posters">参与人</span>
          <span class="col-replies">回复</span>
          <span class="col-views">浏览量</span>
          <span class="col-activity">活动</span>
        </div>

        <!-- Topic List Rows -->
        <div v-if="filteredTopics.length > 0" class="topic-list-container">
          <div
            v-for="(topic, idx) in filteredTopics"
            :key="topic.id"
            class="topic-row-item"
            @click="openDetail(topic)"
          >
            <!-- Topic Main Info -->
            <div class="topic-row-main">
              <div class="title-area">
                <span v-if="idx < 2 || topic.pinned" class="pin-icon" title="置顶">📌</span>
                <span class="topic-row-title">{{ topic.title }}</span>
                <span v-if="topic.tags && topic.tags.length > 0" class="category-pill-badge">
                  {{ topic.tags[0].name }}
                </span>
              </div>

              <!-- Tags list -->
              <div v-if="topic.tags && topic.tags.length > 1" class="topic-row-tags">
                <span
                  v-for="t in topic.tags.slice(1, 5)"
                  :key="t.id"
                  class="row-tag"
                >
                  #{{ t.name }}
                </span>
              </div>
            </div>

            <!-- Overlapping Poster Avatars -->
            <div class="topic-row-posters">
              <div class="avatar-stack">
                <img
                  v-for="user in getTopicPosters(topic)"
                  :key="user.id"
                  :src="getAvatarUrl(user.avatar_template)"
                  :alt="user.username"
                  :title="user.name || user.username"
                  class="stacked-avatar"
                />
              </div>
            </div>

            <!-- Reply Count -->
            <div class="topic-row-replies">
              {{ topic.posts_count || topic.reply_count || 0 }}
            </div>

            <!-- View Count -->
            <div class="topic-row-views">
              {{ formatViews(topic.views) }}
            </div>

            <!-- Last Activity Time -->
            <div class="topic-row-activity">
              {{ formatDate(topic.last_posted_at || topic.created_at) }}
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <el-empty v-else-if="!loading" description="未查找到符合条件的社区帖子" />

        <!-- Scroll Loading Sentinel for Infinite Scroll -->
        <div ref="sentinelRef" class="loading-sentinel">
          <div v-if="loading" style="display: flex; align-items: center; justify-content: center; gap: 10px; color: #38bdf8; font-weight: 700;">
            <el-icon class="is-loading" size="20"><Refresh /></el-icon>
            <span>🔄 正在上拉加载第 {{ currentPage + 1 }} 页社区动态...</span>
          </div>
          <div v-else-if="!hasMore" class="end-notice">
            🎉 已加载全部社区动态（共 {{ topics.length }} 篇）
          </div>
        </div>
      </main>
    </div>

    <!-- Scroll to Top Button -->
    <el-button
      v-if="showBackToTop"
      type="primary"
      circle
      size="large"
      :icon="Top"
      style="position: fixed; bottom: 40px; right: 40px; z-index: 999; box-shadow: 0 8px 24px rgba(2, 132, 199, 0.4);"
      @click="scrollToTop()"
    />

    <!-- Topic Detail Modal -->
    <el-dialog v-model="showDetailModal" title="🌐 CocoLoop 社区动态详情" width="650px" center append-to-body destroy-on-close>
      <div v-if="activeTopic" style="padding: 10px 20px;">
        <!-- OP Poster -->
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px; background: rgba(56, 189, 248, 0.1); padding: 16px; border-radius: 14px; border: 1px solid rgba(56, 189, 248, 0.25);">
          <img
            :src="getAvatarUrl(getTopicOPUser(activeTopic)?.avatar_template)"
            :alt="getTopicOPUser(activeTopic)?.username"
            style="width: 52px; height: 52px; border-radius: 50%; border: 2px solid rgba(56, 189, 248, 0.5);"
          />
          <div>
            <div style="font-size: 18px; font-weight: 800; color: #f8fafc;">
              {{ getTopicOPUser(activeTopic)?.name || getTopicOPUser(activeTopic)?.username || '匿名极客' }}
            </div>
            <div style="font-size: 13px; color: #38bdf8; margin-top: 2px;">
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
            style="background: rgba(56, 189, 248, 0.2); color: #bae6fd; border: 1px solid rgba(56, 189, 248, 0.35); padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 700;"
          >
            # {{ t.name }}
          </span>
        </div>

        <!-- Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
          <div>
            <div style="font-size: 12px; color: #94a3b8;">👁️ 浏览量</div>
            <div style="font-size: 18px; font-weight: 800; color: #f59e0b;">{{ formatViews(activeTopic.views) }}</div>
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
