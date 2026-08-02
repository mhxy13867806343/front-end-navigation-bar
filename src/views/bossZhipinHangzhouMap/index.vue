<template>
  <main class="boss-map-page">
    <header class="map-header">
      <div class="brand-row">
        <button type="button" class="back-button" @click="goHome">← 首页</button>
        <button type="button" class="brand" @click="openOfficialMap">
          <span>B</span>
          <strong>BOSS直聘</strong>
        </button>
        <em>地图找工作 · {{ selectedCityName }}</em>
      </div>
      <form class="map-search" @submit.prevent="submitSearch">
        <label>
          <span>关键词</span>
          <input v-model.trim="keyword" type="search" placeholder="搜索职位、公司" />
        </label>
        <label>
          <span>区域</span>
          <select v-model="selectedDistrict">
            <option value="全部">全部区域</option>
            <option v-for="district in districts" :key="district" :value="district">{{ district }}</option>
          </select>
        </label>
        <button type="submit">搜索</button>
        <button type="button" class="official-button" @click="openOfficialMap">打开官方地图</button>
      </form>
    </header>

    <section class="map-workspace" :aria-label="`BOSS直聘${selectedCityName}地图职位`">
      <aside class="job-list-panel">
        <div class="list-heading">
          <div>
            <span>{{ filteredJobs.length }} 个职位</span>
            <h1>地图找工作</h1>
          </div>
          <button type="button" @click="clearFilters">清空</button>
        </div>

        <div class="filter-row" aria-label="职位筛选">
          <button
            v-for="filter in quickFilters"
            :key="filter"
            type="button"
            :class="{ active: selectedFilter === filter }"
            @click="selectQuickFilter(filter)"
          >
            {{ filter }}
          </button>
        </div>

        <div class="job-scroll">
          <p v-if="mapError && !mapLoading" class="map-error">{{ mapError }}，已展示{{ selectedCityName }}兜底地图数据。</p>
          <article
            v-for="job in filteredJobs"
            :key="job.id"
            class="map-job-card"
            :class="{ active: selectedJob.id === job.id }"
            tabindex="0"
            @click="selectJob(job)"
            @keyup.enter="selectJob(job)"
          >
            <header>
              <h2>{{ job.title }}</h2>
              <strong>{{ job.salary }}</strong>
            </header>
            <p>{{ job.district }} · {{ job.business }} · {{ job.distance }}</p>
            <div class="job-tags">
              <span>{{ job.experience }}</span>
              <span>{{ job.education }}</span>
              <span v-for="tag in job.tags" :key="tag">{{ tag }}</span>
            </div>
            <footer>
              <div class="company-mark">{{ job.company.slice(0, 1) }}</div>
              <div>
                <b>{{ job.company }}</b>
                <span>{{ job.address }}</span>
              </div>
              <button type="button" @click.stop="openJob(job)">沟通</button>
            </footer>
          </article>

          <section v-if="mapLoading" class="empty-state">
            <h2>正在请求地图职位</h2>
            <p>{{ requestLabel }}</p>
          </section>

          <section v-else-if="!filteredJobs.length" class="empty-state">
            <h2>没有匹配职位</h2>
            <p>换个关键词或区域继续找，{{ selectedCityName }}机会还挺多的。</p>
          </section>
        </div>
      </aside>

      <section class="map-panel" :aria-label="`${selectedCityName}职位地图`">
        <div class="map-toolbar">
          <div>
            <span>当前选中</span>
            <strong>{{ selectedJob.title }}</strong>
          </div>
          <button type="button" @click="openJob(selectedJob)">查看职位</button>
        </div>

        <div class="hangzhou-map">
          <div class="map-water west-lake">{{ selectedCityName }}核心区</div>
          <div class="map-water qiantang-river">通勤干线</div>
          <div class="road road-east"></div>
          <div class="road road-west"></div>
          <div class="road road-south"></div>
          <div
            v-for="label in mapDistrictLabels"
            :key="label.name"
            class="district-label"
            :style="{ left: `${label.x}%`, top: `${label.y}%` }"
          >
            {{ label.name }}
          </div>
          <button
            v-for="job in filteredJobs"
            :key="`pin-${job.id}`"
            type="button"
            class="map-pin"
            :class="{ active: selectedJob.id === job.id }"
            :style="{ left: `${job.x}%`, top: `${job.y}%` }"
            :title="`${job.title} · ${job.company}`"
            @click="selectJob(job)"
          >
            <span>{{ job.salaryShort }}</span>
          </button>
        </div>

        <article class="selected-card">
          <div>
            <span>{{ selectedJob.district }} · {{ selectedJob.business }}</span>
            <h2>{{ selectedJob.title }}</h2>
            <p>{{ selectedJob.company }} · {{ selectedJob.address }}</p>
          </div>
          <strong>{{ selectedJob.salary }}</strong>
        </article>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BOSS_DEFAULT_CITY,
  buildBossJobDetailUrl,
  buildBossMapUrl
} from '@/constants/bossZhipin'
import {
  fetchBossCityCache,
  fetchBossJobList,
  fetchBossMetaEndpoints
} from '@/services/bossZhipin'
import type {
  BossCity,
  BossCityCache,
  BossJobListItem,
  BossJobListResponse,
  BossOptionNode,
  BossOptionResponse
} from '@/types/bossZhipin'
import { mapJobs, quickFilters, type MapJob } from './mock'

const router = useRouter()
const route = useRoute()
const isProd = import.meta.env.PROD
const keyword = ref<string>(String(route.query.query || ''))
const selectedDistrict = ref<string>('全部')
const selectedFilter = ref<string>('全部')
const mapLoading = ref<boolean>(false)
const mapError = ref<string>('')
const liveMapJobs = ref<MapJob[]>([])
const cityOptions = ref<BossCity[]>([])
const positionOptions = ref<BossOptionNode[]>([])
const industryOptions = ref<BossOptionNode[]>([])
const selectedCityCode = computed<string>(() => String(route.query.city || BOSS_DEFAULT_CITY.code))
const selectedCityName = computed<string>(() => String(route.query.cityName || BOSS_DEFAULT_CITY.name))

const selectedJob = ref<MapJob>(mapJobs[0])
const requestLabel = computed<string>(() => `${selectedCityName.value} / ${keyword.value || '全部职位'} / ${selectedDistrict.value}`)
const currentCity = computed<BossCity | null>(() => {
  return cityOptions.value.find((city: BossCity): boolean => String(city.code) === selectedCityCode.value) || null
})
const cityDistricts = computed<string[]>((): string[] => {
  const districts = currentCity.value?.subLevelModelList
    ?.map((district: BossCity): string => district.name)
    .filter(Boolean) || []
  return districts.length ? districts : Array.from(new Set(mapJobs.map((job: MapJob): string => job.district)))
})
const fallbackJobs = computed<MapJob[]>((): MapJob[] => {
  return mapJobs.map((job: MapJob, index: number): MapJob => {
    const district = cityDistricts.value[index % cityDistricts.value.length] || selectedCityName.value
    return {
      ...job,
      id: `${selectedCityCode.value}-${job.id}`,
      district,
      business: district.replace(/区$|县$|市$/g, '') || job.business,
      company: `${selectedCityName.value}${job.company}`,
      address: `${selectedCityName.value}${district}${job.business}`,
      x: clampPercent(job.x + ((index % 3) - 1) * 3),
      y: clampPercent(job.y + ((index % 2) - 0.5) * 4)
    }
  })
})
const currentJobs = computed<MapJob[]>((): MapJob[] => liveMapJobs.value.length ? liveMapJobs.value : fallbackJobs.value)
const districts = computed<string[]>((): string[] => Array.from(new Set(currentJobs.value.map((job: MapJob): string => job.district))))
const mapDistrictLabels = computed<Array<{ name: string; x: number; y: number }>>((): Array<{ name: string; x: number; y: number }> => {
  const positions = [
    { x: 30, y: 34 },
    { x: 56, y: 28 },
    { x: 43, y: 54 },
    { x: 66, y: 58 },
    { x: 24, y: 70 }
  ]
  return districts.value.slice(0, 5).map((name: string, index: number) => ({
    name,
    ...positions[index]
  }))
})

const filteredJobs = computed<MapJob[]>((): MapJob[] => {
  const query = keyword.value.toLowerCase()
  return currentJobs.value.filter((job: MapJob): boolean => {
    const matchesDistrict = selectedDistrict.value === '全部' || job.district === selectedDistrict.value
    const matchesFilter = selectedFilter.value === '全部' || job.tags.includes(selectedFilter.value)
    const searchable = `${job.title} ${job.company} ${job.district} ${job.business} ${job.tags.join(' ')}`.toLowerCase()
    const matchesKeyword = !query || searchable.includes(query)
    return matchesDistrict && matchesFilter && matchesKeyword
  })
})

function selectJob(job: MapJob): void {
  selectedJob.value = job
}

function selectQuickFilter(filter: string): void {
  selectedFilter.value = filter
  const firstMatch = filteredJobs.value[0]
  if (firstMatch) {
    selectedJob.value = firstMatch
  }
  void fetchMapJobs()
}

function clearFilters(): void {
  keyword.value = ''
  selectedDistrict.value = '全部'
  selectedFilter.value = '全部'
  selectedJob.value = currentJobs.value[0] || fallbackJobs.value[0]
  void fetchMapJobs()
}

function submitSearch(): void {
  void fetchMapJobs()
}

function buildOfficialJobUrl(job: MapJob): string {
  if (job.detailUrl) return job.detailUrl
  return buildBossMapUrl({
    cityCode: selectedCityCode.value,
    query: job.title,
    from: '1'
  })
}

function openJob(job: MapJob): void {
  window.open(buildOfficialJobUrl(job), '_blank', 'noopener,noreferrer')
}

function openOfficialMap(): void {
  window.open(buildBossMapUrl({
    cityCode: selectedCityCode.value,
    query: keyword.value
  }), '_blank', 'noopener,noreferrer')
}

function goHome(): void {
  void router.push('/boss-zhipin-hangzhou')
}

function clampPercent(value: number): number {
  return Math.min(Math.max(value, 10), 90)
}

function normalizeCityList(value: BossCity[] | null | undefined): BossCity[] {
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

function flattenOptions(options: BossOptionNode[], parentName = ''): Array<BossOptionNode & { parentName: string }> {
  return options.flatMap((option: BossOptionNode): Array<BossOptionNode & { parentName: string }> => {
    const children = normalizeOptionList(option.subLevelModelList)
    const current = { ...option, parentName }
    return children.length ? [current, ...flattenOptions(children, option.name)] : [current]
  })
}

function findOptionByName(options: BossOptionNode[], name: string): BossOptionNode | null {
  if (!name || name === '全部') return null
  const flattened = flattenOptions(options)
  return flattened.find((option): boolean => option.name === name)
    || flattened.find((option): boolean => option.name.includes(name) || name.includes(option.name))
    || null
}

function selectedPositionCode(): number | undefined {
  const filterPosition = findOptionByName(positionOptions.value, selectedFilter.value)
  if (filterPosition) return filterPosition.code

  const keywordPosition = findOptionByName(positionOptions.value, keyword.value)
  return keywordPosition?.code
}

function selectedIndustryCode(): number | undefined {
  const filterIndustry = findOptionByName(industryOptions.value, selectedFilter.value)
  return filterIndustry?.code
}

function flattenCityOptions(cache: BossCityCache): BossCity[] {
  const hotCities = normalizeCityList(cache.hotCities?.data?.zpData.hotCityList)
  const provinceCities = normalizeCityList(cache.hotCities?.data?.zpData.cityList)
  const alphabetCities = (cache.cityGroups?.data?.zpData.cityGroup || []).flatMap((group): BossCity[] => normalizeCityList(group.cityList))
  const cities = [
    { ...BOSS_DEFAULT_CITY },
    ...hotCities,
    ...provinceCities,
    ...provinceCities.flatMap((province: BossCity): BossCity[] => normalizeCityList(province.subLevelModelList)),
    ...alphabetCities
  ]
  const seenCodes = new Set<number>()
  return cities.filter((city: BossCity): boolean => {
    if (seenCodes.has(city.code)) return false
    seenCodes.add(city.code)
    return true
  })
}

function salaryShort(salary: string): string {
  const matched = salary.match(/\d+(?:-\d+)?K/i)
  return matched?.[0] || salary || '职位'
}

function mapJobListItem(job: BossJobListItem, index: number, response: BossJobListResponse): MapJob {
  const district = job.areaDistrict || cityDistricts.value[index % cityDistricts.value.length] || selectedCityName.value
  const business = job.businessDistrict || district.replace(/区$|县$|市$/g, '') || '热门商圈'
  const salary = job.salaryDesc || '面议'
  const tags = Array.from(new Set([
    selectedFilter.value === '全部' ? '' : selectedFilter.value,
    ...(job.skills && job.skills.length ? job.skills : ['推荐'])
  ].filter(Boolean))).slice(0, 3)

  return {
    id: job.encryptJobId || `${selectedCityCode.value}-live-${index}`,
    title: job.jobName || keyword.value || '热门职位',
    salary,
    salaryShort: salaryShort(salary),
    district,
    business,
    distance: '地图职位',
    experience: job.jobExperience || '经验不限',
    education: job.jobDegree || '学历不限',
    tags,
    company: job.brandName || `${selectedCityName.value}企业`,
    address: job.address || `${selectedCityName.value}${district}${business}`,
    detailUrl: job.encryptJobId
      ? buildBossJobDetailUrl({
          encryptJobId: job.encryptJobId,
          lid: job.lid || response.zpData?.lid,
          securityId: job.securityId,
          ka: 'map_job_card'
        })
      : undefined,
    x: clampPercent(26 + (index % 4) * 16 + Math.floor(index / 4) * 4),
    y: clampPercent(28 + (index % 3) * 18)
  }
}

async function fetchCityCache(): Promise<void> {
  try {
    const cache = await fetchBossCityCache()
    cityOptions.value = flattenCityOptions(cache)
    positionOptions.value = normalizeOptionList(cache.positions?.data?.zpData)
    industryOptions.value = normalizeOptionList(cache.industries?.data?.zpData)
  } catch {
    cityOptions.value = [{ ...BOSS_DEFAULT_CITY }]
  }
}

async function fetchMapMeta(): Promise<void> {
  if (positionOptions.value.length || industryOptions.value.length) return

  try {
    if (isProd) {
      const cache = await fetchBossCityCache()
      positionOptions.value = normalizeOptionList(cache.positions?.data?.zpData)
      industryOptions.value = normalizeOptionList(cache.industries?.data?.zpData)
      return
    }

    const [positionResponse, industryResponse]: [BossOptionResponse, BossOptionResponse] = await fetchBossMetaEndpoints()
    positionOptions.value = normalizeOptionList(positionResponse.zpData)
    industryOptions.value = normalizeOptionList(industryResponse.zpData)
  } catch {
    positionOptions.value = []
    industryOptions.value = []
  }
}

async function fetchMapJobs(): Promise<void> {
  mapLoading.value = true
  mapError.value = ''
  const positionCode = selectedPositionCode()
  const industryCode = positionCode ? undefined : selectedIndustryCode()

  try {
    const response = await fetchBossJobList({
      cityCode: selectedCityCode.value,
      query: keyword.value || (selectedFilter.value === '全部' ? '' : selectedFilter.value),
      positionCode,
      industryCode,
      page: 1,
      pageSize: 20
    })
    liveMapJobs.value = response.code === 0
      ? (response.zpData?.jobList || []).map((job: BossJobListItem, index: number): MapJob => mapJobListItem(job, index, response))
      : []
    mapError.value = response.code === 0 ? '' : response.message
  } catch (error: unknown) {
    liveMapJobs.value = []
    mapError.value = error instanceof Error ? error.message : '地图职位请求失败'
  } finally {
    mapLoading.value = false
    selectedJob.value = filteredJobs.value[0] || currentJobs.value[0] || fallbackJobs.value[0]
  }
}

watch(
  () => [selectedCityCode.value, selectedCityName.value],
  (): void => {
    selectedDistrict.value = '全部'
    liveMapJobs.value = []
    keyword.value = String(route.query.query || keyword.value || '')
    void fetchMapJobs()
  }
)

onMounted(async (): Promise<void> => {
  await fetchCityCache()
  await fetchMapMeta()
  await fetchMapJobs()
})
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
