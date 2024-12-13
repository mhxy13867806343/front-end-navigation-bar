<template>
  <div class="form-designer">
    <div class="designer-header">
      <el-button type="primary" @click="previewForm">预览</el-button>
      <el-button type="success" @click="saveForm">保存</el-button>
      <el-button @click="clearForm">清空</el-button>
    </div>
    
    <div class="designer-container">
      <!-- 左侧组件列表 -->
      <div class="components-list">
        <div class="components-title">表单组件</div>
        <draggable
          :list="componentList"
          :group="{ name: 'form-items', pull: 'clone', put: false }"
          item-key="type"
          :clone="cloneComponent"
          @start="dragStart"
          @end="dragEnd"
        >
          <template #item="{ element }">
            <div class="component-item">
              <el-icon><component :is="element.icon" /></el-icon>
              <span>{{ element.label }}</span>
            </div>
          </template>
        </draggable>
      </div>

      <!-- 中间设计区域 -->
      <div class="design-area">
        <div class="design-title">表单设计</div>
        <el-form :model="formData" label-width="100px">
          <draggable
            v-model="formItems"
            group="form-items"
            item-key="id"
            class="form-container"
            @start="dragStart"
            @end="dragEnd"
          >
            <template #item="{ element, index }">
              <div
                class="form-item-wrapper"
                :class="{ 'is-active': currentItem?.id === element.id }"
                @click="selectItem(element)"
              >
                <div class="form-item-actions">
                  <i class="el-icon-delete" @click.stop="deleteItem(index)"></i>
                </div>
                <el-form-item :label="element.label">
                  <component
                    :is="getComponentType(element.type)"
                    v-model="formData[element.field]"
                    v-bind="element.props"
                  />
                </el-form-item>
              </div>
            </template>
          </draggable>
        </el-form>
      </div>

      <!-- 右侧属性面板 -->
      <div class="properties-panel" v-if="currentItem">
        <div class="properties-title">属性设置</div>
        <el-form label-position="top">
          <el-form-item label="标签名称">
            <el-input v-model="currentItem.label" />
          </el-form-item>
          <el-form-item label="字段名">
            <el-input v-model="currentItem.field" />
          </el-form-item>
          <el-form-item label="是否必填">
            <el-switch v-model="currentItem.props.required" />
          </el-form-item>
          <!-- 根据不同组件类型显示不同的属性设置 -->
          <template v-if="currentItem.type === 'input'">
            <el-form-item label="占位文本">
              <el-input v-model="currentItem.props.placeholder" />
            </el-form-item>
          </template>
          <template v-else-if="currentItem.type === 'select'">
            <el-form-item label="选项">
              <div v-for="(option, index) in currentItem.props.options" :key="index" class="option-item">
                <el-input v-model="option.label" placeholder="选项名" />
                <el-input v-model="option.value" placeholder="选项值" />
                <el-button type="danger" @click="removeOption(index)">删除</el-button>
              </div>
              <el-button type="primary" @click="addOption">添加选项</el-button>
            </el-form-item>
          </template>
        </el-form>
      </div>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="表单预览" width="60%">
      <dynamic-form-preview :form-items="formItems" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import draggable from 'vuedraggable/src/vuedraggable'
import { ElMessage, ElMessageBox, ElButton, ElForm, ElFormItem, ElInput, ElSwitch, ElDialog } from 'element-plus'
import DynamicFormPreview from './DynamicFormPreview.vue'
import { Edit, EditPen, Select, Check, List, Calendar } from '@element-plus/icons-vue'

// 可用的组件列表
const componentList = [
  {
    type: 'input',
    label: '单行文本',
    icon: Edit,
    props: {
      placeholder: '请输入',
      required: false
    }
  },
  {
    type: 'textarea',
    label: '多行文本',
    icon: EditPen,
    props: {
      placeholder: '请输入',
      required: false
    }
  },
  {
    type: 'select',
    label: '下拉选择',
    icon: Select,
    props: {
      placeholder: '请选择',
      required: false,
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' }
      ]
    }
  },
  {
    type: 'radio',
    label: '单选框组',
    icon: Check,
    props: {
      required: false,
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' }
      ]
    }
  },
  {
    type: 'checkbox',
    label: '多选框组',
    icon: List,
    props: {
      required: false,
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' }
      ]
    }
  },
  {
    type: 'date',
    label: '日期选择',
    icon: Calendar,
    props: {
      placeholder: '请选择日期',
      required: false
    }
  }
]

const formItems = ref([])
const formData = reactive({})
const currentItem = ref(null)
const previewVisible = ref(false)
let idCounter = 1

// 克隆组件
const cloneComponent = (item) => {
  const clone = JSON.parse(JSON.stringify(item))
  clone.id = idCounter++
  clone.field = `field_${clone.id}`
  return clone
}

// 拖拽相关
const dragStart = () => {
  // 开始拖拽时的处理
}

const dragEnd = () => {
  // 结束拖拽时的处理
}

// 选择当前编辑的组件
const selectItem = (item) => {
  currentItem.value = item
}

// 删除组件
const deleteItem = (index) => {
  formItems.value.splice(index, 1)
  if (currentItem.value && formItems.value.findIndex(item => item.id === currentItem.value.id) === -1) {
    currentItem.value = null
  }
}

// 添加选项
const addOption = () => {
  if (currentItem.value && currentItem.value.props.options) {
    currentItem.value.props.options.push({
      label: `选项${currentItem.value.props.options.length + 1}`,
      value: `${currentItem.value.props.options.length + 1}`
    })
  }
}

// 删除选项
const removeOption = (index) => {
  if (currentItem.value && currentItem.value.props.options) {
    currentItem.value.props.options.splice(index, 1)
  }
}

// 获取组件类型
const getComponentType = (type) => {
  const componentMap = {
    input: 'el-input',
    textarea: 'el-input',
    select: 'el-select',
    radio: 'el-radio-group',
    checkbox: 'el-checkbox-group',
    date: 'el-date-picker'
  }
  return componentMap[type] || 'el-input'
}

// 预览表单
const previewForm = () => {
  if (formItems.value.length === 0) {
    ElMessage.warning('请先添加表单项')
    return
  }
  previewVisible.value = true
}

// 保存表单
const saveForm = () => {
  if (formItems.value.length === 0) {
    ElMessage.warning('请先添加表单项')
    return
  }
  const formConfig = {
    items: formItems.value,
    timestamp: new Date().getTime()
  }
  localStorage.setItem('formConfig', JSON.stringify(formConfig))
  ElMessage.success('保存成功')
}

// 清空表单
const clearForm = () => {
  ElMessageBox.confirm('确定要清空所有表单项吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    formItems.value = []
    currentItem.value = null
    ElMessage.success('已清空')
  }).catch(() => {})
}

// 初始化时加载保存的表单配置
onMounted(() => {
  const savedConfig = localStorage.getItem('formConfig')
  if (savedConfig) {
    try {
      const { items } = JSON.parse(savedConfig)
      formItems.value = items
      idCounter = Math.max(...items.map(item => item.id)) + 1
    } catch (error) {
      console.error('加载保存的表单配置失败:', error)
    }
  }
})
</script>

<style scoped>
.form-designer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.designer-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  gap: 10px;
}

.designer-container {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  height: calc(100% - 70px);
  overflow: hidden;
}

.components-list {
  width: 250px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-bg-color-overlay);
}

.components-title {
  padding: 12px;
  font-weight: bold;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color-overlay);
}

.component-item {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: move;
  border-bottom: 1px solid var(--el-border-color-light);
}

.component-item:hover {
  background: var(--el-color-primary-light-9);
}

.design-area {
  flex: 1;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-bg-color-overlay);
  overflow-y: auto;
}

.design-title {
  padding: 12px;
  font-weight: bold;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color-overlay);
}

.form-container {
  padding: 20px;
  min-height: calc(100% - 45px);
}

.form-item-wrapper {
  position: relative;
  padding: 10px;
  border: 1px dashed transparent;
  border-radius: 4px;
}

.form-item-wrapper:hover,
.form-item-wrapper.is-active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.form-item-actions {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
}

.form-item-wrapper:hover .form-item-actions {
  display: flex;
  gap: 8px;
}

.properties-panel {
  width: 300px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-bg-color-overlay);
  overflow-y: auto;
}

.properties-title {
  padding: 12px;
  font-weight: bold;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color-overlay);
}

.option-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.el-icon {
  font-size: 18px;
}
</style>
