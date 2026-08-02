<template>
  <aside
    v-if="loadState !== 'ready'"
    class="anime-mascot-fallback"
    :class="{ error: loadState === 'error' }"
    aria-label="全局二次元看板娘加载状态"
  >
    <span class="mascot-face">ฅ^•ﻌ•^ฅ</span>
    <span>{{ statusText }}</span>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

declare global {
  interface Window {
    initWidget?: (config: Record<string, unknown>) => void
    __HOOKSVUE_LIVE2D_WIDGET_READY__?: boolean
  }
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

const LIVE2D_WIDGET_BASE = `${import.meta.env.BASE_URL}vendor/live2d-widgets/dist/`
const LIVE2D_MODEL_CDN = 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/'
const LIVE2D_STYLE_ID = 'hooksvue-live2d-waifu-style'
const LIVE2D_SCRIPT_ID = 'hooksvue-live2d-waifu-script'

const loadState = ref<LoadState>('idle')

const statusText = computed<string>(() => {
  if (loadState.value === 'error') return '看板娘暂时离线'
  if (loadState.value === 'loading') return '看板娘加载中'
  return '二次元看板娘'
})

function ensureStyle(id: string, href: string): void {
  if (document.getElementById(id)) return

  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

function ensureScript(id: string, src: string): Promise<void> {
  const existingScript = document.getElementById(id) as HTMLScriptElement | null
  if (existingScript) {
    return existingScript.dataset.loaded === 'true'
      ? Promise.resolve()
      : new Promise((resolve, reject): void => {
        existingScript.addEventListener('load', (): void => resolve(), { once: true })
        existingScript.addEventListener('error', (): void => reject(new Error(`加载脚本失败：${src}`)), { once: true })
      })
  }

  return new Promise((resolve, reject): void => {
    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.async = true
    script.defer = true
    script.addEventListener('load', (): void => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', (): void => reject(new Error(`加载脚本失败：${src}`)), { once: true })
    document.body.appendChild(script)
  })
}

async function loadLive2dWidget(): Promise<void> {
  if (window.__HOOKSVUE_LIVE2D_WIDGET_READY__ || document.querySelector('.waifu')) {
    loadState.value = 'ready'
    return
  }

  loadState.value = 'loading'

  try {
    ensureStyle(LIVE2D_STYLE_ID, `${LIVE2D_WIDGET_BASE}waifu.css`)
    await ensureScript(LIVE2D_SCRIPT_ID, `${LIVE2D_WIDGET_BASE}waifu-tips.js`)

    if (typeof window.initWidget !== 'function') {
      throw new Error('initWidget 不存在')
    }

    window.initWidget({
      waifuPath: `${LIVE2D_WIDGET_BASE}waifu-tips.json`,
      cubism2Path: `${LIVE2D_WIDGET_BASE}live2d.min.js`,
      cdnPath: LIVE2D_MODEL_CDN,
      modelId: 1,
      drag: true,
      showToggleAfterQuit: true,
      logLevel: 'error',
      tools: ['photo', 'info', 'quit']
    })

    window.__HOOKSVUE_LIVE2D_WIDGET_READY__ = true
    loadState.value = 'ready'
  } catch (error: unknown) {
    console.warn('Live2D 看板娘加载失败:', error)
    loadState.value = 'error'
  }
}

onMounted((): void => {
  void loadLive2dWidget()
})
</script>

<style scoped lang="scss">
.anime-mascot-fallback {
  position: fixed;
  left: 16px;
  bottom: 18px;
  z-index: 1800;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: min(260px, calc(100vw - 32px));
  padding: 10px 12px;
  border: 1px solid rgba(96, 165, 250, 0.28);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.82);
  color: #dbeafe;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(14px);
  font-size: 12px;
  pointer-events: none;
}

.anime-mascot-fallback.error {
  border-color: rgba(251, 191, 36, 0.38);
  color: #fde68a;
}

.mascot-face {
  color: #93c5fd;
  font-weight: 800;
}

:global(.waifu) {
  left: 16px !important;
  right: auto !important;
  bottom: 0 !important;
  z-index: 1800 !important;
}

:global(.waifu-tool) {
  z-index: 1801 !important;
}

@media (max-width: 768px) {
  :global(.waifu) {
    transform: scale(0.76);
    transform-origin: left bottom;
  }
}
</style>
