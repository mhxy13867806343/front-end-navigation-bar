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

<style scoped lang="scss">
.error-page-layout {
  min-height: 100vh;
  background: radial-gradient(circle at 50% 0%, #1e2638 0%, #0d1117 70%, #080a0f 100%);
  color: #e6edf3;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  overflow-x: hidden;
}

.status-navigation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 16px;
  flex-wrap: wrap;

  .bar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-1px);
    }

    .brand-logo {
      font-size: 20px;
      background: linear-gradient(135deg, #60a5fa, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-text {
      font-weight: 700;
      font-size: 15px;
      letter-spacing: 0.5px;
      color: #f3f4f6;
    }
  }

  .status-tabs-container {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 0, 0, 0.3);
    padding: 4px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);

    .status-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #94a3b8;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;

      &:hover {
        color: #f1f5f9;
        background: rgba(255, 255, 255, 0.06);
      }

      &.active {
        color: #ffffff;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
      }

      .tab-icon {
        font-size: 14px;
      }

      .tab-badge {
        font-size: 9px;
        font-weight: 700;
        background: #ef4444;
        color: #fff;
        padding: 1px 5px;
        border-radius: 10px;
        line-height: 1.2;
      }
    }
  }

  .bar-extra {
    display: flex;
    align-items: center;
  }
}

.status-content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .status-navigation-bar {
    justify-content: center;
    padding: 10px 12px;

    .status-tabs-container {
      overflow-x: auto;
      max-width: 100%;
      padding: 4px;
    }
  }
}
</style>
