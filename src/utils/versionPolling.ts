import { createVersionPolling, type VersionPolling } from 'version-polling'
import { ElMessageBox, ElNotification } from 'element-plus'

/**
 * 触发 Element Plus 版本更新提示对话框 (符合用户要求，替代原 alert 写法)
 */
export function triggerVersionNotice(newVersion: string = 'v' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-build') {
  ElMessageBox.confirm(
    `检测到系统已发布最新版本 (${newVersion})，请刷新页面以加载最新资源！`,
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
        message: '您当前仍在运行旧版缓存，建议抽空刷新页面以体验最新功能。',
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
 * 自动启动版本轮询检测 (version-polling)
 * 当检测到 index.html 或静态 Chunk 发生变动时，弹出 Element Plus UI 组件提示用户刷新
 */
export function initVersionPolling() {
  const isProd = import.meta.env.PROD
  const htmlFileUrl = (import.meta.env.BASE_URL || '/') + 'index.html'

  try {
    createVersionPolling({
      htmlFileUrl,
      pollingInterval: 30 * 1000, // 每 30 秒自动轮询一次 index.html 标头与 ChunkHash
      silentPageVisibility: true,
      onUpdate: (_self: VersionPolling, info?: any) => {
        const newVersion = info?.version || info?.versionFlag || 'latest'
        triggerVersionNotice(newVersion)
      }
    })
    console.log(`[version-polling] 版本检测服务已启动 (PROD: ${isProd}, target: ${htmlFileUrl})`)
  } catch (err) {
    console.warn('[version-polling] 初始化异常:', err)
  }
}
