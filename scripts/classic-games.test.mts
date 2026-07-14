import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { circleRectCollision, readHighScore, rectsOverlap } from '../src/components/games/gameUtils.ts'

const [onlineWorksSource, componentMapperSource] = await Promise.all([
  readFile(new URL('../src/utlis/menu/others.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/utils/componentMapper.ts', import.meta.url), 'utf8'),
])

const classicGames = [
  { type: 'battlecity', component: 'BattleCityGame' },
  { type: 'brickbreaker', component: 'BrickBreakerGame' },
  { type: 'flappybird', component: 'FlappyBirdGame' },
  { type: 'spaceshooter', component: 'SpaceShooterGame' },
]

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

test('online works integrates every classic canvas game as a dialog', () => {
  for (const { type } of classicGames) {
    const typeMatches = onlineWorksSource.match(new RegExp(`(?:type|["']type["'])\\s*:\\s*["']${type}["']`, 'g')) ?? []
    assert.equal(typeMatches.length, 1, `${type} should occur exactly once in onlineWorksList`)

    const workEntry = new RegExp(
      `\\{[^{}]*(?:component|["']component["'])\\s*:\\s*["']dialog["'][^{}]*(?:type|["']type["'])\\s*:\\s*["']${type}["'][^{}]*\\}`,
      's',
    )
    assert.match(onlineWorksSource, workEntry, `${type} should use the dialog component`)
  }
})

test('component mapper imports and assigns every classic canvas game', () => {
  for (const { type, component } of classicGames) {
    assert.match(
      componentMapperSource,
      new RegExp(`import\\s+${component}\\s+from\\s+["']\\.\\./components/games/${component}\\.vue["']`),
      `${component} import is required`,
    )
    assert.match(
      componentMapperSource,
      new RegExp(`${type}:\\s*${component}`),
      `${type} should map to ${component}`,
    )
  }
})
