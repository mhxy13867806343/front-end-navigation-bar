<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import type { CSSProperties } from 'vue'
import { ElMessage } from 'element-plus'
import 'social-share.js/dist/css/share.min.css'
import { buildShareUrl, type SharePayload, useShareRecords } from '@/composables/useShareRecords'

const props = withDefaults(defineProps<{
  payload: SharePayload
  size?: 'normal' | 'compact'
  label?: string
}>(), {
  size: 'normal',
  label: ''
})

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const popoverStyle = ref<CSSProperties>({})
const { recordShare, copyShareLink } = useShareRecords()

interface ShareLink {
  key: string
  label: string
  href: string
}

const shareUrl = computed(() => buildShareUrl(props.payload.url))

const shareLinks = computed<ShareLink[]>(() => {
  const url = encodeURIComponent(shareUrl.value)
  const title = encodeURIComponent(props.payload.title)
  const description = encodeURIComponent(props.payload.description || props.payload.title)
  const image = encodeURIComponent(props.payload.image || '')
  const source = encodeURIComponent(props.payload.source || 'HOOKSVUE')

  return [
    {
      key: 'weibo',
      label: '微博',
      href: `https://service.weibo.com/share/share.php?url=${url}&title=${title}&pic=${image}`
    },
    {
      key: 'qq',
      label: 'QQ',
      href: `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&source=${source}&desc=${description}&pics=${image}`
    },
    {
      key: 'qzone',
      label: '空间',
      href: `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${url}&title=${title}&desc=${description}&summary=${description}&site=${source}`
    },
    {
      key: 'douban',
      label: '豆瓣',
      href: `https://www.douban.com/share/service?href=${url}&name=${title}&text=${description}&image=${image}`
    }
  ]
})

function removeFloatingListeners(): void {
  window.removeEventListener('resize', handleFloatingUpdate)
  window.removeEventListener('scroll', handleFloatingUpdate, true)
  document.removeEventListener('pointerdown', handleDocumentPointerdown)
}

function closeShare(): void {
  isOpen.value = false
  removeFloatingListeners()
}

function updatePopoverPosition(): void {
  const trigger = triggerRef.value
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const panel = popoverRef.value
  const panelWidth = panel?.offsetWidth || 230
  const panelHeight = panel?.offsetHeight || 112
  const gap = 10
  const margin = 12

  let top = rect.bottom + gap
  if (top + panelHeight > window.innerHeight - margin) {
    top = rect.top - panelHeight - gap
  }
  if (top < margin) {
    top = Math.min(rect.bottom + gap, window.innerHeight - panelHeight - margin)
  }

  let left = rect.right - panelWidth
  left = Math.max(margin, Math.min(left, window.innerWidth - panelWidth - margin))

  popoverStyle.value = {
    position: 'fixed',
    top: `${Math.max(margin, top)}px`,
    left: `${Math.max(margin, left)}px`
  }
}

function handleFloatingUpdate(): void {
  if (!isOpen.value) return
  updatePopoverPosition()
}

function handleDocumentPointerdown(event: PointerEvent): void {
  const target = event.target
  if (!(target instanceof Node)) return
  if (triggerRef.value?.contains(target) || popoverRef.value?.contains(target)) return
  closeShare()
}

function addFloatingListeners(): void {
  window.addEventListener('resize', handleFloatingUpdate)
  window.addEventListener('scroll', handleFloatingUpdate, true)
  document.addEventListener('pointerdown', handleDocumentPointerdown)
}

async function toggleShare(): Promise<void> {
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    removeFloatingListeners()
    return
  }
  recordShare(props.payload)
  await nextTick()
  updatePopoverPosition()
  addFloatingListeners()
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
  window.open(shareUrl.value, '_blank', 'noopener,noreferrer')
}

function openShareLink(link: ShareLink): void {
  recordShare(props.payload)
  window.open(link.href, '_blank', 'noopener,noreferrer')
}

onBeforeUnmount(removeFloatingListeners)
</script>

<template>
  <span class="share-button-wrap" @click.stop>
    <button
      ref="triggerRef"
      type="button"
      class="share-trigger"
      :class="props.size"
      :title="`分享：${props.payload.title}`"
      @click.stop.prevent="toggleShare"
    >
      <span>↗</span>
      <strong v-if="props.label || props.size === 'normal'">{{ props.label || '分享' }}</strong>
    </button>

    <Teleport to="body">
      <span
        v-if="isOpen"
        ref="popoverRef"
        class="share-popover"
        :style="popoverStyle"
        @click.stop
      >
        <span class="share-popover-title">分享：{{ props.payload.title }}</span>
        <span class="sharejs-panel" role="list">
          <button
            v-for="link in shareLinks"
            :key="link.key"
            type="button"
            class="social-share-icon share-link"
            :class="`icon-${link.key}`"
            :title="`分享到${link.label}`"
            @click.stop.prevent="openShareLink(link)"
          >
            <span>{{ link.label }}</span>
          </button>
        </span>
        <span class="share-extra-actions">
          <button type="button" @click.stop.prevent="copyLink">复制链接</button>
          <button type="button" @click.stop.prevent="openLink">打开</button>
        </span>
      </span>
    </Teleport>
  </span>
</template>

<style scoped lang="scss">
.share-button-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
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
  display: grid;
  gap: 10px;
  min-width: 230px;
  max-width: min(320px, calc(100vw - 24px));
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--card-bg);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
  z-index: 3000;
}

.share-popover-title {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 900;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sharejs-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 36px;
}

.share-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(96, 165, 250, 0.34);
  border-radius: 999px;
  color: #bfdbfe;
  background: rgba(96, 165, 250, 0.08);
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
}

.share-link:hover {
  border-color: rgba(96, 165, 250, 0.72);
  background: rgba(96, 165, 250, 0.16);
}

.share-link.icon-weibo {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.42);
  background: rgba(248, 113, 113, 0.09);
}

.share-link.icon-qq,
.share-link.icon-qzone {
  color: #60a5fa;
}

.share-link.icon-douban {
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.42);
  background: rgba(52, 211, 153, 0.09);
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
