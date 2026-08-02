<script setup lang="ts">
import type { ThreeExampleParameter } from '../types'

const props = defineProps<{
  parameters: ThreeExampleParameter[]
  modelValue: Record<string, string | number | boolean>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string | number | boolean>]
}>()

const updateValue = (key: string, value: string | number | boolean): void => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <section class="parameter-panel">
    <div class="parameter-panel__head">
      <strong>参数调节</strong>
      <p>修改参数后会立即映射到当前 Three.js 场景。</p>
    </div>
    <div class="parameter-panel__list">
      <label v-for="item in parameters" :key="item.key" class="parameter-panel__item">
        <span>{{ item.label }}</span>
        <input
          v-if="item.type === 'range'"
          :value="Number(modelValue[item.key])"
          type="range"
          :min="item.min"
          :max="item.max"
          :step="item.step"
          @input="updateValue(item.key, Number(($event.target as HTMLInputElement).value))"
        />
        <input
          v-else-if="item.type === 'color'"
          :value="String(modelValue[item.key])"
          type="color"
          @input="updateValue(item.key, ($event.target as HTMLInputElement).value)"
        />
        <button
          v-else-if="item.type === 'toggle'"
          type="button"
          :class="['parameter-panel__toggle', { 'parameter-panel__toggle--active': Boolean(modelValue[item.key]) }]"
          @click="updateValue(item.key, !Boolean(modelValue[item.key]))"
        >
          {{ Boolean(modelValue[item.key]) ? '开启' : '关闭' }}
        </button>
        <select
          v-else
          :value="String(modelValue[item.key])"
          @change="updateValue(item.key, ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="option in item.options || []" :key="String(option.value)" :value="String(option.value)">
            {{ option.label }}
          </option>
        </select>
        <em>{{ modelValue[item.key] }}</em>
      </label>
    </div>
  </section>
</template>

<style scoped lang="scss" src="./css/ParameterPanel.scss"></style>
