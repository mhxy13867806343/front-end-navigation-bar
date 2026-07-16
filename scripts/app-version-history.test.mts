import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const appSource: string = await readFile(
  new URL('../src/App.vue', import.meta.url),
  'utf8',
)

test('version history dialog only auto opens once and can be reopened from drawer', () => {
  assert.match(appSource, /VERSION_HISTORY_SEEN_KEY/)
  assert.match(appSource, /function\s+handleVersionHistoryClose\s*\(/)
  assert.match(appSource, /@closed=["']handleVersionHistoryClose["']/)
  assert.match(appSource, /localStorage\.getItem\(VERSION_HISTORY_SEEN_KEY\)/)
  assert.match(appSource, /localStorage\.setItem\(VERSION_HISTORY_SEEN_KEY,\s*'1'\)/)
  assert.doesNotMatch(appSource, /watch\(\(\):\s*string\s*=>\s*route\.fullPath[\s\S]*?showVersionHistoryDialog\.value\s*=\s*true/)
  assert.match(appSource, /@click=["']openVersionHistoryDialog["']/)
})

test('route page layer stays below the bottom music player', () => {
  const routeLayerMatch: RegExpMatchArray | null = appSource.match(/\.route-view-layer\s*\{[\s\S]*?z-index:\s*(\d+)/)
  assert.ok(routeLayerMatch)
  assert.equal(Number(routeLayerMatch[1]), 3000)
})
