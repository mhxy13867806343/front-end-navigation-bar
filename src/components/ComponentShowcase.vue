<script setup>
import { ref, watch } from 'vue'
import BasicDemo from './showcase/BasicDemo.vue'
import IntermediateDemo from './showcase/IntermediateDemo.vue'
import AdvancedDemo from './showcase/AdvancedDemo.vue'

const activeTab = ref('basic')

const tabs = [
  { name: 'basic', label: '🧱 基础组件', component: BasicDemo },
  { name: 'intermediate', label: '⚙️ 中级组件', component: IntermediateDemo },
  { name: 'advanced', label: '🚀 高级组件', component: AdvancedDemo }
]

// 记录已访问过的tab，实现懒加载并保留已加载组件状态
const loadedTabs = ref(new Set([activeTab.value]))
watch(activeTab, (name) => {
  loadedTabs.value.add(name)
})
</script>

<template>
  <div class="component-showcase">
    <div class="showcase-header">
      <h2 class="showcase-title">🧩 组件示例</h2>
      <p class="showcase-subtitle">
        基于
        <el-link type="primary" href="https://element-plus.org/zh-CN/" target="_blank">Element Plus</el-link>
        的组件在线演示，按 基础 / 中级 / 高级 三个难度分级，点击 Tab 切换查看
      </p>
    </div>

    <el-tabs v-model="activeTab" class="showcase-tabs" type="border-card">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        :label="tab.label"
      >
        <component :is="tab.component" v-if="loadedTabs.has(tab.name)" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.component-showcase {
  padding: 20px;
}

.showcase-header {
  margin-bottom: 16px;
}

.showcase-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-color, #409eff);
  margin-bottom: 6px;
}

.showcase-subtitle {
  font-size: 13px;
  color: var(--text-color-secondary, #909399);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.showcase-tabs {
  border-radius: 12px;
  overflow: hidden;
}
</style>

<style>
/* 各分类示例的公共样式（子组件共用，不使用 scoped） */
.component-showcase .demo-section {
  margin-bottom: 28px;
}

.component-showcase .demo-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--primary-color, #409eff);
}

.component-showcase .demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}
</style>
