<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import BasicDemo from './showcase/BasicDemo.vue'
import IntermediateDemo from './showcase/IntermediateDemo.vue'
import AdvancedDemo from './showcase/AdvancedDemo.vue'
import NaiveShowcase from './NaiveShowcase.vue'
import CombinedDemo from './showcase/CombinedDemo.vue'

const props = defineProps({
  activeLibrary: {
    type: String,
    default: 'element'
  }
})
const emit = defineEmits(['update:activeLibrary'])

const localActiveLibrary = computed({
  get: () => props.activeLibrary,
  set: (val) => emit('update:activeLibrary', val)
})
</script>

<template>
  <div class="component-showcase">
    <div class="showcase-header">
      <h2 class="showcase-title">🧩 在线组件示例库</h2>
      <p class="showcase-subtitle">
        基于 Element Plus + Naive UI 双组件库的完整演练场 — 支持基础/中级/高级三难度分级及商业综合实战场景
      </p>
      <div style="margin-top: 12px; margin-bottom: 8px;">
        <el-radio-group v-model="localActiveLibrary" size="default">
          <el-radio-button value="element">🧩 Element Plus</el-radio-button>
          <el-radio-button value="naive">🍀 Naive UI</el-radio-button>
          <el-radio-button value="combined">
            <span style="background: linear-gradient(90deg, #409eff, #18a058); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700;">
              ⚡ 综合商业实战
            </span>
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- Element Plus Showcase -->
    <div v-if="localActiveLibrary === 'element'">
      <el-tabs class="showcase-tabs" type="border-card">
        <el-tab-pane label="🧱 基础组件">
          <BasicDemo />
        </el-tab-pane>
        <el-tab-pane label="⚙️ 中级组件">
          <IntermediateDemo />
        </el-tab-pane>
        <el-tab-pane label="🚀 高级组件">
          <AdvancedDemo />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Naive UI Showcase -->
    <div v-else-if="localActiveLibrary === 'naive'">
      <n-config-provider>
        <NaiveShowcase />
      </n-config-provider>
    </div>

    <!-- Combined Commercial Dashboard -->
    <div v-else-if="localActiveLibrary === 'combined'">
      <div class="combined-banner">
        <span class="combined-badge">⚡ 商业级实战</span>
        <span class="combined-desc">以下演示同时使用 Element Plus + Naive UI 双库组件协同搭建，展示接近商业后台系统的真实交互场景</span>
      </div>
      <n-config-provider>
        <CombinedDemo />
      </n-config-provider>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./css/ComponentShowcase-1.scss"></style>

<style lang="scss" src="./css/ComponentShowcase-2.scss"></style>
