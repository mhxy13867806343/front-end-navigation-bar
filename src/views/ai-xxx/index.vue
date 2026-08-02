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

<style scoped lang="scss" src="./css/index.scss"></style>
