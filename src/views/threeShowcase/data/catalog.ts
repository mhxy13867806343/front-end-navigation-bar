import type {
  ThreeExampleDetail,
  ThreeExampleMeta,
  ThreeLabGame,
  ThreeLearningStep
} from '../types'

const baseCode = (title: string): string => `import * as THREE from 'three'

const scene = new THREE.Scene()
scene.background = new THREE.Color('#050816')

const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
camera.position.set(3, 2, 6)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(width, height)

// ${title}
function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

animate()
`

export const learningSteps: ThreeLearningStep[] = [
  { title: '基础几何体', description: '从立方体、球体、网格辅助线和 OrbitControls 开始，先建立空间与坐标系认知。' },
  { title: '材质与灯光', description: '学习标准材质、环境光、点光源和动态光影，让静态模型具备层次和情绪。' },
  { title: '粒子与动画', description: '进一步掌握 Points、噪声动画和时间驱动更新，构建更具视觉冲击力的场景。' },
  { title: '地形与后处理', description: '进入高级阶段，体验波浪地形、霓虹结构和更复杂的沉浸式画面。' },
  { title: '互动实验与小游戏', description: '将 3D 场景转化为可玩的互动实验，理解输入、碰撞、状态和反馈机制。' }
]

export const featuredHighlights: Array<{ title: string; description: string; accent: string }> = [
  { title: '从入门到高级', description: '覆盖基础几何体、灯光、粒子、波浪地形、霓虹场景与小游戏。', accent: 'cyan' },
  { title: '看代码也看效果', description: '每个示例都同时展示运行效果、参数面板和关键代码片段。', accent: 'violet' },
  { title: '真实交互示范', description: '提供点击收集、躲避障碍、镜头漫游等互动实验，不是静态截图。', accent: 'gold' }
]

export const examples: ThreeExampleDetail[] = [
  {
    id: 'basic-cube',
    title: '基础立方体',
    category: 'basic',
    difficulty: 'easy',
    summary: '最经典的 Three.js 入门示例，展示相机、几何体、材质和旋转动画。',
    tags: ['几何体', '旋转动画', 'OrbitControls'],
    coverType: 'gradient',
    accent: '#58d5ff',
    sceneType: '基础场景',
    heroLabel: 'Start Here',
    knowledgePoints: ['PerspectiveCamera', 'MeshStandardMaterial', 'AmbientLight', 'requestAnimationFrame'],
    useCases: ['3D 入门教学', '组件演示首例', '空间坐标理解'],
    parameters: [
      { key: 'rotationSpeed', label: '旋转速度', type: 'range', min: 0.002, max: 0.04, step: 0.002, value: 0.012 },
      { key: 'cubeColor', label: '立方体颜色', type: 'color', value: '#58d5ff' },
      { key: 'showGrid', label: '显示网格', type: 'toggle', value: true }
    ],
    codeBlocks: [
      { title: '场景初始化', language: 'ts', content: baseCode('创建旋转立方体与基础灯光') },
      { title: '动画更新', language: 'ts', content: `mesh.rotation.x += rotationSpeed\nmesh.rotation.y += rotationSpeed * 1.35\ncontrols.update()` }
    ]
  },
  {
    id: 'light-orbit',
    title: '光影环轨',
    category: 'advanced',
    difficulty: 'medium',
    summary: '通过环形主体与动态点光源，演示光照、金属材质和镜头质感。',
    tags: ['点光源', '金属材质', '动态光影'],
    coverType: 'gradient',
    accent: '#b883ff',
    sceneType: '光影示例',
    heroLabel: 'Lighting',
    knowledgePoints: ['PointLight', 'MeshPhysicalMaterial', 'TorusKnotGeometry', 'Color lerp'],
    useCases: ['产品可视化', '品牌型 3D 落地页', '动效材质演示'],
    parameters: [
      { key: 'lightIntensity', label: '灯光强度', type: 'range', min: 0.6, max: 4, step: 0.1, value: 2.1 },
      { key: 'metalness', label: '金属感', type: 'range', min: 0, max: 1, step: 0.05, value: 0.75 },
      { key: 'roughness', label: '粗糙度', type: 'range', min: 0.05, max: 1, step: 0.05, value: 0.22 }
    ],
    codeBlocks: [
      { title: '动态点光源', language: 'ts', content: `lights.forEach((light, index) => {\n  light.position.x = Math.cos(time + index) * 4.2\n  light.position.z = Math.sin(time + index) * 4.2\n})` },
      { title: '物理材质', language: 'ts', content: `new THREE.MeshPhysicalMaterial({\n  color: '#7d8dff',\n  metalness,\n  roughness,\n  clearcoat: 1,\n  emissive: new THREE.Color('#1b2258')\n})` }
    ]
  },
  {
    id: 'particle-galaxy',
    title: '粒子星河',
    category: 'shader',
    difficulty: 'medium',
    summary: '通过大量粒子生成旋转星河，展示 Points、BufferGeometry 和深空氛围。',
    tags: ['粒子', 'BufferGeometry', '银河'],
    coverType: 'gradient',
    accent: '#65ffca',
    sceneType: '粒子场景',
    heroLabel: 'Particles',
    knowledgePoints: ['Points', 'BufferAttribute', 'AdditiveBlending', '时间驱动动画'],
    useCases: ['品牌 KV 背景', '数据宇宙可视化', '沉浸式登录页'],
    parameters: [
      { key: 'particleCount', label: '粒子数量', type: 'range', min: 800, max: 5000, step: 200, value: 2200 },
      { key: 'swirlStrength', label: '旋转力度', type: 'range', min: 0.2, max: 2.4, step: 0.1, value: 1.1 },
      { key: 'particleColor', label: '粒子主色', type: 'color', value: '#65ffca' }
    ],
    codeBlocks: [
      { title: '粒子坐标生成', language: 'ts', content: `positions[i3] = Math.cos(angle) * radius\npositions[i3 + 1] = (Math.random() - 0.5) * 1.4\npositions[i3 + 2] = Math.sin(angle) * radius` },
      { title: '粒子旋转更新', language: 'ts', content: `points.rotation.y += 0.0015 * swirlStrength\nmaterial.color.lerp(targetColor, 0.08)` }
    ]
  },
  {
    id: 'wave-terrain',
    title: '波浪地形',
    category: 'advanced',
    difficulty: 'hard',
    summary: '利用平面网格顶点位移形成动态波浪地形，适合展示数据地貌与实验室氛围。',
    tags: ['顶点位移', '地形', '线框'],
    coverType: 'gradient',
    accent: '#ffcb6b',
    sceneType: '地形场景',
    heroLabel: 'Terrain',
    knowledgePoints: ['PlaneGeometry', 'position.needsUpdate', 'wireframe', 'sin/cos wave'],
    useCases: ['数据地形图', '实验室主页', '高级背景演示'],
    parameters: [
      { key: 'amplitude', label: '波浪高度', type: 'range', min: 0.08, max: 1.2, step: 0.02, value: 0.32 },
      { key: 'waveSpeed', label: '波浪速度', type: 'range', min: 0.2, max: 2.2, step: 0.1, value: 0.9 },
      { key: 'wireframe', label: '线框模式', type: 'toggle', value: true }
    ],
    codeBlocks: [
      { title: '顶点位移', language: 'ts', content: `for (let i = 0; i < positions.count; i += 1) {\n  const x = positions.getX(i)\n  const y = positions.getY(i)\n  positions.setZ(i, Math.sin(x * 0.8 + time) * amplitude + Math.cos(y * 0.6 + time) * amplitude)\n}` },
      { title: '动态法线', language: 'ts', content: `geometry.computeVertexNormals()\npositions.needsUpdate = true` }
    ]
  },
  {
    id: 'neon-portal',
    title: '霓虹门廊',
    category: 'experiment',
    difficulty: 'hard',
    summary: '利用多层环形结构和镜头推进形成未来感极强的 3D 入口场景。',
    tags: ['霓虹', '镜头推进', '实验性视觉'],
    coverType: 'gradient',
    accent: '#ff79d1',
    sceneType: '沉浸入口',
    heroLabel: 'Portal',
    knowledgePoints: ['RingGeometry', 'Group', 'Fog', 'camera lerp'],
    useCases: ['高端官网首页', '发布会 KV', '科技展示页'],
    parameters: [
      { key: 'ringSpeed', label: '门廊速度', type: 'range', min: 0.2, max: 2, step: 0.1, value: 0.8 },
      { key: 'glowColor', label: '发光颜色', type: 'color', value: '#ff79d1' },
      { key: 'pulse', label: '脉冲效果', type: 'toggle', value: true }
    ],
    codeBlocks: [
      { title: '多层圆环', language: 'ts', content: `rings.forEach((ring, index) => {\n  ring.position.z = ((index * 1.6 + time * ringSpeed) % 18) - 9\n  ring.rotation.z += 0.002\n})` },
      { title: '镜头推进', language: 'ts', content: `camera.position.z = 7 + Math.sin(time * 0.8) * 0.35\ncamera.lookAt(0, 0, 0)` }
    ]
  }
]

export const labGames: ThreeLabGame[] = [
  {
    id: 'orb-hunter',
    title: '能量球收集',
    category: 'game',
    difficulty: 'easy',
    summary: '点击场景中的发光能量球获取分数，适合展示 raycaster、事件交互和即时反馈。',
    tags: ['点击交互', 'Raycaster', '得分机制'],
    coverType: 'gradient',
    accent: '#7cf5ff',
    sceneType: '轻互动游戏',
    heroLabel: 'Game 01',
    knowledgePoints: ['Raycaster', 'pointer event', 'spawn logic', 'score HUD'],
    useCases: ['小游戏原型', '活动页互动', 'Three.js 交互教学'],
    parameters: [
      { key: 'orbCount', label: '能量球数量', type: 'range', min: 4, max: 18, step: 1, value: 9 },
      { key: 'orbSpeed', label: '漂浮速度', type: 'range', min: 0.2, max: 2.4, step: 0.1, value: 0.9 },
      { key: 'autoRespawn', label: '自动补球', type: 'toggle', value: true }
    ],
    codeBlocks: [
      { title: '点击命中检测', language: 'ts', content: `raycaster.setFromCamera(pointer, camera)\nconst hits = raycaster.intersectObjects(orbs)\nif (hits.length > 0) {\n  score += 10\n}` },
      { title: '得分反馈', language: 'ts', content: `emitTelemetry({ score, label: '命中能量球 +10' })` }
    ],
    controlHint: '鼠标移动观察，点击发光球得分。',
    scoreRule: '每命中一个能量球 +10 分，自动补球后继续累积分数。'
  },
  {
    id: 'meteor-dodge',
    title: '陨石闪避',
    category: 'game',
    difficulty: 'medium',
    summary: '使用键盘控制飞船左右躲避陨石，演示输入、碰撞、状态机与 HUD 更新。',
    tags: ['键盘控制', '碰撞检测', '生存玩法'],
    coverType: 'gradient',
    accent: '#ffd166',
    sceneType: '躲避游戏',
    heroLabel: 'Game 02',
    knowledgePoints: ['keyboard input', 'AABB collision', 'spawn timer', 'survival score'],
    useCases: ['3D 小游戏雏形', '交互挑战页', '直播演示素材'],
    parameters: [
      { key: 'fallSpeed', label: '陨石速度', type: 'range', min: 0.04, max: 0.3, step: 0.01, value: 0.12 },
      { key: 'spawnRate', label: '生成频率', type: 'range', min: 0.4, max: 2, step: 0.1, value: 1 },
      { key: 'trail', label: '尾焰效果', type: 'toggle', value: true }
    ],
    codeBlocks: [
      { title: '键盘输入', language: 'ts', content: `if (pressed.ArrowLeft) ship.position.x -= 0.12\nif (pressed.ArrowRight) ship.position.x += 0.12` },
      { title: '碰撞检测', language: 'ts', content: `const hit = meteors.some((meteor) => meteor.position.distanceTo(ship.position) < 0.85)\nif (hit) gameOver = true` }
    ],
    controlHint: '方向键左右移动，尽量躲开下落的陨石。',
    scoreRule: '坚持时间越久分数越高，碰撞后本轮结束。'
  }
]

export const allExamples: ThreeExampleDetail[] = [...examples, ...labGames]

export const exampleCategories: Array<{ key: ThreeExampleMeta['category']; label: string; description: string }> = [
  { key: 'basic', label: '基础', description: '几何体、相机、材质、坐标系和最小动画单元。' },
  { key: 'advanced', label: '进阶', description: '灯光、地形、动态顶点和更强的空间层次。' },
  { key: 'shader', label: '粒子', description: '适合构建星河、宇宙、能量体等高视觉张力画面。' },
  { key: 'experiment', label: '实验', description: '更偏视觉表达的未来感场景与入口页实验。' },
  { key: 'game', label: '游戏', description: '带交互规则和得分反馈的 Three.js 轻量玩法。' }
]

export const getExampleById = (id: string): ThreeExampleDetail | undefined => allExamples.find(item => item.id === id)
export const getExamplesByCategory = (category: ThreeExampleMeta['category']): ThreeExampleDetail[] => allExamples.filter(item => item.category === category)
export const getGameById = (id: string): ThreeLabGame | undefined => labGames.find(item => item.id === id)
export const getFeaturedExamples = (): ThreeExampleMeta[] => ['basic-cube', 'particle-galaxy', 'wave-terrain', 'orb-hunter']
  .map((id: string) => getExampleById(id))
  .filter((item): item is ThreeExampleDetail => Boolean(item))
