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

<style scoped lang="scss" src="./css/OatCreatePageModal.scss"></style>
