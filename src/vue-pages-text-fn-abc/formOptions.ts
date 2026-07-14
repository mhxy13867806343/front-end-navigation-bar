// Centralized Select/Dropdown/Radio Option Lists for all Vue Templates

export interface SelectOption<T = string | number | boolean> {
  label: string
  value: T
}

export interface RadioOption {
  label: string
  text: string
}

export interface FieldConfig {
  label: string
  key: string
  type: 'input' | 'number' | 'checkbox' | 'button-type' | 'options'
}

export interface TypeConfig {
  type: string
  divider: string
  fields: FieldConfig[]
}

// Dynamic Form property configurations mapping
export const COMPONENT_TYPE_FIELDS: TypeConfig[] = [
  {
    type: 'button',
    divider: '按钮属性',
    fields: [
      { label: '按钮文本', key: 'text', type: 'input' },
      { label: '按钮类型', key: 'buttonType', type: 'button-type' }
    ]
  },
  {
    type: 'input',
    divider: '输入属性',
    fields: [
      { label: '占位提示', key: 'placeholder', type: 'input' },
      { label: '默认值', key: 'defaultValue', type: 'input' },
      { label: '最大长度', key: 'maxlength', type: 'number' }
    ]
  },
  {
    type: 'number',
    divider: '数字属性',
    fields: [
      { label: '最小值', key: 'min', type: 'number' },
      { label: '最大值', key: 'max', type: 'number' },
      { label: '步长', key: 'step', type: 'number' }
    ]
  },
  {
    type: 'select',
    divider: '选择属性',
    fields: [
      { label: '选项列表', key: 'options', type: 'options' },
      { label: '允许多选', key: 'multiple', type: 'checkbox' }
    ]
  },
  {
    type: 'radio',
    divider: '单选属性',
    fields: [
      { label: '选项列表', key: 'options', type: 'options' }
    ]
  },
  {
    type: 'checkbox',
    divider: '多选属性',
    fields: [
      { label: '选项列表', key: 'options', type: 'options' },
      { label: '最少选择', key: 'min', type: 'number' },
      { label: '最多选择', key: 'max', type: 'number' }
    ]
  }
]

// Dynamic Form button type options
export const BUTTON_TYPE_OPTIONS: RadioOption[] = [
  { label: '主要按钮', text: '主要' },
  { label: '成功按钮', text: '成功' },
  { label: '警告按钮', text: '警告' },
  { label: '危险按钮', text: '危险' },
  { label: '信息按钮', text: '信息' },
  { label: '自定义', text: '自定义' }
]

// Dynamic Form size options
export const SIZE_OPTIONS: RadioOption[] = [
  { label: 'large', text: '大号' },
  { label: 'default', text: '默认' },
  { label: 'small', text: '小号' }
]

// Dynamic Form border options
export const BORDER_STYLE_OPTIONS: SelectOption[] = [
  { label: '无边框', value: 'none' },
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' }
]

// Dynamic Form animation options
export const ANIMATION_TYPE_OPTIONS: SelectOption[] = [
  { label: '无动画', value: 'none' },
  { label: '淡入淡出', value: 'fade' },
  { label: '滑动', value: 'slide' },
  { label: '缩放', value: 'scale' }
]

// Dynamic Form validation options
export const VALIDATION_TYPE_OPTIONS: SelectOption[] = [
  { label: '无', value: 'none' },
  { label: '邮箱', value: 'email' },
  { label: '手机号', value: 'phone' },
  { label: '身份证', value: 'idcard' },
  { label: '自定义正则', value: 'pattern' }
]

// API Toolbox gender options
export const GENDER_OPTIONS: SelectOption[] = [
  { label: '🙋‍♂️ 男 (Male)', value: 'male' },
  { label: '🙋‍♀️ 女 (Female)', value: 'female' },
  { label: '🌈 其他 (Other)', value: 'other' }
]

// Fruit Catcher speed options
export const FRUIT_SPEED_OPTIONS: SelectOption[] = [
  { label: '自动', value: 'auto' },
  { label: '0.5x', value: '0.5' },
  { label: '1.0x', value: '1.0' },
  { label: '1.5x', value: '1.5' },
  { label: '2.0x', value: '2.0' },
  { label: '2.5x', value: '2.5' },
  { label: '3.0x', value: '3.0' }
]

// Fruit Catcher difficulty options
export const DIFFICULTY_OPTIONS: SelectOption[] = [
  { label: '初级', value: 'beginner' },
  { label: '中级', value: 'intermediate' },
  { label: '高级', value: 'advanced' },
  { label: '专家', value: 'expert' }
]

// App Wallpaper APIs
export const WALLPAPER_API_OPTIONS: SelectOption[] = [
  { label: 'uapis.cn (支持日期自定义)', value: 'uapis' },
  { label: 'bing.img.run (极速重定向)', value: 'imgrun' }
]

// App Wallpaper resolutions
export const RESOLUTION_OPTIONS: SelectOption[] = [
  { label: '4K 超高清 (UHD)', value: '4k' },
  { label: '1080P 全高清 (FHD)', value: '1080' }
]

// App random image category options
export const RANDOM_IMAGE_CATEGORY_OPTIONS: SelectOption[] = [
  { label: '🌅 高清电脑壁纸', value: 'pc_wallpaper' },
  { label: '📱 精美手机壁纸', value: 'mobile_wallpaper' },
  { label: '🌸 风景摄影图', value: 'landscape' },
  { label: '🎨 动漫ACG大图', value: 'anime' },
  { label: '🤖 AI 创意绘画', value: 'ai_drawing' }
]

// Movie ratings channel options
export const MOVIE_CHANNEL_OPTIONS: SelectOption[] = [
  { label: '全网影视', value: 'all' },
  { label: '卫视收视', value: 'tv' },
  { label: '网络平台', value: 'web' },
  { label: '院线新片', value: 'cinema' }
]

// Movie ratings period options
export const MOVIE_PERIOD_OPTIONS: SelectOption[] = [
  { label: '实时榜单', value: 'realtime' },
  { label: '今日排行', value: 'day' },
  { label: '本周排行', value: 'week' },
  { label: '本月排行', value: 'month' }
]
