import assert from 'node:assert/strict'
import test from 'node:test'

import { menuItemsList } from '../src/utlis/menuItems.ts'
import type { NavigationCategory } from '../src/types/navigation.ts'

test('GitHub category includes both Chinese community resources', () => {
  const githubCategory: NavigationCategory | undefined = menuItemsList.find((category: NavigationCategory): boolean => category.name === 'GitHub')
  assert.ok(githubCategory?.tools)
  const resources = new Map(githubCategory.tools.map((tool) => [tool.id, tool]))

  assert.equal(resources.get('github-31')?.link, 'https://github-cn.com/')
  assert.equal(resources.get('github-32')?.link, 'https://gitcn.org/')
})
