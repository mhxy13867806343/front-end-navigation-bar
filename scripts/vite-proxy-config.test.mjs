import test from 'node:test'
import assert from 'node:assert/strict'

test('Vite proxy config is generated from shared defaults', async () => {
  const { serverProxy } = await import('../config/viteProxy.js')

  assert.equal(serverProxy['/api-news'].target, 'https://ai-bot.cn/daily-ai-news/')
  assert.equal(serverProxy['/api-news'].changeOrigin, true)
  assert.match(serverProxy['/api-news'].headers['User-Agent'], /Mozilla\/5\.0/)
  assert.equal(serverProxy['/api-news'].rewrite('/api-news/list'), '/list')

  assert.equal(serverProxy['/api-juejin'].headers.Origin, 'https://juejin.cn')
  assert.equal(serverProxy['/api-juejin'].headers.Referer, 'https://juejin.cn/')
  assert.match(serverProxy['/api-juejin'].headers['User-Agent'], /Mozilla\/5\.0/)
  assert.equal(serverProxy['/api-juejin'].rewrite('/api-juejin/recommend'), '/recommend')
})
