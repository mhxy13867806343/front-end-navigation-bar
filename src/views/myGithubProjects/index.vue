<script setup lang="ts">
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import {
  GITHUB_PROJECTS,
  GITHUB_PROJECT_CATEGORIES,
  type GithubProjectItem,
  type GithubProjectCategory
} from '@/constants/githubProjectsData'
import ShareButton from '@/components/ShareButton.vue'
import './css/index.scss'

const activeCategory: Ref<string> = ref<string>('all')
const searchQuery: Ref<string> = ref<string>('')
const selectedProject: Ref<GithubProjectItem | null> = ref<GithubProjectItem | null>(null)
const previewDialogVisible: Ref<boolean> = ref<boolean>(false)

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

const openGithubUrl = (url: string): void => {
  window.open(url, '_blank')
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
        <el-input
          v-model="searchQuery"
          placeholder="🔍 搜索项目名称、技术栈 (如: Rust, Vue3, UniApp)..."
          clearable
          size="medium"
          class="project-search-input"
        />
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
                @click="openGithubUrl(project.githubUrl)"
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
              :title="`分享开源项目：${project.name}`"
              :text="`${project.name} - ${project.description}`"
              :url="project.githubUrl"
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
            <a :href="selectedProject.githubUrl" target="_blank" rel="noopener noreferrer" class="link-item github">
              🐙 访问 GitHub 官方开源地址 ↗
            </a>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
