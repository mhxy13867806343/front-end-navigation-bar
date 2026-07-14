<script setup lang="ts">

interface GridPoint {
  x: number
  y: number
}

const emit = defineEmits<{
  close: []
}>()

const CANVAS_SIZE = 400
const GRID_SIZE = 20
const TILE_COUNT = CANVAS_SIZE / GRID_SIZE

const canvasRef = ref<HTMLCanvasElement | null>(null)
const score = ref<number>(0)
const highScore = ref<number>(parseInt(localStorage.getItem('snake_high_score') || '0') || 0)
const isGameOver = ref<boolean>(false)
const isPaused = ref<boolean>(true)
const gameInterval = ref<ReturnType<typeof setInterval> | null>(null)

// Snake state
const snake = ref<GridPoint[]>([
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
])
const food = ref<GridPoint>({ x: 5, y: 5 })
const dx = ref<number>(1)
const dy = ref<number>(0)
const speed = ref<number>(120)

const initGame = (): void => {
  snake.value = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ]
  generateFood()
  dx.value = 1
  dy.value = 0
  score.value = 0
  isGameOver.value = false
  isPaused.value = true
  if (gameInterval.value) clearInterval(gameInterval.value)
  draw()
}

const generateFood = (): void => {
  let newFood: GridPoint | null = null
  while (!newFood || snake.value.some((segment: GridPoint): boolean => segment.x === newFood?.x && segment.y === newFood?.y)) {
    newFood = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    }
  }
  food.value = newFood
}

const handleKeydown = (e: KeyboardEvent): void => {
  if (isGameOver.value) return
  if (e.key === ' ' || e.code === 'Space') {
    togglePause()
    e.preventDefault()
    return
  }

  if (isPaused.value) return

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      if (dy.value === 0) { dx.value = 0; dy.value = -1; }
      e.preventDefault()
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      if (dy.value === 0) { dx.value = 0; dy.value = 1; }
      e.preventDefault()
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (dx.value === 0) { dx.value = -1; dy.value = 0; }
      e.preventDefault()
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      if (dx.value === 0) { dx.value = 1; dy.value = 0; }
      e.preventDefault()
      break
  }
}

const togglePause = (): void => {
  if (isGameOver.value) return
  isPaused.value = !isPaused.value
  if (!isPaused.value) {
    gameInterval.value = setInterval(update, speed.value)
  } else {
    if (gameInterval.value) clearInterval(gameInterval.value)
  }
}

const update = (): void => {
  // Move head
  const head: GridPoint = { x: snake.value[0].x + dx.value, y: snake.value[0].y + dy.value }

  // Collision with walls
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    endGame()
    return
  }

  // Collision with self
  if (snake.value.some((segment: GridPoint): boolean => segment.x === head.x && segment.y === head.y)) {
    endGame()
    return
  }

  snake.value.unshift(head)

  // Eat food
  if (head.x === food.value.x && head.y === food.value.y) {
    score.value += 10
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem('snake_high_score', highScore.value.toString())
    }
    generateFood()
  } else {
    snake.value.pop()
  }

  draw()
}

const endGame = (): void => {
  isGameOver.value = true
  isPaused.value = true
  if (gameInterval.value) clearInterval(gameInterval.value)
  draw()
}

const draw = (): void => {
  const canvas: HTMLCanvasElement | null = canvasRef.value
  if (!canvas) return
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!ctx) return
  
  // Clear canvas
  ctx.fillStyle = '#1e1e24'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  // Draw grid helper (subtle)
  ctx.strokeStyle = '#2d2d35'
  ctx.lineWidth = 0.5
  for (let i: number = 0; i <= TILE_COUNT; i++) {
    ctx.beginPath()
    ctx.moveTo(i * GRID_SIZE, 0)
    ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * GRID_SIZE)
    ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE)
    ctx.stroke()
  }

  // Draw food (apple red neon glow)
  ctx.fillStyle = '#ff4757'
  ctx.shadowBlur = 8
  ctx.shadowColor = '#ff4757'
  ctx.beginPath()
  const foodRadius: number = GRID_SIZE / 2 - 2
  ctx.arc(
    food.value.x * GRID_SIZE + GRID_SIZE / 2,
    food.value.y * GRID_SIZE + GRID_SIZE / 2,
    foodRadius,
    0,
    2 * Math.PI
  )
  ctx.fill()
  ctx.shadowBlur = 0 // reset

  // Draw snake (cyan neon gradient)
  snake.value.forEach((segment: GridPoint, index: number): void => {
    const isHead: boolean = index === 0
    ctx.fillStyle = isHead ? '#00d2d3' : '#1dd1a1'
    ctx.shadowBlur = isHead ? 6 : 0
    ctx.shadowColor = '#00d2d3'
    
    // Draw rounded snake body
    ctx.beginPath()
    ctx.roundRect(
      segment.x * GRID_SIZE + 1,
      segment.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2,
      isHead ? 6 : 4
    )
    ctx.fill()
  })
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  initGame()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (gameInterval.value) clearInterval(gameInterval.value)
})
</script>

<template>
  <div class="snake-container">
    <div class="game-header">
      <div class="score-board">
        <div class="score-item">
          <span class="label">SCORE</span>
          <span class="val">{{ score }}</span>
        </div>
        <div class="score-item">
          <span class="label">BEST</span>
          <span class="val">{{ highScore }}</span>
        </div>
      </div>
      <div class="game-title">⚡ 贪吃蛇大作战 ⚡</div>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="CANVAS_SIZE" :height="CANVAS_SIZE"></canvas>
      
      <!-- Overlay Screen -->
      <div v-if="isPaused || isGameOver" class="overlay">
        <div v-if="isGameOver" class="game-over-panel">
          <h2>GAME OVER</h2>
          <p>得分: {{ score }}</p>
          <button class="action-btn" @click="initGame">重新开始</button>
        </div>
        <div v-else-if="isPaused" class="pause-panel">
          <h2>PAUSED</h2>
          <p>按 [ 空格键 ] 或点击下方按钮开始</p>
          <button class="action-btn" @click="togglePause">开始游戏</button>
        </div>
      </div>
    </div>

    <div class="controls-helper">
      <p>操作说明: 键盘 <b>W / A / S / D</b> 或 <b>方向键</b> 移动，<b>空格键</b> 暂停/继续。</p>
    </div>
  </div>
</template>

<style scoped>
.snake-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #fff;
  padding: 10px 0;
}

.game-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  align-items: center;
}

.score-board {
  display: flex;
  gap: 16px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 8px;
  min-width: 60px;
}

.score-item .label {
  font-size: 10px;
  color: #a0a0b0;
  font-weight: bold;
}

.score-item .val {
  font-size: 16px;
  font-weight: bold;
  color: #00d2d3;
}

.game-title {
  font-size: 15px;
  font-weight: bold;
  background: linear-gradient(135deg, #00d2d3, #1dd1a1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.canvas-wrapper {
  position: relative;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

canvas {
  display: block;
  background: #1e1e24;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(30, 30, 36, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.game-over-panel h2, .pause-panel h2 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.game-over-panel h2 {
  color: #ff4757;
}

.pause-panel h2 {
  color: #00d2d3;
}

.game-over-panel p, .pause-panel p {
  color: #a0a0b0;
  font-size: 14px;
  margin-bottom: 20px;
}

.action-btn {
  background: linear-gradient(135deg, #00d2d3, #1dd1a1);
  color: #fff;
  border: none;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(0, 210, 211, 0.3);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 210, 211, 0.5);
}

.controls-helper {
  font-size: 12px;
  color: #a0a0b0;
  text-align: center;
  max-width: 400px;
  line-height: 1.5;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
