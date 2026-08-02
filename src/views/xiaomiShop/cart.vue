<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  cartItems,
  cartTotalCount,
  selectedTotalCount,
  selectedTotalAmount,
  removeFromCartStore,
  updateCartQuantity,
  clearCartStore,
  toggleCartSelect,
  toggleSelectAll
} from './cartStore'

const router = useRouter()
const couponCode = ref('')
const discountAmount = ref(0)
const selectedAddress = ref('addr-1')
const showPaymentModal = ref(false)
const selectedPayMethod = ref('wechat')
const paySuccess = ref(false)
const isPaying = ref(false)

const addresses = [
  { id: 'addr-1', name: '张三', phone: '138****8888', region: '北京市海淀区', detail: '西二旗中路小米科技园 H 座 808 室', default: true },
  { id: 'addr-2', name: '李四', phone: '139****9999', region: '上海市浦东新区', detail: '张江高科技园区 88 号', default: false }
]

const isAllSelected = computed({
  get: () => cartItems.value.length > 0 && cartItems.value.every(i => i.selected),
  set: (val: boolean) => toggleSelectAll(val)
})

const finalPayAmount = computed(() => {
  const base = selectedTotalAmount.value - discountAmount.value
  return base > 0 ? base : 0
})

const applyCoupon = () => {
  if (couponCode.value.trim().toUpperCase() === 'MI888') {
    discountAmount.value = 50
    ElMessage.success('🎉 成功兑换 [MI888] 米粉专属立减 50 元优惠券！')
  } else if (couponCode.value.trim()) {
    ElMessage.error('无效的优惠券码，试一试 [MI888]')
  }
}

const goToShop = () => {
  router.push('/xiaomi-shop')
}

const handleStartCheckout = () => {
  if (selectedTotalCount.value === 0) {
    ElMessage.warning('请先勾选需要结算的商品！')
    return
  }
  showPaymentModal.value = true
  paySuccess.value = false
}

const confirmPay = () => {
  isPaying.value = true
  setTimeout(() => {
    isPaying.value = false
    paySuccess.value = true
    ElMessage.success('🎉 订单支付成功！感谢您在小米官方商城购物！')
    // Remove paid items from cart
    cartItems.value = cartItems.value.filter(i => !i.selected)
  }, 1500)
}
</script>

<template>
  <div class="xiaomi-cart-page">
    <!-- Header -->
    <header class="cart-header">
      <div class="container header-inner">
        <div class="logo-title" @click="goToShop">
          <div class="mi-logo-square">mi</div>
          <div class="page-title">我的购物车</div>
          <span class="sub-tip">温馨提示：产品是否购买成功，以最终下单为准，请尽快结算</span>
        </div>
        <div class="header-user">
          <span>米粉会员</span>
          <span class="sep">|</span>
          <router-link to="/xiaomi-shop">返回商城</router-link>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="container cart-main">
      <!-- Steps -->
      <div class="steps-bar">
        <div class="step active"><span class="step-num">1</span> 我的购物车</div>
        <div class="step-line"></div>
        <div class="step" :class="{ active: selectedTotalCount > 0 }"><span class="step-num">2</span> 确认订单与地址</div>
        <div class="step-line"></div>
        <div class="step" :class="{ active: showPaymentModal }"><span class="step-num">3</span> 调起收银台支付</div>
      </div>

      <!-- Empty Cart View -->
      <div v-if="cartItems.length === 0" class="empty-cart-box">
        <div class="empty-img">🛒</div>
        <div class="empty-info">
          <h2>您的购物车还是空的！</h2>
          <p>成功登录后将显示您之前加入的商品</p>
          <el-button type="warning" size="large" class="shop-now-btn" @click="goToShop">
            马上去购物
          </el-button>
        </div>
      </div>

      <!-- Cart Content View -->
      <div v-else class="cart-table-wrapper">
        <!-- Address Selector -->
        <div class="address-section">
          <h3 class="section-title">📍 收货地址确认</h3>
          <div class="address-grid">
            <div
              v-for="addr in addresses"
              :key="addr.id"
              class="address-card"
              :class="{ active: selectedAddress === addr.id }"
              @click="selectedAddress = addr.id"
            >
              <div class="addr-head">
                <span class="addr-name">{{ addr.name }}</span>
                <span class="addr-phone">{{ addr.phone }}</span>
                <span v-if="addr.default" class="addr-tag">默认</span>
              </div>
              <div class="addr-body">
                {{ addr.region }} {{ addr.detail }}
              </div>
            </div>
          </div>
        </div>

        <!-- Product Table -->
        <div class="table-card">
          <div class="table-header">
            <div class="col col-check">
              <el-checkbox v-model="isAllSelected">全选</el-checkbox>
            </div>
            <div class="col col-img">商品图片</div>
            <div class="col col-name">商品名称与规格</div>
            <div class="col col-price">单价</div>
            <div class="col col-num">数量</div>
            <div class="col col-total">小计</div>
            <div class="col col-action">操作</div>
          </div>

          <div class="table-body">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="table-row"
              :class="{ selected: item.selected }"
            >
              <div class="col col-check">
                <el-checkbox
                  :model-value="item.selected"
                  @change="() => toggleCartSelect(item.id)"
                />
              </div>
              <div class="col col-img">
                <div class="fake-thumb">mi</div>
              </div>
              <div class="col col-name">
                <div class="name-txt">{{ item.name }}</div>
                <div class="spec-txt">{{ item.specName }} | {{ item.colorName }}</div>
              </div>
              <div class="col col-price">￥{{ item.price }}</div>
              <div class="col col-num">
                <div class="qty-group">
                  <button class="qty-btn" @click="updateCartQuantity(item.id, -1)">-</button>
                  <span class="qty-val">{{ item.quantity }}</span>
                  <button class="qty-btn" @click="updateCartQuantity(item.id, 1)">+</button>
                </div>
              </div>
              <div class="col col-total">￥{{ item.price * item.quantity }}</div>
              <div class="col col-action">
                <button class="row-del-btn" @click="removeFromCartStore(item.id)">删除</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Coupon & Summary Bar -->
        <div class="cart-bar">
          <div class="bar-left">
            <button class="link-btn" @click="goToShop">继续购物</button>
            <span class="sep">|</span>
            <button class="link-btn" @click="clearCartStore">清空购物车</button>
            <span class="sep">|</span>
            <div class="coupon-box">
              <el-input v-model="couponCode" placeholder="优惠券码 (测试码: MI888)" size="small" style="width: 220px;">
                <template #append>
                  <el-button type="primary" size="small" @click="applyCoupon">兑换</el-button>
                </template>
              </el-input>
            </div>
          </div>

          <div class="bar-right">
            <div class="total-count-desc">
              已选择 <span class="num">{{ selectedTotalCount }}</span> 件商品
            </div>
            <div class="total-price-desc">
              合计：<span class="price">￥{{ finalPayAmount }}</span>
            </div>
            <el-button
              type="warning"
              size="large"
              class="checkout-submit-btn"
              :disabled="selectedTotalCount === 0"
              @click="handleStartCheckout"
            >
              去结算 ({{ selectedTotalCount }})
            </el-button>
          </div>
        </div>
      </div>
    </main>

    <!-- Payment Checkout Modal -->
    <el-dialog
      v-model="showPaymentModal"
      title="🧡 小米官方收银台"
      width="540px"
      align-center
    >
      <div v-if="!paySuccess" class="payment-modal-body">
        <div class="pay-amount-box">
          <span class="label">应付总金额</span>
          <span class="val">￥{{ finalPayAmount }}</span>
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
          {{ isPaying ? '正在向银行发起扣款...' : `模拟已完成付款 ￥${finalPayAmount}` }}
        </el-button>
      </div>

      <div v-else class="pay-success-box">
        <div class="success-icon">🎉</div>
        <h2>支付成功！</h2>
        <p>订单已成功推送到小米物流仓库，预计明日顺丰发货！</p>
        <el-button type="primary" @click="goToShop">返回小米商城首页</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss" src="./css/cart.scss"></style>
