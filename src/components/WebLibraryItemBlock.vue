<script setup lang="ts">
export interface WebLibraryItemData {
  label: string
  command?: string
  children?: WebLibraryItemData[]
}

defineProps<{
  item: WebLibraryItemData
}>()

const emit = defineEmits<{
  (e: 'command', command: string): void
}>()

const handleCommand = (cmd?: string): void => {
  if (cmd) {
    emit('command', cmd)
  }
}
</script>

<template>
  <div v-if="item.children?.length" class="web-library-item-block">
    <button
      type="button"
      class="web-library-item parent-item"
      @click="handleCommand(item.command)"
    >
      {{ item.label }}
    </button>
    <div class="web-library-sub-items">
      <button
        v-for="sub in item.children"
        :key="sub.command || sub.label"
        type="button"
        class="web-library-sub-item"
        @click="handleCommand(sub.command)"
      >
        {{ sub.label }}
      </button>
    </div>
  </div>

  <button
    v-else
    type="button"
    class="web-library-item"
    @click="handleCommand(item.command)"
  >
    {{ item.label }}
  </button>
</template>

<style scoped lang="scss" src="./css/WebLibraryItemNav.scss"></style>
