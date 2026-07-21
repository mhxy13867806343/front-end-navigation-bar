<template>
  <div class="dy-form">
    <DynamicFormDesigner
      :is-local-save="false"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import DynamicFormDesigner from '../components/DynamicForm/DynamicFormDesigner.vue'
import type { DynamicFormPayload } from '@/types/dynamicForm'

// 处理保存事件
const handleSave = (formData: DynamicFormPayload): void => {
  // 这里可以处理表单数据，比如发送到服务器
  console.log('保存的表单数据:', formData)
}
</script>

<style scoped lang="scss" src="./css/DyForm.scss"></style>
