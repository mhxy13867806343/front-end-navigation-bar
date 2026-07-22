<script setup lang="ts">
import type { BigScreenMetric } from '../types'

const props = defineProps<{
  metric: BigScreenMetric
}>()

const emit = defineEmits<{
  open: [metric: BigScreenMetric]
}>()

const handleClick = (): void => {
  emit('open', props.metric)
}
</script>

<template>
  <button type="button" class="metric-card panel-card" @click="handleClick">
    <div class="metric-card__head">
      <span>{{ metric.title }}</span>
      <em :class="`metric-card__status metric-card__status--${metric.status}`">
        {{ metric.status === 'up' ? '上升' : metric.status === 'down' ? '下降' : '平稳' }}
      </em>
    </div>
    <div class="metric-card__value">
      <strong>{{ metric.value }}</strong>
      <span>{{ metric.unit }}</span>
    </div>
    <div class="metric-card__foot">
      <p>{{ metric.summary }}</p>
      <b :class="{ negative: metric.trend < 0 }">{{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%</b>
    </div>
  </button>
</template>
