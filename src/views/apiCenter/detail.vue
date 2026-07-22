<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, CopyDocument, StarFilled, Delete } from '@element-plus/icons-vue'
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

const isMingyanData = computed<boolean>(() => {
  const data = parsedResponseBody.value
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  return data.content !== undefined && (data.author !== undefined || data.typeid !== undefined)
})

const isMingyanTypeData = computed<boolean>(() => {
  const data = parsedResponseBody.value
  if (!Array.isArray(data) || data.length === 0) return false
  return data.every(item => item && item.label !== undefined && item.value !== undefined)
})

const favoriteQuotes = ref<any[]>(
  JSON.parse(localStorage.getItem('favorite_mingyan_quotes') || '[]')
)

const handleRefreshQuote = (): void => {
  sendRequest()
  ElMessage.success('已刷新获取新的一句名言！')
}

const copyQuoteText = (quote: any): void => {
  const text: string = `“${quote.content}” —— ${quote.author || '匿名'}`
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('名言金句已成功复制到剪贴板！')
    }).catch(() => {
      fallbackCopy(text)
    })
  } else {
    fallbackCopy(text)
  }
}

function fallbackCopy(text: string) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  try {
    document.execCommand('copy')
    ElMessage.success('名言金句已成功复制到剪贴板！')
  } catch {
    ElMessage.error('复制失败，请手动选择文本')
  }
  document.body.removeChild(textArea)
}

const isCurrentFavorite = computed<boolean>(() => {
  const data = parsedResponseBody.value
  if (!data || !data.content) return false
  return favoriteQuotes.value.some(
    (item: any) => item.content === data.content && item.author === data.author
  )
})

const toggleFavorite = (quote: any): void => {
  const idx: number = favoriteQuotes.value.findIndex(
    (item: any) => item.content === quote.content && item.author === quote.author
  )
  if (idx >= 0) {
    favoriteQuotes.value.splice(idx, 1)
    ElMessage.info('已取消收藏')
  } else {
    favoriteQuotes.value.unshift({ ...quote })
    ElMessage.success('已添加到金句收藏库！')
  }
  localStorage.setItem('favorite_mingyan_quotes', JSON.stringify(favoriteQuotes.value))
}

const confirmRemoveFavorite = (index: number, quote: any): void => {
  ElMessageBox.confirm(
    `确定要从金句收藏库中删除这句名言吗？\n\n“${quote.content}”`,
    '确认删除提示',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    favoriteQuotes.value.splice(index, 1)
    localStorage.setItem('favorite_mingyan_quotes', JSON.stringify(favoriteQuotes.value))
    ElMessage.success('已从金句收藏库中删除该名言！')
  }).catch(() => {
    ElMessage.info('已取消删除操作')
  })
}

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

              <!-- 3. 名人名言精选卡片 -->
              <div v-else-if="isMingyanData" class="visual-mingyan-card" style="background: linear-gradient(135deg, rgba(30, 25, 58, 0.95), rgba(18, 14, 38, 0.98)); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 20px; padding: 32px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                  <span style="background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.3); color: #c084fc; font-size: 13px; font-weight: 600; padding: 4px 14px; border-radius: 14px;">🏷️ 名人名言精选</span>
                  <el-button type="primary" plain circle :icon="Refresh" :loading="requestLoading" title="换一句" @click="handleRefreshQuote" />
                </div>
                <div style="font-size: 22px; line-height: 1.8; font-weight: 600; color: #f8fafc; margin-bottom: 20px; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                  “{{ parsedResponseBody.content }}”
                </div>
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-bottom: 24px;">
                  <span style="width: 24px; height: 2px; background: #a855f7;"></span>
                  <span style="font-size: 16px; font-weight: 700; color: #e2e8f0;">—— {{ parsedResponseBody.author || '网络收集' }}</span>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                  <el-button type="primary" size="large" :icon="Refresh" :loading="requestLoading" @click="handleRefreshQuote">🔄 换一句 / 刷新</el-button>
                  <el-button type="default" size="large" :icon="CopyDocument" @click="copyQuoteText(parsedResponseBody)">📋 一键复制</el-button>
                  <el-button :type="isCurrentFavorite ? 'warning' : 'default'" size="large" :icon="StarFilled" @click="toggleFavorite(parsedResponseBody)">
                    {{ isCurrentFavorite ? '已收藏' : '⭐ 收藏金句' }}
                  </el-button>
                </div>

                <!-- 收藏列表展示 -->
                <div v-if="favoriteQuotes.length > 0" style="margin-top: 32px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 24px;">
                  <h3 style="font-size: 16px; color: #f1f5f9; margin-bottom: 16px;">⭐ 我的金句收藏库 ({{ favoriteQuotes.length }})</h3>
                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
                    <div v-for="(item, idx) in favoriteQuotes" :key="idx" style="background: rgba(22, 19, 43, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px;">
                      <div style="font-size: 14px; color: #e2e8f0; margin-bottom: 10px; line-height: 1.5;">“{{ item.content }}”</div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.06);">
                        <span style="font-size: 12px; color: #94a3b8;">—— {{ item.author || '匿名' }}</span>
                        <div style="display: flex; gap: 4px;">
                          <el-button size="small" circle :icon="CopyDocument" title="复制" @click="copyQuoteText(item)" />
                          <el-button size="small" type="danger" plain circle :icon="Delete" title="删除收藏" @click="confirmRemoveFavorite(idx, item)" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4. 名人名言类型卡片展示 -->
              <div v-else-if="isMingyanTypeData" class="visual-mingyan-type-grid" style="display: flex; flex-wrap: wrap; gap: 10px; padding: 20px; background: rgba(22, 19, 43, 0.8); border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
                <div v-for="cat in parsedResponseBody" :key="cat.value" style="background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.3); color: #c084fc; padding: 8px 18px; border-radius: 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
                  🏷️ {{ cat.label }} (ID: {{ cat.value }})
                </div>
              </div>

              <!-- 5. 图片直预览 -->
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
