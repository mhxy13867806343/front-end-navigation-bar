<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { menuItemsList } from '@/utlis/menuItems'
import { webLibraryGroups, type WebLibraryItem } from '@/constants/webLibrary'
import ErrorLayout from './ErrorLayout.vue'

const router = useRouter()
const route = useRoute()
const searchQuery = ref('')
const RECOMMENDATION_SIZE = 6
const RECOMMENDATION_REFRESH_MS = 4000
let recommendationRefreshTimer: ReturnType<typeof window.setInterval> | null = null

interface RouteRecommendation {
  name: string
  path: string
  icon: string
  desc: string
}

const lostPath = computed(() => {
  const from = route.query.from
  return typeof from === 'string' && from.trim() ? from : ''
})

const visibleRecommendedRoutes = ref<RouteRecommendation[]>([])

function normalizeRouteLabel(label: string): { icon: string, name: string } {
  const trimmedLabel = label.trim()
  const firstSpaceIndex = trimmedLabel.indexOf(' ')

  if (firstSpaceIndex > 0 && firstSpaceIndex <= 4) {
    const iconCandidate = trimmedLabel.slice(0, firstSpaceIndex)
    if (/^[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F♡↗⚡✈]+$/u.test(iconCandidate)) {
      return {
        icon: iconCandidate,
        name: trimmedLabel.slice(firstSpaceIndex + 1).trim() || trimmedLabel
      }
    }
  }

  return {
    icon: '🧭',
    name: trimmedLabel
  }
}

function isInternalRoute(command: string | undefined): command is string {
  return Boolean(command && command.startsWith('/') && !command.startsWith('//'))
}

function collectWebLibraryItems(items: WebLibraryItem[], groupTitle: string, routes: Map<string, RouteRecommendation>): void {
  for (const item of items) {
    if (isInternalRoute(item.command)) {
      const { icon, name } = normalizeRouteLabel(item.label)
      routes.set(item.command, {
        name,
        path: item.command,
        icon,
        desc: `${groupTitle} · 全局页面入口`
      })
    }

    if (item.children?.length) {
      collectWebLibraryItems(item.children, groupTitle, routes)
    }
  }
}

function buildGlobalRecommendedRoutes(): RouteRecommendation[] {
  const routes = new Map<string, RouteRecommendation>()

  for (const group of webLibraryGroups) {
    collectWebLibraryItems(group.items, group.title, routes)
  }

  for (const category of menuItemsList) {
    const tools = [
      ...(category.tools || []),
      ...(category.subcategories || []).flatMap((subcategory) => subcategory.tools)
    ]

    for (const tool of tools) {
      if (isInternalRoute(tool.link)) {
        routes.set(tool.link, {
          name: tool.name,
          path: tool.link,
          icon: tool.icon || category.icon || '🧭',
          desc: `${category.name} · ${tool.desc}`
        })
      }
    }
  }

  return [...routes.values()].filter((item) => item.path !== '/404')
}

const recommendedRoutePool = computed<RouteRecommendation[]>(() => buildGlobalRecommendedRoutes())

function refreshRecommendations(): void {
  const pool = recommendedRoutePool.value
  if (pool.length <= RECOMMENDATION_SIZE) {
    visibleRecommendedRoutes.value = pool
    return
  }

  visibleRecommendedRoutes.value = [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, RECOMMENDATION_SIZE)
}

const handleSearch = () => {
  const keyword = searchQuery.value.trim().toLowerCase()
  if (!keyword) {
    ElMessage.info('请输入您想找的功能或页面关键字！')
    return
  }

  const matchedRoute = recommendedRoutePool.value.find((item) => {
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

onMounted(() => {
  refreshRecommendations()
  recommendationRefreshTimer = window.setInterval(refreshRecommendations, RECOMMENDATION_REFRESH_MS)
})

onUnmounted(() => {
  if (recommendationRefreshTimer) {
    window.clearInterval(recommendationRefreshTimer)
    recommendationRefreshTimer = null
  }
})
</script>

<template>
  <ErrorLayout>
    <div class="error-container">
      <section class="not-found-card">
        <div class="card-wave-field" aria-hidden="true">
          <span class="water-crest crest-front"></span>
          <span class="water-crest crest-back"></span>
          <span class="water-bubble bubble-one"></span>
          <span class="water-bubble bubble-two"></span>
          <span class="water-bubble bubble-three"></span>
        </div>

        <div class="visual-hero" aria-hidden="true">
          <div class="signal-orbit">
            <span class="signal-dot dot-one"></span>
            <span class="signal-dot dot-two"></span>
            <span class="signal-dot dot-three"></span>
            <span class="satellite-icon">🛰️</span>
          </div>
          <div class="error-code" data-text="404">404</div>
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
        <div class="recommend-heading">
          <div>
            <h2 id="recommend-title" class="section-title">也许你想去这里</h2>
            <p class="section-subtitle">从全局页面入口随机抽取，每 4s 自动换一批。</p>
          </div>
          <button class="route-refresh-button" type="button" @click="refreshRecommendations">
            <span>↻</span>
            换一批
          </button>
        </div>
        <div class="route-grid">
          <button
            v-for="item in visibleRecommendedRoutes"
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
