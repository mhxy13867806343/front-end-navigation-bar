<template>
  <div class="dynamic-form-preview">
    <el-form
      ref="formRef"
      :model="formData"
      label-width="100px"
      class="preview-form"
    >
      <template v-for="item in formItems" :key="item.id">
        <el-form-item
          :label="item.label"
          :prop="item.field"
          :rules="item.props?.required ? [{ required: true, message: `请输入${item.label}`, trigger: 'blur' }] : []"
        >
          <!-- 单行文本 -->
          <template v-if="item.type === 'input'">
            <el-input
              v-model="formData[item.field]"
              :placeholder="item.props.placeholder"
              :maxlength="item.props.maxlength"
              :show-word-limit="item.props.showWordLimit"
              :clearable="item.props.clearable"
            />
          </template>

          <!-- 多行文本 -->
          <template v-else-if="item.type === 'textarea'">
            <el-input
              v-model="formData[item.field]"
              type="textarea"
              :placeholder="item.props.placeholder"
              :maxlength="item.props.maxlength"
              :show-word-limit="item.props.showWordLimit"
              :autosize="item.props.autosize"
              :clearable="item.props.clearable"
            />
          </template>

          <!-- 数字输入 -->
          <template v-else-if="item.type === 'number'">
            <el-input-number
              v-model="formData[item.field]"
              :min="item.props.min"
              :max="item.props.max"
              :step="item.props.step"
              :precision="item.props.precision"
              :placeholder="item.props.placeholder"
              :controls="item.props.controls"
            />
          </template>

          <!-- 下拉选择 -->
          <template v-else-if="item.type === 'select'">
            <el-select
              v-model="formData[item.field]"
              :placeholder="item.props.placeholder"
              :clearable="item.props.clearable"
              class="full-width"
            >
              <el-option
                v-for="option in item.props.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>

          <!-- 日期选择 -->
          <template v-else-if="item.type === 'date'">
            <el-date-picker
              v-model="formData[item.field]"
              :type="item.props.type"
              :placeholder="item.props.placeholder"
              :clearable="item.props.clearable"
              class="full-width"
            />
          </template>

          <!-- 时间选择 -->
          <template v-else-if="item.type === 'time'">
            <el-time-picker
              v-model="formData[item.field]"
              :placeholder="item.props.placeholder"
              :clearable="item.props.clearable"
              class="full-width"
            />
          </template>

          <!-- 文件上传 -->
          <template v-else-if="item.type === 'upload'">
            <el-upload
              :action="item.props.action"
              :multiple="item.props.multiple"
              :accept="item.props.accept"
              class="full-width"
            >
              <el-button type="primary">点击上传</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持的文件类型: {{ item.props.accept || '所有文件' }}
                </div>
              </template>
            </el-upload>
          </template>

          <!-- 按钮 -->
          <template v-else-if="item.type === 'button'">
            <el-button
              :type="item.buttonType"
              :icon="item.icon"
              :disabled="item.disabled"
              :size="item.size"
              :style="{
                width: item.style?.width,
                backgroundColor: item.style?.backgroundColor,
                color: item.style?.color,
                borderStyle: item.style?.borderStyle,
                borderColor: item.style?.borderColor,
                borderRadius: item.style?.borderRadius + 'px',
                fontSize: item.style?.fontSize + 'px'
              }"
            >
              {{ item.text || '按钮' }}
            </el-button>
          </template>
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
    required: true,
    default: () => []
  }
})

const formRef = ref(null)
const formData = reactive({})

// 监听表单项变化，初始化表单数据
watch(
  () => props.formItems,
  (items) => {
    // 清理不存在的字段
    Object.keys(formData).forEach(key => {
      if (!items.some(item => item.field === key)) {
        delete formData[key]
      }
    })

    // 初始化新字段
    items.forEach(item => {
      if (!(item.field in formData)) {
        if (item.type === 'number') {
          formData[item.field] = item.props?.min || 0
        } else if (item.type === 'select') {
          formData[item.field] = ''
        } else if (item.type === 'date' || item.type === 'time') {
          formData[item.field] = null
        } else {
          formData[item.field] = ''
        }
      }
    })
  },
  { immediate: true, deep: true }
)

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    console.log('表单数据:', formData)
    ElMessage.success('提交成功')
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单填写是否正确')
  }
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}
</script>

<style scoped>
.dynamic-form-preview {
  padding: 20px;
}

.preview-form {
  max-width: 800px;
  margin: 0 auto;
}

.full-width {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
}
</style>
