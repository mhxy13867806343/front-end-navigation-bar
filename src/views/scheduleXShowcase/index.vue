<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// Schedule-X v4.6 Modern Calendar & Event Scheduler Component
export interface CalendarEvent {
  id: number
  title: string
  category: '工作' | '会议' | '学习' | '生活' | '娱乐'
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
const isAddEventOpen = ref<boolean>(false)

// New Event Form State
const newTitle = ref<string>('')
const newCategory = ref<'工作' | '会议' | '学习' | '生活' | '娱乐'>('工作')
const newDayIndex = ref<number>(0)
const newStartTime = ref<string>('10:00')
const newEndTime = ref<string>('11:30')
const newLocation = ref<string>('大会议室 A')

const categoryColors: Record<string, string> = {
  '工作': '#38bdf8',
  '会议': '#c084fc',
  '学习': '#10b981',
  '生活': '#f59e0b',
  '娱乐': '#ec4899'
}

const weekDays = [
  { name: '周一 (7/27)', lunar: '六月十四' },
  { name: '周二 (7/28)', lunar: '六月十五' },
  { name: '周三 (7/29)', lunar: '六月十六' },
  { name: '周四 (7/30)', lunar: '六月十七' },
  { name: '周五 (7/31)', lunar: '六月十八' },
  { name: '周六 (8/01)', lunar: '建军节' },
  { name: '周日 (8/02)', lunar: '六月二十' }
]

const events = ref<CalendarEvent[]>([
  { id: 1, title: 'Schedule-X v4.6 架构评审会议', category: '工作', startTime: '09:00', endTime: '10:30', dayIndex: 0, color: '#38bdf8', location: '线上 Zoom 401', lunarBadge: '宜立券' },
  { id: 2, title: 'HooksVue AI 工具箱需求对齐', category: '会议', startTime: '14:00', endTime: '15:30', dayIndex: 1, color: '#c084fc', location: '创客大厦 B座 808' },
  { id: 3, title: 'Temporal API & Motion 深度研讨', category: '学习', startTime: '11:00', endTime: '12:30', dayIndex: 2, color: '#10b981', location: '图书馆三楼' },
  { id: 4, title: '周末建军节团建聚餐', category: '娱乐', startTime: '18:00', endTime: '21:00', dayIndex: 5, color: '#ec4899', location: '海鲜自助餐厅', lunarBadge: '建军节' },
  { id: 5, title: 'Vue 3.5 响应式引擎精读', category: '学习', startTime: '16:00', endTime: '17:30', dayIndex: 3, color: '#10b981', location: '个人工作台' },
  { id: 6, title: '周五团队 Code Review', category: '工作', startTime: '15:00', endTime: '16:30', dayIndex: 4, color: '#38bdf8', location: '研发二部' }
])

const filteredEvents = computed(() => {
  return events.value.filter(item => {
    return selectedCategory.value === '全部' || item.category === selectedCategory.value
  })
})

const addEvent = () => {
  if (!newTitle.value.trim()) {
    ElMessage.warning('请输入日程名称！')
    return
  }
  events.value.push({
    id: Date.now(),
    title: newTitle.value,
    category: newCategory.value,
    startTime: newStartTime.value,
    endTime: newEndTime.value,
    dayIndex: newDayIndex.value,
    color: categoryColors[newCategory.value] || '#38bdf8',
    location: newLocation.value
  })
  isAddEventOpen.value = false
  newTitle.value = ''
  ElMessage.success('Schedule-X 日程创建成功！')
}

const deleteEvent = (id: number) => {
  events.value = events.value.filter(x => x.id !== id)
  ElMessage.info('已从 Schedule-X 日历中移除该日程。')
}
</script>

<template>
  <div class="schedulex-showcase-page" :style="{ background: isDarkMode ? '#090d16' : '#f8fafc', color: isDarkMode ? '#f8fafc' : '#0f172a' }" style="min-height: 100vh; padding-bottom: 60px;">
    <!-- Header 头部栏 -->
    <header style="background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 32px 24px 20px;">
      <div style="max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <span style="display: inline-block; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.3); margin-bottom: 8px;">
            📅 Schedule-X v4.6 Engine
          </span>
          <h1 style="font-size: 1.8rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #38bdf8 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Schedule-X v4.6 现代前端日历调度组件
          </h1>
        </div>
        <button style="padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #e2e8f0; font-weight: 700; font-size: 0.88rem; cursor: pointer;" @click="router.push('/dyform')">
          ← 返回导航站
        </button>
      </div>

      <div style="max-width: 1280px; margin: 20px auto 0; display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>Temporal API 引擎</strong> 高性能多视图（日/周/月/日程清单）
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>中国农历与节气</strong> 暗黑高斯模糊与分类标签
        </div>
      </div>
    </header>

    <!-- Toolbar 视图与控制栏 -->
    <div style="max-width: 1280px; margin: 24px auto 16px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <!-- Views Switcher -->
      <div style="display: flex; background: rgba(30,41,59,0.8); padding: 4px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <button v-for="v in ['day', 'week', 'month', 'agenda']" :key="v" style="padding: 6px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; border: none; cursor: pointer; text-transform: capitalize;" :style="{ background: currentView === v ? '#38bdf8' : 'transparent', color: currentView === v ? '#0f172a' : '#94a3b8' }" @click="currentView = v as any">
          {{ v === 'day' ? '日视图' : v === 'week' ? '周视图' : v === 'month' ? '月视图' : '日程清单' }}
        </button>
      </div>

      <!-- Filter Tags & Add Event -->
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; color: #94a3b8;">分类过滤:</span>
        <button v-for="cat in ['全部', '工作', '会议', '学习', '生活', '娱乐']" :key="cat" style="padding: 4px 10px; border-radius: 14px; font-size: 0.78rem; font-weight: 600; cursor: pointer;" :style="{ background: selectedCategory === cat ? '#10b981' : 'rgba(255,255,255,0.06)', color: selectedCategory === cat ? '#0f172a' : '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }" @click="selectedCategory = cat">
          {{ cat }}
        </button>

        <button style="padding: 8px 16px; border-radius: 10px; border: none; background: #38bdf8; color: #0f172a; font-weight: 800; font-size: 0.84rem; cursor: pointer; margin-left: 12px;" @click="isAddEventOpen = true">
          ＋ 新建日程
        </button>
      </div>
    </div>

    <!-- Calendar Stage -->
    <main style="max-width: 1280px; margin: 0 auto; padding: 0 24px;">
      <!-- Week View 周视图 -->
      <div v-if="currentView === 'week'" style="background: rgba(30,41,59,0.7); border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); overflow-x: auto;">
        <div style="display: grid; grid-template-columns: repeat(7, minmax(140px, 1fr)); border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(15,23,42,0.8);">
          <div v-for="(day, idx) in weekDays" :key="idx" style="padding: 14px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06);">
            <div style="font-weight: 800; font-size: 0.9rem; color: #fff;">{{ day.name }}</div>
            <div style="font-size: 0.74rem; color: #38bdf8; margin-top: 2px;">{{ day.lunar }}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, minmax(140px, 1fr)); min-height: 480px;">
          <div v-for="(day, dayIdx) in weekDays" :key="dayIdx" style="border-right: 1px solid rgba(255,255,255,0.06); padding: 10px; position: relative;">
            <div
              v-for="ev in filteredEvents.filter(x => x.dayIndex === dayIdx)"
              :key="ev.id"
              :style="{ background: ev.color, color: '#0f172a' }"
              style="padding: 8px; border-radius: 8px; margin-bottom: 8px; font-size: 0.8rem; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.3); position: relative;"
            >
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span>{{ ev.startTime }} - {{ ev.endTime }}</span>
                <button style="border: none; background: transparent; color: #0f172a; font-weight: 900; cursor: pointer; font-size: 0.78rem;" @click.stop="deleteEvent(ev.id)">✕</button>
              </div>
              <div style="margin-top: 4px; font-size: 0.86rem; font-weight: 800;">{{ ev.title }}</div>
              <div style="font-size: 0.74rem; opacity: 0.8; margin-top: 2px;">📍 {{ ev.location }}</div>
              <span v-if="ev.lunarBadge" style="display: inline-block; background: rgba(0,0,0,0.2); color: #fff; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-top: 4px;">{{ ev.lunarBadge }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Agenda View 日程清单 -->
      <div v-else style="background: rgba(30,41,59,0.7); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);">
        <h3 style="margin: 0 0 16px; font-size: 1.1rem; color: #38bdf8;">📋 Schedule-X 全部日程清单 ({{ filteredEvents.length }} 项)</h3>
        <div v-for="ev in filteredEvents" :key="ev.id" style="display: flex; justify-content: space-between; align-items: center; padding: 14px; background: rgba(15,23,42,0.6); border-radius: 12px; margin-bottom: 10px; border-left: 4px solid;" :style="{ borderLeftColor: ev.color }">
          <div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="font-weight: 800; font-size: 0.94rem; color: #fff;">{{ ev.title }}</span>
              <span :style="{ background: ev.color }" style="color: #0f172a; font-weight: 800; font-size: 0.72rem; padding: 2px 8px; border-radius: 10px;">{{ ev.category }}</span>
            </div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 4px;">
              ⏰ {{ weekDays[ev.dayIndex]?.name }} {{ ev.startTime }} - {{ ev.endTime }} | 📍 {{ ev.location }}
            </div>
          </div>
          <button style="padding: 6px 12px; border-radius: 8px; border: 1px solid #ef4444; background: transparent; color: #ef4444; font-size: 0.78rem; cursor: pointer;" @click="deleteEvent(ev.id)">
            删除日程
          </button>
        </div>
      </div>
    </main>

    <!-- Modal 新建日程对话框 -->
    <div v-if="isAddEventOpen" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 100;">
      <div style="background: #1e293b; border-radius: 20px; padding: 28px; width: 420px; border: 1px solid #38bdf8; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
        <h3 style="margin: 0 0 16px; font-size: 1.1rem; color: #38bdf8;">＋ 新建 Schedule-X 日程</h3>
        
        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">日程名称</label>
          <input v-model="newTitle" type="text" placeholder="输入日程名称..." style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.86rem;" />
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">日程分类</label>
          <select v-model="newCategory" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.86rem;">
            <option value="工作">工作</option>
            <option value="会议">会议</option>
            <option value="学习">学习</option>
            <option value="生活">生活</option>
            <option value="娱乐">娱乐</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 16px;">
          <div style="flex: 1;">
            <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">星期选择</label>
            <select v-model.number="newDayIndex" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.86rem;">
              <option v-for="(day, idx) in weekDays" :key="idx" :value="idx">{{ day.name }}</option>
            </select>
          </div>
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button style="padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; cursor: pointer;" @click="isAddEventOpen = false">取消</button>
          <button style="padding: 8px 16px; border-radius: 8px; border: none; background: #38bdf8; color: #0f172a; font-weight: 800; cursor: pointer;" @click="addEvent">保存日程</button>
        </div>
      </div>
    </div>
  </div>
</template>
