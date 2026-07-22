<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument, Refresh, Star, StarFilled, Delete } from '@element-plus/icons-vue'
import { resolveApiUrl } from '../../utils/resolveApiUrl'

const ALAPI_TOKEN: string = import.meta.env.VITE_ALAPI_TOKEN || 'qgqofofvmxtoskffd37omkscobipmn'
const ALAPI_API_BASE: string = '/api-alapi'

function buildAlapiUrl(path: string): string {
  return resolveApiUrl(`${ALAPI_API_BASE}${path}`)
}

interface MingyanTypeItem {
  label: string
  value: number
}

interface MingyanQuoteItem {
  content: string
  author: string
  typeid?: number
}

interface AlapiResponse<T> {
  code?: number
  success?: boolean
  message?: string
  data?: T
}

// State
const categories = ref<MingyanTypeItem[]>([])
const selectedTypeId = ref<number | null>(null)
const currentQuote = ref<MingyanQuoteItem | null>(null)
const loadingCategory = ref<boolean>(false)
const loadingQuote = ref<boolean>(false)

// Saved Favorite Quotes
const favoriteQuotes = ref<MingyanQuoteItem[]>(
  JSON.parse(localStorage.getItem('favorite_mingyan_quotes') || '[]')
)

const selectedCategoryLabel = computed<string>(() => {
  if (selectedTypeId.value === null) return '全部分类'
  const matched = categories.value.find((c: MingyanTypeItem) => c.value === selectedTypeId.value)
  return matched ? matched.label : '精选语录'
})

const isCurrentFavorite = computed<boolean>(() => {
  if (!currentQuote.value) return false
  return favoriteQuotes.value.some(
    (item: MingyanQuoteItem) => item.content === currentQuote.value?.content && item.author === currentQuote.value?.author
  )
})

import draggable from 'vuedraggable'

const saveCategoriesOrder = (): void => {
  const order: number[] = categories.value.map((c: MingyanTypeItem) => c.value)
  localStorage.setItem('mingyan_categories_order', JSON.stringify(order))
  ElMessage({
    message: '分类标签拖拽排序已自动保存',
    type: 'success',
    duration: 1500,
    grouping: true
  })
}

// Step 1: 先 1 - 获取名人名言类型列表
const fetchCategories = async (): Promise<void> => {
  loadingCategory.value = true
  try {
    const res = await axios.get<AlapiResponse<MingyanTypeItem[]>>(buildAlapiUrl('/api/mingyan/type'), {
      params: { token: ALAPI_TOKEN }
    })
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      const rawList = res.data.data
      const savedOrderStr = localStorage.getItem('mingyan_categories_order')
      if (savedOrderStr) {
        try {
          const savedOrder: number[] = JSON.parse(savedOrderStr)
          if (Array.isArray(savedOrder) && savedOrder.length > 0) {
            const map = new Map<number, MingyanTypeItem>()
            rawList.forEach((item: MingyanTypeItem) => map.set(item.value, item))
            const ordered: MingyanTypeItem[] = []
            savedOrder.forEach((val: number) => {
              if (map.has(val)) {
                ordered.push(map.get(val)!)
                map.delete(val)
              }
            })
            map.forEach((item: MingyanTypeItem) => ordered.push(item))
            categories.value = ordered
            return
          }
        } catch {
          // Fallback to raw list
        }
      }
      categories.value = rawList
    }
  } catch (e) {
    console.error('获取名人名言类型失败', e)
  } finally {
    loadingCategory.value = false
  }
}

// Step 2: 再 2 - 获取指定类型或随机名言内容
const fetchQuote = async (typeid?: number | null, showSuccessToast: boolean = false): Promise<void> => {
  loadingQuote.value = true
  try {
    const params: Record<string, string | number> = {
      token: ALAPI_TOKEN,
      format: 'json'
    }
    if (typeid !== undefined && typeid !== null) {
      params.typeid = typeid
    }

    const res = await axios.get<AlapiResponse<MingyanQuoteItem>>(buildAlapiUrl('/api/mingyan'), { params })
    if (res.data.code === 200 && res.data.data) {
      currentQuote.value = res.data.data
      if (showSuccessToast) {
        ElMessage({
          message: '已刷新获取新的一句名言！',
          type: 'success',
          grouping: true,
          duration: 2000
        })
      }
    } else {
      ElMessage({
        message: res.data.message || '获取名言失败，请重试',
        type: 'error'
      })
    }
  } catch (e) {
    ElMessage({
      message: '网络请求失败，请稍后刷新',
      type: 'error'
    })
  } finally {
    loadingQuote.value = false
  }
}

const selectCategory = (typeid: number | null): void => {
  selectedTypeId.value = typeid
  void fetchQuote(typeid)
}

const handleRefreshQuote = (typeid?: number | null): void => {
  void fetchQuote(typeid, true)
}

const copyQuoteText = (quote: MingyanQuoteItem): void => {
  const text: string = `“${quote.content}” —— ${quote.author || '匿名'}`
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage({
        message: '名言金句已成功复制到剪贴板！',
        type: 'success',
        grouping: true,
        duration: 2000
      })
    }).catch(() => {
      fallbackCopy(text)
    })
  } else {
    fallbackCopy(text)
  }
}

function fallbackCopy(text: string) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  try {
    document.execCommand('copy')
    ElMessage({
      message: '名言金句已成功复制到剪贴板！',
      type: 'success',
      grouping: true,
      duration: 2000
    })
  } catch (err) {
    ElMessage({
      message: '复制失败，请手动选中文本复制',
      type: 'error'
    })
  }
  document.body.removeChild(textArea)
}

const toggleFavorite = (quote: MingyanQuoteItem): void => {
  const idx: number = favoriteQuotes.value.findIndex(
    (item: MingyanQuoteItem) => item.content === quote.content && item.author === quote.author
  )
  if (idx >= 0) {
    favoriteQuotes.value.splice(idx, 1)
    ElMessage({
      message: '已从金句收藏库中取消收藏',
      type: 'info',
      grouping: true
    })
  } else {
    favoriteQuotes.value.unshift({ ...quote, typeid: selectedTypeId.value || quote.typeid })
    ElMessage({
      message: '已成功添加到金句收藏库！',
      type: 'success',
      grouping: true
    })
  }
  localStorage.setItem('favorite_mingyan_quotes', JSON.stringify(favoriteQuotes.value))
}

const confirmRemoveFavorite = (index: number, quote: MingyanQuoteItem): void => {
  ElMessageBox.confirm(
    `确定要从您的金句收藏库中删除这句名言吗？\n\n“${quote.content.substring(0, 20)}${quote.content.length > 20 ? '...' : ''}”`,
    '确认删除提示',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(() => {
    favoriteQuotes.value.splice(index, 1)
    localStorage.setItem('favorite_mingyan_quotes', JSON.stringify(favoriteQuotes.value))
    ElMessage({
      message: '已从金句收藏库中成功删除该名言！',
      type: 'success'
    })
  }).catch(() => {
    ElMessage({
      message: '已取消删除操作',
      type: 'info'
    })
  })
}

import { useAutoRefresh } from '../../composables/useAutoRefresh'

const { countdown, triggerManualRefresh } = useAutoRefresh({
  intervalSeconds: 120,
  autoStart: true,
  onRefresh: async () => {
    await fetchQuote(selectedTypeId.value, true)
  }
})

onMounted(async () => {
  await fetchCategories()
  await fetchQuote()
})
</script>

<template>
  <div class="mingyan-page">
    <!-- Header Banner -->
    <header class="header-banner">
      <div class="header-content">
        <div class="title-row">
          <h1 class="page-title">📜 名人名言与智慧语录</h1>
        </div>
        <p class="page-subtitle">感悟古今名家智慧，汲取灵魂的力量与灵感。</p>
      </div>
    </header>

    <main class="main-container">
      <!-- Step 1: 先 1 - 名人名言类型选择栏 -->
      <section class="category-section" v-loading="loadingCategory">
        <div class="category-header">
          <span class="section-title">🏷️ 名言分类 (除了全部随机，其余分类按住可自由拖拽排序)</span>
          <span class="badge-count">{{ categories.length }} 个主题类型</span>
        </div>
        <div class="category-tags">
          <!-- 固定的首选项：全部随机 -->
          <button
            type="button"
            class="category-pill fixed-pill"
            :class="{ active: selectedTypeId === null }"
            @click="selectCategory(null)"
          >
            🌟 全部随机
          </button>

          <!-- 可拖拽排序的其他分类列表 -->
          <draggable
            v-model="categories"
            item-key="value"
            class="draggable-category-container"
            ghost-class="sortable-ghost"
            drag-class="sortable-drag"
            @end="saveCategoriesOrder"
          >
            <template #item="{ element: cat }">
              <button
                type="button"
                class="category-pill draggable-pill"
                :class="{ active: selectedTypeId === cat.value }"
                @click="selectCategory(cat.value)"
              >
                <span class="drag-handle" title="按住拖拽排序">⋮⋮</span>
                {{ cat.label }}
              </button>
            </template>
          </draggable>
        </div>
      </section>

      <!-- Step 2: 再 2 - 名人名言主展卡片 -->
      <section class="hero-quote-card" v-loading="loadingQuote">
        <div class="quote-badge-bar">
          <span class="type-tag-badge">🏷️ {{ selectedCategoryLabel }}</span>
          <div class="auto-refresh-control" style="display: flex; align-items: center; gap: 8px;">
            <span class="countdown-badge" style="font-size: 12px; color: #c084fc; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); padding: 4px 12px; border-radius: 14px; font-weight: 600;">
              ⏳ {{ countdown }}s 自动刷新
            </span>
            <el-button
              type="primary"
              plain
              circle
              :icon="Refresh"
              :loading="loadingQuote"
              title="手动刷新并重置 120s 倒计时"
              @click="triggerManualRefresh"
            />
          </div>
        </div>

        <template v-if="currentQuote">
          <div class="quote-body-text">
            “{{ currentQuote.content }}”
          </div>
          <div class="quote-author-row">
            <span class="author-line"></span>
            <span class="author-name">—— {{ currentQuote.author || '匿名名家' }}</span>
          </div>

          <div class="quote-action-bar">
            <el-button
              type="primary"
              size="large"
              class="action-btn"
              :icon="Refresh"
              :loading="loadingQuote"
              @click="handleRefreshQuote(selectedTypeId)"
            >
              🔄 换一句 / 刷新
            </el-button>
            <el-button
              type="default"
              size="large"
              class="action-btn"
              :icon="CopyDocument"
              @click="copyQuoteText(currentQuote)"
            >
              📋 一键复制
            </el-button>
            <el-button
              :type="isCurrentFavorite ? 'warning' : 'default'"
              size="large"
              class="action-btn"
              :icon="StarFilled"
              @click="toggleFavorite(currentQuote)"
            >
              {{ isCurrentFavorite ? '已收藏' : '⭐ 收藏金句' }}
            </el-button>
          </div>
        </template>

        <template v-else>
          <el-empty description="点击上方分类或刷新按钮获取名人名言" />
        </template>
      </section>

      <!-- 收藏与历史金句库 -->
      <section v-if="favoriteQuotes.length > 0" class="favorites-section">
        <h2 class="history-section-title">⭐ 我的金句收藏库 ({{ favoriteQuotes.length }})</h2>
        <div class="history-quotes-grid">
          <div v-for="(item, idx) in favoriteQuotes" :key="idx" class="quote-item-card">
            <div class="item-quote-content">“{{ item.content }}”</div>
            <div class="item-footer">
              <span class="item-author">—— {{ item.author || '匿名' }}</span>
              <div class="item-actions">
                <el-button
                  size="small"
                  circle
                  :icon="CopyDocument"
                  title="复制"
                  @click="copyQuoteText(item)"
                />
                <el-button
                  size="small"
                  type="danger"
                  plain
                  circle
                  :icon="Delete"
                  title="删除收藏"
                  @click="confirmRemoveFavorite(idx, item)"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
