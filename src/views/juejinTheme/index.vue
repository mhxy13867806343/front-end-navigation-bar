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
                <img
                  v-for="u in item.recentUsers"
                  :key="u.user_id"
                  :src="u.avatar_large"
                  :title="u.user_name"
                  class="user-avatar"
                  loading="lazy"
                />
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
</script>

<style scoped>
.theme-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%);
  color: #e0e0e6;
  padding: 32px 0;
}
.page-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ─── Header ────────────────────────────── */
.theme-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}
.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(90deg, #ff6b35, #f7c948, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}
.subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.45);
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ─── Stats Bar ─────────────────────────── */
.stats-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.stat-card {
  flex: 1;
  min-width: 120px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 18px 20px;
  text-align: center;
  backdrop-filter: blur(8px);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(78,205,196,0.15);
}
.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #4ecdc4, #45b7d1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.stat-label {
  display: block;
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  margin-top: 4px;
}

/* ─── State Blocks ──────────────────────── */
.state-block {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.5);
  font-size: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.state-block.error {
  color: #f56c6c;
}
.state-block a {
  color: #4ecdc4;
  margin-left: 8px;
  text-decoration: underline;
}

/* ─── Theme Grid ────────────────────────── */
.theme-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.theme-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 20px 24px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: fadeSlideIn 0.5s ease forwards;
  opacity: 0;
  cursor: default;
}
.theme-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(78,205,196,0.3);
  transform: translateX(6px);
  box-shadow: 0 8px 32px rgba(78,205,196,0.1);
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Rank Badge ────────────────────────── */
.card-rank {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.4);
  margin-top: 4px;
}
.card-rank.gold {
  background: linear-gradient(135deg, #ffd700, #ffb300);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255,215,0,0.35);
}
.card-rank.silver {
  background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
  color: #fff;
  box-shadow: 0 4px 12px rgba(192,192,192,0.3);
}
.card-rank.bronze {
  background: linear-gradient(135deg, #cd7f32, #b8691e);
  color: #fff;
  box-shadow: 0 4px 12px rgba(205,127,50,0.3);
}

/* ─── Card Cover ────────────────────────── */
.card-cover {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-placeholder {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #4ecdc4, #45b7d1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ─── Card Body ─────────────────────────── */
.card-body {
  flex: 1;
  min-width: 0;
}
.card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.theme-name {
  font-size: 17px;
  font-weight: 700;
  color: #f0f0f4;
  margin: 0;
  line-height: 1.3;
}
.card-badges {
  display: flex;
  gap: 6px;
}
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
  line-height: 1.5;
}
.badge.rec {
  background: rgba(78,205,196,0.15);
  color: #4ecdc4;
  border: 1px solid rgba(78,205,196,0.3);
}
.badge.lottery {
  background: rgba(247,201,72,0.15);
  color: #f7c948;
  border: 1px solid rgba(247,201,72,0.3);
}
.theme-brief {
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  margin: 0 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.theme-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.stat {
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}
.stat:hover {
  color: rgba(255,255,255,0.85);
}

/* ─── Recent Users ──────────────────────── */
.recent-users {
  display: flex;
  gap: 0;
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(15,12,41,0.8);
  margin-left: -8px;
  object-fit: cover;
  transition: transform 0.2s;
}
.user-avatar:first-child {
  margin-left: 0;
}
.user-avatar:hover {
  transform: scale(1.2);
  z-index: 1;
}

/* ─── Load More ─────────────────────────── */
.load-more {
  text-align: center;
  padding: 32px 0;
}
.no-more {
  color: rgba(255,255,255,0.25);
  font-size: 13px;
  letter-spacing: 2px;
}

/* ─── Responsive ────────────────────────── */
@media (max-width: 640px) {
  .theme-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .stats-bar {
    flex-direction: column;
  }
  .theme-card {
    flex-wrap: wrap;
    padding: 16px;
  }
  .card-cover {
    width: 60px;
    height: 60px;
  }
}
</style>
