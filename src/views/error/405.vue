<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ErrorLayout from './ErrorLayout.vue'

const router = useRouter()

const selectedMethod = ref('DELETE')
const apiEndpoint = ref('/api/v1/user/settings')
const allowedMethods = ['GET', 'POST', 'OPTIONS']
const responseLog = ref('')

const httpMethods = [
  { name: 'GET', allowed: true, color: '#10b981' },
  { name: 'POST', allowed: true, color: '#3b82f6' },
  { name: 'PUT', allowed: false, color: '#f59e0b' },
  { name: 'DELETE', allowed: false, color: '#ef4444' },
  { name: 'PATCH', allowed: false, color: '#8b5cf6' }
]

const testApiMethod = (method: string) => {
  selectedMethod.value = method
  const isAllowed = allowedMethods.includes(method)

  if (isAllowed) {
    responseLog.value = `HTTP/1.1 200 OK\nContent-Type: application/json\nDate: ${new Date().toUTCString()}\n\n{\n  "status": 200,\n  "message": "请求成功！${method} 方法在本端点允许执行。"\n}`
    ElMessage.success(`方法 ${method} 测试成功！(200 OK)`)
  } else {
    responseLog.value = `HTTP/1.1 405 Method Not Allowed\nAllow: ${allowedMethods.join(', ')}\nContent-Type: application/json\n\n{\n  "error": "Method Not Allowed",\n  "status": 405,\n  "detail": "Endpoint ${apiEndpoint.value} does not support HTTP ${method} requests."\n}`
    ElMessage.error(`方法 ${method} 不受支持！触发 405 Method Not Allowed 状态！`)
  }
}

const copyCurlCode = () => {
  const curlCmd = `curl -X ${selectedMethod.value} "https://api.example.com${apiEndpoint.value}" -H "Accept: application/json"`
  navigator.clipboard.writeText(curlCmd)
  ElMessage.success('cURL 测试命令已复制到剪贴板！')
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <ErrorLayout>
    <div class="error-container">
      <div class="visual-hero">
        <div class="method-circle">
          <span class="method-icon">⚡</span>
          <div class="pulse-border"></div>
        </div>
        <div class="error-code">405</div>
      </div>

      <div class="error-info">
        <h1 class="error-title">HTTP 405 Method Not Allowed / 请求方法受限</h1>
        <p class="error-desc">
          服务器理解本次请求，但目标 API 路由不支持所使用的 HTTP 方法（例如用 DELETE 方式提交给仅允许 POST/GET 的接口）。
        </p>

        <!-- Interactive REST Tester Card -->
        <div class="tester-card">
          <div class="card-header">
            <span class="endpoint-title">目标 API 接口端点: <code>{{ apiEndpoint }}</code></span>
            <div class="allow-badge">Allow: {{ allowedMethods.join(', ') }}</div>
          </div>

          <div class="method-selector">
            <span class="selector-label">切换 HTTP 谓词方法尝试:</span>
            <div class="btn-grid">
              <button
                v-for="m in httpMethods"
                :key="m.name"
                class="method-btn"
                :class="{ active: selectedMethod === m.name, allowed: m.allowed }"
                @click="testApiMethod(m.name)"
              >
                <span class="m-name" :style="{ color: m.color }">{{ m.name }}</span>
                <span class="m-status">{{ m.allowed ? '✓ 允许' : '✕ 禁用' }}</span>
              </button>
            </div>
          </div>

          <!-- Console Response Inspector -->
          <div class="response-inspector">
            <div class="inspector-header">
              <span>模拟服务器 Response 报文预览</span>
              <el-button type="info" link size="small" @click="copyCurlCode">📋 复制 cURL 命令</el-button>
            </div>
            <pre class="code-block"><code>{{ responseLog || '点击上方 HTTP 方法按钮立即发起到接口的调试请求...' }}</code></pre>
          </div>
        </div>

        <div class="action-btn-group">
          <el-button type="primary" size="large" @click="testApiMethod('GET')">
            🔄 切换至合法 GET 请求
          </el-button>
          <el-button type="success" size="large" plain @click="copyCurlCode">
            📋 复制标准 cURL
          </el-button>
          <el-button size="large" @click="goHome">
            🏠 返回首页
          </el-button>
        </div>
      </div>
    </div>
  </ErrorLayout>
</template>

<style scoped lang="scss" src="./css/405.scss"></style>
