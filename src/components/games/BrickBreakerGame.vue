<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { circleRectCollision, readHighScore } from './gameUtils.js'

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 440
const PADDLE_WIDTH = 84
const PADDLE_HEIGHT = 12
const BALL_RADIUS = 8
const BRICK_ROWS = 6
const BRICK_COLUMNS = 8
const BRICK_WIDTH = 40
const BRICK_HEIGHT = 17
const BRICK_GAP = 6
const BRICK_START_X = 19
const BRICK_START_Y = 54
const INITIAL_LIVES = 3
const MAX_DELTA_SECONDS = 0.032
const HIGH_SCORE_KEY = 'brickbreaker_high_score'

const ROW_COLORS = ['#ff5c5c', '#ff8c42', '#f5cf46', '#65c96e', '#45a9e6', '#9b75df']

const canvasRef = ref(null)
const score = ref(0)
const highScore = ref(readHighScore(HIGH_SCORE_KEY))
const lives = ref(INITIAL_LIVES)
const isPaused = ref(true)
const isGameOver = ref(false)
const isWin = ref(false)
const isLaunched = ref(false)

let paddle = createPaddle()
let ball = createBall()
let bricks = createBricks()
let pressedDirections = new Set()
let lastFrameAt = null
let animationFrameId = null

function createPaddle() {
  return {
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    y: CANVAS_HEIGHT - 28,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 310
  }
}

function createBall() {
  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 38,
    radius: BALL_RADIUS,
    vx: 145,
    vy: -220
  }
}

function createBricks() {
  return Array.from({ length: BRICK_ROWS * BRICK_COLUMNS }, (_, index) => {
    const row = Math.floor(index / BRICK_COLUMNS)
    const column = index % BRICK_COLUMNS
    return {
      id: index + 1,
      row,
      x: BRICK_START_X + column * (BRICK_WIDTH + BRICK_GAP),
      y: BRICK_START_Y + row * (BRICK_HEIGHT + BRICK_GAP),
      width: BRICK_WIDTH,
      height: BRICK_HEIGHT,
      alive: true
    }
  })
}

function resetBall() {
  ball = createBall()
  ball.x = paddle.x + paddle.width / 2
  isLaunched.value = false
  isPaused.value = true
  lastFrameAt = null
}

function resetGame() {
  paddle = createPaddle()
  bricks = createBricks()
  pressedDirections.clear()
  score.value = 0
  lives.value = INITIAL_LIVES
  isGameOver.value = false
  isWin.value = false
  resetBall()
  draw()
}

function saveHighScore() {
  if (score.value <= highScore.value) return
  highScore.value = score.value
  try {
    globalThis.localStorage?.setItem(HIGH_SCORE_KEY, String(highScore.value))
  } catch {
    // Storage may be unavailable; retain the in-memory high score.
  }
}

function finishGame(won) {
  isWin.value = won
  isGameOver.value = !won
  isPaused.value = true
  isLaunched.value = false
  pressedDirections.clear()
  saveHighScore()
}

function launchOrTogglePause() {
  if (isGameOver.value || isWin.value) return
  if (!isLaunched.value) {
    isLaunched.value = true
    isPaused.value = false
  } else {
    isPaused.value = !isPaused.value
  }
  lastFrameAt = null
}

function updatePaddle(deltaSeconds) {
  const movingLeft = pressedDirections.has('left')
  const movingRight = pressedDirections.has('right')
  const direction = Number(movingRight) - Number(movingLeft)
  paddle.x = Math.max(0, Math.min(
    CANVAS_WIDTH - paddle.width,
    paddle.x + direction * paddle.speed * deltaSeconds
  ))
}

function increaseBallSpeed() {
  const speed = Math.hypot(ball.vx, ball.vy)
  if (!speed) return
  const fasterSpeed = Math.min(speed + 22, 410)
  ball.vx = ball.vx / speed * fasterSpeed
  ball.vy = ball.vy / speed * fasterSpeed
}

function reflectFromBrick(brick, previousX, previousY) {
  const cameFromLeft = previousX + ball.radius <= brick.x
  const cameFromRight = previousX - ball.radius >= brick.x + brick.width
  const cameFromAbove = previousY + ball.radius <= brick.y
  const cameFromBelow = previousY - ball.radius >= brick.y + brick.height

  if (cameFromLeft || cameFromRight) {
    ball.vx *= -1
    ball.x = cameFromLeft ? brick.x - ball.radius : brick.x + brick.width + ball.radius
    return
  }
  if (cameFromAbove || cameFromBelow) {
    ball.vy *= -1
    ball.y = cameFromAbove ? brick.y - ball.radius : brick.y + brick.height + ball.radius
    return
  }

  const horizontalPenetration = Math.min(
    Math.abs(ball.x + ball.radius - brick.x),
    Math.abs(brick.x + brick.width - (ball.x - ball.radius))
  )
  const verticalPenetration = Math.min(
    Math.abs(ball.y + ball.radius - brick.y),
    Math.abs(brick.y + brick.height - (ball.y - ball.radius))
  )
  if (horizontalPenetration < verticalPenetration) ball.vx *= -1
  else ball.vy *= -1
}

function handlePaddleCollision() {
  if (ball.vy <= 0 || !circleRectCollision(ball, paddle)) return
  const relativeHit = Math.max(-1, Math.min(1, (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2)))
  const speed = Math.max(250, Math.hypot(ball.vx, ball.vy))
  const horizontalRatio = relativeHit * 0.78
  ball.vx = speed * horizontalRatio
  ball.vy = -Math.sqrt(Math.max(0, speed ** 2 - ball.vx ** 2))
  ball.y = paddle.y - ball.radius
}

function handleBrickCollision(previousX, previousY) {
  const brick = bricks.find(item => item.alive && circleRectCollision(ball, item))
  if (!brick) return

  brick.alive = false
  reflectFromBrick(brick, previousX, previousY)
  score.value += 10
  saveHighScore()

  const clearedBricks = score.value / 10
  if (clearedBricks % BRICK_COLUMNS === 0) increaseBallSpeed()
  if (clearedBricks === BRICK_ROWS * BRICK_COLUMNS) finishGame(true)
}

function loseLife() {
  lives.value -= 1
  if (lives.value <= 0) {
    finishGame(false)
    return
  }
  resetBall()
}

function updateBall(deltaSeconds) {
  if (!isLaunched.value) {
    ball.x = paddle.x + paddle.width / 2
    ball.y = paddle.y - ball.radius - 2
    return
  }

  const previousX = ball.x
  const previousY = ball.y
  ball.x += ball.vx * deltaSeconds
  ball.y += ball.vy * deltaSeconds

  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius
    ball.vx = Math.abs(ball.vx)
  } else if (ball.x + ball.radius > CANVAS_WIDTH) {
    ball.x = CANVAS_WIDTH - ball.radius
    ball.vx = -Math.abs(ball.vx)
  }

  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius
    ball.vy = Math.abs(ball.vy)
  }

  // End this update immediately so an off-screen ball cannot hit anything else.
  if (ball.y - ball.radius > CANVAS_HEIGHT) {
    loseLife()
    return
  }

  handlePaddleCollision()
  handleBrickCollision(previousX, previousY)
}

function update(deltaSeconds) {
  updatePaddle(deltaSeconds)
  updateBall(deltaSeconds)
}

function gameLoop(now) {
  if (lastFrameAt === null) lastFrameAt = now
  const deltaSeconds = Math.min(Math.max(0, (now - lastFrameAt) / 1000), MAX_DELTA_SECONDS)
  lastFrameAt = now
  if (!isPaused.value && !isGameOver.value && !isWin.value) update(deltaSeconds)
  draw()
  animationFrameId = requestAnimationFrame(gameLoop)
}

function drawBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
  gradient.addColorStop(0, '#111a29')
  gradient.addColorStop(1, '#081019')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
  for (let y = 15; y < CANVAS_HEIGHT; y += 24) {
    for (let x = (y / 24 % 2) * 16; x < CANVAS_WIDTH; x += 32) ctx.fillRect(x, y, 2, 2)
  }
}

function drawBricks(ctx) {
  bricks.forEach(brick => {
    if (!brick.alive) return
    ctx.fillStyle = ROW_COLORS[brick.row]
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.34)'
    ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 3)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.42)'
    ctx.strokeRect(brick.x + 0.5, brick.y + 0.5, brick.width - 1, brick.height - 1)
  })
}

function drawOverlay(ctx) {
  if (!isPaused.value && !isGameOver.value && !isWin.value) return
  ctx.fillStyle = 'rgba(3, 8, 15, 0.72)'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.textAlign = 'center'
  ctx.fillStyle = isWin.value ? '#ffe26b' : isGameOver.value ? '#ff6b6b' : '#7ce5ff'
  ctx.font = '700 28px ui-monospace, monospace'
  ctx.fillText(isWin.value ? 'CLEAR!' : isGameOver.value ? 'GAME OVER' : isLaunched.value ? 'PAUSED' : 'BRICK BREAKER', 200, 242)
  ctx.fillStyle = '#eaf7ff'
  ctx.font = '13px ui-monospace, monospace'
  ctx.fillText(isWin.value || isGameOver.value ? '点击重新开始再来一局' : '按空格发球 / 继续', 200, 270)
  ctx.textAlign = 'start'
}

function draw() {
  const ctx = canvasRef.value?.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  drawBackground(ctx)
  drawBricks(ctx)

  ctx.fillStyle = '#e8f8ff'
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
  ctx.fillStyle = '#59c9ec'
  ctx.fillRect(paddle.x + 5, paddle.y + 3, paddle.width - 10, 4)

  ctx.beginPath()
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
  ctx.fillStyle = '#fff6c7'
  ctx.fill()
  ctx.strokeStyle = '#ffb34d'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = 'rgba(2, 7, 13, 0.8)'
  ctx.fillRect(0, 0, CANVAS_WIDTH, 34)
  ctx.font = '700 12px ui-monospace, monospace'
  ctx.fillStyle = '#72ddff'
  ctx.fillText(`SCORE ${String(score.value).padStart(3, '0')}`, 12, 22)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`LIFE ${lives.value}`, 172, 22)
  ctx.fillText(`BRICKS ${bricks.filter(brick => brick.alive).length}`, 278, 22)
  drawOverlay(ctx)
}

function keyToDirection(event) {
  const key = event.key.toLowerCase()
  if (key === 'arrowleft' || key === 'a') return 'left'
  if (key === 'arrowright' || key === 'd') return 'right'
  return null
}

function handleKeydown(event) {
  if (event.code === 'Space' || event.key === ' ') {
    event.preventDefault()
    if (!event.repeat) launchOrTogglePause()
    return
  }
  const direction = keyToDirection(event)
  if (!direction) return
  event.preventDefault()
  if (!isGameOver.value && !isWin.value) pressedDirections.add(direction)
}

function handleKeyup(event) {
  const direction = keyToDirection(event)
  if (!direction) return
  event.preventDefault()
  pressedDirections.delete(direction)
}

function releaseControls() {
  pressedDirections.clear()
}

function handleVisibilityChange() {
  lastFrameAt = null
  if (document.hidden) releaseControls()
}

function pressDirection(direction, event) {
  event?.preventDefault()
  if (!isGameOver.value && !isWin.value) pressedDirections.add(direction)
}

function releaseDirection(direction, event) {
  event?.preventDefault()
  pressedDirections.delete(direction)
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
  pressedDirections.clear()
})
</script>

<template>
  <section class="brick-breaker" aria-label="打砖块游戏">
    <div class="status-row">
      <span>得分 {{ score }}</span>
      <span>最高 {{ highScore }}</span>
      <span>生命 {{ lives }}</span>
      <span>剩余 {{ bricks.filter(brick => brick.alive).length }}</span>
    </div>

    <div class="canvas-shell">
      <canvas
        ref="canvasRef"
        :width="CANVAS_WIDTH"
        :height="CANVAS_HEIGHT"
        aria-label="打砖块游戏区域"
      ></canvas>
    </div>

    <div class="main-actions">
      <button type="button" :disabled="isGameOver || isWin" @click="launchOrTogglePause">
        {{ !isLaunched ? '发球' : isPaused ? '继续' : '暂停' }}
      </button>
      <button type="button" @click="resetGame">重新开始</button>
    </div>

    <div class="touch-controls" aria-label="触控操作区">
      <button
        type="button"
        aria-label="向左移动挡板"
        @pointerdown="pressDirection('left', $event)"
        @pointerup="releaseDirection('left', $event)"
        @pointercancel="releaseDirection('left', $event)"
        @pointerleave="releaseDirection('left', $event)"
      >◀ 左移</button>
      <button
        type="button"
        aria-label="向右移动挡板"
        @pointerdown="pressDirection('right', $event)"
        @pointerup="releaseDirection('right', $event)"
        @pointercancel="releaseDirection('right', $event)"
        @pointerleave="releaseDirection('right', $event)"
      >右移 ▶</button>
    </div>

    <p class="help">方向键 / A D 移动 · 空格发球、暂停与继续</p>
  </section>
</template>

<style scoped>
.brick-breaker {
  width: min(100%, 440px);
  margin: 0 auto;
  color: #eaf7ff;
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
  border: 1px solid #34536a;
  border-radius: 4px;
  background: #102131;
}

.canvas-shell {
  overflow: hidden;
  width: 100%;
  aspect-ratio: 10 / 11;
  border: 4px solid #34536a;
  background: #081019;
  box-shadow: 0 0 0 2px #0b1824;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  touch-action: none;
}

button {
  min-height: 40px;
  border: 1px solid #44718d;
  border-radius: 5px;
  background: #153248;
  color: #eaf8ff;
  font: 700 13px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  cursor: pointer;
  touch-action: none;
}

button:active:not(:disabled) {
  transform: translateY(1px);
  background: #245471;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.main-actions,
.touch-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}

.touch-controls {
  width: min(100%, 310px);
  margin-inline: auto;
}

.touch-controls button {
  min-height: 48px;
  font-size: 15px;
}

.help {
  margin: 10px 0 0;
  color: #8da8b8;
  font-size: 11px;
  text-align: center;
}

@media (max-width: 520px) {
  .status-row {
    font-size: 10px;
  }
}
</style>
