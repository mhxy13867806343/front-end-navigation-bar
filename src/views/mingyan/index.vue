<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument, Refresh, Star, StarFilled, Delete, Search } from '@element-plus/icons-vue'
import { NDatePicker, NSelect } from 'naive-ui'
import draggable from 'vuedraggable'
import { useAutoRefresh } from '../../composables/useAutoRefresh'
import { resolveApiUrl } from '../../utils/resolveApiUrl'

const ALAPI_TOKEN: string = import.meta.env.VITE_ALAPI_TOKEN || 'qgqofofvmxtoskffd37omkscobipmn'
const ALAPI_API_BASE: string = '/api-alapi'

function buildAlapiUrl(path: string): string {
  return resolveApiUrl(`${ALAPI_API_BASE}${path}`)
}

interface MingyanTypeItem {
  label: string
  value: number
}

interface MingyanQuoteItem {
  content: string
  author: string
  typeid?: number
}

interface AlapiResponse<T> {
  code?: number
  success?: boolean
  message?: string
  data?: T
}

interface QinghuaItem {
  content: string
}

interface RiddleTypeItem {
  type: string
  name: string
  desc: string
}

interface RiddleItem {
  title?: string
  content?: string
  answer?: string
  type?: string
}

interface ShiciItem {
  content: string
  author: string
  origin: string
  category?: string
  c1?: string
  c2?: string
  c3?: string
}

// Active Tab & 5s Cooldown State
const activeTab = ref<'mingyan' | 'qinghua' | 'riddle' | 'shici' | 'doutu' | 'word' | 'keyword_nlp' | 'event_history'>('mingyan')
const switchCooldown = ref<number>(0)
let cooldownTimer: number | null = null

const startSwitchCooldown = (): void => {
  switchCooldown.value = 5
  if (cooldownTimer !== null) clearInterval(cooldownTimer)
  cooldownTimer = window.setInterval(() => {
    switchCooldown.value -= 1
    if (switchCooldown.value <= 0) {
      if (cooldownTimer !== null) clearInterval(cooldownTimer)
      cooldownTimer = null
      switchCooldown.value = 0
    }
  }, 1000)
}

const handleBeforeTabLeave = (activeName: any, oldActiveName: any): boolean => {
  if (switchCooldown.value > 0) {
    ElMessage({
      message: `⏳ 切换频次限制：请等待 ${switchCooldown.value} 秒后再进行 Tab 切换！`,
      type: 'warning',
      duration: 2000,
      grouping: true,
      zIndex: 99999
    })
    return false
  }
  startSwitchCooldown()
  return true
}

// State
const categories = ref<MingyanTypeItem[]>([])
const selectedTypeId = ref<number | null>(null)
const currentQuote = ref<MingyanQuoteItem | null>(null)
const loadingCategory = ref<boolean>(false)
const loadingQuote = ref<boolean>(false)

// Qinghua State
const currentQinghua = ref<QinghuaItem | null>(null)
const loadingQinghua = ref<boolean>(false)

// Riddle State
const riddleTypes = ref<RiddleTypeItem[]>([])
const selectedRiddleType = ref<string>('')
const currentRiddle = ref<RiddleItem | null>(null)
const showRiddleAnswer = ref<boolean>(false)
const loadingRiddle = ref<boolean>(false)

// Shici State
const currentShici = ref<ShiciItem | null>(null)
const selectedShiciType = ref<string>('')
const loadingShici = ref<boolean>(false)

const shiciTypes = [
  { label: '🌟 随机全部', value: '' },
  { label: '抒情', value: 'shuqing' },
  { label: '四季', value: 'siji' },
  { label: '山水', value: 'shanshui' },
  { label: '天气', value: 'tianqi' },
  { label: '人物', value: 'renwu' },
  { label: '生活', value: 'shenghuo' },
  { label: '节日', value: 'jieri' },
  { label: '动物', value: 'dongwu' },
  { label: '植物', value: 'zhiwu' },
  { label: '食物', value: 'shiwu' }
]

const favoriteShicis = ref<ShiciItem[]>(
  JSON.parse(localStorage.getItem('favorite_shici_list') || '[]')
)

// Saved Favorite Quotes
const favoriteQuotes = ref<MingyanQuoteItem[]>(
  JSON.parse(localStorage.getItem('favorite_mingyan_quotes') || '[]')
)

const selectedCategoryLabel = computed<string>(() => {
  if (selectedTypeId.value === null) return '全部分类'
  const matched = categories.value.find((c: MingyanTypeItem) => c.value === selectedTypeId.value)
  return matched ? matched.label : '精选语录'
})

const isCurrentFavorite = computed<boolean>(() => {
  if (!currentQuote.value) return false
  return favoriteQuotes.value.some(
    (item: MingyanQuoteItem) => item.content === currentQuote.value?.content && item.author === currentQuote.value?.author
  )
})

const saveCategoriesOrder = (): void => {
  const order: number[] = categories.value.map((c: MingyanTypeItem) => c.value)
  localStorage.setItem('mingyan_categories_order', JSON.stringify(order))
  ElMessage({
    message: '分类标签拖拽排序已自动保存',
    type: 'success',
    duration: 1500,
    grouping: true
  })
}

// Step 1: 先 1 - 获取名人名言类型列表
const fetchCategories = async (): Promise<void> => {
  loadingCategory.value = true
  try {
    const res = await axios.get<AlapiResponse<MingyanTypeItem[]>>(buildAlapiUrl('/api/mingyan/type'), {
      params: { token: ALAPI_TOKEN }
    })
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      const rawList = res.data.data
      const savedOrderStr = localStorage.getItem('mingyan_categories_order')
      if (savedOrderStr) {
        try {
          const savedOrder: number[] = JSON.parse(savedOrderStr)
          if (Array.isArray(savedOrder) && savedOrder.length > 0) {
            const map = new Map<number, MingyanTypeItem>()
            rawList.forEach((item: MingyanTypeItem) => map.set(item.value, item))
            const ordered: MingyanTypeItem[] = []
            savedOrder.forEach((val: number) => {
              if (map.has(val)) {
                ordered.push(map.get(val)!)
                map.delete(val)
              }
            })
            map.forEach((item: MingyanTypeItem) => ordered.push(item))
            categories.value = ordered
            return
          }
        } catch {
          // Fallback to raw list
        }
      }
      categories.value = rawList
    }
  } catch (e) {
    console.error('获取名人名言类型失败', e)
  } finally {
    loadingCategory.value = false
  }
}

// Step 2: 再 2 - 获取指定类型或随机名言内容
const fetchQuote = async (typeid?: number | null, showSuccessToast: boolean = false): Promise<void> => {
  loadingQuote.value = true
  try {
    const params: Record<string, string | number> = {
      token: ALAPI_TOKEN,
      format: 'json'
    }
    if (typeid !== undefined && typeid !== null) {
      params.typeid = typeid
    }

    const res = await axios.get<AlapiResponse<MingyanQuoteItem>>(buildAlapiUrl('/api/mingyan'), { params })
    if (res.data.code === 200 && res.data.data) {
      currentQuote.value = res.data.data
      if (showSuccessToast) {
        ElMessage({
          message: '已刷新获取新的一句名言！',
          type: 'success',
          grouping: true,
          duration: 2000
        })
      }
    } else {
      ElMessage({
        message: res.data.message || '获取名言失败，请重试',
        type: 'error'
      })
    }
  } catch (e) {
    ElMessage({
      message: '网络请求失败，请稍后刷新',
      type: 'error'
    })
  } finally {
    loadingQuote.value = false
  }
}

const selectCategory = (typeid: number | null): void => {
  selectedTypeId.value = typeid
  void fetchQuote(typeid)
}

const handleRefreshQuote = (typeid?: number | null): void => {
  void fetchQuote(typeid, true)
}

const copyQuoteText = (quote: MingyanQuoteItem): void => {
  const text: string = `“${quote.content}” —— ${quote.author || '匿名'}`
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage({
        message: '名言金句已成功复制到剪贴板！',
        type: 'success',
        grouping: true,
        duration: 2000
      })
    }).catch(() => {
      fallbackCopy(text)
    })
  } else {
    fallbackCopy(text)
  }
}

function fallbackCopy(text: string) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  try {
    document.execCommand('copy')
    ElMessage({
      message: '名言金句已成功复制到剪贴板！',
      type: 'success',
      grouping: true,
      duration: 2000
    })
  } catch (err) {
    ElMessage({
      message: '复制失败，请手动选中文本复制',
      type: 'error'
    })
  }
  document.body.removeChild(textArea)
}

const toggleFavorite = (quote: MingyanQuoteItem): void => {
  const idx: number = favoriteQuotes.value.findIndex(
    (item: MingyanQuoteItem) => item.content === quote.content && item.author === quote.author
  )
  if (idx >= 0) {
    favoriteQuotes.value.splice(idx, 1)
    ElMessage({
      message: '已从金句收藏库中取消收藏',
      type: 'info',
      grouping: true
    })
  } else {
    favoriteQuotes.value.unshift({ ...quote, typeid: selectedTypeId.value || quote.typeid })
    ElMessage({
      message: '已成功添加到金句收藏库！',
      type: 'success',
      grouping: true
    })
  }
  localStorage.setItem('favorite_mingyan_quotes', JSON.stringify(favoriteQuotes.value))
}

const confirmRemoveFavorite = (index: number, quote: MingyanQuoteItem): void => {
  ElMessageBox.confirm(
    `确定要从您的金句收藏库中删除这句名言吗？\n\n“${quote.content.substring(0, 20)}${quote.content.length > 20 ? '...' : ''}”`,
    '确认删除提示',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(() => {
    favoriteQuotes.value.splice(index, 1)
    localStorage.setItem('favorite_mingyan_quotes', JSON.stringify(favoriteQuotes.value))
    ElMessage({
      message: '已从金句收藏库中成功删除该名言！',
      type: 'success'
    })
  }).catch(() => {
    ElMessage({
      message: '已取消删除操作',
      type: 'info'
    })
  })
}

const isCategoryExpanded = ref<boolean>(false)

const toggleCategoryExpand = (): void => {
  isCategoryExpanded.value = !isCategoryExpanded.value
}

const { countdown, triggerManualRefresh } = useAutoRefresh({
  intervalSeconds: 120,
  autoStart: true,
  onRefresh: async () => {
    await fetchQuote(selectedTypeId.value, true)
  }
})

const handleTabChange = (name: any): void => {
  if (name === 'mingyan') {
    void fetchQuote(selectedTypeId.value)
  } else if (name === 'qinghua') {
    void fetchQinghua()
  } else if (name === 'riddle') {
    void fetchRiddle()
    void fetchRiddleTypes()
  } else if (name === 'shici') {
    void fetchShici(selectedShiciType.value)
  } else if (name === 'doutu') {
    void fetchDoutu(1)
  } else if (name === 'word') {
    void fetchWord()
  } else if (name === 'keyword_nlp') {
    void fetchNlpKeywords()
  } else if (name === 'event_history') {
    void fetchEventHistory()
  }
}

// Xinhua Word Interfaces & State (新华字典)
interface XinhuaWordItem {
  word: string
  old_word?: string
  strokes?: number | string
  pinyin?: string
  radical?: string
  explanation?: string
  more?: string
}

const wordSearchQuery = ref<string>('爱')
const wordList = ref<XinhuaWordItem[]>([])
const loadingWord = ref<boolean>(false)
const showWordDetailModal = ref<boolean>(false)
const activeWordDetail = ref<XinhuaWordItem | null>(null)

const fetchWord = async (w?: string): Promise<void> => {
  if (w) wordSearchQuery.value = w
  const query = wordSearchQuery.value.trim()
  if (!query) {
    ElMessage({ message: '请输入要查询的单字', type: 'warning' })
    return
  }
  loadingWord.value = true
  try {
    const res = await axios.get<AlapiResponse<XinhuaWordItem[]>>(buildAlapiUrl('/api/word'), {
      params: { token: ALAPI_TOKEN, word: query }
    })
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      wordList.value = res.data.data
    } else {
      ElMessage({ message: res.data.message || '查询字典失败，请换个字重试', type: 'error' })
    }
  } catch {
    ElMessage({ message: '网络请求失败，请稍后刷新', type: 'error' })
  } finally {
    loadingWord.value = false
  }
}

const openWordDetail = (item: XinhuaWordItem): void => {
  activeWordDetail.value = item
  showWordDetailModal.value = true
}

// NLP Keyword Interfaces & State (关键词提取)
interface NlpKeywordItem {
  word: string
  score?: number
}

const nlpText = ref<string>('人工智能与大数据正在深刻改变各行各业的发展与人们的日常生活。')
const nlpNum = ref<number>(5)
const nlpKeywordList = ref<NlpKeywordItem[]>([])
const loadingNlp = ref<boolean>(false)
const showNlpDetailModal = ref<boolean>(false)

const fetchNlpKeywords = async (): Promise<void> => {
  const text = nlpText.value.trim()
  if (!text) {
    ElMessage({ message: '请输入要提取关键词的文本句子', type: 'warning' })
    return
  }
  loadingNlp.value = true
  try {
    const res = await axios.get<AlapiResponse<NlpKeywordItem[] | { keywords: NlpKeywordItem[] }>>(buildAlapiUrl('/api/nlp/keyword'), {
      params: { token: ALAPI_TOKEN, text, num: nlpNum.value }
    })
    if (res.data.code === 200 && res.data.data) {
      if (Array.isArray(res.data.data)) {
        nlpKeywordList.value = res.data.data
      } else if (res.data.data.keywords && Array.isArray(res.data.data.keywords)) {
        nlpKeywordList.value = res.data.data.keywords
      }
    } else {
      ElMessage({ message: res.data.message || '关键词提取失败', type: 'error' })
    }
  } catch {
    ElMessage({ message: '网络请求失败，请稍后刷新', type: 'error' })
  } finally {
    loadingNlp.value = false
  }
}

// Event History Interfaces & State (历史上的今天)
interface EventHistoryItem {
  id: string | number
  title: string
  year?: string | number
  month?: string | number
  day?: string | number
  lsdb?: string
  content?: string
  pic?: string
}

const eventMonth = ref<string>('')
const eventDay = ref<string>('')
const eventDatePickerTimestamp = ref<number | null>(Date.now())
const eventSearchKeyword = ref<string>('')
const eventHistoryList = ref<EventHistoryItem[]>([])
const loadingEventHistory = ref<boolean>(false)
const showEventDetailModal = ref<boolean>(false)
const activeEventDetail = ref<EventHistoryItem | null>(null)
const loadingEventDetail = ref<boolean>(false)

const handleEventDatePickerChange = (ts: number | null): void => {
  if (ts) {
    const d = new Date(ts)
    eventMonth.value = String(d.getMonth() + 1)
    eventDay.value = String(d.getDate())
  } else {
    eventMonth.value = ''
    eventDay.value = ''
  }
  void fetchEventHistory()
}

const fetchEventHistory = async (): Promise<void> => {
  loadingEventHistory.value = true
  try {
    let url = '/api/eventHistory'
    const params: Record<string, string> = { token: ALAPI_TOKEN }
    if (eventSearchKeyword.value.trim()) {
      url = '/api/eventHistory/search'
      params.word = eventSearchKeyword.value.trim()
    } else {
      if (eventMonth.value) params.month = eventMonth.value
      if (eventDay.value) params.day = eventDay.value
    }
    const res = await axios.get<AlapiResponse<EventHistoryItem[]>>(buildAlapiUrl(url), { params })
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      eventHistoryList.value = res.data.data
    } else {
      ElMessage({ message: res.data.message || '获取历史上的今天失败', type: 'error' })
    }
  } catch {
    ElMessage({ message: '网络请求失败，请稍后刷新', type: 'error' })
  } finally {
    loadingEventHistory.value = false
  }
}

const openEventDetail = async (item: EventHistoryItem): Promise<void> => {
  activeEventDetail.value = item
  showEventDetailModal.value = true
  loadingEventDetail.value = true
  try {
    const res = await axios.get<AlapiResponse<EventHistoryItem>>(buildAlapiUrl('/api/eventHistory/get'), {
      params: { token: ALAPI_TOKEN, id: item.id }
    })
    if (res.data.code === 200 && res.data.data) {
      activeEventDetail.value = { ...item, ...res.data.data }
    }
  } catch {
    // keep basic item info
  } finally {
    loadingEventDetail.value = false
  }
}

// Doutu State
const hotDoutuKeywords: string[] = ['搞笑', '熊猫头', '蘑菇头', '狗头', '流汗', '吃瓜', '吃惊']

const doutuKeyword = ref<string>('搞笑')
const doutuPage = ref<number>(1)
const doutuList = ref<string[]>([])
const loadingDoutu = ref<boolean>(false)
const failedDoutuImages = ref<Record<string, boolean>>({})
const showPageNumbersList = ref<boolean>(true)

const doutuSearchHistory = ref<string[]>(
  JSON.parse(localStorage.getItem('doutu_search_history') || '[]')
)

const addDoutuSearchHistory = (kw: string): void => {
  const trimmed = kw.trim()
  if (!trimmed) return
  // 如果在热门搜索预设中，则不记录进搜索历史
  if (hotDoutuKeywords.includes(trimmed)) return

  const idx = doutuSearchHistory.value.indexOf(trimmed)
  if (idx >= 0) {
    doutuSearchHistory.value.splice(idx, 1)
  }
  doutuSearchHistory.value.unshift(trimmed)
  // 最大保留 12 个历史记录
  if (doutuSearchHistory.value.length > 12) {
    doutuSearchHistory.value = doutuSearchHistory.value.slice(0, 12)
  }
  localStorage.setItem('doutu_search_history', JSON.stringify(doutuSearchHistory.value))
}

const confirmClearDoutuHistory = (): void => {
  ElMessageBox.confirm(
    '确定要清空所有的搜索历史记录吗？',
    '确认清空提示',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(() => {
    doutuSearchHistory.value = []
    localStorage.setItem('doutu_search_history', JSON.stringify([]))
    ElMessage({ message: '已成功清空搜索历史记录！', type: 'success' })
  }).catch(() => {
    ElMessage({ message: '已取消操作', type: 'info' })
  })
}

const removeDoutuHistoryItem = (index: number): void => {
  doutuSearchHistory.value.splice(index, 1)
  localStorage.setItem('doutu_search_history', JSON.stringify(doutuSearchHistory.value))
}

const upcomingDoutuPages = computed<number[]>(() => {
  const current = doutuPage.value
  const pages: number[] = []
  for (let i = 0; i <= 5; i++) {
    pages.push(current + i)
  }
  return pages
})

interface SelectOption {
  label: string
  value: number
}

const doutuPageSelectOptions = computed<SelectOption[]>(() => {
  const current = doutuPage.value
  const maxPage = Math.max(current + 10, 50)
  const list: SelectOption[] = []
  for (let i = 1; i <= maxPage; i++) {
    list.push({
      label: `第 ${i} 页`,
      value: i
    })
  }
  return list
})

const handlePageSelectChange = (val: number): void => {
  void fetchDoutu(val)
}

const handleDoutuImageError = (url: string): void => {
  failedDoutuImages.value[url] = true
}

const favoriteDoutus = ref<string[]>(
  JSON.parse(localStorage.getItem('favorite_doutu_list') || '[]')
)

const fetchDoutu = async (page: number = 1): Promise<void> => {
  doutuPage.value = page
  loadingDoutu.value = true
  failedDoutuImages.value = {}
  if (doutuKeyword.value) {
    addDoutuSearchHistory(doutuKeyword.value)
  }
  try {
    const res = await axios.get<AlapiResponse<string[]>>(buildAlapiUrl('/api/doutu'), {
      params: {
        token: ALAPI_TOKEN,
        keyword: doutuKeyword.value || '搞笑',
        page: doutuPage.value
      }
    })
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      doutuList.value = res.data.data
    } else {
      ElMessage({ message: res.data.message || '搜索表情包失败，请换个关键词重试', type: 'error' })
    }
  } catch {
    ElMessage({ message: '网络请求失败，请稍后刷新', type: 'error' })
  } finally {
    loadingDoutu.value = false
  }
}

const isDoutuFavorite = (url: string): boolean => {
  return favoriteDoutus.value.includes(url)
}

const toggleFavoriteDoutu = (url: string): void => {
  const idx = favoriteDoutus.value.indexOf(url)
  if (idx >= 0) {
    favoriteDoutus.value.splice(idx, 1)
    ElMessage({ message: '已从表情包收藏库移除', type: 'info', grouping: true })
  } else {
    favoriteDoutus.value.unshift(url)
    ElMessage({ message: '已成功添加到表情包收藏库！', type: 'success', grouping: true })
  }
  localStorage.setItem('favorite_doutu_list', JSON.stringify(favoriteDoutus.value))
}

const confirmRemoveFavoriteDoutu = (index: number, url: string): void => {
  ElMessageBox.confirm(
    '确定要从收藏库中删除这张表情包吗？',
    '确认删除提示',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(() => {
    favoriteDoutus.value.splice(index, 1)
    localStorage.setItem('favorite_doutu_list', JSON.stringify(favoriteDoutus.value))
    ElMessage({ message: '已成功删除该表情包！', type: 'success' })
  }).catch(() => {
    ElMessage({ message: '已取消删除操作', type: 'info' })
  })
}

const copyDoutuUrl = (url: string): void => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      ElMessage({ message: '表情包图片 URL 已成功复制到剪贴板！', type: 'success', grouping: true })
    })
  }
}

const isCurrentShiciFavorite = computed<boolean>(() => {
  if (!currentShici.value) return false
  return favoriteShicis.value.some(
    item => item.content === currentShici.value?.content && item.origin === currentShici.value?.origin
  )
})

const fetchShici = async (type?: string): Promise<void> => {
  loadingShici.value = true
  try {
    const params: Record<string, string> = { token: ALAPI_TOKEN, format: 'json' }
    if (type) params.type = type
    const res = await axios.get<AlapiResponse<ShiciItem>>(buildAlapiUrl('/api/shici'), { params })
    if (res.data.code === 200 && res.data.data) {
      currentShici.value = res.data.data
    } else {
      ElMessage({ message: res.data.message || '获取古诗词失败', type: 'error' })
    }
  } catch {
    ElMessage({ message: '网络连接失败，请稍后刷新', type: 'error' })
  } finally {
    loadingShici.value = false
  }
}

const selectShiciType = (type: string): void => {
  selectedShiciType.value = type
  void fetchShici(type)
}

const copyShiciText = (item: ShiciItem): void => {
  const text = `“${item.content}” —— 《${item.origin}》 · ${item.author}`
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage({ message: '古典诗词已成功复制到剪贴板！', type: 'success', grouping: true })
    })
  }
}

const toggleFavoriteShici = (item: ShiciItem): void => {
  const idx = favoriteShicis.value.findIndex(
    i => i.content === item.content && i.origin === item.origin
  )
  if (idx >= 0) {
    favoriteShicis.value.splice(idx, 1)
    ElMessage({ message: '已取消收藏该诗词', type: 'info', grouping: true })
  } else {
    favoriteShicis.value.unshift({ ...item })
    ElMessage({ message: '已成功添加到古诗词收藏库！', type: 'success', grouping: true })
  }
  localStorage.setItem('favorite_shici_list', JSON.stringify(favoriteShicis.value))
}

const confirmRemoveFavoriteShici = (index: number, item: ShiciItem): void => {
  ElMessageBox.confirm(
    `确定要从收藏库中删除《${item.origin}》这首诗词吗？\n\n“${item.content.substring(0, 20)}${item.content.length > 20 ? '...' : ''}”`,
    '确认删除提示',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(() => {
    favoriteShicis.value.splice(index, 1)
    localStorage.setItem('favorite_shici_list', JSON.stringify(favoriteShicis.value))
    ElMessage({ message: '已成功删除该诗词！', type: 'success' })
  }).catch(() => {
    ElMessage({ message: '已取消删除操作', type: 'info' })
  })
}

const fetchQinghua = async (): Promise<void> => {
  loadingQinghua.value = true
  try {
    const res = await axios.get<AlapiResponse<QinghuaItem>>(buildAlapiUrl('/api/qinghua'), {
      params: { token: ALAPI_TOKEN, format: 'json' }
    })
    if (res.data.code === 200 && res.data.data) {
      currentQinghua.value = res.data.data
    } else {
      ElMessage({ message: res.data.message || '获取土味情话失败', type: 'error' })
    }
  } catch {
    ElMessage({ message: '网络连接失败，请刷新', type: 'error' })
  } finally {
    loadingQinghua.value = false
  }
}

const copyQinghuaText = (text: string): void => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(`“${text}”`).then(() => {
      ElMessage({ message: '土味情话已成功复制到剪贴板！', type: 'success', grouping: true })
    })
  }
}

// Favorite Qinghuas
const favoriteQinghuas = ref<QinghuaItem[]>(
  JSON.parse(localStorage.getItem('favorite_qinghua_list') || '[]')
)

const isCurrentQinghuaFavorite = computed<boolean>(() => {
  if (!currentQinghua.value) return false
  return favoriteQinghuas.value.some(item => item.content === currentQinghua.value?.content)
})

const toggleFavoriteQinghua = (item: QinghuaItem): void => {
  const idx = favoriteQinghuas.value.findIndex(i => i.content === item.content)
  if (idx >= 0) {
    favoriteQinghuas.value.splice(idx, 1)
    ElMessage({ message: '已取消收藏该情话', type: 'info', grouping: true })
  } else {
    favoriteQinghuas.value.unshift({ ...item })
    ElMessage({ message: '已成功添加到土味情话收藏库！', type: 'success', grouping: true })
  }
  localStorage.setItem('favorite_qinghua_list', JSON.stringify(favoriteQinghuas.value))
}

const confirmRemoveFavoriteQinghua = (index: number, item: QinghuaItem): void => {
  ElMessageBox.confirm(
    `确定要从收藏库中删除这句情话吗？\n\n“${item.content}”`,
    '确认删除提示',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(() => {
    favoriteQinghuas.value.splice(index, 1)
    localStorage.setItem('favorite_qinghua_list', JSON.stringify(favoriteQinghuas.value))
    ElMessage({ message: '已成功删除该情话！', type: 'success' })
  }).catch(() => {
    ElMessage({ message: '已取消删除操作', type: 'info' })
  })
}

// Favorite Riddles
const favoriteRiddles = ref<RiddleItem[]>(
  JSON.parse(localStorage.getItem('favorite_riddle_list') || '[]')
)

const isCurrentRiddleFavorite = computed<boolean>(() => {
  if (!currentRiddle.value) return false
  const q = currentRiddle.value.title || currentRiddle.value.content
  return favoriteRiddles.value.some(item => (item.title || item.content) === q)
})

const toggleFavoriteRiddle = (item: RiddleItem): void => {
  const q = item.title || item.content
  const idx = favoriteRiddles.value.findIndex(i => (i.title || i.content) === q)
  if (idx >= 0) {
    favoriteRiddles.value.splice(idx, 1)
    ElMessage({ message: '已取消收藏该谜语', type: 'info', grouping: true })
  } else {
    favoriteRiddles.value.unshift({ ...item })
    ElMessage({ message: '已成功添加到谜语收藏库！', type: 'success', grouping: true })
  }
  localStorage.setItem('favorite_riddle_list', JSON.stringify(favoriteRiddles.value))
}

const confirmRemoveFavoriteRiddle = (index: number, item: RiddleItem): void => {
  const q = item.title || item.content
  ElMessageBox.confirm(
    `确定要从收藏库中删除这道谜语吗？\n\n“${q}”`,
    '确认删除提示',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(() => {
    favoriteRiddles.value.splice(index, 1)
    localStorage.setItem('favorite_riddle_list', JSON.stringify(favoriteRiddles.value))
    ElMessage({ message: '已成功删除该谜语！', type: 'success' })
  }).catch(() => {
    ElMessage({ message: '已取消删除操作', type: 'info' })
  })
}

const fetchRiddleTypes = async (): Promise<void> => {
  try {
    const res = await axios.get<AlapiResponse<RiddleTypeItem[]>>(buildAlapiUrl('/api/riddle/type'), {
      params: { token: ALAPI_TOKEN }
    })
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      riddleTypes.value = res.data.data
    }
  } catch (e) {
    console.error('获取谜语类型失败', e)
  }
}

const fetchRiddle = async (type?: string): Promise<void> => {
  loadingRiddle.value = true
  showRiddleAnswer.value = false
  try {
    if (type) {
      const res = await axios.get<AlapiResponse<RiddleItem[]>>(buildAlapiUrl('/api/riddle'), {
        params: { token: ALAPI_TOKEN, type, page: 1 }
      })
      if (res.data.code === 200 && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const randomIndex = Math.floor(Math.random() * res.data.data.length)
        currentRiddle.value = res.data.data[randomIndex]
      }
    } else {
      const res = await axios.get<AlapiResponse<RiddleItem>>(buildAlapiUrl('/api/riddle/random'), {
        params: { token: ALAPI_TOKEN }
      })
      if (res.data.code === 200 && res.data.data) {
        currentRiddle.value = res.data.data
      }
    }
  } catch {
    ElMessage({ message: '获取谜语题目失败', type: 'error' })
  } finally {
    loadingRiddle.value = false
  }
}

const selectRiddleType = (type: string): void => {
  selectedRiddleType.value = type
  void fetchRiddle(type)
}

onMounted(async () => {
  await fetchCategories()
  await fetchQuote()
})
</script>

<template>
  <div class="mingyan-page">
    <!-- Header Banner -->
    <header class="header-banner">
      <div class="header-content">
        <div class="title-row">
          <h1 class="page-title">📜 名人名言与智慧语录</h1>
        </div>
        <p class="page-subtitle">感悟古今名家智慧，汲取灵魂的力量与灵感。</p>
      </div>
    </header>

    <main class="main-container">
      <!-- 顶级 Tab 导航栏 (带 5s 切换频次限制) -->
      <section class="tabs-nav-section" style="margin-bottom: 24px;">
        <el-tabs
          v-model="activeTab"
          type="card"
          class="custom-culture-tabs"
          :before-leave="handleBeforeTabLeave"
          @tab-change="handleTabChange"
        >
          <el-tab-pane name="mingyan" label="📜 名人名言" />
          <el-tab-pane name="qinghua" label="❤️ 土味情话" />
          <el-tab-pane name="riddle" label="🧩 趣味谜语" />
          <el-tab-pane name="shici" label="🏮 经典诗词" />
          <el-tab-pane name="doutu" label="🤪 搞笑表情包" />
          <el-tab-pane name="word" label="📖 新华字典" />
          <el-tab-pane name="keyword_nlp" label="🏷️ 关键词提取" />
          <el-tab-pane name="event_history" label="📅 历史上的今天" />
        </el-tabs>
        <div v-if="switchCooldown > 0" class="cooldown-notice-bar" style="margin-top: 8px; font-size: 13px; color: #eab308; background: rgba(234, 179, 8, 0.12); border: 1px solid rgba(234, 179, 8, 0.25); padding: 6px 14px; border-radius: 8px; font-weight: 500;">
          ⏳ Tab 切换频次限制中：请等待 {{ switchCooldown }} 秒后再进行下一次切换...
        </div>
      </section>

      <!-- TAB 1: 📜 名人名言 -->
      <div v-if="activeTab === 'mingyan'">
        <!-- Step 1: 先 1 - 名人名言类型选择栏 -->
        <section class="category-section" v-loading="loadingCategory">
          <div class="category-header">
            <span class="section-title">🏷️ 名言分类 (除了全部随机，其余分类按住可自由拖拽排序)</span>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="badge-count">{{ categories.length }} 个主题类型</span>
              <button
                type="button"
                class="expand-toggle-btn"
                @click="toggleCategoryExpand"
              >
                {{ isCategoryExpanded ? '收起分类 🔼' : '展开更多 🔽' }}
              </button>
            </div>
          </div>
          <div class="category-tags" :class="{ expanded: isCategoryExpanded }">
            <!-- 固定的首选项：全部随机 -->
            <button
              type="button"
              class="category-pill fixed-pill"
              :class="{ active: selectedTypeId === null }"
              @click="selectCategory(null)"
            >
              🌟 全部随机
            </button>

            <!-- 可拖拽排序的其他分类列表 -->
            <draggable
              v-model="categories"
              item-key="value"
              class="draggable-category-container"
              ghost-class="sortable-ghost"
              drag-class="sortable-drag"
              @end="saveCategoriesOrder"
            >
              <template #item="{ element: cat }">
                <button
                  type="button"
                  class="category-pill draggable-pill"
                  :class="{ active: selectedTypeId === cat.value }"
                  @click="selectCategory(cat.value)"
                >
                  <span class="drag-handle" title="按住拖拽排序">⋮⋮</span>
                  {{ cat.label }}
                </button>
              </template>
            </draggable>
          </div>
          <div class="expand-footer-bar" @click="toggleCategoryExpand">
            <span class="expand-text">
              {{ isCategoryExpanded ? '点击收起分类 🔼' : '点击查看更多分类 🔽' }}
            </span>
          </div>
        </section>

        <!-- Step 2: 再 2 - 名人名言主展卡片 -->
        <section class="hero-quote-card" v-loading="loadingQuote">
          <div class="quote-badge-bar">
            <span class="type-tag-badge">🏷️ {{ selectedCategoryLabel }}</span>
            <div class="auto-refresh-control" style="display: flex; align-items: center; gap: 8px;">
              <span class="countdown-badge" style="font-size: 12px; color: #c084fc; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); padding: 4px 12px; border-radius: 14px; font-weight: 600;">
                ⏳ {{ countdown }}s 自动刷新
              </span>
              <el-button
                type="primary"
                plain
                circle
                :icon="Refresh"
                :loading="loadingQuote"
                title="手动刷新并重置 120s 倒计时"
                @click="triggerManualRefresh"
              />
            </div>
          </div>

          <template v-if="currentQuote">
            <div class="quote-body-text">
              “{{ currentQuote.content }}”
            </div>

            <div class="quote-author-line" style="display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-bottom: 24px;">
              <span style="width: 24px; height: 2px; background: #a855f7;"></span>
              <span style="font-size: 16px; font-weight: 700; color: #e2e8f0;">—— {{ currentQuote.author || '网络收集' }}</span>
            </div>

            <div class="quote-actions-row" style="display: flex; gap: 12px; flex-wrap: wrap;">
              <el-button
                type="primary"
                size="large"
                :icon="Refresh"
                :loading="loadingQuote"
                @click="triggerManualRefresh"
              >
                🔄 换一句 / 刷新
              </el-button>

              <el-button
                type="default"
                size="large"
                :icon="CopyDocument"
                @click="copyQuoteText(currentQuote)"
              >
                📋 一键复制
              </el-button>

              <el-button
                :type="isCurrentFavorite ? 'warning' : 'default'"
                size="large"
                :icon="isCurrentFavorite ? StarFilled : Star"
                @click="toggleFavorite(currentQuote)"
              >
                {{ isCurrentFavorite ? '已收藏' : '⭐ 收藏金句' }}
              </el-button>
            </div>
          </template>

          <template v-else>
            <el-empty description="点击上方分类或刷新按钮获取名人名言" />
          </template>
        </section>

        <!-- 收藏与历史金句库 -->
        <section v-if="favoriteQuotes.length > 0" class="favorites-section">
          <h2 class="history-section-title">⭐ 我的金句收藏库 ({{ favoriteQuotes.length }})</h2>
          <div class="history-quotes-grid">
            <div v-for="(item, idx) in favoriteQuotes" :key="idx" class="quote-item-card">
              <div class="item-quote-content">“{{ item.content }}”</div>
              <div class="item-footer">
                <span class="item-author">—— {{ item.author || '匿名' }}</span>
                <div class="item-actions">
                  <el-button
                    size="small"
                    circle
                    :icon="CopyDocument"
                    title="复制"
                    @click="copyQuoteText(item)"
                  />
                  <el-button
                    size="small"
                    type="danger"
                    plain
                    circle
                    :icon="Delete"
                    title="删除收藏"
                    @click="confirmRemoveFavorite(idx, item)"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- TAB 2: ❤️ 土味情话 -->
      <div v-else-if="activeTab === 'qinghua'">
        <div class="hero-quote-card qinghua-card" v-loading="loadingQinghua" style="background: linear-gradient(135deg, rgba(40, 20, 45, 0.95), rgba(20, 10, 25, 0.98)); border-color: rgba(244, 63, 94, 0.25);">
          <div class="quote-badge-bar">
            <span class="type-tag-badge" style="background: rgba(244, 63, 94, 0.2); color: #fb7185; border-color: rgba(244, 63, 94, 0.3);">❤️ 浪漫土味情话</span>
            <el-button type="danger" plain circle :icon="Refresh" :loading="loadingQinghua" title="换一句情话" @click="fetchQinghua" />
          </div>
          <div v-if="currentQinghua" class="quote-body-text" style="font-size: 24px; color: #ffe4e6; line-height: 1.8; margin-top: 16px;">
            “{{ currentQinghua.content }}”
          </div>
          <div class="quote-actions-row" style="margin-top: 32px; display: flex; gap: 12px; flex-wrap: wrap;">
            <el-button type="danger" size="large" :icon="Refresh" :loading="loadingQinghua" @click="fetchQinghua">🔄 换一句情话</el-button>
            <el-button type="default" size="large" :icon="CopyDocument" @click="copyQinghuaText(currentQinghua?.content || '')">📋 复制情话</el-button>
            <el-button
              v-if="currentQinghua"
              :type="isCurrentQinghuaFavorite ? 'warning' : 'default'"
              size="large"
              :icon="isCurrentQinghuaFavorite ? StarFilled : Star"
              @click="toggleFavoriteQinghua(currentQinghua)"
            >
              {{ isCurrentQinghuaFavorite ? '已收藏' : '⭐ 收藏情话' }}
            </el-button>
          </div>
        </div>

        <!-- 土味情话收藏库 -->
        <section v-if="favoriteQinghuas.length > 0" class="favorites-section" style="margin-top: 24px;">
          <h2 class="history-section-title" style="color: #fb7185;">⭐ 我的情话收藏库 ({{ favoriteQinghuas.length }})</h2>
          <div class="history-quotes-grid">
            <div v-for="(item, idx) in favoriteQinghuas" :key="idx" class="quote-item-card" style="border-color: rgba(244, 63, 94, 0.2);">
              <div class="item-quote-content">“{{ item.content }}”</div>
              <div class="item-footer" style="justify-content: flex-end;">
                <div class="item-actions">
                  <el-button size="small" circle :icon="CopyDocument" title="复制" @click="copyQinghuaText(item.content)" />
                  <el-button size="small" type="danger" plain circle :icon="Delete" title="删除" @click="confirmRemoveFavoriteQinghua(idx, item)" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- TAB 3: 🧩 趣味谜语 -->
      <div v-else-if="activeTab === 'riddle'" class="riddle-container" v-loading="loadingRiddle">
        <!-- 谜语类型筛选 -->
        <div v-if="riddleTypes.length" class="category-section" style="margin-bottom: 20px;">
          <div class="category-header">
            <span class="section-title">🧩 谜语分类筛选</span>
          </div>
          <div class="category-tags" style="max-height: none; overflow: visible;">
            <button
              type="button"
              class="category-pill"
              :class="{ active: selectedRiddleType === '' }"
              @click="selectRiddleType('')"
            >
              🌟 随机全部
            </button>
            <button
              v-for="rt in riddleTypes"
              :key="rt.type"
              type="button"
              class="category-pill"
              :class="{ active: selectedRiddleType === rt.type }"
              @click="selectRiddleType(rt.type)"
            >
              {{ rt.name }}
            </button>
          </div>
        </div>

        <div class="hero-quote-card riddle-card" style="background: linear-gradient(135deg, rgba(20, 30, 50, 0.95), rgba(10, 15, 30, 0.98)); border-color: rgba(59, 130, 246, 0.25);">
          <div class="quote-badge-bar">
            <span class="type-tag-badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; border-color: rgba(59, 130, 246, 0.3);">🧩 猜谜挑战</span>
            <el-button type="primary" plain circle :icon="Refresh" :loading="loadingRiddle" title="换一道题" @click="fetchRiddle(selectedRiddleType)" />
          </div>

          <div v-if="currentRiddle" style="margin-top: 16px;">
            <div style="font-size: 22px; font-weight: 700; color: #f8fafc; margin-bottom: 16px; line-height: 1.6;">
              ❓ 谜面：{{ currentRiddle.title || currentRiddle.content }}
            </div>

            <!-- 揭晓谜底按钮 -->
            <div style="margin-top: 24px; padding: 20px; background: rgba(15, 23, 42, 0.6); border: 1px dashed rgba(255,255,255,0.1); border-radius: 16px;">
              <div v-if="!showRiddleAnswer" style="display: flex; align-items: center; justify-content: space-between;">
                <span style="color: #94a3b8; font-size: 14px;">🤔 遇到难题了？点击揭开谜底答案吧</span>
                <el-button type="warning" size="medium" @click="showRiddleAnswer = true">👁️ 点击揭晓谜底</el-button>
              </div>
              <div v-else style="font-size: 18px; font-weight: 700; color: #4ade80; display: flex; align-items: center; gap: 10px;">
                <span>💡 谜底答案：</span>
                <span style="background: rgba(74, 222, 128, 0.15); padding: 4px 14px; border-radius: 8px; border: 1px solid rgba(74, 222, 128, 0.3);">{{ currentRiddle.answer || '暂无答案' }}</span>
                <el-button size="small" type="info" plain @click="showRiddleAnswer = false" style="margin-left: auto;">隐藏谜底</el-button>
              </div>
            </div>
          </div>

          <div class="quote-actions-row" style="margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap;">
            <el-button type="primary" size="large" :icon="Refresh" :loading="loadingRiddle" @click="fetchRiddle(selectedRiddleType)">🔄 换一道谜语</el-button>
            <el-button
              v-if="currentRiddle"
              :type="isCurrentRiddleFavorite ? 'warning' : 'default'"
              size="large"
              :icon="isCurrentRiddleFavorite ? StarFilled : Star"
              @click="toggleFavoriteRiddle(currentRiddle)"
            >
              {{ isCurrentRiddleFavorite ? '已收藏' : '⭐ 收藏谜语' }}
            </el-button>
          </div>
        </div>

        <!-- 谜语收藏库 -->
        <section v-if="favoriteRiddles.length > 0" class="favorites-section" style="margin-top: 24px;">
          <h2 class="history-section-title" style="color: #60a5fa;">⭐ 我的谜语收藏库 ({{ favoriteRiddles.length }})</h2>
          <div class="history-quotes-grid">
            <div v-for="(item, idx) in favoriteRiddles" :key="idx" class="quote-item-card" style="border-color: rgba(59, 130, 246, 0.2);">
              <div class="item-quote-content" style="color: #f8fafc; font-weight: 600;">❓ {{ item.title || item.content }}</div>
              <div style="font-size: 13px; color: #4ade80; margin-top: 6px; font-weight: 600;">💡 答案：{{ item.answer || '暂无' }}</div>
              <div class="item-footer" style="justify-content: flex-end; margin-top: 10px;">
                <div class="item-actions">
                  <el-button size="small" type="danger" plain circle :icon="Delete" title="删除" @click="confirmRemoveFavoriteRiddle(idx, item)" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- TAB 4: 🏮 经典诗词 -->
      <div v-else-if="activeTab === 'shici'" class="shici-container" v-loading="loadingShici">
        <!-- 诗词类型筛选 -->
        <div class="category-section" style="margin-bottom: 20px;">
          <div class="category-header">
            <span class="section-title">🏮 古诗词类型筛选</span>
          </div>
          <div class="category-tags" style="max-height: none; overflow: visible;">
            <button
              v-for="st in shiciTypes"
              :key="st.value"
              type="button"
              class="category-pill"
              :class="{ active: selectedShiciType === st.value }"
              @click="selectShiciType(st.value)"
            >
              {{ st.label }}
            </button>
          </div>
        </div>

        <div class="hero-quote-card shici-card" style="background: linear-gradient(135deg, rgba(30, 25, 45, 0.95), rgba(15, 10, 25, 0.98)); border-color: rgba(234, 179, 8, 0.25);">
          <div class="quote-badge-bar">
            <span class="type-tag-badge" style="background: rgba(234, 179, 8, 0.2); color: #facc15; border-color: rgba(234, 179, 8, 0.3);">
              🏮 {{ currentShici?.category || '中华经典古诗词' }}
            </span>
            <el-button type="warning" plain circle :icon="Refresh" :loading="loadingShici" title="换一首诗词" @click="fetchShici(selectedShiciType)" />
          </div>

          <div v-if="currentShici" style="margin-top: 16px;">
            <div class="quote-body-text" style="font-size: 24px; color: #fef08a; line-height: 1.8;">
              “{{ currentShici.content }}”
            </div>

            <div class="quote-author-line" style="display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 20px;">
              <span style="width: 24px; height: 2px; background: #facc15;"></span>
              <span style="font-size: 16px; font-weight: 700; color: #fef08a;">—— 《{{ currentShici.origin }}》 · {{ currentShici.author || '佚名' }}</span>
            </div>
          </div>

          <div class="quote-actions-row" style="margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap;">
            <el-button type="warning" size="large" :icon="Refresh" :loading="loadingShici" @click="fetchShici(selectedShiciType)">🔄 换一首诗词</el-button>
            <el-button
              v-if="currentShici"
              type="default"
              size="large"
              :icon="CopyDocument"
              @click="copyShiciText(currentShici)"
            >
              📋 复制诗词
            </el-button>
            <el-button
              v-if="currentShici"
              :type="isCurrentShiciFavorite ? 'warning' : 'default'"
              size="large"
              :icon="isCurrentShiciFavorite ? StarFilled : Star"
              @click="toggleFavoriteShici(currentShici)"
            >
              {{ isCurrentShiciFavorite ? '已收藏' : '⭐ 收藏诗词' }}
            </el-button>
          </div>
        </div>

        <!-- 诗词收藏库 -->
        <section v-if="favoriteShicis.length > 0" class="favorites-section" style="margin-top: 24px;">
          <h2 class="history-section-title" style="color: #facc15;">⭐ 我的古诗词收藏库 ({{ favoriteShicis.length }})</h2>
          <div class="history-quotes-grid">
            <div v-for="(item, idx) in favoriteShicis" :key="idx" class="quote-item-card" style="border-color: rgba(234, 179, 8, 0.25);">
              <div class="item-quote-content" style="color: #fef08a; font-weight: 600;">“{{ item.content }}”</div>
              <div class="item-footer">
                <span class="item-author" style="color: #fef08a;">—— 《{{ item.origin }}》 · {{ item.author }}</span>
                <div class="item-actions">
                  <el-button size="small" circle :icon="CopyDocument" title="复制" @click="copyShiciText(item)" />
                  <el-button size="small" type="danger" plain circle :icon="Delete" title="删除" @click="confirmRemoveFavoriteShici(idx, item)" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- TAB 5: 🤪 搞笑表情包 -->
      <div v-else-if="activeTab === 'doutu'" class="doutu-container" v-loading="loadingDoutu">
        <!-- 搜索与快捷关键词 -->
        <div class="category-section" style="margin-bottom: 20px;">
          <div class="category-header">
            <span class="section-title">🤪 搜表情包 / 斗图图片</span>
          </div>
          <div style="display: flex; gap: 10px; margin-bottom: 14px;">
            <el-input
              v-model="doutuKeyword"
              placeholder="输入表情包关键词，如 搞笑 / 熊猫头 / 蘑菇头"
              size="large"
              clearable
              @keyup.enter="fetchDoutu(1)"
            />
            <el-button type="primary" size="large" :icon="Search" @click="fetchDoutu(1)">🔍 搜索表情包</el-button>
          </div>
          <div class="category-tags" style="max-height: none; overflow: visible;">
            <span style="font-size: 13px; color: #94a3b8; align-self: center;">热门搜索：</span>
            <button
              v-for="kw in hotDoutuKeywords"
              :key="kw"
              type="button"
              class="category-pill"
              :class="{ active: doutuKeyword === kw }"
              @click="doutuKeyword = kw; fetchDoutu(1);"
            >
              {{ kw }}
            </button>
          </div>

          <!-- 搜索历史记录 (最大 12 个，自动排除热门搜索预设，支持一键确认清空与小叉删除) -->
          <div v-if="doutuSearchHistory.length > 0" class="category-tags" style="margin-top: 12px; max-height: none; overflow: visible; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 13px; color: #a855f7; font-weight: 600; align-self: center;">🕒 搜索历史：</span>
            <button
              v-for="(hKw, hIdx) in doutuSearchHistory"
              :key="hIdx"
              type="button"
              class="category-pill"
              :class="{ active: doutuKeyword === hKw }"
              style="display: inline-flex; align-items: center; gap: 6px; padding-right: 8px;"
              @click="doutuKeyword = hKw; fetchDoutu(1);"
            >
              <span>{{ hKw }}</span>
              <span
                style="font-size: 12px; opacity: 0.7; color: #ef4444; border-radius: 50%; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.15);"
                title="删除该条历史"
                @click.stop="removeDoutuHistoryItem(hIdx)"
              >✕</span>
            </button>

            <el-button
              size="small"
              type="danger"
              plain
              style="margin-left: auto;"
              @click="confirmClearDoutuHistory"
            >
              🗑️ 清空历史
            </el-button>
          </div>
        </div>

        <!-- 顶部分页控制栏 (包含下拉菜单 1-N 页直接跳转与可打击的数字页码) -->
        <div class="doutu-pagination-bar" style="margin-bottom: 20px; display: flex; justify-content: center; align-items: center; gap: 12px; flex-wrap: wrap; background: rgba(22, 19, 43, 0.6); padding: 14px 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <el-button
            type="primary"
            plain
            :disabled="doutuPage <= 1 || loadingDoutu"
            @click="fetchDoutu(doutuPage - 1)"
          >
            ◀ 上一页
          </el-button>

          <span style="font-size: 14px; font-weight: 700; color: #c084fc;">
            📄 第 {{ doutuPage }} 页
          </span>

          <!-- 快速下拉跳页 Dropdown Select -->
          <div style="width: 110px;">
            <n-select
              :value="doutuPage"
              :options="doutuPageSelectOptions"
              placeholder="选择页码"
              size="small"
              @update:value="handlePageSelectChange"
            />
          </div>

          <el-button
            type="primary"
            plain
            :disabled="doutuList.length === 0 || loadingDoutu"
            @click="fetchDoutu(doutuPage + 1)"
          >
            下一页 ▶
          </el-button>

          <el-button
            size="small"
            type="info"
            plain
            style="margin-left: 8px;"
            @click="showPageNumbersList = !showPageNumbersList"
          >
            {{ showPageNumbersList ? '🙈 隐藏页码' : '🔢 展开页码' }}
          </el-button>

          <div v-if="showPageNumbersList" style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <button
              v-for="pNum in upcomingDoutuPages"
              :key="pNum"
              type="button"
              class="category-pill"
              :class="{ active: doutuPage === pNum }"
              style="padding: 4px 12px; font-size: 13px; font-weight: 700; border-radius: 12px;"
              @click="fetchDoutu(pNum)"
            >
              {{ pNum }}
            </button>
          </div>
        </div>

        <!-- 表情包图片网格 (支持预览、复制链接、收藏，加载失败时自动隐藏操作按钮) -->
        <div v-if="doutuList.length > 0" class="doutu-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px;">
          <div v-for="(imgUrl, idx) in doutuList" :key="idx" class="doutu-card" style="background: rgba(22, 19, 43, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 12px; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
            <el-image
              :src="imgUrl"
              fit="contain"
              :preview-src-list="doutuList"
              :initial-index="idx"
              style="width: 100%; height: 140px; border-radius: 8px; cursor: pointer; background: rgba(0,0,0,0.2);"
              loading="lazy"
              @error="handleDoutuImageError(imgUrl)"
            />
            <div v-if="!failedDoutuImages[imgUrl]" style="display: flex; gap: 8px; margin-top: 10px; width: 100%; justify-content: center;">
              <el-button size="small" circle :icon="CopyDocument" title="复制图片链接" @click="copyDoutuUrl(imgUrl)" />
              <el-button
                size="small"
                :type="isDoutuFavorite(imgUrl) ? 'warning' : 'default'"
                circle
                :icon="isDoutuFavorite(imgUrl) ? StarFilled : Star"
                title="收藏表情包"
                @click="toggleFavoriteDoutu(imgUrl)"
              />
            </div>
            <div v-else style="margin-top: 10px; font-size: 12px; color: #94a3b8; font-weight: 500; text-align: center;">
              🚫 图片失效已隐藏
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无表情包图片，请尝试其他关键词" />

        <!-- 底部分页控制栏 (包含下拉菜单 1-N 页直接跳转与可打击的数字页码) -->
        <div class="doutu-pagination-bar" style="margin-top: 28px; display: flex; justify-content: center; align-items: center; gap: 12px; flex-wrap: wrap; background: rgba(22, 19, 43, 0.6); padding: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <el-button
            type="primary"
            plain
            :disabled="doutuPage <= 1 || loadingDoutu"
            @click="fetchDoutu(doutuPage - 1)"
          >
            ◀ 上一页
          </el-button>

          <span style="font-size: 14px; font-weight: 700; color: #c084fc;">
            📄 第 {{ doutuPage }} 页
          </span>

          <!-- 快速下拉跳页 Dropdown Select -->
          <div style="width: 110px;">
            <n-select
              :value="doutuPage"
              :options="doutuPageSelectOptions"
              placeholder="选择页码"
              size="small"
              @update:value="handlePageSelectChange"
            />
          </div>

          <el-button
            type="primary"
            plain
            :disabled="doutuList.length === 0 || loadingDoutu"
            @click="fetchDoutu(doutuPage + 1)"
          >
            下一页 ▶
          </el-button>

          <el-button
            size="small"
            type="info"
            plain
            style="margin-left: 8px;"
            @click="showPageNumbersList = !showPageNumbersList"
          >
            {{ showPageNumbersList ? '🙈 隐藏页码' : '🔢 展开页码' }}
          </el-button>

          <div v-if="showPageNumbersList" style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <button
              v-for="pNum in upcomingDoutuPages"
              :key="pNum"
              type="button"
              class="category-pill"
              :class="{ active: doutuPage === pNum }"
              style="padding: 4px 12px; font-size: 13px; font-weight: 700; border-radius: 12px;"
              @click="fetchDoutu(pNum)"
            >
              {{ pNum }}
            </button>
          </div>
        </div>

        <!-- 表情包收藏库 -->
        <section v-if="favoriteDoutus.length > 0" class="favorites-section" style="margin-top: 32px;">
          <h2 class="history-section-title" style="color: #c084fc;">⭐ 我的表情包收藏库 ({{ favoriteDoutus.length }})</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px;">
            <div v-for="(favUrl, idx) in favoriteDoutus" :key="idx" class="quote-item-card" style="border-color: rgba(168, 85, 247, 0.25); padding: 10px; display: flex; flex-direction: column; align-items: center;">
              <el-image
                :src="favUrl"
                fit="contain"
                :preview-src-list="favoriteDoutus"
                :initial-index="idx"
                style="width: 100%; height: 110px; border-radius: 8px;"
              />
              <div style="display: flex; gap: 6px; margin-top: 8px;">
                <el-button size="small" circle :icon="CopyDocument" title="复制链接" @click="copyDoutuUrl(favUrl)" />
                <el-button size="small" type="danger" plain circle :icon="Delete" title="删除收藏" @click="confirmRemoveFavoriteDoutu(idx, favUrl)" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- TAB 6: 📖 新华字典 -->
      <div v-else-if="activeTab === 'word'" class="word-container" v-loading="loadingWord">
        <div class="category-section" style="margin-bottom: 20px;">
          <div class="category-header">
            <span class="section-title">📖 新华字典在线检索</span>
          </div>
          <div style="display: flex; gap: 10px; margin-bottom: 14px;">
            <el-input
              v-model="wordSearchQuery"
              placeholder="请输入单字，如 爱 / 华 / 龙"
              size="large"
              clearable
              maxlength="2"
              @keyup.enter="fetchWord()"
            />
            <el-button type="primary" size="large" :icon="Search" @click="fetchWord()">🔍 查询字典</el-button>
          </div>
          <div class="category-tags" style="max-height: none; overflow: visible;">
            <span style="font-size: 13px; color: #94a3b8; align-self: center;">常用汉字：</span>
            <button
              v-for="w in ['爱', '德', '福', '龙', '华', '夏', '智', '慧']"
              :key="w"
              type="button"
              class="category-pill"
              :class="{ active: wordSearchQuery === w }"
              @click="fetchWord(w)"
            >
              {{ w }}
            </button>
          </div>
        </div>

        <!-- 汉字结果列表卡片 (点击按钮才展示详情弹窗) -->
        <div v-if="wordList.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px;">
          <div v-for="(item, idx) in wordList" :key="idx" class="hero-quote-card" style="background: rgba(22, 19, 43, 0.85); border-color: rgba(59, 130, 246, 0.3); padding: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <span style="font-size: 36px; font-weight: 900; color: #60a5fa; background: rgba(59, 130, 246, 0.15); width: 60px; height: 60px; display: inline-flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.3);">
                {{ item.word }}
              </span>
              <div style="text-align: right;">
                <div style="font-size: 16px; font-weight: 700; color: #f8fafc;">拼音：{{ item.pinyin || '暂无' }}</div>
                <div style="font-size: 13px; color: #94a3b8;">部首：{{ item.radical || '-' }} | 笔画：{{ item.strokes || '-' }}</div>
              </div>
            </div>
            <div style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 16px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              {{ item.explanation || item.more || '暂无释义' }}
            </div>
            <el-button type="primary" size="medium" style="width: 100%; font-weight: 600;" @click="openWordDetail(item)">
              🔍 点击查看详细释义与全解 📖
            </el-button>
          </div>
        </div>
        <el-empty v-else description="未查找到该字，请换个字重试" />
      </div>

      <!-- TAB 7: 🏷️ 关键词提取 -->
      <div v-else-if="activeTab === 'keyword_nlp'" class="nlp-container" v-loading="loadingNlp">
        <div class="hero-quote-card" style="background: linear-gradient(135deg, rgba(30, 20, 45, 0.95), rgba(15, 10, 25, 0.98)); border-color: rgba(168, 85, 247, 0.3);">
          <div class="quote-badge-bar">
            <span class="type-tag-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border-color: rgba(168, 85, 247, 0.3);">
              🏷️ NLP 智能文本关键词提取
            </span>
          </div>

          <div style="margin-top: 16px;">
            <el-input
              v-model="nlpText"
              type="textarea"
              :rows="4"
              placeholder="输入需要提取关键词的长句或段落..."
              size="large"
            />
            <div style="display: flex; gap: 12px; align-items: center; margin-top: 14px; flex-wrap: wrap;">
              <span style="color: #94a3b8; font-size: 14px;">提取数量：</span>
              <el-input-number v-model="nlpNum" :min="1" :max="10" size="small" style="width: 110px;" />
              <el-button type="primary" size="large" :icon="Search" @click="fetchNlpKeywords()">⚡ 立即提取关键词</el-button>
            </div>
          </div>

          <!-- 提取到的关键词标签列 -->
          <div v-if="nlpKeywordList.length > 0" style="margin-top: 24px; padding: 20px; background: rgba(15, 23, 42, 0.6); border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 15px; font-weight: 700; color: #e2e8f0; margin-bottom: 12px;">🎯 提取到的关键词结果：</div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px;">
              <span
                v-for="(kw, idx) in nlpKeywordList"
                :key="idx"
                style="background: rgba(168, 85, 247, 0.2); color: #e9d5ff; border: 1px solid rgba(168, 85, 247, 0.4); padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 14px;"
              >
                {{ kw.word }} <span v-if="kw.score" style="font-size: 11px; opacity: 0.7;">({{ kw.score.toFixed(2) }})</span>
              </span>
            </div>
            <el-button type="warning" plain size="medium" @click="showNlpDetailModal = true">
              🔍 查看关键词权重分析弹窗 📊
            </el-button>
          </div>
        </div>
      </div>

      <!-- TAB 8: 📅 历史上的今天 -->
      <div v-else-if="activeTab === 'event_history'" class="event-container" v-loading="loadingEventHistory">
        <div class="category-section" style="margin-bottom: 20px;">
          <div class="category-header">
            <span class="section-title">📅 历史上的今天大事件查询</span>
          </div>
          <div style="display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;">
            <el-input
              v-model="eventSearchKeyword"
              placeholder="搜索历史事件关键词（可选），如 科技 / 战役 / 统一"
              size="large"
              clearable
              style="flex: 1; min-width: 240px;"
              @keyup.enter="fetchEventHistory()"
            />
            <!-- Naive UI DatePicker 日期选择器组件 -->
            <div style="width: 170px;">
              <n-date-picker
                :value="eventDatePickerTimestamp"
                type="date"
                clearable
                placeholder="选择历史日期"
                size="large"
                @update:value="handleEventDatePickerChange"
              />
            </div>
            <el-button type="primary" size="large" :icon="Search" @click="fetchEventHistory()">🔍 查询历史事件</el-button>
          </div>
        </div>

        <!-- 历史事件网格列表 (严格遵守用户指令：点击按钮才弹窗展示详情) -->
        <div v-if="eventHistoryList.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px;">
          <div v-for="item in eventHistoryList" :key="item.id" class="hero-quote-card" style="background: rgba(22, 19, 43, 0.85); border-color: rgba(234, 179, 8, 0.25); padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-size: 13px; font-weight: 700; color: #facc15; background: rgba(234, 179, 8, 0.15); padding: 4px 10px; border-radius: 10px; border: 1px solid rgba(234, 179, 8, 0.3);">
                  📅 {{ item.year || item.lsdb || '历史时刻' }} 年
                </span>
                <span v-if="item.month && item.day" style="font-size: 12px; color: #94a3b8;">{{ item.month }}月{{ item.day }}日</span>
              </div>
              <div style="font-size: 17px; font-weight: 700; color: #f8fafc; line-height: 1.5; margin-bottom: 16px;">
                {{ item.title }}
              </div>
            </div>

            <!-- 点击才在弹窗展示详情 -->
            <el-button type="warning" size="medium" style="width: 100%; font-weight: 700;" @click="openEventDetail(item)">
              📖 点击查看历史事件详情 🔍
            </el-button>
          </div>
        </div>
        <el-empty v-else description="暂无历史事件记录" />
      </div>

      <!-- 弹窗 1: 新华字典详细释义 Modal -->
      <el-dialog v-model="showWordDetailModal" title="📖 新华字典 - 详细字义" width="600px" center append-to-body destroy-on-close>
        <div v-if="activeWordDetail" style="padding: 10px 20px;">
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px; background: rgba(59, 130, 246, 0.1); padding: 16px; border-radius: 14px; border: 1px solid rgba(59, 130, 246, 0.2);">
            <span style="font-size: 48px; font-weight: 900; color: #60a5fa;">{{ activeWordDetail.word }}</span>
            <div>
              <div style="font-size: 18px; font-weight: 700; color: #f8fafc;">拼音：{{ activeWordDetail.pinyin || '暂无' }}</div>
              <div style="font-size: 14px; color: #94a3b8; margin-top: 4px;">繁体：{{ activeWordDetail.old_word || activeWordDetail.word }} | 部首：{{ activeWordDetail.radical || '-' }} | 总笔画：{{ activeWordDetail.strokes || '-' }}</div>
            </div>
          </div>
          <div style="font-size: 15px; font-weight: 700; color: #e2e8f0; margin-bottom: 8px;">📚 详细释义说明：</div>
          <div style="font-size: 14px; color: #cbd5e1; line-height: 1.8; white-space: pre-wrap; background: rgba(0,0,0,0.3); padding: 14px; border-radius: 10px; max-height: 300px; overflow-y: auto;">
            {{ activeWordDetail.explanation || activeWordDetail.more || '暂无更多详细解释' }}
          </div>
        </div>
      </el-dialog>

      <!-- 弹窗 2: NLP 关键词提取分析 Modal -->
      <el-dialog v-model="showNlpDetailModal" title="🏷️ 关键词提取 - 权重分析详情" width="600px" center append-to-body destroy-on-close>
        <div style="padding: 10px 20px;">
          <div style="font-size: 14px; color: #94a3b8; margin-bottom: 12px;">原文内容：</div>
          <div style="font-size: 14px; color: #e2e8f0; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px; margin-bottom: 20px; line-height: 1.6;">
            “{{ nlpText }}”
          </div>
          <div style="font-size: 15px; font-weight: 700; color: #c084fc; margin-bottom: 12px;">📊 提取到的核心词与权重列表：</div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div v-for="(kw, idx) in nlpKeywordList" :key="idx" style="display: flex; justify-content: space-between; align-items: center; background: rgba(168, 85, 247, 0.1); padding: 10px 16px; border-radius: 10px; border: 1px solid rgba(168, 85, 247, 0.2);">
              <span style="font-size: 16px; font-weight: 700; color: #f8fafc;">#{{ idx + 1 }} {{ kw.word }}</span>
              <span style="font-size: 13px; font-weight: 700; color: #c084fc;">权重得分: {{ kw.score ? kw.score.toFixed(4) : '高' }}</span>
            </div>
          </div>
        </div>
      </el-dialog>

      <!-- 弹窗 3: 历史上的今天事件详情 Modal -->
      <el-dialog v-model="showEventDetailModal" title="📅 历史上的今天 - 事件详情" width="680px" center append-to-body destroy-on-close>
        <div v-loading="loadingEventDetail" style="padding: 10px 20px;">
          <template v-if="activeEventDetail">
            <div style="font-size: 20px; font-weight: 900; color: #f8fafc; line-height: 1.5; margin-bottom: 14px;">
              {{ activeEventDetail.title }}
            </div>
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px;">
              <span style="font-size: 13px; font-weight: 700; color: #facc15; background: rgba(234, 179, 8, 0.15); padding: 4px 12px; border-radius: 8px; border: 1px solid rgba(234, 179, 8, 0.3);">
                📅 {{ activeEventDetail.year || activeEventDetail.lsdb }} 年
              </span>
              <span v-if="activeEventDetail.month && activeEventDetail.day" style="font-size: 13px; color: #94a3b8;">
                {{ activeEventDetail.month }}月{{ activeEventDetail.day }}日
              </span>
            </div>

            <div v-if="activeEventDetail.pic" style="margin-bottom: 16px; text-align: center;">
              <el-image :src="activeEventDetail.pic" fit="contain" style="max-height: 260px; border-radius: 10px;" />
            </div>

            <div style="font-size: 14px; color: #cbd5e1; line-height: 1.8; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 12px; max-height: 340px; overflow-y: auto; white-space: pre-wrap;">
              {{ activeEventDetail.content || activeEventDetail.title }}
            </div>
          </template>
        </div>
      </el-dialog>
    </main>
  </div>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
