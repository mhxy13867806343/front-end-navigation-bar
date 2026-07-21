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

const resolveTemplateValue = (value: string): string => {
  return value.replace(envPlaceholderRegexp, (_match: string, key: string): string => {
    const resolved: unknown = import.meta.env[key]
    return resolved === undefined || resolved === null ? '' : String(resolved)
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
}

watch(currentEndpoint, initializeEndpointState, { immediate: true })

watch([pathInputs, queryInputs, bodyContent], (): void => {
  if (!currentEndpoint.value) return
  requestUrl.value = buildPreviewUrl(currentEndpoint.value)
}, { deep: true })

const saveAuthToken = (): void => {
  localStorage.setItem('auth_token', authToken.value)
  ElMessage.success('认证 Token 已保存')
}

const clearAuthToken = (): void => {
  authToken.value = ''
  localStorage.removeItem('auth_token')
  ElMessage.success('认证 Token 已清空')
}

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
            <p>{{ currentEndpoint.desc || '查看接口说明、填写参数并直接请求返回结果。' }}</p>
          </div>
          <div class="hero-method-card">
            <span class="method-badge" :class="currentEndpoint.method.toLowerCase()">{{ currentEndpoint.method }}</span>
            <strong>{{ currentEndpoint.path }}</strong>
            <span>{{ currentEndpoint.skipAuth ? '免登录' : '需要认证' }}</span>
          </div>
        </div>
      </section>

      <section class="detail-layout">
        <aside class="detail-sidebar">
          <div class="sidebar-block" v-if="!currentEndpoint.skipAuth">
            <div class="sidebar-block-head">
              <strong>Authorization Header</strong>
            </div>
            <el-input
              v-model="authToken"
              placeholder="请输入 Bearer Token"
              type="textarea"
              :rows="3"
            />
            <div class="auth-actions">
              <el-button type="primary" size="small" @click="saveAuthToken">保存</el-button>
              <el-button size="small" @click="clearAuthToken">清空</el-button>
            </div>
          </div>

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

        <section class="detail-main">
          <div class="detail-card">
            <div class="detail-card-head">
              <h2>请求参数</h2>
              <span>{{ currentEndpoint.params.length + currentEndpoint.pathParams.length }} 项</span>
            </div>

            <div v-if="currentEndpoint.pathParams.length" class="param-group">
              <h3>Path Parameters</h3>
              <div v-for="param in currentEndpoint.pathParams" :key="`path-${param.name}`" class="param-row">
                <label>{{ param.label || param.name }}</label>
                <el-input v-model="pathInputs[param.name]" :placeholder="param.placeholder || param.name" />
              </div>
            </div>

            <div v-if="currentEndpoint.params.length" class="param-group">
              <h3>Query Parameters</h3>
              <div v-for="param in currentEndpoint.params" :key="`query-${param.name}`" class="param-row">
                <label>
                  {{ param.label || param.name }}
                  <span v-if="param.required" class="required-mark">*</span>
                </label>
                <el-select
                  v-if="param.type === 'select'"
                  v-model="queryInputs[param.name]"
                  :placeholder="param.placeholder || param.name"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="option in param.options || []"
                    :key="`${param.name}-${option.value}`"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-input-number
                  v-else-if="param.type === 'number'"
                  v-model="queryInputs[param.name]"
                  style="width: 100%;"
                />
                <div v-else-if="param.type === 'switch'" class="switch-row">
                  <el-switch v-model="queryInputs[param.name]" />
                  <span>{{ param.description || param.label || param.name }}</span>
                </div>
                <el-input
                  v-else
                  v-model="queryInputs[param.name]"
                  :placeholder="param.placeholder || param.name"
                />
                <small v-if="param.description" class="param-desc">{{ param.description }}</small>
              </div>
            </div>

            <div v-if="currentEndpoint.hasBody" class="param-group">
              <h3>Request Body</h3>
              <textarea
                v-model="bodyContent"
                class="body-editor"
                spellcheck="false"
              ></textarea>
            </div>

            <div class="request-actions">
              <el-button type="primary" :loading="requestLoading" @click="sendRequest">发送接口请求</el-button>
              <span class="request-tip">当前页面会直接展示请求 URL、响应头和响应结果。</span>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-card-head">
              <h2>请求预览</h2>
              <span>{{ currentEndpoint.baseUrl || 'https://api.apiopen.top' }}</span>
            </div>
            <pre class="preview-box">{{ requestUrl }}</pre>
          </div>

          <div class="detail-card">
            <div class="detail-card-head">
              <h2>响应头</h2>
            </div>
            <pre class="preview-box">{{ responseHeaders || '发送请求后，这里会展示响应头。' }}</pre>
          </div>

          <div class="detail-card">
            <div class="detail-card-head">
              <h2>响应结果</h2>
            </div>
            <pre class="response-box">{{ responseText || '发送请求后，这里会展示响应结果。' }}</pre>
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
