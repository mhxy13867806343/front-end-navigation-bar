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
