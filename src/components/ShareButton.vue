<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import 'social-share.js/dist/css/share.min.css'
import 'social-share.js/dist/js/social-share.min.js'
import { buildShareUrl, type SharePayload, useShareRecords } from '@/composables/useShareRecords'

declare global {
  interface Window {
    socialShare?: (elem: Element, options: Record<string, unknown>) => void
  }
}

const props = withDefaults(defineProps<{
  payload: SharePayload
  size?: 'normal' | 'compact'
  label?: string
}>(), {
  size: 'normal',
  label: ''
})

const isOpen = ref(false)
const sharePanelRef = ref<HTMLElement | null>(null)
const { recordShare, copyShareLink } = useShareRecords()

function initSharePanel(): void {
  const panel = sharePanelRef.value
  if (!panel || typeof window === 'undefined' || !window.socialShare) return
  panel.innerHTML = ''
  ;(panel as HTMLElement & { initialized?: boolean }).initialized = false
  window.socialShare(panel, {
    url: buildShareUrl(props.payload.url),
    title: props.payload.title,
    description: props.payload.description || props.payload.title,
    image: props.payload.image || '',
    source: props.payload.source || 'HOOKSVUE',
    sites: ['wechat', 'weibo', 'qq', 'qzone', 'douban']
  })
}

async function toggleShare(): Promise<void> {
  isOpen.value = !isOpen.value
  if (!isOpen.value) return
  recordShare(props.payload)
  await nextTick()
  initSharePanel()
}

async function copyLink(): Promise<void> {
  try {
    await copyShareLink(props.payload)
  } catch {
    ElMessage({ message: '复制失败，请手动复制链接', type: 'error', duration: 1200 })
  }
}

function openLink(): void {
  recordShare(props.payload)
  window.open(buildShareUrl(props.payload.url), '_blank', 'noopener,noreferrer')
}

watch(() => props.payload, () => {
  if (isOpen.value) {
    void nextTick(initSharePanel)
  }
}, { deep: true })
</script>

<template>
  <span class="share-button-wrap" @click.stop>
    <button
      type="button"
      class="share-trigger"
      :class="props.size"
      :title="`分享：${props.payload.title}`"
      @click.stop.prevent="toggleShare"
    >
      <span>↗</span>
      <strong v-if="props.label || props.size === 'normal'">{{ props.label || '分享' }}</strong>
    </button>

    <span v-if="isOpen" class="share-popover">
      <span ref="sharePanelRef" class="sharejs-panel"></span>
      <span class="share-extra-actions">
        <button type="button" @click.stop.prevent="copyLink">复制链接</button>
        <button type="button" @click.stop.prevent="openLink">打开</button>
      </span>
    </span>
  </span>
</template>

<style scoped lang="scss">
.share-button-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  z-index: 5;
}

.share-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 42px;
  height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(59, 130, 246, 0.42);
  border-radius: 999px;
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.08);
  font-weight: 900;
  letter-spacing: 0;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.share-trigger:hover {
  transform: translateY(-1px) scale(1.04);
  border-color: rgba(59, 130, 246, 0.78);
  background: rgba(59, 130, 246, 0.18);
}

.share-trigger.compact {
  min-width: 34px;
  width: 34px;
  height: 34px;
  padding: 0;
  font-size: 15px;
}

.share-trigger span {
  line-height: 1;
}

.share-trigger strong {
  font-size: 14px;
}

.share-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  display: grid;
  gap: 10px;
  min-width: 230px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--card-bg);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.sharejs-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 36px;
}

.share-extra-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.share-extra-actions button {
  min-height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.04);
  font-weight: 800;
  cursor: pointer;
}

:deep(.social-share-icon) {
  margin: 0;
}
</style>
