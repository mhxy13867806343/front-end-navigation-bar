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

<style scoped>
.toolbox-hub {
  min-height: calc(100dvh - 45px);
  padding: 36px;
  background: #111111;
  color: #f4f4f5;
}

.toolbox-hero {
  max-width: 1120px;
  margin: 0 auto 24px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: #1b1b1f;
}

.toolbox-kicker {
  margin: 0 0 10px;
  color: #7c83ff;
  font-weight: 900;
  letter-spacing: 0;
}

.toolbox-hero h1 {
  margin: 0 0 10px;
  font-size: 34px;
  line-height: 1.15;
  letter-spacing: 0;
}

.toolbox-hero p:last-child {
  max-width: 720px;
  margin: 0;
  color: #b8bbc7;
  line-height: 1.7;
}

.toolbox-list {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
}

.toolbox-card {
  width: 100%;
  min-height: 116px;
  display: grid;
  grid-template-columns: 58px 1fr 32px;
  gap: 18px;
  align-items: center;
  padding: 20px;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: #1d1d20;
  color: inherit;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.toolbox-card:hover {
  transform: translateY(-2px);
  border-color: rgba(124, 131, 255, 0.58);
  background: #24242a;
}

.toolbox-icon {
  width: 58px;
  height: 58px;
  display: inline-grid;
  place-items: center;
  border-radius: 8px;
  background: #2b2b34;
  font-size: 27px;
}

.toolbox-card-main {
  display: grid;
  gap: 6px;
}

.toolbox-card-main strong {
  font-size: 18px;
  letter-spacing: 0;
}

.toolbox-card-main em {
  width: fit-content;
  padding: 2px 8px;
  border-radius: 5px;
  background: rgba(124, 131, 255, 0.16);
  color: #aeb2ff;
  font-size: 12px;
  font-style: normal;
  font-weight: 800;
}

.toolbox-card-main span {
  color: #b8bbc7;
  line-height: 1.55;
}

.toolbox-arrow {
  color: #aeb2ff;
  font-size: 32px;
}

@media (max-width: 720px) {
  .toolbox-hub {
    padding: 20px;
  }

  .toolbox-card {
    grid-template-columns: 48px 1fr;
  }

  .toolbox-icon {
    width: 48px;
    height: 48px;
  }

  .toolbox-arrow {
    display: none;
  }
}
</style>
