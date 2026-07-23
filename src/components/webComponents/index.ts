import { WcUserCard } from './userCard'
import { WcCounterButton } from './counterButton'
import { WcTabPanel, WcTabItem } from './tabPanel'
import { WcRatingStar } from './ratingStar'
import { WcCodeViewer } from './codeViewer'

export { WcUserCard, WcCounterButton, WcTabPanel, WcTabItem, WcRatingStar, WcCodeViewer }

export function registerWebComponents(): void {
  if (typeof window === 'undefined' || !('customElements' in window)) return

  const components: [string, CustomElementConstructor][] = [
    ['wc-user-card', WcUserCard],
    ['wc-counter-button', WcCounterButton],
    ['wc-tab-panel', WcTabPanel],
    ['wc-tab-item', WcTabItem],
    ['wc-rating-star', WcRatingStar],
    ['wc-code-viewer', WcCodeViewer]
  ]

  components.forEach(([name, constructor]) => {
    if (!customElements.get(name)) {
      customElements.define(name, constructor)
    }
  })
}

// 自动注册组件库
registerWebComponents()
