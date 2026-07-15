import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type JuejinArticleRankType = 'hot' | 'collect'
type JuejinAuthorRankType = 1 | 2

interface JuejinHotCategory {
  label: string
  value: string
}

interface CacheEntry<TData> {
  updatedAt: string
  ok: boolean
  data: TData | null
  error?: string
}

interface JuejinRankCache {
  generatedAt: string
  articleRanks: Record<string, CacheEntry<unknown>>
  columnRank: CacheEntry<unknown>
  collectionRank: CacheEntry<unknown>
  authorRanks: Record<string, CacheEntry<unknown>>
}

interface JsonRequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
}

const __filename: string = fileURLToPath(import.meta.url)
const __dirname: string = path.dirname(__filename)
const projectRoot: string = path.resolve(__dirname, '..')
const seedCachePath: string = path.join(projectRoot, 'src', 'ajson', 'juejin-rank-cache.json')
const publicCachePath: string = path.join(projectRoot, 'public', 'live-data', 'juejin-rank-cache.json')
const shouldWriteSeed: boolean = process.argv.includes('--write-seed')
const juejinApiBase: string = 'https://api.juejin.cn'

const categoryOptions: JuejinHotCategory[] = [
  { label: '综合', value: '1' },
  { label: '前端', value: '6809637767543259144' },
  { label: '后端', value: '6809637769959178254' },
  { label: '客户端', value: '6809635626879549454' },
  { label: '人工智能', value: '6809637773935378440' },
  { label: '开发工具', value: '6809637771511070734' },
  { label: '代码人生', value: '6809637776263217160' },
  { label: '阅读', value: '6809637772874219534' }
]

const authorCategoryOptions: JuejinHotCategory[] = categoryOptions.slice(1)
const articleRankTypes: JuejinArticleRankType[] = ['hot', 'collect']
const authorRankTypes: JuejinAuthorRankType[] = [1, 2]

function createEmptyCache(): JuejinRankCache {
  return {
    generatedAt: '',
    articleRanks: {},
    columnRank: {
      updatedAt: '',
      ok: false,
      data: null
    },
    collectionRank: {
      updatedAt: '',
      ok: false,
      data: null
    },
    authorRanks: {}
  }
}

async function readExistingCache(): Promise<JuejinRankCache> {
  try {
    const raw: string = await readFile(seedCachePath, 'utf8')
    return JSON.parse(raw) as JuejinRankCache
  } catch {
    return createEmptyCache()
  }
}

function articleRankKey(categoryId: string, rankType: JuejinArticleRankType): string {
  return `${rankType}:${categoryId}`
}

function authorRankKey(categoryId: string, rankType: JuejinAuthorRankType): string {
  return `${rankType}:${categoryId}`
}

async function fetchJson<TData>(url: string, options: JsonRequestOptions = {}): Promise<TData> {
  const response: Response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Referer: 'https://juejin.cn/',
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
    console.log(`[juejin-cache] ${label} ok`)
    return {
      updatedAt: new Date().toISOString(),
      ok: true,
      data
    }
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : String(error)
    console.warn(`[juejin-cache] ${label} failed: ${message}`)

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

async function buildCache(previousCache: JuejinRankCache): Promise<JuejinRankCache> {
  const nextCache: JuejinRankCache = {
    generatedAt: new Date().toISOString(),
    articleRanks: {},
    columnRank: await refreshEntry('column-rank', previousCache.columnRank, (): Promise<unknown> => {
      return fetchJson(`${juejinApiBase}/content_api/v1/column/selected_rank`, {
        method: 'POST',
        body: {
          page_size: 30,
          cursor: '',
          sort_type: 2
        }
      })
    }),
    collectionRank: await refreshEntry('collection-rank', previousCache.collectionRank, (): Promise<unknown> => {
      return fetchJson(`${juejinApiBase}/interact_api/v2/collectionset/collection_recommend_rank`, {
        method: 'POST',
        body: {
          limit: 30,
          module_type: 0,
          cursor: '',
          sort_type: 2,
          filter: {
            article_info: true
          }
        }
      })
    }),
    authorRanks: {}
  }

  for (const rankType of articleRankTypes) {
    for (const category of categoryOptions) {
      const key: string = articleRankKey(category.value, rankType)
      const searchParams: URLSearchParams = new URLSearchParams({
        category_id: category.value,
        type: rankType
      })
      nextCache.articleRanks[key] = await refreshEntry(
        `article-rank ${key}`,
        previousCache.articleRanks[key],
        (): Promise<unknown> => fetchJson(`${juejinApiBase}/content_api/v1/content/article_rank?${searchParams}`)
      )
    }
  }

  for (const rankType of authorRankTypes) {
    for (const category of authorCategoryOptions) {
      const key: string = authorRankKey(category.value, rankType)
      nextCache.authorRanks[key] = await refreshEntry(
        `author-rank ${key}`,
        previousCache.authorRanks[key],
        (): Promise<unknown> => {
          return fetchJson(`${juejinApiBase}/user_api/v1/quality_user/rank`, {
            method: 'POST',
            body: {
              item_rank_type: rankType,
              item_sub_rank_type: category.value
            }
          })
        }
      )
    }
  }

  return nextCache
}

async function writeJson(filePath: string, value: JuejinRankCache): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const previousCache: JuejinRankCache = await readExistingCache()
const nextCache: JuejinRankCache = await buildCache(previousCache)

await writeJson(publicCachePath, nextCache)
console.log(`[juejin-cache] wrote ${path.relative(projectRoot, publicCachePath)}`)

if (shouldWriteSeed) {
  await writeJson(seedCachePath, nextCache)
  console.log(`[juejin-cache] wrote ${path.relative(projectRoot, seedCachePath)}`)
}
