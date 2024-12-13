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

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElDialog } from 'element-plus'

const showDialog = ref(false)
const hourHandStyle = ref({})
const minuteHandStyle = ref({})
const secondHandStyle = ref({})
const formattedTime = ref('')
const formattedDate = ref('')
let animationFrameId = null
let lastUpdateTime = 0

const updateClock = (timestamp) => {
  // 控制更新频率为每秒一次
  if (timestamp - lastUpdateTime >= 1000 / 60) {
    const now = new Date()
    const seconds = now.getSeconds()
    const minutes = now.getMinutes()
    const hours = now.getHours()
    const milliseconds = now.getMilliseconds()

    // 更流畅的指针动画，考虑毫秒
    const secondsDegrees = ((seconds + milliseconds / 1000) / 60) * 360 + 90
    const minutesDegrees = ((minutes + seconds / 60) / 60) * 360 + 90
    const hoursDegrees = ((hours % 12 + minutes / 60) / 12) * 360 + 90

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
    
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
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

<style scoped>
.clock-wrapper {
  display: inline-block;
}

.clock {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: relative;
  padding: 1px;
  background: #909399;
  cursor: pointer;
  transition: transform 0.2s;
}

.clock:hover {
  transform: scale(1.1);
}

.large-clock {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  position: relative;
  padding: 10px;
  background: #909399;
  margin: 0 auto;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.time-text {
  font-size: 24px;
  color: #303133;
  font-weight: bold;
  text-align: center;
}

.date-text {
  font-size: 18px;
  color: #303133;
  margin-bottom: 10px;
}

.outer-clock-face {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 100%;
  background: #282828;
  overflow: hidden;
}

.outer-clock-face::after {
  transform: rotate(90deg);
}

.outer-clock-face::before,
.outer-clock-face::after,
.marking {
  content: '';
  position: absolute;
  width: 1px;
  height: 100%;
  background: #909399;
  z-index: 0;
  left: 49%;
}

.marking {
  background: #909399;
  width: 1px;
}

.marking.marking-one {
  transform: rotate(30deg);
}
.marking.marking-two {
  transform: rotate(60deg);
}
.marking.marking-three {
  transform: rotate(120deg);
}
.marking.marking-four {
  transform: rotate(150deg);
}

.inner-clock-face {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  background: #282828;
  border-radius: 100%;
  z-index: 1;
}

.hand {
  width: 50%;
  height: 1px;
  background: #909399;
  position: absolute;
  top: 50%;
  right: 50%;
  transform-origin: 100%;
  transform: rotate(90deg);
}

.hour-hand {
  width: 30%;
  z-index: 3;
}

.min-hand {
  width: 40%;
  z-index: 10;
  height: 1px;
}

.second-hand {
  width: 45%;
  height: 1px;
  z-index: 1;
}

:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  text-align: center;
  margin-right: 0;
  padding: 15px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>
