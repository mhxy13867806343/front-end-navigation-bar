
export function useRandomWebsites(menuItems) {
  const randomTools = ref([])

  const refreshRandomTools = () => {
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

    if (allTools.length === 0) return

    // 随机排序并挑选 12 个
    const shuffled = [...allTools].sort(() => 0.5 - Math.random())
    randomTools.value = shuffled.slice(0, 12)
  }

  return {
    randomTools,
    refreshRandomTools
  }
}
