import { ElMessage } from 'element-plus'

/**
 * 全局剪贴板复制工具，统一剪贴板写入逻辑与 Feedback Toast 提示
 * @param text 需要复制的文本
 * @param successMsg 复制成功时的提示信息
 */
export async function copyToClipboard(text: string, successMsg: string = '链接已成功复制到剪贴板！'): Promise<boolean> {
  if (!text) return false
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    ElMessage.success(successMsg)
    return true
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
    return false
  }
}
