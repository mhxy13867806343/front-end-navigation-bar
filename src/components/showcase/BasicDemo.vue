<script setup>
import { Edit, Delete, Search, Star, Message, Loading } from '@element-plus/icons-vue'
</script>

<template>
  <div>
    <div class="demo-section">
      <h4 class="demo-title">Button 按钮</h4>
      <div class="demo-row">
        <el-button>默认按钮</el-button>
        <el-button type="primary">主要按钮</el-button>
        <el-button type="success">成功按钮</el-button>
        <el-button type="warning">警告按钮</el-button>
        <el-button type="danger">危险按钮</el-button>
        <el-button type="info">信息按钮</el-button>
      </div>
      <div class="demo-row">
        <el-button type="primary" plain>朴素按钮</el-button>
        <el-button type="primary" round>圆角按钮</el-button>
        <el-button type="primary" circle :icon="Search" />
        <el-button type="primary" loading>加载中</el-button>
        <el-button type="primary" disabled>禁用按钮</el-button>
        <el-button type="primary" :icon="Edit">图标按钮</el-button>
      </div>
      <div class="demo-row">
        <el-button-group>
          <el-button type="primary" :icon="Edit">编辑</el-button>
          <el-button type="primary" :icon="Delete">删除</el-button>
        </el-button-group>
        <el-button size="large">大号</el-button>
        <el-button>默认</el-button>
        <el-button size="small">小号</el-button>
      </div>
    </div>

    <div class="demo-section">
      <h4 class="demo-title">Icon 图标</h4>
      <div class="demo-row" style="font-size: 22px; align-items: center;">
        <el-icon color="#409eff"><Edit /></el-icon>
        <el-icon color="#67c23a"><Search /></el-icon>
        <el-icon color="#e6a23c"><Star /></el-icon>
        <el-icon color="#f56c6c"><Delete /></el-icon>
        <el-icon color="#909399"><Message /></el-icon>
        <el-icon class="is-loading" color="#409eff"><Loading /></el-icon>
      </div>
    </div>

    <div class="demo-section">
      <h4 class="demo-title">Layout 布局（Row / Col）</h4>
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
    </div>

    <div class="demo-section">
      <h4 class="demo-title">Container 布局容器</h4>
      <el-container class="container-demo">
        <el-header class="container-header">Header 头部</el-header>
        <el-container>
          <el-aside width="140px" class="container-aside">Aside 侧边栏</el-aside>
          <el-main class="container-main">Main 主内容区</el-main>
        </el-container>
        <el-footer class="container-footer">Footer 底部</el-footer>
      </el-container>
    </div>

    <div class="demo-section">
      <h4 class="demo-title">Link 链接</h4>
      <div class="demo-row">
        <el-link type="default">默认链接</el-link>
        <el-link type="primary">主要链接</el-link>
        <el-link type="success">成功链接</el-link>
        <el-link type="warning">警告链接</el-link>
        <el-link type="danger">危险链接</el-link>
        <el-link type="primary" :underline="false">无下划线</el-link>
        <el-link disabled>禁用链接</el-link>
      </div>
    </div>

    <div class="demo-section">
      <h4 class="demo-title">Text 文本</h4>
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

    <div class="demo-section">
      <h4 class="demo-title">Tag 标签</h4>
      <div class="demo-row">
        <el-tag>标签一</el-tag>
        <el-tag type="success">标签二</el-tag>
        <el-tag type="warning">标签三</el-tag>
        <el-tag type="danger">标签四</el-tag>
        <el-tag type="info">标签五</el-tag>
        <el-tag effect="dark">深色标签</el-tag>
        <el-tag effect="plain" round>圆角标签</el-tag>
        <el-tag closable>可关闭</el-tag>
      </div>
    </div>

    <div class="demo-section">
      <h4 class="demo-title">Space 间距</h4>
      <el-space wrap :size="16">
        <el-card v-for="i in 3" :key="i" shadow="hover" style="width: 160px;">
          <template #header>卡片 {{ i }}</template>
          Space 自动间距
        </el-card>
      </el-space>
    </div>

    <div class="demo-section">
      <h4 class="demo-title">Scrollbar 滚动条</h4>
      <el-scrollbar height="120px" class="scrollbar-demo">
        <p v-for="i in 12" :key="i" class="scrollbar-item">滚动列表项 {{ i }}</p>
      </el-scrollbar>
    </div>

    <div class="demo-section">
      <h4 class="demo-title">Divider 分割线</h4>
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
</style>
