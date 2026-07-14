
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ComputedRef, Ref } from 'vue'
import type { NavigationCategory, ToolItem } from '@/types/navigation'

interface LikedItemInfo {
  menuName: string
  menuIcon: string
  timestamp: number
}

type LikedItemsInfo = Record<string, LikedItemInfo>
type LikedToolItem = ToolItem & { menuInfo: LikedItemInfo }

interface UseLikesReturn {
  likedItemsInfo: Ref<LikedItemsInfo>
  showLikeHistory: Ref<boolean>
  isLiked: (itemId: string) => boolean
  toggleLike: (itemId: string) => void
  likedToolsList: ComputedRef<LikedToolItem[]>
  clearAllLikes: () => void
}

export function useLikes(menuItems: Ref<NavigationCategory[]>): UseLikesReturn {
  const likedItemsInfo = ref<LikedItemsInfo>(JSON.parse(localStorage.getItem('likedItemsInfo') || '{}') as LikedItemsInfo)
  const showLikeHistory = ref<boolean>(false)

  const isLiked = (itemId: string): boolean => {
    return !!likedItemsInfo.value[itemId]
  }

  const toggleLike = (itemId: string): void => {
    let currentMenu: NavigationCategory | null = null
    let currentTool: ToolItem | null = null
    
    for (const menu of menuItems.value) {
      if (menu.tools) {
        const tool: ToolItem | undefined = menu.tools.find((t: ToolItem): boolean => t.id === itemId)
        if (tool) {
          currentMenu = menu
          currentTool = tool
          break
        }
      }
      if (menu.subcategories) {
        for (const sub of menu.subcategories) {
          const tool: ToolItem | undefined = sub.tools.find((t: ToolItem): boolean => t.id === itemId)
          if (tool) {
            currentMenu = menu
            currentTool = tool
            break
          }
        }
      }
    }
    
    if (likedItemsInfo.value[itemId]) {
      delete likedItemsInfo.value[itemId]
      ElMessage({
        message: `已取消收藏: ${currentTool ? currentTool.name : '该工具'}`,
        type: 'info',
        duration: 1500
      })
    } else if (currentTool && currentMenu) {
      likedItemsInfo.value[itemId] = {
        menuName: currentMenu.name,
        menuIcon: currentMenu.icon,
        timestamp: new Date().getTime()
      }
      ElMessage({
        message: `🎉 已成功收藏: ${currentTool.name}`,
        type: 'success',
        duration: 1500
      })
    }
    
    localStorage.setItem('likedItemsInfo', JSON.stringify(likedItemsInfo.value))

    const heart: Element | null = document.querySelector(`.heart-icon-${itemId}`)
    if (heart) {
      heart.classList.add('jelly')
      setTimeout(() => {
        heart.classList.remove('jelly')
      }, 600)
    }
  }

  const likedToolsList = computed<LikedToolItem[]>(() => {
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
    
    return allTools
      .filter((tool: ToolItem): boolean => Boolean(likedItemsInfo.value[tool.id]))
      .map((tool: ToolItem): LikedToolItem => ({
        ...tool,
        menuInfo: likedItemsInfo.value[tool.id] as LikedItemInfo
      }))
  })

  const clearAllLikes = (): void => {
    ElMessageBox.confirm(
      `确定要清空历史爱心记录<span style="color: #ff4757; font-weight: bold; font-size: 16px; margin: 0 4px; font-weight: 800; font-stretch: expanded;">${likedToolsList.value.length}</span>条点赞记录吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-message-box'
      }
    )
      .then(() => {
        likedItemsInfo.value = {}
        localStorage.setItem('likedItemsInfo', '{}')
      })
      .catch(() => {})
  }

  return {
    likedItemsInfo,
    showLikeHistory,
    isLiked,
    toggleLike,
    likedToolsList,
    clearAllLikes
  }
}
