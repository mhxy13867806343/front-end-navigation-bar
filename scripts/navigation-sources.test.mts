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

test('Web Components has a direct route, navbar dropdown button, and component registry', () => {
  const routerSource = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')
  const noticeSource = readFileSync(new URL('../src/components/BrowserSupportNotice.vue', import.meta.url), 'utf8')
  const appSource = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  const wcSource = readFileSync(new URL('../src/views/webComponents/index.vue', import.meta.url), 'utf8')
  const registrySource = readFileSync(new URL('../src/components/webComponents/index.ts', import.meta.url), 'utf8')

  assert.match(routerSource, /path:\s*'\/web-components'/)
  assert.match(routerSource, /views\/webComponents\/index\.vue/)
  assert.match(appSource, /routeViewPaths:[\s\S]*?\/web-components/)
  assert.match(noticeSource, /command="\/web-components"/)
  assert.match(wcSource, /customElements\.define/)
  assert.match(registrySource, /registerWebComponents/)
})

test('Oat UI has a direct route, navbar dropdown button, and 26 components showcase', () => {
  const routerSource = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')
  const noticeSource = readFileSync(new URL('../src/components/BrowserSupportNotice.vue', import.meta.url), 'utf8')
  const appSource = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  const oatSource = readFileSync(new URL('../src/views/oatUi/index.vue', import.meta.url), 'utf8')
  const oatRegistry = readFileSync(new URL('../src/components/oatUi/index.ts', import.meta.url), 'utf8')

  assert.match(routerSource, /path:\s*'\/oat-ui'/)
  assert.match(routerSource, /views\/oatUi\/index\.vue/)
  assert.match(appSource, /routeViewPaths:[\s\S]*?\/oat-ui/)
  assert.match(noticeSource, /command="\/oat-ui"/)
  assert.match(oatSource, /ot-dropdown/)
  assert.match(oatSource, /ot-tag-input/)
  assert.match(oatRegistry, /registerOatUiComponents/)
})

test('Oat Studio provides update notice modal, new page modal, and confirm dialogs', () => {
  const routerSource = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')
  const studioSource = readFileSync(new URL('../src/views/oatStudio/index.vue', import.meta.url), 'utf8')
  const noticeSource = readFileSync(new URL('../src/components/BrowserSupportNotice.vue', import.meta.url), 'utf8')
  const appSource = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')

  assert.match(routerSource, /path:\s*'\/oat-studio'/)
  assert.match(routerSource, /views\/oatStudio\/index\.vue/)
  assert.match(appSource, /routeViewPaths:[\s\S]*?\/oat-studio/)
  assert.match(noticeSource, /command="\/oat-studio"/)
  assert.match(studioSource, /OatUpdateModal/)
  assert.match(studioSource, /OatCreatePageModal/)
  assert.match(studioSource, /OatConfirmModal/)
  assert.match(studioSource, /OatDrawer/)
})

test('Auth Showcase provides 1,000,000 distinct interactive Login and Register UI themes switchable via Tabs', () => {
  const routerSource = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')
  const authSource = readFileSync(new URL('../src/views/authShowcase/index.vue', import.meta.url), 'utf8')
  const noticeSource = readFileSync(new URL('../src/components/BrowserSupportNotice.vue', import.meta.url), 'utf8')

  assert.match(routerSource, /path:\s*'\/auth-showcase'/)
  assert.match(routerSource, /views\/authShowcase\/index\.vue/)
  assert.match(noticeSource, /command="\/auth-showcase"/)
  assert.match(authSource, /generate100wThemes/)
  assert.match(authSource, /glassmorphism/)
  assert.match(authSource, /cyberpunk/)
  assert.match(authSource, /theme-cat-mac/)
  assert.match(authSource, /theme-cat-neu/)
})

test('Cart Showcase and Animation Showcase provide 100 carts and 63,353 animations with dropdown entries', () => {
  const routerSource = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')
  const cartSource = readFileSync(new URL('../src/views/cartShowcase/index.vue', import.meta.url), 'utf8')
  const animSource = readFileSync(new URL('../src/views/animationShowcase/index.vue', import.meta.url), 'utf8')
  const noticeSource = readFileSync(new URL('../src/components/BrowserSupportNotice.vue', import.meta.url), 'utf8')

  assert.match(routerSource, /path:\s*'\/cart-showcase'/)
  assert.match(routerSource, /path:\s*'\/animation-showcase'/)
  assert.match(routerSource, /path:\s*'\/motion-showcase'/)
  assert.match(routerSource, /path:\s*'\/schedule-x'/)
  assert.match(routerSource, /path:\s*'\/three-showcase\/china-map'/)
  assert.match(routerSource, /path:\s*'\/source-code'/)
  assert.match(routerSource, /path:\s*'\/docker-showcase'/)
  assert.match(noticeSource, /command="\/cart-showcase"/)
  assert.match(noticeSource, /command="\/animation-showcase"/)
  assert.match(noticeSource, /command="\/motion-showcase"/)
  assert.match(noticeSource, /command="\/schedule-x"/)
  assert.match(noticeSource, /command="\/three-showcase\/china-map"/)
  assert.match(noticeSource, /command="\/source-code"/)
  assert.match(noticeSource, /command="\/docker-showcase"/)
  assert.match(cartSource, /generate100Carts/)
  assert.match(animSource, /generate63kAnims/)
})

test('Centralized storage keys constants and universal LocalStorage utility are provided', () => {
  const storageKeysSource = readFileSync(new URL('../src/constants/storageKeys.ts', import.meta.url), 'utf8')
  const storageUtilSource = readFileSync(new URL('../src/utils/storage.ts', import.meta.url), 'utf8')
  const scheduleSource = readFileSync(new URL('../src/views/scheduleXShowcase/index.vue', import.meta.url), 'utf8')

  assert.match(storageKeysSource, /SCHEDULE_X_EVENTS/)
  assert.match(storageKeysSource, /SCHEDULE_X_CATEGORIES/)
  assert.match(storageUtilSource, /class LocalStorageUtil/)
  assert.match(scheduleSource, /storage\.getItem/)
  assert.match(scheduleSource, /STORAGE_KEYS\.SCHEDULE_X_EVENTS/)
})

test('Version polling is configured for production app initialization with Element Plus UI dialog', () => {
  const versionPollingSource = readFileSync(new URL('../src/utils/versionPolling.ts', import.meta.url), 'utf8')
  const mainSource = readFileSync(new URL('../src/kglobal/main.ts', import.meta.url), 'utf8')

  assert.match(mainSource, /initVersionPolling\(\)/)
  assert.match(mainSource, /initDevToolsProtection\(\)/)
  assert.match(versionPollingSource, /createVersionPolling/)
  assert.match(versionPollingSource, /import\.meta\.env\.PROD/)
  assert.match(versionPollingSource, /vcType:\s*'versionJson'/)
  assert.match(versionPollingSource, /ElMessageBox\.confirm/)
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

test('Home page keeps quick-entry clock without floating QQ and email contact buttons', () => {
  const appSource = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  const clockSource = readFileSync(new URL('../src/components/AnalogClock.vue', import.meta.url), 'utf8')
  const styleSource = readFileSync(new URL('../src/style/style.scss', import.meta.url), 'utf8')

  assert.match(appSource, /mqqwpa:\/\/im\/chat\?chat_type=wpa&uin=869710179&version=1&src_type=web/)
  assert.match(appSource, /import AnalogClock from '\.\/components\/AnalogClock\.vue'/)
  assert.match(appSource, /<AnalogClock class="header-analog-clock" \/>/)
  assert.match(clockSource, /<el-dialog[\s\S]*?append-to-body[\s\S]*?align-center/)
  assert.match(clockSource, /<el-dialog[\s\S]*?draggable/)
  assert.match(clockSource, /@contextmenu\.prevent="openClockContextMenu"/)
  assert.match(clockSource, /class="clock-context-menu"/)
  assert.match(clockSource, /隐藏弹窗/)
  assert.match(clockSource, /hideClockDialogFromMenu/)
  assert.match(clockSource, /time-greeting/)
  assert.match(clockSource, /凌晨/)
  assert.match(clockSource, /早上/)
  assert.match(clockSource, /中午/)
  assert.match(clockSource, /下午/)
  assert.match(clockSource, /晚上[\s\S]*?睡觉/)
  assert.match(appSource, /<el-dropdown trigger="click" placement="bottom" :teleported="true"/)
  assert.match(styleSource, /\.header-analog-clock\s*\{[\s\S]*?--clock-size:\s*28px/)
  assert.match(styleSource, /\.header-right-actions\s*\{[\s\S]*?width:\s*196px[\s\S]*?height:\s*52px[\s\S]*?overflow:\s*visible/)
  assert.match(styleSource, /\.header-right-actions \.el-dropdown\s*\{[\s\S]*?flex:\s*0 0 132px/)
  assert.match(styleSource, /\.quick-actions-trigger\s*\{[\s\S]*?width:\s*132px/)
  const headerActionsBlocks = [...styleSource.matchAll(/\.header-right-actions\s*\{([^}]*)\}/g)].map((match) => match[1])
  assert.ok(headerActionsBlocks.length > 0)
  assert.ok(headerActionsBlocks.every((block) => !/flex-wrap:\s*wrap\b/.test(block)))
  assert.doesNotMatch(appSource, /class="floating-contact-bar"/)
  assert.doesNotMatch(appSource, /class="floating-contact-icon floating-qq-icon"/)
  assert.doesNotMatch(appSource, /class="floating-contact-icon floating-email-icon"/)
  assert.doesNotMatch(styleSource, /\.floating-contact-bar\s*\{/)
  assert.doesNotMatch(styleSource, /\.floating-contact-icon\s*\{/)
})

test('Juejin theme avatar opens detail modal before external navigation', () => {
  const pageSource = readFileSync(new URL('../src/views/juejinTheme/index.vue', import.meta.url), 'utf8')
  const mapperSource = readFileSync(new URL('../src/vue-pages-text-fn-abc/juejinTheme.ts', import.meta.url), 'utf8')

  assert.match(pageSource, /@click\.prevent\.stop="handleAvatarClick\(u\)"/)
  assert.match(pageSource, /function handleAvatarClick\(u: ThemeRecentUser\): void \{\s*showUserDetailModal\(u\)\s*\}/)
  assert.match(pageSource, /selectedUserFields/)
  assert.match(pageSource, /全部资料/)
  assert.doesNotMatch(mapperSource, /recentUsers:\s*\(raw\.recent_users\s*\|\|\s*\)\.slice/)
})

test('LOLM page renders official news categories and expanded fields', () => {
  const pageSource = readFileSync(new URL('../src/views/lolm/index.vue', import.meta.url), 'utf8')
  const styleSource = readFileSync(new URL('../src/views/lolm/css/index.scss', import.meta.url), 'utf8')
  const apiSource = readFileSync(new URL('../src/utils/lolmApi.ts', import.meta.url), 'utf8')

  assert.match(apiSource, /LOLM_NEWS_PATH\s*=\s*'\/api-lolm-news\/cmc\/cross'/)
  assert.match(apiSource, /serviceId:\s*'166'/)
  assert.match(apiSource, /source:\s*'web_pc'/)
  assert.match(pageSource, /activeNewsIndex\s*=\s*ref<number>\(2\)/)
  assert.match(pageSource, /name:\s*'新闻'[\s\S]*?tags:\s*'113538'/)
  assert.match(pageSource, /name:\s*'版本'[\s\S]*?tags:\s*'119437'/)
  assert.match(pageSource, /name:\s*'公告'[\s\S]*?tags:\s*'113539'/)
  assert.match(pageSource, /name:\s*'社区'[\s\S]*?tags:\s*'113542,113541'/)
  assert.match(pageSource, /name:\s*'赛事'[\s\S]*?tags:\s*'117878,117877,17483,118344'/)
  assert.match(pageSource, /limit:\s*officialNewsPageSize/)
  assert.match(pageSource, /<el-select[\s\S]*?v-model="officialNewsPage"[\s\S]*?filterable[\s\S]*?@change="changeOfficialNewsPage"/)
  assert.match(pageSource, /officialNewsPageOptions\s*=\s*computed<number\[\]>/)
  assert.match(pageSource, /class="hero-card-grid"/)
  assert.match(pageSource, /selectedHero/)
  assert.match(pageSource, /开始吧/)
  assert.match(pageSource, /buildHeroDetailUrl\(hero: HeroRankItem\)[\s\S]*?detail\.html\?heroid=/)
  assert.match(pageSource, /copyHeroDetailLink/)
  assert.match(styleSource, /\.hero-card-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(styleSource, /\.oat-btn\s*\{/)
  assert.match(pageSource, /展开全部字段/)
  assert.match(pageSource, /getNewsRawFields\(news\.raw\)/)
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
