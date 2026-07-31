import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { STORAGE_KEYS } from '@/constants/storageKeys'

export const SHARE_RECORDS_CHANGE_EVENT = 'hooksvue-share-records-change'

export interface SharePayload {
  id?: string
  title: string
  url: string
  description?: string
  image?: string
  source?: string
  tags?: string[]
  type?: 'page' | 'item'
}

export interface ShareRecord {
  id: string
  title: string
  url: string
  description: string
  image?: string
  source: string
  tags: string[]
  type: 'page' | 'item'
  timestamp: number
  count: number
}

function readShareRecords(): Record<string, ShareRecord> {
  if (typeof window === 'undefined') return {}

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.SHARE_RECORDS) || '{}') as Record<string, ShareRecord>
  } catch {
    return {}
  }
}

function saveShareRecords(value: Record<string, ShareRecord>): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEYS.SHARE_RECORDS, JSON.stringify(value))
  window.dispatchEvent(new Event(SHARE_RECORDS_CHANGE_EVENT))
}

export function buildShareUrl(url: string): string {
  if (typeof window === 'undefined') return url
  if (/^https?:\/\//i.test(url)) return url
  const cleanPath = url.startsWith('/') ? url.slice(1) : url
  return new URL(cleanPath, `${window.location.origin}${import.meta.env.BASE_URL}`).href
}

function buildRecordId(payload: SharePayload): string {
  return payload.id || `${payload.type || 'item'}:${payload.source || 'HOOKSVUE'}:${payload.url || payload.title}`
}

export function useShareRecords() {
  const shareRecords = ref<Record<string, ShareRecord>>({})

  const shareRecordsList = computed<ShareRecord[]>(() => {
    return Object.values(shareRecords.value).sort((left: ShareRecord, right: ShareRecord): number => right.timestamp - left.timestamp)
  })

  const loadShareRecords = (): void => {
    shareRecords.value = readShareRecords()
  }

  const recordShare = (payload: SharePayload): ShareRecord => {
    const normalizedUrl = buildShareUrl(payload.url)
    const id = buildRecordId({ ...payload, url: normalizedUrl })
    const next = { ...shareRecords.value }
    const previous = next[id]
    const record: ShareRecord = {
      id,
      title: payload.title || '未命名分享',
      url: normalizedUrl,
      description: payload.description || '暂无分享摘要',
      image: payload.image,
      source: payload.source || 'HOOKSVUE',
      tags: payload.tags || [],
      type: payload.type || 'item',
      timestamp: Date.now(),
      count: previous ? previous.count + 1 : 1
    }
    next[id] = record
    shareRecords.value = next
    saveShareRecords(next)
    return record
  }

  const copyShareLink = async (payload: SharePayload): Promise<void> => {
    const record = recordShare(payload)
    await navigator.clipboard.writeText(record.url)
    ElMessage({ message: `已复制分享链接：${record.title}`, type: 'success', duration: 1200 })
  }

  const clearShareRecords = (): void => {
    shareRecords.value = {}
    saveShareRecords({})
  }

  onMounted((): void => {
    loadShareRecords()
    window.addEventListener(SHARE_RECORDS_CHANGE_EVENT, loadShareRecords)
  })

  onUnmounted((): void => {
    window.removeEventListener(SHARE_RECORDS_CHANGE_EVENT, loadShareRecords)
  })

  return {
    shareRecords,
    shareRecordsList,
    loadShareRecords,
    recordShare,
    copyShareLink,
    clearShareRecords
  }
}
