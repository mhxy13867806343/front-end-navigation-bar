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

<style scoped lang="scss">
.error-container {
  max-width: 880px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeIn 0.4s ease-out;
}

.visual-hero {
  position: relative;
  margin-bottom: 20px;

  .method-circle {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.05) 100%);
    border: 2px solid rgba(59, 130, 246, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    position: relative;

    .method-icon {
      font-size: 54px;
      animation: rotatePulse 3s infinite ease-in-out;
    }
  }

  .error-code {
    font-size: 88px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 4px;
    background: linear-gradient(135deg, #38bdf8 0%, #0284c7 50%, #0369a1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 30px rgba(56, 189, 248, 0.3);
  }
}

.error-info {
  width: 100%;

  .error-title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 10px;
    color: #f8fafc;
  }

  .error-desc {
    font-size: 15px;
    color: #94a3b8;
    max-width: 660px;
    margin: 0 auto 24px;
    line-height: 1.6;
  }

  .tester-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 20px;
    text-align: left;
    margin-bottom: 32px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 12px;
      flex-wrap: wrap;

      .endpoint-title {
        font-size: 14px;
        color: #cbd5e1;

        code {
          background: rgba(0, 0, 0, 0.4);
          padding: 3px 8px;
          border-radius: 4px;
          color: #38bdf8;
          font-family: monospace;
        }
      }

      .allow-badge {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.3);
        padding: 2px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
    }

    .method-selector {
      margin-bottom: 20px;

      .selector-label {
        font-size: 13px;
        color: #94a3b8;
        display: block;
        margin-bottom: 10px;
      }

      .btn-grid {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;

        .method-btn {
          flex: 1;
          min-width: 110px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;

          &:hover {
            border-color: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }

          &.active {
            border-color: #38bdf8;
            background: rgba(56, 189, 248, 0.1);
            box-shadow: 0 4px 12px rgba(56, 189, 248, 0.2);
          }

          .m-name {
            font-weight: 800;
            font-size: 15px;
          }

          .m-status {
            font-size: 11px;
            color: #94a3b8;
          }
        }
      }
    }

    .response-inspector {
      background: #090d16;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 14px;

      .inspector-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 12px;
        color: #94a3b8;
      }

      .code-block {
        margin: 0;
        font-family: 'Courier New', Courier, monospace;
        font-size: 13px;
        color: #38bdf8;
        white-space: pre-wrap;
        word-break: break-all;
        line-height: 1.5;
      }
    }
  }

  .action-btn-group {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

@keyframes rotatePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
