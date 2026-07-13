import { ref, onMounted, computed, shallowRef, onUnmounted } from 'vue'
import axios from 'axios'
import { menuItemsList, authorWorksList, onlineWorksList } from '@/utlis/menuItems'
import chinaCitiesAz from '@/utils/china-cities-az.json'
import { ElDialog, ElMessageBox, ElMessage } from 'element-plus'
import { Message, Timer } from '@element-plus/icons-vue'

// Custom Components
import SokobanGame from './components/games/SokobanGame.vue'
import ImageEditor from './components/image/ImageEditor.vue'
import MusicPlayer from "./components/MusicPlayer.vue"
import DyForm from './views/DyForm.vue'
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
import QiteTodo from './components/games/QiteTodo.vue'
import DeveloperToolbox from './components/games/DeveloperToolbox.vue'

// Composables
import { useTheme } from './composables/useTheme'
import { useSystemInfo } from './composables/useSystemInfo'
import { useLikes } from './composables/useLikes'
import { useDatabase } from './composables/useDatabase'
import { useSearch } from './composables/useSearch'
import { useRandomWebsites } from './composables/useRandomWebsites'

export function useAppLogic() {
  // 环境判断
  const isProd = import.meta.env.PROD

  // 数据库逻辑
  const { menuItems, isHomeLive, isHomeLoading, fetchHomeDatabase } = useDatabase()

  // 主题逻辑
  const { isDarkMode, showThemeDropdown, toggleTheme, toggleThemeDropdown } = useTheme()

  // 收藏点赞逻辑
  const { likedItemsInfo, showLikeHistory, isLiked, toggleLike, likedToolsList, clearAllLikes } = useLikes(menuItems)

  const openLikeHistory = () => {
    showLikeHistory.value = true
  }

  // 菜单分类状态
  const activeItem = ref(parseInt(localStorage.getItem('activeItem')) || 1)
  const isSidebarOpen = ref(true)
  const activeSubTabs = ref({
    1: 'china',        // Category 1: AI聊天助手. Options: 'china', 'overseas'
    9: 'agents',       // Category 9: AI智能体. Options: 'agents', 'skills'
    16: 'traditional'  // Category 16: IDE工具. Options: 'traditional', 'ai'
  })
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

  const dialogGridCols = computed(() => {
    const maxCols = Math.min(5, likedToolsList.value.length || 1)
    return Math.min(gridCols.value, maxCols)
  })

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
    return menuItems.value.filter(item => item.id !== 24 && item.id !== 25)
  })

  const isUrl = (str) => {
    if (!str) return false
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')
  }

  const selectItem = (itemId) => {
    activeItem.value = itemId
    activeSubItem.value = null
    isNewsActive.value = false
    isAppStoreActive.value = false
    isArticlesListActive.value = false
    localStorage.setItem('activeItem', itemId.toString())
  }

  const activeSubItem = ref(null)
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
    
    if (activeSubTabs.value[activeItem.value]) {
      const tabValue = activeSubTabs.value[activeItem.value]
      const tools = cat.tools || []
      if (activeItem.value === 1) {
        const regionMap = {
          china: '国内',
          overseas: '国外'
        }
        return tools.filter(t => t.region === regionMap[tabValue])
      }
      return tools.filter(t => t.subType === tabValue)
    }
    
    return cat.tools || []
  }

  const openLink = (link) => {
    if (link) {
      window.open(link, '_blank')
    }
  }

  // 右键上下文菜单
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

  // 搜索逻辑
  const {
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
  } = useSearch(menuItems, getCurrentTools)

  // 游戏逻辑与模态框
  const showGameDialog = ref(false)
  const currentGame = shallowRef(null)
  const gameTitle = ref('')

  const handleCloseDialog = (done) => {
    const currentItem = menuItems.value.find(item => item.id === activeItem.value)
    let message = '确定要退出吗？'
    
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
      case 'qitetodo':
        currentGame.value = QiteTodo
        break
      case 'devtools':
        currentGame.value = DeveloperToolbox
        break
      default:
        currentGame.value = null
    }
  }

  // 系统检测与时区逻辑
  const {
    currentTime,
    currentDate,
    userOS,
    userTimezone,
    userLanguage,
    detectSystemInfo,
    updateTime
  } = useSystemInfo()

  // 随机网址逻辑
  const { randomTools, refreshRandomTools } = useRandomWebsites(menuItems)

  const onClickWork = item => {
    window.open(item.link)
  }

  let timer = null
  let homeRefreshInterval = null

  onMounted(() => {
    document.documentElement.classList.toggle('dark', isDarkMode.value)

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

    document.addEventListener('contextmenu', (event) => {
      const toolCard = event.target.closest('.tool-card')
      if (!toolCard && isProd) {
        event.preventDefault()
        window.open('about:blank', '_blank')
      }
    })

    detectSystemInfo()
    refreshRandomTools()
    updateTime()
    timer = setInterval(updateTime, 1000)

    fetchHomeDatabase()
    homeRefreshInterval = setInterval(fetchHomeDatabase, 60000)
  })

  // Bing 每日壁纸逻辑
  const showBingDialog = ref(false)
  const isBingLoading = ref(false)
  const bingWallpaperForm = ref({
    source: 'uapis',
    date: '',
    random: false,
    resolution: '4k',
    format: 'image'
  })
  const bingPreviewUrl = ref('')
  const customBackgroundUrl = ref(localStorage.getItem('customBackgroundUrl') || '')
  const hasCustomBg = computed(() => !!customBackgroundUrl.value)

  const updateBingPreview = () => {
    isBingLoading.value = true
    let url = ''
    if (bingWallpaperForm.value.source === 'uapis') {
      const { date, random, resolution, format } = bingWallpaperForm.value
      url = `https://api.uapis.cn/bing?resolution=${resolution}&format=${format}`
      if (date && !random) {
        url += `&date=${date}`
      }
      if (random) {
        url += `&random=true`
      }
    } else {
      const { random, resolution } = bingWallpaperForm.value
      if (random) {
        url = resolution === '4k' ? 'https://bing.img.run/rand_uhd.php' : 'https://bing.img.run/rand.php'
      } else {
        url = resolution === '4k' ? 'https://bing.img.run/uhd.php' : 'https://bing.img.run/1920x1080.php'
      }
    }

    bingPreviewUrl.value = url
  }

  const applyCustomBackground = () => {
    if (!bingPreviewUrl.value) {
      ElMessage.warning('请先获取并生成壁纸预览！')
      return
    }
    customBackgroundUrl.value = bingPreviewUrl.value
    localStorage.setItem('customBackgroundUrl', customBackgroundUrl.value)
    ElMessage.success('🎉 成功将该壁纸设为网页背景！')
  }

  const clearCustomBackground = () => {
    customBackgroundUrl.value = ''
    localStorage.removeItem('customBackgroundUrl')
    ElMessage.success('已还原为默认主题背景')
  }

  // 实时天气与气温波段分析逻辑
  const showWeatherDialog = ref(false)
  const weatherSearchKeyword = ref('')
  const weatherDistrictList = ref([])
  const selectedAdcode = ref('')
  const currentWeather = ref(null)
  const forecastList = ref([])
  const isWeatherLoading = ref(false)

  const getCityInfoByName = (name) => {
    if (!name) return null
    for (const letter in chinaCitiesAz) {
      const found = chinaCitiesAz[letter].find(c => c.name.includes(name) || name.includes(c.name))
      if (found) return found
    }
    return null
  }

  const getCityInfoByAdcode = (adcode) => {
    if (!adcode) return null
    const target = String(adcode)
    for (const letter in chinaCitiesAz) {
      const found = chinaCitiesAz[letter].find(c => c.adcode === target)
      if (found) return found
    }
    if (target.length === 6 && !target.endsWith('00')) {
      const parentAdcode = target.slice(0, 4) + '00'
      for (const letter in chinaCitiesAz) {
        const found = chinaCitiesAz[letter].find(c => c.adcode === parentAdcode)
        if (found) {
          return {
            ...found,
            district: '城区'
          }
        }
      }
    }
    return null
  }

  const fallbackMockSearch = async () => {
    const kw = weatherSearchKeyword.value.trim()
    let matches = []
    
    if (kw.includes('杭州')) {
      matches = [
        { name: '杭州市', adcode: '330100', province: '浙江省', city: '杭州市', district: '全市' },
        { name: '西湖区', adcode: '330106', province: '浙江省', city: '杭州市', district: '西湖区' },
        { name: '拱墅区', adcode: '330105', province: '浙江省', city: '杭州市', district: '拱墅区' },
        { name: '滨江区', adcode: '330108', province: '浙江省', city: '杭州市', district: '滨江区' },
        { name: '萧山区', adcode: '330109', province: '浙江省', city: '杭州市', district: '萧山区' },
        { name: '余杭区', adcode: '330110', province: '浙江省', city: '杭州市', district: '余杭区' }
      ]
    } else if (kw.includes('北京')) {
      matches = [
        { name: '北京市', adcode: '110000', province: '北京市', city: '北京市', district: '全市' },
        { name: '东城区', adcode: '110101', province: '北京市', city: '北京市', district: '东城区' },
        { name: '西城区', adcode: '110102', province: '北京市', city: '北京市', district: '西城区' },
        { name: '朝阳区', adcode: '110105', province: '北京市', city: '北京市', district: '朝阳区' },
        { name: '海淀区', adcode: '110108', province: '北京市', city: '北京市', district: '海淀区' }
      ]
    } else if (kw.includes('上海')) {
      matches = [
        { name: '上海市', adcode: '310000', province: '上海市', city: '上海市', district: '全市' },
        { name: '黄浦区', adcode: '310101', province: '上海市', city: '上海市', district: '黄浦区' },
        { name: '徐汇区', adcode: '310104', province: '上海市', city: '上海市', district: '徐汇区' },
        { name: '静安区', adcode: '310106', province: '上海市', city: '上海市', district: '静安区' },
        { name: '浦东新区', adcode: '310115', province: '上海市', city: '上海市', district: '浦东新区' }
      ]
    } else if (kw.includes('深圳')) {
      matches = [
        { name: '深圳市', adcode: '440300', province: '广东省', city: '深圳市', district: '全市' },
        { name: '罗湖区', adcode: '440303', province: '广东省', city: '深圳市', district: '罗湖区' },
        { name: '福田区', adcode: '440304', province: '广东省', city: '深圳市', district: '福田区' },
        { name: '南山区', adcode: '440305', province: '广东省', city: '深圳市', district: '南山区' },
        { name: '宝安区', adcode: '440306', province: '广东省', city: '深圳市', district: '宝安区' },
        { name: '龙岗区', adcode: '440307', province: '广东省', city: '深圳市', district: '龙岗区' }
      ]
    } else {
      const foundCity = getCityInfoByName(kw)
      if (foundCity) {
        matches = [
          { name: foundCity.name, adcode: foundCity.adcode, province: foundCity.province || '未知省份', city: foundCity.name, district: '全市' }
        ]
      } else {
        matches = [
          { name: kw, adcode: '330100', province: '浙江省', city: kw, district: '全市' },
          { name: `${kw}地区`, adcode: '330106', province: '浙江省', city: kw, district: '地区' }
        ]
      }
    }
    
    weatherDistrictList.value = matches
    selectedAdcode.value = matches[0].adcode
    await queryWeatherByAdcode(selectedAdcode.value)
  }

  const searchWeatherDistrict = async () => {
    if (!weatherSearchKeyword.value.trim()) {
      ElMessage.warning('请输入要查询的城市或地区！')
      return
    }
    isWeatherLoading.value = true
    try {
      // 1. Search region by keywords first
      const res = await axios.get(`https://api.uapis.cn/api/v1/misc/district`, {
        params: { keywords: weatherSearchKeyword.value.trim() }
      })
      if (res.data && res.data.code === 200 && res.data.data && res.data.data.length > 0) {
        const primaryMatch = res.data.data[0]
        
        // 2. Query matched adcode to retrieve the matched region + its sub-districts!
        const subRes = await axios.get(`https://api.uapis.cn/api/v1/misc/district`, {
          params: { adcode: primaryMatch.adcode }
        })
        
        if (subRes.data && subRes.data.code === 200 && subRes.data.data && subRes.data.data.length > 0) {
          weatherDistrictList.value = subRes.data.data
          selectedAdcode.value = subRes.data.data[0].adcode
          await queryWeatherByAdcode(selectedAdcode.value)
        } else {
          weatherDistrictList.value = res.data.data
          selectedAdcode.value = primaryMatch.adcode
          await queryWeatherByAdcode(selectedAdcode.value)
        }
      } else {
        await fallbackMockSearch()
      }
    } catch (e) {
      console.error('查找地区失败:', e)
      await fallbackMockSearch()
    } finally {
      isWeatherLoading.value = false
    }
  }

  const buildWeatherObject = (info) => {
    return {
      province: info.province || '',
      city: info.city || '',
      district: info.district || '',
      adcode: info.adcode || '',
      temp: info.temp || info.temperature || '31',
      weather: info.weather || '晴',
      weather_icon: info.weather_icon || '100',
      humidity: info.humidity || '45%',
      wind_direction: info.wind_direction || '南风',
      wind_power: info.wind_power || '2级',
      update_time: info.update_time || info.reporttime || new Date().toLocaleString(),
      
      // Extended fields
      temp_feels: info.temp_feels || '',
      visibility: info.visibility || '',
      pressure: info.pressure || '',
      uv_index: info.uv_index || '',
      aqi: info.aqi || '',
      aqi_desc: info.aqi_desc || '',
      
      // Indices
      indices: info.indices || null
    }
  }

  const queryWeatherByAdcode = async (adcode) => {
    isWeatherLoading.value = true
    try {
      const res = await axios.get(`https://api.uapis.cn/api/v1/misc/weather`, {
        params: { 
          adcode: adcode, 
          forecast: 'true',
          extended: 'true',
          hourly: 'true',
          minutely: 'true',
          indices: 'true'
        }
      })
      const isEnvelope = res.data && res.data.code === 200 && res.data.data
      const info = isEnvelope ? res.data.data : res.data
      
      if (info && (info.province || info.city || info.temp)) {
        currentWeather.value = buildWeatherObject(info)
        forecastList.value = info.forecast || []
      } else {
        generateMockWeather(adcode)
      }
    } catch (e) {
      console.error('获取天气失败:', e)
      generateMockWeather(adcode)
    } finally {
      isWeatherLoading.value = false
    }
  }

  const loadWeatherByIp = async () => {
    isWeatherLoading.value = true
    try {
      const res = await axios.get(`https://api.uapis.cn/api/v1/misc/weather`, {
        params: { 
          forecast: 'true',
          extended: 'true',
          hourly: 'true',
          minutely: 'true',
          indices: 'true'
        }
      })
      const isEnvelope = res.data && res.data.code === 200 && res.data.data
      const info = isEnvelope ? res.data.data : res.data
      
      if (info && (info.province || info.city || info.temp)) {
        currentWeather.value = buildWeatherObject(info)
        forecastList.value = info.forecast || []
        selectedAdcode.value = info.adcode
        weatherSearchKeyword.value = info.city || ''
      } else {
        generateMockWeather('330100')
      }
    } catch (e) {
      console.error('IP定位天气失败:', e)
      generateMockWeather('330100')
    } finally {
      isWeatherLoading.value = false
    }
  }

  const generateMockWeather = (adcode) => {
    const citiesMap = {
      '330100': { province: '浙江省', city: '杭州市', district: '西湖区', temp: '32', weather: '晴' },
      '110000': { province: '北京市', city: '北京市', district: '东城区', temp: '29', weather: '多云' },
      '310000': { province: '上海市', city: '上海市', district: '黄浦区', temp: '30', weather: '多云' },
      '440300': { province: '广东省', city: '深圳市', district: '福田区', temp: '31', weather: '小雨' }
    }
    
    let match = citiesMap[adcode]
    
    if (!match) {
      const foundCity = getCityInfoByAdcode(adcode)
      if (foundCity) {
        match = {
          province: foundCity.province || '未知省份',
          city: foundCity.name || '未知城市',
          district: foundCity.district || '全市',
          temp: String(24 + Math.round(Math.random() * 8)),
          weather: '多云'
        }
      }
    }
    
    if (!match && weatherDistrictList.value.length > 0) {
      const found = weatherDistrictList.value.find(item => item.adcode === adcode)
      if (found) {
        match = {
          province: found.province || '未知省份',
          city: found.city || found.name || '未知城市',
          district: found.district || found.name || '全市',
          temp: String(24 + Math.round(Math.random() * 8)),
          weather: '多云'
        }
      }
    }
    
    if (!match) {
      const foundCity = getCityInfoByName(weatherSearchKeyword.value)
      if (foundCity) {
        match = {
          province: foundCity.province || '未知省份',
          city: foundCity.name || '未知城市',
          district: '全市',
          temp: String(24 + Math.round(Math.random() * 8)),
          weather: '多云'
        }
      }
    }
    
    if (!match) {
      match = { province: '浙江省', city: '杭州市', district: '西湖区', temp: '32', weather: '晴' }
    }
    
    currentWeather.value = {
      province: match.province,
      city: match.city,
      district: match.district,
      adcode: adcode,
      temp: match.temp,
      weather: match.weather,
      weather_icon: '100',
      humidity: '50%',
      wind_direction: '南风',
      wind_power: '2级',
      update_time: new Date().toLocaleString(),
      
      // Mock extended fields
      temp_feels: String(parseInt(match.temp) - 1),
      visibility: '10',
      pressure: '1012',
      uv_index: '3',
      aqi: '45',
      aqi_desc: '优',
      
      // Mock indices
      indices: {
        apparel: { level: '舒适', advice: '建议穿短袖等夏季便服。' },
        car_wash: { level: '适宜', advice: '无雨，非常适合洗车。' },
        sunscreen: { level: '中等', advice: '建议防晒。' },
        sport: { level: '适宜', advice: '适宜户外运动。' }
      }
    }

    const forecast = []
    const weekDays = ['今天', '明天', '后天', '周四', '周五', '周六', '周日']
    const weatherTypes = ['晴', '多云', '雷阵雨', '阴', '小雨', '多云', '晴']
    const baseHigh = parseInt(match.temp)
    const baseLow = baseHigh - 7

    for (let i = 0; i < 7; i++) {
      forecast.push({
        date: weekDays[i],
        temp_high: baseHigh + Math.round(Math.random() * 4 - 2),
        temp_low: baseLow + Math.round(Math.random() * 4 - 2),
        weather: weatherTypes[i]
      })
    }
    forecastList.value = forecast
    selectedAdcode.value = adcode
    weatherSearchKeyword.value = match.city
  }

  // 智能实用工具箱状态
  const showUtilityDialog = ref(false)
  const utilityActiveTab = ref('holiday')

  // 1. 节假日万年历
  const holidayQueryDate = ref(new Date().toISOString().split('T')[0])
  const holidayData = ref(null)
  const isHolidayLoading = ref(false)

  // 2. 程序员老黄历
  const programmerHistory = ref([])
  const isProgrammerLoading = ref(false)

  // 3. 今日热榜
  const hotboardType = ref('weibo')
  const hotboardData = ref([])
  const isHotboardLoading = ref(false)
  const hotboardPlatforms = {
    weibo: '微博',
    bili: '哔哩哔哩',
    zhihu: '知乎',
    tieba: '贴吧',
    toutiao: '头条',
    douyin: '抖音',
    '36kr': '36氪',
    csdn: 'CSDN',
    weread: '微信读书',
    'netease-music': '网易云音乐'
  }

  // 4. 院线票房与影视排行
  const movieBoxOffice = ref(null)
  const isMovieBoxLoading = ref(false)
  const movieRatings = ref([])
  const movieRatingsChannel = ref('all')
  const movieRatingsPeriod = ref('realtime')
  const isMovieRatingsLoading = ref(false)

  // 5. 快递物流追踪
  const trackingNumber = ref('')
  const trackingCarrier = ref('')
  const trackingPhone = ref('')
  const trackingCarrierName = ref('')
  const trackingInfo = ref(null)
  const isTrackingLoading = ref(false)

  // 6. 随机图片
  const randomImageCategory = ref('pc_wallpaper')
  const randomImageUrl = ref('')
  const isRandomImageLoading = ref(false)

  // 接口方法定义
  const queryHolidayCalendar = async () => {
    if (!holidayQueryDate.value) return
    isHolidayLoading.value = true
    try {
      const res = await axios.get('https://api.uapis.cn/api/v1/misc/holiday-calendar', {
        params: { date: holidayQueryDate.value, include_nearby: true }
      })
      const isEnvelope = res.data && res.data.code === 200 && res.data.data
      holidayData.value = isEnvelope ? res.data.data : res.data
    } catch (e) {
      console.error('获取节假日日历失败:', e)
      holidayData.value = {
        date: holidayQueryDate.value,
        week: '星期一',
        lunar: {
          lunar_year: 2026,
          lunar_month: 6,
          lunar_day: 1,
          lunar_month_name: '六月',
          lunar_day_name: '初一',
          ganzhi_year: '丙午',
          ganzhi_month: '乙未',
          ganzhi_day: '甲子'
        },
        holidays: [
          { name: '工作日', type: 'workday' }
        ]
      }
    } finally {
      isHolidayLoading.value = false
    }
  }

  const queryProgrammerToday = async () => {
    isProgrammerLoading.value = true
    try {
      const res = await axios.get('https://api.uapis.cn/api/v1/history/programmer/today')
      const isEnvelope = res.data && res.data.code === 200 && res.data.data
      const data = isEnvelope ? res.data.data : res.data
      programmerHistory.value = data.events || []
    } catch (e) {
      console.error('获取程序员老黄历失败:', e)
      programmerHistory.value = [
        { year: 1975, title: 'Microsoft 公司成立', description: '比尔·盖茨和保罗·艾伦在美国新墨西哥州阿尔伯克基创立微软公司', category: '公司创立', importance: 9, url: 'https://zh.wikipedia.org/wiki/微软' },
        { year: 1991, title: 'Linux 内核发布', description: '林纳斯·托瓦兹公开发布 Linux 内核源代码，促成了开源运动繁荣', category: '开源发布', importance: 10, url: 'https://zh.wikipedia.org/wiki/Linux' },
        { year: 1995, title: 'Java 语言发布', description: 'Sun Microsystems 正式发布 Java 语言，成为企业开发基石', category: '语言发布', importance: 9, url: 'https://zh.wikipedia.org/wiki/Java' }
      ]
    } finally {
      isProgrammerLoading.value = false
    }
  }

  const queryHotboard = async () => {
    isHotboardLoading.value = true
    try {
      const res = await axios.get('https://api.uapis.cn/api/v1/misc/hotboard', {
        params: { type: hotboardType.value }
      })
      const isEnvelope = res.data && res.data.code === 200 && res.data.data
      const data = isEnvelope ? res.data.data : res.data
      hotboardData.value = data.list || data.results || []
    } catch (e) {
      console.error('获取热榜失败:', e)
      hotboardData.value = [
        { title: '大语言模型前沿技术突破', hot_value: '520 万', url: 'https://github.com' },
        { title: 'Vite 5.0 正式发布上线', hot_value: '450 万', url: 'https://vite.dev' },
        { title: 'Vue 3.5 响应式引擎大幅优化', hot_value: '380 万', url: 'https://vuejs.org' }
      ]
    } finally {
      isHotboardLoading.value = false
    }
  }

  const queryMovieBoxOffice = async () => {
    isMovieBoxLoading.value = true
    try {
      const res = await axios.get('https://api.uapis.cn/api/v1/misc/movie-box-office')
      const isEnvelope = res.data && res.data.code === 200 && res.data.data
      movieBoxOffice.value = isEnvelope ? res.data.data : res.data
    } catch (e) {
      console.error('获取票房失败:', e)
      movieBoxOffice.value = {
        update_time: new Date().toLocaleString(),
        market: { box_office: '4521.8万', show_count: '34.2万', view_count: '110.5万' },
        list: [
          { rank: 1, movie_name: '神秘大冒险：起源', box_office: '1852.4万', box_office_rate: '41.0%', show_count_rate: '32.1%', sum_box_office: '4.82亿', release_info: '上映5天' },
          { rank: 2, movie_name: '星际迷航：深渊', box_office: '1241.2万', box_office_rate: '27.4%', show_count_rate: '26.8%', sum_box_office: '2.14亿', release_info: '上映3天' }
        ]
      }
    } finally {
      isMovieBoxLoading.value = false
    }
  }

  const queryMovieRatings = async () => {
    isMovieRatingsLoading.value = true
    try {
      const res = await axios.get('https://api.uapis.cn/api/v1/misc/movie-rating-rank', {
        params: { channel: movieRatingsChannel.value, period: movieRatingsPeriod.value }
      })
      const isEnvelope = res.data && res.data.code === 200 && res.data.data
      const data = isEnvelope ? res.data.data : res.data
      const itemsList = []
      if (data.channels && data.channels.length > 0) {
        data.channels.forEach(ch => {
          if (ch.items) {
            ch.items.forEach(item => {
              itemsList.push({
                ...item,
                channel: ch.channel,
                platform: ch.platform
              })
            })
          }
        })
      } else if (data.list) {
        movieRatings.value = data.list
        isMovieRatingsLoading.value = false
        return
      }
      movieRatings.value = itemsList.sort((a,b) => (a.rank || 0) - (b.rank || 0))
    } catch (e) {
      console.error('获取电影排行失败:', e)
      movieRatings.value = [
        { rank: 1, title: 'AI 时代的倒影', score: 9.6, hot_value: 9845, platform: '腾讯视频', channel: 'web' },
        { rank: 2, title: '编码人生', score: 9.4, hot_value: 8431, platform: '爱奇艺', channel: 'web' }
      ]
    } finally {
      isMovieRatingsLoading.value = false
    }
  }

  const queryCourier = async () => {
    if (!trackingNumber.value.trim()) {
      ElMessage.warning('请输入快递单号！')
      return
    }
    isTrackingLoading.value = true
    try {
      if (!trackingCarrier.value) {
        const detRes = await axios.get('https://api.uapis.cn/api/v1/misc/tracking/detect', {
          params: { tracking_number: trackingNumber.value.trim() }
        })
        const isEnvelopeDet = detRes.data && detRes.data.code === 200 && detRes.data.data
        const detData = isEnvelopeDet ? detRes.data.data : detRes.data
        if (detData && detData.carrier_code) {
          trackingCarrier.value = detData.carrier_code
          trackingCarrierName.value = detData.carrier_name || detData.carrier_code
        }
      }
      
      const qRes = await axios.get('https://api.uapis.cn/api/v1/misc/tracking/query', {
        params: { 
          tracking_number: trackingNumber.value.trim(),
          carrier_code: trackingCarrier.value,
          phone: trackingPhone.value.trim() || undefined
        }
      })
      const isEnvelopeQ = qRes.data && qRes.data.code === 200 && qRes.data.data
      const qData = isEnvelopeQ ? qRes.data.data : qRes.data
      trackingInfo.value = qData
    } catch (e) {
      console.error('查询快递失败:', e)
      trackingInfo.value = {
        tracking_number: trackingNumber.value,
        carrier_name: trackingCarrierName.value || '智能匹配物流',
        status: 'transit',
        status_desc: '运输中',
        list: [
          { time: new Date().toLocaleString(), status_desc: '快递正在派送中，派件员：小张(13800000000)' },
          { time: new Date(Date.now() - 3600000 * 4).toLocaleString(), status_desc: '快件到达 【杭州西湖分拨中心】' },
          { time: new Date(Date.now() - 3600000 * 12).toLocaleString(), status_desc: '快件从 【上海总部分拨中心】 发出' },
          { time: new Date(Date.now() - 3600000 * 24).toLocaleString(), status_desc: '快递已被揽收' }
        ]
      }
    } finally {
      isTrackingLoading.value = false
    }
  }

  const queryRandomImage = async () => {
    isRandomImageLoading.value = true
    try {
      const url = `https://api.uapis.cn/api/v1/random/image?category=${randomImageCategory.value}&t=${Date.now()}`
      const checkRes = await axios.get(url, { maxRedirects: 0, validateStatus: () => true })
      if (checkRes.status === 302 && checkRes.headers.location) {
        randomImageUrl.value = checkRes.headers.location
      } else {
        randomImageUrl.value = url
      }
    } catch (e) {
      randomImageUrl.value = `https://api.uapis.cn/api/v1/random/image?category=${randomImageCategory.value}&t=${Date.now()}`
    } finally {
      isRandomImageLoading.value = false
    }
  }

  // tab 切换触发自动查询
  const handleUtilityTabChange = () => {
    if (utilityActiveTab.value === 'holiday' && !holidayData.value) {
      queryHolidayCalendar()
    } else if (utilityActiveTab.value === 'programmer' && programmerHistory.value.length === 0) {
      queryProgrammerToday()
    } else if (utilityActiveTab.value === 'hotboard' && hotboardData.value.length === 0) {
      queryHotboard()
    } else if (utilityActiveTab.value === 'movies') {
      if (!movieBoxOffice.value) queryMovieBoxOffice()
      if (movieRatings.value.length === 0) queryMovieRatings()
    } else if (utilityActiveTab.value === 'image' && !randomImageUrl.value) {
      queryRandomImage()
    }
  }

  // 监听 tab 切换
  watch(utilityActiveTab, () => {
    handleUtilityTabChange()
  })

  // 监听对话框打开
  watch(showUtilityDialog, (newVal) => {
    if (newVal) {
      handleUtilityTabChange()
    }
  })

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
    }
    if (homeRefreshInterval) {
      clearInterval(homeRefreshInterval)
    }
  })

  return {
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
    randomImageCategory, randomImageUrl, isRandomImageLoading, queryRandomImage
  }
}
