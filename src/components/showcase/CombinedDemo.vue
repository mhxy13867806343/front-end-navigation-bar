<script setup lang="ts">
/**
 * CombinedDemo.vue — 综合商业演练场
 * 使用 Element Plus + Naive UI 双组件库联合搭建
 * 接近真实商业后台管理系统的交互体验
 */
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import {
  NButton, NStatistic, NCountdown, NTag, NProgress,
  NDataTable, NSelect, NInput, NDatePicker, NPopconfirm,
  NTabs, NTabPane, NBadge, NTimeline, NTimelineItem,
  NAlert, NAvatar, NAvatarGroup, NSpace, NRate
} from 'naive-ui'
import type { DataTableColumns, TimelineItemProps } from 'naive-ui'

interface StatsCard {
  id: number
  icon: string
  label: string
  value: number
  suffix: string
  trend: string
  trendUp: boolean
  color: string
}

interface UserRow {
  id: number
  avatar: string
  name: string
  role: string
  dept: string
  status: 'active' | 'blocked'
  score: number
  lastLogin: string
}

interface ActivityItem {
  id: number
  type: TimelineItemProps['type']
  icon: string
  user: string
  action: string
  time: string
}

interface KanbanCard {
  id: number
  title: string
  tag: string
  assignee: string
  dueDate: string
}

interface KanbanColumn {
  id: string
  label: string
  color: string
  cards: KanbanCard[]
}

interface ResourceItem {
  label: string
  value: number
  color: string
  icon: string
}

// ==============================
// 1. 仪表盘核心统计指标
// ==============================
const statsCards = ref<StatsCard[]>([
  { id: 1, icon: '💰', label: '今日营业收入', value: 128450, suffix: '元', trend: '+12.8%', trendUp: true, color: '#18a058' },
  { id: 2, icon: '📦', label: '本月新增订单', value: 3842, suffix: '笔', trend: '+5.2%', trendUp: true, color: '#2080f0' },
  { id: 3, icon: '👤', label: '活跃用户总量', value: 96204, suffix: '人', trend: '-1.4%', trendUp: false, color: '#f0a020' },
  { id: 4, icon: '⚡', label: '服务器响应速度', value: 28, suffix: 'ms', trend: '-22.0%', trendUp: true, color: '#8a2be2' }
])

// 实时更新某指标模拟
let timer: ReturnType<typeof setInterval> | null = null
onMounted((): void => {
  timer = setInterval(() => {
    statsCards.value[0].value += Math.floor(Math.random() * 80) + 10
  }, 2000)
})
onUnmounted((): void => {
  if (timer !== null) clearInterval(timer)
})

// ==============================
// 2. El-Table 用户管理数据
// ==============================
const userLoading = ref<boolean>(false)
const userSearchKw = ref<string>('')
const userPage = ref<number>(1)
const userPageSize = ref<number>(6)
const dialogAddUser = ref<boolean>(false)

const rawUsers = ref<UserRow[]>(
  Array.from({ length: 30 }).map((_: unknown, i: number): UserRow => ({
    id: i + 1,
    avatar: `https://picsum.photos/seed/${i + 10}/40/40`,
    name: ['张伟', '李娜', '王芳', '陈强', '刘洋', '赵丽', '钱思远', '孙明', '周婷', '吴浩'][i % 10] + (i > 9 ? i + 1 : ''),
    role: ['超级管理员', '运营编辑', '数据分析师', '前端工程师', '后端工程师'][i % 5],
    dept: ['技术中心', '运营中心', '产品设计', '市场营销'][i % 4],
    status: i % 5 !== 2 ? 'active' : 'blocked',
    score: Number((3 + Math.random() * 2).toFixed(1)),
    lastLogin: `2026-07-${String(Math.max(1, 14 - i % 14)).padStart(2, '0')} ${String(8 + i % 12).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`
  }))
)

const filteredUsers = computed<UserRow[]>(() => {
  const kw: string = userSearchKw.value.trim()
  if (!kw) return rawUsers.value
  return rawUsers.value.filter((u: UserRow): boolean => u.name.includes(kw) || u.role.includes(kw) || u.dept.includes(kw))
})

const pagedUsers = computed<UserRow[]>(() => {
  const start: number = (userPage.value - 1) * userPageSize.value
  return filteredUsers.value.slice(start, start + userPageSize.value)
})

const selectedUserIds = ref<number[]>([])
const handleUserSelect = (rows: UserRow[]): void => { selectedUserIds.value = rows.map((r: UserRow): number => r.id) }

const editingUser = reactive({ name: '', role: '', dept: '' })
const openAddUser = (): void => {
  editingUser.name = ''
  editingUser.role = '前端工程师'
  editingUser.dept = '技术中心'
  dialogAddUser.value = true
}
const confirmAddUser = (): void => {
  if (!editingUser.name) {
    ElMessage.warning('请输入用户姓名')
    return
  }
  rawUsers.value.unshift({
    id: Date.now(),
    avatar: `https://picsum.photos/seed/${Date.now() % 100}/40/40`,
    name: editingUser.name,
    role: editingUser.role,
    dept: editingUser.dept,
    status: 'active',
    score: 5.0,
    lastLogin: new Date().toLocaleString('zh-CN', { hour12: false })
  })
  dialogAddUser.value = false
  ElMessage.success(`成功新增用户 【${editingUser.name}】`)
}

const deleteUser = (row: UserRow): void => {
  const idx: number = rawUsers.value.findIndex((u: UserRow): boolean => u.id === row.id)
  if (idx !== -1) rawUsers.value.splice(idx, 1)
  ElMessage.warning(`已移除用户 【${row.name}】`)
}

const toggleUserStatus = (row: UserRow): void => {
  row.status = row.status === 'active' ? 'blocked' : 'active'
  ElMessage.info(`用户 ${row.name} 状态已切换`)
}

// N-DataTable columns definition for user list
const userTableColumns = computed<DataTableColumns<UserRow>>(() => [
  {
    type: 'selection',
    disabled: (row: UserRow): boolean => row.status === 'blocked'
  },
  {
    title: '头像 / 姓名',
    key: 'name',
    render: (row: UserRow) => {
      return h('div', { style: 'display:flex;align-items:center;gap:8px;' }, [
        h('img', { src: row.avatar, style: 'width:32px;height:32px;border-radius:50%;object-fit:cover;' }),
        h('span', { style: 'font-weight:600;' }, row.name)
      ])
    }
  },
  { title: '角色', key: 'role' },
  { title: '部门', key: 'dept' },
  {
    title: '星级评分',
    key: 'score',
    render: (row: UserRow): string => `⭐ ${row.score}`
  },
  {
    title: '账户状态',
    key: 'status',
    render: (row: UserRow) => h(NTag, { type: row.status === 'active' ? 'success' : 'error', size: 'small' }, { default: (): string => row.status === 'active' ? '正常启用' : '已封禁' })
  },
  { title: '上次登录', key: 'lastLogin' }
])


// ==============================
// 3. 通知活动流（El + Naive 联合）
// ==============================
const activities = ref<ActivityItem[]>([
  { id: 1, type: 'success', icon: '🚀', user: '张伟', action: '成功推送版本 v2.14.3 发布通知至所有用户', time: '3分钟前' },
  { id: 2, type: 'info', icon: '📋', user: '李娜', action: '新建了企业级组件交互演练场并完成基础配置', time: '15分钟前' },
  { id: 3, type: 'warning', icon: '⚠️', user: '系统', action: '检测到服务器内存占用率已达临界值 85%', time: '32分钟前' },
  { id: 4, type: 'info', icon: '💡', user: '王芳', action: '提交了 PR #342 修复了分页组件分页器边界计算Bug', time: '1小时前' },
  { id: 5, type: 'success', icon: '✅', user: '陈强', action: '完成了 Q2 销售额对账核查，数据准确率 99.97%', time: '2小时前' },
  { id: 6, type: 'error', icon: '🔴', user: '运维系统', action: '生产环境 Redis 集群节点 Node-4 异常宕机告警', time: '3小时前' }
])

const unreadCount = ref<number>(3)
const markAllRead = (): void => {
  unreadCount.value = 0
  ElNotification({ title: '全部已读', message: '通知中心所有未读消息已标记为已读', type: 'success' })
}

// ==============================
// 4. 任务看板 (Kanban-like)
// ==============================
const kanbanCols = reactive<KanbanColumn[]>([
  {
    id: 'todo', label: '📋 待开发', color: '#e0e0e0',
    cards: [
      { id: 1, title: '用户权限RBAC系统重构', tag: 'P1', assignee: '张伟', dueDate: '07-20' },
      { id: 2, title: 'Naive UI 组件集成演示', tag: 'P2', assignee: '李娜', dueDate: '07-22' }
    ]
  },
  {
    id: 'inprogress', label: '🔧 开发中', color: '#2080f0',
    cards: [
      { id: 3, title: 'API 网关限流熔断优化', tag: 'P0', assignee: '王芳', dueDate: '07-17' },
      { id: 4, title: '多维度数据报表导出', tag: 'P1', assignee: '陈强', dueDate: '07-18' }
    ]
  },
  {
    id: 'review', label: '🔍 待评审', color: '#f0a020',
    cards: [
      { id: 5, title: '移动端 H5 自适应适配', tag: 'P2', assignee: '刘洋', dueDate: '07-16' }
    ]
  },
  {
    id: 'done', label: '✅ 已上线', color: '#18a058',
    cards: [
      { id: 6, title: '侧边栏 el-menu 导航升级', tag: 'P1', assignee: '系统', dueDate: '07-14' },
      { id: 7, title: 'Vue 版本升级至 3.5.39', tag: 'P0', assignee: '系统', dueDate: '07-14' }
    ]
  }
])

const addCard = (col: KanbanColumn): void => {
  col.cards.push({
    id: Date.now(),
    title: '新建任务卡片',
    tag: 'P2',
    assignee: '待分配',
    dueDate: '07-30'
  })
  ElMessage.success('已在该列新增一条任务卡片')
}

// ==============================
// 5. 综合系统设置面板
// ==============================
const settingsTab = ref<string>('notify')
const systemSettings = reactive({
  emailNotify: true,
  smsNotify: false,
  pushNotify: true,
  maintenance: false,
  maxSession: 100,
  loginIp: '',
  theme: 'dark',
  lang: 'zh-cn'
})

const themeOptions = [
  { label: '🌙 深色模式', value: 'dark' },
  { label: '☀️ 浅色模式', value: 'light' },
  { label: '🎨 系统自动', value: 'auto' }
]

const saveSettings = (): void => {
  ElMessage.success('系统配置参数已成功持久化保存！')
}

// ==============================
// 6. 环形图表 - 资源占用
// ==============================
const resourceData = ref<ResourceItem[]>([
  { label: 'CPU 使用率', value: 42, color: '#2080f0', icon: '🖥️' },
  { label: '内存占用率', value: 78, color: '#f0a020', icon: '💾' },
  { label: '磁盘 I/O', value: 35, color: '#18a058', icon: '💿' },
  { label: '网络带宽', value: 61, color: '#8a2be2', icon: '🌐' }
])

// 模拟资源波动
let resourceTimer: ReturnType<typeof setInterval> | null = null
onMounted((): void => {
  resourceTimer = setInterval(() => {
    resourceData.value.forEach((item: ResourceItem): void => {
      item.value = Math.min(99, Math.max(10, item.value + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5)))
    })
  }, 1500)
})
onUnmounted((): void => {
  if (resourceTimer !== null) clearInterval(resourceTimer)
})

// ==============================
// 7. N-Countdown 倒计时与发布日程
// ==============================
const releaseCountdown = ref(Date.now() + 1000 * 60 * 60 * 24 * 7)
const releaseSchedule = ref([
  { ver: 'v3.0.0-beta', date: '2026-08-01', status: '倒计时中', urgent: true },
  { ver: 'v2.14.4 Hotfix', date: '2026-07-18', status: '测试中', urgent: false },
  { ver: 'v2.14.3', date: '2026-07-14', status: '已上线', urgent: false }
])
</script>

<template>
  <div class="combined-demo">

    <!-- ============ 区域1: 仪表盘顶部统计卡片 ============ -->
    <div class="section-title">📊 实时数据仪表盘 <n-badge :value="4" type="info" style="margin-left: 8px;" /></div>
    <div class="stats-grid">
      <div v-for="card in statsCards" :key="card.id" class="stat-card" :style="{ '--accent': card.color }">
        <div class="stat-icon">{{ card.icon }}</div>
        <div class="stat-body">
          <div class="stat-label">{{ card.label }}</div>
          <n-statistic tabular-nums>
            <template #default>
              <span class="stat-value" :style="{ color: card.color }">
                {{ card.value.toLocaleString() }}
              </span>
              <span class="stat-suffix">{{ card.suffix }}</span>
            </template>
          </n-statistic>
          <div class="stat-trend" :class="card.trendUp ? 'up' : 'down'">
            {{ card.trendUp ? '↑' : '↓' }} {{ card.trend }} 较昨日
          </div>
        </div>
      </div>
    </div>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- ============ 区域2: 服务器资源实时监控 ============ -->
      <el-col :xs="24" :md="10">
        <div class="panel">
          <div class="panel-header">
            <span>🖥️ 服务器资源实时占用</span>
            <el-tag size="small" type="success" effect="dark">LIVE</el-tag>
          </div>
          <div class="resource-list">
            <div v-for="item in resourceData" :key="item.label" class="resource-item">
              <div class="resource-info">
                <span class="resource-icon">{{ item.icon }}</span>
                <span class="resource-label">{{ item.label }}</span>
                <span class="resource-pct" :style="{ color: item.color }">{{ item.value }}%</span>
              </div>
              <n-progress
                type="line"
                :percentage="item.value"
                :color="item.color"
                :indicator-placement="'inside'"
                :rail-color="'rgba(128,128,128,0.15)'"
                style="margin-top: 4px;"
              />
            </div>
          </div>
        </div>
      </el-col>

      <!-- ============ 区域3: 通知活动流 ============ -->
      <el-col :xs="24" :md="14">
        <div class="panel">
          <div class="panel-header">
            <span>
              🔔 通知活动中心
              <n-badge :value="unreadCount" :max="9" style="margin-left: 6px;" />
            </span>
            <el-button type="primary" link size="small" @click="markAllRead">全部已读</el-button>
          </div>
          <n-timeline style="padding: 8px 4px;">
            <n-timeline-item
              v-for="(act, idx) in activities"
              :key="act.id"
              :type="act.type"
              :title="act.user + ' · ' + act.time"
              :content="act.action"
            />
          </n-timeline>
        </div>
      </el-col>
    </el-row>

    <!-- ============ 区域4: 用户管理数据表（El-Table + Naive N-Tag） ============ -->
    <div class="panel" style="margin-top: 20px;">
      <div class="panel-header">
        <span>👥 用户管理中心</span>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <el-input
            v-model="userSearchKw"
            placeholder="🔍 搜索姓名/角色/部门"
            clearable
            size="small"
            style="width:220px;"
            @input="userPage = 1"
          />
          <el-button type="primary" size="small" @click="openAddUser">➕ 新增用户</el-button>
          <el-button
            type="danger"
            size="small"
            plain
            :disabled="!selectedUserIds.length"
          >
            🗑 批量删除 ({{ selectedUserIds.length }})
          </el-button>
        </div>
      </div>

      <el-table
        :data="pagedUsers"
        border
        stripe
        size="small"
        style="width:100%;"
        @selection-change="handleUserSelect"
      >
        <el-table-column type="selection" width="42" />
        <el-table-column label="用户信息" min-width="160">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:8px;">
              <img
                :src="row.avatar"
                style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid var(--el-border-color);"
              />
              <div>
                <div style="font-weight:600;font-size:13px;">{{ row.name }}</div>
                <div style="font-size:11px;color:var(--el-text-color-secondary);">{{ row.dept }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色权限" width="130" />
        <el-table-column label="评分" width="90">
          <template #default="{ row }">
            <span style="color:#f0a020;font-weight:600;">⭐ {{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column label="账户状态" width="100">
          <template #default="{ row }">
            <n-tag :type="row.status === 'active' ? 'success' : 'error'" size="small">
              {{ row.status === 'active' ? '✅ 正常' : '🔴 封禁' }}
            </n-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="上次登录" width="145" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div style="display:flex;gap:4px;">
              <el-button
                size="small"
                :type="row.status === 'active' ? 'warning' : 'success'"
                plain
                @click="toggleUserStatus(row)"
              >
                {{ row.status === 'active' ? '封禁' : '启用' }}
              </el-button>
              <el-popconfirm
                :title="`确定删除用户 ${row.name} 吗？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                @confirm="deleteUser(row)"
              >
                <template #reference>
                  <el-button size="small" type="danger" plain>删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div style="font-size:13px;color:var(--el-text-color-secondary);">
          共 {{ filteredUsers.length }} 条记录 | 已选择 {{ selectedUserIds.length }} 条
        </div>
        <el-pagination
          v-model:current-page="userPage"
          v-model:page-size="userPageSize"
          :page-sizes="[6, 10, 20]"
          layout="total, sizes, prev, pager, next"
          :total="filteredUsers.length"
          small
        />
      </div>
    </div>

    <!-- ============ 区域5: 任务看板 (El-Card + 自定义拖拽风格) ============ -->
    <div class="panel" style="margin-top:20px;">
      <div class="panel-header">
        <span>📌 敏捷任务看板</span>
        <el-tag type="info" size="small">Sprint #14</el-tag>
      </div>
      <div class="kanban-board">
        <div v-for="col in kanbanCols" :key="col.id" class="kanban-col">
          <div class="kanban-col-header" :style="{ borderTopColor: col.color }">
            <span>{{ col.label }}</span>
            <el-badge :value="col.cards.length" :max="99" />
          </div>
          <div class="kanban-cards">
            <div v-for="card in col.cards" :key="card.id" class="kanban-card">
              <div class="kanban-card-title">{{ card.title }}</div>
              <div class="kanban-card-meta">
                <n-tag size="tiny" :type="card.tag === 'P0' ? 'error' : card.tag === 'P1' ? 'warning' : 'default'">
                  {{ card.tag }}
                </n-tag>
                <span class="kanban-card-assignee">👤 {{ card.assignee }}</span>
                <span class="kanban-card-due">📅 {{ card.dueDate }}</span>
              </div>
            </div>
          </div>
          <el-button type="primary" link size="small" class="kanban-add-btn" @click="addCard(col)">
            ＋ 添加任务
          </el-button>
        </div>
      </div>
    </div>

    <el-row :gutter="20" style="margin-top:20px;">
      <!-- ============ 区域6: 版本发布日程 + 倒计时 ============ -->
      <el-col :xs="24" :md="12">
        <div class="panel">
          <div class="panel-header">
            <span>🚀 版本发布日程</span>
          </div>
          <div style="text-align:center;padding: 8px 0 16px;">
            <div style="font-size:12px;color:var(--el-text-color-secondary);margin-bottom:4px;">距离 v3.0.0-beta 发布</div>
            <n-countdown :duration="7 * 24 * 3600 * 1000" :active="true">
              <template #default="{ hours, minutes, seconds, days }">
                <div class="countdown-display">
                  <div class="countdown-unit">
                    <span class="countdown-num">{{ days }}</span>
                    <span class="countdown-label">天</span>
                  </div>
                  <span class="countdown-sep">:</span>
                  <div class="countdown-unit">
                    <span class="countdown-num">{{ String(hours).padStart(2, '0') }}</span>
                    <span class="countdown-label">时</span>
                  </div>
                  <span class="countdown-sep">:</span>
                  <div class="countdown-unit">
                    <span class="countdown-num">{{ String(minutes).padStart(2, '0') }}</span>
                    <span class="countdown-label">分</span>
                  </div>
                  <span class="countdown-sep">:</span>
                  <div class="countdown-unit">
                    <span class="countdown-num">{{ String(seconds).padStart(2, '0') }}</span>
                    <span class="countdown-label">秒</span>
                  </div>
                </div>
              </template>
            </n-countdown>
          </div>

          <el-table :data="releaseSchedule" size="small" style="width:100%;">
            <el-table-column prop="ver" label="版本号" width="130">
              <template #default="{ row }">
                <el-tag :type="row.urgent ? 'danger' : 'info'" size="small" effect="plain">{{ row.ver }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="发布时间" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <n-tag
                  size="small"
                  :type="row.status === '已上线' ? 'success' : row.status === '测试中' ? 'warning' : 'info'"
                >
                  {{ row.status }}
                </n-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <!-- ============ 区域7: 系统全局设置面板 ============ -->
      <el-col :xs="24" :md="12">
        <div class="panel">
          <div class="panel-header">
            <span>⚙️ 系统全局设置</span>
            <el-button type="primary" size="small" @click="saveSettings">💾 保存配置</el-button>
          </div>
          <el-tabs v-model="settingsTab" type="border-card" class="settings-tabs">
            <el-tab-pane label="🔔 通知设置" name="notify">
              <el-form label-width="120px" size="small">
                <el-form-item label="邮件通知">
                  <el-switch v-model="systemSettings.emailNotify" />
                  <el-text style="margin-left:10px;font-size:12px;" type="info">异常事件时推送邮件</el-text>
                </el-form-item>
                <el-form-item label="短信通知">
                  <el-switch v-model="systemSettings.smsNotify" />
                  <el-text style="margin-left:10px;font-size:12px;" type="info">P0告警时推送短信</el-text>
                </el-form-item>
                <el-form-item label="实时推送">
                  <el-switch v-model="systemSettings.pushNotify" />
                </el-form-item>
                <el-form-item label="维护模式">
                  <el-switch v-model="systemSettings.maintenance" active-color="#f56c6c" />
                  <n-tag v-if="systemSettings.maintenance" type="error" size="small" style="margin-left:10px;">维护中</n-tag>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="🛡️ 安全配置" name="security">
              <el-form label-width="120px" size="small">
                <el-form-item label="最大会话数">
                  <el-input-number v-model="systemSettings.maxSession" :min="10" :max="1000" />
                </el-form-item>
                <el-form-item label="IP 白名单">
                  <el-input v-model="systemSettings.loginIp" placeholder="多个 IP 以英文逗号分隔" clearable />
                </el-form-item>
                <el-form-item label="双重认证">
                  <el-switch :model-value="true" disabled />
                  <el-text style="margin-left:10px;font-size:12px;" type="success">已强制开启 2FA</el-text>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="🎨 界面偏好" name="appearance">
              <el-form label-width="120px" size="small">
                <el-form-item label="界面主题">
                  <n-select v-model:value="systemSettings.theme" :options="themeOptions" style="width:200px;" />
                </el-form-item>
                <el-form-item label="语言地区">
                  <n-select
                    v-model:value="systemSettings.lang"
                    :options="[{label: '🇨🇳 中文简体', value: 'zh-cn'}, {label: '🇺🇸 English', value: 'en'}]"
                    style="width:200px;"
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>

    <!-- 新增用户 Dialog -->
    <el-dialog v-model="dialogAddUser" title="➕ 新增系统用户" width="400px">
      <el-form label-width="90px" size="small">
        <el-form-item label="姓名" required>
          <el-input v-model="editingUser.name" placeholder="请输入真实姓名" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editingUser.role" style="width:100%;">
            <el-option v-for="r in ['超级管理员', '运营编辑', '数据分析师', '前端工程师', '后端工程师']" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="所在部门">
          <el-select v-model="editingUser.dept" style="width:100%;">
            <el-option v-for="d in ['技术中心', '运营中心', '产品设计', '市场营销']" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogAddUser = false">取消</el-button>
        <el-button type="primary" @click="confirmAddUser">确认新增</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss" src="./css/CombinedDemo.scss"></style>
