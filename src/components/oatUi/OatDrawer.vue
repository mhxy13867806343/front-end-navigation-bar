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

<style scoped lang="scss" src="./css/OatDrawer.scss"></style>
