<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { registerOatUiComponents } from '@/components/oatUi'
import { registerWebComponents } from '@/components/webComponents'

// 确保注册了 Oat UI 与 Web Components 原生组件
registerOatUiComponents()
registerWebComponents()

const router = useRouter()
const activeTab = ref<string>('all')

// 交互式控制变量
const switchState = ref<boolean>(true)
const rangeVal = ref<number>(65)
const meterVal = ref<number>(0.75)
const progressVal = ref<number>(45)
const selectedRadio = ref<string>('option1')
const dialogOpen = ref<boolean>(false)

// 拷贝工具函数
const copyCode = async (text: string, title: string = '代码') => {
  try {
    await navigator.clipboard.writeText(text.trim())
    ElMessage.success(`已复制 ${title}！`)
  } catch {
    ElMessage.error('复制失败')
  }
}

const triggerToast = (type: 'success' | 'warning' | 'info' | 'error') => {
  ElMessage({
    message: `[Oat UI Toast] 收到 ${type.toUpperCase()} 提示消息`,
    type
  })
}

// 各组件源码示例
const typographyCode = `<!-- 1. Typography 排版 -->
<h1>Oat UI Heading 1</h1>
<h2>Heading 2</h2>
<p>轻量极简无修饰 CSS 框架。</p>
<code>const framework = 'Oat UI';</code>
<kbd>Cmd + K</kbd>
<mark>高亮文本</mark>`

const buttonCode = `<!-- 2. Button 按钮形态 -->
<button class="oat-btn primary">Primary Button</button>
<button class="oat-btn secondary">Secondary</button>
<button class="oat-btn outline">Outline</button>
<button class="oat-btn danger">Danger</button>
<button class="oat-btn small">Small</button>
<button class="oat-btn large">Large</button>`

const cardCode = `<!-- 3. Card 卡片 -->
<div class="oat-card">
  <div class="card-header">
    <h3>Oat UI Card</h3>
  </div>
  <div class="card-body">
    <p>极简的卡片边框与内外边距封装。</p>
  </div>
  <div class="card-footer">
    <button class="oat-btn small">Action</button>
  </div>
</div>`

const formCode = `<!-- 4. Form 表单控件 -->
<label class="oat-label">用户名</label>
<input class="oat-input" type="text" placeholder="输入内容..." />

<label class="oat-checkbox">
  <input type="checkbox" checked /> 同意服务协议
</label>

<select class="oat-select">
  <option>选项 A</option>
  <option>选项 B</option>
</select>`

const modalCode = `<!-- 5. Dialog 模态框 -->
<dialog class="oat-dialog" open>
  <h3>模态框标题</h3>
  <p>这是基于 HTML 原生 &lt;dialog&gt; 标签构建的模态弹窗。</p>
  <button class="oat-btn small">确定</button>
</dialog>`

const tabCode = `<!-- 6. WebComponent: <ot-tabs> & <ot-dropdown> -->
<ot-tabs>
  <span slot="header">Tab 1</span>
  <span slot="header">Tab 2</span>
  <div>Tab 1 对应内容...</div>
</ot-tabs>

<ot-dropdown>
  <span slot="label">操作 ▾</span>
  <a href="#">设置</a>
  <a href="#">退出</a>
</ot-dropdown>`

const tagInputCode = `<!-- 7. WebComponent: <ot-tag-input> & <ot-upload> -->
<ot-tag-input></ot-tag-input>
<ot-upload></ot-upload>`
</script>

<template>
  <div class="oat-page">
    <!-- Header 说明 -->
    <header class="oat-header">
      <div class="badge">🌾 Oat UI (oat.ink) 官方示例与交互组件</div>
      <h1>Oat UI 全套 26 个轻量级组件实例展示与代码库</h1>
      <p>
        参照 <a href="https://oat.ink/usage/" target="_blank">https://oat.ink/usage/</a> 官方标准打造的极简 Web Component 与 CSS 组件展示演练场，包含所有 26 类基础控件、WebComponent 拓展与一键复制代码！
      </p>
      <div class="actions">
        <button class="btn-link highlight" @click="router.push('/oat-studio')">🚀 Oat UI 实战界面与更新弹窗展厅</button>
        <a href="https://oat.ink/demo/" target="_blank" class="btn-link">🌾 Oat.ink Kitchensink ↗</a>
        <a href="https://github.com/knadh/oat" target="_blank" class="btn-link">🐙 Oat GitHub ↗</a>
        <button class="btn-link" @click="router.push('/dyform')">🏠 返回 DyForm 首页</button>
      </div>
    </header>

    <!-- 26 个组件全景演练场 -->
    <main class="components-grid">
      <!-- 1. Typography -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">📝</span>
          <h3>1. Typography (排版)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <h2 style="margin-top: 0;">Heading 2 Title</h2>
            <p>Oat UI 采用无沉重的 JavaScript，专注于极致体积与快速加载。</p>

            <div class="inline-box">
              <code>const x = 42;</code>
              <kbd>Ctrl + C</kbd>
              <mark>高亮标识文本</mark>
            </div>
          </div>
          <wc-code-viewer lang="html" title="Typography HTML 代码" :code="typographyCode"></wc-code-viewer>
        </div>
      </section>

      <!-- 2. Accordion -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">📂</span>
          <h3>2. Accordion (折叠手风琴)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <details class="oat-details" open>
              <summary>🌾 什么是 Oat UI？</summary>
              <p>Oat UI 是一个低于 5KB 的类 Milligram/Pico 的极简 Web Components & CSS 框架。</p>
            </details>
            <details class="oat-details">
              <summary>⚡ 为什么使用原生 Web Components？</summary>
              <p>跨所有框架复用、无重构依赖、原生 DOM 事件冒泡集成。</p>
            </details>
          </div>
        </div>
      </section>

      <!-- 3. Alert -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">⚠️</span>
          <h3>3. Alert (警告与提示框)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box vstack">
            <div class="alert alert-info">ℹ️ 提示：这是一条 Info 级别的通知消息。</div>
            <div class="alert alert-success">✅ 成功：操作完成，数据已成功同步！</div>
            <div class="alert alert-warning">⚠️ 警告：当前存储空间占用已超过 80%。</div>
            <div class="alert alert-danger">🚫 错误：网络请求失败，请稍后重试。</div>
          </div>
        </div>
      </section>

      <!-- 4. Avatar -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">👤</span>
          <h3>4. Avatar (头像与头像组)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box hstack">
            <img class="avatar circle" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Oat1" alt="avatar" />
            <img class="avatar square" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Oat2" alt="avatar" />
            <div class="avatar-group">
              <img class="avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Oat3" alt="a" />
              <img class="avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Oat4" alt="b" />
              <span class="avatar-more">+3</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Badge -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">🏷️</span>
          <h3>5. Badge (徽章与状态)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box hstack">
            <span class="badge badge-primary">Primary</span>
            <span class="badge badge-success">Success</span>
            <span class="badge badge-outline">Outline</span>
            <span class="dot dot-online"></span> 在线
            <span class="dot dot-offline"></span> 离线
          </div>
        </div>
      </section>

      <!-- 6. Breadcrumb -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">🍞</span>
          <h3>6. Breadcrumb (面包屑)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <nav class="breadcrumb">
              <a href="#">首页</a>
              <span class="sep">/</span>
              <a href="#">组件库</a>
              <span class="sep">/</span>
              <span class="current">Oat UI</span>
            </nav>
          </div>
        </div>
      </section>

      <!-- 7. Button -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">🔘</span>
          <h3>7. Button (各类按钮变体)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box hstack wrap">
            <button class="oat-btn primary" type="button">Primary</button>
            <button class="oat-btn secondary" type="button">Secondary</button>
            <button class="oat-btn outline" type="button">Outline</button>
            <button class="oat-btn danger" type="button">Danger</button>
            <button class="oat-btn small" type="button">Small</button>
            <button class="oat-btn large" type="button">Large</button>
            <button class="oat-btn disabled" disabled type="button">Disabled</button>
          </div>
          <wc-code-viewer lang="html" title="Button HTML 代码" :code="buttonCode"></wc-code-viewer>
        </div>
      </section>

      <!-- 8. Card -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">🃏</span>
          <h3>8. Card (卡片布局)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <div class="oat-card">
              <div class="card-head">🌾 Oat UI Minimal Card</div>
              <div class="card-body">
                基于纯粹 CSS 边框与极简网格搭建的图文卡片结构。
              </div>
              <div class="card-foot">
                <button class="oat-btn small primary" type="button">了解详情</button>
              </div>
            </div>
          </div>
          <wc-code-viewer lang="html" title="Card 代码" :code="cardCode"></wc-code-viewer>
        </div>
      </section>

      <!-- 9. Dialog -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">💬</span>
          <h3>9. Dialog (原生对话框)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <button class="oat-btn primary" @click="dialogOpen = true" type="button">打开原生 Modal Dialog</button>

            <dialog v-if="dialogOpen" class="oat-modal" open>
              <h3>🌾 Oat UI Native Dialog</h3>
              <p>使用 HTML5 标准 &lt;dialog&gt; 实现的遮罩模态框。</p>
              <div class="modal-foot">
                <button class="oat-btn small danger" @click="dialogOpen = false" type="button">关闭</button>
              </div>
            </dialog>
          </div>
          <wc-code-viewer lang="html" title="Dialog 代码" :code="modalCode"></wc-code-viewer>
        </div>
      </section>

      <!-- 10. Dropdown (Web Component) -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">🔽</span>
          <h3>10. Dropdown (&lt;ot-dropdown&gt; WC)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <ot-dropdown>
              <span slot="label">⚙️ 下拉菜单项 ▾</span>
              <a href="javascript:void(0)" @click="triggerToast('info')">个人资料设置</a>
              <a href="javascript:void(0)" @click="triggerToast('success')">偏好首选项</a>
              <a href="javascript:void(0)" @click="triggerToast('warning')">退出登录</a>
            </ot-dropdown>
          </div>
        </div>
      </section>

      <!-- 11. TagInput (Web Component) -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">🏷️</span>
          <h3>11. TagInput (&lt;ot-tag-input&gt; WC)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <ot-tag-input></ot-tag-input>
          </div>
          <wc-code-viewer lang="html" title="TagInput WebComponent" :code="tagInputCode"></wc-code-viewer>
        </div>
      </section>

      <!-- 12. Form elements -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">📋</span>
          <h3>12. Form Elements (全系列表单控件)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box vstack">
            <input class="oat-input" type="text" placeholder="输入文本..." />
            <div class="hstack">
              <label class="oat-check"><input type="checkbox" checked /> Checkbox 1</label>
              <label class="oat-check"><input type="radio" name="r" value="option1" v-model="selectedRadio" /> Radio 1</label>
              <label class="oat-check"><input type="radio" name="r" value="option2" v-model="selectedRadio" /> Radio 2</label>
            </div>
            <select class="oat-select">
              <option>下拉选择项 1</option>
              <option>下拉选择项 2</option>
            </select>
          </div>
          <wc-code-viewer lang="html" title="Form 代码" :code="formCode"></wc-code-viewer>
        </div>
      </section>

      <!-- 13. Upload (Web Component) -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">📤</span>
          <h3>13. Upload (&lt;ot-upload&gt; WC)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <ot-upload></ot-upload>
          </div>
        </div>
      </section>

      <!-- 14. Meter -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">⏱️</span>
          <h3>14. Meter (度量仪表盘)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box vstack">
            <label>CPU 使用率: {{ Math.round(meterVal * 100) }}%</label>
            <meter class="oat-meter" min="0" max="1" :value="meterVal" low="0.3" high="0.8" optimum="0.5"></meter>
            <input type="range" min="0" max="1" step="0.05" v-model.number="meterVal" />
          </div>
        </div>
      </section>

      <!-- 15. Pagination -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">🔢</span>
          <h3>15. Pagination (分页控件)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <ul class="pagination">
              <li class="page-item disabled">&laquo;</li>
              <li class="page-item active">1</li>
              <li class="page-item">2</li>
              <li class="page-item">3</li>
              <li class="page-item">&raquo;</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 16. Progress -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">📊</span>
          <h3>16. Progress (进度条)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box vstack">
            <label>进度: {{ progressVal }}%</label>
            <progress class="oat-progress" max="100" :value="progressVal"></progress>
            <input type="range" min="0" max="100" v-model.number="progressVal" />
          </div>
        </div>
      </section>

      <!-- 17. Spinner -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">🌀</span>
          <h3>17. Spinner (加载器)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box hstack">
            <div class="spinner default"></div>
            <div class="spinner primary"></div>
            <div class="spinner large"></div>
            <span>加载中...</span>
          </div>
        </div>
      </section>

      <!-- 18. Skeleton -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">💀</span>
          <h3>18. Skeleton (骨架屏)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box vstack">
            <div class="skeleton sk-title"></div>
            <div class="skeleton sk-line"></div>
            <div class="skeleton sk-line short"></div>
          </div>
        </div>
      </section>

      <!-- 19. Sidebar -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">📌</span>
          <h3>19. Sidebar (侧边栏布局)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <div class="mini-sidebar">
              <a href="javascript:void(0)" class="active">📁 Dashboard</a>
              <a href="javascript:void(0)">⚙️ Settings</a>
            </div>
          </div>
        </div>
      </section>

      <!-- 20. Switch -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">🔘</span>
          <h3>20. Switch (开关控件)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box hstack">
            <label class="switch-box">
              <input type="checkbox" v-model="switchState" />
              <span class="slider"></span>
            </label>
            <span>开关状态: <strong>{{ switchState ? '开启 (ON)' : '关闭 (OFF)' }}</strong></span>
          </div>
        </div>
      </section>

      <!-- 21. Table -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">📊</span>
          <h3>21. Table (表格)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <table class="oat-table">
              <thead>
                <tr>
                  <th>组件</th>
                  <th>类型</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>&lt;ot-dropdown&gt;</td>
                  <td>Web Component</td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td>.oat-btn</td>
                  <td>CSS Utility</td>
                  <td><span class="badge badge-primary">Stable</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 22. Tabs (Web Component) -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">📑</span>
          <h3>22. Tabs (&lt;ot-tabs&gt; WC)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <ot-tabs>
              <span slot="header">第一项</span>
              <span slot="header">第二项</span>
              <div style="padding: 10px;">这是 Oat UI 标签页内置容器。</div>
            </ot-tabs>
          </div>
          <wc-code-viewer lang="html" title="Tabs Web Component" :code="tabCode"></wc-code-viewer>
        </div>
      </section>

      <!-- 23. Tooltip -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">💬</span>
          <h3>23. Tooltip (文字提示)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box hstack">
            <span class="oat-tooltip" data-tooltip="这是 Oat UI 浮动提示框">悬停我查看提示 ℹ️</span>
          </div>
        </div>
      </section>

      <!-- 24. Toast -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">🍞</span>
          <h3>24. Toast (消息吐司)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box hstack wrap">
            <button class="oat-btn small primary" @click="triggerToast('info')" type="button">Trigger Info</button>
            <button class="oat-btn small danger" @click="triggerToast('error')" type="button">Trigger Error</button>
            <button class="oat-btn small" style="background:#10b981; color:#fff;" @click="triggerToast('success')" type="button">Trigger Success</button>
          </div>
        </div>
      </section>

      <!-- 25. Grid -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">📐</span>
          <h3>25. Grid (栅格系统)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box">
            <div class="grid-demo-row">
              <div class="col col-4">Col 4</div>
              <div class="col col-4">Col 4</div>
              <div class="col col-4">Col 4</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 26. Utilities -->
      <section class="comp-card">
        <div class="comp-head">
          <span class="icon">🛠️</span>
          <h3>26. Utilities (实用辅助类)</h3>
        </div>
        <div class="comp-body">
          <div class="demo-box hstack wrap">
            <span class="u-text-muted">.u-text-muted</span>
            <span class="u-text-bold">.u-text-bold</span>
            <span class="u-bg-soft">.u-bg-soft</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
