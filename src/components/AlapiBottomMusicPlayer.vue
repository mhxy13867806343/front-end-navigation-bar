<template>
  <section
    v-if="!isHidden"
    ref="playerRootRef"
    class="alapi-player"
    :class="{ collapsed: isCollapsed, dragging: isPlayerDragging }"
    :style="playerRootStyle"
    aria-label="ALAPI 底部音乐播放器"
    @contextmenu.prevent.stop="openPlayerContextMenu"
    @pointerdown="startPlayerDrag"
  >
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
        <div class="alapi-player-playlist-tabs-wrap">
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
          <el-popover
            v-model:visible="isPlaylistOverviewVisible"
            placement="right-end"
            trigger="click"
            width="320"
            popper-class="alapi-player-playlist-popover"
            :teleported="false"
          >
            <template #reference>
              <button
                type="button"
                class="alapi-player-playlist-overview-btn"
                title="查看所有播放列表"
              >
                查看列表
              </button>
            </template>
            <div class="alapi-player-playlist-overview-panel">
              <strong>播放列表</strong>
              <button
                v-for="group in visiblePlaylistGroups"
                :key="`overview-${group.id}`"
                type="button"
                :class="{ active: activePlaylistGroupIndex === group.index }"
                @click="switchPlaylistGroupFromOverview(group.index)"
              >
                <span>{{ group.name }}</span>
                <em>{{ group.songs.length }}/{{ MAX_PLAYLIST_SONGS }}</em>
              </button>
            </div>
          </el-popover>
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

    <div
      v-if="isPlayerContextMenuVisible"
      class="alapi-player-context-menu"
      :style="playerContextMenuStyle"
      @click.stop
      @contextmenu.prevent.stop
      @pointerdown.stop
    >
      <button type="button" class="alapi-player-context-item" @click="toggleCollapsedFromMenu">
        <span class="alapi-player-context-icon">🎵</span>
        {{ isCollapsed ? '展开音乐' : '收起音乐' }}
      </button>
      <button type="button" class="alapi-player-context-item" @click="hidePlayerFromMenu">
        <span class="alapi-player-context-icon">×</span>
        隐藏播放器
      </button>
    </div>

    <el-dialog v-model="isBatchDialogVisible" title="批量添加歌曲" class="alapi-player-dialog" width="560px" :z-index="PLAYER_DIALOG_Z_INDEX">
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

    <el-dialog v-model="isPlaylistImportDialogVisible" title="从歌单添加歌曲" class="alapi-player-dialog" width="620px" :z-index="PLAYER_DIALOG_Z_INDEX">
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

    <el-dialog v-model="isDetailDialogVisible" title="歌曲详情" class="alapi-player-dialog" width="460px" :z-index="PLAYER_DIALOG_Z_INDEX">
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

interface PlayerPosition {
  left: number
  top: number
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
  isHidden?: boolean
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
  playerPosition?: PlayerPosition | null
}

interface PlayerDragState {
  pointerId: number
  startX: number
  startY: number
  originLeft: number
  originTop: number
  hasMoved: boolean
}

const ALAPI_TOKEN: string = import.meta.env.VITE_ALAPI_TOKEN || 'qgqofofvmxtoskffd37omkscobipmn'
const ALAPI_BASE_URL: string = 'https://v3.alapi.cn'
const MUSIC_SEARCH_PATH: string = '/api-alapi/api/music/search'
const MUSIC_URL_PATH: string = '/api-alapi/api/music/url'
const MUSIC_LYRIC_PATH: string = '/api-alapi/api/music/lyric'
const MUSIC_HOT_COMMENT_PATH: string = '/api-alapi/api/music/comment/hot'
const MUSIC_PLAYLIST_PATH: string = '/api-alapi/api/music/playlist'
const PLAYER_STORAGE_KEY: string = 'alapi_bottom_music_player_state'
const PLAYER_SHOW_EVENT: string = 'alapi-player:show'
const PLAYER_HIDE_EVENT: string = 'alapi-player:hide'
const PLAYER_VISIBILITY_CHANGE_EVENT: string = 'alapi-player:visibility-change'
const PLAYER_CONTEXT_MENU_WIDTH: number = 220
const PLAYER_CONTEXT_MENU_HEIGHT: number = 112
const DEFAULT_KEYWORD: string = '慢慢懂'
const SEARCH_LIMIT: number = 10
const SEARCH_TYPE: string = '1'
const MAX_PLAYLIST_SONGS: number = 100
const PLAYER_DIALOG_Z_INDEX: number = 5200
const playerMessageBoxOptions: { customClass: string, modalClass: string, zIndex: number } = {
  customClass: 'alapi-player-message-box',
  modalClass: 'alapi-player-message-modal',
  zIndex: PLAYER_DIALOG_Z_INDEX
}
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
const isPlaylistOverviewVisible: Ref<boolean> = ref<boolean>(false)
const detailSong: Ref<PlayerSong | null> = ref<PlayerSong | null>(null)
const playerTheme: Ref<PlayerTheme> = ref<PlayerTheme>({ ...DEFAULT_PLAYER_THEME })
const isPlaying: Ref<boolean> = ref<boolean>(false)
const isSearching: Ref<boolean> = ref<boolean>(false)
const isCollapsed: Ref<boolean> = ref<boolean>(false)
const isHidden: Ref<boolean> = ref<boolean>(false)
const statusText: Ref<string> = ref<string>('输入关键词，按 Enter 搜索歌曲')
const progress: Ref<number> = ref<number>(0)
const volume: Ref<number> = ref<number>(70)
const currentSeconds: Ref<number> = ref<number>(0)
const durationSeconds: Ref<number> = ref<number>(0)
const lyricLines: Ref<LyricLine[]> = ref<LyricLine[]>([])
const currentLyricIndex: Ref<number> = ref<number>(-1)
const lyricPanelRef: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)
const playlistPanelRef: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)
const playerRootRef: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)
const playerPosition: Ref<PlayerPosition | null> = ref<PlayerPosition | null>(null)
const isPlayerDragging: Ref<boolean> = ref<boolean>(false)
const isPlayerContextMenuVisible: Ref<boolean> = ref<boolean>(false)
const playerContextMenuPosition: Ref<PlayerPosition> = ref<PlayerPosition>({ left: 0, top: 0 })
const hotComments: Ref<string[]> = ref<string[]>([])
const playlistImportId: Ref<string> = ref<string>('440342015')
const playlistImportSongs: Ref<PlayerSong[]> = ref<PlayerSong[]>([])
const selectedPlaylistImportSongIds: Ref<number[]> = ref<number[]>([])
const isFetchingPlaylist: Ref<boolean> = ref<boolean>(false)
const isPlaylistImportDialogVisible: Ref<boolean> = ref<boolean>(false)
const pendingRestoreSeconds: Ref<number> = ref<number>(0)
let lastPlaybackSaveAt: number = 0
let playRequestId: number = 0
let playerDragState: PlayerDragState | null = null
let suppressNextPlayerClick: boolean = false
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

const playerRootStyle: ComputedRef<Record<string, string>> = computed<Record<string, string>>(() => {
  const style: Record<string, string> = { ...playerThemeStyle.value }
  if (playerPosition.value) {
    style.left = `${playerPosition.value.left}px`
    style.top = `${playerPosition.value.top}px`
    style.bottom = 'auto'
  }
  return style
})
const playerContextMenuStyle: ComputedRef<Record<string, string>> = computed<Record<string, string>>(() => ({
  left: `${playerContextMenuPosition.value.left}px`,
  top: `${playerContextMenuPosition.value.top}px`
}))

function createPlaylistGroup(index: number): PlayerListGroup {
  return {
    id: `playlist-${index + 1}-${Date.now()}`,
    name: `播放列表${index + 1}`,
    songs: []
  }
}

function clampPlayerPosition(position: PlayerPosition): PlayerPosition {
  const root: HTMLElement | null = playerRootRef.value
  const width: number = root?.offsetWidth ?? 260
  const height: number = root?.offsetHeight ?? 80
  const margin: number = 10
  const maxLeft: number = Math.max(margin, window.innerWidth - width - margin)
  const maxTop: number = Math.max(margin, window.innerHeight - height - margin)

  return {
    left: Math.min(Math.max(position.left, margin), maxLeft),
    top: Math.min(Math.max(position.top, margin), maxTop)
  }
}

function isInteractiveDragTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.closest('.alapi-player-cover, .alapi-player-song, .alapi-player-title-row')) {
    return false
  }
  return Boolean(target.closest('button, a, input, textarea, select, summary, label, [role="button"], .el-select, .el-input-number, .alapi-player-mini-info, .alapi-player-results, .alapi-player-playlist, .alapi-player-side, .alapi-player-control-dock, .alapi-player-workspace'))
}

function startPlayerDrag(event: PointerEvent): void {
  if (event.button !== 0 || isInteractiveDragTarget(event.target)) return
  closePlayerContextMenu()
  const root: HTMLElement | null = playerRootRef.value
  if (!root) return

  const rect: DOMRect = root.getBoundingClientRect()
  const originPosition: PlayerPosition = playerPosition.value ?? { left: rect.left, top: rect.top }
  playerPosition.value = clampPlayerPosition(originPosition)
  playerDragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originLeft: playerPosition.value.left,
    originTop: playerPosition.value.top,
    hasMoved: false
  }
  isPlayerDragging.value = true
  document.body.style.userSelect = 'none'
  root.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', handlePlayerDragMove)
  window.addEventListener('pointerup', stopPlayerDrag)
  window.addEventListener('pointercancel', stopPlayerDrag)
}

function handlePlayerDragMove(event: PointerEvent): void {
  if (!playerDragState || event.pointerId !== playerDragState.pointerId) return
  const deltaX: number = event.clientX - playerDragState.startX
  const deltaY: number = event.clientY - playerDragState.startY
  if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
    playerDragState.hasMoved = true
    suppressNextPlayerClick = true
  }
  playerPosition.value = clampPlayerPosition({
    left: playerDragState.originLeft + deltaX,
    top: playerDragState.originTop + deltaY
  })
}

function stopPlayerDrag(event?: PointerEvent): void {
  if (event && playerDragState && event.pointerId !== playerDragState.pointerId) return
  const root: HTMLElement | null = playerRootRef.value
  if (event && root) {
    root.releasePointerCapture?.(event.pointerId)
  }
  window.removeEventListener('pointermove', handlePlayerDragMove)
  window.removeEventListener('pointerup', stopPlayerDrag)
  window.removeEventListener('pointercancel', stopPlayerDrag)
  document.body.style.userSelect = ''
  isPlayerDragging.value = false
  playerDragState = null
  if (playerPosition.value) {
    playerPosition.value = clampPlayerPosition(playerPosition.value)
  }
  saveState()
}

function consumeSuppressedPlayerClick(): boolean {
  if (!suppressNextPlayerClick) return false
  suppressNextPlayerClick = false
  return true
}

function refreshPlayerPositionBounds(): void {
  if (!playerPosition.value) return
  void nextTick((): void => {
    if (playerPosition.value) {
      playerPosition.value = clampPlayerPosition(playerPosition.value)
      saveState()
    }
  })
}

function isDefaultPlaylistGroupName(name: string): boolean {
  return /^播放列表\d+$/.test(name.trim())
}

function normalizePlaylistGroups(): void {
  playlistGroups.value.forEach((group: PlayerListGroup, index: number): void => {
    if (isDefaultPlaylistGroupName(group.name)) {
      group.name = `播放列表${index + 1}`
    }
  })
  activePlaylistGroupIndex.value = Math.min(
    Math.max(activePlaylistGroupIndex.value, 0),
    Math.max(playlistGroups.value.length - 1, 0)
  )
}

function resetDeletedActivePlaylistPlayback(): void {
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
  pendingRestoreSeconds.value = 0
}

function createPlaylistGroupTab(): void {
  const nextGroup: PlayerListGroup = createPlaylistGroup(playlistGroups.value.length)
  playlistGroups.value.push(nextGroup)
  normalizePlaylistGroups()
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
      ...playerMessageBoxOptions,
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
      type: 'warning',
      ...playerMessageBoxOptions
    }
  ).then((): void => {
    const deletedGroupName: string = targetGroup.name
    const isDeletingActiveGroup: boolean = groupIndex === activePlaylistGroupIndex.value
    playlistGroups.value.splice(groupIndex, 1)
    if (activePlaylistGroupIndex.value > groupIndex) {
      activePlaylistGroupIndex.value -= 1
    } else if (isDeletingActiveGroup) {
      activePlaylistGroupIndex.value = Math.min(groupIndex, playlistGroups.value.length - 1)
      currentIndex.value = 0
      resetDeletedActivePlaylistPlayback()
    }
    normalizePlaylistGroups()
    statusText.value = `已删除${deletedGroupName}`
    if (isDeletingActiveGroup && playlist.value.length) {
      void restoreCurrentSong()
    }
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

function ensurePlaylistGroupsForInsert(): void {
  if (playlistGroups.value.length) return

  const createdGroup: PlayerListGroup = createPlaylistGroup(0)
  playlistGroups.value.push(createdGroup)
  activePlaylistGroupIndex.value = 0
  normalizePlaylistGroups()
  statusText.value = `已自动创建${createdGroup.name}`
  ElMessage.success(`已自动创建${createdGroup.name}`)
}

function findAvailablePlaylistGroup(preferredGroupIndex: number = activePlaylistGroupIndex.value): PlayerListGroup {
  const preferredGroup: PlayerListGroup | undefined = playlistGroups.value[preferredGroupIndex]
  if (preferredGroup && preferredGroup.songs.length < MAX_PLAYLIST_SONGS) {
    return preferredGroup
  }

  const availableGroup: PlayerListGroup | undefined = playlistGroups.value.find((group: PlayerListGroup): boolean => group.songs.length < MAX_PLAYLIST_SONGS)
  if (availableGroup) return availableGroup

  const nextGroup: PlayerListGroup = createPlaylistGroup(playlistGroups.value.length)
  playlistGroups.value.push(nextGroup)
  normalizePlaylistGroups()
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

function switchPlaylistGroupFromOverview(groupIndex: number): void {
  switchPlaylistGroup(groupIndex)
  isPlaylistOverviewVisible.value = false
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
      type: 'warning',
      ...playerMessageBoxOptions
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
      type: 'warning',
      ...playerMessageBoxOptions
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

  ensurePlaylistGroupsForInsert()
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

    const targetGroup: PlayerListGroup = findAvailablePlaylistGroup(activePlaylistGroupIndex.value)
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
  ensurePlaylistGroupsForInsert()
  const existingLocation: { groupIndex: number, songIndex: number } | null = findSongLocation(song.id)
  if (existingLocation) {
    activePlaylistGroupIndex.value = existingLocation.groupIndex
    currentIndex.value = existingLocation.songIndex
    statusText.value = `已存在播放列表，切换到：${song.name}`
  } else {
    const targetGroup: PlayerListGroup = findAvailablePlaylistGroup(activePlaylistGroupIndex.value)
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

function closePlayerContextMenu(): void {
  isPlayerContextMenuVisible.value = false
}

function openPlayerContextMenu(event: MouseEvent): void {
  event.preventDefault()
  event.stopPropagation()
  const margin: number = 8
  playerContextMenuPosition.value = {
    left: Math.min(Math.max(event.clientX, margin), window.innerWidth - PLAYER_CONTEXT_MENU_WIDTH - margin),
    top: Math.min(Math.max(event.clientY, margin), window.innerHeight - PLAYER_CONTEXT_MENU_HEIGHT - margin)
  }
  isPlayerContextMenuVisible.value = true
}

function handlePlayerContextMenuKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closePlayerContextMenu()
  }
}

function emitPlayerVisibilityChange(): void {
  window.dispatchEvent(new CustomEvent(PLAYER_VISIBILITY_CHANGE_EVENT, {
    detail: {
      visible: !isHidden.value
    }
  }))
}

function hidePlayer(): void {
  stopPlayerDrag()
  closePlayerContextMenu()
  isHidden.value = true
  saveState()
  emitPlayerVisibilityChange()
  ElMessage.info('音乐播放器已隐藏，可在控制中心或 DyForm 右侧重新打开')
}

function showPlayer(): void {
  closePlayerContextMenu()
  isHidden.value = false
  isCollapsed.value = false
  saveState()
  refreshPlayerPositionBounds()
  emitPlayerVisibilityChange()
}

function toggleCollapsedFromMenu(): void {
  closePlayerContextMenu()
  toggleCollapsed()
}

function hidePlayerFromMenu(): void {
  hidePlayer()
}

function toggleCollapsed(): void {
  isCollapsed.value = !isCollapsed.value
  refreshPlayerPositionBounds()
  saveState()
}

function openFullPlayer(): void {
  if (consumeSuppressedPlayerClick()) return
  isCollapsed.value = false
  refreshPlayerPositionBounds()
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
    isHidden: isHidden.value,
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
    playerTheme: playerTheme.value,
    playerPosition: playerPosition.value
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
    playerPosition.value = parsedState.playerPosition ?? null
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
    normalizePlaylistGroups()
    currentIndex.value = Math.min(Math.max(parsedState.currentIndex ?? 0, 0), Math.max(playlist.value.length - 1, 0))
    volume.value = parsedState.volume ?? 70
    isCollapsed.value = parsedState.isCollapsed ?? false
    isHidden.value = parsedState.isHidden ?? false
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
  window.addEventListener('resize', refreshPlayerPositionBounds)
  window.addEventListener('click', closePlayerContextMenu)
  window.addEventListener('keydown', handlePlayerContextMenuKeydown)
  window.addEventListener(PLAYER_SHOW_EVENT, showPlayer)
  window.addEventListener(PLAYER_HIDE_EVENT, hidePlayer)

  if (playlist.value.length) {
    void restoreCurrentSong()
  } else {
    void searchSongs(1)
  }
  emitPlayerVisibilityChange()
  refreshPlayerPositionBounds()
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
  stopPlayerDrag()
  audio.pause()
  audio.removeEventListener('timeupdate', updateProgress)
  audio.removeEventListener('loadedmetadata', handleAudioLoadedMetadata)
  audio.removeEventListener('ended', handleEnded)
  audio.removeEventListener('error', handleAudioError)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('resize', refreshPlayerPositionBounds)
  window.removeEventListener('click', closePlayerContextMenu)
  window.removeEventListener('keydown', handlePlayerContextMenuKeydown)
  window.removeEventListener(PLAYER_SHOW_EVENT, showPlayer)
  window.removeEventListener(PLAYER_HIDE_EVENT, hidePlayer)
})
</script>

<style scoped lang="scss" src="./css/AlapiBottomMusicPlayer.scss"></style>
