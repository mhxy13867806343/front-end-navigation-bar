<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { readHighScore, rectsOverlap } from './gameUtils.js'

const CANVAS_SIZE = 400
const TOTAL_ENEMIES = 12
const MAX_ACTIVE_ENEMIES = 4
const PLAYER_SHOT_COOLDOWN = 220
const HIGH_SCORE_KEY = 'battlecity_high_score'
const TANK_SIZE = 24

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
}

const canvasRef = ref(null)
const score = ref(0)
const highScore = ref(readHighScore(HIGH_SCORE_KEY))
const lives = ref(3)
const remainingEnemies = ref(TOTAL_ENEMIES)
const isPaused = ref(true)
const isGameOver = ref(false)
const isWin = ref(false)

let player = createPlayer()
let base = createBase()
let bricks = []
let bullets = []
let enemies = []
let pressedKeys = new Set()
let spawnedEnemies = 0
let defeatedEnemies = 0
let nextEnemyId = 1
let terminalResult = null
let gameTime = 0
let lastSpawnAt = 0
let lastPlayerShotAt = -PLAYER_SHOT_COOLDOWN
let lastFrameAt = null
let animationFrameId = null

function createPlayer() {
  return { x: 188, y: 316, width: TANK_SIZE, height: TANK_SIZE, direction: 'up', speed: 126 }
}

function createBase() {
  return { x: 184, y: 364, width: 32, height: 28, alive: true }
}

function createBricks() {
  const blocks = [
    [48, 72], [64, 72], [80, 72], [144, 72], [160, 72], [224, 72], [240, 72], [304, 72], [320, 72], [336, 72],
    [48, 88], [144, 88], [240, 88], [336, 88],
    [96, 144], [112, 144], [128, 144], [192, 144], [208, 144], [272, 144], [288, 144],
    [32, 208], [48, 208], [112, 208], [128, 208], [144, 208], [240, 208], [256, 208], [272, 208], [336, 208], [352, 208],
    [32, 224], [144, 224], [240, 224], [352, 224],
    [80, 280], [96, 280], [144, 280], [240, 280], [288, 280], [304, 280],
    [160, 344], [160, 360], [160, 376], [224, 344], [224, 360], [224, 376], [176, 344], [208, 344]
  ]
  return blocks.map(([x, y], index) => ({ id: index + 1, x, y, width: 16, height: 16 }))
}

function resetGame() {
  player = createPlayer()
  base = createBase()
  bricks = createBricks()
  bullets = []
  enemies = []
  pressedKeys = new Set()
  spawnedEnemies = 0
  defeatedEnemies = 0
  nextEnemyId = 1
  terminalResult = null
  gameTime = 0
  lastSpawnAt = -850
  lastPlayerShotAt = -PLAYER_SHOT_COOLDOWN
  lastFrameAt = null
  score.value = 0
  lives.value = 3
  remainingEnemies.value = TOTAL_ENEMIES
  isPaused.value = true
  isGameOver.value = false
  isWin.value = false
  draw()
}

function togglePause() {
  if (isGameOver.value || isWin.value) return
  isPaused.value = !isPaused.value
  lastFrameAt = null
}

function finishGame(won = false) {
  if (terminalResult !== null) return false
  terminalResult = won ? 'win' : 'loss'
  isWin.value = won
  isGameOver.value = !won
  isPaused.value = true
  pressedKeys.clear()
  saveHighScore()
  return true
}

function saveHighScore() {
  if (score.value <= highScore.value) return
  highScore.value = score.value
  try {
    globalThis.localStorage?.setItem(HIGH_SCORE_KEY, String(highScore.value))
  } catch {
    // Storage may be disabled; the in-memory score still remains visible.
  }
}

function getTankRect(tank, x = tank.x, y = tank.y) {
  return { x, y, width: tank.width, height: tank.height }
}

function canOccupy(tank, x, y, includeEnemies = false) {
  const next = getTankRect(tank, x, y)
  if (next.x < 0 || next.y < 0 || next.x + next.width > CANVAS_SIZE || next.y + next.height > CANVAS_SIZE) return false
  if (bricks.some(brick => rectsOverlap(next, brick))) return false
  if (base.alive && rectsOverlap(next, base)) return false
  if (includeEnemies && enemies.some(enemy => enemy !== tank && rectsOverlap(next, enemy))) return false
  return true
}

function movePlayer(deltaSeconds) {
  const directionName = ['up', 'down', 'left', 'right'].find(direction => pressedKeys.has(direction))
  if (!directionName) return
  const direction = DIRECTIONS[directionName]
  player.direction = directionName
  const distance = player.speed * deltaSeconds
  const nextX = player.x + direction.x * distance
  const nextY = player.y + direction.y * distance
  if (canOccupy(player, nextX, nextY, true)) {
    player = { ...player, x: nextX, y: nextY }
  }
}

function bulletOrigin(tank) {
  const direction = DIRECTIONS[tank.direction]
  return {
    x: tank.x + tank.width / 2 - 3 + direction.x * (tank.width / 2 + 1),
    y: tank.y + tank.height / 2 - 3 + direction.y * (tank.height / 2 + 1)
  }
}

function shootPlayer(now) {
  if (isPaused.value || isGameOver.value || isWin.value || now - lastPlayerShotAt < PLAYER_SHOT_COOLDOWN) return
  const origin = bulletOrigin(player)
  const direction = DIRECTIONS[player.direction]
  bullets = [...bullets, {
    x: origin.x, y: origin.y, width: 6, height: 6,
    vx: direction.x * 255, vy: direction.y * 255, owner: 'player'
  }]
  lastPlayerShotAt = now
}

function chooseAimDirection(enemy) {
  const target = enemy.id % 2 === 0 && base.alive ? base : player
  const dx = target.x + target.width / 2 - (enemy.x + enemy.width / 2)
  const dy = target.y + target.height / 2 - (enemy.y + enemy.height / 2)
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right'
  return dy < 0 ? 'up' : 'down'
}

function shootEnemy(enemy, now) {
  const directionName = chooseAimDirection(enemy)
  const direction = DIRECTIONS[directionName]
  const origin = bulletOrigin({ ...enemy, direction: directionName })
  bullets = [...bullets, {
    x: origin.x, y: origin.y, width: 6, height: 6,
    vx: direction.x * 168, vy: direction.y * 168, owner: 'enemy'
  }]
  enemy.lastShotAt = now
  enemy.nextShotDelay = 1050 + (enemy.id % 4) * 210
}

function spawnEnemy(now) {
  if (spawnedEnemies >= TOTAL_ENEMIES || enemies.length >= MAX_ACTIVE_ENEMIES || now - lastSpawnAt < 850) return
  const spawnXs = [24, 116, 208, 352]
  const id = nextEnemyId++
  const enemy = {
    id,
    x: spawnXs[(id - 1) % spawnXs.length], y: 34,
    width: TANK_SIZE, height: TANK_SIZE, direction: 'down', speed: 62 + (id % 3) * 7,
    lastDirectionAt: now, nextTurnDelay: 620 + (id % 5) * 150,
    lastShotAt: now, nextShotDelay: 780 + (id % 4) * 220
  }
  if (!canOccupy(enemy, enemy.x, enemy.y, true)) return
  enemies = [...enemies, enemy]
  spawnedEnemies += 1
  lastSpawnAt = now
}

function turnEnemy(enemy, now, forced = false) {
  const order = ['down', 'left', 'right', 'up']
  const current = order.indexOf(enemy.direction)
  enemy.direction = order[(current + enemy.id + (forced ? 1 : 0)) % order.length]
  enemy.lastDirectionAt = now
  enemy.nextTurnDelay = 580 + ((enemy.id + spawnedEnemies) % 5) * 170
}

function updateEnemies(deltaSeconds, now) {
  for (const enemy of enemies) {
    if (now - enemy.lastDirectionAt >= enemy.nextTurnDelay) turnEnemy(enemy, now)
    const direction = DIRECTIONS[enemy.direction]
    const distance = enemy.speed * deltaSeconds
    const nextX = enemy.x + direction.x * distance
    const nextY = enemy.y + direction.y * distance
    if (canOccupy(enemy, nextX, nextY, true) && !rectsOverlap(getTankRect(enemy, nextX, nextY), player)) {
      enemy.x = nextX
      enemy.y = nextY
    } else {
      turnEnemy(enemy, now, true)
    }
    if (now - enemy.lastShotAt >= enemy.nextShotDelay) shootEnemy(enemy, now)
  }
}

function updateBullets(deltaSeconds) {
  bullets = bullets.map(bullet => ({
    ...bullet,
    x: bullet.x + bullet.vx * deltaSeconds,
    y: bullet.y + bullet.vy * deltaSeconds
  }))

  const removedBullets = new Set()
  const removedBricks = new Set()
  const removedEnemies = new Set()
  let playerHit = false

  bullets.forEach((bullet, bulletIndex) => {
    if (terminalResult !== null) return
    if (bullet.x + bullet.width < 0 || bullet.y + bullet.height < 0 || bullet.x > CANVAS_SIZE || bullet.y > CANVAS_SIZE) {
      removedBullets.add(bulletIndex)
      return
    }

    const brick = bricks.find(item => !removedBricks.has(item.id) && rectsOverlap(bullet, item))
    if (brick) {
      removedBricks.add(brick.id)
      removedBullets.add(bulletIndex)
      return
    }

    if (bullet.owner === 'player') {
      const enemy = enemies.find(item => !removedEnemies.has(item.id) && rectsOverlap(bullet, item))
      if (enemy) {
        removedEnemies.add(enemy.id)
        removedBullets.add(bulletIndex)
      }
      return
    }

    if (base.alive && rectsOverlap(bullet, base)) {
      base = { ...base, alive: false }
      removedBullets.add(bulletIndex)
      finishGame(false)
      return
    }

    if (rectsOverlap(bullet, player)) {
      removedBullets.add(bulletIndex)
      if (!playerHit) {
        playerHit = true
        lives.value -= 1
        if (lives.value <= 0) {
          finishGame(false)
        } else {
          player = createPlayer()
        }
      }
    }
  })

  bullets = bullets.filter((_, index) => !removedBullets.has(index))
  bricks = bricks.filter(brick => !removedBricks.has(brick.id))
  if (removedEnemies.size && terminalResult === null) {
    enemies = enemies.filter(enemy => !removedEnemies.has(enemy.id))
    defeatedEnemies += removedEnemies.size
    score.value += removedEnemies.size * 100
    remainingEnemies.value = Math.max(0, TOTAL_ENEMIES - defeatedEnemies)
    saveHighScore()
    if (defeatedEnemies >= TOTAL_ENEMIES) finishGame(true)
  }
}

function update(deltaSeconds, now) {
  movePlayer(deltaSeconds)
  if (pressedKeys.has('fire')) shootPlayer(now)
  spawnEnemy(now)
  updateEnemies(deltaSeconds, now)
  updateBullets(deltaSeconds)
}

function gameLoop(now) {
  if (lastFrameAt === null) lastFrameAt = now
  const deltaSeconds = Math.min((now - lastFrameAt) / 1000, 0.032)
  lastFrameAt = now
  if (!isPaused.value && terminalResult === null) {
    gameTime += deltaSeconds * 1000
    update(deltaSeconds, gameTime)
  }
  draw()
  animationFrameId = requestAnimationFrame(gameLoop)
}

function drawTank(ctx, tank, color, accent) {
  const { x, y, width, height, direction } = tank
  ctx.fillStyle = '#171717'
  if (direction === 'up' || direction === 'down') {
    ctx.fillRect(x, y, 5, height)
    ctx.fillRect(x + width - 5, y, 5, height)
  } else {
    ctx.fillRect(x, y, width, 5)
    ctx.fillRect(x, y + height - 5, width, 5)
  }
  ctx.fillStyle = color
  ctx.fillRect(x + 5, y + 5, width - 10, height - 10)
  ctx.fillStyle = accent
  ctx.fillRect(x + 8, y + 8, width - 16, height - 16)
  ctx.fillStyle = color
  const directionVector = DIRECTIONS[direction]
  const centerX = x + width / 2
  const centerY = y + height / 2
  if (directionVector.x) ctx.fillRect(directionVector.x < 0 ? x - 4 : centerX, centerY - 2, width / 2 + 4, 4)
  else ctx.fillRect(centerX - 2, directionVector.y < 0 ? y - 4 : centerY, 4, height / 2 + 4)
}

function drawBrick(ctx, brick) {
  ctx.fillStyle = '#a94728'
  ctx.fillRect(brick.x, brick.y, brick.width, brick.height)
  ctx.fillStyle = '#e17a45'
  ctx.fillRect(brick.x + 1, brick.y + 1, brick.width - 2, 3)
  ctx.strokeStyle = '#572416'
  ctx.lineWidth = 1
  ctx.strokeRect(brick.x + 0.5, brick.y + 0.5, brick.width - 1, brick.height - 1)
  ctx.beginPath()
  ctx.moveTo(brick.x, brick.y + 8)
  ctx.lineTo(brick.x + brick.width, brick.y + 8)
  ctx.moveTo(brick.x + 8, brick.y)
  ctx.lineTo(brick.x + 8, brick.y + 8)
  ctx.moveTo(brick.x + 4, brick.y + 8)
  ctx.lineTo(brick.x + 4, brick.y + 16)
  ctx.stroke()
}

function drawBase(ctx) {
  ctx.fillStyle = base.alive ? '#d8c47c' : '#5d5143'
  ctx.fillRect(base.x, base.y, base.width, base.height)
  ctx.fillStyle = base.alive ? '#f3e6ad' : '#1f1f1f'
  ctx.beginPath()
  ctx.moveTo(base.x + 16, base.y + 5)
  ctx.lineTo(base.x + 24, base.y + 21)
  ctx.lineTo(base.x + 16, base.y + 17)
  ctx.lineTo(base.x + 8, base.y + 21)
  ctx.closePath()
  ctx.fill()
}

function drawOverlay(ctx) {
  if (!isPaused.value && !isGameOver.value && !isWin.value) return
  ctx.fillStyle = 'rgba(0, 0, 0, 0.62)'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  ctx.textAlign = 'center'
  ctx.fillStyle = isWin.value ? '#ffe66d' : isGameOver.value ? '#ff6b6b' : '#f7d354'
  ctx.font = 'bold 30px monospace'
  ctx.fillText(isWin.value ? 'MISSION CLEAR' : isGameOver.value ? 'GAME OVER' : '90 TANK', 200, 185)
  ctx.fillStyle = '#ffffff'
  ctx.font = '14px monospace'
  ctx.fillText(isWin.value || isGameOver.value ? '按重新开始再战' : '按 P 或开始按钮出击', 200, 216)
  ctx.textAlign = 'start'
}

function draw() {
  const ctx = canvasRef.value?.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  ctx.fillStyle = '#191b18'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  ctx.fillStyle = '#20241f'
  for (let y = 0; y < CANVAS_SIZE; y += 16) {
    for (let x = (y / 16) % 2 * 8; x < CANVAS_SIZE; x += 16) ctx.fillRect(x, y, 2, 2)
  }
  bricks.forEach(brick => drawBrick(ctx, brick))
  drawBase(ctx)
  if (lives.value > 0) drawTank(ctx, player, '#f5d442', '#fff1a6')
  enemies.forEach(enemy => drawTank(ctx, enemy, '#d84b3e', '#ff9b62'))
  ctx.fillStyle = '#fff6b7'
  bullets.forEach(bullet => ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height))

  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)'
  ctx.fillRect(0, 0, CANVAS_SIZE, 27)
  ctx.font = 'bold 12px monospace'
  ctx.fillStyle = '#f7d354'
  ctx.fillText(`SCORE ${String(score.value).padStart(4, '0')}`, 10, 18)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`LIFE ${lives.value}`, 154, 18)
  ctx.fillText(`ENEMY ${remainingEnemies.value}`, 244, 18)
  drawOverlay(ctx)
}

function keyToAction(event) {
  const key = event.key.toLowerCase()
  if (key === 'arrowup' || key === 'w') return 'up'
  if (key === 'arrowdown' || key === 's') return 'down'
  if (key === 'arrowleft' || key === 'a') return 'left'
  if (key === 'arrowright' || key === 'd') return 'right'
  if (event.code === 'Space' || key === ' ') return 'fire'
  return null
}

function handleKeydown(event) {
  if (event.key.toLowerCase() === 'p') {
    event.preventDefault()
    if (!event.repeat) togglePause()
    return
  }
  const action = keyToAction(event)
  if (!action) return
  event.preventDefault()
  if (isGameOver.value || isWin.value) return
  pressedKeys.add(action)
  if (action === 'fire') shootPlayer(gameTime)
}

function handleKeyup(event) {
  const action = keyToAction(event)
  if (!action) return
  event.preventDefault()
  pressedKeys.delete(action)
}

function releaseControls() {
  pressedKeys.clear()
}

function handleVisibilityChange() {
  lastFrameAt = null
  if (document.hidden) releaseControls()
}

function pressControl(action, event) {
  event?.preventDefault()
  if (isPaused.value || isGameOver.value || isWin.value) return
  pressedKeys.add(action)
  if (action === 'fire') shootPlayer(gameTime)
}

function releaseControl(action, event) {
  event?.preventDefault()
  pressedKeys.delete(action)
}

onMounted(() => {
  resetGame()
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('keyup', handleKeyup)
  window.addEventListener('blur', releaseControls)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  animationFrameId = requestAnimationFrame(gameLoop)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('keyup', handleKeyup)
  window.removeEventListener('blur', releaseControls)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
  animationFrameId = null
  pressedKeys.clear()
})
</script>

<template>
  <section class="battle-city" aria-label="90坦克大战">
    <div class="status-row">
      <span>得分 {{ score }}</span>
      <span>最高 {{ highScore }}</span>
      <span>生命 {{ lives }}</span>
      <span>敌军 {{ remainingEnemies }}</span>
    </div>

    <div class="canvas-shell">
      <canvas ref="canvasRef" :width="CANVAS_SIZE" :height="CANVAS_SIZE" aria-label="90坦克游戏战场"></canvas>
    </div>

    <div class="main-actions">
      <button type="button" :disabled="isGameOver || isWin" @click="togglePause">
        {{ isPaused ? '开始 / 继续' : '暂停' }}
      </button>
      <button type="button" @click="resetGame">重新开始</button>
    </div>

    <div class="touch-controls" aria-label="触控操作区">
      <div class="direction-pad">
        <button
          v-for="control in [
            { action: 'up', label: '▲' },
            { action: 'left', label: '◀' },
            { action: 'down', label: '▼' },
            { action: 'right', label: '▶' }
          ]"
          :key="control.action"
          type="button"
          :class="`direction-${control.action}`"
          :aria-label="control.action"
          @pointerdown="pressControl(control.action, $event)"
          @pointerup="releaseControl(control.action, $event)"
          @pointercancel="releaseControl(control.action, $event)"
          @pointerleave="releaseControl(control.action, $event)"
        >{{ control.label }}</button>
      </div>
      <button
        type="button"
        class="fire-button"
        aria-label="开火"
        @pointerdown="pressControl('fire', $event)"
        @pointerup="releaseControl('fire', $event)"
        @pointercancel="releaseControl('fire', $event)"
        @pointerleave="releaseControl('fire', $event)"
      >FIRE</button>
    </div>

    <p class="help">方向键 / WASD 移动 · 空格射击 · P 暂停</p>
  </section>
</template>

<style scoped>
.battle-city {
  width: min(100%, 440px);
  margin: 0 auto;
  color: #f8f4dd;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  user-select: none;
}

.status-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.status-row span {
  padding: 6px 3px;
  border: 1px solid #5c5944;
  border-radius: 4px;
  background: #23241f;
}

.canvas-shell {
  overflow: hidden;
  width: 100%;
  aspect-ratio: 1;
  border: 4px solid #6d6953;
  background: #191b18;
  box-shadow: 0 0 0 2px #25251f;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  touch-action: none;
}

button {
  border: 1px solid #77735a;
  border-radius: 5px;
  background: #2d2e27;
  color: #fff8d4;
  font: 700 13px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  cursor: pointer;
  touch-action: none;
}

button:active:not(:disabled) {
  transform: translateY(1px);
  background: #5d5941;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.main-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}

.main-actions button {
  min-height: 36px;
}

.touch-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100%, 350px);
  margin: 12px auto 0;
}

.direction-pad {
  display: grid;
  grid-template: repeat(3, 42px) / repeat(3, 42px);
  gap: 3px;
}

.direction-pad button {
  font-size: 18px;
}

.direction-up { grid-area: 1 / 2; }
.direction-left { grid-area: 2 / 1; }
.direction-down { grid-area: 2 / 2; }
.direction-right { grid-area: 2 / 3; }

.fire-button {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  border-color: #bd624b;
  background: #843b2e;
  color: #ffe28b;
}

.help {
  margin: -30px 0 0 0;
  color: #aaa792;
  font-size: 11px;
  text-align: center;
}

@media (max-width: 520px) {
  .status-row {
    font-size: 10px;
  }

  .help {
    margin-top: 8px;
  }
}
</style>
