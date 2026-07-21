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
      <el-tabs v-model="activeTab" class="custom-tabs" @tab-change="handleTabChange">
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
            <div class="weather-chart-showcase seven-chart-showcase">
              <section class="weather-chart-panel chart-panel-hero glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">01</div>
                    <h3>七日温度主趋势</h3>
                    <p>基础双折线升级为霓虹渐变趋势图，先看整体温度起伏。</p>
                  </div>
                </div>
                <div :ref="setSevenChartRef('trend')" class="echarts-box chart-hero"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">02</div>
                    <h3>日夜温差柱线图</h3>
                    <p>从简单柱状过渡到组合图，直接看哪天昼夜反差最大。</p>
                  </div>
                </div>
                <div :ref="setSevenChartRef('range')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">03</div>
                    <h3>空气与温度联动</h3>
                    <p>空气质量、白天温度、夜间温度三条维度一起看。</p>
                  </div>
                </div>
                <div :ref="setSevenChartRef('air')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">04</div>
                    <h3>七日天气能力雷达</h3>
                    <p>把最高温、最低温、温差、风力映射成雷达图，更偏分析视角。</p>
                  </div>
                </div>
                <div :ref="setSevenChartRef('radar')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">05</div>
                    <h3>天气状态玫瑰图</h3>
                    <p>最后用更炫的玫瑰图收尾，快速看一周天气分布占比。</p>
                  </div>
                </div>
                <div :ref="setSevenChartRef('rose')" class="echarts-box chart-card"></div>
              </section>
            </div>

            <div class="weather-chart-showcase seven-chart-showcase secondary-chart-showcase">
              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">06</div>
                    <h3>高低温堆叠面积</h3>
                    <p>把一周冷热层叠成更连续的能量带，视觉更饱满。</p>
                  </div>
                </div>
                <div :ref="setSevenChartRef('stack')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">07</div>
                    <h3>极坐标温风图</h3>
                    <p>将每日节奏映射到极坐标，突出方向感和周期感。</p>
                  </div>
                </div>
                <div :ref="setSevenChartRef('polar')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">08</div>
                    <h3>天气占比矩阵树图</h3>
                    <p>把白天和夜间天气拆成树图模块，快速看占比结构。</p>
                  </div>
                </div>
                <div :ref="setSevenChartRef('treemap')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">09</div>
                    <h3>舒适度仪表盘</h3>
                    <p>用炫酷仪表图概括一周舒适度和空气综合指数。</p>
                  </div>
                </div>
                <div :ref="setSevenChartRef('gauge')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">10</div>
                    <h3>天气关系网络</h3>
                    <p>用 graph 把日期和天气类型连起来，形成更实验性的视图。</p>
                  </div>
                </div>
                <div :ref="setSevenChartRef('graph')" class="echarts-box chart-card"></div>
              </section>
            </div>

            <div class="forecast-grid forecast-grid-enhanced">
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
            <div class="weather-chart-showcase forty-chart-showcase">
              <section class="weather-chart-panel chart-panel-hero glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">01</div>
                    <h3>40天长周期总览</h3>
                    <p>从最基础的长周期趋势开始，加入 dataZoom 和渐变面积。</p>
                  </div>
                </div>
                <div :ref="setFortyChartRef('overview')" class="echarts-box chart-hero"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">02</div>
                    <h3>日夜温差与均线</h3>
                    <p>用柱线混合图把温差变化和均线节奏拉开来看。</p>
                  </div>
                </div>
                <div :ref="setFortyChartRef('delta')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">03</div>
                    <h3>温度热力矩阵</h3>
                    <p>把 40 天压成热力网格，一眼看出冷热区段。</p>
                  </div>
                </div>
                <div :ref="setFortyChartRef('heat')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">04</div>
                    <h3>温差气泡分布</h3>
                    <p>散点气泡图展示高温、低温和昼夜温差之间的关系。</p>
                  </div>
                </div>
                <div :ref="setFortyChartRef('scatter')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">05</div>
                    <h3>周节律极坐标</h3>
                    <p>更复杂的极坐标图，把一周节奏感做成更炫的动态视觉。</p>
                  </div>
                </div>
                <div :ref="setFortyChartRef('weekly')" class="echarts-box chart-card"></div>
              </section>
            </div>

            <div class="weather-chart-showcase forty-chart-showcase secondary-chart-showcase">
              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">06</div>
                    <h3>日历热力图</h3>
                    <p>按真实日期落到日历视图，直接看哪几天最热。</p>
                  </div>
                </div>
                <div :ref="setFortyChartRef('calendar')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">07</div>
                    <h3>温度河流图</h3>
                    <p>把高温、低温、均温做成 flowing river，层次更动感。</p>
                  </div>
                </div>
                <div :ref="setFortyChartRef('river')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">08</div>
                    <h3>周箱线分布</h3>
                    <p>用箱线图看每周温度分布与波动区间，更偏分析。</p>
                  </div>
                </div>
                <div :ref="setFortyChartRef('box')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">09</div>
                    <h3>天气层级旭日图</h3>
                    <p>把 40 天按天气类型和周次分层，做成更复杂的结构图。</p>
                  </div>
                </div>
                <div :ref="setFortyChartRef('sunburst')" class="echarts-box chart-card"></div>
              </section>

              <section class="weather-chart-panel glass-card">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-panel-index">10</div>
                    <h3>多维平行坐标</h3>
                    <p>把最高温、最低温、温差、均温一起展开成多维对比。</p>
                  </div>
                </div>
                <div :ref="setFortyChartRef('parallel')" class="echarts-box chart-card"></div>
              </section>
            </div>

            <div class="forty-table-container glass-card forty-table-enhanced">
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
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import * as echarts from 'echarts'
import { resolveApiUrl } from '../../utils/resolveApiUrl'
import { ElMessage } from 'element-plus'
import ChinaRegionCascader from '../../components/ChinaRegionCascader.vue'
import type { RegionChangeEvent } from '../../components/ChinaRegionCascader.vue'
import rawChinaCascaderOptions from '../../ajson/china-cascader-options.json'

const router = useRouter()
const selectedRegion = ref<string[]>([])

const ALAPI_TOKEN: string = import.meta.env.VITE_ALAPI_TOKEN || 'qgqofofvmxtoskffd37omkscobipmn'
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

interface RegionOption {
  value: string
  label: string
  children?: RegionOption[]
}

const chinaCascaderOptions = rawChinaCascaderOptions as RegionOption[]

function simplifyRegionLabel(label: string): string {
  return label
    .replace(/特别行政区$/u, '')
    .replace(/壮族自治区$|回族自治区$|维吾尔自治区$/u, '')
    .replace(/自治区$/u, '')
    .replace(/自治州$/u, '')
    .replace(/自治县$/u, '')
    .replace(/自治旗$/u, '')
    .replace(/地区$/u, '')
    .replace(/林区$/u, '')
    .replace(/新区$/u, '')
    .replace(/市辖区$/u, '')
    .replace(/省$/u, '')
    .replace(/市$/u, '')
    .replace(/区$/u, '')
    .replace(/县$/u, '')
    .replace(/盟$/u, '')
    .replace(/旗$/u, '')
    .trim()
}

function findRegionPathByCity(cityName: string, provinceName = ''): string[] {
  const normalizedCity = simplifyRegionLabel(cityName)
  const normalizedProvince = simplifyRegionLabel(provinceName)

  for (const province of chinaCascaderOptions) {
    const provinceLabel = simplifyRegionLabel(province.label)
    if (normalizedProvince && provinceLabel !== normalizedProvince) continue

    if (provinceLabel === normalizedCity) {
      return [province.value]
    }

    for (const city of province.children || []) {
      const cityLabel = simplifyRegionLabel(city.label)
      if (cityLabel === normalizedCity) {
        return [province.value, city.value]
      }

      for (const district of city.children || []) {
        const districtLabel = simplifyRegionLabel(district.label)
        if (districtLabel === normalizedCity) {
          return [province.value, city.value, district.value]
        }
      }
    }
  }

  if (normalizedProvince) {
    return findRegionPathByCity(cityName)
  }

  return []
}

function syncSelectedRegion(cityName: string, provinceName = ''): void {
  const matchedPath = findRegionPathByCity(cityName, provinceName)
  if (matchedPath.length) {
    selectedRegion.value = matchedPath
  }
}

function findRegionLabelsByPath(path: string[]): string[] {
  const labels: string[] = []
  let nodes = chinaCascaderOptions

  for (const value of path) {
    const matched = nodes.find(node => node.value === value)
    if (!matched) break
    labels.push(simplifyRegionLabel(matched.label))
    nodes = matched.children || []
  }

  return labels
}

function getActiveWeatherCity(): string {
  const selectedLabels = findRegionLabelsByPath(selectedRegion.value)
  if (selectedLabels.length) {
    return selectedLabels[selectedLabels.length - 1]
  }

  return searchQuery.value.trim()
    || currentCity.value.trim()
    || realtimeData.value?.city
    || '杭州'
}

function getActiveWeatherLocation(): { city: string; province: string } {
  const selectedLabels = findRegionLabelsByPath(selectedRegion.value)
  if (selectedLabels.length >= 2) {
    return {
      province: selectedLabels[0],
      city: selectedLabels[1]
    }
  }

  if (selectedLabels.length === 1) {
    return {
      province: selectedLabels[0],
      city: selectedLabels[0]
    }
  }

  return {
    city: getActiveWeatherCity(),
    province: simplifyRegionLabel(realtimeData.value?.province || '')
  }
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

type SevenChartKey = 'trend' | 'range' | 'air' | 'radar' | 'rose'
type FortyChartKey = 'overview' | 'delta' | 'heat' | 'scatter' | 'weekly'

const sevenChartRefs = reactive<Record<SevenChartKey, HTMLDivElement | null>>({
  trend: null,
  range: null,
  air: null,
  radar: null,
  rose: null
})

const fortyChartRefs = reactive<Record<FortyChartKey, HTMLDivElement | null>>({
  overview: null,
  delta: null,
  heat: null,
  scatter: null,
  weekly: null
})

const sevenCharts: Partial<Record<SevenChartKey, echarts.ECharts>> = {}
const fortyCharts: Partial<Record<FortyChartKey, echarts.ECharts>> = {}

const setSevenChartRef = (key: SevenChartKey) => (el: any) => {
  sevenChartRefs[key] = el as HTMLDivElement | null
}

const setFortyChartRef = (key: FortyChartKey) => (el: any) => {
  fortyChartRefs[key] = el as HTMLDivElement | null
}

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

const numberValue = (value?: string | number): number => {
  const matched = String(value ?? '').match(/-?\d+(\.\d+)?/)
  return matched ? Number(matched[0]) : 0
}

const shortDate = (value?: string): string => value ? value.slice(5) : ''

const weekdayName = (value?: string): string => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
}

const movingAverage = (values: number[], windowSize = 5): number[] => {
  return values.map((_, index) => {
    const start = Math.max(0, index - windowSize + 1)
    const subset = values.slice(start, index + 1)
    return Number((subset.reduce((sum, item) => sum + item, 0) / subset.length).toFixed(1))
  })
}

const weatherCounts = (values: Array<string | undefined>) => {
  return values.reduce<Record<string, number>>((acc, item) => {
    const key = item || '未知'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
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

function ensureChart<K extends string>(
  refsMap: Record<K, HTMLDivElement | null>,
  store: Partial<Record<K, echarts.ECharts>>,
  key: K
): echarts.ECharts | null {
  const el = refsMap[key]
  if (!el) return null
  if (!store[key]) {
    store[key] = echarts.init(el)
  }
  return store[key] || null
}

function resizeChartStore<K extends string>(store: Partial<Record<K, echarts.ECharts>>): void {
  Object.values(store).forEach((instance) => instance?.resize())
}

function disposeChartStore<K extends string>(store: Partial<Record<K, echarts.ECharts>>): void {
  Object.keys(store).forEach((key) => {
    store[key as K]?.dispose()
    delete store[key as K]
  })
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
      syncSelectedRegion(currentCity.value, res.data.data.province || '')
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
  const { city, province } = getActiveWeatherLocation()
  loading.value.seven = true
  error.value.seven = false
  try {
    const res = await axios.get<AlapiResponse<TianqiSevenDayItem[]>>(buildAlapiUrl('/api/tianqi/seven'), {
      params: { token: ALAPI_TOKEN, city, province }
    })
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      sevenData.value = res.data.data
      nextTick(() => {
        setTimeout(() => initSevenCharts(), 120)
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
  const { city, province } = getActiveWeatherLocation()
  loading.value.forty = true
  error.value.forty = false
  try {
    const res = await axios.get<AlapiResponse<TianqiFortyDayItem[]>>(buildAlapiUrl('/api/tianqi/forty'), {
      params: { token: ALAPI_TOKEN, city, province }
    })
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      fortyData.value = res.data.data
      nextTick(() => {
        setTimeout(() => initFortyCharts(), 120)
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
  const targetCity = getActiveWeatherCity()
  if (!targetCity) {
    ElMessage.warning('请输入城市名称')
    return
  }

  searchQuery.value = targetCity
  currentCity.value = targetCity
  sevenData.value = null
  fortyData.value = null
  indexData.value = null

  await fetchRealtime(targetCity)
  handleTabChange(activeTab.value)
}

const handleTabChange = (tabName: string) => {
  if (tabName === 'seven') {
    if (!sevenData.value || error.value.seven) fetchSeven()
    else nextTick(() => setTimeout(() => initSevenCharts(), 120))
  } else if (tabName === 'forty') {
    if (!fortyData.value || error.value.forty) fetchForty()
    else nextTick(() => setTimeout(() => initFortyCharts(), 120))
  } else if (tabName === 'index') {
    if (!indexData.value || error.value.index) fetchIndex()
  }
}

const handleResize = () => {
  resizeChartStore(sevenCharts)
  resizeChartStore(fortyCharts)
}

onMounted(() => {
  syncSelectedRegion(searchQuery.value)
  searchWeather()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  disposeChartStore(sevenCharts)
  disposeChartStore(fortyCharts)
})

// ECharts
const getTextColor = () => {
  const root = document.documentElement
  return getComputedStyle(root).getPropertyValue('--text-color').trim() || '#e3e5e8'
}

const getSecondaryTextColor = () => {
  const root = document.documentElement
  return getComputedStyle(root).getPropertyValue('--text-secondary').trim() || '#9aa0a6'
}

const baseGrid = { left: 46, right: 28, top: 64, bottom: 44 }

const initSevenCharts = () => {
  if (!sevenData.value?.length) return

  const dates = sevenData.value.map(item => shortDate(item.date))
  const labels = sevenData.value.map(item => `${shortDate(item.date)}\n${item.week || weekdayName(item.date)}`)
  const maxTemps = sevenData.value.map(item => numberValue(item.temp_day))
  const minTemps = sevenData.value.map(item => numberValue(item.temp_night))
  const airValues = sevenData.value.map(item => numberValue(item.air))
  const windValues = sevenData.value.map(item => numberValue(item.wind_day_level))
  const rangeValues = maxTemps.map((value, index) => Number((value - minTemps[index]).toFixed(1)))
  const textColor = getTextColor()
  const secondaryColor = getSecondaryTextColor()

  const trendChart = ensureChart(sevenChartRefs, sevenCharts, 'trend')
  trendChart?.setOption({
    backgroundColor: 'transparent',
    color: ['#ff7b7b', '#70b8ff'],
    tooltip: { trigger: 'axis' },
    legend: { top: 12, textStyle: { color: secondaryColor } },
    grid: baseGrid,
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.14)' } },
      axisLabel: { color: secondaryColor }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: secondaryColor, formatter: '{value}°' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    graphic: [
      {
        type: 'text',
        right: 30,
        top: 18,
        style: {
          text: 'Simple → Glow',
          fill: 'rgba(255,255,255,0.35)',
          font: '600 12px sans-serif'
        }
      }
    ],
    series: [
      {
        name: '最高温',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 9,
        data: maxTemps,
        lineStyle: { width: 4, shadowBlur: 18, shadowColor: 'rgba(255,123,123,0.45)' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,123,123,0.45)' },
            { offset: 1, color: 'rgba(255,123,123,0.02)' }
          ])
        }
      },
      {
        name: '最低温',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: minTemps,
        lineStyle: { width: 3, shadowBlur: 14, shadowColor: 'rgba(112,184,255,0.35)' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(112,184,255,0.32)' },
            { offset: 1, color: 'rgba(112,184,255,0.02)' }
          ])
        }
      }
    ]
  })

  const rangeChart = ensureChart(sevenChartRefs, sevenCharts, 'range')
  rangeChart?.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: baseGrid,
    legend: { top: 12, textStyle: { color: secondaryColor } },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: secondaryColor },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } }
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: { color: secondaryColor, formatter: '{value}°' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
      },
      {
        type: 'value',
        axisLabel: { color: secondaryColor, formatter: '{value}°' }
      }
    ],
    series: [
      {
        name: '温差',
        type: 'bar',
        data: rangeValues,
        barWidth: 18,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8b5cf6' },
            { offset: 1, color: '#4f46e5' }
          ])
        }
      },
      {
        name: '平均温度',
        type: 'line',
        yAxisIndex: 1,
        data: maxTemps.map((value, index) => Number(((value + minTemps[index]) / 2).toFixed(1))),
        smooth: true,
        symbol: 'diamond',
        symbolSize: 7,
        lineStyle: { width: 3, color: '#ffd166' }
      }
    ]
  })

  const airChart = ensureChart(sevenChartRefs, sevenCharts, 'air')
  airChart?.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 12, textStyle: { color: secondaryColor } },
    grid: baseGrid,
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: secondaryColor },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } }
    },
    yAxis: [
      {
        type: 'value',
        name: 'AQI',
        nameTextStyle: { color: secondaryColor },
        axisLabel: { color: secondaryColor },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
      },
      {
        type: 'value',
        name: '气温',
        nameTextStyle: { color: secondaryColor },
        axisLabel: { color: secondaryColor, formatter: '{value}°' }
      }
    ],
    series: [
      {
        name: '空气指数',
        type: 'bar',
        data: airValues,
        barWidth: 14,
        itemStyle: { color: '#4ade80', borderRadius: [8, 8, 0, 0] }
      },
      {
        name: '白天气温',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: maxTemps,
        lineStyle: { width: 3, color: '#fb7185' }
      },
      {
        name: '夜间气温',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: minTemps,
        lineStyle: { width: 2, type: 'dashed', color: '#60a5fa' }
      }
    ]
  })

  const radarChart = ensureChart(sevenChartRefs, sevenCharts, 'radar')
  radarChart?.setOption({
    tooltip: {},
    legend: { top: 12, textStyle: { color: secondaryColor } },
    radar: {
      radius: '62%',
      indicator: sevenData.value.map((item) => ({
        name: item.week || shortDate(item.date),
        max: Math.max(...maxTemps) + 10
      })),
      axisName: { color: textColor },
      splitArea: { areaStyle: { color: ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)'] } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: maxTemps,
            name: '最高温',
            areaStyle: { color: 'rgba(251,113,133,0.25)' },
            lineStyle: { color: '#fb7185' }
          },
          {
            value: rangeValues.map((value, index) => Number((value + windValues[index]).toFixed(1))),
            name: '温差+风力',
            areaStyle: { color: 'rgba(59,130,246,0.2)' },
            lineStyle: { color: '#60a5fa' }
          }
        ]
      }
    ]
  })

  const roseData = Object.entries(weatherCounts(sevenData.value.flatMap(item => [item.wea_day, item.wea_night]))).map(([name, value]) => ({
    name,
    value
  }))
  const roseChart = ensureChart(sevenChartRefs, sevenCharts, 'rose')
  roseChart?.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 6, textStyle: { color: secondaryColor } },
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '42%',
        style: {
          text: 'Weather\nRose',
          textAlign: 'center',
          fill: textColor,
          font: '700 18px sans-serif'
        }
      }
    ],
    series: [
      {
        type: 'pie',
        radius: ['26%', '72%'],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: { borderRadius: 10, borderColor: 'rgba(15,16,17,0.35)', borderWidth: 2 },
        label: { color: textColor },
        data: roseData
      }
    ]
  })
}

const initFortyCharts = () => {
  if (!fortyData.value?.length) return

  const dates = fortyData.value.map(item => shortDate(item.date))
  const maxTemps = fortyData.value.map(item => numberValue(item.temp_day))
  const minTemps = fortyData.value.map(item => numberValue(item.temp_night))
  const deltaTemps = maxTemps.map((value, index) => Number((value - minTemps[index]).toFixed(1)))
  const avgTemps = movingAverage(maxTemps.map((value, index) => Number(((value + minTemps[index]) / 2).toFixed(1))), 5)
  const textColor = getTextColor()
  const secondaryColor = getSecondaryTextColor()

  const overviewChart = ensureChart(fortyChartRefs, fortyCharts, 'overview')
  overviewChart?.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 12, textStyle: { color: secondaryColor } },
    grid: baseGrid,
    dataZoom: [
      { type: 'inside', start: 0, end: 55 },
      { type: 'slider', bottom: 10, height: 18, start: 0, end: 55 }
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: { color: secondaryColor, interval: 4 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: secondaryColor, formatter: '{value}°' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    graphic: [
      {
        type: 'group',
        right: 30,
        top: 18,
        children: [
          {
            type: 'rect',
            shape: { width: 92, height: 30, r: 15 },
            style: { fill: 'rgba(255,255,255,0.06)' }
          },
          {
            type: 'text',
            left: 18,
            top: 8,
            style: { text: 'Long Run', fill: textColor, font: '600 12px sans-serif' }
          }
        ]
      }
    ],
    series: [
      {
        name: '最高温',
        type: 'line',
        smooth: true,
        data: maxTemps,
        symbol: 'none',
        lineStyle: { width: 3, color: '#ff7b7b' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,123,123,0.4)' },
            { offset: 1, color: 'rgba(255,123,123,0.02)' }
          ])
        }
      },
      {
        name: '最低温',
        type: 'line',
        smooth: true,
        data: minTemps,
        symbol: 'none',
        lineStyle: { width: 3, color: '#60a5fa' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(96,165,250,0.32)' },
            { offset: 1, color: 'rgba(96,165,250,0.02)' }
          ])
        }
      }
    ]
  })

  const deltaChart = ensureChart(fortyChartRefs, fortyCharts, 'delta')
  deltaChart?.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 12, textStyle: { color: secondaryColor } },
    grid: baseGrid,
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: secondaryColor, interval: 5 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } }
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: { color: secondaryColor, formatter: '{value}°' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
      },
      {
        type: 'value',
        axisLabel: { color: secondaryColor, formatter: '{value}°' }
      }
    ],
    series: [
      {
        name: '昼夜温差',
        type: 'bar',
        data: deltaTemps,
        barWidth: 10,
        itemStyle: { color: '#a78bfa', borderRadius: [8, 8, 0, 0] }
      },
      {
        name: '五日均温',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: avgTemps,
        lineStyle: { width: 3, color: '#facc15' },
        symbol: 'circle',
        symbolSize: 5
      }
    ]
  })

  const heatData = fortyData.value.map((item, index) => {
    const weekIndex = Math.floor(index / 8)
    const dayIndex = index % 8
    return [weekIndex, dayIndex, maxTemps[index]]
  })
  const heatChart = ensureChart(fortyChartRefs, fortyCharts, 'heat')
  heatChart?.setOption({
    tooltip: {
      formatter: (params: any) => {
        const rawIndex = params.value[0] * 8 + params.value[1]
        const item = fortyData.value?.[rawIndex]
        return `${item?.date || '--'}<br/>最高温：${params.value[2]}°`
      }
    },
    grid: { left: 40, right: 20, top: 48, bottom: 30, containLabel: true },
    xAxis: {
      type: 'category',
      data: Array.from({ length: Math.ceil(fortyData.value.length / 8) }, (_, index) => `第${index + 1}列`),
      axisLabel: { color: secondaryColor },
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: Array.from({ length: 8 }, (_, index) => `序列 ${index + 1}`),
      axisLabel: { color: secondaryColor },
      splitArea: { show: true }
    },
    visualMap: {
      min: Math.min(...maxTemps),
      max: Math.max(...maxTemps),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      textStyle: { color: secondaryColor },
      inRange: { color: ['#0f172a', '#2563eb', '#7c3aed', '#fb7185', '#f97316'] }
    },
    series: [
      {
        type: 'heatmap',
        data: heatData,
        label: {
          show: true,
          color: '#fff',
          formatter: ({ value }: any) => `${value[2]}°`
        },
        emphasis: { itemStyle: { shadowBlur: 15, shadowColor: 'rgba(0,0,0,0.35)' } }
      }
    ]
  })

  const scatterChart = ensureChart(fortyChartRefs, fortyCharts, 'scatter')
  scatterChart?.setOption({
    tooltip: {
      formatter: (params: any) => {
        const item = fortyData.value?.[params.dataIndex]
        return `${item?.date || '--'}<br/>最高温：${params.value[0]}°<br/>最低温：${params.value[1]}°<br/>温差：${params.value[2]}°`
      }
    },
    grid: baseGrid,
    xAxis: {
      name: '最高温',
      nameTextStyle: { color: secondaryColor },
      axisLabel: { color: secondaryColor, formatter: '{value}°' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    yAxis: {
      name: '最低温',
      nameTextStyle: { color: secondaryColor },
      axisLabel: { color: secondaryColor, formatter: '{value}°' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    series: [
      {
        type: 'scatter',
        data: maxTemps.map((value, index) => [value, minTemps[index], deltaTemps[index]]),
        symbolSize: (value: number[]) => Math.max(12, value[2] * 3),
        itemStyle: {
          color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
            { offset: 0, color: '#f9a8d4' },
            { offset: 1, color: '#7c3aed' }
          ]),
          shadowBlur: 12,
          shadowColor: 'rgba(124,58,237,0.45)'
        }
      }
    ]
  })

  const weekdayBuckets = Array.from({ length: 7 }, () => ({ high: [] as number[], low: [] as number[] }))
  fortyData.value.forEach((item, index) => {
    const dayIndex = new Date(item.date).getDay()
    const bucket = weekdayBuckets[Number.isNaN(dayIndex) ? index % 7 : dayIndex]
    bucket.high.push(maxTemps[index])
    bucket.low.push(minTemps[index])
  })
  const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const avgHighByWeek = weekdayBuckets.map(item => Number((item.high.reduce((sum, value) => sum + value, 0) / Math.max(item.high.length, 1)).toFixed(1)))
  const avgLowByWeek = weekdayBuckets.map(item => Number((item.low.reduce((sum, value) => sum + value, 0) / Math.max(item.low.length, 1)).toFixed(1)))
  const weeklyChart = ensureChart(fortyChartRefs, fortyCharts, 'weekly')
  weeklyChart?.setOption({
    angleAxis: {
      type: 'category',
      data: weekLabels,
      axisLabel: { color: textColor }
    },
    radiusAxis: {
      axisLabel: { color: secondaryColor, formatter: '{value}°' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    polar: {},
    legend: { top: 12, textStyle: { color: secondaryColor } },
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '46%',
        style: {
          text: '40D',
          fill: textColor,
          font: '700 22px sans-serif'
        }
      }
    ],
    series: [
      {
        name: '均高温',
        type: 'bar',
        coordinateSystem: 'polar',
        roundCap: true,
        data: avgHighByWeek,
        itemStyle: { color: '#fb7185' }
      },
      {
        name: '均低温',
        type: 'bar',
        coordinateSystem: 'polar',
        roundCap: true,
        data: avgLowByWeek,
        itemStyle: { color: '#60a5fa' }
      }
    ]
  })
}
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
