import type { Component } from 'vue'
import type { ToolItem, WorkItem } from './navigation'

export type Nullable<T> = T | null
export type SubTabMap = Record<number, string>

export interface ContextMenuState {
  show: boolean
  x: number
  y: number
  tool: Nullable<ToolItem>
}

export interface GameDialogComponent {
  component: Component | null
}

export interface CityInfo {
  name: string
  adcode: string
  province: string
  city?: string
  district?: string
  letter?: string
}

export type CityLetterMap = Record<string, CityInfo[]>

export interface CascaderNode {
  value: string
  label: string
  children?: CascaderNode[]
}

export interface WeatherIndex {
  level?: string
  brief?: string
  advice?: string
}

export interface CurrentWeather {
  province: string
  city: string
  district: string
  adcode: string
  temp: string | number
  weather: string
  weather_icon: string
  humidity: string
  wind_direction: string
  wind_power: string
  update_time: string
  temp_feels?: string
  visibility?: string
  pressure?: string
  uv_index?: string
  aqi?: string
  aqi_desc?: string
  air_quality?: string
  air_level?: string
  indices: Record<string, WeatherIndex>
}

export interface WeatherForecast {
  date: string
  week?: string
  day?: string
  high?: string | number
  low?: string | number
  temp_high?: string | number
  temp_low?: string | number
  weather?: string
  weather_day?: string
}

export interface HolidayEvent {
  name: string
  type: string
  is_workday?: boolean
  date?: string
  events?: HolidayEvent[]
}

export interface HolidayData {
  date: string
  week: string
  lunar: Record<string, string | number>
  holidays: HolidayEvent[]
  nearby?: {
    next?: HolidayEvent[]
    previous?: HolidayEvent[]
  }
}

export interface ProgrammerHistoryItem {
  year: number
  title: string
  description: string
  category: string
  importance: number
  url: string
}

export interface HotboardItem {
  title: string
  hot_value: string | number
  url: string
  platform?: string
  channel?: string
  rank?: number
  score?: number
}

export interface MovieBoxOfficeItem {
  rank: number
  movie_name: string
  box_office: string
  box_office_rate: string
  show_count_rate: string
  sum_box_office: string
  release_info: string
}

export interface MovieBoxOffice {
  update_time: string
  market: Record<string, string>
  list: MovieBoxOfficeItem[]
}

export interface MovieRatingItem {
  rank: number
  title: string
  score?: number | string
  hot_value?: number | string
  platform?: string
  channel?: string
  url?: string
}

export interface TrackingStep {
  time: string
  status_desc: string
  context?: string
}

export interface TrackingInfo {
  tracking_number: string
  carrier_name: string
  status: string
  status_desc: string
  list: TrackingStep[]
}

export type AppWorkItem = WorkItem & {
  type?: string
}

export interface QqLevelIcons {
  crownNum: number
  moonNum: number
  penguinNum: number
  starNum: number
  sunNum: number
}

export interface QqPrivilegeIcons {
  big_club?: boolean
  super?: boolean
  svip?: boolean
  vip?: boolean
  year?: boolean
  years_vip?: boolean
}

export interface QqUserInfo {
  qq: string
  user_id: string
  uin: string
  nick: string
  nickname: string
  long_nick: string
  longNick: string
  avatar_url: string
  age: number
  sex: string
  qid: string
  qq_level: number | null
  qqLevel: number | null
  level: number | null
  qq_level_icons?: QqLevelIcons
  location?: string
  email?: string
  is_vip?: boolean
  is_years_vip?: boolean
  is_svip?: boolean
  is_big_club?: boolean
  vip_status?: number
  vip_type?: number
  vip_level?: number
  big_club_level?: number
  yellow_diamond_level?: number
  green_diamond_level?: number
  privilege_icons?: QqPrivilegeIcons
  reg_time?: string
  regTime?: number
  last_updated?: string
  code?: string
  message?: string
}

export interface ZhihuDailyStory {
  id: number
  url: string
  hint?: string
  type?: number
  title: string
  images?: string[]
  image?: string
  ga_prefix?: string
  image_hue?: string
}

export interface ZhihuDailyData {
  date: string
  stories: ZhihuDailyStory[]
  top_stories?: ZhihuDailyStory[]
}

export interface ZhihuDailyDetail {
  id?: number
  type?: number
  title?: string
  body?: string
  image?: string
  images?: string[]
  image_source?: string
  share_url?: string
  url?: string
  ga_prefix?: string
  css?: string[]
  js?: string[]
}

export interface ZhihuComment {
  id: string | number
  author: string
  content: string
  avatar?: string
  time?: number
  likes?: number
}

export interface ZhihuCommentsData {
  comments: ZhihuComment[]
}

export interface OneDailyItem {
  title?: string
  subtitle?: string
  content?: string
  cover?: string | null
  make_time?: string
}

export interface BlessingTickerItem {
  label: string
  text: string
}

export interface ZaobaoData {
  date: string
  news: string[]
  weiyu?: string
  image?: string
  audio?: string
  head_image?: string
}
