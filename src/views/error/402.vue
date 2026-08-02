<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ErrorLayout from './ErrorLayout.vue'

const router = useRouter()

const userBalance = ref(0.00)
const selectedTier = ref('pro')
const couponCode = ref('')
const checkoutDialogVisible = ref(false)

const tiers = [
  { id: 'starter', name: '标准版 (Starter)', price: '￥29 / 月', desc: '适合个人开发者使用', features: ['基础组件库访问', '基础 API 额度 (1万次/日)', '社区支持'] },
  { id: 'pro', name: '专业版 (Pro VIP)', price: '￥99 / 月', popular: true, desc: '解锁高级特权与大屏视图', features: ['解锁全部 API 接口', '专属高级动态表单', '无限次大屏模型渲染', '7x24 技术专家指导'] },
  { id: 'enterprise', name: '企业旗舰 (Enterprise)', price: '￥499 / 月', desc: '全功能定制与无限并发', features: ['独享专属计算集群', 'SLA 99.99% 服务保障', '支持自定义微前端集成', '一对一定制化方案交付'] }
]

const applyCoupon = () => {
  if (couponCode.value.trim().toUpperCase() === 'VIP888') {
    ElMessage.success('🎉 优惠券兑换成功！赠送 ￥100 免费体验额度！')
    userBalance.value += 100.00
    couponCode.value = ''
  } else {
    ElMessage.error('无效或过期的优惠券码！可试用口令：VIP888')
  }
}

const handlePay = () => {
  checkoutDialogVisible.value = true
}

const confirmPay = () => {
  ElMessage.success('💳 支付成功！已为您开通专业版 VIP 会员服务！')
  userBalance.value += 999.00
  checkoutDialogVisible.value = false
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <ErrorLayout>
    <div class="error-container">
      <div class="visual-hero">
        <div class="vip-diamond">
          <span class="diamond-icon">💎</span>
          <div class="glow-halo"></div>
        </div>
        <div class="error-code">402</div>
      </div>

      <div class="error-info">
        <h1 class="error-title">HTTP 402 Payment Required / 需付费订阅访问</h1>
        <p class="error-desc">
          您当前正在尝试访问专属高级功能或配额超限 API。该服务属于 VIP 付费专区，请升级套餐或充值账户。
        </p>

        <!-- Balance and Coupon Bar -->
        <div class="balance-card">
          <div class="balance-left">
            <span>当前账户余额:</span>
            <strong class="balance-amount">￥{{ userBalance.toFixed(2) }}</strong>
            <el-tag type="danger" size="small" effect="dark" v-if="userBalance <= 0">欠费 / 配额消耗殆尽</el-tag>
            <el-tag type="success" size="small" effect="dark" v-else>余额充足</el-tag>
          </div>
          <div class="coupon-right">
            <el-input v-model="couponCode" placeholder="试用口令：VIP888" size="small" style="width: 170px;">
              <template #append>
                <el-button @click="applyCoupon">兑换</el-button>
              </template>
            </el-input>
          </div>
        </div>

        <!-- Pricing Cards -->
        <div class="pricing-grid">
          <div
            v-for="tier in tiers"
            :key="tier.id"
            class="pricing-card"
            :class="{ active: selectedTier === tier.id, popular: tier.popular }"
            @click="selectedTier = tier.id"
          >
            <div v-if="tier.popular" class="popular-badge">最受青睐</div>
            <h3 class="tier-name">{{ tier.name }}</h3>
            <div class="tier-price">{{ tier.price }}</div>
            <p class="tier-desc">{{ tier.desc }}</p>

            <ul class="feature-list">
              <li v-for="feat in tier.features" :key="feat">
                <span class="check">✓</span> {{ feat }}
              </li>
            </ul>
          </div>
        </div>

        <div class="action-btn-group">
          <el-button type="warning" size="large" class="pay-btn" @click="handlePay">
            💳 立即充值开通 VIP 权益
          </el-button>
          <el-button size="large" plain @click="goHome">
            🏠 返回首页
          </el-button>
        </div>
      </div>

      <!-- Pay Dialog -->
      <el-dialog v-model="checkoutDialogVisible" title="收银台 - 确认支付" width="460px" append-to-body align-center>
        <div class="pay-dialog-content">
          <div class="checkout-summary">
            <p><strong>订阅套餐:</strong> {{ tiers.find(t => t.id === selectedTier)?.name }}</p>
            <p><strong>应付金额:</strong> <span class="highlight">{{ tiers.find(t => t.id === selectedTier)?.price }}</span></p>
            <p><strong>支付方式:</strong> 微信 / 支付宝 / 聚合收银</p>
          </div>
          <div class="qr-placeholder">
            <div class="fake-qr">📱 [ 模拟收银二维码 ]</div>
            <span>请使用移动端扫描或直接点击下方按钮完成收银</span>
          </div>
        </div>
        <template #footer>
          <el-button @click="checkoutDialogVisible = false">取消</el-button>
          <el-button type="success" size="large" @click="confirmPay">完成模拟支付</el-button>
        </template>
      </el-dialog>
    </div>
  </ErrorLayout>
</template>

<style scoped lang="scss" src="./css/402.scss"></style>
