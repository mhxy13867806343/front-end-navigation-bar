<template>
  <section class="alapi-player" :class="{ collapsed: isCollapsed }" :style="playerThemeStyle" aria-label="ALAPI 底部音乐播放器">
    <button class="alapi-player-toggle" type="button" @click="toggleCollapsed">
      {{ isCollapsed ? '展开音乐' : '收起' }}
    </button>

    <div v-if="!isCollapsed" class="alapi-player-panel">
      <div class="alapi-player-cover" :class="{ playing: isPlaying }">
        <span>{{ currentSong ? '♪' : '♫' }}</span>
      </div>

      <div class="alapi-player-body">
        <div class="alapi-player-workspace">
        <div class="alapi-player-title-row">
          <div class="alapi-player-song">
            <strong>{{ currentSong?.name || 'ALAPI 音乐播放器' }}</strong>
            <span>{{ currentSong?.artists || '搜索歌曲后点击播放' }}</span>
          </div>
        </div>

        <div class="alapi-player-search">
          <input
            v-model.trim="keyword"
            type="search"
            placeholder="搜索歌曲，例如：慢慢懂"
            @keydown.enter="searchSongs(searchPage)"
          >
          <button type="button" :disabled="isSearching" @click="searchSongs(searchPage)">
            {{ isSearching ? '搜索中' : '搜索' }}
          </button>
        </div>

        <div class="alapi-player-search-filters">
          <el-select
            v-model="searchType"
            size="large"
            placeholder="搜索类型"
            popper-class="alapi-player-select-popper"
            :teleported="false"
            :popper-options="searchTypePopperOptions"
            placement="bottom-start"
            :fallback-placements="['bottom-start']"
            fit-input-width
          >
            <el-option
              v-for="typeOption in searchTypeOptions"
              :key="typeOption.value"
              :label="typeOption.label"
              :value="typeOption.value"
            />
          </el-select>
          <el-input-number
            v-model="searchLimit"
            size="large"
            :min="1"
            :max="30"
            controls-position="right"
            aria-label="返回数量"
          />
          <el-input-number
            v-model="searchPage"
            size="large"
            :min="1"
            controls-position="right"
            aria-label="分页页码"
          />
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

        <details class="alapi-player-import-panel">
          <summary>歌单导入</summary>
          <div class="alapi-player-import-form">
            <input
              v-model.trim="playlistImportId"
              type="text"
              inputmode="numeric"
              placeholder="输入网易云歌单 ID，例如 440342015"
              @keydown.enter="fetchPlaylistSongs"
            >
            <button type="button" :disabled="isFetchingPlaylist" @click="fetchPlaylistSongs">
              {{ isFetchingPlaylist ? '获取中' : '获取歌单' }}
            </button>
          </div>
          <div v-if="playlistImportSongs.length" class="alapi-player-import-result">
            <div class="alapi-player-import-header">
              <span>已获取 {{ playlistImportSongs.length }} 首</span>
              <button type="button" @click="openPlaylistImportDialog">
                勾选添加
              </button>
            </div>
            <div class="alapi-player-import-list">
              <button
                v-for="song in playlistImportSongs.slice(0, 8)"
                :key="song.id"
                type="button"
                @click="playSong(song)"
              >
                <span>{{ song.name }}</span>
                <em>{{ song.artists }}</em>
              </button>
            </div>
          </div>
        </details>

        <template v-if="searchResults.length">
          <div class="alapi-player-search-result-bar">
            <span>搜索结果 {{ searchResults.length }} 首</span>
            <div>
              <button type="button" @click="openBatchAddDialog">
                批量添加到播放列表
              </button>
            </div>
          </div>
          <div class="alapi-player-results">
            <div
              v-for="song in searchResults"
              :key="song.id"
              class="alapi-player-result"
            >
              <button type="button" class="alapi-player-result-play" @click="playSong(song)">
                <span>{{ song.name }}</span>
                <em>{{ song.artists }}</em>
              </button>
              <div class="alapi-player-result-actions">
                <button type="button" @click="playSong(song)">播放</button>
                <button type="button" @click="openSongDetail(song)">查看详情</button>
              </div>
            </div>
          </div>
        </template>
        <div v-else-if="hasSearched" class="alapi-player-empty-state">
          没有找到歌曲，换个关键词或搜索条件试试
        </div>

        <details class="alapi-player-theme-panel">
          <summary>播放器样式</summary>
          <div class="alapi-player-theme-grid">
            <label>
              主色
              <input v-model="playerTheme.accentColor" type="color" @input="applyPlayerTheme">
            </label>
            <label>
              背景
              <input v-model="playerTheme.backgroundColor" type="color" @input="applyPlayerTheme">
            </label>
            <label>
              文字
              <input v-model="playerTheme.textColor" type="color" @input="applyPlayerTheme">
            </label>
            <label>
              字号
              <input v-model.number="playerTheme.fontSize" type="range" min="12" max="18" @input="applyPlayerTheme">
            </label>
          </div>
        </details>

        </div>
      </div>

      <section class="alapi-player-playlist" aria-label="播放列表">
        <div class="alapi-player-playlist-tabs">
          <button
            class="alapi-player-playlist-add"
            type="button"
            title="新增播放列表"
            @click="createPlaylistGroupTab"
          >
            + 新增
          </button>
          <button
            v-for="group in visiblePlaylistGroups"
            :key="group.id"
            type="button"
            class="alapi-player-playlist-tab"
            :class="{ active: activePlaylistGroupIndex === group.index }"
            :title="`播放列表 ${group.index + 1}`"
            @click="switchPlaylistGroup(group.index)"
          >
            <span class="alapi-player-sr-only">播放列表 {{ group.index + 1 }}</span>
            <span>{{ group.name }}</span>
            <em>{{ group.songs.length }}/{{ MAX_PLAYLIST_SONGS }}</em>
            <i role="button" tabindex="0" title="重命名" @click.stop="renamePlaylistGroup(group.index)">改</i>
            <i role="button" tabindex="0" title="删除" @click.stop="deletePlaylistGroup(group.index)">删</i>
          </button>
        </div>
        <div class="alapi-player-playlist-header">
          <div>
            <strong>{{ activePlaylistGroup?.name || '播放列表 1' }}</strong>
            <span>当前 {{ playlist.length }} 首 / 总计 {{ totalPlaylistSongCount }} 首</span>
          </div>
          <button type="button" :disabled="!playlist.length" title="清空当前播放列表" @click="confirmClearPlaylist">
            清空
          </button>
        </div>
        <div class="alapi-player-playlist-tools">
          <input
            v-model.trim="playlistSearchKeyword"
            type="search"
            placeholder="搜索播放列表歌曲或歌手"
          >
        </div>
        <div v-if="playlist.length" ref="playlistPanelRef" class="alapi-player-playlist-list">
          <div
            v-for="song in filteredPlaylist"
            :key="song.id"
            role="button"
            tabindex="0"
            class="alapi-player-playlist-item"
            :class="{ active: currentIndex === song.originalIndex }"
            :data-playlist-index="song.originalIndex"
            @click="playPlaylistSong(song.originalIndex)"
            @keydown.enter.prevent="playPlaylistSong(song.originalIndex)"
            @keydown.space.prevent="playPlaylistSong(song.originalIndex)"
          >
            <span class="playlist-index">{{ currentIndex === song.originalIndex && isPlaying ? '▶' : song.originalIndex + 1 }}</span>
            <span class="playlist-title">
              <strong>{{ song.name }}</strong>
              <em>{{ song.artists }}</em>
            </span>
            <span class="playlist-duration">{{ formatSeconds(song.duration / 1000) }}</span>
            <button
              class="playlist-detail"
              type="button"
              title="查看详情"
              @click.stop="openSongDetail(song)"
            >
              详情
            </button>
            <button
              class="playlist-remove"
              type="button"
              title="从播放列表移除"
              @click.stop="removePlaylistSong(song.originalIndex)"
            >
              移除
            </button>
          </div>
          <div v-if="playlist.length && !filteredPlaylist.length" class="alapi-player-playlist-empty">
            当前播放列表没有匹配歌曲
          </div>
        </div>
        <div v-else class="alapi-player-playlist-empty">
          勾选搜索结果后批量添加，或点击歌名直接播放
        </div>
      </section>

      <aside class="alapi-player-side">
        <div class="alapi-player-side-header">
          <div>
            <strong>歌词</strong>
            <span>{{ currentSong?.name || '未选择歌曲' }}</span>
          </div>
          <em>{{ lyricLines.length }} 行</em>
        </div>

        <div ref="lyricPanelRef" class="alapi-player-lyrics">
          <button
            v-for="(line, index) in lyricLines"
            :key="`${line.time}-${index}`"
            type="button"
            class="alapi-player-lyric-line"
            :class="{ active: currentLyricIndex === index }"
            :data-lyric-index="index"
            @click="seekToLyric(line)"
          >
            <span>{{ formatSeconds(line.time / 1000) }}</span>
            <strong>{{ line.text }}</strong>
          </button>
          <div v-if="!lyricLines.length" class="alapi-player-lyric-empty">
            {{ currentSong ? '暂无歌词，换一首试试' : '播放歌曲后显示滚动歌词' }}
          </div>
        </div>

        <div class="alapi-player-comments">
          <strong>热评</strong>
          <div v-if="hotComments.length" class="alapi-player-comment-list">
            <p v-for="comment in hotComments" :key="comment">{{ comment }}</p>
          </div>
          <p v-else>暂无热评</p>
        </div>
      </aside>

      <div class="alapi-player-control-dock">
        <div class="alapi-player-playback-tools">
          <el-button class="alapi-player-mode-toggle" size="large" :title="currentPlaybackModeOption.label" @click="cyclePlaybackMode">
            <el-icon>
              <component :is="currentPlaybackModeOption.icon" />
            </el-icon>
            <span>{{ currentPlaybackModeOption.label }}</span>
          </el-button>
          <label class="alapi-player-volume-control">
            <span>音量</span>
            <input v-model.number="volume" type="range" min="0" max="100" step="1" @input="updateVolume">
          </label>
        </div>
        <div class="alapi-player-controls">
          <el-button circle size="large" :disabled="!playlist.length" title="上一首" @click="playPrevious">
            <el-icon><DArrowLeft /></el-icon>
          </el-button>
          <el-button class="primary-control" circle size="large" :disabled="!currentSong" title="播放/暂停" @click="togglePlay">
            <el-icon>
              <VideoPause v-if="isPlaying" />
              <VideoPlay v-else />
            </el-icon>
          </el-button>
          <el-button circle size="large" :disabled="!playlist.length" title="下一首" @click="playNext">
            <el-icon><DArrowRight /></el-icon>
          </el-button>
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
        </div>
      </div>
    </div>

    <div v-else class="alapi-player-mini">
      <button type="button" @click="togglePlay">{{ isPlaying ? '⏸' : '▶' }}</button>
      <button
        type="button"
        class="alapi-player-mini-info"
        title="打开完整音乐播放器"
        @click="openFullPlayer"
      >
        <strong>{{ currentSong?.name || '音乐' }}</strong>
        <span>{{ currentSong?.artists || 'ALAPI' }}</span>
      </button>
    </div>

    <el-dialog v-model="isBatchDialogVisible" title="批量添加歌曲" class="alapi-player-dialog" width="560px">
      <div class="alapi-player-dialog-hint">
        默认不选中，勾选后会添加到播放列表顶部；已存在的歌曲会自动跳过。
      </div>
      <div class="alapi-player-dialog-actions">
        <button type="button" @click="selectAllSearchResults">全选</button>
        <button type="button" @click="clearSelectedSearchResults">清空</button>
      </div>
      <el-checkbox-group v-model="selectedSearchSongIds" class="alapi-player-batch-list">
        <el-checkbox
          v-for="song in searchResults"
          :key="song.id"
          :value="song.id"
        >
          <span>{{ song.name }}</span>
          <em>{{ song.artists }}</em>
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <button type="button" class="alapi-player-dialog-secondary" @click="isBatchDialogVisible = false">
          取消
        </button>
        <button type="button" class="alapi-player-dialog-primary" @click="addSearchResultsToPlaylist">
          添加到播放列表
        </button>
      </template>
    </el-dialog>

    <el-dialog v-model="isPlaylistImportDialogVisible" title="从歌单添加歌曲" class="alapi-player-dialog" width="620px">
      <div class="alapi-player-dialog-hint">
        默认不选中，勾选后会添加到播放列表顶部；已存在于任意播放列表的歌曲会自动跳过。
      </div>
      <div class="alapi-player-dialog-actions">
        <button type="button" @click="selectAllPlaylistImportSongs">全选</button>
        <button type="button" @click="clearSelectedPlaylistImportSongs">清空</button>
      </div>
      <el-checkbox-group v-model="selectedPlaylistImportSongIds" class="alapi-player-batch-list">
        <el-checkbox
          v-for="song in playlistImportSongs"
          :key="song.id"
          :value="song.id"
        >
          <span>{{ song.name }}</span>
          <em>{{ song.artists }}</em>
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <button type="button" class="alapi-player-dialog-secondary" @click="isPlaylistImportDialogVisible = false">
          取消
        </button>
        <button type="button" class="alapi-player-dialog-primary" @click="addPlaylistImportSongsToPlaylist">
          添加到播放列表
        </button>
      </template>
    </el-dialog>

    <el-dialog v-model="isDetailDialogVisible" title="歌曲详情" class="alapi-player-dialog" width="460px">
      <div v-if="detailSong" class="alapi-player-song-detail">
        <strong>{{ detailSong.name }}</strong>
        <p>歌手：{{ detailSong.artists }}</p>
        <p>专辑：{{ detailSong.album }}</p>
        <p>时长：{{ formatSeconds(detailSong.duration / 1000) }}</p>
        <p>网易云 ID：{{ detailSong.id }}</p>
        <a :href="`https://music.163.com/#/song?id=${detailSong.id}`" target="_blank" rel="noopener noreferrer">
          打开网易云详情
        </a>
      </div>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DArrowLeft,
  DArrowRight,
  List,
  Refresh,
  Switch,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import type { Component } from 'vue'
import type { Options as PopperOptions } from '@popperjs/core'
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

interface AlapiPlaylistSong {
  id?: number
  name?: string
  user_name?: string
  user_id?: number
  duration?: number
}

interface AlapiPlaylistData {
  playlist?: AlapiPlaylistSong[]
  name?: string
  nickname?: string
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

interface PlayerListGroup {
  id: string
  name: string
  songs: PlayerSong[]
}

interface PlayerListGroupView extends PlayerListGroup {
  index: number
}

interface PlaylistSongView extends PlayerSong {
  originalIndex: number
}

interface LyricLine {
  time: number
  text: string
}

type PlaybackMode = 'sequence' | 'shuffle' | 'single'

interface PlaybackModeOption {
  value: PlaybackMode
  label: string
  icon: Component
}

interface SearchTypeOption {
  value: string
  label: string
}

interface PlayerTheme {
  accentColor: string
  backgroundColor: string
  textColor: string
  fontSize: number
}

interface PlayerStorageState {
  keyword?: string
  searchHistory?: string[]
  playlist?: PlayerSong[]
  playlistGroups?: PlayerListGroup[]
  activePlaylistGroupIndex?: number
  currentIndex?: number
  volume?: number
  isCollapsed?: boolean
  currentSeconds?: number
  durationSeconds?: number
  progress?: number
  lyricLines?: LyricLine[]
  currentLyricIndex?: number
  hotComments?: string[]
  statusText?: string
  wasPlaying?: boolean
  playlistSearchKeyword?: string
  playbackMode?: PlaybackMode
  searchLimit?: number
  searchPage?: number
  searchType?: string
  playerTheme?: PlayerTheme
}

const ALAPI_TOKEN: string = 'qgqofofvmxtoskffd37omkscobipmn'
const ALAPI_BASE_URL: string = 'https://v3.alapi.cn'
const MUSIC_SEARCH_PATH: string = '/api-alapi/api/music/search'
const MUSIC_URL_PATH: string = '/api-alapi/api/music/url'
const MUSIC_LYRIC_PATH: string = '/api-alapi/api/music/lyric'
const MUSIC_HOT_COMMENT_PATH: string = '/api-alapi/api/music/comment/hot'
const MUSIC_PLAYLIST_PATH: string = '/api-alapi/api/music/playlist'
const PLAYER_STORAGE_KEY: string = 'alapi_bottom_music_player_state'
const DEFAULT_KEYWORD: string = '慢慢懂'
const SEARCH_LIMIT: number = 10
const SEARCH_TYPE: string = '1'
const MAX_PLAYLIST_SONGS: number = 100
const DEFAULT_PLAYER_THEME: PlayerTheme = {
  accentColor: '#7fd7c8',
  backgroundColor: '#0f1018',
  textColor: '#f5f7ff',
  fontSize: 13
}
const searchTypeOptions: SearchTypeOption[] = [
  { value: '1', label: '单曲' },
  { value: '10', label: '专辑' },
  { value: '100', label: '歌手' },
  { value: '1000', label: '歌单' },
  { value: '1004', label: 'MV' },
  { value: '1006', label: '歌词' },
  { value: '1009', label: '电台' },
  { value: '1014', label: '视频' },
  { value: '1018', label: '综合' }
]
const playbackModes: PlaybackModeOption[] = [
  { value: 'sequence', label: '顺序播放', icon: List },
  { value: 'shuffle', label: '随机播放', icon: Switch },
  { value: 'single', label: '单曲循环', icon: Refresh }
]
const searchTypePopperOptions: PopperOptions = {
  placement: 'bottom-start',
  strategy: 'fixed',
  modifiers: [
    {
      name: 'flip',
      enabled: false
    },
    {
      name: 'preventOverflow',
      options: {
        boundary: 'viewport',
        padding: 8
      }
    }
  ]
}
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
const selectedSearchSongIds: Ref<number[]> = ref<number[]>([])
const searchHistory: Ref<string[]> = ref<string[]>([])
const hasSearched: Ref<boolean> = ref<boolean>(false)
const searchLimit: Ref<number> = ref<number>(SEARCH_LIMIT)
const searchPage: Ref<number> = ref<number>(1)
const searchType: Ref<string> = ref<string>(SEARCH_TYPE)
const playlistGroups: Ref<PlayerListGroup[]> = ref<PlayerListGroup[]>([
  createPlaylistGroup(0)
])
const activePlaylistGroupIndex: Ref<number> = ref<number>(0)
const currentIndex: Ref<number> = ref<number>(0)
const playlistSearchKeyword: Ref<string> = ref<string>('')
const playbackMode: Ref<PlaybackMode> = ref<PlaybackMode>('sequence')
const isBatchDialogVisible: Ref<boolean> = ref<boolean>(false)
const isDetailDialogVisible: Ref<boolean> = ref<boolean>(false)
const detailSong: Ref<PlayerSong | null> = ref<PlayerSong | null>(null)
const playerTheme: Ref<PlayerTheme> = ref<PlayerTheme>({ ...DEFAULT_PLAYER_THEME })
const isPlaying: Ref<boolean> = ref<boolean>(false)
const isSearching: Ref<boolean> = ref<boolean>(false)
const isCollapsed: Ref<boolean> = ref<boolean>(false)
const statusText: Ref<string> = ref<string>('输入关键词，按 Enter 搜索歌曲')
const progress: Ref<number> = ref<number>(0)
const volume: Ref<number> = ref<number>(70)
const currentSeconds: Ref<number> = ref<number>(0)
const durationSeconds: Ref<number> = ref<number>(0)
const lyricLines: Ref<LyricLine[]> = ref<LyricLine[]>([])
const currentLyricIndex: Ref<number> = ref<number>(-1)
const lyricPanelRef: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)
const playlistPanelRef: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)
const hotComments: Ref<string[]> = ref<string[]>([])
const playlistImportId: Ref<string> = ref<string>('440342015')
const playlistImportSongs: Ref<PlayerSong[]> = ref<PlayerSong[]>([])
const selectedPlaylistImportSongIds: Ref<number[]> = ref<number[]>([])
const isFetchingPlaylist: Ref<boolean> = ref<boolean>(false)
const isPlaylistImportDialogVisible: Ref<boolean> = ref<boolean>(false)
const pendingRestoreSeconds: Ref<number> = ref<number>(0)
let lastPlaybackSaveAt: number = 0
let playRequestId: number = 0
const audio: HTMLAudioElement = new Audio()

const activePlaylistGroup: ComputedRef<PlayerListGroup> = computed<PlayerListGroup>(() => {
  return getActivePlaylistGroup()
})

const visiblePlaylistGroups: ComputedRef<PlayerListGroupView[]> = computed<PlayerListGroupView[]>(() => {
  return playlistGroups.value.map((group: PlayerListGroup, index: number): PlayerListGroupView => ({
    ...group,
    index
  }))
})

const playlist: ComputedRef<PlayerSong[]> = computed<PlayerSong[]>(() => {
  return activePlaylistGroup.value.songs
})

const filteredPlaylist: ComputedRef<PlaylistSongView[]> = computed<PlaylistSongView[]>(() => {
  const normalizedKeyword: string = playlistSearchKeyword.value.trim().toLowerCase()
  return playlist.value
    .map((song: PlayerSong, index: number): PlaylistSongView => ({
      ...song,
      originalIndex: index
    }))
    .filter((song: PlaylistSongView): boolean => {
      if (!normalizedKeyword) return true
      return `${song.name} ${song.artists} ${song.album}`.toLowerCase().includes(normalizedKeyword)
    })
})

const totalPlaylistSongCount: ComputedRef<number> = computed<number>(() => {
  return playlistGroups.value.reduce((total: number, group: PlayerListGroup): number => total + group.songs.length, 0)
})

const currentSong: ComputedRef<PlayerSong | null> = computed<PlayerSong | null>(() => {
  return playlist.value[currentIndex.value] ?? null
})

const currentTimeText: ComputedRef<string> = computed<string>(() => formatSeconds(currentSeconds.value))
const durationText: ComputedRef<string> = computed<string>(() => formatSeconds(durationSeconds.value))
const currentPlaybackModeOption: ComputedRef<PlaybackModeOption> = computed<PlaybackModeOption>(() => {
  return playbackModes.find((mode: PlaybackModeOption): boolean => mode.value === playbackMode.value) ?? playbackModes[0]
})
const playerThemeStyle: ComputedRef<Record<string, string>> = computed<Record<string, string>>(() => ({
  '--alapi-accent-color': playerTheme.value.accentColor,
  '--alapi-bg-color': hexToRgba(playerTheme.value.backgroundColor, 0.94),
  '--alapi-text-color': playerTheme.value.textColor,
  '--alapi-font-size': `${playerTheme.value.fontSize}px`
}))

function createPlaylistGroup(index: number): PlayerListGroup {
  return {
    id: `playlist-${index + 1}-${Date.now()}`,
    name: `播放列表${index + 1}`,
    songs: []
  }
}

function createPlaylistGroupTab(): void {
  const nextGroup: PlayerListGroup = createPlaylistGroup(playlistGroups.value.length)
  playlistGroups.value.push(nextGroup)
  activePlaylistGroupIndex.value = playlistGroups.value.length - 1
  currentIndex.value = 0
  playlistSearchKeyword.value = ''
  statusText.value = `已新增${nextGroup.name}`
  saveState()
  scrollPlaylistToTop()
}

function renamePlaylistGroup(groupIndex: number): void {
  const targetGroup: PlayerListGroup | undefined = playlistGroups.value[groupIndex]
  if (!targetGroup) return

  void ElMessageBox.prompt(
    '请输入新的播放列表名称',
    `重命名${targetGroup.name}`,
    {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputValue: targetGroup.name,
      inputPattern: /\S/,
      inputErrorMessage: '名称不能为空'
    }
  ).then((result): void => {
    const nextName: string = String(result.value ?? '').trim()
    if (!nextName) return
    targetGroup.name = nextName.slice(0, 16)
    statusText.value = `已重命名为：${targetGroup.name}`
    saveState()
  }).catch((): void => {})
}

function deletePlaylistGroup(groupIndex: number): void {
  const targetGroup: PlayerListGroup | undefined = playlistGroups.value[groupIndex]
  if (!targetGroup) return
  if (playlistGroups.value.length <= 1) {
    ElMessage.warning('至少保留一个播放列表')
    return
  }

  void ElMessageBox.confirm(
    `确定要删除${targetGroup.name}吗？其中 ${targetGroup.songs.length} 首歌曲也会移除。`,
    `删除${targetGroup.name}`,
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then((): void => {
    const isDeletingActiveGroup: boolean = groupIndex === activePlaylistGroupIndex.value
    playlistGroups.value.splice(groupIndex, 1)
    if (activePlaylistGroupIndex.value > groupIndex) {
      activePlaylistGroupIndex.value -= 1
    } else if (isDeletingActiveGroup) {
      activePlaylistGroupIndex.value = Math.min(groupIndex, playlistGroups.value.length - 1)
      currentIndex.value = 0
      if (!playlist.value.length) {
        isPlaying.value = false
        progress.value = 0
        currentSeconds.value = 0
        durationSeconds.value = 0
        lyricLines.value = []
        currentLyricIndex.value = -1
        hotComments.value = []
      }
    }
    statusText.value = `已删除${targetGroup.name}`
    saveState()
    scrollPlaylistToTop()
  }).catch((): void => {})
}

function getActivePlaylistGroup(): PlayerListGroup {
  if (!playlistGroups.value.length) {
    playlistGroups.value.push(createPlaylistGroup(0))
  }

  const safeIndex: number = Math.min(
    Math.max(activePlaylistGroupIndex.value, 0),
    playlistGroups.value.length - 1
  )
  activePlaylistGroupIndex.value = safeIndex
  return playlistGroups.value[safeIndex]
}

function findAvailablePlaylistGroup(): PlayerListGroup {
  const availableGroup: PlayerListGroup | undefined = playlistGroups.value.find((group: PlayerListGroup): boolean => group.songs.length < MAX_PLAYLIST_SONGS)
  if (availableGroup) return availableGroup

  const nextGroup: PlayerListGroup = createPlaylistGroup(playlistGroups.value.length)
  playlistGroups.value.push(nextGroup)
  return nextGroup
}

function findSongLocation(songId: number): { groupIndex: number, songIndex: number } | null {
  for (let groupIndex: number = 0; groupIndex < playlistGroups.value.length; groupIndex += 1) {
    const songIndex: number = playlistGroups.value[groupIndex].songs.findIndex((song: PlayerSong): boolean => song.id === songId)
    if (songIndex >= 0) {
      return { groupIndex, songIndex }
    }
  }
  return null
}

function switchPlaylistGroup(groupIndex: number): void {
  if (!playlistGroups.value[groupIndex]) return
  activePlaylistGroupIndex.value = groupIndex
  currentIndex.value = Math.min(currentIndex.value, Math.max(playlist.value.length - 1, 0))
  scrollPlaylistToTop()
  saveState()
}

function scrollPlaylistToTop(): void {
  void nextTick((): void => {
    if (playlistPanelRef.value) {
      playlistPanelRef.value.scrollTop = 0
    }
  })
}

function scrollPlaylistToCurrentSong(): void {
  void nextTick((): void => {
    if (!playlistPanelRef.value) return
    const activeItem: HTMLElement | null = playlistPanelRef.value.querySelector<HTMLElement>(`[data-playlist-index="${currentIndex.value}"]`)
    activeItem?.scrollIntoView({
      block: 'center',
      behavior: 'smooth'
    })
  })
}

function buildMusicSearchUrl(searchKeyword: string, page: number): string {
  const safeLimit: number = Math.min(Math.max(Number(searchLimit.value) || SEARCH_LIMIT, 1), 30)
  const params: URLSearchParams = new URLSearchParams({
    token: ALAPI_TOKEN,
    keyword: searchKeyword,
    limit: String(safeLimit),
    page: String(page),
    type: searchType.value
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

function buildMusicPlaylistApi(playlistId: string): string {
  const params: URLSearchParams = new URLSearchParams({
    token: ALAPI_TOKEN,
    id: playlistId
  })
  return `${MUSIC_PLAYLIST_PATH}?${params.toString()}`
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

function normalizePlaylistSong(song: AlapiPlaylistSong): PlayerSong | null {
  if (!song.id || !song.name) return null
  return {
    id: song.id,
    name: song.name,
    artists: song.user_name?.trim() || '歌单歌曲',
    album: '歌单导入',
    duration: song.duration ?? 0,
    url: ''
  }
}

function setPlaybackMode(mode: PlaybackMode): void {
  playbackMode.value = mode
  const modeLabel: string = playbackModes.find((item: PlaybackModeOption): boolean => item.value === mode)?.label ?? '顺序播放'
  statusText.value = `已切换为${modeLabel}`
  saveState()
}

function handlePlaybackModeChange(value: string | number | boolean | undefined): void {
  if (value !== 'sequence' && value !== 'shuffle' && value !== 'single') return
  setPlaybackMode(value)
}

function cyclePlaybackMode(): void {
  const currentModeIndex: number = playbackModes.findIndex((mode: PlaybackModeOption): boolean => mode.value === playbackMode.value)
  const nextMode: PlaybackModeOption = playbackModes[(currentModeIndex + 1) % playbackModes.length] ?? playbackModes[0]
  setPlaybackMode(nextMode.value)
}

function pickNextIndex(): number {
  if (!playlist.value.length) return 0
  if (playbackMode.value === 'single') return currentIndex.value
  if (playbackMode.value === 'shuffle') {
    if (playlist.value.length === 1) return 0
    let nextIndex: number = currentIndex.value
    while (nextIndex === currentIndex.value) {
      nextIndex = Math.floor(Math.random() * playlist.value.length)
    }
    return nextIndex
  }
  return currentIndex.value >= playlist.value.length - 1 ? 0 : currentIndex.value + 1
}

function pickPreviousIndex(): number {
  if (!playlist.value.length) return 0
  if (playbackMode.value === 'single') return currentIndex.value
  if (playbackMode.value === 'shuffle') {
    if (playlist.value.length === 1) return 0
    let previousIndex: number = currentIndex.value
    while (previousIndex === currentIndex.value) {
      previousIndex = Math.floor(Math.random() * playlist.value.length)
    }
    return previousIndex
  }
  return currentIndex.value <= 0 ? playlist.value.length - 1 : currentIndex.value - 1
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

  const safePage: number = Math.max(Number(page) || 1, 1)
  searchPage.value = safePage
  searchLimit.value = Math.min(Math.max(Number(searchLimit.value) || SEARCH_LIMIT, 1), 30)
  isSearching.value = true
  hasSearched.value = true
  statusText.value = '正在从 ALAPI 搜索音乐...'
  addSearchHistory(searchKeyword)

  try {
    const response: AlapiResponse<AlapiSearchData> = await requestJson<AlapiResponse<AlapiSearchData>>(buildMusicSearchUrl(searchKeyword, safePage))
    if (!response.success || !response.data?.songs) {
      throw new Error(response.message || '搜索失败')
    }

    searchResults.value = response.data.songs
      .map((song: AlapiSong): PlayerSong | null => normalizeSong(song))
      .filter((song: PlayerSong | null): song is PlayerSong => song !== null)
    selectedSearchSongIds.value = []

    statusText.value = searchResults.value.length
      ? `找到 ${searchResults.value.length} 首，点击歌名播放`
      : '没有找到歌曲，换个关键词或搜索条件试试'
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : '搜索失败，请稍后再试'
    searchResults.value = []
    selectedSearchSongIds.value = []
    statusText.value = `${message}，没有找到歌曲`
  } finally {
    isSearching.value = false
    saveState()
  }
}

function addSearchHistory(searchKeyword: string): void {
  const normalizedKeyword: string = searchKeyword.trim()
  if (!normalizedKeyword) return
  searchHistory.value = [
    normalizedKeyword,
    ...searchHistory.value.filter((item: string): boolean => item !== normalizedKeyword)
  ].slice(0, 12)
  saveState()
}

function searchFromHistory(searchKeyword: string): void {
  keyword.value = searchKeyword
  void searchSongs(1)
}

function selectAllSearchResults(): void {
  selectedSearchSongIds.value = searchResults.value.map((song: PlayerSong): number => song.id)
}

function clearSelectedSearchResults(): void {
  selectedSearchSongIds.value = []
}

function selectAllPlaylistImportSongs(): void {
  selectedPlaylistImportSongIds.value = playlistImportSongs.value.map((song: PlayerSong): number => song.id)
}

function clearSelectedPlaylistImportSongs(): void {
  selectedPlaylistImportSongIds.value = []
}

function openBatchAddDialog(): void {
  if (!searchResults.value.length) {
    ElMessage.warning('没有可添加的搜索结果')
    return
  }

  selectedSearchSongIds.value = []
  isBatchDialogVisible.value = true
}

function openSongDetail(song: PlayerSong): void {
  detailSong.value = song
  isDetailDialogVisible.value = true
}

function openPlaylistImportDialog(): void {
  if (!playlistImportSongs.value.length) {
    ElMessage.warning('请先获取歌单歌曲')
    return
  }

  selectedPlaylistImportSongIds.value = []
  isPlaylistImportDialogVisible.value = true
}

async function fetchPlaylistSongs(): Promise<void> {
  const safePlaylistId: string = playlistImportId.value.trim()
  if (!safePlaylistId) {
    statusText.value = '请输入网易云歌单 ID'
    ElMessage.warning('请输入网易云歌单 ID')
    return
  }

  isFetchingPlaylist.value = true
  statusText.value = '正在获取歌单歌曲...'

  try {
    const response: AlapiResponse<AlapiPlaylistData> = await requestJson<AlapiResponse<AlapiPlaylistData>>(buildMusicPlaylistApi(safePlaylistId))
    if (!response.success || !response.data?.playlist) {
      throw new Error(response.message || '歌单获取失败')
    }

    playlistImportSongs.value = response.data.playlist
      .map((song: AlapiPlaylistSong): PlayerSong | null => normalizePlaylistSong(song))
      .filter((song: PlayerSong | null): song is PlayerSong => song !== null)
    selectedPlaylistImportSongIds.value = []
    statusText.value = playlistImportSongs.value.length
      ? `歌单已获取 ${playlistImportSongs.value.length} 首，可勾选添加`
      : '歌单里没有可导入的歌曲'
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : '歌单获取失败'
    playlistImportSongs.value = []
    selectedPlaylistImportSongIds.value = []
    statusText.value = `${message}，请检查歌单 ID`
  } finally {
    isFetchingPlaylist.value = false
    saveState()
  }
}

function applyPlayerTheme(): void {
  playerTheme.value.fontSize = Math.min(Math.max(Number(playerTheme.value.fontSize) || DEFAULT_PLAYER_THEME.fontSize, 12), 18)
  saveState()
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

function confirmClearPlaylist(): void {
  void ElMessageBox.confirm(
    `确定要清空${activePlaylistGroup.value.name}吗？当前播放也会停止。`,
    `清空${activePlaylistGroup.value.name}`,
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then((): void => {
    resetPlaybackState('播放列表已清空')
    saveState()
  }).catch((): void => {})
}

function resetPlaybackState(message: string): void {
  playRequestId += 1
  audio.pause()
  audio.removeAttribute('src')
  audio.load()
  activePlaylistGroup.value.songs = []
  currentIndex.value = 0
  isPlaying.value = false
  progress.value = 0
  currentSeconds.value = 0
  durationSeconds.value = 0
  lyricLines.value = []
  currentLyricIndex.value = -1
  hotComments.value = []
  pendingRestoreSeconds.value = 0
  statusText.value = message
}

function addSongsToPlaylist(songs: PlayerSong[], emptyMessage: string): { addedCount: number, duplicateCount: number } {
  if (!songs.length) {
    statusText.value = emptyMessage
    ElMessage.warning('请先勾选要添加的歌曲')
    return { addedCount: 0, duplicateCount: 0 }
  }

  let addedCount: number = 0
  let duplicateCount: number = 0
  let firstTargetGroupIndex: number = activePlaylistGroupIndex.value
  const originalActiveGroupIndex: number = activePlaylistGroupIndex.value
  const originalActiveGroupId: string = activePlaylistGroup.value.id

  songs.forEach((song: PlayerSong): void => {
    if (findSongLocation(song.id)) {
      duplicateCount += 1
      return
    }

    const targetGroup: PlayerListGroup = findAvailablePlaylistGroup()
    const targetGroupIndex: number = playlistGroups.value.findIndex((group: PlayerListGroup): boolean => group.id === targetGroup.id)
    targetGroup.songs.unshift({ ...song, url: '' })
    if (addedCount === 0 && targetGroupIndex >= 0) {
      firstTargetGroupIndex = targetGroupIndex
    }
    addedCount += 1
  })

  if (!addedCount) {
    statusText.value = `选中的 ${duplicateCount} 首已存在播放列表`
    ElMessage.warning('选中的歌曲已存在播放列表，不会重复添加')
    return { addedCount, duplicateCount }
  }

  activePlaylistGroupIndex.value = firstTargetGroupIndex
  if (originalActiveGroupId === activePlaylistGroup.value.id && playlist.value.length > addedCount) {
    currentIndex.value += addedCount
  } else {
    currentIndex.value = 0
  }
  if (originalActiveGroupIndex !== firstTargetGroupIndex) {
    currentIndex.value = 0
  }
  scrollPlaylistToTop()
  if (duplicateCount) {
    ElMessage.warning(`${duplicateCount} 首已存在播放列表，已自动跳过`)
  } else {
    ElMessage.success(`已添加 ${addedCount} 首到${activePlaylistGroup.value.name}`)
  }
  statusText.value = duplicateCount
    ? `已添加 ${addedCount} 首，${duplicateCount} 首已存在并跳过`
    : `已批量添加 ${addedCount} 首到${activePlaylistGroup.value.name}`
  saveState()
  return { addedCount, duplicateCount }
}

function addSearchResultsToPlaylist(): void {
  if (!searchResults.value.length) return
  const selectedIds: Set<number> = new Set(selectedSearchSongIds.value)
  const songsToAdd: PlayerSong[] = searchResults.value
    .filter((song: PlayerSong): boolean => selectedIds.has(song.id))
    .map((song: PlayerSong): PlayerSong => ({ ...song }))
  const result: { addedCount: number, duplicateCount: number } = addSongsToPlaylist(songsToAdd, '请先勾选要添加的歌曲')
  if (result.addedCount > 0) {
    isBatchDialogVisible.value = false
  }
}

function addPlaylistImportSongsToPlaylist(): void {
  if (!playlistImportSongs.value.length) return
  const selectedIds: Set<number> = new Set(selectedPlaylistImportSongIds.value)
  const songsToAdd: PlayerSong[] = playlistImportSongs.value
    .filter((song: PlayerSong): boolean => selectedIds.has(song.id))
    .map((song: PlayerSong): PlayerSong => ({ ...song }))
  const result: { addedCount: number, duplicateCount: number } = addSongsToPlaylist(songsToAdd, '请先勾选要导入的歌单歌曲')
  if (result.addedCount > 0) {
    isPlaylistImportDialogVisible.value = false
  }
}

async function playSong(song: PlayerSong): Promise<void> {
  const existingLocation: { groupIndex: number, songIndex: number } | null = findSongLocation(song.id)
  if (existingLocation) {
    activePlaylistGroupIndex.value = existingLocation.groupIndex
    currentIndex.value = existingLocation.songIndex
    statusText.value = `已存在播放列表，切换到：${song.name}`
  } else {
    const targetGroup: PlayerListGroup = findAvailablePlaylistGroup()
    targetGroup.songs.unshift({ ...song, url: '' })
    activePlaylistGroupIndex.value = Math.max(0, playlistGroups.value.findIndex((group: PlayerListGroup): boolean => group.id === targetGroup.id))
    currentIndex.value = 0
  }

  scrollPlaylistToCurrentSong()
  await loadAndPlayCurrentSong(true)
  await fetchSongExtra(song.id)
  saveState()
}

async function playPlaylistSong(index: number): Promise<void> {
  const song: PlayerSong | undefined = playlist.value[index]
  if (!song) return
  currentIndex.value = index
  scrollPlaylistToCurrentSong()
  await loadAndPlayCurrentSong(true)
  await fetchSongExtra(song.id)
  saveState()
}

function removePlaylistSong(index: number): void {
  const removingSong: PlayerSong | undefined = playlist.value[index]
  if (!removingSong) return

  const isRemovingCurrent: boolean = index === currentIndex.value
  const shouldContinuePlaying: boolean = isRemovingCurrent && isPlaying.value
  if (isRemovingCurrent) {
    playRequestId += 1
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    isPlaying.value = false
    progress.value = 0
    currentSeconds.value = 0
    durationSeconds.value = 0
    lyricLines.value = []
    currentLyricIndex.value = -1
    hotComments.value = []
  }

  activePlaylistGroup.value.songs.splice(index, 1)

  if (!playlist.value.length) {
    currentIndex.value = 0
    isPlaying.value = false
    progress.value = 0
    currentSeconds.value = 0
    durationSeconds.value = 0
    lyricLines.value = []
    currentLyricIndex.value = -1
    hotComments.value = []
    statusText.value = `已移除：${removingSong.name}`
    saveState()
    return
  }

  if (index < currentIndex.value) {
    currentIndex.value -= 1
  } else if (currentIndex.value >= playlist.value.length) {
    currentIndex.value = playlist.value.length - 1
  }

  statusText.value = `已从播放列表移除：${removingSong.name}`
  if (isRemovingCurrent) {
    if (shouldContinuePlaying) {
      void loadAndPlayCurrentSong(true)
    } else {
      void restoreCurrentSong()
    }
  }
  saveState()
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

async function loadAndPlayCurrentSong(forceRefreshUrl: boolean = false): Promise<void> {
  const song: PlayerSong | null = currentSong.value
  if (!song) return

  const requestId: number = ++playRequestId
  statusText.value = `正在加载：${song.name}`
  lyricLines.value = []
  currentLyricIndex.value = -1
  hotComments.value = []
  audio.pause()
  isPlaying.value = false
  const resolvedUrl: string = forceRefreshUrl ? await resolveSongUrl(song.id) : song.url || await resolveSongUrl(song.id)
  if (requestId !== playRequestId) return
  song.url = resolvedUrl
  audio.src = resolvedUrl

  try {
    await audio.play()
    if (requestId !== playRequestId) return
    isPlaying.value = true
    statusText.value = `正在播放：${song.name}`
    void fetchSongExtra(song.id)
  } catch (error: unknown) {
    if (requestId !== playRequestId || isAbortError(error)) return
    if (!forceRefreshUrl) {
      song.url = ''
      await loadAndPlayCurrentSong(true)
      return
    }
    isPlaying.value = false
    statusText.value = '当前歌曲无法播放，请换一首'
    console.warn('音乐播放失败:', error)
  }
}

async function restoreCurrentSong(): Promise<void> {
  const song: PlayerSong | null = currentSong.value
  if (!song) return

  try {
    const resolvedUrl: string = song.url || await resolveSongUrl(song.id)
    song.url = resolvedUrl
    audio.src = resolvedUrl
    audio.preload = 'metadata'
    applyPendingRestoreTime()

    if (!lyricLines.value.length || !hotComments.value.length) {
      void fetchSongExtra(song.id)
    }

    statusText.value = `已恢复播放记录：${song.name}，点击播放继续`
    isPlaying.value = false
    saveState()
  } catch (error: unknown) {
    statusText.value = '播放记录恢复失败，请重新选择歌曲'
    console.warn('恢复播放记录失败:', error)
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
    lyricLines.value = parseLyricLines(rawLyric)
    updateCurrentLyric()
  } catch (error: unknown) {
    lyricLines.value = []
    currentLyricIndex.value = -1
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

function parseLyricLines(rawLyric: string): LyricLine[] {
  return rawLyric
    .split('\n')
    .map((line: string): LyricLine | null => {
      const match: RegExpMatchArray | null = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/)
      if (!match) return null

      const minutes: number = Number(match[1])
      const seconds: number = Number(match[2])
      const millisecondsText: string = (match[3] ?? '0').padEnd(3, '0')
      const milliseconds: number = Number(millisecondsText)
      const text: string = line.replace(/\[[^\]]+\]/g, '').trim()
      if (!text) return null

      return {
        time: (minutes * 60 * 1000) + (seconds * 1000) + milliseconds,
        text
      }
    })
    .filter((line: LyricLine | null): line is LyricLine => line !== null)
    .sort((a: LyricLine, b: LyricLine): number => a.time - b.time)
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
      if (currentSong.value) {
        currentSong.value.url = ''
        void loadAndPlayCurrentSong(true)
        return
      }
      isPlaying.value = false
      statusText.value = '播放失败，请换一首'
      console.warn('恢复播放失败:', error)
    })
}

function playPrevious(): void {
  if (!playlist.value.length) return
  currentIndex.value = pickPreviousIndex()
  scrollPlaylistToCurrentSong()
  void loadAndPlayCurrentSong(true)
  saveState()
}

function playNext(): void {
  if (!playlist.value.length) return
  currentIndex.value = pickNextIndex()
  scrollPlaylistToCurrentSong()
  void loadAndPlayCurrentSong(true)
  saveState()
}

function seekAudio(): void {
  if (!audio.duration) return
  audio.currentTime = (progress.value / 100) * audio.duration
  updateCurrentLyric()
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
  updateCurrentLyric()
  savePlaybackStateThrottled()
}

function applyPendingRestoreTime(): void {
  if (pendingRestoreSeconds.value <= 0 || !Number.isFinite(pendingRestoreSeconds.value)) return
  if (!audio.duration && audio.readyState < 1) return

  const targetSeconds: number = audio.duration
    ? Math.min(pendingRestoreSeconds.value, Math.max(audio.duration - 1, 0))
    : pendingRestoreSeconds.value

  audio.currentTime = Math.max(0, targetSeconds)
  currentSeconds.value = audio.currentTime
  pendingRestoreSeconds.value = 0
  updateCurrentLyric()
}

function handleAudioLoadedMetadata(): void {
  applyPendingRestoreTime()
  updateProgress()
  saveState()
}

function savePlaybackStateThrottled(): void {
  const now: number = Date.now()
  if (now - lastPlaybackSaveAt < 2500) return
  lastPlaybackSaveAt = now
  saveState()
}

function updateCurrentLyric(): void {
  if (!lyricLines.value.length) {
    currentLyricIndex.value = -1
    return
  }

  const currentTime: number = audio.currentTime * 1000
  const nextIndex: number = lyricLines.value.findIndex((line: LyricLine): boolean => line.time > currentTime)
  currentLyricIndex.value = nextIndex === -1 ? lyricLines.value.length - 1 : Math.max(0, nextIndex - 1)
}

function seekToLyric(line: LyricLine): void {
  audio.currentTime = line.time / 1000
  updateCurrentLyric()

  if (!isPlaying.value && currentSong.value) {
    void audio.play()
      .then((): void => {
        isPlaying.value = true
        statusText.value = `正在播放：${currentSong.value?.name ?? ''}`
      })
      .catch((error: unknown): void => {
        console.warn('点击歌词播放失败:', error)
      })
  }
}

function handleEnded(): void {
  playNext()
}

function handleAudioError(): void {
  isPlaying.value = false
  statusText.value = '音频地址暂不可用，试试列表里的其他歌曲'
}

function handleBeforeUnload(): void {
  saveState()
}

function toggleCollapsed(): void {
  isCollapsed.value = !isCollapsed.value
  saveState()
}

function openFullPlayer(): void {
  isCollapsed.value = false
  saveState()
}

function formatSeconds(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0:00'
  const minutes: number = Math.floor(totalSeconds / 60)
  const seconds: number = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function hexToRgba(hexColor: string, opacity: number): string {
  const normalizedColor: string = hexColor.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(normalizedColor)) return 'rgba(15, 16, 24, 0.94)'
  const red: number = Number.parseInt(normalizedColor.slice(0, 2), 16)
  const green: number = Number.parseInt(normalizedColor.slice(2, 4), 16)
  const blue: number = Number.parseInt(normalizedColor.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}

function saveState(): void {
  const savedCurrentSeconds: number = Number.isFinite(audio.currentTime) && audio.currentTime > 0
    ? audio.currentTime
    : currentSeconds.value
  const state: string = JSON.stringify({
    keyword: keyword.value,
    searchHistory: searchHistory.value,
    playlist: playlist.value,
    playlistGroups: playlistGroups.value,
    activePlaylistGroupIndex: activePlaylistGroupIndex.value,
    currentIndex: currentIndex.value,
    volume: volume.value,
    isCollapsed: isCollapsed.value,
    currentSeconds: savedCurrentSeconds,
    durationSeconds: durationSeconds.value,
    progress: progress.value,
    lyricLines: lyricLines.value,
    currentLyricIndex: currentLyricIndex.value,
    hotComments: hotComments.value,
    statusText: statusText.value,
    wasPlaying: isPlaying.value,
    playlistSearchKeyword: playlistSearchKeyword.value,
    playbackMode: playbackMode.value,
    searchLimit: searchLimit.value,
    searchPage: searchPage.value,
    searchType: searchType.value,
    playerTheme: playerTheme.value
  })
  localStorage.setItem(PLAYER_STORAGE_KEY, state)
}

function loadState(): void {
  const rawState: string | null = localStorage.getItem(PLAYER_STORAGE_KEY)
  if (!rawState) return

  try {
    const parsedState: PlayerStorageState = JSON.parse(rawState) as PlayerStorageState

    keyword.value = parsedState.keyword ?? DEFAULT_KEYWORD
    searchHistory.value = parsedState.searchHistory ?? []
    playlistSearchKeyword.value = parsedState.playlistSearchKeyword ?? ''
    playbackMode.value = parsedState.playbackMode ?? 'sequence'
    searchLimit.value = parsedState.searchLimit ?? SEARCH_LIMIT
    searchPage.value = parsedState.searchPage ?? 1
    searchType.value = parsedState.searchType ?? SEARCH_TYPE
    playerTheme.value = {
      ...DEFAULT_PLAYER_THEME,
      ...(parsedState.playerTheme ?? {})
    }
    if (parsedState.playlistGroups?.length) {
      playlistGroups.value = parsedState.playlistGroups.map((group: PlayerListGroup, index: number): PlayerListGroup => ({
        id: group.id || `playlist-${index + 1}`,
        name: group.name || `播放列表${index + 1}`,
        songs: group.songs ?? []
      }))
    } else {
      playlistGroups.value = [
        {
          ...createPlaylistGroup(0),
          songs: parsedState.playlist ?? []
        }
      ]
    }
    activePlaylistGroupIndex.value = Math.min(
      Math.max(parsedState.activePlaylistGroupIndex ?? 0, 0),
      Math.max(playlistGroups.value.length - 1, 0)
    )
    currentIndex.value = Math.min(Math.max(parsedState.currentIndex ?? 0, 0), Math.max(playlist.value.length - 1, 0))
    volume.value = parsedState.volume ?? 70
    isCollapsed.value = parsedState.isCollapsed ?? false
    currentSeconds.value = parsedState.currentSeconds ?? 0
    durationSeconds.value = parsedState.durationSeconds ?? 0
    progress.value = parsedState.progress ?? 0
    lyricLines.value = parsedState.lyricLines ?? []
    currentLyricIndex.value = parsedState.currentLyricIndex ?? -1
    hotComments.value = parsedState.hotComments ?? []
    pendingRestoreSeconds.value = parsedState.currentSeconds ?? 0

    if (playlist.value.length) {
      statusText.value = parsedState.wasPlaying
        ? '已恢复上次播放记录，点击播放继续'
        : parsedState.statusText ?? '已恢复上次播放记录'
    }
  } catch (error: unknown) {
    console.warn('底部音乐播放器缓存读取失败:', error)
  }
}

onMounted((): void => {
  loadState()
  updateVolume()
  audio.preload = 'metadata'
  audio.addEventListener('timeupdate', updateProgress)
  audio.addEventListener('loadedmetadata', handleAudioLoadedMetadata)
  audio.addEventListener('ended', handleEnded)
  audio.addEventListener('error', handleAudioError)
  window.addEventListener('beforeunload', handleBeforeUnload)

  if (playlist.value.length) {
    void restoreCurrentSong()
  } else {
    void searchSongs(1)
  }
})

watch(currentLyricIndex, (): void => {
  void nextTick((): void => {
    if (!lyricPanelRef.value || currentLyricIndex.value < 0) return
    const activeLine: HTMLElement | null = lyricPanelRef.value.querySelector<HTMLElement>(`[data-lyric-index="${currentLyricIndex.value}"]`)
    activeLine?.scrollIntoView({
      block: 'center',
      behavior: 'smooth'
    })
  })
})

watch(currentIndex, (): void => {
  scrollPlaylistToCurrentSong()
})

onUnmounted((): void => {
  saveState()
  audio.pause()
  audio.removeEventListener('timeupdate', updateProgress)
  audio.removeEventListener('loadedmetadata', handleAudioLoadedMetadata)
  audio.removeEventListener('ended', handleEnded)
  audio.removeEventListener('error', handleAudioError)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.alapi-player {
  position: fixed;
  left: 28px;
  bottom: 20px;
  z-index: 3600;
  width: min(1500px, calc(100vw - 56px));
  color: var(--alapi-text-color, #f5f7ff);
  font-size: var(--alapi-font-size, 13px);
  pointer-events: auto;
}

.alapi-player-panel,
.alapi-player-mini {
  border: 1px solid rgba(120, 130, 255, 0.35);
  background: var(--alapi-bg-color, rgba(15, 16, 24, 0.92));
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.alapi-player-panel {
  display: grid;
  grid-template-columns: 86px minmax(320px, 380px) minmax(360px, 1fr) minmax(330px, 390px);
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 16px;
  border-radius: 20px;
  height: min(760px, calc(100vh - 72px));
  overflow: hidden;
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
  width: 86px;
  height: 86px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #6970ff, var(--alapi-accent-color, #38d7b8) 48%, #f6bf4f);
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
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.alapi-player-workspace {
  min-height: 0;
  overflow-y: auto;
  overflow-x: visible;
  padding-right: 6px;
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

.alapi-player-search input,
.alapi-player-playlist-tools input {
  min-width: 0;
  height: 34px;
  padding: 0 12px;
  color: var(--alapi-text-color, #f5f7ff);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  outline: none;
}

.alapi-player-search-filters {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(120px, 1.2fr) minmax(96px, 0.9fr) minmax(96px, 0.9fr);
  gap: 8px;
  margin-top: 8px;
  overflow: visible;
}

.alapi-player-theme-grid label {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #9aa1b7;
  font-size: 11px;
  font-weight: 800;
}

.alapi-player-search-filters :deep(.el-select),
.alapi-player-search-filters :deep(.el-input-number) {
  width: 100%;
}

.alapi-player-search-filters :deep(.el-select__wrapper),
.alapi-player-search-filters :deep(.el-input-number__decrease),
.alapi-player-search-filters :deep(.el-input-number__increase),
.alapi-player-search-filters :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.alapi-player-search-filters :deep(.el-select__selected-item),
.alapi-player-search-filters :deep(.el-input__inner) {
  color: var(--alapi-text-color, #f5f7ff);
}

:global(.alapi-player-select-popper) {
  z-index: 3700;
  min-width: 140px;
  color: #f5f7ff;
  background: rgba(22, 23, 34, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.42);
}

:global(.alapi-player-select-popper .el-popper__arrow) {
  display: none;
}

:global(.alapi-player-select-popper .el-select-dropdown) {
  background: transparent;
  border: 0;
  box-shadow: none;
}

:global(.alapi-player-select-popper .el-select-dropdown__item) {
  color: #dfe4ff;
  font-weight: 800;
}

:global(.alapi-player-select-popper .el-select-dropdown__item.is-hovering),
:global(.alapi-player-select-popper .el-select-dropdown__item:hover) {
  color: #ffffff;
  background: rgba(108, 114, 247, 0.28);
}

:global(.alapi-player-select-popper .el-select-dropdown__item.is-selected) {
  color: var(--alapi-accent-color, #7fd7c8);
}

.alapi-player-search button,
.alapi-player-controls button,
.alapi-player-mini > button:first-child {
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
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.alapi-player-history-tags button {
  min-width: 0;
  padding: 4px 9px;
  overflow: hidden;
  color: #dfe4ff;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgba(108, 114, 247, 0.18);
  border: 1px solid rgba(108, 114, 247, 0.28);
  border-radius: 999px;
  cursor: pointer;
}

.alapi-player-search-result-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  color: #a9afc4;
  font-size: 12px;
}

.alapi-player-search-result-bar div {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.alapi-player-search-result-bar button {
  flex: 0 0 auto;
  padding: 5px 10px;
  color: var(--alapi-accent-color, #7fd7c8);
  font-size: 12px;
  font-weight: 800;
  background: rgba(127, 215, 200, 0.1);
  border: 1px solid color-mix(in srgb, var(--alapi-accent-color, #7fd7c8) 34%, transparent);
  border-radius: 999px;
  cursor: pointer;
}

.alapi-player-results {
  max-height: 210px;
  margin-top: 6px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.alapi-player-result {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  color: #e8ebff;
  text-align: left;
  background: transparent;
  border: 0;
}

.alapi-player-result-play {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(90px, 140px);
  gap: 10px;
  align-items: center;
  padding: 0;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.alapi-player-result-actions {
  display: inline-flex;
  gap: 6px;
}

.alapi-player-result-actions button,
.playlist-detail {
  height: 26px;
  padding: 0 8px;
  color: var(--alapi-accent-color, #7fd7c8);
  font-size: 11px;
  font-weight: 800;
  background: rgba(127, 215, 200, 0.08);
  border: 1px solid rgba(127, 215, 200, 0.22);
  border-radius: 999px;
  cursor: pointer;
}

.alapi-player-result:hover {
  background: rgba(108, 114, 247, 0.22);
}

.alapi-player-result-play span,
.alapi-player-result-play em {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alapi-player-result-play span {
  flex: 1 1 auto;
}

.alapi-player-result-play em {
  flex: 0 1 150px;
  color: #9aa1b7;
  font-style: normal;
}

.alapi-player-empty-state {
  display: grid;
  min-height: 88px;
  margin-top: 10px;
  place-items: center;
  color: #9aa1b7;
  font-size: 12px;
  text-align: center;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  border-radius: 12px;
}

.alapi-player-import-panel {
  margin-top: 8px;
}

.alapi-player-import-panel summary {
  color: #7c83ff;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

.alapi-player-import-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 94px;
  gap: 8px;
  margin-top: 8px;
}

.alapi-player-import-form input {
  min-width: 0;
  height: 36px;
}

.alapi-player-import-form button,
.alapi-player-import-header button {
  min-height: 34px;
  padding: 0 10px;
  color: var(--alapi-accent-color, #7fd7c8);
  font-size: 12px;
  font-weight: 900;
  background: rgba(127, 215, 200, 0.08);
  border: 1px solid rgba(127, 215, 200, 0.24);
  border-radius: 10px;
  cursor: pointer;
}

.alapi-player-import-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alapi-player-import-result {
  margin-top: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.alapi-player-import-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  color: #a9afc4;
  font-size: 12px;
  font-weight: 800;
}

.alapi-player-import-list {
  max-height: 132px;
  display: grid;
  gap: 4px;
  overflow-y: auto;
}

.alapi-player-import-list button {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(72px, 120px);
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  color: #dfe4ff;
  text-align: left;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
}

.alapi-player-import-list button:hover {
  background: rgba(108, 114, 247, 0.16);
}

.alapi-player-import-list span,
.alapi-player-import-list em {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alapi-player-import-list em {
  color: #9aa1b7;
  font-size: 12px;
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
  color: var(--alapi-accent-color, #7fd7c8);
  font-size: 11px;
  font-style: normal;
}

.alapi-player-theme-panel {
  margin-top: 8px;
}

.alapi-player-theme-panel summary {
  color: #7c83ff;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.alapi-player-theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.alapi-player-theme-grid input[type="color"] {
  width: 100%;
  height: 34px;
  padding: 2px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
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

.alapi-player-playlist {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: 0;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.045);
  overflow: hidden;
}

.alapi-player-playlist-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  overflow-x: auto;
  padding: 0 2px 4px;
  scrollbar-width: none;
}

.alapi-player-playlist-tabs::-webkit-scrollbar {
  display: none;
}

.alapi-player-playlist-tabs button {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 12px;
  color: #a9afc4;
  font-size: 13px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  cursor: pointer;
}

.alapi-player-playlist-add {
  color: #dfe4ff;
  background: rgba(108, 114, 247, 0.16);
  border-color: rgba(108, 114, 247, 0.32);
}

.alapi-player-playlist-tabs button.active {
  color: var(--alapi-accent-color, #7fd7c8);
  background: rgba(127, 215, 200, 0.1);
  border-color: rgba(127, 215, 200, 0.32);
}

.alapi-player-playlist-tab > span:not(.alapi-player-sr-only) {
  max-width: clamp(96px, 18vw, 220px);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alapi-player-playlist-tabs em {
  color: #8f96ad;
  font-size: 12px;
  font-style: normal;
}

.alapi-player-playlist-tabs i {
  display: inline-grid;
  width: 24px;
  height: 24px;
  place-items: center;
  color: #dfe4ff;
  font-size: 11px;
  font-style: normal;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 8px;
}

.alapi-player-playlist-tabs i:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
}

.alapi-player-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.alapi-player-playlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.alapi-player-playlist-tools {
  margin-bottom: 8px;
}

.alapi-player-playlist-tools input {
  width: 100%;
  height: 42px;
  font-size: 14px;
}

.alapi-player-playlist-header div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.alapi-player-playlist-header strong {
  color: #f5f7ff;
  font-size: 14px;
}

.alapi-player-playlist-header span {
  color: #9aa1b7;
  font-size: 12px;
}

.alapi-player-playlist-header button {
  padding: 4px 8px;
  color: #ff7b7b;
  background: rgba(255, 123, 123, 0.08);
  border: 1px solid rgba(255, 123, 123, 0.24);
  border-radius: 999px;
  cursor: pointer;
}

.alapi-player-playlist-header button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.alapi-player-playlist-list {
  flex: 1 1 auto;
  min-height: 0;
  max-height: none;
  overflow-y: auto;
  border-radius: 10px;
}

.alapi-player-playlist-item {
  width: 100%;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 48px 42px 46px;
  gap: 10px;
  align-items: center;
  padding: 10px 10px;
  color: #dfe4ff;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
}

.alapi-player-playlist-item:nth-child(even) {
  background: rgba(255, 255, 255, 0.035);
}

.alapi-player-playlist-item:hover {
  background: rgba(108, 114, 247, 0.16);
}

.alapi-player-playlist-item.active {
  color: var(--alapi-accent-color, #7fd7c8);
  background: rgba(108, 114, 247, 0.28);
  border-color: rgba(124, 131, 255, 0.34);
}

.playlist-index {
  color: var(--alapi-accent-color, #7fd7c8);
  font-size: 12px;
  font-weight: 900;
}

.playlist-title {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.playlist-title strong,
.playlist-title em {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.playlist-title strong {
  font-size: 13px;
}

.playlist-title em,
.playlist-duration {
  color: #9aa1b7;
  font-size: 12px;
  font-style: normal;
}

.playlist-duration {
  text-align: right;
}

.playlist-remove {
  height: 26px;
  padding: 0 8px;
  color: #ff9a9a;
  font-size: 11px;
  font-weight: 800;
  background: rgba(255, 123, 123, 0.08);
  border: 1px solid rgba(255, 123, 123, 0.22);
  border-radius: 999px;
  cursor: pointer;
}

.playlist-remove:hover {
  color: #ffffff;
  background: rgba(255, 123, 123, 0.18);
}

.alapi-player-playlist-empty {
  display: grid;
  min-height: 70px;
  place-items: center;
  color: #9aa1b7;
  font-size: 12px;
  text-align: center;
}

.alapi-player-side {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(124, 131, 255, 0.24);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.045);
  overflow: hidden;
}

.alapi-player-side-top {
  display: flex;
  justify-content: flex-end;
}

.alapi-player-side-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.alapi-player-side-header div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.alapi-player-side-header strong {
  color: #f5f7ff;
  font-size: 15px;
}

.alapi-player-side-header span,
.alapi-player-side-header em {
  overflow: hidden;
  color: #9aa1b7;
  font-size: 12px;
  font-style: normal;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alapi-player-side-header em {
  flex: 0 0 auto;
}

.alapi-player-lyrics {
  flex: 1 1 auto;
  min-height: 0;
  max-height: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  padding-right: 4px;
}

.alapi-player-lyric-line {
  width: 100%;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  padding: 7px 8px;
  color: #b9bfd4;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
}

.alapi-player-lyric-line:hover {
  color: #f5f7ff;
  background: rgba(108, 114, 247, 0.14);
}

.alapi-player-lyric-line.active {
  color: #ffffff;
  background: rgba(108, 114, 247, 0.28);
  border-color: rgba(124, 131, 255, 0.42);
}

.alapi-player-lyric-line span {
  color: var(--alapi-accent-color, #7fd7c8);
  font-size: 11px;
  font-weight: 800;
}

.alapi-player-lyric-line strong {
  min-width: 0;
  font-size: 13px;
  line-height: 1.45;
  font-weight: 700;
}

.alapi-player-lyric-empty {
  display: grid;
  min-height: 160px;
  place-items: center;
  color: #9aa1b7;
  font-size: 13px;
  text-align: center;
}

.alapi-player-comments {
  flex: 0 0 auto;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.alapi-player-comments > strong {
  color: #f5f7ff;
  font-size: 13px;
}

.alapi-player-comments p {
  margin: 6px 0 0;
  color: #a9afc4;
  font-size: 12px;
  line-height: 1.5;
}

.alapi-player-comment-list {
  max-height: 128px;
  overflow-y: auto;
}

.alapi-player-control-dock {
  grid-column: 2 / -1;
  flex: 0 0 auto;
  padding: 12px 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.alapi-player-playback-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.alapi-player-mode-toggle {
  --el-button-bg-color: rgba(255, 255, 255, 0.05);
  --el-button-border-color: rgba(255, 255, 255, 0.12);
  --el-button-text-color: var(--alapi-accent-color, #7fd7c8);
  --el-button-hover-bg-color: rgba(127, 215, 200, 0.12);
  --el-button-hover-border-color: rgba(127, 215, 200, 0.32);
  --el-button-hover-text-color: var(--alapi-accent-color, #7fd7c8);
  flex: 0 0 auto;
  font-weight: 800;
}

.alapi-player-mode-toggle :deep(span) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.alapi-player-volume-control {
  flex: 0 1 260px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  color: #a9afc4;
  font-size: 12px;
  font-weight: 800;
}

.alapi-player-volume-control input {
  width: min(190px, 22vw);
}

.alapi-player-controls {
  margin-top: 0;
}

.alapi-player-controls :deep(.el-button) {
  --el-button-bg-color: rgba(108, 114, 247, 0.78);
  --el-button-border-color: rgba(108, 114, 247, 0.78);
  --el-button-text-color: #ffffff;
  --el-button-hover-bg-color: rgba(108, 114, 247, 0.95);
  --el-button-hover-border-color: rgba(108, 114, 247, 0.95);
  width: 42px;
  height: 42px;
  padding: 0 10px;
}

.alapi-player-controls .primary-control {
  --el-button-bg-color: #18d968;
  --el-button-border-color: #18d968;
  --el-button-hover-bg-color: #20ec77;
  --el-button-hover-border-color: #20ec77;
  width: 54px;
  height: 54px;
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
  margin-top: 8px;
}

.alapi-player-status {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.alapi-player.collapsed {
  width: fit-content;
  min-width: 230px;
  max-width: calc(100vw - 48px);
}

.alapi-player-mini {
  display: grid;
  grid-template-columns: 44px minmax(120px, max-content);
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 999px;
}

.alapi-player-mini > button:first-child {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

.alapi-player-mini-info {
  min-width: 0;
  max-width: clamp(150px, 32vw, 520px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  height: 44px;
  padding: 0;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
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

.alapi-player-mini-info:hover strong {
  color: #ffffff;
}

:deep(.alapi-player-dialog) {
  --el-dialog-bg-color: rgba(19, 20, 31, 0.98);
  --el-dialog-title-font-size: 18px;
  --el-text-color-primary: #f5f7ff;
  --el-text-color-regular: #c5cadb;
  border: 1px solid rgba(124, 131, 255, 0.36);
  border-radius: 18px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.46);
}

.alapi-player-dialog-hint {
  color: #a9afc4;
  font-size: 13px;
  line-height: 1.6;
}

.alapi-player-dialog-actions {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.alapi-player-dialog-actions button,
.alapi-player-dialog-secondary,
.alapi-player-dialog-primary {
  height: 32px;
  padding: 0 12px;
  color: #dfe4ff;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  cursor: pointer;
}

.alapi-player-dialog-primary {
  color: #ffffff;
  background: rgba(108, 114, 247, 0.82);
  border-color: rgba(108, 114, 247, 0.82);
}

.alapi-player-batch-list {
  max-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.alapi-player-batch-list :deep(.el-checkbox) {
  height: auto;
  margin-right: 0;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.alapi-player-batch-list span,
.alapi-player-batch-list em {
  display: block;
}

.alapi-player-batch-list em {
  color: #9aa1b7;
  font-style: normal;
}

.alapi-player-song-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #c5cadb;
}

.alapi-player-song-detail strong {
  color: #ffffff;
  font-size: 18px;
}

.alapi-player-song-detail p {
  margin: 0;
}

.alapi-player-song-detail a {
  color: var(--alapi-accent-color, #7fd7c8);
  text-decoration: none;
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

@media (max-width: 1120px) {
  .alapi-player-panel {
    grid-template-columns: 70px minmax(0, 1fr);
  }

  .alapi-player-cover {
    width: 70px;
    height: 70px;
  }

  .alapi-player-side {
    grid-column: 1 / -1;
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

  .alapi-player-side {
    grid-column: 1 / -1;
  }
}
</style>
