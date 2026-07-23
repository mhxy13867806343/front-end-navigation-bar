const JINA_READER_PREFIX = 'https://r.jina.ai/http://r.jina.ai/http://'

export function toJinaReaderUrl(url: string): string {
  return `${JINA_READER_PREFIX}${url}`
}

export function extractJinaContent(text: string): string {
  const marker = 'Markdown Content:'
  const markerIndex: number = text.indexOf(marker)
  const content: string = markerIndex >= 0 ? text.slice(markerIndex + marker.length).trim() : text.trim()
  const jsonStartIndexes: number[] = [content.indexOf('{'), content.indexOf('[')].filter((index: number): boolean => index >= 0)
  if (!jsonStartIndexes.length) return content
  return content.slice(Math.min(...jsonStartIndexes)).trim()
}

export async function requestJinaText(url: string): Promise<string> {
  const response: Response = await fetch(toJinaReaderUrl(url), {
    cache: 'no-cache'
  })

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`)
  }

  return extractJinaContent(await response.text())
}

export async function requestJinaJson<T>(url: string): Promise<T> {
  const content: string = await requestJinaText(url)
  return JSON.parse(content) as T
}
