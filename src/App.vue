<script setup>
import { ref, onMounted, computed, shallowRef, onUnmounted } from 'vue'
import { menuItemsList, authorWorksList, onlineWorksList } from '@/utlis/menuItems'
import { ElDialog, ElMessageBox } from 'element-plus'
import { Message, Timer } from '@element-plus/icons-vue'
import SokobanGame from './components/games/SokobanGame.vue'
import ImageEditor from './components/image/ImageEditor.vue'
import MusicPlayer from "./components/MusicPlayer.vue"
import DyForm from './views/DyForm.vue'
import AnalogClock from './components/AnalogClock.vue'
import FruitCatcher from './components/games/FruitCatcher.vue'
import BattleCityGame from './components/games/BattleCityGame.vue'
import BrickBreakerGame from './components/games/BrickBreakerGame.vue'
import FlappyBirdGame from './components/games/FlappyBirdGame.vue'
import SpaceShooterGame from './components/games/SpaceShooterGame.vue'
import SnakeGame from './components/games/SnakeGame.vue'
import TetrisGame from './components/games/TetrisGame.vue'
import Game2048 from './components/games/Game2048.vue'
import MinesweeperGame from './components/games/MinesweeperGame.vue'
import TicTacToeGame from './components/games/TicTacToeGame.vue'
import ApiToolbox from './components/ApiToolbox.vue'
import AiNewsTimeline from './components/AiNewsTimeline.vue'
import AiAppStore from './components/AiAppStore.vue'
import AiArticlesList from './components/AiArticlesList.vue'

// 判断是否为生产环境
const isProd = import.meta.env.PROD

const menuItems = ref(menuItemsList)

// 从本地存储初始化激活的菜单项
const activeItem = ref(parseInt(localStorage.getItem('activeItem')) || 1)
const isSidebarOpen = ref(true)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const showThemeDropdown = ref(false)
const showAuthorDropdown = ref(false)
const showOnlineWorksDropdown = ref(false)
const authorWorks = ref(authorWorksList)
const onlineWorks = ref(onlineWorksList)
const showDrawer = ref(false)
const isAuthorWorksExpanded = ref(false)
const isOnlineWorksExpanded = ref(false)
const isNewsActive = ref(false)
const isAppStoreActive = ref(false)
const isArticlesListActive = ref(false)
const articlesListType = ref('tutorials')

const gridCols = ref(parseInt(localStorage.getItem('gridCols')) || 3)
const setGridCols = (cols) => {
  gridCols.value = cols
  localStorage.setItem('gridCols', cols.toString())
}

const getActiveCategoryName = () => {
  const cat = menuItems.value.find(c => c.id === activeItem.value)
  return cat ? cat.name : '全部'
}

const showNewsTimeline = () => {
  isNewsActive.value = true
  isAppStoreActive.value = false
  isArticlesListActive.value = false
}
const showAppStore = () => {
  isAppStoreActive.value = true
  isNewsActive.value = false
  isArticlesListActive.value = false
}
const showArticlesList = (type) => {
  articlesListType.value = type
  isArticlesListActive.value = true
  isNewsActive.value = false
  isAppStoreActive.value = false
}
const showAboutDialog = ref(false)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
const aiCategories = computed(() => {
  return menuItems.value.filter(item => item.id !== 24)
})

const isHomeLive = ref(false)
const isHomeLoading = ref(false)

const isUrl = (str) => {
  if (!str) return false
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')
}

const parseHomeHtml = (htmlText) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlText, 'text/html')
  
  const sidebarItems = doc.querySelectorAll('.sidebar-menu-inner > ul > li.sidebar-item')
  if (sidebarItems.length === 0) return []
  
  const parsedMenuItems = []
  
  sidebarItems.forEach((li, index) => {
    const parentA = li.querySelector('a')
    if (!parentA) return
    const hrefAttr = parentA.getAttribute('href')
    if (!hrefAttr || !hrefAttr.startsWith('#term-')) return
    
    const catName = parentA.querySelector('span')?.textContent.trim() || ''
    const catAnchor = hrefAttr.replace('#', '')
    
    const subUl = li.querySelector('ul')
    const subcategories = []
    
    if (subUl) {
      const subLinks = subUl.querySelectorAll('li a')
      subLinks.forEach(subA => {
        const subHref = subA.getAttribute('href')
        if (subHref && subHref.startsWith('#term-')) {
          const subName = subA.querySelector('span')?.textContent.trim() || subA.textContent.trim()
          const subAnchor = subHref.replace('#', '')
          
          const bodyTabLink = doc.getElementById(subAnchor)
          let tabId = subAnchor.replace('term-', 'tab-')
          if (bodyTabLink) {
            const hrefVal = bodyTabLink.getAttribute('href')
            if (hrefVal) tabId = hrefVal.replace('#', '')
          }
          
          const tabPane = doc.getElementById(tabId)
          const tools = []
          
          if (tabPane) {
            const cards = tabPane.querySelectorAll('.url-card')
            cards.forEach(card => {
              const a = card.querySelector('a')
              if (!a) return
              const nameEl = a.querySelector('strong')
              const name = nameEl ? nameEl.textContent.trim() : a.getAttribute('title') || ''
              if (!name) return
              const descEl = a.querySelector('p.text-muted')
              const desc = descEl ? descEl.textContent.trim() : ''
              const link = a.getAttribute('data-url') || a.getAttribute('href') || ''
              const img = a.querySelector('img')
              const icon = img ? (img.getAttribute('data-src') || img.getAttribute('src') || '') : ''
              
              tools.push({
                id: `live-tool-${Math.random().toString(36).substr(2, 9)}`,
                name,
                link,
                icon,
                desc,
                status: 'Free',
                needVPN: false,
                price: '免费',
                region: '国内'
              })
            })
          }
          
          if (tools.length > 0) {
            subcategories.push({
              id: subAnchor,
              name: subName,
              tools
            })
          }
        }
      })
    }
    
    let tools = []
    if (subcategories.length === 0) {
      const headerIcon = doc.getElementById(catAnchor)
      if (headerIcon) {
        const headerEl = headerIcon.parentElement
        let rowEl = null
        let nextSibling = headerEl.nextElementSibling || headerEl.parentElement?.nextElementSibling
        for (let k = 0; k < 5; k++) {
          if (nextSibling) {
            if (nextSibling.classList.contains('row')) {
              rowEl = nextSibling
              break
            }
            const subRow = nextSibling.querySelector('.row')
            if (subRow) {
              rowEl = subRow
              break
            }
            nextSibling = nextSibling.nextElementSibling
          }
        }
        
        if (rowEl) {
          const cards = rowEl.querySelectorAll('.url-card')
          cards.forEach(card => {
            const a = card.querySelector('a')
            if (!a) return
            const nameEl = a.querySelector('strong')
            const name = nameEl ? nameEl.textContent.trim() : a.getAttribute('title') || ''
            if (!name) return
            const descEl = a.querySelector('p.text-muted')
            const desc = descEl ? descEl.textContent.trim() : ''
            const link = a.getAttribute('data-url') || a.getAttribute('href') || ''
            const img = a.querySelector('img')
            const icon = img ? (img.getAttribute('data-src') || img.getAttribute('src') || '') : ''
            
            tools.push({
              id: `live-tool-${Math.random().toString(36).substr(2, 9)}`,
              name,
              link,
              icon,
              desc,
              status: 'Free',
              needVPN: false,
              price: '免费',
              region: '国内'
            })
          })
        }
      }
    }
    
    if (subcategories.length > 0 || tools.length > 0) {
      parsedMenuItems.push({
        id: catAnchor,
        name: catName,
        icon: '🔗',
        subcategories: subcategories.length > 0 ? subcategories : undefined,
        tools: tools.length > 0 ? tools : undefined
      })
    }
  })
  
  return parsedMenuItems
}

const mergeMenuItems = (liveData, staticData) => {
  const staticToolsMap = {}
  staticData.forEach(cat => {
    if (cat.tools) {
      cat.tools.forEach(t => {
        staticToolsMap[t.name.toLowerCase()] = t
      })
    }
    if (cat.subcategories) {
      cat.subcategories.forEach(sub => {
        sub.tools.forEach(t => {
          staticToolsMap[t.name.toLowerCase()] = t
        })
      })
    }
  })
  
  const merged = liveData.map((liveCat) => {
    const staticCat = staticData.find(c => c.name === liveCat.name)
    const catIcon = staticCat ? staticCat.icon : '🔗'
    const catId = staticCat ? staticCat.id : liveCat.id
    
    if (liveCat.subcategories) {
      const mergedSubs = liveCat.subcategories.map(liveSub => {
        const mergedTools = liveSub.tools.map(liveTool => {
          const staticTool = staticToolsMap[liveTool.name.toLowerCase()]
          if (staticTool) {
            return {
              ...staticTool,
              link: liveTool.link || staticTool.link,
              desc: liveTool.desc || staticTool.desc
            }
          }
          return liveTool
        })
        return {
          id: liveSub.id,
          name: liveSub.name,
          tools: mergedTools
        }
      })
      
      return {
        id: catId,
        name: liveCat.name,
        icon: catIcon,
        subcategories: mergedSubs
      }
    } else {
      const mergedTools = (liveCat.tools || []).map(liveTool => {
        const staticTool = staticToolsMap[liveTool.name.toLowerCase()]
        if (staticTool) {
          return {
            ...staticTool,
            link: liveTool.link || staticTool.link,
            desc: liveTool.desc || staticTool.desc
          }
        }
        return liveTool
      })
      
      return {
        id: catId,
        name: liveCat.name,
        icon: catIcon,
        tools: mergedTools
      }
    }
  })
  
  const apiToolboxCat = staticData.find(c => c.id === 24)
  if (apiToolboxCat && !merged.some(c => c.id === 24)) {
    merged.push(apiToolboxCat)
  }
  return merged
}

const fetchHomeDatabase = async () => {
  isHomeLoading.value = true
  const targetUrls = [
    '/api-home',
    'https://api.codetabs.com/v1/proxy?quest=https://ai-bot.cn/',
    'https://api.allorigins.win/raw?url=https://ai-bot.cn/'
  ]
  let success = false
  for (const url of targetUrls) {
    try {
      const response = await fetch(url, { headers: { 'Accept': 'text/html' } })
      if (response.ok) {
        const htmlText = await response.text()
        const parsed = parseHomeHtml(htmlText)
        if (parsed && parsed.length > 0) {
          menuItems.value = mergeMenuItems(parsed, menuItemsList)
          isHomeLive.value = true
          success = true
          break
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch home database from ${url}:`, err.message)
    }
  }
  if (!success) {
    menuItems.value = [...menuItemsList]
    isHomeLive.value = false
  }
  isHomeLoading.value = false
}

// 从本地存储初始化点赞信息
const likedItemsInfo = ref(JSON.parse(localStorage.getItem('likedItemsInfo') || '{}'))

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
  } else if (currentTool && currentMenu) {
    likedItemsInfo.value[itemId] = {
      menuName: currentMenu.name,
      menuIcon: currentMenu.icon,
      timestamp: new Date().getTime()
    }
  }
  
  // 保存到本地存储
  localStorage.setItem('likedItemsInfo', JSON.stringify(likedItemsInfo.value))

  // 添加果冻动画效果
  const heart = document.querySelector(`.heart-icon-${itemId}`)
  heart.classList.add('jelly')
  setTimeout(() => {
    heart.classList.remove('jelly')
  }, 600)
}

// 检查是否已点赞
const isLiked = (itemId) => {
  return !!likedItemsInfo.value[itemId]
}


const activeSubItem = ref(null)

const selectItem = (itemId) => {
  activeItem.value = itemId
  activeSubItem.value = null
  isNewsActive.value = false
  isAppStoreActive.value = false
  isArticlesListActive.value = false
  localStorage.setItem('activeItem', itemId.toString())
}

const selectSubItem = (subId) => {
  activeSubItem.value = subId
  isNewsActive.value = false
  isAppStoreActive.value = false
  isArticlesListActive.value = false
}

const getCurrentTools = () => {
  const cat = menuItems.value.find(item => item.id === activeItem.value)
  if (!cat) return []
  
  if (activeSubItem.value && cat.subcategories) {
    const sub = cat.subcategories.find(s => s.id === activeSubItem.value)
    return sub ? sub.tools : []
  }
  
  if (cat.subcategories) {
    return cat.subcategories.reduce((acc, sub) => acc.concat(sub.tools || []), [])
  }
  
  return cat.tools || []
}

const openLink = (link) => {
  if (link) {
    window.open(link, '_blank')
  }
}
const toggleTheme = () => {
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  tool: null
})

const handleRightClick = (event, tool) => {
  event.preventDefault()
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    tool
  }
}

const closeContextMenu = () => {
  contextMenu.value.show = false
}

const copyLink = () => {
  if (contextMenu.value.tool) {
    navigator.clipboard.writeText(contextMenu.value.tool.link)
    closeContextMenu()
  }
}

const openInNewTab = () => {
  if (contextMenu.value.tool) {
    window.open(contextMenu.value.tool.link, '_blank')
    closeContextMenu()
  }
}

const toggleAuthorDropdown = () => {
  showAuthorDropdown.value = !showAuthorDropdown.value
  showThemeDropdown.value = false
  showOnlineWorksDropdown.value = false
  showAiToolsDropdown.value = false
  showLatestProjectsDropdown.value = false
  showAiTutorialsDropdown.value = false
}

const toggleThemeDropdown = () => {
  showThemeDropdown.value = !showThemeDropdown.value
  showAuthorDropdown.value = false
  showOnlineWorksDropdown.value = false
  showAiToolsDropdown.value = false
  showLatestProjectsDropdown.value = false
  showAiTutorialsDropdown.value = false
}

const toggleOnlineWorksDropdown = () => {
  showOnlineWorksDropdown.value = !showOnlineWorksDropdown.value
  showThemeDropdown.value = false
  showAuthorDropdown.value = false
  showAiToolsDropdown.value = false
  showLatestProjectsDropdown.value = false
  showAiTutorialsDropdown.value = false
}

const showAiToolsDropdown = ref(false)
const showLatestProjectsDropdown = ref(false)
const showAiTutorialsDropdown = ref(false)

const toggleAiToolsDropdown = () => {
  showAiToolsDropdown.value = !showAiToolsDropdown.value
  showThemeDropdown.value = false
  showAuthorDropdown.value = false
  showOnlineWorksDropdown.value = false
  showLatestProjectsDropdown.value = false
  showAiTutorialsDropdown.value = false
}

const toggleLatestProjectsDropdown = () => {
  showLatestProjectsDropdown.value = !showLatestProjectsDropdown.value
  showThemeDropdown.value = false
  showAuthorDropdown.value = false
  showOnlineWorksDropdown.value = false
  showAiToolsDropdown.value = false
  showAiTutorialsDropdown.value = false
}

const toggleAiTutorialsDropdown = () => {
  showAiTutorialsDropdown.value = !showAiTutorialsDropdown.value
  showThemeDropdown.value = false
  showAuthorDropdown.value = false
  showOnlineWorksDropdown.value = false
  showAiToolsDropdown.value = false
  showLatestProjectsDropdown.value = false
}

const searchQuery = ref('')
const searchHistory = ref(JSON.parse(localStorage.getItem('searchHistory') || '[]'))

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

const useHistoryTag = (tag) => {
  searchQuery.value = tag
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
    .catch(() => {
      // 取消操作
    })
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

// 获取已点赞的工具列表（包含菜单信息）
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

// 打开历史记录
const openLikeHistory = () => {
  showLikeHistory.value = true
}

// 关闭历史记录
const closeLikeHistory = () => {
  showLikeHistory.value = false
}

// 清空所有点赞
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

const showGameDialog = ref(false)
const currentGame = shallowRef(null)
const gameTitle = ref('')

const handleCloseDialog = (done) => {
  const currentItem = menuItems.value.find(item => item.id === activeItem.value)
  let message = '确定要退出吗？'
  
  // 根据type显示不同的提示信息
  if (currentItem.type === 'game') {
    message = '确定要退出游戏吗？'
  } else if (currentItem.type === 'image') {
    message = '确定要退出图片操作吗？'
  }

  ElMessageBox.confirm(message, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      done()
    })
    .catch(() => {})
}

const openGame = (work) => {
  showGameDialog.value = true
  gameTitle.value = work.name
  
  switch(work.type) {
    case 'game':
      currentGame.value = SokobanGame
      break
    case 'image':
      currentGame.value = ImageEditor
      break
    case 'video':
      currentGame.value = MusicPlayer
      break
    case 'dyform':
      currentGame.value = DyForm
      break
    case 'fruitgame':
      currentGame.value = FruitCatcher
      break
    case 'battlecity':
      currentGame.value = BattleCityGame
      break
    case 'brickbreaker':
      currentGame.value = BrickBreakerGame
      break
    case 'flappybird':
      currentGame.value = FlappyBirdGame
      break
    case 'spaceshooter':
      currentGame.value = SpaceShooterGame
      break
    case 'snake':
      currentGame.value = SnakeGame
      break
    case 'tetris':
      currentGame.value = TetrisGame
      break
    case 'game2048':
      currentGame.value = Game2048
      break
    case 'minesweeper':
      currentGame.value = MinesweeperGame
      break
    case 'tictactoe':
      currentGame.value = TicTacToeGame
      break
    default:
      currentGame.value = null
  }
}

// 添加历史记录弹窗状态
const showLikeHistory = ref(false)

const currentTime = ref('')
let timer = null

const updateTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
}
const onClickWork=item=>{
  window.open(item.link)
}
onMounted(() => {
  const theme = localStorage.getItem('theme')
  if (theme) {
    isDarkMode.value = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  }

  // 添加点击外部关闭下拉菜单
  document.addEventListener('click', (e) => {
    const dropdowns = document.querySelectorAll('.dropdown, .nav-h-item')
    let clickedInside = false
    dropdowns.forEach(el => {
      if (el.contains(e.target)) {
        clickedInside = true
      }
    })
    
    if (!clickedInside) {
      showThemeDropdown.value = false
      showAuthorDropdown.value = false
      showOnlineWorksDropdown.value = false
      showAiToolsDropdown.value = false
      showLatestProjectsDropdown.value = false
      showAiTutorialsDropdown.value = false
    }
    closeContextMenu()
  })

  // 添加全局右键事件监听
  document.addEventListener('contextmenu', (event) => {
    const toolCard = event.target.closest('.tool-card')
    if (!toolCard && isProd) {
      event.preventDefault()
      window.open('about:blank', '_blank')
    }
  })

  updateTime()
  timer = setInterval(updateTime, 1000)

  // Start periodic sync of navigation cards database
  fetchHomeDatabase()
  homeRefreshInterval = setInterval(fetchHomeDatabase, 60000)
})

let homeRefreshInterval = null
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (homeRefreshInterval) {
    clearInterval(homeRefreshInterval)
  }
})
</script>

<template>
  <div id="app" class="app-container" :class="{ 'dark': isDarkMode }">
    <!-- 左侧导航栏 -->
    <nav class="sidebar" :class="{ 'collapsed': !isSidebarOpen }">
      <div class="logo">HooksVue</div>
      <div class="db-status-bar" v-show="isSidebarOpen">
        <span class="dot" :class="isHomeLive ? 'live' : 'cached'">●</span>
        <span>{{ isHomeLive ? '实时同步中 (60s)' : '静态本地数据' }}</span>
      </div>
      <ul class="nav-list">
        <template v-for="item in menuItems" :key="item.id">
          <li :class="{ 'active': activeItem === item.id && !activeSubItem }"
              @click="selectItem(item.id)">
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
            <span v-if="item.subcategories && item.subcategories.length > 0" class="sub-arrow">
              {{ activeItem === item.id ? '▼' : '▶' }}
            </span>
          </li>
          
          <!-- Collapsible Subcategory Dropdown list -->
          <transition name="collapse">
            <ul v-if="item.subcategories && item.subcategories.length > 0 && activeItem === item.id && isSidebarOpen" class="sub-nav-list">
              <li v-for="sub in item.subcategories" :key="sub.id"
                  :class="{ 'active': activeSubItem === sub.id }"
                  @click.stop="selectSubItem(sub.id)">
                <span class="sub-dot">○</span>
                <span>{{ sub.name }}</span>
              </li>
            </ul>
          </transition>
        </template>
      </ul>
    </nav>

    <!-- 主内容区域 -->
    <main class="main-content" :class="{ 'expanded': !isSidebarOpen }">
      <div class="glow-bg"></div>
      <div class="header-actions">
        <div class="nav-horizontal">
          <!-- 菜单折叠按钮 -->
          <div class="sidebar-toggle-btn" @click="toggleSidebar" title="收起/展开侧边栏">
            ☰
          </div>

          <!-- AI工具集 -->
          <div class="nav-h-item"
               @mouseenter="showAiToolsDropdown = true"
               @mouseleave="showAiToolsDropdown = false">
            <div class="nav-h-link">
              <span class="icon">🤖</span>
              AI工具集
              <span class="arrow">▼</span>
            </div>
            <transition name="fade-slide">
              <div class="nav-h-dropdown grid-dropdown" v-show="showAiToolsDropdown">
                <div v-for="item in aiCategories" :key="item.id" 
                     class="nav-h-dropdown-item" 
                     @click="selectItem(item.id)">
                  <span>{{ item.icon }}</span>
                  <span>{{ item.name }}</span>
                </div>
              </div>
            </transition>
          </div>

          <!-- AI应用集 -->
          <div class="nav-h-link" :class="{ active: isAppStoreActive }" @click="showAppStore" style="cursor: pointer;">
            <span class="icon">🍎</span>
            AI应用集
          </div>

          <!-- 每日AI资讯 -->
          <div class="nav-h-link" :class="{ active: isNewsActive }" @click="showNewsTimeline" style="cursor: pointer;">
            <span class="icon">📈</span>
            每日AI资讯
          </div>

          <!-- 最新AI项目 -->
          <div class="nav-h-item"
               @mouseenter="showLatestProjectsDropdown = true"
               @mouseleave="showLatestProjectsDropdown = false">
            <div class="nav-h-link">
              <span class="icon">🚀</span>
              最新AI项目
              <span class="arrow">▼</span>
            </div>
            <transition name="fade-slide">
              <div class="nav-h-dropdown" v-show="showLatestProjectsDropdown">
                <div class="nav-h-dropdown-item" @click="selectItem(6)">
                  💻 AI编程工具
                </div>
                <div class="nav-h-dropdown-item" @click="selectItem(10)">
                  🛠️ AI开发平台
                </div>
              </div>
            </transition>
          </div>

          <!-- AI教程资源 -->
          <div class="nav-h-item"
               @mouseenter="showAiTutorialsDropdown = true"
               @mouseleave="showAiTutorialsDropdown = false">
            <div class="nav-h-link" :class="{ active: isArticlesListActive }">
              <span class="icon">📚</span>
              AI教程资源
              <span class="arrow">▼</span>
            </div>
            <transition name="fade-slide">
              <div class="nav-h-dropdown" v-show="showAiTutorialsDropdown">
                <a href="https://ai-bot.cn/ai-tutorials/" target="_blank" class="nav-h-dropdown-item">📖 AI教程专栏</a>
                <a href="https://ai-bot.cn/ai-encyclopedia/" target="_blank" class="nav-h-dropdown-item">📖 AI百科大全</a>
              </div>
            </transition>
          </div>

          <!-- 关于我们 -->
          <div class="nav-h-link" @click="showAboutDialog = true">
            <span class="icon">👥</span>
            关于我们
          </div>
        </div>

        <div class="header-right-actions">
          <AnalogClock class="clock-component" />
          <a href="mailto:869710179@qq.com" class="email-icon" title="联系我" style="font-size: 20px; display: inline-flex; align-items: center;">
            📧
          </a>

          <button class="dropdown-trigger like-history-btn" @click="openLikeHistory">
            ❤️ 历史爱心
          </button>

          <!-- 打开右侧抽屉按钮 -->
          <button class="dropdown-trigger drawer-trigger-btn" @click="showDrawer = true" style="background: var(--primary-color); color: white; border-color: var(--primary-color); font-weight: bold;">
            💼 控制中心
          </button>
        </div>
      </div>
      <div v-if="isArticlesListActive" class="api-toolbox-view-wrapper">
        <AiArticlesList :type="articlesListType" />
      </div>
      <div v-else-if="isAppStoreActive" class="api-toolbox-view-wrapper">
        <AiAppStore />
      </div>
      <div v-else-if="isNewsActive" class="api-toolbox-view-wrapper">
        <AiNewsTimeline />
      </div>
      <div v-else-if="activeItem === 24" class="api-toolbox-view-wrapper">
        <ApiToolbox />
      </div>
      <template v-else>
        <div class="search-wrapper">
          <input
            type="text"
            v-model="searchQuery"
            @keyup.enter="saveSearchQuery(searchQuery)"
            placeholder="输入关键词并按回车全局搜索..."
            class="search-input"
          >
          <button
            v-show="searchQuery"
            @click="clearSearch"
            class="clear-button"
            title="清除搜索"
          >
            ✕
          </button>

          <!-- 历史搜索记录 -->
          <div v-if="searchHistory.length > 0 && !searchQuery" class="search-history">
            <span class="history-title">历史搜索:</span>
            <div class="history-tags">
              <span v-for="tag in searchHistory" :key="tag" class="history-tag" @click="useHistoryTag(tag)">
                {{ tag }}
              </span>
              <span class="clear-history-btn" @click="clearHistory">清空</span>
            </div>
          </div>
        </div>
        <!-- 布局网络列选择器与当前分类指示 -->
        <div class="grid-controls-row">
          <span class="active-category-indicator">
            📂 当前分类: {{ getActiveCategoryName() }}
          </span>
          <div class="column-switcher">
            <span class="switcher-label">🖥️ 视图布局:</span>
            <button 
              v-for="cols in [1, 2, 3, 4, 5]" 
              :key="cols"
              class="switcher-btn"
              :class="{ active: gridCols === cols }"
              @click="setGridCols(cols)"
            >
              {{ cols }}列
            </button>
          </div>
        </div>

        <div :class="['tools-grid', `cols-${gridCols}`]">
          <!-- 工具卡片列表 -->
          <template v-if="filteredTools.length > 0">
            <div v-for="(tool, index) in filteredTools" :key="tool.id" class="tool-wrapper">
              <div class="tool-card"
                  :title="`${tool.name} - ${tool.desc}`"

                  @contextmenu="(event) => handleRightClick(event, tool)">
                <div class="tool-header" @click="() => { openLink(tool.link); saveSearchQuery(searchQuery); }">
                  <span class="tool-icon">
                    <img v-if="isUrl(tool.icon)" :src="tool.icon" class="tool-icon-img" alt="icon">
                    <span v-else>{{ tool.icon }}</span>
                  </span>
                  <h3 class="tool-name">{{ tool.name }}</h3>
                  <!-- 爱心图标 -->

                </div>
                <div
                    :class="['heart-icon', `heart-icon-${tool.id}`, { 'liked': isLiked(tool.id) }]"
                    @click.stop="toggleLike(tool.id)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </div>
                <div class="tool-info">
                  <p>{{ tool.desc }}</p>
                  <div v-if="tool.needVPN" class="vpn-tag">需要VPN</div>
                  <div v-if="searchQuery" class="search-category-tag" style="margin-top: 4px; font-size: 10px; color: var(--primary-color); font-weight: bold;">
                    来自: {{ tool.categoryIcon }} {{ tool.categoryName }}
                  </div>
                </div>
                <div class="tool-link" :title="'点击跳转: ' + tool.link" @click="openLink(tool.link)">
                  <span class="link-icon">🔗</span>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="no-results">
              <span>🔍</span>
              <p>暂无搜索结果</p>
              <p>试试其他关键词吧</p>
            </div>
          </template>
        </div>
      </template>
    </main>
    <!-- 自定义右键菜单 -->
    <div v-if="contextMenu.show"
         class="context-menu"
         :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      <div class="context-menu-item" @click="openInNewTab">
        <span class="context-menu-icon">🔗</span>
        新标签页打开
      </div>
      <div class="context-menu-item" @click="copyLink">
        <span class="context-menu-icon">📋</span>
        复制链接
      </div>
    </div>

    <!-- 游戏对话框 -->
    <el-dialog
      v-model="showGameDialog"
      :title="gameTitle"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="handleCloseDialog"
      destroy-on-close
      class="game-dialog"
    >
      <component :is="currentGame" v-if="currentGame" @close="showGameDialog = false" />
    </el-dialog>
    <!-- 关于我们对话框 -->
    <el-dialog
      v-model="showAboutDialog"
      title="关于我们"
      width="40%"
      destroy-on-close
      class="about-dialog"
    >
      <div class="about-content" style="padding: 20px; line-height: 1.6;">
        <h3 style="margin-bottom: 12px; color: var(--primary-color);">HooksVue AI 导航工具箱</h3>
        <p style="margin-bottom: 10px;">本项目参考了优秀的 AI 导航网站设计，为您汇集了国内外高水平的 AI 智能体、开发平台、模型底座及前端开发和游戏开发技术栈工具。</p>
        <p style="margin-bottom: 10px;">所有工具均经过精心挑选与归类，旨在帮助开发者、科研工作者及 AI 爱好者极速检索并直达相关优质服务。</p>
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-secondary);">
          <p>版本: v2.0.0</p>
          <p>作者: HooksVue & Gemini Assistant</p>
        </div>
      </div>
    </el-dialog>

    <!-- 邮箱图标 -->
    <a href="mailto:869710179@qq.com" class="floating-email-icon" title="联系我">
      <i class="el-icon-message"></i>
      📧
    </a>
    <!-- 历史爱心记录弹窗 -->
    <el-dialog
      v-model="showLikeHistory"
      :title="`历史爱心记录(${likedToolsList.length})`"
      width="60%"
      destroy-on-close
      class="like-history-dialog"
    >

      <div class="like-history-header">
        <div class="like-history-title">历史记录</div>
        
        <!-- Column switcher inside dialog -->
        <div class="column-switcher" style="margin-left: auto; margin-right: 16px;">
          <span class="switcher-label">🖥️ 视图布局:</span>
          <button 
            v-for="cols in [1, 2, 3, 4, 5]" 
            :key="cols"
            class="switcher-btn"
            :class="{ active: gridCols === cols }"
            @click="setGridCols(cols)"
          >
            {{ cols }}列
          </button>
        </div>

        <button
          v-if="likedToolsList.length > 0"
          class="clear-all-btn"
          @click="clearAllLikes"
          title="清空所有点赞"
        >
          🗑️ 清空记录
        </button>
      </div>
      <div :class="['liked-tools-list', `cols-${gridCols}`, { 'scrollable': likedToolsList.length > 10 }]">
        <div v-if="likedToolsList.length === 0" class="no-likes">
          <p>还没有点赞过任何工具哦~ 💝</p>
        </div>
        <div v-else v-for="tool in likedToolsList" :key="tool.id" class="liked-tool-item">
          <div class="liked-tool-info" @click="openLink(tool.link)">
            <span class="tool-icon">
              <img v-if="isUrl(tool.icon)" :src="tool.icon" class="tool-icon-img" alt="icon">
              <span v-else>{{ tool.icon }}</span>
            </span>
            <div class="tool-details">
              <h4>{{ tool.name }}</h4>
              <p>
                <span class="menu-info">{{ tool.menuInfo.menuIcon }} {{ tool.menuInfo.menuName }}</span>
                {{ tool.desc }}
              </p>
            </div>
          </div>
          <div class="liked-tool-actions">

            <button class="link-btn" @click="openLink(tool.link)" :title="`访问链接${tool.link}`">
              🔗
            </button>
            <button
              class="unlike-btn"
              @click="toggleLike(tool.id)"
              title="取消点赞"
            >
              ❤️
            </button>
            <span class="menu-info menu-menuName">来自{{ tool.menuInfo?.menuName}}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 右侧抽屉 (Drawer) -->
    <el-drawer
      v-model="showDrawer"
      title="💼 控制中心 & 个人作品集"
      direction="rtl"
      size="380px"
    >
      <div class="drawer-content">
        <!-- Section 1: 作者作品集 -->
        <div class="drawer-section">
          <h3 class="section-title collapsible-title" @click="isAuthorWorksExpanded = !isAuthorWorksExpanded">
            <span>👨‍💻 作者作品集</span>
            <span class="collapse-arrow">{{ isAuthorWorksExpanded ? '▼' : '▶' }}</span>
          </h3>
          <transition name="collapse">
            <div class="drawer-list-container" v-show="isAuthorWorksExpanded">
              <div class="drawer-list">
                <div v-for="work in authorWorks" 
                     :key="work.name" 
                     class="drawer-list-item" 
                     @click="() => { showDrawer = false; onClickWork(work); }">
                  <div class="work-name">{{ work.name }}</div>
                  <div class="work-desc">{{ work.desc }}</div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Section 2: 在线作品查看 -->
        <div class="drawer-section">
          <h3 class="section-title collapsible-title" @click="isOnlineWorksExpanded = !isOnlineWorksExpanded">
            <span>🎨 在线作品查看</span>
            <span class="collapse-arrow">{{ isOnlineWorksExpanded ? '▼' : '▶' }}</span>
          </h3>
          <transition name="collapse">
            <div class="drawer-list-container" v-show="isOnlineWorksExpanded">
              <div class="drawer-list">
                <a v-for="work in onlineWorks"
                   :key="work.name"
                   :href="work.component === 'dialog' ? '#' : work.link"
                   @click.prevent="() => { showDrawer = false; work.component === 'dialog' ? openGame(work) : openLink(work.link); }"
                   target="_blank"
                   class="drawer-list-item">
                  <div class="work-name">{{ work.name }}</div>
                  <div class="work-desc">{{ work.desc }}</div>
                </a>
              </div>
            </div>
          </transition>
        </div>
        
        <!-- Section 3: 系统设置 -->
        <div class="drawer-section">
          <h3 class="section-title">⚙️ 系统设置</h3>
          <div class="settings-list">
            <div class="setting-item">
              <span>深色模式</span>
              <el-switch
                v-model="isDarkMode"
                inline-prompt
                active-text="开"
                inactive-text="关"
                @change="toggleTheme"
              />
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
@keyframes jelly {
  0% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(0.95); }
  75% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.jelly {
  animation: jelly 0.6s ease;
}

.clock-component {
  margin-right: 5px;
}

:deep(.custom-message-box) {
  .el-message-box__message {
    & p {
      line-height: 1.8;
      font-size: 14px;
    }
  }
}

.el-dialog {
  display: flex;
  flex-direction: column;
}

.el-dialog__body {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

/* 游戏对话框特殊样式 */
:deep(.el-dialog.game-dialog) {
  min-height: 600px;
}

:deep(.el-dialog.game-dialog .el-dialog__body) {
  height: calc(100% - 54px);
  padding: 0;
}
</style>
