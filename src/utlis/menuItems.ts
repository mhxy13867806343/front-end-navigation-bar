import type { NavigationList } from '@/types/navigation'
import { aiChat } from './menu/ai_chat.ts'
import { aiMedia } from './menu/ai_media.ts'
import { aiCode } from './menu/ai_code.ts'
import { aiOffice } from './menu/ai_office.ts'
import { devIde } from './menu/dev_ide.ts'
import { devFrontend } from './menu/dev_frontend.ts'
import { devBackend } from './menu/dev_backend.ts'
import { mcpTools } from './menu/mcp_tools.ts'
import { localApps } from './menu/local_apps.ts'
import { onlineWorksList, authorWorksList } from './menu/others.ts'

export const menuItemsList: NavigationList = [
  ...aiChat,
  ...aiMedia,
  ...aiCode,
  ...aiOffice,
  ...devIde,
  ...devFrontend,
  ...devBackend,
  ...mcpTools,
  ...localApps
]

export { onlineWorksList, authorWorksList }
