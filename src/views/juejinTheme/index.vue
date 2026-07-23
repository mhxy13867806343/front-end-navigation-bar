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
                  :title="`点击查看 ${u.user_name || '创作者'} 详情与个人主页`"
                  class="user-avatar"
                  style="cursor: pointer; transition: transform 0.2s ease;"
                  loading="lazy"
                  @click="handleAvatarClick(u)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 创作者详情弹窗 (Author Detail Dialog) -->
      <el-dialog
        v-model="userModalVisible"
        title="👤 掘金创作者个人详情"
        width="min(420px, 90vw)"
        align-center
        append-to-body
        destroy-on-close
      >
        <div v-if="selectedUser" class="modal-user-card" style="text-align: center; padding: 10px 0;">
          <img :src="selectedUser.avatar_large" style="width: 84px; height: 84px; border-radius: 50%; border: 3px solid #60a5fa; margin-bottom: 12px; object-fit: cover;" />
          <h3 style="margin: 0 0 6px 0; font-size: 20px; color: #f1f5f9; font-weight: 700;">{{ selectedUser.user_name || '掘金创作者' }}</h3>
          <p v-if="selectedUser.job_title || selectedUser.company" style="margin: 0 0 10px 0; color: #94a3b8; font-size: 13px;">
            {{ [selectedUser.job_title, selectedUser.company].filter(Boolean).join(' @ ') }}
          </p>
          <div style="margin-bottom: 18px;">
            <span style="background: rgba(96, 165, 250, 0.15); color: #60a5fa; border: 1px solid rgba(96, 165, 250, 0.3); padding: 4px 14px; border-radius: 14px; font-size: 12px; font-weight: 600;">
              掘金等级 Lv.{{ selectedUser.level || 1 }}
            </span>
          </div>

          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; margin-bottom: 22px; font-size: 12px; color: #cbd5e1; word-break: break-all;">
            🔗 个人主页: https://juejin.cn/user/{{ selectedUser.user_id || '1310273588955581' }}
          </div>

          <el-button
            type="primary"
            size="large"
            style="width: 100%; font-weight: 700; border-radius: 10px;"
            @click="openJuejinUser(selectedUser.user_id)"
          >
            🚀 跳转前往掘金个人主页
          </el-button>
        </div>
      </el-dialog>

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
import { requestJinaText } from '@/utils/jinaReader'
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

interface ThemeUser {
  user_id: string
  user_name: string
  avatar_large: string
  job_title?: string
  company?: string
  level?: number
}

const keyword = ref<string>('')
const themes = ref<ThemeItem[]>([])
const cursor = ref<string>('0')
const hasMore = ref<boolean>(true)
const loading = ref<boolean>(false)
const error = ref<string>('')
const isProd: boolean = import.meta.env.PROD

const userModalVisible = ref<boolean>(false)
const selectedUser = ref<ThemeUser | null>(null)

function showUserDetailModal(u: ThemeUser): void {
  selectedUser.value = u
  userModalVisible.value = true
}

function handleAvatarClick(u: ThemeUser): void {
  showUserDetailModal(u)
  openJuejinUser(u.user_id)
}

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
    if (isProd) {
      const list: ThemeItem[] = await fetchThemesFromJuejinWeb()
      if (seq !== requestSeq) return
      themes.value = reset ? list : [...themes.value, ...list]
      cursor.value = '0'
      hasMore.value = false
      return
    }

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

async function fetchThemesFromJuejinWeb(): Promise<ThemeItem[]> {
  const text: string = await requestJinaText('https://juejin.cn/hot/articles/1')
  const matches: ThemeItem[] = []
  const seenIds: Set<string> = new Set()
  const topicPattern = /\[(?:!\[[\s\S]*?\]\([^)]+\))*\s*#([^#\]]+)#\s*([\d.]+[kKmMwW万mM]*)\]\((https:\/\/juejin\.cn\/(?:pin\/topic|theme\/detail)\/\d+[^)]*)\)/g
  let match: RegExpExecArray | null

  while ((match = topicPattern.exec(text)) !== null) {
    const name: string = match[1].trim()
    const link: string = match[3]
    const id: string = link.match(/\/(\d+)/)?.[1] || `${name}-${matches.length}`
    if (seenIds.has(id)) continue
    seenIds.add(id)
    matches.push({
      id,
      name,
      cover: '',
      brief: link,
      hot: parseJuejinMetric(match[2]),
      viewCount: 0,
      userCount: 0,
      isLottery: text.slice(Math.max(0, match.index - 160), match.index + match[0].length).includes('lottery'),
      isRec: text.slice(Math.max(0, match.index - 160), match.index + match[0].length).includes('rec'),
      recentUsers: []
    })
  }

  const keywordText: string = keyword.value.trim()
  return keywordText
    ? matches.filter((item: ThemeItem): boolean => item.name.toLowerCase().includes(keywordText.toLowerCase()))
    : matches
}

function parseJuejinMetric(value: string): number {
  const normalized: string = value.trim().toLowerCase()
  const numeric: number = Number.parseFloat(normalized)
  if (!Number.isFinite(numeric)) return 0
  if (normalized.includes('m')) return Math.round(numeric * 1000000)
  if (normalized.includes('k')) return Math.round(numeric * 1000)
  if (normalized.includes('w') || normalized.includes('万')) return Math.round(numeric * 10000)
  return Math.round(numeric)
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

function openJuejinUser(userId?: string): void {
  const targetId: string = (userId && String(userId).trim()) ? String(userId).trim() : '1310273588955581'
  window.open(`https://juejin.cn/user/${targetId}`, '_blank')
}
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
