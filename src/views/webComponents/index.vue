<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { registerWebComponents } from '@/components/webComponents'

// 确保 Web Components 已注册
registerWebComponents()

const router = useRouter()
const activeTab = ref<'basic' | 'shadow' | 'slots' | 'advanced' | 'framework'>('basic')

// Tab 1: 计数器组件响应式状态
const counterCount = ref<number>(5)
const counterStep = ref<number>(1)
const counterDisabled = ref<boolean>(false)
const counterVariant = ref<string>('primary')
const counterLogs = ref<Array<{ time: string; text: string }>>([])

// Tab 2: 用户卡片组件响应式状态
const userName = ref<string>('Antigravity 开发者')
const userBio = ref<string>('基于 MDN 与 阮一峰 Web Components 教程的轻量级原生组件')
const userTheme = ref<'light' | 'dark' | 'gradient'>('gradient')
const userStatus = ref<'online' | 'offline' | 'busy'>('online')
const userLikes = ref<number>(99)
const userAvatar = ref<string>('https://api.dicebear.com/7.x/avataaars/svg?seed=VueDev')
const userLogs = ref<Array<{ time: string; text: string }>>([])

// Tab 3: 动态插槽面板
const dynamicTabs = ref<Array<{ id: number; title: string; content: string; icon: string }>>([
  { id: 1, title: 'W3C 规范文档', content: 'Web Components 由 4 项 W3C 主要规范组成：Custom Elements, Shadow DOM, HTML Templates, HTML Imports (被 ES Modules 替代)。', icon: '📄' },
  { id: 2, title: 'MDN Web API', content: 'MDN 提供了从接口定义、生命周期到 Shadow DOM 内部调用的全套规范说明。', icon: '🌐' },
  { id: 3, title: '阮一峰教程解析', content: '阮一峰老师的文章用极简的实例讲解了 Custom Elements 的注册、Template 克隆与封装。', icon: '💡' }
])
const nextTabId = ref<number>(4)

// Tab 4: 评分组件响应式状态
const ratingValue = ref<number>(4)
const ratingMax = ref<number>(5)
const ratingReadonly = ref<boolean>(false)
const ratingColor = ref<string>('#f59e0b')
const ratingLogs = ref<Array<{ time: string; text: string }>>([])

// 拷贝代码事件处理
const copyToClipboard = async (text: string, title: string = '代码'): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text.trim())
    ElMessage.success(`已成功复制 ${title} 到剪贴板！`)
  } catch (err) {
    ElMessage.error('复制失败，请手动选择复制代码')
  }
}

// 模拟向 Tab 3 添加新插槽页签
const addDynamicTab = (): void => {
  const id = nextTabId.value++
  dynamicTabs.value.push({
    id,
    title: `动态页签 ${id}`,
    content: `这是通过 Vue 响应式数组添加的第 ${id} 项页签内容，Web Component 自动监听到 slotchange 并更新 Header！`,
    icon: '✨'
  })
  ElMessage.success(`已动态添加页签 ${id}`)
}

const removeDynamicTab = (index: number): void => {
  if (dynamicTabs.value.length <= 1) {
    ElMessage.warning('至少保留一项页签')
    return
  }
  dynamicTabs.value.splice(index, 1)
  ElMessage.info('已移除页签')
}

// 事件监听逻辑注册
onMounted(() => {
  // 监听计数器事件
  window.addEventListener('count-change', ((e: Event) => {
    const customEvt = e as CustomEvent
    const time = new Date().toLocaleTimeString()
    counterLogs.value.unshift({
      time,
      text: `[count-change] 动作: ${customEvt.detail.action}, 当前计数值: ${customEvt.detail.count}`
    })
    if (counterLogs.value.length > 8) counterLogs.value.pop()
  }) as EventListener)

  // 监听点赞事件
  window.addEventListener('user-like', ((e: Event) => {
    const customEvt = e as CustomEvent
    const time = new Date().toLocaleTimeString()
    userLogs.value.unshift({
      time,
      text: `[user-like] 收到来自 Shadow DOM 的点赞！用户: ${customEvt.detail.name}, 总点赞数: ${customEvt.detail.likes}`
    })
    if (userLogs.value.length > 8) userLogs.value.pop()
  }) as EventListener)

  // 监听评分变更事件
  window.addEventListener('rating-change', ((e: Event) => {
    const customEvt = e as CustomEvent
    const time = new Date().toLocaleTimeString()
    ratingLogs.value.unshift({
      time,
      text: `[rating-change] 当前打分: ${customEvt.detail.value} / ${customEvt.detail.max}`
    })
    if (ratingLogs.value.length > 8) ratingLogs.value.pop()
  }) as EventListener)
})

// 代码示例字符串
const counterJsCode = `
// 1. 定义继承 HTMLElement 的类
export class WcCounterButton extends HTMLElement {
  static get observedAttributes() {
    return ['count', 'step', 'disabled', 'variant']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this.render()
  }

  render() {
    const count = this.getAttribute('count') || '0'
    this.shadowRoot.innerHTML = \`
      <style>
        :host { display: inline-flex; font-family: sans-serif; }
        button { background: #3b82f6; color: #fff; border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer; }
      </style>
      <button part="button">\${count}</button>
    \`
  }
}
// 2. 注册为自定义标签
customElements.define('wc-counter-button', WcCounterButton)
`

const vueUsageCode = `
<template>
  <div>
    <!-- Vue 3 中原生 Web Component 的简单使用 -->
    <wc-counter-button
      :count="myCount"
      :step="1"
      @count-change="handleCountChange"
    ></wc-counter-button>

    <wc-user-card
      :name="userName"
      :theme="currentTheme"
      @user-like="onLike"
    >
      <span slot="tag">Vue 3 集成</span>
    </wc-user-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import '@/components/webComponents' // 自动注册标签

const myCount = ref(10)
const handleCountChange = (e) => {
  myCount.value = e.detail.count
}
<\/script>
`

const reactUsageCode = `
import React, { useEffect, useRef, useState } from 'react';
import '@/components/webComponents';

export const ReactWebComponentDemo = () => {
  const [count, setCount] = useState(5);
  const counterRef = useRef(null);

  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;

    // React 中监听 Web Component 自定义冒泡事件
    const handleCountChange = (e) => {
      setCount(e.detail.count);
    };

    el.addEventListener('count-change', handleCountChange);
    return () => el.removeEventListener('count-change', handleCountChange);
  }, []);

  return (
    <div>
      <h3>React 18/19 集成 Web Components</h3>
      <wc-counter-button
        ref={counterRef}
        count={count}
        step={1}
      ></wc-counter-button>
    </div>
  );
};
`
</script>

<template>
  <div class="web-components-page">
    <!-- Header 核心概念卡片 -->
    <header class="hero-header">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-icon">🧩</span>
          <span>W3C Standard Web Components</span>
        </div>
        <h1 class="hero-title">Web Components 基础与进阶全景实战</h1>
        <p class="hero-subtitle">
          基于 MDN Web Components API 指南与阮一峰 Web Components 教程打造的原生通用组件库。无缝支持 原生 JS、Vue 2/3、React 18/19、Angular 与 Svelte！
        </p>

        <div class="ref-links">
          <a href="https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components" target="_blank" class="ref-link">
            📖 MDN Web Components 文档 ↗
          </a>
          <a href="https://www.ruanyifeng.com/blog/2019/08/web_components.html" target="_blank" class="ref-link">
            📰 阮一峰 Web Components 教程 ↗
          </a>
          <button class="ref-link highlight" @click="router.push('/dyform')">
            🏠 返回首页导航
          </button>
        </div>
      </div>
    </header>

    <!-- 导航 Tab 栏 -->
    <nav class="nav-tabs">
      <button class="tab-item" :class="{ active: activeTab === 'basic' }" @click="activeTab = 'basic'">
        🎯 1. 基础入门 (Custom Elements)
      </button>
      <button class="tab-item" :class="{ active: activeTab === 'shadow' }" @click="activeTab = 'shadow'">
        👻 2. Shadow DOM 与 样式隔离
      </button>
      <button class="tab-item" :class="{ active: activeTab === 'slots' }" @click="activeTab = 'slots'">
        🧩 3. 模板与插槽 (Templates & Slots)
      </button>
      <button class="tab-item" :class="{ active: activeTab === 'advanced' }" @click="activeTab = 'advanced'">
        ⚡ 4. 高级进阶 (Form & Parts & CSS 变量)
      </button>
      <button class="tab-item" :class="{ active: activeTab === 'framework' }" @click="activeTab = 'framework'">
        🌐 5. 跨框架共用 (Vue / React / Native)
      </button>
    </nav>

    <!-- 主体展示区域 -->
    <main class="tab-content">
      <!-- 模块 1: 基础入门 -->
      <section v-if="activeTab === 'basic'" class="demo-section">
        <div class="section-desc">
          <h2>1. Custom Elements (自定义元素) 与生命周期</h2>
          <p>
            MDN 规定 Custom Elements 允许开发者创建自定义 HTML 标签。所有自定义元素必须继承自 <code>HTMLElement</code> 且标签名中必须包含连字符 (<code>-</code>)。
          </p>
          <div class="lifecycle-grid">
            <div class="lifecycle-card">
              <h4>constructor()</h4>
              <p>创建或升级元素实例，初始化 state 和 Shadow DOM。</p>
            </div>
            <div class="lifecycle-card">
              <h4>connectedCallback()</h4>
              <p>当元素挂载到 DOM 树时触发，相当于 Vue <code>onMounted</code>。</p>
            </div>
            <div class="lifecycle-card">
              <h4>disconnectedCallback()</h4>
              <p>当元素从 DOM 树移除时触发，用于解绑事件与定时器。</p>
            </div>
            <div class="lifecycle-card">
              <h4>attributeChangedCallback()</h4>
              <p>被 <code>observedAttributes</code> 监听的属性变更时触发。</p>
            </div>
          </div>
        </div>

        <div class="interactive-workbench">
          <div class="control-panel">
            <h3>⚙️ 交互控制台</h3>
            <div class="form-item">
              <label>当前 Counter 计数值 (count):</label>
              <el-input-number v-model="counterCount" :step="counterStep" />
            </div>
            <div class="form-item">
              <label>步长 (step):</label>
              <el-input-number v-model="counterStep" :min="1" :max="10" />
            </div>
            <div class="form-item">
              <label>主题变体 (variant):</label>
              <el-radio-group v-model="counterVariant" size="small">
                <el-radio-button label="primary">Primary</el-radio-button>
                <el-radio-button label="success">Success</el-radio-button>
                <el-radio-button label="warning">Warning</el-radio-button>
                <el-radio-button label="purple">Purple</el-radio-button>
              </el-radio-group>
            </div>
            <div class="form-item">
              <label>禁用状态 (disabled):</label>
              <el-switch v-model="counterDisabled" />
            </div>
          </div>

          <div class="preview-panel">
            <h3>👁️ 原生组件实时预览</h3>
            <div class="component-box">
              <wc-counter-button
                :count="counterCount"
                :step="counterStep"
                :variant="counterVariant"
                :disabled="counterDisabled || undefined"
              ></wc-counter-button>
            </div>

            <div class="event-logs">
              <h4>📋 自定义事件监听日志 (CustomEvent: count-change)</h4>
              <ul v-if="counterLogs.length > 0">
                <li v-for="(log, idx) in counterLogs" :key="idx">
                  <span class="log-time">{{ log.time }}</span> {{ log.text }}
                </li>
              </ul>
              <div v-else class="empty-log">点击下方/上方计数按钮触发事件...</div>
            </div>
          </div>
        </div>

        <wc-code-viewer lang="javascript" title="wc-counter-button 原生核心源码" :code="counterJsCode"></wc-code-viewer>
      </section>

      <!-- 模块 2: Shadow DOM -->
      <section v-if="activeTab === 'shadow'" class="demo-section">
        <div class="section-desc">
          <h2>2. Shadow DOM 与 样式隔离封装</h2>
          <p>
            Shadow DOM (影子 DOM) 可以将独立的 DOM 树附加到元素上，使其内部 DOM 结构与外部 CSS 样式实现完全隔离。参考阮一峰老师教程中的 <code>UserCard</code> 组件，外部样式不会影响组件内部，组件内样式也不会污染全局！
          </p>
        </div>

        <div class="interactive-workbench">
          <div class="control-panel">
            <h3>⚙️ 属性与数据控制</h3>
            <div class="form-item">
              <label>姓名 (name):</label>
              <el-input v-model="userName" />
            </div>
            <div class="form-item">
              <label>简介 (bio):</label>
              <el-input v-model="userBio" type="textarea" :rows="2" />
            </div>
            <div class="form-item">
              <label>主题模式 (theme):</label>
              <el-select v-model="userTheme">
                <el-option label="Light 亮色" value="light" />
                <el-option label="Dark 暗黑" value="dark" />
                <el-option label="Gradient 渐变" value="gradient" />
              </el-select>
            </div>
            <div class="form-item">
              <label>在线状态 (status):</label>
              <el-select v-model="userStatus">
                <el-option label="🟢 在线 (online)" value="online" />
                <el-option label="⚪ 离线 (offline)" value="offline" />
                <el-option label="🔴 忙碌 (busy)" value="busy" />
              </el-select>
            </div>
            <div class="form-item">
              <label>点赞数 (likes):</label>
              <el-input-number v-model="userLikes" :min="0" />
            </div>
          </div>

          <div class="preview-panel">
            <h3>👁️ 原生 UserCard 实时渲染</h3>
            <div class="component-box">
              <wc-user-card
                :name="userName"
                :bio="userBio"
                :theme="userTheme"
                :status="userStatus"
                :likes="userLikes"
                :avatar="userAvatar"
              >
                <span slot="tag">W3C 规范</span>
              </wc-user-card>
            </div>

            <div class="event-logs">
              <h4>📋 冒泡事件日志 (bubbles: true, composed: true)</h4>
              <ul v-if="userLogs.length > 0">
                <li v-for="(log, idx) in userLogs" :key="idx">
                  <span class="log-time">{{ log.time }}</span> {{ log.text }}
                </li>
              </ul>
              <div v-else class="empty-log">点击卡片中的 ❤️ 点赞按钮试一试...</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 模块 3: Templates & Slots -->
      <section v-if="activeTab === 'slots'" class="demo-section">
        <div class="section-desc">
          <h2>3. HTML 模板 (&lt;template&gt;) 与插槽 (&lt;slot&gt;)</h2>
          <p>
            <code>&lt;template&gt;</code> 是一种包含在加载页面时不渲染，但可以在运行时被 JavaScript 实例化的 HTML 结构。通过 <code>&lt;slot&gt;</code> 插槽，开发者能够向 Shadow DOM 中投射自定义内容。组件内部可以通过监听 <code>slotchange</code> 事件实现对动态内容的感知！
          </p>
        </div>

        <div class="workbench-card">
          <div class="card-toolbar">
            <h3>🧩 实例：原生 Tab 页签容器组件 (&lt;wc-tab-panel&gt;)</h3>
            <div class="toolbar-actions">
              <el-button type="primary" size="small" @click="addDynamicTab">➕ 动态添加插槽页签</el-button>
            </div>
          </div>

          <div class="demo-box" style="padding: 20px;">
            <wc-tab-panel>
              <wc-tab-item
                v-for="(item, idx) in dynamicTabs"
                :key="item.id"
                :label="item.title"
                :icon="item.icon"
                :active="idx === 0"
              >
                <div class="tab-item-content">
                  <p>{{ item.content }}</p>
                  <el-button type="danger" plain size="small" @click="removeDynamicTab(idx)">
                    🗑️ 删除当前页签
                  </el-button>
                </div>
              </wc-tab-item>
            </wc-tab-panel>
          </div>
        </div>
      </section>

      <!-- 模块 4: 高级进阶 -->
      <section v-if="activeTab === 'advanced'" class="demo-section">
        <div class="section-desc">
          <h2>4. 高级特性：ElementInternals, CSS Shadow Parts & CSS 变量</h2>
          <p>
            高级 Web Components 可以通过 <code>attachInternals()</code> 成为表单关联元素 (Form-Associated Custom Elements)，并且通过 CSS <code>::part(name)</code> 允许外部对 Shadow DOM 内部特定暴露元素进行自由样式定制！
          </p>
        </div>

        <div class="interactive-workbench">
          <div class="control-panel">
            <h3>⚙️ 评分参数定制</h3>
            <div class="form-item">
              <label>当前评分 (value):</label>
              <el-rate v-model="ratingValue" :max="ratingMax" />
            </div>
            <div class="form-item">
              <label>最高分数 (max):</label>
              <el-input-number v-model="ratingMax" :min="3" :max="10" />
            </div>
            <div class="form-item">
              <label>只读状态 (readonly):</label>
              <el-switch v-model="ratingReadonly" />
            </div>
            <div class="form-item">
              <label>星星颜色 (CSS 变量/color 属性):</label>
              <el-color-picker v-model="ratingColor" />
            </div>
          </div>

          <div class="preview-panel">
            <h3>👁️ 原生 Rating Component</h3>
            <div class="component-box">
              <wc-rating-star
                :value="ratingValue"
                :max="ratingMax"
                :color="ratingColor"
                :readonly="ratingReadonly || undefined"
              ></wc-rating-star>
            </div>

            <div class="event-logs">
              <h4>📋 评分事件日志</h4>
              <ul v-if="ratingLogs.length > 0">
                <li v-for="(log, idx) in ratingLogs" :key="idx">
                  <span class="log-time">{{ log.time }}</span> {{ log.text }}
                </li>
              </ul>
              <div v-else class="empty-log">点击星级图标更改打分...</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 模块 5: 跨框架共用 -->
      <section v-if="activeTab === 'framework'" class="demo-section">
        <div class="section-desc">
          <h2>5. 跨框架共用方案 (Vue / React / Native JS)</h2>
          <p>
            由于 Web Components 是基于浏览器的标准 API，因此它们可以跨所有的前端框架复用！以下是主要主流框架接入 Web Components 的最佳实践：
          </p>
        </div>

        <div class="framework-grid">
          <div class="framework-card">
            <div class="fw-header">
              <span class="fw-icon">🟢</span>
              <h3>Vue 3 / Vue 2 集成</h3>
            </div>
            <p>Vue 原生完美支持 Custom Elements！属性与自定义事件直接绑定。</p>
            <el-button type="primary" size="small" @click="copyToClipboard(vueUsageCode, 'Vue 3 集成代码')">
              📋 复制 Vue 代码
            </el-button>
            <wc-code-viewer lang="html" title="Vue 3 SFC 使用示例" :code="vueUsageCode"></wc-code-viewer>
          </div>

          <div class="framework-card">
            <div class="fw-header">
              <span class="fw-icon">⚛️</span>
              <h3>React 18 / 19 集成</h3>
            </div>
            <p>React 需使用 Ref 绑定或原生 `addEventListener` 监听自定义冒泡事件。</p>
            <el-button type="primary" size="small" @click="copyToClipboard(reactUsageCode, 'React 集成代码')">
              📋 复制 React 代码
            </el-button>
            <wc-code-viewer lang="typescript" title="React TSX 使用示例" :code="reactUsageCode"></wc-code-viewer>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.web-components-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  color: var(--text-color, #1f2937);
}

.hero-header {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%);
  border-radius: 20px;
  padding: 40px;
  color: #ffffff;
  box-shadow: 0 20px 40px rgba(49, 46, 129, 0.25);
  margin-bottom: 24px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 1.05rem;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 800px;
  margin-bottom: 24px;
}

.ref-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.ref-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  &.highlight {
    background: #ec4899;
    border-color: #ec4899;

    &:hover {
      background: #db2777;
    }
  }
}

.nav-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
}

.tab-item {
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    color: #111827;
    background: rgba(0, 0, 0, 0.04);
  }

  &.active {
    background: #4338ca;
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(67, 56, 202, 0.3);
  }
}

.demo-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-desc {
  margin-bottom: 24px;
  h2 { font-size: 1.4rem; font-weight: 700; margin-bottom: 8px; }
  p { color: #6b7280; line-height: 1.6; }
}

.lifecycle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.lifecycle-card {
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  h4 { font-size: 1rem; color: #4338ca; margin-bottom: 6px; }
  p { font-size: 0.85rem; color: #4b5563; margin: 0; }
}

.interactive-workbench {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
}

.control-panel, .preview-panel {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(0,0,0,0.04);

  h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; }
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  label { font-size: 0.85rem; font-weight: 600; color: #374151; }
}

.component-box {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px dashed #d1d5db;
  margin-bottom: 20px;
}

.event-logs {
  h4 { font-size: 0.9rem; color: #374151; margin-bottom: 8px; }
  ul { list-style: none; padding: 0; margin: 0; max-height: 180px; overflow-y: auto; }
  li { font-size: 0.82rem; padding: 6px 10px; background: #f3f4f6; border-radius: 6px; margin-bottom: 6px; }
  .log-time { color: #8b5cf6; font-weight: 700; margin-right: 6px; }
  .empty-log { font-size: 0.85rem; color: #9ca3af; font-style: italic; }
}

.workbench-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(0,0,0,0.04);
  overflow: hidden;
}

.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  h3 { font-size: 1.05rem; font-weight: 700; margin: 0; }
}

.tab-item-content {
  padding: 12px;
  line-height: 1.6;
}

.framework-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.framework-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(0,0,0,0.04);

  .fw-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
  }
}
</style>
