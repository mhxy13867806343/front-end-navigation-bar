import { ref } from 'vue'

export function useSystemInfo() {
  const currentTime = ref('')
  const currentDate = ref('')
  const userOS = ref('未知')
  const userTimezone = ref('未知')
  const userLanguage = ref('未知')

  const detectSystemInfo = () => {
    let osName = 'Unknown'
    const ua = navigator.userAgent.toLowerCase()
    const platform = (navigator.platform || navigator.userAgentData?.platform || '').toLowerCase()
    
    if (ua.includes('win')) {
      osName = 'Windows'
    } else if (ua.includes('mac') || platform.includes('mac')) {
      osName = 'macOS'
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
          if (debugInfo) {
            const rendererName = gl.getParameter(debugInfo.UNMASKED_RENDERER_STRING) || ''
            if (rendererName.includes('Apple') || rendererName.includes('M1') || rendererName.includes('M2') || rendererName.includes('M3') || rendererName.includes('Silicon')) {
              osName = 'macOS (Apple Silicon)'
            } else {
              osName = 'macOS (Intel)'
            }
          }
        }
      } catch (e) {}
    } else if (ua.includes('linux')) {
      osName = 'Linux'
    } else if (ua.includes('android')) {
      osName = 'Android'
    } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
      osName = 'iOS'
    }
    userOS.value = osName

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
      const offsetMin = new Date().getTimezoneOffset()
      const offsetHr = -offsetMin / 60
      const offsetStr = offsetHr >= 0 ? `+${offsetHr}` : `${offsetHr}`
      userTimezone.value = `${tz} (UTC${offsetStr})`
    } catch (e) {
      userTimezone.value = 'UTC+8'
    }

    const lang = navigator.language || 'zh-CN'
    let langDisplay = lang
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

  const updateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
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
