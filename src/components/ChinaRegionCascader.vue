<template>
  <div class="china-region-cascader">
    <el-cascader
      v-model="internalValue"
      :options="chinaCascaderOptions"
      :props="{ checkStrictly: checkStrictly, expandTrigger: 'click' }"
      :filterable="filterable"
      :clearable="clearable"
      :placeholder="placeholder"
      :size="size"
      :teleported="true"
      popper-class="china-region-cascader-popper"
      class="region-cascader"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, markRaw } from 'vue'
import rawCascaderOptions from '../ajson/china-cascader-options.json'

const chinaCascaderOptions = markRaw(rawCascaderOptions as CascaderNode[])

interface CascaderNode {
  value: string
  label: string
  children?: CascaderNode[]
}

export interface RegionChangeEvent {
  value: string[]
  adcode: string
  labels: string[]
  cityName: string
}

interface Props {
  modelValue?: string[] | string
  placeholder?: string
  checkStrictly?: boolean
  clearable?: boolean
  filterable?: boolean
  size?: 'large' | 'default' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: '请选择省 / 市 / 区县',
  checkStrictly: true,
  clearable: true,
  filterable: true,
  size: 'default'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'change', event: RegionChangeEvent): void
}>()

const internalValue = ref<string[]>(
  Array.isArray(props.modelValue)
    ? props.modelValue
    : props.modelValue ? [props.modelValue] : []
)

watch(
  () => props.modelValue,
  (val) => {
    internalValue.value = Array.isArray(val) ? val : val ? [val] : []
  }
)

function findPathLabels(val: string[]): string[] {
  const pathNodes: string[] = []
  const findNodes = (nodes: CascaderNode[], idx: number): void => {
    if (idx >= val.length) return
    const found = nodes.find((n) => n.value === val[idx])
    if (found) {
      pathNodes.push(found.label)
      if (found.children) findNodes(found.children, idx + 1)
    }
  }
  findNodes(chinaCascaderOptions as CascaderNode[], 0)
  return pathNodes
}

function handleChange(val: any): void {
  const valArray: string[] = Array.isArray(val) ? val : []
  emit('update:modelValue', valArray)

  if (valArray.length === 0) {
    emit('change', {
      value: [],
      adcode: '',
      labels: [],
      cityName: ''
    })
    return
  }

  const adcode = valArray[valArray.length - 1]
  const labels = findPathLabels(valArray)
  const cityName = labels.length > 0 ? labels[labels.length - 1] : ''

  emit('change', {
    value: valArray,
    adcode,
    labels,
    cityName
  })
}
</script>

<style scoped lang="scss" src="./css/ChinaRegionCascader.scss"></style>
