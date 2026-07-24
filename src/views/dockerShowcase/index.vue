<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const activeTab = ref<'cli' | 'gui'>('cli')

// CLI Solution State
const cliCommands = ref([
  { title: '1. 一键构建镜像 (Dockerfile)', cmd: 'docker build -t nav-bar:latest .' },
  { title: '2. 启动单容器', cmd: 'docker run -d -p 8080:80 --name nav-bar-app nav-bar:latest' },
  { title: '3. Docker Compose 后台服务组启动', cmd: 'docker compose up -d' },
  { title: '4. 查看实时容器运行日志', cmd: 'docker logs -f nav-bar-cli-app' },
  { title: '5. 检查健康状态与端口监听', cmd: 'docker ps --filter "name=nav-bar"' }
])

// GUI Solution State
const containerStatus = ref<'running' | 'paused' | 'stopped'>('running')
const containerLogs = ref<string[]>([
  '[Nginx Core] 2026/07/24 11:12:00 [info] worker process 15 started',
  '[Nginx HTTP] Configuration loaded successfully from /etc/nginx/conf.d/default.conf',
  '[Portainer Agent] Listening on 0.0.0.0:9000 (GUI Web Console active)',
  '[HealthCheck] GET / -> HTTP 200 OK (0.4ms)'
])

const copyText = (text: string, title: string) => {
  navigator.clipboard.writeText(text)
    .then(() => ElMessage.success(`【${title}】配置/指令已成功复制到剪贴板！`))
    .catch(() => ElMessage.error('复制失败，请手动选择复制。'))
}

const toggleContainer = (status: 'running' | 'paused' | 'stopped') => {
  containerStatus.value = status
  const time = new Date().toLocaleTimeString()
  if (status === 'running') {
    containerLogs.value.push(`[${time}] [Docker Engine] Container nav-bar-gui-app resumed/started.`)
    ElMessage.success('可视化控制台：容器已启动恢复运行！')
  } else if (status === 'paused') {
    containerLogs.value.push(`[${time}] [Docker Engine] Container nav-bar-gui-app paused.`)
    ElMessage.warning('可视化控制台：容器已暂停！')
  } else {
    containerLogs.value.push(`[${time}] [Docker Engine] Container nav-bar-gui-app stopped.`)
    ElMessage.info('可视化控制台：容器已停止。')
  }
}

const dockerfileContent = `# Stage 1: Build Vue 3 / Vite static assets
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN npm run build

# Stage 2: Nginx lightweight Web Server
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`

const composeGuiContent = `# 可视化 (GUI) Portainer + 导航站一键集成编排
version: '3.8'

services:
  nav-bar-web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nav-bar-gui-app
    restart: always
    ports:
      - "8080:80"

  portainer-gui:
    image: portainer/portainer-ce:latest
    container_name: portainer-gui-console
    ports:
      - "9000:9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data

volumes:
  portainer_data:`
</script>

<template>
  <div class="docker-showcase-page" style="min-height: 100vh; background: #090d16; color: #f8fafc; padding-bottom: 60px;">
    <!-- Header 头部栏 -->
    <header style="background: linear-gradient(180deg, #0284c7 0%, #0f172a 100%); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 32px 24px 20px;">
      <div style="max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <span style="display: inline-block; background: rgba(255, 255, 255, 0.15); color: #7dd3fc; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; border: 1px solid rgba(255, 255, 255, 0.3); margin-bottom: 8px;">
            🐳 Docker Dual Deployment Solutions
          </span>
          <h1 style="font-size: 1.8rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Docker 命令行 (CLI) &amp; 可视化 (Portainer GUI) 双方案部署
          </h1>
        </div>
        <button style="padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #e2e8f0; font-weight: 700; font-size: 0.88rem; cursor: pointer;" @click="router.push('/dyform')">
          ← 返回导航站
        </button>
      </div>

      <div style="max-width: 1280px; margin: 20px auto 0; display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>💻 方案一：命令行 (CLI) 极简模式</strong> 多阶段构建 Dockerfile + Nginx SPA 配置 + Compose
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem;">
          <strong>🎨 方案二：可视化 (GUI) 面板模式</strong> Portainer CE Web Console + 资源图表 + 容器操控
        </div>
      </div>
    </header>

    <!-- Toolbar 方案切换 Tab -->
    <nav style="max-width: 1280px; margin: 24px auto 16px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div style="display: flex; background: rgba(30,41,59,0.8); padding: 4px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <button style="padding: 8px 20px; border-radius: 8px; font-size: 0.88rem; font-weight: 800; border: none; cursor: pointer;" :style="{ background: activeTab === 'cli' ? '#38bdf8' : 'transparent', color: activeTab === 'cli' ? '#0f172a' : '#94a3b8' }" @click="activeTab = 'cli'">
          💻 方案一：命令行 Docker (CLI)
        </button>
        <button style="padding: 8px 20px; border-radius: 8px; font-size: 0.88rem; font-weight: 800; border: none; cursor: pointer;" :style="{ background: activeTab === 'gui' ? '#38bdf8' : 'transparent', color: activeTab === 'gui' ? '#0f172a' : '#94a3b8' }" @click="activeTab = 'gui'">
          🎨 方案二：可视化 Docker 面板 (Portainer GUI)
        </button>
      </div>
    </nav>

    <!-- Main Workspace -->
    <main style="max-width: 1280px; margin: 0 auto; padding: 0 24px;">
      <!-- 方案一：命令行 CLI Stage -->
      <div v-if="activeTab === 'cli'" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 24px;">
        <!-- Left: CLI Commands -->
        <div style="background: rgba(30,41,59,0.7); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);">
          <h3 style="margin: 0 0 16px; font-size: 1.1rem; color: #38bdf8;">🖥️ 命令行 Docker 构建与运行常用指令</h3>
          
          <div v-for="(item, idx) in cliCommands" :key="idx" style="margin-bottom: 16px; background: rgba(15,23,42,0.8); padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">{{ item.title }}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #060913; padding: 8px 12px; border-radius: 8px; font-family: monospace; font-size: 0.82rem; color: #38bdf8;">
              <span>{{ item.cmd }}</span>
              <button style="padding: 4px 10px; border-radius: 6px; border: none; background: #38bdf8; color: #0f172a; font-weight: 800; font-size: 0.74rem; cursor: pointer;" @click="copyText(item.cmd, item.title)">
                复制
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Dockerfile Code Viewer -->
        <div style="background: rgba(30,41,59,0.7); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="margin: 0; font-size: 1.1rem; color: #38bdf8;">📄 生产级 Dockerfile 配置文件</h3>
            <button style="padding: 6px 14px; border-radius: 8px; border: none; background: #38bdf8; color: #0f172a; font-weight: 800; font-size: 0.78rem; cursor: pointer;" @click="copyText(dockerfileContent, 'Dockerfile')">
              一键复制 Dockerfile
            </button>
          </div>
          <div style="background: #0f172a; border-radius: 10px; padding: 16px; border: 1px solid rgba(255,255,255,0.1);">
            <pre style="margin: 0; font-family: monospace; font-size: 0.82rem; color: #38bdf8; line-height: 1.5; white-space: pre-wrap;"><code>{{ dockerfileContent }}</code></pre>
          </div>
        </div>
      </div>

      <!-- 方案二：可视化 GUI Stage -->
      <div v-else style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 24px;">
        <!-- Left: Portainer GUI Console Simulation -->
        <div style="background: rgba(30,41,59,0.7); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 1.1rem; color: #38bdf8;">🎨 Portainer CE 交互式可视化控制台 (Web GUI)</h3>
            <span style="padding: 4px 10px; border-radius: 12px; font-size: 0.76rem; font-weight: 800;" :style="{ background: containerStatus === 'running' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: containerStatus === 'running' ? '#10b981' : '#ef4444' }">
              状态: {{ containerStatus.toUpperCase() }}
            </span>
          </div>

          <!-- Portainer Dashboard Stats -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
            <div style="background: rgba(15,23,42,0.8); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <div style="font-size: 0.74rem; color: #94a3b8;">CPU 使用率</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #38bdf8; margin-top: 4px;">0.4%</div>
            </div>
            <div style="background: rgba(15,23,42,0.8); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <div style="font-size: 0.74rem; color: #94a3b8;">内存占用</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #10b981; margin-top: 4px;">32.4 MB</div>
            </div>
            <div style="background: rgba(15,23,42,0.8); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <div style="font-size: 0.74rem; color: #94a3b8;">端口映射</div>
              <div style="font-size: 0.9rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">8080:80 / 9000</div>
            </div>
          </div>

          <!-- Container Controls -->
          <div style="display: flex; gap: 10px; margin-bottom: 16px;">
            <button style="flex: 1; padding: 10px; border-radius: 8px; border: none; background: #10b981; color: #0f172a; font-weight: 800; font-size: 0.82rem; cursor: pointer;" @click="toggleContainer('running')">
              ▶️ 启动容器
            </button>
            <button style="flex: 1; padding: 10px; border-radius: 8px; border: none; background: #f59e0b; color: #0f172a; font-weight: 800; font-size: 0.82rem; cursor: pointer;" @click="toggleContainer('paused')">
              ⏸️ 暂停
            </button>
            <button style="flex: 1; padding: 10px; border-radius: 8px; border: none; background: #ef4444; color: #fff; font-weight: 800; font-size: 0.82rem; cursor: pointer;" @click="toggleContainer('stopped')">
              ⏹️ 停止
            </button>
          </div>

          <!-- Console Live Logs -->
          <div style="background: #0f172a; border-radius: 10px; padding: 14px; border: 1px solid rgba(255,255,255,0.1); height: 180px; overflow-y: auto;">
            <div style="font-size: 0.76rem; color: #94a3b8; margin-bottom: 6px;">[Portainer Console Live Output]</div>
            <div v-for="(log, idx) in containerLogs" :key="idx" style="font-family: monospace; font-size: 0.78rem; color: #38bdf8; margin-bottom: 4px;">
              {{ log }}
            </div>
          </div>
        </div>

        <!-- Right: docker-compose.gui.yml Code Viewer -->
        <div style="background: rgba(30,41,59,0.7); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="margin: 0; font-size: 1.1rem; color: #38bdf8;">📊 docker-compose.gui.yml 配置文件</h3>
            <button style="padding: 6px 14px; border-radius: 8px; border: none; background: #38bdf8; color: #0f172a; font-weight: 800; font-size: 0.78rem; cursor: pointer;" @click="copyText(composeGuiContent, 'docker-compose.gui.yml')">
              一键复制 GUI Compose
            </button>
          </div>
          <div style="background: #0f172a; border-radius: 10px; padding: 16px; border: 1px solid rgba(255,255,255,0.1);">
            <pre style="margin: 0; font-family: monospace; font-size: 0.82rem; color: #38bdf8; line-height: 1.5; white-space: pre-wrap;"><code>{{ composeGuiContent }}</code></pre>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
