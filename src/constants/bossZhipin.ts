export const BOSS_SITE_BASE_URL = 'https://www.zhipin.com'
export const BOSS_PROXY_PREFIX = '/api-boss'

export const BOSS_HOME_URL = `${BOSS_SITE_BASE_URL}/hangzhou/?ka=header-home`
export const BOSS_RECRUITER_URL = `${BOSS_SITE_BASE_URL}/web/user/?intent=1`
export const BOSS_CAMPUS_URL = `${BOSS_SITE_BASE_URL}/xiaoyuan/`
export const BOSS_OVERSEAS_URL = `${BOSS_SITE_BASE_URL}/overseas/`
export const BOSS_APP_URL = `${BOSS_SITE_BASE_URL}/d/v2/`
export const BOSS_ARTICLE_URL = `${BOSS_SITE_BASE_URL}/article/`
export const BOSS_YOULE_URL = 'https://youle.zhipin.com/'

export const BOSS_DEFAULT_CITY = {
  code: 100010000,
  name: '全国',
  cityCode: ''
} as const

export const BOSS_HANGZHOU_CITY = {
  code: 101210100,
  name: '杭州',
  cityCode: '0571'
} as const

export const BOSS_API_PATHS = {
  city: '/wapi/zpCommon/data/city.json',
  cityGroup: '/wapi/zpCommon/data/cityGroup.json',
  position: '/wapi/zpCommon/data/position.json',
  industry: '/wapi/zpCommon/data/industry.json',
  jobList: '/wapi/zpgeek/search/joblist.json'
} as const

export const BOSS_CITY_API = `${BOSS_PROXY_PREFIX}${BOSS_API_PATHS.city}`
export const BOSS_CITY_GROUP_API = `${BOSS_PROXY_PREFIX}${BOSS_API_PATHS.cityGroup}`
export const BOSS_POSITION_API = `${BOSS_PROXY_PREFIX}${BOSS_API_PATHS.position}`
export const BOSS_INDUSTRY_API = `${BOSS_PROXY_PREFIX}${BOSS_API_PATHS.industry}`
export const BOSS_JOB_LIST_API = `${BOSS_PROXY_PREFIX}${BOSS_API_PATHS.jobList}`

export const BOSS_MAP_URL = buildBossMapUrl({
  cityCode: BOSS_HANGZHOU_CITY.code
})

export function buildBossUrl(path: string): string {
  return `${BOSS_SITE_BASE_URL}${path}`
}

export function buildBossCityJobsUrl(cityCode: number | string): string {
  return buildBossUrl(`/c${cityCode}/`)
}

export function buildBossCompanyListUrl(cityCode: number | string): string {
  return buildBossUrl(`/gongsi/_zzz_c${cityCode}/`)
}

export function buildBossOfficialHomeUrl(cityCode: number | string): string {
  if (String(cityCode) === String(BOSS_HANGZHOU_CITY.code)) return BOSS_HOME_URL
  if (String(cityCode) === String(BOSS_DEFAULT_CITY.code)) return `${BOSS_SITE_BASE_URL}/?ka=header-home`
  return buildBossUrl(`/chengshi/c${cityCode}/?ka=char_select_city_${cityCode}`)
}

export function buildBossMapUrl(options: {
  cityCode?: number | string
  query?: string
  from?: string
} = {}): string {
  const params = new URLSearchParams({
    query: options.query || '',
    from: options.from || '1',
    city: String(options.cityCode || BOSS_DEFAULT_CITY.code)
  })
  return buildBossUrl(`/web/geek/map/jobs?${params.toString()}`)
}

export function buildBossSearchUrl(cityCode: number | string, keyword: string): string {
  const params = new URLSearchParams({
    query: keyword,
    industry: '',
    position: ''
  })
  return `${buildBossCityJobsUrl(cityCode)}?${params.toString()}`
}

export function buildBossPositionUrl(cityCode: number | string, positionCode: number | string): string {
  return buildBossUrl(`/c${cityCode}-p${positionCode}/`)
}

export function buildBossJobDetailUrl(options: {
  encryptJobId: string
  lid?: string
  securityId?: string
  ka?: string
}): string {
  const params = new URLSearchParams({
    ka: options.ka || 'search_list_jname_1_blank'
  })
  if (options.lid) params.set('lid', options.lid)
  if (options.securityId) params.set('securityId', options.securityId)
  return buildBossUrl(`/job_detail/${options.encryptJobId}.html?${params.toString()}`)
}
