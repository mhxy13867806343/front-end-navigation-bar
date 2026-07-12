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
