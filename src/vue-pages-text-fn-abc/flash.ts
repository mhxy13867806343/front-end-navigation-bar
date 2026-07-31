// Extracted constants and logic for Flash page
import type {
  FlashNavItem,
  FeedTab,
  UserSummary,
  FlashComment,
  FlashFeed
} from './vue-interface'

export const TOP_NAVS: FlashNavItem[] = [
  { key: 'index', label: '首页' },
  { key: 'news', label: '新闻' },
  { key: 'blog', label: '博问' },
  { key: 'ing', label: '闪存' },
  { key: 'group', label: '小组' },
  { key: 'job', label: '收藏' }
]

export const INITIAL_TABS: FeedTab[] = [
  { key: 'follow', label: '关注', sourceType: 'following' },
  { key: 'my', label: '我的', sourceType: 'my' },
  { key: 'liked', label: '我赞', sourceType: 'liked' },
  { key: 'comment', label: '我回应', sourceType: 'mycomment' },
  { key: 'mention', label: '提到我', sourceType: 'mention' },
  { key: 'reply', label: '回复我', sourceType: 'reply' },
  { key: 'lucky', label: '赞闪', sourceType: 'lucky' },
  { key: 'all', label: '全站', sourceType: 'all' }
]

export const NOTICES: string[] = [
  '数据来自博客园闪存真实接口',
  '未授权时只展示请求状态，不再使用模拟数据',
  '支持分页刷新全站闪存列表',
  '发布与回应在当前页面保留本地草稿'
]

export const CURRENT_USER: UserSummary = {
  nickname: '前端小行家',
  avatar: makeAvatar('前')
}

export const ACTIVE_USERS: UserSummary[] = [
  { nickname: '清风徐来', avatar: makeAvatar('清') },
  { nickname: '夜航星', avatar: makeAvatar('夜') },
  { nickname: '像素画师', avatar: makeAvatar('像') },
  { nickname: '摸鱼大师', avatar: makeAvatar('摸') },
  { nickname: '山间明月', avatar: makeAvatar('山') },
  { nickname: '代码搬运工', avatar: makeAvatar('代') }
]

export const MAX_LEN = 200
export const FLASH_PAGE_SIZE = 20
export const FLASH_TOKEN_STORAGE_KEY = 'CNBLOGS_OPENAPI_TOKEN'
export const FLASH_SOURCE_BASE_URL = 'https://ing.cnblogs.com'
export const FLASH_LEGACY_PROXY_PATH = '/api-cnblogs-ing'
export const FLASH_OPEN_API_PROXY_PATH = '/api-cnblogs-openapi'

export function makeAvatar(char: string): string {
  const colors: string[] = ['#4a90d9', '#5cb85c', '#f0ad4e', '#d9534f', '#8e6cc0', '#20a0a0']
  const color: string = colors[char.charCodeAt(0) % colors.length] || colors[0]
  const svg: string = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" rx="6" fill="${color}"/><text x="24" y="31" font-size="22" text-anchor="middle" fill="#fff" font-family="sans-serif">${char}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function escapeHtml(str: string): string {
  const escapeMap: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return str.replace(/[&<>"']/g, (s: string): string => escapeMap[s] || s)
}

export function renderContent(content: string): string {
  return escapeHtml(content).replace(/@([\u4e00-\u9fa5\w-]+)/g, '<a class="at" href="javascript:;">@$1</a>')
}

export function formatTime(ts: number): string {
  const diff: number = Date.now() - ts
  const min: number = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const hour: number = Math.floor(min / 60)
  if (hour < 24) return `${hour} 小时前`
  const d: Date = new Date(ts)
  return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function createLocalComment(id: string, nickname: string, content: string): FlashComment {
  return { id, nickname, content, time: Date.now() - 10 * 60 * 1000 }
}
export const createMockComment = createLocalComment

export function createLocalFeed(
  id: string,
  nickname: string,
  content: string,
  minutesAgo: number,
  comments: FlashComment[] = [],
  mine: boolean = false
): FlashFeed {
  return {
    id,
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
export const createMockFeed = createLocalFeed

export function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildFlashLegacyPath(type: string, pageIndex: number, pageSize: number = FLASH_PAGE_SIZE): string {
  const params: URLSearchParams = new URLSearchParams({
    IngListType: type,
    PageIndex: String(pageIndex),
    PageSize: String(pageSize),
    Tag: '',
    _: String(Date.now())
  })
  return `${FLASH_LEGACY_PROXY_PATH}/ajax/ing/GetIngList?${params.toString()}`
}

export function buildFlashOpenApiPath(type: string, pageIndex: number, pageSize: number = FLASH_PAGE_SIZE): string {
  const params: URLSearchParams = new URLSearchParams({
    pageIndex: String(pageIndex),
    pageSize: String(pageSize),
    tag: ''
  })
  return `${FLASH_OPEN_API_PROXY_PATH}/api/statuses/@${type}?${params.toString()}`
}

export function getFlashToken(): string {
  const envToken: string = String(import.meta.env.VITE_CNBLOGS_ACCESS_TOKEN || '').trim()
  if (envToken) return envToken

  try {
    return String(localStorage.getItem(FLASH_TOKEN_STORAGE_KEY) || '').trim()
  } catch {
    return ''
  }
}

function normalizeDate(rawValue: unknown): number {
  if (typeof rawValue === 'number') return rawValue > 10_000_000_000 ? rawValue : rawValue * 1000
  if (typeof rawValue !== 'string') return Date.now()

  const matchedTicks: RegExpMatchArray | null = rawValue.match(/\/Date\((\d+)\)\//)
  if (matchedTicks) return Number(matchedTicks[1])

  const parsed: number = Date.parse(rawValue)
  return Number.isFinite(parsed) ? parsed : Date.now()
}

function getRawValue(raw: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key]
  }
  return undefined
}

function toFlashFeed(raw: Record<string, unknown>, index: number): FlashFeed | null {
  const contentValue: unknown = getRawValue(raw, ['content', 'Content', 'body', 'Body', 'status', 'Status'])
  const content: string = stripHtml(String(contentValue || ''))
  if (!content) return null

  const idValue: unknown = getRawValue(raw, ['id', 'Id', 'statusId', 'StatusId'])
  const nicknameValue: unknown = getRawValue(raw, ['author', 'Author', 'userName', 'UserName', 'nickname', 'Nickname', 'displayName', 'DisplayName'])
  const avatarValue: unknown = getRawValue(raw, ['avatar', 'Avatar', 'face', 'Face', 'iconUrl', 'IconUrl'])
  const timeValue: unknown = getRawValue(raw, ['dateAdded', 'DateAdded', 'datePublished', 'DatePublished', 'time', 'Time', 'createTime', 'CreateTime'])
  const commentsValue: unknown = getRawValue(raw, ['comments', 'Comments'])
  const comments: FlashComment[] = Array.isArray(commentsValue)
    ? commentsValue
      .map((comment: unknown, commentIndex: number): FlashComment | null => {
        if (!comment || typeof comment !== 'object') return null
        const row: Record<string, unknown> = comment as Record<string, unknown>
        const commentContent: string = stripHtml(String(getRawValue(row, ['content', 'Content']) || ''))
        if (!commentContent) return null
        const commentNickname: string = stripHtml(String(getRawValue(row, ['author', 'Author', 'userName', 'UserName', 'nickname', 'Nickname']) || '园友'))
        return {
          id: String(getRawValue(row, ['id', 'Id']) || `${idValue || index}-comment-${commentIndex}`),
          nickname: commentNickname,
          content: commentContent,
          time: normalizeDate(getRawValue(row, ['dateAdded', 'DateAdded', 'time', 'Time']))
        }
      })
      .filter((item: FlashComment | null): item is FlashComment => Boolean(item))
    : []
  const nickname: string = stripHtml(String(nicknameValue || '博客园园友'))
  const id: string = String(idValue || `openapi-${index}-${content.slice(0, 16)}`)

  return {
    id,
    nickname,
    avatar: typeof avatarValue === 'string' && avatarValue ? avatarValue : makeAvatar(nickname[0] || '园'),
    content,
    time: normalizeDate(timeValue),
    comments,
    mine: false,
    expanded: false,
    replying: false,
    replyDraft: '',
    sourceUrl: `${FLASH_SOURCE_BASE_URL}/status/${id}`,
    likeCount: Number(getRawValue(raw, ['diggCount', 'DiggCount', 'likeCount', 'LikeCount']) || 0)
  }
}

export function parseFlashOpenApiData(payload: unknown): FlashFeed[] {
  const rows: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { items?: unknown[] })?.items)
      ? (payload as { items: unknown[] }).items
      : Array.isArray((payload as { data?: unknown[] })?.data)
        ? (payload as { data: unknown[] }).data
        : []

  return rows
    .map((row: unknown, index: number): FlashFeed | null => {
      if (!row || typeof row !== 'object') return null
      return toFlashFeed(row as Record<string, unknown>, index)
    })
    .filter((item: FlashFeed | null): item is FlashFeed => Boolean(item))
}

export function parseFlashLegacyHtml(html: string): FlashFeed[] {
  if (/用户登录|sign-in|signin/i.test(html) && !/ing_body|feed_content|status-item/i.test(html)) return []

  const fragments: string[] = []
  const itemPattern: RegExp = /<(?:li|div)[^>]+(?:class|id)=["'][^"']*(?:ing_item|ing-item|feed_item|feed-item|feed_block|status-item|feed_content)[^"']*["'][^>]*>[\s\S]*?<\/(?:li|div)>/gi
  let itemMatch: RegExpExecArray | null
  while ((itemMatch = itemPattern.exec(html))) {
    fragments.push(itemMatch[0])
  }

  const rows: string[] = fragments.length ? fragments : html.split(/<div[^>]+class=["'][^"']*(?:feed|ing)[^"']*["'][^>]*>/i).slice(1)

  return rows
    .map((fragment: string, index: number): FlashFeed | null => {
      const nicknameMatch: RegExpMatchArray | null = fragment.match(/class=["'][^"']*(?:user_name|ing_author|nickname|author)[^"']*["'][^>]*>([\s\S]*?)<\/a>/i)
        || fragment.match(/<a[^>]+href=["'][^"']*(?:\/u\/|\/users\/)[^"']*["'][^>]*>([\s\S]*?)<\/a>/i)
      const contentMatch: RegExpMatchArray | null = fragment.match(/class=["'][^"']*(?:ing_body|feed_content|status_content|content)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span|p)>/i)
        || fragment.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
      const idMatch: RegExpMatchArray | null = fragment.match(/(?:ing_|status_|feed_)(\d+)/i) || fragment.match(/status\/(\d+)/i)
      const timeMatch: RegExpMatchArray | null = fragment.match(/(?:class=["'][^"']*(?:time|date)[^"']*["'][^>]*>|datetime=["'])([\s\S]*?)(?:<\/|["'])/i)
      const avatarMatch: RegExpMatchArray | null = fragment.match(/<img[^>]+src=["']([^"']+)["']/i)
      const content: string = stripHtml(contentMatch?.[1] || '')
      if (!content) return null
      const nickname: string = stripHtml(nicknameMatch?.[1] || '博客园园友')
      const id: string = idMatch?.[1] || `legacy-${index}-${content.slice(0, 16)}`
      const avatar: string = avatarMatch?.[1]
        ? new URL(avatarMatch[1], FLASH_SOURCE_BASE_URL).toString()
        : makeAvatar(nickname[0] || '园')

      return {
        id,
        nickname,
        avatar,
        content,
        time: normalizeDate(stripHtml(timeMatch?.[1] || '')),
        comments: [],
        mine: false,
        expanded: false,
        replying: false,
        replyDraft: '',
        sourceUrl: `${FLASH_SOURCE_BASE_URL}/status/${id}`
      }
    })
    .filter((item: FlashFeed | null): item is FlashFeed => Boolean(item))
}
