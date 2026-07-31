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

<style scoped lang="scss">
.juejin-signin-page {
  min-height: 100vh;
  padding: 14px 20px 44px;
  color: #1f2937;
  background: #eef0f3;
}

.signin-panel {
  width: min(100%, 1740px);
  margin: 0 auto;
  background: #ffffff;
}

.signin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 118px;
  padding: 0 38px;
  border-bottom: 1px solid #e5e7eb;
}

.signin-header h1 {
  margin: 0;
  color: #202733;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: 0;
}

.rules-button,
.month-arrow,
.calendar-cell,
.signin-button {
  border: 0;
  font: inherit;
  cursor: pointer;
}

.rules-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 18px;
  font-weight: 800;
  background: transparent;
}

.question-icon {
  display: inline-grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border: 2px solid #7a8594;
  border-radius: 50%;
  color: #556171;
  font-size: 16px;
  line-height: 1;
}

.signin-body {
  display: grid;
  grid-template-columns: minmax(680px, 1fr) 454px;
  gap: 74px;
  padding: 66px 60px 76px;
}

.calendar-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
}

.calendar-title-row strong {
  color: #1f2937;
  font-size: 36px;
  line-height: 1.16;
  font-weight: 800;
}

.month-arrow {
  padding: 0;
  color: #c4cad3;
  font-size: 40px;
  line-height: 1;
  background: transparent;
}

.month-arrow:hover {
  color: #1e80ff;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 22px;
  margin-bottom: 30px;
}

.weekday-row span {
  color: #87919f;
  font-size: 24px;
  line-height: 1;
  font-weight: 700;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(80px, 136px));
  justify-content: center;
  gap: 30px 22px;
}

.calendar-cell {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1 / 0.94;
  color: #1f2937;
  border-radius: 2px;
  background: #f4f5f7;
}

.calendar-cell:not(.calendar-blank):hover {
  background: #eaf4ff;
}

.calendar-blank {
  visibility: hidden;
}

.day-number {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
}

.calendar-cell.today {
  color: #1e80ff;
  background: #e8f3ff;
}

.calendar-cell.today .day-number {
  display: inline-grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: #2587ff;
}

.today-label {
  margin-top: -16px;
  color: #8b96a4;
  font-size: 20px;
  font-weight: 800;
}

.signin-side {
  padding-top: 10px;
}

.makeup-card-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 72px;
  color: #8b95a4;
  font-size: 24px;
  font-weight: 800;
}

.makeup-card-row strong {
  color: #f97316;
}

.makeup-icon {
  font-size: 30px;
}

.signin-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  width: 100%;
  min-height: 108px;
  border-radius: 6px;
  color: #ffffff;
  font-size: 30px;
  font-weight: 900;
  background: #2587ff;
  box-shadow: 0 18px 34px rgba(37, 135, 255, 0.18);
}

.signin-button:hover {
  background: #1d73df;
}

.gem-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 8px 9px 10px 7px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.52), transparent 36%),
    linear-gradient(135deg, #ffbd5b, #f58d34);
  transform: rotate(-18deg);
}

.side-divider {
  height: 1px;
  margin: 46px 0 56px;
  background: #e5e7eb;
}

.share-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

.share-visual {
  position: relative;
  height: 300px;
  overflow: hidden;
  padding: 76px 46px 0;
  color: #ffffff;
  background:
    radial-gradient(circle at 83% 28%, #ffcd4c 0 22px, transparent 23px),
    linear-gradient(150deg, #0b49d9 0 31%, #2789ff 32% 47%, #0645d4 48% 70%, #1b84ff 71% 100%);
}

.share-visual strong {
  display: block;
  font-size: 86px;
  line-height: 0.9;
  font-weight: 900;
}

.share-visual span:not(.clip) {
  display: block;
  margin-top: 24px;
  font-size: 28px;
  line-height: 1;
  font-weight: 700;
  opacity: 0.86;
}

.share-visual i {
  position: absolute;
  right: 0;
  bottom: -16px;
  width: 120%;
  height: 96px;
  background: rgba(0, 48, 181, 0.36);
  transform: rotate(-17deg);
  transform-origin: right bottom;
}

.clip {
  position: absolute;
  top: -18px;
  width: 16px;
  height: 52px;
  border: 6px solid #e2f0ff;
  border-bottom: 0;
  border-radius: 10px 10px 0 0;
}

.clip-left {
  left: 106px;
}

.clip-right {
  right: 110px;
}

.share-copy {
  min-height: 300px;
  padding: 72px 48px 40px;
}

.share-copy h2 {
  margin: 0 0 36px;
  color: #1e80ff;
  font-size: 34px;
  line-height: 1.18;
  font-weight: 900;
  letter-spacing: 0;
}

.share-copy p {
  margin: 0;
  color: #4b5563;
  font-size: 24px;
  line-height: 1.72;
  font-weight: 700;
}

.share-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  padding: 28px 34px;
  background: #f8fafc;
}

.juejin-brand {
  display: flex;
  align-items: center;
  gap: 18px;
}

.brand-mark {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 44px;
}

.brand-mark::before,
.brand-mark::after {
  position: absolute;
  left: 4px;
  width: 34px;
  height: 14px;
  border-right: 8px solid #2587ff;
  border-bottom: 8px solid #2587ff;
  content: '';
  transform: rotate(45deg);
}

.brand-mark::before {
  top: 2px;
}

.brand-mark::after {
  top: 16px;
}

.juejin-brand strong {
  display: block;
  color: #242b35;
  font-size: 28px;
  line-height: 1;
  font-weight: 900;
}

.juejin-brand p {
  margin: 14px 0 0;
  color: #8b95a4;
  font-size: 18px;
  font-weight: 700;
}

.qr-code {
  display: grid;
  grid-template-columns: repeat(11, 5px);
  grid-auto-rows: 5px;
  gap: 2px;
  padding: 8px;
  background: #ffffff;
}

.qr-code span.dark {
  background: #111827;
}

@media (max-width: 1280px) {
  .signin-body {
    grid-template-columns: 1fr;
  }

  .signin-side {
    width: min(100%, 454px);
    margin: 0 auto;
  }
}

@media (max-width: 760px) {
  .juejin-signin-page {
    padding: 0;
  }

  .signin-header {
    min-height: 88px;
    padding: 0 22px;
  }

  .signin-body {
    padding: 34px 18px 48px;
  }

  .calendar-title-row strong {
    font-size: 28px;
  }

  .weekday-row,
  .calendar-grid {
    gap: 12px 8px;
  }

  .weekday-row span {
    font-size: 15px;
  }

  .calendar-grid {
    grid-template-columns: repeat(7, minmax(38px, 1fr));
  }

  .day-number {
    font-size: 20px;
  }

  .calendar-cell.today .day-number {
    width: 34px;
    height: 34px;
  }

  .today-label {
    margin-top: -10px;
    font-size: 13px;
  }

  .signin-button {
    min-height: 74px;
    font-size: 24px;
  }

  .share-copy {
    min-height: 220px;
    padding: 44px 34px 30px;
  }

  .share-copy h2 {
    font-size: 28px;
  }
}
</style>
