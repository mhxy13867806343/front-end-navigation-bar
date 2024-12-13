<template>
  <div class="dynamic-form-designer">
    <el-container>
      <!-- 左侧组件列表 -->
      <el-aside width="250px">
        <el-tabs v-model="activeComponentType">
          <el-tab-pane label="基础组件" name="基础组件">
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
                    :class="{ 'is-selected': currentItem?.type === element.type }"
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
          <el-tab-pane label="高级组件" name="高级组件">
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
                    :class="{ 'is-selected': currentItem?.type === element.type }"
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
                <el-button 
                  type="primary" 
                  @click="handlePreview"
                  :disabled="isFormEmpty"
                >
                  <el-icon><View /></el-icon>
                  预览
                </el-button>
                <el-button 
                  type="success" 
                  @click="handleSave"
                  :disabled="isFormEmpty"
                >
                  <el-icon><Download /></el-icon>
                  保存
                </el-button>
                <el-button 
                  @click="handleClear"
                  :disabled="isFormEmpty"
                >
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
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
                    v-bind="element.props"
                    :label="element.label"
                  >
                    <!-- 按钮特殊处理 -->
                    <template v-if="element.type === 'button'">
                      {{ element.props.text }}
                    </template>
                    <!-- 选项组件处理 -->
                    <template v-else-if="['select', 'radio', 'checkbox'].includes(element.type)">
                      <component
                        :is="element.type === 'select' ? 'el-option' : element.type === 'radio' ? 'el-radio' : 'el-checkbox'"
                        v-for="option in element.props.options"
                        :key="option.value"
                        :label="option.value"
                      >
                        {{ option.label }}
                      </component>
                    </template>
                  </component>
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

          <el-tabs v-model="activeTab">
            <!-- 基础属性 -->
            <el-tab-pane label="基础属性" name="基础属性">
              <el-form label-position="top" size="small">
                <el-form-item label="组件名称">
                  <el-input v-model="currentItem.label" />
                </el-form-item>
                <el-form-item label="字段标识">
                  <el-input v-model="currentItem.field" />
                </el-form-item>
                
                <!-- 按钮特有属性 -->
                <template v-if="currentItem.type === 'button'">
                  <el-divider>按钮属性</el-divider>
                  <el-form-item label="按钮文本">
                    <el-input v-model="currentItem.props.text" />
                  </el-form-item>
                  <el-form-item label="按钮类型">
                    <el-radio-group 
                      v-model="currentItem.props.buttonType"
                      @change="handleButtonTypeChange"
                    >
                      <el-radio-button label="主要按钮">主要</el-radio-button>
                      <el-radio-button label="成功按钮">成功</el-radio-button>
                      <el-radio-button label="警告按钮">警告</el-radio-button>
                      <el-radio-button label="危险按钮">危险</el-radio-button>
                      <el-radio-button label="信息按钮">信息</el-radio-button>
                      <el-radio-button label="自定义">自定义</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                  <template v-if="currentItem.props.buttonType === '自定义'">
                    <el-divider>自定义样式</el-divider>
                    <el-form-item label="宽度">
                      <el-input v-model="currentItem.style.width" />
                    </el-form-item>
                    <el-form-item label="背景颜色">
                      <el-color-picker v-model="currentItem.style.backgroundColor" />
                    </el-form-item>
                    <el-form-item label="文字颜色">
                      <el-color-picker v-model="currentItem.style.color" />
                    </el-form-item>
                    <el-form-item label="边框样式">
                      <el-select v-model="currentItem.style.borderStyle">
                        <el-option label="无边框" value="none" />
                        <el-option label="实线" value="solid" />
                        <el-option label="虚线" value="dashed" />
                        <el-option label="点线" value="dotted" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="边框颜色" v-if="currentItem.style.borderStyle !== 'none'">
                      <el-color-picker v-model="currentItem.style.borderColor" />
                    </el-form-item>
                    <el-form-item label="圆角">
                      <el-slider 
                        v-model="currentItem.style.borderRadius" 
                        :min="0" 
                        :max="20"
                        :step="1"
                      />
                    </el-form-item>
                    <el-form-item label="字体大小">
                      <el-input-number 
                        v-model="currentItem.style.fontSize" 
                        :min="12" 
                        :max="30"
                        :step="1"
                      />
                    </el-form-item>
                  </template>
                </template>

                <!-- 输入框特有属性 -->
                <template v-else-if="currentItem.type === 'input'">
                  <el-divider>输入属性</el-divider>
                  <el-form-item label="占位提示">
                    <el-input v-model="currentItem.props.placeholder" />
                  </el-form-item>
                  <el-form-item label="默认值">
                    <el-input v-model="currentItem.props.defaultValue" />
                  </el-form-item>
                  <el-form-item label="最大长度">
                    <el-input-number v-model="currentItem.props.maxlength" :min="0" />
                  </el-form-item>
                </template>

                <!-- 数字输入框特有属性 -->
                <template v-else-if="currentItem.type === 'number'">
                  <el-divider>数字属性</el-divider>
                  <el-form-item label="最小值">
                    <el-input-number v-model="currentItem.props.min" />
                  </el-form-item>
                  <el-form-item label="最大值">
                    <el-input-number v-model="currentItem.props.max" />
                  </el-form-item>
                  <el-form-item label="步长">
                    <el-input-number v-model="currentItem.props.step" :min="0" :precision="2" />
                  </el-form-item>
                </template>

                <!-- 选择器特有属性 -->
                <template v-else-if="currentItem.type === 'select'">
                  <el-divider>选择属性</el-divider>
                  <el-form-item label="选项列表">
                    <div v-for="(option, index) in currentItem.props.options" :key="index" class="option-item">
                      <el-input v-model="option.label" placeholder="选项名" class="option-label" />
                      <el-input v-model="option.value" placeholder="选项值" class="option-value" />
                      <el-button type="danger" link @click="currentItem.props.options.splice(index, 1)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                    <el-button type="primary" link @click="currentItem.props.options.push({ label: '', value: '' })">
                      添加选项
                    </el-button>
                  </el-form-item>
                  <el-form-item>
                    <el-checkbox v-model="currentItem.props.multiple">允许多选</el-checkbox>
                  </el-form-item>
                </template>

                <!-- 单选框组特有属性 -->
                <template v-else-if="currentItem.type === 'radio'">
                  <el-divider>单选属性</el-divider>
                  <el-form-item label="选项列表">
                    <div v-for="(option, index) in currentItem.props.options" :key="index" class="option-item">
                      <el-input v-model="option.label" placeholder="选项名" class="option-label" />
                      <el-input v-model="option.value" placeholder="选项值" class="option-value" />
                      <el-button type="danger" link @click="currentItem.props.options.splice(index, 1)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                    <el-button type="primary" link @click="currentItem.props.options.push({ label: '', value: '' })">
                      添加选项
                    </el-button>
                  </el-form-item>
                </template>

                <!-- 多选框组特有属性 -->
                <template v-else-if="currentItem.type === 'checkbox'">
                  <el-divider>多选属性</el-divider>
                  <el-form-item label="选项列表">
                    <div v-for="(option, index) in currentItem.props.options" :key="index" class="option-item">
                      <el-input v-model="option.label" placeholder="选项名" class="option-label" />
                      <el-input v-model="option.value" placeholder="选项值" class="option-value" />
                      <el-button type="danger" link @click="currentItem.props.options.splice(index, 1)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                    <el-button type="primary" link @click="currentItem.props.options.push({ label: '', value: '' })">
                      添加选项
                    </el-button>
                  </el-form-item>
                  <el-form-item label="最少选择">
                    <el-input-number v-model="currentItem.props.min" :min="0" />
                  </el-form-item>
                  <el-form-item label="最多选择">
                    <el-input-number v-model="currentItem.props.max" :min="0" />
                  </el-form-item>
                </template>

                <!-- 公共属性 -->
                <el-divider>基础设置</el-divider>
                <el-form-item>
                  <el-checkbox v-model="currentItem.props.required">必填</el-checkbox>
                  <el-checkbox v-model="currentItem.props.disabled">禁用</el-checkbox>
                  <el-checkbox v-model="currentItem.props.clearable" v-if="['input', 'number', 'select'].includes(currentItem.type)">
                    可清除
                  </el-checkbox>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 样式设置 -->
            <el-tab-pane label="样式设置" name="样式设置">
              <el-form label-position="top" size="small">
                <el-form-item label="组件大小">
                  <el-radio-group v-model="currentItem.props.size">
                    <el-radio-button label="large">大号</el-radio-button>
                    <el-radio-button label="default">默认</el-radio-button>
                    <el-radio-button label="small">小号</el-radio-button>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="宽度设置">
                  <el-input-number 
                    v-model="currentItem.style.width" 
                    :min="0" 
                    :max="100"
                    :step="10"
                  >
                    <template #suffix>%</template>
                  </el-input-number>
                </el-form-item>

                <el-form-item label="外边距">
                  <el-input-number 
                    v-model="currentItem.style.marginBottom" 
                    :min="0"
                    :max="100"
                  >
                    <template #suffix>px</template>
                  </el-input-number>
                </el-form-item>

                <el-form-item label="文字颜色">
                  <el-color-picker v-model="currentItem.style.color" />
                </el-form-item>

                <el-form-item label="背景颜色">
                  <el-color-picker v-model="currentItem.style.backgroundColor" />
                </el-form-item>

                <el-form-item label="边框样式">
                  <el-select v-model="currentItem.style.borderStyle">
                    <el-option label="无边框" value="none" />
                    <el-option label="实线" value="solid" />
                    <el-option label="虚线" value="dashed" />
                    <el-option label="点线" value="dotted" />
                  </el-select>
                </el-form-item>

                <el-form-item label="边框颜色" v-if="currentItem.style.borderStyle !== 'none'">
                  <el-color-picker v-model="currentItem.style.borderColor" />
                </el-form-item>

                <el-form-item label="圆角">
                  <el-slider 
                    v-model="currentItem.style.borderRadius" 
                    :min="0" 
                    :max="20"
                    :step="1"
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 高级设置 -->
            <el-tab-pane label="高级设置">
              <el-form label-position="top" size="small">
                <el-form-item label="动画效果">
                  <el-select v-model="currentItem.animation.type">
                    <el-option label="无动画" value="none" />
                    <el-option label="淡入淡出" value="fade" />
                    <el-option label="滑动" value="slide" />
                    <el-option label="缩放" value="scale" />
                  </el-select>
                </el-form-item>

                <el-form-item label="动画持续时间" v-if="currentItem.animation.type !== 'none'">
                  <el-slider 
                    v-model="currentItem.animation.duration" 
                    :min="100" 
                    :max="2000"
                    :step="100"
                  >
                    <template #suffix>ms</template>
                  </el-slider>
                </el-form-item>

                <el-divider>验证规则</el-divider>
                <el-form-item label="验证类型">
                  <el-select v-model="currentItem.validation.type">
                    <el-option label="无" value="none" />
                    <el-option label="邮箱" value="email" />
                    <el-option label="手机号" value="phone" />
                    <el-option label="身份证" value="idcard" />
                    <el-option label="自定义正则" value="pattern" />
                  </el-select>
                </el-form-item>
                <el-form-item label="正则表达式" v-if="currentItem.validation.type === 'pattern'">
                  <el-input v-model="currentItem.validation.pattern" placeholder="请输入正则表达式" />
                </el-form-item>
                <el-form-item label="验证提示">
                  <el-input v-model="currentItem.validation.message" placeholder="请输入验证失败时的提示信息" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- JSON结构 -->
            <el-tab-pane label="JSON结构">
              <div class="json-viewer">
                <div class="json-viewer-header">
                  <span>组件配置</span>
                  <el-button 
                    type="primary" 
                    link 
                    @click="copyJson"
                  >
                    复制配置
                  </el-button>
                </div>
                <el-input
                  v-model="formattedJson"
                  type="textarea"
                  :autosize="{ minRows: 20 }"
                  readonly
                  resize="none"
                />
              </div>
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
import { ref, reactive, computed } from 'vue'
import { Delete, Plus, CopyDocument, Download, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Edit,
  Select,
  Calendar,
  Timer,
  Upload as UploadIcon,
  Histogram,
  Check,
  CircleCheck,
  Position
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import DynamicFormPreview from './DynamicFormPreview.vue'

const formItems = ref([])
const currentItem = ref(null)
const previewVisible = ref(false)
const formData = reactive({})
const activeTab = ref('基础属性')
const activeComponentType = ref('基础组件')

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
  },
  {
    type: 'radio',
    label: '单选框组',
    icon: 'Check',
    props: {
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' },
        { label: '选项3', value: '3' }
      ]
    }
  },
  {
    type: 'checkbox',
    label: '多选框组',
    icon: 'CircleCheck',
    props: {
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' },
        { label: '选项3', value: '3' }
      ]
    }
  },
  {
    type: 'button',
    label: '按钮',
    icon: 'Position',
    props: {
      type: 'primary',
      text: '点击按钮',
      nativeType: 'button',
      icon: '',
      loading: false,
      disabled: false,
      plain: false,
      round: false,
      circle: false,
      link: false,
      autofocus: false,
      dark: false,
      size: 'default',
      style: {
        width: 'auto',
        marginBottom: '18px'
      }
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
    icon: 'UploadIcon',
    props: {
      action: '',
      multiple: false,
      accept: ''
    }
  }
])

// 计算属性：表单是否为空
const isFormEmpty = computed(() => {
  return formItems.value.length === 0
})

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
const handlePreview = () => {
  if (isFormEmpty.value) {
    ElMessage.warning('请先添加表单组件')
    return
  }
  previewVisible.value = true
}

// 保存表单
const handleSave = () => {
  if (isFormEmpty.value) {
    ElMessage.warning('请先添加表单组件')
    return
  }

  const formData = {
    items: formItems.value,
    layout: {
      labelWidth: '100px',
      size: 'default'
    }
  }

  ElMessageBox.confirm(
    '请选择保存方式',
    '保存表单',
    {
      confirmButtonText: '保存到本地',
      cancelButtonText: '上传到服务器',
      distinguishCancelAndClose: true,
      type: 'info',
      showClose: true,
      icon: Download
    }
  )
  .then(() => {
    saveToLocal(formData)
  })
  .catch((action) => {
    if (action === 'cancel') {
      uploadToServer(formData)
    }
  })
}

// 清空表单
const handleClear = () => {
  if (isFormEmpty.value) {
    ElMessage.warning('表单已经是空的了')
    return
  }

  ElMessageBox.confirm(
    '确定要清空所有组件吗？',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  .then(() => {
    formItems.value = []
    currentItem.value = null
    ElMessage.success('已清空表单')
  })
  .catch(() => {})
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
    case 'number':
      return 'el-input-number'
    case 'select':
      return 'el-select'
    case 'radio':
      return 'el-radio-group'
    case 'checkbox':
      return 'el-checkbox-group'
    case 'button':
      return 'el-button'
    default:
      return 'div'
  }
}

// 初始化组件时的默认配置
const getDefaultProps = (type) => {
  const commonProps = {
    label: '新建组件',
    field: '',
    size: 'default',
    disabled: false,
    required: false,
    style: {
      width: '100%',
      borderStyle: 'none',
      borderColor: '#DCDFE6',
      borderRadius: 0,
      backgroundColor: '#FFFFFF',
      fontSize: 14,
      color: '#303133'
    },
    animation: {
      type: 'none',
      duration: 300
    },
    validation: {
      type: 'none',
      pattern: '',
      message: ''
    }
  }

  switch (type) {
    case 'input':
      return {
        ...commonProps,
        type: 'input',
        placeholder: '请输入',
        maxlength: null,
        showWordLimit: false,
        clearable: true,
        readonly: false
      }
    case 'number':
      return {
        ...commonProps,
        type: 'number',
        placeholder: '请输入数字',
        min: null,
        max: null,
        step: 1,
        precision: 0,
        controlsPosition: ''
      }
    case 'select':
      return {
        ...commonProps,
        type: 'select',
        placeholder: '请选择',
        clearable: true,
        multiple: false,
        options: [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' }
        ]
      }
    case 'radio':
      return {
        ...commonProps,
        type: 'radio',
        options: [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' }
        ]
      }
    case 'checkbox':
      return {
        ...commonProps,
        type: 'checkbox',
        options: [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' }
        ],
        min: null,
        max: null
      }
    case 'button':
      return {
        ...commonProps,
        type: 'button',
        buttonType: '主要按钮',
        text: '按钮',
        icon: '',
        onClick: ''
      }
    default:
      return commonProps
  }
}

// 处理按钮类型变化
const handleButtonTypeChange = (value) => {
  if (value === '自定义') {
    activeTab.value = '样式设置'
  }
}

// JSON格式化显示
const formattedJson = computed(() => {
  if (!currentItem.value) return ''
  return JSON.stringify(currentItem.value, null, 2)
})

// 复制JSON
const copyJson = () => {
  navigator.clipboard.writeText(formattedJson.value)
  ElMessage.success('复制成功')
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
    upload: '上传',
    button: '按钮'
  }
  return labels[type] || type
}

// 保存到本地
const saveToLocal = (formData) => {
  // 生成时间戳文件名
  const now = new Date()
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
  const fileName = `form-data_${timestamp}.json`

  const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('保存成功')
}

// 上传到服务器
const uploadToServer = (formData) => {
  // 这里模拟上传到服务器的操作
  setTimeout(() => {
    ElMessage.success('上传成功')
  }, 300)
}
</script>

<style scoped>
.dynamic-form-designer {
  height: 100vh;
  background-color: #f5f7fa;
}

.property-panel {
  border-left: 1px solid #dcdfe6;
  background-color: #fff;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.option-label,
.option-value {
  flex: 1;
}

:deep(.el-divider--horizontal) {
  margin: 16px 0;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px;
}

:deep(.el-tabs__content) {
  padding: 8px;
}

:deep(.el-radio-group) {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.el-checkbox) {
  margin-right: 16px;
}

.components-list {
  padding: 8px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin-bottom: 8px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.component-item:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.component-item.is-selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.form-design-area {
  min-height: 500px;
  padding: 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.form-items-container {
  min-height: 100%;
}

.form-item-wrapper {
  position: relative;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px dashed transparent;
  border-radius: 4px;
  transition: all 0.3s;
}

.form-item-wrapper:hover,
.form-item-wrapper.is-selected {
  border-color: var(--el-color-primary);
}

.form-item-actions {
  position: absolute;
  right: 8px;
  top: 8px;
  display: none;
  z-index: 10;
}

.form-item-wrapper:hover .form-item-actions {
  display: block;
}

.empty-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.json-viewer {
  height: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.json-viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 4px;
}

:deep(.el-textarea__inner) {
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre;
  word-break: break-all;
}

.form-item-wrapper {
  position: relative;
  padding: 8px;
  border: 1px dashed transparent;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.form-item-wrapper:hover {
  border-color: var(--el-color-primary);
}

.form-item-wrapper.is-selected {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.form-item-actions {
  position: absolute;
  right: 8px;
  top: 8px;
  display: none;
  z-index: 10;
}

.form-item-wrapper:hover .form-item-actions {
  display: block;
}

.form-items-container {
  min-height: 200px;
  padding: 16px;
}

.form-items-container.is-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-fill-color-light);
  border: 2px dashed var(--el-border-color);
  border-radius: 4px;
}

.empty-placeholder {
  padding: 32px;
}

.form-actions {
  padding: 20px;
  text-align: center;
  border-top: 1px solid #dcdfe6;
}

.form-actions .el-button {
  margin: 0 10px;
}
</style>
