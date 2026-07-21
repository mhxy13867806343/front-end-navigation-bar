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
      :show-all-levels="true"
      :display-render="displayRender"
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

interface CascaderNode {
  value: string
  label: string
  children?: CascaderNode[]
}

function simplifyRegionLabel(label: string): string {
  return label
    .replace(/特别行政区$/u, '')
    .replace(/壮族自治区$|回族自治区$|维吾尔自治区$/u, '')
    .replace(/自治区$/u, '')
    .replace(/自治州$/u, '')
    .replace(/自治县$/u, '')
    .replace(/自治旗$/u, '')
    .replace(/地区$/u, '')
    .replace(/林区$/u, '')
    .replace(/新区$/u, '')
    .replace(/市辖区$/u, '')
    .replace(/省$/u, '')
    .replace(/市$/u, '')
    .replace(/区$/u, '')
    .replace(/县$/u, '')
    .replace(/盟$/u, '')
    .replace(/旗$/u, '')
}

function normalizeOptions(nodes: CascaderNode[]): CascaderNode[] {
  return nodes.map(node => ({
    value: node.value,
    label: simplifyRegionLabel(node.label),
    children: node.children ? normalizeOptions(node.children) : undefined
  }))
}

const chinaCascaderOptions = markRaw(normalizeOptions(rawCascaderOptions as CascaderNode[]))

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

function displayRender(labels: string[]): string {
  return labels.filter(Boolean).join(' / ')
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

<style lang="scss">
.china-region-cascader-popper.el-popper,
.china-region-cascader-popper.el-cascader__dropdown {
  z-index: 6000 !important;
}

.china-region-cascader-popper {
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2) !important;
}

.china-region-cascader-popper .el-cascader-menu {
  min-width: 180px;
}

.china-region-cascader-popper .el-scrollbar__wrap {
  max-height: min(360px, 50vh);
}
</style>
