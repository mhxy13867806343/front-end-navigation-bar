<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption, ECElementEvent } from 'echarts'

const props = withDefaults(defineProps<{
  title: string
  subtitle: string
  option: EChartsOption
  detailId?: string
  clickable?: boolean
  drilldownEnabled?: boolean
}>(), {
  detailId: '',
  clickable: true,
  drilldownEnabled: true
})

const emit = defineEmits<{
  open: [detailId: string]
  drill: [payload: { detailId: string; name?: string; seriesName?: string; value?: unknown }]
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chart: ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const panelClasses = computed<Record<string, boolean>>(() => ({
  'chart-panel': true,
  'panel-card': true,
  'chart-panel--clickable': props.clickable
}))

const renderChart = async (): Promise<void> => {
  await nextTick()
  if (!chartRef.value) return
  if (!chartRef.value.clientWidth || !chartRef.value.clientHeight) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
    chart.on('click', (params: ECElementEvent): void => {
      if (!props.drilldownEnabled || !props.detailId) return
      emit('drill', {
        detailId: props.detailId,
        name: typeof params.name === 'string' ? params.name : undefined,
        seriesName: typeof params.seriesName === 'string' ? params.seriesName : undefined,
        value: params.value
      })
    })
  }
  chart.setOption(props.option, true)
  chart.resize()
}

const handleOpen = (): void => {
  if (props.clickable && props.detailId) {
    emit('open', props.detailId)
  }
}

onMounted(async (): Promise<void> => {
  await renderChart()
  resizeObserver = new ResizeObserver(() => {
    chart?.resize()
  })
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value)
  }
})

watch(() => props.option, () => {
  void renderChart()
}, { deep: true })

onBeforeUnmount((): void => {
  resizeObserver?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<template>
  <section :class="panelClasses">
    <div class="chart-panel__head">
      <div>
        <h3>{{ title }}</h3>
        <p>{{ subtitle }}</p>
      </div>
      <button v-if="clickable" type="button" class="chart-panel__action" @click="handleOpen">查看详情</button>
    </div>
    <div ref="chartRef" class="chart-panel__canvas"></div>
  </section>
</template>

<style scoped lang="scss">
.chart-panel {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(102, 132, 255, 0.22);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(10, 18, 34, 0.94), rgba(6, 11, 24, 0.94));
  text-align: left;
  color: inherit;
}

.chart-panel__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.chart-panel__head h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.chart-panel__head p {
  margin: 0;
  font-size: 11px;
  color: #93a7db;
}

.chart-panel__action {
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(111, 145, 255, 0.2);
  background: rgba(70, 95, 193, 0.1);
  color: #afc0ff;
  font-size: 12px;
}

.chart-panel__canvas {
  width: 100%;
  height: 220px;
  margin-top: 10px;
}

.chart-panel--clickable:hover {
  transform: translateY(-3px);
  border-color: rgba(110, 181, 255, 0.42);
}

@media (max-width: 1280px) {
  .chart-panel__canvas {
    height: 186px;
  }
}

@media (max-width: 900px) {
  .chart-panel__canvas {
    height: 220px;
  }
}
</style>
