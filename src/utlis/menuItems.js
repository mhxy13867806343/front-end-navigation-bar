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
      },
      {
        id: 'github-31',
        name: 'GitHub 中文社区',
        desc: '提供开源项目中文解读、趋势榜单、精选专题与入门指南',
        icon: '🇨🇳',
        link: 'https://github-cn.com/',
        stars: '中文社区'
      },
      {
        id: 'github-32',
        name: 'GitCN 中文社区',
        desc: '面向中文开发者的 GitHub 项目发现与开源内容社区',
        icon: '🔎',
        link: 'https://gitcn.org/',
        stars: '中文社区'
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
  {
    "id": 22,
    "name": "MCP Skills",
    "icon": "🧠",
    "tools": [
      { "id": "mcp-skill-anthropic", "name": "Anthropic Skills", "desc": "Anthropic 官方提供的 Agent Skills 示例与最佳实践集合。", "icon": "🧠", "link": "https://github.com/anthropics/skills", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-microsoft", "name": "Microsoft Skills", "desc": "微软面向 Azure SDK 与 AI Foundry 场景维护的技能集合。", "icon": "🪟", "link": "https://github.com/microsoft/skills", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-microsoft-learn", "name": "Microsoft Learn Agent Skills", "desc": "由 Microsoft Learn 内容支撑的可复用智能体技能仓库。", "icon": "📘", "link": "https://github.com/MicrosoftDocs/Agent-Skills", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-nvidia", "name": "NVIDIA Skills", "desc": "NVIDIA 面向 AI、GPU 与开发工作流发布的官方技能。", "icon": "🟢", "link": "https://github.com/NVIDIA/skills", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-hugging-face", "name": "Hugging Face Skills", "desc": "Hugging Face 生态中的模型、数据集与应用开发技能集合。", "icon": "🤗", "link": "https://github.com/huggingface/skills", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-specification", "name": "Agent Skills Specification", "desc": "定义开放 Agent Skills 目录结构与渐进式加载方式的规范。", "icon": "📐", "link": "https://agentskills.io/home", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-awesome-copilot", "name": "GitHub Awesome Copilot", "desc": "GitHub 社区维护的 Copilot 智能体、指令与技能资源库。", "icon": "🐙", "link": "https://github.com/github/awesome-copilot", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-composio", "name": "Composio Awesome Claude Skills", "desc": "Composio 汇集的 Claude Skills 社区项目与实用示例。", "icon": "🧩", "link": "https://github.com/ComposioHQ/awesome-claude-skills", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-kodus", "name": "Kodus Awesome Agent Skills", "desc": "Kodus 整理的工程开发与代码协作类智能体技能清单。", "icon": "🛠️", "link": "https://github.com/kodustech/awesome-agent-skills", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-voltagent", "name": "VoltAgent Awesome Agent Skills", "desc": "VoltAgent 维护的大型跨平台 Agent Skills 导航目录。", "icon": "⚡", "link": "https://github.com/VoltAgent/awesome-agent-skills", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-skillcreator", "name": "SkillCreator Awesome Agent Skills", "desc": "收录可跨智能体安装和复用技能的开放社区目录。", "icon": "🧰", "link": "https://github.com/skillcreatorai/Awesome-Agent-Skills", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-junmin-hong", "name": "Junmin Hong Awesome Agent Skills", "desc": "提供中英双语索引的精选 Agent Skills 资源集合。", "icon": "🌏", "link": "https://github.com/junminhong/awesome-agent-skills", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-eigent", "name": "Eigent Agent Skills", "desc": "Eigent 发布的效率工具与知识工作类智能体技能。", "icon": "🚀", "link": "https://github.com/eigent-ai/agent-skills", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-superpowers", "name": "Superpowers", "desc": "覆盖构思、测试、调试与交付流程的软件开发技能套件。", "icon": "🦸", "link": "https://github.com/obra/superpowers", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-agentskills-mcp", "name": "AgentSkills MCP", "desc": "通过 MCP 服务器发现并按需加载 Agent Skills 的开源实现。", "icon": "🔗", "link": "https://github.com/zouyingcao/agentskills-mcp", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-claude-skills-mcp", "name": "Claude Skills MCP", "desc": "支持检索和调用 Claude Skills 的 MCP 服务项目。", "icon": "🔎", "link": "https://github.com/K-Dense-AI/claude-skills-mcp", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-datalayer", "name": "DataLayer Agent Skills", "desc": "DataLayer 提供的 MCP 工具组合与数据工作流技能集合。", "icon": "📊", "link": "https://github.com/datalayer/agent-skills", "platform": "MCP", "price": "免费" },
      { "id": "mcp-skill-getbindu", "name": "Awesome Claude Code and Skills", "desc": "GetBindu 整理的面向生产实践的 Claude Code 与 Skills 清单。", "icon": "📚", "link": "https://github.com/GetBindu/awesome-claude-code-and-skills", "platform": "MCP", "price": "免费" }
    ]
  },
  {
    "id": 23,
    "name": "MCP Servers",
    "icon": "🔌",
    "tools": [
      { "id": "mcp-server-registry", "name": "MCP Registry", "desc": "官方 MCP Registry 提供可搜索的公开服务器元数据目录。", "icon": "🗂️", "link": "https://registry.modelcontextprotocol.io", "platform": "Cloud", "price": "免费" },
      { "id": "mcp-server-reference", "name": "MCP Reference Servers", "desc": "MCP 官方仓库集中维护参考服务器与社区服务器索引。", "icon": "📦", "link": "https://github.com/modelcontextprotocol/servers", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-filesystem", "name": "Filesystem", "desc": "官方参考服务器以受控权限读写本地文件与目录。", "icon": "📁", "link": "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-memory", "name": "Memory", "desc": "官方参考服务器使用知识图谱保存和检索持久化记忆。", "icon": "🧠", "link": "https://github.com/modelcontextprotocol/servers/tree/main/src/memory", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-everything", "name": "Everything", "desc": "官方综合测试服务器用于演示 MCP 的工具、资源与提示能力。", "icon": "🧪", "link": "https://github.com/modelcontextprotocol/servers/tree/main/src/everything", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-awesome-punkpeye", "name": "Awesome MCP Servers", "desc": "社区维护的 MCP 服务器分类清单与生态导航。", "icon": "🌟", "link": "https://github.com/punkpeye/awesome-mcp-servers", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-awesome-appcypher", "name": "Awesome MCP Servers by Appcypher", "desc": "Appcypher 维护的 MCP 服务器、框架与学习资源精选列表。", "icon": "🧭", "link": "https://github.com/appcypher/awesome-mcp-servers", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-github", "name": "GitHub MCP Server", "desc": "GitHub 官方服务器支持仓库、议题、拉取请求与代码协作。", "icon": "🐙", "link": "https://github.com/github/github-mcp-server", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-gitlab", "name": "GitLab MCP Server", "desc": "GitLab 官方服务器让智能体访问项目、合并请求与流水线。", "icon": "🦊", "link": "https://docs.gitlab.com/user/gitlab_duo/model_context_protocol/mcp_server/", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-docker", "name": "Docker MCP Gateway", "desc": "Docker 官方网关统一发现、运行并管理容器化 MCP 服务器。", "icon": "🐳", "link": "https://github.com/docker/mcp-gateway", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-kubernetes", "name": "Kubernetes MCP Server", "desc": "开源服务器为 Kubernetes 集群提供资源查询与运维工具。", "icon": "☸️", "link": "https://github.com/containers/kubernetes-mcp-server", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-terraform", "name": "Terraform MCP Server", "desc": "HashiCorp 官方服务器连接 Terraform Registry 与基础设施工作流。", "icon": "🏗️", "link": "https://github.com/hashicorp/terraform-mcp-server", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-sentry", "name": "Sentry MCP Server", "desc": "Sentry 官方服务器帮助智能体排查错误、事件与性能问题。", "icon": "🚨", "link": "https://github.com/getsentry/sentry-mcp", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-grafana", "name": "Grafana MCP Server", "desc": "Grafana 官方服务器用于查询仪表盘、告警、日志和监控数据。", "icon": "📈", "link": "https://github.com/grafana/mcp-grafana", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-postman", "name": "Postman MCP Server", "desc": "Postman 官方服务器让智能体发现并调用工作区中的 API。", "icon": "📮", "link": "https://github.com/postmanlabs/postman-mcp-server", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-playwright", "name": "Playwright MCP", "desc": "Microsoft 官方服务器通过结构化页面信息执行浏览器自动化。", "icon": "🎭", "link": "https://github.com/microsoft/playwright-mcp", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-browsermcp", "name": "Browser MCP", "desc": "Browser MCP 通过浏览器扩展复用真实浏览器会话完成网页操作。", "icon": "🌐", "link": "https://github.com/BrowserMCP/mcp", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-firecrawl", "name": "Firecrawl MCP Server", "desc": "Firecrawl 官方服务器提供网页搜索、抓取与结构化内容提取。", "icon": "🔥", "link": "https://github.com/firecrawl/firecrawl-mcp-server", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-apify", "name": "Apify MCP Server", "desc": "Apify 官方服务器连接 Actors 平台以运行网页抓取与自动化任务。", "icon": "🕷️", "link": "https://github.com/apify/apify-mcp-server", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-tavily", "name": "Tavily MCP Server", "desc": "Tavily 官方服务器向智能体提供面向 AI 的联网搜索与内容提取。", "icon": "🔍", "link": "https://github.com/tavily-ai/tavily-mcp", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-exa", "name": "Exa MCP Server", "desc": "Exa 官方服务器提供语义网页搜索、研究与代码检索能力。", "icon": "🔎", "link": "https://github.com/exa-labs/exa-mcp-server", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-brave-search", "name": "Brave Search", "desc": "Brave 官方 Brave Search API MCP Server 为智能体提供网页与本地搜索。", "icon": "🦁", "link": "https://github.com/brave/brave-search-mcp-server", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-perplexity", "name": "Perplexity MCP Server", "desc": "Perplexity 官方服务器提供带来源的实时搜索与研究能力。", "icon": "💡", "link": "https://github.com/perplexityai/modelcontextprotocol", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-postgresql", "name": "PostgreSQL", "desc": "成熟实现支持 PostgreSQL 安全查询、健康检查与性能分析。", "icon": "🐘", "link": "https://github.com/crystaldba/postgres-mcp", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-sqlite", "name": "SQLite", "desc": "官方归档参考服务器支持查询 SQLite 并生成业务洞察。", "icon": "🪶", "link": "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/sqlite", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-mongodb", "name": "MongoDB MCP Server", "desc": "MongoDB 官方服务器连接 Atlas 与自托管数据库进行查询和管理。", "icon": "🍃", "link": "https://github.com/mongodb-js/mongodb-mcp-server", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-redis", "name": "Redis MCP Server", "desc": "Redis 官方服务器为键值数据、向量检索与管理操作提供工具。", "icon": "🔴", "link": "https://github.com/redis/mcp-redis", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-neon", "name": "Neon MCP Server", "desc": "Neon 官方服务器管理无服务器 Postgres 项目、分支与数据库。", "icon": "💚", "link": "https://github.com/neondatabase/mcp-server-neon", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-supabase", "name": "Supabase MCP", "desc": "Supabase 官方服务器连接项目配置、数据库与开发管理工具。", "icon": "⚡", "link": "https://github.com/supabase/mcp", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-motherduck", "name": "MotherDuck MCP Server", "desc": "MotherDuck 官方服务器使用 DuckDB 与云端仓库执行分析查询。", "icon": "🦆", "link": "https://github.com/motherduckdb/mcp-server-motherduck", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-clickhouse", "name": "ClickHouse MCP Server", "desc": "ClickHouse 官方服务器用于探索表结构并执行分析型 SQL 查询。", "icon": "🏠", "link": "https://github.com/ClickHouse/mcp-clickhouse", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-dbhub", "name": "DBHub", "desc": "DBHub 以统一 MCP 接口安全连接多种关系型与文档数据库。", "icon": "🗄️", "link": "https://github.com/bytebase/dbhub", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-aws", "name": "AWS Labs MCP Servers", "desc": "AWS Labs 官方集合覆盖云架构、文档、成本与多项 AWS 服务。", "icon": "☁️", "link": "https://github.com/awslabs/mcp", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-azure", "name": "Azure MCP Server", "desc": "Microsoft 官方服务器统一连接 Azure 资源与云服务操作。", "icon": "🔷", "link": "https://github.com/microsoft/mcp", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-cloudflare", "name": "Cloudflare MCP Servers", "desc": "Cloudflare 官方服务器让智能体管理开发平台与账户资源。", "icon": "🌥️", "link": "https://github.com/cloudflare/mcp-server-cloudflare", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-genai-toolbox", "name": "Google GenAI Toolbox", "desc": "Google 开源工具箱为数据库智能体提供经过验证的连接器与工具。", "icon": "🧰", "link": "https://github.com/googleapis/mcp-toolbox", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-notion", "name": "Notion MCP Server", "desc": "Notion 官方服务器允许智能体读取和维护工作区页面与数据库。", "icon": "📝", "link": "https://github.com/makenotion/notion-mcp-server", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-slack", "name": "Slack MCP Server", "desc": "Slack 官方 MCP 接口为智能体提供受控的工作区搜索与消息能力。", "icon": "💬", "link": "https://docs.slack.dev/ai/slack-mcp-server/", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-stripe", "name": "Stripe Agent Toolkit", "desc": "Stripe 官方工具包通过 MCP 支持支付、客户与账单操作。", "icon": "💳", "link": "https://github.com/stripe/ai", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-paypal", "name": "PayPal Agent Toolkit", "desc": "PayPal 官方工具包通过 MCP 连接支付、订单与交易工作流。", "icon": "💸", "link": "https://github.com/paypal/agent-toolkit", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-linear", "name": "Linear MCP Server", "desc": "Linear 官方远程服务器用于管理议题、项目与团队协作数据。", "icon": "📏", "link": "https://linear.app/docs/mcp", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-atlassian", "name": "Atlassian Remote MCP Server", "desc": "Atlassian 官方远程服务器连接 Jira 与 Confluence 工作内容。", "icon": "🔵", "link": "https://www.atlassian.com/platform/rovo-mcp", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-zapier", "name": "Zapier MCP", "desc": "Zapier 官方托管服务把数千款应用动作开放给 MCP 客户端。", "icon": "⚙️", "link": "https://zapier.com/mcp", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-pipedream", "name": "Pipedream MCP", "desc": "Pipedream 官方平台通过 MCP 连接应用 API、认证与自动化动作。", "icon": "🛠️", "link": "https://github.com/PipedreamHQ/pipedream/tree/master/modelcontextprotocol", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-composio", "name": "Composio MCP", "desc": "Composio 为智能体提供带托管认证的应用工具与 MCP 集成。", "icon": "🧩", "link": "https://github.com/ComposioHQ/composio", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-figma", "name": "Figma MCP Server Guide", "desc": "Figma 官方指南介绍如何通过远程 MCP 访问设计上下文。", "icon": "🎨", "link": "https://github.com/figma/mcp-server-guide", "platform": "Cloud", "price": "免费/付费" },
      { "id": "mcp-server-blender", "name": "Blender MCP", "desc": "开源 Blender 服务器支持智能体创建、编辑和渲染三维场景。", "icon": "🧊", "link": "https://github.com/ahujasid/blender-mcp", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-unity", "name": "MCP Unity", "desc": "开源 Unity 编辑器桥接服务让智能体操作场景、资源与脚本。", "icon": "🎮", "link": "https://github.com/CoderGamester/mcp-unity", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-godot", "name": "Godot MCP", "desc": "开源 Godot 服务器让智能体运行项目并辅助场景与脚本开发。", "icon": "🤖", "link": "https://github.com/Coding-Solo/godot-mcp", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-sequential-thinking", "name": "Sequential Thinking", "desc": "官方参考服务器通过可修订的分步推理过程支持复杂问题求解。", "icon": "🧮", "link": "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking", "platform": "MCP", "price": "免费" },
      { "id": "mcp-server-desktop-commander", "name": "Desktop Commander", "desc": "开源桌面服务器提供终端、进程、文件和代码编辑操作。", "icon": "🖥️", "link": "https://github.com/wonderwhy-er/DesktopCommanderMCP", "platform": "MCP", "price": "免费" }
    ]
  }
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
  },
  {
    name: '接水果游戏',
    desc: '接住水果得分，小心炸弹！',
    logo: '🧺',
    component: 'dialog',
    type:'fruitgame'
  },
  {
    name: '90坦克大战',
    desc: '守卫基地，击退来袭的敌军坦克',
    logo: '🛡️',
    component: 'dialog',
    type: 'battlecity'
  },
  {
    name: '经典打砖块',
    desc: '控制挡板反弹小球，击碎全部砖块',
    logo: '🧱',
    component: 'dialog',
    type: 'brickbreaker'
  },
  {
    name: '飞翔小鸟',
    desc: '点击起飞，穿越管道挑战更高分',
    logo: '🐦',
    component: 'dialog',
    type: 'flappybird'
  },
  {
    name: '太空战机',
    desc: '驾驶战机穿梭星海，消灭敌方舰队',
    logo: '🚀',
    component: 'dialog',
    type: 'spaceshooter'
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