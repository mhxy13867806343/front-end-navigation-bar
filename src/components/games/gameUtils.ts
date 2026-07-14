export interface RectBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface CircleBounds {
  x: number
  y: number
  radius: number
}

export interface ScoreStorage {
  getItem(key: string): string | null
}

export const rectsOverlap = (a: RectBounds, b: RectBounds): boolean => (
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y
)

export const circleRectCollision = (circle: CircleBounds, rect: RectBounds): boolean => {
  const nearestX: number = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width))
  const nearestY: number = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height))
  return (circle.x - nearestX) ** 2 + (circle.y - nearestY) ** 2 <= circle.radius ** 2
}

export const readHighScore = (key: string, storage: ScoreStorage = globalThis.localStorage): number => {
  try {
    const value: number = Number(storage?.getItem(key))
    return Number.isFinite(value) && value >= 0 ? value : 0
  } catch {
    return 0
  }
}
