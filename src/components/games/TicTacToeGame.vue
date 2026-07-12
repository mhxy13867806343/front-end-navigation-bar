<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['close'])

const board = ref(Array(9).fill(''))
const isXNext = ref(true)
const isGameOver = ref(false)
const winner = ref(null)
const winningLine = ref([])
const vsAI = ref(true)

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
]

const initGame = () => {
  board.value = Array(9).fill('')
  isXNext.value = true
  isGameOver.value = false
  winner.value = null
  winningLine.value = []
}

const checkWinner = () => {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo
    if (board.value[a] && board.value[a] === board.value[b] && board.value[a] === board.value[c]) {
      winner.value = board.value[a]
      winningLine.value = combo
      isGameOver.value = true
      return
    }
  }

  // Check draw
  if (board.value.every(cell => cell !== '')) {
    isGameOver.value = true
    winner.value = 'Draw'
  }
}

const makeMove = (index) => {
  if (board.value[index] !== '' || isGameOver.value) return

  board.value[index] = isXNext.value ? 'X' : 'O'
  checkWinner()

  if (!isGameOver.value) {
    isXNext.value = !isXNext.value
    
    // AI move
    if (vsAI.value && !isXNext.value) {
      setTimeout(makeAIMove, 400)
    }
  }
}

const makeAIMove = () => {
  if (isGameOver.value) return

  // 1. Minimax or simple strategy
  // Let's implement a simple smart strategy:
  // - Try to win
  // - Block opponent from winning
  // - Take center
  // - Take random remaining
  const bestMove = getBestMove()
  if (bestMove !== null) {
    board.value[bestMove] = 'O'
    checkWinner()
    if (!isGameOver.value) {
      isXNext.value = true
    }
  }
}

const getBestMove = () => {
  // Check if AI (O) can win in next move
  for (const combo of WINNING_COMBOS) {
    const counts = combo.map(i => board.value[i])
    const oCount = counts.filter(x => x === 'O').length
    const emptyCount = counts.filter(x => x === '').length
    if (oCount === 2 && emptyCount === 1) {
      return combo[counts.indexOf('')]
    }
  }

  // Check if player (X) can win in next move (Block them)
  for (const combo of WINNING_COMBOS) {
    const counts = combo.map(i => board.value[i])
    const xCount = counts.filter(x => x === 'X').length
    const emptyCount = counts.filter(x => x === '').length
    if (xCount === 2 && emptyCount === 1) {
      return combo[counts.indexOf('')]
    }
  }

  // Take center if empty
  if (board.value[4] === '') return 4

  // Take corners
  const corners = [0, 2, 6, 8].filter(i => board.value[i] === '')
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)]
  }

  // Take random
  const emptyCells = board.value.map((val, idx) => val === '' ? idx : null).filter(val => val !== null)
  if (emptyCells.length > 0) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)]
  }

  return null
}

onMounted(() => {
  initGame()
})
</script>

<template>
  <div class="ttt-container">
    <div class="game-header">
      <div class="mode-toggle">
        <button :class="{ 'active': vsAI }" @click="() => { vsAI = true; initGame(); }">🤖 人机对战</button>
        <button :class="{ 'active': !vsAI }" @click="() => { vsAI = false; initGame(); }">👥 双人同屏</button>
      </div>
      <div class="game-title">⚡ 井字棋 ⚡</div>
    </div>

    <div class="status-bar">
      <span v-if="!isGameOver">
        轮到玩家: <b :style="{ color: isXNext ? '#00d2d3' : '#ff9f43' }">{{ isXNext ? 'X' : 'O' }}</b>
      </span>
      <span v-else-if="winner === 'Draw'" class="draw-txt">平局 🤝</span>
      <span v-else class="win-txt">
        获胜者: <b :style="{ color: winner === 'X' ? '#00d2d3' : '#ff9f43' }">{{ winner }}</b> 🎉
      </span>
    </div>

    <div class="board-wrapper">
      <div class="ttt-grid">
        <button v-for="(cell, index) in board" 
                :key="index" 
                class="grid-cell"
                :class="{ 
                  'winning': winningLine.includes(index), 
                  'x-cell': cell === 'X', 
                  'o-cell': cell === 'O' 
                }"
                @click="makeMove(index)">
          {{ cell }}
        </button>
      </div>
    </div>

    <button class="reset-btn" @click="initGame">重新开始</button>
  </div>
</template>

<style scoped>
.ttt-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #fff;
  padding: 10px 0;
}

.game-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.mode-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 3px;
  gap: 4px;
}

.mode-toggle button {
  background: none;
  border: none;
  color: #a0a0b0;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-toggle button.active {
  background: var(--primary-color);
  color: #fff;
}

.game-title {
  font-size: 15px;
  font-weight: bold;
  background: linear-gradient(135deg, #00d2d3, #ff9f43);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-bar {
  font-size: 14px;
  font-weight: bold;
}

.board-wrapper {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  background: rgba(255, 255, 255, 0.02);
}

.ttt-grid {
  display: grid;
  grid-template-columns: repeat(3, 80px);
  grid-template-rows: repeat(3, 80px);
  gap: 6px;
  padding: 6px;
}

.grid-cell {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  font-size: 32px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
}

.grid-cell:hover:empty {
  background: rgba(255, 255, 255, 0.15);
}

.x-cell {
  color: #00d2d3;
  text-shadow: 0 0 6px rgba(0, 210, 211, 0.5);
}

.o-cell {
  color: #ff9f43;
  text-shadow: 0 0 6px rgba(255, 159, 67, 0.5);
}

.winning {
  background: var(--primary-color) !important;
  color: #fff !important;
  text-shadow: none !important;
  transform: scale(1.05);
}

.reset-btn {
  background: linear-gradient(135deg, #00d2d3, #ff9f43);
  color: #fff;
  border: none;
  padding: 8px 24px;
  font-size: 13px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 210, 211, 0.3);
}
</style>
