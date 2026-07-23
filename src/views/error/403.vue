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

  .shield-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(185, 28, 28, 0.05) 100%);
    border: 2px solid rgba(239, 68, 68, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    position: relative;
    overflow: hidden;

    .shield-icon {
      font-size: 56px;
    }

    .laser-scanner {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, transparent, #ef4444, transparent);
      box-shadow: 0 0 15px #ef4444;
      animation: scan 2s ease-in-out infinite alternate;
    }
  }

  .error-code {
    font-size: 88px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 4px;
    background: linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
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

  .security-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 14px;
    padding: 20px;
    text-align: left;
    margin-bottom: 32px;

    .card-header {
      margin-bottom: 16px;
      .firewall-badge {
        font-weight: bold;
        font-size: 14px;
        color: #fca5a5;
      }
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
      font-size: 13px;

      .grid-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .label {
          color: #94a3b8;
        }

        .value {
          color: #f1f5f9;
          font-weight: 500;

          &.role {
            color: #fbbf24;
            font-weight: bold;
          }

          &.text-danger {
            color: #fca5a5;
          }

          code {
            background: rgba(0, 0, 0, 0.4);
            padding: 2px 6px;
            border-radius: 4px;
            color: #f87171;
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

@keyframes scan {
  from { top: 0; }
  to { top: 100%; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
