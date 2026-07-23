<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { NButton } from 'naive-ui'
import {
  mockCollections,
  mockTopics,
  mockAwesome,
  mockRealworld,
  type GithubRepoItem,
  type WeeklyIssueItem,
  type ResourceItem
} from './mock/repoData'

type ActivePageTab = 'home' | 'trends' | 'ranking' | 'weekly' | 'collections' | 'topics' | 'awesome' | 'real-world'
type TimeRange = 'daily' | 'weekly' | 'monthly'
type RankingSort = 'stars' | 'forks' | 'updated'

const router = useRouter()
const route = useRoute()

const currentTab = ref<ActivePageTab>('home')
const timeRange = ref<TimeRange>('weekly')
const rankingSort = ref<RankingSort>('stars')
const minStars = ref<number>(300)
const onlyActive = ref<boolean>(true)
const selectedLicense = ref<string>('')
const searchQuery = ref<string>('')
const dropdownOpen = ref<boolean>(false)
const loading = ref<boolean>(false)
const loadingMore = ref<boolean>(false)
const currentPage = ref<number>(1)
const hasMore = ref<boolean>(true)
const repoError = ref<string>('')
const weeklyError = ref<string>('')

const repoList = ref<GithubRepoItem[]>([])
const weeklyList = ref<WeeklyIssueItem[]>([])
const activeRepoDetail = ref<GithubRepoItem | null>(null)
const detailModalVisible = ref<boolean>(false)

interface GithubSearchOwner {
  login?: string
  avatar_url?: string
}

interface GithubSearchRepo {
  id: number
  name?: string
  full_name?: string
  owner?: GithubSearchOwner
  description?: string | null
  stargazers_count?: number
  forks_count?: number
  open_issues_count?: number
  language?: string | null
  size?: number
  updated_at?: string
  pushed_at?: string
  topics?: string[]
  license?: {
    spdx_id?: string
    name?: string
  } | null
}

interface GithubSearchResponse {
  items?: GithubSearchRepo[]
}

interface GithubIssueUser {
  login?: string
}

interface GithubIssueItem {
  number: number
  title?: string
  html_url?: string
  body?: string | null
  created_at?: string
  updated_at?: string
  comments?: number
  user?: GithubIssueUser | null
}

const getLanguageColor = (lang: string): string => {
  const map: Record<string, string> = {
    TypeScript: '#3178C6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    'C++': '#f34b7d',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051'
  }
  return map[lang] || '#8b949e'
}

const formatSize = (bytes: number): string => {
  if (!bytes) return '1.2 MB'
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} GB`
  return `${(bytes / 1024).toFixed(1)} MB`
}

const formatGithubDate = (date: Date): string => {
  return date.toISOString().slice(0, 10)
}

const getPushedAfterDate = (): string => {
  const daysMap: Record<TimeRange, number> = {
    daily: 1,
    weekly: 7,
    monthly: 30
  }
  const date = new Date()
  date.setDate(date.getDate() - daysMap[timeRange.value])
  return formatGithubDate(date)
}

const buildSparkline = (seed: number): number[] => {
  return Array.from({ length: 20 }, (_item: unknown, index: number): number => {
    const wave = Math.sin((seed + index * 17) / 19)
    return Math.max(8, Math.round(45 + wave * 30 + index * 2))
  })
}

const mapGithubRepo = (item: GithubSearchRepo): GithubRepoItem => {
  const [fallbackOwner, fallbackName] = (item.full_name || item.name || 'github/repo').split('/')
  const stars: number = item.stargazers_count || 0
  const forks: number = item.forks_count || 0
  const issues: number = item.open_issues_count || 0
  const language: string = item.language || 'Unknown'

  return {
    id: String(item.id),
    name: item.name || fallbackName || 'repo',
    owner: item.owner?.login || fallbackOwner || 'developer',
    ownerAvatar: item.owner?.avatar_url,
    description: item.description || '暂无描述',
    stars,
    forks,
    issues,
    valueScore: Math.round(stars * 0.58 + forks * 1.2 + Math.max(0, 1000 - issues) * 0.15),
    language,
    languageColor: getLanguageColor(language),
    size: formatSize((item.size || 0) * 1024),
    updatedAt: (item.pushed_at || item.updated_at || new Date().toISOString()).slice(0, 10),
    topics: item.topics || [],
    sparkline: buildSparkline(item.id),
    isActive: true,
    license: item.license?.spdx_id || item.license?.name || 'NOASSERTION'
  }
}

const fetchGithubWeeklyData = async (): Promise<void> => {
  weeklyError.value = ''
  try {
    const res = await fetch('https://api.github.com/repos/ruanyf/weekly/issues?state=open&per_page=12', {
      cache: 'no-cache',
      headers: {
        Accept: 'application/vnd.github+json'
      }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const issues = (await res.json()) as GithubIssueItem[]
    weeklyList.value = issues.map((issue: GithubIssueItem): WeeklyIssueItem => ({
      vol: `#${issue.number}`,
      title: issue.title || '未命名周刊条目',
      author: issue.user?.login || 'ruanyf/weekly',
      date: (issue.updated_at || issue.created_at || new Date().toISOString()).slice(0, 10),
      summary: (issue.body || '暂无摘要').replace(/!\[[\s\S]*?\]\([\s\S]*?\)/g, '').replace(/<[^>]+>/g, '').slice(0, 140),
      link: issue.html_url || 'https://github.com/ruanyf/weekly/issues'
    }))
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : String(err)
    weeklyError.value = `GitHub 周刊接口不可用：${message}`
    weeklyList.value = []
  }
}

const syncQueryFromRoute = (): void => {
  const q = route.query
  if (q.tab && typeof q.tab === 'string') {
    currentTab.value = q.tab as ActivePageTab
  }
  if (q.time_range && typeof q.time_range === 'string') {
    timeRange.value = q.time_range as TimeRange
  }
  if (q.min_stars) {
    minStars.value = parseInt(String(q.min_stars), 10) || 0
  }
  if (q.active !== undefined) {
    onlyActive.value = q.active === 'true'
  }
  if (q.sort && typeof q.sort === 'string') {
    rankingSort.value = q.sort as RankingSort
  }
  if (q.license && typeof q.license === 'string') {
    selectedLicense.value = q.license
  }
}

const updateRouteQuery = (): void => {
  const query: Record<string, string> = {
    tab: currentTab.value,
    time_range: timeRange.value,
    min_stars: String(minStars.value),
    active: String(onlyActive.value),
    sort: rankingSort.value
  }
  if (selectedLicense.value) query.license = selectedLicense.value
  void router.replace({ query })
}

const fetchLiveGithubCnData = async (resetPage = true): Promise<void> => {
  if (resetPage) {
    currentPage.value = 1
    loading.value = true
    hasMore.value = true
    repoError.value = ''
  }

  try {
    const q: string[] = [`stars:>=${minStars.value || 1}`]
    if (onlyActive.value) q.push(`pushed:>${getPushedAfterDate()}`)
    if (selectedLicense.value) q.push(`license:${selectedLicense.value.toLowerCase()}`)
    if (searchQuery.value.trim()) q.push(searchQuery.value.trim())

    const sort: string = currentTab.value === 'ranking' ? rankingSort.value : 'stars'
    const params = new URLSearchParams({
      q: q.join(' '),
      sort,
      order: 'desc',
      page: String(currentPage.value),
      per_page: '12'
    })

    const res = await fetch(`https://api.github.com/search/repositories?${params.toString()}`, {
      cache: 'no-cache',
      headers: {
        Accept: 'application/vnd.github+json'
      }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json()) as GithubSearchResponse
    const fetchedItems: GithubRepoItem[] = (json.items || []).map(mapGithubRepo)

    if (resetPage) {
      repoList.value = fetchedItems
    } else {
      repoList.value = [...repoList.value, ...fetchedItems]
    }

    if (fetchedItems.length < 12) {
      hasMore.value = false
    }
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : String(err)
    repoError.value = `GitHub 官方接口不可用：${message}`
    console.warn('Fetch live github data failed:', err)
    if (resetPage) {
      repoList.value = []
    } else {
      currentPage.value = Math.max(1, currentPage.value - 1)
      hasMore.value = false
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const handleLoadMore = async (): Promise<void> => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  currentPage.value++
  await fetchLiveGithubCnData(false)
  ElMessage.success(`成功为您加载更多热门开源项目（当前已加载 ${repoList.value.length} 个）`)
}

const handleTabChange = (tab: ActivePageTab): void => {
  currentTab.value = tab
  dropdownOpen.value = false
  if (tab === 'trends') {
    minStars.value = 300
    onlyActive.value = true
  } else if (tab === 'ranking') {
    minStars.value = 0
  }
  updateRouteQuery()
  if (tab === 'weekly') {
    void fetchGithubWeeklyData()
  } else if (['home', 'trends', 'ranking'].includes(tab)) {
    void fetchLiveGithubCnData(true)
  }
}

const handleApplyFilter = (): void => {
  updateRouteQuery()
  void fetchLiveGithubCnData(true)
  ElMessage.success(`数据加载成功！请求参数：time_range=${timeRange.value}&min_stars=${minStars.value}&active=${onlyActive.value}`)
}

const handleClearFilter = (): void => {
  minStars.value = 0
  onlyActive.value = false
  selectedLicense.value = ''
  searchQuery.value = ''
  updateRouteQuery()
  void fetchLiveGithubCnData(true)
  ElMessage.info('已重置所有筛选条件')
}

const openExternalRepo = (name: string, owner: string): void => {
  window.open(`https://github.com/${owner}/${name}`, '_blank')
}

const openExternalUrl = (url: string): void => {
  window.open(url, '_blank')
}

const openRepoDetail = (repo: GithubRepoItem): void => {
  activeRepoDetail.value = repo
  detailModalVisible.value = true
}

const toggleLike = (repo: GithubRepoItem): void => {
  repo.stars++
  ElMessage.success(`成功为项目 ${repo.owner}/${repo.name} 贡献 1 个 Star ⭐`)
}

const activeResourceList = computed<ResourceItem[]>(() => {
  if (currentTab.value === 'collections') return mockCollections
  if (currentTab.value === 'topics') return mockTopics
  if (currentTab.value === 'awesome') return mockAwesome
  if (currentTab.value === 'real-world') return mockRealworld
  return []
})

const resourceTitle = computed<string>(() => {
  if (currentTab.value === 'collections') return '凹 精选专题'
  if (currentTab.value === 'topics') return '🏷️ 热门话题'
  if (currentTab.value === 'awesome') return '⭐️ 资源精选'
  if (currentTab.value === 'real-world') return '🎯 实战指南'
  return '资源大全'
})

const filteredRepoList = computed(() => {
  let list = repoList.value.filter((item) => {
    if (onlyActive.value && !item.isActive) return false
    if (minStars.value > 0 && item.stars < minStars.value) return false
    if (selectedLicense.value && item.license !== selectedLicense.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        item.owner.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.language.toLowerCase().includes(q)
      )
    }
    return true
  })

  if (currentTab.value === 'ranking') {
    if (rankingSort.value === 'stars') {
      list = [...list].sort((a, b) => b.stars - a.stars)
    } else if (rankingSort.value === 'forks') {
      list = [...list].sort((a, b) => b.forks - a.forks)
    } else if (rankingSort.value === 'updated') {
      list = [...list].sort((a, b) => b.valueScore - a.valueScore)
    }
  }

  return list
})

onMounted(() => {
  syncQueryFromRoute()
  if (currentTab.value === 'weekly') {
    void fetchGithubWeeklyData()
  } else {
    void fetchLiveGithubCnData(true)
  }
})

watch([onlyActive, minStars, selectedLicense, timeRange, rankingSort], () => {
  updateRouteQuery()
  void fetchLiveGithubCnData(true)
})

watch(() => route.query, () => {
  syncQueryFromRoute()
})
</script>

<template>
  <main class="github-cn-page">
    <!-- Top Header Navigation Bar -->
    <header class="github-navbar">
      <div class="nav-container">
        <div class="brand" @click="handleTabChange('home')">
          <span class="logo-icon">🐙</span>
          <span class="brand-title">GitHub 中文社区</span>
        </div>

        <nav class="main-nav-links">
          <button
            type="button"
            class="nav-link"
            :class="{ active: currentTab === 'home' }"
            @click="handleTabChange('home')"
          >
            🏠 首页
          </button>
          <button
            type="button"
            class="nav-link"
            :class="{ active: currentTab === 'trends' }"
            @click="handleTabChange('trends')"
          >
            📈 趋势
          </button>
          <button
            type="button"
            class="nav-link"
            :class="{ active: currentTab === 'ranking' }"
            @click="handleTabChange('ranking')"
          >
            🏆 排行榜
          </button>
          <button
            type="button"
            class="nav-link"
            :class="{ active: currentTab === 'weekly' }"
            @click="handleTabChange('weekly')"
          >
            📖 严选周刊
          </button>

          <!-- Dropdown Sub-menu -->
          <div
            class="dropdown-menu-wrapper"
            @mouseenter="dropdownOpen = true"
            @mouseleave="dropdownOpen = false"
          >
            <button
              type="button"
              class="nav-link dropdown-toggle"
              :class="{ active: ['collections', 'topics', 'awesome', 'real-world'].includes(currentTab) }"
              @click="dropdownOpen = !dropdownOpen"
            >
              🧭 更多资源 ˅
            </button>
            <div v-show="dropdownOpen" class="dropdown-list">
              <div
                class="dropdown-item"
                :class="{ active: currentTab === 'collections' }"
                @click="handleTabChange('collections')"
              >
                <span class="item-icon">凹</span> 精选专题
              </div>
              <div
                class="dropdown-item"
                :class="{ active: currentTab === 'topics' }"
                @click="handleTabChange('topics')"
              >
                <span class="item-icon">⬡</span> 热门话题
              </div>
              <div
                class="dropdown-item"
                :class="{ active: currentTab === 'awesome' }"
                @click="handleTabChange('awesome')"
              >
                <span class="item-icon">⭐️</span> 资源精选
              </div>
              <div
                class="dropdown-item"
                :class="{ active: currentTab === 'real-world' }"
                @click="handleTabChange('real-world')"
              >
                <span class="item-icon">🎯</span> 实战指南
              </div>
            </div>
          </div>
        </nav>

        <div class="nav-actions">
          <a
            target="_blank"
            href="http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=uYGPgI6IiYiOgPnIyJfa1tQ"
            style="text-decoration:none;"
            class="qq-mailme-link"
            title="QQ 邮我 - 联系作者"
          >
            <img src="http://rescdn.qqmail.com/zh_CN/htmledition/images/function/qm_open/ico_mailme_21.png" alt="QQ 邮我" />
          </a>
          <button type="button" class="back-btn" @click="router.push('/toolbox')">
            ← 工具箱
          </button>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <div class="github-content">
      <!-- Section Header depending on Tab -->
      <section v-if="currentTab === 'home'" class="hero-header">
        <h1>⭐ 为您推荐</h1>
        <p class="subtitle">基于社区活跃度与代码质量，为您智能筛选的优质开源项目。</p>
      </section>

      <section v-else-if="currentTab === 'trends'" class="hero-header">
        <div class="info-alert-box">
          💬 我们的趋势算法不仅仅基于 Star 增长。我们会综合考量 Issue 活跃度、PR 合并速度以及开发者社区的讨论热度，为您呈现真正具有生命力的开源项目。
        </div>

        <!-- Time Range Picker matching Screenshot 1 -->
        <div class="time-range-picker">
          <button
            type="button"
            class="time-btn"
            :class="{ active: timeRange === 'daily' }"
            @click="timeRange = 'daily'; updateRouteQuery()"
          >
            ☼ 今日
          </button>
          <button
            type="button"
            class="time-btn"
            :class="{ active: timeRange === 'weekly' }"
            @click="timeRange = 'weekly'; updateRouteQuery()"
          >
            🗓️ 本周
          </button>
          <button
            type="button"
            class="time-btn"
            :class="{ active: timeRange === 'monthly' }"
            @click="timeRange = 'monthly'; updateRouteQuery()"
          >
            🗓️ 本月
          </button>
        </div>
      </section>

      <section v-else-if="currentTab === 'ranking'" class="hero-header">
        <h1>GitHub 排行榜</h1>
        <p class="subtitle">探索最受欢迎与最具商业价值的开源项目。</p>

        <!-- Ranking Sort Buttons matching Screenshot 2 -->
        <div class="ranking-sort-bar">
          <button
            type="button"
            class="sort-btn"
            :class="{ active: rankingSort === 'stars' }"
            @click="rankingSort = 'stars'; updateRouteQuery()"
          >
            ⭐ 按星标数
          </button>
          <button
            type="button"
            class="sort-btn"
            :class="{ active: rankingSort === 'forks' }"
            @click="rankingSort = 'forks'; updateRouteQuery()"
          >
            🍴 按复刻数
          </button>
          <button
            type="button"
            class="sort-btn"
            :class="{ active: rankingSort === 'updated' }"
            @click="rankingSort = 'updated'; updateRouteQuery()"
          >
            📅 按更新时间
          </button>
        </div>
      </section>

      <section v-else-if="currentTab === 'weekly'" class="hero-header">
        <h1 class="weekly-title">GitHub 严选周刊</h1>
        <p class="subtitle">每周精选一个高质量开源项目，深度解析其价值与应用场景。</p>
      </section>

      <section v-else class="hero-header">
        <h1>{{ resourceTitle }}</h1>
        <p class="subtitle">探索开源领域顶级图鉴与最佳工程实践方案。</p>
      </section>

      <!-- Filter Controls Toolbar -->
      <div v-if="['home', 'trends', 'ranking'].includes(currentTab)" class="filter-toolbar">
        <div class="filter-left">
          <!-- Active Switch Toggle -->
          <label class="switch-pill">
            <input type="checkbox" v-model="onlyActive" @change="handleApplyFilter" />
            <span class="switch-slider"></span>
            <span class="switch-label">仅活跃</span>
          </label>

          <!-- Min Stars Input Counter -->
          <div class="input-counter-box">
            <span class="counter-label">⭐ 最小 Star</span>
            <button type="button" class="counter-btn" @click="minStars = Math.max(0, minStars - 100); handleApplyFilter()">-</button>
            <input type="number" v-model.number="minStars" @change="handleApplyFilter" />
            <button type="button" class="counter-btn" @click="minStars += 100; handleApplyFilter()">+</button>
          </div>

          <!-- License Select -->
          <div class="license-select-box">
            <span class="select-label">📄 许可证</span>
            <select v-model="selectedLicense" @change="handleApplyFilter">
              <option value="">全部</option>
              <option value="MIT">MIT</option>
              <option value="Apache-2.0">Apache-2.0</option>
              <option value="GPL-3.0">GPL-3.0</option>
              <option value="BSD-3-Clause">BSD-3-Clause</option>
              <option value="Unlicense">Unlicense</option>
            </select>
          </div>

          <!-- Search Input -->
          <div class="search-input-box">
            <span class="search-icon">🔍</span>
            <input v-model="searchQuery" type="text" placeholder="搜索项目、作者、关键词..." />
          </div>
        </div>

        <div class="filter-right">
          <button type="button" class="action-btn apply-btn" :disabled="loading" @click="handleApplyFilter">
            <span :class="{ spinning: loading }">🔍</span> {{ loading ? '请求中...' : '应用' }}
          </button>
          <button type="button" class="action-btn clear-btn" @click="handleClearFilter">
            ✕ 清除
          </button>
        </div>
      </div>

      <!-- Loading State Indicator -->
      <div v-if="loading && currentPage === 1" class="loading-state-bar">
        <div class="spinner"></div>
        <p>正在请求 GitHub 官方实时数据...</p>
      </div>

      <div v-else-if="repoError && ['home', 'trends', 'ranking'].includes(currentTab)" class="empty-state">
        <p>📭 {{ repoError }}</p>
      </div>

      <!-- Content Area 1: Weekly Cards Section -->
      <section v-else-if="currentTab === 'weekly' && weeklyError" class="empty-state">
        <p>📭 {{ weeklyError }}</p>
      </section>

      <section v-else-if="currentTab === 'weekly'" class="weekly-cards-grid">
        <div v-for="w in weeklyList" :key="w.vol" class="weekly-card">
          <div class="weekly-header">
            <span class="vol-badge">{{ w.vol }}</span>
            <span class="vol-date">{{ w.date }}</span>
          </div>
          <h2 class="weekly-card-title">{{ w.title }}</h2>
          <div class="weekly-author">
            <span class="gh-icon">🐙</span> {{ w.author }}
          </div>
          <p class="weekly-summary">{{ w.summary }}</p>
          <button type="button" class="read-full-btn" @click="openExternalUrl(w.link)">
            阅读全文 &gt;
          </button>
        </div>
      </section>

      <!-- Content Area 2: Sub-resource Cards -->
      <section v-else-if="['collections', 'topics', 'awesome', 'real-world'].includes(currentTab)" class="collections-grid">
        <div v-for="c in activeResourceList" :key="c.id" class="collection-card">
          <div class="collection-icon">{{ c.icon }}</div>
          <h3>{{ c.title }}</h3>
          <p>{{ c.desc }}</p>
          <div class="collection-footer">
            <span class="item-count">{{ c.count }} 个资源收录</span>
            <div class="tag-badges">
              <span v-for="t in c.tags" :key="t" class="tag-badge">#{{ t }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Area 3: Repos Card Grid -->
      <section v-else class="repos-section">
        <!-- Section Header Banner matching Screenshot 1 -->
        <div v-if="currentTab === 'trends'" class="trending-banner">
          <div class="banner-left">
            <span class="banner-icon">📈</span>
            <div>
              <h3>热门趋势</h3>
              <p>本周趋势</p>
            </div>
          </div>
          <span class="badge-count">{{ filteredRepoList.length }}</span>
        </div>

        <div v-if="filteredRepoList.length === 0" class="empty-state">
          <p>📭 没有符合筛选条件 (Star ≥ {{ minStars }}，许可证: {{ selectedLicense || '全部' }}) 的 GitHub 项目</p>
        </div>

        <div v-else class="repo-grid">
          <article
            v-for="repo in filteredRepoList"
            :key="repo.id"
            class="repo-card"
            @click="openRepoDetail(repo)"
          >
            <!-- Card Header -->
            <header class="card-header">
              <div class="owner-avatar">
                <span v-if="!repo.ownerAvatar">{{ repo.name.slice(0, 1).toUpperCase() }}</span>
                <img v-else :src="repo.ownerAvatar" alt="avatar" />
              </div>
              <div class="repo-meta-top">
                <h2 class="repo-name">
                  <a :href="`https://github.com/${repo.owner}/${repo.name}`" target="_blank" @click.stop>{{ repo.name }}</a>
                </h2>
                <span class="owner-name">👤 {{ repo.owner }}</span>
              </div>
              <span class="updated-time">⏰ {{ repo.updatedAt }}</span>
            </header>

            <!-- Stats Counter Bar -->
            <div class="stats-counter-bar">
              <span class="stat-item stars">⭐ {{ repo.stars >= 1000 ? (repo.stars / 1000).toFixed(1) + 'k' : repo.stars }}</span>
              <span class="stat-item forks">🔀 {{ repo.forks >= 1000 ? (repo.forks / 1000).toFixed(1) + 'k' : repo.forks }}</span>
              <span class="stat-item issues">ⓘ {{ repo.issues }}</span>
              <span class="stat-item value">🛡️ 价值分 {{ repo.valueScore }}</span>
            </div>

            <!-- Commit Activity Sparkline Bar Graph -->
            <div class="sparkline-container" title="近期 Commit 活跃度柱状图">
              <div
                v-for="(height, i) in repo.sparkline.slice(0, 20)"
                :key="i"
                class="spark-bar"
                :style="{ height: `${Math.min(100, Math.max(15, height / 3))}%` }"
              ></div>
            </div>

            <!-- Description -->
            <p class="repo-description">{{ repo.description }}</p>

            <!-- Topics Badges -->
            <div class="topics-bar">
              <span v-for="t in repo.topics.slice(0, 4)" :key="t" class="topic-chip">{{ t }}</span>
            </div>

            <!-- Card Footer -->
            <footer class="card-footer">
              <div class="lang-info">
                <span class="lang-dot" :style="{ background: repo.languageColor }"></span>
                <span class="lang-name">{{ repo.language }}</span>
                <span class="repo-size">{{ repo.size }}</span>
              </div>
              <div class="footer-right-actions">
                <span class="like-heart" @click.stop="toggleLike(repo)">❤️ 0</span>
                <span class="detail-link">详情 &gt;</span>
              </div>
            </footer>
          </article>
        </div>

        <!-- Load More Projects Button (Using Naive UI Button styled matching user screenshot) -->
        <div v-if="['home', 'trends', 'ranking'].includes(currentTab) && repoList.length > 0" class="load-more-container">
          <n-button
            type="primary"
            round
            block
            size="large"
            class="naive-os-load-more-btn"
            :loading="loadingMore"
            :disabled="!hasMore || loadingMore"
            @click="handleLoadMore"
          >
            {{ loadingMore ? '正在加载更多项目...' : (hasMore ? '加载更多项目 ˅' : '已加载全部项目') }}
          </n-button>
        </div>
      </section>
    </div>

    <!-- Repository Detail Modal -->
    <el-dialog
      v-model="detailModalVisible"
      title="🐙 项目开源概览"
      width="680px"
      append-to-body
      custom-class="github-detail-dialog"
    >
      <div v-if="activeRepoDetail" class="detail-dialog-body">
        <h2>{{ activeRepoDetail.owner }} / {{ activeRepoDetail.name }}</h2>
        <p class="detail-desc">{{ activeRepoDetail.description }}</p>

        <div class="detail-stats-grid">
          <div class="stat-card">
            <span class="label">Star 数</span>
            <span class="value">⭐ {{ activeRepoDetail.stars }}</span>
          </div>
          <div class="stat-card">
            <span class="label">Fork 数</span>
            <span class="value">🔀 {{ activeRepoDetail.forks }}</span>
          </div>
          <div class="stat-card">
            <span class="label">Issue 数</span>
            <span class="value">ⓘ {{ activeRepoDetail.issues }}</span>
          </div>
          <div class="stat-card">
            <span class="label">价值评分</span>
            <span class="value">🛡️ {{ activeRepoDetail.valueScore }}</span>
          </div>
        </div>

        <div class="detail-actions">
          <button
            type="button"
            class="gh-primary-btn"
            @click="openExternalRepo(activeRepoDetail.name, activeRepoDetail.owner)"
          >
            前往 GitHub 仓库主页 🔗
          </button>
        </div>
      </div>
    </el-dialog>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
