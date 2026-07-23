<script setup lang="ts">
import { useRouter } from 'vue-router'

interface ToolboxItem {
  id: string
  name: string
  desc: string
  icon: string
  path: string
  tag: string
}

const router = useRouter()

const toolboxItems: ToolboxItem[] = [
  {
    id: 'terminal',
    name: '终端界面',
    desc: 'macOS 风格终端资源入口，集中查看终端模拟器、Shell 美化和 Web 终端组件。',
    icon: '⌨️',
    path: '/terminal',
    tag: 'Terminal'
  },
  {
    id: 'runcode',
    name: '在线运行代码',
    desc: '类似 Qzxdp RunCode 的在线代码工作台，支持编辑、输入、输出和前端本地运行。',
    icon: '▶️',
    path: '/runcode',
    tag: 'RunCode'
  },
  {
    id: 'api-center',
    name: '接口中心',
    desc: '统一查看所有 API 分类与接口入口，先看列表，再进入独立详情页请求和展示结果。',
    icon: '🧩',
    path: '/api-center',
    tag: 'API Center'
  },
  {
    id: 'big-screen',
    name: '可视化大屏',
    desc: '使用大屏模板、自适应缩放与 mock 数据构建驾驶舱式可视化页面，支持点击查看模块详情。',
    icon: '📊',
    path: '/big-screen',
    tag: 'Big Screen'
  },
  {
    id: 'three-showcase',
    name: 'Three.js 示例中心',
    desc: '集中展示从基础到高级的 Three.js 示例代码、参数调节、互动实验和轻量小游戏。',
    icon: '🪐',
    path: '/three-showcase',
    tag: 'Three.js'
  },
  {
    id: 'cnblogs',
    name: '博客园新闻',
    desc: '实时关注博客园最新发布、推荐新闻与热门榜单 (今日/昨日/本周/本月)。',
    icon: '📰',
    path: '/cnblogs',
    tag: 'IT 资讯'
  },
  {
    id: 'github-cn',
    name: 'GitHub 中文社区',
    desc: '深度开源技术解读、热门趋势、排行榜 (按Star/Fork/更新时间)、严选周刊与开源项目图鉴。',
    icon: '🐙',
    path: '/github-cn',
    tag: '开源社区'
  },
  {
    id: 'bilibili-trending',
    name: 'Bilibili 热门与热搜',
    desc: '接入 Bilibili 热门页 Network 接口，查看综合热门、每周必看、入站必刷、排行榜、音乐榜与搜索热搜。',
    icon: '📺',
    path: '/bilibili-trending',
    tag: 'B 站热门'
  },
  {
    id: 'bilibili-live',
    name: '直播',
    desc: '进入直播页后点击 Bibi 直播，再按全部、聊天室、电台、网游、单机获取 Bilibili 直播间数据。',
    icon: '📡',
    path: '/bilibili-live',
    tag: 'Bibi 直播'
  },
  {
    id: 'star',
    name: '星座运势查询',
    desc: '实时查询十二星座今日、明日、本周、本月与本年综合运势、感情、事业、财运及幸运指南。',
    icon: '✨',
    path: '/star',
    tag: 'ALAPI 星座'
  },
  {
    id: 'idcard',
    name: '身份证信息查询',
    desc: '基于 ALAPI 校验解析 15/18 位身份证归属地行政区划、出生年月日、周岁年龄、性别、星座与生肖，并支持 15 位升级 18 位。',
    icon: '🪪',
    path: '/idcard',
    tag: 'ALAPI 身份证'
  },
  {
    id: 'lolm',
    name: '英雄联盟手游国服数据',
    desc: '同步腾讯官方《英雄联盟手游》国服全服高阶排位战报，查看钻石、大师、王者、峡谷之巅各分路英雄胜率、登场率与BAN率。',
    icon: '⚔️',
    path: '/lolm',
    tag: 'LOLM 国服'
  }
]

const openTool = (item: ToolboxItem): Promise<void | Error> => router.push(item.path)
</script>

<template>
  <main class="toolbox-hub">
    <section class="toolbox-hero">
      <div>
        <p class="toolbox-kicker">实用工具箱</p>
        <h1>工具集合</h1>
        <p>终端、在线运行代码，以及后续新增的这类独立工具，都从这里统一进入。</p>
      </div>
    </section>

    <section class="toolbox-list" aria-label="工具列表">
      <button
        v-for="item in toolboxItems"
        :key="item.id"
        type="button"
        class="toolbox-card"
        @click="openTool(item)"
      >
        <span class="toolbox-icon">{{ item.icon }}</span>
        <span class="toolbox-card-main">
          <strong>{{ item.name }}</strong>
          <em>{{ item.tag }}</em>
          <span>{{ item.desc }}</span>
        </span>
        <span class="toolbox-arrow">›</span>
      </button>
    </section>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
