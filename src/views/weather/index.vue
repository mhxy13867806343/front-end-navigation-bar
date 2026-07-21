<template>
  <div class="weather-page">
    <div class="header-banner">
      <div class="header-content">
        <h1 class="page-title">🌦️ 天气查询</h1>
        <div class="search-box">
          <ChinaRegionCascader
            v-model="selectedRegion"
            placeholder="📍 选择全国省 / 市 / 区县..."
            size="large"
            class="region-picker"
            @change="handleRegionChange"
          />
          <div class="search-input-group">
            <el-input
              v-model="searchQuery"
              placeholder="或输入城市名，如：杭州"
              @keyup.enter="searchWeather"
              class="city-input"
              size="large"
            >
              <template #append>
                <el-button type="primary" @click="searchWeather">搜索</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <!-- 实况天气 -->
        <el-tab-pane label="实况天气" name="realtime">
          <div v-if="loading.realtime" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>
          <div v-else-if="error.realtime" class="error-state">
            <el-empty description="获取天气失败">
              <el-button type="primary" @click="searchWeather">重试</el-button>
            </el-empty>
          </div>
          <div v-else-if="realtimeData" class="realtime-tab">
            <div class="main-weather-card">
              <div class="weather-header">
                <h2>{{ realtimeData.city }} <span class="province">{{ realtimeData.province }}</span></h2>
                <span class="update-time">更新时间: {{ realtimeData.update_time }}</span>
              </div>
              
              <div class="temp-display">
                <div class="temp-value">{{ realtimeData.temp }}<span class="unit">°</span></div>
                <div class="weather-desc">
                  <span class="weather-text">{{ realtimeData.weather }}</span>
                  <span class="temp-range" v-if="realtimeData.min_temp && realtimeData.max_temp">
                    {{ realtimeData.min_temp }}° / {{ realtimeData.max_temp }}°
                  </span>
                </div>
              </div>

              <div class="weather-info-grid">
                <div class="info-card">
                  <div class="info-icon">💨</div>
                  <div class="info-content">
                    <div class="info-label">风向风力</div>
                    <div class="info-val">{{ realtimeData.wind }} {{ realtimeData.wind_speed }}</div>
                  </div>
                </div>
                <div class="info-card">
                  <div class="info-icon">💧</div>
                  <div class="info-content">
                    <div class="info-label">相对湿度</div>
                    <div class="info-val">{{ realtimeData.humidity }}%</div>
                  </div>
                </div>
                <div class="info-card">
                  <div class="info-icon">🍃</div>
                  <div class="info-content">
                    <div class="info-label">空气质量</div>
                    <div class="info-val">{{ realtimeData.air || '良' }} ({{ realtimeData.air_level || '优' }})</div>
                  </div>
                </div>
                <div class="info-card" v-if="realtimeData.air_pm25">
                  <div class="info-icon">😷</div>
                  <div class="info-content">
                    <div class="info-label">PM2.5</div>
                    <div class="info-val">{{ realtimeData.air_pm25 }}</div>
                  </div>
                </div>
                <div class="info-card" v-if="realtimeData.sunrise && realtimeData.sunset">
                  <div class="info-icon">🌅</div>
                  <div class="info-content">
                    <div class="info-label">日出日落</div>
                    <div class="info-val">{{ realtimeData.sunrise }} / {{ realtimeData.sunset }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 7天预报 -->
        <el-tab-pane label="7天预报" name="seven">
          <div v-if="loading.seven" class="loading-state">
            <el-skeleton :rows="6" animated />
          </div>
          <div v-else-if="error.seven" class="error-state">
            <el-empty description="获取7天预报失败">
              <el-button type="primary" @click="fetchSeven">重试</el-button>
            </el-empty>
          </div>
          <div v-else-if="sevenData && sevenData.length" class="forecast-tab">
            <div class="chart-container glass-card">
              <div ref="sevenChartRef" class="echarts-box"></div>
            </div>
            
            <div class="forecast-grid">
              <div v-for="(item, index) in sevenData" :key="index" class="forecast-card glass-card">
                <div class="date-row">
                  <span class="date">{{ item.date ? item.date.substring(5) : '' }}</span>
                  <span class="week" v-if="item.week">{{ item.week }}</span>
                </div>
                <div class="weather-row">
                  <span>{{ item.wea_day || '多云' }}</span>
                  <span class="small-text" v-if="item.wea_night"> / {{ item.wea_night }} (夜)</span>
                </div>
                <div class="temp-row">
                  <span class="high">{{ item.temp_day }}°</span> / 
                  <span class="low">{{ item.temp_night }}°</span>
                </div>
                <div class="wind-row">
                  <span class="small-text">{{ item.wind_day }} {{ item.wind_day_level }}</span>
                </div>
                <div class="air-row" v-if="item.air">
                  <el-tag size="small" :type="parseInt(item.air) <= 50 ? 'success' : parseInt(item.air) <= 100 ? 'warning' : 'danger'">
                    {{ item.air_level || '良' }} ({{ item.air }})
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 40天预报 -->
        <el-tab-pane label="40天预报" name="forty">
          <div v-if="loading.forty" class="loading-state">
            <el-skeleton :rows="6" animated />
          </div>
          <div v-else-if="error.forty" class="error-state">
            <el-empty description="获取40天预报失败">
              <el-button type="primary" @click="fetchForty">重试</el-button>
            </el-empty>
          </div>
          <div v-else-if="fortyData && fortyData.length" class="forecast-tab">
            <div class="chart-container glass-card">
              <div ref="fortyChartRef" class="echarts-box"></div>
            </div>
            
            <div class="forty-table-container glass-card">
              <div class="forty-header-row">
                <div>日期</div>
                <div>天气</div>
                <div>最高温</div>
                <div>最低温</div>
                <div>风向风力</div>
              </div>
              <div class="forty-list">
                <div v-for="(item, index) in fortyData" :key="index" class="forty-item-row">
                  <div class="date-cell">{{ item.date ? item.date.substring(5) : '' }}</div>
                  <div>{{ item.wea_day }}</div>
                  <div class="high-temp">{{ item.temp_day }}°</div>
                  <div class="low-temp">{{ item.temp_night }}°</div>
                  <div class="wind-cell">{{ item.wind_day }} {{ item.wind_day_level }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 天气指数 -->
        <el-tab-pane label="天气指数" name="index">
          <div v-if="loading.index" class="loading-state">
            <el-skeleton :rows="6" animated />
          </div>
          <div v-else-if="error.index" class="error-state">
            <el-empty description="获取天气指数失败">
              <el-button type="primary" @click="fetchIndex">重试</el-button>
            </el-empty>
          </div>
          <div v-else-if="indexData && indexData.length" class="index-tab">
            <div class="index-grid">
              <div v-for="(item, i) in indexData" :key="i" class="index-card glass-card">
                <div class="index-header">
                  <div class="index-name">
                    <span class="emoji-icon">{{ getIndexIcon(item.name) }}</span>
                    {{ item.name }}
                  </div>
                  <el-tag :type="getIndexTagType(item.level)" effect="dark" size="small">{{ item.level }}</el-tag>
                </div>
                <div class="index-desc">{{ item.content }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import * as echarts from 'echarts'
import { resolveApiUrl } from '../../utils/resolveApiUrl'
import { ElMessage } from 'element-plus'
import ChinaRegionCascader from '../../components/ChinaRegionCascader.vue'
import type { RegionChangeEvent } from '../../components/ChinaRegionCascader.vue'

const router = useRouter()
const selectedRegion = ref<string[]>([])

const ALAPI_TOKEN: string = import.meta.env.VITE_ALAPI_TOKEN || ''
const ALAPI_API_BASE: string = '/api-alapi'

function buildAlapiUrl(path: string): string {
  return resolveApiUrl(`${ALAPI_API_BASE}${path}`)
}

// Interfaces matching exact ALAPI responses
interface TianqiRealtimeData {
  city_id: string; city: string; province: string; country: string;
  update_time: string; weather: string; weather_code: string;
  temp: string; min_temp: string; max_temp: string;
  wind: string; wind_speed: string; humidity: string;
  air: string; air_pm25: string; air_level: string;
  sunrise: string; sunset: string;
}

interface TianqiSevenDayItem {
  date: string; week?: string;
  temp_day: string; temp_night: string;
  wea_day: string; wea_night?: string;
  wind_day?: string; wind_day_level?: string;
  air?: string; air_level?: string;
}

interface TianqiFortyDayItem {
  date: string;
  temp_day: string; temp_night: string;
  wea_day: string; wea_night?: string;
  wind_day?: string; wind_day_level?: string;
}

interface TianqiIndexItem {
  name: string; level: string; content: string;
}

interface AlapiResponse<T> {
  code?: number; success?: boolean; message?: string; data?: T;
}

// State
const searchQuery = ref('杭州')
const currentCity = ref('杭州')
const activeTab = ref('realtime')

const loading = ref({
  realtime: false,
  seven: false,
  forty: false,
  index: false
})

const error = ref({
  realtime: false,
  seven: false,
  forty: false,
  index: false
})

const realtimeData = ref<TianqiRealtimeData | null>(null)
const sevenData = ref<TianqiSevenDayItem[] | null>(null)
const fortyData = ref<TianqiFortyDayItem[] | null>(null)
const indexData = ref<TianqiIndexItem[] | null>(null)

// Refs for ECharts
const sevenChartRef = ref<HTMLDivElement | null>(null)
const fortyChartRef = ref<HTMLDivElement | null>(null)
let sevenChart: echarts.ECharts | null = null
let fortyChart: echarts.ECharts | null = null

// Functions
const goBack = () => {
  router.push('/')
}

const handleRegionChange = (e: RegionChangeEvent) => {
  if (e.cityName) {
    searchQuery.value = e.cityName
    searchWeather()
  }
}

const getIndexIcon = (name: string): string => {
  const icons: Record<string, string> = {
    '穿衣指数': '👕',
    '紫外线指数': '☀️',
    '运动指数': '🏃',
    '洗车指数': '🚗',
    '晾晒指数': '👚',
    '感冒指数': '🤧',
    '钓鱼指数': '🎣',
    '舒适度指数': '😌',
    '过敏指数': '🌸',
    '旅游指数': '🎒',
    '晨练指数': '🏃‍♂️',
    '摆摊指数': '🏪'
  }
  return icons[name] || '📌'
}

const getIndexTagType = (level: string) => {
  if (['极易发', '强', '不宜', '极热'].some(k => level.includes(k))) return 'danger'
  if (['较易发', '较强', '较不宜', '注意'].some(k => level.includes(k))) return 'warning'
  return 'success'
}

// API Calls
const fetchRealtime = async (city: string) => {
  loading.value.realtime = true
  error.value.realtime = false
  try {
    const res = await axios.get<AlapiResponse<TianqiRealtimeData>>(buildAlapiUrl('/api/tianqi'), {
      params: { token: ALAPI_TOKEN, city }
    })
    if (res.data.code === 200 && res.data.data) {
      realtimeData.value = res.data.data
      currentCity.value = res.data.data.city || city
    } else {
      error.value.realtime = true
      ElMessage.error(res.data.message || '获取实况天气失败')
    }
  } catch (e) {
    error.value.realtime = true
    ElMessage.error('获取实况天气失败，请检查网络')
  } finally {
    loading.value.realtime = false
  }
}

const fetchSeven = async () => {
  loading.value.seven = true
  error.value.seven = false
  try {
    const res = await axios.get<AlapiResponse<TianqiSevenDayItem[]>>(buildAlapiUrl('/api/tianqi/seven'), {
      params: { token: ALAPI_TOKEN, city: currentCity.value }
    })
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      sevenData.value = res.data.data
      nextTick(() => {
        setTimeout(() => initSevenChart(), 100)
      })
    } else {
      error.value.seven = true
    }
  } catch (e) {
    error.value.seven = true
  } finally {
    loading.value.seven = false
  }
}

const fetchForty = async () => {
  loading.value.forty = true
  error.value.forty = false
  try {
    const res = await axios.get<AlapiResponse<TianqiFortyDayItem[]>>(buildAlapiUrl('/api/tianqi/forty'), {
      params: { token: ALAPI_TOKEN, city: currentCity.value }
    })
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      fortyData.value = res.data.data
      nextTick(() => {
        setTimeout(() => initFortyChart(), 100)
      })
    } else {
      error.value.forty = true
    }
  } catch (e) {
    error.value.forty = true
  } finally {
    loading.value.forty = false
  }
}

const fetchIndex = async () => {
  const cityId = realtimeData.value?.city_id || '101210101'
  loading.value.index = true
  error.value.index = false
  try {
    const res = await axios.get<AlapiResponse<TianqiIndexItem[]>>(buildAlapiUrl('/api/tianqi/index'), {
      params: { token: ALAPI_TOKEN, city_id: cityId }
    })
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      indexData.value = res.data.data
    } else {
      error.value.index = true
    }
  } catch (e) {
    error.value.index = true
  } finally {
    loading.value.index = false
  }
}

const searchWeather = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入城市名称')
    return
  }
  
  sevenData.value = null
  fortyData.value = null
  indexData.value = null
  
  await fetchRealtime(searchQuery.value)
  handleTabChange(activeTab.value)
}

const handleTabChange = (tabName: string) => {
  if (tabName === 'seven') {
    if (!sevenData.value) fetchSeven()
    else nextTick(() => setTimeout(() => { if (!sevenChart) initSevenChart(); else sevenChart.resize(); }, 100))
  } else if (tabName === 'forty') {
    if (!fortyData.value) fetchForty()
    else nextTick(() => setTimeout(() => { if (!fortyChart) initFortyChart(); else fortyChart.resize(); }, 100))
  } else if (tabName === 'index') {
    if (!indexData.value) fetchIndex()
  }
}

watch(activeTab, (newVal) => {
  handleTabChange(newVal)
})

const handleResize = () => {
  if (sevenChart) sevenChart.resize()
  if (fortyChart) fortyChart.resize()
}

onMounted(() => {
  searchWeather()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (sevenChart) {
    sevenChart.dispose()
    sevenChart = null
  }
  if (fortyChart) {
    fortyChart.dispose()
    fortyChart = null
  }
})

// ECharts
const getTextColor = () => {
  const root = document.documentElement
  return getComputedStyle(root).getPropertyValue('--text-primary').trim() || '#303133'
}

const initSevenChart = () => {
  if (!sevenChartRef.value || !sevenData.value) return
  
  if (!sevenChart) {
    sevenChart = echarts.init(sevenChartRef.value)
  }
  
  const dates = sevenData.value.map(item => `${item.date ? item.date.substring(5) : ''}${item.week ? '\n' + item.week : ''}`)
  const maxTemps = sevenData.value.map(item => parseInt(item.temp_day || '0'))
  const minTemps = sevenData.value.map(item => parseInt(item.temp_night || '0'))
  const textColor = getTextColor()
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['最高温', '最低温'],
      textStyle: { color: textColor },
      top: 0
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true, top: 40 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: textColor }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value} °C', color: textColor }
    },
    series: [
      {
        name: '最高温',
        type: 'bar',
        data: maxTemps,
        itemStyle: { color: '#ff7675', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '最低温',
        type: 'bar',
        data: minTemps,
        itemStyle: { color: '#74b9ff', borderRadius: [4, 4, 0, 0] }
      }
    ]
  }
  
  sevenChart.setOption(option)
}

const initFortyChart = () => {
  if (!fortyChartRef.value || !fortyData.value) return
  
  if (!fortyChart) {
    fortyChart = echarts.init(fortyChartRef.value)
  }
  
  const dates = fortyData.value.map(item => item.date ? item.date.substring(5) : '')
  const maxTemps = fortyData.value.map(item => parseInt(item.temp_day || '0'))
  const minTemps = fortyData.value.map(item => parseInt(item.temp_night || '0'))
  const textColor = getTextColor()
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['最高温', '最低温'],
      textStyle: { color: textColor },
      top: 0
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true, top: 40 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: { color: textColor }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value} °C', color: textColor }
    },
    series: [
      {
        name: '最高温',
        type: 'line',
        smooth: true,
        data: maxTemps,
        itemStyle: { color: '#e17055' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(225, 112, 85, 0.4)' },
            { offset: 1, color: 'rgba(225, 112, 85, 0.05)' }
          ])
        }
      },
      {
        name: '最低温',
        type: 'line',
        smooth: true,
        data: minTemps,
        itemStyle: { color: '#0984e3' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(9, 132, 227, 0.4)' },
            { offset: 1, color: 'rgba(9, 132, 227, 0.05)' }
          ])
        }
      }
    ]
  }
  
  fortyChart.setOption(option)
}
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
