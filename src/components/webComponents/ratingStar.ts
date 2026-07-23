/**
 * WcRatingStar - 高级表单关联与 CSS 变量 Web Component
 */
export class WcRatingStar extends HTMLElement {
  static formAssociated = true

  static get observedAttributes(): string[] {
    return ['value', 'max', 'readonly', 'color']
  }

  private shadow: ShadowRoot
  private hoverValue: number = 0
  private internals?: ElementInternals

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    if ('attachInternals' in this) {
      this.internals = this.attachInternals()
    }
  }

  get value(): number {
    return parseFloat(this.getAttribute('value') || '0')
  }

  set value(val: number) {
    this.setAttribute('value', String(val))
    if (this.internals) {
      this.internals.setFormValue(String(val))
    }
  }

  get max(): number {
    return parseInt(this.getAttribute('max') || '5', 10)
  }

  get readonly(): boolean {
    return this.hasAttribute('readonly')
  }

  connectedCallback(): void {
    this.render()
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue && this.shadow.hasChildNodes()) {
      this.render()
    }
  }

  private setRating(val: number): void {
    if (this.readonly) return
    this.value = val
    this.dispatchEvent(
      new CustomEvent('rating-change', {
        detail: { value: val, max: this.max },
        bubbles: true,
        composed: true
      })
    )
  }

  private render(): void {
    const max = this.max
    const val = this.value
    const customColor = this.getAttribute('color') || '#f59e0b'

    let starsHtml = ''
    for (let i = 1; i <= max; i++) {
      const isFilled = i <= val
      starsHtml += `
        <span class="star ${isFilled ? 'filled' : ''}" data-val="${i}" part="star star-${i}">
          ★
        </span>
      `
    }

    this.shadow.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          --star-color: ${customColor};
          --star-size: 1.5rem;
          font-family: sans-serif;
          user-select: none;
        }

        .star-container {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          cursor: ${this.readonly ? 'default' : 'pointer'};
        }

        .star {
          font-size: var(--star-size);
          color: #d1d5db;
          transition: transform 0.15s ease, color 0.15s ease;
        }

        .star.filled {
          color: var(--star-color);
        }

        .star-container:not(.readonly) .star:hover {
          transform: scale(1.2);
          color: var(--star-color);
        }

        .rating-text {
          font-size: 0.9rem;
          font-weight: 700;
          color: #4b5563;
          margin-left: 6px;
        }
      </style>

      <div class="star-container ${this.readonly ? 'readonly' : ''}">
        ${starsHtml}
      </div>
      <span class="rating-text" part="text">${val} / ${max}</span>
    `

    if (!this.readonly) {
      const stars = this.shadow.querySelectorAll('.star')
      stars.forEach((star) => {
        star.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement
          const ratingVal = parseInt(target.getAttribute('data-val') || '0', 10)
          this.setRating(ratingVal)
        })
      })
    }
  }
}
