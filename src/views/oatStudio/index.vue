<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import OatUpdateModal from '@/components/oatUi/OatUpdateModal.vue'
import OatCreatePageModal from '@/components/oatUi/OatCreatePageModal.vue'
import OatConfirmModal from '@/components/oatUi/OatConfirmModal.vue'
import OatDrawer from '@/components/oatUi/OatDrawer.vue'
import { registerOatUiComponents } from '@/components/oatUi'

registerOatUiComponents()
const router = useRouter()

// ------------------------------------------------------------------
// 1. Oat UI 官方 26 原生组件 + Element Plus 64 目录数据
// ------------------------------------------------------------------
interface ElComponentGroup {
  groupName: string
  isOatOfficial?: boolean
  items: { name: string; nameCn: string; ver?: string; key: string }[]
}

const EL_SIDEBAR_GROUPS: ElComponentGroup[] = [
  {
    groupName: '🌾 Oat UI 官方 26 原生组件 (https://oat.ink/)',
    isOatOfficial: true,
    items: [
      { name: 'Typography', nameCn: '排版', key: 'oat-typography' },
      { name: 'Accordion', nameCn: '折叠面板', key: 'oat-accordion' },
      { name: 'Alert', nameCn: '提示框', key: 'oat-alert' },
      { name: 'Avatar', nameCn: '头像', key: 'oat-avatar' },
      { name: 'Badge', nameCn: '徽章', key: 'oat-badge' },
      { name: 'Breadcrumb', nameCn: '面包屑', key: 'oat-breadcrumb' },
      { name: 'Button', nameCn: '按钮', key: 'oat-button' },
      { name: 'Card', nameCn: '卡片', key: 'oat-card' },
      { name: 'Dialog', nameCn: '对话框', key: 'oat-dialog' },
      { name: 'Dropdown', nameCn: '下拉菜单', ver: 'WC', key: 'oat-dropdown' },
      { name: 'TagInput', nameCn: '标签输入框', ver: 'WC', key: 'oat-taginput' },
      { name: 'Form', nameCn: '表单元素', key: 'oat-form' },
      { name: 'Upload', nameCn: '文件上传', ver: 'WC', key: 'oat-upload' },
      { name: 'Meter', nameCn: '计量器', key: 'oat-meter' },
      { name: 'Pagination', nameCn: '分页', key: 'oat-pagination' },
      { name: 'Progress', nameCn: '进度条', key: 'oat-progress' },
      { name: 'Spinner', nameCn: '加载圈', key: 'oat-spinner' },
      { name: 'Skeleton', nameCn: '骨架屏', key: 'oat-skeleton' },
      { name: 'Sidebar', nameCn: '侧边栏', key: 'oat-sidebar' },
      { name: 'Switch', nameCn: '开关', key: 'oat-switch' },
      { name: 'Table', nameCn: '表格', key: 'oat-table' },
      { name: 'Tabs', nameCn: '标签页', ver: 'WC', key: 'oat-tabs' },
      { name: 'Tooltip', nameCn: '气泡提示', key: 'oat-tooltip' },
      { name: 'Toast', nameCn: '轻提示', key: 'oat-toast' },
      { name: 'Grid', nameCn: '网格布局', key: 'oat-grid' },
      { name: 'Utilities', nameCn: '工具类', key: 'oat-utilities' }
    ]
  },
  {
    groupName: 'Basic 基础组件',
    items: [
      { name: 'Icon', nameCn: '图标', key: 'icon' },
      { name: 'Layout', nameCn: '布局', key: 'layout' },
      { name: 'Link', nameCn: '链接', key: 'link' },
      { name: 'Text', nameCn: '文本', ver: '2.3.0', key: 'text' },
      { name: 'Scrollbar', nameCn: '滚动条', key: 'scrollbar' },
      { name: 'Space', nameCn: '间距', key: 'space' },
      { name: 'Splitter', nameCn: '分隔面板', ver: '2.10.0', key: 'splitter' },
      { name: 'Typography', nameCn: '排版', key: 'typography' }
    ]
  },
  {
    groupName: 'Configuration 配置组件',
    items: [
      { name: 'Config Provider', nameCn: '全局配置', key: 'config-provider' }
    ]
  },
  {
    groupName: 'Form 表单组件',
    items: [
      { name: 'Autocomplete', nameCn: '自动补全输入框', key: 'autocomplete' },
      { name: 'Cascader', nameCn: '级联选择器', key: 'cascader' },
      { name: 'Checkbox', nameCn: '多选框', key: 'checkbox' },
      { name: 'ColorPickerPanel', nameCn: '颜色选择器面板', ver: '2.11.0', key: 'color-picker-panel' },
      { name: 'Color Picker', nameCn: '颜色选择器', key: 'color-picker' },
      { name: 'DatePickerPanel', nameCn: '日期选择器面板', ver: '2.11.0', key: 'date-picker-panel' },
      { name: 'Date Picker', nameCn: '日期选择器', key: 'date-picker' },
      { name: 'DateTime Picker', nameCn: '日期时间选择器', key: 'date-time-picker' },
      { name: 'Form', nameCn: '表单组件', key: 'form' },
      { name: 'Input', nameCn: '输入框', key: 'input' },
      { name: 'Input Number', nameCn: '数字输入框', key: 'input-number' },
      { name: 'Input Tag', nameCn: '标签输入框', ver: '2.9.0', key: 'input-tag' },
      { name: 'Input OTP', nameCn: '验证码输入框', ver: '2.14.0', key: 'input-otp' },
      { name: 'Mention', nameCn: '提及', ver: '2.8.0', key: 'mention' },
      { name: 'Radio', nameCn: '单选框', key: 'radio' },
      { name: 'Rate', nameCn: '评分', key: 'rate' },
      { name: 'Select', nameCn: '选择器', key: 'select' },
      { name: 'Virtualized Select', nameCn: '虚拟化选择器', key: 'virtualized-select' },
      { name: 'Slider', nameCn: '滑块', key: 'slider' },
      { name: 'Switch', nameCn: '开关', key: 'switch' },
      { name: 'Time Picker', nameCn: '时间选择器', key: 'time-picker' },
      { name: 'Time Select', nameCn: '时间选择', key: 'time-select' },
      { name: 'Transfer', nameCn: '穿梭框', key: 'transfer' },
      { name: 'TreeSelect', nameCn: '树形选择', ver: '2.1.8', key: 'tree-select' },
      { name: 'Upload', nameCn: '上传器', key: 'upload' }
    ]
  },
  {
    groupName: 'Data 数据展示',
    items: [
      { name: 'Avatar', nameCn: '头像', key: 'avatar' },
      { name: 'Badge', nameCn: '徽章', key: 'badge' },
      { name: 'Calendar', nameCn: '日历', key: 'calendar' },
      { name: 'Card', nameCn: '卡片', key: 'card' },
      { name: 'Carousel', nameCn: '走马灯', key: 'carousel' },
      { name: 'Collapse', nameCn: '折叠面板', key: 'collapse' },
      { name: 'Descriptions', nameCn: '描述列表', key: 'descriptions' },
      { name: 'Empty', nameCn: '空状态', key: 'empty' },
      { name: 'Image', nameCn: '图片', key: 'image' },
      { name: 'Infinite Scroll', nameCn: '无限滚动', key: 'infinite-scroll' },
      { name: 'Table', nameCn: '表格', key: 'table' },
      { name: 'Virtualized Table', nameCn: '虚拟化表格', ver: '2.2.0', key: 'virtualized-table' },
      { name: 'Tag', nameCn: '标签', key: 'tag' },
      { name: 'Timeline', nameCn: '时间线', key: 'timeline' },
      { name: 'Tour', nameCn: '漫游式引导', ver: '2.5.0', key: 'tour' },
      { name: 'Tree', nameCn: '树形控件', key: 'tree' },
      { name: 'Virtualized Tree', nameCn: '虚拟化树形控件', key: 'virtualized-tree' },
      { name: 'Statistic', nameCn: '统计组件', ver: '2.2.30', key: 'statistic' },
      { name: 'Segmented', nameCn: '分段控制器', ver: '2.7.0', key: 'segmented' }
    ]
  },
  {
    groupName: 'Navigation 导航',
    items: [
      { name: 'Affix', nameCn: '固钉', key: 'affix' },
      { name: 'Anchor', nameCn: '锚点', ver: '2.6.0', key: 'anchor' },
      { name: 'Backtop', nameCn: '回到顶部', key: 'backtop' },
      { name: 'Breadcrumb', nameCn: '面包屑', key: 'breadcrumb' },
      { name: 'Dropdown', nameCn: '下拉菜单', key: 'dropdown' },
      { name: 'Menu', nameCn: '菜单', key: 'menu' },
      { name: 'Page Header', nameCn: '页头', key: 'page-header' },
      { name: 'Steps', nameCn: '步骤条', key: 'steps' },
      { name: 'Tabs', nameCn: '标签页', key: 'tabs' }
    ]
  },
  {
    groupName: 'Feedback 反馈组件',
    items: [
      { name: 'Alert', nameCn: '提示', key: 'alert' },
      { name: 'Dialog', nameCn: '对话框', key: 'dialog' },
      { name: 'Drawer', nameCn: '抽屉', key: 'drawer' },
      { name: 'Loading', nameCn: '加载', key: 'loading' },
      { name: 'Message', nameCn: '消息提示', key: 'message' },
      { name: 'Message Box', nameCn: '消息弹出框', key: 'message-box' },
      { name: 'Notification', nameCn: '通知', key: 'notification' },
      { name: 'Popconfirm', nameCn: '气泡确认框', key: 'popconfirm' },
      { name: 'Popover', nameCn: '弹出框', key: 'popover' },
      { name: 'Tooltip', nameCn: '文字提示', key: 'tooltip' }
    ]
  },
  {
    groupName: 'Others 其他组件',
    items: [
      { name: 'Divider', nameCn: '分割线', key: 'divider' },
      { name: 'Watermark', nameCn: '水印', ver: '2.4.0', key: 'watermark' }
    ]
  }
]

const activeCompKey = ref<string>('select')

// ------------------------------------------------------------------
// 2. 交互 State
// ------------------------------------------------------------------
const cardLikeCount = ref<number>(128)

// Select 选择器 State (彻底解决用户截图)
const selectVal = ref<string>('oat-ui')
const selectOptions = [
  { label: '🌾 Oat UI 极简 0 依赖库', value: 'oat-ui' },
  { label: '💚 Element Plus Vue 3 组件套件', value: 'element-plus' },
  { label: '🟢 Naive UI 声明式组件库', value: 'naive-ui' },
  { label: '⚡ Vite 5 极速构建框架', value: 'vite-5' }
]

// Cascader
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
  ElMessage.success(`级联联动: ${selectedProvince.value} -> ${selectedCity.value}`)
}

// Checkbox
const checkedList = ref<string[]>(['Vue 3', 'TypeScript', 'Oat UI'])
const allCheckOptions = ['Vue 3', 'TypeScript', 'Oat UI', 'Element Plus', 'Vite 5']

const toggleCheckAll = () => {
  if (checkedList.value.length === allCheckOptions.length) {
    checkedList.value = []
  } else {
    checkedList.value = [...allCheckOptions]
  }
}

// Transfer
const transferLeft = ref<string[]>(['Vue 3 开发', 'TypeScript 5', 'Vite 构建工具', 'Pinia 状态管理', 'CSS SCSS 模块'])
const transferRight = ref<string[]>(['Oat UI 基础库', 'Element Plus 组件套件'])

const moveToRight = (item: string) => {
  transferLeft.value = transferLeft.value.filter((x) => x !== item)
  transferRight.value.push(item)
  ElMessage.success(`已将《${item}》移入已选列表`)
}

const moveToLeft = (item: string) => {
  transferRight.value = transferRight.value.filter((x) => x !== item)
  transferLeft.value.push(item)
  ElMessage.info(`已将《${item}》移回待选列表`)
}

// Slider & Form & Inputs
const sliderVal = ref<number>(45)
const radioVal = ref<string>('Option A')
const rateScore = ref<number>(4)
const switchVal = ref<boolean>(true)
const pickColor = ref<string>('#2563eb')
const inputNum = ref<number>(10)
const timeVal = ref<string>('10:30:00')
const activeSegment = ref<string>('Daily')
const activeStep = ref<number>(2)
const activeTabItem = ref<string>('tab1')
const splitLeftWidth = ref<number>(50)
const otpDigits = reactive<string[]>(['2', '0', '2', '6'])
const inputTags = ref<string[]>(['Vue3', 'OatUI', 'ElementPlus'])
const tagInputValue = ref<string>('')

const addTag = () => {
  const v = tagInputValue.value.trim()
  if (v && !inputTags.value.includes(v)) {
    inputTags.value.push(v)
    tagInputValue.value = ''
  }
}

const mentionText = ref<string>('请团队成员 @ 处理该单据')
const selectedCalDay = ref<number>(24)

// 水印 & Tour & Popconfirm
const showWatermark = ref<boolean>(false)
const showTourModal = ref<boolean>(false)
const tourStep = ref<number>(1)
const popconfirmVisible = ref<boolean>(false)

// Autocomplete
const autoQuery = ref<string>('')
const autoSuggestions = ['Vue 3 开发指南', 'Vite 5 快速构建', 'TypeScript 5 入门', 'Element Plus 组件大全', 'Oat UI 极简设计']
const filteredAutoSuggestions = computed(() => {
  if (!autoQuery.value) return []
  return autoSuggestions.filter((item) => item.toLowerCase().includes(autoQuery.value.toLowerCase()))
})

// Image 预览与 Carousel
const isImageZoomed = ref<boolean>(false)
const carouselIdx = ref<number>(0)
const carouselSlides = ['Oat UI 极简卡片 1', 'Element Plus 高效组件 2', 'Vue 3 极致性能 3']

// Infinite Scroll
const infiniteList = ref<number[]>([1, 2, 3, 4, 5])
const loadMoreInfinite = () => {
  const len = infiniteList.value.length
  for (let i = 1; i <= 5; i++) infiniteList.value.push(len + i)
  ElMessage.success(`成功加载 ${infiniteList.value.length} 条数据！`)
}

// 400 表格
export interface OatExampleItem {
  id: number
  code: string
  name: string
  category: string
  status: string
  size: string
  description: string
}

const generate400Examples = (): OatExampleItem[] => {
  const items: OatExampleItem[] = []
  const cats = ['表格组件', '弹窗与抽屉', '表单控件', '数据展示', '布局排版', '高级应用']
  const statuses = ['推荐', '稳定', '最新', '实验']

  for (let i = 1; i <= 400; i++) {
    items.push({
      id: i,
      code: `OAT-EX-${String(i).padStart(4, '0')}`,
      name: `Oat Component Example #${i}`,
      category: cats[i % cats.length],
      status: statuses[i % statuses.length],
      size: `${(0.5 + (i % 30) * 0.1).toFixed(1)} KB`,
      description: `示例说明 #${i}: 对照 Element Plus 组件实现的 Oat 范例`
    })
  }
  return items
}

const allExamples = ref<OatExampleItem[]>(generate400Examples())
const searchQuery = ref<string>('')
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)

const paginatedExamples = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const list = allExamples.value.filter(
    (x) => !q || x.name.toLowerCase().includes(q) || x.description.toLowerCase().includes(q)
  )
  const start = (currentPage.value - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(allExamples.value.length / pageSize.value) || 1)

// 双击编辑
const editingCellId = ref<number | null>(null)
const editValue = ref<string>('')

const startCellEdit = (item: OatExampleItem) => {
  editingCellId.value = item.id
  editValue.value = item.name
}

const saveCellEdit = (item: OatExampleItem) => {
  if (editingCellId.value) {
    item.name = editValue.value.trim() || item.name
    ElMessage.success(`已保存项目 #${item.id} 名称为: "${item.name}"`)
  }
  editingCellId.value = null
}

// 弹窗与抽屉 State
const updateModalOpen = ref<boolean>(false)
const createPageModalOpen = ref<boolean>(false)
const confirmModalOpen = ref<boolean>(false)
const drawerOpen = ref<boolean>(false)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  ElMessage.success('已回到页面顶部！')
}
</script>

<template>
  <div class="oat-studio-page">
    <!-- 水印遮罩 (Watermark v2.4.0) -->
    <div v-if="showWatermark" class="oat-watermark-overlay"></div>

    <!-- Header 头部栏 -->
    <header class="studio-header">
      <div class="header-content">
        <div class="tag-badge">🌾 Oat.ink Interactive Studio</div>
        <h1>Element Plus + Oat.ink 26 原生全套组件库</h1>
        <p>
          聚合了 <a href="https://oat.ink/components/" target="_blank">Oat.ink 官方 26 个原生 WebComponent / HTML5 组件</a> 以及 Element Plus 64 项侧栏目录！包含 <strong>Select 选择器</strong>、<strong>Dropdown 下拉</strong>、<strong>TagInput 标签输入</strong>、<strong>Upload 文件上传</strong>、<strong>Tabs 标签页</strong>及 <strong>400 表格双击编辑</strong>。
        </p>

        <!-- Dialog 官方设计参考说明 Banner -->
        <div class="dialog-reference-banner">
          <div class="ref-title">
            <span>💡 Oat UI Dialog / Modal 对话框设计规范与灵感参考说明</span>
          </div>
          <div class="ref-desc">
            Oat UI 的对话框 (Dialog / Modal) 与二次确认框融合了 <strong>Element Plus Dialog</strong> 的经典居中分栏结构与 <strong>Naive UI OS-Theme Dialog</strong> 极简的高斯模糊 (Backdrop Filter) 和无缝胶囊按钮。兼具极致轻量性能 (0 依赖) 与媲美两大现代 Vue 库的灵动视觉体验！
          </div>
          <div class="ref-links">
            <a href="https://oat.ink/components/" target="_blank" class="ref-link-btn el-link">
              🌾 Oat.ink 26 官方原生组件库 ↗
            </a>
            <a href="https://element-plus.org/zh-CN/component/dialog" target="_blank" class="ref-link-btn el-link">
              💚 Element Plus Dialog 官方文档 ↗
            </a>
            <a href="https://www.naiveui.com/zh-CN/os-theme/components/dialog" target="_blank" class="ref-link-btn naive-link">
              🟢 Naive UI OS-Theme Dialog 官方文档 ↗
            </a>
          </div>
        </div>

        <div class="stats-summary">
          <div class="stat-item">
            <span class="num">26 + 64 项</span>
            <span class="lbl">Oat 官方原生 26 组件 + EP 全全覆盖</span>
          </div>
          <div class="stat-item">
            <span class="num">Select &amp; Form</span>
            <span class="lbl">选择器与全表单控件</span>
          </div>
          <div class="stat-item">
            <span class="num">400 范例</span>
            <span class="lbl">双击单元格行内编辑</span>
          </div>
        </div>

        <div class="action-bar">
          <button class="oat-btn primary" @click="confirmModalOpen = true">
            💬 触发 Dialog / Modal 对话框
          </button>
          <button class="oat-btn primary" @click="showTourModal = true; tourStep = 1">
            🚩 开启 Tour 漫游引导
          </button>
          <button class="oat-btn" :class="showWatermark ? 'danger' : 'outline'" @click="showWatermark = !showWatermark">
            💧 {{ showWatermark ? '关闭全局水印' : '开启 Watermark 全局水印 (v2.4.0)' }}
          </button>
          <button class="oat-btn secondary" @click="updateModalOpen = true">
            🔔 版本更新提示
          </button>
          <button class="oat-btn secondary" @click="drawerOpen = true">
            📥 打开右侧抽屉
          </button>
        </div>
      </div>
    </header>

    <!-- Main 1:1 布局区 -->
    <main class="studio-main-layout">
      <!-- 1:1 侧栏 Component Sidebar -->
      <aside class="el-sidebar-nav">
        <div v-for="grp in EL_SIDEBAR_GROUPS" :key="grp.groupName">
          <div class="sidebar-group-title" :class="{ 'oat-official-title': grp.isOatOfficial }">
            {{ grp.groupName }}
          </div>
          <div
            v-for="item in grp.items"
            :key="item.key"
            class="sidebar-item"
            :class="{ active: activeCompKey === item.key }"
            @click="activeCompKey = item.key"
          >
            <span>{{ item.name }} {{ item.nameCn }}</span>
            <span v-if="item.ver" class="ver-tag">{{ item.ver }}</span>
          </div>
        </div>
      </aside>

      <!-- 动态交互展示主体区 (精细覆盖 Select, Avatar, Badge, Breadcrumb, Form 等所有 Key) -->
      <section class="el-content-body">
        <div class="section-title">
          <span class="icon">✨</span>
          <h2>当前组件：{{ activeCompKey.toUpperCase() }} Oat UI 实战演示</h2>
        </div>

        <!-- 1. Select 选择器 / Virtualized Select (解决用户截图反馈) -->
        <div v-if="activeCompKey === 'select' || activeCompKey === 'virtualized-select'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 16px;">
            <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a;">🔽 Select 选择器 &lt;el-select&gt;</h4>
            <span class="oat-badge blue">交互面板范例</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px; max-width: 440px;">
            <label style="font-size: 0.88rem; font-weight: 700; color: #334155;">请选择技术栈框架:</label>
            <select v-model="selectVal" style="padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; outline: none; background: #ffffff; width: 100%; cursor: pointer;">
              <option v-for="opt in selectOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>

            <div style="padding: 12px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.85rem; color: #0f172a;">
              当前选中 Option: <strong style="color: #2563eb;">{{ selectVal }}</strong> ({{ selectOptions.find(x => x.value === selectVal)?.label }})
            </div>
          </div>
        </div>

        <!-- 2. Avatar 头像卡片 -->
        <div v-else-if="activeCompKey === 'avatar' || activeCompKey === 'oat-avatar'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px;">
          <h4>Avatar 头像 <span class="el-name">&lt;el-avatar&gt;</span></h4>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #3b82f6); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem;">
              OA
            </div>
            <div style="width: 44px; height: 44px; border-radius: 8px; background: #10b981; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700;">
              UI
            </div>
            <div style="font-size: 0.85rem; color: #64748b;">
              圆形与方形多尺寸图像/文字占位头像组件。
            </div>
          </div>
        </div>

        <!-- 3. Badge 徽章卡片 -->
        <div v-else-if="activeCompKey === 'badge' || activeCompKey === 'oat-badge'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px;">
          <h4>Badge 徽章 <span class="el-name">&lt;el-badge&gt;</span></h4>
          <div style="display: flex; gap: 14px; align-items: center;">
            <span class="oat-badge blue">99+ 消息</span>
            <span class="oat-badge green">NEW 最新</span>
            <span class="oat-badge red">HOT 热门</span>
            <span class="oat-badge gray">V2.4.0</span>
          </div>
        </div>

        <!-- 4. Breadcrumb 面包屑 -->
        <div v-else-if="activeCompKey === 'breadcrumb' || activeCompKey === 'oat-breadcrumb'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px;">
          <h4>Breadcrumb 面包屑 <span class="el-name">&lt;el-breadcrumb&gt;</span></h4>
          <nav aria-label="breadcrumb" style="display: flex; gap: 8px; font-size: 0.88rem; color: #64748b;">
            <a href="/" style="color: #2563eb; text-decoration: none;">首页</a>
            <span>/</span>
            <a href="/oat-studio" style="color: #2563eb; text-decoration: none;">组件库</a>
            <span>/</span>
            <span style="color: #0f172a; font-weight: 700;">{{ activeCompKey.toUpperCase() }} 演练</span>
          </nav>
        </div>

        <!-- 5. Form 表单元素 -->
        <div v-else-if="activeCompKey === 'form' || activeCompKey === 'oat-form'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px;">
          <h4>Form 表单元素 <span class="el-name">&lt;el-form&gt;</span></h4>
          <form style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;" @submit.prevent="ElMessage.success('表单校验并提交成功！')">
            <div>
              <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 4px;">用户名:</label>
              <input type="text" placeholder="输入用户名..." style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.88rem;" required />
            </div>
            <div>
              <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 4px;">邮箱账号:</label>
              <input type="email" placeholder="example@domain.com" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.88rem;" required />
            </div>
            <button type="submit" class="oat-btn primary small" style="align-self: flex-start;">提交表单</button>
          </form>
        </div>

        <!-- 6. Input & Input Number -->
        <div v-else-if="activeCompKey === 'input' || activeCompKey === 'input-number'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px;">
          <h4>Input &amp; Input Number 输入框 <span class="el-name">&lt;el-input&gt;</span></h4>
          <div style="display: flex; align-items: center; gap: 10px; max-width: 320px;">
            <button class="oat-btn secondary small" @click="inputNum--">-</button>
            <input v-model.number="inputNum" type="number" style="width: 100px; text-align: center; padding: 6px 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: 700;" />
            <button class="oat-btn secondary small" @click="inputNum++">+</button>
            <span style="font-size: 0.85rem; color: #64748b;">步进: 1</span>
          </div>
        </div>

        <!-- 7. Oat.ink 官方 WebComponents 展示 -->
        <div v-else-if="activeCompKey === 'oat-dropdown'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px;">
          <h4>Oat.ink Official Dropdown WebComponent <span class="el-name">&lt;ot-dropdown&gt;</span></h4>
          <ot-dropdown>
            <button class="oat-btn outline small">更多功能 ▾</button>
            <menu popover style="padding: 8px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <div style="padding: 6px 12px; cursor: pointer; font-size: 0.85rem;" @click="ElMessage.success('导出数据中...')">📄 导出数据</div>
              <div style="padding: 6px 12px; cursor: pointer; font-size: 0.85rem;" @click="ElMessage.success('复制链接中...')">🔗 复制链接</div>
            </menu>
          </ot-dropdown>
        </div>

        <div v-else-if="activeCompKey === 'oat-taginput'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px;">
          <h4>Oat.ink Official TagInput WebComponent <span class="el-name">&lt;ot-tag-input&gt;</span></h4>
          <ot-tag-input placeholder="输入标签名按 Enter 添加..." style="width: 100%; max-width: 400px; display: block;"></ot-tag-input>
        </div>

        <div v-else-if="activeCompKey === 'oat-upload'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px;">
          <h4>Oat.ink Official Upload WebComponent <span class="el-name">&lt;ot-upload&gt;</span></h4>
          <ot-upload style="display: block; width: 100%; max-width: 440px; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; background: #f8fafc;">
            <div style="font-size: 2rem; margin-bottom: 8px;">📂</div>
            <div style="font-weight: 700; font-size: 0.95rem; color: #0f172a; margin-bottom: 4px;">点击或将文件拖拽至此处上传</div>
          </ot-upload>
        </div>

        <div v-else-if="activeCompKey === 'oat-tabs'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px;">
          <h4>Oat.ink Official Tabs WebComponent <span class="el-name">&lt;ot-tabs&gt;</span></h4>
          <ot-tabs style="display: block;">
            <div style="display: flex; gap: 16px; border-bottom: 2px solid #e2e8f0; margin-bottom: 14px;">
              <button class="oat-btn outline small">🌾 概览面板</button>
              <button class="oat-btn secondary small">⚡ 性能指标</button>
            </div>
            <div style="padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 0.88rem;">
              Oat.ink 官方 WebComponent &lt;ot-tabs&gt; 运行演示容器。
            </div>
          </ot-tabs>
        </div>

        <!-- Cascader 级联选择器 -->
        <div v-else-if="activeCompKey === 'cascader'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
          <h4>Cascader 级联选择器 <span class="el-name">&lt;el-cascader&gt;</span></h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="font-size: 0.85rem; color: #64748b;">省份 - 城市两级级联响应选择器：</div>
            <div style="display: flex; gap: 10px; max-width: 400px;">
              <select v-model="selectedProvince" style="flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.88rem;" @change="handleProvinceChange">
                <option v-for="prov in provinceList" :key="prov" :value="prov">{{ prov }}</option>
              </select>
              <select v-model="selectedCity" style="flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.88rem;">
                <option v-for="c in (cityMap[selectedProvince] || [])" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div style="font-size: 0.85rem; color: #0f172a; font-weight: 700; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
              当前选择路径: <span style="color: #2563eb;">{{ selectedProvince }} / {{ selectedCity }}</span>
            </div>
          </div>
        </div>

        <!-- Checkbox 多选框 -->
        <div v-else-if="activeCompKey === 'checkbox'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
          <h4>Checkbox 多选框 <span class="el-name">&lt;el-checkbox&gt;</span></h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
              <span style="font-size: 0.88rem; font-weight: 700; color: #334155;">已勾选技术栈: ({{ checkedList.length }} / {{ allCheckOptions.length }})</span>
              <button class="oat-btn outline small" @click="toggleCheckAll">
                {{ checkedList.length === allCheckOptions.length ? '全不选' : '全选' }}
              </button>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 14px;">
              <label v-for="opt in allCheckOptions" :key="opt" style="cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.88rem;">
                <input v-model="checkedList" type="checkbox" :value="opt" />
                <span>{{ opt }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Transfer 穿梭框 -->
        <div v-else-if="activeCompKey === 'transfer'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
          <h4>Transfer 穿梭框 <span class="el-name">&lt;el-transfer&gt;</span></h4>
          <div class="transfer-wrapper">
            <div class="transfer-list">
              <div class="t-header">待选列表 ({{ transferLeft.length }})</div>
              <div v-for="item in transferLeft" :key="item" class="t-item" @click="moveToRight(item)">
                <span>{{ item }}</span>
                <span>➔</span>
              </div>
            </div>
            <div style="font-weight: 700; color: #94a3b8; font-size: 0.85rem;">点击穿梭</div>
            <div class="transfer-list">
              <div class="t-header">已选列表 ({{ transferRight.length }})</div>
              <div v-for="item in transferRight" :key="item" class="t-item" @click="moveToLeft(item)">
                <span>⬅</span>
                <span>{{ item }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Slider 滑块 -->
        <div v-else-if="activeCompKey === 'slider'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
          <h4>Slider 滑块 <span class="el-name">&lt;el-slider&gt;</span></h4>
          <div class="slider-wrapper">
            <input v-model.number="sliderVal" type="range" min="0" max="100" />
            <span class="slider-val">{{ sliderVal }} %</span>
          </div>
        </div>

        <!-- Table 表格与 400 范例双击编辑 -->
        <div v-else-if="activeCompKey === 'table' || activeCompKey === 'virtualized-table' || activeCompKey === 'oat-table'" class="oat-table-section">
          <div class="table-card">
            <h4 style="margin: 0 0 12px;">Table 表格 (💡 提示：双击范例名称可修改编辑)</h4>
            <div class="table-toolbar" style="margin-bottom: 12px;">
              <input v-model="searchQuery" type="text" placeholder="搜索 400 个范例..." style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem;" />
            </div>

            <div class="table-wrapper">
              <table class="oat-table">
                <thead>
                  <tr>
                    <th>编号</th>
                    <th>范例名称 (双击修改)</th>
                    <th>分类</th>
                    <th>状态</th>
                    <th>大小</th>
                    <th>描述</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in paginatedExamples" :key="item.id">
                    <td class="item-id">#{{ String(item.id).padStart(3, '0') }}</td>
                    <td class="editable-td" @dblclick="startCellEdit(item)">
                      <input v-if="editingCellId === item.id" v-model="editValue" type="text" class="cell-edit-input" @blur="saveCellEdit(item)" @keyup.enter="saveCellEdit(item)" />
                      <span v-else class="comp-name">{{ item.name }} ✏️</span>
                    </td>
                    <td><span class="oat-badge gray">{{ item.category }}</span></td>
                    <td><span class="oat-badge blue">{{ item.status }}</span></td>
                    <td><span class="size-tag">{{ item.size }}</span></td>
                    <td class="comp-desc">{{ item.description }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="table-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
              <span style="font-size: 0.85rem; color: #64748b;">页码 {{ currentPage }} / {{ totalPages }}</span>
              <div style="display: flex; gap: 6px;">
                <button class="oat-btn secondary small" :disabled="currentPage <= 1" @click="currentPage--">上一页</button>
                <button class="oat-btn secondary small" :disabled="currentPage >= totalPages" @click="currentPage++">下一页</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 基础其余所有组件渲染具体交互卡片 -->
        <div v-else class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 16px;">
            <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f172a;">
              🧩 Oat UI 版本 {{ activeCompKey.toUpperCase() }} 组件
            </h4>
            <span class="oat-badge blue">{{ activeCompKey }}</span>
          </div>

          <div style="padding: 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
            <div style="font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-bottom: 6px;">
              Oat.ink 官方 WebComponent / CSS 零依赖组件
            </div>
            <p style="font-size: 0.85rem; color: #64748b; margin: 0; line-height: 1.5;">
              遵循 Oat.ink (<a href="https://oat.ink/components/" target="_blank">oat.ink/components/</a>) 语义化 HTML 规范构建，原生无损响应。
            </p>
          </div>

          <div style="display: flex; gap: 10px;">
            <button class="oat-btn primary small" @click="ElMessage.success(`成功触发 ${activeCompKey} 交互操作！`)">
              🚀 触发 {{ activeCompKey }} 交互响应
            </button>
            <button class="oat-btn secondary small" @click="ElMessage.info(`源码引用: oat.ink/components/#${activeCompKey}`)">
              📋 查看 {{ activeCompKey }} 官方文档
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Tour 漫游引导 Modal -->
    <div v-if="showTourModal" class="tour-mask">
      <div class="tour-card">
        <h4 v-if="tourStep === 1">🚩 步骤 1/3：欢迎体验 Oat Studio</h4>
        <p v-if="tourStep === 1">点击左侧 Element Plus &amp; Oat.ink 侧栏目录中的任意组件，右侧即刻呈现专属交互 UI 卡片！</p>

        <h4 v-if="tourStep === 2">🚩 步骤 2/3：双击修改 400 表格范例</h4>
        <p v-if="tourStep === 2">切换至 Table 组件，双击表格行内名称与描述说明可直接修改。</p>

        <h4 v-if="tourStep === 3">🚩 步骤 3/3：开启全局防伪水印</h4>
        <p v-if="tourStep === 3">点击顶部 Watermark 按键可一键覆盖防伪水印。</p>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
          <button class="oat-btn secondary small" @click="showTourModal = false">关闭引导</button>
          <button v-if="tourStep < 3" class="oat-btn primary small" @click="tourStep++">下一步 ▶</button>
          <button v-else class="oat-btn primary small" @click="showTourModal = false">完成体验</button>
        </div>
      </div>
    </div>

    <!-- 回到顶部浮动按键 -->
    <button class="backtop-btn" title="回到顶部" @click="scrollToTop">▲</button>

    <!-- 通用 Dialog 挂载 -->
    <OatConfirmModal
      v-model="confirmModalOpen"
      type="warning"
      title="通用 Dialog / Modal 对话框"
      message="这是遵循 Element Plus Dialog 与 Naive UI OS-Theme Dialog 规范打造的极简高斯模糊遮罩对话框。"
      confirm-text="确定"
      cancel-text="取消"
      @confirm="ElMessage.success('已确认 Dialog 操作')"
    />

    <OatUpdateModal v-model="updateModalOpen" @confirm="ElMessage.success('体验最新组件！')" />
    <OatCreatePageModal v-model="createPageModalOpen" />
    <OatDrawer v-model="drawerOpen" title="🔔 系统通知" subtitle="Oat UI 抽屉" />
  </div>
</template>

<style scoped lang="scss">
@import './css/index.scss';
</style>
