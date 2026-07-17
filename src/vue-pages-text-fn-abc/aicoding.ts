// Extracted constants and logic for AiCoding page
import type { AiCodingSortTab } from './vue-interface'

export type SortTab = AiCodingSortTab

export const SORT_TABS: AiCodingSortTab[] = [
  { label: '热门', value: 1 },
  { label: '最新', value: 2 }
]

export const JUEJIN_DEV_API_BASE: string = '/api-juejin'
export const JUEJIN_REMOTE_API_BASE: string = 'https://api.juejin.cn'
export const API_BASE: string = import.meta.env.PROD ? JUEJIN_REMOTE_API_BASE : JUEJIN_DEV_API_BASE
