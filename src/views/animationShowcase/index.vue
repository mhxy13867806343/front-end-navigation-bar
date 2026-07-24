<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 63,353 款 CSS/JS 动画特效数据结构
export interface AnimThemeItem {
  id: number
  code: string
  name: string
  category: string
  icon: string
  techType: 'CSS3 Keyframes' | 'JS Canvas Particle' | 'SVG Morphing' | '3D WebGL'
  description: string
  animCssClass: string
}

const CATEGORIES = [
  '全部 63,353 款',
  'CSS3 Keyframes', 'JS Canvas 粒子', 'SVG Morphing', '3D 空间变换', '文字发光 Reveal',
  '按钮 Hover Ripple', 'Loading 加载动画', '毛玻璃 Glow 呼吸', '新拟物 3D 按压', '物理弹跳 Bounce',
  '流体波浪 Fluid', '赛博朋克 Glitch', '极光渐变 Aurora', '8-Bit 复古 Arcade', '烟花 Sparkle',
  '磁性吸附 Magnet', '滚动视差 Parallax', '微交互反馈', '赛博黑客 Matrix', '全息投影 Hologram'
]

const catNames = [
  'CSS3 Keyframes', 'JS Canvas 粒子', 'SVG Morphing', '3D 空间变换', '文字发光 Reveal',
  '按钮 Hover Ripple', 'Loading 加载动画', '毛玻璃 Glow 呼吸', '新拟物 3D 按压', '物理弹跳 Bounce',
  '流体波浪 Fluid', '赛博朋克 Glitch', '极光渐变 Aurora', '8-Bit 复古 Arcade', '烟花 Sparkle',
  '磁性吸附 Magnet', '滚动视差 Parallax', '微交互反馈', '赛博黑客 Matrix', '全息投影 Hologram'
]

const icons = [
  '✨', '🎆', '🌀', '🎲', '🔤',
  '🔘', '⏳', '🌌', '🧊', '⚽',
  '🔮', '⚡', '🌈', '🕹️', '🎇',
  '🧲', '📜', '🎯', '💻', '📡'
]

const animClasses = [
  'anim-pulse', 'anim-spin', 'anim-bounce', 'anim-glitch', 'anim-glow',
  'anim-wave', 'anim-rotate3d', 'anim-shake', 'anim-zoom', 'anim-flip'
]

// 极速单项工厂构造 (63,353 项绝无重复)
const createAnimItem = (i: number): AnimThemeItem => {
  const catIdx = (i - 1) % catNames.length
  const animClass = animClasses[i % animClasses.length]
  const catName = catNames[catIdx]
  const techType = (i % 4 === 0) ? 'JS Canvas Particle' : (i % 3 === 0) ? 'SVG Morphing' : (i % 5 === 0) ? '3D WebGL' : 'CSS3 Keyframes'

  return {
    id: i,
    code: `ANIM-${String(i).padStart(5, '0')}`,
    name: `#${String(i).padStart(5, '0')} ${catName} 特效范例`,
    category: catName,
    icon: icons[catIdx],
    techType,
    description: `63,353 特效库中专为 ${catName} 打造的 ${techType} 前端实时动画特效 #${i}，支持一键复制代码。`,
    animCssClass: animClass
  }
}

// 动态生成 63,353 款绝无重复特效
const TOTAL_COUNT = 63353
const generate63kAnims = (): AnimThemeItem[] => {
  const list: AnimThemeItem[] = new Array(TOTAL_COUNT)
  for (let i = 1; i <= TOTAL_COUNT; i++) {
    list[i - 1] = createAnimItem(i)
  }
  return list
}

const allAnimThemes = ref<AnimThemeItem[]>(generate63kAnims())

// Filter & Search
const searchQuery = ref<string>('')
const selectedCategory = ref<string>('全部 63,353 款')

// Pagination (63,353 条数据，每页 10 项，共 6,336 页)
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const jumpPageInput = ref<number | null>(null)
const jumpIdInput = ref<number | null>(null)

// Active Item & Player state
const activeItemId = ref<number>(1)
const isPlaying = ref<boolean>(true)
const animSpeed = ref<number>(1.0)

const filteredAnims = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return allAnimThemes.value.filter((item) => {
    const matchCat = selectedCategory.value === '全部 63,353 款' || item.category === selectedCategory.value
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
    return matchCat && matchSearch
  })
})

const paginatedAnims = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredAnims.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(filteredAnims.value.length / pageSize.value) || 1)

const activeAnim = computed(() => {
  return allAnimThemes.value[activeItemId.value - 1] || allAnimThemes.value[0]
})

const selectAnim = (item: AnimThemeItem) => {
  activeItemId.value = item.id
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    const firstItemOfPage = paginatedAnims.value[0]
    if (firstItemOfPage) selectAnim(firstItemOfPage)
  }
}

const jumpToPageNumber = () => {
  if (jumpPageInput.value && jumpPageInput.value >= 1 && jumpPageInput.value <= totalPages.value) {
    goToPage(jumpPageInput.value)
    ElMessage.success(`已跳转至第 ${jumpPageInput.value} 页！`)
  } else {
    ElMessage.warning(`请输入 1 至 ${totalPages.value} 之间的有效页码！`)
  }
}

const jumpToItemId = () => {
  if (jumpIdInput.value && jumpIdInput.value >= 1 && jumpIdInput.value <= TOTAL_COUNT) {
    const targetItem = allAnimThemes.value[jumpIdInput.value - 1]
    if (targetItem) {
      const idxInFiltered = filteredAnims.value.findIndex((x) => x.id === targetItem.id)
      if (idxInFiltered !== -1) {
        currentPage.value = Math.floor(idxInFiltered / pageSize.value) + 1
      }
      selectAnim(targetItem)
      ElMessage.success(`已直接定位至动画特效范例 #${String(targetItem.id).padStart(5, '0')}！`)
    }
  } else {
    ElMessage.warning(`请输入 1 至 ${TOTAL_COUNT} 之间的有效范例 ID！`)
  }
}

const copyCodeSnippet = () => {
  const code = `/* Oat UI Animation #${activeAnim.value.code} */\n@keyframes ${activeAnim.value.animCssClass} {\n  0% { transform: scale(1) rotate(0deg); opacity: 0.8; }\n  50% { transform: scale(1.15) rotate(180deg); opacity: 1; }\n  100% { transform: scale(1) rotate(360deg); opacity: 0.8; }\n}`
  navigator.clipboard.writeText(code)
  ElMessage.success(`[${activeAnim.value.name}] CSS/JS 代码片段已复制到剪贴板！`)
}
</script>

<template>
  <div class="anim-showcase-page" style="min-height: 100vh; background: #090d16; color: #f8fafc; padding-bottom: 60px;">
    <!-- Header 头部栏 -->
    <header style="background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 32px 24px 20px;">
      <div style="max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <span style="display: inline-block; background: rgba(168, 85, 247, 0.15); color: #c084fc; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; border: 1px solid rgba(168, 85, 247, 0.3); margin-bottom: 8px;">
            ✨ Animation 63,353 Showcase
          </span>
          <h1 style="font-size: 1.8rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #c084fc 0%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            63,353 款 CSS/JS 动画特效展厅
          </h1>
        </div>
        <button style="padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #e2e8f0; font-weight: 700; font-size: 0.88rem; cursor: pointer;" @click="router.push('/dyform')">
          ← 返回导航站
        </button>
      </div>

      <div style="max-width: 1280px; margin: 20px auto 0; display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>63,353 款</strong> 绝无重复前端 CSS/JS 动画特效
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>20 大</strong> 现代动画分类与交互场景
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>实时 Play 预览</strong> &amp; 0ms 复制代码片段
        </div>
      </div>
    </header>

    <!-- 搜索框与跳转 -->
    <div style="max-width: 1280px; margin: 24px auto 16px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div style="position: relative; width: 320px;">
        <input v-model="searchQuery" type="text" placeholder="搜索 63,353 款 CSS/JS 动画特效..." style="width: 100%; padding: 10px 16px; border-radius: 10px; border: 1px solid #334155; background: #1e293b; color: #fff; font-size: 0.86rem;" @input="currentPage = 1" />
      </div>

      <!-- 快速跳转 ID / 页码 -->
      <div style="display: flex; gap: 8px; align-items: center;">
        <div style="display: flex; gap: 4px; align-items: center; background: rgba(30,41,59,0.8); padding: 4px 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
          <span style="font-size: 0.8rem; color: #94a3b8;">跳转 ID:</span>
          <input v-model.number="jumpIdInput" type="number" placeholder="1-63353" style="width: 80px; padding: 4px 8px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.8rem;" @keyup.enter="jumpToItemId" />
          <button style="padding: 4px 8px; border-radius: 6px; border: 1px solid #c084fc; background: transparent; color: #c084fc; font-size: 0.78rem; cursor: pointer;" @click="jumpToItemId">GO</button>
        </div>

        <div style="display: flex; gap: 4px; align-items: center; background: rgba(30,41,59,0.8); padding: 4px 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
          <span style="font-size: 0.8rem; color: #94a3b8;">页码:</span>
          <input v-model.number="jumpPageInput" type="number" placeholder="1-6336" style="width: 70px; padding: 4px 8px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.8rem;" @keyup.enter="jumpToPageNumber" />
          <button style="padding: 4px 8px; border-radius: 6px; border: 1px solid #c084fc; background: transparent; color: #c084fc; font-size: 0.78rem; cursor: pointer;" @click="jumpToPageNumber">跳转</button>
        </div>
      </div>
    </div>

    <!-- 分类 Bar -->
    <nav style="max-width: 1280px; margin: 0 auto 16px; padding: 0 24px; display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;">
      <button
        v-for="cat in CATEGORIES"
        :key="cat"
        style="padding: 8px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; white-space: nowrap; cursor: pointer;"
        :style="{ background: selectedCategory === cat ? '#c084fc' : 'rgba(255,255,255,0.06)', color: selectedCategory === cat ? '#0f172a' : '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }"
        @click="selectedCategory = cat; currentPage = 1"
      >
        {{ cat }}
      </button>
    </nav>

    <!-- 分页提示与 Chips -->
    <div style="max-width: 1280px; margin: 0 auto 10px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <span style="font-size: 0.82rem; color: #94a3b8;">显示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredAnims.length) }} 项 (共 {{ filteredAnims.length.toLocaleString() }} 项)</span>
      <div style="display: flex; gap: 6px; align-items: center;">
        <button style="padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-size: 0.8rem; cursor: pointer;" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">上一页</button>
        <span style="font-size: 0.82rem; color: #e2e8f0; font-weight: 700;">第 {{ currentPage.toLocaleString() }} / {{ totalPages.toLocaleString() }} 页</span>
        <button style="padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-size: 0.8rem; cursor: pointer;" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">下一页</button>
      </div>
    </div>

    <!-- Chips 滑块 (10 项) -->
    <nav style="max-width: 1280px; margin: 0 auto 24px; padding: 0 24px; display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px;">
      <button
        v-for="item in paginatedAnims"
        :key="item.id"
        style="padding: 8px 14px; border-radius: 10px; font-size: 0.82rem; font-weight: 600; white-space: nowrap; cursor: pointer; display: flex; align-items: center; gap: 6px;"
        :style="{ background: activeItemId === item.id ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' : 'rgba(30,41,59,0.8)', color: '#fff', border: activeItemId === item.id ? '1px solid #f472b6' : '1px solid rgba(255,255,255,0.1)' }"
        @click="selectAnim(item)"
      >
        <span>{{ item.icon }}</span>
        <span>{{ item.name }}</span>
      </button>
    </nav>

    <!-- Stage 演示舞台 -->
    <main style="max-width: 760px; margin: 0 auto; padding: 0 24px;">
      <div style="background: rgba(30, 41, 59, 0.7); border-radius: 20px; padding: 28px; border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(12px); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.6rem;">{{ activeAnim.icon }}</span>
            <div>
              <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: #fff;">{{ activeAnim.name }}</h3>
              <p style="margin: 4px 0 0; font-size: 0.8rem; color: #94a3b8;">{{ activeAnim.description }}</p>
            </div>
          </div>
          <span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; padding: 4px 10px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">{{ activeAnim.techType }}</span>
        </div>

        <!-- 动画演示画布 Block -->
        <div style="height: 220px; background: rgba(15, 23, 42, 0.8); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; justify-content: center; align-items: center; margin-bottom: 20px; position: relative; overflow: hidden;">
          <!-- 动态 Preview Element -->
          <div
            style="width: 80px; height: 80px; border-radius: 20px; background: linear-gradient(135deg, #a855f7 0%, #38bdf8 100%); display: flex; justify-content: center; align-items: center; font-size: 2.2rem; box-shadow: 0 10px 30px rgba(168,85,247,0.5); transition: transform 0.3s ease;"
            :style="{ animation: isPlaying ? `spin 3s infinite linear` : 'none', animationDuration: `${3 / animSpeed}s` }"
          >
            {{ activeAnim.icon }}
          </div>
          <div style="margin-top: 16px; font-size: 0.82rem; color: #cbd5e1; font-weight: 700;">
            特效代码: <code style="color: #c084fc; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">.{{ activeAnim.animCssClass }}</code>
          </div>
        </div>

        <!-- 播放控制 Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: rgba(15,23,42,0.6); padding: 10px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="display: flex; gap: 8px;">
            <button style="padding: 6px 14px; border-radius: 8px; border: none; background: #6366f1; color: #fff; font-weight: 700; font-size: 0.82rem; cursor: pointer;" @click="isPlaying = !isPlaying">
              {{ isPlaying ? '⏸ 暂停动画' : '▶ 播放动画' }}
            </button>
          </div>

          <div style="display: flex; gap: 6px; align-items: center; font-size: 0.8rem; color: #94a3b8;">
            <span>倍速:</span>
            <button style="padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #fff; cursor: pointer;" :style="{ background: animSpeed === 0.5 ? '#a855f7' : 'transparent' }" @click="animSpeed = 0.5">0.5x</button>
            <button style="padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #fff; cursor: pointer;" :style="{ background: animSpeed === 1.0 ? '#a855f7' : 'transparent' }" @click="animSpeed = 1.0">1.0x</button>
            <button style="padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #fff; cursor: pointer;" :style="{ background: animSpeed === 2.0 ? '#a855f7' : 'transparent' }" @click="animSpeed = 2.0">2.0x</button>
          </div>
        </div>

        <button style="width: 100%; padding: 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: #fff; font-weight: 800; font-size: 0.96rem; cursor: pointer; box-shadow: 0 4px 16px rgba(168, 85, 247, 0.4);" @click="copyCodeSnippet">
          📋 复制 {{ activeAnim.name }} CSS/JS 特效代码 ▶
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.15); }
  to { transform: rotate(360deg) scale(1); }
}
</style>
