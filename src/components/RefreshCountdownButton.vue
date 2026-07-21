<template>
  <el-button
    class="refresh-countdown-btn"
    :type="type"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    @click="handleClick"
  >
    <template v-if="loading">刷新中...</template>
    <template v-else-if="countdown > 0">{{ countdown }}s 后可刷新</template>
    <template v-else>🔄 {{ text }}</template>
  </el-button>
</template>

<script setup lang="ts">
import type { ButtonProps } from 'element-plus'

interface RefreshCountdownButtonProps {
  onRefresh?: (() => Promise<void> | void) | null
  seconds?: number
  text?: string
  type?: ButtonProps['type']
  size?: ButtonProps['size']
}

const props = withDefaults(defineProps<RefreshCountdownButtonProps>(), {
  onRefresh: null,
  seconds: 60,
  text: '刷新',
  type: 'primary',
  size: 'small'
})

const emit = defineEmits<{
  refresh: []
}>()

const loading = ref<boolean>(false)
const countdown = ref<number>(0)
let timer: ReturnType<typeof setInterval> | null = null

const disabled = computed<boolean>(() => countdown.value > 0 && !loading.value)

async function handleClick(): Promise<void> {
  if (loading.value || countdown.value > 0) return
  loading.value = true
  try {
    emit('refresh')
    if (props.onRefresh) {
      await props.onRefresh()
    }
  } catch (e) {
    console.error('刷新失败:', e)
  } finally {
    loading.value = false
    startCountdown()
  }
}

function startCountdown(): void {
  countdown.value = props.seconds
  if (timer !== null) clearInterval(timer)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      countdown.value = 0
      if (timer !== null) clearInterval(timer)
      timer = null
    }
  }, 1000)
}

onBeforeUnmount(() => {
  if (timer !== null) clearInterval(timer)
})
</script>

<style scoped src="./css/RefreshCountdownButton.css"></style>
