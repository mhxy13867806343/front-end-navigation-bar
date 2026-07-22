<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resolveApiUrl } from '../../utils/resolveApiUrl'
import {
  mockRepoList,
  mockWeeklyList,
  mockCollections,
  type GithubRepoItem,
  type WeeklyIssueItem,
  type CollectionItem
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
const loading = ref<boolean>(false)

const repoList = ref<GithubRepoItem[]>(mockRepoList)
const weeklyList = ref<WeeklyIssueItem[]>(mockWeeklyList)
const collections = ref<CollectionItem[]>(mockCollections)
const activeRepoDetail = ref<GithubRepoItem | null>(null)
const detailModalVisible = ref<boolean>(false)

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

const handleTabChange = (tab: ActivePageTab): void => {
  currentTab.value = tab
  if (tab === 'trends') {
    minStars.value = 300
    onlyActive.value = true
  } else if (tab === 'ranking') {
    minStars.value = 0
  }
  updateRouteQuery()
}

const handleApplyFilter = (): void => {
  updateRouteQuery()
  ElMessage.success('筛选已生效！数据已按最新过滤条件刷新')
}

const handleClearFilter = (): void => {
  minStars.value = 0
  onlyActive.value = false
  selectedLicense.value = ''
  searchQuery.value = ''
  updateRouteQuery()
  ElMessage.info('已重置所有筛选条件')
}

const openExternalRepo = (name: string, owner: string): void => {
  window.open(`https://github.com/${owner}/${name}`, '_blank')
}

const openRepoDetail = (repo: GithubRepoItem): void => {
  activeRepoDetail.value = repo
  detailModalVisible.value = true
}

const toggleLike = (repo: GithubRepoItem): void => {
  repo.stars++
  ElMessage.success(`成功为项目 ${repo.owner}/${repo.name} 贡献 1 个 Star ⭐`)
}

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
})

watch(() => route.query, () => {
  syncQueryFromRoute()
})
</script>

<template>
  <main class="github-cn-page">
    <!-- Top Header Navigation Bar (Matching Screenshots 2, 3) -->
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
          <div class="dropdown-menu-wrapper">
            <button
              type="button"
              class="nav-link dropdown-toggle"
              :class="{ active: ['collections', 'topics', 'awesome', 'real-world'].includes(currentTab) }"
            >
              🧭 更多资源 ▾
            </button>
            <div class="dropdown-list">
              <div class="dropdown-item" @click="handleTabChange('collections')">🗂️ 主题集合</div>
              <div class="dropdown-item" @click="handleTabChange('topics')">🏷️ 热门话题</div>
              <div class="dropdown-item" @click="handleTabChange('awesome')">😎 Awesome 资源</div>
              <div class="dropdown-item" @click="handleTabChange('real-world')">🚀 实战项目</div>
            </div>
          </div>
        </nav>

        <div class="nav-actions">
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
        <h1>{{ currentTab.toUpperCase() }} 资源图鉴</h1>
        <p class="subtitle">发现顶级开源生态体系与最佳工程范例。</p>
      </section>

      <!-- Filter Controls Toolbar matching Screenshots 1, 2 -->
      <div v-if="['home', 'trends', 'ranking'].includes(currentTab)" class="filter-toolbar">
        <div class="filter-left">
          <!-- Active Switch Toggle -->
          <label class="switch-pill">
            <input type="checkbox" v-model="onlyActive" @change="updateRouteQuery" />
            <span class="switch-slider"></span>
            <span class="switch-label">仅活跃</span>
          </label>

          <!-- Min Stars Input Counter -->
          <div class="input-counter-box">
            <span class="counter-label">⭐ 最小 Star</span>
            <button type="button" class="counter-btn" @click="minStars = Math.max(0, minStars - 100); updateRouteQuery()">-</button>
            <input type="number" v-model.number="minStars" @change="updateRouteQuery" />
            <button type="button" class="counter-btn" @click="minStars += 100; updateRouteQuery()">+</button>
          </div>

          <!-- License Select -->
          <div class="license-select-box">
            <span class="select-label">📄 许可证</span>
            <select v-model="selectedLicense" @change="updateRouteQuery">
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
          <button type="button" class="action-btn apply-btn" @click="handleApplyFilter">
            🔍 应用
          </button>
          <button type="button" class="action-btn clear-btn" @click="handleClearFilter">
            ✕ 清除
          </button>
        </div>
      </div>

      <!-- Content Area 1: Weekly Cards Section matching Screenshot 3 -->
      <section v-if="currentTab === 'weekly'" class="weekly-cards-grid">
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
          <button type="button" class="read-full-btn" @click="openExternalRepo('weekly', w.author)">
            阅读全文 &gt;
          </button>
        </div>
      </section>

      <!-- Content Area 2: Collections Grid -->
      <section v-else-if="['collections', 'topics', 'awesome', 'real-world'].includes(currentTab)" class="collections-grid">
        <div v-for="c in collections" :key="c.id" class="collection-card">
          <div class="collection-icon">{{ c.icon }}</div>
          <h3>{{ c.title }}</h3>
          <p>{{ c.desc }}</p>
          <div class="collection-footer">
            <span class="item-count">{{ c.count }} 个精选项目</span>
            <div class="tag-badges">
              <span v-for="t in c.tags" :key="t" class="tag-badge">#{{ t }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Area 3: Repos Card Grid matching Screenshots 1, 4, 5 -->
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
          <span class="badge-count">{{ filteredRepoList.length * 248 }}</span>
        </div>

        <div v-if="filteredRepoList.length === 0" class="empty-state">
          <p>📭 没有符合筛选条件的 GitHub 项目</p>
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
              <span class="stat-item stars">⭐ {{ (repo.stars / 1000).toFixed(1) }}k</span>
              <span class="stat-item forks">🔀 {{ (repo.forks / 1000).toFixed(1) }}k</span>
              <span class="stat-item issues">ⓘ {{ repo.issues }}</span>
              <span class="stat-item value">🛡️ 价值分 {{ repo.valueScore }}</span>
            </div>

            <!-- Commit Activity Sparkline Bar Graph (Matching Screenshots 4 & 5) -->
            <div class="sparkline-container" title="近期 Commit 活跃度柱状图">
              <div
                v-for="(height, i) in repo.sparkline"
                :key="i"
                class="spark-bar"
                :style="{ height: `${Math.min(100, Math.max(15, height / 5))}%` }"
              ></div>
            </div>

            <!-- Description -->
            <p class="repo-description">{{ repo.description }}</p>

            <!-- Topics Badges -->
            <div class="topics-bar">
              <span v-for="t in repo.topics" :key="t" class="topic-chip">{{ t }}</span>
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
