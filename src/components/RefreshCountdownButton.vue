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

<style scoped lang="scss">
.rcb-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.refresh-countdown-btn {
  min-width: 108px;
}

/* ── Auto toggle button ── */
.rcb-auto-area {
  position: relative;
}

.rcb-auto-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  position: relative;
  overflow: visible;

  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }

  &.active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.rcb-auto-icon {
  font-size: 15px;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.rcb-auto-ring {
  position: absolute;
  inset: -2px;
  pointer-events: none;

  svg {
    width: 100%;
    height: 100%;
  }
}

/* ── Picker popover ── */
.rcb-picker {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  z-index: 1000;
}

.rcb-picker-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.rcb-picker-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 12px;
}

.rcb-preset {
  padding: 6px 4px;
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }

  &.active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary);
    color: #fff;
  }
}

.rcb-picker-custom {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;

  label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  input {
    flex: 1;
    height: 28px;
    padding: 0 8px;
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
    background: var(--el-bg-color);
    color: var(--el-text-color-primary);
    font-size: 12px;
    outline: none;

    &:focus {
      border-color: var(--el-color-primary);
    }
  }
}

.rcb-apply {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--el-color-primary);
  background: var(--el-color-primary);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover { opacity: 0.85; }
}

.rcb-picker-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color);
  font-size: 12px;
  color: var(--el-text-color-secondary);
  gap: 8px;
}

.rcb-stop {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--el-color-danger);
  background: transparent;
  color: var(--el-color-danger);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;

  &:hover { background: var(--el-color-danger-light-9); }
}

.rcb-start {
  padding: 5px 14px;
  border-radius: 6px;
  border: none;
  background: var(--el-color-success);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.15s;
  width: 100%;

  &:hover { opacity: 0.85; }
}

/* ── Transition ── */
.rcb-pop-enter-active,
.rcb-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s cubic-bezier(.4,0,.2,1);
}
.rcb-pop-enter-from,
.rcb-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
