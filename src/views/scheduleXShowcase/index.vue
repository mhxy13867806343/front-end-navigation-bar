<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { storage, STORAGE_KEYS } from '../../utils/storage'

const router = useRouter()

// Schedule-X v4.6 Modern Calendar & Event Scheduler Component
export interface CalendarEvent {
  id: number
  title: string
  category: string
  startTime: string
  endTime: string
  dayIndex: number // 0:周一 ~ 6:周日
  color: string
  location: string
  lunarBadge?: string
}

const currentView = ref<'day' | 'week' | 'month' | 'agenda'>('week')
const isDarkMode = ref<boolean>(true)
const selectedCategory = ref<string>('全部')
const isModalOpen = ref<boolean>(false)
const isEditMode = ref<boolean>(false)
const editingEventId = ref<number | null>(null)

// 默认兜底分类
const DEFAULT_CATEGORIES = ['工作', '会议', '学习', '生活', '娱乐']

// 默认兜底日程
const DEFAULT_EVENTS: CalendarEvent[] = [
  { id: 1, title: 'Schedule-X v4.6 架构评审会议', category: '工作', startTime: '09:00', endTime: '10:30', dayIndex: 0, color: '#38bdf8', location: '线上 Zoom 401', lunarBadge: '宜立券' },
  { id: 2, title: 'HooksVue AI 工具箱需求对齐', category: '会议', startTime: '14:00', endTime: '15:30', dayIndex: 1, color: '#c084fc', location: '创客大厦 B座 808' },
  { id: 3, title: 'Temporal API & Motion 深度研讨', category: '学习', startTime: '11:00', endTime: '12:30', dayIndex: 2, color: '#10b981', location: '图书馆三楼' },
  { id: 4, title: '周末建军节团建聚餐', category: '娱乐', startTime: '18:00', endTime: '21:00', dayIndex: 5, color: '#ec4899', location: '海鲜自助餐厅', lunarBadge: '建军节' },
  { id: 5, title: 'Vue 3.5 响应式引擎精读', category: '学习', startTime: '16:00', endTime: '17:30', dayIndex: 3, color: '#10b981', location: '个人工作台' },
  { id: 6, title: '周五团队 Code Review', category: '工作', startTime: '15:00', endTime: '16:30', dayIndex: 4, color: '#38bdf8', location: '研发二部' }
]

// 从通用缓存模块读取初始化数据
const categories = ref<string[]>(storage.getItem(STORAGE_KEYS.SCHEDULE_X_CATEGORIES, DEFAULT_CATEGORIES))
const events = ref<CalendarEvent[]>(storage.getItem(STORAGE_KEYS.SCHEDULE_X_EVENTS, DEFAULT_EVENTS))

// 自动持久化写入本地缓存
watch(events, (newVal) => {
  storage.setItem(STORAGE_KEYS.SCHEDULE_X_EVENTS, newVal)
}, { deep: true })

watch(categories, (newVal) => {
  storage.setItem(STORAGE_KEYS.SCHEDULE_X_CATEGORIES, newVal)
}, { deep: true })

const customCategoryInput = ref<string>('')
const showCustomCategoryInput = ref<boolean>(false)

const palette = [
  '#38bdf8', '#c084fc', '#10b981', '#f59e0b', '#ec4899',
  '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316',
  '#6366f1', '#a855f7', '#84cc16', '#eab308', '#f43f5e',
  '#0284c7', '#7c3aed', '#059669', '#d97706', '#db2777'
]

const getCategoryColor = (catName: string) => {
  const idx = categories.value.indexOf(catName)
  if (idx !== -1) return palette[idx % palette.length]
  return '#38bdf8'
}

// Form State
const formTitle = ref<string>('')
const formCategory = ref<string>('工作')
const formDayIndex = ref<number>(0)
const formStartTime = ref<string>('10:00')
const formEndTime = ref<string>('11:30')
const formLocation = ref<string>('大会议室 A')

const weekDays = [
  { name: '周一 (7/27)', lunar: '六月十四' },
  { name: '周二 (7/28)', lunar: '六月十五' },
  { name: '周三 (7/29)', lunar: '六月十六' },
  { name: '周四 (7/30)', lunar: '六月十七' },
  { name: '周五 (7/31)', lunar: '六月十八' },
  { name: '周六 (8/01)', lunar: '建军节' },
  { name: '周日 (8/02)', lunar: '六月二十' }
]

const filteredEvents = computed(() => {
  return events.value.filter(item => {
    return selectedCategory.value === '全部' || item.category === selectedCategory.value
  })
})

// 添加自定义分类 (带 20 个数量限制与 5 字符长度校验)
const addCustomCategory = () => {
  const val = customCategoryInput.value.trim()
  if (!val) {
    ElMessage.warning('请输入自定义分类名称！')
    return
  }
  if (val.length > 5) {
    ElMessage.warning('分类名称最多为 5 个字符！')
    return
  }
  if (categories.value.length >= 20) {
    ElMessage.warning('分类上限为 20 个！已无法再添加新分类。')
    return
  }
  if (categories.value.includes(val)) {
    ElMessage.warning('该分类已存在！')
    return
  }

  categories.value.push(val)
  formCategory.value = val
  customCategoryInput.value = ''
  showCustomCategoryInput.value = false
  ElMessage.success(`成功新增自定义分类【${val}】，已同步持久化到本地缓存！`)
}

// 1. 双击空白槽位触发新增
const handleSlotDblClick = (dayIdx: number) => {
  isEditMode.value = false
  editingEventId.value = null
  formTitle.value = ''
  formDayIndex.value = dayIdx
  formStartTime.value = '10:00'
  formEndTime.value = '11:30'
  formLocation.value = '在线会议室'
  isModalOpen.value = true
  ElMessage.info(`💡 已双击【${weekDays[dayIdx].name}】单元格唤起新建日程窗口`)
}

// 2. 单击日程卡片触发编辑/修改
const openEditModal = (ev: CalendarEvent) => {
  isEditMode.value = true
  editingEventId.value = ev.id
  formTitle.value = ev.title
  formCategory.value = ev.category
  formDayIndex.value = ev.dayIndex
  formStartTime.value = ev.startTime
  formEndTime.value = ev.endTime
  formLocation.value = ev.location
  isModalOpen.value = true
}

// 保存日程 (新增 / 修改)
const saveEvent = () => {
  if (!formTitle.value.trim()) {
    ElMessage.warning('请输入日程名称！')
    return
  }

  if (isEditMode.value && editingEventId.value !== null) {
    // 修改逻辑
    const target = events.value.find(x => x.id === editingEventId.value)
    if (target) {
      target.title = formTitle.value
      target.category = formCategory.value
      target.dayIndex = formDayIndex.value
      target.startTime = formStartTime.value
      target.endTime = formEndTime.value
      target.location = formLocation.value
      target.color = getCategoryColor(formCategory.value)
    }
    ElMessage.success('Schedule-X 日程修改已保存并同步缓存！')
  } else {
    // 新增逻辑
    events.value.push({
      id: Date.now(),
      title: formTitle.value,
      category: formCategory.value,
      startTime: formStartTime.value,
      endTime: formEndTime.value,
      dayIndex: formDayIndex.value,
      color: getCategoryColor(formCategory.value),
      location: formLocation.value
    })
    ElMessage.success('Schedule-X 新日程创建成功并同步缓存！')
  }

  isModalOpen.value = false
}

const deleteEvent = (id: number) => {
  events.value = events.value.filter(x => x.id !== id)
  ElMessage.info('已从 Schedule-X 日历中移除该日程并更新缓存。')
}

// 重置缓存为初始状态
const resetStorage = () => {
  storage.removeItem(STORAGE_KEYS.SCHEDULE_X_EVENTS)
  storage.removeItem(STORAGE_KEYS.SCHEDULE_X_CATEGORIES)
  events.value = [...DEFAULT_EVENTS]
  categories.value = [...DEFAULT_CATEGORIES]
  selectedCategory.value = '全部'
  ElMessage.success('已清空本地修改，恢复默认示范日程数据。')
}
</script>

<template>
  <div class="schedulex-showcase-page" :style="{ background: isDarkMode ? '#090d16' : '#f8fafc', color: isDarkMode ? '#f8fafc' : '#0f172a' }" style="min-height: 100vh; padding-bottom: 60px;">
    <!-- Header 头部栏 -->
    <header style="background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 32px 24px 20px;">
      <div style="max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <span style="display: inline-block; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.3); margin-bottom: 8px;">
            📅 Schedule-X v4.6 Engine &amp; LocalStorage
          </span>
          <h1 style="font-size: 1.8rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #38bdf8 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Schedule-X v4.6 现代前端日历调度组件
          </h1>
        </div>
        <div style="display: flex; gap: 10px;">
          <button style="padding: 10px 14px; border-radius: 10px; border: 1px solid #ef4444; background: transparent; color: #ef4444; font-weight: 700; font-size: 0.84rem; cursor: pointer;" @click="resetStorage">
            🔄 重置默认缓存
          </button>
          <button style="padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #e2e8f0; font-weight: 700; font-size: 0.88rem; cursor: pointer;" @click="router.push('/dyform')">
            ← 返回导航站
          </button>
        </div>
      </div>

      <div style="max-width: 1280px; margin: 20px auto 0; display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>💾 本地持久化缓存已开启</strong> 所有新增、编辑与分类自定义均自动保存至 LocalStorage (`HOOKSVUE_SCHEDULE_X_EVENTS_V1`)
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>🏷️ 分类约束规则</strong> 支持自定义分类，上限 20 个，单个分类名称最多 5 个字符
        </div>
      </div>
    </header>

    <!-- Toolbar 视图与分类控制栏 -->
    <div style="max-width: 1280px; margin: 24px auto 16px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <!-- Views Switcher -->
      <div style="display: flex; background: rgba(30,41,59,0.8); padding: 4px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <button v-for="v in ['day', 'week', 'month', 'agenda']" :key="v" style="padding: 6px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; border: none; cursor: pointer; text-transform: capitalize;" :style="{ background: currentView === v ? '#38bdf8' : 'transparent', color: currentView === v ? '#0f172a' : '#94a3b8' }" @click="currentView = v as any">
          {{ v === 'day' ? '日视图' : v === 'week' ? '周视图' : v === 'month' ? '月视图' : '日程清单' }}
        </button>
      </div>

      <!-- Filter Tags & Custom Category Input -->
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; color: #94a3b8;">分类过滤 ({{ categories.length }}/20):</span>
        
        <button style="padding: 4px 10px; border-radius: 14px; font-size: 0.78rem; font-weight: 600; cursor: pointer;" :style="{ background: selectedCategory === '全部' ? '#10b981' : 'rgba(255,255,255,0.06)', color: selectedCategory === '全部' ? '#0f172a' : '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }" @click="selectedCategory = '全部'">
          全部
        </button>

        <button v-for="cat in categories" :key="cat" style="padding: 4px 10px; border-radius: 14px; font-size: 0.78rem; font-weight: 600; cursor: pointer;" :style="{ background: selectedCategory === cat ? getCategoryColor(cat) : 'rgba(255,255,255,0.06)', color: selectedCategory === cat ? '#0f172a' : '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }" @click="selectedCategory = cat">
          {{ cat }}
        </button>

        <!-- 自定义分类添加 -->
        <div v-if="showCustomCategoryInput" style="display: flex; gap: 4px;">
          <input v-model="customCategoryInput" type="text" maxlength="5" placeholder="最多5字" style="width: 80px; padding: 2px 8px; border-radius: 10px; border: 1px solid #38bdf8; background: #0f172a; color: #fff; font-size: 0.76rem;" />
          <button style="padding: 2px 8px; border-radius: 8px; border: none; background: #38bdf8; color: #0f172a; font-size: 0.76rem; font-weight: 800; cursor: pointer;" @click="addCustomCategory">保存</button>
          <button style="padding: 2px 6px; border-radius: 8px; border: none; background: rgba(255,255,255,0.2); color: #fff; font-size: 0.76rem; cursor: pointer;" @click="showCustomCategoryInput = false">✕</button>
        </div>
        <button v-else style="padding: 4px 10px; border-radius: 14px; font-size: 0.78rem; font-weight: 700; border: 1px dashed #38bdf8; background: transparent; color: #38bdf8; cursor: pointer;" @click="showCustomCategoryInput = true">
          ＋ 分类 ({{ categories.length }}/20)
        </button>

        <button style="padding: 8px 16px; border-radius: 10px; border: none; background: #38bdf8; color: #0f172a; font-weight: 800; font-size: 0.84rem; cursor: pointer; margin-left: 12px;" @click="handleSlotDblClick(0)">
          ＋ 新建日程
        </button>
      </div>
    </div>

    <!-- Calendar Stage -->
    <main style="max-width: 1280px; margin: 0 auto; padding: 0 24px;">
      <!-- Week View 周视图 (支持双击空白新增 / 单击卡片修改) -->
      <div v-if="currentView === 'week'" style="background: rgba(30,41,59,0.7); border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); overflow-x: auto;">
        <div style="display: grid; grid-template-columns: repeat(7, minmax(140px, 1fr)); border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(15,23,42,0.8);">
          <div v-for="(day, idx) in weekDays" :key="idx" style="padding: 14px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06);">
            <div style="font-weight: 800; font-size: 0.9rem; color: #fff;">{{ day.name }}</div>
            <div style="font-size: 0.74rem; color: #38bdf8; margin-top: 2px;">{{ day.lunar }}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, minmax(140px, 1fr)); min-height: 520px;">
          <div
            v-for="(day, dayIdx) in weekDays"
            :key="dayIdx"
            style="border-right: 1px solid rgba(255,255,255,0.06); padding: 10px; position: relative; cursor: cell;"
            title="双击空白区域在此日期创建新日程"
            @dblclick.self="handleSlotDblClick(dayIdx)"
          >
            <!-- 双击提示背景标签 -->
            <div style="position: absolute; bottom: 8px; left: 0; right: 0; text-align: center; font-size: 0.7rem; color: rgba(255,255,255,0.25); pointer-events: none;">
              [ 双击此列空白处新增 ]
            </div>

            <!-- 实例日程卡片 (单击修改) -->
            <div
              v-for="ev in filteredEvents.filter(x => x.dayIndex === dayIdx)"
              :key="ev.id"
              :style="{ background: ev.color, color: '#0f172a' }"
              style="padding: 10px; border-radius: 10px; margin-bottom: 10px; font-size: 0.8rem; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.3); position: relative; cursor: pointer; transition: transform 0.15s;"
              title="单击查看详情或编辑修改"
              @click.stop="openEditModal(ev)"
            >
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span>{{ ev.startTime }} - {{ ev.endTime }}</span>
                <button style="border: none; background: transparent; color: #0f172a; font-weight: 900; cursor: pointer; font-size: 0.78rem;" @click.stop="deleteEvent(ev.id)">✕</button>
              </div>
              <div style="margin-top: 4px; font-size: 0.88rem; font-weight: 800;">{{ ev.title }}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span style="font-size: 0.74rem; opacity: 0.85;">📍 {{ ev.location }}</span>
                <span style="background: rgba(0,0,0,0.15); padding: 1px 6px; border-radius: 6px; font-size: 0.7rem;">✏️ 点击修改</span>
              </div>
              <span v-if="ev.lunarBadge" style="display: inline-block; background: rgba(0,0,0,0.2); color: #fff; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-top: 4px;">{{ ev.lunarBadge }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Agenda View 日程清单 (单击支持修改) -->
      <div v-else style="background: rgba(30,41,59,0.7); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);">
        <h3 style="margin: 0 0 16px; font-size: 1.1rem; color: #38bdf8;">📋 Schedule-X 全部日程清单 ({{ filteredEvents.length }} 项)</h3>
        <div v-for="ev in filteredEvents" :key="ev.id" style="display: flex; justify-content: space-between; align-items: center; padding: 14px; background: rgba(15,23,42,0.6); border-radius: 12px; margin-bottom: 10px; border-left: 4px solid; cursor: pointer;" :style="{ borderLeftColor: ev.color }" @click="openEditModal(ev)">
          <div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="font-weight: 800; font-size: 0.94rem; color: #fff;">{{ ev.title }}</span>
              <span :style="{ background: ev.color }" style="color: #0f172a; font-weight: 800; font-size: 0.72rem; padding: 2px 8px; border-radius: 10px;">{{ ev.category }}</span>
            </div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 4px;">
              ⏰ {{ weekDays[ev.dayIndex]?.name }} {{ ev.startTime }} - {{ ev.endTime }} | 📍 {{ ev.location }}
            </div>
          </div>
          <div style="display: flex; gap: 8px;" @click.stop>
            <button style="padding: 6px 12px; border-radius: 8px; border: 1px solid #38bdf8; background: transparent; color: #38bdf8; font-size: 0.78rem; cursor: pointer;" @click="openEditModal(ev)">编辑修改</button>
            <button style="padding: 6px 12px; border-radius: 8px; border: 1px solid #ef4444; background: transparent; color: #ef4444; font-size: 0.78rem; cursor: pointer;" @click="deleteEvent(ev.id)">删除</button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal 新建 / 查看修改日程对话框 -->
    <div v-if="isModalOpen" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 100;">
      <div style="background: #1e293b; border-radius: 20px; padding: 28px; width: 440px; border: 1px solid #38bdf8; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
        <h3 style="margin: 0 0 16px; font-size: 1.1rem; color: #38bdf8;">
          {{ isEditMode ? '✏️ 查看详情与修改 Schedule-X 日程' : '＋ 新建 Schedule-X 日程' }}
        </h3>
        
        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">日程名称</label>
          <input v-model="formTitle" type="text" placeholder="输入日程名称..." style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.86rem;" />
        </div>

        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label style="font-size: 0.8rem; color: #94a3b8;">日程分类 (当前可用 {{ categories.length }}/20)</label>
          </div>
          <select v-model="formCategory" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.86rem;">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
          <div style="flex: 1;">
            <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">星期选择</label>
            <select v-model.number="formDayIndex" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.86rem;">
              <option v-for="(day, idx) in weekDays" :key="idx" :value="idx">{{ day.name }}</option>
            </select>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
          <div style="flex: 1;">
            <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">开始时间</label>
            <input v-model="formStartTime" type="text" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.86rem;" />
          </div>
          <div style="flex: 1;">
            <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">结束时间</label>
            <input v-model="formEndTime" type="text" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.86rem;" />
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">活动地点</label>
          <input v-model="formLocation" type="text" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.86rem;" />
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button style="padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; cursor: pointer;" @click="isModalOpen = false">取消</button>
          <button style="padding: 8px 16px; border-radius: 8px; border: none; background: #38bdf8; color: #0f172a; font-weight: 800; cursor: pointer;" @click="saveEvent">
            {{ isEditMode ? '保存修改' : '确认创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
