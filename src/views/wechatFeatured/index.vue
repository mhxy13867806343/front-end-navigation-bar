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

<style scoped lang="scss" src="./css/index.scss"></style>
