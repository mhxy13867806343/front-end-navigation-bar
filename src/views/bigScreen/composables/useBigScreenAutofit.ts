import type { Ref } from 'vue'
import { nextTick, onMounted, onUnmounted } from 'vue'
import autofit from 'autofit.js'

export const BIG_SCREEN_ROOT_ID = '#big-screen-shell'

export const useBigScreenAutofit = (enabled: Ref<boolean>): void => {
  const startAutofit = async (): Promise<void> => {
    await nextTick()
    if (!enabled.value) return
    document.body.classList.add('big-screen-mode')
    autofit.init({
      el: BIG_SCREEN_ROOT_ID,
      dw: 1920,
      dh: 1080,
      resize: true,
      transition: 0.2
    }, false)
  }

  const cleanupAutofit = (): void => {
    document.body.classList.remove('big-screen-mode')
  }

  onMounted((): void => {
    void startAutofit()
  })

  onUnmounted((): void => {
    cleanupAutofit()
  })
}
