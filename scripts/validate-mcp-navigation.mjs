import { fileURLToPath } from 'node:url'

import { menuItemsList } from '../src/utlis/menuItems.js'

const expectations = [
  { id: 22, name: 'MCP Skills', icon: '🧠', prefix: 'mcp-skill-', minimum: 18 },
  { id: 23, name: 'MCP Servers', icon: '🔌', prefix: 'mcp-server-', minimum: 45 }
]
const requiredFields = ['id', 'name', 'desc', 'icon', 'link', 'platform', 'price']
const serverPlatforms = new Set(['MCP', 'Cloud'])

export function validateMcpNavigation(menuItems) {
  const categoryIds = menuItems.map(category => category.id)
  if (new Set(categoryIds).size !== categoryIds.length) throw new Error('Category IDs must be unique')

  for (const category of menuItems) {
    if (!Array.isArray(category.tools)) throw new Error(`${category.name || category.id} tools must be an array`)
  }

  const allToolIds = menuItems.flatMap(category => category.tools).map(tool => tool.id)
  if (new Set(allToolIds).size !== allToolIds.length) throw new Error('Tool IDs must be unique')

  for (const expected of expectations) {
    const matches = menuItems.filter(item => item.id === expected.id)
    if (matches.length !== 1) throw new Error(`${expected.name} must appear exactly once`)

    const [category] = matches
    if (category.name !== expected.name) throw new Error(`Missing category: ${expected.name}`)
    if (category.icon !== expected.icon) throw new Error(`Invalid icon: ${expected.name}`)
    if (category.tools.length < expected.minimum) throw new Error(`${expected.name} needs at least ${expected.minimum} items`)

    for (const tool of category.tools) {
      if (!tool.id.startsWith(expected.prefix)) throw new Error(`Invalid ID prefix: ${tool.id}`)
      for (const field of requiredFields) {
        if (typeof tool[field] !== 'string' || !tool[field].trim()) throw new Error(`${tool.id} is missing ${field}`)
      }

      let url
      try {
        url = new URL(tool.link)
      } catch {
        throw new Error(`${tool.id} must use a valid HTTPS URL`)
      }
      if (url.protocol !== 'https:' || !url.hostname) throw new Error(`${tool.id} must use a valid HTTPS URL`)

      if (expected.id === 23 && !serverPlatforms.has(tool.platform)) {
        throw new Error(`Invalid MCP Servers platform: ${tool.platform}`)
      }
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  validateMcpNavigation(menuItemsList)
  console.log('MCP navigation data is valid')
}
