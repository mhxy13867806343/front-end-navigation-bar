<script setup>
import { ref, onMounted, computed, shallowRef } from 'vue'
import{menuItemsList,authorWorksList,onlineWorksList} from '@/utlis/menuItems'
import { ElDialog, ElMessageBox } from 'element-plus'
import SokobanGame from './components/games/SokobanGame.vue'

const menuItems = ref(menuItemsList)

const activeItem = ref(1)
const isSidebarOpen = ref(false)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const showThemeDropdown = ref(false)
const showAuthorDropdown = ref(false)
const showOnlineWorksDropdown = ref(false)
const authorWorks = ref(authorWorksList)
const onlineWorks = ref(onlineWorksList)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const selectItem = (itemId) => {
  activeItem.value = itemId
}

const getCurrentTools = () => {
  const item = menuItems.value.find(item => item.id === activeItem.value)
  return item ? item.tools : []
}

const openLink = (link) => {
  if (link) {
    window.open(link, '_blank')
  }
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
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
}

const toggleThemeDropdown = () => {
  showThemeDropdown.value = !showThemeDropdown.value
  showAuthorDropdown.value = false
  showOnlineWorksDropdown.value = false
}

const toggleOnlineWorksDropdown = () => {
  showOnlineWorksDropdown.value = !showOnlineWorksDropdown.value
  showThemeDropdown.value = false
  showAuthorDropdown.value = false
}

const searchQuery = ref('')
const clearSearch = () => {
  searchQuery.value = ''
}
const filteredTools = computed(() => {
  if (!searchQuery.value) return getCurrentTools()
  const query = searchQuery.value.toLowerCase()
  return getCurrentTools().filter(tool => 
    tool.name.toLowerCase().includes(query) || 
    tool.desc.toLowerCase().includes(query)
  )
})

// 判断是否为生产环境
const isProd = process.env.NODE_ENV === 'production'

// 游戏对话框相关
const showGameDialog = ref(false)
const currentGame = shallowRef(null)
const gameTitle = ref('')

const handleCloseDialog = (done) => {
  ElMessageBox.confirm('确定要退出游戏吗？')
    .then(() => {
      done()
    })
    .catch(() => {})
}

const openGame = (work) => {
  if (work.component === 'dialog') {
    gameTitle.value = work.name
    // 根据游戏名称加载对应组件
    switch (work.name) {
      case '推箱子游戏':
        currentGame.value = SokobanGame
        break
      // 可以添加更多游戏
      default:
        currentGame.value = null
    }
    showGameDialog.value = true
  }
}

onMounted(() => {
  const theme = localStorage.getItem('theme')
  if (theme) {
    isDarkMode.value = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  }

  // 添加点击外部关闭下拉菜单
  document.addEventListener('click', (e) => {
    const themeDropdownEl = document.querySelector('.dropdown')
    const authorDropdownEl = document.querySelectorAll('.dropdown')[1]
    const onlineWorksDropdownEl = document.querySelectorAll('.dropdown')[2]

    if (!themeDropdownEl?.contains(e.target)) {
      showThemeDropdown.value = false
    }
    if (!authorDropdownEl?.contains(e.target)) {
      showAuthorDropdown.value = false
    }
    if (!onlineWorksDropdownEl?.contains(e.target)) {
      showOnlineWorksDropdown.value = false
    }
    closeContextMenu()
  })

  // 添加全局右键事件监听
  document.addEventListener('contextmenu', (event) => {
    const toolCard = event.target.closest('.tool-card')
    if (!toolCard && isProd) {  // 只在生产环境下跳转空白页
      event.preventDefault()
      window.open('about:blank', '_blank')
    }
  })
})
</script>

<template>
  <div id="app" class="app-container" :class="{ 'dark': isDarkMode }">
    <!-- 左侧导航栏 -->
    <nav class="sidebar">
      <div class="logo">HooksVue</div>
      <ul class="nav-list">
        <li v-for="item in menuItems" :key="item.id" 
            :class="{ 'active': activeItem === item.id }"
            @click="selectItem(item.id)">
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </li>
      </ul>
    </nav>

    <!-- 主内容区域 -->
    <main class="main-content">
     
      <div class="header-actions">
        <div class="dropdown" ref="themeDropdown">
          <button class="dropdown-trigger" @click="toggleThemeDropdown">
            {{ !isDarkMode ? '☀️' : '🌙' }} 主题
            <span class="arrow">▼</span>
          </button>
          <div class="dropdown-menu" v-show="showThemeDropdown">
            <div class="dropdown-item" @click="() => { isDarkMode = false; toggleTheme() }">
              🌙 深色模式
            </div>
            <div class="dropdown-item" @click="() => { isDarkMode = true; toggleTheme() }">
              
              ☀️ 浅色模式
            </div>
          </div>
        </div>

        <div class="dropdown" ref="authorDropdown">
          <button class="dropdown-trigger" @click="toggleAuthorDropdown">
            👨‍💻 作者作品集
            <span class="arrow">▼</span>
          </button>
          <div v-if="showAuthorDropdown" class="dropdown-menu">
            <div v-for="work in authorWorks" :key="work.name" class="dropdown-item">
              <div class="dropdown-item-left-01">
                <div class="word-name">{{ work.name }}</div>
                <div class="work-desc">{{ work.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="dropdown" ref="onlineWorksDropdown">
          <button class="dropdown-trigger" @click="toggleOnlineWorksDropdown">
            🎨 在线作品查看
            <span class="arrow">▼</span>
          </button>
          <div v-if="showOnlineWorksDropdown" class="dropdown-menu">
            <a v-for="work in onlineWorks" 
               :key="work.name" 
               :href="work.component === 'dialog' ? '#' : work.link"
               @click.prevent="work.component === 'dialog' && openGame(work)"
               target="_blank"
               class="dropdown-item">
              <div class="dropdown-item-left-01">
                <div class="word-name">{{ work.name }}</div>
                <div class="work-desc">{{ work.desc }}</div>
              </div>
            </a>
          </div>
        </div>
        
      </div>
      <div class="search-wrapper">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="搜索工具..."
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
        </div>
      <div class="tools-grid">
        <!-- 搜索框 -->
    
        
        <!-- 工具卡片列表 -->
        <template v-if="filteredTools.length > 0">
          <div v-for="(tool, index) in filteredTools" :key="tool.id" class="tool-wrapper">
            <div class="tool-card" 
                :title="`${tool.name} - ${tool.desc}`" 
                @click="openLink(tool.link)"
                @contextmenu="(event) => handleRightClick(event, tool)">
              <div class="tool-icon">{{ tool.icon || tool.logo }}</div>
              <div class="tool-info">
                <h3>{{ tool.name }}</h3>
                <p>{{ tool.desc }}</p>
                <div v-if="tool.needVPN" class="vpn-tag">需要VPN</div>
              </div>
              <div class="tool-link" :title="'点击跳转: ' + tool.link">
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
    >
      <component :is="currentGame" v-if="currentGame" />
    </el-dialog>
  </div>
</template>

<style scoped>

@import url('@/style/style.css');
</style>
