import fs from 'node:fs'
import path from 'node:path'

function getVueFiles(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      results = results.concat(getVueFiles(filePath))
    } else if (file.endsWith('.vue')) {
      results.push(filePath)
    }
  })
  return results
}

const vueFiles = getVueFiles(path.resolve(process.cwd(), 'src'))
let count = 0
vueFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8')
  if (content.includes('</style></style>')) {
    content = content.replace(/<\/style>\s*<\/style>/g, '</style>')
    fs.writeFileSync(f, content, 'utf8')
    console.log('Fixed double style tag in:', path.relative(process.cwd(), f))
    count++
  }
})
console.log(`Fixed ${count} files.`)
