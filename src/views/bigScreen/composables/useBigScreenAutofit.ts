import type { Ref } from 'vue'
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import autofit from 'autofit.js'

export const BIG_SCREEN_ROOT_ID = '#big-screen-shell'

export const useBigScreenAutofit = (enabled: Ref<boolean>): void => {
  let initialized = false

  const startAutofit = async (): Promise<void> => {
    if (initialized) return
    await nextTick()
    document.body.classList.add('big-screen-mode')
    autofit.init({
      el: BIG_SCREEN_ROOT_ID,
      dw: 1920,
      dh: 1080,
      resize: true,
      transition: 0.2
    }, false)
    initialized = true
  }

  const stopAutofit = (): void => {
    document.body.classList.remove('big-screen-mode')
    initialized = false
  }

  onMounted((): void => {
    void (enabled.value ? startAutofit() : Promise.resolve())
    watch(enabled, (value: boolean): void => {
      if (value) {
        void startAutofit()
        return
      }
      stopAutofit()
    }, { immediate: false })
  })

  onUnmounted((): void => {
    stopAutofit()
  })
}
