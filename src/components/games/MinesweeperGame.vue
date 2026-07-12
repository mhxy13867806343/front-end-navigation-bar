<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['close'])

const ROWS = 9
const COLS = 9
const MINES = 10

const board = ref([])
const isGameOver = ref(false)
const isWin = ref(false)
const minesLeft = ref(MINES)
const timer = ref(0)
const timerInterval = ref(null)
const isFirstClick = ref(true)

const initGame = () => {
  isGameOver.value = false
  isWin.value = false
  minesLeft.value = MINES
  timer.value = 0
  isFirstClick.value = true
  if (timerInterval.value) clearInterval(timerInterval.value)

  // Initialize board empty cells
  board.value = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      r,
      c,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0
    }))
  )
}

const startTimer = () => {
  timerInterval.value = setInterval(() => {
    timer.value++
  }, 1000)
}

const placeMines = (excludeRow, excludeCol) => {
  let minesPlaced = 0
  while (minesPlaced < MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    
    // Avoid putting mine on the first clicked cell or its immediate neighbors to guarantee a safe start
    const isExcluded = Math.abs(r - excludeRow) <= 1 && Math.abs(c - excludeCol) <= 1

    if (!board.value[r][c].isMine && !isExcluded) {
      board.value[r][c].isMine = true
      minesPlaced++
    }
  }

  // Calculate neighbor counts
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board.value[r][c].isMine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            if (board.value[nr][nc].isMine) count++
          }
        }
      }
      board.value[r][c].neighborMines = count
    }
  }
}

const revealCell = (r, c) => {
  if (isGameOver.value || isWin.value || board.value[r][c].isRevealed || board.value[r][c].isFlagged) return

  if (isFirstClick.value) {
    isFirstClick.value = false
    placeMines(r, c)
    startTimer()
  }

  const cell = board.value[r][c]
  cell.isRevealed = true

  if (cell.isMine) {
    endGame(false)
    return
  }

  if (cell.neighborMines === 0) {
    // Reveal neighbors recursively
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          revealCell(nr, nc)
        }
      }
    }
  }

  checkWin()
}

const flagCell = (event, r, c) => {
  event.preventDefault()
  if (isGameOver.value || isWin.value || board.value[r][c].isRevealed) return

  const cell = board.value[r][c]
  cell.isFlagged = !cell.isFlagged
  minesLeft.value += cell.isFlagged ? -1 : 1
  checkWin()
}

const endGame = (win) => {
  if (timerInterval.value) clearInterval(timerInterval.value)
  isGameOver.value = !win
  isWin.value = win

  // Reveal all mines
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board.value[r][c].isMine) {
        board.value[r][c].isRevealed = true
      }
    }
  }
}

const checkWin = () => {
  let allRevealedOrMines = true
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board.value[r][c]
      if (!cell.isMine && !cell.isRevealed) {
        allRevealedOrMines = false
        break
      }
    }
  }
  if (allRevealedOrMines) {
    endGame(true)
  }
}

onMounted(() => {
  initGame()
})
</script>

<template>
  <div class="minesweeper-container">
    <div class="game-header">
      <div class="header-item">
        <span class="emoji">💣</span>
        <span class="count">{{ minesLeft }}</span>
      </div>
      <button class="face-btn" @click="initGame">
        {{ isWin ? '😎' : isGameOver ? '😵' : '🙂' }}
      </button>
      <div class="header-item">
        <span class="emoji">⏱️</span>
        <span class="count">{{ timer }}</span>
      </div>
    </div>

    <div class="board-wrapper">
      <div class="mines-grid">
        <div v-for="(row, rIndex) in board" :key="rIndex" class="grid-row">
          <button v-for="(cell, cIndex) in row" 
               :key="cIndex" 
               class="grid-cell"
               :class="{ 
                 'revealed': cell.isRevealed, 
                 'mine': cell.isRevealed && cell.isMine,
                 'number': cell.isRevealed && !cell.isMine && cell.neighborMines > 0
               }"
               @click="revealCell(cell.r, cell.c)"
               @contextmenu="flagCell($event, cell.r, cell.c)">
            <!-- Display cell contents -->
            <template v-if="cell.isRevealed">
              <span v-if="cell.isMine">💥</span>
              <span v-else-if="cell.neighborMines > 0" :class="`num-${cell.neighborMines}`">
                {{ cell.neighborMines }}
              </span>
            </template>
            <template v-else>
              <span v-if="cell.isFlagged">🚩</span>
            </template>
          </button>
        </div>
      </div>
    </div>

    <div class="controls-helper">
      <p>操作说明: 鼠标<b>左键</b>翻开格子，<b>右键</b>插旗子标记雷。</p>
    </div>
  </div>
</template>

<style scoped>
.minesweeper-container {
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
  max-width: 280px;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 12px;
}

.header-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-item .emoji {
  font-size: 16px;
}

.header-item .count {
  font-size: 18px;
  font-weight: bold;
  color: #ff9f43;
  font-family: monospace;
}

.face-btn {
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: transform 0.1s;
}

.face-btn:active {
  transform: scale(0.9);
}

.board-wrapper {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.mines-grid {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px;
}

.grid-row {
  display: flex;
  gap: 3px;
}

.grid-cell {
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.15s;
}

.grid-cell:hover:not(.revealed) {
  background: rgba(255, 255, 255, 0.3);
}

.grid-cell.revealed {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.02);
  cursor: default;
}

.grid-cell.mine {
  background: #ff4757;
}

/* Number colors */
.num-1 { color: #00d2d3; }
.num-2 { color: #1dd1a1; }
.num-3 { color: #ff6b6b; }
.num-4 { color: #5f27cd; }
.num-5 { color: #ff9f43; }
.num-6 { color: #00a8ff; }
.num-7 { color: #e84118; }
.num-8 { color: #44bd32; }

.controls-helper {
  font-size: 11px;
  color: #a0a0b0;
  text-align: center;
  max-width: 280px;
  line-height: 1.4;
}
</style>
