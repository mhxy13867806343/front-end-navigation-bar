export const JUEJIN_SITE_BASE_URL = 'https://juejin.cn'
export const JUEJIN_API_BASE_URL = 'https://api.juejin.cn'

export const JUEJIN_COURSE_HOME_URL = `${JUEJIN_SITE_BASE_URL}/course`
export const JUEJIN_CLUB_HOME_URL = `${JUEJIN_SITE_BASE_URL}/pin/clubs`
export const JUEJIN_SIGNIN_URL = `${JUEJIN_SITE_BASE_URL}/user/center/signin?from=sign_in_menu_bar`

export const JUEJIN_COURSE_API = '/api-juejin/booklet_api/v1/booklet/listbycategory'
export const JUEJIN_COURSE_CATEGORY_API = '/api-juejin/tag_api/v1/query_category_briefs?show_type=1'

export const JUEJIN_COURSE_SORT_DEFAULT = 10
export const JUEJIN_COURSE_SORT_LATEST = 1
export const JUEJIN_COURSE_SORT_HOT = 7
export const JUEJIN_COURSE_SORT_PRICE_ASC = 8
export const JUEJIN_COURSE_SORT_PRICE_DESC = 9
export const JUEJIN_COURSE_SORT_VALUES = [
  JUEJIN_COURSE_SORT_DEFAULT,
  JUEJIN_COURSE_SORT_LATEST,
  JUEJIN_COURSE_SORT_HOT,
  JUEJIN_COURSE_SORT_PRICE_ASC,
  JUEJIN_COURSE_SORT_PRICE_DESC
] as const
export const JUEJIN_COURSE_VIP_VALUES = [0, 1] as const

export const JUEJIN_COURSE_FALLBACK_CATEGORIES = [
  { category_id: '6809637769959178254', category_name: '后端' },
  { category_id: '6809637767543259144', category_name: '前端' },
  { category_id: '6809635626879549454', category_name: 'Android' },
  { category_id: '6809635626661445640', category_name: 'iOS' },
  { category_id: '6809637773935378440', category_name: '人工智能' },
  { category_id: '6809637771511070734', category_name: '开发工具' },
  { category_id: '6809637776263217160', category_name: '代码人生' },
  { category_id: '6809637772874219534', category_name: '阅读' }
] as const

export const JUEJIN_CLUB_TOPIC_REC_API = '/api-juejin/tag_api/v1/topic/list_by_rec'
export const JUEJIN_CLUB_TOPIC_ALL_API = '/api-juejin/tag_api/v1/query_topic_list'
export const JUEJIN_CLUB_TOPIC_CATEGORY_API = '/api-juejin/tag_api/v1/topic/list_by_cate_cursor'
export const JUEJIN_CLUB_TOPIC_SEARCH_API = '/api-juejin/tag_api/v1/topic/list_by_search_cursor'

export const JUEJIN_CLUB_CATEGORIES = [
  { label: '技术', value: '7006945368608866340' },
  { label: '互动交流', value: '7006945368617254942' },
  { label: '职场', value: '7006945368634032159' },
  { label: '吃喝玩乐', value: '7006945368646615047' },
  { label: '资讯', value: '7006945368659197965' },
  { label: '理财', value: '7006945368671780878' },
  { label: '书影音', value: '7006945368684380173' },
  { label: '生活', value: '7006945368696946718' },
  { label: '搞笑', value: '7006945368709529607' },
  { label: '许愿池', value: '7006945368717918222' },
  { label: '情感', value: '7006945368730501134' },
  { label: '掘金一下', value: '7006945368743100423' }
] as const

export const JUEJIN_CLUB_SEARCH_KEYWORDS = ['前端', '大模型', '摸鱼', '理财', '情感'] as const

export function buildJuejinBookUrl(bookletId: string): string {
  return `${JUEJIN_SITE_BASE_URL}/book/${bookletId}?utm_source=course_list`
}

export function buildJuejinUserUrl(userId: string): string {
  return `${JUEJIN_SITE_BASE_URL}/user/${userId}`
}

export function buildJuejinClubUrl(topicId?: string): string {
  return topicId ? `${JUEJIN_SITE_BASE_URL}/pin/club/${topicId}` : JUEJIN_CLUB_HOME_URL
}
