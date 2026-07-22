<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { EChartsOption } from 'echarts'
import 'echarts-gl'
import { ElMessage } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'
import BigScreenHeader from './components/BigScreenHeader.vue'
import ChartPanel from './components/ChartPanel.vue'
import ChinaCityMapPanel from './components/ChinaCityMapPanel.vue'
import DetailDrawer from './components/DetailDrawer.vue'
import MetricCard from './components/MetricCard.vue'
import StatusPanel from './components/StatusPanel.vue'
import { useBigScreenAutofit } from './composables/useBigScreenAutofit'
import { useScreenClock } from './composables/useScreenClock'
import { createBigScreenMockData } from './mock/dashboard'
import type {
  BigScreenCityItem,
  BigScreenDetailPayload,
  BigScreenMetric,
  BigScreenOverview,
  BigScreenRegionItem
} from './types'

type ChartDrillPayload = {
  detailId: string
  name?: string
}

const router = useRouter()
const dashboard = ref<BigScreenOverview>(createBigScreenMockData())
const activeDetail = ref<BigScreenDetailPayload | null>(null)
const drawerVisible = ref<boolean>(false)
const viewportWidth = ref<number>(typeof window !== 'undefined' ? window.innerWidth : 1920)
const viewportHeight = ref<number>(typeof window !== 'undefined' ? window.innerHeight : 1080)

const { dateText, timeText } = useScreenClock()
const isCompactScreen = computed<boolean>(() => viewportWidth.value < 1280 || viewportHeight.value < 760)
useBigScreenAutofit(computed<boolean>(() => !isCompactScreen.value))

const syncViewport = (): void => {
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
}

onMounted((): void => {
  syncViewport()
  window.addEventListener('resize', syncViewport)
})

onUnmounted((): void => {
  window.removeEventListener('resize', syncViewport)
})

const openDetailPayload = (detail: BigScreenDetailPayload): void => {
  activeDetail.value = detail
  drawerVisible.value = true
}

const openDetail = (detailId: string): void => {
  const detail: BigScreenDetailPayload | undefined = dashboard.value.detailMap[detailId]
  if (!detail) return
  openDetailPayload(detail)
}

const handleMetricOpen = (metric: BigScreenMetric): void => {
  const fallbackMap: Record<string, string> = {
    'metric-warning': 'panel-alert',
    'metric-ticket': 'panel-task'
  }
  openDetail(dashboard.value.detailMap[metric.id] ? metric.id : fallbackMap[metric.id])
}

const refreshMock = (): void => {
  dashboard.value = createBigScreenMockData()
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  ElMessage({
    message: `✅ Mock 数据刷新成功！更新时间：${timeStr}`,
    type: 'success',
    duration: 3000,
    grouping: true
  })
}

const buildProvinceDetail = (province: string): BigScreenDetailPayload | null => {
  const target = dashboard.value.regionRanking.find((item: BigScreenRegionItem) => item.province === province)
  if (!target) return null
  return {
    id: `drill-region-${province}`,
    title: `${province}区域下钻`,
    summary: `${province}的活跃指数、告警密度与交易规模明细，可用于区域调度和策略分配。`,
    metrics: [
      { id: `${province}-activity`, title: '活跃指数', value: target.activity, unit: '', trend: 6.8, status: 'up', summary: '较上一周期继续走强。' },
      { id: `${province}-warning`, title: '告警数量', value: target.warningCount, unit: '条', trend: -3.2, status: 'down', summary: '告警压降策略开始起效。' },
      { id: `${province}-orders`, title: '订单体量', value: target.orderVolume, unit: '单', trend: 8.7, status: 'up', summary: '核心流量承接稳定。' }
    ],
    timeline: dashboard.value.hourlyTrend.map((point, index) => ({
      label: point.label,
      value: Math.round(point.value * (target.activity / 100) + index * 2)
    })),
    records: dashboard.value.cityFocus
      .filter((item: BigScreenCityItem) => item.province === province)
      .map((item: BigScreenCityItem) => ({
        城市: item.city,
        活跃指数: item.activity,
        告警数: item.warningCount,
        订单量: item.orderVolume
      }))
  }
}

const buildCityDetail = (city: string): BigScreenDetailPayload | null => {
  const target = dashboard.value.cityFocus.find((item: BigScreenCityItem) => item.city === city)
  if (!target) return null
  return {
    id: `drill-city-${city}`,
    title: `${city}城市下钻`,
    summary: `${city}承担区域流量承接与风险处置任务，可查看城市级业务负载。`,
    metrics: [
      { id: `${city}-activity`, title: '活跃指数', value: target.activity, unit: '', trend: 7.4, status: 'up', summary: '城市活跃流量保持高位。' },
      { id: `${city}-warning`, title: '风险告警', value: target.warningCount, unit: '条', trend: -1.6, status: 'down', summary: '风险峰值逐步回落。' },
      { id: `${city}-orders`, title: '订单量', value: target.orderVolume, unit: '单', trend: 9.1, status: 'up', summary: '订单侧调度效率提升。' }
    ],
    timeline: dashboard.value.hourlyTrend.map((point, index) => ({
      label: point.label,
      value: Math.round(point.value * 0.65 + target.activity + index)
    })),
    records: [
      { 城市: target.city, 省份: target.province, 经度: target.coord[0], 纬度: target.coord[1] },
      { 城市: `${target.city}主城区`, 省份: target.province, 活跃指数: target.activity - 4, 订单量: target.orderVolume - 180 },
      { 城市: `${target.city}近郊`, 省份: target.province, 活跃指数: target.activity - 9, 订单量: target.orderVolume - 460 }
    ]
  }
}

const buildChannelDetail = (channel: string): BigScreenDetailPayload | null => {
  const target = dashboard.value.channelShare.find(item => item.name === channel)
  if (!target) return null
  return {
    id: `drill-channel-${channel}`,
    title: `${channel}渠道下钻`,
    summary: `${channel}渠道的贡献占比、周趋势与实时流水明细。`,
    metrics: [
      { id: `${channel}-share`, title: '渠道占比', value: target.value, unit: '%', trend: 4.2, status: 'up', summary: '核心贡献持续扩大。' },
      { id: `${channel}-gmv`, title: '渠道GMV', value: Number((target.value * 1.46).toFixed(1)), unit: 'M', trend: 6.8, status: 'up', summary: '成交峰值靠近午后。' },
      { id: `${channel}-conv`, title: '转化率', value: Number((22 + target.value / 3).toFixed(1)), unit: '%', trend: 2.3, status: 'up', summary: '投放效率稳步提升。' }
    ],
    timeline: dashboard.value.weeklyOrders.map((point, index) => ({
      label: point.label,
      value: Math.round(point.value * (target.value / 40) + index * 3)
    })),
    records: dashboard.value.streams
      .filter(stream => stream.channel === channel)
      .map(stream => ({
        渠道: stream.channel,
        区域: stream.region,
        金额: stream.amount,
        状态: stream.status,
        时间: stream.timestamp
      }))
  }
}

const buildTimeDetail = (label: string): BigScreenDetailPayload | null => {
  const point = dashboard.value.hourlyTrend.find(item => item.label === label)
  if (!point) return null
  const risk = dashboard.value.riskWave.find(item => item.label === label)?.value ?? 0
  return {
    id: `drill-time-${label}`,
    title: `${label}时段下钻`,
    summary: `查看 ${label} 时段的交易指数、风险波动和区域负载分布。`,
    metrics: [
      { id: `${label}-trade`, title: '交易指数', value: point.value, unit: '', trend: 5.1, status: 'up', summary: '时段交易活跃。' },
      { id: `${label}-risk`, title: '风险热度', value: risk, unit: '', trend: -2.4, status: 'down', summary: '风险保持可控。' },
      { id: `${label}-capacity`, title: '处理容量', value: Math.round(point.value * 120), unit: 'req', trend: 3.2, status: 'up', summary: '服务容量充足。' }
    ],
    timeline: dashboard.value.regionRanking.slice(0, 6).map((item, index) => ({
      label: item.province,
      value: Math.round(point.value * (1 - index * 0.08))
    })),
    records: dashboard.value.regionRanking.map(item => ({
      区域: item.province,
      时段: label,
      交易指数: Math.round(point.value * (item.activity / 100)),
      风险热度: Math.round(risk * (item.warningCount / 20))
    }))
  }
}

const buildWeeklyDetail = (label: string): BigScreenDetailPayload | null => {
  const point = dashboard.value.weeklyOrders.find(item => item.label === label)
  if (!point) return null
  return {
    id: `drill-week-${label}`,
    title: `${label}周维度下钻`,
    summary: `查看 ${label} 的订单趋势与风险处置协同情况。`,
    metrics: [
      { id: `${label}-week-orders`, title: '订单指数', value: point.value, unit: '', trend: 4.9, status: 'up', summary: '订单表现稳中有升。' },
      { id: `${label}-week-risk`, title: '处置指数', value: Math.round(point.value * 0.58), unit: '', trend: 3.1, status: 'up', summary: '风险处置跟进及时。' },
      { id: `${label}-week-quality`, title: '履约质量', value: 91 + Math.round(point.value % 6), unit: '%', trend: 1.8, status: 'up', summary: '交付稳定性较好。' }
    ],
    timeline: dashboard.value.hourlyTrend.map((item, index) => ({
      label: item.label,
      value: Math.round(item.value * 0.72 + index * 2)
    })),
    records: dashboard.value.streams.map(stream => ({
      周期: label,
      渠道: stream.channel,
      区域: stream.region,
      金额: Math.round(stream.amount * 0.4),
      状态: stream.status
    }))
  }
}

const buildMatrixDetail = (name: string): BigScreenDetailPayload | null => {
  const [province, label] = name.split('|')
  if (!province || !label) return null
  const region = dashboard.value.regionRanking.find(item => item.province === province)
  const trend = dashboard.value.hourlyTrend.find(item => item.label === label)
  if (!region || !trend) return null
  const baseValue = Math.round((region.activity + region.orderVolume / 100) * (trend.value / 80))
  return {
    id: `drill-matrix-${province}-${label}`,
    title: `${province} · ${label} 负载矩阵下钻`,
    summary: '3D 负载矩阵支持从省份与时段两个维度继续向下查看业务负载与承压。 ',
    metrics: [
      { id: `${province}-${label}-load`, title: '综合负载', value: baseValue, unit: '', trend: 8.5, status: 'up', summary: '该时段负载处于高位。' },
      { id: `${province}-${label}-orders`, title: '订单映射', value: Math.round(region.orderVolume * 0.18), unit: '单', trend: 6.1, status: 'up', summary: '订单流量集中进入。' },
      { id: `${province}-${label}-risk`, title: '承压指数', value: region.warningCount + 6, unit: '', trend: -1.4, status: 'down', summary: '风险峰值已被摊平。' }
    ],
    timeline: dashboard.value.hourlyTrend.map((point, index) => ({
      label: point.label,
      value: Math.round(baseValue * 0.42 + point.value + index)
    })),
    records: dashboard.value.cityFocus
      .filter(item => item.province === province)
      .map(item => ({
        城市: item.city,
        时段: label,
        负载指数: Math.round(baseValue * (item.activity / 100)),
        订单量: Math.round(item.orderVolume * 0.42),
        风险热度: item.warningCount
      }))
  }
}

const buildRadarDetail = (name: string): BigScreenDetailPayload | null => {
  const scoreMap: Record<string, number> = {
    交易协同: 88,
    风险感知: 76,
    设备韧性: 84,
    工单效率: 91,
    区域响应: 79,
    数据完整: 86
  }
  const score = scoreMap[name]
  if (!score) return null
  return {
    id: `drill-radar-${name}`,
    title: `${name}能力下钻`,
    summary: `${name}是当前驾驶舱的核心能力维度之一，可继续查看周级波动与能力拆解。`,
    metrics: [
      { id: `${name}-score`, title: '能力得分', value: score, unit: '', trend: 4.3, status: 'up', summary: '本周能力稳步提升。' },
      { id: `${name}-gap`, title: '提升空间', value: 100 - score, unit: '', trend: -3.1, status: 'down', summary: '短板持续收敛。' },
      { id: `${name}-actions`, title: '关联动作', value: Math.round(score / 3), unit: '项', trend: 2.8, status: 'up', summary: '优化动作正在推进。' }
    ],
    timeline: dashboard.value.weeklyOrders.map((point, index) => ({
      label: point.label,
      value: Math.round(score - 8 + Math.sin(index) * 6)
    })),
    records: dashboard.value.tasks.map(task => ({
      维度: name,
      任务: task.title,
      负责人: task.owner,
      进度: `${task.progress}%`
    }))
  }
}

const handleChartDrill = (payload: ChartDrillPayload): void => {
  const key = payload.name?.trim()
  let detail: BigScreenDetailPayload | null = null

  if (payload.detailId === 'panel-region' && key) detail = buildProvinceDetail(key)
  if (payload.detailId === 'panel-city' && key) detail = buildCityDetail(key)
  if (payload.detailId === 'panel-channel' && key) detail = buildChannelDetail(key)
  if ((payload.detailId === 'panel-trend' || payload.detailId === 'panel-alert') && key) detail = buildTimeDetail(key)
  if (payload.detailId === 'panel-3d' && key) detail = buildMatrixDetail(key)
  if (payload.detailId === 'panel-radar' && key) detail = buildRadarDetail(key)
  if (payload.detailId === 'panel-weekly' && key) detail = buildWeeklyDetail(key)

  if (detail) {
    openDetailPayload(detail)
    return
  }
  openDetail(payload.detailId)
}

const lineOption = computed<EChartsOption>(() => ({
  grid: { left: 26, right: 16, top: 38, bottom: 26 },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: dashboard.value.hourlyTrend.map(item => item.label),
    axisLine: { lineStyle: { color: 'rgba(147, 173, 255, 0.24)' } },
    axisLabel: { color: '#95aaff' }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(118, 143, 255, 0.08)' } },
    axisLabel: { color: '#7f93ca' }
  },
  series: [
    {
      type: 'line',
      smooth: true,
      data: dashboard.value.hourlyTrend.map(item => item.value),
      lineStyle: { color: '#35d7ff', width: 3 },
      symbolSize: 7,
      itemStyle: { color: '#8df1ff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(53, 215, 255, 0.34)' },
            { offset: 1, color: 'rgba(53, 215, 255, 0.04)' }
          ]
        }
      }
    }
  ]
}))

const barOption = computed<EChartsOption>(() => ({
  grid: { left: 18, right: 12, top: 24, bottom: 18, containLabel: true },
  xAxis: { type: 'value', axisLabel: { color: '#8ea4e8' }, splitLine: { lineStyle: { color: 'rgba(130, 150, 255, 0.1)' } } },
  yAxis: {
    type: 'category',
    data: dashboard.value.regionRanking.map(item => item.province),
    axisLabel: { color: '#d7e0ff' },
    axisTick: { show: false },
    axisLine: { show: false }
  },
  series: [{
    type: 'bar',
    barWidth: 12,
    data: dashboard.value.regionRanking.map(item => ({
      value: item.activity,
      name: item.province
    })),
    itemStyle: {
      borderRadius: [0, 8, 8, 0],
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [{ offset: 0, color: '#4876ff' }, { offset: 1, color: '#4df6d8' }]
      }
    }
  }]
}))

const pieOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie',
    radius: ['52%', '74%'],
    center: ['50%', '52%'],
    label: { color: '#d8e2ff', formatter: '{b}\n{d}%' },
    labelLine: { lineStyle: { color: 'rgba(159, 184, 255, 0.4)' } },
    data: dashboard.value.channelShare,
    color: ['#35d7ff', '#4de6b4', '#8a8fff', '#ffb547', '#ff6d6d']
  }]
}))

const riskOption = computed<EChartsOption>(() => ({
  grid: { left: 20, right: 10, top: 32, bottom: 18 },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: dashboard.value.riskWave.map(item => item.label), axisLabel: { color: '#94a8db' } },
  yAxis: { type: 'value', axisLabel: { color: '#94a8db' }, splitLine: { lineStyle: { color: 'rgba(130, 150, 255, 0.08)' } } },
  series: [{
    type: 'bar',
    data: dashboard.value.riskWave.map(item => ({
      value: item.value,
      name: item.label
    })),
    barWidth: 10,
    itemStyle: { borderRadius: [6, 6, 0, 0], color: '#ff8c52' }
  }]
}))

const cityOption = computed<EChartsOption>(() => ({
  grid: { left: 10, right: 10, top: 12, bottom: 8, containLabel: true },
  xAxis: {
    type: 'value',
    axisLabel: { color: '#7f93ca', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(130, 150, 255, 0.08)' } }
  },
  yAxis: {
    type: 'category',
    data: dashboard.value.cityFocus.map(item => item.city),
    axisLabel: { color: '#d7e0ff', fontSize: 11 },
    axisTick: { show: false },
    axisLine: { show: false }
  },
  series: [{
    type: 'bar',
    data: dashboard.value.cityFocus.map(item => ({
      value: item.orderVolume,
      name: item.city
    })),
    barWidth: 8,
    itemStyle: {
      borderRadius: [0, 6, 6, 0],
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [{ offset: 0, color: '#5d8dff' }, { offset: 1, color: '#73f3c6' }]
      }
    }
  }]
}))

const threeDHours = computed<string[]>(() => dashboard.value.hourlyTrend.slice(0, 6).map(item => item.label))

const threeDOption = computed<EChartsOption>(() => ({
  tooltip: {},
  visualMap: {
    max: 160,
    min: 30,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: 0,
    textStyle: { color: '#dbe5ff' },
    inRange: {
      color: ['#2d5bff', '#3ec7ff', '#4de6b4', '#ffd166']
    }
  },
  xAxis3D: {
    type: 'category',
    data: dashboard.value.regionRanking.slice(0, 6).map(item => item.province),
    axisLabel: { color: '#dbe5ff', fontSize: 11 }
  },
  yAxis3D: {
    type: 'category',
    data: threeDHours.value,
    axisLabel: { color: '#9fb5ff', fontSize: 11 }
  },
  zAxis3D: {
    type: 'value',
    axisLabel: { color: '#88a2df', fontSize: 11 }
  },
  grid3D: {
    boxWidth: 120,
    boxDepth: 80,
    light: {
      main: { intensity: 1.2, shadow: true },
      ambient: { intensity: 0.45 }
    },
    viewControl: {
      alpha: 24,
      beta: 32,
      distance: 180
    },
    axisLine: { lineStyle: { color: 'rgba(128, 160, 255, 0.45)' } },
    axisPointer: { lineStyle: { color: '#4de6b4' } }
  },
  series: [{
    type: 'bar3D',
    shading: 'lambert',
    data: dashboard.value.regionRanking.slice(0, 6).flatMap((region, xIndex) =>
      threeDHours.value.map((label, yIndex) => {
        const hourValue = dashboard.value.hourlyTrend.find(item => item.label === label)?.value ?? 0
        const value = Math.round((region.activity * 0.9 + region.warningCount * 1.4) * (hourValue / 60))
        return {
          name: `${region.province}|${label}`,
          value: [xIndex, yIndex, value]
        }
      })
    ),
    bevelSize: 0.24,
    itemStyle: {
      opacity: 0.96
    }
  }]
}))

const radarIndicators = [
  { name: '交易协同', max: 100 },
  { name: '风险感知', max: 100 },
  { name: '设备韧性', max: 100 },
  { name: '工单效率', max: 100 },
  { name: '区域响应', max: 100 },
  { name: '数据完整', max: 100 }
]

const radarOption = computed<EChartsOption>(() => ({
  tooltip: {},
  radar: {
    indicator: radarIndicators,
    splitNumber: 4,
    axisName: { color: '#dbe5ff', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(124, 152, 255, 0.14)' } },
    splitArea: { areaStyle: { color: ['rgba(14, 32, 62, 0.28)', 'rgba(14, 32, 62, 0.12)'] } }
  },
  series: [{
    type: 'radar',
    data: [
      {
        value: [88, 76, 84, 91, 79, 86],
        name: '指挥中枢能力',
        areaStyle: { color: 'rgba(53, 215, 255, 0.2)' },
        lineStyle: { color: '#35d7ff', width: 2 },
        itemStyle: { color: '#4de6b4' }
      }
    ]
  }]
}))

const weeklyAreaOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  legend: { top: 2, right: 0, textStyle: { color: '#c8d8ff' } },
  grid: { left: 18, right: 16, top: 34, bottom: 18 },
  xAxis: {
    type: 'category',
    data: dashboard.value.weeklyOrders.map(item => item.label),
    axisLabel: { color: '#95aaff' }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#7f93ca' },
    splitLine: { lineStyle: { color: 'rgba(118, 143, 255, 0.08)' } }
  },
  series: [
    {
      name: '订单趋势',
      type: 'line',
      smooth: true,
      stack: 'total',
      data: dashboard.value.weeklyOrders.map(item => ({
        value: item.value,
        name: item.label
      })),
      areaStyle: { color: 'rgba(77, 230, 180, 0.18)' },
      lineStyle: { color: '#4de6b4', width: 2.5 }
    },
    {
      name: '风险处置',
      type: 'line',
      smooth: true,
      stack: 'total',
      data: dashboard.value.weeklyOrders.map((item, index) => ({
        value: Math.round(item.value * 0.56 + index * 4),
        name: item.label
      })),
      areaStyle: { color: 'rgba(93, 141, 255, 0.16)' },
      lineStyle: { color: '#5d8dff', width: 2.5 }
    }
  ]
}))
</script>

<template>
  <div id="big-screen-shell" :class="['big-screen-shell', { 'big-screen-shell--compact': isCompactScreen }]">
    <div class="big-screen-scale">
      <main :class="['big-screen-page', { 'big-screen-page--compact': isCompactScreen }]">
        <BigScreenHeader :title="dashboard.title" :subtitle="dashboard.subtitle" :date-text="dateText" :time-text="timeText" />

        <section class="big-screen-toolbar panel-card">
          <p>现在支持点击图表下钻到省份、城市、渠道、时段明细，并补充了 3D 与能力画像图表。</p>
          <div class="toolbar-actions">
            <el-button type="primary" :icon="RefreshRight" @click="refreshMock">刷新 mock 数据</el-button>
            <el-button @click="router.push('/dyform')">返回首页</el-button>
          </div>
        </section>

        <section class="metric-grid">
          <MetricCard v-for="metric in dashboard.metrics" :key="metric.id" :metric="metric" @open="handleMetricOpen" />
        </section>

        <section class="screen-layout">
          <div class="screen-column">
            <ChartPanel title="区域活跃排行" subtitle="点击省份继续下钻区域明细" :option="barOption" detail-id="panel-region" @open="openDetail" @drill="handleChartDrill" />
            <ChartPanel title="重点城市热度" subtitle="点击城市查看城市级业务负载" :option="cityOption" detail-id="panel-city" @open="openDetail" @drill="handleChartDrill" />
            <ChartPanel title="3D 区域负载矩阵" subtitle="省份 × 时段的三维负载分布，可继续下钻" :option="threeDOption" detail-id="panel-3d" @open="openDetail" @drill="handleChartDrill" />
          </div>

          <div class="screen-column screen-column--center">
            <ChinaCityMapPanel :cities="dashboard.cityFocus" height="340px" detail-id="panel-city" @open="openDetail" @drill="handleChartDrill" />
            <ChartPanel title="24 小时交易趋势" subtitle="点击任一时段下钻时段明细" :option="lineOption" detail-id="panel-trend" @open="openDetail" @drill="handleChartDrill" />
            <div class="dual-panel-row">
              <ChartPanel title="渠道构成" subtitle="点击扇区查看渠道明细" :option="pieOption" detail-id="panel-channel" @open="openDetail" @drill="handleChartDrill" />
              <ChartPanel title="风险波动" subtitle="点击柱体查看时段风险承压" :option="riskOption" detail-id="panel-alert" @open="openDetail" @drill="handleChartDrill" />
            </div>
            <div class="dual-panel-row">
              <ChartPanel title="作战能力雷达" subtitle="多维能力画像，点击维度继续下钻" :option="radarOption" detail-id="panel-radar" @open="openDetail" @drill="handleChartDrill" />
              <ChartPanel title="周维度堆叠趋势" subtitle="订单与风险处置双维曲线，支持按周下钻" :option="weeklyAreaOption" detail-id="panel-weekly" @open="openDetail" @drill="handleChartDrill" />
            </div>
          </div>

          <div class="screen-column">
            <StatusPanel title="告警中心" subtitle="高优先级事件与处置提示" clickable @open="openDetail('panel-alert')">
              <button v-for="item in dashboard.alerts" :key="item.id" type="button" class="list-item alert-item" @click="openDetail('panel-alert')">
                <span :class="`alert-level alert-level--${item.level}`"></span>
                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.region }} · {{ item.detail }}</p>
                </div>
                <em>{{ item.timestamp }}</em>
              </button>
            </StatusPanel>
            <StatusPanel title="任务进度" subtitle="值班任务与运营策略推进情况" clickable @open="openDetail('panel-task')">
              <button v-for="task in dashboard.tasks" :key="task.id" type="button" class="list-item task-item" @click="openDetail('panel-task')">
                <div>
                  <strong>{{ task.title }}</strong>
                  <p>{{ task.owner }} · {{ task.eta }}</p>
                </div>
                <div class="task-progress">
                  <span>{{ task.progress }}%</span>
                  <div class="task-progress__bar"><i :style="{ width: `${task.progress}%` }"></i></div>
                </div>
              </button>
            </StatusPanel>

            <StatusPanel title="实时流水" subtitle="模拟业务流水滚动播报" clickable @open="openDetail('panel-stream')">
              <button v-for="stream in dashboard.streams" :key="stream.id" type="button" class="list-item stream-item" @click="openDetail('panel-stream')">
                <div>
                  <strong>{{ stream.channel }}</strong>
                  <p>{{ stream.region }} · {{ stream.status }}</p>
                </div>
                <div class="stream-amount">
                  <span>¥{{ stream.amount.toLocaleString() }}</span>
                  <em>{{ stream.timestamp }}</em>
                </div>
              </button>
            </StatusPanel>
          </div>
        </section>

        <DetailDrawer v-model="drawerVisible" :detail="activeDetail" />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
