<script setup lang="ts">
import copy from 'clipboard-copy'
import { ElMessage } from 'element-plus'
import type { ThreeCodeBlock } from '../types'

defineProps<{
  blocks: ThreeCodeBlock[]
}>()

const copyCode = async (content: string): Promise<void> => {
  await copy(content)
  ElMessage.success('代码片段已复制')
}
</script>

<template>
  <section class="code-block-panel">
    <div class="code-block-panel__head">
      <strong>核心代码片段</strong>
      <p>保留关键结构与 API 调用方式，便于理解和迁移到你自己的项目里。</p>
    </div>
    <article v-for="block in blocks" :key="block.title" class="code-block-panel__item">
      <header>
        <div>
          <strong>{{ block.title }}</strong>
          <em>{{ block.language }}</em>
        </div>
        <button type="button" @click="copyCode(block.content)">复制代码</button>
      </header>
      <pre><code>{{ block.content }}</code></pre>
    </article>
  </section>
</template>

<style scoped lang="scss">
.code-block-panel {
  display: grid;
  gap: 18px;
}

.code-block-panel__head strong {
  display: block;
  font-size: 20px;
  color: #eff4ff;
}

.code-block-panel__head p {
  margin: 8px 0 0;
  color: rgba(214, 225, 255, 0.72);
  line-height: 1.7;
}

.code-block-panel__item {
  border-radius: 24px;
  border: 1px solid rgba(102, 136, 255, 0.18);
  background: rgba(6, 10, 24, 0.96);
  overflow: hidden;
}

.code-block-panel__item header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(102, 136, 255, 0.12);
}

.code-block-panel__item header strong {
  display: block;
  color: #f3f7ff;
}

.code-block-panel__item header em {
  display: inline-block;
  margin-top: 6px;
  color: #7ceeff;
  font-size: 12px;
  font-style: normal;
  text-transform: uppercase;
}

.code-block-panel__item button {
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(120, 146, 255, 0.22);
  background: rgba(18, 24, 48, 0.92);
  color: #eff4ff;
  cursor: pointer;
}

.code-block-panel__item pre {
  margin: 0;
  padding: 18px 20px 22px;
  overflow-x: auto;
  color: #d6ebff;
  font-size: 13px;
  line-height: 1.7;
}
</style>
