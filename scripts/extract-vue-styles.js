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

const srcDir = path.resolve(process.cwd(), 'src')
const vueFiles = getVueFiles(srcDir)

console.log(`Found ${vueFiles.length} Vue files.`)

let processedCount = 0

vueFiles.forEach(vuePath => {
  let content = fs.readFileSync(vuePath, 'utf8')
  const dir = path.dirname(vuePath)
  const baseName = path.basename(vuePath, '.vue')

  // Regex to find style tags
  const styleRegex = /<style(\s+[^>]*)?>([\s\S]*?)<\/style>/gi
  let match
  let styleBlocks = []

  while ((match = styleRegex.exec(content)) !== null) {
    const fullTag = match[0]
    const attrs = match[1] || ''
    const cssContent = match[2].trim()

    // If tag already has src attribute and no content, skip
    if (attrs.includes('src=') && !cssContent) {
      continue
    }

    if (cssContent) {
      styleBlocks.push({
        fullTag,
        attrs,
        cssContent,
        isScoped: attrs.includes('scoped')
      })
    }
  }

  if (styleBlocks.length === 0) return

  // Special handling for App.vue: append inline styles to App.css
  if (baseName === 'App' && dir === srcDir) {
    const appCssPath = path.join(srcDir, 'App.css')
    const inlineCss = styleBlocks.map(b => b.cssContent).join('\n\n')
    if (fs.existsSync(appCssPath)) {
      fs.appendFileSync(appCssPath, '\n\n' + inlineCss, 'utf8')
    } else {
      fs.writeFileSync(appCssPath, inlineCss, 'utf8')
    }
    // Remove the inline style tags from App.vue
    styleBlocks.forEach(b => {
      content = content.replace(b.fullTag, '')
    })
    // Ensure <style scoped src="./App.css"></style> is present
    if (!content.includes('src="./App.css"')) {
      content += '\n<style scoped src="./App.css"></style>\n'
    }
    fs.writeFileSync(vuePath, content, 'utf8')
    console.log(`Updated App.vue and appended to App.css`)
    processedCount++
    return
  }

  // Create css directory in the same folder as the Vue component
  const cssDir = path.join(dir, 'css')
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true })
  }

  let newStyleTags = []

  styleBlocks.forEach((block, index) => {
    let cssFileName
    if (styleBlocks.length === 1) {
      cssFileName = `${baseName}.css`
    } else {
      cssFileName = `${baseName}-${index + 1}.css`
    }

    const cssPath = path.join(cssDir, cssFileName)
    fs.writeFileSync(cssPath, block.cssContent + '\n', 'utf8')

    const scopedAttr = block.isScoped ? ' scoped' : ''
    const newTag = `<style${scopedAttr} src="./css/${cssFileName}"></style>`
    newStyleTags.push(newTag)

    content = content.replace(block.fullTag, newTag)
  })

  fs.writeFileSync(vuePath, content, 'utf8')
  console.log(`Extracted styles for ${path.relative(process.cwd(), vuePath)} -> css/`)
  processedCount++
})

console.log(`Successfully processed ${processedCount} Vue files!`)
