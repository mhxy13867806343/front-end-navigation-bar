/**
 * 全局统一本地缓存 KEY 常量定义文件
 * 方便后续统一管理、防冲突与版本迁移维护
 */
export const STORAGE_KEYS = {
  /** Schedule-X 日程列表缓存 */
  SCHEDULE_X_EVENTS: 'HOOKSVUE_SCHEDULE_X_EVENTS_V1',
  /** Schedule-X 自定义分类列表缓存 */
  SCHEDULE_X_CATEGORIES: 'HOOKSVUE_SCHEDULE_X_CATEGORIES_V1',
  /** 系统全局主题配色 (dark / light) */
  THEME_MODE: 'HOOKSVUE_THEME_MODE',
  /** Web Components 注册表缓存 */
  WEB_COMPONENTS_CACHE: 'HOOKSVUE_WEB_COMPONENTS_CACHE',
  /** Oat UI 拖拽编排预设 */
  OAT_STUDIO_PRESETS: 'HOOKSVUE_OAT_STUDIO_PRESETS',
  /** BOSS 直聘页面最近选择城市 */
  BOSS_SELECTED_CITY: 'HOOKSVUE_BOSS_SELECTED_CITY_V2',
  /** 独立页面收藏记录 */
  PAGE_FAVORITES: 'HOOKSVUE_PAGE_FAVORITES_V1',
  /** 记录缓存展示页卡片收藏 */
  RECORD_CACHE_FAVORITES: 'HOOKSVUE_RECORD_CACHE_FAVORITES_V1',
  /** 页面列表内容项收藏记录 */
  CONTENT_ITEM_FAVORITES: 'HOOKSVUE_CONTENT_ITEM_FAVORITES_V1',
  /** 页面与列表项分享点击记录 */
  SHARE_RECORDS: 'HOOKSVUE_SHARE_RECORDS_V1'
} as const

export type StorageKeyType = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS] | string
