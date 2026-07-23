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

<style scoped lang="scss">
.oat-fade-enter-active,
.oat-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.oat-fade-enter-from,
.oat-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.oat-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.oat-modal-card.update-modal {
  width: 100%;
  max-width: 580px;
  max-height: 85vh;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: inherit;
}

.modal-header {
  position: relative;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafafa;

  .header-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }

    .ver-tag {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      background: #2563eb;
      color: #ffffff;
    }

    .date-tag {
      font-size: 0.75rem;
      color: #64748b;
    }
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 20px;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  }
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;

  .banner-box {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px 16px;
    background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%);
    border: 1px solid #bfdbfe;
    border-radius: 12px;
    margin-bottom: 20px;

    .banner-icon {
      font-size: 2rem;
    }

    .banner-info {
      h4 {
        margin: 0 0 4px;
        font-size: 0.95rem;
        font-weight: 700;
        color: #1e40af;
      }
      p {
        margin: 0;
        font-size: 0.82rem;
        color: #3b82f6;
      }
    }
  }

  .release-timeline {
    .timeline-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px dashed #e2e8f0;

      .version-label {
        font-weight: 700;
        font-size: 1rem;
        color: #0f172a;
      }

      .badge-tag {
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 4px;
        background: #fef3c7;
        color: #d97706;
        font-weight: 700;
      }

      .time-label {
        font-size: 0.8rem;
        color: #94a3b8;
        margin-left: auto;
      }
    }

    .log-section {
      margin-bottom: 14px;

      h5 {
        margin: 0 0 6px;
        font-size: 0.88rem;
        font-weight: 700;
        color: #334155;
      }

      ul {
        margin: 0;
        padding-left: 18px;

        li {
          font-size: 0.85rem;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 4px;
        }
      }
    }
  }
}

.modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;

  .remind-option {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    color: #64748b;
    cursor: pointer;
    user-select: none;

    input {
      accent-color: #2563eb;
    }
  }

  .btn-group {
    display: flex;
    gap: 10px;
    margin-left: auto;
  }
}

.oat-btn {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;

  &.secondary {
    background: #ffffff;
    border-color: #cbd5e1;
    color: #475569;

    &:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }
  }

  &.primary {
    background: #2563eb;
    color: #ffffff;

    &:hover {
      background: #1d4ed8;
    }
  }
}
</style>
