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

<style scoped lang="scss" src="./css/401.scss"></style>
