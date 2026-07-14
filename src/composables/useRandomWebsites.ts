import type { Ref } from 'vue'
import type { NavigationCategory, ToolItem } from '@/types/navigation'

interface UseRandomWebsitesReturn {
  randomTools: Ref<ToolItem[]>
  refreshRandomTools: () => void
}

export function useRandomWebsites(menuItems: Ref<NavigationCategory[]>): UseRandomWebsitesReturn {
  const randomTools = ref<ToolItem[]>([])

  const refreshRandomTools = (): void => {
    const allTools: ToolItem[] = []
    menuItems.value.forEach((category: NavigationCategory): void => {
      if (category.tools) {
        allTools.push(...category.tools)
      }
      if (category.subcategories) {
        category.subcategories.forEach((sub): void => {
          allTools.push(...sub.tools)
        })
      }
    })

    if (allTools.length === 0) return

    // 随机排序并挑选 12 个
    const shuffled: ToolItem[] = [...allTools].sort((): number => 0.5 - Math.random())
    randomTools.value = shuffled.slice(0, 12)
  }

  return {
    randomTools,
    refreshRandomTools
  }
}
