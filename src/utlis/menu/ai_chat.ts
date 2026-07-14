import type { NavigationList, WorkList } from '@/types/navigation'

export const aiChat: NavigationList = [
  {
    "id": 1,
    "name": "AI聊天助手",
    "icon": "🤖",
    "tools": [
      {
        "id": "ai-71",
        "name": "DeepSeek",
        "icon": "🐳",
        "desc": "强力开源大模型，深度求索",
        "status": "Free",
        "link": "https://chat.deepseek.com",
        "needVPN": false,
        "price": "免费",
        "region": "国内"
      },
      {
        "id": "ai-72",
        "name": "Kimi智能助手",
        "icon": "🌙",
        "desc": "支持超长上下文的AI助手，月之暗面开发",
        "status": "Free",
        "link": "https://kimi.moonshot.cn",
        "needVPN": false,
        "price": "免费",
        "region": "国内"
      },
      {
        "id": "ai-73",
        "name": "豆包",
        "icon": "🎒",
        "desc": "字节跳动推出的AI对话助手，办公创作全能",
        "status": "Free",
        "link": "https://www.doubao.com",
        "needVPN": false,
        "price": "免费",
        "region": "国内"
      },
      {
        "id": "ai-74",
        "name": "腾讯元宝",
        "icon": "🪙",
        "desc": "腾讯推出的AI对话助手，支持微信公众号搜索",
        "status": "Free",
        "link": "https://yuanbao.tencent.com",
        "needVPN": false,
        "price": "免费",
        "region": "国内"
      },
      {
        "id": "ai-1",
        "name": "ChatGPT",
        "icon": "🤖",
        "desc": "OpenAI开发的大语言模型",
        "status": "Pro",
        "link": "https://chat.openai.com",
        "needVPN": true,
        "price": "20$/月",
        "region": "国外"
      },
      {
        "id": "ai-2",
        "name": "Claude",
        "icon": "🤖",
        "desc": "Anthropic开发的AI助手",
        "status": "Pro",
        "link": "https://claude.ai",
        "needVPN": true,
        "price": "20$/月",
        "region": "国外"
      },
      {
        "id": "ai-3",
        "name": "Gemini",
        "icon": "⭐",
        "desc": "Google的AI模型",
        "status": "Pro",
        "link": "https://gemini.google.com",
        "needVPN": true,
        "price": "免费",
        "region": "国外"
      },
      {
        "id": "ai-4",
        "name": "Bard",
        "icon": "🎭",
        "desc": "Google的AI聊天助手",
        "status": "Free",
        "link": "https://bard.google.com",
        "needVPN": true,
        "price": "免费",
        "region": "国外"
      },
      {
        "id": "ai-5",
        "name": "Copilot",
        "icon": "👨‍💻",
        "desc": "Microsoft的AI助手",
        "status": "Pro",
        "link": "https://copilot.microsoft.com",
        "needVPN": false,
        "price": "20$/月",
        "region": "国外"
      },
      {
        "id": "ai-12",
        "name": "文心一言",
        "icon": "🇨🇳",
        "desc": "百度的AI助手",
        "status": "Free",
        "link": "https://yiyan.baidu.com",
        "needVPN": false,
        "price": "免费",
        "region": "国内"
      },
      {
        "id": "ai-13",
        "name": "通义千问",
        "icon": "🇨🇳",
        "desc": "阿里的AI助手",
        "status": "Free",
        "link": "https://qianwen.aliyun.com",
        "needVPN": false,
        "price": "免费",
        "region": "国内"
      },
      {
        "id": "ai-31",
        "name": "Character.ai",
        "icon": "🤖",
        "desc": "AI角色对话平台",
        "status": "Free",
        "link": "https://character.ai",
        "needVPN": true,
        "price": "免费",
        "region": "国外"
      },
      {
        "id": "ai-32",
        "name": "Replika",
        "icon": "👥",
        "desc": "AI伴侣聊天机器人",
        "status": "Pro",
        "link": "https://replika.ai",
        "needVPN": true,
        "price": "10$/月",
        "region": "国外"
      },
      {
        "id": "ai-33",
        "name": "Anthropic Claude 2",
        "icon": "🤖",
        "desc": "新一代AI助手",
        "status": "Pro",
        "link": "https://claude.ai",
        "needVPN": true,
        "price": "20$/月",
        "region": "国外"
      },
      {
        "id": "ai-36",
        "name": "Poe",
        "icon": "🤖",
        "desc": "AI聊天机器人平台",
        "status": "Free",
        "link": "https://poe.com",
        "needVPN": true,
        "price": "免费",
        "region": "国外"
      },
      {
        "id": "ai-37",
        "name": "HuggingChat",
        "icon": "🤗",
        "desc": "开源AI聊天平台",
        "status": "Free",
        "link": "https://huggingface.co/chat",
        "needVPN": true,
        "price": "免费",
        "region": "国外"
      },
      {
        "id": "ai-38",
        "name": "讯飞星火",
        "icon": "🇨🇳",
        "desc": "科大讯飞AI助手",
        "status": "Free",
        "link": "https://xinghuo.xfyun.cn",
        "needVPN": false,
        "price": "免费",
        "region": "国内"
      },
      {
        "id": "ai-39",
        "name": "智谱AI",
        "icon": "🇨🇳",
        "desc": "清华AI助手",
        "status": "Free",
        "link": "https://chatglm.cn",
        "needVPN": false,
        "price": "免费",
        "region": "国内"
      }
    ]
  },
  {
    "id": 8,
    "name": "AI搜索引擎",
    "icon": "🔍",
    "tools": [
      {
        "id": "ai-34",
        "name": "Perplexity AI",
        "icon": "🔍",
        "desc": "AI搜索引擎",
        "status": "Free",
        "link": "https://www.perplexity.ai",
        "needVPN": true,
        "price": "免费",
        "region": "国外"
      },
      {
        "id": "ai-78",
        "name": "秘塔AI搜索",
        "icon": "🔍",
        "desc": "国内领先的无广告AI搜索引擎，结构化呈现结果",
        "status": "Free",
        "link": "https://metaso.cn",
        "needVPN": false,
        "price": "免费",
        "region": "国内"
      },
      {
        "id": "ai-79",
        "name": "360AI搜索",
        "icon": "🌀",
        "desc": "360推出的AI搜索引擎，结合强力搜索与大模型分析",
        "status": "Free",
        "link": "https://sou.360.cn",
        "needVPN": false,
        "price": "免费",
        "region": "国内"
      }
    ]
  }
]
