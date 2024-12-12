<template>
  <div class="mini-player" :class="{ 'dark': isDark }">
    <div class="left-section" @click="$emit('show-player')">
      <img 
        :src="currentSong.cover || '/default-cover.jpg'" 
        class="cover-img"
        alt="封面"
      />
      <div class="song-info">
        <div class="song-name">{{ currentSong.name }}</div>
        <div class="song-artist">{{ currentSong.artist }}</div>
      </div>
    </div>
    
    <div class="controls">
      <button class="control-btn" @click="$emit('toggle-play')">
        <i class="iconfont">{{ isPlaying ? '⏸' : '▶' }}</i>
      </button>
      <button class="control-btn" @click="$emit('next')" :disabled="!hasNext">
        <i class="iconfont">⏭</i>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentSong: {
    type: Object,
    required: true
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  hasNext: {
    type: Boolean,
    default: false
  },
  isDark: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-play', 'next', 'show-player'])
</script>

<style scoped>
.mini-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.dark.mini-player {
  background: rgba(33, 33, 33, 0.98);
  color: #fff;
  box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.3);
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.cover-img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.song-info {
  min-width: 0;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .song-artist {
  color: #aaa;
}

.controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: inherit;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark .control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.iconfont {
  font-style: normal;
}
</style>