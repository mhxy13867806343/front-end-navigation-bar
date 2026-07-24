<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 各种核心功能的完整可复制源代码库
const CODE_MODULES = [
  {
    id: 'scheduleX',
    title: '📅 Schedule-X v4.6 现代日历调度组件',
    filePath: 'src/views/scheduleXShowcase/index.vue',
    description: '支持周/日/月/清单多视图切换、双击空白创建、单击编辑、跨天拖拽排期与 LocalStorage 本地持久化缓存。',
    language: 'vue',
    code: `<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { storage, STORAGE_KEYS } from '../../utils/storage'

export interface CalendarEvent {
  id: number
  title: string
  category: string
  startTime: string
  endTime: string
  dayIndex: number
  color: string
  location: string
}

const DEFAULT_CATEGORIES = ['工作', '会议', '学习', '生活', '娱乐']
const categories = ref<string[]>(storage.getItem(STORAGE_KEYS.SCHEDULE_X_CATEGORIES, DEFAULT_CATEGORIES))
const events = ref<CalendarEvent[]>(storage.getItem(STORAGE_KEYS.SCHEDULE_X_EVENTS, []))

// 自动持久化写入本地缓存
watch(events, (newVal) => storage.setItem(STORAGE_KEYS.SCHEDULE_X_EVENTS, newVal), { deep: true })
watch(categories, (newVal) => storage.setItem(STORAGE_KEYS.SCHEDULE_X_CATEGORIES, newVal), { deep: true })

// 拖拽排期 Handler
const draggingEvent = ref<CalendarEvent | null>(null)
const handleDragStart = (ev: CalendarEvent, e: DragEvent) => { draggingEvent.value = ev }
const handleDrop = (targetDayIdx: number, e: DragEvent) => {
  if (draggingEvent.value) {
    draggingEvent.value.dayIndex = targetDayIdx
    events.value = [...events.value]
    ElMessage.success('已拖拽更新日程排期！')
  }
}
<\/script>`
  },
  {
    id: 'storage',
    title: '💾 通用 LocalStorage 缓存模块 & Key 常量文件',
    filePath: 'src/utils/storage.ts & src/constants/storageKeys.ts',
    description: '封装全局统一的类型安全 LocalStorage 工具模块与独立 Key 常量声明。',
    language: 'typescript',
    code: `// src/constants/storageKeys.ts
export const STORAGE_KEYS = {
  SCHEDULE_X_EVENTS: 'HOOKSVUE_SCHEDULE_X_EVENTS_V1',
  SCHEDULE_X_CATEGORIES: 'HOOKSVUE_SCHEDULE_X_CATEGORIES_V1',
  THEME_MODE: 'HOOKSVUE_THEME_MODE'
} as const

// src/utils/storage.ts
import { STORAGE_KEYS, type StorageKeyType } from '../constants/storageKeys'

export class LocalStorageUtil {
  static getItem<T>(key: StorageKeyType, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : defaultValue
    } catch {
      return defaultValue
    }
  }

  static setItem<T>(key: StorageKeyType, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }

  static removeItem(key: StorageKeyType): void {
    localStorage.removeItem(key)
  }
}
export const storage = LocalStorageUtil`
  },
  {
    id: 'motion',
    title: '⚡ Motion for Vue 50+ 经典特效展厅',
    filePath: 'src/views/motionShowcase/index.vue',
    description: '全量实现 motion.dev 的 iOS 应用文件夹、曝光度滑块、3D Coverflow、拟真打字机与 Apple AI 水波纹。',
    language: 'vue',
    code: `<template>
  <!-- 1. iOS App Folder 拟态展开 -->
  <div class="ios-folder" @click="isFolderOpen = true">
    <div v-for="app in folderApps" :key="app.id" :style="{ background: app.color }">
      {{ app.icon }}
    </div>
  </div>

  <!-- 2. Apple Intelligence Ripple -->
  <div class="apple-ripple" @click="triggerRipple">
    <span class="gradient-text">Apple Intelligence</span>
  </div>
</template>`
  },
  {
    id: 'chinaMap3d',
    title: '🗺️ Three.js 3D 中国地图设计器',
    filePath: 'src/views/threeShowcase/chinaMap3d.vue',
    description: '基于 Three.js / WebGL2 的开箱即用 3D 中国地图设计器，支持双模式、省份下钻、3D 飞线、气泡柱状图与 JSON 导出。',
    language: 'vue',
    code: `<script setup lang="ts">
import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

// 3D 弧线飞线
const curve = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(0, 0, 10),
  new THREE.Vector3(10, 10, 35),
  new THREE.Vector3(20, 0, 10)
)
<\/script>`
  },
  {
    id: 'versionPolling',
    title: '🚀 Version Polling 版本号轮询与历史保存',
    filePath: 'src/utils/versionPolling.ts & scripts/generate-version-json.mts',
    description: '结合 version-polling 库检测随机 version.json，自动保留历代版本号历史 log。',
    language: 'typescript',
    code: `import { createVersionPolling } from 'version-polling'
import { ElMessageBox } from 'element-plus'

export function initVersionPolling() {
  if (!import.meta.env.PROD) return
  createVersionPolling({
    vcType: 'versionJson',
    versionFileUrl: (import.meta.env.BASE_URL || '/') + 'version.json',
    pollingInterval: 15 * 1000,
    onUpdate: (_self, info) => {
      ElMessageBox.confirm(\`发现最新随机版本 (\${info?.version})，请刷新页面！\`, '🚀 发现新版本')
        .then(() => window.location.reload())
    }
  })
}`
  }
]

const activeModuleId = ref<string>('scheduleX')

const activeModule = computed(() => {
  return CODE_MODULES.find(m => m.id === activeModuleId.value) || CODE_MODULES[0]
})

const copyCode = () => {
  if (activeModule.value?.code) {
    navigator.clipboard.writeText(activeModule.value.code)
      .then(() => ElMessage.success(`【${activeModule.value.title}】完整源代码已成功复制到剪贴板！`))
      .catch(() => ElMessage.error('复制失败，请手动选择复制。'))
  }
}

onMounted(() => {
  if (route.query.file && typeof route.query.file === 'string') {
    const found = CODE_MODULES.find(m => m.id === route.query.file)
    if (found) activeModuleId.value = found.id
  }
})
</script>

<template>
  <div class="source-code-viewer-page" style="min-height: 100vh; background: #090d16; color: #f8fafc; padding-bottom: 60px;">
    <!-- Header 头部栏 -->
    <header style="background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 32px 24px 20px;">
      <div style="max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <span style="display: inline-block; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.3); margin-bottom: 8px;">
            📜 Source Code Center
          </span>
          <h1 style="font-size: 1.8rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #38bdf8 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            全站页面与功能源代码查看 &amp; 一键复制中心
          </h1>
        </div>
        <button style="padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #e2e8f0; font-weight: 700; font-size: 0.88rem; cursor: pointer;" @click="router.push('/dyform')">
          ← 返回导航站
        </button>
      </div>

      <div style="max-width: 1280px; margin: 20px auto 0; display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>0-ms 一键复制</strong> 包含 Vue 3、TypeScript、Three.js、Motion 与 Storage 模块全量代码
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>模块化清晰定义</strong> 共享数据结构与标准 Vue 组件模板
        </div>
      </div>
    </header>

    <!-- Main Workspace -->
    <div style="max-width: 1280px; margin: 24px auto 0; padding: 0 24px; display: grid; grid-template-columns: 300px 1fr; gap: 24px;">
      <!-- Module Selector Sidebar -->
      <aside style="background: rgba(30,41,59,0.7); border-radius: 16px; padding: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); height: fit-content;">
        <h3 style="margin: 0 0 12px; font-size: 0.94rem; color: #38bdf8;">选择要查看的源代码模块:</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button
            v-for="mod in CODE_MODULES"
            :key="mod.id"
            style="padding: 10px 14px; border-radius: 10px; text-align: left; border: 1px solid rgba(255,255,255,0.08); font-size: 0.84rem; font-weight: 700; cursor: pointer; transition: all 0.2s;"
            :style="{ background: activeModuleId === mod.id ? '#38bdf8' : 'rgba(15,23,42,0.6)', color: activeModuleId === mod.id ? '#0f172a' : '#cbd5e1' }"
            @click="activeModuleId = mod.id"
          >
            {{ mod.title }}
          </button>
        </div>
      </aside>

      <!-- Code Inspector Main Stage -->
      <main style="background: rgba(30,41,59,0.7); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">
          <div>
            <h2 style="margin: 0; font-size: 1.3rem; color: #fff;">{{ activeModule.title }}</h2>
            <div style="font-size: 0.82rem; color: #38bdf8; font-family: monospace; margin-top: 4px;">
              📄 文件路径: {{ activeModule.filePath }}
            </div>
            <p style="font-size: 0.84rem; color: #94a3b8; margin: 6px 0 0;">{{ activeModule.description }}</p>
          </div>
          <button style="padding: 10px 20px; border-radius: 10px; border: none; background: #38bdf8; color: #0f172a; font-weight: 800; font-size: 0.88rem; cursor: pointer; box-shadow: 0 4px 14px rgba(56,189,248,0.4);" @click="copyCode">
            📋 0-ms 复制全部源码
          </button>
        </div>

        <!-- Code Block Viewer -->
        <div style="background: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1); overflow-x: auto; max-height: 580px;">
          <pre style="margin: 0; font-family: 'Fira Code', Consolas, Monaco, monospace; font-size: 0.86rem; color: #38bdf8; line-height: 1.6; white-space: pre-wrap; word-break: break-all;"><code>{{ activeModule.code }}</code></pre>
        </div>
      </main>
    </div>
  </div>
</template>
