import { computed, onMounted, onUnmounted, ref } from 'vue'

export const useScreenClock = () => {
  const now = ref<Date>(new Date())
  let timer: number | null = null

  const update = (): void => {
    now.value = new Date()
  }

  onMounted((): void => {
    update()
    timer = window.setInterval(update, 1000)
  })

  onUnmounted((): void => {
    if (timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
  })

  const dateText = computed<string>(() => {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      weekday: 'long'
    }).format(now.value)
  })

  const timeText = computed<string>(() => {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now.value)
  })

  return {
    dateText,
    timeText
  }
}
