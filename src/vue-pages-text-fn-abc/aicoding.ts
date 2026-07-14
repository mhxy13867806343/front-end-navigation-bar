// Extracted constants and logic for AiCoding page
import type { AiCodingSortTab } from './vue-interface'

export type SortTab = AiCodingSortTab

export const SORT_TABS: AiCodingSortTab[] = [
  { label: '热门', value: 1 },
  { label: '最新', value: 2 }
]

export const API_BASE = '/api-juejin'
