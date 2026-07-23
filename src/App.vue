<script setup lang="ts">
import { useAppLogic } from './App.ts'

// Import components used directly in the template
import AiArticlesList from './components/AiArticlesList.vue'
import AiAppStore from './components/AiAppStore.vue'
import AiNewsTimeline from './components/AiNewsTimeline.vue'
import AlapiBottomMusicPlayer from './components/AlapiBottomMusicPlayer.vue'
import AnalogClock from './components/AnalogClock.vue'
import ApiToolbox from './components/ApiToolbox.vue'
import BrowserSupportNotice from './components/BrowserSupportNotice.vue'
import ComponentShowcase from './components/ComponentShowcase.vue'
import RefreshCountdownButton from './components/RefreshCountdownButton.vue'
import { NBackTop } from 'naive-ui'

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
  blessingTickerItems, blessingTickerIndex,
  
  // Shared configs & state
  ZH_TEXTS, GLOBAL_CONFIG, activeLibrary
} = useAppLogic()

import {
  WALLPAPER_API_OPTIONS,
  RESOLUTION_OPTIONS,
  RANDOM_IMAGE_CATEGORY_OPTIONS,
  MOVIE_CHANNEL_OPTIONS,
  MOVIE_PERIOD_OPTIONS,
  STAR_OPTIONS
} from '@/vue-pages-text-fn-abc/formOptions'

import { useRoute, useRouter } from 'vue-router'
import { Loading, Timer } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import type { CityInfo, CityLetterMap, CascaderNode, CurrentWeather, WeatherForecast } from './types/app'
import chinaCitiesAz from './ajson/china-cities-az.json'
import chinaCascaderOptions from './ajson/china-cascader-options.json'
import versionHistoryData from './ajson/version-history.json'

const route = useRoute()
const router = useRouter()
const goBigScreen = (): void => {
  void router.push('/big-screen')
}
const goMingyan = (): void => {
  void router.push('/mingyan')
}
const goCocoloop = (): void => {
  void router.push('/cocoloop')
}
const goCnblogs = (): void => {
  void router.push('/cnblogs')
}
const goGithubCn = (): void => {
  void router.push('/github-cn')
}
const goBilibiliTrending = (): void => {
  void router.push('/bilibili-trending')
}
const routeViewPaths: string[] = ['/flash', '/aicoding', '/helloworld', '/juejin-theme', '/wechat-featured', '/runcode', '/toolbox', '/weather', '/api-center', '/h5', '/mingyan', '/cocoloop', '/cnblogs', '/github-cn', '/bilibili-trending', '/bilibili-live', '/three-showcase', '/feature', '/web-components', '/oat-ui', '/200', '/401', '/402', '/403', '/404', '/405', '/500', '/permission', '/logs', '/xiaomi-shop']
const isBigScreenRoute = computed<boolean>(() => route.path === '/big-screen' || route.path.endsWith('/big-screen'))
const isDyFormRoute = computed<boolean>(() => route.path === '/' || route.path === '/dyform' || route.path.endsWith('/dyform'))
const isFlashRoute = computed<boolean>(() => !isDyFormRoute.value && !isBigScreenRoute.value)
const isH5DesktopHintRoute = computed<boolean>(() => route.path === '/h5' || route.path.startsWith('/h5/'))
const isHeaderActionsOpen = ref(false)

interface DrawerCloudLink {
  name: string
  platform: string
  url: string
  code: string
  desc: string
}

interface DrawerAiDevTool {
  name: string
  url: string
  desc: string
  recommended: boolean
}

interface VersionHistoryCommit {
  hash: string
  shortHash: string
  date: string
  time: string
  type: string
  title: string
  scope: string
  message: string
}

interface VersionHistoryGroup {
  date: string
  items: VersionHistoryCommit[]
}

interface VersionHistoryData {
  generatedAt: string
  groups: VersionHistoryGroup[]
}

const drawerCloudLinks: DrawerCloudLink[] = [
  {
    name: '百度网盘资料',
    platform: 'Baidu Netdisk',
    url: 'https://pan.baidu.com/s/132vArPzD5szjUrOJmbY0_g?pwd=8cth',
    code: '8cth',
    desc: '通过百度网盘分享的文档数据与资料合集'
  },
  {
    name: '阿里云盘文档数据',
    platform: 'AliPan',
    url: 'https://www.alipan.com/s/WMaKJ2C4Qah',
    code: '95ra',
    desc: '文档数据，可保存到阿里云盘后在线查看'
  },
  {
    name: '123 云盘资料',
    platform: '123Pan',
    url: 'https://1813374361.share.123pan.cn/123pan/N2SUVv-n65jv?pwd=kYHh#',
    code: 'kYHh',
    desc: '123 云盘备用资料入口'
  }
]

const drawerAiDevTools: DrawerAiDevTool[] = [
  {
    name: 'Codex',
    url: 'https://chatgpt.com/codex/',
    recommended: true,
    desc: 'OpenAI 的 AI 编程代理入口，适合代码修改、重构、调试、评审和多步骤工程任务。'
  },
  {
    name: 'TRAE 国际版',
    url: 'https://www.trae.ai/',
    recommended: false,
    desc: '面向 AI 协作开发的工具平台，支持从想法到任务拆解、执行和交付的开发流程。'
  },
  {
    name: 'Devin',
    url: 'https://devin.ai/',
    recommended: false,
    desc: 'Cognition 推出的 AI 软件工程师，偏向团队级任务、代码库理解和自动化开发协作。'
  },
  {
    name: 'Antigravity',
    url: 'https://antigravity.google/',
    recommended: true,
    desc: 'Google 的 agent-first 开发平台，适合用 AI agents 管理、执行和验证复杂开发任务。'
  }
]

const projectRepositoryUrl: string = 'https://github.com/mhxy13867806343/front-end-navigation-bar'
const projectRepositoryName: string = 'mhxy13867806343/front-end-navigation-bar'
const VERSION_HISTORY_SEEN_KEY: string = 'front_end_navigation_version_history_seen'
const ALAPI_PLAYER_STORAGE_KEY: string = 'alapi_bottom_music_player_state'
const ALAPI_PLAYER_SHOW_EVENT: string = 'alapi-player:show'
const ALAPI_PLAYER_HIDE_EVENT: string = 'alapi-player:hide'
const ALAPI_PLAYER_VISIBILITY_CHANGE_EVENT: string = 'alapi-player:visibility-change'
const TERMINAL_CATEGORY_ID = 26
const terminalPreviewLines: string[] = [
  'Last login: Wed Jul 15 11:00:06 on ttys002',
  'You have new mail.',
  '$ brew install --cask warp',
  '$ npm install @xterm/xterm',
  '$ starship init zsh'
]
const versionHistory: VersionHistoryData = versionHistoryData as VersionHistoryData
const showVersionHistoryDialog = ref<boolean>(false)
const versionHistoryActiveTab = ref<string>('feature')
const versionFeatureActiveDates = ref<string[]>(versionHistory.groups.slice(0, 2).map((group: VersionHistoryGroup): string => group.date))
const versionCodeActiveDates = ref<string[]>(versionHistory.groups.slice(0, 2).map((group: VersionHistoryGroup): string => group.date))
const isAlapiPlayerVisible = ref<boolean>(true)
const versionHistoryGroups = computed<VersionHistoryGroup[]>((): VersionHistoryGroup[] => versionHistory.groups)
const syncRouteCategory = (): void => {
  if (route.path === '/terminal') {
    activeItem.value = 26
    activeSubItem.value = null
    isNewsActive.value = false
    isAppStoreActive.value = false
    isArticlesListActive.value = false
    localStorage.setItem('activeItem', TERMINAL_CATEGORY_ID.toString())
  }
}
const filterVersionGroups = (predicate: (item: VersionHistoryCommit) => boolean): VersionHistoryGroup[] => {
  return versionHistory.groups
    .map((group: VersionHistoryGroup): VersionHistoryGroup => ({
      date: group.date,
      items: group.items.filter(predicate)
    }))
    .filter((group: VersionHistoryGroup): boolean => group.items.length > 0)
}
const versionFeatureGroups = computed<VersionHistoryGroup[]>((): VersionHistoryGroup[] => {
  return filterVersionGroups((item: VersionHistoryCommit): boolean => item.type === '功能更新')
})
const versionCodeGroups = computed<VersionHistoryGroup[]>((): VersionHistoryGroup[] => {
  return filterVersionGroups((item: VersionHistoryCommit): boolean => item.type !== '功能更新')
})
const countVersionItems = (groups: VersionHistoryGroup[]): number => {
  return groups.reduce((total: number, group: VersionHistoryGroup): number => total + group.items.length, 0)
}
const versionFeatureCount = computed<number>((): number => countVersionItems(versionFeatureGroups.value))
const versionCodeCount = computed<number>((): number => countVersionItems(versionCodeGroups.value))
const latestVersionItem = computed<VersionHistoryCommit | null>((): VersionHistoryCommit | null => {
  return versionHistory.groups[0]?.items[0] || null
})

const lolmFilteredList = computed(() => {
  if (!lolmRankData.value) return []
  const danData = lolmRankData.value[lolmSelectedDan.value]
  if (!danData) return []

  let list: any[] = []
  if (lolmSelectedPosition.value !== 'all') {
    list = danData[lolmSelectedPosition.value] || []
  } else {
    const map = new Map<string, any>()
    for (const key of Object.keys(danData)) {
      for (const item of (danData[key] || [])) {
        if (!map.has(item.heroId) || item.winRateNum > (map.get(item.heroId)?.winRateNum || 0)) {
          map.set(item.heroId, item)
        }
      }
    }
    list = Array.from(map.values())
  }

  const kw = lolmSearchKeyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(h => h.name.toLowerCase().includes(kw) || h.title.toLowerCase().includes(kw))
  }

  return list.sort((a, b) => b.winRateNum - a.winRateNum)
})

const openVersionHistoryDialog = (): void => {
  showDrawer.value = false
  showVersionHistoryDialog.value = true
}

const readAlapiPlayerVisible = (): boolean => {
  const rawState: string | null = localStorage.getItem(ALAPI_PLAYER_STORAGE_KEY)
  if (!rawState) return true

  try {
    const parsedState: { isHidden?: boolean } = JSON.parse(rawState) as { isHidden?: boolean }
    return !parsedState.isHidden
  } catch (error: unknown) {
    console.warn('音乐播放器显示状态读取失败:', error)
    return true
  }
}

const syncAlapiPlayerVisible = (): void => {
  isAlapiPlayerVisible.value = readAlapiPlayerVisible()
}

const handleAlapiPlayerVisibilityChange = (event: Event): void => {
  const detail: { visible?: boolean } | undefined = (event as CustomEvent<{ visible?: boolean }>).detail
  if (typeof detail?.visible === 'boolean') {
    isAlapiPlayerVisible.value = detail.visible
    return
  }
  syncAlapiPlayerVisible()
}

const toggleAlapiPlayerVisibility = (value: string | number | boolean): void => {
  const shouldShow: boolean = Boolean(value)
  isAlapiPlayerVisible.value = shouldShow
  window.dispatchEvent(new CustomEvent(shouldShow ? ALAPI_PLAYER_SHOW_EVENT : ALAPI_PLAYER_HIDE_EVENT))
}

function handleVersionHistoryClose(): void {
  localStorage.setItem(VERSION_HISTORY_SEEN_KEY, '1')
}

const openCommitOnGithub = (hash: string): void => {
  window.open(`${projectRepositoryUrl}/commit/${hash}`, '_blank')
}

onMounted((): void => {
  syncRouteCategory()
  syncAlapiPlayerVisible()
  window.addEventListener(ALAPI_PLAYER_VISIBILITY_CHANGE_EVENT, handleAlapiPlayerVisibilityChange)
  if (localStorage.getItem(VERSION_HISTORY_SEEN_KEY) !== '1') {
    showVersionHistoryDialog.value = true
  }
})

onUnmounted((): void => {
  window.removeEventListener(ALAPI_PLAYER_VISIBILITY_CHANGE_EVENT, handleAlapiPlayerVisibilityChange)
})

watch(() => route.path, syncRouteCategory)

const blessingYear = computed<number>((): number => new Date().getFullYear())

const goHome = async (): Promise<void | Error> => {
  isNewsActive.value = false
  isAppStoreActive.value = false
  isArticlesListActive.value = false
  return router.push('/')
}

const goFlash = (): Promise<void | Error> => router.push('/flash')
const goAiCoding = (): Promise<void | Error> => router.push('/aicoding')
const goHelloWorld = (): Promise<void | Error> => router.push('/helloworld')
const goJuejinTheme = (): Promise<void | Error> => router.push('/juejin-theme')
const goToolbox = (): Promise<void | Error> => router.push('/toolbox')
const CONTACT_EMAIL = '869710179@qq.com'
const QQ_MAILME_URL = 'http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=uYGPgI6IiYiOgPnIyJfa1tQ'
const openGoldPriceToolbox = async (): Promise<void | Error> => {
  isNewsActive.value = false
  isAppStoreActive.value = false
  isArticlesListActive.value = false
  return router.push({
    path: '/api-center',
    query: {
      category: 'ALAPI黄金价格'
    }
  })
}
const backFromFlash = (): Promise<void | Error> => router.push('/')
const openQqContact = (): void => {
  window.location.href = 'mqqwpa://im/chat?chat_type=wpa&uin=869710179&version=1&src_type=web'
}
const openMailContact = (): void => {
  window.location.href = `mailto:${CONTACT_EMAIL}`
}
const openQqMailme = (): void => {
  window.open(QQ_MAILME_URL, '_blank', 'noopener,noreferrer')
}
const handleQuickActionCommand = async (command: string): Promise<void> => {
  switch (command) {
    case 'qq':
      openQqContact()
      break
    case 'email':
      openMailContact()
      break
    case 'qq-mailme':
      openQqMailme()
      break
    case 'third-party':
      await openGoldPriceToolbox()
      break
    case 'like-history':
      openLikeHistory()
      break
    case 'control-center':
      showDrawer.value = true
      break
    case 'feature':
      await router.push('/feature')
      break
    case 'xiaomi-shop':
      await router.push('/xiaomi-shop')
      break
  }
}

const activeMenuIndex = computed<string>(() => {
  if (activeItem.value === 25) {
    if (activeLibrary.value === 'element') return 'showcase-element'
    if (activeLibrary.value === 'naive') return 'showcase-naive'
    return 'showcase-combined'
  }
  return activeSubItem.value ? activeSubItem.value.toString() : activeItem.value.toString()
})

const refreshWeather = async (): Promise<void> => {
  if (selectedAdcode.value) {
    await queryWeatherByAdcode(selectedAdcode.value)
  } else {
    await loadWeatherByIp()
  }
}

const refreshUtility = async (): Promise<void> => {
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
    case 'zhihu':
      await queryZhihuDaily(Boolean(zhihuQueryDate))
      break
    case 'zaobao':
      await queryZaobao()
      break
  }
}

let weatherChartInstance: ECharts | null = null
const showCityPicker = ref<boolean>(true)
const cascaderValue = ref<string[]>([])
const activeLetter = ref<string>('A')

const isCitySelected = (city: CityInfo): boolean => {
  if (!currentWeather.value) return false
  const activeCity = currentWeather.value.city || ''
  return activeCity.includes(city.name) || city.name.includes(activeCity)
}

watch(() => currentWeather.value as CurrentWeather | null, (newWeather: CurrentWeather | null): void => {
  if (newWeather && newWeather.city) {
    const cityName = newWeather.city
    const cityMap: CityLetterMap = chinaCitiesAz as CityLetterMap
    for (const letter in cityMap) {
      const found: CityInfo | undefined = cityMap[letter].find((c: CityInfo): boolean => cityName.includes(c.name) || c.name.includes(cityName))
      if (found) {
        activeLetter.value = found.letter || letter
        break
      }
    }
  }
}, { immediate: true, deep: true })
const getWeatherEmoji = (code: string | number | undefined): string => {
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

const findCascaderPath = (targetAdcode: string): string[] => {
  const path: string[] = []
  const search = (nodes: CascaderNode[], currentPath: string[]): boolean => {
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

const handleCascaderChange = async (val: string[]): Promise<void> => {
  if (!val || val.length === 0) return
  const targetAdcode = val[val.length - 1]
  const pathNodes: string[] = []
  const findNodes = (nodes: CascaderNode[], idx: number): void => {
    if (idx >= val.length) return
    const found: CascaderNode | undefined = nodes.find((n: CascaderNode): boolean => n.value === val[idx])
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

const selectCityFromPicker = async (city: CityInfo): Promise<void> => {
  weatherSearchKeyword.value = city.name
  const path = findCascaderPath(city.adcode)
  if (path.length > 0) {
    cascaderValue.value = path
  }
  await queryWeatherByAdcode(city.adcode)
}

const renderWeatherChart = (): void => {
  nextTick(() => {
    const chartDom = document.getElementById('weather-echarts-container')
    if (!chartDom) return

    if (weatherChartInstance) {
      weatherChartInstance.dispose()
    }

    weatherChartInstance = echarts.init(chartDom, isDarkMode.value ? 'dark' : null, {
      renderer: 'canvas'
    })

    const list: WeatherForecast[] = forecastList.value && forecastList.value.length > 0 ? forecastList.value : [
      { date: '今天', temp_high: 32, temp_low: 25, weather: '晴' },
      { date: '明天', temp_high: 33, temp_low: 26, weather: '多云' },
      { date: '后天', temp_high: 34, temp_low: 25, weather: '雷阵雨' },
      { date: '周四', temp_high: 32, temp_low: 24, weather: '阴' },
      { date: '周五', temp_high: 31, temp_low: 23, weather: '小雨' },
      { date: '周六', temp_high: 33, temp_low: 24, weather: '多云' },
      { date: '周日', temp_high: 34, temp_low: 25, weather: '晴' }
    ]

    const dates: string[] = list.map((item: WeatherForecast): string => item.week || item.date || item.day || '')
    const highs: number[] = list.map((item: WeatherForecast): number => parseInt(String(item.temp_high || item.high || 0), 10))
    const lows: number[] = list.map((item: WeatherForecast): number => parseInt(String(item.temp_low || item.low || 0), 10))
    const weathers: string[] = list.map((item: WeatherForecast): string => item.weather_day || item.weather || '')

    const option: EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any): string {
          let res: string = params[0].name + '<br/>'
          params.forEach((item: any): void => {
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
    <div v-if="isBigScreenRoute" class="big-screen-route-layer">
      <router-view />
      <n-back-top
        to=".big-screen-route-layer"
        listen-to=".big-screen-shell"
        :right="40"
        :bottom="120"
        :visibility-height="80"
      >
        <div class="route-back-top">↑</div>
      </n-back-top>
    </div>

    <template v-else>
    <!-- 左侧导航栏 -->
    <nav class="sidebar" :class="{ 'collapsed': !isSidebarOpen }">
      <button class="logo logo-button" type="button" title="返回首页" @click="goHome">HooksVue</button>
      <div class="db-status-bar" v-show="isSidebarOpen">
        <span class="dot" :class="isHomeLive ? 'live' : 'cached'">●</span>
        <span>{{ isHomeLive ? '实时同步中 (60s)' : '静态本地数据' }}</span>
      </div>
      <el-menu
        :default-active="activeMenuIndex"
        class="nav-list-menu"
        :collapse="!isSidebarOpen"
        background-color="transparent"
        text-color="var(--text-color)"
        active-text-color="var(--primary-color)"
        style="border-right: none;"
      >
        <template v-for="item in menuItems" :key="item.id">
          <!-- 如果是组件示例 (ID 25)，特殊处理渲染为含有两层下级的 el-sub-menu -->
          <el-sub-menu v-if="item.id === 25" index="25">
            <template #title>
              <span class="nav-icon" style="margin-right: 8px;">{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </template>
            <el-menu-item index="showcase-element" @click="selectItem(25); activeLibrary = 'element'">
              <span>🧩 Element Plus 示例</span>
            </el-menu-item>
            <el-menu-item index="showcase-naive" @click="selectItem(25); activeLibrary = 'naive'">
              <span>🍀 Naive UI 示例</span>
            </el-menu-item>
            <el-menu-item index="showcase-combined" @click="selectItem(25); activeLibrary = 'combined'">
              <span style="background: linear-gradient(90deg, #409eff, #18a058); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700;">⚡ 综合商业实战</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 如果是其他有二级分类的项目，渲染为标准 el-sub-menu -->
          <el-sub-menu v-else-if="item.subcategories && item.subcategories.length > 0" :index="item.id.toString()">
            <template #title>
              <span class="nav-icon" style="margin-right: 8px;">{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </template>
            <el-menu-item 
              v-for="sub in item.subcategories" 
              :key="sub.id" 
              :index="sub.id.toString()"
              @click="selectItem(item.id); selectSubItem(sub.id)"
            >
              <span>{{ sub.name }}</span>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 如果没有二级分类项目，普通一级 el-menu-item -->
          <el-menu-item v-else :index="item.id.toString()" @click="selectItem(item.id)">
            <span class="nav-icon" style="margin-right: 8px;">{{ item.icon }}</span>
            <template #title>{{ item.name }}</template>
          </el-menu-item>
        </template>
      </el-menu>
      <div class="sidebar-footers">
        <div class="sidebar-footer" @click="goFlash" title="闪存">
          <span class="nav-icon">⚡</span>
          <span v-show="isSidebarOpen">闪存</span>
        </div>
        <div class="sidebar-footer" @click="goAiCoding" title="AI编程资讯">
          <span class="nav-icon">🤖</span>
          <span v-show="isSidebarOpen">AI编程资讯</span>
        </div>
        <div class="sidebar-footer" @click="goHelloWorld" title="HelloWorld社区">
          <span class="nav-icon">🌍</span>
          <span v-show="isSidebarOpen">HelloWorld</span>
        </div>
        <div class="sidebar-footer" @click="goJuejinTheme" title="掘金热门主题">
          <span class="nav-icon">🔥</span>
          <span v-show="isSidebarOpen">热门主题</span>
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
              <span>天气预报</span>
              <span style="margin-left: auto; font-size: 10px; color: var(--text-secondary);">▶</span>
            </div>
            <div class="popover-tool-item" @click="goMingyan">
              <span class="tool-icon">📜</span>
              <span>名人名言</span>
              <span style="margin-left: auto; font-size: 10px; color: var(--text-secondary);">▶</span>
            </div>
            <div class="popover-tool-item" @click="goCocoloop">
              <span class="tool-icon">🌌</span>
              <span>CocoLoop 社区</span>
              <span style="margin-left: auto; font-size: 10px; color: var(--text-secondary);">▶</span>
            </div>
            <div class="popover-tool-item" @click="goCnblogs">
              <span class="tool-icon">📰</span>
              <span>博客园新闻</span>
              <span style="margin-left: auto; font-size: 10px; color: var(--text-secondary);">▶</span>
            </div>
            <div class="popover-tool-item" @click="goGithubCn">
              <span class="tool-icon">🐙</span>
              <span>GitHub 中文社区</span>
              <span style="margin-left: auto; font-size: 10px; color: var(--text-secondary);">▶</span>
            </div>
            <div class="popover-tool-item" @click="goBigScreen">
              <span class="tool-icon">📊</span>
              <span>可视化大屏</span>
              <span style="margin-left: auto; font-size: 10px; color: var(--text-secondary);">▶</span>
            </div>
            <div class="popover-tool-item" @click="showBingDialog = true">
              <span class="tool-icon">🌅</span>
              <span>Bing 每日壁纸</span>
            </div>
            <div class="popover-tool-item" @click="showUtilityDialog = true">
              <span class="tool-icon">🧰</span>
              <span>智能工具箱</span>
            </div>
            <div class="popover-tool-item" @click="goToolbox">
              <span class="tool-icon">🗂️</span>
              <span>工具集合</span>
              <span style="margin-left: auto; font-size: 10px; color: var(--text-secondary);">▶</span>
            </div>
          </div>
        </el-popover>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="main-content" :class="{ 'expanded': !isSidebarOpen }">
      <div class="glow-bg"></div>
      <div v-if="isDyFormRoute" class="sticky-command-center">
        <BrowserSupportNotice />
        <div class="header-actions" :class="{ 'actions-open': isHeaderActionsOpen }">
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

          <button
            type="button"
            class="header-actions-toggle"
            :class="{ active: isHeaderActionsOpen }"
            :aria-expanded="isHeaderActionsOpen"
            title="展开快捷操作"
            @click="isHeaderActionsOpen = !isHeaderActionsOpen"
          >
            ›
          </button>

          <div class="header-right-actions" :aria-hidden="!isHeaderActionsOpen">
            <AnalogClock class="header-analog-clock" />
            <el-dropdown trigger="click" placement="bottom-end" @command="handleQuickActionCommand">
              <button class="dropdown-trigger quick-actions-trigger" type="button">
                快捷入口
                <span class="arrow">▼</span>
              </button>
              <template #dropdown>
                <el-dropdown-menu class="quick-actions-menu">
                  <el-dropdown-item command="qq">QQ 联系</el-dropdown-item>
                  <el-dropdown-item command="email">邮箱联系</el-dropdown-item>
                  <el-dropdown-item command="qq-mailme">QQ 邮我</el-dropdown-item>
                  <el-dropdown-item divided command="third-party">第三方页面集</el-dropdown-item>
                  <el-dropdown-item command="like-history">历史爱心</el-dropdown-item>
                  <el-dropdown-item command="control-center">控制中心</el-dropdown-item>
                  <el-dropdown-item command="feature">功能页面</el-dropdown-item>
                  <el-dropdown-item command="xiaomi-shop">小米商城</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div
          v-if="isDyFormRoute && !isArticlesListActive && !isAppStoreActive && !isNewsActive && activeItem !== 24 && activeItem !== 25"
          class="aggregator-search-container"
        >
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
        <ComponentShowcase v-model:active-library="activeLibrary" />
      </div>
      <template v-else-if="isFlashRoute">
        <!-- 独立路由激活，避免在 main-content 内重叠渲染 router-view 或主页网格 -->
      </template>
      <template v-else>
        <!-- 布局网络列选择器与当前分类指示 -->
        <div class="grid-controls-row">
          <span class="active-category-indicator">
            📂 当前分类: {{ getActiveCategoryName() }}
          </span>

          <!-- Pill Switcher for IDE Tools -->
          <!-- Pill Switchers dynamically rendered based on active category -->
          <div v-if="activeSubTabs[Number(activeItem)] && !searchQuery" class="ide-tab-container">
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

        <section v-if="activeItem === TERMINAL_CATEGORY_ID && !searchQuery" class="terminal-showcase" aria-label="终端界面预览">
          <div class="terminal-window">
            <div class="terminal-titlebar">
              <div class="terminal-traffic-lights" aria-hidden="true">
                <span class="terminal-light close"></span>
                <span class="terminal-light minimize"></span>
                <span class="terminal-light zoom"></span>
              </div>
              <div class="terminal-title">终端 - tail - zsh - 80x24</div>
              <div class="terminal-scroll-mark" aria-hidden="true"></div>
            </div>
            <div class="terminal-body">
              <p v-for="line in terminalPreviewLines" :key="line">{{ line }}</p>
              <span class="terminal-cursor" aria-hidden="true"></span>
            </div>
          </div>
          <div class="terminal-showcase-copy">
            <h2>终端界面</h2>
            <p>收集真实终端、Shell 美化和 Web 终端组件，适合做开发环境、命令行演示和页面内控制台。</p>
          </div>
        </section>

        <div :class="['tools-grid', `cols-${gridCols}`]">
          <!-- 工具卡片列表 -->
          <template v-if="filteredTools.length > 0">
            <div v-for="(tool, index) in filteredTools" :key="tool.id" class="tool-wrapper">
              <div class="tool-card"
                  :class="{ 'terminal-tool-card': tool.type === 'terminal' || tool.type === 'terminal-ui' }"
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
                  <div v-if="activeItem === TERMINAL_CATEGORY_ID" class="terminal-meta">
                    <span>{{ tool.platform }}</span>
                    <span>{{ tool.price }}</span>
                  </div>
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
        <footer class="home-blessing-footer">
          <div class="blessing-ticker">
            <Transition name="blessing-ticker-up">
              <div class="blessing-ticker-item" :key="blessingTickerIndex">
                <span v-if="blessingTickerItems[blessingTickerIndex]?.label" class="blessing-ticker-label">
                  {{ blessingTickerItems[blessingTickerIndex]?.label }}
                </span>
                <span class="blessing-ticker-text">
                  {{ blessingTickerItems[blessingTickerIndex]?.text || `祝您身体健康万事如意，心想事成，${blessingYear} 年加油` }}
                </span>
              </div>
            </Transition>
          </div>
        </footer>
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
      <div class="context-menu-item" @click="() => copyLink()">
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
              <el-icon class="is-loading"><Loading /></el-icon>
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
              <el-icon class="is-loading"><Loading /></el-icon>
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
                <el-option
                  v-for="opt in WALLPAPER_API_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标图片分辨率：">
              <el-select v-model="bingWallpaperForm.resolution" placeholder="请选择" @change="updateBingPreview" style="width: 100%;">
                <el-option
                  v-for="opt in RESOLUTION_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
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
                v-for="city in (chinaCitiesAz as CityLetterMap)[activeLetter]"
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
                          下一个节日：<strong>{{ holidayData.nearby.next[0]?.events?.[0]?.name || holidayData.nearby.next[0]?.name }}</strong> 
                          ({{ holidayData.nearby.next[0]?.date }})
                        </div>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
            <div v-else style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              <el-icon class="is-loading"><Loading /></el-icon> 正在努力获取日历信息中...
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
              <el-icon class="is-loading"><Loading /></el-icon> 正在探寻程序员历史的群星闪耀时刻...
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
              <el-icon class="is-loading"><Loading /></el-icon> 正在爬取当下最炙手可热的新闻热搜...
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
                  <el-icon class="is-loading"><Loading /></el-icon> 正在获取最新院线实时票房榜单...
                </div>
              </el-tab-pane>

              <el-tab-pane label="🔥 影视收视评分榜">
                <div style="display: flex; gap: 12px; margin-bottom: 16px; padding-top: 10px;">
                  <el-select v-model="movieRatingsChannel" placeholder="选择渠道" @change="queryMovieRatings" style="width: 130px;">
                    <el-option
                      v-for="opt in MOVIE_CHANNEL_OPTIONS"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                  <el-select v-model="movieRatingsPeriod" placeholder="选择周期" @change="queryMovieRatings" style="width: 130px;">
                    <el-option
                      v-for="opt in MOVIE_PERIOD_OPTIONS"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                  <el-button type="primary" :loading="isMovieRatingsLoading" @click="queryMovieRatings">🔄 刷新排行</el-button>
                </div>

                <el-alert
                  v-if="movieRatingsError"
                  :title="movieRatingsError"
                  type="warning"
                  show-icon
                  :closable="false"
                  style="margin-bottom: 12px;"
                />

                <div v-if="movieRatings && movieRatings.length > 0" class="hotboard-list-wrapper">
                  <div v-for="(item, idx) in movieRatings" :key="idx" class="hotboard-list-item">
                    <span class="hot-idx" :class="{'top-three': idx < 3}">{{ idx + 1 }}</span>
                    <span class="hot-title">
                      <a v-if="item.url" :href="item.url" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">{{ item.title }}</a>
                      <template v-else>{{ item.title }}</template>
                      <span style="font-size: 11px; color: var(--text-secondary); margin-left: 10px;">[{{ item.platform || item.channel || '' }}]</span>
                    </span>
                    <span class="hot-value" v-if="item.score">⭐ {{ item.score }}分</span>
                    <span class="hot-value" v-else-if="item.hot_value">🔥 {{ item.hot_value }}</span>
                  </div>
                </div>
                <div v-else-if="isMovieRatingsLoading" style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
                  <el-icon class="is-loading"><Loading /></el-icon> 正在获取影视热度排行评分列表...
                </div>
                <div v-else style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
                  暂无影视热度排行数据
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
                    <div :style="{ fontSize: '12px', lineHeight: 1.5, color: idx === 0 ? 'var(--text-color)' : 'var(--text-secondary)' }">
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
                <el-option
                  v-for="opt in RANDOM_IMAGE_CATEGORY_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
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

        <!-- 7. 星座运势 -->
        <el-tab-pane name="star">
          <template #label>
            <span>✨ 星座运势</span>
          </template>
          <div style="padding: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 14px; font-weight: bold; color: var(--text-color);">选择星座：</span>
                <el-select v-model="starActiveName" placeholder="选择星座" @change="queryStarHoroscope" style="width: 170px;">
                  <el-option
                    v-for="opt in STAR_OPTIONS"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </div>
              
              <div style="display: flex; align-items: center; gap: 10px;">
                <el-radio-group v-model="starActivePeriod" size="small">
                  <el-radio-button label="day">今日</el-radio-button>
                  <el-radio-button label="tomorrow">明日</el-radio-button>
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="year">本年</el-radio-button>
                </el-radio-group>

                <el-button type="primary" size="small" :loading="isStarLoading" @click="queryStarHoroscope">
                  🔍 查询运势
                </el-button>
              </div>
            </div>

            <!-- 星座运势内容库 -->
            <div v-if="starHoroscopeData && starHoroscopeData[starActivePeriod]" style="display: flex; flex-direction: column; gap: 16px;">
              <el-row :gutter="16">
                <!-- 指数面板 -->
                <el-col :span="10">
                  <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px;">
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 12px; color: var(--primary-color);">
                      🌟 运势指数 ({{ starHoroscopeData[starActivePeriod].date || '最新' }})
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;" v-if="starHoroscopeData[starActivePeriod].all">
                        <span>综合运势</span>
                        <strong style="color: #c084fc;">{{ starHoroscopeData[starActivePeriod].all }}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center;" v-if="starHoroscopeData[starActivePeriod].love">
                        <span>爱情运势</span>
                        <strong style="color: #f472b6;">{{ starHoroscopeData[starActivePeriod].love }}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center;" v-if="starHoroscopeData[starActivePeriod].work">
                        <span>事业学业</span>
                        <strong style="color: #38bdf8;">{{ starHoroscopeData[starActivePeriod].work }}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center;" v-if="starHoroscopeData[starActivePeriod].money">
                        <span>财富财运</span>
                        <strong style="color: #fbbf24;">{{ starHoroscopeData[starActivePeriod].money }}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center;" v-if="starHoroscopeData[starActivePeriod].health">
                        <span>健康指数</span>
                        <strong style="color: #4ade80;">{{ starHoroscopeData[starActivePeriod].health }}</strong>
                      </div>
                    </div>

                    <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border-color); display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                      <div v-if="starHoroscopeData[starActivePeriod].yi"><strong>👍 宜：</strong><span style="color: #4ade80;">{{ starHoroscopeData[starActivePeriod].yi }}</span></div>
                      <div v-if="starHoroscopeData[starActivePeriod].ji"><strong>⚠️ 忌：</strong><span style="color: #f87171;">{{ starHoroscopeData[starActivePeriod].ji }}</span></div>
                      <div v-if="starHoroscopeData[starActivePeriod].lucky_color"><strong>🎨 幸运色：</strong><span>{{ starHoroscopeData[starActivePeriod].lucky_color }}</span></div>
                      <div v-if="starHoroscopeData[starActivePeriod].lucky_number"><strong>🔢 幸运数：</strong><span>{{ starHoroscopeData[starActivePeriod].lucky_number }}</span></div>
                      <div v-if="starHoroscopeData[starActivePeriod].lucky_star" style="grid-column: span 2;"><strong>⭐ 贵人星座：</strong><span style="color: var(--primary-color);">{{ starHoroscopeData[starActivePeriod].lucky_star }}</span></div>
                    </div>
                  </div>
                </el-col>

                <!-- 详细文本解析 -->
                <el-col :span="14">
                  <div style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;">
                    <div v-if="starHoroscopeData[starActivePeriod].all_text">
                      <h5 style="margin: 0 0 4px 0; color: var(--primary-color); font-size: 13px;">✨ 综合运势解析</h5>
                      <p style="margin: 0; font-size: 12px; line-height: 1.6; color: var(--text-color);">{{ starHoroscopeData[starActivePeriod].all_text }}</p>
                    </div>
                    <div v-if="starHoroscopeData[starActivePeriod].love_text">
                      <h5 style="margin: 0 0 4px 0; color: #f472b6; font-size: 13px;">💖 感情运势</h5>
                      <p style="margin: 0; font-size: 12px; line-height: 1.6; color: var(--text-color);">{{ starHoroscopeData[starActivePeriod].love_text }}</p>
                    </div>
                    <div v-if="starHoroscopeData[starActivePeriod].work_text">
                      <h5 style="margin: 0 0 4px 0; color: #38bdf8; font-size: 13px;">💼 事业学业</h5>
                      <p style="margin: 0; font-size: 12px; line-height: 1.6; color: var(--text-color);">{{ starHoroscopeData[starActivePeriod].work_text }}</p>
                    </div>
                    <div v-if="starHoroscopeData[starActivePeriod].money_text">
                      <h5 style="margin: 0 0 4px 0; color: #fbbf24; font-size: 13px;">💰 财运理财</h5>
                      <p style="margin: 0; font-size: 12px; line-height: 1.6; color: var(--text-color);">{{ starHoroscopeData[starActivePeriod].money_text }}</p>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>

            <div v-else style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              <el-icon class="is-loading"><Loading /></el-icon> 正在为您算取星座运势数据...
            </div>
          </div>
        </el-tab-pane>

        <!-- 7.5 身份证信息查询 -->
        <el-tab-pane name="idcard">
          <template #label>
            <span>🪪 身份证信息查询</span>
          </template>
          <div style="padding: 10px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
              <el-radio-group v-model="idcardQueryMode" size="small">
                <el-radio-button label="query">🪪 归属地信息查询</el-radio-button>
                <el-radio-button label="upgrade">🚀 15位升级18位</el-radio-button>
              </el-radio-group>

              <el-input
                v-model="idcardQueryNo"
                :placeholder="idcardQueryMode === 'upgrade' ? '请输入15位旧身份证号' : '请输入15位或18位身份证号'"
                clearable
                style="flex: 1; max-width: 320px;"
                @keyup.enter="queryIdCard"
              />

              <el-button type="primary" :loading="isIdcardLoading" @click="queryIdCard">
                🔍 {{ idcardQueryMode === 'upgrade' ? '升级生成' : '查询归属地' }}
              </el-button>
            </div>

            <!-- Error alert -->
            <el-alert
              v-if="idcardError && !idcardInfoData && !idcardUpgradeResult"
              :title="idcardError"
              type="warning"
              show-icon
              :closable="false"
              style="margin-bottom: 16px;"
            />

            <!-- 1. 归属地信息展示 -->
            <div v-if="idcardInfoData && (idcardQueryMode === 'query' || !idcardUpgradeResult)" style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px;">
              <div v-if="idcardQueryMode === 'upgrade' && !idcardUpgradeResult" style="color: #fbbf24; font-size: 13px; margin-bottom: 12px;">
                💡 该身份证号已为 18 位标准格式，无须升级。为您展示归属地与详细信息：
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <h4 style="margin: 0; color: var(--primary-color); font-size: 15px;">
                  📍 归属地发证机关：{{ idcardInfoData.address || idcardInfoData.province + (idcardInfoData.city || '') + (idcardInfoData.county || '') }}
                </h4>
                <span style="font-size: 12px; color: var(--text-secondary);">
                  行政区划代码: <strong>{{ idcardInfoData.address_code || '已校验' }}</strong>
                </span>
              </div>

              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="🎂 出生日期">
                  <strong>{{ idcardInfoData.birthday }}</strong> ({{ idcardInfoData.age }} 周岁)
                </el-descriptions-item>

                <el-descriptions-item label="👤 性别">
                  <span :style="{ color: idcardInfoData.sex === 1 ? '#38bdf8' : '#f472b6', fontWeight: 'bold' }">
                    {{ idcardInfoData.sex === 1 ? '♂ 男' : '♀ 女' }}
                  </span>
                </el-descriptions-item>

                <el-descriptions-item label="✨ 所属星座">
                  <strong style="color: #c084fc;">{{ idcardInfoData.constellation }}</strong>
                </el-descriptions-item>

                <el-descriptions-item label="🐴 生肖属相">
                  <strong style="color: #fbbf24;">{{ idcardInfoData.zodiac }}</strong>
                </el-descriptions-item>

                <el-descriptions-item label="🗺️ 省份/城市">
                  {{ idcardInfoData.province }} {{ idcardInfoData.city }} {{ idcardInfoData.county }}
                </el-descriptions-item>

                <el-descriptions-item label="🔢 号码长度">
                  {{ idcardInfoData.length || 18 }} 位标准格式
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 2. 15位升级18位结果展示 -->
            <div v-else-if="idcardQueryMode === 'upgrade' && idcardUpgradeResult" style="background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px;">
              <div style="font-size: 15px; font-weight: bold; color: var(--primary-color); margin-bottom: 12px;">
                🎉 15 位身份证号升级成功！
              </div>
              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 14px;">
                <div>原始 15 位旧卡号：<code style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px;">{{ idcardUpgradeResult.id }}</code></div>
                <div>升级 18 位新卡号：<strong style="color: #4ade80; font-size: 16px; font-family: monospace;">{{ idcardUpgradeResult.new_id }}</strong></div>
              </div>
            </div>

            <div v-else style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              💡 请在上方输入框输入要查询归属地或升级的身份证号码后点击查询
            </div>
          </div>
        </el-tab-pane>

        <!-- 7.8 英雄联盟手游国服数据 -->
        <el-tab-pane name="lolm">
          <template #label>
            <span>⚔️ LOLM国服数据</span>
          </template>
          <div style="padding: 10px;">
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 13px; font-weight: bold; color: var(--text-color);">分段选择：</span>
                  <el-radio-group v-model="lolmSelectedDan" size="small">
                    <el-radio-button label="1">💎 钻石以上</el-radio-button>
                    <el-radio-button label="2">👑 大师以上</el-radio-button>
                    <el-radio-button label="3">🏆 王者</el-radio-button>
                    <el-radio-button label="4">⚔️ 峡谷之巅</el-radio-button>
                  </el-radio-group>
                </div>

                <el-button type="primary" size="small" :loading="isLolmLoading" @click="queryLolmData">
                  🔄 刷新国服榜单
                </el-button>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 13px; font-weight: bold; color: var(--text-color);">分路位置：</span>
                  <el-radio-group v-model="lolmSelectedPosition" size="small">
                    <el-radio-button label="all">🌐 全部</el-radio-button>
                    <el-radio-button label="2">⚔️ 上单</el-radio-button>
                    <el-radio-button label="5">🌲 打野</el-radio-button>
                    <el-radio-button label="1">🧙‍♂️ 中路</el-radio-button>
                    <el-radio-button label="3">🏹 下路</el-radio-button>
                    <el-radio-button label="4">🛡️ 辅助</el-radio-button>
                  </el-radio-group>
                </div>

                <el-input
                  v-model="lolmSearchKeyword"
                  placeholder="🔍 搜索英雄名称 / 称号"
                  clearable
                  size="small"
                  style="width: 220px;"
                />
              </div>
            </div>

            <!-- Table List -->
            <div v-if="lolmFilteredList && lolmFilteredList.length > 0">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; color: var(--text-secondary); font-size: 12px;">
                <span>当前共 {{ lolmFilteredList.length }} 位英雄数据</span>
                <span>表格可滚动查看全部</span>
              </div>
              <el-table :data="lolmFilteredList" border size="small" max-height="520" style="width: 100%; border-radius: 8px; overflow: hidden;">
                <el-table-column type="index" label="排名" width="60" align="center">
                  <template #default="scope">
                    <span :style="{ fontWeight: 'bold', color: scope.$index === 0 ? '#f59e0b' : scope.$index === 1 ? '#94a3b8' : scope.$index === 2 ? '#b45309' : 'var(--text-color)' }">
                      {{ scope.$index + 1 }}
                    </span>
                  </template>
                </el-table-column>

                <el-table-column label="英雄" min-width="150">
                  <template #default="scope">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <img :src="scope.row.avatar" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--primary-color);" />
                      <div>
                        <div style="font-weight: bold; color: var(--text-color); font-size: 13px;">{{ scope.row.title }}</div>
                        <div style="font-size: 11px; color: var(--text-secondary);">{{ scope.row.name }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column prop="winRateNum" label="胜率" width="100" align="center" sortable>
                  <template #default="scope">
                    <strong style="color: #4ade80;">{{ scope.row.winRatePercent }}</strong>
                  </template>
                </el-table-column>

                <el-table-column prop="appearRateNum" label="登场率" width="100" align="center" sortable>
                  <template #default="scope">
                    <span style="color: #38bdf8;">{{ scope.row.appearRatePercent }}</span>
                  </template>
                </el-table-column>

                <el-table-column prop="forbidRateNum" label="BAN率" width="100" align="center" sortable>
                  <template #default="scope">
                    <span style="color: #f87171;">{{ scope.row.forbidRatePercent }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div v-else-if="isLolmLoading" style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              <el-icon class="is-loading"><Loading /></el-icon> 正在拉取英雄联盟手游国服数据...
            </div>
            <div v-else style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              暂无匹配的英雄联盟手游国服数据
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

        <!-- 8. 知乎日报 -->
        <el-tab-pane name="zhihu">
          <template #label>
            <span>📘 知乎日报</span>
          </template>
          <div class="zhihu-daily-panel">
            <div class="zhihu-toolbar">
              <el-date-picker
                v-model="zhihuQueryDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYYMMDD"
                placeholder="选择日报日期"
                style="width: 180px;"
              />
              <el-button type="primary" :loading="isZhihuLoading" @click="queryZhihuDaily(true)">指定日期日报</el-button>
              <el-button :loading="isZhihuLoading" @click="queryZhihuDaily(false)">今日日报</el-button>
            </div>

            <el-alert
              v-if="zhihuError"
              :title="zhihuError"
              type="warning"
              show-icon
              :closable="false"
              style="margin-bottom: 12px;"
            />

            <div class="zhihu-daily-layout" v-loading="isZhihuLoading">
              <section class="zhihu-story-list">
                <div class="zhihu-section-title">
                  <strong>{{ zhihuDailyData?.date || '知乎日报' }}</strong>
                  <span>{{ zhihuDailyData?.stories?.length || 0 }} 篇</span>
                </div>
                <button
                  v-for="story in zhihuDailyData?.stories || []"
                  :key="story.id"
                  type="button"
                  class="zhihu-story-card"
                  :class="{ active: selectedZhihuStory?.id === story.id }"
                  @click="queryZhihuStoryDetail(story)"
                >
                  <img v-if="story.images?.[0]" :src="story.images[0]" alt="" />
                  <span v-else class="zhihu-story-placeholder">知</span>
                  <span class="zhihu-story-info">
                    <strong>{{ story.title }}</strong>
                    <em>{{ story.hint || '知乎日报' }}</em>
                  </span>
                </button>
                <div v-if="!isZhihuLoading && !zhihuDailyData?.stories?.length" class="zhihu-empty">
                  暂无日报内容
                </div>
              </section>

              <section class="zhihu-story-detail" v-loading="isZhihuDetailLoading">
                <div v-if="selectedZhihuStory" class="zhihu-detail-head">
                  <div>
                    <h3>{{ zhihuStoryDetail?.title || selectedZhihuStory.title }}</h3>
                    <p>{{ selectedZhihuStory.hint || '知乎日报精选内容' }}</p>
                  </div>
                  <a :href="zhihuStoryDetail?.share_url || selectedZhihuStory.url" target="_blank" rel="noopener">打开原文</a>
                </div>

                <div v-if="zhihuStoryDetail" class="zhihu-detail-grid">
                  <article class="zhihu-detail-body">
                    <img v-if="zhihuStoryDetail.image" :src="zhihuStoryDetail.image" alt="" />
                    <div class="zhihu-html-preview" v-html="zhihuStoryDetail.body || '暂无正文内容'"></div>
                  </article>
                  <aside class="zhihu-comments-panel">
                    <div class="zhihu-comments-block">
                      <h4>短评 {{ zhihuShortComments.length }}</h4>
                      <div v-if="zhihuShortComments.length" class="zhihu-comments-list">
                        <div v-for="comment in zhihuShortComments" :key="'short-' + comment.id" class="zhihu-comment-item">
                          <img v-if="comment.avatar" :src="comment.avatar" alt="" />
                          <div>
                            <strong>{{ comment.author }}</strong>
                            <p>{{ comment.content }}</p>
                            <span>{{ comment.likes || 0 }} 赞</span>
                          </div>
                        </div>
                      </div>
                      <p v-else class="zhihu-empty">暂无短评</p>
                    </div>
                    <div class="zhihu-comments-block">
                      <h4>长评 {{ zhihuLongComments.length }}</h4>
                      <div v-if="zhihuLongComments.length" class="zhihu-comments-list">
                        <div v-for="comment in zhihuLongComments" :key="'long-' + comment.id" class="zhihu-comment-item">
                          <img v-if="comment.avatar" :src="comment.avatar" alt="" />
                          <div>
                            <strong>{{ comment.author }}</strong>
                            <p>{{ comment.content }}</p>
                            <span>{{ comment.likes || 0 }} 赞</span>
                          </div>
                        </div>
                      </div>
                      <p v-else class="zhihu-empty">暂无长评</p>
                    </div>
                  </aside>
                </div>
                <div v-else class="zhihu-empty">
                  请选择一篇日报查看详情
                </div>
              </section>
            </div>
          </div>
        </el-tab-pane>

        <!-- 9. QQ用户信息查询 -->
        <el-tab-pane name="qq">
          <template #label>
            <span>🐧 QQ 信息查询</span>
          </template>
          <div style="padding: 16px;">
            <!-- Search bar -->
            <div style="display: flex; gap: 12px; margin-bottom: 20px;">
              <el-input
                v-model="qqNumber"
                placeholder="请输入 QQ 号码 (如 10001)"
                clearable
                style="flex: 1;"
                @keyup.enter="queryQqUserInfo"
              />
              <el-button type="primary" :loading="isQqLoading" @click="queryQqUserInfo">
                🔍 立即查询
              </el-button>
            </div>

            <!-- Error message -->
            <el-alert
              v-if="qqError"
              :title="qqError"
              type="error"
              show-icon
              :closable="false"
              style="margin-bottom: 20px;"
            />

            <!-- QQ Card -->
            <div v-if="qqUserInfo" class="qq-card" v-loading="isQqLoading">
              <!-- Header Section with Avatar -->
              <div class="qq-header">
                <div class="avatar-wrapper" :class="{ 'is-vip': qqUserInfo.is_vip || qqUserInfo.is_svip }">
                  <img :src="qqUserInfo.avatar_url" alt="QQ Avatar" class="qq-avatar" />
                  <span v-if="qqUserInfo.is_svip" class="vip-tag svip">SVIP {{ qqUserInfo.vip_level }}</span>
                  <span v-else-if="qqUserInfo.is_vip" class="vip-tag vip">VIP {{ qqUserInfo.vip_level }}</span>
                </div>
                
                <div class="qq-title-info">
                  <div class="qq-nick-row">
                    <span class="qq-nick">{{ qqUserInfo.nickname || qqUserInfo.nick }}</span>
                    <span v-if="qqUserInfo.sex === 'male'" class="gender male" title="男生">♂️</span>
                    <span v-else-if="qqUserInfo.sex === 'female'" class="gender female" title="女生">♀️</span>
                  </div>
                  <p class="qq-signature" :title="qqUserInfo.long_nick || qqUserInfo.longNick">
                    {{ qqUserInfo.long_nick || qqUserInfo.longNick || '这家伙很懒，什么都没有留下。' }}
                  </p>
                </div>
              </div>

              <el-divider style="margin: 16px 0;" />

              <!-- Info Grid -->
              <div class="qq-details-grid">
                <div class="detail-item">
                  <span class="label">QQ 号码：</span>
                  <span class="valueHighlight">{{ qqUserInfo.qq }}</span>
                </div>

                <div class="detail-item">
                  <span class="label">QQ 等级：</span>
                  <div class="level-display" style="display: inline-flex; align-items: center; gap: 8px;">
                    <span class="value">Lv.{{ qqUserInfo.qq_level || qqUserInfo.qqLevel || qqUserInfo.level || 0 }}</span>
                    <!-- Level icons representation -->
                    <div v-if="qqUserInfo.qq_level_icons" class="level-icons" style="display: flex; gap: 2px;">
                      <span v-for="i in qqUserInfo.qq_level_icons.crownNum" :key="'crown-' + i" title="皇冠">👑</span>
                      <span v-for="i in qqUserInfo.qq_level_icons.sunNum" :key="'sun-' + i" title="太阳">☀️</span>
                      <span v-for="i in qqUserInfo.qq_level_icons.moonNum" :key="'moon-' + i" title="月亮">🌙</span>
                      <span v-for="i in qqUserInfo.qq_level_icons.starNum" :key="'star-' + i" title="星星">⭐</span>
                    </div>
                  </div>
                </div>

                <div class="detail-item" v-if="qqUserInfo.email">
                  <span class="label">绑定邮箱：</span>
                  <span class="value">{{ qqUserInfo.email }}</span>
                </div>

                <div class="detail-item" v-if="qqUserInfo.reg_time">
                  <span class="label">注册时间：</span>
                  <span class="value">{{ new Date(qqUserInfo.reg_time).toLocaleDateString() }}</span>
                </div>

                <div class="detail-item" v-if="qqUserInfo.yellow_diamond_level">
                  <span class="label">黄钻等级：</span>
                  <span class="value active-diamond">💎 黄钻 {{ qqUserInfo.yellow_diamond_level }}</span>
                </div>

                <div class="detail-item" v-if="qqUserInfo.green_diamond_level">
                  <span class="label">绿钻等级：</span>
                  <span class="value active-diamond-green">🎵 绿钻 {{ qqUserInfo.green_diamond_level }}</span>
                </div>

                <div class="detail-item" v-if="qqUserInfo.age">
                  <span class="label">Q 龄：</span>
                  <span class="value">{{ qqUserInfo.age }} 岁</span>
                </div>
              </div>
            </div>
            
            <div v-else-if="!isQqLoading && !qqError" style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              <el-icon :size="48" style="margin-bottom: 12px; color: var(--text-secondary);"><Timer /></el-icon>
              <p>请输入 QQ 号并点击“查询”获取详情</p>
            </div>
          </div>
        </el-tab-pane>

        <!-- 10. 每日早报 -->
        <el-tab-pane name="zaobao">
          <template #label>
            <span>📰 每日早报</span>
          </template>
          <div style="padding: 10px;">
            <div v-if="isZaobaoLoading" style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              <el-icon class="is-loading"><Loading /></el-icon> 正在获取今日早报，60 秒读懂世界...
            </div>

            <div v-else-if="zaobaoError" style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              <p>{{ zaobaoError }}</p>
              <el-button type="primary" size="small" @click="queryZaobao">重新加载</el-button>
            </div>

            <div v-else-if="zaobaoData" class="zaobao-container">
              <div class="zaobao-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <div style="font-weight: 600; font-size: 16px;">📅 {{ zaobaoData.date }} · 每天 60 秒读懂世界</div>
                <el-link v-if="zaobaoData.image" type="primary" :href="zaobaoData.image" target="_blank">查看早报图片</el-link>
              </div>

              <div v-if="zaobaoData.audio" style="margin-bottom: 12px;">
                <audio :src="zaobaoData.audio" controls preload="none" style="width: 100%;"></audio>
              </div>

              <ol style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px;">
                <li v-for="(item, index) in zaobaoData.news" :key="index" style="line-height: 1.6; color: var(--text-primary);">
                  {{ item.replace(/^\d+[、.]\s*/, '') }}
                </li>
              </ol>

              <div v-if="zaobaoData.weiyu" style="margin-top: 16px; padding: 12px; background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); font-style: italic;">
                💬 {{ zaobaoData.weiyu }}
              </div>
            </div>

            <div v-else style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
              <p>点击下方按钮获取今日早报</p>
              <el-button type="primary" size="small" @click="queryZaobao">获取早报</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

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

        <!-- Section 2.2: 文档数据 -->
        <div class="drawer-section">
          <h3 class="section-title">📁 文档数据</h3>
          <div class="drawer-list">
            <a
              v-for="cloud in drawerCloudLinks"
              :key="cloud.name"
              :href="cloud.url"
              target="_blank"
              rel="noopener noreferrer"
              class="drawer-list-item cloud-link-item"
            >
              <div class="work-name">
                <span>{{ cloud.name }}</span>
                <span class="share-code">提取码：{{ cloud.code }}</span>
              </div>
              <div class="work-desc">{{ cloud.platform }} · {{ cloud.desc }}</div>
            </a>
          </div>
        </div>

        <!-- Section 2.3: AI 开发工具 -->
        <div class="drawer-section">
          <h3 class="section-title">🤖 AI 开发工具</h3>
          <div class="drawer-list ai-dev-tool-list">
            <div
              v-for="tool in drawerAiDevTools"
              :key="tool.name"
              class="drawer-list-item ai-dev-tool-item"
            >
              <a :href="tool.url" target="_blank" rel="noopener noreferrer" class="ai-dev-tool-link">
                <span class="work-name">
                  {{ tool.name }}
                  <em v-if="tool.recommended">推荐</em>
                </span>
                <span class="work-desc">点击打开官网</span>
              </a>
              <details class="ai-dev-tool-desc" :open="tool.recommended">
                <summary>查看简介</summary>
                <p>{{ tool.desc }}</p>
              </details>
            </div>
          </div>
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
            <div class="setting-item music-player-setting">
              <div class="setting-copy">
                <span>音乐播放器</span>
                <em>{{ isAlapiPlayerVisible ? '当前显示' : '当前隐藏' }}</em>
              </div>
              <el-switch
                v-model="isAlapiPlayerVisible"
                inline-prompt
                active-text="显示"
                inactive-text="隐藏"
                @change="toggleAlapiPlayerVisibility"
              />
            </div>
          </div>
        </div>

        <!-- Section 3.5: 历史版本更新 -->
        <div class="drawer-section">
          <h3 class="section-title">🧾 历史版本更新</h3>
          <button class="drawer-list-item version-history-drawer-entry" type="button" @click="openVersionHistoryDialog">
            <div class="work-name">查看 Git 提交历史</div>
            <div class="work-desc">Dialog 对话框 · Card 卡片 · Collapse 折叠面板</div>
          </button>
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
              <span>项目仓库</span>
              <a
                :href="projectRepositoryUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="github-link"
              >
                {{ projectRepositoryName }}
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
            <div class="drawer-contact-actions" aria-label="联系入口">
              <button
                type="button"
                class="drawer-contact-action drawer-contact-qq"
                title="QQ 联系"
                @click="openQqContact"
              >
                QQ
              </button>
              <a
                :href="`mailto:${CONTACT_EMAIL}`"
                class="drawer-contact-action drawer-contact-email"
                title="邮箱联系"
              >
                📧
              </a>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 历史版本更新弹窗 -->
    <el-dialog
      v-model="showVersionHistoryDialog"
      title="🧾 历史版本更新"
      width="72%"
      destroy-on-close
      class="version-history-dialog"
      @closed="handleVersionHistoryClose"
    >
      <div class="version-history-content">
        <el-card v-if="latestVersionItem" class="version-latest-card" shadow="never">
          <div class="version-latest-meta">
            <span class="version-badge">{{ latestVersionItem.type }}</span>
            <span>{{ latestVersionItem.date }} {{ latestVersionItem.time }}</span>
            <button type="button" @click="openCommitOnGithub(latestVersionItem.hash)">
              {{ latestVersionItem.shortHash }}
            </button>
          </div>
          <h3>{{ latestVersionItem.title }}</h3>
          <p>下面根据 Git 提交历史自动整理版本更新记录，首次进入页面会展示一次，关闭后可在右侧控制中心重新打开。</p>
        </el-card>

        <el-tabs v-model="versionHistoryActiveTab" class="version-history-tabs">
          <el-tab-pane :label="`功能更新 (${versionFeatureCount})`" name="feature">
            <el-collapse v-model="versionFeatureActiveDates" class="version-collapse">
              <el-collapse-item
                v-for="group in versionFeatureGroups"
                :key="group.date"
                :name="group.date"
              >
                <template #title>
                  <div class="version-collapse-title">
                    <span>{{ group.date }}</span>
                    <em>{{ group.items.length }} 条功能更新</em>
                  </div>
                </template>

                <div class="version-card-grid">
                  <el-card
                    v-for="item in group.items"
                    :key="item.hash"
                    class="version-card"
                    shadow="hover"
                  >
                    <div class="version-card-header">
                      <span class="version-badge">{{ item.type }}</span>
                      <button type="button" @click="openCommitOnGithub(item.hash)">
                        {{ item.shortHash }}
                      </button>
                    </div>
                    <h4>{{ item.title }}</h4>
                    <p>{{ item.message }}</p>
                    <div class="version-card-footer">
                      <span>{{ item.time }}</span>
                      <span v-if="item.scope">scope: {{ item.scope }}</span>
                    </div>
                  </el-card>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>

          <el-tab-pane :label="`代码更新 (${versionCodeCount})`" name="code">
            <el-collapse v-model="versionCodeActiveDates" class="version-collapse">
              <el-collapse-item
                v-for="group in versionCodeGroups"
                :key="group.date"
                :name="group.date"
              >
                <template #title>
                  <div class="version-collapse-title">
                    <span>{{ group.date }}</span>
                    <em>{{ group.items.length }} 条代码更新</em>
                  </div>
                </template>

                <div class="version-card-grid">
                  <el-card
                    v-for="item in group.items"
                    :key="item.hash"
                    class="version-card version-code-card"
                    shadow="hover"
                  >
                    <div class="version-card-header">
                      <span class="version-badge version-code-badge">{{ item.type }}</span>
                      <button type="button" @click="openCommitOnGithub(item.hash)">
                        {{ item.shortHash }}
                      </button>
                    </div>
                    <h4>{{ item.title }}</h4>
                    <p>{{ item.message }}</p>
                    <div class="version-card-footer">
                      <span>{{ item.time }}</span>
                      <span v-if="item.scope">scope: {{ item.scope }}</span>
                    </div>
                  </el-card>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- 路由页面层（闪存等独立页面） -->
    <div v-if="isFlashRoute" class="route-view-layer">
      <div class="route-view-bar">
        <el-button size="small" @click="backFromFlash">← 返回导航站</el-button>
      </div>
      <router-view />
      <n-back-top
        to=".route-view-layer"
        listen-to=".route-view-layer"
        :right="40"
        :bottom="120"
        :visibility-height="80"
      >
        <div class="route-back-top">↑</div>
      </n-back-top>
    </div>

    <AlapiBottomMusicPlayer />

    <!-- 全局返回顶部 -->
    <n-back-top :right="240" :bottom="30" :visibility-height="80">
      <div class="route-back-top">↑</div>
    </n-back-top>
    </template>
  </div>
</template>

<style scoped lang="scss" src="./App.scss"></style>
