import assert from 'node:assert/strict'
import test from 'node:test'

import { menuItemsList } from '../src/utlis/menuItems.js'
import * as validator from './validate-mcp-navigation.mjs'

const cloneMenu = () => structuredClone(menuItemsList)

test('current production MCP navigation data is valid', () => {
  assert.equal(typeof validator.validateMcpNavigation, 'function')
  assert.doesNotThrow(() => validator.validateMcpNavigation(cloneMenu()))
})

test('rejects duplicate category IDs', () => {
  const menu = cloneMenu()
  menu.push(structuredClone(menu.find(category => category.id === 22)))

  assert.throws(() => validator.validateMcpNavigation(menu), /Category IDs must be unique/)
})

test('rejects an incorrect target category icon', () => {
  const menu = cloneMenu()
  menu.find(category => category.id === 22).icon = '❌'

  assert.throws(() => validator.validateMcpNavigation(menu), /Invalid icon: MCP Skills/)
})

test('rejects an HTTPS URL without a hostname', () => {
  const menu = cloneMenu()
  menu.find(category => category.id === 22).tools[0].link = 'https://'

  assert.throws(() => validator.validateMcpNavigation(menu), /must use a valid HTTPS URL/)
})

test('rejects an unsupported MCP Servers platform', () => {
  const menu = cloneMenu()
  menu.find(category => category.id === 23).tools[0].platform = 'Web'

  assert.throws(() => validator.validateMcpNavigation(menu), /Invalid MCP Servers platform: Web/)
})
