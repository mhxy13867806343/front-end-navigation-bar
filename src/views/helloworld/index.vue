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

function parseHomeHtml(html: string): ParsedHomeData {
  const nodes: Node[] = $.parseHTML(html, document, false) || []
  const $root: JQuery<HTMLElement> = $('<div>')
  const rootElement: HTMLElement | undefined = $root.get(0)
  nodes.forEach((node: Node): void => {
    rootElement?.appendChild(node)
  })

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
      cover: toAbsoluteUrl($item.find('.item-right').first().attr('src') || '')
    }
  }).get().filter((item: HelloArticle): boolean => Boolean(item.title && item.url))

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
    articles: articleList,
    authors: authorList,
    lessons: lessonList,
    tags: tagList,
    directions: directionList,
    languages: languageList
  }
}

async function fetchHomeData(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const html: string = await requestText(`${API_BASE}/`, {
      method: 'GET',
      headers: {
        Accept: 'text/html'
      },
      cache: 'no-store'
    })
    const parsed: ParsedHomeData = parseHomeHtml(html)

    articles.value = parsed.articles
    authors.value = parsed.authors
    lessons.value = parsed.lessons
    tags.value = parsed.tags
    directions.value = parsed.directions
    languages.value = parsed.languages

    if (!articles.value.length && !authors.value.length && !lessons.value.length) {
      throw new Error(ERR_NO_DATA)
    }

    lastUpdated.value = new Date().toLocaleString('zh-CN')
  } catch (e: unknown) {
    const message: string = e instanceof Error ? e.message : String(e)
    error.value = `加载失败：${message}`
  } finally {
    loading.value = false
  }
}

onMounted((): void => {
  fetchHomeData()
})
</script>

<style scoped>
.helloworld-page {
  min-height: 100%;
  background: #f4f5f5;
  color: #252933;
  font-size: 14px;
}

.page-inner {
  max-width: 820px;
  margin: 0 auto;
  padding: 16px;
}

.sort-tabs {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  background: #fff;
  border-radius: 6px 6px 0 0;
  padding: 12px 20px 0;
  border-bottom: 1px solid #e4e6eb;
}

.sort-tabs a {
  color: #71777c;
  text-decoration: none;
  padding-bottom: 10px;
  position: relative;
  font-size: 15px;
}

.sort-tabs a:hover {
  color: #1e80ff;
}

.sort-tabs a.active {
  color: #1e80ff;
  font-weight: 600;
}

.sort-tabs a.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  border-radius: 2px;
  background: #1e80ff;
}

.tabs-right {
  margin-left: auto;
  padding-bottom: 8px;
}

.refresh-btn {
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #515767;
  padding: 6px 14px;
  border-radius: 16px;
  cursor: pointer;
}

.refresh-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.tag-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  background: #fff;
  padding: 12px 20px;
  border-bottom: 1px solid #e4e6eb;
}

.tag-bar a {
  color: #515767;
  text-decoration: none;
  padding: 3px 12px;
  border-radius: 14px;
  white-space: nowrap;
  font-size: 13px;
}

.tag-bar a:hover {
  color: #1e80ff;
}

.tag-bar a.active {
  color: #1e80ff;
  background: #eaf2ff;
  font-weight: 500;
}

.source-bar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 20px;
  background: #fff;
  color: #8a919f;
  font-size: 12px;
  border-bottom: 1px solid #eef0f2;
}

.article-list,
.author-list,
.lesson-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #fff;
}

.article-item,
.author-item {
  display: flex;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f1f2;
}

.article-item:last-child,
.author-item:last-child {
  border-bottom: none;
}

.article-main,
.author-main {
  flex: 1;
  min-width: 0;
}

.title {
  color: #252933;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title:hover {
  color: #1e80ff;
}

.brief {
  color: #8a919f;
  margin: 6px 0;
  font-size: 13px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: #8a919f;
  font-size: 12px;
}

.meta .author {
  color: #515767;
}

.meta .dot {
  color: #d0d3d8;
}

.cover,
.avatar {
  width: 110px;
  height: 74px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  background: #fff;
  border-top: 1px solid #f0f1f2;
  padding: 16px 20px 20px;
  border-radius: 0 0 6px 6px;
}

.summary-card {
  border: 1px solid #eef0f2;
  border-radius: 10px;
  padding: 14px;
  background: #fafbfc;
}

.summary-card h3 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #252933;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef4ff;
  color: #1e80ff;
  font-size: 12px;
}

.state-block {
  background: #fff;
  border-radius: 0 0 6px 6px;
  padding: 50px 0;
  text-align: center;
  color: #8a919f;
}

.state-block.error {
  color: #e05e5e;
}

.state-block.error a {
  color: #1e80ff;
  margin-left: 8px;
}

.load-more {
  text-align: center;
  padding: 16px 0;
}

.no-more {
  color: #b2bac2;
  font-size: 13px;
}

@media (max-width: 640px) {
  .page-inner {
    padding: 8px;
  }

  .sort-tabs,
  .tag-bar,
  .source-bar,
  .article-item,
  .author-item,
  .summary-grid {
    padding-left: 12px;
    padding-right: 12px;
  }

  .source-bar {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .cover {
    width: 84px;
    height: 56px;
  }

  .title {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
