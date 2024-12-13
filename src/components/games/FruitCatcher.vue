<template>
  <div class="fruit-game" ref="gameContainer" @mousemove="handleMouseMove" @mousedown="startDrag" @mouseup="stopDrag" @mouseleave="stopDrag" tabindex="0" @keydown="handleKeyDown" @keyup="handleKeyUp">
    <div class="game-header">
      <div class="stars">
        <span v-for="i in maxStars" :key="i" :class="{ 'active': i <= stars }">⭐</span>
      </div>
      <div class="score">得分: {{ score }}</div>
    </div>

    <div class="game-area">
      <div v-for="fruit in fruits" :key="fruit.id" 
           class="fruit" 
           :class="{ 'caught': fruit.caught }"
           :style="{ left: fruit.x + 'px', top: fruit.y + 'px' }"
           :data-id="fruit.id">
        {{ getFruitEmoji(fruit.type) }}
      </div>
      
      <div class="basket" :style="{ left: basketX + 'px' }" ref="basket">🧺</div>

      <div class="game-controls" v-if="!isPlaying">
        <div class="difficulty-selector">
          <h3>选择难度</h3>
          <el-radio-group v-model="difficulty" class="difficulty-options">
            <el-radio-button label="beginner">初级</el-radio-button>
            <el-radio-button label="intermediate">中级</el-radio-button>
            <el-radio-button label="advanced">高级</el-radio-button>
            <el-radio-button label="master">王者</el-radio-button>
            <el-radio-button label="hell">地狱</el-radio-button>
            <el-radio-button label="heaven">天堂</el-radio-button>
          </el-radio-group>
        </div>
        <el-button type="primary" size="large" @click="startGame" class="start-button">开始游戏</el-button>
      </div>
    </div>

    <el-dialog
      v-model="showGameOver"
      title="游戏结束"
      width="300px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="game-over-content">
        <p>最终得分: {{ score }}</p>
        <p>难度: {{ getDifficultyName(difficulty) }}</p>
        <el-button type="primary" @click="restartGame">再玩一次</el-button>
        <el-button @click="$emit('close')">退出</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  onClose: Function
})

const emit = defineEmits(['close'])

// 游戏状态
const isPlaying = ref(false)
const score = ref(0)
const stars = ref(10) // 初始10颗星星
const maxStars = 16 // 最大16颗星星
const showGameOver = ref(false)
const gameContainer = ref(null)
const basketX = ref(0)
const fruits = ref([])
const nextFruitId = ref(0)
const animationFrameId = ref(null)
const lastFruitBatchTime = ref(0)
const isDragging = ref(false)
const keyState = ref({
  left: false,
  right: false
})
const moveSpeed = 8 // 键盘移动速度
const nextStarScore = ref(50) // 初始分数门槛为50
const isFirstStar = ref(true) // 标记是否是第一颗星星

// 难度设置
const difficulty = ref('beginner')
const difficultySettings = {
  beginner: { count: 1, speed: 1, baseScore: 10, scoreMultiplier: 1 },
  intermediate: { count: 2, speed: 2, baseScore: 50, scoreMultiplier: 10 },
  advanced: { count: 3, speed: 3, baseScore: 150, scoreMultiplier: 30 },
  master: { count: 4, speed: 5, baseScore: 300, scoreMultiplier: 70 },
  hell: { count: 5, speed: 7, baseScore: 600, scoreMultiplier: 90 },
  heaven: { count: () => Math.floor(Math.random() * 2) + 6, speed: 10, baseScore: 1000, scoreMultiplier: 100 } // 随机6-7个
}

const getDifficultyName = (diff) => {
  const names = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
    master: '王者',
    hell: '地狱',
    heaven: '天堂'
  }
  return names[diff] || diff
}

// 水果配置 - 基础分数
const fruitTypes = {
  apple: { score: 10, emoji: '🍎' },
  banana: { score: 8, emoji: '🍌' },
  watermelon: { score: 6, emoji: '🍉' },
  orange: { score: 4, emoji: '🍊' },
  pineapple: { score: 2, emoji: '🍍' },
  bomb: { score: 0, emoji: '💣' }
}

// 获取水果表情
const getFruitEmoji = (type) => fruitTypes[type].emoji

// 获取当前难度下水果的实际分数
const getFruitScore = (fruitType) => {
  if (fruitType === 'bomb') return 0
  const setting = difficultySettings[difficulty.value]
  const baseScore = fruitTypes[fruitType].score
  // 根据难度调整分数
  return Math.floor(baseScore * setting.scoreMultiplier)
}

// 移动篮子
const moveBasket = (e) => {
  if (!isPlaying.value) return
  const rect = gameContainer.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const maxX = rect.width - 70 // 篮子宽度
  
  // 使用 transform 代替直接改变 left 值，提高性能
  basketX.value = Math.max(0, Math.min(x, maxX))
}

const startDrag = () => {
  isDragging.value = true
}

const stopDrag = () => {
  isDragging.value = false
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return
  if (!isPlaying.value) return
  
  const rect = gameContainer.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const maxX = rect.width - 70 // 篮子宽度
  
  basketX.value = Math.max(0, Math.min(x, maxX))
}

const handleKeyDown = (e) => {
  if (!isPlaying.value) return
  
  if (e.key === 'ArrowLeft') {
    keyState.value.left = true
  } else if (e.key === 'ArrowRight') {
    keyState.value.right = true
  }
}

const handleKeyUp = (e) => {
  if (e.key === 'ArrowLeft') {
    keyState.value.left = false
  } else if (e.key === 'ArrowRight') {
    keyState.value.right = false
  }
}

const updateBasketPosition = () => {
  if (!isPlaying.value) return
  
  const maxX = gameContainer.value.clientWidth - 70 // 篮子宽度
  
  if (keyState.value.left) {
    basketX.value = Math.max(0, basketX.value - moveSpeed)
  }
  if (keyState.value.right) {
    basketX.value = Math.min(maxX, basketX.value + moveSpeed)
  }
  
  if (keyState.value.left || keyState.value.right) {
    requestAnimationFrame(updateBasketPosition)
  }
}

// 监听键盘状态变化
watch(keyState.value, (newState) => {
  if (newState.left || newState.right) {
    updateBasketPosition()
  }
}, { deep: true })

// 创建新水果
const createFruitBatch = () => {
  const containerWidth = gameContainer.value.clientWidth
  const setting = difficultySettings[difficulty.value]
  const batchSize = typeof setting.count === 'function' ? setting.count() : setting.count
  const baseSpeed = typeof setting.speed === 'function' ? setting.speed() : setting.speed
  
  // 初级难度下，每次只生成一个水果或炸弹
  if (difficulty.value === 'beginner') {
    if (fruits.value.length > 0) return // 如果还有水果，不生成新的
    
    const x = Math.random() * (containerWidth - 40)
    // 20%的概率生成炸弹
    const type = Math.random() < 0.2 ? 'bomb' : Object.keys(fruitTypes)[Math.floor(Math.random() * (Object.keys(fruitTypes).length - 1))]
    
    fruits.value.push({
      id: nextFruitId.value++,
      x,
      y: -30,
      speed: baseSpeed,
      type,
      caught: false
    })
    return
  }
  
  // 中级及以上难度
  // 检查当前水果数量是否已达到该难度的最大数量
  const maxFruits = typeof setting.count === 'function' ? 7 : setting.count // 天堂模式最多7个
  if (fruits.value.length >= maxFruits) return
  
  // 计算需要生成的水果数量
  const numToGenerate = Math.min(batchSize, maxFruits - fruits.value.length)
  
  // 生成水果
  for (let i = 0; i < numToGenerate; i++) {
    const x = Math.random() * (containerWidth - 40)
    const type = Math.random() < 0.2 ? 'bomb' : Object.keys(fruitTypes)[Math.floor(Math.random() * (Object.keys(fruitTypes).length - 1))]
    
    fruits.value.push({
      id: nextFruitId.value++,
      x,
      y: -30,
      speed: baseSpeed,
      type,
      caught: false
    })
  }
}

// 计算下一个得分门槛
const calculateNextStarScore = () => {
  const setting = difficultySettings[difficulty.value]
  if (isFirstStar.value) {
    isFirstStar.value = false
    return 50 // 第一次固定为50
  }
  // 根据当前级别计算: baseScore + n + (n*2)
  const n = nextStarScore.value
  return setting.baseScore + n + (n * 2)
}

// 更新游戏状态
const updateGame = (timestamp) => {
  if (!isPlaying.value) return
  
  // 创建新一批水果
  const interval = difficulty.value === 'beginner' ? 2000 : 1500
  if (timestamp - lastFruitBatchTime.value > interval) {
    createFruitBatch()
    lastFruitBatchTime.value = timestamp
  }

  // 更新水果位置
  for (let i = fruits.value.length - 1; i >= 0; i--) {
    const fruit = fruits.value[i]
    
    if (fruit.caught) {
      continue
    }
    
    // 更新水果位置
    fruit.y += fruit.speed
    
    // 检查是否接住水果
    const basket = gameContainer.value.querySelector('.basket')
    const basketRect = basket.getBoundingClientRect()
    const gameRect = gameContainer.value.getBoundingClientRect()
    
    // 水果相对于游戏容器的位置
    const fruitRect = {
      left: fruit.x,
      right: fruit.x + 40,
      top: fruit.y,
      bottom: fruit.y + 40
    }
    
    // 检查碰撞
    if (!fruit.caught && 
        fruitRect.bottom >= (basketRect.top - gameRect.top) && 
        fruitRect.right >= basketRect.left - gameRect.left && 
        fruitRect.left <= basketRect.right - gameRect.left) {
      
      // 标记为已接住
      fruit.caught = true
      
      if (fruit.type === 'bomb') {
        // 炸弹只减星星
        if (stars.value > 0) {
          stars.value--
          if (stars.value === 0) {
            gameOver()
          }
        }
      } else {
        // 水果加分
        const fruitScore = getFruitScore(fruit.type)
        score.value += fruitScore
        console.log(`接住${fruit.type}，得分：${fruitScore}，总分：${score.value}`)
        
        // 检查是否达到增加星星的条件
        if (score.value >= nextStarScore.value) {
          if (stars.value < maxStars) {
            stars.value++
            console.log(`达到${nextStarScore.value}分，增加一颗星星，现在${stars.value}颗星`)
          }
          nextStarScore.value = calculateNextStarScore()
        }
      }
      
      // 延迟移除已接住的水果
      setTimeout(() => {
        const idx = fruits.value.findIndex(f => f.id === fruit.id)
        if (idx !== -1) {
          fruits.value.splice(idx, 1)
        }
      }, 300)
    }
    
    // 检查是否错过水果
    if (fruit.y > gameContainer.value.clientHeight && !fruit.caught) {
      if (fruit.type !== 'bomb') {
        // 错过水果才减星星
        if (stars.value > 0) {
          stars.value--
          console.log(`错过${fruit.type}，减少一颗星星，现在${stars.value}颗星`)
          if (stars.value === 0) {
            gameOver()
          }
        }
      }
      // 移除错过的水果
      fruits.value.splice(i, 1)
    }
  }

  animationFrameId.value = requestAnimationFrame(updateGame)
}

// 处理失误
const handleMiss = () => {
  if (stars.value > 0) {
    stars.value--
  }
  if (stars.value === 0) {
    gameOver()
  }
}

// 开始游戏
const startGame = () => {
  isPlaying.value = true
  score.value = 0
  stars.value = 10
  fruits.value = []
  nextStarScore.value = 50
  isFirstStar.value = true // 重置第一颗星星标记
  lastFruitBatchTime.value = 0
  createFruitBatch()
  requestAnimationFrame(updateGame)
}

// 暂停游戏
const pauseGame = () => {
  isPlaying.value = false
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
}

// 结束游戏
const endGame = () => {
  gameOver()
}

// 游戏结束
const gameOver = () => {
  isPlaying.value = false
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  showGameOver.value = true
}

// 重新开始游戏
const restartGame = () => {
  score.value = 0
  stars.value = 10
  fruits.value = []
  showGameOver.value = false
  startGame()
}

// 组件卸载时清理
onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})

onMounted(() => {
  gameContainer.value.focus() // 使容器获得焦点以接收键盘事件
})
</script>

<style scoped>
.fruit-game {
  width: 100%;
  height: 500px;
  background-color: #f0f2f5;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.game-header {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.stars {
  display: flex;
  gap: 5px;
}

.stars span {
  opacity: 0.3;
}

.stars span.active {
  opacity: 1;
}

.game-area {
  height: calc(100% - 60px);
  position: relative;
}

.fruit {
  position: absolute;
  width: 40px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  font-size: 32px;
  transition: transform 0.2s, opacity 0.2s;
  will-change: transform, top, left;
}

.fruit.caught {
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease-out;
}

.basket {
  position: absolute;
  bottom: 20px;
  width: 70px;
  height: 70px;
  text-align: center;
  line-height: 70px;
  font-size: 45px;
  transition: left 0.1s linear;
  will-change: left;
}

.game-controls {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.difficulty-selector {
  margin-bottom: 20px;
  text-align: center;
}

.difficulty-selector h3 {
  margin-bottom: 15px;
  color: #333;
}

.difficulty-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.start-button {
  font-size: 18px;
  padding: 12px 30px;
}
</style>
