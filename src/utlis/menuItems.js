export const menuItemsList = [
  {
    id: 1,
    name: 'AI工具',
    icon: '🤖',
    tools: [
      {
        id: 'ai-1',
        name: 'ChatGPT',
        icon: '🤖',
        desc: 'OpenAI开发的大语言模型',
        status: 'Pro',
        link: 'https://chat.openai.com',
        needVPN: true,
        price: '20$/月',
        region: '国外'
      },
      {
        id: 'ai-2',
        name: 'Claude',
        icon: '🤖',
        desc: 'Anthropic开发的AI助手',
        status: 'Pro',
        link: 'https://claude.ai',
        needVPN: true,
        price: '20$/月',
        region: '国外'
      },
      {
        id: 'ai-3',
        name: 'Gemini',
        icon: '⭐',
        desc: 'Google的AI模型',
        status: 'Pro',
        link: 'https://gemini.google.com',
        needVPN: true,
        price: '免费',
        region: '国外'
      }
    ]
  },
  {
    id: 2,
    name: 'GitHub',
    icon: '📦',
    tools: [
      {
        id: 'github-1',
        name: 'Vue.js',
        desc: '渐进式 JavaScript 框架',
        icon: '💚',
        link: 'https://github.com/vuejs/core',
        stars: '200k+'
      },
      {
        id: 'github-2',
        name: 'React',
        desc: '用于构建用户界面的 JavaScript 库',
        icon: '⚛️',
        link: 'https://github.com/facebook/react',
        stars: '200k+'
      },
      {
        id: 'github-3',
        name: 'TypeScript',
        desc: 'JavaScript的超集',
        icon: '📘',
        link: 'https://github.com/microsoft/TypeScript',
        stars: '90k+'
      },
      {
        id: 'github-4',
        name: 'Vite',
        desc: '下一代前端构建工具',
        icon: '⚡',
        link: 'https://github.com/vitejs/vite',
        stars: '50k+'
      },
      {
        id: 'github-5',
        name: 'Node.js',
        desc: 'JavaScript 运行时',
        icon: '💚',
        link: 'https://github.com/nodejs/node',
        stars: '90k+'
      },
      {
        id: 'github-6',
        name: 'Deno',
        desc: '现代 JavaScript/TypeScript 运行时',
        icon: '🦕',
        link: 'https://github.com/denoland/deno',
        stars: '80k+'
      },
      {
        id: 'github-7',
        name: 'Next.js',
        desc: 'React 框架',
        icon: '▲',
        link: 'https://github.com/vercel/next.js',
        stars: '100k+'
      },
      {
        id: 'github-8',
        name: 'Nuxt',
        desc: 'Vue.js 框架',
        icon: '💚',
        link: 'https://github.com/nuxt/nuxt',
        stars: '40k+'
      },
      {
        id: 'github-9',
        name: 'Svelte',
        desc: '构建用户界面的编译器',
        icon: '🔥',
        link: 'https://github.com/sveltejs/svelte',
        stars: '70k+'
      },
      {
        id: 'github-10',
        name: 'Angular',
        desc: '现代 Web 开发平台',
        icon: '🅰️',
        link: 'https://github.com/angular/angular',
        stars: '80k+'
      },
      {
        id: 'github-11',
        name: 'TailwindCSS',
        desc: '实用优先的 CSS 框架',
        icon: '🎨',
        link: 'https://github.com/tailwindlabs/tailwindcss',
        stars: '60k+'
      },
      {
        id: 'github-12',
        name: 'Electron',
        desc: '使用 JavaScript 构建跨平台应用',
        icon: '⚡',
        link: 'https://github.com/electron/electron',
        stars: '100k+'
      }
    ]
  },
  {
    id: 3,
    name: '作品展示',
    icon: '🎨',
    tools: []
  },
  {
    id: 4,
    name: 'IDE工具',
    icon: '💻',
    tools: [
      {
        id: 'ide-1',
        name: 'VS Code',
        desc: '强大的代码编辑器',
        icon: '💻',
        link: 'https://code.visualstudio.com/',
        platform: 'All',
        price: '免费'
      },
      {
        id: 'ide-2',
        name: 'WebStorm',
        desc: '专业的 JavaScript IDE',
        icon: '🌐',
        link: 'https://www.jetbrains.com/webstorm/',
        platform: 'All',
        price: '付费'
      },
      {
        id: 'ide-3',
        name: 'Sublime Text',
        desc: '轻量级文本编辑器',
        icon: '📝',
        link: 'https://www.sublimetext.com/',
        platform: 'All',
        price: '付费'
      },
      {
        id: 'ide-4',
        name: 'Atom',
        desc: 'GitHub 的可扩展编辑器',
        icon: '⚛️',
        link: 'https://atom.io/',
        platform: 'All',
        price: '免费'
      },
      {
        id: 'ide-5',
        name: 'PyCharm',
        desc: 'Python IDE',
        icon: '🐍',
        link: 'https://www.jetbrains.com/pycharm/',
        platform: 'All',
        price: '付费'
      },
      {
        id: 'ide-6',
        name: 'IntelliJ IDEA',
        desc: 'Java IDE',
        icon: '☕',
        link: 'https://www.jetbrains.com/idea/',
        platform: 'All',
        price: '付费'
      },
      {
        id: 'ide-7',
        name: 'Eclipse',
        desc: '开源 IDE',
        icon: '🌓',
        link: 'https://www.eclipse.org/',
        platform: 'All',
        price: '免费'
      },
      {
        id: 'ide-8',
        name: 'Xcode',
        desc: 'macOS 开发工具',
        icon: '🍎',
        link: 'https://developer.apple.com/xcode/',
        platform: 'macOS',
        price: '免费'
      },
      {
        id: 'ide-9',
        name: 'Android Studio',
        desc: 'Android 开发工具',
        icon: '🤖',
        link: 'https://developer.android.com/studio',
        platform: 'All',
        price: '免费'
      },
      {
        id: 'ide-10',
        name: 'Vim',
        desc: '高效的文本编辑器',
        icon: '📝',
        link: 'https://www.vim.org/',
        platform: 'All',
        price: '免费'
      },
      {
        id: 'ide-11',
        name: 'Emacs',
        desc: '可扩展的文本编辑器',
        icon: '📝',
        link: 'https://www.gnu.org/software/emacs/',
        platform: 'All',
        price: '免费'
      },
      {
        id: 'ide-12',
        name: 'CodePen',
        desc: '在线代码编辑器',
        icon: '🖊️',
        link: 'https://codepen.io/',
        platform: 'Web',
        price: '免费/付费'
      }
    ]
  },
  {
    id: 5,
    name: '前端框架',
    icon: '🎨',
    tools: [
      // Vue PC端
      {
        id: 'element-plus',
        name: 'Element Plus',
        desc: '基于 Vue 3 的桌面端组件库',
        logo: '🎯',
        platform: 'PC',
        link: 'https://github.com/element-plus/element-plus'
      },
      {
        id: 'naive-ui',
        name: 'Naive UI',
        desc: '一个 Vue 3 组件库',
        logo: '🎨',
        platform: 'PC',
        link: 'https://github.com/TuSimple/naive-ui'
      },
      {
        id: 'arco-design-vue',
        name: 'Arco Design Vue',
        desc: '字节跳动出品的企业级设计系统',
        logo: '🎭',
        platform: 'PC',
        link: 'https://github.com/arco-design/arco-design-vue'
      },
      {
        id: 'vuetify',
        name: 'Vuetify',
        desc: 'Material Design 风格的 Vue UI 库',
        logo: '💎',
        platform: 'PC',
        link: 'https://github.com/vuetifyjs/vuetify'
      },
      {
        id: 'primevue',
        name: 'PrimeVue',
        desc: '功能丰富的 Vue UI 组件库',
        logo: '🔷',
        platform: 'PC',
        link: 'https://github.com/primefaces/primevue'
      },
      // Vue 移动端
      {
        id: 'vant',
        name: 'Vant',
        desc: '轻量、可靠的移动端 Vue 组件库',
        logo: '📱',
        platform: 'Mobile',
        link: 'https://github.com/youzan/vant'
      },
      {
        id: 'nutui',
        name: 'NutUI',
        desc: '京东风格的移动端组件库',
        logo: '🥜',
        platform: 'Mobile',
        link: 'https://github.com/jdf2e/nutui'
      },
      {
        id: 'varlet',
        name: 'Varlet',
        desc: 'Material 风格移动端组件库',
        logo: '🎪',
        platform: 'Mobile',
        link: 'https://github.com/varletjs/varlet'
      },
      // React PC端
      {
        id: 'ant-design',
        name: 'Ant Design',
        desc: '企业级 UI 设计语言和 React 组件库',
        logo: '🐜',
        platform: 'PC',
        link: 'https://github.com/ant-design/ant-design'
      },
      {
        id: 'material-ui',
        name: 'Material-UI',
        desc: '实现了 Google Material Design 的 React 组件',
        logo: '🎨',
        platform: 'PC',
        link: 'https://github.com/mui/material-ui'
      },
      {
        id: 'chakra-ui',
        name: 'Chakra UI',
        desc: '简单、模块化的 React 组件库',
        logo: '⚡',
        platform: 'PC',
        link: 'https://github.com/chakra-ui/chakra-ui'
      },
      {
        id: 'arco-design',
        name: 'Arco Design React',
        desc: '字节跳动企业级设计系统',
        logo: '🎭',
        platform: 'PC',
        link: 'https://github.com/arco-design/arco-design'
      },
      {
        id: 'semi-design',
        name: 'Semi Design',
        desc: '抖音企业级设计系统',
        logo: '🎨',
        platform: 'PC',
        link: 'https://github.com/DouyinFE/semi-design'
      },
      // React 移动端
      {
        id: 'ant-design-mobile',
        name: 'Ant Design Mobile',
        desc: '移动端设计规范和 React 实现',
        logo: '📱',
        platform: 'Mobile',
        link: 'https://github.com/ant-design/ant-design-mobile'
      },
      {
        id: 'zarm',
        name: 'Zarm',
        desc: '众安科技移动端组件库',
        logo: '📱',
        platform: 'Mobile',
        link: 'https://github.com/ZhongAnTech/zarm'
      },
      // uni-app 相关
      {
        id: 'uni-app',
        name: 'uni-app',
        desc: '使用 Vue.js 开发所有前端应用的框架',
        logo: '📱',
        platform: 'All',
        link: 'https://github.com/dcloudio/uni-app'
      },
      {
        id: 'uview-ui',
        name: 'uView UI',
        desc: '全面兼容 nvue 的 uni-app 生态框架',
        logo: '🎯',
        platform: 'All',
        link: 'https://github.com/umicro/uView2.0'
      },
      {
        id: 'uni-ui',
        name: 'uni-ui',
        desc: 'DCloud 官方组件库',
        logo: '🎨',
        platform: 'All',
        link: 'https://github.com/dcloudio/uni-ui'
      },
      {
        id: 'thorui',
        name: 'Thor UI',
        desc: '轻量、简洁的移动端组件库',
        logo: '⚡',
        platform: 'All',
        link: 'https://github.com/dingyong0214/ThorUI-uniapp'
      },
      {
        id: 'grace-ui',
        name: 'Grace UI',
        desc: '优雅的 uni-app 生态框架',
        logo: '🌺',
        platform: 'All',
        link: 'https://github.com/GraceUI5/GraceUI5'
      },
      {
        id: 'cool-ui',
        name: 'Cool UI',
        desc: '清爽简洁的 uni-app UI 框架',
        logo: '❄️',
        platform: 'All',
        link: 'https://github.com/cool-team-official/cool-uni'
      },
      // 跨端框架
      {
        id: 'taro',
        name: 'Taro',
        desc: '多端统一开发框架',
        logo: '🌈',
        platform: 'All',
        link: 'https://github.com/NervJS/taro'
      },
      {
        id: 'ionic',
        name: 'Ionic',
        desc: '跨平台移动应用开发框架',
        logo: '⚡',
        platform: 'All',
        link: 'https://github.com/ionic-team/ionic-framework'
      }
    ]
  },
]

export const onlineWorksList = [
  {
    name: '图片处理工具',
    desc: '支持图片裁剪、旋转、缩放等功能',
    logo: '🖼️',
    component: 'dialog'
  },
  {
    name: '推箱子游戏',
    desc: '经典推箱子游戏，支持多个关卡',
    logo: '🎮',
    component: 'dialog'
  }
]

export const authorWorksList=[
  {
    name: '群团集市',
    link: 'https://m.hzszqt.com/#/',
    desc: '(请在微信中打开)'
  },
  {
    name: '就业码学生端',
    link: 'https://em-h5.redcross668.com/#/',
    desc: '(请在微信中打开)'
  },
  {
    name: '就业码企业端',
    link: 'https://em-h5-company.redcross668.com/#/',
    desc: '(请在微信中打开)'
  },
  {
    name: '绍红捐赠',
    link: 'https://yhby.redcross668.com/#/',
    desc: '(请在微信中打开)'
  },
  {
    name: '生命教育',
    link: '#',
    desc: '(请在微信小程序中搜索)'
  },
  {
    name: '浙里博爱',
    link: 'https://zlba.shaoxingredcross.org.cn/#/login',
    desc: '(请在微信中打开)或在浙里办中搜索访问'
  },
  {
    name: '200s\'s 个人博客',
    link: 'https://mhxy13867806343.github.io/vuepressBlogDemo/',
    desc: 'VuePress 博客'
  },
  {
    name: 'GitHub',
    link: 'https://github.com/mhxy13867806343',
    desc: '开源代码仓库'
  },
  {
    name: '掘金主页',
    link: 'https://juejin.cn/user/1310273588955581',
    desc: '技术文章分享'
  }
]