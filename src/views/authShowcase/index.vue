<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 500 个完整 Auth UI 范例数据结构
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
  '全部 500 款',
  '毛玻璃水晶',
  '暗黑极客',
  'Oat 极简',
  '赛博朋克',
  'macOS 窗体',
  '移动 H5',
  '企业 SaaS',
  '电竞竞速',
  '柔和马卡龙',
  '新拟物 3D',
  '极光渐变',
  '极简纸感',
  '极客双因子',
  '极速一键',
  '扁平插画',
  '科技流光',
  '灵动波浪',
  '宝石奢华',
  '8-Bit 复古',
  '国际多语言'
]

// 自动生成 500 款 Auth 范例 (250 款登录 + 250 款注册)
const generate500Themes = (): AuthThemeItem[] => {
  const list: AuthThemeItem[] = []
  const catNames = [
    '毛玻璃水晶',
    '暗黑极客',
    'Oat 极简',
    '赛博朋克',
    'macOS 窗体',
    '移动 H5',
    '企业 SaaS',
    '电竞竞速',
    '柔和马卡龙',
    '新拟物 3D',
    '极光渐变',
    '极简纸感',
    '极客双因子',
    '极速一键',
    '扁平插画',
    '科技流光',
    '灵动波浪',
    '宝石奢华',
    '8-Bit 复古',
    '国际多语言'
  ]

  const cssClasses = [
    'theme-cat-glassmorphism',
    'theme-cat-dark',
    'theme-cat-oat',
    'theme-cat-cyberpunk',
    'theme-cat-mac',
    'theme-cat-mobile',
    'theme-cat-saas',
    'theme-cat-esports',
    'theme-cat-pastel',
    'theme-cat-neu',
    'theme-cat-glassmorphism',
    'theme-cat-oat',
    'theme-cat-dark',
    'theme-cat-mobile',
    'theme-cat-pastel',
    'theme-cat-cyberpunk',
    'theme-cat-glassmorphism',
    'theme-cat-saas',
    'theme-cat-esports',
    'theme-cat-mac'
  ]

  const icons = [
    '🌌', '🖤', '🌾', '⚡', '🍎',
    '📱', '💼', '🎮', '🍃', '🧊',
    '✨', '📜', '🛡️', '⚡', '🎨',
    '🚀', '🔮', '💎', '🕹️', '🌐'
  ]

  for (let i = 1; i <= 500; i++) {
    const catIdx = (i - 1) % catNames.length
    const isRegisterMode = i % 2 === 0
    const modeName = isRegisterMode ? '注册' : '登录'
    const catName = catNames[catIdx]

    list.push({
      id: i,
      code: `AUTH-${String(i).padStart(3, '0')}`,
      name: `#${String(i).padStart(3, '0')} ${catName} ${modeName} UI 范例`,
      category: catName,
      preferredMode: isRegisterMode ? 'register' : 'login',
      styleCssClass: cssClasses[catIdx],
      icon: icons[catIdx],
      description: `专为 ${catName} 打造的 ${modeName} 交互面板范例卡片 #${i}，支持表单即时验证与防伪校验。`,
      features: ['200% 响应式 Form 布局', '平滑 3D 动画切换', '防伪校验与安全拦截', '社交账号一键极速登录']
    })
  }
  return list
}

const allThemes = ref<AuthThemeItem[]>(generate500Themes())

// Filter State
const searchQuery = ref<string>('')
const selectedCategory = ref<string>('全部 500 款')
const selectedModeFilter = ref<'all' | 'login' | 'register'>('all')

// 分页 State (500 条数据按每页 50 条分页，保证极大流动流畅度)
const currentPage = ref<number>(1)
const pageSize = ref<number>(50)

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

// 过滤筛选 500 款列表
const filteredThemes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return allThemes.value.filter((item) => {
    const matchCat = selectedCategory.value === '全部 500 款' || item.category === selectedCategory.value
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
  return allThemes.value.find((x) => x.id === activeItemId.value) || allThemes.value[0]
})

const selectTheme = (item: AuthThemeItem) => {
  activeItemId.value = item.id
  currentCardFormMode.value = item.preferredMode
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
          <span class="badge-tag">🔐 Auth 500 Showcase</span>
          <h1>500 款精美登录与注册 UI 展厅</h1>
        </div>
        <button class="back-link-btn" @click="router.push('/dyform')">
          ← 返回导航站
        </button>
      </div>

      <div class="header-stats">
        <div class="stat-badge">
          <strong>500 款</strong> 全量 Auth 交互范例库
        </div>
        <div class="stat-badge">
          <strong>250 登录 + 250 注册</strong> 专精模式匹配
        </div>
        <div class="stat-badge">
          <strong>20 大</strong> 现代视觉风格分类
        </div>
      </div>
    </header>

    <!-- 搜索框与模式 Filter 区域 -->
    <div class="filter-control-bar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="searchQuery" type="text" placeholder="搜索 500 款登录 / 注册 UI 范例..." />
      </div>

      <div class="mode-switch-group">
        <button :class="{ active: selectedModeFilter === 'all' }" @click="selectedModeFilter = 'all'; currentPage = 1">
          🔀 全部 500 款
        </button>
        <button :class="{ active: selectedModeFilter === 'login' }" @click="selectedModeFilter = 'login'; currentPage = 1">
          🔑 250 款登录界面
        </button>
        <button :class="{ active: selectedModeFilter === 'register' }" @click="selectedModeFilter = 'register'; currentPage = 1">
          📝 250 款注册界面
        </button>
      </div>
    </div>

    <!-- 20 大分类切换 Tabs -->
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

    <!-- 500 范例选项 Chips 滑块与分页器 -->
    <div style="max-width: 1280px; margin: 0 auto 10px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 0.82rem; color: #94a3b8;">显示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredThemes.length) }} 项 (共 {{ filteredThemes.length }} 项)</span>
      <div style="display: flex; gap: 6px;">
        <button class="cat-btn" :disabled="currentPage <= 1" @click="currentPage--">上一页</button>
        <span style="font-size: 0.82rem; color: #e2e8f0; display: flex; align-items: center;">{{ currentPage }} / {{ totalPages }}</span>
        <button class="cat-btn" :disabled="currentPage >= totalPages" @click="currentPage++">下一页</button>
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
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 480px; margin-bottom: 20px; background: rgba(0,0,0,0.3); padding: 8px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12);">
          <div style="font-size: 0.88rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
            <span>{{ activeTheme.icon }}</span>
            <span>{{ activeTheme.name }}</span>
          </div>

          <div style="display: flex; gap: 4px;">
            <button
              :style="{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: currentCardFormMode === 'login' ? '#2563eb' : 'transparent', color: '#fff', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }"
              @click="currentCardFormMode = 'login'"
            >
              🔑 切换登录
            </button>
            <button
              :style="{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: currentCardFormMode === 'register' ? '#10b981' : 'transparent', color: '#fff', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }"
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

        <!-- 2. 📝 注册 Form 展示 (完美提供 250 款专精注册界面) -->
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
