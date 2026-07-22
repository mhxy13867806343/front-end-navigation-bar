<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { EChartsOption } from 'echarts'
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
import type { BigScreenDetailPayload, BigScreenMetric, BigScreenOverview } from './types'

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

const openDetail = (detailId: string): void => {
  const detail: BigScreenDetailPayload | undefined = dashboard.value.detailMap[detailId]
  if (!detail) return
  activeDetail.value = detail
  drawerVisible.value = true
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
    data: dashboard.value.regionRanking.map(item => item.activity),
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
    data: dashboard.value.riskWave.map(item => item.value),
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
    data: dashboard.value.cityFocus.map(item => item.orderVolume),
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
</script>

<template>
  <div id="big-screen-shell" :class="['big-screen-shell', { 'big-screen-shell--compact': isCompactScreen }]">
    <div class="big-screen-scale">
      <main :class="['big-screen-page', { 'big-screen-page--compact': isCompactScreen }]">
        <BigScreenHeader :title="dashboard.title" :subtitle="dashboard.subtitle" :date-text="dateText" :time-text="timeText" />

        <section class="big-screen-toolbar panel-card">
          <p>基于 mock 生成真实结构化数据，支持点击查看指标、图表、告警和任务详情。</p>
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
            <ChartPanel title="区域活跃排行" subtitle="重点省份活跃指数与订单强度" :option="barOption" detail-id="panel-region" @open="openDetail" />
            <ChinaCityMapPanel :cities="dashboard.cityFocus" detail-id="panel-city" @open="openDetail" />
            <ChartPanel title="重点城市热度" subtitle="城市级订单与活跃热度" :option="cityOption" detail-id="panel-city" @open="openDetail" />
          </div>

          <div class="screen-column screen-column--center">
            <ChartPanel title="24 小时交易趋势" subtitle="模拟真实业务流量与交易峰谷变化" :option="lineOption" detail-id="panel-trend" @open="openDetail" />
            <div class="dual-panel-row">
              <ChartPanel title="渠道构成" subtitle="不同渠道成交占比" :option="pieOption" detail-id="panel-channel" @open="openDetail" />
              <ChartPanel title="风险波动" subtitle="风险事件热度波动监测" :option="riskOption" detail-id="panel-alert" @open="openDetail" />
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
