import fs from 'node:fs'
import path from 'node:path'

function getAllFiles(dir, ext) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, ext))
    } else if (file.endsWith(ext)) {
      results.push(filePath)
    }
  })
  return results
}

const srcDir = path.resolve(process.cwd(), 'src')

// 1. Rename all .css files to .scss
const cssFiles = getAllFiles(srcDir, '.css')
console.log(`Found ${cssFiles.length} CSS files to convert to SCSS.`)

cssFiles.forEach(cssPath => {
  const scssPath = cssPath.replace(/\.css$/, '.scss')
  if (cssPath !== scssPath) {
    fs.renameSync(cssPath, scssPath)
    console.log(`Renamed: ${path.relative(process.cwd(), cssPath)} -> .scss`)
  }
})

// 2. Update all .vue files to point to .scss and use lang="scss"
const vueFiles = getAllFiles(srcDir, '.vue')
console.log(`Updating ${vueFiles.length} Vue files...`)

vueFiles.forEach(vuePath => {
  let content = fs.readFileSync(vuePath, 'utf8')
  let updated = false

  // Replace <style scoped src="..."> or <style src="...">
  content = content.replace(/<style(\s+scoped)?(\s+src="([^"]+\.css)")(\s+scoped)?>/g, (match, p1, p2, p3) => {
    updated = true
    const isScoped = match.includes('scoped')
    const scssSrc = p3.replace(/\.css$/, '.scss')
    const scopedStr = isScoped ? ' scoped' : ''
    return `<style${scopedStr} lang="scss" src="${scssSrc}"></style>`
  })

  // Also catch any existing <style scoped src="...scss"> without lang="scss"
  content = content.replace(/<style(\s+scoped)?\s+src="([^"]+\.scss)"/g, (match, p1, p2) => {
    if (!match.includes('lang="scss"')) {
      updated = true
      const isScoped = match.includes('scoped')
      const scopedStr = isScoped ? ' scoped' : ''
      return `<style${scopedStr} lang="scss" src="${p2}"`
    }
    return match
  })

  if (updated) {
    fs.writeFileSync(vuePath, content, 'utf8')
    console.log(`Updated Vue SFC: ${path.relative(process.cwd(), vuePath)}`)
  }
})

console.log('Conversion to SCSS completed successfully!')
