<template>
  <div class="dy-form">
    <DynamicFormDesigner
      :is-local-save="false"
      @save="handleSave"
    />
    <button
      class="dy-form-music-toggle"
      type="button"
      title="显示音乐播放器"
      aria-label="显示音乐播放器"
      @click="showMusicPlayer"
    >
      <span>♪</span>
      <em>音乐</em>
    </button>
    <button
      class="dy-form-info-toggle"
      type="button"
      title="打开未来可期信息面板"
      aria-label="打开未来可期信息面板"
      @click="isFutureDialogVisible = true"
    >
      <span>i</span>
      <em>信息</em>
    </button>

    <el-dialog
      v-model="isFutureDialogVisible"
      title="Dialog 对话框 - 未来可期"
      width="min(1080px, 94vw)"
      class="dy-form-future-dialog"
      append-to-body
      align-center
      draggable
    >
      <section class="future-dialog-body">
        <div class="future-hero">
          <div>
            <p class="future-eyebrow">Element Plus Dialog</p>
            <h2>{{ currentYear }} 年动态面板</h2>
            <p>
              今年是 {{ currentYear }} 年，明年是 {{ nextYear }} 年。祝各位未来可期吧，嘿嘿嘿。
            </p>
          </div>
          <div class="future-clock-card">
            <strong>{{ formattedDateTime }}</strong>
            <span>{{ timeZoneLabel }} · {{ dayPeriodLabel }}</span>
          </div>
        </div>

        <div class="token-wall" aria-label="Token 记录">
          <article v-for="record in tokenRecords" :key="record.label">
            <strong>{{ record.value }}</strong>
            <span>{{ record.label }}</span>
          </article>
        </div>

        <div class="future-grid">
          <section class="future-panel">
            <div class="future-panel-head">
              <h3>链接地址</h3>
              <span>可以点击跳转</span>
            </div>
            <div class="future-link-list">
              <a v-for="link in primaryLinks" :key="link.url" :href="link.url" target="_blank" rel="noopener noreferrer">
                <strong>{{ link.name }}</strong>
                <span>{{ link.url }}</span>
              </a>
            </div>
          </section>

          <section class="future-panel">
            <div class="future-panel-head">
              <h3>工具入口</h3>
              <span>Codex / Antigravity / Trae / WorkBuddy</span>
            </div>
            <div class="tool-pill-row">
              <a v-for="tool in agentTools" :key="tool.name" :href="tool.url" target="_blank" rel="noopener noreferrer">
                {{ tool.name }}
              </a>
            </div>
            <div class="future-mini-list">
              <span>不再更新</span>
              <span>vero</span>
              <span>....</span>
              <span>next</span>
              <span>lol</span>
              <span>[]</span>
              <span>没有了，再见</span>
            </div>
          </section>

          <section class="future-panel">
            <div class="future-panel-head">
              <h3>当前环境</h3>
              <span>电脑系统与运行时</span>
            </div>
            <dl class="system-list">
              <div v-for="item in systemInfo" :key="item.label">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </section>

          <section class="future-panel">
            <div class="future-panel-head">
              <h3>技术栈</h3>
              <span>Vue / React 相关</span>
            </div>
            <div class="stack-list">
              <a v-for="stack in techStacks" :key="stack.url" :href="stack.url" target="_blank" rel="noopener noreferrer">
                <strong>{{ stack.name }}</strong>
                <span>{{ stack.desc }}</span>
              </a>
            </div>
          </section>

          <section class="future-panel future-panel-wide">
            <div class="future-panel-head">
              <h3>更多内容</h3>
              <span>当前位置与 AI 关键词</span>
            </div>
            <div class="future-note-grid">
              <span>当前位置: 杭州</span>
              <a href="mailto:869710179@qq.com">869710179@qq.com</a>
              <span>ChatGPT / Claude / Gemini</span>
              <a href="https://steamcommunity.com/profiles/76561198384042673/" target="_blank" rel="noopener noreferrer">
                Steam Profile
              </a>
            </div>
          </section>
        </div>
      </section>

      <template #footer>
        <div class="future-dialog-footer">
          <a href="https://element-plus.org/zh-CN/component/dialog" target="_blank" rel="noopener noreferrer">
            Element Plus Dialog 文档
          </a>
          <el-button type="primary" @click="isFutureDialogVisible = false">再见</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import DynamicFormDesigner from '../components/DynamicForm/DynamicFormDesigner.vue'
import type { DynamicFormPayload } from '@/types/dynamicForm'

const ALAPI_PLAYER_SHOW_EVENT: string = 'alapi-player:show'
const isFutureDialogVisible = ref<boolean>(false)
const currentTime = ref<Date>(new Date())
let futureClockTimer: number | null = null

interface FutureLink {
  name: string
  url: string
}

interface FutureInfoItem {
  label: string
  value: string
}

interface TechStackLink {
  name: string
  desc: string
  url: string
}

const primaryLinks: FutureLink[] = [
  { name: 'AI 工具集', url: 'https://ai-bot.cn/' },
  { name: 'GitHub - mhxy13867806343', url: 'https://github.com/mhxy13867806343' },
  { name: 'Frameronin', url: 'https://frameronin.com/' },
  { name: 'Oat UI', url: 'https://oat.ink/' },
  { name: 'X - lichnsng491890', url: 'https://x.com/lichnsng491890' },
  { name: 'Gitee - fangjiayu', url: 'https://gitee.com/fangjiayu' }
]

const agentTools: FutureLink[] = [
  { name: 'Codex', url: 'https://openai.com/codex/' },
  { name: 'Antigravity', url: 'https://antigravity.google/' },
  { name: 'Trae', url: 'https://www.trae.ai/' },
  { name: 'WorkBuddy', url: 'https://workbuddy.ai/' }
]

const tokenRecords: FutureInfoItem[] = [
  { label: '累计 Token 数', value: '512.8亿' },
  { label: '峰值 Token 数', value: '98.3亿' },
  { label: '最长任务时长', value: '8 小时 32 分' },
  { label: '当前连续天数', value: '386 天' },
  { label: '最长连续天数', value: '730 天' },
  { label: '未来目标 Token', value: '3000亿+' }
]

const systemInfo: FutureInfoItem[] = [
  { label: '当前电脑系统', value: 'macOS 26.5 (25F71) · arm64' },
  { label: 'Python 版本', value: 'Python 3.11.9' },
  { label: 'Godot 版本', value: '4.6.stable.official.89cea1439' },
  { label: 'Rust 版本', value: 'rustc 1.91.0 (f8297e351 2025-10-28)' },
  { label: '当前位置', value: '杭州' }
]

const techStacks: TechStackLink[] = [
  { name: 'Vue', desc: '渐进式 JavaScript 框架', url: 'https://vuejs.org/' },
  { name: 'Vue Router', desc: 'Vue 官方路由管理', url: 'https://router.vuejs.org/' },
  { name: 'Vite', desc: '前端构建工具', url: 'https://vite.dev/' },
  { name: 'Element Plus', desc: 'Vue 3 桌面端组件库', url: 'https://element-plus.org/zh-CN/' },
  { name: 'React', desc: '用于构建 Web 和原生界面的库', url: 'https://react.dev/' },
  { name: 'Next.js', desc: 'React 全栈框架', url: 'https://nextjs.org/' },
  { name: 'Ant Design', desc: 'React 企业级 UI 组件库', url: 'https://ant.design/' }
]

const formattedDateTime = computed<string>((): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  }).format(currentTime.value)
})

const currentYear = computed<number>((): number => currentTime.value.getFullYear())
const nextYear = computed<number>((): number => currentYear.value + 1)

const timeZoneLabel = computed<string>((): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
})

const dayPeriodLabel = computed<string>((): string => {
  const hour: number = currentTime.value.getHours()
  if (hour < 5) return '凌晨'
  if (hour < 9) return '早上'
  if (hour < 12) return '上午'
  if (hour < 14) return '中午'
  if (hour < 18) return '下午'
  if (hour < 22) return '晚上'
  return '深夜'
})

// 处理保存事件
const handleSave = (formData: DynamicFormPayload): void => {
  // 这里可以处理表单数据，比如发送到服务器
  console.log('保存的表单数据:', formData)
}

const showMusicPlayer = (): void => {
  window.dispatchEvent(new CustomEvent(ALAPI_PLAYER_SHOW_EVENT))
}

onMounted((): void => {
  isFutureDialogVisible.value = true
  futureClockTimer = window.setInterval((): void => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted((): void => {
  if (futureClockTimer !== null) {
    window.clearInterval(futureClockTimer)
    futureClockTimer = null
  }
})
</script>

<style scoped lang="scss" src="./css/DyForm.scss"></style>
