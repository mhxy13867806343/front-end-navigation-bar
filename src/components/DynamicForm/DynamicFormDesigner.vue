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
      <el-aside width="300px">
        <el-card class="property-panel">
          <template #header>
            <div class="panel-header">
              <span>属性设置</span>
            </div>
          </template>

          <template v-if="currentItem">
            <el-form label-position="top">
              <!-- 基础属性 -->
              <el-divider content-position="left">基础属性</el-divider>
              <el-form-item label="标签">
                <el-input v-model="currentItem.label" />
              </el-form-item>
              <el-form-item label="字段名">
                <el-input v-model="currentItem.field" />
              </el-form-item>
              <el-form-item label="必填">
                <el-switch v-model="currentItem.props.required" />
              </el-form-item>

              <!-- 特定组件属性 -->
              <template v-if="['input', 'textarea'].includes(currentItem.type)">
                <el-divider content-position="left">输入属性</el-divider>
                <el-form-item label="占位文本">
                  <el-input v-model="currentItem.props.placeholder" />
                </el-form-item>
                <el-form-item label="最大长度">
                  <el-input-number v-model="currentItem.props.maxlength" :min="1" />
                </el-form-item>
                <el-form-item label="显示字数统计">
                  <el-switch v-model="currentItem.props.showWordLimit" />
                </el-form-item>
              </template>

              <template v-if="currentItem.type === 'number'">
                <el-divider content-position="left">数字属性</el-divider>
                <el-form-item label="最小值">
                  <el-input-number 
                    v-model="currentItem.props.min"
                    :max="currentItem.props.max"
                  />
                </el-form-item>
                <el-form-item label="最大值">
                  <el-input-number 
                    v-model="currentItem.props.max"
                    :min="currentItem.props.min"
                  />
                </el-form-item>
                <el-form-item label="步长">
                  <el-input-number 
                    v-model="currentItem.props.step"
                    :min="0.000001"
                    :max="100"
                  />
                </el-form-item>
                <el-form-item label="精度">
                  <el-input-number 
                    v-model="currentItem.props.precision"
                    :min="0"
                    :max="20"
                  />
                </el-form-item>
              </template>

              <template v-if="currentItem.type === 'select'">
                <el-divider content-position="left">选项设置</el-divider>
                <el-form-item label="选项列表">
                  <div 
                    v-for="(option, optionIndex) in currentItem.props.options" 
                    :key="optionIndex"
                    class="option-item"
                  >
                    <el-input v-model="option.label" placeholder="选项文本" />
                    <el-input v-model="option.value" placeholder="选项值" />
                    <el-button 
                      type="danger" 
                      link 
                      :icon="Delete"
                      @click="removeOption(optionIndex)"
                    />
                  </div>
                  <el-button 
                    type="primary" 
                    link 
                    :icon="Plus"
                    @click="addOption"
                  >
                    添加选项
                  </el-button>
                </el-form-item>
              </template>
            </el-form>
          </template>
          <el-empty v-else description="请选择一个组件" />
        </el-card>
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
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import draggable from 'vuedraggable/src/vuedraggable'
import DynamicFormPreview from './DynamicFormPreview.vue'
import {
  Document,
  Edit,
  Select,
  Switch,
  Calendar,
  Timer,
  Upload,
  Picture,
  Link,
  Histogram,
  Delete,
  CopyDocument,
  ArrowUp,
  ArrowDown,
  Plus,
  Rank
} from '@element-plus/icons-vue'

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

const activeTab = ref('basic')
const formItems = ref([])
const formData = reactive({})
const currentItem = ref(null)
const previewVisible = ref(false)

// 处理设计区域的点击
const handleDesignAreaClick = (event) => {
  // 如果点击的是设计区域本身（而不是其中的组件），取消选中
  if (event.target.classList.contains('form-design-area')) {
    currentItem.value = null;
  }
}

// 克隆组件
const cloneComponent = (item) => {
  try {
    const newItem = JSON.parse(JSON.stringify(item))
    newItem.id = Date.now()
    newItem.field = `field_${newItem.id}`
    // 确保数字输入组件有正确的初始值
    if (newItem.type === 'number') {
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

// 选择组件
const selectItem = (item) => {
  currentItem.value = item
}

// 复制组件
const copyItem = (item) => {
  try {
    const newItem = cloneComponent(item)
    if (!newItem) return
    const index = formItems.value.findIndex(i => i.id === item.id)
    formItems.value.splice(index + 1, 0, newItem)
    currentItem.value = newItem
    ElMessage.success('复制成功')
  } catch (error) {
    console.error('复制组件失败:', error)
    ElMessage.error('复制失败')
  }
}

// 移动组件
const moveItem = (index, direction) => {
  try {
    if (direction === 'up' && index > 0) {
      const temp = formItems.value[index]
      formItems.value[index] = formItems.value[index - 1]
      formItems.value[index - 1] = temp
    } else if (direction === 'down' && index < formItems.value.length - 1) {
      const temp = formItems.value[index]
      formItems.value[index] = formItems.value[index + 1]
      formItems.value[index + 1] = temp
    }
  } catch (error) {
    console.error('移动组件失败:', error)
    ElMessage.error('移动失败')
  }
}

// 删除组件
const deleteItem = async (index) => {
  try {
    const result = await ElMessageBox.confirm(
      '确定要删除该组件吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).catch(() => false)

    if (result) {
      const item = formItems.value[index]
      formItems.value.splice(index, 1)
      if (currentItem.value?.id === item.id) {
        currentItem.value = null
      }
      ElMessage.success('删除成功')
    }
  } catch (error) {
    console.error('删除组件失败:', error)
    ElMessage.error('删除失败')
  }
}

// 清空表单
const clearForm = async () => {
  try {
    const result = await ElMessageBox.confirm(
      '确定要清空表单吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).catch(() => false)

    if (result) {
      formItems.value = []
      currentItem.value = null
      ElMessage.success('已清空')
    }
  } catch (error) {
    console.error('清空表单失败:', error)
    ElMessage.error('清空失败')
  }
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
  try {
    if (formItems.value.length === 0) {
      ElMessage.warning('请先添加表单组件')
      return
    }
    localStorage.setItem('formConfig', JSON.stringify(formItems.value))
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存表单失败:', error)
    ElMessage.error('保存失败')
  }
}

// 添加选项
const addOption = () => {
  if (!currentItem.value || !currentItem.value.props.options) return
  currentItem.value.props.options.push({
    label: `选项${currentItem.value.props.options.length + 1}`,
    value: `${currentItem.value.props.options.length + 1}`
  })
}

// 删除选项
const removeOption = (index) => {
  if (!currentItem.value || !currentItem.value.props.options) return
  currentItem.value.props.options.splice(index, 1)
}

// 获取组件类型
const getComponentType = (item) => {
  switch (item.type) {
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
    case 'upload':
      return 'el-upload'
    default:
      return 'el-input'
  }
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
  height: 100%;
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
</style>
