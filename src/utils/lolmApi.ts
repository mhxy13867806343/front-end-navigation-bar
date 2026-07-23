import { requestJinaJson } from './jinaReader'
import { resolveApiUrl } from './resolveApiUrl'

const LOLM_RANK_PATH = '/api-lolm/go/lgame_battle_info/hero_rank_list_v2'
const LOLM_HERO_LIST_URL = 'https://game.gtimg.cn/images/lgamem/act/lrlib/js/heroList/hero_list.js'

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
