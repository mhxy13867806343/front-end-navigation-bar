import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BOSS_API_PATHS,
  BOSS_HOME_URL,
  BOSS_SITE_BASE_URL
} from '../src/constants/bossZhipin.ts'
import { BOSS_CITY_CACHE_FILE, LIVE_DATA_DIR } from '../src/constants/liveData.ts'

interface CacheEntry<TData> {
  updatedAt: string
  ok: boolean
  data: TData | null
  error?: string
}

interface BossCity {
  code: number
  name: string
  cityCode?: string
  regionCode?: number
  centerGeo?: string | null
}

interface BossCityGroup {
  firstChar: string
  cityList: BossCity[]
}

interface BossCityResponse {
  code: number
  message: string
  zpData: {
    hotCityList?: BossCity[]
    cityList?: BossCity[]
    locationCity?: BossCity
  }
}

interface BossCityGroupResponse {
  code: number
  message: string
  zpData: {
    cityGroup?: BossCityGroup[]
  }
}

interface BossOptionNode {
  code: number
  name: string
  subLevelModelList?: BossOptionNode[] | null
}

interface BossOptionResponse {
  code: number
  message: string
  zpData: BossOptionNode[]
}

interface BossCityCache {
  generatedAt: string
  hotCities: CacheEntry<BossCityResponse>
  cityGroups: CacheEntry<BossCityGroupResponse>
  positions: CacheEntry<BossOptionResponse>
  industries: CacheEntry<BossOptionResponse>
}

const __filename: string = fileURLToPath(import.meta.url)
const __dirname: string = path.dirname(__filename)
const projectRoot: string = path.resolve(__dirname, '..')
const publicCachePath: string = path.join(projectRoot, 'public', LIVE_DATA_DIR, BOSS_CITY_CACHE_FILE)

function createEmptyCache(): BossCityCache {
  return {
    generatedAt: '',
    hotCities: {
      updatedAt: '',
      ok: false,
      data: null
    },
    cityGroups: {
      updatedAt: '',
      ok: false,
      data: null
    },
    positions: {
      updatedAt: '',
      ok: false,
      data: null
    },
    industries: {
      updatedAt: '',
      ok: false,
      data: null
    }
  }
}

async function readExistingCache(): Promise<BossCityCache> {
  try {
    const raw: string = await readFile(publicCachePath, 'utf8')
    return JSON.parse(raw) as BossCityCache
  } catch {
    return createEmptyCache()
  }
}

async function fetchJson<TData>(url: string): Promise<TData> {
  const response: Response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Referer: BOSS_HOME_URL,
      Origin: BOSS_SITE_BASE_URL,
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json() as Promise<TData>
}

async function refreshEntry<TData>(
  label: string,
  previousEntry: CacheEntry<TData> | undefined,
  task: () => Promise<TData>
): Promise<CacheEntry<TData>> {
  try {
    const data: TData = await task()
    console.log(`[boss-city-cache] ${label} ok`)
    return {
      updatedAt: new Date().toISOString(),
      ok: true,
      data
    }
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : String(error)
    console.warn(`[boss-city-cache] ${label} failed: ${message}`)

    if (previousEntry?.data) {
      return {
        ...previousEntry,
        error: message
      }
    }

    return {
      updatedAt: new Date().toISOString(),
      ok: false,
      data: null,
      error: message
    }
  }
}

async function buildCache(previousCache: BossCityCache): Promise<BossCityCache> {
  return {
    generatedAt: new Date().toISOString(),
    hotCities: await refreshEntry(
      'city hot list',
      previousCache.hotCities,
      (): Promise<BossCityResponse> => fetchJson(`${BOSS_SITE_BASE_URL}${BOSS_API_PATHS.city}`)
    ),
    cityGroups: await refreshEntry(
      'city alphabet groups',
      previousCache.cityGroups,
      (): Promise<BossCityGroupResponse> => fetchJson(`${BOSS_SITE_BASE_URL}${BOSS_API_PATHS.cityGroup}`)
    ),
    positions: await refreshEntry(
      'position category tree',
      previousCache.positions,
      (): Promise<BossOptionResponse> => fetchJson(`${BOSS_SITE_BASE_URL}${BOSS_API_PATHS.position}`)
    ),
    industries: await refreshEntry(
      'industry category tree',
      previousCache.industries,
      (): Promise<BossOptionResponse> => fetchJson(`${BOSS_SITE_BASE_URL}${BOSS_API_PATHS.industry}`)
    )
  }
}

async function writeJson(filePath: string, value: BossCityCache): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const previousCache: BossCityCache = await readExistingCache()
const nextCache: BossCityCache = await buildCache(previousCache)

await writeJson(publicCachePath, nextCache)
console.log(`[boss-city-cache] wrote ${path.relative(projectRoot, publicCachePath)}`)
