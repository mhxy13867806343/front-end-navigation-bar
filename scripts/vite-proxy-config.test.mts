import test from 'node:test'
import assert from 'node:assert/strict'
import type { ProxyOptions } from 'vite'

const getProxyEntry = (proxy: Record<string, ProxyOptions>, key: string): ProxyOptions => {
  const entry: ProxyOptions | undefined = proxy[key]
  assert.ok(entry)
  assert.equal(typeof entry.rewrite, 'function')
  return entry
}

test('Vite proxy config is generated from shared defaults', async () => {
  const { serverProxy } = await import('../config/viteProxy.ts')
  const newsProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-news')
  const juejinProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-juejin')
  const lolmNewsProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-lolm-news')

  assert.equal(newsProxy.target, 'https://ai-bot.cn/daily-ai-news/')
  assert.equal(newsProxy.changeOrigin, true)
  assert.match(String(newsProxy.headers?.['User-Agent']), /Mozilla\/5\.0/)
  assert.equal(newsProxy.rewrite?.('/api-news/list'), '/list')

  assert.equal(juejinProxy.headers?.Origin, 'https://juejin.cn')
  assert.equal(juejinProxy.headers?.Referer, 'https://juejin.cn/')
  assert.match(String(juejinProxy.headers?.['User-Agent']), /Mozilla\/5\.0/)
  assert.equal(juejinProxy.rewrite?.('/api-juejin/recommend'), '/recommend')

  assert.equal(lolmNewsProxy.target, 'https://apps.game.qq.com')
  assert.equal(lolmNewsProxy.headers?.Origin, 'https://lolm.qq.com')
  assert.equal(lolmNewsProxy.headers?.Referer, 'https://lolm.qq.com/v2/news.html')
  assert.equal(lolmNewsProxy.rewrite?.('/api-lolm-news/cmc/cross'), '/cmc/cross')
  assert.ok(Object.keys(serverProxy).indexOf('/api-lolm-news') < Object.keys(serverProxy).indexOf('/api-lolm'))
})
