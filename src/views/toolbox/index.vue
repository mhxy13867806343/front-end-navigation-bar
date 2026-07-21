<script setup lang="ts">
import { useRouter } from 'vue-router'

interface ToolboxItem {
  id: string
  name: string
  desc: string
  icon: string
  path: string
  tag: string
}

const router = useRouter()

const toolboxItems: ToolboxItem[] = [
  {
    id: 'terminal',
    name: '终端界面',
    desc: 'macOS 风格终端资源入口，集中查看终端模拟器、Shell 美化和 Web 终端组件。',
    icon: '⌨️',
    path: '/terminal',
    tag: 'Terminal'
  },
  {
    id: 'runcode',
    name: '在线运行代码',
    desc: '类似 Qzxdp RunCode 的在线代码工作台，支持编辑、输入、输出和前端本地运行。',
    icon: '▶️',
    path: '/runcode',
    tag: 'RunCode'
  }
]

const openTool = (item: ToolboxItem): Promise<void | Error> => router.push(item.path)
</script>

<template>
  <main class="toolbox-hub">
    <section class="toolbox-hero">
      <div>
        <p class="toolbox-kicker">实用工具箱</p>
        <h1>工具集合</h1>
        <p>终端、在线运行代码，以及后续新增的这类独立工具，都从这里统一进入。</p>
      </div>
    </section>

    <section class="toolbox-list" aria-label="工具列表">
      <button
        v-for="item in toolboxItems"
        :key="item.id"
        type="button"
        class="toolbox-card"
        @click="openTool(item)"
      >
        <span class="toolbox-icon">{{ item.icon }}</span>
        <span class="toolbox-card-main">
          <strong>{{ item.name }}</strong>
          <em>{{ item.tag }}</em>
          <span>{{ item.desc }}</span>
        </span>
        <span class="toolbox-arrow">›</span>
      </button>
    </section>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
