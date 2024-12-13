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
      },
      {
        id: 'ai-4',
        name: 'Bard',
        icon: '🎭',
        desc: 'Google的AI聊天助手',
        status: 'Free',
        link: 'https://bard.google.com',
        needVPN: true,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-5',
        name: 'Copilot',
        icon: '👨‍💻',
        desc: 'Microsoft的AI助手',
        status: 'Pro',
        link: 'https://copilot.microsoft.com',
        needVPN: false,
        price: '20$/月',
        region: '国外'
      },
      {
        id: 'ai-6',
        name: 'Midjourney',
        icon: '🎨',
        desc: '专业的AI图像生成工具',
        status: 'Pro',
        link: 'https://www.midjourney.com',
        needVPN: true,
        price: '30$/月',
        region: '国外'
      },
      {
        id: 'ai-7',
        name: 'DALL-E 3',
        icon: '🖼️',
        desc: 'OpenAI的图像生成模型',
        status: 'Pro',
        link: 'https://openai.com/dall-e-3',
        needVPN: true,
        price: '按量付费',
        region: '国外'
      },
      {
        id: 'ai-8',
        name: 'GitHub Copilot',
        icon: '💻',
        desc: 'AI代码助手',
        status: 'Pro',
        link: 'https://github.com/features/copilot',
        needVPN: false,
        price: '10$/月',
        region: '国外'
      },
      {
        id: 'ai-9',
        name: 'Codeium',
        icon: '⌨️',
        desc: 'AI代码补全工具',
        status: 'Free',
        link: 'https://codeium.com',
        needVPN: false,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-10',
        name: 'Murf AI',
        icon: '🎤',
        desc: 'AI语音生成工具',
        status: 'Pro',
        link: 'https://murf.ai',
        needVPN: false,
        price: '29$/月',
        region: '国外'
      },
      {
        id: 'ai-11',
        name: 'Runway',
        icon: '🎥',
        desc: 'AI视频编辑工具',
        status: 'Pro',
        link: 'https://runway.ml',
        needVPN: true,
        price: '15$/月',
        region: '国外'
      },
      {
        id: 'ai-12',
        name: '文心一言',
        icon: '🇨🇳',
        desc: '百度的AI助手',
        status: 'Free',
        link: 'https://yiyan.baidu.com',
        needVPN: false,
        price: '免费',
        region: '国内'
      },
      {
        id: 'ai-13',
        name: '通义千问',
        icon: '🇨🇳',
        desc: '阿里的AI助手',
        status: 'Free',
        link: 'https://qianwen.aliyun.com',
        needVPN: false,
        price: '免费',
        region: '国内'
      },
      {
        id: 'ai-14',
        name: 'Jasper',
        icon: '✍️',
        desc: 'AI写作助手',
        status: 'Pro',
        link: 'https://www.jasper.ai',
        needVPN: true,
        price: '49$/月',
        region: '国外'
      },
      {
        id: 'ai-15',
        name: 'Copy.ai',
        icon: '📝',
        desc: 'AI文案生成工具',
        status: 'Pro',
        link: 'https://www.copy.ai',
        needVPN: true,
        price: '36$/月',
        region: '国外'
      },
      {
        id: 'ai-16',
        name: 'Writesonic',
        icon: '📄',
        desc: 'AI内容创作平台',
        status: 'Pro',
        link: 'https://writesonic.com',
        needVPN: true,
        price: '19$/月',
        region: '国外'
      },
      {
        id: 'ai-17',
        name: 'Stable Diffusion',
        icon: '🎨',
        desc: 'AI图像生成模型',
        status: 'Free',
        link: 'https://stability.ai',
        needVPN: true,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-18',
        name: 'Adobe Firefly',
        icon: '🎨',
        desc: 'Adobe的AI创意套件',
        status: 'Pro',
        link: 'https://www.adobe.com/firefly',
        needVPN: false,
        price: '订阅制',
        region: '国外'
      },
      {
        id: 'ai-19',
        name: 'DeepL',
        icon: '🌐',
        desc: 'AI翻译工具',
        status: 'Pro',
        link: 'https://www.deepl.com',
        needVPN: false,
        price: '30$/月',
        region: '国外'
      },
      {
        id: 'ai-20',
        name: 'Grammarly',
        icon: '✍️',
        desc: 'AI写作改进工具',
        status: 'Pro',
        link: 'https://www.grammarly.com',
        needVPN: false,
        price: '30$/月',
        region: '国外'
      },
      {
        id: 'ai-21',
        name: 'Notion AI',
        icon: '📝',
        desc: 'AI辅助写作和组织工具',
        status: 'Pro',
        link: 'https://www.notion.so',
        needVPN: false,
        price: '10$/月',
        region: '国外'
      },
      {
        id: 'ai-22',
        name: 'Otter.ai',
        icon: '🎙️',
        desc: 'AI会议记录和转录工具',
        status: 'Pro',
        link: 'https://otter.ai',
        needVPN: false,
        price: '20$/月',
        region: '国外'
      },
      {
        id: 'ai-23',
        name: 'Descript',
        icon: '🎬',
        desc: 'AI视频编辑平台',
        status: 'Pro',
        link: 'https://www.descript.com',
        needVPN: true,
        price: '15$/月',
        region: '国外'
      },
      {
        id: 'ai-24',
        name: 'Synthesia',
        icon: '🎥',
        desc: 'AI视频生成平台',
        status: 'Pro',
        link: 'https://www.synthesia.io',
        needVPN: true,
        price: '30$/月',
        region: '国外'
      },
      {
        id: 'ai-25',
        name: 'Beautiful.ai',
        icon: '📊',
        desc: 'AI演示文稿制作工具',
        status: 'Pro',
        link: 'https://www.beautiful.ai',
        needVPN: false,
        price: '12$/月',
        region: '国外'
      },
      {
        id: 'ai-26',
        name: 'Canva AI',
        icon: '🎨',
        desc: 'AI设计助手',
        status: 'Pro',
        link: 'https://www.canva.com',
        needVPN: false,
        price: '13$/月',
        region: '国外'
      },
      {
        id: 'ai-27',
        name: 'Tome',
        icon: '📑',
        desc: 'AI演示文稿生成器',
        status: 'Pro',
        link: 'https://tome.app',
        needVPN: true,
        price: '10$/月',
        region: '国外'
      },
      {
        id: 'ai-28',
        name: 'Pictory',
        icon: '🎬',
        desc: 'AI视频创作平台',
        status: 'Pro',
        link: 'https://pictory.ai',
        needVPN: true,
        price: '23$/月',
        region: '国外'
      },
      {
        id: 'ai-29',
        name: 'Elevenlabs',
        icon: '🗣️',
        desc: 'AI语音克隆和生成',
        status: 'Pro',
        link: 'https://elevenlabs.io',
        needVPN: true,
        price: '22$/月',
        region: '国外'
      },
      {
        id: 'ai-30',
        name: 'Speechify',
        icon: '🎧',
        desc: 'AI文字转语音工具',
        status: 'Pro',
        link: 'https://speechify.com',
        needVPN: false,
        price: '15$/月',
        region: '国外'
      },
      {
        id: 'ai-31',
        name: 'Character.ai',
        icon: '🤖',
        desc: 'AI角色对话平台',
        status: 'Free',
        link: 'https://character.ai',
        needVPN: true,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-32',
        name: 'Replika',
        icon: '👥',
        desc: 'AI伴侣聊天机器人',
        status: 'Pro',
        link: 'https://replika.ai',
        needVPN: true,
        price: '10$/月',
        region: '国外'
      },
      {
        id: 'ai-33',
        name: 'Anthropic Claude 2',
        icon: '🤖',
        desc: '新一代AI助手',
        status: 'Pro',
        link: 'https://claude.ai',
        needVPN: true,
        price: '20$/月',
        region: '国外'
      },
      {
        id: 'ai-34',
        name: 'Perplexity AI',
        icon: '🔍',
        desc: 'AI搜索引擎',
        status: 'Free',
        link: 'https://www.perplexity.ai',
        needVPN: true,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-35',
        name: 'Leonardo.ai',
        icon: '🎨',
        desc: 'AI艺术创作平台',
        status: 'Pro',
        link: 'https://leonardo.ai',
        needVPN: true,
        price: '10$/月',
        region: '国外'
      },
      {
        id: 'ai-36',
        name: 'Poe',
        icon: '🤖',
        desc: 'AI聊天机器人平台',
        status: 'Free',
        link: 'https://poe.com',
        needVPN: true,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-37',
        name: 'HuggingChat',
        icon: '🤗',
        desc: '开源AI聊天平台',
        status: 'Free',
        link: 'https://huggingface.co/chat',
        needVPN: true,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-38',
        name: '讯飞星火',
        icon: '🇨🇳',
        desc: '科大讯飞AI助手',
        status: 'Free',
        link: 'https://xinghuo.xfyun.cn',
        needVPN: false,
        price: '免费',
        region: '国内'
      },
      {
        id: 'ai-39',
        name: '智谱AI',
        icon: '🇨🇳',
        desc: '清华AI助手',
        status: 'Free',
        link: 'https://chatglm.cn',
        needVPN: false,
        price: '免费',
        region: '国内'
      },
      {
        id: 'ai-40',
        name: '月之暗面',
        icon: '🇨🇳',
        desc: '国内AI绘画平台',
        status: 'Free',
        link: 'https://www.moondark.cn',
        needVPN: false,
        price: '免费',
        region: '国内'
      },
      {
        id: 'ai-41',
        name: 'Tabnine',
        icon: '💻',
        desc: '多语言AI代码补全',
        status: 'Pro',
        link: 'https://www.tabnine.com',
        needVPN: false,
        price: '12$/月',
        region: '国外'
      },
      {
        id: 'ai-42',
        name: 'Amazon CodeWhisperer',
        icon: '🚀',
        desc: '亚马逊AI代码助手',
        status: 'Free',
        link: 'https://aws.amazon.com/codewhisperer',
        needVPN: false,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-43',
        name: 'Kite',
        icon: '🪁',
        desc: 'Python AI代码补全',
        status: 'Free',
        link: 'https://www.kite.com',
        needVPN: true,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-44',
        name: 'Replit Ghostwriter',
        icon: '👻',
        desc: 'Replit的AI编程助手',
        status: 'Pro',
        link: 'https://replit.com/ghostwriter',
        needVPN: true,
        price: '10$/月',
        region: '国外'
      },
      {
        id: 'ai-45',
        name: 'CodeGeeX',
        icon: '🤖',
        desc: '开源AI编程助手',
        status: 'Free',
        link: 'https://codegeex.cn',
        needVPN: false,
        price: '免费',
        region: '国内'
      },
      {
        id: 'ai-46',
        name: 'Rust Analyzer AI',
        icon: '🦀',
        desc: 'Rust智能代码分析',
        status: 'Free',
        link: 'https://rust-analyzer.github.io',
        needVPN: false,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-47',
        name: 'CSS AI',
        icon: '🎨',
        desc: 'AI驱动的CSS生成器',
        status: 'Free',
        link: 'https://css.ai',
        needVPN: true,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-48',
        name: 'Fronty',
        icon: '🎯',
        desc: 'AI前端代码生成器',
        status: 'Pro',
        link: 'https://fronty.com',
        needVPN: true,
        price: '15$/月',
        region: '国外'
      },
      {
        id: 'ai-49',
        name: 'v0.dev',
        icon: '⚡',
        desc: 'Vercel AI UI生成器',
        status: 'Beta',
        link: 'https://v0.dev',
        needVPN: true,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-50',
        name: 'AskCodi',
        icon: '🔍',
        desc: 'AI代码问答助手',
        status: 'Pro',
        link: 'https://www.askcodi.com',
        needVPN: true,
        price: '10$/月',
        region: '国外'
      },
      {
        id: 'ai-51',
        name: 'Mutable AI',
        icon: '🧬',
        desc: 'AI代码重构工具',
        status: 'Pro',
        link: 'https://mutable.ai',
        needVPN: true,
        price: '20$/月',
        region: '国外'
      },
      {
        id: 'ai-52',
        name: 'CodeComplete',
        icon: '✨',
        desc: 'AI代码补全和生成',
        status: 'Pro',
        link: 'https://codecomplete.ai',
        needVPN: true,
        price: '15$/月',
        region: '国外'
      },
      {
        id: 'ai-53',
        name: 'Pylance AI',
        icon: '🐍',
        desc: 'Python智能提示增强',
        status: 'Free',
        link: 'https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance',
        needVPN: false,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-54',
        name: 'Codiga',
        icon: '🛡️',
        desc: 'AI代码分析和建议',
        status: 'Pro',
        link: 'https://www.codiga.io',
        needVPN: false,
        price: '14$/月',
        region: '国外'
      },
      {
        id: 'ai-55',
        name: 'Sourcegraph Cody',
        icon: '🔎',
        desc: 'AI代码搜索和理解',
        status: 'Pro',
        link: 'https://about.sourcegraph.com/cody',
        needVPN: true,
        price: '19$/月',
        region: '国外'
      },
      {
        id: 'ai-56',
        name: 'CodeAlpha',
        icon: '🎯',
        desc: 'AI代码优化工具',
        status: 'Pro',
        link: 'https://codealpha.ai',
        needVPN: true,
        price: '25$/月',
        region: '国外'
      },
      {
        id: 'ai-57',
        name: 'Deepsource',
        icon: '🔍',
        desc: 'AI代码审查工具',
        status: 'Pro',
        link: 'https://deepsource.io',
        needVPN: false,
        price: '团队定价',
        region: '国外'
      },
      {
        id: 'ai-58',
        name: 'CodeSee',
        icon: '👁️',
        desc: 'AI代码可视化工具',
        status: 'Pro',
        link: 'https://www.codesee.io',
        needVPN: false,
        price: '团队定价',
        region: '国外'
      },
      {
        id: 'ai-59',
        name: 'Mintlify',
        icon: '📚',
        desc: 'AI文档生成工具',
        status: 'Pro',
        link: 'https://mintlify.com',
        needVPN: true,
        price: '20$/月',
        region: '国外'
      },
      {
        id: 'ai-60',
        name: 'Safurai',
        icon: '🥷',
        desc: 'AI代码安全分析',
        status: 'Pro',
        link: 'https://www.safurai.com',
        needVPN: true,
        price: '15$/月',
        region: '国外'
      },
      {
        id: 'ai-61',
        name: 'Stenography',
        icon: '📝',
        desc: 'AI代码注释生成',
        status: 'Pro',
        link: 'https://stenography.dev',
        needVPN: true,
        price: '10$/月',
        region: '国外'
      },
      {
        id: 'ai-62',
        name: 'CodeSquire',
        icon: '🎓',
        desc: 'AI编程学习助手',
        status: 'Pro',
        link: 'https://codesquire.ai',
        needVPN: true,
        price: '20$/月',
        region: '国外'
      },
      {
        id: 'ai-63',
        name: 'Dust',
        icon: '✨',
        desc: 'AI开发工作流助手',
        status: 'Pro',
        link: 'https://dust.tt',
        needVPN: true,
        price: '30$/月',
        region: '国外'
      },
      {
        id: 'ai-64',
        name: 'Pieces',
        icon: '🧩',
        desc: 'AI代码片段管理',
        status: 'Pro',
        link: 'https://pieces.app',
        needVPN: false,
        price: '12$/月',
        region: '国外'
      },
      {
        id: 'ai-65',
        name: 'WhatTheDiff',
        icon: '🔄',
        desc: 'AI代码差异分析',
        status: 'Pro',
        link: 'https://whatthediff.ai',
        needVPN: true,
        price: '15$/月',
        region: '国外'
      },
      {
        id: 'ai-66',
        name: 'Sweep',
        icon: '🧹',
        desc: 'AI代码清理助手',
        status: 'Pro',
        link: 'https://sweep.dev',
        needVPN: true,
        price: '20$/月',
        region: '国外'
      },
      {
        id: 'ai-67',
        name: 'CodeRabbit',
        icon: '🐰',
        desc: 'AI代码审查助手',
        status: 'Pro',
        link: 'https://coderabbit.ai',
        needVPN: true,
        price: '15$/月',
        region: '国外'
      },
      {
        id: 'ai-68',
        name: 'Bloop',
        icon: '🔍',
        desc: 'AI代码搜索工具',
        status: 'Free',
        link: 'https://bloop.ai',
        needVPN: true,
        price: '免费',
        region: '国外'
      },
      {
        id: 'ai-69',
        name: 'Stepsize',
        icon: '📊',
        desc: 'AI代码度量分析',
        status: 'Pro',
        link: 'https://stepsize.com',
        needVPN: false,
        price: '团队定价',
        region: '国外'
      },
      {
        id: 'ai-70',
        name: 'Blackbox AI',
        icon: '⬛',
        desc: 'AI代码转换工具',
        status: 'Pro',
        link: 'https://www.blackbox.ai',
        needVPN: true,
        price: '20$/月',
        region: '国外'
      }
      // ... 继续添加更多工具
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
      },
      {
        id: 'github-13',
        name: 'Docker',
        desc: '容器化平台',
        icon: '🐳',
        link: 'https://github.com/docker/docker-ce',
        stars: '65k+'
      },
      {
        id: 'github-14',
        name: 'Kubernetes',
        desc: '容器编排系统',
        icon: '⎈',
        link: 'https://github.com/kubernetes/kubernetes',
        stars: '95k+'
      },
      {
        id: 'github-15',
        name: 'VS Code',
        desc: '代码编辑器',
        icon: '📝',
        link: 'https://github.com/microsoft/vscode',
        stars: '150k+'
      },
      {
        id: 'github-16',
        name: 'PyTorch',
        desc: '机器学习框架',
        icon: '🔥',
        link: 'https://github.com/pytorch/pytorch',
        stars: '70k+'
      },
      {
        id: 'github-17',
        name: 'TensorFlow',
        desc: '机器学习平台',
        icon: '🧠',
        link: 'https://github.com/tensorflow/tensorflow',
        stars: '170k+'
      },
      {
        id: 'github-18',
        name: 'Redis',
        desc: '内存数据结构存储',
        icon: '🗄️',
        link: 'https://github.com/redis/redis',
        stars: '60k+'
      },
      {
        id: 'github-19',
        name: 'MongoDB',
        desc: 'NoSQL 数据库',
        icon: '🍃',
        link: 'https://github.com/mongodb/mongo',
        stars: '40k+'
      },
      {
        id: 'github-20',
        name: 'PostgreSQL',
        desc: '关系型数据库',
        icon: '🐘',
        link: 'https://github.com/postgres/postgres',
        stars: '45k+'
      },
      {
        id: 'github-21',
        name: 'Rust',
        desc: '安全、并发的系统编程语言',
        icon: '🦀',
        link: 'https://github.com/rust-lang/rust',
        stars: '85k+'
      },
      {
        id: 'github-22',
        name: 'Tauri',
        desc: 'Rust桌面应用开发框架',
        icon: '🚀',
        link: 'https://github.com/tauri-apps/tauri',
        stars: '65k+'
      },
      {
        id: 'github-23',
        name: 'Actix Web',
        desc: 'Rust高性能Web框架',
        icon: '🌐',
        link: 'https://github.com/actix/actix-web',
        stars: '18k+'
      },
      {
        id: 'github-24',
        name: 'Tokio',
        desc: 'Rust异步运行时',
        icon: '⚡',
        link: 'https://github.com/tokio-rs/tokio',
        stars: '45k+'
      },
      {
        id: 'github-25',
        name: 'Rocket',
        desc: 'Rust Web框架',
        icon: '🚀',
        link: 'https://github.com/SergioBenitez/Rocket',
        stars: '20k+'
      },
      {
        id: 'github-26',
        name: 'Yew',
        desc: 'Rust前端框架',
        icon: '🌲',
        link: 'https://github.com/yewstack/yew',
        stars: '25k+'
      },
      {
        id: 'github-27',
        name: 'Serde',
        desc: 'Rust序列化框架',
        icon: '📦',
        link: 'https://github.com/serde-rs/serde',
        stars: '15k+'
      },
      {
        id: 'github-28',
        name: 'Diesel',
        desc: 'Rust ORM框架',
        icon: '🛢️',
        link: 'https://github.com/diesel-rs/diesel',
        stars: '12k+'
      },
      {
        id: 'github-29',
        name: 'Axum',
        desc: 'Rust Web应用框架',
        icon: '🔧',
        link: 'https://github.com/tokio-rs/axum',
        stars: '10k+'
      },
      {
        id: 'github-30',
        name: 'wasm-bindgen',
        icon: '🕸️',
        desc: 'Rust和WebAssembly交互',
        link: 'https://github.com/rustwasm/wasm-bindgen',
        stars: '8k+'
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
    component: 'dialog',
    type:'image'
  },
  {
    name: '推箱子游戏',
    desc: '经典推箱子游戏，支持多个关卡',
    logo: '🎲',
    component: 'dialog',
    type:'game'
  },
  {
    name: '音乐播放器',
    desc: '音乐播放器',
    logo: '🎵',
    component: 'dialog',
    type:'video'
  },
  {
    name: '动态表单',
    desc: '可视化表单设计器',
    logo: '📝',
    component: 'dialog',
    type:'dyform'
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