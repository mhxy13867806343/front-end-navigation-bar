<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resolveApiUrl } from '../../utils/resolveApiUrl'

type LiveTabId = 'recommend' | 'hot' | 'new'

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

const activeTab = ref<LiveTabId>('recommend')
const hasStarted = ref<boolean>(false)
const loading = ref<boolean>(false)
const liveRooms = ref<BilibiliLiveRoom[]>([])
const liveRoomCount = ref<number>(0)
const updateTime = ref<string>('')
const errorMessage = ref<string>('')

const activeTabInfo = computed(() => tabs.find(tab => tab.id === activeTab.value) || tabs[0])

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

const getListUrl = (tabId: LiveTabId): string => {
  if (tabId === 'recommend') {
    return resolveApiUrl('/api-bilibili-live/room/v1/room/get_user_recommend?page=1&page_size=30')
  }

  const sortType = tabId === 'new' ? 'live_time' : 'online'
  return resolveApiUrl(`/api-bilibili-live/room/v3/area/getRoomList?platform=web&parent_area_id=0&cate_id=0&area_id=0&sort_type=${sortType}&page=1&page_size=30`)
}

const fetchLiveRoomCount = async (): Promise<number> => {
  const response = await fetch(resolveApiUrl('/api-bilibili-live/room/v1/Area/getLiveRoomCountByAreaID?areaId=0'))
  const json = await response.json() as BilibiliLiveApiResponse<{ num?: number }>
  return json.code === 0 ? Number(json.data?.num || 0) : 0
}

const fetchLiveRooms = async (tabId: LiveTabId): Promise<BilibiliLiveRoom[]> => {
  const response = await fetch(getListUrl(tabId))
  const json = await response.json() as BilibiliLiveApiResponse<BilibiliLiveListData | BilibiliLiveApiItem[]>

  if (json.code !== 0) {
    throw new Error(json.message || json.msg || `请求失败：${json.code}`)
  }

  const data = json.data
  const rawList = Array.isArray(data) ? data : data?.list || []
  if (!Array.isArray(data) && typeof data?.count === 'number') liveRoomCount.value = data.count

  return rawList.map(toLiveRoom)
}

const loadLiveData = async (tabId: LiveTabId = activeTab.value): Promise<void> => {
  if (loading.value) return

  hasStarted.value = true
  loading.value = true
  errorMessage.value = ''
  liveRooms.value = []

  try {
    const [count, rooms] = await Promise.all([
      fetchLiveRoomCount(),
      fetchLiveRooms(tabId)
    ])
    liveRoomCount.value = count || liveRoomCount.value
    liveRooms.value = rooms
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
  if (hasStarted.value) void loadLiveData(tabId)
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
        <div class="live-tabs" aria-label="直播分类">
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
        <strong>全部直播</strong>
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
