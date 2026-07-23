/**
 * WcUserCard - 基础与 Shadow DOM 结合的 Web Component 示例
 * 参考 MDN Custom Elements / Shadow DOM & 阮一峰 Web Components 教程
 */
export class WcUserCard extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['name', 'avatar', 'bio', 'theme', 'status', 'likes']
  }

  private shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    this.render()
    this.bindEvents()
  }

  disconnectedCallback(): void {
    const likeBtn = this.shadow.querySelector('.like-btn')
    if (likeBtn) {
      likeBtn.removeEventListener('click', this.handleLikeClick)
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue && this.shadow.hasChildNodes()) {
      this.updateContent(name, newValue)
    }
  }

  private updateContent(name: string, newValue: string | null): void {
    const val = newValue || ''
    if (name === 'name') {
      const nameEl = this.shadow.querySelector('.user-name-text')
      if (nameEl) nameEl.textContent = val || '匿名用户'
    } else if (name === 'bio') {
      const bioEl = this.shadow.querySelector('.user-bio-text')
      if (bioEl) bioEl.textContent = val || '暂无个人简介'
    } else if (name === 'avatar') {
      const imgEl = this.shadow.querySelector<HTMLImageElement>('.avatar-img')
      if (imgEl) imgEl.src = val || 'https://api.dicebear.com/7.x/avataaars/svg?seed=WebComponents'
    } else if (name === 'likes') {
      const countEl = this.shadow.querySelector('.like-count')
      if (countEl) countEl.textContent = val || '0'
    } else if (name === 'status') {
      const statusEl = this.shadow.querySelector('.status-indicator')
      if (statusEl) {
        statusEl.className = `status-indicator status-${val || 'online'}`
      }
    } else if (name === 'theme') {
      const cardEl = this.shadow.querySelector('.card-container')
      if (cardEl) {
        cardEl.className = `card-container theme-${val || 'light'}`
      }
    }
  }

  private handleLikeClick = (): void => {
    const currentLikes = parseInt(this.getAttribute('likes') || '0', 10)
    const newLikes = currentLikes + 1
    this.setAttribute('likes', String(newLikes))

    // 触发标准组合冒泡自定义事件
    this.dispatchEvent(
      new CustomEvent('user-like', {
        detail: {
          name: this.getAttribute('name') || '匿名',
          likes: newLikes
        },
        bubbles: true,
        composed: true // 允许跨越 Shadow DOM 边界向外冒泡
      })
    )
  }

  private bindEvents(): void {
    const likeBtn = this.shadow.querySelector('.like-btn')
    if (likeBtn) {
      likeBtn.addEventListener('click', this.handleLikeClick)
    }
  }

  private render(): void {
    const avatar = this.getAttribute('avatar') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=WebComponents'
    const name = this.getAttribute('name') || '原生 Web Component'
    const bio = this.getAttribute('bio') || '基于 W3C 标准 Custom Elements 与 Shadow DOM 构建'
    const theme = this.getAttribute('theme') || 'light'
    const status = this.getAttribute('status') || 'online'
    const likes = this.getAttribute('likes') || '0'

    this.shadow.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
          margin: 8px;
        }

        :host([hidden]) {
          display: none;
        }

        .card-container {
          position: relative;
          width: 320px;
          border-radius: 16px;
          padding: 20px;
          box-sizing: border-box;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(229, 231, 235, 0.8);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .card-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
        }

        .card-container.theme-dark {
          background: #1f2937;
          color: #f9fafb;
          border-color: #374151;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .card-container.theme-gradient {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
          color: #ffffff;
          border: none;
          box-shadow: 0 12px 32px rgba(99, 102, 241, 0.35);
        }

        .header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 14px;
        }

        .avatar-box {
          position: relative;
          width: 64px;
          height: 64px;
          flex-shrink: 0;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.8);
          background: #f3f4f6;
        }

        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #ffffff;
        }

        .status-online { background-color: #10b981; }
        .status-offline { background-color: #9ca3af; }
        .status-busy { background-color: #ef4444; }

        .info {
          flex: 1;
          min-width: 0;
        }

        .name-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-name-text {
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bio-wrapper {
          margin-top: 4px;
        }

        .user-bio-text {
          font-size: 0.85rem;
          opacity: 0.8;
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        ::slotted([slot="tag"]) {
          display: inline-block;
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.15);
          color: #4f46e5;
          font-weight: 600;
        }

        .card-container.theme-dark ::slotted([slot="tag"]) {
          background: rgba(165, 180, 252, 0.2);
          color: #c7d2fe;
        }

        .card-container.theme-gradient ::slotted([slot="tag"]) {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .footer {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid rgba(156, 163, 175, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .like-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: none;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .card-container.theme-gradient .like-btn {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .like-btn:hover {
          transform: scale(1.05);
          background: rgba(239, 68, 68, 0.2);
        }

        .like-btn:active {
          transform: scale(0.95);
        }

        .like-icon {
          font-size: 1rem;
        }
      </style>

      <div class="card-container theme-${theme}" part="card">
        <div class="header">
          <div class="avatar-box">
            <slot name="avatar">
              <img class="avatar-img" src="${avatar}" alt="avatar" />
            </slot>
            <div class="status-indicator status-${status}" part="status"></div>
          </div>
          <div class="info">
            <div class="name-wrapper">
              <slot name="name">
                <h4 class="user-name-text">${name}</h4>
              </slot>
              <slot name="tag"></slot>
            </div>
            <div class="bio-wrapper">
              <slot name="bio">
                <p class="user-bio-text">${bio}</p>
              </slot>
            </div>
          </div>
        </div>

        <div class="footer">
          <slot name="actions">
            <button class="like-btn" part="button" type="button">
              <span class="like-icon">❤️</span>
              <span class="like-count">${likes}</span>
            </button>
          </slot>
          <slot></slot>
        </div>
      </div>
    `
  }
}
