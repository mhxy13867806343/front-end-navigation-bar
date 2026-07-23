<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import OatUpdateModal from '@/components/oatUi/OatUpdateModal.vue'
import OatCreatePageModal, { type NewPageData } from '@/components/oatUi/OatCreatePageModal.vue'
import OatConfirmModal from '@/components/oatUi/OatConfirmModal.vue'
import OatDrawer from '@/components/oatUi/OatDrawer.vue'
import { registerOatUiComponents } from '@/components/oatUi'

registerOatUiComponents()
const router = useRouter()

// 弹窗状态控制
const updateModalOpen = ref<boolean>(false)
const createPageModalOpen = ref<boolean>(false)
const confirmModalOpen = ref<boolean>(false)
const confirmType = ref<'warning' | 'danger' | 'success' | 'info'>('warning')
const confirmTitle = ref<string>('确认删除该记录？')
const confirmMsg = ref<string>('此操作将不可撤销，删除后该数据记录将从本地数据库中永久移除。')

const drawerOpen = ref<boolean>(false)

// 动态创建的页面数据列表
const createdPages = ref<NewPageData[]>([
  {
    title: '示例·数据分析看板',
    path: 'analytics-dashboard',
    template: 'dashboard',
    tags: ['数据', '看板', 'Oat UI'],
    description: '核心指标卡片与用户流失分析大屏',
    isPublic: true
  },
  {
    title: '示例·极简个人中心',
    path: 'user-profile',
    template: 'blank',
    tags: ['用户', '设置'],
    description: '基本信息设置与个人密钥管理',
    isPublic: false
  }
])

const handleCreatePage = (data: NewPageData) => {
  createdPages.value.unshift(data)
  ElMessage.success(`成功生成页面《${data.title}》(/oat-studio/${data.path})！`)
}

const triggerConfirmDialog = (type: 'warning' | 'danger' | 'success' | 'info') => {
  confirmType.value = type
  if (type === 'danger') {
    confirmTitle.value = '确定危险删除？'
    confirmMsg.value = '此操作将无法还原，确定要清理全站缓存并重置状态吗？'
  } else if (type === 'success') {
    confirmTitle.value = '配置发布成功'
    confirmMsg.value = '当前全局路由与 Oat UI 组件定义已成功同步至部署节点。'
  } else if (type === 'warning') {
    confirmTitle.value = '版本切换警告'
    confirmMsg.value = '检测到您正尝试从 v2.4.0 降级，可能部分新特性无法向下兼容。'
  } else {
    confirmTitle.value = '系统常规提示'
    confirmMsg.value = '欢迎使用基于 oat.ink 规范打造的极简组件套件。'
  }
  confirmModalOpen.value = true
}

const onConfirmAction = () => {
  ElMessage.success('已执行确认操作')
}
</script>

<template>
  <div class="oat-studio-page">
    <!-- Header 头部栏 -->
    <header class="studio-header">
      <div class="header-content">
        <div class="tag-badge">🌾 Oat.ink Interactive Studio</div>
        <h1>Oat UI 实战交互界面与模态弹窗展厅</h1>
        <p>
          遵循 <a href="https://oat.ink/" target="_blank">Oat UI (oat.ink)</a>
          的极简、轻量理念，提供包含<strong>系统更新提示框</strong>、<strong>新建页面/新建项目模态表单</strong>、<strong>通用确认对话框</strong>与<strong>右侧滑出抽屉</strong>的完整实战应用实例。
        </p>
        <div class="action-bar">
          <button class="oat-btn primary" @click="updateModalOpen = true">
            🔔 查看最新版本更新提示
          </button>
          <button class="oat-btn outline" @click="createPageModalOpen = true">
            ✨ + 新建 Oat 交互页面
          </button>
          <button class="oat-btn secondary" @click="drawerOpen = true">
            📥 打开系统通知抽屉
          </button>
          <button class="oat-btn secondary" @click="router.push('/oat-ui')">
            🧩 浏览全套 26 个基础控件
          </button>
        </div>
      </div>
    </header>

    <!-- Main 主体区 -->
    <main class="studio-container">
      <!-- 1. 常用交互弹窗触发展区 -->
      <section class="studio-section">
        <div class="section-title">
          <span class="icon">💬</span>
          <h2>1. Oat UI 常用交互弹窗与抽屉试验场</h2>
          <span class="sub-tag">点击下列卡片按钮快速开起体验</span>
        </div>

        <div class="trigger-grid">
          <!-- 弹窗 1: 更新提示 -->
          <div class="trigger-card">
            <div class="card-icon">🎉</div>
            <h3>新版本更新提示 (Release Notes)</h3>
            <p>包含版本 Tag 徽章、新功能 Timeline、版本亮点与“稍后提醒/立即体验”胶囊按钮。</p>
            <button class="oat-btn primary" @click="updateModalOpen = true">
              触发更新提示弹窗
            </button>
          </div>

          <!-- 弹窗 2: 新建页面 modal -->
          <div class="trigger-card">
            <div class="card-icon">📝</div>
            <h3>新建页面 / 项目模态表单</h3>
            <p>基于 Oat UI 极简表单规范，支持配置路由 Path、页面类型模板（Dashboard / 列表）与 Tag。</p>
            <button class="oat-btn primary" @click="createPageModalOpen = true">
              触发新建页面弹窗
            </button>
          </div>

          <!-- 弹窗 3: 危险/警告对话框 -->
          <div class="trigger-card">
            <div class="card-icon">⚠️</div>
            <h3>警告 / 危险删除确认框</h3>
            <p>用于拦截关键与危险性操作，带有高亮图标提示与明确的双选项胶囊按键。</p>
            <div class="btn-group-row">
              <button class="oat-btn danger small" @click="triggerConfirmDialog('danger')">
                危险删除
              </button>
              <button class="oat-btn secondary small" @click="triggerConfirmDialog('warning')">
                警告提示
              </button>
            </div>
          </div>

          <!-- 弹窗 4: 右侧抽屉 -->
          <div class="trigger-card">
            <div class="card-icon">📂</div>
            <h3>右侧滑出抽屉 (Drawer)</h3>
            <p>极简的右侧滑出面板，适用于系统通知中心、详细配置或日志历史查阅。</p>
            <button class="oat-btn secondary" @click="drawerOpen = true">
              滑出右侧抽屉
            </button>
          </div>
        </div>
      </section>

      <!-- 2. 已动态生成的 Oat 页面成果展示 -->
      <section class="studio-section dynamic-pages-section">
        <div class="section-title">
          <span class="icon">📄</span>
          <h2>2. 已生成的 Oat UI 交互页面 ({{ createdPages.length }})</h2>
          <button class="oat-btn outline small" @click="createPageModalOpen = true">
            + 继续新建
          </button>
        </div>

        <div v-if="!createdPages.length" class="empty-box">
          尚无动态页面，点击顶部“+ 新建 Oat 交互页面”按钮尝试生成！
        </div>

        <div v-else class="pages-grid">
          <div v-for="(pg, idx) in createdPages" :key="idx" class="created-page-card">
            <div class="card-top">
              <span class="tpl-badge">{{ pg.template.toUpperCase() }}</span>
              <span class="path-text">/oat-studio/{{ pg.path }}</span>
            </div>
            <h4>{{ pg.title }}</h4>
            <p>{{ pg.description || '暂无详细描述信息' }}</p>
            <div class="card-bottom">
              <div class="tags">
                <span v-for="(t, tIdx) in pg.tags" :key="tIdx" class="tag">#{{ t }}</span>
              </div>
              <button class="oat-btn secondary small" @click="ElMessage.info(`预览页面 /oat-studio/${pg.path}`)">
                预览页面
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Oat UI 极简控制台 (Dashboard Showcase) -->
      <section class="studio-section oat-dashboard-section">
        <div class="section-title">
          <span class="icon">📊</span>
          <h2>3. Oat UI 极简控制台界面范例</h2>
        </div>

        <div class="dashboard-card">
          <div class="db-header">
            <h3>⚡ 全站核心运营与组件调用指标 (Oat Dashboard)</h3>
            <ot-dropdown>
              <span slot="label">时间范围: 本周 ▾</span>
              <a href="javascript:void(0)" @click="ElMessage.success('已切换至今日')">今日</a>
              <a href="javascript:void(0)" @click="ElMessage.success('已切换至本周')">本周</a>
              <a href="javascript:void(0)" @click="ElMessage.success('已切换至本月')">本月</a>
            </ot-dropdown>
          </div>

          <div class="metrics-grid">
            <div class="metric-box">
              <div class="label">Oat UI 组件调用次数</div>
              <div class="value">128,490</div>
              <div class="trend up">↑ 18.4% 较上周</div>
            </div>
            <div class="metric-box">
              <div class="label">页面加载速度 (FCP)</div>
              <div class="value">0.14 s</div>
              <div class="trend up">↑ 极致轻量无依赖</div>
            </div>
            <div class="metric-box">
              <div class="label">当前激活弹窗组件</div>
              <div class="value">4 类</div>
              <div class="trend">更新/新建/确认/抽屉</div>
            </div>
            <div class="metric-box">
              <div class="label">测试覆盖与通过率</div>
              <div class="value">100 %</div>
              <div class="trend up">11/11 单元测试通过</div>
            </div>
          </div>

          <div class="db-footer-action">
            <button class="oat-btn primary" @click="updateModalOpen = true">
              🎉 体验更新提示弹窗
            </button>
            <button class="oat-btn secondary" @click="createPageModalOpen = true">
              📝 体验新建页面表单
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- 弹窗挂载 -->
    <OatUpdateModal v-model="updateModalOpen" @confirm="ElMessage.success('已开启新功能体验！')" />

    <OatCreatePageModal v-model="createPageModalOpen" @create="handleCreatePage" />

    <OatConfirmModal
      v-model="confirmModalOpen"
      :type="confirmType"
      :title="confirmTitle"
      :message="confirmMsg"
      @confirm="onConfirmAction"
    />

    <OatDrawer v-model="drawerOpen" title="🔔 全局系统通知" subtitle="Oat UI 极简抽屉">
      <div class="notification-list">
        <div class="notif-item">
          <div class="notif-title">🎉 Oat UI 2.4.0 现已发布</div>
          <div class="notif-desc">包含极简弹窗、更新提示模态框与右侧抽屉套件。</div>
          <div class="notif-time">今天 10:24</div>
        </div>
        <div class="notif-item">
          <div class="notif-title">⚡ 单元测试全数通过</div>
          <div class="notif-desc">导航与核心组件 11/11 项集成测试全部 pass。</div>
          <div class="notif-time">今天 09:12</div>
        </div>
      </div>
      <template #footer>
        <button class="oat-btn secondary" style="width: 100%;" @click="drawerOpen = false">
          全部标记为已读
        </button>
      </template>
    </OatDrawer>
  </div>
</template>

<style scoped lang="scss">
@import './css/index.scss';

.btn-group-row {
  display: flex;
  gap: 8px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .notif-item {
    padding: 12px 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;

    .notif-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .notif-desc {
      font-size: 0.82rem;
      color: #475569;
      line-height: 1.4;
      margin-bottom: 6px;
    }
    .notif-time {
      font-size: 0.75rem;
      color: #94a3b8;
    }
  }
}

.db-footer-action {
  display: flex;
  gap: 12px;
}
</style>
