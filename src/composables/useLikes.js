import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useLikes(menuItems) {
  const likedItemsInfo = ref(JSON.parse(localStorage.getItem('likedItemsInfo') || '{}'))
  const showLikeHistory = ref(false)

  const isLiked = (itemId) => {
    return !!likedItemsInfo.value[itemId]
  }

  const toggleLike = (itemId) => {
    let currentMenu = null
    let currentTool = null
    
    for (const menu of menuItems.value) {
      if (menu.tools) {
        const tool = menu.tools.find(t => t.id === itemId)
        if (tool) {
          currentMenu = menu
          currentTool = tool
          break
        }
      }
      if (menu.subcategories) {
        for (const sub of menu.subcategories) {
          const tool = sub.tools.find(t => t.id === itemId)
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

    const heart = document.querySelector(`.heart-icon-${itemId}`)
    if (heart) {
      heart.classList.add('jelly')
      setTimeout(() => {
        heart.classList.remove('jelly')
      }, 600)
    }
  }

  const likedToolsList = computed(() => {
    const allTools = []
    menuItems.value.forEach(category => {
      if (category.tools) {
        allTools.push(...category.tools)
      }
      if (category.subcategories) {
        category.subcategories.forEach(sub => {
          allTools.push(...sub.tools)
        })
      }
    })
    
    return allTools
      .filter(tool => likedItemsInfo.value[tool.id])
      .map(tool => ({
        ...tool,
        menuInfo: likedItemsInfo.value[tool.id]
      }))
  })

  const clearAllLikes = () => {
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
