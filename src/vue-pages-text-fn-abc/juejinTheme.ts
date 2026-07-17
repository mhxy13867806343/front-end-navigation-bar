// Extracted constants, types, and helpers for the JuejinTheme page
import type { JuejinListResponse } from './vue-interface'

// Re-export shared types
export type { JuejinListResponse }

// Reuse the aicoding API base: dev uses Vite proxy, production uses the remote Juejin host.
export { API_BASE } from './aicoding'

// ─── Raw API response shape ──────────────────────────────────────────

/** 每条 data 项内嵌的 theme 对象 */
export interface ThemeDetail {
  theme_id: string
  name: string
  cover?: string
  brief?: string
  is_lottery?: boolean
  is_rec?: boolean
  rec_rank?: number
  hot?: number
  view_cnt?: number
  user_cnt?: number
  status?: number
  has_expiration?: boolean
  valid_begin_time?: number
  valid_end_time?: number
  expired?: number
}

/** 参与用户摘要 */
export interface ThemeRecentUser {
  user_id: string
  user_name: string
  avatar_large: string
  level?: number
  job_title?: string
  company?: string
}

/** data 数组中每一项的完整结构 */
export interface ThemeRaw {
  theme: ThemeDetail
  recent_users?: ThemeRecentUser[]
}

// ─── Normalised UI model ─────────────────────────────────────────────

export interface ThemeItem {
  id: string
  name: string
  cover: string
  brief: string
  hot: number
  viewCount: number
  userCount: number
  isLottery: boolean
  isRec: boolean
  recentUsers: ThemeRecentUser[]
}

// ─── Query body sent to POST /tag_api/v1/theme/list_by_hot ──────────

export interface ThemeQueryBody {
  keyword: string
  cursor: string
  limit: number
}

// ─── Mapper ──────────────────────────────────────────────────────────

export function mapTheme(raw: ThemeRaw): ThemeItem {
  const t = raw.theme
  return {
    id: t.theme_id,
    name: t.name || '未知主题',
    cover: t.cover || '',
    brief: t.brief || '',
    hot: t.hot || 0,
    viewCount: t.view_cnt || 0,
    userCount: t.user_cnt || 0,
    isLottery: !!t.is_lottery,
    isRec: !!t.is_rec,
    recentUsers: (raw.recent_users || []).slice(0, 5)
  }
}

// ─── Number formatter ────────────────────────────────────────────────

export function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
