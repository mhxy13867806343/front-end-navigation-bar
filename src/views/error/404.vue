<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ErrorLayout from './ErrorLayout.vue'

const router = useRouter()
const route = useRoute()
const searchQuery = ref('')
const lostPath = computed(() => {
  const from = route.query.from
  return typeof from === 'string' && from.trim() ? from : ''
})

const recommendedRoutes = [
  { name: 'AI Coding 工具集', path: '/aicoding', icon: '🤖', desc: '继续看 AI 工具和文章聚合' },
  { name: '实时天气预报', path: '/weather', icon: '🌤️', desc: '查城市天气和趋势图' },
  { name: '经典名人名言', path: '/mingyan', icon: '📜', desc: '随机灵感和句子收藏' },
  { name: '实时 API 中心', path: '/api-center', icon: '📊', desc: '常用接口入口和调试页' },
  { name: '推箱子游戏', path: '/sokoban', icon: '🎮', desc: '休息一下，推两步箱子' },
  { name: '3D 展示馆', path: '/three-showcase', icon: '🎨', desc: '浏览 Three.js 示例合集' }
]

const handleSearch = () => {
  const keyword = searchQuery.value.trim().toLowerCase()
  if (!keyword) {
    ElMessage.info('请输入您想找的功能或页面关键字！')
    return
  }

  const matchedRoute = recommendedRoutes.find((item) => {
    return item.name.toLowerCase().includes(keyword) || item.path.toLowerCase().includes(keyword)
  })

  if (matchedRoute) {
    ElMessage.success(`找到入口：${matchedRoute.name}`)
    router.push(matchedRoute.path)
    return
  }

  ElMessage.warning('暂时没找到精确入口，先带您回首页。')
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
      <section class="not-found-card">
        <div class="visual-hero" aria-hidden="true">
          <div class="signal-orbit">
            <span class="signal-dot dot-one"></span>
            <span class="signal-dot dot-two"></span>
            <span class="signal-dot dot-three"></span>
            <span class="satellite-icon">🛰️</span>
          </div>
          <div class="error-code">404</div>
        </div>

        <div class="error-info">
          <p class="status-pill">页面信号丢失</p>
          <h1 class="error-title">这个页面没有找到</h1>
          <p class="error-desc">
            可能是地址写错了，也可能是旧链接已经搬家。别急，我给你留了几条能回去的路。
          </p>

          <p v-if="lostPath" class="lost-path">
            刚才访问的是 <code>{{ lostPath }}</code>
          </p>

          <div class="action-btn-group">
            <el-button type="primary" size="large" round @click="goHome">
              返回首页
            </el-button>
            <el-button size="large" round plain @click="goBack">
              返回上一页
            </el-button>
          </div>
        </div>
      </section>

      <div class="search-card">
        <el-input
          v-model="searchQuery"
          placeholder="搜索 AI、天气、API、游戏、3D..."
          size="large"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button type="primary" @click="handleSearch">找入口</el-button>
          </template>
        </el-input>
      </div>

      <section class="recommend-section" aria-labelledby="recommend-title">
        <h2 id="recommend-title" class="section-title">也许你想去这里</h2>
        <div class="route-grid">
          <button
            v-for="item in recommendedRoutes"
            :key="item.path"
            class="route-card"
            type="button"
            @click="navigateTo(item.path)"
          >
            <span class="route-icon">{{ item.icon }}</span>
            <span class="route-copy">
              <span class="route-name">{{ item.name }}</span>
              <span class="route-desc">{{ item.desc }}</span>
            </span>
          </button>
        </div>
      </section>

      <div class="quiet-note">
        <span>如果这是刚部署后的链接，等十几秒再刷新通常就好了。</span>
        <button type="button" @click="goHome">先回 HooksVue 首页</button>
      </div>
    </div>
  </ErrorLayout>
</template>

<style scoped lang="scss" src="./css/404.scss"></style>
