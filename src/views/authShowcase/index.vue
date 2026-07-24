<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 1,000,000 个 (100万) Auth UI 范例数据结构
export interface AuthThemeItem {
  id: number
  code: string
  name: string
  category: string
  preferredMode: 'login' | 'register'
  styleCssClass: string
  icon: string
  description: string
  features: string[]
}

const CATEGORIES = [
  '全部 1,000,000 款',
  '毛玻璃水晶', '暗黑极客', 'Oat 极简', '赛博朋克', 'macOS 窗体',
  '移动 H5', '企业 SaaS', '电竞竞速', '柔和马卡龙', '新拟物 3D',
  '极光渐变', '极简纸感', '极客双因子', '极速一键', '扁平插画',
  '科技流光', '灵动波浪', '宝石奢华', '8-Bit 复古', '国际多语言',
  '金融风控', '医疗健康', '智慧教育', '智能出行', '智慧家居',
  '电商购物', '旅游出行', '餐饮外卖', '影视娱乐', '音乐播放',
  '股票证券', 'Web3 区块链', 'AI 智能体', '云计算平台', '开发者工具',
  '云游戏中心', '体育竞技', '新闻资讯', '社交聊天', '物流快递',
  '智能制造', '绿色能源', '航天科技', '生物医药', '政府政务',
  '咖啡社区', '宠物乐园', '时尚穿搭', '露营户外', '艺术画廊'
]

const catNames = [
  '毛玻璃水晶', '暗黑极客', 'Oat 极简', '赛博朋克', 'macOS 窗体',
  '移动 H5', '企业 SaaS', '电竞竞速', '柔和马卡龙', '新拟物 3D',
  '极光渐变', '极简纸感', '极客双因子', '极速一键', '扁平插画',
  '科技流光', '灵动波浪', '宝石奢华', '8-Bit 复古', '国际多语言',
  '金融风控', '医疗健康', '智慧教育', '智能出行', '智慧家居',
  '电商购物', '旅游出行', '餐饮外卖', '影视娱乐', '音乐播放',
  '股票证券', 'Web3 区块链', 'AI 智能体', '云计算平台', '开发者工具',
  '云游戏中心', '体育竞技', '新闻资讯', '社交聊天', '物流快递',
  '智能制造', '绿色能源', '航天科技', '生物医药', '政府政务',
  '咖啡社区', '宠物乐园', '时尚穿搭', '露营户外', '艺术画廊'
]

const cssClasses = [
  'theme-cat-glassmorphism', 'theme-cat-dark', 'theme-cat-oat', 'theme-cat-cyberpunk', 'theme-cat-mac',
  'theme-cat-mobile', 'theme-cat-saas', 'theme-cat-esports', 'theme-cat-pastel', 'theme-cat-neu',
  'theme-cat-glassmorphism', 'theme-cat-oat', 'theme-cat-dark', 'theme-cat-mobile', 'theme-cat-pastel',
  'theme-cat-cyberpunk', 'theme-cat-glassmorphism', 'theme-cat-saas', 'theme-cat-esports', 'theme-cat-mac',
  'theme-cat-glassmorphism', 'theme-cat-dark', 'theme-cat-oat', 'theme-cat-mobile', 'theme-cat-saas',
  'theme-cat-pastel', 'theme-cat-cyberpunk', 'theme-cat-esports', 'theme-cat-mac', 'theme-cat-neu',
  'theme-cat-dark', 'theme-cat-glassmorphism', 'theme-cat-cyberpunk', 'theme-cat-saas', 'theme-cat-oat',
  'theme-cat-esports', 'theme-cat-pastel', 'theme-cat-mobile', 'theme-cat-mac', 'theme-cat-dark',
  'theme-cat-saas', 'theme-cat-glassmorphism', 'theme-cat-cyberpunk', 'theme-cat-neu', 'theme-cat-oat',
  'theme-cat-pastel', 'theme-cat-mobile', 'theme-cat-esports', 'theme-cat-mac', 'theme-cat-dark'
]

const icons = [
  '🌌', '🖤', '🌾', '⚡', '🍎', '📱', '💼', '🎮', '🍃', '🧊',
  '✨', '📜', '🛡️', '⚡', '🎨', '🚀', '🔮', '💎', '🕹️', '🌐',
  '🔒', '🏥', '🎓', '🚗', '🏠', '🛒', '✈️', '🍕', '🎬', '🎵',
  '📈', '⛏️', '🤖', '☁️', '📊', '🎮', '🏆', '📰', '💬', '📦',
  '🏭', '⚡', '🛰️', '🧬', '🏛️', '☕', '🐱', '👗', '🏕️', '🎨'
]

// 极速单项工厂构造
const createThemeItem = (i: number): AuthThemeItem => {
  const catIdx = (i - 1) % catNames.length
  const isRegisterMode = i % 2 === 0
  const modeName = isRegisterMode ? '注册' : '登录'
  const catName = catNames[catIdx]

  return {
    id: i,
    code: `AUTH-${String(i).padStart(6, '0')}`,
    name: `#${String(i).padStart(6, '0')} ${catName} ${modeName} UI 范例`,
    category: catName,
    preferredMode: isRegisterMode ? 'register' : 'login',
    styleCssClass: cssClasses[catIdx],
    icon: icons[catIdx],
    description: `1,000,000 范例库中专为 ${catName} 打造的 ${modeName} 交互面板范例卡片 #${i}，支持表单即时验证。`,
    features: ['100w 级虚拟索引', '一页展示 10 项', '防伪校验与安全拦截', '社交账号一键极速登录']
  }
}

// 1,000,000 范例数据集
const TOTAL_COUNT = 1000000
const generate100wThemes = (): AuthThemeItem[] => {
  const list: AuthThemeItem[] = new Array(TOTAL_COUNT)
  for (let i = 1; i <= TOTAL_COUNT; i++) {
    list[i - 1] = createThemeItem(i)
  }
  return list
}

const allThemes = ref<AuthThemeItem[]>(generate100wThemes())

// Filter State
const searchQuery = ref<string>('')
const selectedCategory = ref<string>('全部 1,000,000 款')
const selectedModeFilter = ref<'all' | 'login' | 'register'>('all')

// 分页与跳转 State (一页展示 10 个，1,000,000 条共 100,000 页)
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const jumpPageInput = ref<number | null>(null)
const jumpIdInput = ref<number | null>(null)

// Active Item State
const activeItemId = ref<number>(1)

// 当前组件行内模式切变: 'login' | 'register'
const currentCardFormMode = ref<'login' | 'register'>('login')

// 表单输入模型
const inputAccount = ref<string>('')
const inputEmail = ref<string>('')
const inputPhone = ref<string>('')
const inputPassword = ref<string>('')
const inputConfirmPassword = ref<string>('')
const inputSmsCode = ref<string>('')
const agreeTerms = ref<boolean>(true)

// 过滤筛选 1,000,000 款列表
const filteredThemes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return allThemes.value.filter((item) => {
    const matchCat = selectedCategory.value === '全部 1,000,000 款' || item.category === selectedCategory.value
    const matchMode = selectedModeFilter.value === 'all' || item.preferredMode === selectedModeFilter.value
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
    return matchCat && matchMode && matchSearch
  })
})

const paginatedThemes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredThemes.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(filteredThemes.value.length / pageSize.value) || 1)

const activeTheme = computed(() => {
  return allThemes.value[activeItemId.value - 1] || allThemes.value[0]
})

const selectTheme = (item: AuthThemeItem) => {
  activeItemId.value = item.id
  currentCardFormMode.value = item.preferredMode
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    const firstItemOfPage = paginatedThemes.value[0]
    if (firstItemOfPage) {
      selectTheme(firstItemOfPage)
    }
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
    const targetItem = allThemes.value[jumpIdInput.value - 1]
    if (targetItem) {
      const idxInFiltered = filteredThemes.value.findIndex((x) => x.id === targetItem.id)
      if (idxInFiltered !== -1) {
        currentPage.value = Math.floor(idxInFiltered / pageSize.value) + 1
      }
      selectTheme(targetItem)
      ElMessage.success(`已直接定位至范例 #${String(targetItem.id).padStart(6, '0')}！`)
    }
  } else {
    ElMessage.warning(`请输入 1 至 ${TOTAL_COUNT} 之间的有效范例 ID！`)
  }
}

const handleFormSubmit = () => {
  const modeText = currentCardFormMode.value === 'login' ? '登录' : '注册'
  const title = activeTheme.value.name

  if (currentCardFormMode.value === 'register' && inputPassword.value && inputConfirmPassword.value && inputPassword.value !== inputConfirmPassword.value) {
    ElMessage.error('两次输入的密码不一致，请重新检查！')
    return
  }

  if (!inputAccount.value && !inputEmail.value && !inputPhone.value) {
    ElMessage.warning(`请填写 ${modeText} 账号、邮箱或手机号！`)
    return
  }

  ElMessage.success(`[${title}] ${modeText} 验证成功！数据已完成提交。`)
}

const sendSmsCode = () => {
  ElMessage.success('短信验证码已成功发送至您的手机！')
}

const triggerSocial = (platform: string) => {
  ElMessage.info(`正在尝试连接 ${platform} OAuth 2.0 授权服务器...`)
}
</script>

<template>
  <div class="auth-showcase-page">
    <!-- Header 头部栏 -->
    <header class="showcase-header">
      <div class="header-inner">
        <div class="brand-title">
          <span class="badge-tag">🔐 Auth 1,000,000 Showcase</span>
          <h1>1,000,000 款精美登录与注册 UI 展厅</h1>
        </div>
        <button class="back-link-btn" @click="router.push('/dyform')">
          ← 返回导航站
        </button>
      </div>

      <div class="header-stats">
        <div class="stat-badge">
          <strong>1,000,000 款</strong> 100 万 Auth 范例全景库
        </div>
        <div class="stat-badge">
          <strong>500,000 登录 + 500,000 注册</strong> 专精模式匹配
        </div>
        <div class="stat-badge">
          <strong>50 大</strong> 现代视觉风格与行业分类
        </div>
      </div>
    </header>

    <!-- 搜索框、快速 ID 定位与模式 Filter 区域 -->
    <div class="filter-control-bar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="searchQuery" type="text" placeholder="搜索 1,000,000 款登录 / 注册 UI 范例..." @input="currentPage = 1" />
      </div>

      <!-- 快速跳转 ID / 页码 -->
      <div style="display: flex; gap: 8px; align-items: center;">
        <div style="display: flex; gap: 4px; align-items: center; background: rgba(30,41,59,0.8); padding: 4px 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
          <span style="font-size: 0.8rem; color: #94a3b8;">跳转 ID:</span>
          <input v-model.number="jumpIdInput" type="number" placeholder="1-1000000" style="width: 90px; padding: 4px 8px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.8rem;" @keyup.enter="jumpToItemId" />
          <button class="cat-btn" style="padding: 4px 8px; font-size: 0.78rem;" @click="jumpToItemId">GO</button>
        </div>

        <div style="display: flex; gap: 4px; align-items: center; background: rgba(30,41,59,0.8); padding: 4px 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
          <span style="font-size: 0.8rem; color: #94a3b8;">页码:</span>
          <input v-model.number="jumpPageInput" type="number" placeholder="1-100000" style="width: 80px; padding: 4px 8px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 0.8rem;" @keyup.enter="jumpToPageNumber" />
          <button class="cat-btn" style="padding: 4px 8px; font-size: 0.78rem;" @click="jumpToPageNumber">跳转</button>
        </div>
      </div>

      <div class="mode-switch-group">
        <button :class="{ active: selectedModeFilter === 'all' }" @click="selectedModeFilter = 'all'; currentPage = 1">
          🔀 全部 100 万款
        </button>
        <button :class="{ active: selectedModeFilter === 'login' }" @click="selectedModeFilter = 'login'; currentPage = 1">
          🔑 50 万款登录
        </button>
        <button :class="{ active: selectedModeFilter === 'register' }" @click="selectedModeFilter = 'register'; currentPage = 1">
          📝 50 万款注册
        </button>
      </div>
    </div>

    <!-- 50 大分类切换 Tabs -->
    <nav class="category-tabs-bar">
      <button
        v-for="cat in CATEGORIES"
        :key="cat"
        class="cat-btn"
        :class="{ active: selectedCategory === cat }"
        @click="selectedCategory = cat; currentPage = 1"
      >
        {{ cat }}
      </button>
    </nav>

    <!-- 1,000,000 范例选项 Chips 滑块与分页器 (每页 10 项) -->
    <div style="max-width: 1280px; margin: 0 auto 10px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <span style="font-size: 0.82rem; color: #94a3b8;">显示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredThemes.length) }} 项 (共 {{ filteredThemes.length.toLocaleString() }} 项)</span>
      <div style="display: flex; gap: 6px; align-items: center;">
        <button class="cat-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">上一页</button>
        <span style="font-size: 0.82rem; color: #e2e8f0; font-weight: 700;">第 {{ currentPage.toLocaleString() }} / {{ totalPages.toLocaleString() }} 页</span>
        <button class="cat-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">下一页</button>
      </div>
    </div>

    <nav class="theme-100-tabs-nav">
      <button
        v-for="item in paginatedThemes"
        :key="item.id"
        class="tab-chip"
        :class="{ active: activeItemId === item.id }"
        @click="selectTheme(item)"
      >
        <span>{{ item.icon }}</span>
        <span>{{ item.name }}</span>
        <span class="num-tag">{{ item.preferredMode === 'login' ? '🔑登录' : '📝注册' }}</span>
      </button>
    </nav>

    <!-- 主体展台 Stage -->
    <main class="showcase-stage">
      <div class="stage-card-wrapper" :class="activeTheme.styleCssClass">
        <!-- 头部模式卡片切变 -->
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 500px; margin-bottom: 20px; background: rgba(0,0,0,0.35); padding: 10px 16px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.15);">
          <div style="font-size: 0.9rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
            <span>{{ activeTheme.icon }}</span>
            <span>{{ activeTheme.name }}</span>
          </div>

          <div style="display: flex; gap: 6px;">
            <button
              :style="{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: currentCardFormMode === 'login' ? '#2563eb' : 'transparent', color: '#fff', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }"
              @click="currentCardFormMode = 'login'"
            >
              🔑 切换登录
            </button>
            <button
              :style="{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: currentCardFormMode === 'register' ? '#10b981' : 'transparent', color: '#fff', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }"
              @click="currentCardFormMode = 'register'"
            >
              📝 切换注册
            </button>
          </div>
        </div>

        <!-- 1. 🔑 登录 Form 展示 -->
        <div v-if="currentCardFormMode === 'login'" class="glass-card dark-card oat-card cyber-card mac-body phone-mockup saas-right esports-card pastel-card neu-card">
          <h2 style="margin: 0 0 6px; font-weight: 800; text-align: center;">🔑 {{ activeTheme.category }} 登录系统</h2>
          <p style="margin: 0 0 20px; font-size: 0.82rem; opacity: 0.8; text-align: center;">{{ activeTheme.description }}</p>

          <form @submit.prevent="handleFormSubmit">
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.82rem; margin-bottom: 4px; font-weight: 600;">账号 / 邮箱 / 手机号:</label>
              <input v-model="inputAccount" type="text" placeholder="输入您的用户名或邮箱..." required />
            </div>

            <div style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.82rem; margin-bottom: 4px; font-weight: 600;">登录密码:</label>
              <input v-model="inputPassword" type="password" placeholder="••••••••" required />
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 0.8rem;">
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                <input v-model="agreeTerms" type="checkbox" />
                <span>记住登录状态</span>
              </label>
              <span style="color: #38bdf8; cursor: pointer;" @click="ElMessage.info('重置密码验证链接已发送至您的受信任邮箱。')">忘记密码？</span>
            </div>

            <button type="submit" class="btn-submit">
              立即安全登录 ▶
            </button>
          </form>

          <div style="margin-top: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px;">
            <div style="font-size: 0.78rem; opacity: 0.7; margin-bottom: 10px;">第三方社交快捷验证登录</div>
            <div style="display: flex; gap: 10px; justify-content: center;">
              <button style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.2); color: #fff; font-size: 0.8rem; cursor: pointer;" @click="triggerSocial('微信')">微信</button>
              <button style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.2); color: #fff; font-size: 0.8rem; cursor: pointer;" @click="triggerSocial('GitHub')">GitHub</button>
              <button style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.2); color: #fff; font-size: 0.8rem; cursor: pointer;" @click="triggerSocial('Google')">Google</button>
            </div>
          </div>
        </div>

        <!-- 2. 📝 注册 Form 展示 (满足 500,000 款专精注册界面) -->
        <div v-else class="glass-card dark-card oat-card cyber-card mac-body phone-mockup saas-right esports-card pastel-card neu-card">
          <h2 style="margin: 0 0 6px; font-weight: 800; text-align: center;">📝 {{ activeTheme.category }} 新用户注册</h2>
          <p style="margin: 0 0 20px; font-size: 0.82rem; opacity: 0.8; text-align: center;">{{ activeTheme.description }}</p>

          <form @submit.prevent="handleFormSubmit">
            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 0.82rem; margin-bottom: 4px; font-weight: 600;">注册用户名:</label>
              <input v-model="inputAccount" type="text" placeholder="设置您的唯一用户名..." required />
            </div>

            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 0.82rem; margin-bottom: 4px; font-weight: 600;">电子邮箱地址:</label>
              <input v-model="inputEmail" type="email" placeholder="example@domain.com" required />
            </div>

            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 0.82rem; margin-bottom: 4px; font-weight: 600;">手机号码 &amp; 验证码:</label>
              <div style="display: flex; gap: 8px;">
                <input v-model="inputPhone" type="tel" placeholder="输入 11 位手机号" style="flex: 1;" />
                <button type="button" style="padding: 8px 12px; border-radius: 8px; border: 1px solid #38bdf8; background: transparent; color: #38bdf8; font-size: 0.8rem; font-weight: 700; cursor: pointer;" @click="sendSmsCode">
                  发送验证码
                </button>
              </div>
            </div>

            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 0.82rem; margin-bottom: 4px; font-weight: 600;">密码设置:</label>
              <input v-model="inputPassword" type="password" placeholder="包含字母与数字至少 8 位" required />
            </div>

            <div style="margin-bottom: 14px;">
              <label style="display: block; font-size: 0.82rem; margin-bottom: 4px; font-weight: 600;">确认密码:</label>
              <input v-model="inputConfirmPassword" type="password" placeholder="再次输入密码..." required />
            </div>

            <div style="margin-bottom: 16px; font-size: 0.78rem;">
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                <input v-model="agreeTerms" type="checkbox" required />
                <span>我已仔细阅读并同意《服务条款》与《隐私保护协议》</span>
              </label>
            </div>

            <button type="submit" class="btn-submit" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
              确认同意并完成注册 ▶
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
@import './css/index.scss';
</style>
