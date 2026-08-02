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

<style scoped lang="scss" src="./css/StatusPanel.scss"></style>
