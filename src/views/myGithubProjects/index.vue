<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  GITHUB_PROJECTS,
  GITHUB_PROJECT_CATEGORIES,
  type GithubProjectItem,
  type GithubProjectCategory
} from '@/constants/githubProjectsData'
import ShareButton from '@/components/ShareButton.vue'
import './css/index.scss'

const route = useRoute()
const router = useRouter()

const initialCat: string = (route.query.category as string) || 'all'
const activeCategory: Ref<string> = ref<string>(initialCat)
const searchQuery: Ref<string> = ref<string>('')
const selectedProject: Ref<GithubProjectItem | null> = ref<GithubProjectItem | null>(null)
const previewDialogVisible: Ref<boolean> = ref<boolean>(false)

const externalUrl: Ref<string> = ref<string>('')
const externalModalVisible: Ref<boolean> = ref<boolean>(false)

watch(activeCategory, (newCat: string) => {
  const query = { ...route.query }
  if (newCat === 'all') {
    delete query.category
  } else {
    query.category = newCat
  }
  void router.replace({ query })
})

watch(
  () => route.query.category,
  (newCatQuery) => {
    const cat = (newCatQuery as string) || 'all'
    if (activeCategory.value !== cat) {
      activeCategory.value = cat
    }
  }
)

const handleKeydown = (e: KeyboardEvent): void => {
  const target = e.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return
  }

  const keys = GITHUB_PROJECT_CATEGORIES.map((c: GithubProjectCategory): string => c.key)
  const currentIndex = keys.indexOf(activeCategory.value)
  if (currentIndex === -1) return

  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    const prevIndex = (currentIndex - 1 + keys.length) % keys.length
    activeCategory.value = keys[prevIndex]
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    const nextIndex = (currentIndex + 1) % keys.length
    activeCategory.value = keys[nextIndex]
  }
}

onMounted((): void => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted((): void => {
  window.removeEventListener('keydown', handleKeydown)
})

const filteredProjects: ComputedRef<GithubProjectItem[]> = computed<GithubProjectItem[]>(() => {
  let list = GITHUB_PROJECTS
  if (activeCategory.value !== 'all') {
    list = list.filter((item: GithubProjectItem): boolean => item.category === activeCategory.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter((item: GithubProjectItem): boolean => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.techStack.some((t: string): boolean => t.toLowerCase().includes(q))
      )
    })
  }
  return list
})

const getCategoryLabel = (key: string): string => {
  const cat = GITHUB_PROJECT_CATEGORIES.find((c: GithubProjectCategory): boolean => c.key === key)
  return cat ? `${cat.icon} ${cat.label}` : key
}

const openProjectDetail = (item: GithubProjectItem): void => {
  selectedProject.value = item
  previewDialogVisible.value = true
}

const requestExternalNavigation = (url: string): void => {
  externalUrl.value = url
  externalModalVisible.value = true
}

interface SuggestionItem {
  value: string
  type: string
  icon?: string
}

const querySearchSuggestions = (queryString: string, cb: (results: SuggestionItem[]) => void): void => {
  const q = queryString.trim().toLowerCase()
  if (!q) {
    cb([])
    return
  }

  const suggestions: SuggestionItem[] = []
  const seen = new Set<string>()

  // 1. 匹配项目名称
  GITHUB_PROJECTS.forEach((p: GithubProjectItem): void => {
    if (p.name.toLowerCase().includes(q) && !seen.has(p.name)) {
      seen.add(p.name)
      suggestions.push({ value: p.name, type: '项目', icon: p.icon })
    }
  })

  // 2. 匹配技术栈标签
  GITHUB_PROJECTS.forEach((p: GithubProjectItem): void => {
    p.techStack.forEach((tech: string): void => {
      if (tech.toLowerCase().includes(q) && !seen.has(tech)) {
        seen.add(tech)
        suggestions.push({ value: tech, type: '技术栈', icon: '🛠️' })
      }
    })
  })

  // 3. 匹配分类名称
  GITHUB_PROJECT_CATEGORIES.forEach((cat: GithubProjectCategory): void => {
    if (cat.label.toLowerCase().includes(q) && !seen.has(cat.label)) {
      seen.add(cat.label)
      suggestions.push({ value: cat.label, type: '分类', icon: cat.icon })
    }
  })

  cb(suggestions.slice(0, 10))
}

const handleSuggestionSelect = (item: Record<string, any>): void => {
  searchQuery.value = item.value as string
}

const confirmExternalNavigation = (): void => {
  if (externalUrl.value) {
    window.open(externalUrl.value, '_blank')
  }
  externalModalVisible.value = false
}
</script>

<template>
  <div class="my-github-projects-page">
    <!-- 顶部 Banner -->
    <header class="projects-banner">
      <div class="banner-content">
        <div class="title-row">
          <span class="banner-icon">🐙</span>
          <h1>GitHub 个人精选开源项目展馆</h1>
        </div>
        <p class="banner-desc">
          精选收录 21 个高质量开源项目：覆盖 AI 模型与配额、Naive UI/Layui 中后台系统、Vue3 响应式自适应大屏、UniApp 移动端/短视频模板、Rust 即时通讯、Python 运维小工具与技术博客。
        </p>
        <div class="stats-pills">
          <span class="stat-pill">✨ 21 个精选仓库</span>
          <span class="stat-pill">⚡ 100% 开源免费</span>
          <span class="stat-pill">🚀 随时克隆部署</span>
        </div>
      </div>
    </header>

    <!-- 筛选与搜索工具栏 -->
    <div class="filter-toolbar">
      <div class="categories-tabs">
        <button
          v-for="cat in GITHUB_PROJECT_CATEGORIES"
          :key="cat.key"
          type="button"
          class="category-tab-btn"
          :class="{ active: activeCategory === cat.key }"
          @click="activeCategory = cat.key"
        >
          <span class="tab-icon">{{ cat.icon }}</span>
          <span class="tab-text">{{ cat.label }}</span>
        </button>
      </div>

      <div class="search-input-box">
        <el-autocomplete
          v-model="searchQuery"
          :fetch-suggestions="querySearchSuggestions"
          placeholder="🔍 搜索项目名称、技术栈 (输入 r 自动提示)..."
          clearable
          size="small"
          class="project-search-input"
          @select="handleSuggestionSelect"
        >
          <template #default="{ item }">
            <div class="suggestion-option-row">
              <div class="suggestion-left">
                <span class="suggestion-icon">{{ item.icon || '🔍' }}</span>
                <span class="suggestion-text">{{ item.value }}</span>
              </div>
              <span class="suggestion-type-badge">{{ item.type }}</span>
            </div>
          </template>
        </el-autocomplete>
      </div>
    </div>

    <!-- 项目卡片列表 -->
    <main class="projects-grid-container">
      <div v-if="!filteredProjects.length" class="empty-projects-tip">
        🔍 未找到匹配的 GitHub 开源项目，请尝试调整搜索关键词。
      </div>

      <div v-else class="projects-grid">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
        >
          <div class="card-header">
            <div class="project-title-group">
              <span class="project-icon">{{ project.icon }}</span>
              <h2 class="project-name">{{ project.name }}</h2>
            </div>
            <span class="category-badge">{{ getCategoryLabel(project.category) }}</span>
          </div>

          <p class="project-description">{{ project.description }}</p>

          <div class="tech-stack-tags">
            <span
              v-for="tech in project.techStack"
              :key="tech"
              class="tech-tag"
            >
              {{ tech }}
            </span>
          </div>

          <div class="card-footer">
            <div class="card-actions">
              <button
                type="button"
                class="action-btn primary-btn"
                @click="requestExternalNavigation(project.githubUrl)"
              >
                🐙 GitHub 仓库 ↗
              </button>
              <button
                type="button"
                class="action-btn detail-btn"
                @click="openProjectDetail(project)"
              >
                👁️ 详情与预览
              </button>
            </div>
            <ShareButton
              :payload="{
                title: `分享开源项目：${project.name}`,
                description: project.description,
                url: project.githubUrl
              }"
              size="compact"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- 项目详情与预览 Modal 弹窗 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="selectedProject ? `${selectedProject.icon} ${selectedProject.name}` : '项目详情与预览'"
      width="680px"
      append-to-body
      destroy-on-close
      class="project-detail-dialog"
    >
      <div v-if="selectedProject" class="dialog-project-content">
        <div class="detail-section">
          <h3>📌 项目功能描述</h3>
          <p class="detail-desc">{{ selectedProject.description }}</p>
        </div>

        <div class="detail-section">
          <h3>🛠️ 核心技术栈</h3>
          <div class="tech-stack-tags">
            <span
              v-for="tech in selectedProject.techStack"
              :key="`dialog-${tech}`"
              class="tech-tag highlight"
            >
              {{ tech }}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <h3>📦 克隆与命令</h3>
          <div class="clone-command-box">
            <code>git clone {{ selectedProject.githubUrl }}.git</code>
          </div>
        </div>

        <div class="detail-section">
          <h3>🔗 快捷跳转链接</h3>
          <div class="quick-links">
            <button
              type="button"
              class="link-item github"
              @click="requestExternalNavigation(selectedProject.githubUrl)"
            >
              🐙 访问 GitHub 官方开源地址 ↗
            </button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 稀土掘金风 外链跳转安全确认 Modal -->
    <el-dialog
      v-model="externalModalVisible"
      title="🔗 外部链接访问确认"
      width="520px"
      append-to-body
      destroy-on-close
      class="juejin-external-dialog"
    >
      <div class="juejin-external-container">
        <div class="juejin-logo-badge">
          <span class="badge-icon">🌐</span>
          <span class="badge-brand">GitHub 个人精选开源项目展馆</span>
        </div>

        <h3 class="juejin-notice-title">即将离开本站，请注意账号与财产安全</h3>

        <div class="target-url-box">
          <code>{{ externalUrl }}</code>
        </div>

        <div class="juejin-modal-actions">
          <el-button @click="externalModalVisible = false">取消</el-button>
          <el-button type="primary" class="continue-btn" @click="confirmExternalNavigation">
            继续访问 ↗
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
