import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export type SceneParams = Record<string, string | number | boolean>
export type SceneTelemetry = {
  label: string
  score?: number
  status?: string
}

export interface MountedScene {
  updateParams: (nextParams: SceneParams) => void
  resize: () => void
  reset: () => void
  dispose: () => void
}

interface RuntimeOptions {
  id: string
  container: HTMLElement
  params: SceneParams
  onTelemetry?: (payload: SceneTelemetry) => void
}

const createRenderer = (container: HTMLElement): THREE.WebGLRenderer => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)
  return renderer
}

const createBaseScene = (container: HTMLElement) => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#050816')
  scene.fog = new THREE.Fog('#050816', 12, 28)
  const camera = new THREE.PerspectiveCamera(50, Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1), 0.1, 100)
  camera.position.set(4.5, 3.2, 7.2)
  const renderer = createRenderer(container)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.maxDistance = 16
  controls.minDistance = 3
  const clock = new THREE.Clock()
  const ambient = new THREE.AmbientLight('#9ab6ff', 0.75)
  const dir = new THREE.DirectionalLight('#ffffff', 1.2)
  dir.position.set(4, 6, 3)
  scene.add(ambient, dir)
  return { scene, camera, renderer, controls, clock }
}

const addFloor = (scene: THREE.Scene): THREE.GridHelper => {
  const grid = new THREE.GridHelper(16, 16, '#173567', '#10203d')
  grid.position.y = -1.4
  scene.add(grid)
  return grid
}

const readNumber = (params: SceneParams, key: string, fallback: number): number => {
  const value = Number(params[key])
  return Number.isFinite(value) ? value : fallback
}

const readBoolean = (params: SceneParams, key: string, fallback: boolean): boolean => {
  const value = params[key]
  return typeof value === 'boolean' ? value : fallback
}

const readColor = (params: SceneParams, key: string, fallback: string): string => {
  const value = params[key]
  return typeof value === 'string' ? value : fallback
}

export const mountThreeScene = ({ id, container, params, onTelemetry }: RuntimeOptions): MountedScene => {
  const { scene, camera, renderer, controls, clock } = createBaseScene(container)
  const group = new THREE.Group()
  scene.add(group)
  const baseGrid = addFloor(scene)
  let frameId = 0
  let currentParams: SceneParams = { ...params }
  const disposables: Array<THREE.Object3D | THREE.Material | THREE.BufferGeometry> = []
  const listeners: Array<() => void> = []
  let score = 0
  let elapsed = 0

  const track = <T extends THREE.Object3D | THREE.Material | THREE.BufferGeometry>(item: T): T => {
    disposables.push(item)
    return item
  }

  const updateTelemetry = (payload: SceneTelemetry): void => {
    onTelemetry?.(payload)
  }

  if (id === 'basic-cube') {
    const geometry = track(new THREE.BoxGeometry(1.6, 1.6, 1.6))
    const material = track(new THREE.MeshStandardMaterial({ color: readColor(currentParams, 'cubeColor', '#58d5ff'), roughness: 0.18, metalness: 0.35 }))
    const cube = new THREE.Mesh(geometry, material)
    group.add(cube)
    const tick = (): void => {
      const speed = readNumber(currentParams, 'rotationSpeed', 0.012)
      material.color.set(readColor(currentParams, 'cubeColor', '#58d5ff'))
      baseGrid.visible = readBoolean(currentParams, 'showGrid', true)
      cube.rotation.x += speed
      cube.rotation.y += speed * 1.4
    }
    const animate = (): void => {
      frameId = requestAnimationFrame(animate)
      tick()
      controls.update()
      renderer.render(scene, camera)
    }
    animate()
  } else if (id === 'light-orbit') {
    baseGrid.visible = false
    const knot = new THREE.Mesh(
      track(new THREE.TorusKnotGeometry(1.4, 0.42, 180, 24)),
      track(new THREE.MeshPhysicalMaterial({ color: '#6f86ff', metalness: 0.75, roughness: 0.22, clearcoat: 1, emissive: '#1b2258' }))
    )
    group.add(knot)
    const orbitLights = ['#58d5ff', '#ff79d1', '#ffd166'].map((color: string, index: number) => {
      const light = new THREE.PointLight(color, 1.6, 16, 2)
      light.position.set(Math.cos(index * 2) * 4.2, 1.4, Math.sin(index * 2) * 4.2)
      scene.add(light)
      const bulb = new THREE.Mesh(track(new THREE.SphereGeometry(0.11, 24, 24)), track(new THREE.MeshBasicMaterial({ color })))
      light.add(bulb)
      return light
    })
    const animate = (): void => {
      frameId = requestAnimationFrame(animate)
      const time = clock.getElapsedTime()
      const intensity = readNumber(currentParams, 'lightIntensity', 2.1)
      ;(knot.material as THREE.MeshPhysicalMaterial).metalness = readNumber(currentParams, 'metalness', 0.75)
      ;(knot.material as THREE.MeshPhysicalMaterial).roughness = readNumber(currentParams, 'roughness', 0.22)
      knot.rotation.x = time * 0.32
      knot.rotation.y = time * 0.5
      orbitLights.forEach((light, index) => {
        light.intensity = intensity
        light.position.x = Math.cos(time + index * 1.8) * 4.1
        light.position.z = Math.sin(time + index * 1.8) * 4.1
        light.position.y = Math.sin(time * 1.4 + index) * 0.8 + 1.2
      })
      controls.update()
      renderer.render(scene, camera)
    }
    animate()
  } else if (id === 'particle-galaxy') {
    baseGrid.visible = false
    const geometry = track(new THREE.BufferGeometry())
    const material = track(new THREE.PointsMaterial({ size: 0.035, color: readColor(currentParams, 'particleColor', '#65ffca'), transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }))
    const rebuild = (): THREE.Points => {
      const count = readNumber(currentParams, 'particleCount', 2200)
      const swirl = readNumber(currentParams, 'swirlStrength', 1.1)
      const positions = new Float32Array(count * 3)
      for (let i = 0; i < count; i += 1) {
        const radius = Math.random() * 4.8
        const angle = radius * 1.45 * swirl + Math.random() * Math.PI * 2
        const i3 = i * 3
        positions[i3] = Math.cos(angle) * radius
        positions[i3 + 1] = (Math.random() - 0.5) * 1.4
        positions[i3 + 2] = Math.sin(angle) * radius
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      return new THREE.Points(geometry, material)
    }
    const points = rebuild()
    group.add(points)
    const animate = (): void => {
      frameId = requestAnimationFrame(animate)
      material.color.set(readColor(currentParams, 'particleColor', '#65ffca'))
      points.rotation.y += 0.0015 * readNumber(currentParams, 'swirlStrength', 1.1)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()
  } else if (id === 'wave-terrain') {
    camera.position.set(0, 4.2, 7.5)
    controls.target.set(0, 0, 0)
    const geometry = track(new THREE.PlaneGeometry(12, 12, 90, 90))
    const material = track(new THREE.MeshStandardMaterial({ color: '#49b6ff', wireframe: readBoolean(currentParams, 'wireframe', true) }))
    const plane = new THREE.Mesh(geometry, material)
    plane.rotation.x = -Math.PI / 2
    group.add(plane)
    const positions = geometry.attributes.position
    const animate = (): void => {
      frameId = requestAnimationFrame(animate)
      const amplitude = readNumber(currentParams, 'amplitude', 0.32)
      const speed = readNumber(currentParams, 'waveSpeed', 0.9)
      material.wireframe = readBoolean(currentParams, 'wireframe', true)
      const time = clock.getElapsedTime() * speed
      for (let i = 0; i < positions.count; i += 1) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        positions.setZ(i, Math.sin(x * 0.8 + time) * amplitude + Math.cos(y * 0.6 + time) * amplitude)
      }
      positions.needsUpdate = true
      geometry.computeVertexNormals()
      controls.update()
      renderer.render(scene, camera)
    }
    animate()
  } else if (id === 'neon-portal') {
    baseGrid.visible = false
    camera.position.set(0, 0, 8)
    scene.fog = new THREE.Fog('#050816', 10, 22)
    const rings = Array.from({ length: 7 }, (_, index) => {
      const mesh = new THREE.Mesh(
        track(new THREE.TorusGeometry(1.6 + index * 0.28, 0.06, 12, 56)),
        track(new THREE.MeshBasicMaterial({ color: readColor(currentParams, 'glowColor', '#ff79d1') }))
      )
      mesh.position.z = -index * 1.4
      group.add(mesh)
      return mesh
    })
    const animate = (): void => {
      frameId = requestAnimationFrame(animate)
      const time = clock.getElapsedTime()
      const speed = readNumber(currentParams, 'ringSpeed', 0.8)
      const pulse = readBoolean(currentParams, 'pulse', true)
      rings.forEach((ring, index) => {
        ;(ring.material as THREE.MeshBasicMaterial).color.set(readColor(currentParams, 'glowColor', '#ff79d1'))
        ring.position.z = ((index * 1.5 + time * speed) % 14) - 7
        ring.rotation.z += 0.003
        if (pulse) ring.scale.setScalar(1 + Math.sin(time * 2 + index) * 0.05)
      })
      camera.position.z = 7 + Math.sin(time * 0.8) * 0.35
      renderer.render(scene, camera)
    }
    animate()
  } else if (id === 'orb-hunter') {
    baseGrid.visible = false
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const makeOrb = (): THREE.Mesh => {
      const mesh = new THREE.Mesh(track(new THREE.SphereGeometry(0.22, 20, 20)), track(new THREE.MeshStandardMaterial({ color: '#7cf5ff', emissive: '#1a7eff', emissiveIntensity: 0.9 })))
      mesh.position.set((Math.random() - 0.5) * 5.6, (Math.random() - 0.5) * 2.8, (Math.random() - 0.5) * 4.8)
      return mesh
    }
    const orbs = Array.from({ length: readNumber(currentParams, 'orbCount', 9) }, () => makeOrb())
    orbs.forEach(orb => group.add(orb))
    const clickHandler = (event: PointerEvent): void => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(orbs)
      if (!hits.length) return
      score += 10
      updateTelemetry({ label: '命中能量球 +10', score, status: '继续点击收集' })
      const orb = hits[0].object as THREE.Mesh
      orb.position.set((Math.random() - 0.5) * 5.6, (Math.random() - 0.5) * 2.8, (Math.random() - 0.5) * 4.8)
    }
    renderer.domElement.addEventListener('pointerdown', clickHandler)
    listeners.push(() => renderer.domElement.removeEventListener('pointerdown', clickHandler))
    updateTelemetry({ label: '能量球收集中', score: 0, status: '点击场景中的发光球' })
    const animate = (): void => {
      frameId = requestAnimationFrame(animate)
      const speed = readNumber(currentParams, 'orbSpeed', 0.9) * 0.01
      orbs.forEach((orb, index) => {
        orb.position.y += Math.sin(clock.elapsedTime * 1.8 + index) * speed
        orb.rotation.y += 0.02
      })
      controls.update()
      renderer.render(scene, camera)
    }
    animate()
  } else {
    camera.position.set(0, 1.2, 7.2)
    baseGrid.visible = false
    const ship = new THREE.Mesh(track(new THREE.ConeGeometry(0.32, 1.1, 12)), track(new THREE.MeshStandardMaterial({ color: '#ffd166', emissive: '#46320c', emissiveIntensity: 0.8 })))
    ship.rotation.z = Math.PI
    ship.position.y = -1.7
    group.add(ship)
    const meteors: THREE.Mesh[] = []
    const pressed: Record<string, boolean> = {}
    const spawnMeteor = (): void => {
      const meteor = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.28 + Math.random() * 0.22, 0)), track(new THREE.MeshStandardMaterial({ color: '#ff8f6b', flatShading: true })))
      meteor.position.set((Math.random() - 0.5) * 5.4, 3.6 + Math.random(), (Math.random() - 0.5) * 1.6)
      meteors.push(meteor)
      group.add(meteor)
    }
    const keydown = (event: KeyboardEvent): void => { pressed[event.key] = true }
    const keyup = (event: KeyboardEvent): void => { pressed[event.key] = false }
    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    listeners.push(() => window.removeEventListener('keydown', keydown))
    listeners.push(() => window.removeEventListener('keyup', keyup))
    updateTelemetry({ label: '陨石闪避开始', score: 0, status: '方向键左右移动' })
    const animate = (): void => {
      frameId = requestAnimationFrame(animate)
      elapsed += clock.getDelta()
      score = Math.floor(elapsed * 12)
      if (pressed.ArrowLeft) ship.position.x -= 0.12
      if (pressed.ArrowRight) ship.position.x += 0.12
      ship.position.x = THREE.MathUtils.clamp(ship.position.x, -2.8, 2.8)
      if (meteors.length < 10 && Math.random() < readNumber(currentParams, 'spawnRate', 1) * 0.02) spawnMeteor()
      const fallSpeed = readNumber(currentParams, 'fallSpeed', 0.12)
      meteors.forEach((meteor) => {
        meteor.position.y -= fallSpeed
        meteor.rotation.x += 0.04
        meteor.rotation.y += 0.03
        if (meteor.position.distanceTo(ship.position) < 0.78) {
          updateTelemetry({ label: '碰撞发生，本轮结束', score, status: '点击重置后重新开始' })
        }
        if (meteor.position.y < -3.5) meteor.position.y = 3.8 + Math.random()
      })
      updateTelemetry({ label: '生存中', score, status: '躲开下落陨石' })
      renderer.render(scene, camera)
    }
    animate()
  } else if (id === 'mario-3d') {
    baseGrid.visible = false
    scene.background = track(new THREE.Color('#5c94fc'))
    scene.fog = track(new THREE.Fog('#5c94fc', 28, 65))

    // Add Sun Light
    const sunLight = track(new THREE.DirectionalLight('#ffffff', 1.3))
    sunLight.position.set(20, 30, 15)
    scene.add(sunLight)

    // Build 3D Mario Mesh
    const mGroup = new THREE.Group()
    const redMat = track(new THREE.MeshStandardMaterial({ color: '#e52521', roughness: 0.3 }))
    const blueMat = track(new THREE.MeshStandardMaterial({ color: '#002878', roughness: 0.4 }))
    const skinMat = track(new THREE.MeshStandardMaterial({ color: '#ffcc99', roughness: 0.4 }))
    const bootMat = track(new THREE.MeshStandardMaterial({ color: '#733800', roughness: 0.6 }))
    const gloveMat = track(new THREE.MeshStandardMaterial({ color: '#ffffff' }))
    const yellowMat = track(new THREE.MeshStandardMaterial({ color: '#f8b800', metalness: 0.4 }))
    const eyeMat = track(new THREE.MeshBasicMaterial({ color: '#002878' }))
    const stacheMat = track(new THREE.MeshStandardMaterial({ color: '#3d1e03' }))

    // Head & Cap
    const head = new THREE.Mesh(track(new THREE.BoxGeometry(0.5, 0.44, 0.44)), skinMat)
    head.position.set(0, 0.65, 0)
    const cap = new THREE.Mesh(track(new THREE.BoxGeometry(0.58, 0.22, 0.58)), redMat)
    cap.position.set(0, 0.86, 0)
    const visor = new THREE.Mesh(track(new THREE.BoxGeometry(0.42, 0.08, 0.24)), redMat)
    visor.position.set(0.18, 0.8, 0)
    const eyeR = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.12, 0.08)), eyeMat)
    eyeR.position.set(0.24, 0.68, 0.14)
    const eyeL = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.12, 0.08)), eyeMat)
    eyeL.position.set(0.24, 0.68, -0.14)
    const stache = new THREE.Mesh(track(new THREE.BoxGeometry(0.12, 0.09, 0.32)), stacheMat)
    stache.position.set(0.25, 0.58, 0)
    mGroup.add(head, cap, visor, eyeR, eyeL, stache)

    // Torso & Overalls
    const shirt = new THREE.Mesh(track(new THREE.BoxGeometry(0.46, 0.44, 0.36)), redMat)
    shirt.position.set(0, 0.3, 0)
    const overalls = new THREE.Mesh(track(new THREE.BoxGeometry(0.48, 0.34, 0.38)), blueMat)
    overalls.position.set(0, 0.18, 0)
    const btnR = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.08, 0.08)), yellowMat)
    btnR.position.set(0.23, 0.28, 0.12)
    const btnL = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.08, 0.08)), yellowMat)
    btnL.position.set(0.23, 0.28, -0.12)
    mGroup.add(shirt, overalls, btnR, btnL)

    // Limbs
    const armGeo = track(new THREE.BoxGeometry(0.18, 0.36, 0.18))
    const gloveGeo = track(new THREE.BoxGeometry(0.22, 0.22, 0.22))
    const armL = new THREE.Group()
    const armLMesh = new THREE.Mesh(armGeo, redMat)
    armLMesh.position.y = -0.12
    const gloveL = new THREE.Mesh(gloveGeo, gloveMat)
    gloveL.position.y = -0.3
    armL.add(armLMesh, gloveL)
    armL.position.set(0, 0.38, 0.26)

    const armR = new THREE.Group()
    const armRMesh = new THREE.Mesh(armGeo, redMat)
    armRMesh.position.y = -0.12
    const gloveR = new THREE.Mesh(gloveGeo, gloveMat)
    gloveR.position.y = -0.3
    armR.add(armRMesh, gloveR)
    armR.position.set(0, 0.38, -0.26)
    mGroup.add(armL, armR)

    const legGeo = track(new THREE.BoxGeometry(0.2, 0.32, 0.2))
    const bootGeo = track(new THREE.BoxGeometry(0.28, 0.18, 0.24))
    const legL = new THREE.Group()
    const legLMesh = new THREE.Mesh(legGeo, blueMat)
    legLMesh.position.y = -0.12
    const bootL = new THREE.Mesh(bootGeo, bootMat)
    bootL.position.set(0.04, -0.24, 0)
    legL.add(legLMesh, bootL)
    legL.position.set(0, 0.02, 0.13)

    const legR = new THREE.Group()
    const legRMesh = new THREE.Mesh(legGeo, blueMat)
    legRMesh.position.y = -0.12
    const bootR = new THREE.Mesh(bootGeo, bootMat)
    bootR.position.set(0.04, -0.24, 0)
    legR.add(legRMesh, bootR)
    legR.position.set(0, 0.02, -0.13)
    mGroup.add(legL, legR)

    mGroup.rotation.y = Math.PI / 2
    mGroup.position.set(2, 0.6, 0)
    group.add(mGroup)

    // Build World 1-1 Stage Geometry & Objects
    type BlockItem = { mesh: THREE.Mesh; type: 'question' | 'brick' | 'empty'; x: number; y: number; active: boolean; hasMushroom?: boolean }
    type EnemyItem = { mesh: THREE.Group; x: number; y: number; minX: number; maxX: number; dir: number; alive: boolean }
    type CoinItem = { mesh: THREE.Mesh; x: number; y: number; collected: boolean }

    const blocks: BlockItem[] = []
    const enemies: EnemyItem[] = []
    const coins: CoinItem[] = []
    const platforms: Array<{ minX: number; maxX: number; y: number }> = []

    const soilMat = track(new THREE.MeshStandardMaterial({ color: '#c84c0c', roughness: 0.8 }))
    const grassMat = track(new THREE.MeshStandardMaterial({ color: '#00a800', roughness: 0.5 }))
    const pipeMat = track(new THREE.MeshStandardMaterial({ color: '#00a800', roughness: 0.3, metalness: 0.2 }))
    const qBlockMat = track(new THREE.MeshStandardMaterial({ color: '#fc9838', roughness: 0.2, metalness: 0.5, emissive: '#552800' }))
    const emptyBlockMat = track(new THREE.MeshStandardMaterial({ color: '#8c521c', roughness: 0.7 }))
    const brickMat = track(new THREE.MeshStandardMaterial({ color: '#b84418', roughness: 0.7 }))
    const coinMat = track(new THREE.MeshStandardMaterial({ color: '#f8b800', metalness: 0.8, roughness: 0.15, emissive: '#443000' }))

    // Helper for Ground Segment
    const addGroundSegment = (startX: number, endX: number): void => {
      const len = endX - startX
      const gMesh = new THREE.Mesh(track(new THREE.BoxGeometry(len, 2, 3)), soilMat)
      gMesh.position.set(startX + len / 2, -1, 0)
      const topGrass = new THREE.Mesh(track(new THREE.BoxGeometry(len, 0.2, 3.1)), grassMat)
      topGrass.position.set(startX + len / 2, 0.05, 0)
      group.add(gMesh, topGrass)
      platforms.push({ minX: startX, maxX: endX, y: 0.15 })
    }

    // World 1-1 Ground Segments (with pits/gaps)
    addGroundSegment(-10, 32)
    addGroundSegment(36, 74)
    addGroundSegment(79, 114)
    addGroundSegment(118, 160)

    // Helper for Pipe
    const addPipe = (x: number, height: number): void => {
      const pipeGeo = track(new THREE.CylinderGeometry(0.8, 0.8, height, 16))
      const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat)
      pipeMesh.position.set(x, height / 2, 0)
      const rimGeo = track(new THREE.CylinderGeometry(0.92, 0.92, 0.5, 16))
      const rimMesh = new THREE.Mesh(rimGeo, pipeMat)
      rimMesh.position.set(x, height - 0.25, 0)
      group.add(pipeMesh, rimMesh)
      platforms.push({ minX: x - 0.9, maxX: x + 0.9, y: height })
    }

    // Pipes in 1-1
    addPipe(18, 2.2)
    addPipe(38, 3.2)
    addPipe(56, 4.2)
    addPipe(88, 3.2)
    addPipe(126, 2.2)

    // Helper for Blocks
    const addBlock = (x: number, y: number, type: 'question' | 'brick', hasMushroom = false): void => {
      const mat = type === 'question' ? qBlockMat : brickMat
      const bMesh = new THREE.Mesh(track(new THREE.BoxGeometry(1, 1, 1)), mat)
      bMesh.position.set(x, y, 0)
      group.add(bMesh)
      blocks.push({ mesh: bMesh, type, x, y, active: true, hasMushroom })
      platforms.push({ minX: x - 0.5, maxX: x + 0.5, y: y + 0.5 })
    }

    // Blocks in 1-1
    addBlock(10, 3.6, 'question')
    addBlock(14, 3.6, 'brick')
    addBlock(15, 3.6, 'question')
    addBlock(16, 3.6, 'brick')
    addBlock(17, 3.6, 'question', true) // Mushroom block!
    addBlock(18, 3.6, 'brick')
    addBlock(22, 6.2, 'question')

    addBlock(42, 3.6, 'brick')
    addBlock(43, 3.6, 'question', true)
    addBlock(44, 3.6, 'brick')

    addBlock(64, 3.6, 'brick')
    addBlock(65, 3.6, 'question')
    addBlock(66, 3.6, 'brick')

    addBlock(94, 6.2, 'question')
    addBlock(104, 3.6, 'brick')
    addBlock(105, 3.6, 'question')

    // Add Staircase Blocks leading to Flagpole
    const addStaircase = (startX: number): void => {
      for (let step = 1; step <= 8; step++) {
        for (let y = 1; y <= step; y++) {
          const sMesh = new THREE.Mesh(track(new THREE.BoxGeometry(1, 1, 1)), brickMat)
          sMesh.position.set(startX + step, y - 0.5, 0)
          group.add(sMesh)
          platforms.push({ minX: startX + step - 0.5, maxX: startX + step + 0.5, y: y })
        }
      }
    }
    addStaircase(130)

    // Flagpole & Castle (End of 1-1)
    const poleMesh = new THREE.Mesh(track(new THREE.CylinderGeometry(0.08, 0.08, 9.5, 12)), track(new THREE.MeshStandardMaterial({ color: '#e0e0e0', metalness: 0.8 })))
    poleMesh.position.set(145, 4.75, 0)
    const orbMesh = new THREE.Mesh(track(new THREE.SphereGeometry(0.3, 12, 12)), yellowMat)
    orbMesh.position.set(145, 9.6, 0)
    const flagMesh = new THREE.Mesh(track(new THREE.BoxGeometry(1.4, 0.8, 0.05)), track(new THREE.MeshStandardMaterial({ color: '#00a800' })))
    flagMesh.position.set(145.7, 9.0, 0)
    group.add(poleMesh, orbMesh, flagMesh)

    const castleMesh = new THREE.Mesh(track(new THREE.BoxGeometry(5, 5, 4)), brickMat)
    castleMesh.position.set(154, 2.5, 0)
    const doorMesh = new THREE.Mesh(track(new THREE.BoxGeometry(1.4, 2.4, 4.1)), track(new THREE.MeshBasicMaterial({ color: '#000000' })))
    doorMesh.position.set(154, 1.2, 0)
    group.add(castleMesh, doorMesh)

    // Coins floating in air
    const addCoin = (x: number, y: number): void => {
      const cMesh = new THREE.Mesh(track(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 12)), coinMat)
      cMesh.rotation.x = Math.PI / 2
      cMesh.position.set(x, y, 0)
      group.add(cMesh)
      coins.push({ mesh: cMesh, x, y, collected: false })
    }
    addCoin(8, 2.5); addCoin(9, 2.5); addCoin(26, 3.8); addCoin(27, 3.8); addCoin(50, 4.5); addCoin(98, 7.5); addCoin(100, 7.5)

    // Goombas (栗子球) Enemies
    const addGoomba = (x: number, minX: number, maxX: number): void => {
      const gGroup = new THREE.Group()
      const capMesh = new THREE.Mesh(track(new THREE.ConeGeometry(0.48, 0.45, 8)), track(new THREE.MeshStandardMaterial({ color: '#8c4010', roughness: 0.6 })))
      capMesh.position.y = 0.3
      const stemMesh = new THREE.Mesh(track(new THREE.CylinderGeometry(0.3, 0.35, 0.3, 8)), track(new THREE.MeshStandardMaterial({ color: '#f8b888' })))
      stemMesh.position.y = 0.05
      gGroup.add(capMesh, stemMesh)
      gGroup.position.set(x, 0.25, 0)
      group.add(gGroup)
      enemies.push({ mesh: gGroup, x, y: 0.25, minX, maxX, dir: -1, alive: true })
    }

    addGoomba(24, 20, 30)
    addGoomba(48, 40, 54)
    addGoomba(70, 60, 73)
    addGoomba(98, 90, 110)
    addGoomba(124, 120, 125)

    // Game Physics & Player Controls State
    let velocityY = 0
    let isJumping = false
    let coinsCount = 0
    let scoreCount = 0
    let livesCount = 3
    let invulnerableTimer = 0
    let isSuper = false
    let animTime = 0
    let isLevelCleared = false

    const keys: Record<string, boolean> = {}

    // Virtual D-Pad Overlay Elements for Touch / Mouse Click
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:absolute;bottom:12px;left:12px;right:12px;display:flex;justify-content:space-between;pointer-events:none;z-index:10;'
    overlay.innerHTML = `
      <div style="display:flex;gap:8px;pointer-events:auto;">
        <button id="mario-btn-left" style="width:50px;height:44px;background:rgba(0,0,0,0.6);color:#fff;border:1px solid #58d5ff;border-radius:8px;font-weight:bold;font-size:18px;cursor:pointer;">⬅️</button>
        <button id="mario-btn-right" style="width:50px;height:44px;background:rgba(0,0,0,0.6);color:#fff;border:1px solid #58d5ff;border-radius:8px;font-weight:bold;font-size:18px;cursor:pointer;">➡️</button>
      </div>
      <div style="display:flex;gap:8px;pointer-events:auto;">
        <button id="mario-btn-dash" style="width:54px;height:44px;background:rgba(248,184,0,0.4);color:#fff;border:1px solid #f8b800;border-radius:8px;font-weight:bold;font-size:14px;cursor:pointer;">⚡加速</button>
        <button id="mario-btn-jump" style="width:64px;height:44px;background:rgba(229,37,33,0.7);color:#fff;border:1px solid #e52521;border-radius:8px;font-weight:bold;font-size:16px;cursor:pointer;">⬆️跳跃</button>
      </div>
    `
    container.appendChild(overlay)
    listeners.push(() => { if (overlay.parentElement === container) container.removeChild(overlay) })

    const bindBtn = (btnId: string, keyName: string): void => {
      const el = overlay.querySelector(`#${btnId}`)
      if (!el) return
      const start = (e: Event): void => { e.preventDefault(); keys[keyName] = true }
      const end = (e: Event): void => { e.preventDefault(); keys[keyName] = false }
      el.addEventListener('mousedown', start)
      el.addEventListener('mouseup', end)
      el.addEventListener('touchstart', start)
      el.addEventListener('touchend', end)
    }
    bindBtn('mario-btn-left', 'ArrowLeft')
    bindBtn('mario-btn-right', 'ArrowRight')
    bindBtn('mario-btn-jump', 'Space')
    bindBtn('mario-btn-dash', 'Shift')

    const keydown = (e: KeyboardEvent): void => { keys[e.code] = true; keys[e.key] = true }
    const keyup = (e: KeyboardEvent): void => { keys[e.code] = false; keys[e.key] = false }
    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    listeners.push(() => window.removeEventListener('keydown', keydown))
    listeners.push(() => window.removeEventListener('keyup', keyup))

    updateTelemetry({ label: 'MARIO 1-1 就绪', score: 0, status: '键盘 A/D 或 ⬅️/➡️ 移动，Space/W/⬆️ 跳跃，Shift 加速' })

    const animate = (): void => {
      frameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      animTime += delta

      isSuper = readBoolean(currentParams, 'superMushroom', false) || isSuper
      const baseSpeed = readNumber(currentParams, 'moveSpeed', 0.16) * (keys.Shift ? 1.45 : 1.0)
      const jumpForce = readNumber(currentParams, 'jumpForce', 0.32)
      const enemySpeed = readNumber(currentParams, 'enemySpeed', 0.05)

      // Mario Scale for Super Mario
      const targetScale = isSuper ? 1.45 : 1.0
      mGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15)

      if (invulnerableTimer > 0) {
        invulnerableTimer -= delta
        mGroup.visible = Math.floor(animTime * 20) % 2 === 0
      } else {
        mGroup.visible = true
      }

      if (!isLevelCleared) {
        // Horizontal Movement
        let isMoving = false
        if (keys.ArrowLeft || keys.KeyA) {
          mGroup.position.x -= baseSpeed
          mGroup.rotation.y = -Math.PI / 2
          isMoving = true
        }
        if (keys.ArrowRight || keys.KeyD) {
          mGroup.position.x += baseSpeed
          mGroup.rotation.y = Math.PI / 2
          isMoving = true
        }

        // Jump Trigger
        if ((keys.Space || keys.ArrowUp || keys.KeyW) && !isJumping) {
          velocityY = jumpForce
          isJumping = true
        }

        // Apply Gravity
        velocityY -= 0.015
        mGroup.position.y += velocityY

        // Platform Collisions (Finding ground height at Mario's X position)
        const mx = mGroup.position.x
        let currentPlatformY = -10 // Default pit drop

        for (const p of platforms) {
          if (mx >= p.minX && mx <= p.maxX) {
            if (p.y > currentPlatformY && mGroup.position.y >= p.y - 0.2) {
              currentPlatformY = p.y
            }
          }
        }

        // Landing on platform
        if (mGroup.position.y <= currentPlatformY) {
          mGroup.position.y = currentPlatformY
          velocityY = 0
          isJumping = false
        }

        // Hit Bottom of Block Detection (when jumping upwards)
        if (velocityY > 0) {
          for (const b of blocks) {
            if (b.active && Math.abs(mx - b.x) < 0.6 && Math.abs((mGroup.position.y + 1.2 * targetScale) - b.y) < 0.5) {
              velocityY = -0.05
              b.mesh.position.y = b.y + 0.25
              setTimeout(() => { b.mesh.position.y = b.y }, 100)

              if (b.type === 'question') {
                b.active = false
                b.mesh.material = emptyBlockMat
                coinsCount += 1
                scoreCount += 200

                // Pop gold coin effect
                const popCoin = new THREE.Mesh(track(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 12)), coinMat)
                popCoin.rotation.x = Math.PI / 2
                popCoin.position.set(b.x, b.y + 1, 0)
                group.add(popCoin)
                let popY = 0
                const popAnim = setInterval(() => {
                  popY += 0.15
                  popCoin.position.y += 0.15
                  popCoin.rotation.z += 0.3
                  if (popY > 1.2) {
                    clearInterval(popAnim)
                    group.remove(popCoin)
                  }
                }, 20)
                updateTelemetry({ label: '顶开❓问号块！', score: scoreCount, status: `🪙 金币 +1 (共 ${coinsCount} 枚)` })
              }
            }
          }
        }

        // Collect Floating Coins
        for (const c of coins) {
          if (!c.collected && Math.abs(mx - c.x) < 0.7 && Math.abs(mGroup.position.y + 0.6 - c.y) < 0.8) {
            c.collected = true
            c.mesh.visible = false
            coinsCount += 1
            scoreCount += 200
            updateTelemetry({ label: '拾取旋转金币！', score: scoreCount, status: `🪙 金币: ${coinsCount} | 得分: ${scoreCount}` })
          }
        }

        // Spin Coins
        coins.forEach(c => { if (!c.collected) c.mesh.rotation.z += 0.05 })

        // Goombas (栗子球) Update & Stomp Detection
        enemies.forEach(e => {
          if (!e.alive) return
          e.x += e.dir * enemySpeed
          if (e.x < e.minX || e.x > e.maxX) e.dir *= -1
          e.mesh.position.x = e.x

          const dist = Math.abs(mx - e.x)
          const my = mGroup.position.y
          // Stomp from top
          if (dist < 0.75 && velocityY < 0 && my > e.y + 0.25 && my < e.y + 0.8) {
            e.alive = false
            e.mesh.scale.set(1.2, 0.15, 1.2)
            velocityY = 0.22
            scoreCount += 100
            updateTelemetry({ label: '踩扁栗子球！+100', score: scoreCount, status: `得分: ${scoreCount}` })
            setTimeout(() => { group.remove(e.mesh) }, 400)
          } else if (dist < 0.65 && Math.abs(my - e.y) < 0.5 && invulnerableTimer <= 0) {
            // Side collision
            if (isSuper) {
              isSuper = false
              invulnerableTimer = 2.0
              updateTelemetry({ label: '变小马里奥！', score: scoreCount, status: '受到碰撞，已变成小马里奥' })
            } else {
              livesCount -= 1
              mGroup.position.set(2, 0.6, 0)
              invulnerableTimer = 2.0
              if (livesCount <= 0) {
                updateTelemetry({ label: 'GAME OVER!', score: scoreCount, status: '生命耗尽，点击重置重新开始' })
              } else {
                updateTelemetry({ label: '损失 1 颗生命！', score: scoreCount, status: `剩余生命: ❤️ x${livesCount}` })
              }
            }
          }
        })

        // Pit Fall Check
        if (mGroup.position.y < -3.5) {
          livesCount -= 1
          mGroup.position.set(2, 0.6, 0)
          velocityY = 0
          updateTelemetry({ label: '掉入悬崖坑洞！', score: scoreCount, status: `剩余生命: ❤️ x${Math.max(0, livesCount)}` })
        }

        // Flagpole Victory Check (x >= 144.8)
        if (mGroup.position.x >= 144.8) {
          isLevelCleared = true
          scoreCount += 2000
          flagMesh.position.y = 1.2 // Flag slides down
          updateTelemetry({ label: '🎉 通关! WORLD 1-1 CLEARED!', score: scoreCount, status: `得分: ${scoreCount} | 顺利到达终点城堡！` })
        }

        // Limb Running Animation
        if (isMoving && !isJumping) {
          mGroup.armL.rotation.z = Math.sin(animTime * 14) * 0.6
          mGroup.armR.rotation.z = -Math.sin(animTime * 14) * 0.6
          mGroup.legL.rotation.z = -Math.sin(animTime * 14) * 0.7
          mGroup.legR.rotation.z = Math.sin(animTime * 14) * 0.7
        } else if (isJumping) {
          mGroup.armL.rotation.z = -1.2
          mGroup.armR.rotation.z = 1.2
          mGroup.legL.rotation.z = 0.5
          mGroup.legR.rotation.z = -0.5
        } else {
          mGroup.armL.rotation.z = 0
          mGroup.armR.rotation.z = 0
          mGroup.legL.rotation.z = 0
          mGroup.legR.rotation.z = 0
        }
      }

      // Smooth Camera Side-scrolling Lerp
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, mGroup.position.x + 2.5, 0.08)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 4.2 + mGroup.position.y * 0.3, 0.08)
      camera.position.z = 11.5
      camera.lookAt(mGroup.position.x + 1.2, 2.4 + mGroup.position.y * 0.2, 0)

      renderer.render(scene, camera)
    }
    animate()
  }

  const resize = (): void => {
    const { clientWidth, clientHeight } = container
    if (!clientWidth || !clientHeight) return
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(clientWidth, clientHeight)
  }

  return {
    updateParams(nextParams: SceneParams) {
      currentParams = { ...nextParams }
    },
    resize,
    reset() {
      score = 0
      elapsed = 0
      updateTelemetry({ label: '场景已重置', score: 0, status: '重新体验当前示例' })
    },
    dispose() {
      cancelAnimationFrame(frameId)
      listeners.forEach(dispose => dispose())
      controls.dispose()
      renderer.dispose()
      disposables.forEach((item) => {
        if ('dispose' in item && typeof item.dispose === 'function') item.dispose()
      })
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
      scene.clear()
    }
  }
}
