import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = path.resolve(import.meta.dirname, '..')
const sourceRoot = path.join(root, 'src')

async function listSourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[][] = await Promise.all(entries.map(async (entry): Promise<string[]> => {
    const fullPath: string = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return listSourceFiles(fullPath)
    }

    return /\.(vue|js|ts)$/.test(entry.name) ? [fullPath] : []
  }))

  return files.flat()
}

test('Vue composition APIs are provided by Vite auto-imports', async () => {
  const viteConfig = await readFile(path.join(root, 'vite.config.ts'), 'utf8')

  assert.match(viteConfig, /unplugin-auto-import\/vite/)
  assert.match(viteConfig, /imports:\s*\[\s*['"]vue['"]/)

  const files: string[] = await listSourceFiles(sourceRoot)
  const explicitVueImports: string[] = []

  for (const file of files) {
    const relativePath: string = path.relative(root, file)
    if (relativePath === 'src/auto-imports.d.ts') continue

    const content = await readFile(file, 'utf8')

    if (/^\s*import\s+(?!type\b)\{[^}]+\}\s+from\s+['"]vue['"]/m.test(content)) {
      explicitVueImports.push(relativePath)
    }
  }

  assert.deepEqual(explicitVueImports, [])
})
