<template>
  <div class="flash-page">
    <!-- 顶部导航 -->
    <header class="flash-header">
      <div class="header-inner">
        <div class="header-left">
          <a class="logo" href="javascript:;">闪存</a>
          <nav class="top-nav" :class="{ open: navOpen }">
            <a
              v-for="nav in topNavs"
              :key="nav.key"
              href="javascript:;"
              :class="{ active: nav.key === 'ing' }"
              @click="navOpen = false"
            >{{ nav.label }}</a>
          </nav>
        </div>
        <div class="header-right">
          <div class="search-box">
            <input v-model="keyword" type="text" placeholder="搜索闪存" @keyup.enter="onSearch" />
            <button @click="onSearch">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
          </div>
          <div class="user-mini">
            <img class="avatar sm" :src="currentUser.avatar" alt="me" />
          </div>
          <button class="nav-toggle" @click="navOpen = !navOpen" aria-label="菜单">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    <div class="flash-body">
      <!-- 主内容区 -->
      <main class="flash-main">
        <!-- 发布框 -->
        <section class="publish-box">
          <textarea
            v-model="draft"
            :maxlength="maxLen"
            placeholder="有什么想说的？"
            @focus="publishFocus = true"
          ></textarea>
          <div class="publish-actions" v-show="publishFocus || draft">
            <div class="left-tools">
              <label class="lucky-check">
                <input type="checkbox" v-model="isPrivate" /> 仅自己可见
              </label>
            </div>
            <div class="right-tools">
              <span class="count" :class="{ warn: remain < 20 }">{{ remain }}</span>
              <button class="btn-publish" :disabled="!draft.trim()" @click="publish">发布</button>
            </div>
          </div>
        </section>

        <!-- Tab 栏 -->
        <nav class="feed-tabs">
          <a
            v-for="tab in tabs"
            :key="tab.key"
            href="javascript:;"
            :class="{ active: activeTab === tab.key }"
            @click="switchTab(tab.key)"
          >
            {{ tab.label }}
            <em v-if="tab.badge" class="badge">{{ tab.badge }}</em>
          </a>
        </nav>

        <!-- 消息流 -->
        <ul class="feed-list" v-if="filteredFeeds.length">
          <li v-for="item in filteredFeeds" :key="item.id" class="feed-item">
            <img class="avatar" :src="item.avatar" :alt="item.nickname" />
            <div class="feed-content">
              <div class="feed-text">
                <a class="nickname" href="javascript:;">{{ item.nickname }}</a>
                <span class="text" v-html="renderContent(item.content)"></span>
              </div>
              <div class="feed-meta">
                <span class="time">{{ formatTime(item.time) }}</span>
                <a class="meta-action" href="javascript:;" @click="toggleReply(item)">回应</a>
                <a
                  v-if="item.comments.length"
                  class="meta-action comment-count"
                  href="javascript:;"
                  @click="item.expanded = !item.expanded"
                >{{ item.expanded ? '收起' : `${item.comments.length} 回应` }}</a>
                <a v-if="item.mine" class="meta-action del" href="javascript:;" @click="removeFeed(item)">删除</a>
              </div>

              <!-- 回应列表 -->
              <ul v-if="item.expanded && item.comments.length" class="comment-list">
                <li v-for="c in item.comments" :key="c.id">
                  <a class="nickname" href="javascript:;">{{ c.nickname }}</a>
                  <span class="text">{{ c.content }}</span>
                  <span class="time">{{ formatTime(c.time) }}</span>
                </li>
              </ul>

              <!-- 回应输入框 -->
              <div v-if="item.replying" class="reply-box">
                <input
                  v-model="item.replyDraft"
                  type="text"
                  :placeholder="`回应 ${item.nickname}：`"
                  @keyup.enter="submitReply(item)"
                />
                <button @click="submitReply(item)" :disabled="!item.replyDraft?.trim()">提交</button>
              </div>
            </div>
          </li>
        </ul>
        <div v-else class="feed-empty">暂无内容</div>

        <!-- 分页 -->
        <div class="feed-pager">
          <a href="javascript:;" :class="{ disabled: page === 1 }" @click="page > 1 && page--">上一页</a>
          <span class="page-no">{{ page }}</span>
          <a href="javascript:;" @click="page++">下一页</a>
        </div>
      </main>

      <!-- 右侧栏 -->
      <aside class="flash-side">
        <section class="side-card user-card">
          <img class="avatar lg" :src="currentUser.avatar" alt="me" />
          <div class="user-info">
            <div class="uname">{{ currentUser.nickname }}</div>
            <div class="ustat">
              <span>闪存 {{ myFeedCount }}</span>
              <span>回应 {{ myCommentCount }}</span>
            </div>
          </div>
        </section>

        <section class="side-card">
          <h3 class="side-title">闪存公告</h3>
          <ul class="side-list">
            <li v-for="(n, i) in notices" :key="i">
              <a href="javascript:;">{{ n }}</a>
            </li>
          </ul>
        </section>

        <section class="side-card">
          <h3 class="side-title">活跃用户</h3>
          <ul class="active-users">
            <li v-for="u in activeUsers" :key="u.nickname">
              <img class="avatar sm" :src="u.avatar" :alt="u.nickname" />
              <a class="nickname" href="javascript:;">{{ u.nickname }}</a>
            </li>
          </ul>
        </section>

        <section class="side-card">
          <h3 class="side-title">快捷入口</h3>
          <ul class="side-list">
            <li v-for="t in topNavs" :key="t.key"><a href="javascript:;">{{ t.label }}</a></li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  TOP_NAVS,
  INITIAL_TABS,
  NOTICES,
  CURRENT_USER,
  ACTIVE_USERS,
  MAX_LEN,
  escapeHtml,
  renderContent,
  formatTime,
  createMockComment,
  createMockFeed
} from '@/vue-pages-text-fn-abc/flash'
import type { FlashNavItem as NavItem, FeedTab, UserSummary, FlashComment, FlashFeed } from '@/vue-pages-text-fn-abc/vue-interface'

const topNavs = TOP_NAVS
const tabs = reactive<FeedTab[]>(JSON.parse(JSON.stringify(INITIAL_TABS)))
const currentUser = CURRENT_USER

const navOpen = ref<boolean>(false)
const keyword = ref<string>('')
const draft = ref<string>('')
const isPrivate = ref<boolean>(false)
const publishFocus = ref<boolean>(false)
const activeTab = ref<string>('all')
const page = ref<number>(1)
const maxLen = MAX_LEN

let idSeed: number = 100

const feeds = reactive<FlashFeed[]>([
  mockFeed('清风徐来', '今天把项目的构建时间从 3 分钟优化到了 40 秒，vite 真香~', -5, [
    mockComment('山间明月', '怎么做到的？求分享'),
    mockComment('清风徐来', '主要是干掉了几个巨大的 barrel file，再加了依赖预构建')
  ]),
  mockFeed('代码搬运工', '周一综合症 + 1，来杯咖啡续命 @清风徐来', -18),
  mockFeed('夜航星', '刚发现 CSS :has() 选择器兼容性已经很好了，可以放心用了', -42, [
    mockComment('像素画师', '同感，父选择器等了十年')
  ]),
  mockFeed('像素画师', '设计稿 1px 边框在 retina 屏下的处理方案又整理了一版，回头发博客', -65),
  mockFeed('前端小行家', '给导航站加了个闪存页面，练练手', -80, [], true),
  mockFeed('摸鱼大师', '下班前十分钟是效率最高的十分钟，这很合理', -130),
  mockFeed('山间明月', 'TypeScript 5 的 decorators 终于稳定了，准备把旧项目迁移一波', -200)
])

const notices = NOTICES
const activeUsers = ACTIVE_USERS

const remain = computed<number>(() => maxLen - draft.value.length)
const myFeedCount = computed<number>(() => feeds.filter((f: FlashFeed): boolean => f.mine).length)
const myCommentCount = computed<number>(() =>
  feeds.reduce((n: number, f: FlashFeed): number => n + f.comments.filter((c: FlashComment): boolean => c.nickname === currentUser.nickname).length, 0)
)

const filteredFeeds = computed<FlashFeed[]>(() => {
  let list: FlashFeed[] = feeds
  if (activeTab.value === 'my') {
    list = feeds.filter((f: FlashFeed): boolean => f.mine)
  } else if (activeTab.value === 'reply') {
    list = feeds.filter((f: FlashFeed): boolean => f.mine && f.comments.length > 0)
  } else if (activeTab.value === 'mention') {
    list = feeds.filter((f: FlashFeed): boolean => f.content.includes(`@${currentUser.nickname}`))
  } else if (activeTab.value === 'comment') {
    list = feeds.filter((f: FlashFeed): boolean => f.comments.some((c: FlashComment): boolean => c.nickname === currentUser.nickname))
  } else if (activeTab.value === 'follow' || activeTab.value === 'lucky') {
    list = feeds.slice(0, 3)
  }
  if (keyword.value.trim()) {
    const k: string = keyword.value.trim()
    list = list.filter((f: FlashFeed): boolean => f.content.includes(k) || f.nickname.includes(k))
  }
  return list
})

function mockFeed(nickname: string, content: string, minutesAgo: number, comments: FlashComment[] = [], mine: boolean = false): FlashFeed {
  return createMockFeed(++idSeed, nickname, content, minutesAgo, comments, mine)
}

function mockComment(nickname: string, content: string): FlashComment {
  return createMockComment(++idSeed, nickname, content)
}

function publish(): void {
  const content: string = draft.value.trim()
  if (!content) return
  feeds.unshift(mockFeed(currentUser.nickname, content + (isPrivate.value ? '（仅自己可见）' : ''), 0, [], true))
  draft.value = ''
  publishFocus.value = false
}

function switchTab(key: string): void {
  activeTab.value = key
  page.value = 1
  const tab: FeedTab | undefined = tabs.find((t: FeedTab): boolean => t.key === key)
  if (tab && tab.badge) tab.badge = 0
}

function toggleReply(item: FlashFeed): void {
  item.replying = !item.replying
  if (item.replying) item.expanded = true
}

function submitReply(item: FlashFeed): void {
  const content: string = item.replyDraft?.trim()
  if (!content) return
  item.comments.push({ id: ++idSeed, nickname: currentUser.nickname, content, time: Date.now() })
  item.replyDraft = ''
  item.replying = false
  item.expanded = true
}

function removeFeed(item: FlashFeed): void {
  const idx: number = feeds.indexOf(item)
  if (idx > -1) feeds.splice(idx, 1)
}

function onSearch(): void {
  page.value = 1
}
</script>

<style scoped src="./css/index.css"></style>
