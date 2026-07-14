<script setup>

const emit = defineEmits(['close'])

const COLS = 10
const ROWS = 20
const BLOCK_SIZE = 20

const canvasRef = ref(null)
const score = ref(0)
const lines = ref(0)
const highScore = ref(parseInt(localStorage.getItem('tetris_high_score')) || 0)
const isGameOver = ref(false)
const isPaused = ref(true)
const gameInterval = ref(null)

// Tetromino colors
const COLORS = [
  'none',
  '#00f0f0', // I (Cyan)
  '#f0a000', // L (Orange)
  '#0000f0', // J (Blue)
  '#f0f000', // O (Yellow)
  '#00f000', // S (Green)
  '#a000f0', // T (Purple)
  '#f00000'  // Z (Red)
]

// Shapes of tetrominoes
const SHAPES = [
  [],
  [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
  [[0,0,2], [2,2,2], [0,0,0]],                 // L
  [[3,0,0], [3,3,3], [0,0,0]],                 // J
  [[4,4], [4,4]],                               // O
  [[0,5,5], [5,5,0], [0,0,0]],                 // S
  [[0,6,0], [6,6,6], [0,0,0]],                 // T
  [[7,7,0], [0,7,7], [0,0,0]]                  // Z
]

// Grid representing the game board
const grid = ref(Array.from({ length: ROWS }, () => Array(COLS).fill(0)))

// Current falling tetromino state
const currentType = ref(0)
const currentShape = ref([])
const currentX = ref(3)
const currentY = ref(-2)

const spawnTetromino = () => {
  const type = Math.floor(Math.random() * 7) + 1
  currentType.value = type
  currentShape.value = JSON.parse(JSON.stringify(SHAPES[type]))
  currentX.value = Math.floor((COLS - currentShape.value[0].length) / 2)
  currentY.value = 0

  // Check collision right away -> game over
  if (checkCollision(currentX.value, currentY.value, currentShape.value)) {
    endGame()
  }
}

const checkCollision = (ax, ay, shape) => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const nextX = ax + c
        const nextY = ay + r
        
        // Out of bounds
        if (nextX < 0 || nextX >= COLS || nextY >= ROWS) {
          return true
        }
        
        // Block already occupied in board
        if (nextY >= 0 && grid.value[nextY][nextX] !== 0) {
          return true
        }
      }
    }
  }
  return false
}

const mergeTetromino = () => {
  const shape = currentShape.value
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const boardY = currentY.value + r
        const boardX = currentX.value + c
        if (boardY >= 0) {
          grid.value[boardY][boardX] = currentType.value
        }
      }
    }
  }
}

const clearLines = () => {
  let cleared = 0
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid.value[r].every(val => val !== 0)) {
      grid.value.splice(r, 1)
      grid.value.unshift(Array(COLS).fill(0))
      cleared++
      r++ // check same line row index again
    }
  }
  if (cleared > 0) {
    lines.value += cleared
    score.value += [0, 100, 300, 500, 800][cleared] || 1000
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem('tetris_high_score', highScore.value.toString())
    }
  }
}

const moveDown = () => {
  if (isPaused.value || isGameOver.value) return
  if (!checkCollision(currentX.value, currentY.value + 1, currentShape.value)) {
    currentY.value++
  } else {
    mergeTetromino()
    clearLines()
    spawnTetromino()
  }
  draw()
}

const moveLeft = () => {
  if (isPaused.value || isGameOver.value) return
  if (!checkCollision(currentX.value - 1, currentY.value, currentShape.value)) {
    currentX.value--
    draw()
  }
}

const moveRight = () => {
  if (isPaused.value || isGameOver.value) return
  if (!checkCollision(currentX.value + 1, currentY.value, currentShape.value)) {
    currentX.value++
    draw()
  }
}

const rotateShape = () => {
  if (isPaused.value || isGameOver.value) return
  const shape = currentShape.value
  const size = shape.length
  const rotated = Array.from({ length: size }, () => Array(size).fill(0))

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      rotated[c][size - 1 - r] = shape[r][c]
    }
  }

  // Kick wall tests (simple left/right adjust if colliding after rotation)
  if (!checkCollision(currentX.value, currentY.value, rotated)) {
    currentShape.value = rotated
  } else if (!checkCollision(currentX.value - 1, currentY.value, rotated)) {
    currentX.value--
    currentShape.value = rotated
  } else if (!checkCollision(currentX.value + 1, currentY.value, rotated)) {
    currentX.value++
    currentShape.value = rotated
  }
  draw()
}

const dropHard = () => {
  if (isPaused.value || isGameOver.value) return
  while (!checkCollision(currentX.value, currentY.value + 1, currentShape.value)) {
    currentY.value++
  }
  mergeTetromino()
  clearLines()
  spawnTetromino()
  draw()
}

const handleKeydown = (e) => {
  if (isGameOver.value) return
  if (e.key === ' ' || e.code === 'Space') {
    togglePause()
    e.preventDefault()
    return
  }

  if (isPaused.value) return

  switch (e.key) {
    case 'ArrowLeft':
    case 'a':
    case 'A':
      moveLeft()
      e.preventDefault()
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      moveRight()
      e.preventDefault()
      break
    case 'ArrowUp':
    case 'w':
    case 'W':
      rotateShape()
      e.preventDefault()
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      moveDown()
      e.preventDefault()
      break
    case 'Enter':
      dropHard()
      e.preventDefault()
      break
  }
}

const togglePause = () => {
  if (isGameOver.value) return
  isPaused.value = !isPaused.value
  if (!isPaused.value) {
    gameInterval.value = setInterval(moveDown, 600)
  } else {
    if (gameInterval.value) clearInterval(gameInterval.value)
  }
}

const initGame = () => {
  grid.value = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  score.value = 0
  lines.value = 0
  isGameOver.value = false
  isPaused.value = true
  if (gameInterval.value) clearInterval(gameInterval.value)
  spawnTetromino()
  draw()
}

const endGame = () => {
  isGameOver.value = true
  isPaused.value = true
  if (gameInterval.value) clearInterval(gameInterval.value)
  draw()
}

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  
  // Clear canvas
  ctx.fillStyle = '#1e1e24'
  ctx.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE)

  // Draw grid helper (subtle lines)
  ctx.strokeStyle = '#2d2d35'
  ctx.lineWidth = 0.5
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath()
    ctx.moveTo(c * BLOCK_SIZE, 0)
    ctx.lineTo(c * BLOCK_SIZE, ROWS * BLOCK_SIZE)
    ctx.stroke()
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath()
    ctx.moveTo(0, r * BLOCK_SIZE)
    ctx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE)
    ctx.stroke()
  }

  // Draw board blocks
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const type = grid.value[r][c]
      if (type !== 0) {
        drawBlock(ctx, c, r, COLORS[type])
      }
    }
  }

  // Draw active tetromino
  const shape = currentShape.value
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const drawY = currentY.value + r
        if (drawY >= 0) {
          drawBlock(ctx, currentX.value + c, drawY, COLORS[currentType.value])
        }
      }
    }
  }
}

const drawBlock = (ctx, x, y, color) => {
  ctx.fillStyle = color
  ctx.shadowBlur = 4
  ctx.shadowColor = color
  ctx.beginPath()
  ctx.roundRect(
    x * BLOCK_SIZE + 1,
    y * BLOCK_SIZE + 1,
    BLOCK_SIZE - 2,
    BLOCK_SIZE - 2,
    3
  )
  ctx.fill()
  ctx.shadowBlur = 0 // reset
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
  <div class="tetris-container">
    <div class="game-header">
      <div class="score-board">
        <div class="score-item">
          <span class="label">SCORE</span>
          <span class="val">{{ score }}</span>
        </div>
        <div class="score-item">
          <span class="label">LINES</span>
          <span class="val">{{ lines }}</span>
        </div>
        <div class="score-item">
          <span class="label">BEST</span>
          <span class="val">{{ highScore }}</span>
        </div>
      </div>
      <div class="game-title">⚡ 俄罗斯方块 ⚡</div>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="COLS * BLOCK_SIZE" :height="ROWS * BLOCK_SIZE"></canvas>
      
      <!-- Overlay Screen -->
      <div v-if="isPaused || isGameOver" class="overlay">
        <div v-if="isGameOver" class="game-over-panel">
          <h2>GAME OVER</h2>
          <p>得分: {{ score }}</p>
          <button class="action-btn" @click="initGame">重新开始</button>
        </div>
        <div v-else-if="isPaused" class="pause-panel">
          <h2>PAUSED</h2>
          <p>按 [ 空格键 ] 开始</p>
          <button class="action-btn" @click="togglePause">开始游戏</button>
        </div>
      </div>
    </div>

    <div class="controls-helper">
      <p>操作: <b>W (旋转)</b>，<b>A / D (左右)</b>，<b>S (加速下落)</b>，<b>空格 (暂停)</b>，<b>回车 (直接落下)</b>。</p>
    </div>
  </div>
</template>

<style scoped>
.tetris-container {
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
  max-width: 250px;
  align-items: center;
  flex-direction: column;
  gap: 8px;
}

.score-board {
  display: flex;
  gap: 8px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 8px;
  min-width: 55px;
}

.score-item .label {
  font-size: 8px;
  color: #a0a0b0;
  font-weight: bold;
}

.score-item .val {
  font-size: 14px;
  font-weight: bold;
  color: #a000f0;
}

.game-title {
  font-size: 15px;
  font-weight: bold;
  background: linear-gradient(135deg, #00f0f0, #a000f0);
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
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.game-over-panel h2 {
  color: #ff4757;
}

.pause-panel h2 {
  color: #00f0f0;
}

.game-over-panel p, .pause-panel p {
  color: #a0a0b0;
  font-size: 13px;
  margin-bottom: 20px;
}

.action-btn {
  background: linear-gradient(135deg, #00f0f0, #a000f0);
  color: #fff;
  border: none;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(0, 240, 240, 0.3);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 240, 240, 0.5);
}

.controls-helper {
  font-size: 11px;
  color: #a0a0b0;
  text-align: center;
  max-width: 250px;
  line-height: 1.4;
}
</style>
