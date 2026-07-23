<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import OatUpdateModal from '@/components/oatUi/OatUpdateModal.vue'
import OatCreatePageModal, { type NewPageData } from '@/components/oatUi/OatCreatePageModal.vue'
import OatConfirmModal from '@/components/oatUi/OatConfirmModal.vue'
import OatDrawer from '@/components/oatUi/OatDrawer.vue'
import { registerOatUiComponents } from '@/components/oatUi'

registerOatUiComponents()
const router = useRouter()

// ------------------------------------------------------------------
// 1. 生成 400 个 Oat UI 组件、表格与界面范例数据集
// ------------------------------------------------------------------
export interface OatExampleItem {
  id: number
  code: string
  name: string
  category: '表格组件' | '弹窗与抽屉' | '表单控件' | '数据展示' | '布局排版' | '高级应用'
  status: '稳定' | '推荐' | '最新' | '实验'
  size: string
  description: string
  snippet: string
}

const CATEGORIES = ['全部', '表格组件', '弹窗与抽屉', '表单控件', '数据展示', '布局排版', '高级应用'] as const

const generate400Examples = (): OatExampleItem[] => {
  const items: OatExampleItem[] = []
  
  const baseTemplates = [
    {
      cat: '表格组件' as const,
      names: ['Oat 可筛选排序数据表格', 'Oat 极简紧凑型列表', 'Oat 带选择框批量表格', 'Oat 展开行细节表格', 'Oat 状态徽章响应式表格', 'Oat 跨页分页数据大表', 'Oat 虚拟滚动万条表格', 'Oat 冻结首列表单表格'],
      descs: ['包含 .oat-table 样式修饰、列头排序与 hover 效果', '适用于数据密集型后台的压缩边距表格', '支持多选 Checkbox 与批量导出操作栏', '点击行展开详细 JSON 与关联数据', '内嵌 .oat-badge 状态指示与时间戳', '支持页码选择与 pageSize 动态切换', '轻量级 DOM 节点复用与千行不卡顿渲染', '固定左侧序号与操作列的高阶表格'],
      sizes: ['1.2 KB', '0.8 KB', '1.5 KB', '2.1 KB', '1.1 KB', '1.8 KB', '3.4 KB', '2.6 KB']
    },
    {
      cat: '弹窗与抽屉' as const,
      names: ['Oat 版本更新发布日志弹窗', 'Oat 新建页面模态表单', 'Oat 危险删除操作确认框', 'Oat 全局通知右侧滑出抽屉', 'Oat 快捷设置侧边对话框', 'Oat 图片与大图预览浮层', 'Oat 复制成功 Toast 浮动提示', 'Oat 全屏居中通知 Modal'],
      descs: ['包含 Release Notes Timeline 与“不再自动提醒”复选框', '包含模板卡片选择、标签添加与动态路由校验', '红色警告图标与确定/取消二次确认按键', '右侧 400px 宽度 smooth slide-in 滑出面板', '系统偏好设置与夜间模式切换抽屉', '支持放缩、旋转与图片元信息展示', '轻量级自动消失的全局 Toast 弹框', '遮罩模糊 backdrop-filter 极简居中提示框'],
      sizes: ['2.4 KB', '3.1 KB', '1.0 KB', '1.7 KB', '2.2 KB', '2.8 KB', '0.6 KB', '1.3 KB']
    },
    {
      cat: '表单控件' as const,
      names: ['Oat 胶囊按钮组', 'Oat 标签选择器 (<ot-tag-input>)', 'Oat 拖拽文件上传 (<ot-upload>)', 'Oat 组合下拉菜单 (<ot-dropdown>)', 'Oat 极简单选框与复选框', 'Oat 范围滑块 (<input type=range>)', 'Oat 仪表计量条 (<meter>)', 'Oat 进度条控件 (<progress>)'],
      descs: ['包含 primary, secondary, outline, danger 形态', '原生 Web Component 变体，支持回车添加与删除', '支持拖拽拖放文件与上传进度动画', '自定义 trigger 与带有 shadow 阴影浮层', '原生无损样式覆盖，高对比度聚焦环', '实时数值响应与 Tail 充能填充', '展示 0.0 至 1.0 的数据占比与阀值色', '支持 indeterminate 循环加载与平滑 fill'],
      sizes: ['0.9 KB', '1.6 KB', '2.5 KB', '1.8 KB', '0.7 KB', '0.8 KB', '0.6 KB', '0.5 KB']
    },
    {
      cat: '数据展示' as const,
      names: ['Oat 极简卡片容器 (.oat-card)', 'Oat 统计指标块 (Stats Box)', 'Oat 步骤条 (Stepper Timeline)', 'Oat 标签页切换 (<ot-tabs>)', 'Oat 知识库折叠面板 (<details>)', 'Oat 徽章提示 (.oat-badge)', 'Oat 代码展示块 (<code>/<pre>)', 'Oat 快捷键徽章 (<kbd>)'],
      descs: ['包揽 header, body, footer 三层级结构', '包含指标大字、同比环比趋势与图标', '展示多阶段工作流与当前步骤亮起', '支持多 Slot 注入与平滑 Tab 划线过渡', '原生 HTML5 展开收起手风琴动画', '支持 blue, green, orange, purple, danger', '自带代码高亮与右侧一键复制', '适配 macOS 与 Windows 标准快捷键外观'],
      sizes: ['1.1 KB', '1.4 KB', '1.9 KB', '1.7 KB', '1.0 KB', '0.4 KB', '0.9 KB', '0.3 KB']
    },
    {
      cat: '布局排版' as const,
      names: ['Oat Grid 响应式栅格系统', 'Oat Flex 两栏侧边栏布局', 'Oat TopBar 极简页头栏', 'Oat 粘性吸顶 Toolbar', 'Oat 宽屏流式居中 Container', 'Oat 仪表盘 4 宫格卡片布局', 'Oat 分隔线与垂直间距', 'Oat 极简 Footer 页脚'],
      descs: ['使用 CSS Grid 自适应 mobile/tablet/desktop', '固定侧边导航与右侧内容区自适应滚动', '包含 Logo、搜索框与用户头像区', '滚动时吸顶并附带 Glassmorphism 模糊', 'max-width 1280px 居中大屏内容约束', '适用于控制台 Metric 卡片平铺', '带有文本居中的分割线与 spacing 工具类', '包含版权声明、友情链接与版本号'],
      sizes: ['1.5 KB', '2.0 KB', '1.6 KB', '1.2 KB', '0.8 KB', '2.3 KB', '0.5 KB', '0.9 KB']
    },
    {
      cat: '高级应用' as const,
      names: ['Oat 完整控制台 Dashboard 页面', 'Oat 极简 API 文档中心', 'Oat 个人工作台与待办事项', 'Oat 运维监控实时日志流', 'Oat 小米商城数据查询模板', 'Oat 游戏大厅卡片列表', 'Oat 权限控制与角色管理', 'Oat AI 对话聊天窗口模板'],
      descs: ['集成 Table, Modal, Stats 与 Drawer 综合案例', '左侧 Markdown 目录，右侧代码与试用', '带有 Checkbox 勾选、优先级 Badge 与搜索', '实时 WebSocket 消息增量追加与底端锁定', '27 万行大数据源筛选与跨页渲染', '包含音效控制、触屏手柄与高分榜', '列表与权限 Switch 联动控制', '流式气泡对话、代码块与复制按钮'],
      sizes: ['4.5 KB', '3.8 KB', '3.2 KB', '4.1 KB', '5.2 KB', '3.6 KB', '4.0 KB', '4.8 KB']
    }
  ]

  const statuses: OatExampleItem['status'][] = ['推荐', '稳定', '最新', '实验']

  let idCounter = 1
  for (let cycle = 0; cycle < 50; cycle++) {
    for (const tpl of baseTemplates) {
      const idx = cycle % tpl.names.length
      const name = cycle === 0 ? tpl.names[idx] : `${tpl.names[idx]} (变体 #${cycle + 1})`
      const status = statuses[(cycle + idx) % statuses.length]
      const size = tpl.sizes[idx]
      const desc = tpl.descs[idx]

      const snippet = `<div class="oat-example-box">
  <!-- 示例 ${idCounter}: ${name} -->
  <div class="oat-card">
    <div class="card-header">
      <h4>${name}</h4>
      <span class="oat-badge blue">${status}</span>
    </div>
    <div class="card-body">
      <p>${desc}</p>
      <code>const oatUi = true; // Example #${idCounter}</code>
    </div>
  </div>
</div>`

      items.push({
        id: idCounter,
        code: `OAT-EX-${String(idCounter).padStart(4, '0')}`,
        name,
        category: tpl.cat,
        status,
        size,
        description: desc,
        snippet
      })
      idCounter++
    }
  }

  return items
}

const allExamples = generate400Examples()

// ------------------------------------------------------------------
// 2. 状态与筛选逻辑
// ------------------------------------------------------------------
const activeCat = ref<typeof CATEGORIES[number]>('全部')
const searchQuery = ref<string>('')
const sortKey = ref<'id' | 'name' | 'category' | 'status' | 'size'>('id')
const sortOrder = ref<'asc' | 'desc'>('asc')

const currentPage = ref<number>(1)
const pageSize = ref<number>(20)

// 详情/源码弹窗状态
const previewItem = ref<OatExampleItem | null>(null)
const previewModalOpen = ref<boolean>(false)

// 基础弹窗状态
const updateModalOpen = ref<boolean>(false)
const createPageModalOpen = ref<boolean>(false)
const confirmModalOpen = ref<boolean>(false)
const confirmType = ref<'warning' | 'danger' | 'success' | 'info'>('warning')
const confirmTitle = ref<string>('确认删除该记录？')
const confirmMsg = ref<string>('此操作将不可撤销，删除后该数据记录将从本地数据库中永久移除。')
const drawerOpen = ref<boolean>(false)

// 动态创建的页面列表
const createdPages = ref<NewPageData[]>([
  {
    title: '示例·数据分析看板',
    path: 'analytics-dashboard',
    template: 'dashboard',
    tags: ['数据', '看板', 'Oat UI'],
    description: '核心指标卡片与用户流失分析大屏',
    isPublic: true
  },
  {
    title: '示例·极简个人中心',
    path: 'user-profile',
    template: 'blank',
    tags: ['用户', '设置'],
    description: '基本信息设置与个人密钥管理',
    isPublic: false
  }
])

// 过滤与排序
const filteredExamples = computed(() => {
  return allExamples.filter((item) => {
    const matchesCat = activeCat.value === '全部' || item.category === activeCat.value
    const q = searchQuery.value.trim().toLowerCase()
    const matchesQuery = !q ||
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    return matchesCat && matchesQuery
  }).sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]
    if (typeof valA === 'string') {
      const cmp = (valA as string).localeCompare(valB as string, 'zh-CN')
      return sortOrder.value === 'asc' ? cmp : -cmp
    }
    const cmp = (valA as number) - (valB as number)
    return sortOrder.value === 'asc' ? cmp : -cmp
  })
})

// 分页列表
const paginatedExamples = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredExamples.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredExamples.value.length / pageSize.value) || 1
})

const handleSort = (key: typeof sortKey.value) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const copySnippet = async (item: OatExampleItem) => {
  try {
    await navigator.clipboard.writeText(item.snippet)
    ElMessage.success(`已复制 ${item.name} (${item.code}) 源码！`)
  } catch {
    ElMessage.error('复制失败')
  }
}

const openPreview = (item: OatExampleItem) => {
  previewItem.value = item
  previewModalOpen.value = true
}

const handleCreatePage = (data: NewPageData) => {
  createdPages.value.unshift(data)
  ElMessage.success(`成功生成页面《${data.title}》(/oat-studio/${data.path})！`)
}

const triggerConfirmDialog = (type: 'warning' | 'danger' | 'success' | 'info') => {
  confirmType.value = type
  if (type === 'danger') {
    confirmTitle.value = '确定危险删除？'
    confirmMsg.value = '此操作将无法还原，确定要清理全站缓存并重置状态吗？'
  } else if (type === 'success') {
    confirmTitle.value = '配置发布成功'
    confirmMsg.value = '当前全局路由与 Oat UI 组件定义已成功同步至部署节点。'
  } else if (type === 'warning') {
    confirmTitle.value = '版本切换警告'
    confirmMsg.value = '检测到您正尝试从 v2.4.0 降级，可能部分新特性无法向下兼容。'
  } else {
    confirmTitle.value = '系统常规提示'
    confirmMsg.value = '欢迎使用基于 oat.ink 规范打造的极简组件套件。'
  }
  confirmModalOpen.value = true
}

const onConfirmAction = () => {
  ElMessage.success('已执行确认操作')
}
</script>

<template>
  <div class="oat-studio-page">
    <!-- Header 头部栏 -->
    <header class="studio-header">
      <div class="header-content">
        <div class="tag-badge">🌾 Oat.ink Interactive Studio</div>
        <h1>Oat UI 全套 400 个实战范例与表格组件套件</h1>
        <p>
          遵循 <a href="https://oat.ink/" target="_blank">Oat UI (oat.ink)</a>
          极简理念，汇聚包含<strong>完整 400 个交互范例的响应式表格 (.oat-table)</strong>、<strong>系统更新提示框</strong>、<strong>新建页面表单</strong>、<strong>确认对话框</strong>与<strong>右侧抽屉</strong>。
        </p>

        <!-- 数据统计速览栏 -->
        <div class="stats-summary">
          <div class="stat-item">
            <span class="num">400</span>
            <span class="lbl">全套组件与表格范例</span>
          </div>
          <div class="stat-item">
            <span class="num">6 大</span>
            <span class="lbl">覆盖场景分类</span>
          </div>
          <div class="stat-item">
            <span class="num">.oat-table</span>
            <span class="lbl">原生极简表格修饰</span>
          </div>
          <div class="stat-item">
            <span class="num">0 依赖</span>
            <span class="lbl">极致快速加载性能</span>
          </div>
        </div>

        <div class="action-bar">
          <button class="oat-btn primary" @click="updateModalOpen = true">
            🔔 查看最新版本更新提示
          </button>
          <button class="oat-btn outline" @click="createPageModalOpen = true">
            ✨ + 新建 Oat 交互页面
          </button>
          <button class="oat-btn secondary" @click="drawerOpen = true">
            📥 打开系统通知抽屉
          </button>
          <button class="oat-btn secondary" @click="router.push('/oat-ui')">
            🧩 浏览基础 26 控件
          </button>
        </div>
      </div>
    </header>

    <!-- Main 主体区 -->
    <main class="studio-container">
      <!-- 1. 400 个 Oat UI 范例大表格专区 (.oat-table) -->
      <section class="studio-section oat-table-section">
        <div class="section-title">
          <span class="icon">📊</span>
          <h2>1. Oat UI 全套 400 个组件与范例数据集 (.oat-table)</h2>
          <span class="sub-tag">支持列头排序、分类筛选、实时搜索与代码复制</span>
        </div>

        <div class="table-card">
          <!-- 搜索与分类 Tab 栏 -->
          <div class="table-toolbar">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索 400 个范例名称、编号或描述..."
                @input="currentPage = 1"
              />
            </div>

            <div class="category-tabs">
              <button
                v-for="cat in CATEGORIES"
                :key="cat"
                class="cat-tab"
                :class="{ active: activeCat === cat }"
                @click="activeCat = cat; currentPage = 1"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <!-- 原生 Oat 表格展示区 -->
          <div class="table-wrapper">
            <table class="oat-table">
              <thead>
                <tr>
                  <th class="sortable" @click="handleSort('id')">
                    编号 <span v-if="sortKey === 'id'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th class="sortable" @click="handleSort('name')">
                    范例名称 <span v-if="sortKey === 'name'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th class="sortable" @click="handleSort('category')">
                    分类 <span v-if="sortKey === 'category'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th class="sortable" @click="handleSort('status')">
                    状态 <span v-if="sortKey === 'status'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th class="sortable" @click="handleSort('size')">
                    大小 <span v-if="sortKey === 'size'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th>描述说明</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!paginatedExamples.length">
                  <td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;">
                    未找到匹配的范例记录（当前共 {{ filteredExamples.length }} 条）
                  </td>
                </tr>

                <tr v-for="item in paginatedExamples" :key="item.id">
                  <td class="item-id">#{{ String(item.id).padStart(3, '0') }}</td>
                  <td>
                    <div class="comp-name">{{ item.name }}</div>
                  </td>
                  <td>
                    <span class="oat-badge gray">{{ item.category }}</span>
                  </td>
                  <td>
                    <span
                      class="oat-badge"
                      :class="{
                        blue: item.status === '推荐',
                        green: item.status === '稳定',
                        orange: item.status === '最新',
                        purple: item.status === '实验'
                      }"
                    >
                      {{ item.status }}
                    </span>
                  </td>
                  <td>
                    <span class="size-tag">{{ item.size }}</span>
                  </td>
                  <td class="comp-desc">{{ item.description }}</td>
                  <td>
                    <div class="action-cell">
                      <button class="oat-btn outline small" @click="openPreview(item)">
                        预览源码
                      </button>
                      <button class="oat-btn secondary small" @click="copySnippet(item)">
                        📋 复制代码
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页器栏 -->
          <div class="table-pagination">
            <div class="page-info">
              显示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredExamples.length) }} 条，共 {{ filteredExamples.length }} 个范例（总库 400 个）
            </div>

            <div class="pagination-controls">
              <select v-model="pageSize" @change="currentPage = 1">
                <option :value="10">10 条/页</option>
                <option :value="20">20 条/页</option>
                <option :value="50">50 条/页</option>
                <option :value="100">100 条/页</option>
              </select>

              <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">
                ◀ 上一页
              </button>
              <span class="page-text" style="font-size: 0.85rem; color: #475569; font-weight: 600;">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
                下一页 ▶
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. 常用交互弹窗触发展区 -->
      <section class="studio-section">
        <div class="section-title">
          <span class="icon">💬</span>
          <h2>2. Oat UI 常用交互弹窗与抽屉试验场</h2>
          <span class="sub-tag">点击下列卡片按钮快速开启体验</span>
        </div>

        <div class="trigger-grid">
          <!-- 弹窗 1: 更新提示 -->
          <div class="trigger-card">
            <div class="card-icon">🎉</div>
            <h3>新版本更新提示 (Release Notes)</h3>
            <p>包含版本 Tag 徽章、新功能 Timeline、版本亮点与“稍后提醒/立即体验”胶囊按钮。</p>
            <button class="oat-btn primary" @click="updateModalOpen = true">
              触发更新提示弹窗
            </button>
          </div>

          <!-- 弹窗 2: 新建页面 modal -->
          <div class="trigger-card">
            <div class="card-icon">📝</div>
            <h3>新建页面 / 项目模态表单</h3>
            <p>基于 Oat UI 极简表单规范，支持配置路由 Path、页面类型模板（Dashboard / 列表）与 Tag。</p>
            <button class="oat-btn primary" @click="createPageModalOpen = true">
              触发新建页面弹窗
            </button>
          </div>

          <!-- 弹窗 3: 危险/警告对话框 -->
          <div class="trigger-card">
            <div class="card-icon">⚠️</div>
            <h3>警告 / 危险删除确认框</h3>
            <p>用于拦截关键与危险性操作，带有高亮图标提示与明确的双选项胶囊按键。</p>
            <div class="btn-group-row" style="display: flex; gap: 8px;">
              <button class="oat-btn danger small" @click="triggerConfirmDialog('danger')">
                危险删除
              </button>
              <button class="oat-btn secondary small" @click="triggerConfirmDialog('warning')">
                警告提示
              </button>
            </div>
          </div>

          <!-- 弹窗 4: 右侧抽屉 -->
          <div class="trigger-card">
            <div class="card-icon">📂</div>
            <h3>右侧滑出抽屉 (Drawer)</h3>
            <p>极简的右侧滑出面板，适用于系统通知中心、详细配置或日志历史查阅。</p>
            <button class="oat-btn secondary" @click="drawerOpen = true">
              滑出右侧抽屉
            </button>
          </div>
        </div>
      </section>

      <!-- 3. 已动态生成的 Oat 页面成果展示 -->
      <section class="studio-section dynamic-pages-section">
        <div class="section-title">
          <span class="icon">📄</span>
          <h2>3. 已生成的 Oat UI 交互页面 ({{ createdPages.length }})</h2>
          <button class="oat-btn outline small" @click="createPageModalOpen = true">
            + 继续新建
          </button>
        </div>

        <div v-if="!createdPages.length" class="empty-box">
          尚无动态页面，点击顶部“+ 新建 Oat 交互页面”按钮尝试生成！
        </div>

        <div v-else class="pages-grid">
          <div v-for="(pg, idx) in createdPages" :key="idx" class="created-page-card">
            <div class="card-top">
              <span class="tpl-badge">{{ pg.template.toUpperCase() }}</span>
              <span class="path-text">/oat-studio/{{ pg.path }}</span>
            </div>
            <h4>{{ pg.title }}</h4>
            <p>{{ pg.description || '暂无详细描述信息' }}</p>
            <div class="card-bottom">
              <div class="tags">
                <span v-for="(t, tIdx) in pg.tags" :key="tIdx" class="tag">#{{ t }}</span>
              </div>
              <button class="oat-btn secondary small" @click="ElMessage.info(`预览页面 /oat-studio/${pg.path}`)">
                预览页面
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 范例预览与源码弹窗 -->
    <OatConfirmModal
      v-model="previewModalOpen"
      type="info"
      :title="`范例预览：${previewItem?.name || ''}`"
      :message="`${previewItem?.description || ''}\n\n代码片段：\n${previewItem?.snippet || ''}`"
      confirm-text="复制源码"
      cancel-text="关闭"
      @confirm="previewItem && copySnippet(previewItem)"
    />

    <!-- 其它通用弹窗挂载 -->
    <OatUpdateModal v-model="updateModalOpen" @confirm="ElMessage.success('已开启新功能体验！')" />

    <OatCreatePageModal v-model="createPageModalOpen" @create="handleCreatePage" />

    <OatConfirmModal
      v-model="confirmModalOpen"
      :type="confirmType"
      :title="confirmTitle"
      :message="confirmMsg"
      @confirm="onConfirmAction"
    />

    <OatDrawer v-model="drawerOpen" title="🔔 全局系统通知" subtitle="Oat UI 极简抽屉">
      <div class="notification-list">
        <div class="notif-item">
          <div class="notif-title">🎉 Oat UI 400 个范例库上线</div>
          <div class="notif-desc">包含数据表格 .oat-table、更新提示模态框与右侧抽屉套件。</div>
          <div class="notif-time">今天 10:45</div>
        </div>
        <div class="notif-item">
          <div class="notif-title">⚡ 单元测试全数通过</div>
          <div class="notif-desc">导航与核心组件 12/12 项集成测试全部 pass。</div>
          <div class="notif-time">今天 09:12</div>
        </div>
      </div>
      <template #footer>
        <button class="oat-btn secondary" style="width: 100%;" @click="drawerOpen = false">
          全部标记为已读
        </button>
      </template>
    </OatDrawer>
  </div>
</template>

<style scoped lang="scss">
@import './css/index.scss';

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .notif-item {
    padding: 12px 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;

    .notif-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .notif-desc {
      font-size: 0.82rem;
      color: #475569;
      line-height: 1.4;
      margin-bottom: 6px;
    }
    .notif-time {
      font-size: 0.75rem;
      color: #94a3b8;
    }
  }
}
</style>
