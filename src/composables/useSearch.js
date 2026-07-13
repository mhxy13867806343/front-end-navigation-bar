import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useSearch(menuItems, getCurrentTools) {
  const searchQuery = ref('')
  const searchHistory = ref(JSON.parse(localStorage.getItem('searchHistory') || '[]'))
  
  const searchCategories = [
    {
      id: 'common',
      name: '常用',
      engines: [
        { id: 'site', name: '站内', placeholder: '站内AI工具搜索...', url: '' },
        { id: 'bing', name: 'Bing', placeholder: 'Bing 搜索...', url: 'https://cn.bing.com/search?q=' },
        { id: 'baidu', name: '百度', placeholder: '百度一下，你就知道...', url: 'https://www.baidu.com/s?wd=' },
        { id: 'google', name: 'Google', placeholder: 'Google 搜索...', url: 'https://www.google.com/search?q=' },
        { id: 'perplexity', name: 'Perplexity', placeholder: 'Perplexity AI 搜索...', url: 'https://www.perplexity.ai/search?q=' }
      ]
    },
    {
      id: 'search',
      name: '搜索',
      engines: [
        { id: 'google', name: 'Google', placeholder: 'Google 搜索...', url: 'https://www.google.com/search?q=' },
        { id: 'bing', name: 'Bing', placeholder: 'Bing 搜索...', url: 'https://cn.bing.com/search?q=' },
        { id: 'baidu', name: '百度', placeholder: '百度一下，你就知道...', url: 'https://www.baidu.com/s?wd=' },
        { id: 'developer', name: '开发者', placeholder: '百度开发者搜索...', url: 'https://kaifa.baidu.com/searchPage?wd=' },
        { id: 'duckduckgo', name: 'DuckDuckGo', placeholder: 'DuckDuckGo 搜索...', url: 'https://duckduckgo.com/?q=' }
      ]
    },
    {
      id: 'community',
      name: '社区',
      engines: [
        { id: 'github', name: 'GitHub', placeholder: 'GitHub 项目/代码搜索...', url: 'https://github.com/search?q=' },
        { id: 'zhihu', name: '知乎', placeholder: '知乎内容搜索...', url: 'https://www.zhihu.com/search?q=' },
        { id: 'juejin', name: '掘金', placeholder: '掘金技术文章搜索...', url: 'https://juejin.cn/search?query=' },
        { id: 'stackoverflow', name: 'StackOverflow', placeholder: 'Stack Overflow 问答搜索...', url: 'https://stackoverflow.com/search?q=' },
        { id: 'v2ex', name: 'V2EX', placeholder: 'V2EX 帖子搜索...', url: 'https://www.google.com/search?q=site:v2ex.com/t ' }
      ]
    },
    {
      id: 'images',
      name: '图片',
      engines: [
        { id: 'unsplash', name: 'Unsplash', placeholder: 'Unsplash 高清无版权图片搜索...', url: 'https://unsplash.com/s/photos/' },
        { id: 'pixabay', name: 'Pixabay', placeholder: 'Pixabay 免版税图片搜索...', url: 'https://pixabay.com/images/search/' },
        { id: 'baiduimg', name: '百度图片', placeholder: '百度图片搜索...', url: 'https://image.baidu.com/search/index?tn=baiduimage&word=' },
        { id: 'huaban', name: '花瓣网', placeholder: '花瓣设计灵感搜索...', url: 'https://huaban.com/search/?q=' }
      ]
    },
    {
      id: 'life',
      name: '生活',
      engines: [
        { id: 'bilibili', name: '哔哩哔哩', placeholder: 'B站 视频、手办、番剧搜索...', url: 'https://search.bilibili.com/all?keyword=' },
        { id: 'taobao', name: '淘宝', placeholder: '淘宝商品搜索...', url: 'https://s.taobao.com/search?q=' },
        { id: 'jd', name: '京东', placeholder: '京东商品搜索...', url: 'https://search.jd.com/Search?keyword=' },
        { id: 'amap', name: '高德地图', placeholder: '高德地图地点搜索...', url: 'https://www.amap.com/search?query=' }
      ]
    }
  ]

  const activeSearchCat = ref('common')
  const activeEngineId = ref('site')

  const selectSearchCategory = (catId) => {
    activeSearchCat.value = catId
    const cat = searchCategories.find(c => c.id === catId)
    if (cat && cat.engines.length > 0) {
      activeEngineId.value = cat.engines[0].id
    }
  }

  const activeCategory = computed(() => {
    return searchCategories.find(c => c.id === activeSearchCat.value) || searchCategories[0]
  })

  const activeEngine = computed(() => {
    const engines = activeCategory.value.engines
    return engines.find(e => e.id === activeEngineId.value) || engines[0]
  })

  const clearSearch = () => {
    searchQuery.value = ''
  }

  const saveSearchQuery = (query) => {
    if (!query) return
    const trimmed = query.trim()
    if (!trimmed) return
    let history = searchHistory.value.filter(item => item !== trimmed)
    history.unshift(trimmed)
    if (history.length > 8) {
      history = history.slice(0, 8)
    }
    searchHistory.value = history
    localStorage.setItem('searchHistory', JSON.stringify(history))
  }

  const triggerSearch = () => {
    const query = searchQuery.value.trim()
    if (!query) {
      ElMessage({
        message: '请输入要搜索的关键词内容！',
        type: 'warning',
        duration: 2000
      })
      return
    }

    saveSearchQuery(query)

    if (activeEngine.value.id === 'site') {
      // 站内搜索
    } else {
      const url = activeEngine.value.url + encodeURIComponent(query)
      window.open(url, '_blank')
    }
  }

  const useHistoryTag = (tag) => {
    searchQuery.value = tag
    if (activeEngine.value.id !== 'site') {
      triggerSearch()
    }
  }

  const clearHistory = () => {
    ElMessageBox.confirm(
      '确定要清空所有的历史搜索记录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(() => {
        searchHistory.value = []
        localStorage.setItem('searchHistory', '[]')
      })
      .catch(() => {})
  }

  const filteredTools = computed(() => {
    if (!searchQuery.value) return getCurrentTools()
    const query = searchQuery.value.toLowerCase()
    
    const results = []
    menuItems.value.forEach(category => {
      if (category.tools) {
        category.tools.forEach(tool => {
          if (tool.name.toLowerCase().includes(query) || tool.desc.toLowerCase().includes(query)) {
            results.push({
              ...tool,
              categoryName: category.name,
              categoryIcon: category.icon,
              categoryId: category.id
            })
          }
        })
      }
      if (category.subcategories) {
        category.subcategories.forEach(sub => {
          sub.tools.forEach(tool => {
            if (tool.name.toLowerCase().includes(query) || tool.desc.toLowerCase().includes(query)) {
              results.push({
                ...tool,
                categoryName: `${category.name} - ${sub.name}`,
                categoryIcon: category.icon,
                categoryId: category.id
              })
            }
          })
        })
      }
    })
    return results
  })

  const isListening = ref(false)
  let recognition = null

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition
    if (!SpeechRecognition) {
      ElMessage({
        message: '当前浏览器不支持语音识别功能，请使用 Chrome、Safari 或 Edge 浏览器。',
        type: 'error',
        duration: 3000
      })
      return
    }

    if (isListening.value) {
      if (recognition) {
        recognition.stop()
      }
      return
    }

    try {
      recognition = new SpeechRecognition()
      recognition.lang = 'zh-CN'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        isListening.value = true
        ElMessage({
          message: '🎤 正在倾听，请说话...',
          type: 'info',
          duration: 1500
        })
      }

      recognition.onerror = (event) => {
        isListening.value = false
        console.error('语音识别错误:', event.error)
        let errorMsg = '语音识别失败，请检查麦克风权限！'
        if (event.error === 'no-speech') {
          errorMsg = '未检测到说话声音，请再试一次。'
        } else if (event.error === 'audio-capture') {
          errorMsg = '未找到麦克风设备，请连接麦克风。'
        } else if (event.error === 'not-allowed') {
          errorMsg = '浏览器麦克风权限被拒绝，请在浏览器设置中允许麦克风权限。'
        }
        ElMessage({
          message: errorMsg,
          type: 'error',
          duration: 3000
        })
      }

      recognition.onend = () => {
        isListening.value = false
      }

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript
        if (text) {
          searchQuery.value = text
          ElMessage({
            message: `识别成功: "${text}"`,
            type: 'success',
            duration: 1500
          })
          triggerSearch()
        }
      }

      recognition.start()
    } catch (e) {
      isListening.value = false
      console.error('实例化语音识别失败:', e)
    }
  }

  return {
    isListening,
    startVoiceSearch,
    searchQuery,
    searchHistory,
    searchCategories,
    activeSearchCat,
    activeEngineId,
    selectSearchCategory,
    activeCategory,
    activeEngine,
    clearSearch,
    saveSearchQuery,
    triggerSearch,
    useHistoryTag,
    clearHistory,
    filteredTools
  }
}
