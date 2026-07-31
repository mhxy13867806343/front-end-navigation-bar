export interface MapJob {
  id: string
  title: string
  salary: string
  salaryShort: string
  district: string
  business: string
  distance: string
  experience: string
  education: string
  tags: string[]
  company: string
  address: string
  detailUrl?: string
  x: number
  y: number
}

export const quickFilters: string[] = ['全部', '互联网/AI', '产品', '运营', '设计', '销售']

export const mapJobs: MapJob[] = [
  {
    id: 'java-alibaba-xihu',
    title: 'Java开发工程师',
    salary: '20-35K·14薪',
    salaryShort: '35K',
    district: '西湖区',
    business: '文三路',
    distance: '距你 2.1km',
    experience: '3-5年',
    education: '本科',
    tags: ['互联网/AI', 'Spring Boot', '微服务'],
    company: '阿里巴巴',
    address: '杭州市西湖区文三路969号',
    x: 37,
    y: 42
  },
  {
    id: 'frontend-netease-binjiang',
    title: '前端开发工程师',
    salary: '18-30K',
    salaryShort: '30K',
    district: '滨江区',
    business: '长河',
    distance: '距你 5.4km',
    experience: '3-5年',
    education: '本科',
    tags: ['互联网/AI', 'Vue', 'TypeScript'],
    company: '网易',
    address: '杭州市滨江区网商路599号',
    x: 53,
    y: 64
  },
  {
    id: 'pm-ant-yuhang',
    title: '产品经理',
    salary: '15-28K',
    salaryShort: '28K',
    district: '余杭区',
    business: '未来科技城',
    distance: '距你 9.8km',
    experience: '3-5年',
    education: '本科',
    tags: ['产品', 'B端产品', '支付产品'],
    company: '蚂蚁集团',
    address: '杭州市余杭区文一西路969号',
    x: 29,
    y: 26
  },
  {
    id: 'data-hithink-xiaoshan',
    title: '数据分析师',
    salary: '16-25K',
    salaryShort: '25K',
    district: '萧山区',
    business: '钱江世纪城',
    distance: '距你 7.2km',
    experience: '1-3年',
    education: '本科',
    tags: ['互联网/AI', 'SQL', 'BI'],
    company: '同花顺',
    address: '杭州市萧山区市心北路',
    x: 64,
    y: 58
  },
  {
    id: 'ops-youzan-gongshu',
    title: '国内电商运营',
    salary: '10-18K',
    salaryShort: '18K',
    district: '拱墅区',
    business: '武林广场',
    distance: '距你 1.6km',
    experience: '1-3年',
    education: '大专',
    tags: ['运营', '天猫', '活动运营'],
    company: '有赞',
    address: '杭州市拱墅区湖墅南路',
    x: 48,
    y: 37
  },
  {
    id: 'sales-cloud-xihu',
    title: '销售专员',
    salary: '8-15K',
    salaryShort: '15K',
    district: '西湖区',
    business: '黄龙',
    distance: '距你 3.3km',
    experience: '1-3年',
    education: '大专',
    tags: ['销售', '客户开发', 'SaaS'],
    company: '云账户',
    address: '杭州市西湖区黄龙时代广场',
    x: 42,
    y: 48
  },
  {
    id: 'designer-binjiang',
    title: 'UI设计师',
    salary: '12-20K',
    salaryShort: '20K',
    district: '滨江区',
    business: '西兴',
    distance: '距你 6.1km',
    experience: '3-5年',
    education: '本科',
    tags: ['设计', 'Figma', '交互'],
    company: '丁香园',
    address: '杭州市滨江区阡陌路',
    x: 57,
    y: 70
  }
]
