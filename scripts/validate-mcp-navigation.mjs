import { menuItemsList } from '../src/utlis/menuItems.js'

const expectations = [
  { id: 22, name: 'MCP Skills', prefix: 'mcp-skill-', minimum: 18 },
  { id: 23, name: 'MCP Servers', prefix: 'mcp-server-', minimum: 45 }
]
const requiredFields = ['id', 'name', 'desc', 'icon', 'link', 'platform', 'price']

const allToolIds = menuItemsList.flatMap(category => category.tools || []).map(tool => tool.id)
if (new Set(allToolIds).size !== allToolIds.length) throw new Error('Tool IDs must be unique')

for (const expected of expectations) {
  const category = menuItemsList.find(item => item.id === expected.id)
  if (!category || category.name !== expected.name) throw new Error(`Missing category: ${expected.name}`)
  if (category.tools.length < expected.minimum) throw new Error(`${expected.name} needs at least ${expected.minimum} items`)

  for (const tool of category.tools) {
    if (!tool.id.startsWith(expected.prefix)) throw new Error(`Invalid ID prefix: ${tool.id}`)
    for (const field of requiredFields) {
      if (typeof tool[field] !== 'string' || !tool[field].trim()) throw new Error(`${tool.id} is missing ${field}`)
    }
    if (!tool.link.startsWith('https://')) throw new Error(`${tool.id} must use HTTPS`)
  }
}

console.log('MCP navigation data is valid')
