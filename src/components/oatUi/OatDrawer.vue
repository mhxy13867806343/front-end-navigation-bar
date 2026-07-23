<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    subtitle?: string
    width?: string
  }>(),
  {
    title: '系统通知中心',
    subtitle: '最新变更与待办项',
    width: '400px'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const closeDrawer = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="oat-drawer-fade">
      <div v-if="modelValue" class="oat-drawer-backdrop" @click.self="closeDrawer">
        <div class="oat-drawer-panel" :style="{ width: width }">
          <div class="drawer-header">
            <div class="title-box">
              <h3>{{ title }}</h3>
              <p v-if="subtitle">{{ subtitle }}</p>
            </div>
            <button class="close-btn" aria-label="关闭" @click="closeDrawer">×</button>
          </div>

          <div class="drawer-body">
            <slot></slot>
          </div>

          <div v-if="$slots.footer" class="drawer-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.oat-drawer-fade-enter-active,
.oat-drawer-fade-leave-active {
  transition: opacity 0.25s ease;

  .oat-drawer-panel {
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.oat-drawer-fade-enter-from,
.oat-drawer-fade-leave-to {
  opacity: 0;

  .oat-drawer-panel {
    transform: translateX(100%);
  }
}

.oat-drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: flex-end;
}

.oat-drawer-panel {
  height: 100%;
  max-width: 90vw;
  background: #ffffff;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  padding: 18px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title-box {
    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
    }
    p {
      margin: 2px 0 0;
      font-size: 0.8rem;
      color: #64748b;
    }
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 1.4rem;
    cursor: pointer;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  }
}

.drawer-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.drawer-footer {
  padding: 14px 24px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
}
</style>
