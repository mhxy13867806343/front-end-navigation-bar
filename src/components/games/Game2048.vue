<script setup lang="ts">

type Board2048 = number[][]
type MoveDirection = 0 | 1 | 2 | 3

interface EmptyCell {
  r: number
  c: number
}

const emit = defineEmits<{
  close: []
}>()

const createEmptyBoard = (): Board2048 => [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
]

const board = ref<Board2048>(createEmptyBoard())

const score = ref<number>(0)
const highScore = ref<number>(parseInt(localStorage.getItem('2048_high_score') || '0') || 0)
const isGameOver = ref<boolean>(false)

const addRandomTile = (): void => {
  const emptyCells: EmptyCell[] = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board.value[r][c] === 0) {
        emptyCells.push({ r, c })
      }
    }
  }
  
  if (emptyCells.length > 0) {
    const { r, c }: EmptyCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    board.value[r][c] = Math.random() < 0.9 ? 2 : 4
  }
}

const initGame = (): void => {
  board.value = createEmptyBoard()
  score.value = 0
  isGameOver.value = false
  addRandomTile()
  addRandomTile()
}

const getTileBg = (val: number): string => {
  const mapping: Record<number, string> = {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e'
  }
  return mapping[val] || '#3c3a32'
}

const getTileColor = (val: number): string => {
  return val <= 4 ? '#776e65' : '#f9f6f2'
}

// Slide row left
const slideLeft = (row: number[]): number[] => {
  let arr: number[] = row.filter((val: number): boolean => val !== 0)
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2
      score.value += arr[i]
      arr[i + 1] = 0
    }
  }
  arr = arr.filter((val: number): boolean => val !== 0)
  while (arr.length < 4) {
    arr.push(0)
  }
  return arr
}

const rotateBoard = (): void => {
  // Transpose and reverse rows -> 90 deg clockwise
  const n: number = 4
  const temp: Board2048 = Array.from({ length: 4 }, (): number[] => Array<number>(4).fill(0))
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      temp[c][n - 1 - r] = board.value[r][c]
    }
  }
  board.value = temp
}

const moveLeft = (): boolean => {
  let moved: boolean = false
  for (let r = 0; r < 4; r++) {
    const original: number[] = [...board.value[r]]
    const next: number[] = slideLeft(board.value[r])
    if (JSON.stringify(original) !== JSON.stringify(next)) {
      moved = true
    }
    board.value[r] = next
  }
  return moved
}

const move = (dir: MoveDirection): void => {
  if (isGameOver.value) return
  let moved: boolean = false

  // 0: Left, 1: Up, 2: Right, 3: Down
  if (dir === 0) {
    moved = moveLeft()
  } else if (dir === 1) { // Up
    rotateBoard(); rotateBoard(); rotateBoard() // 270 deg clockwise
    moved = moveLeft()
    rotateBoard() // 90 deg clockwise to restore
  } else if (dir === 2) { // Right
    rotateBoard(); rotateBoard() // 180 deg
    moved = moveLeft()
    rotateBoard(); rotateBoard() // restore
  } else if (dir === 3) { // Down
    rotateBoard() // 90 deg clockwise
    moved = moveLeft()
    rotateBoard(); rotateBoard(); rotateBoard() // restore
  }

  if (moved) {
    addRandomTile()
    checkGameOver()
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem('2048_high_score', highScore.value.toString())
    }
  }
}

const checkGameOver = (): void => {
  // Any empty cell?
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board.value[r][c] === 0) return
    }
  }

  // Any adjacent merges possible?
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (r < 3 && board.value[r][c] === board.value[r + 1][c]) return
      if (c < 3 && board.value[r][c] === board.value[r][c + 1]) return
    }
  }

  isGameOver.value = true
}

const handleKeydown = (e: KeyboardEvent): void => {
  switch (e.key) {
    case 'ArrowLeft':
    case 'a':
    case 'A':
      move(0)
      e.preventDefault()
      break
    case 'ArrowUp':
    case 'w':
    case 'W':
      move(1)
      e.preventDefault()
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      move(2)
      e.preventDefault()
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      move(3)
      e.preventDefault()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  initGame()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="g2048-container">
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
      <div class="game-title">⚡ 2048 经典合并 ⚡</div>
    </div>

    <div class="board-wrapper">
      <div class="grid-container">
        <div v-for="(row, rIndex) in board" :key="rIndex" class="grid-row">
          <div v-for="(val, cIndex) in row" 
               :key="cIndex" 
               class="grid-cell"
               :style="{ background: val > 0 ? getTileBg(val) : 'rgba(238, 228, 218, 0.35)', color: getTileColor(val) }">
            <span v-if="val > 0" class="tile-number" :class="`tile-${val}`">{{ val }}</span>
          </div>
        </div>
      </div>

      <!-- Game Over overlay -->
      <div v-if="isGameOver" class="overlay">
        <div class="game-over-panel">
          <h2>GAME OVER</h2>
          <p>您获得了 {{ score }} 分</p>
          <button class="action-btn" @click="initGame">重新开始</button>
        </div>
      </div>
    </div>

    <div class="controls-helper">
      <p>操作说明: 键盘上的 <b>W / A / S / D</b> 或 <b>方向键</b> 移动滑块并完成合并。</p>
    </div>
  </div>
</template>

<style scoped src="./css/Game2048.css"></style>
