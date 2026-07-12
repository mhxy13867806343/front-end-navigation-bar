<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// ------ 表单控件 ------
const inputValue = ref('')
const passwordValue = ref('')
const textareaValue = ref('')
const selectValue = ref('')
const selectOptions = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' }
]
const cascaderValue = ref([])
const cascaderOptions = [
  {
    value: 'frontend',
    label: '前端',
    children: [
      { value: 'vue', label: 'Vue' },
      { value: 'react', label: 'React' }
    ]
  },
  {
    value: 'backend',
    label: '后端',
    children: [
      { value: 'node', label: 'Node.js' },
      { value: 'go', label: 'Go' }
    ]
  }
]
const inputNumberValue = ref(3)
const radioValue = ref('option1')
const radioButtonValue = ref('beijing')
const checkboxList = ref(['vue'])
const switchValue = ref(true)
const sliderValue = ref(50)
const sliderRangeValue = ref([20, 60])
const rateValue = ref(4)
const dateValue = ref('')
const dateRangeValue = ref('')
const timeValue = ref('')
const colorValue = ref('#409EFF')

// ------ 数据展示 ------
const tableData = [
  { name: 'DeepSeek', type: 'AI聊天助手', price: '免费', region: '国内' },
  { name: 'ChatGPT', type: 'AI聊天助手', price: '20$/月', region: '国外' },
  { name: 'Midjourney', type: 'AI绘画', price: '10$/月', region: '国外' },
  { name: '通义千问', type: 'AI聊天助手', price: '免费', region: '国内' }
]
const currentPage = ref(1)
const progressValue = ref(70)
const activeCollapse = ref(['1'])
const innerTab = ref('first')

const showMessage = (type) => {
  ElMessage({ message: `这是一条 ${type} 消息提示`, type })
}
const handleDropdownCommand = (command) => {
  ElMessage.info(`点击了：${command}`)
}
</script>

<template>
  <div>
    <el-row :gutter="24">
      <el-col :xs="24" :sm="12">
        <div class="demo-section">
          <h4 class="demo-title">Input 输入框</h4>
          <el-input v-model="inputValue" placeholder="请输入内容" clearable style="max-width: 300px;" />
          <el-input v-model="passwordValue" type="password" placeholder="密码输入框" show-password style="max-width: 300px; margin-top: 8px;" />
          <el-input v-model="textareaValue" type="textarea" :rows="2" placeholder="文本域" style="max-width: 300px; margin-top: 8px;" />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Select 选择器</h4>
          <el-select v-model="selectValue" placeholder="请选择框架" clearable filterable style="width: 300px;">
            <el-option v-for="opt in selectOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Cascader 级联选择器</h4>
          <el-cascader v-model="cascaderValue" :options="cascaderOptions" placeholder="请选择技术栈" clearable style="width: 300px;" />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">InputNumber 数字输入框</h4>
          <el-input-number v-model="inputNumberValue" :min="1" :max="10" />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Radio 单选框</h4>
          <el-radio-group v-model="radioValue">
            <el-radio value="option1">选项一</el-radio>
            <el-radio value="option2">选项二</el-radio>
            <el-radio value="option3">选项三</el-radio>
          </el-radio-group>
          <div style="margin-top: 8px;">
            <el-radio-group v-model="radioButtonValue">
              <el-radio-button value="beijing">北京</el-radio-button>
              <el-radio-button value="shanghai">上海</el-radio-button>
              <el-radio-button value="hangzhou">杭州</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Checkbox 多选框</h4>
          <el-checkbox-group v-model="checkboxList">
            <el-checkbox value="vue">Vue</el-checkbox>
            <el-checkbox value="react">React</el-checkbox>
            <el-checkbox value="angular">Angular</el-checkbox>
          </el-checkbox-group>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Switch 开关 / Rate 评分</h4>
          <div class="demo-row" style="align-items: center;">
            <el-switch v-model="switchValue" active-text="开启" inactive-text="关闭" />
            <el-rate v-model="rateValue" allow-half show-score />
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12">
        <div class="demo-section">
          <h4 class="demo-title">Slider 滑块</h4>
          <el-slider v-model="sliderValue" style="max-width: 300px;" />
          <el-slider v-model="sliderRangeValue" range style="max-width: 300px;" />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">DatePicker 日期选择器</h4>
          <el-date-picker v-model="dateValue" type="date" placeholder="选择日期" style="width: 300px;" />
          <div style="margin-top: 8px;">
            <el-date-picker
              v-model="dateRangeValue"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 300px;"
            />
          </div>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">TimePicker 时间选择器</h4>
          <el-time-picker v-model="timeValue" placeholder="选择时间" style="width: 300px;" />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">ColorPicker 颜色选择器</h4>
          <el-color-picker v-model="colorValue" show-alpha />
          <el-text style="margin-left: 12px;">{{ colorValue }}</el-text>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Badge 徽章 / Avatar 头像</h4>
          <div class="demo-row" style="align-items: center;">
            <el-badge :value="12">
              <el-button>消息</el-button>
            </el-badge>
            <el-badge :value="3" type="danger">
              <el-button>通知</el-button>
            </el-badge>
            <el-badge is-dot>
              <el-button>动态</el-button>
            </el-badge>
            <el-avatar> U </el-avatar>
            <el-avatar shape="square"> S </el-avatar>
          </div>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Progress 进度条</h4>
          <el-progress :percentage="progressValue" style="max-width: 300px;" />
          <el-progress :percentage="100" status="success" style="max-width: 300px; margin-top: 8px;" />
          <el-progress :percentage="50" status="exception" style="max-width: 300px; margin-top: 8px;" />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Alert 提示</h4>
          <el-alert title="成功提示" type="success" show-icon :closable="false" style="margin-bottom: 8px;" />
          <el-alert title="警告提示" type="warning" show-icon :closable="false" style="margin-bottom: 8px;" />
          <el-alert title="错误提示" type="error" show-icon :closable="false" />
        </div>
      </el-col>
    </el-row>

    <div class="demo-section">
      <h4 class="demo-title">Table 表格</h4>
      <el-table :data="tableData" border stripe style="width: 100%;">
        <el-table-column prop="name" label="名称" sortable />
        <el-table-column prop="type" label="分类" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="region" label="地区">
          <template #default="{ row }">
            <el-tag :type="row.region === '国内' ? 'success' : 'warning'" size="small">{{ row.region }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="demo-section">
      <h4 class="demo-title">Pagination 分页</h4>
      <el-pagination v-model:current-page="currentPage" :total="100" layout="total, prev, pager, next, jumper" />
    </div>

    <el-row :gutter="24">
      <el-col :xs="24" :sm="12">
        <div class="demo-section">
          <h4 class="demo-title">Message 消息 / Tooltip / Popconfirm</h4>
          <div class="demo-row">
            <el-button @click="showMessage('success')">成功消息</el-button>
            <el-button @click="showMessage('warning')">警告消息</el-button>
            <el-tooltip content="这是一段提示文字" placement="top">
              <el-button>悬停提示</el-button>
            </el-tooltip>
            <el-popconfirm title="确定删除这条数据吗？" confirm-button-text="确定" cancel-button-text="取消">
              <template #reference>
                <el-button type="danger" plain>删除确认</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Dropdown 下拉菜单</h4>
          <el-dropdown @command="handleDropdownCommand">
            <el-button type="primary">
              下拉菜单<span style="margin-left: 6px;">▼</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="选项一">选项一</el-dropdown-item>
                <el-dropdown-item command="选项二">选项二</el-dropdown-item>
                <el-dropdown-item command="选项三" divided>选项三</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Breadcrumb 面包屑</h4>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>组件示例</el-breadcrumb-item>
            <el-breadcrumb-item>中级组件</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Tabs 标签页</h4>
          <el-tabs v-model="innerTab" type="card">
            <el-tab-pane label="用户管理" name="first">用户管理面板内容</el-tab-pane>
            <el-tab-pane label="配置管理" name="second">配置管理面板内容</el-tab-pane>
            <el-tab-pane label="角色管理" name="third">角色管理面板内容</el-tab-pane>
          </el-tabs>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12">
        <div class="demo-section">
          <h4 class="demo-title">Collapse 折叠面板（手风琴）</h4>
          <el-collapse v-model="activeCollapse" accordion>
            <el-collapse-item title="一致性 Consistency" name="1">与现实生活一致，与流程逻辑一致。</el-collapse-item>
            <el-collapse-item title="反馈 Feedback" name="2">通过界面样式和交互动效让用户清晰感知操作。</el-collapse-item>
            <el-collapse-item title="效率 Efficiency" name="3">简化流程，界面简单直白。</el-collapse-item>
          </el-collapse>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Timeline 时间线</h4>
          <el-timeline style="max-width: 400px;">
            <el-timeline-item timestamp="2026-07-12" type="primary">新增组件示例页面</el-timeline-item>
            <el-timeline-item timestamp="2026-07-10" type="success">上线经典小游戏合集</el-timeline-item>
            <el-timeline-item timestamp="2026-07-08">项目初始化</el-timeline-item>
          </el-timeline>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Empty 空状态</h4>
          <el-empty description="暂无数据" :image-size="80" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>
