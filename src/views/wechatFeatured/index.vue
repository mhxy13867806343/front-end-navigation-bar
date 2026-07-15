<script setup lang="ts">
import wechatFeaturedArticles from '@/ajson/wechat-featured-articles.json'
import { useRoute, useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'

type ArticleSlug = 'frontend-utils' | 'animejs-v4'

interface FeaturedArticle {
  slug: ArticleSlug
  title: string
  link: string
  desc: string
  source: string
  tags: string[]
}

interface FeaturedArticleGroup {
  date: string
  items: FeaturedArticle[]
}

interface JsonParseResult {
  ok: boolean
  message: string
}

interface DemoStat {
  label: string
  value: string
}

const route: RouteLocationNormalizedLoaded = useRoute()
const router: Router = useRouter()

const articleGroups: FeaturedArticleGroup[] = wechatFeaturedArticles as FeaturedArticleGroup[]
const articles: FeaturedArticle[] = articleGroups.flatMap((group: FeaturedArticleGroup): FeaturedArticle[] => group.items)
const fallbackSlug: ArticleSlug = 'frontend-utils'

const activeSlug = ref<ArticleSlug>(
  articles.some((item: FeaturedArticle): boolean => item.slug === route.query.article)
    ? route.query.article as ArticleSlug
    : fallbackSlug
)

const selectedArticle = computed<FeaturedArticle>(() => {
  return articles.find((item: FeaturedArticle): boolean => item.slug === activeSlug.value) || articles[0]
})

const selectArticle = (slug: ArticleSlug): void => {
  activeSlug.value = slug
  router.replace({
    path: '/wechat-featured',
    query: { article: slug }
  })
}

const openOriginalArticle = (url: string): void => {
  window.open(url, '_blank')
}

const formatDate = (date: Date, pattern: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  const pad = (value: number): string => String(value).padStart(2, '0')
  const tokens: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds())
  }

  return Object.entries(tokens).reduce((result: string, [token, value]: [string, string]): string => {
    return result.replace(token, value)
  }, pattern)
}

function debounce<TArgs extends unknown[]>(callback: (...args: TArgs) => void, delay: number): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: TArgs): void => {
    if (timer) clearTimeout(timer)
    timer = setTimeout((): void => callback(...args), delay)
  }
}

const safeJsonParse = (value: string): JsonParseResult => {
  try {
    JSON.parse(value)
    return {
      ok: true,
      message: '解析成功，这段 JSON 可以安全进入业务逻辑。'
    }
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : String(error)
    return {
      ok: false,
      message: `解析失败：${message}`
    }
  }
}

const uniqueArray = (value: string): string[] => {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((item: string): string => item.trim())
        .filter(Boolean)
    )
  )
}

const classNames = (items: Record<string, boolean>): string => {
  return Object.entries(items)
    .filter(([, enabled]: [string, boolean]): boolean => enabled)
    .map(([name]: [string, boolean]): string => name)
    .join(' ')
}

const liveSearchInput = ref<string>('HooksVue')
const debouncedSearchText = ref<string>('HooksVue')
const jsonText = ref<string>('{"name":"HooksVue","stack":["Vue","TypeScript","Vite"]}')
const jsonResult = ref<JsonParseResult>(safeJsonParse(jsonText.value))
const arrayInput = ref<string>('vue, ts, vue, vite, hooks, ts, element-plus')
const classPrimary = ref<boolean>(true)
const classRounded = ref<boolean>(true)
const classShadow = ref<boolean>(false)
const animationSeed = ref<number>(0)
const speedMode = ref<'calm' | 'fast'>('calm')

const debouncedUpdateSearch = debounce<[string]>((value: string): void => {
  debouncedSearchText.value = value
}, 500)

const handleSearchInput = (): void => {
  debouncedUpdateSearch(liveSearchInput.value)
}

const parseCurrentJson = (): void => {
  jsonResult.value = safeJsonParse(jsonText.value)
}

const utilityStats = computed<DemoStat[]>((): DemoStat[] => [
  {
    label: '日期格式化',
    value: formatDate(new Date())
  },
  {
    label: '数组去重',
    value: uniqueArray(arrayInput.value).join(' / ')
  },
  {
    label: '条件类名',
    value: classNames({
      'btn-primary': classPrimary.value,
      'btn-rounded': classRounded.value,
      'btn-shadow': classShadow.value
    }) || '暂无启用类名'
  }
])

const animeFeatureStats: DemoStat[] = [
  { label: 'Stagger', value: '网格元素按延迟依次入场' },
  { label: 'Spring', value: '弹性缩放与回弹反馈' },
  { label: 'Text Split', value: '文字逐字拆分动画' },
  { label: 'FLIP / Scroll', value: '卡片位移、滚动视差和布局切换' }
]

const replayAnimations = (): void => {
  animationSeed.value += 1
}

const downloadDemoText = (): void => {
  const content: string = `HooksVue utils demo\n${utilityStats.value.map((item: DemoStat): string => `${item.label}: ${item.value}`).join('\n')}`
  const blob: Blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url: string = URL.createObjectURL(blob)
  const link: HTMLAnchorElement = document.createElement('a')
  link.href = url
  link.download = 'hooksvue-utils-demo.txt'
  link.click()
  URL.revokeObjectURL(url)
}

watch(() => route.query.article, (nextArticle: unknown): void => {
  if (articles.some((item: FeaturedArticle): boolean => item.slug === nextArticle)) {
    activeSlug.value = nextArticle as ArticleSlug
  }
})
</script>

<template>
  <main class="wechat-featured-page">
    <section class="hero-band">
      <div>
        <p class="eyebrow">WeChat Featured Lab</p>
        <h1>公众号精选实验页</h1>
        <p class="hero-desc">
          这里保留两篇公众号文章入口，同时把文章里的关键思路做成可以直接看的页面效果。
        </p>
      </div>
      <div class="hero-actions">
        <button
          v-for="article in articles"
          :key="article.slug"
          class="article-switch"
          :class="{ active: activeSlug === article.slug }"
          type="button"
          @click="selectArticle(article.slug)"
        >
          {{ article.slug === 'frontend-utils' ? '工具函数效果' : 'Anime.js 效果' }}
        </button>
      </div>
    </section>

    <section class="article-summary-panel">
      <div>
        <p class="source-line">{{ selectedArticle.source }}</p>
        <h2>{{ selectedArticle.title }}</h2>
        <p>{{ selectedArticle.desc }}</p>
        <div class="tag-row">
          <span v-for="tag in selectedArticle.tags" :key="tag"># {{ tag }}</span>
        </div>
      </div>
      <button class="original-link" type="button" @click="openOriginalArticle(selectedArticle.link)">
        打开公众号原文
      </button>
    </section>

    <section v-if="activeSlug === 'frontend-utils'" class="demo-grid">
      <div class="demo-card span-2">
        <div class="demo-card-head">
          <span>01</span>
          <h3>防抖搜索</h3>
        </div>
        <input
          v-model="liveSearchInput"
          class="demo-input"
          placeholder="快速输入内容，下面会延迟更新"
          @input="handleSearchInput"
        />
        <div class="result-box">
          <span>实时输入：{{ liveSearchInput }}</span>
          <strong>防抖结果：{{ debouncedSearchText }}</strong>
        </div>
      </div>

      <div class="demo-card">
        <div class="demo-card-head">
          <span>02</span>
          <h3>安全 JSON 解析</h3>
        </div>
        <textarea v-model="jsonText" class="demo-textarea" @input="parseCurrentJson"></textarea>
        <p class="parse-result" :class="{ ok: jsonResult.ok }">{{ jsonResult.message }}</p>
      </div>

      <div class="demo-card">
        <div class="demo-card-head">
          <span>03</span>
          <h3>数组去重</h3>
        </div>
        <input v-model="arrayInput" class="demo-input" />
        <div class="chips">
          <span v-for="item in uniqueArray(arrayInput)" :key="item">{{ item }}</span>
        </div>
      </div>

      <div class="demo-card span-2">
        <div class="demo-card-head">
          <span>04</span>
          <h3>条件类名 + 日期格式化 + 文件下载</h3>
        </div>
        <div class="toggle-row">
          <label><input v-model="classPrimary" type="checkbox" /> primary</label>
          <label><input v-model="classRounded" type="checkbox" /> rounded</label>
          <label><input v-model="classShadow" type="checkbox" /> shadow</label>
        </div>
        <div class="stat-grid">
          <div v-for="stat in utilityStats" :key="stat.label">
            <span>{{ stat.label }}</span>
            <strong>{{ stat.value }}</strong>
          </div>
        </div>
        <button class="primary-command" type="button" @click="downloadDemoText">下载当前演示结果</button>
      </div>
    </section>

    <section v-else class="anime-lab">
      <div class="anime-toolbar">
        <div>
          <h2>动画效果实验台</h2>
          <p>用页面交互还原文章提到的 stagger、spring、文本拆分和布局动画感觉。</p>
        </div>
        <div class="toolbar-actions">
          <button
            class="mode-btn"
            :class="{ active: speedMode === 'calm' }"
            type="button"
            @click="speedMode = 'calm'"
          >
            平滑
          </button>
          <button
            class="mode-btn"
            :class="{ active: speedMode === 'fast' }"
            type="button"
            @click="speedMode = 'fast'"
          >
            快速
          </button>
          <button class="primary-command" type="button" @click="replayAnimations">重播动画</button>
        </div>
      </div>

      <div :key="animationSeed" class="animation-stage" :class="speedMode">
        <div class="stagger-grid" aria-label="stagger animation grid">
          <span v-for="index in 24" :key="index" :style="{ '--i': index - 1 }"></span>
        </div>
        <div class="spring-orbit">
          <div class="orbit-core">V4</div>
        </div>
        <h3 class="split-title">
          <span
            v-for="(letter, index) in 'ANIMEJS'.split('')"
            :key="`${letter}-${index}`"
            :style="{ '--i': index }"
          >
            {{ letter }}
          </span>
        </h3>
      </div>

      <div class="anime-feature-grid">
        <div v-for="stat in animeFeatureStats" :key="stat.label" class="feature-card">
          <span>{{ stat.label }}</span>
          <strong>{{ stat.value }}</strong>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.wechat-featured-page {
  min-height: 100vh;
  padding: 72px clamp(18px, 4vw, 72px);
  color: #f3f5ff;
  background:
    radial-gradient(circle at 18% 12%, rgba(103, 98, 255, 0.28), transparent 30%),
    radial-gradient(circle at 82% 18%, rgba(25, 211, 164, 0.16), transparent 28%),
    #090b12;
}

.hero-band,
.article-summary-panel,
.demo-card,
.anime-lab {
  border: 1px solid rgba(132, 140, 255, 0.22);
  background: rgba(16, 18, 28, 0.82);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
}

.hero-band {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 36px;
  border-radius: 18px;
}

.eyebrow,
.source-line {
  margin: 0 0 10px;
  color: #7b82ff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
}

.hero-band h1,
.article-summary-panel h2,
.anime-toolbar h2 {
  margin: 0;
  font-size: clamp(28px, 4vw, 54px);
  line-height: 1.06;
}

.hero-desc,
.article-summary-panel p,
.anime-toolbar p {
  margin: 14px 0 0;
  color: rgba(243, 245, 255, 0.68);
  line-height: 1.7;
}

.hero-actions,
.toolbar-actions,
.toggle-row,
.tag-row,
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.article-switch,
.mode-btn,
.original-link,
.primary-command {
  border: 1px solid rgba(123, 130, 255, 0.42);
  border-radius: 10px;
  padding: 10px 16px;
  color: #f3f5ff;
  background: rgba(255, 255, 255, 0.06);
  font-weight: 800;
  cursor: pointer;
}

.article-switch.active,
.mode-btn.active,
.primary-command,
.original-link {
  background: #6268ff;
  border-color: #7c82ff;
}

.article-summary-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: 22px;
  padding: 28px;
  border-radius: 16px;
}

.tag-row {
  margin-top: 16px;
}

.tag-row span,
.chips span {
  border: 1px solid rgba(123, 130, 255, 0.34);
  border-radius: 999px;
  padding: 5px 10px;
  color: #9ca1ff;
  background: rgba(98, 104, 255, 0.1);
  font-size: 13px;
  font-weight: 800;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 22px;
}

.demo-card {
  padding: 24px;
  border-radius: 14px;
}

.span-2 {
  grid-column: span 2;
}

.demo-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.demo-card-head span {
  color: #1bd6a3;
  font-weight: 900;
}

.demo-card-head h3 {
  margin: 0;
}

.demo-input,
.demo-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  padding: 12px 14px;
  color: #f3f5ff;
  background: rgba(0, 0, 0, 0.22);
  outline: none;
}

.demo-textarea {
  min-height: 120px;
  resize: vertical;
}

.result-box,
.stat-grid {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.result-box,
.stat-grid div,
.feature-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.result-box strong,
.stat-grid strong,
.feature-card strong {
  display: block;
  margin-top: 5px;
  color: #fff;
}

.parse-result {
  margin: 12px 0 0;
  color: #ff7777;
}

.parse-result.ok {
  color: #1bd6a3;
}

.anime-lab {
  margin-top: 22px;
  padding: 28px;
  border-radius: 16px;
}

.anime-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}

.animation-stage {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 26px;
  align-items: center;
  min-height: 360px;
  margin-top: 24px;
  border-radius: 16px;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(98, 104, 255, 0.12), rgba(27, 214, 163, 0.08)),
    rgba(0, 0, 0, 0.24);
}

.stagger-grid {
  display: grid;
  grid-template-columns: repeat(6, 42px);
  gap: 12px;
  justify-content: center;
}

.stagger-grid span {
  width: 42px;
  aspect-ratio: 1;
  border-radius: 10px;
  background: linear-gradient(135deg, #6268ff, #1bd6a3);
  animation: square-pop 1.4s cubic-bezier(.2, .9, .18, 1.25) both;
  animation-delay: calc(var(--i) * 45ms);
}

.animation-stage.fast .stagger-grid span {
  animation-duration: 0.82s;
  animation-delay: calc(var(--i) * 24ms);
}

.spring-orbit {
  position: relative;
  width: 180px;
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  animation: orbit-spin 4.8s linear infinite;
}

.orbit-core {
  position: absolute;
  inset: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #090b12;
  background: #f3f5ff;
  font-size: 34px;
  font-weight: 900;
  animation: spring-bounce 1.4s cubic-bezier(.2, 1.35, .35, 1) both;
}

.split-title {
  position: absolute;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  margin: 0;
  font-size: clamp(34px, 6vw, 72px);
}

.split-title span {
  display: inline-block;
  color: #f3f5ff;
  animation: letter-rise 1s ease both;
  animation-delay: calc(var(--i) * 85ms);
}

.anime-feature-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.feature-card span {
  color: #9ca1ff;
  font-weight: 900;
}

@keyframes square-pop {
  from {
    opacity: 0;
    transform: translateY(30px) rotate(-18deg) scale(0.55);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(0) scale(1);
  }
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes spring-bounce {
  0% {
    transform: scale(0.35) rotate(-20deg);
  }
  65% {
    transform: scale(1.18) rotate(8deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

@keyframes letter-rise {
  from {
    opacity: 0;
    transform: translateY(36px) rotateX(70deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

@media (max-width: 900px) {
  .hero-band,
  .article-summary-panel,
  .anime-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .demo-grid,
  .anime-feature-grid,
  .animation-stage {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }
}
</style>
