<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resolveApiUrl } from '../../utils/resolveApiUrl'
import { requestJinaJson } from '../../utils/jinaReader'

type LiveTabId = 'recommend' | 'hot' | 'new'
type LiveSourceId = 'all' | 'chat' | 'radio' | 'online-game' | 'single-game'

interface BilibiliLiveWatchedShow {
  text_small?: string
  text_large?: string
  num?: number
  switch?: boolean
}

interface BilibiliLiveApiItem {
  roomid?: number
  room_id?: number
  uid?: number
  mid?: number
  title?: string
  uname?: string
  face?: string
  cover?: string
  user_cover?: string
  system_cover?: string
  keyframe?: string
  online?: number
  link?: string
  area_name?: string
  areaName?: string
  area_v2_name?: string
  area_v2_parent_name?: string
  watched_show?: BilibiliLiveWatchedShow
}

interface BilibiliLiveListData {
  count?: number
  list?: BilibiliLiveApiItem[]
}

interface BilibiliLiveApiResponse<T> {
  code: number
  message?: string
  msg?: string
  data?: T
}

interface BilibiliLiveRoom {
  id: string
  roomId: number
  title: string
  anchorName: string
  cover: string
  avatar: string
  areaName: string
  parentAreaName: string
  onlineText: string
  watchedText: string
  roomUrl: string
}

const router = useRouter()
const tabs: Array<{ id: LiveTabId; label: string; icon: string }> = [
  { id: 'recommend', label: '推荐直播', icon: '✨' },
  { id: 'hot', label: '人气直播', icon: '🔥' },
  { id: 'new', label: '最新开播', icon: '🆕' }
]
const sources: Array<{ id: LiveSourceId; label: string; icon: string; parentAreaId: number; areaId: number }> = [
  { id: 'all', label: '全部直播', icon: '📺', parentAreaId: 0, areaId: 0 },
  { id: 'chat', label: '聊天室', icon: '💬', parentAreaId: 14, areaId: 0 },
  { id: 'radio', label: '电台', icon: '📻', parentAreaId: 5, areaId: 0 },
  { id: 'online-game', label: '网游', icon: '🎮', parentAreaId: 1, areaId: 21 },
  { id: 'single-game', label: '单机', icon: '🕹', parentAreaId: 6, areaId: 0 }
]

const activeTab = ref<LiveTabId>('recommend')
const activeSource = ref<LiveSourceId>('all')
const hasStarted = ref<boolean>(false)
const loading = ref<boolean>(false)
const liveRooms = ref<BilibiliLiveRoom[]>([])
const liveRoomCount = ref<number>(0)
const updateTime = ref<string>('')
const errorMessage = ref<string>('')

const activeTabInfo = computed(() => tabs.find(tab => tab.id === activeTab.value) || tabs[0])
const activeSourceInfo = computed(() => sources.find(source => source.id === activeSource.value) || sources[0])

const normalizeImageUrl = (url?: string): string => {
  if (!url) return ''
  if (url.startsWith('//')) return `https:${url}`
  return url.replace(/^http:/, 'https:')
}

const formatCount = (count?: number): string => {
  const value = Number(count || 0)
  if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 1 : 2).replace(/\.0+$/, '')}万`
  return String(value)
}

const formatNowTime = (): string => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}

const getRoomUrl = (item: BilibiliLiveApiItem): string => {
  if (item.link?.startsWith('http')) return item.link
  if (item.link?.startsWith('/')) return `https://live.bilibili.com${item.link}`
  const roomId = item.roomid || item.room_id || 0
  return `https://live.bilibili.com/${roomId}`
}

const toLiveRoom = (item: BilibiliLiveApiItem, index: number): BilibiliLiveRoom => {
  const roomId = item.roomid || item.room_id || index + 1
  const watchedText = item.watched_show?.text_small || item.watched_show?.text_large || ''

  return {
    id: `${roomId}-${item.uid || item.mid || index}`,
    roomId,
    title: item.title || '未命名直播间',
    anchorName: item.uname || '未知主播',
    cover: normalizeImageUrl(item.user_cover || item.cover || item.system_cover || item.keyframe),
    avatar: normalizeImageUrl(item.face),
    areaName: item.area_v2_name || item.area_name || item.areaName || '全部直播',
    parentAreaName: item.area_v2_parent_name || '',
    onlineText: watchedText || formatCount(item.online),
    watchedText,
    roomUrl: getRoomUrl(item)
  }
}

const fetchLiveJson = async <T>(url: string): Promise<T> => {
  if (import.meta.env.PROD) {
    return requestJinaJson<T>(url)
  } else {
    const res = await fetch(resolveApiUrl(url))
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json() as Promise<T>
  }
}

const getLiveApiBase = (): string => {
  return import.meta.env.PROD ? 'https://api.live.bilibili.com' : '/api-bilibili-live'
}

const getSortType = (tabId: LiveTabId): string => {
  if (tabId === 'hot') return 'online'
  if (tabId === 'new') return 'live_time'
  return ''
}

const buildLiveQuery = (params: Record<string, string | number | undefined>): string => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]: [string, string | number | undefined]): void => {
    if (value !== undefined && value !== '') query.set(key, String(value))
  })
  return query.toString()
}

const getLiveListUrls = (sourceId: LiveSourceId, tabId: LiveTabId): string[] => {
  const source = sources.find(item => item.id === sourceId) || sources[0]
  const base = getLiveApiBase()
  const sortType = getSortType(tabId)
  const commonParams = {
    platform: 'web',
    parent_area_id: source.parentAreaId,
    area_id: source.areaId,
    page: 1,
    page_size: 30,
    sort_type: sortType
  }

  return [
    `${base}/room/v3/area/getRoomList?${buildLiveQuery({ ...commonParams, cate_id: 0, tag_version: 1 })}`
  ]
}

const fetchLiveRooms = async (sourceId: LiveSourceId, tabId: LiveTabId): Promise<BilibiliLiveRoom[]> => {
  let lastError: unknown = null

  for (const url of getLiveListUrls(sourceId, tabId)) {
    try {
      const json = await fetchLiveJson<BilibiliLiveApiResponse<BilibiliLiveListData | BilibiliLiveApiItem[]>>(url)

      if (json.code !== 0) {
        throw new Error(json.message || json.msg || `请求失败：${json.code}`)
      }

      const data = json.data
      const rawList = Array.isArray(data) ? data : data?.list || []
      if (!rawList.length) {
        lastError = new Error('当前接口返回空列表')
        continue
      }

      if (!Array.isArray(data) && typeof data?.count === 'number') {
        liveRoomCount.value = data.count
      } else {
        liveRoomCount.value = rawList.length
      }

      return rawList.map(toLiveRoom)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('直播数据获取失败')
}

const loadLiveData = async (
  sourceId: LiveSourceId = activeSource.value,
  tabId: LiveTabId = activeTab.value
): Promise<void> => {
  if (loading.value) return

  hasStarted.value = true
  loading.value = true
  errorMessage.value = ''
  liveRooms.value = []

  try {
    liveRooms.value = await fetchLiveRooms(sourceId, tabId)
    updateTime.value = formatNowTime()
  } catch (error) {
    const message = error instanceof Error ? error.message : '直播数据获取失败'
    errorMessage.value = message
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

const selectTab = (tabId: LiveTabId): void => {
  activeTab.value = tabId
  if (hasStarted.value) void loadLiveData(activeSource.value, tabId)
}

const selectSource = (sourceId: LiveSourceId): void => {
  activeSource.value = sourceId
  if (hasStarted.value) void loadLiveData(sourceId, activeTab.value)
}

const openRoom = (room: BilibiliLiveRoom): void => {
  window.open(room.roomUrl, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <main class="bilibili-live-page">
    <section class="live-header">
      <div class="live-title-block">
        <span class="live-logo">📡</span>
        <div>
          <h1>直播</h1>
          <p>
            Bilibili 全部直播数据
            <span v-if="updateTime">（更新于 {{ updateTime }}）</span>
          </p>
        </div>
      </div>

      <button type="button" class="back-btn" @click="router.push('/toolbox')">← 工具箱</button>
    </section>

    <section v-if="!hasStarted" class="live-entry">
      <button type="button" class="entry-action" :disabled="loading" @click="loadLiveData()">
        <span class="entry-icon">📺</span>
        <span>
          <strong>{{ loading ? '正在获取...' : 'Bibi 直播' }}</strong>
          <em>点击后才请求直播列表数据</em>
        </span>
      </button>
    </section>

    <template v-else>
      <section class="live-toolbar">
        <div class="live-sources" aria-label="直播分区">
          <button
            v-for="source in sources"
            :key="source.id"
            type="button"
            class="live-source"
            :class="{ active: activeSource === source.id }"
            :disabled="loading"
            @click="selectSource(source.id)"
          >
            <span>{{ source.icon }}</span>
            {{ source.label }}
          </button>
        </div>

        <div class="live-tabs" aria-label="直播排序">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="live-tab"
            :class="{ active: activeTab === tab.id }"
            :disabled="loading"
            @click="selectTab(tab.id)"
          >
            <span>{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>

        <button type="button" class="reload-btn" :disabled="loading" @click="loadLiveData()">
          {{ loading ? '加载中...' : '刷新当前' }}
        </button>
      </section>

      <section class="live-summary">
        <strong>{{ activeSourceInfo.label }}</strong>
        <span>{{ formatCount(liveRoomCount) }}</span>
        <em>{{ activeTabInfo.label }}</em>
      </section>

      <section v-if="loading" class="live-loading" aria-live="polite">
        <span></span>
        正在加载直播数据...
      </section>

      <section v-else-if="errorMessage" class="live-empty">
        {{ errorMessage }}
      </section>

      <section v-else-if="liveRooms.length" class="live-grid" aria-label="Bilibili 直播列表">
        <button
          v-for="room in liveRooms"
          :key="room.id"
          type="button"
          class="live-card"
          @click="openRoom(room)"
        >
          <span class="cover-wrap">
            <img v-if="room.cover" :src="room.cover" :alt="room.title" referrerpolicy="no-referrer">
            <span v-else class="cover-fallback">LIVE</span>
            <span class="area-badge">{{ room.areaName }}</span>
          </span>
          <span class="room-info">
            <img v-if="room.avatar" class="avatar" :src="room.avatar" :alt="room.anchorName" referrerpolicy="no-referrer">
            <span v-else class="avatar avatar-fallback">B</span>
            <span class="room-text">
              <strong>{{ room.title }}</strong>
              <em>{{ room.anchorName }}</em>
              <span>
                <i>👁</i>
                {{ room.onlineText }}
                <small v-if="room.parentAreaName">/ {{ room.parentAreaName }}</small>
              </span>
            </span>
          </span>
        </button>
      </section>

      <section v-else class="live-empty">
        暂时没有获取到直播数据
      </section>
    </template>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
