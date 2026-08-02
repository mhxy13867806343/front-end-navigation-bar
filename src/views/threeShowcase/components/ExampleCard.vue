<script setup lang="ts">
import type { ThreeExampleMeta } from '../types'

defineProps<{
  item: ThreeExampleMeta
}>()

defineEmits<{
  open: [item: ThreeExampleMeta]
}>()
</script>

<template>
  <button type="button" class="example-card" :style="{ '--example-accent': item.accent }" @click="$emit('open', item)">
    <span class="example-card__badge">{{ item.category }}</span>
    <strong>{{ item.title }}</strong>
    <p>{{ item.summary }}</p>
    <div class="example-card__tags">
      <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
    </div>
    <em>{{ item.difficulty }}</em>
  </button>
</template>

<style scoped lang="scss" src="./css/ExampleCard.scss"></style>
