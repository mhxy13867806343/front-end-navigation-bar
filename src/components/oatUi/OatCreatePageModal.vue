<script setup lang="ts">
import { ref } from 'vue'

export interface NewPageData {
  title: string
  path: string
  template: 'blank' | 'dashboard' | 'list' | 'form'
  tags: string[]
  description: string
  isPublic: boolean
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'create', pageData: NewPageData): void
}>()

const formData = ref<NewPageData>({
  title: '',
  path: '',
  template: 'dashboard',
  tags: ['前端', 'Oat UI'],
  description: '',
  isPublic: true
})

const tagInput = ref<string>('')
const errorMsg = ref<string>('')

const addTag = () => {
  const val = tagInput.value.trim()
  if (val && !formData.value.tags.includes(val)) {
    formData.value.tags.push(val)
    tagInput.value = ''
  }
}

const removeTag = (idx: number) => {
  formData.value.tags.splice(idx, 1)
}

const closeModal = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  if (!formData.value.title.trim()) {
    errorMsg.value = '请输入页面标题'
    return
  }
  if (!formData.value.path.trim()) {
    errorMsg.value = '请输入页面路由 Path'
    return
  }
  errorMsg.value = ''
  emit('create', { ...formData.value })
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="oat-fade">
      <div v-if="modelValue" class="oat-modal-backdrop" @click.self="closeModal">
        <div class="oat-modal-card create-page-modal">
          <div class="modal-header">
            <h3>✨ 新建 Oat UI 交互页面</h3>
            <p>快速配置并生成极简风格的前端应用模块</p>
            <button class="close-btn" aria-label="关闭" @click="closeModal">×</button>
          </div>

          <div class="modal-body">
            <div v-if="errorMsg" class="error-banner">
              ⚠️ {{ errorMsg }}
            </div>

            <!-- 1. 页面名称 -->
            <div class="form-group">
              <label class="form-label">页面名称 <span class="req">*</span></label>
              <input
                v-model="formData.title"
                type="text"
                class="oat-input"
                placeholder="如：数据监控看板 / 用户详情页"
              />
            </div>

            <!-- 2. 路由 Path -->
            <div class="form-group">
              <label class="form-label">路由 Path <span class="req">*</span></label>
              <div class="input-prefix-box">
                <span class="prefix">/oat-studio/</span>
                <input
                  v-model="formData.path"
                  type="text"
                  class="oat-input path-input"
                  placeholder="dashboard"
                />
              </div>
            </div>

            <!-- 3. 模板类型卡片 -->
            <div class="form-group">
              <label class="form-label">选择页面模板</label>
              <div class="template-grid">
                <div
                  class="tpl-card"
                  :class="{ active: formData.template === 'dashboard' }"
                  @click="formData.template = 'dashboard'"
                >
                  <div class="tpl-icon">📊</div>
                  <div class="tpl-title">Dashboard 仪表盘</div>
                  <div class="tpl-desc">统计卡片、图表与数据看板</div>
                </div>

                <div
                  class="tpl-card"
                  :class="{ active: formData.template === 'list' }"
                  @click="formData.template = 'list'"
                >
                  <div class="tpl-icon">📋</div>
                  <div class="tpl-title">列表/表格页</div>
                  <div class="tpl-desc">筛选、分页与数据表格</div>
                </div>

                <div
                  class="tpl-card"
                  :class="{ active: formData.template === 'form' }"
                  @click="formData.template = 'form'"
                >
                  <div class="tpl-icon">📝</div>
                  <div class="tpl-title">表单配置页</div>
                  <div class="tpl-desc">富输入框与复杂选择器</div>
                </div>

                <div
                  class="tpl-card"
                  :class="{ active: formData.template === 'blank' }"
                  @click="formData.template = 'blank'"
                >
                  <div class="tpl-icon">📄</div>
                  <div class="tpl-title">极简空白页</div>
                  <div class="tpl-desc">自由拓展的轻量级页面</div>
                </div>
              </div>
            </div>

            <!-- 4. 标签配置 -->
            <div class="form-group">
              <label class="form-label">自定义标签 (Tags)</label>
              <div class="tags-container">
                <span v-for="(tag, idx) in formData.tags" :key="idx" class="tag-badge">
                  {{ tag }}
                  <button type="button" @click="removeTag(idx)">×</button>
                </span>
                <input
                  v-model="tagInput"
                  type="text"
                  class="tag-input"
                  placeholder="按回车添加标签..."
                  @keyup.enter="addTag"
                />
              </div>
            </div>

            <!-- 5. 描述与选项 -->
            <div class="form-group">
              <label class="form-label">页面描述</label>
              <textarea
                v-model="formData.description"
                class="oat-textarea"
                rows="3"
                placeholder="简要说明此页面的主要用途与交互规则..."
              ></textarea>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input v-model="formData.isPublic" type="checkbox" />
                <span>允许公开访问与全站搜索索引</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button class="oat-btn secondary" @click="closeModal">取消</button>
            <button class="oat-btn primary" @click="handleSubmit">🚀 立即生成页面</button>
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

.oat-modal-card.create-page-modal {
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  position: relative;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafafa;

  h3 {
    margin: 0 0 4px;
    font-size: 1.15rem;
    font-weight: 700;
    color: #0f172a;
  }
  p {
    margin: 0;
    font-size: 0.82rem;
    color: #64748b;
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
    cursor: pointer;

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

  .error-banner {
    padding: 10px 14px;
    border-radius: 8px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    font-size: 0.85rem;
    margin-bottom: 16px;
  }

  .form-group {
    margin-bottom: 18px;

    .form-label {
      display: block;
      font-size: 0.88rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;

      .req {
        color: #ef4444;
      }
    }

    .oat-input,
    .oat-textarea {
      width: 100%;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 0.88rem;
      color: #0f172a;
      outline: none;
      transition: all 0.15s ease;

      &:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
      }
    }

    .input-prefix-box {
      display: flex;
      align-items: center;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #f8fafc;

      .prefix {
        padding: 10px 12px;
        font-size: 0.85rem;
        color: #64748b;
        background: #f1f5f9;
        border-right: 1px solid #cbd5e1;
      }

      .path-input {
        border: none;
        border-radius: 0;
        background: #ffffff;
      }
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;

      .tpl-card {
        padding: 12px 14px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          border-color: #93c5fd;
          background: #f0f9ff;
        }

        &.active {
          border-color: #2563eb;
          background: #eff6ff;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        .tpl-icon {
          font-size: 1.5rem;
          margin-bottom: 4px;
        }
        .tpl-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f172a;
        }
        .tpl-desc {
          font-size: 0.78rem;
          color: #64748b;
          margin-top: 2px;
        }
      }
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: #ffffff;

      .tag-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 6px;
        background: #e0f2fe;
        color: #0369a1;
        font-size: 0.8rem;
        font-weight: 600;

        button {
          border: none;
          background: transparent;
          color: #0369a1;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
        }
      }

      .tag-input {
        border: none;
        outline: none;
        font-size: 0.85rem;
        flex: 1;
        min-width: 120px;
      }
    }

    &.checkbox-group {
      margin-bottom: 0;

      .checkbox-label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        color: #475569;
        cursor: pointer;

        input {
          accent-color: #2563eb;
        }
      }
    }
  }
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.oat-btn {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;

  &.secondary {
    background: #ffffff;
    border-color: #cbd5e1;
    color: #475569;

    &:hover {
      background: #f8fafc;
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
