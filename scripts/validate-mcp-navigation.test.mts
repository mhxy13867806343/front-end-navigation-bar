import assert from 'node:assert/strict'
import test from 'node:test'

import { menuItemsList } from '../src/utlis/menuItems.ts'
import type { NavigationCategory } from '../src/types/navigation.ts'
import * as validator from './validate-mcp-navigation.mts'

const cloneMenu = (): NavigationCategory[] => structuredClone(menuItemsList)

test('current production MCP navigation data is valid', () => {
  assert.equal(typeof validator.validateMcpNavigation, 'function')
  assert.doesNotThrow(() => validator.validateMcpNavigation(cloneMenu()))
})

test('rejects duplicate category IDs', () => {
  const menu = cloneMenu()
  const category: NavigationCategory | undefined = menu.find((item: NavigationCategory): boolean => item.id === 22)
  assert.ok(category)
  menu.push(structuredClone(category))

  assert.throws(() => validator.validateMcpNavigation(menu), /Category IDs must be unique/)
})

test('rejects an incorrect target category icon', () => {
  const menu = cloneMenu()
  const category: NavigationCategory | undefined = menu.find((item: NavigationCategory): boolean => item.id === 22)
  assert.ok(category)
  category.icon = '❌'

  assert.throws(() => validator.validateMcpNavigation(menu), /Invalid icon: MCP Skills/)
})

test('rejects an HTTPS URL without a hostname', () => {
  const menu = cloneMenu()
  const category: NavigationCategory | undefined = menu.find((item: NavigationCategory): boolean => item.id === 22)
  assert.ok(category?.tools?.[0])
  category.tools[0].link = 'https://'

  assert.throws(() => validator.validateMcpNavigation(menu), /must use a valid HTTPS URL/)
})

test('rejects an unsupported MCP Servers platform', () => {
  const menu = cloneMenu()
  const category: NavigationCategory | undefined = menu.find((item: NavigationCategory): boolean => item.id === 23)
  assert.ok(category?.tools?.[0])
  category.tools[0].platform = 'Web'

  assert.throws(() => validator.validateMcpNavigation(menu), /Invalid MCP Servers platform: Web/)
})
