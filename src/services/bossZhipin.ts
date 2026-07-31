import {
  BOSS_CITY_API,
  BOSS_CITY_GROUP_API,
  BOSS_INDUSTRY_API,
  BOSS_JOB_LIST_API,
  BOSS_POSITION_API
} from '@/constants/bossZhipin'
import { BOSS_CITY_CACHE_FILE, buildLiveDataFallbackPath, buildLiveDataUrl } from '@/constants/liveData'
import type {
  BossCityCache,
  BossCityGroupResponse,
  BossCityResponse,
  BossJobListResponse,
  BossOptionResponse
} from '@/types/bossZhipin'
import { readJsonCache } from '@/utils/liveDataCache'
import { requestJson } from '@/utils/request'

export const bossCityCacheUrl = buildLiveDataUrl(BOSS_CITY_CACHE_FILE)

export async function fetchBossCityCache(): Promise<BossCityCache> {
  return readJsonCache<BossCityCache>({
    primaryUrl: bossCityCacheUrl,
    fallbackPath: buildLiveDataFallbackPath(BOSS_CITY_CACHE_FILE),
    label: 'BOSS 城市快照',
    validate: (cache: BossCityCache): boolean => Boolean(cache.hotCities || cache.cityGroups || cache.positions || cache.industries)
  })
}

export async function fetchBossCityEndpoints(): Promise<[BossCityResponse, BossCityGroupResponse]> {
  return Promise.all([
    requestJson<BossCityResponse>(BOSS_CITY_API),
    requestJson<BossCityGroupResponse>(BOSS_CITY_GROUP_API)
  ])
}

export async function fetchBossMetaEndpoints(): Promise<[BossOptionResponse, BossOptionResponse]> {
  return Promise.all([
    requestJson<BossOptionResponse>(BOSS_POSITION_API),
    requestJson<BossOptionResponse>(BOSS_INDUSTRY_API)
  ])
}

export async function fetchBossJobList(options: {
  cityCode: number | string
  query: string
  positionCode?: number | string
  industryCode?: number | string
  sortType?: string
  page?: number
  pageSize?: number
}): Promise<BossJobListResponse> {
  const params = new URLSearchParams({
    scene: '1',
    query: options.query,
    city: String(options.cityCode),
    page: String(options.page || 1),
    pageSize: String(options.pageSize || 10)
  })

  if (options.positionCode) params.set('position', String(options.positionCode))
  if (options.industryCode) params.set('industry', String(options.industryCode))
  if (options.sortType) params.set('sortType', options.sortType)

  return requestJson<BossJobListResponse>(`${BOSS_JOB_LIST_API}?${params.toString()}`)
}
