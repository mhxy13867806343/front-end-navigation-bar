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

<style scoped lang="scss" src="./css/CartDrawer.scss"></style>
