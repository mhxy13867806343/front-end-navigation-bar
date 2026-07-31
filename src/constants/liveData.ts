export const LIVE_DATA_DIR = 'live-data'

export const BOSS_CITY_CACHE_FILE = 'boss-city-cache.json'
export const JUEJIN_COURSE_CACHE_FILE = 'juejin-course-cache.json'
export const JUEJIN_CLUBS_CACHE_FILE = 'juejin-clubs-cache.json'
export const JUEJIN_RANK_CACHE_FILE = 'juejin-rank-cache.json'

export function buildLiveDataUrl(fileName: string): string {
  const baseUrl = import.meta.env.BASE_URL || '/'
  return `${baseUrl}${LIVE_DATA_DIR}/${fileName}`
}

export function buildLiveDataFallbackPath(fileName: string): string {
  return `/${LIVE_DATA_DIR}/${fileName}`
}
