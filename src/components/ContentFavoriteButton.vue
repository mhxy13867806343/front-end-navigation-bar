<script setup lang="ts">
const props = withDefaults(defineProps<{
  active: boolean
  title?: string
  size?: 'normal' | 'compact'
}>(), {
  title: '',
  size: 'normal'
})

const emit = defineEmits<{
  (event: 'toggle'): void
}>()
</script>

<template>
  <button
    type="button"
    class="content-favorite-button"
    :class="[props.size, { active: props.active }]"
    :title="props.title || (props.active ? '取消收藏' : '收藏')"
    :aria-pressed="props.active"
    @click.stop.prevent="emit('toggle')"
  >
    <span>{{ props.active ? '♥' : '♡' }}</span>
  </button>
</template>

<style scoped lang="scss">
.content-favorite-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid rgba(255, 105, 150, 0.36);
  border-radius: 50%;
  color: #ff78a0;
  background: rgba(255, 105, 150, 0.08);
  box-shadow: 0 8px 20px rgba(255, 60, 120, 0.08);
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.content-favorite-button:hover {
  transform: translateY(-1px) scale(1.04);
  border-color: rgba(255, 105, 150, 0.72);
  background: rgba(255, 105, 150, 0.16);
}

.content-favorite-button.active {
  color: #fff;
  border-color: #ff5b8b;
  background: linear-gradient(135deg, #ff477e, #ff7ab1);
  box-shadow: 0 10px 26px rgba(255, 71, 126, 0.22);
}

.content-favorite-button.compact {
  width: 34px;
  height: 34px;
  font-size: 16px;
}

.content-favorite-button span {
  display: block;
  line-height: 1;
  transform: translateY(-1px);
}
</style>
