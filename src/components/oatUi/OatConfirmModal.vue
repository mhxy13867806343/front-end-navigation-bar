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

<style scoped lang="scss">
.oat-fade-enter-active,
.oat-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.oat-fade-enter-from,
.oat-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.oat-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2100;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.oat-modal-card.confirm-modal {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.16);
  overflow: hidden;

  .modal-body {
    padding: 24px;
    display: flex;
    gap: 16px;
    align-items: flex-start;

    .icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;

      &.warning {
        background: #fef3c7;
      }
      &.danger {
        background: #fee2e2;
      }
      &.success {
        background: #d1fae5;
      }
      &.info {
        background: #e0f2fe;
      }
    }

    .content-box {
      h4 {
        margin: 0 0 6px;
        font-size: 1.05rem;
        font-weight: 700;
        color: #0f172a;
      }
      p {
        margin: 0;
        font-size: 0.88rem;
        color: #475569;
        line-height: 1.5;
      }
    }
  }

  .modal-footer {
    padding: 12px 24px;
    border-top: 1px solid #f1f5f9;
    background: #fafafa;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

.oat-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;

  &.secondary {
    background: #ffffff;
    border-color: #cbd5e1;
    color: #475569;
    &:hover {
      background: #f8fafc;
    }
  }

  &.primary {
    background: #2563eb;
    color: #ffffff;
    &:hover {
      background: #1d4ed8;
    }
  }

  &.danger {
    background: #dc2626;
    color: #ffffff;
    &:hover {
      background: #b91c1c;
    }
  }
}
</style>
