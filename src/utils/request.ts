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
  return fetch(input, init)
}

export async function requestJson<T>(input: RequestInput, init?: RequestInit): Promise<T> {
  const response: Response = await request(input, {
    ...init,
    headers: jsonHeaders(init?.headers, Boolean(init?.body) && !(init?.body instanceof FormData))
  })
  return response.json() as Promise<T>
}

export async function requestText(input: RequestInput, init?: RequestInit): Promise<string> {
  const response: Response = await request(input, init)
  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`)
  }
  return response.text()
}
