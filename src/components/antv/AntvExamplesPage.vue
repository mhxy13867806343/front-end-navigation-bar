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

<style scoped lang="scss">
.antv-page {
  min-height: 100vh;
  padding: 28px;
  color: #f8fafc;
  background:
    radial-gradient(circle at 76% 12%, color-mix(in srgb, var(--accent), transparent 70%), transparent 30%),
    linear-gradient(135deg, #07111f 0%, #111827 50%, #15120d 100%);
}

.antv-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 460px);
  gap: 24px;
  align-items: stretch;
  max-width: 1320px;
  margin: 0 auto 18px;
}

.hero-copy,
.visual-stage,
.catalog-sidebar,
.example-list,
.flow-panel,
.stats-strip span {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.6);
}

.hero-copy {
  min-width: 0;
  padding: 28px;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

h1 {
  max-width: 820px;
  margin: 0;
  font-size: clamp(2.35rem, 5vw, 5.7rem);
  line-height: 0.95;
  letter-spacing: 0;
}

.hero-copy > p:last-of-type {
  max-width: 760px;
  margin: 18px 0 0;
  color: rgba(226, 232, 240, 0.76);
  font-size: 1.02rem;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

button {
  color: inherit;
  font: inherit;
}

.hero-actions button,
.card-actions button,
.category-list button,
.tier-tabs button {
  border: 1px solid rgba(148, 163, 184, 0.26);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.44);
  cursor: pointer;
}

.hero-actions button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
}

.hero-actions .primary-action {
  border-color: color-mix(in srgb, var(--accent), white 12%);
  background: var(--accent);
  color: #06101f;
  font-weight: 900;
}

.visual-stage {
  position: relative;
  min-height: 330px;
  overflow: hidden;
  padding: 22px;
}

.table-preview {
  display: grid;
  gap: 10px;
  height: 100%;
  padding-top: 18px;
}

.table-row {
  display: grid;
  grid-template-columns: 1.2fr repeat(4, 1fr);
  gap: 10px;
}

.table-row span,
.phone-top,
.phone-lines,
.phone-chart span {
  border-radius: 6px;
  background: var(--accent);
}

.table-row span {
  min-height: 34px;
}

.graph-preview,
.map-preview {
  position: absolute;
  inset: 0;
}

.node,
.pin {
  position: absolute;
  display: block;
  width: 28px;
  height: 28px;
  border: 4px solid rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  background: var(--accent);
}

.node-1 { left: 12%; top: 20%; }
.node-2 { left: 36%; top: 12%; }
.node-3 { left: 62%; top: 24%; }
.node-4 { left: 24%; top: 46%; }
.node-5 { left: 50%; top: 48%; }
.node-6 { left: 78%; top: 50%; }
.node-7 { left: 20%; top: 72%; }
.node-8 { left: 52%; top: 78%; }
.node-9 { left: 82%; top: 76%; }

.edge,
.map-line {
  position: absolute;
  display: block;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  transform-origin: left center;
}

.edge-1 { left: 16%; top: 27%; width: 110px; transform: rotate(-16deg); }
.edge-2 { left: 40%; top: 19%; width: 110px; transform: rotate(20deg); }
.edge-3 { left: 28%; top: 50%; width: 120px; transform: rotate(2deg); }
.edge-4 { left: 55%; top: 54%; width: 130px; transform: rotate(8deg); }
.edge-5 { left: 25%; top: 73%; width: 130px; transform: rotate(5deg); }
.edge-6 { left: 53%; top: 78%; width: 120px; transform: rotate(-4deg); }
.edge-7 { left: 48%; top: 48%; width: 110px; transform: rotate(-58deg); }
.edge-8 { left: 34%; top: 20%; width: 118px; transform: rotate(72deg); }

.mobile-preview {
  width: min(220px, 72%);
  height: 100%;
  min-height: 286px;
  margin: 0 auto;
  padding: 18px;
  border: 10px solid rgba(255, 255, 255, 0.16);
  border-radius: 28px;
  background: rgba(2, 6, 23, 0.62);
}

.phone-top {
  width: 72px;
  height: 8px;
  margin: 0 auto 28px;
  opacity: 0.7;
}

.phone-chart {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 138px;
}

.phone-chart span {
  flex: 1;
}

.phone-lines {
  height: 44px;
  margin-top: 24px;
  opacity: 0.22;
}

.pin-1 { left: 18%; top: 26%; }
.pin-2 { left: 36%; top: 42%; }
.pin-3 { left: 58%; top: 32%; }
.pin-4 { left: 78%; top: 52%; }
.pin-5 { left: 28%; top: 68%; }
.pin-6 { left: 54%; top: 74%; }
.pin-7 { left: 72%; top: 22%; }
.map-line-1 { left: 22%; top: 31%; width: 180px; transform: rotate(18deg); }
.map-line-2 { left: 40%; top: 47%; width: 180px; transform: rotate(-22deg); }
.map-line-3 { left: 32%; top: 70%; width: 170px; transform: rotate(5deg); }
.map-line-4 { left: 58%; top: 36%; width: 120px; transform: rotate(46deg); }

.stats-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  max-width: 1320px;
  margin: 0 auto 18px;
}

.stats-strip span {
  min-height: 86px;
  padding: 15px;
}

.stats-strip strong,
.stats-strip em {
  display: block;
}

.stats-strip strong {
  font-size: 1.45rem;
}

.stats-strip em {
  margin-top: 10px;
  color: rgba(226, 232, 240, 0.62);
  font-style: normal;
}

.catalog-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 300px;
  gap: 16px;
  max-width: 1320px;
  margin: 0 auto;
}

.catalog-sidebar,
.example-list,
.flow-panel {
  min-width: 0;
  padding: 16px;
}

.tier-tabs {
  display: grid;
  gap: 8px;
}

.tier-tabs button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 52px;
  padding: 0 12px;
}

.tier-tabs button.active,
.category-list button.active {
  border-color: color-mix(in srgb, var(--accent), white 12%);
  background: color-mix(in srgb, var(--accent), transparent 82%);
}

.tier-tabs span,
.category {
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 900;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  margin: 14px 0;
  padding: 0 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.36);
}

.search-box input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  color: #f8fafc;
  background: transparent;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-list button {
  min-height: 34px;
  padding: 0 10px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin-bottom: 14px;
}

.section-head h2,
.flow-panel h2 {
  margin: 0;
  font-size: 1.35rem;
}

.section-head > strong {
  color: var(--accent);
  font-size: 1.6rem;
}

.example-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 94px;
  gap: 16px;
  min-height: 152px;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.34);
}

.example-card + .example-card {
  margin-top: 10px;
}

.example-card h3 {
  margin: 8px 0 8px;
  font-size: 1.1rem;
}

.example-card p {
  margin: 0;
  color: rgba(226, 232, 240, 0.68);
  line-height: 1.65;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.tag-row em {
  padding: 4px 8px;
  border-radius: 999px;
  color: rgba(226, 232, 240, 0.78);
  background: rgba(148, 163, 184, 0.14);
  font-size: 0.75rem;
  font-style: normal;
}

.card-actions {
  display: grid;
  grid-template-columns: repeat(2, 40px);
  gap: 8px;
  align-content: start;
  justify-content: end;
}

.card-actions button {
  width: 40px;
  height: 40px;
}

.flow-panel ol {
  display: grid;
  gap: 12px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.flow-panel li {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
}

.flow-panel li > span {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  color: #06101f;
  background: var(--accent);
  font-weight: 900;
}

.flow-panel strong,
.flow-panel em {
  display: block;
}

.flow-panel em {
  margin-top: 4px;
  color: rgba(226, 232, 240, 0.58);
  font-style: normal;
}

.empty-state {
  display: grid;
  place-items: center;
  min-height: 220px;
  border: 1px dashed rgba(148, 163, 184, 0.28);
  border-radius: 8px;
  color: rgba(226, 232, 240, 0.68);
}

@media (max-width: 1180px) {
  .catalog-shell {
    grid-template-columns: 1fr;
  }

  .catalog-sidebar {
    position: static;
  }
}

@media (max-width: 860px) {
  .antv-page {
    padding: 18px;
  }

  .antv-hero,
  .stats-strip {
    grid-template-columns: 1fr;
  }

  .visual-stage {
    min-height: 280px;
  }
}

@media (max-width: 560px) {
  h1 {
    font-size: 2.35rem;
  }

  .example-card {
    grid-template-columns: 1fr;
  }

  .card-actions {
    justify-content: start;
  }
}
</style>
