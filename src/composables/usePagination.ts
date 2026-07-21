import { ref } from 'vue'

export interface PaginationOptions<T> {
  pageSize?: number
  fetchFn: (cursor: string, isReset: boolean) => Promise<{ items: T[]; nextCursor: string; hasMore: boolean }>
}

/**
 * Reusable Pagination / Infinite Scroll composable for Vue 3 components
 */
export function usePagination<T>(options: PaginationOptions<T>) {
  const items = ref<T[]>([]) as any
  const cursor = ref<string>('0')
  const hasMore = ref<boolean>(true)
  const loading = ref<boolean>(false)
  const error = ref<string>('')

  const loadData = async (reset: boolean = false): Promise<void> => {
    if (loading.value) return
    if (!reset && !hasMore.value) return

    loading.value = true
    error.value = ''

    if (reset) {
      cursor.value = '0'
      items.value = []
      hasMore.value = true
    }

    try {
      const res = await options.fetchFn(cursor.value, reset)
      items.value = reset ? res.items : [...items.value, ...res.items]
      cursor.value = res.nextCursor
      hasMore.value = res.hasMore
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      error.value = message
    } finally {
      loading.value = false
    }
  }

  const loadMore = (): Promise<void> => loadData(false)
  const refresh = (): Promise<void> => loadData(true)

  return {
    items,
    cursor,
    hasMore,
    loading,
    error,
    loadData,
    loadMore,
    refresh
  }
}
