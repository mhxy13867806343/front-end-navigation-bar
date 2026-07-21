<template>
  <div class="clock-wrapper">
    <div class="clock" @click="showDialog = true" :title="formattedTime">
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
      width="300px"
      :close-on-click-modal="true"
      :show-close="true"
      center
    >
      <div class="dialog-content">
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
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">

import { ElDialog } from 'element-plus'

const showDialog = ref<boolean>(false)
const hourHandStyle = ref<Record<string, string>>({})
const minuteHandStyle = ref<Record<string, string>>({})
const secondHandStyle = ref<Record<string, string>>({})
const formattedTime = ref<string>('')
const formattedDate = ref<string>('')
let animationFrameId: number | null = null
let lastUpdateTime: number = 0

const updateClock = (timestamp: number): void => {
  // 控制更新频率为每秒一次
  if (timestamp - lastUpdateTime >= 1000 / 60) {
    const now: Date = new Date()
    const seconds: number = now.getSeconds()
    const minutes: number = now.getMinutes()
    const hours: number = now.getHours()
    const milliseconds: number = now.getMilliseconds()

    // 更流畅的指针动画，考虑毫秒
    const secondsDegrees: number = ((seconds + milliseconds / 1000) / 60) * 360 + 90
    const minutesDegrees: number = ((minutes + seconds / 60) / 60) * 360 + 90
    const hoursDegrees: number = ((hours % 12 + minutes / 60) / 12) * 360 + 90

    secondHandStyle.value = {
      transform: `rotate(${secondsDegrees}deg)`,
      transition: 'none' // 移除过渡效果以实现平滑动画
    }
    minuteHandStyle.value = {
      transform: `rotate(${minutesDegrees}deg)`,
      transition: 'none'
    }
    hourHandStyle.value = {
      transform: `rotate(${hoursDegrees}deg)`,
      transition: 'none'
    }

    // 更新时间和日期文本
    formattedTime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    
    const year: number = now.getFullYear()
    const month: string = String(now.getMonth() + 1).padStart(2, '0')
    const day: string = String(now.getDate()).padStart(2, '0')
    formattedDate.value = `${year}-${month}-${day}`

    lastUpdateTime = timestamp
  }

  // 继续动画循环
  animationFrameId = requestAnimationFrame(updateClock)
}

onMounted(() => {
  animationFrameId = requestAnimationFrame(updateClock)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped src="./css/AnalogClock.css"></style>
