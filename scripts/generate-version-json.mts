import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const publicDir = resolve(rootDir, 'public')
const distDir = resolve(rootDir, 'dist')
const publicPath = resolve(publicDir, 'version.json')

const getRandomCode = () => String(Math.floor(Math.random() * 900000) + 100000)
const getRandomVersion = () => `v1.${Math.floor(Math.random() * 10)}.${getRandomCode()}`

let previousData: any = {}
let history: any[] = []

if (existsSync(publicPath)) {
  try {
    const raw = readFileSync(publicPath, 'utf8')
    previousData = JSON.parse(raw)
    if (Array.isArray(previousData.history)) {
      history = previousData.history
    } else if (previousData.version) {
      history.push({
        version: previousData.version,
        randomVersion: previousData.randomVersion || previousData.version,
        randomCode: previousData.randomCode || '',
        buildTime: previousData.buildTime || '',
        timestamp: previousData.timestamp || Date.now()
      })
    }
  } catch (e) {
    console.warn('[Version Generator] 读取已有 version.json 失败，将全新创建。')
  }
}

const newVersionStr = getRandomVersion()
const newCodeStr = `VER-${getRandomCode()}`
const buildTimeStr = new Date().toISOString()
const currentTimestamp = Date.now()

const currentItem = {
  version: newVersionStr,
  randomVersion: newVersionStr,
  randomCode: newCodeStr,
  buildTime: buildTimeStr,
  timestamp: currentTimestamp
}

// 拼接并保留历史版本号记录 (最多保留 100 条)
const updatedHistory = [currentItem, ...history].slice(0, 100)

const versionData = {
  version: newVersionStr,
  randomVersion: newVersionStr,
  randomCode: newCodeStr,
  buildTime: buildTimeStr,
  timestamp: currentTimestamp,
  history: updatedHistory
}

if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true })
}

writeFileSync(publicPath, JSON.stringify(versionData, null, 2), 'utf8')
console.log(`[Version Generator] 成功生成随机版本并保留历史记录至 ${publicPath}: ${newVersionStr} (历史累计: ${updatedHistory.length} 条)`)

if (existsSync(distDir)) {
  const distPath = resolve(distDir, 'version.json')
  writeFileSync(distPath, JSON.stringify(versionData, null, 2), 'utf8')
  console.log(`[Version Generator] 同步更新至 dist/version.json`)
}
