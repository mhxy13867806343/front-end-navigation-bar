const browserUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const defaultHeaders = {
  'User-Agent': browserUserAgent
}

const aiBotRoutes = [
  ['/api-news', 'https://ai-bot.cn/daily-ai-news/'],
  ['/api-app-store', 'https://ai-bot.cn/ai-app-store/'],
  ['/api-tutorials', 'https://ai-bot.cn/ai-tutorials/'],
  ['/api-qa', 'https://ai-bot.cn/ai-question-and-answer/'],
  ['/api-encyclopedia', 'https://ai-bot.cn/ai-encyclopedia/'],
  ['/api-hall-of-fame', 'https://ai-bot.cn/ai-hall-of-fame/']
]

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function createProxyEntry(context, target, headers = {}) {
  const contextPattern = new RegExp(`^${escapeRegExp(context)}`)

  return {
    target,
    changeOrigin: true,
    headers: {
      ...defaultHeaders,
      ...headers
    },
    rewrite: (path) => path.replace(contextPattern, '')
  }
}

export const serverProxy = {
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
  '/api-helloworld': createProxyEntry('/api-helloworld', 'https://www.helloworld.net', {
    Referer: 'https://www.helloworld.net/'
  })
}
