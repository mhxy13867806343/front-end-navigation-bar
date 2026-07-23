<template>
  <div class="star-page">
    <!-- Header -->
    <div class="header-card">
      <button class="back-btn" @click="goBack">
        ← 返回工具箱
      </button>
      <div class="title">✨ 十二星座运势查询</div>
      <div style="width: 100px;"></div>
    </div>

    <!-- 12 Star Selector Grid -->
    <div class="star-selector-grid">
      <div
        v-for="item in starList"
        :key="item.value"
        class="star-card"
        :class="{ active: selectedStar === item.value }"
        @click="selectStar(item.value)"
      >
        <span class="symbol">{{ item.symbol }}</span>
        <div class="name">{{ item.name }}</div>
        <div class="date">{{ item.date }}</div>
      </div>
    </div>

    <!-- Period Tabs -->
    <div class="tab-bar">
      <button
        v-for="tab in periodTabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: selectedTab === tab.value }"
        @click="selectedTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Main Content -->
    <div v-if="loading" class="loading-state">
      🔮 正在卜算 {{ currentStarInfo?.name }} 的运势解析...
    </div>

    <div v-else-if="currentPeriodData" class="content-section">
      <!-- Left Scores & Overview Card -->
      <div class="scores-card">
        <div class="card-title">
          <span>🌟 运势指数大览</span>
          <span style="font-size: 12px; color: #94a3b8; font-weight: normal; margin-left: auto;">
            {{ currentPeriodData.date || '今日' }}
          </span>
        </div>

        <div class="score-list">
          <div v-for="sc in scoreItems" :key="sc.key" class="score-row">
            <span class="label">{{ sc.label }}</span>
            <div class="bar-bg">
              <div
                class="bar-fill"
                :style="{ width: sc.val, background: sc.color }"
              ></div>
            </div>
            <span class="value">{{ sc.val }}</span>
          </div>
        </div>

        <!-- Tips Grid -->
        <div class="tips-grid">
          <div class="tip-box" v-if="currentPeriodData.yi">
            <div class="tip-label">👍 宜</div>
            <div class="tip-val yi">{{ currentPeriodData.yi }}</div>
          </div>
          <div class="tip-box" v-if="currentPeriodData.ji">
            <div class="tip-label">⚠️ 忌</div>
            <div class="tip-val ji">{{ currentPeriodData.ji }}</div>
          </div>
          <div class="tip-box" v-if="currentPeriodData.notice">
            <div class="tip-label">💡 建议提醒</div>
            <div class="tip-val notice">{{ currentPeriodData.notice }}</div>
          </div>
          <div class="tip-box" v-if="currentPeriodData.lucky_color">
            <div class="tip-label">🎨 幸运颜色</div>
            <div class="tip-val color">{{ currentPeriodData.lucky_color }}</div>
          </div>
          <div class="tip-box" v-if="currentPeriodData.lucky_number">
            <div class="tip-label">🔢 幸运数字</div>
            <div class="tip-val num">{{ currentPeriodData.lucky_number }}</div>
          </div>
          <div class="tip-box" v-if="currentPeriodData.lucky_star">
            <div class="tip-label">⭐ 贵人星座</div>
            <div class="tip-val star">{{ currentPeriodData.lucky_star }}</div>
          </div>
        </div>
      </div>

      <!-- Right Detailed Texts Card -->
      <div class="detail-card">
        <div v-if="currentPeriodData.all_text" class="text-block">
          <div class="block-header">✨ 综合运势解析</div>
          <div class="block-desc">{{ currentPeriodData.all_text }}</div>
        </div>

        <div v-if="currentPeriodData.love_text" class="text-block">
          <div class="block-header">💖 爱情感情运势</div>
          <div class="block-desc">{{ currentPeriodData.love_text }}</div>
        </div>

        <div v-if="currentPeriodData.work_text" class="text-block">
          <div class="block-header">💼 事业工作/学习</div>
          <div class="block-desc">{{ currentPeriodData.work_text }}</div>
        </div>

        <div v-if="currentPeriodData.money_text" class="text-block">
          <div class="block-header">💰 财富财运运势</div>
          <div class="block-desc">{{ currentPeriodData.money_text }}</div>
        </div>

        <div v-if="currentPeriodData.health_text" class="text-block">
          <div class="block-header">🌿 健康状况提醒</div>
          <div class="block-desc">{{ currentPeriodData.health_text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { resolveApiUrl } from '../../utils/resolveApiUrl'

interface StarItem {
  value: string
  name: string
  symbol: string
  date: string
}

interface PeriodData {
  date?: string
  all?: string
  love?: string
  work?: string
  money?: string
  health?: string
  discuss?: string
  yi?: string
  ji?: string
  notice?: string
  lucky_color?: string
  lucky_number?: number | string
  lucky_star?: string
  all_text?: string
  love_text?: string
  work_text?: string
  money_text?: string
  health_text?: string
}

interface StarApiData {
  day?: PeriodData
  tomorrow?: PeriodData
  week?: PeriodData
  month?: PeriodData
  year?: PeriodData
}

const router = useRouter()
const selectedStar = ref<string>('libra')
const selectedTab = ref<'day' | 'tomorrow' | 'week' | 'month' | 'year'>('day')
const starData = ref<StarApiData | null>(null)
const loading = ref<boolean>(false)

const starList: StarItem[] = [
  { value: 'aries', name: '白羊座', symbol: '♈', date: '3.21-4.19' },
  { value: 'taurus', name: '金牛座', symbol: '♉', date: '4.20-5.20' },
  { value: 'gemini', name: '双子座', symbol: '♊', date: '5.21-6.21' },
  { value: 'cancer', name: '巨蟹座', symbol: '♋', date: '6.22-7.22' },
  { value: 'leo', name: '狮子座', symbol: '♌', date: '7.23-8.22' },
  { value: 'virgo', name: '处女座', symbol: '♍', date: '8.23-9.22' },
  { value: 'libra', name: '天秤座', symbol: '♎', date: '9.23-10.23' },
  { value: 'scorpio', name: '天蝎座', symbol: '♏', date: '10.24-11.22' },
  { value: 'sagittarius', name: '射手座', symbol: '♐', date: '11.23-12.21' },
  { value: 'capricorn', name: '摩羯座', symbol: '♑', date: '12.22-1.19' },
  { value: 'aquarius', name: '水瓶座', symbol: '♒', date: '1.20-2.18' },
  { value: 'pisces', name: '双鱼座', symbol: '♓', date: '2.19-3.20' }
]

const periodTabs = [
  { value: 'day', label: '📅 今日运势' },
  { value: 'tomorrow', label: '🌅 明日运势' },
  { value: 'week', label: '📆 本周运势' },
  { value: 'month', label: '🌙 本月运势' },
  { value: 'year', label: '🎆 本年运势' }
] as const

const currentStarInfo = computed(() => {
  return starList.find(s => s.value === selectedStar.value)
})

const currentPeriodData = computed<PeriodData | null>(() => {
  if (!starData.value) return null
  return starData.value[selectedTab.value] || starData.value.day || null
})

const scoreItems = computed(() => {
  const p = currentPeriodData.value
  if (!p) return []
  return [
    { key: 'all', label: '综合运势', val: p.all || '75%', color: 'linear-gradient(90deg, #c084fc, #e879f9)' },
    { key: 'love', label: '爱情运势', val: p.love || '80%', color: 'linear-gradient(90deg, #f472b6, #fb7185)' },
    { key: 'work', label: '事业学业', val: p.work || '82%', color: 'linear-gradient(90deg, #38bdf8, #60a5fa)' },
    { key: 'money', label: '财富财运', val: p.money || '70%', color: 'linear-gradient(90deg, #fbbf24, #f59e0b)' },
    { key: 'health', label: '健康指数', val: p.health || '88%', color: 'linear-gradient(90deg, #4ade80, #34d399)' }
  ]
})

function goBack(): void {
  router.push('/toolbox')
}

function selectStar(starVal: string): void {
  selectedStar.value = starVal
  fetchStarData(starVal)
}

function getFallbackStarData(starVal: string): StarApiData {
  const starName = starList.find(s => s.value === starVal)?.name || '天秤座'
  return {
    day: {
      date: new Date().toLocaleDateString('zh-CN'),
      all: '85%',
      love: '88%',
      work: '82%',
      money: '75%',
      health: '90%',
      yi: '保持微笑、团队沟通',
      ji: '盲目投资、熬夜加班',
      notice: '保持从容心态',
      lucky_color: '天蓝色',
      lucky_number: 7,
      lucky_star: '双子座',
      all_text: `今日${starName}整体运势呈上佳态势！思维敏捷，适合处理复杂的工作和规划新目标，保持积极向上的心态能吸引贵人相助。`,
      love_text: '感情运势甜美，单身者魅力大增，有机会接触到投缘的异性；有伴侣者沟通顺畅，默契十足。',
      work_text: '工作表现亮眼，能够高效解决此前积压的疑难问题，受到领导与同事的一致认可。',
      money_text: '财运平稳，偏财运小有提升，适合储蓄和合理理财，切忌跟风炒股投资。',
      health_text: '精力充沛，身体状态良好，建议保持充沛的作息和有规律的户外锻炼。'
    }
  }
}

async function fetchStarData(starName: string): Promise<void> {
  loading.value = true
  try {
    const url = resolveApiUrl(`/api-alapi/api/star?token=qgqofofvmxtoskffd37omkscobipmn&star=${encodeURIComponent(starName)}`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json.code === 200 && json.data) {
      starData.value = json.data
    } else {
      throw new Error(json.message || '获取星座运势数据失败')
    }
  } catch (err) {
    console.warn('获取 ALAPI 星座运势失败，启用精选缓存数据:', err)
    starData.value = getFallbackStarData(starName)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStarData(selectedStar.value)
})
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
