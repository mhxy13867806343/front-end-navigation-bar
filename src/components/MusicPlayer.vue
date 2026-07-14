<template>
  <div class="music-player" :class="{ 'dark': isDark }">
    <div class="background-layer" v-if="currentSongBg">
      <img :src="currentSongBg" alt="background" class="background-image" />
      <div class="background-overlay"></div>
    </div>
    <div class="content-container">
      <div class="player-container">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            @input="debounceSearch"
            placeholder="输入歌曲名称搜索..."
            class="search-input"
            :disabled="isLoading"
          >
          <button v-if="searchQuery.length"
            class="search-btn"
            :disabled="isLoading || !searchQuery.trim()"
            @click="searchMusic"
          >
            {{ isLoading ? '搜索中...' : '🔍' }}
          </button>
          <button v-if="searchQuery.length>0"
            @click="searchQuery=''"
            class="clear-history-btn"
            title="清空历史记录"
          >
            ✕
          </button>
        </div>

        <div class="search-history" v-if="searchHistory.length > 0">
          <div class="history-header">
            <h4>搜索历史</h4>
            <button
              class="clear-btn"
              @click="clearHistory"
              title="清空历史记录"
            >
              清空
            </button>
          </div>
          <div class="history-list">
            <div
              v-for="(query, index) in searchHistory"
              :key="index"
              @click="searchFromHistory(query)"
              class="history-item"
            >
              {{ query }}
            </div>
          </div>
        </div>

        <div class="search-results" v-if="searchResults.length > 0">
          <div
            v-for="(song, index) in searchResults"
            :key="song.id"
            @click="handleSearchResultClick(song)"
            class="search-result-item"
          >
            <div class="song-info">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">{{ song.artist }}</div>
              <div class="song-album">专辑：{{ song.album }}</div>
            </div>
          </div>
        </div>

        <div class="music-info" v-if="currentSong.url">
          <div class="song-title">{{ currentSong.name || '未选择歌曲' }}</div>
          <div class="song-artist">{{ currentSong.artist || '未知歌手' }}</div>
        </div>



        <div class="progress-container" v-if="currentSong.url">
          <div class="time-display">{{ formatTime(audio.currentTime || 0) }}</div>
          <div class="progress-bar" ref="progressBar" @click="seek" @mousedown="startDragging" @mousemove="onDrag" @mouseup="stopDragging" @mouseleave="stopDragging">
            <div class="progress" :style="{ width: progress + '%' }"></div>
            <div class="progress-handle" :style="{ left: progress + '%' }"></div>
          </div>
          <div class="time-display">{{ formatTime(audio.duration || 0) }}</div>
        </div>

        <div class="controls" v-if="currentSong.url">
          <button @click="prev" :disabled="!hasPrev" class="control-btn">
            ⏮️
          </button>
          <button @click="togglePlay" class="control-btn play-btn">
            {{ isPlaying ? '⏸️' : '▶️' }}
          </button>
          <button @click="next" :disabled="!hasNext" class="control-btn">
            ⏭️
          </button>
          <div class="volume-control">
            <i class="volume-icon" @click="toggleMute">{{ volumeIcon }}</i>
            <input
              type="range"
              min="0"
              max="100"
              v-model="volume"
              @input="updateVolume"
              class="volume-slider"
            />
            <span class="volume-percentage">{{ volume }}%</span>
          </div>
          <el-dropdown v-if="showPlayMode" @command="changePlayMode" trigger="click">
            <el-button>
              <el-icon class="play-mode-icon">
                <component :is="playMode === 'sequence' ? List : playMode === 'single' ? Refresh : Switch" />
              </el-icon>
              <span class="play-mode-text">
                {{ playMode === 'sequence' ? '顺序播放' : 
                   playMode === 'single' ? `单曲播放${singlePlayCount === -1 ? '' : '(' + singlePlayCount + '次)'}` : 
                   '随机播放' }}
              </span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="'sequence'">
                  <el-icon class="play-mode-icon"><List /></el-icon>
                  <span class="play-mode-text">顺序播放</span>
                </el-dropdown-item>
                <el-dropdown-item :command="'single'" @click.native.stop="setSinglePlayCount">
                  <el-icon class="play-mode-icon"><Refresh /></el-icon>
                  <span class="play-mode-text">
                    单曲播放{{ singlePlayCount === -1 ? '' : '(' + singlePlayCount + '次)' }}
                  </span>
                </el-dropdown-item>
                <el-dropdown-item :command="'random'">
                  <el-icon class="play-mode-icon"><Switch /></el-icon>
                  <span class="play-mode-text">随机播放</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="playlist-container">
          <div class="playlist-header">
            <h3>播放列表</h3>
            <button
              class="clear-btn"
              @click="clearPlaylist"
              v-if="playlist.length"
              title="清空播放列表"
            >
              清空
            </button>
          </div>

          <div class="playlist" v-if="playlist.length > 0">
            <div
              v-for="(song, index) in playlist"
              :key="index"
              @click="playSong(index)"
              :class="['playlist-item', { active: currentIndex === index }]"
            >
              <span class="song-index">{{ index + 1 }}</span>
              <div class="song-info">
                <div class="song-name">{{ song.name }}</div>
                <div class="song-artist">{{ song.artist }}</div>
              </div>
              <button
                class="remove-btn"
                @click.stop="removeFromPlaylist(index)"
                title="从播放列表中移除"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- 空状态提示 -->
          <div class="empty-state" v-else>
            <div class="empty-icon">🎵</div>
            <p>暂无歌曲</p>
            <p class="empty-tip">快去搜索添加喜欢的音乐吧～</p>
          </div>
        </div>
      </div>
      <div class="lyrics-container" v-if="lyrics.length">
        <div class="lyrics-wrapper" :style="{ transform: `translateY(${-currentLyricIndex * 24}px)` }" style="overflow-y: auto;">
          <div
              v-for="(lyric, index) in lyrics"
              :key="index"
              class="lyric-line"
              :class="{ active: currentLyricIndex === index }"
              @click="seekToLyric(lyric.time)"
          >
            {{ lyric.text }}
          </div>
        </div>
      </div>
      <div v-else class="no-lyrics">
        暂无歌词
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ElMessage, ElMessageBox } from 'element-plus'
import { List, Refresh, Switch } from '@element-plus/icons-vue'
import axios from 'axios'
import debounce from 'lodash/debounce'
import type { AxiosResponse } from 'axios'

type PlayMode = 'sequence' | 'single' | 'random'

interface SongItem {
  id: number
  name: string
  artist: string
  album: string
  duration: number
  url?: string
}

interface ApiArtist {
  name: string
}

interface ApiAlbum {
  name: string
  picUrl?: string
}

interface ApiSong {
  id: number
  name: string
  artists: ApiArtist[]
  album: ApiAlbum
  duration: number
  fee?: number
}

interface SearchResponse {
  result?: {
    songs?: ApiSong[]
  }
}

interface SongUrlResponse {
  data?: Array<{ url?: string | null }>
}

interface LyricResponse {
  lrc?: {
    lyric?: string
  }
}

interface SongDetailResponse {
  songs?: Array<{ al?: ApiAlbum }>
}

interface LyricLine {
  time: number
  text: string
}

const emptySong: SongItem = {
  id: 0,
  name: '',
  artist: '',
  album: '',
  duration: 0,
  url: ''
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || '未知错误')
}

const searchQuery = ref<string>('')
const searchResults = ref<SongItem[]>([])
const searchHistory = ref<string[]>([])
const playlist = ref<SongItem[]>([])
const currentIndex = ref<number>(0)
const isPlaying = ref<boolean>(false)
const progress = ref<number>(0)
const volume = ref<number>(100)
const audio: HTMLAudioElement = new Audio()
const isLoading = ref<boolean>(false)
const progressBar = ref<HTMLDivElement | null>(null)
const isDragging = ref<boolean>(false)
const hasShownError = ref<boolean>(false)
const isUnmounting = ref<boolean>(false)
const currentSongBg = ref<string>('')

// 歌词相关
const lyrics = ref<LyricLine[]>([])
const currentLyricIndex = ref<number>(-1)

// 接收dark mode prop
const props = withDefaults(defineProps<{
  isDark?: boolean
}>(), {
  isDark: false
})

const currentSong = computed<SongItem>(() => playlist.value[currentIndex.value] || emptySong)
const hasNext = computed<boolean>(() => playlist.value.length > 1)
const hasPrev = computed<boolean>(() => playlist.value.length > 1)

// API基础URL
const API_BASE = 'https://ncm.nekogan.com'

// 防抖函数
const debounceSearch = debounce((): void => {
  if (searchQuery.value.trim()) {
    searchMusic()
  } else {
    searchResults.value = []
  }
}, 500)

// 搜索音乐
const searchMusic = async (): Promise<void> => {
  if (!searchQuery.value.trim()) return
  isLoading.value = true

  try {
    const response: AxiosResponse<SearchResponse> = await axios.get<SearchResponse>(`${API_BASE}/search`, {
      params: {
        keywords: searchQuery.value,
        type: 1
      }
    })

    if (response.data && response.data.result && response.data.result.songs) {
      searchResults.value = response.data.result.songs
        .filter((song: ApiSong): boolean => song.fee !== 1)
        .map((song: ApiSong): SongItem => ({
          id: song.id,
          name: song.name,
          artist: song.artists.map((artist: ApiArtist): string => artist.name).join(', '),
          album: song.album.name,
          duration: song.duration
        }))
        .slice(0, 10)

      // 添加到搜索历史
      addToHistory(searchQuery.value)

      if (searchResults.value.length === 0) {
        ElMessage.info('未找到相关歌曲')
      }
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

// 获取音乐URL
const getMusicUrl = async (songId: number): Promise<string | null> => {
  try {
    const response: AxiosResponse<SongUrlResponse> = await axios.get<SongUrlResponse>(`${API_BASE}/song/url`, {
      params: {
        id: songId
      }
    })

    if (response.data && response.data.data && response.data.data[0]) {
      return response.data.data[0].url || null
    }
    return null
  } catch (error) {
    console.error('获取音乐URL失败:', error)
    return null
  }
}

// 添加到播放列表
const addToPlaylist = async (song: SongItem): Promise<void> => {
  const url: string | null = await getMusicUrl(song.id)
  if (!url) {
    ElMessage.warning('该歌曲暂时无法播放')
    return
  }

  const exists: boolean = playlist.value.some((item: SongItem): boolean => item.id === song.id)
  if (exists) {
    ElMessage.warning('该歌曲已在播放列表中')
    return
  }

  const songWithUrl: SongItem = { ...song, url }
  playlist.value.unshift(songWithUrl)
  saveToStorage()

  if (playlist.value.length === 1) {
    playSong(0)
  } else {
    currentIndex.value++
  }

  searchResults.value = []
  searchQuery.value = ''
  ElMessage.success('已添加到播放列表')
}

// 从播放列表移除
const removeFromPlaylist = (index: number): void => {
  if (index === currentIndex.value) {
    // 如果删除的是当前播放的歌曲
    audio.pause()
    isPlaying.value = false
    
    // 删除该歌曲
    playlist.value.splice(index, 1)
    
    if (playlist.value.length === 0) {
      // 如果删除后列表为空
      audio.src = ''
      currentIndex.value = 0
      progress.value = 0
      ElMessage.info('播放列表已清空')
    } else {
      // 如果列表还有歌曲，继续播放
      // 如果删除的是最后一首，播放第一首
      if (index >= playlist.value.length) {
        currentIndex.value = 0
      }
      // 否则保持当前索引播放下一首
      playSong(currentIndex.value)
    }
  } else {
    // 如果删除的不是当前播放的歌曲
    playlist.value.splice(index, 1)
    // 如果删除的歌曲在当前播放歌曲之前，需要调整当前索引
    if (index < currentIndex.value) {
      currentIndex.value--
    }
  }

  saveToStorage()
}

// 播放控制
const togglePlay = (): void => {
  if (!currentSong.value.url) return

  if (isPlaying.value) {
    audio.pause()
    isPlaying.value = false
  } else {
    audio.play().catch((error: unknown): void => {
      console.error('播放失败:', error)
      isPlaying.value = false
      if (!hasShownError.value) {
        ElMessage.error('播放失败，请尝试其他歌曲')
        hasShownError.value = true
      }
      removeFromPlaylist(currentIndex.value)
    })
  }
}

const playSong = async (index: number): Promise<void> => {
  try {
    if (playlist.value.length === 0) {
      return
    }

    currentIndex.value = index
    const song: SongItem | undefined = playlist.value[index]

    if (!song) {
      throw new Error('找不到歌曲')
    }

    // 重置错误提示状态
    hasShownError.value = false

    // 停止当前播放
    audio.pause()
    isPlaying.value = false

    // 获取音乐URL
    const newUrl: string | null = await getMusicUrl(song.id)
    if (!newUrl) {
      throw new Error('获取音乐地址失败')
    }

    song.url = newUrl
    audio.src = newUrl

    try {
      await audio.play()
      isPlaying.value = true
    } catch (playError: unknown) {
      throw new Error('播放失败')
    }

    // 获取歌词
    await getLyrics(song.id)

    // 获取歌曲背景图片
    await getSongDetail(song.id)

  } catch (error: unknown) {
    console.error('播放失败:', error)
    isPlaying.value = false
    if (!hasShownError.value) {
      ElMessage.error('音频加载失败，请尝试其他歌曲')
      hasShownError.value = true
    }
    removeFromPlaylist(index)

    // 如果还有下一首歌，自动播放下一首
    if (hasNext.value && getErrorMessage(error) !== '找不到歌曲') {
      next()
    }
  }
}

const getNextIndex = (): number => {
  if (!playlist.value.length) return -1
  
  switch (playMode.value) {
    case 'random': // 随机播放
      return Math.floor(Math.random() * playlist.value.length)
    case 'single': // 单曲循环
      return currentIndex.value
    case 'sequence': // 顺序播放
    default:
      return currentIndex.value >= playlist.value.length - 1 ? 0 : currentIndex.value + 1
  }
}

const getPrevIndex = (): number => {
  if (!playlist.value.length) return -1
  
  switch (playMode.value) {
    case 'random': // 随机播放
      return Math.floor(Math.random() * playlist.value.length)
    case 'single': // 单曲循环
      return currentIndex.value
    case 'sequence': // 顺序播放
    default:
      return currentIndex.value <= 0 ? playlist.value.length - 1 : currentIndex.value - 1
  }
}

const prev = (): void => {
  if (!playlist.value.length) return
  const index: number = getPrevIndex()
  if (index !== -1) {
    playSong(index)
  }
}

const next = (): void => {
  if (!playlist.value.length) return
  const index: number = getNextIndex()
  if (index !== -1) {
    playSong(index)
  }
}

const seek = (event: MouseEvent): void => {
  updateProgress(event)
}

const startDragging = (event: MouseEvent): void => {
  isDragging.value = true
  updateProgress(event)
}

const stopDragging = (): void => {
  if (isDragging.value) {
    isDragging.value = false
  }
}

const onDrag = (event: MouseEvent): void => {
  if (isDragging.value) {
    updateProgress(event)
  }
}

const updateProgress = (event: MouseEvent): void => {
  if (!audio.duration || !progressBar.value) return
  const rect: DOMRect = progressBar.value.getBoundingClientRect()
  let percent: number = (event.clientX - rect.left) / rect.width
  // 确保百分比在0-1之间
  percent = Math.max(0, Math.min(1, percent))
  const time: number = percent * audio.duration
  audio.currentTime = time
  // 立即更新歌词位置
  updateCurrentLyric()
}

const updateVolume = (): void => {
  audio.volume = volume.value / 100
}

// 格式化时间
const formatTime = (seconds: number): string => {
  if (!seconds) return '0:00'
  const mins: number = Math.floor(seconds / 60)
  const secs: number = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 获取歌词
const getLyrics = async (id: number): Promise<void> => {
  try {
    const response: AxiosResponse<LyricResponse> = await axios.get<LyricResponse>(`${API_BASE}/lyric?id=${id}`)
    if (response.data.lrc?.lyric) {
      // 解析歌词
      const lyricText: string = response.data.lrc.lyric
      const lyricLines: string[] = lyricText.split('\n')
      const parsedLyrics: LyricLine[] = lyricLines
        .map((line: string): LyricLine | null => {
          const timeRegex: RegExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/
          const match: RegExpMatchArray | null = line.match(timeRegex)
          if (match) {
            const [_, minutes, seconds, milliseconds] = match
            // 将毫秒标准化为3位数
            const ms: string = milliseconds.padEnd(3, '0')
            // 计算总毫秒数
            const timeInMs: number = (parseInt(minutes) * 60 * 1000) + 
                           (parseInt(seconds) * 1000) + 
                           parseInt(ms)
            const text: string = line.replace(timeRegex, '').trim()
            if (text) {
              return { time: timeInMs, text }
            }
          }
          return null
        })
        .filter((item: LyricLine | null): item is LyricLine => item !== null)
      
      lyrics.value = parsedLyrics
    } else {
      lyrics.value = []
    }
  } catch (error) {
    console.error('获取歌词失败:', error)
    lyrics.value = []
  }
}

// 更新当前歌词
const updateCurrentLyric = (): void => {
  if (!lyrics.value.length) return
  
  const currentTime: number = audio.currentTime
  let index: number = lyrics.value.findIndex((lyric: LyricLine): boolean => lyric.time > currentTime * 1000)
  if (index === -1) {
    index = lyrics.value.length
  }
  currentLyricIndex.value = index - 1
}

const handleAudioPlay = (): void => {
  isPlaying.value = true
}

const handleAudioPause = (): void => {
  isPlaying.value = false
}

const handleAudioTimeUpdate = (): void => {
  if (!isDragging.value) {
    progress.value = (audio.currentTime / audio.duration) * 100 || 0
    updateCurrentLyric()
  }
}

const handleAudioError = (e: Event): void => {
  console.error('音频播放错误:', e)
  isPlaying.value = false
  if (!hasShownError.value) {
    ElMessage.error('播放失败，请尝试其他歌曲')
    hasShownError.value = true
  }
}

// 事件监听
onMounted((): void => {
  loadFromStorage()

  audio.addEventListener('play', handleAudioPlay)
  audio.addEventListener('pause', handleAudioPause)
  audio.addEventListener('ended', handleEnded)
  audio.addEventListener('timeupdate', handleAudioTimeUpdate)
  audio.addEventListener('error', handleAudioError)

  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onUnmounted(() => {
  isUnmounting.value = true

  // 停止播放
  if (audio) {
    audio.pause()
    // 移除src前先将音量设为0，避免可能的噪音
    audio.volume = 0
    audio.src = ''
    isPlaying.value = false
  }

  // 移除所有事件监听器
  audio.removeEventListener('play', handleAudioPlay)
  audio.removeEventListener('pause', handleAudioPause)
  audio.removeEventListener('ended', handleEnded)
  audio.removeEventListener('timeupdate', handleAudioTimeUpdate)
  audio.removeEventListener('error', handleAudioError)

  // 移除窗口大小变化事件监听器
  window.removeEventListener('resize', handleResize)

  // 保存数据
  saveToStorage()
})

// 从本地存储加载数据
const loadFromStorage = (): void => {
  try {
    const savedPlaylist = localStorage.getItem('music_player_playlist')
    const savedHistory = localStorage.getItem('music_player_history')

    if (savedPlaylist) {
      playlist.value = JSON.parse(savedPlaylist) as SongItem[]
      // 如果有播放列表，尝试继续播放上次的歌曲
      if (playlist.value.length > 0) {
        const lastIndex = localStorage.getItem('last_playing_index')
        if (lastIndex !== null) {
          currentIndex.value = parseInt(lastIndex) || 0
          // 异步加载音频，避免阻塞
          setTimeout(() => {
            playSong(currentIndex.value)
          }, 100)
        }
      }
    }

    if (savedHistory) {
      searchHistory.value = JSON.parse(savedHistory) as string[]
    }
  } catch (error) {
    console.error('加载本地数据失败:', error)
  }
}

// 保存数据到本地存储
const saveToStorage = (): void => {
  try {
    localStorage.setItem('music_player_playlist', JSON.stringify(playlist.value))
    localStorage.setItem('music_player_history', JSON.stringify(searchHistory.value))
    // 保存当前播放的索引
    localStorage.setItem('last_playing_index', currentIndex.value.toString())
  } catch (error) {
    console.error('保存数据失败:', error)
  }
}

// 添加搜索历史
const addToHistory = (query: string): void => {
  if (!query.trim()) return

  // 移除重复项
  searchHistory.value = searchHistory.value.filter((item: string): boolean => item !== query)
  // 添加到开头
  searchHistory.value.unshift(query)
  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value.pop()
  }
  saveToStorage()
}

// 从历史记录搜索
const searchFromHistory = (query: string): void => {
  searchQuery.value = query
  searchMusic()
}

// 清空历史记录
const clearHistory = (): void => {
  ElMessageBox.confirm(
    '确定要清空所有搜索历史吗？',
    '清空历史记录',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    searchHistory.value = []
    saveToStorage()
    ElMessage.success('历史记录已清空')
  }).catch(() => {})
}

// 清空播放列表
const clearPlaylist = (): void => {
  ElMessageBox.confirm(
    '确定要清空播放列表吗？当前播放将停止。',
    '清空播放列表',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 停止播放
    audio.pause()
    audio.src = ''
    isPlaying.value = false

    // 清空列表
    playlist.value = []
    currentIndex.value = 0

    // 保存状态
    saveToStorage()

    ElMessage.success('播放列表已清空')
  }).catch(() => {})
}

// 播放模式相关
const playMode = ref<PlayMode>('sequence') // 默认顺序播放
const showPlayMode = ref<boolean>(false) // 控制下拉菜单显示
const singlePlayCount = ref<number>(-1) // 单曲播放次数，-1表示无限循环

// 处理音乐播放结束
const handleEnded = (): void => {
  const nextIndex: number = getNextIndex()
  if (nextIndex !== -1) {
    playSong(nextIndex)
  }
}

// 监听播放模式变化
watch(playMode, (newMode: PlayMode): void => {
  if (newMode !== 'single') {
    // 切换到其他模式时重置播放次数
    singlePlayCount.value = -1
  }
})

// 监听播放列表变化
watch(playlist, (newVal: SongItem[]): void => {
  showPlayMode.value = newVal.length > 0
  saveToStorage()
}, { deep: true })

// 切换播放模式
const changePlayMode = (mode: PlayMode): void => {
  playMode.value = mode
  let message: string = ''
  switch (mode) {
    case 'sequence':
      message = '顺序播放'
      break
    case 'single':
      message = '单曲循环'
      break
    case 'random':
      message = '随机播放'
      break
  }
  ElMessage.success(message)
}

// 设置单曲播放次数
const setSinglePlayCount = (): void => {
  ElMessageBox.prompt('请输入播放次数（1-99，-1表示无限循环）', '设置播放次数', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^(-1|[1-9][0-9]?)$/,
    inputErrorMessage: '请输入-1或1-99的数字',
    inputValue: singlePlayCount.value.toString()
  }).then(({ value }: { value: string }): void => {
    const count: number = parseInt(value)
    if (count >= -1 && (count === -1 || count <= 99)) {
      singlePlayCount.value = count
      ElMessage.success(`已设置播放次数：${count === -1 ? '无限循环' : count + '次'}`)
    }
  }).catch(() => {})
}

// 获取歌曲背景图片
const getSongDetail = async (id: number): Promise<void> => {
  try {
    const response: AxiosResponse<SongDetailResponse> = await axios.get<SongDetailResponse>(`${API_BASE}/song/detail?ids=${id}`)
    if (response.data.songs && response.data.songs[0]) {
      const song: { al?: ApiAlbum } = response.data.songs[0]
      // 获取专辑图片作为背景
      currentSongBg.value = song.al?.picUrl || ''
    }
  } catch (error) {
    console.error('获取歌曲详情失败:', error)
  }
}

// 歌词点击跳转
const seekToLyric = (time: number): void => {
  if (audio && time >= 0) {
    audio.currentTime = time / 1000 // 将毫秒转换为秒
    if (!isPlaying.value) {
      togglePlay() // 如果当前未播放，则开始播放
    }
  }
}

// 处理搜索结果点击
const handleSearchResultClick = async (song: SongItem): Promise<void> => {
  try {
    // 获取音乐URL
    const musicUrl: string | null = await getMusicUrl(song.id)
    if (!musicUrl) {
      ElMessage.error('无法播放该歌曲')
      return
    }
    
    // 添加到播放列表
    addToPlaylist({
      ...song,
      url: musicUrl
    })
    
    // 获取歌词
    await getLyrics(song.id)
    
    // 获取歌曲详情（背景图等）
    await getSongDetail(song.id)
    
    // 播放歌曲
    const index: number = playlist.value.findIndex((item: SongItem): boolean => item.id === song.id)
    if (index !== -1) {
      playSong(index)
    }
    
    // 清空搜索结果
    searchResults.value = []
    searchQuery.value = ''
  } catch (error) {
    console.error('播放歌曲失败:', error)
    ElMessage.error('播放失败，请重试')
  }
}

// 动态计算播放器高度
const windowHeight = ref<number>(window.innerHeight)

const playerStyle = computed<{ height: string }>(() => {
  const calculatedHeight: number = (windowHeight.value / 2) + 100
  const maxHeight: number = 1500
  const finalHeight: number = Math.min(calculatedHeight, maxHeight)
  return {
    height: `${finalHeight}px`
  }
})

// 监听窗口大小变化
const handleResize = (): void => {
  windowHeight.value = window.innerHeight
}

// 音量图标计算属性
const volumeIcon = computed<string>(() => {
  if (volume.value === 0) {
    return '🔇' // 静音
  } else if (volume.value < 30) {
    return '🔈' // 低音量
  } else if (volume.value < 70) {
    return '🔉' // 中等音量
  } else {
    return '🔊' // 高音量
  }
})

// 切换静音
const toggleMute = (): void => {
  if (volume.value === 0) {
    // 如果当前是静音，恢复到上次的音量
    volume.value = lastVolume.value || 50
  } else {
    // 保存当前音量并设置为静音
    lastVolume.value = volume.value
    volume.value = 0
  }
  updateVolume()
}

// 保存上次的音量值
const lastVolume = ref<number>(50)
</script>

<style scoped>
.music-player {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  transition: all 0.3s ease;
}

.dark.music-player {
  background: #2c2c2c;
  color: #fff;
}

.player-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.dark .search-input {
  background: #3c3c3c;
  border-color: #444;
  color: #fff;
}

.search-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: #1890ff;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background: #40a9ff;
}

.clear-history-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: #ff4d4f;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-history-btn:hover {
  background: #ff7875;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
}

.dark .search-results {
  border-color: #444;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.dark .search-result-item:hover {
  background-color: #3c3c3c;
}

.add-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #e6f7ff;
}

.dark .add-btn:hover {
  background-color: #1f1f1f;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.dark .search-btn:disabled {
  background: #444;
}

.music-info {
  text-align: center;
}

.song-title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 5px;
}

.song-artist {
  font-size: 0.9em;
  color: #666;
}

.dark .song-artist {
  color: #999;
}

.lyrics-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.lyrics-wrapper {
  position: absolute;
  width: 100%;
  left: 0;
  transition: transform 0.3s ease;
  padding: 0 20px;
  overflow-y: auto;
}

.lyric-line {
  padding: 6px 0;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.6);
}

.lyric-line.active {
  color: #e40b0b;
  font-weight: bold;
  transform: scale(1.1);
}

.no-lyrics {
  text-align: center;
  color: rgba(0, 0, 0, 0.4);
  padding: 20px;
}

.dark .no-lyrics {
  color: rgba(255, 255, 255, 0.4);
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 0 10px;
  margin-bottom: 10px;
}

.time-display {
  font-size: 12px;
  color: #333;
  min-width: 45px;
  text-align: center;
}

.dark .time-display {
  color: #999;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.dark .progress-bar {
  background-color: #4a4a4a;
}

.progress {
  height: 100%;
  background-color: #1890ff;
  border-radius: 2px;
  transition: width 0.1s linear;
  position: relative;
}

.dark .progress {
  background-color: #177ddc;
}

.progress-handle {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background-color: #fff;
  border: 2px solid #1890ff;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.2s;
  z-index: 1;
}

.dark .progress-handle {
  background-color: #141414;
  border-color: #177ddc;
}

.progress-bar:hover .progress-handle {
  transform: scale(1);
}

.progress-bar:hover,
.progress-bar:active {
  height: 6px;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.control-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: transform 0.2s;
}

.control-btn:hover {
  transform: scale(1.1);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-btn {
  font-size: 2em;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 15px;
}

.volume-icon {
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s ease;
  user-select: none;
}

.volume-icon:hover {
  transform: scale(1.1);
}

.volume-slider {
  width: 60px;
  height: 4px;
}

.volume-percentage {
  min-width: 45px;
  color: #666;
  font-size: 14px;
}

.dark .volume-percentage {
  color: #fff;
}

.playlist-container {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.playlist-header h3 {
  margin: 0;
  font-size: 1.1em;
  color: #333;
}

.dark .playlist-header h3 {
  color: #fff;
}

.clear-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.9em;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: rgba(255, 0, 0, 0.1);
  color: #ff4d4f;
}

.playlist {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.playlist-item:hover {
  background-color: #f5f5f5;
}

.dark .playlist-item:hover {
  background-color: #3c3c3c;
}

.playlist-item.active {
  background-color: #e6f7ff;
}

.dark .playlist-item.active {
  background-color: #1f1f1f;
}

.song-index {
  width: 30px;
  text-align: center;
}

.song-info {
  flex: 1;
  margin: 0 10px;
}

.song-name {
  font-weight: 500;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  padding: 4px 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.playlist-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: #ff4d4f;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-tip {
  font-size: 0.9em;
  margin-top: 8px;
  color: #666;
}

.dark .empty-tip {
  color: #999;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(20px);
  transform: scale(1.1);
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.content-container {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  display: flex;
  overflow: scroll;
}

.dark .content-container {
  background: rgba(44, 44, 44, 0.1);
  border-color: rgba(255, 255, 255, 0.05);
}

/* 确保所有内容在毛玻璃效果上层 */
.search-container,
.player-controls,
.playlist-container {
  position: relative;
  z-index: 2;
}

/* 调整文字颜色，确保在背景上清晰可见 */
.song-title,
.artist-name {
  color: #333;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* 调整控件样式，使其在背景上更加突出 */
.el-button,
.el-slider,
.el-input {
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  background: rgba(255, 255, 255, 0.2);
}

/* 播放列表样式调整 */
.playlist {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.playlist-item {
  background: rgba(255, 255, 255, 0.5);
  transition: background-color 0.3s;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.8);
}

.playlist-item.active {
  background: rgba(64, 158, 255, 0.2);
}

.search-history {
  margin: 10px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-header h4 {
  margin: 0;
  font-size: 1.1em;
  color: #333;
}

.dark .history-header h4 {
  color: #fff;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-item {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dark .search-history {
  background: rgba(0, 0, 0, 0.2);
}

.dark .history-item {
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
}

.dark .history-item:hover {
  background: rgba(0, 0, 0, 0.4);
}

.dark .clear-btn {
  color: #999;
}

.dark .clear-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  color: #ff4d4f;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.el-dropdown {
  margin-left: 10px;
}

.play-mode-icon {
  margin-right: 5px;
  vertical-align: middle;
}

.play-mode-text {
  vertical-align: middle;
  white-space: nowrap;
}

.el-dropdown-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.el-button {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
