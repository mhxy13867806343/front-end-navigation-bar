<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  clickable?: boolean
}>()

defineEmits<{
  open: []
}>()
</script>

<template>
  <section class="panel-card status-panel">
    <div class="status-panel__head">
      <div>
        <h3>{{ title }}</h3>
        <p>{{ subtitle }}</p>
      </div>
      <button v-if="clickable" type="button" class="status-panel__more" @click="$emit('open')">查看详情</button>
    </div>
    <div class="status-panel__body">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.status-panel {
  padding: 12px;
}

.status-panel__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.status-panel__head h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.status-panel__head p {
  margin: 0;
  font-size: 11px;
  color: #93a7db;
}

.status-panel__more {
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(111, 145, 255, 0.2);
  background: rgba(70, 95, 193, 0.1);
  color: #afc0ff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(70, 95, 193, 0.35);
    border-color: rgba(111, 145, 255, 0.5);
    color: #ffffff;
    box-shadow: 0 0 12px rgba(111, 145, 255, 0.3);
  }
}

.status-panel__body {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}
</style>
