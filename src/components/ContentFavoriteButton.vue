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

<style scoped lang="scss" src="./css/ContentFavoriteButton.scss"></style>
