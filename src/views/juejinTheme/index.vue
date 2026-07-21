<template>
  <div class="theme-page">
    <div class="page-inner">
      <!-- 顶部标题 -->
      <header class="theme-header">
        <div class="header-left">
          <h1 class="page-title">🔥 掘金热门主题</h1>
          <span class="subtitle">实时同步稀土掘金平台热门话题榜单</span>
        </div>
        <div class="header-right">
          <el-input
            v-model="keyword"
            placeholder="搜索主题..."
            clearable
            :prefix-icon="Search"
            style="width: 220px;"
            @keyup.enter="search"
            @clear="search"
          />
          <RefreshCountdownButton :on-refresh="handleRefresh" />
        </div>
      </header>

      <!-- 统计卡片 -->
      <div class="stats-bar">
        <div class="stat-card">
          <span class="stat-value">{{ themes.length }}</span>
          <span class="stat-label">已加载主题</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ totalHot }}</span>
          <span class="stat-label">总热度</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ totalUsers }}</span>
          <span class="stat-label">总参与人数</span>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading && !themes.length" class="state-block">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
        <span>正在获取热门主题中...</span>
      </div>

      <!-- 错误 -->
      <div v-else-if="error" class="state-block error">
        {{ error }}
        <a href="javascript:;" @click="reload">重试</a>
      </div>

      <!-- 主题卡片列表 -->
      <div v-else class="theme-grid">
        <div
          v-for="(item, index) in themes"
          :key="item.id"
          class="theme-card"
          :style="{ animationDelay: `${index * 40}ms` }"
        >
          <!-- 排名 -->
          <div class="card-rank" :class="rankClass(index)">
            {{ index + 1 }}
          </div>

          <!-- 封面 -->
          <div class="card-cover">
            <img v-if="item.cover" :src="item.cover" alt="" class="theme-cover-img" />
            <span v-else class="cover-placeholder">{{ item.name.charAt(0) }}</span>
          </div>

          <!-- 内容 -->
          <div class="card-body">
            <div class="card-title-row">
              <h3 class="theme-name">{{ item.name }}</h3>
              <div class="card-badges">
                <span v-if="item.isRec" class="badge rec">推荐</span>
                <span v-if="item.isLottery" class="badge lottery">🎁 抽奖</span>
              </div>
            </div>
            <p class="theme-brief" :title="item.brief">{{ item.brief || '暂无描述' }}</p>
            <div class="card-footer">
              <div class="theme-stats">
                <span class="stat" title="热度">🔥 {{ formatNumber(item.hot) }}</span>
                <span class="stat" title="浏览量">👁 {{ formatNumber(item.viewCount) }}</span>
                <span class="stat" title="参与人数">👥 {{ formatNumber(item.userCount) }}</span>
              </div>
              <!-- 参与用户头像 -->
              <div v-if="item.recentUsers.length" class="recent-users">
                <el-popover
                  v-for="u in item.recentUsers"
                  :key="u.user_id"
                  placement="top"
                  :width="220"
                  trigger="click"
                  effect="dark"
                  popper-style="border-radius: 12px; padding: 14px; background: #1e1e38; border: 1px solid rgba(255,255,255,0.15);"
                >
                  <template #reference>
                    <img
                      :src="u.avatar_large"
                      :title="u.user_name"
                      class="user-avatar"
                      loading="lazy"
                    />
                  </template>
                  <div class="user-popover-content">
                    <div class="user-popover-header">
                      <img :src="u.avatar_large" class="popover-avatar" />
                      <div class="user-info">
                        <div class="user-name">{{ u.user_name }}</div>
                        <div v-if="u.job_title || u.company" class="user-desc">
                          {{ [u.job_title, u.company].filter(Boolean).join(' @ ') }}
                        </div>
                        <div v-if="u.level" class="user-level-tag">
                          掘金 Lv.{{ u.level }}
                        </div>
                      </div>
                    </div>
                    <div class="user-popover-actions">
                      <el-button
                        type="primary"
                        size="small"
                        style="width: 100%; font-weight: 500;"
                        @click="openJuejinUser(u.user_id)"
                      >
                        访问个人主页 🔗
                      </el-button>
                    </div>
                  </div>
                </el-popover>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more">
        <el-button
          v-if="hasMore && themes.length"
          :loading="loading"
          type="primary"
          round
          @click="loadMore"
        >
          {{ loading ? '加载中...' : '加载更多主题' }}
        </el-button>
        <span v-else-if="themes.length" class="no-more">— 已经到底了 —</span>
        <span v-else-if="!loading && !error" class="no-more">暂无数据</span>
      </div>
    </div>
    <el-backtop target=".route-view-layer" :right="40" :bottom="40" :visibility-height="200" />
  </div>
</template>

<script setup lang="ts">
import { requestJson } from '@/utils/request'
import RefreshCountdownButton from '../../components/RefreshCountdownButton.vue'
import { Search, Loading } from '@element-plus/icons-vue'
import {
  API_BASE,
  mapTheme,
  formatNumber,
} from '@/vue-pages-text-fn-abc/juejinTheme'
import type {
  ThemeRaw,
  ThemeItem,
  ThemeQueryBody,
} from '@/vue-pages-text-fn-abc/juejinTheme'
import type { JuejinListResponse } from '@/vue-pages-text-fn-abc/vue-interface'

const keyword = ref<string>('')
const themes = ref<ThemeItem[]>([])
const cursor = ref<string>('0')
const hasMore = ref<boolean>(true)
const loading = ref<boolean>(false)
const error = ref<string>('')

let requestSeq: number = 0

const totalHot = computed<string>(() =>
  formatNumber(themes.value.reduce((sum: number, t: ThemeItem) => sum + t.hot, 0))
)
const totalUsers = computed<string>(() =>
  formatNumber(themes.value.reduce((sum: number, t: ThemeItem) => sum + t.userCount, 0))
)

onMounted((): void => {
  fetchThemes(true)
})

async function fetchThemes(reset: boolean = false): Promise<void> {
  const seq: number = ++requestSeq
  loading.value = true
  error.value = ''
  if (reset) {
    cursor.value = '0'
    themes.value = []
    hasMore.value = true
  }
  try {
    const body: ThemeQueryBody = {
      keyword: keyword.value,
      cursor: cursor.value,
      limit: 15
    }
    const json = await requestJson<JuejinListResponse<ThemeRaw>>(
      `${API_BASE}/tag_api/v1/theme/list_by_hot?aid=2608&uuid=7466052440673076774&spider=0`,
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    )
    if (seq !== requestSeq) return
    if (json.err_no !== 0) throw new Error(json.err_msg || '获取主题失败')
    const list: ThemeItem[] = (json.data || []).map(mapTheme)
    themes.value = reset ? list : [...themes.value, ...list]
    cursor.value = json.cursor || '0'
    hasMore.value = !!json.has_more
  } catch (e: unknown) {
    if (seq !== requestSeq) return
    const message: string = e instanceof Error ? e.message : String(e)
    error.value = `加载失败：${message}`
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}

function search(): void {
  fetchThemes(true)
}

function loadMore(): void {
  if (loading.value || !hasMore.value) return
  fetchThemes(false)
}

function reload(): void {
  error.value = ''
  fetchThemes(true)
}

function handleRefresh(): void {
  fetchThemes(true)
}

function rankClass(index: number): string {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return ''
}

function openJuejinUser(userId: string): void {
  if (!userId) return
  window.open(`https://juejin.cn/user/${userId}`, '_blank')
}
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
