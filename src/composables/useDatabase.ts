
import { menuItemsList } from '@/utlis/menuItems'
import { requestText } from '@/utils/request'
import type { Ref } from 'vue'
import type { NavigationCategory, ToolItem, ToolSubcategory } from '@/types/navigation'

interface UseDatabaseReturn {
  menuItems: Ref<NavigationCategory[]>
  isHomeLive: Ref<boolean>
  isHomeLoading: Ref<boolean>
  fetchHomeDatabase: () => Promise<void>
}

export function useDatabase(): UseDatabaseReturn {
  const menuItems = ref<NavigationCategory[]>(menuItemsList)
  const isHomeLive = ref<boolean>(false)
  const isHomeLoading = ref<boolean>(false)

  const createLiveTool = (name: string, link: string, icon: string, desc: string): ToolItem => ({
    id: `live-tool-${Math.random().toString(36).slice(2, 11)}`,
    name,
    link,
    icon,
    desc,
    status: 'Free',
    needVPN: false,
    price: '免费',
    region: '国内'
  })

  const parseHomeHtml = (htmlText: string): NavigationCategory[] => {
    const parser: DOMParser = new DOMParser()
    const doc: Document = parser.parseFromString(htmlText, 'text/html')
    
    const sidebarItems = doc.querySelectorAll('.sidebar-menu-inner > ul > li.sidebar-item')
    if (sidebarItems.length === 0) return []
    
    const parsedMenuItems: NavigationCategory[] = []
    
    sidebarItems.forEach((li) => {
      const parentA: HTMLAnchorElement | null = li.querySelector('a')
      if (!parentA) return
      const hrefAttr: string | null = parentA.getAttribute('href')
      if (!hrefAttr || !hrefAttr.startsWith('#term-')) return
      
      const catName: string = parentA.querySelector('span')?.textContent?.trim() || ''
      const catAnchor: string = hrefAttr.replace('#', '')
      
      const subUl: HTMLUListElement | null = li.querySelector('ul')
      const subcategories: ToolSubcategory[] = []
      
      if (subUl) {
        const subLinks: NodeListOf<HTMLAnchorElement> = subUl.querySelectorAll('li a')
        subLinks.forEach((subA: HTMLAnchorElement): void => {
          const subHref: string | null = subA.getAttribute('href')
          if (subHref && subHref.startsWith('#term-')) {
            const subName: string = subA.querySelector('span')?.textContent?.trim() || subA.textContent?.trim() || ''
            const subAnchor: string = subHref.replace('#', '')
            
            const bodyTabLink: HTMLElement | null = doc.getElementById(subAnchor)
            let tabId: string = subAnchor.replace('term-', 'tab-')
            if (bodyTabLink) {
              const hrefVal: string | null = bodyTabLink.getAttribute('href')
              if (hrefVal) tabId = hrefVal.replace('#', '')
            }
            
            const tabPane: HTMLElement | null = doc.getElementById(tabId)
            const tools: ToolItem[] = []
            
            if (tabPane) {
              const cards: NodeListOf<Element> = tabPane.querySelectorAll('.url-card')
              cards.forEach((card: Element): void => {
                const a: HTMLAnchorElement | null = card.querySelector('a')
                if (!a) return
                const nameEl: Element | null = a.querySelector('strong')
                const name: string = nameEl ? nameEl.textContent?.trim() || '' : a.getAttribute('title') || ''
                if (!name) return
                const descEl: Element | null = a.querySelector('p.text-muted')
                const desc: string = descEl ? descEl.textContent?.trim() || '' : ''
                const link: string = a.getAttribute('data-url') || a.getAttribute('href') || ''
                const img: HTMLImageElement | null = a.querySelector('img')
                const icon: string = img ? (img.getAttribute('data-src') || img.getAttribute('src') || '') : ''
                
                tools.push(createLiveTool(name, link, icon, desc))
              })
            }
            
            if (tools.length > 0) {
              subcategories.push({
                id: subAnchor,
                name: subName,
                tools
              })
            }
          }
        })
      }
      
      let tools: ToolItem[] = []
      if (subcategories.length === 0) {
        const headerIcon = doc.getElementById(catAnchor)
        if (headerIcon) {
          const headerEl: HTMLElement | null = headerIcon.parentElement
          let rowEl: Element | null = null
          let nextSibling: Element | null | undefined = headerEl?.nextElementSibling || headerEl?.parentElement?.nextElementSibling
          for (let k: number = 0; k < 5; k++) {
            if (nextSibling) {
              if (nextSibling.classList.contains('row')) {
                rowEl = nextSibling
                break
              }
              const subRow: Element | null = nextSibling.querySelector('.row')
              if (subRow) {
                rowEl = subRow
                break
              }
              nextSibling = nextSibling.nextElementSibling
            }
          }
          
          if (rowEl) {
            const cards: NodeListOf<Element> = rowEl.querySelectorAll('.url-card')
            cards.forEach((card: Element): void => {
              const a: HTMLAnchorElement | null = card.querySelector('a')
              if (!a) return
              const nameEl: Element | null = a.querySelector('strong')
              const name: string = nameEl ? nameEl.textContent?.trim() || '' : a.getAttribute('title') || ''
              if (!name) return
              const descEl: Element | null = a.querySelector('p.text-muted')
              const desc: string = descEl ? descEl.textContent?.trim() || '' : ''
              const link: string = a.getAttribute('data-url') || a.getAttribute('href') || ''
              const img: HTMLImageElement | null = a.querySelector('img')
              const icon: string = img ? (img.getAttribute('data-src') || img.getAttribute('src') || '') : ''
              
              tools.push(createLiveTool(name, link, icon, desc))
            })
          }
        }
      }
      
      if (subcategories.length > 0 || tools.length > 0) {
        parsedMenuItems.push({
          id: catAnchor,
          name: catName,
          icon: '🔗',
          subcategories: subcategories.length > 0 ? subcategories : undefined,
          tools: tools.length > 0 ? tools : undefined
        })
      }
    })
    
    return parsedMenuItems
  }

  const mergeMenuItems = (liveData: NavigationCategory[], staticData: NavigationCategory[]): NavigationCategory[] => {
    const staticToolsMap: Record<string, ToolItem> = {}
    staticData.forEach((cat: NavigationCategory): void => {
      if (cat.tools) {
        cat.tools.forEach((t: ToolItem): void => {
          staticToolsMap[t.name.toLowerCase()] = t
        })
      }
      if (cat.subcategories) {
        cat.subcategories.forEach((sub: ToolSubcategory): void => {
          sub.tools.forEach((t: ToolItem): void => {
            staticToolsMap[t.name.toLowerCase()] = t
          })
        })
      }
    })
    
    const merged: NavigationCategory[] = liveData.map((liveCat: NavigationCategory): NavigationCategory => {
      const staticCat: NavigationCategory | undefined = staticData.find((c: NavigationCategory): boolean => c.name === liveCat.name)
      const catIcon: string = staticCat ? staticCat.icon : '🔗'
      const catId: number | string = staticCat ? staticCat.id : liveCat.id
      
      if (liveCat.subcategories) {
        const mergedSubs: ToolSubcategory[] = liveCat.subcategories.map((liveSub: ToolSubcategory): ToolSubcategory => {
          const mergedTools: ToolItem[] = liveSub.tools.map((liveTool: ToolItem): ToolItem => {
            const staticTool: ToolItem | undefined = staticToolsMap[liveTool.name.toLowerCase()]
            if (staticTool) {
              return {
                ...staticTool,
                link: liveTool.link || staticTool.link,
                desc: liveTool.desc || staticTool.desc
              }
            }
            return liveTool
          })
          return {
            id: liveSub.id,
            name: liveSub.name,
            tools: mergedTools
          }
        })
        
        return {
          id: catId,
          name: liveCat.name,
          icon: catIcon,
          subcategories: mergedSubs
        }
      } else {
        const mergedTools: ToolItem[] = (liveCat.tools || []).map((liveTool: ToolItem): ToolItem => {
          const staticTool: ToolItem | undefined = staticToolsMap[liveTool.name.toLowerCase()]
          if (staticTool) {
            return {
              ...staticTool,
              link: liveTool.link || staticTool.link,
              desc: liveTool.desc || staticTool.desc
            }
          }
          return liveTool
        })
        
        return {
          id: catId,
          name: liveCat.name,
          icon: catIcon,
          tools: mergedTools
        }
      }
    })
    
    const apiToolboxCat: NavigationCategory | undefined = staticData.find((c: NavigationCategory): boolean => c.id === 24)
    if (apiToolboxCat && !merged.some((c: NavigationCategory): boolean => c.id === 24)) {
      merged.push(apiToolboxCat)
    }
    const showcaseCat: NavigationCategory | undefined = staticData.find((c: NavigationCategory): boolean => c.id === 25)
    if (showcaseCat && !merged.some((c: NavigationCategory): boolean => c.id === 25)) {
      merged.push(showcaseCat)
    }
    return merged
  }

  const fetchHomeDatabase = async (): Promise<void> => {
    isHomeLoading.value = true
    const targetUrls: string[] = [
      '/api-home',
      'https://api.codetabs.com/v1/proxy?quest=https://ai-bot.cn/',
      'https://api.allorigins.win/raw?url=https://ai-bot.cn/'
    ]
    let success: boolean = false
    for (const url of targetUrls) {
      try {
        const htmlText: string = await requestText(url, { headers: { 'Accept': 'text/html' } })
        const parsed: NavigationCategory[] = parseHomeHtml(htmlText)
        if (parsed && parsed.length > 0) {
          menuItems.value = mergeMenuItems(parsed, menuItemsList)
          isHomeLive.value = true
          success = true
          break
        }
      } catch (err: unknown) {
        const message: string = err instanceof Error ? err.message : String(err)
        console.warn(`Failed to fetch home database from ${url}:`, message)
      }
    }
    if (!success) {
      menuItems.value = [...menuItemsList]
      isHomeLive.value = false
    }
    isHomeLoading.value = false
  }

  return {
    menuItems,
    isHomeLive,
    isHomeLoading,
    fetchHomeDatabase
  }
}
