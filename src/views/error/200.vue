<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ErrorLayout from './ErrorLayout.vue'

const router = useRouter()

const responseTime = ref(14)
const isRefreshing = ref(false)

const refreshStatus = () => {
  isRefreshing.value = true
  setTimeout(() => {
    responseTime.value = Math.floor(8 + Math.random() * 12)
    isRefreshing.value = false
    ElMessage.success('⚡ HTTP 200 健康度检测完毕，当前 API 节点响应极快！')
  }, 600)
}

const goPermissionPage = () => {
  router.push('/permission')
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <ErrorLayout>
    <div class="error-container">
      <div class="visual-hero">
        <div class="success-circle">
          <span class="success-icon">✅</span>
          <div class="pulse-ring"></div>
        </div>
        <div class="error-code">200</div>
      </div>

      <div class="error-info">
        <h1 class="error-title">HTTP 200 OK / 请求成功与鉴权通过</h1>
        <p class="error-desc">
          服务器已成功接收、理解并接受本次 HTTP/REST 请求。客户端身份校验完全合法，角色与访问权限检测全量通过！
        </p>

        <!-- Status Summary Card -->
        <div class="status-summary-card">
          <div class="card-header">
            <span class="badge ok">✓ 200 OK SUCCESS</span>
            <span class="latency-text">耗时: <code>{{ responseTime }}ms</code></span>
          </div>

          <div class="grid-details">
            <div class="detail-item">
              <span class="label">HTTP Status Header:</span>
              <span class="value"><code>HTTP/1.1 200 OK</code></span>
            </div>
            <div class="detail-item">
              <span class="label">Session Auth Token:</span>
              <span class="value text-success">Valid Bearer JWT (Verified)</span>
            </div>
            <div class="detail-item">
              <span class="label">Rate Limiter Quota:</span>
              <span class="value">10,000 / 10,000 Remaining</span>
            </div>
            <div class="detail-item">
              <span class="label">CORS Security Protocol:</span>
              <span class="value">Access-Control-Allow-Origin: *</span>
            </div>
          </div>
        </div>

        <div class="action-btn-group">
          <el-button type="success" size="large" :loading="isRefreshing" @click="refreshStatus">
            🔄 刷新健康检测 ({{ responseTime }}ms)
          </el-button>
          <el-button type="primary" size="large" plain @click="goPermissionPage">
            🔐 前往权限控制中心
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

  .success-circle {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.05) 100%);
    border: 2px solid rgba(16, 185, 129, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    position: relative;

    .success-icon {
      font-size: 54px;
      animation: float 3s ease-in-out infinite;
    }

    .pulse-ring {
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      border: 1px solid rgba(16, 185, 129, 0.3);
      animation: pulse 2.5s infinite;
    }
  }

  .error-code {
    font-size: 88px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 4px;
    background: linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
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

  .status-summary-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 14px;
    padding: 20px;
    text-align: left;
    margin-bottom: 32px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .badge.ok {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        padding: 3px 12px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 13px;
        border: 1px solid rgba(16, 185, 129, 0.4);
      }

      .latency-text {
        font-size: 13px;
        color: #94a3b8;

        code {
          color: #34d399;
          background: rgba(0, 0, 0, 0.4);
          padding: 2px 6px;
          border-radius: 4px;
        }
      }
    }

    .grid-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
      font-size: 13px;

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .label {
          color: #94a3b8;
        }

        .value {
          color: #f1f5f9;
          font-weight: 500;

          &.text-success {
            color: #34d399;
            font-weight: bold;
          }

          code {
            background: rgba(0, 0, 0, 0.4);
            padding: 2px 6px;
            border-radius: 4px;
            color: #34d399;
            font-family: monospace;
          }
        }
      }
    }
  }

  .action-btn-group {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 0.2; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
