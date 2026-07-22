<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ExampleCard from './components/ExampleCard.vue'
import { allExamples, exampleCategories, featuredHighlights, getFeaturedExamples, learningSteps } from './data/catalog'
import type { ThreeExampleMeta, ThreeCategory } from './types'

const router = useRouter()
const activeCategory = ref<ThreeCategory | 'all'>('all')

const featuredExamples = computed<ThreeExampleMeta[]>(() => getFeaturedExamples())
const visibleExamples = computed<ThreeExampleMeta[]>(() => {
  if (activeCategory.value === 'all') return allExamples
  return allExamples.filter(item => item.category === activeCategory.value)
})

const openExample = (item: ThreeExampleMeta): void => {
  if (item.category === 'game') {
    void router.push({ path: '/three-showcase/lab', query: { game: item.id } })
    return
  }
  void router.push(`/three-showcase/example/${item.id}`)
}
const openExternalUrl = (url: string): void => {
  window.open(url, '_blank')
}
</script>

<template>
  <main class="three-showcase-home">
    <section class="three-showcase-hero">
      <div class="three-showcase-hero__content">
        <p class="three-showcase-hero__eyebrow">Three.js 示例中心</p>
        <h1>从基础到高级，把 3D 场景、代码与小游戏都放到一个入口里。</h1>
        <p class="three-showcase-hero__desc">
          这里不是静态截图墙，而是可直接点击进入的 Three.js 展示区。你可以先看效果，再看代码，再调参数，最后进入互动实验区试玩。
        </p>
        <div class="three-showcase-hero__actions">
          <button type="button" class="primary-btn" @click="router.push('/three-showcase/example/basic-cube')">从基础立方体开始</button>
          <button type="button" class="ghost-btn" @click="router.push('/three-showcase/lab')">进入互动实验区</button>
          <button type="button" class="ghost-btn" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;" @click="openExternalUrl('https://mp.weixin.qq.com/s/J62wvjNYy79h5dFDRo1Vcw')">
            📰 微信图文教程
          </button>
        </div>
      </div>
      <div class="three-showcase-hero__highlights">
        <article v-for="item in featuredHighlights" :key="item.title" class="highlight-card" :class="`highlight-card--${item.accent}`">
          <strong>{{ item.title }}</strong>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="three-showcase-featured">
      <div class="section-title">
        <div>
          <p>精选案例</p>
          <h2>先看最值得点进去的几个 Three.js 示例</h2>
        </div>
      </div>
      <div class="featured-grid">
        <ExampleCard v-for="item in featuredExamples" :key="item.id" :item="item" @open="openExample" />
      </div>
    </section>

    <section class="three-showcase-filter">
      <div class="section-title">
        <div>
          <p>分类浏览</p>
          <h2>按基础、进阶、粒子、实验、游戏快速切换</h2>
        </div>
      </div>
      <div class="category-tabs">
        <button type="button" :class="{ active: activeCategory === 'all' }" @click="activeCategory = 'all'">全部</button>
        <button
          v-for="category in exampleCategories"
          :key="category.key"
          type="button"
          :class="{ active: activeCategory === category.key }"
          @click="activeCategory = category.key"
        >
          {{ category.label }}
        </button>
      </div>
      <div class="example-grid">
        <ExampleCard v-for="item in visibleExamples" :key="item.id" :item="item" @open="openExample" />
      </div>
    </section>

    <section class="three-showcase-steps">
      <div class="section-title">
        <div>
          <p>学习路径</p>
          <h2>跟着这条路线，从能看到立方体到能做小游戏</h2>
        </div>
      </div>
      <div class="steps-grid">
        <article v-for="(step, index) in learningSteps" :key="step.title" class="step-card">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ step.title }}</strong>
          <p>{{ step.description }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
