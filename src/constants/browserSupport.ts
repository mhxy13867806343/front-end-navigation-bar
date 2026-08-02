export interface BrowserDownloadLink {
  name: string
  vendor: string
  url: string
}

export interface BrowserFeatureCheck {
  label: string
  supported: boolean
}

export const BROWSER_DOWNLOAD_LINKS: BrowserDownloadLink[] = [
  { name: 'Google Chrome', vendor: 'Google', url: 'https://www.google.com/chrome/' },
  { name: 'Microsoft Edge', vendor: 'Microsoft', url: 'https://www.microsoft.com/edge' },
  { name: 'Firefox', vendor: 'Mozilla', url: 'https://www.mozilla.org/firefox/new/' },
  { name: '360 安全浏览器', vendor: '360', url: 'https://browser.360.cn/' },
  { name: 'QQ 浏览器', vendor: 'Tencent', url: 'https://browser.qq.com/' }
]

export const CLOSE_TIP_STORAGE_KEY: string = 'hooksvue-browser-dialog-close-tip-shown'
export const AUTHOR_GITHUB_URL: string = 'https://github.com/mhxy13867806343'
