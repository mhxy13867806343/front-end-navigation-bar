// Extracted constants, types, and helpers for the JuejinTheme page
import type { JuejinListResponse } from './vue-interface'

// Re-export shared types
export type { JuejinListResponse }

// Reuse the same API base as aicoding (proxy: /api-juejin -> https://api.juejin.cn)
export { API_BASE } from './aicoding'

// ─── Raw API response shape ──────────────────────────────────────────

export interface ThemeRaw {
  theme_id: string
  theme_name: string
  icon?: string
  description?: string
  brief?: string
  post_count?: number
  follower_count?: number
  view_count?: number
  status?: number
  hot_score?: number
}

// ─── Normalised UI model ─────────────────────────────────────────────

export interface ThemeItem {
  id: string
  name: string
  icon: string
  description: string
  postCount: number
  followerCount: number
  viewCount: number
  hotScore: number
}

// ─── Query body sent to POST /tag_api/v1/theme/list_by_hot ──────────

export interface ThemeQueryBody {
  keyword: string
  cursor: string
  limit: number
}

// ─── Mapper ──────────────────────────────────────────────────────────

export function mapTheme(raw: ThemeRaw): ThemeItem {
  return {
    id: raw.theme_id,
    name: raw.theme_name || '未知主题',
    icon: raw.icon || '',
    description: raw.description || raw.brief || '',
    postCount: raw.post_count || 0,
    followerCount: raw.follower_count || 0,
    viewCount: raw.view_count || 0,
    hotScore: raw.hot_score || 0
  }
}

// ─── Number formatter ────────────────────────────────────────────────

export function formatNumber(n: number): string {
  if (n >= 100000) return `${(n / 10000).toFixed(1)}w`
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
