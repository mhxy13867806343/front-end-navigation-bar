<template>
  <div class="broadcast-container">
    <!-- 头部信息面板 -->
    <header class="broadcast-header">
      <div class="header-left">
        <h1 class="header-title">📡 HTML5 Broadcast Channel 跨标签页实时同步展厅</h1>
        <p class="header-desc">
          点击<strong>新增</strong>或<strong>编辑</strong>将在<strong>独立新标签页中打开表单</strong>，保存后通过原生 <code>BroadcastChannel</code> API 无服务端实时解耦推流同步至主列表与全部打开窗口！
        </p>
      </div>

      <div class="header-actions">
        <div class="tab-badge">
          <span class="dot"></span>
          <span>主列表标签页 ID: <strong>{{ currentTabId }}</strong></span>
        </div>
        <el-button type="primary" class="test-tab-btn" @click="openDuplicateTab">
          🚀 打开分屏新标签页测试
        </el-button>
      </div>
    </header>

    <!-- 主体两栏布局 -->
    <main class="broadcast-body">
      <!-- 左侧：假数据 CRUD 列表 -->
      <section class="data-section">
        <div class="section-toolbar">
          <div class="toolbar-left">
            <h2>📋 共享任务与数据列表</h2>
            <span class="count-tag">共 {{ dataList.length }} 条记录</span>
          </div>
          <div class="toolbar-right">
            <el-button type="primary" size="small" @click="openAddTab">
              ➕ 新增假数据 (新标签页)
            </el-button>
            <el-button type="warning" plain size="small" @click="resetToDefaultData">
              🔄 重置初始数据
            </el-button>
            <el-button type="danger" plain size="small" @click="clearAllData">
              🗑️ 清空列表
            </el-button>
          </div>
        </div>

        <!-- 数据表格 -->
        <el-table
          :data="dataList"
          stripe
          border
          style="width: 100%"
          class="custom-data-table"
        >
          <el-table-column prop="id" label="ID" width="110" />
          <el-table-column prop="title" label="任务/功能名称" min-width="180">
            <template #default="{ row }">
              <span class="item-title">{{ row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="120">
            <template #default="{ row }">
              <el-tag size="small" effect="plain">{{ row.category }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="100">
            <template #default="{ row }">
              <el-tag :type="getPriorityTagType(row.priority)" size="small">
                {{ row.priority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="110">
            <template #default="{ row }">
              <span class="status-badge" :class="getStatusClass(row.status)">
                {{ row.status }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="160" />
          <el-table-column label="操作 (打开新页编辑)" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="openEditTab(row.id)">
                ✏️ 编辑 (新标签页)
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row.id)">
                🗑️ 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <!-- 右侧：广播日志实时展示面板 -->
      <aside class="log-section">
        <div class="log-header">
          <div class="log-title">
            <span>📡 广播通信日志 (Channel: <code>{{ channelName }}</code>)</span>
          </div>
          <el-button type="info" text size="small" @click="clearLogs">
            清空日志
          </el-button>
        </div>

        <div ref="logContainer" class="log-content">
          <div v-if="logs.length === 0" class="empty-log">
            暂无广播通信日志，在新标签页中新增/修改数据将在此实时推流...
          </div>
          <div
            v-for="(log, idx) in logs"
            :key="idx"
            class="log-item"
            :class="log.direction"
          >
            <span class="log-time">[{{ log.time }}]</span>
            <span class="log-badge">{{ log.direction === 'send' ? '📤 发送' : '📥 接收' }}</span>
            <span class="log-sender">[{{ log.sender }}]</span>
            <span class="log-text">{{ log.message }}</span>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

interface MockDataItem {
  id: string
  title: string
  category: string
  priority: '高' | '中' | '低'
  status: '已完成' | '进行中' | '待处理'
  updatedAt: string
}

interface BroadcastLog {
  time: string
  direction: 'send' | 'receive'
  sender: string
  message: string
}

interface BroadcastPayload {
  type: 'ADD' | 'UPDATE' | 'DELETE' | 'RESET' | 'CLEAR' | 'SYNC_REQUEST' | 'SYNC_RESPONSE'
  senderId: string
  data?: MockDataItem | MockDataItem[] | string
  timestamp: string
}

const CHANNEL_NAME = 'hooksvue_broadcast_demo_channel'
const STORAGE_KEY = 'hooksvue_broadcast_mock_data'

const currentTabId = ref<string>(`Main-${Math.random().toString(36).substring(2, 7).toUpperCase()}`)
const channelName = CHANNEL_NAME

const dataList = ref<MockDataItem[]>([])
const logs = ref<BroadcastLog[]>([])
const logContainer = ref<HTMLDivElement | null>(null)

let broadcastChannel: BroadcastChannel | null = null

const initialMockData: MockDataItem[] = [
  { id: 'TASK-1001', title: '完成 Vue3 模板响应式与 Compile 优化', category: '核心架构', priority: '高', status: '已完成', updatedAt: '2026-08-01 08:00' },
  { id: 'TASK-1002', title: '集成 Element Plus Tree 全展开树形导航', category: 'UI与交互', priority: '高', status: '已完成', updatedAt: '2026-08-01 08:10' },
  { id: 'TASK-1003', title: '实现 Broadcast Channel 跨标签页解耦通信', category: '工程化', priority: '高', status: '进行中', updatedAt: '2026-08-01 08:20' },
  { id: 'TASK-1004', title: '构建 Three.js 3D 中国地图设计器', category: 'UI与交互', priority: '中', status: '待处理', updatedAt: '2026-08-01 07:45' },
  { id: 'TASK-1005', title: '优化静态资源 Vite Code Splitting 分包', category: '性能优化', priority: '中', status: '已完成', updatedAt: '2026-08-01 07:15' }
]

function getFormattedTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

function getPriorityTagType(priority: string): 'danger' | 'warning' | 'info' {
  if (priority === '高') return 'danger'
  if (priority === '中') return 'warning'
  return 'info'
}

function getStatusClass(status: string): string {
  if (status === '已完成') return 'status-done'
  if (status === '进行中') return 'status-progress'
  return 'status-pending'
}

function addLog(direction: 'send' | 'receive', sender: string, message: string): void {
  logs.value.push({
    time: getFormattedTime(),
    direction,
    sender,
    message
  })
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

function saveToLocalStorage(list: MockDataItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // LocalStorage fallback
  }
}

function loadFromLocalStorage(): MockDataItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // Ignore error
  }
  return [...initialMockData]
}

function sendBroadcast(type: BroadcastPayload['type'], data?: any): void {
  if (!broadcastChannel) return

  const payload: BroadcastPayload = {
    type,
    senderId: currentTabId.value,
    data,
    timestamp: getFormattedTime()
  }

  broadcastChannel.postMessage(payload)

  let logText = ''
  if (type === 'DELETE') logText = `删除项目 ID: ${data}`
  else if (type === 'RESET') logText = '重置初始假数据列表'
  else if (type === 'CLEAR') logText = '清空列表数据'
  else if (type === 'SYNC_REQUEST') logText = '发起多页状态同步请求'
  else if (type === 'SYNC_RESPONSE') logText = '回应并广播最新的全量列表数据'

  if (logText) {
    addLog('send', currentTabId.value, logText)
  }
}

function handleIncomingMessage(payload: BroadcastPayload): void {
  if (payload.senderId === currentTabId.value) return

  switch (payload.type) {
    case 'ADD': {
      const item = payload.data as MockDataItem
      dataList.value = loadFromLocalStorage()
      addLog('receive', payload.senderId, `收到新标签页【新增】: [${item.title}]`)
      ElMessage.success(`🎉 收到来自新标签页 [${payload.senderId}] 的新增：${item.title}`)
      break
    }
    case 'UPDATE': {
      const item = payload.data as MockDataItem
      dataList.value = loadFromLocalStorage()
      addLog('receive', payload.senderId, `收到新标签页【修改】: [${item.title}]`)
      ElMessage.info(`✏️ 收到来自新标签页 [${payload.senderId}] 的更新：${item.title}`)
      break
    }
    case 'DELETE': {
      const id = payload.data as string
      dataList.value = dataList.value.filter(d => d.id !== id)
      saveToLocalStorage(dataList.value)
      addLog('receive', payload.senderId, `收到删除 ID: ${id}`)
      ElMessage.warning(`[${payload.senderId}] 删除了数据项目 ${id}`)
      break
    }
    case 'RESET': {
      dataList.value = [...initialMockData]
      saveToLocalStorage(dataList.value)
      addLog('receive', payload.senderId, '收到列表重置指令')
      ElMessage.info(`[${payload.senderId}] 重置了全量数据`)
      break
    }
    case 'CLEAR': {
      dataList.value = []
      saveToLocalStorage(dataList.value)
      addLog('receive', payload.senderId, '收到列表清空指令')
      ElMessage.warning(`[${payload.senderId}] 清空了所有列表`)
      break
    }
    case 'SYNC_REQUEST': {
      addLog('receive', payload.senderId, '新标签页加入，正在推流最新数据...')
      sendBroadcast('SYNC_RESPONSE', dataList.value)
      break
    }
    case 'SYNC_RESPONSE': {
      const list = payload.data as MockDataItem[]
      if (Array.isArray(list)) {
        dataList.value = [...list]
        saveToLocalStorage(dataList.value)
        addLog('receive', payload.senderId, `收到多页同步数据 (${list.length} 条)`)
      }
      break
    }
  }
}

// 在独立新标签页中打开【新增】表单
function openAddTab(): void {
  const routeData = router.resolve({
    path: '/broadcast-channel/editor',
    query: { mode: 'add' }
  })
  window.open(routeData.href, '_blank')
  addLog('send', currentTabId.value, '已在独立新标签页中打开【新增】表单页面')
}

// 在独立新标签页中打开【编辑】表单
function openEditTab(id: string): void {
  const routeData = router.resolve({
    path: '/broadcast-channel/editor',
    query: { mode: 'edit', id }
  })
  window.open(routeData.href, '_blank')
  addLog('send', currentTabId.value, `已在独立新标签页中打开【编辑】表单页面 (ID: ${id})`)
}

function handleDelete(id: string): void {
  ElMessageBox.confirm('确定要删除该数据项目吗？删除后将实时同步至其他窗口。', '删除确认', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    dataList.value = dataList.value.filter(d => d.id !== id)
    saveToLocalStorage(dataList.value)
    sendBroadcast('DELETE', id)
    ElMessage.success('删除成功并已广播同步！')
  }).catch(() => {})
}

function resetToDefaultData(): void {
  dataList.value = [...initialMockData]
  saveToLocalStorage(dataList.value)
  sendBroadcast('RESET')
  ElMessage.info('已恢复初始假数据，并已广播同步。')
}

function clearAllData(): void {
  ElMessageBox.confirm('确定要清空全部列表数据吗？', '清空警告', {
    confirmButtonText: '确认清空',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(() => {
    dataList.value = []
    saveToLocalStorage(dataList.value)
    sendBroadcast('CLEAR')
    ElMessage.warning('已清空列表，并已广播同步。')
  }).catch(() => {})
}

function openDuplicateTab(): void {
  window.open(window.location.href, '_blank')
}

function clearLogs(): void {
  logs.value = []
}

onMounted(() => {
  dataList.value = loadFromLocalStorage()

  if ('BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
    broadcastChannel.onmessage = (event: MessageEvent<BroadcastPayload>) => {
      if (event.data) {
        handleIncomingMessage(event.data)
      }
    }
    sendBroadcast('SYNC_REQUEST')
  } else {
    ElMessage.warning('当前浏览器暂不支持 BroadcastChannel API')
  }
})

onUnmounted(() => {
  if (broadcastChannel) {
    broadcastChannel.close()
    broadcastChannel = null
  }
})
</script>

<style scoped lang="scss">
.broadcast-container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  padding: 24px;
  background: var(--bg-primary, #0f172a);
  color: var(--text-color, #f8fafc);
  gap: 20px;
}

.broadcast-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 24px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-secondary, #1e293b) 90%, transparent);
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));

  .header-left {
    .header-title {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 800;
      color: var(--primary-color, #6366f1);
    }
    .header-desc {
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-secondary, #94a3b8);

      code {
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
      }
    }
  }

  .header-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    flex-shrink: 0;

    .tab-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 8px #22c55e;
      }
    }

    .test-tab-btn {
      font-weight: 700;
    }
  }
}

.broadcast-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  flex: 1;
}

.data-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  background: var(--bg-secondary, #1e293b);
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
}

.section-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;

    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
    }

    .count-tag {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
    }
  }

  .toolbar-right {
    display: flex;
    gap: 8px;
  }
}

.item-title {
  font-weight: 600;
  color: #f1f5f9;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 600;

  &.status-done {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
  }
  &.status-progress {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }
  &.status-pending {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
  }
}

.log-section {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: var(--bg-secondary, #1e293b);
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
  overflow: hidden;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: color-mix(in srgb, var(--bg-primary, #0f172a) 80%, transparent);
  border-bottom: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));

  .log-title {
    font-size: 13px;
    font-weight: 700;
    color: #818cf8;

    code {
      color: #cbd5e1;
    }
  }
}

.log-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  max-height: 520px;
  font-family: monospace;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .empty-log {
    color: #64748b;
    text-align: center;
    padding: 40px 10px;
    line-height: 1.6;
  }
}

.log-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.6);
  border-left: 3px solid #64748b;
  line-height: 1.5;

  &.send {
    border-left-color: #6366f1;
    .log-badge {
      color: #818cf8;
    }
  }

  &.receive {
    border-left-color: #22c55e;
    .log-badge {
      color: #4ade80;
    }
  }

  .log-time {
    color: #64748b;
  }

  .log-sender {
    color: #94a3b8;
    font-weight: 700;
  }

  .log-text {
    color: #e2e8f0;
    word-break: break-all;
  }
}

@media (max-width: 900px) {
  .broadcast-body {
    grid-template-columns: 1fr;
  }
}
</style>
