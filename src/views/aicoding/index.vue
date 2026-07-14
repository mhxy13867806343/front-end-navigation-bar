<template>
  <div class="aicoding-page">
    <div class="page-inner">
      <!-- 热门 / 最新 Tab -->
      <nav class="sort-tabs">
        <a
          v-for="tab in sortTabs"
          :key="tab.value"
          href="javascript:;"
          :class="{ active: sortType === tab.value }"
          @click="switchSort(tab.value)"
        >{{ tab.label }}</a>
        <div class="tabs-right">
          <RefreshCountdownButton :on-refresh="handleRefresh" />
        </div>
      </nav>

      <!-- 分类栏（接口动态获取） -->
      <div class="tag-bar">
        <a
          href="javascript:;"
          :class="{ active: !activeTagId }"
          @click="switchTag('')"
        >全部</a>
        <a
          v-for="tag in tags"
          :key="tag.tag_id"
          href="javascript:;"
          :class="{ active: activeTagId === tag.tag_id }"
          @click="switchTag(tag.tag_id)"
        >{{ tag.tag_name }}</a>
      </div>

      <!-- 文章列表 -->
      <div v-if="loading && !articles.length" class="state-block">加载中...</div>
      <div v-else-if="error" class="state-block error">
        {{ error }}
        <a href="javascript:;" @click="reload">重试</a>
      </div>
      <ul v-else class="article-list">
        <li v-for="item in articles" :key="item.id" class="article-item">
          <div class="article-main">
            <a class="title" :href="item.url" target="_blank" rel="noopener">{{ item.title }}</a>
            <p class="brief">{{ item.brief }}</p>
            <div class="meta">
              <span class="author">{{ item.author }}</span>
              <span class="dot">·</span>
              <span>{{ formatTime(item.ctime) }}</span>
              <span class="dot">·</span>
              <span>👁 {{ formatCount(item.viewCount) }}</span>
              <span>👍 {{ formatCount(item.diggCount) }}</span>
              <span>💬 {{ formatCount(item.commentCount) }}</span>
              <span class="tags">
                <em v-for="t in item.tags" :key="t">{{ t }}</em>
              </span>
            </div>
          </div>
          <img v-if="item.cover" class="cover" :src="item.cover" alt="" loading="lazy" />
        </li>
      </ul>

      <!-- 加载更多 -->
      <div class="load-more">
        <button v-if="hasMore && articles.length" :disabled="loading" @click="loadMore">
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
        <span v-else-if="articles.length" class="no-more">没有更多了</span>
        <span v-else-if="!loading && !error" class="no-more">暂无数据</span>
      </div>
    </div>
      <el-backtop target=".route-view-layer" :right="40" :bottom="40" :visibility-height="200" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RefreshCountdownButton from '../../components/RefreshCountdownButton.vue'

const API_BASE = '/api-juejin'

const sortTabs = [
  { label: '热门', value: 1 },
  { label: '最新', value: 2 }
]

const sortType = ref(1)
const tags = ref([])
const activeTagId = ref('')
const articles = ref([])
const cursor = ref('')
const hasMore = ref(true)
const loading = ref(false)
const error = ref('')

let requestSeq = 0

onMounted(() => {
  fetchTags()
  fetchArticles(true)
})

async function fetchTags() {
  try {
    const res = await fetch(`${API_BASE}/tag_api/v1/query_tag_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key_word: '',
        status: [0],
        id_type: 1101,
        sort_type: 0,
        cursor: '0',
        limit: 100
      })
    })
    const json = await res.json()
    if (json.err_no !== 0) throw new Error(json.err_msg)
    tags.value = (json.data || []).map(item => ({
      tag_id: item.tag_id,
      tag_name: item.tag?.tag_name || ''
    })).filter(t => t.tag_name)
  } catch (e) {
    console.error('获取分类失败:', e)
  }
}

async function fetchArticles(reset = false) {
  const seq = ++requestSeq
  loading.value = true
  error.value = ''
  if (reset) {
    cursor.value = ''
    articles.value = []
    hasMore.value = true
  }
  try {
    const body = {
      sort_type: sortType.value,
      cursor: cursor.value,
      limit: 10
    }
    if (activeTagId.value) body.tag_ids = [activeTagId.value]
    const res = await fetch(`${API_BASE}/content_api/v1/aicoding/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const json = await res.json()
    if (seq !== requestSeq) return
    if (json.err_no !== 0) throw new Error(json.err_msg)
    const list = (json.data || []).map(mapArticle).filter(Boolean)
    articles.value = reset ? list : [...articles.value, ...list]
    cursor.value = json.cursor || ''
    hasMore.value = !!json.has_more
  } catch (e) {
    if (seq !== requestSeq) return
    error.value = `加载失败：${e.message || e}`
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}

function mapArticle(item) {
  const pack = item.article_pack
  if (!pack || !pack.article_info) return null
  const info = pack.article_info
  return {
    id: pack.article_id,
    title: info.title,
    brief: info.brief_content,
    cover: info.cover_image || '',
    viewCount: info.view_count || 0,
    diggCount: info.digg_count || 0,
    commentCount: info.comment_count || 0,
    ctime: Number(info.ctime) * 1000,
    author: pack.author_user_info?.user_name || '匿名',
    tags: (pack.tags || []).map(t => t.tag_name).filter(Boolean),
    url: `https://juejin.cn/post/${pack.article_id}`
  }
}

function switchSort(value) {
  if (sortType.value === value) return
  sortType.value = value
  fetchArticles(true)
}

function switchTag(tagId) {
  if (activeTagId.value === tagId) return
  activeTagId.value = tagId
  fetchArticles(true)
}

function loadMore() {
  if (loading.value || !hasMore.value) return
  fetchArticles(false)
}

function reload() {
  fetchArticles(true)
}

async function handleRefresh() {
  await Promise.all([fetchTags(), fetchArticles(true)])
}

function formatCount(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function formatTime(ts) {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min}分钟前`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}小时前`
  const day = Math.floor(hour / 24)
  if (day < 30) return `${day}天前`
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
</script>

<style scoped>
.aicoding-page {
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

/* 热门/最新 Tab */
.sort-tabs {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  background: #fff;
  border-radius: 6px 6px 0 0;
  padding: 12px 20px 0;
  border-bottom: 1px solid #e4e6eb;
}
.tabs-right {
  margin-left: auto;
  padding-bottom: 8px;
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

/* 分类栏 */
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

/* 文章列表 */
.article-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #fff;
  border-radius: 0 0 6px 6px;
}
.article-item {
  display: flex;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f1f2;
}
.article-item:last-child {
  border-bottom: none;
}
.article-main {
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
.tags {
  display: flex;
  gap: 4px;
}
.tags em {
  font-style: normal;
  background: #f2f3f5;
  color: #8a919f;
  padding: 1px 8px;
  border-radius: 3px;
}
.cover {
  width: 110px;
  height: 74px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

/* 状态 & 加载更多 */
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
.load-more button {
  background: #fff;
  border: 1px solid #e4e6eb;
  color: #515767;
  padding: 8px 40px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}
.load-more button:hover:not(:disabled) {
  color: #1e80ff;
  border-color: #1e80ff;
}
.load-more button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.no-more {
  color: #b2bac2;
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 640px) {
  .page-inner {
    padding: 8px;
  }
  .sort-tabs,
  .tag-bar,
  .article-item {
    padding-left: 12px;
    padding-right: 12px;
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
