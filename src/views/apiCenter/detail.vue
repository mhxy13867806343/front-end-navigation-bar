<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { jsonHeaders, request } from '@/utils/request'
import { resolveApiUrl } from '@/utils/resolveApiUrl'
import { findApiEndpoint, getCategoryEndpoints, type ApiEndpointRecord, type ApiParam, type ApiValue } from './shared'

type QueryInputs = Record<string, ApiValue>

const route = useRoute()
const router = useRouter()

const authToken = ref<string>(localStorage.getItem('auth_token') || '')
const pathInputs = reactive<QueryInputs>({})
const queryInputs = reactive<QueryInputs>({})
const bodyContent = ref<string>('')
const requestUrl = ref<string>('')
const responseHeaders = ref<string>('')
const responseText = ref<string>('')
const requestLoading = ref<boolean>(false)

const envPlaceholderRegexp: RegExp = /\{\{([A-Z0-9_]+)\}\}/g

const categoryName = computed<string>((): string => {
  const raw = String(route.params.category || '')
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
})

const endpointName = computed<string>((): string => {
  const raw = String(route.params.endpoint || '')
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
})
const currentEndpoint = computed<ApiEndpointRecord | null>((): ApiEndpointRecord | null => {
  return findApiEndpoint(categoryName.value, endpointName.value)
})

const siblingEndpoints = computed<ApiEndpointRecord[]>((): ApiEndpointRecord[] => {
  if (!categoryName.value) return []
  return getCategoryEndpoints(categoryName.value)
})

const DEFAULT_ALAPI_TOKEN = 'qgqofofvmxtoskffd37omkscobipmn'

const resolveTemplateValue = (value: string): string => {
  return value.replace(envPlaceholderRegexp, (_match: string, key: string): string => {
    const resolved: unknown = import.meta.env[key]
    if (resolved !== undefined && resolved !== null && String(resolved).trim() !== '') {
      return String(resolved)
    }
    if (key === 'VITE_ALAPI_TOKEN') {
      return DEFAULT_ALAPI_TOKEN
    }
    return ''
  })
}

const resolveApiValue = (value: ApiValue): ApiValue => {
  if (typeof value === 'string') return resolveTemplateValue(value)
  return value
}

const resetInputRecord = (record: QueryInputs): void => {
  Object.keys(record).forEach((key: string): boolean => delete record[key])
}

const buildPreviewUrl = (endpoint: ApiEndpointRecord): string => {
  let resolvedPath: string = endpoint.path
  endpoint.pathParams.forEach((param: ApiParam): void => {
    const value: string = String(resolveApiValue(pathInputs[param.name] ?? ''))
    resolvedPath = resolvedPath.replace(`{${param.name}}`, value)
  })

  let url: string = `${(endpoint.baseUrl || 'https://api.apiopen.top').replace(/\/$/, '')}${resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`}`
  const queryParams: URLSearchParams = new URLSearchParams()

  Object.keys(queryInputs).forEach((key: string): void => {
    const value: ApiValue = resolveApiValue(queryInputs[key])
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value))
    }
  })

  const queryString: string = queryParams.toString()
  if (queryString) url += `?${queryString}`

  return resolveApiUrl(url)
}

const sendRequest = async (): Promise<void> => {
  if (!currentEndpoint.value) return

  requestLoading.value = true
  responseText.value = ''
  responseHeaders.value = ''

  const endpoint: ApiEndpointRecord = currentEndpoint.value
  let resolvedPath: string = endpoint.path
  endpoint.pathParams.forEach((param: ApiParam): void => {
    const value: string = String(resolveApiValue(pathInputs[param.name] ?? ''))
    resolvedPath = resolvedPath.replace(`{${param.name}}`, value)
  })

  let url: string = `${(endpoint.baseUrl || 'https://api.apiopen.top').replace(/\/$/, '')}${resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`}`
  const queryParams: URLSearchParams = new URLSearchParams()

  Object.keys(queryInputs).forEach((key: string): void => {
    const value: ApiValue = resolveApiValue(queryInputs[key])
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value))
    }
  })

  const queryString: string = queryParams.toString()
  if (queryString) url += `?${queryString}`

  requestUrl.value = resolveApiUrl(url)

  const headers: Record<string, string> = jsonHeaders()
  Object.entries(endpoint.headers || {}).forEach(([key, value]: [string, string]): void => {
    const resolvedValue: string = resolveTemplateValue(value)
    if (resolvedValue) headers[key] = resolvedValue
  })

  if (!endpoint.skipAuth && authToken.value.trim()) {
    headers.Authorization = `Bearer ${authToken.value.trim()}`
  }

  const options: RequestInit = {
    method: endpoint.method,
    headers
  }

  if (endpoint.hasBody && bodyContent.value.trim()) {
    options.body = bodyContent.value
    Object.assign(headers, jsonHeaders(headers, true))
  }

  try {
    const response: Response = await request(url, options)
    const text: string = await response.text()
    responseHeaders.value = `Status: ${response.status} ${response.statusText}\nContent-Type: ${response.headers.get('content-type') || 'unknown'}`

    if (endpoint.responseType === 'text') {
      responseText.value = text
    } else {
      try {
        responseText.value = JSON.stringify(JSON.parse(text), null, 2)
      } catch {
        responseText.value = text || '{}'
      }
    }
  } catch (error: unknown) {
    responseText.value = error instanceof Error ? error.message : String(error)
  } finally {
    requestLoading.value = false
  }
}

const initializeEndpointState = (endpoint: ApiEndpointRecord | null): void => {
  resetInputRecord(pathInputs)
  resetInputRecord(queryInputs)
  bodyContent.value = ''
  requestUrl.value = ''
  responseHeaders.value = ''
  responseText.value = ''

  if (!endpoint) return

  endpoint.pathParams.forEach((param: ApiParam): void => {
    pathInputs[param.name] = param.default !== undefined ? resolveApiValue(param.default) : ''
  })

  endpoint.params.forEach((param: ApiParam): void => {
    queryInputs[param.name] = param.default !== undefined ? resolveApiValue(param.default) : ''
  })

  bodyContent.value = endpoint.hasBody ? endpoint.bodyPlaceholder : ''
  requestUrl.value = buildPreviewUrl(endpoint)

  // Auto fetch data on load
  sendRequest()
}

watch(currentEndpoint, initializeEndpointState, { immediate: true })

const openEndpoint = (endpoint: ApiEndpointRecord): void => {
  void router.push({
    name: 'ApiCenterDetail',
    params: {
      category: endpoint.categoryName,
      endpoint: endpoint.name
    }
  })
}

const goBack = (): void => {
  void router.push({
    name: 'ApiCenter',
    query: categoryName.value ? { category: categoryName.value } : {}
  })
}

watch([pathInputs, queryInputs, bodyContent], (): void => {
  if (!currentEndpoint.value) return
  requestUrl.value = buildPreviewUrl(currentEndpoint.value)
}, { deep: true })

const viewMode = ref<'visual' | 'json'>('visual')

const parsedResponseBody = computed<any>(() => {
  if (!responseText.value) return null
  try {
    const obj = JSON.parse(responseText.value)
    if (obj && typeof obj === 'object') {
      if (obj.data !== undefined) return obj.data
      return obj
    }
    return obj
  } catch {
    return null
  }
})

const isGoldRealtimeData = computed<boolean>(() => {
  const data = parsedResponseBody.value
  if (!Array.isArray(data) || data.length === 0) return false
  return data.some(item => item && (item.symbol !== undefined || item.buy_price !== undefined || (item.name && ['黄金', '白银', '铂金', '钯金'].includes(item.name))))
})

const isGoldBrandData = computed<boolean>(() => {
  const data = parsedResponseBody.value
  if (!Array.isArray(data) || data.length === 0) return false
  return data.some(item => item && item.brand_name !== undefined && item.price !== undefined)
})

const isImageUrlData = computed<boolean>(() => {
  const data = parsedResponseBody.value
  if (typeof data === 'string') {
    return /^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i.test(data)
  }
  return false
})

const isArrayData = computed<boolean>(() => {
  return Array.isArray(parsedResponseBody.value)
})

const isObjectData = computed<boolean>(() => {
  return typeof parsedResponseBody.value === 'object' && parsedResponseBody.value !== null && !Array.isArray(parsedResponseBody.value)
})

const getObjectKeys = (obj: any): string[] => {
  if (!obj || typeof obj !== 'object') return []
  return Object.keys(obj)
}
</script>

<template>
  <main class="api-detail-page">
    <template v-if="currentEndpoint">
      <section class="detail-hero">
        <button type="button" class="back-btn" @click="goBack">← 返回接口中心</button>
        <div class="detail-hero-main">
          <div>
            <p class="detail-kicker">{{ currentEndpoint.categoryName }}</p>
            <h1>{{ currentEndpoint.name }}</h1>
            <p>{{ currentEndpoint.desc || '实时拉取并展示最新数据内容。' }}</p>
          </div>
          <div class="hero-method-card">
            <span class="method-badge" :class="currentEndpoint.method.toLowerCase()">{{ currentEndpoint.method }}</span>
            <strong>{{ currentEndpoint.path }}</strong>
          </div>
        </div>
      </section>

      <section class="detail-layout">
        <aside class="detail-sidebar">
          <div class="sidebar-block">
            <div class="sidebar-block-head">
              <strong>同分类接口</strong>
              <span>{{ siblingEndpoints.length }} 个</span>
            </div>
            <button
              v-for="endpoint in siblingEndpoints"
              :key="endpoint.name"
              type="button"
              class="sibling-item"
              :class="{ active: endpoint.name === currentEndpoint.name }"
              @click="openEndpoint(endpoint)"
            >
              <span class="method-badge tiny" :class="endpoint.method.toLowerCase()">{{ endpoint.method }}</span>
              <strong>{{ endpoint.name }}</strong>
              <em>{{ endpoint.path }}</em>
            </button>
          </div>
        </aside>

        <section class="detail-main" v-loading="requestLoading" element-loading-background="rgba(10, 13, 20, 0.7)">
          <div class="detail-card main-visual-card">
            <!-- 纯可视化数据展示层 -->
            <div v-if="parsedResponseBody" class="visual-response-container">
              <!-- 1. 贵金属/黄金实时价格行情卡片 -->
              <div v-if="isGoldRealtimeData" class="visual-gold-grid">
                <div v-for="(item, idx) in parsedResponseBody" :key="item.symbol || idx" class="metal-card">
                  <div class="metal-card-header">
                    <div class="metal-symbol-badge">{{ item.symbol || 'Au' }}</div>
                    <div class="metal-title">{{ item.name || '贵金属' }}</div>
                  </div>
                  <div class="metal-price-hero">
                    <span class="price-currency">¥</span>
                    <span class="price-value">{{ item.buy_price || item.price }}</span>
                    <span class="price-tag">买入指导价</span>
                  </div>
                  <div class="metal-price-details">
                    <div class="detail-row">
                      <span class="detail-label">卖出价</span>
                      <span class="detail-val">¥ {{ item.sell_price || '-' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">最高价</span>
                      <span class="detail-val high">¥ {{ item.high_price || '-' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">最低价</span>
                      <span class="detail-val low">¥ {{ item.low_price || '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. 品牌黄金价格卡片 -->
              <div v-else-if="isGoldBrandData" class="visual-brand-grid">
                <div v-for="(item, idx) in parsedResponseBody" :key="item.brand_name || idx" class="brand-card">
                  <div class="brand-header">
                    <span class="brand-icon">🏬</span>
                    <span class="brand-name">{{ item.brand_name }}</span>
                  </div>
                  <div class="brand-price-box">
                    <span class="brand-price">¥ {{ item.price }}</span>
                    <span class="brand-unit">/克</span>
                  </div>
                  <div class="brand-footer" v-if="item.rise_price !== undefined">
                    <span class="rise-label">较昨日</span>
                    <span class="rise-badge" :class="{ 'up': item.rise_price > 0, 'down': item.rise_price < 0, 'flat': item.rise_price === 0 }">
                      {{ item.rise_price > 0 ? `+${item.rise_price} ▲` : item.rise_price < 0 ? `${item.rise_price} ▼` : '0 -' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 3. 图片直预览 -->
              <div v-else-if="isImageUrlData" class="visual-image-box">
                <el-image :src="parsedResponseBody" fit="contain" :preview-src-list="[parsedResponseBody]" class="response-img" />
              </div>

              <!-- 4. 通用数组表格视图 -->
              <div v-else-if="isArrayData" class="visual-table-box">
                <el-table :data="parsedResponseBody" stripe border style="width: 100%" max-height="550" class="custom-data-table">
                  <el-table-column
                    v-for="key in getObjectKeys(parsedResponseBody[0])"
                    :key="key"
                    :prop="key"
                    :label="key"
                    min-width="130"
                    show-overflow-tooltip
                  />
                </el-table>
              </div>

              <!-- 5. 通用 Key-Value 属性卡片视图 -->
              <div v-else-if="isObjectData" class="visual-object-grid">
                <div v-for="(val, key) in parsedResponseBody" :key="key" class="kv-card">
                  <span class="kv-key">{{ key }}</span>
                  <span class="kv-value">{{ typeof val === 'object' ? JSON.stringify(val) : val }}</span>
                </div>
              </div>
            </div>

            <div v-else class="visual-empty-box">
              <el-empty description="正在拉取数据中..." />
            </div>
          </div>
        </section>
      </section>
    </template>

    <section v-else class="api-detail-empty">
      <h1>接口不存在</h1>
      <p>当前分类或接口名称没有命中配置，返回接口中心重新选择即可。</p>
      <button type="button" class="back-btn" @click="goBack">返回接口中心</button>
    </section>
  </main>
</template>

<style scoped lang="scss" src="./css/detail.scss"></style>
