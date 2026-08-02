<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

interface ContactAction {
  id: 'qq' | 'email' | 'qq-mailme'
  title: string
  subtitle: string
  icon: string
  value: string
  buttonText: string
  tone: string
}

const route = useRoute()
const router = useRouter()

const CONTACT_EMAIL = '869710179@qq.com'
const QQ_NUMBER = '869710179'
const QQ_CHAT_URL = `mqqwpa://im/chat?chat_type=wpa&uin=${QQ_NUMBER}&version=1&src_type=web`
const QQ_MAILME_URL = 'http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=uYGPgI6IiYiOgPnIyJfa1tQ'

const contactActions: ContactAction[] = [
  {
    id: 'qq',
    title: 'QQ 联系',
    subtitle: '适合快速沟通，点击会唤起本机 QQ。',
    icon: 'QQ',
    value: QQ_NUMBER,
    buttonText: '打开 QQ',
    tone: 'blue'
  },
  {
    id: 'email',
    title: '邮箱联系',
    subtitle: '适合描述问题、需求和截图，点击会打开邮件客户端。',
    icon: '✉',
    value: CONTACT_EMAIL,
    buttonText: '写邮件',
    tone: 'green'
  },
  {
    id: 'qq-mailme',
    title: 'QQ 邮我',
    subtitle: '使用 QQ 邮箱的“邮我”入口，适合浏览器内快速写信。',
    icon: '邮',
    value: 'QQ MailMe',
    buttonText: '打开邮我',
    tone: 'gold'
  }
]

const activeChannel = computed<string>(() => {
  const channel = route.query.channel
  return typeof channel === 'string' ? channel : ''
})

function openContact(action: ContactAction): void {
  if (action.id === 'qq') {
    window.location.href = QQ_CHAT_URL
    return
  }

  if (action.id === 'email') {
    window.location.href = `mailto:${CONTACT_EMAIL}`
    return
  }

  window.open(QQ_MAILME_URL, '_blank', 'noopener,noreferrer')
}

async function copyContact(action: ContactAction): Promise<void> {
  const text = action.id === 'qq-mailme' ? QQ_MAILME_URL : action.value
  try {
    await navigator.clipboard?.writeText(text)
    ElMessage.success('已复制联系方式')
  } catch {
    ElMessage.warning('复制失败，可以手动选择文本复制')
  }
}

function goHome(): void {
  void router.push('/dyform')
}
</script>

<template>
  <main class="contact-page">
    <section class="contact-hero">
      <button class="back-home" type="button" @click="goHome">← 返回首页</button>
      <p class="contact-kicker">Contact Center</p>
      <h1>联系作者中心</h1>
      <p class="contact-desc">
        QQ 联系、邮箱联系、QQ 邮我三个入口都收在这里。需要反馈问题、截图或想法，直接选一个最顺手的方式就行。
      </p>
    </section>

    <section class="contact-grid" aria-label="联系入口列表">
      <article
        v-for="action in contactActions"
        :key="action.id"
        class="contact-card"
        :class="[`tone-${action.tone}`, { active: activeChannel === action.id }]"
      >
        <div class="contact-icon">{{ action.icon }}</div>
        <div class="contact-copy">
          <h2>{{ action.title }}</h2>
          <p>{{ action.subtitle }}</p>
          <code>{{ action.value }}</code>
        </div>
        <div class="contact-actions">
          <button type="button" class="primary-action" @click="openContact(action)">
            {{ action.buttonText }}
          </button>
          <button type="button" class="ghost-action" @click="copyContact(action)">
            复制
          </button>
        </div>
      </article>
    </section>

    <aside class="contact-note">
      <span>小提示</span>
      如果 QQ 协议没有反应，一般是本机没有安装 QQ 或浏览器拦截了外部应用唤起，可以改用邮箱联系。
    </aside>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
