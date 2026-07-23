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

<style scoped lang="scss">
.error-container {
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeIn 0.4s ease-out;
}

.visual-hero {
  position: relative;
  margin-bottom: 20px;

  .planet-orbit {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(126, 34, 206, 0.05) 100%);
    border: 2px dashed rgba(168, 85, 247, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    position: relative;

    .astronaut-icon {
      font-size: 58px;
      animation: orbitFloat 4s ease-in-out infinite;
    }
  }

  .error-code {
    font-size: 88px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 4px;
    background: linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7e22ce 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 30px rgba(168, 85, 247, 0.35);
  }
}

.error-info {
  width: 100%;

  .error-title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 10px;
    color: #f8fafc;
  }

  .error-desc {
    font-size: 15px;
    color: #94a3b8;
    max-width: 650px;
    margin: 0 auto 24px;
    line-height: 1.6;
  }

  .search-card {
    max-width: 580px;
    margin: 0 auto 32px;
  }

  .recommend-section {
    margin-bottom: 32px;

    .section-title {
      font-size: 15px;
      color: #cbd5e1;
      margin-bottom: 16px;
      font-weight: 600;
    }

    .route-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;

      .route-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 14px 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.25s ease;

        &:hover {
          background: rgba(168, 85, 247, 0.12);
          border-color: rgba(168, 85, 247, 0.4);
          transform: translateY(-2px);
        }

        .route-icon {
          font-size: 22px;
        }

        .route-name {
          font-size: 14px;
          font-weight: 500;
          color: #f1f5f9;
        }
      }
    }
  }

  .action-btn-group {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

@keyframes orbitFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(10deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
