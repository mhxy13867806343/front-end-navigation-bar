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

<style scoped lang="scss">
.mapcn-page {
  min-height: 100vh;
  padding: 28px;
  color: #f8fafc;
  background:
    radial-gradient(circle at 18% 0%, rgba(56, 189, 248, 0.22), transparent 32%),
    linear-gradient(135deg, #07111f 0%, #111827 42%, #18140d 100%);
}

.mapcn-page.is-light {
  color: #0f172a;
  background:
    radial-gradient(circle at 18% 0%, rgba(14, 165, 233, 0.18), transparent 32%),
    linear-gradient(135deg, #f8fafc 0%, #e8f3ef 46%, #fff7ed 100%);
}

.mapcn-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
  gap: 24px;
  align-items: end;
  max-width: 1280px;
  margin: 0 auto 24px;
}

.hero-copy {
  min-width: 0;
}

.eyebrow,
.panel-head p,
.snippet-box p {
  margin: 0 0 8px;
  color: #7dd3fc;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.mapcn-page.is-light .eyebrow,
.mapcn-page.is-light .panel-head p,
.mapcn-page.is-light .snippet-box p {
  color: #0369a1;
}

h1 {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 5.6rem);
  line-height: 0.94;
  letter-spacing: 0;
}

.hero-copy > p:last-of-type {
  max-width: 720px;
  margin: 18px 0 0;
  color: rgba(226, 232, 240, 0.78);
  font-size: 1.02rem;
  line-height: 1.8;
}

.mapcn-page.is-light .hero-copy > p:last-of-type {
  color: rgba(15, 23, 42, 0.72);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.hero-actions button,
.snippet-box button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  color: inherit;
  background: rgba(15, 23, 42, 0.54);
  cursor: pointer;
}

.mapcn-page.is-light .hero-actions button,
.mapcn-page.is-light .snippet-box button {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(15, 23, 42, 0.12);
}

.hero-actions .primary-action {
  border-color: rgba(56, 189, 248, 0.72);
  background: #0ea5e9;
  color: #06101f;
  font-weight: 800;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.hero-stats span {
  min-height: 86px;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.48);
}

.mapcn-page.is-light .hero-stats span {
  background: rgba(255, 255, 255, 0.76);
  border-color: rgba(15, 23, 42, 0.1);
}

.hero-stats strong,
.hero-stats em {
  display: block;
}

.hero-stats strong {
  font-size: 1.18rem;
}

.hero-stats em {
  margin-top: 10px;
  color: rgba(226, 232, 240, 0.64);
  font-style: normal;
}

.mapcn-page.is-light .hero-stats em {
  color: rgba(15, 23, 42, 0.58);
}

.map-workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  max-width: 1280px;
  margin: 0 auto;
}

.map-shell {
  position: relative;
  min-height: 620px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background: #07111f;
}

.map-toolbar {
  position: absolute;
  z-index: 5;
  display: flex;
  gap: 10px;
}

.map-toolbar-top {
  top: 18px;
  left: 18px;
  right: 18px;
  justify-content: space-between;
}

.style-tabs {
  display: inline-grid;
  grid-template-columns: repeat(3, 122px);
  gap: 6px;
  padding: 6px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.74);
  backdrop-filter: blur(14px);
}

.style-tabs button {
  height: 54px;
  border: 0;
  border-radius: 6px;
  color: rgba(226, 232, 240, 0.78);
  background: transparent;
  cursor: pointer;
}

.style-tabs button.active {
  color: #06101f;
  background: #facc15;
}

.style-tabs strong,
.style-tabs span {
  display: block;
}

.style-tabs span {
  margin-top: 4px;
  font-size: 0.74rem;
}

.theme-button,
.zoom-control button,
.geo-control,
.compass-control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 8px;
  color: #f8fafc;
  background: rgba(2, 6, 23, 0.74);
  backdrop-filter: blur(14px);
  cursor: pointer;
}

.map-canvas {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background:
    linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px),
    radial-gradient(circle at 62% 44%, rgba(56, 189, 248, 0.28), transparent 16%),
    linear-gradient(135deg, #0f172a, #0b3b3f 54%, #1f1308);
  background-size: 72px 72px, 72px 72px, auto, auto;
}

.map-canvas.style-satellite {
  background:
    linear-gradient(rgba(250, 204, 21, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(250, 204, 21, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 48% 58%, rgba(163, 230, 53, 0.22), transparent 18%),
    linear-gradient(135deg, #0c0a09, #164e24 52%, #422006);
  background-size: 80px 80px, 80px 80px, auto, auto;
}

.map-canvas.style-terrain {
  background:
    repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0 1px, transparent 1px 34px),
    radial-gradient(circle at 68% 44%, rgba(251, 113, 133, 0.18), transparent 18%),
    linear-gradient(135deg, #183423, #3f3f16 50%, #17313d);
}

.mapcn-page.is-light .map-canvas {
  background:
    linear-gradient(rgba(15, 23, 42, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.08) 1px, transparent 1px),
    radial-gradient(circle at 62% 44%, rgba(14, 165, 233, 0.2), transparent 16%),
    linear-gradient(135deg, #f8fafc, #bbe4d7 55%, #fee2b8);
  background-size: 72px 72px, 72px 72px, auto, auto;
}

.route-line {
  position: absolute;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, #38bdf8, #facc15, transparent);
  opacity: 0.72;
  transform-origin: left center;
}

.route-line-one {
  left: 40%;
  top: 34%;
  width: 260px;
  transform: rotate(22deg);
}

.route-line-two {
  left: 50%;
  top: 62%;
  width: 210px;
  transform: rotate(-18deg);
}

.route-line-three {
  left: 38%;
  top: 48%;
  width: 180px;
  transform: rotate(104deg);
}

.map-marker {
  position: absolute;
  z-index: 3;
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--marker-tone), transparent 64%);
  cursor: pointer;
}

.map-marker span {
  display: block;
  width: 14px;
  height: 14px;
  margin: 10px;
  border: 3px solid #fff;
  border-radius: 999px;
  background: var(--marker-tone);
}

.map-marker.active {
  outline: 4px solid color-mix(in srgb, var(--marker-tone), transparent 72%);
}

.map-popup {
  position: absolute;
  z-index: 4;
  width: 172px;
  min-height: 96px;
  padding: 14px;
  border: 1px solid color-mix(in srgb, var(--popup-tone), transparent 42%);
  border-radius: 8px;
  color: #f8fafc;
  background: rgba(2, 6, 23, 0.82);
  transform: translate(18px, -114px);
  backdrop-filter: blur(16px);
}

.map-popup p,
.map-popup strong,
.map-popup span {
  display: block;
  margin: 0;
}

.map-popup p {
  color: var(--popup-tone);
  font-weight: 800;
}

.map-popup strong {
  margin-top: 8px;
  font-size: 1.08rem;
}

.map-popup span {
  margin-top: 8px;
  color: rgba(226, 232, 240, 0.68);
}

.map-badge {
  position: absolute;
  left: 18px;
  bottom: 18px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 8px;
  color: #f8fafc;
  background: rgba(2, 6, 23, 0.74);
  backdrop-filter: blur(14px);
}

.zoom-control {
  position: absolute;
  z-index: 6;
  right: 18px;
  top: 92px;
  display: grid;
  width: 44px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.74);
  backdrop-filter: blur(14px);
}

.zoom-control button {
  border: 0;
  border-radius: 0;
  background: transparent;
}

.zoom-control span {
  display: grid;
  place-items: center;
  height: 36px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  color: #f8fafc;
  font-weight: 800;
}

.compass-control {
  position: absolute;
  z-index: 6;
  right: 18px;
  top: 238px;
  color: #06101f;
  background: #facc15;
  font-weight: 900;
}

.geo-control {
  position: absolute;
  z-index: 6;
  right: 18px;
  top: 292px;
}

.geo-control.active {
  color: #06101f;
  background: #a3e635;
}

.map-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 620px;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.58);
}

.mapcn-page.is-light .map-panel {
  background: rgba(255, 255, 255, 0.76);
  border-color: rgba(15, 23, 42, 0.1);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.panel-head strong {
  font-size: 1.8rem;
}

.layer-row {
  display: grid;
  grid-template-columns: 18px 1fr 44px;
  gap: 10px;
  align-items: center;
  min-height: 54px;
  padding: 0 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: inherit;
  background: rgba(2, 6, 23, 0.34);
  cursor: pointer;
}

.mapcn-page.is-light .layer-row {
  background: rgba(248, 250, 252, 0.9);
}

.layer-row.enabled {
  border-color: rgba(125, 211, 252, 0.46);
}

.layer-swatch {
  width: 14px;
  height: 14px;
  border-radius: 999px;
}

.layer-row em {
  color: rgba(226, 232, 240, 0.58);
  font-style: normal;
  font-weight: 800;
}

.mapcn-page.is-light .layer-row em {
  color: rgba(15, 23, 42, 0.56);
}

.snippet-box {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding: 14px;
  border: 1px solid rgba(250, 204, 21, 0.32);
  border-radius: 8px;
  background: rgba(250, 204, 21, 0.08);
}

.snippet-box strong {
  display: block;
}

.snippet-box button {
  width: 42px;
  min-width: 42px;
  padding: 0;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  max-width: 1280px;
  margin: 18px auto 0;
}

.component-grid article {
  min-height: 146px;
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.5);
}

.mapcn-page.is-light .component-grid article {
  background: rgba(255, 255, 255, 0.76);
  border-color: rgba(15, 23, 42, 0.1);
}

.component-grid span {
  color: #facc15;
  font-size: 0.78rem;
  font-weight: 900;
}

.component-grid h2 {
  margin: 12px 0 8px;
  font-size: 1.18rem;
}

.component-grid p {
  margin: 0;
  color: rgba(226, 232, 240, 0.68);
  line-height: 1.65;
}

.mapcn-page.is-light .component-grid p {
  color: rgba(15, 23, 42, 0.64);
}

.usage-band {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  max-width: 1280px;
  min-height: 84px;
  margin: 18px auto 0;
  padding: 18px;
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-radius: 8px;
  background: rgba(14, 165, 233, 0.1);
}

.usage-band div {
  display: flex;
  gap: 10px;
  align-items: center;
}

.usage-band p {
  max-width: 520px;
  margin: 0;
  color: rgba(226, 232, 240, 0.7);
  line-height: 1.6;
}

.mapcn-page.is-light .usage-band p {
  color: rgba(15, 23, 42, 0.66);
}

@media (max-width: 980px) {
  .mapcn-page {
    padding: 18px;
  }

  .mapcn-hero,
  .map-workbench,
  .component-grid {
    grid-template-columns: 1fr;
  }

  .map-shell,
  .map-panel {
    min-height: 560px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .usage-band {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 620px) {
  h1 {
    font-size: 2.4rem;
  }

  .style-tabs {
    grid-template-columns: 1fr;
    width: min(220px, calc(100vw - 96px));
  }

  .style-tabs button {
    height: 44px;
  }

  .map-toolbar-top {
    align-items: flex-start;
  }

  .map-popup {
    width: 152px;
    transform: translate(-76px, -120px);
  }
}
</style>
