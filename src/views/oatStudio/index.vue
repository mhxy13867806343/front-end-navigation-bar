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

// Element Plus 大类 Tab 切换
const EL_TAB_OPTIONS = [
  { key: 'all', label: '🌟 全部 5 大类组件' },
  { key: 'basic', label: '🧱 基础组件 (Basic)' },
  { key: 'form', label: '📝 表单组件 (Form)' },
  { key: 'data', label: '📊 数据展示 (Data)' },
  { key: 'navigation', label: '🧭 导航组件 (Navigation)' },
  { key: 'feedback', label: '💬 反馈组件 (Feedback)' }
] as const

const activeElTab = ref<typeof EL_TAB_OPTIONS[number]['key']>('all')

// ------------------------------------------------------------------
// 1. 生成 400 个 Oat UI 范例数据集 (对照 Element Plus 组件大纲)
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
      names: ['Oat Table (双击编辑数据表格)', 'Oat Table V2 (虚拟滚动千行表格)', 'Oat Table (展开行与嵌套表格)', 'Oat Table (树形级联表格)', 'Oat Table (状态徽章响应式表格)', 'Oat Table (跨页分页与勾选表格)', 'Oat Table (固定首尾列高阶表格)', 'Oat Table (自定义列头过滤表格)'],
      descs: ['双击单元格行内编辑与即时保存', '虚拟 DOM 节点复用与千行流畅渲染', '点击行展开关联明细数据', '多层级父子折叠关系表格', '内嵌 .oat-badge 状态与时间指示', '勾选复选框与批量导出操作栏', '固定左侧序号与右侧操作列', '包含输入框与下拉筛选的自定义表头'],
      sizes: ['1.2 KB', '3.4 KB', '2.1 KB', '2.8 KB', '1.1 KB', '1.8 KB', '2.6 KB', '1.9 KB']
    },
    {
      cat: '弹窗与抽屉' as const,
      names: ['Oat Dialog / Modal (更新提示弹窗)', 'Oat Drawer (右侧滑出抽屉)', 'Oat Popconfirm (气泡确认框)', 'Oat Message (全局 Toast 提示)', 'Oat MessageBox (确认对话框)', 'Oat Notification (悬浮通知中心)', 'Oat Popover (气泡弹出框)', 'Oat Tooltip (文字提示浮层)'],
      descs: ['包含 Release Notes Timeline 与“不再自动提醒”复选框', '右侧 400px 宽度 smooth slide-in 滑出面板', '带高亮图标与双选项气泡提示框', '轻量级自动消失的全局 Toast 弹框', '带 Warning/Danger/Success 状态模态框', '右上角通知堆叠浮层', '包含自定义 HTML 内容的气泡弹出框', '悬浮于按键或图标上的文本说明框'],
      sizes: ['2.4 KB', '1.7 KB', '0.8 KB', '0.6 KB', '1.0 KB', '1.5 KB', '1.2 KB', '0.5 KB']
    },
    {
      cat: '表单控件' as const,
      names: ['Oat Form Validation (正则表单校验)', 'Oat DatePicker (年月 YYYY-MM 选择器)', 'Oat DateRangePicker (日期范围选择器)', 'Oat Cascader (省市区级联选择器)', 'Oat Transfer (穿梭框)', 'Oat Rate (5 星评分控件)', 'Oat ColorPicker (颜色选择器)', 'Oat Slider & Range (范围滑块)'],
      descs: ['包含邮箱/手机号/年月正则校验与错误提示', '支持原生 YYYY-MM 月度切换与快捷胶囊', '支持起始与截止日期选择', '省份与城市二级联动选择框', '左右列表项目穿梭拖拽', '支持单星与半星交互', '原生 Color Input 拾色器', '带有 Tail 充能填充的数值滑块'],
      sizes: ['2.1 KB', '1.3 KB', '1.6 KB', '1.6 KB', '2.4 KB', '0.9 KB', '0.7 KB', '0.8 KB']
    },
    {
      cat: '数据展示' as const,
      names: ['Oat Tree (极简树形目录控件)', 'Oat Carousel (走马灯轮播组件)', 'Oat Skeleton (骨架屏占位动画)', 'Oat Descriptions (描述列表组件)', 'Oat Statistic (统计数值组件)', 'Oat Timeline (时间线组件)', 'Oat Avatar & Badge (头像与徽章)', 'Oat Progress & Meter (进度与仪表条)'],
      descs: ['包含展开折叠、添加子节点与选中提示树形图', '自动播放与手动圆点指示卡片轮播', '带有 Shimmer 扫光加载动画的骨架块', '用于展示键值对 KV 信息的详情列表', '包含大字指标与趋势图标', '垂直里程碑节点时间线', '带数字和点的圆角头像与提示徽章', '展示 0.0 至 1.0 的数据占比与阀值色'],
      sizes: ['1.8 KB', '1.9 KB', '1.1 KB', '1.4 KB', '0.9 KB', '1.2 KB', '0.6 KB', '0.8 KB']
    },
    {
      cat: '布局排版' as const,
      names: ['Oat Segmented (分段控制器)', 'Oat Breadcrumb (面包屑导航)', 'Oat Steps (步骤条组件)', 'Oat PageHeader (页头栏组件)', 'Oat Anchor (锚点定位组件)', 'Oat Grid (响应式栅格系统)', 'Oat Flex (两栏侧边栏布局)', 'Oat Space (垂直与水平间距)'],
      descs: ['分段式单选切块控制器', '带有斜杠分割的路由层级导航栏', '展示多阶段工作流与当前步骤亮起', '包含返回按键与标题摘要的页头', '滚动页面自动高亮对应章节锚点', '使用 CSS Grid 自适应 mobile/desktop', '固定侧边导航与右侧内容区自适应滚动', '提供 8px/16px/24px 统一边距工具'],
      sizes: ['1.0 KB', '0.8 KB', '1.5 KB', '1.2 KB', '1.4 KB', '1.5 KB', '2.0 KB', '0.6 KB']
    },
    {
      cat: '高级应用' as const,
      names: ['Oat Dashboard (完整控制台页面)', 'Oat API Docs (极简 API 文档中心)', 'Oat Workspace (个人工作台)', 'Oat Log Monitor (实时运维日志流)', 'Oat E-Commerce (小米商城查询模板)', 'Oat Game Hub (游戏大厅卡片列表)', 'Oat RBAC (权限控制与角色管理)', 'Oat AI Chat (AI 对话聊天窗口)'],
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
// 2. 表格与双击编辑 State
// ------------------------------------------------------------------
const activeCat = ref<typeof CATEGORIES[number]>('全部')
const searchQuery = ref<string>('')
const sortKey = ref<'id' | 'name' | 'category' | 'status' | 'size'>('id')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref<number>(1)
const pageSize = ref<number>(20)

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
// 3. 各 Element Plus 交互组件 State
// ------------------------------------------------------------------

// 评分 (Rate)
const rateScore = ref<number>(4)

// 颜色选择 (ColorPicker)
const pickColor = ref<string>('#2563eb')

// 穿梭框 (Transfer)
const transferLeft = ref<string[]>(['Vue 3', 'TypeScript', 'Vite', 'Pinia'])
const transferRight = ref<string[]>(['Oat UI', 'Element Plus'])

const moveToRight = (item: string) => {
  transferLeft.value = transferLeft.value.filter((x) => x !== item)
  transferRight.value.push(item)
}

const moveToLeft = (item: string) => {
  transferRight.value = transferRight.value.filter((x) => x !== item)
  transferLeft.value.push(item)
}

// 走马灯 (Carousel)
const carouselIndex = ref<number>(0)
const carouselSlides = ['Oat UI 极简设计', '支持 Element Plus 全套组件', '0 依赖高可用性能']

// 分段控制器 (Segmented)
const activeSegment = ref<string>('Daily')

// 开关 (Switch) & 数字框 (InputNumber)
const switchVal = ref<boolean>(true)
const inputNum = ref<number>(10)

// 树形节点 (Tree View)
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
          { id: '1-1-3', label: 'oatUi/OatConfirmModal.vue', icon: '📄' }
        ]
      },
      {
        id: '1-2',
        label: 'views 视图目录',
        icon: '📁',
        expanded: true,
        children: [
          { id: '1-2-1', label: 'oatStudio/index.vue (Element Plus Suite)', icon: '🚀' }
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

// 年月/日期 State
const selectedMonth = ref<string>('2026-07')
const startDate = ref<string>('2026-07-01')
const endDate = ref<string>('2026-07-24')

// 省市区级联
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

// 通用弹窗与复制
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

const triggerToast = (type: 'success' | 'info' | 'warning' | 'error', msg: string) => {
  if (type === 'success') ElMessage.success(msg)
  else if (type === 'warning') ElMessage.warning(msg)
  else if (type === 'error') ElMessage.error(msg)
  else ElMessage.info(msg)
}
</script>

<template>
  <div class="oat-studio-page">
    <!-- Header 头部栏 -->
    <header class="studio-header">
      <div class="header-content">
        <div class="tag-badge">🌾 Oat.ink Interactive Studio</div>
        <h1>Element Plus 全套组件 (All Components) 的 Oat UI 实现</h1>
        <p>
          参照 <a href="https://element-plus.org/zh-CN/component/overview" target="_blank">Element Plus 官方组件总览 (Overview)</a>，使用 Oat UI 极简设计全数打造，涵盖<strong>Basic 基础组件</strong>、<strong>Form 表单与校验</strong>、<strong>Data 数据展示与 400 表格 (双击修改)</strong>、<strong>Navigation 导航</strong>与<strong>Feedback 反馈提示</strong>。
        </p>

        <!-- 数据统计速览栏 -->
        <div class="stats-summary">
          <div class="stat-item">
            <span class="num">5 大类</span>
            <span class="lbl">Element Plus 组件全覆盖</span>
          </div>
          <div class="stat-item">
            <span class="num">400 个</span>
            <span class="lbl">双击修改表格范例</span>
          </div>
          <div class="stat-item">
            <span class="num">表单与年月</span>
            <span class="lbl">Validation & MonthPicker</span>
          </div>
          <div class="stat-item">
            <span class="num">Tree & Drawer</span>
            <span class="lbl">树形控件与滑出抽屉</span>
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
      <!-- 顶级分类导航 Tab 切换 -->
      <nav class="el-category-nav">
        <button
          v-for="tab in EL_TAB_OPTIONS"
          :key="tab.key"
          class="el-tab-btn"
          :class="{ active: activeElTab === tab.key }"
          @click="activeElTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <!-- 大类 1: Basic 基础组件 -->
      <section v-if="activeElTab === 'all' || activeElTab === 'basic'" class="studio-section">
        <div class="section-title">
          <span class="icon">🧱</span>
          <h2>1. Basic 基础组件 (Button, Border, Icon, Layout, Link, Space, Text, Scrollbar)</h2>
        </div>

        <div class="el-basic-grid">
          <!-- Button 按钮 -->
          <div class="comp-box">
            <h4>Button 按钮 <span class="el-name">&lt;el-button&gt;</span></h4>
            <div class="demo-row">
              <button class="oat-btn primary">Primary</button>
              <button class="oat-btn secondary">Secondary</button>
              <button class="oat-btn outline">Outline</button>
              <button class="oat-btn danger">Danger</button>
              <button class="oat-btn primary small">Small</button>
            </div>
          </div>

          <!-- Segmented 分段控制器 -->
          <div class="comp-box">
            <h4>Segmented 分段控制器 <span class="el-name">&lt;el-segmented&gt;</span></h4>
            <div class="demo-row">
              <button
                v-for="seg in ['Daily', 'Weekly', 'Monthly']"
                :key="seg"
                class="oat-btn"
                :class="activeSegment === seg ? 'primary' : 'secondary'"
                @click="activeSegment = seg"
              >
                {{ seg }}
              </button>
            </div>
          </div>

          <!-- Link & Text 文本与链接 -->
          <div class="comp-box">
            <h4>Link & Text 链接与文本 <span class="el-name">&lt;el-link&gt; / &lt;el-text&gt;</span></h4>
            <div class="demo-row">
              <a href="javascript:void(0)" style="color: #2563eb; font-weight: 600;">默认链接</a>
              <span class="oat-badge blue">Primary Text</span>
              <span class="oat-badge green">Success Text</span>
              <span class="oat-badge orange">Warning Text</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 大类 2: Form 表单组件 -->
      <section v-if="activeElTab === 'all' || activeElTab === 'form'" class="studio-section">
        <div class="section-title">
          <span class="icon">📝</span>
          <h2>2. Form 表单组件 (Input, Select, Rate, ColorPicker, DatePicker, Transfer, Switch)</h2>
        </div>

        <div class="el-form-grid">
          <!-- Switch & InputNumber -->
          <div class="form-box">
            <h4>Switch 开关 & InputNumber 数字输入框</h4>
            <div class="field-row" style="flex-direction: row; align-items: center; justify-content: space-between;">
              <label>启用功能开关:</label>
              <button
                class="oat-btn"
                :class="switchVal ? 'primary' : 'secondary'"
                @click="switchVal = !switchVal"
              >
                {{ switchVal ? 'ON (开启)' : 'OFF (关闭)' }}
              </button>
            </div>

            <div class="field-row">
              <label>数字输入框 (InputNumber):</label>
              <div style="display: flex; gap: 8px;">
                <button class="oat-btn secondary" @click="inputNum--">-</button>
                <input v-model="inputNum" type="number" style="width: 80px; text-align: center;" />
                <button class="oat-btn secondary" @click="inputNum++">+</button>
              </div>
            </div>
          </div>

          <!-- Rate 评分 & ColorPicker 拾色器 -->
          <div class="form-box">
            <h4>Rate 评分 & ColorPicker 拾色器</h4>
            <div class="field-row">
              <label>五星评分 (Rate):</label>
              <div class="rate-stars">
                <span
                  v-for="s in 5"
                  :key="s"
                  class="star"
                  :class="{ active: s <= rateScore }"
                  @click="rateScore = s"
                >
                  ★
                </span>
                <span style="font-size: 0.85rem; color: #64748b; margin-left: 8px;">{{ rateScore }} 分</span>
              </div>
            </div>

            <div class="field-row">
              <label>颜色选择器 (ColorPicker):</label>
              <div style="display: flex; align-items: center; gap: 10px;">
                <input v-model="pickColor" type="color" style="width: 44px; height: 36px; cursor: pointer;" />
                <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 6px;">{{ pickColor }}</code>
              </div>
            </div>
          </div>

          <!-- 年月 DatePicker & 省市区 Cascader -->
          <div class="form-box">
            <h4>DatePicker (年月/日期) & Cascader 级联选择器</h4>
            <div class="field-row">
              <label>年月选择 (YYYY-MM):</label>
              <input v-model="selectedMonth" type="month" />
            </div>

            <div class="field-row">
              <label>省市区级联选择:</label>
              <div style="display: flex; gap: 8px;">
                <select v-model="selectedProvince" @change="handleProvinceChange">
                  <option v-for="p in provinceList" :key="p" :value="p">{{ p }}</option>
                </select>
                <select v-model="selectedCity">
                  <option v-for="c in (cityMap[selectedProvince] || [])" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Transfer 穿梭框 -->
          <div class="form-box" style="grid-column: 1 / -1;">
            <h4>Transfer 穿梭框 <span class="el-name">&lt;el-transfer&gt;</span></h4>
            <div class="transfer-wrapper">
              <div class="transfer-list">
                <div style="font-weight: 700; margin-bottom: 6px; font-size: 0.85rem;">待选列表 ({{ transferLeft.length }})</div>
                <div v-for="item in transferLeft" :key="item" class="t-item" @click="moveToRight(item)">
                  {{ item }} ➔
                </div>
              </div>

              <div style="font-weight: 700; color: #94a3b8;">双向穿梭</div>

              <div class="transfer-list">
                <div style="font-weight: 700; margin-bottom: 6px; font-size: 0.85rem;">已选列表 ({{ transferRight.length }})</div>
                <div v-for="item in transferRight" :key="item" class="t-item" @click="moveToLeft(item)">
                  ⬅ {{ item }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 大类 3: Data 数据展示与 400 个表格 (双击修改) -->
      <section v-if="activeElTab === 'all' || activeElTab === 'data'" class="studio-section">
        <div class="section-title">
          <span class="icon">📊</span>
          <h2>3. Data 数据展示 (Table, Tree, Carousel, Skeleton, Timeline, Card, Tag)</h2>
        </div>

        <!-- 400 个范例大表格 (.oat-table) -->
        <div class="oat-table-section">
          <div class="table-card">
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

            <!-- 原生 Oat 表格展示区 (双击可修改) -->
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

            <!-- 分页栏 -->
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
        </div>

        <!-- 其它数据展示控件 (Carousel, Skeleton, Tree) -->
        <div class="el-data-grid">
          <!-- Carousel 走马灯 -->
          <div class="data-box">
            <h4>Carousel 走马灯 <span class="el-name">&lt;el-carousel&gt;</span></h4>
            <div class="oat-carousel">
              <div class="c-slide">{{ carouselSlides[carouselIndex] }}</div>
              <div class="c-nav">
                <span
                  v-for="(_, idx) in carouselSlides"
                  :key="idx"
                  class="dot"
                  :class="{ active: carouselIndex === idx }"
                  @click="carouselIndex = idx"
                ></span>
              </div>
            </div>
          </div>

          <!-- Skeleton 骨架屏 -->
          <div class="data-box">
            <h4>Skeleton 骨架屏 <span class="el-name">&lt;el-skeleton&gt;</span></h4>
            <div class="oat-skeleton">
              <div class="sk-bar short"></div>
              <div class="sk-bar medium"></div>
              <div class="sk-bar full"></div>
            </div>
          </div>

          <!-- Tree 树形控件 -->
          <div class="data-box">
            <h4>Tree 树形控件 <span class="el-name">&lt;el-tree&gt;</span></h4>
            <div style="font-size: 0.85rem; color: #334155;">
              <div v-for="n in treeData" :key="n.id">
                <span>{{ n.icon }} {{ n.label }}</span>
                <div style="padding-left: 16px; margin-top: 4px;">
                  <div v-for="c in (n.children || [])" :key="c.id" style="margin-bottom: 2px;">
                    <span>├─ {{ c.icon }} {{ c.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 大类 4 & 5: Navigation 导航与 Feedback 反馈组件 -->
      <section v-if="activeElTab === 'all' || activeElTab === 'navigation' || activeElTab === 'feedback'" class="studio-section">
        <div class="section-title">
          <span class="icon">💬</span>
          <h2>4 & 5. Navigation 导航与 Feedback 反馈组件 (Alert, Drawer, Dialog, Message, Steps, Tabs)</h2>
        </div>

        <div class="el-feedback-grid">
          <!-- Alert 提示框 -->
          <div class="fb-box">
            <h4>Alert 提示框 <span class="el-name">&lt;el-alert&gt;</span></h4>
            <div class="alert-item success">✅ Success Alert：操作成功完成！</div>
            <div class="alert-item warning">⚠️ Warning Alert：请注意检查参数格式！</div>
            <div class="alert-item danger">🚫 Error Alert：网络异常提交失败！</div>
            <div class="alert-item info">ℹ️ Info Alert：提示系统最新升级公告。</div>
          </div>

          <!-- Message & MessageBox 消息与对话框 -->
          <div class="fb-box">
            <h4>Message 消息 Toast 与 Drawer 抽屉</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button class="oat-btn primary" @click="triggerToast('success', '触发 Element Plus 成功提示 Toast！')">
                🎉 触发 Success Toast
              </button>
              <button class="oat-btn secondary" @click="triggerToast('warning', '触发 Element Plus 警告提示 Toast！')">
                ⚠️ 触发 Warning Toast
              </button>
              <button class="oat-btn secondary" @click="drawerOpen = true">
                📥 滑出右侧 Drawer 抽屉
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

    <!-- 通用弹窗挂载 -->
    <OatUpdateModal v-model="updateModalOpen" @confirm="ElMessage.success('已开启新功能体验！')" />

    <OatCreatePageModal v-model="createPageModalOpen" />

    <OatConfirmModal
      v-model="confirmModalOpen"
      :type="confirmType"
      :title="confirmTitle"
      :message="confirmMsg"
    />

    <OatDrawer v-model="drawerOpen" title="🔔 全局系统通知" subtitle="Oat UI 极简抽屉">
      <div class="notification-list" style="display: flex; flex-direction: column; gap: 10px;">
        <div style="padding: 10px; background: #f8fafc; border-radius: 8px;">
          <strong>🎉 Element Plus 组件全套上线</strong>
          <p style="margin: 4px 0 0; font-size: 0.8rem; color: #64748b;">
            包含 Basic 基础、Form 表单、Data 数据 400 表格与 Feedback 反馈全套控件。
          </p>
        </div>
      </div>
    </OatDrawer>
  </div>
</template>

<style scoped lang="scss">
@import './css/index.scss';
</style>
