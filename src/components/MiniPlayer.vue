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

<script setup lang="ts">
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

<style scoped lang="scss" src="./css/MiniPlayer.scss"></style>