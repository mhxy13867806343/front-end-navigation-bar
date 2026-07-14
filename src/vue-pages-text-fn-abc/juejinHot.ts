export const JUEJIN_API_BASE: string = '/api-juejin'

export type JuejinArticleRankType = 'hot' | 'collect'

export interface JuejinHotCategory {
  label: string
  value: string
}

export interface JuejinHotNavItem {
  key: string
  title: string
  icon: string
  supported: boolean
  rankType?: JuejinArticleRankType
  children?: JuejinHotCategory[]
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

export const JUEJIN_HOT_SIDE_NAV: JuejinHotNavItem[] = [
  {
    key: 'articles',
    title: '掘金文章榜',
    icon: '▣',
    supported: true,
    rankType: 'hot',
    children: JUEJIN_HOT_CATEGORY_OPTIONS
  },
  {
    key: 'columns',
    title: '精选专栏榜',
    icon: '▤',
    supported: false
  },
  {
    key: 'collections',
    title: '推荐收藏集',
    icon: '▥',
    supported: false
  },
  {
    key: 'authors',
    title: '优质作者榜',
    icon: '●',
    supported: false,
    children: JUEJIN_HOT_CATEGORY_OPTIONS.slice(1)
  },
  {
    key: 'collected-articles',
    title: '文章收藏榜',
    icon: '★',
    supported: true,
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
