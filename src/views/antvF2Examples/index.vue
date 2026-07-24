<script setup lang="ts">
import AntvExamplesPage from '@/components/antv/AntvExamplesPage.vue'
import type { AntvExampleItem, AntvProductStat } from '@/components/antv/types'

const stats: AntvProductStat[] = [
  { label: '官网版本', value: '5.10.0' },
  { label: '定位', value: '移动端' },
  { label: '图表类型', value: 'Line / Pie' },
  { label: '交互特点', value: '触摸友好' }
]

const examples: AntvExampleItem[] = [
  {
    name: '基础折线图',
    category: '折线图',
    tier: 'basic',
    desc: '官网基础折线图入口，适合移动端趋势展示和小屏幕数据走势表达。',
    url: 'https://f2.antv.antgroup.com/examples#line-line',
    tags: ['Line', '趋势', '移动端']
  },
  {
    name: '基础面积图',
    category: '面积图',
    tier: 'basic',
    desc: '基础面积图适合展示连续数据规模变化，并在移动端保留较强的视觉对比。',
    url: 'https://f2.antv.antgroup.com/examples#area-area',
    tags: ['Area', '连续', '规模']
  },
  {
    name: '基础柱状图',
    category: '柱状图',
    tier: 'basic',
    desc: '柱状图和条形图是移动端分类比较的基础图表，官网提供基础、分组、堆叠形态。',
    url: 'https://f2.antv.antgroup.com/examples#column-column',
    tags: ['Column', 'Bar', '分类']
  },
  {
    name: '基础饼图',
    category: '饼图',
    tier: 'basic',
    desc: '官网饼图目录包含基础饼图、环形图和玫瑰图，适合移动端占比分析。',
    url: 'https://f2.antv.antgroup.com/examples#pie-pie',
    tags: ['Pie', 'Donut', '占比']
  },
  {
    name: '走势对比',
    category: '对比折线图',
    tier: 'advanced',
    desc: '对比折线图用于多指标趋势比较，官网还包括虚实线对比和折线描点。',
    url: 'https://f2.antv.antgroup.com/examples#line-multiple',
    tags: ['多指标', '对比', '描点']
  },
  {
    name: '柱状图动态排序',
    category: '场景案例',
    tier: 'advanced',
    desc: '动态排序场景强化移动端动画叙事，适合榜单、排名和指标变化展示。',
    url: 'https://f2.antv.antgroup.com/examples#creative-case',
    tags: ['动态排序', '榜单', '动画']
  },
  {
    name: '雷达图动画',
    category: '雷达图',
    tier: 'advanced',
    desc: '移动端能力维度对比场景，配合动画强化多指标分布的阅读节奏。',
    url: 'https://f2.antv.antgroup.com/examples#radar-radar',
    tags: ['Radar', '动画', '多维']
  },
  {
    name: '标注与图例',
    category: '功能组件',
    tier: 'advanced',
    desc: '官网功能组件目录提供标注、图例、图形标签、坐标轴 Axis 和放大镜。',
    url: 'https://f2.antv.antgroup.com/examples#component-guide',
    tags: ['Guide', 'Legend', 'Axis']
  },
  {
    name: 'Apple Watch 健身记录',
    category: '场景案例',
    tier: 'expert',
    desc: '官方移动端场景案例，贴近穿戴设备健康数据展示，覆盖环形和多指标表达。',
    url: 'https://f2.antv.antgroup.com/examples#creative-case',
    tags: ['Apple Watch', '健康', '场景']
  },
  {
    name: '横屏展示',
    category: '场景案例',
    tier: 'expert',
    desc: '移动端横屏图表展示场景，适合看板、全屏趋势和宽屏交互。',
    url: 'https://f2.antv.antgroup.com/examples#creative-case',
    tags: ['横屏', '全屏', '看板']
  },
  {
    name: '旭日图 / 矩形树图 / 火焰图',
    category: '关系图',
    tier: 'expert',
    desc: '移动端关系与层级图表目录，覆盖 Sunburst、Treemap、Flamegraph 等复杂结构。',
    url: 'https://f2.antv.antgroup.com/examples#relation-sunburst',
    tags: ['Sunburst', 'Treemap', 'Flamegraph']
  },
  {
    name: '手绘风格插件',
    category: '插件',
    tier: 'expert',
    desc: '官网插件示例提供手绘风格视觉效果，让移动端图表具备更强表达个性。',
    url: 'https://f2.antv.antgroup.com/examples#creative-plugin',
    tags: ['插件', '手绘', '风格']
  }
]
</script>

<template>
  <AntvExamplesPage
    product="F2"
    title="F2 移动端图表示例目录"
    subtitle="根据 F2 官网示例整理折线图、面积图、柱状图、饼图、关系图和移动端场景案例，从小屏基础图表到高级交互展示。"
    official-url="https://f2.antv.antgroup.com/examples"
    accent="#60a5fa"
    visual="mobile"
    :stats="stats"
    :examples="examples"
  />
</template>
