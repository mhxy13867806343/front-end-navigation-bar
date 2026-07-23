import { requestJinaJson } from './jinaReader'
import { resolveApiUrl } from './resolveApiUrl'

const LOLM_RANK_PATH = '/api-lolm/go/lgame_battle_info/hero_rank_list_v2'
const LOLM_NEWS_PATH = '/api-lolm-news/cmc/cross'
const LOLM_HERO_LIST_URL = 'https://game.gtimg.cn/images/lgamem/act/lrlib/js/heroList/hero_list.js'

export interface LolmNewsRequestParams {
  filter: 'channel' | 'tag'
  chanid?: string
  tagids?: string
  typeids?: string
  withtop?: string
  topMode?: string
  start?: number
  limit?: number
  logic?: string
}

export interface LolmNewsTagInfo {
  id?: number
  parentId?: number
  name?: string
  level?: number
  isLeaf?: number
}

export interface LolmNewsCoverItem {
  size?: string
  url?: string
  urlCI?: string
  type?: string
  id?: number
  imgType?: string
}

export interface LolmNewsRawItem {
  iId?: number
  iNewsId?: number
  iDocID?: string
  iInfoType?: number
  iTotalPlay?: number
  iTopPos?: number
  iVideoId?: number
  iIsRedirect?: number
  sTitle?: string
  sDesc?: string
  sIMG?: string
  sIMGNew?: string
  sTargetIMG?: string
  sCoverMap?: string
  sCoverList?: LolmNewsCoverItem[]
  sTagInfo?: string
  sTagInfoList?: LolmNewsTagInfo[]
  sTagIds?: string
  sSubTypeName?: string
  sTypeName?: string
  sAuthor?: string
  sCreated?: string
  sIdxTime?: string
  sUpdateLocation?: string
  sCreateLocation?: string
  sRedirectURL?: string
  sUrl?: string
  sVID?: string
  sGameVersion?: string
  [key: string]: unknown
}

export interface LolmNewsResponse {
  status: number
  msg?: string
  from?: string
  data?: {
    total?: number
    cache?: number
    items?: LolmNewsRawItem[]
  }
}

export async function requestLolmRankJson<T>(): Promise<T> {
  const url = resolveApiUrl(LOLM_RANK_PATH)

  if (import.meta.env.PROD) {
    return requestJinaJson<T>(url)
  }

  const response = await fetch(url)
  if (!response.ok) throw new Error(`LOLM 榜单请求失败：${response.status}`)
  return response.json() as Promise<T>
}

export async function requestLolmHeroListJson<T>(): Promise<T> {
  const response = await fetch(LOLM_HERO_LIST_URL)
  if (!response.ok) throw new Error(`LOLM 英雄列表请求失败：${response.status}`)
  return response.json() as Promise<T>
}

export async function requestLolmNewsJson(params: LolmNewsRequestParams): Promise<LolmNewsResponse> {
  const query = new URLSearchParams({
    serviceId: '166',
    source: 'web_pc',
    typeids: params.typeids || '1,2',
    logic: params.logic || 'or',
    filter: params.filter
  })

  const optionalParams: Array<[string, string | number | undefined]> = [
    ['chanid', params.chanid],
    ['tagids', params.tagids],
    ['withtop', params.withtop],
    ['topMode', params.topMode],
    ['start', params.start],
    ['limit', params.limit]
  ]

  for (const [key, value] of optionalParams) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value))
    }
  }

  const url = resolveApiUrl(`${LOLM_NEWS_PATH}?${query.toString()}`)

  if (import.meta.env.PROD) {
    return requestJinaJson<LolmNewsResponse>(url)
  }

  const response = await fetch(url)
  if (!response.ok) throw new Error(`LOLM 官方资讯请求失败：${response.status}`)
  return response.json() as Promise<LolmNewsResponse>
}
