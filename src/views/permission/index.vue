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

<style scoped lang="scss" src="./css/index.scss"></style>
