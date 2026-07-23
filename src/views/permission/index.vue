<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import ErrorLayout from '../error/ErrorLayout.vue'

const router = useRouter()

// Role Definitions
interface RoleInfo {
  key: string
  name: string
  color: string
  description: string
  permissions: string[]
}

const roles: RoleInfo[] = [
  {
    key: 'super_admin',
    name: '超级管理员 (Super Admin)',
    color: '#ef4444',
    description: '拥有系统至高无上的全量管理与数据导处读写权限。',
    permissions: ['*']
  },
  {
    key: 'devops',
    name: '系统运维 (DevOps)',
    color: '#f59e0b',
    description: '负责集群部署、监控、重启、服务器 500 修复等运维工作。',
    permissions: ['system:server:heal', 'system:log:view', 'system:api:test', 'route:toolbox']
  },
  {
    key: 'operator',
    name: '运营专员 (Operator)',
    color: '#3b82f6',
    description: '可管理业务表单、查看 API 数据，无用户删除或核心配置修改权。',
    permissions: ['system:user:view', 'system:data:export', 'route:weather', 'route:mingyan', 'route:api-center']
  },
  {
    key: 'guest',
    name: '普通访客 (Guest)',
    color: '#94a3b8',
    description: '只读权限，仅能浏览公开大厅与公开 API，尝试敏感操作触发 403。',
    permissions: ['route:public']
  }
]

const activeRoleKey = ref<string>('super_admin')

const currentRole = computed(() => {
  return roles.find(r => r.key === activeRoleKey.value) || roles[0]
})

// Function to check permission
const hasPermission = (perm: string): boolean => {
  if (currentRole.value.permissions.includes('*')) return true
  return currentRole.value.permissions.includes(perm)
}

// Action Buttons List
const actionButtons = [
  { perm: 'system:user:add', label: '➕ 新建用户账号', type: 'primary' },
  { perm: 'system:user:edit', label: '✏️ 修改角色权限', type: 'warning' },
  { perm: 'system:user:delete', label: '🗑️ 彻底删除账号', type: 'danger' },
  { perm: 'system:data:export', label: '📥 导出全量敏感数据', type: 'success' },
  { perm: 'system:server:heal', label: '⚡ 执行 500 自动修复', type: 'info' }
]

// Log Stream
interface AuditLog {
  id: string
  time: string
  action: string
  role: string
  granted: boolean
}

const auditLogs = ref<AuditLog[]>([
  { id: '1', time: new Date().toLocaleTimeString(), action: '切换激活角色为超级管理员', role: '超级管理员', granted: true }
])

const recordLog = (action: string, granted: boolean) => {
  auditLogs.value.unshift({
    id: Date.now().toString(),
    time: new Date().toLocaleTimeString(),
    action,
    role: currentRole.value.name,
    granted
  })
  if (auditLogs.value.length > 10) auditLogs.value.pop()
}

const switchRole = (key: string) => {
  activeRoleKey.value = key
  const r = roles.find(item => item.key === key)
  recordLog(`身份切换至 [${r?.name}]`, true)
  ElMessage.success(`当前角色已切换为：${r?.name}`)
}

const handleActionClick = (perm: string, label: string) => {
  const allowed = hasPermission(perm)
  if (allowed) {
    recordLog(`高危按钮触发 [${label}] - 成功`, true)
    ElNotification({
      title: '权限鉴权成功 (200 OK)',
      message: `角色 [${currentRole.value.name}] 成功执行操作: ${label}`,
      type: 'success'
    })
  } else {
    recordLog(`高危按钮触发 [${label}] - 403 被拦截`, false)
    ElNotification({
      title: '访问被拒绝 (403 Forbidden)',
      message: `角色 [${currentRole.value.name}] 缺乏权限: ${perm}，已自动阻止该指令!`,
      type: 'error'
    })
  }
}

// Route Access Matrix
const routeMatrix = [
  { name: '仪表盘大屏 (/big-screen)', perm: 'route:bigscreen', super: true, devops: true, op: false, guest: false },
  { name: '开发者工具箱 (/toolbox)', perm: 'route:toolbox', super: true, devops: true, op: true, guest: false },
  { name: 'API 中心 (/api-center)', perm: 'route:api-center', super: true, devops: true, op: true, guest: true },
  { name: '系统 500 异常控制台 (/500)', perm: 'system:server:heal', super: true, devops: true, op: false, guest: false }
]

// Simulated JWT Payload
const jwtPayload = computed(() => {
  return JSON.stringify(
    {
      sub: 'usr_88392104',
      name: 'HooksVue Developer',
      active_role: currentRole.value.key,
      permissions: currentRole.value.permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7200,
      iss: 'https://auth.hooksvue.internal'
    },
    null,
    2
  )
})

// Status Code Input Jump Feature
const inputStatusCode = ref('200')

const quickStatusCodes = [
  { code: '200', name: '200 OK', color: '#10b981' },
  { code: '401', name: '401 Unauthorized', color: '#3b82f6' },
  { code: '402', name: '402 Payment Required', color: '#f59e0b' },
  { code: '403', name: '403 Forbidden', color: '#ef4444' },
  { code: '404', name: '404 Not Found', color: '#a855f7' },
  { code: '405', name: '405 Method Not Allowed', color: '#38bdf8' },
  { code: '500', name: '500 Server Error', color: '#dc2626' }
]

const jumpToStatusCode = (codeStr?: string) => {
  const code = (codeStr || inputStatusCode.value).trim()
  if (!code) {
    ElMessage.warning('请输入 HTTP 状态码！')
    return
  }

  const validCodes = ['200', '401', '402', '403', '404', '405', '500']
  recordLog(`发起 HTTP 状态码 [${code}] 跳转交互测试`, true)

  if (validCodes.includes(code)) {
    ElMessage.success(`🚀 正在根据输入的 HTTP 状态码 [ ${code} ] 跳转到对应展示页面...`)
    router.push(`/${code}`)
  } else {
    ElMessage.info(`状态码 [ ${code} ] 统一重定向到通用 404/异常页面展示！`)
    router.push('/404')
  }
}

const goErrorPage = (code: string) => {
  router.push(`/${code}`)
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <ErrorLayout>
    <div class="permission-container">
      <div class="header-hero">
        <div class="hero-badge">🔐 RBAC SECURITY & ACCESS CONTROL</div>
        <h1 class="hero-title">权限管理与角色鉴权控制中心</h1>
        <p class="hero-desc">
          基于角色的访问控制（RBAC）与细粒度按钮级指令鉴权。在下方随意切换角色，实时体验不同权限下的按钮状态、路由防线与 JWT Token 响应。
        </p>
      </div>

      <!-- Section: HTTP Status Code Direct Jump & Simulator -->
      <div class="panel-card status-code-simulator-card full-width">
        <div class="panel-header">
          <h3>🔢 HTTP 状态码快速模拟与跳转展示</h3>
          <span class="sub-text">输入任意 HTTP 状态码（例如输入 200、401、402、403、404、405、500 等），按回车或点击按钮即可直接跳过去展示对应页面</span>
        </div>

        <div class="status-input-row">
          <div class="input-wrapper">
            <el-input
              v-model="inputStatusCode"
              placeholder="输入状态码 (例如 200, 401, 402, 403, 404, 405, 500)"
              size="large"
              clearable
              @keyup.enter="jumpToStatusCode()"
            >
              <template #prefix>
                <span class="input-prefix-tag">HTTP/1.1</span>
              </template>
              <template #append>
                <el-button type="primary" class="jump-submit-btn" @click="jumpToStatusCode()">
                  🚀 立即跳过去展示
                </el-button>
              </template>
            </el-input>
          </div>
        </div>

        <div class="quick-code-chips">
          <span class="chip-label">⚡ 快捷点击跳转:</span>
          <button
            v-for="c in quickStatusCodes"
            :key="c.code"
            class="code-chip"
            :style="{ borderColor: c.color }"
            @click="jumpToStatusCode(c.code)"
          >
            <span class="chip-dot" :style="{ background: c.color }"></span>
            <strong class="chip-code">{{ c.code }}</strong>
            <span class="chip-desc">{{ c.name }}</span>
          </button>
        </div>
      </div>

      <!-- Role Selector Cards -->
      <div class="role-grid">
        <div
          v-for="role in roles"
          :key="role.key"
          class="role-card"
          :class="{ active: activeRoleKey === role.key }"
          @click="switchRole(role.key)"
        >
          <div class="card-header">
            <span class="role-dot" :style="{ background: role.color }"></span>
            <span class="role-title">{{ role.name }}</span>
            <span v-if="activeRoleKey === role.key" class="active-tag">当前激活</span>
          </div>
          <p class="role-desc">{{ role.description }}</p>
          <div class="perm-tags">
            <span v-for="p in role.permissions" :key="p" class="p-tag">{{ p }}</span>
          </div>
        </div>
      </div>

      <div class="demo-main-grid">
        <!-- Section 1: Button Directive Authorization -->
        <div class="panel-card">
          <div class="panel-header">
            <h3>🔘 按钮级指令鉴权 (v-permission) 演示</h3>
            <span class="sub-text">切换上方角色体验按钮变灰/受阻/正常高亮</span>
          </div>

          <div class="action-buttons-wrap">
            <div
              v-for="btn in actionButtons"
              :key="btn.perm"
              class="btn-item"
            >
              <el-button
                :type="btn.type"
                size="large"
                :disabled="!hasPermission(btn.perm)"
                @click="handleActionClick(btn.perm, btn.label)"
              >
                <template #icon>
                  <span v-if="!hasPermission(btn.perm)">🔒</span>
                </template>
                {{ btn.label }}
              </el-button>
              <span class="perm-hint" :class="{ pass: hasPermission(btn.perm) }">
                {{ hasPermission(btn.perm) ? '✓ 已授权' : '✕ 权限不足 (需 ' + btn.perm + ')' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Section 2: JWT Token Claims Inspector -->
        <div class="panel-card">
          <div class="panel-header">
            <h3>📜 解密 JWT Bearer Claims 状态预览</h3>
            <span class="sub-text">模拟后端鉴权中间件从 Token 提炼的角色与 Payloads</span>
          </div>
          <div class="jwt-code-box">
            <pre><code>{{ jwtPayload }}</code></pre>
          </div>
        </div>
      </div>

      <!-- Section 3: Route Permission Matrix Table -->
      <div class="panel-card full-width">
        <div class="panel-header">
          <h3>🗺️ 路由与菜单防线访问矩阵 (Route Protection Matrix)</h3>
          <span class="sub-text">定义特定页面路由对各角色的守卫逻辑</span>
        </div>

        <el-table :data="routeMatrix" style="width: 100%" class="matrix-table">
          <el-table-column prop="name" label="系统受保护路由" min-width="220" />
          <el-table-column prop="perm" label="对应 Route Meta 节点" min-width="180">
            <template #default="{ row }">
              <code>{{ row.perm }}</code>
            </template>
          </el-table-column>
          <el-table-column label="超级管理员" align="center">
            <template #default="{ row }">
              <span class="status-badge pass" v-if="row.super">✓ 可访问</span>
            </template>
          </el-table-column>
          <el-table-column label="系统运维" align="center">
            <template #default="{ row }">
              <span class="status-badge pass" v-if="row.devops">✓ 可访问</span>
              <span class="status-badge block" v-else>✕ 拦截(403)</span>
            </template>
          </el-table-column>
          <el-table-column label="运营专员" align="center">
            <template #default="{ row }">
              <span class="status-badge pass" v-if="row.op">✓ 可访问</span>
              <span class="status-badge block" v-else>✕ 拦截(403)</span>
            </template>
          </el-table-column>
          <el-table-column label="普通访客" align="center">
            <template #default="{ row }">
              <span class="status-badge pass" v-if="row.guest">✓ 可访问</span>
              <span class="status-badge block" v-else>✕ 拦截(403)</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Section 4: Live Security Audit Logs -->
      <div class="panel-card full-width">
        <div class="panel-header">
          <h3>📡 实时安全鉴权审计日志 (Audit Stream Log)</h3>
          <span class="sub-text">记录页面鉴权拦截、角色切换与操作轨迹</span>
        </div>

        <div class="audit-log-box">
          <div v-for="log in auditLogs" :key="log.id" class="log-line" :class="{ block: !log.granted }">
            <span class="log-time">[{{ log.time }}]</span>
            <span class="log-role">{{ log.role }}</span>
            <span class="log-action">{{ log.action }}</span>
            <span class="log-status" :class="{ ok: log.granted, err: !log.granted }">
              {{ log.granted ? 'PASS (200)' : 'DENIED (403)' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="permission-footer">
        <el-button type="danger" plain size="large" @click="goErrorPage('403')">
          🛡️ 测试触发 403 禁止访问页
        </el-button>
        <el-button type="warning" plain size="large" @click="goErrorPage('401')">
          🔑 测试触发 401 Token 过期页
        </el-button>
        <el-button type="primary" size="large" @click="goHome">
          🏠 返回系统主界面
        </el-button>
      </div>
    </div>
  </ErrorLayout>
</template>

<style scoped lang="scss">
.permission-container {
  max-width: 1100px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.4s ease-out;
}

.header-hero {
  text-align: center;
  margin-bottom: 8px;

  .hero-badge {
    display: inline-block;
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.3);
    font-size: 12px;
    font-weight: 700;
    padding: 3px 12px;
    border-radius: 20px;
    margin-bottom: 12px;
    letter-spacing: 1px;
  }

  .hero-title {
    font-size: 28px;
    font-weight: 800;
    color: #f8fafc;
    margin-bottom: 10px;
  }

  .hero-desc {
    font-size: 14px;
    color: #94a3b8;
    max-width: 720px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;

  .role-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 18px;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;

    &:hover {
      transform: translateY(-3px);
      border-color: rgba(255, 255, 255, 0.2);
    }

    &.active {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;

      .role-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      .role-title {
        font-weight: 700;
        font-size: 14px;
        color: #f1f5f9;
      }

      .active-tag {
        margin-left: auto;
        font-size: 10px;
        background: #3b82f6;
        color: #fff;
        padding: 1px 6px;
        border-radius: 8px;
      }
    }

    .role-desc {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 12px;
      flex: 1;
    }

    .perm-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;

      .p-tag {
        font-size: 10px;
        background: rgba(0, 0, 0, 0.4);
        color: #93c5fd;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
      }
    }
  }
}

.demo-main-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
  gap: 20px;
}

.panel-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 20px;

  &.full-width {
    grid-column: 1 / -1;
  }

  .panel-header {
    margin-bottom: 16px;

    h3 {
      font-size: 16px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 4px;
    }

    .sub-text {
      font-size: 12px;
      color: #94a3b8;
    }
  }

  .action-buttons-wrap {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .btn-item {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .perm-hint {
        font-size: 12px;
        color: #ef4444;

        &.pass {
          color: #10b981;
        }
      }
    }
  }

  .jwt-code-box {
    background: #090d16;
    border-radius: 8px;
    padding: 14px;
    max-height: 240px;
    overflow-y: auto;

    pre {
      margin: 0;
      font-family: monospace;
      font-size: 12px;
      color: #60a5fa;
      line-height: 1.5;
    }
  }
}

.matrix-table {
  background: transparent !important;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 0, 0, 0.3);
  --el-table-border-color: rgba(255, 255, 255, 0.08);
  --el-table-text-color: #cbd5e1;

  code {
    background: rgba(0, 0, 0, 0.4);
    padding: 2px 6px;
    border-radius: 4px;
    color: #60a5fa;
    font-family: monospace;
  }

  .status-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 10px;

    &.pass {
      color: #34d399;
      background: rgba(16, 185, 129, 0.15);
    }

    &.block {
      color: #fca5a5;
      background: rgba(239, 68, 68, 0.15);
    }
  }
}

.audit-log-box {
  background: #080c14;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;

  .log-line {
    display: flex;
    gap: 12px;
    align-items: center;

    .log-time { color: #64748b; }
    .log-role { color: #fbbf24; font-weight: bold; }
    .log-action { color: #e2e8f0; flex: 1; }
    .log-status {
      padding: 1px 6px;
      border-radius: 4px;
      &.ok { background: rgba(16, 185, 129, 0.2); color: #34d399; }
      &.err { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    }
  }
}

.status-code-simulator-card {
  border-color: rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  .status-input-row {
    margin-bottom: 16px;

    .input-wrapper {
      max-width: 640px;

      .input-prefix-tag {
        font-weight: bold;
        font-size: 13px;
        color: #3b82f6;
        padding-right: 6px;
      }

      .jump-submit-btn {
        font-weight: bold;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        border: none;
        color: #fff;
      }
    }
  }

  .quick-code-chips {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;

    .chip-label {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
    }

    .code-chip {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 6px 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      color: #f1f5f9;

      &:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.08);
      }

      .chip-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .chip-code {
        font-size: 13px;
        font-family: monospace;
      }

      .chip-desc {
        font-size: 12px;
        color: #94a3b8;
      }
    }
  }
}

.permission-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 10px;
  flex-wrap: wrap;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
