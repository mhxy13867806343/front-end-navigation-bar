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
          @click="openThemeTopic(item)"
        >
          <!-- 排名 -->
          <div class="card-rank" :class="rankClass(index)">
            {{ index + 1 }}
          </div>

          <!-- 封面 -->
          <div class="card-cover">
            <img v-if="item.cover" :src="item.cover" alt="" class="theme-cover-img" referrerpolicy="no-referrer" @error="item.cover = ''" />
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
                <span class="stat" title="参与人数">👥 {{ formatNumber(item.recentUsers.length || item.userCount) }}</span>
              </div>
              <!-- 参与用户头像叠放 + 共N人 -->
              <div v-if="item.recentUsers.length" class="recent-users-wrapper">
                <div class="avatar-stack">
                  <img
                    v-for="u in item.recentUsers.slice(0, 3)"
                    :key="u.user_id"
                    :src="u.avatar_large"
                    :title="`点击查看 ${u.user_name || '创作者'} 详情`"
                    class="user-avatar-stacked"
                    :alt="u.user_name || '掘金创作者'"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    @error="handleAvatarImgError"
                    @click.prevent.stop="handleAvatarClick(u)"
                  />
                  <!-- 超过 3 人展示 +N 按钮 -->
                  <span
                    v-if="item.recentUsers.length > 3"
                    class="more-users-badge"
                    :title="`共 ${item.recentUsers.length} 人，点击弹窗查看全部创作者`"
                    @click.prevent.stop="openMoreUsersModal(item)"
                  >
                    +{{ item.recentUsers.length - 3 }}
                  </span>
                </div>
                <span
                  class="user-count-label"
                  @click.prevent.stop="openMoreUsersModal(item)"
                >
                  共 {{ item.recentUsers.length }} 人
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 参与创作者全量列表弹窗 (More Users Dialog) -->
      <el-dialog
        v-model="moreUsersModalVisible"
        :title="`👥 ${selectedThemeForUsers?.name || ''} - 参与创作者列表 (共 ${selectedThemeForUsers?.recentUsers.length || 0} 人)`"
        width="min(640px, 92vw)"
        align-center
        append-to-body
        destroy-on-close
      >
        <div v-if="selectedThemeForUsers" class="more-users-modal-content">
          <div v-if="selectedThemeForUsers.recentUsers.length" class="user-list-grid">
            <div
              v-for="u in selectedThemeForUsers.recentUsers"
              :key="u.user_id"
              class="user-list-card"
              @click="handleAvatarClick(u)"
            >
              <img
                :src="u.avatar_large"
                class="user-list-avatar"
                referrerpolicy="no-referrer"
                @error="handleAvatarImgError"
              />
              <div class="user-list-info">
                <div class="user-list-name">{{ u.user_name || '掘金创作者' }}</div>
                <div class="user-list-meta">
                  <span v-if="u.level" class="user-list-level">Lv.{{ u.level }}</span>
                  <span v-if="u.job_title || u.company" class="user-list-company">
                    {{ [u.job_title, u.company].filter(Boolean).join(' @ ') }}
                  </span>
                </div>
              </div>
              <el-button size="small" type="primary" plain class="view-detail-btn">
                查看全量资料
              </el-button>
            </div>
          </div>
          <div v-else class="empty-user-list">
            暂无更多公开创作者数据
          </div>
        </div>
      </el-dialog>

      <!-- 创作者详情弹窗 (Author Detail Dialog) -->
      <el-dialog
        v-model="userModalVisible"
        title="👤 掘金创作者个人详情"
        width="min(720px, 92vw)"
        align-center
        append-to-body
        destroy-on-close
      >
        <div v-if="selectedUser" class="modal-user-card">
          <div class="modal-user-hero">
            <img
              :src="selectedUser.avatar_large"
              class="modal-user-avatar"
              :alt="selectedUser.user_name || '掘金创作者'"
              title="点击在新标签页中打开掘金个人主页"
              referrerpolicy="no-referrer"
              @error="handleAvatarImgError"
              @click="openJuejinUser(selectedUser.user_id)"
            />
            <h3
              title="点击在新标签页中打开掘金个人主页"
              @click="openJuejinUser(selectedUser.user_id)"
            >
              {{ selectedUser.user_name || '掘金创作者' }}
            </h3>
            <p v-if="selectedUser.job_title || selectedUser.company">
              {{ [selectedUser.job_title, selectedUser.company].filter(Boolean).join(' @ ') }}
            </p>
            <span class="modal-user-level">
              掘金等级 Lv.{{ selectedUser.level || 1 }}
            </span>
          </div>

          <div class="modal-user-home">
            <div
              class="modal-user-home-link"
              title="点击直接在浏览器新标签页中打开个人主页"
              @click="openJuejinUser(selectedUser.user_id)"
            >
              <span class="link-icon">🔗</span>
              <span class="link-label">个人主页:</span>
              <span class="link-url">https://juejin.cn/user/{{ selectedUser.user_id || '1310273588955581' }}</span>
              <span class="jump-arrow">↗</span>
            </div>
            <el-button
              size="small"
              type="primary"
              plain
              class="copy-home-btn"
              @click.stop="copyUserHomeLink(selectedUser.user_id)"
            >
              📋 复制链接
            </el-button>
          </div>

          <div class="modal-user-section-title">
            全部资料数据 (共 {{ selectedUserFields.length }} 项)
          </div>
          <div class="modal-user-detail-grid">
            <div
              v-for="field in selectedUserFields"
              :key="field.key"
              class="modal-user-detail-item"
              :class="{ 'highlight-item': field.isHighlight }"
            >
              <span>{{ field.label }}</span>
              <strong>{{ field.value }}</strong>
            </div>
          </div>

          <el-button
            type="primary"
            size="large"
            class="modal-user-jump"
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
import { copyToClipboard } from '@/utils/clipboard'
import { DEFAULT_AVATAR, handleAvatarImgError } from '@/utils/avatar'
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
  ThemeRecentUser,
} from '@/vue-pages-text-fn-abc/juejinTheme'
import type { JuejinListResponse } from '@/vue-pages-text-fn-abc/vue-interface'

interface UserDetailField {
  key: string
  label: string
  value: string
}

const keyword = ref<string>('')
const themes = ref<ThemeItem[]>([])
const cursor = ref<string>('0')
const hasMore = ref<boolean>(true)
const loading = ref<boolean>(false)
const error = ref<string>('')
const isProd: boolean = import.meta.env.PROD

const userModalVisible = ref<boolean>(false)
const selectedUser = ref<ThemeRecentUser | null>(null)

const moreUsersModalVisible = ref<boolean>(false)
const selectedThemeForUsers = ref<ThemeItem | null>(null)

function openMoreUsersModal(item: ThemeItem): void {
  selectedThemeForUsers.value = item
  moreUsersModalVisible.value = true
}

const userFieldLabels: Record<string, string> = {
  // 基础资料
  user_id: '用户 ID',
  user_name: '用户名 / 昵称',
  company: '所属公司',
  job_title: '职位 / 描述',
  description: '个人简介',
  avatar_large: '高清头像 URL',
  become_author_days: '成为作者天数',
  identity: '身份标识码',
  is_logout: '账号注销状态',
  isfollowed: '是否已关注',
  is_vip: '是否 VIP 会员',
  is_select_annual: '是否入选年度榜单',
  favorable_author: '优质作者标识',

  // 核心互动数据
  level: '掘金等级',
  power: '掘力值 (影响力)',
  follower_count: '粉丝数量',
  followee_count: '关注数量',
  got_view_count: '文章总展现/阅读量',
  got_digg_count: '获得点赞总数',
  post_article_count: '发布文章总数',
  post_shortmsg_count: '发布沸点总数',
  digg_article_count: '点赞文章总数',
  digg_shortmsg_count: '点赞沸点总数',
  collection_set_article_count: '收藏集文章数',
  account_amount: '账户金额',
  article_collect_count_daily: '今日收藏文章数',
  recommend_article_count_daily: '今日推荐文章数',

  // 榜单与活动
  annual_info: '年度榜单信息',
  annual_list_type: '年度榜单类型',
  select_annual_rank: '年度入选排名',
  select_event_count: '入选活动次数',
  select_online_course_count: '订阅课程数量',

  // 嵌套子字段：user_growth_info (用户成长数据)
  user_growth_info: '用户成长数据',
  jpower: '成长 - 掘力值',
  jscore: '成长 - 掘金积分',
  jpower_level: '成长 - 掘力值等级',
  jscore_level: '成长 - 积分等级',
  jscore_title: '成长 - 积分头衔',
  author_achievement_list: '成长 - 创作者成就勋章',
  vip_level: '成长 - VIP 等级',
  vip_title: '成长 - VIP 称号',
  jscore_next_level_score: '成长 - 升级所需积分',
  jscore_this_level_mini_score: '成长 - 当前等级门槛积分',
  vip_score: '成长 - VIP 积分',

  // 嵌套子字段：user_priv_info (用户特权与权限)
  user_priv_info: '用户特权与权限',
  administrator: '特权 - 管理员',
  builder: '特权 - 社区建设者',
  优质作者标识: '特权 - 优质作者认证',
  book_author: '特权 - 小册作者',
  forbidden_words: '特权 - 禁言限制状态',
  can_tag_cnt: '特权 - 标签添加上限',
  auto_recommend: '特权 - 自动推荐',
  signed_author: '特权 - 签约作者',
  popular_author: '特权 - 热门创作者',
  can_add_video: '特权 - 视频上传权限',

  // 嵌套子字段：university & major (大学与专业)
  university: '就读/毕业大学',
  university_id: '大学 ID',
  name: '名称',
  logo: '标识/Logo',
  major: '专业方向',
  major_id: '专业 ID',
  parent_id: '父级专业 ID',
  extraMap: '扩展属性集合'
}

interface UserDetailField {
  key: string
  label: string
  value: string
  isHighlight?: boolean
}

const selectedUserFields = computed<UserDetailField[]>(() => {
  if (!selectedUser.value) return []
  const result: UserDetailField[] = []

  function processObj(obj: Record<string, unknown>, parentKey = '') {
    for (const [key, rawVal] of Object.entries(obj)) {
      const fullKey = parentKey ? `${parentKey}.${key}` : key

      if (rawVal !== null && typeof rawVal === 'object') {
        if (Array.isArray(rawVal)) {
          const label = userFieldLabels[key] || userFieldLabels[fullKey] || key
          result.push({
            key: fullKey,
            label,
            value: rawVal.length === 0 ? '暂无 (空数组)' : rawVal.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join('，')
          })
        } else {
          const subObj = rawVal as Record<string, unknown>
          if (Object.keys(subObj).length === 0) {
            const label = userFieldLabels[key] || userFieldLabels[fullKey] || key
            result.push({
              key: fullKey,
              label,
              value: '暂无 (空对象)'
            })
          } else {
            processObj(subObj, key)
          }
        }
      } else {
        let formattedValue = '无'
        if (rawVal === null || rawVal === undefined || rawVal === '') {
          formattedValue = '无'
        } else if (typeof rawVal === 'boolean') {
          formattedValue = rawVal ? '✅ 是' : '❌ 否'
        } else if (typeof rawVal === 'number') {
          formattedValue = Number.isFinite(rawVal) ? formatNumber(rawVal) : '0'
        } else {
          formattedValue = String(rawVal).trim() || '无'
        }

        const label = userFieldLabels[key] || userFieldLabels[fullKey] || (parentKey ? `${userFieldLabels[parentKey] || parentKey} -> ${key}` : key)

        result.push({
          key: fullKey,
          label,
          value: formattedValue,
          isHighlight: ['power', 'follower_count', 'got_view_count', 'got_digg_count', 'jscore', 'level', 'post_article_count', 'post_shortmsg_count'].includes(key)
        })
      }
    }
  }

  processObj(selectedUser.value as Record<string, unknown>)

  // 按照核心字段排序
  const preferredOrder = [
    'user_id', 'user_name', 'level', 'power', 'company', 'job_title', 'description',
    'follower_count', 'followee_count', 'got_view_count', 'got_digg_count',
    'post_article_count', 'post_shortmsg_count', 'digg_article_count', 'digg_shortmsg_count',
    'avatar_large', 'become_author_days', 'is_vip', 'isfollowed', 'favorable_author'
  ]

  return result.sort((a, b) => {
    const keyA = a.key.split('.').pop() || a.key
    const keyB = b.key.split('.').pop() || b.key
    const indexA = preferredOrder.indexOf(keyA)
    const indexB = preferredOrder.indexOf(keyB)
    if (indexA !== -1 && indexB !== -1) return indexA - indexB
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1
    return a.label.localeCompare(b.label, 'zh-CN')
  })
})

function openThemeTopic(item: ThemeItem): void {
  const targetUrl = (item.brief && item.brief.startsWith('http'))
    ? item.brief
    : `https://juejin.cn/pin/topic/${item.id}`
  window.open(targetUrl, '_blank')
}

function showUserDetailModal(u: ThemeRecentUser): void {
  selectedUser.value = u
  userModalVisible.value = true
}

function handleAvatarClick(u: ThemeRecentUser): void {
  showUserDetailModal(u)
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

function copyUserHomeLink(userId?: string): void {
  const targetId: string = (userId && String(userId).trim()) ? String(userId).trim() : '1310273588955581'
  const linkUrl = `https://juejin.cn/user/${targetId}`
  void copyToClipboard(linkUrl, '个人主页链接已成功复制到剪贴板！')
}
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
