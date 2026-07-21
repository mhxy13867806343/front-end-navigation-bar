<script setup lang="ts">

type TetrisGrid = number[][]

const emit = defineEmits<{
  close: []
}>()

const COLS = 10
const ROWS = 20
const BLOCK_SIZE = 20

const canvasRef = ref<HTMLCanvasElement | null>(null)
const score = ref<number>(0)
const lines = ref<number>(0)
const highScore = ref<number>(parseInt(localStorage.getItem('tetris_high_score') || '0') || 0)
const isGameOver = ref<boolean>(false)
const isPaused = ref<boolean>(true)
const gameInterval = ref<ReturnType<typeof setInterval> | null>(null)

// Tetromino colors
const COLORS: string[] = [
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
const SHAPES: TetrisGrid[] = [
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
const createEmptyGrid = (): TetrisGrid => Array.from({ length: ROWS }, (): number[] => Array<number>(COLS).fill(0))

const grid = ref<TetrisGrid>(createEmptyGrid())

// Current falling tetromino state
const currentType = ref<number>(0)
const currentShape = ref<TetrisGrid>([])
const currentX = ref<number>(3)
const currentY = ref<number>(-2)

const spawnTetromino = (): void => {
  const type: number = Math.floor(Math.random() * 7) + 1
  currentType.value = type
  currentShape.value = SHAPES[type].map((row: number[]): number[] => [...row])
  currentX.value = Math.floor((COLS - currentShape.value[0].length) / 2)
  currentY.value = 0

  // Check collision right away -> game over
  if (checkCollision(currentX.value, currentY.value, currentShape.value)) {
    endGame()
  }
}

const checkCollision = (ax: number, ay: number, shape: TetrisGrid): boolean => {
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

const mergeTetromino = (): void => {
  const shape: TetrisGrid = currentShape.value
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

const clearLines = (): void => {
  let cleared: number = 0
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid.value[r].every((val: number): boolean => val !== 0)) {
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

const moveDown = (): void => {
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

const moveLeft = (): void => {
  if (isPaused.value || isGameOver.value) return
  if (!checkCollision(currentX.value - 1, currentY.value, currentShape.value)) {
    currentX.value--
    draw()
  }
}

const moveRight = (): void => {
  if (isPaused.value || isGameOver.value) return
  if (!checkCollision(currentX.value + 1, currentY.value, currentShape.value)) {
    currentX.value++
    draw()
  }
}

const rotateShape = (): void => {
  if (isPaused.value || isGameOver.value) return
  const shape: TetrisGrid = currentShape.value
  const size: number = shape.length
  const rotated: TetrisGrid = Array.from({ length: size }, (): number[] => Array<number>(size).fill(0))

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

const dropHard = (): void => {
  if (isPaused.value || isGameOver.value) return
  while (!checkCollision(currentX.value, currentY.value + 1, currentShape.value)) {
    currentY.value++
  }
  mergeTetromino()
  clearLines()
  spawnTetromino()
  draw()
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

const togglePause = (): void => {
  if (isGameOver.value) return
  isPaused.value = !isPaused.value
  if (!isPaused.value) {
    gameInterval.value = setInterval(moveDown, 600)
  } else {
    if (gameInterval.value) clearInterval(gameInterval.value)
  }
}

const initGame = (): void => {
  grid.value = createEmptyGrid()
  score.value = 0
  lines.value = 0
  isGameOver.value = false
  isPaused.value = true
  if (gameInterval.value) clearInterval(gameInterval.value)
  spawnTetromino()
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

const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void => {
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

<style scoped lang="scss" src="./css/TetrisGame.scss"></style>
