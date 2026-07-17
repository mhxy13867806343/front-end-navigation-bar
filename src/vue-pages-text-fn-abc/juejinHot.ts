export const JUEJIN_DEV_API_BASE: string = '/api-juejin'
export const JUEJIN_REMOTE_API_BASE: string = 'https://api.juejin.cn'
export const JUEJIN_API_BASE: string = import.meta.env.PROD ? JUEJIN_REMOTE_API_BASE : JUEJIN_DEV_API_BASE

export type JuejinArticleRankType = 'hot' | 'collect'
export type JuejinHotListType = 'articles' | 'columns' | 'collections' | 'authors' | 'collected-articles'
export type JuejinCategoryMode = 'article' | 'author' | 'none'
export type JuejinAuthorRankType = 1 | 2

export interface JuejinHotCategory {
  label: string
  value: string
}

export interface JuejinAuthorRankOption {
  label: string
  value: JuejinAuthorRankType
}

export interface JuejinHotNavItem {
  key: JuejinHotListType
  title: string
  icon: string
  categoryMode: JuejinCategoryMode
  rankType?: JuejinArticleRankType
  children?: JuejinHotCategory[]
}

export interface JuejinColumnRankBody {
  page_size: number
  cursor: string
  sort_type: number
}

export interface JuejinCollectionRankBody {
  limit: number
  module_type: number
  cursor: string
  sort_type: number
  filter: {
    article_info: boolean
  }
}

export interface JuejinAuthorRankBody {
  item_rank_type: JuejinAuthorRankType
  item_sub_rank_type: string
}

export const JUEJIN_HOT_CATEGORY_OPTIONS: JuejinHotCategory[] = [
  { label: '综合', value: '1' },
  { label: '前端', value: '6809637767543259144' },
  { label: '后端', value: '6809637769959178254' },
  { label: '客户端', value: '6809635626879549454' },
  { label: '人工智能', value: '6809637773935378440' },
  { label: '开发工具', value: '6809637771511070734' },
  { label: '代码人生', value: '6809637776263217160' },
  { label: '阅读', value: '6809637772874219534' }
]

export const JUEJIN_HOT_AUTHOR_CATEGORY_OPTIONS: JuejinHotCategory[] = JUEJIN_HOT_CATEGORY_OPTIONS.slice(1)

export const JUEJIN_AUTHOR_RANK_OPTIONS: JuejinAuthorRankOption[] = [
  { label: '作者周榜', value: 1 },
  { label: '作者月榜', value: 2 }
]

export const JUEJIN_HOT_SIDE_NAV: JuejinHotNavItem[] = [
  {
    key: 'articles',
    title: '掘金文章榜',
    icon: '▣',
    categoryMode: 'article',
    rankType: 'hot',
    children: JUEJIN_HOT_CATEGORY_OPTIONS
  },
  {
    key: 'columns',
    title: '精选专栏榜',
    icon: '▤',
    categoryMode: 'none'
  },
  {
    key: 'collections',
    title: '推荐收藏集',
    icon: '▥',
    categoryMode: 'none'
  },
  {
    key: 'authors',
    title: '优质作者榜',
    icon: '●',
    categoryMode: 'author',
    children: JUEJIN_HOT_AUTHOR_CATEGORY_OPTIONS
  },
  {
    key: 'collected-articles',
    title: '文章收藏榜',
    icon: '★',
    categoryMode: 'article',
    rankType: 'collect',
    children: JUEJIN_HOT_CATEGORY_OPTIONS
  }
]

export function buildJuejinArticleRankUrl(categoryId: string, rankType: JuejinArticleRankType): string {
  const searchParams: URLSearchParams = new URLSearchParams({
    category_id: categoryId,
    type: rankType
  })

  return `${JUEJIN_API_BASE}/content_api/v1/content/article_rank?${searchParams.toString()}`
}

export function buildJuejinColumnRankUrl(): string {
  return `${JUEJIN_API_BASE}/content_api/v1/column/selected_rank`
}

export function buildJuejinCollectionRankUrl(): string {
  return `${JUEJIN_API_BASE}/interact_api/v2/collectionset/collection_recommend_rank`
}

export function buildJuejinAuthorRankUrl(): string {
  return `${JUEJIN_API_BASE}/user_api/v1/quality_user/rank`
}

export function buildJuejinColumnRankBody(cursor: string = ''): JuejinColumnRankBody {
  return {
    page_size: 30,
    cursor,
    sort_type: 2
  }
}

export function buildJuejinCollectionRankBody(cursor: string = ''): JuejinCollectionRankBody {
  return {
    limit: 30,
    module_type: 0,
    cursor,
    sort_type: 2,
    filter: {
      article_info: true
    }
  }
}

export function buildJuejinAuthorRankBody(
  categoryId: string,
  rankType: JuejinAuthorRankType
): JuejinAuthorRankBody {
  return {
    item_rank_type: rankType,
    item_sub_rank_type: categoryId
  }
}
