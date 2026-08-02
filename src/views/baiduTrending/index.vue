<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ContentFavoriteButton from '../../components/ContentFavoriteButton.vue'
import ShareButton from '../../components/ShareButton.vue'
import { resolveApiUrl } from '../../utils/resolveApiUrl'
import { requestJinaJson } from '../../utils/jinaReader'

type TabType = 'movie' | 'novel' | 'teleplay' | 'realtime' | 'game'

interface Props {
  tab?: TabType
  title?: string
  subtitle?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  tab: undefined,
  title: '',
  subtitle: '',
  icon: ''
})

interface BaiduTrendingItem {
  id: string
  rank: number
  word: string
  img: string
  hotScore: string
  desc: string
  show: string[]
  url: string
  hotTag: string
}

interface BaiduApiResponseContent {
  word?: string
  img?: string
  hotScore?: string | number
  desc?: string
  show?: string[]
  url?: string
  rawUrl?: string
  hotTag?: string
}

interface BaiduApiResponseCard {
  component?: string
  content?: BaiduApiResponseContent[]
}

interface BaiduApiResponseData {
  cards?: BaiduApiResponseCard[]
}

interface BaiduApiResponse {
  status: number
  data?: BaiduApiResponseData
}

const route = useRoute()
const router = useRouter()

const tabs: Array<{ id: TabType; label: string; icon: string }> = [
  { id: 'movie', label: '电影榜', icon: '🎬' },
  { id: 'novel', label: '小说榜', icon: '📚' },
  { id: 'teleplay', label: '电视剧榜', icon: '📺' },
  { id: 'realtime', label: '实时热搜', icon: '🔥' },
  { id: 'game', label: '游戏榜', icon: '🎮' }
]

const tabMetaMap: Record<TabType, { title: string; subtitle: string; icon: string }> = {
  movie: { title: '百度电影热榜', subtitle: '百度风云榜·全网热门电影排行', icon: '🎬' },
  novel: { title: '百度小说热榜', subtitle: '百度风云榜·全网热门小说排行', icon: '📚' },
  teleplay: { title: '百度电视剧热榜', subtitle: '百度风云榜·全网热门剧集排行', icon: '📺' },
  realtime: { title: '百度热搜与热榜', subtitle: '百度风云榜·全网实时搜素风向标', icon: '🐾' },
  game: { title: '百度游戏热榜', subtitle: '百度风云榜·热门游戏排行榜', icon: '🎮' }
}

const initialTab = computed<TabType>(() => {
  if (props.tab) return props.tab
  const queryTab = route.query.tab as TabType | undefined
  if (queryTab && tabs.some(t => t.id === queryTab)) return queryTab
  return 'movie'
})

const activeTab = ref<TabType>(initialTab.value)
const loading = ref<boolean>(false)
const updateTime = ref<string>('')
const errorMessage = ref<string>('')
const trendingItems = ref<BaiduTrendingItem[]>([])

const displayTitle = computed(() => {
  if (props.title) return props.title
  return tabMetaMap[activeTab.value]?.title || '百度热榜'
})

const displaySubtitle = computed(() => {
  if (props.subtitle) return props.subtitle
  return tabMetaMap[activeTab.value]?.subtitle || '百度风云榜数据'
})

const displayIcon = computed(() => {
  if (props.icon) return props.icon
  return tabMetaMap[activeTab.value]?.icon || '🐾'
})

const formatNowTime = (): string => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}

const getFallbackItems = (tab: TabType): BaiduTrendingItem[] => {
  if (tab === 'movie') {
    return [
      { id: 'm-1', rank: 1, word: '抓娃娃', img: '', hotScore: '984,520', desc: '沈腾、马丽领衔主演励志喜剧，全网热映中。', show: ['主演：沈腾, 马丽'], url: 'https://www.baidu.com/s?wd=抓娃娃', hotTag: '热' },
      { id: 'm-2', rank: 2, word: '默杀', img: '', hotScore: '891,200', desc: '柯汶利执导悬疑犯罪大片，悬疑高能反转。', show: ['主演：王传君, 张钧甯'], url: 'https://www.baidu.com/s?wd=默杀', hotTag: '爆' },
      { id: 'm-3', rank: 3, word: '异形：夺命舰', img: '', hotScore: '782,100', desc: '经典科幻惊悚系列新章，太空绝境求生。', show: ['主演：卡莉·史派妮'], url: 'https://www.baidu.com/s?wd=异形夺命舰', hotTag: '热' },
      { id: 'm-4', rank: 4, word: '死侍与金刚狼', img: '', hotScore: '690,400', desc: '漫威超级英雄合体联手，爆笑爽快对决。', show: ['主演：瑞安·雷诺兹, 休·杰克曼'], url: 'https://www.baidu.com/s?wd=死侍与金刚狼', hotTag: '新' },
      { id: 'm-5', rank: 5, word: '解密', img: '', hotScore: '592,000', desc: '陈思诚导演麦家同名小说改编传奇故事。', show: ['主演：刘昊然, 约翰·库萨克'], url: 'https://www.baidu.com/s?wd=解密电影', hotTag: '热' }
    ]
  } else if (tab === 'novel') {
    return [
      { id: 'n-1', rank: 1, word: '宿命之环', img: '', hotScore: '965,300', desc: '爱潜水的乌贼著作，《诡秘之主》同设定第二部作品。', show: ['作者：爱潜水的乌贼'], url: 'https://www.baidu.com/s?wd=宿命之环', hotTag: '热' },
      { id: 'n-2', rank: 2, word: '深海余烬', img: '', hotScore: '870,400', desc: '远瞳奇幻科幻长篇，诡秘与蒸汽交织的海洋物语。', show: ['作者：远瞳'], url: 'https://www.baidu.com/s?wd=深海余烬', hotTag: '爆' },
      { id: 'n-3', rank: 3, word: '万相之王', img: '', hotScore: '792,000', desc: '天蚕土豆玄幻力作，天地万相，少年崛起。', show: ['作者：天蚕土豆'], url: 'https://www.baidu.com/s?wd=万相之王', hotTag: '热' },
      { id: 'n-4', rank: 4, word: '光阴之外', img: '', hotScore: '710,500', desc: '耳根最新仙侠小说，残阳如血，光阴之外。', show: ['作者：耳根'], url: 'https://www.baidu.com/s?wd=光阴之外', hotTag: '新' },
      { id: 'n-5', rank: 5, word: '道诡异仙', img: '', hotScore: '680,900', desc: '狐尾的笔惊悚修仙爆款，疯癫与真相交织。', show: ['作者：狐尾的笔'], url: 'https://www.baidu.com/s?wd=道诡异仙', hotTag: '热' }
    ]
  } else if (tab === 'teleplay') {
    return [
      { id: 't-1', rank: 1, word: '长相思 第二季', img: '', hotScore: '992,100', desc: '杨紫、张晚意、邓为领衔大古装情感巨制。', show: ['主演：杨紫, 张晚意, 邓为'], url: 'https://www.baidu.com/s?wd=长相思第二季', hotTag: '爆' },
      { id: 't-2', rank: 2, word: '边水往事', img: '', hotScore: '895,400', desc: '郭麒麟、吴镇宇主演异域冒险热播剧。', show: ['主演：郭麒麟, 吴镇宇'], url: 'https://www.baidu.com/s?wd=边水往事', hotTag: '热' },
      { id: 't-3', rank: 3, word: '柳舟记', img: '', hotScore: '812,000', desc: '张晚意、王楚然古装传奇甜虐剧情。', show: ['主演：张晚意, 王楚然'], url: 'https://www.baidu.com/s?wd=柳舟记', hotTag: '热' },
      { id: 't-4', rank: 4, word: '庆余年 第二季', img: '', hotScore: '760,200', desc: '张若昀、李沁主演热门权谋传奇新篇。', show: ['主演：张若昀, 李沁, 陈道明'], url: 'https://www.baidu.com/s?wd=庆余年第二季', hotTag: '爆' },
      { id: 't-5', rank: 5, word: '唐朝诡事录之西行', img: '', hotScore: '710,000', desc: '杨旭文、杨志刚古装探案爆款好评剧。', show: ['主演：杨旭文, 杨志刚'], url: 'https://www.baidu.com/s?wd=唐朝诡事录之西行', hotTag: '热' }
    ]
  } else if (tab === 'game') {
    return [
      { id: 'g-1', rank: 1, word: '黑神话：悟空', img: '', hotScore: '999,999', desc: '游科自研西游题材单机 3A 动作大作。', show: ['类型：单机 / 动作 RPG'], url: 'https://www.baidu.com/s?wd=黑神话悟空', hotTag: '爆' },
      { id: 'g-2', rank: 2, word: '绝区零', img: '', hotScore: '890,300', desc: '米哈游全新动作新游，都市潮流战斗体验。', show: ['类型：动作 / 角色扮演'], url: 'https://www.baidu.com/s?wd=绝区零', hotTag: '热' },
      { id: 'g-3', rank: 3, word: '原神', img: '', hotScore: '830,100', desc: '米哈游开放世界冒险游戏，纳塔新版本上线。', show: ['类型：开放世界 / RPG'], url: 'https://www.baidu.com/s?wd=原神', hotTag: '热' },
      { id: 'g-4', rank: 4, word: '王者荣耀', img: '', hotScore: '780,000', desc: '腾讯 5V5 英雄公平对战手游。', show: ['类型：MOBA'], url: 'https://www.baidu.com/s?wd=王者荣耀', hotTag: '热' },
      { id: 'g-5', rank: 5, word: '崩坏：星穹铁道', img: '', hotScore: '740,200', desc: '米哈游银河冒险回合制 RPG。', show: ['类型：银河回合制'], url: 'https://www.baidu.com/s?wd=崩坏星穹铁道', hotTag: '热' }
    ]
  } else {
    return [
      { id: 'r-1', rank: 1, word: '巴黎奥运会热点', img: '', hotScore: '998,000', desc: '全网瞩目金牌榜与赛事高光精彩瞬间。', show: ['类型：实时体育'], url: 'https://www.baidu.com/s?wd=巴黎奥运会', hotTag: '爆' },
      { id: 'r-2', rank: 2, word: '科技AI突破', img: '', hotScore: '890,000', desc: '前沿大模型与自动驾驶最新进展。', show: ['类型：科技热点'], url: 'https://www.baidu.com/s?wd=AI最新突破', hotTag: '热' },
      { id: 'r-3', rank: 3, word: '全国天气预警', img: '', hotScore: '780,500', desc: '多地高温防暑与强降雨防护指南。', show: ['类型：生活资讯'], url: 'https://www.baidu.com/s?wd=全国天气预警', hotTag: '热' }
    ]
  }
}

const loadTrendingData = async (tab: TabType = activeTab.value): Promise<void> => {
  if (loading.value) return
  loading.value = true
  errorMessage.value = ''
  trendingItems.value = []

  const targetUrl = resolveApiUrl(`/api-baidu-top/api/board?platform=down&tab=${tab}`)

  try {
    let rawData: BaiduApiResponseData | null = null

    if (import.meta.env.PROD) {
      const res = await requestJinaJson<BaiduApiResponse>(targetUrl)
      if (res && res.status === 0 && res.data) {
        rawData = res.data
      }
    } else {
      const response = await fetch(targetUrl)
      if (response.ok) {
        const json = (await response.json()) as BaiduApiResponse
        if (json && json.status === 0 && json.data) {
          rawData = json.data
        }
      }
    }

    if (rawData && rawData.cards?.length) {
      const list: BaiduTrendingItem[] = []
      let index = 1
      for (const card of rawData.cards) {
        const content = card.content || []
        for (const item of content) {
          if (!item.word) continue
          list.push({
            id: `item-${tab}-${index}`,
            rank: index,
            word: item.word,
            img: item.img || '',
            hotScore: String(item.hotScore || ''),
            desc: item.desc || '',
            show: item.show || [],
            url: item.url || item.rawUrl || `https://www.baidu.com/s?wd=${encodeURIComponent(item.word)}`,
            hotTag: item.hotTag || (index <= 3 ? '热' : '')
          })
          index++
        }
      }
      if (list.length) {
        trendingItems.value = list
        updateTime.value = formatNowTime()
        return
      }
    }

    trendingItems.value = getFallbackItems(tab)
    updateTime.value = formatNowTime()
  } catch {
    trendingItems.value = getFallbackItems(tab)
    updateTime.value = formatNowTime()
  } finally {
    loading.value = false
  }
}

const selectTab = (tabId: TabType): void => {
  activeTab.value = tabId
  void loadTrendingData(tabId)
}

watch(initialTab, (newTab) => {
  activeTab.value = newTab
  void loadTrendingData(newTab)
})

onMounted(() => {
  void loadTrendingData(activeTab.value)
})
</script>

<template>
  <main class="baidu-trending-page">
    <section class="trending-header">
      <div class="trending-title-block">
        <span class="trending-logo">{{ displayIcon }}</span>
        <div>
          <h1>{{ displayTitle }}</h1>
          <p>
            {{ displaySubtitle }}
            <span v-if="updateTime">（更新于 {{ updateTime }}）</span>
          </p>
        </div>
      </div>

      <button type="button" class="back-btn" @click="router.push('/toolbox')">← 工具箱</button>
    </section>

    <section class="trending-toolbar">
      <div class="trending-tabs" aria-label="百度热榜分类">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="trending-tab"
          :class="{ active: activeTab === tab.id }"
          :disabled="loading"
          @click="selectTab(tab.id)"
        >
          <span>{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <button type="button" class="reload-btn" :disabled="loading" @click="loadTrendingData()">
        {{ loading ? '加载中...' : '刷新当前' }}
      </button>
    </section>

    <section class="trending-summary">
      <strong>{{ tabMetaMap[activeTab]?.label || '全网热榜' }}</strong>
      <span>TOP {{ trendingItems.length }}</span>
      <em>每日热度趋势榜</em>
    </section>

    <section v-if="loading" class="trending-loading" aria-live="polite">
      正在获取百度热榜数据...
    </section>

    <section v-else-if="trendingItems.length" class="trending-grid" aria-label="百度热榜列表">
      <div
        v-for="item in trendingItems"
        :key="item.id"
        class="board-card"
      >
        <span class="card-rank" :class="`rank-${item.rank}`">
          {{ item.rank }}
        </span>

        <div class="card-poster">
          <img v-if="item.img" :src="item.img" :alt="item.word" referrerpolicy="no-referrer">
          <span v-else>{{ displayIcon }}</span>
        </div>

        <div class="card-content">
          <div class="card-header-row">
            <h3>{{ item.word }}</h3>
            <span v-if="item.hotTag" class="hot-tag">{{ item.hotTag }}</span>
          </div>

          <p v-if="item.desc">{{ item.desc }}</p>
          <p v-else-if="item.show.length">{{ item.show.join(' · ') }}</p>

          <div class="card-meta">
            <span v-if="item.hotScore" class="hot-score">🔥 {{ item.hotScore }}</span>
          </div>

          <div class="card-actions">
            <a :href="item.url" target="_blank" rel="noopener noreferrer">
              <span>🔍</span> 百度搜索
            </a>
            <ContentFavoriteButton
              :item="{ id: item.id, title: item.word, url: item.url, source: 'Baidu Trending' }"
              size="small"
            />
            <ShareButton
              :payload="{ title: item.word, url: item.url, description: item.desc || item.word }"
              size="small"
            />
          </div>
        </div>
      </div>
    </section>

    <section v-else class="trending-empty">
      暂时没有获取到热榜数据
    </section>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
