<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument, Link, Search } from '@element-plus/icons-vue'
import { copyToClipboard } from '@/utils/clipboard'
import type { AntvExampleItem, AntvExampleTier, AntvProductStat, AntvVisualKind } from './types'

interface AntvExamplesPageProps {
  product: string
  title: string
  subtitle: string
  officialUrl: string
  accent: string
  visual: AntvVisualKind
  stats: AntvProductStat[]
  examples: AntvExampleItem[]
}

const props = defineProps<AntvExamplesPageProps>()

const tierLabels: Record<AntvExampleTier, string> = {
  basic: '基础',
  advanced: '进阶',
  expert: '高级'
}

const tierOrder: AntvExampleTier[] = ['basic', 'advanced', 'expert']
const activeTier = ref<AntvExampleTier>('basic')
const activeCategory = ref<string>('全部')
const keyword = ref<string>('')

const categories = computed<string[]>((): string[] => {
  return ['全部', ...Array.from(new Set(props.examples.map((item: AntvExampleItem): string => item.category)))]
})

const filteredExamples = computed<AntvExampleItem[]>((): AntvExampleItem[] => {
  const normalizedKeyword: string = keyword.value.trim().toLowerCase()
  return props.examples.filter((item: AntvExampleItem): boolean => {
    const matchesTier: boolean = item.tier === activeTier.value
    const matchesCategory: boolean = activeCategory.value === '全部' || item.category === activeCategory.value
    const searchableText: string = `${item.name} ${item.category} ${item.desc} ${item.tags.join(' ')}`.toLowerCase()
    return matchesTier && matchesCategory && (!normalizedKeyword || searchableText.includes(normalizedKeyword))
  })
})

const tierCounts = computed<Record<AntvExampleTier, number>>((): Record<AntvExampleTier, number> => {
  return tierOrder.reduce((acc: Record<AntvExampleTier, number>, tier: AntvExampleTier): Record<AntvExampleTier, number> => {
    acc[tier] = props.examples.filter((item: AntvExampleItem): boolean => item.tier === tier).length
    return acc
  }, { basic: 0, advanced: 0, expert: 0 })
})

const activeExamples = computed<AntvExampleItem[]>((): AntvExampleItem[] => {
  return props.examples.filter((item: AntvExampleItem): boolean => item.tier === activeTier.value).slice(0, 6)
})

function openOfficial(): void {
  window.open(props.officialUrl, '_blank')
}

function openExample(item: AntvExampleItem): void {
  window.open(item.url, '_blank')
}

async function copyExample(item: AntvExampleItem): Promise<void> {
  await copyToClipboard(`${item.name}\n${item.desc}\n${item.url}`, `${props.product} 示例信息已复制`)
}

function clearFilters(): void {
  keyword.value = ''
  activeCategory.value = '全部'
  ElMessage.success('已重置示例筛选')
}
</script>

<template>
  <main class="antv-page" :style="{ '--accent': accent }">
    <section class="antv-hero">
      <div class="hero-copy">
        <p class="eyebrow">AntV Official Examples</p>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
        <div class="hero-actions">
          <button type="button" class="primary-action" @click="openOfficial">
            <el-icon><Link /></el-icon>
            官网示例
          </button>
          <button type="button" @click="clearFilters">
            <el-icon><Search /></el-icon>
            重置筛选
          </button>
        </div>
      </div>

      <div class="visual-stage" :class="`visual-${visual}`" aria-hidden="true">
        <div v-if="visual === 'table'" class="table-preview">
          <div v-for="row in 6" :key="row" class="table-row">
            <span v-for="col in 5" :key="col" :style="{ opacity: String(0.35 + row * col * 0.018) }"></span>
          </div>
        </div>
        <div v-else-if="visual === 'graph'" class="graph-preview">
          <span v-for="node in 9" :key="node" :class="`node node-${node}`"></span>
          <i v-for="edge in 8" :key="edge" :class="`edge edge-${edge}`"></i>
        </div>
        <div v-else-if="visual === 'mobile'" class="mobile-preview">
          <div class="phone-top"></div>
          <div class="phone-chart">
            <span v-for="bar in 7" :key="bar" :style="{ height: `${24 + bar * 8}px` }"></span>
          </div>
          <div class="phone-lines"></div>
        </div>
        <div v-else class="map-preview">
          <span v-for="pin in 7" :key="pin" :class="`pin pin-${pin}`"></span>
          <i v-for="line in 4" :key="line" :class="`map-line map-line-${line}`"></i>
        </div>
      </div>
    </section>

    <section class="stats-strip" aria-label="产品信息">
      <span v-for="stat in stats" :key="stat.label">
        <strong>{{ stat.value }}</strong>
        <em>{{ stat.label }}</em>
      </span>
    </section>

    <section class="catalog-shell">
      <aside class="catalog-sidebar" aria-label="示例筛选">
        <div class="tier-tabs">
          <button
            v-for="tier in tierOrder"
            :key="tier"
            type="button"
            :class="{ active: activeTier === tier }"
            @click="activeTier = tier"
          >
            <strong>{{ tierLabels[tier] }}</strong>
            <span>{{ tierCounts[tier] }} 项</span>
          </button>
        </div>

        <label class="search-box">
          <el-icon><Search /></el-icon>
          <input v-model="keyword" type="search" placeholder="搜索示例、分类或标签" />
        </label>

        <div class="category-list">
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            :class="{ active: activeCategory === category }"
            @click="activeCategory = category"
          >
            {{ category }}
          </button>
        </div>
      </aside>

      <section class="example-list" aria-label="官网示例数据">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ tierLabels[activeTier] }} Examples</p>
            <h2>{{ product }} 官网示例目录</h2>
          </div>
          <strong>{{ filteredExamples.length }} 项</strong>
        </div>

        <article v-for="item in filteredExamples" :key="`${item.tier}-${item.category}-${item.name}`" class="example-card">
          <div>
            <span class="category">{{ item.category }}</span>
            <h3>{{ item.name }}</h3>
            <p>{{ item.desc }}</p>
            <div class="tag-row">
              <em v-for="tag in item.tags" :key="tag">{{ tag }}</em>
            </div>
          </div>
          <div class="card-actions">
            <button type="button" title="复制示例信息" @click="copyExample(item)">
              <el-icon><CopyDocument /></el-icon>
            </button>
            <button type="button" title="打开官网示例" @click="openExample(item)">
              <el-icon><Link /></el-icon>
            </button>
          </div>
        </article>

        <div v-if="filteredExamples.length === 0" class="empty-state">
          没有匹配的官网示例，换个关键词试试。
        </div>
      </section>

      <aside class="flow-panel" aria-label="从基础到高级路径">
        <p class="eyebrow">Learning Path</p>
        <h2>从基础到高级</h2>
        <ol>
          <li v-for="(item, index) in activeExamples" :key="item.name">
            <span>{{ index + 1 }}</span>
            <div>
              <strong>{{ item.name }}</strong>
              <em>{{ item.category }}</em>
            </div>
          </li>
        </ol>
      </aside>
    </section>
  </main>
</template>

<style scoped lang="scss" src="./css/AntvExamplesPage.scss"></style>
