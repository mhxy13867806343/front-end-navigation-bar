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

<style scoped lang="scss" src="./css/ChartPanel.scss"></style>
