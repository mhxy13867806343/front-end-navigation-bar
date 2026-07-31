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

<style scoped lang="scss">
@use '@/style/pageMixins.scss' as page;

@include page.form-control-reset;

.boss-map-page {
  min-height: 100vh;
  color: #263238;
  background: #eef4f5;
  @include page.system-font;
}

.map-header {
  display: grid;
  grid-template-columns: minmax(280px, 430px) minmax(520px, 1fr);
  gap: 20px;
  align-items: center;
  padding: 18px 28px;
  border-bottom: 1px solid #dce8e9;
  background: #ffffff;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.back-button {
  height: 34px;
  padding: 0 12px;
  border-radius: 4px;
  color: #5d6b6f;
  background: #f1f5f6;
  font-weight: 800;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #162629;
  background: transparent;
}

.brand span {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 7px;
  color: #ffffff;
  background: #00bebd;
  font-size: 20px;
  font-weight: 900;
}

.brand strong {
  font-size: 21px;
  line-height: 1;
  font-weight: 900;
}

.brand-row em {
  overflow: hidden;
  color: #00a6a7;
  font-style: normal;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-search {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 156px 92px 132px;
  gap: 10px;
}

.map-search label {
  position: relative;
  display: block;
}

.map-search label span {
  position: absolute;
  left: 12px;
  top: 7px;
  color: #89979a;
  font-size: 12px;
  font-weight: 800;
}

.map-search input,
.map-search select {
  width: 100%;
  height: 48px;
  padding: 18px 12px 4px;
  border: 1px solid #d6e3e4;
  border-radius: 4px;
  color: #263238;
  background: #ffffff;
  outline: 0;
}

.map-search input:focus,
.map-search select:focus {
  border-color: #00bebd;
}

.map-search button {
  height: 48px;
  border-radius: 4px;
  color: #ffffff;
  font-weight: 900;
  background: #00bebd;
}

.map-search .official-button {
  color: #00a6a7;
  background: #e8fbfa;
}

.map-workspace {
  display: grid;
  grid-template-columns: 430px minmax(0, 1fr);
  height: calc(100vh - 85px);
  min-height: 680px;
}

.job-list-panel {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  border-right: 1px solid #dce8e9;
  background: #ffffff;
}

.list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 22px 16px;
}

.list-heading span,
.map-toolbar span,
.selected-card span {
  color: #00a6a7;
  font-size: 13px;
  font-weight: 900;
}

.list-heading h1 {
  margin: 5px 0 0;
  color: #1f2d30;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 900;
  letter-spacing: 0;
}

.list-heading button,
.filter-row button {
  border-radius: 4px;
  color: #536266;
  background: #f2f6f7;
  font-weight: 800;
}

.list-heading button {
  height: 34px;
  padding: 0 12px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 22px 16px;
  border-bottom: 1px solid #edf2f3;
}

.filter-row button {
  height: 32px;
  padding: 0 11px;
  font-size: 13px;
}

.filter-row button.active {
  color: #ffffff;
  background: #00bebd;
}

.job-scroll {
  overflow: auto;
  padding: 16px;
}

.map-error {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 4px;
  color: #ff6a3d;
  background: #fff3ee;
  font-size: 13px;
  font-weight: 800;
}

.map-job-card {
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #e1e9ea;
  border-radius: 6px;
  background: #ffffff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.map-job-card:hover,
.map-job-card:focus-visible,
.map-job-card.active {
  border-color: #00bebd;
  box-shadow: 0 12px 28px rgba(0, 143, 145, 0.12);
  outline: 0;
  transform: translateY(-1px);
}

.map-job-card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 9px;
}

.map-job-card h2 {
  margin: 0;
  color: #1f2d30;
  font-size: 18px;
  line-height: 1.3;
  font-weight: 900;
  letter-spacing: 0;
}

.map-job-card header strong,
.selected-card > strong {
  flex: 0 0 auto;
  color: #ff6a3d;
  font-size: 18px;
  font-weight: 900;
}

.map-job-card p {
  margin: 0 0 12px;
  color: #657478;
  font-size: 14px;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 14px;
}

.job-tags span {
  padding: 5px 8px;
  border-radius: 4px;
  color: #59686b;
  background: #f2f6f7;
  font-size: 12px;
}

.map-job-card footer {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 70px;
  align-items: center;
  gap: 10px;
  padding-top: 13px;
  border-top: 1px solid #edf2f3;
}

.company-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 6px;
  color: #ffffff;
  background: #00bebd;
  font-weight: 900;
}

.map-job-card footer b,
.map-job-card footer span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-job-card footer b {
  color: #253236;
  font-size: 14px;
}

.map-job-card footer span {
  color: #879397;
  font-size: 12px;
}

.map-job-card footer button,
.map-toolbar button {
  height: 34px;
  border-radius: 4px;
  color: #ffffff;
  background: #00bebd;
  font-size: 13px;
  font-weight: 900;
}

.empty-state {
  padding: 36px 18px;
  border: 1px dashed #c9d8da;
  border-radius: 6px;
  text-align: center;
}

.empty-state h2 {
  margin: 0 0 8px;
  color: #263238;
}

.empty-state p {
  margin: 0;
  color: #718084;
}

.map-panel {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-width: 0;
  padding: 18px;
  background: #dceff0;
}

.map-toolbar,
.selected-card {
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 18px;
  border: 1px solid rgba(0, 143, 145, 0.18);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 36px rgba(32, 62, 65, 0.12);
}

.map-toolbar strong {
  display: block;
  margin-top: 4px;
  color: #1f2d30;
  font-size: 20px;
  line-height: 1.25;
}

.map-toolbar button {
  width: 96px;
}

.hangzhou-map {
  position: relative;
  min-height: 520px;
  margin: 18px 0;
  overflow: hidden;
  border: 1px solid rgba(0, 143, 145, 0.18);
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.18) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.18) 1px, transparent 1px),
    linear-gradient(140deg, #cbebe9 0%, #edf8ef 48%, #c7e5ef 100%);
  background-size: 44px 44px, 44px 44px, auto;
}

.map-water,
.road,
.district-label,
.map-pin {
  position: absolute;
}

.map-water {
  display: grid;
  place-items: center;
  color: rgba(0, 123, 155, 0.56);
  font-size: 15px;
  font-weight: 900;
  background: rgba(85, 183, 220, 0.3);
}

.west-lake {
  left: 28%;
  top: 39%;
  width: 96px;
  height: 132px;
  border-radius: 48% 52% 42% 58%;
}

.qiantang-river {
  left: 42%;
  top: 58%;
  width: 54%;
  height: 64px;
  transform: rotate(-16deg);
  border-radius: 999px;
}

.road {
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 0 0 1px rgba(0, 143, 145, 0.08);
}

.road-east {
  left: 54%;
  top: 8%;
  width: 20px;
  height: 76%;
  transform: rotate(12deg);
}

.road-west {
  left: 20%;
  top: 12%;
  width: 16px;
  height: 68%;
  transform: rotate(-24deg);
}

.road-south {
  left: 12%;
  top: 62%;
  width: 78%;
  height: 18px;
  transform: rotate(-8deg);
}

.district-label {
  padding: 7px 10px;
  border-radius: 4px;
  color: rgba(38, 50, 56, 0.64);
  background: rgba(255, 255, 255, 0.62);
  font-size: 13px;
  font-weight: 900;
}

.district-label.xihu {
  left: 25%;
  top: 30%;
}

.district-label.yuhang {
  left: 18%;
  top: 15%;
}

.district-label.binjiang {
  left: 48%;
  top: 72%;
}

.district-label.xiaoshan {
  left: 66%;
  top: 50%;
}

.district-label.gongshu {
  left: 48%;
  top: 25%;
}

.map-pin {
  display: grid;
  min-width: 48px;
  height: 30px;
  padding: 0 9px;
  place-items: center;
  transform: translate(-50%, -50%);
  border: 2px solid #ffffff;
  border-radius: 999px;
  color: #ffffff;
  background: #00bebd;
  box-shadow: 0 10px 24px rgba(0, 105, 107, 0.24);
  font-size: 12px;
  font-weight: 900;
}

.map-pin::after {
  position: absolute;
  left: 50%;
  bottom: -7px;
  width: 10px;
  height: 10px;
  content: "";
  transform: translateX(-50%) rotate(45deg);
  border-right: 2px solid #ffffff;
  border-bottom: 2px solid #ffffff;
  background: inherit;
}

.map-pin.active {
  z-index: 4;
  background: #ff6a3d;
  transform: translate(-50%, -50%) scale(1.12);
}

.selected-card h2 {
  margin: 5px 0 6px;
  color: #1f2d30;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 900;
  letter-spacing: 0;
}

.selected-card p {
  margin: 0;
  color: #617074;
}

@media (max-width: 1100px) {
  .map-header,
  .map-workspace {
    grid-template-columns: 1fr;
  }

  .map-workspace {
    height: auto;
  }

  .job-list-panel {
    border-right: 0;
    border-bottom: 1px solid #dce8e9;
  }

  .job-scroll {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    max-height: none;
  }

  .map-job-card {
    margin-bottom: 0;
  }
}

@media (max-width: 760px) {
  .map-header {
    padding: 14px;
  }

  .brand-row {
    flex-wrap: wrap;
  }

  .map-search,
  .job-scroll {
    grid-template-columns: 1fr;
  }

  .map-panel {
    padding: 12px;
  }

  .map-toolbar,
  .selected-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .hangzhou-map {
    min-height: 430px;
  }
}
</style>
