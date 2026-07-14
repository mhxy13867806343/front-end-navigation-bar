<script setup lang="ts">

import { 
  NButton, NButtonGroup, NIcon, NText, NSpace, NCard,
  NInput, NSelect, NProgress, NAlert, NTree, 
  NCalendar, NTimeline, NTimelineItem, NCarousel
} from 'naive-ui'

// ------ Tabs Control ------
const activeSubTab = ref('basic')

// ------ Form Elements ------
const inputValue = ref('')
const selectValue = ref(null)
const selectOptions = [
  { label: 'Vue 3', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Naive UI', value: 'naive' }
]

// ------ Tree Data ------
const treeData = ref([
  {
    label: 'Naivety 技术栈',
    key: 'tech',
    children: [
      { label: 'Naive UI 组件库', key: 'library' },
      { label: 'Tailwind CSS 支持', key: 'tailwind' }
    ]
  },
  {
    label: 'AI 协同研发',
    key: 'ai',
    children: [
      { label: 'DeepSeek-V3', key: 'ds' },
      { label: 'Gemini 2.5 Flash', key: 'gemini' }
    ]
  }
])

// ------ Calendar ------
const calendarValue = ref(Date.now())
</script>

<template>
  <div class="naive-showcase-container">
    <div style="margin-bottom: 16px;">
      <el-radio-group v-model="activeSubTab" size="small">
        <el-radio-button value="basic">🧱 Naive 基础组件</el-radio-button>
        <el-radio-button value="intermediate">⚙️ Naive 中级组件</el-radio-button>
        <el-radio-button value="advanced">🚀 Naive 高级组件</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 1. 基础组件 -->
    <div v-if="activeSubTab === 'basic'">
      <div class="demo-section">
        <h4 class="demo-title">Button 按钮样式 (Naive UI)</h4>
        <n-space wrap>
          <n-button>Default</n-button>
          <n-button type="primary">Primary</n-button>
          <n-button type="info">Info</n-button>
          <n-button type="success">Success</n-button>
          <n-button type="warning">Warning</n-button>
          <n-button type="error">Error</n-button>
        </n-space>
        <n-space wrap style="margin-top: 10px;">
          <n-button dashed>Dashed</n-button>
          <n-button round type="primary">Round</n-button>
          <n-button circle type="success">✓</n-button>
          <n-button loading type="info">Loading</n-button>
          <n-button disabled type="error">Disabled</n-button>
        </n-space>
      </div>

      <div class="demo-section">
        <h4 class="demo-title">Text 排版文本 (Naive UI)</h4>
        <n-space vertical>
          <n-text>默认普通文本</n-text>
          <n-text type="primary">主要说明文本</n-text>
          <n-text type="success">成功说明文本</n-text>
          <n-text type="warning">警告说明文本</n-text>
          <n-text type="danger">危险说明文本</n-text>
        </n-space>
      </div>
    </div>

    <!-- 2. 中级组件 -->
    <div v-if="activeSubTab === 'intermediate'">
      <div class="demo-section">
        <h4 class="demo-title">Input 输入框 (Naive UI)</h4>
        <n-space vertical style="max-width: 320px;">
          <n-input v-model:value="inputValue" type="text" placeholder="普通输入文本框" clearable />
          <n-input type="password" show-password-on="click" placeholder="显示/隐藏密码输入" />
        </n-space>
      </div>

      <div class="demo-section">
        <h4 class="demo-title">Select 下拉选择器 (Naive UI)</h4>
        <n-select v-model:value="selectValue" :options="selectOptions" placeholder="请选择框架项目" style="max-width: 320px;" />
      </div>

      <div class="demo-section">
        <h4 class="demo-title">Progress 环形/条形进度条 (Naive UI)</h4>
        <n-space vertical style="max-width: 320px;">
          <n-progress type="line" :percentage="75" indicator-placement="inside" processing />
          <n-progress type="circle" :percentage="75" style="width: 80px;" />
        </n-space>
      </div>

      <div class="demo-section">
        <h4 class="demo-title">Alert 警告提示框 (Naive UI)</h4>
        <n-space vertical style="max-width: 480px;">
          <n-alert title="Naive 成功信息" type="success">
            组件库样式及配置加载完成。
          </n-alert>
          <n-alert title="系统性能通知" type="warning">
            当前网络下代理访问延迟达 120ms。
          </n-alert>
        </n-space>
      </div>
    </div>

    <!-- 3. 高级组件 -->
    <div v-if="activeSubTab === 'advanced'">
      <div class="demo-section">
        <h4 class="demo-title">Tree 树形节点 (Naive UI)</h4>
        <n-tree :data="treeData" block-line checkable style="max-width: 360px;" />
      </div>

      <div class="demo-section">
        <h4 class="demo-title">Timeline 时间轴 (Naive UI)</h4>
        <n-timeline style="max-width: 360px;">
          <n-timeline-item type="success" title="上线最新版 Naive UI 演练场" time="2026-07-14" />
          <n-timeline-item type="info" title="升级 Vue 与 Element-Plus 依赖" time="2026-07-12" />
          <n-timeline-item type="warning" title="开始优化全局公共资源引用" time="2026-07-10" />
        </n-timeline>
      </div>

      <div class="demo-section">
        <h4 class="demo-title">Carousel 卡片跑马灯 (Naive UI)</h4>
        <n-carousel autoplay style="height: 140px; max-width: 450px; border-radius: 8px; overflow: hidden;">
          <div class="carousel-slide slide-1">看板 A</div>
          <div class="carousel-slide slide-2">看板 B</div>
          <div class="carousel-slide slide-3">看板 C</div>
        </n-carousel>
      </div>

      <div class="demo-section">
        <h4 class="demo-title">Calendar 日历 (Naive UI)</h4>
        <n-calendar v-model:value="calendarValue" style="max-width: 600px; padding: 12px; border: 1px solid var(--el-border-color); border-radius: 8px;" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.naive-showcase-container {
  padding: 8px 0;
}
.carousel-slide {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}
.slide-1 { background-color: #18a058; }
.slide-2 { background-color: #2080f0; }
.slide-3 { background-color: #f0a020; }
</style>
