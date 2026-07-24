<script setup lang="ts">
import AntvExamplesPage from '@/components/antv/AntvExamplesPage.vue'
import type { AntvExampleItem, AntvProductStat } from '@/components/antv/types'

const stats: AntvProductStat[] = [
  { label: '渲染技术', value: 'WebGL' },
  { label: '地图底座', value: '高德 / Mapbox' },
  { label: '核心图层', value: '点 / 线 / 面' },
  { label: '高级场景', value: '地球 / 风场' }
]

const examples: AntvExampleItem[] = [
  {
    name: '散点图',
    category: '点图层',
    tier: 'basic',
    desc: '官网点图层基础示例，用经纬度数据表达空间点位分布，是 L7 入门图层之一。',
    url: 'https://l7.antv.antgroup.com/examples#point-scatter',
    tags: ['PointLayer', '经纬度', '散点']
  },
  {
    name: '路径图',
    category: '线图层',
    tier: 'basic',
    desc: '线图层用一组首尾不闭合的点坐标绘制路径，适合道路、轨迹和流向表达。',
    url: 'https://l7.antv.antgroup.com/examples#line-path',
    tags: ['LineLayer', '路径', '轨迹']
  },
  {
    name: '填充图',
    category: '面图层',
    tier: 'basic',
    desc: '几何体图层最基础的面填充形态，用 GeoJSON 多边形展示区域数据。',
    url: 'https://l7.antv.antgroup.com/examples#polygon-fill',
    tags: ['PolygonLayer', 'GeoJSON', '区域']
  },
  {
    name: '地图组件使用',
    category: '地图组件',
    tier: 'basic',
    desc: '官网组件目录覆盖 Logo、Zoom、Scale、Popup、LayerPopup 等地图控件。',
    url: 'https://l7.antv.antgroup.com/examples#component',
    tags: ['Control', 'Popup', 'Scale']
  },
  {
    name: '经典热力图',
    category: '热力图层',
    tier: 'advanced',
    desc: '热力图以高亮形式显示地理聚集，官网提供经典热力、蜂窝热力、网格热力等形态。',
    url: 'https://l7.antv.antgroup.com/examples#heatmap',
    tags: ['Heatmap', '聚合', '密度']
  },
  {
    name: '3D 柱图',
    category: '3D 图形',
    tier: 'advanced',
    desc: '在地理区域上方显示不同高度柱体，适合行政区、门店、人口和业务指标可视化。',
    url: 'https://l7.antv.antgroup.com/examples#3d-column',
    tags: ['3D', '柱图', '高度']
  },
  {
    name: '弧线图与飞线',
    category: '线图层',
    tier: 'advanced',
    desc: '官网线图层支持弧线、飞线、纹理贴图和动画，用于迁徙、物流、流量等方向表达。',
    url: 'https://l7.antv.antgroup.com/examples#line-arc',
    tags: ['Arc', '飞线', '动画']
  },
  {
    name: '图层显隐与图例',
    category: '地图组件',
    tier: 'advanced',
    desc: 'LayerSwitch 控制图层组显示隐藏，Legend 帮助地图数据值映射被用户理解。',
    url: 'https://l7.antv.antgroup.com/examples#component-layer-switch',
    tags: ['LayerSwitch', 'Legend', '交互']
  },
  {
    name: '矢量瓦片图层',
    category: '瓦片地图',
    tier: 'expert',
    desc: '矢量瓦片用于大数据量地理数据渲染，借助分布请求减轻渲染压力并保留体验。',
    url: 'https://l7.antv.antgroup.com/examples#tile-vector',
    tags: ['VectorTile', '大数据', '瓦片']
  },
  {
    name: '地球模式 Earth',
    category: '地球模式',
    tier: 'expert',
    desc: 'L7 Earth 提供球体底图、内发光大气、辉光图层以及点线图层的地球模式表达。',
    url: 'https://l7.antv.antgroup.com/examples#earth',
    tags: ['Earth', 'BloomLayer', 'AtomLayer']
  },
  {
    name: '风场图层',
    category: '高级图层',
    tier: 'expert',
    desc: 'WindLayer 将风场信息图片中的方向和强度转换成可视化流场，适合气象和环境分析。',
    url: 'https://l7.antv.antgroup.com/examples#wind',
    tags: ['WindLayer', '气象', '流场']
  },
  {
    name: 'Three.js 自定义渲染',
    category: '扩展渲染',
    tier: 'expert',
    desc: '官网展示允许接入第三方渲染引擎，Three.js 可与 L7 地图场景结合做高级 3D 表现。',
    url: 'https://l7.antv.antgroup.com/examples#threejs',
    tags: ['Three.js', '自定义', '3D']
  }
]
</script>

<template>
  <AntvExamplesPage
    product="L7"
    title="L7 地理空间示例目录"
    subtitle="根据 L7 官网示例整理点、线、面、热力、瓦片、组件、地球和风场路径，从基础地图图层到高级 WebGL 地理空间可视化。"
    official-url="https://l7.antv.antgroup.com/examples"
    accent="#a3e635"
    visual="map"
    :stats="stats"
    :examples="examples"
  />
</template>
