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

// Step 1: 先 1 - 获取名人名言类型列表
const fetchCategories = async (): Promise<void> => {
  loadingCategory.value = true
  try {
    const res = await axios.get<AlapiResponse<MingyanTypeItem[]>>(buildAlapiUrl('/api/mingyan/type'), {
      params: { token: ALAPI_TOKEN }
    })
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      categories.value = res.data.data
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
        ElMessage.success('已刷新获取新的一句名言！')
      }
    } else {
      ElMessage.error(res.data.message || '获取名言失败，请重试')
    }
  } catch (e) {
    ElMessage.error('网络请求失败，请稍后刷新')
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
      ElMessage.success('名言金句已成功复制到剪贴板！')
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
    ElMessage.success('名言金句已成功复制到剪贴板！')
  } catch (err) {
    ElMessage.error('复制失败，请手动选中文本复制')
  }
  document.body.removeChild(textArea)
}

const toggleFavorite = (quote: MingyanQuoteItem): void => {
  const idx: number = favoriteQuotes.value.findIndex(
    (item: MingyanQuoteItem) => item.content === quote.content && item.author === quote.author
  )
  if (idx >= 0) {
    favoriteQuotes.value.splice(idx, 1)
    ElMessage.info('已取消收藏')
  } else {
    favoriteQuotes.value.unshift({ ...quote, typeid: selectedTypeId.value || quote.typeid })
    ElMessage.success('已添加到金句收藏库！')
  }
  localStorage.setItem('favorite_mingyan_quotes', JSON.stringify(favoriteQuotes.value))
}

const confirmRemoveFavorite = (index: number, quote: MingyanQuoteItem): void => {
  ElMessageBox.confirm(
    `确定要从收藏库中删除“${quote.content.substring(0, 18)}${quote.content.length > 18 ? '...' : ''}”这句名言吗？`,
    '确认删除提示',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    favoriteQuotes.value.splice(index, 1)
    localStorage.setItem('favorite_mingyan_quotes', JSON.stringify(favoriteQuotes.value))
    ElMessage.success('已从金句收藏库中删除该名言！')
  }).catch(() => {
    ElMessage.info('已取消删除操作')
  })
}

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
          <span class="section-title">🏷️ 名言分类 (点击筛选类型)</span>
          <span class="badge-count">{{ categories.length }} 个主题类型</span>
        </div>
        <div class="category-tags">
          <button
            type="button"
            class="category-pill"
            :class="{ active: selectedTypeId === null }"
            @click="selectCategory(null)"
          >
            🌟 全部随机
          </button>
          <button
            v-for="cat in categories"
            :key="cat.value"
            type="button"
            class="category-pill"
            :class="{ active: selectedTypeId === cat.value }"
            @click="selectCategory(cat.value)"
          >
            {{ cat.label }}
          </button>
        </div>
      </section>

      <!-- Step 2: 再 2 - 名人名言主展卡片 -->
      <section class="hero-quote-card" v-loading="loadingQuote">
        <div class="quote-badge-bar">
          <span class="type-tag-badge">🏷️ {{ selectedCategoryLabel }}</span>
          <el-button
            type="primary"
            plain
            circle
            :icon="Refresh"
            title="换一句"
            @click="handleRefreshQuote(selectedTypeId)"
          />
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
