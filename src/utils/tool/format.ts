/**
 * 格式化相关工具函数
 */

/**
 * 格式化 JSON 字符串
 * @param {string} jsonStr - 原始 JSON 字符串
 * @returns {string} 格式化后的 JSON 字符串
 */
export function formatJson(jsonStr: string | unknown): string {
  try {
    const parsed: unknown = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(parsed, null, 2)
  } catch (e: unknown) {
    const message: string = e instanceof Error ? e.message : String(e)
    throw new Error(`JSON 格式化错误: ${message}`)
  }
}

/**
 * 格式化日期时间
 * @param {number|string|Date} dateVal - 待格式化日期
 * @param {string} formatPattern - 格式化模板 (如: YYYY-MM-DD HH:mm:ss)
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(dateVal: number | string | Date, formatPattern: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!dateVal) return ''
  const date: Date = new Date(dateVal)
  if (isNaN(date.getTime())) {
    throw new Error('日期非法')
  }

  const pad = (n: number): string => String(n).padStart(2, '0')
  const map: Record<string, string | number> = {
    YYYY: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds())
  }

  return formatPattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (matched: string): string => String(map[matched]))
}

/**
 * 格式化文件字节大小
 * @param {number} bytes - 文件大小字节数
 * @returns {string} 格式化后的文件大小 (如: 1.25 MB)
 */
export function formatBytes(bytes: number): string {
  const num: number = Number(bytes)
  if (isNaN(num) || num < 0) throw new Error('字节数非法')
  if (num === 0) return '0 Bytes'

  const k: number = 1024
  const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i: number = Math.floor(Math.log(num) / Math.log(k))

  return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化金额数值
 * @param {number|string} amount - 原始金额
 * @param {string} currencySymbol - 货币符号
 * @returns {string} 格式化后的金额 (如: $1,234,567.89)
 */
export function formatMoney(amount: number | string, currencySymbol: string = '￥'): string {
  const num: number = Number(amount)
  if (isNaN(num)) throw new Error('金额数值非法')
  return currencySymbol + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}
