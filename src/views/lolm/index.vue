<template>
  <div class="lolm-page">
    <div class="header-card">
      <button class="back-btn" @click="goBack">
        ← 返回工具箱
      </button>
      <div class="title-box">
        <div class="main-title">⚔️ 英雄联盟手游 - 官方资讯与国服数据</div>
        <div class="sub-title">同步官方新闻、公告、社区、赛事动态与实时英雄胜率榜</div>
      </div>
      <a
        class="source-link"
        href="https://lolm.qq.com/v2/news.html?goNews=2"
        target="_blank"
        rel="noopener noreferrer"
      >
        官方来源
      </a>
    </div>

    <section class="official-news-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">NEWS CENTER</p>
          <h2>官方资讯中心</h2>
          <p>默认展示 goNews=2 对应的公告分类，焦点新闻与全部分类可以继续切换查看。</p>
        </div>
        <button class="refresh-btn" :disabled="officialNewsLoading || hotNewsLoading" @click="refreshOfficialNews">
          {{ officialNewsLoading || hotNewsLoading ? '刷新中...' : '刷新资讯' }}
        </button>
      </div>

      <div class="news-metrics">
        <div class="metric-item">
          <span>当前分类</span>
          <strong>{{ activeNewsCategory.name }}</strong>
        </div>
        <div class="metric-item">
          <span>官方总量</span>
          <strong>{{ officialNewsTotal }}</strong>
        </div>
        <div class="metric-item">
          <span>当前页</span>
          <strong>{{ officialNewsPage }} / {{ officialNewsPageCount }}</strong>
        </div>
        <div class="metric-item">
          <span>焦点内容</span>
          <strong>{{ officialHotNews.length }}</strong>
        </div>
      </div>

      <div v-if="hotNewsError" class="inline-error">
        {{ hotNewsError }}
      </div>

      <div v-if="hotNewsLoading" class="news-loading">
        正在读取焦点新闻...
      </div>
      <div v-else-if="officialHotNews.length" class="hot-news-grid">
        <article
          v-for="news in officialHotNews"
          :key="`hot-${news.id}`"
          class="hot-news-card"
        >
          <img :src="news.image" :alt="news.title" />
          <div class="hot-news-body">
            <div class="news-tags">
              <span v-for="tag in news.tags.slice(0, 3)" :key="`${news.id}-${tag}`">{{ tag }}</span>
            </div>
            <h3>{{ news.title }}</h3>
            <p>{{ news.desc || '官方暂未提供摘要，点击查看详情可阅读完整内容。' }}</p>
            <div class="news-card-footer">
              <span>{{ news.date }}</span>
              <button @click="openOfficialNews(news)">查看详情</button>
            </div>
          </div>
        </article>
      </div>

      <div class="news-toolbar">
        <div class="category-tabs">
          <button
            v-for="(category, index) in officialNewsCategories"
            :key="category.name"
            class="category-tab"
            :class="{ active: activeNewsIndex === index }"
            @click="selectOfficialCategory(index)"
          >
            {{ category.name }}
          </button>
        </div>
        <input
          v-model="officialNewsKeyword"
          class="news-search"
          type="text"
          placeholder="搜索当前页标题、标签、作者"
        />
      </div>

      <div v-if="activeNewsCategory.subMenu?.length" class="sub-category-tabs">
        <button
          v-for="(subMenu, index) in activeNewsCategory.subMenu"
          :key="subMenu.name"
          class="sub-category-tab"
          :class="{ active: activeSubMenuIndex === index }"
          @click="selectOfficialSubMenu(index)"
        >
          {{ subMenu.name }}
        </button>
      </div>

      <div class="category-summary">
        <span>标签方向：{{ activeNewsTagsLabel }}</span>
        <span>每页展示 {{ officialNewsPageSize }} 条，已展示 {{ displayOfficialNewsList.length }} 条</span>
      </div>

      <div v-if="officialNewsError" class="inline-error">
        {{ officialNewsError }}
      </div>

      <div v-if="officialNewsLoading" class="news-loading">
        正在读取官方资讯列表...
      </div>
      <div v-else-if="displayOfficialNewsList.length" class="official-news-list">
        <article
          v-for="news in displayOfficialNewsList"
          :key="news.id"
          class="official-news-card"
        >
          <img :src="news.image" :alt="news.title" />
          <div class="official-news-content">
            <div class="news-line">
              <span class="type-badge">{{ news.typeLabel }}</span>
              <span>{{ news.date }}</span>
              <span>{{ news.author || '英雄联盟手游官方' }}</span>
            </div>
            <h3>{{ news.title }}</h3>
            <p>{{ news.desc || '官方暂未提供摘要。' }}</p>
            <div class="news-tags">
              <span v-for="tag in news.tags" :key="`${news.id}-${tag}`">{{ tag }}</span>
            </div>
            <div class="news-field-strip">
              <span>DocID: {{ news.docId || '暂无' }}</span>
              <span>播放/浏览: {{ formatNumber(news.totalPlay) }}</span>
              <span>创建: {{ news.created || '暂无' }}</span>
              <span>地区: {{ news.location || '暂无' }}</span>
            </div>
            <details class="raw-data-details">
              <summary>展开全部字段</summary>
              <div class="raw-field-grid">
                <div v-for="field in getNewsRawFields(news.raw)" :key="`${news.id}-${field.key}`">
                  <span>{{ field.label }}</span>
                  <strong>{{ field.value }}</strong>
                </div>
              </div>
            </details>
            <div class="news-card-footer">
              <span>{{ news.infoType === 2 ? '视频资讯' : '图文资讯' }}</span>
              <button @click="openOfficialNews(news)">跳转详情</button>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="empty-state compact">
        当前页没有匹配的官方资讯，请切换分类或清空搜索词。
      </div>

      <div class="pagination-bar">
        <button :disabled="officialNewsPage <= 1 || officialNewsLoading" @click="changeOfficialNewsPage(officialNewsPage - 1)">
          上一页
        </button>
        <div class="page-jump-select">
          <span>跳至</span>
          <el-select
            v-model="officialNewsPage"
            filterable
            :disabled="officialNewsLoading"
            placeholder="选择页码"
            popper-class="lolm-page-select-popper"
            @change="changeOfficialNewsPage"
          >
            <el-option
              v-for="page in officialNewsPageOptions"
              :key="page"
              :label="`第 ${page} 页`"
              :value="page"
            />
          </el-select>
        </div>
        <span>第 {{ officialNewsPage }} 页，共 {{ officialNewsPageCount }} 页</span>
        <button :disabled="officialNewsPage >= officialNewsPageCount || officialNewsLoading" @click="changeOfficialNewsPage(officialNewsPage + 1)">
          下一页
        </button>
      </div>
    </section>

    <section class="rank-section">
      <div class="rank-heading">
        <div>
          <p class="eyebrow">RANK DATA</p>
          <h2>国服英雄数据榜</h2>
          <p>官方同步实时胜率、登场率与 BAN 率排行榜</p>
        </div>
      </div>

      <div class="filter-panel">
        <div class="filter-row">
          <div class="filter-label">🏆 分段选择:</div>
          <div class="btn-group">
            <button
              v-for="dan in danOptions"
              :key="dan.value"
              class="pill-btn"
              :class="{ active: selectedDan === dan.value }"
              @click="selectDan(dan.value)"
            >
              {{ dan.label }}
            </button>
          </div>
        </div>

        <div class="filter-row">
          <div class="filter-label">🛡️ 分路位置:</div>
          <div class="btn-group">
            <button
              v-for="pos in positionOptions"
              :key="pos.value"
              class="pill-btn"
              :class="{ active: selectedPosition === pos.value }"
              @click="selectPosition(pos.value)"
            >
              {{ pos.label }}
            </button>
          </div>

          <input
            v-model="searchKeyword"
            type="text"
            class="search-input"
            placeholder="🔍 搜索英雄名称 / 称号 (如: 凯尔、亚索)"
          />
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        ⚔️ 正在实时拉取《英雄联盟手游》国服英雄胜率数据...
      </div>

      <div v-else-if="filteredHeroList.length > 0" class="stats-table-wrapper">
        <div class="update-time-text">
          <span>📅 数据时间: {{ updateDate }} (样本取自国服大盘竞技战报)</span>
          <span>当前共 {{ filteredHeroList.length }} 位英雄数据</span>
        </div>

        <div v-if="selectedHero" class="selected-hero-panel">
          <div class="selected-hero-main">
            <img :src="selectedHero.avatar" :alt="selectedHero.title" />
            <div>
              <span>已选择英雄</span>
              <strong>{{ selectedHero.title }} · {{ selectedHero.name }}</strong>
              <p>{{ buildHeroDetailUrl(selectedHero) }}</p>
            </div>
          </div>
          <div class="selected-hero-actions">
            <button class="oat-btn primary" type="button" @click="openHeroDetail(selectedHero)">
              开始吧
            </button>
            <button class="oat-btn secondary" type="button" @click="openHeroDetail(selectedHero)">
              详情
            </button>
            <button class="oat-btn outline" type="button" @click="copyHeroDetailLink(selectedHero)">
              复制链接
            </button>
          </div>
        </div>

        <div class="hero-grid-toolbar">
          <span>排序方式</span>
          <button
            class="sort-chip"
            :class="{ active: sortField === 'winRateNum' }"
            type="button"
            @click="toggleSort('winRateNum')"
          >
            胜率 {{ sortField === 'winRateNum' ? (sortOrder === 'desc' ? '▼' : '▲') : '' }}
          </button>
          <button
            class="sort-chip"
            :class="{ active: sortField === 'appearRateNum' }"
            type="button"
            @click="toggleSort('appearRateNum')"
          >
            登场率 {{ sortField === 'appearRateNum' ? (sortOrder === 'desc' ? '▼' : '▲') : '' }}
          </button>
          <button
            class="sort-chip"
            :class="{ active: sortField === 'forbidRateNum' }"
            type="button"
            @click="toggleSort('forbidRateNum')"
          >
            BAN率 {{ sortField === 'forbidRateNum' ? (sortOrder === 'desc' ? '▼' : '▲') : '' }}
          </button>
        </div>

        <div class="hero-card-grid">
          <div
            v-for="(hero, idx) in sortedHeroList"
            :key="hero.heroId + '-' + idx"
            class="hero-card"
            :class="{ active: selectedHero?.heroId === hero.heroId }"
            role="button"
            tabindex="0"
            @click="selectHero(hero)"
            @keydown.enter.prevent="selectHero(hero)"
            @keydown.space.prevent="selectHero(hero)"
          >
            <div class="hero-card-top">
              <span class="rank-num" :class="`top-${idx + 1}`">{{ idx + 1 }}</span>
              <img :src="hero.avatar" class="avatar" :alt="hero.title" />
              <div class="name-box">
                <div class="hero-title">{{ hero.title }}</div>
                <div class="hero-name">{{ hero.name }}</div>
              </div>
            </div>

            <div class="hero-stat-grid">
              <div>
                <span>胜率</span>
                <strong class="win-rate">{{ hero.winRatePercent }}</strong>
              </div>
              <div>
                <span>登场</span>
                <strong class="appear-rate">{{ hero.appearRatePercent }}</strong>
              </div>
              <div>
                <span>BAN</span>
                <strong class="ban-rate">{{ hero.forbidRatePercent }}</strong>
              </div>
            </div>

            <div class="hero-card-actions">
              <button class="oat-btn small primary" type="button" @click.stop="openHeroDetail(hero)">
                详情
              </button>
              <button class="oat-btn small outline" type="button" @click.stop="copyHeroDetailLink(hero)">
                复制
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="errorMessage" class="empty-state">
        ⚠️ {{ errorMessage }}
      </div>

      <div v-else class="empty-state">
        🔍 暂无符合条件的英雄数据，请尝试调整筛选分段或搜索关键词。
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  requestLolmHeroListJson,
  requestLolmNewsJson,
  requestLolmRankJson,
  type LolmNewsRawItem
} from '../../utils/lolmApi'

interface HeroMeta {
  heroId: string
  name: string
  title: string
  avatar: string
}

interface HeroRankItem {
  heroId: string
  name: string
  title: string
  avatar: string
  position: string
  winRateNum: number
  appearRateNum: number
  forbidRateNum: number
  winRatePercent: string
  appearRatePercent: string
  forbidRatePercent: string
  dtstatdate: string
}

interface LolmNewsSubCategory {
  name: string
  tags: string
}

interface LolmNewsCategory {
  name: string
  tags: string
  subMenu?: LolmNewsSubCategory[]
}

interface OfficialNewsItem {
  id: string
  docId: string
  title: string
  desc: string
  image: string
  date: string
  created: string
  tags: string[]
  author: string
  typeLabel: string
  infoType: number
  totalPlay: number
  detailUrl: string
  location: string
  raw: LolmNewsRawItem
}

interface NewsRawField {
  key: string
  label: string
  value: string
}

const router = useRouter()
const loading = ref<boolean>(false)
const selectedDan = ref<string>('1')
const selectedPosition = ref<string>('all')
const searchKeyword = ref<string>('')
const sortField = ref<'winRateNum' | 'appearRateNum' | 'forbidRateNum'>('winRateNum')
const sortOrder = ref<'desc' | 'asc'>('desc')

const updateDate = ref<string>('')
const allRankData = ref<Record<string, Record<string, HeroRankItem[]>>>({})
const errorMessage = ref<string>('')
const selectedHero = ref<HeroRankItem | null>(null)

const officialNewsCategories: LolmNewsCategory[] = [
  { name: '新闻', tags: '113538' },
  { name: '版本', tags: '119437' },
  { name: '公告', tags: '113539' },
  { name: '社区', tags: '113542,113541' },
  {
    name: '赛事',
    tags: '117878,117877,17483,118344',
    subMenu: [
      { name: '全部', tags: '117878,117877,17483,118344' },
      { name: '官方资讯', tags: '117878,117877' },
      { name: '比赛回顾', tags: '17483' },
      { name: '俱乐部', tags: '118344' }
    ]
  }
]

const activeNewsIndex = ref<number>(2)
const activeSubMenuIndex = ref<number>(0)
const officialNewsPage = ref<number>(1)
const officialNewsPageSize = 9
const officialNewsTotal = ref<number>(0)
const officialNewsLoading = ref<boolean>(false)
const hotNewsLoading = ref<boolean>(false)
const officialNewsError = ref<string>('')
const hotNewsError = ref<string>('')
const officialHotNews = ref<OfficialNewsItem[]>([])
const officialNewsList = ref<OfficialNewsItem[]>([])
const officialNewsKeyword = ref<string>('')

const danOptions = [
  { label: '💎 钻石以上', value: '1' },
  { label: '👑 大师以上', value: '2' },
  { label: '🏆 王者', value: '3' },
  { label: '⚔️ 峡谷之巅', value: '4' }
]

const positionOptions = [
  { label: '🌐 全部分路', value: 'all' },
  { label: '⚔️ 上单', value: '2' },
  { label: '🌲 打野', value: '5' },
  { label: '🧙‍♂️ 中路', value: '1' },
  { label: '🏹 下路', value: '3' },
  { label: '🛡️ 辅助', value: '4' }
]

const rawFieldLabels: Record<string, string> = {
  iId: '内容 ID',
  iNewsId: '新闻 ID',
  iDocID: '文档 ID',
  iInfoType: '资讯类型',
  iTotalPlay: '播放/浏览',
  iTopPos: '置顶位',
  iVideoId: '视频 ID',
  iIsRedirect: '是否跳转',
  sTitle: '标题',
  sDesc: '摘要',
  sIMG: '主图',
  sIMGNew: '新图',
  sTargetIMG: '目标图',
  sTagInfo: '标签信息',
  sTagIds: '标签 ID',
  sSubTypeName: '子类型',
  sTypeName: '类型',
  sAuthor: '作者',
  sCreated: '创建时间',
  sIdxTime: '展示时间',
  sUpdateLocation: '更新地区',
  sCreateLocation: '创建地区',
  sRedirectURL: '跳转地址',
  sUrl: '原始地址',
  sVID: '视频标识',
  sGameVersion: '游戏版本'
}

const activeNewsCategory = computed<LolmNewsCategory>(() => {
  return officialNewsCategories[activeNewsIndex.value] || officialNewsCategories[2]
})

const activeNewsTags = computed<string>(() => {
  const subMenu = activeNewsCategory.value.subMenu
  if (subMenu?.length) {
    return subMenu[activeSubMenuIndex.value]?.tags || activeNewsCategory.value.tags
  }
  return activeNewsCategory.value.tags
})

const activeNewsTagsLabel = computed<string>(() => {
  const subMenu = activeNewsCategory.value.subMenu
  if (subMenu?.length) {
    return `${activeNewsCategory.value.name} / ${subMenu[activeSubMenuIndex.value]?.name || '全部'}`
  }
  return activeNewsCategory.value.name
})

const officialNewsPageCount = computed<number>(() => {
  return Math.max(1, Math.ceil(officialNewsTotal.value / officialNewsPageSize))
})

const officialNewsPageOptions = computed<number[]>(() => {
  return Array.from({ length: officialNewsPageCount.value }, (_, index) => index + 1)
})

const displayOfficialNewsList = computed<OfficialNewsItem[]>(() => {
  const keyword = officialNewsKeyword.value.trim().toLowerCase()
  if (!keyword) return officialNewsList.value

  return officialNewsList.value.filter((news) => {
    return [
      news.title,
      news.desc,
      news.author,
      news.typeLabel,
      news.docId,
      ...news.tags
    ].some((value) => value.toLowerCase().includes(keyword))
  })
})

const rawHeroList = computed<HeroRankItem[]>(() => {
  const danData = allRankData.value[selectedDan.value]
  if (!danData) return []

  if (selectedPosition.value !== 'all') {
    return danData[selectedPosition.value] || []
  }

  const map = new Map<string, HeroRankItem>()
  for (const posKey of Object.keys(danData)) {
    const list = danData[posKey] || []
    for (const item of list) {
      if (!map.has(item.heroId) || item.winRateNum > (map.get(item.heroId)?.winRateNum || 0)) {
        map.set(item.heroId, item)
      }
    }
  }
  return Array.from(map.values())
})

const filteredHeroList = computed<HeroRankItem[]>(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return rawHeroList.value
  return rawHeroList.value.filter(h =>
    h.name.toLowerCase().includes(kw) ||
    h.title.toLowerCase().includes(kw)
  )
})

const sortedHeroList = computed<HeroRankItem[]>(() => {
  const list = [...filteredHeroList.value]
  const field = sortField.value
  const isDesc = sortOrder.value === 'desc'

  return list.sort((a, b) => {
    const diff = a[field] - b[field]
    return isDesc ? -diff : diff
  })
})

function goBack(): void {
  router.push('/toolbox')
}

function selectDan(dan: string): void {
  selectedDan.value = dan
  selectedHero.value = null
}

function selectPosition(pos: string): void {
  selectedPosition.value = pos
  selectedHero.value = null
}

function toggleSort(field: 'winRateNum' | 'appearRateNum' | 'forbidRateNum'): void {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortField.value = field
    sortOrder.value = 'desc'
  }
}

function selectOfficialCategory(index: number): void {
  activeNewsIndex.value = index
  activeSubMenuIndex.value = 0
  officialNewsKeyword.value = ''
  officialNewsPage.value = 1
  loadOfficialNews()
}

function selectOfficialSubMenu(index: number): void {
  activeSubMenuIndex.value = index
  officialNewsKeyword.value = ''
  officialNewsPage.value = 1
  loadOfficialNews()
}

function changeOfficialNewsPage(page: number): void {
  officialNewsPage.value = Math.min(Math.max(page, 1), officialNewsPageCount.value)
  loadOfficialNews()
}

function refreshOfficialNews(): void {
  loadOfficialHotNews()
  loadOfficialNews()
}

function normalizeLolmImage(url?: string): string {
  if (!url) return 'https://game.gtimg.cn/images/lolm/v2/act/a20200929order/icon.png'
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('http://')) return url.replace('http://', 'https://')
  return url
}

function getCoverMapImage(raw: LolmNewsRawItem): string {
  if (!raw.sCoverMap || typeof raw.sCoverMap !== 'string') return ''
  try {
    const coverMap = JSON.parse(raw.sCoverMap) as Record<string, { Url?: string }>
    return coverMap.One?.Url || coverMap.Two?.Url || ''
  } catch {
    return ''
  }
}

function parseTagNames(raw: LolmNewsRawItem): string[] {
  const fromList = raw.sTagInfoList
    ?.map((tag) => tag.name || '')
    .filter(Boolean)
    .filter((name) => !name.includes('请忽略'))

  if (fromList?.length) {
    return Array.from(new Set(fromList))
  }

  const fromText = (raw.sTagInfo || '')
    .split(',')
    .map((item) => item.split('|')[1]?.trim() || '')
    .filter(Boolean)
    .filter((name) => !name.includes('请忽略'))

  return Array.from(new Set(fromText.length ? fromText : [raw.sSubTypeName || '官方']))
}

function normalizeOfficialNewsItem(raw: LolmNewsRawItem): OfficialNewsItem {
  const docId = String(raw.iDocID || raw.iNewsId || raw.iId || '')
  const redirectUrl = typeof raw.sRedirectURL === 'string' ? raw.sRedirectURL : ''
  const detailUrl = redirectUrl.startsWith('http')
    ? redirectUrl
    : docId
      ? `https://lolm.qq.com/v2/news-page.html?docid=${docId}`
      : 'https://lolm.qq.com/v2/news.html?goNews=2'

  return {
    id: String(raw.iId || raw.iNewsId || docId || raw.sTitle || Math.random()),
    docId,
    title: raw.sTitle || '未命名资讯',
    desc: raw.sDesc || '',
    image: normalizeLolmImage(raw.sIMG || raw.sIMGNew || raw.sTargetIMG || raw.sCoverList?.[0]?.url || getCoverMapImage(raw)),
    date: (raw.sIdxTime || raw.sCreated || '').slice(0, 10) || '未知日期',
    created: raw.sCreated || '',
    tags: parseTagNames(raw),
    author: raw.sAuthor || '英雄联盟手游官方',
    typeLabel: raw.sSubTypeName || raw.sTypeName || '官方',
    infoType: Number(raw.iInfoType || 0),
    totalPlay: Number(raw.iTotalPlay || 0),
    detailUrl,
    location: raw.sUpdateLocation || raw.sCreateLocation || '',
    raw
  }
}

function stringifyRawValue(value: unknown): string {
  if (value === null || value === undefined) return '暂无'
  if (typeof value === 'string') return value || '暂无'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function getNewsRawFields(raw: LolmNewsRawItem): NewsRawField[] {
  return Object.entries(raw)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => ({
      key,
      label: rawFieldLabels[key] || key,
      value: stringifyRawValue(value)
    }))
}

function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString('zh-CN') : '0'
}

function openOfficialNews(news: OfficialNewsItem): void {
  window.open(news.detailUrl, '_blank', 'noopener,noreferrer')
}

function buildHeroDetailUrl(hero: HeroRankItem): string {
  return `https://lolm.qq.com/v2/detail.html?heroid=${encodeURIComponent(hero.heroId)}`
}

function selectHero(hero: HeroRankItem): void {
  selectedHero.value = hero
}

function openHeroDetail(hero: HeroRankItem): void {
  window.open(buildHeroDetailUrl(hero), '_blank', 'noopener,noreferrer')
}

async function copyHeroDetailLink(hero: HeroRankItem): Promise<void> {
  const link = buildHeroDetailUrl(hero)
  try {
    await navigator.clipboard.writeText(link)
    ElMessage.success(`${hero.title} 详情链接已复制`)
  } catch {
    ElMessage.error('复制失败，请手动复制链接')
  }
}

async function loadOfficialHotNews(): Promise<void> {
  hotNewsLoading.value = true
  hotNewsError.value = ''
  try {
    const res = await requestLolmNewsJson({
      filter: 'channel',
      chanid: '4896',
      typeids: '1,2',
      withtop: 'yes',
      topMode: 'new',
      start: 0,
      limit: 9,
      logic: 'or'
    })

    if (res.status !== 0) {
      throw new Error(res.msg || '官方焦点新闻返回异常')
    }

    officialHotNews.value = (res.data?.items || []).map(normalizeOfficialNewsItem)
  } catch (err) {
    const message = err instanceof Error ? err.message : '获取官方焦点新闻失败'
    console.warn('获取 LOLM 官方焦点新闻失败:', err)
    hotNewsError.value = message
    officialHotNews.value = []
  } finally {
    hotNewsLoading.value = false
  }
}

async function loadOfficialNews(): Promise<void> {
  officialNewsLoading.value = true
  officialNewsError.value = ''
  try {
    const res = await requestLolmNewsJson({
      filter: 'tag',
      tagids: activeNewsTags.value,
      typeids: '1,2',
      start: (officialNewsPage.value - 1) * officialNewsPageSize,
      limit: officialNewsPageSize,
      logic: 'or'
    })

    if (res.status !== 0) {
      throw new Error(res.msg || '官方资讯列表返回异常')
    }

    officialNewsTotal.value = Number(res.data?.total || 0)
    officialNewsList.value = (res.data?.items || []).map(normalizeOfficialNewsItem)
  } catch (err) {
    const message = err instanceof Error ? err.message : '获取官方资讯列表失败'
    console.warn('获取 LOLM 官方资讯列表失败:', err)
    officialNewsError.value = message
    officialNewsList.value = []
    officialNewsTotal.value = 0
  } finally {
    officialNewsLoading.value = false
  }
}

async function fetchLolmData(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    const [heroRes, rankRes] = await Promise.all([
      requestLolmHeroListJson<{ heroList?: Record<string, HeroMeta> }>().catch(() => ({ heroList: {} })),
      requestLolmRankJson<{ data?: Record<string, Record<string, any[]>> }>().catch(() => ({ data: undefined }))
    ])

    const heroMap: Record<string, HeroMeta> = heroRes.heroList || {}
    const rankData = rankRes.data

    if (!rankData) {
      throw new Error('未获取到国服英雄胜率排行榜')
    }

    const parsed: Record<string, Record<string, HeroRankItem[]>> = {}

    for (const danKey of Object.keys(rankData)) {
      parsed[danKey] = {}
      const placeMap = rankData[danKey] || {}
      for (const posKey of Object.keys(placeMap)) {
        const list = placeMap[posKey] || []
        parsed[danKey][posKey] = list.map((item: any) => {
          const meta = heroMap[item.hero_id] || {}
          if (item.dtstatdate && !updateDate.value) {
            updateDate.value = `${item.dtstatdate.slice(0, 4)}-${item.dtstatdate.slice(4, 6)}-${item.dtstatdate.slice(6, 8)}`
          }
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

    if (!parsed['4'] || Object.keys(parsed['4']).length === 0 || Object.values(parsed['4']).every(arr => arr.length === 0)) {
      parsed['4'] = parsed['3'] || parsed['1'] || parsed['0'] || {}
    }

    allRankData.value = parsed
    if (!updateDate.value) {
      updateDate.value = new Date().toLocaleDateString('zh-CN')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '获取 LOLM 英雄胜率失败'
    console.warn('获取 LOLM 英雄胜率失败:', err)
    allRankData.value = {}
    updateDate.value = ''
    errorMessage.value = message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLolmData()
  loadOfficialHotNews()
  loadOfficialNews()
})
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
