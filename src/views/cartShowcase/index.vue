<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 100 款独立 Shopping Cart UI 结构
export interface CartThemeItem {
  id: number
  code: string
  name: string
  category: string
  icon: string
  description: string
  features: string[]
  discountRate: number
}

const CATEGORIES = [
  '全部 100 款',
  '悬浮侧滑微购物车',
  '3D 新拟物结算卡片',
  'B2B 阶梯价购物车',
  '极速 1-Tap 购物车',
  '移动 H5 吸底购物车',
  '赛博霓虹电竞购物车',
  'Oat 极简纯净购物车',
  '柔和马卡龙购物车',
  '游戏化积分购物车',
  'macOS 冰霜玻璃购物车'
]

const catNames = [
  '悬浮侧滑微购物车',
  '3D 新拟物结算卡片',
  'B2B 阶梯价购物车',
  '极速 1-Tap 购物车',
  '移动 H5 吸底购物车',
  '赛博霓虹电竞购物车',
  'Oat 极简纯净购物车',
  '柔和马卡龙购物车',
  '游戏化积分购物车',
  'macOS 冰霜玻璃购物车'
]

const icons = ['🛒', '💳', '📦', '⚡', '📱', '🌌', '🌾', '🍃', '🎮', '🍎']

const generate100Carts = (): CartThemeItem[] => {
  const list: CartThemeItem[] = []
  for (let i = 1; i <= 100; i++) {
    const catIdx = (i - 1) % catNames.length
    const catName = catNames[catIdx]
    list.push({
      id: i,
      code: `CART-${String(i).padStart(3, '0')}`,
      name: `#${String(i).padStart(3, '0')} ${catName} 范例`,
      category: catName,
      icon: icons[catIdx],
      description: `专为 ${catName} 打造的精美交互购物车卡片 #${i}，支持商品增减、优惠券核销与实时价格计息。`,
      features: ['动态数量加减', '优惠码实时抵扣', '全选/反选批量结算', '防失误一键清除'],
      discountRate: (i % 3 === 0) ? 0.85 : 0.95
    })
  }
  return list
}

const allCartThemes = ref<CartThemeItem[]>(generate100Carts())

// Search & Filter
const searchQuery = ref<string>('')
const selectedCategory = ref<string>('全部 100 款')

// Pagination (100 条数据按每页 10 条分页，共 10 页)
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const jumpPageInput = ref<number | null>(null)
const jumpIdInput = ref<number | null>(null)

// Active Item
const activeItemId = ref<number>(1)

// Interactive Cart Items state
const cartItems = ref([
  { id: 101, name: '🌾 Oat UI Pro 商业版框架许可', price: 299, count: 1, image: '🌾' },
  { id: 102, name: '⚡ Cyberpunk 霓虹特效组件包', price: 128, count: 2, image: '⚡' },
  { id: 103, name: '🍎 macOS Tahoe 冰霜玻璃图标集', price: 88, count: 1, image: '🍎' }
])

const couponCode = ref<string>('OATVIP')
const isCouponApplied = ref<boolean>(true)

const subtotalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.count, 0)
})

const discountAmount = computed(() => {
  if (!isCouponApplied.value) return 0
  return Math.round(subtotalPrice.value * 0.15)
})

const totalPrice = computed(() => {
  return Math.max(0, subtotalPrice.value - discountAmount.value)
})

// Filtered list
const filteredCarts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return allCartThemes.value.filter((item) => {
    const matchCat = selectedCategory.value === '全部 100 款' || item.category === selectedCategory.value
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
    return matchCat && matchSearch
  })
})

const paginatedCarts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredCarts.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(filteredCarts.value.length / pageSize.value) || 1)

const activeCart = computed(() => {
  return allCartThemes.value.find((x) => x.id === activeItemId.value) || allCartThemes.value[0]
})

const selectCart = (item: CartThemeItem) => {
  activeItemId.value = item.id
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    const firstItemOfPage = paginatedCarts.value[0]
    if (firstItemOfPage) selectCart(firstItemOfPage)
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
  if (jumpIdInput.value && jumpIdInput.value >= 1 && jumpIdInput.value <= 100) {
    const targetItem = allCartThemes.value[jumpIdInput.value - 1]
    if (targetItem) {
      const idxInFiltered = filteredCarts.value.findIndex((x) => x.id === targetItem.id)
      if (idxInFiltered !== -1) {
        currentPage.value = Math.floor(idxInFiltered / pageSize.value) + 1
      }
      selectCart(targetItem)
      ElMessage.success(`已直接定位至购物车范例 #${String(targetItem.id).padStart(3, '0')}！`)
    }
  } else {
    ElMessage.warning(`请输入 1 至 100 之间的有效范例 ID！`)
  }
}

const updateItemCount = (id: number, delta: number) => {
  const item = cartItems.value.find((x) => x.id === id)
  if (item) {
    item.count += delta
    if (item.count <= 0) {
      cartItems.value = cartItems.value.filter((x) => x.id !== id)
      ElMessage.info('已将商品从购物车中移除。')
    }
  }
}

const applyCoupon = () => {
  if (couponCode.value.toUpperCase() === 'OATVIP' || couponCode.value.toUpperCase() === 'SAVE15') {
    isCouponApplied.value = true
    ElMessage.success('优惠券核销成功！立享 85 折专属优惠。')
  } else {
    ElMessage.error('无效的优惠码，请输入 OATVIP 试用折扣！')
  }
}

const handleCheckout = () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空，请先挑选喜欢的组件！）')
    return
  }
  ElMessage.success(`[${activeCart.value.name}] 结算指令已发出！订单总金额: ¥${totalPrice.value.toLocaleString()}`)
}
</script>

<template>
  <div class="cart-showcase-page" style="min-height: 100vh; background: #0b0f19; color: #f8fafc; padding-bottom: 60px;">
    <!-- Header 头部栏 -->
    <header style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 32px 24px 20px;">
      <div style="max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <span style="display: inline-block; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.3); margin-bottom: 8px;">
            🛒 Cart 100 Showcase
          </span>
          <h1 style="font-size: 1.8rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            100 款精美购物车 UI 展厅
          </h1>
        </div>
        <button style="padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #e2e8f0; font-weight: 700; font-size: 0.88rem; cursor: pointer;" @click="router.push('/dyform')">
          ← 返回导航站
        </button>
      </div>

      <div style="max-width: 1280px; margin: 20px auto 0; display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>100 款</strong> 独立购物车界面卡片
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>10 大</strong> 现代电商与 B2B 购物车视觉风格
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>实时价格核算</strong> 优惠码核销与数量自增自减
        </div>
      </div>
    </header>

    <!-- 搜索框与跳转 -->
    <div style="max-width: 1280px; margin: 24px auto 16px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div style="position: relative; width: 320px;">
        <input v-model="searchQuery" type="text" placeholder="搜索 100 款购物车 UI 范例..." style="width: 100%; padding: 10px 16px; border-radius: 10px; border: 1px solid #334155; background: #1e293b; color: #fff; font-size: 0.86rem;" @input="currentPage = 1" />
      </div>

      <div style="display: flex; gap: 8px; align-items: center;">
        <div style="display: flex; gap: 4px; align-items: center; background: rgba(30,41,59,0.8); padding: 4px 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
          <span style="font-size: 0.8rem; color: #94a3b8;">跳转 ID:</span>
          <input v-model.number="jumpIdInput" type="number" placeholder="1-100" style="width: 60px; padding: 4px 8px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.8rem;" @keyup.enter="jumpToItemId" />
          <button style="padding: 4px 8px; border-radius: 6px; border: 1px solid #38bdf8; background: transparent; color: #38bdf8; font-size: 0.78rem; cursor: pointer;" @click="jumpToItemId">GO</button>
        </div>

        <div style="display: flex; gap: 4px; align-items: center; background: rgba(30,41,59,0.8); padding: 4px 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
          <span style="font-size: 0.8rem; color: #94a3b8;">页码:</span>
          <input v-model.number="jumpPageInput" type="number" placeholder="1-10" style="width: 60px; padding: 4px 8px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.8rem;" @keyup.enter="jumpToPageNumber" />
          <button style="padding: 4px 8px; border-radius: 6px; border: 1px solid #38bdf8; background: transparent; color: #38bdf8; font-size: 0.78rem; cursor: pointer;" @click="jumpToPageNumber">跳转</button>
        </div>
      </div>
    </div>

    <!-- 分类 Bar -->
    <nav style="max-width: 1280px; margin: 0 auto 16px; padding: 0 24px; display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;">
      <button
        v-for="cat in CATEGORIES"
        :key="cat"
        style="padding: 8px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; white-space: nowrap; cursor: pointer;"
        :style="{ background: selectedCategory === cat ? '#38bdf8' : 'rgba(255,255,255,0.06)', color: selectedCategory === cat ? '#0f172a' : '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }"
        @click="selectedCategory = cat; currentPage = 1"
      >
        {{ cat }}
      </button>
    </nav>

    <!-- 分页提示与 Chips -->
    <div style="max-width: 1280px; margin: 0 auto 10px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <span style="font-size: 0.82rem; color: #94a3b8;">显示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredCarts.length) }} 项 (共 {{ filteredCarts.length }} 项)</span>
      <div style="display: flex; gap: 6px; align-items: center;">
        <button style="padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-size: 0.8rem; cursor: pointer;" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">上一页</button>
        <span style="font-size: 0.82rem; color: #e2e8f0; font-weight: 700;">第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button style="padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-size: 0.8rem; cursor: pointer;" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">下一页</button>
      </div>
    </div>

    <!-- Chips 滑块 -->
    <nav style="max-width: 1280px; margin: 0 auto 24px; padding: 0 24px; display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px;">
      <button
        v-for="item in paginatedCarts"
        :key="item.id"
        style="padding: 8px 14px; border-radius: 10px; font-size: 0.82rem; font-weight: 600; white-space: nowrap; cursor: pointer; display: flex; align-items: center; gap: 6px;"
        :style="{ background: activeItemId === item.id ? 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)' : 'rgba(30,41,59,0.8)', color: '#fff', border: activeItemId === item.id ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)' }"
        @click="selectCart(item)"
      >
        <span>{{ item.icon }}</span>
        <span>{{ item.name }}</span>
      </button>
    </nav>

    <!-- Stage 卡片 -->
    <main style="max-width: 800px; margin: 0 auto; padding: 0 24px;">
      <div style="background: rgba(30, 41, 59, 0.7); border-radius: 20px; padding: 28px; border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(12px); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.5rem;">{{ activeCart.icon }}</span>
            <div>
              <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: #fff;">{{ activeCart.name }}</h3>
              <p style="margin: 4px 0 0; font-size: 0.8rem; color: #94a3b8;">{{ activeCart.description }}</p>
            </div>
          </div>
          <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 4px 10px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">{{ activeCart.category }}</span>
        </div>

        <!-- 购物车商品列表 -->
        <div style="margin-bottom: 20px;">
          <div v-for="prod in cartItems" :key="prod.id" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.4rem;">{{ prod.image }}</span>
              <div>
                <div style="font-size: 0.88rem; font-weight: 700; color: #f1f5f9;">{{ prod.name }}</div>
                <div style="font-size: 0.8rem; color: #38bdf8; font-weight: 600;">¥{{ prod.price }}</div>
              </div>
            </div>

            <!-- 数量 Stepper -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <button style="width: 28px; height: 28px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff; font-weight: 700; cursor: pointer;" @click="updateItemCount(prod.id, -1)">-</button>
              <span style="font-size: 0.88rem; font-weight: 700; min-width: 20px; text-align: center;">{{ prod.count }}</span>
              <button style="width: 28px; height: 28px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff; font-weight: 700; cursor: pointer;" @click="updateItemCount(prod.id, 1)">+</button>
            </div>
          </div>
        </div>

        <!-- 优惠码输入 -->
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <input v-model="couponCode" type="text" placeholder="输入优惠码 (如: OATVIP)" style="flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.84rem;" />
          <button style="padding: 10px 18px; border-radius: 10px; border: none; background: #6366f1; color: #fff; font-weight: 700; font-size: 0.84rem; cursor: pointer;" @click="applyCoupon">
            核销优惠
          </button>
        </div>

        <!-- 结算汇总明细 -->
        <div style="background: rgba(15, 23, 42, 0.8); padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="display: flex; justify-content: space-between; font-size: 0.84rem; color: #94a3b8; margin-bottom: 8px;">
            <span>商品小计:</span>
            <span>¥{{ subtotalPrice.toLocaleString() }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.84rem; color: #10b981; margin-bottom: 12px;">
            <span>优惠抵扣折扣 (OATVIP):</span>
            <span>-¥{{ discountAmount.toLocaleString() }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; color: #fff; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 10px;">
            <span>应付总计:</span>
            <span style="color: #38bdf8;">¥{{ totalPrice.toLocaleString() }}</span>
          </div>
        </div>

        <button style="width: 100%; padding: 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%); color: #fff; font-weight: 800; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 16px rgba(56, 189, 248, 0.4);" @click="handleCheckout">
          立即安全结算 ▶ (¥{{ totalPrice.toLocaleString() }})
        </button>
      </div>
    </main>
  </div>
</template>
