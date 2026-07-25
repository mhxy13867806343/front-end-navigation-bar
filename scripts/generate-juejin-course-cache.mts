import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

interface CacheEntry<TData> {
  updatedAt: string
  ok: boolean
  data: TData | null
  error?: string
}

interface JuejinCourseCategory {
  category_id: string
  category_name: string
}

interface JuejinCourseCategoryResponse {
  err_no: number
  err_msg: string
  data: JuejinCourseCategory[]
}

interface JuejinCourseResponse {
  err_no: number
  err_msg: string
  data: unknown[]
  cursor: string
  has_more: boolean
}

interface JuejinCourseCache {
  generatedAt: string
  categories: CacheEntry<JuejinCourseCategoryResponse>
  courseLists: Record<string, CacheEntry<JuejinCourseResponse>>
}

interface JsonRequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
}

const __filename: string = fileURLToPath(import.meta.url)
const __dirname: string = path.dirname(__filename)
const projectRoot: string = path.resolve(__dirname, '..')
const publicCachePath: string = path.join(projectRoot, 'public', 'live-data', 'juejin-course-cache.json')
const juejinApiBase: string = 'https://api.juejin.cn'
const sortValues: number[] = [10, 1, 7, 8, 9]
const vipValues: number[] = [0, 1]
const fallbackCourseCategories: JuejinCourseCategory[] = [
  { category_id: '6809637769959178254', category_name: '后端' },
  { category_id: '6809637767543259144', category_name: '前端' },
  { category_id: '6809635626879549454', category_name: 'Android' },
  { category_id: '6809635626661445640', category_name: 'iOS' },
  { category_id: '6809637773935378440', category_name: '人工智能' },
  { category_id: '6809637771511070734', category_name: '开发工具' },
  { category_id: '6809637776263217160', category_name: '代码人生' },
  { category_id: '6809637772874219534', category_name: '阅读' }
]

function createEmptyCache(): JuejinCourseCache {
  return {
    generatedAt: '',
    categories: {
      updatedAt: '',
      ok: false,
      data: null
    },
    courseLists: {}
  }
}

async function readExistingCache(): Promise<JuejinCourseCache> {
  try {
    const raw: string = await readFile(publicCachePath, 'utf8')
    return JSON.parse(raw) as JuejinCourseCache
  } catch {
    return createEmptyCache()
  }
}

function courseCacheKey(categoryId: string, sort: number, isVip: number): string {
  return `${categoryId}:${sort}:${isVip}`
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
    console.log(`[juejin-course-cache] ${label} ok`)
    return {
      updatedAt: new Date().toISOString(),
      ok: true,
      data
    }
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : String(error)
    console.warn(`[juejin-course-cache] ${label} failed: ${message}`)

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

async function buildCache(previousCache: JuejinCourseCache): Promise<JuejinCourseCache> {
  const categories: CacheEntry<JuejinCourseCategoryResponse> = await refreshEntry(
    'categories',
    previousCache.categories,
    (): Promise<JuejinCourseCategoryResponse> => {
      return fetchJson(`${juejinApiBase}/tag_api/v1/query_category_briefs?show_type=1`)
    }
  )
  const categoryList: JuejinCourseCategory[] = categories.data?.data?.length
    ? categories.data.data
    : fallbackCourseCategories
  const categoryIds: string[] = ['0', ...categoryList.map((category: JuejinCourseCategory): string => category.category_id)]
  const nextCache: JuejinCourseCache = {
    generatedAt: new Date().toISOString(),
    categories,
    courseLists: {}
  }

  for (const categoryId of categoryIds) {
    for (const sort of sortValues) {
      for (const isVip of vipValues) {
        const key: string = courseCacheKey(categoryId, sort, isVip)
        nextCache.courseLists[key] = await refreshEntry(
          `course-list ${key}`,
          previousCache.courseLists[key],
          (): Promise<JuejinCourseResponse> => {
            return fetchJson(`${juejinApiBase}/booklet_api/v1/booklet/listbycategory`, {
              method: 'POST',
              body: {
                category_id: categoryId,
                cursor: '0',
                sort,
                is_vip: isVip,
                limit: 20
              }
            })
          }
        )
      }
    }
  }

  return nextCache
}

async function writeJson(filePath: string, value: JuejinCourseCache): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const previousCache: JuejinCourseCache = await readExistingCache()
const nextCache: JuejinCourseCache = await buildCache(previousCache)

await writeJson(publicCachePath, nextCache)
console.log(`[juejin-course-cache] wrote ${path.relative(projectRoot, publicCachePath)}`)
