<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// Motion for Vue Examples Categories
const CATEGORIES = [
  '全部 50+ 示例',
  'iOS 拟态交互',
  'Carousel 轮播图集',
  'Typewriter 打字机',
  'Ticker 跑马灯',
  'Cursor & 磁性光标',
  'Card Deck 卡片堆叠',
  'Dialog & 动画模式',
  'Text & 智能特效'
]

const selectedCategory = ref<string>('全部 50+ 示例')

// 1. iOS App Folder State
const isFolderOpen = ref<boolean>(false)
const folderApps = ref([
  { id: 1, name: '微信', icon: '💬', color: '#10b981' },
  { id: 2, name: '相册', icon: '🖼️', color: '#38bdf8' },
  { id: 3, name: '相机', icon: '📷', color: '#64748b' },
  { id: 4, name: '音乐', icon: '🎵', color: '#ef4444' },
  { id: 5, name: '地图', icon: '🗺️', color: '#f59e0b' },
  { id: 6, name: '设置', icon: '⚙️', color: '#94a3b8' },
  { id: 7, name: '邮件', icon: '✉️', color: '#3b82f6' },
  { id: 8, name: '日历', icon: '📅', color: '#ec4899' },
  { id: 9, name: '天气', icon: '🌦️', color: '#06b6d4' }
])

// 2. iOS Exposure Slider State
const exposureValue = ref<number>(0)

// 3. To-Do List Reorder State
const todoItems = ref([
  { id: 1, title: '学习 Motion for Vue 动画范例', done: true },
  { id: 2, title: '体验 Schedule-X v4.6 日历调度组件', done: false },
  { id: 3, title: '复刻 3D Coverflow 轮播特效', done: true },
  { id: 4, title: '测试打字机爆炸倒计时效果', done: false }
])

const addTodo = () => {
  todoItems.value.push({ id: Date.now(), title: `新添加的动画任务 #${todoItems.value.length + 1}`, done: false })
  ElMessage.success('已新增任务，支持拖拽与下划线动画！')
}

const toggleTodo = (id: number) => {
  const item = todoItems.value.find(x => x.id === id)
  if (item) item.done = !item.done
}

// 4. Carousel Master State
const carouselMode = ref<'coverflow' | 'autoplay' | 'lightbox' | 'parallax'>('coverflow')
const carouselIndex = ref<number>(0)
const carouselItems = ref([
  { id: 1, title: 'Mountain Sunset', color: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)', icon: '🏔️' },
  { id: 2, title: 'Cyberpunk Neon', color: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', icon: '🏙️' },
  { id: 3, title: 'Emerald Forest', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '🌲' },
  { id: 4, title: 'Cosmic Nebula', color: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', icon: '🌌' },
  { id: 5, title: 'Golden Desert', color: 'linear-gradient(135deg, #eab308 0%, #ea580c 100%)', icon: '🏜️' }
])

const nextCarousel = () => {
  carouselIndex.value = (carouselIndex.value + 1) % carouselItems.value.length
}
const prevCarousel = () => {
  carouselIndex.value = (carouselIndex.value - 1 + carouselItems.value.length) % carouselItems.value.length
}

// 5. Typewriter State
const typewriterTexts = ['Motion for Vue 让动画更具灵动感！', '支持 50+ 款高保真动画与平滑物理弹簧。', '无需硬编码，一键实现 iOS 与 Material 交互！']
const typewriterIndex = ref<number>(0)
const typedText = ref<string>('')
const isTyping = ref<boolean>(false)

const startTypewriter = () => {
  const target = typewriterTexts[typewriterIndex.value]
  typedText.value = ''
  let i = 0
  isTyping.value = true
  const timer = setInterval(() => {
    if (i < target.length) {
      typedText.value += target[i]
      i++
    } else {
      clearInterval(timer)
      isTyping.value = false
    }
  }, 60)
}

const nextTypewriter = () => {
  typewriterIndex.value = (typewriterIndex.value + 1) % typewriterTexts.length
  startTypewriter()
}

startTypewriter()

// 6. Ticker State
const tickerItems = ref(['✨ Motion+ Vue', '⚡ Fast Spring Physics', '🚀 Smooth Layout Animations', '🎨 Glassmorphism UI', '🔮 AnimatePresence'])

// 7. Cursor & Magnetic Target State
const pointerPos = ref({ x: 0, y: 0 })
const isMagneticHover = ref<boolean>(false)

const handleMouseMove = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  pointerPos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

// 8. Card Stack State
const cards = ref([
  { id: 1, name: 'Aurora Sky', bg: 'linear-gradient(135deg, #38bdf8, #818cf8)' },
  { id: 2, name: 'Neon Glitch', bg: 'linear-gradient(135deg, #f43f5e, #fb923c)' },
  { id: 3, name: 'Oat Pure', bg: 'linear-gradient(135deg, #10b981, #06b6d4)' }
])

const swipeCard = () => {
  const first = cards.value.shift()
  if (first) cards.value.push(first)
  ElMessage.success('已切换卡片堆叠！')
}

// 9. Apple Intelligence & Text State
const appleText = ref<string>('Apple Intelligence')
const isAppleRipple = ref<boolean>(false)

const triggerAppleRipple = () => {
  isAppleRipple.value = true
  setTimeout(() => { isAppleRipple.value = false }, 1200)
}
</script>

<template>
  <div class="motion-showcase-page" style="min-height: 100vh; background: #090d16; color: #f8fafc; padding-bottom: 60px;">
    <!-- Header 头部栏 -->
    <header style="background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 32px 24px 20px;">
      <div style="max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <span style="display: inline-block; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.3); margin-bottom: 8px;">
            ⚡ Motion for Vue Examples
          </span>
          <h1 style="font-size: 1.8rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #38bdf8 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Motion for Vue 50+ 款经典动画与交互展厅
          </h1>
        </div>
        <button style="padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #e2e8f0; font-weight: 700; font-size: 0.88rem; cursor: pointer;" @click="router.push('/dyform')">
          ← 返回导航站
        </button>
      </div>

      <div style="max-width: 1280px; margin: 20px auto 0; display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>50+ 官方范例</strong> iOS 拟态/Carousel/Typewriter/Ticker
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>Apple Intelligence Ripple</strong> &amp; 3D Stack 卡片
        </div>
      </div>
    </header>

    <!-- 分类 Bar -->
    <nav style="max-width: 1280px; margin: 20px auto; padding: 0 24px; display: flex; gap: 8px; overflow-x: auto;">
      <button
        v-for="cat in CATEGORIES"
        :key="cat"
        style="padding: 8px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; white-space: nowrap; cursor: pointer;"
        :style="{ background: selectedCategory === cat ? '#38bdf8' : 'rgba(255,255,255,0.06)', color: selectedCategory === cat ? '#0f172a' : '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </nav>

    <main style="max-width: 1280px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
      <!-- Section 1: iOS App Folder -->
      <section v-if="selectedCategory === '全部 50+ 示例' || selectedCategory === 'iOS 拟态交互'" style="background: rgba(30,41,59,0.7); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);">
        <h3 style="margin: 0 0 12px; font-size: 1.1rem; color: #38bdf8;">📱 1. iOS App Folder (应用文件夹展开)</h3>
        <p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 16px;">基于 Motion for Vue 的 shared layout 布局平滑展开与高斯模糊遮罩。</p>
        
        <div style="display: flex; justify-content: center; align-items: center; min-height: 220px; position: relative;">
          <!-- Small Folder Card -->
          <div
            v-if="!isFolderOpen"
            style="width: 120px; height: 120px; background: rgba(255,255,255,0.15); border-radius: 24px; padding: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); transition: transform 0.2s;"
            @click="isFolderOpen = true"
          >
            <div v-for="app in folderApps" :key="app.id" :style="{ background: app.color }" style="border-radius: 8px; display: flex; justify-content: center; align-items: center; font-size: 0.8rem;">
              {{ app.icon }}
            </div>
          </div>

          <!-- Expanded Folder Dialog -->
          <div
            v-else
            style="position: absolute; inset: 0; background: rgba(15,23,42,0.9); border-radius: 24px; padding: 24px; border: 1px solid #38bdf8; display: flex; flex-direction: column; justify-content: space-between; z-index: 10; animation: folderExpand 0.3s cubic-bezier(0.16, 1, 0.3, 1);"
          >
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 style="margin: 0; font-size: 1rem; color: #fff;">常用工具文件夹</h4>
              <button style="padding: 4px 10px; border-radius: 12px; border: none; background: rgba(255,255,255,0.1); color: #fff; cursor: pointer;" @click="isFolderOpen = false">✕ 关闭</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 16px 0;">
              <div v-for="app in folderApps" :key="app.id" style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div :style="{ background: app.color }" style="width: 48px; height: 48px; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 1.4rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                  {{ app.icon }}
                </div>
                <span style="font-size: 0.76rem; color: #cbd5e1;">{{ app.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: iOS Exposure Slider -->
      <section v-if="selectedCategory === '全部 50+ 示例' || selectedCategory === 'iOS 拟态交互'" style="background: rgba(30,41,59,0.7); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);">
        <h3 style="margin: 0 0 12px; font-size: 1.1rem; color: #c084fc;">🎛️ 2. iOS Exposure Slider (相机曝光刻度)</h3>
        <p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 16px;">跟随滑动滑块物理反馈与刻度 Notch 动画。</p>
        
        <div style="background: #0f172a; padding: 20px; border-radius: 16px; text-align: center;">
          <div style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-bottom: 12px;">
            ☀️ 曝光度: {{ exposureValue > 0 ? '+' : '' }}{{ exposureValue }} EV
          </div>
          <input v-model.number="exposureValue" type="range" min="-5" max="5" step="1" style="width: 80%; cursor: pointer;" />
          <div style="display: flex; justify-content: center; gap: 6px; margin-top: 16px;">
            <span v-for="n in 11" :key="n" style="width: 4px; height: 16px; border-radius: 2px; transition: all 0.2s;" :style="{ background: (n - 6) === exposureValue ? '#f59e0b' : 'rgba(255,255,255,0.2)', height: (n - 6) === exposureValue ? '28px' : '16px' }"></span>
          </div>
        </div>
      </section>

      <!-- Section 3: Carousel Master -->
      <section v-if="selectedCategory === '全部 50+ 示例' || selectedCategory === 'Carousel 轮播图集'" style="background: rgba(30,41,59,0.7); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); grid-column: span 1;">
        <h3 style="margin: 0 0 12px; font-size: 1.1rem; color: #38bdf8;">🎠 3. Carousel Master (3D Coverflow &amp; Parallax)</h3>
        <div style="display: flex; gap: 6px; margin-bottom: 12px;">
          <button v-for="m in ['coverflow', 'autoplay', 'parallax']" :key="m" style="padding: 4px 10px; border-radius: 6px; font-size: 0.78rem; cursor: pointer; text-transform: capitalize;" :style="{ background: carouselMode === m ? '#38bdf8' : 'rgba(255,255,255,0.08)', color: carouselMode === m ? '#0f172a' : '#fff', border: 'none' }" @click="carouselMode = m as any">{{ m }}</button>
        </div>

        <div style="position: relative; height: 180px; overflow: hidden; border-radius: 16px; display: flex; justify-content: center; align-items: center;">
          <div
            :style="{ background: carouselItems[carouselIndex].color }"
            style="width: 100%; height: 100%; border-radius: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);"
          >
            <span style="font-size: 3rem;">{{ carouselItems[carouselIndex].icon }}</span>
            <h4 style="margin: 8px 0 0; font-size: 1.2rem; color: #fff;">{{ carouselItems[carouselIndex].title }}</h4>
          </div>
          <button style="position: absolute; left: 10px; padding: 8px 12px; border-radius: 50%; border: none; background: rgba(0,0,0,0.4); color: #fff; cursor: pointer;" @click="prevCarousel">‹</button>
          <button style="position: absolute; right: 10px; padding: 8px 12px; border-radius: 50%; border: none; background: rgba(0,0,0,0.4); color: #fff; cursor: pointer;" @click="nextCarousel">›</button>
        </div>
      </section>

      <!-- Section 4: Typewriter Engine -->
      <section v-if="selectedCategory === '全部 50+ 示例' || selectedCategory === 'Typewriter 打字机'" style="background: rgba(30,41,59,0.7); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);">
        <h3 style="margin: 0 0 12px; font-size: 1.1rem; color: #10b981;">✍️ 4. Typewriter Natural Engine (拟真打字机)</h3>
        <div style="background: #0f172a; padding: 20px; border-radius: 14px; min-height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="font-size: 1rem; font-weight: 700; color: #10b981; font-family: monospace;">
            {{ typedText }}<span style="animation: blink 1s infinite;">|</span>
          </div>
          <button style="align-self: flex-end; padding: 6px 14px; border-radius: 8px; border: none; background: #10b981; color: #0f172a; font-weight: 800; cursor: pointer;" @click="nextTypewriter">
            切换下一个文案 ▶
          </button>
        </div>
      </section>

      <!-- Section 5: Ticker Engine -->
      <section v-if="selectedCategory === '全部 50+ 示例' || selectedCategory === 'Ticker 跑马灯'" style="background: rgba(30,41,59,0.7); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);">
        <h3 style="margin: 0 0 12px; font-size: 1.1rem; color: #f43f5e;">📜 5. Ticker Infinite Stream (跑马灯流)</h3>
        <div style="background: #0f172a; overflow: hidden; padding: 12px; border-radius: 12px; display: flex; gap: 20px; white-space: nowrap;">
          <div style="display: flex; gap: 20px; animation: tickerScroll 10s linear infinite;">
            <span v-for="(t, idx) in tickerItems" :key="idx" style="background: rgba(244,63,94,0.15); color: #f43f5e; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.84rem; border: 1px solid rgba(244,63,94,0.3);">
              {{ t }}
            </span>
          </div>
        </div>
      </section>

      <!-- Section 6: Magnetic Pointer & Ripple -->
      <section v-if="selectedCategory === '全部 50+ 示例' || selectedCategory === 'Cursor & 磁性光标'" style="background: rgba(30,41,59,0.7); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);" @mousemove="handleMouseMove">
        <h3 style="margin: 0 0 12px; font-size: 1.1rem; color: #eab308;">🧲 6. Magnetic Filings &amp; Cursor (磁性指针吸附)</h3>
        <div style="background: #0f172a; height: 140px; border-radius: 14px; position: relative; overflow: hidden; display: flex; justify-content: center; align-items: center;">
          <div style="position: absolute; width: 20px; height: 20px; border-radius: 50%; background: rgba(234,179,8,0.4); pointer-events: none; transition: transform 0.05s;" :style="{ transform: `translate(${pointerPos.x - 70}px, ${pointerPos.y - 70}px)` }"></div>
          <button style="padding: 12px 24px; border-radius: 14px; border: 2px solid #eab308; background: transparent; color: #eab308; font-weight: 800; cursor: pointer; transition: transform 0.2s;" @mouseenter="isMagneticHover = true" @mouseleave="isMagneticHover = false">
            🧲 磁性吸附按钮
          </button>
        </div>
      </section>

      <!-- Section 7: Card Stack -->
      <section v-if="selectedCategory === '全部 50+ 示例' || selectedCategory === 'Card Deck 卡片堆叠'" style="background: rgba(30,41,59,0.7); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);">
        <h3 style="margin: 0 0 12px; font-size: 1.1rem; color: #ec4899;">🃏 7. 3D Card Stack (卡片堆叠滑动)</h3>
        <div style="height: 180px; position: relative; display: flex; justify-content: center; align-items: center;" @click="swipeCard">
          <div
            v-for="(card, i) in cards"
            :key="card.id"
            :style="{ background: card.bg, transform: `translateY(${i * 12}px) scale(${1 - i * 0.08})`, zIndex: cards.length - i }"
            style="position: absolute; width: 220px; height: 120px; border-radius: 16px; padding: 16px; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.5); cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);"
          >
            <h4 style="margin: 0; font-size: 1.1rem;">{{ card.name }}</h4>
            <p style="margin: 4px 0 0; font-size: 0.78rem; opacity: 0.8;">点击滑动切换下一个卡片</p>
          </div>
        </div>
      </section>

      <!-- Section 8: Apple Intelligence Ripple -->
      <section v-if="selectedCategory === '全部 50+ 示例' || selectedCategory === 'Text & 智能特效'" style="background: rgba(30,41,59,0.7); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);">
        <h3 style="margin: 0 0 12px; font-size: 1.1rem; color: #38bdf8;">🍎 8. Apple Intelligence Ripple (苹果 AI 水波纹)</h3>
        <div style="background: #000; padding: 24px; border-radius: 16px; text-align: center; position: relative; overflow: hidden;" @click="triggerAppleRipple">
          <span style="font-size: 1.4rem; font-weight: 800; background: linear-gradient(90deg, #ec4899, #8b5cf6, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            {{ appleText }}
          </span>
          <div v-if="isAppleRipple" style="position: absolute; inset: 0; border: 3px solid #38bdf8; border-radius: 16px; animation: appleRippleAnim 1s ease-out;"></div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
@keyframes folderExpand {
  from { transform: scale(0.6); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes tickerScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes appleRippleAnim {
  0% { transform: scale(0.9); opacity: 1; box-shadow: 0 0 20px #38bdf8; }
  100% { transform: scale(1.15); opacity: 0; box-shadow: 0 0 60px #ec4899; }
}
</style>
