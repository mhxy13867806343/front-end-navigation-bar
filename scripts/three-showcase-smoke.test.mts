import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const readProjectFile = async (relativePath: string): Promise<string> => {
  return readFile(resolve(process.cwd(), relativePath), 'utf8')
}

test('Three.js 页面路由已接入', async () => {
  const routerSource = await readProjectFile('src/router/index.ts')
  assert.match(routerSource, /path:\s*'\/three-showcase'/)
  assert.match(routerSource, /path:\s*'\/three-showcase\/example\/:id'/)
  assert.match(routerSource, /path:\s*'\/three-showcase\/lab'/)
})

test('Three.js 数据目录包含基础示例与小游戏', async () => {
  const catalogSource = await readProjectFile('src/views/threeShowcase/data/catalog.ts')
  assert.match(catalogSource, /id:\s*'basic-cube'/)
  assert.match(catalogSource, /id:\s*'particle-galaxy'/)
  assert.match(catalogSource, /id:\s*'orb-hunter'/)
  assert.match(catalogSource, /id:\s*'meteor-dodge'/)
})
