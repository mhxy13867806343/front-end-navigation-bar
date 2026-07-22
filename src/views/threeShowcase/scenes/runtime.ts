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
