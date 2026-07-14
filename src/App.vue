<script setup>
import { useAppLogic } from './App.js'

// Import components used directly in the template
import AnalogClock from './components/AnalogClock.vue'
import AiArticlesList from './components/AiArticlesList.vue'
import AiAppStore from './components/AiAppStore.vue'
import AiNewsTimeline from './components/AiNewsTimeline.vue'
import ApiToolbox from './components/ApiToolbox.vue'
import ComponentShowcase from './components/ComponentShowcase.vue'
import RefreshCountdownButton from './components/RefreshCountdownButton.vue'

const {
  isProd,
  menuItems, isHomeLive, isHomeLoading, fetchHomeDatabase,
  isDarkMode, showThemeDropdown, toggleTheme, toggleThemeDropdown,
  likedItemsInfo, showLikeHistory, openLikeHistory, isLiked, toggleLike, likedToolsList, clearAllLikes,
  activeItem, isSidebarOpen, activeSubTabs,
  showAuthorDropdown, showOnlineWorksDropdown,
  authorWorks, onlineWorks, showDrawer, isAuthorWorksExpanded, isOnlineWorksExpanded,
  isNewsActive, isAppStoreActive, isArticlesListActive, articlesListType,
  gridCols, setGridCols, dialogGridCols, getActiveCategoryName,
  showNewsTimeline, showAppStore, showArticlesList, showAboutDialog, toggleSidebar,
  aiCategories, isUrl, selectItem, activeSubItem, selectSubItem, getCurrentTools, openLink,
  contextMenu, handleRightClick, closeContextMenu, copyLink, openInNewTab,
  toggleAuthorDropdown, toggleOnlineWorksDropdown, showAiToolsDropdown, showLatestProjectsDropdown, showAiTutorialsDropdown,
  toggleAiToolsDropdown, toggleLatestProjectsDropdown, toggleAiTutorialsDropdown,
  isListening, startVoiceSearch, searchQuery, searchHistory, searchCategories, activeSearchCat, activeEngineId, selectSearchCategory,
  activeCategory, activeEngine, clearSearch, saveSearchQuery, triggerSearch, useHistoryTag, clearHistory, filteredTools,
  showGameDialog, currentGame, gameTitle, handleCloseDialog, openGame,
  currentTime, currentDate, userOS, userTimezone, userLanguage, detectSystemInfo, updateTime,
  randomTools, refreshRandomTools, onClickWork,
  showBingDialog, isBingLoading, bingWallpaperForm, bingPreviewUrl, customBackgroundUrl, hasCustomBg,
  updateBingPreview, applyCustomBackground, clearCustomBackground,
  showWeatherDialog, weatherSearchKeyword, weatherDistrictList, selectedAdcode, currentWeather, forecastList, isWeatherLoading,
  searchWeatherDistrict, queryWeatherByAdcode, loadWeatherByIp, getCityInfoByName,
  
  // 智能实用工具箱 exports
  showUtilityDialog, utilityActiveTab,
  holidayQueryDate, holidayData, isHolidayLoading, queryHolidayCalendar,
  programmerHistory, isProgrammerLoading, queryProgrammerToday,
  hotboardType, hotboardData, isHotboardLoading, hotboardPlatforms, queryHotboard,
  movieBoxOffice, isMovieBoxLoading, queryMovieBoxOffice,
  movieRatings, movieRatingsChannel, movieRatingsPeriod, isMovieRatingsLoading, queryMovieRatings,
  trackingNumber, trackingCarrier, trackingPhone, trackingCarrierName, trackingInfo, isTrackingLoading, queryCourier,
  randomImageCategory, randomImageUrl, isRandomImageLoading, queryRandomImage,
  
  // Video & Photo Explorer exports
  showVideoDialog, videoActiveChannel, isVideoLoading, currentVideoUrl, currentPhotoUrl, isPhotoLoading, queryNextVideo, queryNextPhoto,
  
  // Dujitang exports
  dujitangText, isDujitangLoading, queryDujitang
} = useAppLogic()

import { watch, nextTick, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import chinaCitiesAz from './utils/china-cities-az.json'
import chinaCascaderOptions from './utils/china-cascader-options.json'

const route = useRoute()
const router = useRouter()
const routeViewPaths = ['/flash', '/aicoding']
const isFlashRoute = computed(() => routeViewPaths.includes(route.path))
const goFlash = () => router.push('/flash')
const goAiCoding = () => router.push('/aicoding')
const backFromFlash = () => router.push('/')

const refreshWeather = async () => {
  if (selectedAdcode.value) {
    await queryWeatherByAdcode(selectedAdcode.value)
  } else {
    await loadWeatherByIp()
  }
}

const refreshUtility = async () => {
  switch (utilityActiveTab.value) {
    case 'holiday':
      await queryHolidayCalendar()
      break
    case 'programmer':
      await queryProgrammerToday()
      break
    case 'hotboard':
      await queryHotboard()
      break
    case 'movies':
      await Promise.all([queryMovieBoxOffice(), queryMovieRatings()])
      break
    case 'courier':
      if (trackingNumber.value) await queryCourier()
      break
    case 'image':
      await queryRandomImage()
      break
  }
}

let weatherChartInstance = null
const showCityPicker = ref(true)
const cascaderValue = ref([])
const activeLetter = ref('A')

const isCitySelected = (city) => {
  if (!currentWeather.value) return false
  const activeCity = currentWeather.value.city || ''
  return activeCity.includes(city.name) || city.name.includes(activeCity)
}

watch(() => currentWeather.value, (newWeather) => {
  if (newWeather && newWeather.city) {
    const cityName = newWeather.city
    for (const letter in chinaCitiesAz) {
      const found = chinaCitiesAz[letter].find(c => cityName.includes(c.name) || c.name.includes(cityName))
      if (found) {
        activeLetter.value = found.letter
        break
      }
    }
  }
}, { immediate: true, deep: true })
const getWeatherEmoji = (code) => {
  const iconCode = String(code || '')
  if (iconCode.startsWith('100')) return '☀️'
  if (iconCode.startsWith('101') || iconCode.startsWith('102') || iconCode.startsWith('103') || iconCode.startsWith('151') || iconCode.startsWith('152') || iconCode.startsWith('153')) return '☁️'
  if (iconCode.startsWith('104')) return '☁️'
  if (iconCode.startsWith('300') || iconCode.startsWith('301')) return '🌧️'
  if (iconCode.startsWith('302') || iconCode.startsWith('303') || iconCode.startsWith('304')) return '⛈️'
  if (iconCode.startsWith('305') || iconCode.startsWith('306') || iconCode.startsWith('307') || iconCode.startsWith('308') || iconCode.startsWith('309') || iconCode.startsWith('310') || iconCode.startsWith('311') || iconCode.startsWith('312')) return '🌧️'
  if (iconCode.startsWith('400') || iconCode.startsWith('401') || iconCode.startsWith('402') || iconCode.startsWith('403') || iconCode.startsWith('404')) return '❄️'
  if (iconCode.startsWith('500') || iconCode.startsWith('501') || iconCode.startsWith('502') || iconCode.startsWith('503') || iconCode.startsWith('504') || iconCode.startsWith('507') || iconCode.startsWith('508') || iconCode.startsWith('509') || iconCode.startsWith('510') || iconCode.startsWith('511') || iconCode.startsWith('512') || iconCode.startsWith('513') || iconCode.startsWith('514') || iconCode.startsWith('515')) return '🌫️'
  return '🌤️'
}

const findCascaderPath = (targetAdcode) => {
  const path = []
  const search = (nodes, currentPath) => {
    for (const node of nodes) {
      const newPath = [...currentPath, node.value]
      if (node.value === targetAdcode) {
        path.push(...newPath)
        return true
      }
      if (node.children && node.children.length > 0) {
        if (search(node.children, newPath)) return true
      }
    }
    return false
  }
  search(chinaCascaderOptions, [])
  return path
}

const handleCascaderChange = async (val) => {
  if (!val || val.length === 0) return
  const targetAdcode = val[val.length - 1]
  const pathNodes = []
  const findNodes = (nodes, idx) => {
    if (idx >= val.length) return
    const found = nodes.find(n => n.value === val[idx])
    if (found) {
      pathNodes.push(found.label)
      if (found.children) findNodes(found.children, idx + 1)
    }
  }
  findNodes(chinaCascaderOptions, 0)
  if (pathNodes.length > 0) {
    weatherSearchKeyword.value = pathNodes[pathNodes.length - 1]
  }
  await queryWeatherByAdcode(targetAdcode)
}

const selectCityFromPicker = async (city) => {
  weatherSearchKeyword.value = city.name
  const path = findCascaderPath(city.adcode)
  if (path.length > 0) {
    cascaderValue.value = path
  }
  await queryWeatherByAdcode(city.adcode)
}

const renderWeatherChart = () => {
  nextTick(() => {
    const chartDom = document.getElementById('weather-echarts-container')
    if (!chartDom) return

    if (weatherChartInstance) {
      weatherChartInstance.dispose()
    }

    weatherChartInstance = echarts.init(chartDom, isDarkMode.value ? 'dark' : null, {
      renderer: 'canvas'
    })

    const list = forecastList.value && forecastList.value.length > 0 ? forecastList.value : [
      { date: '今天', temp_high: 32, temp_low: 25, weather: '晴' },
      { date: '明天', temp_high: 33, temp_low: 26, weather: '多云' },
      { date: '后天', temp_high: 34, temp_low: 25, weather: '雷阵雨' },
      { date: '周四', temp_high: 32, temp_low: 24, weather: '阴' },
      { date: '周五', temp_high: 31, temp_low: 23, weather: '小雨' },
      { date: '周六', temp_high: 33, temp_low: 24, weather: '多云' },
      { date: '周日', temp_high: 34, temp_low: 25, weather: '晴' }
    ]

    const dates = list.map(item => item.week || item.date || item.day || '')
    const highs = list.map(item => parseInt(item.temp_high || item.high || 0, 10))
    const lows = list.map(item => parseInt(item.temp_low || item.low || 0, 10))
    const weathers = list.map(item => item.weather_day || item.weather || '')

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let res = params[0].name + '<br/>'
          params.forEach((item) => {
            res += item.marker + item.seriesName + ': ' + item.value + '°C (' + weathers[item.dataIndex] + ')<br/>'
          })
          return res
        }
      },
      legend: {
        data: ['最高气温', '最低气温'],
        textStyle: {
          color: isDarkMode.value ? '#ffffff' : '#333333'
        }
      },
      grid: {
        left: '4%',
        right: '4%',
        bottom: '8%',
        top: '18%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: {
          color: isDarkMode.value ? '#a4a4a4' : '#666666'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} °C',
          color: isDarkMode.value ? '#a4a4a4' : '#666666'
        },
        splitLine: {
          lineStyle: {
            color: isDarkMode.value ? '#3e3e3e' : '#e0e0e0'
          }
        }
      },
      series: [
        {
          name: '最高气温',
          type: 'line',
          data: highs,
          smooth: true,
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: '#ff4757'
          },
          itemStyle: {
            color: '#ff4757'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 71, 87, 0.2)' },
              { offset: 1, color: 'rgba(255, 71, 87, 0)' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            color: isDarkMode.value ? '#ffffff' : '#333333'
          }
        },
        {
          name: '最低气温',
          type: 'line',
          data: lows,
          smooth: true,
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: '#5961f9'
          },
          itemStyle: {
            color: '#5961f9'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(89, 97, 249, 0.2)' },
              { offset: 1, color: 'rgba(89, 97, 249, 0)' }
            ])
          },
          label: {
            show: true,
            position: 'bottom',
            color: isDarkMode.value ? '#ffffff' : '#333333'
          }
        }
      ]
    }

    weatherChartInstance.setOption(option)
  })
}

const initWeatherView = async () => {
  showCityPicker.value = true
  await loadWeatherByIp()
  if (selectedAdcode.value) {
    const path = findCascaderPath(selectedAdcode.value)
    if (path.length > 0) {
      cascaderValue.value = path
    }
  }
  renderWeatherChart()
}

watch(selectedAdcode, (newVal) => {
  if (newVal) {
    const path = findCascaderPath(newVal)
    if (path.length > 0) {
      cascaderValue.value = path
    }
  }
})

watch(forecastList, () => {
  renderWeatherChart()
})

watch(isDarkMode, () => {
  if (showWeatherDialog.value) {
    renderWeatherChart()
  }
})
</script>

<template>
  <div 
    id="app" 
    class="app-container" 
    :class="{ 'dark': isDarkMode, 'has-custom-bg': hasCustomBg }"
    :style="hasCustomBg ? { backgroundImage: `url(${customBackgroundUrl})` } : {}"
  >
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
      <div class="sidebar-footers">
        <div class="sidebar-footer" @click="goFlash" title="闪存">
          <span class="nav-icon">⚡</span>
          <span v-show="isSidebarOpen">闪存</span>
        </div>
        <div class="sidebar-footer" @click="goAiCoding" title="AI编程资讯">
          <span class="nav-icon">🤖</span>
          <span v-show="isSidebarOpen">AI编程资讯</span>
        </div>
        <el-popover
          placement="top-start"
          :width="160"
          trigger="click"
          popper-class="sidebar-upward-popover"
        >
          <template #reference>
            <div class="sidebar-footer" title="实用工具箱">
              <span class="nav-icon">🧰</span>
              <span v-show="isSidebarOpen">实用工具箱</span>
            </div>
          </template>
          
          <div class="popover-tool-menu">
            <div class="popover-tool-item" @click="showVideoDialog = true">
              <span class="tool-icon">🎬</span>
              <span>视频网站</span>
              <span style="margin-left: auto; font-size: 10px; color: var(--text-secondary);">▶</span>
            </div>
            <div class="popover-tool-item" @click="showWeatherDialog = true">
              <span class="tool-icon">🌦️</span>
              <span>实时天气</span>
            </div>
            <div class="popover-tool-item" @click="showBingDialog = true">
              <span class="tool-icon">🌅</span>
              <span>Bing 每日壁纸</span>
            </div>
            <div class="popover-tool-item" @click="showUtilityDialog = true">
              <span class="tool-icon">🧰</span>
              <span>智能工具箱</span>
            </div>
          </div>
        </el-popover>
      </div>
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
      <div v-else-if="activeItem === 25" class="api-toolbox-view-wrapper">
        <ComponentShowcase />
      </div>
      <template v-else>
        <div class="aggregator-search-container">
          <!-- 分类 Tab 栏 -->
          <div class="search-category-tabs">
            <span
              v-for="cat in searchCategories"
              :key="cat.id"
              class="search-cat-tab"
              :class="{ active: activeSearchCat === cat.id }"
              @click="selectSearchCategory(cat.id)"
            >
              {{ cat.name }}
            </span>
          </div>

          <!-- 搜索输入框包裹层 -->
          <div class="search-input-wrapper">
            <input
              type="text"
              v-model="searchQuery"
              @keyup.enter="triggerSearch"
              :placeholder="activeEngine.placeholder"
              class="search-input"
            >
            
            <!-- 清除按钮 -->
            <button
              v-show="searchQuery"
              @click="clearSearch"
              class="clear-button-new"
              title="清除搜索"
            >
              ✕
            </button>

            <!-- 语音搜索按钮 -->
            <button 
              class="voice-search-btn" 
              :class="{ 'listening': isListening }"
              @click="startVoiceSearch" 
              title="语音搜索"
            >
              🎤
            </button>

            <!-- 搜索按钮 -->
            <button class="search-icon-btn" @click="triggerSearch" title="搜索">
              🔍
            </button>
          </div>

          <!-- 搜索引擎 Tab 栏 -->
          <div class="search-engine-tabs">
            <span
              v-for="engine in activeCategory.engines"
              :key="engine.id"
              class="search-engine-tab"
              :class="{ active: activeEngineId === engine.id }"
              @click="activeEngineId = engine.id"
            >
              {{ engine.name }}
            </span>
          </div>

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

          <!-- Pill Switcher for IDE Tools -->
          <!-- Pill Switchers dynamically rendered based on active category -->
          <div v-if="activeSubTabs[activeItem] && !searchQuery" class="ide-tab-container">
            <div class="pill-switcher">
              <template v-if="activeItem === 1">
                <button 
                  class="pill-btn" 
                  :class="{ active: activeSubTabs[1] === 'china' }" 
                  @click="activeSubTabs[1] = 'china'"
                >
                  国内
                </button>
                <button 
                  class="pill-btn" 
                  :class="{ active: activeSubTabs[1] === 'overseas' }" 
                  @click="activeSubTabs[1] = 'overseas'"
                >
                  国外
                </button>
              </template>
              <template v-else-if="activeItem === 9">
                <button 
                  class="pill-btn" 
                  :class="{ active: activeSubTabs[9] === 'agents' }" 
                  @click="activeSubTabs[9] = 'agents'"
                >
                  AI智能体
                </button>
                <button 
                  class="pill-btn" 
                  :class="{ active: activeSubTabs[9] === 'skills' }" 
                  @click="activeSubTabs[9] = 'skills'"
                >
                  插件与Skills
                </button>
              </template>
              <template v-else-if="activeItem === 16">
                <button 
                  class="pill-btn" 
                  :class="{ active: activeSubTabs[16] === 'traditional' }" 
                  @click="activeSubTabs[16] = 'traditional'"
                >
                  传统IDE
                </button>
                <button 
                  class="pill-btn" 
                  :class="{ active: activeSubTabs[16] === 'ai' }" 
                  @click="activeSubTabs[16] = 'ai'"
                >
                  AI IDE
                </button>
              </template>
            </div>
          </div>

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

    <!-- 🎬 视频与写真探索频道对话框 -->
    <el-dialog
      v-model="showVideoDialog"
      title="🎬 极速小姐姐视频与写真探索频道"
      width="65%"
      destroy-on-close
      class="video-explore-dialog"
    >
      <div class="video-explore-container">
        <!-- 左侧：栏目列表 (列表页面) -->
        <div class="video-explore-sidebar">
          <div class="channel-group-title">📹 娱乐短视频</div>
          <div 
            class="video-channel-item" 
            :class="{ active: videoActiveChannel === 'sjxjj' }"
            @click="videoActiveChannel = 'sjxjj'"
          >
            <span class="channel-icon">💃</span>
            <div class="channel-info">
              <span class="channel-name">经典随机小姐姐</span>
              <span class="channel-desc">热舞/日常/颜值精选</span>
            </div>
          </div>
          <div 
            class="video-channel-item" 
            :class="{ active: videoActiveChannel === 'mp4_xjj' }"
            @click="videoActiveChannel = 'mp4_xjj'"
          >
            <span class="channel-icon">✨</span>
            <div class="channel-info">
              <span class="channel-name">高质量1080P佳人</span>
              <span class="channel-desc">精品画质/超多库存</span>
            </div>
          </div>

          <div class="channel-group-title" style="margin-top: 16px;">📷 唯美美图写真</div>
          <div 
            class="video-channel-item" 
            :class="{ active: videoActiveChannel === 'photo_meinv' }"
            @click="videoActiveChannel = 'photo_meinv'"
          >
            <span class="channel-icon">👸</span>
            <div class="channel-info">
              <span class="channel-name">随机美女写真</span>
              <span class="channel-desc">海量唯美清纯美图</span>
            </div>
          </div>
          <div 
            class="video-channel-item" 
            :class="{ active: videoActiveChannel === 'photo_baisi' }"
            @click="videoActiveChannel = 'photo_baisi'"
          >
            <span class="channel-icon">🧦</span>
            <div class="channel-info">
              <span class="channel-name">随机白丝美图</span>
              <span class="channel-desc">专属腿控白丝福利</span>
            </div>
          </div>
        </div>

        <!-- 右侧：展示区域 -->
        <div class="video-explore-player-box">
          <!-- 视频播放器 -->
          <div v-if="!videoActiveChannel.startsWith('photo_')" class="media-container" v-loading="isVideoLoading" element-loading-background="rgba(0,0,0,0.6)">
            <video 
              v-if="currentVideoUrl" 
              :src="currentVideoUrl" 
              controls 
              autoplay 
              loop
              playsinline
              class="custom-video-player"
            ></video>
            <div v-else class="media-placeholder">
              <el-icon class="is-loading"><loading /></el-icon>
              <span>正在获取小姐姐视频中...</span>
            </div>
          </div>

          <!-- 图片浏览器 -->
          <div v-else class="media-container" v-loading="isPhotoLoading" element-loading-background="rgba(0,0,0,0.6)">
            <div v-if="currentPhotoUrl" class="custom-image-preview">
              <el-image 
                :src="currentPhotoUrl" 
                fit="contain" 
                :preview-src-list="[currentPhotoUrl]"
                class="photo-img-element"
              />
            </div>
            <div v-else class="media-placeholder">
              <el-icon class="is-loading"><loading /></el-icon>
              <span>正在探索唯美照片中...</span>
            </div>
          </div>

          <!-- 底部工具栏 -->
          <div class="video-control-toolbar">
            <el-button 
              type="primary" 
              size="default" 
              @click="videoActiveChannel.startsWith('photo_') ? queryNextPhoto() : queryNextVideo()"
            >
              🔄 换一个 / 刷新
            </el-button>
            <el-button 
              v-if="videoActiveChannel.startsWith('photo_') ? currentPhotoUrl : currentVideoUrl"
              type="info" 
              plain
              size="default" 
              @click="copyLink(videoActiveChannel.startsWith('photo_') ? currentPhotoUrl : currentVideoUrl)"
            >
              📋 复制资源链接
            </el-button>
            <el-button 
              v-if="videoActiveChannel.startsWith('photo_') ? currentPhotoUrl : currentVideoUrl"
              type="success" 
              plain
              size="default" 
              @click="openLink(videoActiveChannel.startsWith('photo_') ? currentPhotoUrl : currentVideoUrl)"
            >
              🚀 外部浏览器打开
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Bing 每日壁纸对话框 -->
    <el-dialog
      v-model="showBingDialog"
      title="🌅 Bing 每日高清壁纸"
      width="50%"
      destroy-on-close
      class="bing-dialog"
      @open="updateBingPreview"
    >
      <el-form :model="bingWallpaperForm" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="接口数据源：">
              <el-select v-model="bingWallpaperForm.source" placeholder="请选择" @change="updateBingPreview" style="width: 100%;">
                <el-option label="uapis.cn (支持日期自定义)" value="uapis" />
                <el-option label="bing.img.run (极速重定向)" value="imgrun" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标图片分辨率：">
              <el-select v-model="bingWallpaperForm.resolution" placeholder="请选择" @change="updateBingPreview" style="width: 100%;">
                <el-option label="4K 超高清 (UHD)" value="4k" />
                <el-option label="1080P 全高清 (FHD)" value="1080" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="指定壁纸日期：">
              <el-date-picker
                v-model="bingWallpaperForm.date"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled="bingWallpaperForm.random || bingWallpaperForm.source === 'imgrun'"
                style="width: 100%;"
                @change="updateBingPreview"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="随机历史壁纸：">
              <el-select 
                v-model="bingWallpaperForm.random" 
                placeholder="请选择"
                :disabled="bingWallpaperForm.source === 'imgrun'"
                style="width: 100%;"
                @change="updateBingPreview"
              >
                <el-option label="获取指定日期或当天" :value="false" />
                <el-option label="每次请求随机返回一张" :value="true" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="壁纸预览效果：" style="margin-top: 10px;">
          <div class="bing-preview-box" style="width: 100%;">
            <el-image 
              v-if="bingPreviewUrl"
              :src="bingPreviewUrl" 
              fit="cover"
              class="bing-preview-img"
              @load="isBingLoading = false"
              @error="isBingLoading = false"
            >
              <template #placeholder>
                <div class="bing-preview-placeholder">
                  🌀 正在获取预览大图...
                </div>
              </template>
              <template #error>
                <div class="bing-preview-placeholder" style="color: #ff4757;">
                  ❌ 预览图加载超时，请点击下方刷新或更换接口源
                </div>
              </template>
            </el-image>
            <div v-if="!bingPreviewUrl" class="bing-preview-placeholder">
              点击下方“刷新生成壁纸”按钮获取
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="bing-dialog-actions" style="margin-top: 0; display: flex; justify-content: flex-end; gap: 8px;">
          <el-button type="danger" plain @click="clearCustomBackground" v-if="hasCustomBg">
            ❌ 还原默认背景
          </el-button>
          <RefreshCountdownButton :on-refresh="updateBingPreview" text="刷新生成壁纸" type="default" size="default" />
          <el-button type="primary" @click="applyCustomBackground">
            🌅 设为网页背景
          </el-button>
          <el-button type="success" v-if="bingPreviewUrl">
            <a :href="bingPreviewUrl" target="_blank" style="text-decoration: none; color: inherit; display: inline-flex; align-items: center; gap: 4px;">
              📥 下载高清壁纸
            </a>
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 实时天气与波动走势对话框 -->
    <el-dialog
      v-model="showWeatherDialog"
      title="🌦️ 实时天气与气温变化趋势"
      width="50%"
      destroy-on-close
      class="weather-dialog"
      @open="initWeatherView"
      @opened="renderWeatherChart"
    >
      <div v-loading="isWeatherLoading" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: flex-end;">
          <RefreshCountdownButton :on-refresh="refreshWeather" text="刷新天气" />
        </div>
        <el-row :gutter="12">
          <el-col :span="24">
            <el-cascader
              v-model="cascaderValue"
              :options="chinaCascaderOptions"
              :props="{ checkStrictly: true }"
              filterable
              clearable
              placeholder="请点击选择或输入搜索全国城市/区县"
              style="width: 100%;"
              @change="handleCascaderChange"
            />
          </el-col>
        </el-row>

        <!-- 城市选择器折叠面板 (A-Z) -->
        <el-row>
          <el-col :span="24">
            <el-button 
              type="info" 
              plain 
              size="small" 
              style="width: 100%; border-style: dashed;"
              @click="showCityPicker = !showCityPicker"
            >
              {{ showCityPicker ? '🔼 收起城市选择器' : '📍 按拼音首字母 (A-Z) 选择全国城市' }}
            </el-button>
          </el-col>
        </el-row>

        <el-collapse-transition>
          <div v-show="showCityPicker" class="city-picker-panel" style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; max-height: 220px; overflow-y: auto;">
            <!-- 自定义首字母索引栏 -->
            <div class="letter-index-bar" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; user-select: none;">
              <span 
                v-for="(cities, letter) in chinaCitiesAz"
                :key="letter"
                @click="activeLetter = letter"
                :style="{
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  background: activeLetter === letter ? 'var(--primary-color)' : 'transparent',
                  color: activeLetter === letter ? '#ffffff' : 'var(--text-color)'
                }"
              >
                {{ letter }}
              </span>
            </div>

            <!-- 当前选中的字母对应的城市列表 -->
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <el-button
                v-for="city in chinaCitiesAz[activeLetter]"
                :key="city.adcode"
                size="small"
                plain
                :type="isCitySelected(city) ? 'primary' : 'default'"
                style="margin: 0; padding: 4px 8px; font-size: 12px;"
                @click="selectCityFromPicker(city)"
              >
                {{ city.name }}
              </el-button>
            </div>
          </div>
        </el-collapse-transition>

        <el-row :gutter="12" v-if="weatherDistrictList.length > 0">
          <el-col :span="24">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 13px; color: var(--text-secondary); white-space: nowrap;">匹配地区：</span>
              <el-select 
                v-model="selectedAdcode" 
                placeholder="请选择具体区县" 
                @change="queryWeatherByAdcode"
                style="flex: 1;"
              >
                <el-option 
                  v-for="d in weatherDistrictList" 
                  :key="d.adcode" 
                  :label="`${d.province || ''} - ${d.city || ''} - ${d.district || d.name || ''} (${d.adcode})`" 
                  :value="d.adcode" 
                />
              </el-select>
            </div>
          </el-col>
        </el-row>

        <div v-if="currentWeather" class="weather-current-card">
          <el-row :gutter="20" align="middle">
            <el-col :span="8" style="text-align: center; border-right: 1px solid var(--border-color);">
              <div style="font-size: 38px; font-weight: 700; color: var(--primary-color);">
                {{ currentWeather.temp }}°C
              </div>
              <div style="font-size: 14px; font-weight: 600; margin-top: 4px; color: var(--text-color);">
                {{ getWeatherEmoji(currentWeather.weather_icon) }} {{ currentWeather.weather }}
              </div>
            </el-col>
            <el-col :span="16" style="padding-left: 20px;">
              <div style="font-size: 15px; font-weight: 600; margin-bottom: 8px; color: var(--text-color);">
                📍 当前城市: {{ currentWeather.province }} {{ currentWeather.city }} {{ currentWeather.district }}
              </div>
              <el-row :gutter="10" style="font-size: 13px; color: var(--text-secondary);">
                <el-col :span="12" style="margin-bottom: 4px;">💧 湿度: {{ currentWeather.humidity }}</el-col>
                <el-col :span="12" style="margin-bottom: 4px;">🍃 风力: {{ currentWeather.wind_direction }} {{ currentWeather.wind_power }}</el-col>
                <el-col :span="12" style="margin-bottom: 4px;" v-if="currentWeather.temp_feels">🌡️ 体感温度: {{ currentWeather.temp_feels }}°C</el-col>
                <el-col :span="12" style="margin-bottom: 4px;" v-if="currentWeather.uv_index">☀️ 紫外线: {{ currentWeather.uv_index }}级</el-col>
                <el-col :span="12" style="margin-bottom: 4px;" v-if="currentWeather.visibility">👁️ 能见度: {{ currentWeather.visibility }} km</el-col>
                <el-col :span="12" style="margin-bottom: 4px;" v-if="currentWeather.pressure">🎈 气压: {{ currentWeather.pressure }} hPa</el-col>
                <el-col :span="24" style="margin-bottom: 4px;" v-if="currentWeather.aqi">🍃 空气质量: {{ currentWeather.aqi }} ({{ currentWeather.aqi_desc }})</el-col>
                <el-col :span="24" style="margin-top: 4px; font-size: 11px; opacity: 0.75;">
                  🕒 报告时间: {{ currentWeather.update_time }}
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </div>

        <div style="margin-top: 10px;">
          <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
            📈 7 天最高/最低气温变化趋势 (ECharts)：
          </div>
          <div id="weather-echarts-container" style="width: 100%; height: 260px; background: var(--hover-bg); border-radius: 8px; border: 1px solid var(--border-color);"></div>
        </div>

        <!-- 生活指数面板 -->
        <div v-if="currentWeather && currentWeather.indices" style="margin-top: 12px;">
          <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
            👕 生活指数指南：
          </div>
          <el-row :gutter="12">
            <el-col :span="6" v-if="currentWeather.indices.apparel">
              <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px; text-align: center; height: 100%;">
                <div style="font-size: 12px; color: var(--text-secondary); white-space: nowrap;">穿衣指数</div>
                <div style="font-weight: 700; font-size: 13px; margin: 4px 0; color: var(--primary-color);">{{ currentWeather.indices.apparel.level }}</div>
                <div style="font-size: 11px; opacity: 0.85; line-height: 1.3;">{{ currentWeather.indices.apparel.advice || currentWeather.indices.apparel.brief }}</div>
              </div>
            </el-col>
            <el-col :span="6" v-if="currentWeather.indices.car_wash">
              <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px; text-align: center; height: 100%;">
                <div style="font-size: 12px; color: var(--text-secondary); white-space: nowrap;">洗车指数</div>
                <div style="font-weight: 700; font-size: 13px; margin: 4px 0; color: var(--primary-color);">{{ currentWeather.indices.car_wash.level }}</div>
                <div style="font-size: 11px; opacity: 0.85; line-height: 1.3;">{{ currentWeather.indices.car_wash.advice || currentWeather.indices.car_wash.brief }}</div>
              </div>
            </el-col>
            <el-col :span="6" v-if="currentWeather.indices.sunscreen">
              <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px; text-align: center; height: 100%;">
                <div style="font-size: 12px; color: var(--text-secondary); white-space: nowrap;">防晒指数</div>
                <div style="font-weight: 700; font-size: 13px; margin: 4px 0; color: var(--primary-color);">{{ currentWeather.indices.sunscreen.level }}</div>
                <div style="font-size: 11px; opacity: 0.85; line-height: 1.3;">{{ currentWeather.indices.sunscreen.advice || currentWeather.indices.sunscreen.brief }}</div>
              </div>
            </el-col>
            <el-col :span="6" v-if="currentWeather.indices.sport">
              <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px; text-align: center; height: 100%;">
                <div style="font-size: 12px; color: var(--text-secondary); white-space: nowrap;">运动指数</div>
                <div style="font-weight: 700; font-size: 13px; margin: 4px 0; color: var(--primary-color);">{{ currentWeather.indices.sport.level }}</div>
                <div style="font-size: 11px; opacity: 0.85; line-height: 1.3;">{{ currentWeather.indices.sport.advice || currentWeather.indices.sport.brief }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>

    <!-- 智能实用工具箱对话框 -->
    <el-dialog
      v-model="showUtilityDialog"
      title="🧰 智能实用工具箱"
      width="60%"
      destroy-on-close
      class="utility-dialog"
    >
      <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
        <RefreshCountdownButton :on-refresh="refreshUtility" text="刷新当前数据" />
      </div>
      <el-tabs v-model="utilityActiveTab" type="border-card">
        <!-- 1. 节假日万年历 -->
        <el-tab-pane name="holiday">
          <template #label>
            <span>📅 节假日万年历</span>
          </template>
          <div style="padding: 10px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <span style="font-size: 14px; font-weight: bold; color: var(--text-color);">指定查询日期：</span>
              <el-date-picker
                v-model="holidayQueryDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="queryHolidayCalendar"
                style="flex: 1; max-width: 250px;"
              />
              <el-button type="primary" :loading="isHolidayLoading" @click="queryHolidayCalendar">🔍 查询</el-button>
            </div>

            <div v-if="holidayData" class="holiday-card-wrapper">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="holiday-lunar-box">
                    <div class="lunar-year-text">{{ holidayData.lunar?.ganzhi_year || '' }}年 [{{ holidayData.lunar?.lunar_year || '' }}]</div>
                    <div class="lunar-day-text">{{ holidayData.lunar?.lunar_month_name || '' }}{{ holidayData.lunar?.lunar_day_name || '' }}</div>
                    <div class="lunar-ganzhi-details">
                      <div>月建：{{ holidayData.lunar?.ganzhi_month || '' }}月</div>
                      <div>日建：{{ holidayData.lunar?.ganzhi_day || '' }}日</div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="16">
                  <div class="holiday-events-box">
                    <h4 style="margin: 0 0 10px 0; color: var(--primary-color);">🎉 节日与节气事件：</h4>
                    <div v-if="holidayData.holidays && holidayData.holidays.length > 0">
                      <div v-for="h in holidayData.holidays" :key="h.name" class="holiday-event-item">
                        <span class="holiday-type-tag" :class="h.type">{{ h.type === 'legal_rest' ? '休' : h.type === 'legal_workday_adjust' ? '班' : '节' }}</span>
                        <strong style="margin-left: 6px; color: var(--text-color);">{{ h.name }}</strong>
                        <span v-if="h.is_workday !== undefined" style="font-size: 12px; margin-left: 10px; color: var(--text-secondary);">
                          ({{ h.is_workday ? '调休上班' : '法定公休' }})
                        </span>
                      </div>
                    </div>
                    <div v-else style="color: var(--text-secondary); font-size: 13px;">
                      今天是没有特殊法定节假日调休的普通一天哦~ ☕
                    </div>

                    <!-- 临近节日 -->
                    <div v-if="holidayData.nearby" style="margin-top: 16px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
                      <h5 style="margin: 0 0 8px 0; color: var(--text-secondary);">⏰ 临近重要节日：</h5>
                      <div style="font-size: 12px; line-height: 1.6; color: var(--text-secondary);">
                        <div v-if="holidayData.nearby.next && holidayData.nearby.next.length > 0">
                          下一个节日：<strong>{{ holidayData.nearby.next[0].events[0]?.name }}</strong> 
                          ({{ holidayData.nearby.next[0].date }})
                        </div>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
            <div v-else style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              <el-icon class="is-loading"><loading /></el-icon> 正在努力获取日历信息中...
            </div>
          </div>
        </el-tab-pane>

        <!-- 2. 程序员老黄历 -->
        <el-tab-pane name="programmer">
          <template #label>
            <span>💻 程序员黄历</span>
          </template>
          <div style="padding: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <span style="font-size: 15px; font-weight: bold; color: var(--primary-color);">📜 程序员历史上的今天</span>
              <el-button size="small" type="primary" plain :loading="isProgrammerLoading" @click="queryProgrammerToday">🔄 刷新</el-button>
            </div>

            <div v-if="programmerHistory && programmerHistory.length > 0" class="programmer-history-timeline">
              <el-timeline>
                <el-timeline-item
                  v-for="(event, idx) in programmerHistory"
                  :key="idx"
                  :timestamp="String(event.year) + ' 年'"
                  placement="top"
                  type="primary"
                >
                  <div class="programmer-event-card">
                    <h4 style="margin: 0 0 6px 0; font-size: 14px; color: var(--text-color); display: flex; align-items: center; justify-content: space-between;">
                      <span>{{ event.title }}</span>
                      <span class="event-tag">{{ event.category }}</span>
                    </h4>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                      {{ event.description }}
                    </p>
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
                      <span style="color: var(--primary-color);">重要性：★ {{ event.importance }}</span>
                      <a :href="event.url" target="_blank" style="color: var(--primary-color); text-decoration: none;">📖 详情维基链接</a>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
            <div v-else style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              <el-icon class="is-loading"><loading /></el-icon> 正在探寻程序员历史的群星闪耀时刻...
            </div>
          </div>
        </el-tab-pane>

        <!-- 3. 今日热榜 -->
        <el-tab-pane name="hotboard">
          <template #label>
            <span>🔥 今日热榜</span>
          </template>
          <div style="padding: 10px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <span style="font-size: 14px; font-weight: bold; color: var(--text-color);">平台选择：</span>
              <el-select v-model="hotboardType" placeholder="选择平台" @change="queryHotboard" style="width: 180px;">
                <el-option v-for="(name, code) in hotboardPlatforms" :key="code" :label="name" :value="code" />
              </el-select>
              <el-button type="primary" :loading="isHotboardLoading" @click="queryHotboard">🔄 刷新数据</el-button>
            </div>

            <div v-if="hotboardData && hotboardData.length > 0" class="hotboard-list-wrapper">
              <div v-for="(item, idx) in hotboardData" :key="idx" class="hotboard-list-item" @click="openLink(item.url)">
                <span class="hot-idx" :class="{'top-three': idx < 3}">{{ idx + 1 }}</span>
                <span class="hot-title">{{ item.title }}</span>
                <span class="hot-value" v-if="item.hot_value">🔥 {{ item.hot_value }}</span>
              </div>
            </div>
            <div v-else style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              <el-icon class="is-loading"><loading /></el-icon> 正在爬取当下最炙手可热的新闻热搜...
            </div>
          </div>
        </el-tab-pane>

        <!-- 4. 院线票房与影视排行 -->
        <el-tab-pane name="movies">
          <template #label>
            <span>🎬 影视热度榜</span>
          </template>
          <div style="padding: 10px;">
            <el-tabs type="card">
              <el-tab-pane label="📈 实时电影票房">
                <div v-if="movieBoxOffice" style="padding-top: 10px;">
                  <div class="movie-box-summary" style="display: flex; gap: 20px; background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                    <div>📅 数据时间: <strong style="color: var(--primary-color);">{{ movieBoxOffice.update_time }}</strong></div>
                    <div>💰 大盘票房: <strong style="color: var(--primary-color);">{{ movieBoxOffice.market?.box_office }}</strong></div>
                    <div>🎬 总场次: <strong>{{ movieBoxOffice.market?.show_count }}</strong></div>
                    <div>👥 总人次: <strong>{{ movieBoxOffice.market?.view_count }}</strong></div>
                  </div>

                  <el-table :data="movieBoxOffice.list" border size="small" style="width: 100%; border-radius: 8px; overflow: hidden;">
                    <el-table-column prop="rank" label="名次" width="60" align="center">
                      <template #default="scope">
                        <span style="font-weight: bold; color: var(--primary-color);">{{ scope.row.rank }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="movie_name" label="影片名称" min-width="120" show-overflow-tooltip />
                    <el-table-column prop="box_office" label="实时票房" width="100" align="right" />
                    <el-table-column prop="box_office_rate" label="票房占比" width="80" align="center" />
                    <el-table-column prop="show_count_rate" label="排片占比" width="80" align="center" />
                    <el-table-column prop="sum_box_office" label="累计总票房" width="100" align="right" />
                    <el-table-column prop="release_info" label="上映天数" width="90" align="center" />
                  </el-table>
                </div>
                <div v-else style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
                  <el-icon class="is-loading"><loading /></el-icon> 正在获取最新院线实时票房榜单...
                </div>
              </el-tab-pane>

              <el-tab-pane label="🔥 影视收视评分榜">
                <div style="display: flex; gap: 12px; margin-bottom: 16px; padding-top: 10px;">
                  <el-select v-model="movieRatingsChannel" placeholder="选择渠道" @change="queryMovieRatings" style="width: 130px;">
                    <el-option label="全网影视" value="all" />
                    <el-option label="卫视收视" value="tv" />
                    <el-option label="网络平台" value="web" />
                    <el-option label="院线新片" value="cinema" />
                  </el-select>
                  <el-select v-model="movieRatingsPeriod" placeholder="选择周期" @change="queryMovieRatings" style="width: 130px;">
                    <el-option label="实时榜单" value="realtime" />
                    <el-option label="今日排行" value="day" />
                    <el-option label="本周排行" value="week" />
                    <el-option label="本月排行" value="month" />
                  </el-select>
                  <el-button type="primary" :loading="isMovieRatingsLoading" @click="queryMovieRatings">🔄 刷新排行</el-button>
                </div>

                <div v-if="movieRatings && movieRatings.length > 0" class="hotboard-list-wrapper">
                  <div v-for="(item, idx) in movieRatings" :key="idx" class="hotboard-list-item">
                    <span class="hot-idx" :class="{'top-three': idx < 3}">{{ idx + 1 }}</span>
                    <span class="hot-title">
                      {{ item.title }} 
                      <span style="font-size: 11px; color: var(--text-secondary); margin-left: 10px;">[{{ item.platform || item.channel || '' }}]</span>
                    </span>
                    <span class="hot-value" v-if="item.score">⭐ {{ item.score }}分</span>
                    <span class="hot-value" v-else-if="item.hot_value">🔥 {{ item.hot_value }}</span>
                  </div>
                </div>
                <div v-else style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
                  <el-icon class="is-loading"><loading /></el-icon> 正在获取影视热度排行评分列表...
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-tab-pane>

        <!-- 5. 快递物流追踪 -->
        <el-tab-pane name="courier">
          <template #label>
            <span>📦 快递物流追踪</span>
          </template>
          <div style="padding: 10px;">
            <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <el-row :gutter="12" align="middle">
                <el-col :span="10">
                  <el-input v-model="trackingNumber" placeholder="请输入快递单号" clearable />
                </el-col>
                <el-col :span="7">
                  <el-input v-model="trackingPhone" placeholder="收件人手机尾号4位(可选)" clearable maxlength="4" />
                </el-col>
                <el-col :span="7" style="display: flex; gap: 8px;">
                  <el-button type="primary" :loading="isTrackingLoading" @click="queryCourier" style="width: 100%;">
                    🔍 查物流
                  </el-button>
                </el-col>
              </el-row>
            </div>

            <!-- 物流轨迹详情 -->
            <div v-if="trackingInfo" class="tracking-details-wrapper">
              <div class="tracking-summary-header" style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <span style="font-size: 14px; font-weight: bold; color: var(--primary-color);">
                  📦 {{ trackingInfo.carrier_name || '智能匹配物流' }}：{{ trackingInfo.tracking_number }}
                </span>
                <span class="status-badge" :class="trackingInfo.status" style="margin-left: 12px;">
                  {{ trackingInfo.status_desc || '查询成功' }}
                </span>
              </div>

              <div class="tracking-timeline-box" style="max-height: 350px; overflow-y: auto; padding-right: 8px;">
                <el-timeline>
                  <el-timeline-item
                    v-for="(step, idx) in trackingInfo.list"
                    :key="idx"
                    :timestamp="step.time"
                    :type="idx === 0 ? 'primary' : 'info'"
                  >
                    <div style="font-size: 12px; line-height: 1.5; color: idx === 0 ? 'var(--text-color)' : 'var(--text-secondary)';">
                      {{ step.status_desc || step.context }}
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
            <div v-else style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              💡 快递单号支持自动识别申通、圆通、中通、顺丰、极兔、韵达、邮政EMS、京东等主流快递。
            </div>
          </div>
        </el-tab-pane>

        <!-- 6. 随机图片 -->
        <el-tab-pane name="image">
          <template #label>
            <span>🖼️ 随机美图</span>
          </template>
          <div style="padding: 10px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <span style="font-size: 14px; font-weight: bold; color: var(--text-color);">图片分类：</span>
              <el-select v-model="randomImageCategory" placeholder="选择分类" @change="queryRandomImage" style="width: 180px;">
                <el-option label="🌅 高清电脑壁纸" value="pc_wallpaper" />
                <el-option label="📱 精美手机壁纸" value="mobile_wallpaper" />
                <el-option label="🌸 风景摄影图" value="landscape" />
                <el-option label="🎨 动漫ACG大图" value="anime" />
                <el-option label="🤖 AI 创意绘画" value="ai_drawing" />
              </el-select>
              <el-button type="primary" :loading="isRandomImageLoading" @click="queryRandomImage">🔄 换一张</el-button>
            </div>

            <div class="random-image-display" style="width: 100%; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); position: relative; height: 350px; background: var(--hover-bg);">
              <el-image
                v-if="randomImageUrl"
                :src="randomImageUrl"
                fit="contain"
                style="width: 100%; height: 100%;"
                @load="isRandomImageLoading = false"
                @error="isRandomImageLoading = false"
              >
                <template #placeholder>
                  <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">
                    🌀 正在为您生成绝美图片...
                  </div>
                </template>
                <template #error>
                  <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff4757;">
                    ❌ 接口拉取失败，请点击换一张重试
                  </div>
                </template>
              </el-image>

              <!-- 操作浮层 -->
              <div v-if="randomImageUrl" class="image-overlay-actions">
                <el-button size="small" type="primary" @click="() => { customBackgroundUrl = randomImageUrl; applyCustomBackground(); }">
                  🌅 设为网页背景
                </el-button>
                <el-button size="small" type="success">
                  <a :href="randomImageUrl" target="_blank" style="text-decoration: none; color: inherit; display: inline-flex; align-items: center; gap: 4px;">
                    📥 下载原图
                  </a>
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 7. 毒鸡汤 -->
        <el-tab-pane name="dujitang">
          <template #label>
            <span>🍲 毒鸡汤</span>
          </template>
          <div style="padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 250px;">
            <div class="dujitang-card" v-loading="isDujitangLoading">
              <span class="quote-mark-start">“</span>
              <p class="dujitang-content-text">{{ dujitangText || '正在努力为您熬制毒鸡汤中...🍲' }}</p>
              <span class="quote-mark-end">”</span>
            </div>
            
            <div style="margin-top: 24px;">
              <el-button type="danger" round :loading="isDujitangLoading" @click="queryDujitang">
                🍲 再来一碗 / 换一碗
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
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
      width="90%"
      destroy-on-close
      class="like-history-dialog"
    >

      <div class="like-history-header">
        <div class="like-history-title">历史记录</div>
        
        <!-- Column switcher inside dialog -->
        <div class="column-switcher" style="margin-left: auto; margin-right: 16px;">
          <span class="switcher-label">🖥️ 视图布局:</span>
          <button 
            v-for="cols in [1, 2, 3, 4, 5].filter(c => c <= likedToolsList.length)" 
            :key="cols"
            class="switcher-btn"
            :class="{ active: dialogGridCols === cols }"
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
      <div :class="['liked-tools-list', `cols-${dialogGridCols}`, { 'scrollable': likedToolsList.length > 10 }]">
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
                <span class="menu-info">{{ tool.menuInfo?.menuIcon }} {{ tool.menuInfo?.menuName }}</span>
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

        <!-- Section 2.5: 随机网址 -->
        <div class="drawer-section">
          <h3 class="section-title collapsible-title" style="cursor: default;">
            <span>📈 随机网址</span>
            <button class="refresh-btn" @click="refreshRandomTools" title="刷新">
              <span class="refresh-icon">↻</span>
              <span class="refresh-text" style="font-size: 11px; margin-left: 2px;">刷新</span>
            </button>
          </h3>
          <div class="random-tools-grid">
            <a v-for="tool in randomTools" 
               :key="tool.id" 
               :href="tool.link" 
               target="_blank" 
               class="random-tool-item" 
               :title="tool.name + ' - ' + tool.desc">
              <span class="random-tool-icon">
                <img v-if="isUrl(tool.icon)" :src="tool.icon" class="random-tool-icon-img" alt="icon">
                <span v-else class="random-tool-text-icon">{{ tool.icon }}</span>
              </span>
              <span class="random-tool-name">{{ tool.name }}</span>
            </a>
          </div>
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

        <!-- Section 4: 关于与系统信息 -->
        <div class="drawer-section">
          <h3 class="section-title">ℹ️ 系统信息</h3>
          <div class="info-list">
            <div class="info-item">
              <span>作者 GitHub</span>
              <a href="https://github.com/mhxy13867806343" target="_blank" class="github-link">
                mhxy13867806343
              </a>
            </div>
            <div class="info-item">
              <span>当前时间</span>
              <span class="info-value">{{ currentDate }} {{ currentTime }}</span>
            </div>
            <div class="info-item">
              <span>操作系统</span>
              <span class="info-value">{{ userOS }}</span>
            </div>
            <div class="info-item">
              <span>当前时区</span>
              <span class="info-value">{{ userTimezone }}</span>
            </div>
            <div class="info-item">
              <span>语言类型</span>
              <span class="info-value">{{ userLanguage }}</span>
            </div>
            <div class="info-item">
              <span>版本号</span>
              <span class="info-value">0.1</span>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 路由页面层（闪存等独立页面） -->
    <div v-if="isFlashRoute" class="route-view-layer">
      <div class="route-view-bar">
        <el-button size="small" @click="backFromFlash">← 返回导航站</el-button>
      </div>
      <router-view />
    </div>
  </div>
</template>

<style scoped src="./App.css"></style>

<style scoped>
.route-view-layer {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: #f2f2f2;
  overflow-y: auto;
}
.route-view-bar {
  position: sticky;
  top: 0;
  z-index: 3001;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #2f5b88;
}
</style>
