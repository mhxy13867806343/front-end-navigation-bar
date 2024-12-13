<template>
  <div class="dynamic-form-designer">
    <el-container>
      <!-- 左侧组件列表 -->
      <el-aside width="250px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基础组件" name="basic">
            <div class="components-list">
              <draggable
                :list="basicComponents"
                :group="{ name: 'form-items', pull: 'clone', put: false }"
                :sort="false"
                :clone="cloneComponent"
                item-key="type"
              >
                <template #item="{ element }">
                  <div 
                    class="component-item"
                    @click="addComponent(element)"
                  >
                    <el-icon>
                      <component :is="element.icon" />
                    </el-icon>
                    <span>{{ element.label }}</span>
                  </div>
                </template>
              </draggable>
            </div>
          </el-tab-pane>
          <el-tab-pane label="高级组件" name="advanced">
            <div class="components-list">
              <draggable
                :list="advancedComponents"
                :group="{ name: 'form-items', pull: 'clone', put: false }"
                :sort="false"
                :clone="cloneComponent"
                item-key="type"
              >
                <template #item="{ element }">
                  <div 
                    class="component-item"
                    @click="addComponent(element)"
                  >
                    <el-icon>
                      <component :is="element.icon" />
                    </el-icon>
                    <span>{{ element.label }}</span>
                  </div>
                </template>
              </draggable>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-aside>

      <!-- 中间设计区域 -->
      <el-main>
        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span>表单设计</span>
              <div class="header-actions">
                <el-button type="primary" @click="previewForm">预览</el-button>
                <el-button type="success" @click="saveForm">保存</el-button>
                <el-button @click="clearForm">清空</el-button>
              </div>
            </div>
          </template>

          <div class="form-design-area" @click.stop="handleDesignAreaClick">
            <draggable
              v-model="formItems"
              :group="{ name: 'form-items', pull: true, put: true }"
              item-key="id"
              :animation="200"
              class="form-items-container"
              :class="{ 'is-empty': formItems.length === 0 }"
            >
              <template #header v-if="formItems.length === 0">
                <div class="empty-placeholder">
                  <el-empty description="从左侧拖入或点击添加组件" />
                </div>
              </template>
              
              <template #item="{ element, index }">
                <div
                  class="form-item-wrapper"
                  :class="{ 'is-selected': currentItem?.id === element.id }"
                  @click.stop="selectItem(element)"
                >
                  <div class="form-item-actions">
                    <el-button-group>
                      <el-button 
                        type="primary" 
                        link 
                        :icon="CopyDocument"
                        @click.stop="copyItem(element)"
                      />
                      <el-button 
                        type="danger" 
                        link 
                        :icon="Delete"
                        @click.stop="deleteItem(index)"
                      />
                    </el-button-group>
                  </div>

                  <component
                    :is="getComponentType(element)"
                    v-model="formData[element.field]"
                    v-bind="element.props"
                    :label="element.label"
                  />
                </div>
              </template>
            </draggable>
          </div>
        </el-card>
      </el-main>

      <!-- 右侧属性面板 -->
      <el-aside width="300px" class="property-panel">
        <el-card v-if="currentItem">
          <template #header>
            <div class="panel-header">
              <span>属性设置</span>
            </div>
          </template>

          <el-tabs>
            <!-- 基础属性 -->
            <el-tab-pane label="基础属性">
              <el-form label-position="top">
                <el-form-item label="标签">
                  <el-input v-model="currentItem.label" />
                </el-form-item>
                <el-form-item label="字段名">
                  <el-input v-model="currentItem.field" />
                </el-form-item>
                <el-form-item label="占位文本">
                  <el-input v-model="currentItem.props.placeholder" />
                </el-form-item>
                <el-form-item>
                  <el-checkbox v-model="currentItem.props.required">必填</el-checkbox>
                  <el-checkbox v-model="currentItem.props.clearable">可清除</el-checkbox>
                  <el-checkbox v-model="currentItem.props.disabled">禁用</el-checkbox>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 样式设置 -->
            <el-tab-pane label="样式设置">
              <el-form label-position="top">
                <!-- 尺寸 -->
                <el-form-item label="尺寸">
                  <el-radio-group v-model="currentItem.props.size">
                    <el-radio-button label="large">大</el-radio-button>
                    <el-radio-button label="default">中</el-radio-button>
                    <el-radio-button label="small">小</el-radio-button>
                  </el-radio-group>
                </el-form-item>

                <!-- 宽度设置 -->
                <el-form-item label="宽度">
                  <el-input-number 
                    v-model="currentItem.style.width" 
                    :min="0" 
                    :max="100"
                    :step="10"
                  >
                    <template #suffix>%</template>
                  </el-input-number>
                </el-form-item>

                <!-- 文字颜色 -->
                <el-form-item label="文字颜色">
                  <el-color-picker v-model="currentItem.style.color" />
                </el-form-item>

                <!-- 背景颜色 -->
                <el-form-item label="背景颜色">
                  <el-color-picker v-model="currentItem.style.backgroundColor" />
                </el-form-item>

                <!-- 边框样式 -->
                <el-form-item label="边框">
                  <el-select v-model="currentItem.style.borderStyle">
                    <el-option label="无" value="none" />
                    <el-option label="实线" value="solid" />
                    <el-option label="虚线" value="dashed" />
                    <el-option label="点线" value="dotted" />
                  </el-select>
                  <el-color-picker v-model="currentItem.style.borderColor" />
                </el-form-item>

                <!-- 圆角 -->
                <el-form-item label="圆角">
                  <el-input-number 
                    v-model="currentItem.style.borderRadius" 
                    :min="0" 
                    :max="20"
                  >
                    <template #suffix>px</template>
                  </el-input-number>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 高级设置 -->
            <el-tab-pane label="高级设置">
              <el-form label-position="top">
                <!-- 动画效果 -->
                <el-form-item label="动画效果">
                  <el-select v-model="currentItem.animation.type">
                    <el-option label="无" value="none" />
                    <el-option label="淡入淡出" value="fade" />
                    <el-option label="滑动" value="slide" />
                    <el-option label="弹性" value="bounce" />
                  </el-select>
                  <el-input-number 
                    v-model="currentItem.animation.duration" 
                    :min="0" 
                    :max="2000"
                    :step="100"
                  >
                    <template #suffix>ms</template>
                  </el-input-number>
                </el-form-item>

                <!-- 事件处理 -->
                <el-form-item label="点击事件">
                  <el-select v-model="currentItem.events.click.type">
                    <el-option label="无" value="none" />
                    <el-option label="页面跳转" value="navigate" />
                    <el-option label="打开链接" value="link" />
                    <el-option label="自定义函数" value="function" />
                  </el-select>
                  <el-input 
                    v-if="currentItem.events.click.type !== 'none'"
                    v-model="currentItem.events.click.value"
                    :placeholder="getEventPlaceholder(currentItem.events.click.type)"
                  />
                </el-form-item>

                <!-- 验证规则 -->
                <el-form-item label="验证规则">
                  <el-checkbox v-model="currentItem.validation.required">必填</el-checkbox>
                  <el-input 
                    v-if="currentItem.validation.required"
                    v-model="currentItem.validation.message"
                    placeholder="必填提示文字"
                  />
                  <el-select 
                    v-model="currentItem.validation.pattern"
                    placeholder="选择验证规则"
                  >
                    <el-option label="无" value="" />
                    <el-option label="邮箱" value="email" />
                    <el-option label="手机号" value="phone" />
                    <el-option label="URL" value="url" />
                    <el-option label="自定义正则" value="custom" />
                  </el-select>
                  <el-input 
                    v-if="currentItem.validation.pattern === 'custom'"
                    v-model="currentItem.validation.regex"
                    placeholder="输入正则表达式"
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
        <el-empty v-else description="请选择一个组件" />
      </el-aside>
    </el-container>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="表单预览"
      width="60%"
      destroy-on-close
    >
      <DynamicFormPreview
        :form-items="formItems"
        v-if="previewVisible"
      />
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Delete, Plus, CopyDocument } from '@element-plus/icons-vue'
import {
  Document,
  Edit,
  Select,
  Calendar,
  Timer,
  Upload,
  Histogram
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import { ElMessage } from 'element-plus'
import DynamicFormPreview from './DynamicFormPreview.vue'

const formItems = ref([])
const currentItem = ref(null)
const previewVisible = ref(false)
const formData = reactive({})
const activeTab = ref('basic')

// 基础组件列表
const basicComponents = reactive([
  {
    type: 'input',
    label: '单行文本',
    icon: 'Document',
    props: {
      placeholder: '请输入',
      clearable: true,
      maxlength: 50,
      showWordLimit: false
    }
  },
  {
    type: 'textarea',
    label: '多行文本',
    icon: 'Edit',
    props: {
      placeholder: '请输入',
      clearable: true,
      maxlength: 200,
      showWordLimit: false,
      autosize: { minRows: 2, maxRows: 4 }
    }
  },
  {
    type: 'number',
    label: '数字输入',
    icon: 'Histogram',
    props: {
      min: 0,
      max: 100,
      step: 1,
      precision: 0,
      controls: true,
      placeholder: '请输入数字'
    }
  },
  {
    type: 'select',
    label: '下拉选择',
    icon: 'Select',
    props: {
      placeholder: '请选择',
      clearable: true,
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' }
      ]
    }
  }
])

// 高级组件列表
const advancedComponents = reactive([
  {
    type: 'date',
    label: '日期选择',
    icon: 'Calendar',
    props: {
      placeholder: '请选择日期',
      clearable: true,
      type: 'date'
    }
  },
  {
    type: 'time',
    label: '时间选择',
    icon: 'Timer',
    props: {
      placeholder: '请选择时间',
      clearable: true
    }
  },
  {
    type: 'upload',
    label: '文件上传',
    icon: 'Upload',
    props: {
      action: '',
      multiple: false,
      accept: ''
    }
  }
])

// 克隆组件
const cloneComponent = (component) => {
  try {
    const newItem = JSON.parse(JSON.stringify(component))
    newItem.id = Date.now().toString()
    newItem.field = `field_${newItem.id}`
    
    // 添加默认配置
    const defaultProps = getDefaultProps(component.type)
    newItem.style = defaultProps.style
    newItem.animation = defaultProps.animation
    newItem.events = defaultProps.events
    newItem.validation = defaultProps.validation
    
    // 合并组件特定的属性
    newItem.props = {
      ...defaultProps.props,
      ...component.props
    }
    
    // 确保数字输入组件有正确的初始值
    if (component.type === 'number') {
      newItem.props = {
        ...newItem.props,
        modelValue: Number(newItem.props.min || 0),
        min: Number(newItem.props.min || 0),
        max: Number(newItem.props.max || 100),
        step: Number(newItem.props.step || 1),
        precision: Number(newItem.props.precision || 0)
      }
    }
    
    return newItem
  } catch (error) {
    console.error('克隆组件失败:', error)
    return null
  }
}

// 添加组件
const addComponent = (component) => {
  try {
    const newItem = cloneComponent(component)
    if (!newItem) return
    
    formItems.value.push(newItem)
    currentItem.value = newItem
    ElMessage.success('添加成功')
  } catch (error) {
    console.error('添加组件失败:', error)
    ElMessage.error('添加失败')
  }
}

// 复制组件
const copyItem = (item) => {
  const newItem = cloneComponent(item)
  if (!newItem) return
  
  formItems.value.push(newItem)
  currentItem.value = newItem
}

// 删除组件
const deleteItem = (index) => {
  formItems.value.splice(index, 1)
  if (currentItem.value && currentItem.value.id === formItems.value[index]?.id) {
    currentItem.value = null
  }
}

// 选择组件
const selectItem = (item) => {
  currentItem.value = item
}

// 预览表单
const previewForm = () => {
  if (formItems.value.length === 0) {
    ElMessage.warning('请先添加表单组件')
    return
  }
  previewVisible.value = true
}

// 保存表单
const saveForm = () => {
  if (formItems.value.length === 0) {
    ElMessage.warning('请先添加表单组件')
    return
  }
  console.log('保存表单配置：', formItems.value)
  ElMessage.success('保存成功')
}

// 清空表单
const clearForm = () => {
  formItems.value = []
  currentItem.value = null
  ElMessage.success('已清空表单')
}

// 处理设计区域的点击
const handleDesignAreaClick = (event) => {
  if (event.target.classList.contains('form-design-area')) {
    currentItem.value = null
  }
}

// 获取组件类型
const getComponentType = (element) => {
  switch (element.type) {
    case 'input':
      return 'el-input'
    case 'textarea':
      return 'el-input'
    case 'number':
      return 'el-input-number'
    case 'select':
      return 'el-select'
    case 'date':
      return 'el-date-picker'
    case 'time':
      return 'el-time-picker'
    case 'radio':
      return 'el-radio-group'
    case 'checkbox':
      return 'el-checkbox-group'
    case 'switch':
      return 'el-switch'
    case 'slider':
      return 'el-slider'
    case 'rate':
      return 'el-rate'
    case 'upload':
      return 'el-upload'
    default:
      return 'el-input'
  }
}

// 初始化组件时的默认配置
const getDefaultProps = (type) => {
  const commonProps = {
    placeholder: '',
    required: false,
    clearable: true,
    disabled: false,
    size: 'default'
  }

  const commonStyle = {
    width: 100,
    color: '',
    backgroundColor: '',
    borderStyle: 'solid',
    borderColor: '',
    borderRadius: 4
  }

  const commonAnimation = {
    type: 'none',
    duration: 300
  }

  const commonEvents = {
    click: {
      type: 'none',
      value: ''
    }
  }

  const commonValidation = {
    required: false,
    message: '',
    pattern: '',
    regex: ''
  }

  // 根据组件类型添加特定属性
  const specificProps = {
    input: {
      maxlength: undefined,
      showWordLimit: false,
      type: 'text'
    },
    textarea: {
      maxlength: undefined,
      showWordLimit: false,
      autosize: { minRows: 2, maxRows: 4 }
    },
    number: {
      min: 0,
      max: 100,
      step: 1,
      precision: 0,
      controls: true
    },
    select: {
      options: [],
      multiple: false,
      filterable: false
    }
  }

  return {
    props: { ...commonProps, ...(specificProps[type] || {}) },
    style: { ...commonStyle },
    animation: { ...commonAnimation },
    events: { ...commonEvents },
    validation: { ...commonValidation }
  }
}

// 获取事件占位符文本
const getEventPlaceholder = (type) => {
  const placeholders = {
    navigate: '输入路由路径，如 /home',
    link: '输入URL地址',
    function: '输入函数名称'
  }
  return placeholders[type] || ''
}

// 获取组件显示标签
const getComponentLabel = (type) => {
  const labels = {
    input: '输入框',
    textarea: '多行文本',
    number: '数字输入',
    select: '下拉选择',
    date: '日期选择',
    time: '时间选择',
    radio: '单选框',
    checkbox: '复选框',
    switch: '开关',
    slider: '滑块',
    rate: '评分',
    upload: '上传'
  }
  return labels[type] || type
}
</script>

<style scoped>
.dynamic-form-designer {
  height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.el-container {
  height: calc(100% - 40px);
}

.el-aside {
  background-color: #fff;
  border-radius: 4px;
  margin: 0 10px;
}

.components-list {
  padding: 10px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.component-item:hover {
  background-color: #f5f7fa;
  border-color: var(--el-color-primary);
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.component-item:active {
  transform: translateY(0);
}

.form-card {
  height: 100%;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-design-area {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  min-height: 400px;
  overflow-y: auto;
}

.form-items-container {
  min-height: 400px;
  padding: 10px;
}

.form-items-container.is-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
}

.empty-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-item-wrapper {
  position: relative;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s;
}

.form-item-wrapper:hover {
  border-color: var(--el-color-primary);
}

.form-item-wrapper.is-selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
}

.form-item-actions {
  position: absolute;
  right: 8px;
  top: 8px;
  display: none;
}

.form-item-wrapper:hover .form-item-actions {
  display: block;
}

.property-panel {
  border-left: 1px solid #dcdfe6;
  background-color: #fff;
  overflow-y: auto;
}

.panel-header {
  font-weight: bold;
}

.option-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

:deep(.el-form-item__label) {
  font-weight: bold;
}

:deep(.el-divider__text) {
  font-size: 14px;
  font-weight: bold;
}

:deep(.el-tabs__content) {
  padding: 15px 0;
}

:deep(.el-color-picker) {
  width: 100%;
}
</style>
