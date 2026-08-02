<template>
  <div class="rcb-wrapper">
    <!-- Main refresh button -->
    <el-button
      class="refresh-countdown-btn"
      :type="type"
      :size="size"
      :loading="loading"
      :disabled="manualDisabled"
      @click="handleClick"
    >
      <template v-if="loading">刷新中...</template>
      <template v-else-if="countdown > 0">{{ countdown }}s 后可刷新</template>
      <template v-else>🔄 {{ text }}</template>
    </el-button>

    <!-- Auto-refresh toggle + interval selector -->
    <div class="rcb-auto-area">
      <button
        class="rcb-auto-toggle"
        :class="{ active: autoEnabled }"
        :title="autoEnabled ? `自动刷新中，间隔 ${currentIntervalLabel}，下次 ${nextRefreshLabel}` : '开启自动刷新'"
        @click="toggleAuto"
      >
        <span class="rcb-auto-icon">⏱</span>
        <span class="rcb-auto-ring" v-if="autoEnabled">
          <svg viewBox="0 0 20 20" width="20" height="20">
            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-opacity="0.2" stroke-width="2"/>
            <circle
              cx="10" cy="10" r="8"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-dasharray="50.27"
              :stroke-dashoffset="ringOffset"
              transform="rotate(-90 10 10)"
              style="transition: stroke-dashoffset 1s linear"
            />
          </svg>
        </span>
      </button>

      <!-- Interval popover -->
      <transition name="rcb-pop">
        <div v-if="showPicker" class="rcb-picker" @click.stop>
          <div class="rcb-picker-title">自动刷新间隔</div>
          <div class="rcb-picker-presets">
            <button
              v-for="preset in PRESETS"
              :key="preset.seconds"
              class="rcb-preset"
              :class="{ active: selectedSeconds === preset.seconds }"
              @click="selectPreset(preset.seconds)"
            >{{ preset.label }}</button>
          </div>
          <div class="rcb-picker-custom">
            <label>自定义（分钟）</label>
            <input
              v-model.number="customMinutes"
              type="number"
              min="5"
              max="1440"
              step="5"
              placeholder="5-1440"
              @keyup.enter="applyCustom"
            />
            <button class="rcb-apply" @click="applyCustom">确定</button>
          </div>
          <div v-if="autoEnabled" class="rcb-picker-status">
            <span>🕐 下次刷新：{{ nextRefreshLabel }}</span>
            <button class="rcb-stop" @click="stopAuto">停止自动刷新</button>
          </div>
          <div v-else class="rcb-picker-status">
            <button class="rcb-start" @click="startAuto">▶ 立即启动</button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ButtonProps } from 'element-plus'

interface RefreshCountdownButtonProps {
  onRefresh?: (() => Promise<void> | void) | null
  seconds?: number
  text?: string
  type?: ButtonProps['type']
  size?: ButtonProps['size']
  /** localStorage key prefix for persisting auto-refresh interval */
  storageKey?: string
}

interface Preset {
  label: string
  seconds: number
}

const PRESETS: Preset[] = [
  { label: '5 分钟', seconds: 5 * 60 },
  { label: '15 分钟', seconds: 15 * 60 },
  { label: '30 分钟', seconds: 30 * 60 },
  { label: '1 小时', seconds: 60 * 60 },
  { label: '3 小时', seconds: 3 * 60 * 60 },
  { label: '6 小时', seconds: 6 * 60 * 60 },
  { label: '12 小时', seconds: 12 * 60 * 60 },
  { label: '1 天', seconds: 24 * 60 * 60 }
]

const MIN_SECONDS = 5 * 60
const MAX_SECONDS = 24 * 60 * 60

const props = withDefaults(defineProps<RefreshCountdownButtonProps>(), {
  onRefresh: null,
  seconds: 60,
  text: '刷新',
  type: 'primary',
  size: 'small',
  storageKey: 'rcb-default'
})

const emit = defineEmits<{ refresh: [] }>()

// ── manual refresh countdown ─────────────────────────────────
const loading = ref<boolean>(false)
const countdown = ref<number>(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null
const manualDisabled = computed<boolean>(() => countdown.value > 0 && !loading.value)

// ── auto refresh state ───────────────────────────────────────
const autoEnabled = ref<boolean>(false)
const selectedSeconds = ref<number>(5 * 60)
const autoRemaining = ref<number>(0)       // seconds until next auto-refresh
const nextRefreshTime = ref<Date | null>(null)
let autoTimer: ReturnType<typeof setInterval> | null = null

// ── UI state ────────────────────────────────────────────────
const showPicker = ref<boolean>(false)
const customMinutes = ref<number>(5)

const storageIntervalKey = computed<string>(() => `${props.storageKey}:auto-interval`)
const storageEnabledKey = computed<string>(() => `${props.storageKey}:auto-enabled`)

// ── derived ─────────────────────────────────────────────────
const currentIntervalLabel = computed<string>(() => {
  const preset = PRESETS.find((p: Preset): boolean => p.seconds === selectedSeconds.value)
  if (preset) return preset.label
  const mins = Math.round(selectedSeconds.value / 60)
  return `${mins} 分钟`
})

const nextRefreshLabel = computed<string>(() => {
  if (!nextRefreshTime.value) return '--'
  const h = nextRefreshTime.value.getHours().toString().padStart(2, '0')
  const m = nextRefreshTime.value.getMinutes().toString().padStart(2, '0')
  const s = nextRefreshTime.value.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

const ringOffset = computed<number>(() => {
  if (selectedSeconds.value <= 0) return 0
  const pct = autoRemaining.value / selectedSeconds.value
  return 50.27 * (1 - pct)
})

// ── lifecycle ────────────────────────────────────────────────
onMounted((): void => {
  restoreState()
  document.addEventListener('click', closePicker)
})

onBeforeUnmount((): void => {
  clearCountdownTimer()
  clearAutoTimer()
  document.removeEventListener('click', closePicker)
})

function restoreState(): void {
  const savedInterval = localStorage.getItem(storageIntervalKey.value)
  if (savedInterval) {
    const parsed = parseInt(savedInterval, 10)
    if (!isNaN(parsed) && parsed >= MIN_SECONDS && parsed <= MAX_SECONDS) {
      selectedSeconds.value = parsed
      customMinutes.value = Math.round(parsed / 60)
    }
  }
  const savedEnabled = localStorage.getItem(storageEnabledKey.value)
  if (savedEnabled === 'true') {
    startAuto()
  }
}

// ── manual refresh ───────────────────────────────────────────
async function handleClick(): Promise<void> {
  if (loading.value || countdown.value > 0) return
  await doRefresh()
}

async function doRefresh(): Promise<void> {
  loading.value = true
  try {
    emit('refresh')
    if (props.onRefresh) await props.onRefresh()
  } catch (e) {
    console.error('刷新失败:', e)
  } finally {
    loading.value = false
    startCountdown()
    if (autoEnabled.value) resetAutoTimer()
  }
}

function startCountdown(): void {
  countdown.value = props.seconds
  clearCountdownTimer()
  countdownTimer = setInterval((): void => {
    countdown.value--
    if (countdown.value <= 0) {
      countdown.value = 0
      clearCountdownTimer()
    }
  }, 1000)
}

function clearCountdownTimer(): void {
  if (countdownTimer !== null) { clearInterval(countdownTimer); countdownTimer = null }
}

// ── auto refresh ─────────────────────────────────────────────
function startAuto(): void {
  autoEnabled.value = true
  localStorage.setItem(storageEnabledKey.value, 'true')
  resetAutoTimer()
  showPicker.value = false
}

function stopAuto(): void {
  autoEnabled.value = false
  localStorage.setItem(storageEnabledKey.value, 'false')
  clearAutoTimer()
  autoRemaining.value = 0
  nextRefreshTime.value = null
  showPicker.value = false
}

function toggleAuto(): void {
  showPicker.value = !showPicker.value
}

function resetAutoTimer(): void {
  clearAutoTimer()
  autoRemaining.value = selectedSeconds.value
  const fireAt = new Date(Date.now() + selectedSeconds.value * 1000)
  nextRefreshTime.value = fireAt

  autoTimer = setInterval((): void => {
    autoRemaining.value--
    if (autoRemaining.value <= 0) {
      clearAutoTimer()
      doRefresh()
    }
  }, 1000)
}

function clearAutoTimer(): void {
  if (autoTimer !== null) { clearInterval(autoTimer); autoTimer = null }
}

// ── picker ───────────────────────────────────────────────────
function selectPreset(seconds: number): void {
  selectedSeconds.value = seconds
  customMinutes.value = Math.round(seconds / 60)
  localStorage.setItem(storageIntervalKey.value, String(seconds))
  if (autoEnabled.value) resetAutoTimer()
}

function applyCustom(): void {
  let mins = Math.round(customMinutes.value)
  if (isNaN(mins) || mins < 5) mins = 5
  if (mins > 1440) mins = 1440
  customMinutes.value = mins
  selectPreset(mins * 60)
}

function closePicker(): void {
  showPicker.value = false
}
</script>

<style scoped lang="scss" src="./css/RefreshCountdownButton.scss"></style>
