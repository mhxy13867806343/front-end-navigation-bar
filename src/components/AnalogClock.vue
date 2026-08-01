<template>
  <div class="clock-wrapper">
    <div class="clock" @click="openClockDialog" :title="formattedTime">
      <div class="outer-clock-face">
        <div class="marking marking-one"></div>
        <div class="marking marking-two"></div>
        <div class="marking marking-three"></div>
        <div class="marking marking-four"></div>
        <div class="inner-clock-face">
          <div class="hand hour-hand" :style="hourHandStyle"></div>
          <div class="hand min-hand" :style="minuteHandStyle"></div>
          <div class="hand second-hand" :style="secondHandStyle"></div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showDialog"
      title="当前时间"
      width="340px"
      append-to-body
      align-center
      draggable
      :close-on-click-modal="true"
      :show-close="true"
      center
      @closed="hideClockContextMenu"
      @contextmenu.prevent="openClockContextMenu"
    >
      <div class="dialog-content" @contextmenu.prevent="openClockContextMenu">
        <div class="date-text">{{ formattedDate }}</div>
        <div class="large-clock">
          <div class="outer-clock-face">
            <div class="marking marking-one"></div>
            <div class="marking marking-two"></div>
            <div class="marking marking-three"></div>
            <div class="marking marking-four"></div>
            <div class="inner-clock-face">
              <div class="hand hour-hand" :style="hourHandStyle"></div>
              <div class="hand min-hand" :style="minuteHandStyle"></div>
              <div class="hand second-hand" :style="secondHandStyle"></div>
            </div>
          </div>
        </div>
        <div class="time-text">{{ formattedTime }}</div>

        <!-- 真实接口数据/每日问答 卡片 (支持选中文本复制与一键复制) -->
        <div class="time-greeting-card">
          <div class="greeting-header">
            <span class="greeting-tag">{{ dailyQuestion.tag }}</span>
            <div class="greeting-actions">
              <button
                type="button"
                class="action-btn"
                @click="fetchRealDailyData"
                :disabled="isFetchingDaily"
                title="刷新数据"
              >
                {{ isFetchingDaily ? '⏳' : '🔄' }}
              </button>
              <button
                type="button"
                class="action-btn copy-btn"
                @click="copyDailyText"
                title="复制文本内容"
              >
                📋 复制
              </button>
            </div>
          </div>

          <div class="greeting-body-selectable" title="选中文字即可直接复制">
            {{ dailyQuestion.fullText }}
          </div>

          <div class="time-period-row">
            <span class="time-period">{{ timePeriod }}</span>
            <span class="time-message">{{ timeMessage }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <Teleport to="body">
      <div
        v-if="showClockContextMenu"
        class="clock-context-menu"
        :style="clockContextMenuStyle"
        @click.stop
        @contextmenu.prevent
      >
        <button class="clock-context-menu-item" type="button" @click="hideClockDialogFromMenu">
          <span class="menu-icon">🙈</span>
          <span>隐藏弹窗</span>
        </button>
        <button class="clock-context-menu-item" type="button" @click="copyClockTime">
          <span class="menu-icon">📋</span>
          <span>复制时间</span>
        </button>
        <button class="clock-context-menu-item" type="button" @click="copyDailyText">
          <span class="menu-icon">💬</span>
          <span>复制问答语录</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElDialog, ElMessage } from 'element-plus'
import axios from 'axios'

interface DailyQuestionData {
  tag: string
  fullText: string
}

const showDialog = ref<boolean>(false)
const hourHandStyle = ref<Record<string, string>>({})
const minuteHandStyle = ref<Record<string, string>>({})
const secondHandStyle = ref<Record<string, string>>({})
const formattedTime = ref<string>('')
const formattedDate = ref<string>('')
const timePeriod = ref<string>('')
const timeMessage = ref<string>('')
const showClockContextMenu = ref<boolean>(false)
const clockContextMenuStyle = ref<Record<string, string>>({
  left: '0px',
  top: '0px'
})

const isFetchingDaily = ref<boolean>(false)
const dailyQuestion = ref<DailyQuestionData>({
  tag: '❓ 每日问答',
  fullText: '你现在在哪座城市生活，你最喜欢这个城市的什么？ —— 小时候总是习惯性把去市区称作“去上海”。'
})

const fetchRealDailyData = async (): Promise<void> => {
  isFetchingDaily.value = true
  try {
    const res = await axios.get('https://v2.alapi.cn/api/one/question', {
      params: { token: '6g9l63xX7T6GjM2s' }
    })
    if (res.data?.data) {
      const q = res.data.data
      const title: string = q.title || '你现在在哪座城市生活，你最喜欢这个城市的什么？'
      const sub: string = q.subtitle || q.content || '小时候总是习惯性把去市区称作“去上海”。'
      dailyQuestion.value = {
        tag: '❓ 每日问答',
        fullText: `${title} —— ${sub}`
      }
      return
    }
  } catch {
    // Failover to Hitokoto if ALAPI unavailable
  }

  try {
    const hitokotoRes = await axios.get('https://v1.hitokoto.cn/')
    if (hitokotoRes.data?.hitokoto) {
      const h = hitokotoRes.data
      const fromText: string = h.from ? `—— 《${h.from}》` : ''
      dailyQuestion.value = {
        tag: '💬 每日一言',
        fullText: `${h.hitokoto} ${fromText}`.trim()
      }
    }
  } catch {
    // Keep default content
  } finally {
    isFetchingDaily.value = false
  }
}

const copyDailyText = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(dailyQuestion.value.fullText)
    ElMessage.success('已复制每日问答文本到剪贴板！')
  } catch {
    ElMessage.info('文本已允许自由选择，请手动框选复制。')
  } finally {
    hideClockContextMenu()
  }
}

const openClockDialog = (): void => {
  showDialog.value = true
  fetchRealDailyData()
}

let animationFrameId: number | null = null
let lastUpdateTime: number = 0

const getTimeGreeting = (hours: number): { period: string; message: string } => {
  if (hours < 5) {
    return { period: '凌晨', message: '夜很深了，该睡觉啦，明天再继续也来得及。' }
  }

  if (hours < 9) {
    return { period: '早上', message: '早上好，先喝口水，慢慢把今天打开。' }
  }

  if (hours < 12) {
    return { period: '上午', message: '上午好，适合把重要的事情先推进。' }
  }

  if (hours < 14) {
    return { period: '中午', message: '中午好，记得吃饭，也给自己留点休息时间。' }
  }

  if (hours < 18) {
    return { period: '下午', message: '下午好，稳稳继续，别忘了活动一下。' }
  }

  if (hours < 22) {
    return { period: '晚上', message: '晚上好，可以收收心了，早点准备睡觉。' }
  }

  return { period: '深夜', message: '已经很晚了，该睡觉啦，屏幕先放一放。' }
}

const hideClockContextMenu = (): void => {
  showClockContextMenu.value = false
}

const openClockContextMenu = (event: MouseEvent): void => {
  const menuWidth = 176
  const menuHeight = 140
  const left = Math.min(event.clientX, window.innerWidth - menuWidth - 8)
  const top = Math.min(event.clientY, window.innerHeight - menuHeight - 8)

  clockContextMenuStyle.value = {
    left: `${Math.max(8, left)}px`,
    top: `${Math.max(8, top)}px`
  }
  showClockContextMenu.value = true
}

const hideClockDialogFromMenu = (): void => {
  showDialog.value = false
  hideClockContextMenu()
}

const copyClockTime = async (): Promise<void> => {
  const text = `${formattedDate.value} ${formattedTime.value}`.trim()

  try {
    await navigator.clipboard?.writeText(text)
    ElMessage.success('已复制当前时间到剪贴板！')
  } catch {
    // Clipboard access fallback
  } finally {
    hideClockContextMenu()
  }
}

const updateClock = (timestamp: number): void => {
  if (timestamp - lastUpdateTime >= 1000 / 60) {
    const now: Date = new Date()
    const seconds: number = now.getSeconds()
    const minutes: number = now.getMinutes()
    const hours: number = now.getHours()
    const milliseconds: number = now.getMilliseconds()

    const secondsDegrees: number = ((seconds + milliseconds / 1000) / 60) * 360 + 90
    const minutesDegrees: number = ((minutes + seconds / 60) / 60) * 360 + 90
    const hoursDegrees: number = ((hours % 12 + minutes / 60) / 12) * 360 + 90

    secondHandStyle.value = {
      transform: `rotate(${secondsDegrees}deg)`,
      transition: 'none'
    }
    minuteHandStyle.value = {
      transform: `rotate(${minutesDegrees}deg)`,
      transition: 'none'
    }
    hourHandStyle.value = {
      transform: `rotate(${hoursDegrees}deg)`,
      transition: 'none'
    }

    formattedTime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    const greeting = getTimeGreeting(hours)
    timePeriod.value = greeting.period
    timeMessage.value = greeting.message
    
    const year: number = now.getFullYear()
    const month: string = String(now.getMonth() + 1).padStart(2, '0')
    const day: string = String(now.getDate()).padStart(2, '0')
    formattedDate.value = `${year}-${month}-${day}`

    lastUpdateTime = timestamp
  }

  animationFrameId = requestAnimationFrame(updateClock)
}

onMounted(() => {
  animationFrameId = requestAnimationFrame(updateClock)
  window.addEventListener('click', hideClockContextMenu)
  window.addEventListener('resize', hideClockContextMenu)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('click', hideClockContextMenu)
  window.removeEventListener('resize', hideClockContextMenu)
})
</script>

<style scoped lang="scss" src="./css/AnalogClock.scss"></style>
