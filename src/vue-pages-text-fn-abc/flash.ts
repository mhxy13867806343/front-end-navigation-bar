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
  { key: 'all', label: '全站' },
  { key: 'follow', label: '关注' },
  { key: 'my', label: '我的' },
  { key: 'reply', label: '回复我', badge: 2 },
  { key: 'mention', label: '提到我' },
  { key: 'comment', label: '我回应' },
  { key: 'lucky', label: '新人' }
]

export const NOTICES: string[] = [
  '发布内容请遵守社区规范',
  '支持 @昵称 提到其他用户',
  '闪存内容最多 200 字',
  '恶意灌水将被限制发布'
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

export function createMockComment(id: number, nickname: string, content: string): FlashComment {
  return { id, nickname, content, time: Date.now() - 10 * 60 * 1000 }
}

export function createMockFeed(
  id: number,
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
