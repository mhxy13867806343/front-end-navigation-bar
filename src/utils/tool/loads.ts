/**
 * 解析与加载相关工具函数
 */

/**
 * 安全解析 JSON 字符串
 * @param {string} str - 待解析 JSON 字符串
 * @param {any} defaultVal - 解析失败时的默认返回值
 * @returns {any} 解析后的结果
 */
export function safeParseJson<T = unknown>(str: string, defaultVal: T = {} as T): T {
  try {
    return JSON.parse(str) as T
  } catch (_e: unknown) {
    return defaultVal
  }
}

/**
 * 解析 URL 查询参数
 * @param {string} urlStr - 完整的 URL 地址或 Query 字符串
 * @returns {Object} 解析出来的键值对参数对象
 */
export function parseQueryString(urlStr: string): Record<string, string> {
  if (!urlStr) return {}
  try {
    const searchPart: string = urlStr.includes('?') ? urlStr.split('?')[1] || '' : urlStr
    const pairs: string[] = searchPart.split('&')
    const result: Record<string, string> = {}
    pairs.forEach((pair: string): void => {
      const [key, val]: string[] = pair.split('=')
      if (key) {
        result[decodeURIComponent(key)] = decodeURIComponent(val || '')
      }
    })
    return result
  } catch (e: unknown) {
    const message: string = e instanceof Error ? e.message : String(e)
    throw new Error(`查询参数解析错误: ${message}`)
  }
}

/**
 * 分解解析完整的 URL
 * @param {string} urlStr - 目标 URL 字符串
 * @returns {Object} 包含协议、主机名、路径、查询参数、哈希值的分解对象
 */
interface ParsedUrl {
  href?: string
  protocol: string
  host: string
  hostname?: string
  port?: string
  pathname: string
  search: string
  hash: string
  origin?: string
}

export function parseUrl(urlStr: string): ParsedUrl {
  if (!urlStr) throw new Error('URL 不能为空')
  try {
    const url: URL = new URL(urlStr)
    return {
      href: url.href,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      origin: url.origin
    }
  } catch (_e: unknown) {
    // Fallback parser if not full URL
    const match: RegExpMatchArray | null = urlStr.match(/^(https?:)\/\/([^\/?#]+)([^?#]*)([^#]*)(.*)$/)
    if (match) {
      return {
        protocol: match[1],
        host: match[2],
        pathname: match[3],
        search: match[4],
        hash: match[5]
      }
    }
    throw new Error('不合法的 URL 地址')
  }
}
