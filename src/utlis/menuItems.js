import { aiChat } from './menu/ai_chat'
import { aiMedia } from './menu/ai_media'
import { aiCode } from './menu/ai_code'
import { aiOffice } from './menu/ai_office'
import { devIde } from './menu/dev_ide'
import { devFrontend } from './menu/dev_frontend'
import { devBackend } from './menu/dev_backend'
import { mcpTools } from './menu/mcp_tools'
import { localApps } from './menu/local_apps'
import { onlineWorksList, authorWorksList } from './menu/others'

export const menuItemsList = [
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
