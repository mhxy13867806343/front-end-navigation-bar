/**
 * WcTabItem & WcTabPanel - HTML Templates & Named Slots & Slotchange Web Components
 */
export class WcTabItem extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['label', 'icon', 'disabled', 'active']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        :host {
          display: block;
        }
        :host([active="false"]) {
          display: none;
        }
        .content {
          padding: 16px;
        }
      </style>
      <div class="content">
        <slot></slot>
      </div>
    `
  }

  get label(): string {
    return this.getAttribute('label') || 'Tab'
  }

  get icon(): string {
    return this.getAttribute('icon') || ''
  }

  get active(): boolean {
    return this.getAttribute('active') === 'true'
  }

  set active(val: boolean) {
    this.setAttribute('active', String(val))
  }
}

export class WcTabPanel extends HTMLElement {
  private shadow: ShadowRoot
  private activeIndex: number = 0

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    this.render()
    this.bindEvents()
  }

  private bindEvents(): void {
    const slotEl = this.shadow.querySelector('slot')
    if (slotEl) {
      slotEl.addEventListener('slotchange', () => {
        this.updateTabs()
      })
    }
  }

  private getItems(): WcTabItem[] {
    const slotEl = this.shadow.querySelector<HTMLSlotElement>('slot')
    if (!slotEl) return []
    const assigned = slotEl.assignedElements({ flatten: true })
    return assigned.filter((el): el is WcTabItem => el.tagName.toLowerCase() === 'wc-tab-item')
  }

  private updateTabs(): void {
    const items = this.getItems()
    const headerContainer = this.shadow.querySelector('.tab-header')
    if (!headerContainer) return

    headerContainer.innerHTML = ''
    items.forEach((item, index) => {
      const isActive = index === this.activeIndex
      item.active = isActive

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = `tab-btn ${isActive ? 'active' : ''}`
      btn.innerHTML = `${item.icon ? `<span class="icon">${item.icon}</span>` : ''}${item.label}`
      btn.addEventListener('click', () => {
        this.selectTab(index)
      })
      headerContainer.appendChild(btn)
    })
  }

  public selectTab(index: number): void {
    const items = this.getItems()
    if (index < 0 || index >= items.length) return
    this.activeIndex = index
    this.updateTabs()

    const selectedItem = items[index]
    this.dispatchEvent(
      new CustomEvent('tab-change', {
        detail: {
          index,
          label: selectedItem.label
        },
        bubbles: true,
        composed: true
      })
    )
  }

  private render(): void {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          overflow: hidden;
          font-family: inherit;
        }

        .tab-header {
          display: flex;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          padding: 4px 8px;
          gap: 4px;
          overflow-x: auto;
        }

        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: #6b7280;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: #111827;
          background: rgba(0, 0, 0, 0.04);
        }

        .tab-btn.active {
          color: #2563eb;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
        }

        .tab-body {
          position: relative;
        }
      </style>

      <div class="tab-header" part="header"></div>
      <div class="tab-body" part="body">
        <slot></slot>
      </div>
    `
  }
}
