/**
 * API URL 解析器
 * 开发环境: 使用 Vite proxy 代理路径 (如 /api-juejin)
 * 生产环境: 直接使用真实 API 地址 (如 https://api.juejin.cn)
 */

const isProd: boolean = import.meta.env.PROD

/** 代理路径 -> 真实 API 地址 映射表 */
const PROXY_MAP: Record<string, string> = {
  '/api-juejin': 'https://api.juejin.cn',
  '/api-uapis': 'https://uapis.cn',
  '/api-aa1': 'https://v.api.aa1.cn',
  '/api-helloworld': 'https://www.helloworld.net',
  '/api-ithome': 'https://m.ithome.com',
  '/api-news': 'https://ai-bot.cn/daily-ai-news/',
  '/api-app-store': 'https://ai-bot.cn/ai-app-store/',
  '/api-tutorials': 'https://ai-bot.cn/ai-tutorials/',
  '/api-qa': 'https://ai-bot.cn/ai-question-and-answer/',
  '/api-encyclopedia': 'https://ai-bot.cn/ai-encyclopedia/',
  '/api-hall-of-fame': 'https://ai-bot.cn/ai-hall-of-fame/',
  '/api-home': 'https://ai-bot.cn'
}

/**
 * 解析 API URL
 * @param url - 可以是代理路径 (如 /api-juejin/xxx) 或完整 URL
 * @returns 解析后的真实 URL
 *
 * @example
 * resolveApiUrl('/api-juejin/recommend_api/v1/article/recommend_cate_feed')
 * // 开发: '/api-juejin/recommend_api/v1/article/recommend_cate_feed'
 * // 生产: 'https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed'
 */
export function resolveApiUrl(url: string): string {
  if (!isProd) return url

  for (const [proxy, target] of Object.entries(PROXY_MAP)) {
    if (url.startsWith(proxy)) {
      return url.replace(proxy, target)
    }
  }

  return url
}
