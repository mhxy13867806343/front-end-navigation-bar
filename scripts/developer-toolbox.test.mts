import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const [toolboxSource, packageJson] = await Promise.all([
  readFile(new URL('../src/components/games/DeveloperToolbox.vue', import.meta.url), 'utf8'),
  readFile(new URL('../package.json', import.meta.url), 'utf8'),
])

test('DeveloperToolbox lets users copy the current JS helper source code', () => {
  assert.match(toolboxSource, /import\s+copy\s+from\s+['"]clipboard-copy['"]/)
  assert.match(toolboxSource, /const\s+copyCurrentFuncCode\s*=\s*async\s*\(\)\s*:\s*Promise<void>\s*=>/)
  assert.match(toolboxSource, /@click=["']copyCurrentFuncCode["']/)
  assert.match(toolboxSource, /复制源码/)
})

test('clipboard-copy is installed as the JS source copy helper', () => {
  const pkg = JSON.parse(packageJson)
  assert.ok(pkg.dependencies['clipboard-copy'])
})
