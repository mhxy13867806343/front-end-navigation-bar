<template>
  <div class="form-preview">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <template v-for="item in formItems" :key="item.id">
        <el-form-item
          :label="item.label"
          :prop="item.field"
          :rules="item.props.required ? [{ required: true, message: `${getPlaceholder(item)}`, trigger: getTrigger(item.type) }] : []"
        >
          <component
            :is="getComponentType(item.type)"
            v-model="formData[item.field]"
            v-bind="item.props"
          >
            <template v-if="['select', 'radio', 'checkbox'].includes(item.type)">
              <template v-for="option in item.props.options" :key="option.value">
                <component
                  :is="getOptionComponent(item.type)"
                  :label="option.value"
                >
                  {{ option.label }}
                </component>
              </template>
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
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElButton, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElRadio, ElRadioGroup, ElCheckbox, ElCheckboxGroup, ElDatePicker } from 'element-plus'

const props = defineProps({
  formItems: {
    type: Array,
    default: () => []
  }
})

const formRef = ref(null)
const formData = reactive({})

// 根据组件类型获取对应的Element Plus组件
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

// 获取选项组件类型
const getOptionComponent = (type) => {
  const componentMap = {
    select: 'el-option',
    radio: 'el-radio',
    checkbox: 'el-checkbox'
  }
  return componentMap[type]
}

// 获取验证触发方式
const getTrigger = (type) => {
  return ['select', 'radio', 'checkbox', 'date'].includes(type) ? 'change' : 'blur'
}

// 获取placeholder提示
const getPlaceholder = (item) => {
  const actionMap = {
    input: '输入',
    textarea: '输入',
    select: '选择',
    radio: '选择',
    checkbox: '选择',
    date: '选择'
  }
  return `${actionMap[item.type] || '输入'}${item.label}`
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
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.form-preview {
  padding: 20px;
}
</style>
