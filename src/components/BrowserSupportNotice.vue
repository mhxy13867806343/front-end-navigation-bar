<script setup lang="ts">
import type { ComputedRef, Ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const goToWeather = (): void => {
  router.push('/weather')
}
const goToMingyan = (): void => {
  router.push('/mingyan')
}
const goToPage = (path: string): void => {
  router.push(path)
}
const handleCommand = (command: string): void => {
  if (command === 'openDialog') {
    dialogVisible.value = true
  } else {
    router.push(command)
  }
}
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

    <div class="bar-actions" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
      <!-- 查看详情 下拉菜单 (Element Plus Dropdown split-button) -->
      <el-dropdown split-button type="primary" size="small" @click="dialogVisible = true" @command="handleCommand">
        查看详情
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="openDialog">⚙️ 浏览器兼容性检测</el-dropdown-item>
            <el-dropdown-item command="/xiaomi-shop">🧡 小米商城 (27万行数据)</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 天气预报 下拉菜单 (Element Plus Dropdown split-button) -->
      <el-dropdown split-button type="success" size="small" @click="goToWeather" @command="handleCommand">
        🌦️ 天气预报
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="/weather">🌦️ 实时天气预报看板</el-dropdown-item>
            <el-dropdown-item command="/api-center">💰 统一 API 行情看板</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 名人名言 下拉菜单 (Element Plus Dropdown split-button) -->
      <el-dropdown split-button type="warning" size="small" @click="goToMingyan" @command="handleCommand">
        📜 名人名言
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="/mingyan">📜 经典名人名言语录</el-dropdown-item>
            <el-dropdown-item command="/cocoloop">🌌 CocoLoop 社区</el-dropdown-item>
            <el-dropdown-item command="/cnblogs">📰 博客园新闻</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 异常/状态页 下拉菜单 (Element Plus Dropdown) -->
      <el-dropdown @command="handleCommand" trigger="click">
        <el-button type="danger" plain size="small">
          🚫 异常/状态页 ▾
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="/200">✅ 200 访问正常</el-dropdown-item>
            <el-dropdown-item command="/401">🔑 401 未授权访问</el-dropdown-item>
            <el-dropdown-item command="/402">💎 402 需要付费订阅</el-dropdown-item>
            <el-dropdown-item command="/403">🛡️ 403 禁止/无权访问</el-dropdown-item>
            <el-dropdown-item command="/404">🚀 404 页面未找到</el-dropdown-item>
            <el-dropdown-item command="/405">⚡ 405 方法不受允许</el-dropdown-item>
            <el-dropdown-item command="/500">🔥 500 服务器错误</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 权限与日志 下拉菜单 (Element Plus Dropdown) -->
      <el-dropdown @command="handleCommand" trigger="click">
        <el-button type="info" plain size="small">
          🔐 权限与日志 ▾
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="/permission">🔐 权限控制中心</el-dropdown-item>
            <el-dropdown-item command="/logs">📜 实时系统日志</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

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

<style scoped lang="scss" src="./css/BrowserSupportNotice.scss"></style>
