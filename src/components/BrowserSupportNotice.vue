<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { ElMessage } from 'element-plus'
import packageJson from '../../package.json'

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
  packageName: string
  version: string
  url: string
  group: string
}

interface PackageMetadata {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
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

const packageMetadata: PackageMetadata = packageJson as PackageMetadata
const packageVersions: Record<string, string> = {
  ...packageMetadata.dependencies,
  ...packageMetadata.devDependencies
}

const techStack: TechStackItem[] = [
  { name: 'Vue', packageName: 'vue', version: getPackageVersion('vue'), url: 'https://vuejs.org/', group: '框架' },
  { name: 'Vue Router', packageName: 'vue-router', version: getPackageVersion('vue-router'), url: 'https://router.vuejs.org/', group: '路由' },
  { name: 'Vite', packageName: 'vite', version: getPackageVersion('vite'), url: 'https://vite.dev/', group: '构建' },
  { name: 'TypeScript', packageName: 'typescript', version: getPackageVersion('typescript'), url: 'https://www.typescriptlang.org/', group: '语言' },
  { name: 'Element Plus', packageName: 'element-plus', version: getPackageVersion('element-plus'), url: 'https://element-plus.org/zh-CN/', group: 'UI' },
  { name: 'Naive UI', packageName: 'naive-ui', version: getPackageVersion('naive-ui'), url: 'https://www.naiveui.com/', group: 'UI' },
  { name: 'ECharts', packageName: 'echarts', version: getPackageVersion('echarts'), url: 'https://echarts.apache.org/', group: '图表' },
  { name: 'Axios', packageName: 'axios', version: getPackageVersion('axios'), url: 'https://axios-http.com/', group: '请求' },
  { name: 'CropperJS', packageName: 'cropperjs', version: getPackageVersion('cropperjs'), url: 'https://fengyuanchen.github.io/cropperjs/', group: '图片' },
  { name: 'Vue TSC', packageName: 'vue-tsc', version: getPackageVersion('vue-tsc'), url: 'https://github.com/vuejs/language-tools', group: '校验' },
  { name: 'Auto Import', packageName: 'unplugin-auto-import', version: getPackageVersion('unplugin-auto-import'), url: 'https://github.com/unplugin/unplugin-auto-import', group: '工程化' },
  { name: 'Vuedraggable', packageName: 'vuedraggable', version: getPackageVersion('vuedraggable'), url: 'https://github.com/SortableJS/vue.draggable.next', group: '交互' }
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
const closeTipStorageKey: string = 'hooksvue-browser-dialog-close-tip-shown'
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

function getPackageVersion(packageName: string): string {
  const rawVersion: string = packageVersions[packageName] || '未安装'
  return rawVersion.replace(/^[~^]/, '')
}

function showCloseTipOnce(): void {
  try {
    if (window.localStorage.getItem(closeTipStorageKey)) return

    ElMessage.info('已关闭二维码与兼容性说明，下次关闭时不会再提示。')
    window.localStorage.setItem(closeTipStorageKey, '1')
  } catch {
    ElMessage.info('已关闭二维码与兼容性说明。')
  }
}

function closeDialog(): void {
  showCloseTipOnce()
  dialogVisible.value = false
}

function handleDialogBeforeClose(done: () => void): void {
  showCloseTipOnce()
  done()
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
      :before-close="handleDialogBeforeClose"
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
          <a
            v-for="item in techStack"
            :key="item.packageName"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            :title="`${item.name} 官网`"
          >
            <em>{{ item.group }}</em>
            <strong>{{ item.name }} {{ item.version }}</strong>
            <span>{{ item.packageName }}</span>
          </a>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <el-button @click="closeDialog">关闭</el-button>
          <el-button type="primary" @click="closeDialog">知道了</el-button>
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.stack-list a {
  display: grid;
  min-width: 0;
  gap: 3px;
  min-height: 70px;
  padding: 10px 12px;
  color: var(--text-secondary);
  text-decoration: none;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  transition: border-color 0.2s ease, transform 0.2s ease, color 0.2s ease;
}

.stack-list a:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.stack-list em {
  color: var(--primary-color);
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
}

.stack-list strong {
  overflow: hidden;
  color: var(--text-color);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stack-list span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
