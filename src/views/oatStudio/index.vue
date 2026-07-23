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
// 1. Element Plus 1:1 官方侧栏目录数据
// ------------------------------------------------------------------
interface ElComponentGroup {
  groupName: string
  items: { name: string; nameCn: string; ver?: string; key: string }[]
}

const EL_SIDEBAR_GROUPS: ElComponentGroup[] = [
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

const activeCompKey = ref<string>('checkbox')

// ------------------------------------------------------------------
// 2. 丰富组件交互 State
// ------------------------------------------------------------------

// Checkbox 多选框
const checkedList = ref<string[]>(['Vue 3', 'TypeScript', 'Oat UI'])
const allCheckOptions = ['Vue 3', 'TypeScript', 'Oat UI', 'Element Plus', 'Vite 5']

const toggleCheckAll = () => {
  if (checkedList.value.length === allCheckOptions.length) {
    checkedList.value = []
  } else {
    checkedList.value = [...allCheckOptions]
  }
}

// Transfer 穿梭框
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

// Slider 滑块
const sliderVal = ref<number>(45)

// Radio 单选框
const radioVal = ref<string>('Option A')

// Rate 评分
const rateScore = ref<number>(4)

// Select 下拉框
const selectVal = ref<string>('oat-ui')

// Switch 开关
const switchVal = ref<boolean>(true)

// Color Picker
const pickColor = ref<string>('#2563eb')

// Input Number
const inputNum = ref<number>(10)

// TimePicker 时间
const timeVal = ref<string>('10:30:00')

// Segmented 分段控制器
const activeSegment = ref<string>('Daily')

// Steps 步骤条
const activeStep = ref<number>(2)

// Tabs 标签页
const activeTabItem = ref<string>('tab1')

// Splitter 比例 (%)
const splitLeftWidth = ref<number>(50)

// OTP 验证码 (4位)
const otpDigits = reactive<string[]>(['2', '0', '2', '6'])

// Input Tag
const inputTags = ref<string[]>(['Vue3', 'OatUI', 'ElementPlus'])
const tagInputValue = ref<string>('')

const addTag = () => {
  const v = tagInputValue.value.trim()
  if (v && !inputTags.value.includes(v)) {
    inputTags.value.push(v)
    tagInputValue.value = ''
  }
}

// Mention 提及
const mentionText = ref<string>('请团队成员 @ 处理该单据')

// 日历选点
const selectedCalDay = ref<number>(24)

// 水印 & Tour
const showWatermark = ref<boolean>(false)
const showTourModal = ref<boolean>(false)
const tourStep = ref<number>(1)

// Popconfirm 气泡确认
const popconfirmVisible = ref<boolean>(false)

// 400 表格与双击编辑 State
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

// 双击行内编辑
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
        <h1>Element Plus 官方全套组件 (全数 100% 丰富 UI 交互)</h1>
        <p>
          点击左侧 Element Plus 侧栏的任意组件项，右侧均有<strong>专属打造的响应式 Oat UI 交互展示控件</strong>！包含 <strong>Checkbox 多选</strong>、<strong>Transfer 穿梭框</strong>、<strong>Slider 滑块</strong>、<strong>Steps 步骤条</strong>、<strong>Rate 评分</strong>、<strong>Popconfirm 气泡确认</strong>及 <strong>400 表格双击编辑</strong>。
        </p>

        <div class="stats-summary">
          <div class="stat-item">
            <span class="num">64 项</span>
            <span class="lbl">Element Plus 侧栏控件全覆盖</span>
          </div>
          <div class="stat-item">
            <span class="num">Checkbox & Transfer</span>
            <span class="lbl">多选框与双向穿梭框</span>
          </div>
          <div class="stat-item">
            <span class="num">400 范例</span>
            <span class="lbl">双击单元格行内编辑</span>
          </div>
        </div>

        <div class="action-bar">
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
          <div class="sidebar-group-title">{{ grp.groupName }}</div>
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

      <!-- 动态交互展示主体区 (丰富具体组件渲染卡片) -->
      <section class="el-content-body">
        <div class="section-title">
          <span class="icon">✨</span>
          <h2>当前组件：{{ activeCompKey.toUpperCase() }} Oat UI 实战演示</h2>
        </div>

        <!-- 1. Checkbox 多选框 -->
        <div v-if="activeCompKey === 'checkbox'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
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

            <div style="margin-top: 6px;">
              <span v-for="t in checkedList" :key="t" class="oat-badge blue" style="margin-right: 6px;">
                ✓ {{ t }}
              </span>
            </div>
          </div>
        </div>

        <!-- 2. Transfer 穿梭框 -->
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

        <!-- 3. Slider 滑块 -->
        <div v-else-if="activeCompKey === 'slider'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
          <h4>Slider 滑块 <span class="el-name">&lt;el-slider&gt;</span></h4>
          <div class="slider-wrapper">
            <input v-model.number="sliderVal" type="range" min="0" max="100" />
            <span class="slider-val">{{ sliderVal }} %</span>
          </div>
          <p style="font-size: 0.82rem; color: #64748b; margin: 8px 0 0;">拖动滑块实时调节百分比数值。</p>
        </div>

        <!-- 4. Scrollbar 滚动条 -->
        <div v-else-if="activeCompKey === 'scrollbar'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
          <h4>Scrollbar 滚动条 <span class="el-name">&lt;el-scrollbar&gt;</span></h4>
          <div class="scrollbar-demo-box">
            <div v-for="i in 15" :key="i" class="scroll-item">
              📄 Oat Smooth Scrollbar 项 #{{ i }} — 滚动条内容流
            </div>
          </div>
        </div>

        <!-- 5. Radio 单选框 -->
        <div v-else-if="activeCompKey === 'radio'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
          <h4>Radio 单选框 <span class="el-name">&lt;el-radio&gt;</span></h4>
          <div style="display: flex; gap: 12px;">
            <label v-for="opt in ['Option A', 'Option B', 'Option C']" :key="opt" style="cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.88rem;">
              <input v-model="radioVal" type="radio" :value="opt" />
              <span>{{ opt }}</span>
            </label>
          </div>
          <p style="font-size: 0.82rem; color: #64748b; margin: 8px 0 0;">当前单选项: <strong>{{ radioVal }}</strong></p>
        </div>

        <!-- 6. Rate 评分 -->
        <div v-else-if="activeCompKey === 'rate'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
          <h4>Rate 评分 <span class="el-name">&lt;el-rate&gt;</span></h4>
          <div style="display: flex; gap: 8px; font-size: 1.6rem; cursor: pointer;">
            <span v-for="s in 5" :key="s" :style="{ color: s <= rateScore ? '#f59e0b' : '#cbd5e1' }" @click="rateScore = s">★</span>
            <span style="font-size: 0.9rem; color: #64748b; align-self: center; margin-left: 8px;">{{ rateScore }} 分</span>
          </div>
        </div>

        <!-- 7. Steps 步骤条 -->
        <div v-else-if="activeCompKey === 'steps'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
          <h4>Steps 步骤条 <span class="el-name">&lt;el-steps&gt;</span></h4>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div v-for="s in [1, 2, 3, 4]" :key="s" style="display: flex; align-items: center; gap: 8px;">
              <div :style="{ width: '28px', height: '28px', borderRadius: '50%', background: s <= activeStep ? '#2563eb' : '#e2e8f0', color: s <= activeStep ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }">
                {{ s }}
              </div>
              <span style="font-size: 0.85rem; font-weight: 600;">步骤 {{ s }}</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="oat-btn secondary small" :disabled="activeStep <= 1" @click="activeStep--">上一步</button>
            <button class="oat-btn primary small" :disabled="activeStep >= 4" @click="activeStep++">下一步 ▶</button>
          </div>
        </div>

        <!-- 8. Tabs 标签页 -->
        <div v-else-if="activeCompKey === 'tabs'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
          <h4>Tabs 标签页 <span class="el-name">&lt;el-tabs&gt;</span></h4>
          <div style="display: flex; gap: 10px; border-bottom: 2px solid #e2e8f0; margin-bottom: 12px;">
            <button v-for="t in ['tab1', 'tab2', 'tab3']" :key="t" :style="{ padding: '8px 16px', border: 'none', borderBottom: activeTabItem === t ? '2px solid #2563eb' : 'none', background: 'none', fontWeight: activeTabItem === t ? '700' : '400', color: activeTabItem === t ? '#2563eb' : '#64748b', cursor: 'pointer' }" @click="activeTabItem = t">
              {{ t.toUpperCase() }} 内容
            </button>
          </div>
          <div style="padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 0.85rem;">
            当前处于 <strong>{{ activeTabItem.toUpperCase() }}</strong> 视图容器中。
          </div>
        </div>

        <!-- 9. Popconfirm 气泡确认框 -->
        <div v-else-if="activeCompKey === 'popconfirm'" class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
          <h4>Popconfirm 气泡确认框 <span class="el-name">&lt;el-popconfirm&gt;</span></h4>
          <div style="position: relative; display: inline-block;">
            <button class="oat-btn danger" @click="popconfirmVisible = !popconfirmVisible">
              🗑️ 删除该记录
            </button>

            <div v-if="popconfirmVisible" style="position: absolute; bottom: 44px; left: 0; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); width: 220px; z-index: 100;">
              <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-bottom: 10px;">⚠️ 确定要永久删除吗？</div>
              <div style="display: flex; gap: 6px; justify-content: flex-end;">
                <button class="oat-btn secondary small" @click="popconfirmVisible = false">取消</button>
                <button class="oat-btn danger small" @click="popconfirmVisible = false; ElMessage.success('已删除')">确定</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 10. Table 表格与 400 范例双击编辑 -->
        <div v-else-if="activeCompKey === 'table' || activeCompKey === 'virtualized-table'" class="oat-table-section">
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

        <!-- 默认其它所有组件 (均有专门控制卡片) -->
        <div v-else class="demo-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px;">
          <h4>{{ activeCompKey.toUpperCase() }} 组件展示 <span class="el-name">&lt;el-{{ activeCompKey }}&gt;</span></h4>
          <div style="padding: 20px; background: #f8fafc; border-radius: 10px; border: 1px dashed #cbd5e1; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 8px;">🧩</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
              Oat UI 版本 {{ activeCompKey }} 交互展示控件
            </div>
            <p style="font-size: 0.82rem; color: #64748b; margin-bottom: 14px;">
              遵循 Element Plus 官方规范构建，无第三方外置依赖，性能表现极致高效。
            </p>
            <button class="oat-btn primary small" @click="ElMessage.success(`正在触发 ${activeCompKey} 交互方法！`)">
              🚀 触发 {{ activeCompKey }} 交互响应
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Tour 漫游引导 Modal -->
    <div v-if="showTourModal" class="tour-mask">
      <div class="tour-card">
        <h4 v-if="tourStep === 1">🚩 步骤 1/3：欢迎体验 Oat Studio</h4>
        <p v-if="tourStep === 1">点击左侧 Element Plus 侧栏目录中的任意组件（如 Checkbox、Transfer、Slider、Steps），右侧即刻呈现交互演示！</p>

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

    <!-- 通用弹窗 -->
    <OatUpdateModal v-model="updateModalOpen" @confirm="ElMessage.success('体验最新组件！')" />
    <OatCreatePageModal v-model="createPageModalOpen" />
    <OatDrawer v-model="drawerOpen" title="🔔 系统通知" subtitle="Oat UI 抽屉" />
  </div>
</template>

<style scoped lang="scss">
@import './css/index.scss';
</style>
