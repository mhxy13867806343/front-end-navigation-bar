<script setup lang="ts">

import { ElMessage } from 'element-plus'
import { User, Calendar as CalendarIcon, Clock, Search, Message } from '@element-plus/icons-vue'

type MessageType = 'success' | 'warning' | 'info' | 'error'

interface TableRow {
  name: string
  type: string
  price: string
  region: string
}

// ------ 表单控件 ------
const inputValue = ref<string>('')
const passwordValue = ref<string>('')
const textareaValue = ref<string>('')
const inputPrefixValue = ref<string>('')
const inputPrependValue = ref<string>('')

// v2.14.0 Input OTP 一次性密码
const otpValue = ref<string>('')

// v2.9.0 Input Tag 标签输入框
const inputTagValue = ref<string[]>(['Vite', 'Vue', 'Pinia'])

const selectValue = ref<string>('')
const selectMultipleValue = ref<string[]>([])
const selectOptions = [
  {
    label: '主流框架',
    options: [
      { value: 'vue', label: 'Vue.js' },
      { value: 'react', label: 'React.js' }
    ]
  },
  {
    label: '其他工具',
    options: [
      { value: 'vite', label: 'Vite' },
      { value: 'webpack', label: 'Webpack' }
    ]
  }
]

const cascaderValue = ref<string[]>([])
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

const inputNumberValue = ref<number>(3)
const radioValue = ref<string>('option1')
const radioButtonValue = ref<string>('beijing')
const radioBorderValue = ref<string>('shanghai')

const checkboxList = ref<string[]>(['vue'])
const checkboxBorderList = ref<string[]>(['vite'])

const switchValue = ref<boolean>(true)
const switchCustomValue = ref<boolean>(false)
const rateValue = ref<number>(4)
const sliderValue = ref<number>(35)
const sliderRangeValue = ref<[number, number]>([20, 70])
const dateValue = ref<string>('')
const dateRangeValue = ref<[Date, Date] | ''>('')
const timeValue = ref<string>('')
const colorValue = ref<string>('#409EFF')

// DatePicker shortcuts helper
const dateShortcuts = [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '昨天',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: '一周前',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
      return date
    },
  },
]

// ------ 数据展示 ------
const tableData: TableRow[] = [
  { name: 'DeepSeek', type: 'AI聊天助手', price: '免费', region: '国内' },
  { name: 'ChatGPT', type: 'AI聊天助手', price: '20$/月', region: '国外' },
  { name: 'Midjourney', type: 'AI绘画', price: '10$/月', region: '国外' },
  { name: '通义千问', type: 'AI聊天助手', price: '免费', region: '国内' }
]
const selectedTableRows = ref<TableRow[]>([])
const handleSelectionChange = (val: TableRow[]): void => {
  selectedTableRows.value = val
}

const currentPage = ref<number>(1)
const progressValue = ref<number>(75)
const activeCollapse = ref<string[]>(['1'])
const innerTab = ref<string>('first')

const showSkeleton = ref<boolean>(true)

const showMessage = (type: MessageType): void => {
  ElMessage({ message: `这是一条 ${type} 消息提示`, type })
}
const handleDropdownCommand = (command: string): void => {
  ElMessage.info(`点击了：${command}`)
}
</script>

<template>
  <div>
    <el-row :gutter="24">
      <!-- 左半部分 -->
      <el-col :xs="24" :sm="12">
        <!-- 1. Input 输入框 -->
        <div class="demo-section">
          <h4 class="demo-title">Input 输入框及复杂卡槽</h4>
          <el-input v-model="inputValue" placeholder="带清空按钮输入框" clearable style="max-width: 320px;" />
          <el-input v-model="passwordValue" type="password" placeholder="密码安全输入框" show-password style="max-width: 320px; margin-top: 8px;" />
          <el-input v-model="inputPrefixValue" placeholder="带图标前缀" :prefix-icon="User" style="max-width: 320px; margin-top: 8px;" />
          
          <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
            <el-input v-model="inputPrependValue" placeholder="请输入链接" style="max-width: 320px;">
              <template #prepend>https://</template>
              <template #append>.com</template>
            </el-input>
          </div>
          
          <el-input v-model="textareaValue" type="textarea" :rows="2" show-word-limit maxlength="100" placeholder="带字数统计文本域" style="max-width: 320px; margin-top: 8px;" />
        </div>

        <!-- 2. Input OTP 一次性密码 (v2.14.0 新组件) -->
        <div class="demo-section">
          <h4 class="demo-title">Input OTP 一次性验证码输入框</h4>
          <el-input-otp v-model="otpValue" :length="6" />
          <div style="margin-top: 8px; font-size: 12px; color: var(--el-text-color-regular);">
            当前输入验证码: <strong style="color: var(--el-color-primary);">{{ otpValue || '未输入' }}</strong>
          </div>
        </div>

        <!-- 3. Input Tag 标签输入框 (v2.9.0 新组件) -->
        <div class="demo-section">
          <h4 class="demo-title">Input Tag 标签输入框 (回车生成标签)</h4>
          <el-input-tag v-model="inputTagValue" placeholder="输入文字并回车" style="max-width: 320px;" />
        </div>

        <!-- 4. Select 选择器 -->
        <div class="demo-section">
          <h4 class="demo-title">Select 选择器 (分组/多选/折叠标签)</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <el-select v-model="selectValue" placeholder="分组选择器" clearable style="width: 320px;">
              <el-option-group v-for="group in selectOptions" :key="group.label" :label="group.label">
                <el-option v-for="opt in group.options" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-option-group>
            </el-select>

            <el-select v-model="selectMultipleValue" multiple collapse-tags collapse-tags-tooltip placeholder="多选折叠选择器" style="width: 320px;">
              <el-option-group v-for="group in selectOptions" :key="group.label" :label="group.label">
                <el-option v-for="opt in group.options" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-option-group>
            </el-select>
          </div>
        </div>

        <!-- 5. Cascader 级联选择器 -->
        <div class="demo-section">
          <h4 class="demo-title">Cascader 级联选择器</h4>
          <el-cascader v-model="cascaderValue" :options="cascaderOptions" placeholder="请选择分类技术栈" clearable style="width: 320px;" />
        </div>

        <!-- 6. InputNumber 数字输入框 -->
        <div class="demo-section">
          <h4 class="demo-title">InputNumber 数字步进器</h4>
          <el-input-number v-model="inputNumberValue" :min="1" :max="10" label="数字步进" />
        </div>

        <!-- 7. Radio 单选框 -->
        <div class="demo-section">
          <h4 class="demo-title">Radio 单选框组 (按钮/带边框)</h4>
          <el-radio-group v-model="radioValue">
            <el-radio value="option1">选项一</el-radio>
            <el-radio value="option2">选项二</el-radio>
          </el-radio-group>
          <div style="margin-top: 10px;">
            <el-radio-group v-model="radioButtonValue" size="small">
              <el-radio-button value="beijing">北京</el-radio-button>
              <el-radio-button value="shanghai">上海</el-radio-button>
              <el-radio-button value="hangzhou">杭州</el-radio-button>
            </el-radio-group>
          </div>
          <div style="margin-top: 10px;">
            <el-radio-group v-model="radioBorderValue">
              <el-radio value="shanghai" border>上海</el-radio>
              <el-radio value="beijing" border>北京</el-radio>
            </el-radio-group>
          </div>
        </div>

        <!-- 8. Checkbox 多选框 -->
        <div class="demo-section">
          <h4 class="demo-title">Checkbox 多选框 (带边框)</h4>
          <el-checkbox-group v-model="checkboxList">
            <el-checkbox value="vue">Vue</el-checkbox>
            <el-checkbox value="react">React</el-checkbox>
            <el-checkbox value="angular">Angular</el-checkbox>
          </el-checkbox-group>
          
          <div style="margin-top: 10px;">
            <el-checkbox-group v-model="checkboxBorderList">
              <el-checkbox value="vite" border>Vite</el-checkbox>
              <el-checkbox value="webpack" border>Webpack</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <!-- 9. Switch 开关 / Rate 评分 -->
        <div class="demo-section">
          <h4 class="demo-title">Switch 开关与颜色 / Rate 评分</h4>
          <div class="demo-row" style="align-items: center; gap: 20px;">
            <el-switch v-model="switchValue" active-text="开启" inactive-text="关闭" />
            <el-switch v-model="switchCustomValue" style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949;" />
          </div>
          <div style="margin-top: 12px;">
            <el-rate v-model="rateValue" allow-half show-score score-template="{value} 星级分" />
          </div>
        </div>
      </el-col>

      <!-- 右半部分 -->
      <el-col :xs="24" :sm="12">
        <!-- 10. Slider 滑块 -->
        <div class="demo-section">
          <h4 class="demo-title">Slider 滑块区间选值</h4>
          <el-slider v-model="sliderValue" style="max-width: 320px;" />
          <el-slider v-model="sliderRangeValue" range style="max-width: 320px;" />
        </div>

        <!-- 11. DatePicker 日期选择器 -->
        <div class="demo-section">
          <h4 class="demo-title">DatePicker 日期选择 (快捷选项)</h4>
          <el-date-picker v-model="dateValue" type="date" placeholder="选择日期" :shortcuts="dateShortcuts" style="width: 320px;" />
          <div style="margin-top: 8px;">
            <el-date-picker
              v-model="dateRangeValue"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 320px;"
            />
          </div>
        </div>

        <!-- 12. TimePicker 时间选择器 -->
        <div class="demo-section">
          <h4 class="demo-title">TimePicker 时间选择</h4>
          <el-time-picker v-model="timeValue" placeholder="任意时间点" :prefix-icon="Clock" style="width: 320px;" />
        </div>

        <!-- 13. ColorPicker 颜色选择器 -->
        <div class="demo-section">
          <h4 class="demo-title">ColorPicker 调色盘与透明度</h4>
          <el-color-picker v-model="colorValue" show-alpha />
          <el-text style="margin-left: 12px; font-weight: bold; color: var(--el-color-primary);">{{ colorValue }}</el-text>
        </div>

        <!-- 14. Badge 徽章 / Avatar 头像 -->
        <div class="demo-section">
          <h4 class="demo-title">Badge 状态徽章 (数字极限) / Avatar 头像</h4>
          <div class="demo-row" style="align-items: center; gap: 16px;">
            <el-badge :value="120" :max="99">
              <el-button size="small">消息盒子</el-button>
            </el-badge>
            <el-badge :value="3" type="danger">
              <el-button size="small">预警邮件</el-button>
            </el-badge>
            <el-badge is-dot>
              <el-icon><Message /></el-icon>
            </el-badge>
            
            <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <el-avatar shape="square" :size="30"> Admin </el-avatar>
          </div>
        </div>

        <!-- 15. Progress 进度条 (环形/仪表盘) -->
        <div class="demo-section">
          <h4 class="demo-title">Progress 进度条 (多形态环形图)</h4>
          <el-progress :percentage="progressValue" style="max-width: 320px; margin-bottom: 8px;" />
          <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
            <el-progress type="circle" :percentage="progressValue" :width="80" />
            <el-progress type="dashboard" :percentage="progressValue" :width="80" status="success" />
          </div>
        </div>

        <!-- 16. Skeleton 骨架屏 (加载占位) -->
        <div class="demo-section">
          <h4 class="demo-title">Skeleton 骨架屏 (状态加载中占位)</h4>
          <div style="margin-bottom: 8px;">
            <el-switch v-model="showSkeleton" active-text="骨架占位" inactive-text="真实数据" />
          </div>
          <el-skeleton :rows="3" animated :loading="showSkeleton">
            <template #default>
              <div style="font-size: 13px; line-height: 1.6; color: var(--el-text-color-regular);">
                💡 <b>数据已加载完毕：</b> 这里的真实表单数据在骨架遮罩关闭后才会渲染展现。
              </div>
            </template>
          </el-skeleton>
        </div>

        <!-- 17. Result 结果 (成功/失败状态) -->
        <div class="demo-section">
          <h4 class="demo-title">Result 结果反馈看板</h4>
          <el-result icon="success" title="任务提交成功" sub-title="您的修改已推送至仓库" style="padding: 10px 0;">
            <template #extra>
              <el-button type="primary" size="small">继续操作</el-button>
            </template>
          </el-result>
        </div>

        <!-- 18. Alert 提示 -->
        <div class="demo-section">
          <h4 class="demo-title">Alert 警告提示框</h4>
          <el-alert title="数据更新成功" type="success" description="系统核心缓存已同步更新成功。" show-icon :closable="false" style="margin-bottom: 8px;" />
          <el-alert title="网络环境提示" type="warning" description="检测到跨域资源代理连接延迟过高。" show-icon :closable="false" style="margin-bottom: 8px;" />
          <el-alert title="安全中心拦截" type="error" description="目标IP涉嫌恶意攻击或爬虫，已被封禁。" show-icon :closable="false" />
        </div>
      </el-col>
    </el-row>

    <!-- 19. Table 表格与批量选择 -->
    <div class="demo-section">
      <h4 class="demo-title">Table 表格 (带首列勾选/排序/斑马线)</h4>
      <el-table :data="tableData" border stripe style="width: 100%;" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="名称" sortable />
        <el-table-column prop="type" label="分类" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="region" label="地区">
          <template #default="{ row }">
            <el-tag :type="row.region === '国内' ? 'success' : 'warning'" size="small">{{ row.region }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="selectedTableRows.length > 0" style="margin-top: 12px; font-size: 13px; color: var(--el-text-color-regular);">
        已勾选行数: <strong>{{ selectedTableRows.length }}</strong> （首行名称为: {{ selectedTableRows[0]?.name }}）
      </div>
    </div>

    <!-- 20. Pagination 分页 -->
    <div class="demo-section">
      <h4 class="demo-title">Pagination 数据分页器</h4>
      <el-pagination v-model:current-page="currentPage" :total="100" layout="total, sizes, prev, pager, next, jumper" />
    </div>

    <el-row :gutter="24">
      <el-col :xs="24" :sm="12">
        <!-- 21. Tooltip / Popconfirm -->
        <div class="demo-section">
          <h4 class="demo-title">Message 消息反馈 / Tooltip / Popconfirm</h4>
          <div class="demo-row" style="flex-wrap: wrap; gap: 8px;">
            <el-button @click="showMessage('success')">成功消息</el-button>
            <el-button @click="showMessage('warning')">警告消息</el-button>
            <el-tooltip content="Vite 4.0 热重载技术" placement="top" effect="dark">
              <el-button>悬停提示</el-button>
            </el-tooltip>
            <el-popconfirm title="确定彻底清空这些记录吗？" confirm-button-text="确定" cancel-button-text="取消">
              <template #reference>
                <el-button type="danger" plain>删除确认</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>

        <!-- 22. Dropdown 下拉菜单 -->
        <div class="demo-section">
          <h4 class="demo-title">Dropdown 属性菜单</h4>
          <el-dropdown @command="handleDropdownCommand">
            <el-button type="primary">
              下拉菜单<span style="margin-left: 6px;">▼</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="管理员设置">管理员设置</el-dropdown-item>
                <el-dropdown-item command="修改密码">修改密码</el-dropdown-item>
                <el-dropdown-item command="退出登录" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 23. Breadcrumb 面包屑 -->
        <div class="demo-section">
          <h4 class="demo-title">Breadcrumb 路径导航</h4>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>组件示例</el-breadcrumb-item>
            <el-breadcrumb-item>中级模块</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <!-- 24. Tabs 标签页 -->
        <div class="demo-section">
          <h4 class="demo-title">Tabs 选项卡面板</h4>
          <el-tabs v-model="innerTab" type="card">
            <el-tab-pane label="用户管理" name="first">用户管理面板内容</el-tab-pane>
            <el-tab-pane label="配置管理" name="second">配置管理面板内容</el-tab-pane>
            <el-tab-pane label="角色管理" name="third">角色管理面板内容</el-tab-pane>
          </el-tabs>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12">
        <!-- 25. Collapse 折叠面板 -->
        <div class="demo-section">
          <h4 class="demo-title">Collapse 折叠面板（手风琴）</h4>
          <el-collapse v-model="activeCollapse" accordion>
            <el-collapse-item title="系统一致性 Consistency" name="1">与现实物理规则一致，与后端验证逻辑一致。</el-collapse-item>
            <el-collapse-item title="即时反馈 Feedback" name="2">通过界面轻量交互与微动效让用户清晰感知控制行为。</el-collapse-item>
            <el-collapse-item title="效率最大化 Efficiency" name="3">简化高频流程，界面简洁直白，极力缩短交互阻碍。</el-collapse-item>
          </el-collapse>
        </div>

        <!-- 26. Timeline 时间线 -->
        <div class="demo-section">
          <h4 class="demo-title">Timeline 时间轴进程线</h4>
          <el-timeline style="max-width: 400px;">
            <el-timeline-item timestamp="2026-07-14" type="danger">发布 100+ 在线组件演示</el-timeline-item>
            <el-timeline-item timestamp="2026-07-12" type="primary">重构侧边栏上拉快捷菜单</el-timeline-item>
            <el-timeline-item timestamp="2026-07-10" type="success">上线经典小游戏及沙盒工具</el-timeline-item>
          </el-timeline>
        </div>

        <!-- 27. Empty 空状态 -->
        <div class="demo-section">
          <h4 class="demo-title">Empty 缺省空状态</h4>
          <el-empty description="未检索到满足条件的数据项" :image-size="80" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>
