<script setup>
import { ref, onMounted, computed, shallowRef } from 'vue'
import{menuItemsList,authorWorksList,onlineWorksList} from '@/utlis/menuItems'
import { ElDialog, ElMessageBox } from 'element-plus'
import SokobanGame from './components/games/SokobanGame.vue'
import ImageEditor from './components/image/ImageEditor.vue'

const menuItems = ref(menuItemsList)

// 从本地存储初始化激活的菜单项
const activeItem = ref(parseInt(localStorage.getItem('activeItem')) || 1)
const isSidebarOpen = ref(false)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const showThemeDropdown = ref(false)
const showAuthorDropdown = ref(false)
const showOnlineWorksDropdown = ref(false)
const authorWorks = ref(authorWorksList)
const onlineWorks = ref(onlineWorksList)

// 从本地存储初始化点赞集合
const likedItems = ref(new Set(JSON.parse(localStorage.getItem('likedItems') || '[]')))
const isLikedValue = ref(false)

const toggleLike = (itemId) => {
  if (likedItems.value.has(itemId)) {
    likedItems.value.delete(itemId)
  } else {
    likedItems.value.add(itemId)
  }
  
  // 保存到本地存储
  localStorage.setItem('likedItems', JSON.stringify(Array.from(likedItems.value)))

  // 添加果冻动画效果
  const heart = document.querySelector(`.heart-icon-${itemId}`)
  heart.classList.add('jelly')
  setTimeout(() => {
    heart.classList.remove('jelly')
  }, 600)
}

// 检查是否已点赞
const isLiked = (itemId) => {
  return likedItems.value.has(itemId)
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const selectItem = (itemId) => {
  activeItem.value = itemId
  // 保存选中状态到本地存储
  localStorage.setItem('activeItem', itemId.toString())
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
  if (work.component === 'dialog') {
    gameTitle.value = work.name
    // 根据游戏名称加载对应组件
    switch (work.name) {
      case '推箱子游戏':
        currentGame.value = SokobanGame
        break
      case '图片处理工具':
        currentGame.value = ImageEditor
        break
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
                
                @contextmenu="(event) => handleRightClick(event, tool)">
              <div class="tool-header" @click="openLink(tool.link)">
                <span class="tool-icon" >{{ tool.icon }}</span>
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
    <!-- 邮箱图标 -->
    <a href="mailto:869710179@qq.com" class="email-icon" title="联系我">
      <i class="el-icon-message"></i>
      📧
    </a>
  </div>
</template>

<style scoped>
@import url('@/style/style.css');

.heart-icon {
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
  transition: transform 0.3s ease, color 0.3s ease;
  color: #999;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

.heart-icon.liked {
  color: #ff4757;
  opacity: 1;
}

.heart-icon.liked svg {
  fill: currentColor;
}

.heart-icon:hover {
  transform: scale(1.1);
  opacity: 1;
}

.tool-header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px;
}

.heart-icon {
  position: absolute;
  right: 10px;
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.3s ease, color 0.3s ease;
  color: #999;
  opacity: 0.6;
}

.heart-icon.liked {
  color: #ff4757;
  opacity: 1;
}

.heart-icon:hover {
  transform: scale(1.1);
  opacity: 1;
}

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
</style>
