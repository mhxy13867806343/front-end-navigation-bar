export interface BossCity {
  code: number
  name: string
  subLevelModelList?: BossCity[] | null
  firstChar?: string | null
  cityCode?: string
  regionCode?: number
  centerGeo?: string | null
}

export interface BossCityGroup {
  firstChar: string
  cityList: BossCity[]
}

export interface BossCityResponse {
  code: number
  message: string
  zpData: {
    hotCityList?: BossCity[]
    cityList?: BossCity[]
    locationCity?: BossCity
  }
}

export interface BossCityGroupResponse {
  code: number
  message: string
  zpData: {
    cityGroup?: BossCityGroup[]
  }
}

export interface BossOptionNode {
  code: number
  name: string
  subLevelModelList?: BossOptionNode[] | null
}

export interface BossOptionResponse {
  code: number
  message: string
  zpData: BossOptionNode[]
}

export interface BossJobListItem {
  encryptJobId?: string
  securityId?: string
  lid?: string
  jobName?: string
  brandName?: string
  salaryDesc?: string
  jobExperience?: string
  jobDegree?: string
  skills?: string[]
  areaDistrict?: string
  businessDistrict?: string
  address?: string
}

export interface BossJobListResponse {
  code: number
  message: string
  zpData?: {
    jobList?: BossJobListItem[]
    lid?: string
  }
}

export interface BossCacheEntry<TData> {
  updatedAt: string
  ok: boolean
  data: TData | null
  error?: string
}

export interface BossCityCache {
  generatedAt?: string
  hotCities?: BossCacheEntry<BossCityResponse>
  cityGroups?: BossCacheEntry<BossCityGroupResponse>
  positions?: BossCacheEntry<BossOptionResponse>
  industries?: BossCacheEntry<BossOptionResponse>
}
