// Centralized TypeScript Interfaces for Vue Pages

// HelloWorld page interfaces
export interface HelloWorldSortTab {
  label: string
  value: 'articles' | 'authors' | 'lessons'
}

export interface HelloArticle {
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

export interface HelloAuthor {
  name: string
  job: string
  url: string
  avatar: string
}

export interface HelloLesson {
  title: string
  price: string
  learnCount: string
  url: string
  cover: string
}

export interface ParsedHomeData {
  articles: HelloArticle[]
  authors: HelloAuthor[]
  lessons: HelloLesson[]
  tags: string[]
  directions: string[]
  languages: string[]
}

// AiCoding page interfaces
export interface AiCodingSortTab {
  label: string
  value: number
}

export interface AiCodingTag {
  tag_id: string
  tag_name: string
}

export interface AiCodingArticle {
  id: string
  title: string
  brief: string
  cover: string
  viewCount: number
  diggCount: number
  commentCount: number
  ctime: number
  author: string
  tags: string[]
  url: string
}

export interface JuejinTagRaw {
  tag_id: string
  tag?: {
    tag_name?: string
  }
}

export interface JuejinArticleRaw {
  article_pack?: {
    article_id: string
    article_info?: {
      title?: string
      brief_content?: string
      cover_image?: string
      view_count?: number
      digg_count?: number
      comment_count?: number
      ctime?: string | number
    }
    author_user_info?: {
      user_name?: string
    }
    tags?: Array<{ tag_name?: string }>
  }
}

export interface JuejinListResponse<T> {
  err_no: number
  err_msg?: string
  data?: T[]
  cursor?: string
  has_more?: boolean
}

export interface ArticleQueryBody {
  sort_type: number
  cursor: string
  limit: number
  tag_ids?: string[]
}

// Flash page interfaces
export interface FlashNavItem {
  key: string
  label: string
}

export interface FeedTab {
  key: string
  label: string
  badge?: number
}

export interface UserSummary {
  nickname: string
  avatar: string
}

export interface FlashComment {
  id: number
  nickname: string
  content: string
  time: number
}

export interface FlashFeed {
  id: number
  nickname: string
  avatar: string
  content: string
  time: number
  comments: FlashComment[]
  mine: boolean
  expanded: boolean
  replying: boolean
  replyDraft: string
}
