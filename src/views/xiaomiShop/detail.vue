<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
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
  galleryImages?: string[]
  colors: { name: string; hex: string }[]
  specs: { name: string; price: number }[]
  highlights: string[]
  description: string
  comments: { user: string; rating: number; date: string; content: string }[]
}

const route = useRoute()
const router = useRouter()

const productId = computed(() => (route.params.id as string) || 'mi-15-pro')

const product = computed<Product>(() => {
  const found = shopDataRaw.products.find(p => p.id === productId.value)
  return (found as Product) || (shopDataRaw.products[0] as Product)
})

const selectedColor = ref('')
const selectedSpecIndex = ref(0)
const quantity = ref(1)
const currentImgIndex = ref(0)

// Checkout Payment Modal States
const payModalVisible = ref(false)
const paySuccessDialogVisible = ref(false)
const selectedPayMethod = ref<'wechat' | 'alipay' | 'unionpay' | 'credit'>('wechat')
const isProcessingPay = ref(false)
const generatedOrderId = ref('')

onMounted(() => {
  if (product.value && product.value.colors && product.value.colors.length > 0) {
    selectedColor.value = product.value.colors[0].name
  }
})

const currentSpec = computed(() => {
  return product.value.specs[selectedSpecIndex.value] || product.value.specs[0]
})

const totalPrice = computed(() => {
  return (currentSpec.value.price || product.value.price) * quantity.value
})

const handleBuyNow = () => {
  generatedOrderId.value = 'MI-' + Date.now().toString().slice(-8)
  payModalVisible.value = true
}

const confirmPayment = () => {
  isProcessingPay.value = true
  const payName = {
    wechat: '微信支付',
    alipay: '支付宝',
    unionpay: '云闪付',
    credit: '银联信用卡分期'
  }[selectedPayMethod.value]

  ElMessage.info(`正在通过 [${payName}] 通道安全发起扣款...`)

  setTimeout(() => {
    isProcessingPay.value = false
    payModalVisible.value = false
    paySuccessDialogVisible.value = true

    ElNotification({
      title: '🎉 支付成功通知',
      message: `订单 ${generatedOrderId.value} 已通过 [${payName}] 支付 ￥${totalPrice.value.toFixed(2)}！现已安排发货！`,
      type: 'success',
      duration: 6000
    })
  }, 1500)
}

const addToCart = () => {
  ElMessage.success(`🛒 已成功将 [${product.value.name} - ${selectedColor.value} ${currentSpec.value.name}] 加入购物车！`)
}

const goBackToShop = () => {
  router.push('/xiaomi-shop')
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="product-detail-page">
    <!-- Top Breadcrumb Bar -->
    <div class="breadcrumb-bar">
      <div class="container bar-inner">
        <div class="crumbs">
          <span class="crumb-link" @click="goHome">主页</span>
          <span class="sep">/</span>
          <span class="crumb-link" @click="goBackToShop">小米商城</span>
          <span class="sep">/</span>
          <span class="crumb-current">{{ product.name }}</span>
        </div>
        <el-button size="small" @click="goBackToShop">↩ 返回商城列表</el-button>
      </div>
    </div>

    <!-- Main Detail Section -->
    <main class="container detail-container">
      <!-- Left Gallery -->
      <div class="gallery-column">
        <div class="main-preview">
          <div class="preview-box">
            <span class="mi-watermark">mi</span>
            <span class="p-title-watermark">{{ product.name }}</span>
            <div class="color-badge" :style="{ background: product.colors.find(c => c.name === selectedColor)?.hex || '#ff6700' }">
              已选颜色: {{ selectedColor }}
            </div>
          </div>
        </div>

        <div class="gallery-thumbs" v-if="product.galleryImages">
          <div
            v-for="(img, idx) in product.galleryImages"
            :key="idx"
            class="thumb-item"
            :class="{ active: currentImgIndex === idx }"
            @click="currentImgIndex = idx"
          >
            <span>缩略图 {{ idx + 1 }}</span>
          </div>
        </div>
      </div>

      <!-- Right Spec & Buy Section -->
      <div class="spec-column">
        <h1 class="product-title">{{ product.title }}</h1>
        <p class="product-sub">{{ product.subtitle }}</p>

        <div class="price-banner">
          <div class="p-left">
            <span class="price-symbol">￥</span>
            <span class="price-num">{{ totalPrice }}</span>
            <span class="orig-price" v-if="product.originalPrice > product.price">￥{{ product.originalPrice * quantity }}</span>
            <span class="sale-tag" v-if="product.tag">{{ product.tag }}</span>
          </div>
          <div class="p-right">
            <span>月销 {{ product.sales }}+ 件</span>
            <span class="sep">|</span>
            <span>评分 {{ product.rating }} ★</span>
          </div>
        </div>

        <!-- Highlights List -->
        <div class="highlights-box">
          <h4>🌟 核心亮点</h4>
          <ul>
            <li v-for="(h, i) in product.highlights" :key="i">✓ {{ h }}</li>
          </ul>
        </div>

        <!-- Color Options -->
        <div class="spec-group">
          <label class="group-label">选择颜色</label>
          <div class="chips-row">
            <button
              v-for="c in product.colors"
              :key="c.name"
              class="spec-chip"
              :class="{ active: selectedColor === c.name }"
              @click="selectedColor = c.name"
            >
              <span class="color-dot" :style="{ background: c.hex }"></span>
              {{ c.name }}
            </button>
          </div>
        </div>

        <!-- Capacity / Spec Options -->
        <div class="spec-group">
          <label class="group-label">选择版本 / 容量</label>
          <div class="chips-row">
            <button
              v-for="(s, idx) in product.specs"
              :key="s.name"
              class="spec-chip spec-big"
              :class="{ active: selectedSpecIndex === idx }"
              @click="selectedSpecIndex = idx"
            >
              <span class="s-name">{{ s.name }}</span>
              <span class="s-price">￥{{ s.price }}</span>
            </button>
          </div>
        </div>

        <!-- Quantity Counter -->
        <div class="spec-group">
          <label class="group-label">购买数量</label>
          <el-input-number v-model="quantity" :min="1" :max="10" size="large" />
        </div>

        <!-- Final Action Bar -->
        <div class="action-buttons">
          <el-button type="warning" size="large" plain class="btn-cart" @click="addToCart">
            🛒 加入购物车
          </el-button>
          <el-button type="primary" size="large" class="btn-buy" @click="handleBuyNow">
            💳 立即购买 (调起微信/支付宝支付)
          </el-button>
        </div>
      </div>
    </main>

    <!-- User Reviews & Details Section -->
    <section class="container reviews-section">
      <h3 class="section-heading">💬 用户真实评价与口碑 ({{ product.comments.length }})</h3>
      <div class="reviews-grid">
        <div v-for="(comment, index) in product.comments" :key="index" class="review-card">
          <div class="r-header">
            <strong>{{ comment.user }}</strong>
            <span class="r-rating">{{ '★'.repeat(comment.rating) }}</span>
            <span class="r-date">{{ comment.date }}</span>
          </div>
          <p class="r-content">{{ comment.content }}</p>
        </div>
      </div>
    </section>

    <!-- Interactive Payment Modal -->
    <el-dialog
      v-model="payModalVisible"
      title="收银台 - 确认支付订单"
      width="580px"
      append-to-body
      align-center
    >
      <div class="payment-modal-body">
        <div class="order-summary-card">
          <div class="summary-row">
            <span>订单编号:</span>
            <code>{{ generatedOrderId }}</code>
          </div>
          <div class="summary-row">
            <span>购买商品:</span>
            <strong>{{ product.name }} ({{ selectedColor }} / {{ currentSpec.name }}) x {{ quantity }}</strong>
          </div>
          <div class="summary-row">
            <span>应付总金额:</span>
            <strong class="total-amount">￥{{ totalPrice.toFixed(2) }}</strong>
          </div>
        </div>

        <div class="payment-methods-section">
          <h4>请选择支付通道:</h4>
          <div class="methods-grid">
            <div
              class="pay-method-card"
              :class="{ active: selectedPayMethod === 'wechat' }"
              @click="selectedPayMethod = 'wechat'"
            >
              <span class="icon wechat">🟢</span>
              <div class="info">
                <strong>微信支付</strong>
                <span>微信扫码 / 一键快捷极速扣款</span>
              </div>
            </div>

            <div
              class="pay-method-card"
              :class="{ active: selectedPayMethod === 'alipay' }"
              @click="selectedPayMethod = 'alipay'"
            >
              <span class="icon alipay">🔵</span>
              <div class="info">
                <strong>支付宝</strong>
                <span>支付宝 App 扫码 / 花呗分期</span>
              </div>
            </div>

            <div
              class="pay-method-card"
              :class="{ active: selectedPayMethod === 'unionpay' }"
              @click="selectedPayMethod = 'unionpay'"
            >
              <span class="icon unionpay">🔴</span>
              <div class="info">
                <strong>云闪付 / 银联</strong>
                <span>云闪付扫码 / 银行卡在线支付</span>
              </div>
            </div>

            <div
              class="pay-method-card"
              :class="{ active: selectedPayMethod === 'credit' }"
              @click="selectedPayMethod = 'credit'"
            >
              <span class="icon credit">💳</span>
              <div class="info">
                <strong>信用卡 24 期免息</strong>
                <span>支持招商/建行/工商/中信分期</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Simulated QR Code Display -->
        <div class="qr-code-box">
          <div class="fake-qr-canvas">
            <span class="qr-logo">{{ selectedPayMethod === 'wechat' ? '微信' : selectedPayMethod === 'alipay' ? '支付宝' : '云闪付' }}</span>
            <span class="qr-code-text">📱 [ 模拟 QR Code 二维码 ]</span>
          </div>
          <span class="qr-tip">请打开手机 App 扫描上面二维码或直接点击下方模拟支付完成验证</span>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="payModalVisible = false">取消订单</el-button>
          <el-button
            type="success"
            size="large"
            :loading="isProcessingPay"
            @click="confirmPayment"
          >
            ✅ 模拟已手机完成支付 (扣款 ￥{{ totalPrice }})
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Payment Success Confirmation Dialog -->
    <el-dialog
      v-model="paySuccessDialogVisible"
      title="🎉 交易成功"
      width="460px"
      append-to-body
      align-center
    >
      <div class="pay-success-body">
        <div class="success-icon-circle">✓</div>
        <h3>恭喜！订单支付成功</h3>
        <p>订单号：<code>{{ generatedOrderId }}</code></p>
        <p>支付金额：<strong class="text-orange">￥{{ totalPrice.toFixed(2) }}</strong></p>
        <p class="desc">商品：{{ product.name }} ({{ selectedColor }} / {{ currentSpec.name }}) 已录入仓库并安排优先顺丰速运派发！</p>
      </div>
      <template #footer>
        <el-button type="primary" size="large" @click="goBackToShop">
          返回小米商城列表
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss" src="./css/detail.scss"></style>
