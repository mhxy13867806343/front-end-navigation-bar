<template>
  <div class="helloworld-page">
    <div class="page-inner">
      <nav class="sort-tabs">
        <a
          v-for="tab in sortTabs"
          :key="tab.value"
          href="javascript:;"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >{{ tab.label }}</a>
        <div class="tabs-right">
          <button class="refresh-btn" :disabled="loading" @click="fetchHomeData">
            {{ loading ? '刷新中...' : '刷新' }}
          </button>
        </div>
      </nav>

      <div v-if="activeTab === 'articles'" class="tag-bar">
        <a
          href="javascript:;"
          :class="{ active: !activeTag }"
          @click="activeTag = ''"
        >全部</a>
        <a
          v-for="tag in tags"
          :key="tag"
          href="javascript:;"
          :class="{ active: activeTag === tag }"
          @click="activeTag = tag"
        >#{{ tag }}</a>
      </div>

      <div class="source-bar">
        <span>数据源：`/api-helloworld/` 实时抓取首页</span>
        <span v-if="lastUpdated">最近刷新：{{ lastUpdated }}</span>
      </div>

      <div v-if="loading && !hasRenderableData" class="state-block">加载中...</div>
      <div v-else-if="error && !hasRenderableData" class="state-block error">
        {{ error }}
        <a href="javascript:;" @click="fetchHomeData">重试</a>
        <small v-if="parseDebug">{{ parseDebug }}</small>
      </div>

      <template v-else>
        <ul v-if="activeTab === 'articles'" class="article-list">
          <li v-for="item in filteredArticles" :key="item.url" class="article-item">
            <div class="article-main">
              <a class="title" :href="item.url" target="_blank" rel="noopener">{{ item.title }}</a>
              <p class="brief">{{ item.brief }}</p>
              <div class="meta">
                <span class="author">{{ item.author }}</span>
                <span class="dot">·</span>
                <span>{{ item.time }}</span>
                <span class="dot">·</span>
                <span>👁 {{ item.readCount }}</span>
                <span>👍 {{ item.likeCount }}</span>
                <span>💬 {{ item.commentCount }}</span>
              </div>
            </div>
            <img v-if="item.cover" class="cover" :src="item.cover" alt="" loading="lazy" />
          </li>
        </ul>

        <ul v-else-if="activeTab === 'authors'" class="author-list">
          <li v-for="item in authors" :key="item.url" class="author-item">
            <div class="author-main">
              <a class="title" :href="item.url" target="_blank" rel="noopener">{{ item.name }}</a>
              <div class="meta">
                <span class="author">{{ item.job || '暂无职位信息' }}</span>
              </div>
            </div>
            <img v-if="item.avatar" class="avatar" :src="item.avatar" alt="" loading="lazy" />
          </li>
        </ul>

        <ul v-else class="lesson-list">
          <li v-for="item in lessons" :key="item.url" class="article-item">
            <div class="article-main">
              <a class="title" :href="item.url" target="_blank" rel="noopener">{{ item.title }}</a>
              <div class="meta">
                <span>{{ item.price }}</span>
                <span class="dot">·</span>
                <span>{{ item.learnCount }}</span>
              </div>
            </div>
            <img v-if="item.cover" class="cover" :src="item.cover" alt="" loading="lazy" />
          </li>
        </ul>

        <div class="summary-grid">
          <div class="summary-card">
            <h3>技术方向</h3>
            <div class="chip-list">
              <span v-for="item in directions" :key="item" class="chip">{{ item }}</span>
            </div>
          </div>
          <div class="summary-card">
            <h3>编程语言</h3>
            <div class="chip-list">
              <span v-for="item in languages" :key="item" class="chip">{{ item }}</span>
            </div>
          </div>
        </div>

        <div class="load-more">
          <span class="no-more">
            文章 {{ articles.length }} 篇 / 作者 {{ authors.length }} 位 / 课程 {{ lessons.length }} 个
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { requestText } from '@/utils/request'
import $ from 'jquery'
import {
  SORT_TABS,
  API_BASE,
  SITE_ORIGIN,
  ERR_NO_DATA,
  ERR_EMPTY_RESPONSE,
  parseRawHelloWorldHtml,
  checkCategoryTitle
} from '@/vue-pages-text-fn-abc/helloworld'
import type { SortTab } from '@/vue-pages-text-fn-abc/helloworld'

interface HelloArticle {
  title: string
  brief: string
  author: string
  time: string
  readCount: string
  likeCount: string
  commentCount: string
  url: string
  cover: string
}

interface HelloAuthor {
  name: string
  job: string
  url: string
  avatar: string
}

interface HelloLesson {
  title: string
  price: string
  learnCount: string
  url: string
  cover: string
}

interface ParsedHomeData {
  articles: HelloArticle[]
  authors: HelloAuthor[]
  lessons: HelloLesson[]
  tags: string[]
  directions: string[]
  languages: string[]
  debugSummary: string
}

const sortTabs = SORT_TABS

const activeTab = ref<SortTab['value']>('articles')
const activeTag = ref<string>('')
const tags = ref<string[]>([])
const articles = ref<HelloArticle[]>([])
const authors = ref<HelloAuthor[]>([])
const lessons = ref<HelloLesson[]>([])
const directions = ref<string[]>([])
const languages = ref<string[]>([])
const loading = ref<boolean>(false)
const error = ref<string>('')
const parseDebug = ref<string>('')
const lastUpdated = ref<string>('')

const hasRenderableData = computed<number>(() => {
  return articles.value.length || authors.value.length || lessons.value.length
})

const filteredArticles = computed<HelloArticle[]>(() => {
  if (!activeTag.value) return articles.value
  const keyword: string = activeTag.value.toLowerCase()
  return articles.value.filter((item: HelloArticle): boolean => {
    const content: string = `${item.title} ${item.brief}`.toLowerCase()
    return content.includes(keyword)
  })
})

function normalizeText(text: unknown): string {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function toAbsoluteUrl(url: string | undefined): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${SITE_ORIGIN}${url}`
}

function textOf($node: JQuery<HTMLElement>): string {
  return normalizeText($node?.text() || '')
}

function uniqueByUrl<T extends { url: string }>(items: T[]): T[] {
  const seen: Set<string> = new Set()
  return items.filter((item: T): boolean => {
    if (!item.url || seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}

function parseHomeHtml(html: string): ParsedHomeData {
  const rawPrimary = parseRawHelloWorldHtml(html)
  const parsedDocument: Document = new DOMParser().parseFromString(html, 'text/html')
  const $root: JQuery<HTMLElement> = $('<div>')
  $root.html(parsedDocument.body?.innerHTML || html)

  const articleList: HelloArticle[] = $root.find('.blog-item').map((_, element: HTMLElement): HelloArticle => {
    const $item: JQuery<HTMLElement> = $(element)
    const $titleLink: JQuery<HTMLElement> = $item.find('.title').first()
    const nums: string[] = $item.find('.num').map((__, node: HTMLElement): string => textOf($(node))).get()

    return {
      title: textOf($titleLink),
      brief: textOf($item.find('.intro').first()),
      author: textOf($item.find('.name').first()),
      time: textOf($item.find('.time').first()),
      readCount: nums[0] || '0',
      likeCount: nums[1] || '0',
      commentCount: nums[2] || '0',
      url: toAbsoluteUrl($titleLink.attr('href') || ''),
      cover: toAbsoluteUrl($item.find('img.item-right, .item-right img').first().attr('src') || '')
    }
  }).get().filter((item: HelloArticle): boolean => Boolean(item.title && item.url))

  const fallbackArticleList: HelloArticle[] = articleList.length
    ? []
    : uniqueByUrl($root.find('a[href^="/p/"]').map((_, element: HTMLElement): HelloArticle => {
      const $titleLink: JQuery<HTMLElement> = $(element)
      const $container: JQuery<HTMLElement> = $titleLink.closest('.blog-item, .art-list > div, div')
      const nums: string[] = $container.find('.num').map((__, node: HTMLElement): string => textOf($(node))).get()

      return {
        title: textOf($titleLink),
        brief: textOf($container.find('.intro, [class*="intro"]').first()),
        author: textOf($container.find('.name, [class*="name"]').first()),
        time: textOf($container.find('.time, [class*="time"]').first()),
        readCount: nums[0] || '0',
        likeCount: nums[1] || '0',
        commentCount: nums[2] || '0',
        url: toAbsoluteUrl($titleLink.attr('href') || ''),
        cover: toAbsoluteUrl($container.find('img.item-right, .item-right img, img').last().attr('src') || '')
      }
    }).get().filter((item: HelloArticle): boolean => Boolean(item.title && item.url)))

  const authorList: HelloAuthor[] = $root.find('.author-item').map((_, element: HTMLElement): HelloAuthor => {
    const $item: JQuery<HTMLElement> = $(element)
    const $link: JQuery<HTMLElement> = $item.find('.author-info').first()

    return {
      name: textOf($item.find('.name').first()),
      job: textOf($item.find('.count').first()),
      url: toAbsoluteUrl($link.attr('href') || ''),
      avatar: toAbsoluteUrl($item.find('.avatar').first().attr('src') || '')
    }
  }).get().filter((item: HelloAuthor): boolean => Boolean(item.name && item.url))

  const lessonList: HelloLesson[] = $root.find('a[href^="/lesson/detail/"]').map((_, element: HTMLElement): HelloLesson => {
    const $item: JQuery<HTMLElement> = $(element)
    return {
      title: textOf($item.find('h2').first()),
      price: textOf($item.find('.price').first()) || '未知价格',
      learnCount: textOf($item.find('.des span').first()),
      url: toAbsoluteUrl($item.attr('href') || ''),
      cover: toAbsoluteUrl($item.find('img').first().attr('src') || '')
    }
  }).get().filter((item: HelloLesson): boolean => Boolean(item.title && item.url))

  const tagList: string[] = $root.find('.index-tag-item').map((_, element: HTMLElement): string => textOf($(element))).get().filter(Boolean)

  let directionList: string[] = []
  let languageList: string[] = []

  $root.find('.left-body-bar > div').each((_, element: HTMLElement): void => {
    const $group: JQuery<HTMLElement> = $(element)
    const title: string = textOf($group.find('.menu-title').first())
    const values: string[] = $group.find('.name').map((__, node: HTMLElement): string => textOf($(node))).get().filter(Boolean)

    const check = checkCategoryTitle(title)
    if (check.isDirection) {
      directionList = values
    }
    if (check.isLanguage) {
      languageList = values
    }
  })

  return {
    articles: rawPrimary.articles.length
      ? rawPrimary.articles.slice(0, 20)
      : articleList.length
      ? articleList
      : fallbackArticleList.slice(0, 20),
    authors: rawPrimary.authors.length ? rawPrimary.authors : authorList,
    lessons: rawPrimary.lessons.length ? rawPrimary.lessons : lessonList,
    tags: tagList,
    directions: directionList,
    languages: languageList,
    debugSummary: `响应 ${html.length} 字节；raw ${rawPrimary.articles.length}/${rawPrimary.authors.length}/${rawPrimary.lessons.length}；DOM ${articleList.length}/${authorList.length}/${lessonList.length}`
  }
}

async function fetchHomeData(): Promise<void> {
  loading.value = true
  error.value = ''
  parseDebug.value = ''
  const controller: AbortController = new AbortController()
  const timeoutId: number = window.setTimeout((): void => {
    controller.abort()
  }, 12000)

  try {
    const html: string = await requestText(`${API_BASE}/?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        Accept: 'text/html'
      },
      cache: 'no-store',
      signal: controller.signal
    })
    if (!html.trim()) {
      throw new Error(ERR_EMPTY_RESPONSE)
    }

    const parsed: ParsedHomeData = parseHomeHtml(html)

    articles.value = parsed.articles
    authors.value = parsed.authors
    lessons.value = parsed.lessons
    tags.value = parsed.tags
    directions.value = parsed.directions
    languages.value = parsed.languages
    parseDebug.value = parsed.debugSummary

    if (!articles.value.length && !authors.value.length && !lessons.value.length) {
      throw new Error(ERR_NO_DATA)
    }

    lastUpdated.value = new Date().toLocaleString('zh-CN')
  } catch (e: unknown) {
    const message: string = e instanceof DOMException && e.name === 'AbortError'
      ? '请求超时，请稍后重试'
      : e instanceof Error
      ? e.message
      : String(e)
    error.value = `加载失败：${message}`
  } finally {
    window.clearTimeout(timeoutId)
    loading.value = false
  }
}

onMounted((): void => {
  fetchHomeData()
})
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
