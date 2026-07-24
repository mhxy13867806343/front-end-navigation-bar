<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { ElMessage } from 'element-plus'

const router = useRouter()
const canvasContainer = ref<HTMLDivElement | null>(null)

// Mode & Designer Config State
const isEditable = ref<boolean>(true) // true: 设计器模式, false: 大屏渲染模式
const activeTab = ref<'style' | 'effects' | 'data' | 'export'>('style')

// Designer Config Parameters
const config = ref({
  extrudeHeight: 12,
  mapColor: '#1e3a8a',
  borderColor: '#38bdf8',
  hoverColor: '#ec4899',
  floorType: 'grid', // 'grid' | 'water'
  enableFlightLines: true,
  flightLineSpeed: 1.5,
  flightLineColor: '#f59e0b',
  enableParticles: true,
  particleType: 'snow', // 'snow' | 'rain'
  particleCount: 200,
  showPillars: true,
  cameraDistance: 120
})

// Simulated China Map Provinces Data
const PROVINCES = [
  { id: 'bj', name: '北京市', code: 110000, gdp: '4.37万亿', pop: '2184万', pos: { x: 18, y: 14 } },
  { id: 'sh', name: '上海市', code: 310000, gdp: '4.47万亿', pop: '2489万', pos: { x: 26, y: 0 } },
  { id: 'gd', name: '广东省', code: 440000, gdp: '12.91万亿', pop: '1.26亿', pos: { x: 16, y: -22 } },
  { id: 'sc', name: '四川省', code: 510000, gdp: '5.67万亿', pop: '8372万', pos: { x: -14, y: -6 } },
  { id: 'zj', name: '浙江省', code: 330000, gdp: '7.77万亿', pop: '6577万', pos: { x: 25, y: -6 } },
  { id: 'js', name: '江苏省', code: 320000, gdp: '12.28万亿', pop: '8515万', pos: { x: 23, y: 6 } },
  { id: 'hb', name: '湖北省', code: 420000, gdp: '5.37万亿', pop: '5844万', pos: { x: 8, y: -4 } },
  { id: 'sd', name: '山东省', code: 370000, gdp: '8.74万亿', pop: '1.01亿', pos: { x: 18, y: 8 } }
]

const selectedProvince = ref<typeof PROVINCES[0] | null>(null)
const hoveredProvince = ref<typeof PROVINCES[0] | null>(null)

// Three.js Scene Variables
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animId: number
let provinceGroup: THREE.Group
let flightLinesGroup: THREE.Group
let particlesMesh: THREE.Points

// Initialize Three.js Scene
const initThreeScene = () => {
  if (!canvasContainer.value) return

  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#060913')
  scene.fog = new THREE.FogExp2('#060913', 0.003)

  camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000)
  camera.position.set(0, -60, config.value.cameraDistance)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  canvasContainer.value.appendChild(renderer.domElement)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
  scene.add(ambientLight)

  const dirLight1 = new THREE.DirectionalLight('#38bdf8', 2.0)
  dirLight1.position.set(50, 80, 100)
  scene.add(dirLight1)

  const dirLight2 = new THREE.DirectionalLight('#c084fc', 1.5)
  dirLight2.position.set(-50, -50, 50)
  scene.add(dirLight2)

  // Floor Mesh
  createFloor()

  // 3D Province Blocks
  createProvinces()

  // Flight Lines
  createFlightLines()

  // Weather Particles
  createParticles()

  // Animation Loop
  const animate = () => {
    animId = requestAnimationFrame(animate)

    if (provinceGroup) {
      provinceGroup.rotation.z += 0.001
    }

    if (flightLinesGroup && config.value.enableFlightLines) {
      flightLinesGroup.children.forEach(child => {
        if (child instanceof THREE.Line) {
          child.rotation.z += 0.005 * config.value.flightLineSpeed
        }
      })
    }

    if (particlesMesh && config.value.enableParticles) {
      const positions = particlesMesh.geometry.attributes.position.array as Float32Array
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.3
        if (positions[i] < -50) positions[i] = 100
      }
      particlesMesh.geometry.attributes.position.needsUpdate = true
    }

    renderer.render(scene, camera)
  }
  animate()
}

// Floor Setup
const createFloor = () => {
  const gridHelper = new THREE.GridHelper(200, 40, '#38bdf8', 'rgba(255,255,255,0.08)')
  gridHelper.rotation.x = Math.PI / 2
  gridHelper.position.z = -15
  scene.add(gridHelper)
}

// Province 3D Meshes
const createProvinces = () => {
  if (provinceGroup) scene.remove(provinceGroup)
  provinceGroup = new THREE.Group()

  PROVINCES.forEach(p => {
    const shape = new THREE.Shape()
    shape.moveTo(-6, -6)
    shape.lineTo(6, -6)
    shape.lineTo(8, 6)
    shape.lineTo(-4, 8)
    shape.closePath()

    const extrudeSettings = {
      steps: 1,
      depth: config.value.extrudeHeight,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 0.5,
      bevelSegments: 2
    }

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    const material = new THREE.MeshStandardMaterial({
      color: config.value.mapColor,
      roughness: 0.3,
      metalness: 0.7,
      wireframe: false
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(p.pos.x, p.pos.y, 0)
    mesh.userData = p
    provinceGroup.add(mesh)

    // Data Pillars
    if (config.value.showPillars) {
      const pillarGeo = new THREE.CylinderGeometry(0.8, 0.8, 15, 16)
      const pillarMat = new THREE.MeshBasicMaterial({ color: '#f59e0b', transparent: true, opacity: 0.8 })
      const pillar = new THREE.Mesh(pillarGeo, pillarMat)
      pillar.rotation.x = Math.PI / 2
      pillar.position.set(p.pos.x, p.pos.y, config.value.extrudeHeight + 8)
      provinceGroup.add(pillar)
    }
  })

  scene.add(provinceGroup)
}

// 3D Flight Lines
const createFlightLines = () => {
  if (flightLinesGroup) scene.remove(flightLinesGroup)
  flightLinesGroup = new THREE.Group()

  const origin = PROVINCES[0].pos // 北京
  PROVINCES.slice(1).forEach(dest => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(origin.x, origin.y, 10),
      new THREE.Vector3((origin.x + dest.pos.x) / 2, (origin.y + dest.pos.y) / 2, 35),
      new THREE.Vector3(dest.pos.x, dest.pos.y, 10)
    )

    const points = curve.getPoints(50)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ color: config.value.flightLineColor, linewidth: 2, transparent: true, opacity: 0.75 })
    const line = new THREE.Line(geometry, material)
    flightLinesGroup.add(line)
  })

  scene.add(flightLinesGroup)
}

// Weather Particle System
const createParticles = () => {
  if (particlesMesh) scene.remove(particlesMesh)

  const count = config.value.particleCount
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200
    positions[i + 1] = (Math.random() - 0.5) * 200
    positions[i + 2] = Math.random() * 100
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    color: '#ffffff',
    size: 1.2,
    transparent: true,
    opacity: 0.6
  })

  particlesMesh = new THREE.Points(geometry, material)
  scene.add(particlesMesh)
}

// Handle Drilldown
const handleProvinceClick = (p: typeof PROVINCES[0]) => {
  selectedProvince.value = p
  ElMessage.success(`已下钻进入 ${p.name} 3D 板块视图`)
}

// Export Configuration
const exportJSON = () => {
  const jsonStr = JSON.stringify(config.value, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'china-3d-map-config.json'
  a.click()
  ElMessage.success('3D 地图设计器 JSON 配置已成功导出！')
}

watch(config, () => {
  createProvinces()
  createFlightLines()
  createParticles()
}, { deep: true })

onMounted(() => {
  initThreeScene()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  if (renderer) renderer.dispose()
})
</script>

<template>
  <div class="china-map-3d-designer" style="min-height: 100vh; background: #060913; color: #f8fafc; display: flex; flex-direction: column; overflow: hidden;">
    <!-- Top Header -->
    <header style="background: rgba(15,23,42,0.9); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 100;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="background: linear-gradient(135deg, #38bdf8, #c084fc); color: #0f172a; padding: 4px 10px; border-radius: 12px; font-weight: 800; font-size: 0.8rem;">
          3D Designer Engine
        </span>
        <h1 style="font-size: 1.3rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #38bdf8 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Three.js 3D 中国地图设计器 (开箱即用)
        </h1>
      </div>

      <div style="display: flex; gap: 12px;">
        <button style="padding: 8px 16px; border-radius: 8px; border: 1px solid #38bdf8; background: transparent; color: #38bdf8; font-weight: 700; cursor: pointer;" @click="isEditable = !isEditable">
          {{ isEditable ? '👁️ 切换至大屏渲染模式' : '⚙️ 切换至设计器模式' }}
        </button>
        <button style="padding: 8px 16px; border-radius: 8px; border: none; background: #38bdf8; color: #0f172a; font-weight: 800; cursor: pointer;" @click="exportJSON">
          📥 导出 JSON 配置
        </button>
        <button style="padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff; cursor: pointer;" @click="router.push('/dyform')">
          ← 返回导航站
        </button>
      </div>
    </header>

    <!-- Main Workspace -->
    <div style="flex: 1; display: flex; position: relative;">
      <!-- Canvas 3D Stage -->
      <div ref="canvasContainer" style="flex: 1; height: calc(100vh - 65px); position: relative;"></div>

      <!-- Province Tooltip Overlay -->
      <div style="position: absolute; top: 20px; left: 20px; z-index: 10; display: flex; gap: 8px; flex-wrap: wrap;">
        <div
          v-for="p in PROVINCES"
          :key="p.id"
          style="padding: 6px 12px; border-radius: 20px; background: rgba(30,41,59,0.8); border: 1px solid rgba(255,255,255,0.15); font-size: 0.8rem; cursor: pointer; backdrop-filter: blur(8px);"
          :style="{ borderColor: selectedProvince?.id === p.id ? '#ec4899' : 'rgba(255,255,255,0.15)' }"
          @click="handleProvinceClick(p)"
        >
          📍 {{ p.name }}
        </div>
      </div>

      <!-- Selected Province Data Modal -->
      <div v-if="selectedProvince" style="position: absolute; bottom: 30px; left: 20px; z-index: 10; background: rgba(15,23,42,0.9); border: 1px solid #38bdf8; padding: 20px; border-radius: 16px; min-width: 260px; backdrop-filter: blur(12px);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 1.1rem; color: #38bdf8;">{{ selectedProvince.name }} 3D 看板</h3>
          <button style="border: none; background: transparent; color: #fff; cursor: pointer;" @click="selectedProvince = null">✕</button>
        </div>
        <div style="font-size: 0.86rem; color: #cbd5e1;">GDP 规模: <strong style="color: #f59e0b;">{{ selectedProvince.gdp }}</strong></div>
        <div style="font-size: 0.86rem; color: #cbd5e1; margin-top: 4px;">常住人口: <strong style="color: #10b981;">{{ selectedProvince.pop }}</strong></div>
      </div>

      <!-- Designer Sidebar Panel (Editable Mode) -->
      <aside v-if="isEditable" style="width: 320px; background: rgba(15,23,42,0.95); border-left: 1px solid rgba(255,255,255,0.1); padding: 20px; backdrop-filter: blur(16px); overflow-y: auto;">
        <h3 style="margin: 0 0 16px; font-size: 1rem; color: #38bdf8;">🎨 3D 地图设计器参数配置</h3>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 6px;">省份 3D 拉伸高度 ({{ config.extrudeHeight }}px)</label>
          <input v-model.number="config.extrudeHeight" type="range" min="4" max="25" step="1" style="width: 100%; cursor: pointer;" />
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 6px;">地图主体材质颜色</label>
          <input v-model="config.mapColor" type="color" style="width: 100%; height: 36px; border-radius: 6px; border: none; cursor: pointer;" />
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 6px;">3D 飞线开关与速度</label>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input v-model="config.enableFlightLines" type="checkbox" id="flightCheck" />
            <label for="flightCheck" style="font-size: 0.84rem;">启用 3D 弧线飞线动画</label>
          </div>
          <input v-if="config.enableFlightLines" v-model.number="config.flightLineSpeed" type="range" min="0.5" max="4" step="0.5" style="width: 100%; margin-top: 8px; cursor: pointer;" />
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 6px;">天气粒子效果 (雨雪粒子)</label>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input v-model="config.enableParticles" type="checkbox" id="particleCheck" />
            <label for="particleCheck" style="font-size: 0.84rem;">启用下雪/雨降水粒子</label>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 6px;">数据气泡柱状图</label>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input v-model="config.showPillars" type="checkbox" id="pillarCheck" />
            <label for="pillarCheck" style="font-size: 0.84rem;">显示各省 3D 柱状指标</label>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
