<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const copyState = ref<string>('复制链接')

const normalizeTargetPath = (value: unknown): string => {
  const rawValue: string = Array.isArray(value) ? String(value[0] || '') : String(value || '')
  if (!rawValue || !rawValue.startsWith('/') || rawValue.startsWith('//')) return '/'
  if (rawValue === '/h5' || rawValue.startsWith('/h5/')) return '/'
  return rawValue
}

const targetPath = computed<string>(() => normalizeTargetPath(route.query.target))
const desktopUrl = computed<string>(() => {
  const resolved = router.resolve(targetPath.value)
  return new URL(resolved.href, window.location.origin).href
})

const copyDesktopUrl = async (): Promise<void> => {
  copyState.value = '复制中'

  try {
    await navigator.clipboard.writeText(desktopUrl.value)
    copyState.value = '已复制'
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = desktopUrl.value
    textArea.setAttribute('readonly', 'true')
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copyState.value = '已复制'
  }

  window.setTimeout(() => {
    copyState.value = '复制链接'
  }, 1800)
}

const selectDesktopUrl = (event: FocusEvent): void => {
  const input = event.target as HTMLInputElement | null
  input?.select()
}

const openOnCurrentDevice = (): void => {
  try {
    sessionStorage.setItem('front_end_navigation_allow_mobile_page', '1')
  } catch {
    // Ignore storage failures and let the router keep its normal mobile guard.
  }

  router.push(targetPath.value)
}
</script>

<template>
  <main class="h5-desktop-link">
    <section class="h5-card">
      <p class="h5-kicker">移动端访问提示</p>
      <h1>请复制链接到电脑打开</h1>
      <p class="h5-summary">
        当前页面更适合桌面端浏览和操作。复制下面的链接，在电脑浏览器中打开即可继续使用。
      </p>

      <label class="h5-link-box">
        <span>电脑端链接</span>
        <input :value="desktopUrl" readonly @focus="selectDesktopUrl">
      </label>

      <div class="h5-actions">
        <button type="button" class="primary" @click="copyDesktopUrl">
          {{ copyState }}
        </button>
        <button type="button" @click="openOnCurrentDevice">
          仍然打开
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.h5-desktop-link {
  min-height: calc(100dvh - 45px);
  display: grid;
  place-items: center;
  padding: 28px 18px;
  background: #0f1017;
  color: #f5f7ff;
}

.h5-card {
  width: min(100%, 520px);
  padding: 26px;
  border: 1px solid rgba(124, 131, 255, 0.32);
  border-radius: 12px;
  background: #1a1b25;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.34);
}

.h5-kicker {
  margin: 0 0 10px;
  color: #8f96ff;
  font-size: 13px;
  font-weight: 900;
}

.h5-card h1 {
  margin: 0 0 12px;
  font-size: 28px;
  line-height: 1.2;
  letter-spacing: 0;
}

.h5-summary {
  margin: 0 0 22px;
  color: #b9bfd4;
  line-height: 1.7;
}

.h5-link-box {
  display: grid;
  gap: 8px;
}

.h5-link-box span {
  color: #dfe4ff;
  font-size: 13px;
  font-weight: 800;
}

.h5-link-box input {
  width: 100%;
  min-width: 0;
  height: 46px;
  padding: 0 12px;
  color: #f5f7ff;
  background: #11121a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  font-size: 13px;
}

.h5-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 18px;
}

.h5-actions button {
  height: 44px;
  color: #dfe4ff;
  font-weight: 900;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  cursor: pointer;
}

.h5-actions .primary {
  color: #ffffff;
  background: #6c72f7;
  border-color: #6c72f7;
}
</style>
