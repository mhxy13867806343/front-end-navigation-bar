<template>
  <div class="lolm-page">
    <!-- Header -->
    <div class="header-card">
      <button class="back-btn" @click="goBack">
        ← 返回工具箱
      </button>
      <div class="title-box">
        <div class="main-title">⚔️ 英雄联盟手游 - 国服数据榜</div>
        <div class="sub-title">官方同步实时胜率、登场率与 BAN 率排行榜</div>
      </div>
      <div style="width: 100px;"></div>
    </div>

    <!-- Filter Panel -->
    <div class="filter-panel">
      <!-- 1. Rank Tier Filter -->
      <div class="filter-row">
        <div class="filter-label">🏆 分段选择:</div>
        <div class="btn-group">
          <button
            v-for="dan in danOptions"
            :key="dan.value"
            class="pill-btn"
            :class="{ active: selectedDan === dan.value }"
            @click="selectDan(dan.value)"
          >
            {{ dan.label }}
          </button>
        </div>
      </div>

      <!-- 2. Position Filter & Search -->
      <div class="filter-row">
        <div class="filter-label">🛡️ 分路位置:</div>
        <div class="btn-group">
          <button
            v-for="pos in positionOptions"
            :key="pos.value"
            class="pill-btn"
            :class="{ active: selectedPosition === pos.value }"
            @click="selectPosition(pos.value)"
          >
            {{ pos.label }}
          </button>
        </div>

        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          placeholder="🔍 搜索英雄名称 / 称号 (如: 凯尔、亚索)"
        />
      </div>
    </div>

    <!-- Main Table Content -->
    <div v-if="loading" class="loading-state">
      ⚔️ 正在实时拉取《英雄联盟手游》国服英雄胜率数据...
    </div>

    <div v-else-if="filteredHeroList.length > 0" class="stats-table-wrapper">
      <div class="update-time-text">
        <span>📅 数据时间: {{ updateDate }} (样本取自国服大盘竞技战报)</span>
        <span>当前共 {{ filteredHeroList.length }} 位英雄数据</span>
      </div>

      <div class="table-header">
        <div>排名</div>
        <div>英雄</div>
        <div
          class="sortable-col"
          :class="{ active: sortField === 'winRateNum' }"
          @click="toggleSort('winRateNum')"
        >
          胜率 {{ sortField === 'winRateNum' ? (sortOrder === 'desc' ? '▼' : '▲') : '' }}
        </div>
        <div
          class="sortable-col"
          :class="{ active: sortField === 'appearRateNum' }"
          @click="toggleSort('appearRateNum')"
        >
          登场率 {{ sortField === 'appearRateNum' ? (sortOrder === 'desc' ? '▼' : '▲') : '' }}
        </div>
        <div
          class="sortable-col"
          :class="{ active: sortField === 'forbidRateNum' }"
          @click="toggleSort('forbidRateNum')"
        >
          BAN率 {{ sortField === 'forbidRateNum' ? (sortOrder === 'desc' ? '▼' : '▲') : '' }}
        </div>
      </div>

      <div
        v-for="(hero, idx) in sortedHeroList"
        :key="hero.heroId + '-' + idx"
        class="table-row"
      >
        <div class="rank-num" :class="`top-${idx + 1}`">
          {{ idx + 1 }}
        </div>

        <div class="hero-info">
          <img :src="hero.avatar" class="avatar" :alt="hero.title" />
          <div class="name-box">
            <div class="hero-title">{{ hero.title }}</div>
            <div class="hero-name">{{ hero.name }}</div>
          </div>
        </div>

        <div class="stat-val win-rate">{{ hero.winRatePercent }}</div>
        <div class="stat-val appear-rate">{{ hero.appearRatePercent }}</div>
        <div class="stat-val ban-rate">{{ hero.forbidRatePercent }}</div>
      </div>
    </div>

    <div v-else-if="errorMessage" class="empty-state">
      ⚠️ {{ errorMessage }}
    </div>

    <div v-else class="empty-state">
      🔍 暂无符合条件的英雄数据，请尝试调整筛选分段或搜索关键词。
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { requestLolmHeroListJson, requestLolmRankJson } from '../../utils/lolmApi'

interface HeroMeta {
  heroId: string
  name: string
  title: string
  avatar: string
}

interface HeroRankItem {
  heroId: string
  name: string
  title: string
  avatar: string
  position: string
  winRateNum: number
  appearRateNum: number
  forbidRateNum: number
  winRatePercent: string
  appearRatePercent: string
  forbidRatePercent: string
  dtstatdate: string
}

const router = useRouter()
const loading = ref<boolean>(false)
const selectedDan = ref<string>('1') // '1': 钻石以上, '2': 大师以上, '3': 王者, '4': 峡谷之巅
const selectedPosition = ref<string>('all') // 'all', '2': 上单, '5': 打野, '1': 中路, '3': 下路, '4': 辅助
const searchKeyword = ref<string>('')
const sortField = ref<'winRateNum' | 'appearRateNum' | 'forbidRateNum'>('winRateNum')
const sortOrder = ref<'desc' | 'asc'>('desc')

const updateDate = ref<string>('')
const allRankData = ref<Record<string, Record<string, HeroRankItem[]>>>({})
const errorMessage = ref<string>('')

const danOptions = [
  { label: '💎 钻石以上', value: '1' },
  { label: '👑 大师以上', value: '2' },
  { label: '🏆 王者', value: '3' },
  { label: '⚔️ 峡谷之巅', value: '4' }
]

const positionOptions = [
  { label: '🌐 全部分路', value: 'all' },
  { label: '⚔️ 上单', value: '2' },
  { label: '🌲 打野', value: '5' },
  { label: '🧙‍♂️ 中路', value: '1' },
  { label: '🏹 下路', value: '3' },
  { label: '🛡️ 辅助', value: '4' }
]

function goBack(): void {
  router.push('/toolbox')
}

function selectDan(dan: string): void {
  selectedDan.value = dan
}

function selectPosition(pos: string): void {
  selectedPosition.value = pos
}

function toggleSort(field: 'winRateNum' | 'appearRateNum' | 'forbidRateNum'): void {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortField.value = field
    sortOrder.value = 'desc'
  }
}

const rawHeroList = computed<HeroRankItem[]>(() => {
  const danData = allRankData.value[selectedDan.value]
  if (!danData) return []

  if (selectedPosition.value !== 'all') {
    return danData[selectedPosition.value] || []
  }

  // If 'all', merge all position arrays uniquely by heroId
  const map = new Map<string, HeroRankItem>()
  for (const posKey of Object.keys(danData)) {
    const list = danData[posKey] || []
    for (const item of list) {
      if (!map.has(item.heroId) || item.winRateNum > (map.get(item.heroId)?.winRateNum || 0)) {
        map.set(item.heroId, item)
      }
    }
  }
  return Array.from(map.values())
})

const filteredHeroList = computed<HeroRankItem[]>(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return rawHeroList.value
  return rawHeroList.value.filter(h =>
    h.name.toLowerCase().includes(kw) ||
    h.title.toLowerCase().includes(kw)
  )
})

const sortedHeroList = computed<HeroRankItem[]>(() => {
  const list = [...filteredHeroList.value]
  const field = sortField.value
  const isDesc = sortOrder.value === 'desc'

  return list.sort((a, b) => {
    const diff = a[field] - b[field]
    return isDesc ? -diff : diff
  })
})

async function fetchLolmData(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    const [heroRes, rankRes] = await Promise.all([
      requestLolmHeroListJson<{ heroList?: Record<string, HeroMeta> }>().catch(() => ({ heroList: {} })),
      requestLolmRankJson<{ data?: Record<string, Record<string, any[]>> }>().catch(() => ({ data: undefined }))
    ])

    const heroMap: Record<string, HeroMeta> = heroRes.heroList || {}
    const rankData = rankRes.data

    if (!rankData) {
      throw new Error('未获取到国服英雄胜率排行榜')
    }

    const parsed: Record<string, Record<string, HeroRankItem[]>> = {}

    for (const danKey of Object.keys(rankData)) {
      parsed[danKey] = {}
      const placeMap = rankData[danKey] || {}
      for (const posKey of Object.keys(placeMap)) {
        const list = placeMap[posKey] || []
        parsed[danKey][posKey] = list.map((item: any) => {
          const meta = heroMap[item.hero_id] || {}
          if (item.dtstatdate && !updateDate.value) {
            updateDate.value = `${item.dtstatdate.slice(0, 4)}-${item.dtstatdate.slice(4, 6)}-${item.dtstatdate.slice(6, 8)}`
          }
          return {
            heroId: item.hero_id,
            name: meta.name || '英雄',
            title: meta.title || '英雄联盟',
            avatar: meta.avatar || `https://game.gtimg.cn/images/lgamem/act/lrlib/img/HeadIcon/H_S_${item.hero_id}.png`,
            position: item.position || posKey,
            winRateNum: parseFloat(item.win_rate_percent || item.win_rate || '0'),
            appearRateNum: parseFloat(item.appear_rate_percent || item.appear_rate || '0'),
            forbidRateNum: parseFloat(item.forbid_rate_percent || item.forbid_rate || '0'),
            winRatePercent: `${item.win_rate_percent || '0'}%`,
            appearRatePercent: `${item.appear_rate_percent || '0'}%`,
            forbidRatePercent: `${item.forbid_rate_percent || '0'}%`,
            dtstatdate: item.dtstatdate || ''
          }
        })
      }
    }

    // 峡谷之巅 ('4') 零数据兜底映射
    if (!parsed['4'] || Object.keys(parsed['4']).length === 0 || Object.values(parsed['4']).every(arr => arr.length === 0)) {
      parsed['4'] = parsed['3'] || parsed['1'] || parsed['0'] || {}
    }

    allRankData.value = parsed
    if (!updateDate.value) {
      updateDate.value = new Date().toLocaleDateString('zh-CN')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '获取 LOLM 英雄胜率失败'
    console.warn('获取 LOLM 英雄胜率失败:', err)
    allRankData.value = {}
    updateDate.value = ''
    errorMessage.value = message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLolmData()
})
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
