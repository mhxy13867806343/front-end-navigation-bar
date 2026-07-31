import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  JUEJIN_API_BASE_URL,
  JUEJIN_CLUB_CATEGORIES,
  JUEJIN_CLUB_SEARCH_KEYWORDS
} from '../src/constants/juejin.ts'
import { JUEJIN_CLUBS_CACHE_FILE, LIVE_DATA_DIR } from '../src/constants/liveData.ts'

interface CacheEntry<TData> {
  updatedAt: string
  ok: boolean
  data: TData | null
  error?: string
}

interface JuejinClubsResponse {
  err_no: number
  err_msg: string
  data: unknown[]
  cursor: string
  has_more: boolean
}

interface JuejinClubsCategory {
  label: string
  value: string
}

interface JuejinClubsCache {
  generatedAt: string
  recommended: CacheEntry<JuejinClubsResponse>
  all: CacheEntry<JuejinClubsResponse>
  categories: Record<string, CacheEntry<JuejinClubsResponse>>
  searches: Record<string, CacheEntry<JuejinClubsResponse>>
}

interface JsonRequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
}

const __filename: string = fileURLToPath(import.meta.url)
const __dirname: string = path.dirname(__filename)
const projectRoot: string = path.resolve(__dirname, '..')
const publicCachePath: string = path.join(projectRoot, 'public', LIVE_DATA_DIR, JUEJIN_CLUBS_CACHE_FILE)
const categoryTabs: JuejinClubsCategory[] = [...JUEJIN_CLUB_CATEGORIES]
const searchKeywords: string[] = [...JUEJIN_CLUB_SEARCH_KEYWORDS]

function createEmptyCache(): JuejinClubsCache {
  return {
    generatedAt: '',
    recommended: {
      updatedAt: '',
      ok: false,
      data: null
    },
    all: {
      updatedAt: '',
      ok: false,
      data: null
    },
    categories: {},
    searches: {}
  }
}

async function readExistingCache(): Promise<JuejinClubsCache> {
  try {
    const raw: string = await readFile(publicCachePath, 'utf8')
    return JSON.parse(raw) as JuejinClubsCache
  } catch {
    return createEmptyCache()
  }
}

async function fetchJson<TData>(url: string, options: JsonRequestOptions = {}): Promise<TData> {
  const response: Response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Referer: 'https://juejin.cn/pin/clubs',
      Origin: 'https://juejin.cn',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
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
    console.log(`[juejin-clubs-cache] ${label} ok`)
    return {
      updatedAt: new Date().toISOString(),
      ok: true,
      data
    }
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : String(error)
    console.warn(`[juejin-clubs-cache] ${label} failed: ${message}`)

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

async function buildCache(previousCache: JuejinClubsCache): Promise<JuejinClubsCache> {
  const nextCache: JuejinClubsCache = {
    generatedAt: new Date().toISOString(),
    recommended: await refreshEntry(
      'topic-list recommended',
      previousCache.recommended,
      (): Promise<JuejinClubsResponse> => {
        return fetchJson(`${JUEJIN_API_BASE_URL}/tag_api/v1/topic/list_by_rec`, {
          method: 'POST',
          body: {
            cursor: '0',
            limit: 20
          }
        })
      }
    ),
    all: await refreshEntry(
      'topic-list all',
      previousCache.all,
      (): Promise<JuejinClubsResponse> => {
        return fetchJson(`${JUEJIN_API_BASE_URL}/tag_api/v1/query_topic_list`, {
          method: 'POST',
          body: {
            cursor: '0',
            limit: 120
          }
        })
      }
    ),
    categories: {},
    searches: {}
  }

  for (const category of categoryTabs) {
    nextCache.categories[category.value] = await refreshEntry(
      `topic-category ${category.label}`,
      previousCache.categories[category.value],
      (): Promise<JuejinClubsResponse> => {
        return fetchJson(`${JUEJIN_API_BASE_URL}/tag_api/v1/topic/list_by_cate_cursor`, {
          method: 'POST',
          body: {
            cate_id: category.value,
            cursor: '0',
            limit: 40
          }
        })
      }
    )
  }

  for (const keyword of searchKeywords) {
    nextCache.searches[keyword] = await refreshEntry(
      `topic-search ${keyword}`,
      previousCache.searches[keyword],
      (): Promise<JuejinClubsResponse> => {
        return fetchJson(`${JUEJIN_API_BASE_URL}/tag_api/v1/topic/list_by_search_cursor`, {
          method: 'POST',
          body: {
            keyword,
            cursor: '0',
            limit: 40
          }
        })
      }
    )
  }

  return nextCache
}

async function writeJson(filePath: string, value: JuejinClubsCache): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const previousCache: JuejinClubsCache = await readExistingCache()
const nextCache: JuejinClubsCache = await buildCache(previousCache)

await writeJson(publicCachePath, nextCache)
console.log(`[juejin-clubs-cache] wrote ${path.relative(projectRoot, publicCachePath)}`)
