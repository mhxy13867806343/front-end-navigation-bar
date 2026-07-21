import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

/**
 * Reusable ECharts composable for Vue 3 components
 * Handles initialization, option updates, window resize listeners, and disposal automatically
 */
export function useECharts(
  chartRef: Ref<HTMLDivElement | null>,
  theme: string | object | null = null
) {
  const chartInstance = ref<ECharts | null>(null)
  let resizeHandler: (() => void) | null = null

  const initChart = (): ECharts | null => {
    if (!chartRef.value) return null
    if (chartInstance.value) {
      chartInstance.value.dispose()
    }
    chartInstance.value = echarts.init(chartRef.value, theme)
    return chartInstance.value
  }

  const setOptions = (options: EChartsOption, notMerge: boolean = false): void => {
    nextTick(() => {
      if (!chartInstance.value) {
        initChart()
      }
      chartInstance.value?.setOption(options, notMerge)
    })
  }

  const resize = (): void => {
    chartInstance.value?.resize()
  }

  const dispose = (): void => {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
      resizeHandler = null
    }
    if (chartInstance.value) {
      chartInstance.value.dispose()
      chartInstance.value = null
    }
  }

  onMounted(() => {
    nextTick(() => {
      initChart()
      resizeHandler = () => {
        resize()
      }
      window.addEventListener('resize', resizeHandler)
    })
  })

  onUnmounted(() => {
    dispose()
  })

  return {
    chartInstance,
    initChart,
    setOptions,
    resize,
    dispose
  }
}
