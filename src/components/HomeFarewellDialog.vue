<template>
  <n-modal
    v-model:show="showDialog"
    preset="dialog"
    class="home-farewell-dialog"
    :style="dialogStyle"
    :mask-closable="true"
    :closable="true"
    title="再见了，HooksVue"
  >
    <section class="farewell-panel" aria-label="HooksVue 停更通知">
      <div class="farewell-status">
        <div>
          <span>当前时间</span>
          <strong>{{ currentTimeText }}</strong>
        </div>
        <a :href="emailHref" class="mail-link" title="点击给我写信">
          {{ contactEmail }}
        </a>
      </div>

      <n-alert type="info" :bordered="false" class="farewell-notice">
        <template #icon>⌛</template>
        项目已经进入停更归档状态。再见了，后续不再更新；有想法可以直接写信联系我。
      </n-alert>

      <div class="joke-section">
        <div class="joke-heading">
          <div>
            <span>ALAPI 笑话接口</span>
            <strong>列表自动向上滚动</strong>
          </div>
        </div>

        <div class="joke-toolbar" aria-label="笑话列表数量控制">
          <span class="joke-count-label">条数</span>
          <div class="joke-count-presets" aria-label="选择笑话条数">
            <n-button
              v-for="preset in jokeCountPresets"
              :key="preset"
              size="small"
              :type="jokeCount === preset ? 'primary' : 'default'"
              secondary
              @click="setJokeCount(preset)"
            >
              {{ preset }}
            </n-button>
          </div>
          <n-input-number
            v-model:value="jokeCount"
            class="joke-count-input"
            size="small"
            :min="1"
            :max="300"
            :step="1"
            :precision="0"
            placeholder="手动输入"
            aria-label="手动输入笑话条数"
          />
          <n-button size="small" secondary :loading="isLoading" @click="refreshJokes">
            刷新列表
          </n-button>
          <n-button size="small" secondary :disabled="!jokes.length" @click="copyAllJokes">
            复制全部
          </n-button>
        </div>

        <n-spin :show="isLoading">
          <div ref="jokeListRef" class="joke-list" aria-label="笑话列表">
            <article
              v-for="(joke, index) in scrollingJokes"
              :key="`${joke.id}-${index}`"
              class="joke-card"
            >
              <div class="joke-meta">
                <span>{{ joke.time || 'ALAPI' }}</span>
                <n-button text size="small" @click="copyJoke(joke)">
                  复制
                </n-button>
              </div>
              <h4 v-if="joke.title">{{ joke.title }}</h4>
              <p>{{ joke.content }}</p>
            </article>
          </div>
        </n-spin>

        <p v-if="errorText" class="joke-error">{{ errorText }}</p>
        <p v-else-if="copyStatus" class="copy-status">{{ copyStatus }}</p>
      </div>

      <a
        class="dialog-reference"
        href="https://www.naiveui.com/zh-CN/os-theme/components/dialog"
        target="_blank"
        rel="noopener noreferrer"
      >
        Naive UI Dialog 参考
      </a>
    </section>

    <template #action>
      <n-button secondary @click="showDialog = false">
        继续看看
      </n-button>
      <n-button type="primary" @click="handleGoodbye">
        再见了
      </n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import axios from 'axios'
import $ from 'jquery'
import { NAlert, NButton, NInputNumber, NModal, NSpin } from 'naive-ui'
import { resolveApiUrl } from '@/utils/resolveApiUrl'

const props = defineProps<{
  routePath: string
}>()

interface JokeItem {
  id: string
  title: string
  content: string
  time: string
}

type ApiQueryValue = string | number

const isProduction: boolean = import.meta.env.PROD
const contactEmail = '869710179@qq.com'
const emailHref = `mailto:${contactEmail}?subject=${encodeURIComponent('HooksVue 项目联系')}`
const ALAPI_TOKEN: string = import.meta.env.VITE_ALAPI_TOKEN || 'qgqofofvmxtoskffd37omkscobipmn'
const JOKE_API_PATH = '/api-alapi/api/joke'
const dialogStyle = {
  width: 'min(760px, calc(100vw - 32px))'
}

const showDialog = ref<boolean>(false)
const currentTimeText = ref<string>(formatTime(new Date()))
const jokes = ref<JokeItem[]>([])
const jokeCount = ref<number>(40)
const isLoading = ref<boolean>(false)
const errorText = ref<string>('')
const copyStatus = ref<string>('')
const jokeListRef = ref<HTMLElement | null>(null)
const jokeCountPresets = [10, 40, 100]

let clockTimer: number | undefined
let jokeScrollTimer: number | undefined
let copyStatusTimer: number | undefined
let hasRequestedJokes = false

const fallbackJokes: JokeItem[] = [
  {
    id: 'fallback-1',
    title: '停更通知',
    content: '再见了，项目归档后不再更新。欢迎 Fork，欢迎来信。',
    time: '本地兜底'
  },
  {
    id: 'fallback-2',
    title: '写信入口',
    content: `想联系作者，可以点击邮箱 ${contactEmail} 直接打开邮件客户端。`,
    time: '本地兜底'
  },
  {
    id: 'fallback-3',
    title: '笑话接口',
    content: '线上会尝试读取 ALAPI 笑话列表；接口失败时展示这组兜底内容。',
    time: '本地兜底'
  }
]

const scrollingJokes = computed<JokeItem[]>(() => {
  if (jokes.value.length <= 3) return jokes.value
  return [...jokes.value, ...jokes.value]
})

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date)
}

function buildQueryString(params: Record<string, ApiQueryValue>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]: [string, ApiQueryValue]): void => {
    searchParams.set(key, String(value))
  })
  return searchParams.toString()
}

function decodeHtml(value: string): string {
  if (typeof window === 'undefined') return value
  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function resolveJokeArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload

  const record = asRecord(payload)
  if (!record) return []

  for (const key of ['data', 'list', 'items', 'result', 'results']) {
    const nested = resolveJokeArray(record[key])
    if (nested.length) return nested
  }

  return []
}

function toText(value: unknown): string {
  if (value === undefined || value === null) return ''
  return decodeHtml(String(value)).trim()
}

function normalizeJokes(payload: unknown): JokeItem[] {
  return resolveJokeArray(payload)
    .map((entry: unknown, index: number): JokeItem | null => {
      const record = asRecord(entry)
      if (!record) return null

      const content = toText(record.content || record.text || record.joke || record.digest)
      if (!content) return null

      return {
        id: toText(record.id) || `joke-${index}`,
        title: toText(record.title),
        content,
        time: toText(record.time || record.date || record.created_at)
      }
    })
    .filter((item: JokeItem | null): item is JokeItem => Boolean(item))
}

function normalizeJokeCount(value: number | null): number {
  const count = Number(value)
  if (!Number.isFinite(count)) return 40
  return Math.min(300, Math.max(1, Math.trunc(count)))
}

async function loadJokes(): Promise<void> {
  if (isLoading.value) return

  const requestedCount = normalizeJokeCount(jokeCount.value)
  jokeCount.value = requestedCount
  isLoading.value = true
  errorText.value = ''

  try {
    const url = `${resolveApiUrl(JOKE_API_PATH)}?${buildQueryString({
      token: ALAPI_TOKEN,
      page: 1,
      num: requestedCount
    })}`
    const response = await axios.get<unknown>(url)
    const nextJokes = normalizeJokes(response.data).slice(0, requestedCount)
    if (!nextJokes.length) {
      throw new Error('ALAPI 笑话接口没有返回可展示列表')
    }
    jokes.value = nextJokes
  } catch (error: unknown) {
    console.warn('笑话接口加载失败:', error)
    jokes.value = fallbackJokes
    errorText.value = '笑话接口暂时不可用，已展示本地兜底内容。'
  } finally {
    isLoading.value = false
    void nextTick(startJokeScroll)
  }
}

function refreshJokes(): void {
  hasRequestedJokes = true
  void loadJokes()
}

function setJokeCount(count: number): void {
  jokeCount.value = count
  refreshJokes()
}

function stopJokeScroll(): void {
  if (jokeScrollTimer !== undefined) {
    window.clearInterval(jokeScrollTimer)
    jokeScrollTimer = undefined
  }

  const container = jokeListRef.value
  if (container) {
    $(container).stop(true)
  }
}

function startJokeScroll(): void {
  stopJokeScroll()

  const container = jokeListRef.value
  if (!container || jokes.value.length < 2 || !showDialog.value) return

  jokeScrollTimer = window.setInterval((): void => {
    const maxScrollTop = scrollingJokes.value.length > jokes.value.length
      ? Math.max(0, container.scrollHeight / 2)
      : Math.max(0, container.scrollHeight - container.clientHeight)

    if (maxScrollTop <= 0) return

    const nextTop = container.scrollTop + 74
    if (nextTop >= maxScrollTop) {
      $(container).scrollTop(0)
      return
    }

    $(container).stop(true).animate({ scrollTop: nextTop }, 520)
  }, 2200)
}

function showCopyStatus(text: string): void {
  copyStatus.value = text
  if (copyStatusTimer !== undefined) {
    window.clearTimeout(copyStatusTimer)
  }
  copyStatusTimer = window.setTimeout((): void => {
    copyStatus.value = ''
    copyStatusTimer = undefined
  }, 1800)
}

async function writeClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

async function copyJoke(joke: JokeItem): Promise<void> {
  await writeClipboard([joke.title, joke.content, joke.time].filter(Boolean).join('\n'))
  showCopyStatus('已复制这条笑话')
}

async function copyAllJokes(): Promise<void> {
  await writeClipboard(jokes.value.map((joke: JokeItem, index: number): string => {
    return `${index + 1}. ${[joke.title, joke.content, joke.time].filter(Boolean).join(' / ')}`
  }).join('\n'))
  showCopyStatus('已复制全部笑话')
}

function isHomeFarewellRoute(path: string): boolean {
  return path === '/' || path === '/dyform' || path.endsWith('/dyform')
}

function openHomeDialog(): void {
  if (!isProduction || !isHomeFarewellRoute(props.routePath)) return

  showDialog.value = true
  if (!hasRequestedJokes) {
    hasRequestedJokes = true
    void loadJokes()
    return
  }

  void nextTick(startJokeScroll)
}

function handleGoodbye(): void {
  showDialog.value = false
}

watch((): string => props.routePath, (path: string): void => {
  if (isHomeFarewellRoute(path)) {
    openHomeDialog()
    return
  }
  showDialog.value = false
}, { immediate: true })

watch(showDialog, (visible: boolean): void => {
  if (visible) {
    void nextTick(startJokeScroll)
    return
  }
  stopJokeScroll()
})

onMounted((): void => {
  clockTimer = window.setInterval((): void => {
    currentTimeText.value = formatTime(new Date())
  }, 1000)
})

onUnmounted((): void => {
  if (clockTimer !== undefined) window.clearInterval(clockTimer)
  if (copyStatusTimer !== undefined) window.clearTimeout(copyStatusTimer)
  stopJokeScroll()
})
</script>

<style scoped lang="scss">
:deep(.home-farewell-dialog.n-dialog) {
  border: 1px solid rgba(37, 99, 235, 0.16);
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
}

:deep(.home-farewell-dialog .n-dialog__title) {
  font-size: 20px;
  font-weight: 800;
}

.farewell-panel {
  display: grid;
  gap: 16px;
  color: #1f2937;
}

.farewell-status {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.98), rgba(250, 245, 255, 0.92));
}

.farewell-status span,
.joke-heading span {
  display: block;
  margin-bottom: 4px;
  color: #64748b;
  font-size: 12px;
}

.farewell-status strong,
.joke-heading strong {
  color: #0f172a;
  font-size: 18px;
}

.mail-link {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(37, 99, 235, 0.22);
  border-radius: 999px;
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.72);
}

.mail-link:hover {
  border-color: rgba(37, 99, 235, 0.42);
  color: #1d4ed8;
}

.farewell-notice {
  border-radius: 14px;
}

.joke-section {
  display: grid;
  gap: 10px;
}

.joke-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.joke-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.7);
}

.joke-count-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.joke-count-presets {
  display: inline-flex;
  gap: 6px;
  padding: 3px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.05);
}

.joke-count-input {
  width: 112px;
}

.joke-list {
  display: grid;
  gap: 10px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
}

.joke-card {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.86);
}

.joke-card h4 {
  margin: 0;
  color: #0f172a;
  font-size: 15px;
}

.joke-card p {
  margin: 0;
  color: #334155;
  line-height: 1.68;
  user-select: text;
  word-break: break-word;
}

.joke-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #94a3b8;
  font-size: 12px;
}

.joke-error,
.copy-status {
  min-height: 20px;
  margin: 0;
  font-size: 12px;
}

.joke-error {
  color: #dc2626;
}

.copy-status {
  color: #16a34a;
}

.dialog-reference {
  color: #64748b;
  font-size: 12px;
  text-decoration: none;
}

.dialog-reference:hover {
  color: #2563eb;
}

@media (max-width: 640px) {
  .farewell-status {
    grid-template-columns: 1fr;
  }

  .joke-heading,
  .joke-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .joke-count-presets {
    justify-content: center;
  }

  .joke-count-input {
    width: 100%;
  }

  .mail-link {
    justify-content: center;
    width: 100%;
  }

  .joke-list {
    max-height: 220px;
  }
}
</style>
