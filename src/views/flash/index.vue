<template>
  <div class="flash-page">
    <header class="flash-header">
      <div class="header-inner">
        <div class="header-left">
          <a class="logo" href="https://ing.cnblogs.com/" target="_blank" rel="noopener noreferrer">闪存</a>
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
            <input v-model="keyword" type="text" placeholder="搜索闪存" :disabled="isLoading" @keyup.enter="onSearch" />
            <button :disabled="isLoading" @click="onSearch">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
          </div>
          <button class="refresh-mini" :disabled="isLoading" @click="fetchFeeds">刷新</button>
          <button class="nav-toggle" @click="navOpen = !navOpen" aria-label="菜单">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    <div class="flash-body">
      <main class="flash-main">
        <section class="publish-box">
          <textarea
            v-model="draft"
            :maxlength="maxLen"
            placeholder="有什么想说的？本页发布先保存为本地草稿，真实发布需要博客园授权。"
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
              <button class="btn-publish" :disabled="!draft.trim()" @click="publish">发布草稿</button>
            </div>
          </div>
        </section>

        <nav class="feed-tabs">
          <a
            v-for="tab in tabs"
            :key="tab.key"
            href="javascript:;"
            :class="{ active: activeTab === tab.key, disabled: isLoading }"
            @click="switchTab(tab.key)"
          >
            {{ tab.label }}
            <em v-if="tab.badge" class="badge">{{ tab.badge }}</em>
          </a>
        </nav>

        <section class="source-status" :class="{ loading: isLoading, error: Boolean(errorMessage) }">
          <strong>{{ currentTab?.label || '全站' }}</strong>
          <span v-if="isLoading">正在加载博客园真实闪存...</span>
          <span v-else-if="errorMessage">{{ errorMessage }}</span>
          <span v-else>第 {{ page }} 页 · 已载入 {{ liveFeeds.length }} 条真实闪存</span>
          <span v-if="lastUpdatedAt" class="source-time">最近刷新：{{ lastUpdatedAt }}</span>
        </section>

        <div v-if="isLoading" class="feed-loading">
          <span class="loading-dot"></span>
          正在从博客园闪存接口拉取真实数据...
        </div>

        <section v-else-if="authRequired && !visibleFeeds.length" class="auth-panel">
          <h3>博客园闪存需要授权后读取</h3>
          <p>真实接口已返回未授权状态，本页不会再展示模拟数据。可以先打开原站登录，或在本地保存博客园 OpenAPI Token 后刷新。</p>
          <div class="auth-actions">
            <a href="https://ing.cnblogs.com/" target="_blank" rel="noopener noreferrer">打开闪存原站</a>
            <button @click="fetchFeeds">重新请求</button>
          </div>
        </section>

        <ul class="feed-list" v-if="visibleFeeds.length">
          <li v-for="item in visibleFeeds" :key="item.id" class="feed-item">
            <img class="avatar" :src="item.avatar" :alt="item.nickname" />
            <div class="feed-content">
              <div class="feed-text">
                <a class="nickname" :href="item.sourceUrl || 'javascript:;'" target="_blank" rel="noopener noreferrer">{{ item.nickname }}</a>
                <span class="text" v-html="renderContent(item.content)"></span>
              </div>
              <div class="feed-meta">
                <span class="time">{{ formatTime(item.time) }}</span>
                <span v-if="item.likeCount" class="time">点赞 {{ item.likeCount }}</span>
                <a class="meta-action" href="javascript:;" @click="toggleReply(item)">回应</a>
                <a
                  v-if="item.comments.length"
                  class="meta-action comment-count"
                  href="javascript:;"
                  @click="item.expanded = !item.expanded"
                >{{ item.expanded ? '收起' : `${item.comments.length} 回应` }}</a>
                <a v-if="item.sourceUrl" class="meta-action" :href="item.sourceUrl" target="_blank" rel="noopener noreferrer">原文</a>
                <a v-if="item.mine" class="meta-action del" href="javascript:;" @click="removeFeed(item)">删除</a>
              </div>

              <ul v-if="item.expanded && item.comments.length" class="comment-list">
                <li v-for="c in item.comments" :key="c.id">
                  <a class="nickname" href="javascript:;">{{ c.nickname }}</a>
                  <span class="text">{{ c.content }}</span>
                  <span class="time">{{ formatTime(c.time) }}</span>
                </li>
              </ul>

              <div v-if="item.replying" class="reply-box">
                <input
                  v-model="item.replyDraft"
                  type="text"
                  :placeholder="`回应 ${item.nickname}：`"
                  @keyup.enter="submitReply(item)"
                />
                <button @click="submitReply(item)" :disabled="!item.replyDraft?.trim()">提交草稿</button>
              </div>
            </div>
          </li>
        </ul>
        <div v-else-if="!authRequired && !isLoading" class="feed-empty">真实接口暂未返回可展示内容</div>

        <div class="feed-pager">
          <a
            href="javascript:;"
            :class="{ disabled: page === 1 || isLoading }"
            @click="goPage(page - 1)"
          >上一页</a>
          <span class="page-no">{{ page }}</span>
          <a
            href="javascript:;"
            :class="{ disabled: isLoading || !hasNextPage }"
            @click="goPage(page + 1)"
          >下一页</a>
        </div>
      </main>

      <aside class="flash-side">
        <section class="side-card user-card">
          <img class="avatar lg" :src="currentUser.avatar" alt="me" />
          <div class="user-info">
            <div class="uname">{{ currentUser.nickname }}</div>
            <div class="ustat">
              <span>草稿 {{ myFeedCount }}</span>
              <span>回应 {{ myCommentCount }}</span>
            </div>
          </div>
        </section>

        <section class="side-card">
          <h3 class="side-title">最新回应</h3>
          <ul class="side-list" v-if="latestReplies.length">
            <li v-for="reply in latestReplies" :key="reply.id">
              <a href="javascript:;">{{ reply.nickname }}：</a>
              <span>{{ reply.content }}</span>
            </li>
          </ul>
          <p v-else class="side-muted">等待真实回应数据</p>
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
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { request } from '@/utils/request'
import {
  TOP_NAVS,
  INITIAL_TABS,
  NOTICES,
  CURRENT_USER,
  MAX_LEN,
  FLASH_PAGE_SIZE,
  buildFlashLegacyPath,
  buildFlashOpenApiPath,
  createLocalComment,
  createLocalFeed,
  formatTime,
  getFlashToken,
  makeAvatar,
  parseFlashLegacyHtml,
  parseFlashOpenApiData,
  renderContent
} from '@/vue-pages-text-fn-abc/flash'
import type { FeedTab, UserSummary, FlashComment, FlashFeed } from '@/vue-pages-text-fn-abc/vue-interface'

const topNavs = TOP_NAVS
const tabs = reactive<FeedTab[]>(INITIAL_TABS.map((tab: FeedTab): FeedTab => ({ ...tab })))
const currentUser = CURRENT_USER
const notices = NOTICES
const maxLen = MAX_LEN

const navOpen = ref<boolean>(false)
const keyword = ref<string>('')
const draft = ref<string>('')
const isPrivate = ref<boolean>(false)
const publishFocus = ref<boolean>(false)
const activeTab = ref<string>('all')
const page = ref<number>(1)
const liveFeeds = ref<FlashFeed[]>([])
const localFeeds = ref<FlashFeed[]>([])
const isLoading = ref<boolean>(false)
const errorMessage = ref<string>('')
const authRequired = ref<boolean>(false)
const hasNextPage = ref<boolean>(false)
const lastUpdatedAt = ref<string>('')

let idSeed = 1000

const currentTab = computed<FeedTab | undefined>(() => tabs.find((tab: FeedTab): boolean => tab.key === activeTab.value))
const remain = computed<number>(() => maxLen - draft.value.length)
const myFeedCount = computed<number>(() => localFeeds.value.length)
const myCommentCount = computed<number>(() =>
  localFeeds.value.reduce((n: number, f: FlashFeed): number => n + f.comments.filter((c: FlashComment): boolean => c.nickname === currentUser.nickname).length, 0)
)
const visibleFeeds = computed<FlashFeed[]>(() => {
  let list: FlashFeed[] = shouldIncludeLocalFeeds.value
    ? [...localFeeds.value, ...liveFeeds.value]
    : [...liveFeeds.value]

  if (keyword.value.trim()) {
    const key: string = keyword.value.trim()
    list = list.filter((item: FlashFeed): boolean => item.content.includes(key) || item.nickname.includes(key))
  }

  return list
})
const shouldIncludeLocalFeeds = computed<boolean>(() => activeTab.value === 'all' || activeTab.value === 'my' || activeTab.value === 'reply')
const latestReplies = computed<FlashComment[]>(() =>
  [...localFeeds.value, ...liveFeeds.value]
    .flatMap((feed: FlashFeed): FlashComment[] => feed.comments)
    .sort((left: FlashComment, right: FlashComment): number => right.time - left.time)
    .slice(0, 8)
)
const activeUsers = computed<UserSummary[]>(() => {
  const users: Map<string, UserSummary> = new Map()
  visibleFeeds.value.forEach((feed: FlashFeed): void => {
    if (!users.has(feed.nickname)) {
      users.set(feed.nickname, {
        nickname: feed.nickname,
        avatar: feed.avatar || makeAvatar(feed.nickname[0] || '园')
      })
    }
  })
  if (users.size === 0) {
    users.set(currentUser.nickname, currentUser)
  }
  return Array.from(users.values()).slice(0, 8)
})

onMounted((): void => {
  void fetchFeeds()
})

async function fetchFeeds(): Promise<void> {
  if (isLoading.value) return

  isLoading.value = true
  errorMessage.value = ''
  authRequired.value = false
  hasNextPage.value = false
  liveFeeds.value = []

  const sourceType: string = currentTab.value?.sourceType || 'all'
  const token: string = getFlashToken()

  try {
    let rows: FlashFeed[] = []

    if (token) {
      rows = await fetchOpenApiFeeds(sourceType, token)
    }

    if (!rows.length) {
      rows = await fetchLegacyFeeds(sourceType)
    }

    liveFeeds.value = rows
    hasNextPage.value = rows.length >= FLASH_PAGE_SIZE
    lastUpdatedAt.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    if (!rows.length) {
      errorMessage.value = '真实接口返回为空'
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '真实闪存数据请求失败'
    hasNextPage.value = false
  } finally {
    isLoading.value = false
  }
}

async function fetchOpenApiFeeds(sourceType: string, token: string): Promise<FlashFeed[]> {
  const response: Response = await request(buildFlashOpenApiPath(sourceType, page.value), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (response.status === 401 || response.status === 403) {
    authRequired.value = true
    throw new Error('博客园 OpenAPI 授权无效，请刷新授权后再试')
  }

  if (!response.ok) {
    throw new Error(`博客园 OpenAPI 请求失败：${response.status}`)
  }

  const payload: unknown = await response.json()
  return parseFlashOpenApiData(payload)
}

async function fetchLegacyFeeds(sourceType: string): Promise<FlashFeed[]> {
  const response: Response = await request(buildFlashLegacyPath(sourceType, page.value), {
    headers: {
      Accept: 'text/html, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })

  if (response.status === 401 || response.status === 403) {
    authRequired.value = true
    throw new Error('博客园闪存真实接口需要登录态，当前环境没有授权')
  }

  if (!response.ok) {
    throw new Error(`博客园闪存请求失败：${response.status}`)
  }

  const html: string = await response.text()
  return parseFlashLegacyHtml(html)
}

function publish(): void {
  const content: string = draft.value.trim()
  if (!content) return

  localFeeds.value.unshift(createLocalFeed(`local-${++idSeed}`, currentUser.nickname, content + (isPrivate.value ? '（仅自己可见）' : ''), 0, [], true))
  draft.value = ''
  publishFocus.value = false
}

function switchTab(key: string): void {
  if (isLoading.value || activeTab.value === key) return
  activeTab.value = key
  page.value = 1
  const tab: FeedTab | undefined = tabs.find((item: FeedTab): boolean => item.key === key)
  if (tab && tab.badge) tab.badge = 0
  void fetchFeeds()
}

function goPage(nextPage: number): void {
  if (isLoading.value || nextPage < 1) return
  if (nextPage > page.value && !hasNextPage.value) return
  page.value = nextPage
  void fetchFeeds()
}

function toggleReply(item: FlashFeed): void {
  item.replying = !item.replying
  if (item.replying) item.expanded = true
}

function submitReply(item: FlashFeed): void {
  const content: string = item.replyDraft?.trim()
  if (!content) return
  item.comments.push(createLocalComment(`local-comment-${++idSeed}`, currentUser.nickname, content))
  item.replyDraft = ''
  item.replying = false
  item.expanded = true
}

function removeFeed(item: FlashFeed): void {
  const index: number = localFeeds.value.indexOf(item)
  if (index > -1) localFeeds.value.splice(index, 1)
}

function onSearch(): void {
  if (isLoading.value) return
  page.value = 1
}
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
