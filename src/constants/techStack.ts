export interface TechStackItem {
  name: string
  packageName: string
  version: string
  url: string
  group: string
}

export interface RawTechStackMeta {
  name: string
  packageName: string
  url: string
  group: string
}

export const rawTechStackList: RawTechStackMeta[] = [
  { name: 'Vue', packageName: 'vue', url: 'https://vuejs.org/', group: '框架' },
  { name: 'Vue Router', packageName: 'vue-router', url: 'https://router.vuejs.org/', group: '路由' },
  { name: 'Vite', packageName: 'vite', url: 'https://vite.dev/', group: '构建' },
  { name: 'TypeScript', packageName: 'typescript', url: 'https://www.typescriptlang.org/', group: '语言' },
  { name: 'Element Plus', packageName: 'element-plus', url: 'https://element-plus.org/zh-CN/', group: 'UI' },
  { name: 'Naive UI', packageName: 'naive-ui', url: 'https://www.naiveui.com/', group: 'UI' },
  { name: 'ECharts', packageName: 'echarts', url: 'https://echarts.apache.org/', group: '图表' },
  { name: 'Axios', packageName: 'axios', url: 'https://axios-http.com/', group: '请求' },
  { name: 'CropperJS', packageName: 'cropperjs', url: 'https://fengyuanchen.github.io/cropperjs/', group: '图片' },
  { name: 'Vue TSC', packageName: 'vue-tsc', url: 'https://github.com/vuejs/language-tools', group: '校验' },
  { name: 'Auto Import', packageName: 'unplugin-auto-import', url: 'https://github.com/unplugin/unplugin-auto-import', group: '工程化' },
  { name: 'Vuedraggable', packageName: 'vuedraggable', url: 'https://github.com/SortableJS/vue.draggable.next', group: '交互' }
]

/**
 * 根据 package.json 依赖字典构建具有清洗后版本的 TechStackItem 数组
 */
export function buildTechStack(packageVersions: Record<string, string>): TechStackItem[] {
  return rawTechStackList.map((item: RawTechStackMeta): TechStackItem => {
    const rawVersion: string = packageVersions[item.packageName] || '未安装'
    const version: string = rawVersion.replace(/^[~^]/, '')
    return {
      ...item,
      version
    }
  })
}
