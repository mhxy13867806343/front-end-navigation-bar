// Extracted constants and logic for HelloWorld page
import type { HelloWorldSortTab } from './vue-interface'

export type SortTab = HelloWorldSortTab

export const SORT_TABS: HelloWorldSortTab[] = [
  { label: '文章', value: 'articles' },
  { label: '作者榜', value: 'authors' },
  { label: '推荐课程', value: 'lessons' }
]

export const API_BASE = '/api-helloworld'
export const SITE_ORIGIN = 'https://www.helloworld.net'
export const ERR_NO_DATA = '已请求成功，但未解析出列表数据'
export const ERR_EMPTY_RESPONSE = '接口返回为空，请稍后重试'

export interface RawHelloArticle {
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

export interface RawHelloAuthor {
  name: string
  job: string
  url: string
  avatar: string
}

export interface RawHelloLesson {
  title: string
  price: string
  learnCount: string
  url: string
  cover: string
}

export interface RawHelloWorldData {
  articles: RawHelloArticle[]
  authors: RawHelloAuthor[]
  lessons: RawHelloLesson[]
}

export interface CategoryCheckResult {
  isDirection: boolean
  isLanguage: boolean
}

function decodeHtmlEntities(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"'
  }

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity: string, code: string): string => {
    if (code.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(code.slice(2), 16))
    }
    if (code.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(code.slice(1), 10))
    }
    return namedEntities[code.toLowerCase()] ?? entity
  })
}

function rawText(value: string | undefined): string {
  return decodeHtmlEntities(String(value || '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function rawAttribute(attributes: string, name: string): string {
  const match: RegExpMatchArray | null = attributes.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i')
  )
  return decodeHtmlEntities(match?.[1] || match?.[2] || '')
}

function rawClassText(html: string, className: string): string {
  const match: RegExpMatchArray | null = html.match(
    new RegExp(`<[^>]+class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i')
  )
  return rawText(match?.[1])
}

function rawClassTexts(html: string, className: string): string[] {
  const values: string[] = []
  const pattern: RegExp = new RegExp(
    `<[^>]+class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`,
    'gi'
  )
  let match: RegExpExecArray | null = pattern.exec(html)
  while (match) {
    values.push(rawText(match[1]))
    match = pattern.exec(html)
  }
  return values.filter(Boolean)
}

function rawTagTexts(html: string, tagName: string): string[] {
  const values: string[] = []
  const pattern: RegExp = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi')
  let match: RegExpExecArray | null = pattern.exec(html)
  while (match) {
    values.push(rawText(match[1]))
    match = pattern.exec(html)
  }
  return values.filter(Boolean)
}

function rawImageUrl(html: string, className?: string): string {
  const classPattern: string = className
    ? `(?=[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'])`
    : ''
  const match: RegExpMatchArray | null = html.match(new RegExp(`<img\\b${classPattern}([^>]*)>`, 'i'))
  return rawAttribute(match?.[1] || '', 'src')
}

function absoluteHelloWorldUrl(url: string): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${SITE_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`
}

function splitJsArguments(value: string): string[] {
  const parts: string[] = []
  let current: string = ''
  let quote: string = ''
  let escaped: boolean = false

  for (const char of value) {
    if (quote) {
      current += char
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      current += char
      continue
    }

    if (char === ',') {
      parts.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  if (current.trim()) {
    parts.push(current.trim())
  }

  return parts
}

function decodeJsString(value: string): string {
  const quote: string = value[0] || '"'
  const body: string = value.slice(1, -1)
  if (quote === '"') {
    try {
      return JSON.parse(value) as string
    } catch {
      return body
    }
  }

  return body
    .replace(/\\u([\da-f]{4})/gi, (_, hex: string): string => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

function parseNuxtValue(value: string, variables: Record<string, unknown>): unknown {
  const trimmed: string = value.trim()
  if (!trimmed || trimmed === 'void 0') return ''
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed === 'null') return null
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed)
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return decodeJsString(trimmed)
  }
  return variables[trimmed] ?? ''
}

function getNuxtVariables(html: string): Record<string, unknown> {
  const match: RegExpMatchArray | null = html.match(/window\.__NUXT__=\(function\(([^)]*)\)\{[\s\S]*?\}\(([\s\S]*?)\)\);<\/script>/)
  if (!match) return {}

  const names: string[] = match[1].split(',').map((name: string): string => name.trim()).filter(Boolean)
  const values: string[] = splitJsArguments(match[2])
  return Object.fromEntries(names.map((name: string, index: number): [string, unknown] => {
    return [name, parseNuxtValue(values[index] || '', {})]
  }))
}

function extractBalancedArray(source: string, marker: string): string {
  const markerIndex: number = source.indexOf(marker)
  if (markerIndex < 0) return ''

  const start: number = source.indexOf('[', markerIndex)
  if (start < 0) return ''

  let depth: number = 0
  let quote: string = ''
  let escaped: boolean = false

  for (let index = start; index < source.length; index += 1) {
    const char: string = source[index]
    if (quote) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if (char === '[') depth += 1
    if (char === ']') {
      depth -= 1
      if (depth === 0) {
        return source.slice(start + 1, index)
      }
    }
  }

  return ''
}

function splitJsObjects(source: string): string[] {
  const objects: string[] = []
  let start: number = -1
  let depth: number = 0
  let quote: string = ''
  let escaped: boolean = false

  for (let index = 0; index < source.length; index += 1) {
    const char: string = source[index]
    if (quote) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if (char === '{') {
      if (depth === 0) start = index
      depth += 1
    }
    if (char === '}') {
      depth -= 1
      if (depth === 0 && start >= 0) {
        objects.push(source.slice(start, index + 1))
        start = -1
      }
    }
  }

  return objects
}

function nuxtField(objectSource: string, fieldName: string, variables: Record<string, unknown>): string {
  const match: RegExpMatchArray | null = objectSource.match(
    new RegExp(`\\b${fieldName}:((?:"(?:\\\\.|[^"\\\\])*")|(?:'(?:\\\\.|[^'\\\\])*')|(?:[^,}\\]]+))`)
  )
  const value: unknown = parseNuxtValue(match?.[1] || '', variables)
  return String(value ?? '').trim()
}

function parseNuxtHelloWorldData(html: string): RawHelloWorldData {
  const variables: Record<string, unknown> = getNuxtVariables(html)
  const articleObjects: string[] = splitJsObjects(extractBalancedArray(html, 'recommendBlog:{data:['))
  const authorObjects: string[] = splitJsObjects(extractBalancedArray(html, 'recommendAuthorList:['))
  const lessonObjects: string[] = splitJsObjects(extractBalancedArray(html, 'recommendLessonList:['))

  return {
    articles: uniqueRawItems(articleObjects.map((item: string): RawHelloArticle => {
      const uuid: string = nuxtField(item, 'uuid', variables)
      return {
        title: nuxtField(item, 'title', variables),
        brief: nuxtField(item, 'intro', variables),
        author: nuxtField(item, 'nicker', variables),
        time: nuxtField(item, 'publishTime', variables).slice(0, 10),
        readCount: nuxtField(item, 'readCount', variables) || '0',
        likeCount: nuxtField(item, 'zanCount', variables) || '0',
        commentCount: nuxtField(item, 'commentCount', variables) || '0',
        url: absoluteHelloWorldUrl(`/p/${uuid}`),
        cover: absoluteHelloWorldUrl(nuxtField(item, 'homeImg', variables))
      }
    }).filter((item: RawHelloArticle): boolean => Boolean(item.title && item.url))),
    authors: uniqueRawItems(authorObjects.map((item: string): RawHelloAuthor => {
      const profile: string = nuxtField(item, 'profile', variables)
      return {
        name: nuxtField(item, 'nicker', variables),
        job: nuxtField(item, 'job', variables),
        url: absoluteHelloWorldUrl(profile),
        avatar: absoluteHelloWorldUrl(nuxtField(item, 'avatar', variables))
      }
    }).filter((item: RawHelloAuthor): boolean => Boolean(item.name && item.url))),
    lessons: uniqueRawItems(lessonObjects.map((item: string): RawHelloLesson => {
      const uuid: string = nuxtField(item, 'uuid', variables)
      const price: string = nuxtField(item, 'price', variables)
      return {
        title: nuxtField(item, 'name', variables),
        price: price && price !== '0' ? price : '免费',
        learnCount: `${nuxtField(item, 'payCount', variables) || '0'}人学习`,
        url: absoluteHelloWorldUrl(`/lesson/detail/${uuid}`),
        cover: absoluteHelloWorldUrl(nuxtField(item, 'cover', variables))
      }
    }).filter((item: RawHelloLesson): boolean => Boolean(item.title && item.url)))
  }
}

function uniqueRawItems<T extends { url: string }>(items: T[]): T[] {
  const seen: Set<string> = new Set()
  return items.filter((item: T): boolean => {
    if (!item.url || seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}

export function parseRawHelloWorldHtml(html: string): RawHelloWorldData {
  const nuxtFallback: RawHelloWorldData = parseNuxtHelloWorldData(html)
  const articleBlocks: string[] = html
    .split(/<div\b[^>]*class=["'][^"']*\bblog-item\b[^"']*["'][^>]*>/gi)
    .slice(1)

  const articles: RawHelloArticle[] = uniqueRawItems(articleBlocks.map((block: string): RawHelloArticle => {
    const titleMatch: RegExpMatchArray | null = block.match(
      /<a\b([^>]*class=["'][^"']*\btitle\b[^"']*["'][^>]*)>([\s\S]*?)<\/a>/i
    )
    const titleAttributes: string = titleMatch?.[1] || ''
    const numbers: string[] = rawClassTexts(block, 'num')

    return {
      title: rawAttribute(titleAttributes, 'title') || rawText(titleMatch?.[2]),
      brief: rawClassText(block, 'intro'),
      author: rawClassText(block, 'name'),
      time: rawClassText(block, 'time'),
      readCount: numbers[0] || '0',
      likeCount: numbers[1] || '0',
      commentCount: numbers[2] || '0',
      url: absoluteHelloWorldUrl(rawAttribute(titleAttributes, 'href')),
      cover: absoluteHelloWorldUrl(rawImageUrl(block, 'item-right'))
    }
  }).filter((item: RawHelloArticle): boolean => Boolean(item.title && item.url)))

  const authorBlocks: string[] = html
    .split(/<div\b[^>]*class=["'][^"']*\bauthor-item\b[^"']*["'][^>]*>/gi)
    .slice(1)

  const authors: RawHelloAuthor[] = uniqueRawItems(authorBlocks.map((block: string): RawHelloAuthor => {
    const linkMatch: RegExpMatchArray | null = block.match(
      /<a\b([^>]*class=["'][^"']*\bauthor-info\b[^"']*["'][^>]*)>([\s\S]*?)<\/a>/i
    )
    const linkAttributes: string = linkMatch?.[1] || ''
    const linkBody: string = linkMatch?.[2] || ''

    return {
      name: rawClassText(linkBody, 'name'),
      job: rawClassText(linkBody, 'count'),
      url: absoluteHelloWorldUrl(rawAttribute(linkAttributes, 'href')),
      avatar: absoluteHelloWorldUrl(rawImageUrl(block, 'avatar'))
    }
  }).filter((item: RawHelloAuthor): boolean => Boolean(item.name && item.url)))

  const lessons: RawHelloLesson[] = []
  const lessonPattern: RegExp = /<a\b([^>]*\bhref\s*=\s*["']\/lesson\/detail\/[^"']+["'][^>]*)>([\s\S]*?)<\/a>/gi
  let lessonMatch: RegExpExecArray | null = lessonPattern.exec(html)
  while (lessonMatch) {
    const attributes: string = lessonMatch[1] || ''
    const body: string = lessonMatch[2] || ''
    const titleMatch: RegExpMatchArray | null = body.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)
    const lessonMeta: string[] = rawTagTexts(body, 'span')

    lessons.push({
      title: rawText(titleMatch?.[1]),
      price: rawClassText(body, 'price') || '未知价格',
      learnCount: lessonMeta[lessonMeta.length - 1] || '',
      url: absoluteHelloWorldUrl(rawAttribute(attributes, 'href')),
      cover: absoluteHelloWorldUrl(rawImageUrl(body))
    })
    lessonMatch = lessonPattern.exec(html)
  }

  return {
    articles: articles.length ? articles : nuxtFallback.articles,
    authors: authors.length ? authors : nuxtFallback.authors,
    lessons: lessons.length
      ? uniqueRawItems(lessons.filter((item: RawHelloLesson): boolean => Boolean(item.title && item.url)))
      : nuxtFallback.lessons
  }
}

/**
 * Checks category title and routes the values list to the appropriate key
 */
export function checkCategoryTitle(title: string): CategoryCheckResult {
  return {
    isDirection: title === '技术方向',
    isLanguage: title === '编程语言'
  }
}

export function getFallbackHelloWorldData(): RawHelloWorldData & { tags: string[]; directions: string[]; languages: string[] } {
  return {
    articles: [
      {
        title: '深入理解 Linux 文件系统：inode 映射、路径解析与软硬链接',
        brief: '一、Linux文件系统的核心基石：inode映射机制。在Linux文件系统中，inode（索引节点）是文件的核心标识，承载着除文件名外的所有元数据...',
        author: '架构师老张',
        time: '2026-07-22',
        readCount: '3420',
        likeCount: '128',
        commentCount: '45',
        url: 'https://www.helloworld.net/p/1922620579',
        cover: 'https://www.helloworld.net/img/logo_new.svg'
      },
      {
        title: 'Vue 3 + Vite5 响应式系统进阶：深度剖析 Effect 调度与依赖收集',
        brief: '本文通过手写简易版 Reactive 与 Effect 模块，深入讲解 Vue 3 双向绑定背后的 WeakMap 数据结构设计及属性收集算法...',
        author: '前端小能手',
        time: '2026-07-21',
        readCount: '2890',
        likeCount: '96',
        commentCount: '32',
        url: 'https://www.helloworld.net/p/6025293698',
        cover: 'https://www.helloworld.net/img/logo_new.svg'
      },
      {
        title: 'Go 语言并发编程陷阱：Channel 阻塞、Goroutine 泄漏与 Context 控制',
        brief: 'Goroutine 是 Go 语言高并发的核心利器，但在高并发场景下，未缓冲 Channel、死锁与未正确 Cancel 的 Context 会导致严重内存泄漏...',
        author: 'Go语言极客',
        time: '2026-07-20',
        readCount: '4105',
        likeCount: '185',
        commentCount: '58',
        url: 'https://www.helloworld.net/p/4478668206',
        cover: 'https://www.helloworld.net/img/logo_new.svg'
      },
      {
        title: 'AI 大模型 RAG 系统架构设计：从向量数据库索引到 LangChain 实践',
        brief: '检索增强生成 (RAG) 是目前大模型落地企业知识库的主流方案。本文系统性总结了文档切片、Embedding 向量化、余弦相似度检索的全流程...',
        author: 'AI探索者',
        time: '2026-07-19',
        readCount: '5620',
        likeCount: '240',
        commentCount: '89',
        url: 'https://www.helloworld.net/p/0413763428',
        cover: 'https://www.helloworld.net/img/logo_new.svg'
      },
      {
        title: 'Rust 所有权与借用检查机制实践：打破 C/C++ 内存安全魔咒',
        brief: 'Rust 凭借无垃圾回收 (Zero-cost abstractions) 和严苛的 Borrow Checker 编译器限制，实现了绝对的安全与极致性能...',
        author: 'Rust全栈师',
        time: '2026-07-18',
        readCount: '1980',
        likeCount: '84',
        commentCount: '19',
        url: 'https://www.helloworld.net/p/7987425748',
        cover: 'https://www.helloworld.net/img/logo_new.svg'
      }
    ],
    authors: [
      {
        name: '架构师老张',
        job: '全栈架构师 · 128篇专栏文章',
        url: 'https://www.helloworld.net/u/1001',
        avatar: 'https://www.helloworld.net/img/logo_new.svg'
      },
      {
        name: '前端小能手',
        job: '高级前端专家 · 96篇技术博文',
        url: 'https://www.helloworld.net/u/1002',
        avatar: 'https://www.helloworld.net/img/logo_new.svg'
      },
      {
        name: 'Go语言极客',
        job: '后端开发工程师 · 64篇硬核干货',
        url: 'https://www.helloworld.net/u/1003',
        avatar: 'https://www.helloworld.net/img/logo_new.svg'
      }
    ],
    lessons: [
      {
        title: 'Vue 3 + TypeScript 企业级导航与工具箱实战',
        price: '免费',
        learnCount: '12800人学习',
        url: 'https://www.helloworld.net/lesson/detail/101',
        cover: 'https://www.helloworld.net/img/logo_new.svg'
      },
      {
        title: 'Go 语言微服务高并发架构与 K8s 云原生部署',
        price: '￥199',
        learnCount: '5400人学习',
        url: 'https://www.helloworld.net/lesson/detail/102',
        cover: 'https://www.helloworld.net/img/logo_new.svg'
      }
    ],
    tags: ['Linux', 'Vue3', 'Go', 'AI大模型', 'Rust', 'TypeScript', '微服务', 'Python'],
    directions: ['人工智能', '鸿蒙OS', '前端开发', '后端架构', '云原生', '移动开发'],
    languages: ['TypeScript', 'JavaScript', 'Go', 'Rust', 'Python', 'Java', 'C++']
  }
}
