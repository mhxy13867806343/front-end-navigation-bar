<template>
  <div class="music-player" :class="{ 'dark': isDark }">
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
        <button 
          @click="searchMusic" 
          class="search-btn"
          :disabled="isLoading"
        >
          {{ isLoading ? '搜索中...' : '🔍' }}
        </button>
        <button 
          @click="clearHistory" 
          class="clear-history-btn"
          title="清空历史记录"
        >
          ✕
        </button>
      </div>

      <div class="search-history" v-if="searchHistory.length > 0">
        <h4>搜索历史</h4>
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
          @click="addToPlaylist(song)"
          class="search-result-item"
        >
          <div class="song-info">
            <div class="song-name">{{ song.name }}</div>
            <div class="song-artist">{{ song.artist }}</div>
            <div class="song-album">专辑：{{ song.album }}</div>
          </div>
          <button 
            class="add-btn" 
            title="添加到播放列表"
            :disabled="!song.url"
          >
            {{ song.url ? '➕' : '🚫' }}
          </button>
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
          🔊
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model="volume" 
            @input="updateVolume"
            class="volume-slider"
          >
        </div>
      </div>

      <div class="playlist" v-if="playlist.length > 0">
        <div class="playlist-header">
          <h3>播放列表</h3>
          <button 
            @click="clearPlaylist" 
            class="clear-btn"
            title="清空播放列表"
          >
            ✕
          </button>
        </div>
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
        <div v-if="playlist.length === 0" class="empty-state">播放列表为空</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const searchQuery = ref('')
const searchResults = ref([])
const searchHistory = ref([])
const playlist = ref([])
const currentIndex = ref(0)
const isPlaying = ref(false)
const progress = ref(0)
const volume = ref(100)
const audio = new Audio()
const isLoading = ref(false)
const progressBar = ref(null)
const isDragging = ref(false)
const hasShownError = ref(false)
const isUnmounting = ref(false)

// 接收dark mode prop
const props = defineProps({
  isDark: {
    type: Boolean,
    default: false
  }
})

const currentSong = computed(() => playlist.value[currentIndex.value] || {})
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < playlist.value.length - 1)

// API基础URL
const API_BASE = 'https://ncm.nekogan.com'

// 防抖函数
const debounce = (fn, delay) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 创建防抖的搜索函数
const debounceSearch = debounce(() => {
  if (searchQuery.value.trim()) {
    searchMusic()
  } else {
    searchResults.value = []
  }
}, 500)

// 搜索音乐
const searchMusic = async () => {
  if (!searchQuery.value.trim()) return
  isLoading.value = true
  
  try {
    const response = await axios.get(`${API_BASE}/search`, {
      params: {
        keywords: searchQuery.value,
        type: 1
      }
    })

    if (response.data && response.data.result && response.data.result.songs) {
      searchResults.value = response.data.result.songs
        .filter(song => song.fee !== 1)
        .map(song => ({
          id: song.id,
          name: song.name,
          artist: song.artists.map(artist => artist.name).join(', '),
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
const getMusicUrl = async (songId) => {
  try {
    const response = await axios.get(`${API_BASE}/song/url`, {
      params: {
        id: songId
      }
    })

    if (response.data && response.data.data && response.data.data[0]) {
      return response.data.data[0].url
    }
    return null
  } catch (error) {
    console.error('获取音乐URL失败:', error)
    return null
  }
}

// 添加到播放列表
const addToPlaylist = async (song) => {
  const url = await getMusicUrl(song.id)
  if (!url) {
    ElMessage.warning('该歌曲暂时无法播放')
    return
  }
  
  const exists = playlist.value.some(item => item.id === song.id)
  if (exists) {
    ElMessage.warning('该歌曲已在播放列表中')
    return
  }
  
  const songWithUrl = { ...song, url }
  playlist.value.push(songWithUrl)
  saveToStorage()
  
  if (playlist.value.length === 1) {
    playSong(0)
  }
  
  searchResults.value = []
  searchQuery.value = ''
  ElMessage.success('已添加到播放列表')
}

// 从播放列表移除
const removeFromPlaylist = (index) => {
  if (index === currentIndex.value) {
    audio.pause()
    isPlaying.value = false
    if (index === playlist.value.length - 1) {
      currentIndex.value = Math.max(0, index - 1)
    }
  } else if (index < currentIndex.value) {
    currentIndex.value--
  }
  
  playlist.value.splice(index, 1)
  saveToStorage()
  
  if (playlist.value.length === 0) {
    audio.src = ''
  }
}

// 播放控制
const togglePlay = () => {
  if (!currentSong.value.url) return
  
  if (isPlaying.value) {
    audio.pause()
    isPlaying.value = false
  } else {
    audio.play().catch(error => {
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

const playSong = async (index) => {
  try {
    currentIndex.value = index
    const song = playlist.value[index]
    
    if (!song) {
      throw new Error('找不到歌曲')
    }
    
    // 重置错误提示状态
    hasShownError.value = false
    
    // 停止当前播放
    audio.pause()
    isPlaying.value = false
    
    // 获取音乐URL
    const newUrl = await getMusicUrl(song.id)
    if (!newUrl) {
      throw new Error('获取音乐地址失败')
    }
    
    song.url = newUrl
    audio.src = newUrl
    
    try {
      await audio.play()
      isPlaying.value = true
    } catch (playError) {
      throw new Error('播放失败')
    }
    
  } catch (error) {
    console.error('播放失败:', error)
    isPlaying.value = false
    if (!hasShownError.value) {
      ElMessage.error('音频加载失败，请尝试其他歌曲')
      hasShownError.value = true
    }
    removeFromPlaylist(index)
    
    // 如果还有下一首歌，自动播放下一首
    if (hasNext.value && error.message !== '找不到歌曲') {
      next()
    }
  }
}

const prev = () => {
  if (hasPrev.value) {
    playSong(currentIndex.value - 1)
  }
}

const next = () => {
  if (hasNext.value) {
    playSong(currentIndex.value + 1)
  }
}

const seek = (event) => {
  updateProgress(event)
}

const startDragging = (event) => {
  isDragging.value = true
  updateProgress(event)
}

const stopDragging = () => {
  if (isDragging.value) {
    isDragging.value = false
  }
}

const onDrag = (event) => {
  if (isDragging.value) {
    updateProgress(event)
  }
}

const updateProgress = (event) => {
  if (!audio.duration || !progressBar.value) return
  const rect = progressBar.value.getBoundingClientRect()
  let percent = (event.clientX - rect.left) / rect.width
  // 确保百分比在0-1之间
  percent = Math.max(0, Math.min(1, percent))
  const time = percent * audio.duration
  audio.currentTime = time
}

const updateVolume = () => {
  audio.volume = volume.value / 100
}

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 事件监听
onMounted(() => {
  loadFromStorage()
  
  audio.addEventListener('timeupdate', () => {
    progress.value = (audio.currentTime / audio.duration) * 100
  })

  audio.addEventListener('ended', () => {
    if (hasNext.value) {
      next()
    } else {
      isPlaying.value = false
      progress.value = 0
    }
  })

  audio.addEventListener('error', (e) => {
    // 组件卸载时不显示错误
    if (isUnmounting.value) return
    
    console.error('音频加载错误:', e)
    isPlaying.value = false
    if (!hasShownError.value) {
      ElMessage.error('音频加载失败，请尝试其他歌曲')
      hasShownError.value = true
    }
    removeFromPlaylist(currentIndex.value)
  })
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
  audio.removeEventListener('timeupdate', null)
  audio.removeEventListener('ended', null)
  audio.removeEventListener('error', null)
  
  // 保存数据
  saveToStorage()
})

// 从本地存储加载数据
const loadFromStorage = () => {
  try {
    const savedPlaylist = localStorage.getItem('music_player_playlist')
    const savedHistory = localStorage.getItem('music_player_history')
    
    if (savedPlaylist) {
      playlist.value = JSON.parse(savedPlaylist)
    }
    
    if (savedHistory) {
      searchHistory.value = JSON.parse(savedHistory)
    }
  } catch (error) {
    console.error('加载本地数据失败:', error)
  }
}

// 保存数据到本地存储
const saveToStorage = () => {
  try {
    localStorage.setItem('music_player_playlist', JSON.stringify(playlist.value))
    localStorage.setItem('music_player_history', JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('保存数据失败:', error)
  }
}

// 添加搜索历史
const addToHistory = (query) => {
  if (!query.trim()) return
  
  // 移除重复项
  searchHistory.value = searchHistory.value.filter(item => item !== query)
  // 添加到开头
  searchHistory.value.unshift(query)
  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value.pop()
  }
  saveToStorage()
}

// 从历史记录搜索
const searchFromHistory = (query) => {
  searchQuery.value = query
  searchMusic()
}

// 清空历史记录
const clearHistory = () => {
  searchHistory.value = []
  saveToStorage()
}

// 清空播放列表
const clearPlaylist = () => {
  playlist.value = []
  currentIndex.value = 0
  audio.pause()
  audio.src = ''
  isPlaying.value = false
  saveToStorage()
}
</script>

<style scoped>
.music-player {
  width: 100%;
  max-width: 500px;
  padding: 20px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  color: #666;
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
  gap: 5px;
}

.volume-slider {
  width: 60px;
  height: 4px;
}

.playlist {
  margin-top: 20px;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
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

.search-result-item .song-album {
  font-size: 0.8em;
  color: #999;
}

.dark .search-result-item .song-album {
  color: #666;
}

.search-history {
  margin: 10px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
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

.empty-state {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 0.9em;
}

/* 滚动条样式 */
.search-results::-webkit-scrollbar,
.playlist::-webkit-scrollbar {
  width: 4px;
}

.search-results::-webkit-scrollbar-track,
.playlist::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.search-results::-webkit-scrollbar-thumb,
.playlist::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.search-results::-webkit-scrollbar-thumb:hover,
.playlist::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.dark .search-results::-webkit-scrollbar-track,
.dark .playlist::-webkit-scrollbar-track {
  background: #2c2c2c;
}

.dark .search-results::-webkit-scrollbar-thumb,
.dark .playlist::-webkit-scrollbar-thumb {
  background: #666;
}

.dark .search-results::-webkit-scrollbar-thumb:hover,
.dark .playlist::-webkit-scrollbar-thumb:hover {
  background: #888;
}
</style>
