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

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'openPayment', amount: number, title: string): void
}>()

const router = useRouter()
const couponCode = ref('')
const discountAmount = ref(0)

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

const closeDrawer = () => {
  emit('update:visible', false)
}

const goToCartPage = () => {
  closeDrawer()
  router.push('/xiaomi-shop/cart')
}

const handleCheckout = () => {
  if (selectedTotalCount.value === 0) {
    ElMessage.warning('请先勾选需要结算的商品！')
    return
  }
  closeDrawer()
  emit('openPayment', finalPayAmount.value, `购物车结算 (${selectedTotalCount.value} 件商品)`)
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="(val: boolean) => emit('update:visible', val)"
    title="🛒 我的购物车"
    direction="rtl"
    size="480px"
    custom-class="xiaomi-cart-drawer"
  >
    <template #header>
      <div class="cart-drawer-header">
        <span class="header-title">🛒 我的购物车</span>
        <span class="header-count">({{ cartTotalCount }} 件商品)</span>
      </div>
    </template>

    <div class="cart-drawer-content">
      <!-- Empty Cart State -->
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h3>您的购物车还是空的哦~</h3>
        <p>快去挑选心仪的小米/Redmi 爆款好物吧！</p>
        <el-button type="primary" class="go-shop-btn" @click="closeDrawer">
          去逛逛商品
        </el-button>
      </div>

      <!-- Cart Item List -->
      <div v-else class="cart-items-wrapper">
        <div class="cart-list-header">
          <el-checkbox v-model="isAllSelected">全选</el-checkbox>
          <button class="clear-btn" @click="clearCartStore">清空购物车</button>
        </div>

        <div class="cart-item-card" v-for="item in cartItems" :key="item.id">
          <el-checkbox
            :model-value="item.selected"
            @change="() => toggleCartSelect(item.id)"
          />
          <div class="item-img-box">
            <div class="fake-img">
              <span class="mi-logo">mi</span>
            </div>
          </div>

          <div class="item-info">
            <div class="item-name" :title="item.name">{{ item.name }}</div>
            <div class="item-spec">{{ item.specName }} | {{ item.colorName }}</div>
            <div class="item-price-row">
              <span class="unit-price">￥{{ item.price }}</span>
              <div class="qty-counter">
                <button class="qty-btn" @click="updateCartQuantity(item.id, -1)">-</button>
                <span class="qty-num">{{ item.quantity }}</span>
                <button class="qty-btn" @click="updateCartQuantity(item.id, 1)">+</button>
              </div>
              <button class="del-btn" title="删除" @click="removeFromCartStore(item.id)">🗑️</button>
            </div>
          </div>
        </div>

        <!-- Coupon redeem code -->
        <div class="coupon-section">
          <el-input
            v-model="couponCode"
            placeholder="输入优惠码 (测试码: MI888)"
            size="small"
          >
            <template #append>
              <el-button size="small" type="primary" @click="applyCoupon">兑换</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <template #footer>
      <div v-if="cartItems.length > 0" class="cart-drawer-footer">
        <div class="summary-info">
          <div class="selected-txt">已选 <strong class="orange-num">{{ selectedTotalCount }}</strong> 件</div>
          <div class="total-price-box">
            <span class="label">合计：</span>
            <span class="price-val">￥{{ finalPayAmount }}</span>
            <span class="free-shipping-tag">全场包邮</span>
          </div>
        </div>
        <div class="drawer-actions">
          <el-button plain @click="goToCartPage">全屏结算页</el-button>
          <el-button type="warning" class="checkout-btn" @click="handleCheckout">
            💳 立即结算 ({{ selectedTotalCount }})
          </el-button>
        </div>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
.cart-drawer-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}
.header-count {
  font-size: 14px;
  color: #6b7280;
}
.cart-drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.empty-cart {
  text-align: center;
  padding: 60px 20px;
}
.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}
.empty-cart h3 {
  font-size: 18px;
  color: #374151;
  margin-bottom: 8px;
}
.empty-cart p {
  color: #9ca3af;
  margin-bottom: 24px;
}
.go-shop-btn {
  background: #ff6700;
  border-color: #ff6700;
}
.cart-items-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cart-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}
.clear-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
}
.clear-btn:hover {
  color: #ef4444;
}
.cart-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #f3f4f6;
}
.item-img-box {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}
.fake-img {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ff6700 0%, #ff8533 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mi-logo {
  color: white;
  font-weight: 900;
  font-size: 18px;
}
.item-info {
  flex: 1;
  min-width: 0;
}
.item-name {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-spec {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
.item-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.unit-price {
  font-weight: 700;
  color: #ff6700;
  font-size: 14px;
}
.qty-counter {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  overflow: hidden;
  background: #ffffff;
}
.qty-btn {
  border: none;
  background: #f3f4f6;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: bold;
}
.qty-num {
  padding: 0 8px;
  font-size: 13px;
  font-weight: 600;
}
.del-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.6;
}
.del-btn:hover {
  opacity: 1;
}
.coupon-section {
  margin-top: 12px;
}
.cart-drawer-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.summary-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.orange-num {
  color: #ff6700;
  font-size: 16px;
}
.total-price-box {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.price-val {
  font-size: 22px;
  font-weight: 800;
  color: #ff6700;
}
.free-shipping-tag {
  font-size: 11px;
  background: #ecfdf5;
  color: #059669;
  padding: 2px 6px;
  border-radius: 4px;
}
.drawer-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 8px;
}
.checkout-btn {
  background: #ff6700;
  border-color: #ff6700;
  font-weight: bold;
}
</style>
