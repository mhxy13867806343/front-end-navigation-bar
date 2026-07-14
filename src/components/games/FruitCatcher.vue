<template>
  <div class="game-container" ref="gameContainer" @mousemove="moveBasket" @keydown="handleKeyPress" tabindex="0">
    <div class="game-header">
      <div class="stars">
        <span v-for="i in maxStars" :key="i" :class="{ 'active': i <= stars }">⭐</span>
      </div>
      <div class="info">
        <div class="score">得分: {{ score }}</div>
        <div :class="['difficulty', difficulty]" @click="cycleDifficulty">
          难度: {{ 
            difficulty === 'beginner' ? '初级' : 
            difficulty === 'intermediate' ? '中级' : 
            difficulty === 'advanced' ? '高级' : 
            difficulty === 'expert' ? '专家' : '未知'
          }}
        </div>
        <el-button 
          type="primary" 
          @click="togglePause" 
          :icon="isPaused ? 'el-icon-video-play' : 'el-icon-video-pause'" 
          size="small"
          :disabled="!isPlaying">
          {{ isPaused ? '继续' : '暂停' }}
          <span class="shortcut-hint">[空格]</span>
        </el-button>
        <div class="bomb-count" v-if="bombHits > 0">炸弹: {{ bombHits }}/3</div>
        <div class="speed-control">
          <el-input-number 
            v-model="customSpeedMultiplier" 
            :min="0.5" 
            :max="3" 
            :step="0.1"
            size="small"
            @change="onSpeedChange"
            :disabled="isPlaying"
          />
          <el-select 
            v-model="speedPreset" 
            size="small" 
            placeholder="预设速度"
            @change="onPresetChange"
            :disabled="isPlaying"
          >
            <el-option label="自动" value="auto" />
            <el-option label="0.5x" value="0.5" />
            <el-option label="1.0x" value="1.0" />
            <el-option label="1.5x" value="1.5" />
            <el-option label="2.0x" value="2.0" />
            <el-option label="2.5x" value="2.5" />
            <el-option label="3.0x" value="3.0" />
          </el-select>
          <el-button size="small" type="primary" @click="showSettings = true" :disabled="isPlaying">
            游戏设置
          </el-button>
        </div>
      </div>
    </div>

    <div class="game-area" ref="gameArea">
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

    <div v-if="isPaused" class="pause-overlay">
      <h2>游戏暂停</h2>
      <el-button type="primary" @click="togglePause">继续游戏</el-button>
    </div>

    <el-dialog
      v-model="showSettings"
      title="游戏设置"
      :close-on-click-modal="!isPlaying"
      :close-on-press-escape="!isPlaying"
      :show-close="!isPlaying"
    >
      <el-form :model="tempSettings" label-width="100px">
        <el-form-item label="难度">
          <el-select 
            v-model="tempSettings.difficulty" 
            :disabled="isPlaying"
          >
            <el-option label="初级" value="beginner" />
            <el-option label="中级" value="intermediate" />
            <el-option label="高级" value="advanced" />
            <el-option label="专家" value="expert" />
          </el-select>
        </el-form-item>
        <el-form-item label="最大水果数">
          <el-input-number 
            v-model="tempSettings.maxFruits" 
            :min="1" 
            :max="5"
            :disabled="isPlaying"
          />
        </el-form-item>
        <el-form-item label="最大炸弹数">
          <el-input-number 
            v-model="tempSettings.maxBombs" 
            :min="0" 
            :max="3"
            :disabled="isPlaying"
          />
        </el-form-item>
        <el-form-item label="水果大小">
          <el-input-number 
            v-model="tempSettings.fruitSize" 
            :min="15" 
            :max="30"
            :disabled="isPlaying"
          />
        </el-form-item>
        <el-form-item label="炸弹大小">
          <el-input-number 
            v-model="tempSettings.bombSize" 
            :min="15" 
            :max="30"
            :disabled="isPlaying"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSettings = false" :disabled="isPlaying">取消</el-button>
          <el-button type="primary" @click="handleApplySettings" :disabled="isPlaying">
            应用设置
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'
type SpeedPreset = 'auto' | 'custom' | '0.5' | '1.0' | '1.5' | '2.0' | '2.5' | '3.0'
type FruitPattern = 'normal' | 'tornado'

interface GameSettings {
  difficulty: Difficulty
  maxFruits: number
  maxBombs: number
  fruitSize: number
  bombSize: number
}

interface DifficultySetting {
  maxFruits: number
  pattern: FruitPattern
}

interface FruitItem {
  id: number
  x: number
  y: number
  speed: number
  isBomb: boolean
  caught: boolean
  exploding: boolean
  amplitude: number
  angle: number
}

interface CollisionRect {
  left: number
  right: number
  top: number
  bottom: number
}

// 游戏基础设置
const gameSettings = ref<GameSettings>({
  difficulty: 'beginner',
  maxFruits: 2,
  maxBombs: 1,
  fruitSize: 20,
  bombSize: 20
})

// 临时设置（用于设置对话框）
const tempSettings = ref<GameSettings>({...gameSettings.value})

// 显示设置对话框
const showSettings = ref<boolean>(false)

// 监听设置对话框的打开
watch(() => showSettings.value, (newVal: boolean): void => {
  if (newVal) {
    // 当对话框打开时，复制当前设置到临时设置
    tempSettings.value = { ...gameSettings.value }
  }
})

// 处理设置应用
const handleApplySettings = (): void => {
  // 将临时设置应用到游戏设置
  gameSettings.value = { ...tempSettings.value }
  // 关闭设置对话框
  showSettings.value = false
  // 应用新设置
  applySettings()
  // 如果游戏正在进行，需要重置一些状态
  if (isPlaying.value) {
    // 更新难度
    difficulty.value = gameSettings.value.difficulty
    // 更新样式
    document.documentElement.style.setProperty('--fruit-size', `${gameSettings.value.fruitSize}px`)
    document.documentElement.style.setProperty('--bomb-size', `${gameSettings.value.bombSize}px`)
  }
}

// 应用设置
const applySettings = (): void => {
  // 更新游戏难度
  difficulty.value = gameSettings.value.difficulty
  // 更新样式变量
  document.documentElement.style.setProperty('--fruit-size', `${gameSettings.value.fruitSize}px`)
  document.documentElement.style.setProperty('--bomb-size', `${gameSettings.value.bombSize}px`)
}

// 游戏状态
const score = ref<number>(0)
const stars = ref<number>(3)
const maxStars: number = 5
const fruits = ref<FruitItem[]>([])
const isPlaying = ref<boolean>(false)
const difficulty = ref<Difficulty>('beginner')
const gameContainer = ref<HTMLDivElement | null>(null)
const lastFruitBatchTime = ref<number>(0)
const basketPosition = ref<number>(300)
const bombHits = ref<number>(0)
const gameOver = ref<boolean>(false)

// 速度控制
const customSpeedMultiplier = ref<number>(0.5)
const speedPreset = ref<SpeedPreset>('auto')
const isAutoSpeed = ref<boolean>(true)

// 暂停状态
const isPaused = ref<boolean>(false)
const lastTimestamp = ref<number>(0)
const pausedFruits = ref<FruitItem[]>([])

// 难度设置
const difficultySettings: Record<Difficulty, DifficultySetting> = {
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
const createFruitBatch = (): void => {
  const containerWidth: number = gameContainer.value?.clientWidth || 0
  const maxFruits: number = gameSettings.value.maxFruits
  const maxBombs: number = gameSettings.value.maxBombs
  
  // 计算当前场上的炸弹数量
  const currentBombs: number = fruits.value.filter((f: FruitItem): boolean => f.isBomb).length
  
  // 根据最大水果数量创建水果
  const count: number = Math.min(maxFruits, difficultySettings[difficulty.value].maxFruits)
  
  for (let i = 0; i < count; i++) {
    // 只有当当前炸弹数量小于最大炸弹数量时，才有机会生成炸弹
    const canCreateBomb: boolean = currentBombs < maxBombs
    const isBomb: boolean = canCreateBomb && Math.random() < 0.2 // 20% 概率生成炸弹
    
    const x: number = Math.random() * Math.max(0, containerWidth - 30)
    const y: number = -30
    const baseSpeed: number = 3 // 增加基础速度
    const speed: number = baseSpeed * (0.8 + Math.random() * 0.4) // 随机速度变化
    const amplitude: number = Math.random() * 20 + 30
    const angle: number = Math.random() * Math.PI * 2

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
const getSpeedMultiplier = (currentScore: number): number => {
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
const onPresetChange = (value: SpeedPreset): void => {
  if (value === 'auto') {
    isAutoSpeed.value = true
  } else {
    isAutoSpeed.value = false
    customSpeedMultiplier.value = parseFloat(value)
  }
}

// 处理自定义速度变化
const onSpeedChange = (value: number | undefined): void => {
  if (speedPreset.value !== 'custom') {
    speedPreset.value = 'custom'
  }
  isAutoSpeed.value = false
}

// 检查游戏结束条件
const checkGameOver = (): void => {
  if (stars.value <= 0 || bombHits.value >= 3) {
    gameOver.value = true
    isPlaying.value = false
  }
}

// 处理键盘事件
const handleKeyPress = (event: KeyboardEvent): void => {
  if (event.code === 'Space' && isPlaying.value) {
    event.preventDefault()
    togglePause()
  }
}

// 暂停/继续游戏
const togglePause = (): void => {
  isPaused.value = !isPaused.value
  
  if (!isPaused.value) {
    // 继续游戏时，恢复动画循环
    lastTimestamp.value = performance.now()
    requestAnimationFrame(updateGame)
  }
}

// 更新游戏状态
const updateGame = (timestamp: number): void => {
  if (!isPlaying.value || !gameContainer.value) return
  
  // 如果游戏暂停，不更新游戏状态
  if (isPaused.value) {
    return
  }

  const deltaTime: number = timestamp - lastTimestamp.value
  lastTimestamp.value = timestamp
  
  const speedMultiplier: number = getSpeedMultiplier(score.value)
  const interval: number = 2000 / speedMultiplier
  
  if (timestamp - lastFruitBatchTime.value > interval) {
    createFruitBatch()
    lastFruitBatchTime.value = timestamp
  }

  // 获取容器和篮子的尺寸
  const containerWidth: number = gameContainer.value.clientWidth
  const containerHeight: number = gameContainer.value.clientHeight
  const basketWidth: number = 80 // 增加篮子的碰撞宽度
  const basketHeight: number = 50 // 篮子高度

  // 篮子的碰撞区域
  const basketRect: CollisionRect = {
    left: basketPosition.value,
    right: basketPosition.value + basketWidth,
    top: containerHeight - basketHeight - 10,
    bottom: containerHeight - 10
  }

  // 更新所有水果
  fruits.value.forEach((fruit: FruitItem): void => {
    if (fruit.caught || fruit.exploding) return

    // 更新位置
    fruit.y += fruit.speed * speedMultiplier

    // 龙卷风效果
    if (difficultySettings[difficulty.value].pattern === 'tornado') {
      fruit.angle += 0.03 * speedMultiplier
      fruit.x += Math.sin(fruit.angle) * (fruit.amplitude / 15)
      fruit.x = Math.max(0, Math.min(containerWidth - 30, fruit.x))
    }

    // 水果的碰撞区域
    const fruitSize: number = 30
    const fruitRect: CollisionRect = {
      left: fruit.x,
      right: fruit.x + fruitSize,
      top: fruit.y,
      bottom: fruit.y + fruitSize
    }

    // 改进的碰撞检测
    const isColliding: boolean = !(
      fruitRect.right < basketRect.left ||
      fruitRect.left > basketRect.right ||
      fruitRect.bottom < basketRect.top ||
      fruitRect.top > basketRect.bottom
    )

    // 如果发生碰撞且水果还没有被捕获
    if (isColliding && !fruit.caught) {
      fruit.caught = true // 标记为已捕获

      if (fruit.isBomb) {
        fruit.exploding = true
        stars.value = Math.max(0, stars.value - 1)
        bombHits.value++
        
        setTimeout(() => {
          fruits.value = fruits.value.filter((f: FruitItem): boolean => f !== fruit)
          checkGameOver()
        }, 500)
      } else {
        // 接住普通水果
        score.value += 10
        
        // 每200分奖励一颗星
        if (score.value > 0 && score.value % 200 === 0) {
          stars.value = Math.min(maxStars, stars.value + 1)
        }
        
        // 移除已捕获的水果
        setTimeout(() => {
          fruits.value = fruits.value.filter((f: FruitItem): boolean => f !== fruit)
        }, 200)
      }
      return // 碰撞后直接返回，避免重复处理
    }

    // 检查是否落地
    if (fruit.y > containerHeight && !fruit.caught) {
      if (!fruit.isBomb) {
        stars.value = Math.max(0, stars.value - 1)
        checkGameOver()
      }
      fruits.value = fruits.value.filter((f: FruitItem): boolean => f !== fruit)
    }
  })

  if (isPlaying.value && !isPaused.value) {
    requestAnimationFrame(updateGame)
  }
}

// 监听游戏设置变化
watch(() => gameSettings.value, (newSettings: GameSettings): void => {
  // 更新水果和炸弹的样式
  document.documentElement.style.setProperty('--fruit-size', `${newSettings.fruitSize}px`)
  document.documentElement.style.setProperty('--bomb-size', `${newSettings.bombSize}px`)
}, { deep: true })

// 监听设置对话框打开
watch(() => showSettings.value, (show: boolean): void => {
  if (show) {
    tempSettings.value = { ...gameSettings.value }
  }
})

// 移动篮子
const moveBasket = (event: MouseEvent): void => {
  if (!isPlaying.value || isPaused.value) return
  
  const rect: DOMRect | undefined = gameContainer.value?.getBoundingClientRect()
  if (!rect) return
  const x: number = event.clientX - rect.left
  const basketWidth: number = 80 // 篮子宽度
  
  requestAnimationFrame(() => {
    basketPosition.value = Math.max(0, Math.min(rect.width - basketWidth, x - basketWidth / 2))
  })
}

// 开始游戏
const startGame = (): void => {
  if (isPlaying.value) return
  
  resetGame()
  isPlaying.value = true
  score.value = 0
  stars.value = 3
  bombHits.value = 0
  fruits.value = []
  isPaused.value = false
  lastTimestamp.value = performance.now()
  lastFruitBatchTime.value = performance.now()
  
  requestAnimationFrame(updateGame)
  
  // 添加键盘事件监听
  gameContainer.value?.focus()
}

// 重置游戏
const resetGame = (): void => {
  score.value = 0
  stars.value = 3
  fruits.value = []
  isPlaying.value = false
  lastFruitBatchTime.value = 0
  basketPosition.value = (gameContainer.value?.clientWidth || 0) / 2 - 50
  bombHits.value = 0
  gameOver.value = false
  
  // 重置难度相关设置
  difficulty.value = gameSettings.value.difficulty
}

// 切换难度
const cycleDifficulty = (): void => {
  if (!isPlaying.value) {
    const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex: number = difficulties.indexOf(difficulty.value);
    const nextIndex: number = (currentIndex + 1) % difficulties.length;
    difficulty.value = difficulties[nextIndex];
  }
};

// 组件挂载和卸载
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
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

.difficulty {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.difficulty:hover {
  opacity: 0.8;
}

.difficulty.beginner {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.difficulty.intermediate {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.difficulty.advanced {
  background-color: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffa39e;
}

.difficulty.expert {
  background-color: #722ed1;
  color: #ffffff;
  border: 1px solid #9254de;
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
  transition: left 0.1s ease;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.basket:active {
  transform: translateX(-50%) scale(1.1);
}

.game-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
}

.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 99;
}

.pause-overlay h2 {
  color: white;
  font-size: 32px;
  margin-bottom: 20px;
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

/* 确保游戏容器可以接收键盘事件 */
.game-container {
  outline: none;
  position: relative;
}
</style>
