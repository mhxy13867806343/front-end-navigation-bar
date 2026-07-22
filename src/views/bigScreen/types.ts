export interface BigScreenMetric {
  id: string
  title: string
  value: number | string
  unit: string
  trend: number
  status: 'up' | 'down' | 'stable'
  summary: string
}

export interface BigScreenTrendPoint {
  label: string
  value: number
}

export interface BigScreenDetailPayload {
  id: string
  title: string
  summary: string
  metrics: BigScreenMetric[]
  timeline: BigScreenTrendPoint[]
  records: Array<Record<string, string | number>>
}

export interface BigScreenRegionItem {
  id: string
  province: string
  activity: number
  warningCount: number
  orderVolume: number
}

export interface BigScreenCityItem {
  id: string
  city: string
  province: string
  activity: number
  warningCount: number
  orderVolume: number
  coord: [number, number]
}

export interface BigScreenAlertItem {
  id: string
  level: 'critical' | 'warning' | 'notice'
  title: string
  region: string
  timestamp: string
  detail: string
}

export interface BigScreenTaskItem {
  id: string
  title: string
  owner: string
  progress: number
  eta: string
}

export interface BigScreenStreamItem {
  id: string
  channel: string
  region: string
  amount: number
  status: '已完成' | '处理中' | '待确认'
  timestamp: string
}

export interface BigScreenOverview {
  title: string
  subtitle: string
  metrics: BigScreenMetric[]
  regionRanking: BigScreenRegionItem[]
  cityFocus: BigScreenCityItem[]
  alerts: BigScreenAlertItem[]
  tasks: BigScreenTaskItem[]
  streams: BigScreenStreamItem[]
  hourlyTrend: BigScreenTrendPoint[]
  weeklyOrders: BigScreenTrendPoint[]
  channelShare: Array<{ name: string; value: number }>
  riskWave: BigScreenTrendPoint[]
  detailMap: Record<string, BigScreenDetailPayload>
}
