import { createVersionPolling, type VersionPolling } from 'version-polling'
import { ElMessageBox, ElNotification } from 'element-plus'

/**
 * 触发 Element Plus 版本更新提示对话窗
 */
export function triggerVersionNotice(newVersion: string = 'v' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-build') {
  ElMessageBox.confirm(
    `检测到系统已发布随机最新版本 (${newVersion})，请刷新页面以加载最新资源！`,
    '🚀 发现新版本',
    {
      confirmButtonText: '立即刷新',
      cancelButtonText: '暂不刷新',
      type: 'warning',
      customClass: 'version-update-box',
      closeOnClickModal: false,
      closeOnPressEscape: false
    }
  )
    .then(() => {
      window.location.reload()
    })
    .catch(() => {
      ElNotification({
        title: '更新已暂缓',
        message: '您当前仍在运行旧版本缓存，建议抽空刷新页面以体验最新功能。',
        type: 'info',
        duration: 5000
      })
    })
}

// 挂载至全局 window 便于控制台及组件随时测试验证
if (typeof window !== 'undefined') {
  ;(window as any).__triggerVersionUpdateNotice = triggerVersionNotice
}

/**
 * 自动启动随机版本 JSON 轮询检测 (version-polling)
 * 轮询 public/version.json 文件的随机版本号变动，发生变动时弹出 Element Plus UI 对话窗
 */
export function initVersionPolling() {
  // 限制仅在生产环境生效
  if (!import.meta.env.PROD) return

  const versionFileUrl = (import.meta.env.BASE_URL || '/') + 'version.json'

  try {
    createVersionPolling({
      vcType: 'versionJson',
      versionFileUrl,
      pollingInterval: 15 * 1000, // 缩短为 15 秒轮询一次，加速线上检测
      silentPageVisibility: true,
      onUpdate: (_self: VersionPolling, info?: any) => {
        const newVersion = info?.version || info?.versionFlag || info?.randomVersion || info?.randomCode || 'latest'
        triggerVersionNotice(newVersion)
      }
    })
    console.log(`[version-polling] 随机版本 JSON 实时检测已启动 (target: ${versionFileUrl})`)
  } catch (err) {
    console.warn('[version-polling] 初始化异常:', err)
  }
}
