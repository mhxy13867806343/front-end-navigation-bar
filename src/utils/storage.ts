import { STORAGE_KEYS, type StorageKeyType } from '../constants/storageKeys'

/**
 * 通用本地缓存封装工具模块
 * 提供类型安全的 LocalStorage 读取、写入、删除与清空功能，支持 JSON 自动序列化
 */
export class LocalStorageUtil {
  /**
   * 获取缓存
   * @param key 缓存键名 (建议使用 STORAGE_KEYS 中的常量)
   * @param defaultValue 默认兜底数据
   */
  static getItem<T>(key: StorageKeyType, defaultValue: T): T {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue
    }
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null || raw === undefined) {
        return defaultValue
      }
      return JSON.parse(raw) as T
    } catch (err) {
      console.warn(`[storage] 读取 key: "${key}" 发生异常:`, err)
      return defaultValue
    }
  }

  /**
   * 设置缓存
   * @param key 缓存键名
   * @param value 缓存数据值
   */
  static setItem<T>(key: StorageKeyType, value: T): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }
    try {
      const serialized = JSON.stringify(value)
      window.localStorage.setItem(key, serialized)
      return true
    } catch (err) {
      console.warn(`[storage] 写入 key: "${key}" 发生异常:`, err)
      return false
    }
  }

  /**
   * 删除指定缓存
   * @param key 缓存键名
   */
  static removeItem(key: StorageKeyType): void {
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      window.localStorage.removeItem(key)
    } catch (err) {
      console.warn(`[storage] 删除 key: "${key}" 发生异常:`, err)
    }
  }

  /**
   * 清空所有系统缓存
   */
  static clear(): void {
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      window.localStorage.clear()
    } catch (err) {
      console.warn('[storage] 清空缓存发生异常:', err)
    }
  }
}

// 导出一键易用简写别名与 key 常量
export const storage = LocalStorageUtil
export { STORAGE_KEYS }
