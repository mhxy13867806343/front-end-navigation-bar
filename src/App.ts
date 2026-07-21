
import axios from 'axios'
import { menuItemsList, authorWorksList, onlineWorksList } from '@/utlis/menuItems'
import chinaCitiesAz from '@/ajson/china-cities-az.json'
import { ElDialog, ElMessageBox, ElMessage } from 'element-plus'
import { Message, Timer } from '@element-plus/icons-vue'
import type { Component } from 'vue'
import type { NavigationCategory, ToolItem, WorkItem } from '@/types/navigation'
import type {
  AppWorkItem,
  CityInfo,
  CityLetterMap,
  ContextMenuState,
  CurrentWeather,
  HolidayData,
  HotboardItem,
  MovieBoxOffice,
  MovieRatingItem,
  ProgrammerHistoryItem,
  SubTabMap,
  TrackingInfo,
  WeatherForecast,
  QqUserInfo,
  BlessingTickerItem,
  OneDailyItem,
  ZaobaoData,
  ZhihuComment,
  ZhihuCommentsData,
  ZhihuDailyData,
  ZhihuDailyDetail,
  ZhihuDailyStory
} from '@/types/app'

// Custom Components
import { getComponentByType } from './utils/componentMapper'
import { BING_DOMAINS, GLOBAL_CONFIG } from './utils/aglobal-xx'
import { ZH_TEXTS } from './utils/azh'

// Composables
import { useTheme } from './composables/useTheme'
import { useSystemInfo } from './composables/useSystemInfo'
import { useLikes } from './composables/useLikes'
import { useDatabase } from './composables/useDatabase'
import { useSearch } from './composables/useSearch'
import { useRandomWebsites } from './composables/useRandomWebsites'
import { resolveApiUrl } from './utils/resolveApiUrl'

const UAPIS_API_BASE: string = '/api-uapis'
const AA1_API_BASE: string = '/api-aa1'
const ALAPI_API_BASE: string = '/api-alapi'
const ALAPI_TOKEN: string = import.meta.env.VITE_ALAPI_TOKEN || ''

function buildUapisUrl(path: string): string {
  return resolveApiUrl(`${UAPIS_API_BASE}${path}`)
}

function buildAa1Url(path: string): string {
  return resolveApiUrl(`${AA1_API_BASE}${path}`)
}

function buildAlapiUrl(path: string): string {
  return resolveApiUrl(`${ALAPI_API_BASE}${path}`)
}

interface AlapiResponse<T> {
  code?: number
  success?: boolean
  message?: string
  data?: T
}

interface Aa1BilibiliHotItem {
  title?: string
  heat?: string | number
  link?: string
}

interface Aa1BilibiliHotResponse {
  code?: number
  msg?: string
  time?: string
  data?: Aa1BilibiliHotItem[]
}

interface MovieRatingApiItem {
  rank?: number
  name?: string
  title?: string
  channel?: string
  platform?: string
  metric?: string | number
  metric_rate?: string | number
  score?: string | number
  hot_value?: string | number
  release_info?: string
  detail_url?: string
  url?: string
}

interface MovieRatingApiGroup {
  channel?: string
  channel_desc?: string
  metric_label?: string
  list?: MovieRatingApiItem[]
  items?: MovieRatingApiItem[]
}

interface MovieRatingApiResponse {
  code?: number | string
  message?: string
  data?: MovieRatingApiPayload
  groups?: MovieRatingApiGroup[]
  channels?: MovieRatingApiGroup[]
  list?: MovieRatingApiItem[]
  results?: MovieRatingApiItem[]
}

interface MovieRatingApiPayload {
  groups?: MovieRatingApiGroup[]
  channels?: MovieRatingApiGroup[]
  list?: MovieRatingApiItem[]
  results?: MovieRatingApiItem[]
}

export function useAppLogic() {
  // 环境判断
  const isProd = import.meta.env.PROD

  // 数据库逻辑
  const { menuItems, isHomeLive, isHomeLoading, fetchHomeDatabase } = useDatabase()

  // 主题逻辑
  const { isDarkMode, showThemeDropdown, toggleTheme, toggleThemeDropdown } = useTheme()

  // 收藏点赞逻辑
  const { likedItemsInfo, showLikeHistory, isLiked, toggleLike, likedToolsList, clearAllLikes } = useLikes(menuItems)

  const openLikeHistory = (): void => {
    showLikeHistory.value = true
  }

  // 菜单分类状态
  const activeItem = ref<number | string>(parseInt(localStorage.getItem('activeItem') || '1') || 1)
  const isSidebarOpen = ref(true)
  const activeSubTabs = ref<SubTabMap>({
    1: 'china',        // Category 1: AI聊天助手. Options: 'china', 'overseas'
    9: 'agents',       // Category 9: AI智能体. Options: 'agents', 'skills'
    16: 'traditional'  // Category 16: IDE工具. Options: 'traditional', 'ai'
  })
  const showAuthorDropdown = ref(false)
  const showOnlineWorksDropdown = ref(false)
  const authorWorks = ref<WorkItem[]>(authorWorksList)
  const onlineWorks = ref<WorkItem[]>(onlineWorksList)
  const showDrawer = ref(false)
  const isAuthorWorksExpanded = ref(false)
  const isOnlineWorksExpanded = ref(false)
  const isNewsActive = ref(false)
  const isAppStoreActive = ref(false)
  const isArticlesListActive = ref(false)
  const articlesListType = ref<string>('tutorials')
  const activeLibrary = ref<string>('element')

  const gridCols = ref<number>(parseInt(localStorage.getItem('gridCols') || '3') || 3)
  const setGridCols = (cols: number): void => {
    gridCols.value = cols
    localStorage.setItem('gridCols', cols.toString())
  }

  const dialogGridCols = computed<number>(() => {
    const maxCols: number = Math.min(5, likedToolsList.value.length || 1)
    return Math.min(gridCols.value, maxCols)
  })

  const getActiveCategoryName = (): string => {
    const cat: NavigationCategory | undefined = menuItems.value.find((c: NavigationCategory): boolean => c.id === activeItem.value)
    return cat ? cat.name : '全部'
  }

  const showNewsTimeline = (): void => {
    isNewsActive.value = true
    isAppStoreActive.value = false
    isArticlesListActive.value = false
  }
  const showAppStore = (): void => {
    isAppStoreActive.value = true
    isNewsActive.value = false
    isArticlesListActive.value = false
  }
  const showArticlesList = (type: string): void => {
    articlesListType.value = type
    isArticlesListActive.value = true
    isNewsActive.value = false
    isAppStoreActive.value = false
  }
  const showAboutDialog = ref(false)
  const toggleSidebar = (): void => {
    isSidebarOpen.value = !isSidebarOpen.value
  }
  const aiCategories = computed<NavigationCategory[]>(() => {
    return menuItems.value.filter((item: NavigationCategory): boolean => item.id !== 24 && item.id !== 25)
  })

  const isUrl = (str?: string): boolean => {
    if (!str) return false
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')
  }

  const selectItem = (itemId: number | string): void => {
    activeItem.value = itemId
    activeSubItem.value = null
    isNewsActive.value = false
    isAppStoreActive.value = false
    isArticlesListActive.value = false
    localStorage.setItem('activeItem', itemId.toString())
  }

  const activeSubItem = ref<number | string | null>(null)
  const selectSubItem = (subId: number | string): void => {
    activeSubItem.value = subId
    isNewsActive.value = false
    isAppStoreActive.value = false
    isArticlesListActive.value = false
  }

  const getCurrentTools = (): ToolItem[] => {
    const cat: NavigationCategory | undefined = menuItems.value.find((item: NavigationCategory): boolean => item.id === activeItem.value)
    if (!cat) return []
    
    if (activeSubItem.value && cat.subcategories) {
      const sub = cat.subcategories.find((s): boolean => s.id === activeSubItem.value)
      return sub ? sub.tools : []
    }
    
    if (cat.subcategories) {
      return cat.subcategories.reduce<ToolItem[]>((acc: ToolItem[], sub): ToolItem[] => acc.concat(sub.tools || []), [])
    }
    
    const activeItemNumber: number = Number(activeItem.value)
    if (activeSubTabs.value[activeItemNumber]) {
      const tabValue: string = activeSubTabs.value[activeItemNumber]
      const tools = cat.tools || []
      if (activeItemNumber === 1) {
        const regionMap: Record<string, string> = {
          china: '国内',
          overseas: '国外'
        }
        return tools.filter((t: ToolItem): boolean => t.region === regionMap[tabValue])
      }
      return tools.filter((t: ToolItem): boolean => t.subType === tabValue)
    }
    
    return cat.tools || []
  }

  const openLink = (link?: string): void => {
    if (link) {
      window.open(link, '_blank')
    }
  }

  // 右键上下文菜单
  const contextMenu = ref<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
    tool: null
  })
  const handleRightClick = (event: MouseEvent, tool: ToolItem): void => {
    event.preventDefault()
    contextMenu.value = {
      show: true,
      x: event.clientX,
      y: event.clientY,
      tool
    }
  }
  const closeContextMenu = (): void => {
    contextMenu.value.show = false
  }
  const copyLink = (link?: string): void => {
    const copiedLink: string | undefined = link || contextMenu.value.tool?.link
    if (copiedLink) {
      navigator.clipboard.writeText(copiedLink)
      closeContextMenu()
    }
  }
  const openInNewTab = (): void => {
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
  const showGameDialog = ref<boolean>(false)
  const currentGame = shallowRef<Component | null>(null)
  const gameTitle = ref<string>('')

  const handleCloseDialog = (done: () => void): void => {
    const currentItem: NavigationCategory | undefined = menuItems.value.find((item: NavigationCategory): boolean => item.id === activeItem.value)
    let message = '确定要退出吗？'
    
    if (currentItem && 'type' in currentItem && currentItem.type === 'game') {
      message = '确定要退出游戏吗？'
    } else if (currentItem && 'type' in currentItem && currentItem.type === 'image') {
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

  const openGame = (work: AppWorkItem): void => {
    showGameDialog.value = true
    gameTitle.value = work.name
    currentGame.value = getComponentByType(work.type || '')
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

  const onClickWork = (item: WorkItem): void => {
    window.open(item.link)
  }

  let timer: ReturnType<typeof setInterval> | null = null
  let homeRefreshInterval: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    document.documentElement.classList.toggle('dark', isDarkMode.value)

    document.addEventListener('click', (e: MouseEvent): void => {
      const dropdowns: NodeListOf<Element> = document.querySelectorAll('.dropdown, .nav-h-item')
      let clickedInside: boolean = false
      const target: Node | null = e.target instanceof Node ? e.target : null
      dropdowns.forEach((el: Element): void => {
        if (target && el.contains(target)) {
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

    document.addEventListener('contextmenu', (event: MouseEvent): void => {
      const target: Element | null = event.target instanceof Element ? event.target : null
      const toolCard: Element | null | undefined = target?.closest('.tool-card')
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

    queryOneDaily()
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
      url = buildUapisUrl(`/bing?resolution=${resolution}&format=${format}`)
      if (date && !random) {
        url += `&date=${date}`
      }
      if (random) {
        url += `&random=true`
      }
    } else {
      const { random, resolution } = bingWallpaperForm.value
      if (random) {
        url = resolution === '4k' ? BING_DOMAINS.rand_4k : BING_DOMAINS.rand_1080
      } else {
        url = resolution === '4k' ? BING_DOMAINS.today_4k : BING_DOMAINS.today_1080
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
  const showWeatherDialog = ref<boolean>(false)
  const weatherSearchKeyword = ref<string>('')
  const weatherDistrictList = ref<CityInfo[]>([])
  const selectedAdcode = ref<string>('')
  const currentWeather = ref<CurrentWeather | null>(null)
  const forecastList = ref<WeatherForecast[]>([])
  const isWeatherLoading = ref<boolean>(false)

  const getCityInfoByName = (name: string): CityInfo | null => {
    if (!name) return null
    const cityMap: CityLetterMap = chinaCitiesAz as CityLetterMap
    for (const letter in cityMap) {
      const found: CityInfo | undefined = cityMap[letter].find((c: CityInfo): boolean => c.name.includes(name) || name.includes(c.name))
      if (found) return found
    }
    return null
  }

  const getCityInfoByAdcode = (adcode: string): CityInfo | null => {
    if (!adcode) return null
    const target: string = String(adcode)
    const cityMap: CityLetterMap = chinaCitiesAz as CityLetterMap
    for (const letter in cityMap) {
      const found: CityInfo | undefined = cityMap[letter].find((c: CityInfo): boolean => c.adcode === target)
      if (found) return found
    }
    if (target.length === 6 && !target.endsWith('00')) {
      const parentAdcode = target.slice(0, 4) + '00'
      for (const letter in cityMap) {
        const found: CityInfo | undefined = cityMap[letter].find((c: CityInfo): boolean => c.adcode === parentAdcode)
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

  const fallbackMockSearch = async (): Promise<void> => {
    const kw: string = weatherSearchKeyword.value.trim()
    let matches: CityInfo[] = []
    
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

  const searchWeatherDistrict = async (): Promise<void> => {
    if (!weatherSearchKeyword.value.trim()) {
      ElMessage.warning('请输入要查询的城市或地区！')
      return
    }
    isWeatherLoading.value = true
    try {
      // 1. Search region by keywords first
      const res = await axios.get(buildUapisUrl('/api/v1/misc/district'), {
        params: { keywords: weatherSearchKeyword.value.trim() }
      })
      if (res.data && res.data.code === 200 && res.data.data && res.data.data.length > 0) {
        const primaryMatch = res.data.data[0]
        
        // 2. Query matched adcode to retrieve the matched region + its sub-districts!
        const subRes = await axios.get(buildUapisUrl('/api/v1/misc/district'), {
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

  const buildWeatherObject = (info: Record<string, any>): CurrentWeather => {
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

  const queryWeatherByAdcode = async (adcode: string): Promise<void> => {
    isWeatherLoading.value = true
    try {
      const res = await axios.get(buildUapisUrl('/api/v1/misc/weather'), {
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

  const loadWeatherByIp = async (): Promise<void> => {
    isWeatherLoading.value = true
    try {
      const res = await axios.get(buildUapisUrl('/api/v1/misc/weather'), {
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

  const generateMockWeather = (adcode: string): void => {
    const citiesMap: Record<string, Pick<CurrentWeather, 'province' | 'city' | 'district' | 'temp' | 'weather'>> = {
      '330100': { province: '浙江省', city: '杭州市', district: '西湖区', temp: '32', weather: '晴' },
      '110000': { province: '北京市', city: '北京市', district: '东城区', temp: '29', weather: '多云' },
      '310000': { province: '上海市', city: '上海市', district: '黄浦区', temp: '30', weather: '多云' },
      '440300': { province: '广东省', city: '深圳市', district: '福田区', temp: '31', weather: '小雨' }
    }
    
    let match: Pick<CurrentWeather, 'province' | 'city' | 'district' | 'temp' | 'weather'> | undefined = citiesMap[adcode]
    
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
      const found: CityInfo | undefined = weatherDistrictList.value.find((item: CityInfo): boolean => item.adcode === adcode)
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
      temp_feels: String(parseInt(String(match.temp)) - 1),
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

    const forecast: WeatherForecast[] = []
    const weekDays: string[] = ['今天', '明天', '后天', '周四', '周五', '周六', '周日']
    const weatherTypes: string[] = ['晴', '多云', '雷阵雨', '阴', '小雨', '多云', '晴']
    const baseHigh: number = parseInt(String(match.temp))
    const baseLow: number = baseHigh - 7

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
  const showUtilityDialog = ref<boolean>(false)
  const utilityActiveTab = ref<string>('holiday')

  // 1. 节假日万年历
  const holidayQueryDate = ref<string>(new Date().toISOString().split('T')[0] || '')
  const holidayData = ref<HolidayData | null>(null)
  const isHolidayLoading = ref<boolean>(false)

  // 2. 程序员老黄历
  const programmerHistory = ref<ProgrammerHistoryItem[]>([])
  const isProgrammerLoading = ref<boolean>(false)

  // 3. 今日热榜
  const hotboardType = ref<string>('weibo')
  const hotboardData = ref<HotboardItem[]>([])
  const isHotboardLoading = ref<boolean>(false)
  const hotboardPlatforms: Record<string, string> = {
    weibo: '微博',
    bili: '哔哩哔哩',
    zhihu: '知乎',
    tieba: '贴吧',
    toutiao: '头条',
    douyin: '抖音',
    '36kr': '36氪',
    csdn: 'CSDN',
    weread: '微信读书',
    'netease-music': '网易云音乐',
    oschina: '开源中国',
    'juejin-pins': '掘金沸点',
    v2ex: 'V2EX论坛',
    hellogithub: 'HelloGitHub开源'
  }

  // 4. 院线票房与影视排行
  const movieBoxOffice = ref<MovieBoxOffice | null>(null)
  const isMovieBoxLoading = ref<boolean>(false)
  const movieRatings = ref<MovieRatingItem[]>([])
  const movieRatingsChannel = ref<string>('all')
  const movieRatingsPeriod = ref<string>('realtime')
  const isMovieRatingsLoading = ref<boolean>(false)
  const movieRatingsError = ref<string>('')

  // 5. 快递物流追踪
  const trackingNumber = ref<string>('')
  const trackingCarrier = ref<string>('')
  const trackingPhone = ref<string>('')
  const trackingCarrierName = ref<string>('')
  const trackingInfo = ref<TrackingInfo | null>(null)
  const isTrackingLoading = ref<boolean>(false)

  // 6. 随机图片
  const randomImageCategory = ref<string>('pc_wallpaper')
  const randomImageUrl = ref<string>('')
  const isRandomImageLoading = ref<boolean>(false)

  // 接口方法定义
  const queryHolidayCalendar = async () => {
    if (!holidayQueryDate.value) return
    isHolidayLoading.value = true
    try {
      const res = await axios.get(buildUapisUrl('/api/v1/misc/holiday-calendar'), {
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
      const res = await axios.get(buildUapisUrl('/api/v1/history/programmer/today'))
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
      if (hotboardType.value === 'bili') {
        try {
          const res = await axios.get<Aa1BilibiliHotResponse>(buildAa1Url('/api/bilibili-rs/'))
          if (res.data.code !== 1 || !Array.isArray(res.data.data)) {
            throw new Error(res.data.msg || 'B 站热搜接口返回异常')
          }

          hotboardData.value = res.data.data.map((item: Aa1BilibiliHotItem): HotboardItem => ({
            title: item.title || '未命名热搜',
            url: item.link || 'https://www.bilibili.com',
            hot_value: item.heat || '热门'
          }))
        } catch (e: unknown) {
          const message: string = e instanceof Error ? e.message : String(e)
          console.warn('Unable to query aa1 Bilibili hot search, falling back to UApi:', message)
          const res = await axios.get(buildUapisUrl('/api/v1/misc/hotboard'), {
            params: { type: 'bili' }
          })
          const isEnvelope = res.data && res.data.code === 200 && res.data.data
          const data = isEnvelope ? res.data.data : res.data
          const list = data.list || data.results || []
          hotboardData.value = list.map((item: Record<string, string | number>): HotboardItem => ({
            title: String(item.title),
            url: String(item.url),
            hot_value: item.hot_value || item.hot || '🔥 热门'
          }))
        }
      } else if (hotboardType.value === 'oschina') {
        try {
          const rssUrl = 'https://www.oschina.net/news/rss'
          const res = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`)
          if (res.data && res.data.status === 'ok' && res.data.items) {
            hotboardData.value = res.data.items.map((item: Record<string, string>, idx: number): HotboardItem => ({
              title: item.title,
              url: item.link,
              hot_value: `📰 新闻 (Type:1)`
            }))
          } else {
            throw new Error('OSChina RSS response status is not ok')
          }
        } catch (e) {
          const message: string = e instanceof Error ? e.message : String(e)
          console.warn('Unable to query OSChina RSS, falling back to mock OSChina news:', message)
          hotboardData.value = [
            { title: "openKylin 开放麒麟 2.0 正式版发布！搭载全新一代麒麟桌面 💻", hot_value: "📰 新闻", url: "https://www.oschina.net/news" },
            { title: "Linux 6.10 内核正式发布，带来大量硬件驱动更新 🐧", hot_value: "📰 新闻", url: "https://www.oschina.net/news" },
            { title: "Taro 4.0 正式发布：支持全新编译引擎与多端同构架构 🚀", hot_value: "📰 新闻", url: "https://www.oschina.net/news" },
            { title: "Rust 1.80.0 稳定版发布：带来全新的 Lazy Cell 和 Lazy Lock 🌟", hot_value: "📰 新闻", url: "https://www.oschina.net/news" },
            { title: "Node.js 22.5.0 发布：实验性支持 TypeScript 执行 ⚡", hot_value: "📰 新闻", url: "https://www.oschina.net/news" }
          ]
        }
      } else if (hotboardType.value === 'juejin-pins') {
        try {
          // Use UApi hotboard for Juejin articles to bypass CORS and get real live Juejin data!
          const res = await axios.get(buildUapisUrl('/api/v1/misc/hotboard'), {
            params: { type: 'juejin' }
          })
          const isEnvelope = res.data && res.data.code === 200 && res.data.data
          const data = isEnvelope ? res.data.data : res.data
          const list = data.list || data.results || []
          if (list && list.length > 0) {
            hotboardData.value = list.map((item: Record<string, string | number>): HotboardItem => ({
              title: String(item.title),
              url: String(item.url),
              hot_value: item.hot_value || '🔥 热门'
            }))
          } else {
            throw new Error('Empty list')
          }
        } catch (e) {
          const message: string = e instanceof Error ? e.message : String(e)
          console.warn('Unable to query UApi Juejin, falling back to mock Juejin Pins:', message)
          hotboardData.value = [
            { title: "一切尽在不言中 🤫", hot_value: "🔥 热度: 999", url: "https://juejin.cn/pins" },
            { title: "早上5点多跑步半小时，再学习一个小时，卷死我了！🏃‍♂️", hot_value: "🔥 热度: 852", url: "https://juejin.cn/pins" },
            { title: "写代码时，你最喜欢听什么类型的音乐？🎵", hot_value: "🔥 热度: 763", url: "https://juejin.cn/pins" },
            { title: "Vue3 的 Ref 和 Reactive，到底该用哪一个？🤔", hot_value: "🔥 热度: 641", url: "https://juejin.cn/pins" },
            { title: "今天周五，今晚不加班！祝大家周末愉快！🎉", hot_value: "🔥 热度: 593", url: "https://juejin.cn/pins" }
          ]
        }
      } else {
        const res = await axios.get(buildUapisUrl('/api/v1/misc/hotboard'), {
          params: { type: hotboardType.value }
        })
        const isEnvelope = res.data && res.data.code === 200 && res.data.data
        const data = isEnvelope ? res.data.data : res.data
        hotboardData.value = data.list || data.results || []
      }
    } catch (e) {
      console.error('获取热榜失败，尝试使用小小API备用源:', e)
      try {
        if (hotboardType.value === 'weibo') {
          const resBackup = await axios.get('https://v2.xxapi.cn/api/weibohot')
          if (resBackup.data && resBackup.data.code === 200 && resBackup.data.data) {
            hotboardData.value = resBackup.data.data.map((item: Record<string, string | number>): HotboardItem => ({
              title: String(item.title),
              url: String(item.url),
              hot_value: item.hot || '🔥 热门'
            }))
            return
          }
        } else if (hotboardType.value === 'douyin') {
          const resBackup = await axios.get('https://v2.xxapi.cn/api/douyinhot')
          if (resBackup.data && resBackup.data.code === 200 && resBackup.data.data) {
            hotboardData.value = resBackup.data.data.map((item: Record<string, string | number>): HotboardItem => ({
              title: String(item.title),
              url: String(item.url),
              hot_value: item.hot || '🔥 热门'
            }))
            return
          }
        }
      } catch (backupErr) {
        console.error('备用热榜源获取失败:', backupErr)
      }
      
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
      const res = await axios.get(buildUapisUrl('/api/v1/misc/movie-box-office'))
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
    movieRatingsError.value = ''
    try {
      const res = await axios.get<MovieRatingApiResponse>(buildUapisUrl('/api/v1/misc/movie-rating-rank'), {
        params: { channel: movieRatingsChannel.value, period: movieRatingsPeriod.value }
      })

      if (res.data.code && res.data.code !== 200) {
        throw new Error(res.data.message || '影视热度榜接口暂不可用')
      }

      const data: MovieRatingApiPayload | MovieRatingApiResponse = res.data.data || res.data
      const itemsList: MovieRatingItem[] = mapMovieRatingResponse(data)

      if (!itemsList.length) {
        throw new Error('当前参数暂无影视热度榜数据')
      }

      movieRatings.value = itemsList
    } catch (e: unknown) {
      console.error('获取电影排行失败:', e)
      movieRatings.value = []
      movieRatingsError.value = getRequestErrorMessage(e, '影视热度榜接口暂不可用，请稍后重试')
    } finally {
      isMovieRatingsLoading.value = false
    }
  }

  const mapMovieRatingResponse = (data: MovieRatingApiPayload | MovieRatingApiResponse): MovieRatingItem[] => {
    const groups: MovieRatingApiGroup[] = data.groups || data.channels || []
    if (groups.length > 0) {
      return groups.flatMap((group: MovieRatingApiGroup): MovieRatingItem[] => {
        const list: MovieRatingApiItem[] = group.list || group.items || []
        return list.map((item: MovieRatingApiItem, index: number): MovieRatingItem => {
          return mapMovieRatingItem(item, group, index)
        })
      }).sort((a: MovieRatingItem, b: MovieRatingItem): number => (a.rank || 0) - (b.rank || 0))
    }

    const list: MovieRatingApiItem[] = data.list || data.results || []
    return list.map((item: MovieRatingApiItem, index: number): MovieRatingItem => {
      return mapMovieRatingItem(item, undefined, index)
    })
  }

  const mapMovieRatingItem = (
    item: MovieRatingApiItem,
    group: MovieRatingApiGroup | undefined,
    index: number
  ): MovieRatingItem => {
    const metricValue: string | number | undefined = item.score || item.hot_value || item.metric
    return {
      rank: item.rank || index + 1,
      title: item.title || item.name || '未命名影视',
      score: item.score,
      hot_value: metricValue,
      platform: item.platform || item.channel || group?.channel_desc || group?.channel || '',
      channel: group?.channel || item.channel || '',
      url: item.detail_url || item.url
    }
  }

  const getRequestErrorMessage = (e: unknown, fallback: string): string => {
    if (axios.isAxiosError(e)) {
      const data = e.response?.data as { message?: string; code?: string | number } | undefined
      return data?.message || e.message || fallback
    }
    return e instanceof Error ? e.message : fallback
  }

  const queryCourier = async () => {
    if (!trackingNumber.value.trim()) {
      ElMessage.warning('请输入快递单号！')
      return
    }
    isTrackingLoading.value = true
    try {
      if (!trackingCarrier.value) {
        const detRes = await axios.get(buildUapisUrl('/api/v1/misc/tracking/detect'), {
          params: { tracking_number: trackingNumber.value.trim() }
        })
        const isEnvelopeDet = detRes.data && detRes.data.code === 200 && detRes.data.data
        const detData = isEnvelopeDet ? detRes.data.data : detRes.data
        if (detData && detData.carrier_code) {
          trackingCarrier.value = detData.carrier_code
          trackingCarrierName.value = detData.carrier_name || detData.carrier_code
        }
      }
      
      const qRes = await axios.get(buildUapisUrl('/api/v1/misc/tracking/query'), {
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
      const url = buildUapisUrl(`/api/v1/random/image?category=${randomImageCategory.value}&t=${Date.now()}`)
      const checkRes = await axios.get(url, { maxRedirects: 0, validateStatus: () => true })
      if (checkRes.status === 302 && checkRes.headers.location) {
        randomImageUrl.value = checkRes.headers.location
      } else {
        randomImageUrl.value = url
      }
    } catch (e) {
      randomImageUrl.value = buildUapisUrl(`/api/v1/random/image?category=${randomImageCategory.value}&t=${Date.now()}`)
    } finally {
      isRandomImageLoading.value = false
    }
  }

  // 5. 视频与写真探索
  const showVideoDialog = ref(false)
  const videoActiveChannel = ref('sjxjj') // 'sjxjj', 'mp4_xjj', 'photo_meinv', 'photo_baisi'
  const isVideoLoading = ref(false)
  const currentVideoUrl = ref('')
  const currentPhotoUrl = ref('')
  const isPhotoLoading = ref(false)

  const queryNextVideo = async () => {
    isVideoLoading.value = true
    try {
      if (videoActiveChannel.value === 'sjxjj') {
        const res = await axios.get('https://api.kuleu.com/api/sjxjj')
        if (res.data && res.data.code === 200 && res.data.data?.videoUrl) {
          currentVideoUrl.value = res.data.data.videoUrl
        } else {
          currentVideoUrl.value = 'https://api.kuleu.com/api/sjxjj'
        }
      } else {
        const res = await axios.get('https://api.kuleu.com/api/MP4_xiaojiejie?type=json')
        if (res.data && res.data.code === 200 && res.data.mp4_video) {
          currentVideoUrl.value = res.data.mp4_video
        } else {
          currentVideoUrl.value = 'https://api.kuleu.com/api/MP4_xiaojiejie'
        }
      }
    } catch (e) {
      console.error('获取小姐姐视频失败:', e)
      if (videoActiveChannel.value === 'sjxjj') {
        currentVideoUrl.value = `https://api.kuleu.com/api/sjxjj?t=${Date.now()}`
      } else {
        currentVideoUrl.value = `https://api.kuleu.com/api/MP4_xiaojiejie?t=${Date.now()}`
      }
    } finally {
      isVideoLoading.value = false
    }
  }

  const queryNextPhoto = async () => {
    isPhotoLoading.value = true
    try {
      const endpoint = videoActiveChannel.value === 'photo_meinv' 
        ? 'https://v2.xxapi.cn/api/meinvpic' 
        : 'https://v2.xxapi.cn/api/baisi'
      const res = await axios.get(endpoint)
      if (res.data && res.data.code === 200 && res.data.data) {
        currentPhotoUrl.value = res.data.data
      } else {
        throw new Error('Invalid photo response')
      }
    } catch (e) {
      console.error('获取美女图片失败:', e)
      currentPhotoUrl.value = videoActiveChannel.value === 'photo_meinv'
        ? `https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&t=${Date.now()}`
        : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&t=${Date.now()}`
    } finally {
      isPhotoLoading.value = false
    }
  }

  const loadVideoOrPhotoContent = () => {
    if (videoActiveChannel.value.startsWith('photo_')) {
      queryNextPhoto()
    } else {
      queryNextVideo()
    }
  }

  watch(videoActiveChannel, () => {
    if (showVideoDialog.value) {
      loadVideoOrPhotoContent()
    }
  })

  watch(showVideoDialog, (newVal) => {
    if (newVal) {
      loadVideoOrPhotoContent()
    } else {
      currentVideoUrl.value = ''
      currentPhotoUrl.value = ''
    }
  })

  // 6. 毒鸡汤
  const dujitangText = ref('')
  const isDujitangLoading = ref(false)

  const queryDujitang = async () => {
    isDujitangLoading.value = true
    try {
      const res = await axios.get('https://v2.xxapi.cn/api/dujitang')
      if (res.data && res.data.code === 200 && res.data.data) {
        dujitangText.value = res.data.data
      } else {
        throw new Error('Dujitang response invalid')
      }
    } catch (e) {
      console.error('获取毒鸡汤失败:', e)
      dujitangText.value = '有时候你不努力一下，你都不知道什么叫绝望。🍲'
    } finally {
      isDujitangLoading.value = false
    }
  }

  // 7. QQ用户信息查询
  const qqNumber = ref('10001')
  const qqUserInfo = ref<QqUserInfo | null>(null)
  const isQqLoading = ref(false)
  const qqError = ref('')

  const queryQqUserInfo = async () => {
    if (!qqNumber.value || !/^[1-9][0-9]{4,11}$/.test(qqNumber.value)) {
      ElMessage.warning('请输入有效的QQ号(5-12位数字)')
      return
    }
    isQqLoading.value = true
    qqError.value = ''
    qqUserInfo.value = null
    try {
      const res = await axios.get(buildUapisUrl(`/api/v1/social/qq/userinfo?qq=${qqNumber.value}`))
      if (res.data) {
        if (res.data.code && res.data.code !== 200) {
          qqError.value = res.data.message || '查询失败，未找到该QQ信息'
        } else {
          qqUserInfo.value = res.data
        }
      } else {
        throw new Error('Invalid response')
      }
    } catch (e: any) {
      console.error('获取QQ信息失败:', e)
      if (e.response && e.response.data && e.response.data.message) {
        qqError.value = e.response.data.message
      } else {
        qqError.value = '查询失败，请检查网络或稍后再试'
      }
    } finally {
      isQqLoading.value = false
    }
  }

  // 8. 知乎日报
  const formatZhihuDate = (date: Date): string => {
    const year: number = date.getFullYear()
    const month: string = String(date.getMonth() + 1).padStart(2, '0')
    const day: string = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  const zhihuQueryDate = ref<string>(formatZhihuDate(new Date()))
  const zhihuDailyData = ref<ZhihuDailyData | null>(null)
  const selectedZhihuStory = ref<ZhihuDailyStory | null>(null)
  const zhihuStoryDetail = ref<ZhihuDailyDetail | null>(null)
  const zhihuShortComments = ref<ZhihuComment[]>([])
  const zhihuLongComments = ref<ZhihuComment[]>([])
  const isZhihuLoading = ref<boolean>(false)
  const isZhihuDetailLoading = ref<boolean>(false)
  const zhihuError = ref<string>('')

  const mapZhihuStory = (item: Partial<ZhihuDailyStory>): ZhihuDailyStory => {
    return {
      id: Number(item.id || 0),
      url: item.url || '',
      hint: item.hint || '',
      type: item.type || 0,
      title: item.title || '未命名日报',
      images: item.images || (item.image ? [item.image] : []),
      image: item.image || item.images?.[0] || '',
      ga_prefix: item.ga_prefix || '',
      image_hue: item.image_hue || ''
    }
  }

  const getAlapiData = <T>(response: AlapiResponse<T>, fallbackMessage: string): T => {
    if (response.code && response.code !== 200) {
      throw new Error(response.message || fallbackMessage)
    }
    if (!response.data) {
      throw new Error(fallbackMessage)
    }
    return response.data
  }

  const queryZhihuDaily = async (useDate: boolean = false): Promise<void> => {
    isZhihuLoading.value = true
    zhihuError.value = ''
    try {
      const path: string = useDate ? '/api/zhihu/get' : '/api/zhihu'
      const params: Record<string, string> = { token: ALAPI_TOKEN }
      if (useDate) params.date = zhihuQueryDate.value
      const res = await axios.get<AlapiResponse<ZhihuDailyData>>(buildAlapiUrl(path), { params })
      const data: ZhihuDailyData = getAlapiData(res.data, '知乎日报接口暂无数据')
      zhihuDailyData.value = {
        date: data.date,
        stories: (data.stories || []).map(mapZhihuStory),
        top_stories: (data.top_stories || []).map(mapZhihuStory)
      }
      const firstStory: ZhihuDailyStory | undefined = zhihuDailyData.value.stories[0] || zhihuDailyData.value.top_stories?.[0]
      if (firstStory) {
        await queryZhihuStoryDetail(firstStory)
      }
    } catch (e: unknown) {
      zhihuError.value = getRequestErrorMessage(e, '知乎日报接口暂不可用，请稍后再试')
      zhihuDailyData.value = null
      selectedZhihuStory.value = null
      zhihuStoryDetail.value = null
      zhihuShortComments.value = []
      zhihuLongComments.value = []
    } finally {
      isZhihuLoading.value = false
    }
  }

  const queryZhihuStoryDetail = async (story: ZhihuDailyStory): Promise<void> => {
    if (!story.id) return
    selectedZhihuStory.value = story
    isZhihuDetailLoading.value = true
    zhihuStoryDetail.value = null
    zhihuShortComments.value = []
    zhihuLongComments.value = []
    try {
      const params: Record<string, string | number> = { token: ALAPI_TOKEN, id: story.id }
      const [detailRes, shortRes, longRes] = await Promise.all([
        axios.get<AlapiResponse<ZhihuDailyDetail>>(buildAlapiUrl('/api/zhihu/news'), { params }),
        axios.get<AlapiResponse<ZhihuCommentsData>>(buildAlapiUrl('/api/zhihu/short_comments'), { params }),
        axios.get<AlapiResponse<ZhihuCommentsData>>(buildAlapiUrl('/api/zhihu/long_comments'), { params })
      ])

      zhihuStoryDetail.value = getAlapiData(detailRes.data, '知乎日报详情暂无数据')
      zhihuShortComments.value = getAlapiData(shortRes.data, '知乎日报短评暂无数据').comments || []
      zhihuLongComments.value = getAlapiData(longRes.data, '知乎日报长评暂无数据').comments || []
    } catch (e: unknown) {
      zhihuError.value = getRequestErrorMessage(e, '知乎日报详情获取失败，请换一篇试试')
    } finally {
      isZhihuDetailLoading.value = false
    }
  }

  // 底部祝福语滚动播报（ONE 一个：每日一文 / 摄影 / 问答）
  const blessingText: string = `祝您身体健康万事如意，心想事成，${new Date().getFullYear()} 年加油`
  const blessingTickerItems = ref<BlessingTickerItem[]>([{ label: '', text: blessingText }])
  const blessingTickerIndex = ref<number>(0)
  let blessingTickerTimer: ReturnType<typeof setInterval> | null = null

  const stripHtml = (html: string): string => {
    const div: HTMLDivElement = document.createElement('div')
    div.innerHTML = html
    return (div.textContent || '').replace(/\s+/g, ' ').trim()
  }

  const startBlessingTicker = (): void => {
    if (blessingTickerTimer) {
      clearInterval(blessingTickerTimer)
      blessingTickerTimer = null
    }
    if (blessingTickerItems.value.length <= 1) return
    blessingTickerTimer = setInterval((): void => {
      blessingTickerIndex.value = (blessingTickerIndex.value + 1) % blessingTickerItems.value.length
    }, 4000)
  }

  const queryOneDaily = async (date?: string): Promise<void> => {
    try {
      const params: Record<string, string> = { token: ALAPI_TOKEN }
      if (date) params.date = date
      const [oneRes, photoRes, questionRes] = await Promise.allSettled([
        axios.get<AlapiResponse<OneDailyItem>>(buildAlapiUrl('/api/one'), { params }),
        axios.get<AlapiResponse<OneDailyItem>>(buildAlapiUrl('/api/one/photo'), { params }),
        axios.get<AlapiResponse<OneDailyItem>>(buildAlapiUrl('/api/one/question'), { params })
      ])

      const items: BlessingTickerItem[] = [{ label: '', text: blessingText }]

      if (oneRes.status === 'fulfilled' && oneRes.value.data?.data) {
        const one: OneDailyItem = oneRes.value.data.data
        const text: string = [one.title, one.subtitle].filter(Boolean).join(' · ')
        if (text) items.push({ label: '📖 每日一文', text })
      }

      if (photoRes.status === 'fulfilled' && photoRes.value.data?.data) {
        const photo: OneDailyItem = photoRes.value.data.data
        const quote: string = stripHtml(photo.content || '') || [photo.title, photo.subtitle].filter(Boolean).join(' · ')
        if (quote) items.push({ label: '📷 每日摄影', text: quote })
      }

      if (questionRes.status === 'fulfilled' && questionRes.value.data?.data) {
        const question: OneDailyItem = questionRes.value.data.data
        const text: string = [question.title, question.subtitle].filter(Boolean).join(' —— ')
        if (text) items.push({ label: '❓ 每日问答', text })
      }

      blessingTickerItems.value = items
      blessingTickerIndex.value = 0
      startBlessingTicker()
    } catch (e: unknown) {
      console.error('ONE 每日内容获取失败:', e)
    }
  }

  // 9. 每日早报
  const zaobaoData = ref<ZaobaoData | null>(null)
  const isZaobaoLoading = ref<boolean>(false)
  const zaobaoError = ref<string>('')

  const queryZaobao = async (): Promise<void> => {
    isZaobaoLoading.value = true
    zaobaoError.value = ''
    try {
      const params: Record<string, string> = { token: ALAPI_TOKEN, format: 'json' }
      const res = await axios.get<AlapiResponse<ZaobaoData>>(buildAlapiUrl('/api/zaobao'), { params })
      const data: ZaobaoData = getAlapiData(res.data, '每日早报接口暂无数据')
      zaobaoData.value = {
        date: data.date || '',
        news: data.news || [],
        weiyu: data.weiyu || '',
        image: data.image || '',
        audio: data.audio || '',
        head_image: data.head_image || ''
      }
    } catch (e: unknown) {
      zaobaoError.value = getRequestErrorMessage(e, '每日早报接口暂不可用，请稍后再试')
      zaobaoData.value = null
    } finally {
      isZaobaoLoading.value = false
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
    } else if (utilityActiveTab.value === 'dujitang' && !dujitangText.value) {
      queryDujitang()
    } else if (utilityActiveTab.value === 'qq' && !qqUserInfo.value) {
      queryQqUserInfo()
    } else if (utilityActiveTab.value === 'zhihu' && !zhihuDailyData.value) {
      queryZhihuDaily()
    } else if (utilityActiveTab.value === 'zaobao' && !zaobaoData.value) {
      queryZaobao()
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
    if (blessingTickerTimer) {
      clearInterval(blessingTickerTimer)
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
    movieRatings, movieRatingsChannel, movieRatingsPeriod, movieRatingsError, isMovieRatingsLoading, queryMovieRatings,
    trackingNumber, trackingCarrier, trackingPhone, trackingCarrierName, trackingInfo, isTrackingLoading, queryCourier,
    randomImageCategory, randomImageUrl, isRandomImageLoading, queryRandomImage,
    
    // Video & Photo Explorer exports
    showVideoDialog, videoActiveChannel, isVideoLoading, currentVideoUrl, currentPhotoUrl, isPhotoLoading, queryNextVideo, queryNextPhoto,
    
    // Dujitang exports
    dujitangText, isDujitangLoading, queryDujitang,

    // QQ exports
    qqNumber, qqUserInfo, isQqLoading, qqError, queryQqUserInfo,

    // Zhihu Daily exports
    zhihuQueryDate, zhihuDailyData, selectedZhihuStory, zhihuStoryDetail,
    zhihuShortComments, zhihuLongComments, isZhihuLoading, isZhihuDetailLoading, zhihuError,
    queryZhihuDaily, queryZhihuStoryDetail,

    // Zaobao exports
    zaobaoData, isZaobaoLoading, zaobaoError, queryZaobao,

    // Blessing ticker exports (ONE 一个)
    blessingTickerItems, blessingTickerIndex, queryOneDaily,
    
    // Shared globals
    ZH_TEXTS, GLOBAL_CONFIG,
    
    // Components showcase helper state
    activeLibrary
  }
}
