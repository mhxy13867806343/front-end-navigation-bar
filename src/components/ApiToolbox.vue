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

<style scoped>
.api-container-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.mode-select-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 14px;
  flex-wrap: wrap;
  gap: 12px;
}

.main-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.main-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.mode-toggles {
  display: flex;
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  padding: 4px;
  border-radius: 8px;
  gap: 6px;
}

.mode-toggle-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-weight: bold;
  padding: 6px 14px;
  font-size: 12.5px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-toggle-btn.active {
  background: var(--primary-color);
  color: #fff;
}

/* ==================================================== */
/* Mode 1: USER APPLICATION WORKSPACE (STYLE) */
/* ==================================================== */
.auth-gate-wrapper {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 10px 40px var(--shadow-color);
  overflow: hidden;
}

.auth-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background: var(--hover-bg);
}

.auth-tab-btn {
  flex-grow: 1;
  background: none;
  border: none;
  padding: 12px 0;
  font-size: 14px;
  font-weight: bold;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.auth-tab-btn.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

.auth-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-title-text {
  font-size: 14px;
  font-weight: bold;
  color: var(--text-color);
  text-align: center;
  margin-bottom: 8px;
}

.auth-input-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-input-item label {
  font-size: 12px;
  font-weight: bold;
  color: var(--text-secondary);
}

.auth-notice {
  font-size: 11px;
  color: #ff9f43;
  margin: 0;
  line-height: 1.4;
}

.auth-action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.auth-submit-btn {
  flex-grow: 1;
}

/* Dashboard styles */
.app-dashboard-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-user-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 20px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-placeholder {
  font-size: 28px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username-txt {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-color);
}

.username-id-tag {
  font-size: 10px;
  background: var(--border-color);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 6px;
  color: var(--text-secondary);
}

.bio-txt {
  font-size: 11.5px;
  color: var(--text-secondary);
}

.logout-btn {
  background: none;
  border: 1px solid #ff4757;
  color: #ff4757;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #ff4757;
  color: #fff;
}

/* Dashboard body */
.dashboard-body {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

.dashboard-tabs-sidebar {
  width: 160px;
  flex-shrink: 0;
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dash-tab-item {
  background: none;
  border: none;
  padding: 10px 12px;
  text-align: left;
  font-size: 12.5px;
  font-weight: bold;
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.dash-tab-item:hover {
  background: rgba(var(--primary-color-rgb, 99, 102, 241), 0.08);
}

.dash-tab-item.active {
  background: var(--primary-color);
  color: #fff;
}

.dashboard-tab-content {
  flex-grow: 1;
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  min-height: 480px;
  overflow-y: auto;
  max-height: 520px;
}

.tab-pane-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 1. Moments pane */
.moment-publisher {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.publisher-footer {
  display: flex;
  justify-content: flex-end;
}

.moments-timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.moment-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.moment-author-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.moment-author-header .avatar {
  font-size: 18px;
}

.author-info .name {
  font-size: 12px;
  font-weight: bold;
  color: var(--text-color);
}

.author-info .time {
  font-size: 10px;
  color: var(--text-secondary);
}

.moment-content-text {
  font-size: 13px;
  color: var(--text-color);
  line-height: 1.5;
}

.moment-footer {
  border-top: 1px dashed var(--border-color);
  padding-top: 6px;
  display: flex;
}

.footer-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 11.5px;
  font-weight: bold;
  cursor: pointer;
}

.footer-btn:hover {
  color: var(--primary-color);
}

/* 2. Articles pane */
.tab-actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.tab-actions-header h3 {
  font-size: 15px;
  font-weight: 800;
  margin: 0;
}

.articles-grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.article-item-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.art-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 10px;
  background: var(--primary-color);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.art-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-color);
  margin: 0 45px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.art-desc {
  font-size: 11.5px;
  color: var(--text-secondary);
  margin: 0;
}

.art-content-preview {
  font-size: 12px;
  color: var(--text-color);
  line-height: 1.45;
  background: var(--hover-bg);
  padding: 8px;
  border-radius: 6px;
  height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.art-footer-date {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: auto;
}

/* 3. JSON Warehouse pane */
.json-storage-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.json-item-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.json-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.json-name-title {
  font-size: 13px;
  font-weight: bold;
  color: var(--text-color);
}

.json-del-btn, .file-del-btn {
  background: none;
  border: 1px solid #ff4757;
  color: #ff4757;
  font-size: 10.5px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.json-del-btn:hover, .file-del-btn:hover {
  background: #ff4757;
  color: #fff;
}

.json-pre-block {
  margin: 0;
  background: #1e1e24;
  border-radius: 6px;
  padding: 10px;
  max-height: 120px;
  overflow-y: auto;
}

.json-pre-block code {
  font-family: monospace;
  font-size: 11.5px;
  color: #1dd1a1;
}

.json-footer-date {
  font-size: 10px;
  color: var(--text-secondary);
}

/* 4. Files cloud pane */
.cloud-files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item-row {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-info-left .file-icon {
  font-size: 20px;
}

.file-text .file-name {
  font-size: 13px;
  font-weight: bold;
  color: var(--text-color);
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-text .file-size {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.file-actions-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.download-link {
  text-decoration: none;
  font-size: 11.5px;
  color: var(--primary-color);
  font-weight: bold;
}

/* 5. Profile Edit pane */
.profile-editor-form {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
}

.profile-editor-form h3 {
  font-size: 14px;
  font-weight: 800;
  margin: 0 0 16px 0;
  border-left: 3px solid var(--primary-color);
  padding-left: 8px;
}

.profile-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.profile-form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-form-item.full-width {
  grid-column: span 2;
}

.profile-form-item label {
  font-size: 11.5px;
  font-weight: bold;
  color: var(--text-color);
}

.profile-submit-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* Common loaders */
.center-loader {
  text-align: center;
  color: var(--primary-color);
  font-size: 12px;
  padding: 24px 0;
}

.center-empty {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  padding: 30px 0;
}

/* Vertical Dialog form items */
.article-dialog-form, .json-dialog-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-item-vertical {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item-vertical label {
  font-size: 12px;
  font-weight: bold;
  color: var(--text-color);
}

/* ==================================================== */
/* Mode 2: DEVELOPER SANDBOX WORKSPACE (STYLE) */
/* ==================================================== */
.sandbox-quick-token-settings {
  display: flex;
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px 16px;
  align-items: center;
  gap: 12px;
}

.auth-label-inline {
  font-size: 12px;
  font-weight: bold;
  color: var(--text-secondary);
}

/* Original workspace cards & inputs adjustments */
.playground-main-layout {
  display: flex;
  gap: 16px;
  width: 100%;
  min-height: 520px;
  align-items: stretch;
}

.col-title {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-color);
}

.column-categories {
  width: 150px;
  flex-shrink: 0;
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.cat-list {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-y: auto;
  padding-right: 4px;
}

.cat-list::-webkit-scrollbar {
  width: 4px;
}

.cat-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.cat-item {
  background: none;
  border: none;
  padding: 8px 10px;
  text-align: left;
  font-size: 12.5px;
  font-weight: bold;
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.cat-item:hover {
  background: rgba(var(--primary-color-rgb, 99, 102, 241), 0.08);
}

.cat-item.active {
  background: var(--primary-color);
  color: #fff;
}

.swagger-link-btn {
  text-decoration: none;
  font-size: 11px;
  font-weight: bold;
  color: var(--primary-color);
  text-align: center;
  padding: 8px 0;
  border-top: 1px solid var(--border-color);
  margin-top: 12px;
}

.column-endpoints {
  width: 250px;
  flex-shrink: 0;
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.endpoint-list-box {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.endpoint-list-box::-webkit-scrollbar {
  width: 4px;
}

.endpoint-list-box::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.ep-item {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 10px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.ep-item:hover {
  border-color: var(--primary-color);
  transform: translateX(2px);
}

.ep-item.active {
  background: rgba(var(--primary-color-rgb, 99, 102, 241), 0.08);
  border-color: var(--primary-color);
  box-shadow: 0 0 8px rgba(var(--primary-color-rgb, 99, 102, 241), 0.15);
}

.ep-header-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}

.ep-name-title {
  font-size: 12px;
  font-weight: bold;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ep-path-sub {
  font-family: monospace;
  font-size: 10px;
  color: var(--text-secondary);
  word-break: break-all;
}

.ep-path-sub.public-entry-desc {
  margin-top: 4px;
  font-family: inherit;
  font-size: 11px;
  line-height: 1.4;
}

.ep-cat-sub {
  font-size: 9px;
  color: var(--primary-color);
  margin-top: 2px;
  font-weight: bold;
}

.method-badge {
  font-size: 8px;
  font-weight: bold;
  color: #fff;
  padding: 1px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.method-get { background: #00d2d3; }
.method-post { background: #1dd1a1; }
.method-put { background: #ff9f43; }
.method-delete { background: #ff4757; }

.column-workspace {
  flex-grow: 1;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.column-workspace.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--hover-bg);
}

.workspace-placeholder {
  text-align: center;
  color: var(--text-secondary);
}

.workspace-placeholder span {
  font-size: 32px;
}

.workspace-placeholder p {
  font-size: 13px;
  font-weight: bold;
  margin: 8px 0 0 0;
}

.workspace-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  overflow-y: auto;
  max-height: 520px;
}

.workspace-card::-webkit-scrollbar {
  width: 4px;
}

.workspace-card::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.public-data-page {
  height: 100%;
  max-height: 640px;
  overflow-y: auto;
  padding: 18px;
  padding-bottom: 92px;
}

.public-data-page::-webkit-scrollbar {
  width: 5px;
}

.public-data-page::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 999px;
}

.public-data-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.13), rgba(20, 184, 166, 0.08));
  border: 1px solid rgba(var(--primary-color-rgb, 99, 102, 241), 0.22);
  border-radius: 12px;
}

.public-data-kicker {
  display: inline-flex;
  margin-bottom: 8px;
  color: var(--primary-color);
  font-size: 11px;
  font-weight: 900;
}

.public-data-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 20px;
}

.public-data-header p {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.55;
}

.public-data-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-top: 14px;
  padding: 12px;
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.public-filter-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.public-filter-item label {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 800;
}

.public-data-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 14px 0;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.public-data-state {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-secondary);
  background: var(--hover-bg);
  border: 1px dashed var(--border-color);
  border-radius: 14px;
}

.public-data-state strong {
  color: var(--text-color);
  font-size: 16px;
}

.public-data-state.error {
  color: #ff8c8c;
  border-color: rgba(255, 92, 92, 0.45);
}

.public-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 12px;
}

.public-data-card {
  min-width: 0;
  overflow: hidden;
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.public-data-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.public-data-image {
  height: 138px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
}

.public-data-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.public-data-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.public-data-title-row {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.public-data-title-row strong {
  min-width: 0;
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.public-data-title-row a {
  flex: 0 0 auto;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
}

.public-data-subtitle {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.public-data-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.public-data-tags,
.public-data-extra {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.public-data-tags span,
.public-data-extra span {
  max-width: 100%;
  padding: 3px 7px;
  color: var(--primary-color);
  font-size: 11px;
  font-weight: 800;
  background: rgba(var(--primary-color-rgb, 99, 102, 241), 0.1);
  border: 1px solid rgba(var(--primary-color-rgb, 99, 102, 241), 0.18);
  border-radius: 999px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.api-meta-info {
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px;
}

.method-tag {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  margin-right: 8px;
}

.api-full-path {
  font-family: monospace;
  font-size: 13.5px;
  font-weight: bold;
  color: var(--text-color);
}

.api-summary-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
  line-height: 1.4;
}

.workspace-section-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-section-box {
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 12px;
}

.form-section-box .section-title {
  font-size: 11px;
  font-weight: bold;
  color: var(--text-secondary);
  margin-bottom: 10px;
  text-transform: uppercase;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 11.5px;
  font-weight: bold;
  color: var(--text-color);
}

.field-label .req {
  color: #ff4757;
  margin-right: 3px;
}

.field-label code {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 0px 3px;
  border-radius: 3px;
  color: var(--text-secondary);
  font-size: 10px;
  margin-right: 4px;
}

.code-textarea :deep(.el-textarea__inner) {
  font-family: monospace;
  font-size: 11.5px;
  background: #1e1e24;
  color: #1dd1a1;
  border-color: #2d2d35;
}

.send-action-row {
  display: flex;
  margin-top: 4px;
}

.execute-btn {
  font-weight: bold;
  padding: 10px 20px;
}

.url-preview-box {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.url-lbl {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: bold;
}

.url-preview-box code {
  font-family: monospace;
  font-size: 11.5px;
  color: var(--primary-color);
  word-break: break-all;
}

.response-panel {
  border: 1px solid #2d2d35;
  border-radius: 10px;
  background: #1e1e24;
  overflow: hidden;
}

.resp-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #121216;
  padding: 8px 12px;
  font-size: 11.5px;
  font-weight: bold;
  color: #a0a0b0;
  border-bottom: 1px solid #2d2d35;
}

.copy-resp-btn {
  background: none;
  border: 1px solid #444;
  color: #eee;
  padding: 2px 6px;
  font-size: 10.5px;
  border-radius: 4px;
  cursor: pointer;
}

.copy-resp-btn:hover {
  background: #2d2d35;
  border-color: #eee;
}

.resp-content-box {
  padding: 12px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.empty-workspace-state {
  text-align: center;
  font-size: 12px;
  color: #777785;
}

.loader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #00d2d3;
  font-size: 12px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 210, 211, 0.2);
  border-top-color: #00d2d3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.resp-meta-headers {
  background: #121216;
  border: 1px solid #2d2d35;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 8px;
}

.resp-meta-headers pre {
  margin: 0;
  font-family: monospace;
  font-size: 11px;
  color: #a0a0b0;
  white-space: pre-wrap;
  word-break: break-all;
}

.resp-code-view pre {
  margin: 0;
  overflow-x: auto;
}

.resp-code-view code {
  font-family: monospace;
  font-size: 11.5px;
  color: #1dd1a1;
  line-height: 1.45;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .playground-main-layout {
    flex-direction: column;
  }
  .column-categories, .column-endpoints, .column-workspace {
    width: 100%;
  }
}
</style>
