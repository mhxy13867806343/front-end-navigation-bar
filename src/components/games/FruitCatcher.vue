<template>
  <div class="game-container" ref="gameContainer" @mousemove="moveBasket">
    <div class="game-header">
      <div class="stars">
        <span v-for="i in maxStars" :key="i" :class="{ 'active': i <= stars }">⭐</span>
      </div>
      <div class="info">
        <div class="score">得分: {{ score }}</div>
        <div class="bomb-count" v-if="bombHits > 0">炸弹: {{ bombHits }}/3</div>
        <div class="speed-control">
          <el-input-number 
            v-model="customSpeedMultiplier" 
            :min="0.5" 
            :max="3" 
            :step="0.1"
            size="small"
            @change="onSpeedChange"
          />
          <el-select 
            v-model="speedPreset" 
            size="small" 
            placeholder="预设速度"
            @change="onPresetChange"
          >
            <el-option label="自动" value="auto" />
            <el-option label="0.5x" value="0.5" />
            <el-option label="1.0x" value="1.0" />
            <el-option label="1.5x" value="1.5" />
            <el-option label="2.0x" value="2.0" />
            <el-option label="2.5x" value="2.5" />
            <el-option label="3.0x" value="3.0" />
          </el-select>
          <el-button size="small" type="primary" @click="showSettings = true">
            游戏设置
          </el-button>
        </div>
      </div>
    </div>

    <div class="game-area">
      <div v-for="fruit in fruits" :key="fruit.id" 
           class="game-item"
           :class="{ 
             'fruit': !fruit.isBomb, 
             'bomb': fruit.isBomb,
             'caught': fruit.caught,
             'exploding': fruit.exploding 
           }"
           :style="{ 
             left: fruit.x + 'px', 
             top: fruit.y + 'px',
           }"
      >
        {{ fruit.isBomb ? '💣' : '🍎' }}
        <div v-if="fruit.exploding" class="explosion">💥</div>
      </div>
      
      <div class="basket" :style="{ left: basketPosition + 'px' }">🧺</div>

      <div class="game-controls" v-if="!isPlaying">
        <div class="game-over" v-if="gameOver">
          <h2>游戏结束</h2>
          <p>最终得分: {{ score }}</p>
          <p v-if="stars <= 0">失去所有星星!</p>
          <p v-if="bombHits >= 3">炸弹击中过多!</p>
        </div>
        <button class="start-button" @click="startGame">
          {{ gameOver ? '重新开始' : '开始游戏' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// 游戏基础设置
const gameSettings = ref({
  difficulty: 'beginner',
  maxFruits: 2,
  maxBombs: 1,
  fruitSize: 20,
  bombSize: 20
})

// 临时设置（用于设置对话框）
const tempSettings = ref({
  difficulty: 'beginner',
  maxFruits: 2,
  maxBombs: 1,
  fruitSize: 20,
  bombSize: 20
})

// 游戏状态
const score = ref(0)
const stars = ref(3)
const maxStars = 5
const fruits = ref([])
const isPlaying = ref(false)
const difficulty = ref('beginner')
const gameContainer = ref(null)
const lastFruitBatchTime = ref(0)
const basketPosition = ref(300)
const bombHits = ref(0)
const gameOver = ref(false)

// 速度控制
const customSpeedMultiplier = ref(0.5)
const speedPreset = ref('auto')
const isAutoSpeed = ref(true)
const showSettings = ref(false)

// 难度设置
const difficultySettings = {
  beginner: {
    maxFruits: 1,
    pattern: 'normal'
  },
  intermediate: {
    maxFruits: 2,
    pattern: 'normal'
  },
  advanced: {
    maxFruits: 2,
    pattern: 'tornado'
  },
  expert: {
    maxFruits: 2,
    pattern: 'tornado'
  }
}

// 创建新水果
const createFruitBatch = () => {
  const containerWidth = gameContainer.value.clientWidth
  const maxFruits = gameSettings.value.maxFruits
  const maxBombs = gameSettings.value.maxBombs
  
  // 计算当前场上的炸弹数量
  const currentBombs = fruits.value.filter(f => f.isBomb).length
  
  // 根据最大水果数量创建水果
  const count = Math.min(maxFruits, difficultySettings[difficulty.value].maxFruits)
  
  for (let i = 0; i < count; i++) {
    // 只有当当前炸弹数量小于最大炸弹数量时，才有机会生成炸弹
    const canCreateBomb = currentBombs < maxBombs
    const isBomb = canCreateBomb && Math.random() < 0.2 // 20% 概率生成炸弹
    
    const x = Math.random() * (containerWidth - 30)
    const y = -30
    const baseSpeed = 3 // 增加基础速度
    const speed = baseSpeed * (0.8 + Math.random() * 0.4) // 随机速度变化
    const amplitude = Math.random() * 20 + 30
    const angle = Math.random() * Math.PI * 2

    fruits.value.push({
      id: Date.now() + i,
      x,
      y,
      speed,
      isBomb,
      caught: false,
      exploding: false,
      amplitude,
      angle
    })
  }
}

// 根据分数获取速度倍率
const getSpeedMultiplier = (currentScore) => {
  if (!isAutoSpeed.value) {
    return customSpeedMultiplier.value
  }
  
  // 自动模式下的速度逻辑
  if (currentScore >= 20000) return 2.0
  if (currentScore >= 10000) return 1.8
  if (currentScore >= 5000) return 1.4
  if (currentScore >= 3000) return 1.5
  if (currentScore >= 1000) return 1.2
  if (currentScore >= 500) return 1.0
  return 0.5
}

// 处理速度预设变化
const onPresetChange = (value) => {
  if (value === 'auto') {
    isAutoSpeed.value = true
  } else {
    isAutoSpeed.value = false
    customSpeedMultiplier.value = parseFloat(value)
  }
}

// 处理自定义速度变化
const onSpeedChange = (value) => {
  if (speedPreset.value !== 'custom') {
    speedPreset.value = 'custom'
  }
  isAutoSpeed.value = false
}

// 应用设置
const applySettings = () => {
  // 如果难度发生变化，重置游戏
  const difficultyChanged = tempSettings.value.difficulty !== gameSettings.value.difficulty
  
  // 更新游戏设置
  gameSettings.value = { ...tempSettings.value }
  
  // 如果难度改变，重置游戏状态
  if (difficultyChanged) {
    resetGame()
  }
  
  showSettings.value = false
}

// 重置游戏
const resetGame = () => {
  score.value = 0
  stars.value = 3
  fruits.value = []
  isPlaying.value = false
  lastFruitBatchTime.value = 0
  basketPosition.value = gameContainer.value.clientWidth / 2 - 50
  bombHits.value = 0
  gameOver.value = false
  
  // 重置难度相关设置
  difficulty.value = gameSettings.value.difficulty
}

// 检查游戏结束条件
const checkGameOver = () => {
  if (stars.value <= 0 || bombHits.value >= 3) {
    gameOver.value = true
    isPlaying.value = false
  }
}

// 更新游戏状态
const updateGame = (timestamp) => {
  if (!isPlaying.value) return
  
  // 获取当前速度倍率
  const speedMultiplier = getSpeedMultiplier(score.value)
  
  // 创建新一批水果
  const interval = 2000 / speedMultiplier
  if (timestamp - lastFruitBatchTime.value > interval) {
    createFruitBatch()
    lastFruitBatchTime.value = timestamp
  }

  const basketRect = {
    left: basketPosition.value,
    right: basketPosition.value + 100,
    top: gameContainer.value.clientHeight - 60,
    bottom: gameContainer.value.clientHeight - 10
  }

  // 更新水果位置
  for (let i = fruits.value.length - 1; i >= 0; i--) {
    const fruit = fruits.value[i]
    
    if (fruit.caught || fruit.exploding) continue
    
    // 更新水果位置，应用速度倍率
    fruit.y += fruit.speed * speedMultiplier
    
    // 龙卷风效果
    if (difficultySettings[difficulty.value].pattern === 'tornado') {
      fruit.angle += 0.03 * speedMultiplier
      fruit.x += Math.sin(fruit.angle) * (fruit.amplitude / 15)
    }
    
    // 检查碰撞
    const fruitRect = {
      left: fruit.x,
      right: fruit.x + 30,
      top: fruit.y,
      bottom: fruit.y + 30
    }
    
    // 检查是否与篮子碰撞
    if (fruitRect.bottom >= basketRect.top &&
        fruitRect.top <= basketRect.bottom &&
        fruitRect.right >= basketRect.left &&
        fruitRect.left <= basketRect.right) {
      
      if (fruit.isBomb) {
        // 炸弹效果
        fruit.caught = true
        fruit.exploding = true
        stars.value = Math.max(0, stars.value - 1)
        bombHits.value++
        
        setTimeout(() => {
          fruits.value = fruits.value.filter(f => f.id !== fruit.id)
          checkGameOver()
        }, 500)
      } else {
        // 接住水果
        fruit.caught = true
        score.value += 10
        if (score.value > 0 && score.value % 200 === 0) {
          stars.value = Math.min(maxStars, stars.value + 1)
        }
        setTimeout(() => {
          fruits.value = fruits.value.filter(f => f.id !== fruit.id)
        }, 200)
      }
    }
    
    // 检查是否落地
    if (fruit.y > gameContainer.value.clientHeight) {
      if (!fruit.isBomb) {
        stars.value = Math.max(0, stars.value - 1)
        setTimeout(() => {
          checkGameOver()
        }, 0)
      }
      fruits.value = fruits.value.filter(f => f.id !== fruit.id)
    }
  }

  if (isPlaying.value) {
    requestAnimationFrame(updateGame)
  }
}

// 监听游戏设置变化
watch(() => gameSettings.value, (newSettings) => {
  // 更新水果和炸弹的样式
  document.documentElement.style.setProperty('--fruit-size', `${newSettings.fruitSize}px`)
  document.documentElement.style.setProperty('--bomb-size', `${newSettings.bombSize}px`)
}, { deep: true })

// 监听设置对话框打开
watch(() => showSettings.value, (show) => {
  if (show) {
    tempSettings.value = { ...gameSettings.value }
  }
})

// 移动篮子
const moveBasket = (event) => {
  if (!isPlaying.value) return
  
  const rect = gameContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const basketWidth = 100
  
  // 使用 requestAnimationFrame 优化性能
  requestAnimationFrame(() => {
    basketPosition.value = Math.max(0, Math.min(rect.width - basketWidth, x - basketWidth / 2))
  })
}

// 开始游戏
const startGame = () => {
  if (isPlaying.value) return
  
  resetGame()
  isPlaying.value = true
  lastFruitBatchTime.value = performance.now()
  requestAnimationFrame(updateGame)
}

// 组件挂载和卸载
onMounted(() => {
  gameContainer.value.focus()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 处理键盘事件
const handleKeyDown = (event) => {
  if (!isPlaying.value) return
  
  const step = 20
  switch(event.key) {
    case 'ArrowLeft':
      basketPosition.value = Math.max(0, basketPosition.value - step)
      break
    case 'ArrowRight':
      basketPosition.value = Math.min(
        gameContainer.value.clientWidth - 100,
        basketPosition.value + step
      )
      break
  }
}

// 处理设置应用
const handleApplySettings = () => {
  applySettings()
  showSettings.value = false
  // 如果游戏正在进行，暂停游戏
  if (isPlaying.value) {
    isPlaying.value = false
  }
}
</script>

<style scoped>
.game-container {
  position: relative;
  width: 100%;
  height: 600px;
  background: #f0f2f5;
  overflow: hidden;
  user-select: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.game-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.stars {
  display: flex;
  gap: 8px;
}

.stars span {
  opacity: 0.3;
  transition: opacity 0.3s ease;
  transform: scale(1);
}

.stars span.active {
  opacity: 1;
  animation: starPulse 0.3s ease;
}

.info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.score {
  font-size: 28px;
  font-weight: bold;
  color: #1890ff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.speed-control {
  display: flex;
  gap: 12px;
  align-items: center;
}

.game-area {
  position: relative;
  height: calc(100% - 70px);
  background: linear-gradient(to bottom, #e6f7ff, #f0f2f5);
}

.game-item {
  position: absolute;
  font-size: var(--fruit-size, 20px);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.game-item.caught {
  transform: scale(0);
  opacity: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.game-item.exploding {
  transform: scale(1.5);
  opacity: 0.8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.explosion {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40px;
  animation: explode 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}

.basket {
  position: absolute;
  bottom: 20px;
  font-size: 40px;
  transform: translateX(-50%);
  cursor: move;
  transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.basket:active {
  transform: translateX(-50%) scale(1.1);
}

.game-controls {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1000;
}

.start-button {
  padding: 12px 36px;
  font-size: 24px;
  font-weight: bold;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.start-button:hover {
  background: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
}

.start-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.game-over {
  margin-bottom: 20px;
}

.game-over h2 {
  font-size: 36px;
  font-weight: bold;
  color: #1890ff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.game-over p {
  font-size: 18px;
  color: #666;
}

@keyframes explode {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

@keyframes starPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
