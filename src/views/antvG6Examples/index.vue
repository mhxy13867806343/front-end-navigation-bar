<script setup lang="ts">
import AntvExamplesPage from '@/components/antv/AntvExamplesPage.vue'
import type { AntvExampleItem, AntvProductStat } from '@/components/antv/types'

const stats: AntvProductStat[] = [
  { label: '官网版本', value: '5.1.1' },
  { label: '示例方向', value: '图可视化' },
  { label: '核心对象', value: '节点 / 边' },
  { label: '高级能力', value: '算法 / 性能' }
]

const examples: AntvExampleItem[] = [
  {
    name: '主题切换',
    category: '特性',
    tier: 'basic',
    desc: '官网特性示例，展示图主题在不同视觉风格之间切换的基础能力。',
    url: 'https://g6.antv.antgroup.com/examples#feature-theme',
    tags: ['主题', '样式', '特性']
  },
  {
    name: '组织架构',
    category: '场景案例',
    tier: 'basic',
    desc: '典型层级关系图场景，适合入门理解节点、边、布局和业务标签的组合。',
    url: 'https://g6.antv.antgroup.com/examples#case-organization',
    tags: ['组织架构', '层级', '业务']
  },
  {
    name: '圆形 / 矩形 / 图片节点',
    category: '节点',
    tier: 'basic',
    desc: '官网元素示例覆盖圆形、矩形、圆角矩形、图片、HTML 节点等基础节点形态。',
    url: 'https://g6.antv.antgroup.com/examples#element-node',
    tags: ['节点', 'HTML', '图片']
  },
  {
    name: '直线 / 折线 / 贝塞尔边',
    category: '边',
    tier: 'basic',
    desc: '学习直线、折线、正交线、二次/三次贝塞尔曲线和箭头等边类型。',
    url: 'https://g6.antv.antgroup.com/examples#element-edge',
    tags: ['边', '箭头', '曲线']
  },
  {
    name: 'Dagre 流程图',
    category: '图布局',
    tier: 'advanced',
    desc: '官网 Dagre 布局示例适合流程图、有向图和带 Combo 的复杂业务流。',
    url: 'https://g6.antv.antgroup.com/examples#layout-dagre',
    tags: ['Dagre', '流程图', 'Combo']
  },
  {
    name: 'Force Atlas 2',
    category: '力导向图布局',
    tier: 'advanced',
    desc: '力导向布局用于关系网络聚类和节点分布，官网包含聚类、防重叠和 3D 力导向示例。',
    url: 'https://g6.antv.antgroup.com/examples#layout-force-directed',
    tags: ['Force', '聚类', '3D']
  },
  {
    name: '高亮相邻节点',
    category: '交互',
    tier: 'advanced',
    desc: '在复杂图中聚焦当前节点及相邻关系，适合关系网络探索和路径追踪。',
    url: 'https://g6.antv.antgroup.com/examples#behavior-highlight-element',
    tags: ['高亮', '邻居', '交互']
  },
  {
    name: 'Minimap 小地图',
    category: '插件',
    tier: 'advanced',
    desc: '插件示例展示大图浏览中的缩略导航能力，配合 Toolbar、Tooltip、Legend 更完整。',
    url: 'https://g6.antv.antgroup.com/examples#plugin-minimap',
    tags: ['插件', '导航', '小地图']
  },
  {
    name: '图算法应用',
    category: '算法',
    tier: 'expert',
    desc: '官网算法目录包含图模式匹配、最短路径、LP 自动聚类和 LOUVAIN 自动聚类。',
    url: 'https://g6.antv.antgroup.com/examples#algorithm-case',
    tags: ['最短路径', 'LOUVAIN', '聚类']
  },
  {
    name: '大数据量',
    category: '性能',
    tier: 'expert',
    desc: '性能示例覆盖 5000+、约 20000、60000+ 元素，适合评估复杂关系网络渲染。',
    url: 'https://g6.antv.antgroup.com/examples#performance-massive-data',
    tags: ['5000+', '60000+', '性能']
  },
  {
    name: '边绑定与过滤镜',
    category: '高级插件',
    tier: 'expert',
    desc: 'EdgeBundling 和 EdgeFilterLens 用于减少边交叉、过滤密集关系，提升复杂图可读性。',
    url: 'https://g6.antv.antgroup.com/examples#plugin-edge-bundling',
    tags: ['EdgeBundling', 'Lens', '密集图']
  },
  {
    name: '自定义 React 节点',
    category: '自定义节点',
    tier: 'expert',
    desc: '在 G6 节点中嵌入 React/G2 活动图等自定义内容，扩展业务节点表现力。',
    url: 'https://g6.antv.antgroup.com/examples#element-custom-node',
    tags: ['React', 'G2', '自定义']
  }
]
</script>

<template>
  <AntvExamplesPage
    product="G6"
    title="G6 图可视化示例目录"
    subtitle="根据 G6 官网示例整理特性、场景案例、图布局、元素、交互、插件、算法和性能路径，从节点边基础到 60000+ 元素高级场景。"
    official-url="https://g6.antv.antgroup.com/examples"
    accent="#c084fc"
    visual="graph"
    :stats="stats"
    :examples="examples"
  />
</template>
