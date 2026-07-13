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
    searchWeatherDistrict, queryWeatherByAdcode, loadWeatherByIp, getCityInfoByName
  }
}
