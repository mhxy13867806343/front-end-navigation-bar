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

<style scoped lang="scss">
.example-card {
  width: 100%;
  min-height: 220px;
  padding: 20px;
  display: grid;
  align-content: start;
  gap: 14px;
  border-radius: 24px;
  border: 1px solid rgba(98, 132, 255, 0.2);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--example-accent) 18%, rgba(8, 12, 32, 0.95)) 0%, rgba(7, 10, 26, 0.98) 100%);
  color: #eef4ff;
  text-align: left;
  cursor: pointer;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.example-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--example-accent) 54%, white);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.example-card__badge,
.example-card em {
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  font-style: normal;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.example-card strong {
  font-size: 24px;
  line-height: 1.15;
}

.example-card p {
  margin: 0;
  color: rgba(230, 239, 255, 0.76);
  line-height: 1.7;
}

.example-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.example-card__tags span {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #dce8ff;
  font-size: 12px;
}
</style>
