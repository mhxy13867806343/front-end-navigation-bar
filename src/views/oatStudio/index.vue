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

// 选中的组件 key
const activeCompKey = ref<string>('splitter')

// 水印与漫游引导 State
const showWatermark = ref<boolean>(false)
const showTourModal = ref<boolean>(false)
const tourStep = ref<number>(1)

// Splitter 比例
const splitLeftWidth = ref<number>(50)

// OTP 验证码 (4位)
const otpDigits = reactive<string[]>(['2', '0', '2', '6'])

// Input Tag 标签
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
const mentionText = ref<string>('你好 @')

// 日历与年月
const selectedCalDay = ref<number>(24)
const selectedMonth = ref<string>('2026-07')

// 弹窗与抽屉
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
    <!-- 水印遮罩浮层 (Watermark v2.4.0) -->
    <div v-if="showWatermark" class="oat-watermark-overlay"></div>

    <!-- Header 头部栏 -->
    <header class="studio-header">
      <div class="header-content">
        <div class="tag-badge">🌾 Oat.ink Interactive Studio</div>
        <h1>Element Plus 官方全套组件 (含 Tour, Watermark, Splitter, OTP, Tag)</h1>
        <p>
          1:1 还原 <a href="https://element-plus.org/zh-CN/component/overview" target="_blank">Element Plus 官方组件侧栏目录</a>，点击左侧目录可直接试用 Oat UI 版本的对应交互组件！包含 <strong>Watermark 水印</strong>、<strong>Tour 漫游引导</strong>、<strong>Splitter 分隔面板</strong>、<strong>Input OTP 验证码</strong>与 <strong>Input Tag 标签框</strong>。
        </p>

        <div class="stats-summary">
          <div class="stat-item">
            <span class="num">50+ 个</span>
            <span class="lbl">Element Plus 侧栏组件全列举</span>
          </div>
          <div class="stat-item">
            <span class="num">Tour & Watermark</span>
            <span class="lbl">漫游引导与全局水印</span>
          </div>
          <div class="stat-item">
            <span class="num">Splitter & OTP</span>
            <span class="lbl">分隔面板与 4 位验证码</span>
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

    <!-- Main 主体与 1:1 侧栏布局 -->
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

      <!-- 动态交互展示主体 -->
      <section class="el-content-body">
        <div class="section-title">
          <span class="icon">✨</span>
          <h2>当前组件：{{ activeCompKey.toUpperCase() }} Oat UI 实战演示</h2>
        </div>

        <div class="el-demo-grid">
          <!-- 1. Splitter 分隔面板 -->
          <div v-if="activeCompKey === 'splitter' || activeCompKey === 'layout'" class="demo-box" style="grid-column: 1 / -1;">
            <h4>Splitter 分隔面板 <span class="el-name">&lt;el-splitter&gt; (v2.10.0)</span></h4>
            <div class="demo-content">
              <div class="splitter-demo">
                <div class="split-pane left-pane" :style="{ width: `${splitLeftWidth}%` }">
                  👈 左侧面板 ({{ splitLeftWidth }}%)
                </div>
                <div class="split-bar" @click="splitLeftWidth = splitLeftWidth === 40 ? 60 : 40"></div>
                <div class="split-pane right-pane" :style="{ width: `${100 - splitLeftWidth}%` }">
                  👉 右侧面板 ({{ 100 - splitLeftWidth }}%)
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Tour 漫游引导 (v2.5.0) -->
          <div v-if="activeCompKey === 'tour'" class="demo-box">
            <h4>Tour 漫游式引导 <span class="el-name">&lt;el-tour&gt; (v2.5.0)</span></h4>
            <div class="demo-content">
              <p style="font-size: 0.85rem; color: #64748b;">引导新用户熟悉页面功能点的气泡弹框。</p>
              <button class="oat-btn primary" @click="showTourModal = true; tourStep = 1">
                ▶ 立即启动漫游引导 Tour
              </button>
            </div>
          </div>

          <!-- 3. Watermark 水印 (v2.4.0) -->
          <div v-if="activeCompKey === 'watermark'" class="demo-box">
            <h4>Watermark 水印 <span class="el-name">&lt;el-watermark&gt; (v2.4.0)</span></h4>
            <div class="demo-content">
              <p style="font-size: 0.85rem; color: #64748b;">为页面覆盖防截图或防泄漏背景水印。</p>
              <button class="oat-btn primary" @click="showWatermark = !showWatermark">
                {{ showWatermark ? '已开启 (点击关闭)' : '点击开启全局防伪水印' }}
              </button>
            </div>
          </div>

          <!-- 4. Input OTP 验证码 (v2.14.0) -->
          <div v-if="activeCompKey === 'input-otp' || activeCompKey === 'input'" class="demo-box">
            <h4>Input OTP 验证码 <span class="el-name">&lt;el-input-otp&gt; (v2.14.0)</span></h4>
            <div class="demo-content">
              <div class="otp-input-box">
                <input v-for="(_, idx) in 4" :key="idx" v-model="otpDigits[idx]" maxlength="1" class="otp-digit" />
              </div>
              <span style="font-size: 0.8rem; color: #64748b;">当前验证码: <code>{{ otpDigits.join('') }}</code></span>
            </div>
          </div>

          <!-- 5. Input Tag 标签输入框 (v2.9.0) -->
          <div v-if="activeCompKey === 'input-tag' || activeCompKey === 'tag'" class="demo-box">
            <h4>Input Tag 标签输入框 <span class="el-name">&lt;el-input-tag&gt; (v2.9.0)</span></h4>
            <div class="demo-content">
              <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px; border: 1px solid #cbd5e1; border-radius: 8px;">
                <span v-for="(t, idx) in inputTags" :key="idx" class="oat-badge blue" @click="inputTags.splice(idx, 1)">
                  {{ t }} ×
                </span>
                <input v-model="tagInputValue" type="text" placeholder="按回车添加..." style="border: none; outline: none; flex: 1; min-width: 80px;" @keyup.enter="addTag" />
              </div>
            </div>
          </div>

          <!-- 6. Calendar 日历小部件 -->
          <div v-if="activeCompKey === 'calendar'" class="demo-box">
            <h4>Calendar 日历 <span class="el-name">&lt;el-calendar&gt;</span></h4>
            <div class="demo-content">
              <div class="mini-calendar">
                <div class="cal-header">📅 2026 年 7 月</div>
                <div class="cal-grid">
                  <span v-for="d in 31" :key="d" class="day-cell" :class="{ active: selectedCalDay === d }" @click="selectedCalDay = d">
                    {{ d }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 7. Backtop 回到顶部 -->
          <div v-if="activeCompKey === 'backtop'" class="demo-box">
            <h4>Backtop 回到顶部 <span class="el-name">&lt;el-backtop&gt;</span></h4>
            <div class="demo-content">
              <p style="font-size: 0.85rem; color: #64748b;">页面右下角附带快捷返回顶部的浮动按钮。</p>
              <button class="oat-btn secondary" @click="scrollToTop">
                ⬆️ 触发返回顶部
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Tour 漫游引导遮罩与步骤弹窗 -->
    <div v-if="showTourModal" class="tour-mask">
      <div class="tour-card">
        <h4 v-if="tourStep === 1">🚩 步骤 1/3：欢迎使用 Oat Studio</h4>
        <p v-if="tourStep === 1">这里完美集成了对照 Element Plus 官方侧栏目录打造的 50+ 个 Oat UI 交互组件。</p>

        <h4 v-if="tourStep === 2">🚩 步骤 2/3：双击可编辑表格</h4>
        <p v-if="tourStep === 2">表格组件支持双击任意单元格直接修改名称与描述说明，并支持 400 个全量范例管理。</p>

        <h4 v-if="tourStep === 3">🚩 步骤 3/3：开启防伪水印与高级表单</h4>
        <p v-if="tourStep === 3">您还可以一键开启 Watermark 全局防伪水印与体验正则校验表单。</p>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
          <button class="oat-btn secondary small" @click="showTourModal = false">关闭引导</button>
          <button v-if="tourStep < 3" class="oat-btn primary small" @click="tourStep++">下一步 ▶</button>
          <button v-else class="oat-btn primary small" @click="showTourModal = false">完成体验</button>
        </div>
      </div>
    </div>

    <!-- 快捷回到顶部按钮 -->
    <button class="backtop-btn" title="回到顶部" @click="scrollToTop">
      ▲
    </button>

    <!-- 弹窗挂载 -->
    <OatUpdateModal v-model="updateModalOpen" @confirm="ElMessage.success('体验最新组件！')" />
    <OatCreatePageModal v-model="createPageModalOpen" />
    <OatDrawer v-model="drawerOpen" title="🔔 系统通知" subtitle="Oat UI 抽屉" />
  </div>
</template>

<style scoped lang="scss">
@import './css/index.scss';
</style>
