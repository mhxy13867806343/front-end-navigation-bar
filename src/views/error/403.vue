<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ErrorLayout from './ErrorLayout.vue'

const router = useRouter()

const applyDialogVisible = ref(false)
const applyReason = ref('')
const currentRole = ref('Guest / 访客')
const requiredPermission = ref('system:data:export')

const handleApplyPermission = () => {
  if (!applyReason.value.trim()) {
    ElMessage.warning('请填写申请访问的具体原因！')
    return
  }
  ElMessage.success('权限申请已提交给系统管理员审核！工单号：#REQ-' + Math.floor(1000 + Math.random() * 9000))
  applyReason.value = ''
  applyDialogVisible.value = false
}

const simulateElevateRole = () => {
  currentRole.value = 'Super Admin / 超级管理员'
  ElMessage.success('⚡ 身份已临时提升为 [超级管理员]，允许访问绝密区域！')
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
        <div class="shield-circle">
          <span class="shield-icon">🛡️</span>
          <div class="laser-scanner"></div>
        </div>
        <div class="error-code">403</div>
      </div>

      <div class="error-info">
        <h1 class="error-title">HTTP 403 Forbidden / 禁止访问专区</h1>
        <p class="error-desc">
          系统防御机制阻止了本次请求。您当前的账户角色缺乏访问该模块所需的绝密安全权限或令牌标记。
        </p>

        <!-- Security Rule Breakdown Card -->
        <div class="security-card">
          <div class="card-header">
            <span class="firewall-badge">🛡️ 系统防火墙安全审计报告</span>
          </div>
          <div class="card-grid">
            <div class="grid-item">
              <span class="label">当前登录角色:</span>
              <span class="value role">{{ currentRole }}</span>
            </div>
            <div class="grid-item">
              <span class="label">所需权限标识:</span>
              <span class="value code"><code>{{ requiredPermission }}</code></span>
            </div>
            <div class="grid-item">
              <span class="label">客户端 IP 地址:</span>
              <span class="value">127.0.0.1 (内网安全测试)</span>
            </div>
            <div class="grid-item">
              <span class="label">拦截原因:</span>
              <span class="value text-danger">RBAC 角色拦截器抛出 AccessDeniedException</span>
            </div>
          </div>
        </div>

        <div class="action-btn-group">
          <el-button type="danger" size="large" @click="applyDialogVisible = true">
            📝 提交临时访问权限申请
          </el-button>
          <el-button type="success" size="large" plain @click="simulateElevateRole">
            ⚡ 一键提权为管理员
          </el-button>
          <el-button type="warning" size="large" plain @click="goPermissionPage">
            🔐 管理员权限控制台
          </el-button>
          <el-button size="large" @click="goHome">
            🏠 返回首页
          </el-button>
        </div>
      </div>

      <!-- Apply Permission Modal -->
      <el-dialog v-model="applyDialogVisible" title="申请资源访问权限" width="460px" append-to-body align-center>
        <el-form label-position="top">
          <el-form-item label="请求访问的受限节点">
            <el-input :value="requiredPermission" disabled />
          </el-form-item>
          <el-form-item label="申请事由 / 业务说明">
            <el-input
              v-model="applyReason"
              type="textarea"
              :rows="3"
              placeholder="例如：因业务审计需求，需要临时调用导出接口"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="applyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleApplyPermission">提交申请工单</el-button>
        </template>
      </el-dialog>
    </div>
  </ErrorLayout>
</template>

<style scoped lang="scss" src="./css/403.scss"></style>
