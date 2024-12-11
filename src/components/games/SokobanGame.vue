<!-- 推箱子游戏组件 -->
<template>
  <div class="sokoban-game">
    <div class="game-header">
      <h2>推箱子游戏</h2>
      <div class="game-info">
        <span>当前关卡: {{ currentLevel + 1 }}</span>
        <span>移动步数: {{ moves }}</span>
      </div>
      <div class="game-controls">
        <button @click="restartLevel">重新开始</button>
        <button @click="undoMove" :disabled="!canUndo">撤销</button>
      </div>
    </div>
    
    <div class="game-container" 
         tabindex="0" 
         @keydown.prevent="handleKeyDown"
         ref="gameContainer">
      <div class="game-grid" :style="gridStyle">
        <div v-for="(row, rowIndex) in currentMap" 
             :key="rowIndex" 
             class="game-row">
          <div v-for="(cell, colIndex) in row" 
               :key="colIndex" 
               class="game-cell"
               :class="getCellClass(cell)">
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLevelComplete" class="level-complete">
      <h3>恭喜通关！</h3>
      <button @click="nextLevel" v-if="currentLevel < levels.length - 1">下一关</button>
      <button @click="restartGame" v-else>重新开始游戏</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// 游戏元素定义
const WALL = '#'
const FLOOR = '.'
const BOX = '$'
const TARGET = '*'
const PLAYER = '@'
const BOX_ON_TARGET = '+'
const PLAYER_ON_TARGET = '&'

// 游戏关卡
const levels = [
  [
    "########",
    "#      #",
    "# $@$  #",
    "#  $   #",
    "# ***  #",
    "#      #",
    "########"
  ],
  [
    "########",
    "#   *  #",
    "# $@$  #",
    "#  $   #",
    "# ***  #",
    "#      #",
    "########"
  ]
]

const currentLevel = ref(0)
const currentMap = ref([])
const playerPos = ref({ x: 0, y: 0 })
const moves = ref(0)
const isLevelComplete = ref(false)
const moveHistory = ref([])
const canUndo = computed(() => moveHistory.value.length > 0)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${currentMap.value[0]?.length || 0}, 40px)`
}))

// 初始化当前关卡
const initLevel = () => {
  currentMap.value = levels[currentLevel.value].map(row => row.split(''))
  moves.value = 0
  isLevelComplete.value = false
  moveHistory.value = []
  
  // 找到玩家位置
  for (let y = 0; y < currentMap.value.length; y++) {
    for (let x = 0; x < currentMap.value[y].length; x++) {
      if (currentMap.value[y][x] === PLAYER || currentMap.value[y][x] === PLAYER_ON_TARGET) {
        playerPos.value = { x, y }
        break
      }
    }
  }
}

// 检查是否完成关卡
const checkComplete = () => {
  for (let y = 0; y < currentMap.value.length; y++) {
    for (let x = 0; x < currentMap.value[y].length; x++) {
      if (currentMap.value[y][x] === BOX) {
        return false
      }
    }
  }
  isLevelComplete.value = true
}

// 移动玩家
const movePlayer = (dx, dy) => {
  const newX = playerPos.value.x + dx
  const newY = playerPos.value.y + dy
  const boxX = newX + dx
  const boxY = newY + dy

  // 检查是否可以移动
  if (currentMap.value[newY][newX] === WALL) return

  // 保存移动前的状态
  const mapState = currentMap.value.map(row => [...row])
  const playerState = { ...playerPos.value }

  let canMove = true
  
  if (currentMap.value[newY][newX] === BOX || currentMap.value[newY][newX] === BOX_ON_TARGET) {
    // 推箱子
    if (currentMap.value[boxY][boxX] === WALL || 
        currentMap.value[boxY][boxX] === BOX || 
        currentMap.value[boxY][boxX] === BOX_ON_TARGET) {
      canMove = false
    } else {
      // 移动箱子
      if (currentMap.value[boxY][boxX] === TARGET) {
        currentMap.value[boxY][boxX] = BOX_ON_TARGET
      } else {
        currentMap.value[boxY][boxX] = BOX
      }
      
      // 清除原箱子位置
      if (currentMap.value[newY][newX] === BOX_ON_TARGET) {
        currentMap.value[newY][newX] = TARGET
      } else {
        currentMap.value[newY][newX] = FLOOR
      }
    }
  }

  if (canMove) {
    // 移动玩家
    if (currentMap.value[playerPos.value.y][playerPos.value.x] === PLAYER_ON_TARGET) {
      currentMap.value[playerPos.value.y][playerPos.value.x] = TARGET
    } else {
      currentMap.value[playerPos.value.y][playerPos.value.x] = FLOOR
    }

    if (currentMap.value[newY][newX] === TARGET) {
      currentMap.value[newY][newX] = PLAYER_ON_TARGET
    } else {
      currentMap.value[newY][newX] = PLAYER
    }

    playerPos.value = { x: newX, y: newY }
    moves.value++

    // 保存移动历史
    moveHistory.value.push({
      map: mapState,
      player: playerState
    })

    checkComplete()
  }
}

// 处理键盘事件
const handleKeyDown = (e) => {
  if (isLevelComplete.value) return

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      movePlayer(0, -1)
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      movePlayer(0, 1)
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
      movePlayer(-1, 0)
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      movePlayer(1, 0)
      break
  }
}

// 获取单元格的样式类
const getCellClass = (cell) => {
  switch (cell) {
    case WALL: return 'wall'
    case BOX: return 'box'
    case TARGET: return 'target'
    case PLAYER: return 'player'
    case BOX_ON_TARGET: return 'box-on-target'
    case PLAYER_ON_TARGET: return 'player-on-target'
    default: return 'floor'
  }
}

// 重新开始当前关卡
const restartLevel = () => {
  initLevel()
}

// 撤销移动
const undoMove = () => {
  if (!canUndo.value) return
  
  const lastState = moveHistory.value.pop()
  currentMap.value = lastState.map
  playerPos.value = lastState.player
  moves.value--
  isLevelComplete.value = false
}

// 下一关
const nextLevel = () => {
  if (currentLevel.value < levels.length - 1) {
    currentLevel.value++
    initLevel()
  }
}

// 重新开始游戏
const restartGame = () => {
  currentLevel.value = 0
  initLevel()
}

// 监听键盘焦点
const gameContainer = ref(null)
onMounted(() => {
  initLevel()
  gameContainer.value?.focus()
})

watch(isLevelComplete, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      gameContainer.value?.blur()
    }, 100)
  }
})
</script>

<style scoped>
.sokoban-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.game-header {
  text-align: center;
  margin-bottom: 20px;
}

.game-info {
  margin: 10px 0;
  display: flex;
  gap: 20px;
}

.game-controls {
  margin: 10px 0;
  display: flex;
  gap: 10px;
}

.game-controls button {
  padding: 5px 15px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
}

.game-controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.game-container {
  outline: none;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.game-grid {
  display: grid;
  gap: 1px;
  background: #ddd;
  padding: 1px;
  border-radius: 4px;
}

.game-cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.wall {
  background: #666;
}

.floor {
  background: white;
}

.box {
  background: #8B4513;
  border: 2px solid #654321;
}

.target {
  background: #90EE90;
}

.player {
  background: #4169E1;
  border-radius: 50%;
}

.box-on-target {
  background: #32CD32;
  border: 2px solid #228B22;
}

.player-on-target {
  background: #4169E1;
  border-radius: 50%;
  border: 2px solid #32CD32;
}

.level-complete {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.level-complete button {
  margin-top: 10px;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
}
</style>
