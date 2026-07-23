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

function uniqueRawItems<T extends { url: string }>(items: T[]): T[] {
  const seen: Set<string> = new Set()
  return items.filter((item: T): boolean => {
    if (!item.url || seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}

export function parseRawHelloWorldHtml(html: string): RawHelloWorldData {
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
    articles,
    authors,
    lessons: uniqueRawItems(lessons.filter((item: RawHelloLesson): boolean => Boolean(item.title && item.url)))
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
