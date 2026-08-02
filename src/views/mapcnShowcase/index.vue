<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Aim, CopyDocument, Link, Location, Minus, Moon, Plus, Sunny } from '@element-plus/icons-vue'
import { copyToClipboard } from '@/utils/clipboard'

interface MapLayer {
  id: string
  name: string
  color: string
  enabled: boolean
}

interface MapMarker {
  id: string
  name: string
  city: string
  x: number
  y: number
  value: string
  tone: string
}

interface MapComponentItem {
  name: string
  desc: string
  tag: string
}

const zoomLevel = ref<number>(10)
const isDarkMode = ref<boolean>(true)
const isFollowing = ref<boolean>(false)
const activeMarkerId = ref<string>('shanghai')
const selectedStyle = ref<string>('vector')

const layers = ref<MapLayer[]>([
  { id: 'traffic', name: 'Traffic', color: '#f97316', enabled: true },
  { id: 'fleet', name: 'Fleet', color: '#38bdf8', enabled: true },
  { id: 'heat', name: 'Heatmap', color: '#a3e635', enabled: false },
  { id: 'boundary', name: 'Boundary', color: '#facc15', enabled: true }
])

const markers: MapMarker[] = [
  { id: 'shanghai', name: 'East Hub', city: '上海', x: 62, y: 46, value: '12.8k', tone: '#38bdf8' },
  { id: 'hangzhou', name: 'Lake Node', city: '杭州', x: 52, y: 62, value: '8.6k', tone: '#a3e635' },
  { id: 'nanjing', name: 'North Gate', city: '南京', x: 42, y: 34, value: '6.1k', tone: '#facc15' },
  { id: 'ningbo', name: 'Port Edge', city: '宁波', x: 74, y: 66, value: '4.9k', tone: '#fb7185' }
]

const componentItems: MapComponentItem[] = [
  { name: 'ZoomControl', desc: '缩放按钮与地图比例状态', tag: 'Control' },
  { name: 'CompassControl', desc: '方向盘与旋转复位控制', tag: 'Navigation' },
  { name: 'LayerSwitcher', desc: '多图层开关与颜色提示', tag: 'Layer' },
  { name: 'Marker + Popup', desc: '业务点位、状态和详情浮层', tag: 'Overlay' },
  { name: 'ThemeToggle', desc: '地图控件随明暗主题联动', tag: 'Theme' },
  { name: 'Geolocation', desc: '定位状态与移动端常用入口', tag: 'Location' }
]

const mapStyles = [
  { id: 'vector', name: 'Vector', desc: '矢量街区' },
  { id: 'satellite', name: 'Satellite', desc: '遥感底图' },
  { id: 'terrain', name: 'Terrain', desc: '地形高程' }
]

const activeMarker = computed<MapMarker>(() => {
  return markers.find((marker: MapMarker): boolean => marker.id === activeMarkerId.value) || markers[0]
})

const enabledLayerCount = computed<number>(() => {
  return layers.value.filter((layer: MapLayer): boolean => layer.enabled).length
})

const activeStyleName = computed<string>(() => {
  return mapStyles.find((style): boolean => style.id === selectedStyle.value)?.name || 'Vector'
})

function zoomIn(): void {
  zoomLevel.value = Math.min(16, zoomLevel.value + 1)
}

function zoomOut(): void {
  zoomLevel.value = Math.max(4, zoomLevel.value - 1)
}

function resetCompass(): void {
  ElMessage.success('CompassControl 已回正')
}

function toggleLayer(layer: MapLayer): void {
  layer.enabled = !layer.enabled
}

function toggleFollow(): void {
  isFollowing.value = !isFollowing.value
  ElMessage.success(isFollowing.value ? 'Geolocation 已开启跟随' : 'Geolocation 已停止跟随')
}

function openMapcnSite(): void {
  window.open('https://www.mapcn.dev/', '_blank')
}

function openMapcnGithub(): void {
  window.open('https://github.com/AnmolSaini16/mapcn', '_blank')
}

function openJuejinPost(): void {
  window.open('https://juejin.cn/post/7660367518163828772', '_blank')
}

async function copySnippet(): Promise<void> {
  await copyToClipboard(`<Map>
  <ZoomControl />
  <CompassControl />
  <LayerSwitcher />
  <Marker>
    <Popup />
  </Marker>
  <ThemeToggle />
</Map>`, 'mapcn 组件组合示例已复制')
}
</script>

<template>
  <main class="mapcn-page" :class="{ 'is-light': !isDarkMode }">
    <section class="mapcn-hero">
      <div class="hero-copy">
        <p class="eyebrow">MapLibre UI Components</p>
        <h1>mapcn 地图组件实战台</h1>
        <p>
          把文章里的 mapcn 组件思路放进一个可点可切换的地图界面：控件、图层、点位、弹窗和主题都在同一张图上联动。
        </p>
        <div class="hero-actions" aria-label="mapcn 相关链接">
          <button type="button" class="primary-action" @click="openMapcnSite">
            <el-icon><Link /></el-icon>
            mapcn.dev
          </button>
          <button type="button" @click="openMapcnGithub">
            <el-icon><Link /></el-icon>
            GitHub
          </button>
          <button type="button" @click="openJuejinPost">
            <el-icon><Link /></el-icon>
            掘金文章
          </button>
        </div>
      </div>

      <div class="hero-stats" aria-label="mapcn 核心信息">
        <span><strong>MapLibre</strong><em>底层引擎</em></span>
        <span><strong>Copy</strong><em>源码模式</em></span>
        <span><strong>Tailwind</strong><em>设计系统</em></span>
      </div>
    </section>

    <section class="map-workbench" aria-label="mapcn 地图组件演示">
      <div class="map-shell">
        <div class="map-toolbar map-toolbar-top">
          <div class="style-tabs" role="tablist" aria-label="地图样式">
            <button
              v-for="style in mapStyles"
              :key="style.id"
              type="button"
              :class="{ active: selectedStyle === style.id }"
              @click="selectedStyle = style.id"
            >
              <strong>{{ style.name }}</strong>
              <span>{{ style.desc }}</span>
            </button>
          </div>

          <button type="button" class="theme-button" :title="isDarkMode ? '切换浅色主题' : '切换深色主题'" @click="isDarkMode = !isDarkMode">
            <el-icon>
              <Moon v-if="isDarkMode" />
              <Sunny v-else />
            </el-icon>
          </button>
        </div>

        <div class="map-canvas" :class="[`style-${selectedStyle}`]">
          <div class="route-line route-line-one"></div>
          <div class="route-line route-line-two"></div>
          <div class="route-line route-line-three"></div>

          <button
            v-for="marker in markers"
            :key="marker.id"
            type="button"
            class="map-marker"
            :class="{ active: activeMarkerId === marker.id }"
            :style="{ left: `${marker.x}%`, top: `${marker.y}%`, '--marker-tone': marker.tone }"
            @click="activeMarkerId = marker.id"
          >
            <span></span>
          </button>

          <div class="map-popup" :style="{ left: `${activeMarker.x}%`, top: `${activeMarker.y}%`, '--popup-tone': activeMarker.tone }">
            <p>{{ activeMarker.city }}</p>
            <strong>{{ activeMarker.name }}</strong>
            <span>{{ activeMarker.value }} events</span>
          </div>

          <div class="map-badge">
            <span>{{ activeStyleName }}</span>
            <strong>Zoom {{ zoomLevel }}</strong>
          </div>
        </div>

        <div class="zoom-control" aria-label="ZoomControl">
          <button type="button" title="放大" @click="zoomIn">
            <el-icon><Plus /></el-icon>
          </button>
          <span>{{ zoomLevel }}</span>
          <button type="button" title="缩小" @click="zoomOut">
            <el-icon><Minus /></el-icon>
          </button>
        </div>

        <button type="button" class="compass-control" title="CompassControl 回正" @click="resetCompass">
          <span>N</span>
        </button>

        <button type="button" class="geo-control" :class="{ active: isFollowing }" title="Geolocation" @click="toggleFollow">
          <el-icon><Aim /></el-icon>
        </button>
      </div>

      <aside class="map-panel" aria-label="LayerSwitcher">
        <div class="panel-head">
          <p>LayerSwitcher</p>
          <strong>{{ enabledLayerCount }}/{{ layers.length }}</strong>
        </div>

        <button
          v-for="layer in layers"
          :key="layer.id"
          type="button"
          class="layer-row"
          :class="{ enabled: layer.enabled }"
          @click="toggleLayer(layer)"
        >
          <span class="layer-swatch" :style="{ background: layer.color }"></span>
          <strong>{{ layer.name }}</strong>
          <em>{{ layer.enabled ? 'ON' : 'OFF' }}</em>
        </button>

        <div class="snippet-box">
          <div>
            <p>Copy · Paste · Customize</p>
            <strong>mapcn 组件组合</strong>
          </div>
          <button type="button" title="复制组件示例" @click="copySnippet">
            <el-icon><CopyDocument /></el-icon>
          </button>
        </div>
      </aside>
    </section>

    <section class="component-grid" aria-label="mapcn 组件清单">
      <article v-for="component in componentItems" :key="component.name">
        <span>{{ component.tag }}</span>
        <h2>{{ component.name }}</h2>
        <p>{{ component.desc }}</p>
      </article>
    </section>

    <section class="usage-band" aria-label="适用场景">
      <div>
        <el-icon><Location /></el-icon>
        <strong>企业后台、GIS、物流轨迹、IoT 可视化、运维监控</strong>
      </div>
      <p>mapcn 的价值在地图 UI 层：把常见控件做成可复制、可修改、可主题化的组件。</p>
    </section>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
