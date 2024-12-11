<script setup>
import { ref, onMounted, computed } from 'vue'
import{menuItemsList} from '@/utlis/menuItems'
const menuItems = ref(menuItemsList)

const activeItem = ref(1)
const isSidebarOpen = ref(false)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const showThemeDropdown = ref(false)
const showAuthorDropdown = ref(false)
const authorWorks = ref([
  { 
    name: '群团集市', 
    link: 'https://m.hzszqt.com/#/',
    desc: '(请在微信中打开)'
  },
  { 
    name: '就业码学生端', 
    link: 'https://em-h5.redcross668.com/#/',
    desc: '(请在微信中打开)'
  },
  { 
    name: '就业码企业端', 
    link: 'https://em-h5-company.redcross668.com/#/',
    desc: '(请在微信中打开)'
  },
  { 
    name: '生命教育', 
    link: '#',
    desc: '(请在微信小程序中搜索)'
  },
  { 
    name: '浙里博爱', 
    link: 'https://zlba.shaoxingredcross.org.cn/#/login',
    desc: '(请在微信中打开)或在浙里办中搜索访问'
  },
  { 
    name: '200s\'s 个人博客', 
    link: 'https://mhxy13867806343.github.io/vuepressBlogDemo/',
    desc: 'VuePress 博客'
  },
  { 
    name: 'GitHub', 
    link: 'https://github.com/mhxy13867806343',
    desc: '开源代码仓库'
  },
  { 
    name: '掘金主页', 
    link: 'https://juejin.cn/user/1310273588955581',
    desc: '技术文章分享'
  }
])

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

const handleRightClick = (event) => {
  event.preventDefault();
  window.open('about:blank', '_blank');
}

const toggleAuthorDropdown = () => {
  showAuthorDropdown.value = !showAuthorDropdown.value
  showThemeDropdown.value = false
}

const toggleThemeDropdown = () => {
  showThemeDropdown.value = !showThemeDropdown.value
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

    if (!themeDropdownEl?.contains(e.target)) {
      showThemeDropdown.value = false
    }
    if (!authorDropdownEl?.contains(e.target)) {
      showAuthorDropdown.value = false
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
          <div class="dropdown-menu" v-show="showAuthorDropdown">
            <div class="dropdown-item dropdown-item-left-01" v-for="work in authorWorks" :key="work.name" @click="openLink(work.link)">
              <div class="word-name">
                {{ work.name }}
              </div>
              <span class="work-desc">{{ work.desc }}</span>
            </div>
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
                @click="openLink(tool.link)">
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
        <div v-else class="no-results">
          <span>暂无搜索结果</span>
          <p>试试其他关键词吧</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>

@import url('@/style/style.css');
</style>
