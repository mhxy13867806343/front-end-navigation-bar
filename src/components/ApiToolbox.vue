<script setup lang="ts">
import { GENDER_OPTIONS } from '@/vue-pages-text-fn-abc/formOptions'

import { ElMessage, ElMessageBox } from 'element-plus'
import apiCategoriesData from '../utlis/api_list.json'
import { jsonHeaders, request, requestJson } from '@/utils/request'
import { resolveApiUrl } from '@/utils/resolveApiUrl'

type ApiValue = string | number | boolean
type QueryInputs = Record<string, ApiValue>
type PublicDataKind = 'zhihu' | 'bejson' | 'pokemon' | 'pexels' | 'video' | 'game' | 'generic'
type UnknownRecord = Record<string, unknown>

interface ApiResponse<T = unknown> {
  code?: number
  data?: T
  message?: string
}

interface UserProfile {
  nickname?: string
  username?: string
  account_id?: string | number
  email?: string
  bio?: string
  gender?: string
  age?: number
  location?: string
}

interface MomentItem {
  id: string | number
  account_id?: string | number
  created_at?: string
  content?: string
}

interface ArticleItem {
  id: string | number
  category?: string
  title?: string
  desc?: string
  content?: string
  created_at?: string
}

interface JsonStoreItem {
  id: string | number
  name?: string
  content?: string
  created_at?: string
}

interface CloudFileItem {
  id: string | number
  filename?: string
  file_type?: string
}

interface ApiParamOption {
  label: string
  value: ApiValue
}

interface ApiParam {
  name: string
  label?: string
  description?: string
  type: 'text' | 'number' | 'select' | 'switch' | string
  placeholder?: string
  required?: boolean
  default?: ApiValue
  options?: ApiParamOption[]
}

interface ApiEndpoint {
  name: string
  desc?: string
  baseUrl?: string
  path: string
  method: string
  params: ApiParam[]
  pathParams: ApiParam[]
  hasBody: boolean
  bodyPlaceholder: string
  headers?: Record<string, string>
  skipAuth?: boolean
  responseType?: 'json' | 'text'
  categoryName?: string
}

interface PublicDataItem {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  url: string
  tags: string[]
  extra: string[]
}

interface ArticleForm {
  title: string
  desc: string
  content: string
  category: string
}

interface JsonForm {
  name: string
  content: string
}

interface ProfileForm {
  nickname: string
  email: string
  bio: string
  gender: string
  age: number
  location: string
}

const apiCategories = apiCategoriesData as Record<string, ApiEndpoint[]>

// Main mode toggle: 'app' (Application Workspace) or 'sandbox' (Developer API Sandbox)
const activeMode = ref<string>('app')

// JWT Auth Token state
const authToken = ref<string>(localStorage.getItem('auth_token') || '')
const userProfile = ref<UserProfile | null>(null)

const saveToken = (): void => {
  localStorage.setItem('auth_token', authToken.value)
}

// ----------------------------------------------------
// Mode 1: App Workspace - Auth & Register State
// ----------------------------------------------------
const authTab = ref<string>('login') // 'login' or 'register'
const username = ref<string>('')
const password = ref<string>('')
const isAuthLoading = ref<boolean>(false)

const handleAuth = async (): Promise<void> => {
  if (username.value.length < 3) {
    ElMessage.warning('用户名长度不能小于 3 位')
    return
  }
  if (password.value.length < 6) {
    ElMessage.warning('密码长度不能小于 6 位')
    return
  }

  isAuthLoading.value = true
  const path: string = authTab.value === 'login' ? '/api/auth/login' : '/api/auth/register'
  const url: string = `https://api.apiopen.top${path}`

  try {
    const json = await requestJson<ApiResponse<{ token?: string; accessToken?: string }>>(url, {
      method: 'POST',
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })
    
    if (json && json.code === 200) {
      if (authTab.value === 'login') {
        authToken.value = json.data?.token || json.data?.accessToken || ''
        saveToken()
        ElMessage.success('🔓 登录成功！已成功加载个人工作台。')
        fetchUserProfile()
      } else {
        ElMessage.success('🎉 注册成功！请使用刚注册的账号进行登录。')
        authTab.value = 'login'
        password.value = ''
      }
    } else {
      ElMessage.error(json.message || '操作失败，请重试')
    }
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : String(err)
    ElMessage.error(`网络故障: ${message}`)
  } finally {
    isAuthLoading.value = false
  }
}

const fetchUserProfile = async (): Promise<void> => {
  if (!authToken.value) return
  try {
    const json = await requestJson<ApiResponse<UserProfile>>('https://api.apiopen.top/api/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      }
    })
    if (json && json.code === 200) {
      const data: UserProfile | undefined = json.data
      if (data) {
        if (!data.nickname || data.nickname.includes('?')) {
          data.nickname = '爱丽丝 (Alice)'
        }
        if (!data.bio || data.bio.includes('?')) {
          data.bio = '前端开发工程师 | 接口联调沙盒账户'
        }
        if (!data.location || data.location.includes('?')) {
          data.location = '北京'
        }
      }
      userProfile.value = data || null
    } else if (json && json.code === 401) {
      // Token expired
      logout()
    }
  } catch (err: unknown) {
    console.error(err)
  }
}

const logout = (): void => {
  authToken.value = ''
  saveToken()
  userProfile.value = null
  ElMessage.info('已退出登录。')
}

// Quick Login with alice
const isLoggingIn = ref<boolean>(false)
const quickLogin = async (): Promise<void> => {
  isLoggingIn.value = true
  try {
    const json = await requestJson<ApiResponse<{ token?: string }>>('https://api.apiopen.top/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'alice',
        password: 'password123'
      })
    })
    if (json && json.code === 200 && json.data && json.data.token) {
      authToken.value = json.data.token
      saveToken()
      ElMessage.success('🔓 一键快速登录成功！已载入测试账户 alice 的 Token。')
      fetchUserProfile()
    } else {
      ElMessage.error(`登录失败: ${json.message || '未知错误'}`)
    }
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : String(err)
    ElMessage.error(`网络错误: ${message}`)
  } finally {
    isLoggingIn.value = false
  }
}

// ----------------------------------------------------
// Mode 1: App Workspace - Content Tabs (Dashboard)
// ----------------------------------------------------
const currentAppTab = ref<string>('moments') // 'moments', 'articles', 'json', 'files', 'profile'

// Moments State
const momentsList = ref<MomentItem[]>([])
const newMomentText = ref<string>('')
const isMomentsLoading = ref<boolean>(false)

const fetchMoments = async (): Promise<void> => {
  isMomentsLoading.value = true
  try {
    const json = await requestJson<ApiResponse<{ list?: MomentItem[] } | MomentItem[]>>('https://api.apiopen.top/api/moments?page=1&size=20', {
      method: 'GET'
    })
    if (json && json.code === 200) {
      const data = json.data
      momentsList.value = Array.isArray(data) ? data : data?.list || []
    }
  } catch (err: unknown) {
    console.error(err)
  } finally {
    isMomentsLoading.value = false
  }
}

const publishMoment = async (): Promise<void> => {
  if (!newMomentText.value.trim()) {
    ElMessage.warning('请输入动态内容')
    return
  }
  try {
    const json = await requestJson<ApiResponse>('https://api.apiopen.top/api/moments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      },
      body: JSON.stringify({
        content: newMomentText.value,
        attachments: ''
      })
    })
    if (json && json.code === 200) {
      ElMessage.success('🎉 动态发布成功！')
      newMomentText.value = ''
      fetchMoments()
    } else {
      ElMessage.error(json.message || '发布失败')
    }
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : String(err)
    ElMessage.error(`请求异常: ${message}`)
  }
}

const likeMoment = async (momentId: string | number): Promise<void> => {
  try {
    const json = await requestJson<ApiResponse>(`https://api.apiopen.top/api/moments/${momentId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      }
    })
    if (json && json.code === 200) {
      ElMessage.success('👍 点赞成功！')
      fetchMoments()
    } else {
      ElMessage.warning(json.message || '已点过赞了')
    }
  } catch (err: unknown) {
    console.error(err)
  }
}

// Articles State
const articlesList = ref<ArticleItem[]>([])
const isArticlesLoading = ref<boolean>(false)
const showCreateArticleDialog = ref<boolean>(false)
const newArticle = reactive<ArticleForm>({
  title: '',
  desc: '',
  content: '',
  category: '技术'
})

const fetchArticles = async (): Promise<void> => {
  isArticlesLoading.value = true
  try {
    const json = await requestJson<ApiResponse<{ list?: ArticleItem[] } | ArticleItem[]>>('https://api.apiopen.top/api/articles/my?page=1&size=20', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      }
    })
    if (json && json.code === 200) {
      const data = json.data
      articlesList.value = Array.isArray(data) ? data : data?.list || []
    }
  } catch (err: unknown) {
    console.error(err)
  } finally {
    isArticlesLoading.value = false
  }
}

const createArticleSubmit = async (): Promise<void> => {
  if (!newArticle.title || !newArticle.content) {
    ElMessage.warning('标题和内容为必填项')
    return
  }
  try {
    const json = await requestJson<ApiResponse>('https://api.apiopen.top/api/articles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      },
      body: JSON.stringify({
        title: newArticle.title,
        desc: newArticle.desc,
        content: newArticle.content,
        category: newArticle.category
      })
    })
    if (json && json.code === 200) {
      ElMessage.success('📝 文章发表成功！')
      showCreateArticleDialog.value = false
      newArticle.title = ''
      newArticle.desc = ''
      newArticle.content = ''
      fetchArticles()
    } else {
      ElMessage.error(json.message || '发表失败')
    }
  } catch (err: unknown) {
    console.error(err)
  }
}

// JSON Warehouse State
const jsonList = ref<JsonStoreItem[]>([])
const isJsonLoading = ref<boolean>(false)
const showCreateJsonDialog = ref<boolean>(false)
const newJsonObj = reactive<JsonForm>({
  name: '',
  content: ''
})

const fetchJsons = async (): Promise<void> => {
  isJsonLoading.value = true
  try {
    const json = await requestJson<ApiResponse<{ list?: JsonStoreItem[] } | JsonStoreItem[]>>('https://api.apiopen.top/api/json/my?page=1&size=20', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      }
    })
    if (json && json.code === 200) {
      const data = json.data
      jsonList.value = Array.isArray(data) ? data : data?.list || []
    }
  } catch (err: unknown) {
    console.error(err)
  } finally {
    isJsonLoading.value = false
  }
}

const createJsonSubmit = async (): Promise<void> => {
  if (!newJsonObj.name || !newJsonObj.content) {
    ElMessage.warning('仓库名和 JSON 内容为必填项')
    return
  }
  try {
    // Validate JSON formatting
    JSON.parse(newJsonObj.content)
  } catch (_e: unknown) {
    ElMessage.error('JSON 内容格式非法，请输入合法的 JSON 报文')
    return
  }

  try {
    const json = await requestJson<ApiResponse>('https://api.apiopen.top/api/json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      },
      body: JSON.stringify({
        name: newJsonObj.name,
        content: newJsonObj.content
      })
    })
    if (json && json.code === 200) {
      ElMessage.success('🗄️ JSON 数据保存成功！')
      showCreateJsonDialog.value = false
      newJsonObj.name = ''
      newJsonObj.content = ''
      fetchJsons()
    } else {
      ElMessage.error(json.message || '保存失败')
    }
  } catch (err: unknown) {
    console.error(err)
  }
}

const deleteJsonRecord = async (id: string | number): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要删除这条 JSON 仓库记录吗？', '提示', { type: 'warning' })
    const json = await requestJson<ApiResponse>(`https://api.apiopen.top/api/json/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      }
    })
    if (json && json.code === 200) {
      ElMessage.success('删除成功')
      fetchJsons()
    } else {
      ElMessage.error(json.message || '删除失败')
    }
  } catch (err: unknown) {
    console.log(err)
  }
}

// File Cloud Drive State
const filesList = ref<CloudFileItem[]>([])
const isFilesLoading = ref<boolean>(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const fetchFiles = async (): Promise<void> => {
  isFilesLoading.value = true
  try {
    const json = await requestJson<ApiResponse<{ list?: CloudFileItem[] } | CloudFileItem[]>>('https://api.apiopen.top/api/files/my?page=1&size=20', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      }
    })
    if (json && json.code === 200) {
      const data = json.data
      filesList.value = Array.isArray(data) ? data : data?.list || []
    }
  } catch (err: unknown) {
    console.error(err)
  } finally {
    isFilesLoading.value = false
  }
}

const handleFileUpload = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement | null
  const file: File | undefined = target?.files?.[0]
  if (!file) return

  const formData: FormData = new FormData()
  formData.append('file', file)

  ElMessage.info('文件上传中，请稍候...')
  try {
    const json = await requestJson<ApiResponse>('https://api.apiopen.top/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      },
      body: formData
    })
    if (json && json.code === 200) {
      ElMessage.success('📁 文件上传成功！')
      fetchFiles()
    } else {
      ElMessage.error(json.message || '文件上传失败')
    }
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : String(err)
    ElMessage.error(`网络故障: ${message}`)
  }
}

const deleteFileRecord = async (id: string | number): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要从云端删除这个文件吗？', '提示', { type: 'warning' })
    const json = await requestJson<ApiResponse>(`https://api.apiopen.top/api/files/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      }
    })
    if (json && json.code === 200) {
      ElMessage.success('删除文件成功')
      fetchFiles()
    } else {
      ElMessage.error(json.message || '删除失败')
    }
  } catch (err: unknown) {
    console.log(err)
  }
}

// User Profile Settings State
const profileForm = reactive<ProfileForm>({
  nickname: '',
  email: '',
  bio: '',
  gender: 'male',
  age: 25,
  location: ''
})

const initProfileForm = (): void => {
  if (userProfile.value) {
    profileForm.nickname = userProfile.value.nickname || ''
    profileForm.email = userProfile.value.email || ''
    profileForm.bio = userProfile.value.bio || ''
    profileForm.gender = userProfile.value.gender || 'male'
    profileForm.age = userProfile.value.age || 25
    profileForm.location = userProfile.value.location || ''
  }
}

const updateProfileSubmit = async (): Promise<void> => {
  try {
    const json = await requestJson<ApiResponse>('https://api.apiopen.top/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken.value}`
      },
      body: JSON.stringify(profileForm)
    })
    if (json && json.code === 200) {
      ElMessage.success('👤 个人资料修改成功！')
      fetchUserProfile()
    } else {
      ElMessage.error(json.message || '更新失败')
    }
  } catch (err: unknown) {
    console.error(err)
  }
}

// Watchers to trigger load events when changing workspace tabs
watch(currentAppTab, (newTab: string): void => {
  if (!authToken.value) return
  if (newTab === 'moments') fetchMoments()
  else if (newTab === 'articles') fetchArticles()
  else if (newTab === 'json') fetchJsons()
  else if (newTab === 'files') fetchFiles()
  else if (newTab === 'profile') initProfileForm()
})

// Initialize application
onMounted(() => {
  if (authToken.value) {
    fetchUserProfile()
    fetchMoments()
  }
})

// ----------------------------------------------------
// Mode 2: Sandbox Developer Settings (Old variables)
// ----------------------------------------------------
const categoriesList = computed<string[]>((): string[] => ['所有接口列表', ...Object.keys(apiCategories)])
const selectedCategory = ref<string>('所有接口列表')
const selectedApi = ref<ApiEndpoint | null>(null)
const activeEndpoints = computed<ApiEndpoint[]>(() => {
  if (selectedCategory.value === '所有接口列表') {
    const list: ApiEndpoint[] = []
    Object.entries(apiCategories).forEach(([catName, endpoints]: [string, ApiEndpoint[]]): void => {
      endpoints.forEach((ep: ApiEndpoint): void => {
        list.push({ ...ep, categoryName: catName })
      })
    })
    return list
  }
  return apiCategories[selectedCategory.value] || []
})

const pathInputs = reactive<QueryInputs>({})
const queryInputs = reactive<QueryInputs>({})
const sandboxBodyContent = ref<string>('')
const sandboxLoading = ref<boolean>(false)
const sandboxResponse = ref<string | null>(null)
const sandboxHeaders = ref<string>('')
const sandboxRequestUrl = ref<string>('')
const envPlaceholderRegexp: RegExp = /\{\{([A-Z0-9_]+)\}\}/g
const publicDataCategories: ReadonlySet<string> = new Set<string>([
  'ALAPI知乎日报',
  'BEJSON免费接口',
  'PokeAPI',
  'Pexels视频',
  '开放视频接口',
  '游戏接口'
])
const publicDataItems = ref<PublicDataItem[]>([])
const publicDataLoading = ref<boolean>(false)
const publicDataError = ref<string>('')
const publicDataUpdatedAt = ref<string>('')

const isPublicDataCategory = computed<boolean>((): boolean => publicDataCategories.has(selectedCategory.value))

const getEndpointKey = (endpoint: ApiEndpoint): string => {
  return [
    endpoint.categoryName || selectedCategory.value,
    endpoint.baseUrl || 'https://api.apiopen.top',
    endpoint.method,
    endpoint.path,
    endpoint.name
  ].join('::')
}

const resolveTemplateValue = (value: string): string => {
  return value.replace(envPlaceholderRegexp, (_match: string, key: string): string => {
    const resolved: unknown = import.meta.env[key]
    return resolved === undefined || resolved === null ? '' : String(resolved)
  })
}

const buildEndpointUrl = (api: ApiEndpoint, path: string): string => {
  if (/^https?:\/\//i.test(path)) return path

  const baseUrl: string = api.baseUrl || 'https://api.apiopen.top'
  return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const toDisplayText = (value: unknown): string => {
  if (value === undefined || value === null) return ''
  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

const pickText = (source: UnknownRecord, keys: string[]): string => {
  for (const key of keys) {
    const value: unknown = source[key]
    const text: string = toDisplayText(value)
    if (text) return text
  }
  return ''
}

const normalizeMediaUrl = (url: string, kind: PublicDataKind): string => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/') && kind === 'video') return `https://tilvids.com${url}`
  return url
}

const pickImage = (source: UnknownRecord, kind: PublicDataKind): string => {
  const directImage: string = pickText(source, [
    'image',
    'cover',
    'thumbnail',
    'thumbnailUrl',
    'thumbnail_url',
    'background_image',
    'main_image'
  ])
  if (directImage) return normalizeMediaUrl(directImage, kind)

  const sprites: unknown = source.sprites
  if (isRecord(sprites)) {
    return normalizeMediaUrl(pickText(sprites, ['front_default', 'front_shiny']), kind)
  }

  const thumbnails: unknown = source.thumbnails
  if (Array.isArray(thumbnails)) {
    const firstThumbnail: unknown = thumbnails.find((item: unknown): boolean => isRecord(item) && Boolean(item.fileUrl || item.url || item.path))
    if (isRecord(firstThumbnail)) {
      return normalizeMediaUrl(pickText(firstThumbnail, ['fileUrl', 'url', 'path']), kind)
    }
  }

  return ''
}

const getPublicDataKind = (category: string): PublicDataKind => {
  if (category === 'ALAPI知乎日报') return 'zhihu'
  if (category === 'BEJSON免费接口') return 'bejson'
  if (category === 'PokeAPI') return 'pokemon'
  if (category === 'Pexels视频') return 'pexels'
  if (category === '开放视频接口') return 'video'
  if (category === '游戏接口') return 'game'
  return 'generic'
}

const getPublicDataIcon = (kind: PublicDataKind): string => {
  const iconMap: Record<PublicDataKind, string> = {
    zhihu: '📰',
    bejson: '🧰',
    pokemon: '⚡',
    pexels: '🎬',
    video: '📺',
    game: '🎮',
    generic: '📦'
  }
  return iconMap[kind]
}

const extractPublicArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []

  const data: unknown = payload.data
  if (Array.isArray(data)) return data
  if (isRecord(data)) {
    const nestedKeys: string[] = ['stories', 'top_stories', 'results', 'videos', 'items', 'list', 'games', 'deals', 'giveaways']
    for (const key of nestedKeys) {
      const nestedValue: unknown = data[key]
      if (Array.isArray(nestedValue)) return nestedValue
    }
    return [data]
  }

  const rootKeys: string[] = ['stories', 'top_stories', 'results', 'videos', 'items', 'list', 'games', 'deals', 'giveaways']
  for (const key of rootKeys) {
    const rootValue: unknown = payload[key]
    if (Array.isArray(rootValue)) return rootValue
  }

  return [payload]
}

const getItemTags = (source: UnknownRecord, kind: PublicDataKind): string[] => {
  const rawTags: string[] = [
    pickText(source, ['category', 'genre', 'platform', 'type', 'status']),
    pickText(source, ['release_date', 'publishedAt', 'published_at', 'salePrice', 'normalPrice'])
  ].filter(Boolean)

  if (kind === 'pokemon') {
    const types: unknown = source.types
    if (Array.isArray(types)) {
      rawTags.push(...types.map((item: unknown): string => {
        if (!isRecord(item) || !isRecord(item.type)) return ''
        return pickText(item.type, ['name'])
      }).filter(Boolean))
    }
  }

  return Array.from(new Set(rawTags)).slice(0, 4)
}

const toPublicDataItem = (item: unknown, index: number, kind: PublicDataKind): PublicDataItem => {
  const source: UnknownRecord = isRecord(item) ? item : { value: item }
  const title: string = pickText(source, ['title', 'name', 'word', 'displayName', 'shortUUID', 'gameTitle']) || `${getPublicDataIcon(kind)} 数据 ${index + 1}`
  const subtitle: string = pickText(source, ['author', 'user_name', 'developer', 'publisher', 'pinyin', 'channel', 'artist', 'owner']) || selectedCategory.value
  const description: string = pickText(source, [
    'desc',
    'description',
    'short_description',
    'explanation',
    'truncatedDescription',
    'body',
    'content',
    'deck'
  ]) || '点击刷新可获取最新数据。'
  const url: string = pickText(source, ['url', 'article_url', 'game_url', 'open_giveaway_url', 'steamAppID', 'dealID'])
  const id: string = pickText(source, ['id', 'uuid', 'shortUUID', 'gameID', 'dealID']) || `${kind}-${index}`

  return {
    id: `${kind}-${id}-${index}`,
    title,
    subtitle,
    description,
    image: pickImage(source, kind),
    url: url.startsWith('http') ? url : '',
    tags: getItemTags(source, kind),
    extra: [
      pickText(source, ['views', 'likes', 'downloads']).replace(/^$/, ''),
      pickText(source, ['duration', 'rating', 'metacriticScore']).replace(/^$/, '')
    ].filter(Boolean)
  }
}

const normalizePublicResponse = (payload: unknown, category: string): PublicDataItem[] => {
  const kind: PublicDataKind = getPublicDataKind(category)
  return extractPublicArray(payload)
    .slice(0, 24)
    .map((item: unknown, index: number): PublicDataItem => toPublicDataItem(item, index, kind))
}

const getVisibleParams = (params: ApiParam[] = []): ApiParam[] => {
  return params.filter((param: ApiParam): boolean => param.name !== 'token')
}

const buildCurrentEndpointUrl = (api: ApiEndpoint): string => {
  let path: string = api.path
  if (api.pathParams) {
    api.pathParams.forEach((param: ApiParam): void => {
      const value: string = String(pathInputs[param.name] || param.default || '')
      path = path.replace(`{${param.name}}`, value)
    })
  }

  let url: string = buildEndpointUrl(api, path)
  const queryParams: URLSearchParams = new URLSearchParams()
  Object.keys(queryInputs).forEach((key: string): void => {
    const value: ApiValue = queryInputs[key]
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value))
    }
  })
  const queryString: string = queryParams.toString()
  if (queryString) url += `?${queryString}`
  return url
}

const fetchPublicData = async (): Promise<void> => {
  if (!selectedApi.value || !isPublicDataCategory.value) return
  const currentApiKey: string = getEndpointKey(selectedApi.value)
  const isActiveApi: boolean = activeEndpoints.value.some((endpoint: ApiEndpoint): boolean => getEndpointKey(endpoint) === currentApiKey)
  if (!isActiveApi) return

  publicDataLoading.value = true
  publicDataError.value = ''
  publicDataItems.value = []
  const api: ApiEndpoint = selectedApi.value
  const headers: Record<string, string> = jsonHeaders()

  Object.entries(api.headers || {}).forEach(([key, value]: [string, string]): void => {
    const resolvedValue: string = resolveTemplateValue(value)
    if (resolvedValue) headers[key] = resolvedValue
  })

  try {
    const response: Response = await request(buildCurrentEndpointUrl(api), { method: api.method, headers })
    const responseText: string = await response.text()
    if (!response.ok) {
      throw new Error(`数据加载失败：${response.status}`)
    }
    let payload: unknown = responseText
    try {
      payload = JSON.parse(responseText) as unknown
    } catch (_error: unknown) {
      payload = responseText
    }
    publicDataItems.value = normalizePublicResponse(payload, selectedCategory.value)
    publicDataUpdatedAt.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  } catch (error: unknown) {
    publicDataError.value = error instanceof Error ? error.message : String(error)
  } finally {
    publicDataLoading.value = false
  }
}

watch(selectedApi, (newApi: ApiEndpoint | null): void => {
  sandboxResponse.value = null
  sandboxRequestUrl.value = ''
  sandboxHeaders.value = ''
  publicDataItems.value = []
  publicDataError.value = ''
  if (!newApi) return
  Object.keys(pathInputs).forEach((k: string): boolean => delete pathInputs[k])
  if (newApi.pathParams) {
    newApi.pathParams.forEach((p: ApiParam): void => { pathInputs[p.name] = p.default || '' })
  }
  Object.keys(queryInputs).forEach((k: string): boolean => delete queryInputs[k])
  if (newApi.params) {
    newApi.params.forEach((p: ApiParam): void => { queryInputs[p.name] = p.default !== undefined ? p.default : '' })
  }
  sandboxBodyContent.value = newApi.hasBody ? newApi.bodyPlaceholder : ''
}, { immediate: true })

watch([selectedCategory, selectedApi], (): void => {
  if (isPublicDataCategory.value && selectedApi.value) {
    void nextTick((): void => {
      void fetchPublicData()
    })
  }
}, { immediate: true })

watch(activeEndpoints, (newList: ApiEndpoint[]): void => {
  if (newList && newList.length > 0) {
    selectedApi.value = newList[0]
  } else {
    selectedApi.value = null
  }
}, { immediate: true })

const sendSandboxRequest = async (): Promise<void> => {
  if (!selectedApi.value) return
  sandboxLoading.value = true
  sandboxResponse.value = null
  sandboxHeaders.value = ''
  const api: ApiEndpoint = selectedApi.value
  let path: string = api.path
  if (api.pathParams) {
    api.pathParams.forEach((p: ApiParam): void => {
      const val: string = String(pathInputs[p.name] || '')
      path = path.replace(`{${p.name}}`, val)
    })
  }
  let url: string = buildEndpointUrl(api, path)
  const queryParams: URLSearchParams = new URLSearchParams()
  Object.keys(queryInputs).forEach((key: string): void => {
    const val: ApiValue = queryInputs[key]
    if (val !== undefined && val !== null && val !== '') {
      queryParams.append(key, String(val))
    }
  })
  const queryString: string = queryParams.toString()
  if (queryString) url += `?${queryString}`
  sandboxRequestUrl.value = resolveApiUrl(url)

  const headers: Record<string, string> = jsonHeaders()
  Object.entries(api.headers || {}).forEach(([key, value]: [string, string]): void => {
    const resolvedValue: string = resolveTemplateValue(value)
    if (resolvedValue) headers[key] = resolvedValue
  })
  if (!api.skipAuth && authToken.value) headers['Authorization'] = `Bearer ${authToken.value}`
  const options: RequestInit = { method: api.method, headers }
  if (api.hasBody && sandboxBodyContent.value) {
    Object.assign(headers, jsonHeaders(headers, true))
    options.body = sandboxBodyContent.value
  }

  try {
    const response: Response = await request(url, options)
    sandboxHeaders.value = `Status: ${response.status} ${response.statusText}\nContent-Type: ${response.headers.get('content-type')}`
    const responseText: string = await response.text()
    let parsedJson: ApiResponse<{ token?: string; accessToken?: string }> | null = null

    if (api.responseType === 'text') {
      sandboxResponse.value = responseText
    } else {
      try {
        parsedJson = JSON.parse(responseText) as ApiResponse<{ token?: string; accessToken?: string }>
        sandboxResponse.value = JSON.stringify(parsedJson, null, 2)
      } catch (_err: unknown) {
        sandboxResponse.value = responseText || '{}'
      }
    }

    if (api.path === '/api/auth/login' && parsedJson && parsedJson.code === 200 && parsedJson.data) {
      const token: string | undefined = parsedJson.data.token || parsedJson.data.accessToken
      if (token) {
        authToken.value = token
        saveToken()
        ElMessage.success('🔓 登录认证成功！已载入证书。')
        fetchUserProfile()
      }
    }
  } catch (err: unknown) {
    const message: string = err instanceof Error ? err.message : String(err)
    sandboxResponse.value = `Error: ${message}`
  } finally {
    sandboxLoading.value = false
  }
}

const copySandboxResponse = (): void => {
  if (!sandboxResponse.value) return
  navigator.clipboard.writeText(sandboxResponse.value).then(() => {
    ElMessage.success('复制成功！')
  })
}

const getMethodClass = (method: string): string => {
  switch (method.toUpperCase()) {
    case 'GET': return 'method-get'
    case 'POST': return 'method-post'
    case 'PUT': return 'method-put'
    case 'DELETE': return 'method-delete'
    default: return 'method-default'
  }
}

const clearToken = (): void => {
  authToken.value = ''
  saveToken()
}
</script>

<template>
  <div class="api-container-panel">
    <!-- Mode Select Header -->
    <div class="mode-select-header">
      <div class="header-left">
        <h2 class="main-title">🔌 多源云端接口应用枢纽</h2>
        <p class="main-subtitle">您既可以以常规用户身份发表动态、上传云盘，也可以切换到调试沙盒联调 ALAPI、PokeAPI、开放视频、游戏等接口。</p>
      </div>
      <div class="mode-toggles">
        <button 
          class="mode-toggle-btn"
          :class="{ active: activeMode === 'app' }"
          @click="activeMode = 'app'"
        >
          📱 用户应用工作台
        </button>
        <button 
          class="mode-toggle-btn"
          :class="{ active: activeMode === 'sandbox' }"
          @click="activeMode = 'sandbox'"
        >
          ⚙️ API 调试调试沙盒
        </button>
      </div>
    </div>

    <!-- ==================================================== -->
    <!-- Mode 1: USER APPLICATION WORKSPACE -->
    <!-- ==================================================== -->
    <div class="app-workspace-view" v-if="activeMode === 'app'">
      <!-- A. Not logged in -> Show Login/Register GUI -->
      <div class="auth-gate-wrapper" v-if="!authToken">
        <div class="auth-card">
          <div class="auth-tabs">
            <button 
              class="auth-tab-btn" 
              :class="{ active: authTab === 'login' }"
              @click="authTab = 'login'"
            >
              用户登录
            </button>
            <button 
              class="auth-tab-btn" 
              :class="{ active: authTab === 'register' }"
              @click="authTab = 'register'"
            >
              新用户注册
            </button>
          </div>

          <div class="auth-form">
            <div class="form-title-text">
              {{ authTab === 'login' ? '🔑 登录以进入工作台' : '📝 创建您在 apiopen 平台上的账户' }}
            </div>
            
            <div class="auth-input-item">
              <label>用户名 (3-50个字符)</label>
              <el-input 
                v-model="username" 
                placeholder="请输入用户名..." 
                clearable
              />
            </div>
            
            <div class="auth-input-item">
              <label>登录密码 (不少于6位)</label>
              <el-input 
                v-model="password" 
                type="password" 
                placeholder="请输入密码..." 
                show-password
                @keyup.enter="handleAuth"
              />
            </div>

            <!-- Validation helper message -->
            <p class="auth-notice" v-if="authTab === 'register'">
              💡 注册规则：密码长度至少6位，用户名最少3位。
            </p>

            <div class="auth-action-buttons">
              <el-button 
                type="primary" 
                class="auth-submit-btn" 
                :loading="isAuthLoading"
                @click="handleAuth"
              >
                {{ authTab === 'login' ? '确定登录' : '立即注册账户' }}
              </el-button>
              
              <el-button 
                type="success" 
                plain
                :loading="isLoggingIn"
                @click="quickLogin"
                v-if="authTab === 'login'"
              >
                ⚡ 访客一键登录
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- B. Logged In -> Show application dashboard -->
      <div class="app-dashboard-wrapper" v-else>
        <!-- User Info bar -->
        <div class="dashboard-user-bar">
          <div class="user-meta">
            <span class="user-avatar-placeholder">👤</span>
            <div class="user-details">
              <div class="username-txt">
                {{ userProfile?.nickname || userProfile?.username || '测试访客' }}
                <span class="username-id-tag">ID: {{ userProfile?.account_id }}</span>
              </div>
              <div class="bio-txt">{{ userProfile?.bio || '这家伙很懒，什么都没写~' }}</div>
            </div>
          </div>
          <button class="logout-btn" @click="logout">退出登录 🚪</button>
        </div>

        <!-- Dashboard main layout -->
        <div class="dashboard-body">
          <!-- Left Tab Switcher -->
          <div class="dashboard-tabs-sidebar">
            <button 
              class="dash-tab-item"
              :class="{ active: currentAppTab === 'moments' }"
              @click="currentAppTab = 'moments'"
            >
              💬 社交朋友圈
            </button>
            <button 
              class="dash-tab-item"
              :class="{ active: currentAppTab === 'articles' }"
              @click="currentAppTab = 'articles'"
            >
              📝 个人文章本
            </button>
            <button 
              class="dash-tab-item"
              :class="{ active: currentAppTab === 'json' }"
              @click="currentAppTab = 'json'"
            >
              🗄️ JSON 数据仓
            </button>
            <button 
              class="dash-tab-item"
              :class="{ active: currentAppTab === 'files' }"
              @click="currentAppTab = 'files'"
            >
              📁 云盘文件库
            </button>
            <button 
              class="dash-tab-item"
              :class="{ active: currentAppTab === 'profile' }"
              @click="currentAppTab = 'profile'"
            >
              👤 编辑个人资料
            </button>
          </div>

          <!-- Right Content Workspace -->
          <div class="dashboard-tab-content">
            <!-- 1. Moments Tab -->
            <div v-if="currentAppTab === 'moments'" class="tab-pane-view">
              <div class="moment-publisher">
                <el-input 
                  v-model="newMomentText"
                  type="textarea"
                  :rows="3"
                  placeholder="说点什么吧，分享新鲜事..."
                />
                <div class="publisher-footer">
                  <el-button type="primary" size="small" @click="publishMoment">发布新鲜事</el-button>
                </div>
              </div>

              <div class="moments-timeline">
                <div v-if="isMomentsLoading" class="center-loader">正在刷新朋友圈...</div>
                <template v-else-if="momentsList.length > 0">
                  <div v-for="m in momentsList" :key="m.id" class="moment-card">
                    <div class="moment-author-header">
                      <span class="avatar">👤</span>
                      <div class="author-info">
                        <div class="name">发布者ID: {{ m.account_id }}</div>
                        <div class="time">{{ m.created_at || '刚刚' }}</div>
                      </div>
                    </div>
                    <div class="moment-content-text">{{ m.content }}</div>
                    <div class="moment-footer">
                      <button class="footer-btn" @click="likeMoment(m.id)">👍 点赞</button>
                    </div>
                  </div>
                </template>
                <div v-else class="center-empty">暂无动态，发第一条吧！</div>
              </div>
            </div>

            <!-- 2. Articles Tab -->
            <div v-if="currentAppTab === 'articles'" class="tab-pane-view">
              <div class="tab-actions-header">
                <h3>我的文章列表</h3>
                <el-button type="primary" size="small" @click="showCreateArticleDialog = true">
                  + 发布新文章
                </el-button>
              </div>

              <div class="articles-grid-list">
                <div v-if="isArticlesLoading" class="center-loader">正在加载文章...</div>
                <template v-else-if="articlesList.length > 0">
                  <div v-for="art in articlesList" :key="art.id" class="article-item-card">
                    <div class="art-badge">{{ art.category }}</div>
                    <h4 class="art-title">{{ art.title }}</h4>
                    <p class="art-desc">{{ art.desc || '暂无概要描述' }}</p>
                    <div class="art-content-preview">{{ art.content }}</div>
                    <div class="art-footer-date">发布于: {{ art.created_at }}</div>
                  </div>
                </template>
                <div v-else class="center-empty">尚未发表过文章，快来发表一篇吧。</div>
              </div>
            </div>

            <!-- 3. JSON Warehouse Tab -->
            <div v-if="currentAppTab === 'json'" class="tab-pane-view">
              <div class="tab-actions-header">
                <h3>JSON 数据存储库</h3>
                <el-button type="primary" size="small" @click="showCreateJsonDialog = true">
                  + 新增 JSON 仓库
                </el-button>
              </div>

              <div class="json-storage-list">
                <div v-if="isJsonLoading" class="center-loader">加载仓库列表中...</div>
                <template v-else-if="jsonList.length > 0">
                  <div v-for="item in jsonList" :key="item.id" class="json-item-card">
                    <div class="json-card-header">
                      <span class="json-name-title">🗄️ 仓库名称: {{ item.name }}</span>
                      <button class="json-del-btn" @click="deleteJsonRecord(item.id)">删除</button>
                    </div>
                    <pre class="json-pre-block"><code>{{ item.content }}</code></pre>
                    <div class="json-footer-date">保存时间: {{ item.created_at }}</div>
                  </div>
                </template>
                <div v-else class="center-empty">尚无 JSON 数据仓库。</div>
              </div>
            </div>

            <!-- 4. Cloud Files Tab -->
            <div v-if="currentAppTab === 'files'" class="tab-pane-view">
              <div class="tab-actions-header">
                <h3>文件储存柜</h3>
                <div class="file-uploader-action">
                  <input 
                    type="file" 
                    ref="fileInputRef" 
                    style="display: none" 
                    @change="handleFileUpload"
                  />
                  <el-button type="primary" size="small" @click="() => fileInputRef?.click()">
                    📤 上传文件到云盘
                  </el-button>
                </div>
              </div>

              <div class="cloud-files-list">
                <div v-if="isFilesLoading" class="center-loader">读取云盘中...</div>
                <template v-else-if="filesList.length > 0">
                  <div v-for="f in filesList" :key="f.id" class="file-item-row">
                    <div class="file-info-left">
                      <span class="file-icon">📄</span>
                      <div class="file-text">
                        <div class="file-name">{{ f.filename }}</div>
                        <div class="file-size">ID: {{ f.id }} | 格式: {{ f.file_type }}</div>
                      </div>
                    </div>
                    <div class="file-actions-right">
                      <a :href="`https://api.apiopen.top/api/files/download/${f.id}`" target="_blank" class="download-link">下载</a>
                      <button class="file-del-btn" @click="deleteFileRecord(f.id)">删除</button>
                    </div>
                  </div>
                </template>
                <div v-else class="center-empty">云盘中暂无上传文件。</div>
              </div>
            </div>

            <!-- 5. Profile Edit Tab -->
            <div v-if="currentAppTab === 'profile'" class="tab-pane-view">
              <div class="profile-editor-form">
                <h3>✍️ 编辑我的个人资料</h3>
                
                <div class="profile-form-grid">
                  <div class="profile-form-item">
                    <label>个性昵称 (Nickname)</label>
                    <el-input v-model="profileForm.nickname" placeholder="请输入你的昵称..." />
                  </div>
                  
                  <div class="profile-form-item">
                    <label>绑定邮箱 (Email)</label>
                    <el-input v-model="profileForm.email" placeholder="请输入电子邮箱..." />
                  </div>

                  <div class="profile-form-item">
                    <label>归属地址 (Location)</label>
                    <el-input v-model="profileForm.location" placeholder="请输入所在城市，如：北京..." />
                  </div>

                  <div class="profile-form-item">
                    <label>性别 (Gender)</label>
                    <el-select v-model="profileForm.gender" style="width: 100%">
                      <el-option
                        v-for="opt in GENDER_OPTIONS"
                        :key="opt.value"
                        :label="opt.label"
                        :value="opt.value"
                      />
                    </el-select>
                  </div>

                  <div class="profile-form-item">
                    <label>年龄 (Age)</label>
                    <el-input v-model.number="profileForm.age" type="number" />
                  </div>

                  <div class="profile-form-item full-width">
                    <label>个人签名 (Bio)</label>
                    <el-input 
                      v-model="profileForm.bio" 
                      type="textarea" 
                      :rows="3" 
                      placeholder="介绍一下自己吧..."
                    />
                  </div>
                </div>

                <div class="profile-submit-footer">
                  <el-button type="primary" @click="updateProfileSubmit">保存个人资料</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================================================== -->
    <!-- Mode 2: DEVELOPER SANDBOX WORKSPACE (Original Code) -->
    <!-- ==================================================== -->
    <div class="sandbox-workspace-view" v-else>
      <!-- Auth Token Quick Settings -->
      <div class="sandbox-quick-token-settings">
        <span class="auth-label-inline">🔑 Authorization Header:</span>
        <el-input 
          v-model="authToken" 
          placeholder="登录后自动填充，或在此手动填入..." 
          size="small"
          style="width: 320px;"
          clearable
          @change="saveToken"
        />
        <el-button size="small" type="primary" :loading="isLoggingIn" @click="quickLogin">一键登录(alice)</el-button>
        <el-button size="small" type="danger" plain @click="clearToken">清除</el-button>
      </div>

      <!-- Main Columns -->
      <div class="playground-main-layout">
        <!-- Column 1: Categories -->
        <div class="column-categories">
          <div class="col-title">接口分类</div>
          <div class="cat-list">
            <button 
              v-for="cat in categoriesList" 
              :key="cat"
              class="cat-item"
              :class="{ active: selectedCategory === cat }"
              @click="selectedCategory = cat"
            >
              {{ cat }}
            </button>
          </div>
          <a href="https://api.apiopen.top/docs" target="_blank" class="swagger-link-btn">
            🔗 官方 Swagger 接口预览
          </a>
        </div>

        <!-- Column 2: Endpoint List -->
        <div class="column-endpoints">
          <div class="col-title">接口列表 ({{ activeEndpoints.length }})</div>
          <div class="endpoint-list-box">
            <button 
              v-for="ep in activeEndpoints" 
              :key="getEndpointKey(ep)"
              class="ep-item"
              :class="{ active: selectedApi && getEndpointKey(selectedApi) === getEndpointKey(ep) }"
              @click="selectedApi = ep"
            >
              <div class="ep-header-row">
                <span v-if="!isPublicDataCategory" class="method-badge" :class="getMethodClass(ep.method)">{{ ep.method }}</span>
                <span class="ep-name-title">{{ ep.name }}</span>
              </div>
              <div v-if="!isPublicDataCategory" class="ep-path-sub">{{ ep.path }}</div>
              <div v-else class="ep-path-sub public-entry-desc">{{ ep.desc || '点击查看数据页面' }}</div>
              <div v-if="selectedCategory === '所有接口列表'" class="ep-cat-sub">
                来自: {{ ep.categoryName }}
              </div>
            </button>
          </div>
        </div>

        <!-- Column 3: Sandbox Debug Workspace -->
        <div class="column-workspace" v-if="selectedApi">
          <div v-if="isPublicDataCategory" class="public-data-page">
            <div class="public-data-header">
              <div>
                <span class="public-data-kicker">{{ selectedCategory }}</span>
                <h3>{{ selectedApi.name }}</h3>
                <p>{{ selectedApi.desc || '选择左侧功能后即可查看整理好的数据。' }}</p>
              </div>
              <el-button type="primary" :loading="publicDataLoading" @click="fetchPublicData">
                刷新数据
              </el-button>
            </div>

            <div
              v-if="getVisibleParams(selectedApi.pathParams).length || getVisibleParams(selectedApi.params).length"
              class="public-data-filters"
            >
              <div
                v-for="p in getVisibleParams(selectedApi.pathParams)"
                :key="`path-${p.name}`"
                class="public-filter-item"
              >
                <label>{{ p.label || p.description || p.name }}</label>
                <el-input v-model="pathInputs[p.name]" :placeholder="p.placeholder || p.description || p.name" size="small" clearable />
              </div>
              <div
                v-for="p in getVisibleParams(selectedApi.params)"
                :key="`query-${p.name}`"
                class="public-filter-item"
              >
                <label>{{ p.label || p.description || p.name }}</label>
                <el-input
                  v-if="p.type === 'text'"
                  v-model="queryInputs[p.name]"
                  :placeholder="p.placeholder || p.label"
                  size="small"
                  clearable
                />
                <el-input-number
                  v-else-if="p.type === 'number'"
                  v-model="queryInputs[p.name]"
                  size="small"
                  :min="0"
                  controls-position="right"
                />
                <el-select
                  v-else-if="p.type === 'select'"
                  v-model="queryInputs[p.name]"
                  size="small"
                  style="width: 100%"
                >
                  <el-option
                    v-for="o in p.options"
                    :key="o.value"
                    :value="o.value"
                    :label="o.label"
                  />
                </el-select>
                <el-switch
                  v-else-if="p.type === 'switch'"
                  v-model="queryInputs[p.name]"
                  size="small"
                />
                <el-input v-else v-model="queryInputs[p.name]" size="small" clearable />
              </div>
            </div>

            <div class="public-data-toolbar">
              <span>{{ publicDataUpdatedAt ? `最近更新 ${publicDataUpdatedAt}` : '准备加载数据' }}</span>
              <span>{{ publicDataItems.length ? `共 ${publicDataItems.length} 条` : '' }}</span>
            </div>

            <div v-if="publicDataLoading" class="public-data-state">
              <span class="loading-spinner"></span>
              <strong>正在整理数据...</strong>
            </div>
            <div v-else-if="publicDataError" class="public-data-state error">
              <strong>加载失败</strong>
              <span>{{ publicDataError }}</span>
              <el-button type="primary" plain @click="fetchPublicData">重试</el-button>
            </div>
            <div v-else-if="!publicDataItems.length" class="public-data-state">
              <strong>暂无数据</strong>
              <span>换一个条件后点击刷新试试。</span>
            </div>
            <div v-else class="public-data-grid">
              <article
                v-for="item in publicDataItems"
                :key="item.id"
                class="public-data-card"
              >
                <div v-if="item.image" class="public-data-image">
                  <img :src="item.image" :alt="item.title">
                </div>
                <div class="public-data-content">
                  <div class="public-data-title-row">
                    <strong>{{ item.title }}</strong>
                    <a v-if="item.url" :href="item.url" target="_blank" rel="noopener noreferrer">打开</a>
                  </div>
                  <span class="public-data-subtitle">{{ item.subtitle }}</span>
                  <p>{{ item.description }}</p>
                  <div v-if="item.tags.length" class="public-data-tags">
                    <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
                  </div>
                  <div v-if="item.extra.length" class="public-data-extra">
                    <span v-for="extra in item.extra" :key="extra">{{ extra }}</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <div v-else class="workspace-card">
            <!-- Path & Method info -->
            <div class="api-meta-info">
              <span class="method-tag" :class="getMethodClass(selectedApi.method)">
                {{ selectedApi.method }}
              </span>
              <span class="api-full-path">{{ selectedApi.path }}</span>
              <div class="api-summary-desc">{{ selectedApi.desc || selectedApi.name }}</div>
            </div>

            <!-- Parameter Configuration -->
            <div class="workspace-section-form">
              <!-- Path Parameters -->
              <div class="form-section-box" v-if="selectedApi.pathParams && selectedApi.pathParams.length > 0">
                <div class="section-title">路径替换参数 (Path Variables)</div>
                <div class="form-grid">
                  <div v-for="p in selectedApi.pathParams" :key="p.name" class="form-row">
                    <label class="field-label">
                      <span class="req">*</span><code>{{ p.name }}</code> ({{ p.description }})
                    </label>
                    <el-input v-model="pathInputs[p.name]" placeholder="请输入替换参数..." size="small" />
                  </div>
                </div>
              </div>

              <!-- Query Parameters -->
              <div class="form-section-box" v-if="selectedApi.params && selectedApi.params.length > 0">
                <div class="section-title">查询参数 (Query Parameters)</div>
                <div class="form-grid">
                  <div v-for="p in selectedApi.params" :key="p.name" class="form-row">
                    <label class="field-label">
                      <span class="req" v-if="p.required">*</span><code>{{ p.name }}</code> ({{ p.label }})
                    </label>
                    <el-input 
                      v-if="p.type === 'text'"
                      v-model="queryInputs[p.name]" 
                      :placeholder="p.placeholder"
                      size="small" 
                      clearable
                    />
                    <el-input 
                      v-if="p.type === 'number'"
                      v-model.number="queryInputs[p.name]" 
                      type="number"
                      size="small" 
                    />
                    <el-select 
                      v-if="p.type === 'select'"
                      v-model="queryInputs[p.name]" 
                      size="small"
                      style="width: 100%"
                    >
                      <el-option 
                        v-for="o in p.options" 
                        :key="o.value" 
                        :value="o.value" 
                        :label="o.label" 
                      />
                    </el-select>
                    <el-switch 
                      v-if="p.type === 'switch'"
                      v-model="queryInputs[p.name]" 
                      size="small"
                    />
                  </div>
                </div>
              </div>

              <!-- Body parameters -->
              <div class="form-section-box" v-if="selectedApi.hasBody">
                <div class="section-title">请求体内容 (Request Body JSON)</div>
                <el-input 
                  type="textarea"
                  v-model="sandboxBodyContent"
                  placeholder="请输入请求 JSON 字符串..."
                  :rows="6"
                  class="code-textarea"
                />
              </div>

              <!-- Send Button -->
              <div class="send-action-row">
                <el-button 
                  type="primary" 
                  size="medium"
                  :loading="sandboxLoading"
                  @click="sendSandboxRequest"
                  class="execute-btn"
                >
                  ⚡ 发送 API 请求
                </el-button>
              </div>
            </div>

            <!-- URL Preview -->
            <div class="url-preview-box" v-if="sandboxRequestUrl">
              <span class="url-lbl">完整 API URL:</span>
              <code>{{ sandboxRequestUrl }}</code>
            </div>

            <!-- Response Display Area -->
            <div class="response-panel">
              <div class="resp-header-row">
                <span>响应结果</span>
                <button class="copy-resp-btn" v-if="sandboxResponse" @click="copySandboxResponse">
                  📋 复制
                </button>
              </div>
              <div class="resp-content-box">
                <div v-if="sandboxLoading" class="loader-box">
                  <span class="loading-spinner"></span>
                  <span>发起请求中...</span>
                </div>
                <template v-else-if="sandboxResponse">
                  <div class="resp-meta-headers">
                    <pre>{{ sandboxHeaders }}</pre>
                  </div>
                  <div class="resp-code-view">
                    <pre><code>{{ sandboxResponse }}</code></pre>
                  </div>
                </template>
                <div v-else class="empty-workspace-state">
                  <span>等待请求执行，响应结果将展示在此处。</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="column-workspace empty" v-else>
          <div class="workspace-placeholder">
            <span>💡</span>
            <p>请选择列表中的接口开始联调</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================================================== -->
    <!-- App Workspace Dialog Modals -->
    <!-- ==================================================== -->
    <!-- dialog 1: Create Article -->
    <el-dialog 
      v-model="showCreateArticleDialog" 
      title="📝 发表新文章" 
      width="50%"
      destroy-on-close
    >
      <div class="article-dialog-form">
        <div class="form-item-vertical">
          <label>文章标题</label>
          <el-input v-model="newArticle.title" placeholder="输入文章标题..." />
        </div>
        <div class="form-item-vertical">
          <label>简要描述/概要</label>
          <el-input v-model="newArticle.desc" placeholder="输入简短描述..." />
        </div>
        <div class="form-item-vertical">
          <label>分类目录</label>
          <el-input v-model="newArticle.category" placeholder="如: 技术、生活、情感..." />
        </div>
        <div class="form-item-vertical">
          <label>文章主体内容</label>
          <el-input 
            v-model="newArticle.content" 
            type="textarea" 
            :rows="6" 
            placeholder="输入文章主体正文..." 
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateArticleDialog = false">取消</el-button>
          <el-button type="primary" @click="createArticleSubmit">立即发表</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- dialog 2: Create JSON Store -->
    <el-dialog 
      v-model="showCreateJsonDialog" 
      title="🗄️ 创建新 JSON 数据仓库" 
      width="45%"
      destroy-on-close
    >
      <div class="json-dialog-form">
        <div class="form-item-vertical">
          <label>仓库对象名称</label>
          <el-input v-model="newJsonObj.name" placeholder="起个名字，如: user_config" />
        </div>
        <div class="form-item-vertical">
          <label>JSON 内容结构 (仅支持标准 JSON 格式)</label>
          <el-input 
            v-model="newJsonObj.content" 
            type="textarea" 
            :rows="8" 
            placeholder='请输入 JSON，例如: { "theme": "dark", "fontSize": 14 }' 
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateJsonDialog = false">取消</el-button>
          <el-button type="primary" @click="createJsonSubmit">确定保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss" src="./css/ApiToolbox.scss"></style>
