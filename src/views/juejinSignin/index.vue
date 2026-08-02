<template>
  <main class="juejin-signin-page">
    <section class="signin-panel">
      <header class="signin-header">
        <h1>每日签到</h1>
        <button type="button" class="rules-button" @click="openSigninPage">
          <span class="question-icon">?</span>
          <span>签到规则</span>
        </button>
      </header>

      <div class="signin-body">
        <section class="calendar-section" aria-label="每日签到日历">
          <div class="calendar-title-row">
            <button type="button" class="month-arrow" title="上一月">‹</button>
            <strong>{{ currentYear }}年 {{ currentMonth }}月</strong>
            <button type="button" class="month-arrow" title="下一月">›</button>
          </div>

          <div class="weekday-row" aria-hidden="true">
            <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
          </div>

          <div class="calendar-grid">
            <span
              v-for="blank in leadingBlankCount"
              :key="`blank-${blank}`"
              class="calendar-cell calendar-blank"
              aria-hidden="true"
            ></span>
            <button
              v-for="day in monthDays"
              :key="day"
              type="button"
              class="calendar-cell"
              :class="{ today: day === currentDay }"
              :aria-label="day === currentDay ? `${day}日，今天` : `${day}日`"
            >
              <span class="day-number">{{ day }}</span>
              <span v-if="day === currentDay" class="today-label">今日</span>
            </button>
          </div>
        </section>

        <aside class="signin-side" aria-label="签到操作">
          <div class="makeup-card-row">
            <span class="makeup-icon">📒</span>
            <span>补签卡：</span>
            <strong>一张</strong>
          </div>

          <button type="button" class="signin-button" @click="openSigninPage">
            <span class="gem-icon" aria-hidden="true"></span>
            <span>立即签到</span>
          </button>

          <div class="side-divider"></div>

          <article class="share-card">
            <div class="share-visual">
              <span class="clip clip-left"></span>
              <span class="clip clip-right"></span>
              <strong>{{ currentDay }}</strong>
              <span>{{ monthShort }}. {{ currentYear }}</span>
              <i aria-hidden="true"></i>
            </div>
            <div class="share-copy">
              <h2>宜朝西编程</h2>
              <p>只要代码敲的快，没有头发只有爱</p>
            </div>
            <footer class="share-footer">
              <div class="juejin-brand">
                <span class="brand-mark" aria-hidden="true"></span>
                <div>
                  <strong>稀土掘金</strong>
                  <p>扫描右侧二维码分享给好友</p>
                </div>
              </div>
              <div class="qr-code" aria-label="二维码示意">
                <span v-for="index in qrSquares" :key="index" :class="{ dark: qrPattern.has(index) }"></span>
              </div>
            </footer>
          </article>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { JUEJIN_SIGNIN_URL } from '@/constants/juejin'

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1
const currentDay = now.getDate()
const weekdays: string[] = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const monthShortNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthShort = monthShortNames[currentMonth - 1]
const leadingBlankCount = new Date(currentYear, currentMonth - 1, 1).getDay()
const monthDays = Array.from(
  { length: new Date(currentYear, currentMonth, 0).getDate() },
  (_: unknown, index: number): number => index + 1
)
const qrSquares = Array.from({ length: 121 }, (_: unknown, index: number): number => index)
const qrPattern = new Set<number>([
  0, 1, 2, 3, 4, 6, 7, 8, 9, 10,
  11, 15, 17, 21, 22, 24, 26, 28, 30, 32,
  33, 34, 35, 37, 39, 40, 42, 44, 45, 46,
  49, 50, 52, 55, 57, 58, 61, 63, 64, 65,
  66, 69, 71, 73, 76, 78, 80, 82, 84, 85,
  88, 89, 91, 93, 95, 97, 99, 100, 102, 104,
  106, 108, 110, 111, 112, 113, 116, 118, 119, 120
])

function openSigninPage(): void {
  window.open(JUEJIN_SIGNIN_URL, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
