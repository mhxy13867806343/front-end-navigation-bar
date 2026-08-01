<template>
  <div class="editor-container">
    <header class="editor-header">
      <div class="header-left">
        <el-tag size="small" type="success" effect="dark">新标签页表单</el-tag>
        <h1 class="header-title">
          {{ isEditMode ? '✏️ 编辑数据项目 (新窗口操作)' : '➕ 新增假数据项目 (新窗口操作)' }}
        </h1>
      </div>
      <div class="tab-badge">
        <span class="dot"></span>
        <span>编辑窗口 ID: <strong>{{ tabId }}</strong></span>
      </div>
    </header>

    <div class="editor-notice">
      <p>
        💡 <strong>跨标签页广播原理：</strong> 您当前是在一个独立的浏览器新标签页（<code>{{ $route.fullPath }}</code>）中操作。保存提交后，本标签页将通过 <code>BroadcastChannel</code> 即时推流同步更新主列表页面！
      </p>
    </div>

    <main class="editor-card">
      <el-form :model="formData" label-width="100px" size="large" class="editor-form">
        <el-form-item label="项目 ID" v-if="isEditMode">
          <el-input v-model="editingId" disabled />
        </el-form-item>

        <el-form-item label="项目名称" required>
          <el-input
            v-model="formData.title"
            placeholder="请输入任务或功能名称（如：构建全量源码查看器）..."
            clearable
          />
        </el-form-item>

        <el-form-item label="所属分类">
          <el-select v-model="formData.category" style="width: 100%">
            <el-option label="核心架构" value="核心架构" />
            <el-option label="UI与交互" value="UI与交互" />
            <el-option label="性能优化" value="性能优化" />
            <el-option label="工程化" value="工程化" />
            <el-option label="测试与监控" value="测试与监控" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级">
          <el-radio-group v-model="formData.priority">
            <el-radio label="高">🔥 高优先级</el-radio>
            <el-radio label="中">⚡ 中优先级</el-radio>
            <el-radio label="低">☕ 低优先级</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="进行状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="已完成">✅ 已完成</el-radio>
            <el-radio label="进行中">🚀 进行中</el-radio>
            <el-radio label="待处理">⏳ 待处理</el-radio>
          </el-radio-group>
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" size="large" class="save-btn" @click="saveAndBroadcast">
            💾 保存并广播推流至主页面
          </el-button>
          <el-button size="large" @click="closeTab">
            ❌ 取消并关闭标签页
          </el-button>
        </div>
      </el-form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

interface MockDataItem {
  id: string
  title: string
  category: string
  priority: '高' | '中' | '低'
  status: '已完成' | '进行中' | '待处理'
  updatedAt: string
}

interface BroadcastPayload {
  type: 'ADD' | 'UPDATE'
  senderId: string
  data: MockDataItem
  timestamp: string
}

const route = useRoute()
const CHANNEL_NAME = 'hooksvue_broadcast_demo_channel'
const STORAGE_KEY = 'hooksvue_broadcast_mock_data'

const tabId = ref<string>(`Editor-${Math.random().toString(36).substring(2, 7).toUpperCase()}`)

const isEditMode = computed<boolean>(() => route.query.mode === 'edit')
const editingId = ref<string>((route.query.id as string) || '')

const formData = ref<{
  title: string
  category: string
  priority: '高' | '中' | '低'
  status: '已完成' | '进行中' | '待处理'
}>({
  title: '',
  category: 'UI与交互',
  priority: '高',
  status: '进行中'
})

let broadcastChannel: BroadcastChannel | null = null

function getFormattedTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

function loadDataFromStorage(): MockDataItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return []
}

function saveToStorage(list: MockDataItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // ignore
  }
}

function saveAndBroadcast(): void {
  if (!formData.value.title.trim()) {
    ElMessage.error('请输入项目名称！')
    return
  }

  const list = loadDataFromStorage()
  const nowTime = getFormattedTime()

  let targetItem: MockDataItem

  if (isEditMode.value && editingId.value) {
    const idx = list.findIndex(item => item.id === editingId.value)
    if (idx !== -1) {
      targetItem = {
        ...list[idx],
        title: formData.value.title.trim(),
        category: formData.value.category,
        priority: formData.value.priority,
        status: formData.value.status,
        updatedAt: `2026-08-01 ${nowTime}`
      }
      list[idx] = targetItem
    } else {
      targetItem = {
        id: editingId.value,
        title: formData.value.title.trim(),
        category: formData.value.category,
        priority: formData.value.priority,
        status: formData.value.status,
        updatedAt: `2026-08-01 ${nowTime}`
      }
      list.unshift(targetItem)
    }
  } else {
    targetItem = {
      id: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.value.title.trim(),
      category: formData.value.category,
      priority: formData.value.priority,
      status: formData.value.status,
      updatedAt: `2026-08-01 ${nowTime}`
    }
    list.unshift(targetItem)
  }

  saveToStorage(list)

  // 广播通信至其他所有标签页
  if (broadcastChannel) {
    const payload: BroadcastPayload = {
      type: isEditMode.value ? 'UPDATE' : 'ADD',
      senderId: tabId.value,
      data: targetItem,
      timestamp: nowTime
    }
    broadcastChannel.postMessage(payload)
  }

  ElMessage.success({
    message: `🎉 已广播推流同步数据！本标签页将在 1 秒后自动关闭。`,
    duration: 2000
  })

  setTimeout(() => {
    closeTab()
  }, 1200)
}

function closeTab(): void {
  try {
    window.close()
  } catch {
    router.push('/broadcast-channel')
  }
}

onMounted(() => {
  if ('BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
  }

  if (isEditMode.value && editingId.value) {
    const list = loadDataFromStorage()
    const match = list.find(item => item.id === editingId.value)
    if (match) {
      formData.value = {
        title: match.title,
        category: match.category,
        priority: match.priority,
        status: match.status
      }
    }
  }
})

onUnmounted(() => {
  if (broadcastChannel) {
    broadcastChannel.close()
    broadcastChannel = null
  }
})
</script>

<style scoped lang="scss">
.editor-container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  padding: 30px;
  background: var(--bg-primary, #0f172a);
  color: var(--text-color, #f8fafc);
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 24px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-secondary, #1e293b) 90%, transparent);
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .header-title {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: var(--primary-color, #6366f1);
    }
  }

  .tab-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    padding: 6px 14px;
    border-radius: 20px;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    color: #818cf8;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6366f1;
      box-shadow: 0 0 8px #6366f1;
    }
  }
}

.editor-notice {
  padding: 14px 18px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: #93c5fd;
  font-size: 13px;

  p {
    margin: 0;
    line-height: 1.6;
  }

  code {
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(30, 41, 59, 0.8);
    color: #f1f5f9;
  }
}

.editor-card {
  padding: 30px;
  border-radius: 12px;
  background: var(--bg-secondary, #1e293b);
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-actions {
  display: flex;
  gap: 14px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));

  .save-btn {
    font-weight: 700;
  }
}
</style>
