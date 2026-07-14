import type { Ref } from 'vue'

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: {
    platform?: string
  }
}

interface UseSystemInfoReturn {
  currentTime: Ref<string>
  currentDate: Ref<string>
  userOS: Ref<string>
  userTimezone: Ref<string>
  userLanguage: Ref<string>
  detectSystemInfo: () => void
  updateTime: () => void
}

export function useSystemInfo(): UseSystemInfoReturn {
  const currentTime = ref<string>('')
  const currentDate = ref<string>('')
  const userOS = ref<string>('未知')
  const userTimezone = ref<string>('未知')
  const userLanguage = ref<string>('未知')

  const detectSystemInfo = (): void => {
    let osName: string = 'Unknown'
    const typedNavigator: NavigatorWithUserAgentData = navigator as NavigatorWithUserAgentData
    const ua: string = navigator.userAgent.toLowerCase()
    const platform: string = (navigator.platform || typedNavigator.userAgentData?.platform || '').toLowerCase()
    
    if (ua.includes('win')) {
      osName = 'Windows'
    } else if (ua.includes('mac') || platform.includes('mac')) {
      osName = 'macOS'
      try {
        const canvas: HTMLCanvasElement = document.createElement('canvas')
        const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
        if (gl) {
          const debugInfo: WEBGL_debug_renderer_info | null = gl.getExtension('WEBGL_debug_renderer_info')
          if (debugInfo) {
            const rendererName: string = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
            if (rendererName.includes('Apple') || rendererName.includes('M1') || rendererName.includes('M2') || rendererName.includes('M3') || rendererName.includes('Silicon')) {
              osName = 'macOS (Apple Silicon)'
            } else {
              osName = 'macOS (Intel)'
            }
          }
        }
      } catch (_e: unknown) {}
    } else if (ua.includes('linux')) {
      osName = 'Linux'
    } else if (ua.includes('android')) {
      osName = 'Android'
    } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
      osName = 'iOS'
    }
    userOS.value = osName

    try {
      const tz: string = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
      const offsetMin: number = new Date().getTimezoneOffset()
      const offsetHr: number = -offsetMin / 60
      const offsetStr: string = offsetHr >= 0 ? `+${offsetHr}` : `${offsetHr}`
      userTimezone.value = `${tz} (UTC${offsetStr})`
    } catch (_e: unknown) {
      userTimezone.value = 'UTC+8'
    }

    const lang: string = navigator.language || 'zh-CN'
    let langDisplay: string = lang
    if (lang.toLowerCase().startsWith('zh-cn')) {
      langDisplay = '简体中文 (zh-CN)'
    } else if (lang.toLowerCase().startsWith('zh-tw') || lang.toLowerCase().startsWith('zh-hk')) {
      langDisplay = '繁体中文 (zh-TW)'
    } else if (lang.toLowerCase().startsWith('en')) {
      langDisplay = 'English (en)'
    } else if (lang.toLowerCase().startsWith('ja')) {
      langDisplay = '日本語 (ja)'
    } else if (lang.toLowerCase().startsWith('ko')) {
      langDisplay = '한국어 (ko)'
    }
    userLanguage.value = langDisplay
  }

  const updateTime = (): void => {
    const now: Date = new Date()
    const year: number = now.getFullYear()
    const month: string = String(now.getMonth() + 1).padStart(2, '0')
    const date: string = String(now.getDate()).padStart(2, '0')
    const hours: string = String(now.getHours()).padStart(2, '0')
    const minutes: string = String(now.getMinutes()).padStart(2, '0')
    const seconds: string = String(now.getSeconds()).padStart(2, '0')
    currentTime.value = `${hours}:${minutes}:${seconds}`
    currentDate.value = `${year}-${month}-${date}`
  }

  return {
    currentTime,
    currentDate,
    userOS,
    userTimezone,
    userLanguage,
    detectSystemInfo,
    updateTime
  }
}
