<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
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
// 1. 生成 400 个 Oat UI 组件与表格范例数据集
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
      names: ['Oat 可双击编辑数据表格', 'Oat 极简紧凑型列表', 'Oat 带选择框批量表格', 'Oat 展开行细节表格', 'Oat 状态徽章响应式表格', 'Oat 跨页分页数据大表', 'Oat 虚拟滚动万条表格', 'Oat 冻结首列表单表格'],
      descs: ['包含 .oat-table 样式修饰、双击单元格行内编辑与保存', '适用于数据密集型后台的压缩边距表格', '支持多选 Checkbox 与批量导出操作栏', '点击行展开详细 JSON 与关联数据', '内嵌 .oat-badge 状态指示与时间戳', '支持页码选择与 pageSize 动态切换', '轻量级 DOM 节点复用与千行不卡顿渲染', '固定左侧序号与操作列的高阶表格'],
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
      names: ['Oat 实时校验表单与年月选择器', 'Oat 标签选择器 (<ot-tag-input>)', 'Oat 拖拽文件上传 (<ot-upload>)', 'Oat 组合下拉菜单 (<ot-dropdown>)', 'Oat 极简单选框与复选框', 'Oat 范围滑块 (<input type=range>)', 'Oat 仪表计量条 (<meter>)', 'Oat 进度条控件 (<progress>)'],
      descs: ['包含邮箱/手机号/年月 YYYY-MM 正则校验与错误提示', '原生 Web Component 变体，支持回车添加与删除', '支持拖拽拖放文件与上传进度动画', '自定义 trigger 与带有 shadow 阴影浮层', '原生无损样式覆盖，高对比度聚焦环', '实时数值响应与 Tail 充能填充', '展示 0.0 至 1.0 的数据占比与阀值色', '支持 indeterminate 循环加载与平滑 fill'],
      sizes: ['0.9 KB', '1.6 KB', '2.5 KB', '1.8 KB', '0.7 KB', '0.8 KB', '0.6 KB', '0.5 KB']
    },
    {
      cat: '数据展示' as const,
      names: ['Oat 树形目录与层级组件', 'Oat 极简卡片容器 (.oat-card)', 'Oat 统计指标块 (Stats Box)', 'Oat 步骤条 (Stepper Timeline)', 'Oat 标签页切换 (<ot-tabs>)', 'Oat 知识库折叠面板 (<details>)', 'Oat 徽章提示 (.oat-badge)', 'Oat 代码展示块 (<code>/<pre>)'],
      descs: ['包含展开折叠、添加子节点与选中提示树形图', '包揽 header, body, footer 三层级结构', '包含指标大字、同比环比趋势与图标', '展示多阶段工作流与当前步骤亮起', '支持多 Slot 注入与平滑 Tab 划线过渡', '原生 HTML5 展开收起手风琴动画', '支持 blue, green, orange, purple, danger', '自带代码高亮与右侧一键复制'],
      sizes: ['1.8 KB', '1.1 KB', '1.4 KB', '1.9 KB', '1.7 KB', '1.0 KB', '0.4 KB', '0.9 KB']
    },
    {
      cat: '布局排版' as const,
      names: ['Oat 省市区级联下拉选择器', 'Oat Grid 响应式栅格系统', 'Oat Flex 两栏侧边栏布局', 'Oat TopBar 极简页头栏', 'Oat 粘性吸顶 Toolbar', 'Oat 宽屏流式居中 Container', 'Oat 仪表盘 4 宫格卡片布局', 'Oat 分隔线与垂直间距'],
      descs: ['支持省份与城市二级联动下拉与重置', '使用 CSS Grid 自适应 mobile/tablet/desktop', '固定侧边导航与右侧内容区自适应滚动', '包含 Logo、搜索框与用户头像区', '滚动时吸顶并附带 Glassmorphism 模糊', 'max-width 1280px 居中大屏内容约束', '适用于控制台 Metric 卡片平铺', '带有文本居中的分割线与 spacing 工具类'],
      sizes: ['1.6 KB', '1.5 KB', '2.0 KB', '1.6 KB', '1.2 KB', '0.8 KB', '2.3 KB', '0.5 KB']
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

const allExamples = ref<OatExampleItem[]>(generate400Examples())

// ------------------------------------------------------------------
// 2. 表格数据、双击行内编辑与筛选
// ------------------------------------------------------------------
const activeCat = ref<typeof CATEGORIES[number]>('全部')
const searchQuery = ref<string>('')
const sortKey = ref<'id' | 'name' | 'category' | 'status' | 'size'>('id')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref<number>(1)
const pageSize = ref<number>(20)

// 双击修改表格单元格状态
const editingCellId = ref<number | null>(null)
const editingField = ref<string | null>(null)
const editValue = ref<string>('')

const startCellEdit = (item: OatExampleItem, field: keyof OatExampleItem) => {
  editingCellId.value = item.id
  editingField.value = field
  editValue.value = String(item[field])
}

const saveCellEdit = (item: OatExampleItem) => {
  if (editingCellId.value && editingField.value) {
    const field = editingField.value as keyof OatExampleItem
    if (field === 'name' || field === 'description') {
      ;(item as any)[field] = editValue.value.trim() || item[field]
      ElMessage.success(`已保存修改！#${item.id} ${field}: "${(item as any)[field]}"`)
    }
  }
  editingCellId.value = null
  editingField.value = null
}

const filteredExamples = computed(() => {
  return allExamples.value.filter((item) => {
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

// ------------------------------------------------------------------
// 3. 表单实时校验 State
// ------------------------------------------------------------------
const validForm = reactive({
  username: '',
  email: '',
  phone: '',
  yearMonth: '2026-07',
  role: 'developer'
})

const formErrors = reactive({
  username: '',
  email: '',
  phone: '',
  yearMonth: ''
})

const validateForm = () => {
  let valid = true
  if (!validForm.username.trim() || validForm.username.length < 2) {
    formErrors.username = '姓名不能小于 2 个字符'
    valid = false
  } else {
    formErrors.username = ''
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(validForm.email)) {
    formErrors.email = '请填入有效的邮箱地址（如 user@oat.ink）'
    valid = false
  } else {
    formErrors.email = ''
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(validForm.phone)) {
    formErrors.phone = '请填入有效的 11 位手机号码'
    valid = false
  } else {
    formErrors.phone = ''
  }

  if (!validForm.yearMonth) {
    formErrors.yearMonth = '请选择生效年月'
    valid = false
  } else {
    formErrors.yearMonth = ''
  }

  if (valid) {
    ElMessage.success('表单校验全部通过，成功提交！')
  } else {
    ElMessage.error('表单填写存在错误，请核对红色提示')
  }
}

// ------------------------------------------------------------------
// 4. 树形目录组件 (Tree View State)
// ------------------------------------------------------------------
interface TreeNode {
  id: string
  label: string
  icon: string
  expanded?: boolean
  children?: TreeNode[]
}

const treeData = ref<TreeNode[]>([
  {
    id: '1',
    label: 'src 项目源码目录',
    icon: '📁',
    expanded: true,
    children: [
      {
        id: '1-1',
        label: 'components 组件库',
        icon: '📁',
        expanded: true,
        children: [
          { id: '1-1-1', label: 'oatUi/OatUpdateModal.vue', icon: '📄' },
          { id: '1-1-2', label: 'oatUi/OatCreatePageModal.vue', icon: '📄' },
          { id: '1-1-3', label: 'oatUi/OatConfirmModal.vue', icon: '📄' },
          { id: '1-1-4', label: 'oatUi/OatDrawer.vue', icon: '📄' }
        ]
      },
      {
        id: '1-2',
        label: 'views 视图目录',
        icon: '📁',
        expanded: true,
        children: [
          { id: '1-2-1', label: 'oatStudio/index.vue (400 范例展厅)', icon: '🚀' },
          { id: '1-2-2', label: 'oatUi/index.vue (26 控件基础库)', icon: '🌾' }
        ]
      }
    ]
  }
])

const selectedTreeNode = ref<TreeNode | null>(treeData.value[0].children![0].children![0])

const toggleTreeNode = (node: TreeNode) => {
  if (node.children) node.expanded = !node.expanded
}

const selectTreeNode = (node: TreeNode) => {
  selectedTreeNode.value = node
}

const addChildNode = () => {
  if (!selectedTreeNode.value) return
  if (!selectedTreeNode.value.children) selectedTreeNode.value.children = []
  const newId = `${selectedTreeNode.value.id}-${selectedTreeNode.value.children.length + 1}`
  selectedTreeNode.value.children.push({
    id: newId,
    label: `自定义新节点 #${newId}`,
    icon: '📄'
  })
  selectedTreeNode.value.expanded = true
  ElMessage.success(`在节点《${selectedTreeNode.value.label}》下添加子节点！`)
}

// ------------------------------------------------------------------
// 5. 年月/日期选择器 & 省市级联选择器 State
// ------------------------------------------------------------------
const selectedMonth = ref<string>('2026-07')
const startDate = ref<string>('2026-07-01')
const endDate = ref<string>('2026-07-24')

const provinceList = ['浙江省', '江苏省', '广东省', '北京', '上海']
const cityMap: Record<string, string[]> = {
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市'],
  '江苏省': ['南京市', '苏州市', '无锡市'],
  '广东省': ['广州市', '深圳市', '珠海市'],
  '北京': ['东城区', '朝阳区', '海淀区'],
  '上海': ['黄浦区', '静安区', '浦东新区']
}

const selectedProvince = ref<string>('浙江省')
const selectedCity = ref<string>('杭州市')

const handleProvinceChange = () => {
  const cities = cityMap[selectedProvince.value] || []
  selectedCity.value = cities[0] || ''
}

// ------------------------------------------------------------------
// 6. 其它基础弹窗与预览状态
// ------------------------------------------------------------------
const previewItem = ref<OatExampleItem | null>(null)
const previewModalOpen = ref<boolean>(false)
const updateModalOpen = ref<boolean>(false)
const createPageModalOpen = ref<boolean>(false)
const confirmModalOpen = ref<boolean>(false)
const confirmType = ref<'warning' | 'danger' | 'success' | 'info'>('warning')
const confirmTitle = ref<string>('确认删除该记录？')
const confirmMsg = ref<string>('此操作将不可撤销，删除后该数据记录将从本地数据库中永久移除。')
const drawerOpen = ref<boolean>(false)

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
</script>

<template>
  <div class="oat-studio-page">
    <!-- Header 头部栏 -->
    <header class="studio-header">
      <div class="header-content">
        <div class="tag-badge">🌾 Oat.ink Interactive Studio</div>
        <h1>Oat UI 全套 400 个范例库、双击编辑表格与高级表单套件</h1>
        <p>
          遵循 <a href="https://oat.ink/" target="_blank">Oat UI (oat.ink)</a> 极简规范，包含<strong>400 个全量范例表格 (支持双击修改)</strong>、<strong>实时校验表单</strong>、<strong>树形目录组件</strong>、<strong>年月与日期范围选择器</strong>及<strong>省市区级联下拉框</strong>。
        </p>

        <!-- 数据统计速览栏 -->
        <div class="stats-summary">
          <div class="stat-item">
            <span class="num">400</span>
            <span class="lbl">全套组件与范例数据集</span>
          </div>
          <div class="stat-item">
            <span class="num">双击修改</span>
            <span class="lbl">表格单元格行内编辑</span>
          </div>
          <div class="stat-item">
            <span class="num">表单校验</span>
            <span class="lbl">邮箱/手机号/年月正则</span>
          </div>
          <div class="stat-item">
            <span class="num">树形与级联</span>
            <span class="lbl">Tree View & Cascader</span>
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
      <!-- 模块 1: 400 个 Oat UI 范例大表格专区 (支持双击修改) -->
      <section class="studio-section oat-table-section">
        <div class="section-title">
          <span class="icon">📊</span>
          <h2>1. Oat UI 全套 400 个范例表格 (.oat-table) — 💡 提示：双击单元格可直接修改！</h2>
          <span class="sub-tag">支持列头排序、双击修改名称/描述、分类筛选与代码复制</span>
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

          <!-- 原生 Oat 表格展示区 (支持双击编辑) -->
          <div class="table-wrapper">
            <table class="oat-table">
              <thead>
                <tr>
                  <th class="sortable" @click="handleSort('id')">
                    编号 <span v-if="sortKey === 'id'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th class="sortable" @click="handleSort('name')">
                    范例名称 (双击编辑) <span v-if="sortKey === 'name'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
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
                  <th>描述说明 (双击编辑)</th>
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

                  <!-- 可双击编辑的名称 -->
                  <td class="editable-td" @dblclick="startCellEdit(item, 'name')">
                    <div v-if="editingCellId === item.id && editingField === 'name'">
                      <input
                        v-model="editValue"
                        type="text"
                        class="cell-edit-input"
                        @blur="saveCellEdit(item)"
                        @keyup.enter="saveCellEdit(item)"
                      />
                    </div>
                    <div v-else class="comp-name">
                      {{ item.name }}
                      <span class="edit-hint">✏️ 双击修改</span>
                    </div>
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

                  <!-- 可双击编辑的描述 -->
                  <td class="editable-td" @dblclick="startCellEdit(item, 'description')">
                    <div v-if="editingCellId === item.id && editingField === 'description'">
                      <input
                        v-model="editValue"
                        type="text"
                        class="cell-edit-input"
                        @blur="saveCellEdit(item)"
                        @keyup.enter="saveCellEdit(item)"
                      />
                    </div>
                    <div v-else class="comp-desc">
                      {{ item.description }}
                      <span class="edit-hint">✏️ 双击修改</span>
                    </div>
                  </td>

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

      <!-- 模块 2: Oat 响应式表单带完整实时校验 -->
      <section class="studio-section oat-form-validation-section">
        <div class="section-title">
          <span class="icon">📝</span>
          <h2>2. Oat UI 响应式表单与实时正则校验 (Form Validation)</h2>
          <span class="sub-tag">包含必填项、邮箱/手机号格式校验与错误提醒</span>
        </div>

        <div class="form-card">
          <div class="form-grid">
            <!-- 姓名 -->
            <div class="form-field">
              <label>真实姓名 <span class="req">*</span></label>
              <div class="input-wrapper">
                <input
                  v-model="validForm.username"
                  type="text"
                  placeholder="请输入姓名..."
                  :class="{ 'has-error': formErrors.username }"
                />
              </div>
              <span v-if="formErrors.username" class="err-msg">⚠️ {{ formErrors.username }}</span>
            </div>

            <!-- 邮箱 -->
            <div class="form-field">
              <label>电子邮箱 <span class="req">*</span></label>
              <div class="input-wrapper">
                <input
                  v-model="validForm.email"
                  type="email"
                  placeholder="如：developer@oat.ink"
                  :class="{ 'has-error': formErrors.email }"
                />
              </div>
              <span v-if="formErrors.email" class="err-msg">⚠️ {{ formErrors.email }}</span>
            </div>

            <!-- 手机号 -->
            <div class="form-field">
              <label>手机号码 <span class="req">*</span></label>
              <div class="input-wrapper">
                <input
                  v-model="validForm.phone"
                  type="tel"
                  placeholder="如：13812345678"
                  :class="{ 'has-error': formErrors.phone }"
                />
              </div>
              <span v-if="formErrors.phone" class="err-msg">⚠️ {{ formErrors.phone }}</span>
            </div>

            <!-- 年月选择 -->
            <div class="form-field">
              <label>生效年月 (YYYY-MM) <span class="req">*</span></label>
              <div class="input-wrapper">
                <input
                  v-model="validForm.yearMonth"
                  type="month"
                  :class="{ 'has-error': formErrors.yearMonth }"
                />
              </div>
              <span v-if="formErrors.yearMonth" class="err-msg">⚠️ {{ formErrors.yearMonth }}</span>
            </div>

            <!-- 角色权限 -->
            <div class="form-field">
              <label>权限角色</label>
              <div class="input-wrapper">
                <select v-model="validForm.role">
                  <option value="developer">👨‍💻 开发者 (Developer)</option>
                  <option value="designer">🎨 UI 设计师 (Designer)</option>
                  <option value="admin">👑 运维管理员 (Admin)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="oat-btn secondary" @click="validForm.username=''; validForm.email=''; validForm.phone=''">
              重置表单
            </button>
            <button class="oat-btn primary" @click="validateForm">
              ✅ 验证并提交表单
            </button>
          </div>
        </div>
      </section>

      <!-- 模块 3: Oat 树形目录与层级组件 (Tree View) -->
      <section class="studio-section oat-tree-section">
        <div class="section-title">
          <span class="icon">🌳</span>
          <h2>3. Oat UI 极简树形目录组件 (Tree View)</h2>
          <span class="sub-tag">支持节点展开/折叠、高亮选中与动态追加节点</span>
        </div>

        <div class="tree-card">
          <!-- 树形展示栏 -->
          <div class="tree-sidebar">
            <div v-for="node in treeData" :key="node.id" class="tree-node">
              <div
                class="node-label"
                :class="{ selected: selectedTreeNode?.id === node.id }"
                @click="selectTreeNode(node)"
              >
                <span class="toggle-icon" @click.stop="toggleTreeNode(node)">
                  {{ node.children ? (node.expanded ? '▼' : '▶') : '•' }}
                </span>
                <span class="node-icon">{{ node.icon }}</span>
                <span>{{ node.label }}</span>
              </div>

              <!-- 子节点递归渲染 -->
              <div v-if="node.children && node.expanded" class="node-children">
                <div v-for="c1 in node.children" :key="c1.id" class="tree-node">
                  <div
                    class="node-label"
                    :class="{ selected: selectedTreeNode?.id === c1.id }"
                    @click="selectTreeNode(c1)"
                  >
                    <span class="toggle-icon" @click.stop="toggleTreeNode(c1)">
                      {{ c1.children ? (c1.expanded ? '▼' : '▶') : '•' }}
                    </span>
                    <span class="node-icon">{{ c1.icon }}</span>
                    <span>{{ c1.label }}</span>
                  </div>

                  <div v-if="c1.children && c1.expanded" class="node-children">
                    <div v-for="c2 in c1.children" :key="c2.id" class="tree-node">
                      <div
                        class="node-label"
                        :class="{ selected: selectedTreeNode?.id === c2.id }"
                        @click="selectTreeNode(c2)"
                      >
                        <span class="toggle-icon">•</span>
                        <span class="node-icon">{{ c2.icon }}</span>
                        <span>{{ c2.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 当前选中节点信息与操作区 -->
          <div class="tree-detail">
            <div class="detail-box">
              <h4>当前选中节点信息</h4>
              <p>节点 ID: <code>{{ selectedTreeNode?.id || '未选中' }}</code></p>
              <p>节点名称: <strong>{{ selectedTreeNode?.label || '未选中' }}</strong></p>
            </div>

            <div class="tree-actions" style="display: flex; gap: 10px;">
              <button class="oat-btn primary" :disabled="!selectedTreeNode" @click="addChildNode">
                + 在该节点下追加子节点
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 模块 4: 年月与日期范围选择器 (Date & Month Picker) -->
      <section class="studio-section oat-datepicker-section">
        <div class="section-title">
          <span class="icon">📅</span>
          <h2>4. Oat UI 年月选择器与日期范围套件</h2>
          <span class="sub-tag">包含标准年月选择 (YYYY-MM)、日期区间与快捷按键</span>
        </div>

        <div class="picker-grid">
          <!-- 1. 年月选择器 -->
          <div class="picker-card">
            <h4>年月选择器 (Year-Month)</h4>
            <p>选择月份 (如 2026-07)，常用于月度结算与月度指标统计。</p>
            <div class="picker-input-box">
              <input v-model="selectedMonth" type="month" />
            </div>
            <div class="quick-capsules">
              <span class="capsule" @click="selectedMonth = '2026-07'">本月 (2026-07)</span>
              <span class="capsule" @click="selectedMonth = '2026-06'">上月 (2026-06)</span>
            </div>
          </div>

          <!-- 2. 日期范围选择器 -->
          <div class="picker-card">
            <h4>日期范围选择器 (Date Range)</h4>
            <p>选择起始日期与截止日期，进行区间数据检索。</p>
            <div class="picker-input-box">
              <input v-model="startDate" type="date" />
              <span style="align-self: center;">至</span>
              <input v-model="endDate" type="date" />
            </div>
            <div class="quick-capsules">
              <span class="capsule" @click="startDate = '2026-07-24'; endDate = '2026-07-24'">今天</span>
              <span class="capsule" @click="startDate = '2026-07-17'; endDate = '2026-07-24'">近 7 天</span>
              <span class="capsule" @click="startDate = '2026-07-01'; endDate = '2026-07-31'">本月全月</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 模块 5: 省市区级联与下拉组件 (Cascader & Select) -->
      <section class="studio-section oat-select-section">
        <div class="section-title">
          <span class="icon">🔻</span>
          <h2>5. Oat UI 省市区级联下拉选择器</h2>
          <span class="sub-tag">支持一级省份与二级城市联动响应</span>
        </div>

        <div class="select-grid">
          <div class="select-card">
            <h4>省份-城市两级级联选择器</h4>
            <div class="cascader-box">
              <select v-model="selectedProvince" @change="handleProvinceChange">
                <option v-for="prov in provinceList" :key="prov" :value="prov">{{ prov }}</option>
              </select>

              <select v-model="selectedCity">
                <option v-for="c in (cityMap[selectedProvince] || [])" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <p style="font-size: 0.85rem; color: #64748b; margin-top: 12px;">
              当前已选择: <strong>{{ selectedProvince }} - {{ selectedCity }}</strong>
            </p>
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

    <!-- 通用弹窗挂载 -->
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
          <div class="notif-title">🎉 Oat UI 400 个范例库升级</div>
          <div class="notif-desc">包含双击编辑表格、实时校验表单、树形目录与年月选择器。</div>
          <div class="notif-time">今天 10:50</div>
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
