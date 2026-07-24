import { ElNotification, ElMessageBox } from 'element-plus'
import router from '../router'

let isDevToolsNoticeShown = false

/**
 * 开发者工具与查看源码拦截引导服务
 * 1. 阻断 F12, Ctrl+U, Ctrl+Shift+I, Cmd+Option+I, Cmd+Option+U 等快捷键，并弹出 0-ms 源码复制中心引导。
 * 2. 监测通过浏览器顶部菜单 (显示 -> 开发者 -> 开发者工具/显示源代码) 打开的 DevTools，并友情引导。
 */
export function initDevToolsProtection() {
  if (typeof window === 'undefined') return

  // 1. 快捷键拦截与引导
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey
    const altOrOpt = e.altKey
    const shift = e.shiftKey
    const key = e.key.toLowerCase()

    // F12
    const isF12 = e.key === 'F12'
    // Ctrl/Cmd + Shift + I / J / C (开发者工具 / 控制台 / 检查元素)
    const isDevToolsCombo = ctrlOrCmd && (shift || altOrOpt) && (key === 'i' || key === 'j' || key === 'c')
    // Ctrl/Cmd + U / Alt+Cmd+U (查看网页源代码)
    const isViewSourceCombo = ctrlOrCmd && (key === 'u' || (altOrOpt && key === 'u'))

    if (isF12 || isDevToolsCombo || isViewSourceCombo) {
      e.preventDefault()
      e.stopPropagation()

      ElNotification({
        title: '💡 源码快捷获取提示',
        message: '检测到您尝试打开开发者工具或查看网页源码。本站所有页面与功能均已提供完整的 Vue 3 / TypeScript 源代码！',
        type: 'info',
        duration: 6000,
        customClass: 'devtools-notice-box'
      })

      // 询问是否直接跳转到 0-ms 源代码查看与复制中心
      if (!isDevToolsNoticeShown) {
        isDevToolsNoticeShown = true
        ElMessageBox.confirm(
          '检测到您正在尝试查看网页源代码或开发者工具。本站已在【💻 页面与功能全量源码查看/复制中心】为您整理好了全套标准 Vue 3 / TypeScript 源代码，是否立即前往一键复制？',
          '💻 源代码一键获取指南',
          {
            confirmButtonText: '前往 0-ms 源码中心',
            cancelButtonText: '继续查看当前页',
            type: 'info',
            closeOnClickModal: true
          }
        )
          .then(() => {
            router.push('/source-code')
          })
          .finally(() => {
            setTimeout(() => { isDevToolsNoticeShown = false }, 3000)
          })
      }
    }
  }, true)

  // 2. 检测通过浏览器顶部菜单 (显示 -> 开发者 -> 开发者工具) 打开 DevTools 的尺寸差变动
  const checkDevToolsOpened = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160
    const heightThreshold = window.outerHeight - window.innerHeight > 160

    if ((widthThreshold || heightThreshold) && !isDevToolsNoticeShown) {
      isDevToolsNoticeShown = true
      ElNotification({
        title: '⚙️ 开发者工具已开启',
        message: '如需阅读或复制本站各组件与功能的原始 Vue 3 / TypeScript 代码，请前往【💻 源码复制中心】体验 0-ms 快捷复制。',
        type: 'warning',
        duration: 5000
      })
      setTimeout(() => { isDevToolsNoticeShown = false }, 10000)
    }
  }

  window.addEventListener('resize', checkDevToolsOpened)
  setInterval(checkDevToolsOpened, 3000)

  console.log('[DevToolsProtection] 开发者工具与源码快捷键拦截引导服务已启动。')
}
