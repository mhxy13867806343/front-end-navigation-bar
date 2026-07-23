/**
 * WcCodeViewer - 语法展示与一键复制的代码块 Web Component
 */
export class WcCodeViewer extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['code', 'lang', 'title']
  }

  private shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    this.render()
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue && this.shadow.hasChildNodes()) {
      this.render()
    }
  }

  private handleCopy = async (): Promise<void> => {
    const code = this.getAttribute('code') || this.textContent || ''
    try {
      await navigator.clipboard.writeText(code.trim())
      const copyBtn = this.shadow.querySelector('.copy-btn')
      if (copyBtn) {
        copyBtn.textContent = '✅ 已复制'
        copyBtn.classList.add('copied')
        setTimeout(() => {
          copyBtn.textContent = '📋 复制代码'
          copyBtn.classList.remove('copied')
        }, 2000)
      }
    } catch {
      // Fallback
    }
  }

  private render(): void {
    const rawCode = (this.getAttribute('code') || this.textContent || '').trim()
    const lang = this.getAttribute('lang') || 'javascript'
    const title = this.getAttribute('title') || `${lang.toUpperCase()} 代码`

    // Escaping HTML
    const escapedCode = rawCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 16px 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .code-card {
          border-radius: 12px;
          background: #1e1e2e;
          color: #cdd6f4;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          border: 1px solid #313244;
        }

        .code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: #181825;
          border-bottom: 1px solid #313244;
        }

        .title-box {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #a6adc8;
        }

        .dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot-red { background: #f38ba8; }
        .dot-yellow { background: #f9e2af; }
        .dot-green { background: #a6e3a1; }

        .copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 6px;
          border: 1px solid #45475a;
          background: #313244;
          color: #cdd6f4;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .copy-btn:hover {
          background: #45475a;
          color: #ffffff;
        }

        .copy-btn.copied {
          background: #a6e3a1;
          color: #11111b;
          border-color: #a6e3a1;
        }

        .code-body {
          padding: 16px;
          margin: 0;
          overflow-x: auto;
          font-size: 0.88rem;
          line-height: 1.6;
        }

        pre {
          margin: 0;
          font-family: inherit;
        }

        code {
          font-family: inherit;
        }
      </style>

      <div class="code-card">
        <div class="code-header">
          <div class="title-box">
            <div class="dots">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
            </div>
            <span>${title}</span>
          </div>
          <button class="copy-btn" type="button">📋 复制代码</button>
        </div>
        <div class="code-body">
          <pre><code>${escapedCode}</code></pre>
        </div>
      </div>
    `

    const copyBtn = this.shadow.querySelector('.copy-btn')
    copyBtn?.addEventListener('click', this.handleCopy)
  }
}
