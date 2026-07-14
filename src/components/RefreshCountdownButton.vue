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

<script setup>

const props = defineProps({
  // 刷新回调，支持返回 Promise，期间按钮呈 loading 状态
  onRefresh: {
    type: Function,
    default: null
  },
  // 倒计时秒数
  seconds: {
    type: Number,
    default: 60
  },
  // 按钮文案
  text: {
    type: String,
    default: '刷新'
  },
  type: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: 'small'
  }
})

const emit = defineEmits(['refresh'])

const loading = ref(false)
const countdown = ref(0)
let timer = null

const disabled = computed(() => countdown.value > 0 && !loading.value)

async function handleClick() {
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

function startCountdown() {
  countdown.value = props.seconds
  clearInterval(timer)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      countdown.value = 0
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.refresh-countdown-btn {
  min-width: 108px;
}
</style>
