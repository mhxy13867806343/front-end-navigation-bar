import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const playerSource: string = await readFile(
  new URL('../src/components/AlapiBottomMusicPlayer.vue', import.meta.url),
  'utf8',
)

test('ALAPI music player supports batch playlist management', () => {
  assert.match(playerSource, /批量添加/)
  assert.match(playerSource, /v-model=["']isBatchDialogVisible["']/)
  assert.match(playerSource, /<el-checkbox/)
  assert.match(playerSource, /selectedSearchSongIds\.value\s*=\s*\[\]/)
  assert.match(playerSource, /function\s+addSearchResultsToPlaylist\s*\(/)
  assert.match(playerSource, /function\s+removePlaylistSong\s*\(/)
  assert.match(playerSource, /@click\.stop=["']removePlaylistSong\(song\.originalIndex\)["']/)
})

test('ALAPI music player supports paged playlists and duplicate prompts', () => {
  assert.match(playerSource, /MAX_PLAYLIST_SONGS:\s*number\s*=\s*100/)
  assert.match(playerSource, /interface\s+PlayerListGroup/)
  assert.match(playerSource, /const\s+playlistGroups:\s*Ref<PlayerListGroup\[]>/)
  assert.match(playerSource, /播放列表 \{\{ group\.index \+ 1 \}\}/)
  assert.match(playerSource, /已存在/)
  assert.match(playerSource, /findAvailablePlaylistGroup/)
})

test('ALAPI music player supports playlist searching and playback modes', () => {
  assert.match(playerSource, /v-model\.trim=["']playlistSearchKeyword["']/)
  assert.match(playerSource, /const\s+filteredPlaylist:\s*ComputedRef<PlaylistSongView\[]>/)
  assert.match(playerSource, /type\s+PlaybackMode\s*=\s*'sequence'\s*\|\s*'shuffle'\s*\|\s*'single'/)
  assert.match(playerSource, /v-for=["']mode in playbackModes["']/)
  assert.match(playerSource, /function\s+pickNextIndex\s*\(/)
  assert.match(playerSource, /function\s+pickPreviousIndex\s*\(/)
})

test('ALAPI music player exposes search filters, empty state, details, and theme settings', () => {
  assert.match(playerSource, /v-model\.number=["']searchLimit["']/)
  assert.match(playerSource, /v-model\.number=["']searchPage["']/)
  assert.match(playerSource, /v-model=["']searchType["']/)
  assert.match(playerSource, /没有找到歌曲/)
  assert.match(playerSource, /查看详情/)
  assert.match(playerSource, /function\s+openSongDetail\s*\(/)
  assert.match(playerSource, /v-model=["']playerTheme\.accentColor["']/)
  assert.match(playerSource, /v-model\.number=["']playerTheme\.fontSize["']/)
  assert.match(playerSource, /function\s+applyPlayerTheme\s*\(/)
})

test('ALAPI music player keeps playlist controls visible and scrolls playlist to top after adding', () => {
  assert.match(playerSource, /ref=["']playlistPanelRef["']/)
  assert.match(playerSource, /function\s+scrollPlaylistToTop\s*\(/)
  assert.match(playerSource, /\.alapi-player-body\s*\{[\s\S]*?overflow:\s*hidden/)
  assert.match(playerSource, /\.alapi-player-workspace\s*\{[\s\S]*?overflow-y:\s*auto/)
  assert.match(playerSource, /\.alapi-player-control-dock\s*\{[\s\S]*?flex:\s*0\s+0\s+auto/)
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
