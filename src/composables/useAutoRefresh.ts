import { ref, onMounted, onUnmounted } from 'vue'

export interface AutoRefreshOptions {
  /** 自动刷新时间间隔 (秒)，默认 120s */
  intervalSeconds?: number
  /** 是否自动开启倒计时，默认 true */
  autoStart?: boolean
  /** 到达时间或手动刷新时的回调函数 */
  onRefresh: () => void | Promise<void>
}

export function useAutoRefresh(options: AutoRefreshOptions) {
  const { intervalSeconds = 120, autoStart = true, onRefresh } = options

  const countdown = ref<number>(intervalSeconds)
  const isPaused = ref<boolean>(!autoStart)
  let timer: number | null = null

  const start = (): void => {
    if (timer !== null) return
    isPaused.value = false
    timer = window.setInterval(async (): Promise<void> => {
      if (isPaused.value) return
      countdown.value -= 1
      if (countdown.value <= 0) {
        countdown.value = intervalSeconds
        await onRefresh()
      }
    }, 1000)
  }

  const stop = (): void => {
    if (timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
    isPaused.value = true
  }

  const reset = (): void => {
    countdown.value = intervalSeconds
  }

  const togglePause = (): void => {
    isPaused.value = !isPaused.value
  }

  const triggerManualRefresh = async (): Promise<void> => {
    reset()
    await onRefresh()
  }

  onMounted((): void => {
    if (autoStart) {
      start()
    }
  })

  onUnmounted((): void => {
    stop()
  })

  return {
    countdown,
    isPaused,
    start,
    stop,
    reset,
    togglePause,
    triggerManualRefresh
  }
}
