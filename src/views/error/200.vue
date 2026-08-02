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

<style scoped lang="scss" src="./css/200.scss"></style>
