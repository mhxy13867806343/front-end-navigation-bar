<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import type { BigScreenCityItem } from '../types'

const props = defineProps<{
  cities: BigScreenCityItem[]
  detailId: string
}>()

const emit = defineEmits<{
  open: [detailId: string]
  drill: [payload: { detailId: string; name?: string; value?: unknown }]
}>()

const chartRef = ref<HTMLDivElement | null>(null)
const mapLoaded = ref<boolean>(false)
let chart: ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const scatterData = computed(() => props.cities.map(item => ({
  name: item.city,
  value: [...item.coord, item.orderVolume, item.activity]
})))

const option = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: { data?: { value?: number[]; name?: string } }): string => {
      const value = params.data?.value ?? []
      return `${params.data?.name || ''}<br/>订单量：${value[2] ?? '--'}<br/>活跃指数：${value[3] ?? '--'}`
    }
  },
  geo: {
    map: 'china-big-screen',
    roam: false,
    zoom: 1.08,
    top: 18,
    itemStyle: {
      areaColor: '#0b1f44',
      borderColor: '#2d6dff',
      borderWidth: 1
    },
    emphasis: {
      itemStyle: {
        areaColor: '#14326b'
      }
    }
  },
  series: [
    {
      type: 'effectScatter',
      coordinateSystem: 'geo',
      data: scatterData.value,
      symbolSize: (value: number[]) => Math.max(10, Number(value[2] || 0) / 260),
      rippleEffect: { scale: 4.5, brushType: 'stroke' },
      itemStyle: {
        color: '#4de6b4',
        shadowBlur: 16,
        shadowColor: 'rgba(77, 230, 180, 0.85)'
      },
      label: {
        show: true,
        formatter: '{b}',
        position: 'right',
        color: '#dbe8ff',
        fontSize: 11
      }
    }
  ]
}))

const ensureMap = async (): Promise<void> => {
  if (mapLoaded.value) return
  const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
  const geoJson = await response.json()
  echarts.registerMap('china-big-screen', geoJson as never)
  mapLoaded.value = true
}

const renderChart = async (): Promise<void> => {
  await nextTick()
  if (!chartRef.value || !chartRef.value.clientWidth || !chartRef.value.clientHeight) return
  await ensureMap()
  if (!chart) {
    chart = echarts.init(chartRef.value)
    chart.on('click', (params): void => {
      emit('drill', {
        detailId: props.detailId,
        name: typeof params.name === 'string' ? params.name : undefined,
        value: params.value
      })
    })
  }
  chart.setOption(option.value, true)
  chart.resize()
}

const handleOpen = (): void => {
  emit('open', props.detailId)
}

onMounted(async (): Promise<void> => {
  await renderChart()
  resizeObserver = new ResizeObserver(() => {
    void renderChart()
  })
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value)
  }
})

watch(() => props.cities, () => {
  void renderChart()
}, { deep: true })

onBeforeUnmount((): void => {
  resizeObserver?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<template>
  <section class="china-map-panel panel-card">
    <div class="china-map-panel__head">
      <div>
        <h3>中国城市散点热力</h3>
        <p>重点城市订单体量与活跃指数分布</p>
      </div>
      <button type="button" class="china-map-panel__action" @click="handleOpen">查看详情</button>
    </div>
    <div ref="chartRef" class="china-map-panel__canvas"></div>
  </section>
</template>

<style scoped lang="scss">
.china-map-panel {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(102, 132, 255, 0.22);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(10, 18, 34, 0.94), rgba(6, 11, 24, 0.94));
  text-align: left;
  color: inherit;
}

.china-map-panel__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.china-map-panel__head h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.china-map-panel__head p {
  margin: 0;
  font-size: 11px;
  color: #93a7db;
}

.china-map-panel__action {
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(111, 145, 255, 0.2);
  background: rgba(70, 95, 193, 0.1);
  color: #afc0ff;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: rgba(70, 95, 193, 0.25);
    color: #dce4ff;
  }
}

.china-map-panel__canvas {
  width: 100%;
  height: 264px;
  margin-top: 10px;
}

.china-map-panel:hover {
  transform: translateY(-3px);
  border-color: rgba(110, 181, 255, 0.42);
}

@media (max-width: 1280px) {
  .china-map-panel__canvas {
    height: 204px;
  }
}

@media (max-width: 900px) {
  .china-map-panel__canvas {
    height: 240px;
  }
}
</style>
