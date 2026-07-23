<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ErrorLayout from './ErrorLayout.vue'

const router = useRouter()

const showStackTrace = ref(false)
const isHealing = ref(false)
const healSuccess = ref(false)
const feedbackModalVisible = ref(false)
const feedbackContent = ref('')

const diagnostics = ref([
  { name: 'PostgreSQL 主数据库', status: 'ok', detail: '连接池正常 (24/50)' },
  { name: 'Redis 缓存中间件', status: 'error', detail: 'Connection refused: 127.0.0.1:6379' },
  { name: 'RPC 微服务集群', status: 'warning', detail: '响应耗时过高 (980ms)' },
  { name: 'Object Storage OSS', status: 'ok', detail: '存储节点可用性 100%' }
])

const stackTrace = `NullPointerException: Cannot read field "userToken" because "authSession" is null
    at com.hooksvue.gateway.filter.AuthFilter.doFilter(AuthFilter.java:142)
    at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:337)
    at org.springframework.web.filter.CorsFilter.doFilterInternal(CorsFilter.java:92)
    at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117)
    at io.undertow.servlet.handlers.FilterHandler$VirtualFilterChain.doFilter(FilterHandler.java:79)`

const triggerAutoHeal = () => {
  isHealing.value = true
  ElMessage.info('🚀 正在启动服务器自动修复程序与节点自我清理...')

  setTimeout(() => {
    isHealing.value = false
    healSuccess.value = true
    diagnostics.value[1].status = 'ok'
    diagnostics.value[1].detail = '自动服务重启完毕，Redis 连接成功'
    diagnostics.value[2].status = 'ok'
    diagnostics.value[2].detail = '延迟降至正常 12ms'
    ElMessage.success('🎉 服务器自我修复完成！全部中间件服务已恢复正常运行！')
  }, 2200)
}

const submitFeedback = () => {
  if (!feedbackContent.value.trim()) {
    ElMessage.warning('请描述您触发错误时的具体操作步骤！')
    return
  }
  ElMessage.success('异常报告已归档并推送到 DevOps 监控告警群！工单号：#ERR-9982')
  feedbackContent.value = ''
  feedbackModalVisible.value = false
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <ErrorLayout>
    <div class="error-container">
      <div class="visual-hero">
        <div class="fire-circle" :class="{ healing: isHealing, healed: healSuccess }">
          <span class="fire-icon">{{ healSuccess ? '✅' : '🔥' }}</span>
          <div class="glitch-ring"></div>
        </div>
        <div class="error-code">500</div>
      </div>

      <div class="error-info">
        <h1 class="error-title">
          HTTP 500 Internal Server Error / {{ healSuccess ? '服务器已恢复' : '服务器内部异常崩溃' }}
        </h1>
        <p class="error-desc">
          服务器在处理当前请求时遭遇未捕获的运行时异常或下游服务中断。技术团队已收到系统告警。
        </p>

        <!-- Diagnostics Card -->
        <div class="diagnostic-card">
          <div class="card-header">
            <span>🛠️ 实时微服务与中间件诊断结果</span>
            <el-button type="info" link size="small" @click="showStackTrace = !showStackTrace">
              {{ showStackTrace ? '收起 StackTrace' : '展开 StackTrace 日志' }}
            </el-button>
          </div>

          <div class="diag-grid">
            <div
              v-for="d in diagnostics"
              :key="d.name"
              class="diag-item"
              :class="d.status"
            >
              <div class="item-title">
                <span class="status-dot"></span>
                <strong>{{ d.name }}</strong>
              </div>
              <span class="item-detail">{{ d.detail }}</span>
            </div>
          </div>

          <!-- Stack Trace Inspector -->
          <div v-if="showStackTrace" class="stack-inspector">
            <pre><code>{{ stackTrace }}</code></pre>
          </div>
        </div>

        <div class="action-btn-group">
          <el-button
            type="success"
            size="large"
            :loading="isHealing"
            @click="triggerAutoHeal"
          >
            ⚡ {{ isHealing ? '自动修复与重启中...' : healSuccess ? '已修复 (点击再次检测)' : '一键启动服务自我修复' }}
          </el-button>
          <el-button type="warning" size="large" plain @click="feedbackModalVisible = true">
            🐛 提交 Bug 崩溃报告
          </el-button>
          <el-button size="large" @click="goHome">
            🏠 返回首页
          </el-button>
        </div>
      </div>

      <!-- Feedback Modal -->
      <el-dialog v-model="feedbackModalVisible" title="反馈 500 崩溃异常" width="460px" append-to-body align-center>
        <el-form label-position="top">
          <el-form-item label="操作复现步骤描述">
            <el-input
              v-model="feedbackContent"
              type="textarea"
              :rows="4"
              placeholder="请简单说明在点击什么按钮或输入什么数据时触发了该 500 报错..."
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="feedbackModalVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFeedback">提交告警报告</el-button>
        </template>
      </el-dialog>
    </div>
  </ErrorLayout>
</template>

<style scoped lang="scss">
.error-container {
  max-width: 900px;
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

  .fire-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.05) 100%);
    border: 2px solid rgba(239, 68, 68, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    position: relative;
    transition: all 0.5s ease;

    &.healing {
      border-color: #f59e0b;
      animation: spinBorder 1s linear infinite;
    }

    &.healed {
      background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.05) 100%);
      border-color: #10b981;
    }

    .fire-icon {
      font-size: 58px;
      animation: pulseFire 2s ease-in-out infinite;
    }
  }

  .error-code {
    font-size: 88px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 4px;
    background: linear-gradient(135deg, #f87171 0%, #ef4444 50%, #b91c1c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 30px rgba(239, 68, 68, 0.35);
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
    max-width: 660px;
    margin: 0 auto 24px;
    line-height: 1.6;
  }

  .diagnostic-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 20px;
    text-align: left;
    margin-bottom: 32px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-weight: 600;
      color: #cbd5e1;
      font-size: 14px;
    }

    .diag-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;

      .diag-item {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;

        .item-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #f1f5f9;

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }
        }

        .item-detail {
          font-size: 11px;
          color: #94a3b8;
        }

        &.ok {
          border-color: rgba(16, 185, 129, 0.3);
          .status-dot { background: #10b981; box-shadow: 0 0 8px #10b981; }
        }

        &.warning {
          border-color: rgba(245, 158, 11, 0.3);
          .status-dot { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
        }

        &.error {
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.08);
          .status-dot { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
        }
      }
    }

    .stack-inspector {
      margin-top: 16px;
      background: #06090e;
      border-radius: 8px;
      padding: 12px;
      overflow-x: auto;

      pre {
        margin: 0;
        font-family: monospace;
        font-size: 12px;
        color: #fca5a5;
        line-height: 1.5;
      }
    }
  }

  .action-btn-group {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@keyframes spinBorder {
  to { transform: rotate(360deg); }
}

@keyframes pulseFire {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
