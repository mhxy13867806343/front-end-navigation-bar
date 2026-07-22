import type {
  BigScreenAlertItem,
  BigScreenCityItem,
  BigScreenDetailPayload,
  BigScreenMetric,
  BigScreenOverview,
  BigScreenRegionItem,
  BigScreenStreamItem,
  BigScreenTaskItem,
  BigScreenTrendPoint
} from '../types'

const PROVINCES = ['浙江', '广东', '江苏', '上海', '北京', '四川', '湖北', '山东']
const CITIES = [
  { city: '杭州', province: '浙江', coord: [120.1551, 30.2741] as [number, number] },
  { city: '宁波', province: '浙江', coord: [121.5503, 29.8746] as [number, number] },
  { city: '深圳', province: '广东', coord: [114.0579, 22.5431] as [number, number] },
  { city: '广州', province: '广东', coord: [113.2644, 23.1291] as [number, number] },
  { city: '苏州', province: '江苏', coord: [120.5853, 31.2989] as [number, number] },
  { city: '南京', province: '江苏', coord: [118.7969, 32.0603] as [number, number] },
  { city: '成都', province: '四川', coord: [104.0665, 30.5728] as [number, number] },
  { city: '武汉', province: '湖北', coord: [114.3055, 30.5928] as [number, number] }
]
const CHANNELS = ['直营商城', '生态合作', '企业专线', '移动端', 'API 网关']

const buildTrend = (labels: string[], base: number, amplitude: number): BigScreenTrendPoint[] => {
  return labels.map((label: string, index: number): BigScreenTrendPoint => ({
    label,
    value: Math.round(base + Math.sin(index * 0.85) * amplitude + index * 3.2)
  }))
}

const buildMetric = (
  id: string,
  title: string,
  value: number | string,
  unit: string,
  trend: number,
  status: BigScreenMetric['status'],
  summary: string
): BigScreenMetric => ({ id, title, value, unit, trend, status, summary })

const buildDetail = (
  id: string,
  title: string,
  summary: string,
  metrics: BigScreenMetric[],
  timeline: BigScreenTrendPoint[],
  records: Array<Record<string, string | number>>
): BigScreenDetailPayload => ({ id, title, summary, metrics, timeline, records })

export const createBigScreenMockData = (): BigScreenOverview => {
  const hourlyLabels = Array.from({ length: 12 }, (_item, index) => `${index * 2}:00`)
  const weeklyLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

  const metrics: BigScreenMetric[] = [
    buildMetric('metric-gmv', '全域交易额', 128.6, 'M', 12.8, 'up', '较昨日同时段增长 12.8%，API 直连渠道表现最强。'),
    buildMetric('metric-active', '活跃设备', 18246, '台', 6.2, 'up', '边缘设备在线率持续回升，华东区域活跃度最高。'),
    buildMetric('metric-warning', '风险告警', 27, '条', -8.4, 'down', '高等级告警已连续 3 小时下降，夜间巡检效果明显。'),
    buildMetric('metric-ticket', '工单完成率', 94.7, '%', 3.1, 'up', '自动化工单闭环加速，超时任务压降至 5 条以内。')
  ]

  const regionRanking: BigScreenRegionItem[] = PROVINCES.map((province: string, index: number): BigScreenRegionItem => ({
    id: `region-${province}`,
    province,
    activity: 92 - index * 5 + (index % 2 === 0 ? 3 : 0),
    warningCount: Math.max(4, 20 - index * 2),
    orderVolume: 5800 - index * 430
  }))

  const cityFocus: BigScreenCityItem[] = CITIES.map((item, index): BigScreenCityItem => ({
    id: `city-${item.city}`,
    city: item.city,
    province: item.province,
    activity: 96 - index * 4,
    warningCount: Math.max(2, 11 - index),
    orderVolume: 3200 - index * 210,
    coord: item.coord
  }))

  const alerts: BigScreenAlertItem[] = [
    { id: 'alert-1', level: 'critical', title: '核心链路抖动', region: '浙江·杭州', timestamp: '09:12', detail: '支付回调通道出现 2 次瞬时抖动，已自动切换备用链路。' },
    { id: 'alert-2', level: 'warning', title: '库存阈值接近下限', region: '广东·深圳', timestamp: '09:06', detail: '华南云仓 3 个 SKU 库存低于安全阈值，补货任务已派发。' },
    { id: 'alert-3', level: 'notice', title: '巡检任务正常完成', region: '江苏·苏州', timestamp: '08:57', detail: '自动巡检脚本完成 16 项节点检查，未发现异常。' },
    { id: 'alert-4', level: 'warning', title: '边缘节点温度偏高', region: '四川·成都', timestamp: '08:46', detail: '边缘计算节点连续 10 分钟温度高于 72°C，已触发降频。' }
  ]

  const tasks: BigScreenTaskItem[] = [
    { id: 'task-1', title: '双活链路压测复盘', owner: '稳定性平台', progress: 88, eta: '10:40 完成' },
    { id: 'task-2', title: '区域策略灰度放量', owner: '运营分析组', progress: 64, eta: '11:10 完成' },
    { id: 'task-3', title: '告警规则清洗', owner: '值班工程组', progress: 52, eta: '11:45 完成' },
    { id: 'task-4', title: '异常订单补偿校验', owner: '结算中心', progress: 91, eta: '09:55 完成' }
  ]

  const streams: BigScreenStreamItem[] = Array.from({ length: 8 }, (_item, index) => ({
    id: `stream-${index + 1}`,
    channel: CHANNELS[index % CHANNELS.length],
    region: PROVINCES[index % PROVINCES.length],
    amount: 16800 + index * 2350,
    status: index % 3 === 0 ? '处理中' : index % 2 === 0 ? '待确认' : '已完成',
    timestamp: `09:${String(48 - index * 3).padStart(2, '0')}`
  }))

  const hourlyTrend = buildTrend(hourlyLabels, 62, 18)
  const weeklyOrders = buildTrend(weeklyLabels, 88, 16)
  const riskWave = buildTrend(hourlyLabels, 24, 10)
  const channelShare = [
    { name: '直营商城', value: 36 },
    { name: '企业专线', value: 24 },
    { name: '移动端', value: 18 },
    { name: '生态合作', value: 14 },
    { name: 'API 网关', value: 8 }
  ]

  const detailMap: Record<string, BigScreenDetailPayload> = {
    'metric-gmv': buildDetail(
      'metric-gmv',
      '全域交易额明细',
      '交易额由直营商城、企业专线与 API 网关共同贡献，上午时段转化峰值明显。',
      [
        buildMetric('gmv-1', '直营商城', 52.4, 'M', 9.6, 'up', '移动端活动带动成交峰值。'),
        buildMetric('gmv-2', '企业专线', 34.1, 'M', 5.4, 'up', 'B 端续费订单集中释放。'),
        buildMetric('gmv-3', 'API 网关', 18.9, 'M', 14.2, 'up', '开放平台调用量抬升。')
      ],
      weeklyOrders,
      streams.map((item: BigScreenStreamItem) => ({
        渠道: item.channel,
        区域: item.region,
        金额: item.amount,
        状态: item.status
      }))
    ),
    'metric-active': buildDetail(
      'metric-active',
      '活跃设备明细',
      '边缘设备活跃度以华东和华南区域为主，夜间活跃波动较小。',
      [
        buildMetric('active-1', '在线终端', 16428, '台', 4.8, 'up', '核心链路稳定。'),
        buildMetric('active-2', '离线待检', 932, '台', -11.3, 'down', '故障已集中修复。'),
        buildMetric('active-3', '待部署', 886, '台', 6.1, 'up', '新节点批量上线中。')
      ],
      hourlyTrend,
      regionRanking.map((item: BigScreenRegionItem) => ({
        省份: item.province,
        活跃指数: item.activity,
        订单量: item.orderVolume
      }))
    ),
    'panel-region': buildDetail(
      'panel-region',
      '区域态势详情',
      '重点省份在活跃指数、订单量与告警密度之间存在明显差异，可用于区域策略优化。',
      metrics.slice(0, 2),
      weeklyOrders,
      regionRanking.map((item: BigScreenRegionItem) => ({
        省份: item.province,
        活跃指数: item.activity,
        告警数: item.warningCount,
        订单量: item.orderVolume
      }))
    ),
    'panel-city': buildDetail(
      'panel-city',
      '城市态势详情',
      '核心城市承担主要流量承接与风险处置任务，杭州、深圳、苏州处于第一梯队。',
      metrics.slice(0, 3),
      cityFocus.map((item, index) => ({ label: item.city, value: item.activity + index })),
      cityFocus.map((item: BigScreenCityItem) => ({
        城市: item.city,
        省份: item.province,
        活跃指数: item.activity,
        告警数: item.warningCount,
        订单量: item.orderVolume
      }))
    ),
    'panel-trend': buildDetail(
      'panel-trend',
      '24 小时趋势详情',
      '全天交易曲线在 10:00 与 18:00 附近出现双峰，午间回落相对平滑。',
      metrics,
      hourlyTrend,
      hourlyTrend.map((item: BigScreenTrendPoint, index: number) => ({
        时段: item.label,
        交易指数: item.value,
        风险波动: riskWave[index]?.value ?? 0
      }))
    ),
    'panel-channel': buildDetail(
      'panel-channel',
      '渠道构成详情',
      '直营商城与企业专线合计贡献过半，开放平台虽占比低但增速显著。',
      metrics.slice(0, 3),
      channelShare.map((item, index) => ({ label: item.name, value: item.value + index * 2 })),
      channelShare.map(item => ({
        渠道: item.name,
        占比: `${item.value}%`,
        贡献说明: item.value > 20 ? '核心贡献渠道' : '增长型渠道'
      }))
    ),
    'panel-alert': buildDetail(
      'panel-alert',
      '告警中心详情',
      '当前告警以链路抖动和库存阈值预警为主，暂无新增高危未处理阻断类事件。',
      [metrics[2], metrics[3]],
      riskWave,
      alerts.map(item => ({
        级别: item.level,
        标题: item.title,
        区域: item.region,
        时间: item.timestamp
      }))
    ),
    'panel-task': buildDetail(
      'panel-task',
      '任务进度详情',
      '值班任务与运营策略任务同步推进，工单完成率保持在 94% 以上。',
      [metrics[3]],
      tasks.map((item, index) => ({ label: item.title, value: item.progress + index })),
      tasks.map(item => ({
        任务: item.title,
        负责人: item.owner,
        进度: `${item.progress}%`,
        预计完成: item.eta
      }))
    ),
    'panel-stream': buildDetail(
      'panel-stream',
      '实时流水详情',
      '流水记录按渠道持续滚动刷新，支持值班同学快速查看当前重点成交动态。',
      [metrics[0]],
      streams.map((item, index) => ({ label: item.timestamp, value: Math.round(item.amount / 1000) + index })),
      streams.map(item => ({
        渠道: item.channel,
        区域: item.region,
        金额: item.amount,
        状态: item.status,
        时间: item.timestamp
      }))
    )
  }

  return {
    title: 'Nova Grid 智能运营指挥大屏',
    subtitle: '模拟真实业务流、设备运行、风险告警与区域活跃度的可视化驾驶舱',
    metrics,
    regionRanking,
    cityFocus,
    alerts,
    tasks,
    streams,
    hourlyTrend,
    weeklyOrders,
    channelShare,
    riskWave,
    detailMap
  }
}
