<script setup>
import { ref, nextTick } from 'vue'
import { 
  Edit, Delete, Search, Star, Message, Loading, Share, 
  Connection, Cpu, DataAnalysis, Monitor, Operation, 
  User, Setting, Tools, Trophy, Link as LinkIcon 
} from '@element-plus/icons-vue'

// ------ Dynamic Tag List ------
const dynamicTags = ref(['Vue 3', 'Vite', 'Element Plus'])
const inputVisible = ref(false)
const inputValue = ref('')
const saveTagInputRef = ref(null)

const handleClose = (tag) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    saveTagInputRef.value?.input?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>

<template>
  <div>
    <!-- 1. Button 按钮 -->
    <div class="demo-section">
      <h4 class="demo-title">Button 按钮样式全汇集</h4>
      <div class="demo-row">
        <el-button>默认按钮</el-button>
        <el-button type="primary">主要按钮</el-button>
        <el-button type="success">成功按钮</el-button>
        <el-button type="warning">警告按钮</el-button>
        <el-button type="danger">危险按钮</el-button>
        <el-button type="info">信息按钮</el-button>
      </div>
      <div class="demo-row" style="margin-top: 10px;">
        <el-button type="primary" plain>朴素按钮</el-button>
        <el-button type="success" plain>成功朴素</el-button>
        <el-button type="primary" round>圆角主要</el-button>
        <el-button type="danger" round>圆角危险</el-button>
        <el-button type="primary" circle :icon="Search" />
        <el-button type="success" circle :icon="Star" />
        <el-button type="primary" loading>加载中</el-button>
        <el-button type="primary" disabled>禁用按钮</el-button>
      </div>
      <div class="demo-row" style="margin-top: 10px;">
        <el-button-group>
          <el-button type="primary" :icon="Edit">编辑</el-button>
          <el-button type="primary" :icon="Share">分享</el-button>
          <el-button type="primary" :icon="Delete">删除</el-button>
        </el-button-group>
        <el-button size="large" style="margin-left: 12px;">大号</el-button>
        <el-button size="default">默认</el-button>
        <el-button size="small">小号</el-button>
      </div>
      <div class="demo-row" style="margin-top: 10px;">
        <el-button link>链接按钮</el-button>
        <el-button type="primary" link>主要链接</el-button>
        <el-button type="danger" link>危险链接</el-button>
        <el-button text>文本按钮</el-button>
        <el-button type="primary" text bg>带背景文本</el-button>
      </div>
    </div>

    <!-- 2. Icon 图标 -->
    <div class="demo-section">
      <h4 class="demo-title">Icon 图标矩阵展厅</h4>
      <div class="icon-grid">
        <div class="icon-item"><el-icon color="#409eff" size="20"><Edit /></el-icon><span>编辑</span></div>
        <div class="icon-item"><el-icon color="#67c23a" size="20"><Search /></el-icon><span>搜索</span></div>
        <div class="icon-item"><el-icon color="#e6a23c" size="20"><Star /></el-icon><span>星星</span></div>
        <div class="icon-item"><el-icon color="#f56c6c" size="20"><Delete /></el-icon><span>删除</span></div>
        <div class="icon-item"><el-icon color="#909399" size="20"><Message /></el-icon><span>消息</span></div>
        <div class="icon-item"><el-icon color="#409eff" size="20"><Connection /></el-icon><span>连接</span></div>
        <div class="icon-item"><el-icon color="#67c23a" size="20"><Cpu /></el-icon><span>CPU</span></div>
        <div class="icon-item"><el-icon color="#e6a23c" size="20"><DataAnalysis /></el-icon><span>分析</span></div>
        <div class="icon-item"><el-icon color="#f56c6c" size="20"><Monitor /></el-icon><span>显示器</span></div>
        <div class="icon-item"><el-icon color="#909399" size="20"><Operation /></el-icon><span>操作</span></div>
        <div class="icon-item"><el-icon color="#409eff" size="20"><Trophy /></el-icon><span>奖杯</span></div>
        <div class="icon-item"><el-icon class="is-loading" color="#409eff" size="20"><Loading /></el-icon><span>加载中</span></div>
      </div>
    </div>

    <!-- 3. Layout 布局 -->
    <div class="demo-section">
      <h4 class="demo-title">Layout 响应式网格布局（Row / Col）</h4>
      <el-row :gutter="12">
        <el-col :span="8"><div class="layout-block dark">span=8</div></el-col>
        <el-col :span="8"><div class="layout-block light">span=8</div></el-col>
        <el-col :span="8"><div class="layout-block dark">span=8</div></el-col>
      </el-row>
      <el-row :gutter="12" style="margin-top: 12px;">
        <el-col :span="6"><div class="layout-block light">span=6</div></el-col>
        <el-col :span="12"><div class="layout-block dark">span=12</div></el-col>
        <el-col :span="6"><div class="layout-block light">span=6</div></el-col>
      </el-row>
      <el-row :gutter="12" style="margin-top: 12px;">
        <el-col :span="4"><div class="layout-block dark">span=4</div></el-col>
        <el-col :span="16" :offset="4"><div class="layout-block light">span=16 (offset=4)</div></el-col>
      </el-row>
    </div>

    <!-- 4. Container 布局容器 -->
    <div class="demo-section">
      <h4 class="demo-title">Container 圣杯布局容器</h4>
      <el-container class="container-demo">
        <el-header class="container-header">Header 头部区域</el-header>
        <el-container>
          <el-aside width="140px" class="container-aside">Aside 侧边栏</el-aside>
          <el-main class="container-main">Main 主内容核心区</el-main>
        </el-container>
        <el-footer class="container-footer">Footer 底部版权栏</el-footer>
      </el-container>
    </div>

    <!-- 5. Link 链接 -->
    <div class="demo-section">
      <h4 class="demo-title">Link 状态链接</h4>
      <div class="demo-row">
        <el-link type="default">默认链接</el-link>
        <el-link type="primary">主要链接</el-link>
        <el-link type="success">成功链接</el-link>
        <el-link type="warning">警告链接</el-link>
        <el-link type="danger">危险链接</el-link>
        <el-link type="primary" :underline="false">无下划线</el-link>
        <el-link disabled>禁用链接</el-link>
        <el-link :icon="LinkIcon">图标链接</el-link>
      </div>
    </div>

    <!-- 6. Text 文本 -->
    <div class="demo-section">
      <h4 class="demo-title">Text 排版文本</h4>
      <div class="demo-row">
        <el-text>默认文本</el-text>
        <el-text type="primary">主要文本</el-text>
        <el-text type="success">成功文本</el-text>
        <el-text type="warning">警告文本</el-text>
        <el-text type="danger">危险文本</el-text>
        <el-text tag="b">加粗文本</el-text>
        <el-text tag="del">删除线</el-text>
        <el-text truncated style="max-width: 150px;">这是一段会被截断的超长文本内容示例</el-text>
      </div>
    </div>

    <!-- 7. Dynamic Tag 动态标签 -->
    <div class="demo-section">
      <h4 class="demo-title">Tag 动态操作标签（点击删除与输入追加）</h4>
      <div class="demo-row" style="align-items: center; gap: 8px;">
        <el-tag
          v-for="tag in dynamicTags"
          :key="tag"
          closable
          :disable-transitions="false"
          @close="handleClose(tag)"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="saveTagInputRef"
          v-model="inputValue"
          size="small"
          style="width: 80px;"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button v-else size="small" @click="showInput">
          ➕ 新增 Tag
        </el-button>
      </div>
    </div>

    <!-- 8. Space 间距 -->
    <div class="demo-section">
      <h4 class="demo-title">Space 自适应弹性间距</h4>
      <el-space wrap :size="16">
        <el-card v-for="i in 3" :key="i" shadow="hover" style="width: 160px; border-radius: 8px;">
          <template #header>
            <span style="font-size: 13px; font-weight: bold;">卡片 {{ i }}</span>
          </template>
          <span style="font-size: 12px;">Space 自动间距布局排版</span>
        </el-card>
      </el-space>
    </div>

    <!-- 9. Scrollbar 滚动条 -->
    <div class="demo-section">
      <h4 class="demo-title">Scrollbar 滚动条（垂直与水平双滚动）</h4>
      <el-scrollbar height="120px" class="scrollbar-demo">
        <p v-for="i in 10" :key="i" class="scrollbar-item">垂直列表项 {{ i }}</p>
      </el-scrollbar>
      
      <el-scrollbar style="margin-top: 12px; max-width: 450px;">
        <div class="scrollbar-flex-content">
          <p v-for="i in 15" :key="i" class="scrollbar-item horizontal">
            水平项 {{ i }}
          </p>
        </div>
      </el-scrollbar>
    </div>

    <!-- 10. Divider 分割线 -->
    <div class="demo-section">
      <h4 class="demo-title">Divider 排版分割线</h4>
      <el-text>上面的内容</el-text>
      <el-divider content-position="center">分割线文案</el-divider>
      <el-text>下面的内容</el-text>
      <div class="demo-row" style="margin-top: 12px; align-items: center;">
        <el-text>行内</el-text>
        <el-divider direction="vertical" />
        <el-text>垂直</el-text>
        <el-divider direction="vertical" />
        <el-text>分割</el-text>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-block {
  border-radius: 6px;
  min-height: 36px;
  line-height: 36px;
  text-align: center;
  color: #fff;
  font-size: 12px;
}
.layout-block.dark { background: #409eff; }
.layout-block.light { background: #a0cfff; }

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  max-width: 600px;
}
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: var(--el-fill-color-light, #f5f7fa);
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  font-size: 11px;
  color: var(--el-text-color-secondary, #909399);
  transition: all 0.2s;
  cursor: pointer;
}
.icon-item:hover {
  background: var(--el-color-primary-light-9, #ecf5ff);
  color: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
  transform: translateY(-2px);
}

.container-demo {
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 8px;
  overflow: hidden;
  max-width: 560px;
}
.container-header,
.container-footer {
  background: #b3c0d1;
  color: #fff;
  text-align: center;
  line-height: 48px;
  height: 48px !important;
}
.container-aside {
  background: #d3dce6;
  color: #333;
  text-align: center;
  line-height: 80px;
}
.container-main {
  background: #e9eef3;
  color: #333;
  text-align: center;
  line-height: 80px;
  padding: 0;
}

.scrollbar-demo {
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 8px;
  max-width: 400px;
}
.scrollbar-item {
  margin: 8px 12px;
  padding: 6px 10px;
  background: var(--el-color-primary-light-9, #ecf5ff);
  color: var(--el-color-primary, #409eff);
  border-radius: 4px;
  font-size: 13px;
}
.scrollbar-flex-content {
  display: flex;
  gap: 10px;
  padding: 6px;
}
.scrollbar-item.horizontal {
  margin: 0;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
