<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 10 大主题数据定义
interface AuthThemeItem {
  id: number
  key: string
  name: string
  icon: string
  desc: string
}

const THEME_TABS: AuthThemeItem[] = [
  { id: 1, key: 'glassmorphism', name: '毛玻璃水晶', icon: '🌌', desc: 'Glassmorphism 高斯模糊霓虹微光风格' },
  { id: 2, key: 'moderndark', name: '极简暗黑版', icon: '🖤', desc: 'Modern Dark 极简深色专业暗黑界面' },
  { id: 3, key: 'oatminimal', name: 'Oat UI 极简风', icon: '🌾', desc: 'Oat.ink 0 依赖纯净白卡片极简 UI' },
  { id: 4, key: 'cyberpunk', name: '赛博朋克霓虹', icon: '⚡', desc: 'Cyberpunk 亮青与玫红强对比赛博光彩' },
  { id: 5, key: 'macfrost', name: 'macOS 磨砂窗', icon: '🍎', desc: 'macOS Tahoe 窗口控件与柔光模糊' },
  { id: 6, key: 'mobileh5', name: '移动 H5 微卡', icon: '📱', desc: 'H5 手机框架验证码极速登录' },
  { id: 7, key: 'b2bsaas', name: '企业 B2B SaaS', icon: '💼', desc: 'SaaS 双栏品牌插画与企业 SSO 登录' },
  { id: 8, key: 'esports', name: '电竞竞速极光', icon: '🎮', desc: 'Gaming 炫紫渐变与电竞游戏风' },
  { id: 9, key: 'pastel', name: '柔和马卡龙', icon: '🍃', desc: 'Pastel 温馨柔和圆角马卡龙配色' },
  { id: 10, key: 'neumorphism', name: '新拟物化 3D', icon: '🧊', desc: 'Neumorphism 质感浮雕与凹凸触感 3D' }
]

const activeTabKey = ref<string>('glassmorphism')

// Form Mode: 'login' | 'register'
const formMode = ref<'login' | 'register'>('login')

// 表单输入 State
const username = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const smsCode = ref<string>('')
const rememberMe = ref<boolean>(true)

const handleSubmit = (themeName: string) => {
  const modeText = formMode.value === 'login' ? '登录' : '注册'
  if (!username.value && !email.value) {
    ElMessage.warning(`请填写 ${modeText} 账号名称或邮箱！`)
    return
  }
  ElMessage.success(`[${themeName}] ${modeText} 提交成功！欢迎体验。`)
}

const handleSocialLogin = (platform: string) => {
  ElMessage.info(`正在准备拉起 ${platform} 快捷授权登录...`)
}
</script>

<template>
  <div class="auth-showcase-page">
    <!-- Header 头部栏 -->
    <header class="showcase-header">
      <div class="header-inner">
        <div class="brand-title">
          <span class="badge-tag">🔐 Auth UI Showcase</span>
          <h1>10 款精美登录注册 UI 展厅</h1>
        </div>
        <button class="back-link-btn" @click="router.push('/dyform')">
          ← 返回导航站
        </button>
      </div>
    </header>

    <!-- 10 Tabs 切换导航栏 -->
    <nav class="theme-tabs-nav">
      <button
        v-for="tab in THEME_TABS"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTabKey === tab.key }"
        @click="activeTabKey = tab.key"
      >
        <span>{{ tab.icon }}</span>
        <span>{{ tab.name }}</span>
      </button>
    </nav>

    <!-- 主体展台 Stage -->
    <main class="showcase-stage">
      <div class="theme-card-wrapper" :class="`theme-${activeTabKey}`">
        <!-- -------------------------------------------------------------- -->
        <!-- Theme 1: 🌌 Glassmorphism 毛玻璃水晶 -->
        <!-- -------------------------------------------------------------- -->
        <div v-if="activeTabKey === 'glassmorphism'" class="glass-card">
          <h2 style="margin: 0 0 8px; font-weight: 800; text-align: center;">🌌 Glassmorphism Auth</h2>
          <p style="margin: 0 0 20px; font-size: 0.85rem; color: #cbd5e1; text-align: center;">水晶高斯模糊与霓虹渐变</p>

          <div class="mode-toggle">
            <button :class="{ active: formMode === 'login' }" @click="formMode = 'login'">登录 Login</button>
            <button :class="{ active: formMode === 'register' }" @click="formMode = 'register'">注册 Register</button>
          </div>

          <form @submit.prevent="handleSubmit('毛玻璃水晶')">
            <div class="form-group">
              <label>账号 / 电子邮箱</label>
              <input v-model="username" type="text" placeholder="输入用户名..." />
            </div>

            <div v-if="formMode === 'register'" class="form-group">
              <label>注册安全邮箱</label>
              <input v-model="email" type="email" placeholder="name@domain.com" />
            </div>

            <div class="form-group">
              <label>密码</label>
              <input v-model="password" type="password" placeholder="••••••••" />
            </div>

            <button type="submit" class="glass-btn">
              {{ formMode === 'login' ? '立即登录 ▶' : '确认注册 ▶' }}
            </button>
          </form>
        </div>

        <!-- -------------------------------------------------------------- -->
        <!-- Theme 2: 🖤 Modern Dark 极简暗黑 -->
        <!-- -------------------------------------------------------------- -->
        <div v-else-if="activeTabKey === 'moderndark'" class="dark-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #f8fafc; font-size: 1.3rem;">🖤 Midnight Console</h3>
            <div style="display: flex; gap: 6px;">
              <span style="font-size: 0.8rem; color: #06b6d4; cursor: pointer;" @click="formMode = formMode === 'login' ? 'register' : 'login'">
                切换为 {{ formMode === 'login' ? '注册' : '登录' }}
              </span>
            </div>
          </div>

          <form @submit.prevent="handleSubmit('极简暗黑')">
            <div style="margin-bottom: 14px;">
              <input v-model="username" type="text" placeholder="Developer ID / Email" style="width: 100%; padding: 12px; border-radius: 8px; background: #1f2937; border: 1px solid #374151; color: #fff; box-sizing: border-box;" />
            </div>
            <div style="margin-bottom: 14px;">
              <input v-model="password" type="password" placeholder="Access Token / Password" style="width: 100%; padding: 12px; border-radius: 8px; background: #1f2937; border: 1px solid #374151; color: #fff; box-sizing: border-box;" />
            </div>

            <button type="submit" class="dark-btn">
              AUTHENTICATE →
            </button>
          </form>

          <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button style="flex: 1; padding: 8px; border-radius: 6px; background: #1f2937; border: 1px solid #374151; color: #9ca3af; font-size: 0.8rem; cursor: pointer;" @click="handleSocialLogin('GitHub')">
              GitHub 快捷
            </button>
            <button style="flex: 1; padding: 8px; border-radius: 6px; background: #1f2937; border: 1px solid #374151; color: #9ca3af; font-size: 0.8rem; cursor: pointer;" @click="handleSocialLogin('Google')">
              Google 快捷
            </button>
          </div>
        </div>

        <!-- -------------------------------------------------------------- -->
        <!-- Theme 3: 🌾 Oat UI Minimalist 极简风 -->
        <!-- -------------------------------------------------------------- -->
        <div v-else-if="activeTabKey === 'oatminimal'" class="oat-card">
          <div style="font-size: 1.8rem; margin-bottom: 8px; text-align: center;">🌾</div>
          <h3 style="margin: 0 0 6px; font-weight: 800; text-align: center;">Oat.ink Minimalist</h3>
          <p style="margin: 0 0 20px; font-size: 0.82rem; color: #64748b; text-align: center;">极简 0 依赖纯白风</p>

          <form @submit.prevent="handleSubmit('Oat UI 极简')">
            <div style="margin-bottom: 12px;">
              <input v-model="username" type="text" placeholder="输入您的用户名..." style="width: 100%; padding: 10px 14px; border-radius: 8px; box-sizing: border-box;" />
            </div>
            <div style="margin-bottom: 16px;">
              <input v-model="password" type="password" placeholder="密码..." style="width: 100%; padding: 10px 14px; border-radius: 8px; box-sizing: border-box;" />
            </div>
            <button type="submit" class="oat-btn-primary">
              开启 Oat 体验 ▶
            </button>
          </form>
        </div>

        <!-- -------------------------------------------------------------- -->
        <!-- Theme 4: ⚡ Cyberpunk Neon 赛博朋克 -->
        <!-- -------------------------------------------------------------- -->
        <div v-else-if="activeTabKey === 'cyberpunk'" class="cyber-card">
          <h2 style="margin: 0 0 6px; color: #ff007f; text-shadow: 0 0 10px #ff007f; font-weight: 900;">CYBERPUNK // 2077</h2>
          <p style="margin: 0 0 20px; color: #00f0ff; font-size: 0.8rem;">[SYSTEM_AUTH_ONLINE]</p>

          <form @submit.prevent="handleSubmit('赛博朋克')">
            <div style="margin-bottom: 14px;">
              <input v-model="username" type="text" placeholder="NET_RUNNER_ID" style="width: 100%; padding: 10px; background: #000; border: 1px solid #00f0ff; color: #00f0ff; box-sizing: border-box;" />
            </div>
            <div style="margin-bottom: 14px;">
              <input v-model="password" type="password" placeholder="ENCRYPTED_KEY" style="width: 100%; padding: 10px; background: #000; border: 1px solid #ff007f; color: #ff007f; box-sizing: border-box;" />
            </div>
            <button type="submit" class="cyber-btn">
              CONNECT_NODE
            </button>
          </form>
        </div>

        <!-- -------------------------------------------------------------- -->
        <!-- Theme 5: 🍎 macOS Tahoe Frost 苹果磨砂 -->
        <!-- -------------------------------------------------------------- -->
        <div v-else-if="activeTabKey === 'macfrost'" class="mac-window">
          <div class="mac-titlebar">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
            <span style="font-size: 0.8rem; font-weight: 600; margin-left: auto; color: #64748b;">macOS Account Login</span>
          </div>
          <div class="mac-body">
            <div style="text-align: center; margin-bottom: 16px;">
              <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #a5b4fc, #818cf8); margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #fff; font-weight: 800;">
                
              </div>
              <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Apple ID 认证</h4>
            </div>

            <form @submit.prevent="handleSubmit('macOS 磨砂')">
              <input v-model="username" type="text" placeholder="Apple ID 或 手机号" style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 10px; box-sizing: border-box;" />
              <input v-model="password" type="password" placeholder="密码" style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 14px; box-sizing: border-box;" />
              <button type="submit" style="width: 100%; padding: 10px; border-radius: 8px; border: none; background: #2563eb; color: #fff; font-weight: 700; cursor: pointer;">
                登录账户 →
              </button>
            </form>
          </div>
        </div>

        <!-- -------------------------------------------------------------- -->
        <!-- Theme 6: 📱 Mobile App H5 手机端微卡片 -->
        <!-- -------------------------------------------------------------- -->
        <div v-else-if="activeTabKey === 'mobileh5'" class="phone-mockup">
          <div class="phone-notch"></div>
          <h4 style="margin: 0 0 16px; text-align: center; color: #fff;">📱 手机验证码快捷登录</h4>

          <form @submit.prevent="handleSubmit('移动端 H5')">
            <input v-model="username" type="tel" placeholder="输入 11 位手机号码..." style="width: 100%; padding: 10px; border-radius: 8px; background: #18181b; border: 1px solid #3f3f46; color: #fff; margin-bottom: 10px; box-sizing: border-box;" />
            <div style="display: flex; gap: 8px; margin-bottom: 16px;">
              <input v-model="smsCode" type="text" placeholder="验证码" style="flex: 1; padding: 10px; border-radius: 8px; background: #18181b; border: 1px solid #3f3f46; color: #fff; box-sizing: border-box;" />
              <button type="button" style="padding: 10px; border-radius: 8px; background: #27272a; border: 1px solid #3f3f46; color: #38bdf8; font-size: 0.8rem; cursor: pointer;" @click="ElMessage.success('验证码已发送至您的手机！')">
                获取验证码
              </button>
            </div>
            <button type="submit" style="width: 100%; padding: 12px; border-radius: 20px; border: none; background: #10b981; color: #fff; font-weight: 700; cursor: pointer;">
              一键登录
            </button>
          </form>
        </div>

        <!-- -------------------------------------------------------------- -->
        <!-- Theme 7: 💼 Enterprise B2B SaaS 双栏 -->
        <!-- -------------------------------------------------------------- -->
        <div v-else-if="activeTabKey === 'b2bsaas'" class="saas-split-box">
          <div class="saas-left">
            <h3>💼 Enterprise Cloud</h3>
            <p>为数万家企业提供高可用的组件基础设施与协同工作流管理。</p>
          </div>
          <div class="saas-right">
            <h4 style="margin: 0 0 16px;">企业 SSO 统一登录</h4>
            <form @submit.prevent="handleSubmit('B2B SaaS')">
              <input v-model="username" type="text" placeholder="企业账号" style="width: 100%; padding: 10px; border-radius: 8px; background: #0f172a; border: 1px solid #334155; color: #fff; margin-bottom: 10px; box-sizing: border-box;" />
              <input v-model="password" type="password" placeholder="SSO 凭证密码" style="width: 100%; padding: 10px; border-radius: 8px; background: #0f172a; border: 1px solid #334155; color: #fff; margin-bottom: 14px; box-sizing: border-box;" />
              <button type="submit" style="width: 100%; padding: 10px; border-radius: 8px; border: none; background: #3b82f6; color: #fff; font-weight: 700; cursor: pointer;">
                企业身份验证
              </button>
            </form>
          </div>
        </div>

        <!-- -------------------------------------------------------------- -->
        <!-- Theme 8: 🎮 Gaming E-Sports 竞速 -->
        <!-- -------------------------------------------------------------- -->
        <div v-else-if="activeTabKey === 'esports'" class="esports-card">
          <h3 style="margin: 0 0 8px; color: #c084fc; text-align: center;">🎮 GAMER ARENA</h3>
          <p style="margin: 0 0 20px; font-size: 0.8rem; color: #a5b4fc; text-align: center;">电竞游戏社区通行证</p>

          <form @submit.prevent="handleSubmit('电竞竞速')">
            <input v-model="username" type="text" placeholder="玩家 Gamertag" style="width: 100%; padding: 12px; border-radius: 10px; background: #090514; border: 1px solid #7c3aed; color: #fff; margin-bottom: 10px; box-sizing: border-box;" />
            <input v-model="password" type="password" placeholder="Passcode" style="width: 100%; padding: 12px; border-radius: 10px; background: #090514; border: 1px solid #7c3aed; color: #fff; margin-bottom: 16px; box-sizing: border-box;" />
            <button type="submit" class="esports-btn">
              START GAME ▶
            </button>
          </form>
        </div>

        <!-- -------------------------------------------------------------- -->
        <!-- Theme 9: 🍃 Pastel Nature 柔和风 -->
        <!-- -------------------------------------------------------------- -->
        <div v-else-if="activeTabKey === 'pastel'" class="pastel-card">
          <div style="text-align: center; margin-bottom: 16px;">
            <span style="font-size: 2rem;">🍃</span>
            <h4 style="margin: 4px 0 0; color: #0f172a;">Welcome Back</h4>
          </div>

          <form @submit.prevent="handleSubmit('柔和马卡龙')">
            <input v-model="username" type="text" placeholder="昵称 / 邮箱" style="width: 100%; margin-bottom: 10px; box-sizing: border-box;" />
            <input v-model="password" type="password" placeholder="密码" style="width: 100%; margin-bottom: 16px; box-sizing: border-box;" />
            <button type="submit" class="pastel-btn">
              进入美好社区
            </button>
          </form>
        </div>

        <!-- -------------------------------------------------------------- -->
        <!-- Theme 10: 🧊 Neumorphism 3D 新拟物化 -->
        <!-- -------------------------------------------------------------- -->
        <div v-else-if="activeTabKey === 'neumorphism'" class="neu-card">
          <h3 style="margin: 0 0 6px; text-align: center; color: #2563eb;">🧊 Neumorphic 3D</h3>
          <p style="margin: 0 0 20px; font-size: 0.8rem; text-align: center; color: #64748b;">质感浮雕与凹凸触感 3D</p>

          <form @submit.prevent="handleSubmit('新拟物化 3D')">
            <input v-model="username" type="text" placeholder="新拟物用户名" style="width: 100%; margin-bottom: 12px; box-sizing: border-box;" />
            <input v-model="password" type="password" placeholder="密码" style="width: 100%; margin-bottom: 18px; box-sizing: border-box;" />
            <button type="submit" class="neu-btn">
              按压登录 3D
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
