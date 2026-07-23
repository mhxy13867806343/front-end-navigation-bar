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

<style scoped lang="scss">
.error-container {
  max-width: 980px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeIn 0.4s ease-out;
}

.visual-hero {
  position: relative;
  margin-bottom: 20px;

  .vip-diamond {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.05) 100%);
    border: 2px solid rgba(245, 158, 11, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    position: relative;

    .diamond-icon {
      font-size: 54px;
      animation: bounceFloat 2.5s infinite ease-in-out;
    }

    .glow-halo {
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      box-shadow: 0 0 35px rgba(245, 158, 11, 0.4);
    }
  }

  .error-code {
    font-size: 88px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 4px;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
  }
}

.error-info {
  width: 100%;

  .error-title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 10px;
    color: #f8fafc;
  }

  .error-desc {
    font-size: 15px;
    color: #94a3b8;
    max-width: 680px;
    margin: 0 auto 24px;
    line-height: 1.6;
  }

  .balance-card {
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 12px;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    gap: 16px;
    flex-wrap: wrap;

    .balance-left {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;

      .balance-amount {
        font-size: 20px;
        color: #fbbf24;
      }
    }
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
    margin-bottom: 32px;

    .pricing-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px 20px;
      text-align: left;
      cursor: pointer;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-4px);
        border-color: rgba(245, 158, 11, 0.4);
      }

      &.active {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.08);
        box-shadow: 0 8px 24px rgba(245, 158, 11, 0.2);
      }

      &.popular {
        border-color: rgba(245, 158, 11, 0.6);
      }

      .popular-badge {
        position: absolute;
        top: -12px;
        right: 20px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 10px;
        border-radius: 10px;
      }

      .tier-name {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 8px;
        color: #f8fafc;
      }

      .tier-price {
        font-size: 24px;
        font-weight: 800;
        color: #fbbf24;
        margin-bottom: 8px;
      }

      .tier-desc {
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 16px;
      }

      .feature-list {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 13px;
        color: #cbd5e1;

        li {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;

          .check {
            color: #10b981;
            font-weight: bold;
          }
        }
      }
    }
  }

  .action-btn-group {
    display: flex;
    gap: 14px;
    justify-content: center;

    .pay-btn {
      font-weight: 700;
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.35);
    }
  }
}

.pay-dialog-content {
  text-align: center;

  .checkout-summary {
    background: rgba(0, 0, 0, 0.2);
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: left;
    line-height: 1.8;

    .highlight {
      color: #f59e0b;
      font-weight: bold;
      font-size: 18px;
    }
  }

  .fake-qr {
    width: 180px;
    height: 180px;
    margin: 0 auto 12px;
    border: 2px dashed #f59e0b;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #fbbf24;
    background: rgba(245, 158, 11, 0.05);
  }
}

@keyframes bounceFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(5deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
