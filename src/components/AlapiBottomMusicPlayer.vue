<template>
  <section class="alapi-player" :class="{ collapsed: isCollapsed }" aria-label="ALAPI 底部音乐播放器">
    <button class="alapi-player-toggle" type="button" @click="toggleCollapsed">
      {{ isCollapsed ? '展开音乐' : '收起' }}
    </button>

    <div v-if="!isCollapsed" class="alapi-player-panel">
      <div class="alapi-player-cover" :class="{ playing: isPlaying }">
        <span>{{ currentSong ? '♪' : '♫' }}</span>
      </div>

      <div class="alapi-player-body">
        <div class="alapi-player-title-row">
          <div class="alapi-player-song">
            <strong>{{ currentSong?.name || 'ALAPI 音乐播放器' }}</strong>
            <span>{{ currentSong?.artists || '搜索歌曲后点击播放' }}</span>
          </div>
          <a class="alapi-player-source" href="https://musicplayer.xfyun.club/" target="_blank" rel="noopener noreferrer">
            小枫播放器测试
          </a>
        </div>

        <div class="alapi-player-search">
          <input
            v-model.trim="keyword"
            type="search"
            placeholder="搜索歌曲，例如：慢慢懂"
            @keydown.enter="searchSongs(1)"
          >
          <button type="button" :disabled="isSearching" @click="searchSongs(1)">
            {{ isSearching ? '搜索中' : '搜索' }}
          </button>
        </div>

        <div v-if="searchHistory.length" class="alapi-player-history">
          <div class="alapi-player-section-title">
            <span>搜索历史</span>
            <button type="button" @click="confirmClearHistory">清空</button>
          </div>
          <div class="alapi-player-history-tags">
            <button
              v-for="history in searchHistory"
              :key="history"
              type="button"
              @click="searchFromHistory(history)"
            >
              {{ history }}
            </button>
          </div>
        </div>

        <div v-if="searchResults.length" class="alapi-player-results">
          <button
            v-for="song in searchResults"
            :key="song.id"
            type="button"
            class="alapi-player-result"
            @click="playSong(song)"
          >
            <span>{{ song.name }}</span>
            <em>{{ song.artists }}</em>
          </button>
        </div>

        <div class="alapi-player-api-panel">
          <details>
            <summary>ALAPI 接口信息</summary>
            <div class="alapi-player-api-grid">
              <a
                v-for="api in apiDocs"
                :key="api.name"
                :href="api.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                <strong>{{ api.name }}</strong>
                <span>{{ api.method }} {{ api.path }}</span>
                <em>{{ api.params }}</em>
              </a>
            </div>
          </details>
        </div>

        <div v-if="currentSong && (lyricPreview || hotComments.length)" class="alapi-player-extra">
          <div v-if="lyricPreview" class="alapi-player-extra-card">
            <strong>歌词预览</strong>
            <p>{{ lyricPreview }}</p>
          </div>
          <div v-if="hotComments.length" class="alapi-player-extra-card">
            <strong>热评</strong>
            <p>{{ hotComments[0] }}</p>
          </div>
        </div>

        <div class="alapi-player-controls">
          <button type="button" :disabled="!playlist.length" title="上一首" @click="playPrevious">⏮</button>
          <button class="primary-control" type="button" :disabled="!currentSong" title="播放/暂停" @click="togglePlay">
            {{ isPlaying ? '暂停' : '播放' }}
          </button>
          <button type="button" :disabled="!playlist.length" title="下一首" @click="playNext">⏭</button>
          <input
            v-model.number="progress"
            type="range"
            min="0"
            max="100"
            step="0.1"
            aria-label="播放进度"
            @input="seekAudio"
          >
          <span class="alapi-player-time">{{ currentTimeText }} / {{ durationText }}</span>
        </div>

        <div class="alapi-player-footer">
          <span class="alapi-player-status">{{ statusText }}</span>
          <label>
            音量
            <input v-model.number="volume" type="range" min="0" max="100" step="1" @input="updateVolume">
          </label>
        </div>
      </div>
    </div>

    <div v-else class="alapi-player-mini">
      <button type="button" @click="togglePlay">{{ isPlaying ? '⏸' : '▶' }}</button>
      <div>
        <strong>{{ currentSong?.name || '音乐' }}</strong>
        <span>{{ currentSong?.artists || 'ALAPI' }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { requestJson } from '@/utils/request'

interface AlapiResponse<T> {
  request_id?: string
  success: boolean
  code: number
  message: string
  data: T | null
  time?: number
  usage?: number
}

interface AlapiArtist {
  id?: number
  name?: string
}

interface AlapiAlbum {
  id?: number
  name?: string
  picId?: number
  picUrl?: string
}

interface AlapiSong {
  id?: number
  name?: string
  duration?: number
  fee?: number
  artists?: AlapiArtist[]
  ar?: AlapiArtist[]
  album?: AlapiAlbum
  al?: AlapiAlbum
}

interface AlapiSearchData {
  songs?: AlapiSong[]
  hasMore?: boolean
  songCount?: number
}

interface AlapiMusicUrlItem {
  id?: number
  url?: string | null
}

interface AlapiMusicUrlData {
  url?: string | null
  musicUrl?: string | null
  playUrl?: string | null
  data?: AlapiMusicUrlItem[]
}

interface AlapiLyricData {
  lyric?: string
  lrc?: {
    lyric?: string
  }
}

interface AlapiHotCommentUser {
  nickname?: string
}

interface AlapiHotComment {
  user?: AlapiHotCommentUser
  content?: string
  likedCount?: number
}

interface AlapiHotCommentData {
  comments?: AlapiHotComment[]
  hotComments?: AlapiHotComment[]
}

interface ApiDocItem {
  name: string
  method: string
  path: string
  url: string
  params: string
}

interface PlayerSong {
  id: number
  name: string
  artists: string
  album: string
  duration: number
  url: string
}

const ALAPI_TOKEN: string = 'qgqofofvmxtoskffd37omkscobipmn'
const ALAPI_BASE_URL: string = 'https://v3.alapi.cn'
const MUSIC_SEARCH_PATH: string = '/api-alapi/api/music/search'
const MUSIC_URL_PATH: string = '/api-alapi/api/music/url'
const MUSIC_LYRIC_PATH: string = '/api-alapi/api/music/lyric'
const MUSIC_HOT_COMMENT_PATH: string = '/api-alapi/api/music/comment/hot'
const PLAYER_STORAGE_KEY: string = 'alapi_bottom_music_player_state'
const DEFAULT_KEYWORD: string = '慢慢懂'
const SEARCH_LIMIT: number = 10
const SEARCH_TYPE: string = '1'
const FALLBACK_SONGS: PlayerSong[] = [
  {
    id: 1345417796,
    name: '慢慢懂',
    artists: 'Hwing',
    album: '慢慢懂',
    duration: 242000,
    url: ''
  },
  {
    id: 3382836246,
    name: '慢慢懂 (Cover 汪苏泷)',
    artists: '慕辰',
    album: '慢慢懂',
    duration: 266000,
    url: ''
  }
]
const apiDocs: ApiDocItem[] = [
  {
    name: '歌曲搜索',
    method: 'GET',
    path: '/api/music/search',
    url: `${ALAPI_BASE_URL}/api/music/search`,
    params: `token=${ALAPI_TOKEN}，keyword，limit=${SEARCH_LIMIT}，page，type=${SEARCH_TYPE}`
  },
  {
    name: '歌曲直链',
    method: 'GET',
    path: '/api/music/url',
    url: `${ALAPI_BASE_URL}/api/music/url`,
    params: `token=${ALAPI_TOKEN}，id=网易云歌曲 ID`
  },
  {
    name: '歌词获取',
    method: 'GET',
    path: '/api/music/lyric',
    url: `${ALAPI_BASE_URL}/api/music/lyric`,
    params: `token=${ALAPI_TOKEN}，id=网易云歌曲 ID`
  },
  {
    name: '获取歌曲热评',
    method: 'GET',
    path: '/api/music/comment/hot',
    url: `${ALAPI_BASE_URL}/api/music/comment/hot`,
    params: `token=${ALAPI_TOKEN}，id=网易云歌曲 ID，limit=3`
  }
]

const keyword: Ref<string> = ref<string>(DEFAULT_KEYWORD)
const searchResults: Ref<PlayerSong[]> = ref<PlayerSong[]>([])
const searchHistory: Ref<string[]> = ref<string[]>([])
const playlist: Ref<PlayerSong[]> = ref<PlayerSong[]>([])
const currentIndex: Ref<number> = ref<number>(0)
const isPlaying: Ref<boolean> = ref<boolean>(false)
const isSearching: Ref<boolean> = ref<boolean>(false)
const isCollapsed: Ref<boolean> = ref<boolean>(false)
const statusText: Ref<string> = ref<string>('输入关键词，按 Enter 搜索歌曲')
const progress: Ref<number> = ref<number>(0)
const volume: Ref<number> = ref<number>(70)
const currentSeconds: Ref<number> = ref<number>(0)
const durationSeconds: Ref<number> = ref<number>(0)
const lyricPreview: Ref<string> = ref<string>('')
const hotComments: Ref<string[]> = ref<string[]>([])
const audio: HTMLAudioElement = new Audio()

const currentSong: ComputedRef<PlayerSong | null> = computed<PlayerSong | null>(() => {
  return playlist.value[currentIndex.value] ?? null
})

const currentTimeText: ComputedRef<string> = computed<string>(() => formatSeconds(currentSeconds.value))
const durationText: ComputedRef<string> = computed<string>(() => formatSeconds(durationSeconds.value))

function buildMusicSearchUrl(searchKeyword: string, page: number): string {
  const params: URLSearchParams = new URLSearchParams({
    token: ALAPI_TOKEN,
    keyword: searchKeyword,
    limit: String(SEARCH_LIMIT),
    page: String(page),
    type: SEARCH_TYPE
  })
  return `${MUSIC_SEARCH_PATH}?${params.toString()}`
}

function buildMusicUrlApi(songId: number): string {
  const params: URLSearchParams = new URLSearchParams({
    token: ALAPI_TOKEN,
    id: String(songId)
  })
  return `${MUSIC_URL_PATH}?${params.toString()}`
}

function buildMusicLyricApi(songId: number): string {
  const params: URLSearchParams = new URLSearchParams({
    token: ALAPI_TOKEN,
    id: String(songId)
  })
  return `${MUSIC_LYRIC_PATH}?${params.toString()}`
}

function buildMusicHotCommentApi(songId: number): string {
  const params: URLSearchParams = new URLSearchParams({
    token: ALAPI_TOKEN,
    id: String(songId),
    limit: '3'
  })
  return `${MUSIC_HOT_COMMENT_PATH}?${params.toString()}`
}

function buildFallbackSongUrl(songId: number): string {
  return `https://music.163.com/song/media/outer/url?id=${songId}.mp3`
}

function getArtistText(song: AlapiSong): string {
  const artists: AlapiArtist[] = song.artists ?? song.ar ?? []
  const names: string[] = artists
    .map((artist: AlapiArtist): string => artist.name?.trim() ?? '')
    .filter((name: string): boolean => Boolean(name))
  return names.length ? names.join(' / ') : '未知歌手'
}

function normalizeSong(song: AlapiSong): PlayerSong | null {
  if (!song.id || !song.name) return null
  if (song.fee === 1) return null
  const album: AlapiAlbum | undefined = song.album ?? song.al
  return {
    id: song.id,
    name: song.name,
    artists: getArtistText(song),
    album: album?.name ?? '未知专辑',
    duration: song.duration ?? 0,
    url: ''
  }
}

function normalizeAudioUrl(url: string): string {
  return url.replace(/^http:/, 'https:')
}

function getFallbackSongs(): PlayerSong[] {
  return FALLBACK_SONGS.map((song: PlayerSong): PlayerSong => ({ ...song }))
}

function parseSongUrl(data: AlapiMusicUrlData | AlapiMusicUrlItem[] | null): string | null {
  if (!data) return null
  if (Array.isArray(data)) {
    const itemUrl: string | null | undefined = data.find((item: AlapiMusicUrlItem): boolean => Boolean(item.url))?.url
    return itemUrl ? normalizeAudioUrl(itemUrl) : null
  }
  if (data.url) return normalizeAudioUrl(data.url)
  if (data.musicUrl) return normalizeAudioUrl(data.musicUrl)
  if (data.playUrl) return normalizeAudioUrl(data.playUrl)
  if (data.data?.length) {
    const itemUrl: string | null | undefined = data.data.find((item: AlapiMusicUrlItem): boolean => Boolean(item.url))?.url
    return itemUrl ? normalizeAudioUrl(itemUrl) : null
  }
  return null
}

async function resolveSongUrl(songId: number): Promise<string> {
  try {
    const response: AlapiResponse<AlapiMusicUrlData | AlapiMusicUrlItem[]> = await requestJson<AlapiResponse<AlapiMusicUrlData | AlapiMusicUrlItem[]>>(buildMusicUrlApi(songId))
    const parsedUrl: string | null = response.success ? parseSongUrl(response.data) : null
    return parsedUrl ?? buildFallbackSongUrl(songId)
  } catch (error: unknown) {
    console.warn('ALAPI 音乐地址获取失败，使用外链兜底:', error)
    return buildFallbackSongUrl(songId)
  }
}

async function searchSongs(page: number = 1): Promise<void> {
  const searchKeyword: string = keyword.value.trim()
  if (!searchKeyword) {
    statusText.value = '请输入歌曲关键词'
    return
  }

  isSearching.value = true
  statusText.value = '正在从 ALAPI 搜索音乐...'
  addSearchHistory(searchKeyword)

  try {
    const response: AlapiResponse<AlapiSearchData> = await requestJson<AlapiResponse<AlapiSearchData>>(buildMusicSearchUrl(searchKeyword, page))
    if (!response.success || !response.data?.songs) {
      throw new Error(response.message || '搜索失败')
    }

    searchResults.value = response.data.songs
      .map((song: AlapiSong): PlayerSong | null => normalizeSong(song))
      .filter((song: PlayerSong | null): song is PlayerSong => song !== null)

    statusText.value = searchResults.value.length
      ? `找到 ${searchResults.value.length} 首，点击歌名播放`
      : '没有找到歌曲，换个关键词试试'
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : '搜索失败，请稍后再试'
    searchResults.value = getFallbackSongs()
    statusText.value = `${message}，已展示备用歌曲`
  } finally {
    isSearching.value = false
  }
}

function addSearchHistory(searchKeyword: string): void {
  const normalizedKeyword: string = searchKeyword.trim()
  if (!normalizedKeyword) return
  searchHistory.value = [
    normalizedKeyword,
    ...searchHistory.value.filter((item: string): boolean => item !== normalizedKeyword)
  ].slice(0, 8)
  saveState()
}

function searchFromHistory(searchKeyword: string): void {
  keyword.value = searchKeyword
  void searchSongs(1)
}

function confirmClearHistory(): void {
  void ElMessageBox.confirm(
    '确定要清空音乐搜索历史吗？清空后无法恢复。',
    '清空搜索历史',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then((): void => {
    searchHistory.value = []
    saveState()
    statusText.value = '搜索历史已清空'
  }).catch((): void => {})
}

async function playSong(song: PlayerSong): Promise<void> {
  const targetIndex: number = playlist.value.findIndex((item: PlayerSong): boolean => item.id === song.id)
  if (targetIndex >= 0) {
    currentIndex.value = targetIndex
  } else {
    playlist.value.unshift(song)
    currentIndex.value = 0
  }

  await loadAndPlayCurrentSong()
  await fetchSongExtra(song.id)
  saveState()
}

async function loadAndPlayCurrentSong(): Promise<void> {
  const song: PlayerSong | null = currentSong.value
  if (!song) return

  statusText.value = `正在加载：${song.name}`
  const resolvedUrl: string = song.url || await resolveSongUrl(song.id)
  song.url = resolvedUrl
  audio.src = resolvedUrl

  try {
    await audio.play()
    isPlaying.value = true
    statusText.value = `正在播放：${song.name}`
    void fetchSongExtra(song.id)
  } catch (error: unknown) {
    isPlaying.value = false
    statusText.value = '当前歌曲无法播放，请换一首'
    console.warn('音乐播放失败:', error)
  }
}

async function fetchSongExtra(songId: number): Promise<void> {
  await Promise.all([
    fetchLyricPreview(songId),
    fetchHotComments(songId)
  ])
}

async function fetchLyricPreview(songId: number): Promise<void> {
  try {
    const response: AlapiResponse<AlapiLyricData> = await requestJson<AlapiResponse<AlapiLyricData>>(buildMusicLyricApi(songId))
    const rawLyric: string = response.data?.lyric ?? response.data?.lrc?.lyric ?? ''
    lyricPreview.value = normalizeLyricPreview(rawLyric)
  } catch (error: unknown) {
    lyricPreview.value = ''
    console.warn('ALAPI 歌词获取失败:', error)
  }
}

async function fetchHotComments(songId: number): Promise<void> {
  try {
    const response: AlapiResponse<AlapiHotCommentData> = await requestJson<AlapiResponse<AlapiHotCommentData>>(buildMusicHotCommentApi(songId))
    const comments: AlapiHotComment[] = response.data?.comments ?? response.data?.hotComments ?? []
    hotComments.value = comments
      .map((comment: AlapiHotComment): string => {
        const nickname: string = comment.user?.nickname ?? '匿名用户'
        const content: string = comment.content?.trim() ?? ''
        return content ? `${nickname}: ${content}` : ''
      })
      .filter((comment: string): boolean => Boolean(comment))
      .slice(0, 3)
  } catch (error: unknown) {
    hotComments.value = []
    console.warn('ALAPI 歌曲热评获取失败:', error)
  }
}

function normalizeLyricPreview(rawLyric: string): string {
  return rawLyric
    .split('\n')
    .map((line: string): string => line.replace(/\[[^\]]+\]/g, '').trim())
    .filter((line: string): boolean => Boolean(line))
    .slice(0, 2)
    .join(' / ')
}

function togglePlay(): void {
  if (!currentSong.value) {
    void searchSongs(1)
    return
  }

  if (isPlaying.value) {
    audio.pause()
    isPlaying.value = false
    statusText.value = '已暂停'
    return
  }

  if (!audio.src) {
    void loadAndPlayCurrentSong()
    return
  }

  void audio.play()
    .then((): void => {
      isPlaying.value = true
      statusText.value = `正在播放：${currentSong.value?.name ?? ''}`
    })
    .catch((error: unknown): void => {
      isPlaying.value = false
      statusText.value = '播放失败，请换一首'
      console.warn('恢复播放失败:', error)
    })
}

function playPrevious(): void {
  if (!playlist.value.length) return
  currentIndex.value = currentIndex.value <= 0 ? playlist.value.length - 1 : currentIndex.value - 1
  void loadAndPlayCurrentSong()
  saveState()
}

function playNext(): void {
  if (!playlist.value.length) return
  currentIndex.value = currentIndex.value >= playlist.value.length - 1 ? 0 : currentIndex.value + 1
  void loadAndPlayCurrentSong()
  saveState()
}

function seekAudio(): void {
  if (!audio.duration) return
  audio.currentTime = (progress.value / 100) * audio.duration
}

function updateVolume(): void {
  audio.volume = volume.value / 100
  saveState()
}

function updateProgress(): void {
  const fallbackDuration: number = currentSong.value ? currentSong.value.duration / 1000 : 0
  currentSeconds.value = audio.currentTime || 0
  durationSeconds.value = audio.duration || fallbackDuration
  progress.value = durationSeconds.value ? (currentSeconds.value / durationSeconds.value) * 100 : 0
}

function handleEnded(): void {
  playNext()
}

function handleAudioError(): void {
  isPlaying.value = false
  statusText.value = '音频地址暂不可用，试试列表里的其他歌曲'
}

function toggleCollapsed(): void {
  isCollapsed.value = !isCollapsed.value
  saveState()
}

function formatSeconds(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0:00'
  const minutes: number = Math.floor(totalSeconds / 60)
  const seconds: number = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function saveState(): void {
  const state: string = JSON.stringify({
    keyword: keyword.value,
    searchHistory: searchHistory.value,
    playlist: playlist.value,
    currentIndex: currentIndex.value,
    volume: volume.value,
    isCollapsed: isCollapsed.value
  })
  localStorage.setItem(PLAYER_STORAGE_KEY, state)
}

function loadState(): void {
  const rawState: string | null = localStorage.getItem(PLAYER_STORAGE_KEY)
  if (!rawState) return

  try {
    const parsedState: Partial<{
      keyword: string
      searchHistory: string[]
      playlist: PlayerSong[]
      currentIndex: number
      volume: number
      isCollapsed: boolean
    }> = JSON.parse(rawState) as Partial<{
      keyword: string
      searchHistory: string[]
      playlist: PlayerSong[]
      currentIndex: number
      volume: number
      isCollapsed: boolean
    }>

    keyword.value = parsedState.keyword ?? DEFAULT_KEYWORD
    searchHistory.value = parsedState.searchHistory ?? []
    playlist.value = parsedState.playlist ?? []
    currentIndex.value = parsedState.currentIndex ?? 0
    volume.value = parsedState.volume ?? 70
    isCollapsed.value = parsedState.isCollapsed ?? false
  } catch (error: unknown) {
    console.warn('底部音乐播放器缓存读取失败:', error)
  }
}

onMounted((): void => {
  loadState()
  updateVolume()
  audio.preload = 'metadata'
  audio.addEventListener('timeupdate', updateProgress)
  audio.addEventListener('loadedmetadata', updateProgress)
  audio.addEventListener('ended', handleEnded)
  audio.addEventListener('error', handleAudioError)

  if (!playlist.value.length) {
    void searchSongs(1)
  }
})

onUnmounted((): void => {
  saveState()
  audio.pause()
  audio.removeEventListener('timeupdate', updateProgress)
  audio.removeEventListener('loadedmetadata', updateProgress)
  audio.removeEventListener('ended', handleEnded)
  audio.removeEventListener('error', handleAudioError)
})
</script>

<style scoped>
.alapi-player {
  position: fixed;
  left: 24px;
  bottom: 20px;
  z-index: 2600;
  width: min(640px, calc(100vw - 48px));
  color: #f5f7ff;
  pointer-events: auto;
}

.alapi-player-panel,
.alapi-player-mini {
  border: 1px solid rgba(120, 130, 255, 0.35);
  background: rgba(15, 16, 24, 0.92);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.alapi-player-panel {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 14px;
  padding: 14px;
  border-radius: 18px;
}

.alapi-player-toggle {
  position: absolute;
  right: 18px;
  top: -34px;
  height: 28px;
  padding: 0 12px;
  color: #dfe4ff;
  font-size: 12px;
  font-weight: 700;
  background: rgba(15, 16, 24, 0.92);
  border: 1px solid rgba(120, 130, 255, 0.32);
  border-radius: 999px;
  cursor: pointer;
}

.alapi-player-cover {
  width: 78px;
  height: 78px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #6970ff, #38d7b8 48%, #f6bf4f);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16);
}

.alapi-player-cover.playing {
  animation: alapi-pulse 1.8s ease-in-out infinite;
}

.alapi-player-cover span {
  font-size: 34px;
  font-weight: 900;
}

.alapi-player-body {
  min-width: 0;
}

.alapi-player-title-row,
.alapi-player-controls,
.alapi-player-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alapi-player-title-row {
  justify-content: space-between;
}

.alapi-player-song {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.alapi-player-song strong,
.alapi-player-song span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alapi-player-song strong {
  font-size: 15px;
}

.alapi-player-song span,
.alapi-player-footer,
.alapi-player-source {
  color: #a9afc4;
  font-size: 12px;
}

.alapi-player-source {
  flex: 0 0 auto;
  padding: 5px 8px;
  color: #7c83ff;
  text-decoration: none;
  border: 1px solid rgba(124, 131, 255, 0.34);
  border-radius: 999px;
}

.alapi-player-search {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 72px;
  gap: 8px;
  margin-top: 10px;
}

.alapi-player-search input {
  min-width: 0;
  height: 34px;
  padding: 0 12px;
  color: #f5f7ff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  outline: none;
}

.alapi-player-search button,
.alapi-player-controls button,
.alapi-player-mini button {
  height: 34px;
  color: #f5f7ff;
  font-weight: 800;
  background: rgba(108, 114, 247, 0.78);
  border: 0;
  border-radius: 10px;
  cursor: pointer;
}

.alapi-player-search button:disabled,
.alapi-player-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alapi-player-history {
  margin-top: 8px;
}

.alapi-player-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  color: #a9afc4;
  font-size: 12px;
}

.alapi-player-section-title button {
  padding: 0;
  color: #ff7b7b;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.alapi-player-history-tags {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.alapi-player-history-tags button {
  flex: 0 0 auto;
  padding: 4px 9px;
  color: #dfe4ff;
  background: rgba(108, 114, 247, 0.18);
  border: 1px solid rgba(108, 114, 247, 0.28);
  border-radius: 999px;
  cursor: pointer;
}

.alapi-player-results {
  max-height: 112px;
  margin-top: 8px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.alapi-player-result {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  color: #e8ebff;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.alapi-player-result:hover {
  background: rgba(108, 114, 247, 0.22);
}

.alapi-player-result span,
.alapi-player-result em {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alapi-player-result span {
  flex: 1 1 auto;
}

.alapi-player-result em {
  flex: 0 1 150px;
  color: #9aa1b7;
  font-style: normal;
}

.alapi-player-api-panel {
  margin-top: 8px;
}

.alapi-player-api-panel summary {
  color: #7c83ff;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.alapi-player-api-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.alapi-player-api-grid a {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  color: #e8ebff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.alapi-player-api-grid span,
.alapi-player-api-grid em {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alapi-player-api-grid span {
  color: #9aa1b7;
  font-size: 11px;
}

.alapi-player-api-grid em {
  color: #7fd7c8;
  font-size: 11px;
  font-style: normal;
}

.alapi-player-extra {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.alapi-player-extra-card {
  min-width: 0;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.alapi-player-extra-card strong {
  color: #f5f7ff;
  font-size: 12px;
}

.alapi-player-extra-card p {
  margin: 4px 0 0;
  overflow: hidden;
  color: #a9afc4;
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alapi-player-controls {
  margin-top: 10px;
}

.alapi-player-controls button {
  min-width: 38px;
  padding: 0 10px;
}

.alapi-player-controls .primary-control {
  min-width: 62px;
}

.alapi-player-controls input {
  flex: 1 1 auto;
  min-width: 70px;
}

.alapi-player-time {
  flex: 0 0 auto;
  color: #a9afc4;
  font-size: 12px;
}

.alapi-player-footer {
  justify-content: space-between;
  margin-top: 8px;
}

.alapi-player-status {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alapi-player-footer label {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.alapi-player-footer input {
  width: 78px;
}

.alapi-player.collapsed {
  width: min(230px, calc(100vw - 48px));
}

.alapi-player-mini {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 999px;
}

.alapi-player-mini button {
  width: 44px;
  border-radius: 50%;
}

.alapi-player-mini div {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.alapi-player-mini strong,
.alapi-player-mini span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alapi-player-mini span {
  color: #a9afc4;
  font-size: 12px;
}

@keyframes alapi-pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.04);
  }
}

@media (max-width: 720px) {
  .alapi-player {
    left: 12px;
    right: 12px;
    bottom: 12px;
    width: auto;
  }

  .alapi-player-panel {
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 10px;
  }

  .alapi-player-cover {
    width: 56px;
    height: 56px;
  }

  .alapi-player-title-row,
  .alapi-player-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .alapi-player-api-grid,
  .alapi-player-extra {
    grid-template-columns: 1fr;
  }
}
</style>
