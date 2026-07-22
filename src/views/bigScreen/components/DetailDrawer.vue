<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import ChartPanel from './ChartPanel.vue'
import type { BigScreenDetailPayload } from '../types'

const props = defineProps<{
  modelValue: boolean
  detail: BigScreenDetailPayload | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const chartOption = computed<EChartsOption>(() => ({
  grid: { left: 24, right: 18, top: 36, bottom: 24 },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: props.detail?.timeline.map(item => item.label) ?? [],
    axisLine: { lineStyle: { color: 'rgba(151, 167, 255, 0.35)' } },
    axisLabel: { color: '#9fb5ff' }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(120, 135, 210, 0.12)' } },
    axisLabel: { color: '#89a0d8' }
  },
  series: [
    {
      type: 'line',
      smooth: true,
      data: props.detail?.timeline.map(item => item.value) ?? [],
      lineStyle: { color: '#4ad6ff', width: 3 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(74, 214, 255, 0.35)' },
            { offset: 1, color: 'rgba(74, 214, 255, 0.02)' }
          ]
        }
      },
      symbol: 'circle',
      symbolSize: 8
    }
  ]
}))

const rows = computed<Array<Record<string, string | number>>>(() => props.detail?.records ?? [])
const columns = computed<string[]>(() => rows.value[0] ? Object.keys(rows.value[0]) : [])
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    size="44%"
    append-to-body
    destroy-on-close
    class="big-screen-detail-drawer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="detail-drawer__header">
        <p>模块详情</p>
        <h2>{{ detail?.title || '查看详情' }}</h2>
        <span>{{ detail?.summary }}</span>
      </div>
    </template>

    <div v-if="detail" class="detail-drawer__body">
      <div class="detail-drawer__metrics">
        <div v-for="metric in detail.metrics" :key="metric.id" class="detail-drawer__metric-card">
          <span>{{ metric.title }}</span>
          <strong>{{ metric.value }}{{ metric.unit }}</strong>
          <em>{{ metric.summary }}</em>
        </div>
      </div>

      <ChartPanel
        title="趋势明细"
        subtitle="点击查看动作对应的时间序列"
        :option="chartOption"
        :clickable="false"
      />

      <div class="detail-drawer__table-wrap">
        <table v-if="columns.length" class="detail-drawer__table">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column">{{ column }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="index">
              <td v-for="column in columns" :key="`${index}-${column}`">{{ row[column] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </el-drawer>
</template>
