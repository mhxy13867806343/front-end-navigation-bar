<script setup lang="ts">

import { circleRectCollision, readHighScore } from './gameUtils.ts'
import type { CircleBounds, RectBounds } from './gameUtils.ts'

type GamePhase = 'ready' | 'playing' | 'paused' | 'gameover'

interface Bird extends CircleBounds {
  velocityY: number
}

interface PipePair {
  id: number
  x: number
  gapTop: number
  gapBottom: number
  scored: boolean
}

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 520
const GROUND_Y = 486
const BIRD_X = 96
const BIRD_RADIUS = 13
const GRAVITY = 980
const FLAP_VELOCITY = -330
const PIPE_WIDTH = 62
const PIPE_CAP_HEIGHT = 22
const PIPE_CAP_OVERHANG = 5
const PIPE_GAP = 142
const PIPE_SPEED = 150
const PIPE_SPAWN_SECONDS = 1.45
const SAFE_TOP = 58
const SAFE_BOTTOM = 56
const FIXED_STEP_SECONDS = 1 / 120
const MAX_WALL_DELTA_SECONDS = 0.25
const MAX_STEPS_PER_FRAME = 30
const HIGH_SCORE_KEY = 'flappybird_high_score'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const score = ref<number>(0)
const highScore = ref<number>(readHighScore(HIGH_SCORE_KEY))
const phase = ref<GamePhase>('ready')

let bird = createBird()
let pipes: PipePair[] = []
let nextPipeId: number = 1
let spawnElapsed: number = 0
let lastFrameAt: number | null = null
let accumulator: number = 0
let animationFrameId: number | null = null

function createBird(): Bird {
  return { x: BIRD_X, y: CANVAS_HEIGHT / 2, radius: BIRD_RADIUS, velocityY: 0 }
}

function createPipePair(): PipePair {
  const minGapTop: number = SAFE_TOP
  const maxGapTop: number = GROUND_Y - SAFE_BOTTOM - PIPE_GAP
  const gapTop: number = minGapTop + Math.random() * (maxGapTop - minGapTop)
  return {
    id: nextPipeId++,
    x: CANVAS_WIDTH + 8,
    gapTop,
    gapBottom: gapTop + PIPE_GAP,
    scored: false
  }
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

function clearFrameTiming(): void {
  lastFrameAt = null
  accumulator = 0
}

function resetGame(): void {
  bird = createBird()
  pipes = []
  nextPipeId = 1
  spawnElapsed = 0
  score.value = 0
  phase.value = 'ready'
  clearFrameTiming()
  draw()
}

function restartGame(event?: Event): void {
  event?.stopPropagation()
  resetGame()
  flap()
}

function flap(): void {
  if (phase.value === 'gameover') return
  if (phase.value === 'ready' || phase.value === 'paused') {
    phase.value = 'playing'
    clearFrameTiming()
  }
  bird.velocityY = FLAP_VELOCITY
}

function togglePause(event?: Event): void {
  event?.stopPropagation()
  if (phase.value === 'playing') phase.value = 'paused'
  else if (phase.value === 'paused') phase.value = 'playing'
  else return
  clearFrameTiming()
}

function finishGame(): void {
  if (phase.value === 'gameover') return
  phase.value = 'gameover'
  clearFrameTiming()
  saveHighScore()
}

function pipeVisibleRight(pipe: PipePair): number {
  return pipe.x + PIPE_WIDTH + PIPE_CAP_OVERHANG
}

function pipeRectangles(pipe: PipePair): RectBounds[] {
  return [
    { x: pipe.x, y: 0, width: PIPE_WIDTH, height: pipe.gapTop - PIPE_CAP_HEIGHT },
    {
      x: pipe.x - PIPE_CAP_OVERHANG,
      y: pipe.gapTop - PIPE_CAP_HEIGHT,
      width: PIPE_WIDTH + PIPE_CAP_OVERHANG * 2,
      height: PIPE_CAP_HEIGHT
    },
    {
      x: pipe.x - PIPE_CAP_OVERHANG,
      y: pipe.gapBottom,
      width: PIPE_WIDTH + PIPE_CAP_OVERHANG * 2,
      height: PIPE_CAP_HEIGHT
    },
    {
      x: pipe.x,
      y: pipe.gapBottom + PIPE_CAP_HEIGHT,
      width: PIPE_WIDTH,
      height: GROUND_Y - pipe.gapBottom - PIPE_CAP_HEIGHT
    }
  ]
}

function update(deltaSeconds: number): void {
  bird.velocityY += GRAVITY * deltaSeconds
  bird.y += bird.velocityY * deltaSeconds

  spawnElapsed += deltaSeconds
  while (spawnElapsed >= PIPE_SPAWN_SECONDS) {
    spawnElapsed -= PIPE_SPAWN_SECONDS
    pipes.push(createPipePair())
  }

  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED * deltaSeconds
    if (!pipe.scored && pipeVisibleRight(pipe) < bird.x) {
      pipe.scored = true
      score.value += 1
      saveHighScore()
    }
  }
  pipes = pipes.filter((pipe: PipePair): boolean => pipeVisibleRight(pipe) >= 0)

  if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= GROUND_Y) {
    finishGame()
    return
  }

  if (pipes.some((pipe: PipePair): boolean => pipeRectangles(pipe).some((rect: RectBounds): boolean => circleRectCollision(bird, rect)))) {
    finishGame()
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1): void {
  ctx.beginPath()
  ctx.arc(x, y, 13 * scale, 0, Math.PI * 2)
  ctx.arc(x + 18 * scale, y - 7 * scale, 17 * scale, 0, Math.PI * 2)
  ctx.arc(x + 38 * scale, y, 13 * scale, 0, Math.PI * 2)
  ctx.fill()
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  const sky: CanvasGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
  sky.addColorStop(0, '#72d8ec')
  sky.addColorStop(1, '#d8f5e5')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
  drawCloud(ctx, 35, 86, 0.85)
  drawCloud(ctx, 275, 145, 1.05)
  drawCloud(ctx, 168, 55, 0.58)

  ctx.fillStyle = '#89d7a8'
  for (let x = -16; x < CANVAS_WIDTH; x += 48) {
    ctx.beginPath()
    ctx.arc(x, GROUND_Y + 5, 42, Math.PI, Math.PI * 2)
    ctx.fill()
  }
}

function drawPipe(ctx: CanvasRenderingContext2D, pipe: PipePair): void {
  const gradient: CanvasGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0)
  gradient.addColorStop(0, '#62c94d')
  gradient.addColorStop(0.48, '#b4ef65')
  gradient.addColorStop(1, '#2f913b')
  ctx.fillStyle = gradient
  ctx.strokeStyle = '#236f35'
  ctx.lineWidth = 3

  ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapTop - PIPE_CAP_HEIGHT)
  ctx.strokeRect(pipe.x + 1.5, -2, PIPE_WIDTH - 3, pipe.gapTop - PIPE_CAP_HEIGHT + 2)
  ctx.fillRect(pipe.x - PIPE_CAP_OVERHANG, pipe.gapTop - PIPE_CAP_HEIGHT, PIPE_WIDTH + PIPE_CAP_OVERHANG * 2, PIPE_CAP_HEIGHT)
  ctx.strokeRect(pipe.x - PIPE_CAP_OVERHANG + 1.5, pipe.gapTop - PIPE_CAP_HEIGHT + 1.5, PIPE_WIDTH + PIPE_CAP_OVERHANG * 2 - 3, PIPE_CAP_HEIGHT - 3)

  ctx.fillRect(pipe.x - PIPE_CAP_OVERHANG, pipe.gapBottom, PIPE_WIDTH + PIPE_CAP_OVERHANG * 2, PIPE_CAP_HEIGHT)
  ctx.strokeRect(pipe.x - PIPE_CAP_OVERHANG + 1.5, pipe.gapBottom + 1.5, PIPE_WIDTH + PIPE_CAP_OVERHANG * 2 - 3, PIPE_CAP_HEIGHT - 3)
  ctx.fillRect(pipe.x, pipe.gapBottom + PIPE_CAP_HEIGHT, PIPE_WIDTH, GROUND_Y - pipe.gapBottom - PIPE_CAP_HEIGHT)
  ctx.strokeRect(pipe.x + 1.5, pipe.gapBottom + PIPE_CAP_HEIGHT, PIPE_WIDTH - 3, GROUND_Y - pipe.gapBottom - PIPE_CAP_HEIGHT + 2)
}

function drawBird(ctx: CanvasRenderingContext2D): void {
  const tilt: number = Math.max(-0.45, Math.min(0.8, bird.velocityY / 440))
  ctx.save()
  ctx.translate(bird.x, bird.y)
  ctx.rotate(tilt)

  ctx.beginPath()
  ctx.ellipse(-6, 4, 10, 7, -0.35, 0, Math.PI * 2)
  ctx.fillStyle = '#f1a52d'
  ctx.fill()
  ctx.strokeStyle = '#9d5b1e'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, 0, bird.radius, 0, Math.PI * 2)
  ctx.fillStyle = '#ffdd4f'
  ctx.fill()
  ctx.strokeStyle = '#9d5b1e'
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(7, -5, 5, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(9, -5, 2, 0, Math.PI * 2)
  ctx.fillStyle = '#263238'
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(10, 2)
  ctx.lineTo(23, 6)
  ctx.lineTo(10, 9)
  ctx.closePath()
  ctx.fillStyle = '#f0673d'
  ctx.fill()
  ctx.strokeStyle = '#9d3c2c'
  ctx.stroke()
  ctx.restore()
}

function drawGround(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#d9bd62'
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y)
  ctx.fillStyle = '#79be43'
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 8)
  ctx.fillStyle = '#a8df57'
  for (let x = -8; x < CANVAS_WIDTH; x += 22) {
    ctx.beginPath()
    ctx.moveTo(x, GROUND_Y + 8)
    ctx.lineTo(x + 11, GROUND_Y)
    ctx.lineTo(x + 20, GROUND_Y)
    ctx.lineTo(x + 9, GROUND_Y + 8)
    ctx.closePath()
    ctx.fill()
  }
}

function drawHud(ctx: CanvasRenderingContext2D): void {
  ctx.textAlign = 'center'
  ctx.lineJoin = 'round'
  ctx.font = '900 42px ui-rounded, system-ui, sans-serif'
  ctx.lineWidth = 7
  ctx.strokeStyle = 'rgba(26, 72, 82, 0.55)'
  ctx.strokeText(String(score.value), CANVAS_WIDTH / 2, 58)
  ctx.fillStyle = '#fff'
  ctx.fillText(String(score.value), CANVAS_WIDTH / 2, 58)
  ctx.textAlign = 'start'
}

function draw(): void {
  const ctx = canvasRef.value?.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  drawBackground(ctx)
  pipes.forEach((pipe: PipePair): void => drawPipe(ctx, pipe))
  drawGround(ctx)
  drawBird(ctx)
  drawHud(ctx)
}

function gameLoop(now: number): void {
  if (lastFrameAt === null) lastFrameAt = now
  const wallDeltaSeconds = Math.min(Math.max(0, (now - lastFrameAt) / 1000), MAX_WALL_DELTA_SECONDS)
  lastFrameAt = now
  if (phase.value === 'playing') {
    accumulator += wallDeltaSeconds
    let steps = 0
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

function handleKeydown(event: KeyboardEvent): void {
  if (event.code !== 'Space' && event.key !== ' ') return
  event.preventDefault()
  if (!event.repeat) flap()
}

function handleVisibilityChange(): void {
  if (document.hidden && phase.value === 'playing') phase.value = 'paused'
  clearFrameTiming()
}

onMounted(() => {
  resetGame()
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  animationFrameId = requestAnimationFrame(gameLoop)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
  animationFrameId = null
  clearFrameTiming()
})
</script>

<template>
  <section class="flappy-bird" aria-label="Flappy Bird 游戏">
    <div class="status-row" aria-live="polite">
      <span>得分 {{ score }}</span>
      <span>最高 {{ highScore }}</span>
    </div>

    <div class="canvas-shell">
      <canvas
        ref="canvasRef"
        :width="CANVAS_WIDTH"
        :height="CANVAS_HEIGHT"
        aria-label="Flappy Bird 游戏区域，点击扇动翅膀"
        @click="flap"
      ></canvas>

      <div v-if="phase !== 'playing'" class="overlay" @click.stop>
        <div class="overlay-card">
          <p class="eyebrow">FLAPPY BIRD</p>
          <h2>{{ phase === 'gameover' ? '游戏结束' : phase === 'paused' ? '游戏暂停' : '准备起飞' }}</h2>
          <p v-if="phase === 'gameover'">本局得分 {{ score }} · 最高 {{ highScore }}</p>
          <p v-else>{{ phase === 'paused' ? '点击继续并扇动翅膀' : '穿过管道，坚持飞行' }}</p>
          <button v-if="phase === 'gameover'" type="button" @click.stop="restartGame">重新开始</button>
          <button v-else type="button" @click.stop="flap">
            {{ phase === 'paused' ? '继续游戏' : '开始游戏' }}
          </button>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="flap-button" type="button" :disabled="phase === 'gameover'" @click.stop="flap">
        ▲ 扇动翅膀
      </button>
      <button type="button" :disabled="phase === 'ready' || phase === 'gameover'" @click.stop="togglePause">
        {{ phase === 'paused' ? '继续' : '暂停' }}
      </button>
      <button type="button" @click.stop="restartGame">重开</button>
    </div>

    <p class="help">空格 / 点击画布 / 扇动按钮 · 穿过管道得 1 分</p>
  </section>
</template>

<style scoped lang="scss" src="./css/FlappyBirdGame.scss"></style>
