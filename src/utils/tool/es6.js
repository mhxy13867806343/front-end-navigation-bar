/**
 * 现代 ES6 常用快捷工具函数
 */

/**
 * 数组去重
 * @param {Array} arr - 目标数组
 * @returns {Array} 去重后的新数组
 */
export function uniqueArray(arr) {
  if (!Array.isArray(arr)) throw new Error('参数必须是数组')
  return [...new Set(arr)]
}

/**
 * 对象/数据深拷贝
 * @param {any} source - 待拷贝的数据对象
 * @returns {any} 拷贝得到的全新数据
 */
export function deepClone(source) {
  if (source === null || typeof source !== 'object') {
    return source
  }

  // Handle Date
  if (source instanceof Date) {
    return new Date(source.getTime())
  }

  // Handle Array
  if (Array.isArray(source)) {
    const cloneArr = []
    source.forEach(item => cloneArr.push(deepClone(item)))
    return cloneArr
  }

  // Handle Object
  const cloneObj = {}
  Object.keys(source).forEach(key => {
    cloneObj[key] = deepClone(source[key])
  })
  return cloneObj
}

/**
 * 防抖函数简单演示包装
 * (在交互面板中返回调用的提示日志)
 * @param {string} taskName - 模拟任务名
 * @param {number} delay - 防抖延迟(毫秒)
 * @returns {string} 任务防抖策略触发状态
 */
export function debounceDemo(taskName, delay = 500) {
  return `[防抖注册] 任务 "${taskName}" 已启用防抖规则，在频繁触发时将合并事件，延迟 ${delay}ms 后仅执行最后一次。`
}

/**
 * 节流函数简单演示包装
 * @param {string} taskName - 模拟任务名
 * @param {number} limit - 节流间隔阈值(毫秒)
 * @returns {string} 任务节流策略触发状态
 */
export function throttleDemo(taskName, limit = 500) {
  return `[节流注册] 任务 "${taskName}" 已启用节流规则，在频繁触发时，每隔 ${limit}ms 仅允许执行一次任务。`
}
