<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resolveApiUrl } from '../../utils/resolveApiUrl'

export interface BilibiliTrendingItem {
  position: number
  keyword: string
  show_name: string
  word_type: number
  icon?: string
  hot_id?: number
  is_commercial?: string
  iconError?: boolean
}

const router = useRouter()
const list = ref<BilibiliTrendingItem[]>([])
const loading = ref<boolean>(false)
const searchQuery = ref<string>('')
const updateTime = ref<string>('')

const formatBilibiliIcon = (url?: string): string => {
  if (!url) return ''
  let formatted = url.replace(/^http:/, 'https:')
  if (formatted.includes('@')) {
    formatted = formatted.split('@')[0]
  }
  return `${formatted}@48w_48h_1c.webp`
}

const handleImgError = (item: BilibiliTrendingItem): void => {
  item.iconError = true
}

const hasValidIcon = (item: BilibiliTrendingItem): boolean => Boolean(item.icon && !item.iconError)

const getWordTypeBadge = (item: BilibiliTrendingItem) => {
  if (item.word_type === 4) return { text: '新', class: 'badge-new' }
  if (item.word_type === 5) return { text: '热', class: 'badge-hot' }
  if (item.word_type === 7) return { text: '直播', class: 'badge-live' }
  if (item.word_type === 9) return { text: '梗', class: 'badge-geng' }
  if (item.word_type === 12) return { text: '独家', class: 'badge-exclusive' }
  return null
}

const fetchBilibiliTrending = async (): Promise<void> => {
  loading.value = true
  try {
    const targetUrl = resolveApiUrl('/api-bilibili-trending/x/v2/search/trending/ranking?limit=100')
    const res = await fetch(targetUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    if (json.code === 0 && Array.isArray(json.data?.list)) {
      list.value = json.data.list
      const now = new Date()
      updateTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      ElMessage.success('已更新 Bilibili 搜索热搜榜 (Top 100)')
    } else {
      throw new Error(json.message || '数据结构异常')
    }
  } catch (err) {
    console.warn('Fetch bilibili trending failed, using fallback mock dataset:', err)
    list.value = [
      { position: 1, keyword: '北京WB 广州TTG', show_name: '广州TTG战胜北京WB', word_type: 8, hot_id: 262864 },
      { position: 2, keyword: '足协辟谣米利西奇辞职', show_name: '足协辟谣米利西奇辞职', word_type: 4, hot_id: 262875 },
      { position: 3, keyword: '妙脆角猫最危险的一天', show_name: '妙脆角猫最危险的一天', word_type: 9, hot_id: 262865 },
      { position: 4, keyword: 'TES WE', show_name: 'TES战胜WE LPL第三赛段', word_type: 5, hot_id: 262858 },
      { position: 5, keyword: 'AG DRG', show_name: 'AG vs DRG VCT第二赛段', word_type: 7, hot_id: 262871 },
      { position: 6, keyword: '你们宿舍全进世界杯', show_name: '你们宿舍全进世界杯', word_type: 9, hot_id: 262881 },
      { position: 7, keyword: 'TES战胜WE赛后数据', show_name: 'TES战胜WE赛后数据', word_type: 4, hot_id: 262878 },
      { position: 8, keyword: '美加墨世界杯回顾复盘', show_name: '美加墨世界杯回顾复盘', word_type: 8, hot_id: 262874 },
      { position: 9, keyword: '在村里举办一场世界杯', show_name: '在村里举办一场世界杯', word_type: 12, hot_id: 262870 },
      { position: 10, keyword: 'Mrbeast结婚啦', show_name: 'Mrbeast结婚啦', word_type: 8, hot_id: 262815 }
    ]
    const now = new Date()
    updateTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  } finally {
    loading.value = false
  }
}

const filteredList = computed(() => {
  if (!searchQuery.value) return list.value
  const q = searchQuery.value.toLowerCase()
  return list.value.filter(item =>
    item.show_name.toLowerCase().includes(q) || item.keyword.toLowerCase().includes(q)
  )
})

const openBilibiliSearch = (keyword: string): void => {
  window.open(`https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`, '_blank')
}

onMounted(() => {
  void fetchBilibiliTrending()
})
</script>

<template>
  <main class="bilibili-trending-page">
    <!-- Header Controls -->
    <header class="page-header">
      <div class="header-left">
        <span class="bili-logo">📺</span>
        <div>
          <h1 class="header-title">Bilibili 搜索热搜榜</h1>
          <p class="header-subtitle">实时追踪哔哩哔哩全站 Top 100 搜索热度焦点 <span v-if="updateTime" class="update-tag">（更新于 {{ updateTime }}）</span></p>
        </div>
      </div>

      <div class="header-right">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="搜索关键词..." />
        </div>
        <button type="button" class="refresh-btn" :disabled="loading" @click="fetchBilibiliTrending">
          <span :class="{ spinning: loading }">🔄</span> 刷新
        </button>
        <button type="button" class="back-btn" @click="router.push('/toolbox')">
          ← 工具箱
        </button>
      </div>
    </header>

    <!-- Main List Container matching 1:1 Screenshot -->
    <div class="trending-list-card">
      <div v-if="loading && list.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>正在拉取 Bilibili 热搜榜 Top 100...</p>
      </div>

      <div v-else-if="filteredList.length === 0" class="empty-state">
        <p>📭 没有找到包含 "{{ searchQuery }}" 的热搜关键词</p>
      </div>

      <div v-else class="ranking-list">
        <div
          v-for="item in filteredList"
          :key="item.position"
          class="ranking-item"
          @click="openBilibiliSearch(item.keyword)"
        >
          <!-- Rank Number (1:1 styling from screenshot) -->
          <div class="rank-number" :class="`rank-${item.position}`">
            {{ item.position }}
          </div>

          <!-- Keyword Title -->
          <div class="keyword-title">
            {{ item.show_name || item.keyword }}
          </div>

          <!-- Badge Pills (新 / 热 / 梗 / 独家 / 直播) -->
          <div class="badge-container">
            <img
              v-if="hasValidIcon(item)"
              :src="formatBilibiliIcon(item.icon)"
              alt="icon"
              class="badge-icon-img"
              referrerpolicy="no-referrer"
              @error="handleImgError(item)"
            />
            <span
              v-else-if="getWordTypeBadge(item)"
              class="type-badge"
              :class="getWordTypeBadge(item)?.class"
            >
              {{ getWordTypeBadge(item)?.text }}
            </span>
          </div>

          <!-- Right Arrow '>' -->
          <div v-if="hasValidIcon(item)" class="arrow-icon">&gt;</div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
