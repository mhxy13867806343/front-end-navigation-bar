<template>
  <div class="dy-form">
    <DynamicFormDesigner
      :is-local-save="false"
      @save="handleSave"
    />
    <button
      class="dy-form-music-toggle"
      type="button"
      title="显示音乐播放器"
      aria-label="显示音乐播放器"
      @click="showMusicPlayer"
    >
      <span>♪</span>
      <em>音乐</em>
    </button>
  </div>
</template>

<script setup lang="ts">
import DynamicFormDesigner from '../components/DynamicForm/DynamicFormDesigner.vue'
import type { DynamicFormPayload } from '@/types/dynamicForm'

const ALAPI_PLAYER_SHOW_EVENT: string = 'alapi-player:show'

// 处理保存事件
const handleSave = (formData: DynamicFormPayload): void => {
  // 这里可以处理表单数据，比如发送到服务器
  console.log('保存的表单数据:', formData)
}

const showMusicPlayer = (): void => {
  window.dispatchEvent(new CustomEvent(ALAPI_PLAYER_SHOW_EVENT))
}
</script>

<style scoped lang="scss" src="./css/DyForm.scss"></style>
