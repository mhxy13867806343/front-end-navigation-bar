import type { NavigationList, WorkList } from '@/types/navigation'

export const devBackend: NavigationList = [
  {
    "id": 19,
    "name": "后端开发",
    "icon": "⚙️",
    "tools": [
      {
        "id": "be-lib-1",
        "name": "Express",
        "desc": "基于 Node.js 平台的极简、灵活的 Web 应用开发框架",
        "icon": "🚂",
        "link": "https://expressjs.com/",
        "platform": "Node.js",
        "price": "免费"
      },
      {
        "id": "be-lib-2",
        "name": "NestJS",
        "desc": "高效、可扩展的 Node.js 后端框架，完美支持 TypeScript",
        "icon": "🐱",
        "link": "https://nestjs.com/",
        "platform": "Node.js",
        "price": "免费"
      },
      {
        "id": "be-lib-3",
        "name": "Spring Boot",
        "desc": "基于 Java 的企业级快速应用开发框架",
        "icon": "🌱",
        "link": "https://spring.io/projects/spring-boot",
        "platform": "Java",
        "price": "免费"
      },
      {
        "id": "be-lib-4",
        "name": "Django",
        "desc": "高水准的 Python Web 框架，鼓励快速开发与干净实用的设计",
        "icon": "🎸",
        "link": "https://www.djangoproject.com/",
        "platform": "Python",
        "price": "免费"
      },
      {
        "id": "be-lib-5",
        "name": "FastAPI",
        "desc": "高性能、易学的 Python Web 框架，基于标准 Python 类型提示",
        "icon": "⚡",
        "link": "https://fastapi.tiangolo.com/",
        "platform": "Python",
        "price": "免费"
      },
      {
        "id": "be-lib-6",
        "name": "Gin",
        "desc": "基于 Go 语言编写的轻量级高性能 Web 框架",
        "icon": "🍹",
        "link": "https://gin-gonic.com/",
        "platform": "Go",
        "price": "免费"
      },
      {
        "id": "be-lib-7",
        "name": "Laravel",
        "desc": "为 Web 开发艺术家创造的 PHP Web 框架，优雅且简单",
        "icon": "🪵",
        "link": "https://laravel.com/",
        "platform": "PHP",
        "price": "免费"
      },
      {
        "id": "be-lib-8",
        "name": "ASP.NET Core",
        "desc": "微软推出的跨平台、高性能、开源的 Web 框架",
        "icon": "💻",
        "link": "https://learn.microsoft.com/aspnet/core",
        "platform": "C#",
        "price": "免费"
      }
    ]
  },
  {
    "id": 20,
    "name": "编程语言",
    "icon": "🔤",
    "tools": [
      {
        "id": "lang-1",
        "name": "Rust",
        "desc": "专注于安全、并发和性能的现代系统编程语言",
        "icon": "🦀",
        "link": "https://www.rust-lang.org/",
        "platform": "All",
        "price": "免费"
      },
      {
        "id": "lang-2",
        "name": "Python",
        "desc": "易于学习且功能强大的面向对象动态编程语言，AI时代首选",
        "icon": "🐍",
        "link": "https://www.python.org/",
        "platform": "All",
        "price": "免费"
      },
      {
        "id": "lang-3",
        "name": "Java",
        "desc": "健壮、安全且跨平台的企业级主流开发语言",
        "icon": "☕",
        "link": "https://www.oracle.com/java/",
        "platform": "All",
        "price": "免费"
      },
      {
        "id": "lang-4",
        "name": "C++",
        "desc": "支持多重编程范式的通用系统级高性能编程语言",
        "icon": "⚙️",
        "link": "https://isocpp.org/",
        "platform": "All",
        "price": "免费"
      },
      {
        "id": "lang-5",
        "name": "Go",
        "desc": "Google开发的静态强类型、编译型、并发型语言",
        "icon": "🐹",
        "link": "https://go.dev/",
        "platform": "All",
        "price": "免费"
      },
      {
        "id": "lang-6",
        "name": "TypeScript",
        "desc": "JavaScript 的超集，添加了静态类型系统，前端主力语言",
        "icon": "📘",
        "link": "https://www.typescriptlang.org/",
        "platform": "All",
        "price": "免费"
      },
      {
        "id": "lang-7",
        "name": "Kotlin",
        "desc": "现代、简洁且安全的编程语言，Android 开发首选官方语言",
        "icon": "📱",
        "link": "https://kotlinlang.org/",
        "platform": "All",
        "price": "免费"
      },
      {
        "id": "lang-8",
        "name": "Swift",
        "desc": "苹果开发的用于 iOS、macOS 等平台的安全、快速、现代的语言",
        "icon": "🍎",
        "link": "https://www.swift.org/",
        "platform": "All",
        "price": "免费"
      }
    ]
  },
  {
    "id": 21,
    "name": "游戏开发",
    "icon": "🎮",
    "tools": [
      {
        "id": "game-dev-1",
        "name": "Godot Engine",
        "desc": "开源、免费的全新全功能 2D/3D 游戏引擎，极具轻量与活力",
        "icon": "🤖",
        "link": "https://godotengine.org/",
        "platform": "All",
        "price": "免费"
      },
      {
        "id": "game-dev-2",
        "name": "Unity",
        "desc": "全球最主流的实时 3D 创作平台，多端部署极佳，生态庞大",
        "icon": "🧩",
        "link": "https://unity.com/",
        "platform": "All",
        "price": "免费/付费"
      },
      {
        "id": "game-dev-3",
        "name": "Unreal Engine",
        "desc": "虚幻引擎，业界画质天花板级别的 3D 实时游戏与影视创作引擎",
        "icon": "🔥",
        "link": "https://www.unrealengine.com/",
        "platform": "All",
        "price": "免费/付费"
      },
      {
        "id": "game-dev-4",
        "name": "Cocos Creator",
        "desc": "优秀的国产游戏引擎，非常适合微信小游戏与轻量多端 2D/3D 游戏开发",
        "icon": "🥥",
        "link": "https://www.cocos.com/",
        "platform": "All",
        "price": "免费"
      },
      {
        "id": "game-dev-5",
        "name": "LayaAir",
        "desc": "国产高性能 H5 3D/2D 游戏引擎，常用于轻量化 3D 微信小游戏",
        "icon": "🧊",
        "link": "https://www.layabox.com/",
        "platform": "All",
        "price": "免费"
      },
      {
        "id": "game-dev-6",
        "name": "PixiJS",
        "desc": "超高性能的 HTML5 2D 渲染引擎，适合互动广告和轻量 H5 游戏",
        "icon": "⚡",
        "link": "https://pixijs.com/",
        "platform": "Web",
        "price": "免费"
      },
      {
        "id": "game-dev-7",
        "name": "Phaser",
        "desc": "非常流行且易于上手的开源 HTML5 2D 游戏框架",
        "icon": "👾",
        "link": "https://phaser.io/",
        "platform": "Web",
        "price": "免费"
      }
    ]
  }
]
