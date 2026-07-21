import apiCategoriesData from '@/utlis/api_list.json'

export type ApiValue = string | number | boolean

export interface ApiParamOption {
  label: string
  value: ApiValue
}

export interface ApiParam {
  name: string
  label?: string
  description?: string
  type: 'text' | 'number' | 'select' | 'switch' | string
  placeholder?: string
  required?: boolean
  default?: ApiValue
  options?: ApiParamOption[]
}

export interface ApiEndpoint {
  name: string
  desc?: string
  baseUrl?: string
  path: string
  method: string
  params: ApiParam[]
  pathParams: ApiParam[]
  hasBody: boolean
  bodyPlaceholder: string
  headers?: Record<string, string>
  skipAuth?: boolean
  responseType?: 'json' | 'text'
  categoryName?: string
}

export interface ApiEndpointRecord extends ApiEndpoint {
  categoryName: string
}

export const apiCategories = apiCategoriesData as Record<string, ApiEndpoint[]>

export const getApiCategoryNames = (): string[] => Object.keys(apiCategories)

export const getCategoryEndpoints = (categoryName: string): ApiEndpointRecord[] => {
  const endpoints: ApiEndpoint[] = apiCategories[categoryName] || []
  return endpoints.map((endpoint: ApiEndpoint): ApiEndpointRecord => ({
    ...endpoint,
    categoryName
  }))
}

export const flattenApiEndpoints = (): ApiEndpointRecord[] => {
  return getApiCategoryNames().flatMap((categoryName: string): ApiEndpointRecord[] => getCategoryEndpoints(categoryName))
}

export const findApiEndpoint = (categoryName: string, endpointName: string): ApiEndpointRecord | null => {
  const matched: ApiEndpointRecord | undefined = getCategoryEndpoints(categoryName)
    .find((endpoint: ApiEndpointRecord): boolean => endpoint.name === endpointName)

  return matched || null
}
