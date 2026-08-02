<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mountThreeScene } from '../scenes/runtime'
import type { SceneTelemetry, SceneParams, MountedScene } from '../scenes/runtime'

const props = defineProps<{
  sceneId: string
  params: SceneParams
  compact?: boolean
}>()

const emit = defineEmits<{
  telemetry: [payload: SceneTelemetry]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const errorMessage = ref<string>('')
const telemetry = ref<SceneTelemetry>({ label: '场景初始化中', status: '请稍候', score: 0 })
let sceneRuntime: MountedScene | null = null
let resizeObserver: ResizeObserver | null = null

const statusText = computed<string>(() => telemetry.value.status || 'Three.js 场景运行中')

const mountScene = (): void => {
  if (!containerRef.value) return
  try {
    errorMessage.value = ''
    sceneRuntime?.dispose()
    sceneRuntime = mountThreeScene({
      id: props.sceneId,
      container: containerRef.value,
      params: props.params,
      onTelemetry(payload: SceneTelemetry) {
        telemetry.value = payload
        emit('telemetry', payload)
      }
    })
  } catch (error) {
    errorMessage.value = `当前环境无法初始化 WebGL：${String(error)}`
  }
}

const handleReset = (): void => {
  sceneRuntime?.reset()
}

onMounted(() => {
  mountScene()
  resizeObserver = new ResizeObserver(() => {
    sceneRuntime?.resize()
  })
  if (containerRef.value) resizeObserver.observe(containerRef.value)
})

watch(() => props.sceneId, () => {
  mountScene()
})

watch(() => props.params, (value: SceneParams) => {
  sceneRuntime?.updateParams(value)
}, { deep: true })

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  sceneRuntime?.dispose()
  sceneRuntime = null
})
</script>

<template>
  <section :class="['scene-canvas', { 'scene-canvas--compact': compact }]">
    <div class="scene-canvas__hud">
      <div>
        <strong>{{ telemetry.label }}</strong>
        <p>{{ statusText }}</p>
      </div>
      <div class="scene-canvas__actions">
        <span v-if="typeof telemetry.score === 'number'" class="scene-canvas__score">Score {{ telemetry.score }}</span>
        <button type="button" class="scene-canvas__button" @click="handleReset">重置</button>
      </div>
    </div>
    <div ref="containerRef" class="scene-canvas__stage"></div>
    <div v-if="errorMessage" class="scene-canvas__error">
      <strong>WebGL 初始化失败</strong>
      <p>{{ errorMessage }}</p>
    </div>
  </section>
</template>

<style scoped lang="scss" src="./css/SceneCanvas.scss"></style>
