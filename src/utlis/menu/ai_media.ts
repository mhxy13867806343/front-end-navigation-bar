import type { NavigationList, WorkList } from '@/types/navigation'

export const aiMedia: NavigationList = [
  {
    "id": 2,
    "name": "AI写作工具",
    "icon": "✍️",
    "tools": [
      {
        "id": "ai-14",
        "name": "Jasper",
        "icon": "✍️",
        "desc": "AI写作助手",
        "status": "Pro",
        "link": "https://www.jasper.ai",
        "needVPN": true,
        "price": "49$/月",
        "region": "国外"
      },
      {
        "id": "ai-15",
        "name": "Copy.ai",
        "icon": "📝",
        "desc": "AI文案生成工具",
        "status": "Pro",
        "link": "https://www.copy.ai",
        "needVPN": true,
        "price": "36$/月",
        "region": "国外"
      },
      {
        "id": "ai-16",
        "name": "Writesonic",
        "icon": "📄",
        "desc": "AI内容创作平台",
        "status": "Pro",
        "link": "https://writesonic.com",
        "needVPN": true,
        "price": "19$/月",
        "region": "国外"
      },
      {
        "id": "ai-20",
        "name": "Grammarly",
        "icon": "✍️",
        "desc": "AI写作改进工具",
        "status": "Pro",
        "link": "https://www.grammarly.com",
        "needVPN": false,
        "price": "30$/月",
        "region": "国外"
      },
      {
        "id": "ai-21",
        "name": "Notion AI",
        "icon": "📝",
        "desc": "AI辅助写作和组织工具",
        "status": "Pro",
        "link": "https://www.notion.so",
        "needVPN": false,
        "price": "10$/月",
        "region": "国外"
      }
    ]
  },
  {
    "id": 3,
    "name": "AI图像工具",
    "icon": "🎨",
    "tools": [
      {
        "id": "ai-6",
        "name": "Midjourney",
        "icon": "🎨",
        "desc": "专业的AI图像生成工具",
        "status": "Pro",
        "link": "https://www.midjourney.com",
        "needVPN": true,
        "price": "30$/月",
        "region": "国外"
      },
      {
        "id": "ai-7",
        "name": "DALL-E 3",
        "icon": "🖼️",
        "desc": "OpenAI的图像生成模型",
        "status": "Pro",
        "link": "https://openai.com/dall-e-3",
        "needVPN": true,
        "price": "按量付费",
        "region": "国外"
      },
      {
        "id": "ai-17",
        "name": "Stable Diffusion",
        "icon": "🎨",
        "desc": "AI图像生成模型",
        "status": "Free",
        "link": "https://stability.ai",
        "needVPN": true,
        "price": "免费",
        "region": "国外"
      },
      {
        "id": "ai-18",
        "name": "Adobe Firefly",
        "icon": "🎨",
        "desc": "Adobe的AI创意套件",
        "status": "Pro",
        "link": "https://www.adobe.com/firefly",
        "needVPN": false,
        "price": "订阅制",
        "region": "国外"
      },
      {
        "id": "ai-26",
        "name": "Canva AI",
        "icon": "🎨",
        "desc": "AI设计助手",
        "status": "Pro",
        "link": "https://www.canva.com",
        "needVPN": false,
        "price": "13$/月",
        "region": "国外"
      },
      {
        "id": "ai-35",
        "name": "Leonardo.ai",
        "icon": "🎨",
        "desc": "AI艺术创作平台",
        "status": "Pro",
        "link": "https://leonardo.ai",
        "needVPN": true,
        "price": "10$/月",
        "region": "国外"
      },
      {
        "id": "ai-40",
        "name": "月之暗面",
        "icon": "🇨🇳",
        "desc": "国内AI绘画平台",
        "status": "Free",
        "link": "https://www.moondark.cn",
        "needVPN": false,
        "price": "免费",
        "region": "国内"
      },
      {
        "id": "ai-75",
        "name": "秒哒",
        "icon": "⚡",
        "desc": "百度推出的无代码AI应用开发平台，一句话做应用",
        "status": "Free",
        "link": "https://www.miaoda.cn",
        "needVPN": false,
        "price": "免费",
        "region": "国内"
      }
    ]
  },
  {
    "id": 4,
    "name": "AI视频工具",
    "icon": "🎥",
    "tools": [
      {
        "id": "ai-11",
        "name": "Runway",
        "icon": "🎥",
        "desc": "AI视频编辑工具",
        "status": "Pro",
        "link": "https://runway.ml",
        "needVPN": true,
        "price": "15$/月",
        "region": "国外"
      },
      {
        "id": "ai-23",
        "name": "Descript",
        "icon": "🎬",
        "desc": "AI视频编辑平台",
        "status": "Pro",
        "link": "https://www.descript.com",
        "needVPN": true,
        "price": "15$/月",
        "region": "国外"
      },
      {
        "id": "ai-24",
        "name": "Synthesia",
        "icon": "🎥",
        "desc": "AI视频生成平台",
        "status": "Pro",
        "link": "https://www.synthesia.io",
        "needVPN": true,
        "price": "30$/月",
        "region": "国外"
      },
      {
        "id": "ai-28",
        "name": "Pictory",
        "icon": "🎬",
        "desc": "AI视频创作平台",
        "status": "Pro",
        "link": "https://pictory.ai",
        "needVPN": true,
        "price": "23$/月",
        "region": "国外"
      },
      {
        "id": "ai-76",
        "name": "LibTV",
        "icon": "📺",
        "desc": "专业级AI视频创作平台，支持Seedance 2.0",
        "status": "Pro",
        "link": "https://libtv.cgref.cn",
        "needVPN": false,
        "price": "付费",
        "region": "国内"
      },
      {
        "id": "ai-77",
        "name": "Sora",
        "icon": "🎥",
        "desc": "OpenAI开发的文本生成视频模型",
        "status": "Pro",
        "link": "https://openai.com/sora",
        "needVPN": true,
        "price": "付费",
        "region": "国外"
      }
    ]
  },
  {
    "id": 5,
    "name": "AI音频工具",
    "icon": "🗣️",
    "tools": [
      {
        "id": "ai-10",
        "name": "Murf AI",
        "icon": "🎤",
        "desc": "AI语音生成工具",
        "status": "Pro",
        "link": "https://murf.ai",
        "needVPN": false,
        "price": "29$/月",
        "region": "国外"
      },
      {
        "id": "ai-29",
        "name": "Elevenlabs",
        "icon": "🗣️",
        "desc": "AI语音克隆和生成",
        "status": "Pro",
        "link": "https://elevenlabs.io",
        "needVPN": true,
        "price": "22$/月",
        "region": "国外"
      },
      {
        "id": "ai-30",
        "name": "Speechify",
        "icon": "🎧",
        "desc": "AI文字转语音工具",
        "status": "Pro",
        "link": "https://speechify.com",
        "needVPN": false,
        "price": "15$/月",
        "region": "国外"
      }
    ]
  }
]
