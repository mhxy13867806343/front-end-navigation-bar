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

<script setup>

const topNavs = [
  { key: 'index', label: '首页' },
  { key: 'news', label: '新闻' },
  { key: 'blog', label: '博问' },
  { key: 'ing', label: '闪存' },
  { key: 'group', label: '小组' },
  { key: 'job', label: '收藏' }
]

const tabs = [
  { key: 'all', label: '全站' },
  { key: 'follow', label: '关注' },
  { key: 'my', label: '我的' },
  { key: 'reply', label: '回复我', badge: 2 },
  { key: 'mention', label: '提到我' },
  { key: 'comment', label: '我回应' },
  { key: 'lucky', label: '新人' }
]

const currentUser = {
  nickname: '前端小行家',
  avatar: makeAvatar('前')
}

const navOpen = ref(false)
const keyword = ref('')
const draft = ref('')
const isPrivate = ref(false)
const publishFocus = ref(false)
const activeTab = ref('all')
const page = ref(1)
const maxLen = 200

let idSeed = 100

const feeds = reactive([
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

const notices = [
  '发布内容请遵守社区规范',
  '支持 @昵称 提到其他用户',
  '闪存内容最多 200 字',
  '恶意灌水将被限制发布'
]

const activeUsers = [
  { nickname: '清风徐来', avatar: makeAvatar('清') },
  { nickname: '夜航星', avatar: makeAvatar('夜') },
  { nickname: '像素画师', avatar: makeAvatar('像') },
  { nickname: '摸鱼大师', avatar: makeAvatar('摸') },
  { nickname: '山间明月', avatar: makeAvatar('山') },
  { nickname: '代码搬运工', avatar: makeAvatar('代') }
]

const remain = computed(() => maxLen - draft.value.length)
const myFeedCount = computed(() => feeds.filter(f => f.mine).length)
const myCommentCount = computed(() =>
  feeds.reduce((n, f) => n + f.comments.filter(c => c.nickname === currentUser.nickname).length, 0)
)

const filteredFeeds = computed(() => {
  let list = feeds
  if (activeTab.value === 'my') {
    list = feeds.filter(f => f.mine)
  } else if (activeTab.value === 'reply') {
    list = feeds.filter(f => f.mine && f.comments.length)
  } else if (activeTab.value === 'mention') {
    list = feeds.filter(f => f.content.includes(`@${currentUser.nickname}`))
  } else if (activeTab.value === 'comment') {
    list = feeds.filter(f => f.comments.some(c => c.nickname === currentUser.nickname))
  } else if (activeTab.value === 'follow' || activeTab.value === 'lucky') {
    list = feeds.slice(0, 3)
  }
  if (keyword.value.trim()) {
    const k = keyword.value.trim()
    list = list.filter(f => f.content.includes(k) || f.nickname.includes(k))
  }
  return list
})

function mockFeed(nickname, content, minutesAgo, comments = [], mine = false) {
  return {
    id: ++idSeed,
    nickname,
    avatar: makeAvatar(nickname[0]),
    content,
    time: Date.now() + minutesAgo * 60 * 1000,
    comments,
    mine,
    expanded: false,
    replying: false,
    replyDraft: ''
  }
}

function mockComment(nickname, content) {
  return { id: ++idSeed, nickname, content, time: Date.now() - 10 * 60 * 1000 }
}

function makeAvatar(char) {
  const colors = ['#4a90d9', '#5cb85c', '#f0ad4e', '#d9534f', '#8e6cc0', '#20a0a0']
  const color = colors[char.charCodeAt(0) % colors.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" rx="6" fill="${color}"/><text x="24" y="31" font-size="22" text-anchor="middle" fill="#fff" font-family="sans-serif">${char}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function renderContent(content) {
  return escapeHtml(content).replace(/@([\u4e00-\u9fa5\w-]+)/g, '<a class="at" href="javascript:;">@$1</a>')
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]))
}

function formatTime(ts) {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour} 小时前`
  const d = new Date(ts)
  return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function publish() {
  const content = draft.value.trim()
  if (!content) return
  feeds.unshift(mockFeed(currentUser.nickname, content + (isPrivate.value ? '（仅自己可见）' : ''), 0, [], true))
  draft.value = ''
  publishFocus.value = false
}

function switchTab(key) {
  activeTab.value = key
  page.value = 1
  const tab = tabs.find(t => t.key === key)
  if (tab && tab.badge) tab.badge = 0
}

function toggleReply(item) {
  item.replying = !item.replying
  if (item.replying) item.expanded = true
}

function submitReply(item) {
  const content = item.replyDraft?.trim()
  if (!content) return
  item.comments.push({ id: ++idSeed, nickname: currentUser.nickname, content, time: Date.now() })
  item.replyDraft = ''
  item.replying = false
  item.expanded = true
}

function removeFeed(item) {
  const idx = feeds.indexOf(item)
  if (idx > -1) feeds.splice(idx, 1)
}

function onSearch() {
  page.value = 1
}
</script>

<style scoped>
.flash-page {
  min-height: 100vh;
  background: #f2f2f2;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}

/* ===== 顶部导航 ===== */
.flash-header {
  background: #3a6ea5;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 0;
}
.logo {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
}
.top-nav {
  display: flex;
  gap: 4px;
}
.top-nav a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
}
.top-nav a:hover,
.top-nav a.active {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-box {
  display: flex;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  overflow: hidden;
}
.search-box input {
  border: none;
  background: transparent;
  color: #fff;
  padding: 6px 10px;
  width: 150px;
  outline: none;
}
.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}
.search-box button {
  border: none;
  background: transparent;
  color: #fff;
  padding: 0 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
}
.nav-toggle span {
  width: 20px;
  height: 2px;
  background: #fff;
  border-radius: 1px;
}

/* ===== 布局 ===== */
.flash-body {
  max-width: 1100px;
  margin: 16px auto;
  padding: 0 16px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.flash-main {
  flex: 1;
  min-width: 0;
}
.flash-side {
  width: 260px;
  flex-shrink: 0;
}

/* ===== 发布框 ===== */
.publish-box {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
}
.publish-box textarea {
  width: 100%;
  min-height: 70px;
  border: 1px solid #d5d5d5;
  border-radius: 4px;
  padding: 8px 10px;
  resize: vertical;
  outline: none;
  font: inherit;
  box-sizing: border-box;
}
.publish-box textarea:focus {
  border-color: #3a6ea5;
}
.publish-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.lucky-check {
  color: #888;
  cursor: pointer;
  user-select: none;
}
.right-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}
.count {
  color: #999;
  font-size: 12px;
}
.count.warn {
  color: #d9534f;
}
.btn-publish {
  background: #3a6ea5;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 20px;
  cursor: pointer;
}
.btn-publish:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-publish:not(:disabled):hover {
  background: #33618f;
}

/* ===== Tab 栏 ===== */
.feed-tabs {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-top: 12px;
  overflow: hidden;
}
.feed-tabs a {
  padding: 10px 16px;
  color: #555;
  text-decoration: none;
  position: relative;
  white-space: nowrap;
}
.feed-tabs a:hover {
  color: #3a6ea5;
}
.feed-tabs a.active {
  color: #3a6ea5;
  font-weight: 600;
}
.feed-tabs a.active::after {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 0;
  height: 2px;
  background: #3a6ea5;
}
.badge {
  display: inline-block;
  min-width: 16px;
  padding: 0 4px;
  background: #d9534f;
  color: #fff;
  font-size: 11px;
  font-style: normal;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
  vertical-align: 2px;
}

/* ===== 消息流 ===== */
.feed-list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}
.feed-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid #efefef;
}
.feed-item:last-child {
  border-bottom: none;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  flex-shrink: 0;
}
.avatar.sm {
  width: 28px;
  height: 28px;
  border-radius: 4px;
}
.avatar.lg {
  width: 56px;
  height: 56px;
}
.feed-content {
  flex: 1;
  min-width: 0;
}
.nickname {
  color: #3a6ea5;
  font-weight: 600;
  text-decoration: none;
  margin-right: 6px;
}
.feed-text .text {
  word-break: break-word;
}
.feed-text :deep(.at) {
  color: #3a6ea5;
  text-decoration: none;
}
.feed-meta {
  margin-top: 6px;
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: #999;
}
.meta-action {
  color: #999;
  text-decoration: none;
}
.meta-action:hover {
  color: #3a6ea5;
}
.meta-action.del:hover {
  color: #d9534f;
}
.comment-count {
  color: #3a6ea5;
}

/* 回应 */
.comment-list {
  list-style: none;
  margin: 8px 0 0;
  padding: 8px 10px;
  background: #f7f9fb;
  border-radius: 4px;
}
.comment-list li {
  padding: 4px 0;
  font-size: 13px;
}
.comment-list .time {
  margin-left: 8px;
  color: #bbb;
  font-size: 12px;
}
.reply-box {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.reply-box input {
  flex: 1;
  border: 1px solid #d5d5d5;
  border-radius: 4px;
  padding: 6px 10px;
  outline: none;
  font: inherit;
}
.reply-box input:focus {
  border-color: #3a6ea5;
}
.reply-box button {
  background: #3a6ea5;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0 16px;
  cursor: pointer;
}
.reply-box button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.feed-empty {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-top: 12px;
  padding: 40px 0;
  text-align: center;
  color: #999;
}

/* 分页 */
.feed-pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 16px 0;
}
.feed-pager a {
  color: #3a6ea5;
  text-decoration: none;
  padding: 4px 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.feed-pager a.disabled {
  color: #bbb;
  pointer-events: none;
}
.page-no {
  color: #666;
}

/* ===== 右侧栏 ===== */
.side-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}
.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
}
.uname {
  font-weight: 600;
}
.ustat {
  color: #888;
  font-size: 12px;
  display: flex;
  gap: 12px;
  margin-top: 4px;
}
.side-title {
  margin: 0 0 8px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #efefef;
  padding-bottom: 8px;
}
.side-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.side-list li {
  padding: 4px 0;
}
.side-list a {
  color: #555;
  text-decoration: none;
}
.side-list a:hover {
  color: #3a6ea5;
}
.active-users {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.active-users li {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.active-users .nickname {
  font-weight: 400;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 响应式 ===== */
@media (max-width: 900px) {
  .flash-side {
    display: none;
  }
}
@media (max-width: 640px) {
  .header-inner {
    padding: 0 12px;
  }
  .search-box input {
    width: 90px;
  }
  .nav-toggle {
    display: flex;
  }
  .top-nav {
    display: none;
    position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    background: #3a6ea5;
    flex-direction: column;
    padding: 8px 12px 12px;
    gap: 2px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  .top-nav.open {
    display: flex;
  }
  .flash-body {
    margin: 12px auto;
    padding: 0 12px;
  }
  .feed-tabs a {
    padding: 10px 12px;
    font-size: 13px;
  }
  .avatar {
    width: 40px;
    height: 40px;
  }
}
</style>
