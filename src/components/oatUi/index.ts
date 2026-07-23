/**
 * Oat UI Web Components & Native Registrations (oat.ink)
 */

export class OtDropdown extends HTMLElement {
  private shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    this.render()
    this.bindEvents()
  }

  private bindEvents(): void {
    const trigger = this.shadow.querySelector('.dropdown-trigger')
    const menu = this.shadow.querySelector('.dropdown-menu')

    trigger?.addEventListener('click', (e) => {
      e.stopPropagation()
      menu?.classList.toggle('show')
    })

    document.addEventListener('click', () => {
      menu?.classList.remove('show')
    })
  }

  private render(): void {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
          font-family: inherit;
        }

        .dropdown-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #374151;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dropdown-trigger:hover {
          border-color: #9ca3af;
          background: #f9fafb;
        }

        .dropdown-menu {
          display: none;
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          min-width: 160px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          padding: 6px;
          z-index: 100;
        }

        .dropdown-menu.show {
          display: block;
          animation: dropFade 0.2s ease;
        }

        @keyframes dropFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        ::slotted(a), ::slotted(button), ::slotted(div) {
          display: block;
          padding: 8px 12px;
          font-size: 0.85rem;
          color: #374151;
          text-decoration: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        ::slotted(a:hover), ::slotted(button:hover) {
          background: #f3f4f6;
          color: #111827;
        }
      </style>

      <button class="dropdown-trigger" type="button">
        <slot name="label">Menu ▾</slot>
      </button>
      <div class="dropdown-menu">
        <slot></slot>
      </div>
    `
  }
}

export class OtTagInput extends HTMLElement {
  private shadow: ShadowRoot
  private tags: string[] = ['Oat UI', 'WebComponent', 'CSS']

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    this.render()
  }

  private addTag(tag: string): void {
    const trimmed = tag.trim()
    if (trimmed && !this.tags.includes(trimmed)) {
      this.tags.push(trimmed)
      this.render()
      this.dispatchEvent(new CustomEvent('change', { detail: { tags: this.tags }, bubbles: true, composed: true }))
    }
  }

  private removeTag(index: number): void {
    this.tags.splice(index, 1)
    this.render()
    this.dispatchEvent(new CustomEvent('change', { detail: { tags: this.tags }, bubbles: true, composed: true }))
  }

  private render(): void {
    const tagsHtml = this.tags
      .map(
        (t, idx) => `
        <span class="tag">
          ${t}
          <button class="tag-close" data-idx="${idx}" type="button">×</button>
        </span>
      `
      )
      .join('')

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: inherit;
        }

        .tag-container {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          min-height: 42px;
          box-sizing: border-box;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(99, 102, 241, 0.12);
          color: #4f46e5;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 14px;
        }

        .tag-close {
          border: none;
          background: transparent;
          color: #4f46e5;
          font-size: 1rem;
          cursor: pointer;
          padding: 0 2px;
          line-height: 1;
        }

        .tag-close:hover {
          color: #ef4444;
        }

        .tag-input {
          border: none;
          outline: none;
          flex: 1;
          min-width: 80px;
          font-size: 0.88rem;
          padding: 4px;
          background: transparent;
        }
      </style>

      <div class="tag-container">
        ${tagsHtml}
        <input class="tag-input" type="text" placeholder="输入标签按回车添加..." />
      </div>
    `

    const input = this.shadow.querySelector<HTMLInputElement>('.tag-input')
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        this.addTag(input.value)
        input.value = ''
      }
    })

    const closeBtns = this.shadow.querySelectorAll('.tag-close')
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10)
        this.removeTag(idx)
      })
    })
  }
}

export class OtTabs extends HTMLElement {
  private shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    this.render()
  }

  private render(): void {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          overflow: hidden;
        }
        .header {
          display: flex;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          padding: 4px 8px;
        }
        ::slotted([slot="header"]) {
          padding: 8px 16px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #4b5563;
          border-radius: 6px;
          cursor: pointer;
        }
        .body {
          padding: 16px;
        }
      </style>
      <div class="header">
        <slot name="header"></slot>
      </div>
      <div class="body">
        <slot></slot>
      </div>
    `
  }
}

export class OtUpload extends HTMLElement {
  private shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    this.render()
  }

  private render(): void {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .upload-box {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 32px 20px;
          text-align: center;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .upload-box:hover {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.04);
        }
        .icon {
          font-size: 2rem;
          margin-bottom: 8px;
        }
        .title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #334155;
        }
        .sub {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 4px;
        }
      </style>

      <div class="upload-box">
        <div class="icon">📁</div>
        <div class="title">点击或将文件拖拽到此处上传</div>
        <div class="sub">支持各种图片、文档与压缩包文件</div>
      </div>
    `
  }
}

export function registerOatUiComponents(): void {
  if (typeof window === 'undefined' || !('customElements' in window)) return

  const list: [string, CustomElementConstructor][] = [
    ['ot-dropdown', OtDropdown],
    ['ot-tag-input', OtTagInput],
    ['ot-tabs', OtTabs],
    ['ot-upload', OtUpload]
  ]

  list.forEach(([name, ctor]) => {
    if (!customElements.get(name)) {
      customElements.define(name, ctor)
    }
  })
}

registerOatUiComponents()
