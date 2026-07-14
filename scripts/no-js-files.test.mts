import { readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = path.resolve(import.meta.dirname, '..')
const ignoredDirectories = new Set([
  '.git',
  'dist',
  'node_modules'
])

async function listJavaScriptFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    if (ignoredDirectories.has(entry.name)) {
      return []
    }

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return listJavaScriptFiles(fullPath)
    }

    return /\.(?:cjs|mjs|js)$/.test(entry.name)
      ? [path.relative(root, fullPath)]
      : []
  }))

  return files.flat().sort()
}

test('project-authored JavaScript files have been migrated to TypeScript', async () => {
  assert.deepEqual(await listJavaScriptFiles(root), [])
})
