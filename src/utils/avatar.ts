/**
 * 全局默认头像 SVG 占位图与图片加载失败 Fallback 处理函数
 */
export const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2345b7d1"><circle cx="50" cy="38" r="24"/><path d="M12 90c0-22 17-38 38-38s38 16 38 38z"/></svg>'

export function handleAvatarImgError(e: Event): void {
  const target = e.target as HTMLImageElement | null
  if (target) {
    target.src = DEFAULT_AVATAR
  }
}
