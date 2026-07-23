
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
import { requestJinaJson } from './utils/jinaReader'

const UAPIS_API_BASE: string = '/api-uapis'
const AA1_API_BASE: string = '/api-aa1'
const ALAPI_API_BASE: string = '/api-alapi'
const ALAPI_TOKEN: string = import.meta.env.VITE_ALAPI_TOKEN || 'qgqofofvmxtoskffd37omkscobipmn'

function buildUapisUrl(path: string): string {
  return resolveApiUrl(`${UAPIS_API_BASE}${path}`)
}

type ApiQueryValue = string | number | boolean | undefined | null

interface ApiEnvelope {
  code?: string | number
  message?: string
  msg?: string
  data?: unknown
}

function buildQueryString(params?: Record<string, ApiQueryValue>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]: [string, ApiQueryValue]): void => {
    if (value === undefined || value === null || value === '') return
    searchParams.set(key, String(value))
  })
  const query: string = searchParams.toString()
  return query ? `?${query}` : ''
}

function isApiEnvelope(payload: unknown): payload is ApiEnvelope {
  return !!payload && typeof payload === 'object' && 'code' in payload
}

function isSuccessCode(code: string | number | undefined): boolean {
  return code === undefined || code === 200 || code === '200' || code === 0 || code === '0'
}

function assertApiSuccess<T>(payload: T): T {
  if (isApiEnvelope(payload) && !isSuccessCode(payload.code)) {
    throw new Error(payload.message || payload.msg || `接口返回异常：${payload.code}`)
  }
  return payload
}

async function requestUapisJson<T>(path: string, params?: Record<string, ApiQueryValue>): Promise<T> {
  if (import.meta.env.PROD) {
    return assertApiSuccess(await requestJinaJson<T>(`https://uapis.cn${path}${buildQueryString(params)}`))
  }

  const response = await axios.get<T>(buildUapisUrl(path), { params })
  return assertApiSuccess(response.data)
}

function unwrapEnvelope<T>(payload: T | { code?: string | number; data?: T }): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const envelope = payload as { data?: T }
    if (envelope.data) return envelope.data
  }
  return payload as T
}

function buildImageProxyUrl(url: string): string {
  const normalized = url.replace(/^https?:\/\//, '')
  return `https://images.weserv.nl/?url=${encodeURIComponent(normalized)}`
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
      const params = new URLSearchParams({ resolution, format })
      if (date && !random) {
        params.set('date', date)
      }
      if (random) {
        params.set('random', 'true')
      }
      params.set('t', String(Date.now()))
      const realUrl = `https://uapis.cn/bing?${params.toString()}`
      url = isProd ? buildImageProxyUrl(realUrl) : buildUapisUrl(`/bing?${params.toString()}`)
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

  const searchWeatherDistrict = async (): Promise<void> => {
    if (!weatherSearchKeyword.value.trim()) {
      ElMessage.warning('请输入要查询的城市或地区！')
      return
    }
    isWeatherLoading.value = true
    try {
      // 1. Search region by keywords first
      const regionList = unwrapEnvelope(await requestUapisJson<CityInfo[] | { code?: number; data?: CityInfo[] }>('/api/v1/misc/district', {
        keywords: weatherSearchKeyword.value.trim()
      }))
      if (regionList && regionList.length > 0) {
        const primaryMatch = regionList[0]
        
        // 2. Query matched adcode to retrieve the matched region + its sub-districts!
        const subList = unwrapEnvelope(await requestUapisJson<CityInfo[] | { code?: number; data?: CityInfo[] }>('/api/v1/misc/district', {
          adcode: primaryMatch.adcode
        }))
        
        if (subList && subList.length > 0) {
          weatherDistrictList.value = subList
          selectedAdcode.value = subList[0].adcode
          await queryWeatherByAdcode(selectedAdcode.value)
        } else {
          weatherDistrictList.value = regionList
          selectedAdcode.value = primaryMatch.adcode
          await queryWeatherByAdcode(selectedAdcode.value)
        }
      } else {
        weatherDistrictList.value = []
        currentWeather.value = null
        forecastList.value = []
        ElMessage.warning('没有查到匹配地区')
      }
    } catch (e) {
      console.error('查找地区失败:', e)
      weatherDistrictList.value = []
      currentWeather.value = null
      forecastList.value = []
      ElMessage.error(`地区接口暂不可用：${getRequestErrorMessage(e, '请求失败')}`)
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
      temp: info.temp || info.temperature || '',
      weather: info.weather || '',
      weather_icon: info.weather_icon || '100',
      humidity: info.humidity || '',
      wind_direction: info.wind_direction || '南风',
      wind_power: info.wind_power || '2级',
      update_time: info.update_time || info.report_time || info.reporttime || '',
      
      // Extended fields
      temp_feels: info.temp_feels || info.feels_like || '',
      visibility: info.visibility || '',
      pressure: info.pressure || '',
      uv_index: info.uv_index || info.uv || '',
      aqi: info.aqi || '',
      aqi_desc: info.aqi_desc || '',
      
      // Indices
      indices: info.indices || {
        apparel: info.life_indices?.clothing,
        car_wash: info.life_indices?.car_wash,
        sunscreen: info.life_indices?.sunscreen || info.life_indices?.uv,
        sport: info.life_indices?.exercise
      }
    }
  }

  const queryWeatherByAdcode = async (adcode: string): Promise<void> => {
    isWeatherLoading.value = true
    try {
      const info = unwrapEnvelope(await requestUapisJson<Record<string, any> | { code?: number; data?: Record<string, any> }>('/api/v1/misc/weather', {
        adcode: adcode,
        forecast: 'true',
        extended: 'true',
        hourly: 'true',
        minutely: 'true',
        indices: 'true'
      }))
      
      if (info && (info.province || info.city || info.temp || info.temperature)) {
        currentWeather.value = buildWeatherObject(info)
        forecastList.value = info.forecast || []
      } else {
        currentWeather.value = null
        forecastList.value = []
        throw new Error('天气接口未返回有效数据')
      }
    } catch (e) {
      console.error('获取天气失败:', e)
      currentWeather.value = null
      forecastList.value = []
      ElMessage.error(`天气接口暂不可用：${getRequestErrorMessage(e, '请求失败')}`)
    } finally {
      isWeatherLoading.value = false
    }
  }

  const loadWeatherByIp = async (): Promise<void> => {
    isWeatherLoading.value = true
    try {
      const info = unwrapEnvelope(await requestUapisJson<Record<string, any> | { code?: number; data?: Record<string, any> }>('/api/v1/misc/weather', {
        forecast: 'true',
        extended: 'true',
        hourly: 'true',
        minutely: 'true',
        indices: 'true'
      }))
      
      if (info && (info.province || info.city || info.temp || info.temperature)) {
        currentWeather.value = buildWeatherObject(info)
        forecastList.value = info.forecast || []
        selectedAdcode.value = info.adcode
        weatherSearchKeyword.value = info.city || ''
      } else {
        currentWeather.value = null
        forecastList.value = []
        throw new Error('天气接口未返回有效数据')
      }
    } catch (e) {
      console.error('IP定位天气失败:', e)
      currentWeather.value = null
      forecastList.value = []
      ElMessage.error(`天气接口暂不可用：${getRequestErrorMessage(e, '请求失败')}`)
    } finally {
      isWeatherLoading.value = false
    }
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
  const mapHolidayCalendarData = (payload: Record<string, any>): HolidayData => {
    const day = Array.isArray(payload.days) ? payload.days[0] : payload
    return {
      date: day?.date || holidayQueryDate.value,
      week: day?.weekday_cn || day?.week || '',
      lunar: {
        lunar_year: day?.lunar_year || '',
        lunar_month: day?.lunar_month || '',
        lunar_day: day?.lunar_day || '',
        lunar_month_name: day?.lunar_month_name || '',
        lunar_day_name: day?.lunar_day_name || '',
        ganzhi_year: day?.ganzhi_year || '',
        ganzhi_month: day?.ganzhi_month || '',
        ganzhi_day: day?.ganzhi_day || ''
      },
      holidays: payload.holidays || day?.holidays || [],
      nearby: payload.nearby
    }
  }

  const queryHolidayCalendar = async () => {
    if (!holidayQueryDate.value) return
    isHolidayLoading.value = true
    try {
      const data = unwrapEnvelope(await requestUapisJson<Record<string, any> | { code?: number; data?: Record<string, any> }>('/api/v1/misc/holiday-calendar', {
        date: holidayQueryDate.value,
        include_nearby: true
      }))
      holidayData.value = mapHolidayCalendarData(data)
    } catch (e) {
      console.error('获取节假日日历失败:', e)
      holidayData.value = null
      ElMessage.error(`节假日接口暂不可用：${getRequestErrorMessage(e, '请求失败')}`)
    } finally {
      isHolidayLoading.value = false
    }
  }

  const queryProgrammerToday = async () => {
    isProgrammerLoading.value = true
    try {
      const data = unwrapEnvelope(await requestUapisJson<{ events?: ProgrammerHistoryItem[] } | { code?: number; data?: { events?: ProgrammerHistoryItem[] } }>('/api/v1/history/programmer/today'))
      programmerHistory.value = data.events || []
    } catch (e) {
      console.error('获取程序员老黄历失败:', e)
      programmerHistory.value = []
      ElMessage.error(`程序员黄历接口暂不可用：${getRequestErrorMessage(e, '请求失败')}`)
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
          const data = unwrapEnvelope(await requestUapisJson<Record<string, unknown>>('/api/v1/misc/hotboard', { type: 'bili' }))
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
          console.warn('Unable to query OSChina RSS:', message)
          hotboardData.value = []
          throw new Error(message)
        }
      } else if (hotboardType.value === 'juejin-pins') {
        try {
          // Use UApi hotboard for Juejin articles to bypass CORS and get real live Juejin data!
          const data = unwrapEnvelope(await requestUapisJson<Record<string, unknown>>('/api/v1/misc/hotboard', { type: 'juejin' }))
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
          console.warn('Unable to query UApi Juejin:', message)
          hotboardData.value = []
          throw new Error(message)
        }
      } else {
        const data = unwrapEnvelope(await requestUapisJson<Record<string, unknown>>('/api/v1/misc/hotboard', { type: hotboardType.value }))
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
      
      hotboardData.value = []
      ElMessage.error(`热榜接口暂不可用：${getRequestErrorMessage(e, '请求失败')}`)
    } finally {
      isHotboardLoading.value = false
    }
  }

  const queryMovieBoxOffice = async () => {
    isMovieBoxLoading.value = true
    try {
      movieBoxOffice.value = unwrapEnvelope(await requestUapisJson<MovieBoxOffice | { code?: number; data?: MovieBoxOffice }>('/api/v1/misc/movie-box-office'))
    } catch (e) {
      console.error('获取票房失败:', e)
      movieBoxOffice.value = null
      ElMessage.error(`票房接口暂不可用：${getRequestErrorMessage(e, '请求失败')}`)
    } finally {
      isMovieBoxLoading.value = false
    }
  }

  const queryMovieRatings = async () => {
    isMovieRatingsLoading.value = true
    movieRatingsError.value = ''
    try {
      const response = await requestUapisJson<MovieRatingApiResponse>('/api/v1/misc/movie-rating-rank', {
        channel: movieRatingsChannel.value,
        period: movieRatingsPeriod.value
      })

      if (response.code && response.code !== 200) {
        throw new Error(response.message || '影视热度榜接口暂不可用')
      }

      const data: MovieRatingApiPayload | MovieRatingApiResponse = response.data || response
      const itemsList: MovieRatingItem[] = mapMovieRatingResponse(data)

      if (!itemsList.length) {
        throw new Error('当前参数暂无影视热度榜数据')
      }

      movieRatings.value = itemsList
    } catch (e: unknown) {
      console.error('获取电影排行失败:', e)
      movieRatings.value = []
      movieRatingsError.value = `影视热度榜接口暂不可用：${getRequestErrorMessage(e, '请求失败')}`
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
        const detData = unwrapEnvelope(await requestUapisJson<Record<string, string>>('/api/v1/misc/tracking/detect', {
          tracking_number: trackingNumber.value.trim()
        }))
        if (detData && detData.carrier_code) {
          trackingCarrier.value = detData.carrier_code
          trackingCarrierName.value = detData.carrier_name || detData.carrier_code
        }
      }
      
      const qData = unwrapEnvelope(await requestUapisJson<TrackingInfo | { code?: number; data?: TrackingInfo }>('/api/v1/misc/tracking/query', {
        tracking_number: trackingNumber.value.trim(),
        carrier_code: trackingCarrier.value,
        phone: trackingPhone.value.trim() || undefined
      }))
      trackingInfo.value = qData
    } catch (e) {
      console.error('查询快递失败:', e)
      trackingInfo.value = null
      ElMessage.error(`快递接口暂不可用：${getRequestErrorMessage(e, '请求失败')}`)
    } finally {
      isTrackingLoading.value = false
    }
  }

  const queryRandomImage = async () => {
    isRandomImageLoading.value = true
    try {
      const realUrl = `https://uapis.cn/api/v1/random/image?category=${encodeURIComponent(randomImageCategory.value)}&t=${Date.now()}`
      randomImageUrl.value = isProd ? buildImageProxyUrl(realUrl) : buildUapisUrl(`/api/v1/random/image?category=${randomImageCategory.value}&t=${Date.now()}`)
    } catch (e) {
      console.error('获取随机图片失败:', e)
      randomImageUrl.value = ''
      ElMessage.error(`随机图片接口暂不可用：${getRequestErrorMessage(e, '请求失败')}`)
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

  // 5.5 星座运势
  const starActiveName = ref('libra')
  const starActivePeriod = ref<'day' | 'tomorrow' | 'week' | 'month' | 'year'>('day')
  const starHoroscopeData = ref<any>(null)
  const isStarLoading = ref(false)

  const queryStarHoroscope = async () => {
    isStarLoading.value = true
    try {
      const res = await axios.get(buildAlapiUrl('/api/star'), {
        params: {
          token: 'qgqofofvmxtoskffd37omkscobipmn',
          star: starActiveName.value
        }
      })
      if (res.data && (res.data.code === 200 || res.data.success) && res.data.data) {
        starHoroscopeData.value = res.data.data
      } else {
        throw new Error(res.data?.message || '获取星座运势数据失败')
      }
    } catch (e) {
      console.warn('获取星座运势失败，使用本地精选数据:', e)
      starHoroscopeData.value = {
        day: {
          date: new Date().toLocaleDateString('zh-CN'),
          all: '85%',
          love: '88%',
          work: '82%',
          money: '75%',
          health: '90%',
          yi: '团队沟通、制定计划',
          ji: '盲目投资、熬夜加班',
          notice: '保持从容心态',
          lucky_color: '天蓝色',
          lucky_number: 7,
          lucky_star: '双子座',
          all_text: '整体运势呈上佳态势！思维敏捷，适合处理复杂的工作和规划新目标。',
          love_text: '感情运势甜美，沟通顺畅，默契十足。',
          work_text: '工作表现亮眼，能够高效解决此前积压的疑难问题。',
          money_text: '财运平稳，偏财运小有提升，适合合理理财。',
          health_text: '精力充沛，身体状态良好，建议保持规律作息。'
        }
      }
    } finally {
      isStarLoading.value = false
    }
  }

  // 5.6 身份证信息查询与升级
  const idcardQueryNo = ref('')
  const idcardQueryMode = ref<'query' | 'upgrade'>('query')
  const idcardInfoData = ref<any>(null)
  const idcardUpgradeResult = ref<any>(null)
  const isIdcardLoading = ref(false)
  const idcardError = ref('')

  const PROVINCE_MAP: Record<string, string> = {
    '11': '北京市', '12': '天津市', '13': '河北省', '14': '山西省', '15': '内蒙古自治区',
    '21': '辽宁省', '22': '吉林省', '23': '黑龙江省', '31': '上海市', '32': '江苏省',
    '33': '浙江省', '34': '安徽省', '35': '福建省', '36': '江西省', '37': '山东省',
    '41': '河南省', '42': '湖北省', '43': '湖南省', '44': '广东省', '45': '广西壮族自治区',
    '46': '海南省', '50': '重庆市', '51': '四川省', '52': '贵州省', '53': '云南省',
    '54': '西藏自治区', '61': '陕西省', '62': '甘肃省', '63': '青海省', '64': '宁夏回族自治区',
    '65': '新疆维吾尔自治区', '71': '台湾省', '81': '香港特别行政区', '82': '澳门特别行政区'
  }

  const upgradeIdCardFallback = (id15: string): string | null => {
    if (!/^\d{15}$/.test(id15)) return null
    const first17 = id15.substring(0, 6) + '19' + id15.substring(6)
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += parseInt(first17[i]) * weights[i]
    }
    return first17 + checkCodes[sum % 11]
  }

  const parseIdCardFallback = (idStr: string): any | null => {
    let card = idStr.toUpperCase()
    if (card.length === 15) {
      const upgraded = upgradeIdCardFallback(card)
      if (!upgraded) return null
      card = upgraded
    }
    if (!/^\d{17}[\dX]$/.test(card)) return null

    const provCode = card.substring(0, 2)
    const province = PROVINCE_MAP[provCode] || '全国未知行政区'
    const yearStr = card.substring(6, 10)
    const monthStr = card.substring(10, 12)
    const dayStr = card.substring(12, 14)
    const year = parseInt(yearStr)
    const month = parseInt(monthStr)
    const day = parseInt(dayStr)

    const sexDigit = parseInt(card.substring(16, 17))
    const sex = sexDigit % 2 === 1 ? 1 : 0
    const currentYear = new Date().getFullYear()
    const age = currentYear - year

    const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
    const zodiac = zodiacs[(year - 4) % 12] || ''

    const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22]
    const consts = ['摩羯座', '水瓶座', '双鱼座', '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座']
    const constellation = day < dates[month - 1] ? consts[month - 1] : consts[month]

    return {
      address_code: card.substring(0, 6),
      province,
      city: province,
      county: '',
      address: province,
      birthday: `${yearStr}-${monthStr}-${dayStr}`,
      constellation,
      zodiac,
      sex,
      length: card.length,
      age
    }
  }

  const queryIdCard = async () => {
    const inputNo = idcardQueryNo.value.trim()
    if (!inputNo) {
      ElMessage.warning('请输入身份证号码')
      return
    }

    isIdcardLoading.value = true
    idcardError.value = ''

    // 1. 尝试查询归属地信息
    try {
      const res = await axios.get(buildAlapiUrl('/api/idcard'), {
        params: {
          token: 'qgqofofvmxtoskffd37omkscobipmn',
          id: inputNo
        }
      })
      if (res.data && (res.data.code === 200 || res.data.success) && res.data.data) {
        idcardInfoData.value = res.data.data
      }
    } catch (e) {
      console.warn('调用 ALAPI idcard 失败，尝试本地智能解析:', e)
    }

    // 2. 如果是 15 位身份证，尝试升级接口
    if (inputNo.length === 15) {
      try {
        const upgradeRes = await axios.get(buildAlapiUrl('/api/idcard/upgrade'), {
          params: {
            token: 'qgqofofvmxtoskffd37omkscobipmn',
            id: inputNo
          }
        })
        if (upgradeRes.data && (upgradeRes.data.code === 200 || upgradeRes.data.success) && upgradeRes.data.data) {
          idcardUpgradeResult.value = upgradeRes.data.data
        }
      } catch (e) {
        console.warn('调用 ALAPI upgrade 失败，使用本地升位:', e)
        const upgraded = upgradeIdCardFallback(inputNo)
        if (upgraded) {
          idcardUpgradeResult.value = { id: inputNo, new_id: upgraded }
        }
      }
    } else {
      // 18位身份号码无须升级
      idcardUpgradeResult.value = null
    }

    // 3. 智能本地解析兜底
    if (!idcardInfoData.value) {
      const fallback = parseIdCardFallback(inputNo)
      if (fallback) {
        idcardInfoData.value = fallback
      }
    }
    if (inputNo.length === 15 && !idcardUpgradeResult.value) {
      const upgraded = upgradeIdCardFallback(inputNo)
      if (upgraded) {
        idcardUpgradeResult.value = { id: inputNo, new_id: upgraded }
      }
    }

    if (!idcardInfoData.value && !idcardUpgradeResult.value) {
      idcardError.value = '身份证号码不合法，请输入正确格式'
    }

    isIdcardLoading.value = false
  }

  // 5.7 英雄联盟手游国服数据
  const lolmSelectedDan = ref('1')
  const lolmSelectedPosition = ref('all')
  const lolmSearchKeyword = ref('')
  const lolmRankData = ref<any>(null)
  const isLolmLoading = ref(false)

  const queryLolmData = async () => {
    isLolmLoading.value = true
    try {
      const heroListUrl = 'https://game.gtimg.cn/images/lgamem/act/lrlib/js/heroList/hero_list.js'
      const rankListUrl = buildAlapiUrl('/api/lolm/go/lgame_battle_info/hero_rank_list_v2')

      const [heroRes, rankRes] = await Promise.all([
        axios.get(heroListUrl).catch(() => ({ data: { heroList: {} } })),
        axios.get(rankListUrl).catch(() => ({ data: { data: null } }))
      ])

      const heroMap = heroRes.data?.heroList || {}
      const rankData = rankRes.data?.data

      if (!rankData) throw new Error('未获取到 LOLM 榜单数据')

      const parsed: Record<string, Record<string, any[]>> = {}
      for (const danKey of Object.keys(rankData)) {
        parsed[danKey] = {}
        const placeMap = rankData[danKey] || {}
        for (const posKey of Object.keys(placeMap)) {
          const list = placeMap[posKey] || []
          parsed[danKey][posKey] = list.map((item: any) => {
            const meta = heroMap[item.hero_id] || {}
            return {
              heroId: item.hero_id,
              name: meta.name || '英雄',
              title: meta.title || '英雄联盟',
              avatar: meta.avatar || `https://game.gtimg.cn/images/lgamem/act/lrlib/img/HeadIcon/H_S_${item.hero_id}.png`,
              position: item.position || posKey,
              winRateNum: parseFloat(item.win_rate_percent || item.win_rate || '0'),
              appearRateNum: parseFloat(item.appear_rate_percent || item.appear_rate || '0'),
              forbidRateNum: parseFloat(item.forbid_rate_percent || item.forbid_rate || '0'),
              winRatePercent: `${item.win_rate_percent || '0'}%`,
              appearRatePercent: `${item.appear_rate_percent || '0'}%`,
              forbidRatePercent: `${item.forbid_rate_percent || '0'}%`,
              dtstatdate: item.dtstatdate || ''
            }
          })
        }
      }
      lolmRankData.value = parsed
    } catch (e) {
      console.warn('获取 LOLM 国服数据失败，使用样本数据:', e)
      const sample = [
        { heroId: '10041', name: '凯尔', title: '正义天使', avatar: 'https://game.gtimg.cn/images/lgamem/act/lrlib/img/HeadIcon/H_S_10041.png', winRateNum: 55.08, appearRateNum: 2.87, forbidRateNum: 0.27, winRatePercent: '55.08%', appearRatePercent: '2.87%', forbidRatePercent: '0.27%' },
        { heroId: '10010', name: '薇恩', title: '暗夜猎手', avatar: 'https://game.gtimg.cn/images/lgamem/act/lrlib/img/HeadIcon/H_S_10010.png', winRateNum: 52.99, appearRateNum: 1.86, forbidRateNum: 6.12, winRatePercent: '52.99%', appearRatePercent: '1.86%', forbidRatePercent: '6.12%' },
        { heroId: '10069', name: '永恩', title: '封魔剑魂', avatar: 'https://game.gtimg.cn/images/lgamem/act/lrlib/img/HeadIcon/H_S_10069.png', winRateNum: 52.94, appearRateNum: 7.53, forbidRateNum: 3.50, winRatePercent: '52.94%', appearRatePercent: '7.53%', forbidRatePercent: '3.50%' },
        { heroId: '10046', name: '提莫', title: '迅捷斥候', avatar: 'https://game.gtimg.cn/images/lgamem/act/lrlib/img/HeadIcon/H_S_10046.png', winRateNum: 52.27, appearRateNum: 4.37, forbidRateNum: 13.04, winRatePercent: '52.27%', appearRatePercent: '4.37%', forbidRatePercent: '13.04%' }
      ]
      const fallback: Record<string, Record<string, any[]>> = {}
      for (const d of ['1', '2', '3', '4']) {
        fallback[d] = { '1': sample, '2': sample, '3': sample, '4': sample, '5': sample }
      }
      lolmRankData.value = fallback
    } finally {
      isLolmLoading.value = false
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
      currentPhotoUrl.value = ''
      ElMessage.error(`写真接口暂不可用：${getRequestErrorMessage(e, '请求失败')}`)
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
      dujitangText.value = ''
      ElMessage.error(`毒鸡汤接口暂不可用：${getRequestErrorMessage(e, '请求失败')}`)
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
      const data = await requestUapisJson<QqUserInfo & { code?: number; message?: string }>('/api/v1/social/qq/userinfo', { qq: qqNumber.value })
      if (data) {
        if (data.code && data.code !== 200) {
          qqError.value = data.message || '查询失败，未找到该QQ信息'
        } else {
          qqUserInfo.value = data
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
    } else if (utilityActiveTab.value === 'star' && !starHoroscopeData.value) {
      queryStarHoroscope()
    } else if (utilityActiveTab.value === 'lolm' && !lolmRankData.value) {
      queryLolmData()
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
    starActiveName, starActivePeriod, starHoroscopeData, isStarLoading, queryStarHoroscope,
    idcardQueryNo, idcardQueryMode, idcardInfoData, idcardUpgradeResult, isIdcardLoading, idcardError, queryIdCard,
    lolmSelectedDan, lolmSelectedPosition, lolmSearchKeyword, lolmRankData, isLolmLoading, queryLolmData,
    
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
