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
  const columnProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-column')
  const researchProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-research')
  const juejinProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-juejin')
  const bossProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-boss')
  const jandanProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-jandan')
  const tophubProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-tophub')
  const ithomeWebProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-ithome-web')
  const huxiuProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-huxiu')
  const gitcnProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-gitcn')
  const githotProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-githot')
  const hellogithubProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-hellogithub')
  const hellogithubImageProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-hellogithub-img')
  const lolmNewsProxy: ProxyOptions = getProxyEntry(serverProxy, '/api-lolm-news')

  assert.equal(newsProxy.target, 'https://ai-bot.cn/daily-ai-news/')
  assert.equal(newsProxy.changeOrigin, true)
  assert.match(String(newsProxy.headers?.['User-Agent']), /Mozilla\/5\.0/)
  assert.equal(newsProxy.rewrite?.('/api-news/list'), '/list')
  assert.equal(columnProxy.target, 'https://ai-bot.cn/ai-column/')
  assert.equal(researchProxy.target, 'https://ai-bot.cn/ai-research/')

  assert.equal(juejinProxy.headers?.Origin, 'https://juejin.cn')
  assert.equal(juejinProxy.headers?.Referer, 'https://juejin.cn/')
  assert.match(String(juejinProxy.headers?.['User-Agent']), /Mozilla\/5\.0/)
  assert.equal(juejinProxy.rewrite?.('/api-juejin/recommend'), '/recommend')

  assert.equal(bossProxy.target, 'https://www.zhipin.com')
  assert.equal(bossProxy.headers?.Origin, 'https://www.zhipin.com')
  assert.equal(bossProxy.headers?.Referer, 'https://www.zhipin.com/hangzhou/?ka=header-home')
  assert.equal(bossProxy.rewrite?.('/api-boss/wapi/zpCommon/data/city.json'), '/wapi/zpCommon/data/city.json')
  assert.equal(jandanProxy.target, 'https://jandan.net')
  assert.equal(jandanProxy.headers?.Referer, 'https://jandan.net/')
  assert.equal(jandanProxy.rewrite?.('/api-jandan/treehole'), '/treehole')
  assert.equal(tophubProxy.target, 'https://tophub.today')
  assert.equal(tophubProxy.headers?.Referer, 'https://tophub.today/')
  assert.equal(tophubProxy.rewrite?.('/api-tophub/'), '/')
  assert.equal(ithomeWebProxy.target, 'https://it.ithome.com')
  assert.equal(ithomeWebProxy.headers?.Referer, 'https://it.ithome.com/')
  assert.equal(ithomeWebProxy.rewrite?.('/api-ithome-web/hudong'), '/hudong')
  assert.equal(huxiuProxy.target, 'https://www.huxiu.com')
  assert.equal(huxiuProxy.headers?.Referer, 'https://www.huxiu.com/moment/')
  assert.equal(gitcnProxy.target, 'https://gitcn.org')
  assert.equal(gitcnProxy.rewrite?.('/api-gitcn/trends/monthly'), '/trends/monthly')
  assert.equal(githotProxy.target, 'https://githot.dev')
  assert.equal(githotProxy.rewrite?.('/api-githot/archive'), '/archive')
  assert.equal(hellogithubProxy.target, 'https://hellogithub.com')
  assert.equal(hellogithubProxy.rewrite?.('/api-hellogithub/periodical'), '/periodical')
  assert.equal(hellogithubImageProxy.target, 'https://img.hellogithub.com')
  assert.equal(hellogithubImageProxy.headers?.Referer, 'https://hellogithub.com/periodical')
  assert.equal(hellogithubImageProxy.rewrite?.('/api-hellogithub-img/i/example.png'), '/i/example.png')
  assert.ok(Object.keys(serverProxy).indexOf('/api-hellogithub-img') < Object.keys(serverProxy).indexOf('/api-hellogithub'))

  assert.equal(lolmNewsProxy.target, 'https://apps.game.qq.com')
  assert.equal(lolmNewsProxy.headers?.Origin, 'https://lolm.qq.com')
  assert.equal(lolmNewsProxy.headers?.Referer, 'https://lolm.qq.com/v2/news.html')
  assert.equal(lolmNewsProxy.rewrite?.('/api-lolm-news/cmc/cross'), '/cmc/cross')
  assert.ok(Object.keys(serverProxy).indexOf('/api-lolm-news') < Object.keys(serverProxy).indexOf('/api-lolm'))
})
