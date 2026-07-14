import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = path.resolve(import.meta.dirname, '..')
const sourceRoot = path.join(root, 'src')

async function listSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return listSourceFiles(fullPath)
    }

    return /\.(vue|js|ts)$/.test(entry.name) ? [fullPath] : []
  }))

  return files.flat()
}

test('Vue composition APIs are provided by Vite auto-imports', async () => {
  const viteConfig = await readFile(path.join(root, 'vite.config.js'), 'utf8')

  assert.match(viteConfig, /unplugin-auto-import\/vite/)
  assert.match(viteConfig, /imports:\s*\[\s*['"]vue['"]/)

  const files = await listSourceFiles(sourceRoot)
  const explicitVueImports = []

  for (const file of files) {
    const content = await readFile(file, 'utf8')

    if (/from\s+['"]vue['"]/.test(content)) {
      explicitVueImports.push(path.relative(root, file))
    }
  }

  assert.deepEqual(explicitVueImports, [])
})
