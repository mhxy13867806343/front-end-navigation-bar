<template>
  <div class="helloworld-page">
    <div class="page-inner">
      <!-- 热门标签栏 -->
      <div class="tag-bar">
        <a href="javascript:;" :class="{ active: !activeTag }" @click="activeTag = ''">全部</a>
        <a
          v-for="tag in tags"
          :key="tag"
          href="javascript:;"
          :class="{ active: activeTag === tag }"
          @click="activeTag = tag"
        >#{{ tag }}</a>
      </div>

      <!-- 技术方向/编程语言 Tab -->
      <nav class="sort-tabs">
        <a
          v-for="tab in sortTabs"
          :key="tab.value"
          href="javascript:;"
          :class="{ active: sortType === tab.value }"
          @click="sortType = tab.value"
        >{{ tab.label }}</a>
      </nav>

      <!-- 文章列表 -->
      <div v-if="loading && !articles.length" class="state-block">加载中...</div>
      <div v-else-if="error" class="state-block error">
        {{ error }}
        <a href="javascript:;" @click="fetchData">重试</a>
      </div>
      <ul v-else class="article-list">
        <li v-for="(item, index) in articles" :key="index" class="article-item">
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
        </li>
      </ul>

      <!-- 状态提示 -->
      <div class="load-more" v-if="!loading && !error">
        <span class="no-more">{{ articles.length }} 篇文章</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API_BASE = 'https://www.helloworld.net'

const sortTabs = [
  { label: '技术方向', value: 'direction' },
  { label: '编程语言', value: 'language' }
]

const sortType = ref('direction')
const tags = ref(['vue', 'react', 'flutter', 'golang', 'rust'])
const activeTag = ref('')
const articles = ref([])
const loading = ref(false)
const error = ref('')

const techDirections = [
  '人工智能', '鸿蒙开发', '前端开发', '移动端',
  '后端开发', '架构设计', '软件开发'
]

const languages = [
  'Java', 'C/C++', 'Golang', 'Javascript', 'Python', 'PHP'
]

// 模拟文章数据（从之前提取的数据）
const mockArticles = [
  {
    title: '深入理解Linux文件系统：inode映射、路径解析、挂载与软硬链接',
    brief: '一、Linux文件系统的核心基石：inode映射机制1.1inode的本质与核心作用在Linux文件中...',
    author: '方悦',
    time: '2个月前',
    readCount: 853,
    likeCount: 0,
    commentCount: 0,
    url: 'https://www.helloworld.net/p/1922620579'
  },
  {
    title: '成者发布"十二周年战略新品发布会"：以"AI+极简"重塑高效办公新范式',
    brief: '2026年1月6日，成者CZUR在其成立十二周年之际，成功举办战略新品发布会...',
    author: '无分号教派',
    time: '2个月前',
    readCount: 432,
    likeCount: 0,
    commentCount: 0,
    url: 'https://www.helloworld.net/p/6025293698'
  },
  {
    title: 'OpenClaw接入企业微信全攻略：从0到1打通企业AI协作通道',
    brief: '摘要：本文详细介绍了将OpenClawAI框架接入企业微信的完整方案...',
    author: '无分号教派',
    time: '2个月前',
    readCount: 442,
    likeCount: 0,
    commentCount: 0,
    url: 'https://www.helloworld.net/p/4478668206'
  },
  {
    title: 'uniapp+PHP 圈子论坛系统源码：轻量化架构、发帖互动、评论点赞',
    brief: '传统的大型论坛系统架构臃肿、维护成本高、移动端体验差...',
    author: 'dkll',
    time: '2个月前',
    readCount: 407,
    likeCount: 0,
    commentCount: 0,
    url: 'https://www.helloworld.net/p/0413763428'
  },
  {
    title: '与AI结对编程，一路同行：一款数据库稳定性保障插件之AI设计开发结对编程实践之路',
    brief: '背景在日常工作中，有时会遇到一些突发流量，突发流量虽然持续时间短...',
    author: '京东云开发者',
    time: '2个月前',
    readCount: 743,
    likeCount: 0,
    commentCount: 0,
    url: 'https://www.helloworld.net/p/7987425748'
  },
  {
    title: '抽丝剥茧探穷境！一次数据库JSON字段的深度使用实践',
    brief: '背景在我们系统中，承接多种行业，多种商家的，多个业务条线...',
    author: '京东云开发者',
    time: '2个月前',
    readCount: 733,
    likeCount: 0,
    commentCount: 0,
    url: 'https://www.helloworld.net/p/2338191012'
  },
  {
    title: '智算监控的下半场：从基础设施报警到算力精算师',
    brief: '摘要：在十万卡集群与万亿参数模型时代，基础设施的稳定性...',
    author: '京东云开发者',
    time: '2个月前',
    readCount: 783,
    likeCount: 0,
    commentCount: 0,
    url: 'https://www.helloworld.net/p/4697230071'
  },
  {
    title: 'uniapp+php婚恋交友语音房配置系统，企业交友红娘牵线线下门店合作系统',
    brief: '一、技术选型：UniAppPHP的黄金组合UniApp优势跨平台开发...',
    author: 'dkll',
    time: '2个月前',
    readCount: 406,
    likeCount: 0,
    commentCount: 0,
    url: 'https://www.helloworld.net/p/7114171318'
  },
  {
    title: '【龙虾大脑核心揭秘-1】OpenClaw处理流程链路解析',
    brief: '引言OpenClaw作为一款开源的AI智能体(AutonomousAgent)框架...',
    author: '京东云开发者',
    time: '2个月前',
    readCount: 700,
    likeCount: 0,
    commentCount: 0,
    url: 'https://www.helloworld.net/p/3660738190'
  },
  {
    title: 'B端体验设计探索：如何缓解用户视觉疲劳',
    brief: '前言"色彩是我们感知世界的重要媒介，对于信息传达有着重要的作用..."',
    author: '京东云开发者',
    time: '2个月前',
    readCount: 741,
    likeCount: 0,
    commentCount: 0,
    url: 'https://www.helloworld.net/p/9504736704'
  }
]

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    articles.value = mockArticles
  } catch (e) {
    error.value = `加载失败：${e.message || e}`
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
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

/* 热门标签栏 */
.tag-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  background: #fff;
  padding: 12px 20px;
  border-bottom: 1px solid #e4e6eb;
  border-radius: 6px 6px 0 0;
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

/* 技术方向/编程语言 Tab */
.sort-tabs {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  background: #fff;
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
  .title {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
