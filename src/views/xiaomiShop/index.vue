<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import shopDataRaw from '../../shop-json/xiaomi-shop.json'

interface Product {
  id: string
  name: string
  title: string
  subtitle: string
  category: string
  price: number
  originalPrice: number
  tag: string
  rating: number
  sales: number
  stock: number
  coverImage: string
  colors: { name: string; hex: string }[]
  specs: { name: string; price: number }[]
  highlights: string[]
  description: string
}

interface Banner {
  id: string
  title: string
  subtitle: string
  price: number
  tag: string
  bgGradient: string
  productId: string
}

const router = useRouter()

const shopInfo = shopDataRaw.shopInfo
const banners: Banner[] = shopDataRaw.banners
const categories = shopDataRaw.categories
const products: Product[] = shopDataRaw.products

const selectedCategory = ref('all')
const searchQuery = ref('')
const currentBannerIndex = ref(0)
const cartCount = ref(2)

const filteredProducts = computed(() => {
  return products.filter(p => {
    if (selectedCategory.value !== 'all' && p.category !== selectedCategory.value) {
      return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q)
      )
    }
    return true
  })
})

import CartDrawer from './CartDrawer.vue'
import { addToCartStore, cartTotalCount } from './cartStore'

const showCartDrawer = ref(false)
const showPayModal = ref(false)
const payTitle = ref('小米商城收银台')
const payAmount = ref(0)
const selectedPayMethod = ref('wechat')
const paySuccess = ref(false)
const isPaying = ref(false)

const openPaymentModal = (amount: number, title: string) => {
  payAmount.value = amount
  payTitle.value = title
  showPayModal.value = true
  paySuccess.value = false
}

const confirmPay = () => {
  isPaying.value = true
  setTimeout(() => {
    isPaying.value = false
    paySuccess.value = true
    ElMessage.success('🎉 模拟支付完成！仓库将立即为您安排顺丰发货！')
  }, 1500)
}

const goToDetail = (productId: string) => {
  router.push(`/xiaomi-shop/detail/${productId}`)
}

const addToCart = (e: MouseEvent, product: Product) => {
  e.stopPropagation()
  addToCartStore({
    productId: product.id,
    name: product.name,
    subtitle: product.subtitle,
    coverImage: product.coverImage,
    price: product.price
  })
}

const handleBannerClick = (productId: string) => {
  goToDetail(productId)
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="xiaomi-shop-page">
    <!-- Cart Drawer -->
    <CartDrawer
      v-model:visible="showCartDrawer"
      @openPayment="openPaymentModal"
    />

    <!-- Payment Checkout Modal -->
    <el-dialog
      v-model="showPayModal"
      :title="payTitle"
      width="540px"
      align-center
    >
      <div v-if="!paySuccess" class="payment-modal-body">
        <div class="pay-amount-box">
          <span class="label">应付总金额</span>
          <span class="val">￥{{ payAmount }}</span>
        </div>

        <div class="pay-method-title">选择支付方式：</div>
        <div class="pay-method-grid">
          <div
            class="pay-method-card"
            :class="{ active: selectedPayMethod === 'wechat' }"
            @click="selectedPayMethod = 'wechat'"
          >
            <span class="pay-icon">💚</span>
            <div class="pay-name">微信支付</div>
          </div>
          <div
            class="pay-method-card"
            :class="{ active: selectedPayMethod === 'alipay' }"
            @click="selectedPayMethod = 'alipay'"
          >
            <span class="pay-icon">💙</span>
            <div class="pay-name">支付宝</div>
          </div>
          <div
            class="pay-method-card"
            :class="{ active: selectedPayMethod === 'unionpay' }"
            @click="selectedPayMethod = 'unionpay'"
          >
            <span class="pay-icon">🔴</span>
            <div class="pay-name">云闪付 / 银联</div>
          </div>
        </div>

        <div class="qr-code-box">
          <div class="fake-qr">
            <div class="qr-pattern"></div>
            <div class="qr-center">mi</div>
          </div>
          <div class="qr-tip">
            请使用 {{ selectedPayMethod === 'wechat' ? '微信' : selectedPayMethod === 'alipay' ? '支付宝' : '云闪付' }} 扫描二维码完成支付
          </div>
        </div>

        <el-button
          type="warning"
          size="large"
          class="confirm-pay-btn"
          :loading="isPaying"
          @click="confirmPay"
        >
          {{ isPaying ? '正在向银行发起扣款...' : `模拟已完成付款 ￥${payAmount}` }}
        </el-button>
      </div>

      <div v-else class="pay-success-box">
        <div class="success-icon">🎉</div>
        <h2>支付成功！</h2>
        <p>订单已成功推送到小米物流仓库，预计明日顺丰发货！</p>
        <el-button type="primary" @click="showPayModal = false">完成</el-button>
      </div>
    </el-dialog>

    <!-- Top Announcement Bar -->
    <div class="top-bar">
      <div class="container bar-content">
        <span>{{ shopInfo.notice }}</span>
        <div class="top-links">
          <span @click="goHome">↩ 返回全站主页</span>
          <span class="divider">|</span>
          <span>小米官网</span>
          <span class="divider">|</span>
          <span>小米云服务</span>
          <span class="divider">|</span>
          <span>资质证照</span>
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <header class="main-header">
      <div class="container header-content">
        <div class="brand-logo" @click="goHome">
          <div class="mi-logo-square">
            <span class="mi-text">mi</span>
          </div>
          <div class="brand-titles">
            <h1 class="shop-title">小米商城</h1>
            <span class="shop-sub">Xiaomi Shop Official</span>
          </div>
        </div>

        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜一搜 小米15 / Redmi K80 / 电视 / 扫拖机器人..."
            size="large"
            clearable
          >
            <template #append>
              <el-button type="primary" class="mi-search-btn">🔍 搜索</el-button>
            </template>
          </el-input>
        </div>

        <div class="header-cart" @click="showCartDrawer = true">
          <span class="cart-icon">🛒</span>
          <span>购物车</span>
          <span class="cart-badge">{{ cartTotalCount }}</span>
        </div>
      </div>
    </header>

    <!-- Category Nav Bar -->
    <nav class="category-nav">
      <div class="container nav-items">
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="nav-btn"
          :class="{ active: selectedCategory === cat.key }"
          @click="selectedCategory = cat.key"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
        </button>
      </div>
    </nav>

    <!-- Hero Banner Slider -->
    <section class="banner-section container">
      <el-carousel trigger="click" height="380px" indicator-position="inside" :interval="5000">
        <el-carousel-item v-for="b in banners" :key="b.id">
          <div
            class="banner-slide"
            :style="{ background: b.bgGradient }"
            @click="handleBannerClick(b.productId)"
          >
            <div class="slide-info">
              <span class="slide-tag">{{ b.tag }}</span>
              <h2 class="slide-title">{{ b.title }}</h2>
              <p class="slide-sub">{{ b.subtitle }}</p>
              <div class="slide-price">
                <span class="currency">￥</span>
                <strong class="num">{{ b.price }}</strong>
                <span class="unit">起</span>
              </div>
              <el-button type="primary" size="large" class="mi-btn-orange">
                立即前往查看详情 →
              </el-button>
            </div>
            <div class="slide-visual">
              <div class="visual-sphere">
                <span class="visual-text">XIAOMI</span>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- Product Showcase Grid -->
    <main class="product-section container">
      <div class="section-header">
        <h2 class="section-title">
          {{ categories.find(c => c.key === selectedCategory)?.name }}
          <span class="count-hint">({{ filteredProducts.length }} 款热销选购)</span>
        </h2>
      </div>

      <div v-if="filteredProducts.length === 0" class="empty-box">
        <span>🔍 没有找到匹配的商品，请更换搜索词试试。</span>
      </div>

      <div class="products-grid">
        <div
          v-for="item in filteredProducts"
          :key="item.id"
          class="product-card"
          @click="goToDetail(item.id)"
        >
          <div class="card-tag" v-if="item.tag">{{ item.tag }}</div>
          <div class="card-img-wrap">
            <div class="fake-product-img">
              <span class="img-logo">mi</span>
              <span class="img-name">{{ item.name }}</span>
            </div>
          </div>

          <div class="card-body">
            <h3 class="p-name">{{ item.name }}</h3>
            <p class="p-sub">{{ item.subtitle }}</p>
            <div class="price-row">
              <span class="price-current">￥{{ item.price }}<span class="qi">起</span></span>
              <span class="price-original" v-if="item.originalPrice > item.price">￥{{ item.originalPrice }}</span>
            </div>

            <div class="card-footer-actions">
              <el-button size="small" class="detail-btn" @click.stop="goToDetail(item.id)">
                查看详情
              </el-button>
              <el-button size="small" type="warning" class="cart-btn" @click="(e: MouseEvent) => addToCart(e, item)">
                🛒 加入购物车
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Service Guarantees Footer -->
    <footer class="shop-footer">
      <div class="container">
        <div class="service-bar">
          <div class="s-item"><span>🔧</span> 预约维修服务</div>
          <div class="s-item"><span>7</span> 7天无理由退货</div>
          <div class="s-item"><span>15</span> 15天免费换货</div>
          <div class="s-item"><span>🚚</span> 满69元包邮</div>
          <div class="s-item"><span>📍</span> 520余家售后网点</div>
        </div>
        <div class="copyright">
          <p>小米商城模仿演示界面 | 纯数据驱动 JSON：<code>src/shop-json/xiaomi-shop.json</code></p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
