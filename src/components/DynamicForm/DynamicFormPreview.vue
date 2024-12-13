<template>
  <div class="form-preview">
    <el-form
      ref="formRef"
      :model="formData"
      label-width="100px"
    >
      <template v-for="item in formItems" :key="item.id">
        <el-form-item
          :label="item.label"
          :prop="item.field"
          :rules="item.props.required ? [{ required: true, message: getPlaceholder(item), trigger: getTrigger(item.type) }] : []"
        >
          <component
            :is="getComponentType(item.type)"
            v-model="formData[item.field]"
            v-bind="item.props"
            @update:modelValue="(val) => handleInputChange(item.field, val, item.type)"
          >
            <template v-if="['select', 'radio', 'checkbox'].includes(item.type)">
              <component
                v-for="option in item.props.options"
                :key="option.value"
                :is="getOptionComponent(item.type)"
                :label="option.value"
              >
                {{ option.label }}
              </component>
            </template>
          </component>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  formItems: {
    type: Array,
    default: () => []
  }
})

const formRef = ref(null)
const formData = reactive({})

// 处理输入值变化
const handleInputChange = (field, value, type) => {
  try {
    if (!field) return

    if (type === 'number') {
      const item = props.formItems.find(item => item.field === field)
      if (item) {
        const min = Number(item.props.min ?? 0)
        const max = Number(item.props.max ?? 100)
        formData[field] = Math.max(min, Math.min(value, max))
      }
    } else {
      formData[field] = value
    }
  } catch (error) {
    console.error('处理输入值变化失败:', error)
  }
}

// 初始化表单数据
const initFormData = () => {
  try {
    // 清空旧数据
    Object.keys(formData).forEach(key => {
      delete formData[key]
    })
    
    // 设置新数据
    props.formItems.forEach(item => {
      if (!item || !item.field) return

      // 根据组件类型设置初始值
      switch(item.type) {
        case 'checkbox':
          formData[item.field] = []
          break
        case 'number':
          const min = Number(item.props?.min ?? 0)
          formData[item.field] = min
          break
        case 'switch':
          formData[item.field] = false
          break
        case 'slider':
          formData[item.field] = Number(item.props?.min ?? 0)
          break
        case 'select':
          formData[item.field] = item.props?.multiple ? [] : ''
          break
        case 'date':
        case 'time':
          formData[item.field] = null
          break
        default:
          formData[item.field] = ''
      }
    })
  } catch (error) {
    console.error('初始化表单数据失败:', error)
  }
}

// 监听表单项变化
watch(() => props.formItems, () => {
  initFormData()
}, { deep: true })

// 根据组件类型获取对应的Element Plus组件
const getComponentType = (type) => {
  try {
    const componentMap = {
      input: 'el-input',
      textarea: 'el-input',
      number: 'el-input-number',
      select: 'el-select',
      radio: 'el-radio-group',
      checkbox: 'el-checkbox-group',
      date: 'el-date-picker',
      time: 'el-time-picker',
      switch: 'el-switch',
      upload: 'el-upload',
      image: 'el-upload',
      url: 'el-input',
      slider: 'el-slider',
      cascader: 'el-cascader'
    }
    return componentMap[type] || 'el-input'
  } catch (error) {
    console.error('获取组件类型失败:', error)
    return 'el-input'
  }
}

// 获取选项组件类型
const getOptionComponent = (type) => {
  try {
    const componentMap = {
      select: 'el-option',
      radio: 'el-radio',
      checkbox: 'el-checkbox'
    }
    return componentMap[type]
  } catch (error) {
    console.error('获取选项组件类型失败:', error)
    return null
  }
}

// 获取验证触发方式
const getTrigger = (type) => {
  try {
    return ['select', 'radio', 'checkbox', 'date', 'time', 'switch', 'upload', 'slider', 'cascader'].includes(type) 
      ? 'change' 
      : 'blur'
  } catch (error) {
    console.error('获取验证触发方式失败:', error)
    return 'blur'
  }
}

// 获取placeholder提示
const getPlaceholder = (item) => {
  try {
    if (!item || !item.type || !item.label) return '请输入'

    const actionMap = {
      input: '输入',
      textarea: '输入',
      number: '输入',
      select: '选择',
      radio: '选择',
      checkbox: '选择',
      date: '选择',
      time: '选择',
      url: '输入',
      cascader: '选择'
    }
    return `请${actionMap[item.type] || '输入'}${item.label}`
  } catch (error) {
    console.error('获取placeholder失败:', error)
    return '请输入'
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    console.log('表单数据：', formData)
    ElMessage.success('提交成功')
  } catch (error) {
    console.error('表单验证失败：', error)
    ElMessage.error('表单验证失败')
  }
}

// 重置表单
const resetForm = () => {
  try {
    if (formRef.value) {
      formRef.value.resetFields()
      initFormData()
    }
  } catch (error) {
    console.error('重置表单失败:', error)
    ElMessage.error('重置失败')
  }
}
</script>

<style scoped>
.form-preview {
  padding: 20px;
}
</style>
