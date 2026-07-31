import { request } from './request'

interface ReadJsonCacheOptions<TData> {
  primaryUrl: string
  fallbackPath?: string
  label: string
  validate?: (value: TData) => boolean
}

export async function readJsonCache<TData>(options: ReadJsonCacheOptions<TData>): Promise<TData> {
  const candidates = Array.from(new Set([
    options.primaryUrl,
    options.fallbackPath
  ].filter((url): url is string => Boolean(url))))
  const errors: string[] = []

  for (const url of candidates) {
    try {
      const response = await request(url, {
        cache: 'no-cache',
        headers: {
          Accept: 'application/json'
        }
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const text = await response.text()
      const trimmedText = text.trim()
      if (!trimmedText.startsWith('{')) {
        throw new Error(`${options.label}路径返回了页面 HTML，不是 JSON 数据`)
      }

      const value = JSON.parse(trimmedText) as TData
      if (options.validate && !options.validate(value)) {
        throw new Error(`${options.label}结构不完整`)
      }

      return value
    } catch (error: unknown) {
      errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  throw new Error(errors.join('；'))
}
