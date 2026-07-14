// Extracted constants and logic for HelloWorld page
import type { HelloWorldSortTab } from './vue-interface'

export type SortTab = HelloWorldSortTab

export const SORT_TABS: HelloWorldSortTab[] = [
  { label: '文章', value: 'articles' },
  { label: '作者榜', value: 'authors' },
  { label: '推荐课程', value: 'lessons' }
]

export const API_BASE = '/api-helloworld'
export const SITE_ORIGIN = 'https://www.helloworld.net'
export const ERR_NO_DATA = '已请求成功，但未解析出列表数据'

export interface CategoryCheckResult {
  isDirection: boolean
  isLanguage: boolean
}

/**
 * Checks category title and routes the values list to the appropriate key
 */
export function checkCategoryTitle(title: string): CategoryCheckResult {
  return {
    isDirection: title === '技术方向',
    isLanguage: title === '编程语言'
  }
}
