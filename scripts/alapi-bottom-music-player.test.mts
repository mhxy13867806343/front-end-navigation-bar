import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const playerSource: string = await readFile(
  new URL('../src/components/AlapiBottomMusicPlayer.vue', import.meta.url),
  'utf8',
)

test('ALAPI music player supports batch playlist management', () => {
  assert.match(playerSource, /批量添加/)
  assert.match(playerSource, /function\s+addSearchResultsToPlaylist\s*\(/)
  assert.match(playerSource, /function\s+removePlaylistSong\s*\(/)
  assert.match(playerSource, /@click\.stop=["']removePlaylistSong\(index\)["']/)
})

test('ALAPI music player keeps dialogs above the fixed player', () => {
  const zIndexMatch: RegExpMatchArray | null = playerSource.match(/\.alapi-player\s*\{[\s\S]*?z-index:\s*(\d+)/)
  assert.ok(zIndexMatch)
  assert.ok(Number(zIndexMatch[1]) < 2000)
})

test('ALAPI music player refreshes song urls safely when playlist items are clicked', () => {
  assert.match(playerSource, /let\s+playRequestId:\s*number\s*=\s*0/)
  assert.match(playerSource, /function\s+isAbortError\s*\(/)
  assert.match(playerSource, /loadAndPlayCurrentSong\s*\(\s*true\s*\)/)
})
