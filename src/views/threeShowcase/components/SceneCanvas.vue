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

<style scoped lang="scss">
.scene-canvas {
  position: relative;
  min-height: 420px;
  border-radius: 28px;
  border: 1px solid rgba(96, 135, 255, 0.26);
  background:
    radial-gradient(circle at top, rgba(88, 213, 255, 0.18), transparent 38%),
    linear-gradient(180deg, rgba(6, 10, 24, 0.98), rgba(2, 6, 18, 0.98));
  overflow: hidden;
}

.scene-canvas--compact {
  min-height: 320px;
}

.scene-canvas__hud {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  pointer-events: none;
}

.scene-canvas__hud strong {
  display: block;
  font-size: 14px;
  color: #f5fbff;
}

.scene-canvas__hud p {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(218, 231, 255, 0.72);
}

.scene-canvas__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scene-canvas__score,
.scene-canvas__button {
  pointer-events: auto;
}

.scene-canvas__score {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(6, 20, 48, 0.82);
  border: 1px solid rgba(102, 136, 255, 0.24);
  color: #8cf4ff;
  font-size: 12px;
  font-weight: 700;
}

.scene-canvas__button {
  border: 1px solid rgba(108, 142, 255, 0.26);
  background: rgba(20, 30, 72, 0.82);
  color: #eef4ff;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.scene-canvas__button:hover {
  transform: translateY(-1px);
  border-color: rgba(108, 196, 255, 0.58);
}

.scene-canvas__stage {
  width: 100%;
  height: 100%;
  min-height: inherit;
}

.scene-canvas__error {
  position: absolute;
  inset: auto 16px 16px 16px;
  z-index: 4;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 110, 110, 0.28);
  background: rgba(35, 10, 20, 0.92);
  color: #ffe3e3;
}

.scene-canvas__error strong {
  display: block;
  margin-bottom: 6px;
}

.scene-canvas__error p {
  margin: 0;
  line-height: 1.6;
}
</style>
