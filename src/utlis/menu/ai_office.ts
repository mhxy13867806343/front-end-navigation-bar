import type { NavigationList, WorkList } from '@/types/navigation'

export const aiOffice: NavigationList = [
  {
    "id": 7,
    "name": "AI办公工具",
    "icon": "📊",
    "tools": [
      {
        "id": "ai-19",
        "name": "DeepL",
        "icon": "🌐",
        "desc": "AI翻译工具",
        "status": "Pro",
        "link": "https://www.deepl.com",
        "needVPN": false,
        "price": "30$/月",
        "region": "国外"
      },
      {
        "id": "ai-22",
        "name": "Otter.ai",
        "icon": "🎙️",
        "desc": "AI会议记录和转录工具",
        "status": "Pro",
        "link": "https://otter.ai",
        "needVPN": false,
        "price": "20$/月",
        "region": "国外"
      },
      {
        "id": "ai-25",
        "name": "Beautiful.ai",
        "icon": "📊",
        "desc": "AI演示文稿制作工具",
        "status": "Pro",
        "link": "https://www.beautiful.ai",
        "needVPN": false,
        "price": "12$/月",
        "region": "国外"
      },
      {
        "id": "ai-27",
        "name": "Tome",
        "icon": "📑",
        "desc": "AI演示文稿生成器",
        "status": "Pro",
        "link": "https://tome.app",
        "needVPN": true,
        "price": "10$/月",
        "region": "国外"
      },
      {
        "id": "ai-59",
        "name": "Mintlify",
        "icon": "📚",
        "desc": "AI文档生成工具",
        "status": "Pro",
        "link": "https://mintlify.com",
        "needVPN": true,
        "price": "20$/月",
        "region": "国外"
      },
      {
        "id": "ai-69",
        "name": "Stepsize",
        "icon": "📊",
        "desc": "AI代码度量分析",
        "status": "Pro",
        "link": "https://stepsize.com",
        "needVPN": false,
        "price": "团队定价",
        "region": "国外"
      }
    ]
  },
  {
    "id": 12,
    "name": "AI提示指令",
    "icon": "💡",
    "tools": [
      {
        "id": "prompt-1",
        "name": "FlowGPT",
        "desc": "全球最大的 AI 提示词分享与交互社区，包含极其丰富的多场景提示工作流",
        "icon": "🌀",
        "link": "https://flowgpt.com/",
        "platform": "Web",
        "price": "免费"
      },
      {
        "id": "prompt-2",
        "name": "PromptBase",
        "desc": "专业的 AI 提示词交易市场，支持 ChatGPT、Midjourney 等模型的高效提示词买卖",
        "icon": "🪙",
        "link": "https://promptbase.com/",
        "platform": "Web",
        "price": "付费交易"
      },
      {
        "id": "prompt-3",
        "name": "PromptHero",
        "desc": "免费的 AI 绘图提示词搜索与分享平台，主打 Stable Diffusion、MJ 和 DALL-E",
        "icon": "🎨",
        "link": "https://prompthero.com/",
        "platform": "Web",
        "price": "免费"
      }
    ]
  },
  {
    "id": 13,
    "name": "AI内容检测",
    "icon": "🛡️",
    "tools": [
      {
        "id": "detect-1",
        "name": "GPTZero",
        "desc": "业界领先的 AI 文本生成检测工具，准确识别内容是否由大模型代笔编写",
        "icon": "🔍",
        "link": "https://gptzero.me/",
        "platform": "Web",
        "price": "免费/付费"
      },
      {
        "id": "detect-2",
        "name": "Winston AI",
        "desc": "专为教育与创作者设计的 AI 检测平台，支持最新的 GPT-4 与 Claude 生成检测",
        "icon": "🦅",
        "link": "https://gowinston.ai/",
        "platform": "Web",
        "price": "免费/付费"
      },
      {
        "id": "detect-3",
        "name": "CopyLeaks",
        "desc": "强大的原创度剽窃与 AI 文本检测平台，广泛应用于学术论文和商业原创场景",
        "icon": "📝",
        "link": "https://copyleaks.com/",
        "platform": "Web",
        "price": "免费/付费"
      }
    ]
  }
]
