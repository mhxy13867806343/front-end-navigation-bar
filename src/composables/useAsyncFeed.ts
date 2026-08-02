import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseAsyncFeedOptions<T> {
  fetcher: () => Promise<T>
  autoRefreshIntervalSeconds?: number
  onSuccess?: (data: T) => void
  onError?: (err: unknown) => void
}

export interface UseAsyncFeedReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  lastUpdated: Ref<Date | null>
  refresh: () => Promise<void>
  countdownSeconds: Ref<number>
}

/**
 * Universal Vue 3 composable hook for asynchronous data feed fetching,
 * loading state management, error handling, and auto-refresh countdown.
 */
export function useAsyncFeed<T>(options: UseAsyncFeedOptions<T>): UseAsyncFeedReturn<T> {
  const { fetcher, autoRefreshIntervalSeconds = 0, onSuccess, onError } = options

  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const countdownSeconds = ref<number>(autoRefreshIntervalSeconds)

  let timerId: ReturnType<typeof setInterval> | null = null

  const refresh = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const res = await fetcher()
      data.value = res
      lastUpdated.value = new Date()
      if (onSuccess) onSuccess(res)
    } catch (err: any) {
      error.value = err?.message || '加载失败'
      if (onError) onError(err)
    } finally {
      loading.value = false
      if (autoRefreshIntervalSeconds > 0) {
        countdownSeconds.value = autoRefreshIntervalSeconds
      }
    }
  }

  onMounted(() => {
    refresh()
    if (autoRefreshIntervalSeconds > 0) {
      timerId = setInterval(() => {
        if (countdownSeconds.value > 1) {

          countdownSeconds.value -= 1
        } else {
          refresh()
        }
      }, 1000)
    }
  })

  onUnmounted(() => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  })

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    countdownSeconds
  }
}
