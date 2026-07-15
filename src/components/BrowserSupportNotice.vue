<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

interface BrowserDownloadLink {
  name: string
  url: string
  vendor: string
}

interface BrowserFeatureCheck {
  label: string
  supported: boolean
}

interface QrImage {
  src: string
  alt: string
}

interface TechStackItem {
  name: string
  value: string
}

interface BrowserSupportNoticeProps {
  autoOpen?: boolean
}

const props: BrowserSupportNoticeProps = withDefaults(defineProps<BrowserSupportNoticeProps>(), {
  autoOpen: true
})

const qrImageModules: Record<string, string> = import.meta.glob('../assets/qc/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url'
}) as Record<string, string>

const browserLinks: BrowserDownloadLink[] = [
  { name: 'Google Chrome', vendor: 'Google', url: 'https://www.google.com/chrome/' },
  { name: 'Microsoft Edge', vendor: 'Microsoft', url: 'https://www.microsoft.com/edge' },
  { name: 'Firefox', vendor: 'Mozilla', url: 'https://www.mozilla.org/firefox/new/' },
  { name: '360 安全浏览器', vendor: '360', url: 'https://browser.360.cn/' },
  { name: 'QQ 浏览器', vendor: 'Tencent', url: 'https://browser.qq.com/' }
]

const techStack: TechStackItem[] = [
  { name: '框架', value: 'Vue 3 + <script setup>' },
  { name: '构建', value: 'Vite + TypeScript' },
  { name: 'UI', value: 'Element Plus / Naive UI' },
  { name: '路由', value: 'Vue Router 4' },
  { name: '数据', value: '本地 JSON + 构建期缓存 + Vite Proxy' }
]

const qrImages: QrImage[] = Object.entries(qrImageModules)
  .sort(([leftPath]: [string, string], [rightPath]: [string, string]): number => leftPath.localeCompare(rightPath))
  .map(([filePath, src]: [string, string], index: number): QrImage => {
    const fileName: string = filePath.split('/').pop() || `qr-${index + 1}`
    return {
      src,
      alt: `二维码 ${index + 1}：${fileName}`
    }
  })

const authorGithubUrl: string = 'https://github.com/mhxy13867806343'
const currentDateTime: Ref<Date> = ref<Date>(new Date())
const dialogVisible: Ref<boolean> = ref<boolean>(false)
let clockTimer: number | null = null

const browserName: ComputedRef<string> = computed<string>((): string => {
  const userAgent: string = navigator.userAgent

  if (/Edg\//.test(userAgent)) return 'Microsoft Edge'
  if (/Chrome\//.test(userAgent) && /Safari\//.test(userAgent)) return 'Google Chrome / Chromium'
  if (/Firefox\//.test(userAgent)) return 'Firefox'
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return 'Safari'
  if (/MSIE|Trident/.test(userAgent)) return 'Internet Explorer'
  return '未知浏览器'
})

const browserFeatures: ComputedRef<BrowserFeatureCheck[]> = computed<BrowserFeatureCheck[]>((): BrowserFeatureCheck[] => {
  return [
    { label: 'Fetch 请求', supported: typeof window.fetch === 'function' },
    { label: 'Promise', supported: typeof window.Promise === 'function' },
    { label: 'URLSearchParams', supported: typeof window.URLSearchParams === 'function' },
    { label: '本地存储', supported: canUseLocalStorage() },
    { label: 'CSS Grid', supported: typeof CSS !== 'undefined' && CSS.supports('display', 'grid') }
  ]
})

const isBrowserUnsupported: ComputedRef<boolean> = computed<boolean>((): boolean => {
  return browserFeatures.value.some((feature: BrowserFeatureCheck): boolean => !feature.supported)
})

const browserStatusText: ComputedRef<string> = computed<string>((): string => {
  if (isBrowserUnsupported.value) {
    return `当前 ${browserName.value} 缺少必要能力，建议更换现代浏览器后访问。`
  }

  return `当前 ${browserName.value} 已通过现代浏览器能力检测。`
})

const browserTagType: ComputedRef<'success' | 'danger'> = computed<'success' | 'danger'>((): 'success' | 'danger' => {
  return isBrowserUnsupported.value ? 'danger' : 'success'
})

const formattedTime: ComputedRef<string> = computed<string>((): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'full',
    timeStyle: 'medium'
  }).format(currentDateTime.value)
})

const yearlyGreeting: ComputedRef<string> = computed<string>((): string => {
  const year: number = currentDateTime.value.getFullYear()
  if (year < 2027) return ''
  return `祝你 ${year} 新的一年快乐，愿这一年继续写出顺手、稳定、漂亮的作品。`
})

function canUseLocalStorage(): boolean {
  try {
    const testKey: string = '__hooksvue_browser_check__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

onMounted((): void => {
  if (props.autoOpen && isBrowserUnsupported.value) {
    dialogVisible.value = true
  }

  clockTimer = window.setInterval((): void => {
    currentDateTime.value = new Date()
  }, 1000)
})

onUnmounted((): void => {
  if (clockTimer !== null) {
    window.clearInterval(clockTimer)
    clockTimer = null
  }
})
</script>

<template>
  <section class="browser-support-bar" :class="{ warning: isBrowserUnsupported }" aria-label="浏览器兼容性提示">
    <div class="bar-copy">
      <span class="bar-dot" aria-hidden="true"></span>
      <div>
        <strong>{{ isBrowserUnsupported ? '浏览器版本过旧' : '浏览器环境正常' }}</strong>
        <span>{{ browserStatusText }}</span>
      </div>
    </div>

    <el-button type="primary" plain size="small" @click="dialogVisible = true">
      查看详情
    </el-button>

    <el-dialog
      v-model="dialogVisible"
      title="浏览器兼容性检测"
      width="min(920px, 92vw)"
      class="browser-support-dialog"
      append-to-body
      destroy-on-close
      align-center
    >
      <div class="dialog-content">
        <div class="notice-status">
          <div>
            <p class="eyebrow">Browser Check</p>
            <h2>{{ isBrowserUnsupported ? '浏览器版本过旧' : '浏览器环境正常' }}</h2>
            <p>{{ browserStatusText }}</p>
          </div>
          <el-tag :type="browserTagType" effect="dark" round>
            {{ browserName }}
          </el-tag>
        </div>

        <div class="feature-list" aria-label="浏览器能力检测结果">
          <span
            v-for="feature in browserFeatures"
            :key="feature.label"
            :class="{ pass: feature.supported, fail: !feature.supported }"
          >
            {{ feature.supported ? '✓' : '!' }} {{ feature.label }}
          </span>
        </div>

        <div class="download-row" aria-label="浏览器下载链接">
          <a
            v-for="browser in browserLinks"
            :key="browser.name"
            :href="browser.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>{{ browser.name }}</strong>
            <span>{{ browser.vendor }}</span>
          </a>
        </div>

        <div class="maintenance-note">
          <strong>兼容性说明</strong>
          <span>本站不再维护 IE、旧版 EdgeHTML 和过旧 WebView 的适配；后续功能会优先面向支持 ES Module、Fetch、CSS Grid 的现代浏览器。</span>
        </div>

        <div v-if="qrImages.length" class="qr-gallery" aria-label="二维码展示">
          <figure v-for="image in qrImages" :key="image.src">
            <img :src="image.src" :alt="image.alt" loading="lazy" />
          </figure>
        </div>

        <div class="notice-footer">
          <div class="time-block">
            <span>当前时间</span>
            <strong>{{ formattedTime }}</strong>
            <em v-if="yearlyGreeting">{{ yearlyGreeting }}</em>
          </div>
          <a class="author-link" :href="authorGithubUrl" target="_blank" rel="noopener noreferrer">
            作者 GitHub：{{ authorGithubUrl }}
          </a>
        </div>

        <div class="stack-list" aria-label="项目技术栈">
          <span v-for="item in techStack" :key="item.name">
            <strong>{{ item.name }}</strong>
            {{ item.value }}
          </span>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="dialogVisible = false">知道了</el-button>
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
.browser-support-bar {
  position: relative;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  min-height: 48px;
  margin-bottom: 18px;
  padding: 10px 14px;
  color: var(--text-color);
  background: color-mix(in srgb, var(--bg-secondary) 88%, transparent);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.browser-support-bar.warning {
  border-color: rgba(255, 88, 88, 0.55);
  background: color-mix(in srgb, var(--bg-secondary) 82%, rgba(255, 88, 88, 0.18));
}

.bar-copy {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.bar-dot {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #14a66b;
  box-shadow: 0 0 12px rgba(20, 166, 107, 0.5);
}

.warning .bar-dot {
  background: #ff5a5f;
  box-shadow: 0 0 12px rgba(255, 90, 95, 0.48);
}

.bar-copy div {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.bar-copy strong {
  font-size: 14px;
}

.bar-copy span:not(.bar-dot) {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-content {
  display: grid;
  gap: 14px;
}

.notice-status {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0;
}

.notice-status h2 {
  margin: 0;
  font-size: 20px;
  line-height: 1.25;
}

.notice-status p:last-child {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-list span {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 9px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
}

.feature-list .pass {
  color: #14a66b;
}

.feature-list .fail {
  color: #ff5a5f;
}

.download-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.download-row a {
  display: flex;
  min-width: 0;
  min-height: 58px;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 10px 12px;
  color: var(--text-color);
  text-decoration: none;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.download-row a:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.download-row strong,
.download-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.download-row strong {
  font-size: 14px;
}

.download-row span {
  color: var(--text-secondary);
  font-size: 12px;
}

.maintenance-note {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--primary-color) 9%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary-color) 24%, transparent);
  border-radius: 8px;
}

.maintenance-note strong {
  color: var(--primary-color);
  white-space: nowrap;
}

.maintenance-note span {
  color: var(--text-secondary);
  font-size: 14px;
}

.qr-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  gap: 12px;
}

.qr-gallery figure {
  display: grid;
  place-items: center;
  min-height: 154px;
  margin: 0;
  padding: 12px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.qr-gallery img {
  display: block;
  width: 100%;
  max-width: 150px;
  aspect-ratio: 1;
  object-fit: contain;
}

.notice-footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.time-block {
  display: grid;
  gap: 4px;
}

.time-block span,
.time-block em {
  color: var(--text-secondary);
  font-size: 13px;
  font-style: normal;
}

.time-block strong {
  font-size: 15px;
}

.author-link {
  color: var(--primary-color);
  font-weight: 700;
  text-decoration: none;
  word-break: break-all;
}

.author-link:hover {
  text-decoration: underline;
}

.stack-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stack-list span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 5px 10px;
  color: var(--text-secondary);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
}

.stack-list strong {
  color: var(--text-color);
}

.dialog-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 980px) {
  .notice-status,
  .notice-footer {
    grid-template-columns: 1fr;
  }

  .download-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .browser-support-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .bar-copy span:not(.bar-dot) {
    white-space: normal;
  }

  .download-row,
  .maintenance-note {
    grid-template-columns: 1fr;
  }

  .qr-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
