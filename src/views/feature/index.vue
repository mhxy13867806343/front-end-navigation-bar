<template>
  <div class="feature-page">
    <div class="feature-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <div class="title">🧩 功能页面</div>
      <div style="width: 80px;"></div>
    </div>

    <div class="feature-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="feature-grid">
      <div
        v-for="item in filteredItems"
        :key="item.name"
        class="feature-card"
        @click="handleClick(item)"
      >
        <div class="feature-logo">{{ item.logo }}</div>
        <div class="feature-name">{{ item.name }}</div>
        <div class="feature-desc">{{ item.desc }}</div>
        <div class="feature-card-actions">
          <div v-if="item.external" class="feature-tag">新标签页打开</div>
          <button
            type="button"
            class="feature-copy-btn"
            title="点击复制当前链接地址"
            @click.prevent.stop="copyItemLink(item)"
          >
            📋 复制链接
          </button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showGameDialog"
      :title="gameTitle"
      width="85%"
      top="4vh"
      :close-on-click-modal="false"
      destroy-on-close
      class="game-dialog"
    >
      <component :is="currentGame" v-if="currentGame" @close="showGameDialog = false" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { copyToClipboard } from '@/utils/clipboard'
import { ElMessage } from 'element-plus'
import { getComponentByType } from '@/utils/componentMapper'
import type { Component } from 'vue'

const router = useRouter()
const activeTab = ref<string>('games')
const showGameDialog = ref<boolean>(false)
const currentGame = shallowRef<Component | null>(null)
const gameTitle = ref<string>('')

const tabs = [
  { key: 'games', label: '🎮 游戏列表' },
  { key: 'tools', label: '🛠️ 开发工具' },
  { key: 'media', label: '🎬 媒体工具' },
  { key: 'all', label: '📦 全部' }
]

interface FeatureItem {
  name: string
  desc: string
  logo: string
  category: string
  type?: string
  link?: string
  external?: boolean
}

const items: FeatureItem[] = [
  {
    name: '1942 飞行射击',
    desc: 'Capcom 经典纵版射击复刻，3命5星桶滚闪避',
    logo: '✈️',
    category: 'games',
    link: '1942.html',
    external: true
  },
  {
    name: '哆啦A梦·大雄救援',
    desc: '1986 FC《哆啦A梦》横版冒险复刻，竹蜻蜓飞行+空气炮',
    logo: '🐱',
    category: 'games',
    link: 'doraemon.html',
    external: true
  },
  {
    name: '黄金太阳·封印篇',
    desc: '南晶科技 FC《黄金太阳》复刻，回合制元素战斗+精神力+精灵召唤',
    logo: '☀️',
    category: 'games',
    link: 'goldsun.html',
    external: true
  },
  {
    name: '雪人兄弟 Snow Bros',
    desc: 'FC 经典动作复刻，喷雪冻敌→推滚雪球连杀→踩雪球弹跳上高台，支持双人',
    logo: '⛄',
    category: 'games',
    link: 'snowbros.html',
    external: true
  },
  {
    name: '75 宾果 75 Bingo',
    desc: 'Sachen《75宾果》复刻，1–4 张牌连线派彩，连击倍率+风险下注，攒到目标即胜',
    logo: '🎯',
    category: 'games',
    link: 'bingo75.html',
    external: true
  },
  {
    name: '激龟快打 TMNT',
    desc: '科乐美 NES《激龟快打》复刻，1v1 忍者神龟格斗：拳/踢/必杀/投技/防御，回合制+CPU，支持 PC 与移动端',
    logo: '🐢',
    category: 'games',
    link: 'tmnt.html',
    external: true
  },
  { name: '推箱子', desc: '经典推箱子游戏，支持多个关卡', logo: '🎲', category: 'games', type: 'game' },
  { name: '接水果游戏', desc: '接住水果得分，小心炸弹！', logo: '🧺', category: 'games', type: 'fruitgame' },
  { name: '贪吃蛇大作战', desc: '经典贪吃蛇，挑战你的最高分', logo: '🐍', category: 'games', type: 'snake' },
  { name: '俄罗斯方块', desc: '经典像素风，消行动作消除游戏', logo: '🧱', category: 'games', type: 'tetris' },
  { name: '2048 经典合并', desc: '滑动数字块完成合并，冲击 2048 分', logo: '🔢', category: 'games', type: 'game2048' },
  { name: '扫雷小游戏', desc: '经典 Windows 扫雷，避开所有雷区', logo: '💣', category: 'games', type: 'minesweeper' },
  { name: '井字棋对战', desc: '经典人机对战/双人同屏智力对决', logo: '❌', category: 'games', type: 'tictactoe' },
  { name: '90坦克大战', desc: '守卫基地，击退来袭的敌军坦克', logo: '🛡️', category: 'games', type: 'battlecity' },
  { name: '经典打砖块', desc: '控制挡板反弹小球，击碎全部砖块', logo: '🧱', category: 'games', type: 'brickbreaker' },
  { name: '飞翔小鸟', desc: '点击起飞，穿越管道挑战更高分', logo: '🐦', category: 'games', type: 'flappybird' },
  { name: '太空战机', desc: '驾驶战机穿梭星海，消灭敌方舰队', logo: '🚀', category: 'games', type: 'spaceshooter' },

  { name: '传统开发工具箱', desc: 'JSON/XML/SQL 格式化、Base64、MD5/SHA256 等', logo: '🛠️', category: 'tools', type: 'devtools' },
  { name: '动态表单', desc: '可视化表单设计器', logo: '📝', category: 'tools', type: 'dyform' },
  { name: 'Qite.js Todo & 搜索', desc: '基于 Qite.js 的 Todo 待办与搜索过滤', logo: '📝', category: 'tools', type: 'qitetodo' },

  { name: '图片处理工具', desc: '支持图片裁剪、旋转、缩放等功能', logo: '🖼️', category: 'media', type: 'image' },
  { name: '音乐播放器', desc: '在线音乐播放器', logo: '🎵', category: 'media', type: 'video' }
]

const filteredItems = computed<FeatureItem[]>(() =>
  activeTab.value === 'all' ? items : items.filter((i) => i.category === activeTab.value)
)

function handleClick(item: FeatureItem): void {
  if (item.external && item.link) {
    // BASE_URL honors vite's base ('/front-end-navigation-bar/') in dev & build
    const url = import.meta.env.BASE_URL + item.link.replace(/^\/+/, '')
    window.open(url, '_blank')
    return
  }
  if (item.type) {
    const comp = getComponentByType(item.type)
    if (comp) {
      currentGame.value = comp
      gameTitle.value = item.name
      showGameDialog.value = true
      return
    }
  }
  if (item.link) {
    router.push(item.link)
  }
}

function copyItemLink(item: FeatureItem): void {
  let targetUrl = window.location.href
  if (item.link) {
    if (item.link.startsWith('http://') || item.link.startsWith('https://')) {
      targetUrl = item.link
    } else {
      const cleanPath = item.link.replace(/^\/+/, '')
      targetUrl = window.location.origin + import.meta.env.BASE_URL + cleanPath
    }
  } else {
    const url = new URL(window.location.href)
    url.searchParams.set('item', item.name)
    targetUrl = url.toString()
  }

  void copyToClipboard(targetUrl, `「${item.name}」链接已成功复制到剪贴板！`)
}

function goBack(): void {
  router.push('/toolbox')
}
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
