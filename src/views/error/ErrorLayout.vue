<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface ErrorTab {
  code: string
  name: string
  path: string
  icon: string
  badge?: string
}

const route = useRoute()
const router = useRouter()

const errorTabs: ErrorTab[] = [
  { code: '200', name: '200 访问正常', path: '/200', icon: '✅' },
  { code: '401', name: '401 未授权', path: '/401', icon: '🔑' },
  { code: '402', name: '402 需付费', path: '/402', icon: '💎', badge: 'VIP' },
  { code: '403', name: '403 拒访问', path: '/403', icon: '🛡️' },
  { code: '404', name: '404 未找到', path: '/404', icon: '🚀' },
  { code: '405', name: '405 动受限', path: '/405', icon: '⚡' },
  { code: '500', name: '500 内部错', path: '/500', icon: '🔥' },
  { code: 'perm', name: '权限管理中心', path: '/permission', icon: '🔐' },
  { code: 'logs', name: '系统审计日志', path: '/logs', icon: '📜', badge: 'LIVE' }
]

const activePath = computed(() => route.path)

const navigateTo = (path: string) => {
  router.push(path)
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="error-page-layout">
    <!-- Quick Page Switcher Header Bar -->
    <header class="status-navigation-bar">
      <div class="bar-brand" @click="goHome">
        <span class="brand-logo">⚡</span>
        <span class="brand-text">系统状态与权限演示中心</span>
      </div>

      <nav class="status-tabs-container">
        <button
          v-for="tab in errorTabs"
          :key="tab.path"
          class="status-tab-btn"
          :class="{ active: activePath === tab.path }"
          @click="navigateTo(tab.path)"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-name">{{ tab.name }}</span>
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </nav>

      <div class="bar-extra">
        <el-button type="primary" size="small" round plain @click="goHome">
          ↩ 返回主导航页
        </el-button>
      </div>
    </header>

    <!-- Sub-page Content Body -->
    <main class="status-content-body">
      <slot />
    </main>
  </div>
</template>

<style scoped lang="scss" src="./css/ErrorLayout.scss"></style>
