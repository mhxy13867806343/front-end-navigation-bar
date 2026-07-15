import { execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

interface GitCommitRecord {
  hash: string
  shortHash: string
  date: string
  time: string
  type: string
  title: string
  scope: string
  message: string
}

interface VersionHistoryGroup {
  date: string
  items: GitCommitRecord[]
}

interface VersionHistoryFile {
  generatedAt: string
  groups: VersionHistoryGroup[]
}

const __filename: string = fileURLToPath(import.meta.url)
const __dirname: string = path.dirname(__filename)
const projectRoot: string = path.resolve(__dirname, '..')
const outputPath: string = path.join(projectRoot, 'src', 'ajson', 'version-history.json')
const separator: string = '\u001f'

const normalizeType = (message: string): string => {
  const typeMatch: RegExpMatchArray | null = message.match(/^([a-z]+)(\([^)]+\))?:/i)
  if (!typeMatch) return 'update'

  const type: string = typeMatch[1].toLowerCase()
  const labels: Record<string, string> = {
    feat: '功能更新',
    fix: '问题修复',
    ci: '工程配置',
    chore: '工程维护',
    refactor: '代码重构',
    docs: '文档更新',
    test: '测试完善',
    style: '样式调整'
  }

  return labels[type] || '项目更新'
}

const parseScope = (message: string): string => {
  const scopeMatch: RegExpMatchArray | null = message.match(/^[a-z]+\(([^)]+)\):/i)
  return scopeMatch ? scopeMatch[1] : ''
}

const parseTitle = (message: string): string => {
  return message.replace(/^[a-z]+(\([^)]+\))?:\s*/i, '').trim() || message
}

const gitOutput: string = execFileSync('git', [
  'log',
  '--date=format-local:%Y-%m-%d %H:%M',
  `--pretty=format:%H${separator}%h${separator}%ad${separator}%s`,
  '-30'
], {
  cwd: projectRoot,
  encoding: 'utf8',
  env: {
    ...process.env,
    TZ: 'Asia/Shanghai'
  }
})

const groupsMap: Map<string, GitCommitRecord[]> = new Map<string, GitCommitRecord[]>()

gitOutput
  .split('\n')
  .filter(Boolean)
  .forEach((line: string): void => {
    const [hash, shortHash, dateTime, message] = line.split(separator)
    const [date, time] = dateTime.split(' ')
    const record: GitCommitRecord = {
      hash,
      shortHash,
      date,
      time,
      type: normalizeType(message),
      title: parseTitle(message),
      scope: parseScope(message),
      message
    }

    const items: GitCommitRecord[] = groupsMap.get(date) || []
    items.push(record)
    groupsMap.set(date, items)
  })

const versionHistory: VersionHistoryFile = {
  generatedAt: new Date().toISOString(),
  groups: Array.from(groupsMap.entries()).map(([date, items]: [string, GitCommitRecord[]]): VersionHistoryGroup => ({
    date,
    items
  }))
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(versionHistory, null, 2)}\n`, 'utf8')
console.log(`[version-history] wrote ${path.relative(projectRoot, outputPath)}`)
