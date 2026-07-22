<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CodeBlockPanel from './components/CodeBlockPanel.vue'
import ParameterPanel from './components/ParameterPanel.vue'
import SceneCanvas from './components/SceneCanvas.vue'
import { getExampleById } from './data/catalog'

const route = useRoute()
const router = useRouter()

const example = computed(() => getExampleById(String(route.params.id || 'basic-cube')))
const parameterState = ref<Record<string, string | number | boolean>>({})

watch(example, (value) => {
  parameterState.value = Object.fromEntries((value?.parameters || []).map(item => [item.key, item.value]))
}, { immediate: true })
</script>

<template>
  <main v-if="example" class="three-example-detail">
    <section class="detail-hero">
      <div>
        <p class="detail-hero__eyebrow">{{ example.heroLabel }}</p>
        <h1>{{ example.title }}</h1>
        <p class="detail-hero__desc">{{ example.summary }}</p>
        <div class="detail-hero__chips">
          <span>{{ example.sceneType }}</span>
          <span>{{ example.difficulty }}</span>
          <span v-for="tag in example.tags" :key="tag">{{ tag }}</span>
        </div>
      </div>
      <div class="detail-hero__actions">
        <button type="button" class="primary-btn" @click="router.push('/three-showcase')">返回示例中心</button>
        <button type="button" class="ghost-btn" @click="router.push('/three-showcase/lab')">去看互动实验区</button>
      </div>
    </section>

    <section class="detail-layout">
      <div class="detail-layout__stage">
        <SceneCanvas :scene-id="example.id" :params="parameterState" />
      </div>
      <aside class="detail-layout__side">
        <ParameterPanel v-model="parameterState" :parameters="example.parameters" />
        <section class="detail-info-card">
          <strong>知识点</strong>
          <ul>
            <li v-for="item in example.knowledgePoints" :key="item">{{ item }}</li>
          </ul>
        </section>
        <section class="detail-info-card">
          <strong>适用场景</strong>
          <ul>
            <li v-for="item in example.useCases" :key="item">{{ item }}</li>
          </ul>
        </section>
      </aside>
    </section>

    <CodeBlockPanel :blocks="example.codeBlocks" />
  </main>
</template>

<style scoped lang="scss" src="./css/example.scss"></style>
