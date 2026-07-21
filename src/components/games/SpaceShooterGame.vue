<script setup lang="ts">

import { readHighScore, rectsOverlap } from './gameUtils.ts'
import type { RectBounds } from './gameUtils.ts'

type GamePhase = 'ready' | 'playing' | 'paused' | 'gameover'
type MoveDirection = 'left' | 'right' | 'up' | 'down'
type InputAction = MoveDirection | 'fire'

interface Player extends RectBounds {}

interface Bullet extends RectBounds {
  vx: number
  vy: number
}

interface Enemy extends RectBounds {
  id: number
  hp: number
  maxHp: number
  speed: number
  drift: number
  phase: number
  nextShotAt: number
}

interface DifficultyConfig {
  level: number
  spawnSeconds: number
  fallSpeed: number
  bulletSpeed: number
}

interface Star {
  x: number
  y: number
  radius: number
  alpha: number
}

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 520
const PLAYER_WIDTH = 30
const PLAYER_HEIGHT = 34
const PLAYER_MIN_Y = CANVAS_HEIGHT * 0.55
const PLAYER_SPEED = 245
const PLAYER_SHOT_COOLDOWN = 170
const INVULNERABLE_MS = 900
const FIXED_STEP_SECONDS = 1 / 120
const MAX_WALL_DELTA_SECONDS = 0.25
const MAX_STEPS_PER_FRAME = 30
const HIGH_SCORE_KEY = 'spaceshooter_high_score'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const score = ref<number>(0)
const highScore = ref<number>(readHighScore(HIGH_SCORE_KEY))
const lives = ref<number>(3)
const wave = ref<number>(1)
const phase = ref<GamePhase>('ready')

let player = createPlayer()
let playerBullets: Bullet[] = []
let enemyBullets: Bullet[] = []
let enemies: Enemy[] = []
let pressedKeys: Set<InputAction> = new Set<InputAction>()
let fireHeld: boolean = false
let pointerId: number | null = null
let nextEnemyId: number = 1
let gameTime: number = 0
let spawnElapsed: number = 0
let lastPlayerShotAt: number = -PLAYER_SHOT_COOLDOWN
let invulnerableUntil: number = 0
let lastFrameAt: number | null = null
let accumulator: number = 0
let animationFrameId: number | null = null

const stars: Star[] = Array.from({ length: 54 }, (_: unknown, index: number): Star => ({
  x: (index * 67 + 19) % CANVAS_WIDTH,
  y: (index * 101 + 31) % CANVAS_HEIGHT,
  radius: index % 7 === 0 ? 1.5 : 0.8,
  alpha: 0.25 + (index % 5) * 0.12
}))

function createPlayer(): Player {
  return {
    x: (CANVAS_WIDTH - PLAYER_WIDTH) / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 22,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT
  }
}

function difficultyFor(currentScore: number = score.value): DifficultyConfig {
  if (currentScore >= 1800) return { level: 5, spawnSeconds: 0.48, fallSpeed: 142, bulletSpeed: 210 }
  if (currentScore >= 1200) return { level: 4, spawnSeconds: 0.60, fallSpeed: 126, bulletSpeed: 196 }
  if (currentScore >= 800) return { level: 3, spawnSeconds: 0.74, fallSpeed: 110, bulletSpeed: 184 }
  if (currentScore >= 350) return { level: 2, spawnSeconds: 0.92, fallSpeed: 94, bulletSpeed: 170 }
  return { level: 1, spawnSeconds: 1.12, fallSpeed: 78, bulletSpeed: 158 }
}

function clearFrameTiming(): void {
  lastFrameAt = null
  accumulator = 0
}

function saveHighScore(): void {
  if (score.value <= highScore.value) return
  highScore.value = score.value
  try {
    globalThis.localStorage?.setItem(HIGH_SCORE_KEY, String(highScore.value))
  } catch {
    // Keep the session high score when storage is unavailable.
  }
}

function resetGame(): void {
  player = createPlayer()
  playerBullets = []
  enemyBullets = []
  enemies = []
  pressedKeys = new Set<InputAction>()
  fireHeld = false
  pointerId = null
  nextEnemyId = 1
  gameTime = 0
  spawnElapsed = 0
  lastPlayerShotAt = -PLAYER_SHOT_COOLDOWN
  invulnerableUntil = 0
  score.value = 0
  lives.value = 3
  wave.value = 1
  phase.value = 'ready'
  clearFrameTiming()
  draw()
}

function startGame(): void {
  if (phase.value === 'gameover') return
  if (phase.value === 'ready' || phase.value === 'paused') {
    phase.value = 'playing'
    clearFrameTiming()
  }
}

function restartGame(): void {
  resetGame()
  startGame()
}

function togglePause(): void {
  if (phase.value === 'playing') phase.value = 'paused'
  else if (phase.value === 'paused') phase.value = 'playing'
  else return
  pressedKeys.clear()
  fireHeld = false
  clearFrameTiming()
}

function finishGame(): void {
  if (phase.value === 'gameover') return
  phase.value = 'gameover'
  pressedKeys.clear()
  fireHeld = false
  clearFrameTiming()
  saveHighScore()
}

function shootPlayer(): void {
  if (phase.value === 'ready' || phase.value === 'paused') startGame()
  if (phase.value !== 'playing' || gameTime - lastPlayerShotAt < PLAYER_SHOT_COOLDOWN) return
  playerBullets.push({
    x: player.x + player.width / 2 - 2,
    y: player.y - 12,
    width: 4,
    height: 13,
    vx: 0,
    vy: -390
  })
  lastPlayerShotAt = gameTime
}

function spawnEnemy(): void {
  const difficulty: DifficultyConfig = difficultyFor()
  const advanced: boolean = score.value >= 800
  const width: number = advanced ? 34 : 30
  const height: number = advanced ? 30 : 26
  const laneCount: number = 7
  const lane: number = (nextEnemyId * 3 + difficulty.level) % laneCount
  const laneWidth: number = (CANVAS_WIDTH - width - 24) / (laneCount - 1)
  const hp: number = advanced ? 2 : 1
  const enemy: Enemy = {
    id: nextEnemyId++,
    x: 12 + lane * laneWidth,
    y: -height - 4,
    width,
    height,
    hp,
    maxHp: hp,
    speed: difficulty.fallSpeed + ((nextEnemyId * 7) % 22),
    drift: nextEnemyId % 2 === 0 ? 24 : -24,
    phase: (nextEnemyId % 6) * 0.8,
    nextShotAt: gameTime + Math.max(520, 1350 - difficulty.level * 115) + (nextEnemyId % 5) * 130
  }
  enemies.push(enemy)
}

function shootEnemy(enemy: Enemy): void {
  const difficulty: DifficultyConfig = difficultyFor()
  const originX: number = enemy.x + enemy.width / 2
  const originY: number = enemy.y + enemy.height
  const targetX: number = player.x + player.width / 2
  const targetY: number = player.y + player.height / 2
  const dx: number = targetX - originX
  const dy: number = targetY - originY
  const length: number = Math.max(1, Math.hypot(dx, dy))
  enemyBullets.push({
    x: originX - 3,
    y: originY,
    width: 6,
    height: 10,
    vx: dx / length * difficulty.bulletSpeed,
    vy: dy / length * difficulty.bulletSpeed
  })
  enemy.nextShotAt = gameTime + Math.max(620, 1550 - difficulty.level * 125) + (enemy.id % 4) * 150
}

function movePlayer(deltaSeconds: number): void {
  let dx: number = 0
  let dy: number = 0
  if (pressedKeys.has('left')) dx -= 1
  if (pressedKeys.has('right')) dx += 1
  if (pressedKeys.has('up')) dy -= 1
  if (pressedKeys.has('down')) dy += 1
  if (dx !== 0 && dy !== 0) {
    dx *= Math.SQRT1_2
    dy *= Math.SQRT1_2
  }
  player.x = clamp(player.x + dx * PLAYER_SPEED * deltaSeconds, 0, CANVAS_WIDTH - player.width)
  player.y = clamp(player.y + dy * PLAYER_SPEED * deltaSeconds, PLAYER_MIN_Y, CANVAS_HEIGHT - player.height)
}

function updateEnemies(deltaSeconds: number): void {
  const difficulty: DifficultyConfig = difficultyFor()
  spawnElapsed += deltaSeconds
  while (spawnElapsed >= difficulty.spawnSeconds) {
    spawnElapsed -= difficulty.spawnSeconds
    spawnEnemy()
  }

  for (const enemy of enemies) {
    enemy.y += enemy.speed * deltaSeconds
    enemy.x += Math.sin(gameTime / 520 + enemy.phase) * enemy.drift * deltaSeconds
    enemy.x = clamp(enemy.x, 0, CANVAS_WIDTH - enemy.width)
    if (enemy.y > 20 && enemy.y < player.y - 55 && gameTime >= enemy.nextShotAt) shootEnemy(enemy)
  }
}

function updateBullets(deltaSeconds: number): void {
  for (const bullet of playerBullets) bullet.y += bullet.vy * deltaSeconds
  for (const bullet of enemyBullets) {
    bullet.x += bullet.vx * deltaSeconds
    bullet.y += bullet.vy * deltaSeconds
  }
  playerBullets = playerBullets.filter((bullet: Bullet): boolean => bullet.y + bullet.height >= 0)
  enemyBullets = enemyBullets.filter((bullet: Bullet): boolean => (
    bullet.x + bullet.width >= 0 && bullet.x <= CANVAS_WIDTH &&
    bullet.y + bullet.height >= 0 && bullet.y <= CANVAS_HEIGHT
  ))
}

function resolvePlayerShots(): void {
  const hitBullets: Set<number> = new Set<number>()
  const defeatedEnemies: Set<number> = new Set<number>()

  for (let bulletIndex = 0; bulletIndex < playerBullets.length; bulletIndex += 1) {
    const bullet: Bullet = playerBullets[bulletIndex]
    const enemy: Enemy | undefined = enemies.find((item: Enemy): boolean => !defeatedEnemies.has(item.id) && rectsOverlap(bullet, item))
    if (!enemy) continue
    hitBullets.add(bulletIndex)
    enemy.hp -= 1
    if (enemy.hp <= 0) defeatedEnemies.add(enemy.id)
  }

  if (hitBullets.size > 0) playerBullets = playerBullets.filter((_: Bullet, index: number): boolean => !hitBullets.has(index))
  if (defeatedEnemies.size === 0) return
  for (const enemy of enemies) {
    if (!defeatedEnemies.has(enemy.id)) continue
    score.value += enemy.maxHp === 2 ? 140 : 100
  }
  enemies = enemies.filter((enemy: Enemy): boolean => !defeatedEnemies.has(enemy.id))
  wave.value = difficultyFor().level
  saveHighScore()
}

function damagePlayer(): boolean {
  if (gameTime < invulnerableUntil || phase.value !== 'playing') return false
  lives.value -= 1
  invulnerableUntil = gameTime + INVULNERABLE_MS
  if (lives.value <= 0) finishGame()
  return true
}

function resolvePlayerThreats(): void {
  const touchingBulletIndexes: Set<number> = new Set<number>()
  const touchingEnemyIds: Set<number> = new Set<number>()
  enemyBullets.forEach((bullet: Bullet, index: number): void => {
    if (rectsOverlap(bullet, player)) touchingBulletIndexes.add(index)
  })
  enemies.forEach((enemy: Enemy): void => {
    if (enemy.y + enemy.height >= CANVAS_HEIGHT || rectsOverlap(enemy, player)) touchingEnemyIds.add(enemy.id)
  })

  if (touchingBulletIndexes.size === 0 && touchingEnemyIds.size === 0) return
  enemyBullets = enemyBullets.filter((_: Bullet, index: number): boolean => !touchingBulletIndexes.has(index))
  enemies = enemies.filter((enemy: Enemy): boolean => !touchingEnemyIds.has(enemy.id))
  damagePlayer()
}

function update(deltaSeconds: number): void {
  gameTime += deltaSeconds * 1000
  movePlayer(deltaSeconds)
  if (fireHeld || pressedKeys.has('fire')) shootPlayer()
  updateEnemies(deltaSeconds)
  updateBullets(deltaSeconds)
  resolvePlayerShots()
  resolvePlayerThreats()
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  const gradient: CanvasGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
  gradient.addColorStop(0, '#071326')
  gradient.addColorStop(0.62, '#0c2440')
  gradient.addColorStop(1, '#151a3a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  for (const star of stars) {
    const y: number = (star.y + gameTime * (0.008 + star.radius * 0.004)) % CANVAS_HEIGHT
    ctx.globalAlpha = star.alpha
    ctx.fillStyle = '#d8f4ff'
    ctx.beginPath()
    ctx.arc(star.x, y, star.radius, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.strokeStyle = 'rgba(63, 180, 220, 0.12)'
  ctx.setLineDash([4, 7])
  ctx.beginPath()
  ctx.moveTo(0, PLAYER_MIN_Y)
  ctx.lineTo(CANVAS_WIDTH, PLAYER_MIN_Y)
  ctx.stroke()
  ctx.setLineDash([])
}

function drawPlayer(ctx: CanvasRenderingContext2D): void {
  const invulnerable: boolean = gameTime < invulnerableUntil
  if (invulnerable && Math.floor(gameTime / 90) % 2 === 0) return
  ctx.save()
  ctx.translate(player.x, player.y)
  ctx.fillStyle = '#61e8ff'
  ctx.beginPath()
  ctx.moveTo(player.width / 2, 0)
  ctx.lineTo(player.width, player.height)
  ctx.lineTo(player.width / 2, player.height - 8)
  ctx.lineTo(0, player.height)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#d9fbff'
  ctx.fillRect(player.width / 2 - 3, 9, 6, 14)
  ctx.fillStyle = '#ffb13b'
  ctx.fillRect(6, player.height - 4, 5, 9)
  ctx.fillRect(player.width - 11, player.height - 4, 5, 9)
  ctx.restore()
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
  ctx.save()
  ctx.translate(enemy.x, enemy.y)
  ctx.fillStyle = enemy.maxHp === 2 ? '#ee6cff' : '#ff5c73'
  ctx.beginPath()
  ctx.moveTo(0, 4)
  ctx.lineTo(enemy.width / 2, enemy.height)
  ctx.lineTo(enemy.width, 4)
  ctx.lineTo(enemy.width - 7, enemy.height - 5)
  ctx.lineTo(7, enemy.height - 5)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#1d1737'
  ctx.fillRect(enemy.width / 2 - 4, 6, 8, 9)
  if (enemy.maxHp === 2) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.fillRect(3, -5, enemy.width - 6, 3)
    ctx.fillStyle = '#f5ecff'
    ctx.fillRect(3, -5, (enemy.width - 6) * (enemy.hp / enemy.maxHp), 3)
  }
  ctx.restore()
}

function drawBullets(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#ffeb72'
  for (const bullet of playerBullets) {
    ctx.shadowColor = '#ffdf36'
    ctx.shadowBlur = 7
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
  }
  ctx.shadowBlur = 0
  ctx.fillStyle = '#ff755d'
  for (const bullet of enemyBullets) {
    ctx.beginPath()
    ctx.ellipse(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 4, 6, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawHud(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(5, 13, 28, 0.7)'
  ctx.fillRect(8, 8, CANVAS_WIDTH - 16, 34)
  ctx.fillStyle = '#e8f8ff'
  ctx.font = '800 13px ui-rounded, system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(`SCORE ${score.value}`, 18, 25)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#89ecff'
  ctx.fillText(`WAVE ${wave.value}`, CANVAS_WIDTH / 2, 25)
  ctx.textAlign = 'right'
  ctx.fillStyle = '#ff8192'
  ctx.fillText(`LIFE ${'◆'.repeat(lives.value)}`, CANVAS_WIDTH - 18, 25)
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}

function draw(): void {
  const ctx: CanvasRenderingContext2D | null = canvasRef.value?.getContext('2d') || null
  if (!ctx) return
  drawBackground(ctx)
  enemies.forEach((enemy: Enemy): void => drawEnemy(ctx, enemy))
  drawBullets(ctx)
  drawPlayer(ctx)
  drawHud(ctx)
}

function gameLoop(now: number): void {
  if (lastFrameAt === null) lastFrameAt = now
  const wallDeltaSeconds: number = Math.min(Math.max(0, (now - lastFrameAt) / 1000), MAX_WALL_DELTA_SECONDS)
  lastFrameAt = now
  if (phase.value === 'playing') {
    accumulator += wallDeltaSeconds
    let steps: number = 0
    while (accumulator >= FIXED_STEP_SECONDS && steps < MAX_STEPS_PER_FRAME) {
      accumulator -= FIXED_STEP_SECONDS
      update(FIXED_STEP_SECONDS)
      steps += 1
      if (phase.value !== 'playing') break
    }
  } else {
    accumulator = 0
  }
  draw()
  animationFrameId = requestAnimationFrame(gameLoop)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function directionForKey(event: KeyboardEvent): MoveDirection | null {
  const key: string = event.key.toLowerCase()
  if (event.key === 'ArrowLeft' || key === 'a') return 'left'
  if (event.key === 'ArrowRight' || key === 'd') return 'right'
  if (event.key === 'ArrowUp' || key === 'w') return 'up'
  if (event.key === 'ArrowDown' || key === 's') return 'down'
  return null
}

function handleKeydown(event: KeyboardEvent): void {
  const direction: MoveDirection | null = directionForKey(event)
  if (direction) {
    event.preventDefault()
    pressedKeys.add(direction)
    startGame()
    return
  }
  if (event.code === 'Space' || event.key === ' ') {
    event.preventDefault()
    pressedKeys.add('fire')
    if (!event.repeat) shootPlayer()
    return
  }
  if ((event.key === 'p' || event.key === 'P' || event.key === 'Escape') && !event.repeat) {
    event.preventDefault()
    togglePause()
  }
  if ((event.key === 'r' || event.key === 'R') && !event.repeat) restartGame()
}

function handleKeyup(event: KeyboardEvent): void {
  const direction: MoveDirection | null = directionForKey(event)
  if (direction) pressedKeys.delete(direction)
  if (event.code === 'Space' || event.key === ' ') pressedKeys.delete('fire')
}

function moveToPointer(event: PointerEvent): void {
  const canvas: HTMLCanvasElement | null = canvasRef.value
  if (!canvas) return
  const rect: DOMRect = canvas.getBoundingClientRect()
  const x: number = (event.clientX - rect.left) * CANVAS_WIDTH / rect.width
  const y: number = (event.clientY - rect.top) * CANVAS_HEIGHT / rect.height
  player.x = clamp(x - player.width / 2, 0, CANVAS_WIDTH - player.width)
  player.y = clamp(y - player.height / 2, PLAYER_MIN_Y, CANVAS_HEIGHT - player.height)
}

function handleCanvasPointerDown(event: PointerEvent): void {
  if (phase.value === 'gameover') return
  const target: EventTarget | null = event.currentTarget
  if (target instanceof HTMLCanvasElement) target.setPointerCapture?.(event.pointerId)
  pointerId = event.pointerId
  startGame()
  moveToPointer(event)
  fireHeld = true
  shootPlayer()
}

function handleCanvasPointerMove(event: PointerEvent): void {
  if (pointerId !== event.pointerId) return
  moveToPointer(event)
}

function releaseCanvasPointer(event: PointerEvent): void {
  if (pointerId !== event.pointerId) return
  pointerId = null
  fireHeld = false
}

function pressDirection(direction: MoveDirection): void {
  startGame()
  pressedKeys.add(direction)
}

function releaseDirection(direction: MoveDirection): void {
  pressedKeys.delete(direction)
}

function pressFire(): void {
  fireHeld = true
  shootPlayer()
}

function releaseFire(): void {
  fireHeld = false
}

function releaseInput(): void {
  pressedKeys.clear()
  fireHeld = false
  pointerId = null
}

function handleVisibilityChange(): void {
  if (document.hidden && phase.value === 'playing') phase.value = 'paused'
  releaseInput()
  clearFrameTiming()
}

onMounted(() => {
  resetGame()
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('keyup', handleKeyup)
  window.addEventListener('blur', releaseInput)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  animationFrameId = requestAnimationFrame(gameLoop)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('keyup', handleKeyup)
  window.removeEventListener('blur', releaseInput)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
  animationFrameId = null
  releaseInput()
  clearFrameTiming()
})
</script>

<template>
  <section class="space-shooter" aria-label="太空战机游戏">
    <div class="status-row" aria-live="polite">
      <span>得分 {{ score }}</span>
      <span>波次 {{ wave }}</span>
      <span>生命 {{ lives }}</span>
      <span>最高 {{ highScore }}</span>
    </div>

    <div class="canvas-shell">
      <canvas
        ref="canvasRef"
        :width="CANVAS_WIDTH"
        :height="CANVAS_HEIGHT"
        aria-label="太空战机游戏区域，拖动移动并持续射击"
        @pointerdown="handleCanvasPointerDown"
        @pointermove="handleCanvasPointerMove"
        @pointerup="releaseCanvasPointer"
        @pointercancel="releaseCanvasPointer"
      ></canvas>

      <div v-if="phase !== 'playing'" class="overlay">
        <div class="overlay-card">
          <p class="eyebrow">SPACE SHOOTER</p>
          <h2>{{ phase === 'gameover' ? '任务失败' : phase === 'paused' ? '游戏暂停' : '准备出击' }}</h2>
          <p v-if="phase === 'gameover'">本局得分 {{ score }} · 最高 {{ highScore }}</p>
          <p v-else>{{ phase === 'paused' ? '战场已冻结' : '拖动战机，击落来袭敌军' }}</p>
          <button v-if="phase === 'gameover'" type="button" @click="restartGame">重新出击</button>
          <button v-else type="button" @click="startGame">{{ phase === 'paused' ? '继续游戏' : '开始游戏' }}</button>
        </div>
      </div>
    </div>

    <div class="touch-controls" aria-label="触控操作区">
      <div class="direction-pad">
        <button type="button" aria-label="向上" @pointerdown.prevent="pressDirection('up')" @pointerup="releaseDirection('up')" @pointercancel="releaseDirection('up')" @pointerleave="releaseDirection('up')">▲</button>
        <button type="button" aria-label="向左" @pointerdown.prevent="pressDirection('left')" @pointerup="releaseDirection('left')" @pointercancel="releaseDirection('left')" @pointerleave="releaseDirection('left')">◀</button>
        <button type="button" aria-label="向下" @pointerdown.prevent="pressDirection('down')" @pointerup="releaseDirection('down')" @pointercancel="releaseDirection('down')" @pointerleave="releaseDirection('down')">▼</button>
        <button type="button" aria-label="向右" @pointerdown.prevent="pressDirection('right')" @pointerup="releaseDirection('right')" @pointercancel="releaseDirection('right')" @pointerleave="releaseDirection('right')">▶</button>
      </div>
      <button class="fire-button" type="button" :disabled="phase === 'gameover'" @pointerdown.prevent="pressFire" @pointerup="releaseFire" @pointercancel="releaseFire" @pointerleave="releaseFire">发射</button>
    </div>

    <div class="actions">
      <button type="button" :disabled="phase === 'ready' || phase === 'gameover'" @click="togglePause">{{ phase === 'paused' ? '继续' : '暂停' }}</button>
      <button type="button" @click="restartGame">重开</button>
    </div>
    <p class="help">方向键 / WASD 移动 · 空格射击 · P / Esc 暂停 · R 重开</p>
  </section>
</template>

<style scoped src="./css/SpaceShooterGame.css"></style>
