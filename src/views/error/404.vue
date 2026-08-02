<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ErrorLayout from './ErrorLayout.vue'

const router = useRouter()
const searchQuery = ref('')

const recommendedRoutes = [
  { name: '🤖 AI Coding 工具集', path: '/aicoding', icon: '🤖' },
  { name: '🌤️ 实时天气预报', path: '/weather', icon: '🌤️' },
  { name: '📜 经典名人名言', path: '/mingyan', icon: '📜' },
  { name: '📊 实时 API 中心', path: '/api-center', icon: '📊' },
  { name: '🎮 经典推箱子游戏', path: '/sokoban', icon: '🎮' },
  { name: '🎨 炫酷 3D 展示馆', path: '/three-showcase', icon: '🎨' }
]

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    ElMessage.info('请输入您想找的功能或页面关键字！')
    return
  }
  ElMessage.success(`正在全站检索关键词："${searchQuery.value}"...`)
  router.push('/dyform')
}

const navigateTo = (path: string) => {
  router.push(path)
}

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <ErrorLayout>
    <div class="error-container">
      <div class="visual-hero">
        <div class="planet-orbit">
          <span class="astronaut-icon">🛸</span>
          <div class="stars"></div>
        </div>
        <div class="error-code">404</div>
      </div>

      <div class="error-info">
        <h1 class="error-title">HTTP 404 Page Not Found / 目标页面漂流迷失</h1>
        <p class="error-desc">
          抱歉，您访问的页面不存在、已被搬迁，或输入的 URL 地址拼写有误。请检查地址栏或使用下方导航推荐。
        </p>

        <!-- Search Bar Card -->
        <div class="search-card">
          <el-input
            v-model="searchQuery"
            placeholder="搜索全站导航、工具集或组件页面..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button type="primary" @click="handleSearch">全站搜索</el-button>
            </template>
          </el-input>
        </div>

        <!-- Recommended Feature Cards -->
        <div class="recommend-section">
          <h3 class="section-title">🌟 为您推荐的热门核心功能模块</h3>
          <div class="route-grid">
            <div
              v-for="item in recommendedRoutes"
              :key="item.path"
              class="route-card"
              @click="navigateTo(item.path)"
            >
              <span class="route-icon">{{ item.icon }}</span>
              <span class="route-name">{{ item.name }}</span>
            </div>
          </div>
        </div>

        <div class="action-btn-group">
          <el-button type="primary" size="large" @click="goHome">
            🏠 返回首页大厅
          </el-button>
          <el-button size="large" plain @click="goBack">
            ↩ 返回上一页
          </el-button>
        </div>
      </div>
    </div>
  </ErrorLayout>
</template>

<style scoped lang="scss" src="./css/404.scss"></style>
