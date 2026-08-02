<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    message?: string
    type?: 'warning' | 'info' | 'danger' | 'success'
    confirmText?: string
    cancelText?: string
  }>(),
  {
    title: '确认操作',
    message: '确定要执行此操作吗？',
    type: 'warning',
    confirmText: '确定',
    cancelText: '取消'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="oat-fade">
      <div v-if="modelValue" class="oat-modal-backdrop" @click.self="handleCancel">
        <div class="oat-modal-card confirm-modal" :class="type">
          <div class="modal-body">
            <div class="icon-wrapper" :class="type">
              <span v-if="type === 'warning'">⚠️</span>
              <span v-else-if="type === 'danger'">🗑️</span>
              <span v-else-if="type === 'success'">✅</span>
              <span v-else>ℹ️</span>
            </div>
            <div class="content-box">
              <h4>{{ title }}</h4>
              <p>{{ message }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="oat-btn secondary" @click="handleCancel">{{ cancelText }}</button>
            <button
              class="oat-btn"
              :class="type === 'danger' ? 'danger' : 'primary'"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss" src="./css/OatConfirmModal.scss"></style>
