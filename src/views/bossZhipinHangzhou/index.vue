<template>
  <main class="boss-home-page">
    <header class="boss-topbar">
      <div class="boss-inner boss-topbar-inner">
        <button type="button" class="brand" @click="openBossHome">
          <span class="brand-mark">B</span>
          <span>BOSS直聘</span>
        </button>
        <button type="button" class="city-switch" @click="openCityModal">
          <span aria-hidden="true">⌖</span>
          <strong>{{ selectedCity.name }}</strong>
          <em>[切换]</em>
        </button>
        <nav class="top-nav" aria-label="BOSS直聘导航">
          <button v-for="item in navItems" :key="item.label" type="button" :class="{ active: item.active }" @click="openExternal(item.href)">
            {{ item.label }}
          </button>
        </nav>
        <div class="top-actions">
          <button type="button" @click="openExternal(`${BOSS_HOME_URL}#upload`)">上传简历</button>
          <button type="button" @click="openExternal(BOSS_RECRUITER_URL)">我要招聘</button>
          <button type="button" class="outline-action" @click="openBossHome">登录/注册</button>
        </div>
      </div>
    </header>

    <section class="search-panel" :aria-label="`${selectedCity.name}招聘搜索`">
      <div class="boss-inner search-inner">
        <div class="search-copy">
          <p class="city-label">{{ selectedCity.name }}站</p>
          <h1>{{ selectedCity.name }}招聘网</h1>
          <p>海量{{ selectedCity.name }}人才招聘信息，按职位、公司、行业快速筛选，和 Boss 在线沟通。</p>
        </div>

        <form class="search-box" @submit.prevent="submitSearch">
          <label class="job-type-select">
            <span>职位类型</span>
            <select v-model="selectedJobTypeCode" aria-label="职位类型" @change="handleJobTypeChange">
              <option v-for="item in jobTypeOptions" :key="item.code" :value="item.code">{{ item.name }}</option>
            </select>
          </label>
          <label class="keyword-field">
            <span class="sr-only">搜索职位、公司</span>
            <input v-model.trim="searchKeyword" type="search" placeholder="搜索职位、公司" />
          </label>
          <button type="button" class="map-button" @click="openMapPage">地图</button>
          <button type="submit" class="search-button">搜索</button>
        </form>

        <div class="hot-searches" :class="{ refreshing: metaLoading }">
          <strong>热门职位:</strong>
          <button v-for="item in hotKeywords" :key="item.code" type="button" @click="selectPosition(item)">
            {{ item.name }}
          </button>
        </div>
      </div>
    </section>

    <section class="main-area boss-inner" :aria-label="`${selectedCity.name}招聘首页内容`">
      <aside class="category-panel" aria-label="职位类别">
        <div v-if="metaLoading" class="category-state">正在加载职位分类...</div>
        <div v-else-if="metaError" class="category-state error">{{ metaError }}</div>
        <template v-else>
          <article v-for="group in visibleCategoryGroups" :key="group.code" class="category-row">
            <div>
              <button type="button" :class="{ active: selectedJobTypeCode === String(group.code) }" @click="selectPositionGroup(group)">
                {{ group.name }}
              </button>
              <span>{{ summarizeCategory(group) }}</span>
            </div>
            <div class="category-links">
              <button v-for="role in topRoles(group)" :key="role.code" type="button" :class="{ active: selectedPosition?.code === role.code }" @click="selectPosition(role)">
                {{ role.name }}
              </button>
            </div>
          </article>
          <div v-if="!visibleCategoryGroups.length" class="category-state">暂无职位分类数据</div>
        </template>
        <footer v-if="categoryPageCount > 1" class="category-pager">
          <span>{{ categoryPage + 1 }} / {{ categoryPageCount }}</span>
          <div>
            <button type="button" :disabled="categoryPage === 0" @click="turnCategoryPage(-1)">‹</button>
            <button type="button" :disabled="categoryPage >= categoryPageCount - 1" @click="turnCategoryPage(1)">›</button>
          </div>
        </footer>
      </aside>

      <section class="content-column">
        <section class="quick-register" aria-label="快速注册">
          <div>
            <strong>和{{ selectedCity.name }}好机会直接开聊</strong>
            <span>填写手机号，模拟官网首页快速登录/注册入口。</span>
          </div>
          <label>
            <span class="sr-only">手机号</span>
            <input type="tel" placeholder="输入手机号" maxlength="11" />
          </label>
          <label>
            <span class="sr-only">验证码</span>
            <input type="text" placeholder="验证码" maxlength="6" />
          </label>
          <button type="button" @click="openBossHome">登录/注册</button>
        </section>

        <section class="jobs-section" aria-labelledby="hot-jobs-title">
          <div class="section-heading">
            <div>
              <span>Hot Jobs</span>
              <h2 id="hot-jobs-title">{{ activePositionTitle }}职位入口</h2>
            </div>
            <div class="section-actions">
              <button
                v-for="mode in listingModes"
                :key="mode.value"
                type="button"
                :class="{ active: selectedListingMode === mode.value }"
                @click="selectListingMode(mode.value)"
              >
                {{ mode.label }}
              </button>
              <button type="button" class="primary-link" @click="openExternal(buildPositionListUrl())">查看更多职位</button>
            </div>
          </div>

          <p v-if="jobListError" class="request-note">{{ jobListError }}</p>
          <div v-if="metaLoading || jobListLoading" class="entry-state">
            {{ jobListLoading ? jobListMessage || '正在按当前城市和分类请求 BOSS 职位列表...' : '正在同步 BOSS 职位分类接口...' }}
          </div>
          <div v-else-if="!visiblePositionCards.length" class="entry-state">暂无可展示职位分类</div>
          <div v-else class="job-grid">
            <article
              v-for="job in visiblePositionCards"
              :key="job.cardKey || job.code"
              class="boss-job-card"
              :class="{ active: isSelectedPosition(job), resolving: resolvingPositionCode === job.code }"
            >
              <header>
                <h3>{{ job.name }}</h3>
                <strong>{{ selectedCity.name }}</strong>
              </header>
              <p>{{ job.parentName }} · {{ job.source === 'job' ? 'BOSS 职位列表接口' : 'BOSS 职位分类接口' }} · p{{ job.code }}</p>
              <div class="tag-row">
                <span v-for="tag in job.tags" :key="tag">{{ tag }}</span>
              </div>
              <footer>
                <div class="company-avatar">B</div>
                <div>
                  <b>{{ job.brandName || `${selectedCity.name}${job.name}招聘` }}</b>
                  <span>{{ job.detailUrl ? '来自 BOSS 实时职位列表' : '打开官网实时职位列表' }}</span>
                </div>
                <button type="button" :disabled="resolvingPositionCode === job.code" @click.stop="openPosition(job)">
                  {{ resolvingPositionCode === job.code ? '打开中' : '查看职位' }}
                </button>
              </footer>
            </article>
          </div>
        </section>

        <section class="companies-section" aria-labelledby="hot-industries-title">
          <div class="section-heading">
            <div>
              <span>Industries</span>
              <h2 id="hot-industries-title">{{ activeIndustryTitle }}</h2>
            </div>
            <button type="button" @click="openExternal(buildCompanyListUrl())">查看公司</button>
          </div>
          <div class="company-grid">
            <article
              v-for="industry in visibleIndustryCards"
              :key="industry.code"
              class="company-card"
              :class="{ active: selectedIndustry?.code === industry.code }"
              tabindex="0"
              @click="selectIndustry(industry)"
              @keyup.enter="selectIndustry(industry)"
            >
              <div class="company-logo">{{ industry.name.slice(0, 1) }}</div>
              <div>
                <h3>{{ industry.name }}</h3>
                <p>{{ industry.children.map((item) => item.name).slice(0, 3).join(' · ') }}</p>
                <span>{{ industry.children.length }} 个细分行业</span>
              </div>
            </article>
          </div>
        </section>
      </section>
    </section>

    <section class="boss-inner link-section" :aria-label="`${selectedCity.name}求职入口`">
      <div class="city-links">
        <strong>热门城市</strong>
        <button v-for="city in visibleFooterCities" :key="city.code" type="button" @click="selectCity(city)">
          {{ city.name }}
        </button>
      </div>
      <div class="footer-links">
        <strong>友情链接</strong>
        <button v-for="item in footerLinks" :key="item" type="button" @click="openSearch(item)">
          {{ item }}
        </button>
      </div>
    </section>

    <aside class="float-actions" aria-label="页面快捷操作">
      <button type="button" title="打开 BOSS直聘杭州首页" @click="openBossHome">官网</button>
      <button type="button" title="返回顶部" @click="scrollToTop">顶部</button>
    </aside>

    <teleport to="body">
      <section v-if="isCityModalOpen" class="boss-city-overlay" @click.self="closeCityModal">
        <div class="boss-city-dialog" role="dialog" aria-modal="true" aria-label="切换城市">
          <header class="boss-city-dialog-head">
            <div class="province-picker">
              <strong>按省份选择</strong>
              <label>
                <span class="sr-only">省份</span>
                <select v-model="selectedProvinceCode" aria-label="省份" @change="handleProvinceChange">
                  <option value="">省份</option>
                  <option v-for="province in provinceCities" :key="province.code" :value="String(province.code)">
                    {{ province.name }}
                  </option>
                </select>
              </label>
              <label>
                <span class="sr-only">城市</span>
                <select v-model="selectedProvinceCityCode" aria-label="城市" :disabled="!selectedProvinceCities.length" @change="handleProvinceCityChange">
                  <option value="">城市</option>
                  <option v-for="city in selectedProvinceCities" :key="city.code" :value="String(city.code)">
                    {{ city.name }}
                  </option>
                </select>
              </label>
            </div>
            <div class="city-direct-search">
              <strong>直接搜索</strong>
              <label>
                <span class="sr-only">城市名称</span>
                <input v-model.trim="citySearchKeyword" type="search" placeholder="城市名称" />
                <i aria-hidden="true">⌕</i>
              </label>
            </div>
            <button type="button" class="city-close-button" title="关闭" @click="closeCityModal">×</button>
          </header>

          <section class="boss-city-dialog-body">
            <div v-if="cityLoading" class="city-state">正在加载 BOSS 城市接口...</div>
            <div v-else-if="cityError" class="city-state error">{{ cityError }}</div>

            <template v-else>
              <section class="hot-city-section" aria-label="热门城市">
                <h2>热门城市</h2>
                <div class="hot-city-grid">
                  <button v-for="city in hotCities" :key="city.code" type="button" :class="{ active: isSelectedCity(city) }" @click="selectCity(city)">
                    {{ city.name }}
                  </button>
                </div>
              </section>

              <section class="alphabet-section" aria-label="按字母选择城市">
                <div class="alphabet-tabs">
                  <strong>按字母选择:</strong>
                  <button v-for="letter in cityLetters" :key="letter" type="button" @click="scrollCityLetter(letter)">
                    {{ letter }}
                  </button>
                </div>

                <div class="city-group-list">
                  <article v-for="group in filteredCityGroups" :key="group.firstChar" :id="`city-letter-${group.firstChar}`" class="city-group-row">
                    <strong>{{ group.firstChar }}</strong>
                    <div>
                      <button
                        v-for="city in visibleGroupCities(group)"
                        :key="city.code"
                        type="button"
                        :class="{ active: isSelectedCity(city) }"
                        @click="selectCity(city)"
                      >
                        {{ city.name }}
                      </button>
                      <button
                        v-if="group.cityList.length > CITY_GROUP_COLLAPSE_COUNT && !expandedCityGroups.has(group.firstChar) && !citySearchKeyword"
                        type="button"
                        class="more-city-button"
                        @click="expandCityGroup(group.firstChar)"
                      >
                        更多⌄
                      </button>
                    </div>
                  </article>
                </div>
              </section>
            </template>
          </section>
        </div>
      </section>
    </teleport>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  BOSS_APP_URL,
  BOSS_ARTICLE_URL,
  BOSS_CAMPUS_URL,
  BOSS_DEFAULT_CITY,
  BOSS_HOME_URL,
  BOSS_OVERSEAS_URL,
  BOSS_RECRUITER_URL,
  BOSS_YOULE_URL,
  buildBossCityJobsUrl,
  buildBossCompanyListUrl,
  buildBossJobDetailUrl,
  buildBossMapUrl,
  buildBossOfficialHomeUrl,
  buildBossPositionUrl,
  buildBossSearchUrl
} from '@/constants/bossZhipin'
import {
  fetchBossCityCache,
  fetchBossCityEndpoints,
  fetchBossJobList,
  fetchBossMetaEndpoints
} from '@/services/bossZhipin'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import type {
  BossCity,
  BossCityCache,
  BossCityGroup,
  BossCityGroupResponse,
  BossCityResponse,
  BossJobListItem,
  BossJobListResponse,
  BossOptionNode,
  BossOptionResponse
} from '@/types/bossZhipin'
import { storage } from '@/utils/storage'

interface NavItem {
  label: string
  href: string
  active?: boolean
}

interface CityLink {
  name: string
  code: number
  href: string
}

interface PositionCard extends BossOptionNode {
  cardKey?: string
  parentName: string
  tags: string[]
  brandName?: string
  detailUrl?: string
  source?: 'position' | 'job'
}

interface IndustryCard extends BossOptionNode {
  children: BossOptionNode[]
}

type ListingMode = 'featured' | 'latest' | 'related'

const CITY_GROUP_COLLAPSE_COUNT = 10
const CATEGORY_PAGE_SIZE = 6
const isProd = import.meta.env.PROD
const router = useRouter()
const storedCity = readStoredBossCity()
const searchKeyword = ref<string>('')
const selectedJobTypeCode = ref<string>('all')
const selectedPosition = ref<PositionCard | null>(null)
const selectedIndustry = ref<IndustryCard | null>(null)
const selectedListingMode = ref<ListingMode>('featured')
const selectedCity = ref<BossCity>(storedCity || { ...BOSS_DEFAULT_CITY })
const hasStoredCity = ref<boolean>(Boolean(storedCity))
const categoryPage = ref<number>(0)
const isCityModalOpen = ref<boolean>(false)
const cityLoading = ref<boolean>(false)
const cityError = ref<string>('')
const metaLoading = ref<boolean>(false)
const metaError = ref<string>('')
const jobListLoading = ref<boolean>(false)
const jobListError = ref<string>('')
const jobListMessage = ref<string>('')
const livePositionCards = ref<PositionCard[]>([])
const resolvingPositionCode = ref<number | null>(null)
const citySearchKeyword = ref<string>('')
const expandedCityGroups = ref<Set<string>>(new Set<string>())
const provinceCities = ref<BossCity[]>([])
const selectedProvinceCode = ref<string>('')
const selectedProvinceCityCode = ref<string>('')
const positionGroups = ref<BossOptionNode[]>([])
const industryGroups = ref<BossOptionNode[]>([])
const hotCities = ref<BossCity[]>([
  { code: 100010000, name: '全国' },
  { code: 101010100, name: '北京' },
  { code: 101020100, name: '上海' },
  { code: 101280100, name: '广州' },
  { code: 101280600, name: '深圳' },
  { code: 101210100, name: '杭州' },
  { code: 101030100, name: '天津' },
  { code: 101110100, name: '西安' },
  { code: 101190400, name: '苏州' },
  { code: 101200100, name: '武汉' },
  { code: 101230200, name: '厦门' },
  { code: 101250100, name: '长沙' },
  { code: 101270100, name: '成都' },
  { code: 101180100, name: '郑州' },
  { code: 101040100, name: '重庆' }
])
const cityGroups = ref<BossCityGroup[]>([
  {
    firstChar: 'A',
    cityList: [
      { code: 101070300, name: '鞍山' },
      { code: 101081200, name: '阿拉善盟' },
      { code: 101110700, name: '安康' },
      { code: 101131000, name: '阿克苏地区' },
      { code: 101140700, name: '阿里地区' },
      { code: 101180200, name: '安阳' },
      { code: 101220600, name: '安庆' },
      { code: 101260300, name: '安顺' }
    ]
  },
  {
    firstChar: 'B',
    cityList: [
      { code: 101010100, name: '北京' },
      { code: 101060900, name: '白城' },
      { code: 101090200, name: '保定' },
      { code: 101110900, name: '宝鸡' },
      { code: 101220900, name: '蚌埠' },
      { code: 101301000, name: '北海' }
    ]
  },
  {
    firstChar: 'C',
    cityList: [
      { code: 101040100, name: '重庆' },
      { code: 101060100, name: '长春' },
      { code: 101071200, name: '朝阳' },
      { code: 101250100, name: '长沙' },
      { code: 101270100, name: '成都' },
      { code: 101191100, name: '常州' }
    ]
  }
])
const navItems = computed<NavItem[]>((): NavItem[] => [
  { label: '首页', href: buildOfficialHomeUrl(), active: true },
  { label: '职位', href: buildBossCityJobsUrl(selectedCity.value.code) },
  { label: '地图', href: buildOfficialMapUrl() },
  { label: '校园', href: BOSS_CAMPUS_URL },
  { label: '海归', href: BOSS_OVERSEAS_URL },
  { label: 'APP', href: BOSS_APP_URL },
  { label: '资讯', href: BOSS_ARTICLE_URL },
  { label: '有了', href: BOSS_YOULE_URL }
])
const listingModes: Array<{ label: string; value: ListingMode }> = [
  { label: '精选职位', value: 'featured' },
  { label: '最新职位', value: 'latest' },
  { label: '相关职位', value: 'related' }
]
const cityLetters = computed<string[]>((): string[] => cityGroups.value.map((group: BossCityGroup): string => group.firstChar))
const jobTypeOptions = computed<Array<{ code: string; name: string }>>((): Array<{ code: string; name: string }> => [
  { code: 'all', name: '全部职位' },
  ...positionGroups.value.map((group: BossOptionNode): { code: string; name: string } => ({
    code: String(group.code),
    name: group.name
  }))
])
const allPositionCards = computed<PositionCard[]>((): PositionCard[] => flattenPositionCards(positionGroups.value))
const selectedPositionGroup = computed<BossOptionNode | null>((): BossOptionNode | null => {
  if (selectedJobTypeCode.value === 'all') return null
  return positionGroups.value.find((group: BossOptionNode): boolean => String(group.code) === selectedJobTypeCode.value) || null
})
const categoryPageCount = computed<number>((): number => Math.max(1, Math.ceil(positionGroups.value.length / CATEGORY_PAGE_SIZE)))
const visibleCategoryGroups = computed<BossOptionNode[]>((): BossOptionNode[] => {
  const start = categoryPage.value * CATEGORY_PAGE_SIZE
  return positionGroups.value.slice(start, start + CATEGORY_PAGE_SIZE)
})
const hotKeywords = computed<PositionCard[]>((): PositionCard[] => allPositionCards.value.slice(0, 10))
const activePositionTitle = computed<string>((): string => {
  if (selectedPosition.value) return `${selectedCity.value.name}${selectedPosition.value.name}`
  if (selectedPositionGroup.value) return `${selectedCity.value.name}${selectedPositionGroup.value.name}`
  return `${selectedCity.value.name}热门`
})
const activeIndustryTitle = computed<string>((): string => {
  return selectedIndustry.value ? `${selectedIndustry.value.name}相关行业` : '相关行业'
})
const visiblePositionCards = computed<PositionCard[]>((): PositionCard[] => {
  if (livePositionCards.value.length) return livePositionCards.value

  const orderCards = (cards: PositionCard[]): PositionCard[] => {
    if (selectedListingMode.value === 'latest') return [...cards].sort((left: PositionCard, right: PositionCard): number => right.code - left.code)
    if (selectedListingMode.value === 'related') return [...cards].sort((left: PositionCard, right: PositionCard): number => left.name.localeCompare(right.name, 'zh-Hans-CN'))
    return cards
  }

  if (selectedPosition.value) {
    const siblings = allPositionCards.value.filter((item: PositionCard): boolean => item.parentName === selectedPosition.value?.parentName)
    return orderCards(uniquePositionCards([selectedPosition.value, ...siblings])).slice(0, 6)
  }

  if (selectedPositionGroup.value) return orderCards(flattenPositionCards([selectedPositionGroup.value])).slice(0, 6)
  return orderCards(allPositionCards.value).slice(0, 6)
})
const visibleIndustryCards = computed<IndustryCard[]>((): IndustryCard[] => {
  const mappedIndustries = industryGroups.value.map((industry: BossOptionNode): IndustryCard => ({
    ...industry,
    children: normalizeOptionList(industry.subLevelModelList)
  }))

  if (!selectedIndustry.value) return mappedIndustries.slice(0, 6)

  return uniqueIndustries([
    selectedIndustry.value,
    ...mappedIndustries.filter((industry: IndustryCard): boolean => industry.code !== selectedIndustry.value?.code)
  ]).slice(0, 6)
})
const selectedProvince = computed<BossCity | null>((): BossCity | null => {
  if (!selectedProvinceCode.value) return null
  return provinceCities.value.find((province: BossCity): boolean => String(province.code) === selectedProvinceCode.value) || null
})
const selectedProvinceCities = computed<BossCity[]>((): BossCity[] => {
  return normalizeCityList(selectedProvince.value?.subLevelModelList || [])
})
const filteredCityGroups = computed<BossCityGroup[]>((): BossCityGroup[] => {
  const keyword = citySearchKeyword.value.trim()
  const sourceGroups = selectedProvince.value && !keyword
    ? [{ firstChar: selectedProvince.value.name, cityList: selectedProvinceCities.value }]
    : cityGroups.value

  if (!keyword) return sourceGroups

  return sourceGroups
    .map((group: BossCityGroup): BossCityGroup => {
      return {
        ...group,
        cityList: group.cityList.filter((city: BossCity): boolean => city.name.includes(keyword))
      }
    })
    .filter((group: BossCityGroup): boolean => group.cityList.length > 0)
})
const visibleFooterCities = computed<CityLink[]>((): CityLink[] => {
  return hotCities.value
    .filter((city: BossCity): boolean => city.name !== '全国')
    .slice(0, 8)
    .map((city: BossCity): CityLink => ({
      name: `${city.name}招聘`,
      code: city.code,
      href: buildCitySearchUrl(city)
    }))
})
const footerLinks = computed<string[]>((): string[] => {
  return hotKeywords.value.slice(0, 6).map((item: PositionCard): string => `${selectedCity.value.name}${item.name}招聘`)
})

function openExternal(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function redirectExternalWindow(targetWindow: Window | null, url: string): void {
  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = url
    return
  }

  openExternal(url)
}

function readStoredBossCity(): BossCity | null {
  const value = storage.getItem<BossCity | null>(STORAGE_KEYS.BOSS_SELECTED_CITY, null)
  if (!value || !value.code || !value.name) return null
  return value
}

function persistSelectedCity(city: BossCity): void {
  storage.setItem(STORAGE_KEYS.BOSS_SELECTED_CITY, city)
  hasStoredCity.value = true
}

function openBossHome(): void {
  openExternal(buildOfficialHomeUrl())
}

function openCityModal(): void {
  syncProvincePickerWithCity(selectedCity.value)
  isCityModalOpen.value = true
  void fetchBossCities(true)
}

function closeCityModal(): void {
  isCityModalOpen.value = false
}

function normalizeCityList(value: BossCity[] | undefined): BossCity[] {
  return Array.isArray(value) ? value.filter((city: BossCity): boolean => Boolean(city.code && city.name)) : []
}

function normalizeOptionList(value: BossOptionNode[] | null | undefined): BossOptionNode[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item: BossOptionNode): boolean => Boolean(item.code && item.name))
    .map((item: BossOptionNode): BossOptionNode => ({
      code: item.code,
      name: item.name,
      subLevelModelList: normalizeOptionList(item.subLevelModelList)
    }))
}

function flattenPositionCards(groups: BossOptionNode[], parentName = ''): PositionCard[] {
  return groups.flatMap((group: BossOptionNode): PositionCard[] => {
    const children = normalizeOptionList(group.subLevelModelList)
    if (!children.length) {
      return [{
        ...group,
        parentName: parentName || group.name,
        tags: [parentName || '职位分类', `p${group.code}`]
      }]
    }

    return flattenPositionCards(children, group.name)
  })
}

function uniquePositionCards(cards: PositionCard[]): PositionCard[] {
  const seenCodes = new Set<number>()
  return cards.filter((card: PositionCard): boolean => {
    if (seenCodes.has(card.code)) return false
    seenCodes.add(card.code)
    return true
  })
}

function uniqueIndustries(cards: IndustryCard[]): IndustryCard[] {
  const seenCodes = new Set<number>()
  return cards.filter((card: IndustryCard): boolean => {
    if (seenCodes.has(card.code)) return false
    seenCodes.add(card.code)
    return true
  })
}

function allKnownCities(): BossCity[] {
  const cities = [
    ...hotCities.value,
    ...cityGroups.value.flatMap((group: BossCityGroup): BossCity[] => group.cityList)
  ]
  const seenCodes = new Set<number>()
  return cities.filter((city: BossCity): boolean => {
    if (seenCodes.has(city.code)) return false
    seenCodes.add(city.code)
    return true
  })
}

function findKnownCity(code: number): BossCity | null {
  return allKnownCities().find((city: BossCity): boolean => Number(city.code) === Number(code)) || null
}

function findProvinceByCity(cityCode: number): BossCity | null {
  return provinceCities.value.find((province: BossCity): boolean => {
    if (Number(province.code) === Number(cityCode)) return true
    return normalizeCityList(province.subLevelModelList || []).some((city: BossCity): boolean => Number(city.code) === Number(cityCode))
  }) || null
}

function syncProvincePickerWithCity(city: BossCity): void {
  const province = findProvinceByCity(city.code)
  selectedProvinceCode.value = province ? String(province.code) : ''
  selectedProvinceCityCode.value = selectedProvinceCities.value.some((item: BossCity): boolean => Number(item.code) === Number(city.code))
    ? String(city.code)
    : ''
}

function handleProvinceChange(): void {
  selectedProvinceCityCode.value = ''
  citySearchKeyword.value = ''
}

function handleProvinceCityChange(): void {
  if (!selectedProvinceCityCode.value) return
  const city = selectedProvinceCities.value.find((item: BossCity): boolean => String(item.code) === selectedProvinceCityCode.value)
  if (city) selectCity(city)
}

function parseCenterGeo(city: BossCity): { longitude: number; latitude: number } | null {
  if (!city.centerGeo) return null
  const [longitude, latitude] = city.centerGeo.split(',').map((value: string): number => Number(value))
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null
  return { longitude, latitude }
}

function geoDistanceSquared(left: { longitude: number; latitude: number }, right: { longitude: number; latitude: number }): number {
  const latitudeWeight = Math.cos(((left.latitude + right.latitude) / 2) * Math.PI / 180)
  const longitudeDistance = (left.longitude - right.longitude) * latitudeWeight
  const latitudeDistance = left.latitude - right.latitude
  return longitudeDistance * longitudeDistance + latitudeDistance * latitudeDistance
}

function findNearestCity(longitude: number, latitude: number): BossCity | null {
  const current = { longitude, latitude }
  return allKnownCities()
    .filter((city: BossCity): boolean => city.name !== BOSS_DEFAULT_CITY.name && Boolean(city.centerGeo))
    .reduce<BossCity | null>((nearestCity: BossCity | null, city: BossCity): BossCity | null => {
      const geo = parseCenterGeo(city)
      if (!geo) return nearestCity
      if (!nearestCity) return city

      const nearestGeo = parseCenterGeo(nearestCity)
      if (!nearestGeo) return city
      return geoDistanceSquared(current, geo) < geoDistanceSquared(current, nearestGeo) ? city : nearestCity
    }, null)
}

function requestBrowserLocationCity(): void {
  if (hasStoredCity.value || selectedCity.value.name !== BOSS_DEFAULT_CITY.name || !navigator.geolocation) return

  navigator.geolocation.getCurrentPosition(
    (position: GeolocationPosition): void => {
      if (hasStoredCity.value) return
      const locatedCity = findNearestCity(position.coords.longitude, position.coords.latitude)
      if (!locatedCity) return

      selectedCity.value = locatedCity
      persistSelectedCity(locatedCity)
      void refreshVisibleData()
    },
    (): void => {
      selectedCity.value = { ...BOSS_DEFAULT_CITY }
    },
    {
      enableHighAccuracy: false,
      maximumAge: 30 * 60 * 1000,
      timeout: 5000
    }
  )
}

function applyBossCityData(cityResponse?: BossCityResponse | null, groupResponse?: BossCityGroupResponse | null): void {
  const nextHotCities = normalizeCityList(cityResponse?.zpData.hotCityList)
  const nextProvinceCities = normalizeCityList(cityResponse?.zpData.cityList)
  const nextCityGroups = Array.isArray(groupResponse?.zpData.cityGroup)
    ? groupResponse.zpData.cityGroup
        .map((group: BossCityGroup): BossCityGroup => ({
          firstChar: group.firstChar,
          cityList: normalizeCityList(group.cityList)
        }))
        .filter((group: BossCityGroup): boolean => Boolean(group.firstChar && group.cityList.length))
    : []

  if (nextHotCities.length) hotCities.value = nextHotCities
  if (nextProvinceCities.length) provinceCities.value = nextProvinceCities
  if (nextCityGroups.length) cityGroups.value = nextCityGroups
  if (!isCityModalOpen.value || !selectedProvinceCode.value) {
    syncProvincePickerWithCity(selectedCity.value)
  }
}

function applyBossMetaData(positionResponse?: BossOptionResponse | null, industryResponse?: BossOptionResponse | null): void {
  const nextPositions = normalizeOptionList(positionResponse?.zpData)
  const nextIndustries = normalizeOptionList(industryResponse?.zpData)

  if (nextPositions.length) positionGroups.value = nextPositions
  if (nextIndustries.length) industryGroups.value = nextIndustries
}

async function fetchBossCities(force: boolean = false): Promise<void> {
  if (!force && cityGroups.value.length > 3 && hotCities.value.length > 15 && provinceCities.value.length) return

  cityLoading.value = true
  cityError.value = ''

  try {
    if (isProd) {
      const cache: BossCityCache = await fetchBossCityCache()
      applyBossCityData(cache.hotCities?.data || null, cache.cityGroups?.data || null)
    } else {
      const [cityResponse, groupResponse]: [BossCityResponse, BossCityGroupResponse] = await fetchBossCityEndpoints()
      applyBossCityData(cityResponse, groupResponse)
    }
  } catch (error: unknown) {
    cityError.value = error instanceof Error ? error.message : '城市接口加载失败'
  } finally {
    cityLoading.value = false
  }
}

async function fetchBossMeta(force: boolean = false): Promise<void> {
  if (!force && positionGroups.value.length && industryGroups.value.length) return

  metaLoading.value = true
  metaError.value = ''

  try {
    if (isProd) {
      const cache: BossCityCache = await fetchBossCityCache()
      applyBossMetaData(cache.positions?.data || null, cache.industries?.data || null)
    } else {
      const [positionResponse, industryResponse]: [BossOptionResponse, BossOptionResponse] = await fetchBossMetaEndpoints()
      applyBossMetaData(positionResponse, industryResponse)
    }

    if (!positionGroups.value.length) {
      metaError.value = 'BOSS 职位分类接口暂无数据'
    }
  } catch (error: unknown) {
    metaError.value = error instanceof Error ? error.message : '职位分类接口加载失败'
  } finally {
    metaLoading.value = false
  }
}

function visibleGroupCities(group: BossCityGroup): BossCity[] {
  if (citySearchKeyword.value || expandedCityGroups.value.has(group.firstChar)) return group.cityList
  return group.cityList.slice(0, CITY_GROUP_COLLAPSE_COUNT)
}

function expandCityGroup(firstChar: string): void {
  expandedCityGroups.value = new Set([...expandedCityGroups.value, firstChar])
}

function scrollCityLetter(firstChar: string): void {
  document.getElementById(`city-letter-${firstChar}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

function buildCitySearchUrl(city: BossCity): string {
  return buildBossCityJobsUrl(city.code)
}

function buildOfficialHomeUrl(): string {
  return buildBossOfficialHomeUrl(selectedCity.value.code)
}

function buildOfficialMapUrl(): string {
  return buildBossMapUrl({
    cityCode: selectedCity.value.code,
    query: searchKeyword.value
  })
}

function isSelectedCity(city: BossCity | CityLink): boolean {
  return Number(city.code) === Number(selectedCity.value.code)
}

function selectCity(city: BossCity | CityLink): void {
  const knownCity = findKnownCity(city.code)
  selectedCity.value = {
    ...(knownCity || city),
    name: city.name.replace(/招聘$/, '')
  }
  persistSelectedCity(selectedCity.value)
  selectedPosition.value = null
  selectedIndustry.value = null
  livePositionCards.value = []
  jobListError.value = ''
  searchKeyword.value = ''
  syncProvincePickerWithCity(selectedCity.value)
  closeCityModal()
  void refreshCityLinkedData()
}

async function refreshCityLinkedData(): Promise<void> {
  await Promise.all([
    fetchBossCities(true),
    fetchBossMeta(true)
  ])
  await refreshVisibleData()
}

function openMapPage(): void {
  void router.push({
    path: '/boss-zhipin-hangzhou-map',
    query: {
      city: String(selectedCity.value.code),
      cityName: selectedCity.value.name,
      query: searchKeyword.value
    }
  })
}

function buildSearchUrl(keyword: string): string {
  return buildBossSearchUrl(selectedCity.value.code, keyword)
}

function buildPositionUrl(position: BossOptionNode): string {
  return buildBossPositionUrl(selectedCity.value.code, position.code)
}

function buildPositionListUrl(): string {
  if (selectedPosition.value) return buildPositionUrl(selectedPosition.value)
  if (selectedPositionGroup.value) return buildBossPositionUrl(selectedCity.value.code, selectedPositionGroup.value.code)
  return buildBossCityJobsUrl(selectedCity.value.code)
}

function buildCompanyListUrl(): string {
  if (!selectedIndustry.value) return buildBossCompanyListUrl(selectedCity.value.code)
  const params = new URLSearchParams({ industry: String(selectedIndustry.value.code) })
  return `${buildBossCompanyListUrl(selectedCity.value.code)}?${params.toString()}`
}

function openSearch(keyword: string): void {
  openExternal(buildSearchUrl(keyword))
}

function activePositionCode(): number | undefined {
  if (selectedPosition.value) return selectedPosition.value.code
  if (selectedPositionGroup.value) return selectedPositionGroup.value.code
  return undefined
}

function activeJobQuery(): string {
  if (selectedPosition.value) return selectedPosition.value.name
  if (searchKeyword.value) return searchKeyword.value
  if (selectedPositionGroup.value) return selectedPositionGroup.value.name
  return ''
}

function listingModeSortType(): string | undefined {
  if (selectedListingMode.value === 'latest') return '1'
  if (selectedListingMode.value === 'related') return '2'
  return undefined
}

function buildJobListRequestLabel(): string {
  const parts = [`城市 ${selectedCity.value.name}`]
  const positionCode = activePositionCode()
  if (positionCode) parts.push(`职位 p${positionCode}`)
  if (selectedIndustry.value) parts.push(`行业 ${selectedIndustry.value.code}`)
  if (selectedListingMode.value !== 'featured') parts.push(selectedListingMode.value === 'latest' ? '最新' : '相关')
  return parts.join(' / ')
}

function mapBossJobsToCards(response: BossJobListResponse): PositionCard[] {
  const positionCode = activePositionCode()
  const fallbackName = selectedPosition.value?.name || activeJobQuery() || selectedPositionGroup.value?.name || '职位'
  const fallbackParentName = selectedPosition.value?.parentName || selectedPositionGroup.value?.name || selectedIndustry.value?.name || '实时职位'
  const jobs = response.zpData?.jobList || []

  return jobs
    .filter((job: BossJobListItem): boolean => Boolean(job.encryptJobId || job.jobName))
    .slice(0, 6)
    .map((job: BossJobListItem, index: number): PositionCard => ({
      code: positionCode || index + 1,
      cardKey: job.encryptJobId || `${job.jobName || fallbackName}-${index}`,
      name: job.jobName || fallbackName,
      parentName: fallbackParentName,
      brandName: job.brandName,
      detailUrl: job.encryptJobId
        ? buildBossJobDetailUrl({
            encryptJobId: job.encryptJobId,
            lid: job.lid || response.zpData?.lid,
            securityId: job.securityId
          })
        : undefined,
      tags: [
        fallbackParentName,
        positionCode ? `p${positionCode}` : '实时职位'
      ],
      source: 'job'
    }))
}

async function resolvePositionDetailUrl(position: PositionCard): Promise<string> {
  if (position.detailUrl) return position.detailUrl

  try {
    const response = await fetchBossJobList({
      cityCode: selectedCity.value.code,
      query: position.name,
      positionCode: position.code,
      industryCode: selectedIndustry.value?.code,
      sortType: listingModeSortType()
    })
    const firstJob: BossJobListItem | undefined = response.zpData?.jobList?.find((job: BossJobListItem): boolean => Boolean(job.encryptJobId))

    if (response.code === 0 && firstJob?.encryptJobId) {
      return buildBossJobDetailUrl({
        encryptJobId: firstJob.encryptJobId,
        lid: firstJob.lid || response.zpData?.lid,
        securityId: firstJob.securityId
      })
    }
  } catch (error: unknown) {
    console.warn('BOSS 职位详情接口被拦截，退回职位列表', error)
  }

  return buildPositionUrl(position)
}

async function openPosition(position: PositionCard): Promise<void> {
  const targetWindow = window.open('about:blank', '_blank')
  if (targetWindow) targetWindow.opener = null
  resolvingPositionCode.value = position.code

  try {
    redirectExternalWindow(targetWindow, await resolvePositionDetailUrl(position))
  } finally {
    resolvingPositionCode.value = null
  }
}

function openIndustry(industry: BossOptionNode): void {
  const params = new URLSearchParams({ industry: String(industry.code) })
  openExternal(`${buildBossCompanyListUrl(selectedCity.value.code)}?${params.toString()}`)
}

function selectPosition(position: PositionCard): void {
  selectedPosition.value = position
  selectedJobTypeCode.value = String(positionGroups.value.find((group: BossOptionNode): boolean => group.name === position.parentName)?.code || selectedJobTypeCode.value)
  searchKeyword.value = position.name
  void refreshVisibleData()
}

function isSelectedPosition(position: BossOptionNode): boolean {
  return selectedPosition.value?.code === position.code
}

function selectPositionGroup(group: BossOptionNode): void {
  selectedJobTypeCode.value = String(group.code)
  selectedPosition.value = null
  livePositionCards.value = []
  searchKeyword.value = ''
  void refreshVisibleData()
}

function selectIndustry(industry: IndustryCard): void {
  selectedIndustry.value = industry
  livePositionCards.value = []
  void refreshVisibleData()
}

function selectListingMode(mode: ListingMode): void {
  if (selectedListingMode.value === mode) return
  selectedListingMode.value = mode
  void refreshVisibleData()
}

function handleJobTypeChange(): void {
  selectedPosition.value = null
  livePositionCards.value = []
  searchKeyword.value = ''
  const groupIndex = positionGroups.value.findIndex((group: BossOptionNode): boolean => String(group.code) === selectedJobTypeCode.value)
  if (groupIndex >= 0) categoryPage.value = Math.floor(groupIndex / CATEGORY_PAGE_SIZE)
  void refreshVisibleData()
}

function turnCategoryPage(delta: number): void {
  categoryPage.value = Math.min(Math.max(categoryPage.value + delta, 0), categoryPageCount.value - 1)
  void refreshVisibleData()
}

function topRoles(group: BossOptionNode): PositionCard[] {
  return flattenPositionCards([group]).slice(0, 9)
}

function summarizeCategory(group: BossOptionNode): string {
  return normalizeOptionList(group.subLevelModelList)
    .map((item: BossOptionNode): string => item.name)
    .slice(0, 3)
    .join('、')
}

function submitSearch(): void {
  if (searchKeyword.value) {
    openSearch(searchKeyword.value)
    return
  }

  if (selectedPositionGroup.value) {
    openExternal(buildPositionListUrl())
    return
  }

  openExternal(buildBossCityJobsUrl(selectedCity.value.code))
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function refreshVisibleData(): Promise<void> {
  await fetchBossMeta()

  jobListLoading.value = true
  jobListError.value = ''
  jobListMessage.value = `正在按 ${buildJobListRequestLabel()} 请求 BOSS 职位列表...`

  try {
    const response = await fetchBossJobList({
      cityCode: selectedCity.value.code,
      query: activeJobQuery(),
      positionCode: activePositionCode(),
      industryCode: selectedIndustry.value?.code,
      sortType: listingModeSortType()
    })
    const nextCards = response.code === 0 ? mapBossJobsToCards(response) : []
    livePositionCards.value = nextCards

    if (!nextCards.length && response.message) {
      jobListError.value = `${response.message}，已展示本地职位分类入口。`
    }
  } catch (error: unknown) {
    livePositionCards.value = []
    jobListError.value = error instanceof Error
      ? `${error.message}，已展示本地职位分类入口。`
      : 'BOSS 职位列表请求失败，已展示本地职位分类入口。'
  } finally {
    jobListLoading.value = false
    jobListMessage.value = ''
  }
}

async function initializeBossHome(): Promise<void> {
  await Promise.all([
    fetchBossCities(),
    fetchBossMeta()
  ])
  requestBrowserLocationCity()
  await refreshVisibleData()
}

onMounted((): void => {
  void initializeBossHome()
})
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
