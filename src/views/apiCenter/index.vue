<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { flattenApiEndpoints, getApiCategoryNames, getCategoryEndpoints, type ApiEndpointRecord } from './shared'

interface ApiCategoryView {
  name: string
  count: number
  description: string
  endpoints: ApiEndpointRecord[]
}

const ALL_CATEGORY_NAME = '全部接口'

const route = useRoute()
const router = useRouter()
const searchKeyword = ref<string>('')
const selectedCategory = ref<string>(ALL_CATEGORY_NAME)

const categoryNames = getApiCategoryNames()
const totalEndpointCount = flattenApiEndpoints().length

const syncCategoryFromRoute = (): void => {
  const routeCategory: string = typeof route.query.category === 'string' ? route.query.category : ''
  selectedCategory.value = routeCategory && categoryNames.includes(routeCategory) ? routeCategory : ALL_CATEGORY_NAME
}

watch(() => route.query.category, syncCategoryFromRoute, { immediate: true })

const categoryViews = computed<ApiCategoryView[]>((): ApiCategoryView[] => {
  const keyword: string = searchKeyword.value.trim().toLowerCase()
  const targetCategories: string[] = selectedCategory.value === ALL_CATEGORY_NAME
    ? categoryNames
    : categoryNames.filter((categoryName: string): boolean => categoryName === selectedCategory.value)

  return targetCategories
    .map((categoryName: string): ApiCategoryView => {
      const endpoints: ApiEndpointRecord[] = getCategoryEndpoints(categoryName)
        .filter((endpoint: ApiEndpointRecord): boolean => {
          if (!keyword) return true
          return [
            endpoint.name,
            endpoint.path,
            endpoint.desc || '',
            endpoint.method,
            endpoint.categoryName
          ].join(' ').toLowerCase().includes(keyword)
        })

      return {
        name: categoryName,
        count: endpoints.length,
        description: endpoints[0]?.desc || '统一收纳该分类下的接口能力。',
        endpoints
      }
    })
    .filter((category: ApiCategoryView): boolean => category.endpoints.length > 0)
})

const visibleEndpointCount = computed<number>((): number => {
  return categoryViews.value.reduce((total: number, category: ApiCategoryView): number => total + category.count, 0)
})

const selectCategory = (categoryName: string): void => {
  selectedCategory.value = categoryName
  const nextQuery = categoryName === ALL_CATEGORY_NAME ? {} : { category: categoryName }
  void router.replace({ path: '/api-center', query: nextQuery })
}

const openEndpoint = (endpoint: ApiEndpointRecord): void => {
  void router.push({
    name: 'ApiCenterDetail',
    params: {
      category: endpoint.categoryName,
      endpoint: endpoint.name
    }
  })
}

const goToolbox = (): void => {
  void router.push('/toolbox')
}
</script>

<template>
  <main class="api-center-page">
    <section class="api-center-hero">
      <div>
        <p class="api-center-kicker">统一接口中心</p>
        <h1>所有接口独立收口到这里</h1>
        <p>先在这里看分类和接口列表，再点进单个接口详情页进行请求与结果展示，不再直接落进旧的 API 调试面板。</p>
      </div>
      <div class="api-center-hero-actions">
        <button type="button" class="ghost-btn" @click="goToolbox">返回工具集合</button>
        <div class="hero-stat-card">
          <strong>{{ totalEndpointCount }}</strong>
          <span>总接口数</span>
        </div>
      </div>
    </section>

    <section class="api-center-toolbar">
      <div class="toolbar-search">
        <label for="api-center-search">接口搜索</label>
        <input
          id="api-center-search"
          v-model="searchKeyword"
          type="text"
          placeholder="输入接口名、路径或分类关键词"
        >
      </div>
      <div class="toolbar-summary">
        <span>当前分类：{{ selectedCategory }}</span>
        <strong>展示 {{ visibleEndpointCount }} 个接口</strong>
      </div>
    </section>

    <section class="api-center-layout">
      <aside class="category-sidebar">
        <button
          type="button"
          class="category-item"
          :class="{ active: selectedCategory === ALL_CATEGORY_NAME }"
          @click="selectCategory(ALL_CATEGORY_NAME)"
        >
          <span>{{ ALL_CATEGORY_NAME }}</span>
          <em>{{ totalEndpointCount }}</em>
        </button>
        <button
          v-for="categoryName in categoryNames"
          :key="categoryName"
          type="button"
          class="category-item"
          :class="{ active: selectedCategory === categoryName }"
          @click="selectCategory(categoryName)"
        >
          <span>{{ categoryName }}</span>
          <em>{{ getCategoryEndpoints(categoryName).length }}</em>
        </button>
      </aside>

      <div class="api-groups">
        <section
          v-for="category in categoryViews"
          :key="category.name"
          class="api-group"
        >
          <div class="group-head">
            <div>
              <p class="group-count">{{ category.count }} 个接口</p>
              <h2>{{ category.name }}</h2>
            </div>
            <button type="button" class="group-filter-btn" @click="selectCategory(category.name)">只看这一组</button>
          </div>

          <div class="api-card-grid">
            <button
              v-for="endpoint in category.endpoints"
              :key="`${endpoint.categoryName}-${endpoint.name}`"
              type="button"
              class="api-card"
              @click="openEndpoint(endpoint)"
            >
              <div class="api-card-top">
                <span class="method-badge" :class="endpoint.method.toLowerCase()">{{ endpoint.method }}</span>
                <span class="path-text">{{ endpoint.path }}</span>
              </div>
              <strong>{{ endpoint.name }}</strong>
              <p>{{ endpoint.desc || category.description }}</p>
              <div class="api-card-footer">
                <span>{{ endpoint.skipAuth ? '免登录接口' : '需要认证' }}</span>
                <span>查看详情 ›</span>
              </div>
            </button>
          </div>
        </section>

        <section v-if="categoryViews.length === 0" class="api-empty">
          <h3>没有匹配到接口</h3>
          <p>换个关键词试试，或者切换左侧分类重新查看。</p>
          <button type="button" class="ghost-btn" @click="searchKeyword = ''">清空搜索</button>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
