<script setup lang="ts">
import AntvExamplesPage from '@/components/antv/AntvExamplesPage.vue'
import type { AntvExampleItem, AntvProductStat } from '@/components/antv/types'

const stats: AntvProductStat[] = [
  { label: '数据形态', value: '透视 / 明细' },
  { label: '核心能力', value: '多维分析' },
  { label: '渲染模式', value: 'Canvas' },
  { label: '组件层', value: 'React / Vue' }
]

const examples: AntvExampleItem[] = [
  {
    name: '透视表',
    category: '表格基础',
    tier: 'basic',
    desc: '官网核心基础示例，用交叉表承载行列维度与指标值，适合 BI 多维探索分析。',
    url: 'https://s2.antv.antgroup.com/examples#pivot',
    tags: ['PivotSheet', '交叉表', '多维']
  },
  {
    name: '明细表',
    category: '表格基础',
    tier: 'basic',
    desc: '普通明细数据的基础表格形态，提供冻结、滚动、单元格查看和字段展示能力。',
    url: 'https://s2.antv.antgroup.com/examples#table',
    tags: ['TableSheet', '明细', '字段']
  },
  {
    name: '内置主题',
    category: '主题',
    tier: 'basic',
    desc: '展示浅色、深色等内置主题，快速验证表格视觉风格与业务系统的适配效果。',
    url: 'https://s2.antv.antgroup.com/examples#theme',
    tags: ['主题', '深色', '浅色']
  },
  {
    name: '基础交互',
    category: '交互',
    tier: 'basic',
    desc: '鼠标悬停、选中、刷选、复制等常见表格交互入口，适合先建立 S2 操作模型。',
    url: 'https://s2.antv.antgroup.com/examples#interaction',
    tags: ['选中', '复制', '刷选']
  },
  {
    name: '复制与导出',
    category: '数据操作',
    tier: 'advanced',
    desc: '官网示例包含带表头复制、导出 CSV、保留格式化信息等表格数据流出能力。',
    url: 'https://s2.antv.antgroup.com/examples#copy-export',
    tags: ['CSV', '复制', '导出']
  },
  {
    name: '维度切换组件',
    category: '分析组件',
    tier: 'advanced',
    desc: '通过 Switcher 组件实现行列维度动态切换，在透视表与明细表之间复用分析配置。',
    url: 'https://s2.antv.antgroup.com/examples#switcher',
    tags: ['Switcher', '行列切换', '分析']
  },
  {
    name: '高级排序组件',
    category: '分析组件',
    tier: 'advanced',
    desc: '支持维度值列表 sortBy、组内排序等分析排序能力，适合复杂报表探索。',
    url: 'https://s2.antv.antgroup.com/examples#advanced-sort',
    tags: ['AdvancedSort', '排序', '组内']
  },
  {
    name: '趋势分析表',
    category: '场景表',
    tier: 'advanced',
    desc: '在单元格内展示多指标趋势、同环比与 mini 图，覆盖经营分析看板里的表格趋势场景。',
    url: 'https://s2.antv.antgroup.com/examples#strategy',
    tags: ['趋势', 'Mini Chart', '同环比']
  },
  {
    name: '自定义单元格渲染',
    category: '自定义渲染',
    tier: 'expert',
    desc: '基于 AntV/G 在单元格 Group 内绘制自定义图形、图片或任意 G 图表库内容。',
    url: 'https://s2.antv.antgroup.com/examples#custom-cell',
    tags: ['AntV/G', '自定义', '图片']
  },
  {
    name: '自定义交互',
    category: '自定义交互',
    tier: 'expert',
    desc: '使用 S2Event 和自定义交互类扩展内置行为，例如明细表双击隐藏列头。',
    url: 'https://s2.antv.antgroup.com/examples#custom-interaction',
    tags: ['S2Event', '扩展', '隐藏列头']
  },
  {
    name: '按需渲染性能',
    category: '性能',
    tier: 'expert',
    desc: 'S2 基于 Canvas 只渲染可视区域单元格，官网性能示例对比表框架渲染时间。',
    url: 'https://s2.antv.antgroup.com/examples#performance',
    tags: ['Canvas', '按需渲染', '性能']
  },
  {
    name: '服务端渲染与图片导出',
    category: '导出',
    tier: 'expert',
    desc: '覆盖 SSR、生成表格图片、导出透视表与明细表等高级交付场景。',
    url: 'https://s2.antv.antgroup.com/examples#export',
    tags: ['SSR', '图片', '报表']
  }
]
</script>

<template>
  <AntvExamplesPage
    product="S2"
    title="S2 多维表格示例目录"
    subtitle="根据 S2 官网示例整理透视表、明细表、分析组件、自定义渲染和性能导出路径，从基础表格一路看到高级分析场景。"
    official-url="https://s2.antv.antgroup.com/examples"
    accent="#5eead4"
    visual="table"
    :stats="stats"
    :examples="examples"
  />
</template>
