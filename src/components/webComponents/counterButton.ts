/**
 * WcCounterButton - 属性监听与双向数据流 Web Component
 */
export class WcCounterButton extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['count', 'step', 'disabled', 'variant']
  }

  private shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  get count(): number {
    return parseInt(this.getAttribute('count') || '0', 10)
  }

  set count(val: number) {
    this.setAttribute('count', String(val))
  }

  get step(): number {
    return parseInt(this.getAttribute('step') || '1', 10)
  }

  set step(val: number) {
    this.setAttribute('step', String(val))
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled')
  }

  set disabled(val: boolean) {
    if (val) {
      this.setAttribute('disabled', '')
    } else {
      this.removeAttribute('disabled')
    }
  }

  connectedCallback(): void {
    this.render()
    this.bindEvents()
  }

  disconnectedCallback(): void {
    this.unbindEvents()
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue && this.shadow.hasChildNodes()) {
      this.render()
      this.bindEvents()
    }
  }

  private handleDecrement = (): void => {
    if (this.disabled) return
    const nextCount = this.count - this.step
    this.count = nextCount
    this.dispatchChangeEvent('decrement', nextCount)
  }

  private handleIncrement = (): void => {
    if (this.disabled) return
    const nextCount = this.count + this.step
    this.count = nextCount
    this.dispatchChangeEvent('increment', nextCount)
  }

  private handleReset = (): void => {
    if (this.disabled) return
    this.count = 0
    this.dispatchChangeEvent('reset', 0)
  }

  private dispatchChangeEvent(action: string, newCount: number): void {
    this.dispatchEvent(
      new CustomEvent('count-change', {
        detail: {
          count: newCount,
          step: this.step,
          action
        },
        bubbles: true,
        composed: true
      })
    )
  }

  private bindEvents(): void {
    const decBtn = this.shadow.querySelector('.btn-dec')
    const incBtn = this.shadow.querySelector('.btn-inc')
    const resetBtn = this.shadow.querySelector('.btn-reset')

    decBtn?.addEventListener('click', this.handleDecrement)
    incBtn?.addEventListener('click', this.handleIncrement)
    resetBtn?.addEventListener('click', this.handleReset)
  }

  private unbindEvents(): void {
    const decBtn = this.shadow.querySelector('.btn-dec')
    const incBtn = this.shadow.querySelector('.btn-inc')
    const resetBtn = this.shadow.querySelector('.btn-reset')

    decBtn?.removeEventListener('click', this.handleDecrement)
    incBtn?.removeEventListener('click', this.handleIncrement)
    resetBtn?.removeEventListener('click', this.handleReset)
  }

  private render(): void {
    const variant = this.getAttribute('variant') || 'primary'
    const isDisabled = this.disabled

    this.shadow.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: inherit;
          user-select: none;
        }

        :host([disabled]) {
          opacity: 0.55;
          pointer-events: none;
        }

        .counter-group {
          display: inline-flex;
          align-items: center;
          border-radius: 12px;
          padding: 4px;
          background: rgba(243, 244, 246, 0.8);
          border: 1px solid rgba(209, 213, 219, 0.6);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .variant-success .btn { background: #10b981; }
        .variant-warning .btn { background: #f59e0b; }
        .variant-purple .btn { background: #8b5cf6; }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: #3b82f6;
          color: #ffffff;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn:hover {
          filter: brightness(1.1);
          transform: scale(1.04);
        }

        .btn:active {
          transform: scale(0.96);
        }

        .count-display {
          min-width: 48px;
          text-align: center;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
          font-mono: tabular-nums;
          padding: 0 8px;
        }

        .btn-reset {
          font-size: 0.75rem;
          width: auto;
          padding: 0 10px;
          background: #6b7280;
        }
      </style>

      <div class="counter-group variant-${variant}">
        <button class="btn btn-dec" part="button dec-button" type="button" ${isDisabled ? 'disabled' : ''}>-</button>
        <span class="count-display" part="display">${this.count}</span>
        <button class="btn btn-inc" part="button inc-button" type="button" ${isDisabled ? 'disabled' : ''}>+</button>
        <button class="btn btn-reset" part="button reset-button" type="button" ${isDisabled ? 'disabled' : ''}>重置</button>
      </div>
    `
  }
}
