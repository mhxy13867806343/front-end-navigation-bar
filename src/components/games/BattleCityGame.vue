<script setup lang="ts">

import { readHighScore, rectsOverlap } from './gameUtils.ts'
import type { RectBounds } from './gameUtils.ts'

type TankDirection = 'up' | 'down' | 'left' | 'right'
type ControlAction = TankDirection | 'fire'
type TerminalResult = 'win' | 'loss' | null

interface DirectionVector {
  x: number
  y: number
}

interface Tank extends RectBounds {
  direction: TankDirection
  speed: number
}

interface EnemyTank extends Tank {
  id: number
  lastDirectionAt: number
  nextTurnDelay: number
  lastShotAt: number
  nextShotDelay: number
}

interface Base extends RectBounds {
  alive: boolean
}

interface Brick extends RectBounds {
  id: number
}

interface Bullet extends RectBounds {
  vx: number
  vy: number
  owner: 'player' | 'enemy'
}

interface ControlButton {
  action: TankDirection
  label: string
}

const CANVAS_SIZE = 400
const TOTAL_ENEMIES = 12
const MAX_ACTIVE_ENEMIES = 4
const PLAYER_SHOT_COOLDOWN = 220
const HIGH_SCORE_KEY = 'battlecity_high_score'
const TANK_SIZE = 24

const DIRECTIONS: Record<TankDirection, DirectionVector> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
}

const controlButtons: ControlButton[] = [
  { action: 'up', label: '▲' },
  { action: 'left', label: '◀' },
  { action: 'down', label: '▼' },
  { action: 'right', label: '▶' }
]

const canvasRef = ref<HTMLCanvasElement | null>(null)
const score = ref<number>(0)
const highScore = ref<number>(readHighScore(HIGH_SCORE_KEY))
const lives = ref<number>(3)
const remainingEnemies = ref<number>(TOTAL_ENEMIES)
const isPaused = ref<boolean>(true)
const isGameOver = ref<boolean>(false)
const isWin = ref<boolean>(false)

let player = createPlayer()
let base = createBase()
let bricks: Brick[] = []
let bullets: Bullet[] = []
let enemies: EnemyTank[] = []
let pressedKeys: Set<ControlAction> = new Set<ControlAction>()
let spawnedEnemies: number = 0
let defeatedEnemies: number = 0
let nextEnemyId: number = 1
let terminalResult: TerminalResult = null
let gameTime: number = 0
let lastSpawnAt: number = 0
let lastPlayerShotAt: number = -PLAYER_SHOT_COOLDOWN
let lastFrameAt: number | null = null
let animationFrameId: number | null = null

function createPlayer(): Tank {
  return { x: 188, y: 316, width: TANK_SIZE, height: TANK_SIZE, direction: 'up', speed: 126 }
}

function createBase(): Base {
  return { x: 184, y: 364, width: 32, height: 28, alive: true }
}

function createBricks(): Brick[] {
  const blocks: Array<[number, number]> = [
    [48, 72], [64, 72], [80, 72], [144, 72], [160, 72], [224, 72], [240, 72], [304, 72], [320, 72], [336, 72],
    [48, 88], [144, 88], [240, 88], [336, 88],
    [96, 144], [112, 144], [128, 144], [192, 144], [208, 144], [272, 144], [288, 144],
    [32, 208], [48, 208], [112, 208], [128, 208], [144, 208], [240, 208], [256, 208], [272, 208], [336, 208], [352, 208],
    [32, 224], [144, 224], [240, 224], [352, 224],
    [80, 280], [96, 280], [144, 280], [240, 280], [288, 280], [304, 280],
    [160, 344], [160, 360], [160, 376], [224, 344], [224, 360], [224, 376], [176, 344], [208, 344]
  ]
  return blocks.map(([x, y]: [number, number], index: number): Brick => ({ id: index + 1, x, y, width: 16, height: 16 }))
}

function resetGame(): void {
  player = createPlayer()
  base = createBase()
  bricks = createBricks()
  bullets = []
  enemies = []
  pressedKeys = new Set<ControlAction>()
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

function togglePause(): void {
  if (isGameOver.value || isWin.value) return
  isPaused.value = !isPaused.value
  lastFrameAt = null
}

function finishGame(won: boolean = false): boolean {
  if (terminalResult !== null) return false
  terminalResult = won ? 'win' : 'loss'
  isWin.value = won
  isGameOver.value = !won
  isPaused.value = true
  pressedKeys.clear()
  saveHighScore()
  return true
}

function saveHighScore(): void {
  if (score.value <= highScore.value) return
  highScore.value = score.value
  try {
    globalThis.localStorage?.setItem(HIGH_SCORE_KEY, String(highScore.value))
  } catch {
    // Storage may be disabled; the in-memory score still remains visible.
  }
}

function getTankRect(tank: Tank, x: number = tank.x, y: number = tank.y): RectBounds {
  return { x, y, width: tank.width, height: tank.height }
}

function canOccupy(tank: Tank, x: number, y: number, includeEnemies: boolean = false): boolean {
  const next: RectBounds = getTankRect(tank, x, y)
  if (next.x < 0 || next.y < 0 || next.x + next.width > CANVAS_SIZE || next.y + next.height > CANVAS_SIZE) return false
  if (bricks.some((brick: Brick): boolean => rectsOverlap(next, brick))) return false
  if (base.alive && rectsOverlap(next, base)) return false
  if (includeEnemies && enemies.some((enemy: EnemyTank): boolean => enemy !== tank && rectsOverlap(next, enemy))) return false
  return true
}

function movePlayer(deltaSeconds: number): void {
  const directionName: TankDirection | undefined = (['up', 'down', 'left', 'right'] as TankDirection[])
    .find((direction: TankDirection): boolean => pressedKeys.has(direction))
  if (!directionName) return
  const direction: DirectionVector = DIRECTIONS[directionName]
  player.direction = directionName
  const distance: number = player.speed * deltaSeconds
  const nextX: number = player.x + direction.x * distance
  const nextY: number = player.y + direction.y * distance
  if (canOccupy(player, nextX, nextY, true)) {
    player = { ...player, x: nextX, y: nextY }
  }
}

function bulletOrigin(tank: Tank): Pick<RectBounds, 'x' | 'y'> {
  const direction: DirectionVector = DIRECTIONS[tank.direction]
  return {
    x: tank.x + tank.width / 2 - 3 + direction.x * (tank.width / 2 + 1),
    y: tank.y + tank.height / 2 - 3 + direction.y * (tank.height / 2 + 1)
  }
}

function shootPlayer(now: number): void {
  if (isPaused.value || isGameOver.value || isWin.value || now - lastPlayerShotAt < PLAYER_SHOT_COOLDOWN) return
  const origin: Pick<RectBounds, 'x' | 'y'> = bulletOrigin(player)
  const direction: DirectionVector = DIRECTIONS[player.direction]
  bullets = [...bullets, {
    x: origin.x, y: origin.y, width: 6, height: 6,
    vx: direction.x * 255, vy: direction.y * 255, owner: 'player'
  }]
  lastPlayerShotAt = now
}

function chooseAimDirection(enemy: EnemyTank): TankDirection {
  const target: RectBounds = enemy.id % 2 === 0 && base.alive ? base : player
  const dx: number = target.x + target.width / 2 - (enemy.x + enemy.width / 2)
  const dy: number = target.y + target.height / 2 - (enemy.y + enemy.height / 2)
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right'
  return dy < 0 ? 'up' : 'down'
}

function shootEnemy(enemy: EnemyTank, now: number): void {
  const directionName: TankDirection = chooseAimDirection(enemy)
  const direction: DirectionVector = DIRECTIONS[directionName]
  const origin: Pick<RectBounds, 'x' | 'y'> = bulletOrigin({ ...enemy, direction: directionName })
  bullets = [...bullets, {
    x: origin.x, y: origin.y, width: 6, height: 6,
    vx: direction.x * 168, vy: direction.y * 168, owner: 'enemy'
  }]
  enemy.lastShotAt = now
  enemy.nextShotDelay = 1050 + (enemy.id % 4) * 210
}

function spawnEnemy(now: number): void {
  if (spawnedEnemies >= TOTAL_ENEMIES || enemies.length >= MAX_ACTIVE_ENEMIES || now - lastSpawnAt < 850) return
  const spawnXs: number[] = [24, 116, 208, 352]
  const id: number = nextEnemyId++
  const enemy: EnemyTank = {
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

function turnEnemy(enemy: EnemyTank, now: number, forced: boolean = false): void {
  const order: TankDirection[] = ['down', 'left', 'right', 'up']
  const current: number = order.indexOf(enemy.direction)
  enemy.direction = order[(current + enemy.id + (forced ? 1 : 0)) % order.length]
  enemy.lastDirectionAt = now
  enemy.nextTurnDelay = 580 + ((enemy.id + spawnedEnemies) % 5) * 170
}

function updateEnemies(deltaSeconds: number, now: number): void {
  for (const enemy of enemies) {
    if (now - enemy.lastDirectionAt >= enemy.nextTurnDelay) turnEnemy(enemy, now)
    const direction: DirectionVector = DIRECTIONS[enemy.direction]
    const distance: number = enemy.speed * deltaSeconds
    const nextX: number = enemy.x + direction.x * distance
    const nextY: number = enemy.y + direction.y * distance
    if (canOccupy(enemy, nextX, nextY, true) && !rectsOverlap(getTankRect(enemy, nextX, nextY), player)) {
      enemy.x = nextX
      enemy.y = nextY
    } else {
      turnEnemy(enemy, now, true)
    }
    if (now - enemy.lastShotAt >= enemy.nextShotDelay) shootEnemy(enemy, now)
  }
}

function updateBullets(deltaSeconds: number): void {
  bullets = bullets.map((bullet: Bullet): Bullet => ({
    ...bullet,
    x: bullet.x + bullet.vx * deltaSeconds,
    y: bullet.y + bullet.vy * deltaSeconds
  }))

  const removedBullets: Set<number> = new Set<number>()
  const removedBricks: Set<number> = new Set<number>()
  const removedEnemies: Set<number> = new Set<number>()
  let playerHit: boolean = false

  bullets.forEach((bullet: Bullet, bulletIndex: number): void => {
    if (terminalResult !== null) return
    if (bullet.x + bullet.width < 0 || bullet.y + bullet.height < 0 || bullet.x > CANVAS_SIZE || bullet.y > CANVAS_SIZE) {
      removedBullets.add(bulletIndex)
      return
    }

    const brick: Brick | undefined = bricks.find((item: Brick): boolean => !removedBricks.has(item.id) && rectsOverlap(bullet, item))
    if (brick) {
      removedBricks.add(brick.id)
      removedBullets.add(bulletIndex)
      return
    }

    if (bullet.owner === 'player') {
      const enemy: EnemyTank | undefined = enemies.find((item: EnemyTank): boolean => !removedEnemies.has(item.id) && rectsOverlap(bullet, item))
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

  bullets = bullets.filter((_: Bullet, index: number): boolean => !removedBullets.has(index))
  bricks = bricks.filter((brick: Brick): boolean => !removedBricks.has(brick.id))
  if (removedEnemies.size && terminalResult === null) {
    enemies = enemies.filter((enemy: EnemyTank): boolean => !removedEnemies.has(enemy.id))
    defeatedEnemies += removedEnemies.size
    score.value += removedEnemies.size * 100
    remainingEnemies.value = Math.max(0, TOTAL_ENEMIES - defeatedEnemies)
    saveHighScore()
    if (defeatedEnemies >= TOTAL_ENEMIES) finishGame(true)
  }
}

function update(deltaSeconds: number, now: number): void {
  movePlayer(deltaSeconds)
  if (pressedKeys.has('fire')) shootPlayer(now)
  spawnEnemy(now)
  updateEnemies(deltaSeconds, now)
  updateBullets(deltaSeconds)
}

function gameLoop(now: number): void {
  if (lastFrameAt === null) lastFrameAt = now
  const deltaSeconds: number = Math.min((now - lastFrameAt) / 1000, 0.032)
  lastFrameAt = now
  if (!isPaused.value && terminalResult === null) {
    gameTime += deltaSeconds * 1000
    update(deltaSeconds, gameTime)
  }
  draw()
  animationFrameId = requestAnimationFrame(gameLoop)
}

function drawTank(ctx: CanvasRenderingContext2D, tank: Tank, color: string, accent: string): void {
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
  const directionVector: DirectionVector = DIRECTIONS[direction]
  const centerX: number = x + width / 2
  const centerY: number = y + height / 2
  if (directionVector.x) ctx.fillRect(directionVector.x < 0 ? x - 4 : centerX, centerY - 2, width / 2 + 4, 4)
  else ctx.fillRect(centerX - 2, directionVector.y < 0 ? y - 4 : centerY, 4, height / 2 + 4)
}

function drawBrick(ctx: CanvasRenderingContext2D, brick: Brick): void {
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

function drawBase(ctx: CanvasRenderingContext2D): void {
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

function drawOverlay(ctx: CanvasRenderingContext2D): void {
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

function draw(): void {
  const ctx: CanvasRenderingContext2D | null = canvasRef.value?.getContext('2d') || null
  if (!ctx) return
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  ctx.fillStyle = '#191b18'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  ctx.fillStyle = '#20241f'
  for (let y = 0; y < CANVAS_SIZE; y += 16) {
    for (let x = (y / 16) % 2 * 8; x < CANVAS_SIZE; x += 16) ctx.fillRect(x, y, 2, 2)
  }
  bricks.forEach((brick: Brick): void => drawBrick(ctx, brick))
  drawBase(ctx)
  if (lives.value > 0) drawTank(ctx, player, '#f5d442', '#fff1a6')
  enemies.forEach((enemy: EnemyTank): void => drawTank(ctx, enemy, '#d84b3e', '#ff9b62'))
  ctx.fillStyle = '#fff6b7'
  bullets.forEach((bullet: Bullet): void => ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height))

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

function keyToAction(event: KeyboardEvent): ControlAction | null {
  const key: string = event.key.toLowerCase()
  if (key === 'arrowup' || key === 'w') return 'up'
  if (key === 'arrowdown' || key === 's') return 'down'
  if (key === 'arrowleft' || key === 'a') return 'left'
  if (key === 'arrowright' || key === 'd') return 'right'
  if (event.code === 'Space' || key === ' ') return 'fire'
  return null
}

function handleKeydown(event: KeyboardEvent): void {
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

function handleKeyup(event: KeyboardEvent): void {
  const action: ControlAction | null = keyToAction(event)
  if (!action) return
  event.preventDefault()
  pressedKeys.delete(action)
}

function releaseControls(): void {
  pressedKeys.clear()
}

function handleVisibilityChange(): void {
  lastFrameAt = null
  if (document.hidden) releaseControls()
}

function pressControl(action: ControlAction, event?: Event): void {
  event?.preventDefault()
  if (isPaused.value || isGameOver.value || isWin.value) return
  pressedKeys.add(action)
  if (action === 'fire') shootPlayer(gameTime)
}

function releaseControl(action: ControlAction, event?: Event): void {
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
          v-for="control in controlButtons"
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

<style scoped lang="scss" src="./css/BattleCityGame.scss"></style>
