import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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

test('Terminal category includes macOS-like terminal resources', () => {
  const terminalCategory: NavigationCategory | undefined = menuItemsList.find((category: NavigationCategory): boolean => category.id === 26)
  assert.equal(terminalCategory?.name, '终端')
  assert.equal(terminalCategory?.icon, '⌨️')
  assert.ok(terminalCategory?.tools)

  const resources = new Map(terminalCategory.tools.map((tool) => [tool.id, tool]))
  assert.equal(resources.get('terminal-xtermjs')?.link, 'https://github.com/xtermjs/xterm.js')
  assert.equal(resources.get('terminal-iterm2')?.link, 'https://github.com/gnachman/iTerm2')
  assert.equal(resources.get('terminal-warp')?.type, 'terminal')
})

test('Terminal has a direct route that selects the terminal category', () => {
  const routerSource = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')
  const appSource = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')

  assert.match(routerSource, /path:\s*'\/terminal'/)
  assert.match(appSource, /route\.path\s*===\s*'\/terminal'/)
  assert.match(appSource, /activeItem\.value\s*=\s*26/)
})

test('RunCode has a direct route and toolbox hub entry', () => {
  const routerSource = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')
  const appSource = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  const toolboxSource = readFileSync(new URL('../src/views/toolbox/index.vue', import.meta.url), 'utf8')

  assert.match(routerSource, /path:\s*'\/runcode'/)
  assert.match(routerSource, /views\/runcode\/index\.vue/)
  assert.match(routerSource, /path:\s*'\/toolbox'/)
  assert.match(routerSource, /views\/toolbox\/index\.vue/)
  assert.match(appSource, /goToolbox/)
  assert.match(toolboxSource, /\/terminal/)
  assert.match(toolboxSource, /\/runcode/)
})

test('RunCode page includes editor input output and run controls', () => {
  const runCodeSource = readFileSync(new URL('../src/views/runcode/index.vue', import.meta.url), 'utf8')

  assert.match(runCodeSource, /class="runcode-workbench"/)
  assert.match(runCodeSource, /v-model="selectedLanguageId"/)
  assert.match(runCodeSource, /v-model="sourceCode"/)
  assert.match(runCodeSource, /v-model="stdinText"/)
  assert.match(runCodeSource, /runCode/)
  assert.match(runCodeSource, /outputText/)
})

test('Home page exposes floating QQ contact next to the email contact', () => {
  const appSource = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  const styleSource = readFileSync(new URL('../src/style/style.css', import.meta.url), 'utf8')

  assert.match(appSource, /mqqwpa:\/\/im\/chat\?chat_type=wpa&uin=869710179&version=1&src_type=web/)
  assert.match(appSource, /class="floating-contact-bar"/)
  assert.match(appSource, /class="floating-contact-icon floating-qq-icon"/)
  assert.match(appSource, /class="floating-contact-icon floating-email-icon"/)
  assert.match(styleSource, /\.floating-contact-bar\s*\{[\s\S]*?right:\s*24px/)
  assert.match(styleSource, /\.floating-contact-icon\s*\{[\s\S]*?width:\s*44px/)
})

test('Production mobile visits are routed to an H5 desktop-link copy page', () => {
  const routerSource = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')
  const appSource = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  const h5Source = readFileSync(new URL('../src/views/h5DesktopLink/index.vue', import.meta.url), 'utf8')

  assert.match(routerSource, /path:\s*'\/h5\/:ticket'/)
  assert.match(routerSource, /import\.meta\.env\.PROD/)
  assert.match(routerSource, /isMobileLikeClient/)
  assert.match(routerSource, /path:\s*`\/h5\/\$\{buildH5Ticket\(to\)\}`/)
  assert.match(routerSource, /query:\s*\{[\s\S]*?target:\s*to\.fullPath/)
  assert.match(routerSource, /hasAllowedMobilePageAccess/)
  assert.match(appSource, /routeViewPaths:[\s\S]*?\/h5/)
  assert.match(appSource, /isH5DesktopHintRoute/)
  assert.match(h5Source, /复制链接/)
  assert.match(h5Source, /电脑端链接/)
  assert.match(h5Source, /front_end_navigation_allow_mobile_page/)
  assert.match(h5Source, /navigator\.clipboard\.writeText/)
})
