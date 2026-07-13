/**
 * 解析与加载相关工具函数
 */

/**
 * 安全解析 JSON 字符串
 * @param {string} str - 待解析 JSON 字符串
 * @param {any} defaultVal - 解析失败时的默认返回值
 * @returns {any} 解析后的结果
 */
export function safeParseJson(str, defaultVal = {}) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return defaultVal
  }
}

/**
 * 解析 URL 查询参数
 * @param {string} urlStr - 完整的 URL 地址或 Query 字符串
 * @returns {Object} 解析出来的键值对参数对象
 */
export function parseQueryString(urlStr) {
  if (!urlStr) return {}
  try {
    const searchPart = urlStr.includes('?') ? urlStr.split('?')[1] : urlStr
    const pairs = searchPart.split('&')
    const result = {}
    pairs.forEach(pair => {
      const [key, val] = pair.split('=')
      if (key) {
        result[decodeURIComponent(key)] = decodeURIComponent(val || '')
      }
    })
    return result
  } catch (e) {
    throw new Error(`查询参数解析错误: ${e.message}`)
  }
}

/**
 * 分解解析完整的 URL
 * @param {string} urlStr - 目标 URL 字符串
 * @returns {Object} 包含协议、主机名、路径、查询参数、哈希值的分解对象
 */
export function parseUrl(urlStr) {
  if (!urlStr) throw new Error('URL 不能为空')
  try {
    const url = new URL(urlStr)
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
  } catch (e) {
    // Fallback parser if not full URL
    const match = urlStr.match(/^(https?:)\/\/([^\/?#]+)([^?#]*)([^#]*)(.*)$/)
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
