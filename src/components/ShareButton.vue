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

<style scoped lang="scss" src="./css/ShareButton.scss"></style>
