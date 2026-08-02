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

<style scoped lang="scss" src="./css/CodeBlockPanel.scss"></style>
