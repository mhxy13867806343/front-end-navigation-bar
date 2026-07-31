import { resolveApiUrl } from './resolveApiUrl'

export type RequestInput = string | URL | Request

export function createHeaders(headers?: HeadersInit): Record<string, string> {
  const normalizedHeaders: Record<string, string> = {}
  new Headers(headers).forEach((value: string, key: string): void => {
    normalizedHeaders[key] = value
  })
  return normalizedHeaders
}

function hasHeader(headers: Record<string, string>, headerName: string): boolean {
  const normalizedName: string = headerName.toLowerCase()
  return Object.keys(headers).some((key: string): boolean => key.toLowerCase() === normalizedName)
}

export function jsonHeaders(headers?: HeadersInit, hasBody: boolean = false): Record<string, string> {
  const normalizedHeaders: Record<string, string> = createHeaders(headers)

  if (!hasHeader(normalizedHeaders, 'Accept')) {
    normalizedHeaders.Accept = 'application/json'
  }

  if (hasBody && !hasHeader(normalizedHeaders, 'Content-Type')) {
    normalizedHeaders['Content-Type'] = 'application/json'
  }

  return normalizedHeaders
}

export async function request(input: RequestInput, init?: RequestInit): Promise<Response> {
  const resolved: RequestInput = typeof input === 'string' ? resolveApiUrl(input) : input
  return fetch(resolved, init)
}

export function assertOkResponse(response: Response, fallbackMessage: string = '请求失败'): void {
  if (!response.ok) {
    throw new Error(`${fallbackMessage}：${response.status}`)
  }
}

export async function requestJson<T>(input: RequestInput, init?: RequestInit): Promise<T> {
  const response: Response = await request(input, {
    ...init,
    headers: jsonHeaders(init?.headers, Boolean(init?.body) && !(init?.body instanceof FormData))
  })
  assertOkResponse(response)
  const text: string = await response.text()
  const trimmedText: string = text.trim()

  if (trimmedText.startsWith('<')) {
    throw new Error('接口返回了 HTML 页面，不是 JSON 数据')
  }

  try {
    return JSON.parse(trimmedText) as T
  } catch {
    throw new Error('接口返回的 JSON 格式不正确')
  }
}

export async function postJson<T>(input: RequestInput, body: unknown, init?: RequestInit): Promise<T> {
  return requestJson<T>(input, {
    ...init,
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export async function requestText(input: RequestInput, init?: RequestInit): Promise<string> {
  const response: Response = await request(input, init)
  assertOkResponse(response)
  return response.text()
}
