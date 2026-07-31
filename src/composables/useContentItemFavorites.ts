import { onMounted, onUnmounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { STORAGE_KEYS } from '@/constants/storageKeys'

export const CONTENT_FAVORITES_CHANGE_EVENT = 'hooksvue-content-favorites-change'

export interface ContentItemFavoritePayload {
  id: string
  title: string
  source: string
  url: string
  route?: string
  summary?: string
  image?: string
  tags?: string[]
}

export interface ContentItemFavorite {
  title: string
  source: string
  url: string
  summary: string
  image?: string
  route?: string
  timestamp: number
  tags: string[]
}

function readContentFavorites(): Record<string, ContentItemFavorite> {
  if (typeof window === 'undefined') return {}

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.CONTENT_ITEM_FAVORITES) || '{}') as Record<string, ContentItemFavorite>
  } catch {
    return {}
  }
}

function saveContentFavorites(value: Record<string, ContentItemFavorite>): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEYS.CONTENT_ITEM_FAVORITES, JSON.stringify(value))
  window.dispatchEvent(new Event(CONTENT_FAVORITES_CHANGE_EVENT))
}

async function confirmFavoriteRemoval(title: string): Promise<boolean> {
  try {
    await ElMessageBox.confirm(`确定要取消收藏「${title}」吗？`, '取消收藏确认', {
      confirmButtonText: '确认取消',
      cancelButtonText: '再想想',
      type: 'warning',
      autofocus: false,
      lockScroll: false
    })
    return true
  } catch {
    return false
  }
}

export function useContentItemFavorites() {
  const contentItemFavorites = ref<Record<string, ContentItemFavorite>>({})

  const loadContentFavorites = (): void => {
    contentItemFavorites.value = readContentFavorites()
  }

  const isContentItemFavorite = (id: string): boolean => Boolean(contentItemFavorites.value[id])

  const toggleContentItemFavorite = async (payload: ContentItemFavoritePayload): Promise<void> => {
    if (!payload.id || !payload.title) return
    const next: Record<string, ContentItemFavorite> = { ...contentItemFavorites.value }

    if (next[payload.id]) {
      const confirmed = await confirmFavoriteRemoval(payload.title)
      if (!confirmed) return
      delete next[payload.id]
      contentItemFavorites.value = next
      saveContentFavorites(next)
      ElMessage({ message: `已取消收藏：${payload.title}`, type: 'info', duration: 1200 })
      return
    }

    next[payload.id] = {
      title: payload.title,
      source: payload.source,
      url: payload.url,
      summary: payload.summary || '暂无摘要',
      image: payload.image,
      route: payload.route,
      timestamp: Date.now(),
      tags: payload.tags || []
    }
    contentItemFavorites.value = next
    saveContentFavorites(next)
    ElMessage.success(`已收藏：${payload.title}`)
  }

  onMounted((): void => {
    loadContentFavorites()
    window.addEventListener(CONTENT_FAVORITES_CHANGE_EVENT, loadContentFavorites)
  })

  onUnmounted((): void => {
    window.removeEventListener(CONTENT_FAVORITES_CHANGE_EVENT, loadContentFavorites)
  })

  return {
    contentItemFavorites,
    loadContentFavorites,
    isContentItemFavorite,
    toggleContentItemFavorite
  }
}
