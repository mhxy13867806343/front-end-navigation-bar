<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ErrorLayout from './ErrorLayout.vue'

const router = useRouter()

const loginDialogVisible = ref(false)
const username = ref('admin')
const password = ref('123456')
const selectedRole = ref('admin')
const tokenStatus = ref('expired') // 'none' | 'expired' | 'valid'

const simulatedLogin = () => {
  if (!username.value || !password.value) {
    ElMessage.warning('请输入用户名和密码！')
    return
  }
  tokenStatus.value = 'valid'
  ElMessage.success(`模拟登录成功！当前身份：${selectedRole.value === 'admin' ? '超级管理员' : '普通用户'}`)
  loginDialogVisible.value = false
}

const refreshAuthToken = () => {
  tokenStatus.value = 'valid'
  ElMessage.success('Token 刷新成功，凭证重新生效！')
}

const clearAuthToken = () => {
  tokenStatus.value = 'none'
  ElMessage.info('已清除现有登录凭证')
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
        <div class="lock-circle">
          <span class="lock-icon">🔑</span>
          <div class="pulse-ring"></div>
        </div>
        <div class="error-code">401</div>
      </div>

      <div class="error-info">
        <h1 class="error-title">HTTP 401 Unauthorized / 未授权访问</h1>
        <p class="error-desc">
          您的访问凭证已过期或无效。出于安全考量，访问受保护的 API 接口或系统资源前需完成身份验证。
        </p>

        <div class="token-status-card">
          <div class="card-header">
            <span class="dot" :class="tokenStatus"></span>
            <span class="status-text">
              状态检测: {{ tokenStatus === 'valid' ? '凭证有效 (Authenticated)' : tokenStatus === 'expired' ? 'Token 已过期 (Expired)' : '未提供 Token (Anonymous)' }}
            </span>
          </div>
          <div class="card-details">
            <p><strong>请求地址:</strong> <code>/api/v1/protected/user-profile</code></p>
            <p><strong>响应头:</strong> <code>WWW-Authenticate: Bearer realm="Access to staging API"</code></p>
            <p><strong>解决方案:</strong> 请重新登录获取合法 Bearer JWT Token 或刷新会话。</p>
          </div>
        </div>

        <div class="action-btn-group">
          <el-button type="primary" size="large" @click="loginDialogVisible = true">
            🔒 模拟重新登录
          </el-button>
          <el-button type="success" size="large" plain @click="refreshAuthToken">
            ⚡ 一键刷新 Token
          </el-button>
          <el-button type="warning" size="large" plain @click="goPermissionPage">
            🔐 前往权限控制中心
          </el-button>
          <el-button size="large" @click="goHome">
            🏠 返回首页
          </el-button>
        </div>
      </div>

      <!-- Quick Login Dialog -->
      <el-dialog
        v-model="loginDialogVisible"
        title="模拟身份鉴权登录"
        width="440px"
        append-to-body
        align-center
      >
        <el-form label-position="top">
          <el-form-item label="用户名 / 账号">
            <el-input v-model="username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="password" type="password" show-password placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="选择模拟角色">
            <el-radio-group v-model="selectedRole">
              <el-radio-button label="admin">超级管理员 (Admin)</el-radio-button>
              <el-radio-button label="user">普通用户 (User)</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="loginDialogVisible = false">取消</el-button>
          <el-button type="danger" plain @click="clearAuthToken">清空凭证</el-button>
          <el-button type="primary" @click="simulatedLogin">立即登录认证</el-button>
        </template>
      </el-dialog>
    </div>
  </ErrorLayout>
</template>

<style scoped lang="scss">
.error-container {
  max-width: 860px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeIn 0.4s ease-out;
}

.visual-hero {
  position: relative;
  margin-bottom: 24px;

  .lock-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.05) 100%);
    border: 2px solid rgba(59, 130, 246, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    position: relative;

    .lock-icon {
      font-size: 56px;
      animation: float 3s ease-in-out infinite;
    }

    .pulse-ring {
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      border: 1px solid rgba(96, 165, 250, 0.3);
      animation: pulse 2.5s infinite;
    }
  }

  .error-code {
    font-size: 88px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 4px;
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
  }
}

.error-info {
  .error-title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #f8fafc;
  }

  .error-desc {
    font-size: 15px;
    color: #94a3b8;
    max-width: 640px;
    margin: 0 auto 28px;
    line-height: 1.6;
  }

  .token-status-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    text-align: left;
    margin-bottom: 32px;

    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      font-weight: 600;
      font-size: 15px;

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        &.valid { background: #10b981; box-shadow: 0 0 10px #10b981; }
        &.expired { background: #f59e0b; box-shadow: 0 0 10px #f59e0b; }
        &.none { background: #ef4444; box-shadow: 0 0 10px #ef4444; }
      }
    }

    .card-details {
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.8;

      code {
        background: rgba(0, 0, 0, 0.4);
        padding: 2px 8px;
        border-radius: 4px;
        font-family: monospace;
        color: #93c5fd;
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
  50% { transform: translateY(-8px); }
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
