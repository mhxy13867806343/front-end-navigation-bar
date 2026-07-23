<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import ErrorLayout from '../error/ErrorLayout.vue'

const router = useRouter()

export interface SystemLogItem {
  id: string
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'
  statusCode: number
  operator: string
  role: string
  ip: string
  action: string
  module: string
  uri: string
  duration: number
  detail?: string
  stackTrace?: string
}

const activeTab = ref('all')
const searchKeyword = ref('')
const selectedLevel = ref('ALL')
const detailDrawerVisible = ref(false)
const selectedLog = ref<SystemLogItem | null>(null)

// Initial Log Mock Data
const logList = ref<SystemLogItem[]>([
  {
    id: 'LOG-1001',
    timestamp: '2026-07-23 17:16:42',
    level: 'INFO',
    statusCode: 200,
    operator: 'admin_master',
    role: '超级管理员',
    ip: '192.168.1.100',
    action: '查询用户权限矩阵',
    module: '权限控制中心',
    uri: '/api/v1/permission/matrix',
    duration: 12,
    detail: '请求包含有效 JWT Bearer Token，权限校验结果：PASS'
  },
  {
    id: 'LOG-1002',
    timestamp: '2026-07-23 17:15:30',
    level: 'WARN',
    statusCode: 401,
    operator: 'anonymous_user',
    role: '未鉴权访客',
    ip: '114.242.25.18',
    action: '尝试访问绝密导出接口',
    module: '鉴权防火墙',
    uri: '/api/v1/user/export-all',
    duration: 8,
    detail: '未探测到 Authorization 头部凭证，触发 HTTP 401 Unauthorized 拦截',
    stackTrace: 'UnauthorizedException: Token is missing or expired in request header'
  },
  {
    id: 'LOG-1003',
    timestamp: '2026-07-23 17:14:15',
    level: 'WARN',
    statusCode: 402,
    operator: 'developer_tom',
    role: '普通用户',
    ip: '124.70.32.91',
    action: '调用 AI 智能生成配额接口',
    module: '计费中心',
    uri: '/api/v1/ai/generate',
    duration: 45,
    detail: '账户可用余额 0.00，欠费额度超出系统容忍上限，抛出 402 Payment Required'
  },
  {
    id: 'LOG-1004',
    timestamp: '2026-07-23 17:12:04',
    level: 'ERROR',
    statusCode: 403,
    operator: 'guest_test',
    role: '普通访客',
    ip: '221.220.10.88',
    action: '执行系统配置修改',
    module: '系统管理',
    uri: '/api/v1/system/config',
    duration: 15,
    detail: '角色 [普通访客] 缺失 system:config:write 权限，RBAC 拦截器切面拒绝该请求'
  },
  {
    id: 'LOG-1005',
    timestamp: '2026-07-23 17:10:02',
    level: 'ERROR',
    statusCode: 405,
    operator: 'api_tester',
    role: '开发者',
    ip: '127.0.0.1',
    action: '使用 DELETE 方法提交表单',
    module: '动态表单引擎',
    uri: '/api/v1/dyform/submit',
    duration: 6,
    detail: '端点仅允许 POST/GET 方法，检测到非法 DELETE 动词，响应 405 Method Not Allowed'
  },
  {
    id: 'LOG-1006',
    timestamp: '2026-07-23 17:08:50',
    level: 'CRITICAL',
    statusCode: 500,
    operator: 'cron_worker',
    role: '后台任务',
    ip: '10.0.4.12',
    action: '集群缓存数据同步',
    module: 'Redis 消息中间件',
    uri: '/internal/cluster/sync',
    duration: 1250,
    detail: '连接 Redis 节点 127.0.0.1:6379 失败: Connection refused',
    stackTrace: 'RedisConnectionException: Cannot assign requested address\n  at com.hooksvue.redis.Client.connect(Client.java:88)\n  at com.hooksvue.sync.Worker.run(Worker.java:210)'
  }
])

const filteredLogs = computed(() => {
  return logList.value.filter(log => {
    // Level Filter
    if (selectedLevel.value !== 'ALL' && log.level !== selectedLevel.value) {
      return false
    }

    // Category Tab Filter
    if (activeTab.value === 'auth' && !['401', '403'].includes(String(log.statusCode))) return false
    if (activeTab.value === 'error' && log.statusCode < 400) return false
    if (activeTab.value === '500' && log.statusCode !== 500) return false

    // Search Keyword Filter
    if (searchKeyword.value.trim()) {
      const kw = searchKeyword.value.toLowerCase()
      const matchId = log.id.toLowerCase().includes(kw)
      const matchAction = log.action.toLowerCase().includes(kw)
      const matchOperator = log.operator.toLowerCase().includes(kw)
      const matchUri = log.uri.toLowerCase().includes(kw)
      const matchCode = String(log.statusCode).includes(kw)
      return matchId || matchAction || matchOperator || matchUri || matchCode
    }

    return true
  })
})

const openLogDetail = (log: SystemLogItem) => {
  selectedLog.value = log
  detailDrawerVisible.value = true
}

const refreshLogs = () => {
  const newLog: SystemLogItem = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toLocaleString(),
    level: Math.random() > 0.5 ? 'INFO' : 'WARN',
    statusCode: Math.random() > 0.5 ? 200 : 401,
    operator: 'auto_auditor',
    role: '安全巡检机器人',
    ip: '127.0.0.1',
    action: '例行 API 端点存活心跳巡检',
    module: '系统监控',
    uri: '/api/v1/health',
    duration: Math.floor(5 + Math.random() * 20),
    detail: '系统自动审计日志推送检测正常'
  }
  logList.value.unshift(newLog)
  ElMessage.success('已刷新并插入最新实时审计日志流！')
}

const clearLogs = () => {
  ElMessageBox.confirm('确定要清空当前所有日志流记录吗？', '提示', {
    confirmButtonText: '清空',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    logList.value = []
    ElMessage.info('日志缓存已被清空')
  })
}

const exportLogsCsv = () => {
  const headers = ['日志ID', '时间', '级别', '状态码', '操作员', '角色', 'IP', '模块', '动作', 'URI', '耗时(ms)']
  const rows = filteredLogs.value.map(l => [
    l.id, l.timestamp, l.level, l.statusCode, l.operator, l.role, l.ip, l.module, `"${l.action}"`, l.uri, l.duration
  ])
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `system_audit_logs_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('日志 CSV 数据离线导出一键完成！')
}

const jumpToStatusPage = (code: number) => {
  router.push(`/${code}`)
}

const getLevelTagType = (level: string) => {
  switch (level) {
    case 'INFO': return 'success'
    case 'WARN': return 'warning'
    case 'ERROR': return 'danger'
    case 'CRITICAL': return 'danger'
    default: return 'info'
  }
}

const getStatusBadgeClass = (code: number) => {
  if (code === 200) return 's-200'
  if (code === 401 || code === 402) return 's-400'
  if (code === 403 || code === 404 || code === 405) return 's-403'
  if (code >= 500) return 's-500'
  return ''
}
</script>

<template>
  <ErrorLayout>
    <div class="logs-container">
      <div class="header-hero">
        <div class="hero-badge">📜 SYSTEM LOGS & SECURITY AUDIT</div>
        <h1 class="hero-title">系统安全与操作审计日志中心</h1>
        <p class="hero-desc">
          实时捕获全局 API 响应 HTTP 状态码（200 / 401 / 402 / 403 / 404 / 405 / 500）、RBAC 拦截事件与异常 Stack Trace。
        </p>
      </div>

      <!-- Action & Filter Bar -->
      <div class="filter-card">
        <div class="filter-left">
          <el-radio-group v-model="activeTab" size="default">
            <el-radio-button label="all">全部日志 ({{ logList.length }})</el-radio-button>
            <el-radio-button label="auth">🔒 鉴权拦截</el-radio-button>
            <el-radio-button label="error">⚠️ 异常状态</el-radio-button>
            <el-radio-button label="500">🔥 500 崩溃</el-radio-button>
          </el-radio-group>

          <el-select v-model="selectedLevel" placeholder="级别筛选" style="width: 130px;">
            <el-option label="全部级别" value="ALL" />
            <el-option label="INFO (正常)" value="INFO" />
            <el-option label="WARN (警告)" value="WARN" />
            <el-option label="ERROR (错误)" value="ERROR" />
            <el-option label="CRITICAL (严重)" value="CRITICAL" />
          </el-select>
        </div>

        <div class="filter-right">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索 ID、操作、IP、URI 或状态码..."
            clearable
            style="width: 260px;"
          />
          <el-button type="primary" plain @click="refreshLogs">🔄 刷新数据</el-button>
          <el-button type="success" plain @click="exportLogsCsv">📥 导出 CSV</el-button>
          <el-button type="danger" plain @click="clearLogs">清空</el-button>
        </div>
      </div>

      <!-- Logs Data Table -->
      <div class="table-card">
        <el-table :data="filteredLogs" style="width: 100%" class="logs-table">
          <el-table-column prop="id" label="日志 ID" width="120">
            <template #default="{ row }">
              <code class="log-id">{{ row.id }}</code>
            </template>
          </el-table-column>

          <el-table-column prop="timestamp" label="时间戳" width="170" />

          <el-table-column prop="statusCode" label="HTTP 状态" width="110" align="center">
            <template #default="{ row }">
              <span
                class="status-code-badge"
                :class="getStatusBadgeClass(row.statusCode)"
                @click="jumpToStatusPage(row.statusCode)"
                title="点击直接跳转至该状态码展示页"
              >
                {{ row.statusCode }} ↗
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="level" label="日志级别" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getLevelTagType(row.level)" size="small" effect="dark">
                {{ row.level }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="operator" label="操作用户 / 角色" width="160">
            <template #default="{ row }">
              <div class="user-block">
                <strong>{{ row.operator }}</strong>
                <span class="role-sub">{{ row.role }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="module" label="所属模块" width="130" />

          <el-table-column prop="action" label="操作描述 & 请求 URI" min-width="220">
            <template #default="{ row }">
              <div class="action-block">
                <span class="act-text">{{ row.action }}</span>
                <code class="uri-text">{{ row.uri }}</code>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="duration" label="耗时" width="90" align="right">
            <template #default="{ row }">
              <span class="duration-tag" :class="{ slow: row.duration > 500 }">{{ row.duration }}ms</span>
            </template>
          </el-table-column>

          <el-table-column label="详情操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="openLogDetail(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Log Detail Drawer -->
      <el-drawer v-model="detailDrawerVisible" title="系统日志详细审计报文" size="520px" append-to-body>
        <div v-if="selectedLog" class="log-drawer-content">
          <div class="drawer-header-info">
            <span class="log-id-badge">{{ selectedLog.id }}</span>
            <el-tag :type="getLevelTagType(selectedLog.level)" effect="dark">
              HTTP {{ selectedLog.statusCode }} | {{ selectedLog.level }}
            </el-tag>
          </div>

          <div class="kv-group">
            <div class="kv-item"><span class="k">触发时间:</span><span class="v">{{ selectedLog.timestamp }}</span></div>
            <div class="kv-item"><span class="k">操作用户:</span><span class="v">{{ selectedLog.operator }} ({{ selectedLog.role }})</span></div>
            <div class="kv-item"><span class="k">客户端 IP:</span><span class="v">{{ selectedLog.ip }}</span></div>
            <div class="kv-item"><span class="k">业务模块:</span><span class="v">{{ selectedLog.module }}</span></div>
            <div class="kv-item"><span class="k">请求接口:</span><span class="v"><code>{{ selectedLog.uri }}</code></span></div>
            <div class="kv-item"><span class="k">接口耗时:</span><span class="v">{{ selectedLog.duration }} ms</span></div>
          </div>

          <div class="detail-section">
            <h4>📝 详细审计说明</h4>
            <div class="detail-text-box">{{ selectedLog.detail || '暂无额外详细日志说明' }}</div>
          </div>

          <div v-if="selectedLog.stackTrace" class="detail-section">
            <h4>🔥 异常 Stack Trace 追溯</h4>
            <pre class="stack-box"><code>{{ selectedLog.stackTrace }}</code></pre>
          </div>

          <div class="drawer-actions">
            <el-button type="danger" plain size="large" @click="jumpToStatusPage(selectedLog.statusCode)">
              🚀 直达对应 HTTP {{ selectedLog.statusCode }} 展示页
            </el-button>
          </div>
        </div>
      </el-drawer>
    </div>
  </ErrorLayout>
</template>

<style scoped lang="scss">
.logs-container {
  max-width: 1100px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.4s ease-out;
}

.header-hero {
  text-align: center;
  margin-bottom: 4px;

  .hero-badge {
    display: inline-block;
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
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
    margin-bottom: 8px;
  }

  .hero-desc {
    font-size: 14px;
    color: #94a3b8;
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

.filter-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .filter-left, .filter-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.table-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
  overflow: hidden;
}

.logs-table {
  background: transparent !important;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 0, 0, 0.3);
  --el-table-border-color: rgba(255, 255, 255, 0.08);
  --el-table-text-color: #cbd5e1;

  .log-id {
    background: rgba(0, 0, 0, 0.4);
    padding: 2px 6px;
    border-radius: 4px;
    color: #60a5fa;
    font-family: monospace;
    font-size: 12px;
  }

  .status-code-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }

    &.s-200 { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    &.s-400 { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    &.s-403 { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    &.s-500 { background: rgba(239, 68, 68, 0.25); color: #fca5a5; }
  }

  .user-block {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 13px;

    .role-sub {
      font-size: 11px;
      color: #94a3b8;
    }
  }

  .action-block {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .act-text {
      font-weight: 500;
      color: #f1f5f9;
    }

    .uri-text {
      font-size: 11px;
      color: #94a3b8;
      font-family: monospace;
    }
  }

  .duration-tag {
    font-family: monospace;
    font-size: 12px;
    color: #34d399;

    &.slow {
      color: #fca5a5;
      font-weight: bold;
    }
  }
}

.log-drawer-content {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .drawer-header-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .log-id-badge {
      font-size: 18px;
      font-weight: bold;
      font-family: monospace;
      color: #60a5fa;
    }
  }

  .kv-group {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    font-size: 13px;
    background: rgba(0, 0, 0, 0.2);
    padding: 14px;
    border-radius: 8px;

    .kv-item {
      display: flex;

      .k {
        width: 100px;
        color: #94a3b8;
      }

      .v {
        color: #f1f5f9;

        code {
          color: #60a5fa;
          font-family: monospace;
        }
      }
    }
  }

  .detail-section {
    h4 {
      margin-bottom: 8px;
      font-size: 14px;
      color: #cbd5e1;
    }

    .detail-text-box {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 12px;
      font-size: 13px;
      color: #e2e8f0;
      line-height: 1.6;
    }

    .stack-box {
      background: #090d16;
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      padding: 12px;
      margin: 0;
      font-family: monospace;
      font-size: 12px;
      color: #fca5a5;
      overflow-x: auto;
      line-height: 1.5;
    }
  }

  .drawer-actions {
    margin-top: 10px;
    display: flex;
    justify-content: center;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
