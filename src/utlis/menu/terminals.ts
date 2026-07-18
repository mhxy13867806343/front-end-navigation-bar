import type { NavigationList } from '@/types/navigation'

export const terminals: NavigationList = [
  {
    id: 26,
    name: '终端',
    icon: '⌨️',
    tools: [
      {
        id: 'terminal-xtermjs',
        name: 'xterm.js',
        desc: '浏览器端终端模拟器，VS Code 集成终端等项目采用的核心方案。',
        icon: '▣',
        link: 'https://github.com/xtermjs/xterm.js',
        platform: 'Web',
        price: '免费',
        type: 'terminal'
      },
      {
        id: 'terminal-iterm2',
        name: 'iTerm2',
        desc: 'macOS 上经典开源终端，支持标签、分屏、搜索和丰富配置。',
        icon: '⌘',
        link: 'https://github.com/gnachman/iTerm2',
        platform: 'macOS',
        price: '免费',
        type: 'terminal'
      },
      {
        id: 'terminal-warp',
        name: 'Warp',
        desc: '现代化 AI 终端，提供命令块、协作和智能补全体验。',
        icon: 'W',
        link: 'https://www.warp.dev/',
        platform: 'All',
        price: '免费/付费',
        type: 'terminal'
      },
      {
        id: 'terminal-ghostty',
        name: 'Ghostty',
        desc: 'Mitchell Hashimoto 发起的高性能终端，强调原生体验和速度。',
        icon: 'G',
        link: 'https://ghostty.org/',
        platform: 'macOS/Linux',
        price: '免费',
        type: 'terminal'
      },
      {
        id: 'terminal-wezterm',
        name: 'WezTerm',
        desc: '跨平台 GPU 加速终端，支持 Lua 配置、多路复用和丰富外观。',
        icon: 'WZ',
        link: 'https://github.com/wez/wezterm',
        platform: 'All',
        price: '免费',
        type: 'terminal'
      },
      {
        id: 'terminal-alacritty',
        name: 'Alacritty',
        desc: '轻量快速的跨平台终端模拟器，使用 OpenGL 渲染。',
        icon: 'A',
        link: 'https://github.com/alacritty/alacritty',
        platform: 'All',
        price: '免费',
        type: 'terminal'
      },
      {
        id: 'terminal-hyper',
        name: 'Hyper',
        desc: '基于 Web 技术构建的可扩展终端，适合插件化外观定制。',
        icon: 'H',
        link: 'https://github.com/vercel/hyper',
        platform: 'All',
        price: '免费',
        type: 'terminal'
      },
      {
        id: 'terminal-windows-terminal',
        name: 'Windows Terminal',
        desc: '微软开源终端应用，支持 PowerShell、WSL、标签页和主题。',
        icon: '⊞',
        link: 'https://github.com/microsoft/terminal',
        platform: 'Windows',
        price: '免费',
        type: 'terminal'
      },
      {
        id: 'terminal-starship',
        name: 'Starship',
        desc: '跨 Shell 的极速提示符，适合打造清爽统一的命令行状态栏。',
        icon: '★',
        link: 'https://github.com/starship/starship',
        platform: 'All',
        price: '免费',
        type: 'terminal'
      },
      {
        id: 'terminal-oh-my-zsh',
        name: 'Oh My Zsh',
        desc: 'Zsh 配置框架，提供主题、插件和常用命令行增强。',
        icon: 'Z',
        link: 'https://github.com/ohmyzsh/ohmyzsh',
        platform: 'All',
        price: '免费',
        type: 'terminal'
      },
      {
        id: 'terminal-vue-command',
        name: 'vue-command',
        desc: 'Vue 终端模拟组件，适合在页面中构建命令式交互演示。',
        icon: 'V',
        link: 'https://github.com/ndabAP/vue-command',
        platform: 'Vue',
        price: '免费',
        type: 'terminal-ui'
      },
      {
        id: 'terminal-vue-web-terminal',
        name: 'vue-web-terminal',
        desc: 'Web 命令行窗口插件，支持历史命令、拖拽、缩放和模拟输出。',
        icon: 'VW',
        link: 'https://tzfun.github.io/vue-web-terminal/',
        platform: 'Vue',
        price: '免费',
        type: 'terminal-ui'
      },
      {
        id: 'terminal-termo',
        name: 'Termo',
        desc: '基于 xterm.js 的网站终端界面封装，适合快速做终端风格组件。',
        icon: 'T',
        link: 'https://github.com/rajnandan1/termo',
        platform: 'Web',
        price: '免费',
        type: 'terminal-ui'
      }
    ]
  }
]
