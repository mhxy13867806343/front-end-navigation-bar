import { createVersionPolling, type VersionPolling } from 'version-polling'
import { ElMessageBox, ElNotification } from 'element-plus'

/**
 * 生产环境下自动启动版本轮询检测 (version-polling)
 * 当检测到 index.html 或静态 Chunk 发生变动时，弹出 Element Plus UI 组件提示用户刷新
 */
export function initVersionPolling() {
  // 限制仅在生产环境生效
  if (!import.meta.env.PROD) return

  try {
    createVersionPolling({
      pollingInterval: 60 * 1000, // 每 60 秒自动轮询一次 index.html 标头与 ChunkHash
      silentPageVisibility: true,
      onUpdate: (self: VersionPolling, info?: any) => {
        const newVersion = info?.version || info?.versionFlag || ''
        
        // 替代原有的 alert(`发现新版本 ${newVersion}，请刷新页面以加载最新资源`)，改用 Element Plus 提示弹窗
        ElMessageBox.confirm(
          `检测到系统已发布最新版本 ${newVersion ? `(${newVersion})` : ''}，请刷新页面以加载最新资源！`,
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
            if (typeof self?.onRefresh === 'function') {
              self.onRefresh()
            }
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
    })
  } catch (err) {
    console.warn('[version-polling] 初始化失败:', err)
  }
}
