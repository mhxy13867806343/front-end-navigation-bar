import assert from 'node:assert/strict'
import test from 'node:test'

import { menuItemsList } from '../src/utlis/menuItems.js'

test('GitHub category includes both Chinese community resources', () => {
  const githubCategory = menuItemsList.find(category => category.name === 'GitHub')
  const resources = new Map(githubCategory.tools.map(tool => [tool.id, tool]))

  assert.equal(resources.get('github-31')?.link, 'https://github-cn.com/')
  assert.equal(resources.get('github-32')?.link, 'https://gitcn.org/')
})
