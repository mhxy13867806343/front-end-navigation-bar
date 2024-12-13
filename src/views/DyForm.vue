<template>
  <div class="dy-form">
    <DynamicFormDesigner
      :is-local-save="false"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import DynamicFormDesigner from '../components/DynamicForm/DynamicFormDesigner.vue'

// 处理保存事件
const handleSave = (formData) => {
  // 这里可以处理表单数据，比如发送到服务器
  console.log('保存的表单数据:', formData)
}
</script>

<style scoped>
.dy-form {
  height: 100vh;
}
</style>
