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

<script setup>
import { computed, onMounted, ref } from 'vue'

const API_BASE = '/api-helloworld'

const sortTabs = [
  { label: '文章', value: 'articles' },
  { label: '作者榜', value: 'authors' },
  { label: '推荐课程', value: 'lessons' }
]

const activeTab = ref('articles')
const activeTag = ref('')
const tags = ref([])
const articles = ref([])
const authors = ref([])
const lessons = ref([])
const directions = ref([])
const languages = ref([])
const loading = ref(false)
const error = ref('')
const lastUpdated = ref('')

const hasRenderableData = computed(() => {
  return articles.value.length || authors.value.length || lessons.value.length
})

const filteredArticles = computed(() => {
  if (!activeTag.value) return articles.value
  const keyword = activeTag.value.toLowerCase()
  return articles.value.filter((item) => {
    const content = `${item.title} ${item.brief}`.toLowerCase()
    return content.includes(keyword)
  })
})

function toAbsoluteUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `https://www.helloworld.net${url}`
}

function decodeHtml(text) {
  return String(text || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\u002F/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSection(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker)
  if (start === -1) return ''
  const fromStart = html.slice(start)
  if (!endMarker) return fromStart
  const end = fromStart.indexOf(endMarker)
  return end === -1 ? fromStart : fromStart.slice(0, end)
}

function parseMenuSection(html, title) {
  const section = getSection(
    html,
    `<h3 class="menu-title">${title}</h3>`,
    '</ul>'
  )
  return Array.from(section.matchAll(/<span class="name">([^<]+)<\/span>/g)).map((match) => decodeHtml(match[1]))
}

function parseArticles(html) {
  const articleSection = getSection(
    html,
    '<div class="blog_list_container">',
    '<div class="right-list">'
  )
  const blocks = articleSection.split('<div class="blog-item"').slice(1)

  return blocks.map((block) => {
    const articleId = block.match(/href="\/p\/([^"]+)"/)
    const title = block.match(/class="title[^"]*"[^>]*>\s*([^<]+)\s*<\/a>/)
    const intro = block.match(/class="intro[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/div>/)
    const author = block.match(/class="name"[^>]*>\s*([^<]+)\s*<\/a>/)
    const time = block.match(/class="time"[^>]*>\s*([^<]+)\s*<\/div>/)
    const nums = Array.from(block.matchAll(/<span class="num"[^>]*>(\d+)<\/span>/g)).map((match) => match[1])
    const cover = block.match(/<img src="([^"]+)" class="item-right"/)

    return {
      title: decodeHtml(title?.[1]),
      brief: decodeHtml(intro?.[1]),
      author: decodeHtml(author?.[1]),
      time: decodeHtml(time?.[1]),
      readCount: nums[0] || '0',
      likeCount: nums[1] || '0',
      commentCount: nums[2] || '0',
      url: toAbsoluteUrl(articleId ? `/p/${articleId[1]}` : ''),
      cover: toAbsoluteUrl(cover?.[1] || '')
    }
  }).filter((item) => item.title && item.url)
}

function parseAuthors(html) {
  const authorSection = getSection(
    html,
    '<h5 class="common-title" data-v-377f20d6>作者榜</h5>',
    '<h5 class="common-title" data-v-377f20d6>推荐课程</h5>'
  )
  const blocks = authorSection.split('<div class="author-item"').slice(1)

  return blocks.map((block) => {
    const profile = block.match(/href="\/([^"]+)" target="_blank" class="author-info"/)
    const name = block.match(/<span class="name[^"]*"[^>]*>([^<]+)<\/span>/)
    const job = block.match(/<span class="count[^"]*"[^>]*>([^<]*)<\/span>/)
    const avatar = block.match(/<img src="([^"]+)"[^>]*class="avatar"/)

    return {
      name: decodeHtml(name?.[1]),
      job: decodeHtml(job?.[1]),
      url: toAbsoluteUrl(profile ? `/${profile[1]}` : ''),
      avatar: toAbsoluteUrl(avatar?.[1] || '')
    }
  }).filter((item) => item.name && item.url)
}

function parseLessons(html) {
  const lessonSection = getSection(
    html,
    '<h5 class="common-title" data-v-377f20d6>推荐课程</h5>',
    '<h5 class="common-title" data-v-377f20d6>推荐标签</h5>'
  )
  const blocks = lessonSection.split('<a target="_blank" href="').slice(1)

  return blocks.map((block) => {
    const href = block.match(/^([^"]+)/)
    const cover = block.match(/<img src="([^"]+)"/)
    const title = block.match(/<h2[^>]*>([^<]+)<\/h2>/)
    const price = block.match(/<div class="price"[^>]*>([^<]+)<\/div>/)
    const count = block.match(/<span[^>]*>([^<]+人学习)<\/span>/)

    return {
      title: decodeHtml(title?.[1]),
      price: decodeHtml(price?.[1]) || '未知价格',
      learnCount: decodeHtml(count?.[1]),
      url: toAbsoluteUrl(href?.[1] || ''),
      cover: toAbsoluteUrl(cover?.[1] || '')
    }
  }).filter((item) => item.title && item.url)
}

function parseTags(html) {
  return Array.from(
    html.matchAll(/class="index-tag-item"[^>]*>([^<]+)<\/a>/g)
  ).map((match) => decodeHtml(match[1]))
}

async function fetchHomeData() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`${API_BASE}/`, {
      method: 'GET',
      headers: {
        Accept: 'text/html'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`请求失败：${response.status}`)
    }

    const html = await response.text()

    articles.value = parseArticles(html)
    authors.value = parseAuthors(html)
    lessons.value = parseLessons(html)
    tags.value = parseTags(html)
    directions.value = parseMenuSection(html, '技术方向')
    languages.value = parseMenuSection(html, '编程语言')

    if (!articles.value.length && !authors.value.length && !lessons.value.length) {
      throw new Error('已请求成功，但未解析出列表数据')
    }

    lastUpdated.value = new Date().toLocaleString('zh-CN')
  } catch (e) {
    error.value = `加载失败：${e.message || e}`
  } finally {
    loading.value = false
  }
}

onMounted(() => {
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
