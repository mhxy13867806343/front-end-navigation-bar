<script setup lang="ts">
import { ref } from 'vue'

interface UpdateLog {
  version: string
  date: string
  badge?: string
  features: string[]
  improvements: string[]
  fixes?: string[]
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    version?: string
    releaseDate?: string
    updateLogs?: UpdateLog[]
  }>(),
  {
    title: '🎉 系统全新版本更新提示',
    version: 'v2.4.0',
    releaseDate: '2026-07-24',
    updateLogs: () => [
      {
        version: 'v2.4.0',
        date: '2026-07-24',
        badge: 'Major',
        features: [
          '新增 Oat UI 极简全套组件规范与模态对话框库',
          '全新支持大地图角色的全局弹窗与抽屉交互系统',
          '重构 1942、哆啦A梦与黄金太阳核心游戏引擎解耦'
        ],
        improvements: [
          '优化动态表单与工具箱渲染性能 35%',
          '升级全平台自适应 H5 桌面端复制提示流程'
        ],
        fixes: ['修复部分引擎音效在 iOS 浏览器上的静音自动恢复问题']
      }
    ]
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const dontRemindAgain = ref<boolean>(false)

const closeModal = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  emit('confirm')
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="oat-fade">
      <div v-if="modelValue" class="oat-modal-backdrop" @click.self="closeModal">
        <div class="oat-modal-card update-modal">
          <!-- 弹窗头部 -->
          <div class="modal-header">
            <div class="header-badge">
              <span class="pulse-dot"></span>
              <span class="ver-tag">{{ version }}</span>
              <span class="date-tag">{{ releaseDate }}</span>
            </div>
            <h2>{{ title }}</h2>
            <button class="close-btn" aria-label="关闭" @click="closeModal">×</button>
          </div>

          <!-- 弹窗内容区 (可滚动) -->
          <div class="modal-body">
            <div class="banner-box">
              <div class="banner-icon">🚀</div>
              <div class="banner-info">
                <h4>全新的 Oat UI 极简交互体验现已上线！</h4>
                <p>轻量、无负担、支持原生 Web Components 与可开箱即用的模块化设计。</p>
              </div>
            </div>

            <div v-for="(log, idx) in updateLogs" :key="idx" class="release-timeline">
              <div class="timeline-header">
                <span class="version-label">{{ log.version }}</span>
                <span v-if="log.badge" class="badge-tag">{{ log.badge }}</span>
                <span class="time-label">{{ log.date }}</span>
              </div>

              <!-- 新特性 -->
              <div v-if="log.features?.length" class="log-section">
                <h5>✨ 重磅新特性</h5>
                <ul>
                  <li v-for="(item, fIdx) in log.features" :key="fIdx">{{ item }}</li>
                </ul>
              </div>

              <!-- 优化 -->
              <div v-if="log.improvements?.length" class="log-section">
                <h5>⚡ 性能与体验改进</h5>
                <ul>
                  <li v-for="(item, iIdx) in log.improvements" :key="iIdx">{{ item }}</li>
                </ul>
              </div>

              <!-- 问题修复 -->
              <div v-if="log.fixes?.length" class="log-section">
                <h5>🐞 问题修复</h5>
                <ul>
                  <li v-for="(item, fixIdx) in log.fixes" :key="fixIdx">{{ item }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 弹窗底部操作栏 -->
          <div class="modal-footer">
            <label class="remind-option">
              <input v-model="dontRemindAgain" type="checkbox" />
              <span>本次更新不再自动提醒</span>
            </label>
            <div class="btn-group">
              <button class="oat-btn secondary" @click="closeModal">稍后提醒</button>
              <button class="oat-btn primary" @click="handleConfirm">立即体验新功能</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss" src="./css/OatUpdateModal.scss"></style>
