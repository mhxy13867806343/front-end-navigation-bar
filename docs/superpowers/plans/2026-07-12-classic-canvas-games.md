# Classic Canvas Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four responsive, dependency-free Vue Canvas games—90 Tank, Brick Breaker, Flappy Bird, and Space Shooter—to the existing HooksVue works dialog.

**Architecture:** Each game is an isolated Vue SFC with fixed logical Canvas coordinates, its own requestAnimationFrame loop, keyboard/touch controls, and localStorage high score. A small pure JavaScript helper module owns reusable collision and score parsing logic; `App.vue` and `onlineWorksList` provide the existing dialog integration.

**Tech Stack:** Vue 3 Composition API, Canvas 2D, requestAnimationFrame, Node.js built-in test runner, Vite 4.

## Global Constraints

- Create `BattleCityGame.vue`, `BrickBreakerGame.vue`, `FlappyBirdGame.vue`, and `SpaceShooterGame.vue` under `src/components/games/`.
- Do not add npm dependencies or remote image/audio assets.
- Use fixed logical Canvas coordinates and CSS responsive scaling.
- Support keyboard and visible touch controls in every game.
- Remove global keyboard listeners and cancel animation frames during component unmount.
- Save each game's high score under a unique localStorage key; invalid stored values fall back to `0`.
- Add exactly four unique `onlineWorksList` entries and matching `openGame` cases without modifying existing games.
- Preserve all unrelated uncommitted user changes; stage only task-specific hunks.

---

### Task 1: Shared game logic utilities

**Files:**
- Create: `src/components/games/gameUtils.js`
- Create: `scripts/classic-games.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces `rectsOverlap(a, b): boolean`, `circleRectCollision(circle, rect): boolean`, `readHighScore(key, storage = globalThis.localStorage): number`, and npm script `test:games`.
- Consumers: all four game components and Task 6 integration checks.

- [ ] **Step 1: Write failing Node tests**

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { circleRectCollision, readHighScore, rectsOverlap } from '../src/components/games/gameUtils.js'

test('rectsOverlap handles overlap and separated edges', () => {
  assert.equal(rectsOverlap({ x: 0, y: 0, width: 10, height: 10 }, { x: 9, y: 9, width: 4, height: 4 }), true)
  assert.equal(rectsOverlap({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 0, width: 4, height: 4 }), false)
})

test('circleRectCollision detects the nearest rectangle point', () => {
  assert.equal(circleRectCollision({ x: 8, y: 8, radius: 3 }, { x: 10, y: 10, width: 8, height: 8 }), true)
  assert.equal(circleRectCollision({ x: 2, y: 2, radius: 2 }, { x: 10, y: 10, width: 8, height: 8 }), false)
})

test('readHighScore accepts non-negative finite values only', () => {
  assert.equal(readHighScore('score', { getItem: () => '42' }), 42)
  assert.equal(readHighScore('score', { getItem: () => 'NaN' }), 0)
  assert.equal(readHighScore('score', { getItem: () => '-5' }), 0)
  assert.equal(readHighScore('score', { getItem: () => { throw new Error('blocked') } }), 0)
})
```

- [ ] **Step 2: Run RED**

Run: `node --test scripts/classic-games.test.mjs`

Expected: FAIL because `gameUtils.js` does not exist.

- [ ] **Step 3: Implement the utilities**

```js
export const rectsOverlap = (a, b) => (
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y
)

export const circleRectCollision = (circle, rect) => {
  const nearestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width))
  const nearestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height))
  return (circle.x - nearestX) ** 2 + (circle.y - nearestY) ** 2 <= circle.radius ** 2
}

export const readHighScore = (key, storage = globalThis.localStorage) => {
  try {
    const value = Number(storage?.getItem(key))
    return Number.isFinite(value) && value >= 0 ? value : 0
  } catch {
    return 0
  }
}
```

Add to `package.json`:

```json
"test:games": "node --test scripts/classic-games.test.mjs"
```

- [ ] **Step 4: Run GREEN and commit**

Run: `npm run test:games`

Expected: 3 tests pass, 0 fail.

Commit: `test: add classic game logic coverage`

### Task 2: 90 Tank game

**Files:**
- Create: `src/components/games/BattleCityGame.vue`

**Interfaces:**
- Consumes `rectsOverlap` and `readHighScore` from `gameUtils.js`.
- Produces a Vue component selected by integration type `battlecity`.

- [ ] **Step 1: Implement deterministic game state**

Use a 400×400 logical canvas. Define state for player tank, base, brick rectangles, bullets, enemies, score, remaining enemies, lives, pause, win, game over, pressed keys, spawn timestamps, and animation frame ID. `resetGame()` must replace every entity array and timestamp, not mutate stale objects.

- [ ] **Step 2: Implement update and collision rules**

Move the player in four directions while blocking map edges and bricks; spawn one player bullet per 220 ms; cap active enemies at four; spawn up to twelve per game; move enemies on timed direction changes and fire toward the player/base. Resolve bullets against bounds, bricks, tanks and base once per frame. Award 100 points per enemy and win after twelve kills.

- [ ] **Step 3: Draw and expose controls**

Draw pixel-style ground, brick walls, eagle/base, player/enemy tanks, bullets and HUD. Add overlay buttons for start/pause, restart, four touch directions and fire. Keyboard: arrows/WASD, Space, P. Use pointerdown/pointerup for held movement controls.

- [ ] **Step 4: Verify lifecycle and commit**

Confirm `onMounted` registers input and starts one RAF loop; `onUnmounted` removes listeners and cancels the frame. Commit: `feat: add 90 tank canvas game`.

### Task 3: Brick Breaker game

**Files:**
- Create: `src/components/games/BrickBreakerGame.vue`

**Interfaces:**
- Consumes `circleRectCollision` and `readHighScore`.
- Produces a Vue component selected by integration type `brickbreaker`.

- [ ] **Step 1: Implement state and physics**

Use a 400×440 canvas, an 84×12 paddle, an 8 px ball, six rows by eight columns of bricks, three lives and fixed-step delta clamped to 32 ms. Reflect the ball from walls, paddle and the first colliding live brick; vary horizontal velocity from paddle hit position.

- [ ] **Step 2: Implement progression and UI**

Award 10 points per brick, increase speed after each cleared row threshold, win when all bricks are gone, and reset the ball after losing a life. Provide keyboard/touch left-right controls, Space launch/pause, restart and high-score display.

- [ ] **Step 3: Verify lifecycle and commit**

Ensure only one hit is counted per brick, off-screen balls cannot continue updating, and RAF/listeners clean up. Commit: `feat: add brick breaker canvas game`.

### Task 4: Flappy Bird game

**Files:**
- Create: `src/components/games/FlappyBirdGame.vue`

**Interfaces:**
- Consumes `circleRectCollision` and `readHighScore`.
- Produces a Vue component selected by integration type `flappybird`.

- [ ] **Step 1: Implement state and obstacle generation**

Use a 400×520 canvas. Model the bird as a circle, gravity at 980 logical px/s² and flap velocity at -330 px/s. Spawn pipe pairs every 1.45 seconds with a 142 px gap clamped inside safe top/bottom margins; remove pipes after they leave the screen.

- [ ] **Step 2: Implement scoring, collision and UI**

Score once when a pipe pair passes the bird. End on pipe, ceiling or ground collision. Space, canvas click and a visible flap button all call the same `flap()` action. Include start, paused/game-over overlay, restart and high score.

- [ ] **Step 3: Verify lifecycle and commit**

Ensure clicking overlay controls does not double-trigger canvas flap, reset clears pipes and timestamps, and RAF/listeners clean up. Commit: `feat: add flappy bird canvas game`.

### Task 5: Space Shooter game

**Files:**
- Create: `src/components/games/SpaceShooterGame.vue`

**Interfaces:**
- Consumes `rectsOverlap` and `readHighScore`.
- Produces a Vue component selected by integration type `spaceshooter`.

- [ ] **Step 1: Implement state, waves and shooting**

Use a 400×520 canvas. Player moves within the lower 45% of the field; Space fires with a 170 ms cooldown. Spawn enemies at a difficulty-adjusted interval, give advanced enemies two hit points after score 800, and periodically fire aimed enemy bullets.

- [ ] **Step 2: Implement collision, difficulty and UI**

Remove off-screen bullets/enemies. Award points on enemy defeat; subtract one of three lives on enemy or enemy-bullet contact and give a 900 ms invulnerability window. Increase spawn rate and fall speed by score bands. Add keyboard/touch movement, fire, pause, restart and high score.

- [ ] **Step 3: Verify lifecycle and commit**

Ensure one collision cannot subtract multiple lives, invulnerable frames render visibly, reset clears all arrays/timers, and RAF/listeners clean up. Commit: `feat: add space shooter canvas game`.

### Task 6: Integrate, validate and playtest

**Files:**
- Modify: `src/App.vue`
- Modify: `src/utlis/menuItems.js`
- Modify: `scripts/classic-games.test.mjs`

**Interfaces:**
- Consumes the four new components.
- Produces four works entries with types `battlecity`, `brickbreaker`, `flappybird`, `spaceshooter` and corresponding `openGame` cases.

- [ ] **Step 1: Extend failing integration tests**

Read `menuItems.js` and `App.vue` as text. Assert all four types occur once in `onlineWorksList`, each work has `component: 'dialog'`, and App contains each import and matching `case` assignment. Run `npm run test:games`; expected FAIL before integration.

- [ ] **Step 2: Add imports, cases and works entries**

Add the four imports next to existing game imports. Add four `openGame` cases without changing existing cases. Append works entries named `90坦克大战`, `经典打砖块`, `飞翔小鸟`, and `太空战机`, each with a concise Chinese description and distinct emoji.

- [ ] **Step 3: Run automated verification**

Run: `npm run test:games && npm run test:navigation && npm run test:mcp && npm run validate:mcp && npm run build`.

Expected: all Node tests pass; MCP validation passes; Vite exits 0. Record existing chunk-size/dynamic-import warnings separately.

- [ ] **Step 4: Browser smoke test**

Start `npm run dev -- --host 127.0.0.1`. Open the works menu and test each game: launch, keyboard action, visible touch action, pause, restart, resize to mobile width, close dialog, reopen. Confirm no duplicate key handling or continued score updates after close.

- [ ] **Step 5: Commit integration only**

Stage only the four App/menu integration hunks and updated test. Preserve unrelated user changes. Commit: `feat: integrate classic canvas games`.
