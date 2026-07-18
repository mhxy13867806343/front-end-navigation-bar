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

test('ALAPI music player supports playlist group create rename delete and horizontal tabs', () => {
  assert.match(playerSource, /@click=["']createPlaylistGroupTab["']/)
  assert.match(playerSource, /@click\.stop=["']renamePlaylistGroup\(group\.index\)["']/)
  assert.match(playerSource, /@click\.stop=["']deletePlaylistGroup\(group\.index\)["']/)
  assert.match(playerSource, /function\s+createPlaylistGroupTab\s*\(/)
  assert.match(playerSource, /function\s+renamePlaylistGroup\s*\(/)
  assert.match(playerSource, /function\s+deletePlaylistGroup\s*\(/)
  assert.match(playerSource, /\.alapi-player-playlist-tabs\s*\{[\s\S]*?overflow-x:\s*auto/)
  assert.match(playerSource, /\.alapi-player-playlist-tabs button\s*\{[\s\S]*?min-height:\s*40px/)
})

test('ALAPI music player adds songs to the active playlist group first', () => {
  assert.match(playerSource, /function\s+ensurePlaylistGroupsForInsert\s*\(/)
  assert.match(playerSource, /已自动创建\$\{createdGroup\.name\}/)
  assert.match(playerSource, /function\s+findAvailablePlaylistGroup\s*\(\s*preferredGroupIndex:\s*number\s*=\s*activePlaylistGroupIndex\.value\s*\)/)
  assert.match(playerSource, /const\s+preferredGroup:\s*PlayerListGroup\s*\|\s*undefined\s*=\s*playlistGroups\.value\[preferredGroupIndex\]/)
  assert.match(playerSource, /preferredGroup\.songs\.length\s*<\s*MAX_PLAYLIST_SONGS/)
  assert.match(playerSource, /ensurePlaylistGroupsForInsert\(\)/)
  assert.match(playerSource, /findAvailablePlaylistGroup\(activePlaylistGroupIndex\.value\)/)
  assert.match(playerSource, /已添加 \$\{addedCount\} 首到\$\{activePlaylistGroup\.value\.name\}/)
})

test('ALAPI music player exposes a playlist overview popover for quick switching', () => {
  assert.match(playerSource, /v-model:visible=["']isPlaylistOverviewVisible["']/)
  assert.match(playerSource, /placement=["']right-end["']/)
  assert.match(playerSource, /class=["']alapi-player-playlist-overview-btn["']/)
  assert.match(playerSource, /查看列表/)
  assert.match(playerSource, /class=["']alapi-player-playlist-overview-panel["']/)
  assert.match(playerSource, /@click=["']switchPlaylistGroupFromOverview\(group\.index\)["']/)
  assert.match(playerSource, /function\s+switchPlaylistGroupFromOverview\s*\(/)
  assert.match(playerSource, /\.alapi-player-playlist-tabs-wrap\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/)
  assert.match(playerSource, /\.alapi-player-playlist-overview-btn\s*\{[\s\S]*?flex:\s*0\s+0\s+auto/)
})

test('ALAPI music player keeps playlist group names and active index consistent after deletion', () => {
  assert.match(playerSource, /function\s+isDefaultPlaylistGroupName\s*\(/)
  assert.match(playerSource, /function\s+normalizePlaylistGroups\s*\(/)
  assert.match(playerSource, /normalizePlaylistGroups\(\)/)
  assert.match(playerSource, /activePlaylistGroupIndex\.value\s*=\s*Math\.min\(/)
  assert.match(playerSource, /group\.name\s*=\s*`播放列表\$\{index\s*\+\s*1\}`/)
  assert.match(playerSource, /const\s+deletedGroupName:\s*string\s*=\s*targetGroup\.name/)
})

test('ALAPI music player keeps playlist tabs horizontally scrollable with a visible scrollbar', () => {
  assert.match(playerSource, /\.alapi-player-playlist\s*\{[\s\S]*?overflow:\s*hidden/)
  assert.match(playerSource, /\.alapi-player-playlist-tabs\s*\{[\s\S]*?max-width:\s*100%/)
  assert.match(playerSource, /\.alapi-player-playlist-tabs\s*\{[\s\S]*?overflow-x:\s*auto/)
  assert.match(playerSource, /\.alapi-player-playlist-tabs\s*\{[\s\S]*?scrollbar-width:\s*thin/)
  assert.match(playerSource, /\.alapi-player-playlist-tabs::\-webkit-scrollbar\s*\{[\s\S]*?height:\s*8px/)
  assert.match(playerSource, /\.alapi-player-playlist-tab > span:not\(\.alapi-player-sr-only\)\s*\{[\s\S]*?max-width:\s*clamp\(/)
  assert.match(playerSource, /\.alapi-player\.collapsed\s*\{[\s\S]*?width:\s*fit-content/)
  assert.match(playerSource, /\.alapi-player-mini-info\s*\{[\s\S]*?max-width:\s*clamp\(/)
})

test('ALAPI music player imports songs from the ALAPI playlist endpoint', () => {
  assert.match(playerSource, /MUSIC_PLAYLIST_PATH:\s*string\s*=\s*['"]\/api-alapi\/api\/music\/playlist['"]/)
  assert.match(playerSource, /interface\s+AlapiPlaylistData/)
  assert.match(playerSource, /const\s+playlistImportSongs:\s*Ref<PlayerSong\[]>/)
  assert.match(playerSource, /v-model\.trim=["']playlistImportId["']/)
  assert.match(playerSource, /function\s+buildMusicPlaylistApi\s*\(/)
  assert.match(playerSource, /function\s+fetchPlaylistSongs\s*\(/)
  assert.match(playerSource, /function\s+openPlaylistImportDialog\s*\(/)
  assert.match(playerSource, /function\s+addPlaylistImportSongsToPlaylist\s*\(/)
  assert.match(playerSource, /\/api\/music\/playlist/)
})

test('ALAPI music player supports playlist searching and playback modes', () => {
  assert.match(playerSource, /v-model\.trim=["']playlistSearchKeyword["']/)
  assert.match(playerSource, /const\s+filteredPlaylist:\s*ComputedRef<PlaylistSongView\[]>/)
  assert.match(playerSource, /type\s+PlaybackMode\s*=\s*'sequence'\s*\|\s*'shuffle'\s*\|\s*'single'/)
  assert.match(playerSource, /@click=["']cyclePlaybackMode["']/)
  assert.match(playerSource, /function\s+cyclePlaybackMode\s*\(/)
  assert.match(playerSource, /const\s+currentPlaybackModeOption:\s*ComputedRef<PlaybackModeOption>/)
  assert.match(playerSource, /<el-icon/)
  assert.match(playerSource, /function\s+pickNextIndex\s*\(/)
  assert.match(playerSource, /function\s+pickPreviousIndex\s*\(/)
})

test('ALAPI music player exposes search filters, empty state, details, and theme settings', () => {
  assert.match(playerSource, /v-model=["']searchType["']/)
  assert.match(playerSource, /<el-select\s+v-model=["']searchType["']/)
  assert.match(playerSource, /:teleported=["']false["']/)
  assert.match(playerSource, /:popper-options=["']searchTypePopperOptions["']/)
  assert.match(playerSource, /const\s+searchTypePopperOptions:\s*PopperOptions/)
  assert.match(playerSource, /<el-input-number\s+v-model=["']searchLimit["']/)
  assert.match(playerSource, /<el-input-number\s+v-model=["']searchPage["']/)
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
  assert.match(playerSource, /function\s+scrollPlaylistToCurrentSong\s*\(/)
  assert.match(playerSource, /data-playlist-index/)
  assert.match(playerSource, /watch\(currentIndex/)
  assert.match(playerSource, /\.alapi-player-body\s*\{[\s\S]*?overflow:\s*hidden/)
  assert.match(playerSource, /\.alapi-player-workspace\s*\{[\s\S]*?overflow-y:\s*auto/)
  assert.match(playerSource, /\.alapi-player-control-dock\s*\{[\s\S]*?flex:\s*0\s+0\s+auto/)
})

test('ALAPI music player limits history to 12 and lays history tags in rows', () => {
  assert.match(playerSource, /\.slice\(0,\s*12\)/)
  assert.match(playerSource, /\.alapi-player-history-tags\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(playerSource, /\.alapi-player-playback-tools\s*\{[\s\S]*?justify-content:\s*space-between/)
  assert.match(playerSource, /\.alapi-player-volume-control/)
})

test('ALAPI music player keeps search type dropdown aligned inside the fixed player', () => {
  assert.match(playerSource, /\.alapi-player-search-filters\s*\{[\s\S]*?position:\s*relative/)
  assert.match(playerSource, /\.alapi-player-search-filters\s*\{[\s\S]*?overflow:\s*visible/)
  assert.match(playerSource, /:global\(\.alapi-player-select-popper\)/)
  assert.match(playerSource, /z-index:\s*3700/)
})

test('ALAPI music player keeps dialogs above the fixed player', () => {
  const zIndexMatch: RegExpMatchArray | null = playerSource.match(/\.alapi-player\s*\{[\s\S]*?z-index:\s*(\d+)/)
  assert.ok(zIndexMatch)
  assert.ok(Number(zIndexMatch[1]) > 3000)
})

test('ALAPI music player refreshes song urls safely when playlist items are clicked', () => {
  assert.match(playerSource, /let\s+playRequestId:\s*number\s*=\s*0/)
  assert.match(playerSource, /function\s+isAbortError\s*\(/)
  assert.match(playerSource, /loadAndPlayCurrentSong\s*\(\s*true\s*\)/)
})
