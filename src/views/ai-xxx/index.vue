<script setup lang="ts">
import AiArticlesList from '@/components/AiArticlesList.vue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

type AiArticleType = 'column' | 'qa' | 'encyclopedia' | 'hall_of_fame' | 'research'

interface AiSectionNavItem {
  label: string
  icon: string
  path: string
  type: AiArticleType
}

const route = useRoute()
const isArticlesLoading = ref(false)

const sections: AiSectionNavItem[] = [
  { label: 'AI项目研究', icon: '🔬', path: '/ai-xxx/ai-research', type: 'research' },
  { label: 'AI教程专栏', icon: '📖', path: '/ai-xxx/ai-column', type: 'column' },
  { label: 'AI百问百答', icon: '💬', path: '/ai-xxx/ai-question-and-answer', type: 'qa' },
  { label: 'AI百科大全', icon: '📕', path: '/ai-xxx/ai-encyclopedia', type: 'encyclopedia' },
  { label: 'AI名人堂', icon: '🎖️', path: '/ai-xxx/ai-hall-of-fame', type: 'hall_of_fame' }
]

const sectionTypeBySlug: Record<string, AiArticleType> = {
  'ai-research': 'research',
  'ai-column': 'column',
  'ai-question-and-answer': 'qa',
  'ai-encyclopedia': 'encyclopedia',
  'ai-hall-of-fame': 'hall_of_fame'
}

const activeType = computed<AiArticleType>(() => {
  const section = String(route.params.section || 'ai-column')
  return sectionTypeBySlug[section] || 'column'
})

function handleTabClick(event: MouseEvent): void {
  if (isArticlesLoading.value) event.preventDefault()
}
</script>

<template>
  <section class="ai-xxx-page">
    <div class="ai-xxx-inner">
      <nav class="ai-xxx-tabs" aria-label="AI教程资源栏目">
        <router-link
          v-for="section in sections"
          :key="section.path"
          :to="section.path"
          class="ai-xxx-tab"
          :class="{ active: activeType === section.type, disabled: isArticlesLoading }"
          :aria-disabled="isArticlesLoading"
          @click="handleTabClick"
        >
          <span>{{ section.icon }}</span>
          <span>{{ section.label }}</span>
        </router-link>
      </nav>

      <AiArticlesList :type="activeType" @loading-change="isArticlesLoading = $event" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.ai-xxx-page {
  min-height: 100%;
  padding: 20px;
}

.ai-xxx-inner {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: min(1120px, 100%);
  margin: 0 auto;
}

.ai-xxx-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--card-bg);
}

.ai-xxx-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.ai-xxx-tab:hover,
.ai-xxx-tab.active {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb, 99, 102, 241), 0.1);
}

.ai-xxx-tab.disabled {
  cursor: not-allowed;
  opacity: 0.55;
  pointer-events: none;
}

@media (max-width: 640px) {
  .ai-xxx-page {
    padding: 12px;
  }

  .ai-xxx-tab {
    flex: 1 1 140px;
    justify-content: center;
  }
}
</style>
