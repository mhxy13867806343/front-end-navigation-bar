import type { ProxyOptions } from 'vite'

type ProxyHeaders = Record<string, string>
type ServerProxyMap = Record<string, ProxyOptions>

const browserUserAgent: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const defaultHeaders: ProxyHeaders = {
  'User-Agent': browserUserAgent
}

const aiBotRoutes: Array<[string, string]> = [
  ['/api-news', 'https://ai-bot.cn/daily-ai-news/'],
  ['/api-app-store', 'https://ai-bot.cn/ai-app-store/'],
  ['/api-tutorials', 'https://ai-bot.cn/ai-tutorials/'],
  ['/api-qa', 'https://ai-bot.cn/ai-question-and-answer/'],
  ['/api-encyclopedia', 'https://ai-bot.cn/ai-encyclopedia/'],
  ['/api-hall-of-fame', 'https://ai-bot.cn/ai-hall-of-fame/']
]

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function createProxyEntry(context: string, target: string, headers: ProxyHeaders = {}): ProxyOptions {
  const contextPattern: RegExp = new RegExp(`^${escapeRegExp(context)}`)

  return {
    target,
    changeOrigin: true,
    headers: {
      ...defaultHeaders,
      ...headers
    },
    rewrite: (path: string): string => path.replace(contextPattern, '')
  }
}

export const serverProxy: ServerProxyMap = {
  ...Object.fromEntries(
    aiBotRoutes.map(([context, target]) => [
      context,
      createProxyEntry(context, target)
    ])
  ),
  '/api-juejin': createProxyEntry('/api-juejin', 'https://api.juejin.cn', {
    Origin: 'https://juejin.cn',
    Referer: 'https://juejin.cn/'
  }),
  '/api-uapis': createProxyEntry('/api-uapis', 'https://uapis.cn', {
    Origin: 'https://uapis.cn',
    Referer: 'https://uapis.cn/'
  }),
  '/api-alapi': createProxyEntry('/api-alapi', 'https://v3.alapi.cn', {
    Origin: 'https://v3.alapi.cn',
    Referer: 'https://v3.alapi.cn/'
  }),
  '/api-aa1': createProxyEntry('/api-aa1', 'https://v.api.aa1.cn', {
    Origin: 'https://v.api.aa1.cn',
    Referer: 'https://api.aa1.cn/doc/bilibili-rs.html'
  }),
  '/api-ithome': createProxyEntry('/api-ithome', 'https://m.ithome.com', {
    Origin: 'https://m.ithome.com',
    Referer: 'https://m.ithome.com/'
  }),
  '/api-pexels': createProxyEntry('/api-pexels', 'https://api.pexels.com', {
    Origin: 'https://www.pexels.com',
    Referer: 'https://www.pexels.com/'
  }),
  '/api-pokeapi': createProxyEntry('/api-pokeapi', 'https://pokeapi.co', {
    Origin: 'https://pokeapi.co',
    Referer: 'https://pokeapi.co/'
  }),
  '/api-tilvids': createProxyEntry('/api-tilvids', 'https://tilvids.com', {
    Origin: 'https://tilvids.com',
    Referer: 'https://tilvids.com/'
  }),
  '/api-invidious': createProxyEntry('/api-invidious', 'https://inv.zoomerville.com', {
    Origin: 'https://inv.zoomerville.com',
    Referer: 'https://inv.zoomerville.com/'
  }),
  '/api-freetogame': createProxyEntry('/api-freetogame', 'https://www.freetogame.com', {
    Origin: 'https://www.freetogame.com',
    Referer: 'https://www.freetogame.com/'
  }),
  '/api-gamerpower': createProxyEntry('/api-gamerpower', 'https://www.gamerpower.com', {
    Origin: 'https://www.gamerpower.com',
    Referer: 'https://www.gamerpower.com/'
  }),
  '/api-cheapshark': createProxyEntry('/api-cheapshark', 'https://www.cheapshark.com', {
    Origin: 'https://www.cheapshark.com',
    Referer: 'https://www.cheapshark.com/'
  }),
  '/api-taobao-suggest': createProxyEntry('/api-taobao-suggest', 'https://suggest.taobao.com', {
    Referer: 'https://www.taobao.com/'
  }),
  '/api-kuaidi100': createProxyEntry('/api-kuaidi100', 'https://www.kuaidi100.com', {
    Referer: 'https://www.kuaidi100.com/'
  }),
  '/api-google-ajax': createProxyEntry('/api-google-ajax', 'https://ajax.googleapis.com', {
    Referer: 'https://developers.google.com/'
  }),
  '/api-baidu-baike': createProxyEntry('/api-baidu-baike', 'https://baike.baidu.com', {
    Referer: 'https://baike.baidu.com/'
  }),
  '/api-baidu-map': createProxyEntry('/api-baidu-map', 'https://api.map.baidu.com', {
    Referer: 'https://lbsyun.baidu.com/'
  }),
  '/api-sina-weather': createProxyEntry('/api-sina-weather', 'https://php.weather.sina.com.cn', {
    Referer: 'https://weather.sina.com.cn/'
  }),
  '/api-helloworld': createProxyEntry('/api-helloworld', 'https://www.helloworld.net', {
    Referer: 'https://www.helloworld.net/'
  })
}
